/** Deterministic, dependency-injected runner for MissionContractV1. */

import {
  EMPTY_MISSION_USAGE,
  addMissionUsage,
  authorizeMissionEffect,
  missionUsageExceedsBudget,
  normalizeMissionContract,
  type MissionContractV1,
  type MissionEffectRequest,
  type MissionMeteredUsage,
  type MissionPolicyDecision,
  type MissionPolicyReason,
  type MissionStopReason,
  type MissionUsage,
} from "./mission.js";

export type MissionRunStatus = "completed" | "stopped" | "paused" | "failed";
export type MissionControl = "continue" | "pause" | "revoke";

export interface MissionStep<TInput = unknown> {
  readonly id: string;
  readonly idempotencyKey: string;
  readonly request: MissionEffectRequest;
  readonly input: TInput;
}

export type MissionPlanDecision<TInput = unknown> =
  | { readonly type: "execute"; readonly step: MissionStep<TInput> }
  | { readonly type: "revise"; readonly reason: string }
  | { readonly type: "stop"; readonly reason: MissionStopReason; readonly summary?: string };

export interface MissionCompletedStep<TOutput = unknown> {
  readonly step: MissionStep;
  readonly output: TOutput;
}

export interface MissionFailedStep {
  readonly step: MissionStep;
  readonly error: string;
}

export type MissionRunEvent =
  | MissionEvent<"mission_started">
  | MissionEvent<"mission_resumed", { previousEndedAt: string }>
  | MissionEvent<"plan_revised", { reason: string }>
  | MissionEvent<"step_started", MissionStepDetail>
  | MissionEvent<"step_succeeded", MissionStepDetail>
  | MissionEvent<"step_failed", MissionStepDetail & { error: string }>
  | MissionEvent<"step_reused", MissionStepDetail>
  | MissionEvent<"policy_denied", MissionStepDetail & { reason: MissionPolicyReason }>
  | MissionEvent<"mission_stopped", { reason: MissionStopReason; summary?: string }>;

interface MissionEvent<TType extends string, TDetail = Record<string, never>> {
  readonly sequence: number;
  readonly at: string;
  readonly type: TType;
  readonly detail: TDetail;
}

interface MissionStepDetail {
  readonly stepId: string;
  readonly idempotencyKey: string;
  readonly effect: MissionEffectRequest["effect"];
  readonly action: string;
  readonly resource?: string;
}

export interface AgentRunBundle<TOutput = unknown> {
  readonly contract: MissionContractV1;
  readonly status: MissionRunStatus;
  readonly stopReason: MissionStopReason;
  readonly summary?: string;
  readonly startedAt: string;
  readonly endedAt: string;
  readonly usage: MissionUsage;
  readonly grantUses: Readonly<Record<string, number>>;
  readonly events: readonly MissionRunEvent[];
  readonly completed: readonly MissionCompletedStep<TOutput>[];
  readonly failures: readonly MissionFailedStep[];
}

export interface MissionPlannerContext<TOutput = unknown> {
  readonly contract: MissionContractV1;
  readonly usage: MissionUsage;
  readonly events: readonly MissionRunEvent[];
  readonly completed: readonly MissionCompletedStep<TOutput>[];
  readonly failures: readonly MissionFailedStep[];
}

export interface MissionExecutorContext {
  /** Meter before an external effect. Throws before the effect if its budget is exhausted. */
  meter(increment: Partial<MissionMeteredUsage>): void;
}

export interface MissionRunnerOptions<TInput = unknown, TOutput = unknown> {
  readonly contract: MissionContractV1;
  readonly planner: (context: MissionPlannerContext<TOutput>) => MissionPlanDecision<TInput> | Promise<MissionPlanDecision<TInput>>;
  readonly executor: (step: MissionStep<TInput>, context: MissionExecutorContext) => TOutput | Promise<TOutput>;
  readonly now?: () => Date;
  /** Continue a paused bundle without discarding its trace, usage, or grant counts. */
  readonly resumeFrom?: AgentRunBundle<TOutput>;
  /** Polled between planner/executor turns. Pause and revoke never interrupt an in-flight effect. */
  readonly control?: () => MissionControl;
}

class MissionBudgetExceededError extends Error {
  constructor() {
    super("Mission budget exhausted");
    this.name = "MissionBudgetExceededError";
  }
}

class MissionTraceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissionTraceError";
  }
}

const stepDetail = (step: MissionStep): MissionStepDetail => ({
  stepId: step.id,
  idempotencyKey: step.idempotencyKey,
  effect: step.request.effect,
  action: step.request.action,
  resource: step.request.resource,
});

const stepSignature = (step: MissionStep): string => JSON.stringify({
  effect: step.request.effect,
  action: step.request.action,
  resource: step.request.resource ?? null,
  input: step.input,
});

const safeError = (error: unknown): string => error instanceof Error ? error.message : String(error);

/** Detach trace state from planner/executor-owned objects and require JSON-safe data. */
const snapshotForTrace = <T>(value: T): T => {
  if (value === undefined) {
    throw new MissionTraceError("Mission trace values must be JSON-serializable: undefined has no JSON representation");
  }
  let parsed: T;
  try {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw new Error("value has no JSON representation");
    parsed = JSON.parse(serialized) as T;
  } catch (error) {
    throw new MissionTraceError(`Mission trace values must be JSON-serializable: ${safeError(error)}`);
  }
  const freeze = (item: unknown): void => {
    if (!item || typeof item !== "object" || Object.isFrozen(item)) return;
    for (const child of Object.values(item as Record<string, unknown>)) freeze(child);
    Object.freeze(item);
  };
  freeze(parsed);
  return parsed;
};

export async function runMission<TInput = unknown, TOutput = unknown>(
  options: MissionRunnerOptions<TInput, TOutput>,
): Promise<AgentRunBundle<TOutput>> {
  const contract = normalizeMissionContract(options.contract);
  const now = options.now ?? (() => new Date());
  const sessionStarted = now();
  const resume = options.resumeFrom;
  if (resume && resume.status !== "paused") throw new Error("Only a paused AgentRunBundle can be resumed");
  if (resume && JSON.stringify(resume.contract) !== JSON.stringify(contract)) {
    throw new Error("Resume contract must match the paused AgentRunBundle contract");
  }
  const started = resume ? new Date(resume.startedAt) : sessionStarted;
  const priorWallMs = resume?.usage.wallMs ?? 0;
  let usage: MissionUsage = resume ? { ...resume.usage } : { ...EMPTY_MISSION_USAGE };
  const grantUses: Record<string, number> = resume ? { ...resume.grantUses } : {};
  const events: MissionRunEvent[] = resume ? [...resume.events] : [];
  const completed: MissionCompletedStep<TOutput>[] = resume ? [...resume.completed] : [];
  const failures: MissionFailedStep[] = resume ? [...resume.failures] : [];
  const successfulByKey = new Map<string, string>();
  for (const item of completed) {
    successfulByKey.set(item.step.idempotencyKey, stepSignature(item.step));
  }

  const readNow = (): Date => {
    const current = now();
    usage = { ...usage, wallMs: priorWallMs + Math.max(0, current.getTime() - sessionStarted.getTime()) };
    return current;
  };

  const appendAt = <TType extends MissionRunEvent["type"]>(
    at: Date,
    type: TType,
    detail: Extract<MissionRunEvent, { type: TType }>["detail"],
  ): void => {
    events.push(Object.freeze({
      sequence: events.length,
      at: at.toISOString(),
      type,
      detail: Object.freeze(detail),
    }) as unknown as MissionRunEvent);
  };

  if (resume) appendAt(sessionStarted, "mission_resumed", { previousEndedAt: resume.endedAt });
  else appendAt(started, "mission_started", {});

  const finish = (reason: MissionStopReason, summary?: string): AgentRunBundle<TOutput> => {
    const ended = readNow();
    appendAt(ended, "mission_stopped", { reason, summary });
    const status: MissionRunStatus = reason === "completed" || reason === "goal_reached"
      ? "completed"
      : reason === "paused"
        ? "paused"
        : reason === "failed" || reason === "repeated_failure"
          ? "failed"
          : "stopped";
    return Object.freeze({
      contract,
      status,
      stopReason: reason,
      summary,
      startedAt: started.toISOString(),
      endedAt: ended.toISOString(),
      usage: Object.freeze({ ...usage }),
      grantUses: Object.freeze({ ...grantUses }),
      events: Object.freeze([...events]),
      completed: Object.freeze([...completed]),
      failures: Object.freeze([...failures]),
    });
  };

  while (true) {
    const turnNow = readNow();
    if (turnNow.getTime() >= Date.parse(contract.expiresAt)) return finish("expired");
    if (usage.wallMs >= contract.budgets.maxWallMs || usage.steps >= contract.budgets.maxSteps) {
      return finish("budget_exhausted");
    }
    const control = options.control?.() ?? "continue";
    if (control === "pause") return finish("paused");
    if (control === "revoke") return finish("revoked");

    let decision: MissionPlanDecision<TInput>;
    try {
      decision = await options.planner({
        contract,
        usage: Object.freeze({ ...usage }),
        events: Object.freeze([...events]),
        completed: Object.freeze([...completed]),
        failures: Object.freeze([...failures]),
      });
    } catch (error) {
      return finish("failed", `planner: ${safeError(error)}`);
    }

    // Planning may be asynchronous. Re-poll at the last safe boundary so a
    // pause or revocation issued while the planner was running prevents the
    // next effect from starting.
    const postPlanControl = options.control?.() ?? "continue";
    if (postPlanControl === "pause") return finish("paused");
    if (postPlanControl === "revoke") return finish("revoked");

    if (decision.type === "stop") return finish(decision.reason, decision.summary);
    if (decision.type === "revise") {
      usage = addMissionUsage(usage, { steps: 1 });
      appendAt(readNow(), "plan_revised", { reason: decision.reason });
      continue;
    }

    let step: MissionStep<TInput>;
    try {
      step = snapshotForTrace(decision.step);
    } catch (error) {
      return finish("failed", `step trace: ${safeError(error)}`);
    }
    if (!step.id.trim() || !step.idempotencyKey.trim()) {
      return finish("failed", "step id and idempotencyKey are required");
    }

    const prior = successfulByKey.get(step.idempotencyKey);
    if (prior) {
      if (prior !== stepSignature(step)) return finish("failed", "idempotency key reused with different step content");
      usage = addMissionUsage(usage, { steps: 1 });
      appendAt(readNow(), "step_reused", stepDetail(step));
      continue;
    }

    const request: MissionEffectRequest = {
      ...step.request,
      estimatedUsage: {
        ...step.request.estimatedUsage,
        steps: (step.request.estimatedUsage?.steps ?? 0) + 1,
        attempts: (step.request.estimatedUsage?.attempts ?? 0) + 1,
      },
    };
    const executionNow = readNow();
    if (executionNow.getTime() >= Date.parse(contract.expiresAt)) return finish("expired");
    if (usage.wallMs >= contract.budgets.maxWallMs) return finish("budget_exhausted");
    let policy: MissionPolicyDecision;
    try {
      policy = authorizeMissionEffect(contract, request, { usage, grantUses }, executionNow);
    } catch (error) {
      return finish("failed", `policy: ${safeError(error)}`);
    }
    if (!policy.allowed) {
      appendAt(readNow(), "policy_denied", { ...stepDetail(step), reason: policy.reason });
      return finish(policy.reason === "budget_exhausted" ? "budget_exhausted" : "policy_denied");
    }

    usage = addMissionUsage(usage, { steps: 1, attempts: 1 });
    if (policy.grantId) grantUses[policy.grantId] = (grantUses[policy.grantId] ?? 0) + 1;
    appendAt(readNow(), "step_started", stepDetail(step));

    const meter = (increment: Partial<MissionMeteredUsage>): void => {
      const next = addMissionUsage(usage, increment);
      if (missionUsageExceedsBudget(next, contract.budgets)) throw new MissionBudgetExceededError();
      usage = next;
    };

    try {
      const output = snapshotForTrace(await options.executor(step, { meter }));
      const item: MissionCompletedStep<TOutput> = Object.freeze({ step, output });
      completed.push(item);
      successfulByKey.set(step.idempotencyKey, stepSignature(step));
      appendAt(readNow(), "step_succeeded", stepDetail(step));
    } catch (error) {
      const failure: MissionFailedStep = Object.freeze({ step, error: safeError(error) });
      failures.push(failure);
      appendAt(readNow(), "step_failed", { ...stepDetail(step), error: failure.error });
      if (error instanceof MissionBudgetExceededError) return finish("budget_exhausted");
      // The external effect may already have completed. Never retry when its
      // output cannot be recorded because that could duplicate the effect.
      if (error instanceof MissionTraceError) return finish("failed", failure.error);
      // E2/E3 cross a shared or production-write boundary. A thrown error does
      // not prove that the destination rejected the write, so an automatic
      // replay could duplicate it even though the trace has an idempotency key.
      if (step.request.effect === "E2" || step.request.effect === "E3") {
        return finish("failed", "shared effect outcome is uncertain; automatic retry denied");
      }
      if (usage.attempts >= contract.budgets.maxAttempts) return finish("repeated_failure");
    }
  }
}

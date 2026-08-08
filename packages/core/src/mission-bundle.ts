/** Runtime parser and invariant checks for persisted AgentRunBundle values. */

import { z } from "zod";
import {
  MISSION_EFFECTS,
  MISSION_STOP_REASONS,
  missionUsageExceedsBudget,
  normalizeMissionContract,
  type MissionStopReason,
} from "./mission.js";
import type { AgentRunBundle, MissionRunStatus } from "./mission-runner.js";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() => z.union([
  z.null(),
  z.boolean(),
  z.number().finite(),
  z.string(),
  z.array(JsonValueSchema),
  z.record(JsonValueSchema),
]));

const IsoTimestampSchema = z.string().refine(
  (value) => Number.isFinite(Date.parse(value)),
  "must be an ISO-compatible timestamp",
);
const NonNegativeInteger = z.number().int().nonnegative().safe();

const MissionUsageSchema = z.object({
  steps: NonNegativeInteger,
  attempts: NonNegativeInteger,
  wallMs: NonNegativeInteger,
  writes: NonNegativeInteger,
  networkRequests: NonNegativeInteger,
  modelRuns: NonNegativeInteger,
  storageBytes: NonNegativeInteger,
  costMicros: NonNegativeInteger,
}).strict();

const EstimatedUsageSchema = MissionUsageSchema.partial().strict();
const MissionStepSchema = z.object({
  id: z.string().trim().min(1),
  idempotencyKey: z.string().trim().min(1),
  request: z.object({
    effect: z.enum(MISSION_EFFECTS),
    action: z.string().trim().min(1),
    resource: z.string().optional(),
    estimatedUsage: EstimatedUsageSchema.optional(),
  }).strict(),
  input: JsonValueSchema,
}).strict();

const MissionEventSchema = z.object({
  sequence: NonNegativeInteger,
  at: IsoTimestampSchema,
  type: z.enum([
    "mission_started",
    "mission_resumed",
    "plan_revised",
    "step_started",
    "step_succeeded",
    "step_failed",
    "step_reused",
    "policy_denied",
    "mission_stopped",
  ]),
  detail: z.record(JsonValueSchema),
}).strict();

const AgentRunBundleSchema = z.object({
  contract: z.unknown(),
  status: z.enum(["completed", "stopped", "paused", "failed"]),
  stopReason: z.enum(MISSION_STOP_REASONS),
  summary: z.string().optional(),
  startedAt: IsoTimestampSchema,
  endedAt: IsoTimestampSchema,
  usage: MissionUsageSchema,
  grantUses: z.record(NonNegativeInteger),
  events: z.array(MissionEventSchema).min(2),
  completed: z.array(z.object({
    step: MissionStepSchema,
    output: JsonValueSchema,
  }).strict()),
  failures: z.array(z.object({
    step: MissionStepSchema,
    error: z.string(),
  }).strict()),
}).strict();

export class AgentRunBundleError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid AgentRunBundle: ${issues.join("; ")}`);
    this.name = "AgentRunBundleError";
    this.issues = issues;
  }
}

const expectedStatus = (reason: MissionStopReason): MissionRunStatus =>
  reason === "completed" || reason === "goal_reached"
    ? "completed"
    : reason === "paused"
      ? "paused"
      : reason === "failed" || reason === "repeated_failure"
        ? "failed"
        : "stopped";

const deepFreeze = <T>(value: T): T => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  return Object.freeze(value);
};

/**
 * Parse a JSON-originated bundle before it can become resume authority.
 * Content authentication remains the persistence envelope's responsibility.
 */
export function parseAgentRunBundle<TOutput = JsonValue>(value: unknown): AgentRunBundle<TOutput> {
  const parsed = AgentRunBundleSchema.safeParse(value);
  if (!parsed.success) {
    throw new AgentRunBundleError(parsed.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "bundle";
      return `${path}: ${issue.message}`;
    }));
  }

  const issues: string[] = [];
  let contract;
  try {
    contract = normalizeMissionContract(parsed.data.contract);
  } catch (error) {
    issues.push(error instanceof Error ? error.message : String(error));
  }
  if (!contract) throw new AgentRunBundleError(issues);

  if (Date.parse(parsed.data.endedAt) < Date.parse(parsed.data.startedAt)) {
    issues.push("endedAt must not precede startedAt");
  }
  if (expectedStatus(parsed.data.stopReason) !== parsed.data.status) {
    issues.push(`status ${parsed.data.status} does not match stop reason ${parsed.data.stopReason}`);
  }
  if (missionUsageExceedsBudget(parsed.data.usage, contract.budgets)) {
    issues.push("usage exceeds the mission budget");
  }
  if (parsed.data.usage.attempts !== parsed.data.completed.length + parsed.data.failures.length) {
    issues.push("attempt count must equal completed plus failed effects");
  }
  if (parsed.data.usage.steps < parsed.data.usage.attempts) {
    issues.push("step count must be at least the attempt count");
  }

  const grants = new Map(contract.grants.map((grant) => [grant.id, grant.maxUses]));
  for (const [grantId, uses] of Object.entries(parsed.data.grantUses)) {
    const maxUses = grants.get(grantId);
    if (maxUses === undefined) issues.push(`grantUses contains unknown grant ${grantId}`);
    else if (uses > maxUses) issues.push(`grantUses exceeds ${grantId} maxUses`);
  }

  const successfulKeys = new Set<string>();
  for (const item of parsed.data.completed) {
    if (successfulKeys.has(item.step.idempotencyKey)) {
      issues.push(`duplicate completed idempotency key ${item.step.idempotencyKey}`);
    }
    successfulKeys.add(item.step.idempotencyKey);
  }

  for (const [index, event] of parsed.data.events.entries()) {
    if (event.sequence !== index) issues.push(`event ${index} has non-contiguous sequence ${event.sequence}`);
    if (index > 0 && Date.parse(event.at) < Date.parse(parsed.data.events[index - 1]!.at)) {
      issues.push(`event ${index} timestamp precedes the prior event`);
    }
  }
  if (parsed.data.events[0]?.type !== "mission_started") issues.push("first event must be mission_started");
  const lastEvent = parsed.data.events.at(-1)!;
  if (lastEvent.type !== "mission_stopped") issues.push("last event must be mission_stopped");
  else if (lastEvent.detail.reason !== parsed.data.stopReason) {
    issues.push("last mission_stopped reason must match stopReason");
  }
  if (parsed.data.events[0]?.at !== parsed.data.startedAt) issues.push("startedAt must match the first event");
  if (lastEvent.at !== parsed.data.endedAt) issues.push("endedAt must match the last event");

  if (issues.length > 0) throw new AgentRunBundleError(issues);

  return deepFreeze({
    ...parsed.data,
    contract,
  } as unknown as AgentRunBundle<TOutput>);
}

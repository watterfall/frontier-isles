/** MissionContract compatibility adapter for the existing night scout. */

import {
  normalizeMissionContract,
  type MissionBudgets,
  type MissionContractV1,
} from "@frontier-isles/core/mission";
import {
  runMission,
  type AgentRunBundle,
  type MissionControl,
} from "@frontier-isles/core/mission-runner";
import { canonicalStringify } from "@frontier-isles/opp";
import { runNightShift, type NightDeps, type NightOptions, type NightResult } from "./night.js";
import type { ScoutWriter } from "./mcpClient.js";
import {
  MissionRecoveryRequiredError,
  createMissionRunRecord,
  hashMissionRequest,
  loadMissionRunRecord,
  saveMissionRunRecord,
  withMissionRunLock,
} from "./mission-store.js";

export interface ScoutMissionContractOptions {
  readonly missionId?: string;
  readonly ownerId?: string;
  readonly createdAt?: Date;
  readonly expiresAt?: Date;
  readonly budgets?: Partial<MissionBudgets>;
}

export interface ScoutMissionRunOptions {
  readonly contract?: MissionContractV1;
  readonly now?: () => Date;
  readonly control?: () => MissionControl;
  readonly resumeFrom?: AgentRunBundle<NightResult>;
}

export interface PersistedScoutMissionRunOptions extends ScoutMissionRunOptions {
  readonly stateFile: string;
}

const isoPlus = (date: Date, milliseconds: number): string =>
  new Date(date.getTime() + milliseconds).toISOString();

/**
 * Build the narrow A3 contract that describes the scout's current resident
 * loop. This grant authorizes the mission runner to attempt the effect; it does
 * not add capabilities to the MCP identity. The existing gateway remains the
 * final write/degradation boundary.
 */
export function createScoutMissionContract(
  options: NightOptions,
  mission: ScoutMissionContractOptions = {},
): MissionContractV1 {
  const created = mission.createdAt ?? new Date();
  const expires = mission.expiresAt?.toISOString() ?? isoPlus(created, 15 * 60_000);
  const resource = `island:${options.island}`;
  const defaults: MissionBudgets = {
    maxSteps: 2,
    maxAttempts: 1,
    maxWallMs: 120_000,
    maxWrites: options.dryRun ? 0 : options.topK + 1,
    maxNetworkRequests: Math.max(16, options.topK + 8),
    maxModelRuns: 0,
    maxStorageBytes: 0,
    maxCostMicros: 0,
  };
  const action = options.dryRun ? "scout.night-shift.inspect" : "scout.night-shift.propose";

  return normalizeMissionContract({
    version: 1,
    id: mission.missionId ?? `mission:night-scout:${options.island}:${created.toISOString()}`,
    agentId: options.agent ?? "github:curiosity-scout",
    ownerId: mission.ownerId ?? "system:night-scheduler",
    objective: `Inspect recent literature for ${options.island} and retain only bounded, traceable candidates`,
    autonomyLevel: "A3",
    scope: { resourcePrefixes: [resource], islands: [options.island] },
    grants: options.dryRun ? [] : [{
      id: `grant:night-scout-propose:${options.island}`,
      effect: "E2",
      actions: [action],
      resourcePrefixes: [resource],
      maxUses: 1,
      expiresAt: expires,
    }],
    budgets: { ...defaults, ...mission.budgets },
    stopConditions: [
      "completed",
      "budget_exhausted",
      "expired",
      "paused",
      "revoked",
      "policy_denied",
      "repeated_failure",
      "failed",
    ],
    createdAt: created.toISOString(),
    expiresAt: expires,
  });
}

/**
 * Run the unchanged scout IO shell inside a metered mission step.
 * Metering happens before network/write calls, so a budget denial prevents the
 * next external effect rather than merely reporting the overrun afterward.
 */
export async function runNightShiftMission(
  options: NightOptions,
  deps: NightDeps,
  mission: ScoutMissionRunOptions = {},
): Promise<AgentRunBundle<NightResult>> {
  const now = mission.now ?? (() => new Date());
  const contract = mission.contract ?? createScoutMissionContract(options, { createdAt: now() });
  const action = options.dryRun ? "scout.night-shift.inspect" : "scout.night-shift.propose";

  return runMission({
    contract,
    now,
    control: mission.control,
    resumeFrom: mission.resumeFrom,
    planner: ({ completed, failures }) => {
      if (completed.length > 0) return { type: "stop", reason: "completed", summary: "night shift complete" };
      if (failures.length > 0) return { type: "stop", reason: "failed", summary: failures.at(-1)?.error };
      return {
        type: "execute",
        step: {
          id: `night-shift:${options.island}`,
          idempotencyKey: `${contract.id}:night-shift:v1`,
          request: {
            effect: options.dryRun ? "E1" : "E2",
            action,
            resource: `island:${options.island}`,
            estimatedUsage: {
              // problem.md + ledger.jsonl + CrossRef; resolved prior refs add
              // further calls that remain guarded by live metering.
              networkRequests: 3,
              writes: options.dryRun ? 0 : options.topK + 1,
            },
          },
          input: { ...options },
        },
      };
    },
    executor: async (_step, { meter }) => {
      const meteredDeps: NightDeps = {
        ...deps,
        fetchText: async (url) => {
          meter({ networkRequests: 1 });
          return deps.fetchText(url);
        },
        fetchWorks: async (...args) => {
          meter({ networkRequests: 1 });
          return deps.fetchWorks(...args);
        },
        makeWriter: deps.makeWriter
          ? async () => meterWriter(await deps.makeWriter!(), meter)
          : undefined,
      };
      return runNightShift(options, meteredDeps);
    },
  });
}

/**
 * Run or resume one scout mission under a durable two-state record.
 * A surviving `running` record is intentionally never replayed automatically:
 * the prior process may have completed an external effect without tracing it.
 */
export async function runNightShiftMissionPersisted(
  options: NightOptions,
  deps: NightDeps,
  mission: PersistedScoutMissionRunOptions,
): Promise<AgentRunBundle<NightResult>> {
  return withMissionRunLock(mission.stateFile, async (attemptId) => {
    const now = mission.now ?? (() => new Date());
    const requestHash = hashMissionRequest({ kind: "night-scout/v1", options });
    const existing = await loadMissionRunRecord<NightResult>(mission.stateFile);

    if (existing && existing.requestHash !== requestHash) {
      throw new MissionRecoveryRequiredError("Mission state belongs to different scout options");
    }
    if (existing?.state === "running") {
      throw new MissionRecoveryRequiredError(
        "Mission state is still running; reconcile possible in-flight effects before retrying",
      );
    }
    if (existing && mission.contract && canonicalStringify(existing.contract) !== canonicalStringify(normalizeMissionContract(mission.contract))) {
      throw new MissionRecoveryRequiredError("Supplied mission contract does not match persisted authority");
    }
    if (existing?.bundle && existing.bundle.status !== "paused") return existing.bundle;

    const contract = existing?.contract
      ?? mission.contract
      ?? createScoutMissionContract(options, { createdAt: now() });
    const paused = existing?.bundle;
    await saveMissionRunRecord(mission.stateFile, createMissionRunRecord({
      state: "running",
      requestHash,
      attemptId,
      updatedAt: now().toISOString(),
      contract,
      bundle: paused,
    }));

    const bundle = await runNightShiftMission(options, {
      ...deps,
      // Persisted missions keep one scientific date window across restarts.
      now: new Date(contract.createdAt),
    }, {
      ...mission,
      contract,
      now,
      resumeFrom: paused,
    });
    await saveMissionRunRecord(mission.stateFile, createMissionRunRecord({
      state: "settled",
      requestHash,
      attemptId,
      updatedAt: now().toISOString(),
      contract,
      bundle,
    }));
    return bundle;
  });
}

function meterWriter(
  writer: ScoutWriter,
  meter: (increment: { writes?: number }) => void,
): ScoutWriter {
  return {
    readQfocus: () => writer.readQfocus(),
    async createDriftwood(atom, text, credit) {
      meter({ writes: 1 });
      return writer.createDriftwood(atom, text, credit);
    },
    async nightDigest(text, credit, dest) {
      meter({ writes: 1 });
      return writer.nightDigest(text, credit, dest);
    },
    close: () => writer.close(),
  };
}

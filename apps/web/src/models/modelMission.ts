/** A2 deterministic plan/run/evaluate/revise proof for the Model Lab. */

import {
  normalizeMissionContract,
  type MissionBudgets,
  type MissionContractV1,
} from '@frontier-isles/core/mission';
import {
  runMission,
  type AgentRunBundle,
  type MissionControl,
} from '@frontier-isles/core/mission-runner';
import {
  MODEL_RUNTIME_VERSION,
  modelPredictionMatches,
} from './runtime';
import {
  compileModelSpec,
  normalizeModelSpec,
  type SynchronizationModelSpecV1,
} from './modelSpec';
import type { ModelPrediction, ModelRunObservation } from './types';

export const MODEL_LAB_MISSION_VERSION = 1 as const;
export const MODEL_LAB_MAX_RUNS = 12;
export const MODEL_LAB_MAX_WALL_MS = 30_000;

type SynchronizationSubstrateId = SynchronizationModelSpecV1['substrateId'];

export interface SynchronizationModelLabObjectiveV1 {
  readonly version: typeof MODEL_LAB_MISSION_VERSION;
  readonly id: string;
  readonly substrateId: SynchronizationSubstrateId;
  readonly seed: number;
  readonly count: number;
  readonly spread: number;
  readonly dt: number;
  readonly steps: number;
  readonly prediction: Extract<ModelPrediction, 'increase'>;
  readonly targetFinal: number;
  readonly couplingCandidates: readonly number[];
}

export interface ModelLabTrialV1 {
  readonly version: 1;
  readonly trial: number;
  readonly spec: SynchronizationModelSpecV1;
  readonly runtimeVersion: typeof MODEL_RUNTIME_VERSION;
  readonly prediction: ModelPrediction;
  readonly observation: ModelRunObservation;
  readonly predictionMatched: boolean;
  readonly targetReached: boolean;
  readonly epistemicStatus: 'model_observation';
  readonly ledgerEffect: 'none';
}

export interface ModelLabMissionReceiptV1 {
  readonly version: 1;
  readonly kind: 'model-lab-mission';
  readonly missionId: string;
  readonly objectiveId: string;
  readonly status: AgentRunBundle['status'];
  readonly stopReason: AgentRunBundle['stopReason'];
  readonly startedAt: string;
  readonly endedAt: string;
  readonly trials: readonly ModelLabTrialV1[];
  readonly revisions: number;
  readonly failedPredictions: number;
  readonly usage: AgentRunBundle['usage'];
  readonly epistemicStatus: 'model_observation';
  readonly ledgerEffect: 'none';
}

export interface ModelLabMissionOptions {
  readonly now?: () => Date;
  readonly control?: () => MissionControl;
  readonly budgets?: Partial<MissionBudgets>;
}

export class ModelLabObjectiveError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid Model Lab objective: ${issues.join('; ')}`);
    this.name = 'ModelLabObjectiveError';
    this.issues = issues;
  }
}

const SYNC_SUBSTRATES = new Set<SynchronizationSubstrateId>([
  'fireflies',
  'heart-cells',
  'applause',
  'power-grid',
]);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const safeInteger = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value);

const lastEventSequence = (
  events: readonly { readonly type: string; readonly sequence: number }[],
  type: string,
): number => {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    if (events[index]?.type === type) return events[index]!.sequence;
  }
  return -1;
};

export function normalizeModelLabObjective(value: unknown): SynchronizationModelLabObjectiveV1 {
  if (!isRecord(value)) throw new ModelLabObjectiveError(['objective must be an object']);
  const issues: string[] = [];
  if (value.version !== MODEL_LAB_MISSION_VERSION) issues.push('version must be 1');
  if (typeof value.id !== 'string' || !/^[a-z0-9][a-z0-9:_-]{0,127}$/i.test(value.id)) {
    issues.push('id must be a bounded resource-safe identifier');
  }
  if (typeof value.substrateId !== 'string' || !SYNC_SUBSTRATES.has(value.substrateId as SynchronizationSubstrateId)) {
    issues.push('substrateId must belong to synchronization');
  }
  if (!safeInteger(value.seed)) issues.push('seed must be a safe integer');
  if (!safeInteger(value.count) || value.count < 2 || value.count > 120) issues.push('count must be 2..120');
  if (!finite(value.spread) || value.spread < 0 || value.spread > 1.2) issues.push('spread must be 0..1.2');
  if (!finite(value.dt) || value.dt < 0.001 || value.dt > 0.2) issues.push('dt must be 0.001..0.2');
  if (!safeInteger(value.steps) || value.steps < 1 || value.steps > 5_000) issues.push('steps must be 1..5000');
  if (value.prediction !== 'increase') issues.push('the synchronization proof prediction must be increase');
  if (!finite(value.targetFinal) || value.targetFinal < 0 || value.targetFinal > 1) issues.push('targetFinal must be 0..1');
  const candidates = Array.isArray(value.couplingCandidates) ? value.couplingCandidates : null;
  if (!candidates
    || candidates.length < 3
    || candidates.length > MODEL_LAB_MAX_RUNS) {
    issues.push(`couplingCandidates must contain 3..${MODEL_LAB_MAX_RUNS} values`);
  } else {
    candidates.forEach((candidate, index) => {
      if (!finite(candidate) || candidate < 0 || candidate > 6) issues.push(`coupling candidate ${index} must be 0..6`);
      if (index > 0 && finite(candidate) && candidate <= (candidates[index - 1] as number)) {
        issues.push('couplingCandidates must be strictly increasing');
      }
    });
  }
  if (issues.length > 0) throw new ModelLabObjectiveError(issues);
  return Object.freeze({
    version: MODEL_LAB_MISSION_VERSION,
    id: value.id as string,
    substrateId: value.substrateId as SynchronizationSubstrateId,
    seed: value.seed as number,
    count: value.count as number,
    spread: value.spread as number,
    dt: value.dt as number,
    steps: value.steps as number,
    prediction: 'increase',
    targetFinal: value.targetFinal as number,
    couplingCandidates: Object.freeze([...(candidates as number[])]),
  });
}

const boundedBudget = (requested: number | undefined, ceiling: number): number =>
  Math.max(0, Math.min(ceiling, requested ?? ceiling));

export function createModelLabMissionContract(
  value: SynchronizationModelLabObjectiveV1,
  options: { now?: Date; budgets?: Partial<MissionBudgets> } = {},
): MissionContractV1 {
  const objective = normalizeModelLabObjective(value);
  const created = options.now ?? new Date();
  const runCeiling = Math.min(MODEL_LAB_MAX_RUNS, objective.couplingCandidates.length);
  const stepCeiling = runCeiling * 2;
  const defaults: MissionBudgets = {
    maxSteps: stepCeiling,
    maxAttempts: runCeiling,
    maxWallMs: MODEL_LAB_MAX_WALL_MS,
    maxWrites: 0,
    maxNetworkRequests: 0,
    maxModelRuns: runCeiling,
    maxStorageBytes: 0,
    maxCostMicros: 0,
  };
  const requested = { ...defaults, ...options.budgets };
  const budgets: MissionBudgets = {
    maxSteps: Math.max(1, boundedBudget(requested.maxSteps, stepCeiling)),
    maxAttempts: Math.max(1, boundedBudget(requested.maxAttempts, runCeiling)),
    maxWallMs: Math.max(1, boundedBudget(requested.maxWallMs, MODEL_LAB_MAX_WALL_MS)),
    maxWrites: 0,
    maxNetworkRequests: 0,
    maxModelRuns: boundedBudget(requested.maxModelRuns, runCeiling),
    maxStorageBytes: 0,
    maxCostMicros: 0,
  };
  return normalizeMissionContract({
    version: 1,
    id: `mission:model-lab:${objective.id}:${created.toISOString()}`,
    agentId: 'system:model-lab-investigator',
    ownerId: 'local:learner',
    objective: `Find the first bounded coupling candidate that reaches coherence ${objective.targetFinal}`,
    autonomyLevel: 'A2',
    scope: { resourcePrefixes: [`model-lab:${objective.id}`] },
    grants: [],
    budgets,
    stopConditions: [
      'goal_reached',
      'plateau',
      'budget_exhausted',
      'paused',
      'revoked',
      'policy_denied',
      'repeated_failure',
      'failed',
    ],
    createdAt: created.toISOString(),
    expiresAt: new Date(created.getTime() + MODEL_LAB_MAX_WALL_MS).toISOString(),
  });
}

const specFor = (
  objective: SynchronizationModelLabObjectiveV1,
  trial: number,
): SynchronizationModelSpecV1 => normalizeModelSpec({
  version: 1,
  id: `spec:${objective.id}:trial-${trial + 1}`,
  familyId: 'synchronization',
  substrateId: objective.substrateId,
  seed: objective.seed,
  steps: objective.steps,
  parameters: {
    count: objective.count,
    spread: objective.spread,
    coupling: objective.couplingCandidates[trial],
    dt: objective.dt,
  },
}) as SynchronizationModelSpecV1;

export async function runModelLabMission(
  value: SynchronizationModelLabObjectiveV1,
  options: ModelLabMissionOptions = {},
): Promise<AgentRunBundle<ModelLabTrialV1>> {
  const objective = normalizeModelLabObjective(value);
  const now = options.now ?? (() => new Date());
  const contract = createModelLabMissionContract(objective, { now: now(), budgets: options.budgets });

  return runMission({
    contract,
    now,
    control: options.control,
    planner: ({ completed, failures, events }) => {
      if (failures.length > 0) {
        return { type: 'stop', reason: 'failed', summary: failures.at(-1)?.error };
      }
      const latest = completed.at(-1)?.output;
      if (latest?.targetReached) {
        return { type: 'stop', reason: 'goal_reached', summary: `target reached at coupling ${latest.spec.parameters.coupling}` };
      }
      if (completed.length >= objective.couplingCandidates.length) {
        return { type: 'stop', reason: 'plateau', summary: 'all declared coupling candidates exhausted' };
      }

      const lastSuccess = lastEventSequence(events, 'step_succeeded');
      const lastRevision = lastEventSequence(events, 'plan_revised');
      if (completed.length > 0 && lastSuccess > lastRevision) {
        const next = objective.couplingCandidates[completed.length]!;
        return {
          type: 'revise',
          reason: `prediction/target not met: final=${latest!.observation.final.toFixed(6)}; raise coupling to ${next}`,
        };
      }

      const trial = completed.length;
      const spec = specFor(objective, trial);
      return {
        type: 'execute',
        step: {
          id: `model-lab:${objective.id}:trial-${trial + 1}`,
          idempotencyKey: `${contract.id}:${spec.id}:${MODEL_RUNTIME_VERSION}`,
          request: {
            effect: 'E1',
            action: 'model.run',
            resource: `model-lab:${objective.id}/trial/${trial + 1}`,
            estimatedUsage: { modelRuns: 1 },
          },
          input: spec,
        },
      };
    },
    executor: async (step, { meter }) => {
      meter({ modelRuns: 1 });
      const spec = normalizeModelSpec(step.input) as SynchronizationModelSpecV1;
      const observation = compileModelSpec(spec).run();
      const predictionMatched = modelPredictionMatches(
        spec.familyId,
        objective.prediction,
        observation.initial,
        observation.final,
      );
      return {
        version: 1,
        trial: Number(step.id.split('-').at(-1)),
        spec,
        runtimeVersion: MODEL_RUNTIME_VERSION,
        prediction: objective.prediction,
        observation,
        predictionMatched,
        targetReached: predictionMatched && observation.final >= objective.targetFinal,
        epistemicStatus: 'model_observation',
        ledgerEffect: 'none',
      } satisfies ModelLabTrialV1;
    },
  });
}

export function replayModelLabBundle(bundle: AgentRunBundle<ModelLabTrialV1>): {
  readonly ok: boolean;
  readonly trials: readonly { specId: string; matched: boolean }[];
} {
  const trials = bundle.completed.map(({ output }) => {
    const observation = compileModelSpec(output.spec).run();
    return {
      specId: output.spec.id,
      matched: JSON.stringify(observation) === JSON.stringify(output.observation),
    };
  });
  return Object.freeze({ ok: trials.every((trial) => trial.matched), trials: Object.freeze(trials) });
}

export function createModelLabReceipt(
  objective: SynchronizationModelLabObjectiveV1,
  bundle: AgentRunBundle<ModelLabTrialV1>,
): ModelLabMissionReceiptV1 {
  return Object.freeze({
    version: 1,
    kind: 'model-lab-mission',
    missionId: bundle.contract.id,
    objectiveId: objective.id,
    status: bundle.status,
    stopReason: bundle.stopReason,
    startedAt: bundle.startedAt,
    endedAt: bundle.endedAt,
    trials: Object.freeze(bundle.completed.map(({ output }) => output)),
    revisions: bundle.events.filter((event) => event.type === 'plan_revised').length,
    failedPredictions: bundle.completed.filter(({ output }) => !output.predictionMatched).length,
    usage: bundle.usage,
    epistemicStatus: 'model_observation',
    ledgerEffect: 'none',
  });
}

import { describe, expect, it } from 'vitest';
import { parseAgentRunBundle } from '@frontier-isles/core/mission-bundle';
import {
  MODEL_LAB_MAX_RUNS,
  MODEL_LAB_MAX_WALL_MS,
  createModelLabMissionContract,
  createModelLabReceipt,
  normalizeModelLabObjective,
  replayModelLabBundle,
  runModelLabMission,
  type ModelLabTrialV1,
  type SynchronizationModelLabObjectiveV1,
} from '../modelMission';

const instant = new Date('2026-08-08T00:00:00.000Z');
const now = () => new Date(instant);

const objective: SynchronizationModelLabObjectiveV1 = {
  version: 1,
  id: 'sync-threshold-proof',
  substrateId: 'fireflies',
  seed: 31,
  count: 48,
  spread: 0.2,
  dt: 0.04,
  steps: 700,
  prediction: 'increase',
  targetFinal: 0.82,
  couplingCandidates: [0, 0.2, 2.8, 4],
};

describe('A2 Model Lab mission', () => {
  it('runs, evaluates, revises, and reaches a declared target without human turns', async () => {
    const bundle = await runModelLabMission(objective, { now });

    expect(bundle.status).toBe('completed');
    expect(bundle.stopReason).toBe('goal_reached');
    expect(bundle.completed.length).toBeGreaterThanOrEqual(3);
    expect(bundle.completed[0]?.output.predictionMatched).toBe(false);
    expect(bundle.completed[0]?.output.targetReached).toBe(false);
    expect(bundle.completed.at(-1)?.output.targetReached).toBe(true);
    expect(bundle.events.filter((event) => event.type === 'plan_revised').length).toBeGreaterThanOrEqual(2);
    expect(bundle.usage.steps).toBeGreaterThanOrEqual(5);
    expect(bundle.usage.modelRuns).toBe(bundle.completed.length);
    expect(bundle.usage.modelRuns).toBeLessThanOrEqual(MODEL_LAB_MAX_RUNS);
    expect(bundle.contract.budgets.maxWallMs).toBe(MODEL_LAB_MAX_WALL_MS);
    expect(bundle.usage.writes).toBe(0);
    expect(bundle.grantUses).toEqual({});
  });

  it('stops before a third model execution when the model-run budget is two', async () => {
    const bundle = await runModelLabMission(objective, {
      now,
      budgets: { maxModelRuns: 2, maxAttempts: 2 },
    });

    expect(bundle.stopReason).toBe('budget_exhausted');
    expect(bundle.completed).toHaveLength(2);
    expect(bundle.usage.modelRuns).toBe(2);
  });

  it('replays every recorded spec and emits a non-ledger model-observation receipt', async () => {
    const bundle = await runModelLabMission(objective, { now });
    const persisted = parseAgentRunBundle<ModelLabTrialV1>(JSON.parse(JSON.stringify(bundle)));
    const replay = replayModelLabBundle(persisted);
    const receipt = createModelLabReceipt(objective, persisted);

    expect(replay.ok).toBe(true);
    expect(replay.trials).toHaveLength(persisted.completed.length);
    expect(receipt.epistemicStatus).toBe('model_observation');
    expect(receipt.ledgerEffect).toBe('none');
    expect(receipt.failedPredictions).toBeGreaterThan(0);
    expect(receipt.revisions).toBeGreaterThan(0);
  });

  it('clamps contract overrides to the 12-run and 30-second ceilings', () => {
    const manyCandidates = {
      ...objective,
      couplingCandidates: Array.from({ length: MODEL_LAB_MAX_RUNS }, (_, index) => index * 0.5),
    };
    const contract = createModelLabMissionContract(manyCandidates, {
      now: instant,
      budgets: { maxModelRuns: 99, maxAttempts: 99, maxWallMs: 99_000 },
    });

    expect(contract.budgets.maxModelRuns).toBe(MODEL_LAB_MAX_RUNS);
    expect(contract.budgets.maxAttempts).toBe(MODEL_LAB_MAX_RUNS);
    expect(contract.budgets.maxWallMs).toBe(MODEL_LAB_MAX_WALL_MS);
  });

  it('rejects malformed runtime objectives without throwing a raw TypeError', () => {
    expect(() => normalizeModelLabObjective(null)).toThrow('objective must be an object');
    expect(() => normalizeModelLabObjective(null)).not.toThrow(TypeError);
  });
});

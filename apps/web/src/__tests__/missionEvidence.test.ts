import { describe, expect, it } from 'vitest';
import {
  MODEL_LAB_MAX_RUNS,
  createModelLabReceipt,
  replayModelLabBundle,
  runModelLabMission,
  type SynchronizationModelLabObjectiveV1,
} from '../models/modelMission';
import {
  MAX_MISSION_EVIDENCE_RECORDS,
  MAX_MISSION_EVIDENCE_TRIALS,
  dedupeMissionEvidence,
  parseMissionEvidence,
  toMissionEvidence,
  type ModelLabMissionEvidenceV1,
} from '../state/missionEvidence';

const instant = new Date('2026-08-08T00:00:00.000Z');
const now = () => new Date(instant);

const objective: SynchronizationModelLabObjectiveV1 = {
  version: 1,
  id: 'sync-threshold-evidence',
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

/** A record projected from a genuine run, not a hand-written fixture. */
async function realEvidence(): Promise<ModelLabMissionEvidenceV1> {
  const bundle = await runModelLabMission(objective, { now });
  const receipt = createModelLabReceipt(objective, bundle);
  return toMissionEvidence(receipt, replayModelLabBundle(bundle).ok);
}

/** JSON round trip, matching what localStorage actually does to the record. */
const stored = (record: ModelLabMissionEvidenceV1): unknown =>
  JSON.parse(JSON.stringify(record)) as unknown;

describe('mission evidence projection', () => {
  it('keeps the eager trial ceiling equal to the runtime ceiling it mirrors', () => {
    // The notebook copies this constant instead of importing it, so that the
    // eager bundle keeps no edge to the zod-bearing mission chunk. The copy is
    // only safe while this assertion holds.
    expect(MAX_MISSION_EVIDENCE_TRIALS).toBe(MODEL_LAB_MAX_RUNS);
  });

  it('projects a completed mission and survives a storage round trip unchanged', async () => {
    const evidence = await realEvidence();

    expect(evidence.kind).toBe('model-lab-mission');
    expect(evidence.stopReason).toBe('goal_reached');
    expect(evidence.status).toBe('completed');
    expect(evidence.objectiveId).toBe('sync-threshold-evidence');
    expect(evidence.trials.length).toBeGreaterThanOrEqual(3);
    expect(evidence.failedPredictions).toBeGreaterThanOrEqual(1);
    expect(evidence.revisions).toBeGreaterThanOrEqual(2);
    expect(evidence.replayOk).toBe(true);
    expect(evidence.trials.at(-1)?.targetReached).toBe(true);
    expect(evidence.trials[0]?.predictionMatched).toBe(false);

    expect(parseMissionEvidence(stored(evidence))).toEqual(evidence);
  });

  it('stores evidence rather than resume authority', async () => {
    const evidence = await realEvidence();
    const keys = Object.keys(evidence);

    // The contract, event log, and per-step inputs are what a runner would need
    // to continue a mission. None of them may reach the notebook.
    expect(keys).not.toContain('contract');
    expect(keys).not.toContain('events');
    expect(keys).not.toContain('completed');
    expect(keys).not.toContain('grantUses');
  });

  it('refuses a record that claims anything but a local model observation', async () => {
    const evidence = await realEvidence();

    expect(parseMissionEvidence({ ...stored(evidence) as object, epistemicStatus: 'ratified_claim' })).toBeNull();
    expect(parseMissionEvidence({ ...stored(evidence) as object, ledgerEffect: 'append' })).toBeNull();
    expect(parseMissionEvidence({ ...stored(evidence) as object, kind: 'ledger-event' })).toBeNull();
    expect(parseMissionEvidence({ ...stored(evidence) as object, version: 2 })).toBeNull();
  });

  it('refuses a record whose summary claims more than its trials show', async () => {
    const evidence = await realEvidence();
    const base = stored(evidence) as Record<string, unknown>;

    expect(parseMissionEvidence({ ...base, failedPredictions: evidence.trials.length + 1 })).toBeNull();
    expect(parseMissionEvidence({ ...base, modelRuns: evidence.trials.length - 1 })).toBeNull();
    expect(parseMissionEvidence({ ...base, endedAt: '2026-08-07T00:00:00.000Z' })).toBeNull();
    expect(parseMissionEvidence({ ...base, stopReason: 'invented_reason' })).toBeNull();
    expect(parseMissionEvidence({ ...base, status: 'ratified' })).toBeNull();
  });

  it('refuses the whole record when any single trial is malformed', async () => {
    const evidence = await realEvidence();
    const base = stored(evidence) as Record<string, unknown>;
    const trials = [...evidence.trials.map((trial) => ({ ...trial }))];

    // A partially readable trial list would understate what the mission did, so
    // the record is dropped rather than silently shortened.
    expect(parseMissionEvidence({ ...base, trials: [...trials, { trial: 9 }] })).toBeNull();
    expect(parseMissionEvidence({
      ...base,
      trials: trials.map((trial, index) => (index === 0 ? { ...trial, coupling: Number.NaN } : trial)),
    })).toBeNull();
    expect(parseMissionEvidence({
      ...base,
      trials: trials.map((trial, index) => (index === 0 ? { ...trial, substrateId: 'not-a-substrate' } : trial)),
    })).toBeNull();
  });

  it('refuses a trial list longer than the runtime could have produced', async () => {
    const evidence = await realEvidence();
    const base = stored(evidence) as Record<string, unknown>;
    const oneTrial = evidence.trials[0]!;
    const overLong = Array.from({ length: MAX_MISSION_EVIDENCE_TRIALS + 1 }, (_, index) => ({
      ...oneTrial,
      trial: index + 1,
    }));

    // Every entry is individually well-formed; the list length alone is proof
    // the record did not come from a budgeted run.
    expect(overLong.length).toBeGreaterThan(MAX_MISSION_EVIDENCE_TRIALS);
    expect(parseMissionEvidence({ ...base, trials: overLong, modelRuns: overLong.length })).toBeNull();
  });

  it('rejects non-objects and structurally empty input without throwing', () => {
    for (const value of [null, undefined, 0, '', 'mission', [], { version: 1 }]) {
      expect(parseMissionEvidence(value)).toBeNull();
    }
  });

  it('keeps the newest record per mission and bounds how many are retained', async () => {
    const evidence = await realEvidence();
    const older = { ...evidence, revisions: 0 };
    const newer = { ...evidence, revisions: 9 };

    expect(dedupeMissionEvidence([older, newer])).toEqual([newer]);

    const many = Array.from({ length: MAX_MISSION_EVIDENCE_RECORDS + 12 }, (_, index) => ({
      ...evidence,
      missionId: `mission-${index}`,
    }));
    const kept = dedupeMissionEvidence(many);
    expect(kept).toHaveLength(MAX_MISSION_EVIDENCE_RECORDS);
    expect(kept.at(-1)?.missionId).toBe(`mission-${MAX_MISSION_EVIDENCE_RECORDS + 11}`);
    expect(kept[0]?.missionId).toBe('mission-12');
  });
});

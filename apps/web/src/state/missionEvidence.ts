/**
 * Durable, notebook-owned projection of a completed A2 Model Lab mission.
 *
 * The runtime receipt lives behind the lazy `models/modelMission` chunk, which
 * reaches `zod` through the core mission contracts. The notebook is eager, so
 * this module may borrow the receipt's *types* only — every value below is
 * parsed by hand. `apps/web/vite.config.ts` fails the build when `zod` lands in
 * the entry chunk, so a value import here is a build error rather than a review
 * comment.
 *
 * A mission record is evidence of what one declared model did under declared
 * parameters. It is never promoted research truth, and `parseMissionEvidence`
 * re-asserts that on every read: a stored record claiming ledger authority,
 * network use, or shared writes is discarded rather than trusted.
 */

import type { ModelLabMissionReceiptV1 } from '../models/modelMission';
import type { ModelPrediction, ModelSubstrateId } from '../models/types';

export const MISSION_EVIDENCE_VERSION = 1 as const;

/**
 * Mirrors `MODEL_LAB_MAX_RUNS`. Copied rather than imported so the eager
 * notebook keeps no edge to the mission chunk; `missionEvidence.test.ts`
 * asserts the two constants still agree.
 */
export const MAX_MISSION_EVIDENCE_TRIALS = 12;

/** Retained completed missions. The oldest records drop out first. */
export const MAX_MISSION_EVIDENCE_RECORDS = 50;

const MAX_ID_LENGTH = 240;

export type MissionEvidenceStatus = 'completed' | 'stopped' | 'paused' | 'failed';

/** Mirrors `MISSION_STOP_REASONS` in `@frontier-isles/core/mission`. */
export type MissionEvidenceStopReason =
  | 'completed' | 'goal_reached' | 'contradiction' | 'plateau' | 'uncertainty'
  | 'budget_exhausted' | 'expired' | 'paused' | 'revoked' | 'policy_denied'
  | 'repeated_failure' | 'permission_required' | 'failed';

export interface MissionEvidenceTrialV1 {
  readonly trial: number;
  readonly substrateId: ModelSubstrateId;
  readonly coupling: number;
  readonly prediction: ModelPrediction;
  readonly predictionMatched: boolean;
  readonly targetReached: boolean;
  readonly metric: 'coherence' | 'spread' | 'residual';
  readonly initial: number;
  readonly final: number;
  readonly steps: number;
}

export interface ModelLabMissionEvidenceV1 {
  readonly version: typeof MISSION_EVIDENCE_VERSION;
  readonly kind: 'model-lab-mission';
  readonly missionId: string;
  readonly objectiveId: string;
  readonly status: MissionEvidenceStatus;
  readonly stopReason: MissionEvidenceStopReason;
  readonly startedAt: string;
  readonly endedAt: string;
  readonly revisions: number;
  readonly failedPredictions: number;
  readonly modelRuns: number;
  readonly wallMs: number;
  readonly replayOk: boolean;
  readonly trials: readonly MissionEvidenceTrialV1[];
  /** Re-asserted on read. Any other value discards the record. */
  readonly epistemicStatus: 'model_observation';
  /** Re-asserted on read. A mission never becomes ledger truth by being stored. */
  readonly ledgerEffect: 'none';
}

const STATUSES = new Set<MissionEvidenceStatus>(['completed', 'stopped', 'paused', 'failed']);
const STOP_REASONS = new Set<MissionEvidenceStopReason>([
  'completed', 'goal_reached', 'contradiction', 'plateau', 'uncertainty',
  'budget_exhausted', 'expired', 'paused', 'revoked', 'policy_denied',
  'repeated_failure', 'permission_required', 'failed',
]);
const SUBSTRATE_IDS = new Set<ModelSubstrateId>([
  'fireflies', 'heart-cells', 'applause', 'power-grid',
  'heat', 'diffusion', 'electrostatic', 'steady-flow',
]);
const PREDICTIONS = new Set<ModelPrediction>(['increase', 'stay', 'decrease']);
const METRICS = new Set<MissionEvidenceTrialV1['metric']>(['coherence', 'spread', 'residual']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const counter = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

const timestamp = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));

const boundedId = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, MAX_ID_LENGTH) : null;
};

function trialOf(value: unknown): MissionEvidenceTrialV1 | null {
  if (!isRecord(value)) return null;
  if (!counter(value.trial)) return null;
  if (typeof value.substrateId !== 'string' || !SUBSTRATE_IDS.has(value.substrateId as ModelSubstrateId)) return null;
  if (typeof value.prediction !== 'string' || !PREDICTIONS.has(value.prediction as ModelPrediction)) return null;
  if (typeof value.metric !== 'string' || !METRICS.has(value.metric as MissionEvidenceTrialV1['metric'])) return null;
  if (typeof value.predictionMatched !== 'boolean' || typeof value.targetReached !== 'boolean') return null;
  if (!finite(value.coupling) || !finite(value.initial) || !finite(value.final)) return null;
  if (!counter(value.steps)) return null;
  return {
    trial: value.trial,
    substrateId: value.substrateId as ModelSubstrateId,
    coupling: value.coupling,
    prediction: value.prediction as ModelPrediction,
    predictionMatched: value.predictionMatched,
    targetReached: value.targetReached,
    metric: value.metric as MissionEvidenceTrialV1['metric'],
    initial: value.initial,
    final: value.final,
    steps: value.steps,
  };
}

/**
 * Parse one stored mission record. Returns `null` for anything malformed,
 * over-claiming, or internally inconsistent; the caller drops that record and
 * keeps the rest of the notebook.
 */
export function parseMissionEvidence(value: unknown): ModelLabMissionEvidenceV1 | null {
  if (!isRecord(value)) return null;
  if (value.version !== MISSION_EVIDENCE_VERSION) return null;
  if (value.kind !== 'model-lab-mission') return null;

  // Provenance is not decoration. A record that claims to be anything other
  // than a local model observation with no ledger effect is refused outright,
  // so tampered storage cannot smuggle authority into the notebook.
  if (value.epistemicStatus !== 'model_observation') return null;
  if (value.ledgerEffect !== 'none') return null;

  const missionId = boundedId(value.missionId);
  const objectiveId = boundedId(value.objectiveId);
  if (!missionId || !objectiveId) return null;

  if (typeof value.status !== 'string' || !STATUSES.has(value.status as MissionEvidenceStatus)) return null;
  if (typeof value.stopReason !== 'string' || !STOP_REASONS.has(value.stopReason as MissionEvidenceStopReason)) return null;
  if (!timestamp(value.startedAt) || !timestamp(value.endedAt)) return null;
  if (Date.parse(value.endedAt) < Date.parse(value.startedAt)) return null;
  // Checked one at a time: a type guard applied through `Array.every` narrows
  // the array, not the individual properties read out of it afterwards.
  if (!counter(value.revisions) || !counter(value.failedPredictions)) return null;
  if (!counter(value.modelRuns) || !counter(value.wallMs)) return null;
  if (typeof value.replayOk !== 'boolean') return null;
  // The runtime cannot produce more trials than its own ceiling, so a longer
  // list is forged or corrupt rather than merely oversized.
  if (!Array.isArray(value.trials) || value.trials.length > MAX_MISSION_EVIDENCE_TRIALS) return null;

  const trials = value.trials
    .map(trialOf)
    .filter((trial): trial is MissionEvidenceTrialV1 => !!trial);
  // Dropping only the unreadable trials would leave a record that understates
  // what the mission did, so one bad trial discards the whole record.
  if (trials.length !== value.trials.length) return null;

  // The recorded counts must be consistent with the trials that survived, or
  // the summary line would claim more than the record can show.
  if (value.failedPredictions > trials.length) return null;
  if (value.modelRuns < trials.length) return null;

  return {
    version: MISSION_EVIDENCE_VERSION,
    kind: 'model-lab-mission',
    missionId,
    objectiveId,
    status: value.status as MissionEvidenceStatus,
    stopReason: value.stopReason as MissionEvidenceStopReason,
    startedAt: value.startedAt,
    endedAt: value.endedAt,
    revisions: value.revisions,
    failedPredictions: value.failedPredictions,
    modelRuns: value.modelRuns,
    wallMs: value.wallMs,
    replayOk: value.replayOk,
    trials,
    epistemicStatus: 'model_observation',
    ledgerEffect: 'none',
  };
}

/** Keep the newest records, one per mission id. */
export function dedupeMissionEvidence(
  records: readonly ModelLabMissionEvidenceV1[],
): ModelLabMissionEvidenceV1[] {
  return [...new Map(records.map((record) => [record.missionId, record])).values()]
    .slice(-MAX_MISSION_EVIDENCE_RECORDS);
}

/**
 * Project a runtime receipt onto the durable record. The full replay bundle
 * (contract, events, per-step inputs) intentionally stays out of storage: the
 * notebook keeps what a learner can read and re-check, not resume authority.
 */
export function toMissionEvidence(
  receipt: ModelLabMissionReceiptV1,
  replayOk: boolean,
): ModelLabMissionEvidenceV1 {
  const trials = receipt.trials.slice(0, MAX_MISSION_EVIDENCE_TRIALS).map((trial) => ({
    trial: trial.trial,
    substrateId: trial.spec.substrateId as ModelSubstrateId,
    coupling: trial.spec.parameters.coupling,
    prediction: trial.prediction,
    predictionMatched: trial.predictionMatched,
    targetReached: trial.targetReached,
    metric: trial.observation.metric,
    initial: trial.observation.initial,
    final: trial.observation.final,
    steps: Math.max(0, Math.trunc(trial.observation.steps)),
  }));
  return {
    version: MISSION_EVIDENCE_VERSION,
    kind: 'model-lab-mission',
    missionId: receipt.missionId.slice(0, MAX_ID_LENGTH),
    objectiveId: receipt.objectiveId.slice(0, MAX_ID_LENGTH),
    status: receipt.status,
    stopReason: receipt.stopReason,
    startedAt: receipt.startedAt,
    endedAt: receipt.endedAt,
    revisions: receipt.revisions,
    failedPredictions: Math.min(receipt.failedPredictions, trials.length),
    modelRuns: Math.max(receipt.usage.modelRuns, trials.length),
    wallMs: receipt.usage.wallMs,
    replayOk,
    trials,
    epistemicStatus: 'model_observation',
    ledgerEffect: 'none',
  };
}

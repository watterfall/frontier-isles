import {
  LedgerEventSchema,
  hashEvent,
  parseProblemObject,
  serializeProblemObject,
  parseStructureObject,
  serializeStructureObject,
  ProblemObjectSchema,
  verifyChain,
  type StructureObject,
  type Actor,
  type ActionType,
  type FlowType,
  type LedgerEvent,
  type Phase,
  type ProblemObject,
  type ProblemObjectInput,
  type Status,
  type UnchainedEvent,
} from "@frontier-isles/opp";
import {
  STATION_KINDS,
  can,
  degradeAction,
  type GatewayAction,
  type EffectiveAction,
  type StationKind,
  type Role,
} from "@frontier-isles/core";
import {
  hasClaimEvidence,
  projectGrowth,
  computeTide,
  transplantInsight,
  projectContributions,
  projectNightReplay,
  projectCurrents,
  projectWhirlpools,
  projectMorningReport,
  buildTransplant,
  semanticRefEvent,
  projectStructureMappings,
  reduceStructureGraph,
  structureFrontier,
  type BridgeArtifactType,
  type Current,
  type Whirlpool,
  type MorningReportEntry,
  type MappingArtifact,
  type StructureEdge,
  type StructureFrontier,
  type StructureMappingRecord,
} from "@frontier-isles/core";
import { domainToVec, type IslandInterior, type XFrontierWithdrawal } from "@frontier-isles/data";
import type { DB } from "./db.js";
import { refHash, type RefKind } from "./refs.js";
import { dispatchNightDigest } from "./webhook.js";
import { randomBytes } from "node:crypto";
import { isDeepStrictEqual } from "node:util";

export const ORG = "frontier-isles";
export const opIdFor = (slug: string) => `op://${ORG}/prob/${slug}`;

/** Wide-open window start for `morningReport` — the dock is a standing inbox, not a 24h window. */
const EPOCH = "1970-01-01T00:00:00.000Z";

// ---------------------------------------------------------------------------
// Action → phase / ledger-action / default-station maps
// ---------------------------------------------------------------------------

/** GatewayAction → the concrete ledger ActionType written on the authorized path. */
const LEDGER_ACTION: Record<GatewayAction, ActionType> = {
  found_island: "found_island",
  propose_subquestion: "propose_subquestion",
  bridge_artifact: "bridge_artifact",
  submit_claim: "submit_claim",
  refute: "refute",
  validate: "validate",
  transplant: "transplant",
  return_to_driftwood: "return_to_driftwood",
  publish: "publish",
  adopt: "adopt",
  fork: "fork",
  merge_back: "merge_back",
  bridge_propose: "bridge_propose",
  bridge_accept: "bridge_accept",
  grant_capability: "grant_capability",
  night_digest: "night_digest",
  rebuild: "rebuild",
  // MCP write actions with no native ActionType record as a night digest / note.
  create_driftwood: "night_digest",
  attach_data: "night_digest",
  attach_hardware: "night_digest",
};

const DEFAULT_PHASE: Record<GatewayAction, Phase> = {
  found_island: "A",
  propose_subquestion: "A",
  create_driftwood: "A",
  return_to_driftwood: "A",
  night_digest: "A",
  fork: "A",
  bridge_artifact: "B",
  bridge_propose: "B",
  bridge_accept: "B",
  transplant: "B",
  rebuild: "B",
  attach_data: "B",
  attach_hardware: "B",
  submit_claim: "D",
  refute: "D",
  validate: "D",
  publish: "D",
  adopt: "D",
  merge_back: "D",
  grant_capability: "D",
};

const DEFAULT_STATION: Partial<Record<GatewayAction, StationKind>> = {
  propose_subquestion: "questions",
  submit_claim: "workshop",
  refute: "workshop",
  validate: "workshop",
  bridge_artifact: "dock",
  transplant: "dock",
  rebuild: "dock",
  create_driftwood: "driftwood",
  return_to_driftwood: "driftwood",
  attach_data: "data",
  attach_hardware: "workshop",
  publish: "gallery",
  adopt: "gallery",
};

/** Default nine-station L1 layout (grid coords); dock included (§3, DECISIONS 2). */
export const DEFAULT_STATION_LAYOUT: Record<StationKind, { gx: number; gy: number }> = {
  questions: { gx: 2, gy: 0 },
  library: { gx: 1, gy: 0 },
  canvas: { gx: 0, gy: 1 },
  data: { gx: 3, gy: 1 },
  driftwood: { gx: 2, gy: 2 },
  dock: { gx: 4, gy: 2 },
  workshop: { gx: 0, gy: 3 },
  gallery: { gx: 1, gy: 3 },
  tearoom: { gx: 3, gy: 3 },
};

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class GatewayDenied extends Error {
  constructor(public action: string) {
    super(`capability denied for action: ${action}`);
    this.name = "GatewayDenied";
  }
}
export class ChainError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "ChainError";
  }
}
/**
 * A refute/validate write whose payload carries no evidence-role data ref
 * (architecture §4 Claims & evidence). This is RECORD HONESTY, not capability:
 * it is a hard rejection (HTTP 422 / MCP tool error), never a silent dock
 * degradation, and it applies only to NEW writes — historical events in an
 * existing DB still project (write-side strict, read-side tolerant).
 */
export class EvidenceRequired extends Error {
  constructor(public action: string) {
    super(
      `${action} must reference an evidence-role data ref (§4): payload must be ` +
        `{ ro_crate, role: "evidence"|"replication", hash: "sha256:…" } or embed one under "evidence"`,
    );
    this.name = "EvidenceRequired";
  }
}
export class NotFound extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "NotFound";
  }
}

export type PassageInvalidReason =
  | "source_required"
  | "prediction_required"
  | "boundary_required"
  | "same_island"
  | "mapping_target_mismatch"
  | "source_unverified";

/** A structurally valid mapping that cannot truthfully become a passage edge. */
export class PassageInvalid extends Error {
  constructor(public reason: PassageInvalidReason, message: string) {
    super(message);
    this.name = "PassageInvalid";
  }
}

export type ConnectionResponseInvalidReason =
  | "target_required"
  | "target_unanchored"
  | "same_island"
  | "body_required"
  | "test_required"
  | "language_invalid"
  | "not_falsified"
  | "already_returned";

/** A response that cannot truthfully become evidence for or against a cross-island claim. */
export class ConnectionResponseInvalid extends Error {
  constructor(public reason: ConnectionResponseInvalidReason, message: string) {
    super(message);
    this.name = "ConnectionResponseInvalid";
  }
}

// ---------------------------------------------------------------------------
// Row shapes / public types
// ---------------------------------------------------------------------------

export interface ProblemMeta {
  domain: string;
  /** L0 chart display name (may differ from the object title, e.g. sample island). */
  name?: string;
  chart: { x: number; y: number; scale: number; activity: number; members?: number };
  /** Curated frontier metadata from the xfrontier atlas (place-plane; the OPP
   *  `frontier` field stays lean — heat/substrate derived from these scores). */
  atlas?: {
    atlasN: number;
    atlasWithdrawal?: XFrontierWithdrawal;
    scores: number[];
    cluster: { code: string; zh: string; en: string };
    citation: { url: string; title: string; venue: string; year: number };
    brief: { zh: string; en: string };
    outlier?: boolean;
    /** Full grounded evidence list (real citations) — feeds the island library +
     *  problem.md 参考文献 (§九 Phase 1). From FrontierEntry.literature. */
    literature?: { title: string; venue: string; year: number; url: string }[];
    /** Grounded deep content (overview/whyMatters/ifAnswered/approaches/barrier/
     *  subQuestions) — feeds the L1 detail dossier + problem.md body so opening
     *  an island is never empty. From @frontier-isles/data FrontierEntry.depth. */
    depth?: {
      overview: { zh: string; en: string };
      whyMatters: { zh: string; en: string };
      ifAnswered: { zh: string; en: string };
      approaches: { zh: string; en: string }[];
      barrier: { zh: string; en: string };
      subQuestions: { zh: string; en: string }[];
    };
    /** Rich flagship-island station interior (Question Wall / library digests /
     *  whiteboard debates / data desk / driftwood / residents). From
     *  @frontier-isles/data FrontierEntry.interior; feeds the L1 station drawers
     *  so opening a curated island is as full as the sample island. */
    interior?: IslandInterior;
  };
}

export interface StationRow {
  kind: StationKind;
  gx: number;
  gy: number;
  level: number;
}

export interface MembershipRow {
  actorId: string;
  kind: string;
  role: string | null;
  aiKind: string | null;
}

export interface GatewayInput {
  actor: Actor;
  gatewayAction: GatewayAction;
  phase?: Phase;
  credit?: string[];
  flow?: FlowType;
  payload?: unknown;
  refKind?: RefKind;
  station?: StationKind;
  placementMeta?: Record<string, unknown>;
  ts?: string;
  /** Optimistic-concurrency guard: must equal the current head hash. */
  expectPrev?: string;
}

export interface GatewayResult {
  event: LedgerEvent;
  degraded: boolean;
  effectiveAction: EffectiveAction;
  refHash?: string;
  proposalHash?: string;
}

export interface RebuildPassageResult extends GatewayResult {
  passageKind: "charted" | "frontier";
  structureId: string;
  sourceIslandOp: string;
  targetIslandOp: string;
}

export interface ConnectionResponseInput {
  targetRef: string;
  action: "validate" | "refute";
  body: string;
  test: string;
  evidence: unknown;
  actor: Actor;
  language?: "zh" | "en";
  credit?: string[];
  ts?: string;
}

export interface ConnectionResponseResult extends GatewayResult {
  targetRef: string;
  responseRef: string;
  sourceIslandOp: string;
  respondingIslandOp: string;
}

/** A catalog slug is occupied by a different stable xFrontier identity. */
export class CatalogAtlasIdentityConflict extends Error {
  constructor(
    public slug: string,
    public storedAtlasN: unknown,
    public catalogAtlasN: number,
  ) {
    super(
      `catalog atlas identity conflict for ${slug}: stored XF-${storedAtlasN} does not match catalog XF-${catalogAtlasN}`,
    );
    this.name = "CatalogAtlasIdentityConflict";
  }
}

export type FeedbackOutboxState = "pending" | "in_flight" | "delivered" | "uncertain" | "cancelled";
export type FeedbackDeliveryOutcome = "success" | "failure" | "lease_expired";
export type FeedbackReconciliationOutcome = "found" | "not_found" | "refused" | "conflict";
export type FeedbackRemoteDecisionStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "resolved"
  | "wontfix"
  | "superseded";
export type FeedbackLocalDisposition = "unreviewed" | "acknowledged" | "applied" | "released";
export type FeedbackFindingLocalDisposition = "unreviewed" | "acknowledged" | "addressed" | "dismissed";

export interface FeedbackOutboxItem {
  id: string;
  idempotencyKey: string;
  envelopeHash: string;
  envelope: unknown;
  sourceLedgerEventHash?: string;
  sourceRefHash?: string;
  state: FeedbackOutboxState;
  createdAt: string;
  updatedAt: string;
  cancelledReason?: string;
}

export interface FeedbackDeliveryAttempt {
  attemptId: string;
  outboxId: string;
  attemptNo: number;
  workerId: string;
  startedAt: string;
  leaseExpiresAt: string;
}

export interface FeedbackDeliveryLease {
  item: FeedbackOutboxItem;
  attempt: FeedbackDeliveryAttempt;
  /** Capability for completing this exact lease; do not persist in logs. */
  leaseToken: string;
}

/** Read-only delivery audit view. Lease capabilities are intentionally absent. */
export interface FeedbackDeliveryInspection {
  item: FeedbackOutboxItem;
  activeLease?: {
    attemptId: string;
    workerId: string;
    leaseExpiresAt: string;
  };
  lastAttempt?: FeedbackDeliveryAttempt;
  lastReceipt?: FeedbackDeliveryReceipt;
  lastReconciliation?: FeedbackDeliveryReconciliation;
}

export interface FeedbackDeliveryReceipt {
  receiptId: string;
  attemptId: string;
  outboxId: string;
  outcome: FeedbackDeliveryOutcome;
  remoteReceiptId?: string;
  detail?: unknown;
  error?: string;
  recordedAt: string;
}

export interface FeedbackDeliveryReconciliation {
  reconciliationId: string;
  outboxId: string;
  /** The completed delivery attempt whose remote outcome this lookup observed. */
  basisAttemptId: string;
  clientEventId: string;
  requestHash: string;
  outcome: FeedbackReconciliationOutcome;
  remoteReceiptId?: string;
  detail: unknown;
  recordedAt: string;
}

export interface FeedbackReviewDecision {
  seq: number;
  decisionId: string;
  outboxId: string;
  remoteStatus: FeedbackRemoteDecisionStatus;
  decision: unknown;
  decidedAt: string;
  receivedAt: string;
}

export interface FeedbackReviewInboxItem {
  outboxId: string;
  latestDecisionId: string;
  remoteStatus: FeedbackRemoteDecisionStatus;
  remoteDecidedAt: string;
  localDisposition: FeedbackLocalDisposition;
  /** A local application/release is historical fact. If upstream later reverses
   * acceptance, preserve that fact and surface the disagreement for a human. */
  needsReconciliation: boolean;
  localUpdatedAt?: string;
}

export interface FeedbackFindingInboxItem {
  remoteFindingId: string;
  datasetVersion: string;
  findingHash: string;
  finding: unknown;
  upstreamStale: boolean;
  observedAt: string;
  localDisposition: FeedbackFindingLocalDisposition;
  localUpdatedAt?: string;
}

export class FeedbackStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedbackStoreError";
  }
}

export class FeedbackIdempotencyConflict extends FeedbackStoreError {
  constructor(public idempotencyKey: string) {
    super(`feedback idempotency key was reused with different content: ${idempotencyKey}`);
    this.name = "FeedbackIdempotencyConflict";
  }
}

export class FeedbackSourceMissing extends FeedbackStoreError {
  constructor(public sourceKind: "ledger_event" | "ref", public hash: string) {
    super(`feedback source ${sourceKind} does not exist locally: ${hash}`);
    this.name = "FeedbackSourceMissing";
  }
}

export class FeedbackStateConflict extends FeedbackStoreError {
  constructor(message: string) {
    super(message);
    this.name = "FeedbackStateConflict";
  }
}

type FeedbackOutboxSqlRow = {
  id: string;
  idempotency_key: string;
  envelope_hash: string;
  envelope_json: string;
  source_ledger_event_hash: string | null;
  source_ref_hash: string | null;
  state: FeedbackOutboxState;
  created_at: string;
  updated_at: string;
  cancelled_reason: string | null;
};

type FeedbackActiveLeaseSqlRow = {
  state: FeedbackOutboxState;
  lease_owner: string | null;
  current_attempt_id: string | null;
  lease_expires_at: string | null;
};

type FeedbackAttemptSqlRow = {
  attempt_id: string;
  outbox_id: string;
  attempt_no: number;
  worker_id: string;
  started_at: string;
  lease_expires_at: string;
};

type FeedbackReceiptSqlRow = {
  receipt_id: string;
  attempt_id: string;
  outbox_id: string;
  outcome: FeedbackDeliveryOutcome;
  remote_receipt_id: string | null;
  detail_json: string | null;
  error: string | null;
  recorded_at: string;
};

type FeedbackReconciliationSqlRow = {
  reconciliation_id: string;
  outbox_id: string;
  basis_attempt_id: string;
  client_event_id: string;
  request_hash: string;
  outcome: FeedbackReconciliationOutcome;
  remote_receipt_id: string | null;
  detail_json: string;
  recorded_at: string;
};

type FeedbackDecisionSqlRow = {
  seq: number;
  decision_id: string;
  outbox_id: string;
  remote_status: FeedbackRemoteDecisionStatus;
  decision_json: string;
  decided_at: string;
  received_at: string;
};

type FeedbackInboxSqlRow = {
  outbox_id: string;
  latest_decision_id: string;
  remote_status: FeedbackRemoteDecisionStatus;
  remote_decided_at: string;
  local_disposition: FeedbackLocalDisposition;
  local_updated_at: string | null;
};

type FeedbackFindingSqlRow = {
  remote_finding_id: string;
  dataset_version: string;
  finding_hash: string;
  finding_json: string;
  upstream_stale: number;
  observed_at: string;
  local_disposition: FeedbackFindingLocalDisposition;
  local_updated_at: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const feedbackJson = (value: unknown, label: string): string => {
  const json = JSON.stringify(value);
  if (json === undefined) throw new FeedbackStoreError(`${label} must be JSON-serializable`);
  return json;
};

const feedbackIso = (value: string | undefined, label: string): string => {
  const date = value === undefined ? new Date() : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new FeedbackStoreError(`${label} must be a valid timestamp`);
  return date.toISOString();
};

const feedbackSourceOf = (envelope: unknown): { ledgerEventHash?: string; refHash?: string } => {
  if (!isRecord(envelope)) throw new FeedbackStoreError("feedback envelope must be a JSON object");
  if (envelope.source === undefined) {
    throw new FeedbackStoreError("feedback envelope needs a ledgerEventHash or refHash evidence anchor");
  }
  if (!isRecord(envelope.source)) throw new FeedbackStoreError("feedback envelope source must be an object");
  const ledgerEventHash = envelope.source.ledgerEventHash;
  const sourceRefHash = envelope.source.refHash;
  if (ledgerEventHash !== undefined && (typeof ledgerEventHash !== "string" || ledgerEventHash.length === 0)) {
    throw new FeedbackStoreError("feedback source ledgerEventHash must be a non-empty string");
  }
  if (sourceRefHash !== undefined && (typeof sourceRefHash !== "string" || sourceRefHash.length === 0)) {
    throw new FeedbackStoreError("feedback source refHash must be a non-empty string");
  }
  if (ledgerEventHash === undefined && sourceRefHash === undefined) {
    throw new FeedbackStoreError("feedback envelope needs a ledgerEventHash or refHash evidence anchor");
  }
  return { ledgerEventHash: ledgerEventHash as string | undefined, refHash: sourceRefHash as string | undefined };
};

const feedbackOutboxFromRow = (row: FeedbackOutboxSqlRow): FeedbackOutboxItem => ({
  id: row.id,
  idempotencyKey: row.idempotency_key,
  envelopeHash: row.envelope_hash,
  envelope: JSON.parse(row.envelope_json) as unknown,
  ...(row.source_ledger_event_hash ? { sourceLedgerEventHash: row.source_ledger_event_hash } : {}),
  ...(row.source_ref_hash ? { sourceRefHash: row.source_ref_hash } : {}),
  state: row.state,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  ...(row.cancelled_reason ? { cancelledReason: row.cancelled_reason } : {}),
});

const feedbackAttemptFromRow = (row: FeedbackAttemptSqlRow): FeedbackDeliveryAttempt => ({
  attemptId: row.attempt_id,
  outboxId: row.outbox_id,
  attemptNo: row.attempt_no,
  workerId: row.worker_id,
  startedAt: row.started_at,
  leaseExpiresAt: row.lease_expires_at,
});

const feedbackReceiptFromRow = (row: FeedbackReceiptSqlRow): FeedbackDeliveryReceipt => ({
  receiptId: row.receipt_id,
  attemptId: row.attempt_id,
  outboxId: row.outbox_id,
  outcome: row.outcome,
  ...(row.remote_receipt_id ? { remoteReceiptId: row.remote_receipt_id } : {}),
  ...(row.detail_json !== null ? { detail: JSON.parse(row.detail_json) as unknown } : {}),
  ...(row.error ? { error: row.error } : {}),
  recordedAt: row.recorded_at,
});

const feedbackReconciliationFromRow = (
  row: FeedbackReconciliationSqlRow,
): FeedbackDeliveryReconciliation => ({
  reconciliationId: row.reconciliation_id,
  outboxId: row.outbox_id,
  basisAttemptId: row.basis_attempt_id,
  clientEventId: row.client_event_id,
  requestHash: row.request_hash,
  outcome: row.outcome,
  ...(row.remote_receipt_id ? { remoteReceiptId: row.remote_receipt_id } : {}),
  detail: JSON.parse(row.detail_json) as unknown,
  recordedAt: row.recorded_at,
});

const feedbackDecisionFromRow = (row: FeedbackDecisionSqlRow): FeedbackReviewDecision => ({
  seq: row.seq,
  decisionId: row.decision_id,
  outboxId: row.outbox_id,
  remoteStatus: row.remote_status,
  decision: JSON.parse(row.decision_json) as unknown,
  decidedAt: row.decided_at,
  receivedAt: row.received_at,
});

const feedbackInboxFromRow = (row: FeedbackInboxSqlRow): FeedbackReviewInboxItem => ({
  outboxId: row.outbox_id,
  latestDecisionId: row.latest_decision_id,
  remoteStatus: row.remote_status,
  remoteDecidedAt: row.remote_decided_at,
  localDisposition: row.local_disposition,
  needsReconciliation:
    (row.local_disposition === "applied" || row.local_disposition === "released")
    && row.remote_status !== "accepted",
  ...(row.local_updated_at ? { localUpdatedAt: row.local_updated_at } : {}),
});

const feedbackFindingFromRow = (row: FeedbackFindingSqlRow): FeedbackFindingInboxItem => ({
  remoteFindingId: row.remote_finding_id,
  datasetVersion: row.dataset_version,
  findingHash: row.finding_hash,
  finding: JSON.parse(row.finding_json) as unknown,
  upstreamStale: row.upstream_stale === 1,
  observedAt: row.observed_at,
  localDisposition: row.local_disposition,
  ...(row.local_updated_at ? { localUpdatedAt: row.local_updated_at } : {}),
});

const FEEDBACK_OUTBOX_COLUMNS = `id, idempotency_key, envelope_hash, envelope_json,
  source_ledger_event_hash, source_ref_hash, state, created_at, updated_at, cancelled_reason`;

const REMOTE_DECISION_STATUSES = new Set<FeedbackRemoteDecisionStatus>([
  "pending",
  "accepted",
  "rejected",
  "resolved",
  "wontfix",
  "superseded",
]);

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export class Store {
  constructor(public db: DB) {}

  // --- refs -----------------------------------------------------------------

  putRef(kind: RefKind, content: unknown): string {
    const hash = refHash(content);
    this.db
      .prepare("INSERT OR IGNORE INTO refs (hash, kind, json) VALUES (?, ?, ?)")
      .run(hash, kind, JSON.stringify(content));
    return hash;
  }

  getRef(hash: string): { kind: string; content: unknown } | undefined {
    const row = this.db.prepare("SELECT kind, json FROM refs WHERE hash = ?").get(hash) as
      | { kind: string; json: string }
      | undefined;
    return row ? { kind: row.kind, content: JSON.parse(row.json) } : undefined;
  }

  // --- durable xFrontier feedback -------------------------------------------

  /**
   * Transactionally enqueue one already-validated exchange envelope. The
   * idempotency key is stable across process retries; reusing it with different
   * content or provenance is a hard conflict, never an overwrite.
   *
   * Optional `envelope.source.ledgerEventHash/refHash` values are authority
   * anchors, not decorative provenance: both must already exist in this DB.
   */
  enqueueFeedback(input: {
    idempotencyKey: string;
    envelope: unknown;
    now?: string;
  }): { created: boolean; item: FeedbackOutboxItem } {
    const idempotencyKey = input.idempotencyKey.trim();
    if (!idempotencyKey) throw new FeedbackStoreError("feedback idempotency key is required");
    const at = feedbackIso(input.now, "feedback enqueue timestamp");
    const envelopeJson = feedbackJson(input.envelope, "feedback envelope");
    const envelopeHash = refHash(input.envelope);
    const source = feedbackSourceOf(input.envelope);
    const outboxId = refHash({ format: "frontier-isles/xfrontier-feedback-outbox/v1", idempotencyKey });

    const tx = this.db.transaction((): { created: boolean; item: FeedbackOutboxItem } => {
      const existing = this.db
        .prepare(`SELECT ${FEEDBACK_OUTBOX_COLUMNS} FROM feedback_outbox WHERE idempotency_key = ?`)
        .get(idempotencyKey) as FeedbackOutboxSqlRow | undefined;
      if (existing) {
        if (
          existing.envelope_hash !== envelopeHash ||
          existing.source_ledger_event_hash !== (source.ledgerEventHash ?? null) ||
          existing.source_ref_hash !== (source.refHash ?? null)
        ) {
          throw new FeedbackIdempotencyConflict(idempotencyKey);
        }
        return { created: false, item: feedbackOutboxFromRow(existing) };
      }

      if (source.ledgerEventHash) {
        const found = this.db.prepare("SELECT 1 FROM ledger_events WHERE hash = ?").get(source.ledgerEventHash);
        if (!found) throw new FeedbackSourceMissing("ledger_event", source.ledgerEventHash);
      }
      if (source.refHash) {
        const found = this.db.prepare("SELECT 1 FROM refs WHERE hash = ?").get(source.refHash);
        if (!found) throw new FeedbackSourceMissing("ref", source.refHash);
      }

      this.db
        .prepare(
          `INSERT INTO feedback_outbox (
             id, idempotency_key, envelope_hash, envelope_json,
             source_ledger_event_hash, source_ref_hash, state, created_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
        )
        .run(
          outboxId,
          idempotencyKey,
          envelopeHash,
          envelopeJson,
          source.ledgerEventHash ?? null,
          source.refHash ?? null,
          at,
          at,
        );
      return { created: true, item: this.getFeedbackOutbox(outboxId)! };
    });
    return tx();
  }

  getFeedbackOutbox(outboxId: string): FeedbackOutboxItem | undefined {
    const row = this.db
      .prepare(`SELECT ${FEEDBACK_OUTBOX_COLUMNS} FROM feedback_outbox WHERE id = ?`)
      .get(outboxId) as FeedbackOutboxSqlRow | undefined;
    return row ? feedbackOutboxFromRow(row) : undefined;
  }

  findFeedbackByIdempotencyKey(idempotencyKey: string): FeedbackOutboxItem | undefined {
    const row = this.db
      .prepare(`SELECT ${FEEDBACK_OUTBOX_COLUMNS} FROM feedback_outbox WHERE idempotency_key = ?`)
      .get(idempotencyKey) as FeedbackOutboxSqlRow | undefined;
    return row ? feedbackOutboxFromRow(row) : undefined;
  }

  /** Resolve a remote proposal/finding id back to its one successful local send. */
  findFeedbackByRemoteReceiptId(remoteReceiptId: string): FeedbackOutboxItem | undefined {
    const remoteId = remoteReceiptId.trim();
    if (!remoteId) throw new FeedbackStoreError("remote feedback receipt id is required");
    const rows = this.db
      .prepare(
        `SELECT o.id, o.idempotency_key, o.envelope_hash, o.envelope_json,
                o.source_ledger_event_hash, o.source_ref_hash, o.state,
                o.created_at, o.updated_at, o.cancelled_reason
         FROM feedback_delivery_receipts r
         JOIN feedback_outbox o ON o.id = r.outbox_id
         WHERE r.outcome = 'success' AND r.remote_receipt_id = ?
         UNION ALL
         SELECT o.id, o.idempotency_key, o.envelope_hash, o.envelope_json,
                o.source_ledger_event_hash, o.source_ref_hash, o.state,
                o.created_at, o.updated_at, o.cancelled_reason
         FROM feedback_delivery_reconciliations r
         JOIN feedback_outbox o ON o.id = r.outbox_id
         WHERE r.outcome = 'found' AND r.remote_receipt_id = ?
         ORDER BY id`,
      )
      .all(remoteId, remoteId) as FeedbackOutboxSqlRow[];
    const unique = [...new Map(rows.map((row) => [row.id, row])).values()];
    if (unique.length > 1) {
      throw new FeedbackStateConflict(`remote feedback receipt id maps to multiple outbox items: ${remoteId}`);
    }
    return unique[0] ? feedbackOutboxFromRow(unique[0]) : undefined;
  }

  listFeedbackOutbox(state?: FeedbackOutboxState): FeedbackOutboxItem[] {
    const rows = state
      ? (this.db
          .prepare(`SELECT ${FEEDBACK_OUTBOX_COLUMNS} FROM feedback_outbox WHERE state = ? ORDER BY created_at, id`)
          .all(state) as FeedbackOutboxSqlRow[])
      : (this.db
          .prepare(`SELECT ${FEEDBACK_OUTBOX_COLUMNS} FROM feedback_outbox ORDER BY created_at, id`)
          .all() as FeedbackOutboxSqlRow[]);
    return rows.map(feedbackOutboxFromRow);
  }

  /**
   * Read-only operational detail for CLI inspection/recovery decisions. This
   * never expires a lease or changes state; callers must invoke
   * {@link recoverExpiredFeedbackDeliveries} explicitly.
   */
  inspectFeedbackDelivery(outboxId: string): FeedbackDeliveryInspection | undefined {
    const item = this.getFeedbackOutbox(outboxId);
    if (!item) return undefined;
    const lease = this.db
      .prepare(
        `SELECT state, lease_owner, current_attempt_id, lease_expires_at
         FROM feedback_outbox WHERE id = ?`,
      )
      .get(outboxId) as FeedbackActiveLeaseSqlRow;
    const attempts = this.listFeedbackDeliveryAttempts(outboxId);
    const receipts = this.listFeedbackDeliveryReceipts(outboxId);
    const reconciliations = this.listFeedbackDeliveryReconciliations(outboxId);
    const lastAttempt = attempts.at(-1);
    const lastReceipt = receipts.at(-1);
    const lastReconciliation = reconciliations.at(-1);
    return {
      item,
      ...(lease.state === "in_flight"
        ? {
            activeLease: {
              attemptId: lease.current_attempt_id!,
              workerId: lease.lease_owner!,
              leaseExpiresAt: lease.lease_expires_at!,
            },
          }
        : {}),
      ...(lastAttempt ? { lastAttempt } : {}),
      ...(lastReceipt ? { lastReceipt } : {}),
      ...(lastReconciliation ? { lastReconciliation } : {}),
    };
  }

  /** Expired delivery means "remote outcome unknown", never "safe to retry". */
  private expireFeedbackLeasesAt(at: string): number {
    const expired = this.db
      .prepare(
        `SELECT id, current_attempt_id, lease_expires_at
         FROM feedback_outbox
         WHERE state = 'in_flight' AND lease_expires_at <= ?
         ORDER BY lease_expires_at, id`,
      )
      .all(at) as Array<{ id: string; current_attempt_id: string; lease_expires_at: string }>;
    for (const row of expired) {
      const detail = { reason: "lease_expired", leaseExpiresAt: row.lease_expires_at };
      const receiptHash = refHash({
        attemptId: row.current_attempt_id,
        outboxId: row.id,
        outcome: "lease_expired",
        detail,
      });
      const receiptId = refHash({ format: "frontier-isles/feedback-delivery-receipt/v1", receiptHash });
      this.db
        .prepare(
          `INSERT INTO feedback_delivery_receipts (
             receipt_id, receipt_hash, attempt_id, outbox_id, outcome, detail_json, error, recorded_at
           ) VALUES (?, ?, ?, ?, 'lease_expired', ?, ?, ?)`,
        )
        .run(
          receiptId,
          receiptHash,
          row.current_attempt_id,
          row.id,
          JSON.stringify(detail),
          "delivery lease expired after the remote call began; outcome is uncertain",
          at,
        );
      const updated = this.db
        .prepare(
          `UPDATE feedback_outbox
           SET state = 'uncertain', updated_at = ?, lease_owner = NULL, lease_token = NULL,
               lease_expires_at = NULL, current_attempt_id = NULL
           WHERE id = ? AND state = 'in_flight' AND current_attempt_id = ?`,
        )
        .run(at, row.id, row.current_attempt_id);
      if (updated.changes !== 1) throw new FeedbackStateConflict(`expired feedback lease changed concurrently: ${row.id}`);
    }
    return expired.length;
  }

  recoverExpiredFeedbackDeliveries(now?: string): number {
    const at = feedbackIso(now, "feedback lease recovery timestamp");
    return this.db.transaction(() => this.expireFeedbackLeasesAt(at)).immediate();
  }

  /** @deprecated Prefer the explicitly named recovery operation. */
  expireFeedbackDeliveryLeases(now?: string): number {
    return this.recoverExpiredFeedbackDeliveries(now);
  }

  /**
   * Atomically lease the oldest pending item and append the immutable fact that
   * a remote delivery call is about to begin. An uncertain item is selectable
   * only by exact id after a matching not_found reconciliation.
   */
  leaseFeedbackDelivery(input: {
    workerId: string;
    /** Pin an explicit CLI/preflight selection instead of leasing another item. */
    outboxId?: string;
    /** An uncertain item is eligible only after an exact read-only lookup proved
     * this immutable request absent. The caller must present that same proof. */
    retry?: { clientEventId: string; requestHash: string };
    now?: string;
    leaseMs?: number;
  }): FeedbackDeliveryLease | undefined {
    const workerId = input.workerId.trim();
    if (!workerId) throw new FeedbackStoreError("feedback delivery worker id is required");
    const startedAt = feedbackIso(input.now, "feedback delivery start timestamp");
    const leaseMs = input.leaseMs ?? 60_000;
    if (!Number.isFinite(leaseMs) || leaseMs <= 0) {
      throw new FeedbackStoreError("feedback delivery leaseMs must be positive");
    }
    if (input.retry && !input.outboxId) {
      throw new FeedbackStoreError("reconciled feedback retry requires an explicit outboxId");
    }
    const retry = input.retry
      ? {
          clientEventId: input.retry.clientEventId.trim(),
          requestHash: input.retry.requestHash.trim(),
        }
      : undefined;
    if (retry && (!retry.clientEventId || !/^sha256:[0-9a-f]{64}$/.test(retry.requestHash))) {
      throw new FeedbackStoreError("reconciled feedback retry needs a client event id and SHA-256 request hash");
    }
    const leaseExpiresAt = new Date(Date.parse(startedAt) + leaseMs).toISOString();

    const tx = this.db.transaction((): FeedbackDeliveryLease | undefined => {
      const candidate = input.outboxId
        ? (this.db
            .prepare(
              `SELECT ${FEEDBACK_OUTBOX_COLUMNS} FROM feedback_outbox
               WHERE id = ? AND state = ?`,
            )
            .get(input.outboxId, retry ? "uncertain" : "pending") as FeedbackOutboxSqlRow | undefined)
        : (this.db
            .prepare(`SELECT ${FEEDBACK_OUTBOX_COLUMNS} FROM feedback_outbox WHERE state = 'pending' ORDER BY created_at, id LIMIT 1`)
            .get() as FeedbackOutboxSqlRow | undefined);
      if (!candidate) return undefined;
      if (retry) {
        if (candidate.idempotency_key !== retry.clientEventId) {
          throw new FeedbackStateConflict(`feedback retry client event id mismatch: ${candidate.id}`);
        }
        const latest = this.db
          .prepare(
            `SELECT reconciliation_id, outbox_id, basis_attempt_id, client_event_id, request_hash,
                    outcome, remote_receipt_id, detail_json, recorded_at
             FROM feedback_delivery_reconciliations WHERE outbox_id = ?
             ORDER BY seq DESC LIMIT 1`,
          )
          .get(candidate.id) as FeedbackReconciliationSqlRow | undefined;
        const lastAttempt = this.db
          .prepare(
            `SELECT attempt_id, outbox_id, attempt_no, worker_id, started_at, lease_expires_at
             FROM feedback_delivery_attempts WHERE outbox_id = ?
             ORDER BY attempt_no DESC LIMIT 1`,
          )
          .get(candidate.id) as FeedbackAttemptSqlRow | undefined;
        if (
          !latest || latest.outcome !== "not_found" ||
          latest.client_event_id !== retry.clientEventId || latest.request_hash !== retry.requestHash ||
          latest.basis_attempt_id !== lastAttempt?.attempt_id
        ) {
          throw new FeedbackStateConflict(
            `feedback retry requires a fresh exact not_found reconciliation for the latest attempt: ${candidate.id}`,
          );
        }
      }

      const count = this.db
        .prepare("SELECT COUNT(*) AS n FROM feedback_delivery_attempts WHERE outbox_id = ?")
        .get(candidate.id) as { n: number };
      const attemptNo = count.n + 1;
      const attemptId = `feedback-attempt:${randomBytes(16).toString("hex")}`;
      const leaseToken = randomBytes(32).toString("hex");
      const updated = this.db
        .prepare(
          `UPDATE feedback_outbox
           SET state = 'in_flight', updated_at = ?, lease_owner = ?, lease_token = ?,
               lease_expires_at = ?, current_attempt_id = ?
           WHERE id = ? AND state = ?`,
        )
        .run(startedAt, workerId, leaseToken, leaseExpiresAt, attemptId, candidate.id, retry ? "uncertain" : "pending");
      if (updated.changes !== 1) throw new FeedbackStateConflict(`feedback item was leased concurrently: ${candidate.id}`);
      this.db
        .prepare(
          `INSERT INTO feedback_delivery_attempts (
             attempt_id, outbox_id, attempt_no, worker_id, lease_token, started_at, lease_expires_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(attemptId, candidate.id, attemptNo, workerId, leaseToken, startedAt, leaseExpiresAt);

      return {
        item: this.getFeedbackOutbox(candidate.id)!,
        attempt: { attemptId, outboxId: candidate.id, attemptNo, workerId, startedAt, leaseExpiresAt },
        leaseToken,
      };
    });
    return tx.immediate();
  }

  private completeFeedbackDelivery(input: {
    attemptId: string;
    leaseToken: string;
    outcome: "success" | "failure";
    remoteReceiptId?: string;
    detail?: unknown;
    error?: string;
    at?: string;
  }): FeedbackDeliveryReceipt {
    const recordedAt = feedbackIso(input.at, "feedback delivery receipt timestamp");
    const detailJson = input.detail === undefined ? null : feedbackJson(input.detail, "feedback delivery receipt");
    const attempt = this.db
      .prepare(
        `SELECT a.attempt_id, a.outbox_id, a.lease_token,
                o.state, o.current_attempt_id, o.lease_token AS current_lease_token
         FROM feedback_delivery_attempts a
         JOIN feedback_outbox o ON o.id = a.outbox_id
         WHERE a.attempt_id = ?`,
      )
      .get(input.attemptId) as
      | {
          attempt_id: string;
          outbox_id: string;
          lease_token: string;
          state: FeedbackOutboxState;
          current_attempt_id: string | null;
          current_lease_token: string | null;
        }
      | undefined;
    if (!attempt) throw new FeedbackStateConflict(`unknown feedback delivery attempt: ${input.attemptId}`);
    if (attempt.lease_token !== input.leaseToken) {
      throw new FeedbackStateConflict(`feedback delivery lease token mismatch: ${input.attemptId}`);
    }

    const semanticReceipt = {
      attemptId: attempt.attempt_id,
      outboxId: attempt.outbox_id,
      outcome: input.outcome,
      remoteReceiptId: input.remoteReceiptId ?? null,
      detail: input.detail ?? null,
      error: input.error ?? null,
    };
    const receiptHash = refHash(semanticReceipt);
    const existing = this.db
      .prepare(
        `SELECT receipt_id, receipt_hash, attempt_id, outbox_id, outcome,
                remote_receipt_id, detail_json, error, recorded_at
         FROM feedback_delivery_receipts WHERE attempt_id = ?`,
      )
      .get(input.attemptId) as (FeedbackReceiptSqlRow & { receipt_hash: string }) | undefined;
    if (existing) {
      if (existing.receipt_hash !== receiptHash) {
        throw new FeedbackStateConflict(`feedback attempt already has a different receipt: ${input.attemptId}`);
      }
      return feedbackReceiptFromRow(existing);
    }
    if (
      attempt.state !== "in_flight" ||
      attempt.current_attempt_id !== input.attemptId ||
      attempt.current_lease_token !== input.leaseToken
    ) {
      throw new FeedbackStateConflict(`feedback delivery attempt is no longer active: ${input.attemptId}`);
    }

    const receiptId = refHash({ format: "frontier-isles/feedback-delivery-receipt/v1", receiptHash });
    const nextState: FeedbackOutboxState = input.outcome === "success" ? "delivered" : "uncertain";
    const tx = this.db.transaction((): FeedbackDeliveryReceipt => {
      if (input.outcome === "success") {
        const receiptOwner = this.db
          .prepare(
            `SELECT attempt_id, outbox_id FROM feedback_delivery_receipts
             WHERE outcome = 'success' AND remote_receipt_id = ?`,
          )
          .get(input.remoteReceiptId) as { attempt_id: string; outbox_id: string } | undefined;
        const reconciliationOwner = this.db
          .prepare(
            `SELECT basis_attempt_id AS attempt_id, outbox_id
             FROM feedback_delivery_reconciliations
             WHERE outcome = 'found' AND remote_receipt_id = ?
             LIMIT 1`,
          )
          .get(input.remoteReceiptId) as { attempt_id: string; outbox_id: string } | undefined;
        const remoteOwner = receiptOwner ?? reconciliationOwner;
        if (remoteOwner) {
          throw new FeedbackStateConflict(
            `remote feedback receipt id already belongs to outbox ${remoteOwner.outbox_id}: ${input.remoteReceiptId}`,
          );
        }
      }
      this.db
        .prepare(
          `INSERT INTO feedback_delivery_receipts (
             receipt_id, receipt_hash, attempt_id, outbox_id, outcome,
             remote_receipt_id, detail_json, error, recorded_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          receiptId,
          receiptHash,
          input.attemptId,
          attempt.outbox_id,
          input.outcome,
          input.remoteReceiptId ?? null,
          detailJson,
          input.error ?? null,
          recordedAt,
        );
      const updated = this.db
        .prepare(
          `UPDATE feedback_outbox
           SET state = ?, updated_at = ?, lease_owner = NULL, lease_token = NULL,
               lease_expires_at = NULL, current_attempt_id = NULL
           WHERE id = ? AND state = 'in_flight' AND current_attempt_id = ? AND lease_token = ?`,
        )
        .run(nextState, recordedAt, attempt.outbox_id, input.attemptId, input.leaseToken);
      if (updated.changes !== 1) {
        throw new FeedbackStateConflict(`feedback delivery completion changed concurrently: ${input.attemptId}`);
      }
      return {
        receiptId,
        attemptId: input.attemptId,
        outboxId: attempt.outbox_id,
        outcome: input.outcome,
        ...(input.remoteReceiptId ? { remoteReceiptId: input.remoteReceiptId } : {}),
        ...(input.detail !== undefined ? { detail: input.detail } : {}),
        ...(input.error ? { error: input.error } : {}),
        recordedAt,
      };
    });
    // Serialize the uniqueness check with other DB connections before inserting
    // the success receipt; this is the hard guard without rewriting legacy rows.
    return tx.immediate();
  }

  recordFeedbackDeliverySuccess(input: {
    attemptId: string;
    leaseToken: string;
    remoteReceiptId: string;
    receipt: unknown;
    at?: string;
  }): FeedbackDeliveryReceipt {
    const remoteReceiptId = input.remoteReceiptId.trim();
    if (!remoteReceiptId) throw new FeedbackStoreError("remote feedback receipt id is required for success");
    return this.completeFeedbackDelivery({
      attemptId: input.attemptId,
      leaseToken: input.leaseToken,
      outcome: "success",
      remoteReceiptId,
      detail: input.receipt,
      at: input.at,
    });
  }

  /** Any exception after an attempt began is uncertain and is never requeued. */
  recordFeedbackDeliveryFailure(input: {
    attemptId: string;
    leaseToken: string;
    error: string;
    receipt?: unknown;
    at?: string;
  }): FeedbackDeliveryReceipt {
    const error = input.error.trim();
    if (!error) throw new FeedbackStoreError("feedback delivery failure requires an error");
    return this.completeFeedbackDelivery({
      attemptId: input.attemptId,
      leaseToken: input.leaseToken,
      outcome: "failure",
      detail: input.receipt,
      error,
      at: input.at,
    });
  }

  listFeedbackDeliveryAttempts(outboxId: string): FeedbackDeliveryAttempt[] {
    const rows = this.db
      .prepare(
        `SELECT attempt_id, outbox_id, attempt_no, worker_id, started_at, lease_expires_at
         FROM feedback_delivery_attempts WHERE outbox_id = ? ORDER BY attempt_no`,
      )
      .all(outboxId) as FeedbackAttemptSqlRow[];
    return rows.map(feedbackAttemptFromRow);
  }

  listFeedbackDeliveryReceipts(outboxId: string): FeedbackDeliveryReceipt[] {
    const rows = this.db
      .prepare(
        `SELECT receipt_id, attempt_id, outbox_id, outcome, remote_receipt_id,
                detail_json, error, recorded_at
         FROM feedback_delivery_receipts WHERE outbox_id = ? ORDER BY recorded_at, receipt_id`,
      )
      .all(outboxId) as FeedbackReceiptSqlRow[];
    return rows.map(feedbackReceiptFromRow);
  }

  /** Append the result of an exact, read-only upstream receipt lookup. This is
   * deliberately separate from attempt receipts: it observes an already-ended
   * attempt and never pretends that another writer call began. */
  recordFeedbackDeliveryReconciliation(input: {
    outboxId: string;
    clientEventId: string;
    requestHash: string;
    outcome: FeedbackReconciliationOutcome;
    remoteReceiptId?: string;
    detail: unknown;
    at?: string;
  }): { created: boolean; reconciliation: FeedbackDeliveryReconciliation; item: FeedbackOutboxItem } {
    const clientEventId = input.clientEventId.trim();
    const requestHash = input.requestHash.trim();
    const remoteReceiptId = input.remoteReceiptId?.trim();
    if (!clientEventId) throw new FeedbackStoreError("feedback reconciliation client event id is required");
    if (!/^sha256:[0-9a-f]{64}$/.test(requestHash)) {
      throw new FeedbackStoreError("feedback reconciliation request hash must be sha256:<64 lowercase hex>");
    }
    if (input.outcome === "found" ? !remoteReceiptId : remoteReceiptId !== undefined) {
      throw new FeedbackStoreError("only a found feedback reconciliation carries a remote receipt id");
    }
    const recordedAt = feedbackIso(input.at, "feedback reconciliation timestamp");
    const detailJson = feedbackJson(input.detail, "feedback reconciliation detail");
    const tx = this.db.transaction(() => {
      const item = this.getFeedbackOutbox(input.outboxId);
      if (!item) throw new FeedbackStateConflict(`unknown feedback outbox item: ${input.outboxId}`);
      if (item.idempotencyKey !== clientEventId) {
        throw new FeedbackStateConflict(`feedback reconciliation client event id mismatch: ${item.id}`);
      }
      if (item.state === "in_flight") {
        throw new FeedbackStateConflict(`cannot reconcile an active feedback delivery: ${item.id}`);
      }
      if (input.outcome === "not_found" && item.state !== "uncertain") {
        throw new FeedbackStateConflict(`not_found reconciliation requires uncertain state: ${item.id}`);
      }
      if ((input.outcome === "refused" || input.outcome === "conflict") && item.state !== "uncertain") {
        throw new FeedbackStateConflict(`${input.outcome} reconciliation requires uncertain state: ${item.id}`);
      }
      if (input.outcome === "found" && !["uncertain", "delivered"].includes(item.state)) {
        throw new FeedbackStateConflict(`found reconciliation cannot close state ${item.state}: ${item.id}`);
      }

      const basisAttempt = this.db
        .prepare(
          `SELECT attempt_id, outbox_id, attempt_no, worker_id, started_at, lease_expires_at
           FROM feedback_delivery_attempts WHERE outbox_id = ?
           ORDER BY attempt_no DESC LIMIT 1`,
        )
        .get(item.id) as FeedbackAttemptSqlRow | undefined;
      if (!basisAttempt) {
        throw new FeedbackStateConflict(`feedback reconciliation requires a completed delivery attempt: ${item.id}`);
      }
      const basisReceipt = this.db
        .prepare("SELECT 1 FROM feedback_delivery_receipts WHERE attempt_id = ?")
        .get(basisAttempt.attempt_id);
      if (!basisReceipt) {
        throw new FeedbackStateConflict(
          `feedback reconciliation basis attempt has no terminal receipt: ${basisAttempt.attempt_id}`,
        );
      }

      const reconciliationHash = refHash({
        format: "frontier-isles/xfrontier-feedback-reconciliation/v1",
        outboxId: item.id,
        basisAttemptId: basisAttempt.attempt_id,
        clientEventId,
        requestHash,
        outcome: input.outcome,
        remoteReceiptId: remoteReceiptId ?? null,
        detail: input.detail,
      });
      const reconciliationId = refHash({
        format: "frontier-isles/xfrontier-feedback-reconciliation-id/v1",
        reconciliationHash,
      });
      const existing = this.db
        .prepare(
          `SELECT reconciliation_id, outbox_id, basis_attempt_id, client_event_id, request_hash,
                  outcome, remote_receipt_id, detail_json, recorded_at
           FROM feedback_delivery_reconciliations WHERE reconciliation_id = ?`,
        )
        .get(reconciliationId) as FeedbackReconciliationSqlRow | undefined;
      if (existing) {
        return { created: false, reconciliation: feedbackReconciliationFromRow(existing), item };
      }

      if (remoteReceiptId) {
        const normalOwner = this.db
          .prepare(
            `SELECT outbox_id FROM feedback_delivery_receipts
             WHERE outcome = 'success' AND remote_receipt_id = ?`,
          )
          .get(remoteReceiptId) as { outbox_id: string } | undefined;
        const reconciledOwner = this.db
          .prepare(
            `SELECT outbox_id FROM feedback_delivery_reconciliations
             WHERE outcome = 'found' AND remote_receipt_id = ? LIMIT 1`,
          )
          .get(remoteReceiptId) as { outbox_id: string } | undefined;
        const owner = normalOwner?.outbox_id ?? reconciledOwner?.outbox_id;
        if (owner && owner !== item.id) {
          throw new FeedbackStateConflict(
            `remote feedback receipt id already belongs to outbox ${owner}: ${remoteReceiptId}`,
          );
        }
      }

      this.db
        .prepare(
          `INSERT INTO feedback_delivery_reconciliations (
             reconciliation_id, reconciliation_hash, outbox_id, basis_attempt_id, client_event_id,
             request_hash, outcome, remote_receipt_id, detail_json, recorded_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          reconciliationId,
          reconciliationHash,
          item.id,
          basisAttempt.attempt_id,
          clientEventId,
          requestHash,
          input.outcome,
          remoteReceiptId ?? null,
          detailJson,
          recordedAt,
        );

      if (input.outcome === "found" && item.state !== "delivered") {
        const updated = this.db
          .prepare(
            `UPDATE feedback_outbox SET state = 'delivered', updated_at = ?, cancelled_reason = NULL
             WHERE id = ? AND state = ?`,
          )
          .run(recordedAt, item.id, item.state);
        if (updated.changes !== 1) {
          throw new FeedbackStateConflict(`feedback reconciliation changed concurrently: ${item.id}`);
        }
      } else if (input.outcome === "refused") {
        const updated = this.db
          .prepare(
            `UPDATE feedback_outbox SET state = 'cancelled', updated_at = ?, cancelled_reason = ?
             WHERE id = ? AND state = 'uncertain'`,
          )
          .run(recordedAt, "upstream precondition refused without writing", item.id);
        if (updated.changes !== 1) {
          throw new FeedbackStateConflict(`feedback refusal reconciliation changed concurrently: ${item.id}`);
        }
      }

      const reconciliation = this.db
        .prepare(
          `SELECT reconciliation_id, outbox_id, basis_attempt_id, client_event_id, request_hash,
                  outcome, remote_receipt_id, detail_json, recorded_at
           FROM feedback_delivery_reconciliations WHERE reconciliation_id = ?`,
        )
        .get(reconciliationId) as FeedbackReconciliationSqlRow;
      return {
        created: true,
        reconciliation: feedbackReconciliationFromRow(reconciliation),
        item: this.getFeedbackOutbox(item.id)!,
      };
    });
    return tx.immediate();
  }

  listFeedbackDeliveryReconciliations(outboxId: string): FeedbackDeliveryReconciliation[] {
    const rows = this.db
      .prepare(
        `SELECT reconciliation_id, outbox_id, basis_attempt_id, client_event_id, request_hash,
                outcome, remote_receipt_id, detail_json, recorded_at
         FROM feedback_delivery_reconciliations WHERE outbox_id = ?
         ORDER BY seq`,
      )
      .all(outboxId) as FeedbackReconciliationSqlRow[];
    return rows.map(feedbackReconciliationFromRow);
  }

  cancelFeedback(outboxId: string, reason: string, at?: string): FeedbackOutboxItem {
    const cancellationReason = reason.trim();
    if (!cancellationReason) throw new FeedbackStoreError("feedback cancellation requires a reason");
    const cancelledAt = feedbackIso(at, "feedback cancellation timestamp");
    const current = this.getFeedbackOutbox(outboxId);
    if (!current) throw new FeedbackStateConflict(`unknown feedback outbox item: ${outboxId}`);
    if (current.state !== "pending") {
      throw new FeedbackStateConflict(`cannot cancel feedback in state ${current.state}: ${outboxId}`);
    }
    const updated = this.db
      .prepare(
        `UPDATE feedback_outbox SET state = 'cancelled', updated_at = ?, cancelled_reason = ?
         WHERE id = ? AND state = 'pending'`,
      )
      .run(cancelledAt, cancellationReason, outboxId);
    if (updated.changes !== 1) throw new FeedbackStateConflict(`feedback cancellation changed concurrently: ${outboxId}`);
    return this.getFeedbackOutbox(outboxId)!;
  }

  /**
   * Append one remote review decision idempotently and update the inbox's latest
   * remote projection. Local disposition is deliberately preserved.
   */
  upsertFeedbackReviewDecision(input: {
    outboxId: string;
    decisionId: string;
    status: FeedbackRemoteDecisionStatus;
    decision: unknown;
    decidedAt: string;
    receivedAt?: string;
  }): { created: boolean; decision: FeedbackReviewDecision; inbox: FeedbackReviewInboxItem } {
    const decisionId = input.decisionId.trim();
    if (!decisionId) throw new FeedbackStoreError("feedback review decision id is required");
    if (!REMOTE_DECISION_STATUSES.has(input.status)) {
      throw new FeedbackStoreError(`unsupported feedback remote decision status: ${input.status}`);
    }
    const decidedAt = feedbackIso(input.decidedAt, "feedback remote decision timestamp");
    const receivedAt = feedbackIso(input.receivedAt, "feedback decision receipt timestamp");
    const decisionJson = feedbackJson(input.decision, "feedback remote decision");
    const decisionHash = refHash({
      outboxId: input.outboxId,
      decisionId,
      status: input.status,
      decision: input.decision,
      decidedAt,
    });

    const tx = this.db.transaction(() => {
      if (!this.getFeedbackOutbox(input.outboxId)) {
        throw new FeedbackStateConflict(`unknown feedback outbox item: ${input.outboxId}`);
      }
      const existing = this.db
        .prepare(
          `SELECT seq, decision_id, decision_hash, outbox_id, remote_status,
                  decision_json, decided_at, received_at
           FROM feedback_review_decisions WHERE decision_id = ?`,
        )
        .get(decisionId) as (FeedbackDecisionSqlRow & { decision_hash: string }) | undefined;
      if (existing) {
        if (existing.decision_hash !== decisionHash) {
          throw new FeedbackStateConflict(`feedback decision id was reused with different content: ${decisionId}`);
        }
        return {
          created: false,
          decision: feedbackDecisionFromRow(existing),
          inbox: this.getFeedbackReviewInbox(input.outboxId)!,
        };
      }

      const inserted = this.db
        .prepare(
          `INSERT INTO feedback_review_decisions (
             decision_id, decision_hash, outbox_id, remote_status, decision_json, decided_at, received_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(decisionId, decisionHash, input.outboxId, input.status, decisionJson, decidedAt, receivedAt);
      this.db
        .prepare(
          `INSERT INTO feedback_review_inbox (
             outbox_id, latest_decision_id, remote_status, remote_decided_at, local_disposition
           ) VALUES (?, ?, ?, ?, 'unreviewed')
           ON CONFLICT(outbox_id) DO UPDATE SET
             latest_decision_id = excluded.latest_decision_id,
             remote_status = excluded.remote_status,
             remote_decided_at = excluded.remote_decided_at
           WHERE excluded.remote_decided_at >= feedback_review_inbox.remote_decided_at`,
        )
        .run(input.outboxId, decisionId, input.status, decidedAt);

      return {
        created: true,
        decision: {
          seq: Number(inserted.lastInsertRowid),
          decisionId,
          outboxId: input.outboxId,
          remoteStatus: input.status,
          decision: input.decision,
          decidedAt,
          receivedAt,
        },
        inbox: this.getFeedbackReviewInbox(input.outboxId)!,
      };
    });
    return tx();
  }

  getFeedbackReviewInbox(outboxId: string): FeedbackReviewInboxItem | undefined {
    const row = this.db
      .prepare(
        `SELECT outbox_id, latest_decision_id, remote_status, remote_decided_at,
                local_disposition, local_updated_at
         FROM feedback_review_inbox WHERE outbox_id = ?`,
      )
      .get(outboxId) as FeedbackInboxSqlRow | undefined;
    return row ? feedbackInboxFromRow(row) : undefined;
  }

  listFeedbackReviewInbox(): FeedbackReviewInboxItem[] {
    const rows = this.db
      .prepare(
        `SELECT outbox_id, latest_decision_id, remote_status, remote_decided_at,
                local_disposition, local_updated_at
         FROM feedback_review_inbox ORDER BY remote_decided_at, outbox_id`,
      )
      .all() as FeedbackInboxSqlRow[];
    return rows.map(feedbackInboxFromRow);
  }

  listFeedbackReviewDecisions(outboxId: string): FeedbackReviewDecision[] {
    const rows = this.db
      .prepare(
        `SELECT seq, decision_id, outbox_id, remote_status, decision_json, decided_at, received_at
         FROM feedback_review_decisions WHERE outbox_id = ? ORDER BY decided_at, seq`,
      )
      .all(outboxId) as FeedbackDecisionSqlRow[];
    return rows.map(feedbackDecisionFromRow);
  }

  setFeedbackLocalDisposition(
    outboxId: string,
    next: FeedbackLocalDisposition,
    at?: string,
  ): FeedbackReviewInboxItem {
    const updatedAt = feedbackIso(at, "feedback local disposition timestamp");
    const current = this.getFeedbackReviewInbox(outboxId);
    if (!current) throw new FeedbackStateConflict(`feedback item has no remote review decision: ${outboxId}`);
    if (current.localDisposition === next) return current;
    const order: FeedbackLocalDisposition[] = ["unreviewed", "acknowledged", "applied", "released"];
    const expected = order[order.indexOf(current.localDisposition) + 1];
    if (next !== expected) {
      throw new FeedbackStateConflict(
        `feedback local disposition must advance one step from ${current.localDisposition}, not ${next}`,
      );
    }
    if ((next === "applied" || next === "released") && current.remoteStatus !== "accepted") {
      throw new FeedbackStateConflict(
        `feedback cannot become ${next} while remote status is ${current.remoteStatus}`,
      );
    }
    const changed = this.db
      .prepare(
        `UPDATE feedback_review_inbox SET local_disposition = ?, local_updated_at = ?
         WHERE outbox_id = ? AND local_disposition = ?`,
      )
      .run(next, updatedAt, outboxId, current.localDisposition);
    if (changed.changes !== 1) {
      throw new FeedbackStateConflict(`feedback local disposition changed concurrently: ${outboxId}`);
    }
    return this.getFeedbackReviewInbox(outboxId)!;
  }

  /**
   * Upsert findings carrying xFrontier's explicit upstream-stale signal. An id
   * absent from this observation is left exactly as-is: it may have been skipped
   * because a remote file was damaged and absence is not a lifecycle decision.
   */
  upsertFeedbackFindings(input: {
    datasetVersion: string;
    findings: ReadonlyArray<{ remoteFindingId: string; finding: unknown; upstreamStale: boolean }>;
    observedAt?: string;
  }): { upserted: number } {
    const datasetVersion = input.datasetVersion.trim();
    if (!datasetVersion) throw new FeedbackStoreError("feedback finding dataset version is required");
    const observedAt = feedbackIso(input.observedAt, "feedback finding snapshot timestamp");
    const prepared = input.findings.map(({ remoteFindingId, finding, upstreamStale }) => {
      const id = remoteFindingId.trim();
      if (!id) throw new FeedbackStoreError("remote feedback finding id is required");
      if (typeof upstreamStale !== "boolean") {
        throw new FeedbackStoreError("remote feedback finding upstreamStale must be boolean");
      }
      return {
        id,
        finding,
        upstreamStale,
        json: feedbackJson(finding, "remote feedback finding"),
        hash: refHash(finding),
      };
    });
    if (new Set(prepared.map((finding) => finding.id)).size !== prepared.length) {
      throw new FeedbackStoreError("feedback finding snapshot contains duplicate remote ids");
    }

    return this.db.transaction(() => {
      for (const finding of prepared) {
        this.db
          .prepare(
            `INSERT INTO feedback_finding_inbox (
               remote_finding_id, dataset_version, finding_hash, finding_json, upstream_stale, observed_at
             ) VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(remote_finding_id) DO UPDATE SET
               dataset_version = excluded.dataset_version,
               finding_hash = excluded.finding_hash,
               finding_json = excluded.finding_json,
               upstream_stale = excluded.upstream_stale,
               observed_at = excluded.observed_at`,
          )
          .run(finding.id, datasetVersion, finding.hash, finding.json, finding.upstreamStale ? 1 : 0, observedAt);
      }
      return { upserted: prepared.length };
    })();
  }

  listFeedbackFindings(input: { includeStale?: boolean } = {}): FeedbackFindingInboxItem[] {
    const rows = input.includeStale
      ? (this.db
          .prepare(
            `SELECT remote_finding_id, dataset_version, finding_hash, finding_json, upstream_stale,
                    observed_at, local_disposition, local_updated_at
             FROM feedback_finding_inbox ORDER BY remote_finding_id`,
          )
          .all() as FeedbackFindingSqlRow[])
      : (this.db
          .prepare(
            `SELECT remote_finding_id, dataset_version, finding_hash, finding_json, upstream_stale,
                    observed_at, local_disposition, local_updated_at
             FROM feedback_finding_inbox WHERE upstream_stale = 0 ORDER BY remote_finding_id`,
          )
          .all() as FeedbackFindingSqlRow[]);
    return rows.map(feedbackFindingFromRow);
  }

  setFeedbackFindingLocalDisposition(
    remoteFindingId: string,
    next: FeedbackFindingLocalDisposition,
    at?: string,
  ): FeedbackFindingInboxItem {
    const id = remoteFindingId.trim();
    const updatedAt = feedbackIso(at, "feedback finding review timestamp");
    const row = this.db
      .prepare(
        `SELECT remote_finding_id, dataset_version, finding_hash, finding_json, upstream_stale,
                observed_at, local_disposition, local_updated_at
         FROM feedback_finding_inbox WHERE remote_finding_id = ?`,
      )
      .get(id) as FeedbackFindingSqlRow | undefined;
    if (!row) throw new FeedbackStateConflict(`unknown remote feedback finding: ${id}`);
    if (row.local_disposition === next) return feedbackFindingFromRow(row);
    const allowed =
      (row.local_disposition === "unreviewed" && next === "acknowledged") ||
      (row.local_disposition === "acknowledged" && (next === "addressed" || next === "dismissed"));
    if (!allowed) {
      throw new FeedbackStateConflict(
        `invalid feedback finding disposition ${row.local_disposition} -> ${next}: ${id}`,
      );
    }
    this.db
      .prepare(
        `UPDATE feedback_finding_inbox SET local_disposition = ?, local_updated_at = ?
         WHERE remote_finding_id = ? AND local_disposition = ?`,
      )
      .run(next, updatedAt, id, row.local_disposition);
    return this.listFeedbackFindings({ includeStale: true }).find((finding) => finding.remoteFindingId === id)!;
  }

  // --- problem objects ------------------------------------------------------

  hasIslands(): boolean {
    const row = this.db.prepare("SELECT COUNT(*) AS n FROM problem_objects").get() as { n: number };
    return row.n > 0;
  }

  getProblemRow(slug: string):
    | { opId: string; slug: string; md: string; meta: ProblemMeta; object: ProblemObject }
    | undefined {
    const row = this.db
      .prepare("SELECT op_id, slug, md_source, json FROM problem_objects WHERE slug = ?")
      .get(slug) as { op_id: string; slug: string; md_source: string; json: string } | undefined;
    if (!row) return undefined;
    const { object } = parseProblemObject(row.md_source);
    return {
      opId: row.op_id,
      slug: row.slug,
      md: row.md_source,
      meta: JSON.parse(row.json) as ProblemMeta,
      object,
    };
  }

  listProblemRows(): Array<{ opId: string; slug: string; md: string; meta: ProblemMeta }> {
    const rows = this.db
      .prepare("SELECT op_id, slug, md_source, json FROM problem_objects ORDER BY slug")
      .all() as Array<{ op_id: string; slug: string; md_source: string; json: string }>;
    return rows.map((r) => ({
      opId: r.op_id,
      slug: r.slug,
      md: r.md_source,
      meta: JSON.parse(r.json) as ProblemMeta,
    }));
  }

  /**
   * The sea plane (depth-plan-v2 §3) as a pure projection over the WHOLE ledger:
   * cross-island currents + whirlpools, plus each island's place-plane coordinate
   * (manifold `vec` from domain, abstractness `substrate` from the atlas score, or
   * null when unknown → no sea depth). No new verb, no relation store — invariant 15.
   */
  seaData(): {
    currents: Current[];
    whirlpools: Whirlpool[];
    islands: Array<{
      op: string;
      name: string;
      domain: string;
      vec: [number, number];
      substrate: number | null;
      chart: { x: number; y: number };
    }>;
  } {
    const rows = this.listProblemRows();
    const events: LedgerEvent[] = [];
    for (const r of rows) events.push(...this.getEvents(r.opId));
    const islands = rows.map((r) => {
      const s = r.meta.atlas?.scores;
      const substrate = s && typeof s[6] === "number" ? s[6] / 5 : null;
      return {
        op: r.opId,
        name: r.meta.name ?? r.slug,
        domain: r.meta.domain,
        vec: domainToVec(r.meta.domain),
        substrate,
        chart: { x: r.meta.chart.x, y: r.meta.chart.y },
      };
    });
    const resolveRef = (ref: string) => this.getRef(ref);
    return {
      currents: projectCurrents(events, resolveRef),
      whirlpools: projectWhirlpools(events, resolveRef),
      islands,
    };
  }

  /** Insert a problem object (knowledge plane). Idempotent on op_id. */
  insertProblem(object: ProblemObject, md: string, meta: ProblemMeta): void {
    this.db
      .prepare(
        `INSERT OR IGNORE INTO problem_objects (op_id, slug, md_source, title, status, qfocus, json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        object.id,
        slugOf(object.id),
        md,
        object.title,
        object.status,
        object.qfocus,
        JSON.stringify(meta),
      );
  }

  /**
   * Reconcile only the bundled catalog's atlas projection for an existing
   * problem. The island's authored problem object, relational columns, other
   * place metadata (including unknown extensions), ledger, and refs remain
   * untouched. Returns true only when the stored projection changed.
   *
   * This is intentionally not a problem-object upsert: the catalog owns this
   * one projection, while the island keeps authority over every other field.
   */
  reconcileCatalogAtlasProjection(
    slug: string,
    atlas: NonNullable<ProblemMeta["atlas"]>,
  ): boolean {
    const row = this.db
      .prepare("SELECT json FROM problem_objects WHERE slug = ?")
      .get(slug) as { json: string } | undefined;
    if (!row) return false;

    const meta = JSON.parse(row.json) as ProblemMeta & Record<string, unknown>;
    const storedAtlasN = (meta.atlas as { atlasN?: unknown } | undefined)?.atlasN;
    // A slug alone is not proof of catalog ownership. Fresh catalog rows are
    // always seeded with atlasN; a missing identity is ambiguous and must not
    // let the catalog silently claim a user-authored island with the same slug.
    if (storedAtlasN !== atlas.atlasN) {
      throw new CatalogAtlasIdentityConflict(slug, storedAtlasN, atlas.atlasN);
    }
    // Match SQLite's JSON representation: optional `undefined` properties are
    // absent after serialization, so they must not turn every boot into a write.
    const projection = JSON.parse(JSON.stringify(atlas)) as NonNullable<ProblemMeta["atlas"]>;
    if (isDeepStrictEqual(meta.atlas, projection)) return false;

    this.db
      .prepare("UPDATE problem_objects SET json = ? WHERE slug = ?")
      .run(JSON.stringify({ ...meta, atlas: projection }), slug);
    return true;
  }

  // --- structures (执行纲要 §九, knowledge plane) ----------------------------

  /** Upsert a catalogued structure object. md_source is authoritative +
   *  round-trips (§6). Seed reconciliation calls this only for known catalog
   *  ids; user-created ids remain untouched. */
  insertStructure(object: StructureObject): void {
    const slug = structSlugOf(object.id);
    this.db
      .prepare(
        `INSERT INTO structure_objects (id, slug, md_source, status) VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           slug = excluded.slug,
           md_source = excluded.md_source,
           status = excluded.status`,
      )
      .run(object.id, slug, serializeStructureObject(object), object.status);
  }

  /** All structures (parsed from their authoritative md). */
  listStructures(): StructureObject[] {
    const rows = this.db
      .prepare("SELECT md_source FROM structure_objects ORDER BY id")
      .all() as { md_source: string }[];
    return rows.map((r) => parseStructureObject(r.md_source));
  }

  /** One structure by slug — object + raw md (for the .md leavability route). */
  getStructure(slug: string): { object: StructureObject; md: string } | undefined {
    const row = this.db
      .prepare("SELECT md_source FROM structure_objects WHERE slug = ?")
      .get(slug) as { md_source: string } | undefined;
    if (!row) return undefined;
    return { object: parseStructureObject(row.md_source), md: row.md_source };
  }

  /**
   * The 结构 ⇄ 现象 bipartite graph as a pure reduce over the WHOLE ledger
   * (执行纲要 §九): rebuild events whose ref resolves to a mapping become edges;
   * structureFrontier then derives each structure's rebuilt islands + near gaps.
   * No edge is stored — this is `reduce`, not a relation table (inv 14/15).
   */
  structureGraph(): { edges: StructureEdge[]; frontier: StructureFrontier[]; mappings: StructureMappingRecord[] } {
    const rows = this.listProblemRows();
    const events: LedgerEvent[] = [];
    for (const r of rows) events.push(...this.getEvents(r.opId));
    const resolveRef = (ref: string): MappingArtifact | null => {
      const r = this.getRef(ref);
      return r && r.kind === "mapping" ? (r.content as MappingArtifact) : null;
    };
    const edges = reduceStructureGraph(events, resolveRef);
    const mappings = projectStructureMappings(events, resolveRef);
    const islands = rows.map((r) => ({
      op: r.opId,
      domain: r.meta.domain,
      cluster: r.meta.atlas?.cluster.code,
    }));
    return { edges, frontier: structureFrontier(edges, islands), mappings };
  }

  /**
   * Complete one human-authored Ferry Dock passage. The departure must already
   * carry a real rebuild edge for this structure; the destination may either be
   * another charted edge (practice) or a true gap (frontier research). Both
   * paths write the exact same mapping ref + rebuild event. The label is derived
   * from the destination graph before mutation and can never be submitted by a
   * client.
   */
  rebuildPassage(
    slug: string,
    input: { mapping: MappingArtifact; actor: Actor; credit?: string[]; ts?: string },
  ): RebuildPassageResult {
    const target = this.getProblemRow(slug);
    if (!target) throw new NotFound(slug);
    const { mapping, actor } = input;

    if (mapping.islandOp !== target.opId) {
      throw new PassageInvalid("mapping_target_mismatch", "mapping.islandOp must match the destination island");
    }
    if (!mapping.sourceIslandOp) {
      throw new PassageInvalid("source_required", "a passage must name its rebuilt departure island");
    }
    if (!mapping.prediction) {
      throw new PassageInvalid("prediction_required", "a passage requires a falsifiable prediction");
    }
    if (!mapping.boundary) {
      throw new PassageInvalid("boundary_required", "a passage requires the important difference or analogy boundary");
    }
    if (mapping.sourceIslandOp === mapping.islandOp) {
      throw new PassageInvalid("same_island", "departure and destination must be different islands");
    }

    const structure = this.getStructure(structSlugOf(mapping.structureId));
    if (!structure || structure.object.id !== mapping.structureId) {
      throw new NotFound(`structure ${mapping.structureId}`);
    }
    const source = this.getProblemRow(slugOf(mapping.sourceIslandOp));
    if (!source || source.opId !== mapping.sourceIslandOp) {
      throw new NotFound(`departure ${mapping.sourceIslandOp}`);
    }

    // The irreducible mapping act is human. A pair is allowed because it
    // contains a ratifying human; a lone agent is never allowed to finalize.
    if (actor.kind === "agent") throw new GatewayDenied("rebuild");
    const sourceRole = this.memberRole(source.opId, actor.id);
    const capActor = { id: actor.id, kind: actor.kind, role: sourceRole };
    if (!can(capActor, "rebuild", this.grantsFor(source.opId, actor.id))) {
      throw new GatewayDenied("rebuild");
    }

    const hasEdge = (opId: string): boolean => this.getEvents(opId).some((event) => {
      if (event.action !== "rebuild" || !event.ref) return false;
      const ref = this.getRef(event.ref);
      if (ref?.kind !== "mapping" || !ref.content || typeof ref.content !== "object") return false;
      return (ref.content as { structureId?: unknown }).structureId === mapping.structureId;
    });
    if (!hasEdge(source.opId)) {
      throw new PassageInvalid(
        "source_unverified",
        "the departure island has no recorded rebuild edge for this structure",
      );
    }
    const passageKind: RebuildPassageResult["passageKind"] = hasEdge(target.opId) ? "charted" : "frontier";

    let result: RebuildPassageResult | undefined;
    const tx = this.db.transaction(() => {
      const ref = this.putRef("mapping", mapping);
      const event = this.appendRaw(target.opId, {
        ts: input.ts ?? new Date().toISOString(),
        op: target.opId as ProblemObject["id"],
        actor,
        credit: input.credit ?? ["credit:human/conceptualization"],
        phase: "B",
        action: "rebuild",
        ref,
      });
      this.addPlacement(target.opId, "dock", ref, {
        action: "rebuild",
        actorId: actor.id,
        structureId: mapping.structureId,
        sourceIslandOp: source.opId,
        passageKind,
        hash: hashEvent(event),
      });
      result = {
        event,
        degraded: false,
        effectiveAction: "rebuild",
        refHash: ref,
        passageKind,
        structureId: mapping.structureId,
        sourceIslandOp: source.opId,
        targetIslandOp: target.opId,
      };
    });
    tx();
    if (!result) throw new ChainError("rebuild passage transaction did not complete");
    return result;
  }

  /**
   * Record a source-preserving cross-island support/refutation. The ledger event
   * points to a response artifact; that artifact retains the target claim ref,
   * body, discriminating test, and evidence descriptor. The entire gateway write
   * is transactional, so a denied/invalid response cannot leave an orphan ref.
   */
  respondToConnection(slug: string, input: ConnectionResponseInput): ConnectionResponseResult {
    const responding = this.getProblemRow(slug);
    if (!responding) throw new NotFound(slug);

    const targetRef = input.targetRef?.trim();
    if (!targetRef) throw new ConnectionResponseInvalid("target_required", "a response requires a target ref");
    const body = input.body?.trim();
    if (!body) throw new ConnectionResponseInvalid("body_required", "a response requires a concrete argument");
    const test = input.test?.trim();
    if (!test) throw new ConnectionResponseInvalid("test_required", "a response requires a discriminating test");
    if (input.language !== undefined && input.language !== "zh" && input.language !== "en") {
      throw new ConnectionResponseInvalid("language_invalid", "language must be zh or en");
    }

    // A response may target an anchored claim/publication (dossier v1) or a
    // bridge artifact (bridge-challenge v1): a bridge is an authored,
    // content-addressed correspondence assertion, challengeable exactly like
    // a claim. Mechanism/lineage targets stay closed until their contracts.
    const anchors = this.listProblemRows()
      .flatMap((row) =>
        this.getEvents(row.opId)
          .filter(
            (event) =>
              event.ref === targetRef &&
              (event.action === "submit_claim" ||
                event.action === "publish" ||
                // bridge artifacts arrive on a `bridge_artifact` event (MCP /
                // gateway) or riding a human `transplant` (B.3 dock path) —
                // both anchor the same challengeable correspondence artifact.
                event.action === "bridge_artifact" ||
                event.action === "transplant"),
          )
          .map((event) => ({ row, event })),
      )
      .sort(
        (a, b) =>
          a.event.ts.localeCompare(b.event.ts) ||
          a.row.opId.localeCompare(b.row.opId),
      );
    const anchor = anchors[0];
    if (!anchor || !this.getRef(targetRef)) {
      throw new ConnectionResponseInvalid(
        "target_unanchored",
        "the target ref is not an anchored claim, publication, or bridge artifact",
      );
    }
    if (anchor.row.opId === responding.opId) {
      throw new ConnectionResponseInvalid("same_island", "a connection response must come from another island");
    }

    const payload = {
      targetRef,
      body,
      test,
      ...(input.language ? { language: input.language } : {}),
      evidence: input.evidence,
    };
    let gatewayResult: GatewayResult | undefined;
    const tx = this.db.transaction(() => {
      gatewayResult = this.gateway(responding.opId, {
        actor: input.actor,
        gatewayAction: input.action,
        phase: "D",
        credit: input.credit ?? ["credit:human/validation"],
        payload,
        refKind: "note",
        station: "workshop",
        placementMeta: {
          targetRef,
          sourceIslandOp: anchor.row.opId,
          responseKind: "connection",
        },
        ts: input.ts,
      });
    });
    tx();
    if (!gatewayResult?.refHash) throw new ChainError("connection response transaction did not complete");
    return {
      ...gatewayResult,
      targetRef,
      responseRef: gatewayResult.refHash,
      sourceIslandOp: anchor.row.opId,
      respondingIslandOp: responding.opId,
    };
  }

  // --- ledger ---------------------------------------------------------------

  getEvents(opId: string): LedgerEvent[] {
    const rows = this.db
      .prepare("SELECT json FROM ledger_events WHERE op_id = ? ORDER BY seq")
      .all(opId) as Array<{ json: string }>;
    return rows.map((r) => JSON.parse(r.json) as LedgerEvent);
  }

  lastHash(opId: string): string | undefined {
    const row = this.db
      .prepare("SELECT hash FROM ledger_events WHERE op_id = ? ORDER BY seq DESC LIMIT 1")
      .get(opId) as { hash: string } | undefined;
    return row?.hash;
  }

  /**
   * Append-only, hash-chained write. `prev` is always the current head hash;
   * the chain can never be broken by this path. If `expectPrev` is supplied it
   * must equal the head (optimistic concurrency), else {@link ChainError}.
   * The event is validated by LedgerEventSchema before insertion.
   */
  appendRaw(opId: string, partial: UnchainedEvent, expectPrev?: string): LedgerEvent {
    const prev = this.lastHash(opId);
    if (expectPrev !== undefined && expectPrev !== (prev ?? "")) {
      throw new ChainError(`prev mismatch: expected head ${prev ?? "<genesis>"}, got ${expectPrev}`);
    }
    const event = LedgerEventSchema.parse({ ...partial, prev });
    const hash = hashEvent(event);
    this.db
      .prepare("INSERT INTO ledger_events (op_id, hash, prev, json) VALUES (?, ?, ?, ?)")
      .run(opId, hash, prev ?? null, JSON.stringify(event));
    return event;
  }

  verify(opId: string) {
    return verifyChain(this.getEvents(opId));
  }

  // --- place plane ----------------------------------------------------------

  createStations(opId: string, layout = DEFAULT_STATION_LAYOUT): void {
    const stmt = this.db.prepare(
      "INSERT OR IGNORE INTO stations (op_id, kind, gx, gy, level) VALUES (?, ?, ?, ?, ?)",
    );
    for (const kind of STATION_KINDS) {
      const p = layout[kind];
      stmt.run(opId, kind, p.gx, p.gy, 1);
    }
  }

  getStations(opId: string): StationRow[] {
    const rows = this.db
      .prepare("SELECT kind, gx, gy, level FROM stations WHERE op_id = ?")
      .all(opId) as Array<{ kind: string; gx: number; gy: number; level: number }>;
    return rows.map((r) => ({ kind: r.kind as StationKind, gx: r.gx, gy: r.gy, level: r.level }));
  }

  addPlacement(
    opId: string,
    station: StationKind,
    refHashValue: string | null,
    meta: Record<string, unknown>,
  ): number {
    const info = this.db
      .prepare("INSERT INTO placements (op_id, station, ref_hash, meta_json) VALUES (?, ?, ?, ?)")
      .run(opId, station, refHashValue, JSON.stringify(meta));
    return Number(info.lastInsertRowid);
  }

  getPlacements(opId: string, station?: StationKind) {
    const rows = station
      ? (this.db
          .prepare("SELECT id, station, ref_hash, meta_json FROM placements WHERE op_id = ? AND station = ? ORDER BY id")
          .all(opId, station) as Array<{ id: number; station: string; ref_hash: string | null; meta_json: string }>)
      : (this.db
          .prepare("SELECT id, station, ref_hash, meta_json FROM placements WHERE op_id = ? ORDER BY id")
          .all(opId) as Array<{ id: number; station: string; ref_hash: string | null; meta_json: string }>);
    return rows.map((r) => ({
      id: r.id,
      station: r.station as StationKind,
      refHash: r.ref_hash,
      meta: JSON.parse(r.meta_json) as Record<string, unknown>,
    }));
  }

  addMembership(opId: string, m: MembershipRow): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO memberships (op_id, actor_id, actor_kind, role, ai_kind)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(opId, m.actorId, m.kind, m.role, m.aiKind);
  }

  getMemberships(opId: string): MembershipRow[] {
    const rows = this.db
      .prepare("SELECT actor_id, actor_kind, role, ai_kind FROM memberships WHERE op_id = ? ORDER BY actor_id")
      .all(opId) as Array<{ actor_id: string; actor_kind: string; role: string | null; ai_kind: string | null }>;
    // Presence-shaped: identity + role only. Never online-duration (克制原则).
    return rows.map((r) => ({
      actorId: r.actor_id,
      kind: r.actor_kind,
      role: r.role,
      aiKind: r.ai_kind,
    }));
  }

  memberRole(opId: string, actorId: string): Role | undefined {
    const row = this.db
      .prepare("SELECT role FROM memberships WHERE op_id = ? AND actor_id = ?")
      .get(opId, actorId) as { role: string | null } | undefined;
    return (row?.role ?? undefined) as Role | undefined;
  }

  grantsFor(opId: string, agentId: string): string[] {
    const rows = this.db
      .prepare("SELECT capability FROM capability_grants WHERE op_id = ? AND agent_id = ?")
      .all(opId, agentId) as Array<{ capability: string }>;
    return rows.map((r) => r.capability);
  }

  addGrant(opId: string, agentId: string, capability: string, grantedBy: string, eventHash: string): void {
    this.db
      .prepare(
        `INSERT OR IGNORE INTO capability_grants (op_id, agent_id, capability, granted_by, event_hash)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(opId, agentId, capability, grantedBy, eventHash);
  }

  /** Cross-island place-plane footprint (depth-plan-v1 §3(d) My Harbor):
   * island SLUGS where the actor holds a membership or a capability grant.
   * `core/harbor.ts` deliberately stays network/DB-free and asks its caller
   * to assemble the footprint — this is that assembly, done where it is one
   * indexed query instead of N `islandDetail` round-trips. */
  actorFootprint(actorId: string): string[] {
    const rows = this.db
      .prepare(
        `SELECT DISTINCT p.slug AS slug FROM problem_objects p
         WHERE p.op_id IN (SELECT op_id FROM memberships WHERE actor_id = ?)
            OR p.op_id IN (SELECT op_id FROM capability_grants WHERE agent_id = ?)
         ORDER BY p.slug`,
      )
      .all(actorId, actorId) as Array<{ slug: string }>;
    return rows.map((r) => r.slug);
  }

  // --- capability gateway ---------------------------------------------------

  /**
   * The single write path for knowledge events (§4 AI governance, invariant 6).
   * Runs core.can + degradeAction: an ungranted agent push is parked at the dock
   * as a proposal (dock_proposal → a `night_digest` event + a dock placement)
   * rather than denied; a non-degradable denial (e.g. a visitor granting caps)
   * throws {@link GatewayDenied}. Authorized actions pass through to their native
   * ledger ActionType.
   */
  gateway(opId: string, input: GatewayInput): GatewayResult {
    const { actor, gatewayAction } = input;

    // Claims & evidence (§4, Phase B.4): a refute/validate must reference an
    // evidence-role data ref. Judged BEFORE the capability degrade path — an
    // evidence-less refute is rejected outright (record honesty), never parked
    // at the dock as a proposal. Only new writes pass here; appendRaw replay
    // of an existing ledger is untouched (write-side strict, read-side tolerant).
    if ((gatewayAction === "refute" || gatewayAction === "validate") && !hasClaimEvidence(input.payload)) {
      throw new EvidenceRequired(gatewayAction);
    }

    const ts = input.ts ?? new Date().toISOString();
    const role = actor.kind === "agent" ? undefined : this.memberRole(opId, actor.id);
    const capActor = { id: actor.id, kind: actor.kind, role };
    const grants = this.grantsFor(opId, actor.id);

    const allowed = can(capActor, gatewayAction, grants);
    const effective = degradeAction(capActor, gatewayAction, grants);

    const payloadHash =
      input.payload !== undefined
        ? this.putRef(input.refKind ?? "note", input.payload)
        : undefined;

    if (effective === "dock_proposal") {
      const proposal = {
        originalAction: gatewayAction,
        actor,
        payloadHash: payloadHash ?? null,
        payload: input.payload ?? null,
        station: input.station ?? DEFAULT_STATION[gatewayAction] ?? "dock",
        at: ts,
      };
      const proposalHash = this.putRef("dock_proposal", proposal);
      this.addPlacement(opId, "dock", proposalHash, {
        kind: "proposal",
        originalAction: gatewayAction,
        actorId: actor.id,
        dest: proposal.station,
        resolved: false,
      });
      const event = this.appendRaw(
        opId,
        {
          ts,
          op: opId as ProblemObject["id"],
          actor,
          credit: input.credit ?? ["credit:ai/proposal"],
          phase: "A",
          action: "night_digest",
          ref: proposalHash,
        },
        input.expectPrev,
      );
      this.notifyIfNightDigest(opId, event);
      return { event, degraded: true, effectiveAction: "dock_proposal", refHash: payloadHash, proposalHash };
    }

    if (!allowed) throw new GatewayDenied(gatewayAction);

    const action = LEDGER_ACTION[gatewayAction];
    const phase = input.phase ?? DEFAULT_PHASE[gatewayAction];
    const station = input.station ?? DEFAULT_STATION[gatewayAction];

    const event = this.appendRaw(
      opId,
      {
        ts,
        op: opId as ProblemObject["id"],
        actor,
        credit: input.credit ?? [],
        phase,
        action,
        flow: input.flow,
        ref: payloadHash,
      },
      input.expectPrev,
    );

    if (station && payloadHash) {
      this.addPlacement(opId, station, payloadHash, {
        action,
        actorId: actor.id,
        ...(input.placementMeta ?? {}),
      });
    }

    // grant_capability side-effect on the place plane.
    if (gatewayAction === "grant_capability") {
      const p = (input.payload ?? {}) as { agent?: string; capability?: string };
      if (p.agent && p.capability) {
        this.addGrant(opId, p.agent, p.capability, actor.id, hashEvent(event));
      }
    }

    this.notifyIfNightDigest(opId, event);
    return { event, degraded: false, effectiveAction: action, refHash: payloadHash };
  }

  /**
   * Phase B.5: fire-and-forget outbound webhook for `night_digest` ledger
   * events only (§6 interop — "the platform is not an IM"). Both `gateway()`
   * branches funnel through here, right after the ledger write succeeds, so
   * this can never block or fail the write path; a failed push is retried
   * once internally by {@link dispatchNightDigest} and then just warned about.
   * Seed-time history (`seed.ts`) bypasses `gateway()` entirely via
   * `appendRaw`, so replaying/re-seeding never re-fires old digests.
   */
  private notifyIfNightDigest(opId: string, event: LedgerEvent): void {
    if (event.action !== "night_digest") return;
    const slug = slugOf(opId);
    const row = this.getProblemRow(slug);
    const ref = event.ref ? this.getRef(event.ref) : undefined;
    void dispatchNightDigest({
      islandSlug: slug,
      islandName: row?.meta.name ?? row?.object.title ?? slug,
      actorId: event.actor.id,
      refHash: event.ref ?? "",
      ref,
    }).catch((e) => console.warn("[webhook] night digest dispatch threw:", e));
  }

  // --- founding ceremony ----------------------------------------------------

  /**
   * The founding ceremony (§4): builds & validates the problem object via opp,
   * serializes the `.md`, then writes the genesis `found_island` event plus one
   * `propose_subquestion` per question — all hash-chained. The ceremony log is
   * stored as the genesis event's ref. Creates the nine default stations and
   * seats the founder as master. The ceremony IS the head of the ledger.
   */
  foundIsland(input: {
    slug: string;
    title: string;
    name: string;
    qfocus: string;
    domain: string;
    questions: Array<{ text: string; open: boolean; rewrittenFrom?: string }>;
    votes: Record<string, number>;
    ceremonyLog: string[];
    actor: Actor;
    status?: Status;
    chart?: { x: number; y: number; scale: number; activity: number };
    ts?: string;
  }) {
    const opId = opIdFor(input.slug);
    if (this.getProblemRow(input.slug)) throw new ChainError(`island already exists: ${input.slug}`);

    const openQs = input.questions.filter((q) => q.open).map((q) => `- ${q.text}`).join("\n");
    const body = [
      "## Night",
      "",
      `建岛仪式 · ${input.name}。QFT 一轮聚焦为 QFocus。此夜永存于夜晚层。`,
      "",
      "## Open sub-questions",
      "",
      openQs || "- (none yet)",
      "",
    ].join("\n");

    const raw: ProblemObjectInput = {
      schema: "opp/0.2",
      id: opId,
      title: input.title,
      status: input.status ?? "open",
      qfocus: input.qfocus,
    };
    const object = ProblemObjectSchema.parse(raw);
    const parsedBody = parseProblemObject(serializeProblemObject(object, { raw: body })).body;
    const md = serializeProblemObject(object, parsedBody);

    const meta: ProblemMeta = {
      domain: input.domain,
      chart: input.chart ?? { x: 1108, y: 742, scale: 0.8, activity: 5 },
    };

    const tx = this.db.transaction(() => {
      this.insertProblem(object, md, meta);
      this.addMembership(opId, {
        actorId: input.actor.id,
        kind: input.actor.kind,
        role: "master",
        aiKind: null,
      });
      this.createStations(opId);

      const baseTs = input.ts ? new Date(input.ts).getTime() : Date.now();
      let n = 0;
      const nextTs = () => new Date(baseTs + n++ * 1000).toISOString();

      const ceremonyRef = this.putRef("ceremony", {
        name: input.name,
        qfocus: input.qfocus,
        ceremonyLog: input.ceremonyLog,
        votes: input.votes,
      });
      this.appendRaw(opId, {
        ts: nextTs(),
        op: opId as ProblemObject["id"],
        actor: input.actor,
        credit: ["conceptualization"],
        phase: "A",
        action: "found_island",
        ref: ceremonyRef,
      });

      input.questions.forEach((q, idx) => {
        const qRef = this.putRef("question", {
          text: q.text,
          open: q.open,
          rewrittenFrom: q.rewrittenFrom ?? null,
          votes: input.votes[String(idx)] ?? 0,
        });
        const ev = this.appendRaw(opId, {
          ts: nextTs(),
          op: opId as ProblemObject["id"],
          actor: input.actor,
          credit: ["conceptualization"],
          phase: "A",
          action: "propose_subquestion",
          ref: qRef,
        });
        this.addPlacement(opId, "questions", qRef, {
          action: "propose_subquestion",
          open: q.open,
          hash: hashEvent(ev),
        });
      });
    });
    tx();

    return this.islandDetail(input.slug);
  }

  // --- projections / views --------------------------------------------------

  islandSummary(slug: string) {
    const row = this.getProblemRow(slug);
    if (!row) throw new NotFound(slug);
    const events = this.getEvents(row.opId);
    const growth = projectGrowth(events, { status: row.object.status, now: new Date() });
    const tide = computeTide(events);
    const members = Math.max(this.getMemberships(row.opId).length, row.meta.chart.members ?? 0);
    return {
      opId: row.opId,
      slug: row.slug,
      title: row.object.title,
      name: row.meta.name ?? row.object.title,
      qfocus: row.object.qfocus,
      domain: row.meta.domain,
      status: row.object.status,
      lineage: row.object.lineage,
      chart: row.meta.chart,
      growth,
      tide,
      members,
      activity: row.meta.chart.activity,
    };
  }

  listIslands() {
    return this.listProblemRows().map((r) => this.islandSummary(r.slug));
  }

  islandDetail(slug: string) {
    const row = this.getProblemRow(slug);
    if (!row) throw new NotFound(slug);
    const events = this.getEvents(row.opId);
    const parsed = parseProblemObject(row.md);
    return {
      opId: row.opId,
      slug: row.slug,
      object: parsed.object,
      body: parsed.body,
      md: row.md,
      domain: row.meta.domain,
      chart: row.meta.chart,
      atlas: row.meta.atlas,
      stations: this.getStations(row.opId),
      memberships: this.getMemberships(row.opId),
      growth: projectGrowth(events, { status: parsed.object.status, now: new Date() }),
      tide: computeTide(events),
      insight: transplantInsight(events),
      contributions: projectContributions(events),
      eventCount: events.length,
      morningReport: this.morningReport(row.opId),
    };
  }

  /** Ledger stream with resolved ref payloads joined in (for night replay). */
  eventStream(slug: string, upTo?: number) {
    const row = this.getProblemRow(slug);
    if (!row) throw new NotFound(slug);
    const events = this.getEvents(row.opId);
    const replay = projectNightReplay(events, upTo);
    const enriched = replay.map((s) => ({
      index: s.index,
      event: s.event,
      ghost: s.ghost,
      ref: s.event.ref ? this.getRef(s.event.ref) : undefined,
    }));
    return { opId: row.opId, total: events.length, slices: enriched };
  }

  // --- morning report (dock HITL) ------------------------------------------

  /**
   * Dock inbox for the morning-report HITL panel — reduces the ledger via
   * `@frontier-isles/core`'s {@link projectMorningReport} (Phase B.1: drafted
   * from the real ledger, not seeds). `since` is pinned to the epoch rather
   * than the projection's own 24h default: the dock is a standing inbox, not
   * a strict "last night only" view — the seed's 3 drafts date to night
   * 70-72 while "now" anchors near night 86, and a human curator should
   * still see an unresolved draft days later. Only `status: "pending"`
   * entries are returned on the wire: once resolved a draft leaves the inbox
   * (adopted → its destination station; returned → driftwood) — the HITL
   * decision itself stays on the ledger forever, just no longer here.
   */
  morningReport(opId: string) {
    const events = this.getEvents(opId);
    const entries: MorningReportEntry[] = projectMorningReport(events, {
      resolveRef: (ref) => this.getRef(ref),
      since: EPOCH,
    });
    return entries
      .filter((e) => e.status === "pending")
      .map((e) => ({
        refHash: e.eventRef,
        title: e.title,
        dest: e.dest,
        actorId: e.actorId,
        actorKind: e.actorKind,
        credit: e.credit,
        ts: e.ts,
      }));
  }

  /** Adopt (joint human+AI credit) or return a dock draft — full HITL into ledger. */
  resolveMorningReport(
    slug: string,
    refHashValue: string,
    decision: "adopt" | "return",
    actor: Actor,
    ts?: string,
  ): GatewayResult {
    const row = this.getProblemRow(slug);
    if (!row) throw new NotFound(slug);
    const opId = row.opId;
    const draftEvent = this.getEvents(opId).find(
      (e) => e.action === "night_digest" && e.ref === refHashValue,
    );
    if (!draftEvent) throw new NotFound(`draft ${refHashValue}`);
    const ref = this.getRef(refHashValue);
    const content = (ref?.content ?? {}) as { credit?: string[]; dest?: string; station?: string };
    const when = ts ?? new Date().toISOString();

    // Mark any dock placement resolved.
    for (const pl of this.getPlacements(opId, "dock")) {
      if (pl.refHash === refHashValue && pl.meta.resolved === false) {
        this.db
          .prepare("UPDATE placements SET meta_json = ? WHERE id = ?")
          .run(JSON.stringify({ ...pl.meta, resolved: true, decision }), pl.id);
      }
    }

    if (decision === "adopt") {
      // The draft's real AI role: the night_digest EVENT's credit is the
      // write-time truth (MCP-filed drafts carry credit only there); seeded
      // refs may also embed it in content. Only a draft with neither falls
      // back to the generic synthesis tag (B.1 caveat closed 2026-07-19).
      const eventAi = (draftEvent.credit ?? []).filter((c) => c.startsWith("credit:ai/"));
      const contentAi = (content.credit ?? []).filter((c) => c.startsWith("credit:ai/"));
      const aiCredit = eventAi.length ? eventAi : contentAi;
      const credit = Array.from(new Set(["curation", ...(aiCredit.length ? aiCredit : ["credit:ai/synthesis"])]));
      const event = this.appendRaw(opId, {
        ts: when,
        op: opId as ProblemObject["id"],
        actor: { id: actor.id, kind: "pair" },
        credit,
        phase: "D",
        action: "adopt",
        ref: refHashValue,
      });
      const dest = (content.dest ?? content.station ?? "gallery") as StationKind;
      this.addPlacement(opId, dest, refHashValue, { action: "adopt", actorId: actor.id, from: "dock" });
      return { event, degraded: false, effectiveAction: "adopt", refHash: refHashValue };
    }

    // The ledger event refs the ORIGINAL draft (ghost/timeline truth); the
    // place plane receives a REAL driftwood atom carrying `returnedFrom`, so
    // returned material actually reappears in the Garden as rework material
    // (listDriftwood/transplant require driftwood-kind refs — placing the
    // morning_report ref made returns silently invisible).
    const titled = content as { title?: string };
    let driftwoodRef = "";
    let event!: LedgerEvent;
    const returnTx = this.db.transaction(() => {
      driftwoodRef = this.putRef("driftwood", {
        atom: "thought",
        text: typeof titled.title === "string" && titled.title ? titled.title : refHashValue,
        returnedFrom: refHashValue,
      });
      event = this.appendRaw(opId, {
        ts: when,
        op: opId as ProblemObject["id"],
        actor,
        credit: ["curation"],
        phase: "A",
        action: "return_to_driftwood",
        ref: refHashValue,
      });
      this.addPlacement(opId, "driftwood", driftwoodRef, { action: "return_to_driftwood", returnedFrom: refHashValue, actorId: actor.id });
    });
    returnTx();
    return { event, degraded: false, effectiveAction: "return_to_driftwood", refHash: refHashValue };
  }

  /**
   * Falsification → Driftwood (Phase C 8 / §3.10 "route failed tests back
   * into the working space"). When an artifact anchored on THIS island has a
   * refutation on record anywhere in the archipelago, the island's humans may
   * return it to the Garden: one canonical `return_to_driftwood` event refs
   * the ORIGINAL artifact (claim ghost + timeline marker semantics untouched),
   * while the place plane receives a fresh `contradiction` driftwood atom
   * carrying `returnedFrom` — the mirror of transplant's `onceDriftwood` mark,
   * so falsified material re-enters the rework cycle instead of vanishing.
   * Human-only finalization (AI proposes, never recycles formal material).
   */
  returnFalsified(
    slug: string,
    input: { targetRef: string; actor: Actor; ts?: string },
  ): GatewayResult & { driftwoodRef: string } {
    const row = this.getProblemRow(slug);
    if (!row) throw new NotFound(slug);
    const opId = row.opId;
    const targetRef = input.targetRef?.trim();
    if (!targetRef) throw new ConnectionResponseInvalid("target_required", "a return requires a target ref");

    const anchored = this.getEvents(opId).some(
      (event) =>
        event.ref === targetRef &&
        (event.action === "submit_claim" ||
          event.action === "publish" ||
          event.action === "bridge_artifact" ||
          event.action === "transplant"),
    );
    const targetContent = this.getRef(targetRef);
    if (!anchored || !targetContent) {
      throw new ConnectionResponseInvalid("target_unanchored", "the target ref is not anchored on this island");
    }

    const resolver = (ref: string) => this.getRef(ref) ?? null;
    const refuted = this.listProblemRows().some((problem) =>
      this.getEvents(problem.opId).some(
        (event) => event.action === "refute" && semanticRefEvent(event, resolver)?.targetRef === targetRef,
      ),
    );
    if (!refuted) {
      throw new ConnectionResponseInvalid("not_falsified", "the target has no refutation on record");
    }
    if (this.getEvents(opId).some((event) => event.action === "return_to_driftwood" && event.ref === targetRef)) {
      throw new ConnectionResponseInvalid("already_returned", "the target was already returned to driftwood");
    }

    if (input.actor.kind === "agent") throw new GatewayDenied("return_to_driftwood");
    const role = this.memberRole(opId, input.actor.id);
    const capActor = { id: input.actor.id, kind: input.actor.kind, role };
    if (!can(capActor, "return_to_driftwood", this.grantsFor(opId, input.actor.id))) {
      throw new GatewayDenied("return_to_driftwood");
    }

    const content = (targetContent.content ?? {}) as { title?: string; text?: string; body?: string };
    const text =
      [content.title, content.text, content.body].find((value) => typeof value === "string" && value.length > 0) ??
      targetRef;
    const when = input.ts ?? new Date().toISOString();
    let driftwoodRef = "";
    let event!: LedgerEvent;
    const tx = this.db.transaction(() => {
      driftwoodRef = this.putRef("driftwood", { atom: "contradiction", text, returnedFrom: targetRef });
      event = this.appendRaw(opId, {
        ts: when,
        op: opId as ProblemObject["id"],
        actor: input.actor,
        credit: ["curation"],
        phase: "A",
        action: "return_to_driftwood",
        ref: targetRef,
      });
      this.addPlacement(opId, "driftwood", driftwoodRef, { action: "return_to_driftwood", returnedFrom: targetRef, actorId: input.actor.id });
    });
    tx();
    return { event, degraded: false, effectiveAction: "return_to_driftwood", refHash: targetRef, driftwoodRef };
  }

  // --- transplant-through-dock (Phase B.3) ---------------------------------

  /**
   * The driftwood atoms currently available to transplant — real driftwood
   * refs placed in the Garden (not the returned-to-driftwood ghosts, which
   * carry a `ghost` meta). Resolved server-side so the web picker shows the
   * atom text without N ref round-trips; deduped by ref hash.
   */
  listDriftwood(opId: string): Array<{ refHash: string; atom: string; text: string; actorId: string }> {
    const seen = new Set<string>();
    const out: Array<{ refHash: string; atom: string; text: string; actorId: string }> = [];
    for (const pl of this.getPlacements(opId, "driftwood")) {
      if (!pl.refHash || pl.meta.ghost || seen.has(pl.refHash)) continue;
      const ref = this.getRef(pl.refHash);
      if (ref?.kind !== "driftwood") continue;
      const c = (ref.content ?? {}) as { atom?: string; text?: string };
      seen.add(pl.refHash);
      out.push({
        refHash: pl.refHash,
        atom: c.atom ?? "thought",
        text: c.text ?? "",
        actorId: (pl.meta.actorId as string) ?? "",
      });
    }
    return out;
  }

  /**
   * Transplant a driftwood atom through the Ferry Dock into a formal station
   * (architecture.md §4, Phase B.3). "transplant 移栽 always passes the dock,
   * forming one of the four bridge artifacts; 'once driftwood' marks persist."
   *
   * Human-only by construction — the ONLY path into a formal station is a human
   * transplant (§4). We reuse core's `can()` role ladder: `station_write`
   * (researcher+); an apprentice/visitor is denied ({@link GatewayDenied} → 403).
   * A lone agent has no role and no `station_write`, so this path denies it too
   * (and there is deliberately no MCP transplant tool — see mcp.ts).
   *
   * Writes EXACTLY ONE `transplant` event whose `ref` is the freshly-formed
   * `bridge_artifact` (its content carries `onceDriftwood` + the four-type + the
   * dest — never inlined into the event). The place plane then records the
   * pass-through: one placement at the dock, one at the target station.
   */
  transplant(
    slug: string,
    input: {
      driftwoodRef: string;
      type: BridgeArtifactType;
      dest: StationKind;
      body?: string;
      flow?: FlowType;
      actor: Actor;
      credit?: string[];
      ts?: string;
    },
  ): GatewayResult {
    const row = this.getProblemRow(slug);
    if (!row) throw new NotFound(slug);
    const opId = row.opId;

    // Source must be a real driftwood atom.
    const src = this.getRef(input.driftwoodRef);
    if (!src || src.kind !== "driftwood") throw new NotFound(`driftwood ${input.driftwoodRef}`);

    // Capability: human role ladder `station_write` (researcher+); agents never transplant.
    const role = input.actor.kind === "agent" ? undefined : this.memberRole(opId, input.actor.id);
    const capActor = { id: input.actor.id, kind: input.actor.kind, role };
    if (!can(capActor, "transplant", this.grantsFor(opId, input.actor.id))) {
      throw new GatewayDenied("transplant");
    }

    // Pure data shape (throws on a bad type / target — surfaces as a 400 via ZodError-less Error → 500 guard;
    // the web only ever passes valid enums, and the endpoint validates before calling).
    const build = buildTransplant({
      driftwoodRef: input.driftwoodRef,
      type: input.type,
      dest: input.dest,
      body: input.body,
      flow: input.flow,
    });

    const when = input.ts ?? new Date().toISOString();
    const artifactRef = this.putRef("bridge_artifact", build.artifact);
    const event = this.appendRaw(opId, {
      ts: when,
      op: opId as ProblemObject["id"],
      actor: input.actor,
      credit: input.credit ?? ["conceptualization"],
      phase: build.event.phase,
      action: "transplant",
      flow: build.event.flow,
      ref: artifactRef,
    });

    // Place plane (regenerable): the artifact passes THROUGH the dock, then lands
    // at the target formal station. Two placements, still one ledger event.
    this.addPlacement(opId, "dock", artifactRef, {
      action: "transplant",
      actorId: input.actor.id,
      dest: input.dest,
      onceDriftwood: input.driftwoodRef,
      pass: true,
    });
    this.addPlacement(opId, input.dest, artifactRef, {
      action: "transplant",
      actorId: input.actor.id,
      from: "dock",
      onceDriftwood: input.driftwoodRef,
    });

    return { event, degraded: false, effectiveAction: "transplant", refHash: artifactRef };
  }

  // --- sessions -------------------------------------------------------------

  createSession(handle: string): { token: string; actor: Actor } {
    const token = randomToken();
    const actor: Actor = { id: `github:${handle}`, kind: "human" };
    this.db
      .prepare(
        "INSERT INTO sessions (token, actor_id, actor_kind, handle, created_at) VALUES (?, ?, ?, ?, ?)",
      )
      .run(token, actor.id, actor.kind, handle, new Date().toISOString());
    return { token, actor };
  }

  sessionActor(token: string | undefined): Actor | undefined {
    if (!token) return undefined;
    const row = this.db
      .prepare("SELECT actor_id, actor_kind FROM sessions WHERE token = ?")
      .get(token) as { actor_id: string; actor_kind: string } | undefined;
    return row ? { id: row.actor_id, kind: row.actor_kind as Actor["kind"] } : undefined;
  }

  deleteSession(token: string | undefined): void {
    if (!token) return;
    this.db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

export function slugOf(opId: string): string {
  const m = /\/prob\/([^/]+)$/.exec(opId);
  return m?.[1] ?? opId;
}

/** Last path segment of a `struct://<org>/<slug>` id. */
export function structSlugOf(structId: string): string {
  const m = /\/([^/]+)$/.exec(structId);
  return m?.[1] ?? structId;
}

function randomToken(): string {
  return randomBytes(32).toString("hex");
}

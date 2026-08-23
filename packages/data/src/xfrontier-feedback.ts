/**
 * Pure xFrontier feedback exchange contract.
 *
 * This module validates local intent and normalizes the two read-only ledger
 * views. It deliberately has no transport, filesystem, SDK, or execute method:
 * producing a tool intent and actually calling the non-idempotent MCP write
 * tool are separate authorization boundaries.
 */

import { createHash } from 'node:crypto';

/** Phase 18 compatibility contract. It can still be inspected and normalized,
 * but it cannot express the conditional/idempotent xFrontier 0.6 write. */
export const XFRONTIER_FEEDBACK_SCHEMA_VERSION_V1 = 'xfrontier-feedback-envelope/v1' as const;
/** Conditional xFrontier 0.6 write contract. */
export const XFRONTIER_FEEDBACK_SCHEMA_VERSION_V2 = 'xfrontier-feedback-envelope/v2' as const;
/** @deprecated Use the explicit V1 or V2 constant for new code. Retained so
 * Phase 18 callers keep constructing the reviewed legacy envelope. */
export const XFRONTIER_FEEDBACK_SCHEMA_VERSION = XFRONTIER_FEEDBACK_SCHEMA_VERSION_V1;
export const XFRONTIER_FEEDBACK_STATE_SCHEMA_VERSION = 'xfrontier-feedback-state/v1' as const;
export const XFRONTIER_FEEDBACK_DIFF_SCHEMA_VERSION = 'xfrontier-feedback-diff/v1' as const;

export type XFrontierFeedbackKind = 'finding' | 'annotation' | 'structure_link';
export type XFrontierFindingScale = 'record' | 'field' | 'population';

interface XFrontierFeedbackSourceBase {
  system: 'frontier-isles';
  /** Stable local ledger/event/ref that lets a human recover the source claim. */
  ledgerRef: string;
  /** Checkable evidence, also mapped to MCP tools that accept evidence. */
  evidence: string;
}

/** At least one machine-verifiable local evidence anchor is required. */
export type XFrontierFeedbackSource = XFrontierFeedbackSourceBase & (
  | { ledgerEventHash: string; refHash?: string }
  | { ledgerEventHash?: string; refHash: string }
);

export interface XFrontierFeedbackTarget {
  /** The corpus version against which the feedback was established. */
  datasetVersion: string;
}

export interface XFrontierFeedbackTargetV2 extends XFrontierFeedbackTarget {
  /** xFrontier's eight-lowercase-hex hash for one active target record. It is
   * mandatory for proposals, optional for record findings, and meaningless for
   * field/population findings. */
  expectedContentHash?: string;
}

interface FeedbackEnvelopeBase<TSchema extends string, TTarget extends XFrontierFeedbackTarget> {
  schemaVersion: TSchema;
  /** Stable local key. In v2 this is sent verbatim as `client_event_id`; there
   * is deliberately no second remote identity field that could drift. */
  idempotencyKey: string;
  source: XFrontierFeedbackSource;
  target: TTarget;
}

export interface XFrontierRecordFindingPayload {
  kind: 'finding';
  scale: 'record';
  recordId: number;
  findingKind: string;
  statement: string;
  by: string;
  filedBy: string | null;
}

export interface XFrontierFieldFindingPayload {
  kind: 'finding';
  scale: 'field';
  field: string;
  findingKind: string;
  statement: string;
  by: string;
  filedBy: string | null;
}

export interface XFrontierPopulationFindingPayload {
  kind: 'finding';
  scale: 'population';
  predicate: string;
  n: number;
  findingKind: string;
  statement: string;
  by: string;
  filedBy: string | null;
}

export type XFrontierFindingPayload =
  | XFrontierRecordFindingPayload
  | XFrontierFieldFindingPayload
  | XFrontierPopulationFindingPayload;

export interface XFrontierAnnotationPayload {
  kind: 'annotation';
  recordId: number;
  field: string;
  value: string;
  rationale: string;
  confidence: number;
  by: string;
}

export interface XFrontierStructureLinkPayload {
  kind: 'structure_link';
  recordId: number;
  structureId: string;
  rationale: string;
  confidence: number;
  by: string;
}

export type XFrontierFeedbackPayload =
  | XFrontierFindingPayload
  | XFrontierAnnotationPayload
  | XFrontierStructureLinkPayload;

export type XFrontierFeedbackEnvelopeV1 = FeedbackEnvelopeBase<
  typeof XFRONTIER_FEEDBACK_SCHEMA_VERSION_V1,
  XFrontierFeedbackTarget
> & {
  payload: XFrontierFeedbackPayload;
};

export type XFrontierFeedbackEnvelopeV2 = FeedbackEnvelopeBase<
  typeof XFRONTIER_FEEDBACK_SCHEMA_VERSION_V2,
  XFrontierFeedbackTargetV2
> & {
  payload: XFrontierFeedbackPayload;
};

export type XFrontierFeedbackEnvelope = XFrontierFeedbackEnvelopeV1 | XFrontierFeedbackEnvelopeV2;

export type XFrontierFeedbackToolName =
  | 'report_finding'
  | 'propose_annotation'
  | 'propose_structure_link';

interface XFrontierFeedbackToolIntentBase {
  /** Data only. There is intentionally no execute/call function in this type. */
  toolName: XFrontierFeedbackToolName;
  arguments: Record<string, string | number | null>;
  idempotencyKey: string;
  /** Local provenance retained beside the remote args; not sent as extra MCP keys. */
  source: XFrontierFeedbackSource;
  targetDatasetVersion: string;
  requiresExplicitSubmission: true;
}

/** Legacy 0.5 intent. It remains representable for audit/read compatibility,
 * but callers must not treat its local idempotency key as remote enforcement. */
export interface XFrontierFeedbackLegacyToolIntent extends XFrontierFeedbackToolIntentBase {
  remoteIdempotency: 'unsupported';
}

/** Strong 0.6 intent. The request hash covers the exact normalized wire call. */
export interface XFrontierFeedbackStrongToolIntent extends XFrontierFeedbackToolIntentBase {
  clientEventId: string;
  requestHash: string;
  targetContentHash?: string;
  remoteIdempotency: 'client-event-id';
  receiptLookup: true;
}

export type XFrontierFeedbackToolIntent =
  | XFrontierFeedbackLegacyToolIntent
  | XFrontierFeedbackStrongToolIntent;

export class XFrontierFeedbackValidationError extends Error {
  readonly path: string;

  constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = 'XFrontierFeedbackValidationError';
    this.path = path;
  }
}

type UnknownObject = Record<string, unknown>;

const fail = (path: string, message: string): never => {
  throw new XFrontierFeedbackValidationError(path, message);
};

const objectAt = (value: unknown, path: string): UnknownObject => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return fail(path, 'must be an object');
  }
  return value as UnknownObject;
};

const exactKeys = (value: UnknownObject, required: readonly string[], optional: readonly string[], path: string) => {
  const allowed = new Set([...required, ...optional]);
  for (const key of required) {
    if (!(key in value)) fail(`${path}.${key}`, 'is required');
  }
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail(`${path}.${key}`, 'is not allowed');
  }
};

const stringAt = (value: unknown, path: string, min: number, max: number, pattern?: RegExp): string => {
  if (typeof value !== 'string') return fail(path, 'must be a string');
  if (value.length < min || value.length > max) return fail(path, `length must be ${min}..${max}`);
  if (pattern && !pattern.test(value)) return fail(path, `does not match ${pattern}`);
  return value;
};

const booleanAt = (value: unknown, path: string): boolean => {
  if (typeof value !== 'boolean') return fail(path, 'must be a boolean');
  return value;
};

const integerAt = (value: unknown, path: string, minimum = 0): number => {
  if (!Number.isInteger(value) || (value as number) < minimum) {
    return fail(path, `must be an integer >= ${minimum}`);
  }
  return value as number;
};

const numberAt = (value: unknown, path: string, minimum: number, maximum: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
    return fail(path, `must be a finite number in ${minimum}..${maximum}`);
  }
  return value;
};

const nullableStringAt = (value: unknown, path: string, max: number): string | null => {
  if (value === null) return null;
  return stringAt(value, path, 1, max);
};

const arrayAt = (value: unknown, path: string): unknown[] => {
  if (!Array.isArray(value)) return fail(path, 'must be an array');
  return value;
};

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], path: string): T => {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    return fail(path, `must be one of ${allowed.join(', ')}`);
  }
  return value as T;
};

const timestampAt = (value: unknown, path: string): string => {
  const timestamp = stringAt(value, path, 1, 80);
  if (!Number.isFinite(Date.parse(timestamp))) return fail(path, 'must be an ISO-compatible timestamp');
  return timestamp;
};

const datasetVersionAt = (value: unknown, path: string): string =>
  stringAt(value, path, 4, 120, /^xf-[A-Za-z0-9][A-Za-z0-9._-]*$/);

const sha256At = (value: unknown, path: string): string =>
  stringAt(value, path, 71, 71, /^sha256:[0-9a-f]{64}$/);

const contentHashAt = (value: unknown, path: string): string =>
  stringAt(value, path, 8, 8, /^[0-9a-f]{8}$/);

const recordIdAt = (value: unknown, path: string): number => integerAt(value, path, 1);

const actorAt = (value: unknown, path: string): string => stringAt(value, path, 1, 120);
const proseAt = (value: unknown, path: string): string => stringAt(value, path, 1, 4000);

/** Recursively sort object keys while retaining array order and JSON scalar
 * values. This is the shared canonicalization rule for the xFrontier 0.6
 * request fingerprint; non-JSON values fail instead of being silently lost. */
const canonicalizeXFrontierFeedbackJson = (value: unknown, path: string): unknown => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail(path, 'must contain only finite JSON numbers');
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => canonicalizeXFrontierFeedbackJson(item, `${path}[${index}]`));
  }
  if (typeof value === 'object') {
    const input = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    for (const key of Object.keys(input).sort()) {
      if (input[key] === undefined) fail(`${path}.${key}`, 'must not be undefined');
      output[key] = canonicalizeXFrontierFeedbackJson(input[key], `${path}.${key}`);
    }
    return output;
  }
  return fail(path, 'must contain only JSON values');
};

/** Canonical UTF-8 input frozen with xFrontier 0.6: the root has exactly
 * `tool_name` and `arguments`, then every object is recursively key-sorted. */
export function canonicalStringifyXFrontierFeedbackRequest(
  toolName: XFrontierFeedbackToolName,
  args: Record<string, unknown>,
): string {
  return JSON.stringify(canonicalizeXFrontierFeedbackJson({
    tool_name: toolName,
    arguments: args,
  }, '$request'));
}

/** SHA-256 fingerprint over the canonical request's UTF-8 bytes. */
export function hashXFrontierFeedbackRequest(
  toolName: XFrontierFeedbackToolName,
  args: Record<string, unknown>,
): string {
  const canonical = canonicalStringifyXFrontierFeedbackRequest(toolName, args);
  return `sha256:${createHash('sha256').update(canonical, 'utf8').digest('hex')}`;
}

function validateSource(input: unknown): XFrontierFeedbackSource {
  const source = objectAt(input, '$.source');
  exactKeys(source, ['system', 'ledgerRef', 'evidence'], ['ledgerEventHash', 'refHash'], '$.source');
  if (source.system !== 'frontier-isles') fail('$.source.system', 'must equal frontier-isles');
  if (source.ledgerEventHash === undefined && source.refHash === undefined) {
    fail('$.source', 'needs ledgerEventHash or refHash as a durable local evidence anchor');
  }
  const base = {
    system: 'frontier-isles' as const,
    ledgerRef: stringAt(source.ledgerRef, '$.source.ledgerRef', 1, 240),
    evidence: proseAt(source.evidence, '$.source.evidence'),
  };
  if (source.ledgerEventHash !== undefined) {
    return {
      ...base,
      ledgerEventHash: sha256At(source.ledgerEventHash, '$.source.ledgerEventHash'),
      ...(source.refHash === undefined ? {} : { refHash: sha256At(source.refHash, '$.source.refHash') }),
    };
  }
  return { ...base, refHash: sha256At(source.refHash, '$.source.refHash') };
}

function validatePayload(input: unknown): XFrontierFeedbackPayload {
  const payload = objectAt(input, '$.payload');
  const kind = oneOf(payload.kind, ['finding', 'annotation', 'structure_link'], '$.payload.kind');
  if (kind === 'finding') {
    const scale = oneOf(payload.scale, ['record', 'field', 'population'], '$.payload.scale');
    const common = {
      kind: 'finding' as const,
      scale,
      findingKind: stringAt(payload.findingKind, '$.payload.findingKind', 2, 41, /^[a-z][a-z0-9-]{1,40}$/),
      statement: proseAt(payload.statement, '$.payload.statement'),
      by: actorAt(payload.by, '$.payload.by'),
      filedBy: nullableStringAt(payload.filedBy, '$.payload.filedBy', 120),
    };
    if (scale === 'record') {
      exactKeys(payload, ['kind', 'scale', 'recordId', 'findingKind', 'statement', 'by', 'filedBy'], [], '$.payload');
      return { ...common, scale, recordId: recordIdAt(payload.recordId, '$.payload.recordId') };
    }
    if (scale === 'field') {
      exactKeys(payload, ['kind', 'scale', 'field', 'findingKind', 'statement', 'by', 'filedBy'], [], '$.payload');
      return { ...common, scale, field: stringAt(payload.field, '$.payload.field', 1, 120) };
    }
    exactKeys(payload, ['kind', 'scale', 'predicate', 'n', 'findingKind', 'statement', 'by', 'filedBy'], [], '$.payload');
    return {
      ...common,
      scale,
      predicate: stringAt(payload.predicate, '$.payload.predicate', 1, 240),
      n: integerAt(payload.n, '$.payload.n'),
    };
  }

  if (kind === 'annotation') {
    exactKeys(payload, ['kind', 'recordId', 'field', 'value', 'rationale', 'confidence', 'by'], [], '$.payload');
    return {
      kind,
      recordId: recordIdAt(payload.recordId, '$.payload.recordId'),
      field: stringAt(payload.field, '$.payload.field', 2, 41, /^[a-z][a-z0-9_]{1,40}$/),
      value: proseAt(payload.value, '$.payload.value'),
      rationale: proseAt(payload.rationale, '$.payload.rationale'),
      confidence: numberAt(payload.confidence, '$.payload.confidence', 0, 1),
      by: actorAt(payload.by, '$.payload.by'),
    };
  }

  exactKeys(payload, ['kind', 'recordId', 'structureId', 'rationale', 'confidence', 'by'], [], '$.payload');
  const structureId = stringAt(payload.structureId, '$.payload.structureId', 1, 40).trim().toUpperCase();
  if (!structureId) fail('$.payload.structureId', 'must contain a non-whitespace structure id');
  return {
    kind,
    recordId: recordIdAt(payload.recordId, '$.payload.recordId'),
    // The MCP schema intentionally leaves the structure vocabulary open at
    // this layer (1..40 chars); the server resolves it against the current
    // dataset after the same trim+uppercase normalization. Do not bake today's
    // ISO-* inventory here, but hash the exact normalized wire value.
    structureId,
    rationale: proseAt(payload.rationale, '$.payload.rationale'),
    confidence: numberAt(payload.confidence, '$.payload.confidence', 0, 1),
    by: actorAt(payload.by, '$.payload.by'),
  };
}

/** Strictly validate and normalize a local envelope; unknown keys are rejected. */
export function validateXFrontierFeedbackEnvelope(input: unknown): XFrontierFeedbackEnvelope {
  const envelope = objectAt(input, '$');
  exactKeys(envelope, ['schemaVersion', 'idempotencyKey', 'source', 'target', 'payload'], [], '$');
  if (
    envelope.schemaVersion !== XFRONTIER_FEEDBACK_SCHEMA_VERSION_V1
    && envelope.schemaVersion !== XFRONTIER_FEEDBACK_SCHEMA_VERSION_V2
  ) {
    fail(
      '$.schemaVersion',
      `must equal ${XFRONTIER_FEEDBACK_SCHEMA_VERSION_V1} or ${XFRONTIER_FEEDBACK_SCHEMA_VERSION_V2}`,
    );
  }
  const payload = validatePayload(envelope.payload);
  const target = objectAt(envelope.target, '$.target');
  const common = {
    idempotencyKey: stringAt(
      envelope.idempotencyKey,
      '$.idempotencyKey',
      18,
      240,
      /^frontier-isles:[A-Za-z0-9][A-Za-z0-9._:/-]*$/,
    ),
    source: validateSource(envelope.source),
    payload,
  };
  const datasetVersion = datasetVersionAt(target.datasetVersion, '$.target.datasetVersion');
  if (envelope.schemaVersion === XFRONTIER_FEEDBACK_SCHEMA_VERSION_V1) {
    exactKeys(target, ['datasetVersion'], [], '$.target');
    return {
      schemaVersion: XFRONTIER_FEEDBACK_SCHEMA_VERSION_V1,
      ...common,
      target: { datasetVersion },
    };
  }

  exactKeys(target, ['datasetVersion'], ['expectedContentHash'], '$.target');
  const expectedContentHash = target.expectedContentHash === undefined
    ? undefined
    : contentHashAt(target.expectedContentHash, '$.target.expectedContentHash');
  if ((payload.kind === 'annotation' || payload.kind === 'structure_link') && expectedContentHash === undefined) {
    fail('$.target.expectedContentHash', 'is required for annotation and structure_link proposals');
  }
  if (
    payload.kind === 'finding'
    && payload.scale !== 'record'
    && expectedContentHash !== undefined
  ) {
    fail('$.target.expectedContentHash', `is not allowed for ${payload.scale} findings`);
  }
  return {
    schemaVersion: XFRONTIER_FEEDBACK_SCHEMA_VERSION_V2,
    ...common,
    target: {
      datasetVersion,
      ...(expectedContentHash === undefined ? {} : { expectedContentHash }),
    },
  };
}

/**
 * Map validated feedback to the current MCP argument names. This returns inert
 * data only and refuses a stale target dataset. V1 remains an explicitly
 * unsupported-idempotency intent for audit compatibility. V2 adds the exact
 * conditional wire fields and their canonical request hash; callers must still
 * obtain separate authorization before performing either write.
 */
export function toXFrontierFeedbackToolIntent(
  input: unknown,
  currentDatasetVersion: string,
): XFrontierFeedbackToolIntent {
  const envelope = validateXFrontierFeedbackEnvelope(input);
  const current = datasetVersionAt(currentDatasetVersion, 'currentDatasetVersion');
  if (envelope.target.datasetVersion !== current) {
    fail('$.target.datasetVersion', `targets ${envelope.target.datasetVersion}, current MCP dataset is ${current}`);
  }
  const payload = envelope.payload;
  let toolName: XFrontierFeedbackToolName;
  let args: Record<string, string | number | null>;
  if (payload.kind === 'finding') {
    toolName = 'report_finding';
    args = {
      scale: payload.scale,
      kind: payload.findingKind,
      statement: payload.statement,
      evidence: envelope.source.evidence,
      by: payload.by,
      filed_by: payload.filedBy,
    };
    if (payload.scale === 'record') args.record_id = payload.recordId;
    else if (payload.scale === 'field') args.field = payload.field;
    else {
      args.predicate = payload.predicate;
      args.n = payload.n;
    }
  } else if (payload.kind === 'annotation') {
    toolName = 'propose_annotation';
    args = {
      record_id: payload.recordId,
      field: payload.field,
      value: payload.value,
      rationale: payload.rationale,
      confidence: payload.confidence,
      by: payload.by,
    };
  } else {
    toolName = 'propose_structure_link';
    args = {
      record_id: payload.recordId,
      structure_id: payload.structureId,
      evidence: envelope.source.evidence,
      rationale: payload.rationale,
      confidence: payload.confidence,
      by: payload.by,
    };
  }
  const base = {
    toolName,
    idempotencyKey: envelope.idempotencyKey,
    source: envelope.source,
    targetDatasetVersion: current,
    requiresExplicitSubmission: true as const,
  };
  if (envelope.schemaVersion === XFRONTIER_FEEDBACK_SCHEMA_VERSION_V1) {
    return {
      ...base,
      arguments: args,
      remoteIdempotency: 'unsupported',
    };
  }

  const targetContentHash = envelope.target.expectedContentHash;
  const wireArgs: Record<string, string | number | null> = {
    ...args,
    client_event_id: envelope.idempotencyKey,
    expected_dataset_version: current,
    ...(targetContentHash === undefined ? {} : { expected_content_hash: targetContentHash }),
  };
  return {
    ...base,
    arguments: wireArgs,
    clientEventId: envelope.idempotencyKey,
    requestHash: hashXFrontierFeedbackRequest(toolName, wireArgs),
    ...(targetContentHash === undefined ? {} : { targetContentHash }),
    remoteIdempotency: 'client-event-id',
    receiptLookup: true,
  };
}

/** Fail closed when a caller specifically needs the reviewed xFrontier 0.6
 * conditional-write contract. Merely mapping a v1 envelope remains inert. */
export function toXFrontierFeedbackStrongToolIntent(
  input: unknown,
  currentDatasetVersion: string,
): XFrontierFeedbackStrongToolIntent {
  const intent = toXFrontierFeedbackToolIntent(input, currentDatasetVersion);
  if (intent.remoteIdempotency !== 'client-event-id') {
    fail('$.schemaVersion', `${XFRONTIER_FEEDBACK_SCHEMA_VERSION_V1} cannot authorize a strong write`);
  }
  return intent as XFrontierFeedbackStrongToolIntent;
}

export type NormalizedFindingScope =
  | { scale: 'record'; recordId: number; xf: string; recordStatus: 'active' | 'withdrawn' | 'unknown' }
  | { scale: 'field'; field: string }
  | { scale: 'population'; predicate: string; n: number };

export interface NormalizedXFrontierFinding {
  id: string;
  /** Absent on legacy 0.5 ledger records; present as a pair on 0.6 writes. */
  clientEventId?: string;
  requestHash?: string;
  findingKind: string;
  scope: NormalizedFindingScope;
  statement: string;
  evidence: string;
  by: string;
  byType: 'model';
  filedBy?: string | null;
  filedByRecorded: boolean;
  observedAtDatasetVersion: string;
  timestamp: string;
  stale: boolean;
}

export interface NormalizedXFrontierDecision {
  id: string;
  proposalId: string;
  decision: 'accepted' | 'rejected';
  rationale: string;
  by: string;
  byType: 'human' | 'model';
  datasetVersion: string;
  timestamp: string;
}

export interface NormalizedXFrontierProposal {
  id: string;
  /** Absent on legacy 0.5 ledger records; present as a pair on 0.6 writes. */
  clientEventId?: string;
  requestHash?: string;
  proposalKind: 'annotation' | 'structure-link';
  recordId: number;
  field?: string;
  value?: string;
  structureId?: string;
  evidence?: string;
  rationale: string;
  confidence: number;
  by: string;
  byType: 'model';
  datasetVersion: string;
  timestamp: string;
  remoteStatus: 'pending' | 'accepted' | 'rejected';
  decisionHistory: NormalizedXFrontierDecision[];
  humanReviewed: boolean;
  /** Never inferred from remote acceptance; a consumer must record this itself. */
  localDisposition: null;
}

export interface NormalizedXFrontierConflict {
  recordId: number;
  target: string;
  values: string[];
  proposalIds: string[];
}

export interface NormalizedXFrontierFindingsResponse {
  datasetVersion: string;
  total: number;
  staleCount: number;
  items: NormalizedXFrontierFinding[];
}

export interface NormalizedXFrontierProposalsPage {
  datasetVersion: string;
  total: number;
  offset: number;
  items: NormalizedXFrontierProposal[];
  conflicts: NormalizedXFrontierConflict[];
  nextCursor: string | null;
}

const remoteIdAt = (value: unknown, path: string): string => stringAt(value, path, 1, 120);

const normalizeClientRequestMetadata = (
  item: UnknownObject,
  path: string,
): { clientEventId?: string; requestHash?: string } => {
  const hasClientEventId = Object.prototype.hasOwnProperty.call(item, 'client_event_id');
  const hasRequestHash = Object.prototype.hasOwnProperty.call(item, 'request_hash');
  if (hasClientEventId !== hasRequestHash) {
    fail(
      hasClientEventId ? `${path}.request_hash` : `${path}.client_event_id`,
      'must be present together with the other xFrontier 0.6 request identity field',
    );
  }
  if (!hasClientEventId) return {};
  return {
    // Read views may contain records written by clients other than Frontier
    // Isles, so do not impose our local prefix on the remote token.
    clientEventId: stringAt(item.client_event_id, `${path}.client_event_id`, 1, 240),
    requestHash: sha256At(item.request_hash, `${path}.request_hash`),
  };
};

function normalizeFindingScope(input: unknown, path: string): NormalizedFindingScope {
  const scope = objectAt(input, path);
  const scale = oneOf(scope.scale, ['record', 'field', 'population'], `${path}.scale`);
  if (scale === 'record') {
    exactKeys(scope, ['scale', 'record_id', 'xf', 'record_status'], [], path);
    return {
      scale,
      recordId: recordIdAt(scope.record_id, `${path}.record_id`),
      xf: stringAt(scope.xf, `${path}.xf`, 3, 40),
      recordStatus: oneOf(scope.record_status, ['active', 'withdrawn', 'unknown'], `${path}.record_status`),
    };
  }
  if (scale === 'field') {
    exactKeys(scope, ['scale', 'field'], [], path);
    return { scale, field: stringAt(scope.field, `${path}.field`, 1, 120) };
  }
  exactKeys(scope, ['scale', 'predicate', 'n'], [], path);
  return {
    scale,
    predicate: stringAt(scope.predicate, `${path}.predicate`, 1, 240),
    n: integerAt(scope.n, `${path}.n`),
  };
}

/** Normalize the structured content returned by read-only list_findings. */
export function normalizeXFrontierFindingsResponse(input: unknown): NormalizedXFrontierFindingsResponse {
  const response = objectAt(input, '$');
  exactKeys(response, ['dataset_version', 'total', 'stale_count', 'items'], ['store', 'note'], '$');
  const datasetVersion = datasetVersionAt(response.dataset_version, '$.dataset_version');
  const rawItems = arrayAt(response.items, '$.items');
  const items = rawItems.map((raw, index): NormalizedXFrontierFinding => {
    const path = `$.items[${index}]`;
    const item = objectAt(raw, path);
    exactKeys(
      item,
      [
        'kind', 'id', 'finding_kind', 'scope', 'statement', 'evidence', 'by', 'by_type',
        'observed_at_dataset_version', 'timestamp', 'stale', 'filed_by_recorded',
      ],
      ['filed_by', 'client_event_id', 'request_hash'],
      path,
    );
    if (item.kind !== 'finding') fail(`${path}.kind`, 'must equal finding');
    if (item.by_type !== 'model') fail(`${path}.by_type`, 'must equal model');
    const observed = datasetVersionAt(item.observed_at_dataset_version, `${path}.observed_at_dataset_version`);
    const stale = booleanAt(item.stale, `${path}.stale`);
    if (stale !== (observed !== datasetVersion)) fail(`${path}.stale`, 'is inconsistent with dataset versions');
    const filedByRecorded = booleanAt(item.filed_by_recorded, `${path}.filed_by_recorded`);
    if (filedByRecorded && !('filed_by' in item)) fail(`${path}.filed_by`, 'must be present when filed_by_recorded is true');
    if (!filedByRecorded && 'filed_by' in item) fail(`${path}.filed_by`, 'must be absent when filed_by_recorded is false');
    return {
      id: remoteIdAt(item.id, `${path}.id`),
      ...normalizeClientRequestMetadata(item, path),
      findingKind: stringAt(item.finding_kind, `${path}.finding_kind`, 1, 60),
      scope: normalizeFindingScope(item.scope, `${path}.scope`),
      statement: proseAt(item.statement, `${path}.statement`),
      evidence: proseAt(item.evidence, `${path}.evidence`),
      by: actorAt(item.by, `${path}.by`),
      byType: 'model',
      ...(!filedByRecorded ? {} : { filedBy: nullableStringAt(item.filed_by, `${path}.filed_by`, 120) }),
      filedByRecorded,
      observedAtDatasetVersion: observed,
      timestamp: timestampAt(item.timestamp, `${path}.timestamp`),
      stale,
    };
  });
  const total = integerAt(response.total, '$.total');
  const staleCount = integerAt(response.stale_count, '$.stale_count');
  if (total !== items.length) fail('$.total', 'must equal items.length');
  if (staleCount !== items.filter((item) => item.stale).length) fail('$.stale_count', 'does not match items');
  if (new Set(items.map((item) => item.id)).size !== items.length) fail('$.items', 'contains duplicate finding ids');
  return { datasetVersion, total, staleCount, items };
}

function normalizeDecision(input: unknown, path: string, proposalId: string): NormalizedXFrontierDecision {
  const decision = objectAt(input, path);
  exactKeys(
    decision,
    ['kind', 'id', 'proposal_id', 'decision', 'rationale', 'by', 'by_type', 'dataset_version', 'timestamp'],
    [],
    path,
  );
  if (decision.kind !== 'decision') fail(`${path}.kind`, 'must equal decision');
  const normalized: NormalizedXFrontierDecision = {
    id: remoteIdAt(decision.id, `${path}.id`),
    proposalId: remoteIdAt(decision.proposal_id, `${path}.proposal_id`),
    decision: oneOf(decision.decision, ['accepted', 'rejected'], `${path}.decision`),
    rationale: proseAt(decision.rationale, `${path}.rationale`),
    by: actorAt(decision.by, `${path}.by`),
    byType: oneOf(decision.by_type, ['human', 'model'], `${path}.by_type`),
    datasetVersion: datasetVersionAt(decision.dataset_version, `${path}.dataset_version`),
    timestamp: timestampAt(decision.timestamp, `${path}.timestamp`),
  };
  if (normalized.proposalId !== proposalId) fail(`${path}.proposal_id`, `must equal ${proposalId}`);
  return normalized;
}

function normalizeProposal(input: unknown, path: string): NormalizedXFrontierProposal {
  const item = objectAt(input, path);
  if (item.kind !== 'proposal') fail(`${path}.kind`, 'must equal proposal');
  if (item.by_type !== 'model') fail(`${path}.by_type`, 'must equal model');
  const id = remoteIdAt(item.id, `${path}.id`);
  const proposalKind = oneOf(item.proposal_kind, ['annotation', 'structure-link'], `${path}.proposal_kind`);
  const commonKeys = [
    'kind', 'id', 'proposal_kind', 'record_id', 'rationale', 'confidence', 'by', 'by_type',
    'dataset_version', 'timestamp', 'status', 'decisions', 'human_reviewed',
  ];
  exactKeys(
    item,
    proposalKind === 'annotation'
      ? [...commonKeys, 'field', 'value']
      : [...commonKeys, 'structure_id', 'evidence'],
    ['client_event_id', 'request_hash'],
    path,
  );
  const decisions = arrayAt(item.decisions, `${path}.decisions`)
    .map((decision, index) => normalizeDecision(decision, `${path}.decisions[${index}]`, id));
  if (new Set(decisions.map((decision) => decision.id)).size !== decisions.length) {
    fail(`${path}.decisions`, 'contains duplicate decision ids');
  }
  for (let index = 1; index < decisions.length; index += 1) {
    if (Date.parse(decisions[index - 1]!.timestamp) > Date.parse(decisions[index]!.timestamp)) {
      fail(`${path}.decisions`, 'must be ordered oldest to newest');
    }
  }
  const remoteStatus = oneOf(item.status, ['pending', 'accepted', 'rejected'], `${path}.status`);
  const expectedStatus = decisions.at(-1)?.decision ?? 'pending';
  if (remoteStatus !== expectedStatus) fail(`${path}.status`, `must equal latest decision ${expectedStatus}`);
  const humanReviewed = booleanAt(item.human_reviewed, `${path}.human_reviewed`);
  if (humanReviewed !== decisions.some((decision) => decision.byType === 'human')) {
    fail(`${path}.human_reviewed`, 'is inconsistent with decision history');
  }
  const common = {
    id,
    ...normalizeClientRequestMetadata(item, path),
    proposalKind,
    recordId: recordIdAt(item.record_id, `${path}.record_id`),
    rationale: proseAt(item.rationale, `${path}.rationale`),
    confidence: numberAt(item.confidence, `${path}.confidence`, 0, 1),
    by: actorAt(item.by, `${path}.by`),
    byType: 'model' as const,
    datasetVersion: datasetVersionAt(item.dataset_version, `${path}.dataset_version`),
    timestamp: timestampAt(item.timestamp, `${path}.timestamp`),
    remoteStatus,
    decisionHistory: decisions,
    humanReviewed,
    localDisposition: null,
  };
  if (proposalKind === 'annotation') {
    return {
      ...common,
      field: stringAt(item.field, `${path}.field`, 1, 60),
      value: proseAt(item.value, `${path}.value`),
    };
  }
  return {
    ...common,
    structureId: stringAt(item.structure_id, `${path}.structure_id`, 1, 40),
    evidence: proseAt(item.evidence, `${path}.evidence`),
  };
}

function normalizeConflict(input: unknown, path: string): NormalizedXFrontierConflict {
  const conflict = objectAt(input, path);
  exactKeys(conflict, ['record_id', 'target', 'values', 'proposal_ids'], [], path);
  const values = arrayAt(conflict.values, `${path}.values`)
    .map((value, index) => stringAt(value, `${path}.values[${index}]`, 0, 4000));
  const proposalIds = arrayAt(conflict.proposal_ids, `${path}.proposal_ids`)
    .map((value, index) => remoteIdAt(value, `${path}.proposal_ids[${index}]`));
  if (new Set(values).size !== values.length) fail(`${path}.values`, 'contains duplicates');
  if (new Set(proposalIds).size !== proposalIds.length) fail(`${path}.proposal_ids`, 'contains duplicates');
  return {
    recordId: recordIdAt(conflict.record_id, `${path}.record_id`),
    target: stringAt(conflict.target, `${path}.target`, 1, 180),
    values,
    proposalIds,
  };
}

/** Normalize one structured page returned by read-only list_proposals. */
export function normalizeXFrontierProposalsPage(input: unknown): NormalizedXFrontierProposalsPage {
  const response = objectAt(input, '$');
  exactKeys(
    response,
    ['dataset_version', 'total', 'offset', 'items', 'conflicts', 'nextCursor'],
    ['store', 'review'],
    '$',
  );
  const nextCursor = response.nextCursor === null
    ? null
    : stringAt(response.nextCursor, '$.nextCursor', 1, 1000);
  const items = arrayAt(response.items, '$.items').map((item, index) => normalizeProposal(item, `$.items[${index}]`));
  if (new Set(items.map((item) => item.id)).size !== items.length) fail('$.items', 'contains duplicate proposal ids');
  const total = integerAt(response.total, '$.total');
  const offset = integerAt(response.offset, '$.offset');
  if (offset + items.length > total) fail('$.items', 'extends beyond total');
  if (nextCursor !== null && items.length === 0) fail('$.nextCursor', 'cannot advance from an empty page');
  const conflicts = arrayAt(response.conflicts, '$.conflicts')
    .map((conflict, index) => normalizeConflict(conflict, `$.conflicts[${index}]`));
  if (new Set(conflicts.map((conflict) => conflict.target)).size !== conflicts.length) {
    fail('$.conflicts', 'contains duplicate targets');
  }
  return {
    datasetVersion: datasetVersionAt(response.dataset_version, '$.dataset_version'),
    total,
    offset,
    items,
    conflicts,
    nextCursor,
  };
}

export interface XFrontierFeedbackReadState {
  schemaVersion: typeof XFRONTIER_FEEDBACK_STATE_SCHEMA_VERSION;
  datasetVersion: string;
  findings: NormalizedXFrontierFinding[];
  proposals: NormalizedXFrontierProposal[];
  conflicts: NormalizedXFrontierConflict[];
  complete: true;
}

/**
 * Normalize complete read-only ledger views. All proposal pages must be
 * supplied contiguously; partial pagination is rejected so removals cannot be
 * invented by diffing an incomplete page.
 */
export function normalizeXFrontierFeedbackReadState(input: {
  findingsResponse: unknown;
  proposalResponses: unknown[];
}): XFrontierFeedbackReadState {
  const findings = normalizeXFrontierFindingsResponse(input.findingsResponse);
  if (!Array.isArray(input.proposalResponses) || input.proposalResponses.length === 0) {
    fail('proposalResponses', 'must contain at least one page');
  }
  const pages = input.proposalResponses.map(normalizeXFrontierProposalsPage).sort((a, b) => a.offset - b.offset);
  const first = pages[0]!;
  if (first.offset !== 0) fail('proposalResponses[0].offset', 'must start at 0');
  let expectedOffset = 0;
  const proposals: NormalizedXFrontierProposal[] = [];
  for (const [index, page] of pages.entries()) {
    if (page.datasetVersion !== first.datasetVersion) fail(`proposalResponses[${index}].dataset_version`, 'changed between pages');
    if (page.total !== first.total) fail(`proposalResponses[${index}].total`, 'changed between pages');
    if (page.offset !== expectedOffset) fail(`proposalResponses[${index}].offset`, `must equal ${expectedOffset}`);
    if (index < pages.length - 1 && page.nextCursor === null) fail(`proposalResponses[${index}].nextCursor`, 'cannot be null before the final page');
    proposals.push(...page.items);
    expectedOffset += page.items.length;
  }
  if (pages.at(-1)!.nextCursor !== null) fail('proposalResponses[last].nextCursor', 'must be null for a complete snapshot');
  if (proposals.length !== first.total) fail('proposalResponses', `contains ${proposals.length} of ${first.total} proposals`);
  if (new Set(proposals.map((proposal) => proposal.id)).size !== proposals.length) {
    fail('proposalResponses', 'contains duplicate proposal ids across pages');
  }
  const conflictsJson = JSON.stringify(first.conflicts);
  for (const [index, page] of pages.entries()) {
    if (JSON.stringify(page.conflicts) !== conflictsJson) fail(`proposalResponses[${index}].conflicts`, 'changed between pages');
  }
  if (findings.datasetVersion !== first.datasetVersion) fail('datasetVersion', 'differs between finding and proposal ledgers');
  return {
    schemaVersion: XFRONTIER_FEEDBACK_STATE_SCHEMA_VERSION,
    datasetVersion: first.datasetVersion,
    findings: findings.items,
    proposals,
    conflicts: first.conflicts,
    complete: true,
  };
}

export interface XFrontierEntryDiff<T> {
  added: T[];
  removed: T[];
  changed: Array<{ id: string; before: T; after: T }>;
}

export interface XFrontierFeedbackStateDiff {
  schemaVersion: typeof XFRONTIER_FEEDBACK_DIFF_SCHEMA_VERSION;
  changed: boolean;
  dataset: { before: string; after: string; changed: boolean };
  findings: XFrontierEntryDiff<NormalizedXFrontierFinding>;
  proposals: XFrontierEntryDiff<NormalizedXFrontierProposal>;
  conflicts: XFrontierEntryDiff<NormalizedXFrontierConflict & { id: string }>;
}

const diffEntries = <T extends { id: string }>(before: T[], after: T[]): XFrontierEntryDiff<T> => {
  const beforeById = new Map(before.map((item) => [item.id, item]));
  const afterById = new Map(after.map((item) => [item.id, item]));
  const added = after.filter((item) => !beforeById.has(item.id));
  const removed = before.filter((item) => !afterById.has(item.id));
  const changed = after
    .filter((item) => beforeById.has(item.id) && JSON.stringify(beforeById.get(item.id)) !== JSON.stringify(item))
    .map((item) => ({ id: item.id, before: beforeById.get(item.id)!, after: item }));
  return { added, removed, changed };
};

/** Diff complete normalized read views without deriving any local disposition. */
export function diffXFrontierFeedbackReadStates(
  before: XFrontierFeedbackReadState,
  after: XFrontierFeedbackReadState,
): XFrontierFeedbackStateDiff {
  if (before.schemaVersion !== XFRONTIER_FEEDBACK_STATE_SCHEMA_VERSION || !before.complete) {
    fail('before', 'must be a complete normalized feedback state');
  }
  if (after.schemaVersion !== XFRONTIER_FEEDBACK_STATE_SCHEMA_VERSION || !after.complete) {
    fail('after', 'must be a complete normalized feedback state');
  }
  const findings = diffEntries(before.findings, after.findings);
  const proposals = diffEntries(before.proposals, after.proposals);
  const withConflictIds = (items: NormalizedXFrontierConflict[]) => items.map((item) => ({ id: item.target, ...item }));
  const conflicts = diffEntries(withConflictIds(before.conflicts), withConflictIds(after.conflicts));
  const dataset = {
    before: before.datasetVersion,
    after: after.datasetVersion,
    changed: before.datasetVersion !== after.datasetVersion,
  };
  return {
    schemaVersion: XFRONTIER_FEEDBACK_DIFF_SCHEMA_VERSION,
    changed: dataset.changed
      || findings.added.length > 0 || findings.removed.length > 0 || findings.changed.length > 0
      || proposals.added.length > 0 || proposals.removed.length > 0 || proposals.changed.length > 0
      || conflicts.added.length > 0 || conflicts.removed.length > 0 || conflicts.changed.length > 0,
    dataset,
    findings,
    proposals,
    conflicts,
  };
}

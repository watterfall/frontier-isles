import {
  toXFrontierFeedbackStrongToolIntent,
  toXFrontierFeedbackToolIntent,
  validateXFrontierFeedbackEnvelope,
  type NormalizedXFrontierDecision,
  type NormalizedXFrontierProposal,
  type XFrontierFeedbackEnvelope,
  type XFrontierFeedbackStrongToolIntent,
  type XFrontierFeedbackToolIntent,
} from "@frontier-isles/data/xfrontier-feedback";
import {
  Store,
  FeedbackStateConflict,
  type FeedbackDeliveryReceipt,
  type FeedbackDeliveryReconciliation,
  type FeedbackFindingLocalDisposition,
  type FeedbackLocalDisposition,
  type FeedbackOutboxItem,
  type FeedbackOutboxState,
} from "./store.js";
import type {
  XFrontierFeedbackDeliveryAck,
  XFrontierFeedbackRemote,
} from "./xfrontier-feedback-client.js";
import {
  XFRONTIER_FEEDBACK_STRONG_WRITE_PROTOCOL_VERSION,
  XFrontierFeedbackToolError,
} from "./xfrontier-feedback-client.js";

const FEEDBACK_RECEIPT_SCHEMA_V1 = "frontier-isles/xfrontier-delivery-receipt/v1";
const FEEDBACK_RECEIPT_SCHEMA = "frontier-isles/xfrontier-delivery-receipt/v2";

export type XFrontierRemoteEntityKind = "finding" | "proposal" | "decision";

/** Remote ids are only eight random hexadecimal characters today. A kind and
 * upstream authority namespace is mandatory before they enter local keys. */
export const xfrontierRemoteKey = (kind: XFrontierRemoteEntityKind, id: string): string => {
  const remoteId = id.trim();
  if (!remoteId) throw new Error(`xFrontier ${kind} id is required`);
  return `xfrontier:${kind}:${remoteId}`;
};

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export class XFrontierDeliveryUncertain extends Error {
  constructor(
    public readonly outboxId: string,
    public readonly receipt: FeedbackDeliveryReceipt | undefined,
    cause: unknown,
  ) {
    super(
      `xFrontier delivery outcome is uncertain for ${outboxId}; automatic retry is forbidden${
        receipt ? "" : "; no local uncertainty receipt could be recorded"
      }`,
      { cause },
    );
    this.name = "XFrontierDeliveryUncertain";
  }
}

export class XFrontierDeliveryRefused extends Error {
  constructor(
    public readonly outboxId: string,
    public readonly outcome: "refused" | "conflict",
    public readonly reconciliation: FeedbackDeliveryReconciliation,
    cause: unknown,
  ) {
    super(
      outcome === "refused"
        ? `xFrontier refused feedback preconditions without writing: ${outboxId}`
        : `xFrontier client event id conflicts with another immutable request: ${outboxId}`,
      { cause },
    );
    this.name = "XFrontierDeliveryRefused";
  }
}

const throwDeliveryUncertain = (
  store: Store,
  input: {
    outboxId: string;
    attemptId: string;
    leaseToken: string;
    cause: unknown;
    receipt?: unknown;
    at?: string;
  },
): never => {
  try {
    const receipt = store.recordFeedbackDeliveryFailure({
      attemptId: input.attemptId,
      leaseToken: input.leaseToken,
      error: errorMessage(input.cause),
      ...(input.receipt === undefined ? {} : { receipt: input.receipt }),
      at: input.at,
    });
    throw new XFrontierDeliveryUncertain(input.outboxId, receipt, input.cause);
  } catch (receiptError) {
    if (receiptError instanceof XFrontierDeliveryUncertain) throw receiptError;
    throw new XFrontierDeliveryUncertain(
      input.outboxId,
      undefined,
      new AggregateError(
        [input.cause, receiptError],
        `xFrontier delivery became uncertain and its local receipt could not be recorded: ${input.outboxId}`,
      ),
    );
  }
};

/** Validate first, then bind the exact envelope to local evidence in one DB
 * transaction. This function never connects to xFrontier. */
export function enqueueXFrontierFeedback(
  store: Store,
  input: unknown,
  now?: string,
): { created: boolean; item: FeedbackOutboxItem; envelope: XFrontierFeedbackEnvelope } {
  const envelope = validateXFrontierFeedbackEnvelope(input);
  const result = store.enqueueFeedback({
    idempotencyKey: envelope.idempotencyKey,
    envelope,
    now,
  });
  return { ...result, envelope };
}

export interface XFrontierDeliveryResult {
  item: FeedbackOutboxItem;
  intent: XFrontierFeedbackToolIntent;
  acknowledgement: XFrontierFeedbackDeliveryAck;
  receipt: FeedbackDeliveryReceipt;
  datasetChangedDuringCall: boolean;
}

/** Submit exactly one explicitly selected pending item. All remote reads and
 * intent validation happen before the attempt lease is created. Once the call
 * begins, every exception becomes `uncertain` and can never be auto-retried. */
export async function deliverXFrontierFeedback(input: {
  store: Store;
  remote: XFrontierFeedbackRemote;
  outboxId: string;
  /** Internal capability for an explicitly reconciled retry. It must match the
   * latest append-only not_found observation in Store. */
  retry?: { clientEventId: string; requestHash: string };
  workerId?: string;
  now?: string;
}): Promise<XFrontierDeliveryResult> {
  const { store, remote } = input;
  const selected = store.getFeedbackOutbox(input.outboxId);
  if (!selected) throw new FeedbackStateConflict(`unknown feedback outbox item: ${input.outboxId}`);
  const requiredState = input.retry ? "uncertain" : "pending";
  if (selected.state !== requiredState) {
    throw new FeedbackStateConflict(
      `feedback delivery requires ${requiredState} state, found ${selected.state}: ${selected.id}`,
    );
  }

  if (remote.info.version !== XFRONTIER_FEEDBACK_STRONG_WRITE_PROTOCOL_VERSION) {
    throw new FeedbackStateConflict(
      `xFrontier ${remote.info.version} is read-only for feedback delivery; strong writes require ${XFRONTIER_FEEDBACK_STRONG_WRITE_PROTOCOL_VERSION}`,
    );
  }
  // This also revalidates the stored v2 envelope and refuses dataset drift
  // before any attempt row says a write call began.
  const intent = toXFrontierFeedbackStrongToolIntent(
    selected.envelope,
    remote.info.datasetVersion,
  );
  if (intent.idempotencyKey !== selected.idempotencyKey) {
    throw new FeedbackStateConflict(`stored feedback idempotency key mismatch: ${selected.id}`);
  }
  if (
    input.retry
    && (
      input.retry.clientEventId !== intent.clientEventId
      || input.retry.requestHash !== intent.requestHash
    )
  ) {
    throw new FeedbackStateConflict(`feedback retry proof does not match immutable intent: ${selected.id}`);
  }

  const lease = store.leaseFeedbackDelivery({
    workerId: input.workerId ?? `xfrontier-feedback:${process.pid}`,
    outboxId: selected.id,
    ...(input.retry ? { retry: input.retry } : {}),
    now: input.now,
  });
  if (!lease) throw new FeedbackStateConflict(`feedback item was no longer pending: ${selected.id}`);
  if (lease.item.envelopeHash !== selected.envelopeHash) {
    // The immutable row should make this impossible. Conservatively preserve
    // the begun-attempt fact as uncertain if storage corruption says otherwise.
    const cause = new FeedbackStateConflict(`feedback envelope changed before delivery: ${selected.id}`);
    throwDeliveryUncertain(store, {
      outboxId: selected.id,
      attemptId: lease.attempt.attemptId,
      leaseToken: lease.leaseToken,
      cause,
      at: input.now,
    });
  }

  let acknowledgement: XFrontierFeedbackDeliveryAck;
  try {
    acknowledgement = await remote.submit(intent);
  } catch (error) {
    if (
      error instanceof XFrontierFeedbackToolError
      && ["precondition_failed", "invalid_precondition_scope", "idempotency_conflict"].includes(
        error.errorKind ?? "",
      )
    ) {
      try {
        store.recordFeedbackDeliveryFailure({
          attemptId: lease.attempt.attemptId,
          leaseToken: lease.leaseToken,
          error: errorMessage(error),
          receipt: error.payload,
          at: input.now,
        });
        const outcome = error.errorKind === "idempotency_conflict" ? "conflict" : "refused";
        const reconciled = store.recordFeedbackDeliveryReconciliation({
          outboxId: selected.id,
          clientEventId: intent.clientEventId,
          requestHash: intent.requestHash,
          outcome,
          detail: error.payload,
          at: input.now,
        });
        throw new XFrontierDeliveryRefused(
          selected.id,
          outcome,
          reconciled.reconciliation,
          error,
        );
      } catch (localError) {
        if (localError instanceof XFrontierDeliveryRefused) throw localError;
        throw new XFrontierDeliveryUncertain(
          selected.id,
          undefined,
          new AggregateError(
            [error, localError],
            `xFrontier refusal could not be recorded locally: ${selected.id}`,
          ),
        );
      }
    }
    return throwDeliveryUncertain(store, {
      outboxId: selected.id,
      attemptId: lease.attempt.attemptId,
      leaseToken: lease.leaseToken,
      cause: error,
      at: input.now,
    });
  }

  const datasetChangedDuringCall =
    acknowledgement.currentDatasetVersion !== intent.targetDatasetVersion;
  const receiptDetail = {
    schemaVersion: FEEDBACK_RECEIPT_SCHEMA,
    upstream: {
      name: remote.info.name,
      version: remote.info.version,
      serverEntry: remote.info.serverEntry,
    },
    toolName: intent.toolName,
    idempotencyKey: intent.idempotencyKey,
    clientEventId: intent.clientEventId,
    requestHash: intent.requestHash,
    targetDatasetVersion: intent.targetDatasetVersion,
    acknowledgedDatasetVersion: acknowledgement.datasetVersion,
    currentDatasetVersion: acknowledgement.currentDatasetVersion,
    datasetChangedDuringCall,
    acknowledgement,
  };
  let receipt: FeedbackDeliveryReceipt;
  try {
    receipt = store.recordFeedbackDeliverySuccess({
      attemptId: lease.attempt.attemptId,
      leaseToken: lease.leaseToken,
      remoteReceiptId: xfrontierRemoteKey(acknowledgement.remoteKind, acknowledgement.remoteId),
      receipt: receiptDetail,
      at: input.now,
    });
  } catch (error) {
    // The upstream write is acknowledged but the local durable ack failed. Mark
    // it uncertain immediately when SQLite still permits a terminal receipt;
    // retrying the remote writer would risk a duplicate proposal/finding.
    const cause = new Error(
      `upstream acknowledged but local success receipt failed: ${errorMessage(error)}`,
      { cause: error },
    );
    return throwDeliveryUncertain(store, {
      outboxId: selected.id,
      attemptId: lease.attempt.attemptId,
      leaseToken: lease.leaseToken,
      cause,
      receipt: receiptDetail,
      at: input.now,
    });
  }
  return {
    item: store.getFeedbackOutbox(selected.id)!,
    intent,
    acknowledgement,
    receipt,
    datasetChangedDuringCall,
  };
}

export interface XFrontierFeedbackReconciliationResult {
  item: FeedbackOutboxItem;
  intent: XFrontierFeedbackStrongToolIntent;
  reconciliation: FeedbackDeliveryReconciliation;
  found: boolean;
  /** Reconciliation itself is read-only upstream. A not-found result is only
   * evidence that a separately authorized retry may begin. */
  upstreamWriterCalls: 0;
}

/** Recover an uncertain acknowledgement through xFrontier's exact read-only
 * receipt index. This never invokes a writer and never retries by itself. */
export async function reconcileXFrontierFeedback(input: {
  store: Store;
  remote: XFrontierFeedbackRemote;
  outboxId: string;
  now?: string;
}): Promise<XFrontierFeedbackReconciliationResult> {
  const selected = input.store.getFeedbackOutbox(input.outboxId);
  if (!selected) throw new FeedbackStateConflict(`unknown feedback outbox item: ${input.outboxId}`);
  if (selected.state !== "uncertain") {
    throw new FeedbackStateConflict(
      `feedback reconciliation requires uncertain state, found ${selected.state}: ${selected.id}`,
    );
  }
  if (input.remote.info.version !== XFRONTIER_FEEDBACK_STRONG_WRITE_PROTOCOL_VERSION) {
    throw new FeedbackStateConflict(
      `xFrontier ${input.remote.info.version} has no reviewed exact receipt lookup`,
    );
  }

  const envelope = validateXFrontierFeedbackEnvelope(selected.envelope);
  // Lookup recovers the original receipt even after the current corpus moves,
  // so reconstruct the immutable intent against its own target version.
  const intent = toXFrontierFeedbackStrongToolIntent(
    envelope,
    envelope.target.datasetVersion,
  );
  if (intent.idempotencyKey !== selected.idempotencyKey) {
    throw new FeedbackStateConflict(`stored feedback idempotency key mismatch: ${selected.id}`);
  }
  const lookup = await input.remote.lookupReceipt(intent);
  if (!lookup.found) {
    const recorded = input.store.recordFeedbackDeliveryReconciliation({
      outboxId: selected.id,
      clientEventId: intent.clientEventId,
      requestHash: intent.requestHash,
      outcome: "not_found",
      detail: lookup.raw,
      at: input.now,
    });
    return {
      item: recorded.item,
      intent,
      reconciliation: recorded.reconciliation,
      found: false,
      upstreamWriterCalls: 0,
    };
  }

  const acknowledgement = lookup.acknowledgement;
  const recorded = input.store.recordFeedbackDeliveryReconciliation({
    outboxId: selected.id,
    clientEventId: intent.clientEventId,
    requestHash: intent.requestHash,
    outcome: "found",
    remoteReceiptId: xfrontierRemoteKey(acknowledgement.remoteKind, acknowledgement.remoteId),
    detail: {
      schemaVersion: FEEDBACK_RECEIPT_SCHEMA,
      upstream: {
        name: input.remote.info.name,
        version: input.remote.info.version,
        serverEntry: input.remote.info.serverEntry,
      },
      toolName: intent.toolName,
      idempotencyKey: intent.idempotencyKey,
      clientEventId: intent.clientEventId,
      requestHash: intent.requestHash,
      targetDatasetVersion: intent.targetDatasetVersion,
      acknowledgedDatasetVersion: acknowledgement.datasetVersion,
      currentDatasetVersion: acknowledgement.currentDatasetVersion,
      acknowledgement,
      lookup: lookup.raw,
    },
    at: input.now,
  });
  return {
    item: recorded.item,
    intent,
    reconciliation: recorded.reconciliation,
    found: true,
    upstreamWriterCalls: 0,
  };
}

/** Perform the separately authorized retry after a prior exact not-found
 * reconciliation. The same immutable event ID, request hash, and preconditions
 * are reused; Store atomically consumes the latest proof when it leases. */
export async function retryXFrontierFeedback(input: {
  store: Store;
  remote: XFrontierFeedbackRemote;
  outboxId: string;
  workerId?: string;
  now?: string;
}): Promise<XFrontierDeliveryResult> {
  const selected = input.store.getFeedbackOutbox(input.outboxId);
  if (!selected) throw new FeedbackStateConflict(`unknown feedback outbox item: ${input.outboxId}`);
  if (selected.state !== "uncertain") {
    throw new FeedbackStateConflict(`feedback retry requires uncertain state: ${selected.id}`);
  }
  const envelope = validateXFrontierFeedbackEnvelope(selected.envelope);
  const intent = toXFrontierFeedbackStrongToolIntent(envelope, envelope.target.datasetVersion);
  return deliverXFrontierFeedback({
    ...input,
    retry: { clientEventId: intent.clientEventId, requestHash: intent.requestHash },
  });
}

const importDecision = (
  store: Store,
  outboxId: string,
  decision: NormalizedXFrontierDecision,
  receivedAt?: string,
): boolean => store.upsertFeedbackReviewDecision({
  outboxId,
  decisionId: xfrontierRemoteKey("decision", decision.id),
  status: decision.decision,
  decision,
  decidedAt: decision.timestamp,
  receivedAt,
}).created;

const feedbackRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new FeedbackStateConflict(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
};

const assertFeedbackValue = (
  actual: unknown,
  expected: unknown,
  label: string,
): void => {
  if (!Object.is(actual, expected)) {
    throw new FeedbackStateConflict(
      `${label} does not match the delivered feedback envelope (${JSON.stringify(actual)} != ${JSON.stringify(expected)})`,
    );
  }
};

/** A short upstream id is not sufficient authority for importing a decision.
 * Re-bind the pulled proposal to the immutable local envelope and success
 * receipt before its decision history can enter the local review inbox. */
const assertProposalMatchesDelivery = (
  store: Store,
  outbox: FeedbackOutboxItem,
  proposal: NormalizedXFrontierProposal,
): void => {
  const envelope = validateXFrontierFeedbackEnvelope(outbox.envelope);
  if (envelope.payload.kind === "finding") {
    throw new FeedbackStateConflict(
      `remote proposal ${proposal.id} maps to a finding outbox item: ${outbox.id}`,
    );
  }
  const intent = toXFrontierFeedbackToolIntent(envelope, envelope.target.datasetVersion);
  const expectedKind = intent.toolName === "propose_annotation" ? "annotation" : "structure-link";
  const prefix = `remote proposal ${proposal.id}`;
  assertFeedbackValue(proposal.proposalKind, expectedKind, `${prefix}.proposalKind`);
  assertFeedbackValue(proposal.recordId, intent.arguments.record_id, `${prefix}.recordId`);
  assertFeedbackValue(proposal.rationale, intent.arguments.rationale, `${prefix}.rationale`);
  assertFeedbackValue(proposal.confidence, intent.arguments.confidence, `${prefix}.confidence`);
  assertFeedbackValue(proposal.by, intent.arguments.by, `${prefix}.by`);
  assertFeedbackValue(proposal.datasetVersion, intent.targetDatasetVersion, `${prefix}.datasetVersion`);
  if (intent.remoteIdempotency === "client-event-id") {
    assertFeedbackValue(proposal.clientEventId, intent.clientEventId, `${prefix}.clientEventId`);
    assertFeedbackValue(proposal.requestHash, intent.requestHash, `${prefix}.requestHash`);
  } else if (proposal.clientEventId !== undefined || proposal.requestHash !== undefined) {
    throw new FeedbackStateConflict(`${prefix} has strong receipt metadata but maps to a legacy envelope`);
  }
  if (intent.toolName === "propose_annotation") {
    assertFeedbackValue(proposal.field, intent.arguments.field, `${prefix}.field`);
    assertFeedbackValue(proposal.value, intent.arguments.value, `${prefix}.value`);
  } else {
    assertFeedbackValue(proposal.structureId, intent.arguments.structure_id, `${prefix}.structureId`);
    assertFeedbackValue(proposal.evidence, intent.arguments.evidence, `${prefix}.evidence`);
  }

  const remoteReceiptId = xfrontierRemoteKey("proposal", proposal.id);
  const receipts = store.listFeedbackDeliveryReceipts(outbox.id)
    .filter((receipt) => receipt.outcome === "success" && receipt.remoteReceiptId === remoteReceiptId);
  const reconciliations = store.listFeedbackDeliveryReconciliations(outbox.id)
    .filter((entry) => entry.outcome === "found" && entry.remoteReceiptId === remoteReceiptId);
  if (receipts.length + reconciliations.length !== 1) {
    throw new FeedbackStateConflict(
      `${prefix} must map to exactly one local success or found reconciliation receipt; found ${receipts.length + reconciliations.length}`,
    );
  }
  const detail = feedbackRecord(
    receipts[0]?.detail ?? reconciliations[0]?.detail,
    `${prefix} receipt detail`,
  );
  const expectedSchema = intent.remoteIdempotency === "client-event-id"
    ? FEEDBACK_RECEIPT_SCHEMA
    : FEEDBACK_RECEIPT_SCHEMA_V1;
  assertFeedbackValue(detail.schemaVersion, expectedSchema, `${prefix} receipt.schemaVersion`);
  assertFeedbackValue(detail.toolName, intent.toolName, `${prefix} receipt.toolName`);
  assertFeedbackValue(detail.idempotencyKey, intent.idempotencyKey, `${prefix} receipt.idempotencyKey`);
  if (intent.remoteIdempotency === "client-event-id") {
    assertFeedbackValue(detail.clientEventId, intent.clientEventId, `${prefix} receipt.clientEventId`);
    assertFeedbackValue(detail.requestHash, intent.requestHash, `${prefix} receipt.requestHash`);
  }
  assertFeedbackValue(
    detail.acknowledgedDatasetVersion,
    proposal.datasetVersion,
    `${prefix} receipt.acknowledgedDatasetVersion`,
  );
  const acknowledgement = feedbackRecord(detail.acknowledgement, `${prefix} receipt acknowledgement`);
  assertFeedbackValue(acknowledgement.remoteKind, "proposal", `${prefix} acknowledgement.remoteKind`);
  assertFeedbackValue(acknowledgement.remoteId, proposal.id, `${prefix} acknowledgement.remoteId`);
  assertFeedbackValue(
    acknowledgement.datasetVersion,
    proposal.datasetVersion,
    `${prefix} acknowledgement.datasetVersion`,
  );
  assertFeedbackValue(acknowledgement.timestamp, proposal.timestamp, `${prefix} acknowledgement.timestamp`);
  if (intent.remoteIdempotency === "client-event-id") {
    assertFeedbackValue(
      acknowledgement.clientEventId,
      intent.clientEventId,
      `${prefix} acknowledgement.clientEventId`,
    );
    assertFeedbackValue(
      acknowledgement.requestHash,
      intent.requestHash,
      `${prefix} acknowledgement.requestHash`,
    );
  }
};

export interface XFrontierFeedbackPullResult {
  datasetVersion: string;
  findings: { observed: number; upstreamStale: number; stored: number };
  proposals: { observed: number; matched: number; unmatched: number; conflicts: number };
  decisions: { observed: number; created: number; replayed: number };
  /** Always false: remote acceptance is never a local application action. */
  appliedAutomatically: false;
}

/** Pull a quiet-window remote view into local review projections. Missing
 * findings are retained; proposal decisions are imported only when their
 * namespaced receipt maps back to exactly one local outbox item. */
export async function pullXFrontierFeedback(input: {
  store: Store;
  remote: XFrontierFeedbackRemote;
  receivedAt?: string;
}): Promise<XFrontierFeedbackPullResult> {
  const state = await input.remote.readFeedbackState();
  const findings = state.findings.map((finding) => ({
    remoteFindingId: xfrontierRemoteKey("finding", finding.id),
    finding,
    upstreamStale: finding.stale,
  }));
  return input.store.db.transaction((): XFrontierFeedbackPullResult => {
    const findingResult = input.store.upsertFeedbackFindings({
      datasetVersion: state.datasetVersion,
      findings,
      observedAt: input.receivedAt,
    });

    let matched = 0;
    let unmatched = 0;
    let decisionsObserved = 0;
    let decisionsCreated = 0;
    for (const proposal of state.proposals) {
      const byRemoteId = input.store.findFeedbackByRemoteReceiptId(
        xfrontierRemoteKey("proposal", proposal.id),
      );
      const byClientEvent = proposal.clientEventId
        ? input.store.findFeedbackByIdempotencyKey(proposal.clientEventId)
        : undefined;
      if (byRemoteId && byClientEvent && byRemoteId.id !== byClientEvent.id) {
        throw new FeedbackStateConflict(
          `remote proposal ${proposal.id} receipt id and client_event_id map to different outbox items`,
        );
      }
      const outbox = byClientEvent ?? byRemoteId;
      if (!outbox) {
        unmatched += 1;
        continue;
      }
      assertProposalMatchesDelivery(input.store, outbox, proposal);
      matched += 1;
      for (const decision of proposal.decisionHistory) {
        decisionsObserved += 1;
        if (importDecision(input.store, outbox.id, decision, input.receivedAt)) {
          decisionsCreated += 1;
        }
      }
    }

    return {
      datasetVersion: state.datasetVersion,
      findings: {
        observed: state.findings.length,
        upstreamStale: state.findings.filter((finding) => finding.stale).length,
        stored: findingResult.upserted,
      },
      proposals: {
        observed: state.proposals.length,
        matched,
        unmatched,
        conflicts: state.conflicts.length,
      },
      decisions: {
        observed: decisionsObserved,
        created: decisionsCreated,
        replayed: decisionsObserved - decisionsCreated,
      },
      appliedAutomatically: false,
    };
  })();
}

export interface XFrontierFeedbackInspection {
  mode: "local-inspect";
  remoteCalls: 0;
  outbox: {
    total: number;
    byState: Record<FeedbackOutboxState, number>;
    items: FeedbackOutboxItem[];
    deliveries: Array<NonNullable<ReturnType<Store["inspectFeedbackDelivery"]>>>;
  };
  reviewInbox: ReturnType<Store["listFeedbackReviewInbox"]>;
  findingInbox: ReturnType<Store["listFeedbackFindings"]>;
}

/** Local-only inspection. It receives no remote port, making an accidental MCP
 * call impossible by construction. */
export function inspectXFrontierFeedback(store: Store): XFrontierFeedbackInspection {
  const items = store.listFeedbackOutbox();
  const states: FeedbackOutboxState[] = ["pending", "in_flight", "delivered", "uncertain", "cancelled"];
  return {
    mode: "local-inspect",
    remoteCalls: 0,
    outbox: {
      total: items.length,
      byState: Object.fromEntries(
        states.map((state) => [state, items.filter((item) => item.state === state).length]),
      ) as Record<FeedbackOutboxState, number>,
      items,
      deliveries: items.map((item) => store.inspectFeedbackDelivery(item.id)!),
    },
    reviewInbox: store.listFeedbackReviewInbox(),
    findingInbox: store.listFeedbackFindings({ includeStale: true }),
  };
}

export const setXFrontierProposalDisposition = (
  store: Store,
  outboxId: string,
  next: FeedbackLocalDisposition,
  at?: string,
) => store.setFeedbackLocalDisposition(outboxId, next, at);

export const setXFrontierFindingDisposition = (
  store: Store,
  remoteFindingId: string,
  next: FeedbackFindingLocalDisposition,
  at?: string,
) => store.setFeedbackFindingLocalDisposition(remoteFindingId, next, at);

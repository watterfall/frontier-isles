import { describe, expect, it } from "vitest";
import {
  hashXFrontierFeedbackRequest,
  XFRONTIER_FEEDBACK_SCHEMA_VERSION_V2,
  XFRONTIER_FEEDBACK_STATE_SCHEMA_VERSION,
  type XFrontierFeedbackReadState,
  type XFrontierFeedbackStrongToolIntent,
  type XFrontierFeedbackToolIntent,
} from "@frontier-isles/data/xfrontier-feedback";
import { openDb } from "../src/db.js";
import { Store } from "../src/store.js";
import {
  deliverXFrontierFeedback,
  enqueueXFrontierFeedback,
  inspectXFrontierFeedback,
  pullXFrontierFeedback,
  reconcileXFrontierFeedback,
  retryXFrontierFeedback,
  XFrontierDeliveryRefused,
  XFrontierDeliveryUncertain,
} from "../src/xfrontier-feedback-bridge.js";
import { XFrontierFeedbackToolError } from "../src/xfrontier-feedback-client.js";
import type {
  XFrontierFeedbackDeliveryAck,
  XFrontierFeedbackReceiptLookup,
  XFrontierFeedbackRemote,
  XFrontierFeedbackRemoteInfo,
} from "../src/xfrontier-feedback-client.js";

const NOW = "2026-08-13T02:00:00.000Z";
const DECIDED_AT = "2026-08-13T03:00:00.000Z";
const CLIENT_EVENT_ID = "frontier-isles:test:annotation-001";
const CONTENT_HASH = "deadbeef";
const ANNOTATION_ARGS = {
  record_id: 40,
  field: "mech",
  value: "A mechanism statement grounded in the local evidence.",
  rationale: "The record and local test name the same mechanism.",
  confidence: 0.8,
  by: "frontier-isles",
  client_event_id: CLIENT_EVENT_ID,
  expected_dataset_version: "xf-current123",
  expected_content_hash: CONTENT_HASH,
};
const REQUEST_HASH = hashXFrontierFeedbackRequest("propose_annotation", ANNOTATION_ARGS);

const emptyState = (datasetVersion = "xf-current123"): XFrontierFeedbackReadState => ({
  schemaVersion: XFRONTIER_FEEDBACK_STATE_SCHEMA_VERSION,
  datasetVersion,
  findings: [],
  proposals: [],
  conflicts: [],
  complete: true,
});

class FakeRemote implements XFrontierFeedbackRemote {
  readonly info: XFrontierFeedbackRemoteInfo;
  submitCalls = 0;
  lookupCalls = 0;
  readCalls = 0;
  closed = false;

  constructor(
    public state: XFrontierFeedbackReadState = emptyState(),
    public acknowledgement: Error | null = null,
    public lookup: XFrontierFeedbackReceiptLookup | Error | null = null,
  ) {
    this.info = {
      name: "xfrontier",
      version: "0.6.0",
      datasetVersion: state.datasetVersion,
      serverEntry: "/fake/xfrontier/server.mjs",
    };
  }

  async readFeedbackState(): Promise<XFrontierFeedbackReadState> {
    this.readCalls += 1;
    return this.state;
  }

  async submit(intent: XFrontierFeedbackToolIntent): Promise<XFrontierFeedbackDeliveryAck> {
    this.submitCalls += 1;
    if (this.acknowledgement instanceof Error) throw this.acknowledgement;
    if (intent.remoteIdempotency !== "client-event-id") throw new Error("expected strong intent");
    return {
      datasetVersion: intent.targetDatasetVersion,
      currentDatasetVersion: this.info.datasetVersion,
      remoteId: "proposal-1",
      remoteKind: "proposal",
      timestamp: NOW,
      clientEventId: intent.clientEventId,
      requestHash: intent.requestHash,
      idempotentReplay: false,
      corpusChanged: false,
      raw: { queued: { id: "proposal-1" } },
    };
  }

  async lookupReceipt(
    intent: XFrontierFeedbackStrongToolIntent,
  ): Promise<XFrontierFeedbackReceiptLookup> {
    this.lookupCalls += 1;
    if (this.lookup instanceof Error) throw this.lookup;
    return this.lookup ?? {
      found: false,
      currentDatasetVersion: this.info.datasetVersion,
      clientEventId: intent.clientEventId,
      raw: { dataset_version: this.info.datasetVersion, found: false, client_event_id: intent.clientEventId },
    };
  }

  async close(): Promise<void> {
    this.closed = true;
  }
}

const setup = () => {
  const db = openDb(":memory:");
  const store = new Store(db);
  const refHash = store.putRef("note", { observation: "locally reproduced" });
  const envelope = {
    schemaVersion: XFRONTIER_FEEDBACK_SCHEMA_VERSION_V2,
    idempotencyKey: CLIENT_EVENT_ID,
    source: {
      system: "frontier-isles",
      ledgerRef: `ref://${refHash}`,
      refHash,
      evidence: "The local note and test reproduce this annotation.",
    },
    target: { datasetVersion: "xf-current123", expectedContentHash: CONTENT_HASH },
    payload: {
      kind: "annotation",
      recordId: 40,
      field: "mech",
      value: "A mechanism statement grounded in the local evidence.",
      rationale: "The record and local test name the same mechanism.",
      confidence: 0.8,
      by: "frontier-isles",
    },
  } as const;
  return { db, store, envelope };
};

const annotationProposal = (
  overrides: Partial<XFrontierFeedbackReadState["proposals"][number]> = {},
): XFrontierFeedbackReadState["proposals"][number] => ({
  id: "proposal-1",
  clientEventId: CLIENT_EVENT_ID,
  requestHash: REQUEST_HASH,
  proposalKind: "annotation",
  recordId: 40,
  field: "mech",
  value: "A mechanism statement grounded in the local evidence.",
  rationale: "The record and local test name the same mechanism.",
  confidence: 0.8,
  by: "frontier-isles",
  byType: "model",
  datasetVersion: "xf-current123",
  timestamp: NOW,
  remoteStatus: "pending",
  decisionHistory: [],
  humanReviewed: false,
  localDisposition: null,
  ...overrides,
});

describe("xFrontier feedback bridge", () => {
  it("keeps default inspection local-only", () => {
    const { db, store } = setup();
    expect(inspectXFrontierFeedback(store)).toMatchObject({
      mode: "local-inspect",
      remoteCalls: 0,
      outbox: { total: 0 },
    });
    db.close();
  });

  it("enqueues idempotently against a machine-verifiable local source", () => {
    const { db, store, envelope } = setup();
    const first = enqueueXFrontierFeedback(store, envelope, NOW);
    const second = enqueueXFrontierFeedback(store, envelope, NOW);
    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.item.id).toBe(first.item.id);
    db.close();
  });

  it("records one explicit successful delivery with a namespaced remote receipt", async () => {
    const { db, store, envelope } = setup();
    const item = enqueueXFrontierFeedback(store, envelope, NOW).item;
    const remote = new FakeRemote();
    const result = await deliverXFrontierFeedback({ store, remote, outboxId: item.id, now: NOW });
    expect(remote.submitCalls).toBe(1);
    expect(result.item.state).toBe("delivered");
    expect(result.receipt).toMatchObject({
      outcome: "success",
      remoteReceiptId: "xfrontier:proposal:proposal-1",
    });
    expect(result.datasetChangedDuringCall).toBe(false);
    db.close();
  });

  it("refuses dataset drift before leasing or calling the writer", async () => {
    const { db, store, envelope } = setup();
    const item = enqueueXFrontierFeedback(store, envelope, NOW).item;
    const remote = new FakeRemote(emptyState("xf-newer456"));
    await expect(deliverXFrontierFeedback({ store, remote, outboxId: item.id, now: NOW }))
      .rejects.toThrow("targets xf-current123, current MCP dataset is xf-newer456");
    expect(remote.submitCalls).toBe(0);
    expect(store.getFeedbackOutbox(item.id)?.state).toBe("pending");
    expect(store.listFeedbackDeliveryAttempts(item.id)).toHaveLength(0);
    db.close();
  });

  it("marks every post-lease exception uncertain and forbids automatic retry", async () => {
    const { db, store, envelope } = setup();
    const item = enqueueXFrontierFeedback(store, envelope, NOW).item;
    const remote = new FakeRemote(emptyState(), new Error("connection lost after request began"));
    await expect(deliverXFrontierFeedback({ store, remote, outboxId: item.id, now: NOW }))
      .rejects.toBeInstanceOf(XFrontierDeliveryUncertain);
    expect(remote.submitCalls).toBe(1);
    expect(store.getFeedbackOutbox(item.id)?.state).toBe("uncertain");
    expect(store.listFeedbackDeliveryReceipts(item.id)).toMatchObject([{ outcome: "failure" }]);
    await expect(deliverXFrontierFeedback({ store, remote, outboxId: item.id, now: NOW }))
      .rejects.toThrow("requires pending state, found uncertain");
    expect(remote.submitCalls).toBe(1);
    db.close();
  });

  it("reconciles not_found read-only before an exact authorized retry", async () => {
    const { db, store, envelope } = setup();
    const item = enqueueXFrontierFeedback(store, envelope, NOW).item;
    const failed = new FakeRemote(emptyState(), new Error("connection lost after request began"));
    await expect(deliverXFrontierFeedback({ store, remote: failed, outboxId: item.id, now: NOW }))
      .rejects.toBeInstanceOf(XFrontierDeliveryUncertain);

    const recovery = new FakeRemote();
    const reconciled = await reconcileXFrontierFeedback({
      store,
      remote: recovery,
      outboxId: item.id,
      now: DECIDED_AT,
    });
    expect(reconciled).toMatchObject({ found: false, upstreamWriterCalls: 0, item: { state: "uncertain" } });
    expect(recovery.lookupCalls).toBe(1);
    expect(recovery.submitCalls).toBe(0);

    const retried = await retryXFrontierFeedback({
      store,
      remote: recovery,
      outboxId: item.id,
      now: "2026-08-13T04:00:00.000Z",
    });
    expect(retried.item.state).toBe("delivered");
    expect(recovery.submitCalls).toBe(1);
    expect(store.listFeedbackDeliveryAttempts(item.id)).toHaveLength(2);
    db.close();
  });

  it("closes an uncertain acknowledgement from a found receipt without retrying", async () => {
    const { db, store, envelope } = setup();
    const item = enqueueXFrontierFeedback(store, envelope, NOW).item;
    const failed = new FakeRemote(emptyState(), new Error("ack lost"));
    await expect(deliverXFrontierFeedback({ store, remote: failed, outboxId: item.id, now: NOW }))
      .rejects.toBeInstanceOf(XFrontierDeliveryUncertain);

    const acknowledgement: XFrontierFeedbackDeliveryAck = {
      datasetVersion: "xf-current123",
      currentDatasetVersion: "xf-current123",
      remoteId: "proposal-recovered",
      remoteKind: "proposal",
      timestamp: NOW,
      clientEventId: CLIENT_EVENT_ID,
      requestHash: REQUEST_HASH,
      idempotentReplay: true,
      corpusChanged: false,
      raw: { queued: { id: "proposal-recovered" } },
    };
    const recovery = new FakeRemote(emptyState(), null, {
      found: true,
      currentDatasetVersion: "xf-current123",
      clientEventId: CLIENT_EVENT_ID,
      requestHash: REQUEST_HASH,
      acknowledgement,
      raw: { found: true, record: { id: "proposal-recovered" } },
    });
    const result = await reconcileXFrontierFeedback({ store, remote: recovery, outboxId: item.id });
    expect(result).toMatchObject({ found: true, item: { state: "delivered" } });
    expect(recovery.submitCalls).toBe(0);
    expect(store.listFeedbackDeliveryAttempts(item.id)).toHaveLength(1);
    expect(store.findFeedbackByRemoteReceiptId("xfrontier:proposal:proposal-recovered")?.id).toBe(item.id);
    db.close();
  });

  it("records an explicit zero-write precondition refusal instead of hiding it as uncertain", async () => {
    const { db, store, envelope } = setup();
    const item = enqueueXFrontierFeedback(store, envelope, NOW).item;
    const remote = new FakeRemote(emptyState(), new XFrontierFeedbackToolError("propose_annotation", {
      error: "content hash changed",
      error_kind: "precondition_failed",
      precondition: "content_hash",
      expected: CONTENT_HASH,
      actual: "cafebabe",
    }));
    await expect(deliverXFrontierFeedback({ store, remote, outboxId: item.id, now: NOW }))
      .rejects.toBeInstanceOf(XFrontierDeliveryRefused);
    expect(store.getFeedbackOutbox(item.id)).toMatchObject({ state: "cancelled" });
    expect(store.listFeedbackDeliveryAttempts(item.id)).toHaveLength(1);
    expect(store.listFeedbackDeliveryReconciliations(item.id)).toMatchObject([{ outcome: "refused" }]);
    db.close();
  });

  it("marks an acknowledged write uncertain when its local success receipt cannot be stored", async () => {
    const { db, store, envelope } = setup();
    const item = enqueueXFrontierFeedback(store, envelope, NOW).item;
    store.recordFeedbackDeliverySuccess = () => {
      throw new Error("simulated local success-receipt failure");
    };
    await expect(deliverXFrontierFeedback({ store, remote: new FakeRemote(), outboxId: item.id, now: NOW }))
      .rejects.toBeInstanceOf(XFrontierDeliveryUncertain);
    expect(store.getFeedbackOutbox(item.id)?.state).toBe("uncertain");
    expect(store.listFeedbackDeliveryReceipts(item.id)).toMatchObject([{
      outcome: "failure",
      error: expect.stringContaining("upstream acknowledged"),
    }]);
    db.close();
  });

  it("still reports explicit uncertainty when no terminal local receipt can be written", async () => {
    const { db, store, envelope } = setup();
    const item = enqueueXFrontierFeedback(store, envelope, NOW).item;
    store.recordFeedbackDeliverySuccess = () => {
      throw new Error("simulated success-receipt storage failure");
    };
    store.recordFeedbackDeliveryFailure = () => {
      throw new Error("simulated uncertainty-receipt storage failure");
    };
    const failure = await deliverXFrontierFeedback({
      store,
      remote: new FakeRemote(),
      outboxId: item.id,
      now: NOW,
    }).catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(XFrontierDeliveryUncertain);
    expect((failure as XFrontierDeliveryUncertain).receipt).toBeUndefined();
    expect((failure as Error).message).toContain("no local uncertainty receipt could be recorded");
    expect(store.getFeedbackOutbox(item.id)?.state).toBe("in_flight");
    db.close();
  });

  it("pulls decisions into review without treating accepted as applied", async () => {
    const { db, store, envelope } = setup();
    const item = enqueueXFrontierFeedback(store, envelope, NOW).item;
    await deliverXFrontierFeedback({ store, remote: new FakeRemote(), outboxId: item.id, now: NOW });

    const state = emptyState();
    state.proposals.push(annotationProposal({
      remoteStatus: "accepted",
      decisionHistory: [{
        id: "decision-1",
        proposalId: "proposal-1",
        decision: "accepted",
        rationale: "Reviewed by a person.",
        by: "reviewer",
        byType: "human",
        datasetVersion: "xf-current123",
        timestamp: DECIDED_AT,
      }],
      humanReviewed: true,
    }));
    const result = await pullXFrontierFeedback({ store, remote: new FakeRemote(state), receivedAt: DECIDED_AT });
    expect(result).toMatchObject({
      proposals: { matched: 1, unmatched: 0 },
      decisions: { created: 1 },
      appliedAutomatically: false,
    });
    expect(store.getFeedbackReviewInbox(item.id)).toMatchObject({
      remoteStatus: "accepted",
      localDisposition: "unreviewed",
    });
    expect(() => store.setFeedbackLocalDisposition(item.id, "applied", DECIDED_AT))
      .toThrow("must advance one step from unreviewed");
    db.close();
  });

  it("refuses to import decisions when a short remote id points at mismatched proposal content", async () => {
    const { db, store, envelope } = setup();
    const item = enqueueXFrontierFeedback(store, envelope, NOW).item;
    await deliverXFrontierFeedback({ store, remote: new FakeRemote(), outboxId: item.id, now: NOW });
    const state = emptyState();
    state.proposals.push(annotationProposal({
      value: "A different proposal that happens to reuse the same short id.",
      remoteStatus: "accepted",
      decisionHistory: [{
        id: "decision-wrong-target",
        proposalId: "proposal-1",
        decision: "accepted",
        rationale: "Reviewed upstream.",
        by: "reviewer",
        byType: "human",
        datasetVersion: "xf-current123",
        timestamp: DECIDED_AT,
      }],
      humanReviewed: true,
    }));
    await expect(pullXFrontierFeedback({ store, remote: new FakeRemote(state), receivedAt: DECIDED_AT }))
      .rejects.toThrow("does not match the delivered feedback envelope");
    expect(store.getFeedbackReviewInbox(item.id)).toBeUndefined();
    db.close();
  });

  it("retains a missing remote finding without inventing deletion or resolution", async () => {
    const { db, store } = setup();
    const first = emptyState();
    first.findings.push({
      id: "finding-1",
      findingKind: "semantics-warning",
      scope: { scale: "field", field: "structures" },
      statement: "The field is derived rather than authored.",
      evidence: "Compared stats and record projections.",
      by: "frontier-isles",
      byType: "model",
      filedBy: null,
      filedByRecorded: true,
      observedAtDatasetVersion: "xf-current123",
      timestamp: NOW,
      stale: false,
    });
    await pullXFrontierFeedback({ store, remote: new FakeRemote(first), receivedAt: NOW });
    await pullXFrontierFeedback({ store, remote: new FakeRemote(emptyState()), receivedAt: DECIDED_AT });
    expect(store.listFeedbackFindings({ includeStale: true })).toMatchObject([{
      remoteFindingId: "xfrontier:finding:finding-1",
      upstreamStale: false,
      localDisposition: "unreviewed",
    }]);
    db.close();
  });

  it("rolls back finding ingestion when proposal reconciliation fails", async () => {
    const { db, store } = setup();
    const state = emptyState();
    state.findings.push({
      id: "finding-atomic",
      findingKind: "semantics-warning",
      scope: { scale: "field", field: "structures" },
      statement: "A finding that must not survive a partial pull.",
      evidence: "Atomic pull fixture.",
      by: "frontier-isles",
      byType: "model",
      filedBy: null,
      filedByRecorded: true,
      observedAtDatasetVersion: "xf-current123",
      timestamp: NOW,
      stale: false,
    });
    state.proposals.push({
      id: "proposal-collision",
      proposalKind: "annotation",
      recordId: 40,
      field: "mech",
      value: "value",
      rationale: "fixture",
      confidence: 0.5,
      by: "frontier-isles",
      byType: "model",
      datasetVersion: "xf-current123",
      timestamp: NOW,
      remoteStatus: "pending",
      decisionHistory: [],
      humanReviewed: false,
      localDisposition: null,
    });
    store.findFeedbackByRemoteReceiptId = () => {
      throw new Error("simulated remote receipt collision");
    };
    await expect(pullXFrontierFeedback({ store, remote: new FakeRemote(state), receivedAt: NOW }))
      .rejects.toThrow("simulated remote receipt collision");
    expect(store.listFeedbackFindings({ includeStale: true })).toEqual([]);
    db.close();
  });
});

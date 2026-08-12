import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { hashEvent, type ProblemObject } from "@frontier-isles/opp";
import Database from "better-sqlite3";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDb } from "../src/db.js";
import { seed } from "../src/seed.js";
import {
  FeedbackIdempotencyConflict,
  FeedbackSourceMissing,
  FeedbackStateConflict,
  Store,
} from "../src/store.js";

const T0 = "2026-08-13T00:00:00.000Z";
const T1 = "2026-08-13T00:01:00.000Z";
const T2 = "2026-08-13T00:02:00.000Z";
const T3 = "2026-08-13T00:03:00.000Z";

let store: Store;
let anchorRefHash: string;

beforeEach(() => {
  store = new Store(openDb(":memory:"));
  anchorRefHash = store.putRef("note", { purpose: "feedback test evidence anchor" });
});

afterEach(() => {
  store.db.close();
});

const envelope = (
  id: string,
  source: { ledgerEventHash?: string; refHash?: string } = { refHash: anchorRefHash },
) => ({
  schemaVersion: "xf-exchange/v1",
  clientEventId: id,
  origin: { system: "frontier-isles" },
  source,
  eventType: "corpus.finding",
  payload: { summary: `finding ${id}` },
});

const enqueue = (id: string, now = T0) =>
  store.enqueueFeedback({ idempotencyKey: `frontier-isles:${id}`, envelope: envelope(id), now });

describe("durable feedback outbox", () => {
  it("adds the exchange tables when opening a pre-feedback database", () => {
    const directory = mkdtempSync(join(tmpdir(), "frontier-isles-feedback-migration-"));
    const file = join(directory, "existing.sqlite");
    const legacy = new Database(file);
    legacy.exec(`
      CREATE TABLE problem_objects (
        op_id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, md_source TEXT NOT NULL,
        title TEXT NOT NULL, status TEXT NOT NULL, qfocus TEXT NOT NULL, json TEXT NOT NULL
      );
      INSERT INTO problem_objects VALUES (
        'op://frontier-isles/prob/preexisting', 'preexisting', 'legacy-md',
        'legacy title', 'active', 'legacy focus', '{}'
      );
    `);
    legacy.close();

    const migrated = openDb(file);
    try {
      expect(
        migrated.prepare("SELECT title FROM problem_objects WHERE slug = 'preexisting'").get(),
      ).toEqual({ title: "legacy title" });
      const migratedStore = new Store(migrated);
      const migratedRefHash = migratedStore.putRef("note", { purpose: "migration feedback anchor" });
      expect(
        migratedStore.enqueueFeedback({
          idempotencyKey: "frontier-isles:migrated",
          envelope: envelope("migrated", { refHash: migratedRefHash }),
          now: T0,
        }).item.state,
      ).toBe("pending");
    } finally {
      migrated.close();
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("enqueues transactionally and replays the same idempotency key without duplication", () => {
    const first = enqueue("one");
    expect(first.created).toBe(true);
    expect(first.item).toMatchObject({ state: "pending", idempotencyKey: "frontier-isles:one" });

    const replay = enqueue("one", T1);
    expect(replay).toEqual({ created: false, item: first.item });
    expect(store.listFeedbackOutbox()).toHaveLength(1);
    expect(() =>
      store.enqueueFeedback({
        idempotencyKey: "frontier-isles:one",
        envelope: envelope("different-content"),
        now: T1,
      }),
    ).toThrowError(FeedbackIdempotencyConflict);
  });

  it("requires every cited ledger event and ref to exist in this database", () => {
    expect(() =>
      store.enqueueFeedback({
        idempotencyKey: "frontier-isles:unanchored",
        envelope: { schemaVersion: "xf-exchange/v1", source: {}, payload: {} },
        now: T0,
      }),
    ).toThrow("needs a ledgerEventHash or refHash evidence anchor");
    expect(() =>
      store.enqueueFeedback({
        idempotencyKey: "frontier-isles:missing",
        envelope: envelope("missing", { ledgerEventHash: `sha256:${"a".repeat(64)}` }),
        now: T0,
      }),
    ).toThrowError(FeedbackSourceMissing);
    expect(store.listFeedbackOutbox()).toHaveLength(0);

    seed(store);
    const island = store.getProblemRow("machine-curiosity")!;
    const refHash = store.putRef("note", { observation: "local source" });
    const event = store.appendRaw(island.opId, {
      ts: T0,
      op: island.opId as ProblemObject["id"],
      actor: { id: "github:researcher", kind: "human" },
      credit: ["investigation"],
      phase: "A",
      action: "night_digest",
      ref: refHash,
    });
    const ledgerEventHash = hashEvent(event);

    const added = store.enqueueFeedback({
      idempotencyKey: "frontier-isles:anchored",
      envelope: envelope("anchored", { ledgerEventHash, refHash }),
      now: T1,
    });
    expect(added.item).toMatchObject({ sourceLedgerEventHash: ledgerEventHash, sourceRefHash: refHash });
  });

  it("leases the exact requested item, appends one attempt, and records success idempotently", () => {
    const first = enqueue("first").item;
    const second = enqueue("second", T1).item;
    const lease = store.leaseFeedbackDelivery({
      workerId: "cli:test",
      outboxId: second.id,
      now: T2,
      leaseMs: 60_000,
    })!;

    expect(lease.item.id).toBe(second.id);
    expect(store.getFeedbackOutbox(first.id)?.state).toBe("pending");
    expect(store.getFeedbackOutbox(second.id)?.state).toBe("in_flight");
    expect(store.listFeedbackDeliveryAttempts(second.id)).toEqual([lease.attempt]);

    const receipt = store.recordFeedbackDeliverySuccess({
      attemptId: lease.attempt.attemptId,
      leaseToken: lease.leaseToken,
      remoteReceiptId: "xf-finding:42",
      receipt: { findingId: 42 },
      at: T3,
    });
    expect(receipt).toMatchObject({ outcome: "success", remoteReceiptId: "xf-finding:42" });
    expect(store.getFeedbackOutbox(second.id)?.state).toBe("delivered");
    expect(store.findFeedbackByRemoteReceiptId("xf-finding:42")?.id).toBe(second.id);
    expect(store.findFeedbackByRemoteReceiptId("xf-finding:missing")).toBeUndefined();
    expect(
      store.recordFeedbackDeliverySuccess({
        attemptId: lease.attempt.attemptId,
        leaseToken: lease.leaseToken,
        remoteReceiptId: "xf-finding:42",
        receipt: { findingId: 42 },
        at: "2026-08-13T01:00:00.000Z",
      }),
    ).toEqual(receipt);
    expect(store.listFeedbackDeliveryReceipts(second.id)).toHaveLength(1);
  });

  it("turns a begun-call failure into uncertain and never leases it automatically", () => {
    const item = enqueue("failure").item;
    const lease = store.leaseFeedbackDelivery({ workerId: "cli:test", outboxId: item.id, now: T1 })!;
    const receipt = store.recordFeedbackDeliveryFailure({
      attemptId: lease.attempt.attemptId,
      leaseToken: lease.leaseToken,
      error: "connection reset after request write",
      at: T2,
    });
    expect(receipt.outcome).toBe("failure");
    expect(store.getFeedbackOutbox(item.id)?.state).toBe("uncertain");
    expect(store.leaseFeedbackDelivery({ workerId: "cli:retry", outboxId: item.id, now: T3 })).toBeUndefined();
  });

  it("requires an exact not_found reconciliation before retrying one immutable request", () => {
    const item = enqueue("reconcile-retry").item;
    const first = store.leaseFeedbackDelivery({ workerId: "cli:first", outboxId: item.id, now: T0 })!;
    store.recordFeedbackDeliveryFailure({
      attemptId: first.attempt.attemptId,
      leaseToken: first.leaseToken,
      error: "acknowledgement lost",
      at: T1,
    });
    const requestHash = `sha256:${"a".repeat(64)}`;
    const reconciliation = store.recordFeedbackDeliveryReconciliation({
      outboxId: item.id,
      clientEventId: item.idempotencyKey,
      requestHash,
      outcome: "not_found",
      detail: { found: false, authoritative: true },
      at: T2,
    });
    expect(reconciliation).toMatchObject({
      created: true,
      item: { state: "uncertain" },
      reconciliation: { outcome: "not_found", requestHash, basisAttemptId: first.attempt.attemptId },
    });
    expect(
      store.recordFeedbackDeliveryReconciliation({
        outboxId: item.id,
        clientEventId: item.idempotencyKey,
        requestHash,
        outcome: "not_found",
        detail: { found: false, authoritative: true },
        at: T3,
      }),
    ).toMatchObject({ created: false });
    expect(store.inspectFeedbackDelivery(item.id)?.lastReconciliation).toMatchObject({ outcome: "not_found" });
    expect(store.leaseFeedbackDelivery({ workerId: "cli:no-proof", outboxId: item.id, now: T3 })).toBeUndefined();
    expect(() =>
      store.leaseFeedbackDelivery({
        workerId: "cli:wrong-proof",
        outboxId: item.id,
        retry: { clientEventId: item.idempotencyKey, requestHash: `sha256:${"b".repeat(64)}` },
        now: T3,
      }),
    ).toThrowError(FeedbackStateConflict);

    const retry = store.leaseFeedbackDelivery({
      workerId: "cli:retry",
      outboxId: item.id,
      retry: { clientEventId: item.idempotencyKey, requestHash },
      now: T3,
    })!;
    expect(retry.attempt.attemptNo).toBe(2);
    expect(store.getFeedbackOutbox(item.id)?.state).toBe("in_flight");

    store.recordFeedbackDeliveryFailure({
      attemptId: retry.attempt.attemptId,
      leaseToken: retry.leaseToken,
      error: "second acknowledgement lost",
      at: "2026-08-13T00:04:00.000Z",
    });
    expect(() =>
      store.leaseFeedbackDelivery({
        workerId: "cli:stale-proof",
        outboxId: item.id,
        retry: { clientEventId: item.idempotencyKey, requestHash },
        now: "2026-08-13T00:05:00.000Z",
      }),
    ).toThrowError("fresh exact not_found reconciliation for the latest attempt");

    const refreshed = store.recordFeedbackDeliveryReconciliation({
      outboxId: item.id,
      clientEventId: item.idempotencyKey,
      requestHash,
      outcome: "not_found",
      detail: { found: false, authoritative: true },
      at: "2026-08-13T00:05:00.000Z",
    });
    expect(refreshed).toMatchObject({
      created: true,
      reconciliation: { basisAttemptId: retry.attempt.attemptId },
    });
    expect(
      store.leaseFeedbackDelivery({
        workerId: "cli:retry-again",
        outboxId: item.id,
        retry: { clientEventId: item.idempotencyKey, requestHash },
        now: "2026-08-13T00:06:00.000Z",
      })?.attempt.attemptNo,
    ).toBe(3);
  });

  it("closes an uncertain delivery from an exact found receipt without another attempt", () => {
    const item = enqueue("reconcile-found").item;
    const lease = store.leaseFeedbackDelivery({ workerId: "cli:first", outboxId: item.id, now: T0 })!;
    store.recordFeedbackDeliveryFailure({
      attemptId: lease.attempt.attemptId,
      leaseToken: lease.leaseToken,
      error: "local acknowledgement persistence failed",
      at: T1,
    });
    const requestHash = `sha256:${"c".repeat(64)}`;
    const found = store.recordFeedbackDeliveryReconciliation({
      outboxId: item.id,
      clientEventId: item.idempotencyKey,
      requestHash,
      outcome: "found",
      remoteReceiptId: "xf-finding:recovered",
      detail: { found: true, record: { id: "recovered" } },
      at: T2,
    });
    expect(found).toMatchObject({
      created: true,
      item: { state: "delivered" },
      reconciliation: { outcome: "found", remoteReceiptId: "xf-finding:recovered" },
    });
    expect(store.listFeedbackDeliveryAttempts(item.id)).toHaveLength(1);
    expect(store.findFeedbackByRemoteReceiptId("xf-finding:recovered")?.id).toBe(item.id);
    expect(
      store.recordFeedbackDeliveryReconciliation({
        outboxId: item.id,
        clientEventId: item.idempotencyKey,
        requestHash,
        outcome: "found",
        remoteReceiptId: "xf-finding:recovered",
        detail: { found: true, record: { id: "recovered" } },
        at: T3,
      }),
    ).toMatchObject({ created: false, item: { state: "delivered" } });
  });

  it("marks an expired in-flight call uncertain with an append-only lease receipt", () => {
    const item = enqueue("expired").item;
    const lease = store.leaseFeedbackDelivery({
      workerId: "cli:test",
      outboxId: item.id,
      now: T0,
      leaseMs: 1_000,
    })!;

    // Inspection is read-only even after wall-clock expiry: it exposes enough
    // detail for an operator to choose the explicit recovery command.
    expect(store.inspectFeedbackDelivery(item.id)).toMatchObject({
      item: { state: "in_flight" },
      activeLease: {
        attemptId: lease.attempt.attemptId,
        workerId: "cli:test",
        leaseExpiresAt: "2026-08-13T00:00:01.000Z",
      },
      lastAttempt: { attemptId: lease.attempt.attemptId, leaseExpiresAt: "2026-08-13T00:00:01.000Z" },
    });
    expect(store.listFeedbackOutbox("in_flight")).toHaveLength(1);
    expect(store.listFeedbackDeliveryReceipts(item.id)).toHaveLength(0);

    expect(store.recoverExpiredFeedbackDeliveries(T1)).toBe(1);
    expect(store.inspectFeedbackDelivery(item.id)).toMatchObject({
      item: { state: "uncertain" },
      lastAttempt: { attemptId: lease.attempt.attemptId, leaseExpiresAt: "2026-08-13T00:00:01.000Z" },
      lastReceipt: { attemptId: lease.attempt.attemptId, outcome: "lease_expired" },
    });
    expect(store.inspectFeedbackDelivery(item.id)?.activeLease).toBeUndefined();
    expect(store.recoverExpiredFeedbackDeliveries(T2)).toBe(0);
  });

  it("rejects a wrong lease capability without mutating the active attempt", () => {
    const item = enqueue("wrong-token").item;
    const lease = store.leaseFeedbackDelivery({ workerId: "cli:test", outboxId: item.id, now: T1 })!;

    expect(() =>
      store.recordFeedbackDeliveryFailure({
        attemptId: lease.attempt.attemptId,
        leaseToken: "not-the-token",
        error: "must not land",
        at: T2,
      }),
    ).toThrowError(FeedbackStateConflict);
    expect(store.getFeedbackOutbox(item.id)?.state).toBe("in_flight");
    expect(store.listFeedbackDeliveryReceipts(item.id)).toHaveLength(0);
  });

  it("reserves one remote receipt id at success write time", () => {
    const first = enqueue("remote-collision-a").item;
    const second = enqueue("remote-collision-b", T1).item;
    const firstLease = store.leaseFeedbackDelivery({ workerId: "worker:a", outboxId: first.id, now: T1 })!;
    const secondLease = store.leaseFeedbackDelivery({ workerId: "worker:b", outboxId: second.id, now: T1 })!;
    store.recordFeedbackDeliverySuccess({
      attemptId: firstLease.attempt.attemptId,
      leaseToken: firstLease.leaseToken,
      remoteReceiptId: "xf-proposal:collision",
      receipt: { proposalId: "collision" },
      at: T2,
    });

    expect(() =>
      store.recordFeedbackDeliverySuccess({
        attemptId: secondLease.attempt.attemptId,
        leaseToken: secondLease.leaseToken,
        remoteReceiptId: "xf-proposal:collision",
        receipt: { proposalId: "collision" },
        at: T3,
      }),
    ).toThrowError(FeedbackStateConflict);
    expect(store.findFeedbackByRemoteReceiptId("xf-proposal:collision")?.id).toBe(first.id);
    expect(store.getFeedbackOutbox(second.id)?.state).toBe("in_flight");
    expect(store.listFeedbackDeliveryReceipts(second.id)).toHaveLength(0);
  });

  it("enforces remote receipt uniqueness across independent Store connections", () => {
    const directory = mkdtempSync(join(tmpdir(), "frontier-isles-feedback-workers-"));
    const file = join(directory, "shared.sqlite");
    const dbA = openDb(file);
    const dbB = openDb(file);
    const storeA = new Store(dbA);
    const storeB = new Store(dbB);
    try {
      const sharedRef = storeA.putRef("note", { purpose: "cross-worker feedback anchor" });
      const itemA = storeA.enqueueFeedback({
        idempotencyKey: "frontier-isles:worker-a",
        envelope: envelope("worker-a", { refHash: sharedRef }),
        now: T0,
      }).item;
      const itemB = storeB.enqueueFeedback({
        idempotencyKey: "frontier-isles:worker-b",
        envelope: envelope("worker-b", { refHash: sharedRef }),
        now: T0,
      }).item;
      const leaseA = storeA.leaseFeedbackDelivery({ workerId: "process:a", outboxId: itemA.id, now: T1 })!;
      const leaseB = storeB.leaseFeedbackDelivery({ workerId: "process:b", outboxId: itemB.id, now: T1 })!;
      storeA.recordFeedbackDeliverySuccess({
        attemptId: leaseA.attempt.attemptId,
        leaseToken: leaseA.leaseToken,
        remoteReceiptId: "xf-finding:one-owner",
        receipt: { findingId: "one-owner" },
        at: T2,
      });

      expect(() =>
        storeB.recordFeedbackDeliverySuccess({
          attemptId: leaseB.attempt.attemptId,
          leaseToken: leaseB.leaseToken,
          remoteReceiptId: "xf-finding:one-owner",
          receipt: { findingId: "one-owner" },
          at: T3,
        }),
      ).toThrowError(FeedbackStateConflict);
      expect(storeB.findFeedbackByRemoteReceiptId("xf-finding:one-owner")?.id).toBe(itemA.id);
    } finally {
      dbB.close();
      dbA.close();
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("rejects a normal success when another connection already found that remote receipt", () => {
    const directory = mkdtempSync(join(tmpdir(), "frontier-isles-feedback-found-owner-"));
    const file = join(directory, "shared.sqlite");
    const dbA = openDb(file);
    const dbB = openDb(file);
    const storeA = new Store(dbA);
    const storeB = new Store(dbB);
    try {
      const sharedRef = storeA.putRef("note", { purpose: "found-before-success uniqueness anchor" });
      const itemA = storeA.enqueueFeedback({
        idempotencyKey: "frontier-isles:found-owner",
        envelope: envelope("found-owner", { refHash: sharedRef }),
        now: T0,
      }).item;
      const itemB = storeB.enqueueFeedback({
        idempotencyKey: "frontier-isles:late-success",
        envelope: envelope("late-success", { refHash: sharedRef }),
        now: T0,
      }).item;
      const leaseA = storeA.leaseFeedbackDelivery({ workerId: "process:a", outboxId: itemA.id, now: T1 })!;
      storeA.recordFeedbackDeliveryFailure({
        attemptId: leaseA.attempt.attemptId,
        leaseToken: leaseA.leaseToken,
        error: "acknowledgement lost",
        at: T2,
      });
      storeA.recordFeedbackDeliveryReconciliation({
        outboxId: itemA.id,
        clientEventId: itemA.idempotencyKey,
        requestHash: `sha256:${"d".repeat(64)}`,
        outcome: "found",
        remoteReceiptId: "xf-proposal:found-owner",
        detail: { found: true },
        at: T3,
      });

      const leaseB = storeB.leaseFeedbackDelivery({
        workerId: "process:b",
        outboxId: itemB.id,
        now: "2026-08-13T00:04:00.000Z",
      })!;
      expect(() =>
        storeB.recordFeedbackDeliverySuccess({
          attemptId: leaseB.attempt.attemptId,
          leaseToken: leaseB.leaseToken,
          remoteReceiptId: "xf-proposal:found-owner",
          receipt: { proposalId: "found-owner" },
          at: "2026-08-13T00:05:00.000Z",
        }),
      ).toThrowError(FeedbackStateConflict);
      expect(storeB.getFeedbackOutbox(itemB.id)?.state).toBe("in_flight");
      expect(storeB.listFeedbackDeliveryReceipts(itemB.id)).toHaveLength(0);
      expect(storeB.findFeedbackByRemoteReceiptId("xf-proposal:found-owner")?.id).toBe(itemA.id);
    } finally {
      dbB.close();
      dbA.close();
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("allows cancellation only before any delivery attempt begins", () => {
    const pending = enqueue("cancel-pending").item;
    expect(store.cancelFeedback(pending.id, "operator withdrew draft", T1)).toMatchObject({
      state: "cancelled",
      cancelledReason: "operator withdrew draft",
    });
    expect(() => store.cancelFeedback(pending.id, "operator withdrew draft", T2)).toThrowError(
      FeedbackStateConflict,
    );

    const uncertain = enqueue("cancel-uncertain").item;
    const lease = store.leaseFeedbackDelivery({ workerId: "cli:test", outboxId: uncertain.id, now: T1 })!;
    store.recordFeedbackDeliveryFailure({
      attemptId: lease.attempt.attemptId,
      leaseToken: lease.leaseToken,
      error: "remote outcome unknown",
      at: T2,
    });
    expect(() => store.cancelFeedback(uncertain.id, "hide uncertainty", T3)).toThrowError(
      FeedbackStateConflict,
    );
    expect(store.getFeedbackOutbox(uncertain.id)?.state).toBe("uncertain");
  });
});

describe("feedback review inbox", () => {
  it("keeps accepted separate from acknowledged, applied, and released", () => {
    const item = enqueue("review").item;
    const accepted = store.upsertFeedbackReviewDecision({
      outboxId: item.id,
      decisionId: "decision:1",
      status: "accepted",
      decision: { reviewer: "human", note: "accepted for application" },
      decidedAt: T1,
      receivedAt: T2,
    });
    expect(accepted.created).toBe(true);
    expect(accepted.inbox).toMatchObject({ remoteStatus: "accepted", localDisposition: "unreviewed" });
    expect(store.listFeedbackReviewDecisions(item.id)).toHaveLength(1);

    expect(
      store.upsertFeedbackReviewDecision({
        outboxId: item.id,
        decisionId: "decision:1",
        status: "accepted",
        decision: { reviewer: "human", note: "accepted for application" },
        decidedAt: T1,
        receivedAt: T3,
      }).created,
    ).toBe(false);
    expect(store.listFeedbackReviewDecisions(item.id)).toHaveLength(1);

    expect(store.setFeedbackLocalDisposition(item.id, "acknowledged", T2).localDisposition).toBe("acknowledged");
    expect(store.setFeedbackLocalDisposition(item.id, "applied", T3).localDisposition).toBe("applied");
    expect(
      store.setFeedbackLocalDisposition(item.id, "released", "2026-08-13T00:04:00.000Z").localDisposition,
    ).toBe("released");
    const reversed = store.upsertFeedbackReviewDecision({
      outboxId: item.id,
      decisionId: "decision:2",
      status: "rejected",
      decision: { reviewer: "human", note: "acceptance withdrawn after release" },
      decidedAt: "2026-08-13T00:05:00.000Z",
      receivedAt: "2026-08-13T00:06:00.000Z",
    });
    expect(reversed.inbox).toMatchObject({
      remoteStatus: "rejected",
      localDisposition: "released",
      needsReconciliation: true,
    });
    const reaccepted = store.upsertFeedbackReviewDecision({
      outboxId: item.id,
      decisionId: "decision:3",
      status: "accepted",
      decision: { reviewer: "human", note: "reaccepted after reconciliation" },
      decidedAt: "2026-08-13T00:07:00.000Z",
      receivedAt: "2026-08-13T00:08:00.000Z",
    });
    expect(reaccepted.inbox).toMatchObject({
      remoteStatus: "accepted",
      localDisposition: "released",
      needsReconciliation: false,
    });
  });

  it("preserves local review state across later remote decisions and blocks false application", () => {
    const item = enqueue("rejected").item;
    store.upsertFeedbackReviewDecision({
      outboxId: item.id,
      decisionId: "decision:pending",
      status: "pending",
      decision: {},
      decidedAt: T1,
    });
    store.setFeedbackLocalDisposition(item.id, "acknowledged", T2);
    const rejected = store.upsertFeedbackReviewDecision({
      outboxId: item.id,
      decisionId: "decision:rejected",
      status: "rejected",
      decision: { reason: "not canonical" },
      decidedAt: T3,
    });
    expect(rejected.inbox).toMatchObject({
      remoteStatus: "rejected",
      localDisposition: "acknowledged",
      needsReconciliation: false,
    });
    expect(() => store.setFeedbackLocalDisposition(item.id, "applied", T3)).toThrowError(FeedbackStateConflict);
    expect(store.listFeedbackReviewDecisions(item.id).map((decision) => decision.remoteStatus)).toEqual([
      "pending",
      "rejected",
    ]);
  });
});

describe("remote feedback finding inbox", () => {
  it("uses explicit upstream stale, preserves missing rows, and keeps independent local review", () => {
    expect(
      store.upsertFeedbackFindings({
        datasetVersion: "xf-v1",
        findings: [
          { remoteFindingId: "finding:1", finding: { note: "first" }, upstreamStale: false },
          { remoteFindingId: "finding:2", finding: { note: "second" }, upstreamStale: true },
        ],
        observedAt: T0,
      }),
    ).toEqual({ upserted: 2 });
    expect(store.setFeedbackFindingLocalDisposition("finding:1", "acknowledged", T1).localDisposition).toBe(
      "acknowledged",
    );

    expect(
      store.upsertFeedbackFindings({
        datasetVersion: "xf-v2",
        findings: [
          { remoteFindingId: "finding:1", finding: { note: "first, revised" }, upstreamStale: false },
        ],
        observedAt: T2,
      }),
    ).toEqual({ upserted: 1 });
    expect(store.listFeedbackFindings()).toMatchObject([
      {
        remoteFindingId: "finding:1",
        datasetVersion: "xf-v2",
        finding: { note: "first, revised" },
        upstreamStale: false,
        localDisposition: "acknowledged",
      },
    ]);
    expect(store.listFeedbackFindings({ includeStale: true })).toMatchObject([
      { remoteFindingId: "finding:1", upstreamStale: false, localDisposition: "acknowledged" },
      {
        remoteFindingId: "finding:2",
        datasetVersion: "xf-v1",
        finding: { note: "second" },
        upstreamStale: true,
        localDisposition: "unreviewed",
      },
    ]);
    expect(store.setFeedbackFindingLocalDisposition("finding:1", "addressed", T3).localDisposition).toBe(
      "addressed",
    );
  });
});

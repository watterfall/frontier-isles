import { describe, expect, it } from "vitest";
import type { XFrontierFeedbackToolIntent } from "@frontier-isles/data/xfrontier-feedback";
import {
  assertXFrontierFeedbackProtocolVersion,
  assertXFrontierReadTool,
  parseXFrontierReceiptLookup,
  parseXFrontierDeliveryAck,
  readXFrontierStructuredResult,
} from "../src/xfrontier-feedback-client.js";

const HASH = `sha256:${"a".repeat(64)}`;

const argumentsFor = (
  toolName: XFrontierFeedbackToolIntent["toolName"],
): XFrontierFeedbackToolIntent["arguments"] => {
  if (toolName === "report_finding") {
    return {
      scale: "population",
      predicate: "s[6] < 3",
      n: 380,
      kind: "excluded-subset",
      statement: "The downstream gate excludes this reproducible subset.",
      evidence: "A locally reproducible observation.",
      by: "frontier-isles",
      filed_by: null,
    };
  }
  if (toolName === "propose_annotation") {
    return {
      record_id: 40,
      field: "mech",
      value: "A local mechanism statement.",
      rationale: "The record states the quantities explicitly.",
      confidence: 0.8,
      by: "frontier-isles",
    };
  }
  return {
    record_id: 40,
    structure_id: "ISO-03",
    evidence: "A locally reproducible observation.",
    rationale: "The shared skeleton survives the boundary check.",
    confidence: 0.7,
    by: "frontier-isles",
  };
};

const intent = (toolName: XFrontierFeedbackToolIntent["toolName"]): XFrontierFeedbackToolIntent => ({
  toolName,
  arguments: argumentsFor(toolName),
  idempotencyKey: "frontier-isles:test:feedback-001",
  source: {
    system: "frontier-isles",
    ledgerRef: "ledger://test/event-001",
    ledgerEventHash: HASH,
    evidence: "A locally reproducible observation.",
  },
  targetDatasetVersion: "xf-current123",
  remoteIdempotency: "unsupported",
  requiresExplicitSubmission: true,
});

describe("xFrontier feedback MCP result boundary", () => {
  it("accepts structured content and JSON text compatibility responses", () => {
    expect(readXFrontierStructuredResult({ structuredContent: { ok: true }, isError: false }, "tool"))
      .toEqual({ ok: true });
    expect(readXFrontierStructuredResult({
      content: [{ type: "text", text: JSON.stringify({ ok: true }) }],
      isError: false,
    }, "tool")).toEqual({ ok: true });
  });

  it("never treats tool errors or malformed content as acknowledgements", () => {
    expect(() => readXFrontierStructuredResult({ isError: true, content: [] }, "tool"))
      .toThrow("MCP tool error");
    expect(() => readXFrontierStructuredResult({ content: [{ type: "image" }] }, "tool"))
      .toThrow("no structured or JSON text content");
  });

  it("validates finding and proposal receipt identities", () => {
    expect(parseXFrontierDeliveryAck(intent("report_finding"), {
      dataset_version: "xf-current123",
      filed: {
        kind: "finding",
        id: "finding-1",
        finding_kind: "excluded-subset",
        scope: { scale: "population", predicate: "s[6] < 3", n: 380 },
        statement: "The downstream gate excludes this reproducible subset.",
        evidence: "A locally reproducible observation.",
        by: "frontier-isles",
        filed_by: null,
        by_type: "model",
        observed_at_dataset_version: "xf-current123",
        timestamp: "2026-08-13T01:00:00.000Z",
      },
      corpus_changed: false,
    })).toMatchObject({ remoteKind: "finding", remoteId: "finding-1", corpusChanged: false });

    expect(parseXFrontierDeliveryAck(intent("propose_annotation"), {
      dataset_version: "xf-current123",
      queued: {
        kind: "proposal",
        id: "proposal-1",
        proposal_kind: "annotation",
        record_id: 40,
        field: "mech",
        value: "A local mechanism statement.",
        rationale: "The record states the quantities explicitly.",
        confidence: 0.8,
        by: "frontier-isles",
        by_type: "model",
        dataset_version: "xf-current123",
        timestamp: "2026-08-13T01:00:00.000Z",
      },
      corpus_changed: false,
    })).toMatchObject({ remoteKind: "proposal", remoteId: "proposal-1", datasetVersion: "xf-current123" });

    expect(parseXFrontierDeliveryAck(intent("propose_structure_link"), {
      dataset_version: "xf-current123",
      queued: {
        kind: "proposal",
        id: "proposal-2",
        proposal_kind: "structure-link",
        record_id: 40,
        structure_id: "ISO-03",
        evidence: "A locally reproducible observation.",
        rationale: "The shared skeleton survives the boundary check.",
        confidence: 0.7,
        by: "frontier-isles",
        by_type: "model",
        dataset_version: "xf-current123",
        timestamp: "2026-08-13T01:00:00.000Z",
      },
      corpus_changed: false,
    })).toMatchObject({ remoteKind: "proposal", remoteId: "proposal-2" });
  });

  it("rejects ambiguous acknowledgements after the write boundary", () => {
    expect(() => parseXFrontierDeliveryAck(intent("propose_structure_link"), {
      dataset_version: "xf-current123",
      queued: { kind: "finding", id: "wrong-kind", timestamp: "2026-08-13T01:00:00.000Z" },
      corpus_changed: false,
    })).toThrow("acknowledgement kind must be proposal");
    expect(() => parseXFrontierDeliveryAck(intent("report_finding"), {
      dataset_version: "xf-current123",
      filed: { kind: "finding", id: "finding-1", timestamp: "2026-08-13T01:00:00.000Z" },
      corpus_changed: true,
    })).toThrow("did not affirm corpus_changed=false");
  });

  it("binds a strong 0.6 acknowledgement and exact lookup to the caller event and request hash", () => {
    const strong = {
      ...intent("propose_annotation"),
      arguments: {
        ...argumentsFor("propose_annotation"),
        client_event_id: "frontier-isles:test:feedback-001",
        expected_dataset_version: "xf-current123",
        expected_content_hash: "deadbeef",
      },
      clientEventId: "frontier-isles:test:feedback-001",
      requestHash: `sha256:${"b".repeat(64)}`,
      targetContentHash: "deadbeef",
      remoteIdempotency: "client-event-id" as const,
      receiptLookup: true as const,
    };
    const record = {
      kind: "proposal",
      id: "proposal-strong",
      proposal_kind: "annotation",
      record_id: 40,
      field: "mech",
      value: "A local mechanism statement.",
      rationale: "The record states the quantities explicitly.",
      confidence: 0.8,
      by: "frontier-isles",
      by_type: "model",
      dataset_version: "xf-current123",
      timestamp: "2026-08-13T01:00:00.000Z",
      client_event_id: strong.clientEventId,
      request_hash: strong.requestHash,
    };
    const receipt = {
      client_event_id: strong.clientEventId,
      request_hash: strong.requestHash,
      record_kind: "proposal",
      record_id: record.id,
      dataset_version: "xf-current123",
      stored_at: record.timestamp,
    };
    expect(parseXFrontierDeliveryAck(strong, {
      dataset_version: "xf-current123",
      queued: record,
      client_event_id: strong.clientEventId,
      request_hash: strong.requestHash,
      receipt,
      idempotent_replay: false,
      corpus_changed: false,
    })).toMatchObject({
      clientEventId: strong.clientEventId,
      requestHash: strong.requestHash,
      idempotentReplay: false,
    });
    expect(parseXFrontierReceiptLookup(strong, {
      dataset_version: "xf-newer456",
      found: true,
      client_event_id: strong.clientEventId,
      request_hash: strong.requestHash,
      receipt,
      record,
      note: "Recovered an immutable feedback receipt.",
    })).toMatchObject({
      found: true,
      currentDatasetVersion: "xf-newer456",
      acknowledgement: {
        datasetVersion: "xf-current123",
        currentDatasetVersion: "xf-newer456",
        idempotentReplay: true,
      },
    });
    expect(parseXFrontierReceiptLookup(strong, {
      dataset_version: "xf-newer456",
      found: false,
      client_event_id: strong.clientEventId,
      receipt: null,
      record: null,
      note: "No committed feedback receipt has this client_event_id.",
    })).toMatchObject({ found: false, currentDatasetVersion: "xf-newer456" });
    expect(() => parseXFrontierReceiptLookup(strong, {
      dataset_version: "xf-newer456",
      found: false,
      client_event_id: strong.clientEventId,
      request_hash: strong.requestHash,
      receipt,
      record,
      note: "Contradictory negative response.",
    })).toThrow("get_feedback_receipt.request_hash is not allowed");
    expect(() => parseXFrontierReceiptLookup(strong, {
      dataset_version: "xf-newer456",
      found: false,
      client_event_id: strong.clientEventId,
      receipt,
      record: null,
      note: "Contradictory negative response.",
    })).toThrow("found=false requires null receipt and record");
  });

  it("rejects acknowledgements that do not bind the submitted content", () => {
    expect(() => parseXFrontierDeliveryAck(intent("report_finding"), {
      dataset_version: "xf-current123",
      filed: {
        kind: "finding",
        id: "finding-1",
        finding_kind: "excluded-subset",
        scope: { scale: "population", predicate: "s[6] <= 3", n: 380 },
        statement: "The downstream gate excludes this reproducible subset.",
        evidence: "A locally reproducible observation.",
        by: "frontier-isles",
        filed_by: null,
        by_type: "model",
        observed_at_dataset_version: "xf-current123",
        timestamp: "2026-08-13T01:00:00.000Z",
      },
      corpus_changed: false,
    })).toThrow("scope.predicate does not match submitted intent");

    expect(() => parseXFrontierDeliveryAck(intent("propose_annotation"), {
      dataset_version: "xf-current123",
      queued: {
        kind: "proposal",
        id: "proposal-1",
        proposal_kind: "annotation",
        record_id: 40,
        field: "wrong_field",
        value: "A local mechanism statement.",
        rationale: "The record states the quantities explicitly.",
        confidence: 0.8,
        by: "frontier-isles",
        by_type: "model",
        dataset_version: "xf-current123",
        timestamp: "2026-08-13T01:00:00.000Z",
      },
      corpus_changed: false,
    })).toThrow("queued field does not match submitted intent");
  });

  it("rejects root, nested, or submitted dataset version mismatches", () => {
    const ack = {
      dataset_version: "xf-current123",
      queued: {
        kind: "proposal",
        id: "proposal-1",
        proposal_kind: "annotation",
        record_id: 40,
        field: "mech",
        value: "A local mechanism statement.",
        rationale: "The record states the quantities explicitly.",
        confidence: 0.8,
        by: "frontier-isles",
        by_type: "model",
        dataset_version: "xf-current123",
        timestamp: "2026-08-13T01:00:00.000Z",
      },
      corpus_changed: false,
    };
    expect(() => parseXFrontierDeliveryAck(intent("propose_annotation"), {
      ...ack,
      dataset_version: "xf-newer456",
    })).toThrow("does not match submitted intent xf-current123");
    expect(() => parseXFrontierDeliveryAck(intent("propose_annotation"), {
      ...ack,
      queued: { ...ack.queued, dataset_version: "xf-newer456" },
    })).toThrow("stored dataset_version does not match submitted intent");
  });

  it("requires the reviewed 0.5.0 read-tool safety contract", () => {
    const safe = {
      name: "list_findings",
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    };
    expect(() => assertXFrontierReadTool([safe], "list_findings")).not.toThrow();
    expect(() => assertXFrontierReadTool([{ name: "list_findings" }], "list_findings"))
      .toThrow("list_findings annotations must be an object");
    expect(() => assertXFrontierReadTool([{
      ...safe,
      annotations: { readOnlyHint: true, destructiveHint: false },
    }], "list_findings")).toThrow("safety annotations changed");
    expect(assertXFrontierFeedbackProtocolVersion("0.5.0", "read")).toBe("0.5.0");
    expect(assertXFrontierFeedbackProtocolVersion("0.6.0", "read")).toBe("0.6.0");
    expect(assertXFrontierFeedbackProtocolVersion("0.6.0", "strong-write")).toBe("0.6.0");
    expect(() => assertXFrontierFeedbackProtocolVersion("0.5.0", "strong-write"))
      .toThrow("for strong-write");
    expect(() => assertXFrontierFeedbackProtocolVersion("0.7.0", "read"))
      .toThrow("unreviewed xFrontier feedback protocol 0.7.0");
  });
});

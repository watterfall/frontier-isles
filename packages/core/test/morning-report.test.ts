import { describe, it, expect } from "vitest";
import { appendEvent, type LedgerEvent, type UnchainedEvent } from "@frontier-isles/opp";
import { projectMorningReport, type ResolvedRef } from "../src/index";

const OP = "op://frontier-isles/prob/machine-curiosity";

const evt = (over: Partial<UnchainedEvent>): UnchainedEvent => ({
  ts: "2026-07-10T02:00:00.000Z",
  op: OP,
  actor: { id: "github:curiosity-scout", kind: "agent" },
  credit: ["credit:ai/literature_synthesis"],
  phase: "A",
  action: "night_digest",
  ...over,
});

function chain(...parts: Array<Partial<UnchainedEvent>>): LedgerEvent[] {
  let c: LedgerEvent[] = [];
  for (const p of parts) c = appendEvent(c, evt(p));
  return c;
}

/** A tiny in-memory ref store — mirrors `store.putRef`/`store.getRef` shape. */
function refStore(entries: Record<string, ResolvedRef>): (ref: string) => ResolvedRef | undefined {
  return (ref) => entries[ref];
}

describe("projectMorningReport (Phase B.1 — morning report from the real ledger)", () => {
  it("returns [] for an empty ledger", () => {
    expect(projectMorningReport([], { resolveRef: refStore({}) })).toEqual([]);
  });

  it("returns [] for a night with no dock drafts (only unrelated events)", () => {
    const events = chain(
      { action: "propose_subquestion", phase: "A" },
      { action: "submit_claim", phase: "D" },
    );
    expect(projectMorningReport(events, { resolveRef: refStore({}) })).toEqual([]);
  });

  it("picks up a night_digest draft whose ref is morning_report-kind, tagged pending", () => {
    const refs = refStore({
      "ref:1": { kind: "morning_report", content: { title: "12 篇新文摘要", dest: "library" } },
    });
    const events = chain({ ref: "ref:1" });
    const out = projectMorningReport(events, { resolveRef: refs, now: "2026-07-10T06:00:00.000Z" });
    expect(out).toEqual([
      {
        title: "12 篇新文摘要",
        dest: "library",
        actorId: "github:curiosity-scout",
        actorKind: "agent",
        credit: ["credit:ai/literature_synthesis"],
        eventRef: "ref:1",
        ts: "2026-07-10T02:00:00.000Z",
        status: "pending",
      },
    ]);
  });

  it("also picks up dock_proposal-kind refs (degraded-agent-push shape)", () => {
    const refs = refStore({
      "ref:1": { kind: "dock_proposal", content: { text: "疑似反例清单", station: "questions" } },
    });
    const events = chain({ ref: "ref:1" });
    const out = projectMorningReport(events, { resolveRef: refs, now: "2026-07-10T06:00:00.000Z" });
    expect(out).toHaveLength(1);
    expect(out[0]!.title).toBe("疑似反例清单");
    expect(out[0]!.dest).toBe("questions");
  });

  it("ignores a night_digest whose ref is driftwood-kind (a plain pickup, not a dock draft)", () => {
    const refs = refStore({
      "ref:1": { kind: "driftwood", content: { atom: "sketch", text: "陶土原型机" } },
    });
    const events = chain({ ref: "ref:1" });
    expect(projectMorningReport(events, { resolveRef: refs })).toEqual([]);
  });

  it("ignores a human-authored night_digest (morning report is the AI side of HITL)", () => {
    const refs = refStore({
      "ref:1": { kind: "morning_report", content: { title: "人工笔记", dest: "gallery" } },
    });
    const events = chain({ ref: "ref:1", actor: { id: "github:shen-kuo", kind: "human" } });
    expect(projectMorningReport(events, { resolveRef: refs })).toEqual([]);
  });

  it("ignores a pair-authored night_digest too — only pure agent drafts count", () => {
    const refs = refStore({
      "ref:1": { kind: "morning_report", content: { title: "联合草案", dest: "gallery" } },
    });
    const events = chain({ ref: "ref:1", actor: { id: "github:shen-kuo", kind: "pair" } });
    expect(projectMorningReport(events, { resolveRef: refs })).toEqual([]);
  });

  it("multiple agents in one night each produce their own entry, sorted by ts", () => {
    const refs = refStore({
      "ref:a": { kind: "morning_report", content: { title: "A", dest: "library" } },
      "ref:b": { kind: "morning_report", content: { title: "B", dest: "canvas" } },
      "ref:c": { kind: "dock_proposal", content: { text: "C", station: "questions" } },
    });
    const events = chain(
      { ref: "ref:b", ts: "2026-07-10T03:00:00.000Z", actor: { id: "github:synthesizer", kind: "agent" } },
      { ref: "ref:a", ts: "2026-07-10T01:00:00.000Z", actor: { id: "github:curiosity-scout", kind: "agent" } },
      { ref: "ref:c", ts: "2026-07-10T02:00:00.000Z", actor: { id: "github:devils-advocate", kind: "agent" } },
    );
    const out = projectMorningReport(events, { resolveRef: refs, now: "2026-07-10T06:00:00.000Z" });
    expect(out.map((e) => e.title)).toEqual(["A", "C", "B"]);
    expect(out.map((e) => e.actorId)).toEqual([
      "github:curiosity-scout",
      "github:devils-advocate",
      "github:synthesizer",
    ]);
  });

  it("marks a draft adopted when a later `adopt` event carries the same ref", () => {
    const refs = refStore({
      "ref:1": { kind: "morning_report", content: { title: "A", dest: "library" } },
    });
    const events = chain(
      { ref: "ref:1", ts: "2026-07-10T02:00:00.000Z" },
      {
        ref: "ref:1",
        ts: "2026-07-10T09:00:00.000Z",
        action: "adopt",
        phase: "D",
        actor: { id: "github:shen-kuo", kind: "pair" },
        credit: ["curation", "credit:ai/literature_synthesis"],
      },
    );
    const out = projectMorningReport(events, { resolveRef: refs, now: "2026-07-10T10:00:00.000Z" });
    expect(out).toHaveLength(1);
    expect(out[0]!.status).toBe("adopted");
  });

  it("marks a draft returned when a later `return_to_driftwood` event carries the same ref", () => {
    const refs = refStore({
      "ref:1": { kind: "morning_report", content: { title: "A", dest: "library" } },
    });
    const events = chain(
      { ref: "ref:1", ts: "2026-07-10T02:00:00.000Z" },
      {
        ref: "ref:1",
        ts: "2026-07-10T09:00:00.000Z",
        action: "return_to_driftwood",
        phase: "A",
        actor: { id: "github:shen-kuo", kind: "human" },
        credit: ["curation"],
      },
    );
    const out = projectMorningReport(events, { resolveRef: refs, now: "2026-07-10T10:00:00.000Z" });
    expect(out).toHaveLength(1);
    expect(out[0]!.status).toBe("returned");
  });

  it("resolves status even when the decision event falls outside the draft's own window (resolution scan is ledger-wide)", () => {
    const refs = refStore({
      "ref:1": { kind: "morning_report", content: { title: "A", dest: "library" } },
    });
    const events = chain(
      { ref: "ref:1", ts: "2026-07-08T02:00:00.000Z" },
      {
        ref: "ref:1",
        ts: "2026-07-09T09:00:00.000Z", // next day — outside a 24h window anchored on the draft itself
        action: "adopt",
        phase: "D",
        actor: { id: "github:shen-kuo", kind: "pair" },
        credit: ["curation"],
      },
    );
    // A wide window so the draft itself is still included; the resolution scan is unconditional.
    const out = projectMorningReport(events, {
      resolveRef: refs,
      since: "2026-07-01T00:00:00.000Z",
      now: "2026-07-10T00:00:00.000Z",
    });
    expect(out).toHaveLength(1);
    expect(out[0]!.status).toBe("adopted");
  });

  it("window boundary: default 24h window (anchored on the latest candidate ts, never wall-clock) excludes an older draft", () => {
    const refs = refStore({
      "ref:new": { kind: "morning_report", content: { title: "recent", dest: "library" } },
      "ref:old": { kind: "morning_report", content: { title: "stale", dest: "library" } },
    });
    const events = chain(
      { ref: "ref:new", ts: "2026-07-10T02:00:00.000Z" },
      { ref: "ref:old", ts: "2026-07-08T02:00:00.000Z" }, // 2 days before the newest candidate
    );
    // No `now` given → anchors on the max candidate ts (2026-07-10T02:00:00Z), default windowMs = 24h.
    const out = projectMorningReport(events, { resolveRef: refs });
    expect(out.map((e) => e.title)).toEqual(["recent"]);
  });

  it("a custom windowMs narrows or widens the recency cutoff", () => {
    const refs = refStore({
      "ref:1": { kind: "morning_report", content: { title: "A", dest: "library" } },
    });
    const events = chain({ ref: "ref:1", ts: "2026-07-08T02:00:00.000Z" });
    const now = "2026-07-10T02:00:00.000Z"; // 2 days later
    expect(projectMorningReport(events, { resolveRef: refs, now, windowMs: 24 * 3600_000 })).toEqual([]);
    expect(
      projectMorningReport(events, { resolveRef: refs, now, windowMs: 3 * 24 * 3600_000 }),
    ).toHaveLength(1);
  });

  it("an explicit `since` overrides windowMs entirely", () => {
    const refs = refStore({
      "ref:1": { kind: "morning_report", content: { title: "A", dest: "library" } },
    });
    const events = chain({ ref: "ref:1", ts: "2026-07-01T00:00:00.000Z" });
    const out = projectMorningReport(events, {
      resolveRef: refs,
      since: "2026-06-01T00:00:00.000Z",
      now: "2026-07-10T00:00:00.000Z",
    });
    expect(out).toHaveLength(1);
  });

  it("without a resolveRef, returns [] rather than guessing at content", () => {
    const events = chain({ ref: "ref:1" });
    expect(projectMorningReport(events)).toEqual([]);
  });
});

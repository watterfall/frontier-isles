import { describe, it, expect } from "vitest";
import { appendEvent, type LedgerEvent, type UnchainedEvent } from "@frontier-isles/opp";
import { projectActiveStations } from "../src/index";

const OP = "op://frontier-isles/prob/machine-curiosity";

const evt = (over: Partial<UnchainedEvent>): UnchainedEvent => ({
  ts: "2026-07-07T00:00:00.000Z",
  op: OP,
  actor: { id: "github:alice", kind: "human" },
  credit: [],
  phase: "A",
  action: "found_island",
  ...over,
});

function chain(...parts: Array<Partial<UnchainedEvent>>): LedgerEvent[] {
  let c: LedgerEvent[] = [];
  for (const p of parts) c = appendEvent(c, evt(p));
  return c;
}

/**
 * M8 微动态第二批 (scene-upgrade OUTSTANDING.md P1): chimney smoke / flag wave
 * are bound to `projectActiveStations`, not a decorative always-on loop.
 */
describe("projectActiveStations (M8 micro-dynamics data binding)", () => {
  it("maps events to stations via the same ACTION_STATION table projectGrowth uses", () => {
    const events = chain(
      { action: "propose_subquestion" }, // questions
      { action: "submit_claim", phase: "D" }, // workshop
      { action: "bridge_artifact", phase: "B" }, // dock
      { action: "publish", phase: "B" }, // gallery
      { action: "return_to_driftwood" }, // driftwood
    );
    const active = projectActiveStations(events);
    expect(active).toEqual(new Set(["questions", "workshop", "dock", "gallery", "driftwood"]));
  });

  it("never marks canvas/library/tearoom active — they have no ledger action (architecture §3 「never metricized」 for tearoom)", () => {
    const events = chain({ action: "found_island" }, { action: "submit_claim", phase: "D" });
    const active = projectActiveStations(events);
    expect(active.has("canvas")).toBe(false);
    expect(active.has("library")).toBe(false);
    expect(active.has("tearoom")).toBe(false);
  });

  it("never marks `data` active either — NOT by design (unlike canvas/library/tearoom), but because the protocol has no dedicated dataset verb yet; documents the gap rather than hiding it", () => {
    const everything = chain(
      { action: "found_island" },
      { action: "submit_claim", phase: "D" },
      { action: "validate", phase: "B" },
      { action: "publish", phase: "B" },
      { action: "bridge_artifact", phase: "B" },
      { action: "return_to_driftwood" },
    );
    expect(projectActiveStations(everything).has("data")).toBe(false);
  });

  it("without `now`, any station the ledger ever touched counts (best-effort demo mode)", () => {
    const old = chain({ action: "submit_claim", ts: "2020-01-01T00:00:00.000Z", phase: "D" });
    expect(projectActiveStations(old).has("workshop")).toBe(true);
  });

  it("with `now`, only recent activity (within windowDays, default 14) counts", () => {
    const events = chain(
      { action: "submit_claim", ts: "2026-07-01T00:00:00.000Z", phase: "D" }, // workshop, 6 days before now
      { action: "publish", ts: "2025-01-01T00:00:00.000Z", phase: "B" }, // gallery, long ago
    );
    const now = "2026-07-07T00:00:00.000Z";
    const active = projectActiveStations(events, { now });
    expect(active.has("workshop")).toBe(true);
    expect(active.has("gallery")).toBe(false);
  });

  it("a custom windowDays narrows or widens the recency cutoff", () => {
    const events = chain({ action: "submit_claim", ts: "2026-07-01T00:00:00.000Z", phase: "D" }); // 6 days before now
    const now = "2026-07-07T00:00:00.000Z";
    expect(projectActiveStations(events, { now, windowDays: 3 }).has("workshop")).toBe(false);
    expect(projectActiveStations(events, { now, windowDays: 10 }).has("workshop")).toBe(true);
  });

  it("keeps only a station's LATEST touch when deciding recency", () => {
    const events = chain(
      { action: "submit_claim", ts: "2020-01-01T00:00:00.000Z", phase: "D" }, // workshop, ancient
      { action: "validate", ts: "2026-07-06T00:00:00.000Z", phase: "B" }, // workshop, yesterday
    );
    const now = "2026-07-07T00:00:00.000Z";
    expect(projectActiveStations(events, { now, windowDays: 14 }).has("workshop")).toBe(true);
  });

  it("returns an empty set for an empty ledger", () => {
    expect(projectActiveStations([]).size).toBe(0);
    expect(projectActiveStations([], { now: "2026-07-07T00:00:00.000Z" }).size).toBe(0);
  });
});

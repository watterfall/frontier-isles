import { describe, expect, it } from "vitest";
import type { LedgerEvent } from "@frontier-isles/opp";
import { projectNightTimeline, TIMELINE_MARKER_ACTIONS } from "../src/night-timeline.js";

const ev = (ts: string, action: LedgerEvent["action"]): LedgerEvent => ({
  ts,
  op: "op://test",
  actor: { id: "github:x", kind: "human" },
  credit: [],
  phase: "A",
  action,
  ref: "sha256:x",
});

describe("projectNightTimeline", () => {
  it("empty ledger → one silent night", () => {
    const m = projectNightTimeline([]);
    expect(m.nights).toBe(1);
    expect(m.markers).toEqual([]);
    expect(m.eventCountByNight).toEqual([0, 0]);
  });

  it("counts nights from genesis to the last event (clock-free default)", () => {
    const m = projectNightTimeline([
      ev("2026-01-01T20:00:00Z", "found_island"),
      ev("2026-01-04T02:00:00Z", "publish"),
    ]);
    expect(m.nights).toBe(4); // Jan 1 night = 1 … Jan 4 = 4
    expect(m.genesis).toBe("2026-01-01T20:00:00Z");
  });

  it("an explicit `now` extends the axis without adding events", () => {
    const m = projectNightTimeline([ev("2026-01-01T00:00:00Z", "found_island")], {
      now: "2026-01-11T00:00:00Z",
    });
    expect(m.nights).toBe(11);
    expect(m.eventCountByNight[11]).toBe(1);
  });

  it("eventCountByNight is the cumulative scrub→upTo mapping", () => {
    const m = projectNightTimeline([
      ev("2026-01-01T00:00:00Z", "found_island"),
      ev("2026-01-01T12:00:00Z", "propose_subquestion"),
      ev("2026-01-02T12:00:00Z", "submit_claim"),
      ev("2026-01-03T12:00:00Z", "refute"),
    ]);
    expect(m.nights).toBe(3);
    expect(m.eventCountByNight).toEqual([0, 2, 3, 4]);
  });

  it("marks only notable actions, with ledger indices and pct positions", () => {
    const m = projectNightTimeline([
      ev("2026-01-01T00:00:00Z", "found_island"),
      ev("2026-01-02T00:00:00Z", "night_digest"), // ambient — no marker
      ev("2026-01-03T00:00:00Z", "refute"),
    ]);
    expect(m.markers.map((k) => k.action)).toEqual(["found_island", "refute"]);
    expect(m.markers[0]).toMatchObject({ night: 1, pct: 0, index: 0 });
    expect(m.markers[1]).toMatchObject({ night: 3, pct: 100, index: 2 });
    for (const k of m.markers) expect(TIMELINE_MARKER_ACTIONS).toContain(k.action);
  });

  it("is deterministic and order-insensitive over the same events", () => {
    const events = [
      ev("2026-01-02T00:00:00Z", "publish"),
      ev("2026-01-01T00:00:00Z", "found_island"),
    ];
    const a = projectNightTimeline(events);
    const b = projectNightTimeline([...events].reverse());
    expect(a).toEqual(b);
  });

  it("drops events with unparseable ts instead of corrupting the axis", () => {
    const m = projectNightTimeline([
      ev("not-a-date", "publish"),
      ev("2026-01-01T00:00:00Z", "found_island"),
    ]);
    expect(m.nights).toBe(1);
    expect(m.eventCountByNight[1]).toBe(1);
  });
});

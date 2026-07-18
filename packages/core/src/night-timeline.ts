/**
 * projectNightTimeline — the data contract behind the night-replay scrubber
 * (ROADMAP Phase B.2: "timeline = event index", not seed constants).
 *
 * The scrubber's poetic unit stays the NIGHT (seed anchor "night 86 = today"),
 * but every quantity here is a reduce over the real ledger:
 *   - `nights`      = calendar nights from the genesis event to `now`
 *   - `markers`     = notable events (refute / publish / transplant / adopt /
 *                     found_island) placed at their night, pct-positioned
 *   - `eventCountByNight[n]` = how many events had happened by the end of
 *                     night n — the scrub position → `upTo` slice mapping that
 *                     projectClaimState / projectNightReplay consume.
 *
 * Pure and clock-free: `now` defaults to the last event's ts so the same
 * ledger always yields the same timeline (invariant 13 discipline).
 */

import type { ActionType, LedgerEvent } from "@frontier-isles/opp";

/**
 * Actions worth a golden dot on the scrubber. Ambient writes stay unmarked.
 * `return_to_driftwood` joined 2026-07-19 (B.2 caveat): like `refute` it
 * creates a ghost in `projectClaimState`, so shelving a claim is as notable
 * a night as refuting one — the scene ghost tiers already keyed on it.
 */
export const TIMELINE_MARKER_ACTIONS: readonly ActionType[] = [
  "found_island",
  "refute",
  "publish",
  "transplant",
  "adopt",
  "return_to_driftwood",
];

export interface NightTimelineMarker {
  /** 1-based night this event fell on. */
  night: number;
  /** 0–100 position along the scrubber. */
  pct: number;
  action: ActionType;
  /** Index into the ts-sorted ledger (== upTo - 1 for "replay to just after"). */
  index: number;
  ts: string;
}

export interface NightTimelineModel {
  /** Total nights from genesis to now, >= 1. Tonight == `nights`. */
  nights: number;
  markers: NightTimelineMarker[];
  /**
   * eventCountByNight[n] (1-based; [0] === 0) = events with nightOf(e) <= n.
   * Feed events.slice(0, eventCountByNight[scrubNight]) to the projections.
   */
  eventCountByNight: number[];
  /** Genesis ts ("" when the ledger is empty). */
  genesis: string;
}

const NIGHT_MS = 24 * 60 * 60 * 1000;

/**
 * 1-based night of `ts` counted from `genesisMs` — CALENDAR nights (UTC), so
 * an event on the next calendar date is night 2 even if < 24h elapsed.
 */
function nightOf(tsMs: number, genesisMs: number): number {
  return Math.floor(tsMs / NIGHT_MS) - Math.floor(genesisMs / NIGHT_MS) + 1;
}

export function projectNightTimeline(
  events: readonly LedgerEvent[],
  opts: { now?: string } = {},
): NightTimelineModel {
  const sorted = [...events]
    .filter((e) => !Number.isNaN(new Date(e.ts).getTime()))
    .sort((a, b) => a.ts.localeCompare(b.ts));
  if (sorted.length === 0) return { nights: 1, markers: [], eventCountByNight: [0, 0], genesis: "" };

  const genesisMs = new Date(sorted[0]!.ts).getTime();
  const nowMs = new Date(opts.now ?? sorted[sorted.length - 1]!.ts).getTime();
  const nights = Math.max(1, nightOf(Math.max(nowMs, genesisMs), genesisMs));

  const eventCountByNight = new Array<number>(nights + 1).fill(0);
  for (const e of sorted) {
    const n = Math.min(nights, Math.max(1, nightOf(new Date(e.ts).getTime(), genesisMs)));
    eventCountByNight[n] = (eventCountByNight[n] ?? 0) + 1;
  }
  for (let n = 1; n <= nights; n++) eventCountByNight[n] = (eventCountByNight[n] ?? 0) + (eventCountByNight[n - 1] ?? 0);

  const markers: NightTimelineMarker[] = [];
  sorted.forEach((e, index) => {
    if (!TIMELINE_MARKER_ACTIONS.includes(e.action)) return;
    const night = Math.min(nights, Math.max(1, nightOf(new Date(e.ts).getTime(), genesisMs)));
    markers.push({
      night,
      pct: nights === 1 ? 100 : ((night - 1) / (nights - 1)) * 100,
      action: e.action,
      index,
      ts: e.ts,
    });
  });

  return { nights, markers, eventCountByNight, genesis: sorted[0]!.ts };
}

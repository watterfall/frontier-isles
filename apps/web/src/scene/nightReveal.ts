/**
 * Element → ledger-event reveal mapping for the hero island's night replay
 * (ROADMAP Phase B.2, docs/ROADMAP.md Known debt #3: "night replay
 * ghosts/thresholds partly hardcoded to the seeded story"). Scene.tsx's
 * "ghost artifact" layer used to gate purely on seed constants (night
 * 12/41/63, `sampleIsland.ts` GHOSTS); this module derives the same three
 * thresholds from the REAL machine-curiosity ledger when it's reachable,
 * falling back to the seed constants — per-ghost, not all-or-nothing — when
 * a given trigger event isn't found (offline-identical-rendering rule,
 * architecture.md "every call is best-effort").
 *
 * Element → event correspondence (see `apps/server/src/seed.ts`
 * `seedSampleIsland`, g1/g2/g3 — the seed's own choice of action per ghost):
 *
 *   | ghost       | trigger action        | occurrence | seed example (seed.ts) |
 *   |-------------|------------------------|-----------:|-------------------------|
 *   | 'card'      | `return_to_driftwood`  | 1st        | g1 @ night 12, "被撤下的问题卡" |
 *   | 'prototype' | `refute`               | 1st        | g2 @ night 41, "实验坊原型宣告失败" |
 *   | 'canvas'    | `return_to_driftwood`  | 2nd        | g3 @ night 63, "一张画布被废弃" |
 *
 * `refute` is one of `TIMELINE_MARKER_ACTIONS` (packages/core/night-timeline
 * .ts) — the 'prototype' ghost lines up exactly with a real golden-dot
 * scrubber marker. `return_to_driftwood` is deliberately NOT in that list
 * (it's "ambient" there) but it is the exact action the seed authored for
 * the card/canvas ghosts, so we key on it directly here rather than widen
 * TIMELINE_MARKER_ACTIONS, which is owned by the B.2 contract in
 * packages/core and shared with the scrubber UI.
 *
 * Honest scope: only these three thresholds are ledger-driven. The rest of
 * the night layer (hanging lanterns, night-argument tag, AI-night-watch /
 * synthesizer-draft tags, fireflies) has no 1:1 event correspondence baked
 * into the bespoke SVG and stays a "performance" layer, gated only by
 * `night` — see the outstanding list in docs/ROADMAP.md §3.3.
 *
 * Scale note: `nightT` (the scrubber's `t` prop, 1..86) is still driven by
 * NightTimeline.tsx's hardcoded `<input type=range min=1 max=86>` — that
 * component is owned by a parallel lane migrating it to consume
 * `NightTimelineModel` directly. Until it does, a real ledger's `nights`
 * is the scrubber's own axis (NightTimeline consumes `model.nights` since
 * lane J), so thresholds are the events' real calendar nights, and the seed
 * fallback constants (12/41/63) only apply alongside the offline 86-night
 * fallback model.
 */
import type { ActionType, LedgerEvent } from '@frontier-isles/opp';
import type { NightTimelineModel } from '@frontier-isles/core';
import { GHOSTS, type GhostType } from './sampleIsland';

interface GhostTrigger {
  type: GhostType;
  action: ActionType;
  /** 1-based occurrence of `action` in ts-sorted order. */
  occurrence: number;
}

/** The explicit element → event mapping table (kept here, not scattered in JSX). */
const GHOST_TRIGGERS: readonly GhostTrigger[] = [
  { type: 'card', action: 'return_to_driftwood', occurrence: 1 },
  { type: 'prototype', action: 'refute', occurrence: 1 },
  { type: 'canvas', action: 'return_to_driftwood', occurrence: 2 },
];

export interface GhostReveal {
  type: GhostType;
  /** Threshold on nightT's current 1..86 scrubber scale (see "Scale note"). */
  threshold: number;
  /** Whether this threshold came from a real ledger event or the seed fallback. */
  source: 'ledger' | 'seed';
}

function seedFallback(type: GhostType): GhostReveal {
  const threshold = GHOSTS.find((g) => g.type === type)?.threshold ?? 1;
  return { type, threshold, source: 'seed' };
}

/**
 * Derive the three ghost-reveal thresholds from a ledger + its pre-computed
 * `projectNightTimeline` model. `model` should be built from the SAME
 * `events` (after IslandScreen's own ts-validity filtering — see
 * `projectNightTimeline`'s own defensive filter, which we don't need to
 * repeat: we simply skip an event whose `ts` fails to parse).
 *
 * Falls back to the seed constant per-ghost (not all-or-nothing) when its
 * specific trigger event isn't present in the ledger yet — e.g. a fresh
 * island with no `refute` yet still gets a real 'card'/'canvas' threshold if
 * `return_to_driftwood` events exist.
 */
export function computeGhostReveals(
  events: readonly LedgerEvent[] | null,
  model: NightTimelineModel | null,
): GhostReveal[] {
  if (!events || events.length === 0 || !model || model.nights <= 0 || !model.genesis) {
    return GHOSTS.map((g) => seedFallback(g.type));
  }

  const sorted = [...events]
    .filter((e) => !Number.isNaN(new Date(e.ts).getTime()))
    .sort((a, b) => a.ts.localeCompare(b.ts));
  if (sorted.length === 0) return GHOSTS.map((g) => seedFallback(g.type));

  const genesisMs = new Date(model.genesis).getTime();

  return GHOST_TRIGGERS.map(({ type, action, occurrence }) => {
    const matches = sorted.filter((e) => e.action === action);
    const hit = matches[occurrence - 1];
    if (!hit) return seedFallback(type);

    const eventNight = Math.max(1, calendarNight(new Date(hit.ts).getTime(), genesisMs));
    // NightTimeline consumes model.nights as its own axis now (lane J), so the
    // threshold IS the event's real night — no legacy rescale.
    return { type, threshold: Math.min(model.nights, eventNight), source: 'ledger' };
  });
}

const NIGHT_MS = 24 * 60 * 60 * 1000;

/**
 * Mirrors packages/core/src/night-timeline.ts's private `nightOf` (1-based
 * calendar night, UTC, from genesis). Not exported by the B.2 contract, and
 * duplicating three lines here is cheaper than widening that package's
 * public surface for this single call site.
 */
function calendarNight(tsMs: number, genesisMs: number): number {
  return Math.floor(tsMs / NIGHT_MS) - Math.floor(genesisMs / NIGHT_MS) + 1;
}

/** Reveal thresholds when there is no ledger (offline / not yet loaded) — identical to today's behavior. */
export const DEFAULT_GHOST_REVEALS: GhostReveal[] = computeGhostReveals(null, null);

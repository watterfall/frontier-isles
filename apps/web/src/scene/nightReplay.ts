import {
  projectClaimState,
  projectNightReplay,
  projectActiveStations,
  type ClaimState,
  type RelationRefResolver,
  type ReplaySlice,
  type StationKind,
  type NightTimelineModel,
} from '@frontier-isles/core';
import type { LedgerEvent } from '@frontier-isles/opp';

/** Everything the live L1 shows, re-derived AS OF a scrub night. */
export interface NightReplayState {
  /** The clamped scrub night this state is for (1..model.nights). */
  night: number;
  /** events.slice(0, upTo) is the ledger as it stood by the end of `night`. */
  upTo: number;
  claims: ClaimState[];
  /** Typed ghosts on the event timeline (refute → contradiction, etc). */
  replay: ReplaySlice[];
  /** Night-shift lamps (chimney smoke / window light) active AS OF `night`. */
  activeStations: Set<StationKind>;
}

/**
 * Pure scrub → projection pipeline (ROADMAP B.2, invariant 11: read-only,
 * zero new events, zero new storage). Given the full ledger, its timeline
 * model, and a scrub night, slice to `upTo = eventCountByNight[night]` and
 * re-project the three things the isometric scene reads:
 *
 *   - `claims`         → tower kinds + ghosts, via projectClaimState(slice)
 *   - `replay`         → typed ghosts on the event index, via projectNightReplay
 *   - `activeStations` → smoke/light, via projectActiveStations with `now` =
 *                        the LAST sliced event's ts, so recency is judged AS OF
 *                        that night — the island lights up / goes dormant as
 *                        history advances, not against wall-clock today.
 *
 * Clock-free by default (deterministic for tests); pass `opts.now` to pin the
 * recency reference (the caller uses Date.now() only at the live "tonight"
 * position so the default view is unchanged).
 *
 * The ledger is assumed ts-ordered (append-only, hash-chained), matching the
 * order projectNightTimeline sorted `eventCountByNight` against.
 */
export function replayToNight(
  ledger: readonly LedgerEvent[],
  timeline: NightTimelineModel,
  night: number,
  opts: { now?: string | number; resolveRef?: RelationRefResolver } = {},
): NightReplayState {
  const maxNight = Math.max(1, timeline.nights);
  const clamped = Math.min(maxNight, Math.max(1, Math.round(night)));
  const upTo = timeline.eventCountByNight[clamped] ?? ledger.length;
  const slice = ledger.slice(0, upTo);
  const last = slice[slice.length - 1];
  const now = opts.now ?? last?.ts;
  return {
    night: clamped,
    upTo,
    claims: projectClaimState(slice, opts.resolveRef),
    replay: projectNightReplay(ledger, upTo),
    activeStations: projectActiveStations(slice, now !== undefined ? { now } : {}),
  };
}

/**
 * Ritual trigger logic (depth-plan-v1 §6/§9 Batch 1) — pure event→ritual
 * selection with a localStorage last-seen watermark, so 河灯 River lantern
 * (`publish`) and 移栽之路 Transplant walk (`transplant`) fire EXACTLY once
 * per ledger event (invariant 17: event-triggered, never a counter/streak).
 *
 * Deliberately split in two:
 *  - {@link extractRitualEvents} / {@link dueRituals} are pure functions (no
 *    DOM, no `Date.now()`, no localStorage — the caller supplies `now` and
 *    the watermark, and gets a new watermark back to persist) — vitest
 *    covered in `rituals.test.ts`.
 *  - {@link loadWatermark} / {@link saveWatermark} are the thin, best-effort
 *    localStorage glue (same try/catch convention as `i18n/index.ts`) — not
 *    unit-tested, mirrors the rest of the app's storage-is-optional posture.
 *
 * Rendering lives in `@frontier-isles/renderer/pixi`'s `RitualLayer` — this
 * module only decides WHICH events are due, never how they animate (P2: the
 * layout/decision layer stays renderer-free, same split as `scene/layout.ts`).
 */
import type { LedgerEvent } from '@frontier-isles/opp';

export type RitualKind = 'lantern' | 'transplant';

/** One ritual-worthy ledger event, reduced to what the L1 scene needs. */
export interface RitualEvent {
  /**
   * Stable id for once-per-event dedupe + click-to-open. The ledger has no
   * separate uid field; `ts:action:ref` is deterministic and unique enough
   * for a cosmetic replay (unlike `hashEvent`, it needs no `prev`-chain
   * context, so it works the same whether `events` came from a full ledger
   * fetch or a partial poll).
   */
  id: string;
  kind: RitualKind;
  ts: string;
  op: string;
  ref?: string;
  actorId?: string;
}

const KIND_BY_ACTION: Partial<Record<LedgerEvent['action'], RitualKind>> = {
  publish: 'lantern',
  transplant: 'transplant',
};

/**
 * Filter+map a ledger to its ritual-worthy events (invariant 17: "no verb, no
 * ritual" — every other action produces nothing here). Order is preserved.
 */
export function extractRitualEvents(events: readonly LedgerEvent[]): RitualEvent[] {
  const out: RitualEvent[] = [];
  for (const e of events) {
    const kind = KIND_BY_ACTION[e.action];
    if (!kind) continue;
    out.push({ id: `${e.ts}:${e.action}:${e.ref ?? ''}`, kind, ts: e.ts, op: e.op, ref: e.ref, actorId: e.actor?.id });
  }
  return out;
}

/** `{lastTs: null}` — nothing seen yet (a fresh island, or cleared storage). */
export interface RitualWatermark {
  lastTs: string | null;
}
export const INITIAL_WATERMARK: RitualWatermark = { lastTs: null };

/** How far back a "just landed on this island" catch-up still fires a ritual. */
export const DEFAULT_CATCHUP_MS = 5 * 60_000;

export interface DueRitualsResult {
  due: RitualEvent[];
  watermark: RitualWatermark;
}

/**
 * Pure decision: which ritual events are newly due right now, and the
 * watermark to persist afterward so calling again with the SAME `events`
 * returns none (fire once per event).
 *
 * - An event only fires if its `ts` is strictly after the watermark AND
 *   within `catchUpWindowMs` of `now` — old history that scrolled by while
 *   the island was closed silently advances the watermark without replaying
 *   a backlog of lanterns on every landing (§9: "fire once per event", not
 *   "fire every event ever, on every visit").
 * - A live new event (`ts` ≈ `now`) always satisfies the window, so this one
 *   function drives both the on-landing catch-up and the live-poll path —
 *   the host (`GeneratedIslandScreen`) calls it identically either way.
 * - The watermark always advances to the newest `ts` among ALL passed
 *   events (fired or silently skipped), so nothing is ever reconsidered.
 */
export function dueRituals(
  events: readonly RitualEvent[],
  watermark: RitualWatermark,
  now: number,
  catchUpWindowMs: number = DEFAULT_CATCHUP_MS,
): DueRitualsResult {
  const lastTsMs = watermark.lastTs ? Date.parse(watermark.lastTs) : -Infinity;
  let newestTs = watermark.lastTs;
  let newestMs = lastTsMs;
  const due: RitualEvent[] = [];
  for (const e of events) {
    const ms = Date.parse(e.ts);
    if (Number.isNaN(ms)) continue; // a malformed ts can't order against the watermark — skip rather than crash
    if (ms > newestMs) {
      newestMs = ms;
      newestTs = e.ts;
    }
    if (ms > lastTsMs && now - ms <= catchUpWindowMs) due.push(e);
  }
  return { due, watermark: { lastTs: newestTs } };
}

// ── localStorage glue (untested — thin, best-effort, mirrors i18n/index.ts) ──

const watermarkKey = (slug: string): string => `fi-ritual-watermark:${slug}`;

/** Load the persisted watermark for an island; `INITIAL_WATERMARK` on any failure. */
export function loadWatermark(slug: string): RitualWatermark {
  try {
    const raw = localStorage.getItem(watermarkKey(slug));
    if (raw) {
      const parsed = JSON.parse(raw) as RitualWatermark;
      if (typeof parsed.lastTs === 'string' || parsed.lastTs === null) return parsed;
    }
  } catch {
    /* SSR / no storage / corrupt value — start fresh */
  }
  return INITIAL_WATERMARK;
}

/** Persist a watermark for an island. Best-effort — a write failure just means
 * the next landing re-does a bounded catch-up instead of a hard error. */
export function saveWatermark(slug: string, watermark: RitualWatermark): void {
  try {
    localStorage.setItem(watermarkKey(slug), JSON.stringify(watermark));
  } catch {
    /* ignore */
  }
}

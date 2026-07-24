import type { LedgerEvent } from '@frontier-isles/opp';

/**
 * How recently this island's research record actually changed — projected
 * from real ledger event timestamps, never asserted for content that has no
 * ledger. A curated atlas island (editorial content, no record) is labelled
 * as curation by the view; this module only ever speaks for recorded events.
 */
export interface RecordFreshness {
  /** Whole nights since the newest event; 0 means tonight. */
  nights: number;
  /** ISO timestamp of the newest event, for tooltips/exports. */
  lastTs: string;
}

const NIGHT_MS = 86_400_000;

export function projectRecordFreshness(
  events: readonly LedgerEvent[] | null | undefined,
  now: number,
): RecordFreshness | null {
  if (!events || events.length === 0) return null;
  let last = -Infinity;
  let lastTs = '';
  for (const event of events) {
    const t = Date.parse(event.ts);
    if (!Number.isNaN(t) && t > last) {
      last = t;
      lastTs = event.ts;
    }
  }
  if (last === -Infinity) return null;
  return { nights: Math.max(0, Math.floor((now - last) / NIGHT_MS)), lastTs };
}

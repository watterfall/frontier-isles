import { describe, expect, it } from 'vitest';
import type { LedgerEvent } from '@frontier-isles/opp';
import { projectRecordFreshness } from '../models/recordFreshness';

const NOW = Date.parse('2026-07-24T22:00:00.000Z');

function eventAt(ts: string): LedgerEvent {
  return {
    ts,
    op: 'op:frontier-isles/test',
    actor: { id: 'github:someone', kind: 'human' },
    credit: [],
    phase: 'A',
    action: 'found',
  } as unknown as LedgerEvent;
}

describe('projectRecordFreshness', () => {
  it('speaks only for real events: null and empty ledgers project nothing', () => {
    expect(projectRecordFreshness(null, NOW)).toBeNull();
    expect(projectRecordFreshness([], NOW)).toBeNull();
  });

  it('projects whole nights since the newest event, not the first', () => {
    const freshness = projectRecordFreshness(
      [eventAt('2026-07-01T09:00:00.000Z'), eventAt('2026-07-21T09:00:00.000Z')],
      NOW,
    );
    expect(freshness).toEqual({ nights: 3, lastTs: '2026-07-21T09:00:00.000Z' });
  });

  it('clamps a same-night (or clock-skewed future) event to tonight', () => {
    expect(projectRecordFreshness([eventAt('2026-07-24T21:59:00.000Z')], NOW)?.nights).toBe(0);
    expect(projectRecordFreshness([eventAt('2026-07-25T01:00:00.000Z')], NOW)?.nights).toBe(0);
  });

  it('compares offset timestamps by instant, not by string order', () => {
    const freshness = projectRecordFreshness(
      // As text the -05:00 event sorts EARLIER, but its instant (01:00Z on the
      // 22nd) is the newest — instant comparison must win.
      [eventAt('2026-07-21T23:00:00.000Z'), eventAt('2026-07-21T20:00:00.000-05:00')],
      NOW,
    );
    expect(freshness?.lastTs).toBe('2026-07-21T20:00:00.000-05:00');
  });
});

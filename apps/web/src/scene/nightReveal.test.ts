import { describe, expect, it } from 'vitest';
import type { LedgerEvent } from '@frontier-isles/opp';
import { projectNightTimeline } from '@frontier-isles/core';
import { computeGhostReveals, DEFAULT_GHOST_REVEALS } from './nightReveal';
import { GHOSTS } from './sampleIsland';

const ev = (ts: string, action: LedgerEvent['action']): LedgerEvent => ({
  ts,
  op: 'op://machine-curiosity',
  actor: { id: 'github:x', kind: 'human' },
  credit: [],
  phase: 'A',
  action,
  ref: 'sha256:x',
});

describe('computeGhostReveals', () => {
  it('falls back to the seed constants when there is no ledger (offline / not loaded)', () => {
    const out = computeGhostReveals(null, null);
    expect(out).toEqual(GHOSTS.map((g) => ({ type: g.type, threshold: g.threshold, source: 'seed' })));
    expect(DEFAULT_GHOST_REVEALS).toEqual(out);
  });

  it('falls back to the seed constants on an empty ledger', () => {
    const out = computeGhostReveals([], projectNightTimeline([]));
    expect(out.every((g) => g.source === 'seed')).toBe(true);
  });

  it('derives all three thresholds from real trigger events, in real calendar nights (the scrubber axis)', () => {
    const events = [
      ev('2026-01-01T00:00:00Z', 'found_island'), // genesis, night 1
      ev('2026-01-02T00:00:00Z', 'return_to_driftwood'), // card trigger, night 2
      ev('2026-01-03T00:00:00Z', 'refute'), // prototype trigger, night 3
      ev('2026-01-05T00:00:00Z', 'return_to_driftwood'), // canvas trigger (2nd), night 5
    ];
    const model = projectNightTimeline(events);
    expect(model.nights).toBe(5);

    const out = computeGhostReveals(events, model);
    expect(out).toEqual([
      { type: 'card', threshold: 2, source: 'ledger' },
      { type: 'prototype', threshold: 3, source: 'ledger' },
      { type: 'canvas', threshold: 5, source: 'ledger' },
    ]);
    expect(out.every((g) => g.threshold >= 1 && g.threshold <= model.nights)).toBe(true);
  });

  it('falls back per-ghost when its specific trigger action is missing (not all-or-nothing)', () => {
    // No `refute` and only one `return_to_driftwood` in this ledger.
    const events = [
      ev('2026-01-01T00:00:00Z', 'found_island'),
      ev('2026-01-04T00:00:00Z', 'return_to_driftwood'), // card trigger only, night 4
    ];
    const model = projectNightTimeline(events);
    const out = computeGhostReveals(events, model);

    const card = out.find((g) => g.type === 'card')!;
    const prototype = out.find((g) => g.type === 'prototype')!;
    const canvas = out.find((g) => g.type === 'canvas')!;

    expect(card.source).toBe('ledger');
    expect(prototype).toEqual({ type: 'prototype', threshold: 41, source: 'seed' });
    expect(canvas).toEqual({ type: 'canvas', threshold: 63, source: 'seed' });
  });

  it('drops events with unparseable ts instead of corrupting the reveal thresholds', () => {
    const events = [ev('not-a-date', 'refute'), ev('2026-01-01T00:00:00Z', 'found_island')];
    const model = projectNightTimeline(events);
    const out = computeGhostReveals(events, model);
    // The lone valid event is genesis only — no refute survives the ts filter.
    expect(out.find((g) => g.type === 'prototype')).toEqual({ type: 'prototype', threshold: 41, source: 'seed' });
  });

  it('is deterministic and order-insensitive over the same events', () => {
    const events = [
      ev('2026-01-03T00:00:00Z', 'refute'),
      ev('2026-01-01T00:00:00Z', 'found_island'),
      ev('2026-01-02T00:00:00Z', 'return_to_driftwood'),
    ];
    const a = computeGhostReveals(events, projectNightTimeline(events));
    const shuffled = [...events].reverse();
    const b = computeGhostReveals(shuffled, projectNightTimeline(shuffled));
    expect(a).toEqual(b);
  });
});

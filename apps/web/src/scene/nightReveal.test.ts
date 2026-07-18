import { describe, expect, it } from 'vitest';
import type { LedgerEvent } from '@frontier-isles/opp';
import { projectNightTimeline } from '@frontier-isles/core';
import { computeGhostReveals, computeNightSigns, DEFAULT_GHOST_REVEALS } from './nightReveal';
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

describe('computeNightSigns (§3.3 — night sign tags stop being stage dressing)', () => {
  const aiEv = (ts: string, actorId: string): LedgerEvent => ({
    ...ev(ts, 'night_digest'),
    actor: { id: actorId, kind: 'agent' },
  });

  it('offline / no ledger keeps the seed look: all three visible from night 1', () => {
    const out = computeNightSigns(null, null);
    expect(out).toHaveLength(3);
    expect(out.every((s) => s.source === 'seed' && s.threshold === 1)).toBe(true);
  });

  it('argument appears from the first refute night; missing triggers are honestly absent', () => {
    const events = [
      ev('2026-01-01T00:00:00Z', 'found_island'),
      ev('2026-01-03T00:00:00Z', 'refute'),
    ];
    const out = computeNightSigns(events, projectNightTimeline(events));
    expect(out.find((s) => s.type === 'argument')).toMatchObject({ threshold: 3, source: 'ledger' });
    expect(out.find((s) => s.type === 'aiNightWatch')).toMatchObject({ source: 'absent', threshold: Number.POSITIVE_INFINITY });
    expect(out.find((s) => s.type === 'synthesizerDraft')).toMatchObject({ source: 'absent' });
  });

  it('aiNightWatch keys on the first AI night_digest; a human night_digest does not count', () => {
    const events = [
      ev('2026-01-01T00:00:00Z', 'found_island'),
      ev('2026-01-02T00:00:00Z', 'night_digest'), // human — ambient, not a watch
      aiEv('2026-01-04T00:00:00Z', 'github:curiosity-scout'),
    ];
    const out = computeNightSigns(events, projectNightTimeline(events));
    expect(out.find((s) => s.type === 'aiNightWatch')).toMatchObject({ threshold: 4, source: 'ledger' });
  });

  it('synthesizerDraft needs a SECOND distinct AI resident — one scout alone keeps it absent', () => {
    const oneAi = [
      ev('2026-01-01T00:00:00Z', 'found_island'),
      aiEv('2026-01-02T00:00:00Z', 'github:curiosity-scout'),
      aiEv('2026-01-03T00:00:00Z', 'github:curiosity-scout'),
    ];
    const outOne = computeNightSigns(oneAi, projectNightTimeline(oneAi));
    expect(outOne.find((s) => s.type === 'synthesizerDraft')).toMatchObject({ source: 'absent' });

    const twoAi = [...oneAi, aiEv('2026-01-05T00:00:00Z', 'github:synthesizer')];
    const outTwo = computeNightSigns(twoAi, projectNightTimeline(twoAi));
    expect(outTwo.find((s) => s.type === 'synthesizerDraft')).toMatchObject({ threshold: 5, source: 'ledger' });
  });
});

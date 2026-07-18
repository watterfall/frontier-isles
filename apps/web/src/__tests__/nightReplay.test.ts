import { describe, it, expect } from 'vitest';
import { projectNightTimeline } from '@frontier-isles/core';
import type { LedgerEvent } from '@frontier-isles/opp';
import { replayToNight } from '../scene/nightReplay';

// A minimal 4-event ledger over 3 nights: two claims (refs A, B), the first
// refuted on night 3. Genesis = Jan 1, so Jan 3 = night 3.
const ev = (ts: string, action: LedgerEvent['action'], ref: string, op: string): LedgerEvent => ({
  ts,
  op,
  actor: { id: 'github:x', kind: 'human' },
  credit: [],
  phase: 'A',
  action,
  ref,
});

const LEDGER: LedgerEvent[] = [
  ev('2026-01-01T00:00:00Z', 'found_island', 'sha256:g', 'op://g'),
  ev('2026-01-01T06:00:00Z', 'submit_claim', 'sha256:a', 'op://a'),
  ev('2026-01-03T00:00:00Z', 'submit_claim', 'sha256:b', 'op://b'),
  ev('2026-01-03T06:00:00Z', 'refute', 'sha256:a', 'op://r'),
];
const TL = projectNightTimeline(LEDGER);

describe('replayToNight', () => {
  it('exposes the timeline this test relies on', () => {
    expect(TL.nights).toBe(3);
    expect(TL.eventCountByNight).toEqual([0, 2, 2, 4]);
  });

  it('slices the ledger to eventCountByNight[night] (scrub → upTo)', () => {
    expect(replayToNight(LEDGER, TL, 1).upTo).toBe(2);
    expect(replayToNight(LEDGER, TL, 2).upTo).toBe(2);
    expect(replayToNight(LEDGER, TL, 3).upTo).toBe(4);
  });

  it('rebuilds claims from the slice — the second claim has not appeared on night 1', () => {
    const n1 = replayToNight(LEDGER, TL, 1);
    expect(n1.claims.map((c) => c.ref)).toEqual(['sha256:a']);
    expect(n1.claims[0]!.ghost).toBeUndefined();

    const n3 = replayToNight(LEDGER, TL, 3);
    expect(n3.claims.map((c) => c.ref)).toEqual(['sha256:a', 'sha256:b']);
  });

  it('ghosts are typed from events and only appear once the refute is in the slice', () => {
    // Night 1: refute not yet in slice → no ghost, no ghosted replay slice.
    const n1 = replayToNight(LEDGER, TL, 1);
    expect(n1.claims.find((c) => c.ref === 'sha256:a')!.ghost).toBeUndefined();
    expect(n1.replay).toHaveLength(2);
    expect(n1.replay.some((s) => s.ghost)).toBe(false);

    // Night 3: the refute lands → claim A is a night ghost; replay carries a
    // typed (contradiction) ghost.
    const n3 = replayToNight(LEDGER, TL, 3);
    expect(n3.claims.find((c) => c.ref === 'sha256:a')!.ghost).toBe('refuted');
    expect(n3.replay).toHaveLength(4);
    expect(n3.replay.at(-1)!.ghost).toMatchObject({ reason: 'refuted' });
  });

  it('night-shift lamps follow the slice: workshop lit once a claim is submitted', () => {
    const n1 = replayToNight(LEDGER, TL, 1);
    expect(n1.activeStations.has('workshop')).toBe(true);
  });

  it('clamps out-of-range nights to [1, nights]', () => {
    expect(replayToNight(LEDGER, TL, 0).night).toBe(1);
    expect(replayToNight(LEDGER, TL, 0).upTo).toBe(2);
    expect(replayToNight(LEDGER, TL, 99).night).toBe(3);
    expect(replayToNight(LEDGER, TL, 99).upTo).toBe(4);
  });

  it('is deterministic and clock-free (default now = last sliced ts)', () => {
    const a = replayToNight(LEDGER, TL, 2);
    const b = replayToNight(LEDGER, TL, 2);
    expect(a.claims).toEqual(b.claims);
    expect([...a.activeStations]).toEqual([...b.activeStations]);
  });
});

describe('replayToNight — response-ref validates rejoin their stele (§3.5)', () => {
  const CLAIM = `sha256:${'a'.repeat(64)}`;
  const RESP = `sha256:${'b'.repeat(64)}`;
  const LEDGER2: LedgerEvent[] = [
    ev('2026-01-01T00:00:00Z', 'found_island', 'sha256:g', 'op://g'),
    ev('2026-01-01T06:00:00Z', 'submit_claim', CLAIM, 'op://a'),
    ev('2026-01-02T06:00:00Z', 'validate', RESP, 'op://v'),
  ];
  const TL2 = projectNightTimeline(LEDGER2);
  const resolver = (ref: string) =>
    ref === RESP ? { kind: 'connection_response', content: { targetRef: CLAIM } } : null;

  it('with a resolver the gateway-written validate counts as a floor', () => {
    const state = replayToNight(LEDGER2, TL2, TL2.nights, { resolveRef: resolver });
    expect(state.claims.find((c) => c.ref === CLAIM)?.floors).toBe(1);
  });

  it('without a resolver it keeps the documented tolerance (0 floors, no phantom stele)', () => {
    const state = replayToNight(LEDGER2, TL2, TL2.nights);
    expect(state.claims.find((c) => c.ref === CLAIM)?.floors).toBe(0);
    expect(state.claims).toHaveLength(1);
  });
});

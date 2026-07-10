import { describe, expect, it } from 'vitest';
import type { LedgerEvent } from '@frontier-isles/opp';
import { DEFAULT_CATCHUP_MS, INITIAL_WATERMARK, dueRituals, extractRitualEvents, type RitualEvent } from './rituals';

const ev = (over: Partial<LedgerEvent> = {}): LedgerEvent => ({
  ts: '2026-07-10T00:00:00.000Z',
  op: 'op://demo-island',
  actor: { id: 'github:scout', kind: 'agent' },
  credit: [],
  phase: 'A',
  action: 'publish',
  ref: 'sha256:aaaa',
  ...over,
});

describe('extractRitualEvents', () => {
  it('keeps only publish → lantern and transplant → transplant, dropping everything else', () => {
    const events = [
      ev({ action: 'publish' }),
      ev({ action: 'validate' }),
      ev({ action: 'transplant' }),
      ev({ action: 'submit_claim' }),
      ev({ action: 'refute' }),
    ];
    const out = extractRitualEvents(events);
    expect(out.map((r) => r.kind)).toEqual(['lantern', 'transplant']);
  });

  it('preserves ledger order and carries ts/op/ref/actor through', () => {
    const events = [ev({ ts: '2026-07-10T00:00:01.000Z', op: 'op://a', ref: 'sha256:1' }), ev({ ts: '2026-07-10T00:00:02.000Z', op: 'op://b', ref: 'sha256:2', action: 'transplant' })];
    const out = extractRitualEvents(events);
    expect(out).toEqual([
      { id: '2026-07-10T00:00:01.000Z:publish:sha256:1', kind: 'lantern', ts: '2026-07-10T00:00:01.000Z', op: 'op://a', ref: 'sha256:1', actorId: 'github:scout' },
      { id: '2026-07-10T00:00:02.000Z:transplant:sha256:2', kind: 'transplant', ts: '2026-07-10T00:00:02.000Z', op: 'op://b', ref: 'sha256:2', actorId: 'github:scout' },
    ]);
  });

  it('gives distinct events distinct ids', () => {
    const events = [ev({ ts: '2026-07-10T00:00:01.000Z', ref: 'sha256:a' }), ev({ ts: '2026-07-10T00:00:02.000Z', ref: 'sha256:b' })];
    const [a, b] = extractRitualEvents(events);
    expect(a!.id).not.toBe(b!.id);
  });

  it('returns [] for an empty or ritual-less ledger', () => {
    expect(extractRitualEvents([])).toEqual([]);
    expect(extractRitualEvents([ev({ action: 'validate' }), ev({ action: 'found_island' })])).toEqual([]);
  });
});

describe('dueRituals', () => {
  const NOW = Date.parse('2026-07-10T12:00:00.000Z');
  const mk = (id: string, msAgo: number, kind: RitualEvent['kind'] = 'lantern'): RitualEvent => ({
    id,
    kind,
    ts: new Date(NOW - msAgo).toISOString(),
    op: 'op://x',
  });

  it('old history does not replay on first landing, but the watermark still advances past it', () => {
    const old = mk('1', 30 * 24 * 60 * 60_000); // 30 days ago
    const { due, watermark } = dueRituals([old], INITIAL_WATERMARK, NOW);
    expect(due).toEqual([]);
    expect(watermark.lastTs).toBe(old.ts);
  });

  it('a recent event (within the catch-up window) fires on landing', () => {
    const recent = mk('1', 60_000); // 1 minute ago
    const { due } = dueRituals([recent], INITIAL_WATERMARK, NOW);
    expect(due.map((r) => r.id)).toEqual(['1']);
  });

  it('an event just outside the catch-up window does not fire', () => {
    const stale = mk('1', DEFAULT_CATCHUP_MS + 1000);
    const { due } = dueRituals([stale], INITIAL_WATERMARK, NOW);
    expect(due).toEqual([]);
  });

  it('a live event (ts ≈ now) always fires — the same function drives the poll path', () => {
    const live = mk('1', 0);
    const { due } = dueRituals([live], INITIAL_WATERMARK, NOW);
    expect(due.map((r) => r.id)).toEqual(['1']);
  });

  it('fires once per event: re-calling with the same events + the returned watermark yields none', () => {
    const events = [mk('1', 1000)];
    const first = dueRituals(events, INITIAL_WATERMARK, NOW);
    expect(first.due).toHaveLength(1);
    const second = dueRituals(events, first.watermark, NOW + 500);
    expect(second.due).toEqual([]);
    // idempotent from here on, however many more times it's asked
    const third = dueRituals(events, second.watermark, NOW + 999_999);
    expect(third.due).toEqual([]);
  });

  it('a newly appended event fires while already-seen ones stay silent', () => {
    const e1 = mk('1', 2000);
    const first = dueRituals([e1], INITIAL_WATERMARK, NOW);
    const e2: RitualEvent = { id: '2', kind: 'transplant', ts: new Date(NOW + 500).toISOString(), op: 'op://x' };
    const second = dueRituals([e1, e2], first.watermark, NOW + 1000);
    expect(second.due.map((r) => r.id)).toEqual(['2']);
  });

  it('two events sharing the exact same ts both fire once, and never again', () => {
    const ts = new Date(NOW - 1000).toISOString();
    const events: RitualEvent[] = [
      { id: 'a', kind: 'lantern', ts, op: 'op://x' },
      { id: 'b', kind: 'transplant', ts, op: 'op://x' },
    ];
    const first = dueRituals(events, INITIAL_WATERMARK, NOW);
    expect(first.due.map((r) => r.id).sort()).toEqual(['a', 'b']);
    const second = dueRituals(events, first.watermark, NOW + 500);
    expect(second.due).toEqual([]);
  });

  it('is a no-op on an empty ledger and leaves the watermark untouched', () => {
    const { due, watermark } = dueRituals([], INITIAL_WATERMARK, NOW);
    expect(due).toEqual([]);
    expect(watermark).toEqual(INITIAL_WATERMARK);
  });

  it('ignores an event with an unparseable ts instead of throwing', () => {
    const bad: RitualEvent = { id: 'bad', kind: 'lantern', ts: 'not-a-date', op: 'op://x' };
    expect(() => dueRituals([bad], INITIAL_WATERMARK, NOW)).not.toThrow();
    expect(dueRituals([bad], INITIAL_WATERMARK, NOW).due).toEqual([]);
  });
});

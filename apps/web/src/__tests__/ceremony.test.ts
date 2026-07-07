import { describe, it, expect } from 'vitest';
import {
  ceremonyReducer,
  initialCeremony,
  ritTop,
  ritFocusText,
  type CeremonyState,
} from '../state/ceremonyReducer';
import { RITQ, RIT_RW } from '../api/fallback';

function run(actions: Parameters<typeof ceremonyReducer>[1][]): CeremonyState {
  return actions.reduce((s, a) => ceremonyReducer(s, a), initialCeremony());
}

describe('ceremony reducer', () => {
  it('start opens chapter 0 with the unroll log entry', () => {
    const s = run([{ type: 'start' }]);
    expect(s.rit).toBe(0);
    expect(s.ritLog).toHaveLength(1);
    expect(s.ritLog[0]!.k).toBe('unroll');
  });

  it('requires ≥3 questions before the scroll may close (gates chapter 2)', () => {
    const withTwo = run([{ type: 'start' }, { type: 'ignite' }, { type: 'add', i: 0 }, { type: 'add', i: 1 }]);
    const stillCh1 = ceremonyReducer(withTwo, { type: 'close' });
    expect(stillCh1.rit).toBe(1); // gate held

    const withThree = ceremonyReducer(withTwo, { type: 'add', i: 2 });
    const closed = ceremonyReducer(withThree, { type: 'close' });
    expect(closed.rit).toBe(2); // gate opened
  });

  it('does not add a duplicate candidate', () => {
    const s = run([{ type: 'start' }, { type: 'ignite' }, { type: 'add', i: 0 }, { type: 'add', i: 0 }]);
    expect(s.ritAdded).toEqual([0]);
  });

  it('the tick only counts down in chapter 2 (发) and never below zero', () => {
    const ch1 = run([{ type: 'start' }, { type: 'ignite' }]);
    expect(ceremonyReducer(ch1, { type: 'tick' }).ritSec).toBe(479);
    const ch0 = run([{ type: 'start' }]);
    expect(ceremonyReducer(ch0, { type: 'tick' }).ritSec).toBe(480);
  });

  it('focus sets the top-voted question as QFocus', () => {
    const base = run([
      { type: 'start' },
      { type: 'ignite' },
      { type: 'add', i: 0 },
      { type: 'add', i: 2 },
      { type: 'add', i: 3 },
      { type: 'close' },
      { type: 'shaped' },
      { type: 'vote', qi: 2 },
      { type: 'vote', qi: 2 },
      { type: 'vote', qi: 3 },
    ]);
    expect(ritTop(base)).toBe(2);
    const focused = ceremonyReducer(base, { type: 'focus' });
    expect(focused.rit).toBe(4);
    expect(focused.ritFocus).toBe(2);
    expect(ritFocusText(focused)).toBe(RITQ[2]);
  });

  it('rewrite swaps a candidate to the testable RIT_RW text', () => {
    const s = run([{ type: 'start' }, { type: 'ignite' }, { type: 'add', i: 1 }, { type: 'rewrite', qi: 1 }]);
    expect(s.ritMeta[1]?.rw).toBe(true);
    expect(ritFocusText({ ...s, ritFocus: 1 })).toBe(RIT_RW);
  });

  it('abort closes the ceremony but preserves the log', () => {
    const s = run([{ type: 'start' }, { type: 'ignite' }, { type: 'add', i: 0 }]);
    const before = s.ritLog.length;
    const aborted = ceremonyReducer(s, { type: 'abort' });
    expect(aborted.rit).toBeNull();
    expect(aborted.ritLog).toHaveLength(before);
  });
});

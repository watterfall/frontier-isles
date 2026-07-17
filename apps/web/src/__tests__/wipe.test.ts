import { describe, it, expect } from 'vitest';
import { wipeReducer, initialWipe } from '../state/wipeMachine';

describe('wipe view holder', () => {
  it('starts on the chart by default', () => {
    expect(initialWipe()).toEqual({ view: 'chart' });
    expect(initialWipe('island')).toEqual({ view: 'island' });
  });

  it('commits the destination view on switch', () => {
    const s = wipeReducer(initialWipe('chart'), { type: 'switch', view: 'island' });
    expect(s).toEqual({ view: 'island' });
  });

  it('round-trips island → chart', () => {
    let s = initialWipe('island');
    s = wipeReducer(s, { type: 'switch', view: 'chart' });
    expect(s.view).toBe('chart');
  });

  it('keeps the same state object when switching to the current view', () => {
    const s = initialWipe('chart');
    expect(wipeReducer(s, { type: 'switch', view: 'chart' })).toBe(s);
  });
});

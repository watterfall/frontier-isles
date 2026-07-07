import { describe, it, expect } from 'vitest';
import { wipeReducer, initialWipe } from '../state/wipeMachine';

describe('wipe state machine', () => {
  it('sequences chart → island through cover / reveal / settle', () => {
    let s = initialWipe('chart');

    s = wipeReducer(s, { type: 'begin', view: 'island' });
    expect(s.phase).toBe('covering');
    expect(s.wipeOn).toBe(true);
    expect(s.view).toBe('chart'); // not swapped yet
    expect(s.pending).toBe('island');

    s = wipeReducer(s, { type: 'raf' });
    expect(s.wipeTf).toBe('0%'); // rod slid in

    s = wipeReducer(s, { type: 'mid' });
    expect(s.phase).toBe('revealing');
    expect(s.view).toBe('island'); // swapped under cover
    expect(s.wipeTf).toBe('112%');

    s = wipeReducer(s, { type: 'end' });
    expect(s.phase).toBe('idle');
    expect(s.wipeOn).toBe(false);
    expect(s.pending).toBeNull();
    expect(s.view).toBe('island');
  });

  it('ignores a second begin while a wipe is already running', () => {
    let s = wipeReducer(initialWipe('chart'), { type: 'begin', view: 'island' });
    s = wipeReducer(s, { type: 'begin', view: 'chart' });
    expect(s.pending).toBe('island'); // first target wins
  });

  it('round-trips island → chart', () => {
    let s = initialWipe('island');
    s = wipeReducer(s, { type: 'begin', view: 'chart' });
    s = wipeReducer(s, { type: 'mid' });
    expect(s.view).toBe('chart');
  });
});

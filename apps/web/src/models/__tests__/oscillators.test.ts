import { describe, expect, it } from 'vitest';
import {
  advanceOscillators,
  createOscillatorState,
  oscillatorOrder,
  stepOscillators,
} from '../oscillators';

describe('coupled oscillator kernel', () => {
  it('is deterministic for the same seed and parameters', () => {
    const first = createOscillatorState(32, 0.28, 17);
    const second = createOscillatorState(32, 0.28, 17);
    expect(second).toEqual(first);
    expect(advanceOscillators(second, 2.4, 240)).toEqual(advanceOscillators(first, 2.4, 240));
  });

  it('measures incoherent and aligned phases on the same 0..1 scale', () => {
    expect(oscillatorOrder([0, Math.PI / 2, Math.PI, 3 * Math.PI / 2])).toBeCloseTo(0, 8);
    expect(oscillatorOrder([0.1, 0.1, 0.1, 0.1])).toBeCloseTo(1, 8);
  });

  it('lets sufficient coupling overcome moderate natural-frequency diversity', () => {
    const initial = createOscillatorState(48, 0.2, 31);
    const uncoupled = advanceOscillators(initial, 0, 700);
    const coupled = advanceOscillators(initial, 2.8, 700);
    expect(oscillatorOrder(coupled.phases)).toBeGreaterThan(0.82);
    expect(oscillatorOrder(coupled.phases)).toBeGreaterThan(oscillatorOrder(uncoupled.phases) + 0.35);
  });

  it('does not mutate the prior state while stepping', () => {
    const initial = createOscillatorState(12, 0.1, 5);
    const phases = [...initial.phases];
    const next = stepOscillators(initial, 1.5);
    expect(next).not.toBe(initial);
    expect(initial.phases).toEqual(phases);
    expect(next.time).toBeGreaterThan(initial.time);
  });
});

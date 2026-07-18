export interface OscillatorState {
  phases: number[];
  frequencies: number[];
  time: number;
}

export interface OscillatorParameters {
  count: number;
  spread: number;
  coupling: number;
  dt: number;
}

const TAU = Math.PI * 2;

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function wrapPhase(value: number): number {
  const wrapped = value % TAU;
  return wrapped < 0 ? wrapped + TAU : wrapped;
}

export function createOscillatorState(count: number, spread: number, seed: number): OscillatorState {
  const safeCount = Math.max(2, Math.min(120, Math.round(count)));
  const safeSpread = Math.max(0, Math.min(1.2, spread));
  const random = seededRandom(seed);
  return {
    phases: Array.from({ length: safeCount }, () => random() * TAU),
    frequencies: Array.from({ length: safeCount }, () => 1 + (random() + random() - 1) * safeSpread),
    time: 0,
  };
}

export function oscillatorOrder(phases: readonly number[]): number {
  if (phases.length === 0) return 0;
  let x = 0;
  let y = 0;
  for (const phase of phases) {
    x += Math.cos(phase);
    y += Math.sin(phase);
  }
  return Math.hypot(x, y) / phases.length;
}

/** One Euler step of the finite all-to-all Kuramoto model, optimized via the mean field. */
export function stepOscillators(state: OscillatorState, coupling: number, dt = 0.04): OscillatorState {
  const count = state.phases.length;
  if (count === 0) return state;
  let meanCos = 0;
  let meanSin = 0;
  for (const phase of state.phases) {
    meanCos += Math.cos(phase);
    meanSin += Math.sin(phase);
  }
  meanCos /= count;
  meanSin /= count;
  const safeCoupling = Math.max(0, Math.min(6, coupling));
  const safeDt = Math.max(0.001, Math.min(0.2, dt));
  return {
    phases: state.phases.map((phase, index) => {
      const pull = meanSin * Math.cos(phase) - meanCos * Math.sin(phase);
      return wrapPhase(phase + safeDt * ((state.frequencies[index] ?? 1) + safeCoupling * pull));
    }),
    frequencies: state.frequencies,
    time: state.time + safeDt,
  };
}

export function advanceOscillators(state: OscillatorState, coupling: number, steps: number, dt = 0.04): OscillatorState {
  let next = state;
  for (let index = 0; index < Math.max(0, Math.min(5000, Math.round(steps))); index += 1) {
    next = stepOscillators(next, coupling, dt);
  }
  return next;
}

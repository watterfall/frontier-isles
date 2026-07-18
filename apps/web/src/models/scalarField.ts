import type { ModelSubstrateId } from './types';

export type FieldSubstrateId = Extract<ModelSubstrateId, 'heat' | 'diffusion' | 'electrostatic' | 'steady-flow'>;

export interface ScalarFieldState {
  width: number;
  height: number;
  values: number[];
  fixed: boolean[];
  steps: number;
  substrateId: FieldSubstrateId;
}

const indexOf = (x: number, y: number, width: number): number => y * width + x;

function neighbors(state: ScalarFieldState, x: number, y: number): number[] {
  const at = (nx: number, ny: number) => state.values[indexOf(
    Math.max(0, Math.min(state.width - 1, nx)),
    Math.max(0, Math.min(state.height - 1, ny)),
    state.width,
  )] ?? 0;
  return [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)];
}

export function createScalarField(substrateId: FieldSubstrateId, width = 12, height = 12): ScalarFieldState {
  const safeWidth = Math.max(6, Math.min(28, Math.round(width)));
  const safeHeight = Math.max(6, Math.min(28, Math.round(height)));
  const size = safeWidth * safeHeight;
  const values = Array.from({ length: size }, () => 0);
  const fixed = Array.from({ length: size }, () => false);
  const set = (x: number, y: number, value: number, isFixed = false) => {
    const index = indexOf(x, y, safeWidth);
    values[index] = value;
    fixed[index] = isFixed;
  };

  if (substrateId === 'diffusion') {
    const cx = Math.floor(safeWidth / 2);
    const cy = Math.floor(safeHeight / 2);
    for (let y = cy - 1; y <= cy + 1; y += 1) {
      for (let x = cx - 1; x <= cx + 1; x += 1) set(x, y, 1);
    }
  } else if (substrateId === 'electrostatic') {
    for (let y = 2; y < safeHeight - 2; y += 1) {
      set(2, y, 1, true);
      set(safeWidth - 3, y, -1, true);
    }
    for (let x = 0; x < safeWidth; x += 1) {
      set(x, 0, 0, true);
      set(x, safeHeight - 1, 0, true);
    }
    for (let y = 0; y < safeHeight; y += 1) {
      set(0, y, 0, true);
      set(safeWidth - 1, y, 0, true);
    }
  } else {
    for (let y = 0; y < safeHeight; y += 1) {
      set(0, y, 1, true);
      set(safeWidth - 1, y, 0, true);
    }
    if (substrateId === 'heat') {
      for (let x = 0; x < safeWidth; x += 1) {
        set(x, 0, 0, true);
        set(x, safeHeight - 1, 0, true);
      }
    }
  }

  return { width: safeWidth, height: safeHeight, values, fixed, steps: 0, substrateId };
}

export function stepScalarField(state: ScalarFieldState, rate: number): ScalarFieldState {
  const safeRate = Math.max(0, Math.min(1, rate));
  const values = state.values.map((value, index) => {
    if (state.fixed[index]) return value;
    const x = index % state.width;
    const y = Math.floor(index / state.width);
    const around = neighbors(state, x, y);
    const average = around.reduce((sum, item) => sum + item, 0) / around.length;
    return value + safeRate * (average - value);
  });
  return { ...state, values, steps: state.steps + 1 };
}

export function advanceScalarField(state: ScalarFieldState, rate: number, steps: number): ScalarFieldState {
  let next = state;
  for (let index = 0; index < Math.max(0, Math.min(5000, Math.round(steps))); index += 1) {
    next = stepScalarField(next, rate);
  }
  return next;
}

export interface ScalarFieldStats {
  min: number;
  max: number;
  mean: number;
  spread: number;
  residual: number;
  total: number;
}

export function scalarFieldStats(state: ScalarFieldState): ScalarFieldStats {
  let min = Infinity;
  let max = -Infinity;
  let total = 0;
  let residual = 0;
  let freeCount = 0;
  state.values.forEach((value, index) => {
    min = Math.min(min, value);
    max = Math.max(max, value);
    total += value;
    if (!state.fixed[index]) {
      const x = index % state.width;
      const y = Math.floor(index / state.width);
      const average = neighbors(state, x, y).reduce((sum, item) => sum + item, 0) / 4;
      residual += Math.abs(average - value);
      freeCount += 1;
    }
  });
  const mean = state.values.length ? total / state.values.length : 0;
  return {
    min: Number.isFinite(min) ? min : 0,
    max: Number.isFinite(max) ? max : 0,
    mean,
    spread: Number.isFinite(max - min) ? max - min : 0,
    residual: residual / Math.max(1, freeCount),
    total,
  };
}

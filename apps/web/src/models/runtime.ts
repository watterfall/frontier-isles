/** Pure deterministic runtime shared by the manual workbench and A2 missions. */

import {
  advanceOscillators,
  createOscillatorState,
  oscillatorOrder,
  type OscillatorState,
} from './oscillators';
import {
  advanceScalarField,
  createScalarField,
  scalarFieldStats,
  type FieldSubstrateId,
  type ScalarFieldState,
} from './scalarField';
import type {
  ModelFamilyId,
  ModelPrediction,
  ModelRunObservation,
  ModelSubstrateId,
} from './types';

export const MODEL_RUNTIME_VERSION = 'frontier-isles/model-runtime-v1' as const;
export const TARGET_STEPS: Readonly<Record<ModelFamilyId, number>> = {
  synchronization: 360,
  'shared-field': 90,
};

export type ModelRuntime =
  | { kind: 'synchronization'; state: OscillatorState; initial: number; steps: number }
  | { kind: 'shared-field'; state: ScalarFieldState; initial: number; steps: number };

export function createModelRuntime(
  familyId: ModelFamilyId,
  substrateId: ModelSubstrateId,
  count: number,
  spread: number,
  seed: number,
  dimensions?: { width: number; height: number },
): ModelRuntime {
  if (familyId === 'synchronization') {
    const state = createOscillatorState(count, spread, seed);
    return { kind: familyId, state, initial: oscillatorOrder(state.phases), steps: 0 };
  }
  const state = createScalarField(
    substrateId as FieldSubstrateId,
    dimensions?.width,
    dimensions?.height,
  );
  const stats = scalarFieldStats(state);
  const initial = substrateId === 'diffusion' ? stats.spread : stats.residual;
  return { kind: familyId, state, initial, steps: 0 };
}

export function advanceModelRuntime(
  runtime: ModelRuntime,
  coupling: number,
  rate: number,
  steps: number,
  dt = 0.04,
): ModelRuntime {
  if (runtime.kind === 'synchronization') {
    return {
      ...runtime,
      state: advanceOscillators(runtime.state, coupling, steps, dt),
      steps: runtime.steps + steps,
    };
  }
  const state = advanceScalarField(runtime.state, rate, steps);
  return { ...runtime, state, steps: runtime.steps + steps };
}

export function modelMetric(runtime: ModelRuntime, substrateId: ModelSubstrateId): number {
  if (runtime.kind === 'synchronization') return oscillatorOrder(runtime.state.phases);
  const stats = scalarFieldStats(runtime.state);
  return substrateId === 'diffusion' ? stats.spread : stats.residual;
}

export function modelObservation(runtime: ModelRuntime, substrateId: ModelSubstrateId): ModelRunObservation {
  return {
    metric: runtime.kind === 'synchronization' ? 'coherence' : substrateId === 'diffusion' ? 'spread' : 'residual',
    initial: runtime.initial,
    final: modelMetric(runtime, substrateId),
    steps: runtime.steps,
  };
}

export function modelPredictionMatches(
  familyId: ModelFamilyId,
  prediction: ModelPrediction,
  initial: number,
  final: number,
): boolean {
  const delta = final - initial;
  const threshold = familyId === 'synchronization' ? 0.08 : Math.max(0.005, Math.abs(initial) * 0.08);
  if (prediction === 'stay') return Math.abs(delta) <= threshold;
  if (familyId === 'shared-field') return prediction === 'increase' ? delta < -threshold : delta > threshold;
  return prediction === 'increase' ? delta > threshold : delta < -threshold;
}

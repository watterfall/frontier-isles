import { describe, expect, it } from 'vitest';
import { MODEL_RUNTIME_VERSION } from '../runtime';
import { ModelSpecError, compileModelSpec, executeModelSpec, normalizeModelSpec } from '../modelSpec';

const synchronization = {
  version: 1,
  id: 'spec:sync:test',
  familyId: 'synchronization',
  substrateId: 'fireflies',
  seed: 31,
  steps: 700,
  parameters: { count: 48, spread: 0.2, coupling: 2.8, dt: 0.04 },
} as const;

describe('ModelSpecV1', () => {
  it('compiles one declarative spec into a deterministic observation', () => {
    const first = compileModelSpec(synchronization);
    const second = compileModelSpec(structuredClone(synchronization));

    expect(first.runtimeVersion).toBe(MODEL_RUNTIME_VERSION);
    expect(first.run()).toEqual(second.run());
    expect(first.run().metric).toBe('coherence');
    expect(first.run().final).toBeGreaterThan(0.82);
  });

  it('runs the same shared-field rule under a bounded grid specification', () => {
    const observation = executeModelSpec({
      version: 1,
      id: 'spec:diffusion:test',
      familyId: 'shared-field',
      substrateId: 'diffusion',
      seed: 0,
      steps: 120,
      parameters: { width: 10, height: 8, rate: 0.72 },
    });

    expect(observation.metric).toBe('spread');
    expect(observation.final).toBeLessThan(observation.initial);
  });

  it('rejects cross-family substrates and out-of-budget parameters', () => {
    expect(() => normalizeModelSpec({
      ...synchronization,
      substrateId: 'diffusion',
      steps: 5_001,
      parameters: { ...synchronization.parameters, coupling: 7 },
    })).toThrow(ModelSpecError);
  });
});

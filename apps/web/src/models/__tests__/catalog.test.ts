import { describe, expect, it } from 'vitest';
import { MODEL_FAMILIES, modelFamilyForStructure, normalizeModelLaunch } from '../catalog';

describe('executable model catalog', () => {
  it('ships two runnable families with four bounded substrates each', () => {
    expect(MODEL_FAMILIES.map((family) => family.id)).toEqual(['synchronization', 'shared-field']);
    for (const family of MODEL_FAMILIES) {
      expect(family.substrates).toHaveLength(4);
      expect(new Set(family.substrates.map((item) => item.id)).size).toBe(4);
      for (const substrate of family.substrates) {
        expect(substrate.boundary.zh.length).toBeGreaterThan(20);
        expect(substrate.boundary.en.length).toBeGreaterThan(20);
        expect(substrate.source.url).toMatch(/^https:\/\//);
      }
    }
  });

  it('opens synchronization from the existing verified structure without inventing a graph edge', () => {
    expect(modelFamilyForStructure('struct://xfrontier/synchronization')).toBe('synchronization');
    expect(modelFamilyForStructure('struct://xfrontier/scaling')).toBeNull();
    expect(normalizeModelLaunch({ sourceStructureId: 'struct://xfrontier/synchronization' })).toMatchObject({
      familyId: 'synchronization',
      sourceStructureId: 'struct://xfrontier/synchronization',
    });
  });
});

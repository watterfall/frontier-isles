import { describe, expect, it, vi } from 'vitest';

vi.mock('@frontier-isles/data/structures', () => ({
  SEED_STRUCTURES: [{
    id: 'struct://test/evidence',
    mappings: [{
      slug: 'machine-curiosity',
      correspondences: [{
        quantity: { zh: '证据', en: 'evidence' },
        inThisSubstrate: { zh: '测试映射', en: 'test mapping' },
      }],
      evidenceRefs: ['https://doi.org/10.1038/example', 'record:533'],
    }],
  }],
}));

import { fallbackStructureGraph } from './structureFallback';
import { opIdFor } from './opId';

describe('fallbackStructureGraph', () => {
  it('preserves mapping-level evidence references in the offline projection', () => {
    expect(fallbackStructureGraph().mappings).toEqual([
      expect.objectContaining({
        structureId: 'struct://test/evidence',
        islandOp: opIdFor('machine-curiosity'),
        evidenceRefs: ['https://doi.org/10.1038/example', 'record:533'],
      }),
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import { loadFallbackInterior } from '../GeneratedIslandScreen';

describe('GeneratedIslandScreen interior boundary', () => {
  it('loads a known flagship interior from the L1 bundle', async () => {
    const interior = await loadFallbackInterior('formal-math');

    expect(interior?.questions.length).toBeGreaterThanOrEqual(5);
    expect(interior?.residents.length).toBeGreaterThanOrEqual(3);
  });

  it('skips the L1 bundle contract for islands without an interior', async () => {
    await expect(loadFallbackInterior('definitely-not-an-interior')).resolves.toBeUndefined();
  });
});

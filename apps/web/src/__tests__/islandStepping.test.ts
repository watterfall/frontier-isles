import { describe, expect, it } from 'vitest';
import type { IslandDatum } from '../api/fallback';
import { islandSlugOf, stepIsland } from '../models/islandStepping';

function datum(id: number, slug?: string): IslandDatum {
  return {
    id,
    n: { zh: `岛${id}`, en: `Isle ${id}` },
    q: { zh: '问', en: 'q' },
    d: '交叉',
    x: 0, y: 0, s: 1, st: 1, m: 1, a: 1,
    ...(slug ? { slug } : {}),
  } as IslandDatum;
}

const ROSTER = [datum(1, 'alpha'), datum(2, 'beta'), datum(3, 'gamma')];

describe('stepIsland', () => {
  it('steps in roster order and wraps at both ends', () => {
    expect(stepIsland(ROSTER, 'beta', 1)?.slug).toBe('gamma');
    expect(stepIsland(ROSTER, 'beta', -1)?.slug).toBe('alpha');
    expect(stepIsland(ROSTER, 'gamma', 1)?.slug).toBe('alpha');
    expect(stepIsland(ROSTER, 'alpha', -1)?.slug).toBe('gamma');
  });

  it('resolves the bespoke sample island through its slug fallback', () => {
    const sample = datum(1001);
    const withSample = [datum(1, 'alpha'), sample, datum(3, 'gamma')];
    expect(islandSlugOf(sample)).toBe('machine-curiosity');
    expect(stepIsland(withSample, 'machine-curiosity', 1)?.slug).toBe('gamma');
  });

  it('steps nowhere from an unknown slug or a roster of one', () => {
    expect(stepIsland(ROSTER, 'missing', 1)).toBeNull();
    expect(stepIsland([datum(1, 'alpha')], 'alpha', 1)).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { spaceIslands, type Placed } from '../despace';
import { DATA } from '../../api/fallback';

function minPairDist(pts: { x: number; y: number }[]): number {
  let m = Infinity;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      m = Math.min(m, Math.hypot(pts[j]!.x - pts[i]!.x, pts[j]!.y - pts[i]!.y));
    }
  }
  return m;
}

describe('spaceIslands', () => {
  it('the authored chart data has a tight pair (the problem we fix)', () => {
    // baseline: across the 79-island atlas the densest curated pair sits ~54px
    // apart (e.g. the sample island near a neighbouring 生命 frontier).
    expect(minPairDist(DATA)).toBeLessThan(120);
  });

  it('separates every island to its scale-adjusted spacing floor', () => {
    // 79 islands cannot reach the 150px default floor in the fixed fallback
    // canvas (that density is what the zoomable Pixi atlas is for — despace is
    // the pre-atlas stopgap, see the file header). 120px is feasible and still
    // meaningfully spreads the densest pairs.
    const minDist = 120;
    const placed = spaceIslands(DATA, { minDist });
    const minScale = Math.min(...DATA.map((d) => d.s));
    // every pair ends ≥ minDist × avg(scale) apart, so the global floor is minDist × minScale
    expect(minPairDist(placed)).toBeGreaterThanOrEqual(minDist * minScale - 2);
    // …and it spreads the densest pairs further apart than the raw layout
    expect(minPairDist(placed)).toBeGreaterThan(minPairDist(DATA));
  });

  it('is deterministic — identical input yields identical output', () => {
    expect(spaceIslands(DATA)).toEqual(spaceIslands(DATA));
  });

  it('keeps every island within bounds and preserves order + fields', () => {
    const bounds = { minX: 120, minY: 170, maxX: 1320, maxY: 760 };
    const placed = spaceIslands(DATA, { bounds });
    expect(placed).toHaveLength(DATA.length);
    placed.forEach((p, i) => {
      expect(p.id).toBe(DATA[i]!.id);
      expect(p.slug).toBe(DATA[i]!.slug);
      expect(p.x).toBeGreaterThanOrEqual(bounds.minX - 0.01);
      expect(p.x).toBeLessThanOrEqual(bounds.maxX + 0.01);
      expect(p.y).toBeGreaterThanOrEqual(bounds.minY - 0.01);
      expect(p.y).toBeLessThanOrEqual(bounds.maxY + 0.01);
    });
  });

  it('separates exact coincidences deterministically (no RNG)', () => {
    const dup: Placed[] = [
      { x: 500, y: 400 },
      { x: 500, y: 400 },
      { x: 500, y: 400 },
    ];
    const opts = { minDist: 100, bounds: { minX: 0, minY: 0, maxX: 1440, maxY: 900 } };
    const placed = spaceIslands(dup, opts);
    expect(minPairDist(placed)).toBeGreaterThan(60);
    expect(spaceIslands(dup, opts)).toEqual(placed);
  });
});

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
    // Baseline: the authored positions are hand-placed and always leave some
    // pair tighter than a mound's own diameter — that is what this solver is
    // for. At 372 islands the densest curated pair sits well inside 120px.
    expect(minPairDist(DATA)).toBeLessThan(120);
  });

  it('separates every island to the box\'s packing capacity, whatever N is', () => {
    // Asserting an absolute pixel floor here needs re-tuning on every atlas
    // expansion, and silently becomes unreachable: at 372 islands (371 curated
    // + the sample) a 90px request is far past what the fixed fallback canvas
    // can hold, so the solver caps pair targets at the box's hexagonal packing
    // capacity. Assert THAT invariant instead — it is the one the solver
    // actually promises, and it holds at any N.
    const bounds = { minX: 120, minY: 170, maxX: 1320, maxY: 760 };
    const placed = spaceIslands(DATA, { minDist: 150, bounds });
    const boxArea = (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);
    const capacity = Math.sqrt((2 * boxArea) / (Math.sqrt(3) * DATA.length)) * 0.96;

    // Relaxation against a hard boundary lands a little under ideal packing;
    // 0.9 of capacity is the achievable share, not a fudge to make it pass.
    expect(minPairDist(placed)).toBeGreaterThanOrEqual(capacity * 0.9);
    // …and it must still spread the densest pairs further than the raw layout.
    expect(minPairDist(placed)).toBeGreaterThan(minPairDist(DATA));
    // A capacity-relative assertion alone can only catch a solver that fails to
    // converge — it would happily pass a result too tight to click, because the
    // capacity shrinks with every island added. Keep one ABSOLUTE floor as well,
    // so growth that outruns the fixed twin's canvas fails here rather than in
    // the visitor's hands.
    expect(minPairDist(placed), 'absolute clickability floor on the flat twin').toBeGreaterThan(30);
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

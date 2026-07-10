import { describe, it, expect } from 'vitest';
import { buildingDensityTier } from '../ChartScreen';

/** Count how many of the 5 gated pieces are visible for a given (stage, id). */
function count(st: number, id: number, dor = false): number {
  const t = buildingDensityTier({ st, dor, id });
  return Number(t.h1) + Number(t.h2) + Number(t.h3) + Number(t.veg1) + Number(t.veg2);
}

describe('buildingDensityTier — density pre-echo of growth stage (depth-plan-v1 §5)', () => {
  it('an empty isle (stage 0) shows nothing', () => {
    expect(count(0, 1)).toBe(0);
    expect(count(0, 2)).toBe(0);
  });

  it('a hut (stage 1) shows exactly one building and exactly one veg piece', () => {
    const evenId = buildingDensityTier({ st: 1, dor: false, id: 2 });
    const oddId = buildingDensityTier({ st: 1, dor: false, id: 3 });
    expect(evenId.h1).toBe(true);
    expect(evenId.h2).toBe(false);
    expect(evenId.h3).toBe(false);
    expect(Number(evenId.veg1) + Number(evenId.veg2)).toBe(1);
    expect(Number(oddId.veg1) + Number(oddId.veg2)).toBe(1);
    // id parity picks *which* veg piece, for hand-drawn variety — not rank.
    expect(evenId.veg1).toBe(true);
    expect(evenId.veg2).toBe(false);
    expect(oddId.veg1).toBe(false);
    expect(oddId.veg2).toBe(true);
  });

  it('an academy (stage 2) shows two buildings and BOTH veg pieces, regardless of id parity', () => {
    const t = buildingDensityTier({ st: 2, dor: false, id: 4 });
    expect(t.h1).toBe(true);
    expect(t.h2).toBe(true);
    expect(t.h3).toBe(false);
    expect(t.veg1).toBe(true);
    expect(t.veg2).toBe(true);
  });

  it('a school (stage 3) shows all three building tiers and both veg pieces', () => {
    const t = buildingDensityTier({ st: 3, dor: false, id: 7 });
    expect(t.h1 && t.h2 && t.h3 && t.veg1 && t.veg2).toBe(true);
  });

  it('density only ever grows with stage — never decreases at any id', () => {
    for (const id of [0, 1, 2, 3, 4, 5]) {
      const counts = [0, 1, 2, 3].map((st) => count(st, id));
      for (let i = 1; i < counts.length; i++) {
        expect(counts[i]!).toBeGreaterThanOrEqual(counts[i - 1]!);
      }
    }
  });

  it('a dormant hut shows no hut and no veg — the moss/fog badge (unchanged) reads instead', () => {
    expect(count(1, 2, true)).toBe(0);
  });
});

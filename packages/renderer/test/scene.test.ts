import { describe, expect, it } from 'vitest';
import { anchorDepth, sliceFootprint, sortByDepth, type Placed } from '../src/scene';

const tile = (id: string, gx: number, gy: number, footprint?: { w: number; h: number }): Placed => ({
  id,
  kind: 'x',
  gx,
  gy,
  footprint,
});

describe('anchorDepth', () => {
  it('is gx+gy for a 1x1 item', () => {
    expect(anchorDepth(tile('a', 2, 3))).toBe(5);
  });

  it('uses the footprint far corner for multi-tile buildings', () => {
    // 2x2 at (0,0): far corner (1,1) -> depth 2.
    expect(anchorDepth(tile('b', 0, 0, { w: 2, h: 2 }))).toBe(2);
    // 3x1 at (2,1): far corner (4,1) -> depth 5.
    expect(anchorDepth(tile('c', 2, 1, { w: 3, h: 1 }))).toBe(5);
  });
});

describe('sortByDepth', () => {
  it('puts (2,3) behind (3,3)', () => {
    const sorted = sortByDepth([tile('near', 3, 3), tile('far', 2, 3)]);
    expect(sorted.map((p) => p.id)).toEqual(['far', 'near']);
  });

  it('does not mutate its input', () => {
    const input = [tile('a', 3, 3), tile('b', 2, 3)];
    const copy = [...input];
    sortByDepth(input);
    expect(input).toEqual(copy);
  });

  it('orders the slices of a 2x2 building correctly', () => {
    const slices = sliceFootprint(tile('b', 0, 0, { w: 2, h: 2 }));
    // Four 1x1 slices with depths 0,1,1,2; the depth-1 pair breaks by gx.
    const sorted = sortByDepth(slices);
    expect(sorted.map((s) => s.id)).toEqual(['b#0,0', 'b#0,1', 'b#1,0', 'b#1,1']);
    expect(sorted.map((s) => anchorDepth(s))).toEqual([0, 1, 1, 2]);
  });
});

describe('sliceFootprint', () => {
  it('yields one slice per tile with parent back-references', () => {
    const slices = sliceFootprint(tile('b', 4, 2, { w: 2, h: 1 }));
    expect(slices).toHaveLength(2);
    expect(slices[0]).toMatchObject({ id: 'b#0,0', parentId: 'b', gx: 4, gy: 2, sliceX: 0, sliceY: 0 });
    expect(slices[1]).toMatchObject({ id: 'b#1,0', parentId: 'b', gx: 5, gy: 2, sliceX: 1, sliceY: 0 });
  });

  it('yields a single slice for a 1x1 item', () => {
    expect(sliceFootprint(tile('s', 1, 1))).toHaveLength(1);
  });
});

import { describe, expect, it } from 'vitest';
import {
  ChunkIndex,
  chunkKey,
  chunkOf,
  cull,
  pickAt,
  pickPixel,
  visibleChunks,
  type PickTarget,
} from '../src/chunks';
import { worldToScreen, type Placed } from '../src/index';

const tile = (id: string, gx: number, gy: number, footprint?: { w: number; h: number }): Placed => ({
  id,
  kind: 'x',
  gx,
  gy,
  footprint,
});

describe('chunkOf', () => {
  it('floors tile coords into CHUNK=8 blocks', () => {
    expect(chunkOf(0, 0)).toEqual({ cx: 0, cy: 0 });
    expect(chunkOf(7, 7)).toEqual({ cx: 0, cy: 0 });
    expect(chunkOf(8, 0)).toEqual({ cx: 1, cy: 0 });
    expect(chunkOf(-1, 0)).toEqual({ cx: -1, cy: 0 });
  });
});

describe('visibleChunks — known 3x3 case', () => {
  it('returns exactly the chunks overlapping the viewport', () => {
    // 3x3 chunks (24x24 tiles). Viewport rect x[-100,100], y[400,600].
    const got = visibleChunks({ x: -100, y: 400, w: 200, h: 200 }, { w: 24, h: 24 });
    const keys = new Set(got.map(chunkKey));
    expect(keys).toEqual(new Set(['0:0', '1:0', '0:1', '1:1']));
    expect(got).toHaveLength(4);
  });

  it('a tiny viewport at the origin sees only chunk 0:0', () => {
    const got = visibleChunks({ x: -10, y: 10, w: 20, h: 20 }, { w: 24, h: 24 });
    expect(got.map(chunkKey)).toEqual(['0:0']);
  });
});

describe('ChunkIndex + cull', () => {
  it('indexes, queries and removes by chunk', () => {
    const idx = new ChunkIndex();
    idx.add(tile('a', 1, 1)); // chunk 0:0
    idx.add(tile('b', 9, 1)); // chunk 1:0
    expect(idx.query({ cx: 0, cy: 0 }).map((p) => p.id)).toEqual(['a']);
    expect(idx.query({ cx: 1, cy: 0 }).map((p) => p.id)).toEqual(['b']);
    idx.remove('a');
    expect(idx.query({ cx: 0, cy: 0 })).toEqual([]);
  });

  it('registers a boundary-spanning footprint in every chunk it touches', () => {
    const idx = new ChunkIndex();
    idx.add(tile('big', 7, 7, { w: 2, h: 2 })); // spans chunks 0:0,1:0,0:1,1:1
    expect(idx.query({ cx: 0, cy: 0 }).map((p) => p.id)).toEqual(['big']);
    expect(idx.query({ cx: 1, cy: 1 }).map((p) => p.id)).toEqual(['big']);
  });

  it('cull returns visible items de-duplicated', () => {
    const idx = new ChunkIndex();
    idx.add(tile('a', 1, 1)); // chunk 0:0, near origin -> visible
    idx.add(tile('big', 7, 7, { w: 2, h: 2 })); // spans 4 chunks incl 0:0
    idx.add(tile('far', 40, 40)); // chunk 5:5, far away -> culled
    const visible = cull(idx, { x: -100, y: 0, w: 200, h: 200 }).map((p) => p.id).sort();
    expect(visible).toEqual(['a', 'big']);
  });
});

describe('pickPixel', () => {
  it('respects a single-channel alpha mask', () => {
    // 4x4 mask, opaque only at (1,2).
    const w = 4;
    const h = 4;
    const mask = new Uint8Array(w * h);
    mask[2 * w + 1] = 255;
    expect(pickPixel(mask, w, h, 1, 2)).toBe(true);
    expect(pickPixel(mask, w, h, 0, 0)).toBe(false);
    expect(pickPixel(mask, w, h, -1, 0)).toBe(false);
    expect(pickPixel(mask, w, h, 4, 0)).toBe(false);
  });

  it('reads the alpha channel of an RGBA buffer', () => {
    const w = 2;
    const h = 2;
    const rgba = new Uint8Array(w * h * 4);
    // pixel (1,0): fully opaque; pixel (0,1): transparent but bright RGB.
    rgba[(0 * w + 1) * 4 + 3] = 200;
    rgba[(1 * w + 0) * 4 + 0] = 255; // R set, A still 0
    expect(pickPixel(rgba, w, h, 1, 0)).toBe(true);
    expect(pickPixel(rgba, w, h, 0, 1)).toBe(false);
  });
});

describe('pickAt — inverse-matrix candidate lookup + mask test', () => {
  it('picks the topmost footprint covering the tile, then refines by mask', () => {
    const targets: PickTarget[] = [
      { id: 'ground', kind: 't', gx: 2, gy: 2 },
      { id: 'tower', kind: 's', gx: 2, gy: 2, footprint: { w: 1, h: 1 } },
    ];
    // Center of tile (2,2).
    const c = worldToScreen(2.5, 2.5);
    expect(pickAt(targets, c.x, c.y, worldToScreen)?.id).toBe('tower');
  });

  it('rejects a candidate whose mask is transparent at the point', () => {
    const mask = new Uint8Array(4 * 4); // all transparent
    const targets: PickTarget[] = [
      { id: 'holey', kind: 's', gx: 0, gy: 0, mask, maskW: 4, maskH: 4 },
    ];
    const c = worldToScreen(0.5, 0.5);
    expect(pickAt(targets, c.x, c.y, worldToScreen)).toBeUndefined();
  });
});

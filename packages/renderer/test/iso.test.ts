import { describe, expect, it } from 'vitest';
import {
  HALF_H,
  HALF_W,
  TILE_H,
  TILE_W,
  compareDepth,
  depthOf,
  diamondPoints,
  screenToWorld,
  tileAt,
  worldToScreen,
} from '../src/iso';

describe('constants', () => {
  it('match the 2:1 128x64 contract', () => {
    expect([TILE_W, TILE_H, HALF_W, HALF_H]).toEqual([128, 64, 64, 32]);
  });
});

describe('worldToScreen', () => {
  it('follows sx=(gx-gy)*64, sy=(gx+gy)*32', () => {
    expect(worldToScreen(0, 0)).toEqual({ x: 0, y: 0 });
    expect(worldToScreen(1, 0)).toEqual({ x: 64, y: 32 });
    expect(worldToScreen(0, 1)).toEqual({ x: -64, y: 32 });
    expect(worldToScreen(1, 1)).toEqual({ x: 0, y: 64 });
  });
});

describe('screenToWorld ∘ worldToScreen = identity', () => {
  const cases: Array<[number, number]> = [
    [0, 0],
    [3, 5],
    [-4, 7],
    [2.5, 1.25],
    [-0.75, 12.5],
    [100.5, -33.5],
  ];
  it.each(cases)('round-trips (%f, %f) including fractional', (gx, gy) => {
    const s = worldToScreen(gx, gy);
    const w = screenToWorld(s.x, s.y);
    expect(w.gx).toBeCloseTo(gx, 10);
    expect(w.gy).toBeCloseTo(gy, 10);
  });

  it('inverts screen points too (worldToScreen ∘ screenToWorld)', () => {
    const w = screenToWorld(137.5, -42.25);
    const s = worldToScreen(w.gx, w.gy);
    expect(s.x).toBeCloseTo(137.5, 10);
    expect(s.y).toBeCloseTo(-42.25, 10);
  });
});

describe('tileAt', () => {
  it('hits the right tile at diamond centers', () => {
    for (const [i, j] of [
      [0, 0],
      [2, 1],
      [3, 3],
      [5, 2],
    ] as Array<[number, number]>) {
      const c = worldToScreen(i + 0.5, j + 0.5);
      expect(tileAt(c.x, c.y)).toEqual({ gx: i, gy: j });
    }
  });

  it('resolves diamond corners and edge midpoints deterministically', () => {
    // Top corner of (2,1) is an exact integer world point -> floors to (2,1).
    const top = worldToScreen(2, 1);
    expect(tileAt(top.x, top.y)).toEqual({ gx: 2, gy: 1 });
    // Midpoint of the top-right edge of (2,1) lies inside (2,1).
    const edge = worldToScreen(2.5, 1);
    expect(tileAt(edge.x, edge.y)).toEqual({ gx: 2, gy: 1 });
    // Midpoint of the top-left edge of (2,1) lies inside (2,1).
    const edge2 = worldToScreen(2, 1.5);
    expect(tileAt(edge2.x, edge2.y)).toEqual({ gx: 2, gy: 1 });
  });
});

describe('depth', () => {
  it('depthOf is the gx+gy anchor', () => {
    expect(depthOf(2, 3)).toBe(5);
    expect(depthOf(3, 3)).toBe(6);
  });

  it('compareDepth orders by depth then breaks ties by gx', () => {
    expect(compareDepth({ gx: 2, gy: 3 }, { gx: 3, gy: 3 })).toBeLessThan(0);
    // Same depth (4): tie broken by gx ascending.
    expect(compareDepth({ gx: 1, gy: 3 }, { gx: 3, gy: 1 })).toBeLessThan(0);
    expect(compareDepth({ gx: 3, gy: 1 }, { gx: 1, gy: 3 })).toBeGreaterThan(0);
    expect(compareDepth({ gx: 2, gy: 2 }, { gx: 2, gy: 2 })).toBe(0);
  });
});

describe('diamondPoints', () => {
  it('returns top,right,bottom,left corners', () => {
    expect(diamondPoints(0, 0)).toEqual([
      { x: 0, y: 0 }, // top
      { x: 64, y: 32 }, // right
      { x: 0, y: 64 }, // bottom
      { x: -64, y: 32 }, // left
    ]);
  });
});

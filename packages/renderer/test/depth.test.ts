/**
 * M1 depth-key + elevation tests (M1-DESIGN §3d/§3f).
 *
 * The load-bearing claim of the isometric upgrade: elevation and tie-breaks
 * never push an object across an iso row, so a raised tile behind another can
 * never occlude the row in front of it. Proven here as a property over a grid,
 * plus the worked cases from the design.
 */
import { describe, expect, it } from 'vitest';
import { ELEV_STEP, worldToScreen, worldToScreenElevated } from '../src/iso';
import {
  anchorDepth,
  isoDepthKey,
  sortByDepth,
  K_ROW,
  K_ELEV,
  OBJECT_BIAS,
  GROUND_BIAS,
  type Placed,
} from '../src/scene';

const tile = (id: string, gx: number, gy: number, footprint?: { w: number; h: number }): Placed => ({
  id,
  kind: 'x',
  gx,
  gy,
  footprint,
});

describe('worldToScreenElevated', () => {
  it('equals worldToScreen at elevation 0', () => {
    expect(worldToScreenElevated(3, 4, 0)).toEqual(worldToScreen(3, 4));
    expect(worldToScreenElevated(3, 4)).toEqual(worldToScreen(3, 4));
  });

  it('lifts y by elevation·ELEV_STEP and leaves x untouched', () => {
    const base = worldToScreen(2, 5);
    for (const e of [1, 2]) {
      const lifted = worldToScreenElevated(2, 5, e);
      expect(lifted.x).toBe(base.x);
      expect(lifted.y).toBe(base.y - e * ELEV_STEP);
    }
  });
});

describe('isoDepthKey — worked cases (M1-DESIGN §3d)', () => {
  it('never lets max elevation cross into the next row', () => {
    // A: row 0, elevation 2 (maximally raised) → key = 0·1000 + 16 + 4 + 0 = 20
    const a = isoDepthKey(tile('a', 0, 0), 2, 'object');
    // B: row 1, elevation 0 (flat) → key = 1·1000 + 0 + 4 + 0.01 = 1004.01
    const b = isoDepthKey(tile('b', 1, 0), 0, 'object');
    expect(a).toBeCloseTo(20, 5);
    expect(b).toBeCloseTo(1004.01, 5);
    // The nearer row (B) always draws on top, despite A being maximally raised.
    expect(b).toBeGreaterThan(a);
  });

  it('within a row, higher elevation draws later (on top)', () => {
    const low = isoDepthKey(tile('low', 3, 3), 0);
    const mid = isoDepthKey(tile('mid', 3, 3), 1);
    const high = isoDepthKey(tile('high', 3, 3), 2);
    expect(low).toBeLessThan(mid);
    expect(mid).toBeLessThan(high);
  });

  it('within a row+elevation, an object sits above the ground tile', () => {
    const ground = isoDepthKey(tile('g', 3, 3), 0, 'ground');
    const object = isoDepthKey(tile('o', 3, 3), 0, 'object');
    expect(object).toBeGreaterThan(ground);
    expect(object - ground).toBeCloseTo(OBJECT_BIAS - GROUND_BIAS, 5);
  });

  it('within a row+elevation+band, larger gx breaks the tie (matches compareDepth)', () => {
    // Same anchor depth 6, different gx: (2,4) vs (4,2).
    const west = isoDepthKey(tile('w', 2, 4), 0);
    const east = isoDepthKey(tile('e', 4, 2), 0);
    expect(anchorDepth(tile('w', 2, 4))).toBe(anchorDepth(tile('e', 4, 2)));
    expect(east).toBeGreaterThan(west); // larger gx draws later
  });

  it('uses the footprint far corner (multi-tile buildings occlude correctly)', () => {
    // 2x2 at (0,0): anchor far corner (1,1) → anchorDepth 2.
    const big = isoDepthKey(tile('big', 0, 0, { w: 2, h: 2 }), 0);
    // A 1x1 object standing on the far-corner tile (1,1): same anchor row.
    const small = isoDepthKey(tile('small', 1, 1), 0);
    expect(Math.floor(big / K_ROW)).toBe(2);
    expect(Math.floor(small / K_ROW)).toBe(2);
  });

  it('reproduces sortByDepth order at elevation 0, uniform band', () => {
    const items = [
      tile('a', 3, 3),
      tile('b', 2, 3),
      tile('c', 0, 0, { w: 2, h: 2 }),
      tile('d', 4, 2),
      tile('e', 1, 1),
    ];
    const byKey = [...items].sort((x, y) => isoDepthKey(x) - isoDepthKey(y)).map((p) => p.id);
    const bySort = sortByDepth(items).map((p) => p.id);
    expect(byKey).toEqual(bySort);
  });
});

describe('isoDepthKey — non-crossing property (M1-DESIGN §3d)', () => {
  it('keeps every key inside its own row band [R·K_ROW, R·K_ROW + K_ROW) for a 50×50 grid', () => {
    const maxIntraRow = 2 * K_ELEV + OBJECT_BIAS + 1.0; // elevation 2 + object bias + gx tie (<1)
    expect(maxIntraRow).toBeLessThan(K_ROW); // the whole guarantee in one line: 20.x < 1000

    for (let gx = 0; gx < 50; gx++) {
      for (let gy = 0; gy < 50; gy++) {
        for (const elevation of [0, 1, 2] as const) {
          for (const band of ['ground', 'object'] as const) {
            const p = tile('t', gx, gy);
            const key = isoDepthKey(p, elevation, band);
            const R = anchorDepth(p); // row for a 1×1 item
            expect(key).toBeGreaterThanOrEqual(R * K_ROW);
            expect(key).toBeLessThan(R * K_ROW + K_ROW);
          }
        }
      }
    }
  });

  it('any nearer row outranks any farther row regardless of elevation/band', () => {
    // Farthest-favoured: far row maximally raised object vs near row flat ground.
    const far = isoDepthKey(tile('far', 5, 5), 2, 'object'); // row 10
    const near = isoDepthKey(tile('near', 6, 5), 0, 'ground'); // row 11
    expect(near).toBeGreaterThan(far);
  });
});

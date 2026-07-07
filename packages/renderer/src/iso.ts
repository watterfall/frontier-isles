/**
 * Headless isometric math — the renderer contract's pure core.
 *
 * Architecture §2 (verbatim): 2:1 tiles 128×64 · `sx=(gx−gy)·64, sy=(gx+gy)·32`
 * · picking by inverse matrix + pixel mask · depth by `(gx+gy)` anchor.
 *
 * NO PixiJS imports live here. This module is consumed today by the React SVG
 * scene (DECISIONS item 3, the SVG-now half of the split) and by the Pixi
 * engine at scale; both share exactly these formulas so picking, layout and
 * depth agree pixel-for-pixel across renderers.
 */

/** Tile diamond width in screen pixels. */
export const TILE_W = 128;
/** Tile diamond height in screen pixels (2:1 ratio). */
export const TILE_H = 64;
/** Half width — the `(gx−gy)` screen-x coefficient. */
export const HALF_W = 64;
/** Half height — the `(gx+gy)` screen-y coefficient. */
export const HALF_H = 32;

/** A point in grid/world space. Fractional coordinates are allowed. */
export interface WorldPoint {
  gx: number;
  gy: number;
}

/** A point in screen/pixel space (before any camera pan/zoom). */
export interface ScreenPoint {
  x: number;
  y: number;
}

/** An integer grid tile. */
export interface TileCoord {
  gx: number;
  gy: number;
}

/**
 * World → screen. Contract: `sx = (gx − gy)·64`, `sy = (gx + gy)·32`.
 * Supports fractional grid coordinates (sub-tile placement, camera math).
 */
export function worldToScreen(gx: number, gy: number): ScreenPoint {
  return {
    x: (gx - gy) * HALF_W,
    y: (gx + gy) * HALF_H,
  };
}

/**
 * Screen → world, the exact inverse of {@link worldToScreen}.
 *
 * Solving the 2×2 system:
 *   sx/HALF_W = gx − gy
 *   sy/HALF_H = gx + gy
 * gives gx = sx/TILE_W + sy/TILE_H, gy = sy/TILE_H − sx/TILE_W.
 */
export function screenToWorld(sx: number, sy: number): WorldPoint {
  return {
    gx: sx / TILE_W + sy / TILE_H,
    gy: sy / TILE_H - sx / TILE_W,
  };
}

/**
 * Anchor depth of a tile: `gx + gy`. Larger = nearer the viewer (drawn later,
 * lower on screen). Multi-tile footprints use the far-corner tile's depth —
 * see {@link ./scene!anchorDepth}.
 */
export function depthOf(gx: number, gy: number): number {
  return gx + gy;
}

/**
 * Stable painter's-order comparator. Primary key is `(gx+gy)` depth; ties break
 * deterministically by `gx` (the tile further "east" wins the tie), so two tiles
 * on the same iso row never flicker between frames.
 */
export function compareDepth(a: TileCoord, b: TileCoord): number {
  const da = depthOf(a.gx, a.gy);
  const db = depthOf(b.gx, b.gy);
  if (da !== db) return da - db;
  return a.gx - b.gx;
}

/**
 * Integer tile under a screen point — the floor of the inverse transform, per
 * the contract's "picking by inverse matrix". This is the candidate-lookup
 * step; a pixel-mask test (see chunks.ts) refines it for irregular sprites.
 */
export function tileAt(sx: number, sy: number): TileCoord {
  const w = screenToWorld(sx, sy);
  return {
    gx: Math.floor(w.gx),
    gy: Math.floor(w.gy),
  };
}

/**
 * The four screen corners of tile `(gx, gy)`, ordered top → right → bottom →
 * left — ready to feed an SVG `<polygon points>` (the SVG-now renderer) or a
 * Pixi `Graphics.poly`.
 */
export function diamondPoints(gx: number, gy: number): [ScreenPoint, ScreenPoint, ScreenPoint, ScreenPoint] {
  const top = worldToScreen(gx, gy);
  const right = worldToScreen(gx + 1, gy);
  const bottom = worldToScreen(gx + 1, gy + 1);
  const left = worldToScreen(gx, gy + 1);
  return [top, right, bottom, left];
}

/**
 * Chunking, viewport culling and pixel-mask picking.
 *
 * Architecture §2: "chunked with viewport culling". At P3 a single search must
 * render 700+ islands smoothly; the grid is tiled into fixed CHUNK×CHUNK blocks
 * so only chunks whose screen bounding box overlaps the camera get walked. This
 * module is headless — no PixiJS — so the same index drives SVG and engine.
 */

import { HALF_H, HALF_W, tileAt, type TileCoord } from './iso';
import { anchorDepth, type Footprint, type Placed } from './scene';

/** Default chunk edge length in tiles. */
export const CHUNK = 8;

/** A chunk's coordinate in chunk-space (tile `(gx,gy)` → `floor(gx/CHUNK)` …). */
export interface ChunkCoord {
  cx: number;
  cy: number;
}

/** Which chunk a tile falls in. */
export function chunkOf(gx: number, gy: number, chunk: number = CHUNK): ChunkCoord {
  return {
    cx: Math.floor(gx / chunk),
    cy: Math.floor(gy / chunk),
  };
}

/** Stable string key for a chunk, for map/set membership. */
export function chunkKey(c: ChunkCoord): string {
  return `${c.cx}:${c.cy}`;
}

/** A screen-space axis-aligned bounding box. */
interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** A screen-space viewport rectangle (post camera transform, pre-cull). */
export interface Viewport {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Screen-space bounds of every tile in a chunk. The chunk covers the tile
 * square `[x0,x1] × [y0,y1]` (x1/y1 = far edge, so diamonds' `+1` corners are
 * included). In iso screen space:
 *   x = (gx−gy)·HALF_W  → min at the west tile (x0,y1), max at the east (x1,y0)
 *   y = (gx+gy)·HALF_H  → min at the north tile (x0,y0), max at the south (x1,y1)
 */
export function chunkScreenBounds(c: ChunkCoord, chunk: number = CHUNK): Bounds {
  const x0 = c.cx * chunk;
  const y0 = c.cy * chunk;
  const x1 = x0 + chunk;
  const y1 = y0 + chunk;
  return {
    minX: (x0 - y1) * HALF_W,
    maxX: (x1 - y0) * HALF_W,
    minY: (x0 + y0) * HALF_H,
    maxY: (x1 + y1) * HALF_H,
  };
}

/** Strict AABB overlap (touching edges do not count). */
function overlaps(b: Bounds, v: Viewport): boolean {
  return b.minX < v.x + v.w && b.maxX > v.x && b.minY < v.y + v.h && b.maxY > v.y;
}

/**
 * Every chunk whose screen bounding box overlaps `viewport`. `worldSize` (tiles)
 * bounds the enumeration; a chunk is included when any of its tiles could paint
 * into the viewport rectangle.
 */
export function visibleChunks(viewport: Viewport, worldSize: { w: number; h: number }, chunk: number = CHUNK): ChunkCoord[] {
  const out: ChunkCoord[] = [];
  const cols = Math.ceil(worldSize.w / chunk);
  const rows = Math.ceil(worldSize.h / chunk);
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const c = { cx, cy };
      if (overlaps(chunkScreenBounds(c, chunk), viewport)) out.push(c);
    }
  }
  return out;
}

/**
 * Spatial index of placed items keyed by chunk. A footprint spanning a chunk
 * boundary is registered in every chunk it touches, so viewport culling never
 * drops a large building whose anchor sits just outside the frame.
 */
export class ChunkIndex<T extends Placed = Placed> {
  private readonly chunk: number;
  private readonly byChunk = new Map<string, Map<string, T>>();
  private readonly keysOf = new Map<string, string[]>();

  constructor(chunk: number = CHUNK) {
    this.chunk = chunk;
  }

  /** Every distinct chunk key that currently holds at least one item. */
  private touchedChunks(p: Placed): string[] {
    const f: Footprint = p.footprint ?? { w: 1, h: 1 };
    const seen = new Set<string>();
    for (let dy = 0; dy < f.h; dy++) {
      for (let dx = 0; dx < f.w; dx++) {
        seen.add(chunkKey(chunkOf(p.gx + dx, p.gy + dy, this.chunk)));
      }
    }
    return [...seen];
  }

  /** Insert (or re-insert) an item under every chunk its footprint covers. */
  add(item: T): void {
    if (this.keysOf.has(item.id)) this.remove(item.id);
    const keys = this.touchedChunks(item);
    for (const k of keys) {
      let bucket = this.byChunk.get(k);
      if (!bucket) {
        bucket = new Map();
        this.byChunk.set(k, bucket);
      }
      bucket.set(item.id, item);
    }
    this.keysOf.set(item.id, keys);
  }

  /** Remove an item from every chunk it was registered in. */
  remove(id: string): void {
    const keys = this.keysOf.get(id);
    if (!keys) return;
    for (const k of keys) {
      const bucket = this.byChunk.get(k);
      if (bucket) {
        bucket.delete(id);
        if (bucket.size === 0) this.byChunk.delete(k);
      }
    }
    this.keysOf.delete(id);
  }

  /** Items registered in a chunk (order is insertion order within the chunk). */
  query(c: ChunkCoord): T[] {
    return [...(this.byChunk.get(chunkKey(c))?.values() ?? [])];
  }

  /** Chunk keys currently populated. */
  chunkKeys(): string[] {
    return [...this.byChunk.keys()];
  }
}

/**
 * Cull an index to the items visible in `viewport`. Iterates only the populated
 * chunks (no `worldSize` needed), tests each chunk's screen bounds, and returns
 * a de-duplicated list (a boundary-spanning item lives in several chunks).
 */
export function cull<T extends Placed>(index: ChunkIndex<T>, viewport: Viewport, chunk: number = CHUNK): T[] {
  const out = new Map<string, T>();
  for (const key of index.chunkKeys()) {
    const [cx, cy] = key.split(':').map(Number) as [number, number];
    if (!overlaps(chunkScreenBounds({ cx, cy }, chunk), viewport)) continue;
    for (const item of index.query({ cx, cy })) out.set(item.id, item);
  }
  return [...out.values()];
}

/**
 * Read a pixel-mask's alpha at `(x, y)`. Returns true when the sprite is opaque
 * there — the second half of the contract's "picking by inverse matrix + pixel
 * mask". Accepts either a one-byte-per-pixel alpha mask (`length == w*h`) or a
 * full RGBA buffer (`length == w*h*4`, alpha channel read). Out-of-bounds → false.
 */
export function pickPixel(mask: Uint8Array, w: number, h: number, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= w || y >= h) return false;
  const px = Math.floor(x);
  const py = Math.floor(y);
  const i = py * w + px;
  if (mask.length === w * h * 4) return mask[i * 4 + 3]! > 0;
  return mask[i]! > 0;
}

/**
 * A candidate for pixel-accurate picking: an item plus (optionally) its alpha
 * mask in screen-local space. `maskOffsetX/Y` is the mask origin relative to the
 * item's tile screen position, so an irregular sprite taller than its tile still
 * hit-tests correctly.
 */
export interface PickTarget extends Placed {
  mask?: Uint8Array;
  maskW?: number;
  maskH?: number;
  maskOffsetX?: number;
  maskOffsetY?: number;
}

/**
 * Pick the topmost target under a screen point, combining both contract steps:
 * inverse-matrix candidate lookup (which footprints cover the tile at that
 * screen point) followed by the pixel-mask alpha test. Returns the deepest
 * (nearest-viewer) matching target, or undefined.
 *
 * `screen(gx,gy)` converts a tile origin to screen space — pass
 * `worldToScreen`; injected to keep this module free of the iso camera state.
 */
export function pickAt(
  targets: readonly PickTarget[],
  sx: number,
  sy: number,
  screen: (gx: number, gy: number) => { x: number; y: number },
): PickTarget | undefined {
  const tile: TileCoord = tileAt(sx, sy);
  let best: PickTarget | undefined;
  let bestDepth = -Infinity;
  for (const t of targets) {
    const f = t.footprint ?? { w: 1, h: 1 };
    // Inverse-matrix candidate step: does this footprint cover the picked tile?
    if (tile.gx < t.gx || tile.gx >= t.gx + f.w || tile.gy < t.gy || tile.gy >= t.gy + f.h) continue;
    // Pixel-mask refinement step (only when a mask is supplied).
    if (t.mask && t.maskW && t.maskH) {
      const origin = screen(t.gx, t.gy);
      const lx = sx - origin.x - (t.maskOffsetX ?? 0);
      const ly = sy - origin.y - (t.maskOffsetY ?? 0);
      if (!pickPixel(t.mask, t.maskW, t.maskH, lx, ly)) continue;
    }
    const depth = anchorDepth(t);
    if (depth >= bestDepth) {
      bestDepth = depth;
      best = t;
    }
  }
  return best;
}

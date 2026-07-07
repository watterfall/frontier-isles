/**
 * Data-driven scene model.
 *
 * Architecture §1: "Island scenes must be data-driven: tiles, stations,
 * artifacts are data consumed by the renderer. No hardcoded scenes." An
 * `IslandScene` is the spatial rendering of an `op://` problem object's place
 * plane (§5) — footprints, placements, scenery — and stays free of PixiJS so it
 * serialises, diffs and drives the SVG renderer just as well as the engine.
 */

import { compareDepth, depthOf, type TileCoord } from './iso';

/** Footprint measured in whole tiles, anchored at the placed item's `(gx,gy)`. */
export interface Footprint {
  w: number;
  h: number;
}

/**
 * Anything the renderer places on the grid. `kind` is the semantic type
 * (station kind, artifact type, prop id) resolved to a sprite/SVG by the asset
 * layer. `(gx,gy)` is the origin (near-top) tile; `footprint` defaults to 1×1.
 */
export interface Placed {
  id: string;
  kind: string;
  gx: number;
  gy: number;
  footprint?: Footprint;
}

/** A station building (Question Wall, Data Bench, Ferry Dock, …). */
export interface PlacedStation extends Placed {}

/** A placed artifact (claim stele, bridge artifact, adopted output, …). */
export interface PlacedArtifact extends Placed {}

/** Non-interactive scenery (trees, rocks, moss, mist props). */
export interface PlacedProp extends Placed {}

/**
 * A whole island. `tiles` is an optional ground map (`tiles[gy][gx]` → terrain
 * kind or 0 for sea); everything else is the place plane of §5.
 */
export interface IslandScene {
  size: { w: number; h: number };
  tiles?: number[][];
  stations: PlacedStation[];
  placements: PlacedArtifact[];
  scenery: PlacedProp[];
}

/** Footprint w/h with the 1×1 default applied. */
function footprintOf(p: Placed): Footprint {
  return p.footprint ?? { w: 1, h: 1 };
}

/**
 * Depth anchor of a placed item = `(gx+gy)` of its footprint's FAR corner.
 *
 * A building's near corner is `(gx,gy)`; the far corner tile is
 * `(gx+w−1, gy+h−1)`, giving anchor `gx+gy + (w−1) + (h−1)`. Anchoring on the
 * far corner makes a large building correctly occlude tiles it visually sits in
 * front of. For a 1×1 item this reduces to `depthOf(gx,gy)`.
 */
export function anchorDepth(p: Placed): number {
  const f = footprintOf(p);
  return depthOf(p.gx + (f.w - 1), p.gy + (f.h - 1));
}

/** The far-corner tile used as the depth anchor. */
function anchorTile(p: Placed): TileCoord {
  const f = footprintOf(p);
  return { gx: p.gx + (f.w - 1), gy: p.gy + (f.h - 1) };
}

/**
 * Painter's-order sort. Returns a NEW array (input untouched), ascending by
 * far-corner anchor depth so earlier items draw behind later ones. Ties break
 * by `gx` via {@link compareDepth}, and the sort is stabilised by original
 * index so equal-anchor items keep insertion order.
 */
export function sortByDepth<T extends Placed>(placed: readonly T[]): T[] {
  return placed
    .map((p, i) => ({ p, i }))
    .sort((a, b) => {
      const c = compareDepth(anchorTile(a.p), anchorTile(b.p));
      return c !== 0 ? c : a.i - b.i;
    })
    .map((x) => x.p);
}

/**
 * One tile of a sliced multi-tile building. Carries back-references so the
 * renderer can draw the parent sprite clipped to this tile and z-sort each
 * slice independently.
 */
export interface FootprintSlice extends Placed {
  /** id of the building this slice belongs to. */
  parentId: string;
  /** Slice offset within the footprint, in tiles. */
  sliceX: number;
  sliceY: number;
}

/**
 * Slice a placed building into per-tile pieces — the contract's "multi-tile
 * buildings sliced". Each slice is a 1×1 `Placed` at its own tile with its own
 * depth anchor, so a tall structure interleaves correctly with objects standing
 * beside it rather than popping in front as one flat sprite.
 *
 * A 1×1 item yields a single slice at offset `(0,0)`. Slices are returned in
 * row-major footprint order; feed them through {@link sortByDepth} for draw
 * order.
 */
export function sliceFootprint<T extends Placed>(p: T): FootprintSlice[] {
  const f = footprintOf(p);
  const slices: FootprintSlice[] = [];
  for (let dy = 0; dy < f.h; dy++) {
    for (let dx = 0; dx < f.w; dx++) {
      slices.push({
        id: `${p.id}#${dx},${dy}`,
        kind: p.kind,
        gx: p.gx + dx,
        gy: p.gy + dy,
        footprint: { w: 1, h: 1 },
        parentId: p.id,
        sliceX: dx,
        sliceY: dy,
      });
    }
  }
  return slices;
}

/**
 * Every placed thing in a scene as one flat list — stations, then placements,
 * then scenery. Handy for indexing, culling and depth-sorting the whole island.
 */
export function allPlaced(scene: IslandScene): Placed[] {
  return [...scene.stations, ...scene.placements, ...scene.scenery];
}

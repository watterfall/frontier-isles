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
 * Depth-key band width per iso row (M1-DESIGN §3c/§3d). Must exceed the maximum
 * intra-row contribution — `elevation·K_ELEV + OBJECT_BIAS + gx·TIE` — so no
 * elevation or tie-break can ever push an object into an adjacent row's band.
 * With the values below the intra-row span is < 21, ~48× below K_ROW: proven
 * non-crossing (M1-DESIGN §3d).
 */
export const K_ROW = 1000;
/** Per-elevation depth contribution within a row. Headroom for future sub-levels. */
export const K_ELEV = 8;
/** Depth bias of a ground tile within its anchor. */
export const GROUND_BIAS = 0;
/** Depth bias of a dynamic object — sits above the ground tile of the same anchor. */
export const OBJECT_BIAS = 4;
/**
 * gx tie-break weight; sub-unit so it never crosses an integer band. Positive so
 * a larger gx draws later, matching {@link compareDepth}'s `a.gx − b.gx` tie.
 */
export const TIE = 0.01;

/** Which depth band a placed item occupies within its iso row. */
export type DepthBand = 'ground' | 'object';

/**
 * Numeric isometric depth key for `sprite.zIndex` (M1-DESIGN §3c). Composes:
 *
 *   `anchorDepth·K_ROW + elevation·K_ELEV + bias + anchorGx·TIE`
 *
 * `anchorDepth`/`anchorGx` use the footprint's FAR corner (as {@link sortByDepth}
 * does), so multi-tile buildings occlude correctly and the key reproduces
 * `sortByDepth`'s order when `elevation = 0` and the band is uniform. Proven to
 * never cross iso rows regardless of elevation/bias/tie (M1-DESIGN §3d): the
 * intra-row span (< 21) is far below `K_ROW` (1000). Building *height* (claim
 * floors) lifts the sprite visually via {@link ./iso!worldToScreenElevated} but
 * does NOT enter this key, so growth never consumes depth budget.
 */
export function isoDepthKey(p: Placed, elevation = 0, band: DepthBand = 'object'): number {
  const f = footprintOf(p);
  const anchorGx = p.gx + (f.w - 1);
  const bias = band === 'ground' ? GROUND_BIAS : OBJECT_BIAS;
  return anchorDepth(p) * K_ROW + elevation * K_ELEV + bias + anchorGx * TIE;
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

// ───────────────────────── SceneGraph — the layout → renderer contract ──────
// M1-DESIGN §2. The layout layer resolves every spatial/visual decision here;
// the renderer computes nothing (P2). A SceneGraph is a PixiJS-free superset of
// IslandScene, so it serialises and unit-tests headless.

/** Which render layer a {@link SceneObject} is dispatched to (M1-DESIGN §1). */
export type SceneLayer = 'sea' | 'terrain' | 'world' | 'fog' | 'ui';

/** Semantic LOD level (M7). M1 emits `Z2` only; `Z0` is interface-reserved. */
export type LodLevel = 'Z0' | 'Z1' | 'Z2';

/** Per-claim building growth (D2/M4); absent for non-claim objects. */
export interface Growth {
  /** Preprint / open data present → the base exists. */
  foundation: boolean;
  /** +1 per independent reproduction (distinct validating island). */
  floors: number;
  /** Domain consensus reached → roofed. */
  roof: boolean;
  /** Published with a DOI (ledger `publish`) → the seal is a solid DOI stamp,
   *  not a preprint open-mark. Optional/false = preprint (honest default). */
  hasDoi?: boolean;
}

/**
 * A fully laid-out render object — the layout layer's output, consumed verbatim
 * by the renderer. Extends {@link Placed} with the depth key ({@link isoDepthKey}),
 * day/night visibility, LOD, biome and variation seed the layout layer resolves.
 * `biome` is a domain key the layout owns; the renderer treats it only as a tint
 * hint, so this module stays free of domain semantics.
 */
export interface SceneObject extends Placed {
  layer: SceneLayer;
  /** Terrain elevation level (0 = beach, 1 = terrace, 2 = highland). M1 = 0. */
  elevation: number;
  /** {@link isoDepthKey} output → `sprite.zIndex`. */
  depthKey: number;
  /** Alpha at `t = 0` (published/day state). */
  dayVisibility: number;
  /** Alpha at `t = 1` (process/night state). */
  nightVisibility: number;
  lodLevel: LodLevel;
  /** Domain key (数理/物质/生命/交叉); layout-owned tint hint. */
  biome: string;
  /** Deterministic P7 variation seed (derived from `id`). */
  variant: number;
  /**
   * Screen-space build height in px for the placeholder box renderer (M1). The
   * layout layer computes it from data (claim floors, station kind), so building
   * height already binds to the ledger before the 36-primitive kit lands (M4).
   * `0` / undefined → drawn flat. Independent of {@link elevation} (terrain).
   */
  height?: number;
  growth?: Growth;
  /**
   * Data-bound "alive" flag for a station (M8 micro-dynamics second batch —
   * scene-upgrade OUTSTANDING.md P1). Set only for `station:*` objects the
   * layout layer found in `core.projectActiveStations` (recent ledger
   * activity touching that station) — never a decorative default. Drives
   * the Pixi renderer's chimney smoke / flag-wave attachments; `undefined`
   * for every non-station object.
   */
  active?: boolean;
  /**
   * Terrain fingerprint (depth-plan-v1 §5, invariant 13): a small SIGNED
   * lightness delta the layout layer derives from `hash(op-id)` (the island
   * slug seed) per ground tile, so a hand-drawn "paper breathing" reads across
   * the bed without any per-tile data. Deterministic — same island renders the
   * same jitter on every client. Applied via `shade()` to the ground fill only;
   * `undefined` for every non-terrain object.
   */
  tint?: number;
  /**
   * Coastal transition flag (depth-plan-v1 §5): an elevation-0 land tile that
   * borders open sea. The renderer blends its ground fill toward a warm
   * sand/shallows tone so the coast reads as a beach, not a hard green edge.
   * Set only by the layout layer for terrain tiles; `undefined` otherwise.
   */
  shore?: boolean;
}

/**
 * The layout → renderer contract (M1-DESIGN §2). `t ∈ [0,1]` is the day↔night
 * semantic slider (P4): `t = 0` published state, `t = 1` process/night state.
 */
export interface SceneGraph {
  size: { w: number; h: number };
  objects: SceneObject[];
  t: number;
}

/**
 * An object's alpha for the current day↔night slider `t` — a straight lerp from
 * {@link SceneObject.dayVisibility} to {@link SceneObject.nightVisibility}. The
 * renderer applies this per object; it is the second, independent day/night path
 * alongside the global tone filter (P3/P4, M3).
 */
export function visibilityAt(o: SceneObject, t: number): number {
  return o.dayVisibility + (o.nightVisibility - o.dayVisibility) * t;
}

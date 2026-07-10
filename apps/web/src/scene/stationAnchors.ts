/**
 * Per-station texture-bake geometry for the Pixi L1 (P1 「per-station 垂直配准」,
 * `docs/scene-upgrade/OUTSTANDING.md`). Pulled out of `PixiScene.tsx` (which is
 * WebGL/DOM-bound and not unit-testable) so the offset table and its arithmetic
 * can be tested headless.
 *
 * `PixiScene` bakes each of the 9 station SVG components into a 320×320 texture
 * (`bakeSvg`) and pins a Sprite anchor to one point in it. A single shared
 * anchor borrowed from Workshop's own art made several stations visibly float
 * above or sink into their tile, because each station's hand-drawn SVG places
 * its own `--shadow` ellipse (the artist's ground-contact marker) at a
 * different local `(cx,cy)`. This module gives every station's OWN marker
 * instead, read directly off `packages/assets/src/stations/*.tsx` — not tuned
 * by eye — and reduces the whole bake to a single shared `(0.5,0.5)` anchor.
 */
import type { StationKind } from '@frontier-isles/core';

/** SVG user-unit side of the square texture each station bakes into. */
export const STATION_TEX_SIZE = 320;

/** The station texture bake scale (shared by every station — same art board). */
export const STATION_TEX_SCALE = 150 / (220 * 3);

export interface StationGroundOffset {
  /** Local x of the station's own ground-contact marker (its `--shadow` ellipse cx, or an equivalent). */
  dx: number;
  /** Local y of the station's own ground-contact marker (its `--shadow` ellipse cy, or an equivalent). */
  dy: number;
  /**
   * Local y of the station's own hand-authored `<NameCard>`/label element —
   * the artist's already-solved answer to "how far above the roof does the
   * label float". Omitted where that delta reads badly against Pixi's
   * always-above billboard (Driftwood's label sits BELOW its plot).
   */
  labelY?: number;
}

/**
 * Per-station ground-contact offset. `PixiScene` draws each station at
 * `(STATION_TEX_SIZE/2 − dx, STATION_TEX_SIZE/2 − dy)` before baking and pins
 * the Sprite anchor at a SHARED `(0.5, 0.5)` — i.e. `(dx,dy)` is the point in
 * the station's own local SVG coordinates that lands exactly on the tile's
 * world position once baked.
 *
 * `labelY` feeds {@link stationLabelHeight}: `(dy − labelY) × STATION_TEX_SCALE`
 * is that station's label clearance, replacing a generic `height ?? 30` that
 * otherwise pokes a tall roof (e.g. Question Wall's) out above a label sized
 * for a shorter station, or floats a short station's label too high.
 */
export const STATION_GROUND_OFFSET: Record<StationKind, StationGroundOffset> = {
  // shadow ellipse cx/cy + <NameCard>/label y, verbatim from the component's own SVG:
  questions: { dx: 36, dy: 42, labelY: -64 }, // StationQuestionWall
  workshop: { dx: 0, dy: 56, labelY: -64 }, // StationWorkshop
  library: { dx: 0, dy: 52, labelY: -104 }, // StationLibrary
  canvas: { dx: 12, dy: 66, labelY: -72 }, // StationWhiteboardHall
  gallery: { dx: 12, dy: 72, labelY: -72 }, // StationGallery
  tearoom: { dx: 0, dy: 34, labelY: -46 }, // StationTearoom
  // StationDataBench draws no `--shadow` ellipse; its wall polygon and its
  // `--ground` platform polygon share a front (closest-to-viewer) vertex at
  // local (38,63) — the nearest equivalent ground-contact marker it has.
  data: { dx: 38, dy: 63, labelY: -30 },
  // DriftwoodGarden is a flat ground-level plot (no vertical box, no shadow
  // ellipse) — its own dashed diamond footprint IS the ground marker; anchor
  // on its centre. Its own label sits BELOW (translate y=118, a caption in
  // front of the plot, not a roof-clearing card) — that negative delta reads
  // badly against Pixi's always-above billboard, so `labelY` is omitted here
  // (falls back to the generic clearance in {@link stationLabelHeight}).
  driftwood: { dx: 0, dy: 54 },
  // FerryDock's stub art (Jetty + Boat) draws in ABSOLUTE design-canvas
  // coordinates rather than local offsets like every other station (see
  // packages/assets/src/scenery/Jetty.tsx) — passing the shared Workshop
  // offset left it baked entirely outside the 320×320 texture (invisible in
  // the live L1). Anchor on the boat's own position (its waterline contact);
  // labelY is its own synthesized NameCard's absolute y (706).
  dock: { dx: 836, dy: 792, labelY: 706 },
};

/** Fallback used only if a station kind is somehow missing from the table above. */
const FALLBACK_OFFSET: StationGroundOffset = { dx: 0, dy: 56 };
/** Fallback label clearance (world/screen units) for a station without its own `labelY`. */
const FALLBACK_LABEL_HEIGHT = 30;

/** The `(dx,dy)` ground-contact marker for a station kind (never throws — falls back to Workshop's). */
export function stationGroundOffset(kind: StationKind): StationGroundOffset {
  return STATION_GROUND_OFFSET[kind] ?? FALLBACK_OFFSET;
}

/**
 * Where to draw a station before baking it into a `STATION_TEX_SIZE` square
 * texture, so its own ground marker lands at the texture centre (paired with
 * a shared `(0.5,0.5)` Sprite anchor).
 */
export function stationBakeOrigin(kind: StationKind): { x: number; y: number } {
  const off = stationGroundOffset(kind);
  return { x: STATION_TEX_SIZE / 2 - off.dx, y: STATION_TEX_SIZE / 2 - off.dy };
}

/**
 * The screen-space label clearance (world/screen units, pre-camera-zoom) for
 * a station kind: its own roof height above its own ground marker, derived
 * from the same offset table — or the generic fallback if it has no `labelY`.
 */
export function stationLabelHeight(kind: StationKind): number {
  const off = stationGroundOffset(kind);
  return off.labelY !== undefined ? (off.dy - off.labelY) * STATION_TEX_SCALE : FALLBACK_LABEL_HEIGHT;
}

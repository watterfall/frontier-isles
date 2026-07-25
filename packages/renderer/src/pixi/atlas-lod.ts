/**
 * Atlas semantic-LOD — the PURE, WebGL-free half of the L0 Pixi atlas (Phase
 * C1+C2, docs/scene-upgrade/INFO-HIERARCHY.md).
 *
 * Everything a test can pin without a GPU lives here: the zoom→semantic-tier
 * mapping, the billboard label de-collision, the deterministic fake-island
 * generator (demo scale test) and the PLACEHOLDER archipelago clustering. The
 * companion {@link ./atlas-stage!AtlasStage} owns only the Pixi draw calls and
 * imports these functions.
 *
 * Invariant 14 (architecture §7): every visual transcribes data. LOD is the
 * SAME islands at three resolutions, never decoration; label priority is
 * *display disambiguation* (which name survives a crowd), a DISCRETE label/dot
 * outcome — never a continuous "bigger = better" rank (no leaderboard, §7).
 *
 * NB: this module imports NOTHING from pixi.js, so `pnpm --filter renderer
 * test` runs it headless. It is under `pixi/` only for cohesion with the stage.
 */

/** The four knowledge domains (mirrors assets' `Domain`; renderer must not
 * depend on the assets package, so the union is restated locally). */
export type AtlasDomain = '数理' | '物质' | '生命' | '交叉';

/** Cartographic altitude is a place-plane coordinate, never a score. The
 * existing north-to-south atlas axis is folded into three readable air strata
 * so the same world gains depth without claiming that one question is more
 * mature or valuable than another. */
export type AtlasAltitudeBand = 'low' | 'middle' | 'high';

/** Navigation hierarchy inside one named archipelago. An anchor is the
 * spatial medoid used to open the group; it is never a quality/progress rank. */
export type AtlasIslandRole = 'anchor' | 'satellite';

export const ATLAS_ALTITUDE_BANDS: readonly AtlasAltitudeBand[] = ['low', 'middle', 'high'];

export const ATLAS_DOMAINS: readonly AtlasDomain[] = ['数理', '物质', '生命', '交叉'];

/** Domain → base fill (Pixi hex ints, matching assets DOMAIN_COLORS verbatim). */
export const ATLAS_DOMAIN_FILL: Record<AtlasDomain, number> = {
  数理: 0xc9d8e6,
  物质: 0xe8cfae,
  生命: 0xc6decc,
  交叉: 0xecdfb4,
};

/**
 * Channel-wise blend of already-frozen tints by weight.
 *
 * This mints no new colour in the palette sense: every output lies inside the
 * convex hull of the four `ATLAS_DOMAIN_FILL` values, so a blended pixel is
 * always "between" two real domain tokens and never a fifth invented hue. It is
 * what lets a point BETWEEN two territories read as between them, instead of
 * snapping to whichever centroid happens to be nearer.
 */
export function blendTints(parts: readonly { tint: number; weight: number }[]): number | null {
  let total = 0;
  for (const p of parts) if (Number.isFinite(p.weight) && p.weight > 0) total += p.weight;
  if (!(total > 0)) return null;
  let r = 0, g = 0, b = 0;
  for (const p of parts) {
    if (!Number.isFinite(p.weight) || p.weight <= 0) continue;
    const w = p.weight / total;
    r += ((p.tint >> 16) & 0xff) * w;
    g += ((p.tint >> 8) & 0xff) * w;
    b += (p.tint & 0xff) * w;
  }
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (clamp(r) << 16) | (clamp(g) << 8) | clamp(b);
}

/** Domain → ink/accent (Pixi hex ints, matching assets DOMAIN_COLORS verbatim). */
export const ATLAS_DOMAIN_INK: Record<AtlasDomain, number> = {
  数理: 0x2e5e8c,
  物质: 0x9c5932,
  生命: 0x2a775d,
  交叉: 0x7e6820,
};

/**
 * One island as the atlas consumes it — the `IslandDatum` fields carried over
 * verbatim (fallback.ts), renamed to full words. `x`/`y` are chart coordinates
 * in the same 1440×900 space the SVG L0 uses (the atlas camera works directly
 * in this space; no iso projection at L0 — it is a top-down sea chart).
 */
export interface AtlasIslandInput {
  slug: string;
  name: string;
  domain: AtlasDomain;
  /** Growth stage 0..3 — drives footprint size (discrete tier, never a rank). */
  stage: number;
  status: string;
  dormant: boolean;
  /** variance-select outlier — always drawn solo (glow), never folded into a cluster. */
  outlier: boolean;
  eventCount: number;
  x: number;
  y: number;
  /** Member count (T2 richness, atlas-world-plan.md §4 lane W5) — optional so
   *  every existing call site (tests, the placeholder fake-island generator)
   *  keeps assigning without change; a node with no member data simply shows
   *  one fewer channel at near tier, never a fabricated number. */
  members?: number;
  /** Stable place-plane stratum assigned from the atlas' existing y-order.
   * It is deliberately unrelated to activity, stage, consensus, or rank. */
  altitude?: AtlasAltitudeBand;
  /** Continuous 0..1 place-plane height within/across the three named bands.
   * This drives projection/parallax only and is never shown as a score. */
  altitudeZ?: number;
  /** Region-navigation role. Anchors are chosen by geometry, not activity. */
  role?: AtlasIslandRole;
  /** Satellite → anchor link, derived from computed archipelago membership. */
  parentSlug?: string;
  /** Computed archipelago id, used for nested disclosure and wayfinding. */
  clusterId?: string;
}

/**
 * Fold an already-authored atlas layout into three equally populated air
 * strata. Sorting by y preserves the map's existing geographic order; slug is
 * only the deterministic tie-breaker. This adds a Z reading without inventing
 * a new research-state field (invariant 14 / no-XP).
 */
export function assignAtlasAltitudes<T extends AtlasIslandInput>(islands: readonly T[]): T[] {
  if (islands.length === 0) return [];
  const order = [...islands].sort((a, b) => (a.y - b.y) || a.slug.localeCompare(b.slug));
  const altitudeOf = new Map<string, { band: AtlasAltitudeBand; z: number }>();
  const n = order.length;
  order.forEach((island, index) => {
    const q = (index + 0.5) / n;
    altitudeOf.set(island.slug, {
      band: q <= 1 / 3 ? 'high' : q <= 2 / 3 ? 'middle' : 'low',
      // Reverse the authored north→south order so northern islands float
      // higher, while retaining continuous separation inside each named band.
      z: 1 - q,
    });
  });
  return islands.map((island) => {
    const altitude = altitudeOf.get(island.slug);
    return { ...island, altitude: altitude?.band ?? 'middle', altitudeZ: altitude?.z ?? 0.5 };
  });
}

// ─── Vertical projection (shared stage ↔ data-pipeline math) ─────────────────
// Lives here (WebGL-free) so the web data pipeline can despace islands in the
// SAME projected plane the stage renders — "no overlap" judged where the eye
// judges it, not in raw chart space.

/** Vertical foreshortening of the top-down chart into the tilted archipelago view. */
export const ATLAS_Y_TILT = 0.84;
/**
 * North–south spread. The authored chart is a wide, flat strip (~2.45:1) that
 * letterboxes top/bottom in a ~1.68:1 viewport. This scales the vertical axis
 * about y=0 so the world reads closer to the frame's aspect — a pure place-plane
 * framing constant applied to EVERY y projection (island, cluster, territory)
 * so the three stay locked together; the camera's `fitToContent` re-centres the
 * enlarged bbox for free, so no world-centre needs computing. The band lift is
 * deliberately NOT spread — stratum height is a screen-pixel semantic (低/中/高空),
 * not a chart distance. */
export const ATLAS_Y_SPREAD = 1.5;
/** Screen-up lift per named air stratum (band-level features: washes, names). */
export const ATLAS_BAND_LIFT: Record<AtlasAltitudeBand, number> = { low: 10, middle: 72, high: 136 };

const ATLAS_BAND_ORD: Record<AtlasAltitudeBand, number> = { low: 0, middle: 1, high: 2 };

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** One home for the band→z fallback rule: an island's continuous 0..1 stratum
 * position, from `altitudeZ` when present, else the middle of its named band.
 * Encounter metrics, lift and airway endpoints must all agree on this. */
export function atlasAltitudeZ(o: Pick<AtlasIslandInput, 'altitude' | 'altitudeZ'>): number {
  return clamp01(o.altitudeZ ?? ATLAS_BAND_ORD[o.altitude ?? 'middle'] / 2);
}

/** Exchange rate between one full stratum of altitude difference and
 * horizontal world units, shared by encounter selection, per-island reveal and
 * airway hit-testing — one weight, or "nearest" and "lit" drift apart. */
export const ATLAS_ALTITUDE_DISTANCE_WEIGHT = 240;

/** Continuous per-island lift from its stratum position — cartographic place,
 * never a rank (the altitude invariant). */
export function atlasIslandLift(o: Pick<AtlasIslandInput, 'altitude' | 'altitudeZ'>): number {
  return 10 + atlasAltitudeZ(o) * 136;
}

/** Exploration contract shared by the app's world runtime (worldExplore.ts)
 * and the stage's own defaults — the two camera/encounter owners must agree on
 * framing and ranges, or a resize/spawn mid-flight snaps to a different frame. */
export const ATLAS_EXPLORER_MAX_SPEED = 236;
export const ATLAS_EXPLORER_CRUISE_SCALE = 1.82;
export const ATLAS_EXPLORER_SIGNAL_DISTANCE = 320;
export const ATLAS_EXPLORER_APPROACH_DISTANCE = 168;
/** Physical calm-water boundary used for durable return poses. */
export const ATLAS_EXPLORER_SAFETY_RADIUS = 104;
export const ATLAS_EXPLORER_CURRENT_SIGNAL_DISTANCE = 120;
export const ATLAS_EXPLORER_CURRENT_SAMPLE_DISTANCE = 54;
export function atlasCruiseScale(speed: number, altitudeZ: number): number {
  return ATLAS_EXPLORER_CRUISE_SCALE
    - Math.min(0.16, (speed / ATLAS_EXPLORER_MAX_SPEED) * 0.16)
    - (altitudeZ - 0.5) * 0.1;
}

/** The craft's cardinal facing ↔ continuous heading conventions. The sign map
 * (north = -π/2) and the abs-cos/abs-sin tie-break must stay identical for the
 * rendered craft and its accessible facing label — one home for both. */
export type AtlasCardinalFacing = 'east' | 'south' | 'west' | 'north';
export const facingToHeading = (facing: AtlasCardinalFacing): number =>
  ({ east: 0, south: Math.PI / 2, west: Math.PI, north: -Math.PI / 2 } as const)[facing];
export const vectorToFacing = (x: number, y: number): AtlasCardinalFacing =>
  Math.abs(x) >= Math.abs(y) ? (x >= 0 ? 'east' : 'west') : (y >= 0 ? 'south' : 'north');
export const headingToFacing = (heading: number): AtlasCardinalFacing =>
  vectorToFacing(Math.cos(heading), Math.sin(heading));

/** An island's projected (rendered) vertical position. */
export function projectAtlasIslandY(o: Pick<AtlasIslandInput, 'y' | 'altitude' | 'altitudeZ'>): number {
  return o.y * ATLAS_Y_TILT * ATLAS_Y_SPREAD - atlasIslandLift(o);
}

/**
 * A rendered archipelago region — the C3 slot. Phase C3 (a PARALLEL lane) will
 * produce these from a real clustering projection over the domain manifold /
 * ledger currents; until then {@link placeholderClusters} fills them by the
 * trivial "group by domain" rule. This interface is the contract between the
 * two lanes — do not change its shape without syncing C3.
 *
 * `tint` is a Pixi hex int (0xRRGGBB) for the soft region blob.
 */
export interface AtlasCluster {
  id: string;
  name: string;
  islandSlugs: string[];
  center: { x: number; y: number };
  radius: number;
  tint: number;
  /** Region 体温 in [0,1] (mean member activity → wash intensity). Optional so the
   *  placeholder generator can omit it; the stage treats absent as 0 (cold). */
  heat?: number;
  /** Optional curated one-line caption rendered under the region name billboard. */
  caption?: string;
}

/**
 * Turn flat cluster membership into a nested anchor→satellite hierarchy.
 * The anchor is the island nearest the computed cluster centroid (slug breaks
 * exact ties), so navigation hierarchy cannot be mistaken for an activity,
 * maturity, popularity, or value ranking. Unclustered/outlier islands remain
 * their own anchors.
 */
export function assignAtlasHierarchy<T extends AtlasIslandInput>(islands: readonly T[], clusters: readonly AtlasCluster[]): T[] {
  const bySlug = new Map(islands.map((island) => [island.slug, island]));
  const roleOf = new Map<string, { role: AtlasIslandRole; parentSlug?: string; clusterId?: string }>();

  for (const cluster of clusters) {
    const members = cluster.islandSlugs.map((slug) => bySlug.get(slug)).filter((island): island is T => !!island);
    if (members.length === 0) continue;
    const anchor = [...members].sort((a, b) => {
      const da = (a.x - cluster.center.x) ** 2 + (a.y - cluster.center.y) ** 2;
      const db = (b.x - cluster.center.x) ** 2 + (b.y - cluster.center.y) ** 2;
      return (da - db) || a.slug.localeCompare(b.slug);
    })[0]!;
    roleOf.set(anchor.slug, { role: 'anchor', clusterId: cluster.id });
    for (const member of members) {
      if (member.slug !== anchor.slug) roleOf.set(member.slug, { role: 'satellite', parentSlug: anchor.slug, clusterId: cluster.id });
    }
  }

  return islands.map((island) => ({ ...island, ...(roleOf.get(island.slug) ?? { role: 'anchor' as const }) }));
}

/** Satellite islands emerge progressively across the mid→near camera move.
 * The window opens only AT the mid→near boundary (`TIER_MID_MAX` 1.7 sits a
 * quarter into it), never inside mid: the mid tier is an anchors-only regional
 * read. Opening earlier collapsed nested disclosure into "any slight zoom →
 * every island + label card at once". */
export const SATELLITE_REVEAL_START = 1.42;
export const SATELLITE_REVEAL_END = 2.35;

/** Past this scale band the spatial scoping of {@link satelliteDisclosure}
 * fully yields — the camera is so deep inside one archipelago that its anchor
 * may sit off-screen while the visitor studies the satellites. */
export const SATELLITE_DEEP_START = SATELLITE_REVEAL_END + 0.45;
export const SATELLITE_DEEP_END = SATELLITE_REVEAL_END + 1.1;

const smooth01 = (t: number): number => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

export function satelliteReveal(scale: number): number {
  return smooth01((scale - SATELLITE_REVEAL_START) / (SATELLITE_REVEAL_END - SATELLITE_REVEAL_START));
}

/** Spatial half of nested disclosure: how open an archipelago is given where
 * its ANCHOR currently sits on screen — 1 at the viewport centre, folding to 0
 * past the edges. Zooming discloses the archipelago you are sailing INTO, not
 * every archipelago that happens to share the viewport. */
export function satelliteViewFactor(anchorSx: number, anchorSy: number, viewW: number, viewH: number): number {
  const nx = (anchorSx - viewW / 2) / Math.max(1, viewW / 2);
  const ny = (anchorSy - viewH / 2) / Math.max(1, viewH / 2);
  const d = Math.hypot(nx, ny);
  return smooth01((1.3 - d) / (1.3 - 0.62));
}

/** Combined nested disclosure for one satellite: camera-scale reveal × anchor
 * view scoping, with the scoping released again at deep zoom (see
 * {@link SATELLITE_DEEP_START}). Purely a navigation read — never a rank. */
export function satelliteDisclosure(scale: number, anchorSx: number, anchorSy: number, viewW: number, viewH: number): number {
  const zoomT = satelliteReveal(scale);
  if (zoomT <= 0) return 0;
  const spatial = satelliteViewFactor(anchorSx, anchorSy, viewW, viewH);
  const deep = smooth01((scale - SATELLITE_DEEP_START) / (SATELLITE_DEEP_END - SATELLITE_DEEP_START));
  return zoomT * (spatial + (1 - spatial) * deep);
}

/**
 * A far-tier continental TERRITORY — the top of the world map (atlas-world-plan
 * §2 T0 / lane W2). The host maps it from `core.projectClimate(...).territories`;
 * this package only draws it, as a soft watercolor WASH — NEVER a polygon border
 * or coastline (see the coastline rollback note above: no invented angular
 * grammar, the prototype's 平远/界画式 language only). `tint`/`ink` are Pixi hex
 * ints from `ATLAS_DOMAIN_FILL`/`ATLAS_DOMAIN_INK`.
 */
export interface AtlasContinent {
  domain: AtlasDomain;
  /** Territory name — authored zh or en (invariant 9); the host picks the locale. */
  name: string;
  /** Unit-square manifold corner (x = formal→empirical, y = physical→living). */
  manifold: readonly [number, number];
  center: { x: number; y: number };
  /** Chart-space half-extents of the elliptical wash. */
  extent: { x: number; y: number };
  tint: number;
  ink: number;
}

/**
 * A fog cell — chart-space haze over an unexplored / empty region. Fog is a
 * FOCUS aid (depth-plan-v1/v2), never a wall: `fog` 0..1 = clear..haze, and the
 * stage caps the drawn alpha well under 1. From `core.projectClimate(...).fog`.
 */
export interface AtlasFogCell {
  x: number;
  y: number;
  w: number;
  h: number;
  fog: number;
}

/**
 * An inter-territory CURRENT — a cross-domain ledger relation aggregated to the
 * continent scale (invariant 14: no current without an event). Endpoints are the
 * two named domains; the stage resolves their territory centers from the
 * continent list. `tint` is a Pixi hex int (azurite/ochre/malachite by kind).
 */
export interface AtlasFlow {
  from: AtlasDomain;
  to: AtlasDomain;
  tint: number;
  /** Aggregate relation weight → flowline width. */
  weight: number;
}

/** A real island-to-island ledger current, rendered as a local vertical air
 * route at mid/near scale. Unlike cluster nesting, this line asserts a real
 * relation and therefore carries its projected kind and weight. */
export interface AtlasCurrent {
  fromSlug: string;
  toSlug: string;
  kind: 'evidence' | 'bridge' | 'lineage';
  /** Epistemic direction from the projected ledger event, never inferred here. */
  sign: 'affirm' | 'contest' | 'neutral';
  /** Evidence and lineage are directed; bridges are mutual spans. */
  directed: boolean;
  /** Bridge-only ratification state from the ledger projection. */
  maturity?: 'proposed' | 'ratified';
  tint: number;
  weight: number;
}

/** Stable notebook identity for one real ledger current. Sign is part of the
 * identity: core keys currents by from+to+kind+sign (invariant 8), so an affirm
 * and a contest on the same ordered pair must stay distinct here too. */
export function atlasCurrentId(current: Pick<AtlasCurrent, 'fromSlug' | 'toSlug' | 'kind' | 'sign'>): string {
  return `${current.fromSlug}::${current.toSlug}::${current.kind}::${current.sign}`;
}

/** The exact quadratic route geometry shared by Pixi drawing and field hit tests. */
export interface AtlasCurrentGeometry {
  ax: number;
  ay: number;
  az: number;
  mx: number;
  my: number;
  bx: number;
  by: number;
  bz: number;
  climb: number;
}

export interface AtlasCurrentNearestPoint {
  x: number;
  y: number;
  altitudeZ: number;
  altitudeDelta: number;
  horizontalDistance: number;
  distance: number;
  progress: number;
  tangentX: number;
  tangentY: number;
}

/**
 * Build the single source of truth for a local airway. The bow is derived only
 * from its real endpoints and their cartographic strata; it adds legibility,
 * not fictional geography.
 */
export function atlasCurrentGeometry(
  from: Pick<AtlasIslandInput, 'x' | 'y' | 'altitude' | 'altitudeZ'>,
  to: Pick<AtlasIslandInput, 'x' | 'y' | 'altitude' | 'altitudeZ'>,
): AtlasCurrentGeometry {
  const ax = from.x;
  const ay = projectAtlasIslandY(from);
  const bx = to.x;
  const by = projectAtlasIslandY(to);
  const az = atlasAltitudeZ(from);
  const bz = atlasAltitudeZ(to);
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const climb = Math.abs(bz - az);
  const bow = Math.min(120, len * 0.18) + climb * 54;
  return {
    ax,
    ay,
    az,
    mx: (ax + bx) / 2 + nx * bow,
    my: (ay + by) / 2 + ny * bow - 20 - climb * 34,
    bx,
    by,
    bz,
    climb,
  };
}

function sampleAtlasCurrent(geometry: AtlasCurrentGeometry, progress: number): Omit<AtlasCurrentNearestPoint, 'altitudeDelta' | 'horizontalDistance' | 'distance'> {
  const t = clamp01(progress);
  const u = 1 - t;
  return {
    x: u * u * geometry.ax + 2 * u * t * geometry.mx + t * t * geometry.bx,
    y: u * u * geometry.ay + 2 * u * t * geometry.my + t * t * geometry.by,
    altitudeZ: geometry.az + (geometry.bz - geometry.az) * t,
    progress: t,
    tangentX: 2 * u * (geometry.mx - geometry.ax) + 2 * t * (geometry.bx - geometry.mx),
    tangentY: 2 * u * (geometry.my - geometry.ay) + 2 * t * (geometry.by - geometry.my),
  };
}

// The coarse-scan curve points are pose-independent, so they are computed once
// per geometry and reused every explore frame. Keyed by geometry identity:
// buildLocalRoutes mints fresh geometry objects on new data, which drops the
// stale cache entries without any explicit invalidation.
const COARSE_STEPS = 32;
const coarseSampleCache = new WeakMap<AtlasCurrentGeometry, Array<{ x: number; y: number; altitudeZ: number }>>();
function coarseSamplesOf(geometry: AtlasCurrentGeometry): Array<{ x: number; y: number; altitudeZ: number }> {
  let samples = coarseSampleCache.get(geometry);
  if (!samples) {
    samples = [];
    for (let index = 0; index <= COARSE_STEPS; index++) {
      const point = sampleAtlasCurrent(geometry, index / COARSE_STEPS);
      samples.push({ x: point.x, y: point.y, altitudeZ: point.altitudeZ });
    }
    coarseSampleCache.set(geometry, samples);
  }
  return samples;
}

/**
 * Closest point on a rendered airway to the craft, including height alignment.
 * A coarse scan followed by a bounded ternary refinement is deterministic and
 * cheap for the small curated current set, while keeping hit tests locked to
 * the visible curve rather than an endpoint chord.
 */
export function nearestAtlasCurrentPoint(
  geometry: AtlasCurrentGeometry,
  pose: { x: number; y: number; altitudeZ?: number },
): AtlasCurrentNearestPoint {
  const craftZ = clamp01(pose.altitudeZ ?? 0.5);
  const metricAt = (progress: number) => {
    const point = sampleAtlasCurrent(geometry, progress);
    const horizontalDistance = Math.hypot(point.x - pose.x, point.y - pose.y);
    const altitudeDelta = point.altitudeZ - craftZ;
    return { point, horizontalDistance, altitudeDelta, distance: Math.hypot(horizontalDistance, altitudeDelta * ATLAS_ALTITUDE_DISTANCE_WEIGHT) };
  };

  let bestT = 0;
  let bestDistance = Infinity;
  const samples = coarseSamplesOf(geometry);
  for (let index = 0; index < samples.length; index++) {
    const sample = samples[index];
    if (!sample) continue;
    const horizontalDistance = Math.hypot(sample.x - pose.x, sample.y - pose.y);
    const altitudeDelta = sample.altitudeZ - craftZ;
    const distance = Math.hypot(horizontalDistance, altitudeDelta * ATLAS_ALTITUDE_DISTANCE_WEIGHT);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestT = index / COARSE_STEPS;
    }
  }

  let low = Math.max(0, bestT - 1 / COARSE_STEPS);
  let high = Math.min(1, bestT + 1 / COARSE_STEPS);
  for (let iteration = 0; iteration < 12; iteration++) {
    const left = low + (high - low) / 3;
    const right = high - (high - low) / 3;
    if (metricAt(left).distance <= metricAt(right).distance) high = right;
    else low = left;
  }
  const result = metricAt((low + high) / 2);
  return {
    ...result.point,
    altitudeDelta: result.altitudeDelta,
    horizontalDistance: result.horizontalDistance,
    distance: result.distance,
  };
}

// ─── Camera framing (W5, atlas-world-plan.md §4) ─────────────────────────────
//
// Fixes "zooming out over-shoots so content collapses to a tiny central dot":
// the old zoom-out floor was a fixed absolute constant unrelated to the
// dataset's own footprint. A small curated set (~26 islands in a ~1120×415
// chart-px bbox) fits the screen tightly at scale≈1 — but the camera could
// still zoom out to that fixed floor, shrinking the whole already-well-framed
// world into a speck at screen centre. Anchoring the floor to the DATA's own
// bounds means the far/world tier always composes with content filling the
// frame, for 26 curated islands or 700 synthetic ones alike.

export interface AtlasBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** Chart-px margin added around the island bbox for the "whole world" frame.
 *  Bigger than `core/climate.ts`'s `fogMargin` (340) on purpose: a margin
 *  THAT tight floors the camera just above `TIER_FAR_MAX`, so a modest
 *  curated set could zoom out fully composed yet never actually reach the
 *  discrete far tier (continents alone, no islands) — the four-tier model
 *  would lose its "world" state. This wider margin leaves room for the
 *  camera to cross into far tier while the world still fills a comfortable
 *  majority of the frame (verified for the curated dataset's real bbox in
 *  atlas-lod.test.ts). Restated rather than imported — renderer must not
 *  depend on core, the same rationale `atlasHash`/`DOMAIN_CORNER`-style
 *  restatements already give. */
export const ATLAS_WORLD_MARGIN = 520;

/** Absolute safety floor — guards a degenerate bbox (a single island, or all
 *  islands at one point) from producing a scale so large the camera could
 *  never zoom out at all. */
export const ATLAS_ABS_MIN_SCALE = 0.08;

/**
 * The camera's zoom-OUT floor: the scale at which the whole known world
 * (every island's bbox + a comfortable margin) just fills the viewport —
 * never smaller. Pure and screen/data-driven so it is stable per dataset
 * (invariant 13) and unit-testable without a GPU.
 */
export function computeWorldMinScale(screenW: number, screenH: number, bounds: AtlasBounds, margin = ATLAS_WORLD_MARGIN): number {
  const w = Math.max(1, bounds.maxX - bounds.minX + margin * 2);
  const h = Math.max(1, bounds.maxY - bounds.minY + margin * 2);
  return Math.max(ATLAS_ABS_MIN_SCALE, Math.min(screenW / w, screenH / h));
}

// ─── Fog-as-focus (W5, atlas-world-plan.md §4 goal 2) ────────────────────────

/** Hermite smoothstep — a soft 0→1 ramp (no hard fog wall), mirrors
 *  `core/climate.ts`'s identical helper (restated, renderer must not import core). */
const smoothstep01 = (t: number): number => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/**
 * Dims a fog cell's DATA value toward 0 near the camera's current look-point
 * (screen centre, in world space) and lets it approach its full data value
 * away from it — a smooth radial falloff, never a hard edge. A camera/
 * display effect layered on `projectClimate`'s data-driven ceiling, never
 * invented data: this only ever REDUCES a cell's fog (an already-clear cell,
 * `cellFog≈0`, is unaffected either way), so the periphery never reads hazier
 * than the data itself says — fog stays a FOCUS aid that draws the eye
 * inward, never a wall. `focusRadius<=0` is a no-op passthrough.
 */
export function focusFog(cellFog: number, cellX: number, cellY: number, focusX: number, focusY: number, focusRadius: number): number {
  if (focusRadius <= 0) return cellFog;
  const d = Math.hypot(cellX - focusX, cellY - focusY);
  const eased = smoothstep01(d / focusRadius);
  return cellFog * eased;
}

// ─── Zoom → semantic tier ────────────────────────────────────────────────────
//
// Three DISCRETE cartographic scales (INFO-HIERARCHY §2 row 1): far = atlas
// overview (clusters + outlier glow), mid = region (single coastlines + de-
// collided names), near = detail (one island's full readout). Thresholds are
// named constants so the demo HUD and tests share one source of truth.

/** Below this camera scale → the FAR (overview) tier is dominant. */
export const TIER_FAR_MAX = 0.72;
/** At/above FAR_MAX and below this → MID (region); at/above → NEAR (detail). */
export const TIER_MID_MAX = 1.7;
/** Cross-fade half-width (scale units) each side of a threshold — layers blend,
 * never hard-cut (INFO-HIERARCHY §2: "层间用透明度/缩放过渡,不硬切"). */
export const TIER_BAND = 0.22;

export type AtlasTier = 'far' | 'mid' | 'near';

/** The discrete semantic tier for a camera scale (the load-bearing decision;
 * the blend below is cosmetic transition only). */
export function zoomTier(scale: number): AtlasTier {
  if (scale < TIER_FAR_MAX) return 'far';
  if (scale < TIER_MID_MAX) return 'mid';
  return 'near';
}

/** Per-tier opacity for a smooth cross-fade around the two thresholds. Returns
 * three 0..1 alphas that always include the discrete {@link zoomTier} at ≥0.5.
 * This is a rendering transition, NOT a continuous rank (the semantic decision
 * stays the discrete tier). */
export function tierBlend(scale: number): { far: number; mid: number; near: number } {
  const ramp = (edge: number, s: number): number => {
    // 0 below (edge-band), 1 above (edge+band), linear across the band.
    const lo = edge - TIER_BAND;
    const hi = edge + TIER_BAND;
    if (s <= lo) return 0;
    if (s >= hi) return 1;
    return (s - lo) / (hi - lo);
  };
  const toMid = ramp(TIER_FAR_MAX, scale); // 0 = far, 1 = mid+
  const toNear = ramp(TIER_MID_MAX, scale); // 0 = mid-, 1 = near
  return {
    far: 1 - toMid,
    mid: toMid * (1 - toNear),
    near: toNear,
  };
}

// ─── Open water: off-sheet bearings ──────────────────────────────────────────
//
// Past `TIER_MID_MAX` the camera can sit in the gap BETWEEN islands, where the
// far-tier climate washes have already faded to zero (`applyTier` ramps
// `continentLayer.alpha` with `blend.far`) and nothing else is in frame. The
// screen then reads as blank paper with no way to tell which way land is —
// measured on the shipped atlas: twelve wheel steps from the default view left
// a viewport containing one route arc and nothing else.
//
// A paper sea chart answers this with off-sheet index marks: a tick on the
// sheet edge naming what lies beyond it and how far. That is navigation drawn
// from real island positions, not invented geography, so it satisfies
// invariant 1 (every prominent form traces to real place data) and it has an
// obvious readable twin — the same list, in words.

/** World-space spacing for the open-water graticule at a camera scale.
 *
 * Walks the 1-2-5 decade ladder a paper chart uses, picking the coarsest
 * spacing that still puts lines at least {@link GRATICULE_MIN_PX} apart on
 * screen. That keeps the grid legible at every zoom without ever drawing more
 * than a few dozen lines, and makes the step a stable, testable function of
 * scale rather than a magic number tuned at one zoom level. */
export const GRATICULE_MIN_PX = 80;

export function graticuleStep(scale: number): number {
  const safe = scale > 0 && Number.isFinite(scale) ? scale : 1;
  const target = GRATICULE_MIN_PX / safe;
  const decade = Math.pow(10, Math.floor(Math.log10(target)));
  for (const mult of [1, 2, 5]) {
    if (decade * mult >= target) return decade * mult;
  }
  return decade * 10;
}

/** Per-side safe area the edge ticks must stay inside. Mirrors the web HUD's
 *  `--fi-hud-*` layout contract so a tick and a panel can never claim the same
 *  pixels; a plain number means all four sides alike. */
export interface AtlasEdgeInset {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** One off-screen island, reduced to where its edge tick belongs. */
export interface AtlasBearing {
  slug: string;
  name: string;
  domain: AtlasDomain;
  /** Tick position, clamped onto the inset rectangle, in screen px. */
  x: number;
  y: number;
  /** Direction from the viewport centre toward the island, radians, +x right /
   *  +y down — the angle the tick's arrow points along. */
  angle: number;
  /** The same direction as a compass word. Carried on the mark so the readable
   *  twin states exactly what the tick points at without recomputing it — and
   *  so a caller in the main bundle needs no value import from this package. */
  compass: ReturnType<typeof bearingCompass>;
  /** Screen-space distance from the viewport centre to the island. */
  distance: number;
}

/** Compass point for a bearing angle — the readable twin's wording. Screen
 *  space has +y pointing DOWN, so north is -y. */
export function bearingCompass(angle: number): '北' | '东北' | '东' | '东南' | '南' | '西南' | '西' | '西北' {
  const points = ['东', '东南', '南', '西南', '西', '西北', '北', '东北'] as const;
  const turn = ((angle / (Math.PI * 2)) % 1 + 1) % 1;
  return points[Math.round(turn * 8) % 8]!;
}

/**
 * Edge ticks for the islands that have left the viewport.
 *
 * Input positions are already screen-projected by the caller (the stage owns
 * the camera transform); this function is pure arithmetic so it runs headless.
 *
 * - An island still on screen needs no tick and is skipped.
 * - The nearest islands win, because "what is just past this edge" is the
 *   question being answered; distance is display disambiguation, never a rank.
 * - At most one tick per angular sector, so a crowded direction shows its
 *   closest island instead of a pile of overlapping marks — the same discrete
 *   keep/drop discipline as {@link deconflictLabels}.
 */
export function offscreenBearings(
  islands: readonly { slug: string; name: string; domain: AtlasDomain; sx: number; sy: number }[],
  view: { width: number; height: number },
  opts: { inset?: number | AtlasEdgeInset; max?: number; sectors?: number } = {},
): AtlasBearing[] {
  // Per-side, because the HUD is not symmetric: the research panel claims the
  // right edge and two control bands claim the top. A tick drawn under a panel
  // is a tick the reader never gets.
  const raw = opts.inset ?? 34;
  const inset: AtlasEdgeInset = typeof raw === 'number'
    ? { top: raw, right: raw, bottom: raw, left: raw }
    : raw;
  const max = opts.max ?? 6;
  const sectors = opts.sectors ?? 16;
  const boxW = view.width - inset.left - inset.right;
  const boxH = view.height - inset.top - inset.bottom;
  if (boxW <= 0 || boxH <= 0) return [];

  const cx = view.width / 2;
  const cy = view.height / 2;
  const candidates: AtlasBearing[] = [];

  for (const o of islands) {
    const onScreen = o.sx >= 0 && o.sx <= view.width && o.sy >= 0 && o.sy <= view.height;
    if (onScreen) continue;
    const dx = o.sx - cx;
    const dy = o.sy - cy;
    const distance = Math.hypot(dx, dy);
    if (distance < 1) continue;

    // Push the direction out to the safe rectangle: scale the ray by whichever
    // side it reaches first, so the tick lands on the nearer edge rather than a
    // corner. Each side uses its own inset, so an asymmetric HUD moves the tick
    // instead of hiding it.
    const limX = dx >= 0 ? view.width - inset.right - cx : cx - inset.left;
    const limY = dy >= 0 ? view.height - inset.bottom - cy : cy - inset.top;
    const t = Math.min(
      Math.max(0, limX) / Math.abs(dx || 1e-6),
      Math.max(0, limY) / Math.abs(dy || 1e-6),
    );
    const angle = Math.atan2(dy, dx);
    candidates.push({
      slug: o.slug,
      name: o.name,
      domain: o.domain,
      x: cx + dx * t,
      y: cy + dy * t,
      angle,
      compass: bearingCompass(angle),
      distance,
    });
  }

  candidates.sort((a, b) => a.distance - b.distance || (a.slug < b.slug ? -1 : 1));

  const taken = new Set<number>();
  const out: AtlasBearing[] = [];
  for (const c of candidates) {
    if (out.length >= max) break;
    const sector = Math.floor((((c.angle / (Math.PI * 2)) % 1 + 1) % 1) * sectors);
    if (taken.has(sector)) continue;
    taken.add(sector);
    out.push(c);
  }
  return out;
}

// ─── Deterministic hashing (self-contained; renderer must not import assets) ──
//
// Follows the exact FNV-1a + mulberry32 recipe of assets/islandSilhouette so an
// island's fake-generated identity and coastline stay stable per slug forever
// (invariant 13). Restated here only because of the package boundary.

/** FNV-1a 32-bit hash — same string in ⇒ same number out, forever. */
export function atlasHash(input: string, salt = 0): number {
  // FNV-1a; the optional salt XORs the offset basis, matching (bit-for-bit)
  // the salted variant the web despace pipeline used before unification.
  let h = 0x811c9dc5 ^ salt;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 PRNG — deterministic stream from a seed (no Math.random). */
export function atlasRng(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Discrete footprint radius per growth stage (0 empty .. 3 school) — a small
 * fixed table (transcription of stage, never a formula over a continuous
 * score), mirroring assets STAGE_RADIUS. */
export const ATLAS_STAGE_RADIUS: readonly [number, number, number, number] = [30, 40, 52, 64];

/** One shared vertex count + jitter magnitude for EVERY domain — matches
 * `assets/islandSilhouette`'s `VERTEX_COUNT`/`JITTER` (the one soft-mound
 * family the prototype draws). See the ROLLBACK NOTE at the top of that file:
 * a per-domain "coastline grammar" (数理 angular / 物质 faceted / 生命 organic
 * / 交叉 hybrid) was tried once already for the SVG L0 and reverted after
 * user testing called it an invented visual language, never authorized by
 * `design/handoff/问题群岛-原型 v3.dc.html`. `atlasCoastline` must not
 * reintroduce that pattern — domain stays a FILL/INK input only
 * (`ATLAS_DOMAIN_FILL`/`ATLAS_DOMAIN_INK` in `atlas-stage.ts`), never a shape
 * input. */
const COASTLINE_VERTEX_COUNT = 9;
const COASTLINE_JITTER = 0.22;

/**
 * A deterministic closed coastline as a flat `[x,y,x,y,…]` point list around
 * `(cx,cy)`, seeded by `slug` — the SAME soft-mound family at every zoom, only
 * perturbed by seed (never by domain, see the rollback note above). Emits
 * POINTS (consumed by `atlas-stage.ts` as a smooth closed Catmull-Rom curve,
 * mirroring `islandSilhouette.moundPath`'s technique) instead of an SVG path,
 * and lives here to keep the renderer package free of an assets dependency.
 * `domain` is accepted (kept for call-site stability / possible future
 * non-geometric use) but intentionally UNUSED for the point layout.
 */
export function atlasCoastline(slug: string, _domain: AtlasDomain, stage: number, cx: number, cy: number): number[] {
  const rng = atlasRng(atlasHash(slug));
  const r = ATLAS_STAGE_RADIUS[Math.max(0, Math.min(3, stage)) as 0 | 1 | 2 | 3];
  const n = COASTLINE_VERTEX_COUNT;
  const pts: number[] = [];
  for (let i = 0; i < n; i++) {
    const theta = (i / n) * Math.PI * 2 - Math.PI / 2;
    const j = 1 - COASTLINE_JITTER / 2 + rng() * COASTLINE_JITTER;
    pts.push(cx + Math.cos(theta) * r * j, cy + Math.sin(theta) * r * 0.62 * j);
  }
  return pts;
}

// ─── Fake-island generator (demo scale test only) ────────────────────────────

/** Bounds the deterministic scatter of generated islands (a wide sea so 700
 * spread out rather than pile up). */
export const FAKE_WORLD: { w: number; h: number } = { w: 5200, h: 3400 };

/**
 * Deterministically synthesise `n` fake islands for the `?n=` scale test. Each
 * field is derived from `hash(slug)` so the same `n` always yields the same
 * atlas (invariant 13) — DEMO ONLY, clearly slugged `fake-*`, never real data.
 * Scatter is a low-discrepancy hash grid (not RNG clumps) so density is even
 * enough to exercise de-collision without a real layout pass.
 */
export function makeFakeIslands(n: number): AtlasIslandInput[] {
  const out: AtlasIslandInput[] = [];
  const cols = Math.max(1, Math.ceil(Math.sqrt(n * (FAKE_WORLD.w / FAKE_WORLD.h))));
  const rows = Math.max(1, Math.ceil(n / cols));
  const cellW = FAKE_WORLD.w / cols;
  const cellH = FAKE_WORLD.h / rows;
  for (let i = 0; i < n; i++) {
    const slug = `fake-${i}`;
    const h = atlasHash(slug);
    const rng = atlasRng(h);
    const domain = ATLAS_DOMAINS[h % 4]!;
    const stage = (h >> 3) % 4;
    // Even-ish scatter: jittered grid so labels genuinely crowd at mid zoom.
    const gx = i % cols;
    const gy = Math.floor(i / cols);
    const x = (gx + 0.15 + rng() * 0.7) * cellW;
    const y = (gy + 0.15 + rng() * 0.7) * cellH;
    const eventCount = (h >> 6) % 120;
    const outlier = (h >> 11) % 23 === 0; // ~4% variance-select outliers
    const dormant = (h >> 9) % 7 === 0;
    out.push({
      slug,
      name: `岛屿${i}`,
      domain,
      stage,
      status: outlier ? 'outlier' : 'active',
      dormant,
      outlier,
      eventCount,
      x,
      y,
    });
  }
  return out;
}

// ─── Label priority + billboard de-collision ─────────────────────────────────

/**
 * Display priority for a label when the screen crowds — HIGHER wins the slot,
 * the loser demotes to a dot. This is disambiguation, not a score shown to the
 * user: outliers (variance-select) always float above the bulk, then activity
 * (eventCount) breaks the rest. The outcome is a DISCRETE label|dot, never a
 * continuous size ramp (invariant: no leaderboard rendered as "bigger=better").
 */
export function islandPriority(o: AtlasIslandInput): number {
  return (o.outlier ? 1e6 : 0) + o.eventCount;
}

/** A label's screen-space placement request. */
export interface LabelBox {
  id: string;
  priority: number;
  /** Screen-space centre. */
  sx: number;
  sy: number;
  halfW: number;
  halfH: number;
}

export type LabelVerdict = 'label' | 'dot';

/**
 * Resolve which labels render as text and which demote to a point marker, by
 * screen-space AABB collision in priority order (high → low). Higher priority
 * claims its box first; any later box that overlaps an accepted one demotes to
 * 'dot'. A uniform spatial-hash grid keeps this ~O(n) instead of O(n²) at 700
 * labels (only accepted boxes populate the grid). Runs once per camera settle
 * (zoom/pan end), not per frame — cost is paid on interaction, not on idle.
 *
 * Returns a Map id→verdict (every input id present). Deterministic: ties in
 * priority break by id so the same crowd resolves identically each settle.
 */
export function deconflictLabels(boxes: readonly LabelBox[], cell = 96, opts: { pad?: number; maxLabels?: number } = {}): Map<string, LabelVerdict> {
  // `pad` keeps surviving labels a breath apart (edge-to-edge cards read as one
  // wall of text); `maxLabels` is the screen's label BUDGET — beyond it even a
  // collision-free card demotes to a dot. Both keep the discrete label|dot
  // outcome (never a size ramp).
  const pad = opts.pad ?? 0;
  const maxLabels = opts.maxLabels ?? Infinity;
  const order = [...boxes].sort((a, b) => (b.priority - a.priority) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const verdict = new Map<string, LabelVerdict>();
  // Spatial hash of accepted boxes: bucket key → accepted box list.
  const grid = new Map<string, LabelBox[]>();
  const cellsFor = (b: LabelBox): string[] => {
    const keys: string[] = [];
    const x0 = Math.floor((b.sx - b.halfW - pad) / cell);
    const x1 = Math.floor((b.sx + b.halfW + pad) / cell);
    const y0 = Math.floor((b.sy - b.halfH - pad) / cell);
    const y1 = Math.floor((b.sy + b.halfH + pad) / cell);
    for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) keys.push(`${cx}:${cy}`);
    return keys;
  };
  const hit = (a: LabelBox, b: LabelBox): boolean =>
    Math.abs(a.sx - b.sx) < a.halfW + b.halfW + pad && Math.abs(a.sy - b.sy) < a.halfH + b.halfH + pad;

  let accepted = 0;
  for (const b of order) {
    if (accepted >= maxLabels) { verdict.set(b.id, 'dot'); continue; }
    const keys = cellsFor(b);
    let collide = false;
    for (const k of keys) {
      const bucket = grid.get(k);
      if (!bucket) continue;
      for (const acc of bucket) {
        if (hit(b, acc)) { collide = true; break; }
      }
      if (collide) break;
    }
    if (collide) {
      verdict.set(b.id, 'dot');
    } else {
      verdict.set(b.id, 'label');
      accepted++;
      for (const k of keys) {
        const bucket = grid.get(k);
        if (bucket) bucket.push(b);
        else grid.set(k, [b]);
      }
    }
  }
  return verdict;
}

// ─── Unified label placement: labels may MOVE, not only survive or die ───────
//
// `deconflictLabels` compares labels against labels. Island coastlines are
// invisible to it, and a region name is anchored at its cluster's spatial
// medoid — which is, by construction, in the middle of that cluster's islands.
// Measured on the shipped atlas at 1440×900: 11/11 region names at the world
// tier and 12/13 at the default camera were sitting on top of an island glyph,
// hiding the artwork the name is supposed to be describing.
//
// Demoting them all to dots would delete the region layer. A paper chart does
// the other thing: it slides the name into open water and keeps it near its
// feature. This pass does that — an accepted label also becomes an obstacle,
// so ONE call resolves names against glyphs and against each other.

/** Anything a label must not cover: an island coastline, an already-placed
 *  name, a HUD card. Same screen-space AABB shape as {@link LabelBox}. */
export interface LabelObstacle {
  sx: number;
  sy: number;
  halfW: number;
  halfH: number;
}

export interface LabelPlacement {
  verdict: LabelVerdict;
  /** Where the label actually landed. Equal to the input anchor when the label
   *  did not need to move, and when it demoted to a dot. */
  sx: number;
  sy: number;
}

/** Search order for a displaced label, as unit offsets. Vertical first: a name
 *  set above or below its region reads as belonging to it, while a sideways
 *  shove reads as pointing at whatever is now beside it. Diagonals follow, then
 *  half-steps — twelve directions rather than eight, because on a crowded
 *  camera the four cardinal escapes are often all taken and a name that finds
 *  no candidate is a name the reader loses entirely. */
const LABEL_NUDGES: readonly (readonly [number, number])[] = [
  [0, -1], [0, 1], [-1, 0], [1, 0],
  [-1, -1], [1, -1], [-1, 1], [1, 1],
  [-0.5, -1], [0.5, -1], [-0.5, 1], [0.5, 1],
];

/**
 * Place labels so they clear both the given obstacles and each other.
 *
 * Priority order matches {@link deconflictLabels} (high → low, id as the
 * deterministic tiebreak). Each label tries its anchor, then rings of
 * increasing radius; the first free candidate wins. A label with no free
 * candidate demotes to `dot` at its anchor — the discrete label|dot outcome is
 * unchanged, so this never becomes a "bigger = better" rank.
 */
export function placeLabels(
  boxes: readonly LabelBox[],
  obstacles: readonly LabelObstacle[] = [],
  opts: {
    pad?: number;
    maxLabels?: number;
    rings?: number;
    ringStep?: number;
    cell?: number;
    /** Screen rectangle a displaced label must stay wholly inside. Without it,
     *  a nudge can push a name off the sheet — which is worse than the overlap
     *  it was escaping, since a half-visible name reads as a clipping bug. */
    bounds?: { minX: number; minY: number; maxX: number; maxY: number };
  } = {},
): Map<string, LabelPlacement> {
  const pad = opts.pad ?? 0;
  const maxLabels = opts.maxLabels ?? Infinity;
  const rings = Math.max(0, opts.rings ?? 3);
  const ringStep = opts.ringStep ?? 26;
  const cell = opts.cell ?? 96;
  const bounds = opts.bounds;
  const inBounds = (sx: number, sy: number, halfW: number, halfH: number): boolean =>
    !bounds
    || (sx - halfW >= bounds.minX && sx + halfW <= bounds.maxX
      && sy - halfH >= bounds.minY && sy + halfH <= bounds.maxY);

  const grid = new Map<string, LabelObstacle[]>();
  const cellsFor = (sx: number, sy: number, halfW: number, halfH: number): string[] => {
    const keys: string[] = [];
    const x0 = Math.floor((sx - halfW - pad) / cell);
    const x1 = Math.floor((sx + halfW + pad) / cell);
    const y0 = Math.floor((sy - halfH - pad) / cell);
    const y1 = Math.floor((sy + halfH + pad) / cell);
    for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) keys.push(`${cx}:${cy}`);
    return keys;
  };
  const add = (o: LabelObstacle): void => {
    for (const k of cellsFor(o.sx, o.sy, o.halfW, o.halfH)) {
      const bucket = grid.get(k);
      if (bucket) bucket.push(o);
      else grid.set(k, [o]);
    }
  };
  const free = (sx: number, sy: number, halfW: number, halfH: number): boolean => {
    for (const k of cellsFor(sx, sy, halfW, halfH)) {
      const bucket = grid.get(k);
      if (!bucket) continue;
      for (const o of bucket) {
        if (Math.abs(sx - o.sx) < halfW + o.halfW + pad && Math.abs(sy - o.sy) < halfH + o.halfH + pad) return false;
      }
    }
    return true;
  };

  for (const o of obstacles) add(o);

  const order = [...boxes].sort((a, b) => (b.priority - a.priority) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const out = new Map<string, LabelPlacement>();
  let accepted = 0;

  for (const b of order) {
    if (accepted >= maxLabels) { out.set(b.id, { verdict: 'dot', sx: b.sx, sy: b.sy }); continue; }
    let placed: LabelPlacement | null = null;
    // The anchor itself is exempt from `bounds`: a label the camera has partly
    // scrolled off the sheet keeps its true position rather than sliding back
    // in and lying about where its feature is. Bounds only constrain a nudge.
    if (free(b.sx, b.sy, b.halfW, b.halfH)) {
      placed = { verdict: 'label', sx: b.sx, sy: b.sy };
    } else {
      search: for (let ring = 1; ring <= rings; ring++) {
        for (const [dx, dy] of LABEL_NUDGES) {
          // Step by the label's own extent so a nudge actually clears what it
          // was covering, instead of creeping by a fixed pixel amount that a
          // wide name would need a dozen rings to escape.
          const sx = b.sx + dx * ring * (ringStep + b.halfW);
          const sy = b.sy + dy * ring * (ringStep + b.halfH);
          if (!inBounds(sx, sy, b.halfW, b.halfH)) continue;
          if (free(sx, sy, b.halfW, b.halfH)) { placed = { verdict: 'label', sx, sy }; break search; }
        }
      }
    }
    if (placed) {
      out.set(b.id, placed);
      add({ sx: placed.sx, sy: placed.sy, halfW: b.halfW, halfH: b.halfH });
      accepted++;
    } else {
      out.set(b.id, { verdict: 'dot', sx: b.sx, sy: b.sy });
    }
  }
  return out;
}

// ─── Placeholder archipelago clustering (C3 will replace) ────────────────────

/**
 * PLACEHOLDER clustering — groups islands by `domain` into (up to) four named
 * archipelagos, excluding variance-select outliers (they float solo). This is a
 * stand-in for the Phase C3 lane's real projection over the domain manifold /
 * ledger currents; it satisfies the {@link AtlasCluster} contract so the far-
 * tier renderer can be built and tested now. **Replace the body, keep the
 * signature**, when C3 lands.
 */
export function placeholderClusters(islands: readonly AtlasIslandInput[]): AtlasCluster[] {
  const byDomain = new Map<AtlasDomain, AtlasIslandInput[]>();
  for (const o of islands) {
    if (o.outlier) continue; // outliers never fold into a cluster
    const list = byDomain.get(o.domain);
    if (list) list.push(o);
    else byDomain.set(o.domain, [o]);
  }
  const clusters: AtlasCluster[] = [];
  for (const domain of ATLAS_DOMAINS) {
    const members = byDomain.get(domain);
    if (!members || members.length === 0) continue;
    let sx = 0;
    let sy = 0;
    for (const m of members) { sx += m.x; sy += m.y; }
    const cx = sx / members.length;
    const cy = sy / members.length;
    let maxR = 0;
    for (const m of members) maxR = Math.max(maxR, Math.hypot(m.x - cx, m.y - cy));
    clusters.push({
      id: `domain:${domain}`,
      name: `${domain}群岛`,
      islandSlugs: members.map((m) => m.slug),
      center: { x: cx, y: cy },
      radius: Math.max(120, maxR + 90),
      tint: ATLAS_DOMAIN_FILL[domain],
    });
  }
  return clusters;
}

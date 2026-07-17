/**
 * Layout v0 (M1-DESIGN §6) — the layout layer that turns an island descriptor
 * into a headless {@link SceneGraph} the Pixi {@link SceneStage} consumes.
 *
 * M1 scope: deterministic tile placement good enough to render and measure — a
 * ground disc (elevation 0), the six visible stations on a ring, domain scenery,
 * a few claim growth-bodies, and night-only ghosts. M4 added the height field
 * (M4.1), one biome Landmark per island (M4.4) and the density-gradient scatter
 * rings (M4.5); the 36-primitive building kit (M4.2) has not landed yet — this
 * file exists so the `fold → layout → SceneGraph → renderer` pipeline is wired
 * and testable now.
 *
 * Pure and PixiJS-free: only headless renderer types + the pure generator, so it
 * unit-tests in node without a GPU. Every visual dimension binds to data (P1):
 * station visibility ← stage, scenery ← domain, claim floors ← reproductions
 * (synthesised from eventCount in M1; real projectClaimState in M4), ghosts ←
 * ledger abandon/refute events.
 */
import type { ClaimState, StationKind } from '@frontier-isles/core';
import type { Domain } from '@frontier-isles/data/frontiers';
import {
  isoDepthKey,
  type Growth,
  type SceneGraph,
  type SceneObject,
} from '@frontier-isles/renderer';
import { generate, type GenerateInput } from './generator';

/** Island grid size in tiles (M1 fixed; M4 varies by island scale). */
const GRID = 16;
const CENTER = { gx: GRID / 2, gy: GRID / 2 };
/** Ground disc radius — a rounded island, not a rectangle (real coast noise = M4). */
const ISLAND_R = 7;

/** Deterministic tile per station kind: a ring around the island centre. */
const STATION_TILES: Record<StationKind, { gx: number; gy: number }> = {
  questions: { gx: 8, gy: 4 },
  workshop: { gx: 11, gy: 6 },
  library: { gx: 12, gy: 9 },
  data: { gx: 11, gy: 12 },
  canvas: { gx: 8, gy: 12 },
  gallery: { gx: 5, gy: 12 },
  tearoom: { gx: 4, gy: 9 },
  driftwood: { gx: 5, gy: 6 },
  dock: { gx: 8, gy: 15 }, // on the shore, front-most
};

/** A restrained reuse of the original AI之问 campus grammar: large civic
 * buildings frame a readable central court on a bounded research platform.
 * Only selected flagship islands opt in; the organic grammar remains the
 * default so the archipelago does not collapse into one repeated template. */
const COURTYARD_STATION_TILES: Record<StationKind, { gx: number; gy: number }> = {
  questions: { gx: 11, gy: 5 },
  workshop: { gx: 4, gy: 6 },
  library: { gx: 7, gy: 3 },
  data: { gx: 11, gy: 10 },
  canvas: { gx: 6, gy: 8 },
  gallery: { gx: 4, gy: 11 },
  tearoom: { gx: 10, gy: 12 },
  driftwood: { gx: 8, gy: 13 },
  dock: { gx: 8, gy: 15 },
};

/**
 * Stele tiles — "steles before the Gallery" (architecture §4 Claims & evidence,
 * Phase B.4). Claims are first-class artifacts displayed as inscribed steles
 * clustered in a two-row arc IN FRONT of the Gallery station (gallery sits at
 * {5,12}; "front" is seaward, +gy, toward the viewer), replacing the M1 inner
 * ring around the island centre. The first stele stands directly before the
 * Gallery door; later ones fan out along the arc. Ghost steles (refuted /
 * returned, night-only) reuse the same rows — a spectral stele among the stone
 * ones. All tiles are clear of every STATION_TILE and the LANDMARK_TILE.
 */
const CLAIM_TILES = [
  { gx: 5, gy: 13 }, // directly before the Gallery
  { gx: 4, gy: 13 },
  { gx: 6, gy: 13 },
  { gx: 3, gy: 14 }, // second row, fanned seaward
  { gx: 5, gy: 14 },
  { gx: 7, gy: 14 },
];
const COURTYARD_CLAIM_TILES = [
  { gx: 7, gy: 9 }, { gx: 8, gy: 9 }, { gx: 9, gy: 9 },
  { gx: 7, gy: 10 }, { gx: 8, gy: 10 }, { gx: 9, gy: 10 },
];

/** Fixed anchor tile for the island's single biome Landmark (M4.4) — "岛心最高
 *  tile" (M4-DESIGN §2): near the geometric centre but clear of every claim/
 *  station tile above, so it never collides with either ring. */
const LANDMARK_TILE = { gx: 8, gy: 9 };
const COURTYARD_LANDMARK_TILE = { gx: 8, gy: 7 };
/** Small life-trace anchors along the civic circuit. Generator data decides how
 * many are occupied and whether an AI resident joins; the renderer decides form. */
const RESIDENT_TILES = [
  { gx: 9, gy: 6 }, { gx: 10, gy: 8 }, { gx: 9, gy: 11 },
  { gx: 7, gy: 11 }, { gx: 6, gy: 9 }, { gx: 7, gy: 7 }, { gx: 8, gy: 10 },
];
const COURTYARD_RESIDENT_TILES = [
  { gx: 5, gy: 5 }, { gx: 9, gy: 5 }, { gx: 10, gy: 8 },
  { gx: 6, gy: 11 }, { gx: 9, gy: 11 }, { gx: 5, gy: 9 }, { gx: 12, gy: 8 },
];
/** ~2.8× a normal station's 30px body — "2–3× 体量" (M4-DESIGN §3e). */
const LANDMARK_HEIGHT = 84;
/** One Landmark form per biome/domain (M4-DESIGN §3e) — the renderer (scene-stage.ts)
 *  picks the draw function from this code; the mapping is the only place biome →
 *  landmark shape is decided, so it stays a pure function of `input.domain`. */
const LANDMARK_CODE: Record<Domain, string> = {
  数理: 'crystal', // 巨型几何晶体 · 多面棱晶簇
  物质: 'foundry', // 不熄熔炉尖塔 · 发光炉口方尖碑
  生命: 'worldtree', // 世界树温室 · 巨树 + 玻璃穹
  交叉: 'archhub', // 桥拱枢纽 · 多向连桥拱
};

/**
 * Density-ring classification (M4.5, M4-DESIGN §2): normalised centre-distance
 * `d` buckets into 3 bands — core (Landmark + high building density, almost no
 * scatter), mid (the densest scatter/vegetation ring), shore (sparse, coastal
 * kinds). Scatter placement below samples every land tile against this ring's
 * probability, so density visibly grades outward.
 */
type ScatterRing = 'core' | 'mid' | 'shore';
function ringAt(gx: number, gy: number): ScatterRing {
  const d = centreDist(gx, gy);
  if (d < 0.35) return 'core';
  if (d < 0.7) return 'mid';
  return 'shore';
}
/** Per-tile scatter probability by ring — mid is the densest (M4-DESIGN §2 table). */
function scatterProb(ring: ScatterRing): number {
  switch (ring) {
    case 'core':
      return 0.05;
    case 'mid':
      return 0.32;
    case 'shore':
      return 0.14;
  }
}
/** Deterministic per-tile roll (0..1), seeded by the island so re-renders don't flicker. */
function scatterRng(gx: number, gy: number, seed: number): number {
  return hash2(gx * 1.7 + seed * 0.37, gy * 1.7 + seed * 0.61);
}
/** Kinds that read as coastal (M4-DESIGN §2 shore examples: 礁石…); everything
 *  else in a domain's scenery pool is "inland" and favoured by core/mid tiles. */
const COASTAL_KINDS: ReadonlySet<string> = new Set(['reef']);
/** Hard cap on generated scatter objects — bounds worst-case sortedNodeCount (§7). */
const MAX_SCATTER = 48;

// ── deterministic height field (M4.1) ──────────────────────────────────────

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
}
function fbm(x: number, y: number): number {
  let v = 0;
  let amp = 0.5;
  for (let i = 0; i < 4; i++) {
    v += amp * vnoise(x, y);
    x *= 2;
    y *= 2;
    amp *= 0.5;
  }
  return v;
}

/** Normalised distance from island centre (0 = centre, ~1 = rim). */
function centreDist(gx: number, gy: number): number {
  return Math.hypot(gx + 0.5 - CENTER.gx, gy + 0.5 - CENTER.gy) / ISLAND_R;
}

/** Land test with a noisy coastline — no rectangles/perfect circles (P6, §4). */
function isLand(gx: number, gy: number, seed: number): boolean {
  const d = Math.hypot(gx + 0.5 - CENTER.gx, gy + 0.5 - CENTER.gy);
  return d < ISLAND_R * (0.8 + fbm((gx + seed) * 0.2, (gy + seed) * 0.2) * 0.32);
}

/** Bounded jiehua-like platform with clipped corners and a shore-facing dock. */
function isCourtyardLand(gx: number, gy: number): boolean {
  if (gx === 8 && gy === 15) return true;
  if (gx < 1 || gx > 14 || gy < 2 || gy > 14) return false;
  const clippedCorner =
    (gx + gy < 5) || ((15 - gx) + gy < 4)
    || (gx + (15 - gy) < 3) || ((15 - gx) + (15 - gy) < 3);
  return !clippedCorner;
}

function courtyardElevation(gx: number, gy: number): 0 | 1 | 2 {
  if (gx <= 1 || gx >= 14 || gy <= 2 || gy >= 14) return 0;
  if (gx >= 7 && gx <= 9 && gy >= 6 && gy <= 8) return 2;
  return 1;
}

/** Terrain elevation 0/1/2 from a radial + noise height field (P6, M4.1). */
function elevationAt(gx: number, gy: number, seed: number): 0 | 1 | 2 {
  const radial = 1 - centreDist(gx, gy);
  const h = radial * 0.7 + fbm((gx + seed) * 0.15, (gy + seed) * 0.15) * 0.55;
  return h > 0.64 ? 2 : h > 0.36 ? 1 : 0;
}

/**
 * Per-tile ground lightness jitter (terrain fingerprint, depth-plan-v1 §5). A
 * small SIGNED delta in ±0.045 (≈ ±4.5% lightness, the "手绘纸面的呼吸感" band,
 * NOT a colourful patchwork), seeded by `hash(op-id)` (the island `seed`) so the
 * same island renders identically on every client (invariant 13) yet two islands
 * differ. Non-semantic noise only — it transcribes nothing, so it stays this quiet.
 */
function groundTintDelta(gx: number, gy: number, seed: number): number {
  return (hash2(gx * 3.11 + seed * 0.73, gy * 3.11 + seed * 0.29) - 0.5) * 0.09;
}

/** Stable 0..1 variant seed from an id (djb2). */
function variantSeed(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 33) ^ id.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000;
}

/** The input a layout needs — a superset of the generator's input. */
export type LayoutInput = GenerateInput;

/**
 * Parse a claim scene-object id (`claim:${i}`, pushed above) back to its index
 * into the `claims` array passed to {@link buildSceneGraph} — the inverse of the
 * id this module assigns each claim tower. Used by the Pixi hit-test callback to
 * look up the tapped tower's {@link ClaimState} for the detail panel (scene-upgrade
 * OUTSTANDING P1 "claim 点击接面板"). Returns null for any non-claim id.
 */
export function claimIndexFromId(id: string): number | null {
  if (!id.startsWith('claim:')) return null;
  const n = Number(id.slice('claim:'.length));
  return Number.isInteger(n) && n >= 0 ? n : null;
}

/** One claim building's data-driven form (from projectClaimState, or synthesised). */
interface ClaimSpec {
  floors: number;
  roof: boolean;
  ghost?: ClaimState['ghost'];
  /** Published-with-DOI (ledger `publish`) → the seal reads as a real DOI stamp. */
  hasDoi: boolean;
}

/**
 * Build the SceneGraph for one island at day↔night slider `t`. Deterministic:
 * same input → same graph. `claims` (from `projectClaimState`, M4.3) drives claim
 * buildings — floors/roof/ghost from the ledger; omitted → a deterministic synth.
 * `activeStations` (from `core.projectActiveStations`, M8) marks which stations
 * had recent ledger activity — the renderer's chimney smoke / flag wave read it;
 * omitted → no station is marked active (micro-dynamics simply don't play).
 */
export function buildSceneGraph(
  input: LayoutInput,
  t = 0,
  claims?: ClaimState[],
  activeStations?: ReadonlySet<StationKind>,
): SceneGraph {
  const scene = generate(input);
  const objects: SceneObject[] = [];
  const courtyard = input.layoutVariant === 'courtyard';
  const stationTiles = courtyard ? COURTYARD_STATION_TILES : STATION_TILES;
  const claimTiles = courtyard ? COURTYARD_CLAIM_TILES : CLAIM_TILES;
  const landmarkTile = courtyard ? COURTYARD_LANDMARK_TILE : LANDMARK_TILE;
  const residentTiles = courtyard ? COURTYARD_RESIDENT_TILES : RESIDENT_TILES;

  const push = (
    id: string,
    kind: string,
    gx: number,
    gy: number,
    layer: SceneObject['layer'],
    opts: Partial<SceneObject> = {},
  ): void => {
    const elevation = opts.elevation ?? 0;
    const band = layer === 'terrain' ? 'ground' : 'object';
    const footprint = opts.footprint;
    objects.push({
      id,
      kind,
      gx,
      gy,
      footprint,
      layer,
      elevation,
      depthKey: isoDepthKey({ id, kind, gx, gy, footprint }, elevation, band),
      dayVisibility: opts.dayVisibility ?? 1,
      nightVisibility: opts.nightVisibility ?? 1,
      lodLevel: 'Z2',
      biome: input.domain,
      variant: variantSeed(id),
      height: opts.height,
      growth: opts.growth,
      active: opts.active,
      tint: opts.tint,
      shore: opts.shore,
    });
  };

  const seed = Math.floor(variantSeed(input.slug) * 997);
  const tileKey = (gx: number, gy: number): string => `${gx},${gy}`;

  // Claim buildings: from the ledger (projectClaimState, M4.3) if given, else synth.
  const claimSpecs: ClaimSpec[] =
    claims && claims.length > 0
      ? claims.slice(0, claimTiles.length).map((c) => ({ floors: c.floors, roof: c.roof, ghost: c.ghost, hasDoi: c.hasDoi }))
      : Array.from({ length: Math.min(claimTiles.length, Math.floor((input.eventCount ?? 0) / 4)) }, (_, i) => {
          const f = Math.floor(variantSeed(`claim:${input.slug}:${i}`) * 4);
          // Synth has no ledger → no DOI evidence. Honest default: preprint, not published.
          return { floors: f, roof: f >= 3, hasDoi: false };
        });

  // Building/scenery tiles are forced to land so nothing floats on the noisy coast.
  const forced = new Set<string>();
  for (const s of scene.stations) if (s.visible) forced.add(tileKey(stationTiles[s.kind].gx, stationTiles[s.kind].gy));
  for (let i = 0; i < claimSpecs.length; i++) forced.add(tileKey(claimTiles[i]!.gx, claimTiles[i]!.gy));
  scene.residents.slice(0, residentTiles.length).forEach((_, i) => forced.add(tileKey(residentTiles[i]!.gx, residentTiles[i]!.gy)));
  forced.add(tileKey(landmarkTile.gx, landmarkTile.gy));
  scene.ghosts.forEach((_, i) => forced.add(tileKey(claimTiles[(i + 3) % claimTiles.length]!.gx, claimTiles[(i + 3) % claimTiles.length]!.gy)));

  const land = (gx: number, gy: number): boolean => (courtyard ? isCourtyardLand(gx, gy) : isLand(gx, gy, seed)) || forced.has(tileKey(gx, gy));
  const elev = (gx: number, gy: number): 0 | 1 | 2 => courtyard ? courtyardElevation(gx, gy) : elevationAt(gx, gy, seed);

  // ── ground bed (terrain layer) — 3-level elevation from the height field ────
  // Each tile also carries the terrain fingerprint (depth-plan-v1 §5): a stable
  // per-tile lightness jitter (seeded by the island) for a hand-drawn paper feel,
  // and a `shore` flag for elevation-0 tiles bordering open sea → the renderer
  // gives those a warm sand/shallows transition instead of a hard green coast.
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      if (!land(gx, gy)) continue;
      const e = elev(gx, gy);
      const shore =
        e === 0 &&
        (!land(gx - 1, gy) || !land(gx + 1, gy) || !land(gx, gy - 1) || !land(gx, gy + 1));
      push(`ground:${gx},${gy}`, 'ground', gx, gy, 'terrain', {
        elevation: e,
        tint: groundTintDelta(gx, gy, seed),
        shore,
      });
    }
  }

  // ── stations (world layer) — visibility bound to stage; sit on their tile ───
  for (const s of scene.stations) {
    if (!s.visible) continue;
    const tile = stationTiles[s.kind];
    const height = s.kind === 'dock' ? 10 : 30; // dock is a low pier
    push(`station:${s.kind}`, `station:${s.kind}`, tile.gx, tile.gy, 'world', {
      height,
      elevation: elev(tile.gx, tile.gy),
      active: activeStations?.has(s.kind) ?? false,
    });
  }

  // ── biome Landmark (world layer) — M4.4, one per island, 2–3× body ──────────
  // Fixed at LANDMARK_TILE (the "岛心最高 tile"): elevation forced to the top
  // tier so it always reads as the island's tallest silhouette, regardless of
  // what the noisy height field would have put there. Shape is a pure function
  // of `input.domain` via LANDMARK_CODE — the renderer picks the draw function.
  push(`landmark:${input.domain}`, `landmark:${LANDMARK_CODE[input.domain]}`, landmarkTile.gx, landmarkTile.gy, 'world', {
    height: LANDMARK_HEIGHT,
    elevation: 2,
  });

  // ── residents (world layer) — the previously generated occupancy now reaches
  // Pixi. Human/AI identity is categorical, never a score; figures stand along
  // the civic circuit so the island reads as inhabited rather than as a model.
  scene.residents.slice(0, residentTiles.length).forEach((resident, i) => {
    const tile = residentTiles[i]!;
    push(`resident:${resident.kind}:${i}`, `resident:${resident.kind}`, tile.gx, tile.gy, 'world', {
      height: resident.kind === 'ai' ? 18 : 16,
      elevation: elev(tile.gx, tile.gy),
      dayVisibility: resident.kind === 'ai' ? 0.62 : 1,
      nightVisibility: resident.kind === 'ai' ? 1 : 0.72,
    });
  });

  // ── claim buildings before the Gallery ────────────────────────────────────
  // A claim is a slender research building: foundation = public claim, storeys
  // = countable reproductions, roof = consensus, spectral scaffold = refuted /
  // returned. It stays distinctly smaller than civic stations and remains
  // clustered before Gallery, preserving the first-class-artifact semantics.
  claimSpecs.forEach((spec, i) => {
    const tile = claimTiles[i]!;
    const growth: Growth = { foundation: true, floors: spec.floors, roof: spec.roof, hasDoi: spec.hasDoi };
    const height = 16 + spec.floors * 12; // base + one inscription row per reproduction (P1)
    const night = spec.ghost ? { dayVisibility: 0, nightVisibility: 1 } : {};
    push(`claim:${i}`, 'claim', tile.gx, tile.gy, 'world', { growth, height, elevation: elev(tile.gx, tile.gy), ...night });
  });

  // ── scenery (world layer) — density-gradient rings (M4.5) ───────────────────
  // Every land tile not already claimed by a station/claim/Landmark/ghost is a
  // scatter candidate; whether it gets an object is a deterministic per-tile roll
  // against that ring's probability (core sparse → mid densest → shore sparse),
  // so density visibly grades from the island's core to its shoreline. Kind comes
  // from the domain's own scenery pool (sceneryForDomain) — coastal kinds (reef)
  // are favoured at the shore, everything else inland — so no new kind/data is
  // invented, only *where* the domain's existing kinds land.
  // Density transcribes liveliness (richness-plan §1.1, depth-plan-v1 §5 "growth
  // stage → building density"): scatter fill scales with the island's activity
  // (stage + eventCount + members), NOT a constant. A brand-new empty island reads
  // bare; a bustling school fills its mid-ring. Bounded so it stays a modulation of
  // the ring probabilities, never an override — and it's a pure function of the
  // input, so the graph stays deterministic (invariant 13). Each tile's roll is
  // still the seeded `scatterRng`, so a denser island is a strict superset of a
  // quieter one's scatter — density grades with data, tile placement stays stable.
  const clamp01 = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
  const ec = input.eventCount ?? 0;
  const liveliness = clamp01(
    0.55 + input.stage * 0.15 + Math.min(ec, 40) / 40 * 0.4 + Math.min(input.members, 6) / 6 * 0.15,
    0.5,
    1.5,
  );
  const coastalKinds = scene.scenery.map((s) => s.kind).filter((k) => COASTAL_KINDS.has(k));
  const inlandKinds = scene.scenery.map((s) => s.kind).filter((k) => !COASTAL_KINDS.has(k));
  let coastalI = 0;
  let inlandI = 0;
  let scatterN = 0;
  const scatterCandidates: Array<{ gx: number; gy: number }> = [];
  for (let gy = 0; gy < GRID; gy++) for (let gx = 0; gx < GRID; gx++) scatterCandidates.push({ gx, gy });
  for (const { gx, gy } of scatterCandidates) {
    if (scatterN >= MAX_SCATTER) break;
    const key = tileKey(gx, gy);
    if (forced.has(key) || !land(gx, gy)) continue;
    const ring = ringAt(gx, gy);
    if (scatterRng(gx, gy, seed) >= scatterProb(ring) * liveliness) continue;
    const useCoastal = ring === 'shore' && coastalKinds.length > 0;
    const pool = useCoastal ? coastalKinds : inlandKinds.length > 0 ? inlandKinds : coastalKinds;
    if (pool.length === 0) continue;
    const kind = useCoastal ? pool[coastalI++ % pool.length]! : pool[inlandI++ % pool.length]!;
    forced.add(key); // reserve — nothing placed after this loop can collide
    push(`scenery:${key}:${kind}`, `scenery:${kind}`, gx, gy, 'world', { height: 12, elevation: elev(gx, gy) });
    scatterN++;
  }

  // ── ghosts (world layer) — NIGHT-ONLY, bound to abandon/refute events ───────
  // The day/night visibility path (P4): dayVisibility 0 → nightVisibility 1, so
  // ghosts fade in only as t → 1. Data source = ledger refute/return_to_driftwood.
  scene.ghosts.forEach((gh, i) => {
    const tile = claimTiles[(i + 3) % claimTiles.length]!;
    push(`ghost:${i}:${gh.type}`, `ghost:${gh.type}`, tile.gx, tile.gy, 'world', {
      dayVisibility: 0,
      nightVisibility: 1,
      height: 22,
      elevation: elev(tile.gx, tile.gy),
    });
  });

  return { size: { w: GRID, h: GRID }, objects, t };
}

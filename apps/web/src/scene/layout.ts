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
import type { Domain } from '@frontier-isles/data';
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

/** Inner-ring tiles for claim growth-bodies (between centre and the station ring). */
const CLAIM_TILES = [
  { gx: 8, gy: 8 },
  { gx: 9, gy: 7 },
  { gx: 7, gy: 9 },
  { gx: 9, gy: 9 },
  { gx: 7, gy: 7 },
  { gx: 8, gy: 6 },
];

/** Fixed anchor tile for the island's single biome Landmark (M4.4) — "岛心最高
 *  tile" (M4-DESIGN §2): near the geometric centre but clear of every claim/
 *  station tile above, so it never collides with either ring. */
const LANDMARK_TILE = { gx: 8, gy: 9 };
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

/** Terrain elevation 0/1/2 from a radial + noise height field (P6, M4.1). */
function elevationAt(gx: number, gy: number, seed: number): 0 | 1 | 2 {
  const radial = 1 - centreDist(gx, gy);
  const h = radial * 0.7 + fbm((gx + seed) * 0.15, (gy + seed) * 0.15) * 0.55;
  return h > 0.64 ? 2 : h > 0.36 ? 1 : 0;
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
}

/**
 * Build the SceneGraph for one island at day↔night slider `t`. Deterministic:
 * same input → same graph. `claims` (from `projectClaimState`, M4.3) drives claim
 * buildings — floors/roof/ghost from the ledger; omitted → a deterministic synth.
 */
export function buildSceneGraph(input: LayoutInput, t = 0, claims?: ClaimState[]): SceneGraph {
  const scene = generate(input);
  const objects: SceneObject[] = [];

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
    });
  };

  const seed = Math.floor(variantSeed(input.slug) * 997);
  const tileKey = (gx: number, gy: number): string => `${gx},${gy}`;

  // Claim buildings: from the ledger (projectClaimState, M4.3) if given, else synth.
  const claimSpecs: ClaimSpec[] =
    claims && claims.length > 0
      ? claims.slice(0, CLAIM_TILES.length).map((c) => ({ floors: c.floors, roof: c.roof, ghost: c.ghost }))
      : Array.from({ length: Math.min(CLAIM_TILES.length, Math.floor((input.eventCount ?? 0) / 4)) }, (_, i) => {
          const f = Math.floor(variantSeed(`claim:${input.slug}:${i}`) * 4);
          return { floors: f, roof: f >= 3 };
        });

  // Building/scenery tiles are forced to land so nothing floats on the noisy coast.
  const forced = new Set<string>();
  for (const s of scene.stations) if (s.visible) forced.add(tileKey(STATION_TILES[s.kind].gx, STATION_TILES[s.kind].gy));
  for (let i = 0; i < claimSpecs.length; i++) forced.add(tileKey(CLAIM_TILES[i]!.gx, CLAIM_TILES[i]!.gy));
  forced.add(tileKey(LANDMARK_TILE.gx, LANDMARK_TILE.gy));
  scene.ghosts.forEach((_, i) => forced.add(tileKey(CLAIM_TILES[(i + 3) % CLAIM_TILES.length]!.gx, CLAIM_TILES[(i + 3) % CLAIM_TILES.length]!.gy)));

  const land = (gx: number, gy: number): boolean => isLand(gx, gy, seed) || forced.has(tileKey(gx, gy));
  const elev = (gx: number, gy: number): 0 | 1 | 2 => elevationAt(gx, gy, seed);

  // ── ground bed (terrain layer) — 3-level elevation from the height field ────
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      if (land(gx, gy)) push(`ground:${gx},${gy}`, 'ground', gx, gy, 'terrain', { elevation: elev(gx, gy) });
    }
  }

  // ── stations (world layer) — visibility bound to stage; sit on their tile ───
  for (const s of scene.stations) {
    if (!s.visible) continue;
    const tile = STATION_TILES[s.kind];
    const height = s.kind === 'dock' ? 10 : 30; // dock is a low pier
    push(`station:${s.kind}`, `station:${s.kind}`, tile.gx, tile.gy, 'world', { height, elevation: elev(tile.gx, tile.gy) });
  }

  // ── biome Landmark (world layer) — M4.4, one per island, 2–3× body ──────────
  // Fixed at LANDMARK_TILE (the "岛心最高 tile"): elevation forced to the top
  // tier so it always reads as the island's tallest silhouette, regardless of
  // what the noisy height field would have put there. Shape is a pure function
  // of `input.domain` via LANDMARK_CODE — the renderer picks the draw function.
  push(`landmark:${input.domain}`, `landmark:${LANDMARK_CODE[input.domain]}`, LANDMARK_TILE.gx, LANDMARK_TILE.gy, 'world', {
    height: LANDMARK_HEIGHT,
    elevation: 2,
  });

  // ── claim growth-bodies (world layer) — floors/roof/ghost from the ledger ────
  claimSpecs.forEach((spec, i) => {
    const tile = CLAIM_TILES[i]!;
    const growth: Growth = { foundation: true, floors: spec.floors, roof: spec.roof };
    const height = 16 + spec.floors * 12; // base + one storey per reproduction (P1)
    // A refuted/returned claim (ghost) shows only at night (P5 — never deleted).
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
    if (forced.has(key) || !isLand(gx, gy, seed)) continue;
    const ring = ringAt(gx, gy);
    if (scatterRng(gx, gy, seed) >= scatterProb(ring)) continue;
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
    const tile = CLAIM_TILES[(i + 3) % CLAIM_TILES.length]!;
    push(`ghost:${i}:${gh.type}`, `ghost:${gh.type}`, tile.gx, tile.gy, 'world', {
      dayVisibility: 0,
      nightVisibility: 1,
      height: 22,
      elevation: elev(tile.gx, tile.gy),
    });
  });

  return { size: { w: GRID, h: GRID }, objects, t };
}

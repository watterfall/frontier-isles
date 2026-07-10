/**
 * Layout v0 (M1-DESIGN §6) — the layout layer that turns an island descriptor
 * into a headless {@link SceneGraph} the Pixi {@link SceneStage} consumes.
 *
 * M1 scope: deterministic tile placement good enough to render and measure — a
 * ground disc (elevation 0), the six visible stations on a ring, domain scenery,
 * a few claim growth-bodies, and night-only ghosts. The real density-ring
 * algorithm, elevation and 36-primitive kit land in M4; this file exists so the
 * `fold → layout → SceneGraph → renderer` pipeline is wired and testable now.
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

/** Mid-ring tiles for scenery scatter. */
const SCENERY_TILES = [
  { gx: 3, gy: 5 }, { gx: 13, gy: 5 }, { gx: 13, gy: 13 }, { gx: 3, gy: 13 },
  { gx: 8, gy: 2 }, { gx: 2, gy: 9 }, { gx: 14, gy: 9 }, { gx: 6, gy: 3 },
  { gx: 10, gy: 3 }, { gx: 6, gy: 14 }, { gx: 10, gy: 14 }, { gx: 2, gy: 7 },
];

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
  scene.scenery.forEach((_, i) => forced.add(tileKey(SCENERY_TILES[i % SCENERY_TILES.length]!.gx, SCENERY_TILES[i % SCENERY_TILES.length]!.gy)));
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

  // ── claim growth-bodies (world layer) — floors/roof/ghost from the ledger ────
  claimSpecs.forEach((spec, i) => {
    const tile = CLAIM_TILES[i]!;
    const growth: Growth = { foundation: true, floors: spec.floors, roof: spec.roof };
    const height = 16 + spec.floors * 12; // base + one storey per reproduction (P1)
    // A refuted/returned claim (ghost) shows only at night (P5 — never deleted).
    const night = spec.ghost ? { dayVisibility: 0, nightVisibility: 1 } : {};
    push(`claim:${i}`, 'claim', tile.gx, tile.gy, 'world', { growth, height, elevation: elev(tile.gx, tile.gy), ...night });
  });

  // ── scenery (world layer) — kinds bound to domain ──────────────────────────
  scene.scenery.forEach((sc, i) => {
    const tile = SCENERY_TILES[i % SCENERY_TILES.length]!;
    push(`scenery:${i}:${sc.kind}`, `scenery:${sc.kind}`, tile.gx, tile.gy, 'world', { height: 12, elevation: elev(tile.gx, tile.gy) });
  });

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

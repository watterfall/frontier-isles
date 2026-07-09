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
import type { StationKind } from '@frontier-isles/core';
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

function inIsland(gx: number, gy: number): boolean {
  const dx = gx + 0.5 - CENTER.gx;
  const dy = gy + 0.5 - CENTER.gy;
  return dx * dx + dy * dy <= ISLAND_R * ISLAND_R;
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
 * Build the SceneGraph for one island at day↔night slider `t`. Deterministic:
 * same input → same graph (the generator's seeded RNG + fixed tile tables).
 */
export function buildSceneGraph(input: LayoutInput, t = 0): SceneGraph {
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

  // ── ground bed (terrain layer, elevation 0 in M1) ──────────────────────────
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      if (inIsland(gx, gy)) push(`ground:${gx},${gy}`, 'ground', gx, gy, 'terrain');
    }
  }

  // ── stations (world layer) — visibility bound to stage ─────────────────────
  for (const s of scene.stations) {
    if (!s.visible) continue;
    const tile = STATION_TILES[s.kind];
    // Dock is a low pier; other stations are civic buildings.
    const height = s.kind === 'dock' ? 10 : 30;
    push(`station:${s.kind}`, `station:${s.kind}`, tile.gx, tile.gy, 'world', { height });
  }

  // ── claim growth-bodies (world layer) — floors bound to reproductions ───────
  const claimCount = Math.min(CLAIM_TILES.length, Math.floor((input.eventCount ?? 0) / 4));
  for (let i = 0; i < claimCount; i++) {
    const tile = CLAIM_TILES[i]!;
    const seed = variantSeed(`claim:${input.slug}:${i}`);
    const floors = Math.floor(seed * 4); // 0..3 reproductions (M1 synth; M4 = projectClaimState)
    const growth: Growth = { foundation: true, floors, roof: floors >= 3 };
    // Height binds to floors (P1): base + one storey per independent reproduction.
    const height = 16 + floors * 12;
    push(`claim:${i}`, 'claim', tile.gx, tile.gy, 'world', { growth, height });
  }

  // ── scenery (world layer) — kinds bound to domain ──────────────────────────
  scene.scenery.forEach((sc, i) => {
    const tile = SCENERY_TILES[i % SCENERY_TILES.length]!;
    push(`scenery:${i}:${sc.kind}`, `scenery:${sc.kind}`, tile.gx, tile.gy, 'world', { height: 12 });
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
    });
  });

  return { size: { w: GRID, h: GRID }, objects, t };
}

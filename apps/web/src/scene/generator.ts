/**
 * Procedural L1 scene generator for non-sample islands (path C: parameterized
 * templates). The sample island keeps its bespoke hand-laid scene
 * (sampleIsland.ts); every curated/founded island gets a generated scene.
 *
 * The station POSITIONS reuse the prototype's carefully laid-out footprint
 * (each station asset's baked default x/y). Variety comes from:
 *  - stage → which stations are visible (empty/hut/academy/school)
 *  - domain → scenery & vegetation biome (数理 stone / 物质 bamboo / 生命 verdant / 交叉 mixed)
 *  - status → dormant moss / dissolved mist / resolved lighthouse
 *  - scores → outlier glow, tide
 *  - members → resident count
 *  - events → night ghosts (ledger-driven, not hardcoded)
 *
 * Deterministic: a seeded PRNG (mulberry32) from the slug hash means the same
 * island always renders the same scene — no flicker on re-render. The output
 * shape carries gx/gy shadows so the path-B grid migration (P3) is mechanical.
 *
 * Architecture invariants: data-driven (§1), day/night palette-only (§1),
 * growth earned from events (§4), user content untranslated (§9).
 */
import type { StationKind } from '@frontier-isles/core';
import type { Domain } from '@frontier-isles/data/frontiers';

// ── deterministic RNG ──────────────────────────────────────────────────────

function slugHash(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── types ──────────────────────────────────────────────────────────────────

export interface GenStation {
  kind: StationKind;
  visible: boolean;
}

export interface GenScenery {
  kind: 'reef' | 'lotus' | 'stoneLantern' | 'steppingStones' | 'desirePath' | 'tree' | 'bamboo' | 'creationStone';
  x?: number;
  y?: number;
  scale?: number;
  variant?: 0 | 1;
}

export interface GenResident {
  x: number;
  y: number;
  kind: 'human' | 'ai';
  aiRole?: 'scout' | 'advocate' | 'synthesizer' | 'ferryman';
  caption?: string;
}

export interface GenGhost {
  type: 'card' | 'prototype' | 'canvas';
  threshold: number;
}

export interface GeneratedScene {
  stations: GenStation[];
  scenery: GenScenery[];
  residents: GenResident[];
  ghosts: GenGhost[];
  lanterns: Array<{ x: number; y: number; size: 'large' | 'small'; sway: number }>;
  domain: Domain;
  stage: number;
  dormant: boolean;
  status: 'open' | 'active' | 'dissolved' | 'resolved';
  outlier: boolean;
  /** Tide N = A − D (night-science), drives moon/water level. */
  tide: number;
}

// ── station footprint (the prototype's laid-out positions, reused) ─────────

/** The 9 station kinds. The station ASSET components carry their own baked
 *  default x/y (the prototype's carefully laid-out positions within the
 *  ground diamond). We do NOT pass x/y — we let stations render at their
 *  baked defaults (exactly like the sample Scene.tsx), only gating visibility
 *  per stage. This guarantees stations never float outside the island. */
const STATION_KINDS_LIST: StationKind[] = [
  'library', 'canvas', 'questions', 'data', 'workshop', 'gallery', 'tearoom', 'driftwood', 'dock',
];

/** Which stations appear at each growth stage (§4: empty → hut → academy → school).
 *  Founding alone = empty (no artifacts). First artifact = hut. ≥3 stations = academy. */
function stationsForStage(stage: number): Set<StationKind> {
  if (stage <= 0) return new Set<StationKind>(['questions', 'dock']);
  if (stage === 1) return new Set<StationKind>(['questions', 'workshop', 'driftwood', 'dock']);
  return new Set<StationKind>(['library', 'canvas', 'questions', 'data', 'workshop', 'gallery', 'tearoom', 'driftwood', 'dock']);
}

// ── domain biomes + per-slug personalization ──────────────────────────────

/** 8 tree slots (the prototype's positions). Per-island we pick a random
 *  subset (3–8) with ±12px positional jitter so same-domain islands differ. */
const TREE_SLOTS = [
  { x: 340, y: 436, scale: 1.3 },
  { x: 392, y: 398, scale: 1 },
  { x: 1128, y: 462, scale: 1.35 },
  { x: 1082, y: 512, scale: 1 },
  { x: 664, y: 252, scale: 1.2 },
  { x: 852, y: 300, scale: 1 },
  { x: 580, y: 634, scale: 1.15 },
  { x: 982, y: 606, scale: 1 },
];

/** jitter a coordinate by ±px deterministically. */
function jitter(rng: () => number, v: number, px: number): number {
  return v + Math.round((rng() - 0.5) * 2 * px);
}

function sceneryForDomain(domain: Domain, rng: () => number): GenScenery[] {
  const base: GenScenery[] = [
    { kind: 'reef', variant: 0 },
    { kind: 'reef', variant: 1 },
    { kind: 'stoneLantern' },
    { kind: 'steppingStones' },
    { kind: 'desirePath' },
    { kind: 'creationStone' },
  ];
  // Per-slug tree count: 3–8, randomly selected slots with jitter.
  const treeCount = 3 + Math.floor(rng() * 6);
  const shuffled = [...TREE_SLOTS].sort(() => rng() - 0.5).slice(0, treeCount);
  const trees: GenScenery[] = shuffled.map((t) => ({
    kind: 'tree' as const,
    x: jitter(rng, t.x, 12),
    y: jitter(rng, t.y, 10),
    scale: t.scale * (0.85 + rng() * 0.3),
  }));
  switch (domain) {
    case '数理':
      // Stone/cold — fewer trees (pick half), bare rock feel.
      return [...base, ...trees.slice(0, Math.ceil(trees.length / 2))];
    case '物质':
      // Bamboo + sparse trees, warm metallic.
      return [...base, { kind: 'bamboo' }, ...trees.slice(0, Math.max(2, Math.ceil(trees.length / 2)))];
    case '生命':
      // Verdant — all trees + lotus pond.
      return [...base, { kind: 'lotus' }, ...trees];
    case '交叉':
      // Mixed — lotus + bamboo + ~2/3 of the trees.
      return [...base, { kind: 'lotus' }, { kind: 'bamboo' }, ...trees.slice(0, Math.ceil(trees.length * 2 / 3))];
  }
}

// ── resident synthesis ─────────────────────────────────────────────────────

const RESIDENT_SLOTS = [
  { x: 930, y: 442 },
  { x: 614, y: 452 },
  { x: 858, y: 608 },
  { x: 880, y: 614 },
  { x: 786, y: 742 },
  { x: 838, y: 646 },
];

function residentsForMembers(members: number, hasAi: boolean, rng: () => number): GenResident[] {
  const count = Math.min(members, RESIDENT_SLOTS.length);
  // Shuffle slots so different islands place residents at different stations.
  const shuffled = [...RESIDENT_SLOTS].sort(() => rng() - 0.5).slice(0, count);
  const out: GenResident[] = shuffled.map((s) => ({
    x: jitter(rng, s.x, 14),
    y: jitter(rng, s.y, 10),
    kind: 'human' as const,
  }));
  if (hasAi) {
    out.push({ x: jitter(rng, 820, 20), y: jitter(rng, 398, 14), kind: 'ai', aiRole: 'scout' });
  }
  return out;
}

/** Per-slug lantern positions (2–4, jittered) for the night layer. */
export function lanternsForSlug(rng: () => number): Array<{ x: number; y: number; size: 'large' | 'small'; sway: number }> {
  const count = 2 + Math.floor(rng() * 3); // 2–4
  const slots = [
    { x: 1032, y: 342, size: 'large' as const, sway: 3.4 },
    { x: 616, y: 318, size: 'large' as const, sway: 4.1 },
    { x: 846, y: 556, size: 'small' as const, sway: 3.8 },
    { x: 770, y: 636, size: 'small' as const, sway: 4.5 },
  ];
  return slots.sort(() => rng() - 0.5).slice(0, count).map((l) => ({
    x: jitter(rng, l.x, 16),
    y: jitter(rng, l.y, 12),
    size: l.size,
    sway: l.sway + (rng() - 0.5),
  }));
}

// ── the generator ──────────────────────────────────────────────────────────

export interface GenerateInput {
  slug: string;
  domain: Domain;
  stage: number;
  members: number;
  dormant: boolean;
  status: 'open' | 'active' | 'dissolved' | 'resolved';
  outlier: boolean;
  /** Tide N = A − D from computeNightScience (0 if unknown). */
  tide?: number;
  /** Whether the island has AI residents (from object.agents or memberships). */
  hasAi?: boolean;
  /** Night-replay events count (for ghost thresholds). */
  eventCount?: number;
  /** Spatial grammar only. A minority of curated islands reuse the original
   * sample's bounded research-courtyard composition; data semantics stay equal. */
  layoutVariant?: 'organic' | 'courtyard';
}

export function generate(input: GenerateInput): GeneratedScene {
  const rng = mulberry32(slugHash(input.slug));
  const visible = stationsForStage(input.stage);
  const stations: GenStation[] = STATION_KINDS_LIST.map((kind) => ({
    kind,
    visible: visible.has(kind),
  }));
  const scenery = sceneryForDomain(input.domain, rng);
  const residents =
    input.status === 'dissolved'
      ? []
      : residentsForMembers(input.members, input.hasAi ?? false, rng);
  // Ghosts: ledger-driven thresholds from event count (not hardcoded 12/41/63).
  // If no events, no ghosts. Otherwise spread across the timeline.
  const ec = input.eventCount ?? 0;
  const ghosts: GenGhost[] =
    ec > 0
      ? [
          { type: 'card', threshold: Math.max(1, Math.floor(ec * 0.15)) },
          ...(ec > 8 ? [{ type: 'prototype' as const, threshold: Math.floor(ec * 0.5) }] : []),
          ...(ec > 16 ? [{ type: 'canvas' as const, threshold: Math.floor(ec * 0.8) }] : []),
        ]
      : [];
  return {
    stations,
    scenery,
    residents,
    ghosts,
    lanterns: lanternsForSlug(rng),
    domain: input.domain,
    stage: input.stage,
    dormant: input.dormant,
    status: input.status,
    outlier: input.outlier,
    tide: input.tide ?? 0,
  };
}

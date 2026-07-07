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
import type { Domain } from '@frontier-isles/data';

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
  x: number;
  y: number;
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
  domain: Domain;
  stage: number;
  dormant: boolean;
  status: 'open' | 'active' | 'dissolved' | 'resolved';
  outlier: boolean;
  /** Tide N = A − D (night-science), drives moon/water level. */
  tide: number;
}

// ── station footprint (the prototype's laid-out positions, reused) ─────────

/** The 9 stations at the prototype's baked positions. The station asset
 *  components default to these x/y when none is passed; we surface them here
 *  so the generator can gate visibility per stage. */
const STATION_FOOTPRINT: Array<{ kind: StationKind; x: number; y: number }> = [
  { kind: 'library', x: 760, y: 296 },
  { kind: 'canvas', x: 600, y: 468 },
  { kind: 'questions', x: 976, y: 392 },
  { kind: 'data', x: 959, y: 550 },
  { kind: 'workshop', x: 470, y: 600 },
  { kind: 'gallery', x: 760, y: 700 },
  { kind: 'tearoom', x: 880, y: 650 },
  { kind: 'driftwood', x: 790, y: 606 },
  { kind: 'dock', x: 836, y: 792 },
];

/** Which stations appear at each growth stage (§4: empty → hut → academy → school).
 *  Founding alone = empty (no artifacts). First artifact = hut. ≥3 stations = academy. */
function stationsForStage(stage: number): Set<StationKind> {
  if (stage <= 0) return new Set<StationKind>(['questions', 'dock']);
  if (stage === 1) return new Set<StationKind>(['questions', 'workshop', 'driftwood', 'dock']);
  if (stage === 2) return new Set<StationKind>(['library', 'canvas', 'questions', 'data', 'workshop', 'gallery', 'tearoom', 'driftwood', 'dock']);
  return new Set<StationKind>(['library', 'canvas', 'questions', 'data', 'workshop', 'gallery', 'tearoom', 'driftwood', 'dock']);
}

// ── domain biomes ──────────────────────────────────────────────────────────

/** Tree positions (8 slots, sampled per-domain). */
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

function sceneryForDomain(domain: Domain, rng: () => number): GenScenery[] {
  const base: GenScenery[] = [
    { kind: 'reef', variant: 0 },
    { kind: 'reef', variant: 1 },
    { kind: 'stoneLantern' },
    { kind: 'steppingStones' },
    { kind: 'desirePath' },
    { kind: 'creationStone' },
  ];
  switch (domain) {
    case '数理':
      // Stone/cold — fewer trees, bare rock feel.
      return [...base, { kind: 'tree', ...TREE_SLOTS[2]!, scale: 1.1 }, { kind: 'tree', ...TREE_SLOTS[3]!, scale: 0.85 }];
    case '物质':
      // Bamboo + sparse trees, warm metallic.
      return [...base, { kind: 'bamboo' }, { kind: 'tree', ...TREE_SLOTS[4]!, scale: 1 }, { kind: 'tree', ...TREE_SLOTS[6]!, scale: 0.9 }];
    case '生命':
      // Verdant — trees + lotus pond.
      return [...base, { kind: 'lotus' }, ...TREE_SLOTS.map((t) => ({ kind: 'tree' as const, ...t }))];
    case '交叉':
      // Mixed — lotus + bamboo + half the trees.
      return [...base, { kind: 'lotus' }, { kind: 'bamboo' }, ...TREE_SLOTS.filter((_, i) => i % 2 === 0).map((t) => ({ kind: 'tree' as const, ...t }))];
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
  const out: GenResident[] = [];
  for (let i = 0; i < count; i++) {
    out.push({ ...RESIDENT_SLOTS[i]!, kind: 'human' });
  }
  if (hasAi) {
    // Place a literature scout near the library.
    out.push({ x: 820, y: 398, kind: 'ai', aiRole: 'scout' });
  }
  return out;
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
}

export function generate(input: GenerateInput): GeneratedScene {
  const rng = mulberry32(slugHash(input.slug));
  const visible = stationsForStage(input.stage);
  const stations: GenStation[] = STATION_FOOTPRINT.map((s) => ({
    ...s,
    visible: visible.has(s.kind),
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
    domain: input.domain,
    stage: input.stage,
    dormant: input.dormant,
    status: input.status,
    outlier: input.outlier,
    tide: input.tide ?? 0,
  };
}

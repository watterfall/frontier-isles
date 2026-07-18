/**
 * Data-driven description of the L1 sample island (「AI 之问」). The Scene
 * component maps each `kind` to a @frontier-isles/assets component; nothing
 * about the scene is hardcoded in JSX beyond that mapping (DECISIONS item 3:
 * "the L1 scene is data-driven React SVG"). Coordinates are the prototype's
 * own absolute scene coordinates.
 */
import type { StationKind } from '@frontier-isles/core';

/** The 8 iso-trees at their prototype positions/scales (lines ~134-141). */
export const TREES: Array<{ x: number; y: number; scale: number }> = [
  { x: 340, y: 436, scale: 1.3 },
  { x: 392, y: 398, scale: 1 },
  { x: 1128, y: 462, scale: 1.35 },
  { x: 1082, y: 512, scale: 1 },
  { x: 664, y: 252, scale: 1.2 },
  { x: 852, y: 300, scale: 1 },
  { x: 580, y: 634, scale: 1.15 },
  { x: 982, y: 606, scale: 1 },
];

export type SceneryKind =
  | 'reef'
  | 'lotus'
  | 'stoneLantern'
  | 'steppingStones'
  | 'desirePath'
  | 'tree'
  | 'bamboo'
  | 'creationStone';

export interface Placement {
  kind: SceneryKind;
  x?: number;
  y?: number;
  scale?: number;
  variant?: 0 | 1;
}

/** Ground-plane scenery, in painter's order. Pieces with no x/y render at
 *  their own baked prototype position (the asset's default props). */
export const SCENERY: Placement[] = [
  { kind: 'reef', variant: 0 },
  { kind: 'reef', variant: 1 },
  { kind: 'lotus' },
  { kind: 'stoneLantern' },
  { kind: 'steppingStones' },
  { kind: 'desirePath' },
  ...TREES.map((t) => ({ kind: 'tree' as const, ...t })),
  { kind: 'bamboo' },
  { kind: 'creationStone' },
];

/** The nine stations in prototype draw order (painter's depth). Each renders
 *  at its own baked default position; the selection ellipse uses the STN
 *  coordinates in fallback.ts. `dock` is the Ferry-Dock stub. */
export const STATION_ORDER: StationKind[] = [
  'library',
  'canvas',
  'questions',
  'data',
  'workshop',
  'gallery',
  'tearoom',
  'driftwood',
  'dock',
];

/** Day-time human residents at their stations (prototype lines ~313-318),
 *  with a mix of solo figures and an encounter. Captions are bilingual. */
export interface ResidentPlacement {
  x: number;
  y: number;
  kind: 'human' | 'ai';
  aiRole?: 'scout' | 'advocate' | 'synthesizer' | 'ferryman';
  flip?: boolean;
  caption?: { zh: string; en: string };
  carryingCanvas?: boolean;
  nightWatch?: boolean;
}

export const DAY_RESIDENTS: ResidentPlacement[] = [
  { x: 930, y: 442, kind: 'human', caption: { zh: '沈括 · 在问题墙', en: 'Shen Kuo · at the Question Wall' } },
  { x: 614, y: 452, kind: 'human', flip: true, carryingCanvas: true, caption: { zh: '林徽 · 携画布向白板厅', en: 'Lin Hui · carrying canvas to Whiteboard Hall' } },
  { x: 858, y: 608, kind: 'human' },
  { x: 880, y: 614, kind: 'human', flip: true },
  { x: 786, y: 742, kind: 'ai', aiRole: 'ferryman', caption: { zh: '连接协调员 · AI · 对齐邻岛问题', en: 'Connection steward · AI · aligning neighboring problems' } },
];

/** Always-present figures (day or night): 阿若 wandering + literature scout. */
export const CONSTANT_RESIDENTS: ResidentPlacement[] = [
  { x: 838, y: 646, kind: 'human', caption: { zh: '阿若 · 散木园游荡', en: 'A-Ruo · wandering the Driftwood Garden' } },
  { x: 820, y: 398, kind: 'ai', aiRole: 'scout', caption: { zh: '文献斥候 · AI', en: 'Literature scout · AI' } },
];

/** Night watch figure (沈括 · 守夜). */
export const NIGHT_RESIDENT: ResidentPlacement = { x: 960, y: 470, kind: 'human', nightWatch: true, caption: { zh: '沈括 · 守夜', en: 'Shen Kuo · night watch' } };

export type GhostType = 'card' | 'prototype' | 'canvas';

/**
 * Ghost artifacts, gated by the night timeline threshold (prototype
 * g1/g2/g3op). These are the SEED fallback thresholds — Phase B.2
 * (`scene/nightReveal.ts`) derives real thresholds from the machine-curiosity
 * ledger when it's reachable and falls back to these exact numbers when it
 * isn't, so offline rendering stays pixel-identical to before that change.
 * They correspond 1:1 to `apps/server/src/seed.ts`'s g1/g2/g3 ghost events:
 * g1 = return_to_driftwood @ night 12 ("被撤下的问题卡"), g2 = refute @ night
 * 41 ("实验坊原型宣告失败"), g3 = return_to_driftwood @ night 63 ("一张画布
 * 被废弃").
 */
export const GHOSTS: Array<{ type: GhostType; threshold: number }> = [
  { type: 'card', threshold: 12 },
  { type: 'prototype', threshold: 41 },
  { type: 'canvas', threshold: 63 },
];

/** Hanging paper lanterns of the night layer (prototype lines ~330-333). */
export const HANGING_LANTERNS: Array<{ x: number; y: number; size: 'large' | 'small'; sway: number }> = [
  { x: 1032, y: 342, size: 'large', sway: 3.4 },
  { x: 616, y: 318, size: 'large', sway: 4.1 },
  { x: 846, y: 556, size: 'small', sway: 3.8 },
  { x: 770, y: 636, size: 'small', sway: 4.5 },
];

/** Transplant-tag anchor by destination (prototype `transTagTx`). */
export const TRANS_TAG_POS: Record<string, { x: number; y: number }> = {
  实验坊: { x: 470, y: 600 },
  白板厅: { x: 560, y: 468 },
};

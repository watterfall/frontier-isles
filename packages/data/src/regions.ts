/**
 * Curated region-name overlay — the PLACE-PLANE editorial layer for the T1
 * named-region tier (docs/atlas-world-plan.md §2 "中层区域模型", lane W3).
 *
 * ── What this is (and is NOT) ────────────────────────────────────────────────
 * The middle tier of the world map is a PURE PROJECTION: `core.projectArchipelagos`
 * reduces the island field into ~30–50 computed regions (spatial × domain ×
 * current density), and that reduce ALONE decides which islands belong to which
 * region. This table adds ZERO membership logic and ZERO geometry — it only
 * supplies a nicer NAME (+ short caption) for a region the projection already
 * computed, keyed by that region's dominant curated `cluster.code`.
 *
 * This is the same nature as island names / resident names (architecture §7
 * invariant 9: place/editorial names are an authored, translatable layer) and
 * honours invariants 14/15 of depth-plan-v2: the sea is a `reduce` over the
 * ledger, and this overlay introduces no "draw a boundary" verb — remove this
 * file and every region still exists, just under a derived name.
 *
 * ── The hybrid ───────────────────────────────────────────────────────────────
 * Where a computed region's members are dominated by a KNOWN frontier cluster
 * (one of the curated `cluster.code`s in `frontiers.ts`), we hand it an evocative
 * place-name + caption below. Where they are NOT (e.g. a mixed region, or the
 * synthetic scale corpus's `S`-prefixed codes), `projectArchipelagos` falls back
 * to deriving the name from the dominant member cluster label — so the map reads
 * with character at any N, curated where we know the territory, cleanly derived
 * where we don't. Coverage is deliberately partial (~13 of 20 curated codes) to
 * keep the two paths visibly distinct.
 *
 * The `zh`/`en` fields are BARE descriptors (no 群岛/Archipelago suffix): the
 * projection appends the place-word uniformly so curated and derived names read
 * in one register ("工程生命群岛" / "Engineered Life Archipelago").
 */

export interface CuratedRegionName {
  /** Bare zh descriptor — the projection appends 群岛. */
  zh: string;
  /** Bare en descriptor — the projection appends " Archipelago". */
  en: string;
  /** One-line evocative caption (体温/性格), rendered under the region billboard. */
  caption: { zh: string; en: string };
}

/**
 * Curated region names keyed by the dominant curated `cluster.code` of a
 * computed region (`frontiers.ts` C-codes). Passed to `projectArchipelagos` via
 * `opts.curatedNames`; the projection matches a region's most-frequent member
 * `cluster.code` against this map. No code here → derived naming path.
 */
export const REGION_NAMES: Record<string, CuratedRegionName> = {
  C01: {
    zh: '工程生命',
    en: 'Engineered Life',
    caption: { zh: '在这里，生命是可编程的材料', en: 'Where life is programmable material' },
  },
  C03: {
    zh: '科学基座',
    en: 'Foundations for Science',
    caption: { zh: '为发现本身铸造的模型', en: 'Models forged for discovery itself' },
  },
  C08: {
    zh: '分子机器',
    en: 'Molecular Machines',
    caption: { zh: '以分子为齿轮的信息工厂', en: 'Information factories geared in molecules' },
  },
  C11: {
    zh: '计算认知',
    en: 'Computational Cognition',
    caption: { zh: '在硅与神经之间读心', en: 'Reading minds between silicon and neuron' },
  },
  C12: {
    zh: '生物电流',
    en: 'Bioelectric Reach',
    caption: { zh: '生命与电路接壤的海岸', en: 'The coast where life meets the circuit' },
  },
  C23: {
    zh: '形式疆域',
    en: 'Formal Frontier',
    caption: { zh: '机器与证明共写的数学', en: 'Mathematics co-written by machine and proof' },
  },
  C32: {
    zh: '意识之谜',
    en: 'The Riddle of Mind',
    caption: { zh: '经验为何存在', en: 'Why experience exists at all' },
  },
  C33: {
    zh: '实在之基',
    en: 'The Floor of Reality',
    caption: { zh: '叩问物质与时空的底层', en: 'Probing the floor of matter and spacetime' },
  },
  C34: {
    zh: '无知测绘',
    en: 'Mapping Ignorance',
    caption: { zh: '为我们尚不知道的事物绘制海图', en: "Charting what we don't yet know" },
  },
  C37: {
    zh: '生物暗物质',
    en: 'Biological Dark Matter',
    caption: { zh: '基因组里尚未命名的大陆', en: 'The unnamed continents of the genome' },
  },
  C44: {
    zh: '神经形态',
    en: 'Neuromorphic Shores',
    caption: { zh: '让物质自己学会计算', en: 'Matter that learns to compute' },
  },
  C47: {
    zh: '后量子',
    en: 'Post-Quantum',
    caption: { zh: '为量子之后的世界加密', en: 'Securing the world after quantum' },
  },
  C51: {
    zh: '因果之海',
    en: 'Causal Sea',
    caption: { zh: '从相关驶向原因', en: 'Sailing from correlation to cause' },
  },
};

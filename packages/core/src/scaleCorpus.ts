/**
 * Synthetic scale corpus — lane W4 of docs/atlas-world-plan.md §4 ("尺度数据脊").
 *
 * The world-map tiers (T0 continents, T1 named regions, T2 islands) need to be
 * stress-tested at N≈200/700 so a stranger skimming the far/mid tier sees a
 * plausible research frontier — not `fake-1, fake-2…` lorem (the existing
 * `packages/renderer/src/pixi/atlas-lod.ts#makeFakeIslands` demo generator,
 * which this module does NOT replace — it stays untouched so its pinned tests
 * in `renderer/test/atlas-lod.test.ts` keep passing). This module is a
 * SEPARATE, HONESTLY-FLAGGED synthetic corpus one layer up, in the domain
 * package, so every consumer (web app, and any future W2/W3 continent/region
 * lane) can import one shared generator instead of inventing its own.
 *
 * Believability grammar (docs/atlas-world-plan.md §0.5, §4 row W4): titles are
 * built compositionally from a curated per-domain vocabulary of REAL academic
 * subfields (~18 per domain) crossed with a small set of "frontier-tension"
 * templates (⟨subfield⟩的⟨tension⟩, ⟨method⟩驱动的⟨subfield⟩, ⟨subfieldA⟩与
 * ⟨subfieldB⟩, ⟨subfieldA⟩·⟨subfieldB⟩, ⟨adjective⟩的⟨subfield⟩) — the same
 * register as real xfrontier cluster names (「最小基因组与人工细胞」style), never
 * copied verbatim. The combinatorial space per domain (~1000+) is far larger
 * than any n/4 this module is asked to generate, so titles come out distinct
 * by construction; a deterministic collision-avoidance loop (bump a salt, never
 * `Math.random`) guards the tail risk anyway.
 *
 * Honesty (hard requirement): every record is prefixed `syn-` AND carries
 * `synthetic: true`. Never merge this into `apps/web/src/api/fallback.ts`'s
 * `DATA` (the curated real islands) — it is a separate, clearly-flagged set,
 * for scale-testing the atlas tiers only.
 *
 * Invariant 13 (determinism): `makeScaleCorpus(n, seed)` is a pure function of
 * its two number arguments — same call, byte-identical array, forever. No new
 * protocol verb, no store: this is a plain data projection, like every other
 * generator in this codebase (architecture §7).
 *
 * The returned `ScaleCorpusIsland` shape is a structural SUPERSET of
 * `@frontier-isles/renderer/pixi`'s `AtlasIslandInput` (slug/name/domain/stage/
 * status/dormant/outlier/eventCount/x/y all present with matching types), so a
 * `ScaleCorpusIsland[]` can be passed anywhere an `AtlasIslandInput[]` is
 * expected with zero adapter — TypeScript's structural typing accepts it
 * because assignment is through a typed variable, not an object literal (no
 * excess-property check fires). `renderer` is intentionally NOT imported here
 * (the workspace graph is `opp ← core ← apps/server`; `renderer` is a sibling
 * leaf consumed by `apps/web` — importing it from `core` would add a reverse
 * edge). The FNV-1a + mulberry32 hash/PRNG pair is therefore restated locally,
 * exactly as `atlas-lod.ts` itself already restates it from `assets` for the
 * same package-boundary reason.
 */

import type { DomainKey } from "./archipelago";

// ─── Deterministic hashing (self-contained; see file header) ────────────────

/** FNV-1a 32-bit hash — same string in ⇒ same number out, forever. */
function hash32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 PRNG — deterministic stream from a seed (no Math.random). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Believability vocabulary (curated, per domain) ──────────────────────────
//
// ~18 real-register subfield stems per domain. Tone reference (NOT copied):
// xfrontier cluster names like 「最小基因组与人工细胞」「标准化生物元件」
// 「AI co-scientist 与假说生成」「DNA 数据存储」「无知测绘·盲区科学」.

const SUBFIELDS: Record<DomainKey, readonly string[]> = {
  数理: [
    "范畴论", "同伦类型论", "信息几何", "随机矩阵理论", "拓扑数据分析",
    "因果推断", "元学习理论", "量子计算复杂度", "交互式证明助理", "极小曲面几何",
    "概率规划语言", "高维统计推断", "非欧几里得优化", "张量网络方法",
    "偏微分方程神经求解", "博弈均衡计算", "代数编码理论", "组合数学结构",
  ],
  物质: [
    "拓扑材料", "量子传感", "单分子催化", "高温超导机理", "软物质自组装",
    "极端条件物态", "核聚变约束", "纳米流体输运", "二维材料异质结", "分子马达",
    "相变临界现象", "生物矿化", "光子晶体", "高熵合金", "量子点发光",
    "自旋电子学", "高压物态化学", "声子工程",
  ],
  生命: [
    "最小基因组", "标准化生物元件", "单细胞图谱", "蛋白质从头设计", "类器官发育",
    "表观遗传编程", "微生物组工程", "DNA数据存储", "神经回路解码", "衰老时钟",
    "免疫记忆机制", "RNA疗法递送", "细胞命运重编程", "群体感应",
    "生物钟同步", "内共生进化", "再生医学信号", "多组学整合",
  ],
  交叉: [
    "AI协同科学发现", "认知盲区测绘方法", "计算社会科学", "人机协同创造力",
    "大模型科学推理", "数字孪生地球系统", "元科学可重复性", "脑机接口伦理",
    "气候经济耦合建模", "语言模型具身认知", "科学传播信任机制", "集体智能涌现",
    "生态气候临界点", "跨尺度多物理场耦合", "科研评价替代指标",
    "人工智能对齐认识论", "城市系统复杂性", "合成数据认识论地位",
  ],
};

/** Generic "frontier tension" modifiers — shared across domains. */
const TENSIONS = [
  "最小化", "可编程化", "自动化", "形式化", "跨尺度化", "去中心化",
  "可解释化", "标准化", "可逆化", "规模化", "实时化", "普适化",
] as const;

/** Domain-specific "method-driven" prefixes. */
const METHODS: Record<DomainKey, readonly string[]> = {
  数理: ["证明驱动", "形式驱动", "计算驱动", "符号驱动", "谱方法驱动", "采样驱动", "优化驱动", "逻辑驱动"],
  物质: ["表征驱动", "合成驱动", "模拟驱动", "原位驱动", "高通量驱动", "谱学驱动", "机器学习驱动", "极端条件驱动"],
  生命: ["组学驱动", "图谱驱动", "工程驱动", "测序驱动", "影像驱动", "表型驱动", "进化驱动", "单细胞驱动"],
  交叉: ["AI驱动", "数据驱动", "协同驱动", "模型驱动", "众包驱动", "跨域驱动", "仿真驱动", "认知驱动"],
};

/** Generic "still unsettled" adjectives. */
const ADJECTIVES = [
  "被低估的", "难以判定的", "正在成形的", "悬而未决的", "快速迁移的", "尚无共识的",
] as const;

/** Coarser named cluster per domain (~5 each) — the "地方感" tag one level
 * above `subdomain`, in the same "词·词" register as the curated
 * `FRONTIERS[].cluster` field (packages/data/src/frontiers.ts) but with a
 * distinct `S`-prefixed code namespace and distinct wording so no synthetic
 * cluster string collides with a real curated one. */
const CLUSTERS: Record<DomainKey, ReadonlyArray<{ code: string; zh: string; en: string }>> = {
  数理: [
    { code: "SM01", zh: "组合构造·代数结构", en: "Combinatorial & algebraic structures" },
    { code: "SM02", zh: "信息几何·统计流形", en: "Information geometry & statistical manifolds" },
    { code: "SM03", zh: "形式验证·证明系统", en: "Formal verification & proof systems" },
    { code: "SM04", zh: "计算复杂度·优化几何", en: "Computational complexity & optimization geometry" },
    { code: "SM05", zh: "随机分析·涌现动力学", en: "Stochastic analysis & emergent dynamics" },
  ],
  物质: [
    { code: "SP01", zh: "量子材料·拓扑相", en: "Quantum materials & topological phases" },
    { code: "SP02", zh: "软物质·自组装机制", en: "Soft matter & self-assembly mechanisms" },
    { code: "SP03", zh: "极端物态·聚变工程", en: "Extreme states & fusion engineering" },
    { code: "SP04", zh: "纳米器件·自旋输运", en: "Nano devices & spin transport" },
    { code: "SP05", zh: "材料基因组·高通量发现", en: "Materials genome & high-throughput discovery" },
  ],
  生命: [
    { code: "SL01", zh: "基因组极简·人工细胞", en: "Minimal genomes & artificial cells" },
    { code: "SL02", zh: "单细胞图谱·发育轨迹", en: "Single-cell atlases & developmental trajectories" },
    { code: "SL03", zh: "表观调控·可编程医学", en: "Epigenetic control & programmable medicine" },
    { code: "SL04", zh: "微生物组·群体行为", en: "Microbiome & collective behavior" },
    { code: "SL05", zh: "衰老免疫·再生信号", en: "Aging, immunity & regenerative signaling" },
  ],
  交叉: [
    { code: "SX01", zh: "科学发现自动化·AI协作", en: "Automating discovery & AI collaboration" },
    { code: "SX02", zh: "认知与语言模型·具身推理", en: "Cognition, LLMs & embodied reasoning" },
    { code: "SX03", zh: "复杂系统耦合·临界现象", en: "Coupled complex systems & tipping points" },
    { code: "SX04", zh: "元科学·评价与信任", en: "Metascience, evaluation & trust" },
    { code: "SX05", zh: "人机协同治理·伦理", en: "Human-AI governance & ethics" },
  ],
};

const DOMAIN_ORDER: readonly DomainKey[] = ["数理", "物质", "生命", "交叉"];

/** English glosses for the tension/adjective vocab (best-effort — this is a
 * synthetic scale-test corpus, not authored editorial content, so the `en`
 * field is a straightforward gloss rather than a hand-crafted translation). */
const TENSION_EN: Record<(typeof TENSIONS)[number], string> = {
  最小化: "minimization", 可编程化: "programmability", 自动化: "automation",
  形式化: "formalization", 跨尺度化: "cross-scale integration", 去中心化: "decentralization",
  可解释化: "interpretability", 标准化: "standardization", 可逆化: "reversibility",
  规模化: "scaling", 实时化: "real-time operation", 普适化: "universality",
};
const ADJECTIVE_EN: Record<(typeof ADJECTIVES)[number], string> = {
  被低估的: "an underrated", 难以判定的: "an undecidable", 正在成形的: "an emerging",
  悬而未决的: "an unresolved", 快速迁移的: "a fast-moving", 尚无共识的: "a contested",
};

// ─── Chart placement (1440×900 space — same convention as fallback.ts /
// AtlasIslandInput / packages/core/test/archipelago.test.ts's own fixtures) ──
//
// Loosely echoes the curated FRONTIERS layout (数理 left, 生命 middle, 物质
// right, all upper band; 交叉 spans the full width lower band) so synthetic
// islands read as part of the same map rather than randomly interspersed —
// deterministic hash-based placement only, no despace/force-layout pass.

interface Region { x0: number; x1: number; y0: number; y1: number }

const REGIONS: Record<DomainKey, Region> = {
  数理: { x0: 40, x1: 480, y0: 40, y1: 600 },
  生命: { x0: 480, x1: 960, y0: 40, y1: 600 },
  物质: { x0: 960, x1: 1400, y0: 40, y1: 600 },
  交叉: { x0: 40, x1: 1400, y0: 600, y1: 860 },
};

export const SCALE_WORLD: { w: number; h: number } = { w: 1440, h: 900 };

function placeInRegion(region: Region, localIndex: number, domainTotal: number, rng: () => number): { x: number; y: number } {
  const w = region.x1 - region.x0;
  const h = region.y1 - region.y0;
  const aspect = w / h;
  const cols = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, domainTotal) * aspect)));
  const rows = Math.max(1, Math.ceil(domainTotal / cols));
  const cellW = w / cols;
  const cellH = h / rows;
  const gx = localIndex % cols;
  const gy = Math.floor(localIndex / cols);
  const x = region.x0 + (gx + 0.15 + rng() * 0.7) * cellW;
  const y = region.y0 + (gy + 0.15 + rng() * 0.7) * cellH;
  return { x, y };
}

// ─── Title generation (believability grammar) ────────────────────────────────

interface TitlePick { title: string; titleEn: string; subdomain: string }

function pickTitle(domain: DomainKey, seedHash: number, salt: number): TitlePick {
  const rng = mulberry32(hash32(`${seedHash}:${salt}`));
  const subfields = SUBFIELDS[domain];
  const methods = METHODS[domain];
  const variant = Math.floor(rng() * 5);
  const subIdx = Math.floor(rng() * subfields.length);
  const subfield = subfields[subIdx]!;
  // A second, distinct subfield for the pairing templates (never equal to subIdx).
  const secIdx = (subIdx + 1 + Math.floor(rng() * (subfields.length - 1))) % subfields.length;
  const subfieldB = subfields[secIdx]!;

  switch (variant) {
    case 0: {
      const t = TENSIONS[Math.floor(rng() * TENSIONS.length)]!;
      return { title: `${subfield}的${t}`, titleEn: `The ${TENSION_EN[t]} of ${subfield}`, subdomain: subfield };
    }
    case 1: {
      const m = methods[Math.floor(rng() * methods.length)]!;
      return { title: `${m}的${subfield}`, titleEn: `${m}-driven ${subfield}`, subdomain: subfield };
    }
    case 2:
      return { title: `${subfield}与${subfieldB}`, titleEn: `${subfield} and ${subfieldB}`, subdomain: subfield };
    case 3:
      return { title: `${subfield}·${subfieldB}`, titleEn: `${subfield} · ${subfieldB}`, subdomain: subfield };
    default: {
      const a = ADJECTIVES[Math.floor(rng() * ADJECTIVES.length)]!;
      return { title: `${a}${subfield}`, titleEn: `${ADJECTIVE_EN[a]} frontier: ${subfield}`, subdomain: subfield };
    }
  }
}

// ─── Public shape ─────────────────────────────────────────────────────────────

/**
 * One synthetic island. Structurally a superset of `AtlasIslandInput`
 * (@frontier-isles/renderer/pixi/atlas-lod) — slug/name/domain/stage/status/
 * dormant/outlier/eventCount/x/y all present with matching types — plus the
 * extra data channels (`subdomain`/`cluster`/`members`) requested for the T2
 * per-island richness pass, and the mandatory `synthetic`/`syn-` honesty flags.
 */
export interface ScaleCorpusIsland {
  /** Always `syn-<i>` — never confusable with a curated or `fake-*` slug. */
  slug: string;
  /** Honesty flag: always `true`. Never merge a `ScaleCorpusIsland[]` into the
   * curated `DATA` array (apps/web/src/api/fallback.ts) — check this flag (or
   * the `syn-` slug prefix) at any boundary that might mix the two. */
  synthetic: true;
  /** zh title — the generated problem/frontier statement (AtlasIslandInput's `name`). */
  name: string;
  /** English gloss (best-effort; not authored editorial content). */
  nameEn: string;
  domain: DomainKey;
  /** The subfield stem the title was generated from — the "subdomain" tag. */
  subdomain: string;
  /** Coarser named cluster (~5 per domain), same shape as curated `FRONTIERS[].cluster`. */
  cluster: { code: string; zh: string; en: string };
  x: number;
  y: number;
  /** Growth stage 0..3 (empty/hut/academy/school). */
  stage: number;
  status: string;
  dormant: boolean;
  outlier: boolean;
  /** Editorial-style "resolved" flag (mirrors curated `FRONTIERS[].resolved`). */
  resolved: boolean;
  /** Activity proxy (0..~140), matching `AtlasIslandInput.eventCount`'s role. */
  eventCount: number;
  members: number;
}

/**
 * Deterministically synthesise `n` believable frontier islands. Same `(n,
 * seed)` ⇒ byte-identical array, forever (invariant 13). Domain assignment
 * cycles `DOMAIN_ORDER` so counts are balanced to within 1 of `n/4`
 * regardless of `n`; chart placement is a per-domain jittered grid inside a
 * region loosely echoing the curated layout (see REGIONS above); titles are
 * built from the believability grammar with a deterministic collision-
 * avoidance loop so all `n` titles come out distinct.
 */
export function makeScaleCorpus(n: number, seed = 0): ScaleCorpusIsland[] {
  if (n <= 0) return [];

  // Pass 1: domain assignment + per-domain totals (perfectly cyclic, so the
  // count for domain d is floor(n/4) plus 1 if d's order-index < n%4).
  const domainOf: DomainKey[] = new Array(n);
  const domainTotal: Record<DomainKey, number> = { 数理: 0, 物质: 0, 生命: 0, 交叉: 0 };
  for (let i = 0; i < n; i++) {
    const d = DOMAIN_ORDER[i % 4]!;
    domainOf[i] = d;
    domainTotal[d]++;
  }

  const seenTitles = new Set<string>();
  const localCounter: Record<DomainKey, number> = { 数理: 0, 物质: 0, 生命: 0, 交叉: 0 };
  const out: ScaleCorpusIsland[] = [];

  for (let i = 0; i < n; i++) {
    const slug = `syn-${i}`;
    const domain = domainOf[i]!;
    const localIndex = localCounter[domain]++;
    const seedHash = hash32(`${slug}:${seed}`);
    const rng = mulberry32(seedHash);

    // Believability grammar with deterministic collision-avoidance: same
    // (n, seed) always replays the same sequence of `seenTitles` states, so
    // bumping `salt` on a clash stays fully reproducible.
    let pick: TitlePick;
    let salt = 0;
    for (;;) {
      pick = pickTitle(domain, seedHash, salt);
      if (!seenTitles.has(pick.title)) { seenTitles.add(pick.title); break; }
      salt++;
    }

    const { x, y } = placeInRegion(REGIONS[domain], localIndex, domainTotal[domain], rng);
    const clusters = CLUSTERS[domain];
    const clusterIdx = Math.floor(rng() * clusters.length);

    const stage = Math.floor(rng() * 4);
    const outlier = Math.floor(rng() * 23) === 0; // ~4%, matches makeFakeIslands' variance-select rate
    const dormant = Math.floor(rng() * 8) === 0; // ~12%
    const resolved = !dormant && Math.floor(rng() * 16) === 0; // ~6%, resolved wins over dormant
    const eventCount = Math.floor(rng() * 140);
    const members = 1 + Math.floor(rng() * 14);
    const status = resolved ? "resolved" : dormant ? "dormant" : "active";

    out.push({
      slug,
      synthetic: true,
      name: pick.title,
      nameEn: pick.titleEn,
      domain,
      subdomain: pick.subdomain,
      cluster: clusters[clusterIdx]!,
      x,
      y,
      stage,
      status,
      dormant,
      outlier,
      resolved,
      eventCount,
      members,
    });
  }

  return out;
}

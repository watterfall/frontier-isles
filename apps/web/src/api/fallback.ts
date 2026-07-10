/**
 * Static fallback data — copied VERBATIM from the design prototype
 * (design/handoff/问题群岛-原型 v3.dc.html). When the server API is
 * unreachable the whole app runs on exactly these values and the UI is
 * identical (see useAppData). Integration reconciles only src/api/client.ts.
 *
 * Everything here is *user content* (island names, questions, resident
 * names) and per architecture invariant 9 is NEVER auto-translated —
 * it stays in its authored zh form in both language modes.
 */

/** Domain key → island base fill + accent ink (prototype `DOMC`). */
export const DOMAIN_META = {
  数理: { fill: '#C9D8E6', col: '#2E5E8C' },
  物质: { fill: '#E8CFAE', col: '#B5673A' },
  生命: { fill: '#C6DECC', col: '#2B7A5F' },
  交叉: { fill: '#ECDFB4', col: '#A08428' },
} as const;

export type DomainKey = keyof typeof DOMAIN_META;

/** Growth-stage labels, index by `st` (prototype `STAGE`). */
export const STAGE_LABELS = ['空岛', '草棚', '书院', '学派'] as const;

/** Bilingual text (zh + en parallels). */
export type Bilingual = { zh: string; en: string };

export interface IslandDatum {
  id: number;
  /** Island name (bilingual user content). */
  n: Bilingual;
  /** QFocus question (bilingual user content). */
  q: Bilingual;
  /** Domain key. */
  d: DomainKey;
  x: number;
  y: number;
  s: number;
  /** Growth stage 0..3. */
  st: number;
  /** Member count. */
  m: number;
  /** Activity 0..100. */
  a: number;
  dor?: boolean;
  out?: boolean;
  /** `status: resolved` — flies a lighthouse on the L0 fingerprint (depth-plan-v1 §5). */
  res?: boolean;
  sample?: boolean;
  born?: boolean;
  /** Server slug, where known. */
  slug?: string;
  /** One-line summary (bilingual). */
  brief?: Bilingual;
  /** Cluster provenance from xfrontier atlas. */
  cluster?: { code: string; zh: string; en: string };
  /** Citation provenance (real DOI/URL). */
  citation?: { url: string; title: string; venue: string; year: number };
}

/** The chart islands — derived from the curated xfrontier frontiers
 *  (@frontier-isles/data, single source of truth shared with the server seed)
 *  plus the bespoke sample island. When the server is unreachable the chart
 *  renders exactly these entries; useAppData.reconcile overlays live server
 *  values (members/activity/stage/slug) by title. */
import { FRONTIERS } from '@frontier-isles/data';

export const DATA: IslandDatum[] = [
  ...FRONTIERS.map((f) => ({
    id: f.id,
    n: f.title,
    q: f.qfocus,
    d: f.domain as DomainKey,
    x: f.chart.x,
    y: f.chart.y,
    s: f.chart.scale,
    st: f.stage,
    m: f.members,
    a: f.activity,
    dor: f.dormant,
    out: f.outlier,
    res: f.resolved,
    slug: f.slug,
    brief: f.brief,
    cluster: f.cluster,
    citation: f.citation,
  })),
  // The bespoke sample island (full L1 scene + rich ledger) — not in FRONTIERS.
  {
    id: 27,
    n: { zh: 'AI 之问', en: 'The Question of AI' },
    q: { zh: 'AI 能否提出一个人类没想到的好问题？', en: 'Can AI ask a good question no human has thought of?' },
    d: '交叉', x: 802, y: 522, s: 1.0, st: 2, m: 9, a: 76, sample: true, slug: 'machine-curiosity',
    brief: { zh: '机器能否拥有并表达好奇心——对什么感到惊讶、为什么？', en: 'Can a machine hold and express curiosity — what surprises it, and why?' },
  },
];


/** The 7 Question-Wall questions of the sample island (`state.qs`, line ~1092). */
export interface QuestionDatum {
  i: number;
  text: Bilingual;
  orig?: Bilingual;
  rw?: boolean;
  open: boolean;
  votes: number;
}

export const QUESTIONS: QuestionDatum[] = [
  { i: 1, text: { zh: 'AI 的「好问题」由谁来判定？', en: 'Who decides what counts as a “good question” from AI?' }, open: true, votes: 5 },
  { i: 2, text: { zh: '如何设计一个测量「提问新颖度」的基准？', en: 'How do you design a benchmark for “question novelty”?' }, orig: { zh: '现有基准能测出提问能力吗？', en: 'Can existing benchmarks measure question-asking ability?' }, rw: true, open: true, votes: 8 },
  { i: 3, text: { zh: '人类历史上的「好问题」有共同结构吗？', en: 'Do “good questions” in human history share a common structure?' }, open: true, votes: 6 },
  { i: 4, text: { zh: 'LLM 的问题只是训练语料的重组吗？', en: 'Are an LLM’s questions merely recombinations of training data?' }, open: false, votes: 3 },
  { i: 5, text: { zh: '让 AI 向 AI 提问，会发生什么？', en: 'What happens when AI asks AI questions?' }, open: true, votes: 4 },
  { i: 6, text: { zh: '提问能力与压缩能力是否同源？', en: 'Is question-asking ability the same as compression ability?' }, open: true, votes: 7 },
  { i: 7, text: { zh: '儿童的提问策略能否迁移给模型？', en: 'Can children’s questioning strategies transfer to models?' }, open: false, votes: 2 },
];

/** Per-question author composition (`AUTHQ`, line ~1245). */
export const AUTHQ: Bilingual[] = [
  { zh: '人 · 沈括', en: 'Human · Shen Kuo' },
  { zh: '人+AI · 改写', en: 'Human+AI · rewrite' },
  { zh: '人 · 苏樱', en: 'Human · Su Ying' },
  { zh: 'AI · 辩护人', en: 'AI · advocate' },
  { zh: '人 · 顾拾', en: 'Human · Gu Shi' },
  { zh: 'AI · 综合者', en: 'AI · synthesizer' },
  { zh: '人 · 林徽', en: 'Human · Lin Hui' },
];

/** Morning-report drafts (`BRIEF`, line ~1246). `d` is a zh station name
 *  (localization key for localizeStationZh). */
export interface BriefDatum {
  t: Bilingual;
  d: string;
}

export const BRIEF: BriefDatum[] = [
  { t: { zh: '12 篇新文摘要 · 已按论点分堆', en: '12 new-paper summaries · clustered by argument' }, d: '文献阁' },
  { t: { zh: '争论焦点图 · 「新颖度」三定义对照', en: 'Debate focus map · three definitions of “novelty” compared' }, d: '白板厅' },
  { t: { zh: '疑似反例清单 ×5 · 待人工核验', en: 'Suspected counter-examples ×5 · awaiting human review' }, d: '问题墙' },
];

/** Driftwood-garden items (`DRIFT`, line ~1257). */
export interface DriftDatum {
  t: Bilingual;
  a: Bilingual;
}

export const DRIFT: DriftDatum[] = [
  { t: { zh: '陶土原型机 · 半成品', en: 'Clay prototype · half-finished' }, a: { zh: '人 · 顾拾', en: 'Human · Gu Shi' } },
  { t: { zh: '一页问题涂鸦 · 胡思乱想', en: 'A page of question doodles · wild ideas' }, a: { zh: '人 · 苏樱', en: 'Human · Su Ying' } },
  { t: { zh: '被否决的基准草案 v0', en: 'Rejected benchmark draft v0' }, a: { zh: '人+AI', en: 'Human+AI' } },
  { t: { zh: '斥候拾遗 · 未归档摘录', en: 'Scout gleanings · unfiled notes' }, a: { zh: 'AI · 斥候', en: 'AI · scout' } },
];

/** Founding-ceremony candidate questions (`RITQ`, line ~1180). */
export const RITQ: Bilingual[] = [
  { zh: '机器会为一个问题失眠吗？', en: 'Would a machine lose sleep over a question?' },
  { zh: '好奇心可以被写成损失函数吗？', en: 'Can curiosity be written as a loss function?' },
  { zh: '如果 AI 从不厌倦，它还会惊讶吗？', en: 'If AI never tires, can it still be surprised?' },
  { zh: '「无聊」是不是好奇心的必要条件？', en: 'Is “boredom” a necessary condition for curiosity?' },
  { zh: '让模型自己选题，它会选什么？', en: 'Let the model choose its own topic — what would it pick?' },
];

/** The rewrite target for candidate index 1 (`RIT_RW`, line ~1181). */
export const RIT_RW: Bilingual = { zh: '好奇心如何被写成一个可优化、又不被训坏的目标？', en: 'How can curiosity be written as an optimizable objective that resists Goodharting?' };

/** Candidate island names offered in ceremony chapter 5 (`ritNames`). */
export const RIT_NAMES = ['机器好奇心', 'AI 之镜', '未名之岛'] as const;

/** L1 sample-island Question-Wall stations (`STN`, line ~1222). The x/y are
 *  the absolute scene coordinates of each station's selection highlight. */
export interface StationRow {
  k: 'questions' | 'data' | 'canvas' | 'library' | 'workshop' | 'gallery' | 'tearoom' | 'driftwood';
  name: string;
  glyph: string;
  sealBg: string;
  count: Bilingual;
  x: number;
  y: number;
  auth: Bilingual;
}

export const STN: StationRow[] = [
  { k: 'questions', name: '问题墙', glyph: '问', sealBg: '#B5673A', count: { zh: '7 问', en: '7 Qs' }, x: 1012, y: 422, auth: { zh: '人+AI', en: 'Human+AI' } },
  { k: 'data', name: '数据台', glyph: '数', sealBg: '#2E5E8C', count: { zh: '3', en: '3' }, x: 959, y: 550, auth: { zh: '人', en: 'Human' } },
  { k: 'canvas', name: '白板厅', glyph: '板', sealBg: '#3E9B7E', count: { zh: '2', en: '2' }, x: 572, y: 410, auth: { zh: '人+AI', en: 'Human+AI' } },
  { k: 'library', name: '文献阁', glyph: '文', sealBg: '#2E5E8C', count: { zh: '12', en: '12' }, x: 760, y: 344, auth: { zh: 'AI 值夜', en: 'AI night watch' } },
  { k: 'workshop', name: '实验坊', glyph: '坊', sealBg: '#B5673A', count: { zh: '2', en: '2' }, x: 470, y: 538, auth: { zh: '人', en: 'Human' } },
  { k: 'gallery', name: '展厅', glyph: '展', sealBg: '#4A4238', count: { zh: '1', en: '1' }, x: 668, y: 594, auth: { zh: '人+AI', en: 'Human+AI' } },
  { k: 'tearoom', name: '茶寮', glyph: '茶', sealBg: '#3E9B7E', count: { zh: '·', en: '·' }, x: 880, y: 619, auth: { zh: '人', en: 'Human' } },
  { k: 'driftwood', name: '散木园', glyph: '木', sealBg: '#6B6154', count: { zh: '4', en: '4' }, x: 790, y: 660, auth: { zh: '人+AI', en: 'Human+AI' } },
];

/** Sample island identity (server slug + title, GET /api/islands/machine-curiosity). */
export const SAMPLE_SLUG = 'machine-curiosity';
export const SAMPLE_TITLE: Bilingual = { zh: 'AI 之问', en: 'The Question of AI' };
export const SAMPLE_QFOCUS: Bilingual = { zh: 'AI 能否提出一个人类没想到的好问题？', en: 'Can AI ask a good question no human has thought of?' };

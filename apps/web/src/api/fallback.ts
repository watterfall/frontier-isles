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
  text: string;
  orig?: string;
  rw?: boolean;
  open: boolean;
  votes: number;
}

export const QUESTIONS: QuestionDatum[] = [
  { i: 1, text: 'AI 的「好问题」由谁来判定？', open: true, votes: 5 },
  { i: 2, text: '如何设计一个测量「提问新颖度」的基准？', orig: '现有基准能测出提问能力吗？', rw: true, open: true, votes: 8 },
  { i: 3, text: '人类历史上的「好问题」有共同结构吗？', open: true, votes: 6 },
  { i: 4, text: 'LLM 的问题只是训练语料的重组吗？', open: false, votes: 3 },
  { i: 5, text: '让 AI 向 AI 提问，会发生什么？', open: true, votes: 4 },
  { i: 6, text: '提问能力与压缩能力是否同源？', open: true, votes: 7 },
  { i: 7, text: '儿童的提问策略能否迁移给模型？', open: false, votes: 2 },
];

/** Per-question author composition (`AUTHQ`, line ~1245). */
export const AUTHQ: string[] = [
  '人 · 沈括',
  '人+AI · 改写',
  '人 · 苏樱',
  'AI · 辩护人',
  '人 · 顾拾',
  'AI · 综合者',
  '人 · 林徽',
];

/** Morning-report drafts (`BRIEF`, line ~1246). */
export interface BriefDatum {
  t: string;
  d: string;
}

export const BRIEF: BriefDatum[] = [
  { t: '12 篇新文摘要 · 已按论点分堆', d: '文献阁' },
  { t: '争论焦点图 · 「新颖度」三定义对照', d: '白板厅' },
  { t: '疑似反例清单 ×5 · 待人工核验', d: '问题墙' },
];

/** Driftwood-garden items (`DRIFT`, line ~1257). */
export interface DriftDatum {
  t: string;
  a: string;
}

export const DRIFT: DriftDatum[] = [
  { t: '陶土原型机 · 半成品', a: '人 · 顾拾' },
  { t: '一页问题涂鸦 · 胡思乱想', a: '人 · 苏樱' },
  { t: '被否决的基准草案 v0', a: '人+AI' },
  { t: '斥候拾遗 · 未归档摘录', a: 'AI · 斥候' },
];

/** Founding-ceremony candidate questions (`RITQ`, line ~1180). */
export const RITQ: string[] = [
  '机器会为一个问题失眠吗？',
  '好奇心可以被写成损失函数吗？',
  '如果 AI 从不厌倦，它还会惊讶吗？',
  '「无聊」是不是好奇心的必要条件？',
  '让模型自己选题，它会选什么？',
];

/** The rewrite target for candidate index 1 (`RIT_RW`, line ~1181). */
export const RIT_RW = '好奇心如何被写成一个可优化、又不被训坏的目标？';

/** Candidate island names offered in ceremony chapter 5 (`ritNames`). */
export const RIT_NAMES = ['机器好奇心', 'AI 之镜', '未名之岛'] as const;

/** L1 sample-island Question-Wall stations (`STN`, line ~1222). The x/y are
 *  the absolute scene coordinates of each station's selection highlight. */
export interface StationRow {
  k: 'questions' | 'data' | 'canvas' | 'library' | 'workshop' | 'gallery' | 'tearoom' | 'driftwood';
  name: string;
  glyph: string;
  sealBg: string;
  count: string;
  x: number;
  y: number;
  auth: string;
}

export const STN: StationRow[] = [
  { k: 'questions', name: '问题墙', glyph: '问', sealBg: '#B5673A', count: '7 问', x: 1012, y: 422, auth: '人+AI' },
  { k: 'data', name: '数据台', glyph: '数', sealBg: '#2E5E8C', count: '3', x: 959, y: 550, auth: '人' },
  { k: 'canvas', name: '白板厅', glyph: '板', sealBg: '#3E9B7E', count: '2', x: 572, y: 410, auth: '人+AI' },
  { k: 'library', name: '文献阁', glyph: '文', sealBg: '#2E5E8C', count: '12', x: 760, y: 344, auth: 'AI 值夜' },
  { k: 'workshop', name: '实验坊', glyph: '坊', sealBg: '#B5673A', count: '2', x: 470, y: 538, auth: '人' },
  { k: 'gallery', name: '展厅', glyph: '展', sealBg: '#4A4238', count: '1', x: 668, y: 594, auth: '人+AI' },
  { k: 'tearoom', name: '茶寮', glyph: '茶', sealBg: '#3E9B7E', count: '·', x: 880, y: 619, auth: '人' },
  { k: 'driftwood', name: '散木园', glyph: '木', sealBg: '#6B6154', count: '4', x: 790, y: 660, auth: '人+AI' },
];

/** Sample island identity (server slug + title, GET /api/islands/machine-curiosity). */
export const SAMPLE_SLUG = 'machine-curiosity';
export const SAMPLE_TITLE: Bilingual = { zh: 'AI 之问', en: 'The Question of AI' };
export const SAMPLE_QFOCUS: Bilingual = { zh: 'AI 能否提出一个人类没想到的好问题？', en: 'Can AI ask a good question no human has thought of?' };

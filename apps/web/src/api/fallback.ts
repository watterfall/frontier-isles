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

export interface IslandDatum {
  id: number;
  /** Island name (user content). */
  n: string;
  /** QFocus question (user content). */
  q: string;
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
}

/** The prototype's 20 seeded isles (`const DATA`, line ~1158). */
export const DATA: IslandDatum[] = [
  { id: 1, n: '素数间隔', q: '素数间隔中是否藏着未被察觉的秩序？', d: '数理', x: 205, y: 305, s: 0.9, st: 2, m: 6, a: 62 },
  { id: 2, n: 'NP 之器', q: 'NP 难题存在物理系统的原生解法吗？', d: '数理', x: 330, y: 248, s: 0.78, st: 1, m: 3, a: 34 },
  { id: 3, n: '随机性度量', q: '随机性可以被严格地度量与比较吗？', d: '数理', x: 298, y: 388, s: 0.95, st: 2, m: 8, a: 71 },
  { id: 4, n: '折纸数学', q: '折纸公理能否生成全部可展结构？', d: '数理', x: 438, y: 318, s: 0.85, st: 1, m: 4, a: 45 },
  { id: 5, n: '无限层级', q: '无限之间的层级有自然的尽头吗？', d: '数理', x: 172, y: 432, s: 0.68, st: 0, m: 1, a: 8 },
  { id: 6, n: '高温超导', q: '室温超导的机制边界究竟在哪里？', d: '物质', x: 1082, y: 262, s: 1.12, st: 3, m: 14, a: 88 },
  { id: 7, n: '玻璃之问', q: '玻璃到底是不是一种固体？', d: '物质', x: 1216, y: 326, s: 0.85, st: 1, m: 5, a: 4, dor: true },
  { id: 8, n: '驯服湍流', q: '湍流能否被预测、甚至被驯服？', d: '物质', x: 1002, y: 362, s: 0.95, st: 2, m: 9, a: 66 },
  { id: 9, n: '电池天花板', q: '化学电池能量密度的物理天花板在哪？', d: '物质', x: 1152, y: 436, s: 0.8, st: 1, m: 6, a: 52 },
  { id: 10, n: '逆向催化', q: '能否从目标反应逆向设计催化剂？', d: '物质', x: 1292, y: 244, s: 0.72, st: 1, m: 4, a: 39 },
  { id: 11, n: '折叠小样本', q: '蛋白质折叠能否用小样本数据预测？', d: '生命', x: 622, y: 300, s: 1.05, st: 3, m: 16, a: 82 },
  { id: 12, n: '睡眠之谜', q: '睡眠为什么不可被任何过程替代？', d: '生命', x: 742, y: 250, s: 0.8, st: 1, m: 5, a: 41 },
  { id: 13, n: '衰老程序论', q: '衰老是既定程序还是累积损耗？', d: '生命', x: 688, y: 398, s: 0.9, st: 2, m: 7, a: 58 },
  { id: 14, n: '菌群与决策', q: '肠道菌群在多大程度上影响决策？', d: '生命', x: 556, y: 428, s: 0.8, st: 1, m: 4, a: 36 },
  { id: 15, n: '记忆的载体', q: '记忆的物理载体究竟是什么？', d: '生命', x: 836, y: 338, s: 0.9, st: 2, m: 8, a: 64 },
  { id: 16, n: '集体行为', q: '集体行为存在最小充分模型吗？', d: '交叉', x: 642, y: 562, s: 0.9, st: 2, m: 7, a: 60 },
  { id: 17, n: '语言演化', q: '语言演化的速率存在上限吗？', d: '交叉', x: 502, y: 584, s: 0.7, st: 0, m: 2, a: 12 },
  { id: 18, n: 'AI 之问', q: 'AI 能否提出一个人类没想到的好问题？', d: '交叉', x: 802, y: 522, s: 1.0, st: 2, m: 9, a: 76, sample: true, slug: 'machine-curiosity' },
  { id: 19, n: 'AI 评审', q: 'AI 能否公平地评审一篇论文？', d: '交叉', x: 924, y: 602, s: 0.75, st: 1, m: 4, a: 44 },
  { id: 20, n: '梦的回收', q: '做梦是大脑的垃圾回收进程吗？', d: '交叉', x: 1232, y: 648, s: 0.85, st: 1, m: 3, a: 57, out: true },
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
export const SAMPLE_TITLE = 'AI 之问';
export const SAMPLE_QFOCUS = 'AI 能否提出一个人类没想到的好问题？';

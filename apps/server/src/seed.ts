import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  parseProblemObject,
  serializeProblemObject,
  ProblemObjectSchema,
  hashEvent,
  type Actor,
  type LedgerEvent,
  type ProblemObject,
  type ProblemObjectInput,
  type Status,
} from "@frontier-isles/opp";
import type { StationKind } from "@frontier-isles/core";
import { Store, opIdFor, type ProblemMeta } from "./store.js";
import { openDb } from "./db.js";

/**
 * Idempotent seed reproducing the prototype (`design/handoff/问题群岛-原型 v3`):
 *   1. the sample island 「AI 之问」 from the opp fixture machine-curiosity.md,
 *      with a full ledger — genesis ceremony, the 7 question-wall questions,
 *      ghost events (night 12/41/63), 4 driftwood atoms, 3 morning-report
 *      drafts, 5 human + 4 AI-resident memberships, no capability grants.
 *   2. the other 19 chart islands as minimal problem objects (DATA array).
 *   3. station rows for every island.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
// packages/opp/test/fixtures/machine-curiosity.md relative to apps/server/src.
const FIXTURE = resolve(__dirname, "../../../packages/opp/test/fixtures/machine-curiosity.md");

// The seeded story spans "86 nights" ending today, so night N maps to
// now − (86 − N) days. Growth dormancy (30-day window) then reads truthfully:
// recently-active islands are awake, and only islands whose last event is
// pinned to the story's early nights project as dormant.
const day = (n: number) => new Date(Date.now() - (86 - n) * 86_400_000).toISOString();

// Prototype DATA array (id, name, qfocus, domain, chart x/y/scale, stage, members, activity).
interface Chart {
  id: number;
  slug: string;
  n: string;
  q: string;
  d: string;
  x: number;
  y: number;
  s: number;
  st: number;
  m: number;
  a: number;
  dor?: boolean;
  out?: boolean;
}

const DATA: Chart[] = [
  { id: 1, slug: "prime-gaps", n: "素数间隔", q: "素数间隔中是否藏着未被察觉的秩序？", d: "数理", x: 205, y: 305, s: 0.9, st: 2, m: 6, a: 62 },
  { id: 2, slug: "np-machine", n: "NP 之器", q: "NP 难题存在物理系统的原生解法吗？", d: "数理", x: 330, y: 248, s: 0.78, st: 1, m: 3, a: 34 },
  { id: 3, slug: "randomness-measure", n: "随机性度量", q: "随机性可以被严格地度量与比较吗？", d: "数理", x: 298, y: 388, s: 0.95, st: 2, m: 8, a: 71 },
  { id: 4, slug: "origami-math", n: "折纸数学", q: "折纸公理能否生成全部可展结构？", d: "数理", x: 438, y: 318, s: 0.85, st: 1, m: 4, a: 45 },
  { id: 5, slug: "infinity-hierarchy", n: "无限层级", q: "无限之间的层级有自然的尽头吗？", d: "数理", x: 172, y: 432, s: 0.68, st: 0, m: 1, a: 8 },
  { id: 6, slug: "room-superconductor", n: "高温超导", q: "室温超导的机制边界究竟在哪里？", d: "物质", x: 1082, y: 262, s: 1.12, st: 3, m: 14, a: 88 },
  { id: 7, slug: "glass-question", n: "玻璃之问", q: "玻璃到底是不是一种固体？", d: "物质", x: 1216, y: 326, s: 0.85, st: 1, m: 5, a: 4, dor: true },
  { id: 8, slug: "taming-turbulence", n: "驯服湍流", q: "湍流能否被预测、甚至被驯服？", d: "物质", x: 1002, y: 362, s: 0.95, st: 2, m: 9, a: 66 },
  { id: 9, slug: "battery-ceiling", n: "电池天花板", q: "化学电池能量密度的物理天花板在哪？", d: "物质", x: 1152, y: 436, s: 0.8, st: 1, m: 6, a: 52 },
  { id: 10, slug: "inverse-catalysis", n: "逆向催化", q: "能否从目标反应逆向设计催化剂？", d: "物质", x: 1292, y: 244, s: 0.72, st: 1, m: 4, a: 39 },
  { id: 11, slug: "folding-fewshot", n: "折叠小样本", q: "蛋白质折叠能否用小样本数据预测？", d: "生命", x: 622, y: 300, s: 1.05, st: 3, m: 16, a: 82 },
  { id: 12, slug: "sleep-enigma", n: "睡眠之谜", q: "睡眠为什么不可被任何过程替代？", d: "生命", x: 742, y: 250, s: 0.8, st: 1, m: 5, a: 41 },
  { id: 13, slug: "aging-program", n: "衰老程序论", q: "衰老是既定程序还是累积损耗？", d: "生命", x: 688, y: 398, s: 0.9, st: 2, m: 7, a: 58 },
  { id: 14, slug: "microbiome-decision", n: "菌群与决策", q: "肠道菌群在多大程度上影响决策？", d: "生命", x: 556, y: 428, s: 0.8, st: 1, m: 4, a: 36 },
  { id: 15, slug: "memory-substrate", n: "记忆的载体", q: "记忆的物理载体究竟是什么？", d: "生命", x: 836, y: 338, s: 0.9, st: 2, m: 8, a: 64 },
  { id: 16, slug: "collective-behavior", n: "集体行为", q: "集体行为存在最小充分模型吗？", d: "交叉", x: 642, y: 562, s: 0.9, st: 2, m: 7, a: 60 },
  { id: 17, slug: "language-evolution", n: "语言演化", q: "语言演化的速率存在上限吗？", d: "交叉", x: 502, y: 584, s: 0.7, st: 0, m: 2, a: 12 },
  { id: 18, slug: "machine-curiosity", n: "AI 之问", q: "AI 能否提出一个人类没想到的好问题？", d: "交叉", x: 802, y: 522, s: 1.0, st: 2, m: 9, a: 76 },
  { id: 19, slug: "ai-review", n: "AI 评审", q: "AI 能否公平地评审一篇论文？", d: "交叉", x: 924, y: 602, s: 0.75, st: 1, m: 4, a: 44 },
  { id: 20, slug: "dream-gc", n: "梦的回收", q: "做梦是大脑的垃圾回收进程吗？", d: "交叉", x: 1232, y: 648, s: 0.85, st: 1, m: 3, a: 57, out: true },
];

const SAMPLE = DATA.find((d) => d.slug === "machine-curiosity")!;

// Question wall of the sample island (prototype qs + AUTHQ authors).
const QUESTIONS: Array<{ text: string; open: boolean; rewrittenFrom?: string; actor: Actor; credit: string[] }> = [
  { text: "AI 的「好问题」由谁来判定？", open: true, actor: { id: "github:shen-kuo", kind: "human" }, credit: ["conceptualization"] },
  { text: "如何设计一个测量「提问新颖度」的基准？", open: true, rewrittenFrom: "现有基准能测出提问能力吗？", actor: { id: "github:shen-kuo", kind: "pair" }, credit: ["conceptualization", "credit:ai/rewrite"] },
  { text: "人类历史上的「好问题」有共同结构吗？", open: true, actor: { id: "github:su-ying", kind: "human" }, credit: ["conceptualization"] },
  { text: "LLM 的问题只是训练语料的重组吗？", open: false, actor: { id: "github:devils-advocate", kind: "agent" }, credit: ["credit:ai/critique"] },
  { text: "让 AI 向 AI 提问，会发生什么？", open: true, actor: { id: "github:gu-shi", kind: "human" }, credit: ["conceptualization"] },
  { text: "提问能力与压缩能力是否同源？", open: true, actor: { id: "github:synthesizer", kind: "agent" }, credit: ["credit:ai/synthesis"] },
  { text: "儿童的提问策略能否迁移给模型？", open: false, actor: { id: "github:lin-hui", kind: "human" }, credit: ["conceptualization"] },
];

const VOTES = [5, 8, 6, 3, 4, 7, 2];

const HUMANS: Array<{ id: string; role: string }> = [
  { id: "github:shen-kuo", role: "master" },
  { id: "github:lin-hui", role: "resident" },
  { id: "github:su-ying", role: "researcher" },
  { id: "github:gu-shi", role: "researcher" },
  { id: "github:a-ruo", role: "apprentice" },
];

const AI_RESIDENTS: Array<{ id: string; aiKind: string }> = [
  { id: "github:curiosity-scout", aiKind: "literature-scout" },
  { id: "github:devils-advocate", aiKind: "devils-advocate" },
  { id: "github:synthesizer", aiKind: "synthesizer" },
  { id: "github:ferryman", aiKind: "ferryman" },
];

const DRIFTWOOD: Array<{ text: string; atom: string; actor: Actor; credit: string[] }> = [
  { text: "陶土原型机 · 半成品", atom: "sketch", actor: { id: "github:gu-shi", kind: "human" }, credit: ["investigation"] },
  { text: "一页问题涂鸦 · 胡思乱想", atom: "sketch", actor: { id: "github:su-ying", kind: "human" }, credit: ["ideation"] },
  { text: "被否决的基准草案 v0", atom: "thought", actor: { id: "github:shen-kuo", kind: "pair" }, credit: ["ideation", "credit:ai/drafting"] },
  { text: "斥候拾遗 · 未归档摘录", atom: "thought", actor: { id: "github:curiosity-scout", kind: "agent" }, credit: ["credit:ai/literature"] },
];

const MORNING: Array<{ title: string; dest: StationKind; actor: Actor; credit: string[] }> = [
  { title: "12 篇新文摘要 · 已按论点分堆", dest: "library", actor: { id: "github:curiosity-scout", kind: "agent" }, credit: ["credit:ai/literature_synthesis"] },
  { title: "争论焦点图 · 「新颖度」三定义对照", dest: "canvas", actor: { id: "github:synthesizer", kind: "agent" }, credit: ["credit:ai/synthesis"] },
  { title: "疑似反例清单 ×5 · 待人工核验", dest: "questions", actor: { id: "github:devils-advocate", kind: "agent" }, credit: ["credit:ai/critique"] },
];

function statusOf(c: Chart): Status {
  return c.st > 0 ? "active" : "open";
}

function seedSampleIsland(store: Store): void {
  const md = readFileSync(FIXTURE, "utf8");
  const { object } = parseProblemObject(md);
  const opId = object.id;
  const meta: ProblemMeta = {
    domain: SAMPLE.d,
    name: SAMPLE.n,
    chart: { x: SAMPLE.x, y: SAMPLE.y, scale: SAMPLE.s, activity: SAMPLE.a, members: SAMPLE.m },
  };
  store.insertProblem(object, md, meta);
  store.createStations(opId);

  for (const h of HUMANS) store.addMembership(opId, { actorId: h.id, kind: "human", role: h.role, aiKind: null });
  for (const r of AI_RESIDENTS) store.addMembership(opId, { actorId: r.id, kind: "agent", role: null, aiKind: r.aiKind });

  // Genesis ceremony — the head of the ledger.
  const ceremonyRef = store.putRef("ceremony", {
    name: SAMPLE.n,
    qfocus: object.qfocus,
    ceremonyLog: [
      "卷轴展开 · 仪式待燃",
      "点燃仪式 · 素材入卷 · 计时 8:00",
      "收卷 · 7 问入册",
      "记形毕 · 入聚焦",
      "聚焦 · 最高票立为 QFocus",
      "定名上墙 · 岛自海面升起",
    ],
    votes: VOTES,
  });
  store.appendRaw(opId, {
    ts: day(0),
    op: opId as ProblemObject["id"],
    actor: { id: "github:shen-kuo", kind: "human" },
    credit: ["conceptualization"],
    phase: "A",
    action: "found_island",
    ref: ceremonyRef,
  });

  // The 7 question-wall questions.
  QUESTIONS.forEach((q, i) => {
    const qRef = store.putRef("question", {
      text: q.text,
      open: q.open,
      rewrittenFrom: q.rewrittenFrom ?? null,
      votes: VOTES[i] ?? 0,
    });
    const ev = store.appendRaw(opId, {
      ts: day(1 + i),
      op: opId as ProblemObject["id"],
      actor: q.actor,
      credit: q.credit,
      phase: "A",
      action: "propose_subquestion",
      ref: qRef,
    });
    store.addPlacement(opId, "questions", qRef, { action: "propose_subquestion", open: q.open, hash: hashEvent(ev) });
  });

  // 4 driftwood atoms.
  DRIFTWOOD.forEach((d, i) => {
    const ref = store.putRef("driftwood", { atom: d.atom, text: d.text });
    store.appendRaw(opId, {
      ts: day(9 + i),
      op: opId as ProblemObject["id"],
      actor: d.actor,
      credit: d.credit,
      phase: "A",
      action: "night_digest",
      ref,
    });
    store.addPlacement(opId, "driftwood", ref, { action: "night_digest", atom: d.atom, actorId: d.actor.id });
  });

  // Ghosts (night 12 / 41 / 63).
  const g1 = store.putRef("driftwood", { atom: "question", text: "被撤下的问题卡 · 曾为散木" });
  store.appendRaw(opId, {
    ts: day(12),
    op: opId as ProblemObject["id"],
    actor: { id: "github:gu-shi", kind: "human" },
    credit: ["curation"],
    phase: "A",
    action: "return_to_driftwood",
    ref: g1,
  });
  store.addPlacement(opId, "driftwood", g1, { action: "return_to_driftwood", ghost: "night-12" });

  const g2 = store.putRef("claim", { atom: "contradiction", text: "实验坊原型宣告失败 · 疑似反例成立" });
  store.appendRaw(opId, {
    ts: day(41),
    op: opId as ProblemObject["id"],
    actor: { id: "github:lin-hui", kind: "human" },
    credit: ["validation"],
    phase: "D",
    action: "refute",
    ref: g2,
  });
  store.addPlacement(opId, "workshop", g2, { action: "refute", ghost: "night-41" });

  const g3 = store.putRef("driftwood", { atom: "sketch", text: "白板厅一张画布被废弃 · 曾为散木" });
  store.appendRaw(opId, {
    ts: day(63),
    op: opId as ProblemObject["id"],
    actor: { id: "github:su-ying", kind: "human" },
    credit: ["curation"],
    phase: "A",
    action: "return_to_driftwood",
    ref: g3,
  });
  store.addPlacement(opId, "driftwood", g3, { action: "return_to_driftwood", ghost: "night-63" });

  // 3 morning-report drafts (dock-issued; unresolved → HITL pending).
  MORNING.forEach((b, i) => {
    const ref = store.putRef("morning_report", {
      title: b.title,
      dest: b.dest,
      station: b.dest,
      credit: b.credit,
    });
    store.appendRaw(opId, {
      ts: day(70 + i),
      op: opId as ProblemObject["id"],
      actor: b.actor,
      credit: b.credit,
      phase: "A",
      action: "night_digest",
      ref,
    });
    store.addPlacement(opId, "dock", ref, { kind: "morning_report", dest: b.dest, resolved: false });
  });
}

function seedMinimalIsland(store: Store, c: Chart): void {
  const opId = opIdFor(c.slug);
  const raw: ProblemObjectInput = {
    schema: "opp/0.2",
    id: opId,
    title: c.n,
    status: statusOf(c),
    qfocus: c.q,
    frontier: { substrate: c.a / 100 },
  };
  const object = ProblemObjectSchema.parse(raw);
  const body = { raw: `## Open sub-questions\n\n- ${c.q}\n` };
  const parsedBody = parseProblemObject(serializeProblemObject(object, body)).body;
  const md = serializeProblemObject(object, parsedBody);
  const meta: ProblemMeta = {
    domain: c.d,
    name: c.n,
    chart: { x: c.x, y: c.y, scale: c.s, activity: c.a, members: c.m },
  };
  store.insertProblem(object, md, meta);
  store.createStations(opId);

  const founder: Actor = { id: `github:founder-${c.slug}`, kind: "human" };
  store.addMembership(opId, { actorId: founder.id, kind: "human", role: "master", aiKind: null });
  // Dormant islands (prototype `dor`) live entirely in the story's early
  // nights so the 30-day window projects them as moss-and-mist; active
  // islands get recent events. Growth stages are built from *real* ledger
  // events per §4 (empty → hut: first artifact; academy: ≥3 stations;
  // school: publication) — never set directly.
  const base = c.dor ? 0 : 80;
  const at = (offset: number) => day(Math.min(base + offset, 86));
  const ev = (offset: number, action: LedgerEvent["action"], phase: "A" | "B" | "D", ref: string) =>
    store.appendRaw(opId, {
      ts: at(offset),
      op: opId as ProblemObject["id"],
      actor: founder,
      credit: ["conceptualization"],
      phase,
      action,
      ref,
    });
  ev(0, "found_island", "A", store.putRef("ceremony", { name: c.n, qfocus: c.q }));
  if (c.st >= 1) {
    const qref = store.putRef("question", { text: c.q, open: true, votes: 1 });
    ev(1, "propose_subquestion", "A", qref);
    store.addPlacement(opId, "questions", qref, { action: "propose_subquestion", open: true });
  }
  if (c.st >= 2) {
    // Academy: activity across ≥3 distinct stations (questions + workshop + driftwood).
    ev(2, "submit_claim", "B", store.putRef("claim", { text: `${c.n} · 首个可检验论断` }));
    ev(3, "night_digest", "A", store.putRef("driftwood", { atom: "thought", text: `${c.n} · 夜间散木` }));
  }
  if (c.st >= 3) {
    // School: a gallery publication.
    ev(4, "publish", "D", store.putRef("note", { title: `${c.n} · 开放实验记录本 v1` }));
  }
}

/** Idempotent: seeds only when the DB has no islands. Returns the count seeded. */
export function seed(store: Store): number {
  if (store.hasIslands()) return 0;
  const tx = store.db.transaction(() => {
    seedSampleIsland(store);
    for (const c of DATA) {
      if (c.slug === "machine-curiosity") continue;
      seedMinimalIsland(store, c);
    }
  });
  tx();
  return DATA.length;
}

// CLI: `pnpm --filter @frontier-isles/server seed`
const invokedDirectly = process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js");
if (invokedDirectly) {
  const db = openDb(process.env.DB_FILE ?? "data/isles.db");
  const store = new Store(db);
  const n = seed(store);
  console.log(n > 0 ? `[seed] seeded ${n} islands` : "[seed] already seeded — nothing to do");
  db.close();
}

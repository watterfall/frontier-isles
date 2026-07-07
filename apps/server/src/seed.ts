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
import { FRONTIERS, type FrontierEntry } from "@frontier-isles/data";
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

/** Map the curated xfrontier frontiers into the seed's chart shape. */
const DATA: Chart[] = FRONTIERS.map((f: FrontierEntry) => ({
  id: f.id,
  slug: f.slug,
  n: f.title.zh,
  q: f.qfocus.zh,
  d: f.domain,
  x: f.chart.x,
  y: f.chart.y,
  s: f.chart.scale,
  st: f.stage,
  m: f.members,
  a: f.activity,
  dor: f.dormant,
  out: f.outlier,
}));

/** Atlas metadata per slug (scores/cluster/citation → place-plane meta json). */
const ATLAS: Record<string, FrontierEntry> = Object.fromEntries(
  FRONTIERS.map((f) => [f.slug, f]),
);

/** The bespoke sample island (machine-curiosity) keeps its own chart meta — it
 *  is not in the curated FRONTIERS set (it carries a full bespoke L1 scene). */
const SAMPLE_META = {
  d: "交叉",
  n: "AI 之问",
  x: 802,
  y: 522,
  s: 1.0,
  a: 76,
  m: 9,
};

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
    domain: SAMPLE_META.d,
    name: SAMPLE_META.n,
    chart: { x: SAMPLE_META.x, y: SAMPLE_META.y, scale: SAMPLE_META.s, activity: SAMPLE_META.a, members: SAMPLE_META.m },
  };
  store.insertProblem(object, md, meta);
  store.createStations(opId);

  for (const h of HUMANS) store.addMembership(opId, { actorId: h.id, kind: "human", role: h.role, aiKind: null });
  for (const r of AI_RESIDENTS) store.addMembership(opId, { actorId: r.id, kind: "agent", role: null, aiKind: r.aiKind });

  // Genesis ceremony — the head of the ledger.
  const ceremonyRef = store.putRef("ceremony", {
    name: SAMPLE_META.n,
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
  const atlas = ATLAS[c.slug];
  const scores = atlas?.scores ?? [3, 3, 3, 3, 3, 3, 3, 3, 3];
  const raw: ProblemObjectInput = {
    schema: "opp/0.2",
    id: opId,
    title: c.n,
    status: statusOf(c),
    qfocus: c.q,
    // OPP frontier stays lean: heat = paradigm (s[0]/5), substrate = substrate-reality (s[6]/5).
    // The full 9-dim scores live in place-plane meta.atlas (two-plane principle).
    frontier: { heat: (scores[0] ?? 3) / 5, substrate: (scores[6] ?? 3) / 5, mode: "variance-select" },
  };
  const object = ProblemObjectSchema.parse(raw);
  const body = { raw: `## Open sub-questions\n\n- ${c.q}\n` };
  const parsedBody = parseProblemObject(serializeProblemObject(object, body)).body;
  const md = serializeProblemObject(object, parsedBody);
  const meta: ProblemMeta = {
    domain: c.d,
    name: c.n,
    chart: { x: c.x, y: c.y, scale: c.s, activity: c.a, members: c.m },
    atlas: atlas
      ? {
          atlasN: atlas.atlasN,
          scores: atlas.scores,
          cluster: atlas.cluster,
          citation: atlas.citation,
          brief: atlas.brief,
          outlier: atlas.outlier,
        }
      : undefined,
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
  return DATA.length + 1;
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

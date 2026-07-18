/**
 * The night-shift orchestration — the IO shell around the pure pipeline.
 *
 * Steps (each source noted):
 *   a. READ    GET /api/islands/:slug/problem.md  → opp.parseProblemObject → QFocus/title
 *   b. SEARCH  CrossRef /works (last-year window, polite pool)
 *   c. RANK    score by CrossRef relevance + keyword overlap; dedup against
 *              GET /api/islands/:slug/ledger.jsonl (DOIs already in the ledger)
 *   d. PROPOSE top-K → MCP create_driftwood (gateway), credit:ai/literature
 *   e. COLLECT one MCP night_digest summarizing the shift
 *
 * All effectful collaborators are injected so this whole flow is unit-testable
 * with fixtures and a fake writer (see test/night.test.ts).
 */

import { parseProblemObject } from "@frontier-isles/opp";
import { frontierAtlasBySlug } from "@frontier-isles/data/atlas";
import {
  extractKeywords,
  extractSeenDois,
  oneYearAgo,
  rankAndDedup,
  summarizeCandidate,
  summarizeShift,
  type Candidate,
  type CrossRefWork,
  type Proposal,
} from "./pipeline.js";
import type { ScoutWriter } from "./mcpClient.js";

/** The scout's credit role — architecture §4 AI governance. */
export const CREDIT = ["credit:ai/literature"];

export interface NightOptions {
  island: string;
  serverBase: string;
  rows: number;
  topK: number;
  mailto?: string;
  dryRun: boolean;
  /** Scout identity whose past proposals are resolved for DOI dedup. */
  agent?: string;
}

export interface NightDeps {
  /** Fetch text from a URL (problem.md / ledger.jsonl). */
  fetchText: (url: string) => Promise<string>;
  /** Fetch CrossRef works for a keyword set. */
  fetchWorks: (keywords: string[], rows: number, fromPubDate: string, mailto?: string) => Promise<CrossRefWork[]>;
  /** Build the gateway writer (skipped on dry-run). */
  makeWriter?: () => Promise<ScoutWriter>;
  now: Date;
  log: (msg: string) => void;
}

export interface NightResult {
  island: string;
  qfocus: string;
  keywords: string[];
  fromPubDate: string;
  fetched: number;
  seenDois: number;
  candidates: Candidate[];
  proposals: Proposal[];
  /** Tool-result strings from create_driftwood calls (empty on dry-run). */
  written: string[];
  /** night_digest result ("" if dry-run or tool absent). */
  digest: string;
}

export async function runNightShift(opts: NightOptions, deps: NightDeps): Promise<NightResult> {
  const base = opts.serverBase.replace(/\/$/, "");

  // a. READ the problem object (leavability endpoint) and parse via opp.
  const md = await deps.fetchText(`${base}/api/islands/${opts.island}/problem.md`);
  const { object, body } = parseProblemObject(md);
  const qfocus = object.qfocus;
  // Seeded problem objects carry only the zh half of the curated bilingual
  // qfocus (seed.ts takes `f.qfocus.zh`), and CrossRef recall on CJK-only
  // terms is poor (B.1 caveat). For atlas frontier islands, merge the curated
  // English title/qfocus into keyword extraction; non-atlas islands (e.g. the
  // hero sample island) are unchanged.
  const atlasEntry = frontierAtlasBySlug(opts.island);
  const atlasEn = [atlasEntry?.title.en, atlasEntry?.qfocus.en].filter(Boolean).join(" ");
  const keywords = extractKeywords({
    title: object.title,
    qfocus,
    body: [body.night, atlasEn].filter(Boolean).join(" "),
  });
  deps.log(`题：「${object.title}」 QFocus=${qfocus.replace(/\s+/g, " ").trim()}`);
  if (atlasEn) deps.log(`图集英文补充：${atlasEn.replace(/\s+/g, " ").trim()}`);
  deps.log(`关键词：${keywords.join(" / ") || "(none)"}`);

  // c(部分). Dedup source — DOIs already proposed. Ledger events carry only
  // `ref: sha256:…` (content is never inlined), so the raw jsonl text cannot
  // contain a DOI: resolve this scout's own night_digest refs via the
  // read-only /api/refs endpoint and scan the resolved content.
  const ledger = await deps.fetchText(`${base}/api/islands/${opts.island}/ledger.jsonl`).catch(() => "");
  const ownRefs = ledger
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l) as { action?: string; ref?: string; actor?: { id?: string } };
      } catch {
        return null;
      }
    })
    .filter((e): e is { action: string; ref: string; actor: { id: string } } =>
      e?.action === "night_digest" && typeof e?.ref === "string" && e?.actor?.id === (opts.agent ?? "github:curiosity-scout"),
    )
    .map((e) => e.ref);
  const resolved = await Promise.all(
    [...new Set(ownRefs)].map((r) =>
      deps.fetchText(`${base}/api/refs/${encodeURIComponent(r)}`).catch(() => ""),
    ),
  );
  const seen = extractSeenDois(resolved.join("\n"));

  // b. SEARCH CrossRef within the last-year window.
  const fromPubDate = oneYearAgo(deps.now);
  const works = await deps.fetchWorks(keywords, opts.rows, fromPubDate, opts.mailto);
  deps.log(`CrossRef 返回 ${works.length} 条（from-pub-date:${fromPubDate}），已见 DOI ${seen.size} 条`);

  // c. RANK + dedup.
  const candidates = rankAndDedup(works, keywords, seen, opts.topK);
  const proposals = candidates.map((c) => summarizeCandidate(c, { qfocus }));

  const result: NightResult = {
    island: opts.island,
    qfocus,
    keywords,
    fromPubDate,
    fetched: works.length,
    seenDois: seen.size,
    candidates,
    proposals,
    written: [],
    digest: "",
  };

  if (opts.dryRun || proposals.length === 0) {
    if (opts.dryRun) deps.log("[dry-run] 不写入网关，仅打印候选：");
    proposals.forEach((p, i) => deps.log(`  ${i + 1}. ${p.text.replace(/\n/g, " | ")}`));
    return result;
  }

  // d. PROPOSE each via the MCP gateway (create_driftwood → night_digest event).
  if (!deps.makeWriter) throw new Error("makeWriter required for a live (non dry-run) shift");
  const writer = await deps.makeWriter();
  try {
    for (const p of proposals) {
      const r = await writer.createDriftwood(p.atom, p.text, CREDIT);
      result.written.push(r);
      deps.log(`⇢ create_driftwood: ${r}`);
    }
    // e. COLLECT — one night_digest for the shift, filed as a morning-report
    // draft for the library (dest → refKind morning_report at the gateway;
    // mirrors the seeded scout's「12 篇新文摘要」draft shape).
    result.digest = await writer.nightDigest(summarizeShift(proposals, { island: opts.island, qfocus }), CREDIT, "library");
    if (result.digest) deps.log(`⇢ night_digest: ${result.digest}`);
    else deps.log("night_digest 工具不可用；收班摘要未单独入账（每条 create_driftwood 已是 night_digest 事件）");
  } finally {
    await writer.close();
  }
  return result;
}

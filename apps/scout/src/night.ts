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
  const keywords = extractKeywords({ title: object.title, qfocus, body: body.night });
  deps.log(`题：「${object.title}」 QFocus=${qfocus.replace(/\s+/g, " ").trim()}`);
  deps.log(`关键词：${keywords.join(" / ") || "(none)"}`);

  // c(部分). Dedup source — DOIs already in the ledger.
  const ledger = await deps.fetchText(`${base}/api/islands/${opts.island}/ledger.jsonl`).catch(() => "");
  const seen = extractSeenDois(ledger);

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
    // e. COLLECT — one night_digest for the shift (through the gateway).
    result.digest = await writer.nightDigest(summarizeShift(proposals, { island: opts.island, qfocus }), CREDIT);
    if (result.digest) deps.log(`⇢ night_digest: ${result.digest}`);
    else deps.log("night_digest 工具不可用；收班摘要未单独入账（每条 create_driftwood 已是 night_digest 事件）");
  } finally {
    await writer.close();
  }
  return result;
}

/**
 * Pure, deterministic core of the literature-scout night shift.
 *
 * No network, no clock, no MCP — every function here maps inputs → outputs with
 * no side effects, so the ranking / dedup / summary logic is fully unit-testable
 * (see test/pipeline.test.ts). The IO shell lives in crossref.ts / mcpClient.ts /
 * night.ts.
 */

/** The six driftwood atom types (mirrors packages/core ATOM_TYPES). A found
 * paper is a night "thought" — the scout never invents an atom outside this set. */
export type Atom =
  | "thought"
  | "question"
  | "metaphor"
  | "sketch"
  | "contradiction"
  | "thought-experiment";

/** A single CrossRef `/works` item (only the fields we `select`). */
export interface CrossRefWork {
  DOI?: string;
  title?: string[];
  "container-title"?: string[];
  issued?: { "date-parts"?: number[][] };
  score?: number;
  abstract?: string;
}

/** A scored, de-duplicated literature candidate. */
export interface Candidate {
  doi: string;
  title: string;
  container: string;
  year: number | null;
  crossRefScore: number;
  /** Keywords (lower-cased) found in title/abstract/container. */
  matched: string[];
  /** Deterministic combined rank score. */
  score: number;
}

/** A driftwood proposal drafted from a candidate (template, never an LLM). */
export interface Proposal {
  atom: Atom;
  text: string;
  doi: string;
}

/** Weight applied to each keyword overlap on top of the raw CrossRef score. */
export const OVERLAP_WEIGHT = 10;

const EN_STOP = new Set([
  "the", "a", "an", "of", "and", "or", "to", "in", "on", "for", "is", "are",
  "can", "could", "how", "what", "why", "does", "do", "with", "without", "by",
  "from", "as", "at", "be", "that", "this", "it", "its", "not", "no", "we",
  "our", "their", "when", "which", "who", "whom", "than", "then", "so",
]);

const isLatin = (t: string): boolean => /^[A-Za-z]/.test(t);

/**
 * Deterministic keyword extraction from a problem object's title + QFocus (+
 * optional body). Latin word-runs are lower-cased and stop-word filtered; CJK
 * runs are kept whole. Latin terms lead the list (CrossRef is English-centric),
 * CJK terms follow, first-seen order preserved, capped at `max`.
 */
export function extractKeywords(
  input: { title?: string; qfocus?: string; body?: string },
  max = 8,
): string[] {
  const text = [input.title, input.qfocus, input.body].filter(Boolean).join(" ");
  const re = /[A-Za-z][A-Za-z0-9+.\-]*|[一-鿿]+/g;
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const m of text.matchAll(re)) {
    let tok = m[0];
    if (isLatin(tok)) {
      tok = tok.toLowerCase();
      if (tok.length < 2 || EN_STOP.has(tok)) continue;
    } else if (tok.length < 2) {
      continue;
    }
    if (seen.has(tok)) continue;
    seen.add(tok);
    ordered.push(tok);
  }
  const latin = ordered.filter(isLatin);
  const cjk = ordered.filter((t) => !isLatin(t));
  return [...latin, ...cjk].slice(0, max);
}

/** ISO `YYYY-MM-DD` one calendar year before `now` (UTC) — the CrossRef window. */
export function oneYearAgo(now: Date): string {
  const d = new Date(Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), now.getUTCDate()));
  return d.toISOString().slice(0, 10);
}

/** Build the CrossRef `/works` request (URL + polite headers). Deterministic. */
export function buildCrossRefQuery(
  keywords: string[],
  opts: { rows: number; fromPubDate: string; mailto?: string; userAgent: string },
): { url: string; headers: Record<string, string> } {
  const params = new URLSearchParams();
  params.set("query.bibliographic", keywords.join(" "));
  params.set("filter", `from-pub-date:${opts.fromPubDate}`);
  params.set("rows", String(opts.rows));
  params.set("select", "DOI,title,abstract,container-title,issued,score");
  if (opts.mailto) params.set("mailto", opts.mailto);
  return {
    url: `https://api.crossref.org/works?${params.toString()}`,
    headers: { "User-Agent": opts.userAgent },
  };
}

const first = (a: string[] | undefined): string => (a && a[0]) ?? "";

function yearOf(work: CrossRefWork): number | null {
  const y = work.issued?.["date-parts"]?.[0]?.[0];
  return typeof y === "number" ? y : null;
}

/** Normalize a DOI for matching/dedup: strip URL/`doi:` prefixes, lower-case. */
export function normalizeDoi(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/^doi:/i, "")
    .toLowerCase();
}

/** Turn a CrossRef work into a scored Candidate against the keyword set. */
export function toCandidate(work: CrossRefWork, keywords: string[]): Candidate | null {
  const doiRaw = work.DOI;
  if (!doiRaw) return null;
  const doi = normalizeDoi(doiRaw);
  const title = first(work.title) || "(untitled)";
  const container = first(work["container-title"]);
  const haystack = `${title} ${container} ${work.abstract ?? ""}`.toLowerCase();
  const matched = keywords.filter((k) => haystack.includes(k.toLowerCase()));
  const crossRefScore = typeof work.score === "number" ? work.score : 0;
  const score = crossRefScore + matched.length * OVERLAP_WEIGHT;
  return { doi, title, container, year: yearOf(work), crossRefScore, matched, score };
}

/**
 * Score, drop already-seen DOIs, and rank. Sort is fully deterministic: score
 * desc, then DOI ascending as a stable tiebreak. Returns at most `topK`.
 */
export function rankAndDedup(
  works: CrossRefWork[],
  keywords: string[],
  seenDois: Set<string>,
  topK: number,
): Candidate[] {
  const byDoi = new Map<string, Candidate>();
  for (const w of works) {
    const c = toCandidate(w, keywords);
    if (!c) continue;
    if (seenDois.has(c.doi)) continue;
    // Dedup within the batch too: keep the higher-scoring instance.
    const prev = byDoi.get(c.doi);
    if (!prev || c.score > prev.score) byDoi.set(c.doi, c);
  }
  return [...byDoi.values()]
    .sort((a, b) => (b.score - a.score) || (a.doi < b.doi ? -1 : a.doi > b.doi ? 1 : 0))
    .slice(0, topK);
}

const DOI_RE = /10\.\d{4,9}\/[^\s"'\\<>)}\]]+/gi;

/**
 * Extract every DOI already present in the island's ledger (JSONL text). We
 * match on the raw event text — no new storage — so any prior driftwood/report
 * that mentions a DOI causes that paper to be skipped this shift.
 */
export function extractSeenDois(ledgerJsonl: string): Set<string> {
  const out = new Set<string>();
  for (const m of ledgerJsonl.matchAll(DOI_RE)) {
    out.add(normalizeDoi(m[0].replace(/[.,;]+$/, "")));
  }
  return out;
}

function truncate(s: string, n: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

/**
 * Draft a driftwood proposal from a candidate. Pure template — the "why it's
 * relevant" line is generated from matched keywords, never an LLM call.
 */
export function summarizeCandidate(
  candidate: Candidate,
  ctx: { qfocus: string },
): Proposal {
  const yr = candidate.year ?? "—";
  const head = `${candidate.title} — ${candidate.container || "?"} (${yr}) doi:${candidate.doi}`;
  const why = candidate.matched.length
    ? `与聚焦「${truncate(ctx.qfocus, 20)}」相关：命中关键词 ${candidate.matched
        .slice(0, 4)
        .map((k) => `「${k}」`)
        .join("")}`
    : `与聚焦「${truncate(ctx.qfocus, 20)}」的候选文献（CrossRef 相关度 ${candidate.crossRefScore.toFixed(1)}）`;
  return { atom: "thought", text: `${head}\n${why}`, doi: candidate.doi };
}

/** Compose a one-line night-digest summary of the shift (for the collect step). */
export function summarizeShift(
  proposals: Proposal[],
  ctx: { island: string; qfocus: string },
): string {
  const heads = proposals.map((p) => p.text.split("\n")[0]).join(" · ");
  return `文献侦察夜班 · 岛「${ctx.island}」· 就聚焦「${truncate(ctx.qfocus, 24)}」拾得 ${proposals.length} 条候选：${heads}`;
}

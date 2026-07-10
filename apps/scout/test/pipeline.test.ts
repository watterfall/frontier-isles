import { describe, it, expect } from "vitest";
import {
  extractKeywords,
  oneYearAgo,
  buildCrossRefQuery,
  toCandidate,
  rankAndDedup,
  extractSeenDois,
  normalizeDoi,
  summarizeCandidate,
  summarizeShift,
  OVERLAP_WEIGHT,
  type CrossRefWork,
} from "../src/pipeline.js";
import resp from "./fixtures/crossref-works.json";

const WORKS = resp.message.items as CrossRefWork[];
const KW = extractKeywords({
  title: "机器的好奇心 · curiosity",
  qfocus: "Can AI ask a good question that no human has thought of? 机器好奇心与新颖度",
  body: "Some night notes about curiosity, novelty and question generation.",
});

describe("extractKeywords", () => {
  it("is deterministic and latin-first, drops stopwords/short tokens", () => {
    expect(KW).toEqual(extractKeywords({
      title: "机器的好奇心 · curiosity",
      qfocus: "Can AI ask a good question that no human has thought of? 机器好奇心与新颖度",
      body: "Some night notes about curiosity, novelty and question generation.",
    }));
    // latin, lower-cased, "can"/"a"/"that"/"no"/"of"/"and" removed
    expect(KW).toContain("curiosity");
    expect(KW).toContain("ai");
    expect(KW).toContain("question");
    expect(KW).not.toContain("can");
    expect(KW).not.toContain("a");
    // latin terms precede any CJK term
    const firstCjk = KW.findIndex((k) => /[一-鿿]/.test(k));
    if (firstCjk >= 0) {
      expect(KW.slice(0, firstCjk).every((k) => /^[a-z]/.test(k))).toBe(true);
    }
  });

  it("respects the max cap", () => {
    expect(extractKeywords({ qfocus: "alpha beta gamma delta epsilon zeta eta theta iota" }, 3))
      .toEqual(["alpha", "beta", "gamma"]);
  });
});

describe("oneYearAgo", () => {
  it("subtracts exactly one calendar year (UTC, YYYY-MM-DD)", () => {
    expect(oneYearAgo(new Date("2026-07-10T12:00:00Z"))).toBe("2025-07-10");
  });
});

describe("buildCrossRefQuery", () => {
  it("encodes bibliographic query, window, rows, select and mailto", () => {
    const { url, headers } = buildCrossRefQuery(["ai", "curiosity"], {
      rows: 8,
      fromPubDate: "2025-07-10",
      mailto: "you@example.com",
      userAgent: "ua/1",
    });
    expect(url).toContain("query.bibliographic=ai+curiosity");
    expect(url).toContain("filter=from-pub-date%3A2025-07-10");
    expect(url).toContain("rows=8");
    expect(url).toContain("select=DOI");
    expect(url).toContain("mailto=you%40example.com");
    expect(headers["User-Agent"]).toBe("ua/1");
  });

  it("omits mailto when not provided", () => {
    const { url } = buildCrossRefQuery(["ai"], { rows: 1, fromPubDate: "2025-01-01", userAgent: "ua/1" });
    expect(url).not.toContain("mailto");
  });
});

describe("normalizeDoi", () => {
  it("strips url/doi prefixes and lower-cases", () => {
    expect(normalizeDoi("https://doi.org/10.1000/AAA")).toBe("10.1000/aaa");
    expect(normalizeDoi("doi:10.1000/Bbb")).toBe("10.1000/bbb");
  });
});

describe("toCandidate + scoring", () => {
  it("combines CrossRef score with keyword overlap", () => {
    const c = toCandidate(WORKS[0]!, KW)!;
    expect(c.doi).toBe("10.1000/aaa");
    expect(c.year).toBe(2024);
    expect(c.matched).toContain("curiosity");
    expect(c.matched).toContain("question");
    expect(c.score).toBe(c.crossRefScore + c.matched.length * OVERLAP_WEIGHT);
  });

  it("returns null for a work with no DOI", () => {
    expect(toCandidate({ title: ["x"] }, KW)).toBeNull();
  });
});

describe("rankAndDedup", () => {
  const seen = extractSeenDois('{"action":"night_digest","ref":"..","note":"doi:10.1000/ddd already seen"}');

  it("drops ledger DOIs, ranks by score then DOI, caps at topK", () => {
    const ranked = rankAndDedup(WORKS, KW, seen, 3);
    expect(ranked.map((c) => c.doi)).not.toContain("10.1000/ddd"); // deduped
    expect(ranked).toHaveLength(3);
    // aaa (45) > eee (32) > bbb (20); ccc (15) drops out
    expect(ranked[0]!.doi).toBe("10.1000/aaa");
    expect(ranked[1]!.doi).toBe("10.1000/eee"); // uppercase in fixture, normalized
    expect(ranked[2]!.doi).toBe("10.1000/bbb");
  });

  it("is a pure function (same input → same output)", () => {
    expect(rankAndDedup(WORKS, KW, seen, 5)).toEqual(rankAndDedup(WORKS, KW, seen, 5));
  });
});

describe("extractSeenDois", () => {
  it("finds DOIs anywhere in the ledger text, normalized", () => {
    const s = extractSeenDois('foo doi:10.1000/ddd bar https://doi.org/10.5555/xyz.1\n{"t":"10.1000/AAA."}');
    expect(s.has("10.1000/ddd")).toBe(true);
    expect(s.has("10.5555/xyz.1")).toBe(true);
    expect(s.has("10.1000/aaa")).toBe(true); // trailing period stripped, lower-cased
  });
});

describe("summarizeCandidate", () => {
  it("renders a deterministic template with title/journal/year/doi + relevance", () => {
    const c = toCandidate(WORKS[0]!, KW)!;
    const p = summarizeCandidate(c, { qfocus: "Can AI ask a good question?" });
    expect(p.atom).toBe("thought");
    expect(p.doi).toBe("10.1000/aaa");
    expect(p.text).toContain("Curiosity-driven question generation in AI");
    expect(p.text).toContain("Journal of AI");
    expect(p.text).toContain("(2024)");
    expect(p.text).toContain("doi:10.1000/aaa");
    expect(p.text).toContain("命中关键词");
  });
});

describe("summarizeShift", () => {
  it("summarizes the whole shift in one line", () => {
    const ranked = rankAndDedup(WORKS, KW, new Set(), 2);
    const proposals = ranked.map((c) => summarizeCandidate(c, { qfocus: "q" }));
    const line = summarizeShift(proposals, { island: "machine-curiosity", qfocus: "q" });
    expect(line).toContain("machine-curiosity");
    expect(line).toContain("2 条候选");
  });
});

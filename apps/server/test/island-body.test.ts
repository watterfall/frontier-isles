import { describe, it, expect } from "vitest";
import { buildIslandBody } from "../src/seed";

/**
 * §九 Phase 1: the grounded literature list must reach the leavable problem.md
 * body (§6 leavability — it travels with the .md), so opening a coverage island
 * shows its real citations, not just the essay.
 */
describe("buildIslandBody 参考文献", () => {
  const chart = { slug: "t", n: "T", q: "q", x: 0, y: 0, s: 1, a: 0, m: 0, d: "数理", st: 1 } as never;
  const depth = {
    overview: { zh: "o", en: "o" },
    whyMatters: { zh: "w", en: "w" },
    ifAnswered: { zh: "i", en: "i" },
    approaches: [{ zh: "a", en: "a" }],
    barrier: { zh: "b", en: "b" },
    subQuestions: [{ zh: "s", en: "s" }],
  };

  it("renders a 参考文献 section when the atlas entry has literature", () => {
    const atlas = {
      depth,
      literature: [{ title: "Real Paper", venue: "Nature", year: 2020, url: "https://x.test/p" }],
    } as never;
    const body = buildIslandBody(chart, atlas);
    expect(body).toContain("## 参考文献");
    expect(body).toContain("Real Paper");
    expect(body).toContain("https://x.test/p");
  });

  it("omits the 参考文献 section when there is no literature", () => {
    const atlas = { depth } as never;
    const body = buildIslandBody(chart, atlas);
    expect(body).not.toContain("## 参考文献");
  });
});

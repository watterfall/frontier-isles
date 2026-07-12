import { describe, it, expect } from "vitest";
import { REGION_QUESTIONS, REGION_NAMES } from "../src/regions";

/**
 * §九 Phase 1: the atlas cluster great-questions surface on the T1 named regions
 * so 「岛屿方向里面的问题」 is visible at the middle tier. The questions are a
 * grounded overlay keyed by the region's dominant curated cluster.code.
 */
describe("REGION_QUESTIONS", () => {
  it("every question is bilingual and non-empty (q/whyMatters/ifAnswered)", () => {
    for (const list of Object.values(REGION_QUESTIONS)) {
      expect(list.length).toBeGreaterThan(0);
      for (const q of list) {
        for (const field of [q.q, q.whyMatters, q.ifAnswered]) {
          expect(field.zh.length).toBeGreaterThan(0);
          expect(field.en.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("only keys named regions (every question code is also a curated region name)", () => {
    for (const code of Object.keys(REGION_QUESTIONS)) {
      expect(REGION_NAMES[code]).toBeDefined();
    }
  });
});

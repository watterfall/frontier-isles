import { describe, it, expect } from "vitest";
import { SEED_STRUCTURES } from "../src/structures";
import { FRONTIERS } from "../src/frontiers";

/**
 * §九 Phase 2 seed integrity: every rebuilt mapping must point at a real island
 * (no edge without a real substrate), structure ids are well-formed, and the
 * one intentionally-unmapped structure (标度) stays a pure frontier.
 */
describe("SEED_STRUCTURES", () => {
  const slugs = new Set(FRONTIERS.map((f) => f.slug));

  it("has three orthogonal structures with struct:// ids", () => {
    expect(SEED_STRUCTURES).toHaveLength(3);
    for (const s of SEED_STRUCTURES) {
      expect(s.id).toMatch(/^struct:\/\/[a-z]+\/[a-z-]+$/);
      expect(s.title.zh.length).toBeGreaterThan(0);
      expect(s.title.en.length).toBeGreaterThan(0);
      expect(s.statement.zh.length).toBeGreaterThan(0);
    }
  });

  it("every mapping points at a real island, with ≥1 correspondence (no fabricated edge)", () => {
    for (const s of SEED_STRUCTURES) {
      for (const m of s.mappings) {
        expect(slugs.has(m.slug)).toBe(true);
        expect(m.correspondences.length).toBeGreaterThan(0);
        for (const corr of m.correspondences) {
          expect(corr.quantity.zh.length).toBeGreaterThan(0);
          expect(corr.inThisSubstrate.zh.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("网络级联 is the rich one; 标度 is intentionally a 0-edge pure frontier", () => {
    const cascade = SEED_STRUCTURES.find((s) => s.id.endsWith("network-cascade"))!;
    const scaling = SEED_STRUCTURES.find((s) => s.id.endsWith("scaling"))!;
    expect(cascade.mappings.length).toBeGreaterThanOrEqual(3);
    expect(scaling.mappings).toHaveLength(0);
    expect(scaling.status).toBe("proposed");
  });
});

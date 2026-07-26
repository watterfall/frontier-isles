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
  const expansionMappedSlugs = new Set([
    "dark-fiber-ecological-sensing",
    "biotremology-vibrational-communication",
    "aerial-electroecology",
    "thermodynamic-computing-hardware",
    "p-bit-probabilistic-computing",
    "aqueous-iontronic-memristors",
    "mechanical-metamaterial-computing",
    "counterfactual-history-causal-cliometrics",
    "social-physics-predictability-boundary",
    "collective-reasoning-group-epistemology",
  ]);

  it("has well-formed, uniquely-identified struct:// entries", () => {
    // No fixed total here on purpose: the catalog grows as isomorphisms are
    // aligned onto real islands, and a hard-coded count only ever rots.
    expect(SEED_STRUCTURES.length).toBeGreaterThanOrEqual(3);
    expect(new Set(SEED_STRUCTURES.map((s) => s.id)).size).toBe(SEED_STRUCTURES.length);
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

  it("every mapping ships its prediction AND its boundary (an analogy without a stopping point is a claim)", () => {
    // §七 + the file header: a rebuilt mapping that says where it holds but not
    // where it breaks quietly becomes an identity claim. Both fields, both langs.
    for (const s of SEED_STRUCTURES) {
      for (const m of s.mappings) {
        expect(m.prediction?.zh, `${s.id} → ${m.slug} prediction.zh`).toBeTruthy();
        expect(m.prediction?.en, `${s.id} → ${m.slug} prediction.en`).toBeTruthy();
        expect(m.boundary?.zh, `${s.id} → ${m.slug} boundary.zh`).toBeTruthy();
        expect(m.boundary?.en, `${s.id} → ${m.slug} boundary.en`).toBeTruthy();
      }
    }
  });

  it("each xfrontier isomorphism is claimed at most once (no duplicate structure for one ISO)", () => {
    const isos = SEED_STRUCTURES.map((s) => s.isomorphism).filter(Boolean);
    expect(new Set(isos).size).toBe(isos.length);
  });

  it("a pure frontier is unmapped AND proposed — an empty structure must not read as an active one", () => {
    for (const s of SEED_STRUCTURES) {
      if (s.mappings.length === 0) expect(s.status, s.id).toBe("proposed");
      else expect(s.status, s.id).toBe("active");
    }
  });

  it("the expansion's rebuilt mappings cite direct evidence instead of inheriting a field-level claim", () => {
    const mapped = SEED_STRUCTURES.flatMap((structure) =>
      structure.mappings.map((mapping) => ({ structure, mapping })),
    );

    for (const slug of expansionMappedSlugs) {
      const matches = mapped.filter(({ mapping }) => mapping.slug === slug);
      expect(matches.length, `${slug} has a grounded mapping`).toBeGreaterThan(0);
      for (const { structure, mapping } of matches) {
        expect(
          mapping.evidenceRefs?.length,
          `${structure.id} → ${slug} direct evidence`,
        ).toBeGreaterThan(0);
        for (const ref of mapping.evidenceRefs ?? []) {
          expect(ref, `${structure.id} → ${slug} evidence URL`).toMatch(/^https:\/\//);
          expect(ref).not.toBe("https://xfrontier.science/");
        }
      }
    }
  });

  it("new directions connect both to legacy islands and across top-level domains", () => {
    const domainBySlug = new Map(FRONTIERS.map((frontier) => [frontier.slug, frontier.domain]));
    const structuresTouchingExpansion = SEED_STRUCTURES.filter((structure) =>
      structure.mappings.some((mapping) => expansionMappedSlugs.has(mapping.slug)),
    );
    const legacyBridges = structuresTouchingExpansion.filter(
      (structure) =>
        structure.mappings.some((mapping) => expansionMappedSlugs.has(mapping.slug)) &&
        structure.mappings.some((mapping) => !expansionMappedSlugs.has(mapping.slug)),
    );
    const crossDomain = structuresTouchingExpansion.filter((structure) => {
      const domains = new Set(
        structure.mappings
          .map((mapping) => domainBySlug.get(mapping.slug))
          .filter((domain): domain is NonNullable<typeof domain> => domain !== undefined),
      );
      return domains.size >= 2;
    });

    expect(legacyBridges.length).toBeGreaterThanOrEqual(5);
    expect(crossDomain.length).toBeGreaterThanOrEqual(4);
  });
});

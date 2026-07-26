import { describe, expect, it } from "vitest";
import { FRONTIERS } from "../src/frontiers";
import { SEED_STRUCTURES } from "../src/structures";
import {
  WAVE_2_STRUCTURES,
  WAVE_2_STRUCTURE_PATCHES,
} from "../src/structures-expansion-wave2";

const WAVE_2_SLUGS = new Set(
  FRONTIERS.filter((frontier) => frontier.id >= 141 && frontier.id <= 176).map(
    (frontier) => frontier.slug,
  ),
);
const DOMAIN_BY_SLUG = new Map(
  FRONTIERS.map((frontier) => [frontier.slug, frontier.domain]),
);
const EXPECTED_ISOMORPHISMS = new Set([
  "ISO-05",
  "ISO-07",
  "ISO-09",
  "ISO-18",
  "ISO-24",
  "ISO-25",
]);

describe("wave 2 structure graph expansion", () => {
  it("fills the six selected missing isomorphism classes exactly once", () => {
    expect(WAVE_2_STRUCTURES).toHaveLength(EXPECTED_ISOMORPHISMS.size);
    expect(
      new Set(WAVE_2_STRUCTURES.map((structure) => structure.isomorphism)),
    ).toEqual(EXPECTED_ISOMORPHISMS);
    expect(
      new Set(WAVE_2_STRUCTURES.map((structure) => structure.id)).size,
    ).toBe(WAVE_2_STRUCTURES.length);
  });

  it("grounds every new or patched mapping with bilingual limits and direct evidence", () => {
    const mappings = [
      ...WAVE_2_STRUCTURES.flatMap((structure) => structure.mappings),
      ...WAVE_2_STRUCTURE_PATCHES.flatMap((patch) => patch.mappings),
    ];

    for (const mapping of mappings) {
      expect(DOMAIN_BY_SLUG.has(mapping.slug), mapping.slug).toBe(true);
      expect(mapping.correspondences.length, mapping.slug).toBeGreaterThan(0);
      for (const correspondence of mapping.correspondences) {
        expect(correspondence.quantity.zh, mapping.slug).toBeTruthy();
        expect(correspondence.quantity.en, mapping.slug).toBeTruthy();
        expect(correspondence.inThisSubstrate.zh, mapping.slug).toBeTruthy();
        expect(correspondence.inThisSubstrate.en, mapping.slug).toBeTruthy();
      }
      expect(mapping.prediction?.zh, `${mapping.slug} prediction.zh`).toBeTruthy();
      expect(mapping.prediction?.en, `${mapping.slug} prediction.en`).toBeTruthy();
      expect(mapping.boundary?.zh, `${mapping.slug} boundary.zh`).toBeTruthy();
      expect(mapping.boundary?.en, `${mapping.slug} boundary.en`).toBeTruthy();
      expect(mapping.evidenceRefs?.length, `${mapping.slug} evidence`).toBeGreaterThan(0);
      for (const ref of mapping.evidenceRefs ?? []) {
        expect(ref, `${mapping.slug} evidence URL`).toMatch(/^https:\/\//);
      }
    }
  });

  it("connects at least 24 wave 2 directions, including legacy landings and patches", () => {
    const newStructureWave2 = new Set(
      WAVE_2_STRUCTURES.flatMap((structure) =>
        structure.mappings
          .filter((mapping) => WAVE_2_SLUGS.has(mapping.slug))
          .map((mapping) => mapping.slug),
      ),
    );
    const newStructureLegacy = new Set(
      WAVE_2_STRUCTURES.flatMap((structure) =>
        structure.mappings
          .filter((mapping) => !WAVE_2_SLUGS.has(mapping.slug))
          .map((mapping) => mapping.slug),
      ),
    );
    const patchedWave2 = new Set(
      WAVE_2_STRUCTURE_PATCHES.flatMap((patch) =>
        patch.mappings
          .filter((mapping) => WAVE_2_SLUGS.has(mapping.slug))
          .map((mapping) => mapping.slug),
      ),
    );
    const allMappedWave2 = new Set(
      SEED_STRUCTURES.flatMap((structure) =>
        structure.mappings
          .filter((mapping) => WAVE_2_SLUGS.has(mapping.slug))
          .map((mapping) => mapping.slug),
      ),
    );

    expect(newStructureWave2.size).toBeGreaterThanOrEqual(18);
    expect(newStructureLegacy.size).toBeGreaterThanOrEqual(6);
    expect(patchedWave2.size).toBeGreaterThanOrEqual(12);
    expect(allMappedWave2.size).toBeGreaterThanOrEqual(24);
  });

  it("makes every new isomorphism cross a top-level domain boundary", () => {
    for (const structure of WAVE_2_STRUCTURES) {
      const domains = new Set(
        structure.mappings.map((mapping) => DOMAIN_BY_SLUG.get(mapping.slug)),
      );
      expect(domains.size, structure.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("patches existing structures without creating duplicate island mappings", () => {
    expect(
      new Set(WAVE_2_STRUCTURE_PATCHES.map((patch) => patch.structureId)).size,
    ).toBe(WAVE_2_STRUCTURE_PATCHES.length);

    for (const patch of WAVE_2_STRUCTURE_PATCHES) {
      expect(
        SEED_STRUCTURES.some((structure) => structure.id === patch.structureId),
        patch.structureId,
      ).toBe(true);
    }
    for (const structure of SEED_STRUCTURES) {
      const slugs = structure.mappings.map((mapping) => mapping.slug);
      expect(new Set(slugs).size, structure.id).toBe(slugs.length);
    }
  });
});

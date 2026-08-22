import { describe, expect, it } from 'vitest';
import { SEED_STRUCTURES } from '../src/structures';
import { CRITICAL_FAMILY_DEPTH } from '../src/structures-depth-critical';
import { INFERENCE_FAMILY_DEPTH } from '../src/structures-depth-inference';
import { COLLECTIVE_FAMILY_DEPTH } from '../src/structures-depth-collective';

const ALL_DEPTH = [...CRITICAL_FAMILY_DEPTH, ...INFERENCE_FAMILY_DEPTH, ...COLLECTIVE_FAMILY_DEPTH];
import { FRONTIERS } from '../src/frontiers';

const byId = new Map(SEED_STRUCTURES.map((structure) => [structure.id, structure]));
const withDepth = SEED_STRUCTURES.filter((structure) => structure.depth);
const complete = (value: { zh: string; en: string } | undefined): boolean =>
  !!value && value.zh.trim().length > 0 && value.en.trim().length > 0;

describe('structure depth', () => {
  it('lands on the structures each family claims, and only those', () => {
    expect(CRITICAL_FAMILY_DEPTH).toHaveLength(8);
    expect(INFERENCE_FAMILY_DEPTH).toHaveLength(8);
    expect(COLLECTIVE_FAMILY_DEPTH).toHaveLength(8);
    expect(withDepth).toHaveLength(24);
    for (const patch of ALL_DEPTH) {
      expect(byId.get(patch.structureId)?.depth, patch.structureId).toBe(patch.depth);
    }
  });

  it('is authored without reference to any island — no slug appears anywhere in it', () => {
    // The whole point of the field. A canonical substrate is a textbook
    // instance; the moment one of them is an island slug, the structure layer
    // has quietly gone back to depending on the atlas.
    const slugs = new Set(FRONTIERS.map((island) => island.slug));
    const serialised = JSON.stringify(ALL_DEPTH);
    for (const slug of slugs) {
      expect(serialised.includes(`"${slug}"`), `depth must not reference island ${slug}`).toBe(false);
    }
  });

  it('states origin, substrates, relations and a mistakenFor for each', () => {
    for (const structure of withDepth) {
      const depth = structure.depth!;
      expect(complete(depth.origin), structure.id).toBe(true);
      expect(complete(depth.mistakenFor), structure.id).toBe(true);
      expect(depth.canonicalSubstrates.length, structure.id).toBeGreaterThanOrEqual(3);
      expect(depth.relations.length, structure.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('gives every canonical substrate a field, a quantity pointer and its own boundary', () => {
    for (const structure of withDepth) {
      const quantities = structure.quantities ?? [];
      expect(quantities.length, `${structure.id} needs quantities to point at`).toBeGreaterThan(0);
      for (const substrate of structure.depth!.canonicalSubstrates) {
        expect(complete(substrate.name), structure.id).toBe(true);
        expect(complete(substrate.field), structure.id).toBe(true);
        expect(complete(substrate.inThisSubstrate), structure.id).toBe(true);
        expect(complete(substrate.boundary), structure.id).toBe(true);
        expect(substrate.quantity, `${structure.id} ${substrate.name.zh}`).toBeGreaterThanOrEqual(0);
        expect(substrate.quantity, `${structure.id} ${substrate.name.zh}`).toBeLessThan(quantities.length);
      }
    }
  });

  it('spans at least three disciplines per structure, which is the whole claim', () => {
    // A structure whose canonical substrates all sit in one field is not
    // carrying a cross-disciplinary claim, however well it is written.
    for (const structure of withDepth) {
      const fields = new Set(structure.depth!.canonicalSubstrates.map((s) => s.field.zh));
      expect(fields.size, `${structure.id} spans ${[...fields].join('/')}`).toBeGreaterThanOrEqual(3);
    }
  });

  it('never repeats a boundary between two substrates of one structure', () => {
    // Each substrate departs from the skeleton in its own way. Identical
    // boundaries mean one was written generically, which is the failure the
    // 101 authored mapping boundaries deliberately avoid.
    for (const structure of withDepth) {
      const boundaries = structure.depth!.canonicalSubstrates.map((s) => s.boundary.zh);
      expect(new Set(boundaries).size, structure.id).toBe(boundaries.length);
    }
  });

  it('points every relation at a structure that exists, and never at itself', () => {
    for (const structure of withDepth) {
      for (const relation of structure.depth!.relations) {
        expect(byId.has(relation.to), `${structure.id} → ${relation.to}`).toBe(true);
        expect(relation.to, structure.id).not.toBe(structure.id);
        expect(complete(relation.why), `${structure.id} → ${relation.to}`).toBe(true);
        expect(relation.kind).toMatch(/^(emerges-from|generates|special-case-of|explains|competes-with)$/);
      }
    }
  });

  it('gives the connective tissue the mapping layer never did', () => {
    // 0 of 126 structures carried a relation to another before this field.
    const edges = withDepth.flatMap((structure) =>
      structure.depth!.relations.map((relation) => `${structure.id}→${relation.to}`));
    expect(edges.length).toBeGreaterThanOrEqual(50);
    expect(new Set(edges).size, 'a relation must not be stated twice').toBe(edges.length);
    // Every structure in the family is reachable from another: none is isolated.
    const touched = new Set(withDepth.flatMap((structure) =>
      [structure.id, ...structure.depth!.relations.map((relation) => relation.to)]));
    for (const structure of withDepth) expect(touched.has(structure.id), structure.id).toBe(true);
  });

  it('leaves mappings and coverage exactly where they were', () => {
    // Depth is content, not connection. If either number moves, a depth patch
    // has started claiming an edge.
    const mappings = SEED_STRUCTURES.reduce((total, structure) => total + structure.mappings.length, 0);
    expect(mappings).toBe(101);
    const covered = new Set(SEED_STRUCTURES.flatMap((s) => s.mappings.map((m) => m.slug)));
    expect(covered.size).toBe(77);
  });
});

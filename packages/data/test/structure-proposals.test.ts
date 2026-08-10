import { describe, expect, it } from 'vitest';
import { FRONTIERS } from '../src/frontiers';
import { SEED_STRUCTURES } from '../src/structures';
import { BRIDGES } from '../src/bridges';
import { SEA_SEED_RELATIONS } from '../src/sea';
import { INTERIORS } from '../src/interiors';
import { INTERIORS_2 } from '../src/interiors-2';
import {
  STRUCTURE_PROPOSALS,
  resolveProposal,
  proposalsFor,
  structureIdsFor,
  type StructureProposal,
} from '../src/structure-proposals';

/**
 * These gates exist because the file they guard is AI-authored and the thing it
 * sits next to — `structures.ts` — is contractually not. The separation only
 * means anything if it is enforced, so each property below is one way a
 * proposal could quietly turn into a claim.
 */

/** Islands already carrying an authored relation, by the audit's own definition. */
const inAuthoredLayer = new Set<string>([
  ...BRIDGES.flatMap((b) => [b.from, b.to]),
  ...SEED_STRUCTURES.flatMap((s) => s.mappings.map((m) => m.slug)),
  ...SEA_SEED_RELATIONS.flatMap((r) => [r.anchor, r.reactor]),
  ...Object.keys(INTERIORS),
  ...Object.keys(INTERIORS_2),
]);

const slugs = new Set(FRONTIERS.map((f) => f.slug));

/** The sources a caller supplies. The module value-imports nothing on purpose. */
const sourcesFor = (p: StructureProposal) => ({
  structure: SEED_STRUCTURES.find((s) => s.id === p.structureId)!,
  depth: (FRONTIERS.find((f) => f.slug === p.slug)?.depth ?? {}) as Record<string, never>,
});

describe('structure proposals', () => {
  it('has proposals to check at all', () => {
    // The population guard. Every assertion below is a for-loop over this list,
    // and an empty list satisfies all of them — "no violations found" would be
    // indistinguishable from "nothing was checked".
    expect(STRUCTURE_PROPOSALS.length).toBeGreaterThan(0);
    expect(inAuthoredLayer.size).toBeGreaterThan(100);
    expect(slugs.size).toBeGreaterThan(300);
  });

  it('resolves every pointer against the human-authored sources', () => {
    // The whole design rests on proposals being pointers rather than copies.
    // If a quantity is renumbered in `structures.ts` or a depth array is
    // reordered, this must fail rather than silently resolve to a neighbour.
    for (const p of STRUCTURE_PROPOSALS) {
      expect(() => resolveProposal(p, sourcesFor(p)), `${p.slug} → ${p.structureId}`).not.toThrow();
    }
  });

  it('throws rather than drifting when a pointer no longer addresses anything', () => {
    // The guarantee is "an index either resolves or throws". Without this the
    // assertion above passes for a resolver that silently substitutes — and a
    // proposal that quietly changes what it claims is worse than one that fails.
    const p = STRUCTURE_PROPOSALS[0]!;
    const s = sourcesFor(p);
    expect(() => resolveProposal({ ...p, quantity: { mapping: 99, correspondence: 0 } }, s)).toThrow(/no mapping 99/);
    expect(() => resolveProposal({ ...p, quantity: { ...p.quantity, correspondence: 99 } }, s)).toThrow(/no correspondence 99/);
    expect(() => resolveProposal(p, { ...s, depth: {} })).toThrow(/not bilingual text/);
    expect(() => resolveProposal({ ...p, structureId: 'struct://xfrontier/nope' }, s)).toThrow(/expected/);
  });

  it('quotes only text that exists verbatim in the sources it points at', () => {
    for (const p of STRUCTURE_PROPOSALS) {
      const r = resolveProposal(p, sourcesFor(p));
      const structure = SEED_STRUCTURES.find((s) => s.id === p.structureId)!;
      const authoredQuantities = structure.mappings
        .flatMap((m) => m.correspondences.map((c) => c.quantity.zh));
      expect(authoredQuantities, `${p.slug}: quantity must be one the structure already authored`)
        .toContain(r.quantity.zh);

      const island = FRONTIERS.find((f) => f.slug === p.slug)!;
      const field: unknown = (island.depth as Record<string, unknown> | undefined)?.[p.evidence.field];
      const authoredTexts = Array.isArray(field)
        ? (field as { zh: string }[]).map((t) => t.zh)
        : [(field as { zh: string }).zh];
      expect(authoredTexts, `${p.slug}: evidence must be the island's own text`)
        .toContain(r.evidence.text.zh);
    }
  });

  it('proposes only for islands that are actually inert', () => {
    // A proposal for an island that already has an authored relation spends a
    // reviewer on a problem that is already solved, and inflates the queue with
    // work that cannot reduce the 222.
    const misplaced = STRUCTURE_PROPOSALS
      .filter((p) => inAuthoredLayer.has(p.slug))
      .map((p) => `${p.slug} (already in an authored layer)`);
    expect(misplaced).toEqual([]);
  });

  it('proposes only for islands that exist', () => {
    const unknown = STRUCTURE_PROPOSALS.filter((p) => !slugs.has(p.slug)).map((p) => p.slug);
    expect(unknown).toEqual([]);
  });

  it('never duplicates a pairing, and never restates an authored mapping', () => {
    const seen = new Set<string>();
    for (const p of STRUCTURE_PROPOSALS) {
      const key = `${p.slug}::${p.structureId}`;
      expect(seen.has(key), `duplicate proposal ${key}`).toBe(false);
      seen.add(key);
      const structure = SEED_STRUCTURES.find((s) => s.id === p.structureId)!;
      expect(structure.mappings.map((m) => m.slug), `${key} is already an authored mapping`)
        .not.toContain(p.slug);
    }
  });

  it('carries both kinds of relation, and only those two', () => {
    // The population guard for the second kind. Without it, every assertion
    // about `breaks` below would pass on a list that contains none — and the
    // negative proposals are the ones most likely to be quietly dropped in a
    // later edit, because they read like rejected candidates.
    const kinds = new Set(STRUCTURE_PROPOSALS.map((p) => p.relation));
    expect([...kinds].sort()).toEqual(['breaks', 'embodies']);
    expect(STRUCTURE_PROPOSALS.filter((p) => p.relation === 'breaks').length).toBeGreaterThan(0);
    expect(STRUCTURE_PROPOSALS.filter((p) => p.relation === 'embodies').length).toBeGreaterThan(0);
  });

  it('keeps a `breaks` proposal off the mapping path entirely', () => {
    // A negative must never be reachable as a candidate mapping: ratifying one
    // means recording a GAP, not writing a mapping. If a future edit ever lets
    // a `breaks` slug also appear as `embodies` against the same structure,
    // the pair contradicts itself and one of them is wrong.
    const embodies = new Set(STRUCTURE_PROPOSALS.filter((p) => p.relation === 'embodies')
      .map((p) => `${p.slug}::${p.structureId}`));
    const contradictions = STRUCTURE_PROPOSALS
      .filter((p) => p.relation === 'breaks' && embodies.has(`${p.slug}::${p.structureId}`))
      .map((p) => `${p.slug} is proposed BOTH as embodying and as breaking ${p.structureId}`);
    expect(contradictions).toEqual([]);
  });

  it('states a check a reviewer can act on, in both languages', () => {
    for (const p of STRUCTURE_PROPOSALS) {
      // Long enough to name what has to be settled. A one-line `check` is how
      // this file would decay into "these two feel related", which is the
      // failure the whole selection rule was built to avoid.
      expect(p.check.zh.length, `${p.slug} check.zh`).toBeGreaterThan(40);
      expect(p.check.en.length, `${p.slug} check.en`).toBeGreaterThan(80);
      expect(p.proposedBy).toMatch(/^(did:|orcid:|github:)/);
      expect(p.proposedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('returns nothing for an island with no proposal', () => {
    const uncovered = FRONTIERS.find((f) => !STRUCTURE_PROPOSALS.some((p) => p.slug === f.slug))!;
    expect(proposalsFor(uncovered.slug)).toEqual([]);
    expect(structureIdsFor(uncovered.slug)).toEqual([]);
    // And something for one that has one — otherwise the line above passes for
    // a lookup that always returns empty.
    const covered = STRUCTURE_PROPOSALS[0]!.slug;
    expect(proposalsFor(covered).length).toBeGreaterThan(0);
    expect(structureIdsFor(covered).length).toBeGreaterThan(0);
  });
});

import { describe, expect, it } from 'vitest';
import { FRONTIERS } from '../src/frontiers';
import { SEA_SEED_RELATIONS, type SeaSeedRelation, type SeaVerb } from '../src/sea';

const BY_SLUG = new Map(FRONTIERS.map((frontier) => [frontier.slug, frontier]));
const WAVE_2_SLUGS = new Set(
  FRONTIERS.filter((frontier) => frontier.id >= 141 && frontier.id <= 176).map(
    (frontier) => frontier.slug,
  ),
);
const WAVE_2_RELATIONS = SEA_SEED_RELATIONS.filter(
  (relation) => WAVE_2_SLUGS.has(relation.anchor) || WAVE_2_SLUGS.has(relation.reactor),
);

const tupleOf = (relation: SeaSeedRelation) =>
  `${relation.anchor}|${relation.reactor}|${relation.verb}|${relation.artifact}`;
const bridgeGroupOf = (relation: SeaSeedRelation) =>
  `${relation.anchor}|${relation.artifact}`;

describe('Wave 2 sea expansion', () => {
  it('keeps every relation tuple unique and every endpoint on a real island', () => {
    const tuples = SEA_SEED_RELATIONS.map(tupleOf);
    expect(new Set(tuples).size).toBe(tuples.length);
    expect(new Set(SEA_SEED_RELATIONS.map((relation) => relation.rationale)).size).toBe(
      SEA_SEED_RELATIONS.length,
    );

    for (const relation of SEA_SEED_RELATIONS) {
      expect(BY_SLUG.has(relation.anchor), `${relation.anchor} anchor`).toBe(true);
      expect(BY_SLUG.has(relation.reactor), `${relation.reactor} reactor`).toBe(true);
      expect(
        relation.rationale.trim().split(/\s+/).length,
        `${tupleOf(relation)} needs a method/evidence rationale`,
      ).toBeGreaterThanOrEqual(8);
    }
  });

  it('references only artifacts that the anchor stage actually seeds', () => {
    for (const relation of SEA_SEED_RELATIONS) {
      const anchor = BY_SLUG.get(relation.anchor)!;
      const minimumStage = relation.artifact === 'publish' ? 3 : 2;
      expect(
        anchor.stage,
        `${relation.anchor} cannot anchor ${relation.artifact} at stage ${anchor.stage}`,
      ).toBeGreaterThanOrEqual(minimumStage);
    }
  });

  it('adds at least 18 events and connects a broad, cross-domain Wave 2 set', () => {
    expect(WAVE_2_RELATIONS.length).toBeGreaterThanOrEqual(18);

    const touched = new Set(
      WAVE_2_RELATIONS.flatMap((relation) => [relation.anchor, relation.reactor]).filter(
        (slug) => WAVE_2_SLUGS.has(slug),
      ),
    );
    expect(touched.size).toBeGreaterThanOrEqual(14);

    const crossDomain = WAVE_2_RELATIONS.filter(
      (relation) =>
        BY_SLUG.get(relation.anchor)!.domain !== BY_SLUG.get(relation.reactor)!.domain,
    );
    expect(crossDomain.length).toBeGreaterThanOrEqual(8);
  });

  it('carries signed evidence, lineage feedback, and both bridge maturities', () => {
    const verbs = new Set<SeaVerb>(WAVE_2_RELATIONS.map((relation) => relation.verb));
    expect(verbs).toEqual(
      new Set<SeaVerb>([
        'validate',
        'refute',
        'fork',
        'merge_back',
        'bridge_propose',
        'bridge_accept',
      ]),
    );

    // The current projection maps validate → affirm and refute → contest.
    expect(WAVE_2_RELATIONS.some((relation) => relation.verb === 'validate')).toBe(true);
    expect(WAVE_2_RELATIONS.some((relation) => relation.verb === 'refute')).toBe(true);

    const bridgeGroups = new Map<
      string,
      { proposals: SeaSeedRelation[]; accepts: SeaSeedRelation[] }
    >();
    for (const relation of SEA_SEED_RELATIONS) {
      if (relation.verb !== 'bridge_propose' && relation.verb !== 'bridge_accept') continue;
      const key = bridgeGroupOf(relation);
      const group = bridgeGroups.get(key) ?? { proposals: [], accepts: [] };
      if (relation.verb === 'bridge_propose') group.proposals.push(relation);
      else group.accepts.push(relation);
      bridgeGroups.set(key, group);
    }

    for (const [key, group] of bridgeGroups) {
      expect(group.proposals.length, `${key} bridge needs a proposal`).toBeGreaterThan(0);
      for (const accept of group.accepts) {
        expect(accept.reactor, `${key} accept must be emitted by its anchor`).toBe(
          accept.anchor,
        );
      }
    }

    const ratified = [...bridgeGroups.values()].filter(
      (group) => group.proposals.length > 0 && group.accepts.length > 0,
    );
    const proposed = [...bridgeGroups.values()].filter(
      (group) => group.proposals.length > 0 && group.accepts.length === 0,
    );
    expect(bridgeGroups.size).toBeGreaterThanOrEqual(3);
    expect(ratified.length).toBeGreaterThan(0);
    expect(proposed.length).toBeGreaterThan(0);
  });
});

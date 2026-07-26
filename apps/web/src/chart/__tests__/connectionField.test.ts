import { describe, expect, it } from 'vitest';
import { DATA } from '../../api/fallback';
import { fixtureSeaData } from '../../api/seaFallback';
import { fallbackStructureGraph, fallbackStructures } from '../../api/structureFallback';
import { BRIDGES } from '@frontier-isles/data/bridges';
import { SEED_STRUCTURES } from '@frontier-isles/data/structures';
import {
  buildConnectionField,
  buildConnectionTideSummary,
  projectConnectionMap,
  projectConnectionOverlay,
  searchConnectionProblems,
} from '../connectionField';

const sea = fixtureSeaData();
const field = buildConnectionField(
  fallbackStructures(),
  fallbackStructureGraph(),
  sea,
  DATA,
);

/** Every structure becomes a topic; only one landing on ≥2 distinct islands
 * becomes a convergence hub. Derived, not snapshotted — the seed catalog grows
 * as isomorphisms are aligned, and the rule is what these tests are about. */
const EXPECTED_TOPICS = SEED_STRUCTURES.length;
const EXPECTED_CONVERGENCES = SEED_STRUCTURES
  .filter((s) => new Set(s.mappings.map((m) => m.slug)).size >= 2).length;

describe('buildConnectionField', () => {
  it('fuses real multi-problem mechanism convergences without turning gaps into links', () => {
    expect(field.topics).toHaveLength(EXPECTED_TOPICS);
    expect(field.convergences).toHaveLength(EXPECTED_CONVERGENCES);
    const cascade = field.convergences.find((group) => group.structureId.endsWith('network-cascade'));
    expect(cascade?.members).toHaveLength(3);
    expect(cascade?.members.every((member) => member.mapping.boundary?.zh)).toBe(true);
    expect(field.convergences.some((group) => group.structureId.endsWith('scaling'))).toBe(false);
    expect(field.topics.find((topic) => topic.structureId.endsWith('scaling'))?.members).toHaveLength(0);
    expect(field.topics.find((topic) => topic.structureId.endsWith('synchronization'))?.members).toHaveLength(1);
  });

  it('keeps curated equations and ledger evidence/bridge/lineage as direct typed paths', () => {
    expect(field.paths.filter((path) => path.kind === 'mathematical')).toHaveLength(BRIDGES.length);
    expect(field.paths.filter((path) => path.kind === 'bridge')).toHaveLength(
      sea.currents.filter((current) => current.kind === 'bridge').length,
    );
    expect(field.paths.filter((path) => path.kind === 'evidence')).toHaveLength(
      sea.currents.filter((current) => current.kind === 'evidence' && current.sign === 'affirm').length,
    );
    expect(field.paths.filter((path) => path.kind === 'contradiction')).toHaveLength(
      sea.currents.filter((current) => current.kind === 'evidence' && current.sign === 'contest').length,
    );
    expect(field.paths.filter((path) => path.kind === 'lineage')).toHaveLength(
      sea.currents.filter((current) => current.kind === 'lineage').length,
    );
    expect(field.paths.filter((path) => path.source === 'ledger').every((path) => path.records.length > 0)).toBe(true);
    expect(field.paths.filter((path) => path.source === 'curated-math').every((path) => path.records.length === 0)).toBe(true);
  });

  it('preserves each ledger target and marks the offline response-body gap honestly', () => {
    const evidence = field.paths.find((path) => path.kind === 'evidence');
    expect(evidence?.records[0]).toMatchObject({
      action: 'validate',
      actor: 'github:seed',
      historical: true,
    });
    expect(evidence?.records[0]?.targetRef).toMatch(/^sha256:/);
    expect(evidence?.records[0]).not.toHaveProperty('responseBody');
  });

  it('uses a convergence hub model rather than fabricating pairwise mechanism paths', () => {
    const map = projectConnectionMap(field, 'mechanism');
    expect(map.convergences).toHaveLength(EXPECTED_CONVERGENCES);
    expect(map.paths).toHaveLength(0);
    expect(map.convergences.find((group) => group.id.endsWith('network-cascade'))?.memberSlugs).toHaveLength(3);
  });

  it('keeps the global atlas at aggregate tide scale until a real focus is chosen', () => {
    expect(projectConnectionOverlay(field, 'all', null)).toBeNull();
    const path = field.paths[0]!;
    const focused = projectConnectionOverlay(field, 'all', { type: 'path', id: path.id });
    expect(focused?.mode).toBe('focus');
    expect(focused?.paths.map((item) => item.id)).toEqual([path.id]);
    expect(new Set(focused?.memberSlugs)).toEqual(new Set([path.from.slug, path.to.slug]));
  });

  it('builds a four-domain tide summary from direct paths without inventing edges', () => {
    const summary = buildConnectionTideSummary(field);
    const crossDomainPaths = field.paths.filter((path) => path.from.domain !== path.to.domain);
    const summarizedPaths = summary.lanes.flatMap((lane) => lane.paths);
    expect(summarizedPaths).toHaveLength(crossDomainPaths.length);
    expect(new Set(summarizedPaths.map((path) => path.id))).toEqual(new Set(crossDomainPaths.map((path) => path.id)));
    expect(summary.topics.crossing + summary.topics.single + summary.topics.gap).toBe(field.topics.length);
    expect(summary.domains.reduce((sum, domain) => sum + domain.problemCount, 0)).toBe(field.problems.size);
    expect(summary.lanes.every((lane) =>
      lane.paths.every((path) => path.from.domain !== path.to.domain),
    )).toBe(true);
  });

  it('focuses a concrete problem only on recorded touching relations', () => {
    const map = projectConnectionMap(field, 'all', { type: 'problem', slug: 'self-learning-matter' });
    expect(map.mode).toBe('focus');
    expect(map.convergences.every((group) => group.memberSlugs.includes('self-learning-matter'))).toBe(true);
    expect(map.paths.every((path) => path.fromSlug === 'self-learning-matter' || path.toSlug === 'self-learning-matter')).toBe(true);
  });

  it('searches real problem titles/questions instead of structure vocabulary', () => {
    expect(searchConnectionProblems(field, '虚拟细胞', 'zh').map((problem) => problem.slug))
      .toContain('cell-digital-twins-virtual-cells');
  });
});

import { describe, expect, it } from 'vitest';
import { DATA } from '../../api/fallback';
import { fixtureSeaData } from '../../api/seaFallback';
import { fallbackStructureGraph, fallbackStructures } from '../../api/structureFallback';
import { buildConnectionField, projectConnectionMap, searchConnectionProblems } from '../connectionField';

const field = buildConnectionField(
  fallbackStructures(),
  fallbackStructureGraph(),
  fixtureSeaData(),
  DATA,
);

describe('buildConnectionField', () => {
  it('fuses four real multi-problem mechanism convergences without turning gaps into links', () => {
    expect(field.convergences).toHaveLength(4);
    const cascade = field.convergences.find((group) => group.structureId.endsWith('network-cascade'));
    expect(cascade?.members).toHaveLength(3);
    expect(cascade?.members.every((member) => member.mapping.boundary?.zh)).toBe(true);
    expect(field.convergences.some((group) => group.structureId.endsWith('scaling'))).toBe(false);
  });

  it('keeps curated equations and ledger evidence/bridge/lineage as direct typed paths', () => {
    expect(field.paths.filter((path) => path.kind === 'mathematical')).toHaveLength(3);
    expect(field.paths.filter((path) => path.kind === 'bridge')).toHaveLength(2);
    expect(field.paths.filter((path) => path.kind === 'evidence')).toHaveLength(2);
    expect(field.paths.filter((path) => path.kind === 'contradiction')).toHaveLength(2);
    expect(field.paths.filter((path) => path.kind === 'lineage')).toHaveLength(1);
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
    expect(map.convergences).toHaveLength(4);
    expect(map.paths).toHaveLength(0);
    expect(map.convergences.find((group) => group.id.endsWith('network-cascade'))?.memberSlugs).toHaveLength(3);
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

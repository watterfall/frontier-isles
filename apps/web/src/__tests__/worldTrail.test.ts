import { describe, expect, it } from 'vitest';
import { selectWorldTrail } from '../state/worldTrail';

const islands = [
  { slug: 'source', title: '源岛', question: '源问题' },
  { slug: 'target', title: '目标岛', question: '目标问题' },
];

describe('selectWorldTrail — continuous world projection', () => {
  it('projects floor over island while retaining the full place trail', () => {
    const result = selectWorldTrail({
      view: 'island',
      phase: 'island',
      islandSlug: 'target',
      islands,
      district: { slug: 'target', id: 'archive', label: '模型与数据' },
      floor: { slug: 'target', station: 'library', floorId: 'library:ground', label: '引文门厅' },
    });

    expect(result.location).toEqual({ kind: 'floor', slug: 'target', station: 'library', floorId: 'library:ground' });
    expect(result.placeTrail.map((segment) => segment.kind)).toEqual(['atlas', 'island', 'district', 'station', 'floor']);
    expect(result.fellBackToAtlas).toBe(false);
  });

  it('gives a workspace precedence without merging research and personal truth', () => {
    const result = selectWorldTrail({
      view: 'island',
      phase: 'island',
      islandSlug: 'target',
      islands,
      workspace: { kind: 'model', familyId: 'synchronization', title: '同步', sourceStructureId: 'struct://xfrontier/synchronization' },
      structureLensId: 'struct://xfrontier/synchronization',
      passageIntent: { structureId: 'struct://xfrontier/synchronization', islandSlug: 'source', targetIslandSlug: 'target' },
    });

    expect(result.location).toEqual({ kind: 'workspace', workspace: 'model' });
    expect(result.placeTrail.map((segment) => segment.kind)).toEqual(['atlas', 'island', 'workspace']);
    expect(result.activeResearchContext.map((item) => [item.kind, item.truth])).toEqual([
      ['structure', 'research'],
      ['passage', 'research'],
      ['model', 'personal'],
    ]);
  });

  it('uses the question bearing for L0.5 travel without calling it research evidence', () => {
    const result = selectWorldTrail({
      view: 'chart',
      phase: 'explore',
      islandSlug: null,
      courseIslandSlug: 'target',
      islands,
    });

    expect(result.location).toEqual({ kind: 'travel', courseSlug: 'target' });
    expect(result.placeTrail.map((segment) => segment.kind)).toEqual(['atlas', 'travel']);
    expect(result.activeResearchContext).toEqual([{ kind: 'course', label: '目标问题', truth: 'personal' }]);
  });

  it('falls back to L0 when an island target is stale and suppresses deeper layers', () => {
    const result = selectWorldTrail({
      view: 'island',
      phase: 'island',
      islandSlug: 'missing',
      islands,
      floor: { slug: 'missing', station: 'data', floorId: 'data:ground', label: '测量基底层' },
      workspace: { kind: 'passage', title: '连接验证', structureId: 'struct://missing' },
    });

    expect(result.location).toEqual({ kind: 'atlas' });
    expect(result.placeTrail).toEqual([{ kind: 'atlas' }]);
    expect(result.fellBackToAtlas).toBe(true);
  });
});

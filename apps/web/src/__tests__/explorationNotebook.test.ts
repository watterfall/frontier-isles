import { describe, expect, it } from 'vitest';
import type { IslandDatum } from '../api/fallback';
import { explorationReducer, initialExplorationSession, type WorldExplorerPose } from '../state/explorationSession';
import {
  EXPLORATION_NOTEBOOK_STORAGE_KEY,
  explorationNotebookMarkdown,
  loadExplorationNotebook,
  saveExplorationNotebook,
  type StorageLike,
} from '../state/explorationNotebook';

const pose: WorldExplorerPose = { x: 420, y: 260, facing: 'east', altitudeZ: 0.72, speed: 80, verticalSpeed: 0.2 };
const current = { id: 'a::b::bridge', fromSlug: 'a', toSlug: 'b', kind: 'bridge' as const, sign: 'neutral' as const, directed: true, maturity: 'ratified' as const, weight: 3 };
const intent = {
  structureId: 'struct://xfrontier/synchronization',
  islandSlug: 'a',
  islandOp: 'op://frontier-isles/prob/a',
  targetIslandSlug: 'b',
  targetIslandOp: 'op://frontier-isles/prob/b',
  passageKind: 'frontier' as const,
};
const receipt = {
  ...intent,
  refHash: `sha256:${'b'.repeat(64)}`,
  structureTitle: '耦合振子同步',
  correspondences: [{ quantity: '耦合强度', inThisSubstrate: '视觉强度' }],
  boundary: '视觉耦合不是电导更新。',
  prediction: '若成立，应出现临界转变。',
  evidenceRefs: ['doi:10.0000/frontier-isles-test'],
  completedAt: '2026-07-18T00:00:00.000Z',
};
const modelRun = {
  id: 'model-run-sync-1',
  familyId: 'synchronization' as const,
  substrateId: 'fireflies' as const,
  seed: 17,
  parameters: { count: 40, spread: 0.32, coupling: 2.4, dt: 0.04 },
  prediction: 'increase' as const,
  observation: { metric: 'coherence' as const, initial: 0.12, final: 0.91, steps: 360 },
  boundary: '这个相位模型没有表示萤火虫的空间遮挡和脉冲感知。',
  language: 'zh' as const,
  sourceStructureId: 'struct://xfrontier/synchronization',
  sourceProblemSlugs: ['a', 'b'],
  createdAt: '2026-07-18T02:00:00.000Z',
};
const islands: IslandDatum[] = [
  { id: 1, slug: 'a', n: { zh: '甲岛', en: 'Isle A' }, q: { zh: '甲问题？', en: 'Question A?' }, d: '数理', x: 0, y: 0, s: 1, st: 1, m: 1, a: 1, citation: { title: 'A', venue: 'Nature', year: 2025, url: 'https://example.com/a' } },
  { id: 2, slug: 'b', n: { zh: '乙岛', en: 'Isle B' }, q: { zh: '乙问题？', en: 'Question B?' }, d: '交叉', x: 1, y: 1, s: 1, st: 1, m: 1, a: 1 },
];

function memoryStorage(initial: string | null = null): StorageLike & { value: string | null } {
  return {
    value: initial,
    getItem(key) { return key === EXPLORATION_NOTEBOOK_STORAGE_KEY ? this.value : null; },
    setItem(key, value) { if (key === EXPLORATION_NOTEBOOK_STORAGE_KEY) this.value = value; },
  };
}

describe('exploration field notebook persistence', () => {
  it('round-trips durable research while resetting navigation to the atlas', () => {
    let session = explorationReducer(initialExplorationSession(), { type: 'enter-world', pose });
    session = explorationReducer(session, { type: 'set-course', slug: 'a' });
    session = explorationReducer(session, { type: 'inspect-island', slug: 'a' });
    session = explorationReducer(session, { type: 'sample-current', current });
    session = explorationReducer(session, { type: 'write-note', slug: 'a', text: 'Compare this bridge with B.' });
    session = explorationReducer(session, { type: 'begin-passage', intent });
    session = explorationReducer(session, { type: 'complete-passage', receipt });
    session = explorationReducer(session, { type: 'survey-district', slug: 'a', districtId: 'inquiry' });
    session = explorationReducer(session, { type: 'visit-building-floor', slug: 'a', station: 'questions', floorId: 'questions:open:0' });
    session = explorationReducer(session, { type: 'record-model-run', receipt: modelRun });
    const storage = memoryStorage();

    expect(saveExplorationNotebook(session, storage, '2026-07-16T00:00:00.000Z')).toBe(true);
    const restored = loadExplorationNotebook(storage);

    expect(restored).toMatchObject({
      phase: 'atlas',
      islandSlug: null,
      returnTo: 'atlas',
      courseIslandSlug: 'a',
      courseHistorySlugs: ['a'],
      visitedIslandSlugs: ['a', 'b'],
      sampledCurrents: [current],
      notes: { a: 'Compare this bridge with B.' },
      structureLensId: intent.structureId,
      passageIntent: null,
      completedPassages: [receipt],
      surveyedDistricts: { a: ['inquiry'] },
      visitedBuildingFloors: { 'a:questions': ['questions:open:0'] },
      modelRuns: [modelRun],
    });
    expect(restored.worldPose).toMatchObject({ x: 420, y: 260, facing: 'east', altitudeZ: 0.72, speed: 0, verticalSpeed: 0 });
  });

  it('falls back safely for corrupt or future-version data', () => {
    expect(loadExplorationNotebook(memoryStorage('{bad json'))).toEqual(initialExplorationSession());
    expect(loadExplorationNotebook(memoryStorage(JSON.stringify({ version: 99 })))).toEqual(initialExplorationSession());
  });

  it('migrates the existing v1 payload without dropping prior field research', () => {
    const legacy = memoryStorage(JSON.stringify({
      version: 1,
      savedAt: '2026-07-16T00:00:00.000Z',
      worldPose: pose,
      courseIslandSlug: 'a',
      courseHistorySlugs: ['a'],
      visitedIslandSlugs: ['a'],
      sampledCurrents: [current],
      notes: { a: 'legacy note' },
    }));
    const restored = loadExplorationNotebook(legacy);
    expect(restored).toMatchObject({
      courseIslandSlug: 'a',
      visitedIslandSlugs: ['a'],
      notes: { a: 'legacy note' },
      structureLensId: null,
      completedPassages: [],
      surveyedDistricts: {},
      visitedBuildingFloors: {},
      modelRuns: [],
    });
  });

  it('migrates the prior v2 passage payload with empty depth-survey state', () => {
    const legacy = memoryStorage(JSON.stringify({
      version: 2,
      savedAt: '2026-07-18T00:00:00.000Z',
      worldPose: pose,
      courseIslandSlug: null,
      courseHistorySlugs: [],
      visitedIslandSlugs: ['a'],
      sampledCurrents: [],
      notes: {},
      structureLensId: intent.structureId,
      structureDeparture: null,
      passageIntent: null,
      completedPassages: [receipt],
    }));
    const restored = loadExplorationNotebook(legacy);
    expect(restored.completedPassages).toEqual([receipt]);
    expect(restored.surveyedDistricts).toEqual({});
    expect(restored.visitedBuildingFloors).toEqual({});
    expect(restored.modelRuns).toEqual([]);
  });

  it('migrates the prior v3 district/floor notebook with empty model-run state', () => {
    const legacy = memoryStorage(JSON.stringify({
      version: 3,
      savedAt: '2026-07-18T01:00:00.000Z',
      worldPose: null,
      courseIslandSlug: null,
      courseHistorySlugs: [],
      visitedIslandSlugs: ['a'],
      sampledCurrents: [],
      notes: {},
      surveyedDistricts: { a: ['harbor', 'inquiry'] },
      visitedBuildingFloors: { 'a:questions': ['questions:open:0'] },
    }));
    const restored = loadExplorationNotebook(legacy);
    expect(restored.surveyedDistricts).toEqual({ a: ['harbor', 'inquiry'] });
    expect(restored.visitedBuildingFloors).toEqual({ 'a:questions': ['questions:open:0'] });
    expect(restored.modelRuns).toEqual([]);
  });

  it('exports the same routes, observations, sources, and currents as portable Markdown', () => {
    let session = explorationReducer(initialExplorationSession(), { type: 'remember-world-pose', pose });
    session = explorationReducer(session, { type: 'set-course', slug: 'a' });
    session = explorationReducer(session, { type: 'write-note', slug: 'a', text: '比较边界条件。' });
    session = explorationReducer(session, { type: 'sample-current', current });
    session = explorationReducer(session, { type: 'complete-passage', receipt });
    session = explorationReducer(session, { type: 'dock', slug: 'a', source: 'atlas' });
    session = explorationReducer(session, { type: 'survey-district', slug: 'a', districtId: 'inquiry' });
    session = explorationReducer(session, { type: 'visit-building-floor', slug: 'a', station: 'questions', floorId: 'questions:open:0' });
    session = explorationReducer(session, { type: 'record-model-run', receipt: modelRun });
    const markdown = explorationNotebookMarkdown(session, islands, 'zh', '2026-07-16T01:02:03.000Z');

    expect(markdown).toContain('# 问题群岛 · 考察札记');
    expect(markdown).toContain('甲岛 — 甲问题？');
    expect(markdown).toContain('个人观察: 比较边界条件。');
    expect(markdown).toContain('[Nature · 2025](https://example.com/a)');
    expect(markdown).toContain('甲岛 → 乙岛');
    expect(markdown).toContain('bridge/neutral/ratified');
    expect(markdown).toContain('## 岛内勘察图');
    expect(markdown).toContain('甲岛: 问题定位 → 问题与差异');
    expect(markdown).toContain('## 建筑楼层札记');
    expect(markdown).toContain('甲岛 · 建筑: 问题墙 — questions:open:0');
    expect(markdown).toContain('## 连接记录');
    expect(markdown).toContain('甲岛 → 乙岛');
    expect(markdown).toContain('耦合强度 ↦ 视觉强度');
    expect(markdown).toContain('重要差异 / 类比边界: 视觉耦合不是电导更新。');
    expect(markdown).toContain('doi:10.0000/frontier-isles-test');
    expect(markdown).toContain(receipt.refHash);
    expect(markdown).toContain('## 我亲手运行的模型');
    expect(markdown).toContain('以下是个人学习记录，不是研究证据');
    expect(markdown).toContain('萤火虫闪光');
    expect(markdown).toContain('整体同步程度');
    expect(markdown).toContain('整体同步程度 0.1200 → 0.9100 · 360 步');
    expect(markdown).toContain('这个相位模型没有表示萤火虫的空间遮挡和脉冲感知。');
    expect(markdown).toContain('`struct://xfrontier/synchronization`');
  });
});

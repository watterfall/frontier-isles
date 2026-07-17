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
    const storage = memoryStorage();

    expect(saveExplorationNotebook(session, storage, '2026-07-16T00:00:00.000Z')).toBe(true);
    const restored = loadExplorationNotebook(storage);

    expect(restored).toMatchObject({
      phase: 'atlas',
      islandSlug: null,
      returnTo: 'atlas',
      courseIslandSlug: 'a',
      courseHistorySlugs: ['a'],
      visitedIslandSlugs: ['a'],
      sampledCurrents: [current],
      notes: { a: 'Compare this bridge with B.' },
    });
    expect(restored.worldPose).toMatchObject({ x: 420, y: 260, facing: 'east', altitudeZ: 0.72, speed: 0, verticalSpeed: 0 });
  });

  it('falls back safely for corrupt or future-version data', () => {
    expect(loadExplorationNotebook(memoryStorage('{bad json'))).toEqual(initialExplorationSession());
    expect(loadExplorationNotebook(memoryStorage(JSON.stringify({ version: 99 })))).toEqual(initialExplorationSession());
  });

  it('exports the same routes, observations, sources, and currents as portable Markdown', () => {
    let session = explorationReducer(initialExplorationSession(), { type: 'remember-world-pose', pose });
    session = explorationReducer(session, { type: 'set-course', slug: 'a' });
    session = explorationReducer(session, { type: 'write-note', slug: 'a', text: '比较边界条件。' });
    session = explorationReducer(session, { type: 'sample-current', current });
    const markdown = explorationNotebookMarkdown(session, islands, 'zh', '2026-07-16T01:02:03.000Z');

    expect(markdown).toContain('# 问题群岛 · 考察札记');
    expect(markdown).toContain('甲岛 — 甲问题？');
    expect(markdown).toContain('个人观察: 比较边界条件。');
    expect(markdown).toContain('[Nature · 2025](https://example.com/a)');
    expect(markdown).toContain('甲岛 → 乙岛');
    expect(markdown).toContain('bridge/neutral/ratified');
  });
});

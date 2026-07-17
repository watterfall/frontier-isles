import { describe, expect, it } from 'vitest';
import { explorationReducer, initialExplorationSession, type WorldExplorerPose } from '../state/explorationSession';

const pose: WorldExplorerPose = { x: 420, y: 260, facing: 'east' };

describe('global exploration session', () => {
  it('enters a world-level exploration field without selecting an island', () => {
    const state = explorationReducer(initialExplorationSession(), { type: 'enter-world', pose });
    expect(state).toMatchObject({ phase: 'explore', islandSlug: null, worldPose: pose, returnTo: 'explore' });
  });

  it('logs an inspected island once without turning it into a score', () => {
    let state = explorationReducer(initialExplorationSession(), { type: 'enter-world' });
    state = explorationReducer(state, { type: 'inspect-island', slug: 'isle-a' });
    state = explorationReducer(state, { type: 'inspect-island', slug: 'isle-a' });
    expect(state.visitedIslandSlugs).toEqual(['isle-a']);
  });

  it('keeps a sampled ledger current as world memory across docking and return', () => {
    let state = explorationReducer(initialExplorationSession(), { type: 'enter-world', pose });
    const current = { id: 'a::b::evidence', fromSlug: 'a', toSlug: 'b', kind: 'evidence' as const, sign: 'affirm' as const, directed: true, weight: 2 };
    state = explorationReducer(state, { type: 'sample-current', current });
    state = explorationReducer(state, { type: 'sample-current', current });
    state = explorationReducer(state, { type: 'dock', slug: 'isle-a', source: 'explore', pose });
    state = explorationReducer(state, { type: 'return-world' });
    expect(state.sampledCurrents).toEqual([current]);
  });

  it('holds an intentional research course until the craft docks', () => {
    let state = explorationReducer(initialExplorationSession(), { type: 'enter-world', pose });
    state = explorationReducer(state, { type: 'set-course', slug: 'isle-question' });
    expect(state.courseIslandSlug).toBe('isle-question');
    state = explorationReducer(state, { type: 'dock', slug: 'isle-question', source: 'explore', pose });
    expect(state.courseIslandSlug).toBeNull();
    expect(state.courseHistorySlugs).toEqual(['isle-question']);
  });

  it('keeps a bounded personal observation with the surveyed island', () => {
    let state = explorationReducer(initialExplorationSession(), { type: 'write-note', slug: 'isle-a', text: 'Follow the unresolved boundary case.' });
    expect(state.notes).toEqual({ 'isle-a': 'Follow the unresolved boundary case.' });
    expect(state.visitedIslandSlugs).toEqual(['isle-a']);
    state = explorationReducer(state, { type: 'write-note', slug: 'isle-a', text: '' });
    expect(state.notes).toEqual({});
  });

  it('returns from an exploration docking to the same global field pose', () => {
    let state = explorationReducer(initialExplorationSession(), { type: 'enter-world', pose });
    state = explorationReducer(state, { type: 'dock', slug: 'isle-a', source: 'explore', pose });
    expect(state).toMatchObject({ phase: 'island', islandSlug: 'isle-a', returnTo: 'explore', worldPose: pose });
    state = explorationReducer(state, { type: 'return-world' });
    expect(state).toMatchObject({ phase: 'explore', islandSlug: null, worldPose: pose });
  });

  it('keeps direct atlas docking as a fast path back to the atlas', () => {
    let state = explorationReducer(initialExplorationSession(), { type: 'dock', slug: 'isle-b', source: 'atlas' });
    expect(state.returnTo).toBe('atlas');
    state = explorationReducer(state, { type: 'return-atlas' });
    expect(state.phase).toBe('atlas');
  });
});

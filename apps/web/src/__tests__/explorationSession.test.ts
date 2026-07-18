import { describe, expect, it } from 'vitest';
import { explorationReducer, initialExplorationSession, type WorldExplorerPose } from '../state/explorationSession';

const pose: WorldExplorerPose = { x: 420, y: 260, facing: 'east' };
const departure = {
  structureId: 'struct://xfrontier/synchronization',
  islandSlug: 'isle-a',
  islandOp: 'op://frontier-isles/prob/isle-a',
};
const intent = {
  ...departure,
  targetIslandSlug: 'isle-b',
  targetIslandOp: 'op://frontier-isles/prob/isle-b',
  passageKind: 'frontier' as const,
};
const receipt = {
  ...intent,
  refHash: `sha256:${'a'.repeat(64)}`,
  structureTitle: '耦合振子同步',
  correspondences: [{ quantity: '耦合强度', inThisSubstrate: '视觉强度' }],
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
  createdAt: '2026-07-18T02:00:00.000Z',
};

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
    expect(state.surveyedDistricts).toEqual({ 'isle-b': ['harbor'] });
    state = explorationReducer(state, { type: 'return-atlas' });
    expect(state.phase).toBe('atlas');
  });

  it('persists unique district surveys and building floors without inventing ledger progress', () => {
    let state = explorationReducer(initialExplorationSession(), { type: 'dock', slug: 'isle-a', source: 'atlas' });
    state = explorationReducer(state, { type: 'survey-district', slug: 'isle-a', districtId: 'inquiry' });
    state = explorationReducer(state, { type: 'survey-district', slug: 'isle-a', districtId: 'inquiry' });
    state = explorationReducer(state, { type: 'visit-building-floor', slug: 'isle-a', station: 'questions', floorId: 'questions:open:0' });
    state = explorationReducer(state, { type: 'visit-building-floor', slug: 'isle-a', station: 'questions', floorId: 'questions:open:0' });
    expect(state.surveyedDistricts).toEqual({ 'isle-a': ['harbor', 'inquiry'] });
    expect(state.visitedBuildingFloors).toEqual({ 'isle-a:questions': ['questions:open:0'] });
    expect(state.sampledCurrents).toEqual([]);
    expect(state.completedPassages).toEqual([]);
  });

  it('keeps one authored passage continuous across lens, dock, completion, and return', () => {
    let state = explorationReducer(initialExplorationSession(), {
      type: 'select-structure',
      structureId: departure.structureId,
    });
    state = explorationReducer(state, { type: 'select-passage-departure', departure });
    state = explorationReducer(state, { type: 'begin-passage', intent });
    state = explorationReducer(state, { type: 'dock', slug: intent.targetIslandSlug, source: 'atlas' });
    expect(state).toMatchObject({ phase: 'island', structureLensId: departure.structureId, passageIntent: intent });
    state = explorationReducer(state, { type: 'complete-passage', receipt });
    state = explorationReducer(state, { type: 'return-atlas' });
    expect(state).toMatchObject({
      phase: 'atlas',
      structureLensId: departure.structureId,
      structureDeparture: departure,
      passageIntent: null,
    });
    expect(state.completedPassages).toEqual([receipt]);
    expect(state.visitedIslandSlugs).toContain('isle-b');
  });

  it('changing the lens clears a departure and intent from the previous structure', () => {
    let state = explorationReducer(initialExplorationSession(), { type: 'begin-passage', intent });
    state = explorationReducer(state, { type: 'select-structure', structureId: 'struct://xfrontier/scaling' });
    expect(state.structureDeparture).toBeNull();
    expect(state.passageIntent).toBeNull();
  });

  it('keeps model runs as local learner records without changing graph or island progress', () => {
    let state = explorationReducer(initialExplorationSession(), { type: 'record-model-run', receipt: modelRun });
    state = explorationReducer(state, { type: 'record-model-run', receipt: modelRun });
    expect(state.modelRuns).toEqual([modelRun]);
    expect(state.completedPassages).toEqual([]);
    expect(state.sampledCurrents).toEqual([]);
    expect(state.visitedIslandSlugs).toEqual([]);
  });
});

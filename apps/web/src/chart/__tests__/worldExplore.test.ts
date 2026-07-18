import { describe, expect, it } from 'vitest';
import {
  createWorldMotion,
  moveWorldExplorer,
  researchFieldRelation,
  researchTransectProgress,
  researchTransectStage,
  restoredWorldEncounter,
  selectWorldEncounter,
  selectWorldCurrentEncounter,
  stepWorldMotion,
  worldAltitudeBand,
  worldAltitudeInstruction,
  worldCanSurvey,
  worldCanSampleCurrent,
  worldCameraIsSettled,
  worldEncounterStrength,
  worldMotionIsIdle,
} from '../worldExplore';

const bounds = { minX: 0, minY: 0, maxX: 100, maxY: 100 };

describe('world explorer movement', () => {
  it('normalizes diagonal movement and faces its dominant direction', () => {
    const next = moveWorldExplorer({ x: 50, y: 50, facing: 'north' }, { x: 1, y: 1 }, 10, bounds);
    expect(Math.hypot(next.x - 50, next.y - 50)).toBeCloseTo(10);
    expect(next.facing).toBe('east');
  });

  it('clamps the vessel to the navigable archipelago field', () => {
    expect(moveWorldExplorer({ x: 96, y: 5, facing: 'east' }, { x: 1, y: -1 }, 20, bounds)).toMatchObject({ x: 100, y: 0 });
  });

  it('accelerates, banks and looks ahead instead of teleporting at fixed speed', () => {
    const start = createWorldMotion({ x: 50, y: 50, facing: 'east' });
    const moving = stepWorldMotion(start, { x: 0, y: -1 }, 1 / 30, bounds);
    expect(moving.pose.speed).toBeGreaterThan(0);
    expect(moving.pose.y).toBeLessThan(50);
    expect(moving.heading).toBeLessThan(0);
    expect(moving.bank).toBeLessThan(0);
    expect(moving.camera.centerY).toBeLessThan(50);
  });

  it('keeps ticking through inertia, then settles to a true idle state', () => {
    let state = createWorldMotion({ x: 50, y: 50, facing: 'east' });
    for (let i = 0; i < 20; i++) state = stepWorldMotion(state, { x: 1, y: 0 }, 1 / 60, bounds);
    const releasedAt = state.pose.x;
    state = stepWorldMotion(state, { x: 0, y: 0 }, 1 / 60, bounds);
    expect(state.pose.x).toBeGreaterThan(releasedAt);
    expect(worldMotionIsIdle(state)).toBe(false);
    for (let i = 0; i < 240; i++) state = stepWorldMotion(state, { x: 0, y: 0 }, 1 / 60, bounds);
    expect(worldMotionIsIdle(state)).toBe(true);
  });

  it('turns an approaching island into continuous focus instead of a camera cut', () => {
    const start = createWorldMotion({ x: 50, y: 50, facing: 'east' });
    const focusBounds = { minX: 0, minY: 0, maxX: 400, maxY: 400 };
    const far = { x: 210, y: 0, distance: 320 };
    const near = { x: 210, y: 0, distance: 168 };
    expect(worldEncounterStrength(far)).toBe(0);
    expect(worldEncounterStrength(near)).toBe(1);

    const focused = stepWorldMotion(start, { x: 0, y: 0 }, 1 / 30, focusBounds, near);
    expect(focused.camera.centerX).toBeGreaterThan(start.camera.centerX);
    expect(focused.camera.centerY).toBeLessThan(start.camera.centerY);
    expect(focused.camera.scale).toBeGreaterThan(start.camera.scale);
    expect(worldCameraIsSettled(focused, near)).toBe(false);
  });

  it('locks an acquired signal across a denser crossing, then releases it outside the field', () => {
    const island = (slug: string, distance: number) => ({
      slug, name: slug, distance, horizontalDistance: distance, altitude: 'middle' as const, altitudeZ: 0.5, altitudeDelta: 0, x: 0, y: 0,
    });
    expect(selectWorldEncounter([island('new-nearest', 90), island('locked', 150)], 'locked')?.slug).toBe('locked');
    expect(selectWorldEncounter([island('new-nearest', 90), island('locked', 380)], 'locked')?.slug).toBe('new-nearest');
    expect(selectWorldEncounter([island('far', 400)], null)).toBeNull();
  });

  it('relocks a restored safety-boundary pose to its original isle in a dense field', () => {
    const island = (slug: string, horizontalDistance: number, altitudeDelta = 0) => ({
      slug,
      name: slug,
      distance: Math.hypot(horizontalDistance, altitudeDelta * 180),
      horizontalDistance,
      altitude: 'middle' as const,
      altitudeZ: 0.5,
      altitudeDelta,
      x: 0,
      y: 0,
    });
    const field = [island('closer-neighbour', 90), island('settled-owner', 104.2)];
    expect(restoredWorldEncounter(field)?.slug).toBe('settled-owner');
    expect(restoredWorldEncounter([island('open-ocean-signal', 132)])).toBeNull();
    expect(restoredWorldEncounter([island('wrong-stratum', 104, 0.3)])).toBeNull();
  });

  it('locks a real current crossing and samples only when route height aligns', () => {
    const current = (id: string, distance: number, horizontalDistance = distance, altitudeDelta = 0) => ({
      id,
      fromSlug: 'a',
      toSlug: 'b',
      kind: 'evidence' as const,
      sign: 'affirm' as const,
      directed: true,
      weight: 1,
      tint: 0x2e5e8c,
      distance,
      horizontalDistance,
      altitudeZ: 0.5,
      altitudeDelta,
      progress: 0.5,
      x: 0,
      y: 0,
      tangentX: 1,
      tangentY: 0,
    });
    expect(selectWorldCurrentEncounter([current('new', 42), current('locked', 96)], 'locked')?.id).toBe('locked');
    expect(selectWorldCurrentEncounter([current('new', 42), current('locked', 160)], 'locked')?.id).toBe('new');
    expect(worldCanSampleCurrent(current('aligned', 44, 44, 0.08))).toBe(true);
    expect(worldCanSampleCurrent(current('wrong-height', 44, 44, 0.24))).toBe(false);
  });

  it('keeps an explicit question course ahead of a nearer incidental signal', () => {
    const island = (slug: string, distance: number) => ({
      slug, name: slug, distance, horizontalDistance: distance, altitude: 'middle' as const, altitudeZ: 0.5, altitudeDelta: 0, x: 0, y: 0,
    });
    const field = [island('incidental', 92), island('chosen-question', 740)];
    expect(selectWorldEncounter(field, null, undefined, undefined, 'chosen-question')?.slug).toBe('chosen-question');
  });

  it('turns course distance into a stable research transect', () => {
    expect(researchTransectStage(760)).toBe('bearing');
    expect(researchTransectStage(300)).toBe('field');
    expect(researchTransectStage(168)).toBe('survey');
    expect(researchTransectStage(760, true)).toBe('surveyed');
    expect(researchTransectProgress(1200)).toBe(0);
    expect(researchTransectProgress(168)).toBe(1);
    expect(researchTransectProgress(1600)).toBe(0);
  });

  it('describes only atlas-backed field topology between questions', () => {
    expect(researchFieldRelation(
      { domain: '生命科学', clusterCode: 'bio-life' },
      { domain: '生命科学', clusterCode: 'bio-life' },
    )).toBe('same-cluster');
    expect(researchFieldRelation(
      { domain: '生命科学', clusterCode: 'bio-life' },
      { domain: '生命科学', clusterCode: 'bio-eco' },
    )).toBe('same-domain');
    expect(researchFieldRelation(
      { domain: '生命科学', clusterCode: 'bio-life' },
      { domain: '数学', clusterCode: 'math-complexity' },
    )).toBe('cross-domain');
  });

  it('makes altitude a controllable survey constraint instead of decoration', () => {
    let state = createWorldMotion({ x: 50, y: 50, facing: 'east', altitudeZ: 0.5 });
    for (let i = 0; i < 120; i++) state = stepWorldMotion(state, { x: 0, y: 0, z: 1 }, 1 / 60, bounds);
    expect(state.pose.altitudeZ).toBeGreaterThan(0.75);
    expect(worldAltitudeBand(state.pose.altitudeZ ?? 0)).toBe('high');
    expect(worldAltitudeInstruction(0.28)).toBe('climb');
    expect(worldAltitudeInstruction(-0.28)).toBe('descend');
    expect(worldCanSurvey({ horizontalDistance: 120, altitudeDelta: 0.08 })).toBe(true);
    expect(worldCanSurvey({ horizontalDistance: 120, altitudeDelta: 0.3 })).toBe(false);
  });

  it('treats an aligned floating isle as physical space while allowing other strata to pass', () => {
    const field = { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };
    const target = { x: 500, y: 500, distance: 200, horizontalDistance: 200, altitudeDelta: 0 };
    let aligned = createWorldMotion({ x: 300, y: 500, facing: 'east', altitudeZ: 0.5 });
    for (let i = 0; i < 180; i++) aligned = stepWorldMotion(aligned, { x: 1, y: 0 }, 1 / 60, field, target);
    expect(Math.hypot(aligned.pose.x - target.x, aligned.pose.y - target.y)).toBeGreaterThanOrEqual(103.9);

    let above = createWorldMotion({ x: 300, y: 500, facing: 'east', altitudeZ: 0.9 });
    const belowTarget = { ...target, altitudeDelta: -0.4 };
    for (let i = 0; i < 180; i++) above = stepWorldMotion(above, { x: 1, y: 0 }, 1 / 60, field, belowTarget);
    expect(above.pose.x).toBeGreaterThan(target.x);
  });
});

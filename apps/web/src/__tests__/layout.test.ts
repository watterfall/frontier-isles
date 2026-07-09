/**
 * Layout v0 pipeline tests (M1-DESIGN §6). Proves the headless
 * `descriptor → SceneGraph` step: deterministic, correctly layered, depth keys
 * ordered, and the day/night visibility path wired for ghosts.
 */
import { describe, expect, it } from 'vitest';
import { buildSceneGraph, type LayoutInput } from '../scene/layout';

const base: LayoutInput = {
  slug: 'machine-curiosity',
  domain: '数理',
  stage: 2,
  members: 3,
  dormant: false,
  status: 'active',
  outlier: false,
  eventCount: 24,
};

describe('buildSceneGraph', () => {
  it('is deterministic for the same input', () => {
    const a = buildSceneGraph(base);
    const b = buildSceneGraph(base);
    expect(a).toEqual(b);
  });

  it('emits a ground bed on the terrain layer, all inside the island disc', () => {
    const g = buildSceneGraph(base);
    const terrain = g.objects.filter((o) => o.layer === 'terrain');
    expect(terrain.length).toBeGreaterThan(60); // a filled disc, not a handful
    expect(terrain.every((o) => o.kind === 'ground')).toBe(true);
    expect(terrain.every((o) => o.elevation === 0)).toBe(true); // M1: no elevation yet
  });

  it('places only the stage-visible stations', () => {
    const g = buildSceneGraph(base);
    const stations = g.objects.filter((o) => o.kind.startsWith('station:'));
    // stage 2 → all 9 stations visible
    expect(stations).toHaveLength(9);
    const empty = buildSceneGraph({ ...base, stage: 0 });
    const emptyStations = empty.objects.filter((o) => o.kind.startsWith('station:'));
    expect(emptyStations.map((o) => o.kind).sort()).toEqual(['station:dock', 'station:questions']);
  });

  it('binds claim count to eventCount (reproductions → floors)', () => {
    const few = buildSceneGraph({ ...base, eventCount: 0 }).objects.filter((o) => o.kind === 'claim');
    const many = buildSceneGraph({ ...base, eventCount: 24 }).objects.filter((o) => o.kind === 'claim');
    expect(few).toHaveLength(0);
    expect(many.length).toBeGreaterThan(0);
    expect(many.every((o) => o.growth && o.growth.foundation)).toBe(true);
  });

  it('makes ghosts night-only (the day/night visibility path, P4)', () => {
    const g = buildSceneGraph({ ...base, eventCount: 40 });
    const ghosts = g.objects.filter((o) => o.kind.startsWith('ghost:'));
    expect(ghosts.length).toBeGreaterThan(0);
    expect(ghosts.every((o) => o.dayVisibility === 0 && o.nightVisibility === 1)).toBe(true);
    // Non-ghosts are day-visible.
    const stations = g.objects.filter((o) => o.kind.startsWith('station:'));
    expect(stations.every((o) => o.dayVisibility === 1)).toBe(true);
  });

  it('orders depth keys so a nearer tile draws later (higher zIndex)', () => {
    const g = buildSceneGraph(base);
    const back = g.objects.find((o) => o.id === 'station:questions')!; // gy=4 (back)
    const front = g.objects.find((o) => o.id === 'station:dock')!; // gy=15 (front)
    expect(front.depthKey).toBeGreaterThan(back.depthKey);
  });

  it('carries the day↔night slider t through unchanged', () => {
    expect(buildSceneGraph(base, 0).t).toBe(0);
    expect(buildSceneGraph(base, 0.5).t).toBe(0.5);
    expect(buildSceneGraph(base, 1).t).toBe(1);
  });

  it('tags every object with the island biome', () => {
    const g = buildSceneGraph({ ...base, domain: '生命' });
    expect(g.objects.every((o) => o.biome === '生命')).toBe(true);
  });
});

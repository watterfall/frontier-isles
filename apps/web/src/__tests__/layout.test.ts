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

  it('emits a ground bed on the terrain layer with a 3-level height field', () => {
    const g = buildSceneGraph(base);
    const terrain = g.objects.filter((o) => o.layer === 'terrain');
    expect(terrain.length).toBeGreaterThan(60); // a filled island, not a handful
    expect(terrain.every((o) => o.kind === 'ground')).toBe(true);
    expect(terrain.every((o) => o.elevation === 0 || o.elevation === 1 || o.elevation === 2)).toBe(true);
    expect(terrain.some((o) => o.elevation > 0)).toBe(true); // M4.1: real elevation
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

  it('drives claim buildings from projectClaimState when claims are given (M4.3)', () => {
    const claims = [
      { ref: 'sha256:a', island: 'op://x', foundation: true, floors: 5, roof: true, hasDoi: false, activity: 6 },
      { ref: 'sha256:b', island: 'op://x', foundation: true, floors: 1, roof: false, hasDoi: false, activity: 2 },
      { ref: 'sha256:c', island: 'op://x', foundation: true, floors: 0, roof: false, ghost: 'refuted' as const, hasDoi: false, activity: 2 },
    ];
    const g = buildSceneGraph(base, 0, claims);
    const cs = g.objects.filter((o) => o.kind === 'claim');
    expect(cs).toHaveLength(3);
    // Height binds to floors: the 5-floor claim is taller than the 1-floor one.
    const byId = (i: number) => cs.find((o) => o.id === `claim:${i}`)!;
    expect(byId(0).height!).toBeGreaterThan(byId(1).height!);
    expect(byId(0).growth).toMatchObject({ floors: 5, roof: true });
    // The refuted claim is a night-only ghost (day 0 / night 1).
    expect(byId(2)).toMatchObject({ dayVisibility: 0, nightVisibility: 1 });
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

  it('marks a station active only when core.projectActiveStations says so (M8 micro-dynamics)', () => {
    const active = new Set<'workshop' | 'data'>(['workshop']);
    const g = buildSceneGraph(base, 0, undefined, active);
    const workshop = g.objects.find((o) => o.id === 'station:workshop')!;
    const gallery = g.objects.find((o) => o.id === 'station:gallery')!;
    expect(workshop.active).toBe(true);
    expect(gallery.active).toBe(false);
    // Omitted activeStations → every station defaults to inactive, never undefined
    // ambiguity (the renderer treats `active` as a strict boolean gate).
    const noActivity = buildSceneGraph(base);
    expect(noActivity.objects.filter((o) => o.kind.startsWith('station:')).every((o) => o.active === false)).toBe(true);
  });
});

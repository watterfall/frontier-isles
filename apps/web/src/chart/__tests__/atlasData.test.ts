import { describe, it, expect } from 'vitest';
import { buildAtlasScene, toAtlasInput } from '../atlasData';
import { DATA } from '../../api/fallback';

describe('toAtlasInput', () => {
  it('carries the editorial zh name and chart coords verbatim (invariant 9/13)', () => {
    const d = DATA[0]!;
    const i = toAtlasInput(d);
    expect(i.name).toBe(d.n.zh);
    expect(i.x).toBe(d.x);
    expect(i.y).toBe(d.y);
    expect(i.slug).toBe(d.slug ?? `id-${d.id}`);
  });

  it('derives status from resolved/dormant flags, discrete never continuous', () => {
    const resolved = toAtlasInput({ ...DATA[0]!, res: true, dor: false });
    const dormant = toAtlasInput({ ...DATA[0]!, res: false, dor: true });
    const active = toAtlasInput({ ...DATA[0]!, res: false, dor: false });
    expect(resolved.status).toBe('resolved');
    expect(dormant.status).toBe('dormant');
    expect(active.status).toBe('active');
  });
});

describe('buildAtlasScene — the default L0 atlas data wiring (atlas-world-plan.md W1)', () => {
  it('maps every curated island and produces at least one named cluster', () => {
    const scene = buildAtlasScene();
    expect(scene.islands.length).toBe(DATA.length);
    expect(scene.clusters.length).toBeGreaterThan(0);
    // every cluster is a real named archipelago, not an empty placeholder
    for (const c of scene.clusters) {
      expect(c.islandSlugs.length).toBeGreaterThan(0);
      expect(c.name.length).toBeGreaterThan(0);
    }
  });

  it('every island belongs to exactly a cluster XOR the outlier float (never both, never neither)', () => {
    const scene = buildAtlasScene();
    const clustered = new Set(scene.clusters.flatMap((c) => c.islandSlugs));
    for (const i of scene.islands) {
      const inCluster = clustered.has(i.slug);
      expect(inCluster === i.outlier).toBe(false); // never both true
      expect(inCluster || i.outlier).toBe(true); // never both false
    }
  });

  it('editorial outliers (fallback `out: true`) always float, never folded into a cluster', () => {
    const scene = buildAtlasScene();
    const editorialOutlierSlugs = new Set(DATA.filter((d) => d.out).map((d) => d.slug ?? `id-${d.id}`));
    if (editorialOutlierSlugs.size === 0) return; // nothing to assert if the curated set has none
    for (const i of scene.islands) {
      if (editorialOutlierSlugs.has(i.slug)) expect(i.outlier).toBe(true);
    }
  });

  it('is deterministic (same input ⇒ same clusters/outliers) — no Date.now/Math.random', () => {
    const a = buildAtlasScene();
    const b = buildAtlasScene();
    expect(a.clusters.map((c) => c.id).sort()).toEqual(b.clusters.map((c) => c.id).sort());
    expect(a.islands.map((i) => i.outlier)).toEqual(b.islands.map((i) => i.outlier));
  });

  it('appends `extra` fake islands (the ?n= scale test) without touching the real set', () => {
    const fake = { slug: 'fake-0', name: '岛屿0', domain: '交叉' as const, stage: 0, status: 'active', dormant: false, outlier: false, eventCount: 1, x: 5000, y: 10 };
    const scene = buildAtlasScene(undefined, [fake]);
    expect(scene.islands.length).toBe(DATA.length + 1);
    expect(scene.islands.some((i) => i.slug === 'fake-0')).toBe(true);
  });
});

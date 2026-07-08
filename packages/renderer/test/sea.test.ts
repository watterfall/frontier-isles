import { describe, expect, it } from 'vitest';
import {
  domainHueAt,
  seaDepthAt,
  layoutCurrents,
  CURRENT_LOD,
  SEA_DEPTH_MAX_ALPHA,
  DOMAIN_ANCHORS,
  type CurrentLike,
  type Vec2,
} from '../src/sea';

describe('domainHueAt — bilinear over the four --fi-domain-* anchors', () => {
  it('each corner is a pure region weighted 1', () => {
    expect(domainHueAt([0, 0]).weights.math).toBe(1);
    expect(domainHueAt([1, 0]).weights.matter).toBe(1);
    expect(domainHueAt([0, 1]).weights.life).toBe(1);
    expect(domainHueAt([1, 1]).weights.cross).toBe(1);
    expect(domainHueAt([0, 0]).dominant).toBe('math');
    expect(domainHueAt([1, 1]).dominant).toBe('cross');
  });

  it('the center is an even four-way blend', () => {
    const w = domainHueAt([0.5, 0.5]).weights;
    for (const k of ['math', 'matter', 'life', 'cross'] as const) expect(w[k]).toBeCloseTo(0.25);
  });

  it('weights are a partition of unity and interpolate monotonically', () => {
    const m = domainHueAt([0.25, 0.75]);
    const sum = m.anchors.reduce((s, a) => s + a.weight, 0);
    expect(sum).toBeCloseTo(1);
    // nearer the life corner (0,1) than math (0,0)
    expect(m.weights.life).toBeGreaterThan(m.weights.math);
    expect(m.dominant).toBe('life');
  });

  it('returns token names, never a mixed hex (no new hue)', () => {
    for (const a of domainHueAt([0.3, 0.4]).anchors) {
      expect(a.token).toBe(DOMAIN_ANCHORS[a.key].token);
      expect(a.token.startsWith('--fi-domain-')).toBe(true);
    }
  });

  it('samples a paintable fill = the dominant region token (island hue by construction)', () => {
    // an island at a coord paints the SAME field function the sea blends toward
    expect(domainHueAt([1, 1]).fill).toBe('var(--fi-domain-cross-fill, #ECDFB4)');
    expect(domainHueAt([0, 0]).fill).toBe('var(--fi-domain-math-fill, #C9D8E6)');
    // a real token + fallback, never an invented hex
    expect(domainHueAt([0.3, 0.7]).fill).toMatch(/^var\(--fi-domain-[a-z]+-fill, #[0-9A-F]{6}\)$/);
  });

  it('clamps out-of-range coordinates', () => {
    expect(domainHueAt([-2, 5]).weights.life).toBe(1);
  });
});

describe('seaDepthAt — abstractness from a REAL substrate score, not the hue vec', () => {
  it('maps a substrate score to darkness (shallow→applied, deep→formal)', () => {
    expect(seaDepthAt(0).depth).toBe(0);
    expect(seaDepthAt(0).overlayAlpha).toBe(0);
    expect(seaDepthAt(1).depth).toBe(1);
    expect(seaDepthAt(1).overlayAlpha).toBeCloseTo(SEA_DEPTH_MAX_ALPHA);
  });

  it('returns null depth and NO darkness when there is no substrate score', () => {
    expect(seaDepthAt(undefined).depth).toBeNull();
    expect(seaDepthAt(undefined).overlayAlpha).toBe(0);
    expect(seaDepthAt(null).depth).toBeNull();
    expect(seaDepthAt(NaN).depth).toBeNull();
  });

  it('is monotonic and stays within the max darkening alpha', () => {
    expect(seaDepthAt(0.6).overlayAlpha).toBeGreaterThan(seaDepthAt(0.2).overlayAlpha);
    expect(seaDepthAt(1).overlayAlpha).toBeLessThanOrEqual(SEA_DEPTH_MAX_ALPHA);
  });
});

describe('layoutCurrents — splines + shared far-zoom trunk cull', () => {
  const positions: Record<string, Vec2> = { a: [0, 0], b: [100, 0], c: [50, 80] };
  const currents: CurrentLike[] = [
    { from: 'a', to: 'b', kind: 'evidence', weight: 5, directed: true },
    { from: 'a', to: 'c', kind: 'lineage', weight: 1, directed: true },
  ];

  it('emits an M…Q… path and bows parallel edges to alternating sides', () => {
    const paths = layoutCurrents(currents, positions);
    expect(paths).toHaveLength(2);
    expect(paths[0]!.d.startsWith('M 0 0 Q')).toBe(true);
    expect(paths[0]!.control[1]).not.toBe(paths[1]!.control[1]);
  });

  it('drops currents whose endpoints are unplaced', () => {
    const paths = layoutCurrents([{ from: 'a', to: 'zzz', kind: 'bridge', weight: 9, directed: false }], positions);
    expect(paths).toHaveLength(0);
  });

  it('far zoom keeps only trunk currents; near zoom keeps all', () => {
    expect(layoutCurrents(currents, positions).every((p) => p.visible)).toBe(true);
    const far = layoutCurrents(currents, positions, { zoom: CURRENT_LOD.farZoom - 0.2 });
    expect(far.find((p) => p.current.weight >= CURRENT_LOD.trunkMinWeight)!.visible).toBe(true);
    expect(far.find((p) => p.current.weight < CURRENT_LOD.trunkMinWeight)!.visible).toBe(false);
  });

  it('culls a 700-island field down to only its trunks at far zoom', () => {
    const pos: Record<string, Vec2> = {};
    const big: CurrentLike[] = [];
    for (let i = 0; i < 700; i++) {
      pos[`i${i}`] = [(i % 30) * 40, Math.floor(i / 30) * 40];
      // one weak branch current per island; a heavier trunk every 50th island
      big.push({ from: `i${i}`, to: `i${(i + 1) % 700}`, kind: 'evidence', weight: 1, directed: true });
      if (i % 50 === 0) {
        big.push({ from: `i${i}`, to: `i${(i + 25) % 700}`, kind: 'lineage', weight: 6, directed: true });
      }
    }
    const trunks = big.filter((c) => c.weight >= CURRENT_LOD.trunkMinWeight).length;
    const far = layoutCurrents(big, pos, { zoom: 0.2 });
    const shown = far.filter((p) => p.visible).length;
    expect(trunks).toBe(14);
    expect(shown).toBe(trunks);
    expect(shown).toBeLessThan(big.length / 10); // dramatic reduction from ~714 to 14
  });
});

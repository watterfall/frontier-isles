/**
 * Hue is manifold position (invariant 16) — but every caller used to sample the
 * manifold at `DOMAIN_CORNER[domain]`, i.e. at the categorical label restated as
 * a point. Same domain → identical coordinate → the "bilinear blend" never
 * blended: four flat colours in a manifold's costume.
 *
 * These pin the replacement. The properties that matter are not "it looks nicer"
 * but: a region's own interior stays its own colour (so the map does not shift
 * under people who know it), the space BETWEEN two regions genuinely reads as
 * between them, no fifth hue is ever minted, and an empty world says nothing
 * rather than defaulting to a colour.
 */
import { describe, expect, it } from 'vitest';
import { manifoldMixAt, MANIFOLD_IDW_POWER, type ManifoldSite } from '../src/sea';
import { blendTints, ATLAS_DOMAIN_FILL } from '../src/pixi/atlas-lod';

type D = '数理' | '物质' | '生命' | '交叉';
const SITES: ManifoldSite<D>[] = [
  { key: '数理', point: [0, 0] },
  { key: '物质', point: [100, 0] },
  { key: '生命', point: [0, 100] },
  { key: '交叉', point: [100, 100] },
];
const weightOf = (mix: ReturnType<typeof manifoldMixAt<D>>, key: D) =>
  mix!.weights.find((w) => w.key === key)!.weight;

describe('manifoldMixAt', () => {
  it('says nothing when there are no regions — absence beats a default hue', () => {
    expect(manifoldMixAt([10, 10], [])).toBeNull();
  });

  it('resolves a point sitting exactly on a region to that region, not to NaN', () => {
    const mix = manifoldMixAt<D>([0, 0], SITES);
    expect(mix!.dominant).toBe('数理');
    expect(weightOf(mix, '数理')).toBe(1);
    expect(weightOf(mix, '交叉')).toBe(0);
  });

  it('keeps a region’s own interior essentially pure — the familiar map does not shift', () => {
    const mix = manifoldMixAt<D>([8, 8], SITES);
    expect(mix!.dominant).toBe('数理');
    expect(weightOf(mix, '数理')).toBeGreaterThan(0.9);
  });

  it('reads the point between two regions as genuinely between them', () => {
    const mix = manifoldMixAt<D>([50, 0], SITES);
    expect(weightOf(mix, '数理')).toBeCloseTo(weightOf(mix, '物质'), 6);
    // and the two far regions must not dominate the pair the point sits between
    expect(weightOf(mix, '数理')).toBeGreaterThan(weightOf(mix, '生命'));
    expect(weightOf(mix, '数理')).toBeGreaterThan(weightOf(mix, '交叉'));
  });

  it('weights are normalised, finite and descending', () => {
    const mix = manifoldMixAt<D>([37, 61], SITES);
    const sum = mix!.weights.reduce((a, w) => a + w.weight, 0);
    expect(sum).toBeCloseTo(1, 9);
    for (const w of mix!.weights) expect(Number.isFinite(w.weight)).toBe(true);
    for (let i = 1; i < mix!.weights.length; i++) {
      expect(mix!.weights[i - 1]!.weight).toBeGreaterThanOrEqual(mix!.weights[i]!.weight);
    }
    expect(mix!.dominant).toBe(mix!.weights[0]!.key);
  });

  it('is deterministic — the same point always gives the same mixture', () => {
    const a = manifoldMixAt<D>([23, 71], SITES);
    const b = manifoldMixAt<D>([23, 71], SITES);
    expect(a).toEqual(b);
  });

  it('refuses degenerate geometry rather than painting an arbitrary region', () => {
    expect(manifoldMixAt<D>([Number.NaN, 0], SITES)).toBeNull();
    expect(manifoldMixAt<D>([Number.POSITIVE_INFINITY, 0], SITES)).toBeNull();
  });

  it('a higher exponent concentrates the mixture, it does not reorder it', () => {
    const soft = manifoldMixAt<D>([30, 30], SITES, 1);
    const hard = manifoldMixAt<D>([30, 30], SITES, 4);
    expect(hard!.dominant).toBe(soft!.dominant);
    expect(weightOf(hard, hard!.dominant)).toBeGreaterThan(weightOf(soft, soft!.dominant));
    expect(MANIFOLD_IDW_POWER).toBeGreaterThan(1);
  });
});

describe('blendTints', () => {
  const chan = (hex: number) => [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];

  it('returns null for no usable weight — nothing to say, so say nothing', () => {
    expect(blendTints([])).toBeNull();
    expect(blendTints([{ tint: 0xffffff, weight: 0 }])).toBeNull();
    expect(blendTints([{ tint: 0xffffff, weight: Number.NaN }])).toBeNull();
  });

  it('a single region blends to exactly itself — no drift at full weight', () => {
    expect(blendTints([{ tint: ATLAS_DOMAIN_FILL['生命'], weight: 1 }])).toBe(ATLAS_DOMAIN_FILL['生命']);
    // weight need not be normalised
    expect(blendTints([{ tint: ATLAS_DOMAIN_FILL['物质'], weight: 7.5 }])).toBe(ATLAS_DOMAIN_FILL['物质']);
  });

  it('never mints a fifth hue: every channel stays inside the inputs’ range', () => {
    const parts = (Object.keys(ATLAS_DOMAIN_FILL) as (keyof typeof ATLAS_DOMAIN_FILL)[])
      .map((k, i) => ({ tint: ATLAS_DOMAIN_FILL[k], weight: i + 1 }));
    const out = blendTints(parts)!;
    for (let c = 0; c < 3; c++) {
      const vals = parts.map((p) => chan(p.tint)[c]!);
      expect(chan(out)[c]).toBeGreaterThanOrEqual(Math.min(...vals));
      expect(chan(out)[c]).toBeLessThanOrEqual(Math.max(...vals));
    }
  });

  it('an equal blend of two domains lands between them on every channel', () => {
    const a = ATLAS_DOMAIN_FILL['数理'];
    const b = ATLAS_DOMAIN_FILL['物质'];
    const out = blendTints([{ tint: a, weight: 1 }, { tint: b, weight: 1 }])!;
    for (let c = 0; c < 3; c++) {
      // Channels are 8-bit integers, so a midpoint of x.5 must round somewhere;
      // within one step of the exact mean is the strongest true statement here.
      expect(Math.abs(chan(out)[c]! - (chan(a)[c]! + chan(b)[c]!) / 2)).toBeLessThanOrEqual(0.5);
    }
  });

  it('ignores zero-weight regions instead of dragging the mixture toward them', () => {
    const kept = blendTints([{ tint: ATLAS_DOMAIN_FILL['交叉'], weight: 1 }, { tint: 0x000000, weight: 0 }]);
    expect(kept).toBe(ATLAS_DOMAIN_FILL['交叉']);
  });
});

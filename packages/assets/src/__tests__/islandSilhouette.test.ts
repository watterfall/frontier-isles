import { describe, it, expect } from 'vitest';
import { hashSeed, islandSilhouettePath, STAGE_RADIUS } from '../chart/islandSilhouette';

/** Max |x| across every coordinate pair in a path `d` string — a cheap,
 * command-agnostic stand-in for "footprint radius". */
function maxAbsX(d: string): number {
  const nums = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  let m = 0;
  // every other number starting at index 0 is an x (M/L/C/Q all pair x,y);
  // simplest robust reading: just take the max magnitude over all numbers,
  // which for these squashed-ellipse shapes is always an x (rx > ry).
  for (const n of nums) m = Math.max(m, Math.abs(n));
  return m;
}

describe('hashSeed', () => {
  it('is deterministic — same string always yields the same number', () => {
    expect(hashSeed('living-wires')).toBe(hashSeed('living-wires'));
    expect(hashSeed('27')).toBe(hashSeed('27'));
  });

  it('differs across distinct inputs (no accidental collisions in this set)', () => {
    const seeds = new Set(['living-wires', 'dark-instrumentation', 'machine-curiosity', '1', '2', '3'].map(hashSeed));
    expect(seeds.size).toBe(6);
  });
});

describe('islandSilhouettePath — determinism (invariant 13)', () => {
  it('the same stage+seed always renders the identical path', () => {
    const opts = { stage: 2 as const, seed: hashSeed('bio-compute-thermo') };
    expect(islandSilhouettePath(opts)).toBe(islandSilhouettePath({ ...opts }));
  });

  it('every island (unique slug) gets a stable seed and thus a stable shape across renders', () => {
    for (const slug of ['living-wires', 'dark-instrumentation', 'compositional-modeling']) {
      const seed = hashSeed(slug);
      const a = islandSilhouettePath({ stage: 1, seed });
      const b = islandSilhouettePath({ stage: 1, seed });
      expect(a).toBe(b);
    }
  });

  it('different islands (different seeds) get visibly different coastlines', () => {
    const a = islandSilhouettePath({ stage: 2, seed: hashSeed('island-a') });
    const b = islandSilhouettePath({ stage: 2, seed: hashSeed('island-b') });
    expect(a).not.toBe(b);
  });
});

describe('islandSilhouettePath — rollback: one soft-mound grammar for every island', () => {
  // Design-authority rollback (see the header note in islandSilhouette.ts):
  // a previous version picked a different geometric "grammar" per domain
  // (straight polygon / stepped facets / smooth curve / straight+curve
  // hybrid). That was never authorized by the prototype and read as
  // "wrong, worse than the original" on user testing. These tests lock in
  // the fix: there is now exactly one family — a closed Catmull-Rom curve,
  // the same curve family as the prototype's own hand-drawn `MOUND_PATHS` —
  // and `domain` is no longer even an input to the silhouette function.

  it('every path is built only from soft-mound curve commands (M/C/Z) — no straight edges, ever', () => {
    for (const seed of [hashSeed('a'), hashSeed('b'), hashSeed('c'), 1, 42]) {
      for (const stage of [0, 1, 2, 3] as const) {
        const d = islandSilhouettePath({ stage, seed });
        expect(/^[MCZ0-9.\-\s]+$/.test(d)).toBe(true);
        expect(d).not.toMatch(/[LQ]/);
      }
    }
  });

  it('the silhouette function no longer accepts (or needs) a `domain` input', () => {
    // Compile-time guarantee too: SilhouetteOptions has no `domain` field —
    // this call would be a type error if `domain` were required again.
    const d = islandSilhouettePath({ stage: 2, seed: 1 });
    expect(d.length).toBeGreaterThan(0);
  });
});

describe('islandSilhouettePath — stage-bound size tiers (no continuous ranking)', () => {
  it('footprint radius grows strictly with stage, in exactly 4 discrete steps', () => {
    expect(STAGE_RADIUS).toHaveLength(4);
    for (let i = 1; i < STAGE_RADIUS.length; i++) {
      expect(STAGE_RADIUS[i]!).toBeGreaterThan(STAGE_RADIUS[i - 1]!);
    }
  });

  it('a school (stage 3) silhouette is visibly larger than an empty isle (stage 0), same seed', () => {
    const seed = hashSeed('same-island-across-stages');
    const empty = islandSilhouettePath({ stage: 0, seed });
    const school = islandSilhouettePath({ stage: 3, seed });
    expect(maxAbsX(school)).toBeGreaterThan(maxAbsX(empty));
  });

  it('stage is the only size driver — same stage, different seeds, comparable footprint radius', () => {
    const a = islandSilhouettePath({ stage: 1, seed: hashSeed('x') });
    const b = islandSilhouettePath({ stage: 1, seed: hashSeed('y') });
    // jitter (control points + aspect ratio) is bounded, so same-stage
    // footprints stay within a tight band — never spread out into a
    // continuous per-island ranking.
    expect(Math.abs(maxAbsX(a) - maxAbsX(b))).toBeLessThan(STAGE_RADIUS[1] * 0.25);
  });

  it('the cap tier (school second terrace) is always hut-sized, regardless of the base stage', () => {
    const seed = hashSeed('capped-school-island');
    const cap = islandSilhouettePath({ stage: 3, seed, tier: 'cap' });
    expect(maxAbsX(cap)).toBeLessThan(STAGE_RADIUS[3]);
    expect(maxAbsX(cap)).toBeLessThanOrEqual(STAGE_RADIUS[1] * 1.15);
  });
});

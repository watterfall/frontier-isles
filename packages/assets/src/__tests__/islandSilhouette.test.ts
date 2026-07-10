import { describe, it, expect } from 'vitest';
import {
  hashSeed,
  islandSilhouettePath,
  DOMAIN_GRAMMAR,
  STAGE_RADIUS,
  type CoastlineGrammar,
} from '../chart/islandSilhouette';
import type { Domain } from '../palettes';

const DOMAINS: Domain[] = ['数理', '物质', '生命', '交叉'];

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
  it('the same domain+stage+seed always renders the identical path', () => {
    const opts = { domain: '生命' as Domain, stage: 2 as const, seed: hashSeed('bio-compute-thermo') };
    expect(islandSilhouettePath(opts)).toBe(islandSilhouettePath({ ...opts }));
  });

  it('every island (unique slug) gets a stable seed and thus a stable shape across renders', () => {
    for (const slug of ['living-wires', 'dark-instrumentation', 'compositional-modeling']) {
      const seed = hashSeed(slug);
      const a = islandSilhouettePath({ domain: '物质', stage: 1, seed });
      const b = islandSilhouettePath({ domain: '物质', stage: 1, seed });
      expect(a).toBe(b);
    }
  });

  it('different islands (different seeds) get visibly different coastlines', () => {
    const a = islandSilhouettePath({ domain: '生命', stage: 2, seed: hashSeed('island-a') });
    const b = islandSilhouettePath({ domain: '生命', stage: 2, seed: hashSeed('island-b') });
    expect(a).not.toBe(b);
  });
});

describe('islandSilhouettePath — domain coastline grammar', () => {
  it('数理 is angular — a straight-edged polygon (only M/L/Z commands)', () => {
    const d = islandSilhouettePath({ domain: '数理', stage: 2, seed: 1 });
    expect(/^[MLZ0-9.\-\s]+$/.test(d)).toBe(true);
    expect(d).not.toMatch(/[CQ]/);
  });

  it('生命 is organic — a smooth curve built entirely from cubic Beziers', () => {
    const d = islandSilhouettePath({ domain: '生命', stage: 2, seed: 1 });
    expect(d).toMatch(/C/);
    expect(d).not.toMatch(/[LQ]/);
  });

  it('物质 is faceted — stepped polylines, twice the corners of a plain polygon', () => {
    const d = islandSilhouettePath({ domain: '物质', stage: 2, seed: 1 });
    const lCount = (d.match(/L/g) ?? []).length;
    expect(d).not.toMatch(/[CQ]/);
    // 6 base vertices × 2 corners per edge = 12 L commands
    expect(lCount).toBe(12);
  });

  it('交叉 is hybrid — alternates straight edges with curved bulges', () => {
    const d = islandSilhouettePath({ domain: '交叉', stage: 2, seed: 1 });
    expect(d).toMatch(/L/);
    expect(d).toMatch(/Q/);
  });

  it('all four domains produce a distinct grammar (no accidental overlap)', () => {
    const grammars = new Set(DOMAINS.map((dm) => DOMAIN_GRAMMAR[dm]));
    expect(grammars.size).toBe(4);
    const known: CoastlineGrammar[] = ['angular', 'organic', 'faceted', 'hybrid'];
    for (const g of grammars) expect(known).toContain(g);
  });

  it('the same seed+stage renders a different path per domain (shape follows domain, not just size)', () => {
    const seed = hashSeed('cross-cutting-example');
    const paths = DOMAINS.map((domain) => islandSilhouettePath({ domain, stage: 2, seed }));
    expect(new Set(paths).size).toBe(4);
  });
});

describe('islandSilhouettePath — stage-bound size tiers (no continuous ranking)', () => {
  it('footprint radius grows strictly with stage, in exactly 4 discrete steps', () => {
    expect(STAGE_RADIUS).toHaveLength(4);
    for (let i = 1; i < STAGE_RADIUS.length; i++) {
      expect(STAGE_RADIUS[i]!).toBeGreaterThan(STAGE_RADIUS[i - 1]!);
    }
  });

  it('a school (stage 3) silhouette is visibly larger than an empty isle (stage 0), same domain+seed', () => {
    const seed = hashSeed('same-island-across-stages');
    const empty = islandSilhouettePath({ domain: '物质', stage: 0, seed });
    const school = islandSilhouettePath({ domain: '物质', stage: 3, seed });
    expect(maxAbsX(school)).toBeGreaterThan(maxAbsX(empty));
  });

  it('stage is the only size driver — same stage, different seeds, comparable footprint radius', () => {
    const a = islandSilhouettePath({ domain: '生命', stage: 1, seed: hashSeed('x') });
    const b = islandSilhouettePath({ domain: '生命', stage: 1, seed: hashSeed('y') });
    // jitter is bounded (±11%), so same-stage footprints stay within a tight band —
    // never spread out into a continuous per-island ranking.
    expect(Math.abs(maxAbsX(a) - maxAbsX(b))).toBeLessThan(STAGE_RADIUS[1] * 0.25);
  });

  it('the cap tier (school second terrace) is always hut-sized, regardless of the base stage', () => {
    const seed = hashSeed('capped-school-island');
    const cap = islandSilhouettePath({ domain: '生命', stage: 3, seed, tier: 'cap' });
    expect(maxAbsX(cap)).toBeLessThan(STAGE_RADIUS[3]);
    expect(maxAbsX(cap)).toBeLessThanOrEqual(STAGE_RADIUS[1] * 1.15);
  });
});

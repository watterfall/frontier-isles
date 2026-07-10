import type { Domain } from '../palettes';

/**
 * L0 "terrain fingerprint" — deterministic procgen for the chart-island
 * silhouette (docs/depth-plan-v1.md §5, invariant 13: an island's *form* is a
 * pure function of its problem-object attributes, seeded by `hash(op-id)`;
 * the same object renders the same island on any client, forever).
 *
 * Two knobs, both discrete/deterministic — never a continuous rank:
 *  - `stage` (0..3, the growth-stage projection) drives footprint size —
 *    school > academy > hut > empty isle (§5 "the L0 form should pre-echo
 *    its L1 richness").
 *  - `domain` drives coastline *grammar* — "angular near 数理, organic near
 *    生命" (§5), 物质/交叉 given their own distinct grammar so all four read
 *    apart at a glance.
 * `seed` (caller passes `hashSeed(slug ?? String(id))`) only perturbs
 * control points within each grammar — stable per-island jitter, not
 * arbitrary noise (invariant 13).
 */

/** Deterministic 32-bit FNV-1a hash — the seed source for every per-island
 * jitter in this module. Same string in ⇒ same number out, forever. */
export function hashSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic PRNG (mulberry32) — same seed ⇒ same stream, forever.
 * No `Math.random` anywhere in the fingerprint path (invariant 13). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Coastline grammar, one per domain (§5: "angular near 数理, organic near
 * 生命"; 物质/交叉 given their own consistent voice so all four are
 * distinguishable in silhouette alone). */
export type CoastlineGrammar = 'angular' | 'organic' | 'faceted' | 'hybrid';

export const DOMAIN_GRAMMAR: Record<Domain, CoastlineGrammar> = {
  数理: 'angular', // straight-edged polygon — crisp, instrument-precise facets
  物质: 'faceted', // stepped/terraced rectilinear silhouette — cut rock, built matter
  生命: 'organic', // smooth flowing Catmull-Rom curve — lush, biological
  交叉: 'hybrid', // alternates straight + curved edges — literally in-between
};

const VERTEX_COUNT: Record<CoastlineGrammar, number> = {
  angular: 8,
  faceted: 6,
  organic: 10,
  hybrid: 8,
};

/** Discrete footprint radius per growth stage (0 empty isle .. 3 school).
 * Deliberately a small fixed table, not a formula over a continuous score —
 * size is a *transcription of stage*, never a rank (task red line). */
export const STAGE_RADIUS: readonly [number, number, number, number] = [34, 46, 58, 70];

const fmt = (n: number): string => (Math.round(n * 100) / 100).toString();

interface Pt {
  x: number;
  y: number;
}

/** Points around a squashed ellipse (rx, ry), each nudged by a stable
 * per-vertex jitter factor so the coastline is irregular but reproducible. */
function basePoints(n: number, rx: number, ry: number, rng: () => number, jitter: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const theta = (i / n) * Math.PI * 2 - Math.PI / 2;
    const j = 1 - jitter / 2 + rng() * jitter;
    pts.push({
      x: Math.cos(theta) * rx * j,
      y: Math.sin(theta) * ry * j - rx * 0.06,
    });
  }
  return pts;
}

/** 数理 angular — a plain straight-edged polygon. */
function polygonPath(pts: Pt[]): string {
  const [p0, ...rest] = pts;
  if (!p0) return '';
  let d = `M ${fmt(p0.x)} ${fmt(p0.y)} `;
  for (const p of rest) d += `L ${fmt(p.x)} ${fmt(p.y)} `;
  return d + 'Z';
}

/** 生命 organic — a smooth closed Catmull-Rom curve (converted to cubic
 * Beziers), the same curve family as the prototype's own hand-drawn mounds. */
function smoothPath(pts: Pt[]): string {
  const n = pts.length;
  const p0first = pts[0];
  if (!p0first) return '';
  let d = `M ${fmt(p0first.x)} ${fmt(p0first.y)} `;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]!;
    const p1 = pts[i]!;
    const p2 = pts[(i + 1) % n]!;
    const p3 = pts[(i + 2) % n]!;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C ${fmt(c1x)} ${fmt(c1y)} ${fmt(c2x)} ${fmt(c2y)} ${fmt(p2.x)} ${fmt(p2.y)} `;
  }
  return d + 'Z';
}

/** 物质 faceted — each edge gets one axis-aligned kink, blended partway
 * toward a full right-angle corner (deterministic per edge, seeded) rather
 * than snapping all the way to it — a terraced / cut-rock coastline, not a
 * staircase silhouette. */
function facetedPath(pts: Pt[], rng: () => number): string {
  const n = pts.length;
  const p0 = pts[0];
  if (!p0) return '';
  let d = `M ${fmt(p0.x)} ${fmt(p0.y)} `;
  for (let i = 0; i < n; i++) {
    const p1 = pts[i]!;
    const p2 = pts[(i + 1) % n]!;
    const stepFirst = rng() < 0.5;
    const cornerX = stepFirst ? p2.x : p1.x;
    const cornerY = stepFirst ? p1.y : p2.y;
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const blend = 0.5 + rng() * 0.25; // partial kink, not a full right-angle jump
    const kx = midX + (cornerX - midX) * blend;
    const ky = midY + (cornerY - midY) * blend;
    d += `L ${fmt(kx)} ${fmt(ky)} L ${fmt(p2.x)} ${fmt(p2.y)} `;
  }
  return d + 'Z';
}

/** 交叉 hybrid — alternates straight edges with outward-bulging quadratic
 * curves, literally splicing the angular and organic grammars together. */
function hybridPath(pts: Pt[], rng: () => number): string {
  const n = pts.length;
  const p0 = pts[0];
  if (!p0) return '';
  let d = `M ${fmt(p0.x)} ${fmt(p0.y)} `;
  for (let i = 0; i < n; i++) {
    const p1 = pts[i]!;
    const p2 = pts[(i + 1) % n]!;
    if (i % 2 === 0) {
      d += `L ${fmt(p2.x)} ${fmt(p2.y)} `;
    } else {
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const bulge = 0.15 + rng() * 0.1;
      const nx = -(p2.y - p1.y) * bulge;
      const ny = (p2.x - p1.x) * bulge;
      d += `Q ${fmt(mx + nx)} ${fmt(my + ny)} ${fmt(p2.x)} ${fmt(p2.y)} `;
    }
  }
  return d + 'Z';
}

export interface SilhouetteOptions {
  domain: Domain;
  /** Growth stage 0..3 — the size tier. */
  stage: 0 | 1 | 2 | 3;
  /** Stable per-island seed — pass `hashSeed(slug ?? String(id))`. */
  seed: number;
  /** 'cap' renders the small second-tier plateau a school-stage island
   * grows on top of its base mound (always hut-sized, regardless of `stage`). */
  tier?: 'base' | 'cap';
}

/** The whole L0 fingerprint entry point: `domain` + `stage` + `seed` in,
 * one deterministic closed SVG path out. */
export function islandSilhouettePath(opts: SilhouetteOptions): string {
  const grammar = DOMAIN_GRAMMAR[opts.domain];
  const isCap = opts.tier === 'cap';
  const rng = mulberry32(isCap ? opts.seed ^ 0x9e3779b9 : opts.seed);
  const rx = STAGE_RADIUS[isCap ? 1 : opts.stage];
  const ry = rx * 0.36;
  const n = VERTEX_COUNT[grammar];
  const pts = basePoints(n, rx, ry, rng, 0.22);
  switch (grammar) {
    case 'angular':
      return polygonPath(pts);
    case 'organic':
      return smoothPath(pts);
    case 'faceted':
      return facetedPath(pts, rng);
    case 'hybrid':
      return hybridPath(pts, rng);
  }
}

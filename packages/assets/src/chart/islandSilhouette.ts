/**
 * L0 "terrain fingerprint" — deterministic procgen for the chart-island
 * silhouette (docs/depth-plan-v1.md §5, invariant 13: an island's *form* is a
 * pure function of its problem-object attributes, seeded by `hash(op-id)`;
 * the same object renders the same island on any client, forever).
 *
 * --- ROLLBACK NOTE (design-authority violation, reverted on user feedback) ---
 * A prior version of this module gave each of the 4 domains its own
 * "coastline grammar" — 数理 a straight-edged polygon, 物质 a
 * stepped/faceted silhouette, 生命 a smooth curve, 交叉 alternating
 * straight+curved edges — so islands would read apart by silhouette alone
 * (this had been written up as a spec in docs/depth-plan-v1.md §5's "domain
 * vector → coastline character" row and docs/richness-plan.md's 泳道 G
 * checklist). That geometry was never authorized by
 * `design/handoff/问题群岛-原型 v3.dc.html` — the **sole visual authority**
 * (see repo CLAUDE.md) — which only ever draws one hand-drawn soft-mound
 * family (`const MOUNDS = [...]`, picked by `id % 5`; ported verbatim as
 * `MOUND_PATHS` in `../IslandMound.tsx`). Direct user testing confirmed the
 * angular/faceted shapes read as "wrong, worse than the original" — i.e. an
 * invented visual language, not a defensible extension of one.
 *
 * Rolled back: every island now renders from the SAME soft-mound grammar (a
 * closed Catmull-Rom curve — the same curve family as `MOUND_PATHS`, see
 * `moundPath` below). `seed` only perturbs control points and the aspect
 * ratio *within* that one family — it must never again select a different
 * geometric grammar. Domain is no longer a shape input at all; four-domain
 * legibility stays on channels the prototype actually uses — fill color
 * (`DOMAIN_META` / prototype's `DOMC`) and, upstream in `ChartScreen`'s
 * `Buildings`, growth-stage-driven building/vegetation density. Do not
 * reintroduce per-domain geometry without first updating the prototype —
 * the prototype leads, code follows, never the other way around.
 *
 * One knob drives size:
 *  - `stage` (0..3, the growth-stage projection) drives footprint size —
 *    school > academy > hut > empty isle (§5 "the L0 form should pre-echo
 *    its L1 richness"). A small fixed table, not a formula over a
 *    continuous score — size is a *transcription of stage*, never a rank
 *    (task red line).
 * `seed` (caller passes `hashSeed(slug ?? String(id))`) only perturbs
 * control points and aspect ratio — stable per-island jitter, not arbitrary
 * noise (invariant 13). Same stage+seed always renders the identical path.
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

/** Discrete footprint radius per growth stage (0 empty isle .. 3 school).
 * Deliberately a small fixed table, not a formula over a continuous score —
 * size is a *transcription of stage*, never a rank (task red line). */
export const STAGE_RADIUS: readonly [number, number, number, number] = [34, 46, 58, 70];

const fmt = (n: number): string => (Math.round(n * 100) / 100).toString();

interface Pt {
  x: number;
  y: number;
}

/** One soft-mound family, one vertex count — matches the hand-drawn feel of
 * the prototype's `MOUND_PATHS` (6-8 control points per mound) closely
 * enough that the Catmull-Rom pass below reads as "the same kind of blob". */
const VERTEX_COUNT = 9;

/** Per-vertex jitter magnitude — bounded so every island reads as "the same
 * soft mound, nudged", never a different shape language (rollback note
 * above). */
const JITTER = 0.22;

/** Points around a squashed ellipse (rx, ry), each nudged by a stable
 * per-vertex jitter factor so the coastline is irregular but reproducible —
 * plus a small constant upward bias so the mound sits like the prototype's
 * (flatter base, rounded top), matching `MOUND_PATHS`' asymmetry. */
function basePoints(rx: number, ry: number, rng: () => number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < VERTEX_COUNT; i++) {
    const theta = (i / VERTEX_COUNT) * Math.PI * 2 - Math.PI / 2;
    const j = 1 - JITTER / 2 + rng() * JITTER;
    pts.push({
      x: Math.cos(theta) * rx * j,
      y: Math.sin(theta) * ry * j - rx * 0.06,
    });
  }
  return pts;
}

/** The one coastline grammar: a smooth closed Catmull-Rom curve (converted
 * to cubic Beziers) — the same curve family as the prototype's own
 * hand-drawn `MOUND_PATHS` mounds. */
function moundPath(pts: Pt[]): string {
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

export interface SilhouetteOptions {
  /** Growth stage 0..3 — the size tier. */
  stage: 0 | 1 | 2 | 3;
  /** Stable per-island seed — pass `hashSeed(slug ?? String(id))`. */
  seed: number;
  /** 'cap' renders the small second-tier plateau a school-stage island
   * grows on top of its base mound (always hut-sized, regardless of `stage`). */
  tier?: 'base' | 'cap';
}

/** The whole L0 fingerprint entry point: `stage` + `seed` in, one
 * deterministic closed SVG path out — always the same soft-mound grammar
 * (rollback note above; there is deliberately no `domain` input here
 * anymore — four-domain legibility lives in fill color and building/
 * vegetation density, not in coastline geometry). */
export function islandSilhouettePath(opts: SilhouetteOptions): string {
  const isCap = opts.tier === 'cap';
  const rng = mulberry32(isCap ? opts.seed ^ 0x9e3779b9 : opts.seed);
  // Small per-island aspect-ratio variation ("宽高比小幅变化") — every island
  // stays within the same squashed-mound proportions, just not pixel-identical
  // ones.
  const aspect = 0.3 + rng() * 0.1;
  const rx = STAGE_RADIUS[isCap ? 1 : opts.stage];
  const ry = rx * aspect;
  const pts = basePoints(rx, ry, rng);
  return moundPath(pts);
}

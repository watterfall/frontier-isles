/**
 * Deterministic de-overlap for L0 chart island positions.
 *
 * Island chart coordinates are hand-authored literals (the curated frontiers in
 * `@frontier-isles/data` + the bespoke sample in `api/fallback.ts`). They
 * already collide today (e.g. the sample sits ~62px from #27) and nothing
 * spaces them. `spaceIslands()` relaxes the authored positions apart to a
 * minimum centre distance with **no RNG**, so the arrangement stays stable and
 * every future-added island is spaced automatically. Pure + memo-friendly.
 *
 * This is step (a) of the canvas-scaling plan (see ROADMAP §3.11 / Phase C):
 * a real layout pass, ahead of zoom/pan + LOD generalization at atlas scale.
 */

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface SpaceOptions {
  /** Minimum centre-to-centre distance at scale 1 (px). Scaled per-pair by island size. */
  minDist?: number;
  /** Relaxation iterations (deterministic; stops early once nothing moves). */
  iterations?: number;
  /** Keep-within box = chart viewBox minus margins for the top chrome + captions. */
  bounds?: Bounds;
}

export interface Placed {
  x: number;
  y: number;
  /** Chart scale of the glyph (bigger islands claim more room). Defaults to 1. */
  s?: number;
}

/** viewBox is 0 0 1440 900; leave room for the top chrome and the name caption below each mound. */
const DEFAULT_BOUNDS: Bounds = { minX: 120, minY: 170, maxX: 1320, maxY: 760 };
// A mound's hit radius is ~70 at scale 1, so per-pair spacing of minDist×(sa+sb)/2
// keeps edges apart when minDist ≥ 150 (= sum of radii + a small gap).
const DEFAULT_MIN_DIST = 150;
const DEFAULT_ITERATIONS = 600;
/** Golden angle — a stable per-index direction to break exact coincidences without RNG. */
const GOLDEN_ANGLE = 2.399963229728653;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/**
 * Push overlapping islands apart. Returns a NEW array (same order, same fields)
 * with adjusted `x`/`y`. Larger islands (bigger `s`) reserve proportionally
 * more room. Deterministic: identical input always yields identical output.
 *
 * Float64Arrays keep the hot loop allocation-free; values are read into locals
 * so the `noUncheckedIndexedAccess`-flavoured `number | undefined` stays out of
 * the arithmetic.
 */
export function spaceIslands<T extends Placed>(items: T[], opts: SpaceOptions = {}): T[] {
  const minDist = opts.minDist ?? DEFAULT_MIN_DIST;
  const iterations = opts.iterations ?? DEFAULT_ITERATIONS;
  const b = opts.bounds ?? DEFAULT_BOUNDS;
  const n = items.length;

  const xs = Float64Array.from(items, (it) => it.x);
  const ys = Float64Array.from(items, (it) => it.y);
  const ss = Float64Array.from(items, (it) => it.s ?? 1);

  for (let iter = 0; iter < iterations; iter++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const xi = xs[i]!;
        const yi = ys[i]!;
        const xj = xs[j]!;
        const yj = ys[j]!;
        let dx = xj - xi;
        let dy = yj - yi;
        let dist = Math.hypot(dx, dy);
        if (dist < 1e-6) {
          // exact (or near-exact) coincidence → separate along a stable direction
          const ang = i * GOLDEN_ANGLE;
          dx = Math.cos(ang);
          dy = Math.sin(ang);
          dist = 1;
        }
        const need = minDist * ((ss[i]! + ss[j]!) / 2);
        if (dist < need) {
          const push = (need - dist) / 2;
          const ux = (dx / dist) * push;
          const uy = (dy / dist) * push;
          xs[i] = xi - ux;
          ys[i] = yi - uy;
          xs[j] = xj + ux;
          ys[j] = yj + uy;
          moved = true;
        }
      }
    }
    for (let k = 0; k < n; k++) {
      xs[k] = clamp(xs[k]!, b.minX, b.maxX);
      ys[k] = clamp(ys[k]!, b.minY, b.maxY);
    }
    if (!moved) break;
  }

  return items.map((it, k) => ({
    ...it,
    x: Math.round(xs[k]! * 100) / 100,
    y: Math.round(ys[k]! * 100) / 100,
  }));
}

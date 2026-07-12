/**
 * Undertow contention curve (海即数据, R6 Lever 2).
 *
 * Maps the count of unresolved-refute claims (`ghost === 'refuted'`) to the
 * sea-shader `uUndertow` magnitude in [0, 1]. Kept a pure function so the
 * transfer is unit-testable in node, independent of the WebGL shader.
 *
 * Why this shape (not the old `min(1, refuted * 0.5)`): the old curve saturated
 * at 2 refutes (2 → 1.0, so 2/3/4 were indistinguishable) and gave a single
 * refute only 0.5. The recalibration below — validated by Gen-B's per-pixel
 * simulation, which showed the shader gain (fbm 4-octave, real max ≈ 0.858)
 * never lets the old app curve read at real magnitude — gives:
 *   0 → 0.00 (explicit zero: a calm sea NEVER swirls)
 *   1 → 0.60 (a single dispute already reads)
 *   2 → 0.80
 *   3 → 1.00 (capped; consensus-breaking contention is maxed)
 *   n≥3 → 1.00
 * Monotonic non-decreasing, with the explicit zero preserved.
 */
export function contentionFromRefuted(refuted: number): number {
  if (refuted <= 0) return 0;
  return Math.min(1, 0.6 + (refuted - 1) * 0.2);
}

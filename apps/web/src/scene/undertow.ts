/**
 * Undertow contention curve (海即数据, R6 Lever 2).
 *
 * Maps the count of ever-refuted claims (`ghost === 'refuted'`) to the sea-shader
 * `uUndertow` magnitude in [0, 1]. NOTE: `refuted` is a one-way flag — a single
 * `refute` event sets it permanently and no ledger action resolves it (no
 * resolution verb exists yet; whether to add one is an R7 semantic question), so
 * this reads "ever-refuted", not "currently-disputed". Kept a pure function so the
 * transfer is unit-testable in node, independent of the WebGL shader.
 *
 * Why this shape (not the old `min(1, refuted * 0.5)`): the old curve saturated
 * at 2 refutes (2 → 1.0, so 2/3/4 were indistinguishable) and gave a single
 * refute only 0.5, which — combined with the shader's under-open swirl mask —
 * left disputed seas hard to read. The recalibration (shader band + this curve,
 * R6 Lever 2) gives:
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

/**
 * The SINGLE source for undertow magnitude (R7 Dim 1): the number of refuted
 * (ghost) CLAIMS — `ghost === 'refuted'`. This is deliberately NOT the count of
 * `refute` ledger EVENTS: the undertow reads refuted claims, so the sea's decoder
 * legend must read this exact quantity too. Both the shader input
 * (`contentionFromRefuted(refutedClaimCount(...))`) and the on-screen readout are
 * fed from here, so decoder and sea can never silently diverge (H1+H5 near-lie).
 */
export function refutedClaimCount(claims: readonly { readonly ghost?: string }[] | null | undefined): number {
  if (!claims) return 0;
  return claims.filter((c) => c.ghost === 'refuted').length;
}

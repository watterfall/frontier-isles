/**
 * Renderer colour constants that carry SEMANTICS distinct from the domain palette.
 * Kept in one module so a value that must NOT collide with any domain ink has a
 * single, testable source shared by the renderer and its tests.
 */

/**
 * DOI publication seal ink (R7 ride-along A). A dedicated deep burnt-sienna,
 * distinct from all four domain inks — in particular from 物质's 0xb5673a, which
 * the seal previously reused verbatim, so a published seal was pixel-identical to
 * a matter-domain mark. Mirrors design token `--fi-seal-doi` in
 * packages/assets/src/tokens.css.
 *
 * NOMINATED value (R7): euclidean-distinct from every palette ink/fill (nearest is
 * 物质 ink at ~45). The design side may retune the exact hue in review; keep this
 * constant and the token in lock-step if it changes.
 */
export const DOI_SEAL_INK = 0xa8481c;

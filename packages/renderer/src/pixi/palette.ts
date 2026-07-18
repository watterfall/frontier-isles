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
 * NOMINATED value (R7, deepened in the §3.15 AA pass so it stays >40 from the
 * AA-darkened domain inks — nearest is 物质 ink 0x9c5932 at ~47). The design side
 * may retune the exact hue in review; keep this constant and the token in
 * lock-step if it changes.
 */
export const DOI_SEAL_INK = 0x863a16;

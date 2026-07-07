/**
 * Shared <defs> block for a `<svg viewBox="0 0 1440 900">` scene root.
 * Copied verbatim from the L1 island (`#isogrid`, `#lgrad`, `#groundClip`,
 * `#grain1`) and L0 chart (`#outGlow`, `#vig`, `#grain0`) artboards.
 *
 * `#grain0` and `#grain1` in the prototype are byte-for-byte identical
 * (same feTurbulence/feColorMatrix), so they are collapsed here into one
 * `#fi-grain` filter referenced by both L0 and L1 pieces.
 *
 * Mount once per `<svg>` via `<SceneDefs />` before any geometry that
 * references `url(#isogrid)`, `url(#lgrad)`, `url(#groundClip)`,
 * `url(#fi-grain)`, `url(#outGlow)`, or `url(#vig)`.
 */
export function SceneDefs() {
  return (
    <defs>
      {/* L1 · isometric grid wash over the ground plane */}
      <pattern id="isogrid" width="96" height="48" patternUnits="userSpaceOnUse">
        <path d="M 0 0 L 96 48 M 0 48 L 96 0" stroke="var(--gline,rgba(43,38,32,0.08))" strokeWidth="0.75" fill="none" />
      </pattern>

      {/* L1 · lantern / focus glow */}
      <radialGradient id="lgrad">
        <stop offset="0%" stopColor="#F5B94B" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#F5B94B" stopOpacity="0" />
      </radialGradient>

      {/* L1 · clips the isogrid rect to the diamond ground plane */}
      <clipPath id="groundClip">
        <polygon points="760,210 1288,474 760,738 232,474" />
      </clipPath>

      {/* L0 · outlier / anomaly glow */}
      <radialGradient id="outGlow">
        <stop offset="0%" stopColor="#E3A93C" stopOpacity="0.6" />
        <stop offset="55%" stopColor="#E3A93C" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#E3A93C" stopOpacity="0" />
      </radialGradient>

      {/* L0 · chart vignette */}
      <radialGradient id="vig" cx="50%" cy="46%" r="72%">
        <stop offset="62%" stopColor="#605034" stopOpacity="0" />
        <stop offset="100%" stopColor="#605034" stopOpacity="0.13" />
      </radialGradient>

      {/* L0 (#grain0) + L1 (#grain1) · shared paper-grain filter */}
      <filter id="fi-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.24  0 0 0 0 0.21  0 0 0 0 0.16  0 0 0 0.05 0" />
      </filter>
    </defs>
  );
}

/** Full-bleed 1440×900 paper-grain overlay — `<rect filter="url(#fi-grain)">` from both L0 and L1. */
export function GrainOverlay({ opacity = 0.8 }: { opacity?: number }) {
  return (
    <rect x="0" y="0" width="1440" height="900" filter="url(#fi-grain)" style={{ pointerEvents: 'none' }} opacity={opacity} />
  );
}

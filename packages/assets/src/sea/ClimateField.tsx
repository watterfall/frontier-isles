/**
 * 气候带 Climate band — the domain HUE manifold only (depth-plan-v2 §4).
 *
 * The previously-empty sea becomes a continuous domain field: four corner radials
 * in the frozen `--fi-domain-*` tokens (fill→transparent) blend over `--fi-water`
 * into a true 2D manifold — an island's ambient hue is its manifold position,
 * never a bucket label. HUE lives here and only here; the orthogonal VALUE/depth
 * channel is a separate hue-less <SeaDepth> (ink darkness). Keeping the two in
 * different components makes "hue never conflates with value" a boundary fact,
 * not a convention. Every colour is a `var(--…)` token, so day/night is
 * palette-only: NIGHT_SCENE_VARS repaints `--water` while the geometry (rects,
 * gradient centres) stays byte-identical.
 */

/** The four domain-region anchors, in the frozen tokens, at the unit-square corners. */
export const CLIMATE_ANCHOR_TOKENS = [
  { token: '--fi-domain-math-fill', fallback: '#C9D8E6', corner: [0, 0] as const },
  { token: '--fi-domain-matter-fill', fallback: '#E8CFAE', corner: [1, 0] as const },
  { token: '--fi-domain-life-fill', fallback: '#C6DECC', corner: [0, 1] as const },
  { token: '--fi-domain-cross-fill', fallback: '#ECDFB4', corner: [1, 1] as const },
];

export interface ClimateFieldProps {
  /** Field size in scene units. */
  width?: number;
  height?: number;
  /** Namespace for the gradient ids so several fields can coexist in one <svg>. */
  id?: string;
}

export function ClimateField({ width = 1440, height = 900, id = 'fi-climate' }: ClimateFieldProps) {
  const r = Math.hypot(width, height) * 0.72;
  return (
    <g data-fi="climate-field">
      <defs>
        {CLIMATE_ANCHOR_TOKENS.map((a, i) => (
          <radialGradient
            key={a.token}
            id={`${id}-a${i}`}
            gradientUnits="userSpaceOnUse"
            cx={a.corner[0] * width}
            cy={a.corner[1] * height}
            r={r}
          >
            <stop offset="0%" stopColor={`var(${a.token}, ${a.fallback})`} stopOpacity="0.55" />
            <stop offset="100%" stopColor={`var(${a.token}, ${a.fallback})`} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {/* base water body — the only thing NIGHT_SCENE_VARS repaints (--water) */}
      <rect x="0" y="0" width={width} height={height} fill="var(--water, var(--fi-water, #C8D8E4))" />

      {/* four domain radials blend into the ambient climate hue */}
      {CLIMATE_ANCHOR_TOKENS.map((a, i) => (
        <rect key={a.token} x="0" y="0" width={width} height={height} fill={`url(#${id}-a${i})`} />
      ))}
    </g>
  );
}

/**
 * 水深 Sea depth — the domain abstractness VALUE channel (depth-plan-v2 §4/§6).
 *
 * Orthogonality-as-a-boundary-fact: this component deliberately exposes NO hue or
 * colour prop. Depth is *value only* — darkness painted with `var(--fi-ink)`, plus
 * optional isobath contours in `var(--fi-ink-2)`. Because a caller cannot pass a
 * hue here, "value never conflates with hue" is unrepresentable-if-violated at the
 * type boundary rather than a rule someone must remember. Hue lives solely in
 * <ClimateField>; §6's guarantee (motion=relation, hue=domain, value=abstractness,
 * altitude=groundedness) is enforced by which prop each component will accept.
 *
 * A well is a per-island/region depth pool: `value` in [0,1] is its darkness
 * (renderer `seaDepthAt(vec).overlayAlpha`). Deeper = more abstract/foundational.
 */

export interface SeaDepthWell {
  cx: number;
  cy: number;
  r: number;
  /** Darkness in [0,1] (an ink alpha) — NO colour, value only. */
  value: number;
}

export interface SeaDepthProps {
  /** Per-island depth pools. */
  wells?: SeaDepthWell[];
  /** Optional uniform field darkness (ink alpha) beneath the wells. */
  value?: number;
  width?: number;
  height?: number;
  /** Draw isobath contour rings (in --fi-ink-2) around each well. */
  isobaths?: boolean;
  /** Gradient-id namespace. */
  id?: string;
  // NOTE: intentionally no `color`/`hue`/`fill` — see file header. Depth is value.
}

export function SeaDepth({ wells = [], value = 0, width = 1440, height = 900, isobaths = false, id = 'fi-depth' }: SeaDepthProps) {
  return (
    <g data-fi="sea-depth">
      <defs>
        {wells.map((w, i) => (
          <radialGradient key={i} id={`${id}-w${i}`} gradientUnits="userSpaceOnUse" cx={w.cx} cy={w.cy} r={w.r}>
            <stop offset="0%" stopColor="var(--fi-ink, #2B2620)" stopOpacity={w.value} />
            <stop offset="100%" stopColor="var(--fi-ink, #2B2620)" stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {/* uniform darkness floor — value only */}
      {value > 0 && <rect x="0" y="0" width={width} height={height} fill="var(--fi-ink, #2B2620)" opacity={value} />}

      {/* depth pools: abstract islands sit over darker water */}
      {wells.map((w, i) => (
        <ellipse key={`p${i}`} cx={w.cx} cy={w.cy} rx={w.r} ry={w.r * 0.42} fill={`url(#${id}-w${i})`} />
      ))}

      {/* 等深线 isobaths — thin value contours, never a hue */}
      {isobaths &&
        wells.map((w, i) => (
          <ellipse
            key={`c${i}`}
            cx={w.cx}
            cy={w.cy}
            rx={w.r * 0.62}
            ry={w.r * 0.62 * 0.42}
            fill="none"
            stroke="var(--fi-ink-2, #6B6154)"
            strokeWidth="0.75"
            strokeDasharray="2 4"
            opacity={0.35 + w.value * 0.4}
          />
        ))}
    </g>
  );
}

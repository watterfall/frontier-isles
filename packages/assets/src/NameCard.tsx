/**
 * The rounded-rect "name card" every L1 station hangs above itself —
 * card background, a colored seal dot, and Noto Serif SC text. Copied
 * from e.g. 文献阁's `<g transform="translate(0,-104)">…</g>` block.
 *
 * Stations render this shape internally at their own exact prototype
 * position/width by default; passing a `label` prop to a station swaps
 * in this component with the caller's text/color at that same spot.
 */
export interface NameCardProps {
  x?: number;
  y?: number;
  text: string;
  sealColor: string;
  width?: number;
  fontSize?: number;
}

export function NameCard({ x = 0, y = -72, text, sealColor, width, fontSize = 12 }: NameCardProps) {
  const w = width ?? Math.max(52, text.length * 13 + 26);
  const halfW = w / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-halfW} y="-11" width={w} height="21" rx="3" fill="var(--card,rgba(250,245,232,0.92))" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
      <circle cx={-halfW + 10} cy="-0.5" r="2.5" fill={sealColor} />
      <text x="4" y="4" textAnchor="middle" fontSize={fontSize} fill="var(--inkT,#2B2620)" style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 600 }}>
        {text}
      </text>
    </g>
  );
}

/** The dashed gold ellipse the prototype draws around whichever station is selected. */
export function SelectionHighlight({ cx = 0, cy = 0 }: { cx?: number; cy?: number }) {
  return <ellipse cx={cx} cy={cy} rx="102" ry="50" fill="none" stroke="var(--gold,#E3A93C)" strokeWidth="2" strokeDasharray="6 6" opacity="0.9" />;
}

/** Shared prop contract for every station building component. */
export interface StationLabelSpec {
  text: string;
  sealColor: string;
}

export interface StationProps {
  x?: number;
  y?: number;
  onClick?: () => void;
  selected?: boolean;
  label?: StationLabelSpec;
  /**
   * Render the baked-in NameCard? Default true (the SVG scene wants it). The Pixi
   * L1 bakes stations with `showLabel={false}` and draws crisp, LOD-tiered labels
   * in a screen-space layer instead — baked raster text goes soft when scaled.
   */
  showLabel?: boolean;
}

export interface CompassProps {
  x?: number;
  y?: number;
}

/**
 * 罗盘 · compass rose, extracted verbatim from the L0 chart
 * `<g transform="translate(1372,822)">` block.
 */
export function Compass({ x = 1372, y = 822 }: CompassProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r="27" fill="rgba(250,245,232,0.92)" stroke="#3A342B" strokeWidth="1.5" />
      <circle r="20" fill="none" stroke="#3A342B" strokeWidth="0.5" opacity="0.5" />
      <polygon points="0,-16 4,0 0,16 -4,0" fill="var(--fi-ochre, #B5673A)" stroke="#3A342B" strokeWidth="0.75" />
      <circle r="2.5" fill="var(--fi-ink, #2B2620)" />
      <text x="0" y="-33" textAnchor="middle" fontSize="10" fill="#5B5344" style={{ fontFamily: "'Noto Serif SC',serif" }}>
        北
      </text>
    </g>
  );
}

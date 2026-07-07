export interface BambooProps {
  x?: number;
  y?: number;
}

/**
 * Bamboo cluster, extracted verbatim from the L1
 * `<g transform="translate(884,332)">` block (three culms + leaf ticks).
 */
export function Bamboo({ x = 884, y = 332 }: BambooProps) {
  return (
    <g transform={`translate(${x},${y})`} stroke="var(--treeG,#4E7D62)" fill="none" strokeLinecap="round">
      <path d="M 0 0 C 1 -12 -1 -24 2 -36" strokeWidth="1.8" />
      <path d="M 8 2 C 9 -10 7 -22 11 -34" strokeWidth="1.5" />
      <path d="M -7 1 C -6 -9 -8 -18 -5 -28" strokeWidth="1.3" />
      <path d="M 2 -30 l 8 -4 M 2 -22 l -8 -3 M 10 -26 l 8 -3 M -5 -20 l -7 -2" strokeWidth="1.2" />
    </g>
  );
}

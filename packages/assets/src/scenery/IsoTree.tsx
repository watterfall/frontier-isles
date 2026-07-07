export interface IsoTreeProps {
  x?: number;
  y?: number;
  scale?: number;
}

/**
 * Two-tier conifer silhouette, extracted verbatim from the L1 tree group
 * (design/handoff/问题群岛-原型 v3.dc.html lines ~133-141 — the prototype
 * repeats this exact markup at eight positions/scales across the island).
 */
export function IsoTree({ x = 0, y = 0, scale = 1 }: IsoTreeProps) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <line x1="0" y1="0" x2="0" y2="-13" stroke="var(--trunk,#7A5B3E)" strokeWidth="2.5" />
      <path d="M -10 -7 L 0 -22 L 10 -7 Z" fill="var(--treeG,#4E7D62)" />
      <path d="M -7 -15 L 0 -27 L 7 -15 Z" fill="var(--treeG,#4E7D62)" />
    </g>
  );
}

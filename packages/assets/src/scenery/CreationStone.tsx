export interface CreationStoneProps {
  x?: number;
  y?: number;
}

/**
 * 创世石 · 年轮 — creation stone with tree-ring event rings, marking the
 * founding ceremony 建岛仪式 (docs/architecture.md §4). Extracted verbatim
 * from the L1 `<g transform="translate(930,456)">` block, including its
 * `<title>` tooltip.
 */
export function CreationStone({ x = 930, y = 456 }: CreationStoneProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="0" cy="0" rx="11" ry="6" fill="var(--wallSh,#D9CCA9)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
      <ellipse cx="0" cy="-1" rx="7" ry="3.5" fill="none" stroke="var(--ink,#3A342B)" strokeWidth="0.5" opacity="0.6" />
      <ellipse cx="0" cy="-1" rx="3.5" ry="1.8" fill="none" stroke="var(--ink,#3A342B)" strokeWidth="0.5" opacity="0.45" />
      <title>创世石 · 建岛仪式的事件年轮</title>
    </g>
  );
}

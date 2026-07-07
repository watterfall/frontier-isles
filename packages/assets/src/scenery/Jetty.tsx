export interface JettyProps {
  x?: number;
  y?: number;
}

/**
 * 栈桥 · wooden jetty planks (no boat), extracted verbatim from the L1
 * markup (design/handoff/问题群岛-原型 v3.dc.html lines ~88-91). Path data
 * is absolute; `x`/`y` apply an additive offset.
 */
export function Jetty({ x = 0, y = 0 }: JettyProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1="754" y1="744" x2="788" y2="780" stroke="var(--trunk,#7A5B3E)" strokeWidth="3" />
      <line x1="768" y1="738" x2="802" y2="774" stroke="var(--trunk,#7A5B3E)" strokeWidth="3" />
      <path d="M 758 750 L 772 744 M 766 758 L 780 752 M 774 766 L 788 760 M 782 774 L 796 768" stroke="var(--trunk,#7A5B3E)" strokeWidth="2" />
    </g>
  );
}

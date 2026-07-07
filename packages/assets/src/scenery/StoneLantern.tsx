export interface StoneLanternProps {
  x?: number;
  y?: number;
  /** Shows the `url(#lgrad)` glow circle — requires <SceneDefs /> to be mounted for #lgrad. */
  lit?: boolean;
}

/**
 * 石灯笼 · stone lantern, extracted verbatim from the L1
 * `<g transform="translate(704,494)">` block.
 */
export function StoneLantern({ x = 704, y = 494, lit = false }: StoneLanternProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-2.5" y="-10" width="5" height="10" fill="var(--wallSh,#D9CCA9)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
      <rect x="-5" y="-16" width="10" height="6" fill="var(--wall,#F8F1DE)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
      <path d="M -7 -16 L 0 -21 L 7 -16 Z" fill="var(--capD,#4A4238)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
      {lit && <circle cx="0" cy="-13" r="7" fill="url(#lgrad)" />}
    </g>
  );
}

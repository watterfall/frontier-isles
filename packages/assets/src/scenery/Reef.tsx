export interface ReefProps {
  variant: 0 | 1;
  x?: number;
  y?: number;
}

const REEF_PATHS = [
  'M 594 716 l 12 -7 8 4 3 8 -12 5 -11 -4 Z',
  'M 1022 694 l 10 -6 9 5 -2 8 -13 3 Z',
];

/**
 * 礁石 · shoreline reef rock, extracted verbatim from the L1 markup
 * (design/handoff/问题群岛-原型 v3.dc.html lines ~84-86, two variants).
 * Path data is absolute; `x`/`y` apply an additive offset.
 */
export function Reef({ variant, x = 0, y = 0 }: ReefProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path d={REEF_PATHS[variant]} fill="var(--wallSh,#D9CCA9)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
    </g>
  );
}

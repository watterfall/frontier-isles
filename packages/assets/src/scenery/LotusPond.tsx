export interface LotusPondProps {
  x?: number;
  y?: number;
}

/**
 * 水池 · 荷 — lily pond with drifting ripples, extracted verbatim from
 * the L1 `<g transform="translate(760,430)">` block.
 */
export function LotusPond({ x = 760, y = 430 }: LotusPondProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <polygon points="0,0 64,32 0,64 -64,32" fill="var(--water,#C8D8E4)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
      <g style={{ animation: 'waveDrift 6s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }}>
        <path d="M -30 28 q 7 -5 14 0 q 7 5 14 0" stroke="var(--ink,#3A342B)" strokeWidth="0.75" fill="none" opacity="0.4" />
        <path d="M -14 42 q 7 -5 14 0 q 7 5 14 0" stroke="var(--ink,#3A342B)" strokeWidth="0.75" fill="none" opacity="0.3" />
      </g>
      <ellipse cx="-20" cy="40" rx="6" ry="3" fill="var(--lotus,#A9C8B4)" stroke="var(--ink,#3A342B)" strokeWidth="0.5" />
      <ellipse cx="8" cy="50" rx="5" ry="2.5" fill="var(--lotus,#A9C8B4)" stroke="var(--ink,#3A342B)" strokeWidth="0.5" />
      <ellipse cx="24" cy="34" rx="6" ry="3" fill="var(--lotus,#A9C8B4)" stroke="var(--ink,#3A342B)" strokeWidth="0.5" />
    </g>
  );
}

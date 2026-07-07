export interface BoatProps {
  x?: number;
  y?: number;
  /** 'jetty' = the small hull moored at the L1 island jetty (day/night
   *  themed via `var(--doorW,...)`). 'sail' = the L0 chart's mast+sail
   *  fishing boats (fixed ink colors — the chart is a single, un-themed
   *  palette). */
  variant?: 'jetty' | 'sail';
  animated?: boolean;
  bobSeconds?: number;
  bobDelaySeconds?: number;
}

/**
 * Small boat, extracted verbatim from two prototype spots:
 *  - 'jetty': L1 `<g transform="translate(836,792)">` (line ~92)
 *  - 'sail': L0 chart boats at (478,692) and (1150,556) (lines ~629-630)
 */
export function Boat({ x = 0, y = 0, variant = 'jetty', animated = true, bobSeconds = 5, bobDelaySeconds = 0 }: BoatProps) {
  const style = animated
    ? {
        animation: `bob ${bobSeconds}s ease-in-out infinite${bobDelaySeconds ? ` ${bobDelaySeconds}s` : ''}`,
        animationPlayState: 'var(--play,running)' as never,
      }
    : undefined;

  if (variant === 'jetty') {
    return (
      <g transform={`translate(${x},${y})`} style={style}>
        <path d="M -15 0 Q 0 7 15 0 L 11 -3 L -11 -3 Z" fill="var(--doorW,#5B4F3C)" stroke="var(--ink,#3A342B)" strokeWidth="1" />
      </g>
    );
  }

  return (
    <g transform={`translate(${x},${y})`} style={style}>
      <path d="M -16 0 Q 0 8 16 0 L 12 -3 L -12 -3 Z" fill="#5B4F3C" stroke="#3A342B" strokeWidth="1" />
      <line x1="0" y1="-3" x2="0" y2="-18" stroke="#3A342B" strokeWidth="1.2" />
      <path d="M 0 -18 L 11 -6 L 0 -6 Z" fill="#F8F1DE" stroke="#3A342B" strokeWidth="0.75" />
    </g>
  );
}

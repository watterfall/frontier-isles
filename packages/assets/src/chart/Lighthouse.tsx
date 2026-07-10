export interface LighthouseProps {
  x?: number;
  y?: number;
  scale?: number;
}

/**
 * L0 chart-scale lighthouse — flown by any island whose problem-object
 * `status` is `resolved` (docs/architecture.md line 68, depth-plan-v1 §1/§5:
 * "a resolved [island] flies a lighthouse... silhouette (size, coastline,
 * altitude, lighthouse-if-resolved) is the whole fingerprint at range").
 * A scaled-down sibling of the L1 lighthouse in `GeneratedScene.tsx`
 * (same tower/lamp/beam/flag anatomy) so the two read as the same landmark
 * at different zoom levels. Plain fills (no `--fi-*` day/night swap) —
 * the L0 chart itself has no night palette to key off yet.
 */
export function Lighthouse({ x = 0, y = 0, scale = 1 }: LighthouseProps) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path d="M -5 0 L -3 -22 L 3 -22 L 5 0 Z" fill="#F8F1DE" stroke="#4A4238" strokeWidth="1" />
      <rect x="-4" y="-22" width="8" height="6" fill="#2B2620" stroke="#4A4238" strokeWidth="0.75" />
      <circle cx="0" cy="-19" r="3.4" fill="#E3A93C" opacity="0.55" style={{ animation: 'pulseGlow 2.6s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }} />
      <circle cx="0" cy="-19" r="1.6" fill="#F5B94B" />
      <line x1="0" y1="-22" x2="0" y2="-27" stroke="#4A4238" strokeWidth="1" />
      <path d="M 0 -27 L 6 -24.5 L 0 -22 Z" fill="#E3A93C" stroke="#4A4238" strokeWidth="0.5" />
    </g>
  );
}

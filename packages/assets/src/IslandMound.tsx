/**
 * The 5 mound silhouettes used by every L0 chart island, extracted
 * verbatim from `const MOUNDS = [...]` (design/handoff/问题群岛-原型 v3.dc.html,
 * near line 1149). The prototype picks one per island via `MOUNDS[d.id % 5]`.
 */
export const MOUND_PATHS: string[] = [
  'M -58 10 C -50 -8 -26 -20 2 -21 C 30 -20 50 -9 58 8 C 46 16 30 20 0 20 C -30 20 -48 16 -58 10 Z',
  'M -62 8 C -44 -14 -18 -8 -6 -17 C 8 -26 34 -18 48 -6 C 56 1 60 6 62 10 C 40 18 -40 18 -62 8 Z',
  'M -50 10 C -46 -10 -20 -24 6 -18 C 20 -15 30 -22 44 -12 C 54 -5 52 5 54 10 C 30 17 -30 17 -50 10 Z',
  'M -60 9 C -54 -6 -40 -16 -24 -14 C -14 -13 -10 -6 -2 -8 C 4 -20 24 -24 40 -14 C 52 -7 56 2 58 9 C 36 17 -36 17 -60 9 Z',
  'M -64 8 C -52 -4 -30 -10 -4 -11 C 24 -12 48 -6 62 6 C 64 8 62 10 60 11 C 30 17 -40 16 -64 8 Z',
];

export interface IslandMoundProps {
  /** Picks a silhouette from MOUND_PATHS, mirroring `MOUNDS[d.id % 5]`. */
  variant: 0 | 1 | 2 | 3 | 4;
  /** Domain/dormant/outlier fill — data-driven, unlike the --fi-* token
   * colors used elsewhere (see prototype: `fill: {{ isle.fill }}`). */
  fill: string;
  x?: number;
  y?: number;
  scale?: number;
  /** Raises the mound and shows its cast shadow, as on hover in the prototype. */
  lifted?: boolean;
}

/** One L0 chart island: water rings, cast shadow, mound body + ridge line. */
export function IslandMound({ variant, fill, x = 0, y = 0, scale = 1, lifted = false }: IslandMoundProps) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path d="M -70 24 q 34 9 70 9 q 36 0 70 -9" stroke="#BFCEDB" strokeWidth="1.2" fill="none" opacity="0.8" />
      <path d="M -58 34 q 28 7 58 7 q 30 0 58 -7" stroke="#BFCEDB" strokeWidth="1" fill="none" opacity="0.5" />
      <ellipse cx="0" cy="26" rx="58" ry="9" fill="rgba(58,48,36,0.15)" opacity={lifted ? 1 : 0} style={{ transition: 'opacity .35s' }} />
      <g style={{ transform: lifted ? 'translateY(-5px)' : 'translateY(0px)', transition: 'transform .35s cubic-bezier(0.22,1,0.36,1)' }}>
        <path d={MOUND_PATHS[variant]} fill={fill} stroke="#4A4238" strokeWidth="1.5" />
        <path d="M -22 -8 Q 0 -15 20 -8" stroke="#4A4238" strokeWidth="0.75" fill="none" opacity="0.3" />
      </g>
    </g>
  );
}

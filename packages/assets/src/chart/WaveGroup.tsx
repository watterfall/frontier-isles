export interface WaveGroupProps {
  x?: number;
  y?: number;
  seconds?: number;
  delay?: number;
}

/**
 * One drifting sea-ripple cluster, extracted verbatim from the L0 chart
 * `sc-for list="{{ waves }}"` template (design/handoff/问题群岛-原型
 * v3.dc.html lines ~621-626). Compose several at different positions to
 * build the open sea — see DEFAULT_WAVE_POSITIONS for the prototype's own 12.
 */
export function WaveGroup({ x = 0, y = 0, seconds = 7, delay = 0 }: WaveGroupProps) {
  return (
    <g
      transform={`translate(${x},${y})`}
      style={{ animation: `waveDrift ${seconds}s ease-in-out infinite${delay ? ` ${delay}s` : ''}`, animationPlayState: 'var(--play,running)' as never }}
    >
      <path d="M 0 0 q 9 -6 18 0 q 9 6 18 0" stroke="#BFCEDB" strokeWidth="1.1" fill="none" opacity="0.75" />
      <path d="M 10 8 q 9 -6 18 0" stroke="#BFCEDB" strokeWidth="1" fill="none" opacity="0.5" />
    </g>
  );
}

/** The 12 wave-cluster positions the prototype scatters across the L0 sea. */
export const DEFAULT_WAVE_POSITIONS: Array<[number, number]> = [
  [120, 560], [340, 640], [520, 200], [760, 660], [900, 190], [1060, 560],
  [1240, 470], [420, 480], [980, 700], [200, 720], [1340, 380], [640, 470],
];

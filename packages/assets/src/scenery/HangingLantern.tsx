export interface HangingLanternProps {
  x?: number;
  y?: number;
  /** 'large' = the two lanterns hanging over 文献阁/白板厅 (r=24 glow, ribbed body).
   *  'small' = the two lanterns over 茶寮/散木园 (r=20 glow, plain body). */
  size?: 'large' | 'small';
  swaySeconds?: number;
}

/**
 * Night-layer paper lantern with `sway` animation + `url(#lgrad)` glow —
 * extracted verbatim from the L1 night-layer group (design/handoff/问题群岛-原型
 * v3.dc.html lines ~330-333). Requires <SceneDefs /> for `#lgrad`.
 */
export function HangingLantern({ x = 0, y = 0, size = 'large', swaySeconds = 3.4 }: HangingLanternProps) {
  const large = size === 'large';
  const glowR = large ? 24 : 20;
  const bodyRx = large ? 8 : 6.5;
  const bodyRy = large ? 10 : 8;
  const bodyCy = large ? 20 : 19;
  const tieY2 = large ? 36 : 32;
  const tieY1 = large ? 30 : 27;
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx="0" cy="22" r={glowR} fill="url(#lgrad)" />
      <g
        style={{
          animation: `sway ${swaySeconds}s ease-in-out infinite`,
          transformOrigin: '50% 0%',
          transformBox: 'fill-box',
          animationPlayState: 'var(--play,running)' as never,
        }}
      >
        <line x1="0" y1="0" x2="0" y2="10" stroke="#8E99BE" strokeWidth="1" />
        <ellipse cx="0" cy={bodyCy} rx={bodyRx} ry={bodyRy} fill="var(--fi-lantern, #F5B94B)" stroke="var(--fi-ochre, #B5673A)" strokeWidth="1" />
        {large && (
          <path d="M -4 11.5 c 0 6 0 12 0 17 M 4 11.5 c 0 6 0 12 0 17" stroke="var(--fi-ochre, #B5673A)" strokeWidth="0.75" fill="none" />
        )}
        <line x1="0" y1={tieY1} x2="0" y2={tieY2} stroke="var(--fi-ochre, #B5673A)" strokeWidth="1" />
      </g>
    </g>
  );
}

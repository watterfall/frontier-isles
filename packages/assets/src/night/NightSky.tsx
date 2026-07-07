/**
 * 夜空 · crescent moon + twinkling stars, extracted verbatim from the L1
 * night-sky group (design/handoff/问题群岛-原型 v3.dc.html lines ~62-70).
 */
export function NightSky() {
  return (
    <g>
      <path d="M 1330 96 a 34 34 0 1 0 6 46 a 27 27 0 0 1 -6 -46 Z" fill="#E8D9A8" opacity="0.85" />
      <circle cx="180" cy="90" r="1.6" fill="#E8D9A8" style={{ animation: 'twinkle 4s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }} />
      <circle cx="320" cy="140" r="1.2" fill="#E8D9A8" />
      <circle cx="520" cy="70" r="1.4" fill="#E8D9A8" style={{ animation: 'twinkle 5s ease-in-out infinite 1.2s', animationPlayState: 'var(--play,running)' as never }} />
      <circle cx="900" cy="100" r="1.2" fill="#E8D9A8" />
      <circle cx="1100" cy="60" r="1.6" fill="#E8D9A8" style={{ animation: 'twinkle 4.6s ease-in-out infinite 2s', animationPlayState: 'var(--play,running)' as never }} />
      <circle cx="700" cy="130" r="1" fill="#E8D9A8" />
      <circle cx="420" cy="110" r="1.1" fill="#E8D9A8" style={{ animation: 'twinkle 5.4s ease-in-out infinite .6s', animationPlayState: 'var(--play,running)' as never }} />
    </g>
  );
}

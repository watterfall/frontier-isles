/**
 * 远山（平远 · 皴）— distant mountain silhouette with cun-fa (皴法) brush
 * ticks, extracted verbatim from the L0 chart (design/handoff/问题群岛-原型
 * v3.dc.html lines ~608-612).
 */
export function MountainRange() {
  return (
    <g>
      <path d="M 0 150 Q 120 92 240 138 Q 330 168 430 130 Q 560 84 690 132 L 690 200 L 0 200 Z" fill="#DCD3BC" opacity="0.55" />
      <path d="M 700 140 Q 860 88 1010 136 Q 1160 180 1320 118 Q 1390 96 1440 116 L 1440 210 L 700 210 Z" fill="#DCD3BC" opacity="0.4" />
      <path d="M 0 170 Q 200 130 420 166 Q 700 208 980 162 Q 1220 126 1440 168" fill="none" stroke="#B9AE92" strokeWidth="1" opacity="0.6" />
      <path
        d="M 150 128 q 20 -16 42 -4 M 210 118 q 16 -12 34 -3 M 480 112 q 18 -14 38 -4 M 900 116 q 18 -14 38 -4 M 1250 106 q 16 -12 34 -3"
        stroke="#B9AE92"
        strokeWidth="0.9"
        fill="none"
        opacity="0.55"
      />
    </g>
  );
}

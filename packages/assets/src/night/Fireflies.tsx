interface FireflySpec {
  cx: number;
  cy: number;
  r: number;
  anim: 'fflyA' | 'fflyB';
  seconds: number;
  delay: number;
}

/** The 5 fireflies extracted verbatim from the L1 night layer
 * (design/handoff/问题群岛-原型 v3.dc.html lines ~334-340). */
const BASE_FIREFLIES: FireflySpec[] = [
  { cx: 944, cy: 358, r: 2, anim: 'fflyA', seconds: 5, delay: 0 },
  { cx: 984, cy: 330, r: 1.6, anim: 'fflyB', seconds: 6, delay: 0 },
  { cx: 1024, cy: 380, r: 2, anim: 'fflyA', seconds: 7, delay: 0.8 },
  { cx: 914, cy: 390, r: 1.4, anim: 'fflyB', seconds: 5.5, delay: 1.4 },
  { cx: 999, cy: 406, r: 1.6, anim: 'fflyA', seconds: 6.5, delay: 2 },
];

export interface FirefliesProps {
  /** Defaults to the prototype's 5. Values above 5 repeat the base
   * pattern with a small deterministic jitter so extra fireflies don't
   * perfectly overlap. */
  count?: number;
}

/** 萤火虫 · fireflies drifting near the question wall at night. */
export function Fireflies({ count = 5 }: FirefliesProps) {
  const flies: FireflySpec[] = [];
  for (let i = 0; i < count; i++) {
    const base = BASE_FIREFLIES[i % BASE_FIREFLIES.length]!;
    const ring = Math.floor(i / BASE_FIREFLIES.length);
    flies.push(ring === 0 ? base : { ...base, cx: base.cx + ring * 14, cy: base.cy - ring * 10 });
  }

  return (
    <g fill="#F5B94B">
      {flies.map((f, i) => (
        <circle
          key={i}
          cx={f.cx}
          cy={f.cy}
          r={f.r}
          style={{
            animation: `${f.anim} ${f.seconds}s ease-in-out infinite${f.delay ? ` ${f.delay}s` : ''}`,
            animationPlayState: 'var(--play,running)' as never,
          }}
        />
      ))}
    </g>
  );
}

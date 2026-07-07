export interface SteppingStonesProps {
  x?: number;
  y?: number;
}

/**
 * 石阶铺地 · stepping-stone tiles, extracted verbatim from the L1 markup
 * (design/handoff/问题群岛-原型 v3.dc.html lines ~114-119). Path data is
 * absolute in the prototype; `x`/`y` apply an additive offset.
 */
export function SteppingStones({ x = 0, y = 0 }: SteppingStonesProps) {
  return (
    <g transform={`translate(${x},${y})`} fill="var(--stone,#DCCFAB)" stroke="var(--ink,#3A342B)" strokeWidth="0.5" opacity="0.9">
      <polygon points="887,453 897,458 887,463 877,458" />
      <polygon points="821,461 831,466 821,471 811,466" />
      <polygon points="710,446 720,451 710,456 700,451" />
      <polygon points="686,435 696,440 686,445 676,440" />
    </g>
  );
}

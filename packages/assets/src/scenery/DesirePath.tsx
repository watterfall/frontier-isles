export interface DesirePathProps {
  x?: number;
  y?: number;
  /** Shows the "履痕 · 日积成径" caption. */
  showLabel?: boolean;
}

/**
 * 小径 · desire path (footprint-worn dashed trails) — 小径 desire path in
 * the glossary (docs/architecture.md §9). Extracted verbatim from the L1
 * markup (design/handoff/问题群岛-原型 v3.dc.html lines ~122-130). Path
 * data is absolute; `x`/`y` apply an additive offset.
 */
export function DesirePath({ x = 0, y = 0, showLabel = true }: DesirePathProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <g fill="none" stroke="var(--path,rgba(181,103,58,0.5))" strokeLinecap="round">
        <path d="M 960 440 Q 770 498 664 428" strokeWidth="4" strokeDasharray="1 8" />
        <path d="M 566 458 Q 520 478 484 486" strokeWidth="2.5" strokeDasharray="1 8" />
        <path d="M 980 420 Q 900 378 830 352" strokeWidth="2.5" strokeDasharray="1 8" />
        <path d="M 700 616 Q 740 638 760 652" strokeWidth="2.5" strokeDasharray="1 8" />
        <path d="M 892 596 Q 926 578 946 556" strokeWidth="2" strokeDasharray="1 8" />
        <path d="M 1014 452 Q 1000 480 976 508" strokeWidth="2" strokeDasharray="1 8" />
      </g>
      {showLabel && (
        <text x="812" y="492" fontSize="9" fill="var(--ink2,#6B6154)" opacity="0.75" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
          履痕 · 日积成径
        </text>
      )}
    </g>
  );
}

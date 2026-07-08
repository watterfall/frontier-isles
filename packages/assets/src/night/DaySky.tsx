/**
 * 昼阳 · 飞鸟 — sun + birds, extracted verbatim from the L1 day-sky group
 * (design/handoff/问题群岛-原型 v3.dc.html lines ~74-78).
 */
export function DaySky() {
  return (
    <g>
      <g transform="translate(348,96)">
        <circle r="20" fill="rgba(227,169,60,0.16)" stroke="#C99436" strokeWidth="1.2" />
        <circle r="7" fill="var(--fi-gamboge, #E3A93C)" opacity="0.75" />
      </g>
      <path
        d="M 880 150 q 5 -6 10 0 q 5 -6 10 0 M 934 128 q 5 -6 10 0 q 5 -6 10 0 M 968 156 q 4 -5 8 0 q 4 -5 8 0"
        stroke="var(--fi-ink-2, #6B6154)"
        strokeWidth="1.2"
        fill="none"
        opacity="0.6"
      />
    </g>
  );
}

export interface LineageLineProps {
  /** Dashed lineage path, e.g. `"M 802 522 Q 866 556 924 602"`. */
  d: string;
  labelX?: number;
  labelY?: number;
  label?: string;
}

/**
 * 血缘 · fork lineage dashed line on the L0 chart, extracted verbatim
 * from design/handoff/问题群岛-原型 v3.dc.html lines ~646-647.
 */
export function LineageLine({ d, labelX, labelY, label = 'fork · 血缘' }: LineageLineProps) {
  return (
    <g>
      <path d={d} fill="none" stroke="#6B6154" strokeWidth="1.2" strokeDasharray="2 5" />
      {labelX !== undefined && labelY !== undefined && (
        <text x={labelX} y={labelY} fontSize="9.5" fill="#6B6154" style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>
          {label}
        </text>
      )}
    </g>
  );
}

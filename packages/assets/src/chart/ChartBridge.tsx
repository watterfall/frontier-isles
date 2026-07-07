export interface ChartBridgeProps {
  /** The bridge arc path, e.g. `"M 836 338 Q 962 250 1082 262"`. */
  d: string;
  /** Pill label text, e.g. "桥 · 量子相干". */
  label: string;
  /** Pill center. Omit to skip the label pill entirely. */
  labelX?: number;
  labelY?: number;
  /** Rail-tick marks along the arc, e.g. `"M 946 279 v 7 M 962 276 v 7 M 978 276 v 7"`. */
  ticks?: string;
  color?: string;
}

/**
 * 桥 · cross-domain bridge on the L0 chart — an ochre double-stroke arc
 * (a thin 2.2px line over a soft 5px halo) with rail ticks and a rounded
 * label pill. Extracted verbatim from design/handoff/问题群岛-原型
 * v3.dc.html lines ~633-648 (three bridges share this exact shape).
 */
export function ChartBridge({ d, label, labelX, labelY, ticks, color = '#B5673A' }: ChartBridgeProps) {
  const showPill = labelX !== undefined && labelY !== undefined;
  const pillWidth = Math.max(52, label.length * 11 + 22);
  return (
    <g fill="none">
      <path d={d} stroke={color} strokeWidth="2.2" />
      <path d={d} stroke={color} strokeWidth="5" opacity="0.14" />
      {ticks && <path d={ticks} stroke={color} strokeWidth="1.2" />}
      {showPill && (
        <g transform={`translate(${labelX},${labelY})`}>
          <rect x={-pillWidth / 2} y="-10" width={pillWidth} height="18" rx="9" fill="rgba(250,245,232,0.95)" stroke={color} strokeWidth="1" />
          <text x="0" y="3.5" textAnchor="middle" fontSize="10.5" fill={color} style={{ fontFamily: "'PingFang SC',sans-serif" }}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

import { NameCard, SelectionHighlight, type StationProps } from '../NameCard';

/**
 * 数据台 · Data Bench. Extracted verbatim from the L1
 * `<g transform="translate(940,512)">` block — bar-chart columns and a
 * pennant flag on a pole.
 */
export function StationDataBench({ x = 940, y = 512, onClick, selected = false, label }: StationProps) {
  return (
    <g transform={`translate(${x},${y})`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
      <polygon points="-58,15 38,63 38,77 -58,29" fill="var(--wall,#F8F1DE)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <polygon points="96,34 38,63 38,77 96,48" fill="var(--wallSh,#E7DABE)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <polygon points="0,-14 96,34 38,63 -58,15" fill="var(--ground,#EBDFC4)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      {/* bar columns */}
      <g transform="translate(10,18)">
        <rect x="-5" y="-24" width="10" height="24" fill="var(--capB,#2E5E8C)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
        <rect x="-3.5" y="-21" width="7" height="4" fill="var(--gold,#E3A93C)" />
      </g>
      <g transform="translate(34,32)">
        <rect x="-5" y="-19" width="10" height="19" fill="var(--capG,#3E9B7E)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
      </g>
      {/* flag */}
      <g transform="translate(56,40)">
        <line x1="0" y1="0" x2="0" y2="-32" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
        <path d="M 0 -32 L 14 -27 L 0 -22 Z" fill="var(--gold,#E3A93C)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
      </g>
      {selected && <SelectionHighlight cx={19} cy={30} />}
      <NameCard x={20} y={-30} width={64} text={label?.text ?? '数据台'} sealColor={label?.sealColor ?? '#2E5E8C'} />
    </g>
  );
}

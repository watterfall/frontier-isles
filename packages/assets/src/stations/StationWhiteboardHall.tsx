import { NameCard, SelectionHighlight, type StationProps } from '../NameCard';

/**
 * 白板厅 · Whiteboard Hall. Extracted verbatim from the L1
 * `<g transform="translate(560,356)">` block — whiteboard face with a
 * curved marker stroke, ruled note lines, and an ochre focus ring.
 */
export function StationWhiteboardHall({ x = 560, y = 356, onClick, selected = false, label, showLabel = true }: StationProps) {
  return (
    <g transform={`translate(${x},${y})`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
      <ellipse cx="12" cy="66" rx="120" ry="46" fill="var(--shadow,rgba(58,48,36,0.16))" />
      <polygon points="-96,8 24,68 24,108 -96,48" fill="var(--wall,#F8F1DE)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <polygon points="120,20 24,68 24,108 120,60" fill="var(--wallSh,#E7DABE)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <g transform="skewY(26.565)">
        <rect x="-86" y="66" width="82" height="26" rx="1.5" fill="#FDFAF1" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
        <path d="M -80 74 q 8 -6 16 2 q 8 8 14 -2" stroke="var(--capB,#2E5E8C)" strokeWidth="1.2" fill="none" />
        <path d="M -44 84 l 30 0 M -44 88 l 22 0" stroke="var(--ink,#3A342B)" strokeWidth="1" opacity="0.55" />
        <circle cx="-24" cy="74" r="4" fill="none" stroke="var(--ochre,#B5673A)" strokeWidth="1.2" />
      </g>
      <polygon points="0,-59 118,0 0,59 -118,0" transform="translate(12,8)" fill="var(--capG,#3E9B7E)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <circle cx="-103" cy="10" r="2.2" fill="var(--capD,#4A4238)" stroke="var(--ink,#3A342B)" strokeWidth="0.6" />
      <circle cx="127" cy="10" r="2.2" fill="var(--capD,#4A4238)" stroke="var(--ink,#3A342B)" strokeWidth="0.6" />
      {selected && <SelectionHighlight cx={12} cy={22} />}
      {showLabel && <NameCard x={12} y={-72} width={64} text={label?.text ?? '白板厅'} sealColor={label?.sealColor ?? '#3E9B7E'} />}
    </g>
  );
}

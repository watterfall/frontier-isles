import { NameCard, SelectionHighlight, type StationProps } from '../NameCard';

/**
 * 茶寮 · Tearoom — never metricized (docs/architecture.md §3). Extracted
 * verbatim from the L1 `<g transform="translate(880,590)">` block.
 */
export function StationTearoom({ x = 880, y = 590, onClick, selected = false, label, showLabel = true }: StationProps) {
  return (
    <g transform={`translate(${x},${y})`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
      <ellipse cx="0" cy="34" rx="66" ry="26" fill="var(--shadow,rgba(58,48,36,0.16))" />
      <polygon points="-58,5 0,34 0,58 -58,29" fill="var(--wall,#F8F1DE)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <polygon points="58,5 0,34 0,58 58,29" fill="var(--wallSh,#E7DABE)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <polygon points="0,-33 66,0 0,33 -66,0" transform="translate(0,-1)" fill="var(--capG,#3E9B7E)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <circle cx="-64" cy="-1" r="2" fill="var(--capD,#4A4238)" stroke="var(--ink,#3A342B)" strokeWidth="0.6" />
      <circle cx="64" cy="-1" r="2" fill="var(--capD,#4A4238)" stroke="var(--ink,#3A342B)" strokeWidth="0.6" />
      <path
        d="M 20 6 c 4 -6 -4 -10 2 -18"
        stroke="var(--ink2,#6B6154)"
        strokeWidth="1.2"
        fill="none"
        opacity="0.5"
        style={{ animation: 'smoke 3.6s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }}
      />
      {selected && <SelectionHighlight cx={0} cy={17} />}
      {showLabel && <NameCard x={0} y={-46} width={52} text={label?.text ?? '茶寮'} sealColor={label?.sealColor ?? '#3E9B7E'} />}
    </g>
  );
}

import { NameCard, SelectionHighlight, type StationProps } from '../NameCard';

/**
 * 实验坊 · Workshop. Extracted verbatim from the L1
 * `<g transform="translate(470,490)">` block — a chimney with the
 * `smoke` keyframe animation.
 */
export function StationWorkshop({ x = 470, y = 490, onClick, selected = false, label, showLabel = true }: StationProps) {
  return (
    <g transform={`translate(${x},${y})`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
      <ellipse cx="0" cy="56" rx="108" ry="42" fill="var(--shadow,rgba(58,48,36,0.16))" />
      <polygon points="-96,10 0,58 0,96 -96,48" fill="var(--wall,#F8F1DE)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <polygon points="96,10 0,58 0,96 96,48" fill="var(--wallSh,#E7DABE)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <g transform="skewY(26.565)">
        <rect x="-62" y="42" width="18" height="26" fill="var(--doorW,#5B4F3C)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
        <rect x="-34" y="40" width="14" height="12" fill="var(--doorW,#5B4F3C)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
      </g>
      <polygon points="0,-53 106,0 0,53 -106,0" transform="translate(0,4)" fill="var(--capO,#B5673A)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <circle cx="-103" cy="4" r="2.2" fill="var(--capD,#4A4238)" stroke="var(--ink,#3A342B)" strokeWidth="0.6" />
      <circle cx="103" cy="4" r="2.2" fill="var(--capD,#4A4238)" stroke="var(--ink,#3A342B)" strokeWidth="0.6" />
      {/* chimney + smoke */}
      <g transform="translate(-44,-22)">
        <rect x="-6" y="-16" width="12" height="18" fill="var(--wallSh,#E7DABE)" stroke="var(--ink,#3A342B)" strokeWidth="1" />
        <path
          d="M 0 -20 c 6 -8 -6 -14 2 -24"
          stroke="var(--ink2,#6B6154)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
          style={{ animation: 'smoke 4s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }}
        />
      </g>
      {selected && <SelectionHighlight />}
      {showLabel && <NameCard x={0} y={-64} width={64} text={label?.text ?? '实验坊'} sealColor={label?.sealColor ?? '#B5673A'} />}
    </g>
  );
}

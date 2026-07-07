import { NameCard, SelectionHighlight, type StationProps } from '../NameCard';

/**
 * 文献阁 · Library. Extracted verbatim from the L1 `<g transform="translate(760,296)">`
 * block: window grid (front + side faces), gold plaque, roof + ridge finials.
 * Default position (760,296) reproduces the prototype's static composition.
 */
export function StationLibrary({ x = 760, y = 296, onClick, selected = false, label }: StationProps) {
  return (
    <g transform={`translate(${x},${y})`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
      <ellipse cx="0" cy="52" rx="112" ry="44" fill="var(--shadow,rgba(58,48,36,0.16))" />
      <polygon points="-96,-16 0,32 0,96 -96,48" fill="var(--wall,#F8F1DE)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <polygon points="96,-16 0,32 0,96 96,48" fill="var(--wallSh,#E7DABE)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <polygon points="-96,10 0,58 0,64 -96,16" fill="rgba(58,48,36,0.12)" />
      <polygon points="96,10 0,58 0,64 96,16" fill="rgba(58,48,36,0.16)" />
      {/* window grid — left face */}
      <g transform="skewY(26.565)">
        <rect x="-84" y="-22" width="14" height="13" fill="var(--doorW,#5B4F3C)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
        <rect x="-62" y="-22" width="14" height="13" fill="var(--doorW,#5B4F3C)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
        <rect x="-40" y="-22" width="14" height="13" fill="var(--doorW,#5B4F3C)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
        <path d="M -80 -22 v 13 M -76 -22 v 13 M -58 -22 v 13 M -54 -22 v 13 M -36 -22 v 13 M -32 -22 v 13" stroke="var(--wall,#F8F1DE)" strokeWidth="1" />
        <rect x="-84" y="8" width="14" height="13" fill="var(--doorW,#5B4F3C)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
        <rect x="-62" y="8" width="14" height="13" fill="var(--doorW,#5B4F3C)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
      </g>
      {/* window grid + gold plaque — right face */}
      <g transform="skewY(-26.565)">
        <rect x="36" y="6" width="20" height="26" fill="var(--doorW,#5B4F3C)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
        <line x1="46" y1="6" x2="46" y2="32" stroke="var(--wall,#F8F1DE)" strokeWidth="0.75" />
        <rect x="12" y="-22" width="14" height="13" fill="var(--doorW,#5B4F3C)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
        <rect x="68" y="-22" width="14" height="13" fill="var(--doorW,#5B4F3C)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
        <rect x="74" y="0" width="9" height="20" rx="1" fill="var(--gold,#E3A93C)" stroke="var(--ink,#3A342B)" strokeWidth="0.6" />
      </g>
      <polygon points="0,-53 106,0 0,53 -106,0" transform="translate(0,-22)" fill="var(--capB,#2E5E8C)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <path d="M -106 -22 L 0 -75 L 106 -22" fill="none" stroke="var(--ink,#3A342B)" strokeWidth="0.75" opacity="0.5" />
      <circle cx="0" cy="-79" r="3.5" fill="var(--gold,#E3A93C)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
      {/* ridge finials */}
      <circle cx="-103" cy="-20" r="2.2" fill="var(--capD,#4A4238)" stroke="var(--ink,#3A342B)" strokeWidth="0.6" />
      <circle cx="103" cy="-20" r="2.2" fill="var(--capD,#4A4238)" stroke="var(--ink,#3A342B)" strokeWidth="0.6" />
      <path d="M -30 86 a 30 11 0 0 1 60 0" fill="none" stroke="var(--ink,#3A342B)" strokeWidth="0.75" opacity="0.3" />
      <path d="M -20 90 a 20 8 0 0 1 40 0" fill="none" stroke="var(--ink,#3A342B)" strokeWidth="0.75" opacity="0.22" />
      {selected && <SelectionHighlight />}
      <NameCard x={0} y={-104} width={64} text={label?.text ?? '文献阁'} sealColor={label?.sealColor ?? '#2E5E8C'} />
    </g>
  );
}

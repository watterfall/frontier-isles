import { NameCard, SelectionHighlight, type StationProps } from '../NameCard';

export interface StationGalleryProps extends StationProps {
  /** Day-only "对外视图 · D(t)" pill above the roof — sole daytime/publication view (docs/architecture.md §3). */
  showDayBadge?: boolean;
  /** "曾为散木 · 已移栽" tag — a piece in this gallery was once driftwood, transplanted in. */
  driftwoodTag?: boolean;
}

/**
 * 展厅 · Gallery. Extracted verbatim from the L1
 * `<g transform="translate(656,540)">` block — 展 banner, entrance
 * steps, framed works (one gold-stroked, one circular).
 */
export function StationGallery({
  x = 656,
  y = 540,
  onClick,
  selected = false,
  label,
  showDayBadge = true,
  driftwoodTag = true,
}: StationGalleryProps) {
  return (
    <g transform={`translate(${x},${y})`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
      <ellipse cx="12" cy="72" rx="120" ry="46" fill="var(--shadow,rgba(58,48,36,0.16))" />
      <polygon points="-96,2 24,62 24,108 -96,48" fill="var(--wall,#F8F1DE)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <polygon points="120,14 24,62 24,108 120,60" fill="var(--wallSh,#E7DABE)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <g transform="skewY(26.565)">
        <rect x="-82" y="58" width="24" height="18" fill="#FDFAF1" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
        <path d="M -76 68 q 6 -8 12 0" stroke="var(--capG,#3E9B7E)" strokeWidth="1.2" fill="none" />
        <rect x="-50" y="58" width="24" height="18" fill="#FDFAF1" stroke="var(--gold,#E3A93C)" strokeWidth="1.2" />
        <circle cx="-38" cy="66" r="4.5" fill="none" stroke="var(--ochre,#B5673A)" strokeWidth="1.2" />
        <rect x="-18" y="60" width="12" height="14" fill="var(--doorW,#5B4F3C)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
        <rect x="-22" y="74" width="20" height="4" fill="var(--sand,#E7DBBB)" stroke="var(--ink,#3A342B)" strokeWidth="0.5" />
        <rect x="-26" y="78" width="28" height="4" fill="var(--sand,#E7DBBB)" stroke="var(--ink,#3A342B)" strokeWidth="0.5" />
      </g>
      <g transform="skewY(-26.565)">
        <rect x="86" y="46" width="15" height="34" fill="var(--gold,#E3A93C)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
        <text x="93" y="68" textAnchor="middle" fontSize="11" fill="#3A2E14" style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700 }}>展</text>
      </g>
      <polygon points="0,-59 118,0 0,59 -118,0" transform="translate(12,-4)" fill="var(--capD,#4A4238)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <circle cx="-103" cy="-2" r="2.2" fill="var(--ochre,#B5673A)" stroke="var(--ink,#3A342B)" strokeWidth="0.6" />
      <circle cx="127" cy="-2" r="2.2" fill="var(--ochre,#B5673A)" stroke="var(--ink,#3A342B)" strokeWidth="0.6" />
      {driftwoodTag && (
        <g transform="translate(-46,74)">
          <rect x="-30" y="-9" width="60" height="15" rx="2" fill="var(--card,rgba(250,245,232,0.92))" stroke="var(--gold,#E3A93C)" strokeWidth="0.75" />
          <text x="0" y="2.5" textAnchor="middle" fontSize="9" fill="var(--gold2,#8A6A1E)" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
            曾为散木 · 已移栽
          </text>
        </g>
      )}
      {showDayBadge && (
        <g transform="translate(12,-100)">
          <rect x="-48" y="-10" width="96" height="18" rx="9" fill="var(--capB,#2E5E8C)" />
          <text x="0" y="3" textAnchor="middle" fontSize="10" fill="var(--fi-paper, #F2EAD8)" style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>
            对外视图 · D(t)
          </text>
        </g>
      )}
      {selected && <SelectionHighlight cx={12} cy={28} />}
      <NameCard x={12} y={-72} width={52} text={label?.text ?? '展厅'} sealColor={label?.sealColor ?? '#4A4238'} />
    </g>
  );
}

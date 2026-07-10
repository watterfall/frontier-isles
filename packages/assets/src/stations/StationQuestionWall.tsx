import { SelectionHighlight, type StationProps } from '../NameCard';

/**
 * 问题墙 · Question Wall — the island's genesis station (docs/architecture.md §3).
 * Extracted verbatim from the L1 `<g transform="translate(976,392)">` block:
 * five pinned question cards (one gold-stroked focus card) and the
 * breathing gold "问题墙 · QFT ↗" header pill.
 *
 * Passing `label` swaps the header pill's text/dot color but keeps the
 * gold border + `breathe` animation that makes this station's card
 * distinct from the plain name cards on the other stations.
 */
export function StationQuestionWall({ x = 976, y = 392, onClick, selected = false, label, showLabel = true }: StationProps) {
  return (
    <g transform={`translate(${x},${y})`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
      <ellipse cx="36" cy="42" rx="88" ry="34" fill="var(--shadow,rgba(58,48,36,0.16))" />
      <polygon points="-24,-32 72,16 72,60 -24,12" fill="var(--wall,#F8F1DE)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <polygon points="96,4 72,16 72,60 96,48" fill="var(--wallSh,#E7DABE)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      {/* pinned question cards */}
      <g transform="skewY(26.565)">
        <rect x="-14" y="-8" width="10" height="12" fill="#FBF6E9" stroke="var(--ink,#3A342B)" strokeWidth="0.75" transform="rotate(-4 -9 -2)" />
        <rect x="4" y="-13" width="10" height="12" fill="#FBF6E9" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
        {/* gold-stroked focus card */}
        <rect x="22" y="-15" width="13" height="15" fill="#FBF6E9" stroke="var(--gold,#E3A93C)" strokeWidth="1.5" />
        <rect x="42" y="-9" width="10" height="12" fill="#FBF6E9" stroke="var(--ink,#3A342B)" strokeWidth="0.75" transform="rotate(5 47 -3)" />
        <rect x="56" y="2" width="10" height="12" fill="#FBF6E9" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
        <circle cx="28.5" cy="-17" r="1.8" fill="var(--ochre,#B5673A)" />
      </g>
      <polygon points="0,-34 68,0 0,34 -68,0" transform="translate(36,-18)" fill="var(--capD,#4A4238)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <circle cx="-30" cy="-18" r="2.2" fill="var(--ochre,#B5673A)" stroke="var(--ink,#3A342B)" strokeWidth="0.6" />
      <circle cx="102" cy="-18" r="2.2" fill="var(--ochre,#B5673A)" stroke="var(--ink,#3A342B)" strokeWidth="0.6" />
      {selected && <SelectionHighlight cx={36} cy={12} />}
      {showLabel && (
        <g
          transform="translate(36,-64)"
          style={{ animation: 'breathe 4.5s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }}
        >
          <rect x="-56" y="-12" width="112" height="23" rx="3" fill="var(--card,rgba(250,245,232,0.92))" stroke="var(--gold,#E3A93C)" strokeWidth="1.5" />
          <text x="0" y="4" textAnchor="middle" fontSize="12" fill="var(--inkT,#2B2620)" style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 600 }}>
            {label?.text ?? '问题墙 · QFT ↗'}
          </text>
          {label && <circle cx="-46" cy="-0.5" r="2.5" fill={label.sealColor} />}
        </g>
      )}
    </g>
  );
}

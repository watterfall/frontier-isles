import { SelectionHighlight, type StationProps } from '../NameCard';

export interface DriftwoodGardenProps extends StationProps {
  /** Shows the dashed gold "移栽 ↗" (transplant) tag near the fence gap. */
  showTransplantTag?: boolean;
}

/**
 * 散木园 · Driftwood Garden — Night wilds, AI's default landing, private
 * by default (docs/architecture.md §3/§4). Extracted verbatim from the L1
 * `<g transform="translate(790,606)">` block: dashed diamond plot, post
 * fence, a crooked tree, and scattered half-formed pieces.
 */
export function DriftwoodGarden({ x = 790, y = 606, onClick, selected = false, label, showTransplantTag = true, showLabel = true }: DriftwoodGardenProps) {
  return (
    <g transform={`translate(${x},${y})`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
      <polygon points="0,0 108,54 0,108 -108,54" fill="var(--garden,#DFE6CC)" stroke="var(--ink,#3A342B)" strokeWidth="1" strokeDasharray="5 4" />
      {/* fence posts */}
      <g stroke="var(--trunk,#7A5B3E)" strokeWidth="1.5">
        <line x1="22" y1="3" x2="22" y2="13" />
        <line x1="44" y1="14" x2="44" y2="24" />
        <line x1="66" y1="25" x2="66" y2="35" />
        <line x1="88" y1="36" x2="88" y2="46" />
        <line x1="-22" y1="3" x2="-22" y2="13" />
        <line x1="-44" y1="14" x2="-44" y2="24" />
        <line x1="-66" y1="25" x2="-66" y2="35" />
        <line x1="-88" y1="36" x2="-88" y2="46" />
      </g>
      {/* crooked tree */}
      <g transform="translate(-30,58)">
        <path d="M 0 0 C -4 -12 6 -14 2 -26 C 0 -32 8 -34 10 -40" stroke="var(--trunk,#7A5B3E)" strokeWidth="2.5" fill="none" />
        <circle cx="10" cy="-42" r="7" fill="var(--treeG,#4E7D62)" opacity="0.85" />
        <circle cx="0" cy="-30" r="5" fill="var(--treeG,#4E7D62)" opacity="0.6" />
      </g>
      {/* scattered driftwood pieces */}
      <path d="M 36 74 l 10 -5 5 5 -3 7 -10 2 Z" fill="var(--wallSh,#E7DABE)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
      <rect x="-8" y="78" width="22" height="8" rx="4" fill="#FBF6E9" stroke="var(--ink,#3A342B)" strokeWidth="0.75" transform="rotate(-8 3 82)" />
      <rect x="20" y="46" width="16" height="12" fill="none" stroke="var(--ink,#3A342B)" strokeWidth="0.75" strokeDasharray="2 2" transform="rotate(6 28 52)" />
      {selected && <SelectionHighlight cx={0} cy={54} />}
      {showLabel && (
        <g transform="translate(0,118)">
          <rect x="-56" y="-11" width="112" height="21" rx="3" fill="var(--card,rgba(250,245,232,0.92))" stroke="var(--ink,#3A342B)" strokeWidth="0.75" />
          <circle cx="-46" cy="-0.5" r="2.5" fill={label?.sealColor ?? '#6B6154'} />
          <text x="4" y="4" textAnchor="middle" fontSize="12" fill="var(--inkT,#2B2620)" style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 600 }}>
            {label?.text ?? '散木园'} <tspan fontSize="10" fill="var(--ink2,#6B6154)">· 无考核野地</tspan>
          </text>
        </g>
      )}
      {showTransplantTag && (
        <>
          <path d="M -26 40 Q -70 14 -90 -10" fill="none" stroke="var(--gold,#E3A93C)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.85" />
          <g transform="translate(-50,62)">
            <rect x="-26" y="-10" width="52" height="18" rx="3" fill="var(--card,rgba(250,245,232,0.92))" stroke="var(--gold,#E3A93C)" strokeWidth="1" />
            <text x="0" y="3" textAnchor="middle" fontSize="10" fill="var(--gold2,#B5673A)" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
              移栽 ↗
            </text>
          </g>
        </>
      )}
    </g>
  );
}

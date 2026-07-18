const AI_ROLE_GLYPH: Record<'scout' | 'advocate' | 'synthesizer' | 'ferryman', string> = {
  // 文献斥候 · 魔鬼辩护人 · 综合者 · 连接协调员 (stable role id remains ferryman)
  scout: '斥',
  advocate: '辩',
  synthesizer: '综',
  ferryman: '联',
};

export interface ResidentFigureProps {
  kind: 'human' | 'ai';
  /** Required when kind === 'ai' — selects the square seal glyph. */
  aiRole?: 'scout' | 'advocate' | 'synthesizer' | 'ferryman';
  x?: number;
  y?: number;
  /** Mirrors the figure (`scale(-1,1)`), as the prototype does for
   * figures walking/facing left (e.g. 林徽, 苏樱). */
  flip?: boolean;
  /** Optional caption below the figure, e.g. "沈括 · 在问题墙". */
  caption?: string;
  /** Renders the stick figure in `var(--inkT,...)` / a dimmer caption
   * color, matching the night-watch pose (沈括 · 守夜, line ~322). */
  nightWatch?: boolean;
  /** Adds the small canvas-panel prop a figure can carry (林徽, line ~314). */
  carryingCanvas?: boolean;
}

/**
 * A single resident on the island — human stick figure in solid ink, or
 * an AI resident in dashed AI_INK stroke with a square seal glyph below
 * (docs/architecture.md §3 "Humans and agents share one permission
 * model, distinguished by actor kind"). Extracted verbatim from the L1
 * resident groups (design/handoff/问题群岛-原型 v3.dc.html lines ~313-325).
 */
export function ResidentFigure({
  kind,
  aiRole,
  x = 0,
  y = 0,
  flip = false,
  caption,
  nightWatch = false,
  carryingCanvas = false,
}: ResidentFigureProps) {
  const bodyPath = 'M 0 -6 L 0 2 M 0 2 L -3 8 M 0 2 L 3 8 M -4 -3 L 4 -2';

  if (kind === 'ai') {
    const glyph = aiRole ? AI_ROLE_GLYPH[aiRole] : AI_ROLE_GLYPH.scout;
    return (
      <g transform={`translate(${x},${y})`}>
        <g transform={flip ? 'scale(-1,1)' : undefined}>
          <circle cx="0" cy="-9" r="2.6" fill="none" stroke="#5A6C9E" strokeWidth="1.3" />
          <path d={bodyPath} stroke="#5A6C9E" strokeWidth="1.4" strokeDasharray="2.5 1.8" strokeLinecap="round" fill="none" />
          <rect x="-5" y="11" width="10" height="10" rx="1.5" fill="#5A6C9E" />
          <text x="0" y="18.8" textAnchor="middle" fontSize="7.5" fill="var(--fi-paper, #F2EAD8)" style={{ fontFamily: "'Noto Serif SC',serif" }}>
            {glyph}
          </text>
        </g>
        {caption && (
          <text x="0" y="31" textAnchor="middle" fontSize="8.5" fill="var(--ink2,#6B6154)" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
            {caption}
          </text>
        )}
      </g>
    );
  }

  const ink = nightWatch ? 'var(--inkT,#C9D0E4)' : 'var(--ink,#3A342B)';
  const captionFill = nightWatch ? '#8B94B2' : 'var(--ink2,#6B6154)';

  return (
    <g transform={`translate(${x},${y})`}>
      <g transform={flip ? 'scale(-1,1)' : undefined}>
        <circle cx="0" cy="-9" r="2.6" fill={ink} />
        <path d={bodyPath} stroke={ink} strokeWidth="1.4" strokeLinecap="round" fill="none" />
        {carryingCanvas && <rect x="4" y="-7" width="5" height="7" rx="1" fill="#FBF6E9" stroke={ink} strokeWidth="0.6" />}
      </g>
      {caption && (
        <text x="0" y="20" textAnchor="middle" fontSize="8.5" fill={captionFill} style={{ fontFamily: "'PingFang SC',sans-serif" }}>
          {caption}
        </text>
      )}
    </g>
  );
}

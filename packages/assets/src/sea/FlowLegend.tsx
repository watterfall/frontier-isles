/**
 * 流例 Flow legend (depth-plan-v2 §2) — the persistent key that makes a moving
 * sea decodable instead of decorative. Ships WITH <Current>: it reuses the exact
 * CURRENT_STYLE table (colour + dash = relation type) AND spells out the two
 * non-colour channels a deuteranope needs — dash separates the three KINDS, and
 * head SHAPE separates the two epistemic SIGNS (arrow = supports, tee = disputes).
 */
import { CURRENT_STYLE, CurrentDefs, type CurrentKindName } from './Current';

export interface FlowLegendProps {
  x?: number;
  y?: number;
}

const KINDS: CurrentKindName[] = ['evidence', 'bridge', 'lineage'];

export function FlowLegend({ x = 0, y = 0 }: FlowLegendProps) {
  const rowH = 22;
  const panelW = 200;
  const panelH = 30 + KINDS.length * rowH + 40;
  const azurite = `var(${CURRENT_STYLE.evidence.token}, ${CURRENT_STYLE.evidence.fallback})`;
  const signY = 40 + KINDS.length * rowH + 4;
  return (
    <g transform={`translate(${x},${y})`} data-fi="flow-legend">
      <CurrentDefs />
      <rect
        x="0"
        y="0"
        width={panelW}
        height={panelH}
        rx="10"
        fill="var(--card, rgba(250,245,232,0.95))"
        stroke="var(--fi-ink-2, #6B6154)"
        strokeWidth="1"
        opacity="0.96"
      />
      <text x="14" y="20" fontSize="11" fill="var(--fi-ink, #2B2620)" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
        流例 · 色+虚=类型 头=立场 宽=权重
      </text>

      {/* KIND channel: colour + dash (no marker — heads mean sign, not kind) */}
      {KINDS.map((kind, i) => {
        const style = CURRENT_STYLE[kind];
        const ry = 40 + i * rowH;
        const stroke = `var(${style.token}, ${style.fallback})`;
        return (
          <g key={kind}>
            <path
              d={`M 14 ${ry} L 56 ${ry}`}
              fill="none"
              stroke={stroke}
              strokeWidth={kind === 'bridge' ? 3.4 : 2.2}
              strokeLinecap="round"
              strokeDasharray={style.dash || undefined}
            />
            <text
              x="66"
              y={ry + 3.5}
              fontSize="10.5"
              fill="var(--fi-ink-2, #6B6154)"
              style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}
            >
              {style.label}
            </text>
          </g>
        );
      })}

      {/* SIGN channel: same azurite, opposite head shape (deuteranope-safe) */}
      <path d={`M 14 ${signY} L 40 ${signY}`} fill="none" stroke={azurite} strokeWidth="2.2" markerEnd="url(#fi-arrow-affirm)" />
      <text x="46" y={signY + 3.5} fontSize="9.5" fill="var(--fi-ink-2, #6B6154)" style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>
        →支持
      </text>
      <path d={`M 108 ${signY} L 134 ${signY}`} fill="none" stroke={azurite} strokeWidth="2.2" markerEnd="url(#fi-tee-contest)" />
      <text x="140" y={signY + 3.5} fontSize="9.5" fill="var(--fi-ink-2, #6B6154)" style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>
        ⊣争议
      </text>

      {/* maturity note — strait (proposed) vs isthmus (ratified), now on opacity */}
      <text
        x="14"
        y={panelH - 8}
        fontSize="9"
        fill="var(--fi-ink-2, #6B6154)"
        style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}
      >
        淡=proposed 实=ratified
      </text>
    </g>
  );
}

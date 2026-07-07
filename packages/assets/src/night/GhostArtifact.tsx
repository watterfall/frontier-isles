export type GhostArtifactType = 'card' | 'prototype' | 'canvas';

export interface GhostArtifactProps {
  type: GhostArtifactType;
  x?: number;
  y?: number;
  caption?: string;
  opacity?: number;
}

const DEFAULTS: Record<GhostArtifactType, { x: number; y: number; caption: string; floatSeconds: number; floatDelay: number; textY: number }> = {
  card: { x: 1030, y: 436, caption: '废弃的问题卡 · 第12夜', floatSeconds: 5, floatDelay: 0, textY: 14 },
  prototype: { x: 560, y: 518, caption: '失败的原型 · 第41夜', floatSeconds: 5.8, floatDelay: 0.6, textY: 14 },
  canvas: { x: 700, y: 398, caption: '废稿画布 · 第63夜', floatSeconds: 5.4, floatDelay: 1.1, textY: 10 },
};

/**
 * 魂影 · ghost — a night-only relic of something the island once tried
 * and let go of (docs/architecture.md §9 glossary: "魂影 ghost"). The
 * three shapes are extracted verbatim from the L1 "魂影三件" group
 * (design/handoff/问题群岛-原型 v3.dc.html lines ~350-356): a dashed
 * question card, a broken-neck flask (failed prototype), and a torn
 * canvas panel.
 */
export function GhostArtifact({ type, x, y, caption, opacity = 1 }: GhostArtifactProps) {
  const d = DEFAULTS[type];
  const px = x ?? d.x;
  const py = y ?? d.y;
  const text = caption ?? d.caption;

  return (
    <g transform={`translate(${px},${py})`} opacity={opacity} style={{ transition: 'opacity .8s ease' }}>
      <g
        style={{
          animation: `ghostFloat ${d.floatSeconds}s ease-in-out infinite${d.floatDelay ? ` ${d.floatDelay}s` : ''}`,
          animationPlayState: 'var(--play,running)' as never,
        }}
      >
        {type === 'card' && (
          <>
            <rect x="-11" y="-36" width="22" height="28" rx="2" fill="rgba(201,215,242,0.4)" stroke="#9FB2D8" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="-6" y1="-27" x2="6" y2="-27" stroke="#9FB2D8" strokeWidth="1" />
            <line x1="-6" y1="-21" x2="6" y2="-21" stroke="#9FB2D8" strokeWidth="1" />
            <line x1="-8" y1="-33" x2="8" y2="-13" stroke="#9FB2D8" strokeWidth="1.2" />
          </>
        )}
        {type === 'prototype' && (
          <>
            <path
              d="M -4 -36 l 8 0 0 10 8 16 a 4 4 0 0 1 -4 6 l -16 0 a 4 4 0 0 1 -4 -6 l 8 -16 Z"
              fill="rgba(201,215,242,0.4)"
              stroke="#9FB2D8"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <path d="M -7 -12 q 7 5 14 0" stroke="#9FB2D8" strokeWidth="1" fill="none" />
          </>
        )}
        {type === 'canvas' && (
          <>
            <rect x="-15" y="-32" width="30" height="21" rx="2" fill="rgba(201,215,242,0.4)" stroke="#9FB2D8" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M -10 -24 q 6 -6 10 2 t 10 -2" stroke="#9FB2D8" strokeWidth="1" fill="none" />
          </>
        )}
      </g>
      {text && (
        <text x="0" y={d.textY} textAnchor="middle" fontSize="9.5" fill="#8B94B2" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
          {text}
        </text>
      )}
    </g>
  );
}

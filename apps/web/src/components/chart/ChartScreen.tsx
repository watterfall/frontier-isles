import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SceneDefs,
  GrainOverlay,
  WaveGroup,
  DEFAULT_WAVE_POSITIONS,
  Compass,
  IslandFingerprint,
  hashSeed,
} from '@frontier-isles/assets';
import { DOMAIN_META, STAGE_LABELS, type IslandDatum } from '../../api/fallback';
import { spaceIslands } from '../../chart/despace';

/**
 * ChartScreen (L0) — the hand-drawn sea chart of frontier islands.
 *
 * The v2 「海即数据」 sea-plane (currents / whirlpools / straits / climate field /
 * flow legend), the hardcoded inter-island relations (bridges / lineage), the
 * domain-category UI and several numeric readouts are intentionally NOT rendered
 * here — they read as cluttered/occluding and the relation model needs a better
 * representation first. The code + tests for the sea plane are retained
 * (SeaLayer / core.currents / renderer.sea / assets/sea); this screen just does
 * not mount them. See ROADMAP §3.10 (relations rework) and §3.11 (canvas scaling).
 */

export interface ChartScreenProps {
  islands: IslandDatum[];
  /** Kept for API compatibility; the domain filter UI is currently hidden. */
  filter?: string;
  onFilter?: (f: string) => void;
  hover: number | null;
  onHover: (id: number | null) => void;
  onIsland: (d: IslandDatum) => void;
  onBuild: () => void;
  onCollide: () => void;
  /** Kept for API compatibility; bridge arcs are currently hidden. */
  onBridge?: (b: { fromPos: { x: number; y: number }; toPos: { x: number; y: number }; arc: { cx: number; cy: number }; toSlug: string; toX: number; toY: number }) => void;
}

/** CJK glyphs render roughly full-em; Latin roughly 0.56em. Used to size name pills without measuring. */
// CJK radicals+ideographs, CJK symbols/punct, fullwidth forms, kana.
const CJK_RE = /[⺀-鿿　-〿＀-￯぀-ヿ]/;
const charW = (ch: string, fontPx: number): number => (CJK_RE.test(ch) ? fontPx : fontPx * 0.56);
const estWidth = (s: string, fontPx: number): number => {
  let w = 0;
  for (const ch of s) w += charW(ch, fontPx);
  return w;
};
/** Trim a caption to a max pixel width (both languages) so long en titles never overflow the mound. */
function truncateToWidth(s: string, maxW: number, fontPx: number): string {
  if (estWidth(s, fontPx) <= maxW) return s;
  const ell = charW('…', fontPx);
  let out = '';
  let w = 0;
  for (const ch of s) {
    const cw = charW(ch, fontPx);
    if (w + cw + ell > maxW) break;
    out += ch;
    w += cw;
  }
  return out + '…';
}

export interface DensityTier {
  h1: boolean;
  h2: boolean;
  h3: boolean;
  veg1: boolean;
  veg2: boolean;
}

/**
 * Building/vegetation *count* is a density pre-echo of growth stage (depth-plan-v1
 * §5: "the L0 form should pre-echo its L1 richness"): hut shows exactly one hut +
 * one alternating veg piece (id-parity picks which, for hand-drawn variety, not
 * rank); academy and school always show both veg pieces plus their extra
 * building tier — density only ever grows with stage, never with anything
 * continuous or per-island. Pure/exported so the stage→count mapping is
 * unit-testable without rendering the SVG.
 */
export function buildingDensityTier(d: Pick<IslandDatum, 'st' | 'dor' | 'id'>): DensityTier {
  return {
    h1: d.st >= 1 && !d.dor,
    h2: d.st >= 2,
    h3: d.st === 3,
    veg1: d.st >= 1 && !d.dor && (d.st >= 2 || d.id % 2 === 0),
    veg2: d.st >= 1 && !d.dor && (d.st >= 2 || d.id % 2 === 1),
  };
}

function Buildings({ d }: { d: IslandDatum }) {
  const { t } = useTranslation();
  const { h1, h2, h3, veg1, veg2 } = buildingDensityTier(d);
  return (
    <>
      {veg1 && (
        <g transform="translate(-38,-2) scale(0.75)">
          <line x1="0" y1="0" x2="0" y2="-10" stroke="#7A5B3E" strokeWidth="2" />
          <path d="M -8 -6 L 0 -18 L 8 -6 Z" fill="#4E7D62" />
        </g>
      )}
      {veg2 && (
        <g>
          <ellipse cx="42" cy="-4" rx="7" ry="4.5" fill="#4E7D62" opacity="0.75" />
          <ellipse cx="33" cy="0" rx="5" ry="3.2" fill="#4E7D62" opacity="0.55" />
        </g>
      )}
      {h1 && (
        <g transform="translate(18,-12)">
          <rect x="-6" y="-8" width="12" height="8" fill="#F8F1DE" stroke="#4A4238" strokeWidth="1" />
          <path d="M -9 -8 L 0 -14.5 L 9 -8 Z" fill="#B5673A" stroke="#4A4238" strokeWidth="0.75" />
        </g>
      )}
      {h2 && (
        <g transform="translate(-12,-14)">
          <rect x="-11" y="-9" width="22" height="9" fill="#F8F1DE" stroke="#4A4238" strokeWidth="1" />
          <path d="M -14.5 -9 L -8 -16 L 8 -16 L 14.5 -9 Z" fill="#2E5E8C" stroke="#4A4238" strokeWidth="0.75" />
          <rect x="-2" y="-6" width="4" height="6" fill="#5B4F3C" />
        </g>
      )}
      {h3 && (
        <g>
          <g transform="translate(-34,-8)">
            <rect x="-9" y="-8" width="18" height="8" fill="#F8F1DE" stroke="#4A4238" strokeWidth="1" />
            <path d="M -12 -8 L -6 -14 L 6 -14 L 12 -8 Z" fill="#3E9B7E" stroke="#4A4238" strokeWidth="0.75" />
          </g>
          <g transform="translate(2,-30)">
            <line x1="0" y1="0" x2="0" y2="-18" stroke="#4A4238" strokeWidth="1.5" />
            <path d="M 0 -18 L 13 -14 L 0 -10 Z" fill="#E3A93C" stroke="#4A4238" strokeWidth="0.75" />
          </g>
        </g>
      )}
      {d.dor && (
        <g>
          <ellipse cx="-16" cy="4" rx="10" ry="4" fill="#8F9B7E" opacity="0.55" />
          <ellipse cx="14" cy="10" rx="8" ry="3.5" fill="#8F9B7E" opacity="0.45" />
          <ellipse cx="0" cy="-14" rx="42" ry="12" fill="#EDE8DA" opacity="0.85" />
          <text x="0" y="-11" textAnchor="middle" fontSize="9" fill="#8C8270" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
            {t('chart.dormantNote')}
          </text>
        </g>
      )}
    </>
  );
}

export function ChartScreen({ islands, hover, onHover, onIsland, onBuild, onCollide }: ChartScreenProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';

  // Deterministic de-overlap of the hand-authored coordinates — no two islands
  // stack, and any future-added island is spaced automatically (ROADMAP §3.11).
  const placed = useMemo(() => spaceIslands(islands, { minDist: 150 }), [islands]);

  const hd = placed.find((d) => d.id === hover);
  const card = hd
    ? {
        id: String(hd.id).padStart(2, '0'),
        left: Math.min(Math.max(hd.x - 132, 16), 1160),
        top: hd.y + 60 > 720 ? hd.y - 260 : hd.y + 62,
        domCol: hd.out ? '#8A6A1E' : DOMAIN_META[hd.d].col,
        stage: `${t(`chart.stages.${STAGE_LABELS[hd.st]}`)}${hd.dor ? ` · ${t('chart.card.dormant')}` : ''}${hd.out ? ` · ${t('chart.card.outlier')}` : ''}`,
        q: hd.q[lang],
        brief: hd.brief?.[lang],
        cluster: hd.cluster?.[lang],
        citation: hd.citation,
        act: hd.a,
        m: hd.m,
        hint: hd.out ? t('chart.card.hintOutlier') : t('chart.card.hintEnter'),
        hintCol: '#B5673A',
      }
    : null;

  return (
    <div data-screen-label="L0 海图" style={{ position: 'absolute', inset: 0, background: '#F2EAD8' }}>
      <svg viewBox="0 0 1440 900" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <SceneDefs />
        <rect x="0" y="0" width="1440" height="900" fill="#F2EAD8" />

        {DEFAULT_WAVE_POSITIONS.map(([x, y], i) => (
          <WaveGroup key={i} x={x} y={y} />
        ))}

        {/* islands — no overlaps (de-spaced), gentle idle bob, level captions */}
        {placed.map((d) => {
          const fill = d.dor ? '#D8D3C2' : d.out ? '#DFD3E6' : DOMAIN_META[d.d].fill;
          const isHover = hover === d.id;
          const cap = truncateToWidth(d.n[lang], 150, 12.5);
          const capW = estWidth(cap, 12.5);
          // Terrain fingerprint (depth-plan-v1 §5): stage is the discrete size/density
          // tier (never a continuous rank), domain picks the coastline grammar, and the
          // seed is stable per island (hash of its slug, falling back to id) so the same
          // island always renders the same coastline (invariant 13).
          const fpStage = d.st <= 0 ? 0 : d.st >= 3 ? 3 : (d.st as 1 | 2);
          const fpSeed = hashSeed(d.slug ?? String(d.id));
          return (
            <g
              key={d.id}
              transform={`translate(${d.x},${d.y}) scale(${d.s})`}
              onMouseEnter={() => onHover(d.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onIsland(d)}
              style={{ cursor: 'pointer' }}
            >
              {/* the isle floats on the water — the caption below stays level */}
              <g style={{ animation: `bob ${7 + (d.id % 5) * 0.6}s ease-in-out infinite`, animationDelay: `${(d.id % 7) * 0.5}s`, animationPlayState: 'var(--play,running)' as never }}>
                <ellipse cx="0" cy="2" rx="70" ry="38" fill="none" pointerEvents="all" />
                {d.out && (
                  <g>
                    <circle cx="0" cy="0" r="72" fill="url(#outGlow)" style={{ animation: 'pulseGlow 3.2s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }} />
                    <text x="0" y="-52" textAnchor="middle" fontSize="10" fill="#8A6A1E" style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", letterSpacing: '0.12em' }}>
                      {t('chart.outlierTag')}
                    </text>
                  </g>
                )}
                <path d="M -70 24 q 34 9 70 9 q 36 0 70 -9" stroke="#BFCEDB" strokeWidth="1.2" fill="none" opacity="0.8" />
                <path d="M -58 34 q 28 7 58 7 q 30 0 58 -7" stroke="#BFCEDB" strokeWidth="1" fill="none" opacity="0.5" />
                <ellipse cx="0" cy="26" rx="58" ry="9" fill="rgba(58,48,36,0.15)" opacity={isHover ? 1 : 0} style={{ transition: 'opacity .35s' }} />
                <g style={{ transform: isHover ? 'translateY(-5px)' : 'translateY(0px)', transition: 'transform .35s cubic-bezier(0.22,1,0.36,1)' }}>
                  <IslandFingerprint domain={d.d} stage={fpStage} seed={fpSeed} fill={fill} lighthouse={!!d.res} />
                  <path d="M -22 -8 Q 0 -15 20 -8" stroke="#4A4238" strokeWidth="0.75" fill="none" opacity="0.3" />
                  <Buildings d={d} />
                </g>
                {d.born && (
                  <g transform="translate(0,-46)" style={{ animation: 'breathe 4s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }}>
                    <rect x="-52" y="-11" width="104" height="21" rx="10" fill="rgba(250,245,232,0.96)" stroke="#3E9B7E" strokeWidth="1.2" />
                    <text x="0" y="4" textAnchor="middle" fontSize="10" fill="#2B7A5F" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
                      {t('chart.bornBadge')}
                    </text>
                  </g>
                )}
                {isHover && <ellipse cx="0" cy="8" rx="76" ry="30" fill="none" stroke="#2E5E8C" strokeWidth="1.5" strokeDasharray="5 5" />}
              </g>
              {/* name caption — level, on a faint pill so long en titles stay legible */}
              <g>
                <rect x={-capW / 2 - 7} y={39} width={capW + 14} height={16} rx={4} fill="rgba(250,245,232,0.82)" />
                <text x="0" y="50" textAnchor="middle" fontSize="12.5" fill="#5B5344" letterSpacing="0.5" style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 600 }}>
                  {cap}
                </text>
              </g>
            </g>
          );
        })}

        {/* compass — enlarged as the map's focal ornament, with a twinkling beacon */}
        <g transform="translate(1356,808) scale(1.32)">
          <Compass x={0} y={0} />
          <circle cx="0" cy="0" r="2.6" fill="#E3A93C" style={{ animation: 'twinkle 2.6s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }} />
        </g>
        <rect x="0" y="0" width="1440" height="900" fill="url(#vig)" style={{ pointerEvents: 'none' }} />
        <GrainOverlay />
      </svg>

      {/* L0 顶部 chrome */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 26px', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ background: 'rgba(250,245,232,0.95)', border: '1.5px solid #3A342B', borderRadius: 4, padding: '12px 9px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, boxShadow: '3px 3px 0 rgba(58,48,36,0.12)' }}>
            {/* Stacked per-glyph — identical to writing-mode:vertical-rl here, but
                robust on systems whose CJK fonts lack vertical metrics. */}
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Noto Serif SC',serif", fontWeight: 900, fontSize: 21, color: '#2B2620', lineHeight: 1.16 }}>
              {['问', '题', '群', '岛'].map((ch) => (
                <span key={ch}>{ch}</span>
              ))}
            </span>
          </div>
          <div style={{ paddingTop: 4 }}>
            <div style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10.5, color: '#6B6154', letterSpacing: '0.22em' }}>{t('chart.latin')}</div>
            <div style={{ fontSize: 11.5, color: '#6B6154', marginTop: 8, maxWidth: 200, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: t('chart.tagline') }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, pointerEvents: 'auto' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(250,245,232,0.95)', border: '1.5px solid #3A342B', borderRadius: 999, padding: '7px 16px', fontSize: 12.5, color: '#A89C88', whiteSpace: 'nowrap' }}>
              {t('chart.searchPlaceholder')}
              <span style={{ marginLeft: 14, fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, border: '1px solid #A89C88', borderRadius: 3, padding: '0 5px' }}>/</span>
            </div>
            <div onClick={onBuild} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: '#2B2620', borderRadius: 999, padding: '5px 14px 5px 6px', userSelect: 'none', border: '1.5px solid #2B2620' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#E3A93C', color: '#3A2E14', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Serif SC',serif", fontSize: 13 }}>{t('chart.buildSeal')}</span>
              <span style={{ fontSize: 12.5, color: '#F2EAD8' }}>{t('chart.build')}</span>
              <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 9.5, color: 'rgba(242,234,216,0.65)' }}>{t('chart.buildHint')}</span>
            </div>
            <div onClick={onCollide} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(250,245,232,0.95)', borderRadius: 999, padding: '5px 13px 5px 10px', userSelect: 'none', border: '1.5px solid #5B45C9', color: '#5B45C9' }}>
              <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 13 }}>↯</span>
              <span style={{ fontSize: 12.5 }}>{t('collision.button')}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 11, color: '#6B6154', background: 'rgba(250,245,232,0.85)', borderRadius: 6, padding: '5px 12px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#E3A93C" opacity="0.4" /><circle cx="7" cy="7" r="2.5" fill="#E3A93C" /></svg>
              {t('chart.legendOutlier')}
            </span>
          </div>
        </div>
      </div>

      {/* 岛卡 */}
      {card && (
        <div style={{ position: 'absolute', left: card.left, top: card.top, width: 264, background: '#FBF6E9', border: '1.5px solid #3A342B', borderRadius: 6, boxShadow: '5px 5px 0 rgba(58,48,36,0.15)', padding: '14px 16px', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 3, border: '0.75px solid rgba(58,52,43,0.35)', borderRadius: 4, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10.5, letterSpacing: '0.12em', fontFamily: "'JetBrains Mono',ui-monospace,monospace", color: card.domCol }}>
              {card.stage}
              {card.cluster && <span style={{ marginLeft: 6, opacity: 0.7 }}>{card.cluster}</span>}
            </span>
            <span style={{ fontSize: 10, color: '#A89C88', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>#{card.id}</span>
          </div>
          <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 15.5, color: '#2B2620', lineHeight: 1.5, margin: '6px 0 8px' }}>{card.q}</div>
          {card.brief && <div style={{ fontSize: 11, color: '#6B6154', lineHeight: 1.6, marginBottom: 8, opacity: 0.85 }}>{card.brief}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#6B6154' }}>
            <span style={{ whiteSpace: 'nowrap' }}>{t('chart.card.activity')}</span>
            <span style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(43,38,32,0.1)', overflow: 'hidden', display: 'block' }}>
              <span style={{ display: 'block', height: '100%', width: `${card.act}%`, background: card.domCol, borderRadius: 3 }} />
            </span>
            <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{card.act}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 11.5, color: '#6B6154', alignItems: 'center' }}>
            <span>{t('chart.card.members', { n: card.m })}</span>
            <span style={{ color: card.hintCol }}>{card.hint}</span>
          </div>
          {card.citation && (
            <div style={{ marginTop: 8, paddingTop: 7, borderTop: '0.75px solid rgba(58,52,43,0.2)' }}>
              <span style={{ fontSize: 9.5, color: '#A89C88', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{t('chart.card.source')} </span>
              <span style={{ fontSize: 10, color: '#8A6A1E' }}>{card.citation.venue} ({card.citation.year})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import {
  SceneDefs,
  GrainOverlay,
  MountainRange,
  SettlementText,
  WaveGroup,
  DEFAULT_WAVE_POSITIONS,
  ChartBridge,
  LineageLine,
  Compass,
  Boat,
  MOUND_PATHS,
} from '@frontier-isles/assets';
import { DOMAIN_META, STAGE_LABELS, type IslandDatum } from '../../api/fallback';
import { BRIDGES } from '@frontier-isles/data';

export interface ChartScreenProps {
  islands: IslandDatum[];
  filter: string;
  onFilter: (f: string) => void;
  hover: number | null;
  onHover: (id: number | null) => void;
  onIsland: (d: IslandDatum) => void;
  onBuild: () => void;
  onCollide: () => void;
  onBridge: (b: { fromPos: { x: number; y: number }; toPos: { x: number; y: number }; arc: { cx: number; cy: number }; toSlug: string; toX: number; toY: number }) => void;
}

const DOMAIN_KEYS = ['全部', '数理', '物质', '生命', '交叉'] as const;

function Buildings({ d }: { d: IslandDatum }) {
  const { t } = useTranslation();
  const h1 = d.st >= 1 && !d.dor;
  const h2 = d.st >= 2;
  const h3 = d.st === 3;
  const veg1 = d.st >= 1 && d.id % 2 === 0 && !d.dor;
  const veg2 = d.st >= 1 && d.id % 2 === 1 && !d.dor;
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

export function ChartScreen({ islands, filter, onFilter, hover, onHover, onIsland, onBuild, onCollide, onBridge }: ChartScreenProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';

  const hd = islands.find((d) => d.id === hover);
  const card = hd
    ? {
        id: String(hd.id).padStart(2, '0'),
        left: Math.min(Math.max(hd.x - 132, 16), 1160),
        top: hd.y + 60 > 720 ? hd.y - 260 : hd.y + 62,
        domLabel: hd.out ? `${t(`chart.filters.${hd.d}`)} · ${t('chart.card.outlier')}` : t(`chart.filters.${hd.d}`),
        domCol: hd.out ? '#8A6A1E' : DOMAIN_META[hd.d].col,
        stage: `${t(`chart.stages.${STAGE_LABELS[hd.st]}`)}${hd.dor ? ` · ${t('chart.card.dormant')}` : ''}`,
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
        <MountainRange />
        <SettlementText />
        {DEFAULT_WAVE_POSITIONS.map(([x, y], i) => (
          <WaveGroup key={i} x={x} y={y} />
        ))}

        {/* 航线 · 渔舟 */}
        <path d="M 110 792 Q 420 722 776 566" fill="none" stroke="#BFCEDB" strokeWidth="1.5" strokeDasharray="2 8" opacity="0.8" />
        <Boat x={478} y={692} variant="sail" bobSeconds={6} />
        <Boat x={1150} y={556} variant="sail" bobSeconds={7} bobDelaySeconds={1} />

        {/* 同方程桥 — navigable ferry routes; click to sail along the arc (§4) */}
        {BRIDGES.map((b, i) => {
          const d = `M ${b.fromPos.x} ${b.fromPos.y} Q ${b.arc.cx} ${b.arc.cy} ${b.toPos.x} ${b.toPos.y}`;
          const toIsland = islands.find((is) => is.slug === b.to);
          const tickX = b.arc.cx;
          const tickY = b.arc.cy;
          return (
            <g key={i} style={{ cursor: 'pointer' }} onClick={() => onBridge({ fromPos: b.fromPos, toPos: b.toPos, arc: b.arc, toSlug: b.to, toX: toIsland?.x ?? b.toPos.x, toY: toIsland?.y ?? b.toPos.y })}>
              <path d={d} fill="none" stroke="#5B45C9" strokeWidth="2.5" opacity="0.25" />
              <path d={d} fill="none" stroke="#8E99BE" strokeWidth="1.5" strokeDasharray="4 5" opacity="0.7" />
              <path d={`M ${tickX - 16} ${tickY} v 7 M ${tickX} ${tickY} v 7 M ${tickX + 16} ${tickY} v 7`} stroke="#5B45C9" strokeWidth="1" opacity="0.5" fill="none" />
              <g transform={`translate(${b.arc.cx}, ${b.arc.cy - 18})`}>
                <rect x="-44" y="-10" width="88" height="18" rx="9" fill="rgba(250,245,232,0.92)" stroke="#5B45C9" strokeWidth="0.75" />
                <text x="0" y="3.5" textAnchor="middle" fontSize="9" fill="#5B45C9" style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>
                  {b.formula}
                </text>
              </g>
            </g>
          );
        })}
        <LineageLine d="M 802 522 Q 866 556 924 602" labelX={872} labelY={556} label={t('chart.lineage')} />

        {/* 20（+新生）座岛 */}
        {islands.map((d) => {
          const fill = d.dor ? '#D8D3C2' : d.out ? '#DFD3E6' : DOMAIN_META[d.d].fill;
          const op = filter === '全部' || d.d === filter ? 1 : 0.16;
          const isHover = hover === d.id;
          return (
            <g
              key={d.id}
              transform={`translate(${d.x},${d.y}) scale(${d.s})`}
              opacity={op}
              onMouseEnter={() => onHover(d.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onIsland(d)}
              style={{ cursor: 'pointer', transition: 'opacity .4s' }}
            >
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
                <path d={MOUND_PATHS[d.id % 5]} fill={fill} stroke="#4A4238" strokeWidth="1.5" />
                <path d="M -22 -8 Q 0 -15 20 -8" stroke="#4A4238" strokeWidth="0.75" fill="none" opacity="0.3" />
                <Buildings d={d} />
              </g>
              {d.sample && (
                <g transform="translate(0,-58)" style={{ animation: 'breathe 4s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }}>
                  <rect x="-52" y="-13" width="104" height="24" rx="4" fill="rgba(250,245,232,0.96)" stroke="#E3A93C" strokeWidth="1.5" />
                  <text x="0" y="4" textAnchor="middle" fontSize="11.5" fill="#8A6A1E" style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 600 }}>
                    {t('chart.sampleBadge')}
                  </text>
                  <line x1="0" y1="11" x2="0" y2="24" stroke="#E3A93C" strokeWidth="1.2" strokeDasharray="2 3" />
                </g>
              )}
              {d.born && (
                <g transform="translate(0,-46)" style={{ animation: 'breathe 4s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }}>
                  <rect x="-44" y="-11" width="88" height="21" rx="10" fill="rgba(250,245,232,0.96)" stroke="#3E9B7E" strokeWidth="1.2" />
                  <text x="0" y="4" textAnchor="middle" fontSize="10" fill="#2B7A5F" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
                    {t('chart.bornBadge')}
                  </text>
                </g>
              )}
              {isHover && <ellipse cx="0" cy="8" rx="76" ry="30" fill="none" stroke="#2E5E8C" strokeWidth="1.5" strokeDasharray="5 5" />}
              <text x="0" y="48" textAnchor="middle" fontSize="12.5" fill="#5B5344" letterSpacing="1" style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 600 }}>
                {d.n[lang]}
              </text>
            </g>
          );
        })}

        <Compass />
        <rect x="0" y="0" width="1440" height="900" fill="url(#vig)" style={{ pointerEvents: 'none' }} />
        <GrainOverlay />
      </svg>

      {/* L0 顶部 chrome */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 26px', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ background: 'rgba(250,245,232,0.95)', border: '1.5px solid #3A342B', borderRadius: 4, padding: '12px 9px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, boxShadow: '3px 3px 0 rgba(58,48,36,0.12)' }}>
            {/* Stacked per-glyph rather than writing-mode:vertical-rl — identical
                rendering for this string, and robust on systems whose CJK fonts
                lack vertical metrics. */}
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Noto Serif SC',serif", fontWeight: 900, fontSize: 21, color: '#2B2620', lineHeight: 1.16 }}>
              {['问', '题', '群', '岛'].map((ch) => (
                <span key={ch}>{ch}</span>
              ))}
            </span>
          </div>
          <div style={{ paddingTop: 4 }}>
            <div style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10.5, color: '#6B6154', letterSpacing: '0.22em' }}>{t('chart.latin')}</div>
            <div style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10.5, color: '#8C8270', letterSpacing: '0.12em', marginTop: 4 }}>{t('chart.meta', { n: islands.length })}</div>
            <div style={{ fontSize: 11.5, color: '#6B6154', marginTop: 10, maxWidth: 200, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: t('chart.tagline') }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, pointerEvents: 'auto' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(250,245,232,0.95)', border: '1.5px solid #3A342B', borderRadius: 999, padding: '7px 16px', fontSize: 12.5, color: '#A89C88', width: 240 }}>
              {t('chart.searchPlaceholder')}
              <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, border: '1px solid #A89C88', borderRadius: 3, padding: '0 5px' }}>/</span>
            </div>
            {DOMAIN_KEYS.map((f) => {
              const on = filter === f;
              return (
                <span
                  key={f}
                  onClick={() => onFilter(f)}
                  style={{ cursor: 'pointer', fontSize: 12, padding: '5px 13px', borderRadius: 999, border: `1.2px solid ${on ? '#2B2620' : '#A89C88'}`, background: on ? '#2B2620' : 'rgba(250,245,232,0.95)', color: on ? '#F2EAD8' : '#6B6154', userSelect: 'none', transition: 'all .25s' }}
                >
                  {t(`chart.filters.${f}`)}
                </span>
              );
            })}
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
              <svg width="26" height="10" viewBox="0 0 26 10"><path d="M 1 8 Q 13 -2 25 8" stroke="#B5673A" strokeWidth="2" fill="none" /></svg>
              {t('chart.legendBridge')}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <svg width="26" height="10" viewBox="0 0 26 10"><path d="M 1 5 L 25 5" stroke="#6B6154" strokeWidth="1.2" strokeDasharray="2 4" fill="none" /></svg>
              {t('chart.legendLineage')}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#E3A93C" opacity="0.4" /><circle cx="7" cy="7" r="2.5" fill="#E3A93C" /></svg>
              {t('chart.legendOutlier')}
            </span>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 24, bottom: 16, fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10.5, color: '#8C8270' }}>{t('chart.footer')}</div>

      {/* 岛卡 */}
      {card && (
        <div style={{ position: 'absolute', left: card.left, top: card.top, width: 264, background: '#FBF6E9', border: '1.5px solid #3A342B', borderRadius: 6, boxShadow: '5px 5px 0 rgba(58,48,36,0.15)', padding: '14px 16px', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 3, border: '0.75px solid rgba(58,52,43,0.35)', borderRadius: 4, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10.5, letterSpacing: '0.12em', fontFamily: "'JetBrains Mono',ui-monospace,monospace", color: card.domCol }}>
              {card.domLabel} · {card.stage}
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

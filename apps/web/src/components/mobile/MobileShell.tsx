import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IslandDatum } from '../../api/fallback';
import { LangToggle } from '../shell/LangToggle';

export interface MobileShellProps {
  islands: IslandDatum[];
}

const DOMAIN_COLOR: Record<string, string> = {
  数理: 'var(--fi-domain-math-ink)',
  物质: 'var(--fi-domain-matter-ink)',
  生命: 'var(--fi-domain-life-ink)',
  交叉: 'var(--fi-domain-cross-ink)',
};
const DOMAIN_LABEL: Record<string, string> = { 数理: 'chart.domains.math', 物质: 'chart.domains.matter', 生命: 'chart.domains.life', 交叉: 'chart.domains.cross' };
type MobileAltitude = 'low' | 'middle' | 'high';
const MOBILE_ALTITUDE_LIFT: Record<MobileAltitude, number> = { low: 0, middle: 17, high: 34 };

/**
 * Read-only does not mean inert. Mobile visitors browse the real atlas data,
 * search it, switch between its spatial and list twins, and inspect one island
 * at a time. Ledger-writing rituals remain a desktop affordance by design.
 */
export function MobileShell({ islands }: MobileShellProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';
  const [seg, setSeg] = useState<'chart' | 'list'>('chart');
  const [query, setQuery] = useState('');
  const [altitude, setAltitude] = useState<MobileAltitude | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(islands[0]?.id ?? null);

  const altitudeById = useMemo(() => {
    const order = [...islands].sort((a, b) => (a.y - b.y) || (a.id - b.id));
    const out = new Map<number, MobileAltitude>();
    order.forEach((island, index) => {
      const q = (index + 0.5) / Math.max(1, order.length);
      out.set(island.id, q <= 1 / 3 ? 'high' : q <= 2 / 3 ? 'middle' : 'low');
    });
    return out;
  }, [islands]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return islands.filter((island) => {
      const matchesQuery = !needle || `${island.n.zh} ${island.n.en} ${island.q.zh} ${island.q.en} ${island.d}`.toLocaleLowerCase().includes(needle);
      return matchesQuery && (!altitude || altitudeById.get(island.id) === altitude);
    });
  }, [altitude, altitudeById, islands, query]);

  const selected = filtered.find((island) => island.id === selectedId) ?? filtered[0] ?? null;
  const plotted = filtered;
  const xs = plotted.map((island) => island.x);
  const ys = plotted.map((island) => island.y);
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 1);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 1);
  const point = (island: IslandDatum) => {
    const band = altitudeById.get(island.id) ?? 'middle';
    return {
      x: 24 + ((island.x - minX) / Math.max(1, maxX - minX)) * 306,
      y: 62 + ((island.y - minY) / Math.max(1, maxY - minY)) * 150 - MOBILE_ALTITUDE_LIFT[band],
    };
  };

  return (
    <main className="fi-mobile-shell">
      <header className="fi-mobile-header">
        <div className="fi-mobile-brand">
          <span aria-hidden="true">问</span>
          <div><strong>问题群岛</strong><small>{t('chart.latin')}</small></div>
        </div>
        <LangToggle />
      </header>

      <section className="fi-mobile-intro">
        <div>
          <span className="fi-mobile-kicker">{t('mobile.caption')}</span>
          <h1>{t('chart.atlasStatus', { count: islands.length })}</h1>
          <p dangerouslySetInnerHTML={{ __html: t('chart.tagline') }} />
        </div>
        <span className="fi-mobile-readonly"><i aria-hidden="true" />{t('mobile.readonly')}</span>
      </section>

      <label className="fi-mobile-search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.8" /><path d="m15 15 4.4 4.4" /></svg>
        <span className="sr-only">{t('chart.searchLabel')}</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('chart.searchPlaceholder')} />
        {query && <button type="button" aria-label={t('chart.searchClear')} onClick={() => setQuery('')}>×</button>}
      </label>

      <div className="fi-mobile-segments" role="tablist" aria-label={t('mobile.note')}>
        <button type="button" role="tab" aria-selected={seg === 'chart'} onClick={() => setSeg('chart')}>{t('mobile.segChart')}</button>
        <button type="button" role="tab" aria-selected={seg === 'list'} onClick={() => setSeg('list')}>{t('mobile.segList')} <span>{filtered.length}</span></button>
      </div>

      <div className="fi-mobile-altitudes" aria-label={t('chart.altitudeLegend')}>
        <span>{t('chart.altitudeLegend')}</span>
        {([null, 'low', 'middle', 'high'] as const).map((band) => (
          <button key={band ?? 'all'} type="button" className={altitude === band ? 'is-active' : ''} aria-pressed={altitude === band} onClick={() => setAltitude(band)}>{t(`chart.altitudes.${band ?? 'all'}`)}</button>
        ))}
      </div>

      <section className="fi-mobile-content">
        {seg === 'chart' ? (
          <>
            <div className="fi-mobile-map">
              <svg viewBox="0 0 354 258" role="img" aria-label={t('mobile.chartHint')}>
                <rect width="354" height="258" fill="var(--fi-paper)" />
                <path d="M -10 66 Q 54 34 126 54 T 270 44 T 368 63 M -12 188 Q 60 154 138 178 T 276 168 T 366 184" fill="none" stroke="rgba(107,97,84,.16)" strokeWidth="1" />
                <path d="M 42 22 Q 94 58 134 26 M 246 222 Q 284 190 334 218" fill="none" stroke="rgba(46,94,140,.2)" strokeWidth="1.2" strokeDasharray="3 5" />
                {plotted.map((island) => {
                  const p = point(island);
                  const active = selected?.id === island.id;
                  const color = DOMAIN_COLOR[island.d] ?? DOMAIN_COLOR.交叉;
                  const rx = 8 + Math.max(0, island.st) * 2.2;
                  const band = altitudeById.get(island.id) ?? 'middle';
                  const depth = band === 'high' ? 12 : band === 'middle' ? 9 : 6;
                  return (
                    <g key={island.slug ?? island.id} role="button" tabIndex={0} aria-label={`${island.n[lang]} · ${t(`chart.altitudes.${band}`)}`} transform={`translate(${p.x},${p.y})`} onClick={() => setSelectedId(island.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedId(island.id); }}>
                      {island.out && <circle r={rx + 9} fill="var(--fi-gamboge)" opacity=".16" />}
                      {active && <circle r={rx + 7} fill="none" stroke="var(--fi-azurite)" strokeWidth="1.2" strokeDasharray="3 3" />}
                      <ellipse cy={depth + rx * .45} rx={rx * .7} ry={rx * .15} fill="var(--fi-ink)" opacity=".1" />
                      <path d={`M ${-rx * .82} 1 Q ${-rx * .36} ${depth * .8} 0 ${depth} Q ${rx * .36} ${depth * .8} ${rx * .82} 1 Q 0 ${rx * .34} ${-rx * .82} 1 Z`} fill="var(--fi-ink-2)" opacity=".68" stroke="var(--fi-ink)" strokeWidth=".55" />
                      <ellipse rx={rx} ry={rx * .58} fill={color} opacity={active ? .95 : .58} stroke="var(--fi-ink)" strokeWidth={active ? 1.3 : .7} />
                      <path d={`M ${-rx * .7} 2 Q 0 ${rx * .45} ${rx * .7} 2`} fill="none" stroke="var(--fi-paper-raised)" strokeWidth=".7" opacity=".55" />
                      {island.st >= 1 && (
                        <g transform="translate(-2,-3)">
                          <rect x="-3.5" y="-5" width="7" height="5" fill="var(--fi-paper-raised)" stroke="var(--fi-ink)" strokeWidth=".55" />
                          <path d="M -5 -5 L 0 -9 L 5 -5 Z" fill={color} stroke="var(--fi-ink)" strokeWidth=".45" />
                        </g>
                      )}
                      {island.st >= 2 && (
                        <g transform="translate(5,-1)">
                          <rect x="-2.5" y="-5" width="5" height="5" fill="var(--fi-paper-raised)" stroke="var(--fi-ink)" strokeWidth=".5" />
                          <path d="M -4 -5 L 0 -8 L 4 -5 Z" fill="var(--fi-gamboge)" stroke="var(--fi-ink)" strokeWidth=".4" />
                        </g>
                      )}
                      {Array.from({ length: Math.min(3, island.m) }, (_, i) => (
                        <circle key={i} cx={-4 + i * 4} cy={rx * .34} r=".9" fill="var(--fi-ink)" opacity=".78" />
                      ))}
                    </g>
                  );
                })}
              </svg>
              <span>{t('mobile.chartHint')}</span>
            </div>
            {selected && <MobileIslandNote island={selected} altitude={altitudeById.get(selected.id) ?? 'middle'} lang={lang} onSelectList={() => setSeg('list')} />}
          </>
        ) : (
          <div className="fi-mobile-list">
            {filtered.length > 0 ? filtered.map((island) => (
              <button key={island.slug ?? island.id} type="button" className={selected?.id === island.id ? 'is-selected' : ''} onClick={() => setSelectedId(island.id)}>
                <i style={{ background: DOMAIN_COLOR[island.d] ?? DOMAIN_COLOR.交叉 }} aria-hidden="true" />
                <span><small>{t(`chart.altitudes.${altitudeById.get(island.id) ?? 'middle'}`)} · {t(DOMAIN_LABEL[island.d] ?? 'chart.domains.cross')} · #{String(island.id).padStart(2, '0')}</small><strong>{island.n[lang]}</strong><em>{island.q[lang]}</em></span>
                <b aria-hidden="true">›</b>
              </button>
            )) : <p className="fi-mobile-empty">{t('chart.searchEmpty')}</p>}
          </div>
        )}
      </section>

      <nav className="fi-mobile-nav" aria-label={t('mobile.note')}>
        <button type="button" aria-current="page"><span aria-hidden="true">⌖</span>{t('mobile.tabs.chart')}</button>
        <button type="button" disabled><span aria-hidden="true">⌁</span>{t('mobile.tabs.bridge')}</button>
        <button type="button" disabled><span aria-hidden="true">◌</span>{t('mobile.tabs.notif')}</button>
        <button type="button" disabled><span aria-hidden="true">印</span>{t('mobile.tabs.mine')}</button>
      </nav>
    </main>
  );
}

function MobileIslandNote({ island, altitude, lang, onSelectList }: { island: IslandDatum; altitude: MobileAltitude; lang: 'zh' | 'en'; onSelectList: () => void }) {
  const { t } = useTranslation();
  return (
    <article className="fi-mobile-island-note" style={{ '--fi-note-domain': DOMAIN_COLOR[island.d] ?? DOMAIN_COLOR.交叉 } as React.CSSProperties}>
      <div><span>{t(`chart.altitudes.${altitude}`)} · {t(DOMAIN_LABEL[island.d] ?? 'chart.domains.cross')} · #{String(island.id).padStart(2, '0')}</span><span>{island.out ? t('chart.card.outlier') : t(`chart.stages.${['空岛', '草棚', '书院', '学派'][island.st] ?? '空岛'}`)}</span></div>
      <h2>{island.n[lang]}</h2>
      <p>{island.q[lang]}</p>
      <footer><span>{t('chart.card.members', { n: island.m })}</span><button type="button" onClick={onSelectList}>{t('mobile.segList')} →</button></footer>
    </article>
  );
}

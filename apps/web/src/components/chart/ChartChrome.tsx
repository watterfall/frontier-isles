import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IslandDatum } from '../../api/fallback';
import type { AtlasControls, AtlasMetrics } from '../../chart/atlasControls';

export interface ChartChromeProps {
  islands: IslandDatum[];
  onPick: (island: IslandDatum) => void;
  onBuild: () => void;
  onCollide: () => void;
  filter?: string;
  onFilter?: (filter: string) => void;
  controls?: AtlasControls | null;
  metrics?: AtlasMetrics | null;
}

const DOMAIN_KEYS = [
  { key: 'math', color: 'var(--fi-domain-math-ink)' },
  { key: 'matter', color: 'var(--fi-domain-matter-ink)' },
  { key: 'life', color: 'var(--fi-domain-life-ink)' },
  { key: 'cross', color: 'var(--fi-domain-cross-ink)' },
] as const;

/**
 * The atlas' instrument layer. It stays visually quiet until used, but every
 * visible affordance is real: `/` focuses search, results sail through the
 * normal L0→L1 route, and all actions are semantic keyboard-reachable buttons.
 */
export function ChartChrome({ islands, onPick, onBuild, onCollide, filter = '全部', onFilter, controls, metrics }: ChartChromeProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [altitude, setAltitude] = useState<'low' | 'middle' | 'high' | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.key === '/' && target?.tagName !== 'INPUT' && target?.tagName !== 'TEXTAREA') {
        event.preventDefault();
        inputRef.current?.focus();
        setSearchOpen(true);
      }
      if (event.key === 'Escape' && document.activeElement === inputRef.current) {
        setQuery('');
        setSearchOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return [];
    return islands
      .filter((island) => `${island.n.zh} ${island.n.en} ${island.q.zh} ${island.q.en} ${island.d}`.toLocaleLowerCase().includes(needle))
      .slice(0, 5);
  }, [islands, query]);

  const choose = (island: IslandDatum) => {
    setSearchOpen(false);
    setQuery('');
    inputRef.current?.blur();
    if (controls && island.slug) controls.enter(island.slug);
    else onPick(island);
  };

  const setDomain = (domain: string) => {
    onFilter?.(domain);
    controls?.focusDomain(domain === '全部' ? null : domain as '数理' | '物质' | '生命' | '交叉');
  };

  const tierLabel = metrics ? t(`chart.tiers.${metrics.tier}`) : t('chart.tiers.loading');
  const detailHint = metrics?.tier === 'mid' ? t('chart.anchorHint') : t('chart.detailHint');

  const setAltitudeBand = (band: 'low' | 'middle' | 'high' | null) => {
    setAltitude(band);
    controls?.focusAltitude(band);
  };

  return (
    <header className="fi-chart-chrome">
      <div className="fi-chart-brand" aria-label={t('chart.brandLabel')}>
        <div className="fi-chart-seal" aria-hidden="true">
          {['问', '题', '群', '岛'].map((ch) => <span key={ch}>{ch}</span>)}
        </div>
        <div className="fi-chart-brand-copy">
          <span className="fi-chart-kicker">{t('chart.latin')}</span>
          <p dangerouslySetInnerHTML={{ __html: t('chart.tagline') }} />
          <span className="fi-chart-live"><i aria-hidden="true" />{t('chart.liveAtlas')}</span>
        </div>
      </div>

      <div className="fi-chart-search-wrap">
        <label className="fi-chart-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.8" /><path d="m15 15 4.4 4.4" /></svg>
          <span className="sr-only">{t('chart.searchLabel')}</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => window.setTimeout(() => setSearchOpen(false), 140)}
            placeholder={t('chart.searchPlaceholder')}
            aria-expanded={searchOpen && query.length > 0}
            aria-controls="atlas-search-results"
          />
          {query ? (
            <button type="button" className="fi-search-clear" aria-label={t('chart.searchClear')} onMouseDown={(event) => event.preventDefault()} onClick={() => setQuery('')}>×</button>
          ) : <kbd>/</kbd>}
        </label>

        {searchOpen && query && (
          <div id="atlas-search-results" className="fi-search-results" role="listbox">
            <div className="fi-search-results-head">
              <span>{t('chart.searchResults')}</span>
              <span>{results.length}</span>
            </div>
            {results.length > 0 ? results.map((island) => (
              <button key={island.slug ?? island.id} type="button" role="option" onMouseDown={(event) => event.preventDefault()} onClick={() => choose(island)}>
                <span className="fi-search-result-mark" data-domain={island.d} aria-hidden="true" />
                <span>
                  <strong>{island.n[lang]}</strong>
                  <small>{island.q[lang]}</small>
                </span>
                <i aria-hidden="true">↗</i>
              </button>
            )) : <p className="fi-search-empty">{t('chart.searchEmpty')}</p>}
          </div>
        )}
      </div>

      <div className="fi-chart-actions">
        <button type="button" className="fi-action fi-action-primary" onClick={onBuild}>
          <span className="fi-action-seal" aria-hidden="true">{t('chart.buildSeal')}</span>
          <span><strong>{t('chart.build')}</strong><small>{t('chart.buildHint')}</small></span>
        </button>
        <button type="button" className="fi-action fi-action-secondary" onClick={onCollide}>
          <span className="fi-action-collision" aria-hidden="true">↯</span>
          <span><strong>{t('collision.button')}</strong><small>{t('chart.collisionHint')}</small></span>
        </button>
      </div>

      <div className="fi-atlas-context" aria-live="polite">
        <span className="fi-atlas-index">{t('chart.atlasStatus', { count: islands.length })} · {tierLabel}</span>
        <div className="fi-domain-key" aria-label={t('chart.domainLegend')}>
          <button type="button" className={filter === '全部' ? 'is-active' : ''} aria-pressed={filter === '全部'} onClick={() => setDomain('全部')}>{t('chart.domains.all')}</button>
          {DOMAIN_KEYS.map((domain) => (
            <button key={domain.key} type="button" className={filter === t(`chart.domains.${domain.key}`) || filter === ({ math: '数理', matter: '物质', life: '生命', cross: '交叉' } as const)[domain.key] ? 'is-active' : ''} aria-pressed={filter === ({ math: '数理', matter: '物质', life: '生命', cross: '交叉' } as const)[domain.key]} onClick={() => setDomain(({ math: '数理', matter: '物质', life: '生命', cross: '交叉' } as const)[domain.key])}><i style={{ background: domain.color }} aria-hidden="true" />{t(`chart.domains.${domain.key}`)}</button>
          ))}
        </div>
      </div>

      <div className="fi-atlas-guidance">
        <div className="fi-guidance-icon" aria-hidden="true"><span>⌖</span><i /></div>
        <div><strong>{t('chart.navigationHint')}</strong><small>{detailHint}</small></div>
      </div>

      <div className="fi-outlier-key"><i aria-hidden="true" />{t('chart.legendOutlier')}</div>

      <div className="fi-altitude-key" aria-label={t('chart.altitudeLegend')}>
        <span><i aria-hidden="true" />{t('chart.altitudeLegend')}</span>
        <div>
          {([null, 'low', 'middle', 'high'] as const).map((band) => (
            <button key={band ?? 'all'} type="button" className={altitude === band ? 'is-active' : ''} aria-pressed={altitude === band} onClick={() => setAltitudeBand(band)}>
              {t(`chart.altitudes.${band ?? 'all'}`)}
            </button>
          ))}
        </div>
        <small>{t('chart.altitudeNote')}</small>
      </div>

      <div className="fi-hierarchy-key" aria-label={t('chart.hierarchyLegend')}>
        <span><i aria-hidden="true" />{t('chart.hierarchyLegend')}</span>
        <div data-tier={metrics?.tier ?? 'loading'}>
          <b className="is-world">{t('chart.hierarchyLevels.world')}</b>
          <b className="is-anchor">{t('chart.hierarchyLevels.anchor')}</b>
          <b className="is-satellite">{t('chart.hierarchyLevels.satellite')}</b>
        </div>
        <small>{metrics ? t('chart.satelliteStatus', { visible: metrics.visibleSatellites, total: metrics.satellites }) : t('chart.tiers.loading')}</small>
        <em>{t('chart.routeLegend')}</em>
        <em>{t('chart.hierarchyNote')}</em>
      </div>

      <nav className="fi-atlas-camera" aria-label={t('chart.cameraControls')}>
        <button type="button" onClick={() => controls?.zoomIn()} disabled={!controls} aria-label={t('chart.zoomIn')}>＋</button>
        <button type="button" onClick={() => controls?.zoomOut()} disabled={!controls} aria-label={t('chart.zoomOut')}>−</button>
        <button type="button" className="fi-camera-reset" onClick={() => controls?.reset()} disabled={!controls} aria-label={t('chart.resetView')}><span aria-hidden="true">⌾</span><small>{t('chart.resetShort')}</small></button>
      </nav>
    </header>
  );
}

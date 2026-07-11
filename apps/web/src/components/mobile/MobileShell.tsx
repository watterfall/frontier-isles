import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SEA_SEED_RELATIONS } from '@frontier-isles/data';
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
type MobileIslandRole = 'anchor' | 'satellite';
type MobileHierarchy = { slug: string; altitude: MobileAltitude; altitudeZ: number; role: MobileIslandRole; parentSlug?: string };
const MOBILE_ALTITUDE_LIFT: Record<MobileAltitude, number> = { low: 0, middle: 17, high: 34 };
const MOBILE_CURRENTS = [...new Map(SEA_SEED_RELATIONS.filter((relation) => relation.anchor !== relation.reactor).map((relation) => {
  const kind = relation.verb.startsWith('bridge') ? 'bridge' : relation.verb === 'fork' || relation.verb === 'merge_back' ? 'lineage' : 'evidence';
  return [`${relation.anchor}:${relation.reactor}:${kind}`, { fromSlug: relation.anchor, toSlug: relation.reactor, kind }] as const;
})).values()];

/** Lightweight phone projection: same geometry-only anchor rule as desktop,
 * but no import of the full archipelago engine into the mobile first bundle. */
export function buildMobileHierarchy(islands: IslandDatum[]): Map<number, MobileHierarchy> {
  const byId = new Map<number, MobileHierarchy>();
  const order = [...islands].sort((a, b) => (a.y - b.y) || (a.id - b.id));
  order.forEach((island, index) => {
    const q = (index + 0.5) / Math.max(1, order.length);
    byId.set(island.id, {
      slug: island.slug ?? `id-${island.id}`,
      altitude: q <= 1 / 3 ? 'high' : q <= 2 / 3 ? 'middle' : 'low',
      altitudeZ: 1 - q,
      role: 'anchor',
    });
  });

  const authoredGroups = new Map<string, IslandDatum[]>();
  for (const island of islands.filter((item) => !item.out)) {
    const slug = island.slug ?? `id-${island.id}`;
    const key = island.cluster?.code ?? `solo:${slug}`;
    authoredGroups.set(key, [...(authoredGroups.get(key) ?? []), island]);
  }
  const groups = [...authoredGroups.values()];
  const centerOf = (members: IslandDatum[]) => ({
    x: members.reduce((sum, island) => sum + island.x, 0) / Math.max(1, members.length),
    y: members.reduce((sum, island) => sum + island.y, 0) / Math.max(1, members.length),
  });
  // Merge nearest authored groups to the same eight-chunk reading as desktop;
  // explicit outliers stay solo navigation marks.
  const targetMergedGroups = Math.max(1, Math.min(8, Math.ceil(islands.length / 3.5)) - islands.filter((item) => item.out).length);
  while (groups.length > targetMergedGroups) {
    let bestA = 0, bestB = 1, best = Infinity;
    for (let a = 0; a < groups.length; a++) {
      for (let b = a + 1; b < groups.length; b++) {
        const ca = centerOf(groups[a]!);
        const cb = centerOf(groups[b]!);
        const domainPenalty = groups[a]![0]?.d === groups[b]![0]?.d ? 0 : 120 ** 2;
        const score = (ca.x - cb.x) ** 2 + (ca.y - cb.y) ** 2 + domainPenalty;
        if (score < best) { best = score; bestA = a; bestB = b; }
      }
    }
    groups[bestA] = [...groups[bestA]!, ...groups[bestB]!];
    groups.splice(bestB, 1);
  }
  groups.push(...islands.filter((item) => item.out).map((item) => [item]));
  for (const members of groups.values()) {
    const center = centerOf(members);
    const anchor = [...members].sort((a, b) => {
      const da = (a.x - center.x) ** 2 + (a.y - center.y) ** 2;
      const db = (b.x - center.x) ** 2 + (b.y - center.y) ** 2;
      return (da - db) || (a.slug ?? `id-${a.id}`).localeCompare(b.slug ?? `id-${b.id}`);
    })[0]!;
    const anchorSlug = anchor.slug ?? `id-${anchor.id}`;
    for (const member of members) {
      const current = byId.get(member.id)!;
      byId.set(member.id, member.id === anchor.id ? { ...current, role: 'anchor' } : { ...current, role: 'satellite', parentSlug: anchorSlug });
    }
  }
  return byId;
}

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
  const [expandedAnchor, setExpandedAnchor] = useState<string | null>(null);

  const mobileHierarchy = useMemo(() => buildMobileHierarchy(islands), [islands]);

  const altitudeById = useMemo(() => new Map([...mobileHierarchy].map(([id, item]) => [id, item.altitude ?? 'middle'] as const)), [mobileHierarchy]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return islands.filter((island) => {
      const matchesQuery = !needle || `${island.n.zh} ${island.n.en} ${island.q.zh} ${island.q.en} ${island.d}`.toLocaleLowerCase().includes(needle);
      return matchesQuery && (!altitude || altitudeById.get(island.id) === altitude);
    });
  }, [altitude, altitudeById, islands, query]);

  const requested = filtered.find((island) => island.id === selectedId) ?? null;
  const requestedHierarchy = requested ? mobileHierarchy.get(requested.id) : null;
  const requestedIsDisclosed = !!requested && (query.trim().length > 0 || requestedHierarchy?.role !== 'satellite' || requestedHierarchy.parentSlug === expandedAnchor);
  const selected = (requestedIsDisclosed ? requested : null) ?? filtered.find((island) => mobileHierarchy.get(island.id)?.role !== 'satellite') ?? filtered[0] ?? null;
  const selectedHierarchy = selected ? mobileHierarchy.get(selected.id) : null;
  const selectedAnchor = selectedHierarchy?.role === 'satellite' ? selectedHierarchy.parentSlug ?? null : selectedHierarchy?.slug ?? null;
  const openAnchor = expandedAnchor;
  const plotted = query.trim() ? filtered : filtered.filter((island) => {
    const hierarchy = mobileHierarchy.get(island.id);
    return hierarchy?.role !== 'satellite' || hierarchy.parentSlug === openAnchor;
  });
  const totalSatellites = [...mobileHierarchy.values()].filter((item) => item.role === 'satellite').length;
  const visibleSatellites = plotted.filter((island) => mobileHierarchy.get(island.id)?.role === 'satellite').length;
  const selectIsland = (island: IslandDatum) => {
    const hierarchy = mobileHierarchy.get(island.id);
    setSelectedId(island.id);
    setExpandedAnchor(hierarchy?.role === 'satellite' ? hierarchy.parentSlug ?? null : hierarchy?.slug ?? null);
  };
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
                {MOBILE_CURRENTS.map((relation) => {
                  const from = plotted.find((island) => island.slug === relation.fromSlug);
                  const to = plotted.find((island) => island.slug === relation.toSlug);
                  if (!from || !to || from.id === to.id) return null;
                  const a = point(from);
                  const b = point(to);
                  const mx = (a.x + b.x) / 2;
                  const my = Math.min(a.y, b.y) - 18;
                  const color = relation.kind === 'bridge' ? 'var(--fi-ochre)' : relation.kind === 'lineage' ? 'var(--fi-malachite)' : 'var(--fi-azurite)';
                  return <path key={`${relation.fromSlug}:${relation.toSlug}:${relation.kind}`} d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`} fill="none" stroke={color} strokeWidth="1.1" opacity=".38" />;
                })}
                {plotted.map((island) => {
                  const p = point(island);
                  const active = selected?.id === island.id;
                  const color = DOMAIN_COLOR[island.d] ?? DOMAIN_COLOR.交叉;
                  const rx = 8 + Math.max(0, island.st) * 2.2;
                  const band = altitudeById.get(island.id) ?? 'middle';
                  const hierarchy = mobileHierarchy.get(island.id);
                  const role = hierarchy?.role ?? 'anchor';
                  const depth = band === 'high' ? 12 : band === 'middle' ? 9 : 6;
                  return (
                    <g key={island.slug ?? island.id} role="button" tabIndex={0} aria-label={`${island.n[lang]} · ${t(`chart.hierarchyLevels.${role}`)} · ${t(`chart.altitudes.${band}`)}`} transform={`translate(${p.x},${p.y})`} onClick={() => selectIsland(island)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') selectIsland(island); }}>
                      {island.out && <circle r={rx + 9} fill="var(--fi-gamboge)" opacity=".16" />}
                      {active && <circle r={rx + 7} fill="none" stroke="var(--fi-azurite)" strokeWidth="1.2" strokeDasharray="3 3" />}
                      {role === 'anchor' && <ellipse cy={rx * .58} rx={rx * .86} ry={rx * .2} fill="none" stroke={color} strokeWidth=".8" opacity=".56" />}
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
            <div className="fi-mobile-hierarchy" aria-live="polite">
              <strong>{t('chart.hierarchyLegend')}</strong>
              <span>{t('chart.satelliteStatus', { visible: visibleSatellites, total: totalSatellites })}</span>
              <small>{t('chart.routeLegend')} · {t('chart.hierarchyNote')}</small>
            </div>
            {selected && <MobileIslandNote island={selected} altitude={altitudeById.get(selected.id) ?? 'middle'} role={selectedHierarchy?.role ?? 'anchor'} satelliteCount={[...mobileHierarchy.values()].filter((item) => item.parentSlug === selectedAnchor).length} expanded={expandedAnchor === selectedAnchor} lang={lang} onToggleGroup={() => setExpandedAnchor(expandedAnchor === selectedAnchor ? null : selectedAnchor)} onSelectList={() => setSeg('list')} />}
          </>
        ) : (
          <div className="fi-mobile-list">
            {filtered.length > 0 ? filtered.map((island) => (
              <button key={island.slug ?? island.id} type="button" className={selected?.id === island.id ? 'is-selected' : ''} onClick={() => selectIsland(island)}>
                <i style={{ background: DOMAIN_COLOR[island.d] ?? DOMAIN_COLOR.交叉 }} aria-hidden="true" />
                <span><small>{t(`chart.hierarchyLevels.${mobileHierarchy.get(island.id)?.role ?? 'anchor'}`)} · {t(`chart.altitudes.${altitudeById.get(island.id) ?? 'middle'}`)} · {t(DOMAIN_LABEL[island.d] ?? 'chart.domains.cross')} · #{String(island.id).padStart(2, '0')}</small><strong>{island.n[lang]}</strong><em>{island.q[lang]}</em></span>
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

function MobileIslandNote({ island, altitude, role, satelliteCount, expanded, lang, onToggleGroup, onSelectList }: { island: IslandDatum; altitude: MobileAltitude; role: MobileIslandRole; satelliteCount: number; expanded: boolean; lang: 'zh' | 'en'; onToggleGroup: () => void; onSelectList: () => void }) {
  const { t } = useTranslation();
  return (
    <article className="fi-mobile-island-note" style={{ '--fi-note-domain': DOMAIN_COLOR[island.d] ?? DOMAIN_COLOR.交叉 } as React.CSSProperties}>
      <div><span>{t(`chart.hierarchyLevels.${role}`)} · {t(`chart.altitudes.${altitude}`)} · {t(DOMAIN_LABEL[island.d] ?? 'chart.domains.cross')} · #{String(island.id).padStart(2, '0')}</span><span>{island.out ? t('chart.card.outlier') : t(`chart.stages.${['空岛', '草棚', '书院', '学派'][island.st] ?? '空岛'}`)}</span></div>
      <h2>{island.n[lang]}</h2>
      <p>{island.q[lang]}</p>
      <footer><span>{t('chart.card.members', { n: island.m })}</span>{satelliteCount > 0 && <button type="button" onClick={onToggleGroup}>{expanded ? t('chart.hierarchyLevels.anchor') : `${t('chart.hierarchyLevels.satellite')} ${satelliteCount}`}</button>}<button type="button" onClick={onSelectList}>{t('mobile.segList')} →</button></footer>
    </article>
  );
}

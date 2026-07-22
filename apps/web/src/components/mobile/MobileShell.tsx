import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SEA_SEED_RELATIONS } from '@frontier-isles/data/sea';
import { api } from '../../api/client';
import type { IslandDatum } from '../../api/fallback';
import { fixtureSeaData } from '../../api/seaFallback';
import { fallbackStructureGraph, fallbackStructures } from '../../api/structureFallback';
import {
  buildConnectionField,
  DISCOVERY_THEME_IDS,
  searchConnectionProblems,
  type ConnectionField,
  type ConnectionFocus,
  type ConnectionPathKind,
} from '../../chart/connectionField';
import { LangToggle } from '../shell/LangToggle';
import { WorldTrail } from '../shell/WorldTrail';
import type { ModelRunReceipt } from '../../models/types';
import { selectWorldTrail } from '../../state/worldTrail';
import { selectRouteOutcome } from '../../state/routeOutcome';

const ModelWorkbench = lazy(() =>
  import('../model/ModelWorkbench').then((module) => ({ default: module.ModelWorkbench })),
);

export interface MobileShellProps {
  islands: IslandDatum[];
  modelRuns?: readonly ModelRunReceipt[];
  onRecordModelRun?: (receipt: ModelRunReceipt) => void;
  worldTrailEnabled?: boolean;
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
 * The atlas and research ledger stay read-only on mobile, but not inert:
 * visitors can browse, search, and inspect the same data. Personal model runs
 * are intentionally writable because they do not mutate the research ledger.
 */
export function MobileShell({ islands, modelRuns = [], onRecordModelRun = () => {}, worldTrailEnabled = true }: MobileShellProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';
  const [seg, setSeg] = useState<'connections' | 'models' | 'chart' | 'list'>('connections');
  const [query, setQuery] = useState('');
  const [altitude, setAltitude] = useState<MobileAltitude | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(islands[0]?.id ?? null);
  const [expandedAnchor, setExpandedAnchor] = useState<string | null>(null);
  const [connectionField, setConnectionField] = useState<ConnectionField | null>(null);
  const showingAtlasTools = seg === 'chart' || seg === 'list';
  const worldTrail = useMemo(() => selectWorldTrail({
    view: 'chart',
    phase: 'atlas',
    islandSlug: null,
    islands: islands.map((island) => ({
      slug: island.slug ?? `id-${island.id}`,
      title: island.n[lang],
      question: island.q[lang],
    })),
    workspace: seg === 'models'
      ? { kind: 'model', familyId: 'synchronization', title: lang === 'zh' ? '同步与共享场' : 'Synchronization & shared fields' }
      : seg === 'connections'
        ? { kind: 'comparisons', title: t('shell.worldTrail.comparisonWorkspace') }
        : null,
    comparisonLabel: seg === 'connections' ? t('shell.worldTrail.comparisons') : null,
  }), [islands, lang, seg, t]);
  const routeOutcome = useMemo(() => selectRouteOutcome({
    islands: islands.map((island) => ({
      slug: island.slug ?? `id-${island.id}`,
      title: island.n[lang],
      question: island.q[lang],
    })),
    modelRuns,
  }), [islands, lang, modelRuns]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [structures, graph, sea] = await Promise.all([api.structures(), api.structureGraph(), api.currents()]);
      if (!alive) return;
      setConnectionField(buildConnectionField(
        structures?.structures ?? fallbackStructures(),
        graph && Array.isArray(graph.mappings) ? graph : fallbackStructureGraph(),
        sea ?? fixtureSeaData(),
        islands,
      ));
    })();
    return () => { alive = false; };
  }, [islands]);

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
          <span className="fi-mobile-kicker">{seg === 'models'
            ? (lang === 'zh' ? '海图只读 · 模型可操作' : 'Atlas read-only · models interactive')
            : t('mobile.caption')}</span>
          <h1>{t('chart.atlasStatus', { count: islands.length })}</h1>
          <p dangerouslySetInnerHTML={{ __html: t('chart.tagline') }} />
        </div>
        <span className="fi-mobile-readonly"><i aria-hidden="true" />{seg === 'models' ? (lang === 'zh' ? '本地建模 · 不写研究账本' : 'Local modeling · no research-ledger write') : t('mobile.readonly')}</span>
      </section>

      {worldTrailEnabled && <WorldTrail projection={worldTrail} outcome={routeOutcome} variant="mobile" />}

      {showingAtlasTools && (
        <label className="fi-mobile-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.8" /><path d="m15 15 4.4 4.4" /></svg>
          <span className="sr-only">{t('chart.searchLabel')}</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('chart.searchPlaceholder')} />
          {query && <button type="button" aria-label={t('chart.searchClear')} onClick={() => setQuery('')}>×</button>}
        </label>
      )}

      <div className="fi-mobile-segments" role="tablist" aria-label={t('mobile.note')}>
        <button type="button" role="tab" aria-selected={seg === 'connections'} onClick={() => setSeg('connections')}>{t('mobile.segConnections')} <span>{connectionField ? connectionField.topics.length + connectionField.paths.length : '…'}</span></button>
        <button type="button" role="tab" aria-selected={seg === 'models'} onClick={() => setSeg('models')}>{lang === 'zh' ? '搭模型' : 'Models'} <span>{modelRuns.length}</span></button>
        <button type="button" role="tab" aria-selected={seg === 'chart'} onClick={() => setSeg('chart')}>{t('mobile.segChart')}</button>
        <button type="button" role="tab" aria-selected={seg === 'list'} onClick={() => setSeg('list')}>{t('mobile.segList')} <span>{filtered.length}</span></button>
      </div>

      {showingAtlasTools && (
        <div className="fi-mobile-altitudes" aria-label={t('chart.altitudeLegend')}>
          <span>{t('chart.altitudeLegend')}</span>
          {([null, 'low', 'middle', 'high'] as const).map((band) => (
            <button key={band ?? 'all'} type="button" className={altitude === band ? 'is-active' : ''} aria-pressed={altitude === band} onClick={() => setAltitude(band)}>{t(`chart.altitudes.${band ?? 'all'}`)}</button>
          ))}
        </div>
      )}

      <section className="fi-mobile-content">
        {seg === 'connections' ? (
          <MobileConnectionField field={connectionField} lang={lang} />
        ) : seg === 'models' ? (
          <Suspense fallback={<p className="fi-mobile-connection-empty">{lang === 'zh' ? '正在准备模型台…' : 'Preparing the model bench…'}</p>}>
            <ModelWorkbench lang={lang} embedded previousRuns={modelRuns} onSave={onRecordModelRun} />
          </Suspense>
        ) : seg === 'chart' ? (
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
        <button type="button" aria-current={seg === 'chart' ? 'page' : undefined} onClick={() => setSeg('chart')}><span aria-hidden="true">⌖</span>{t('mobile.tabs.chart')}</button>
        <button type="button" aria-current={seg === 'connections' ? 'page' : undefined} onClick={() => setSeg('connections')}><span aria-hidden="true">联</span>{t('mobile.tabs.bridge')}</button>
        <button type="button" aria-current={seg === 'models' ? 'page' : undefined} onClick={() => setSeg('models')}><span aria-hidden="true">模</span>{lang === 'zh' ? '模型' : 'Model'}</button>
        <button type="button" disabled><span aria-hidden="true">印</span>{t('mobile.tabs.mine')}</button>
      </nav>
    </main>
  );
}

const MOBILE_CONNECTION_COPY = {
  zh: {
    globalKicker: '尚未进入具体研究', globalTitle: '沿着跨学科主题探索',
    themeKicker: '正在探索一个跨学科主题', problemKicker: '已经进入一个研究问题', problemTitle: '从别的研究里找办法', pathKicker: '两项研究的具体对照', pathTitle: '这条办法能不能借',
    intro: '还没有具体问题时，不必先选领域。先沿一个主题进入，再看它在不同研究里如何变化。',
    guideTitle: '探索路径', guideBorrow: '选主题', guideBoundary: '看跨域变化', guideTest: '进入具体研究',
    starter: '从这些主题开始', starterHint: '四个入口包含成熟线索，也包含尚待映射的空白', more: '查看其余线索', moreThemes: '更多跨学科主题', studyContext: '这两项研究分别在问什么', evidenceDrawer: '查看原始记录与证据', inspect: '查看具体对应与边界',
    search: '已有具体问题？直接寻找', clear: '清除搜索', backGlobal: '← 返回跨学科主题', backTheme: '← 返回这个主题', backProblem: '← 返回这个研究问题',
    loading: '正在读取研究记录…', convergence: '同一种办法，用在不同问题上', direct: '两项研究之间的具体判断',
    problem: '项研究', problems: '项研究', record: '条记录', records: '条记录', shared: '能借用什么', recordName: '记录名称',
    reviewGroup: '查看哪里相同、哪里不同', reviewPath: '查看理由和检验',
    appears: '在这项研究里具体是什么', boundary: '哪里不能照搬',
    prediction: '怎么验证', noBoundary: '这条旧记录没有写明差异。',
    connected: '可以先试这几条办法', none: '还没有记录说明其他研究能怎样帮助这个问题。',
    themeAcross: '这个主题目前出现在哪里', themeMany: '已经在 {{count}} 项研究中形成独立映射。先看它们如何不同。', themeOne: '目前只在 1 项研究中出现，还不能把它当成跨领域共性。', themeGap: '还没有研究形成可靠映射。这是一块等待寻找落点的前沿。', themeGapTitle: '这里仍是一块空白',
    themeContinue: '以这个问题继续', themeStatusGap: '尚无可靠映射', themeStatusOne: '1 个研究落点', themeStatusMany: '{{count}} 个研究落点',
    formulaBoundary: '用了同一个方程，不代表两边的原因相同。还要分别检查边界条件、参数代表什么，以及实际因果过程。',
    ledgerBoundary: '这只是一条支持、反对或借用的记录，不代表两个问题相同。看检验结果和新材料，再决定它是否站得住。',
    validationFallback: '先分别检查两边的边界条件和关键参数，再看同一个办法能否对两项研究都给出可观察的预测。',
    dossier: '这条判断依据什么', assertion: '原材料说了什么', response: '支持或反对的理由', test: '什么结果会让这条判断站不住',
    targetMissing: '可以打开原记录，但这里还没有摘要。', responseMissing: '这条旧记录没有保存理由。', testMissing: '这条旧记录没有保存检验方法。',
    evidence: '可核对的材料', evidenceRole: '作为依据', replicationRole: '复现检查', noEvidence: '没有附上可核对的材料', action: '判断', by: '记录人', openRef: '查看原记录',
    readOnly: '手机可以完整阅读 · 补充理由请使用桌面端',
    kinds: { mathematical: '两边用了同一个方程', bridge: '两项研究可以互相借用', evidence: '材料支持', contradiction: '材料得出不同判断', lineage: '方法被继续使用' },
  },
  en: {
    globalKicker: 'Before choosing a specific study', globalTitle: 'Explore through cross-disciplinary themes',
    themeKicker: 'Exploring a cross-disciplinary theme', problemKicker: 'Inside a concrete research problem', problemTitle: 'Find a useful idea in another study', pathKicker: 'A concrete comparison between two studies', pathTitle: 'Can this idea transfer?',
    intro: 'You do not need to choose a field before you have a concrete problem. Start with a theme, then see how it changes across studies.',
    guideTitle: 'Exploration route', guideBorrow: 'Choose a theme', guideBoundary: 'See cross-field variation', guideTest: 'Enter a concrete study',
    starter: 'Start with these themes', starterHint: 'Four entries include mature leads and open mapping gaps', more: 'See remaining leads', moreThemes: 'More cross-disciplinary themes', studyContext: 'What each study is asking', evidenceDrawer: 'View source records and evidence', inspect: 'See the mapping and boundary',
    search: 'Already have a concrete problem? Find it directly', clear: 'Clear search', backGlobal: '← Back to cross-disciplinary themes', backTheme: '← Back to this theme', backProblem: '← Back to this research problem',
    loading: 'Reading research records…', convergence: 'The same approach, used on different problems', direct: 'A concrete judgment between two studies',
    problem: 'study', problems: 'studies', record: 'record', records: 'records', shared: 'What can transfer', recordName: 'Record name',
    reviewGroup: 'See what matches and what differs', reviewPath: 'See the reasons and test',
    appears: 'What it is in this study', boundary: 'What cannot be copied',
    prediction: 'How to test it', noBoundary: 'This older record did not state the difference.',
    connected: 'Try these leads first', none: 'No record yet explains how another study could help with this problem.',
    themeAcross: 'Where this theme appears now', themeMany: 'It has independent mappings in {{count}} studies. Compare how they differ.', themeOne: 'It currently appears in only one study, so it is not yet a cross-field regularity.', themeGap: 'No study has a reliable mapping yet. This is a frontier waiting for a landing point.', themeGapTitle: 'This remains an open gap',
    themeContinue: 'Continue with this problem', themeStatusGap: 'No reliable mapping yet', themeStatusOne: '1 research landing', themeStatusMany: '{{count}} research landings',
    formulaBoundary: 'Using the same equation does not mean the causes are the same. Check the boundary conditions, what each parameter means, and the actual causal process separately.',
    ledgerBoundary: 'This is one recorded judgment of support, challenge, or reuse; it does not make the problems identical. Use the test and new material to decide whether it holds.',
    validationFallback: 'Check each side\'s boundary conditions and key parameters, then ask whether the same approach makes an observable prediction in both studies.',
    dossier: 'What this judgment is based on', assertion: 'What the source material says', response: 'Reason for support or challenge', test: 'What result would make this judgment fail',
    targetMissing: 'The original record can be opened, but no summary is available here.', responseMissing: 'This older record did not preserve its reason.', testMissing: 'This older record did not preserve a test.',
    evidence: 'Checkable material', evidenceRole: 'Supporting material', replicationRole: 'Replication check', noEvidence: 'No checkable material was attached', action: 'Judgment', by: 'Recorded by', openRef: 'View original record',
    readOnly: 'You can read everything on mobile · use desktop to add a reason',
    kinds: { mathematical: 'Both use the same equation', bridge: 'The studies can inform each other', evidence: 'Material supports the judgment', contradiction: 'The material points to different conclusions', lineage: 'A method was reused' },
  },
} as const;

const mobileCounted = (count: number, singular: string, plural: string): string =>
  `${count} ${count === 1 ? singular : plural}`;

function MobileConnectionField({ field, lang }: { field: ConnectionField | null; lang: 'zh' | 'en' }) {
  const copy = MOBILE_CONNECTION_COPY[lang];
  const [focus, setFocus] = useState<ConnectionFocus>(null);
  const [focusTrail, setFocusTrail] = useState<Array<NonNullable<ConnectionFocus>>>([]);
  const [query, setQuery] = useState('');
  const results = field ? searchConnectionProblems(field, query, lang) : [];
  const convergence = focus?.type === 'convergence'
    ? field?.topics.find((item) => item.id === focus.id) ?? null
    : null;
  const path = focus?.type === 'path'
    ? field?.paths.find((item) => item.id === focus.id) ?? null
    : null;
  const problem = focus?.type === 'problem' ? field?.problems.get(focus.slug) ?? null : null;
  const read = (value: { zh: string; en: string } | undefined): string =>
    value?.[lang] || value?.[lang === 'zh' ? 'en' : 'zh'] || '—';
  const pathKind = (kind: ConnectionPathKind): string => copy.kinds[kind];
  const pathStatement = (item: ConnectionField['paths'][number]): string => item.kind === 'mathematical'
    ? (lang === 'zh' ? `两边都用到：${read(item.label)}` : `Both use: ${read(item.label)}`)
    : read(item.label);
  const starters = field ? DISCOVERY_THEME_IDS.map((id) => field.topics.find((item) => item.id === id)).filter((item): item is ConnectionField['topics'][number] => !!item) : [];
  const starterIds = new Set(starters.map((item) => item.id));
  const remainingThemes = field?.topics.filter((item) => !starterIds.has(item.id)) ?? [];
  const problemSuggestions = problem && field ? [
    ...field.paths.filter((item) => item.from.slug === problem.slug || item.to.slug === problem.slug).map((item) => ({ kind: 'path' as const, id: item.id, item })),
    ...field.convergences.filter((item) => item.members.some((member) => member.problem.slug === problem.slug)).map((item) => ({ kind: 'group' as const, id: item.id, item })),
  ] : [];

  const navigate = (next: ConnectionFocus) => {
    if (focus) setFocusTrail((trail) => [...trail, focus]);
    setFocus(next);
  };
  const goBack = () => {
    const previous = focusTrail.at(-1) ?? null;
    setFocusTrail((trail) => trail.slice(0, -1));
    setFocus(previous);
  };
  const openProblem = (slug: string) => {
    navigate({ type: 'problem', slug });
    setQuery('');
  };
  const renderProblemSuggestion = (suggestion: (typeof problemSuggestions)[number]) => {
    if (suggestion.kind === 'group') {
      return (
        <button type="button" key={suggestion.id} onClick={() => navigate({ type: 'convergence', id: suggestion.id })}>
          <small>{copy.reviewGroup}</small><strong>{read(suggestion.item.sharedCore)}</strong><span>{suggestion.item.members.filter((member) => member.problem.slug !== problem?.slug).map((member) => read(member.problem.title)).join(' · ')}</span>
        </button>
      );
    }
    const other = suggestion.item.from.slug === problem?.slug ? suggestion.item.to : suggestion.item.from;
    return (
      <button type="button" key={suggestion.id} onClick={() => navigate({ type: 'path', id: suggestion.id })}>
        <small>{pathKind(suggestion.item.kind)}</small><strong>{read(other.title)}</strong><span>{pathStatement(suggestion.item)}</span>
      </button>
    );
  };
  const themeStatus = (item: ConnectionField['topics'][number]): string => item.members.length === 0
    ? copy.themeStatusGap
    : item.members.length === 1
      ? copy.themeStatusOne
      : copy.themeStatusMany.replace('{{count}}', String(item.members.length));
  const previousFocus = focusTrail.at(-1) ?? null;
  const backLabel = previousFocus?.type === 'problem' ? copy.backProblem : previousFocus?.type === 'convergence' ? copy.backTheme : copy.backGlobal;
  const panelKicker = path ? copy.pathKicker : problem ? copy.problemKicker : convergence ? copy.themeKicker : copy.globalKicker;
  const panelTitle = path ? copy.pathTitle : problem ? copy.problemTitle : convergence ? read(convergence.title) : copy.globalTitle;
  const themeState = convergence ? convergence.members.length === 0
    ? copy.themeGap
    : convergence.members.length === 1
      ? copy.themeOne
      : copy.themeMany.replace('{{count}}', String(convergence.members.length)) : '';

  return (
    <section className="fi-mobile-connections" aria-label={copy.globalTitle}>
      <header className="fi-mobile-connection-head">
        <small>{panelKicker}</small>
        <h2>{panelTitle}</h2>
        {!focus && <p>{copy.intro}</p>}
      </header>

      {!focus && (
        <section className="fi-mobile-connection-guide" aria-label={copy.guideTitle}>
          <strong>{copy.guideTitle}</strong>
          <ol><li><b>01</b>{copy.guideBorrow}</li><li><b>02</b>{copy.guideBoundary}</li><li><b>03</b>{copy.guideTest}</li></ol>
        </section>
      )}

      {focus && <button type="button" className="fi-mobile-connection-back" onClick={goBack}>{backLabel}</button>}

      {!field ? (
        <p className="fi-mobile-connection-empty">{copy.loading}</p>
      ) : convergence ? (
        <article className="fi-mobile-convergence-detail">
          <header><small>{copy.recordName}: {convergence.title[lang]}</small><h3>{convergence.sharedCore[lang]}</h3></header>
          <section className="fi-mobile-theme-state" data-state={convergence.members.length === 0 ? 'gap' : convergence.members.length === 1 ? 'single' : 'crossing'}>
            <strong>{convergence.members.length === 0 ? copy.themeGapTitle : copy.themeAcross}</strong><p>{themeState}</p>
          </section>
          {convergence.members.length > 0 && <div className="fi-mobile-manifestations">
            {convergence.members.map((member, index) => (
              <article key={member.problem.slug}>
                <header><b>{String(index + 1).padStart(2, '0')}</b><small>{member.problem.domain}</small><h4>{member.problem.title[lang]}</h4></header>
                <p className="fi-mobile-problem-question">{member.problem.question[lang]}</p>
                {member.mapping.correspondences[0] && <p className="fi-mobile-manifestation-lead"><strong>{copy.appears}</strong>{read(member.mapping.correspondences[0].inThisSubstrate)}</p>}
                <details className="fi-mobile-manifestation-detail">
                  <summary>{copy.inspect}</summary>
                  <h5>{copy.appears}</h5>
                  <dl>
                    {member.mapping.correspondences.map((correspondence, correspondenceIndex) => (
                      <div key={`${member.mapping.refHash}:${correspondenceIndex}`}><dt>{read(correspondence.quantity)}</dt><dd>{read(correspondence.inThisSubstrate)}</dd></div>
                    ))}
                  </dl>
                  <h5>{copy.boundary}</h5>
                  <p className="fi-mobile-boundary">{member.mapping.boundary ? read(member.mapping.boundary) : copy.noBoundary}</p>
                  {member.mapping.prediction && <><h5>{copy.prediction}</h5><p>{read(member.mapping.prediction)}</p></>}
                </details>
                <button type="button" className="fi-mobile-theme-continue" onClick={() => openProblem(member.problem.slug)}>{copy.themeContinue} →</button>
              </article>
            ))}
          </div>}
        </article>
      ) : path ? (
        <article className="fi-mobile-path-detail" data-kind={path.kind}>
          <header><small>{pathStatement(path)}</small><h3>{path.from.title[lang]} {lang === 'zh' ? '与' : 'and'} {path.to.title[lang]}</h3></header>
          <div className="fi-mobile-path-answers">
            <section><b>01</b><div><strong>{copy.shared}</strong><h4>{path.label[lang]}</h4>{path.detail && <p>{path.detail[lang]}</p>}</div></section>
            <section><b>02</b><div><strong>{copy.boundary}</strong><p>{path.source === 'curated-math' ? copy.formulaBoundary : copy.ledgerBoundary}</p></div></section>
            <section><b>03</b><div><strong>{copy.prediction}</strong><p>{path.records.find((record) => record.responseTest)?.responseTest ?? copy.validationFallback}</p></div></section>
          </div>
          <details className="fi-mobile-study-context">
            <summary>{copy.studyContext}</summary>
            <div>
              {[path.from, path.to].map((endpoint) => (
                <article key={endpoint.slug}>
                  <small>{endpoint.domain}</small><h4>{endpoint.title[lang]}</h4><p>{endpoint.question[lang]}</p>
                  {endpoint.brief && <span>{endpoint.brief[lang]}</span>}
                  <button type="button" onClick={() => openProblem(endpoint.slug)}>{copy.connected} →</button>
                </article>
              ))}
            </div>
          </details>
          {path.source === 'ledger' && (
            <details className="fi-mobile-evidence-drawer">
              <summary>{copy.evidenceDrawer}<small>{mobileCounted(path.records.length, copy.record, copy.records)}</small></summary>
              <section className="fi-mobile-connection-dossier">
                <h4>{copy.dossier}</h4>
                {path.records.map((record, index) => (
                  <article key={`${record.targetRef}:${record.responseRef ?? record.ts}:${index}`} data-historical={record.historical || undefined}>
                    <header><b>{String(index + 1).padStart(2, '0')}</b><span><strong>{copy.action}: {record.action === 'validate' ? (lang === 'zh' ? '这些材料支持它' : 'This material supports it') : record.action === 'refute' ? (lang === 'zh' ? '这些材料反对它' : 'This material challenges it') : pathStatement(path)}</strong><small>{copy.by} @{record.actor.split(':').at(-1)} · {new Date(record.ts).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en')}</small></span></header>
                    <section>
                      <h5>{copy.assertion}</h5><p>{record.targetSummary ?? copy.targetMissing}</p>
                      <a href={`/api/refs/${encodeURIComponent(record.targetRef)}`} target="_blank" rel="noopener noreferrer">{copy.openRef} ↗</a><code>{record.targetRef}</code>
                      <MobileEvidence title={copy.evidence} evidence={record.targetEvidence} missing={copy.noEvidence} evidenceRole={copy.evidenceRole} replicationRole={copy.replicationRole} />
                    </section>
                    {(record.action === 'validate' || record.action === 'refute') && <section data-missing={!record.responseBody || undefined}>
                      <h5>{copy.response}</h5><p>{record.responseBody ?? copy.responseMissing}</p>
                      {record.responseRef && <><a href={`/api/refs/${encodeURIComponent(record.responseRef)}`} target="_blank" rel="noopener noreferrer">{copy.openRef} ↗</a><code>{record.responseRef}</code></>}
                      <MobileEvidence title={copy.evidence} evidence={record.responseEvidence} missing={copy.noEvidence} evidenceRole={copy.evidenceRole} replicationRole={copy.replicationRole} />
                    </section>}
                    {(record.action === 'validate' || record.action === 'refute') && <section data-missing={!record.responseTest || undefined}><h5>{copy.test}</h5><p>{record.responseTest ?? copy.testMissing}</p></section>}
                  </article>
                ))}
                {path.records.length === 0 && <p>{copy.targetMissing}</p>}
              </section>
            </details>
          )}
        </article>
      ) : problem ? (
        <article className="fi-mobile-problem-connections">
          <header><small>{problem.domain}</small><h3>{problem.title[lang]}</h3><p>{problem.question[lang]}</p></header>
          {problem.brief && <p>{problem.brief[lang]}</p>}
          <h4>{copy.connected} · {problemSuggestions.length}</h4>
          {problemSuggestions.slice(0, 3).map(renderProblemSuggestion)}
          {problemSuggestions.length > 3 && <details className="fi-mobile-more-suggestions"><summary>{copy.more} · {problemSuggestions.length - 3}</summary>{problemSuggestions.slice(3).map(renderProblemSuggestion)}</details>}
          {problemSuggestions.length === 0 && <p className="fi-mobile-connection-empty">{copy.none}</p>}
        </article>
      ) : (
        <div className="fi-mobile-connection-global">
          <section className="fi-mobile-connection-starters">
            <h3>{copy.starter} <span>{copy.starterHint}</span></h3>
            {starters.map((item) => (
              <button type="button" key={item.id} data-topic-state={item.members.length === 0 ? 'gap' : item.members.length === 1 ? 'single' : 'crossing'} onClick={() => navigate({ type: 'convergence', id: item.id })}>
                <span><small>{themeStatus(item)}</small><strong>{read(item.title)}</strong><p>{read(item.sharedCore)}</p></span><b><i aria-hidden="true">→</i></b>
              </button>
            ))}
            {remainingThemes.length > 0 && (
              <details className="fi-mobile-theme-more">
                <summary>{copy.moreThemes}<small>{remainingThemes.length}</small></summary>
                {remainingThemes.map((item) => (
                  <button type="button" key={item.id} onClick={() => navigate({ type: 'convergence', id: item.id })}>
                    <small>{themeStatus(item)}</small><strong>{read(item.title)}</strong><span>{read(item.sharedCore)}</span>
                  </button>
                ))}
              </details>
            )}
          </section>
          <label className="fi-mobile-connection-search">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">{copy.search}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} />
            {query && <button type="button" onClick={() => setQuery('')} aria-label={copy.clear}>×</button>}
          </label>
          {query && (
            <div className="fi-mobile-connection-results" aria-live="polite">
              {results.map((item) => (
                <button type="button" key={item.slug} onClick={() => openProblem(item.slug)}>
                  <small>{item.domain}</small><strong>{item.title[lang]}</strong><span>{item.question[lang]}</span>
                </button>
              ))}
              {results.length === 0 && <p>{copy.none}</p>}
            </div>
          )}
        </div>
      )}

      <footer className="fi-mobile-connection-readonly">{copy.readOnly}</footer>
    </section>
  );
}

function MobileEvidence({ title, evidence, missing, evidenceRole, replicationRole }: {
  title: string;
  evidence?: { ro_crate: string; role: string; hash: string };
  missing: string;
  evidenceRole: string;
  replicationRole: string;
}) {
  return (
    <div className="fi-mobile-connection-evidence" data-missing={!evidence || undefined}>
      <strong>{title}</strong>
      {evidence ? <span><a href={evidence.ro_crate} target="_blank" rel="noopener noreferrer">{evidence.role === 'replication' ? replicationRole : evidenceRole} ↗</a><code>{evidence.hash}</code></span> : <small>{missing}</small>}
    </div>
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

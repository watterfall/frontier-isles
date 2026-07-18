import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SEA_SEED_RELATIONS } from '@frontier-isles/data/sea';
import { api } from '../../api/client';
import type { IslandDatum } from '../../api/fallback';
import { fixtureSeaData } from '../../api/seaFallback';
import { fallbackStructureGraph, fallbackStructures } from '../../api/structureFallback';
import {
  buildConnectionField,
  searchConnectionProblems,
  type ConnectionField,
  type ConnectionFocus,
  type ConnectionPathKind,
} from '../../chart/connectionField';
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
  const [seg, setSeg] = useState<'connections' | 'chart' | 'list'>('connections');
  const [query, setQuery] = useState('');
  const [altitude, setAltitude] = useState<MobileAltitude | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(islands[0]?.id ?? null);
  const [expandedAnchor, setExpandedAnchor] = useState<string | null>(null);
  const [connectionField, setConnectionField] = useState<ConnectionField | null>(null);

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
          <span className="fi-mobile-kicker">{t('mobile.caption')}</span>
          <h1>{t('chart.atlasStatus', { count: islands.length })}</h1>
          <p dangerouslySetInnerHTML={{ __html: t('chart.tagline') }} />
        </div>
        <span className="fi-mobile-readonly"><i aria-hidden="true" />{t('mobile.readonly')}</span>
      </section>

      {seg !== 'connections' && (
        <label className="fi-mobile-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.8" /><path d="m15 15 4.4 4.4" /></svg>
          <span className="sr-only">{t('chart.searchLabel')}</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('chart.searchPlaceholder')} />
          {query && <button type="button" aria-label={t('chart.searchClear')} onClick={() => setQuery('')}>×</button>}
        </label>
      )}

      <div className="fi-mobile-segments" role="tablist" aria-label={t('mobile.note')}>
        <button type="button" role="tab" aria-selected={seg === 'connections'} onClick={() => setSeg('connections')}>{t('mobile.segConnections')} <span>{connectionField ? connectionField.convergences.length + connectionField.paths.length : '…'}</span></button>
        <button type="button" role="tab" aria-selected={seg === 'chart'} onClick={() => setSeg('chart')}>{t('mobile.segChart')}</button>
        <button type="button" role="tab" aria-selected={seg === 'list'} onClick={() => setSeg('list')}>{t('mobile.segList')} <span>{filtered.length}</span></button>
      </div>

      {seg !== 'connections' && (
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
        <button type="button" disabled><span aria-hidden="true">◌</span>{t('mobile.tabs.notif')}</button>
        <button type="button" disabled><span aria-hidden="true">印</span>{t('mobile.tabs.mine')}</button>
      </nav>
    </main>
  );
}

const MOBILE_CONNECTION_COPY = {
  zh: {
    kicker: '已有研究记录', title: '从别的研究里找办法',
    intro: '每条记录都说明：能借什么、哪里不能照搬、怎么验证。',
    search: '先选一个你正在研究的问题', clear: '清除搜索', back: '← 返回所有对照',
    loading: '正在读取研究记录…', convergence: '同一种办法，用在不同问题上', direct: '两项研究之间的具体判断',
    problem: '项研究', problems: '项研究', record: '条记录', records: '条记录', shared: '能借用什么', recordName: '记录名称',
    reviewGroup: '查看哪里相同、哪里不同', reviewPath: '查看理由和检验',
    appears: '在这项研究里具体是什么', boundary: '哪里不能照搬',
    prediction: '怎么验证', noBoundary: '这条旧记录没有写明差异。',
    connected: '这个问题可以对照', none: '还没有记录说明其他研究能怎样帮助这个问题。',
    formulaBoundary: '用了同一个方程，不代表两边的原因相同。还要分别检查边界条件、参数代表什么，以及实际因果过程。',
    ledgerBoundary: '这只是一条支持、反对或借用的记录，不代表两个问题相同。看检验结果和新材料，再决定它是否站得住。',
    dossier: '这条判断依据什么', assertion: '原材料说了什么', response: '支持或反对的理由', test: '什么结果会让这条判断站不住',
    targetMissing: '可以打开原记录，但这里还没有摘要。', responseMissing: '这条旧记录没有保存理由。', testMissing: '这条旧记录没有保存检验方法。',
    evidence: '可核对的材料', evidenceRole: '作为依据', replicationRole: '复现检查', noEvidence: '没有附上可核对的材料', action: '判断', by: '记录人', openRef: '查看原记录',
    readOnly: '手机可以完整阅读 · 补充理由请使用桌面端',
    kinds: { mathematical: '两边用了同一个方程', bridge: '两项研究可以互相借用', evidence: '材料支持', contradiction: '材料得出不同判断', lineage: '方法被继续使用' },
  },
  en: {
    kicker: 'Recorded research comparisons', title: 'Find a useful idea in another study',
    intro: 'Every record states what can transfer, what cannot be copied, and how to test it.',
    search: 'Choose a problem you are working on', clear: 'Clear search', back: '← Back to all comparisons',
    loading: 'Reading research records…', convergence: 'The same approach, used on different problems', direct: 'A concrete judgment between two studies',
    problem: 'study', problems: 'studies', record: 'record', records: 'records', shared: 'What can transfer', recordName: 'Record name',
    reviewGroup: 'See what matches and what differs', reviewPath: 'See the reasons and test',
    appears: 'What it is in this study', boundary: 'What cannot be copied',
    prediction: 'How to test it', noBoundary: 'This older record did not state the difference.',
    connected: 'This problem can be compared with', none: 'No record yet explains how another study could help with this problem.',
    formulaBoundary: 'Using the same equation does not mean the causes are the same. Check the boundary conditions, what each parameter means, and the actual causal process separately.',
    ledgerBoundary: 'This is one recorded judgment of support, challenge, or reuse; it does not make the problems identical. Use the test and new material to decide whether it holds.',
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
  const [query, setQuery] = useState('');
  const results = field ? searchConnectionProblems(field, query, lang) : [];
  const convergence = focus?.type === 'convergence'
    ? field?.convergences.find((item) => item.id === focus.id) ?? null
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

  const openProblem = (slug: string) => {
    setFocus({ type: 'problem', slug });
    setQuery('');
  };

  return (
    <section className="fi-mobile-connections" aria-label={copy.kicker}>
      <header className="fi-mobile-connection-head">
        <small>{copy.kicker}</small>
        <h2>{copy.title}</h2>
        <p>{copy.intro}</p>
      </header>

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

      {focus && <button type="button" className="fi-mobile-connection-back" onClick={() => setFocus(null)}>{copy.back}</button>}

      {!field ? (
        <p className="fi-mobile-connection-empty">{copy.loading}</p>
      ) : convergence ? (
        <article className="fi-mobile-convergence-detail">
          <header><small>{copy.recordName}: {convergence.title[lang]} · {convergence.members.length} {copy.problems}</small><h3>{convergence.sharedCore[lang]}</h3></header>
          <div className="fi-mobile-manifestations">
            {convergence.members.map((member, index) => (
              <article key={member.problem.slug}>
                <header><b>{String(index + 1).padStart(2, '0')}</b><small>{member.problem.domain}</small><h4>{member.problem.title[lang]}</h4></header>
                <p className="fi-mobile-problem-question">{member.problem.question[lang]}</p>
                <h5>{copy.appears}</h5>
                <dl>
                  {member.mapping.correspondences.map((correspondence, correspondenceIndex) => (
                    <div key={`${member.mapping.refHash}:${correspondenceIndex}`}><dt>{read(correspondence.quantity)}</dt><dd>{read(correspondence.inThisSubstrate)}</dd></div>
                  ))}
                </dl>
                <h5>{copy.boundary}</h5>
                <p className="fi-mobile-boundary">{member.mapping.boundary ? read(member.mapping.boundary) : copy.noBoundary}</p>
                {member.mapping.prediction && <><h5>{copy.prediction}</h5><p>{read(member.mapping.prediction)}</p></>}
              </article>
            ))}
          </div>
        </article>
      ) : path ? (
        <article className="fi-mobile-path-detail" data-kind={path.kind}>
          <header><small>{pathStatement(path)}</small><h3>{path.from.title[lang]} {lang === 'zh' ? '与' : 'and'} {path.to.title[lang]}</h3>{path.detail && <><strong>{path.label[lang]}</strong><code>{path.detail[lang]}</code></>}</header>
          <div>
            {[path.from, path.to].map((endpoint) => (
              <article key={endpoint.slug}>
                <small>{endpoint.domain}</small><h4>{endpoint.title[lang]}</h4><p>{endpoint.question[lang]}</p>
                {endpoint.brief && <span>{endpoint.brief[lang]}</span>}
                <button type="button" onClick={() => openProblem(endpoint.slug)}>{copy.connected} →</button>
              </article>
            ))}
          </div>
          {path.source === 'ledger' && (
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
          )}
          <section><strong>{copy.boundary}</strong><p>{path.source === 'curated-math' ? copy.formulaBoundary : copy.ledgerBoundary}</p></section>
        </article>
      ) : problem ? (
        <article className="fi-mobile-problem-connections">
          <header><small>{problem.domain}</small><h3>{problem.title[lang]}</h3><p>{problem.question[lang]}</p></header>
          {problem.brief && <p>{problem.brief[lang]}</p>}
          <h4>{copy.connected}</h4>
          {[...field.convergences.filter((item) => item.members.some((member) => member.problem.slug === problem.slug)).map((item) => (
              <button type="button" key={item.id} onClick={() => setFocus({ type: 'convergence', id: item.id })}>
              <small>{copy.reviewGroup}</small><strong>{item.sharedCore[lang]}</strong><span>{item.members.length} {copy.problems}</span>
            </button>
          )), ...field.paths.filter((item) => item.from.slug === problem.slug || item.to.slug === problem.slug).map((item) => {
            const other = item.from.slug === problem.slug ? item.to : item.from;
            return (
              <button type="button" key={item.id} onClick={() => setFocus({ type: 'path', id: item.id })}>
                <small>{pathKind(item.kind)}</small><strong>{other.title[lang]}</strong><span>{pathStatement(item)}</span>
              </button>
            );
          })]}
          {!field.convergences.some((item) => item.members.some((member) => member.problem.slug === problem.slug))
            && !field.paths.some((item) => item.from.slug === problem.slug || item.to.slug === problem.slug)
            && <p className="fi-mobile-connection-empty">{copy.none}</p>}
        </article>
      ) : !query ? (
        <div className="fi-mobile-connection-global">
          <section>
            <h3>{copy.convergence} <span>{field.convergences.length}</span></h3>
            {field.convergences.map((item) => (
              <button type="button" className="fi-mobile-convergence-row" key={item.id} onClick={() => setFocus({ type: 'convergence', id: item.id })}>
                <MobileHubMark count={item.members.length} />
                <span><small>{copy.recordName}: {item.title[lang]}</small><strong>{item.sharedCore[lang]}</strong><p>{item.members.map((member) => member.problem.title[lang]).join(' · ')}</p><em>{mobileCounted(item.members.length, copy.problem, copy.problems)} · {mobileCounted(item.weight, copy.record, copy.records)} · {copy.reviewGroup}</em></span>
              </button>
            ))}
          </section>
          <section>
            <h3>{copy.direct} <span>{field.paths.length}</span></h3>
            {field.paths.map((item) => (
              <button type="button" className="fi-mobile-path-row" data-kind={item.kind} key={item.id} onClick={() => setFocus({ type: 'path', id: item.id })}>
                <i aria-hidden="true" /><span><small>{pathStatement(item)}</small><strong>{item.from.title[lang]} {lang === 'zh' ? '与' : 'and'} {item.to.title[lang]}</strong><p>{mobileCounted(item.weight, copy.record, copy.records)} · {copy.reviewPath}</p></span>
              </button>
            ))}
          </section>
        </div>
      ) : null}

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

function MobileHubMark({ count }: { count: number }) {
  const endpoints = count >= 3 ? [[8, 9], [44, 9], [26, 38]] : [[8, 12], [44, 34]];
  return (
    <svg className="fi-mobile-hub-mark" viewBox="0 0 52 46" aria-hidden="true">
      {endpoints.map(([x, y], index) => <line key={index} x1="26" y1="23" x2={x} y2={y} />)}
      {endpoints.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="4" />)}
      <circle cx="26" cy="23" r="5.5" />
    </svg>
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

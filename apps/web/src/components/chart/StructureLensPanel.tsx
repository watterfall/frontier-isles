/**
 * StructureLensPanel — the structure-lens selector + its LIST TWIN (执行纲要
 * §九 / architecture invariant "list twins everywhere"). Chrome-family styling
 * (paper card, ink border, display font — same vocabulary as `fi-altitude-key`
 * / `fi-hierarchy-key`), mounted only on the Pixi atlas path.
 *
 * The twin states plainly what the lens draws: 已重建 (solid, from real
 * rebuild events) and 缺口 (dashed — "此结构尚无人带来"). A gap row is pure
 * navigation: it names the island and nothing else — never a suggested
 * mapping (§九 red-line). Structure titles/statements are editorial bilingual
 * content (invariant 9): rendered from the object, not from i18n.
 */
import { createPortal } from 'react-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ApiStructure } from '../../api/client';
import type { IslandDatum } from '../../api/fallback';
import type { PassageIntent, StructureDeparture } from '../../state/explorationSession';

export interface StructureIslandRow {
  d: IslandDatum;
  islandOp: string;
}

export interface StructureLensPanelProps {
  structures: ApiStructure[];
  /** The selected `struct://` id, or null (lens off). */
  selected: string | null;
  onSelect: (id: string | null) => void;
  /** The list twin, resolved to chart islands by the screen. Rebuilt rows
   * carry the edge's real weight + actors (a reduce over rebuild events). */
  rebuilt: Array<StructureIslandRow & { weight: number; actors: string[] }>;
  /** Near gaps: same cluster as a rebuilt island. */
  nearGaps: StructureIslandRow[];
  /** Far gaps: same domain, different cluster (fainter — the map's gradient). */
  farGaps: StructureIslandRow[];
  departure: StructureDeparture | null;
  intent: PassageIntent | null;
  onDeparture: (departure: StructureDeparture) => void;
  onPassage: (intent: PassageIntent, d: IslandDatum) => void;
  /** Sail to an island (controls.enter → the normal L0→L1 route). */
  onEnter: (d: IslandDatum) => void;
}

const handleOf = (actor: string): string => `@${actor.split(':').at(-1) ?? actor}`;
type StructureTheme = NonNullable<ApiStructure['theme']>;
const THEME_ORDER: StructureTheme[] = [
  'unknown-mapping',
  'causal-inference',
  'knowledge-commons',
  'collective-dynamics',
  'simulation-twins',
  'living-computation',
];

export function StructureLensPanel({
  structures,
  selected,
  onSelect,
  rebuilt,
  nearGaps,
  farGaps,
  departure,
  intent,
  onDeparture,
  onPassage,
  onEnter,
}: StructureLensPanelProps) {
  const { t, i18n } = useTranslation();
  const [themeFilter, setThemeFilter] = useState<'all' | StructureTheme>('all');
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';
  if (structures.length === 0) return null;
  const active = selected ? structures.find((s) => s.id === selected) ?? null : null;
  const availableThemes = THEME_ORDER.filter((theme) => structures.some((structure) => structure.theme === theme));
  const effectiveTheme = themeFilter === 'all' || availableThemes.includes(themeFilter) ? themeFilter : 'all';
  const visibleStructures = effectiveTheme === 'all'
    ? structures
    : structures.filter((structure) => structure.theme === effectiveTheme);
  const groups = availableThemes
    .map((theme) => ({ theme, structures: visibleStructures.filter((structure) => structure.theme === theme) }))
    .filter((group) => group.structures.length > 0);
  const unthemed = visibleStructures.filter((structure) => !structure.theme);

  const begin = (row: StructureIslandRow, passageKind: PassageIntent['passageKind']) => {
    if (!active || !departure || row.d.slug === departure.islandSlug) return;
    onPassage({
      ...departure,
      targetIslandSlug: row.d.slug ?? `id-${row.d.id}`,
      targetIslandOp: row.islandOp,
      passageKind,
    }, row.d);
  };

  const gapRows = (rows: StructureIslandRow[]) => rows.map((row) => {
    const slug = row.d.slug ?? `id-${row.d.id}`;
    const isIntent = intent?.targetIslandSlug === slug;
    return (
      <li key={slug} data-intent={isIntent || undefined}>
        <button type="button" className="fi-structure-node" onClick={() => onEnter(row.d)}>
          {row.d.n[lang]}
        </button>
        <button
          type="button"
          className="fi-structure-passage-action"
          data-kind="frontier"
          disabled={!departure}
          onClick={() => begin(row, 'frontier')}
        >
          {t('chart.structures.openFrontier')}
        </button>
      </li>
    );
  });

  const panel = (
    <aside className="fi-structure-key" aria-label={t('chart.structures.legend')}>
      <details open={selected !== null || undefined}>
        <summary><i aria-hidden="true" />{t('chart.structures.legend')}<b aria-hidden="true">{selected ? '开' : '展'}</b></summary>
        <nav className="fi-structure-themes" aria-label={t('chart.structures.themes')}>
          <button type="button" aria-pressed={effectiveTheme === 'all'} onClick={() => setThemeFilter('all')}>
            {t('chart.structures.allThemes')}<small>{structures.length}</small>
          </button>
          {availableThemes.map((theme) => (
            <button key={theme} type="button" aria-pressed={effectiveTheme === theme} onClick={() => setThemeFilter(theme)}>
              {t(`chart.structures.theme.${theme}`)}<small>{structures.filter((structure) => structure.theme === theme).length}</small>
            </button>
          ))}
        </nav>
        <div className="fi-structure-options" role="group" aria-label={t('chart.structures.legend')}>
          <button type="button" className={selected === null ? 'is-active' : ''} aria-pressed={selected === null} onClick={() => onSelect(null)}>
            {t('chart.structures.off')}
          </button>
          {groups.map(({ theme, structures: themedStructures }) => (
            <section key={theme} aria-labelledby={`fi-structure-theme-${theme}`}>
              <h3 id={`fi-structure-theme-${theme}`}>{t(`chart.structures.theme.${theme}`)}<small>{themedStructures.length}</small></h3>
              {themedStructures.map((structure) => (
                <button key={structure.id} type="button" className={selected === structure.id ? 'is-active' : ''} aria-pressed={selected === structure.id} onClick={() => onSelect(structure.id)} title={structure.statement[lang]}>
                  {structure.title[lang]}
                  {structure.status === 'proposed' && <em>{t('chart.structures.proposed')}</em>}
                </button>
              ))}
            </section>
          ))}
          {unthemed.map((structure) => (
            <button key={structure.id} type="button" className={selected === structure.id ? 'is-active' : ''} aria-pressed={selected === structure.id} onClick={() => onSelect(structure.id)} title={structure.statement[lang]}>
              {structure.title[lang]}
              {structure.status === 'proposed' && <em>{t('chart.structures.proposed')}</em>}
            </button>
          ))}
        </div>

        {active && (
          <div className="fi-structure-twin">
            {active.theme && <span className="fi-structure-active-theme">{t(`chart.structures.theme.${active.theme}`)}</span>}
            <p className="fi-structure-statement">{active.statement[lang]}</p>
            {active.isomorphism && <p className="fi-structure-isomorphism"><b>{t('chart.structures.isomorphism')}</b>{active.isomorphism}</p>}
            {active.provenance && (
              <p className="fi-structure-provenance">
                <span>{t('chart.structures.source')}</span>
                <a href={active.provenance.url} target="_blank" rel="noopener noreferrer">
                  {active.provenance.source}{active.provenance.recordIds.length > 0 ? ` · #${active.provenance.recordIds.join(' · #')}` : ''} ↗
                </a>
                <time dateTime={active.provenance.reviewedAt}>{active.provenance.reviewedAt}</time>
              </p>
            )}
            <ol className="fi-passage-guide" aria-label={t('chart.structures.passageGuide')}>
              <li data-current={!departure || undefined}><b>一</b>{t('chart.structures.chooseDeparture')}</li>
              <li data-current={!!departure && !intent || undefined}><b>二</b>{t('chart.structures.chooseDestination')}</li>
              <li data-current={!!intent || undefined}><b>三</b>{t('chart.structures.authorAtDock')}</li>
            </ol>
            {departure && (
              <p className="fi-passage-departure">
                <span>{t('chart.structures.departure')}</span>
                <strong>{rebuilt.find((row) => row.d.slug === departure.islandSlug)?.d.n[lang] ?? departure.islandSlug}</strong>
                <small>{t('chart.structures.changeDeparture')}</small>
              </p>
            )}
            <div className="fi-structure-columns">
              <section>
                <b>{t('chart.structures.rebuilt')} · {rebuilt.length}</b>
                <ul>
                  {rebuilt.map(({ d, islandOp, weight, actors }) => {
                    const slug = d.slug ?? `id-${d.id}`;
                    const isDeparture = departure?.islandSlug === slug && departure.structureId === active.id;
                    const isIntent = intent?.targetIslandSlug === slug;
                    return (
                    <li key={slug} data-departure={isDeparture || undefined} data-intent={isIntent || undefined}>
                      <button
                        type="button"
                        className="fi-structure-node"
                        aria-pressed={isDeparture}
                        onClick={() => onDeparture({ structureId: active.id, islandSlug: slug, islandOp })}
                      >
                        {d.n[lang]}
                        <small>{weight > 1 ? `×${weight} · ` : ''}{actors.map(handleOf).join(' ')}</small>
                      </button>
                      <div className="fi-structure-row-actions">
                        <button type="button" onClick={() => onEnter(d)}>{t('chart.structures.viewIsland')}</button>
                        {departure && !isDeparture && (
                          <button type="button" className="fi-structure-passage-action" data-kind="charted" onClick={() => begin({ d, islandOp }, 'charted')}>
                            {t('chart.structures.rewalkCharted')}
                          </button>
                        )}
                      </div>
                    </li>
                    );
                  })}
                </ul>
              </section>
              <section data-kind="gap">
                <b>{t('chart.structures.gaps')} · {nearGaps.length + farGaps.length}</b>
                {nearGaps.length > 0 && (
                  <>
                    <em className="fi-structure-sub">{t('chart.structures.nearGaps')}</em>
                    <ul>
                      {gapRows(nearGaps)}
                    </ul>
                  </>
                )}
                {farGaps.length > 0 && (
                  <>
                    <em className="fi-structure-sub">{t('chart.structures.domainGaps')}</em>
                    <ul data-far="true">
                      {gapRows(farGaps)}
                    </ul>
                  </>
                )}
              </section>
            </div>
            {rebuilt.length === 0 && <p className="fi-structure-frontier">{t('chart.structures.pureFrontier')}</p>}
            <small>{t('chart.structures.gapHint')}</small>
          </div>
        )}

        <small className="fi-structure-note">{t('chart.structures.note')}</small>
      </details>
    </aside>
  );
  return typeof document !== 'undefined' ? createPortal(panel, document.body) : panel;
}

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
import { useTranslation } from 'react-i18next';
import type { ApiStructure } from '../../api/client';
import type { IslandDatum } from '../../api/fallback';

export interface StructureLensPanelProps {
  structures: ApiStructure[];
  /** The selected `struct://` id, or null (lens off). */
  selected: string | null;
  onSelect: (id: string | null) => void;
  /** The list twin, resolved to chart islands by the screen. */
  rebuilt: IslandDatum[];
  gaps: IslandDatum[];
  /** Sail to an island (controls.enter → the normal L0→L1 route). */
  onEnter: (d: IslandDatum) => void;
}

export function StructureLensPanel({ structures, selected, onSelect, rebuilt, gaps, onEnter }: StructureLensPanelProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';
  if (structures.length === 0) return null;
  const active = selected ? structures.find((s) => s.id === selected) ?? null : null;

  return (
    <aside className="fi-structure-key" aria-label={t('chart.structures.legend')}>
      <span><i aria-hidden="true" />{t('chart.structures.legend')}</span>
      <div className="fi-structure-options" role="group">
        <button type="button" className={selected === null ? 'is-active' : ''} aria-pressed={selected === null} onClick={() => onSelect(null)}>
          {t('chart.structures.off')}
        </button>
        {structures.map((s) => (
          <button key={s.id} type="button" className={selected === s.id ? 'is-active' : ''} aria-pressed={selected === s.id} onClick={() => onSelect(s.id)} title={s.statement[lang]}>
            {s.title[lang]}
            {s.status === 'proposed' && <em>{t('chart.structures.proposed')}</em>}
          </button>
        ))}
      </div>

      {active && (
        <div className="fi-structure-twin">
          <p className="fi-structure-statement">{active.statement[lang]}</p>
          <div className="fi-structure-columns">
            <section>
              <b>{t('chart.structures.rebuilt')} · {rebuilt.length}</b>
              <ul>
                {rebuilt.map((d) => (
                  <li key={d.slug ?? d.id}>
                    <button type="button" onClick={() => onEnter(d)}>{d.n[lang]}</button>
                  </li>
                ))}
              </ul>
            </section>
            <section data-kind="gap">
              <b>{t('chart.structures.gaps')} · {gaps.length}</b>
              <ul>
                {gaps.map((d) => (
                  <li key={d.slug ?? d.id}>
                    <button type="button" onClick={() => onEnter(d)}>{d.n[lang]}</button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          {rebuilt.length === 0 && <p className="fi-structure-frontier">{t('chart.structures.pureFrontier')}</p>}
          <small>{t('chart.structures.gapHint')}</small>
        </div>
      )}

      <small className="fi-structure-note">{t('chart.structures.note')}</small>
    </aside>
  );
}

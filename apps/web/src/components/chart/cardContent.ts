/**
 * cardContent — the L0 island-card's data shaping, extracted from
 * `ChartScreen` so both the SVG chart and the atlas-world-plan.md W1 default
 * (`AtlasChartScreen`) render the IDENTICAL card from the same
 * `IslandDatum` (no drift between the flat scatter and the atlas). Pure: no
 * React, no DOM — the two screens differ only in how they get `left`/`top`
 * (despaced SVG coords vs. the atlas camera's live screen position), which
 * `cardBoxPos` also unifies given a source x/y.
 */
import { DOMAIN_META, STAGE_LABELS, type IslandDatum } from '../../api/fallback';

export interface ChartCardContent {
  id: string;
  domCol: string;
  stage: string;
  q: string;
  brief?: string;
  cluster?: string;
  citation?: { venue: string; year: number };
  act: number;
  m: number;
  hint: string;
  hintCol: string;
  /** Structure-lens context (§九), present only while a lens is on: this
   * island's relation to the selected structure. A gap line states the bare
   * fact "no one has brought it here" — never a suggested mapping. */
  lensNote?: { kind: 'rebuilt' | 'gap'; text: string };
}

/** A minimal translate function shape (`i18next`'s `t` satisfies this). */
export type Translate = (key: string, opts?: Record<string, unknown>) => string;

export function computeCardContent(
  hd: IslandDatum,
  lang: 'zh' | 'en',
  t: Translate,
  lensNote?: ChartCardContent['lensNote'],
): ChartCardContent {
  return {
    ...(lensNote ? { lensNote } : {}),
    id: String(hd.id).padStart(2, '0'),
    domCol: hd.out ? '#8A6A1E' : DOMAIN_META[hd.d].col,
    stage: `${t(`chart.stages.${STAGE_LABELS[hd.st]}`)}${hd.dor ? ` · ${t('chart.card.dormant')}` : ''}${hd.out ? ` · ${t('chart.card.outlier')}` : ''}`,
    q: hd.q[lang],
    brief: hd.brief?.[lang],
    cluster: hd.cluster?.[lang],
    citation: hd.citation,
    act: hd.a,
    m: hd.m,
    hint: hd.out ? t('chart.card.hintOutlier') : t('chart.card.routeOpen'),
    hintCol: '#9C5932',
  };
}

/** Clamp the card's box to the 1440×900 stage from an island's anchor point
 * (SVG: despaced `x`/`y`; atlas: the live hover screen position) — same
 * offsets `ChartScreen` always used, factored out so both screens agree. */
export function cardBoxPos(x: number, y: number): { left: number; top: number } {
  return {
    left: Math.min(Math.max(x - 132, 16), 1160),
    top: y + 60 > 720 ? y - 260 : y + 62,
  };
}

import { useTranslation } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import type { WorldPlaceSegment, WorldResearchContext, WorldTrailProjection } from '../../state/worldTrail';
import type { RouteOutcomeViewModel } from '../../state/routeOutcome';
import { modelFamily } from '../../models/catalog';

export interface WorldTrailProps {
  projection: WorldTrailProjection;
  outcome?: RouteOutcomeViewModel | null;
  variant?: 'overlay' | 'embedded' | 'mobile';
}

const STATION_KEYS: Record<StationKind, string> = {
  questions: 'island.interior.questions.title',
  library: 'island.interior.library.title',
  canvas: 'island.interior.whiteboard.title',
  data: 'island.interior.data.title',
  driftwood: 'island.interior.driftwood.title',
  workshop: 'island.interior.workshop.title',
  gallery: 'island.interior.gallery.title',
  tearoom: 'island.interior.tearoom.title',
  dock: 'island.interior.dock.title',
};

const PLACE_GLYPHS: Record<WorldPlaceSegment['kind'], string> = {
  atlas: '图', travel: '舟', island: '岛', district: '域', station: '址', floor: '层', workspace: '案',
};

function placeLabel(segment: WorldPlaceSegment, t: (key: string, options?: Record<string, unknown>) => string): string {
  switch (segment.kind) {
    case 'atlas': return t('shell.worldTrail.atlas');
    case 'travel': return segment.label
      ? t('shell.worldTrail.travelTo', { target: segment.label })
      : t('shell.worldTrail.travel');
    case 'station': return t(STATION_KEYS[segment.station]);
    default: return segment.label;
  }
}

function researchPrefix(item: WorldResearchContext, t: (key: string) => string): string {
  if (item.kind === 'course') return t('shell.worldTrail.course');
  if (item.kind === 'structure') return t('shell.worldTrail.structure');
  if (item.kind === 'passage') return t('shell.worldTrail.passage');
  if (item.kind === 'model') return t('shell.worldTrail.personalModel');
  return t('shell.worldTrail.recorded');
}

function outcomeCopy(outcome: RouteOutcomeViewModel, lang: 'zh' | 'en', t: (key: string, options?: Record<string, unknown>) => string) {
  if (outcome.kind === 'model-run') {
    const family = modelFamily(outcome.receipt.familyId);
    const substrate = family.substrates.find((item) => item.id === outcome.receipt.substrateId);
    return {
      seal: '个',
      title: t('shell.worldTrail.outcome.modelSaved'),
      summary: `${family.shortTitle[lang]} · ${substrate?.title[lang] ?? outcome.receipt.substrateId}`,
    };
  }
  if (outcome.kind === 'passage') {
    return {
      seal: '研',
      title: t('shell.worldTrail.outcome.passageRecorded'),
      summary: `${outcome.sourceLabel} ↔ ${outcome.targetLabel} · ${outcome.receipt.structureTitle}`,
    };
  }
  const action = t(`shell.worldTrail.outcome.action.${outcome.action}`);
  return {
    seal: outcome.truth === 'proposal' ? '提' : '研',
    title: t(`shell.worldTrail.outcome.${outcome.status}`),
    summary: `${outcome.sourceLabel} → ${outcome.targetLabel} · ${action}`,
  };
}

const receiptTail = (id: string): string => id.replace(/^sha256:/, '').slice(0, 10);

export function WorldTrail({ projection, outcome, variant = 'overlay' }: WorldTrailProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';
  const outcomeText = outcome ? outcomeCopy(outcome, lang, t) : null;
  return (
    <aside
      className="fi-world-trail"
      data-variant={variant}
      data-location={projection.location.kind}
      data-fallback={projection.fellBackToAtlas || undefined}
      data-has-outcome={outcome ? true : undefined}
      aria-label={t('shell.worldTrail.aria')}
    >
      <section className="fi-world-trail-place">
        <small>{t('shell.worldTrail.place')}</small>
        <ol>
          {projection.placeTrail.map((segment, index) => (
            <li key={`${segment.kind}:${'label' in segment ? segment.label : index}`} aria-current={index === projection.placeTrail.length - 1 ? 'location' : undefined}>
              <i aria-hidden="true">{PLACE_GLYPHS[segment.kind]}</i>
              <span>{placeLabel(segment, t)}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="fi-world-trail-research">
        <small>{t('shell.worldTrail.research')}</small>
        {projection.activeResearchContext.length ? (
          <ul>
            {projection.activeResearchContext.map((item, index) => (
              <li key={`${item.kind}:${item.label}:${index}`} data-truth={item.truth}>
                <i aria-hidden="true">{item.truth === 'research' ? '研' : '个'}</i>
                <span><em>{researchPrefix(item, t)}</em><strong>{item.label}</strong></span>
              </li>
            ))}
          </ul>
        ) : <p>{t('shell.worldTrail.noResearch')}</p>}
      </section>
      {outcome && outcomeText && (
        <section className="fi-world-trail-outcome" data-truth={outcome.truth} aria-live="polite">
          <small>{t('shell.worldTrail.outcome.label')}</small>
          <div>
            <i aria-hidden="true">{outcomeText.seal}</i>
            <span><strong>{outcomeText.title}</strong><em>{outcomeText.summary}</em></span>
            <code title={outcome.id}>{receiptTail(outcome.id)}</code>
          </div>
        </section>
      )}
    </aside>
  );
}

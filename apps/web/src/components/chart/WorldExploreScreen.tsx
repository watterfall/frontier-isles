import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import type { AtlasExplorerCurrent, AtlasExplorerIsland, AtlasExplorerPose } from '@frontier-isles/renderer/pixi';
import type { IslandDatum } from '../../api/fallback';
import type { SampledCurrentRecord } from '../../state/explorationSession';
import {
  researchFieldRelation,
  researchTransectProgress,
  researchTransectStage,
  worldAltitudeBand,
  worldAltitudeInstruction,
  worldCanSurvey,
  worldCanSampleCurrent,
  WORLD_APPROACH_DISTANCE,
  WORLD_CURRENT_ALTITUDE_ALIGNMENT,
} from '../../chart/worldExplore';

export interface WorldExploreScreenProps {
  islands: IslandDatum[];
  visitedIslandSlugs: readonly string[];
  sampledCurrents: readonly SampledCurrentRecord[];
  courseHistorySlugs: readonly string[];
  notes: Readonly<Record<string, string>>;
  nearby: AtlasExplorerIsland | null;
  nearbyCurrent: AtlasExplorerCurrent | null;
  neighborhood: AtlasExplorerIsland[];
  courseSlug: string | null;
  pose: AtlasExplorerPose | null;
  onCourse: (slug: string | null) => void;
  onAltitude: (direction: -1 | 1) => void;
  onInspect: (slug: string) => void;
  /** Completed survey (either input path — button or E key); opens the note. */
  surveySignal?: { slug: string; sequence: number } | null;
  onSampleCurrent: () => void;
  onNote: (slug: string, text: string) => void;
  onExportNotebook: () => void;
  onDock: () => void;
  onExit: () => void;
}

/**
 * DOM list twin for the persistent Pixi field. The world stays primary: route
 * notes are folded by default and one contextual action appears at a time.
 */
export function WorldExploreScreen(props: WorldExploreScreenProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';
  const [inspectionSlug, setInspectionSlug] = useState<string | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  // A keyboard survey (E) must read exactly like a clicked one: the shared
  // completion signal opens the same field-note panel either way.
  const surveySignal = props.surveySignal;
  useEffect(() => {
    if (surveySignal) setInspectionSlug(surveySignal.slug);
  }, [surveySignal]);
  const bySlug = useMemo(
    () => new Map(props.islands.map((island) => [island.slug ?? `id-${island.id}`, island])),
    [props.islands],
  );
  const inspected = inspectionSlug ? bySlug.get(inspectionSlug) ?? null : null;
  const nearbySurveyed = !!props.nearby && props.visitedIslandSlugs.includes(props.nearby.slug);
  const nearbyCurrentSampled = !!props.nearbyCurrent && props.sampledCurrents.some((current) => current.id === props.nearbyCurrent!.id);
  const currentCanSample = !!props.nearbyCurrent && worldCanSampleCurrent(props.nearbyCurrent);
  const withinHorizontalRange = !!props.nearby && props.nearby.horizontalDistance <= WORLD_APPROACH_DISTANCE;
  const withinSurveyRange = !!props.nearby && worldCanSurvey(props.nearby);
  const altitudeZ = Math.max(0, Math.min(1, props.pose?.altitudeZ ?? 0.5));
  const altitudeBand = worldAltitudeBand(altitudeZ);
  const altitudeInstruction = props.nearby ? worldAltitudeInstruction(props.nearby.altitudeDelta) : 'aligned';
  const currentAltitudeInstruction = props.nearbyCurrent ? worldAltitudeInstruction(props.nearbyCurrent.altitudeDelta) : 'aligned';
  const onCourse = !!props.nearby && props.nearby.slug === props.courseSlug;
  const encounterPhase = !props.nearby
    ? 'cruise'
    : nearbySurveyed
      ? 'surveyed'
      : withinHorizontalRange && !withinSurveyRange
        ? 'altitude'
        : withinSurveyRange
          ? 'approach'
          : onCourse ? 'course' : 'signal';
  const fieldDomains = useMemo(() => {
    const domains = props.neighborhood.flatMap((candidate) => {
      const domain = bySlug.get(candidate.slug)?.d;
      return domain ? [domain] : [];
    });
    return [...new Set(domains)].slice(0, 2).join(' × ');
  }, [bySlug, props.neighborhood]);
  const courseCandidate = props.courseSlug
    ? props.neighborhood.find((candidate) => candidate.slug === props.courseSlug)
      ?? (props.nearby?.slug === props.courseSlug ? props.nearby : null)
    : null;
  const courseIsland = props.courseSlug ? bySlug.get(props.courseSlug) ?? null : null;
  const courseSurveyed = !!props.courseSlug && props.visitedIslandSlugs.includes(props.courseSlug);
  const currentFrom = props.nearbyCurrent ? bySlug.get(props.nearbyCurrent.fromSlug) ?? null : null;
  const currentTo = props.nearbyCurrent ? bySlug.get(props.nearbyCurrent.toSlug) ?? null : null;
  const currentPrimary = !!props.nearbyCurrent && (
    !props.nearby
    || (!nearbyCurrentSampled && currentCanSample)
    || (!nearbyCurrentSampled && !withinSurveyRange)
  );
  const transectStage = courseCandidate ? researchTransectStage(courseCandidate.distance, courseSurveyed) : null;
  const transectProgress = courseCandidate ? (courseSurveyed ? 1 : researchTransectProgress(courseCandidate.distance)) : 0;
  const fieldNeighbor = useMemo(() => {
    if (!courseIsland || !props.courseSlug) return null;
    const ranked = props.neighborhood
      .filter((candidate) => candidate.slug !== props.courseSlug)
      .flatMap((candidate) => {
        const island = bySlug.get(candidate.slug);
        if (!island) return [];
        const relation = researchFieldRelation(
          { domain: courseIsland.d, clusterCode: courseIsland.cluster?.code },
          { domain: island.d, clusterCode: island.cluster?.code },
        );
        const rank = relation === 'same-cluster' ? 0 : relation === 'same-domain' ? 1 : 2;
        return [{ candidate, island, relation, rank }];
      })
      .sort((a, b) => a.rank - b.rank || a.candidate.distance - b.candidate.distance);
    return ranked[0] ?? null;
  }, [bySlug, courseIsland, props.courseSlug, props.neighborhood]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      if (event.code !== 'KeyQ' || target?.matches('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault();
      setJournalOpen((open) => !open);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const inspect = (slug: string): void => {
    props.onInspect(slug);
    setInspectionSlug(slug);
    setJournalOpen(false);
  };

  const continueToNeighbor = (): void => {
    if (!fieldNeighbor) return;
    props.onCourse(fieldNeighbor.candidate.slug);
    setInspectionSlug(null);
    setJournalOpen(false);
  };

  return (
    <section className="fi-world-explore" data-screen-label="L0.5 全局低空考察" data-altitude={altitudeBand}>
      <header className="fi-world-explore-heading">
        <div>
          <small>{t('chart.explore.kicker')}</small>
          <strong>{t('chart.explore.title')}</strong>
          <span>{t('chart.explore.continuity')}</span>
        </div>
        <button type="button" onClick={props.onExit}>{t('chart.explore.exit')}</button>
      </header>

      <aside className="fi-world-explore-journal" data-open={journalOpen || undefined} aria-label={t('chart.explore.journal')}>
        <button
          type="button"
          className="fi-world-explore-journal-toggle"
          aria-expanded={journalOpen}
          onClick={() => setJournalOpen((open) => !open)}
        >
          <span>{t('chart.explore.questionCompass')}</span>
          <small><kbd>Q</kbd>{props.courseSlug ? t('chart.explore.courseSet') : t('chart.explore.chooseQuestion')}</small>
          <b aria-hidden="true">{journalOpen ? '收' : '展'}</b>
        </button>
        {journalOpen && (
          <div className="fi-world-explore-journal-sheet">
            <p>{fieldDomains ? t('chart.explore.fieldMix', { domains: fieldDomains }) : t('chart.explore.objective')}</p>
            <div className="fi-world-explore-notebook-status">
              <span>{t('chart.explore.localNotebook')}</span>
              <b>{t('chart.explore.notebookCounts', {
                islands: props.visitedIslandSlugs.length,
                currents: props.sampledCurrents.length,
                courses: props.courseHistorySlugs.length,
              })}</b>
            </div>
            <ol>
              {props.neighborhood.map((candidate, index) => {
                const island = bySlug.get(candidate.slug);
                if (!island) return null;
                const visited = props.visitedIslandSlugs.includes(candidate.slug);
                const selected = props.courseSlug === candidate.slug;
                return (
                  <li key={candidate.slug} data-nearby={props.nearby?.slug === candidate.slug || undefined} data-visited={visited || undefined} data-course={selected || undefined}>
                    <button
                      type="button"
                      className="fi-world-explore-journal-entry"
                      aria-pressed={selected}
                      onClick={() => { props.onCourse(selected ? null : candidate.slug); setJournalOpen(false); }}
                    >
                      <i>{String(index + 1).padStart(2, '0')}</i>
                      <span>
                        <strong>{island.q[lang]}</strong>
                        <small>{island.d} · {Math.round(candidate.distance)} 海尺 · {selected ? t('chart.explore.courseActive') : visited ? t('chart.explore.noted') : t('chart.explore.setCourse')}</small>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            {props.visitedIslandSlugs.length > 0 && (
              <section className="fi-world-explore-visited-log" aria-label={t('chart.explore.surveyLog')}>
                <header><strong>{t('chart.explore.surveyLog')}</strong><span>{props.visitedIslandSlugs.length}</span></header>
                <ol>
                  {props.visitedIslandSlugs.map((slug, index) => {
                    const island = bySlug.get(slug);
                    if (!island) return null;
                    return (
                      <li key={slug}>
                        <button type="button" className="fi-world-explore-journal-entry" onClick={() => { setInspectionSlug(slug); setJournalOpen(false); }}>
                          <i>{String(index + 1).padStart(2, '0')}</i>
                          <span>
                            <strong>{island.n[lang]}</strong>
                            <small>{props.notes[slug]?.trim() || island.q[lang]}</small>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}
            {props.sampledCurrents.length > 0 && (
              <section className="fi-world-explore-current-log" aria-label={t('chart.explore.routeLog')}>
                <header><strong>{t('chart.explore.routeLog')}</strong><span>{props.sampledCurrents.length}</span></header>
                <ol>
                  {props.sampledCurrents.map((current) => {
                    const from = bySlug.get(current.fromSlug);
                    const to = bySlug.get(current.toSlug);
                    if (!from || !to) return null;
                    return (
                      <li key={current.id} data-kind={current.kind}>
                        <i aria-hidden="true">{current.directed ? '→' : '↔'}</i>
                        <span>
                          <strong>{from.n[lang]} {current.directed ? '→' : '↔'} {to.n[lang]}</strong>
                          <small>
                            {t(`chart.explore.currentKind.${current.kind}`)} · {t(`chart.explore.currentSign.${current.sign}`)}
                            {current.maturity ? ` · ${t(`chart.explore.currentMaturity.${current.maturity}`)}` : ''}
                            {` · ${t('chart.explore.currentWeight', { n: current.weight })}`}
                          </small>
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}
            <button type="button" className="fi-world-explore-notebook-export" onClick={props.onExportNotebook}>
              <span>{t('chart.explore.exportNotebook')}</span>
              <small>MARKDOWN · .MD</small>
            </button>
          </div>
        )}
      </aside>

      <aside
        className="fi-world-explore-altimeter"
        data-band={altitudeBand}
        aria-label={t('chart.explore.altimeter')}
        style={{
          '--fi-flight-altitude': altitudeZ,
          '--fi-target-altitude': props.nearby?.altitudeZ ?? altitudeZ,
          '--fi-flight-offset': `${(1 - altitudeZ) * 154}px`,
          '--fi-target-offset': `${(1 - (props.nearby?.altitudeZ ?? altitudeZ)) * 154}px`,
        } as CSSProperties}
      >
        <button type="button" onClick={() => props.onAltitude(1)} aria-label={t('chart.explore.climb')}>
          <span aria-hidden="true">↑</span><small>{t('chart.explore.climb')}</small>
        </button>
        <div className="fi-world-explore-altimeter-track" aria-hidden="true">
          <i className="fi-world-explore-altimeter-target" />
          <i className="fi-world-explore-altimeter-craft">舟</i>
          <span data-level="high">{t('chart.altitudes.high')}</span>
          <span data-level="middle">{t('chart.altitudes.middle')}</span>
          <span data-level="low">{t('chart.altitudes.low')}</span>
        </div>
        <strong>{t(`chart.altitudes.${altitudeBand}`)}</strong>
        <button type="button" onClick={() => props.onAltitude(-1)} aria-label={t('chart.explore.descend')}>
          <span aria-hidden="true">↓</span><small>{t('chart.explore.descend')}</small>
        </button>
      </aside>

      {courseCandidate && courseIsland && transectStage ? (
        <aside
          className="fi-world-explore-transect"
          data-stage={transectStage}
          aria-live="polite"
          style={{ '--fi-transect-progress': transectProgress } as CSSProperties}
        >
          <header>
            <span>
              <small>{t('chart.explore.transectKicker')} · {courseIsland.d}</small>
              <strong>{courseIsland.q[lang]}</strong>
            </span>
            <button type="button" onClick={() => props.onCourse(null)} aria-label={t('chart.explore.clearCourse')}>×</button>
          </header>
          <div className="fi-world-explore-transect-track" aria-hidden="true"><i /></div>
          <ol aria-label={t('chart.explore.transectProgress')}>
            {(['bearing', 'field', 'survey'] as const).map((step) => {
              const order = { bearing: 0, field: 1, survey: 2 };
              const current = transectStage === 'surveyed' ? 3 : order[transectStage];
              return (
                <li key={step} data-reached={order[step] <= current || undefined} data-current={step === transectStage || undefined}>
                  {t(`chart.explore.transect.${step}`)}
                </li>
              );
            })}
          </ol>
          {transectStage !== 'bearing' && (
            <p>
              <b>{transectStage === 'surveyed' ? t('chart.explore.transect.surveyed') : courseIsland.cluster?.[lang] ?? courseIsland.d}</b>
              <span>{t(`chart.explore.transectDetail.${transectStage}`, { distance: Math.round(courseCandidate.distance) })}</span>
            </p>
          )}
          {fieldNeighbor && (transectStage === 'field' || transectStage === 'surveyed') && (
            <button type="button" className="fi-world-explore-transect-neighbor" onClick={continueToNeighbor}>
              <small>{t(`chart.explore.relation.${fieldNeighbor.relation}`)}</small>
              <span>{fieldNeighbor.island.q[lang]}</span>
              <b aria-hidden="true">↗</b>
            </button>
          )}
        </aside>
      ) : (
        <div className="fi-world-explore-course" aria-hidden="true">
          <i />
          <span>{t('chart.explore.steerHint')}</span>
        </div>
      )}

      <div
        className="fi-world-explore-nearby"
        data-visible={currentPrimary || !!props.nearby}
        data-current={currentPrimary || undefined}
        data-phase={currentPrimary ? nearbyCurrentSampled ? 'current-sampled' : currentCanSample ? 'current-sample' : 'current-signal' : encounterPhase}
        aria-live="polite"
      >
        {currentPrimary && props.nearbyCurrent ? (
          <>
            <span>
              <small>
                {t(nearbyCurrentSampled ? 'chart.explore.currentSampled' : 'chart.explore.currentSignal')}
                {' · '}{Math.round(props.nearbyCurrent.horizontalDistance)} 海尺
                {' · '}{t(`chart.altitudes.${worldAltitudeBand(props.nearbyCurrent.altitudeZ)}`)}
              </small>
              <strong>
                {nearbyCurrentSampled && currentFrom && currentTo
                  ? `${currentFrom.n[lang]} ${props.nearbyCurrent.directed ? '→' : '↔'} ${currentTo.n[lang]}`
                  : t('chart.explore.currentUnread')}
              </strong>
            </span>
            {!nearbyCurrentSampled && currentCanSample && (
              <button type="button" className="fi-world-explore-current-sample" onClick={props.onSampleCurrent}>
                <kbd>C</kbd>{t('chart.explore.sampleCurrent')}
              </button>
            )}
            {!nearbyCurrentSampled && !currentCanSample && Math.abs(props.nearbyCurrent.altitudeDelta) > WORLD_CURRENT_ALTITUDE_ALIGNMENT && (
              <em>{t(`chart.explore.currentAltitudeInstruction.${currentAltitudeInstruction}`)}</em>
            )}
            {!nearbyCurrentSampled && !currentCanSample && Math.abs(props.nearbyCurrent.altitudeDelta) <= WORLD_CURRENT_ALTITUDE_ALIGNMENT && (
              <em>{t('chart.explore.currentApproach')}</em>
            )}
            {nearbyCurrentSampled && (
              <em>
                {t(`chart.explore.currentKind.${props.nearbyCurrent.kind}`)} · {t(`chart.explore.currentSign.${props.nearbyCurrent.sign}`)}
              </em>
            )}
          </>
        ) : props.nearby ? (
          <>
            <span>
              <small>{t(`chart.explore.${encounterPhase}`)} · {Math.round(props.nearby.horizontalDistance)} 海尺 · {t(`chart.altitudes.${props.nearby.altitude}`)}</small>
              <strong>{bySlug.get(props.nearby.slug)?.n[lang]}</strong>
            </span>
            {withinSurveyRange && !nearbySurveyed && (
              <button type="button" onClick={() => inspect(props.nearby!.slug)}><kbd>E</kbd>{t('chart.explore.inspect')}</button>
            )}
            {withinSurveyRange && nearbySurveyed && (
              <button type="button" className="fi-world-explore-dock" onClick={props.onDock}><kbd>↵</kbd>{t('chart.explore.dock')}</button>
            )}
            {withinHorizontalRange && !withinSurveyRange && (
              <em>{t(`chart.explore.altitudeInstruction.${altitudeInstruction}`)}</em>
            )}
            {!withinHorizontalRange && <em>{t(onCourse ? 'chart.explore.followCourse' : 'chart.explore.closeSignal')}</em>}
          </>
        ) : (
          <span><small>{t('chart.explore.cruising')}</small><strong>{t('chart.explore.noNearby')}</strong></span>
        )}
      </div>

      {inspected && (
        <article className="fi-world-explore-note" aria-live="polite">
          <button type="button" onClick={() => setInspectionSlug(null)} aria-label={t('chart.explore.close')}>×</button>
          <small>{t('chart.explore.fieldNote')} · {inspected.d}</small>
          <h2>{inspected.n[lang]}</h2>
          <h3>{inspected.q[lang]}</h3>
          {inspected.brief && <p>{inspected.brief[lang]}</p>}
          {inspected.citation && <a href={inspected.citation.url} target="_blank" rel="noreferrer">{inspected.citation.venue} · {inspected.citation.year}</a>}
          <label className="fi-world-explore-personal-note">
            <span>{t('chart.explore.personalNote')}</span>
            <textarea
              value={props.notes[inspectionSlug ?? ''] ?? ''}
              maxLength={1200}
              rows={4}
              placeholder={t('chart.explore.personalNotePlaceholder')}
              onChange={(event) => inspectionSlug && props.onNote(inspectionSlug, event.target.value)}
            />
            <small>{t('chart.explore.localSaved')}</small>
          </label>
          {props.nearby?.slug === inspectionSlug && props.visitedIslandSlugs.includes(inspectionSlug)
            ? <button type="button" className="fi-world-explore-note-dock" onClick={props.onDock}>{t('chart.explore.dockIsland')}</button>
            : props.nearby?.slug === inspectionSlug
              ? <span>{t('chart.explore.surveyResolving')}</span>
              : <span>{t('chart.explore.approachToDock')}</span>}
          {fieldNeighbor && inspectionSlug !== null && inspectionSlug === props.courseSlug && props.visitedIslandSlugs.includes(inspectionSlug) && (
            <button type="button" className="fi-world-explore-note-continue" onClick={continueToNeighbor}>
              <small>{t(`chart.explore.relation.${fieldNeighbor.relation}`)} · {t('chart.explore.continueResearch')}</small>
              <strong>{fieldNeighbor.island.q[lang]}</strong>
            </button>
          )}
        </article>
      )}
    </section>
  );
}

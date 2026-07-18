import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LedgerEvent } from '@frontier-isles/opp';
import type { StationKind, NightTimelineModel } from '@frontier-isles/core';
import { projectActiveStations, projectNightTimeline } from '@frontier-isles/core';
import { NIGHT_SCENE_VARS, sceneVarsToStyle } from '@frontier-isles/assets';
import { Scene } from '../../scene/Scene';
import { computeGhostReveals, computeNightSigns } from '../../scene/nightReveal';
import { DayNightLever } from './DayNightLever';
import { ListTwin } from './ListTwin';
import { MorningReport } from './MorningReport';
import { DriftwoodModal } from './DriftwoodModal';
import { NightTimeline } from './NightTimeline';
import { QftPanel } from './QftPanel';
import { api } from '../../api/client';
import { SAMPLE_SLUG, SAMPLE_TITLE, SAMPLE_QFOCUS, type QuestionDatum } from '../../api/fallback';

// OFFLINE FALLBACK timeline — used only until (or unless) the real ledger
// loads: keeps the seed's 86-night story look so the scene renders
// identically with the server absent. Once `api.ledger` returns, the
// projectNightTimeline model below is the truth and this yields to it.
const HERO_TIMELINE_MODEL: NightTimelineModel = {
  nights: 86,
  genesis: '',
  eventCountByNight: [],
  markers: [
    { night: 1, pct: 0, action: 'found_island', index: 0, ts: '' },
    { night: 12, pct: 13, action: 'refute', index: 1, ts: '' },
    { night: 41, pct: 47, action: 'publish', index: 2, ts: '' },
    { night: 63, pct: 73, action: 'transplant', index: 3, ts: '' },
  ],
};

export interface IslandScreenProps {
  night: boolean;
  onToggleNight: () => void;
  t: number;
  onT: (v: number) => void;
  sel: StationKind | null;
  panel: boolean;
  onStation: (key: StationKind) => void;
  onClosePanel: () => void;
  onBack: () => void;
  backTarget?: 'atlas' | 'explore';
  stFilter: string;
  onStFilter: (f: string) => void;
  driftOn: boolean;
  driftDest: string | null;
  transTo: string | null;
  onCloseDrift: () => void;
  onMove: () => void;
  onToWorkshop: () => void;
  onToCanvas: () => void;
  actor: string;
  onToast: (msg: string) => void;
  qs: QuestionDatum[];
  voted: Record<number, boolean>;
  focusIdx: number | null;
  advOn: boolean;
  onCloseAdv: () => void;
  onToggleQ: (idx: number) => void;
  onVoteQ: (idx: number) => void;
  onFocus: () => void;
  peers: number;
}

export function IslandScreen(props: IslandScreenProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';
  const { night, peers } = props;
  const returnsToExplore = props.backTarget === 'explore';

  /**
   * Phase B.2 (docs/ROADMAP.md §4 Phase B item 2, "ledger-driven night
   * replay"): best-effort pull of the real machine-curiosity ledger on
   * mount. `null` covers both "not loaded yet" and "fetch failed" — either
   * way `computeGhostReveals` below falls back to the seed constants, so
   * the scene renders identically to before this change while offline
   * (build-spec resilience rule, src/api/client.ts `ledger()` doc comment).
   */
  const [ledgerEvents, setLedgerEvents] = useState<LedgerEvent[] | null>(null);
  useEffect(() => {
    let alive = true;
    void (async () => {
      const events = await api.ledger(SAMPLE_SLUG);
      if (alive && events) setLedgerEvents(events);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Frozen once per mount rather than re-evaluated every render, so the
  // model doesn't drift mid-session (projectNightTimeline is otherwise
  // clock-free/pure — see packages/core/src/night-timeline.ts).
  const [nowIso] = useState(() => new Date().toISOString());

  /**
   * The night-replay scrubber's data contract (packages/core/src/night-
   * timeline.ts `projectNightTimeline`, Phase B.2). `nights`/`markers` here
   * are the real-ledger truth; the seed's "night 86 = today" is a *story*
   * anchor for NightTimeline.tsx's still-hardcoded 1..86 slider (owned by a
   * parallel lane migrating it to consume this model directly) — once real
   * events exist, this model's `nights` (usually far fewer than 86, since
   * the real ledger only spans a handful of actual days) is what's true,
   * and the seed's 86 yields to it. See scene/nightReveal.ts for how the
   * scene layer bridges the two axes in the meantime.
   */
  const nightModel = useMemo(
    () => projectNightTimeline(ledgerEvents ?? [], { now: nowIso }),
    [ledgerEvents, nowIso],
  );

  const ghostReveals = useMemo(
    () => computeGhostReveals(ledgerEvents, nightModel),
    [ledgerEvents, nightModel],
  );

  const nightSigns = useMemo(
    () => computeNightSigns(ledgerEvents, nightModel),
    [ledgerEvents, nightModel],
  );

  // Per-station night lamps (B.1): stations with real ledger activity as of
  // the scrub night. Undefined without a ledger → the scene draws no lamps,
  // matching the pre-B.1 offline look.
  const activeStations = useMemo(() => {
    if (!ledgerEvents || ledgerEvents.length === 0) return undefined;
    const clamped = Math.min(nightModel.nights, Math.max(1, Math.round(props.t)));
    const upTo = nightModel.eventCountByNight[clamped] ?? ledgerEvents.length;
    const slice = ledgerEvents.slice(0, upTo);
    const last = slice[slice.length - 1];
    return projectActiveStations(slice, last ? { now: last.ts } : {});
  }, [ledgerEvents, nightModel, props.t]);

  return (
    <div
      data-screen-label="L1 样板岛"
      className="fi-island-screen"
      data-night={night}
      style={{ ...sceneVarsToStyle(night ? NIGHT_SCENE_VARS : {}) }}
    >
      <Scene
        night={night}
        nightT={props.t}
        selKey={props.sel}
        transTo={props.transTo}
        onStation={props.onStation}
        ghostReveals={ghostReveals}
        nightSigns={nightSigns}
        activeStations={activeStations}
      />

      <div className="fi-island-hud">
        <div className="fi-island-hud-left">
          <button type="button" onClick={props.onBack} className="fi-island-back"><span aria-hidden="true">←</span><span><strong>{t(returnsToExplore ? 'island.backExplore' : 'island.back')}</strong><small>{returnsToExplore ? 'L0.5 · EXPLORE' : 'L0 · ATLAS'}</small></span></button>
          <section className="fi-island-dossier fi-island-dossier-sample">
            <div className="fi-island-dossier-meta"><span>L1 · ISLAND</span><span>{t('island.academy')}</span><span>{t('island.residents')}</span></div>
            <h1>{SAMPLE_TITLE[lang]}</h1>
            <p className="fi-island-qfocus"><span>QFocus</span>{SAMPLE_QFOCUS[lang]}</p>
            <div className="fi-island-evidence-row"><span>AI · {t('island.aiResidents')}</span><span className="fi-presence-dot">{peers > 0 ? t('island.presencePeers', { n: 5 + peers, peers }) : `${t('island.presence')} ${t('island.presenceBreak')}`}</span><span>{t('island.presenceNote')}</span></div>
          </section>
        </div>
        <div className="fi-island-hud-mode"><DayNightLever night={night} onToggle={props.onToggleNight} /></div>
      </div>

      <ListTwin sel={props.sel} stFilter={props.stFilter} onStFilter={props.onStFilter} onStation={props.onStation} />

      {!night && <MorningReport actor={props.actor} onToast={props.onToast} />}

      {props.driftOn && (
        <DriftwoodModal onClose={props.onCloseDrift} driftDest={props.driftDest} transTo={props.transTo} onMove={props.onMove} onToWorkshop={props.onToWorkshop} onToCanvas={props.onToCanvas} />
      )}

      {night && <NightTimeline model={ledgerEvents ? nightModel : HERO_TIMELINE_MODEL} t={props.t} onT={props.onT} />}

      <div className="fi-leave-links fi-leave-links-sample">
        <span>{t('island.footer')}</span>
        <span>
          {t('island.leaveLinks.label')}
          <a href={api.problemMdUrl(SAMPLE_SLUG)} style={{ color: 'var(--gold2,#8A6A1E)' }}>{t('island.leaveLinks.problem')}</a>
          {' · '}
          <a href={api.ledgerJsonlUrl(SAMPLE_SLUG)} style={{ color: 'var(--gold2,#8A6A1E)' }}>{t('island.leaveLinks.ledger')}</a>
        </span>
      </div>

      <QftPanel
        open={props.panel}
        onClose={props.onClosePanel}
        qs={props.qs}
        voted={props.voted}
        focusIdx={props.focusIdx}
        advOn={props.advOn}
        onCloseAdv={props.onCloseAdv}
        onToggle={props.onToggleQ}
        onVote={props.onVoteQ}
        onFocus={props.onFocus}
      />
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LedgerEvent } from '@frontier-isles/opp';
import type { StationKind, NightTimelineModel } from '@frontier-isles/core';
import { projectNightTimeline } from '@frontier-isles/core';
import { NIGHT_SCENE_VARS, sceneVarsToStyle } from '@frontier-isles/assets';
import { Scene } from '../../scene/Scene';
import { computeGhostReveals } from '../../scene/nightReveal';
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

  return (
    <div
      data-screen-label="L1 样板岛"
      style={{ position: 'absolute', inset: 0, background: 'var(--pp,#F2EAD8)', transition: 'background .8s ease', ...sceneVarsToStyle(night ? NIGHT_SCENE_VARS : {}) }}
    >
      <Scene
        night={night}
        nightT={props.t}
        selKey={props.sel}
        transTo={props.transTo}
        onStation={props.onStation}
        ghostReveals={ghostReveals}
      />

      {/* L1 顶部信息 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '18px 24px', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div onClick={props.onBack} style={{ pointerEvents: 'auto', cursor: 'pointer', background: 'var(--card,rgba(250,245,232,0.92))', border: '1.5px solid var(--ink,#3A342B)', borderRadius: 6, padding: '9px 14px', fontSize: 13, color: 'var(--inkT,#2B2620)', display: 'flex', alignItems: 'center', gap: 8, transition: 'background .7s,color .7s' }}>
            ◀ {t('island.back')}
          </div>
          <div style={{ background: 'var(--card,rgba(250,245,232,0.92))', border: '1.5px solid var(--ink,#3A342B)', borderRadius: 6, padding: '10px 18px', transition: 'background .7s' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 900, fontSize: 20, color: 'var(--inkT,#2B2620)', transition: 'color .7s' }}>{SAMPLE_TITLE[lang]}</span>
              <span style={{ fontSize: 12, color: 'var(--ink2,#6B6154)' }}>{t('island.qfocusPrefix')}{SAMPLE_QFOCUS[lang]}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 7, alignItems: 'center' }}>
              <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 999, background: 'var(--capG,#3E9B7E)', color: '#F6F2E6' }}>{t('island.academy')}</span>
              <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 999, border: '1px solid var(--ink2,#6B6154)', color: 'var(--ink2,#6B6154)' }}>{t('island.residents')}</span>
              <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 999, border: '1px solid var(--gold,#B98A2E)', color: 'var(--gold2,#8A6A1E)', background: 'rgba(227,169,60,0.12)' }}>{t('island.aiResidents')}</span>
            </div>
          </div>
          <div style={{ background: 'var(--card,rgba(250,245,232,0.92))', border: '1.5px solid var(--ink,#3A342B)', borderRadius: 6, padding: '8px 14px', transition: 'background .7s' }}>
            <div style={{ fontSize: 11, color: 'var(--inkT,#2B2620)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3E9B7E' }} />
              {peers > 0 ? (
                t('island.presencePeers', { n: 5 + peers, peers })
              ) : (
                <>
                  {t('island.presence')} <span style={{ color: 'var(--ink2,#6B6154)' }}>{t('island.presenceBreak')}</span>
                </>
              )}
            </div>
            <div style={{ fontSize: 10, color: 'var(--ink2,#6B6154)', marginTop: 4 }}>{t('island.presenceNote')}</div>
          </div>
        </div>
        <div style={{ pointerEvents: 'auto' }}>
          <DayNightLever night={night} onToggle={props.onToggleNight} />
        </div>
      </div>

      <ListTwin sel={props.sel} stFilter={props.stFilter} onStFilter={props.onStFilter} onStation={props.onStation} />

      {!night && <MorningReport actor={props.actor} onToast={props.onToast} />}

      {props.driftOn && (
        <DriftwoodModal onClose={props.onCloseDrift} driftDest={props.driftDest} transTo={props.transTo} onMove={props.onMove} onToWorkshop={props.onToWorkshop} onToCanvas={props.onToCanvas} />
      )}

      {night && <NightTimeline model={ledgerEvents ? nightModel : HERO_TIMELINE_MODEL} t={props.t} onT={props.onT} />}

      <div style={{ position: 'absolute', left: 22, bottom: 14, fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10.5, color: 'var(--ink2,#6B6154)', display: 'flex', gap: 12 }}>
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

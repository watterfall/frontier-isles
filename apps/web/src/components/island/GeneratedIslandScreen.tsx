import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { projectClaimState, projectActiveStations, projectNightTimeline, type ClaimState, type StationKind, type NightTimelineModel } from '@frontier-isles/core';
import type { LedgerEvent } from '@frontier-isles/opp';
import { NIGHT_SCENE_VARS, DOMAIN_SCENE_VARS, sceneVarsToStyle } from '@frontier-isles/assets';
import { DayNightLever } from './DayNightLever';
import { ClaimDetailPanel } from './ClaimDetailPanel';
import { RitualEventPanel } from './RitualEventPanel';
import { TransplantPanel } from './TransplantPanel';
import { NightTimeline } from './NightTimeline';
import { StationInteriorDrawer } from './StationInteriorDrawer';
import { GeneratedStationIndex } from './GeneratedStationIndex';
import type { IslandInterior } from '@frontier-isles/data';
import { api } from '../../api/client';
import { DATA } from '../../api/fallback';

/** The curated interior for a slug from the offline fallback atlas. Used when
 *  the server detail omits it — e.g. a DB seeded before interiors existed, or
 *  the server being absent entirely (the app must render identically offline,
 *  fallback.ts convention). Flagship islands carry an interior here. */
function fallbackInterior(slug: string): IslandInterior | undefined {
  return DATA.find((d) => d.slug === slug)?.interior;
}
import { generate, type GeneratedScene } from '../../scene/generator';
import { GeneratedSceneView } from '../../scene/GeneratedScene';
import type { LayoutInput } from '../../scene/layout';
import { replayToNight, type NightReplayState } from '../../scene/nightReplay';
import { dueRituals, extractRitualEvents, loadWatermark, saveWatermark, type RitualEvent } from '../../scene/rituals';
import { agitationChannel } from '../../scene/undertow';

// Ritual moments (depth-plan-v1 §6/§9 Batch 1): how often the live L1 re-polls
// the ledger so a publish/transplant fired by someone else while you're
// looking at the island still lights a lantern / sends a carrier out — a
// best-effort poll, same discipline as every other network call here
// (fallback.ts convention: the UI must render identically with the server
// absent, so a failed poll below is just silently skipped).
const RITUAL_POLL_MS = 20_000;

// Lazy so PixiJS (heavy) stays OUT of the main bundle — the L0 chart never pays
// for it; the chunk loads only when a WebGL island L1 actually mounts.
const PixiScene = lazy(() => import('../../scene/PixiScene'));

/** Shape of the server's GET /api/islands/:slug detail (only the fields we use). */
interface IslandDetail {
  object: { title: string; qfocus: string; status: 'open' | 'active' | 'dissolved' | 'resolved'; frontier?: { heat?: number; substrate?: number } };
  domain: string;
  chart: { x: number; y: number; scale: number; activity: number; members?: number };
  growth: { stage: 'empty' | 'hut' | 'academy' | 'school' };
  tide: { A: number; B: number; D: number; N: number };
  eventCount: number;
  memberships: Array<{ actorId: string; actorKind: string; role: string | null; aiKind: string | null }>;
  atlas?: {
    scores: number[];
    cluster: { code: string; zh: string; en: string };
    citation: { url: string; title: string; venue: string; year: number };
    brief: { zh: string; en: string };
    outlier?: boolean;
    literature?: { title: string; venue: string; year: number; url: string }[];
    depth?: {
      overview: { zh: string; en: string };
      whyMatters: { zh: string; en: string };
      ifAnswered: { zh: string; en: string };
      approaches: { zh: string; en: string }[];
      barrier: { zh: string; en: string };
      subQuestions: { zh: string; en: string }[];
    };
    interior?: IslandInterior;
  };
}

const STAGE_INDEX: Record<string, number> = { empty: 0, hut: 1, academy: 2, school: 3 };
const DOMAIN_I18N: Record<string, string> = { 数理: 'chart.domains.math', 物质: 'chart.domains.matter', 生命: 'chart.domains.life', 交叉: 'chart.domains.cross' };

export interface GeneratedIslandScreenProps {
  slug: string;
  night: boolean;
  onToggleNight: () => void;
  onBack: () => void;
  onStation: (key: StationKind) => void;
  /** Current user's ledger actor id — for the human transplant (Phase B.3). */
  actor: string;
  onToast: (msg: string) => void;
}

/**
 * The L1 screen for curated/founded (non-sample) islands. Fetches the island
 * detail, generates a scene from place-plane + growth + domain + atlas scores,
 * and renders it with the island's real title/qfocus/brief/citation. The
 * sample island keeps its bespoke {@link Scene}; this is the data-driven path.
 */
export function GeneratedIslandScreen({ slug, night, onToggleNight, onBack, onStation, actor, onToast }: GeneratedIslandScreenProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';
  const [detail, setDetail] = useState<IslandDetail | null>(null);
  const [scene, setScene] = useState<GeneratedScene | null>(null);
  const [input, setInput] = useState<LayoutInput | null>(null);
  const [claims, setClaims] = useState<ClaimState[] | undefined>(undefined);
  // M8 micro-dynamics second batch: which stations had recent ledger activity
  // (chimney smoke / flag wave read this — never a decorative always-on loop).
  const [activeStations, setActiveStations] = useState<Set<StationKind> | undefined>(undefined);
  // 海即数据 (depth-plan-v2): substrate → sea darkness, refuted claims → agitation
  // contention, relation counts → the text decoder (invariant 6: honest encoding).
  const [seaStats, setSeaStats] = useState<{ substrate?: number; validates: number; refutes: number; refuted: number; bridges: number; contention: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const [noGpu, setNoGpu] = useState(false); // WebGL absent → fall back to the SVG scene
  // Claim-tower tap → detail panel (scene-upgrade OUTSTANDING P1). Local state,
  // same pattern as the other Pixi-only readouts above — the SVG fallback has no
  // claim towers to tap.
  const [claimPanel, setClaimPanel] = useState<ClaimState | null>(null);
  // Ritual moments (Batch 1): events due to fire NOW (initial catch-up + each
  // live poll), the tapped ritual's ledger event (→ RitualEventPanel), and
  // `prefers-reduced-motion` — all best-effort, none of it is a counter
  // (invariant 17: PixiScene fires each id at most once, this screen never
  // accumulates a tally either).
  const [dueRitualEvents, setDueRitualEvents] = useState<RitualEvent[]>([]);
  const [ritualPanel, setRitualPanel] = useState<RitualEvent | null>(null);
  // L2 station-interior drawer: which station the visitor tapped (null = closed).
  // Flagship islands carry a rich interior (meta.atlas.interior); tapping a
  // station opens its archive (Question Wall / library / whiteboard / data /
  // driftwood / residents). Islands without an interior fall through to the
  // parent's onStation (a "station coming soon" toast), unchanged.
  const [drawerStation, setDrawerStation] = useState<StationKind | null>(null);
  // Human transplant-through-dock (Phase B.3): the driftwood→dock→station panel.
  const [transplantOpen, setTransplantOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Ledger-driven night replay (ROADMAP B.2). `timeline` = projectNightTimeline
  // over the real ledger; `scrubNight` = the dragged night (default = tonight =
  // full); `replay` = the re-projected claims/ghosts/lamps for a PAST night
  // (null ⇒ tonight ⇒ the full `claims`/`activeStations` computed on load). The
  // ledger is kept in a ref so the throttled scrub handler reads it without
  // re-subscribing. Invariant 11: read-only projections, zero new events.
  const ledgerRef = useRef<LedgerEvent[] | null>(null);
  const [timeline, setTimeline] = useState<NightTimelineModel | null>(null);
  const [scrubNight, setScrubNight] = useState(1);
  const [replay, setReplay] = useState<NightReplayState | null>(null);
  const rafRef = useRef<number | null>(null);

  // prefers-reduced-motion: best-effort (older browsers / non-browser test
  // environments without matchMedia keep full motion, never a crash).
  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
      const onChange = (): void => setReducedMotion(mq.matches);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    } catch {
      /* no matchMedia — keep full motion */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setNoGpu(false);
    setDrawerStation(null);
    setDueRitualEvents([]);
    setReplay(null);
    setTimeline(null);
    ledgerRef.current = null;
    // Fetch the island detail + its real ledger in parallel: the ledger drives the
    // Pixi claim buildings (M4「接线上」); the detail drives everything else. Either
    // is best-effort — a null ledger just means buildSceneGraph synths from eventCount.
    Promise.all([api.island(slug), api.ledger(slug)]).then(([d, ledger]) => {
      if (cancelled) return;
      if (!d) {
        setFailed(true);
        return;
      }
      const det = d as IslandDetail;
      setDetail(det);
      // A flagship island's interior may be absent from the server detail (a DB
      // seeded before interiors shipped) — fall back to the offline atlas so the
      // station drawers still open. An island WITH an interior is an academy by
      // definition, so floor its scene stage at 2: otherwise a stale-DB low stage
      // would hide library/whiteboard/data and leave them untappable.
      const hasInterior = !!(det.atlas?.interior ?? fallbackInterior(slug));
      const stage = Math.max(STAGE_INDEX[det.growth.stage] ?? 1, hasInterior ? 2 : 0);
      const hasAi = det.memberships.some((m) => m.actorKind === 'agent');
      const layoutInput: LayoutInput = {
        slug,
        domain: det.domain as '数理' | '物质' | '生命' | '交叉',
        stage,
        members: det.chart.members ?? det.memberships.length,
        dormant: det.growth.stage === 'empty' && det.eventCount === 0,
        status: det.object.status,
        outlier: det.atlas?.outlier ?? false,
        tide: det.tide.N,
        hasAi,
        eventCount: det.eventCount,
      };
      const projected = ledger ? projectClaimState(ledger) : undefined;
      setInput(layoutInput);
      setClaims(projected);
      setScene(generate(layoutInput)); // still needed for the SVG (no-GPU) fallback
      // Night replay wiring (B.2): timeline model over the real ledger, scrubber
      // parked at tonight (full). Empty/null ledger → a 1-night silent timeline
      // (the scrubber is just not shown, see `hasReplayLedger` below).
      ledgerRef.current = ledger ?? null;
      const tl = projectNightTimeline(ledger ?? []);
      setTimeline(tl);
      setScrubNight(tl.nights);
      setReplay(null);
      // 海即数据 readouts: contention = ever-refuted magnitude (a refute is one-way;
      // no resolution verb exists yet — see R7 semantic issue) (→ agitation);
      // relation counts decode the sea for the reader (list-twin, not a painted key).
      const events = ledger ?? [];
      setActiveStations(ledger ? projectActiveStations(ledger, { now: Date.now() }) : undefined);
      // Single source (R7 Dim 1): agitationChannel returns BOTH the decoder readout
      // (refuted) and the sea magnitude (contention) from ONE refuted-claim count,
      // so the number on screen and the swirl can never diverge.
      const { refuted, contention } = agitationChannel(projected);
      setSeaStats({
        substrate: det.object.frontier?.substrate,
        validates: events.filter((e) => e.action === 'validate').length,
        refutes: events.filter((e) => e.action === 'refute').length,
        refuted,
        bridges: events.filter((e) => e.action.startsWith('bridge')).length,
        contention,
      });
      // Ritual moments — the "just landed" catch-up (recent publish/transplant
      // within the window still fire; older history silently advances the
      // watermark without replaying a backlog, dueRituals in scene/rituals.ts).
      if (ledger) {
        const candidates = extractRitualEvents(ledger);
        const { due, watermark } = dueRituals(candidates, loadWatermark(slug), Date.now());
        setDueRitualEvents(due);
        saveWatermark(slug, watermark);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Ritual moments — live poll: a publish/transplant fired while you're on the
  // island (by you or anyone else) still lights a lantern / sends a carrier
  // out, without a page reload. Ledger-only (no full detail refetch), and a
  // failed poll just silently retries next tick (best-effort, same as above).
  useEffect(() => {
    const id = window.setInterval(() => {
      api.ledger(slug).then((ledger) => {
        if (!ledger) return;
        const candidates = extractRitualEvents(ledger);
        const { due, watermark } = dueRituals(candidates, loadWatermark(slug), Date.now());
        if (due.length > 0) setDueRitualEvents(due);
        saveWatermark(slug, watermark);
      });
    }, RITUAL_POLL_MS);
    return () => window.clearInterval(id);
  }, [slug]);

  // Night-replay scrub → projection, rAF-throttled. Dragging the scrubber can
  // fire dozens of input events per second; each re-projection swaps the
  // `claims`/`activeStations` props and re-boots the Pixi scene (buildSceneGraph
  // rebuild is the dominant cost). requestAnimationFrame coalesces the burst to
  // at most one rebuild per frame (~60fps), and the frame loop self-paces if a
  // rebuild overruns 16ms — no fixed debounce needed. At tonight (n >= nights)
  // we drop back to the full `claims`/`activeStations` (replay = null) so the
  // live view is byte-identical to before.
  const onScrub = useCallback(
    (n: number) => {
      setScrubNight(n);
      const led = ledgerRef.current;
      const tl = timeline;
      if (!led || !tl) return;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      const run = () => {
        rafRef.current = null;
        if (n >= tl.nights) {
          setReplay(null); // tonight → full projection
          return;
        }
        setReplay(replayToNight(led, tl, n));
      };
      if (typeof requestAnimationFrame === 'function') rafRef.current = requestAnimationFrame(run);
      else run();
    },
    [timeline],
  );

  // Cancel a pending rAF on unmount.
  useEffect(() => () => {
    if (rafRef.current != null && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(rafRef.current);
  }, []);

  if (failed) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: '#F2EAD8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: '#6B6154' }}>
        <span style={{ fontFamily: "'Noto Serif SC',serif", fontSize: 16 }}>{t('island.notReachable')}</span>
        <button onClick={onBack} style={{ cursor: 'pointer', background: '#2B2620', color: '#F2EAD8', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13 }}>{t('island.back')}</button>
      </div>
    );
  }

  if (!detail || !scene || !input) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: '#F2EAD8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6154' }}>
        <span style={{ fontFamily: "'Noto Serif SC',serif", fontSize: 16 }}>{t('island.loading')}</span>
      </div>
    );
  }

  const title = detail.object.title;
  const qfocus = detail.object.qfocus;
  const brief = detail.atlas?.brief[lang] ?? '';
  const citation = detail.atlas?.citation;
  const cluster = detail.atlas?.cluster[lang];
  const depth = detail.atlas?.depth;
  const literature = detail.atlas?.literature ?? [];
  // Server interior first; fall back to the offline atlas when the server omits
  // it (pre-interior DB seed, or server absent) so the drawers still open.
  const interior = detail.atlas?.interior ?? fallbackInterior(slug);
  // Station tap: flagship islands (with an interior) open the L2 station-interior
  // drawer; islands without one fall through to the parent (toast), unchanged.
  const handleStation = (key: StationKind): void => {
    if (interior) setDrawerStation(key);
    else onStation(key);
  };
  const domain = detail.domain as '数理' | '物质' | '生命' | '交叉';
  // 海即数据 decoder (invariant 6): abstractness tier for the sea-depth readout +
  // the relation counts that make the current/agitation legible as text (list-twin).
  const abstractKey = (s: number): string => (s >= 0.66 ? 'island.seaData.abstract.hi' : s >= 0.33 ? 'island.seaData.abstract.mid' : 'island.seaData.abstract.lo');
  const relParts: string[] = [];
  if (seaStats) {
    if (seaStats.validates) relParts.push(`${seaStats.validates} ${t('island.seaData.validate')}`);
    // The agitation reads refuted CLAIMS (ghosts) — decode the sea with that exact
    // quantity (R7 Dim 1). Refute EVENTS are a different axis, labelled distinctly
    // so neither number silently stands in for the other.
    if (seaStats.refuted) relParts.push(`${seaStats.refuted} ${t('island.seaData.refutedClaims')}`);
    if (seaStats.refutes) relParts.push(`${seaStats.refutes} ${t('island.seaData.refuteEvents')}`);
    if (seaStats.bridges) relParts.push(`${seaStats.bridges} ${t('island.seaData.bridge')}`);
  }
  // Cascade: day defaults ← domain tint ← night override (§1: palette only, never shape).
  const sceneVars = { ...DOMAIN_SCENE_VARS[domain], ...(night ? NIGHT_SCENE_VARS : {}) };

  // Night replay: when scrubbing a PAST night, the Pixi scene reads the sliced
  // claims/ghosts and the lamps active AS OF that night (task 3 — "看着岛长大");
  // at tonight (replay == null) it reads the full live projections unchanged.
  const scrubbing = night && replay != null;
  const effClaims = scrubbing ? replay!.claims : claims;
  const effActive = scrubbing ? replay!.activeStations : activeStations;
  // Only offer the scrubber when the ledger actually has events to replay.
  const hasReplay = timeline != null && (timeline.eventCountByNight[timeline.nights] ?? 0) > 0;

  return (
    <div
      data-screen-label="L1 生成岛"
      className="fi-island-screen"
      data-night={night}
      style={{ ...sceneVarsToStyle(sceneVars) }}
    >
      {/* L1 scene: the Pixi isometric renderer (M4「接线上」), fed the island's real
          ledger-driven claims + App day/night. SVG scene is the no-GPU fallback
          (CLAUDE.md: the app must render without the GPU). */}
      {noGpu ? (
        <GeneratedSceneView scene={scene} night={night} nightT={50} onStation={handleStation} />
      ) : (
        <Suspense fallback={<div className="fi-island-loading-mark" role="status"><i aria-hidden="true" /><span>{t('island.loading')}</span></div>}>
          <PixiScene
            input={input}
            claims={effClaims}
            t={night ? 1 : 0}
            lang={lang}
            activeStations={effActive}
            substrate={seaStats?.substrate}
            agitation={seaStats?.contention ?? 0}
            onStation={handleStation}
            onClaim={setClaimPanel}
            onWebglError={() => setNoGpu(true)}
            rituals={dueRitualEvents}
            reducedMotion={reducedMotion}
            onRitualTap={setRitualPanel}
          />
        </Suspense>
      )}

      <ClaimDetailPanel claim={claimPanel} onClose={() => setClaimPanel(null)} />
      <RitualEventPanel event={ritualPanel} onClose={() => setRitualPanel(null)} />
      {/* DOM station index (list twin) — the reliable, scale-proof way to open
          every one of the nine buildings; only shown when the island actually
          has an interior to open. */}
      {interior && (
        <GeneratedStationIndex interior={interior} sel={drawerStation} onStation={handleStation} />
      )}
      <StationInteriorDrawer station={drawerStation} interior={interior} lang={lang} onClose={() => setDrawerStation(null)} />
      {transplantOpen && (
        <TransplantPanel slug={slug} actor={actor} lang={lang} onClose={() => setTransplantOpen(false)} onToast={onToast} />
      )}

      {/* Ledger-driven night replay scrubber (B.2) — only at night, only when
          the ledger has events to replay. Dragging slices the ledger and
          re-projects claims/ghosts/lamps (see onScrub → replayToNight). */}
      {night && hasReplay && timeline && (
        <NightTimeline model={timeline} t={scrubNight} onT={onScrub} />
      )}

      <div className="fi-island-hud">
        <div className="fi-island-hud-left">
          <button type="button" onClick={onBack} className="fi-island-back"><span aria-hidden="true">←</span><span><strong>{t('island.back')}</strong><small>L0 · ATLAS</small></span></button>
          <section className="fi-island-dossier">
            <div className="fi-island-dossier-meta">
              <span>L1 · ISLAND</span>
              <span>{t(DOMAIN_I18N[domain] ?? 'chart.domains.cross')}</span>
              <span>{t(`chart.stages.${['空岛', '草棚', '书院', '学派'][STAGE_INDEX[detail.growth.stage] ?? 0]}`)}</span>
              {cluster && <span>{cluster}</span>}
            </div>
            <h1>{title}</h1>
            <p className="fi-island-qfocus"><span>QFocus</span>{qfocus}</p>
            {brief && <p className="fi-island-brief">{brief}</p>}
            <div className="fi-island-evidence-row">
              {citation && <a href={citation.url} target="_blank" rel="noopener noreferrer">↗ {citation.venue} · {citation.year}</a>}
            {/* 海即数据 decoder: sea darkness = abstractness, agitation = contention;
                stated as text so the sea's data channels are always decodable. */}
              {seaStats?.substrate != null && <span>≈ {t('island.seaData.depth')} {seaStats.substrate.toFixed(2)} · {t(abstractKey(seaStats.substrate))}</span>}
              {relParts.length > 0 && <span>⇄ {relParts.join(' · ')}</span>}
            </div>
            {depth && (
              <details className="fi-island-depth" style={{ marginTop: 8, maxWidth: 540 }}>
                <summary style={{ cursor: 'pointer', fontSize: 12, letterSpacing: '.04em', opacity: 0.82 }}>
                  {t('island.depth.title')}
                </summary>
                <div style={{ maxHeight: 268, overflowY: 'auto', marginTop: 6, fontSize: 12.5, lineHeight: 1.55, display: 'grid', gap: 5 }}>
                  <p><b>{t('island.depth.overview')} · </b>{depth.overview[lang]}</p>
                  <p><b>{t('island.depth.whyMatters')} · </b>{depth.whyMatters[lang]}</p>
                  <p><b>{t('island.depth.ifAnswered')} · </b>{depth.ifAnswered[lang]}</p>
                  <p style={{ margin: 0 }}><b>{t('island.depth.approaches')}</b></p>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {depth.approaches.map((a, i) => <li key={i}>{a[lang]}</li>)}
                  </ul>
                  <p><b>{t('island.depth.barrier')} · </b>{depth.barrier[lang]}</p>
                  <p style={{ margin: 0 }}><b>{t('island.depth.subQuestions')}</b></p>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {depth.subQuestions.map((q, i) => <li key={i}>{q[lang]}</li>)}
                  </ul>
                  {literature.length > 0 && (
                    <>
                      <p style={{ margin: 0 }}><b>{t('island.depth.literature')}</b></p>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {literature.map((l, i) => (
                          <li key={i}>
                            <a href={l.url} target="_blank" rel="noopener noreferrer">{l.title}</a>
                            {' '}· {l.venue} ({l.year})
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </details>
            )}
          </section>
        </div>
        <div className="fi-island-hud-mode">
          <DayNightLever night={night} onToggle={onToggleNight} />
        </div>
      </div>

      {/* Transplant-through-dock trigger (Phase B.3) — a human moves a driftwood
          atom through the dock into a formal station. Bottom-right, opposite the
          leave links; the panel does the picking + POST. */}
      <button
        type="button"
        onClick={() => setTransplantOpen(true)}
        data-testid="transplant-open"
        className="fi-transplant-trigger"
      >
        <span aria-hidden="true">渡</span><span><strong>{t('island.transplant.open')}</strong><small>DRIFTWOOD → DOCK → STATION</small></span>
      </button>

      {/* Leave links */}
      <div className="fi-leave-links">
        <span>{t('island.leaveLinks.label')}</span>
        <a href={api.problemMdUrl(slug)} style={{ color: 'var(--gold2,#8A6A1E)' }}> {t('island.leaveLinks.problem')}</a>
        {' · '}
        <a href={api.ledgerJsonlUrl(slug)} style={{ color: 'var(--gold2,#8A6A1E)' }}>{t('island.leaveLinks.ledger')}</a>
      </div>
    </div>
  );
}

import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import { AtlasChartScreen } from './components/chart/AtlasChartScreen';
import { IslandScreen } from './components/island/IslandScreen';
import { CeremonyOverlay } from './components/ceremony/CeremonyOverlay';
import { CollisionOverlay } from './components/ceremony/CollisionOverlay';
import { Toast } from './components/shell/Toast';
import { LangToggle } from './components/shell/LangToggle';
import { SessionBadge } from './components/shell/SessionBadge';
import { WorldTrail } from './components/shell/WorldTrail';
import { MobileShell } from './components/mobile/MobileShell';
import { useAppData } from './api/useAppData';
import { api } from './api/client';
import { usePresence } from './presence/usePresence';
import { QUESTIONS, SAMPLE_SLUG, STN, type IslandDatum, type QuestionDatum } from './api/fallback';
import { localizeStationZh } from './i18n/stations';
import { wipeReducer, initialWipe } from './state/wipeMachine';
import {
  explorationReducer,
  type CompletedPassage,
  type PassageIntent,
  type WorldExplorerPose,
} from './state/explorationSession';
import {
  downloadExplorationNotebook,
  explorationNotebookMarkdown,
  loadExplorationNotebook,
  saveExplorationNotebook,
} from './state/explorationNotebook';
import {
  ceremonyReducer,
  initialCeremony,
  ritFocusText,
} from './state/ceremonyReducer';
import { useIsMobile, useStageScale } from './useIsMobile';
import type { ModelLaunchContext, ModelRunReceipt } from './models/types';
import { modelFamily, normalizeModelLaunch } from './models/catalog';
import {
  selectWorldTrail,
  type WorldTrailDistrict,
  type WorldTrailFloor,
  type WorldWorkspace,
} from './state/worldTrail';
import {
  selectRouteOutcome,
  worldTrailFeatureEnabled,
  type ResearchActionReceipt,
} from './state/routeOutcome';

const GeneratedIslandScreen = lazy(() =>
  import('./components/island/GeneratedIslandScreen').then((module) => ({
    default: module.GeneratedIslandScreen,
  })),
);

const PassageWorkbench = lazy(() =>
  import('./components/island/PassageWorkbench').then((module) => ({
    default: module.PassageWorkbench,
  })),
);

const ModelWorkbench = lazy(() =>
  import('./components/model/ModelWorkbench').then((module) => ({
    default: module.ModelWorkbench,
  })),
);

interface NativeViewTransition {
  finished: Promise<void>;
  ready?: Promise<void>;
  updateCallbackDone?: Promise<void>;
  skipTransition: () => void;
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => NativeViewTransition;
};

export default function App() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'zh';
  const isMobile = useIsMobile();
  const scale = useStageScale();
  const worldTrailEnabled = worldTrailFeatureEnabled(import.meta.env.VITE_WORLD_TRAIL);
  const { islands, actor, harbor } = useAppData();

  // ── screen / transition ──────────────────────────────────────────────
  const [wipe, dispatchWipe] = useReducer(wipeReducer, initialWipe('chart'));
  const [exploration, dispatchExploration] = useReducer(explorationReducer, undefined, loadExplorationNotebook);

  // The field notebook is local-first and versioned. Navigation phase is not
  // persisted, so reload always starts safely at L0 while retaining research.
  useEffect(() => {
    saveExplorationNotebook(exploration);
  }, [exploration]);

  // ── L0 chart ─────────────────────────────────────────────────────────
  const [hover, setHover] = useState<number | null>(null);
  const [filter, setFilter] = useState('全部');

  // ── founded island (from a completed ceremony) ───────────────────────
  const [founded, setFounded] = useState<{ name: string; q: string; slug: string } | null>(null);
  const chartIslands = useMemo<IslandDatum[]>(
    () => founded
      // id 1002: above the frontier range, beside the sample island's 1001 —
      // a duplicate id breaks React list keys and every find-by-id lookup.
      ? [...islands, { id: 1002, n: { zh: founded.name, en: founded.name }, q: { zh: founded.q, en: founded.q }, d: '交叉', x: 1108, y: 742, s: 0.8, st: 0, m: 1, a: 5, born: true, slug: founded.slug }]
      : islands,
    [founded, islands],
  );

  // ── L1 island ────────────────────────────────────────────────────────
  const [night, setNight] = useState(false);
  const [tval, setTval] = useState(86);
  const [sel, setSel] = useState<StationKind | null>(null);
  const [selSlug, setSelSlug] = useState<string | null>(null);
  const [panel, setPanel] = useState(false);
  // The browser compositor snapshots the destination-centred L0 before React
  // swaps to L1. This preserves the canvas visually without a second Pixi app,
  // a copied WebGL buffer, or any page-covering wipe.
  const [voyageActive, setVoyageActive] = useState(false);
  const [connectionRevision, setConnectionRevision] = useState(0);
  const [modelLaunch, setModelLaunch] = useState<ModelLaunchContext | null>(null);
  const [trailDistrict, setTrailDistrict] = useState<WorldTrailDistrict | null>(null);
  const [trailFloor, setTrailFloor] = useState<WorldTrailFloor | null>(null);
  const [recentResearchAction, setRecentResearchAction] = useState<ResearchActionReceipt | null>(null);
  const modelReturnFocus = useRef('global');
  const activeVoyage = useRef<NativeViewTransition | null>(null);
  const islandReadyResolver = useRef<(() => void) | null>(null);
  const atlasReadyResolver = useRef<(() => void) | null>(null);
  const [stFilter, setStFilter] = useState('全部');
  const [driftOn, setDriftOn] = useState(false);
  const [driftDest, setDriftDest] = useState<string | null>(null);
  const [transTo, setTransTo] = useState<string | null>(null);
  const [advOn, setAdvOn] = useState(true);
  // ── collision founding (Track B) ─────────────────────────────────────
  const [collideOn, setCollideOn] = useState(false);

  // Question-Wall QFT state (mutable copy of the fallback questions).
  const [qs, setQs] = useState<QuestionDatum[]>(() => QUESTIONS.map((q) => ({ ...q })));
  const [voted, setVoted] = useState<Record<number, boolean>>({});
  const [focusIdx, setFocusIdx] = useState<number | null>(null);

  const peers = usePresence(`island:${selSlug ?? SAMPLE_SLUG}`, wipe.view === 'island' && (selSlug === SAMPLE_SLUG || !selSlug));

  // ── toast ────────────────────────────────────────────────────────────
  const [toast, setToast] = useState('');
  const [toastOn, setToastOn] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);
  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    setToastOn(true);
    toastTimer.current = window.setTimeout(() => setToastOn(false), 2600);
  }, []);

  const exportExplorationNotebook = useCallback(() => {
    const markdown = explorationNotebookMarkdown(exploration, chartIslands, lang);
    downloadExplorationNotebook(markdown);
    showToast(t('chart.explore.exported'));
  }, [chartIslands, exploration, lang, showToast, t]);

  // ── ceremony ─────────────────────────────────────────────────────────
  const [ceremony, dispatchCeremony] = useReducer(ceremonyReducer, undefined, initialCeremony);

  // chapter-2 countdown
  useEffect(() => {
    if (ceremony.rit !== 1) return;
    const id = window.setInterval(() => dispatchCeremony({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, [ceremony.rit]);

  // finish → island rises, then land on chart with a toast
  const finishTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!ceremony.riseUp) return;
    const name = ceremony.ritName ?? t('ceremony.unnamed');
    const q = ritFocusText(ceremony, lang);
    const n = ceremony.ritLog.length;
    const slug = `isle-${Date.now()}`;
    // best-effort POST /api/islands (founding). The slug is locally generated;
    // the server uses the same slug (foundIsland → opIdFor(input.slug)), so we
    // can setFounded immediately without awaiting the response.
    void api.found({
      slug,
      title: name,
      name,
      qfocus: q,
      domain: '交叉',
      questions: ceremony.ritAdded.map((qi) => ({ text: q, open: ceremony.ritMeta[qi]?.open !== false })),
      votes: Object.fromEntries(Object.entries(ceremony.ritVotes).map(([k, v]) => [k, v])),
      ceremonyLog: ceremony.ritLog.map((e) => e.k),
      actor,
    });
    finishTimer.current = window.setTimeout(() => {
      setFounded({ name, q, slug });
      dispatchCeremony({ type: 'abort' }); // closes overlay (rit → null)
      showToast(t('toast.ritDone', { name, n }));
    }, 2600);
    return () => clearTimeout(finishTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ceremony.riseUp]);

  const abortCeremony = useCallback(() => {
    showToast(t('toast.ritAbort', { n: ceremony.ritLog.length }));
    dispatchCeremony({ type: 'abort' });
  }, [ceremony.ritLog.length, showToast, t]);

  // ── handlers ─────────────────────────────────────────────────────────
  const signalIslandReady = useCallback(() => {
    islandReadyResolver.current?.();
    islandReadyResolver.current = null;
  }, []);

  const signalAtlasReady = useCallback(() => {
    atlasReadyResolver.current?.();
    atlasReadyResolver.current = null;
  }, []);

  // One scaffold for both voyage directions: the reduced-motion probe, the
  // capability fallback, the data-fi-voyage lifecycle, the readiness gate
  // (bounded at 700ms) and the ownership-guarded cleanup. Direction-specific
  // work lives entirely in `commit`/`afterCommit`.
  const runVoyageTransition = useCallback(
    (options: {
      direction: 'entering' | 'returning';
      commit: () => void;
      /** Resolved when the destination screen has actually painted. */
      readyResolver: { current: (() => void) | null };
      /** Runs inside the transition after commit (resolve-at-once shortcuts). */
      afterCommit?: (resolveReady: () => void) => void;
    }) => {
      const { direction, commit, readyResolver, afterCommit } = options;
      let reduced = false;
      try {
        reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch {
        // Browsers without matchMedia take the non-animated fallback below.
      }
      const startViewTransition = (document as ViewTransitionDocument).startViewTransition;
      if (reduced || !startViewTransition) {
        commit();
        requestAnimationFrame(() => setVoyageActive(false));
        return;
      }

      let resolveReady = () => {};
      const ready = new Promise<void>((resolve) => {
        resolveReady = resolve;
        readyResolver.current = resolve;
      });

      const transition = startViewTransition.call(document, async () => {
        document.documentElement.dataset.fiVoyage = direction;
        commit();
        afterCommit?.(resolveReady);
        // Keep the compositor's old snapshot visible until the destination has
        // actually painted. Slow/error paths still progress after a bounded wait.
        await Promise.race([
          ready,
          new Promise<void>((resolve) => window.setTimeout(resolve, 700)),
        ]);
      });
      activeVoyage.current = transition;
      const cleanUp = () => {
        // A newer voyage owns the shared dataset flag; leave it to that voyage.
        if (activeVoyage.current !== transition) return;
        activeVoyage.current = null;
        readyResolver.current = null;
        delete document.documentElement.dataset.fiVoyage;
        setVoyageActive(false);
      };
      // `skipTransition()` may reject `finished` in some implementations. Use
      // both promise branches so Escape never leaves an unhandled rejection.
      void transition.finished.then(cleanUp, cleanUp);
      // Chromium aborts the whole transition ("timeout in DOM update") when
      // the update callback outlives its internal deadline (slow machines,
      // headless CI). Progress already flows through `finished`; the abort
      // also rejects these two promises, which nothing awaits — swallow them
      // so a skipped animation never surfaces as a console error.
      void transition.ready?.catch(() => {});
      void transition.updateCallbackDone?.catch(() => {});
    },
    [],
  );

  const beginVoyage = useCallback(
    (d: IslandDatum, source: 'atlas' | 'explore' = 'atlas', worldPose?: WorldExplorerPose) => {
      if (voyageActive) return;
      const slug = d.slug ?? SAMPLE_SLUG;
      runVoyageTransition({
        direction: 'entering',
        readyResolver: islandReadyResolver,
        commit: () => {
          flushSync(() => {
            setSelSlug(slug);
            setTrailDistrict(null);
            setTrailFloor(null);
            setVoyageActive(true);
            dispatchExploration({ type: 'dock', slug, source, pose: worldPose });
            dispatchWipe({ type: 'switch', view: 'island' });
          });
        },
        // The bespoke sample island renders synchronously — release at once.
        afterCommit: (resolveReady) => {
          if (slug === SAMPLE_SLUG) requestAnimationFrame(resolveReady);
        },
      });
    },
    [runVoyageTransition, voyageActive],
  );

  const onIsland = useCallback(
    (d: IslandDatum) => {
      beginVoyage(d);
    },
    [beginVoyage],
  );

  const beginStructurePassage = useCallback(
    (intent: PassageIntent, island: IslandDatum) => {
      if (voyageActive) return;
      dispatchExploration({ type: 'begin-passage', intent });
      beginVoyage(island, 'atlas');
    },
    [beginVoyage, voyageActive],
  );

  // A bridge uses the same destination-centred handoff. Its route remains
  // visible on the atlas up to this point; the transition should not invent a
  // second, differently projected arc in DOM coordinates.
  const onBridge = useCallback(
    (b: { fromPos: { x: number; y: number }; toPos: { x: number; y: number }; arc: { cx: number; cy: number }; toSlug: string; toX: number; toY: number }) => {
      const destination = chartIslands.find((d) => d.slug === b.toSlug);
      if (destination) beginVoyage(destination);
    },
    [beginVoyage, chartIslands],
  );

  // Collision founding: found a new island on a real isomorphism bridge.
  const onCollide = useCallback(
    (bridge: { formula: string; skeleton: { zh: string; en: string }; from: string; to: string }) => {
      const slug = `collide-${Date.now()}`;
      const name = `${bridge.formula} 之岛`;
      const qfocus = `${bridge.formula} · ${bridge.skeleton[lang]} · ${bridge.from} ↔ ${bridge.to}`;
      void api.found({
        slug,
        title: name,
        name,
        qfocus,
        domain: '交叉',
        questions: [{ text: qfocus, open: true }],
        votes: { 0: 1 },
        ceremonyLog: ['collision'],
        actor,
      });
      setFounded({ name, q: qfocus, slug });
      setCollideOn(false);
      showToast(t('collision.founded', { name }));
    },
    [actor, showToast, t],
  );

  // Esc skips the shared-axis transition without reversing the user's choice.
  useEffect(() => {
    if (!voyageActive) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      signalIslandReady();
      signalAtlasReady();
      activeVoyage.current?.skipTransition();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [signalAtlasReady, signalIslandReady, voyageActive]);

  useEffect(() => () => {
    islandReadyResolver.current?.();
    atlasReadyResolver.current?.();
    activeVoyage.current?.skipTransition();
    delete document.documentElement.dataset.fiVoyage;
  }, []);

  const goChart = useCallback(() => {
    // Same re-entry guard as beginVoyage: a double-clicked Back must not start
    // a second transition whose cleanup races the first one's shared flag.
    if (voyageActive) return;
    const returnToWorld = exploration.returnTo === 'explore';
    runVoyageTransition({
      direction: 'returning',
      readyResolver: atlasReadyResolver,
      commit: () => {
        flushSync(() => {
          setPanel(false);
          setSelSlug(null);
          setTrailDistrict(null);
          setTrailFloor(null);
          setVoyageActive(true);
          dispatchExploration({ type: returnToWorld ? 'return-world' : 'return-atlas' });
          dispatchWipe({ type: 'switch', view: 'chart' });
        });
      },
    });
  }, [exploration.returnTo, runVoyageTransition, voyageActive]);

  const completeStructurePassage = useCallback((receipt: CompletedPassage) => {
    setRecentResearchAction(null);
    dispatchExploration({ type: 'complete-passage', receipt });
    setConnectionRevision((revision) => revision + 1);
    goChart();
  }, [goChart]);

  const openModel = useCallback((launch: ModelLaunchContext = {}) => {
    const opener = document.activeElement instanceof HTMLElement
      ? document.activeElement.dataset.modelLaunch
      : undefined;
    modelReturnFocus.current = opener ?? 'global';
    setModelLaunch(launch);
  }, []);
  const closeModel = useCallback(() => {
    const returnTarget = modelReturnFocus.current;
    setModelLaunch(null);
    window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(`[data-model-launch="${returnTarget}"]`)
        ?? document.querySelector<HTMLElement>('[data-model-launch="global"]');
      target?.focus();
    });
  }, []);
  const recordModelRun = useCallback((receipt: ModelRunReceipt) => {
    setRecentResearchAction(null);
    dispatchExploration({ type: 'record-model-run', receipt });
    showToast(lang === 'zh' ? '这次模型运行已放进考察札记' : 'This model run is now in the field notebook');
  }, [lang, showToast]);
  const recordConnectionOutcome = useCallback((receipt: ResearchActionReceipt) => {
    setRecentResearchAction(receipt);
    setConnectionRevision((value) => value + 1);
  }, []);

  const onStation = useCallback(
    (key: StationKind) => {
      if (key === 'questions') {
        setSel('questions');
        setPanel(true);
      } else if (key === 'driftwood') {
        setSel('driftwood');
        setDriftOn(true);
      } else {
        setSel(key);
        showToast(t('toast.stationSoon', { name: localizeStationZh(STN.find((s) => s.k === key)?.name ?? '', lang) }));
      }
    },
    [showToast, t, lang],
  );

  // keyboard: 1–8 direct-select the stations on L1
  useEffect(() => {
    if (wipe.view !== 'island' || ceremony.rit !== null) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= 8) {
        const row = STN[n - 1];
        if (row) onStation(row.k);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [wipe.view, ceremony.rit, onStation]);

  const onVoteQ = useCallback(
    (idx: number) => {
      if (voted[idx]) return;
      setQs((prev) => prev.map((q, j) => (j === idx ? { ...q, votes: q.votes + 1 } : q)));
      setVoted((prev) => ({ ...prev, [idx]: true }));
      void api.postEvent(SAMPLE_SLUG, { actor, credit: ['validation'], phase: 'A', action: 'validate', payload: { question: idx } });
    },
    [voted, actor],
  );

  const onFocus = useCallback(() => {
    const top = qs.reduce((b, q, j) => (q.votes > (qs[b]?.votes ?? -1) ? j : b), 0);
    setFocusIdx(top);
    void api.postEvent(SAMPLE_SLUG, { actor, credit: ['conceptualization'], phase: 'A', action: 'propose_subquestion', payload: { focus: top } });
  }, [qs, actor]);

  const onToggleQ = useCallback((idx: number) => {
    setQs((prev) => prev.map((q, j) => (j === idx ? { ...q, open: !q.open } : q)));
  }, []);

  const transplant = useCallback(
    (dest: '实验坊' | '白板厅') => {
      setTransTo(dest);
      setDriftDest(null);
      setDriftOn(false);
      showToast(t('toast.transplant', { dest: localizeStationZh(dest, lang) }));
      const flow = dest === '实验坊' ? 'hypothesis-output' : 'metaphor-bridge';
      void api.postEvent(SAMPLE_SLUG, { actor, credit: ['conceptualization', 'credit:ai/literature_synthesis'], phase: 'B', action: 'transplant', flow, payload: { item: 0, dest } });
    },
    [showToast, t, lang, actor],
  );

  // ── mobile (read-only) ───────────────────────────────────────────────
  const trailIslands = useMemo(() => chartIslands.map((island) => ({
    slug: island.slug ?? `id-${island.id}`,
    title: island.n[lang],
    question: island.q[lang],
  })), [chartIslands, lang]);
  const trailWorkspace = useMemo<WorldWorkspace | null>(() => {
    if (modelLaunch) {
      const normalized = normalizeModelLaunch(modelLaunch);
      return {
        kind: 'model',
        familyId: normalized.familyId,
        title: modelFamily(normalized.familyId).shortTitle[lang],
        ...(modelLaunch.sourceStructureId ? { sourceStructureId: modelLaunch.sourceStructureId } : {}),
      };
    }
    if (exploration.passageIntent && wipe.view === 'island') {
      return {
        kind: 'passage',
        title: t('shell.worldTrail.passage'),
        structureId: exploration.passageIntent.structureId,
      };
    }
    return null;
  }, [exploration.passageIntent, lang, modelLaunch, t, wipe.view]);
  const worldTrail = useMemo(() => selectWorldTrail({
    view: wipe.view,
    phase: exploration.phase,
    islandSlug: exploration.islandSlug,
    courseIslandSlug: exploration.courseIslandSlug,
    islands: trailIslands,
    district: trailDistrict,
    floor: trailFloor,
    workspace: trailWorkspace,
    structureLensId: exploration.structureLensId,
    passageIntent: exploration.passageIntent,
    comparisonLabel: wipe.view === 'chart' && exploration.phase === 'atlas'
      ? t('shell.worldTrail.comparisons')
      : null,
  }), [
    exploration.courseIslandSlug,
    exploration.islandSlug,
    exploration.passageIntent,
    exploration.phase,
    exploration.structureLensId,
    t,
    trailDistrict,
    trailFloor,
    trailIslands,
    trailWorkspace,
    wipe.view,
  ]);
  const routeOutcome = useMemo(() => selectRouteOutcome({
    islands: trailIslands,
    completedPassages: exploration.completedPassages,
    modelRuns: exploration.modelRuns,
    recentResearchAction,
  }), [exploration.completedPassages, exploration.modelRuns, recentResearchAction, trailIslands]);

  if (isMobile) return <MobileShell islands={chartIslands} modelRuns={exploration.modelRuns} onRecordModelRun={recordModelRun} worldTrailEnabled={worldTrailEnabled} />;

  const passageSource = exploration.passageIntent
    ? chartIslands.find((island) => island.slug === exploration.passageIntent?.islandSlug) ?? null
    : null;
  const passageTarget = exploration.passageIntent
    ? chartIslands.find((island) => island.slug === exploration.passageIntent?.targetIslandSlug) ?? null
    : null;

  // ── desktop shell (1440×900 world, fitted edge-to-edge) ──────────────
  return (
    <main
      className="fi-app-shell"
      data-voyage={voyageActive ? 'entering' : undefined}
      data-world-explore={exploration.phase === 'explore' || undefined}
      data-model-open={modelLaunch ? true : undefined}
    >
      {!modelLaunch && worldTrailEnabled && <WorldTrail projection={worldTrail} outcome={routeOutcome} />}
      <div className={`fi-global-controls fi-global-controls-${wipe.view}`} aria-label={t('shell.accountControls')} aria-hidden={modelLaunch ? true : undefined} inert={modelLaunch ? true : undefined}>
        <SessionBadge />
        <LangToggle />
      </div>

      <div className="fi-stage-viewport" style={{ width: 1440 * scale, height: 900 * scale }} aria-hidden={modelLaunch ? true : undefined} inert={modelLaunch ? true : undefined}>
        <div className="fi-stage" style={{ transform: `scale(${scale})` }}>
          <div className="fi-stage-inner">
          {wipe.view === 'island' && (
            <div className="fi-screen-layer fi-screen-layer-island">
              {selSlug && selSlug !== SAMPLE_SLUG ? (
                <Suspense fallback={<div className="fi-island-loading-mark" role="status"><i aria-hidden="true" /><span>{t('island.loading')}</span></div>}>
                  <GeneratedIslandScreen
                    slug={selSlug}
                    night={night}
                    onToggleNight={() => setNight((v) => !v)}
                    onBack={goChart}
                    backTarget={exploration.returnTo}
                    onStation={onStation}
                    actor={actor}
                    onToast={showToast}
                    surveyedDistricts={exploration.surveyedDistricts[selSlug] ?? []}
                    visitedBuildingFloors={exploration.visitedBuildingFloors}
                    activeStructureId={exploration.structureLensId}
                    completedPassageCount={exploration.completedPassages.filter((passage) =>
                      passage.islandSlug === selSlug || passage.targetIslandSlug === selSlug,
                    ).length}
                    onSurveyDistrict={(districtId) => dispatchExploration({ type: 'survey-district', slug: selSlug, districtId })}
                    onVisitBuildingFloor={(station, floorId) => dispatchExploration({ type: 'visit-building-floor', slug: selSlug, station, floorId })}
                    onActiveDistrict={setTrailDistrict}
                    onActiveFloor={setTrailFloor}
                    onReady={signalIslandReady}
                  />
                </Suspense>
              ) : (
                <IslandScreen
                  night={night}
                  onToggleNight={() => setNight((v) => !v)}
                  t={tval}
                  onT={setTval}
                  sel={sel}
                  panel={panel}
                  onStation={onStation}
                  onClosePanel={() => setPanel(false)}
                  onBack={goChart}
                  backTarget={exploration.returnTo}
                  stFilter={stFilter}
                  onStFilter={setStFilter}
                  driftOn={driftOn}
                  driftDest={driftDest}
                  transTo={transTo}
                  onCloseDrift={() => {
                    setDriftOn(false);
                    setDriftDest(null);
                  }}
                  onMove={() => setDriftDest('choosing')}
                  onToWorkshop={() => transplant('实验坊')}
                  onToCanvas={() => transplant('白板厅')}
                  actor={actor}
                  onToast={showToast}
                  qs={qs}
                  voted={voted}
                  focusIdx={focusIdx}
                  advOn={advOn}
                  onCloseAdv={() => setAdvOn(false)}
                  onToggleQ={onToggleQ}
                  onVoteQ={onVoteQ}
                  onFocus={onFocus}
                  peers={peers}
                />
              )}
              {exploration.passageIntent && selSlug === exploration.passageIntent.targetIslandSlug && (
                <Suspense fallback={<div className="fi-passage-overlay fi-passage-loading" role="status"><span>{t('island.loading')}</span></div>}>
                  <PassageWorkbench
                    intent={exploration.passageIntent}
                    source={passageSource}
                    target={passageTarget}
                    actor={actor}
                    lang={lang}
                    onCancel={() => dispatchExploration({ type: 'cancel-passage' })}
                    onComplete={completeStructurePassage}
                    onToast={showToast}
                  />
                </Suspense>
              )}
            </div>
          )}

          {wipe.view === 'chart' && (
            <div className="fi-screen-layer fi-screen-layer-chart">
              <AtlasChartScreen
                islands={chartIslands}
                harbor={harbor}
                filter={filter}
                onFilter={setFilter}
                hover={hover}
                onHover={setHover}
                onIsland={onIsland}
                onBuild={() => dispatchCeremony({ type: 'start' })}
                onCollide={() => setCollideOn(true)}
                onBridge={onBridge}
                onExplore={() => dispatchExploration({ type: 'enter-world' })}
                onAtlasReady={signalAtlasReady}
                modelLayer={{ active: !!modelLaunch, onOpen: openModel }}
                structurePassage={{
                  selectedId: exploration.structureLensId,
                  departure: exploration.structureDeparture,
                  intent: exploration.passageIntent,
                  revision: connectionRevision,
                  actor,
                  onSelect: (structureId) => dispatchExploration({ type: 'select-structure', structureId }),
                  onDeparture: (departure) => dispatchExploration({ type: 'select-passage-departure', departure }),
                  onBegin: beginStructurePassage,
                  onConnectionWrite: recordConnectionOutcome,
                }}
                worldExplore={{
                  active: exploration.phase === 'explore',
                  initialPose: exploration.worldPose,
                  visitedIslandSlugs: exploration.visitedIslandSlugs,
                  sampledCurrents: exploration.sampledCurrents,
                  courseSlug: exploration.courseIslandSlug,
                  courseHistorySlugs: exploration.courseHistorySlugs,
                  notes: exploration.notes,
                  onCourse: (slug) => dispatchExploration({ type: 'set-course', slug }),
                  onPose: (pose) => dispatchExploration({ type: 'remember-world-pose', pose }),
                  onInspect: (slug) => dispatchExploration({ type: 'inspect-island', slug }),
                  onSampleCurrent: (current) => dispatchExploration({ type: 'sample-current', current }),
                  onNote: (slug, text) => dispatchExploration({ type: 'write-note', slug, text }),
                  onExportNotebook: exportExplorationNotebook,
                  onDock: (island, pose) => beginVoyage(island, 'explore', pose),
                  onExit: (pose) => {
                    if (pose) dispatchExploration({ type: 'remember-world-pose', pose });
                    dispatchExploration({ type: 'return-atlas' });
                  },
                }}
              />
            </div>
          )}

          {ceremony.rit !== null && (
            <CeremonyOverlay state={ceremony} dispatch={dispatchCeremony} onAbort={abortCeremony} onFinish={() => dispatchCeremony({ type: 'finish' })} />
          )}

          {collideOn && (
            <CollisionOverlay onCollide={onCollide} onClose={() => setCollideOn(false)} />
          )}

          <Toast text={toast} on={toastOn} />
          </div>
        </div>
      </div>
      {modelLaunch && (
        <Suspense fallback={<div className="fi-model-overlay"><div className="fi-model-loading" role="status">{t('island.loading')}</div></div>}>
          <ModelWorkbench
            lang={lang}
            launch={modelLaunch}
            previousRuns={exploration.modelRuns}
            onSave={recordModelRun}
            onClose={closeModel}
            worldTrail={worldTrailEnabled ? worldTrail : undefined}
            routeOutcome={worldTrailEnabled ? routeOutcome : undefined}
          />
        </Suspense>
      )}
    </main>
  );
}

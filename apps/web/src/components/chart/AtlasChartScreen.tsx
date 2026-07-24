/**
 * AtlasChartScreen — the DEFAULT L0 (atlas-world-plan.md §4 lane W1). Promotes
 * the semantic-zoom Pixi atlas (`AtlasStage`, previously only reachable behind
 * `?atlas=pixi`) to the path every visitor hits with NO query flag: a
 * continuous world→region→isle camera instead of the flat ~30-island SVG
 * scatter. Drop-in for `ChartScreen` — same `ChartScreenProps`, same chrome
 * (`ChartChrome`/`IslandCard`, both extracted so neither screen can drift from
 * the other), same `onIsland`/`onBuild`/`onCollide` wiring into `App.tsx`'s
 * shared-axis L0→L1 handoff.
 *
 * Fallback discipline (CLAUDE.md + architecture §7): the app must render with
 * no GPU present. `hasWebGL()` is a synchronous, pixi-import-free precheck —
 * when it fails (or the lazy Pixi engine throws after all), this renders the
 * ORIGINAL `ChartScreen` (SVG) untouched, byte-for-byte. PixiJS itself is
 * loaded only via `React.lazy(() => import('../../chart/AtlasChartHost'))`,
 * mirroring the L1 GeneratedIslandScreen → PixiScene lazy-load discipline
 * (commit "perf(web): lazy-load PixiScene") — the main bundle never regains it.
 *
 * Continuity contract: the Pixi camera centres the chosen island before
 * `onIsland`; App then keeps that rendered frame in the browser compositor
 * while L1 mounts and expands from the same optical centre. No ferry, second
 * route, or page-covering wipe sits between the atlas and the island.
 */
import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { AtlasExplorerCurrent, AtlasExplorerIsland, AtlasExplorerPose } from '@frontier-isles/renderer/pixi';
import { ChartScreen, type ChartScreenProps } from './ChartScreen';
import { WorldExploreScreen } from './WorldExploreScreen';
import { ChartChrome } from './ChartChrome';
import { IslandCard } from './IslandCard';
import { computeCardContent, cardBoxPos } from './cardContent';
import { hasWebGL } from '../../chart/webgl';
import { api, type ApiSeaData, type ApiStructure, type ApiStructureGraph } from '../../api/client';
import { fallbackStructures, fallbackStructureGraph } from '../../api/structureFallback';
import { fixtureSeaData } from '../../api/seaFallback';
import type { IslandDatum } from '../../api/fallback';
import type { AtlasControls, AtlasMetrics } from '../../chart/atlasControls';
import {
  buildConnectionField,
  projectConnectionMap,
  type ConnectionChannel,
  type ConnectionFocus,
} from '../../chart/connectionField';
import type { PassageIntent, SampledCurrentRecord, StructureDeparture } from '../../state/explorationSession';
import type { ModelLaunchContext } from '../../models/types';
import type { ResearchActionReceipt } from '../../state/routeOutcome';

const AtlasChartHost = lazy(() => import('../../chart/AtlasChartHost'));
const ConnectionFieldPanel = lazy(() =>
  import('./ConnectionFieldPanel').then((module) => ({ default: module.ConnectionFieldPanel })),
);

class AtlasErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { console.error('[atlas] Pixi atlas fell back to SVG', error); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export interface AtlasWorldExploreProps {
  active: boolean;
  initialPose: AtlasExplorerPose | null;
  visitedIslandSlugs: readonly string[];
  sampledCurrents: readonly SampledCurrentRecord[];
  courseSlug: string | null;
  courseHistorySlugs: readonly string[];
  notes: Readonly<Record<string, string>>;
  onCourse: (slug: string | null) => void;
  onPose: (pose: AtlasExplorerPose) => void;
  onInspect: (slug: string) => void;
  onSampleCurrent: (current: SampledCurrentRecord) => void;
  onNote: (slug: string, text: string) => void;
  onExportNotebook: () => void;
  onDock: (island: IslandDatum, pose: AtlasExplorerPose) => void;
  onExit: (pose?: AtlasExplorerPose) => void;
}

export interface AtlasChartScreenProps extends ChartScreenProps {
  worldExplore?: AtlasWorldExploreProps;
  structurePassage?: {
    selectedId: string | null;
    departure: StructureDeparture | null;
    intent: PassageIntent | null;
    /** Incremented after a successful write so the returning atlas refetches
     * the canonical mapping and shows the new branch immediately. */
    revision: number;
    actor?: string;
    onSelect: (structureId: string | null) => void;
    onDeparture: (departure: StructureDeparture) => void;
    onBegin: (intent: PassageIntent, island: IslandDatum) => void;
    onConnectionWrite?: (receipt: ResearchActionReceipt) => void;
  };
  /** Fires once the atlas is actually painted (Pixi ready, or the SVG fallback
   * mounted). The return voyage holds its snapshot on this signal. */
  onAtlasReady?: () => void;
  /** A boot URL asked for this island. The atlas flies in through the same
   * `controls.enter` path search uses (direct voyage on the no-GPU fallback);
   * a slug missing from the roster reports back instead of erroring. */
  deepLinkSlug?: string | null;
  onDeepLinkUnknown?: () => void;
  modelLayer?: {
    active: boolean;
    onOpen: (launch: ModelLaunchContext) => void;
  };
}

export function AtlasChartScreen(props: AtlasChartScreenProps) {
  return <AtlasErrorBoundary fallback={<ChartScreen {...props} />}><AtlasChartScreenImpl {...props} /></AtlasErrorBoundary>;
}

function AtlasChartScreenImpl(props: AtlasChartScreenProps) {
  const { islands, harbor, filter = '全部', onFilter, hover, onHover, onIsland, onBuild, onCollide, onExplore, worldExplore, structurePassage, onAtlasReady, modelLayer, deepLinkSlug, onDeepLinkUnknown } = props;
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';

  // Sync WebGL precheck — no pixi import, so an unsupported browser never even
  // requests the atlas chunk. `onWebglError` (below) covers the rarer case
  // where WebGL reports present but Pixi still fails to boot.
  const [noGpu, setNoGpu] = useState<boolean>(() => !hasWebGL());
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [controls, setControls] = useState<AtlasControls | null>(null);
  const [metrics, setMetrics] = useState<AtlasMetrics | null>(null);
  const [nearby, setNearby] = useState<AtlasExplorerIsland | null>(null);
  const [nearbyCurrent, setNearbyCurrent] = useState<AtlasExplorerCurrent | null>(null);
  const [neighborhood, setNeighborhood] = useState<AtlasExplorerIsland[]>([]);
  const [flightPose, setFlightPose] = useState<AtlasExplorerPose | null>(worldExplore?.initialPose ?? null);
  const [inspectRequest, setInspectRequest] = useState(0);
  const [dockRequest, setDockRequest] = useState(0);
  const [sampleCurrentRequest, setSampleCurrentRequest] = useState(0);
  const [altitudeRequest, setAltitudeRequest] = useState<{ sequence: number; direction: -1 | 1 }>({ sequence: 0, direction: 1 });
  // Survey completions flow back through the host for BOTH input paths
  // (overlay button and the E key); this signal opens the field-note panel so
  // a keyboard survey reads exactly like a clicked one.
  const [surveySignal, setSurveySignal] = useState<{ slug: string; sequence: number } | null>(null);
  const sampledCurrentIds = useMemo(
    () => worldExplore?.sampledCurrents.map((current) => current.id) ?? [],
    [worldExplore?.sampledCurrents],
  );
  const instrumentsRef = useRef<HTMLDivElement | null>(null);
  // One fused read field over the three existing truths: resolved human
  // mappings, curated mathematical bridges, and ledger currents. If any live
  // half is unavailable, all three come from the matched offline seed so eras
  // never mix and the visual explanation remains identical.
  const [structures, setStructures] = useState<ApiStructure[]>([]);
  const [structureGraph, setStructureGraph] = useState<ApiStructureGraph | null>(null);
  const [seaData, setSeaData] = useState<ApiSeaData | null>(null);
  const [connectionChannel, setConnectionChannel] = useState<ConnectionChannel>('all');
  const [connectionFocus, setConnectionFocusState] = useState<ConnectionFocus>(null);
  const [connectionVisible, setConnectionVisible] = useState(true);
  const [localLensId, setLocalLensId] = useState<string | null>(null);
  const lensId = structurePassage ? structurePassage.selectedId : localLensId;
  const setLensId = useCallback((id: string | null) => {
    if (structurePassage) structurePassage.onSelect(id);
    else setLocalLensId(id);
  }, [structurePassage]);
  const pendingPassage = useRef<{ intent: PassageIntent; island: IslandDatum } | null>(null);
  const pendingConnectionPath = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [s, g, sea] = await Promise.all([api.structures(), api.structureGraph(), api.currents()]);
      if (!alive) return;
      if (s && g && sea && Array.isArray(g.mappings)) {
        setStructures(s.structures);
        setStructureGraph(g);
        setSeaData(sea);
        if (pendingConnectionPath.current) {
          setConnectionFocusState({ type: 'path', id: pendingConnectionPath.current });
          pendingConnectionPath.current = null;
        }
      } else {
        setStructures(fallbackStructures());
        setStructureGraph(fallbackStructureGraph());
        setSeaData(fixtureSeaData());
        pendingConnectionPath.current = null;
      }
    })();
    return () => { alive = false; };
  }, [structurePassage?.revision]);

  const connectionField = useMemo(
    () => structureGraph && seaData ? buildConnectionField(structures, structureGraph, seaData, islands) : null,
    [structures, structureGraph, seaData, islands],
  );
  const effectiveFocus = useMemo<ConnectionFocus>(
    () => connectionFocus ?? (lensId ? { type: 'convergence', id: lensId } : null),
    [connectionFocus, lensId],
  );
  const setConnectionFocus = useCallback((focus: ConnectionFocus) => {
    setConnectionFocusState(focus);
    setLensId(focus?.type === 'convergence' ? focus.id : null);
  }, [setLensId]);
  const connectionMap = useMemo(
    () => connectionVisible && connectionField
      ? projectConnectionMap(connectionField, connectionChannel, effectiveFocus)
      : null,
    [connectionVisible, connectionField, connectionChannel, effectiveFocus],
  );

  // Escape returns a focused explanation to the global field. Inputs retain
  // their native Escape behavior.
  useEffect(() => {
    if (!effectiveFocus) return;
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (event.key === 'Escape' && tag !== 'INPUT' && tag !== 'TEXTAREA') setConnectionFocus(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [effectiveFocus, setConnectionFocus]);

  const handleHoverIsland = useCallback(
    (d: IslandDatum | null, pos: { x: number; y: number } | null) => {
      onHover(d ? d.id : null);
      setHoverPos(pos);
    },
    [onHover],
  );

  const handleWebglError = useCallback(() => setNoGpu(true), []);

  useEffect(() => {
    controls?.focusDomain(filter === '全部' ? null : filter as '数理' | '物质' | '生命' | '交叉');
  }, [controls, filter]);

  useEffect(() => {
    if (!worldExplore?.active) return;
    onHover(null);
    setHoverPos(null);
  }, [onHover, worldExplore?.active]);

  const enterPassage = useCallback((intent: PassageIntent, island: IslandDatum) => {
    if (controls && island.slug) {
      pendingPassage.current = { intent, island };
      controls.enter(island.slug);
      return;
    }
    structurePassage?.onBegin(intent, island);
  }, [controls, structurePassage]);

  // A shared link flies in exactly like a chosen search result. Waiting on
  // `controls` covers the Pixi boot window; the no-GPU fallback docks
  // directly, and an unknown slug reports back instead of erroring.
  const enteredDeepLink = useRef<string | null>(null);
  useEffect(() => {
    if (!deepLinkSlug || enteredDeepLink.current === deepLinkSlug) return;
    const island = islands.find((entry) => entry.slug === deepLinkSlug);
    if (!island) {
      enteredDeepLink.current = deepLinkSlug;
      onDeepLinkUnknown?.();
      return;
    }
    if (noGpu) {
      enteredDeepLink.current = deepLinkSlug;
      onIsland(island);
      return;
    }
    if (!controls) return;
    enteredDeepLink.current = deepLinkSlug;
    controls.enter(deepLinkSlug);
  }, [controls, deepLinkSlug, islands, noGpu, onDeepLinkUnknown, onIsland]);

  // The SVG fallback paints synchronously — release the return voyage at once.
  useEffect(() => {
    if (noGpu) onAtlasReady?.();
  }, [noGpu, onAtlasReady]);

  if (noGpu) {
    if (worldExplore?.active) {
      return (
        <section className="fi-world-explore-fallback" role="status">
          <span aria-hidden="true">舟</span>
          <h1>{t('chart.explore.unavailable')}</h1>
          <p>{t('chart.explore.unavailableHint')}</p>
          <button type="button" onClick={() => worldExplore.onExit()}>{t('chart.explore.exit')}</button>
        </section>
      );
    }
    return <ChartScreen {...props} />;
  }

  const hd = hover != null ? islands.find((d) => d.id === hover) ?? null : null;
  const card = hd && hoverPos ? { content: computeCardContent(hd, lang, t), ...cardBoxPos(hoverPos.x, hoverPos.y) } : null;

  return (
    <div data-screen-label="L0 图集海图" style={{ position: 'absolute', inset: 0, background: '#F2EAD8' }}>
      {/* Suspense fallback={null} (not <ChartScreen/>) — same convention as
          GeneratedIslandScreen's PixiScene: a brief blank paper background
          while the small atlas chunk loads, never a double chrome. */}
      <Suspense fallback={<div className="fi-atlas-loading" role="status"><i aria-hidden="true" /><span>{t('chart.tiers.loading')}</span></div>}>
        <AtlasChartHost
          islands={islands}
          harbor={harbor}
          connectionField={worldExplore?.active ? null : connectionMap}
          onPick={(island) => {
            const pending = pendingPassage.current;
            if (pending && pending.island.slug === island.slug) {
              pendingPassage.current = null;
              structurePassage?.onBegin(pending.intent, island);
              return;
            }
            pendingPassage.current = null;
            onIsland(island);
          }}
          onHoverIsland={handleHoverIsland}
          onWebglError={handleWebglError}
          onReady={(atlasControls) => { setControls(atlasControls); onAtlasReady?.(); }}
          onMetrics={setMetrics}
          exploreActive={worldExplore?.active}
          exploreInitialPose={worldExplore?.initialPose}
          exploreSurveyedSlugs={worldExplore?.visitedIslandSlugs}
          exploreSampledCurrentIds={sampledCurrentIds}
          exploreCourseSlug={worldExplore?.courseSlug}
          exploreInspectRequest={inspectRequest}
          exploreDockRequest={dockRequest}
          exploreSampleCurrentRequest={sampleCurrentRequest}
          exploreAltitudeRequest={altitudeRequest.sequence}
          exploreAltitudeDirection={altitudeRequest.direction}
          onExplorePose={worldExplore?.onPose}
          onExploreFlight={setFlightPose}
          onExploreNearby={setNearby}
          onExploreNeighborhood={setNeighborhood}
          onExploreCurrent={setNearbyCurrent}
          onExploreInspect={(slug) => {
            worldExplore?.onInspect(slug);
            setSurveySignal((previous) => ({ slug, sequence: (previous?.sequence ?? 0) + 1 }));
          }}
          onExploreSampleCurrent={(current) => worldExplore?.onSampleCurrent({
            id: current.id,
            fromSlug: current.fromSlug,
            toSlug: current.toSlug,
            kind: current.kind,
            sign: current.sign,
            directed: current.directed,
            ...(current.maturity ? { maturity: current.maturity } : {}),
            weight: current.weight,
          })}
          onExploreExit={worldExplore?.onExit}
          onExploreDock={(slug, pose) => {
            const island = islands.find((candidate) => (candidate.slug ?? `id-${candidate.id}`) === slug);
            if (island) worldExplore?.onDock(island, pose);
          }}
        />
      </Suspense>

      <div
        ref={instrumentsRef}
        className="fi-atlas-instruments"
        data-muted={worldExplore?.active || undefined}
        aria-hidden={worldExplore?.active || undefined}
        inert={worldExplore?.active || undefined}
      >
        {!worldExplore?.active && <ChartChrome islands={islands} onPick={onIsland} onBuild={onBuild} onCollide={onCollide} filter={filter} onFilter={onFilter} controls={controls} metrics={metrics} onHome={harbor && harbor.islandSlugs.length > 0 ? () => controls?.home?.() : undefined} onExplore={onExplore} />}

        {!worldExplore?.active && !modelLayer?.active && connectionField && (
          <Suspense fallback={null}>
            <ConnectionFieldPanel
              field={connectionField}
              lang={lang}
              channel={connectionChannel}
              focus={effectiveFocus}
              visible={connectionVisible}
              departure={structurePassage?.departure ?? null}
              intent={structurePassage?.intent ?? null}
              actor={structurePassage?.actor}
              onChannel={setConnectionChannel}
              onFocus={setConnectionFocus}
              onVisible={setConnectionVisible}
              onDeparture={(departure) => structurePassage?.onDeparture(departure)}
              onPassage={(intent, problem) => enterPassage(intent, problem.datum)}
              onEnter={(problem) => { if (controls) controls.enter(problem.slug); else onIsland(problem.datum); }}
              onResponseRecorded={(receipt) => {
                pendingConnectionPath.current = receipt.focusPathId;
                structurePassage?.onConnectionWrite?.(receipt);
              }}
              onBuildModel={(launch) => modelLayer?.onOpen(launch)}
            />
          </Suspense>
        )}

        {!worldExplore?.active && card && <IslandCard content={card.content} left={card.left} top={card.top} />}
      </div>

      {!worldExplore?.active && !modelLayer?.active && modelLayer && typeof document !== 'undefined' && createPortal(
        <button type="button" className="fi-model-launch" data-model-launch="global" onClick={() => modelLayer.onOpen({
          familyId: 'synchronization',
          sourceStructureId: 'struct://xfrontier/synchronization',
          sourceProblemSlugs: ['self-learning-matter'],
        })}>
          <i aria-hidden="true"><span /><span /><span /></i>
          <span><small>{lang === 'zh' ? '已有记录：耦合振子同步' : 'Recorded: coupled-oscillator synchronization'}</small><strong>{lang === 'zh' ? '亲手搭一个会跑的模型' : 'Build a model you can run'}</strong><em>{lang === 'zh' ? '再换到热 · 扩散 · 静电势 · 流动' : 'then move into heat · diffusion · potential · flow'}</em></span>
          <b aria-hidden="true">↗</b>
        </button>,
        document.body,
      )}

      {worldExplore?.active && (
        <WorldExploreScreen
          islands={islands}
          visitedIslandSlugs={worldExplore.visitedIslandSlugs}
          sampledCurrents={worldExplore.sampledCurrents}
          courseHistorySlugs={worldExplore.courseHistorySlugs}
          notes={worldExplore.notes}
          nearby={nearby}
          nearbyCurrent={nearbyCurrent}
          neighborhood={neighborhood}
          courseSlug={worldExplore.courseSlug}
          pose={flightPose}
          onCourse={worldExplore.onCourse}
          onAltitude={(direction) => setAltitudeRequest((request) => ({ sequence: request.sequence + 1, direction }))}
          onInspect={() => setInspectRequest((request) => request + 1)}
          onSampleCurrent={() => setSampleCurrentRequest((request) => request + 1)}
          surveySignal={surveySignal}
          onNote={worldExplore.onNote}
          onExportNotebook={worldExplore.onExportNotebook}
          onDock={() => setDockRequest((request) => request + 1)}
          onExit={() => worldExplore.onExit(flightPose ?? undefined)}
        />
      )}

    </div>
  );
}

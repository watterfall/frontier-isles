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
import { useTranslation } from 'react-i18next';
import type { AtlasExplorerCurrent, AtlasExplorerIsland, AtlasExplorerPose } from '@frontier-isles/renderer/pixi';
import { ChartScreen, type ChartScreenProps } from './ChartScreen';
import { WorldExploreScreen } from './WorldExploreScreen';
import { ChartChrome } from './ChartChrome';
import { IslandCard } from './IslandCard';
import { StructureLensPanel } from './StructureLensPanel';
import { computeCardContent, cardBoxPos } from './cardContent';
import { hasWebGL } from '../../chart/webgl';
import { api, type ApiStructure, type ApiStructureGraph } from '../../api/client';
import { fallbackStructures, fallbackStructureGraph, slugOfOp } from '../../api/structureFallback';
import type { IslandDatum } from '../../api/fallback';
import type { AtlasControls, AtlasMetrics } from '../../chart/atlasControls';
import type { SampledCurrentRecord } from '../../state/explorationSession';

const AtlasChartHost = lazy(() => import('../../chart/AtlasChartHost'));

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
  /** Fires once the atlas is actually painted (Pixi ready, or the SVG fallback
   * mounted). The return voyage holds its snapshot on this signal. */
  onAtlasReady?: () => void;
}

export function AtlasChartScreen(props: AtlasChartScreenProps) {
  return <AtlasErrorBoundary fallback={<ChartScreen {...props} />}><AtlasChartScreenImpl {...props} /></AtlasErrorBoundary>;
}

function AtlasChartScreenImpl(props: AtlasChartScreenProps) {
  const { islands, harbor, filter = '全部', onFilter, hover, onHover, onIsland, onBuild, onCollide, onExplore, worldExplore, onAtlasReady } = props;
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
  // Structure lens (执行纲要 §九): objects + bipartite graph, best-effort from
  // the live API with the offline fallback (same seed, same reduce — the lens
  // renders identically with the server absent).
  const [structures, setStructures] = useState<ApiStructure[]>([]);
  const [structureGraph, setStructureGraph] = useState<ApiStructureGraph | null>(null);
  const [lensId, setLensId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [s, g] = await Promise.all([api.structures(), api.structureGraph()]);
      if (!alive) return;
      // req is best-effort (null on any failure) — either half missing means
      // the pair comes from the fallback, so objects and graph never mix eras.
      if (s && g) {
        setStructures(s.structures);
        setStructureGraph(g);
      } else {
        setStructures(fallbackStructures());
        setStructureGraph(fallbackStructureGraph());
      }
    })();
    return () => { alive = false; };
  }, []);

  // Stable lens identity: the host keys an effect on this object, and metrics
  // updates re-render this screen every camera settle — an inline literal here
  // would re-fire setStructureLens (and its camera flight) forever.
  const lens = useMemo(
    () => (lensId && structureGraph ? { structureId: lensId, graph: structureGraph } : null),
    [lensId, structureGraph],
  );

  // The list twin's rows, resolved from the frontier's op ids to chart
  // islands. Rebuilt rows carry the edge's real weight + actors (a reduce
  // over rebuild events); gaps split into the same near/far gradient the map
  // draws (same cluster vs same domain only).
  const twin = useMemo(() => {
    const empty = {
      rebuilt: [] as Array<{ d: IslandDatum; weight: number; actors: string[] }>,
      nearGaps: [] as IslandDatum[],
      farGaps: [] as IslandDatum[],
    };
    if (!lensId || !structureGraph) return empty;
    const bySlug = new Map(islands.filter((d) => d.slug).map((d) => [d.slug!, d] as const));
    const f = structureGraph.frontier.find((x) => x.structureId === lensId);
    const edgeBySlug = new Map(
      structureGraph.edges.filter((e) => e.structureId === lensId).map((e) => [slugOfOp(e.islandOp), e] as const),
    );
    const rebuilt = (f?.rebuilt ?? []).flatMap((op) => {
      const d = bySlug.get(slugOfOp(op));
      if (!d) return [];
      const e = edgeBySlug.get(slugOfOp(op));
      return [{ d, weight: e?.weight ?? 1, actors: e?.actors ?? [] }];
    });
    const rebuiltClusters = new Set(rebuilt.map((r) => r.d.cluster?.code).filter((c): c is string => !!c));
    const nearGaps: IslandDatum[] = [];
    const farGaps: IslandDatum[] = [];
    for (const op of f?.gaps ?? []) {
      const d = bySlug.get(slugOfOp(op));
      if (!d) continue;
      if (d.cluster?.code && rebuiltClusters.has(d.cluster.code)) nearGaps.push(d);
      else farGaps.push(d);
    }
    return { rebuilt, nearGaps, farGaps };
  }, [lensId, structureGraph, islands]);

  // ESC leaves the lens (the search box's own Escape handling wins while
  // an input is focused).
  useEffect(() => {
    if (!lensId) return;
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (event.key === 'Escape' && tag !== 'INPUT' && tag !== 'TEXTAREA') setLensId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lensId]);

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
    setLensId(null);
    onHover(null);
    setHoverPos(null);
  }, [onHover, worldExplore?.active]);

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
  // While a lens is on, the hover card states this island's relation to the
  // structure: rebuilt (who walked the bridge, from the real edge) or an
  // honest gap line — bare fact only, never a suggested mapping (§九).
  let lensNote: { kind: 'rebuilt' | 'gap'; text: string } | undefined;
  if (hd?.slug && lensId && structureGraph) {
    const slug = hd.slug;
    const edge = structureGraph.edges.find((e) => e.structureId === lensId && slugOfOp(e.islandOp) === slug);
    if (edge) {
      const who = edge.actors.map((a) => `@${a.split(':').at(-1) ?? a}`).join(' ');
      lensNote = { kind: 'rebuilt', text: t('chart.card.lensRebuilt', { n: edge.weight, who }) };
    } else if (twin.nearGaps.some((d) => d.slug === slug) || twin.farGaps.some((d) => d.slug === slug)) {
      lensNote = { kind: 'gap', text: t('chart.card.lensGap') };
    }
  }
  const card = hd && hoverPos ? { content: computeCardContent(hd, lang, t, lensNote), ...cardBoxPos(hoverPos.x, hoverPos.y) } : null;

  return (
    <div data-screen-label="L0 图集海图" style={{ position: 'absolute', inset: 0, background: '#F2EAD8' }}>
      {/* Suspense fallback={null} (not <ChartScreen/>) — same convention as
          GeneratedIslandScreen's PixiScene: a brief blank paper background
          while the small atlas chunk loads, never a double chrome. */}
      <Suspense fallback={<div className="fi-atlas-loading" role="status"><i aria-hidden="true" /><span>{t('chart.tiers.loading')}</span></div>}>
        <AtlasChartHost
          islands={islands}
          harbor={harbor}
          lens={worldExplore?.active ? null : lens}
          onPick={onIsland}
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

        {!worldExplore?.active && (
          <StructureLensPanel
            structures={structures}
            selected={lensId}
            onSelect={setLensId}
            rebuilt={twin.rebuilt}
            nearGaps={twin.nearGaps}
            farGaps={twin.farGaps}
            onEnter={(d) => { if (controls && d.slug) controls.enter(d.slug); else onIsland(d); }}
          />
        )}

        {!worldExplore?.active && card && <IslandCard content={card.content} left={card.left} top={card.top} />}
      </div>

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

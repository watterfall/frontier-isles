/**
 * AtlasChartScreen — the DEFAULT L0 (atlas-world-plan.md §4 lane W1). Promotes
 * the semantic-zoom Pixi atlas (`AtlasStage`, previously only reachable behind
 * `?atlas=pixi`) to the path every visitor hits with NO query flag: a
 * continuous world→region→isle camera instead of the flat ~30-island SVG
 * scatter. Drop-in for `ChartScreen` — same `ChartScreenProps`, same chrome
 * (`ChartChrome`/`IslandCard`, both extracted so neither screen can drift from
 * the other), same `onIsland`/`onBuild`/`onCollide` wiring into `App.tsx`'s
 * existing sail→wipe→L1 flow.
 *
 * Fallback discipline (CLAUDE.md + architecture §7): the app must render with
 * no GPU present. `hasWebGL()` is a synchronous, pixi-import-free precheck —
 * when it fails (or the lazy Pixi engine throws after all), this renders the
 * ORIGINAL `ChartScreen` (SVG) untouched, byte-for-byte. PixiJS itself is
 * loaded only via `React.lazy(() => import('../../chart/AtlasChartHost'))`,
 * mirroring the L1 GeneratedIslandScreen → PixiScene lazy-load discipline
 * (commit "perf(web): lazy-load PixiScene") — the main bundle never regains it.
 *
 * TODO(W5 — wayfinding/continuity, atlas-world-plan.md §4): a tap here calls
 * the SAME `onIsland` the flat SVG chart used, so it flows into App.tsx's
 * existing ferry-sail → ScrollWipe → L1 transition unchanged — continuous in
 * the sense that the same animation plays, but the atlas camera itself does
 * NOT yet hand off into that sail (no shared camera state / cross-fade from
 * the Pixi zoom into the sail's start position). Full camera-continuity
 * (T0→T2 atlas zoom bleeding into the T2→T3 sail) is W5's scope, not W1's.
 */
import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChartScreen, type ChartScreenProps } from './ChartScreen';
import { ChartChrome } from './ChartChrome';
import { IslandCard } from './IslandCard';
import { StructureLensPanel } from './StructureLensPanel';
import { computeCardContent, cardBoxPos } from './cardContent';
import { hasWebGL } from '../../chart/webgl';
import { api, type ApiStructure, type ApiStructureGraph } from '../../api/client';
import { fallbackStructures, fallbackStructureGraph, slugOfOp } from '../../api/structureFallback';
import type { IslandDatum } from '../../api/fallback';
import type { AtlasControls, AtlasMetrics } from '../../chart/atlasControls';

const AtlasChartHost = lazy(() => import('../../chart/AtlasChartHost'));

class AtlasErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { console.error('[atlas] Pixi atlas fell back to SVG', error); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function AtlasChartScreen(props: ChartScreenProps) {
  return <AtlasErrorBoundary fallback={<ChartScreen {...props} />}><AtlasChartScreenImpl {...props} /></AtlasErrorBoundary>;
}

function AtlasChartScreenImpl(props: ChartScreenProps) {
  const { islands, harbor, filter = '全部', onFilter, hover, onHover, onIsland, onBuild, onCollide } = props;
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';

  // Sync WebGL precheck — no pixi import, so an unsupported browser never even
  // requests the atlas chunk. `onWebglError` (below) covers the rarer case
  // where WebGL reports present but Pixi still fails to boot.
  const [noGpu, setNoGpu] = useState<boolean>(() => !hasWebGL());
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [controls, setControls] = useState<AtlasControls | null>(null);
  const [metrics, setMetrics] = useState<AtlasMetrics | null>(null);
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

  // The list twin's rows, resolved from the frontier's op ids to chart islands.
  const twin = useMemo(() => {
    if (!lensId || !structureGraph) return { rebuilt: [] as IslandDatum[], gaps: [] as IslandDatum[] };
    const bySlug = new Map(islands.filter((d) => d.slug).map((d) => [d.slug!, d] as const));
    const f = structureGraph.frontier.find((x) => x.structureId === lensId);
    const resolve = (ops: string[]) => ops.map((op) => bySlug.get(slugOfOp(op))).filter((d): d is IslandDatum => !!d);
    return { rebuilt: resolve(f?.rebuilt ?? []), gaps: resolve(f?.gaps ?? []) };
  }, [lensId, structureGraph, islands]);

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

  if (noGpu) return <ChartScreen {...props} />;

  const hd = hover != null ? islands.find((d) => d.id === hover) ?? null : null;
  const card = hd && hoverPos ? { content: computeCardContent(hd, lang, t), ...cardBoxPos(hoverPos.x, hoverPos.y) } : null;

  return (
    <div data-screen-label="L0 图集海图" style={{ position: 'absolute', inset: 0, background: '#F2EAD8' }}>
      {/* Suspense fallback={null} (not <ChartScreen/>) — same convention as
          GeneratedIslandScreen's PixiScene: a brief blank paper background
          while the small atlas chunk loads, never a double chrome. */}
      <Suspense fallback={<div className="fi-atlas-loading" role="status"><i aria-hidden="true" /><span>{t('chart.tiers.loading')}</span></div>}>
        <AtlasChartHost islands={islands} harbor={harbor} lens={lens} onPick={onIsland} onHoverIsland={handleHoverIsland} onWebglError={handleWebglError} onReady={setControls} onMetrics={setMetrics} />
      </Suspense>

      <ChartChrome islands={islands} onPick={onIsland} onBuild={onBuild} onCollide={onCollide} filter={filter} onFilter={onFilter} controls={controls} metrics={metrics} onHome={harbor && harbor.islandSlugs.length > 0 ? () => controls?.home?.() : undefined} />

      <StructureLensPanel
        structures={structures}
        selected={lensId}
        onSelect={setLensId}
        rebuilt={twin.rebuilt}
        gaps={twin.gaps}
        onEnter={(d) => { if (controls && d.slug) controls.enter(d.slug); else onIsland(d); }}
      />

      {card && <IslandCard content={card.content} left={card.left} top={card.top} />}
    </div>
  );
}

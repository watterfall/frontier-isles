/**
 * AtlasChartHost — the Pixi-mounting half of the DEFAULT L0 atlas
 * (atlas-world-plan.md W1). Sibling to `scene/PixiScene.tsx`'s role for L1:
 * a controlled, embeddable engine wrapper that fills its parent
 * (`position:absolute; inset:0`) and reports picks/hovers/failures via props
 * — the parent (`AtlasChartScreen`) owns all chrome (header/card) and the
 * SVG-fallback decision.
 *
 * `main.tsx` only reaches this file through a dynamic `import()` inside
 * `AtlasChartScreen`'s `React.lazy`, so PixiJS stays out of the main bundle —
 * the L0 chart pays for it only once WebGL is already confirmed present
 * (`chart/webgl.ts`) AND this component actually mounts, mirroring the
 * GeneratedIslandScreen → PixiScene lazy-load discipline exactly.
 */
import { useEffect, useMemo, useRef } from 'react';
import { AtlasStage } from '@frontier-isles/renderer/pixi';
import { buildAtlasScene } from './atlasData';
import { buildHarborView } from './harbor';
import { toAtlasLens } from './structureLens';
import type { ApiHarbor, ApiStructureGraph } from '../api/client';
import type { IslandDatum } from '../api/fallback';
import type { AtlasControls, AtlasMetrics } from './atlasControls';

export interface AtlasChartHostProps {
  /** The app's current chart islands (fallback DATA reconciled with the live
   * API, plus any just-founded island) — same source `ChartScreen` renders. */
  islands: IslandDatum[];
  /** My Harbor (depth-plan-v1 §3(d)) — the session actor's footprint from
   * `api.harbor`. Present → the atlas opens at the harbor and far islands
   * carry fog; `null`/absent → the plain world-wide open (removal test). */
  harbor?: ApiHarbor | null;
  /** Structure lens (执行纲要 §九): the selected `struct://` id + the bipartite
   * graph (live API or `structureFallback`). `null`/absent → the plain world. */
  lens?: { structureId: string; graph: ApiStructureGraph } | null;
  /** A tap/click on an island — mirrors the SVG chart's `onClick` → sails
   * into L1 (the same `onIsland` handler `App.tsx` already wires). */
  onPick: (d: IslandDatum) => void;
  /** Pointer entered (`d`+screen position) / left (`null`,`null`) an island —
   * mirrors the SVG chart's mouseenter/mouseleave so the SAME hover
   * island-card can render over the atlas. */
  onHoverIsland: (d: IslandDatum | null, screen: { x: number; y: number } | null) => void;
  /** WebGL/Pixi failed to boot — the parent falls back to the SVG chart. */
  onWebglError: () => void;
  onReady?: (controls: AtlasControls) => void;
  onMetrics?: (metrics: AtlasMetrics) => void;
}

export default function AtlasChartHost({ islands, harbor, lens, onPick, onHoverIsland, onWebglError, onReady, onMetrics }: AtlasChartHostProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<AtlasStage | null>(null);
  // Latest callbacks in a ref so the boot effect (keyed only on `islands`,
  // which itself only changes when the reconciled list actually changes)
  // never re-runs just because a parent re-render passed new closures.
  const cbRef = useRef({ onPick, onHoverIsland, onWebglError, onReady, onMetrics });
  cbRef.current = { onPick, onHoverIsland, onWebglError, onReady, onMetrics };
  // One scene per island list — the boot effect AND the harbor effect below
  // read the same object, so fog is always computed over the world actually
  // on stage (never a re-derived twin that could drift).
  const scene = useMemo(() => buildAtlasScene(islands), [islands]);
  const harborRef = useRef(harbor ?? null);
  harborRef.current = harbor ?? null;
  const lensRef = useRef(lens ?? null);
  lensRef.current = lens ?? null;
  // Cluster provenance (xfrontier code) per stage slug — feeds the lens'
  // near/far gap gradient (same-cluster vs same-domain-only).
  const clusterBySlug = useMemo(
    () => new Map(islands.map((d) => [d.slug ?? `id-${d.id}`, d.cluster?.code])),
    [islands],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;
    const stage = new AtlasStage();
    const byKey = new Map(islands.map((d) => [d.slug ?? `id-${d.id}`, d] as const));

    stage.onPick = (slug) => {
      const d = byKey.get(slug);
      if (d) cbRef.current.onPick(d);
    };
    stage.onHover = (slug) => {
      if (slug == null) {
        cbRef.current.onHoverIsland(null, null);
        return;
      }
      const d = byKey.get(slug);
      if (!d) return;
      // Screen-space position from the CURRENT camera (`scale`/`worldRoot`
      // are both public on AtlasStage) — read at hover time, not baked at
      // mount, so it stays correct across pan/zoom.
      cbRef.current.onHoverIsland(d, stage.screenPoint(slug));
    };
    stage.onMetrics = (metrics) => cbRef.current.onMetrics?.(metrics);

    void stage
      .init(host, { width: Math.max(1, host.clientWidth), height: Math.max(1, host.clientHeight) })
      .then(() => {
        if (disposed) {
          stage.destroy();
          return;
        }
        stage.setIslands(scene.islands, scene.clusters);
        stage.setClimate(scene.continents, scene.fog, scene.flows, scene.currents);
        // My Harbor (§3(d)): fog the far ocean and open AT the harbor — the
        // gentle entry. When the footprint resolves later than the Pixi
        // chunk, the effect below applies it instead.
        const h = harborRef.current;
        const view = h ? buildHarborView(scene, h.actorId, h.islandSlugs) : null;
        if (view) {
          stage.setHarbor(view);
          stage.openAtHarbor();
        }
        // A lens selected before the Pixi chunk finished booting applies now.
        const l = lensRef.current;
        if (l) stage.setStructureLens(toAtlasLens(l.structureId, l.graph.edges, l.graph.frontier, scene.islands, clusterBySlug));
        stageRef.current = stage;
        cbRef.current.onReady?.({
          zoomIn: () => stage.zoomBy(1.24),
          zoomOut: () => stage.zoomBy(1 / 1.24),
          reset: () => stage.resetView(),
          enter: (slug) => stage.enter(slug),
          focusDomain: (domain) => stage.focusDomain(domain),
          focusAltitude: (band) => stage.focusAltitude(band),
          home: () => stage.returnToHarbor(),
        });
        resizeObserver = new ResizeObserver(([entry]) => {
          if (!entry || disposed) return;
          stage.resize(Math.round(entry.contentRect.width), Math.round(entry.contentRect.height));
        });
        resizeObserver.observe(host);
        // DEV-only handle for deterministic camera control (verification
        // screenshots) — mirrors AtlasPixiHost's identical debug hook.
        if (import.meta.env.DEV) (window as unknown as { __atlas?: AtlasStage }).__atlas = stage;
      })
      .catch(() => {
        if (!disposed) cbRef.current.onWebglError();
      });

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      stageRef.current?.destroy();
      stageRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [islands]);

  // The harbor fetch races the lazy Pixi chunk; when it loses, apply the fog
  // here — and re-anchor the opening composition only if the visitor hasn't
  // already sailed the camera somewhere themselves (`stage.touched`).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !harbor) return;
    const view = buildHarborView(scene, harbor.actorId, harbor.islandSlugs);
    if (!view) return;
    stage.setHarbor(view);
    if (!stage.touched) stage.openAtHarbor();
  }, [harbor, scene]);

  // Structure lens (§九): enter/leave the modal lens on selection change. The
  // lens is computed over the SAME scene islands the stage renders, so marks
  // land exactly on the despaced positions.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.setStructureLens(lens ? toAtlasLens(lens.structureId, lens.graph.edges, lens.graph.frontier, scene.islands, clusterBySlug) : null);
  }, [lens, scene, clusterBySlug]);

  return <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />;
}

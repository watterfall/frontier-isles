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
import {
  AtlasStage,
  type AtlasExplorerCurrent,
  type AtlasExplorerIsland,
  type AtlasExplorerPose,
  type AtlasStructureLensInput,
} from '@frontier-isles/renderer/pixi';
import { buildAtlasScene } from './atlasData';
import { buildHarborView } from './harbor';
import { toAtlasLens } from './structureLens';
import type { ConnectionMapView } from './connectionField';
import {
  createWorldMotion,
  restoredWorldEncounter,
  selectWorldCurrentEncounter,
  selectWorldEncounter,
  stepWorldMotion,
  worldCanSurvey,
  worldCanSampleCurrent,
  worldCameraIsSettled,
  worldMotionIsIdle,
  WORLD_APPROACH_DISTANCE,
  worldCourseSignalDistance,
  WORLD_CURRENT_SAMPLE_DISTANCE,
  WORLD_CURRENT_SIGNAL_DISTANCE,
  WORLD_SIGNAL_DISTANCE,
  type WorldMoveInput,
} from './worldExplore';
import type { ApiHarbor, ApiStructureGraph } from '../api/client';
import type { IslandDatum } from '../api/fallback';
import { acquirePixiLifecycle, disposePixiStage } from '../pixiLifecycle';
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
  /** Unified global/focused relation field. When present it supersedes the
   * legacy single-structure lens but uses the same on-demand stage layer. */
  connectionField?: ConnectionMapView | null;
  /** A tap/click on an island — mirrors the SVG chart's `onClick` and hands
   * the centred destination frame to App's shared-axis L1 transition. */
  onPick: (d: IslandDatum) => void;
  /** Pointer entered (`d`+screen position) / left (`null`,`null`) an island —
   * mirrors the SVG chart's mouseenter/mouseleave so the SAME hover
   * island-card can render over the atlas. */
  onHoverIsland: (d: IslandDatum | null, screen: { x: number; y: number } | null) => void;
  /** WebGL/Pixi failed to boot — the parent falls back to the SVG chart. */
  onWebglError: () => void;
  onReady?: (controls: AtlasControls) => void;
  onMetrics?: (metrics: AtlasMetrics) => void;
  /** Exploration changes this SAME stage's runtime mode; it never mounts a twin. */
  exploreActive?: boolean;
  exploreInitialPose?: AtlasExplorerPose | null;
  exploreSurveyedSlugs?: readonly string[];
  exploreSampledCurrentIds?: readonly string[];
  exploreCourseSlug?: string | null;
  exploreInspectRequest?: number;
  exploreDockRequest?: number;
  exploreSampleCurrentRequest?: number;
  exploreAltitudeRequest?: number;
  exploreAltitudeDirection?: -1 | 1;
  onExplorePose?: (pose: AtlasExplorerPose) => void;
  onExploreFlight?: (pose: AtlasExplorerPose) => void;
  onExploreNearby?: (island: AtlasExplorerIsland | null) => void;
  onExploreNeighborhood?: (islands: AtlasExplorerIsland[]) => void;
  onExploreCurrent?: (current: AtlasExplorerCurrent | null) => void;
  onExploreInspect?: (slug: string) => void;
  onExploreDock?: (slug: string, pose: AtlasExplorerPose) => void;
  onExploreSampleCurrent?: (current: AtlasExplorerCurrent) => void;
  onExploreExit?: (pose: AtlasExplorerPose) => void;
}

export default function AtlasChartHost(props: AtlasChartHostProps) {
  const { islands, harbor, lens, connectionField } = props;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<AtlasStage | null>(null);
  // Latest callbacks in a ref so the boot effect (keyed only on `islands`,
  // which itself only changes when the reconciled list actually changes)
  // never re-runs just because a parent re-render passed new closures.
  const cbRef = useRef(props);
  cbRef.current = props;
  const worldControlRef = useRef<{
    setActive: (active: boolean) => void;
    setCourse: () => void;
    inspect: () => void;
    dock: () => void;
    sampleCurrent: () => void;
    altitude: (direction: -1 | 1) => void;
  } | null>(null);
  // One scene per island list — the boot effect AND the harbor effect below
  // read the same object, so fog is always computed over the world actually
  // on stage (never a re-derived twin that could drift).
  const scene = useMemo(() => buildAtlasScene(islands), [islands]);
  const harborRef = useRef(harbor ?? null);
  harborRef.current = harbor ?? null;
  const lensRef = useRef(lens ?? null);
  lensRef.current = lens ?? null;
  const connectionFieldRef = useRef(connectionField ?? null);
  connectionFieldRef.current = connectionField ?? null;
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
    let releasePixi: (() => void) | null = null;
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

    let worldRaf = 0;
    let worldLast = 0;
    let lastFlightReport = 0;
    let worldMotion: ReturnType<typeof createWorldMotion> | null = null;
    let nearby: AtlasExplorerIsland | null = null;
    let nearbyCurrent: AtlasExplorerCurrent | null = null;
    let reportedNearby: AtlasExplorerIsland | null = null;
    let reportedCurrent: AtlasExplorerCurrent | null = null;
    let neighborhoodKey = '';
    let docking = false;
    let surveying = false;
    let sampling = false;
    const held = new Set<string>();
    let pointerId: number | null = null;
    let pointerInput: WorldMoveInput = { x: 0, y: 0, z: 0 };
    let altitudePulse: { direction: -1 | 1; until: number } | null = null;
    const movementCodes = new Set([
      'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight',
      'Space', 'ShiftLeft', 'ShiftRight', 'KeyR', 'KeyF',
    ]);

    const reducedMotion = (): boolean => {
      try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
      catch { return false; }
    };

    const reportPosition = (pose: AtlasExplorerPose): void => {
      const field = stage.nearbyExplorerIslands(pose, 256);
      const preferredSlug = cbRef.current.exploreCourseSlug ?? null;
      const preferred = preferredSlug ? field.find((candidate) => candidate.slug === preferredSlug) ?? null : null;
      // field carries unique slugs, so the only possible duplicate is the
      // prepended course island — one identity check per candidate replaces an
      // O(k²) findIndex dedup on this per-frame path.
      const neighborhood: AtlasExplorerIsland[] = preferred ? [preferred] : [];
      for (const candidate of field) {
        if (neighborhood.length >= 4) break;
        if (candidate !== preferred) neighborhood.push(candidate);
      }
      // Once acquired, a signal stays locked until the craft clearly leaves its
      // field. Crossing a dense cluster must not silently switch the user's
      // investigation to whichever island became one pixel nearer.
      const nextNearby = selectWorldEncounter(field, nearby?.slug ?? null, WORLD_SIGNAL_DISTANCE, 52, preferredSlug);
      const surveyed = !!nextNearby && (cbRef.current.exploreSurveyedSlugs?.includes(nextNearby.slug) ?? false);
      const signalDistance = nextNearby?.slug === preferredSlug
        ? worldCourseSignalDistance(nextNearby.distance)
        : WORLD_SIGNAL_DISTANCE;
      stage.setExplorerEncounter(nextNearby, surveyed, signalDistance, WORLD_APPROACH_DISTANCE);
      nearby = nextNearby;
      const crossedSurveyRange = !!reportedNearby && !!nextNearby
        && worldCanSurvey(reportedNearby) !== worldCanSurvey(nextNearby);
      if (
        nextNearby?.slug !== reportedNearby?.slug
        || crossedSurveyRange
        || (!!nextNearby && !!reportedNearby && Math.abs(nextNearby.distance - reportedNearby.distance) >= 12)
      ) {
        reportedNearby = nextNearby;
        cbRef.current.onExploreNearby?.(nextNearby);
      }
      const key = neighborhood.map((island) => `${island.slug}:${Math.round(island.distance / 24)}`).join('|');
      if (key !== neighborhoodKey) {
        neighborhoodKey = key;
        cbRef.current.onExploreNeighborhood?.(neighborhood);
      }

      const currentField = stage.nearbyExplorerCurrents(pose, 4);
      const nextCurrent = selectWorldCurrentEncounter(currentField, nearbyCurrent?.id ?? null);
      const currentSampled = !!nextCurrent
        && (cbRef.current.exploreSampledCurrentIds?.includes(nextCurrent.id) ?? false);
      stage.setExplorerCurrentEncounter(
        nextCurrent,
        currentSampled,
        WORLD_CURRENT_SIGNAL_DISTANCE,
        WORLD_CURRENT_SAMPLE_DISTANCE,
      );
      nearbyCurrent = nextCurrent;
      const crossedSampleRange = !!reportedCurrent && !!nextCurrent
        && worldCanSampleCurrent(reportedCurrent) !== worldCanSampleCurrent(nextCurrent);
      if (
        nextCurrent?.id !== reportedCurrent?.id
        || crossedSampleRange
        || (!!nextCurrent && !!reportedCurrent && Math.abs(nextCurrent.distance - reportedCurrent.distance) >= 8)
      ) {
        reportedCurrent = nextCurrent;
        cbRef.current.onExploreCurrent?.(nextCurrent);
      }
    };

    const inputIntent = (): WorldMoveInput => {
      const keyboardX = Number(held.has('KeyD') || held.has('ArrowRight')) - Number(held.has('KeyA') || held.has('ArrowLeft'));
      const keyboardY = Number(held.has('KeyS') || held.has('ArrowDown')) - Number(held.has('KeyW') || held.has('ArrowUp'));
      const keyAltitude = Number(held.has('Space') || held.has('KeyR')) - Number(held.has('ShiftLeft') || held.has('ShiftRight') || held.has('KeyF'));
      const pulseAltitude = altitudePulse && performance.now() < altitudePulse.until ? altitudePulse.direction : 0;
      if (altitudePulse && pulseAltitude === 0) altitudePulse = null;
      const planar = pointerId == null ? { x: keyboardX, y: keyboardY } : pointerInput;
      return { ...planar, z: keyAltitude || pulseAltitude };
    };

    const tickWorld = (now: number): void => {
      worldRaf = 0;
      if (!cbRef.current.exploreActive || docking || surveying || sampling || !worldMotion) return;
      const bounds = stage.explorerBounds();
      if (!bounds) return;
      const dt = Math.min(0.05, Math.max(0, (now - (worldLast || now)) / 1000));
      worldLast = now;
      const intent = inputIntent();
      const focus = nearby ? {
        ...nearby,
        signalDistance: nearby.slug === (cbRef.current.exploreCourseSlug ?? null)
          ? worldCourseSignalDistance(nearby.distance)
          : WORLD_SIGNAL_DISTANCE,
      } : null;
      worldMotion = stepWorldMotion(worldMotion, intent, dt, bounds, focus);
      stage.setExplorerMotion(worldMotion.pose, worldMotion.camera);
      reportPosition(worldMotion.pose);
      if (now - lastFlightReport >= 96) {
        lastFlightReport = now;
        cbRef.current.onExploreFlight?.(worldMotion.pose);
      }
      const hasIntent = Math.hypot(intent.x, intent.y, intent.z ?? 0) > 0;
      if (hasIntent || !worldMotionIsIdle(worldMotion) || !worldCameraIsSettled(worldMotion, focus)) worldRaf = requestAnimationFrame(tickWorld);
      else cbRef.current.onExplorePose?.(worldMotion.pose);
    };

    const ensureWorldTick = (): void => {
      if (worldRaf || docking || surveying || sampling || !cbRef.current.exploreActive) return;
      worldLast = performance.now();
      worldRaf = requestAnimationFrame(tickWorld);
    };

    const dock = (): void => {
      if (
        docking
        || surveying
        || sampling
        || !nearby
        || !worldCanSurvey(nearby)
        || !worldMotion
        || !(cbRef.current.exploreSurveyedSlugs?.includes(nearby.slug) ?? false)
      ) return;
      docking = true;
      held.clear();
      pointerInput = { x: 0, y: 0, z: 0 };
      if (worldRaf) cancelAnimationFrame(worldRaf);
      worldRaf = 0;
      const slug = nearby.slug;
      void stage.dockExplorer(slug, worldMotion.pose, reducedMotion()).then((pose) => {
        if (disposed) return;
        worldMotion = createWorldMotion(pose);
        cbRef.current.onExplorePose?.(pose);
        cbRef.current.onExploreDock?.(slug, pose);
        docking = false;
      });
    };

    const inspect = (): void => {
      if (
        surveying
        || docking
        || sampling
        || !nearby
        || !worldCanSurvey(nearby)
        || !worldMotion
      ) return;
      if (cbRef.current.exploreSurveyedSlugs?.includes(nearby.slug)) return;
      surveying = true;
      held.clear();
      pointerInput = { x: 0, y: 0, z: 0 };
      if (worldRaf) cancelAnimationFrame(worldRaf);
      worldRaf = 0;
      const slug = nearby.slug;
      void stage.surveyExplorer(slug, reducedMotion()).then(() => {
        if (disposed || !cbRef.current.exploreActive || !worldMotion) {
          surveying = false;
          return;
        }
        // Surveying is a deliberate stop at the field site. Do not resume the
        // pre-survey velocity after the marker animation: that can drift the
        // craft out of range while the field note still offers a dock action.
        worldMotion = createWorldMotion(worldMotion.pose);
        cbRef.current.onExploreInspect?.(slug);
        surveying = false;
        reportPosition(worldMotion.pose);
        ensureWorldTick();
      });
    };

    const sampleCurrent = (): void => {
      if (
        sampling
        || surveying
        || docking
        || !nearbyCurrent
        || !worldCanSampleCurrent(nearbyCurrent)
        || (cbRef.current.exploreSampledCurrentIds?.includes(nearbyCurrent.id) ?? false)
      ) return;
      sampling = true;
      held.clear();
      pointerInput = { x: 0, y: 0, z: 0 };
      if (worldRaf) cancelAnimationFrame(worldRaf);
      worldRaf = 0;
      const current = nearbyCurrent;
      void stage.sampleExplorerCurrent(current.id, reducedMotion()).then(() => {
        if (disposed || !cbRef.current.exploreActive) {
          sampling = false;
          return;
        }
        const sampled = [...new Set([...(cbRef.current.exploreSampledCurrentIds ?? []), current.id])];
        stage.setExplorerSampledCurrentIds(sampled);
        stage.setExplorerCurrentEncounter(current, true, WORLD_CURRENT_SIGNAL_DISTANCE, WORLD_CURRENT_SAMPLE_DISTANCE);
        cbRef.current.onExploreSampleCurrent?.(current);
        sampling = false;
        if (worldMotion) reportPosition(worldMotion.pose);
        ensureWorldTick();
      });
    };

    const setCourse = (): void => {
      if (!cbRef.current.exploreActive || !worldMotion) return;
      reportPosition(worldMotion.pose);
      ensureWorldTick();
    };

    const changeAltitude = (direction: -1 | 1): void => {
      if (!cbRef.current.exploreActive || !worldMotion || docking || surveying || sampling) return;
      altitudePulse = { direction, until: performance.now() + 620 };
      ensureWorldTick();
    };

    const setWorldActive = (active: boolean): void => {
      held.clear();
      pointerId = null;
      pointerInput = { x: 0, y: 0, z: 0 };
      altitudePulse = null;
      if (worldRaf) cancelAnimationFrame(worldRaf);
      worldRaf = 0;
      docking = false;
      surveying = false;
      sampling = false;
      if (!active) {
        nearby = null;
        nearbyCurrent = null;
        reportedNearby = null;
        reportedCurrent = null;
        neighborhoodKey = '';
        cbRef.current.onExploreNearby?.(null);
        cbRef.current.onExploreCurrent?.(null);
        cbRef.current.onExploreNeighborhood?.([]);
        stage.setExploreMode(false, null, reducedMotion());
        return;
      }
      const spawn = stage.setExploreMode(
        true,
        // Global exploration departs from an open field pocket, not from a
        // harbor-specific cluster that may already be crowded at corpus scale.
        cbRef.current.exploreInitialPose ?? stage.explorerSpawn(),
        reducedMotion(),
      );
      if (!spawn) return;
      worldMotion = createWorldMotion(spawn);
      cbRef.current.onExplorePose?.(spawn);
      cbRef.current.onExploreFlight?.(spawn);
      if (cbRef.current.exploreInitialPose) {
        nearby = restoredWorldEncounter(stage.nearbyExplorerIslands(spawn, 256));
      }
      reportPosition(spawn);
      ensureWorldTick();
    };

    const editable = (target: EventTarget | null): boolean =>
      target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement
      || (target instanceof HTMLElement && target.isContentEditable);
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!cbRef.current.exploreActive || editable(event.target)) return;
      if (event.code === 'Escape' && worldMotion) {
        event.preventDefault();
        cbRef.current.onExploreExit?.(worldMotion.pose);
        return;
      }
      // A focused overlay control owns its activation keys: preventDefault
      // below would steal the Space/Enter click from keyboard users. `summary`
      // is included explicitly because it is natively interactive but is not a
      // button/link/input instance.
      if (
        event.target instanceof HTMLButtonElement
        || event.target instanceof HTMLAnchorElement
        || (event.target instanceof HTMLElement && event.target.tagName === 'SUMMARY')
      ) return;
      if (event.code === 'KeyC' && !event.repeat) {
        if (!nearbyCurrent) return;
        event.preventDefault();
        sampleCurrent();
        return;
      }
      if ((event.code === 'KeyE' || event.code === 'Enter') && !event.repeat) {
        if (!nearby || !worldMotion) return;
        event.preventDefault();
        if (event.code === 'KeyE') inspect();
        else dock();
        return;
      }
      if (!movementCodes.has(event.code)) return;
      event.preventDefault();
      held.add(event.code);
      ensureWorldTick();
    };
    const onKeyUp = (event: KeyboardEvent): void => {
      if (!movementCodes.has(event.code)) return;
      held.delete(event.code);
      ensureWorldTick();
    };
    let hostRect: DOMRect | null = null;
    const updatePointerIntent = (event: PointerEvent): void => {
      // Rect cached per gesture (refreshed on pointerdown and resize): reading
      // getBoundingClientRect on every pointermove forces a synchronous reflow
      // on this per-frame steering path.
      const rect = hostRect ?? (hostRect = host.getBoundingClientRect());
      const dx = event.clientX - rect.left - rect.width * 0.47;
      const dy = event.clientY - rect.top - rect.height * 0.61;
      const magnitude = Math.hypot(dx, dy);
      pointerInput = magnitude < 24 ? { x: 0, y: 0, z: 0 } : { x: dx / magnitude, y: dy / magnitude, z: 0 };
    };
    const onPointerDown = (event: PointerEvent): void => {
      if (!cbRef.current.exploreActive || docking || surveying || sampling || event.button !== 0) return;
      pointerId = event.pointerId;
      host.setPointerCapture?.(event.pointerId);
      hostRect = host.getBoundingClientRect();
      updatePointerIntent(event);
      ensureWorldTick();
    };
    const onPointerMove = (event: PointerEvent): void => {
      if (pointerId !== event.pointerId) return;
      updatePointerIntent(event);
    };
    const onPointerUp = (event: PointerEvent): void => {
      if (pointerId !== event.pointerId) return;
      pointerId = null;
      pointerInput = { x: 0, y: 0, z: 0 };
      ensureWorldTick();
    };

    void acquirePixiLifecycle()
      .then((release) => {
        if (disposed) {
          release();
          return false;
        }
        releasePixi = release;
        return stage
          .init(host, { width: Math.max(1, host.clientWidth), height: Math.max(1, host.clientHeight) })
          .then(() => true);
      })
      .then((initialized) => {
        if (!initialized) return;
        if (disposed) {
          releasePixi = disposePixiStage(stage, releasePixi);
          return;
        }
        stage.setIslands(scene.islands, scene.clusters);
        stage.setClimate(scene.continents, scene.fog, scene.flows, scene.currents);
        stage.setExplorerSurveyedSlugs(cbRef.current.exploreSurveyedSlugs ?? []);
        stage.setExplorerSampledCurrentIds(cbRef.current.exploreSampledCurrentIds ?? []);
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
        const field = connectionFieldRef.current;
        const l = lensRef.current;
        if (field) stage.setStructureLens(toStageConnectionField(field));
        else if (l) stage.setStructureLens(toAtlasLens(l.structureId, l.graph.edges, l.graph.frontier, scene.islands, clusterBySlug));
        stageRef.current = stage;
        worldControlRef.current = { setActive: setWorldActive, setCourse, inspect, dock, sampleCurrent, altitude: changeAltitude };
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
          hostRect = null;
          stage.resize(Math.round(entry.contentRect.width), Math.round(entry.contentRect.height));
        });
        resizeObserver.observe(host);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        host.addEventListener('pointerdown', onPointerDown);
        host.addEventListener('pointermove', onPointerMove);
        host.addEventListener('pointerup', onPointerUp);
        host.addEventListener('pointercancel', onPointerUp);
        if (cbRef.current.exploreActive) setWorldActive(true);
        // DEV-only handle for deterministic camera control (verification
        // screenshots) — mirrors AtlasPixiHost's identical debug hook.
        if (import.meta.env.DEV) (window as unknown as { __atlas?: AtlasStage }).__atlas = stage;
      })
      .catch(() => {
        releasePixi = disposePixiStage(stage, releasePixi);
        if (!disposed) cbRef.current.onWebglError();
      });

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      if (worldRaf) cancelAnimationFrame(worldRaf);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      host.removeEventListener('pointerdown', onPointerDown);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerup', onPointerUp);
      host.removeEventListener('pointercancel', onPointerUp);
      if (worldMotion) cbRef.current.onExplorePose?.(worldMotion.pose);
      worldControlRef.current = null;
      // No activeStage means init never completed — its chain's disposed
      // branch owns the release; disposing here would double-release.
      const activeStage = stageRef.current;
      if (activeStage) releasePixi = disposePixiStage(activeStage, releasePixi);
      stageRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [islands]);

  useEffect(() => {
    worldControlRef.current?.setActive(!!props.exploreActive);
  }, [props.exploreActive]);

  useEffect(() => {
    worldControlRef.current?.setCourse();
  }, [props.exploreCourseSlug]);

  useEffect(() => {
    if (props.exploreInspectRequest) worldControlRef.current?.inspect();
  }, [props.exploreInspectRequest]);

  useEffect(() => {
    if (props.exploreDockRequest) worldControlRef.current?.dock();
  }, [props.exploreDockRequest]);

  useEffect(() => {
    if (props.exploreSampleCurrentRequest) worldControlRef.current?.sampleCurrent();
  }, [props.exploreSampleCurrentRequest]);

  useEffect(() => {
    if (props.exploreAltitudeRequest) worldControlRef.current?.altitude(props.exploreAltitudeDirection ?? 1);
  }, [props.exploreAltitudeDirection, props.exploreAltitudeRequest]);

  useEffect(() => {
    stageRef.current?.setExplorerSurveyedSlugs(props.exploreSurveyedSlugs ?? []);
  }, [props.exploreSurveyedSlugs]);

  useEffect(() => {
    stageRef.current?.setExplorerSampledCurrentIds(props.exploreSampledCurrentIds ?? []);
  }, [props.exploreSampledCurrentIds]);

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

  // Unified connection field supersedes the legacy one-structure lens. Both
  // use the SAME scene islands the stage renders, so every mark lands on the
  // despaced authored world rather than a second graph layout.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.setStructureLens(
      connectionField
        ? toStageConnectionField(connectionField)
        : lens
          ? toAtlasLens(lens.structureId, lens.graph.edges, lens.graph.frontier, scene.islands, clusterBySlug)
          : null,
    );
  }, [connectionField, lens, scene, clusterBySlug]);

  return <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />;
}

function toStageConnectionField(view: ConnectionMapView): AtlasStructureLensInput {
  return {
    structureId: 'connection-field',
    mode: view.mode,
    rebuiltSlugs: view.memberSlugs,
    gapSlugs: [],
    farGapSlugs: [],
    convergences: view.convergences,
    arcs: view.paths,
  };
}

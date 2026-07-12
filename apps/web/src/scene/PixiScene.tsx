/**
 * PixiScene — the controlled, embeddable Pixi L1 renderer (M4「接线上」).
 *
 * Extracted from PixiSceneHost so the SAME layered Pixi scene can be the live L1
 * (fed a real island's ledger-driven {@link ClaimState}s) AND the `?scene=pixi`
 * demo. Fully controlled: day↔night `t`, `claims`, and `undertow` are props; the
 * component owns only the GPU boot, camera pan/zoom, station texture bake, and
 * hit-testing → `onStation`. It fills its parent (`position:absolute; inset:0`),
 * so it lives INSIDE the app's `.fi-stage` frame under overlays — never a
 * full-window `fixed` surface.
 *
 * Fallback discipline (CLAUDE.md): on WebGL failure it calls `onWebglError` so the
 * parent can render the SVG scene instead — the app must render without the GPU.
 */
import { useEffect, useRef, cloneElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SceneStage, RitualLayer, type TextureResolver, type ResolvedTexture, type RitualPoint } from '@frontier-isles/renderer/pixi';
import { worldToScreen, worldToScreenElevated, seaDepthAt } from '@frontier-isles/renderer';
import { STATION_META, type ClaimState, type StationKind } from '@frontier-isles/core';
import { localizeStation, type Lang } from '../i18n/stations';
import type { RitualEvent } from './rituals';
import {
  StationWorkshop,
  StationLibrary,
  StationWhiteboardHall,
  StationQuestionWall,
  StationDataBench,
  StationGallery,
  StationTearoom,
  DriftwoodGarden,
  FerryDock,
} from '@frontier-isles/assets';
import { buildSceneGraph, claimIndexFromId, type LayoutInput } from './layout';
import { bakeSvg } from './bakeTexture';
import { STATION_TEX_SIZE, STATION_TEX_SCALE, stationBakeOrigin, stationLabelHeight } from './stationAnchors';

// The 9 L1 stations as their real SVG assets, baked WITHOUT their namecards
// (showLabel={false}) — crisp LOD-tiered labels are drawn in the screen-space
// label layer instead, so text stays sharp + legible at any zoom. `x`/`y` here
// are placeholders `cloneElement`d to each station's own ground offset (P1
// per-station vertical registration, see `./stationAnchors`) before baking.
const STATION_ELS: Record<string, ReactElement<{ x?: number; y?: number; showSmoke?: boolean; showFlag?: boolean }>> = {
  'station:workshop': <StationWorkshop showLabel={false} />,
  'station:library': <StationLibrary showLabel={false} />,
  'station:canvas': <StationWhiteboardHall showLabel={false} />,
  'station:questions': <StationQuestionWall showLabel={false} />,
  'station:data': <StationDataBench showLabel={false} />,
  'station:gallery': <StationGallery showLabel={false} />,
  'station:tearoom': <StationTearoom showLabel={false} />,
  'station:driftwood': <DriftwoodGarden showTransplantTag={false} showLabel={false} />,
  'station:dock': <FerryDock showLabel={false} />,
};

/** Per-domain water colours (0..1 rgb): shallow / deep / foam. */
// Pale domain water, VERBATIM the design-system `--water` day values
// (DOMAIN_SCENE_VARS): a warm-paper data field, NOT photographic deep teal.
export const SEA_COLORS: Record<string, { seaColor: [number, number, number]; deepColor: [number, number, number]; foamColor: [number, number, number] }> = {
  数理: { seaColor: [0.737, 0.808, 0.863], deepColor: [0.651, 0.745, 0.816], foamColor: [0.941, 0.918, 0.847] },
  物质: { seaColor: [0.784, 0.847, 0.8], deepColor: [0.698, 0.776, 0.722], foamColor: [0.941, 0.918, 0.847] },
  生命: { seaColor: [0.722, 0.831, 0.769], deepColor: [0.627, 0.761, 0.69], foamColor: [0.933, 0.941, 0.863] },
  交叉: { seaColor: [0.8, 0.784, 0.847], deepColor: [0.714, 0.698, 0.8], foamColor: [0.941, 0.918, 0.847] },
};

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));

export interface PixiSceneMetrics {
  renderMs: number;
  sorted: number;
  objects: number;
}

export interface PixiSceneProps {
  /** The island's layout input (slug/domain/stage/…). Re-mounts the scene on change. */
  input: LayoutInput;
  /** Ledger-projected claim states (M4.3). Omitted/empty → buildSceneGraph synths from eventCount. */
  claims?: ClaimState[];
  /** Day↔night ∈ [0,1], controlled by the parent (App's lever). Applied without re-mount. */
  t: number;
  /**
   * UI language for the screen-space station labels (architecture.md §9: station
   * names are load-bearing glossary terms, not untranslated editorial content —
   * unlike island names/questions/resident names). Defaults 'zh'; a change
   * re-boots the scene (labels are baked into {@link setStationLabels} at boot).
   */
  lang?: Lang;
  /**
   * Stations with recent ledger activity (`core.projectActiveStations`, M8
   * micro-dynamics second batch). Drives chimney smoke / flag wave — omitted
   * → no station animates (never a decorative default).
   */
  activeStations?: ReadonlySet<StationKind>;
  /** Domain abstractness (frontier.substrate, 0..1) → sea darkness (海即数据, depth-plan-v2 §4). */
  substrate?: number;
  /** Disputed-sea agitation (R7 Dim 2): a boolean (demo toggle) or 0..1 contention
   *  magnitude (海即数据). Data = contention; agitation is its surface-chop visual. */
  agitation?: boolean | number;
  /** Tapping a station calls back with its kind so the parent opens that station. */
  onStation?: (kind: StationKind) => void;
  /** Tapping a claim tower calls back with its ledger-projected {@link ClaimState}
   * so the parent can open the claim detail panel (no new data — the same object
   * `projectClaimState` already produced). */
  onClaim?: (claim: ClaimState) => void;
  /**
   * Ritual triggers due to fire NOW (depth-plan-v1 §6/§9 Batch 1 — 河灯 on
   * `publish`, ~8s 移栽之路 on `transplant`). The host computes which ledger
   * events are due (see `scene/rituals.ts`'s `dueRituals` + a localStorage
   * watermark) and passes them here; this component only guards against
   * re-firing the SAME event id twice within one mounted scene (defence in
   * depth — the host already dedupes via the watermark) and never keeps a
   * counter of its own (invariant 17: event-triggered, never scored).
   */
  rituals?: RitualEvent[];
  /** Tapping a fired ritual node (lantern/carrier) → its underlying ledger
   * event, so the host can open the event-ref + artifact panel. */
  onRitualTap?: (evt: RitualEvent) => void;
  /** `prefers-reduced-motion` (host reads matchMedia) — degrades the ritual's
   * multi-second travel to a quiet in-place fade (still visible, still tappable). */
  reducedMotion?: boolean;
  /** GPU absent → parent renders the SVG fallback scene instead. */
  onWebglError?: (msg: string) => void;
  /** Live render metrics for a dev HUD (the demo shows them; live L1 omits). */
  onMetrics?: (m: PixiSceneMetrics) => void;
}

/**
 * The embeddable Pixi scene. Re-boots on `input`/`claims` change (once per island
 * open); `t`/`agitation` apply live without a re-boot.
 */
export default function PixiScene({ input, claims, t, lang = 'zh', activeStations, substrate, agitation = false, onStation, onClaim, rituals, onRitualTap, reducedMotion = false, onWebglError, onMetrics }: PixiSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<SceneStage | null>(null);
  const cam = useRef({ ...worldToScreen(8, 8), zoom: 0.75 }); // island centre (tile 8,8)
  const drag = useRef<{ x: number; y: number } | null>(null);
  // Read live inside the boot closure so late day/night without re-boot is correct,
  // and callbacks don't re-boot the scene when their identity changes each render.
  const tRef = useRef(t);
  tRef.current = t;
  const substrateRef = useRef(substrate);
  substrateRef.current = substrate;
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;
  const ritualsPropRef = useRef(rituals);
  ritualsPropRef.current = rituals;
  const cbRef = useRef({ onStation, onClaim, onWebglError, onMetrics, onRitualTap });
  cbRef.current = { onStation, onClaim, onWebglError, onMetrics, onRitualTap };
  const objCountRef = useRef(0); // last object count, for the dev-HUD sampler
  // Ritual moments (Batch 1): the layer + the shore/渡口 anchor it fires from,
  // set once at boot (see the main effect); `firedRitualIdsRef` is this
  // mounted scene's own once-per-event guard (defence in depth alongside the
  // host's watermark — reset whenever the scene re-boots for a new island).
  const ritualLayerRef = useRef<RitualLayer | null>(null);
  const ritualAnchorRef = useRef<{ at: RitualPoint; direction: RitualPoint } | null>(null);
  const firedRitualIdsRef = useRef<Set<string>>(new Set());

  /** Fire every not-yet-fired ritual in `list` now (no-op before boot completes
   * or with nothing due — safe to call from both the boot effect, so an
   * initial catch-up batch isn't dropped by the async GPU boot race, and the
   * `rituals`-prop-changed effect below, for live new arrivals). */
  const fireDue = (list?: RitualEvent[]): void => {
    const layer = ritualLayerRef.current;
    const anchor = ritualAnchorRef.current;
    if (!layer || !anchor || !list || list.length === 0) return;
    const night = tRef.current >= 0.5; // palette-only glow brightening, never a shape change
    for (const evt of list) {
      if (firedRitualIdsRef.current.has(evt.id)) continue;
      firedRitualIdsRef.current.add(evt.id);
      const opts = {
        id: evt.id,
        at: anchor.at,
        direction: anchor.direction,
        reducedMotion: reducedMotionRef.current,
        onTap: () => cbRef.current.onRitualTap?.(evt),
      };
      if (evt.kind === 'lantern') layer.fireLantern(opts, night);
      else layer.fireTransplant(opts);
    }
  };

  const applyCam = (): void => {
    const s = stageRef.current;
    if (!s) return;
    s.zoomTo(cam.current.zoom);
    s.panTo(cam.current.x, cam.current.y);
  };

  // Boot / re-boot when the island's data changes. StrictMode double-invokes
  // effects, so guard init/destroy with `disposed`.
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    let disposed = false;
    let stage: SceneStage | null = null;
    let resizeObserver: ResizeObserver | null = null;
    void (async () => {
      const s = new SceneStage();
      try {
        // Pass the host DIV (not a shared canvas): Pixi creates its own canvas so
        // StrictMode's double-mount can't tear one canvas out from under the other.
        await s.init(el, { width: Math.max(1, el.clientWidth), height: Math.max(1, el.clientHeight), background: 0xf2ecd9, backgroundAlpha: 1 }); // warm paper (design base)
        // a11y (R7 ride-along C): set BEFORE render()/buildSea so the sea + micro-
        // dynamics tickers are gated from the first frame, not just via CSS.
        s.setReducedMotion(reducedMotionRef.current);
      } catch (e) {
        if (!disposed) cbRef.current.onWebglError?.(String(e));
        return;
      }
      if (disposed) {
        s.destroy();
        return;
      }
      stage = s;
      stageRef.current = s;
      resizeObserver = new ResizeObserver(([entry]) => {
        if (!entry || disposed) return;
        s.resize(Math.round(entry.contentRect.width), Math.round(entry.contentRect.height));
      });
      resizeObserver.observe(el);
      // Hit-testing → open the tapped station, or the tapped claim tower's detail
      // panel (scene-upgrade OUTSTANDING P1). The claim id encodes its index into
      // `claims` (see layout.ts push order); look the ClaimState back up rather
      // than inventing any new data.
      s.onPick = (id) => {
        if (id.startsWith('station:')) {
          cbRef.current.onStation?.(id.slice('station:'.length) as StationKind);
          return;
        }
        const ci = claimIndexFromId(id);
        if (ci !== null) {
          const c = claims?.[ci];
          if (c) cbRef.current.onClaim?.(c);
        }
      };
      const graph = buildSceneGraph(input, tRef.current, claims, activeStations);
      // Ritual moments (depth-plan-v1 §6/§9 Batch 1): mount a thin, camera-space
      // layer ON TOP of the tone overlay + lightsLayer (so a daytime `publish`
      // still shows its lantern — unlike lightsLayer, which collapses to alpha
      // 0 in daylight, M3). Zero scene-stage.ts changes needed: `cameraRoot`
      // and `app` are already public. The dock tile (visible at every growth
      // stage, generator.ts's `stationsForStage`) IS the shore/渡口 both
      // rituals depart from; direction is straight out from the island centre.
      firedRitualIdsRef.current = new Set();
      ritualLayerRef.current?.destroy();
      ritualLayerRef.current = new RitualLayer(s.app!, s.cameraRoot);
      const dockObj = graph.objects.find((o) => o.kind === 'station:dock');
      const centre = worldToScreenElevated(8, 8, 0);
      const shoreTile = dockObj ?? { gx: 8, gy: 15, elevation: 0 };
      const shore = worldToScreenElevated(shoreTile.gx + 0.5, shoreTile.gy + 0.5, shoreTile.elevation);
      const dx = shore.x - centre.x;
      const dy = shore.y - centre.y;
      const mag = Math.hypot(dx, dy) || 1;
      ritualAnchorRef.current = { at: shore, direction: { x: dx / mag, y: dy / mag } };
      fireDue(ritualsPropRef.current); // don't drop an initial catch-up batch to the async GPU-boot race
      // Texture-lift (design-system alignment): rasterise the 9 real station SVG
      // assets → Pixi textures via the resolver, so the island renders in the
      // hand-drawn design vocabulary instead of placeholder boxes.
      let resolve: TextureResolver | undefined;
      try {
        const C = STATION_TEX_SIZE;
        const texMap: Record<string, ResolvedTexture> = {};
        for (const [kind, elx] of Object.entries(STATION_ELS)) {
          const stationKind = kind.slice('station:'.length) as StationKind;
          const origin = stationBakeOrigin(stationKind);
          // M8 micro-dynamics: an active Workshop/Data Bench bakes WITHOUT its
          // static smoke wisp / pennant fabric — SceneStage.render draws its
          // own animated one instead (attachSmoke/attachFlag) so exactly one
          // is ever visible, never both. A dormant station keeps the static
          // art (its resting look), matching each component's own default.
          const active = graph.objects.find((o) => o.id === kind)?.active ?? false;
          const dynamicProps =
            kind === 'station:workshop' ? { showSmoke: !active } : kind === 'station:data' ? { showFlag: !active } : {};
          const placed = cloneElement(elx, { ...origin, ...dynamicProps });
          const svg = renderToStaticMarkup(
            <svg xmlns="http://www.w3.org/2000/svg" width={C} height={C} viewBox={`0 0 ${C} ${C}`}>
              {placed}
            </svg>,
          );
          const tex = await bakeSvg(svg, { width: C, height: C, scale: 3 });
          // A shared (0.5,0.5) anchor now works for every station because the
          // ground offset above already re-centred each one's own ground point
          // on the texture — no per-station anchor variance needed.
          texMap[kind] = { texture: tex, anchor: { x: 0.5, y: 0.5 }, scale: STATION_TEX_SCALE };
        }
        if (disposed) return;
        resolve = (o) => texMap[o.kind];
      } catch (e) {
        console.warn('[pixi-scene] station bake failed', e);
      }
      s.render(graph, resolve);
      s.setDayNight(tRef.current);
      applyCam();
      // Crisp, LOD-tiered station labels (screen-space billboards) — sharp at any
      // zoom, unlike the baked namecards (now suppressed via showLabel={false}).
      // far zoom → the single-glyph seal (language-neutral); near → the full name,
      // localized from STATION_META (architecture §9 glossary — station names ARE
      // UI-translatable, unlike untranslated editorial content).
      s.setStationLabels(
        graph.objects
          .filter((o) => o.layer === 'world' && o.kind.startsWith('station:'))
          .map((o) => {
            const kind = o.kind.slice('station:'.length) as StationKind;
            const meta = STATION_META[kind];
            // Per-station label clearance (part of the same P1 vertical-registration
            // fix): each station's own roof height above ITS ground marker, instead
            // of the generic `o.height ?? 30` that otherwise pokes a tall roof (e.g.
            // Question Wall) out above a label sized for a shorter one, or floats a
            // short station's label too high.
            return {
              gx: o.gx,
              gy: o.gy,
              elevation: o.elevation,
              height: stationLabelHeight(kind),
              short: meta?.seal ?? '?',
              full: meta ? localizeStation(kind, lang) : o.kind,
            };
          }),
      );
      // Sea = data (海即数据): domain hue (climate) + darkness = abstractness (depth)
      // + shore-ripple = tide N (A − D). Tide is normalised to 0..1 here (a flood
      // tide runs a livelier coast; an ebb/negative tide barely ripples).
      s.buildSea(SEA_COLORS[input.domain] ?? SEA_COLORS['数理']!, {
        depthAlpha: seaDepthAt(substrateRef.current).overlayAlpha,
        tide: clamp((input.tide ?? 0) / 8, 0, 1),
      });
      objCountRef.current = graph.objects.length;
      cbRef.current.onMetrics?.({ objects: graph.objects.length, sorted: s.sortedNodeCount(), renderMs: s.lastRenderMs });
    })();
    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      ritualLayerRef.current?.destroy();
      ritualLayerRef.current = null;
      if (stage) stage.destroy();
      stageRef.current = null;
    };
    // lang/activeStations aren't read via a ref (unlike t/onStation/onMetrics)
    // because label text and the smoke/flag bake decision both happen once at
    // boot — a language switch or a station's activity flipping re-boots the
    // scene, which is rare and acceptably cheap (same cost as an island change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, claims, lang, activeStations]);

  // Ritual moments: fire newly-due events as the host discovers them (initial
  // catch-up + each live ledger poll — see GeneratedIslandScreen). A no-op
  // before boot completes or once every id in `rituals` has already fired.
  useEffect(() => {
    fireDue(rituals);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rituals]);

  // Day↔night → per-object alpha + tone veil (P4). No re-boot. tweenDayNight (M5)
  // sweeps smoothly instead of snapping; the boot did an instant setDayNight so
  // the first paint is correct, and this only animates subsequent lever pulls.
  useEffect(() => {
    stageRef.current?.tweenDayNight(t);
  }, [t]);

  // Disputed-sea agitation (R7 Dim 2 — contention as surface chop).
  useEffect(() => {
    stageRef.current?.setAgitation(agitation);
  }, [agitation]);

  // prefers-reduced-motion → freeze/thaw the WebGL sea + micro-dynamics (a11y, R7
  // ride-along C). CSS's reduced-motion kill switch never reaches the Pixi ticker.
  useEffect(() => {
    stageRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  // Render-cost sampler for the dev HUD (no-op if the parent passed no onMetrics).
  useEffect(() => {
    if (!onMetrics) return;
    const id = setInterval(() => {
      const s = stageRef.current;
      if (s?.app) onMetrics({ renderMs: s.lastRenderMs, sorted: s.sortedNodeCount(), objects: objCountRef.current });
    }, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onWheel = (e: React.WheelEvent): void => {
    cam.current.zoom = clamp(cam.current.zoom * (e.deltaY < 0 ? 1.1 : 0.9), 0.2, 3);
    applyCam();
  };
  const onPointerDown = (e: React.PointerEvent): void => {
    drag.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent): void => {
    if (!drag.current) return;
    cam.current.x -= (e.clientX - drag.current.x) / cam.current.zoom;
    cam.current.y -= (e.clientY - drag.current.y) / cam.current.zoom;
    drag.current = { x: e.clientX, y: e.clientY };
    applyCam();
  };
  const onPointerUp = (): void => {
    drag.current = null;
  };

  return (
    <div
      ref={hostRef}
      style={{ position: 'absolute', inset: 0, background: '#f2ecd9', touchAction: 'none', cursor: 'grab' }}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
}

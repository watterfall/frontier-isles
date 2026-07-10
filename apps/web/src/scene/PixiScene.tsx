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
import { useEffect, useRef, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SceneStage, type TextureResolver, type ResolvedTexture } from '@frontier-isles/renderer/pixi';
import { worldToScreen, seaDepthAt } from '@frontier-isles/renderer';
import type { ClaimState, StationKind } from '@frontier-isles/core';
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
import { buildSceneGraph, type LayoutInput } from './layout';
import { bakeSvg } from './bakeTexture';

/** The 9 L1 stations as their real SVG assets, keyed by scene-object kind. */
const STATION_ELS: Record<string, ReactElement> = {
  'station:workshop': <StationWorkshop x={160} y={160} />,
  'station:library': <StationLibrary x={160} y={160} />,
  'station:canvas': <StationWhiteboardHall x={160} y={160} />,
  'station:questions': <StationQuestionWall x={160} y={160} />,
  'station:data': <StationDataBench x={160} y={160} />,
  'station:gallery': <StationGallery x={160} y={160} />,
  'station:tearoom': <StationTearoom x={160} y={160} />,
  'station:driftwood': <DriftwoodGarden x={160} y={160} showTransplantTag={false} />,
  'station:dock': <FerryDock x={160} y={160} />,
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
  /** Domain abstractness (frontier.substrate, 0..1) → sea darkness (海即数据, depth-plan-v2 §4). */
  substrate?: number;
  /** Disputed-sea undertow: a boolean (demo toggle) or 0..1 contention magnitude (海即数据). */
  undertow?: boolean | number;
  /** Tapping a station calls back with its kind so the parent opens that station. */
  onStation?: (kind: StationKind) => void;
  /** GPU absent → parent renders the SVG fallback scene instead. */
  onWebglError?: (msg: string) => void;
  /** Live render metrics for a dev HUD (the demo shows them; live L1 omits). */
  onMetrics?: (m: PixiSceneMetrics) => void;
}

/**
 * The embeddable Pixi scene. Re-boots on `input`/`claims` change (once per island
 * open); `t`/`undertow` apply live without a re-boot.
 */
export default function PixiScene({ input, claims, t, substrate, undertow = false, onStation, onWebglError, onMetrics }: PixiSceneProps) {
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
  const cbRef = useRef({ onStation, onWebglError, onMetrics });
  cbRef.current = { onStation, onWebglError, onMetrics };
  const objCountRef = useRef(0); // last object count, for the dev-HUD sampler

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
    void (async () => {
      const s = new SceneStage();
      try {
        // Pass the host DIV (not a shared canvas): Pixi creates its own canvas so
        // StrictMode's double-mount can't tear one canvas out from under the other.
        await s.init(el, { resizeTo: el, background: 0xf2ecd9, backgroundAlpha: 1 }); // warm paper (design base)
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
      // Hit-testing → open the tapped station (claims not yet wired to a panel).
      s.onPick = (id) => {
        if (id.startsWith('station:')) cbRef.current.onStation?.(id.slice('station:'.length) as StationKind);
      };
      const graph = buildSceneGraph(input, tRef.current, claims);
      // Texture-lift (design-system alignment): rasterise the 9 real station SVG
      // assets → Pixi textures via the resolver, so the island renders in the
      // hand-drawn design vocabulary instead of placeholder boxes.
      let resolve: TextureResolver | undefined;
      try {
        const C = 320;
        const texMap: Record<string, ResolvedTexture> = {};
        for (const [kind, elx] of Object.entries(STATION_ELS)) {
          const svg = renderToStaticMarkup(
            <svg xmlns="http://www.w3.org/2000/svg" width={C} height={C} viewBox={`0 0 ${C} ${C}`}>
              {elx}
            </svg>,
          );
          const tex = await bakeSvg(svg, { width: C, height: C, scale: 3 });
          texMap[kind] = { texture: tex, anchor: { x: 0.5, y: 0.675 }, scale: 150 / (220 * 3) };
        }
        if (disposed) return;
        resolve = (o) => texMap[o.kind];
      } catch (e) {
        console.warn('[pixi-scene] station bake failed', e);
      }
      s.render(graph, resolve);
      s.setDayNight(tRef.current);
      applyCam();
      // Sea = data (海即数据): domain hue (climate) + darkness = abstractness (depth).
      s.buildSea(SEA_COLORS[input.domain] ?? SEA_COLORS['数理']!, {
        depthAlpha: seaDepthAt(substrateRef.current).overlayAlpha,
      });
      objCountRef.current = graph.objects.length;
      cbRef.current.onMetrics?.({ objects: graph.objects.length, sorted: s.sortedNodeCount(), renderMs: s.lastRenderMs });
    })();
    return () => {
      disposed = true;
      if (stage) stage.destroy();
      stageRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, claims]);

  // Day↔night → per-object alpha + tone veil (P4). No re-boot. tweenDayNight (M5)
  // sweeps smoothly instead of snapping; the boot did an instant setDayNight so
  // the first paint is correct, and this only animates subsequent lever pulls.
  useEffect(() => {
    stageRef.current?.tweenDayNight(t);
  }, [t]);

  // Disputed-sea undertow toggle (M2).
  useEffect(() => {
    stageRef.current?.setUndertow(undertow);
  }, [undertow]);

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

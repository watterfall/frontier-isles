/**
 * PixiSceneHost — M1 mount surface for the layered Pixi scene (M1-DESIGN §5).
 *
 * Boots a {@link SceneStage} into a canvas, feeds it a {@link buildSceneGraph}
 * output, and wires camera pan/zoom + the day↔night slider. Isolated behind
 * `?scene=pixi` (see main.tsx) so it never perturbs the existing SVG scene — the
 * no-regression boundary for M1. Falls back to a message when WebGL is absent
 * (architecture: the app must render without the GPU too; full SVG fallback wiring
 * lands when the Pixi scene replaces the SVG one in M4).
 */
import { useEffect, useRef, useState } from 'react';
import { SceneStage } from '@frontier-isles/renderer/pixi';
import { worldToScreen } from '@frontier-isles/renderer';
import { buildSceneGraph, type LayoutInput } from './layout';

const DEMO: LayoutInput = {
  slug: 'machine-curiosity',
  domain: '数理',
  stage: 2,
  members: 4,
  dormant: false,
  status: 'active',
  outlier: false,
  hasAi: true,
  eventCount: 40,
};

/** Per-domain water colours (0..1 rgb): shallow / deep / foam. */
const SEA_COLORS: Record<string, { seaColor: [number, number, number]; deepColor: [number, number, number]; foamColor: [number, number, number] }> = {
  数理: { seaColor: [0.16, 0.34, 0.44], deepColor: [0.09, 0.21, 0.31], foamColor: [0.82, 0.9, 0.95] },
  物质: { seaColor: [0.16, 0.33, 0.4], deepColor: [0.1, 0.22, 0.28], foamColor: [0.9, 0.88, 0.8] },
  生命: { seaColor: [0.14, 0.36, 0.36], deepColor: [0.07, 0.22, 0.24], foamColor: [0.85, 0.94, 0.88] },
  交叉: { seaColor: [0.2, 0.3, 0.45], deepColor: [0.12, 0.18, 0.33], foamColor: [0.88, 0.86, 0.95] },
};

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));

export default function PixiSceneHost({ input = DEMO }: { input?: LayoutInput }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<SceneStage | null>(null);
  const cam = useRef({ ...worldToScreen(8, 8), zoom: 0.75 }); // island centre (tile 8,8)
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [t, setT] = useState(0);
  const [undertow, setUndertow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [stat, setStat] = useState({ renderMs: 0, sorted: 0, objects: 0 });

  const applyCam = (): void => {
    const s = stageRef.current;
    if (!s) return;
    s.zoomTo(cam.current.zoom);
    s.panTo(cam.current.x, cam.current.y);
  };

  // Boot once. StrictMode double-invokes effects, so guard init/destroy.
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    let disposed = false;
    let stage: SceneStage | null = null;
    void (async () => {
      const s = new SceneStage();
      try {
        // Pass the host DIV (not a shared canvas): Pixi creates its own canvas so
        // StrictMode's double-mount can't init two apps onto one element and then
        // have the first destroy(removeView) tear the canvas out from under the
        // survivor. resizeTo fills + follows the container.
        await s.init(el, { resizeTo: el, background: 0x0e1420, backgroundAlpha: 1 });
      } catch (e) {
        if (!disposed) setErr(String(e));
        return;
      }
      if (disposed) {
        s.destroy();
        return;
      }
      stage = s;
      stageRef.current = s;
      const graph = buildSceneGraph(input, t);
      s.render(graph);
      applyCam();
      s.buildSea(SEA_COLORS[input.domain] ?? SEA_COLORS['数理']!); // animated water plane (M2)
      setStat({ objects: graph.objects.length, sorted: s.sortedNodeCount(), renderMs: s.lastRenderMs });
    })();
    return () => {
      disposed = true;
      if (stage) stage.destroy();
      stageRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  // Day↔night slider → per-object alpha path (P4).
  useEffect(() => {
    stageRef.current?.setDayNight(t);
  }, [t]);

  // Disputed-sea undertow toggle (M2).
  useEffect(() => {
    stageRef.current?.setUndertow(undertow);
  }, [undertow]);

  // Render-cost sampler for the §7 frame baseline (updates as the user interacts).
  useEffect(() => {
    const id = setInterval(() => {
      const s = stageRef.current;
      if (s?.app) setStat((v) => ({ ...v, renderMs: s.lastRenderMs, sorted: s.sortedNodeCount() }));
    }, 500);
    return () => clearInterval(id);
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
      style={{ position: 'fixed', inset: 0, background: '#0e1420', touchAction: 'none', cursor: 'grab' }}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {err && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#e8e8f0', font: '14px system-ui', padding: 24, textAlign: 'center' }}>
          WebGL unavailable — the Pixi scene needs a GPU context.<br />
          {err}
        </div>
      )}
      <div style={{ position: 'absolute', top: 12, left: 12, color: '#cfd6e6', font: '12px ui-monospace, monospace', background: 'rgba(0,0,0,.45)', padding: '6px 9px', borderRadius: 6, lineHeight: 1.5 }}>
        <div>M3 · day/night + sea + layered</div>
        <div>render {stat.renderMs.toFixed(1)}ms · sorted {stat.sorted} · objects {stat.objects}</div>
        <div>drag = pan · wheel = zoom</div>
        <button
          type="button"
          onClick={() => setUndertow((v) => !v)}
          style={{ marginTop: 5, font: '11px ui-monospace, monospace', color: '#cfd6e6', background: undertow ? 'rgba(120,60,90,.7)' : 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 5, padding: '3px 7px', cursor: 'pointer' }}
        >
          undertow {undertow ? 'ON' : 'off'}
        </button>
      </div>
      <label style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', color: '#cfd6e6', font: '12px system-ui', background: 'rgba(0,0,0,.45)', padding: '8px 12px', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span>☀︎ day</span>
        <input type="range" min={0} max={1} step={0.01} value={t} onChange={(e) => setT(Number(e.target.value))} style={{ width: 220 }} />
        <span>night ☾ · t={t.toFixed(2)}</span>
      </label>
    </div>
  );
}

/**
 * AtlasPixiHost — the `?atlas=pixi` DEV DEMO wrapper for the L0 图集 (Phase
 * C1+C2, docs/scene-upgrade/INFO-HIERARCHY.md).
 *
 * A full-window host around {@link AtlasStage}: it owns the demo chrome (render
 * HUD, tier readout) and feeds the atlas its data. Mirrors PixiSceneHost's role
 * — the scene can be inspected in isolation, and PixiJS stays out of the main
 * bundle because main.tsx dynamic-imports this file only on `?atlas=pixi`.
 *
 * Data source: the curated frontier atlas (`DATA` in api/fallback — the same
 * source the server seed uses, so these ARE the real curated islands, rendered
 * identically with the server absent). `?n=N` appends N deterministic,
 * BELIEVABLE synthetic islands (slug `syn-*`, `synthetic: true`) from
 * `@frontier-isles/core`'s `makeScaleCorpus` (docs/atlas-world-plan.md §4 lane
 * W4) for the scale test — compositionally-generated CJK frontier titles from a
 * curated per-domain subfield vocabulary, honestly flagged and never mixed into
 * the curated `DATA`.
 *
 * atlas-world-plan.md W1: the atlas engine this demo exercises is now ALSO the
 * default L0 (`AtlasChartScreen`/`AtlasChartHost`, wired into `App.tsx`) — this
 * full-window host stays as the isolated dev/scale-test surface (unchanged URL
 * contract: `?atlas=pixi[&n=N]`). Both hosts share the same data wiring
 * (`./atlasData` — extracted from here, no drift).
 */
import { useEffect, useRef, useState } from 'react';
import { AtlasStage, type AtlasMetrics } from '@frontier-isles/renderer/pixi';
import { makeScaleCorpus } from '@frontier-isles/core';
import { buildAtlasScene } from './atlasData';

export default function AtlasPixiHost() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<AtlasStage | null>(null);
  const [metrics, setMetrics] = useState<AtlasMetrics>({ renderMs: 0, scale: 1, tier: 'far', islands: 0, visible: 0, labels: 0, satellites: 0, visibleSatellites: 0 });
  const [picked, setPicked] = useState<string | null>(null);

  // `?n=` synthetic-island count for the scale test (0 = curated atlas only).
  const n = Number(new URLSearchParams(location.search).get('n')) || 0;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    const stage = new AtlasStage();
    stage.onMetrics = setMetrics;
    stage.onPick = (slug) => setPicked(slug);

    void stage.init(host, { resizeTo: host }).then(() => {
      if (disposed) {
        stage.destroy();
        return;
      }
      // Scale test: append N believable synthetic frontier islands (W4) through
      // the SHARED scene builder (W1) — same spatial×domain projectArchipelagos
      // clustering + statistical-outlier float the default L0 uses, no drift.
      const { islands, clusters, continents, fog, flows, currents } = buildAtlasScene(undefined, n > 0 ? makeScaleCorpus(n) : []);
      stage.setIslands(islands, clusters);
      stage.setClimate(continents, fog, flows, currents);
      stageRef.current = stage;
      // DEV-only handle for deterministic camera control (verification screenshots).
      if (import.meta.env.DEV) (window as unknown as { __atlas?: AtlasStage }).__atlas = stage;
    });

    return () => {
      disposed = true;
      stageRef.current?.destroy();
      stageRef.current = null;
    };
  }, [n]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#f2ead8' }}>
      <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />

      <div style={{ position: 'absolute', top: 12, left: 12, color: '#3a342b', font: '12px ui-monospace, monospace', background: 'rgba(250,245,232,0.85)', padding: '8px 11px', borderRadius: 6, lineHeight: 1.6, pointerEvents: 'none', border: '1px solid rgba(58,52,43,0.25)' }}>
        <div style={{ fontWeight: 700 }}>L0 atlas · C1+C2 (semantic LOD)</div>
        <div>render {metrics.renderMs.toFixed(2)}ms · tier <b>{metrics.tier}</b> · scale {metrics.scale.toFixed(2)}</div>
        <div>islands {metrics.islands} · on-screen {metrics.visible} · labels {metrics.labels}</div>
        <div>satellites {metrics.visibleSatellites}/{metrics.satellites} · geometry-derived anchors</div>
        <div style={{ opacity: 0.7 }}>wheel = zoom (pointer-anchored) · drag = pan · tap isle</div>
        <div style={{ opacity: 0.7 }}>?n=300 → +N synthetic frontier islands (scale test){n > 0 ? ` · +${n}` : ''}</div>
        {picked && <div style={{ marginTop: 4, color: '#B5673A' }}>picked: {picked}</div>}
      </div>
    </div>
  );
}

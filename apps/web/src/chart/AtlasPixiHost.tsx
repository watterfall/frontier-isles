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
 * source the server seed uses, so these ARE the 27 real islands, rendered
 * identically with the server absent). `?n=300` appends N deterministically
 * hash-generated FAKE islands (slug `fake-*`) for the scale test — clearly not
 * real data. This host does NOT touch ChartScreen; the SVG L0 stays the default.
 */
import { useEffect, useRef, useState } from 'react';
import {
  AtlasStage,
  makeFakeIslands,
  placeholderClusters,
  type AtlasIslandInput,
  type AtlasMetrics,
} from '@frontier-isles/renderer/pixi';
import { DATA, type IslandDatum } from '../api/fallback';

/** Map a curated `IslandDatum` to the atlas' input shape (fields carried over
 * verbatim; `eventCount` uses the activity proxy — the fallback has no ledger). */
function toAtlasInput(d: IslandDatum): AtlasIslandInput {
  return {
    slug: d.slug ?? `id-${d.id}`,
    name: d.n.zh, // editorial content stays in authored zh (invariant 9)
    domain: d.d,
    stage: d.st,
    status: d.res ? 'resolved' : d.dor ? 'dormant' : 'active',
    dormant: !!d.dor,
    outlier: !!d.out,
    eventCount: d.a,
    x: d.x,
    y: d.y,
  };
}

export default function AtlasPixiHost() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<AtlasStage | null>(null);
  const [metrics, setMetrics] = useState<AtlasMetrics>({ renderMs: 0, scale: 1, tier: 'far', islands: 0, visible: 0, labels: 0 });
  const [picked, setPicked] = useState<string | null>(null);

  // `?n=` fake-island count for the scale test (0 = curated atlas only).
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
      const real = DATA.map(toAtlasInput);
      const islands = n > 0 ? [...real, ...makeFakeIslands(n)] : real;
      const clusters = placeholderClusters(islands);
      stage.setIslands(islands, clusters);
      stageRef.current = stage;
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
        <div style={{ opacity: 0.7 }}>wheel = zoom (pointer-anchored) · drag = pan · tap isle</div>
        <div style={{ opacity: 0.7 }}>?n=300 → +N fake islands (scale test){n > 0 ? ` · +${n}` : ''}</div>
        {picked && <div style={{ marginTop: 4, color: '#B5673A' }}>picked: {picked}</div>}
      </div>
    </div>
  );
}

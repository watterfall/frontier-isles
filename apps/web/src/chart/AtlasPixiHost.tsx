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
 * identically with the server absent). `?n=300` appends N deterministic,
 * BELIEVABLE synthetic islands (slug `syn-*`, `synthetic: true`) from
 * `@frontier-isles/core`'s `makeScaleCorpus` (docs/atlas-world-plan.md §4 lane
 * W4) for the scale test — compositionally-generated CJK frontier titles from
 * a curated per-domain subfield vocabulary, honestly flagged and never mixed
 * into the curated `DATA`. This host does NOT touch ChartScreen; the SVG L0
 * stays the default.
 */
import { useEffect, useRef, useState } from 'react';
import {
  ATLAS_DOMAIN_FILL,
  AtlasStage,
  type AtlasCluster,
  type AtlasDomain,
  type AtlasIslandInput,
  type AtlasMetrics,
} from '@frontier-isles/renderer/pixi';
import { makeScaleCorpus, projectArchipelagos } from '@frontier-isles/core';
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
      const real = DATA.map(toAtlasInput);
      const islands: AtlasIslandInput[] = n > 0 ? [...real, ...makeScaleCorpus(n)] : real;
      // C3 real projection (core.projectArchipelagos) fills the far-tier cluster
      // slot: spatial × domain-vector × current-strength single-linkage,
      // statistical outliers never clustered. Cluster provenance (curated
      // `cluster` field) feeds the derived bilingual names; the demo passes no
      // currents (spatial+domain only — the live wire-up adds api.currents()).
      const clusterOf = new Map(DATA.map((d) => [d.slug ?? `id-${d.id}`, d.cluster] as const));
      const proj = projectArchipelagos(
        islands.map((i) => ({ slug: i.slug, domain: i.domain, x: i.x, y: i.y, outlier: i.outlier, cluster: clusterOf.get(i.slug) })),
      );
      // Statistical outliers float above the bulk exactly like editorial ones.
      const statOutliers = new Set(proj.outliers);
      const withOutliers = islands.map((i) => (statOutliers.has(i.slug) ? { ...i, outlier: true } : i));
      const dominantDomain = (mix: Record<string, number>): AtlasDomain => {
        let best: AtlasDomain = '交叉';
        let bestV = -1;
        for (const d of Object.keys(ATLAS_DOMAIN_FILL) as AtlasDomain[]) if ((mix[d] ?? 0) > bestV) { bestV = mix[d] ?? 0; best = d; }
        return best;
      };
      const clusters: AtlasCluster[] = proj.archipelagos.map((a) => ({
        id: a.id,
        name: a.name.zh, // editorial naming surfaces zh in the demo host
        islandSlugs: a.islandSlugs,
        center: a.center,
        radius: a.radius,
        tint: ATLAS_DOMAIN_FILL[dominantDomain(a.domainMix)],
      }));
      stage.setIslands(withOutliers, clusters);
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
        <div style={{ opacity: 0.7 }}>?n=300 → +N synthetic frontier islands (scale test){n > 0 ? ` · +${n}` : ''}</div>
        {picked && <div style={{ marginTop: 4, color: '#B5673A' }}>picked: {picked}</div>}
      </div>
    </div>
  );
}

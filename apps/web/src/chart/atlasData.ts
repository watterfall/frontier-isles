/**
 * atlasData — the ONE place `IslandDatum` (fallback.ts / live API, reconciled
 * by `useAppData`) is mapped into the atlas engine's input shape and clustered
 * into archipelagos. Extracted from `AtlasPixiHost` (the `?atlas=pixi` dev
 * demo) so the SAME wiring feeds both the demo host and the default-path L0
 * (`AtlasChartHost`) — one source of truth, no drift between the two.
 *
 * Pure (no DOM, no Pixi import): safe to unit-test headless and to call from
 * either host's effect.
 */
import { projectArchipelagos } from '@frontier-isles/core';
import {
  ATLAS_DOMAIN_FILL,
  type AtlasCluster,
  type AtlasDomain,
  type AtlasIslandInput,
} from '@frontier-isles/renderer/pixi';
import { DATA, type IslandDatum } from '../api/fallback';

/** Map a curated/live `IslandDatum` to the atlas' input shape (fields carried
 * over verbatim; `eventCount` uses the activity proxy — the fallback has no
 * ledger). Exported so a caller needing just the per-island shape (no
 * clustering) can reuse it directly. */
export function toAtlasInput(d: IslandDatum): AtlasIslandInput {
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

export interface AtlasSceneData {
  islands: AtlasIslandInput[];
  clusters: AtlasCluster[];
}

function dominantDomain(mix: Record<string, number>): AtlasDomain {
  let best: AtlasDomain = '交叉';
  let bestV = -1;
  for (const d of Object.keys(ATLAS_DOMAIN_FILL) as AtlasDomain[]) {
    if ((mix[d] ?? 0) > bestV) {
      bestV = mix[d] ?? 0;
      best = d;
    }
  }
  return best;
}

/**
 * Build the atlas' full render input from the app's chart islands: real C3
 * projection (`core.projectArchipelagos`, spatial × domain-vector × current-
 * strength single-linkage) fills the far-tier cluster slot; statistical
 * outliers are never folded into a cluster (they float, exactly like
 * editorial ones). `extra` appends already-mapped fake islands for the
 * `?n=` scale test — never real data, kept out of the clustering's
 * `clusterOf` provenance lookup (fake slugs have none).
 *
 * TODO(W1→W4): currents are not wired in yet — `projectArchipelagos` runs
 * spatial+domain only (matches the `?atlas=pixi` demo's prior behaviour).
 * `useSeaData()`/`api.currents()` exist and could sharpen clustering once the
 * op↔slug join is settled (currents key by `op://…`, atlas by `slug`); left
 * for a follow-up lane, not required for W1's headline (promote-to-default).
 */
export function buildAtlasScene(source: IslandDatum[] = DATA, extra: AtlasIslandInput[] = []): AtlasSceneData {
  const real = source.map(toAtlasInput);
  const islands = extra.length > 0 ? [...real, ...extra] : real;
  const clusterOf = new Map(source.map((d) => [d.slug ?? `id-${d.id}`, d.cluster] as const));
  const proj = projectArchipelagos(
    islands.map((i) => ({ slug: i.slug, domain: i.domain, x: i.x, y: i.y, outlier: i.outlier, cluster: clusterOf.get(i.slug) })),
  );
  const statOutliers = new Set(proj.outliers);
  const withOutliers = islands.map((i) => (statOutliers.has(i.slug) ? { ...i, outlier: true } : i));
  const clusters: AtlasCluster[] = proj.archipelagos.map((a) => ({
    id: a.id,
    name: a.name.zh, // editorial naming (invariant 9)
    islandSlugs: a.islandSlugs,
    center: a.center,
    radius: a.radius,
    tint: ATLAS_DOMAIN_FILL[dominantDomain(a.domainMix)],
  }));
  return { islands: withOutliers, clusters };
}

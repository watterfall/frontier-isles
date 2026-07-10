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
import { REGION_NAMES } from '@frontier-isles/data';
import {
  ATLAS_DOMAIN_FILL,
  type AtlasCluster,
  type AtlasDomain,
  type AtlasIslandInput,
} from '@frontier-isles/renderer/pixi';
import { DATA, type IslandDatum } from '../api/fallback';

/** Cluster provenance an `extra` (scale-corpus) island may carry — synthetic
 *  islands (`makeScaleCorpus`) ship a `cluster` field structurally identical to
 *  the curated one, so region NAMES survive at scale (700). Kept optional so a
 *  plain `AtlasIslandInput[]` still assigns. */
export type AtlasExtraIsland = AtlasIslandInput & {
  cluster?: { code?: string; zh?: string; en?: string };
};

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
export function buildAtlasScene(source: IslandDatum[] = DATA, extra: AtlasExtraIsland[] = []): AtlasSceneData {
  const real = source.map(toAtlasInput);
  const islands: AtlasIslandInput[] = extra.length > 0 ? [...real, ...extra] : real;
  // Cluster provenance for NAMING: curated islands from their `cluster` field,
  // synthetic (extra) islands from theirs — so 700 islands still read as NAMED
  // regions, not generic domain blobs. Activity feeds region 体温.
  const clusterOf = new Map<string, { code?: string; zh?: string; en?: string } | undefined>();
  for (const d of source) clusterOf.set(d.slug ?? `id-${d.id}`, d.cluster);
  for (const e of extra) if (e.cluster) clusterOf.set(e.slug, e.cluster);
  const proj = projectArchipelagos(
    islands.map((i) => ({
      slug: i.slug,
      domain: i.domain,
      x: i.x,
      y: i.y,
      outlier: i.outlier,
      cluster: clusterOf.get(i.slug),
      activity: i.eventCount,
    })),
    [],
    { curatedNames: REGION_NAMES }, // curated place-plane overlay (invariant 9)
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
    heat: a.heat,
    ...(a.caption ? { caption: a.caption.zh } : {}),
  }));
  return { islands: withOutliers, clusters };
}

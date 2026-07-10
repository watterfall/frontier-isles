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
import { projectArchipelagos, projectClimate, projectContinentCurrents, type CurrentKind } from '@frontier-isles/core';
import {
  ATLAS_DOMAIN_FILL,
  ATLAS_DOMAIN_INK,
  type AtlasCluster,
  type AtlasContinent,
  type AtlasDomain,
  type AtlasFlow,
  type AtlasFogCell,
  type AtlasIslandInput,
} from '@frontier-isles/renderer/pixi';
import { DATA, type IslandDatum } from '../api/fallback';
import { fixtureSeaData } from '../api/seaFallback';

/** Current-kind → flowline colour (the frozen token palette, depth-plan-v2 §3):
 *  石青 azurite = evidence · 赭石 ochre = bridge · 石绿 malachite = lineage. */
const FLOW_TINT: Record<CurrentKind, number> = {
  evidence: 0x2e5e8c, // --fi-azurite
  bridge: 0xb5673a, // --fi-ochre
  lineage: 0x3e9b7e, // --fi-malachite
};

/**
 * Inter-territory currents for the far tier — the SAME real cross-island
 * relations the server seeds (`SEA_SEED_RELATIONS`), projected offline-identical
 * by `fixtureSeaData()` and reduced to domain-pair flows. Every flow transcribes
 * a real event (invariant 14). Memoised: the curated relation set is static.
 */
let cachedFlows: AtlasFlow[] | null = null;
function curatedContinentFlows(): AtlasFlow[] {
  if (cachedFlows) return cachedFlows;
  const sea = fixtureSeaData();
  const domainOf = new Map(sea.islands.map((i) => [i.op, i.domain] as const));
  const flows = projectContinentCurrents(
    sea.currents.map((c) => ({ from: c.from, to: c.to, kind: c.kind, weight: c.weight })),
    (op) => domainOf.get(op),
  ).map<AtlasFlow>((f) => ({ from: f.from as AtlasDomain, to: f.to as AtlasDomain, tint: FLOW_TINT[f.kind], weight: f.weight }));
  cachedFlows = flows;
  return flows;
}

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
  /** Far-tier climate territories (soft washes, one per populated domain). */
  continents: AtlasContinent[];
  /** Fog grid over the unexplored edges (focus aid). */
  fog: AtlasFogCell[];
  /** Inter-territory currents (cross-domain relations). */
  flows: AtlasFlow[];
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

  // Far-tier climate: 4 named domain territories (soft washes) + fog on the
  // unexplored edges — a pure reduce over island domain positions (lane W2).
  const climate = projectClimate(
    islands.map((i) => ({ slug: i.slug, domain: i.domain, x: i.x, y: i.y, eventCount: i.eventCount, dormant: i.dormant })),
  );
  const continents: AtlasContinent[] = climate.territories.map((t) => ({
    domain: t.domain as AtlasDomain,
    name: t.name.zh, // editorial territory name (invariant 9)
    manifold: t.manifold,
    center: t.center,
    extent: t.extent,
    tint: ATLAS_DOMAIN_FILL[t.domain as AtlasDomain],
    ink: ATLAS_DOMAIN_INK[t.domain as AtlasDomain],
  }));
  const fog: AtlasFogCell[] = climate.fog.map((f) => ({ x: f.x, y: f.y, w: f.w, h: f.h, fog: f.fog }));

  return { islands: withOutliers, clusters, continents, fog, flows: curatedContinentFlows() };
}

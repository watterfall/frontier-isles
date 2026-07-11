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
import { REGION_NAMES } from '@frontier-isles/data';
import {
  ATLAS_DOMAIN_FILL,
  ATLAS_DOMAIN_INK,
  ATLAS_STAGE_RADIUS,
  ATLAS_Y_TILT,
  assignAtlasAltitudes,
  assignAtlasHierarchy,
  atlasIslandLift,
  type AtlasCluster,
  type AtlasContinent,
  type AtlasCurrent,
  type AtlasDomain,
  type AtlasFlow,
  type AtlasFogCell,
  type AtlasIslandInput,
} from '@frontier-isles/renderer/atlas-lod';
import { DATA, type IslandDatum } from '../api/fallback';
import { fixtureSeaData } from '../api/seaFallback';
import { spaceIslands } from './despace';

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

let cachedCurrents: AtlasCurrent[] | null = null;
function curatedIslandCurrents(): AtlasCurrent[] {
  if (cachedCurrents) return cachedCurrents;
  const sea = fixtureSeaData();
  const slugOf = new Map(sea.islands.map((island) => [island.op, island.op.split('/').at(-1) ?? island.op] as const));
  cachedCurrents = sea.currents.flatMap<AtlasCurrent>((current) => {
    const fromSlug = slugOf.get(current.from);
    const toSlug = slugOf.get(current.to);
    if (!fromSlug || !toSlug || fromSlug === toSlug) return [];
    return [{ fromSlug, toSlug, kind: current.kind, tint: FLOW_TINT[current.kind], weight: current.weight }];
  });
  return cachedCurrents;
}

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
    members: d.m, // T2 richness (atlas-world-plan.md §4 lane W5) — real member count
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
  /** Real island-level ledger currents for mid/near vertical air routes. */
  currents: AtlasCurrent[];
}

/**
 * De-overlap the atlas world in its PROJECTED plane (x, y·tilt − lift). Raw
 * chart coords are authored/derived and genuinely collide once the three air
 * strata fold onto one screen — the Pixi atlas rendered them verbatim while
 * the SVG chart already ran `spaceIslands`. Same discipline here, but in the
 * plane the eye judges: deterministic relaxation, neighbourhoods and regions
 * survive, only the collisions go. Lift is per-island constant, so pushing the
 * projected point and back-solving raw `y` is exact.
 */
function despaceProjected<T extends AtlasIslandInput>(islands: T[]): T[] {
  if (islands.length < 2) return islands;
  const lifts = islands.map((island) => atlasIslandLift(island));
  const pts = islands.map((island, k) => ({
    x: island.x,
    y: island.y * ATLAS_Y_TILT - lifts[k]!,
    s: ATLAS_STAGE_RADIUS[Math.max(0, Math.min(3, island.stage)) as 0 | 1 | 2 | 3] / 52,
  }));
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  const slack = 90; // room to relax outward without exploding the world bbox
  const spaced = spaceIslands(pts, {
    minDist: 140,
    iterations: islands.length > 220 ? 80 : 320, // O(n²) pass — cap at scale-test sizes
    bounds: { minX: minX - slack, minY: minY - slack, maxX: maxX + slack, maxY: maxY + slack },
  });
  return islands.map((island, k) => ({
    ...island,
    x: spaced[k]!.x,
    y: (spaced[k]!.y + lifts[k]!) / ATLAS_Y_TILT,
  }));
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
  const authored: AtlasIslandInput[] = extra.length > 0 ? [...real, ...extra] : real;
  // Strata from the AUTHORED north→south order (stable per dataset), then
  // despace in the projected plane BEFORE anything downstream (clusters,
  // climate, anchor choice) reads positions — one world, no drift.
  const islands = despaceProjected(assignAtlasAltitudes(authored));
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

  const nested = assignAtlasHierarchy(withOutliers, clusters);
  return { islands: nested, clusters, continents, fog, flows: curatedContinentFlows(), currents: curatedIslandCurrents() };
}

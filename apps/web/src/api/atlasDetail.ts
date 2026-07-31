import type { IslandDatum } from './fallback';

/** Card prose + reference shelf, keyed by slug — the deferred half of the L0
 *  atlas (packages/data/src/atlas-detail.ts). */
export type AtlasDetailMap = Record<
  string,
  { brief?: IslandDatum['brief']; citation?: IslandDatum['citation'] }
>;

/**
 * Loads the deferred atlas detail. MUST stay a dynamic import: a static one
 * would put ~141KB of card prose and citations back in the entry chunk, which
 * is the whole point of the split (see packages/data/scripts/generate-atlas.mjs).
 *
 * Resolves to `{}` rather than rejecting when the chunk cannot be fetched. Every
 * consumer of `brief`/`citation` already renders them conditionally, so an
 * island without detail is a correct island with a shorter card — never a crash
 * or an empty map.
 */
export async function loadAtlasDetail(): Promise<AtlasDetailMap> {
  try {
    const { FRONTIER_ATLAS_DETAIL } = await import('@frontier-isles/data/atlas-detail');
    return FRONTIER_ATLAS_DETAIL;
  } catch {
    return {};
  }
}

/** Folds detail onto a positioned island list. Identity-preserving at BOTH
 *  levels, for the reason spelled out on useAppData's `reconcile`: an island the
 *  map has nothing for keeps its reference, and an empty map returns the very
 *  same array, so a failed or empty detail load cannot churn the islands array
 *  and tear down the Pixi atlas. */
export function applyAtlasDetail(
  islands: readonly IslandDatum[],
  detail: AtlasDetailMap,
): readonly IslandDatum[] {
  let changed = false;
  const next = islands.map((d) => {
    const extra = d.slug ? detail[d.slug] : undefined;
    if (!extra) return d;
    // The bespoke sample island carries hand-written prose; never overwrite it.
    const brief = d.brief ?? extra.brief;
    const citation = d.citation ?? extra.citation;
    if (brief === d.brief && citation === d.citation) return d;
    changed = true;
    return { ...d, brief, citation };
  });
  return changed ? next : islands;
}

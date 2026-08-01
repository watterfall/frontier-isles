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
let cache: AtlasDetailMap = {};

export async function loadAtlasDetail(): Promise<AtlasDetailMap> {
  try {
    const { FRONTIER_ATLAS_DETAIL } = await import('@frontier-isles/data/atlas-detail');
    cache = FRONTIER_ATLAS_DETAIL;
    return FRONTIER_ATLAS_DETAIL;
  } catch {
    return {};
  }
}

/**
 * Synchronous read of whatever `loadAtlasDetail` has already put in the cache.
 *
 * For consumers that are NOT on the island state path and would otherwise have
 * to import the data module themselves. That matters more than it looks: a
 * static import from a lazily-mounted screen puts the whole 141KB module into
 * that screen's blocking import chain, and under a dev server that transform
 * happens while the visitor waits for the screen — a cost measured on CI, where
 * it pushed the L1 mount past its budget. Reading the cache costs nothing
 * because the atlas boot has already fetched it.
 *
 * Returns `undefined` before the boot load resolves; every caller treats the
 * fields as optional, so that window renders a correct, shorter card.
 */
export function atlasDetailOf(slug: string): AtlasDetailMap[string] | undefined {
  return cache[slug];
}

/** An island's own prose wins over the generated atlas — the bespoke sample
 *  island carries hand-written text that must never be overwritten. */
type DetailBearing = Pick<IslandDatum, 'brief' | 'citation' | 'slug'>;

export function briefOf(d: DetailBearing): IslandDatum['brief'] {
  return d.brief ?? (d.slug ? atlasDetailOf(d.slug)?.brief : undefined);
}

export function citationOf(d: DetailBearing): IslandDatum['citation'] {
  return d.citation ?? (d.slug ? atlasDetailOf(d.slug)?.citation : undefined);
}

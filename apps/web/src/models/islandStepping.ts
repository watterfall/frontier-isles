import { SAMPLE_SLUG, type IslandDatum } from '../api/fallback';

/** Resolve a datum's navigation slug (mirrors beginVoyage's fallback). */
export function islandSlugOf(d: IslandDatum): string {
  return d.slug ?? SAMPLE_SLUG;
}

/**
 * ‹ › island stepping. The atlas roster order IS the stepping order — the
 * same order the list twin reads, a navigation sequence and never a ranking.
 * Wraps at both ends; an unknown current slug or a one-island roster steps
 * nowhere.
 */
export function stepIsland(
  islands: readonly IslandDatum[],
  currentSlug: string,
  direction: -1 | 1,
): IslandDatum | null {
  if (islands.length < 2) return null;
  const index = islands.findIndex((d) => islandSlugOf(d) === currentSlug);
  if (index === -1) return null;
  return islands[(index + direction + islands.length) % islands.length] ?? null;
}

/** A sibling entry for the L1 same-cluster list. */
export interface ClusterSibling {
  slug: string;
  name: IslandDatum['n'];
}

/**
 * The other islands the upstream corpus files in this island's cluster.
 *
 * This is a PROJECTION of the corpus's own filing, not a claim that the
 * questions are related: this atlas measured that inferring a structural
 * correspondence from shared cluster membership fails about nine times in ten
 * (378 of 419 candidates rejected on reading the substrate — see
 * `packages/data/src/structures-expansion-wave3.ts`). The UI copy says "filed
 * together" for that reason, and this function is named for membership rather
 * than relatedness so a future caller does not read more into it than it holds.
 *
 * Returns `null` when the island carries no cluster — the sample island is
 * authored in this repo rather than projected from the corpus, and must not be
 * given a fabricated cluster to belong to.
 */
export function clusterSiblingsOf(
  islands: readonly IslandDatum[],
  currentSlug: string,
): ClusterSibling[] | null {
  const code = islands.find((d) => islandSlugOf(d) === currentSlug)?.cluster?.code;
  if (!code) return null;
  return islands
    .filter((d) => d.cluster?.code === code && islandSlugOf(d) !== currentSlug)
    .map((d) => ({ slug: islandSlugOf(d), name: d.n }));
}

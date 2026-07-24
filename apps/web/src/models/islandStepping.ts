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

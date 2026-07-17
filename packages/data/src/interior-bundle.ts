import type { IslandInterior } from './frontiers';
import { INTERIORS } from './interiors';
import { INTERIORS_2 } from './interiors-2';

const INTERIOR_BY_SLUG: Record<string, IslandInterior> = {
  ...INTERIORS,
  ...INTERIORS_2,
};

/** Full L1 station data. Browser consumers should load this entry point lazily. */
export function interiorBySlug(slug: string): IslandInterior | undefined {
  return INTERIOR_BY_SLUG[slug];
}

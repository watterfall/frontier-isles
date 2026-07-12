/**
 * harbor — the ONE place the server's My Harbor footprint (`api.harbor`) is
 * joined with the atlas scene into render inputs (depth-plan-v1 §3(d)): which
 * islands are home, and how much fog every other island carries. The fog math
 * itself is core's `fogLevel` (tiers: harbor 0 → co-archipelago 0.5 → bridge
 * hops → unrelated 1); this module only assembles its context from the scene
 * the atlas actually renders, so fog and pixels can never disagree.
 *
 * Pure (no DOM, no Pixi, no network): unit-tested headless, mirrors
 * `atlasData.ts`'s discipline exactly.
 */
import { fogLevel, type Harbor } from '@frontier-isles/core';
import type { AtlasSceneData } from './atlasData';

export interface HarborView {
  /** Harbor island slugs that exist in the current scene. */
  slugs: string[];
  /** slug → fog ∈ [0,1] for EVERY scene island (0 inside the harbor). */
  fog: Map<string, number>;
}

/**
 * Join footprint × scene → per-island fog. The scene's named regions serve as
 * the co-archipelago tier and its ledger currents as the bridge-hop tier
 * (`fogLevel` counts only `bridge`-kind edges). A footprint that intersects
 * the scene nowhere yields `null` — the atlas then renders exactly as with no
 * harbor at all (the §3(d)④ removal test, and the cold-start answer for a
 * brand-new actor).
 */
export function buildHarborView(
  scene: AtlasSceneData,
  actorId: string,
  islandSlugs: readonly string[],
): HarborView | null {
  const known = new Set(scene.islands.map((island) => island.slug));
  const slugs = islandSlugs.filter((slug) => known.has(slug));
  if (slugs.length === 0) return null;

  const harbor: Harbor = { actorId, islandSlugs: slugs, anchor: null };
  const archipelagoOf = new Map<string, string>();
  for (const cluster of scene.clusters) for (const slug of cluster.islandSlugs) archipelagoOf.set(slug, cluster.id);
  const currents = scene.currents.map((current) => ({ from: current.fromSlug, to: current.toSlug, kind: current.kind }));

  const fog = new Map<string, number>();
  for (const island of scene.islands) fog.set(island.slug, fogLevel(island.slug, harbor, { archipelagoOf, currents }));
  return { slugs, fog };
}

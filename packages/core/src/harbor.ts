import type { Current } from "./currents";
import type { Archipelago } from "./archipelago";

/**
 * My Harbor 我的港湾 (depth-plan-v1 §3(d)) + 雾化 fog (depth-plan-v1 §3(d), removal
 * test explicit: "the fog is a focus filter, not a wall — everything stays
 * reachable — invariant 4"). You do not cold-open the whole ocean; you open at
 * your harbor, and the far ocean is fogged, lifting as you sail out.
 *
 * ── Data source, stated honestly (the task's own instruction) ───────────────────
 * depth-plan-v1 §3① says "My Harbor = your memberships + founded/forked islands +
 * capability grants (place plane)". The server DOES have that: the `memberships`
 * table (`apps/server/src/db.ts`) and `store.getMemberships(opId)`. But it is only
 * exposed per-island, via `GET /api/islands/:slug` (`islandDetail`) — there is
 * (checked before writing this) NO cross-island "my memberships" endpoint, and
 * `GET /api/islands` (the list) carries no membership data at all. So today, a web
 * client cannot cheaply assemble "every island I'm a member of" in one call; doing
 * so would mean N `islandDetail` round-trips (one per island), which does not scale
 * to 700 islands and is out of scope for this package anyway (packages/core has no
 * network access).
 *
 * This module therefore does NOT read the place-plane `memberships` table at all.
 * Instead it takes the architecturally more honest path: `packages/opp/src/
 * ledger.ts` documents the ledger as "the sole source of attribution truth" (§5),
 * and every `LedgerEvent` already carries `op` (the island) + `actor.id`. So "my
 * harbor" is a pure reduce over whatever ledger events (or membership rows) the
 * CALLER has already assembled — an actor's footprint is exactly the islands where
 * they appear as `actor.id` on at least one event (founding, contributing,
 * validating, being granted a capability — anything). This is a strict superset of
 * "your memberships": every membership implies at least a `found_island` or
 * `grant_capability` event, but the reverse also holds for any real contribution.
 * It costs the caller nothing extra — the same event/membership rows they'd fetch
 * for any other reason (island detail, ledger replay) are enough. Concretely, the
 * realistic near-term web path is: "islands you've visited + founded/joined" (an
 * accreting client-side footprint), which is the honest "访问足迹 +
 * 创办/成员" the task asked to record if cross-island membership isn't cheaply
 * available — and it is not, today.
 *
 * Zero new storage, zero new verb (invariants 14/15): this is a reduce over data
 * that already exists, exactly like `./currents.ts`.
 */

/** One footprint row — deliberately loose so it accepts BOTH a real `LedgerEvent`
 *  (which has `actor: { id }`) and a simpler membership-style row (`{ op, actorId
 *  }`), per the task's "events 或 memberships" input. Only `op` + one of
 *  `actor.id`/`actorId` are read; everything else on the object is ignored. */
export interface HarborFootprintLike {
  op: string;
  actor?: { id: string };
  actorId?: string;
}

/** Chart position lookup for computing the harbor's default-view anchor. */
export interface HarborIslandPosition {
  slug: string;
  x: number;
  y: number;
}

export interface Harbor {
  actorId: string;
  /** Islands where the actor has a footprint — sorted, deduplicated op ids/slugs
   *  (whichever identifier space the caller's rows use). */
  islandSlugs: string[];
  /** Centroid of the harbor islands' chart positions — the default view anchor
   *  (depth-plan-v1 §3(d)). `null` when no positions were supplied OR the actor has
   *  no footprint yet (a brand-new agent): honest absence, never a fake anchor. */
  anchor: { x: number; y: number } | null;
}

/**
 * Project "my harbor" — the islands an actor has a footprint in, plus their
 * chart-space centroid as the default camera anchor. Pure reduce; see module
 * docstring for the data-source honesty note. `footprint` may be raw
 * `LedgerEvent[]` (across any number of islands, exactly like `projectCurrents`'
 * input) or a simpler membership-row list; only `.op` and `.actor.id`/`.actorId`
 * are read.
 */
export function projectHarbor(
  footprint: readonly HarborFootprintLike[],
  actorId: string,
  opts: { islands?: readonly HarborIslandPosition[] } = {},
): Harbor {
  const slugs = new Set<string>();
  for (const row of footprint) {
    const who = row.actor?.id ?? row.actorId;
    if (who === actorId && row.op) slugs.add(row.op);
  }
  const islandSlugs = [...slugs].sort();

  let anchor: { x: number; y: number } | null = null;
  if (opts.islands && islandSlugs.length > 0) {
    const byName = new Map(opts.islands.map((i) => [i.slug, i] as const));
    const pts = islandSlugs.map((s) => byName.get(s)).filter((p): p is HarborIslandPosition => !!p);
    if (pts.length > 0) {
      anchor = {
        x: pts.reduce((sum, p) => sum + p.x, 0) / pts.length,
        y: pts.reduce((sum, p) => sum + p.y, 0) / pts.length,
      };
    }
  }

  return { actorId, islandSlugs, anchor };
}

/** slug → archipelago id, for the co-archipelago fog tier. Build once from a
 *  `projectArchipelagos(...).archipelagos` result and pass into `fogLevel`. */
export function archipelagoIndex(archipelagos: readonly Archipelago[]): Map<string, string> {
  const idx = new Map<string, string>();
  for (const a of archipelagos) for (const slug of a.islandSlugs) idx.set(slug, a.id);
  return idx;
}

export interface FogContext {
  /** The bridge web to BFS over for "桥接跳数" (bridge-hop distance) — depth-plan-v1
   *  §3(d). Only edges with `kind === "bridge"` count; evidence/lineage currents
   *  are relations of a different sort (citation, fork) and do not mean "you can
   *  sail there" the way a ferryman's bridge does. Traversed as an undirected
   *  graph (a bridge connects both ways, per `currents.ts`'s `directed: false` for
   *  bridge kind). */
  currents?: readonly Pick<Current, "from" | "to" | "kind">[];
  /** slug → archipelago id (see `archipelagoIndex`), for the co-archipelago tier. */
  archipelagoOf?: ReadonlyMap<string, string>;
}

function bfsHopDistance(
  sources: readonly string[],
  target: string,
  edges: readonly Pick<Current, "from" | "to" | "kind">[],
): number | null {
  if (sources.includes(target)) return 0;
  const adj = new Map<string, Set<string>>();
  for (const c of edges) {
    if (c.kind !== "bridge") continue;
    if (!adj.has(c.from)) adj.set(c.from, new Set());
    if (!adj.has(c.to)) adj.set(c.to, new Set());
    adj.get(c.from)!.add(c.to);
    adj.get(c.to)!.add(c.from);
  }

  const visited = new Set<string>(sources);
  let frontier: string[] = [...sources];
  let hop = 0;
  while (frontier.length > 0) {
    hop++;
    const next: string[] = [];
    for (const node of frontier) {
      for (const neighbor of adj.get(node) ?? []) {
        if (visited.has(neighbor)) continue;
        if (neighbor === target) return hop;
        visited.add(neighbor);
        next.push(neighbor);
      }
    }
    frontier = next;
  }
  return null;
}

/**
 * Fog level ∈ [0,1] for `island` given `harbor` (depth-plan-v1 §3(d)). PURELY a
 * descriptive focus signal, NOT a permission — every island stays reachable
 * regardless of its fog (the removal test explicitly: "fog is a focus filter, not
 * a wall"). Monotonic in "relationship distance", in the order the doc gives:
 *
 *   0.   in the harbor itself                      → fog 0 (no fog)
 *   1.   shares an archipelago with a harbor island → tier 1 → fog 0.5
 *   2+.  reachable via `hop` ratified/proposed bridge hops → tier 1+hop → fog rises
 *   ∞.   no relation at all                          → fog 1 (max — still enterable)
 *
 * The curve `fog = 1 − 1/(1+tier)` is a smooth, strictly increasing saturating
 * function of the integer "tier" — closer relations always fog less than farther
 * ones, and only a genuinely unrelated island (no shared archipelago, no bridge
 * path) reaches the ceiling of exactly 1.
 */
export function fogLevel(island: string, harbor: Harbor, ctx: FogContext = {}): number {
  if (harbor.islandSlugs.includes(island)) return 0;
  if (harbor.islandSlugs.length === 0) return 1;

  let tier: number | null = null;

  if (ctx.archipelagoOf) {
    const targetArch = ctx.archipelagoOf.get(island);
    if (targetArch !== undefined) {
      const shared = harbor.islandSlugs.some((h) => ctx.archipelagoOf!.get(h) === targetArch);
      if (shared) tier = 1;
    }
  }

  if (ctx.currents && ctx.currents.length > 0) {
    const hop = bfsHopDistance(harbor.islandSlugs, island, ctx.currents);
    if (hop !== null) {
      const hopTier = 1 + hop;
      tier = tier === null ? hopTier : Math.min(tier, hopTier);
    }
  }

  if (tier === null) return 1;
  return 1 - 1 / (1 + tier);
}

import type { Current } from "./currents";

/**
 * Archipelago clustering (depth-plan-v2 §4, invariants 14–16; staged as Phase C3 in
 * INFO-HIERARCHY.md §3.4/§5). At far zoom, 700 islands on blank water read as 700
 * loose dots — the cure is not "draw more" but "layer by scale": dense
 * current-clusters auto-group into named regions so the eye reads ~20 archipelagos,
 * not 700 dots (depth-plan-v2 §4, INFO-HIERARCHY §6 acceptance).
 *
 * This is a PURE projection — a `reduce` over already-existing data (chart
 * coordinates, domain assignment, and the currents projection from `./currents.ts`).
 * No new store, no new verb (invariant 15): the same island list + current list
 * always yields the same archipelagos, and removing this module still leaves every
 * island individually reachable — clustering is a reading of density, never a gate.
 *
 * ── On "reusing sea-math's variance-select" ─────────────────────────────────────
 * depth-plan-v2 §4 and INFO-HIERARCHY §3.3 both say archipelago clustering "reuses
 * v1's variance-select ranking". In the actual codebase (checked before writing
 * this), `packages/renderer/src/sea.ts` has NO exported variance-select ranking
 * function — the only trace of the phrase is `frontier.mode: "variance-select"`, a
 * label on the atlas scoring pipeline (`packages/opp/src/problem-object.ts`,
 * `apps/server/src/seed.ts`), not a reusable statistics helper. There is nothing to
 * import or duplicate. `computeStatisticalOutliers` below is a fresh,
 * self-contained implementation of the SAME semantics the docs describe (an island
 * whose connectivity stands out from the bulk by variance, not by rank) — kept
 * local to this module rather than invented a second time in `renderer`.
 */

/** The four named regions of the domain manifold (depth-plan-v2 §4, invariant 16). */
export type DomainKey = "数理" | "物质" | "生命" | "交叉";

const DOMAIN_KEYS: readonly DomainKey[] = ["数理", "物质", "生命", "交叉"];

/** Unit-square corners — mirrors (independently; see note above on avoiding a new
 *  cross-package dependency) `renderer/sea.ts`'s `DOMAIN_ANCHORS` and
 *  `data/sea.ts`'s `domainToVec`: x = formal→empirical, y = physical→living. */
const DOMAIN_CORNER: Record<DomainKey, readonly [number, number]> = {
  数理: [0, 0],
  物质: [1, 0],
  生命: [0, 1],
  交叉: [1, 1],
};

const ZH_DOMAIN_NAME: Record<DomainKey, string> = {
  数理: "数理",
  物质: "物质",
  生命: "生命",
  交叉: "交叉",
};

const EN_DOMAIN_NAME: Record<DomainKey, string> = {
  数理: "Mathematics & Formal Science",
  物质: "Matter & Physical Science",
  生命: "Life & Biological Science",
  交叉: "Crossings",
};

/**
 * Minimal island shape this projection needs — a structural subset aligned with
 * `apps/web/src/api/fallback.ts`'s `IslandDatum` (`slug`/`d`→`domain`/`x`/`y`/`out`→
 * `outlier`/`cluster`) and the server's `/api/islands` + `/api/currents` rows
 * (`domain`, `chart.x`/`chart.y`, `op`). Core stays decoupled from both API shapes —
 * callers map their real records into this one field-for-field.
 *
 * IMPORTANT: `slug` must be in the SAME identifier space as `Current.from`/`.to`
 * (both are ledger `op` ids in the server's world) — this module never compares
 * islands and currents by anything but exact string match on this field.
 */
export interface ArchipelagoIslandLike {
  /** Stable island identifier — op id or slug, whichever `currents` also uses. */
  slug: string;
  /** One of the four named domain regions, when known. Anything else (including
   *  absent) is treated as sitting at the manifold's exact center. */
  domain?: DomainKey | string;
  /** Chart coordinates — same space as fallback.ts `x`/`y` / server `chart.x/y`. */
  x: number;
  y: number;
  /** Growth/dormancy/etc — accepted for shape alignment; unused in clustering. */
  status?: string;
  /** Editorial or upstream-computed outlier flag (fallback.ts `out`). ALWAYS
   *  honored in addition to this module's own statistical detection. */
  outlier?: boolean;
  /** Real-data cluster provenance (fallback.ts `cluster`) — used only for naming. */
  cluster?: { code?: string; zh?: string; en?: string };
  /** Activity proxy (ledger eventCount / curated `activity` 0..~100). Aggregated
   *  into the region's `heat` (体温) — a data transcription, never a rank. Absent
   *  ⇒ counted as 0 (a cold region), never as "unknown". */
  activity?: number;
}

/** Curated place-plane name for a computed region (see `@frontier-isles/data`'s
 *  `REGION_NAMES` / `CuratedRegionName`). `zh`/`en` are BARE descriptors — the
 *  projection appends 群岛/Archipelago so curated and derived names read alike.
 *  Restated structurally here so `core` stays decoupled from `data` (the caller
 *  injects the table via `opts.curatedNames`; `core` never imports it). */
export interface CuratedRegionNameLike {
  zh: string;
  en: string;
  caption?: { zh: string; en: string };
}

export interface ArchipelagoOpts {
  /** Hard ceiling on cluster count regardless of island count. Default
   *  {@link DEFAULT_MAX_CLUSTERS} — raised from the v1 "~20" so a 700-island
   *  frontier reads as ~30–50 NAMED regions (xfrontier's middle tier is ~53 for
   *  1481), not a single ceiling of 20 generic blobs (docs/atlas-world-plan.md
   *  §0 pt 3 "中层太薄", §2 T1). Small N never hits the ceiling. */
  maxClusters?: number;
  /** Region count scales as `round(regionDensity · √clusterable)`, clamped to
   *  `maxClusters`. Default {@link DEFAULT_REGION_DENSITY} (≈ xfrontier's
   *  53/√1481). Higher ⇒ finer regions; lower ⇒ coarser. Legibility, not a rank. */
  regionDensity?: number;
  /** z-score threshold below the mean best-neighbor score to flag a statistical
   *  outlier (on top of any explicit `outlier: true`). Default 1.5. */
  outlierZ?: number;
  /** Relative weight of spatial proximity / domain similarity / current strength
   *  in the pairwise closeness score. */
  weights?: { spatial?: number; domain?: number; current?: number };
  /** Curated place-plane overlay (invariant 9): keyed by a region's DOMINANT
   *  member `cluster.code`. Where present, the region takes the curated
   *  descriptor + caption; otherwise its name is derived from the dominant
   *  cluster label. Injected by the caller (e.g. web wires `data.REGION_NAMES`)
   *  — this module never reaches into the data package. Purely a RE-LABEL:
   *  membership, ids, centers, radii and outliers are byte-identical with or
   *  without it. */
  curatedNames?: Record<string, CuratedRegionNameLike>;
}

/** Default ceiling on region count (see {@link ArchipelagoOpts.maxClusters}). */
export const DEFAULT_MAX_CLUSTERS = 48;
/** Default region-count density factor (see {@link ArchipelagoOpts.regionDensity}). */
export const DEFAULT_REGION_DENSITY = 1.4;

export interface Archipelago {
  /** Deterministic id derived from the sorted member slugs (content-addressed —
   *  stable across runs regardless of input array order or Map iteration order). */
  id: string;
  name: { zh: string; en: string };
  islandSlugs: string[];
  /** Chart-space centroid of the member islands. */
  center: { x: number; y: number };
  /** Chart-space radius enclosing every member (+ a fixed visual margin). */
  radius: number;
  /** Domain composition — a DESCRIPTION of the cluster's makeup (fractions sum to
   *  1), never a ranking: no leaderboard, per architecture §7 invariants. */
  domainMix: Record<DomainKey, number>;
  /** Region 体温 in [0,1] — the MEAN activity of member islands (transcribed from
   *  the ledger, exactly like an island's tide glow), mapped to a wash intensity.
   *  Mean, not sum, so a region is "warm" because its work is live, NOT because it
   *  is large — heat is temperature, never a size leaderboard (architecture §7). */
  heat: number;
  /** Optional curated one-line caption (体温/性格 of the place) — present only for
   *  regions matched by the `opts.curatedNames` place-plane overlay. */
  caption?: { zh: string; en: string };
}

export interface ArchipelagoProjection {
  archipelagos: Archipelago[];
  /** Islands that never join a cluster (variance-select semantics — depth-plan-v2
   *  §4 / depth-plan-v1 §3(c): "outlier islands always float above the bulk").
   *  Render these individually (e.g. a lighthouse/outlier glow), never folded into
   *  an archipelago blob. */
  outliers: string[];
}

const SQRT2 = Math.SQRT2;

function domainVec(domain: DomainKey | string | undefined): readonly [number, number] {
  if (domain && (DOMAIN_KEYS as readonly string[]).includes(domain)) {
    return DOMAIN_CORNER[domain as DomainKey];
  }
  return [0.5, 0.5];
}

/** Nearest of the 4 domain corners (deterministic tie-break: fixed priority order). */
function nearestDomainKey(vec: readonly [number, number]): DomainKey {
  let best: DomainKey = DOMAIN_KEYS[0]!;
  let bestDist = Infinity;
  for (const key of DOMAIN_KEYS) {
    const [cx, cy] = DOMAIN_CORNER[key];
    const d = Math.hypot(vec[0] - cx, vec[1] - cy);
    if (d < bestDist) {
      bestDist = d;
      best = key;
    }
  }
  return best;
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a} ${b}` : `${b} ${a}`;
}

/** FNV-1a 32-bit — a small, dependency-free deterministic string hash (the "hash
 *  the slug" instruction: any derived id/seed here traces back to sorted slugs,
 *  never `Date.now()`/`Math.random()`). */
function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Same FNV-1a but returning the raw 32-bit unsigned int — the deterministic seed
 *  for k-means++ (below). The "seed" clustering draws from is ALWAYS a hash of the
 *  sorted member slugs, never `Date.now`/`Math.random` (invariant 13/14). */
function fnv1aInt(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — a small dependency-free deterministic PRNG. Seeded from
 *  {@link fnv1aInt} over the sorted slug list, it makes k-means++ a pure function
 *  of the island SET (never its input order): same islands ⇒ same seed ⇒ same
 *  centers ⇒ same regions. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Prepared {
  slug: string;
  pos: readonly [number, number];
  vec: readonly [number, number];
}

function normalizePositions(islands: readonly ArchipelagoIslandLike[]): Map<string, [number, number]> {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const isl of islands) {
    if (isl.x < minX) minX = isl.x;
    if (isl.x > maxX) maxX = isl.x;
    if (isl.y < minY) minY = isl.y;
    if (isl.y > maxY) maxY = isl.y;
  }
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const out = new Map<string, [number, number]>();
  for (const isl of islands) {
    out.set(isl.slug, [(isl.x - minX) / spanX, (isl.y - minY) / spanY]);
  }
  return out;
}

function buildCurrentWeights(
  currents: readonly Pick<Current, "from" | "to" | "weight">[],
): Map<string, number> {
  const weights = new Map<string, number>();
  for (const c of currents) {
    if (c.from === c.to) continue;
    const key = pairKey(c.from, c.to);
    weights.set(key, (weights.get(key) ?? 0) + c.weight);
  }
  return weights;
}

function closenessFactory(
  prepared: ReadonlyMap<string, Prepared>,
  currentWeights: ReadonlyMap<string, number>,
  weights: Required<NonNullable<ArchipelagoOpts["weights"]>>,
) {
  // The common case (no currents supplied, or islands with no cross-island
  // relations yet) has an empty weight map — skip building the pair-key string
  // entirely on that hot path (this loop runs O(n²) times).
  const hasCurrents = currentWeights.size > 0;
  return function closeness(a: string, b: string): number {
    const pa = prepared.get(a)!;
    const pb = prepared.get(b)!;
    const posDist = Math.hypot(pa.pos[0] - pb.pos[0], pa.pos[1] - pb.pos[1]);
    const domDist = Math.hypot(pa.vec[0] - pb.vec[0], pa.vec[1] - pb.vec[1]);
    const posScore = 1 - posDist / SQRT2;
    const domScore = 1 - domDist / SQRT2;
    const curWeight = hasCurrents ? (currentWeights.get(pairKey(a, b)) ?? 0) : 0;
    const curScore = curWeight > 0 ? curWeight / (curWeight + 2) : 0;
    return weights.spatial * posScore + weights.domain * domScore + weights.current * curScore;
  };
}

interface PairScore {
  score: number;
  a: string;
  b: string;
}

/**
 * Score every unordered pair ONCE (upper triangle, O(n²/2) `closeness` calls).
 * Both outlier detection and clustering below are derived from this single array
 * instead of each re-scoring the full graph — important for the 700-island
 * performance budget (halves the dominant cost vs. scoring twice).
 */
function computeAllPairs(
  slugs: readonly string[],
  closeness: (a: string, b: string) => number,
): PairScore[] {
  const pairs: PairScore[] = [];
  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      pairs.push({ score: closeness(slugs[i]!, slugs[j]!), a: slugs[i]!, b: slugs[j]! });
    }
  }
  return pairs;
}

/** Each island's strongest single affinity to any other island, folded out of the
 *  same pair list `computeAllPairs` already built (one more O(n²/2) pass, no new
 *  `closeness` calls). */
function bestNeighborScores(slugs: readonly string[], pairs: readonly PairScore[]): Map<string, number> {
  const best = new Map<string, number>(slugs.map((s) => [s, 0]));
  for (const { score, a, b } of pairs) {
    if (score > best.get(a)!) best.set(a, score);
    if (score > best.get(b)!) best.set(b, score);
  }
  return best;
}

/**
 * Statistical outlier detection (variance-select semantics — see module docstring
 * for why this is a fresh implementation, not a reuse of prior art). An island
 * whose best-neighbor score is far below the population mean (by `outlierZ`
 * standard deviations) reads as unusually disconnected from the bulk — a
 * variance-based signal, not a rank cutoff. Needs ≥4 islands to be statistically
 * meaningful; below that, only explicit flags apply.
 */
function computeStatisticalOutliers(
  slugs: readonly string[],
  best: ReadonlyMap<string, number>,
  z: number,
): Set<string> {
  const flagged = new Set<string>();
  if (slugs.length < 4) return flagged;

  const values = [...best.values()];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);
  if (std <= 0) return flagged;

  for (const slug of slugs) {
    if (best.get(slug)! < mean - z * std) flagged.add(slug);
  }
  return flagged;
}

/* ── Balanced clustering: deterministic k-means++ / Lloyd's ─────────────────────
 * REPLACES the former single-linkage agglomeration. Single-linkage chains: at
 * N=700 it snowballed a few regions into GIANTS (168/163/149 ≈ 480 of 700 in 3
 * blobs) while stranding the rest as ordinal-suffixed slivers — a muddy blob +
 * huge labels, not a legible layered world. k-means on the SAME scored feature
 * space (normalized chart position × domain-manifold corner × current-pull drift,
 * each weighted by the same spatial/domain/current knob the closeness scorer uses)
 * minimizes within-cluster variance instead, so it yields SIZE-BALANCED, spatially
 * COMPACT regions — the eye reads ~35 comparable archipelagos.
 *
 * Determinism (invariant 13/14 — the shuffle test): every step is a pure function
 * of the SET of clusterable islands, never their input order —
 *   • points are indexed in canonical (sorted-slug) order;
 *   • k-means++ seeding draws from a mulberry32 PRNG seeded by fnv1aInt over the
 *     sorted slug list (a content hash — never Date.now/Math.random);
 *   • Lloyd assignment breaks distance ties toward the lower centroid index;
 *   • empty-cluster reseeding takes the worst-served point (max distance to its
 *     centroid), tie-broken by canonical order.
 */

interface FeaturePoint {
  slug: string;
  /** Position in the scored feature space (see {@link buildFeaturePoints}). */
  f: readonly number[];
}

/** Undirected current adjacency restricted to the clusterable set — only used to
 *  bias k-means features (below). Empty (the common case: no currents wired) ⇒ the
 *  drift term is a no-op and clustering is pure spatial × domain. */
function buildAdjacency(
  currents: readonly Pick<Current, "from" | "to" | "weight">[],
  keep: ReadonlySet<string>,
): Map<string, [string, number][]> {
  const adj = new Map<string, [string, number][]>();
  if (currents.length === 0) return adj;
  const add = (a: string, b: string, wgt: number) => {
    const list = adj.get(a);
    if (list) list.push([b, wgt]);
    else adj.set(a, [[b, wgt]]);
  };
  for (const c of currents) {
    if (c.from === c.to) continue;
    if (!keep.has(c.from) || !keep.has(c.to)) continue;
    add(c.from, c.to, c.weight);
    add(c.to, c.from, c.weight);
  }
  return adj;
}

/**
 * Per-node feature vector in the scored space: normalized chart position and
 * domain-manifold corner, each scaled by √weight so a unit of squared k-means
 * distance carries the same spatial/domain emphasis the LINEAR closeness score
 * gives it (the three `weights` knobs stay the single source of truth for
 * "what makes two islands close"). Currents, when present, pull a node's position
 * toward the weighted centroid of its current-neighbors — a bounded drift that
 * lets pairwise flow bias which region a node lands in without leaving the
 * per-node feature model k-means needs; with no currents the drift is exactly 0.
 * `slugs` MUST already be in canonical (sorted) order — the whole k-means is a
 * pure function of that ordering.
 */
function buildFeaturePoints(
  slugs: readonly string[],
  prepared: ReadonlyMap<string, Prepared>,
  adjacency: ReadonlyMap<string, ReadonlyArray<readonly [string, number]>>,
  w: Required<NonNullable<ArchipelagoOpts["weights"]>>,
): FeaturePoint[] {
  const rootS = Math.sqrt(w.spatial);
  const rootD = Math.sqrt(w.domain);
  const hasCurrents = adjacency.size > 0;
  return slugs.map((slug) => {
    const p = prepared.get(slug)!;
    let px = p.pos[0];
    let py = p.pos[1];
    if (hasCurrents) {
      const nbrs = adjacency.get(slug);
      if (nbrs && nbrs.length > 0) {
        let wsum = 0;
        let cx = 0;
        let cy = 0;
        for (const [other, weight] of nbrs) {
          const op = prepared.get(other);
          if (!op) continue;
          wsum += weight;
          cx += weight * op.pos[0];
          cy += weight * op.pos[1];
        }
        if (wsum > 0) {
          // Saturating blend, strictly < w.current (matches the closeness scorer's
          // curScore = w/(w+2) shape) so currents nudge, never dominate, geometry.
          const lambda = w.current * (wsum / (wsum + 2));
          px = (1 - lambda) * px + lambda * (cx / wsum);
          py = (1 - lambda) * py + lambda * (cy / wsum);
        }
      }
    }
    return { slug, f: [rootS * px, rootS * py, rootD * p.vec[0], rootD * p.vec[1]] };
  });
}

function sqDist(a: readonly number[], b: readonly number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i]! - b[i]!;
    s += d * d;
  }
  return s;
}

/** Deterministic k-means++ seeding (D²-weighted farthest-spread), drawing from a
 *  seeded PRNG so the same point SET always yields the same k well-spread centers
 *  — the spread is exactly what kills single-linkage's chaining. */
function kmeansPlusPlusInit(points: readonly FeaturePoint[], k: number, rng: () => number): number[] {
  const n = points.length;
  const centers: number[] = [Math.min(n - 1, Math.floor(rng() * n))];
  const d2 = points.map((p) => sqDist(p.f, points[centers[0]!]!.f));
  while (centers.length < k) {
    let sum = 0;
    for (const v of d2) sum += v;
    let next: number;
    if (sum <= 0) {
      // Remaining points all coincide with a chosen center — take the first
      // not-yet-center point in canonical order (deterministic).
      next = 0;
      while (centers.includes(next) && next < n - 1) next++;
    } else {
      let r = rng() * sum;
      next = n - 1;
      for (let i = 0; i < n; i++) {
        r -= d2[i]!;
        if (r <= 0) {
          next = i;
          break;
        }
      }
    }
    centers.push(next);
    for (let i = 0; i < n; i++) {
      const nd = sqDist(points[i]!.f, points[next]!.f);
      if (nd < d2[i]!) d2[i] = nd;
    }
  }
  return centers;
}

/**
 * Lloyd's k-means over the feature points, `target` clusters. Returns each cluster
 * as a sorted slug list (empty clusters — possible only with heavily coincident
 * points — are dropped, so the count is ≤ target, never a hard giant). Balanced by
 * construction: minimizing within-cluster squared distance splits dense areas and
 * merges sparse ones toward comparable-radius regions.
 */
function kMeansClusters(points: readonly FeaturePoint[], target: number, rng: () => number): string[][] {
  const n = points.length;
  const k = Math.max(1, Math.min(target, n));
  const dim = points[0]!.f.length;
  const centroids = kmeansPlusPlusInit(points, k, rng).map((i) => points[i]!.f.slice());
  const assign = new Array<number>(n).fill(-1);

  const MAX_ITERS = 64;
  for (let iter = 0; iter < MAX_ITERS; iter++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const d = sqDist(points[i]!.f, centroids[c]!);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      if (assign[i] !== best) {
        assign[i] = best;
        changed = true;
      }
    }

    const sums = Array.from({ length: k }, () => new Array<number>(dim).fill(0));
    const counts = new Array<number>(k).fill(0);
    for (let i = 0; i < n; i++) {
      const c = assign[i]!;
      counts[c]!++;
      const f = points[i]!.f;
      const s = sums[c]!;
      for (let d = 0; d < dim; d++) s[d]! += f[d]!;
    }
    for (let c = 0; c < k; c++) {
      if (counts[c]! > 0) {
        for (let d = 0; d < dim; d++) centroids[c]![d] = sums[c]![d]! / counts[c]!;
      } else {
        // Reseed an emptied cluster onto the worst-served point (splits the
        // largest cluster). Strict `>` keeps the lower canonical index on ties.
        let worst = -1;
        let worstD = -1;
        for (let i = 0; i < n; i++) {
          const d = sqDist(points[i]!.f, centroids[assign[i]!]!);
          if (d > worstD) {
            worstD = d;
            worst = i;
          }
        }
        if (worst >= 0) {
          centroids[c] = points[worst]!.f.slice();
          assign[worst] = c;
          changed = true;
        }
      }
    }
    if (!changed) break;
  }

  const groups: string[][] = Array.from({ length: k }, () => []);
  for (let i = 0; i < n; i++) groups[assign[i]!]!.push(points[i]!.slug);
  return groups.filter((g) => g.length > 0).map((g) => g.slice().sort());
}

function firstSegment(text: string | undefined, delimiters: readonly string[]): string | undefined {
  if (!text) return undefined;
  for (const d of delimiters) {
    const idx = text.indexOf(d);
    if (idx > 0) return text.slice(0, idx).trim();
  }
  return text.trim();
}

/** Most frequent value, tie-broken alphabetically then by first appearance. */
function mostFrequent(values: readonly string[]): string | undefined {
  if (values.length === 0) return undefined;
  const counts = new Map<string, number>();
  const firstIndex = new Map<string, number>();
  values.forEach((v, i) => {
    counts.set(v, (counts.get(v) ?? 0) + 1);
    if (!firstIndex.has(v)) firstIndex.set(v, i);
  });
  let best: string | undefined;
  for (const v of counts.keys()) {
    if (
      best === undefined ||
      counts.get(v)! > counts.get(best)! ||
      (counts.get(v) === counts.get(best) &&
        (v < best || (v === best && firstIndex.get(v)! < firstIndex.get(best)!)))
    ) {
      best = v;
    }
  }
  return best;
}

/** 8-way compass + centre, indexed by the sector of `atan2(dy, dx)` in quarter-π
 *  steps (chart y grows DOWNWARD, so +dy = 南/South). A MEANINGFUL, place-like
 *  qualifier for same-named split regions — never a Roman-numeral ordinal. */
const COMPASS: Record<number, { zh: string; en: string }> = {
  [-4]: { zh: "西部", en: "West" },
  [-3]: { zh: "西北", en: "Northwest" },
  [-2]: { zh: "北部", en: "North" },
  [-1]: { zh: "东北", en: "Northeast" },
  [0]: { zh: "东部", en: "East" },
  [1]: { zh: "东南", en: "Southeast" },
  [2]: { zh: "南部", en: "South" },
  [3]: { zh: "西南", en: "Southwest" },
  [4]: { zh: "西部", en: "West" },
};

/** Absolute last-resort suffix — reached only if the meaningful qualifiers
 *  (secondary subfield · compass · ring) somehow all collide, which the candidate
 *  space below makes practically unreachable. Kept purely so a duplicate name can
 *  never escape (correctness), NOT as the normal disambiguation path. */
const ORDINAL = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
] as const;

/** The member clusters of a region, ranked by member count (tie: zh order), as
 *  first-segment {zh,en} descriptors. rank[0] is the dominant subfield the region
 *  is already named for; rank[1] (if any) is the honest SECONDARY subfield used to
 *  give a split-sibling a distinct, meaningful name. */
function rankedClusterDescriptors(
  members: readonly string[],
  byIsland: ReadonlyMap<string, ArchipelagoIslandLike>,
): { zh: string; en: string }[] {
  const freq = new Map<string, { zh: string; en: string; c: number }>();
  for (const s of members) {
    const cl = byIsland.get(s)?.cluster;
    if (!cl?.zh && !cl?.en) continue;
    const key = `${cl.zh ?? ""}||${cl.en ?? ""}`;
    const e = freq.get(key);
    if (e) e.c++;
    else
      freq.set(key, {
        zh: firstSegment(cl.zh, ["·", "、"]) ?? "",
        en: firstSegment(cl.en, [" · ", "·"]) ?? "",
        c: 1,
      });
  }
  return [...freq.values()]
    .sort((a, b) => b.c - a.c || a.zh.localeCompare(b.zh))
    .map(({ zh, en }) => ({ zh, en }));
}

function compassOf(cx: number, cy: number, mx: number, my: number, spread: number): { zh: string; en: string } {
  const dx = cx - mx;
  const dy = cy - my;
  if (Math.hypot(dx, dy) < spread * 0.12) return { zh: "中部", en: "Central" };
  const sector = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)); // -4..4
  return COMPASS[sector] ?? { zh: "中部", en: "Central" };
}

/** Requalify a region's name by inserting `·<qual>` before the uniform place-word
 *  (群岛 / Archipelago), so curated, derived and fallback names all requalify in
 *  one register. */
function requalify(a: Archipelago, qualZh: string, qualEn: string): void {
  const zhBase = a.name.zh.endsWith("群岛") ? a.name.zh.slice(0, -2) : a.name.zh;
  a.name.zh = `${zhBase}·${qualZh}群岛`;
  const EN_SUFFIX = " Archipelago";
  const enBase = a.name.en.endsWith(EN_SUFFIX) ? a.name.en.slice(0, -EN_SUFFIX.length) : a.name.en;
  a.name.en = `${enBase} · ${qualEn} Archipelago`;
}

/**
 * Project islands + currents into named archipelagos (depth-plan-v2 §4). Pure
 * function: same islands + same currents ⇒ same output, always (invariant 13's
 * determinism extended to the sea plane per invariant 14/15). No random seed is
 * ever drawn from `Date.now`/`Math.random` — the only "seed" this module touches
 * is `fnv1a` over sorted member slugs, for the archipelago `id`.
 */
export function projectArchipelagos(
  islands: readonly ArchipelagoIslandLike[],
  currents: readonly Pick<Current, "from" | "to" | "weight">[] = [],
  opts: ArchipelagoOpts = {},
): ArchipelagoProjection {
  if (islands.length === 0) return { archipelagos: [], outliers: [] };

  const maxClusters = opts.maxClusters ?? DEFAULT_MAX_CLUSTERS;
  const regionDensity = opts.regionDensity ?? DEFAULT_REGION_DENSITY;
  const outlierZ = opts.outlierZ ?? 1.5;
  const w = {
    spatial: opts.weights?.spatial ?? 0.45,
    domain: opts.weights?.domain ?? 0.35,
    current: opts.weights?.current ?? 0.2,
  };

  const posMap = normalizePositions(islands);
  const prepared = new Map<string, Prepared>();
  const byIsland = new Map<string, ArchipelagoIslandLike>();
  for (const isl of islands) {
    byIsland.set(isl.slug, isl);
    prepared.set(isl.slug, { slug: isl.slug, pos: posMap.get(isl.slug)!, vec: domainVec(isl.domain) });
  }

  const currentWeights = buildCurrentWeights(currents);
  const closeness = closenessFactory(prepared, currentWeights, w);

  const allSlugs = islands.map((i) => i.slug);
  const allPairs = computeAllPairs(allSlugs, closeness);
  const best = bestNeighborScores(allSlugs, allPairs);

  const explicitOutliers = new Set(islands.filter((i) => i.outlier).map((i) => i.slug));
  const statisticalOutliers = computeStatisticalOutliers(allSlugs, best, outlierZ);
  const outlierSet = new Set<string>([...explicitOutliers, ...statisticalOutliers]);

  const clusterable = allSlugs.filter((s) => !outlierSet.has(s));
  const outliers = [...outlierSet].sort();

  if (clusterable.length === 0) return { archipelagos: [], outliers };

  // Region count scales ~√n (cartographic legibility: the eye reads regions, not
  // dots) but denser than a bare √n so scale reads as a real MIDDLE TIER — 700
  // islands → ~30–50 named regions, not a hard ceiling of 20 (docs/atlas-world-
  // plan.md §0 pt 3, §2 T1; xfrontier ≈ 53 regions for 1481). Clamped so small N
  // stays legible and an explicit `maxClusters` still bounds it hard.
  const target = Math.max(1, Math.min(maxClusters, Math.round(regionDensity * Math.sqrt(clusterable.length))));

  // Balanced clustering (see the k-means block above). Points are indexed in
  // canonical sorted-slug order and the PRNG is seeded from a hash of that order,
  // so `groups` is a pure function of the island SET — the shuffle test holds.
  const clusterableSet = new Set(clusterable);
  const sortedClusterable = clusterable.slice().sort();
  const adjacency = buildAdjacency(currents, clusterableSet);
  const featurePoints = buildFeaturePoints(sortedClusterable, prepared, adjacency, w);
  const rng = mulberry32(fnv1aInt(sortedClusterable.join(",")));
  const groups = kMeansClusters(featurePoints, target, rng);

  const archipelagosRaw = groups.map((slugs) => buildArchipelago(slugs, byIsland, prepared, opts.curatedNames));
  // Stable output order: by centroid x, then y, then id (so array order never
  // depends on incidental Map/Set iteration order).
  archipelagosRaw.sort(
    (a, b) => a.center.x - b.center.x || a.center.y - b.center.y || a.id.localeCompare(b.id),
  );

  disambiguateNames(archipelagosRaw, byIsland);

  return { archipelagos: archipelagosRaw, outliers };
}

/** Aggregate member activity → region 体温 in [0,1]. MEAN (not sum) so heat is a
 *  temperature, not a size rank; a fixed reference maps the curated/ledger
 *  activity scale (0..~100) onto the wash-intensity unit interval. */
const HEAT_REF = 100;

function buildArchipelago(
  slugs: readonly string[],
  byIsland: ReadonlyMap<string, ArchipelagoIslandLike>,
  prepared: ReadonlyMap<string, Prepared>,
  curatedNames?: Record<string, CuratedRegionNameLike>,
): Archipelago {
  const members = slugs.slice().sort();
  const cx = members.reduce((sum, s) => sum + byIsland.get(s)!.x, 0) / members.length;
  const cy = members.reduce((sum, s) => sum + byIsland.get(s)!.y, 0) / members.length;
  const MARGIN = 24;
  const radius =
    members.reduce((max, s) => {
      const isl = byIsland.get(s)!;
      return Math.max(max, Math.hypot(isl.x - cx, isl.y - cy));
    }, 0) + MARGIN;

  const domainMix: Record<DomainKey, number> = { 数理: 0, 物质: 0, 生命: 0, 交叉: 0 };
  for (const s of members) {
    const key = nearestDomainKey(prepared.get(s)!.vec);
    domainMix[key] += 1;
  }
  for (const key of DOMAIN_KEYS) domainMix[key] /= members.length;

  let dominant: DomainKey = DOMAIN_KEYS[0]!;
  for (const key of DOMAIN_KEYS) if (domainMix[key] > domainMix[dominant]) dominant = key;

  // 体温: mean member activity, clamped onto [0,1] (transcription, not a rank).
  const meanActivity =
    members.reduce((sum, s) => sum + (byIsland.get(s)!.activity ?? 0), 0) / members.length;
  const heat = Math.max(0, Math.min(1, meanActivity / HEAT_REF));

  // ── Hybrid naming (docs/atlas-world-plan.md §2 中层区域模型) ──────────────────
  // 1. curated place-plane overlay, keyed by the region's DOMINANT member
  //    cluster.code (invariant 9 authored layer);
  // 2. else derived from the dominant member cluster label (real cluster data);
  // 3. else a plain domain fallback (disambiguated by ordinal below).
  // The place-word (群岛 / Archipelago) is appended UNIFORMLY so all three read in
  // one register; the domain prefix is dropped (T0 already names the domain, so
  // repeating it at T1 was the "≤20 generic names" smell).
  const codes = members
    .map((s) => byIsland.get(s)!.cluster?.code)
    .filter((v): v is string => !!v);
  const dominantCode = mostFrequent(codes);
  const curated = dominantCode ? curatedNames?.[dominantCode] : undefined;

  const zhSegments = members
    .map((s) => firstSegment(byIsland.get(s)!.cluster?.zh, ["·", "、"]))
    .filter((v): v is string => !!v);
  const enSegments = members
    .map((s) => firstSegment(byIsland.get(s)!.cluster?.en, [" · ", "·"]))
    .filter((v): v is string => !!v);
  const descriptorZh = mostFrequent(zhSegments);
  const descriptorEn = mostFrequent(enSegments);

  let nameZh: string;
  let nameEn: string;
  let caption: { zh: string; en: string } | undefined;
  if (curated) {
    nameZh = `${curated.zh}群岛`;
    nameEn = `${curated.en} Archipelago`;
    caption = curated.caption;
  } else if (descriptorZh || descriptorEn) {
    nameZh = descriptorZh ? `${descriptorZh}群岛` : `${ZH_DOMAIN_NAME[dominant]}群岛`;
    nameEn = descriptorEn ? `${descriptorEn} Archipelago` : `${EN_DOMAIN_NAME[dominant]} Archipelago`;
  } else {
    nameZh = `${ZH_DOMAIN_NAME[dominant]}群岛`;
    nameEn = `${EN_DOMAIN_NAME[dominant]} Archipelago`;
  }

  const id = `arch-${fnv1a(members.join(","))}`;

  return {
    id,
    name: { zh: nameZh, en: nameEn },
    islandSlugs: members,
    center: { x: cx, y: cy },
    radius,
    domainMix,
    heat,
    ...(caption ? { caption } : {}),
  };
}

/**
 * In-place: give any archipelagos that would otherwise SHARE a name a distinct,
 * MEANINGFUL qualifier — never a Roman-numeral ordinal (the old "群岛 II/III/VIII"
 * sliver smell). Because balanced clustering makes each region one compact place,
 * collisions only happen when the SAME subfield is split across neighbouring
 * regions; the honest way to tell those apart is by what actually differs — the
 * region's own secondary subfield, or its compass position within the shared-name
 * cluster. Priority per region: secondary subfield → compass → secondary·compass →
 * compass·ring. Deterministic (group processed in centroid order); the Roman
 * ordinal survives only as an unreachable correctness backstop.
 */
function disambiguateNames(
  archipelagos: Archipelago[],
  byIsland: ReadonlyMap<string, ArchipelagoIslandLike>,
): void {
  const byZh = new Map<string, Archipelago[]>();
  for (const a of archipelagos) {
    const g = byZh.get(a.name.zh);
    if (g) g.push(a);
    else byZh.set(a.name.zh, [a]);
  }

  for (const group of byZh.values()) {
    if (group.length < 2) continue;
    // Stable order + group centroid (for compass) + spread (for the 中部 cut-off).
    const sorted = group.slice().sort(
      (a, b) => a.center.x - b.center.x || a.center.y - b.center.y || a.id.localeCompare(b.id),
    );
    const mx = sorted.reduce((s, a) => s + a.center.x, 0) / sorted.length;
    const my = sorted.reduce((s, a) => s + a.center.y, 0) / sorted.length;
    const spread = Math.max(...sorted.map((a) => Math.hypot(a.center.x - mx, a.center.y - my)), 1);

    const used = new Set<string>();
    sorted.forEach((a, i) => {
      const baseZh = a.name.zh.endsWith("群岛") ? a.name.zh.slice(0, -2) : a.name.zh;
      const ranked = rankedClusterDescriptors(a.islandSlugs, byIsland);
      // rank[0] is the shared dominant subfield; a useful secondary is a REAL other
      // subfield (never a redundant repeat of the base, e.g. "元科学·元科学").
      const secondary = ranked[1] && ranked[1].zh !== baseZh ? ranked[1] : undefined;
      const compass = compassOf(a.center.x, a.center.y, mx, my, spread);
      const ring = Math.hypot(a.center.x - mx, a.center.y - my) >= spread * 0.55
        ? { zh: "外环", en: "Outer" }
        : { zh: "内环", en: "Inner" };

      const cands: { zh: string; en: string }[] = [];
      if (secondary?.zh || secondary?.en) cands.push({ zh: secondary.zh, en: secondary.en });
      cands.push(compass);
      if (secondary?.zh || secondary?.en) {
        cands.push({ zh: `${secondary.zh}·${compass.zh}`, en: `${secondary.en} · ${compass.en}` });
      }
      cands.push({ zh: `${compass.zh}·${ring.zh}`, en: `${compass.en} · ${ring.en}` });

      let chosen = cands.find((c) => !used.has(`${baseZh}·${c.zh}群岛`));
      if (!chosen) chosen = { zh: ORDINAL[i] ?? String(i + 1), en: ORDINAL[i] ?? String(i + 1) };

      requalify(a, chosen.zh, chosen.en);
      used.add(a.name.zh);
    });
  }
}

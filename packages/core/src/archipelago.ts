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
}

export interface ArchipelagoOpts {
  /** Hard ceiling on cluster count regardless of island count (depth-plan-v2 §4:
   *  "the eye reads ~20 archipelagos"). Default 20. */
  maxClusters?: number;
  /** z-score threshold below the mean best-neighbor score to flag a statistical
   *  outlier (on top of any explicit `outlier: true`). Default 1.5. */
  outlierZ?: number;
  /** Relative weight of spatial proximity / domain similarity / current strength
   *  in the pairwise closeness score. */
  weights?: { spatial?: number; domain?: number; current?: number };
}

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

/**
 * Single-linkage agglomerative clustering (Kruskal-style), cut at exactly `target`
 * components. `pairs` is the ALREADY-SCORED (see `computeAllPairs`), pre-filtered
 * (outliers excluded) pair list — this function only sorts and unions, it never
 * calls the scorer again. Pairs are processed in DESCENDING closeness order (ties
 * broken by the lexicographically smaller pair key), unioning the strongest links
 * first, until the component count hits `target`. On a complete graph this always
 * reaches `target` exactly (for 1 ≤ target ≤ n) — no separate "merge stragglers"
 * or "split oversized cluster" pass is needed.
 */
function clusterToTarget(slugs: readonly string[], pairs: readonly PairScore[], target: number): string[][] {
  const parent = new Map<string, string>(slugs.map((s) => [s, s]));
  function find(x: string): string {
    let root = x;
    while (parent.get(root) !== root) root = parent.get(root)!;
    let cur = x;
    while (parent.get(cur) !== root) {
      const next = parent.get(cur)!;
      parent.set(cur, root);
      cur = next;
    }
    return root;
  }
  function union(a: string, b: string): boolean {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return false;
    // Union favors the lexicographically smaller root so the surviving root name
    // (used nowhere externally, but internally) is deterministic regardless of
    // input order.
    if (ra < rb) parent.set(rb, ra);
    else parent.set(ra, rb);
    return true;
  }

  let componentCount = slugs.length;
  if (componentCount > target) {
    const sorted = pairs
      .slice()
      .sort((x, y) => y.score - x.score || pairKey(x.a, x.b).localeCompare(pairKey(y.a, y.b)));

    for (const { a, b } of sorted) {
      if (componentCount <= target) break;
      if (union(a, b)) componentCount--;
    }
  }

  const groups = new Map<string, string[]>();
  for (const slug of slugs) {
    const root = find(slug);
    const g = groups.get(root);
    if (g) g.push(slug);
    else groups.set(root, [slug]);
  }
  return [...groups.values()].map((g) => g.slice().sort());
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

/** Roman-ish disambiguation suffix for archipelagos that would otherwise share a
 *  name (no cluster descriptor available). Deterministic, supports up to 20. */
const ORDINAL = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
] as const;

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

  const maxClusters = opts.maxClusters ?? 20;
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

  const clusterablePairs = allPairs.filter((p) => !outlierSet.has(p.a) && !outlierSet.has(p.b));
  const target = Math.max(1, Math.min(maxClusters, Math.round(Math.sqrt(clusterable.length))));
  const groups = clusterToTarget(clusterable, clusterablePairs, target);

  const archipelagosRaw = groups.map((slugs) => buildArchipelago(slugs, byIsland, prepared));
  // Stable output order: by centroid x, then y, then id (so array order never
  // depends on incidental Map/Set iteration order).
  archipelagosRaw.sort(
    (a, b) => a.center.x - b.center.x || a.center.y - b.center.y || a.id.localeCompare(b.id),
  );

  disambiguateNames(archipelagosRaw);

  return { archipelagos: archipelagosRaw, outliers };
}

function buildArchipelago(
  slugs: readonly string[],
  byIsland: ReadonlyMap<string, ArchipelagoIslandLike>,
  prepared: ReadonlyMap<string, Prepared>,
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

  const zhSegments = members
    .map((s) => firstSegment(byIsland.get(s)!.cluster?.zh, ["·", "、"]))
    .filter((v): v is string => !!v);
  const enSegments = members
    .map((s) => firstSegment(byIsland.get(s)!.cluster?.en, [" · ", "·"]))
    .filter((v): v is string => !!v);
  const descriptorZh = mostFrequent(zhSegments);
  const descriptorEn = mostFrequent(enSegments);

  const nameZh = descriptorZh ? `${ZH_DOMAIN_NAME[dominant]}·${descriptorZh}群岛` : `${ZH_DOMAIN_NAME[dominant]}群岛`;
  const nameEn = descriptorEn
    ? `${descriptorEn} · ${EN_DOMAIN_NAME[dominant]} Archipelago`
    : `${EN_DOMAIN_NAME[dominant]} Archipelago`;

  const id = `arch-${fnv1a(members.join(","))}`;

  return {
    id,
    name: { zh: nameZh, en: nameEn },
    islandSlugs: members,
    center: { x: cx, y: cy },
    radius,
    domainMix,
  };
}

/** In-place: append a stable ordinal suffix to any archipelagos sharing a name
 *  (only happens when no cluster descriptor disambiguated them naturally). */
function disambiguateNames(archipelagos: Archipelago[]): void {
  const byZh = new Map<string, Archipelago[]>();
  for (const a of archipelagos) {
    const g = byZh.get(a.name.zh);
    if (g) g.push(a);
    else byZh.set(a.name.zh, [a]);
  }
  for (const group of byZh.values()) {
    if (group.length < 2) continue;
    group.forEach((a, i) => {
      const suffix = ORDINAL[i] ?? String(i + 1);
      a.name.zh = `${a.name.zh} ${suffix}`;
      a.name.en = `${a.name.en} ${suffix}`;
    });
  }
}

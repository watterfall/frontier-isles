import type { CurrentKind } from "./currents";

/**
 * Climate 气候 — the domain manifold read as four named continental territories
 * (depth-plan-v2 §4, invariants 14–16; atlas-world-plan.md §2 tier T0 / §4 lane
 * W2). This is the *top* of the world map: at far overview zoom the reader should
 * see "很多领域" as a WORLD with four named continents + currents flowing between
 * them + fog on the unexplored edges — not a scatter of loose dots.
 *
 * A PURE projection — a `reduce` over island domain positions (chart coords +
 * domain assignment already held in problem-object meta / fallback DATA) and,
 * for the inter-territory flows, over the currents projection (§3). No new store,
 * no new verb (invariant 15): the same island list always yields the same field,
 * and deleting this module leaves every island individually reachable — the
 * climate field is a *reading* of where domains sit, never a gate.
 *
 * Three data transcriptions, each answering "what data do I transcribe?":
 *   1. Territories — each domain's islands reduce to ONE soft continental region
 *      (centroid + spread), named for the domain. Invariant 16: the four domains
 *      are named *regions* of one manifold, not buckets; the four unit-square
 *      corners (x = formal→empirical, y = physical→living) are the anchors.
 *   2. Fog — a coarse density grid; a cell far from any island hazes over. Fog is
 *      a FOCUS aid (depth-plan-v1/v2), never a wall: it marks the unexplored /
 *      empty edges and lifts wherever content sits. Deterministic.
 *   3. Continent currents — cross-domain ledger relations (projectCurrents, §3)
 *      aggregated by endpoint domain into inter-territory flows. Invariant 14:
 *      no current without an event. Same-domain currents stay intra-continent.
 *
 * The unit-square corner table is restated locally — mirroring archipelago.ts's
 * `DOMAIN_CORNER`, renderer sea.ts's `DOMAIN_ANCHORS`, and data domainToVec —
 * to avoid a new cross-module dependency (same rationale those modules give).
 */

/** The four named regions of the domain manifold (mirrors archipelago.ts). */
export type DomainKey = "数理" | "物质" | "生命" | "交叉";

const DOMAIN_KEYS: readonly DomainKey[] = ["数理", "物质", "生命", "交叉"];

/** Unit-square manifold corners (x = formal→empirical, y = physical→living). */
const DOMAIN_CORNER: Record<DomainKey, readonly [number, number]> = {
  数理: [0, 0],
  物质: [1, 0],
  生命: [0, 1],
  交叉: [1, 1],
};

/** Editorial territory names — authored zh (invariant 9) with an en gloss. The
 *  four domains named as *regions* of the manifold (invariant 16). */
const TERRITORY_NAME: Record<DomainKey, { zh: string; en: string }> = {
  数理: { zh: "数理·形式科学", en: "Formal Sciences" },
  物质: { zh: "物质·物理科学", en: "Physical Sciences" },
  生命: { zh: "生命·生物科学", en: "Life Sciences" },
  交叉: { zh: "交叉·跨域", en: "Cross-disciplinary" },
};

function isDomainKey(d: DomainKey | string | undefined): d is DomainKey {
  return d !== undefined && (DOMAIN_KEYS as readonly string[]).includes(d);
}

/** One island as the climate projection consumes it — chart coords + domain (a
 *  coordinate, not a label — invariant 16) + an activity/dormancy proxy. */
export interface ClimateIslandLike {
  slug: string;
  domain?: DomainKey | string;
  /** Chart coordinates — same space as fallback.ts `x`/`y` / server `chart.x/y`. */
  x: number;
  y: number;
  /** Activity proxy (event count) — summed into a territory's "temperature". */
  eventCount?: number;
  dormant?: boolean;
}

export interface ClimateTerritory {
  domain: DomainKey;
  /** Authored zh + en gloss (invariant 9). */
  name: { zh: string; en: string };
  /** Unit-square manifold position of this domain's corner (invariant 16). */
  manifold: readonly [number, number];
  /** Chart-space centroid of member islands (where the continent sits). */
  center: { x: number; y: number };
  /** Chart-space half-extents covering members + margin (an elliptical wash). */
  extent: { x: number; y: number };
  /** Chart-space radius enclosing every member (+ margin) — the wash's reach. */
  radius: number;
  islandCount: number;
  liveCount: number;
  /** Σ eventCount over members — the territory's activity aggregate ("前沿天气"). */
  activity: number;
}

/** A coarse density cell — chart-space haze over an unexplored/empty region. */
export interface FogCell {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Fog opacity 0..1 — 0 = clear (content here), 1 = unexplored haze. */
  fog: number;
}

export interface ClimateBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface ClimateField {
  /** One territory per domain that has ≥1 island, in fixed DOMAIN_KEYS order. */
  territories: ClimateTerritory[];
  /** Bounding box of all islands (chart space). */
  bounds: ClimateBounds;
  /** Coarse density grid over bounds+margin; empty/edge cells haze (focus aid). */
  fog: FogCell[];
  totalIslands: number;
  liveIslands: number;
  /** Σ activity across all islands — the world's aggregate "前沿天气" readout. */
  totalActivity: number;
}

export interface ClimateOptions {
  /** Approx. chart px per fog cell (grid resolution). Default 160. */
  fogCell?: number;
  /** Margin (chart px) added around the island bbox for the fog frontier. Default 340. */
  fogMargin?: number;
  /** Distance (in fog-cell units) from the nearest island at/under which a cell
   *  is fully clear; fog ramps to full haze by `fogFar` cells out. */
  fogNear?: number;
  fogFar?: number;
  /** Extra margin (chart px) added to each territory's member spread. Default 96. */
  territoryMargin?: number;
}

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Hermite smoothstep — a soft 0→1 ramp (no hard fog wall). */
const smoothstep = (t: number): number => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/**
 * Reduce a list of islands into the far-tier climate field: four named
 * territories (one per populated domain), a fog density grid, and the aggregate
 * activity readout. Deterministic and order-independent (invariant 13): the same
 * island multiset always yields the same field.
 */
export function projectClimate(
  islands: readonly ClimateIslandLike[],
  opts: ClimateOptions = {},
): ClimateField {
  if (islands.length === 0) {
    return {
      territories: [],
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
      fog: [],
      totalIslands: 0,
      liveIslands: 0,
      totalActivity: 0,
    };
  }

  // Bounding box over every island.
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let liveIslands = 0;
  let totalActivity = 0;
  for (const i of islands) {
    if (i.x < minX) minX = i.x;
    if (i.x > maxX) maxX = i.x;
    if (i.y < minY) minY = i.y;
    if (i.y > maxY) maxY = i.y;
    if (!i.dormant) liveIslands += 1;
    totalActivity += i.eventCount ?? 0;
  }
  const bounds: ClimateBounds = { minX, minY, maxX, maxY };

  // Group by domain (islands without a known domain sit on no continent — they
  // are still individually reachable; the field just does not name them).
  const territoryMargin = opts.territoryMargin ?? 96;
  const byDomain = new Map<DomainKey, ClimateIslandLike[]>();
  for (const i of islands) {
    if (!isDomainKey(i.domain)) continue;
    const list = byDomain.get(i.domain);
    if (list) list.push(i);
    else byDomain.set(i.domain, [i]);
  }

  const territories: ClimateTerritory[] = [];
  for (const domain of DOMAIN_KEYS) {
    const members = byDomain.get(domain);
    if (!members || members.length === 0) continue;
    let sx = 0;
    let sy = 0;
    let activity = 0;
    let live = 0;
    for (const m of members) {
      sx += m.x;
      sy += m.y;
      activity += m.eventCount ?? 0;
      if (!m.dormant) live += 1;
    }
    const cx = sx / members.length;
    const cy = sy / members.length;
    let halfW = 0;
    let halfH = 0;
    let radius = 0;
    for (const m of members) {
      halfW = Math.max(halfW, Math.abs(m.x - cx));
      halfH = Math.max(halfH, Math.abs(m.y - cy));
      radius = Math.max(radius, Math.hypot(m.x - cx, m.y - cy));
    }
    territories.push({
      domain,
      name: TERRITORY_NAME[domain],
      manifold: DOMAIN_CORNER[domain],
      center: { x: cx, y: cy },
      extent: { x: halfW + territoryMargin, y: halfH + territoryMargin },
      radius: radius + territoryMargin,
      islandCount: members.length,
      liveCount: live,
      activity,
    });
  }

  return {
    territories,
    bounds,
    fog: buildFog(islands, bounds, opts),
    totalIslands: islands.length,
    liveIslands,
    totalActivity,
  };
}

/**
 * A coarse density grid over the island bbox expanded by `fogMargin`. Each cell's
 * fog = smoothstep of its distance to the nearest island (in cell units): cells
 * sitting on content are clear, the empty margin hazes to full. Deterministic; a
 * focus aid, never a wall (its consumer caps the drawn alpha well under 1).
 */
function buildFog(
  islands: readonly ClimateIslandLike[],
  bounds: ClimateBounds,
  opts: ClimateOptions,
): FogCell[] {
  const cell = opts.fogCell ?? 160;
  const margin = opts.fogMargin ?? 340;
  const near = opts.fogNear ?? 0.7;
  const far = opts.fogFar ?? 2.4;
  const x0 = bounds.minX - margin;
  const y0 = bounds.minY - margin;
  const x1 = bounds.maxX + margin;
  const y1 = bounds.maxY + margin;
  const cols = Math.max(1, Math.ceil((x1 - x0) / cell));
  const rows = Math.max(1, Math.ceil((y1 - y0) / cell));
  // Radial feather: mist rings the explored area then fades back to blank paper
  // toward the grid's outer edge (no hard fog band — "off the map" reads as
  // unexplored blank, not a wall). Centre + max radius of the padded grid.
  const gcx = (x0 + x1) / 2;
  const gcy = (y0 + y1) / 2;
  const maxR = Math.hypot((x1 - x0) / 2, (y1 - y0) / 2) || 1;
  const cells: FogCell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = x0 + (c + 0.5) * cell;
      const py = y0 + (r + 0.5) * cell;
      let best = Infinity;
      for (const isl of islands) {
        const d = Math.hypot(isl.x - px, isl.y - py);
        if (d < best) best = d;
      }
      const density = smoothstep((best / cell - near) / (far - near));
      // Feather: full inside 60% of the radius, ramped to 0 by the outer edge.
      const feather = 1 - smoothstep((Math.hypot(px - gcx, py - gcy) / maxR - 0.62) / 0.34);
      cells.push({ x: x0 + c * cell, y: y0 + r * cell, w: cell, h: cell, fog: density * feather });
    }
  }
  return cells;
}

/** A cross-domain relation aggregated to the continent scale — a flow between
 *  two named territories (invariant 14: every flow traces to real events). */
export interface ContinentFlow {
  /** Domain endpoints, ordered by fixed DOMAIN_KEYS priority (a span, not an arrow). */
  from: DomainKey;
  to: DomainKey;
  kind: CurrentKind;
  /** Σ of the underlying currents' weights (event flux across the two domains). */
  weight: number;
}

function domainRank(d: DomainKey): number {
  return DOMAIN_KEYS.indexOf(d);
}

/**
 * Reduce the ledger currents (§3, keyed by island `op`) into inter-territory
 * flows: for every current whose two endpoints resolve to *different* domains,
 * accumulate its weight onto the (unordered domain-pair × kind) bucket. Same-
 * domain currents are intra-continent and produce no continent flow. `domainOf`
 * maps a current endpoint (`op`/slug) → its domain; endpoints with no known
 * domain are skipped (invariant 14 — a flow needs both territories to exist).
 * Deterministic: output sorted by (from, to, kind).
 */
export function projectContinentCurrents(
  currents: readonly { from: string; to: string; kind: CurrentKind; weight: number }[],
  domainOf: (op: string) => DomainKey | string | undefined,
): ContinentFlow[] {
  const agg = new Map<string, ContinentFlow>();
  for (const cur of currents) {
    const a = domainOf(cur.from);
    const b = domainOf(cur.to);
    if (!isDomainKey(a) || !isDomainKey(b)) continue;
    if (a === b) continue; // intra-continent — not an inter-territory flow
    const [d1, d2] = domainRank(a) <= domainRank(b) ? [a, b] : [b, a];
    const key = `${d1}|${d2}|${cur.kind}`;
    const prev = agg.get(key);
    if (prev) prev.weight += cur.weight;
    else agg.set(key, { from: d1, to: d2, kind: cur.kind, weight: cur.weight });
  }
  return [...agg.values()].sort((x, y) => {
    const rx = domainRank(x.from) - domainRank(y.from);
    if (rx !== 0) return rx;
    const ry = domainRank(x.to) - domainRank(y.to);
    if (ry !== 0) return ry;
    return x.kind < y.kind ? -1 : x.kind > y.kind ? 1 : 0;
  });
}

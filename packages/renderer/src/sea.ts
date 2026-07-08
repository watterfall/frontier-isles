/**
 * Headless sea-plane math (depth-plan-v2 §4/§6) — the horizontal mirror of iso.ts.
 *
 * Climate is the domain manifold: an island's ambient hue is a bilinear blend of
 * the four frozen `--fi-domain-*` anchors, and sea depth (darkness) reads its
 * abstractness. Currents are laid out as splines with ONE shared LOD/cull
 * threshold so far-zoom trunk-culling agrees with the island cull. No PixiJS, no
 * new hue — this module returns token names + weights + geometry only; the paint
 * happens in the SVG/Pixi layer against the existing `--fi-*` tokens.
 */

/** The four domain regions of the manifold (named regions, not buckets — inv. 16). */
export type DomainKey = "math" | "matter" | "life" | "cross";

export type Vec2 = [number, number];

/**
 * Unit-square anchors. Orientation (documented): x = formal→empirical,
 * y = physical→living. 数理 formal-physical, 物质 empirical-physical,
 * 生命 formal-living, 交叉 empirical-living. Each carries the frozen token name
 * (never a literal hue) so callers paint with `var(<token>)`.
 */
export const DOMAIN_ANCHORS: Record<DomainKey, { corner: Vec2; token: string }> = {
  math: { corner: [0, 0], token: "--fi-domain-math-fill" },
  matter: { corner: [1, 0], token: "--fi-domain-matter-fill" },
  life: { corner: [0, 1], token: "--fi-domain-life-fill" },
  cross: { corner: [1, 1], token: "--fi-domain-cross-fill" },
};

const DOMAIN_KEYS: readonly DomainKey[] = ["math", "matter", "life", "cross"];

/** Frozen token fallbacks (mirror tokens.css --fi-domain-*-fill) for headless callers. */
export const DOMAIN_FALLBACK: Record<DomainKey, string> = {
  math: "#C9D8E6",
  matter: "#E8CFAE",
  life: "#C6DECC",
  cross: "#ECDFB4",
};

export interface DomainMix {
  /** Bilinear weights over the four anchors; sum ≈ 1. */
  weights: Record<DomainKey, number>;
  /** The four anchors with their weight and token name, in DomainKey order. */
  anchors: { key: DomainKey; token: string; weight: number }[];
  /** The heaviest region — the island's "home" domain and its base fill token. */
  dominant: DomainKey;
  /**
   * A paintable fill for the island AT this manifold point: `var(<dominant
   * token>, <fallback>)`. Sampling `domainHueAt(coord).fill` for an island's
   * body makes its hue == its manifold position BY CONSTRUCTION — island and sea
   * are painted from the SAME function, so they can never drift into different
   * regions. Still a real token (no new hue); a future IDW can return an exact
   * blended hex without changing this contract.
   */
  fill: string;
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

/**
 * Bilinear interpolation of the four `--fi-domain-*` anchors at a manifold point.
 * Returns weights + anchor token names (NOT a mixed hex) — the gradient blend is
 * done by the renderer over real tokens, so no new hue is ever minted.
 */
export function domainHueAt(vec: Vec2): DomainMix {
  const x = clamp01(vec[0]);
  const y = clamp01(vec[1]);
  const weights: Record<DomainKey, number> = {
    math: (1 - x) * (1 - y),
    matter: x * (1 - y),
    life: (1 - x) * y,
    cross: x * y,
  };
  const anchors = DOMAIN_KEYS.map((key) => ({
    key,
    token: DOMAIN_ANCHORS[key].token,
    weight: weights[key],
  }));
  let dominant: DomainKey = "math";
  for (const k of DOMAIN_KEYS) if (weights[k] > weights[dominant]) dominant = k;
  const fill = `var(${DOMAIN_ANCHORS[dominant].token}, ${DOMAIN_FALLBACK[dominant]})`;
  return { weights, anchors, dominant, fill };
}

/** Max darkening alpha of the deepest (most abstract) water. */
export const SEA_DEPTH_MAX_ALPHA = 0.42;

export interface SeaDepth {
  /**
   * Abstractness in [0,1] (0 = shallow/applied, 1 = deep/formal), or `null` when
   * no substrate score exists — render NO darkness rather than fake a depth.
   */
  depth: number | null;
  /** Darkening alpha to overlay on `--fi-water`; 0 when depth is null. */
  overlayAlpha: number;
}

/**
 * Sea depth = domain abstractness (depth-plan-v2 §4). It reads a REAL substrate /
 * frontier-abstractness score — deliberately NOT the domain-hue vec, so depth is
 * an independent axis, never a rotated-hue duplicate. When no score is available
 * (`null`/`undefined`/NaN) depth is `null` and nothing is darkened: honest absence
 * beats decoration. Darkness only — never a new hue.
 */
export function seaDepthAt(substrate: number | null | undefined): SeaDepth {
  if (substrate == null || Number.isNaN(substrate)) return { depth: null, overlayAlpha: 0 };
  const depth = clamp01(substrate);
  return { depth, overlayAlpha: depth * SEA_DEPTH_MAX_ALPHA };
}

/**
 * Shared level-of-detail thresholds. At `zoom < farZoom` only *trunk* currents
 * (weight ≥ `trunkMinWeight`) survive — the far-zoom "only trunk currents between
 * archipelagos" rule (§6). Exported so the cull is a single testable constant,
 * the same discipline as the island viewport cull.
 */
export const CURRENT_LOD = { farZoom: 0.5, trunkMinWeight: 3 } as const;

/** Structural shape a current must have to be laid out (kept dependency-free of core). */
export interface CurrentLike {
  from: string;
  to: string;
  kind: string;
  weight: number;
  directed: boolean;
}

export interface CurrentPath {
  current: CurrentLike;
  from: Vec2;
  to: Vec2;
  /** Quadratic-spline control point (perpendicular bow so parallel edges fan). */
  control: Vec2;
  /** `M … Q …` path string ready for SVG or Pixi. */
  d: string;
  /** False when culled at the current zoom (below trunk weight at far zoom). */
  visible: boolean;
}

/**
 * Lay out currents as quadratic splines between island screen positions. Edges
 * whose endpoints are missing from `positions` are dropped (an unplaced island
 * carries no current). Parallel edges bow to alternating sides so they read as
 * distinct flows. `visible` applies the shared far-zoom trunk cull.
 */
export function layoutCurrents(
  currents: readonly CurrentLike[],
  positions: ReadonlyMap<string, Vec2> | Record<string, Vec2>,
  opts: { zoom?: number } = {},
): CurrentPath[] {
  const lookup = (op: string): Vec2 | undefined =>
    positions instanceof Map ? positions.get(op) : (positions as Record<string, Vec2>)[op];
  const zoom = opts.zoom;
  const out: CurrentPath[] = [];

  currents.forEach((c, i) => {
    const a = lookup(c.from);
    const b = lookup(c.to);
    if (!a || !b) return;

    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const bow = (18 + c.weight * 4) * (i % 2 === 0 ? 1 : -1);
    const control: Vec2 = [mx + (-dy / len) * bow, my + (dx / len) * bow];
    const d = `M ${a[0]} ${a[1]} Q ${control[0].toFixed(2)} ${control[1].toFixed(2)} ${b[0]} ${b[1]}`;

    const culled = zoom !== undefined && zoom < CURRENT_LOD.farZoom && c.weight < CURRENT_LOD.trunkMinWeight;
    out.push({ current: c, from: a, to: b, control, d, visible: !culled });
  });

  return out;
}

/**
 * Navigable ferry-route bridges between visually-adjacent islands. Each bridge
 * is a real cross-domain isomorphism (xfrontier audit/isomorphisms.json): two
 * islands whose clusters share a mathematical skeleton, connected by a short
 * arc on the chart. Clicking a bridge sails the ferry along the arc to the
 * far island (§4: the ferryman's routes follow the routing economy).
 *
 * The formula is the bridge's inscription — "why this route exists" (the same
 * equation has the same solution, per Feynman). Bridges are short arcs between
 * adjacent islands so the chart stays clean and the routes feel navigable.
 */

export interface BridgeEntry {
  /** The two islands (by slug) this bridge connects. */
  from: string;
  to: string;
  /** Chart coordinates of the two endpoints. */
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  /** Quadratic-Bezier control point (the arc's bulge). */
  arc: { cx: number; cy: number };
  /** The shared mathematical skeleton (real formula, rendered as inscription). */
  formula: string;
  /** Bilingual label for the skeleton. */
  skeleton: { zh: string; en: string };
}

export const BRIDGES: BridgeEntry[] = [
  {
    from: 'bio-compute-thermo',
    to: 'tabletop-quantum-gravity',
    fromPos: { x: 290, y: 385 },
    toPos: { x: 395, y: 435 },
    arc: { cx: 360, cy: 390 },
    formula: '∇²φ = 0',
    skeleton: { zh: '拉普拉斯方程', en: "Laplace's equation" },
  },
  {
    from: 'dark-matter-paleo',
    to: 'bio-compute-thermo',
    fromPos: { x: 330, y: 245 },
    toPos: { x: 290, y: 385 },
    arc: { cx: 370, cy: 300 },
    formula: '∂u/∂t = D∇²u',
    skeleton: { zh: '扩散–热方程', en: 'Diffusion–heat equation' },
  },
  {
    from: 'active-inference',
    to: 'ai-theory-discovery',
    fromPos: { x: 556, y: 428 },
    toPos: { x: 502, y: 584 },
    arc: { cx: 590, cy: 510 },
    formula: 'F = ⟨E⟩ − T·S',
    skeleton: { zh: '自由能最小化', en: 'Free-energy minimization' },
  },
];

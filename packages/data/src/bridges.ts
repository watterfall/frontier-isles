/**
 * Real cross-domain bridges — isomorphisms from the xfrontier atlas
 * (audit/isomorphisms.json: 36 Feynman "same-equation" bridges). Each bridge
 * links two curated islands whose clusters share a mathematical skeleton; the
 * formula is a real glyph to render on the bridge plaque (§4: bridges are
 * proposed by members or the ferryman; §6: provenance visible).
 *
 * These replace the prototype's 3 fictional chart bridges with data-driven
 * bridges carrying real formulas — "the same equation has the same solution"
 * (Feynman), made visible as the ferry-route geometry between islands.
 */

export interface BridgeEntry {
  /** The two islands (by slug) this bridge connects. */
  from: string;
  to: string;
  /** Chart coordinates of the two endpoints. */
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  /** The shared mathematical skeleton (real formula). */
  formula: string;
  /** Bilingual label for the skeleton. */
  skeleton: { zh: string; en: string };
  /** Quadratic-control point for the arc (midpoint offset for curvature). */
  arc: { cx: number; cy: number };
  /** Label position. */
  labelPos: { x: number; y: number };
}

export const BRIDGES: BridgeEntry[] = [
  {
    from: 'bio-compute-thermo',
    to: 'tabletop-quantum-gravity',
    fromPos: { x: 290, y: 385 },
    toPos: { x: 395, y: 435 },
    formula: '∇²φ = 0',
    skeleton: { zh: '拉普拉斯方程', en: "Laplace's equation" },
    arc: { cx: 360, cy: 390 },
    labelPos: { x: 360, y: 360 },
  },
  {
    from: 'active-inference',
    to: 'ai-theory-discovery',
    fromPos: { x: 556, y: 428 },
    toPos: { x: 502, y: 584 },
    formula: 'F = ⟨E⟩ − T·S',
    skeleton: { zh: '自由能最小化', en: 'Free-energy minimization' },
    arc: { cx: 580, cy: 510 },
    labelPos: { x: 580, y: 510 },
  },
  {
    from: 'minimal-genome',
    to: 'ai-theory-discovery',
    fromPos: { x: 835, y: 338 },
    toPos: { x: 502, y: 584 },
    formula: 'ẋ_i = x_i(f_i − ⟨f⟩)',
    skeleton: { zh: '复制者动力学', en: 'Replicator dynamics' },
    arc: { cx: 700, cy: 420 },
    labelPos: { x: 700, y: 420 },
  },
];

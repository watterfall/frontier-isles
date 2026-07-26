/**
 * Navigable ferry-route bridges between visually-adjacent islands. Each bridge
 * is a curated cross-problem mathematical analogy (xfrontier
 * audit/isomorphisms.json); it may connect two problems inside the same broad
 * chart domain. Cross-domain claims live in the richer structure graph, where
 * correspondences, predictions, evidence, and transfer boundaries are explicit.
 * Clicking a bridge sails the ferry along the arc to the far island
 * (§4: the ferryman's routes follow the routing economy).
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
  // ISO-07: directed evolution reweights catalyst variants by relative
  // performance, just as evolutionary games reweight behavioural strategies.
  {
    from: 'abiological-metalloenzyme-catalysis',
    to: 'evolutionary-dynamics-norms-trust',
    fromPos: { x: 560, y: 520 },
    toPos: { x: 830, y: 620 },
    arc: { cx: 710, cy: 530 },
    formula: 'ẋᵢ = xᵢ(fᵢ − ⟨f⟩)',
    skeleton: { zh: 'ISO-07 · 复制者动力学', en: 'ISO-07 · Replicator dynamics' },
  },
  // ISO-09: both instruments read a matter-wave phase accumulated from the
  // action, while testing different gravitational observables.
  {
    from: 'cold-atom-gravity-gradiometry',
    to: 'atom-interferometry-screened-scalars',
    fromPos: { x: 438, y: 344 },
    toPos: { x: 730, y: 455 },
    arc: { cx: 610, cy: 365 },
    formula: 'Δφ = ΔS/ℏ ; δS = 0',
    skeleton: {
      zh: 'ISO-09 · 最小作用量与变分原理',
      en: 'ISO-09 · Least action & variational principles',
    },
  },
  // ISO-18: a stochastic processing unit and a p-bit array both encode a
  // constrained target distribution as a physical equilibrium sampler.
  {
    from: 'thermodynamic-linear-algebra',
    to: 'p-bit-probabilistic-computing',
    fromPos: { x: 235, y: 335 },
    toPos: { x: 370, y: 570 },
    arc: { cx: 340, cy: 430 },
    formula: 'p ∝ exp(−Σ λₖfₖ)',
    skeleton: { zh: 'ISO-18 · 最大熵推断', en: 'ISO-18 · Maximum-entropy inference' },
  },
  // ISO-24: learned elastic responses and bioelectric target anatomy are both
  // memories expressed as relaxation toward a stable attractor.
  {
    from: 'learning-shape-metamaterials',
    to: 'bioelectric-morphogenesis-basal-cognition',
    fromPos: { x: 310, y: 470 },
    toPos: { x: 728, y: 520 },
    arc: { cx: 525, cy: 440 },
    formula: 'E = −½Σ wᵢⱼsᵢsⱼ',
    skeleton: {
      zh: 'ISO-24 · 吸引子网络与能量地形',
      en: 'ISO-24 · Attractor networks & energy landscapes',
    },
  },
  // ISO-25: sparse autoencoders reconstruct biological-model activations from
  // a small feature set; SINDy reconstructs governing equations from few terms.
  {
    from: 'biological-foundation-model-mechanistic-interpretability',
    to: 'ai-theory-discovery',
    fromPos: { x: 612, y: 210 },
    toPos: { x: 502, y: 584 },
    arc: { cx: 500, cy: 380 },
    formula: 'min ‖z‖₁  s.t.  h ≈ Dz',
    skeleton: {
      zh: 'ISO-25 · 稀疏编码与压缩感知',
      en: 'ISO-25 · Sparse coding & compressed sensing',
    },
  },
  // ISO-32 replaces a tempting but unsupported ISO-05 power-law bridge: typed
  // claims make the A–B–C links mined at disciplinary fissures executable.
  {
    from: 'machine-actionable-research-findings',
    to: 'mining-disciplinary-fissures-atlas-of',
    fromPos: { x: 495, y: 455 },
    toPos: { x: 889, y: 501 },
    arc: { cx: 700, cy: 420 },
    formula: 'A→B ∧ B→C ⇒ A→C?',
    skeleton: {
      zh: 'ISO-32 · 文献发现与知识图传递链接',
      en: 'ISO-32 · Literature discovery & transitive link prediction',
    },
  },
];

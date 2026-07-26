/**
 * Cross-island relation seed spec (depth-plan-v2 §3). The seeded ledger's events
 * are all island-LOCAL (each `ref` hashes a payload unique to its island), so the
 * shared-ref join yields an EMPTY sea by omission — there are simply no real
 * cross-island relations in the base seed. This spec is the honest fix: a small,
 * story-coherent web of REAL relations where a reactor island's event carries an
 * ANCHOR island's artifact ref. The server seed materializes each as a genuine
 * ledger event (real anchor ref); the web fallback synthesizes the SAME events so
 * projectCurrents produces an identical sea online and offline (UI-identical rule).
 *
 * Slugs and their available artifacts come from @frontier-isles/data FRONTIERS:
 * stage ≥ 3 islands carry a `publish`; stage ≥ 2 islands carry a `submit_claim`.
 * No new verb — every relation reuses an existing ledger action (invariant 15).
 *
 * Derived-current snapshot (kept current with the table below):
 *   33 raw relation events → 26 currents
 *   evidence 10 (affirm 6 · contest 4) · lineage 9 · bridge 7
 *   bridge maturity: ratified 4 · proposed 3 · whirlpools 4
 *   Wave 2 contribution: 24 events touch 24 new islands; 16 events cross domains.
 */

export type SeaVerb =
  | 'validate'
  | 'refute'
  | 'fork'
  | 'merge_back'
  | 'bridge_propose'
  | 'bridge_accept';

export interface SeaSeedRelation {
  /** Slug whose artifact ref is referenced (the current's anchor). */
  anchor: string;
  /** Slug that emits the reacting event (the current's reactor). */
  reactor: string;
  verb: SeaVerb;
  /** Which of the anchor's artifacts to reference. */
  artifact: 'claim' | 'publish';
  /** Why this is a methodological/evidential relation rather than lexical similarity. */
  rationale: string;
}

/**
 * The seeded relational web. A bridge is proposed by a different reactor and is
 * ratified only when the anchor island emits `bridge_accept` against the same
 * artifact ref. The accept row therefore uses reactor === anchor and projects no
 * extra self-current; it only changes the proposal's maturity.
 */
export const SEA_SEED_RELATIONS: SeaSeedRelation[] = [
  {
    anchor: 'living-wires',
    reactor: 'self-learning-matter',
    verb: 'fork',
    artifact: 'publish',
    rationale: 'Local electrical feedback in living conductors becomes a testable local-update rule for adaptive resistor networks.',
  },
  {
    anchor: 'living-wires',
    reactor: 'self-learning-matter',
    verb: 'merge_back',
    artifact: 'publish',
    rationale: 'Trained resistor networks return a controlled test of whether local feedback is sufficient for distributed material learning.',
  },
  {
    anchor: 'living-wires',
    reactor: 'bio-compute-thermo',
    verb: 'validate',
    artifact: 'claim',
    rationale: 'Measured conduction and adaptation costs provide an empirical test of thermodynamic bounds on biological information processing.',
  },
  {
    anchor: 'living-wires',
    reactor: 'compositional-modeling',
    verb: 'refute',
    artifact: 'claim',
    rationale: 'History-dependent conductance across tissue boundaries contests models that assume independently composable subsystem interfaces.',
  },
  {
    anchor: 'miyake-anchors',
    reactor: 'code-dark-matter',
    verb: 'validate',
    artifact: 'claim',
    rationale: 'Absolute event-year anchors constrain the age of archived samples used to infer when recoded viral lineages appeared.',
  },
  {
    anchor: 'self-learning-matter',
    reactor: 'animal-ai-decode',
    verb: 'refute',
    artifact: 'claim',
    rationale: 'Learning in a non-symbolic physical network contests the inference that adaptive signal decoding alone implies latent grammar.',
  },
  // ferryman bridge: propose from miyake onto living-wires' publish, accepted by living-wires → ratified
  {
    anchor: 'living-wires',
    reactor: 'miyake-anchors',
    verb: 'bridge_propose',
    artifact: 'publish',
    rationale: 'Both systems treat living material as durable infrastructure that records and transports otherwise transient physical signals.',
  },
  {
    anchor: 'living-wires',
    reactor: 'living-wires',
    verb: 'bridge_accept',
    artifact: 'publish',
    rationale: 'The living-wires anchor ratifies the shared living-material signal-storage analogy against its published artifact.',
  },
  // ferryman bridge: proposed only (a strait, not yet an isthmus)
  {
    anchor: 'miyake-anchors',
    reactor: 'animal-ai-decode',
    verb: 'bridge_propose',
    artifact: 'claim',
    rationale: 'Rare external events could provide synchronization anchors for comparing animal vocal changes across distant archives.',
  },

  // Wave 2 · collective knowledge loops: ranking rules and structured findings
  // fork into governance/translation, then return empirical failure cases.
  {
    anchor: 'bridging-ranking-crowd-fact-checking',
    reactor: 'collective-alignment-democratic-ai-governance',
    verb: 'fork',
    artifact: 'claim',
    rationale: 'Cross-group bridging scores become an aggregation rule for compiling deliberated public input into model constitutions.',
  },
  {
    anchor: 'bridging-ranking-crowd-fact-checking',
    reactor: 'collective-alignment-democratic-ai-governance',
    verb: 'merge_back',
    artifact: 'claim',
    rationale: 'Minority-impact audits from constitutional governance return failure cases that recalibrate the bridging objective.',
  },
  {
    anchor: 'machine-actionable-research-findings',
    reactor: 'untranslated-knowledge-observatory',
    verb: 'fork',
    artifact: 'claim',
    rationale: 'Provenance-bearing claim objects give multilingual retrieval a common unit for comparing evidence across scripts and databases.',
  },
  {
    anchor: 'machine-actionable-research-findings',
    reactor: 'untranslated-knowledge-observatory',
    verb: 'merge_back',
    artifact: 'claim',
    rationale: 'Translation reversals expose missing qualifiers and return schema corrections to the machine-actionable claim graph.',
  },

  // Wave 2 · measurement and causal transfer: each reactor supplies a concrete
  // test, estimator, or negative control for the anchor's claim.
  {
    anchor: 'volcano-muography-time-lapse',
    reactor: 'convergent-cross-mapping-causal-transfer',
    verb: 'fork',
    artifact: 'claim',
    rationale: 'Convergent cross-mapping is transplanted as a falsifiable test of whether density changes lead, rather than merely track, volcanic unrest.',
  },
  {
    anchor: 'biological-foundation-model-mechanistic-interpretability',
    reactor: 'construct-validity-evaluation-science',
    verb: 'validate',
    artifact: 'claim',
    rationale: 'Convergent, discriminant, and predictive validity tests check whether sparse features recover unseen biological mechanisms rather than training correlations.',
  },
  {
    anchor: 'ruminant-enteric-methane-mitigation',
    reactor: 'enhanced-rock-weathering-mrv',
    verb: 'fork',
    artifact: 'claim',
    rationale: 'Mass-balance MRV and leakage accounting transfer from methane interventions to net-removal claims in heterogeneous farm fields.',
  },
  {
    anchor: 'construct-validity-evaluation-science',
    reactor: 'brain-foundation-models-neural-digital-twins',
    verb: 'validate',
    artifact: 'claim',
    rationale: 'Held-out animals, brain regions, and stimuli supply an external invariance test for whether a neural benchmark measures biology or apparatus bias.',
  },
  {
    anchor: 'automated-partial-identification-bounds',
    reactor: 'causal-evaluation-human-ai-decisions',
    verb: 'validate',
    artifact: 'claim',
    rationale: 'Principal-strata decision effects provide a real deployment setting in which sharp bounds can be checked against randomized advice experiments.',
  },
  {
    anchor: 'one-run-empirical-privacy-auditing',
    reactor: 'population-edna-human-genetic-bycatch',
    verb: 'fork',
    artifact: 'claim',
    rationale: 'Canary-style lower-bound audits transfer to measuring how much identifiable human sequence leaks through an ecological sampling pipeline.',
  },
  {
    anchor: 'multi-agent-steganographic-collusion',
    reactor: 'collective-alignment-democratic-ai-governance',
    verb: 'fork',
    artifact: 'claim',
    rationale: 'Covert-channel capacity tests become a manipulation audit for supposedly independent participants and summarizers in AI deliberation.',
  },
  {
    anchor: 'physical-interposer-confidential-computing',
    reactor: 'organoid-provenance-dynamic-consent',
    verb: 'fork',
    artifact: 'claim',
    rationale: 'Attested memory integrity transfers into wetware-cloud access control so consent state cannot be replayed or silently replaced.',
  },
  {
    anchor: 'universal-ml-interatomic-potentials',
    reactor: 'abiological-metalloenzyme-catalysis',
    verb: 'refute',
    artifact: 'claim',
    rationale: 'Non-natural Ru, Ce, and Au coordination environments are an out-of-domain stress test that contests uncalibrated claims of potential universality.',
  },
  {
    anchor: 'thermodynamic-linear-algebra',
    reactor: 'reversible-adiabatic-cmos',
    verb: 'fork',
    artifact: 'claim',
    rationale: 'Full-system energy accounting for resonant clocks transfers as the necessary control for stochastic-circuit linear-algebra advantage claims.',
  },
  {
    anchor: 'photonic-probabilistic-vacuum-noise',
    reactor: 'thermodynamic-linear-algebra',
    verb: 'refute',
    artifact: 'claim',
    rationale: 'A classical equilibrium sampler supplies the end-to-end null that contests photonic advantage when modulation, readout, and correlation are counted.',
  },
  {
    anchor: 'cold-atom-gravity-gradiometry',
    reactor: 'volcano-muography-time-lapse',
    verb: 'validate',
    artifact: 'claim',
    rationale: 'Independent gravity-gradient measurements test whether muographic opacity changes correspond to real subsurface mass redistribution.',
  },

  // Wave 2 · bridges. Accept rows deliberately reference the anchor claim itself:
  // projectCurrents uses them only to ratify the matching proposal.
  {
    anchor: 'one-run-empirical-privacy-auditing',
    reactor: 'physical-interposer-confidential-computing',
    verb: 'bridge_propose',
    artifact: 'claim',
    rationale: 'Both fields squeeze a theoretical security promise with an experimentally demonstrated lower bound on attacker capability.',
  },
  {
    anchor: 'one-run-empirical-privacy-auditing',
    reactor: 'one-run-empirical-privacy-auditing',
    verb: 'bridge_accept',
    artifact: 'claim',
    rationale: 'The privacy-audit anchor ratifies empirical lower-bound testing as the shared skeleton for software and hardware guarantees.',
  },
  {
    anchor: 'construct-validity-evaluation-science',
    reactor: 'brain-foundation-models-neural-digital-twins',
    verb: 'bridge_propose',
    artifact: 'claim',
    rationale: 'Measurement invariance links prompt-robust AI evaluation to animal-, region-, and stimulus-robust neural digital-twin evaluation.',
  },
  {
    anchor: 'machine-actionable-research-findings',
    reactor: 'organoid-provenance-dynamic-consent',
    verb: 'bridge_propose',
    artifact: 'claim',
    rationale: 'Signed, versioned provenance objects can carry both scientific assertions and enforceable consent restrictions through a lineage.',
  },
  {
    anchor: 'machine-actionable-research-findings',
    reactor: 'machine-actionable-research-findings',
    verb: 'bridge_accept',
    artifact: 'claim',
    rationale: 'The research-graph anchor ratifies a shared provenance-object skeleton for evidence and governed biological material.',
  },
  {
    anchor: 'automated-partial-identification-bounds',
    reactor: 'enhanced-rock-weathering-mrv',
    verb: 'bridge_propose',
    artifact: 'claim',
    rationale: 'Sharp feasible intervals are a common honest output when causal effects or carbon removal cannot be point-identified from incomplete measurements.',
  },
  {
    anchor: 'cold-atom-gravity-gradiometry',
    reactor: 'volcano-muography-time-lapse',
    verb: 'bridge_propose',
    artifact: 'claim',
    rationale: 'Atom phase and muon attenuation are independent carriers of the same inverse problem: recovering subsurface density change.',
  },
  {
    anchor: 'cold-atom-gravity-gradiometry',
    reactor: 'cold-atom-gravity-gradiometry',
    verb: 'bridge_accept',
    artifact: 'claim',
    rationale: 'The gravity-sensing anchor ratifies joint inversion as a shared density-imaging skeleton rather than a superficial sensor analogy.',
  },
];

/** Map a domain to a manifold coordinate in the unit square (renderer domainHueAt corners). */
export function domainToVec(domain: string): [number, number] {
  switch (domain) {
    case '数理':
      return [0.12, 0.14];
    case '物质':
      return [0.86, 0.16];
    case '生命':
      return [0.14, 0.86];
    case '交叉':
      return [0.86, 0.86];
    default:
      return [0.5, 0.5];
  }
}

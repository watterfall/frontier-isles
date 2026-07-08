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
 * stage ≥ 3 islands (living-wires, miyake-anchors) carry a `publish`; stage ≥ 2
 * islands carry a `submit_claim`. No new verb — every relation reuses an existing
 * ledger action (invariant 15).
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
}

/**
 * The seeded relational web. Derived currents (via projectCurrents):
 *   lineage   living-wires → self-learning-matter        (fork + merge_back) w2
 *   evidence  living-wires → bio-compute-thermo   affirm  (validate)         w1
 *   evidence  living-wires → compositional-modeling contest (refute)         w1  ← disputed
 *   evidence  miyake-anchors → code-dark-matter   affirm  (validate)         w1
 *   evidence  self-learning-matter → animal-ai-decode contest (refute)       w1  ← disputed
 *   bridge    living-wires → miyake-anchors  ratified (propose+accept)       w1
 *   bridge    miyake-anchors → animal-ai-decode proposed (propose only)      w1
 * Whirlpools: living-wires ↔ compositional-modeling · self-learning-matter ↔ animal-ai-decode.
 */
export const SEA_SEED_RELATIONS: SeaSeedRelation[] = [
  { anchor: 'living-wires', reactor: 'self-learning-matter', verb: 'fork', artifact: 'publish' },
  { anchor: 'living-wires', reactor: 'self-learning-matter', verb: 'merge_back', artifact: 'publish' },
  { anchor: 'living-wires', reactor: 'bio-compute-thermo', verb: 'validate', artifact: 'claim' },
  { anchor: 'living-wires', reactor: 'compositional-modeling', verb: 'refute', artifact: 'claim' },
  { anchor: 'miyake-anchors', reactor: 'code-dark-matter', verb: 'validate', artifact: 'claim' },
  { anchor: 'self-learning-matter', reactor: 'animal-ai-decode', verb: 'refute', artifact: 'claim' },
  // ferryman bridge: propose from miyake onto living-wires' publish, accepted by living-wires → ratified
  { anchor: 'living-wires', reactor: 'miyake-anchors', verb: 'bridge_propose', artifact: 'publish' },
  { anchor: 'living-wires', reactor: 'living-wires', verb: 'bridge_accept', artifact: 'publish' },
  // ferryman bridge: proposed only (a strait, not yet an isthmus)
  { anchor: 'miyake-anchors', reactor: 'animal-ai-decode', verb: 'bridge_propose', artifact: 'claim' },
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

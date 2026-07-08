import type { LedgerEvent, ActionType, Phase } from "@frontier-isles/opp";

/**
 * A hand-shaped 6-island ledger for the sea-plane projections. Cross-island
 * relations are encoded the only way the schema allows — a shared `ref` (content
 * hash) appearing under two different `op` islands (see core/src/currents.ts).
 * No projection ever names an island id; every current below is DERIVED from the
 * refs these events share. Shared by core's currents test and the composed plate.
 */

const ORG = "op://frontier-isles/prob";
export const RIEMANN = `${ORG}/riemann`;
export const FOLDING = `${ORG}/folding`;
export const COHERENCE = `${ORG}/coherence`;
export const ENTROPY = `${ORG}/entropy`;
export const CATALYSIS = `${ORG}/catalysis`;
export const EMERGENCE = `${ORG}/emergence`;

let clock = 0;
function ev(op: string, action: ActionType, phase: Phase, ref?: string): LedgerEvent {
  clock += 1;
  const ts = new Date(Date.UTC(2026, 3, 1, 0, clock)).toISOString();
  return {
    ts,
    op,
    actor: { id: "github:seed", kind: "human" },
    credit: [],
    phase,
    action,
    ...(ref ? { ref } : {}),
  };
}

const sha = (tag: string) => `sha256:${tag.padEnd(64, "0")}`;
const R1 = sha("claim-riemann-critical-line");
const R2 = sha("pub-riemann-zeta-method");
const R3 = sha("claim-coherence-decoherence");
const R4 = sha("claim-folding-energy-landscape");
const R5 = sha("claim-catalysis-turnover");
const R6 = sha("claim-entropy-arrow");
const R7 = sha("claim-riemann-zero-spacing");

/**
 * The ledger. Each island keeps its own verbs; the join is purely `ref`-shared.
 * Expected derived currents (all traceable to specific events) — note affirm and
 * contest are DISTINCT signed edges, never merged:
 *   evidence/affirm   RIEMANN→FOLDING    (folding validates R1)                 w1
 *   evidence/contest  RIEMANN→FOLDING    (folding refutes R7 — SAME pair!)      w1
 *   evidence/contest  RIEMANN→COHERENCE  (coherence refutes R1)                 w1
 *   lineage/neutral   RIEMANN→ENTROPY    (entropy forks + merges back R2)       w2
 *   bridge/neutral    COHERENCE→CATALYSIS(catalysis proposes, coherence accepts) ratified w1
 *   bridge/neutral    FOLDING→EMERGENCE  (emergence proposes R4, no accept)     proposed w1
 *   evidence/contest  CATALYSIS→EMERGENCE(emergence refutes R5)                 w1
 *   evidence/affirm   ENTROPY→CATALYSIS  (catalysis validates R6 twice)         w2
 *   evidence/affirm   ENTROPY→EMERGENCE  (emergence validates R6)              w1
 * Whirlpools (a refute storms; a validation never calms it — invariant 8):
 *   RIEMANN ↔ COHERENCE (R1 validated by folding AND refuted by coherence = DISPUTE) w1
 *   RIEMANN ↔ FOLDING   (R7 refuted by folding)                                      w1
 *   CATALYSIS ↔ EMERGENCE (R5 refuted by emergence)                                  w1
 */
export const SEA_EVENTS: LedgerEvent[] = [
  // R1 — a Riemann claim, validated by folding AND refuted by coherence = a DISPUTE
  ev(RIEMANN, "submit_claim", "D", R1),
  ev(FOLDING, "validate", "D", R1),
  ev(COHERENCE, "refute", "D", R1),
  // R2 — a Riemann method, forked then merged back by entropy (lineage w2)
  ev(RIEMANN, "publish", "B", R2),
  ev(ENTROPY, "fork", "A", R2),
  ev(ENTROPY, "merge_back", "D", R2),
  // R3 — a coherence claim bridged from catalysis, then accepted (ratified bridge)
  ev(COHERENCE, "submit_claim", "D", R3),
  ev(CATALYSIS, "bridge_propose", "B", R3),
  ev(COHERENCE, "bridge_accept", "B", R3),
  // R4 — a folding claim, only proposed from emergence (proposed bridge / strait)
  ev(FOLDING, "submit_claim", "D", R4),
  ev(EMERGENCE, "bridge_propose", "B", R4),
  // R5 — a catalysis claim refuted by emergence, never validated → whirlpool
  ev(CATALYSIS, "submit_claim", "D", R5),
  ev(EMERGENCE, "refute", "D", R5),
  // R6 — an entropy claim validated twice by catalysis, once by emergence
  ev(ENTROPY, "submit_claim", "D", R6),
  ev(CATALYSIS, "validate", "D", R6),
  ev(CATALYSIS, "validate", "D", R6),
  ev(EMERGENCE, "validate", "D", R6),
  // R7 — a second Riemann claim REFUTED by folding: folding both affirms (R1) and
  // contests (R7) Riemann, so RIEMANN→FOLDING has two distinct signed currents.
  ev(RIEMANN, "submit_claim", "D", R7),
  ev(FOLDING, "refute", "D", R7),
];

/** Refs exposed so tests can delete-by-ref and assert traceability. */
export const SEA_REFS = { R1, R2, R3, R4, R5, R6, R7 };

/**
 * Rendering metadata (place plane): manifold coordinate + screen position, plus
 * an OPTIONAL `substrate` abstractness score. Sea depth reads `substrate`, NOT
 * the hue vec (so depth is never a rotated-hue duplicate). Islands without a
 * score render NO darkness — honest absence beats decoration.
 */
export interface SeaIsland {
  op: string;
  name: string;
  /** Domain-manifold coordinate in the unit square (see renderer domainHueAt). */
  vec: [number, number];
  /** Screen position within the composed-plate viewBox. */
  pos: [number, number];
  variant: 0 | 1 | 2 | 3 | 4;
  /** Frontier-substrate abstractness in [0,1] (place plane). Omitted = no score. */
  substrate?: number;
}

export const SEA_ISLANDS: SeaIsland[] = [
  { op: RIEMANN, name: "op://…/riemann", vec: [0.08, 0.12], pos: [150, 150], variant: 0, substrate: 0.85 },
  { op: FOLDING, name: "op://…/folding", vec: [0.15, 0.9], pos: [190, 330], variant: 2, substrate: 0.35 },
  { op: COHERENCE, name: "op://…/coherence", vec: [0.82, 0.2], pos: [420, 130], variant: 1, substrate: 0.6 },
  { op: ENTROPY, name: "op://…/entropy", vec: [0.45, 0.5], pos: [330, 250], variant: 3, substrate: 0.5 },
  // catalysis & emergence have NO substrate score → they render no sea-depth darkness
  { op: CATALYSIS, name: "op://…/catalysis", vec: [0.9, 0.55], pos: [560, 300], variant: 4 },
  { op: EMERGENCE, name: "op://…/emergence", vec: [0.6, 0.95], pos: [470, 380], variant: 1 },
];

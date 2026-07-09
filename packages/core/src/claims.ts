import type { ActionType, LedgerEvent } from "@frontier-isles/opp";

/**
 * Per-claim epistemic projection (M4.3, scene-upgrade). A building is a claim
 * (decision D2), and its FORM is a `reduce` over the ledger — no new verb, no
 * relation store (architecture §7, depth-plan §14). Each content-addressed `ref`
 * that carries a `submit_claim` or `publish` becomes one growing building:
 *
 *   - foundation ← the claim/record exists publicly (submit_claim | publish)
 *   - floors     ← distinct OTHER islands that `validate` it (independent
 *                  reproductions; a self-validate is not independent)
 *   - roof       ← floors ≥ CONSENSUS_MIN (domain consensus)
 *   - ghost      ← a `refute` (rejected) or `return_to_driftwood` (shelved) turns
 *                  the building into a night ghost — never deleted (P5)
 *
 * Mirrors ./currents.ts: groups by `ref`, picks a deterministic anchor island,
 * never mutates its input, and does not touch the place plane.
 */

/** Distinct independent reproductions needed for consensus → a roof (approved: 5). */
export const CONSENSUS_MIN = 5;

/** A claim's building state, reduced from the ledger. */
export interface ClaimState {
  /** Content-addressed claim id (`sha256:…`). */
  ref: string;
  /** Anchor island `op` — where the claim originated. */
  island: string;
  /** Public claim/record present (preprint / open data). */
  foundation: boolean;
  /** Independent reproductions = distinct other islands that validated it → floors. */
  floors: number;
  /** Domain consensus reached (floors ≥ {@link CONSENSUS_MIN}). */
  roof: boolean;
  /** Abandoned/refuted → a night ghost (P5). `refute` wins over `return_to_driftwood`. */
  ghost?: "refuted" | "returned";
  /** Published → a persistent identifier (DOI lamp attachment). */
  hasDoi: boolean;
  /** Events over this claim — a recency/activity proxy (firefly/lab density, M8). */
  activity: number;
}

/** Verbs that *originate* a referenced artifact — the anchor end (mirrors currents.ts). */
const ANCHOR_ACTIONS: ReadonlySet<ActionType> = new Set<ActionType>([
  "submit_claim",
  "publish",
  "adopt",
  "propose_subquestion",
  "found_island",
  "bridge_artifact",
  "return_to_driftwood",
  "night_digest",
]);

/**
 * Deterministic anchor island for a ref-group: the earliest ANCHOR-action event
 * (min `ts`, `op` breaks ties); if none, the earliest event overall. Order-independent.
 */
function pickAnchor(group: readonly LedgerEvent[]): string {
  let anchor: LedgerEvent | undefined;
  for (const e of group) {
    if (!ANCHOR_ACTIONS.has(e.action)) continue;
    if (!anchor || e.ts < anchor.ts || (e.ts === anchor.ts && e.op < anchor.op)) anchor = e;
  }
  if (anchor) return anchor.op;
  let first = group[0]!;
  for (const e of group) if (e.ts < first.ts || (e.ts === first.ts && e.op < first.op)) first = e;
  return first.op;
}

/**
 * Project the ledger into per-claim building states (M4.3). Only refs carrying a
 * `submit_claim` or `publish` become buildings (D2: a building is a claim). Stable
 * order by `ref`; never mutates its input.
 */
export function projectClaimState(events: readonly LedgerEvent[]): ClaimState[] {
  const byRef = new Map<string, LedgerEvent[]>();
  for (const e of events) {
    if (!e.ref) continue;
    const g = byRef.get(e.ref);
    if (g) g.push(e);
    else byRef.set(e.ref, [e]);
  }

  const out: ClaimState[] = [];
  for (const [ref, group] of byRef) {
    const foundation = group.some((e) => e.action === "submit_claim" || e.action === "publish");
    if (!foundation) continue; // not a claim/record → not a building

    const island = pickAnchor(group);
    const validators = new Set<string>();
    for (const e of group) if (e.action === "validate" && e.op !== island) validators.add(e.op);
    const floors = validators.size;

    const refuted = group.some((e) => e.action === "refute");
    const returned = group.some((e) => e.action === "return_to_driftwood");
    const ghost: ClaimState["ghost"] = refuted ? "refuted" : returned ? "returned" : undefined;

    out.push({
      ref,
      island,
      foundation,
      floors,
      roof: floors >= CONSENSUS_MIN,
      ghost,
      hasDoi: group.some((e) => e.action === "publish"),
      activity: group.length,
    });
  }
  return out.sort((a, b) => a.ref.localeCompare(b.ref));
}

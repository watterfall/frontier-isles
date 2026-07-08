import type { ActionType, LedgerEvent } from "@frontier-isles/opp";

/**
 * Sea-plane projections (depth-plan-v2 §3, invariants 14–15). The horizontal
 * sea between islands is data too: relations become typed, weighted, directional,
 * SIGNED **currents** and unresolved disputes become **whirlpools** — a pure
 * `reduce` over the SAME ledger verbs, introducing *no new verb and no relation
 * store* (invariant 15). Mirrors ./projections.ts: nothing here mutates its
 * input; nothing depends on the place plane.
 *
 * ── How a cross-island relation is encoded ──────────────────────────────────
 * A ledger event is per-island (its `op://…` id IS the island). The schema
 * carries NO explicit target-island field. What it DOES carry is `ref` — a
 * content-addressed `sha256:…` pointer to an artifact (§5). Two islands that
 * reference the SAME artifact are related, so a current is the **content-addressed
 * join**: a `ref` under two distinct `op` islands. The referenced artifact's
 * island is the *anchor* (origin); an island whose event reacts to that ref is
 * the *reactor*, and the current flows anchor→reactor. No hardcoded island ids.
 *
 * ── The epistemic sign is first-class (invariant 8) ─────────────────────────
 * A validation and a refutation are OPPOSITE acts — agreement vs dissent. They
 * must never collapse to one "evidence" edge, or the system loses the ability to
 * show that a claim is contested and decays into rewarding safe convergence. So
 * every current carries a `sign` (affirm/contest/neutral) and affirm-vs-contest
 * between the same pair are DISTINCT currents, keyed apart.
 */

/** Relation type, reusing the token palette by kind (never a new hue). */
export type CurrentKind = "evidence" | "bridge" | "lineage";

/** Epistemic sign: support, dissent, or neither (invariant 8). */
export type CurrentSign = "affirm" | "contest" | "neutral";

/** A proposed bridge is a strait (water); a ratified bridge is an isthmus (land) — §3. */
export type CurrentMaturity = "proposed" | "ratified";

export interface Current {
  /** Anchor island `op` — where the referenced artifact originated. */
  from: string;
  /** Reactor island `op` — which forked/validated/refuted/bridged onto it. */
  to: string;
  kind: CurrentKind;
  /** affirm (validate) · contest (refute) · neutral (bridge/lineage). */
  sign: CurrentSign;
  /** Event count backing this edge (citations / refutations / transplant flux). */
  weight: number;
  /** Evidence & lineage flow one way; a bridge is a mutual span (no arrow). */
  directed: boolean;
  /** Bridge-only: proposed (strait) vs ratified (isthmus). Undefined elsewhere. */
  maturity?: CurrentMaturity;
}

/**
 * A contested cluster — a claim's ref carrying an open `refute`, placed BETWEEN
 * the claim's island and the refuter (§3). A validation elsewhere does NOT calm
 * it: a claim that is both validated and refuted is the very definition of a
 * dispute, and must render as one (invariant 8). Only resolving/removing the
 * refutation stills the water.
 */
export interface Whirlpool {
  /** `[claim-anchor op, refuter op]` — the two sides of the dispute. */
  between: [string, string];
  /** The contested claim refs, sorted. */
  refs: string[];
  /** Open-refute count = contention magnitude. */
  weight: number;
}

/** The reacting verbs → the current kind and epistemic sign each transcribes (§3). */
const REACTOR: Partial<Record<ActionType, { kind: CurrentKind; sign: CurrentSign }>> = {
  validate: { kind: "evidence", sign: "affirm" },
  refute: { kind: "evidence", sign: "contest" },
  bridge_propose: { kind: "bridge", sign: "neutral" },
  bridge_accept: { kind: "bridge", sign: "neutral" },
  fork: { kind: "lineage", sign: "neutral" },
  merge_back: { kind: "lineage", sign: "neutral" },
  transplant: { kind: "lineage", sign: "neutral" },
};

/** Verbs that *originate* a referenced artifact — the anchor end of a current. */
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

const DIRECTED_KINDS: ReadonlySet<CurrentKind> = new Set<CurrentKind>(["evidence", "lineage"]);

/** Group events by `ref` (events without a ref carry no cross-island relation). */
function groupByRef(events: readonly LedgerEvent[]): Map<string, LedgerEvent[]> {
  const byRef = new Map<string, LedgerEvent[]>();
  for (const e of events) {
    if (!e.ref) continue;
    const g = byRef.get(e.ref);
    if (g) g.push(e);
    else byRef.set(e.ref, [e]);
  }
  return byRef;
}

/**
 * Deterministic anchor island for a ref-group: the earliest ANCHOR-action event
 * (min `ts`, `op` breaks ties); if none, the earliest event overall. Independent
 * of input order.
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

interface EdgeAcc {
  from: string;
  to: string;
  kind: CurrentKind;
  sign: CurrentSign;
  weight: number;
  ratifiedBridge: boolean;
}

/**
 * Project the ledger into cross-island currents (depth-plan-v2 §3). Groups events
 * by `ref`; for each ref emits anchor→reactor edges for every reacting event on a
 * *different* island, keyed by `${from} ${to} ${kind} ${sign}` so an affirm and a
 * contest between the same pair stay DISTINCT currents. `maturity` is set only for
 * bridges (proposed until a `bridge_accept` shares the ref). Stable order.
 */
export function projectCurrents(events: readonly LedgerEvent[]): Current[] {
  const edges = new Map<string, EdgeAcc>();

  for (const group of groupByRef(events).values()) {
    const anchorOp = pickAnchor(group);
    const ratifiedBridge = group.some((e) => e.action === "bridge_accept");
    for (const e of group) {
      const r = REACTOR[e.action];
      if (!r) continue;
      if (e.op === anchorOp) continue; // a reactor must be a different island
      const key = `${anchorOp} ${e.op} ${r.kind} ${r.sign}`;
      const acc = edges.get(key);
      if (acc) acc.weight += 1;
      else edges.set(key, { from: anchorOp, to: e.op, kind: r.kind, sign: r.sign, weight: 1, ratifiedBridge });
    }
  }

  const out: Current[] = [];
  for (const a of edges.values()) {
    const current: Current = {
      from: a.from,
      to: a.to,
      kind: a.kind,
      sign: a.sign,
      weight: a.weight,
      directed: DIRECTED_KINDS.has(a.kind),
    };
    // maturity is a bridge-only concept (strait vs isthmus); undefined otherwise.
    if (a.kind === "bridge") current.maturity = a.ratifiedBridge ? "ratified" : "proposed";
    out.push(current);
  }
  return out.sort(
    (x, y) =>
      x.from.localeCompare(y.from) ||
      x.to.localeCompare(y.to) ||
      x.kind.localeCompare(y.kind) ||
      x.sign.localeCompare(y.sign),
  );
}

interface DisputeAcc {
  between: [string, string];
  refs: Set<string>;
  weight: number;
}

/**
 * Project whirlpools (depth-plan-v2 §3, invariant 8). Any open `refute` over a
 * ref storms — a claim that is validated by one island and refuted by another is
 * a DISPUTE, placed BETWEEN the claim's anchor island and the refuter. Weight =
 * open-refute count. A validation (here or on a third island) does NOT calm it;
 * only removing the refutation does. Refutes without a `ref` cannot be sited and
 * are skipped. Stable order.
 */
export function projectWhirlpools(events: readonly LedgerEvent[]): Whirlpool[] {
  const disputes = new Map<string, DisputeAcc>();

  for (const group of groupByRef(events).values()) {
    const refuters = group.filter((e) => e.action === "refute");
    if (refuters.length === 0) continue;
    const anchorOp = pickAnchor(group);
    for (const e of refuters) {
      // A sea whirlpool is a dispute BETWEEN islands (§3). A refute of an
      // island's OWN claim is internal weather, not a sea vortex — skip it.
      if (e.op === anchorOp) continue;
      const ref = e.ref!; // groupByRef only keeps events with a ref
      const key = `${anchorOp} ${e.op}`;
      let acc = disputes.get(key);
      if (!acc) {
        acc = { between: [anchorOp, e.op], refs: new Set(), weight: 0 };
        disputes.set(key, acc);
      }
      acc.refs.add(ref);
      acc.weight += 1;
    }
  }

  const out: Whirlpool[] = [];
  for (const d of disputes.values()) out.push({ between: d.between, refs: [...d.refs].sort(), weight: d.weight });
  return out.sort(
    (a, b) => a.between[0].localeCompare(b.between[0]) || a.between[1].localeCompare(b.between[1]),
  );
}

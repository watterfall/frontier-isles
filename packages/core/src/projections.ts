import {
  reduceNightScience,
  type Actor,
  type ActionType,
  type ActorKind,
  type FlowType,
  type LedgerEvent,
  type Status,
} from "@frontier-isles/opp";
import type { AtomType } from "./atoms";
import type { StationKind } from "./stations";

/**
 * Pure projections over the ledger (architecture.md §4, invariant 7: all reads
 * are projections). Nothing here mutates its input; nothing depends on the
 * place plane.
 */

/** Actions that place a countable artifact (drive growth; denominator of transplant rate). */
const ARTIFACT_ACTIONS: ReadonlySet<ActionType> = new Set<ActionType>([
  "propose_subquestion",
  "bridge_artifact",
  "submit_claim",
  "transplant",
  "publish",
  "adopt",
  "fork",
  "merge_back",
  "return_to_driftwood",
  "night_digest",
]);

/** Which station an action touches (for multi-station / academy detection). */
const ACTION_STATION: Partial<Record<ActionType, StationKind>> = {
  found_island: "questions",
  propose_subquestion: "questions",
  fork: "questions",
  submit_claim: "workshop",
  refute: "workshop",
  validate: "workshop",
  bridge_artifact: "dock",
  bridge_propose: "dock",
  bridge_accept: "dock",
  transplant: "dock",
  return_to_driftwood: "driftwood",
  night_digest: "driftwood",
  publish: "gallery",
  adopt: "gallery",
  merge_back: "gallery",
};

const DAY_MS = 86_400_000;

// ---------------------------------------------------------------------------
// projectGrowth
// ---------------------------------------------------------------------------

export type GrowthStage = "empty" | "hut" | "academy" | "school";
export type Ending = "none" | "mist" | "lighthouse";

export interface GrowthState {
  stage: GrowthStage;
  dormant: boolean;
  ending: Ending;
}

export interface GrowthOptions {
  /** Reference "now" for dormancy; without it dormancy cannot be judged. */
  now?: string | number | Date;
  /** Days without any event before an island is dormant (default 30). */
  dormantDays?: number;
  /** Object status drives the ending (endings are not ledger actions). */
  status?: Status;
}

/**
 * Project the growth stage (architecture.md §4). Driven only by ledger events:
 * first artifacts → hut, activity across ≥3 stations → academy, fork children
 * or publications → school. Dormancy and endings are layered on top.
 */
export function projectGrowth(
  events: readonly LedgerEvent[],
  options: GrowthOptions = {},
): GrowthState {
  let hasArtifact = false;
  let hasSchool = false;
  const stations = new Set<StationKind>();
  let lastMs = Number.NEGATIVE_INFINITY;

  for (const e of events) {
    if (ARTIFACT_ACTIONS.has(e.action)) hasArtifact = true;
    if (e.action === "fork" || e.action === "publish") hasSchool = true;
    const station = ACTION_STATION[e.action];
    if (station) stations.add(station);
    const ms = new Date(e.ts).getTime();
    if (!Number.isNaN(ms) && ms > lastMs) lastMs = ms;
  }

  let stage: GrowthStage = "empty";
  if (hasArtifact) stage = "hut";
  if (stations.size >= 3) stage = "academy";
  if (hasSchool) stage = "school";

  let dormant = false;
  if (options.now !== undefined && events.length > 0 && lastMs > Number.NEGATIVE_INFINITY) {
    const nowMs = new Date(options.now).getTime();
    dormant = (nowMs - lastMs) / DAY_MS > (options.dormantDays ?? 30);
  }

  const ending: Ending =
    options.status === "dissolved" ? "mist" : options.status === "resolved" ? "lighthouse" : "none";

  return { stage, dormant, ending };
}

// ---------------------------------------------------------------------------
// projectDayView
// ---------------------------------------------------------------------------

export interface CuratedArtifact {
  action: "publish" | "adopt";
  ts: string;
  actor: Actor;
  ref?: string;
  credit: string[];
}

/**
 * The Day view: only artifacts published or adopted into the Gallery — the sole
 * source of the daytime view (architecture.md §3).
 */
export function projectDayView(events: readonly LedgerEvent[]): CuratedArtifact[] {
  return events
    .filter((e): e is LedgerEvent & { action: "publish" | "adopt" } =>
      e.action === "publish" || e.action === "adopt",
    )
    .map((e) => ({ action: e.action, ts: e.ts, actor: e.actor, ref: e.ref, credit: e.credit }))
    .sort((a, b) => a.ts.localeCompare(b.ts));
}

// ---------------------------------------------------------------------------
// projectNightReplay
// ---------------------------------------------------------------------------

export type GhostReason = "returned" | "refuted";

export interface Ghost {
  reason: GhostReason;
  atom: AtomType;
}

export interface ReplaySlice {
  index: number;
  event: LedgerEvent;
  /** Present when this event leaves a ghost in the night layer. */
  ghost?: Ghost;
}

/**
 * Full ledger replay on a time-ordered timeline (architecture.md §4). Returned
 * to driftwood or refuted claims leave typed ghosts. `upTo` limits the replay
 * to the first N slices (the draggable timeline position).
 *
 * Ghost atom typing is best-effort from the action alone (the ledger event does
 * not itself carry the atom kind): refutations become `contradiction`, returns
 * default to `thought`.
 */
export function projectNightReplay(
  events: readonly LedgerEvent[],
  upTo?: number,
): ReplaySlice[] {
  const sorted = [...events].sort((a, b) => a.ts.localeCompare(b.ts));
  const limit = upTo ?? sorted.length;
  return sorted.slice(0, limit).map((event, index) => {
    let ghost: Ghost | undefined;
    if (event.action === "return_to_driftwood") ghost = { reason: "returned", atom: "thought" };
    else if (event.action === "refute") ghost = { reason: "refuted", atom: "contradiction" };
    return ghost ? { index, event, ghost } : { index, event };
  });
}

// ---------------------------------------------------------------------------
// computeTide
// ---------------------------------------------------------------------------

export interface Tide {
  A: number;
  B: number;
  D: number;
  /** Night-science model: N = A − D. Feeds the tide/moon visual. */
  N: number;
}

export function computeTide(events: readonly LedgerEvent[]): Tide {
  const { A, B, D } = reduceNightScience(events);
  return { A, B, D, N: A - D };
}

// ---------------------------------------------------------------------------
// projectContributions
// ---------------------------------------------------------------------------

/** A-phase (divergence) contributions are weighted; see invariant 8. */
export const A_PHASE_WEIGHT = 2;

export interface Contribution {
  actorId: string;
  kind: ActorKind;
  events: number;
  /** Distinct credit roles this actor earned. */
  credits: string[];
  aPhase: number;
  bPhase: number;
  dPhase: number;
  /**
   * Additive contribution weight. Composed only of the actor's own authored
   * events, so a later `refute` by someone else never subtracts. Invariant 8:
   * a bold question later refuted still counts positive (A-phase weighted).
   */
  score: number;
}

interface ContributionAcc {
  kind: ActorKind;
  events: number;
  credits: Set<string>;
  aPhase: number;
  bPhase: number;
  dPhase: number;
}

export function projectContributions(events: readonly LedgerEvent[]): Contribution[] {
  const byActor = new Map<string, ContributionAcc>();

  for (const e of events) {
    let acc = byActor.get(e.actor.id);
    if (!acc) {
      acc = { kind: e.actor.kind, events: 0, credits: new Set(), aPhase: 0, bPhase: 0, dPhase: 0 };
      byActor.set(e.actor.id, acc);
    }
    acc.events += 1;
    for (const c of e.credit) acc.credits.add(c);
    if (e.phase === "A") acc.aPhase += 1;
    else if (e.phase === "B") acc.bPhase += 1;
    else acc.dPhase += 1;
  }

  const out: Contribution[] = [];
  for (const [actorId, acc] of byActor) {
    out.push({
      actorId,
      kind: acc.kind,
      events: acc.events,
      credits: [...acc.credits],
      aPhase: acc.aPhase,
      bPhase: acc.bPhase,
      dPhase: acc.dPhase,
      // Purely additive: A weighted, refutation never decrements (invariant 8).
      score: acc.aPhase * A_PHASE_WEIGHT + acc.bPhase + acc.dPhase,
    });
  }
  return out.sort((a, b) => a.actorId.localeCompare(b.actorId));
}

// ---------------------------------------------------------------------------
// transplantInsight
// ---------------------------------------------------------------------------

/** Insight, never a leaderboard (architecture.md §4, invariant 1). */
export interface Insight {
  transplants: number;
  /** Countable artifacts placed (transplant-rate denominator). */
  artifacts: number;
  /** transplants / artifacts, or 0 when no artifacts exist. */
  transplantRate: number;
  /** Counts of the six cross-layer flows. */
  flows: Record<FlowType, number>;
}

export function transplantInsight(events: readonly LedgerEvent[]): Insight {
  const flows: Record<FlowType, number> = {
    "hypothesis-output": 0,
    "anomaly-input": 0,
    "constraint-transfer": 0,
    "metaphor-bridge": 0,
    "question-return": 0,
    "method-transfer": 0,
  };
  let transplants = 0;
  let artifacts = 0;

  for (const e of events) {
    if (e.action === "transplant") transplants += 1;
    if (ARTIFACT_ACTIONS.has(e.action)) artifacts += 1;
    if (e.flow) flows[e.flow] += 1;
  }

  return {
    transplants,
    artifacts,
    transplantRate: artifacts > 0 ? transplants / artifacts : 0,
    flows,
  };
}

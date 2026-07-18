import type { ActionType, LedgerEvent } from "@frontier-isles/opp";

/** Minimal ref-store record needed by ledger relation projections. */
export interface RelationRefValue {
  kind: string;
  content: unknown;
}

/** Optional content resolver. Projections remain usable for offline/legacy ledgers without one. */
export type RelationRefResolver = (ref: string) => RelationRefValue | null | undefined;

/** A ledger event paired with the artifact it semantically responds to. */
export interface SemanticRefEvent {
  event: LedgerEvent;
  targetRef: string;
  /** Present when the event points to a response artifact instead of directly to the target. */
  responseRef?: string;
}

const RESPONSE_ACTIONS: ReadonlySet<ActionType> = new Set<ActionType>(["validate", "refute"]);
const HASH_REF = /^sha256:[0-9a-f]{64}$/;

function embeddedTargetRef(content: unknown): string | undefined {
  if (content === null || typeof content !== "object") return undefined;
  const value = content as Record<string, unknown>;
  const candidate = typeof value.targetRef === "string" ? value.targetRef : value.ref;
  return typeof candidate === "string" && HASH_REF.test(candidate) ? candidate : undefined;
}

/**
 * Resolve the semantic target of a relation event while preserving its response
 * artifact. Historical validate/refute events point directly at the target; new
 * response events point at content carrying `targetRef` (or legacy `ref`).
 */
export function semanticRefEvent(event: LedgerEvent, resolveRef?: RelationRefResolver): SemanticRefEvent | undefined {
  if (!event.ref) return undefined;
  if (!RESPONSE_ACTIONS.has(event.action) || !resolveRef) return { event, targetRef: event.ref };

  const targetRef = embeddedTargetRef(resolveRef(event.ref)?.content);
  if (!targetRef || targetRef === event.ref) return { event, targetRef: event.ref };
  return { event, targetRef, responseRef: event.ref };
}

/** Group events by semantic target ref, so target anchors and response artifacts join. */
export function groupBySemanticRef(
  events: readonly LedgerEvent[],
  resolveRef?: RelationRefResolver,
): Map<string, SemanticRefEvent[]> {
  const groups = new Map<string, SemanticRefEvent[]>();
  for (const event of events) {
    const semantic = semanticRefEvent(event, resolveRef);
    if (!semantic) continue;
    const group = groups.get(semantic.targetRef);
    if (group) group.push(semantic);
    else groups.set(semantic.targetRef, [semantic]);
  }
  return groups;
}

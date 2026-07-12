import type { ActionType, ActorKind } from "@frontier-isles/opp";
import { ROLE_LADDER, type Role } from "./roles";

/**
 * The permission model (architecture.md §4 "AI governance", invariant 6).
 * One table governs humans-by-role and agents-by-capability. Default agent
 * capabilities are `propose` + `driftwood_write` only; the only path into the
 * formal stations is a human transplant or a public `grant_capability` event.
 * Agents never push — an ungranted push degrades to a dock proposal.
 */

export type Capability =
  | "propose"
  | "driftwood_write"
  | "station_write"
  | "bridge_propose"
  | "validate"
  | "publish"
  | "grant";

/** MCP tools that write but are not themselves ledger action types. */
export type McpWriteAction = "create_driftwood" | "attach_data" | "attach_hardware";
export type GatewayAction = ActionType | McpWriteAction;
/** Effective action after gateway degradation. */
export type EffectiveAction = GatewayAction | "dock_proposal";

export const DEFAULT_AGENT_CAPABILITIES: readonly Capability[] = ["propose", "driftwood_write"];

export const ROLE_CAPABILITIES: Record<Role, readonly Capability[]> = {
  visitor: [],
  apprentice: ["propose", "driftwood_write"],
  researcher: ["propose", "driftwood_write", "station_write", "validate"],
  resident: ["propose", "driftwood_write", "station_write", "validate", "publish", "bridge_propose"],
  master: [
    "propose",
    "driftwood_write",
    "station_write",
    "validate",
    "publish",
    "bridge_propose",
    "grant",
  ],
};

/** Capability each action requires. */
export const ACTION_CAPABILITY: Record<GatewayAction, Capability> = {
  // night / wilds
  found_island: "propose",
  propose_subquestion: "propose",
  create_driftwood: "driftwood_write",
  return_to_driftwood: "driftwood_write",
  night_digest: "driftwood_write",
  // formal-station pushes
  submit_claim: "station_write",
  bridge_artifact: "station_write",
  attach_data: "station_write",
  attach_hardware: "station_write",
  refute: "station_write",
  adopt: "station_write",
  transplant: "station_write",
  fork: "station_write",
  merge_back: "station_write",
  // rebuild = a human maps a structure onto this island (执行纲要 §九). It is a
  // station-write push, so an ungranted AGENT's rebuild degrades to a dock
  // proposal — the mapping (§六.1) can only ever be authored by a human.
  rebuild: "station_write",
  validate: "validate",
  publish: "publish",
  // bridges / governance
  bridge_propose: "bridge_propose",
  bridge_accept: "grant",
  grant_capability: "grant",
};

/** Capabilities that count as pushing into a formal station. */
const PUSH_CAPABILITIES: ReadonlySet<Capability> = new Set(["station_write", "validate", "publish"]);

export interface CapabilityActor {
  id: string;
  kind: ActorKind;
  /** Human/pair role on the island. */
  role?: Role;
  /** Baseline capabilities (e.g. from the problem-object `agents[]` list or a resident template). */
  capabilities?: readonly string[];
}

function isRoleCapability(value: string): value is Role {
  return (ROLE_LADDER as readonly string[]).includes(value);
}

/** Resolve the effective capability set for an actor given granted capabilities. */
export function effectiveCapabilities(
  actor: CapabilityActor,
  grants: readonly string[] = [],
): Set<string> {
  const caps = new Set<string>();
  // Humans and human+agent pairs draw from the role ladder; lone agents do not.
  if (actor.kind !== "agent") {
    const role: Role = actor.role && isRoleCapability(actor.role) ? actor.role : "visitor";
    for (const c of ROLE_CAPABILITIES[role]) caps.add(c);
  } else {
    for (const c of DEFAULT_AGENT_CAPABILITIES) caps.add(c);
  }
  for (const c of actor.capabilities ?? []) caps.add(c);
  for (const c of grants) caps.add(c);
  return caps;
}

/** Can this actor perform this action, given granted capabilities? */
export function can(
  actor: CapabilityActor,
  action: GatewayAction,
  grants: readonly string[] = [],
): boolean {
  const required = ACTION_CAPABILITY[action];
  if (required === undefined) return false;
  return effectiveCapabilities(actor, grants).has(required);
}

function isPush(action: GatewayAction): boolean {
  return PUSH_CAPABILITIES.has(ACTION_CAPABILITY[action]);
}

/**
 * The effective action the gateway records. If the actor is authorized the
 * action passes through unchanged. An unauthorized *agent* push is not denied
 * outright — it is parked at the dock as a proposal (`dock_proposal`) for
 * human HITL, per §4 "AI never pushes; they leave things at stations".
 */
export function degradeAction(
  actor: CapabilityActor,
  action: GatewayAction,
  grants: readonly string[] = [],
): EffectiveAction {
  if (can(actor, action, grants)) return action;
  if (actor.kind === "agent" && isPush(action)) return "dock_proposal";
  return action; // not a degradable push — can() already reports the denial
}

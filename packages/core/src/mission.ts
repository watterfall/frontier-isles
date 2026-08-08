/**
 * Versioned authorization contract for bounded autonomous work.
 *
 * This module deliberately lives outside the core root barrel. Browser code
 * imports that barrel eagerly; mission runtimes should be loaded only by the
 * workers and tools that execute them.
 */

import { z } from "zod";

export const MISSION_CONTRACT_VERSION = 1 as const;
export const MISSION_EFFECTS = ["E0", "E1", "E2", "E3", "E4"] as const;
export const MISSION_AUTONOMY_LEVELS = ["A0", "A1", "A2", "A3", "A4"] as const;

export type MissionEffect = (typeof MISSION_EFFECTS)[number];
export type MissionAutonomyLevel = (typeof MISSION_AUTONOMY_LEVELS)[number];

export const MISSION_STOP_REASONS = [
  "completed",
  "goal_reached",
  "contradiction",
  "plateau",
  "uncertainty",
  "budget_exhausted",
  "expired",
  "paused",
  "revoked",
  "policy_denied",
  "repeated_failure",
  "permission_required",
  "failed",
] as const;

export type MissionStopReason = (typeof MISSION_STOP_REASONS)[number];

/** Actions whose authority can never be created by an executing mission. */
export const MISSION_GOVERNANCE_ACTIONS = [
  "grant_capability",
  "bridge_accept",
  "rebuild",
  "mission.extend",
  "mission.delegate",
  "policy.change",
  "research.ratify",
] as const;

export interface MissionBudgets {
  readonly maxSteps: number;
  readonly maxAttempts: number;
  readonly maxWallMs: number;
  readonly maxWrites: number;
  readonly maxNetworkRequests: number;
  readonly maxModelRuns: number;
  readonly maxStorageBytes: number;
  readonly maxCostMicros: number;
}

export interface MissionUsage {
  readonly steps: number;
  readonly attempts: number;
  readonly wallMs: number;
  readonly writes: number;
  readonly networkRequests: number;
  readonly modelRuns: number;
  readonly storageBytes: number;
  readonly costMicros: number;
}

export type MissionMeteredUsage = Omit<MissionUsage, "steps" | "attempts" | "wallMs">;

export interface MissionScope {
  /** Stable logical resources, for example `island:machine-curiosity`. */
  readonly resourcePrefixes: readonly string[];
  readonly islands?: readonly string[];
  readonly structures?: readonly string[];
}

export interface MissionGrant {
  readonly id: string;
  readonly effect: Exclude<MissionEffect, "E4">;
  readonly actions: readonly string[];
  readonly resourcePrefixes?: readonly string[];
  readonly maxUses: number;
  readonly expiresAt: string;
  /** Delegation is intentionally unrepresentable as true in V1. */
  readonly delegable?: false;
}

export interface MissionContractV1 {
  readonly version: typeof MISSION_CONTRACT_VERSION;
  readonly id: string;
  readonly agentId: string;
  readonly ownerId: string;
  readonly objective: string;
  readonly autonomyLevel: MissionAutonomyLevel;
  readonly scope: MissionScope;
  readonly grants: readonly MissionGrant[];
  readonly budgets: MissionBudgets;
  readonly stopConditions: readonly MissionStopReason[];
  readonly createdAt: string;
  readonly expiresAt: string;
}

export interface MissionEffectRequest {
  readonly effect: MissionEffect;
  readonly action: string;
  readonly resource?: string;
  readonly estimatedUsage?: Partial<MissionUsage>;
}

export interface MissionPolicyState {
  readonly usage: MissionUsage;
  readonly grantUses: Readonly<Record<string, number>>;
}

export type MissionPolicyReason =
  | "allowed"
  | "autonomy_level_denied"
  | "mission_expired"
  | "governance_reserved"
  | "epistemic_authority_reserved"
  | "resource_out_of_scope"
  | "grant_missing"
  | "grant_expired"
  | "grant_exhausted"
  | "budget_exhausted";

export interface MissionPolicyDecision {
  readonly allowed: boolean;
  readonly reason: MissionPolicyReason;
  readonly grantId?: string;
}

export class MissionContractError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid MissionContractV1: ${issues.join("; ")}`);
    this.name = "MissionContractError";
    this.issues = issues;
  }
}

const RuntimeMissionContractSchema = z.object({
  version: z.number(),
  id: z.string(),
  agentId: z.string(),
  ownerId: z.string(),
  objective: z.string(),
  autonomyLevel: z.enum(MISSION_AUTONOMY_LEVELS),
  scope: z.object({
    resourcePrefixes: z.array(z.string()),
    islands: z.array(z.string()).optional(),
    structures: z.array(z.string()).optional(),
  }).strict(),
  grants: z.array(z.object({
    id: z.string(),
    effect: z.enum(MISSION_EFFECTS),
    actions: z.array(z.string()),
    resourcePrefixes: z.array(z.string()).optional(),
    maxUses: z.number(),
    expiresAt: z.string(),
    delegable: z.boolean().optional(),
  }).strict()),
  budgets: z.object({
    maxSteps: z.number(),
    maxAttempts: z.number(),
    maxWallMs: z.number(),
    maxWrites: z.number(),
    maxNetworkRequests: z.number(),
    maxModelRuns: z.number(),
    maxStorageBytes: z.number(),
    maxCostMicros: z.number(),
  }).strict(),
  stopConditions: z.array(z.enum(MISSION_STOP_REASONS)),
  createdAt: z.string(),
  expiresAt: z.string(),
}).strict();

const parseMissionContractStructure = (value: unknown): MissionContractV1 => {
  const parsed = RuntimeMissionContractSchema.safeParse(value);
  if (!parsed.success) {
    throw new MissionContractError(parsed.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "contract";
      return `${path}: ${issue.message}`;
    }));
  }
  // E4 and delegable=true are accepted structurally so the semantic validator
  // below can report the explicit authority violations.
  return parsed.data as unknown as MissionContractV1;
};

export const EMPTY_MISSION_USAGE: MissionUsage = Object.freeze({
  steps: 0,
  attempts: 0,
  wallMs: 0,
  writes: 0,
  networkRequests: 0,
  modelRuns: 0,
  storageBytes: 0,
  costMicros: 0,
});

const BUDGET_KEYS = [
  "maxSteps",
  "maxAttempts",
  "maxWallMs",
  "maxWrites",
  "maxNetworkRequests",
  "maxModelRuns",
  "maxStorageBytes",
  "maxCostMicros",
] as const;

const USAGE_TO_BUDGET = {
  steps: "maxSteps",
  attempts: "maxAttempts",
  wallMs: "maxWallMs",
  writes: "maxWrites",
  networkRequests: "maxNetworkRequests",
  modelRuns: "maxModelRuns",
  storageBytes: "maxStorageBytes",
  costMicros: "maxCostMicros",
} as const satisfies Record<keyof MissionUsage, keyof MissionBudgets>;

const isIsoDate = (value: string): boolean =>
  typeof value === "string" && value.length > 0 && Number.isFinite(Date.parse(value));

const isNonEmpty = (value: string): boolean => typeof value === "string" && value.trim().length > 0;

const matchesPrefix = (resource: string, prefixes: readonly string[]): boolean =>
  prefixes.some((prefix) => {
    if (prefix.length === 0) return false;
    if (resource === prefix) return true;
    // A trailing namespace/path separator intentionally scopes a whole branch.
    // Otherwise only slash-delimited descendants match; a sibling such as
    // `island:test-evil` must not inherit authority from `island:test`.
    if (prefix.endsWith(":") || prefix.endsWith("/")) return resource.startsWith(prefix);
    return resource.startsWith(`${prefix}/`);
  });

const isGovernanceAction = (action: string): boolean =>
  (MISSION_GOVERNANCE_ACTIONS as readonly string[]).includes(action);

/** Parse, validate, and clone a contract so callers cannot mutate the authority object. */
export function normalizeMissionContract(value: unknown): MissionContractV1 {
  const contract = parseMissionContractStructure(value);
  const issues: string[] = [];
  if (contract.version !== MISSION_CONTRACT_VERSION) issues.push("version must be 1");
  if (!isNonEmpty(contract.id)) issues.push("id is required");
  if (!isNonEmpty(contract.agentId)) issues.push("agentId is required");
  if (!isNonEmpty(contract.ownerId)) issues.push("ownerId is required");
  if (!isNonEmpty(contract.objective)) issues.push("objective is required");
  if (!(MISSION_AUTONOMY_LEVELS as readonly string[]).includes(contract.autonomyLevel)) {
    issues.push("autonomyLevel is invalid");
  }
  if (contract.autonomyLevel === "A4") issues.push("A4 governance is unavailable to an autonomous V1 mission");
  if (!isIsoDate(contract.createdAt)) issues.push("createdAt must be an ISO-compatible timestamp");
  if (!isIsoDate(contract.expiresAt)) issues.push("expiresAt must be an ISO-compatible timestamp");
  if (isIsoDate(contract.createdAt) && isIsoDate(contract.expiresAt) && Date.parse(contract.expiresAt) <= Date.parse(contract.createdAt)) {
    issues.push("expiresAt must be after createdAt");
  }

  for (const key of BUDGET_KEYS) {
    const value = contract.budgets[key];
    const mustBePositive = key === "maxSteps" || key === "maxAttempts" || key === "maxWallMs";
    if (!Number.isSafeInteger(value) || (mustBePositive ? value <= 0 : value < 0)) {
      issues.push(`${key} must be a ${mustBePositive ? "positive" : "non-negative"} safe integer`);
    }
  }

  const grantIds = new Set<string>();
  for (const grant of contract.grants) {
    if (!isNonEmpty(grant.id)) issues.push("grant id is required");
    if (grantIds.has(grant.id)) issues.push(`duplicate grant id: ${grant.id}`);
    grantIds.add(grant.id);
    if (!(MISSION_EFFECTS as readonly string[]).includes((grant as { effect: string }).effect)) {
      issues.push(`grant ${grant.id} effect is invalid`);
    }
    if ((grant as { effect: string }).effect === "E4") issues.push(`grant ${grant.id} cannot grant E4`);
    if (grant.delegable !== undefined && grant.delegable !== false) issues.push(`grant ${grant.id} cannot be delegable`);
    if (!Number.isSafeInteger(grant.maxUses) || grant.maxUses <= 0) issues.push(`grant ${grant.id} maxUses must be positive`);
    if (grant.actions.length === 0 || grant.actions.some((action) => !isNonEmpty(action))) {
      issues.push(`grant ${grant.id} actions must be non-empty`);
    }
    if (grant.actions.some(isGovernanceAction)) issues.push(`grant ${grant.id} contains a reserved governance action`);
    if (!isIsoDate(grant.expiresAt)) issues.push(`grant ${grant.id} expiresAt is invalid`);
    if (isIsoDate(grant.expiresAt) && isIsoDate(contract.expiresAt) && Date.parse(grant.expiresAt) > Date.parse(contract.expiresAt)) {
      issues.push(`grant ${grant.id} expires after the mission`);
    }
  }

  if (contract.scope.resourcePrefixes.some((prefix) => !isNonEmpty(prefix))) {
    issues.push("scope resourcePrefixes must be non-empty");
  }
  if (contract.stopConditions.length === 0) issues.push("at least one stop condition is required");
  if (contract.stopConditions.some((reason) => !(MISSION_STOP_REASONS as readonly string[]).includes(reason))) {
    issues.push("stopConditions contains an invalid reason");
  }
  if (issues.length > 0) throw new MissionContractError(issues);

  return Object.freeze({
    ...contract,
    scope: Object.freeze({
      ...contract.scope,
      resourcePrefixes: Object.freeze([...contract.scope.resourcePrefixes]),
      islands: contract.scope.islands ? Object.freeze([...contract.scope.islands]) : undefined,
      structures: contract.scope.structures ? Object.freeze([...contract.scope.structures]) : undefined,
    }),
    grants: Object.freeze(contract.grants.map((grant) => Object.freeze({
      ...grant,
      actions: Object.freeze([...grant.actions]),
      resourcePrefixes: grant.resourcePrefixes ? Object.freeze([...grant.resourcePrefixes]) : undefined,
    }))),
    budgets: Object.freeze({ ...contract.budgets }),
    stopConditions: Object.freeze([...contract.stopConditions]),
  });
}

export function missionUsageExceedsBudget(usage: MissionUsage, budgets: MissionBudgets): boolean {
  return (Object.keys(USAGE_TO_BUDGET) as Array<keyof MissionUsage>).some(
    (key) => usage[key] > budgets[USAGE_TO_BUDGET[key]],
  );
}

export function addMissionUsage(current: MissionUsage, increment: Partial<MissionUsage>): MissionUsage {
  const next = { ...current };
  for (const key of Object.keys(USAGE_TO_BUDGET) as Array<keyof MissionUsage>) {
    const value = increment[key] ?? 0;
    if (!Number.isFinite(value) || value < 0) throw new Error(`Mission usage ${key} must be finite and non-negative`);
    next[key] += value;
  }
  return next;
}

export function authorizeMissionEffect(
  contract: MissionContractV1,
  request: MissionEffectRequest,
  state: MissionPolicyState,
  now: Date,
): MissionPolicyDecision {
  if (now.getTime() >= Date.parse(contract.expiresAt)) return { allowed: false, reason: "mission_expired" };
  if (contract.autonomyLevel === "A0") return { allowed: false, reason: "autonomy_level_denied" };
  if (request.effect === "E4") return { allowed: false, reason: "epistemic_authority_reserved" };
  if (isGovernanceAction(request.action)) return { allowed: false, reason: "governance_reserved" };
  if (contract.scope.resourcePrefixes.length > 0 && !request.resource) {
    return { allowed: false, reason: "resource_out_of_scope" };
  }
  if (request.resource && !matchesPrefix(request.resource, contract.scope.resourcePrefixes)) {
    return { allowed: false, reason: "resource_out_of_scope" };
  }

  const estimated = addMissionUsage(state.usage, request.estimatedUsage ?? {});
  if (missionUsageExceedsBudget(estimated, contract.budgets)) return { allowed: false, reason: "budget_exhausted" };

  // Observation and local computation are inherent in an active mission. They
  // remain bounded by its resource scope and budgets but need no effect grant.
  if (request.effect === "E0" || request.effect === "E1") return { allowed: true, reason: "allowed" };

  const matching = contract.grants.filter(
    (grant) => grant.effect === request.effect && grant.actions.includes(request.action),
  );
  if (matching.length === 0) return { allowed: false, reason: "grant_missing" };

  let sawExpired = false;
  let sawExhausted = false;
  for (const grant of matching) {
    if (now.getTime() >= Date.parse(grant.expiresAt)) {
      sawExpired = true;
      continue;
    }
    if ((state.grantUses[grant.id] ?? 0) >= grant.maxUses) {
      sawExhausted = true;
      continue;
    }
    if (grant.resourcePrefixes && (!request.resource || !matchesPrefix(request.resource, grant.resourcePrefixes))) continue;
    return { allowed: true, reason: "allowed", grantId: grant.id };
  }

  if (sawExpired) return { allowed: false, reason: "grant_expired" };
  if (sawExhausted) return { allowed: false, reason: "grant_exhausted" };
  return { allowed: false, reason: "resource_out_of_scope" };
}

import { describe, expect, it } from "vitest";
import {
  EMPTY_MISSION_USAGE,
  MissionContractError,
  authorizeMissionEffect,
  normalizeMissionContract,
  type MissionContractV1,
} from "../src/mission.js";

const createdAt = "2026-08-08T00:00:00.000Z";
const expiresAt = "2026-08-08T01:00:00.000Z";

const contract = (overrides: Partial<MissionContractV1> = {}): MissionContractV1 => ({
  version: 1,
  id: "mission:test",
  agentId: "github:test-agent",
  ownerId: "github:test-owner",
  objective: "Inspect one island and propose a bounded result",
  autonomyLevel: "A2",
  scope: { resourcePrefixes: ["island:machine-curiosity"] },
  grants: [{
    id: "grant:propose",
    effect: "E2",
    actions: ["model.propose"],
    resourcePrefixes: ["island:machine-curiosity"],
    maxUses: 2,
    expiresAt,
  }],
  budgets: {
    maxSteps: 4,
    maxAttempts: 3,
    maxWallMs: 10_000,
    maxWrites: 1,
    maxNetworkRequests: 2,
    maxModelRuns: 2,
    maxStorageBytes: 1_024,
    maxCostMicros: 0,
  },
  stopConditions: ["completed", "budget_exhausted", "policy_denied", "failed"],
  createdAt,
  expiresAt,
  ...overrides,
});

const state = (grantUses: Record<string, number> = {}) => ({ usage: EMPTY_MISSION_USAGE, grantUses });
const active = new Date("2026-08-08T00:10:00.000Z");

describe("MissionContractV1", () => {
  it("normalizes a valid contract into an immutable authority object", () => {
    const normalized = normalizeMissionContract(contract());
    expect(normalized).not.toBe(contract());
    expect(Object.isFrozen(normalized)).toBe(true);
    expect(Object.isFrozen(normalized.grants)).toBe(true);
    expect(Object.isFrozen(normalized.budgets)).toBe(true);
  });

  it("rejects E4, delegated grants, reserved governance actions, and overlong grants", () => {
    const invalid = contract({
      grants: [{
        id: "grant:bad",
        effect: "E4",
        actions: ["grant_capability"],
        maxUses: 1,
        expiresAt: "2026-08-08T02:00:00.000Z",
        delegable: true,
      }] as unknown as MissionContractV1["grants"],
    });
    expect(() => normalizeMissionContract(invalid)).toThrow(MissionContractError);
    try {
      normalizeMissionContract(invalid);
    } catch (error) {
      expect((error as MissionContractError).issues).toEqual(expect.arrayContaining([
        "grant grant:bad cannot grant E4",
        "grant grant:bad cannot be delegable",
        "grant grant:bad contains a reserved governance action",
        "grant grant:bad expires after the mission",
      ]));
    }
  });

  it("keeps A4 governance outside autonomous mission contracts", () => {
    expect(() => normalizeMissionContract(contract({ autonomyLevel: "A4" }))).toThrow(
      "A4 governance is unavailable to an autonomous V1 mission",
    );
  });
});

describe("mission effect policy", () => {
  it("allows scoped E0/E1 work without a separate grant", () => {
    const c = normalizeMissionContract(contract({ grants: [] }));
    expect(authorizeMissionEffect(c, {
      effect: "E0",
      action: "source.read",
      resource: "island:machine-curiosity/problem",
    }, state(), active)).toEqual({ allowed: true, reason: "allowed" });
    expect(authorizeMissionEffect(c, {
      effect: "E1",
      action: "model.run",
      resource: "island:machine-curiosity/model",
      estimatedUsage: { modelRuns: 1 },
    }, state(), active)).toEqual({ allowed: true, reason: "allowed" });
  });

  it("requires an active, scoped, unexhausted grant for E2/E3", () => {
    const c = normalizeMissionContract(contract());
    const request = { effect: "E2" as const, action: "model.propose", resource: "island:machine-curiosity/model" };
    expect(authorizeMissionEffect(c, request, state(), active)).toEqual({
      allowed: true,
      reason: "allowed",
      grantId: "grant:propose",
    });
    expect(authorizeMissionEffect(c, request, state({ "grant:propose": 2 }), active).reason).toBe("grant_exhausted");
    expect(authorizeMissionEffect(c, { ...request, resource: "island:other" }, state(), active).reason).toBe("resource_out_of_scope");
    expect(authorizeMissionEffect(c, { ...request, resource: "island:machine-curiosity-evil/model" }, state(), active).reason)
      .toBe("resource_out_of_scope");
    expect(authorizeMissionEffect(c, { ...request, resource: undefined }, state(), active).reason).toBe("resource_out_of_scope");
  });

  it("hard-denies epistemic/governance authority and preflights budgets", () => {
    const c = normalizeMissionContract(contract());
    expect(authorizeMissionEffect(c, { effect: "E4", action: "research.ratify" }, state(), active).reason)
      .toBe("epistemic_authority_reserved");
    expect(authorizeMissionEffect(c, { effect: "E1", action: "mission.extend" }, state(), active).reason)
      .toBe("governance_reserved");
    expect(authorizeMissionEffect(c, {
      effect: "E1",
      action: "model.run",
      resource: "island:machine-curiosity/model",
      estimatedUsage: { modelRuns: 3 },
    }, state(), active).reason).toBe("budget_exhausted");
  });

  it("does not execute tools for an A0 suggestion mission", () => {
    const c = normalizeMissionContract(contract({ autonomyLevel: "A0", grants: [] }));
    expect(authorizeMissionEffect(c, { effect: "E0", action: "source.read" }, state(), active).reason)
      .toBe("autonomy_level_denied");
  });
});

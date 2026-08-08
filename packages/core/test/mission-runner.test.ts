import { describe, expect, it } from "vitest";
import { runMission, type MissionStep } from "../src/mission-runner.js";
import type { MissionContractV1 } from "../src/mission.js";

const instant = "2026-08-08T00:00:00.000Z";

const contract = (overrides: Partial<MissionContractV1> = {}): MissionContractV1 => ({
  version: 1,
  id: "mission:runner-test",
  agentId: "github:test-agent",
  ownerId: "github:test-owner",
  objective: "Run a deterministic bounded step",
  autonomyLevel: "A2",
  scope: { resourcePrefixes: ["island:test"] },
  grants: [{
    id: "grant:proposal",
    effect: "E2",
    actions: ["candidate.propose"],
    resourcePrefixes: ["island:test"],
    maxUses: 3,
    expiresAt: "2026-08-08T01:00:00.000Z",
  }],
  budgets: {
    maxSteps: 5,
    maxAttempts: 3,
    maxWallMs: 10_000,
    maxWrites: 1,
    maxNetworkRequests: 2,
    maxModelRuns: 2,
    maxStorageBytes: 1_024,
    maxCostMicros: 0,
  },
  stopConditions: ["completed", "budget_exhausted", "policy_denied", "repeated_failure", "paused", "revoked"],
  createdAt: instant,
  expiresAt: "2026-08-08T01:00:00.000Z",
  ...overrides,
});

const step: MissionStep<{ query: string }> = {
  id: "step:propose",
  idempotencyKey: "proposal:test:v1",
  request: {
    effect: "E2",
    action: "candidate.propose",
    resource: "island:test/candidates",
    estimatedUsage: { networkRequests: 1 },
  },
  input: { query: "bounded autonomy" },
};

describe("runMission", () => {
  it("executes, meters, and emits an append-only successful bundle", async () => {
    const output = { candidate: "inspectable" };
    const ownedStep = structuredClone(step);
    const bundle = await runMission({
      contract: contract(),
      now: () => new Date(instant),
      planner: ({ completed }) => completed.length === 0
        ? { type: "execute", step: ownedStep }
        : { type: "stop", reason: "completed", summary: "one candidate" },
      executor: async (_step, { meter }) => {
        meter({ networkRequests: 1, writes: 1 });
        return output;
      },
    });

    expect(bundle.status).toBe("completed");
    expect(bundle.stopReason).toBe("completed");
    expect(bundle.usage).toMatchObject({ steps: 1, attempts: 1, networkRequests: 1, writes: 1 });
    expect(bundle.grantUses).toEqual({ "grant:proposal": 1 });
    expect(bundle.completed[0]?.output).toEqual({ candidate: "inspectable" });
    expect(bundle.events.map((event) => event.type)).toEqual([
      "mission_started",
      "step_started",
      "step_succeeded",
      "mission_stopped",
    ]);
    expect(bundle.events.map((event) => event.sequence)).toEqual([0, 1, 2, 3]);
    output.candidate = "mutated after execution";
    ownedStep.input.query = "mutated by planner owner";
    expect(bundle.completed[0]?.output).toEqual({ candidate: "inspectable" });
    expect(bundle.completed[0]?.step.input).toEqual({ query: "bounded autonomy" });
  });

  it("retries a failed step and reuses a successful idempotency key without another effect", async () => {
    let executions = 0;
    let requestedReuse = false;
    const bundle = await runMission({
      contract: contract(),
      now: () => new Date(instant),
      planner: ({ completed }) => {
        if (completed.length === 0) return { type: "execute", step };
        if (!requestedReuse) {
          requestedReuse = true;
          return { type: "execute", step };
        }
        return { type: "stop", reason: "completed" };
      },
      executor: async () => {
        executions += 1;
        if (executions === 1) throw new Error("transient");
        return "ok";
      },
    });

    expect(executions).toBe(2);
    expect(bundle.usage).toMatchObject({ steps: 3, attempts: 2 });
    expect(bundle.failures).toHaveLength(1);
    expect(bundle.events.map((event) => event.type)).toContain("step_reused");
  });

  it("stops before an external effect when live metering would exceed budget", async () => {
    let externalEffect = false;
    const bundle = await runMission({
      contract: contract({ budgets: { ...contract().budgets, maxNetworkRequests: 0 } }),
      now: () => new Date(instant),
      planner: () => ({ type: "execute", step: { ...step, request: { ...step.request, estimatedUsage: undefined } } }),
      executor: async (_step, { meter }) => {
        meter({ networkRequests: 1 });
        externalEffect = true;
        return "unreachable";
      },
    });
    expect(bundle.stopReason).toBe("budget_exhausted");
    expect(externalEffect).toBe(false);
    expect(bundle.events.map((event) => event.type)).toContain("step_failed");
  });

  it("denies an ungranted effect without invoking the executor", async () => {
    let invoked = false;
    const bundle = await runMission({
      contract: contract({ grants: [] }),
      now: () => new Date(instant),
      planner: () => ({ type: "execute", step }),
      executor: async () => {
        invoked = true;
        return "unreachable";
      },
    });
    expect(bundle.stopReason).toBe("policy_denied");
    expect(invoked).toBe(false);
    expect(bundle.events.find((event) => event.type === "policy_denied")).toMatchObject({
      detail: { reason: "grant_missing" },
    });
  });

  it("does not retry an effect whose completed output cannot be traced", async () => {
    let executions = 0;
    const bundle = await runMission({
      contract: contract(),
      now: () => new Date(instant),
      planner: () => ({ type: "execute", step }),
      executor: async () => {
        executions += 1;
        return 1n;
      },
    });
    expect(executions).toBe(1);
    expect(bundle.stopReason).toBe("failed");
    expect(bundle.failures[0]?.error).toContain("JSON-serializable");
  });

  it("honors pause control between turns", async () => {
    const bundle = await runMission({
      contract: contract(),
      now: () => new Date(instant),
      control: () => "pause",
      planner: () => ({ type: "execute", step }),
      executor: async () => "unreachable",
    });
    expect(bundle.status).toBe("paused");
    expect(bundle.stopReason).toBe("paused");
    expect(bundle.usage.attempts).toBe(0);
  });

  it("resumes a paused bundle with continuous trace, usage, and grant state", async () => {
    const paused = await runMission({
      contract: contract(),
      now: () => new Date(instant),
      control: () => "pause",
      planner: () => ({ type: "execute", step }),
      executor: async () => "unreachable",
    });
    const resumed = await runMission({
      contract: paused.contract,
      resumeFrom: paused,
      now: () => new Date(instant),
      planner: ({ completed }) => completed.length === 0
        ? { type: "execute", step }
        : { type: "stop", reason: "completed" },
      executor: async () => "resumed",
    });

    expect(resumed.status).toBe("completed");
    expect(resumed.completed[0]?.output).toBe("resumed");
    expect(resumed.events.map((event) => event.type)).toEqual([
      "mission_started",
      "mission_stopped",
      "mission_resumed",
      "step_started",
      "step_succeeded",
      "mission_stopped",
    ]);
    expect(resumed.events.map((event) => event.sequence)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(resumed.grantUses).toEqual({ "grant:proposal": 1 });
  });
});

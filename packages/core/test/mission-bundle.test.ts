import { describe, expect, it } from "vitest";
import { AgentRunBundleError, parseAgentRunBundle } from "../src/mission-bundle.js";
import { runMission, type AgentRunBundle, type MissionStep } from "../src/mission-runner.js";
import type { MissionContractV1 } from "../src/mission.js";

const instant = "2026-08-08T00:00:00.000Z";

const contract = (): MissionContractV1 => ({
  version: 1,
  id: "mission:persistence-test",
  agentId: "github:test-agent",
  ownerId: "github:test-owner",
  objective: "Persist one bounded result",
  autonomyLevel: "A2",
  scope: { resourcePrefixes: ["island:test"] },
  grants: [{
    id: "grant:proposal",
    effect: "E2",
    actions: ["candidate.propose"],
    resourcePrefixes: ["island:test"],
    maxUses: 1,
    expiresAt: "2026-08-08T01:00:00.000Z",
  }],
  budgets: {
    maxSteps: 2,
    maxAttempts: 1,
    maxWallMs: 10_000,
    maxWrites: 1,
    maxNetworkRequests: 0,
    maxModelRuns: 0,
    maxStorageBytes: 1_024,
    maxCostMicros: 0,
  },
  stopConditions: ["completed", "paused", "failed"],
  createdAt: instant,
  expiresAt: "2026-08-08T01:00:00.000Z",
});

const step: MissionStep<{ candidate: string }> = {
  id: "step:persist",
  idempotencyKey: "persist:test:v1",
  request: {
    effect: "E2",
    action: "candidate.propose",
    resource: "island:test/candidate",
  },
  input: { candidate: "inspectable" },
};

async function successfulBundle(): Promise<AgentRunBundle<{ saved: boolean }>> {
  return runMission({
    contract: contract(),
    now: () => new Date(instant),
    planner: ({ completed }) => completed.length === 0
      ? { type: "execute", step }
      : { type: "stop", reason: "completed" },
    executor: async () => ({ saved: true }),
  });
}

const jsonRoundTrip = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

describe("parseAgentRunBundle", () => {
  it("accepts and freezes a JSON-round-tripped runner bundle", async () => {
    const parsed = parseAgentRunBundle<{ saved: boolean }>(jsonRoundTrip(await successfulBundle()));

    expect(parsed.status).toBe("completed");
    expect(parsed.completed[0]?.output).toEqual({ saved: true });
    expect(Object.isFrozen(parsed)).toBe(true);
    expect(Object.isFrozen(parsed.completed[0]?.step.input)).toBe(true);
  });

  it("rejects forged grant counts and non-contiguous trace events", async () => {
    const raw = jsonRoundTrip(await successfulBundle()) as {
      grantUses: Record<string, number>;
      events: Array<{ sequence: number }>;
    };
    raw.grantUses["grant:proposal"] = 2;
    raw.events[1]!.sequence = 9;

    expect(() => parseAgentRunBundle(raw)).toThrow(AgentRunBundleError);
    try {
      parseAgentRunBundle(raw);
    } catch (error) {
      expect((error as AgentRunBundleError).issues).toEqual(expect.arrayContaining([
        "grantUses exceeds grant:proposal maxUses",
        "event 1 has non-contiguous sequence 9",
      ]));
    }
  });

  it("rejects malformed persisted contracts as a bundle error", async () => {
    const raw = jsonRoundTrip(await successfulBundle()) as { contract: Record<string, unknown> };
    delete raw.contract.budgets;

    expect(() => parseAgentRunBundle(raw)).toThrow(AgentRunBundleError);
    expect(() => parseAgentRunBundle(raw)).not.toThrow(TypeError);
  });
});

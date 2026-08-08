import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runMission, type AgentRunBundle } from "@frontier-isles/core/mission-runner";
import type { MissionContractV1 } from "@frontier-isles/core/mission";
import {
  MissionRecoveryRequiredError,
  MissionRunRecordError,
  createMissionRunRecord,
  hashMissionRequest,
  loadMissionRunRecord,
  parseMissionRunRecord,
  saveMissionRunRecord,
  withMissionRunLock,
} from "../src/mission-store.js";

const instant = "2026-08-08T00:00:00.000Z";
const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function tempStatePath(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "frontier-isles-mission-"));
  tempDirectories.push(directory);
  return join(directory, "nested", "run.json");
}

const contract = (): MissionContractV1 => ({
  version: 1,
  id: "mission:store-test",
  agentId: "github:test-agent",
  ownerId: "github:test-owner",
  objective: "Persist one paused mission",
  autonomyLevel: "A2",
  scope: { resourcePrefixes: ["island:test"] },
  grants: [],
  budgets: {
    maxSteps: 2,
    maxAttempts: 1,
    maxWallMs: 10_000,
    maxWrites: 0,
    maxNetworkRequests: 0,
    maxModelRuns: 1,
    maxStorageBytes: 1_024,
    maxCostMicros: 0,
  },
  stopConditions: ["completed", "paused", "failed"],
  createdAt: instant,
  expiresAt: "2026-08-08T01:00:00.000Z",
});

async function pausedBundle(): Promise<AgentRunBundle<string>> {
  return runMission({
    contract: contract(),
    now: () => new Date(instant),
    control: () => "pause",
    planner: () => ({ type: "stop", reason: "completed" }),
    executor: async () => "unreachable",
  });
}

describe("mission run record", () => {
  it("atomically saves and reloads a content-addressed paused bundle", async () => {
    const statePath = await tempStatePath();
    const record = createMissionRunRecord({
      state: "settled",
      requestHash: hashMissionRequest({ task: "test" }),
      attemptId: "attempt:test",
      updatedAt: instant,
      contract: contract(),
      bundle: await pausedBundle(),
    });

    await saveMissionRunRecord(statePath, record);
    const loaded = await loadMissionRunRecord<string>(statePath);

    expect(loaded).toEqual(record);
    expect(loaded?.bundle?.status).toBe("paused");
    expect(await readdir(join(statePath, ".."))).toEqual(["run.json"]);
  });

  it("detects payload tampering before a record can become resume authority", async () => {
    const record = createMissionRunRecord({
      state: "settled",
      requestHash: hashMissionRequest({ task: "test" }),
      attemptId: "attempt:test",
      updatedAt: instant,
      contract: contract(),
      bundle: await pausedBundle(),
    });
    const raw = JSON.parse(JSON.stringify(record)) as Record<string, unknown>;
    raw.updatedAt = "2026-08-08T00:01:00.000Z";

    expect(() => parseMissionRunRecord(JSON.stringify(raw))).toThrow(MissionRunRecordError);
    expect(() => parseMissionRunRecord(JSON.stringify(raw))).toThrow("digest does not match");
  });

  it("uses an exclusive lock so two processes cannot run the same state file", async () => {
    const statePath = await tempStatePath();

    await withMissionRunLock(statePath, async () => {
      await expect(withMissionRunLock(statePath, async () => "duplicate")).rejects.toBeInstanceOf(
        MissionRecoveryRequiredError,
      );
      return "owner";
    });

    await expect(withMissionRunLock(statePath, async () => "next")).resolves.toBe("next");
  });

  it("rejects a forged save before replacing the prior atomic record", async () => {
    const statePath = await tempStatePath();
    const record = createMissionRunRecord({
      state: "running",
      requestHash: hashMissionRequest({ task: "test" }),
      attemptId: "attempt:test",
      updatedAt: instant,
      contract: contract(),
    });
    await saveMissionRunRecord(statePath, record);
    const forged = { ...record, updatedAt: "2026-08-08T00:01:00.000Z" };

    await expect(saveMissionRunRecord(statePath, forged)).rejects.toThrow("digest does not match");
    expect(parseMissionRunRecord(await readFile(statePath, "utf8"))).toEqual(record);
  });
});

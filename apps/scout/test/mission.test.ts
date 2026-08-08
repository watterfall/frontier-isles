import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { MissionContractV1 } from "@frontier-isles/core/mission";
import {
  createScoutMissionContract,
  runNightShiftMission,
  runNightShiftMissionPersisted,
} from "../src/mission.js";
import {
  MissionRecoveryRequiredError,
  createMissionRunRecord,
  hashMissionRequest,
  loadMissionRunRecord,
  saveMissionRunRecord,
} from "../src/mission-store.js";
import type { NightDeps, NightOptions } from "../src/night.js";
import type { ScoutWriter } from "../src/mcpClient.js";
import type { CrossRefWork } from "../src/pipeline.js";
import response from "./fixtures/crossref-works.json";

const instant = new Date("2026-08-08T00:00:00.000Z");
const now = () => new Date(instant);

const PROBLEM_MD = `---
schema: opp/0.2
id: op://frontier-isles/prob/machine-curiosity
title: 机器的好奇心 · curiosity
status: active
qfocus: |
  Can AI ask a good question that no human has thought of?
lineage:
  children: []
frontier:
  heat: 0.3
  substrate: 0.8
  mode: variance-select
---

## Night
Some night notes about curiosity, novelty and question generation.
`;

const LEDGER = '{"action":"night_digest","actor":{"id":"github:curiosity-scout","kind":"agent"},"ref":"sha256:aaa"}';

const OPTIONS: NightOptions = {
  island: "machine-curiosity",
  serverBase: "http://localhost:8787",
  rows: 8,
  topK: 3,
  dryRun: false,
};

function fakeWriter(): ScoutWriter & { writes: number; closed: boolean } {
  return {
    writes: 0,
    closed: false,
    async readQfocus() { return "unused"; },
    async createDriftwood() {
      this.writes += 1;
      return "written";
    },
    async nightDigest() {
      this.writes += 1;
      return "digest";
    },
    async close() { this.closed = true; },
  };
}

function deps(writer: ScoutWriter, counts: { network: number }): NightDeps {
  return {
    async fetchText(url) {
      counts.network += 1;
      if (url.endsWith("/problem.md")) return PROBLEM_MD;
      if (url.includes("/api/refs/")) return '{"text":"doi:10.1000/ddd"}';
      return LEDGER;
    },
    async fetchWorks() {
      counts.network += 1;
      return response.message.items as CrossRefWork[];
    },
    makeWriter: async () => writer,
    now: instant,
    log: () => {},
  };
}

const missionContract = (options: NightOptions = OPTIONS): MissionContractV1 =>
  createScoutMissionContract(options, { createdAt: instant, missionId: "mission:scout-test" });

describe("night scout mission adapter", () => {
  it("runs the unchanged live scout under one E2 proposal grant and records actual effects", async () => {
    const writer = fakeWriter();
    const counts = { network: 0 };
    const bundle = await runNightShiftMission(OPTIONS, deps(writer, counts), {
      contract: missionContract(),
      now,
    });

    expect(bundle.status).toBe("completed");
    expect(bundle.completed[0]?.output.proposals).toHaveLength(3);
    expect(bundle.usage.networkRequests).toBe(4);
    expect(bundle.usage.writes).toBe(4);
    expect(counts.network).toBe(4);
    expect(writer.writes).toBe(4);
    expect(writer.closed).toBe(true);
    expect(bundle.grantUses).toEqual({ "grant:night-scout-propose:machine-curiosity": 1 });
  });

  it("classifies dry-run as E1 computation and performs no shared writes", async () => {
    const options = { ...OPTIONS, dryRun: true };
    const writer = fakeWriter();
    const counts = { network: 0 };
    const bundle = await runNightShiftMission(options, deps(writer, counts), {
      contract: missionContract(options),
      now,
    });

    expect(bundle.status).toBe("completed");
    expect(bundle.completed[0]?.output.proposals).toHaveLength(3);
    expect(bundle.usage.writes).toBe(0);
    expect(writer.writes).toBe(0);
    expect(writer.closed).toBe(false);
    expect(bundle.grantUses).toEqual({});
  });

  it("denies a live mission with no E2 proposal grant before any IO", async () => {
    const writer = fakeWriter();
    const counts = { network: 0 };
    const base = missionContract();
    const withoutGrant: MissionContractV1 = { ...base, grants: [] };
    const bundle = await runNightShiftMission(OPTIONS, deps(writer, counts), { contract: withoutGrant, now });

    expect(bundle.stopReason).toBe("policy_denied");
    expect(counts.network).toBe(0);
    expect(writer.writes).toBe(0);
  });

  it("preflights a write budget too small for top-K plus digest", async () => {
    const writer = fakeWriter();
    const counts = { network: 0 };
    const base = missionContract();
    const underBudget: MissionContractV1 = {
      ...base,
      budgets: { ...base.budgets, maxWrites: OPTIONS.topK },
    };
    const bundle = await runNightShiftMission(OPTIONS, deps(writer, counts), { contract: underBudget, now });

    expect(bundle.stopReason).toBe("budget_exhausted");
    expect(counts.network).toBe(0);
    expect(writer.writes).toBe(0);
  });

  it("preflights the three unavoidable network calls before any IO", async () => {
    const writer = fakeWriter();
    const counts = { network: 0 };
    const base = missionContract();
    const underBudget: MissionContractV1 = {
      ...base,
      budgets: { ...base.budgets, maxNetworkRequests: 2 },
    };
    const bundle = await runNightShiftMission(OPTIONS, deps(writer, counts), { contract: underBudget, now });

    expect(bundle.stopReason).toBe("budget_exhausted");
    expect(counts.network).toBe(0);
    expect(writer.writes).toBe(0);
  });

  it("persists a pause, resumes it once, and reuses the terminal result without repeating IO", async () => {
    const directory = await mkdtemp(join(tmpdir(), "frontier-isles-scout-resume-"));
    const stateFile = join(directory, "run.json");
    try {
      const firstWriter = fakeWriter();
      const firstCounts = { network: 0 };
      const paused = await runNightShiftMissionPersisted(OPTIONS, deps(firstWriter, firstCounts), {
        stateFile,
        contract: missionContract(),
        now,
        control: () => "pause",
      });
      expect(paused.status).toBe("paused");
      expect(firstCounts.network).toBe(0);

      const secondWriter = fakeWriter();
      const secondCounts = { network: 0 };
      const completed = await runNightShiftMissionPersisted(OPTIONS, deps(secondWriter, secondCounts), {
        stateFile,
        now,
      });
      expect(completed.status).toBe("completed");
      expect(secondCounts.network).toBe(4);
      expect(secondWriter.writes).toBe(4);
      expect((await loadMissionRunRecord(stateFile))?.state).toBe("settled");

      const replayWriter = fakeWriter();
      const replayCounts = { network: 0 };
      const replayed = await runNightShiftMissionPersisted(OPTIONS, deps(replayWriter, replayCounts), {
        stateFile,
        now,
      });
      expect(replayed).toEqual(completed);
      expect(replayCounts.network).toBe(0);
      expect(replayWriter.writes).toBe(0);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("refuses automatic replay when a running marker survives a process", async () => {
    const directory = await mkdtemp(join(tmpdir(), "frontier-isles-scout-running-"));
    const stateFile = join(directory, "run.json");
    try {
      await saveMissionRunRecord(stateFile, createMissionRunRecord({
        state: "running",
        requestHash: hashMissionRequest({ kind: "night-scout/v1", options: OPTIONS }),
        attemptId: "attempt:crashed",
        updatedAt: instant.toISOString(),
        contract: missionContract(),
      }));
      const writer = fakeWriter();
      const counts = { network: 0 };

      await expect(runNightShiftMissionPersisted(OPTIONS, deps(writer, counts), { stateFile, now }))
        .rejects.toBeInstanceOf(MissionRecoveryRequiredError);
      expect(counts.network).toBe(0);
      expect(writer.writes).toBe(0);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});

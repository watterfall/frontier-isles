import { describe, it, expect } from "vitest";
import { runNightShift, CREDIT, type NightDeps, type NightOptions } from "../src/night.js";
import type { ScoutWriter } from "../src/mcpClient.js";
import type { CrossRefWork } from "../src/pipeline.js";
import resp from "./fixtures/crossref-works.json";

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

// The ledger already mentions DOI 10.1000/ddd → it must be skipped this shift.
// Real ledger shape: events carry `ref: sha256:…`, never inline content — the
// DOI only exists behind the read-only /api/refs endpoint.
const LEDGER = [
  '{"action":"found_island","actor":{"id":"github:shen-kuo","kind":"human"}}',
  '{"action":"night_digest","actor":{"id":"github:curiosity-scout","kind":"agent"},"ref":"sha256:aaa"}',
  '{"action":"night_digest","actor":{"id":"github:other-agent","kind":"agent"},"ref":"sha256:bbb"}',
].join("\n");

const REFS: Record<string, string> = {
  "sha256:aaa": '{"kind":"driftwood","content":{"atom":"thought","text":"earlier find doi:10.1000/ddd"}}',
  // another agent's ref must NOT be resolved (dedup scopes to the scout's own proposals)
  "sha256:bbb": '{"kind":"driftwood","content":{"atom":"thought","text":"someone else doi:10.5555/zzz"}}',
};

function fakeWriter(): ScoutWriter & { calls: { name: string; args: unknown[] }[] } {
  const calls: { name: string; args: unknown[] }[] = [];
  return {
    calls,
    async readQfocus() {
      calls.push({ name: "readQfocus", args: [] });
      return "Can AI ask a good question?";
    },
    async createDriftwood(atom, text, credit) {
      calls.push({ name: "createDriftwood", args: [atom, text, credit] });
      return `✓ night_digest written to ledger. ref=sha256:fake phase=A`;
    },
    async nightDigest(text, credit, dest) {
      calls.push({ name: "nightDigest", args: [text, credit, dest] });
      return `✓ night_digest written to ledger. ref=sha256:digest phase=A`;
    },
    async close() {
      calls.push({ name: "close", args: [] });
    },
  };
}

function baseDeps(overrides: Partial<NightDeps> = {}): NightDeps {
  return {
    fetchText: async (url) => {
      if (url.endsWith("/problem.md")) return PROBLEM_MD;
      if (url.includes("/api/refs/")) {
        const hash = decodeURIComponent(url.split("/api/refs/")[1]!);
        if (!(hash in REFS)) throw new Error("404");
        return REFS[hash]!;
      }
      return LEDGER;
    },
    fetchWorks: async () => resp.message.items as CrossRefWork[],
    now: new Date("2026-07-10T00:00:00Z"),
    log: () => {},
    ...overrides,
  };
}

const OPTS: NightOptions = {
  island: "machine-curiosity",
  serverBase: "http://localhost:8787",
  rows: 8,
  topK: 3,
  mailto: "you@example.com",
  dryRun: false,
};

describe("runNightShift", () => {
  it("reads QFocus, dedups ledger DOIs, ranks, and proposes top-K through the writer", async () => {
    const writer = fakeWriter();
    const result = await runNightShift(OPTS, baseDeps({ makeWriter: async () => writer }));

    expect(result.qfocus).toContain("Can AI ask a good question");
    expect(result.keywords).toContain("ai");
    expect(result.fromPubDate).toBe("2025-07-10"); // last-year window
    expect(result.seenDois).toBe(1);

    // deduped + ranked
    expect(result.proposals).toHaveLength(3);
    expect(result.candidates.map((c) => c.doi)).not.toContain("10.1000/ddd");
    expect(result.candidates[0]!.doi).toBe("10.1000/aaa");

    // every driftwood write carried credit:ai/literature, atom "thought"
    const writes = writer.calls.filter((c) => c.name === "createDriftwood");
    expect(writes).toHaveLength(3);
    for (const w of writes) {
      expect(w.args[0]).toBe("thought");
      expect(w.args[2]).toEqual(CREDIT);
      expect(CREDIT).toEqual(["credit:ai/literature"]);
    }
    // collect step
    const digestCall = writer.calls.find((c) => c.name === "nightDigest");
    expect(digestCall).toBeDefined();
    // the shift digest is filed as a morning-report draft for the library
    expect(digestCall!.args[2]).toBe("library");
    expect(writer.calls.at(-1)!.name).toBe("close");
  });

  it("dry-run writes nothing and needs no writer", async () => {
    const result = await runNightShift({ ...OPTS, dryRun: true }, baseDeps());
    expect(result.proposals).toHaveLength(3);
    expect(result.written).toHaveLength(0);
    expect(result.digest).toBe("");
  });

  it("tolerates a night_digest tool that is unavailable (returns '')", async () => {
    const writer = fakeWriter();
    writer.nightDigest = async () => "";
    const result = await runNightShift(OPTS, baseDeps({ makeWriter: async () => writer }));
    expect(result.written).toHaveLength(3);
    expect(result.digest).toBe("");
  });
});

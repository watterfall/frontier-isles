import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  parseXFrontierFeedbackCliArgs,
  runXFrontierFeedbackCli,
} from "../src/xfrontier-feedback-cli.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
});

describe("xFrontier feedback CLI safety gate", () => {
  it("defaults to local inspect and rejects unconfirmed delivery", () => {
    expect(parseXFrontierFeedbackCliArgs([]).command).toBe("inspect");
    expect(parseXFrontierFeedbackCliArgs(["recover-expired"]).command).toBe("recover-expired");
    expect(parseXFrontierFeedbackCliArgs(["reconcile", "--id", "item-1"]).command).toBe("reconcile");
    expect(parseXFrontierFeedbackCliArgs(["-h"]).help).toBe(true);
    expect(() => parseXFrontierFeedbackCliArgs(["deliver", "--id", "item-1"]))
      .toThrow("--confirm-upstream-write");
    expect(() => parseXFrontierFeedbackCliArgs(["retry", "--id", "item-1"]))
      .toThrow("--confirm-upstream-write");
    expect(parseXFrontierFeedbackCliArgs([
      "retry", "--id", "item-1", "--confirm-upstream-write",
    ])).toMatchObject({ command: "retry", confirmUpstreamWrite: true });
    expect(parseXFrontierFeedbackCliArgs([
      "pull", "--ledger-dir", "/tmp/xf-test-ledger",
    ])).toMatchObject({ ledgerDir: "/tmp/xf-test-ledger" });
    expect(() => parseXFrontierFeedbackCliArgs([
      "inspect",
      "--confirm-upstream-write",
    ])).toThrow("valid only with deliver or retry");
  });

  it("runs inspect without touching the configured MCP entry", async () => {
    const directory = await mkdtemp(join(tmpdir(), "frontier-feedback-cli-"));
    temporaryDirectories.push(directory);
    const db = join(directory, "feedback.db");
    const impossibleMcpEntry = join(directory, "must-not-be-read.mjs");
    const output: string[] = [];
    const errors: string[] = [];
    const code = await runXFrontierFeedbackCli([
      "inspect",
      "--db", db,
      "--server-entry", impossibleMcpEntry,
      "--json",
    ], { out: (message) => output.push(message), error: (message) => errors.push(message) });
    expect(code).toBe(0);
    expect(errors).toEqual([]);
    expect(JSON.parse(output.join("\n"))).toMatchObject({ mode: "local-inspect", remoteCalls: 0 });
    output.length = 0;
    const recoverCode = await runXFrontierFeedbackCli([
      "recover-expired",
      "--db", db,
      "--server-entry", impossibleMcpEntry,
      "--json",
    ], { out: (message) => output.push(message), error: (message) => errors.push(message) });
    expect(recoverCode).toBe(0);
    expect(JSON.parse(output.join("\n"))).toEqual({ recovered: 0 });
    await expect(stat(impossibleMcpEntry)).rejects.toMatchObject({ code: "ENOENT" });
    expect((await readFile(db)).byteLength).toBeGreaterThan(0);
  });
});

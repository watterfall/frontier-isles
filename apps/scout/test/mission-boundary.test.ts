import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("night CLI mission boundary", () => {
  it("routes the scheduled entry through the mission adapter", () => {
    const source = readFileSync(new URL("../src/cli.ts", import.meta.url), "utf8");
    expect(source).toContain('import { runNightShiftMission } from "./mission.js"');
    expect(source).toContain("await runNightShiftMission(opts, deps)");
    expect(source).not.toMatch(/await runNightShift\(opts, deps\)/);
  });
});

import { describe, it, expect } from "vitest";
import { can, degradeAction, type CapabilityActor } from "../src/capabilities";

/**
 * 执行纲要 §六.1 red-line: the mapping (rebuild) can only ever be authored by a
 * human. rebuild is a station-write action, so the SAME capability gateway that
 * governs every other push enforces it — no special-casing. An ungranted agent's
 * rebuild degrades to a dock proposal; it never lands as a real edge.
 */
describe("rebuild capability red-line (§六.1)", () => {
  const agent: CapabilityActor = { id: "github:scout-ai", kind: "agent" };
  const master: CapabilityActor = { id: "github:shen-kuo", kind: "human", role: "master" };
  const researcher: CapabilityActor = { id: "github:someone", kind: "human", role: "researcher" };

  it("a human researcher/master can rebuild", () => {
    expect(can(master, "rebuild")).toBe(true);
    expect(can(researcher, "rebuild")).toBe(true);
  });

  it("a lone agent cannot rebuild", () => {
    expect(can(agent, "rebuild")).toBe(false);
  });

  it("an agent's rebuild degrades to a dock proposal (never a real edge)", () => {
    expect(degradeAction(agent, "rebuild")).toBe("dock_proposal");
  });

  it("a human's rebuild passes through unchanged", () => {
    expect(degradeAction(master, "rebuild")).toBe("rebuild");
  });

  it("a granted agent (station_write) may rebuild — the public grant path still works", () => {
    expect(degradeAction(agent, "rebuild", ["station_write"])).toBe("rebuild");
  });
});

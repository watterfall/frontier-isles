import { describe, it, expect } from "vitest";
import { can, degradeAction, type CapabilityActor } from "../src/capabilities";

/**
 * 执行纲要 §六.1 red-line: the mapping (rebuild) can only ever be authored by a
 * human. The passage itself starts at apprentice; learning and research differ
 * by destination graph state, not by using different actions. A lone agent's
 * rebuild always degrades to a dock proposal, even if granted capabilities.
 */
describe("rebuild capability red-line (§六.1)", () => {
  const agent: CapabilityActor = { id: "github:scout-ai", kind: "agent" };
  const master: CapabilityActor = { id: "github:shen-kuo", kind: "human", role: "master" };
  const researcher: CapabilityActor = { id: "github:someone", kind: "human", role: "researcher" };
  const apprentice: CapabilityActor = { id: "github:learner", kind: "human", role: "apprentice" };
  const visitor: CapabilityActor = { id: "github:visitor", kind: "human", role: "visitor" };

  it("a human apprentice/researcher/master can perform the same passage action", () => {
    expect(can(master, "rebuild")).toBe(true);
    expect(can(researcher, "rebuild")).toBe(true);
    expect(can(apprentice, "rebuild")).toBe(true);
    expect(can(visitor, "rebuild")).toBe(false);
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

  it("capability grants still cannot turn an agent proposal into a finalized mapping", () => {
    expect(can(agent, "rebuild", ["rebuild", "station_write"])).toBe(false);
    expect(degradeAction(agent, "rebuild", ["rebuild", "station_write"])).toBe("dock_proposal");
  });
});

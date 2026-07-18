import { describe, it, expect } from "vitest";
import { appendEvent, type LedgerEvent, type UnchainedEvent } from "@frontier-isles/opp";
import {
  can,
  degradeAction,
  effectiveCapabilities,
  STATION_KINDS,
  STATION_SEALS,
  ATOM_TYPES,
  BRIDGE_ARTIFACT_TYPES,
  AI_RESIDENT_TEMPLATES,
  projectGrowth,
  projectDayView,
  projectNightReplay,
  computeTide,
  projectContributions,
  transplantInsight,
  A_PHASE_WEIGHT,
  type CapabilityActor,
} from "../src/index";

const OP = "op://frontier-isles/prob/machine-curiosity";
const human = (role: CapabilityActor["role"]): CapabilityActor => ({ id: "github:alice", kind: "human", role });
const agent: CapabilityActor = { id: "github:curiosity-scout", kind: "agent" };

const evt = (over: Partial<UnchainedEvent>): UnchainedEvent => ({
  ts: "2026-07-07T00:00:00.000Z",
  op: OP,
  actor: { id: "github:alice", kind: "human" },
  credit: [],
  phase: "A",
  action: "found_island",
  ...over,
});

function chain(...parts: Array<Partial<UnchainedEvent>>): LedgerEvent[] {
  let c: LedgerEvent[] = [];
  for (const p of parts) c = appendEvent(c, evt(p));
  return c;
}

describe("static tables", () => {
  it("has nine stations and a nine-glyph seal string", () => {
    expect(STATION_KINDS).toHaveLength(9);
    expect([...STATION_SEALS]).toHaveLength(9);
    expect(STATION_SEALS).toBe("问数板文坊展议木联");
  });
  it("has six atoms and four bridge artifacts", () => {
    expect(ATOM_TYPES).toHaveLength(6);
    expect(BRIDGE_ARTIFACT_TYPES).toHaveLength(4);
  });
  it("ferryman is the only cross-island resident with bridge-propose rights", () => {
    const cross = Object.values(AI_RESIDENT_TEMPLATES).filter((t) => t.crossIsland);
    expect(cross).toHaveLength(1);
    expect(cross[0]?.kind).toBe("ferryman");
    expect(cross[0]?.capabilities).toContain("bridge_propose");
  });
});

describe("capabilities (§4 AI governance, invariant 6)", () => {
  it("default agent caps are propose + driftwood_write only", () => {
    expect([...effectiveCapabilities(agent)].sort()).toEqual(["driftwood_write", "propose"]);
    expect(can(agent, "propose_subquestion")).toBe(true);
    expect(can(agent, "create_driftwood")).toBe(true);
    expect(can(agent, "submit_claim")).toBe(false);
  });

  it("agent submit_claim degrades to a dock proposal", () => {
    expect(degradeAction(agent, "submit_claim")).toBe("dock_proposal");
    expect(degradeAction(agent, "bridge_artifact")).toBe("dock_proposal");
  });

  it("a grant_capability grant unlocks the station and stops degradation", () => {
    const grants = ["station_write"];
    expect(can(agent, "submit_claim", grants)).toBe(true);
    expect(degradeAction(agent, "submit_claim", grants)).toBe("submit_claim");
  });

  it("humans push by role; visitors cannot, researchers can", () => {
    expect(can(human("visitor"), "submit_claim")).toBe(false);
    expect(can(human("researcher"), "submit_claim")).toBe(true);
    expect(can(human("master"), "grant_capability")).toBe(true);
    expect(can(human("researcher"), "grant_capability")).toBe(false);
    // a human push is never degraded to a dock proposal
    expect(degradeAction(human("visitor"), "submit_claim")).toBe("submit_claim");
  });
});

describe("projectGrowth (§4)", () => {
  it("empty at genesis, hut after first artifact, academy across 3 stations, school on publish/fork", () => {
    expect(projectGrowth([]).stage).toBe("empty");
    expect(projectGrowth(chain({ action: "found_island" })).stage).toBe("empty");
    expect(projectGrowth(chain({ action: "found_island" }, { action: "submit_claim", phase: "D" })).stage).toBe("hut");

    const multi = chain(
      { action: "propose_subquestion" }, // questions
      { action: "submit_claim", phase: "D" }, // workshop
      { action: "bridge_artifact", phase: "B" }, // dock
    );
    expect(projectGrowth(multi).stage).toBe("academy");

    expect(projectGrowth(chain({ action: "publish", phase: "B" })).stage).toBe("school");
    expect(projectGrowth(chain({ action: "fork" })).stage).toBe("school");
  });

  it("flags dormancy against a supplied now and maps endings from status", () => {
    const old = chain({ action: "submit_claim", ts: "2026-01-01T00:00:00.000Z" });
    expect(projectGrowth(old, { now: "2026-07-07T00:00:00.000Z" }).dormant).toBe(true);
    expect(projectGrowth(old, { now: "2026-01-02T00:00:00.000Z" }).dormant).toBe(false);
    expect(projectGrowth([], { status: "dissolved" }).ending).toBe("mist");
    expect(projectGrowth([], { status: "resolved" }).ending).toBe("lighthouse");
    expect(projectGrowth([], { status: "active" }).ending).toBe("none");
  });
});

describe("computeTide (N = A − D)", () => {
  it("counts phases and computes N", () => {
    const c = chain(
      { phase: "A", action: "propose_subquestion" },
      { phase: "A", action: "propose_subquestion" },
      { phase: "B", action: "bridge_artifact" },
      { phase: "D", action: "submit_claim" },
    );
    expect(computeTide(c)).toEqual({ A: 2, B: 1, D: 1, N: 1 });
  });
});

describe("invariant 8 — a refuted bold question still counts positive", () => {
  it("does not decrement the A-phase author when someone refutes later", () => {
    const c = chain(
      { actor: { id: "github:bold", kind: "human" }, phase: "A", action: "propose_subquestion", credit: ["conceptualization"] },
      { actor: { id: "github:critic", kind: "human" }, phase: "D", action: "refute" },
    );
    const contribs = projectContributions(c);
    const bold = contribs.find((x) => x.actorId === "github:bold");
    expect(bold?.aPhase).toBe(1);
    expect(bold?.score).toBe(A_PHASE_WEIGHT); // still positive, A-weighted, undiminished
    const critic = contribs.find((x) => x.actorId === "github:critic");
    expect(critic?.score).toBe(1); // refuting adds; it never subtracts from anyone
  });
});

describe("day / night projections", () => {
  it("day view surfaces only publish/adopt artifacts", () => {
    const c = chain(
      { action: "submit_claim", phase: "D", ref: "sha256:claim" },
      { action: "publish", phase: "B", ref: "sha256:pub" },
      { action: "adopt", phase: "B", ref: "sha256:adopted" },
    );
    const day = projectDayView(c);
    expect(day.map((d) => d.action)).toEqual(["publish", "adopt"]);
  });

  it("night replay types ghosts and honors upTo", () => {
    const c = chain(
      { action: "propose_subquestion", ts: "2026-07-01T00:00:00.000Z" },
      { action: "return_to_driftwood", ts: "2026-07-02T00:00:00.000Z" },
      { action: "refute", phase: "D", ts: "2026-07-03T00:00:00.000Z" },
    );
    const full = projectNightReplay(c);
    expect(full).toHaveLength(3);
    expect(full[1]?.ghost).toEqual({ reason: "returned", atom: "thought" });
    expect(full[2]?.ghost).toEqual({ reason: "refuted", atom: "contradiction" });
    expect(full[0]?.ghost).toBeUndefined();
    expect(projectNightReplay(c, 2)).toHaveLength(2);
  });
});

describe("transplantInsight", () => {
  it("reports rate and the six flow counts", () => {
    const c = chain(
      { action: "propose_subquestion" },
      { action: "bridge_artifact", phase: "B", flow: "metaphor-bridge" },
      { action: "transplant", phase: "B", flow: "hypothesis-output" },
    );
    const insight = transplantInsight(c);
    expect(insight.transplants).toBe(1);
    expect(insight.artifacts).toBe(3);
    expect(insight.transplantRate).toBeCloseTo(1 / 3);
    expect(insight.flows["metaphor-bridge"]).toBe(1);
    expect(insight.flows["hypothesis-output"]).toBe(1);
    expect(insight.flows["anomaly-input"]).toBe(0);
  });
});

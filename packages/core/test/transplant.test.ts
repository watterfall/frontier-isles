import { describe, it, expect } from "vitest";
import { buildTransplant, TRANSPLANT_TARGETS } from "../src/transplant";
import { BRIDGE_ARTIFACT_TYPES } from "../src/atoms";

const DRIFT = "sha256:1111111111111111111111111111111111111111111111111111111111111111";

describe("buildTransplant (Phase B.3 — driftwood → dock → station)", () => {
  it("forms one of the four bridge artifacts and records the once-driftwood mark in the ref content", () => {
    const build = buildTransplant({
      driftwoodRef: DRIFT,
      type: "concept-prototype",
      dest: "workshop",
      body: "陶土原型机 · 曾为散木",
    });
    expect(build.artifact.type).toBe("concept-prototype");
    expect(build.artifact.dest).toBe("workshop");
    expect(build.artifact.body).toBe("陶土原型机 · 曾为散木");
    // The load-bearing invariant: the source driftwood ref persists inside the artifact.
    expect(build.artifact.onceDriftwood).toBe(DRIFT);
    expect(build.event).toEqual({ action: "transplant", phase: "B" });
  });

  it("passes an optional cross-layer flow through onto the event, and omits it otherwise", () => {
    expect(buildTransplant({ driftwoodRef: DRIFT, type: "analogy-mapping", dest: "library", flow: "metaphor-bridge" }).event).toEqual({
      action: "transplant",
      phase: "B",
      flow: "metaphor-bridge",
    });
    expect("flow" in buildTransplant({ driftwoodRef: DRIFT, type: "analogy-mapping", dest: "library" }).event).toBe(false);
  });

  it("defaults an absent body to an empty string (never undefined in the ref content)", () => {
    expect(buildTransplant({ driftwoodRef: DRIFT, type: "design-fiction", dest: "gallery" }).artifact.body).toBe("");
  });

  it("accepts every one of the four bridge artifact types", () => {
    for (const type of BRIDGE_ARTIFACT_TYPES) {
      expect(buildTransplant({ driftwoodRef: DRIFT, type, dest: "workshop" }).artifact.type).toBe(type);
    }
  });

  it("rejects an invalid bridge artifact type", () => {
    // @ts-expect-error — deliberately invalid type
    expect(() => buildTransplant({ driftwoodRef: DRIFT, type: "not-a-bridge", dest: "workshop" })).toThrow(/bridge artifact type/);
  });

  it("rejects driftwood and dock as targets (source + pass-through, never a landing station)", () => {
    expect(() => buildTransplant({ driftwoodRef: DRIFT, type: "concept-prototype", dest: "driftwood" })).toThrow(/target station/);
    expect(() => buildTransplant({ driftwoodRef: DRIFT, type: "concept-prototype", dest: "dock" })).toThrow(/target station/);
    expect(TRANSPLANT_TARGETS).not.toContain("driftwood");
    expect(TRANSPLANT_TARGETS).not.toContain("dock");
    expect(TRANSPLANT_TARGETS).toContain("workshop");
  });

  it("requires a source driftwood ref", () => {
    expect(() => buildTransplant({ driftwoodRef: "", type: "concept-prototype", dest: "workshop" })).toThrow(/driftwoodRef/);
  });
});

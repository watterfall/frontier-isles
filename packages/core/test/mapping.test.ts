import { describe, it, expect } from "vitest";
import { MappingArtifactSchema } from "../src/mapping";

describe("MappingArtifact (rebuild ref payload — human-authored, §六.1)", () => {
  const ok = {
    structureId: "struct://xfrontier/kuramoto",
    islandOp: "op://frontier-isles/prob/firefly-sync",
    correspondences: [
      {
        quantity: { zh: "耦合强度", en: "coupling K" },
        inThisSubstrate: { zh: "看见彼此的视觉强度", en: "mutual visual strength" },
      },
    ],
  };

  it("requires structureId + islandOp + at least one correspondence", () => {
    expect(() => MappingArtifactSchema.parse(ok)).not.toThrow();
    expect(() => MappingArtifactSchema.parse({ ...ok, correspondences: [] })).toThrow();
  });

  it("rejects a non-struct structureId and a non-op islandOp", () => {
    expect(() => MappingArtifactSchema.parse({ ...ok, structureId: "op://x/prob/y" })).toThrow();
    expect(() => MappingArtifactSchema.parse({ ...ok, islandOp: "struct://x/y" })).toThrow();
  });

  it("carries an optional falsifiable prediction (§七)", () => {
    const withPrediction = {
      ...ok,
      prediction: { zh: "若成立,同板节拍器应自发同步。", en: "If it holds, metronomes on one board should self-synchronize." },
    };
    const parsed = MappingArtifactSchema.parse(withPrediction);
    expect(parsed.prediction?.en).toContain("synchronize");
  });
});

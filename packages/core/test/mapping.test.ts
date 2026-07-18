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

  it("carries an optional analogy boundary without invalidating legacy refs", () => {
    const legacy = MappingArtifactSchema.parse(ok);
    expect(legacy.boundary).toBeUndefined();
    const bounded = MappingArtifactSchema.parse({
      ...ok,
      boundary: {
        zh: "萤火虫会主动调节节律，电网节点不会。",
        en: "Fireflies actively retune their rhythms; grid nodes do not.",
      },
    });
    expect(bounded.boundary?.zh).toContain("不会");
  });

  it("carries optional departure provenance without breaking legacy mappings", () => {
    const legacy = MappingArtifactSchema.parse(ok);
    expect(legacy.sourceIslandOp).toBeUndefined();
    const passage = MappingArtifactSchema.parse({
      ...ok,
      sourceIslandOp: "op://frontier-isles/prob/clock-sync",
    });
    expect(passage.sourceIslandOp).toContain("clock-sync");
    expect(() => MappingArtifactSchema.parse({ ...ok, sourceIslandOp: "struct://x/not-an-island" })).toThrow();
  });

  it("accepts one honestly authored language and rejects an empty pseudo-translation", () => {
    const sourceOnly = MappingArtifactSchema.parse({
      ...ok,
      correspondences: [{ quantity: { zh: "耦合强度", en: "" }, inThisSubstrate: { zh: "视觉强度", en: "" } }],
      prediction: { zh: "若成立，应出现临界转变。", en: "" },
      authoredLanguage: "zh",
      translationStatus: "source_only",
    });
    expect(sourceOnly.translationStatus).toBe("source_only");
    expect(() => MappingArtifactSchema.parse({
      ...ok,
      correspondences: [{ quantity: { zh: "", en: "" }, inThisSubstrate: { zh: "视觉强度", en: "" } }],
    })).toThrow();
  });
});

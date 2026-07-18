import { describe, it, expect } from "vitest";
import {
  projectStructureMappings,
  reduceStructureGraph,
  structureFrontier,
  disciplineDistance,
} from "../src/structures";
import type { MappingArtifact } from "../src/mapping";
import type { LedgerEvent } from "@frontier-isles/opp";

const ev = (op: string, ref: string, actor = "github:a"): LedgerEvent =>
  ({
    ts: "2026-07-12T00:00:00Z",
    op,
    actor: { id: actor, kind: "human" },
    credit: [],
    phase: "B",
    action: "rebuild",
    ref,
  }) as LedgerEvent;

const MAPS: Record<string, MappingArtifact> = {
  "sha256:k1": {
    structureId: "struct://x/kuramoto",
    islandOp: "op://x/prob/firefly",
    correspondences: [{ quantity: { zh: "a", en: "a" }, inThisSubstrate: { zh: "b", en: "b" } }],
  },
  "sha256:k2": {
    structureId: "struct://x/kuramoto",
    islandOp: "op://x/prob/heart",
    correspondences: [{ quantity: { zh: "a", en: "a" }, inThisSubstrate: { zh: "b", en: "b" } }],
  },
  "sha256:g1": {
    structureId: "struct://x/kuramoto",
    islandOp: "op://x/prob/grid",
    correspondences: [{ quantity: { zh: "a", en: "a" }, inThisSubstrate: { zh: "b", en: "b" } }],
  },
};
const resolve = (ref: string): MappingArtifact | null => MAPS[ref] ?? null;

describe("reduceStructureGraph", () => {
  it("one rebuild event → one structure⇄island edge", () => {
    const edges = reduceStructureGraph([ev("op://x/prob/firefly", "sha256:k1")], resolve);
    expect(edges).toEqual([
      { structureId: "struct://x/kuramoto", islandOp: "op://x/prob/firefly", weight: 1, actors: ["github:a"] },
    ]);
  });

  it("ignores non-rebuild actions and unresolvable refs (no edge without a real mapping — inv 14/15)", () => {
    const notRebuild = { ...ev("op://x/prob/firefly", "sha256:k1"), action: "validate" } as LedgerEvent;
    const missingRef = ev("op://x/prob/firefly", "sha256:missing");
    expect(reduceStructureGraph([notRebuild, missingRef], resolve)).toEqual([]);
  });

  it("accumulates weight + distinct actors on repeat rebuilds of the same pair", () => {
    const edges = reduceStructureGraph(
      [ev("op://x/prob/firefly", "sha256:k1", "github:a"), ev("op://x/prob/firefly", "sha256:k1", "github:b")],
      resolve,
    );
    expect(edges[0]!.weight).toBe(2);
    expect(edges[0]!.actors).toEqual(["github:a", "github:b"]);
  });

  it("is order-independent (inv 13)", () => {
    const a = reduceStructureGraph([ev("op://x/prob/firefly", "sha256:k1"), ev("op://x/prob/heart", "sha256:k2")], resolve);
    const b = reduceStructureGraph([ev("op://x/prob/heart", "sha256:k2"), ev("op://x/prob/firefly", "sha256:k1")], resolve);
    expect(a).toEqual(b);
  });
});

describe("projectStructureMappings", () => {
  it("keeps the explanatory ref content, actor, and time behind a compressed edge", () => {
    const records = projectStructureMappings([ev("op://x/prob/firefly", "sha256:k1")], resolve);
    expect(records).toEqual([
      expect.objectContaining({
        refHash: "sha256:k1",
        actor: "github:a",
        ts: "2026-07-12T00:00:00Z",
        structureId: "struct://x/kuramoto",
        islandOp: "op://x/prob/firefly",
        correspondences: MAPS["sha256:k1"]!.correspondences,
      }),
    ]);
  });

  it("keeps repeated human refinements instead of pretending one edge has one eternal explanation", () => {
    const records = projectStructureMappings([
      ev("op://x/prob/firefly", "sha256:k1", "github:a"),
      ev("op://x/prob/firefly", "sha256:k1", "github:b"),
    ], resolve);
    expect(records).toHaveLength(2);
    expect(records.map((record) => record.actor)).toEqual(["github:a", "github:b"]);
  });
});

describe("structureFrontier", () => {
  const islands = [
    { op: "op://x/prob/firefly", domain: "生命", cluster: "C10" },
    { op: "op://x/prob/heart", domain: "生命", cluster: "C10" }, // same cluster, not rebuilt → gap
    { op: "op://x/prob/quark", domain: "数理", cluster: "C33" }, // unrelated → not a near gap
  ];
  it("gaps = same-cluster/domain islands lacking the structure (the visible frontier)", () => {
    const edges = reduceStructureGraph([ev("op://x/prob/firefly", "sha256:k1")], resolve);
    const [f] = structureFrontier(edges, islands);
    expect(f!.rebuilt).toEqual(["op://x/prob/firefly"]);
    expect(f!.gaps).toContain("op://x/prob/heart");
    expect(f!.gaps).not.toContain("op://x/prob/quark");
  });
});

describe("disciplineDistance (produce-only — inv-16 seam)", () => {
  it("counts structures spanning two domains", () => {
    const edges = reduceStructureGraph(
      [ev("op://x/prob/firefly", "sha256:k1"), ev("op://x/prob/grid", "sha256:g1")],
      resolve,
    );
    const islands = [
      { op: "op://x/prob/firefly", domain: "生命" },
      { op: "op://x/prob/grid", domain: "物质" },
    ];
    expect(disciplineDistance(edges, islands)).toEqual([{ a: "物质", b: "生命", sharedStructures: 1 }]);
  });
});

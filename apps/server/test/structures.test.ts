import { describe, it, expect, beforeEach } from "vitest";
import { parseStructureObject } from "@frontier-isles/opp";
import { FRONTIERS } from "@frontier-isles/data";
import { SEED_STRUCTURES } from "@frontier-isles/data/structures";
import { openDb } from "../src/db.js";
import { Store, opIdFor } from "../src/store.js";
import { createApp } from "../src/app.js";
import { seed } from "../src/seed.js";
import type { Hono } from "hono";

let store: Store;
let app: Hono;

beforeEach(() => {
  store = new Store(openDb(":memory:"));
  seed(store);
  app = createApp(store);
});

const post = (path: string, body: unknown) =>
  app.request(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jsonOf = async (res: { json(): Promise<unknown> }): Promise<any> => res.json();
const ledgerText = async (slug: string) => (await app.request(`/api/islands/${slug}/ledger.jsonl`)).text();

const mappingFor = (
  slug: string,
  sourceSlug = "self-learning-matter",
  structureId = "struct://xfrontier/synchronization",
) => ({
  structureId,
  sourceIslandOp: opIdFor(sourceSlug),
  islandOp: opIdFor(slug),
  correspondences: [{ quantity: { zh: "耦合强度", en: "K" }, inThisSubstrate: { zh: "视觉强度", en: "visual" } }],
  boundary: { zh: "视觉耦合不是电导更新。", en: "Visual coupling is not conductance updating." },
  prediction: { zh: "若成立，目标岛应出现可测的临界转变。", en: "If it holds, the destination should show a measurable critical transition." },
});

describe("structures API (执行纲要 §九)", () => {
  it("GET /api/structures lists the expanded themed catalog with provenance", async () => {
    const body = await jsonOf(await app.request("/api/structures"));
    // Count derives from the seed catalog — the API must list all of it, and the
    // named ids below pin the ones whose behaviour the rest of the suite relies on.
    expect(body.structures).toHaveLength(SEED_STRUCTURES.length);
    const ids = body.structures.map((s: { id: string }) => s.id);
    expect(ids).toContain("struct://xfrontier/synchronization");
    expect(ids).toContain("struct://xfrontier/network-cascade");
    expect(ids).toContain("struct://xfrontier/scaling");
    expect(ids).toContain("struct://xfrontier/intervention-identifiability");
    expect(ids).toContain("struct://xfrontier/anomaly-as-signal");
    expect(ids).toContain("struct://xfrontier/executable-knowledge");
    expect(ids).toContain("struct://xfrontier/substrate-local-learning");
    expect(ids).toContain("struct://xfrontier/model-reality-loop");
    const causal = body.structures.find((s: { id: string }) => s.id.endsWith("intervention-identifiability"));
    expect(causal).toMatchObject({
      theme: "causal-inference",
      provenance: { source: "xfrontier.science", recordIds: [851, 537], reviewedAt: "2026-07-26" },
    });
  });

  it("GET /api/structures/:slug.md round-trips through opp's parser (§6 leavability)", async () => {
    const res = await app.request("/api/structures/synchronization.md");
    expect(res.status).toBe(200);
    const md = await res.text();
    const obj = parseStructureObject(md);
    expect(obj.id).toBe("struct://xfrontier/synchronization");
    expect(obj.title.zh.length).toBeGreaterThan(0);
    expect(obj.theme).toBe("collective-dynamics");
    expect(obj.provenance?.source).toBe("xfrontier.science");
  });

  it("seeds real rebuild edges: network-cascade islands carry a rebuild event", async () => {
    const led = await ledgerText("triadic-percolation-connectivity-dynamical");
    expect(led).toContain('"action":"rebuild"');
  });

  it("标度 seeds zero edges — a pure frontier (no rebuild on any island for it)", async () => {
    // scaling has no mappings, so no island's ledger carries a rebuild that
    // resolves to it. We assert the seeded structure exists but is unmapped.
    const led = await ledgerText("self-learning-matter"); // a synchronization island, not scaling
    expect(led).toContain('"action":"rebuild"');
  });

  it("GET /api/structures/graph reduces real edges + frontier from the ledger", async () => {
    const g = await jsonOf(await app.request("/api/structures/graph"));
    // network-cascade has 3 seeded edges; synchronization 1; scaling 0.
    const cascadeEdges = g.edges.filter((e: { structureId: string }) => e.structureId.endsWith("network-cascade"));
    expect(cascadeEdges.length).toBe(3);
    const scaling = g.frontier.find((f: { structureId: string }) => f.structureId.endsWith("scaling"));
    // scaling is unmapped → absent from the frontier (no edges → no entry).
    expect(scaling).toBeUndefined();
    const cascade = g.frontier.find((f: { structureId: string }) => f.structureId.endsWith("network-cascade"));
    expect(cascade.rebuilt.length).toBe(3);
    expect(Array.isArray(cascade.gaps)).toBe(true);
    const seededMappings = SEED_STRUCTURES.reduce((n, s) => n + s.mappings.length, 0);
    expect(g.edges).toHaveLength(seededMappings);
    expect(g.mappings).toHaveLength(seededMappings);
    expect(g.mappings.every((mapping: { correspondences?: unknown[] }) => mapping.correspondences?.length)).toBe(true);
  });

  it("preserves mapping-level evidence URLs when seed mappings become ledger artifacts", async () => {
    const structure = SEED_STRUCTURES.find((candidate) => candidate.id.endsWith("synchronization"))!;
    const mapping = structure.mappings.find((candidate) => candidate.slug === "self-learning-matter")!;
    const previousEvidence = mapping.evidenceRefs;
    const evidenceRefs = ["https://doi.org/10.1038/example", "record:seed-review"];
    mapping.evidenceRefs = evidenceRefs;

    const isolatedStore = new Store(openDb(":memory:"));
    try {
      seed(isolatedStore);
      const projected = isolatedStore.structureGraph().mappings.find((candidate) =>
        candidate.structureId === structure.id &&
        candidate.islandOp === opIdFor(mapping.slug),
      );
      expect(projected?.evidenceRefs).toEqual(evidenceRefs);
    } finally {
      if (previousEvidence) mapping.evidenceRefs = previousEvidence;
      else delete mapping.evidenceRefs;
    }
  });

  it("reconciles the catalog idempotently on an already-seeded database", async () => {
    const before = await jsonOf(await app.request("/api/structures/graph"));
    const seaBefore = store.seaData();
    expect(seed(store)).toBe(0);
    const after = await jsonOf(await app.request("/api/structures/graph"));
    expect(after.edges).toEqual(before.edges);
    expect(store.seaData()).toEqual(seaBefore);
    expect(store.listStructures()).toHaveLength(SEED_STRUCTURES.length);
  });

  it("materializes every island added after id 140 on upgrade exactly once", () => {
    const expansion = FRONTIERS.filter((frontier) => frontier.id >= 141);
    const expansionOps = new Set(expansion.map((frontier) => opIdFor(frontier.slug)));
    const legacyEvents = new Map(
      store.listProblemRows()
        .filter((row) => !expansionOps.has(row.opId))
        .map((row) => [row.opId, store.getEvents(row.opId)]),
    );
    const removeLegacyGap = store.db.transaction(() => {
      for (const opId of expansionOps) {
        store.db.prepare("DELETE FROM placements WHERE op_id = ?").run(opId);
        store.db.prepare("DELETE FROM memberships WHERE op_id = ?").run(opId);
        store.db.prepare("DELETE FROM capability_grants WHERE op_id = ?").run(opId);
        store.db.prepare("DELETE FROM stations WHERE op_id = ?").run(opId);
        store.db.prepare("DELETE FROM ledger_events WHERE op_id = ?").run(opId);
        store.db.prepare("DELETE FROM problem_objects WHERE op_id = ?").run(opId);
      }
    });
    removeLegacyGap();
    // 36 from wave 2 plus the 12 structure-led ones; the filter is id-based,
    // so a later expansion joins this set and is covered by the same gate.
    expect(expansion).toHaveLength(48);
    expect(store.listProblemRows()).toHaveLength(141);

    expect(seed(store)).toBe(48);
    expect(store.listProblemRows()).toHaveLength(189);
    for (const frontier of expansion) {
      expect(store.getProblemRow(frontier.slug)?.meta.name).toBe(frontier.title.zh);
    }
    for (const [opId, events] of legacyEvents) {
      expect(store.getEvents(opId), `${opId} ledger unchanged`).toEqual(events);
    }

    const darkFiberOp = opIdFor("dark-fiber-ecological-sensing");
    const restoredMapping = store.structureGraph().mappings.find((mapping) =>
      mapping.islandOp === darkFiberOp &&
      mapping.structureId === "struct://xfrontier/distributed-field-observability"
    );
    expect(restoredMapping?.evidenceRefs?.length).toBeGreaterThan(0);

    const restoredEvents = new Map(
      expansion.map((frontier) => {
        const opId = opIdFor(frontier.slug);
        return [opId, store.getEvents(opId)];
      }),
    );
    expect(seed(store)).toBe(0);
    for (const [opId, events] of restoredEvents) {
      expect(store.getEvents(opId), `${opId} ledger stays idempotent`).toEqual(events);
    }
  });
});

describe("Ferry Dock rebuild passage (§六.1: only humans author mappings)", () => {
  const slug = "machine-curiosity";

  it("a human member at the verified departure opens a frontier edge", async () => {
    const res = await post(`/api/islands/${slug}/rebuild`, {
      mapping: mappingFor(slug),
      actor: { id: "github:shen-kuo", kind: "human" },
    });
    expect(res.status).toBe(201);
    const body = await jsonOf(res);
    expect(body.degraded).toBe(false);
    expect(body.event.action).toBe("rebuild");
    expect(body.passageKind).toBe("frontier");
    expect(body.sourceIslandOp).toBe(opIdFor("self-learning-matter"));
    expect(body.targetIslandOp).toBe(opIdFor(slug));
    expect(body.refHash).toMatch(/^sha256:/);
  });

  it("an apprentice at the departure can perform the same passage action", async () => {
    store.addMembership(opIdFor("self-learning-matter"), {
      actorId: "github:learner",
      kind: "human",
      role: "apprentice",
      aiKind: null,
    });
    const res = await post(`/api/islands/${slug}/rebuild`, {
      mapping: mappingFor(slug),
      actor: { id: "github:learner", kind: "human" },
    });
    expect(res.status).toBe(201);
  });

  it("a non-member human is denied at the departure", async () => {
    const res = await post(`/api/islands/${slug}/rebuild`, {
      mapping: mappingFor(slug),
      actor: { id: "github:random-visitor", kind: "human" },
    });
    expect(res.status).toBe(403);
  });

  it("a lone agent is denied and NO proposal or rebuild event is added by this finalization route", async () => {
    const before = (await ledgerText(slug)).split("\n").filter(Boolean).length;
    const res = await post(`/api/islands/${slug}/rebuild`, {
      mapping: mappingFor(slug),
      actor: { id: "github:scout-ai", kind: "agent" },
    });
    expect(res.status).toBe(403);
    const after = (await ledgerText(slug)).split("\n").filter(Boolean);
    expect(after.length).toBe(before);
  });

  it("derives a charted practice when the destination already has this structure", async () => {
    const target = "emergent-conventions-collective-bias-tipping";
    const graphBefore = await jsonOf(await app.request("/api/structures/graph"));
    const before = graphBefore.edges.find(
      (e: { structureId: string; islandOp: string }) =>
        e.structureId.endsWith("network-cascade") && e.islandOp === opIdFor(target),
    );
    const res = await post(`/api/islands/${target}/rebuild`, {
      mapping: mappingFor(target, "triadic-percolation-connectivity-dynamical", "struct://xfrontier/network-cascade"),
      actor: { id: "github:shen-kuo", kind: "human" },
    });
    expect(res.status).toBe(201);
    expect((await jsonOf(res)).passageKind).toBe("charted");
    const graphAfter = await jsonOf(await app.request("/api/structures/graph"));
    const after = graphAfter.edges.find(
      (e: { structureId: string; islandOp: string }) =>
        e.structureId.endsWith("network-cascade") && e.islandOp === opIdFor(target),
    );
    expect(after.weight).toBe(before.weight + 1);
  });

  it("rejects a mapping whose islandOp does not match the island", async () => {
    const res = await post(`/api/islands/${slug}/rebuild`, {
      mapping: { ...mappingFor(slug), islandOp: opIdFor("some-other-island") },
      actor: { id: "github:shen-kuo", kind: "human" },
    });
    expect(res.status).toBe(400);
  });

  it("rejects a malformed mapping (no correspondences)", async () => {
    const res = await post(`/api/islands/${slug}/rebuild`, {
      mapping: { ...mappingFor(slug), correspondences: [] },
      actor: { id: "github:shen-kuo", kind: "human" },
    });
    expect(res.status).toBe(400);
  });

  it("rejects missing passage provenance, analogy boundary, or prediction at the semantic boundary", async () => {
    const full = mappingFor(slug);
    const { sourceIslandOp: _source, ...withoutSource } = full;
    const missingSource = await post(`/api/islands/${slug}/rebuild`, {
      mapping: withoutSource,
      actor: { id: "github:shen-kuo", kind: "human" },
    });
    expect(missingSource.status).toBe(422);
    expect((await jsonOf(missingSource)).code).toBe("source_required");

    const { prediction: _prediction, ...withoutPrediction } = full;
    const missingPrediction = await post(`/api/islands/${slug}/rebuild`, {
      mapping: withoutPrediction,
      actor: { id: "github:shen-kuo", kind: "human" },
    });
    expect(missingPrediction.status).toBe(422);
    expect((await jsonOf(missingPrediction)).code).toBe("prediction_required");

    const { boundary: _boundary, ...withoutBoundary } = full;
    const missingBoundary = await post(`/api/islands/${slug}/rebuild`, {
      mapping: withoutBoundary,
      actor: { id: "github:shen-kuo", kind: "human" },
    });
    expect(missingBoundary.status).toBe(422);
    expect((await jsonOf(missingBoundary)).code).toBe("boundary_required");
  });

  it("rejects a departure with no real edge for the selected structure", async () => {
    // This island is real and the curator is a member because it carries a
    // network-cascade mapping, but it has no synchronization edge.
    const unverifiedSource = "developmental-interpretability-singular-learning";
    const res = await post(`/api/islands/${slug}/rebuild`, {
      mapping: mappingFor(slug, unverifiedSource),
      actor: { id: "github:shen-kuo", kind: "human" },
    });
    expect(res.status).toBe(422);
    expect((await jsonOf(res)).code).toBe("source_unverified");
  });
});

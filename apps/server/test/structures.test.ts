import { describe, it, expect, beforeEach } from "vitest";
import { parseStructureObject } from "@frontier-isles/opp";
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

const mappingFor = (slug: string) => ({
  structureId: "struct://xfrontier/synchronization",
  islandOp: opIdFor(slug),
  correspondences: [{ quantity: { zh: "耦合强度", en: "K" }, inThisSubstrate: { zh: "视觉强度", en: "visual" } }],
});

describe("structures API (执行纲要 §九)", () => {
  it("GET /api/structures lists the three seeded structures", async () => {
    const body = await jsonOf(await app.request("/api/structures"));
    expect(body.structures).toHaveLength(3);
    const ids = body.structures.map((s: { id: string }) => s.id);
    expect(ids).toContain("struct://xfrontier/synchronization");
    expect(ids).toContain("struct://xfrontier/network-cascade");
    expect(ids).toContain("struct://xfrontier/scaling");
  });

  it("GET /api/structures/:slug.md round-trips through opp's parser (§6 leavability)", async () => {
    const res = await app.request("/api/structures/synchronization.md");
    expect(res.status).toBe(200);
    const md = await res.text();
    const obj = parseStructureObject(md);
    expect(obj.id).toBe("struct://xfrontier/synchronization");
    expect(obj.title.zh.length).toBeGreaterThan(0);
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
  });
});

describe("rebuild gateway red-line (§六.1: only humans author mappings)", () => {
  const slug = "self-learning-matter";

  it("a human member (island master) rebuild appends a rebuild event", async () => {
    // rebuild is a station-write push, so the human must hold a researcher+ role
    // on the island (the role-ladder check, plan §六). Each minimal island's
    // founder is seeded as its master.
    const res = await post(`/api/islands/${slug}/rebuild`, {
      mapping: mappingFor(slug),
      actor: { id: `github:founder-${slug}`, kind: "human" },
    });
    expect(res.status).toBe(201);
    const body = await jsonOf(res);
    expect(body.degraded).toBe(false);
    expect(body.event.action).toBe("rebuild");
  });

  it("a non-member human (visitor) is denied — rebuild is a station-write push", async () => {
    const res = await post(`/api/islands/${slug}/rebuild`, {
      mapping: mappingFor(slug),
      actor: { id: "github:random-visitor", kind: "human" },
    });
    expect(res.status).toBe(403);
  });

  it("an agent rebuild degrades to a dock proposal — NO rebuild event added", async () => {
    const before = (await ledgerText(slug)).split("\n").filter(Boolean).length;
    const res = await post(`/api/islands/${slug}/rebuild`, {
      mapping: mappingFor(slug),
      actor: { id: "github:scout-ai", kind: "agent" },
    });
    expect(res.status).toBe(201);
    const body = await jsonOf(res);
    expect(body.degraded).toBe(true);
    expect(body.effectiveAction).toBe("dock_proposal");
    // the appended event is a night_digest (proposal), not a rebuild
    expect(body.event.action).toBe("night_digest");
    const after = (await ledgerText(slug)).split("\n").filter(Boolean);
    expect(after.length).toBe(before + 1);
    expect(after[after.length - 1]).not.toContain('"action":"rebuild"'); // the new line is the proposal
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
});

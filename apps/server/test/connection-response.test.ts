import { beforeEach, describe, expect, it } from "vitest";
import type { Hono } from "hono";
import { openDb } from "../src/db.js";
import { createApp } from "../src/app.js";
import { seed } from "../src/seed.js";
import { Store, opIdFor } from "../src/store.js";
import { refHash } from "../src/refs.js";

let store: Store;
let app: Hono;

beforeEach(() => {
  store = new Store(openDb(":memory:"));
  seed(store);
  app = createApp(store);
});

const post = (slug: string, body: unknown) =>
  app.request(`/api/islands/${slug}/connection-response`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jsonOf = async (res: { json(): Promise<unknown> }): Promise<any> => res.json();

const evidence = {
  ro_crate: "https://frontier-isles.test/ro-crate/connection-response",
  role: "replication" as const,
  hash: `sha256:${"a".repeat(64)}`,
};

const targetFor = (from: string, to: string, sign: "affirm" | "contest") => {
  const current = store.seaData().currents.find(
    (item) => item.from === opIdFor(from) && item.to === opIdFor(to) && item.sign === sign,
  );
  const targetRef = current?.records[0]?.targetRef;
  if (!targetRef) throw new Error(`missing seeded target ${from} -> ${to}`);
  return targetRef;
};

describe("connection response API", () => {
  it("records a challenge artifact and projects it back onto the target connection", async () => {
    const slug = "bio-compute-thermo";
    const targetRef = targetFor("living-wires", slug, "affirm");
    const actor = { id: `github:founder-${slug}`, kind: "human" as const };
    const res = await post(slug, {
      targetRef,
      action: "refute",
      body: "热力学计算的耗散约束只在稳态近似下成立，不能直接证明活体导线机制。",
      test: "改变供能通量；若对应成立，导线传输与熵产生率应出现同一临界转折。",
      evidence,
      language: "zh",
      actor,
    });

    expect(res.status).toBe(201);
    const written = await jsonOf(res);
    expect(written).toMatchObject({
      degraded: false,
      effectiveAction: "refute",
      targetRef,
      sourceIslandOp: opIdFor("living-wires"),
      respondingIslandOp: opIdFor(slug),
    });
    expect(written.responseRef).toMatch(/^sha256:[0-9a-f]{64}$/);

    const contest = store.seaData().currents.find(
      (item) => item.from === opIdFor("living-wires") && item.to === opIdFor(slug) && item.sign === "contest",
    );
    expect(contest?.records).toEqual([
      expect.objectContaining({
        targetRef,
        responseRef: written.responseRef,
        responseBody: "热力学计算的耗散约束只在稳态近似下成立，不能直接证明活体导线机制。",
        responseTest: "改变供能通量；若对应成立，导线传输与熵产生率应出现同一临界转折。",
        responseEvidence: evidence,
        actor: actor.id,
        historical: false,
      }),
    ]);
    expect(store.seaData().whirlpools).toContainEqual({
      between: [opIdFor("living-wires"), opIdFor(slug)],
      refs: [targetRef],
      weight: 1,
    });
    expect(store.getRef(written.responseRef)).toMatchObject({
      kind: "note",
      content: { targetRef, evidence },
    });
    expect(store.getPlacements(opIdFor(slug), "workshop")).toContainEqual(
      expect.objectContaining({
        refHash: written.responseRef,
        meta: expect.objectContaining({
          targetRef,
          sourceIslandOp: opIdFor("living-wires"),
          responseKind: "connection",
        }),
      }),
    );
    expect(store.verify(opIdFor(slug)).ok).toBe(true);
  });

  it("rejects missing evidence without adding an event", async () => {
    const slug = "bio-compute-thermo";
    const before = store.getEvents(opIdFor(slug)).length;
    const res = await post(slug, {
      targetRef: targetFor("living-wires", slug, "affirm"),
      action: "validate",
      body: "A concrete supporting argument.",
      test: "A discriminating test.",
      actor: { id: `github:founder-${slug}`, kind: "human" },
    });
    expect(res.status).toBe(422);
    expect((await jsonOf(res)).code).toBe("evidence_required");
    expect(store.getEvents(opIdFor(slug))).toHaveLength(before);
  });

  it("rolls back the response ref when a human lacks island capability", async () => {
    const slug = "bio-compute-thermo";
    const targetRef = targetFor("living-wires", slug, "affirm");
    const payload = {
      targetRef,
      body: "A visitor cannot formalize this challenge.",
      test: "No event should be written.",
      language: "en",
      evidence,
    };
    const before = store.getEvents(opIdFor(slug)).length;
    const res = await post(slug, {
      ...payload,
      action: "refute",
      actor: { id: "github:unaffiliated-visitor", kind: "human" },
    });
    expect(res.status).toBe(403);
    expect(store.getEvents(opIdFor(slug))).toHaveLength(before);
    expect(store.getRef(refHash(payload))).toBeUndefined();
  });

  it.each([
    ["target_required", { targetRef: "", body: "argument", test: "test" }],
    ["target_unanchored", { targetRef: `sha256:${"b".repeat(64)}`, body: "argument", test: "test" }],
    ["body_required", { body: "", test: "test" }],
    ["test_required", { body: "argument", test: "" }],
  ])("rejects %s", async (code, override) => {
    const slug = "bio-compute-thermo";
    const valid = {
      targetRef: targetFor("living-wires", slug, "affirm"),
      action: "validate",
      body: "argument",
      test: "test",
      evidence,
      actor: { id: `github:founder-${slug}`, kind: "human" },
    } as const;
    const res = await post(slug, { ...valid, ...override });
    expect(res.status).toBe(422);
    expect((await jsonOf(res)).code).toBe(code);
  });

  it("rejects a same-island response even from its founder", async () => {
    const slug = "living-wires";
    const targetRef = store.getEvents(opIdFor(slug)).find((event) => event.action === "submit_claim")?.ref;
    const res = await post(slug, {
      targetRef,
      action: "refute",
      body: "Internal weather is not a cross-island connection.",
      test: "Keep the sea projection unchanged.",
      evidence,
      actor: { id: `github:founder-${slug}`, kind: "human" },
    });
    expect(res.status).toBe(422);
    expect((await jsonOf(res)).code).toBe("same_island");
  });
});

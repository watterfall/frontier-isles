import { describe, it, expect, beforeEach } from "vitest";
import { parseProblemObject, verifyChain, type LedgerEvent } from "@frontier-isles/opp";
import { openDb } from "../src/db.js";
import { Store } from "../src/store.js";
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
  app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jsonOf = async (res: { json(): Promise<unknown> }): Promise<any> => res.json();

const MASTER = { id: "github:shen-kuo", kind: "human" as const };

describe("seed + chart", () => {
  it("seeds the 20 chart islands", async () => {
    const res = await app.request("/api/islands");
    const { islands } = await jsonOf(res);
    expect(islands).toHaveLength(20);
    const sample = islands.find((i: any) => i.slug === "machine-curiosity");
    expect(sample.name).toBe("AI 之问");
    expect(sample.members).toBe(9);
    expect(sample.growth.stage).toBe("academy");
  });
});

describe("founding ceremony", () => {
  it("writes a valid problem object + verifiable ledger + nine stations", async () => {
    const res = await post("/api/islands", {
      slug: "machine-curiosity-2",
      title: "机器好奇心 II",
      name: "机器好奇心 II",
      qfocus: "好奇心能否被写成一个可优化又不被训坏的目标？",
      domain: "交叉",
      questions: [
        { text: "机器会为一个问题失眠吗？", open: true },
        { text: "「无聊」是不是好奇心的必要条件？", open: false },
        { text: "让模型自己选题，它会选什么？", open: true, rewrittenFrom: "模型会选什么题？" },
      ],
      votes: { "0": 4, "1": 2, "2": 5 },
      ceremonyLog: ["卷轴展开", "素材入卷", "定名上墙"],
      actor: MASTER,
    });
    expect(res.status).toBe(201);
    const { island } = await jsonOf(res);

    // problem object validates via opp
    const parsed = parseProblemObject(island.md);
    expect(parsed.object.id).toBe("op://frontier-isles/prob/machine-curiosity-2");
    expect(parsed.object.status).toBe("open");

    // nine stations created (incl. dock)
    expect(island.stations).toHaveLength(9);
    expect(island.stations.map((s: any) => s.kind)).toContain("dock");

    // ledger verifies via verifyChain — genesis + 3 questions
    const jsonl = await (await app.request("/api/islands/machine-curiosity-2/ledger.jsonl")).text();
    const events: LedgerEvent[] = jsonl.trim().split("\n").map((l) => JSON.parse(l));
    expect(events).toHaveLength(4);
    expect(events[0]!.action).toBe("found_island");
    expect(verifyChain(events).ok).toBe(true);
  });
});

describe("append endpoint", () => {
  it("rejects a broken prev (409)", async () => {
    const res = await post("/api/islands/machine-curiosity/events", {
      actor: MASTER,
      action: "propose_subquestion",
      phase: "A",
      payload: { text: "一个新子问题" },
      prev: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    });
    expect(res.status).toBe(409);
  });

  it("rejects an invalid event (400)", async () => {
    const res = await post("/api/islands/machine-curiosity/events", {
      actor: MASTER,
      action: "propose_subquestion",
      phase: "Z", // invalid phase → LedgerEventSchema rejects
      payload: { text: "坏事件" },
    });
    expect(res.status).toBe(400);
  });

  it("accepts an authorized append and keeps the chain intact", async () => {
    const res = await post("/api/islands/machine-curiosity/events", {
      actor: MASTER,
      action: "propose_subquestion",
      payload: { text: "合法的新问题" },
    });
    expect(res.status).toBe(201);
    const body = await jsonOf(res);
    expect(body.degraded).toBe(false);
    expect(store.verify("op://frontier-isles/prob/machine-curiosity").ok).toBe(true);
  });
});

describe("capability gateway", () => {
  const AGENT = { id: "github:test-agent", kind: "agent" as const };

  it("degrades an ungranted agent submit_claim to a dock proposal", async () => {
    const res = await post("/api/islands/machine-curiosity/events", {
      actor: AGENT,
      action: "submit_claim",
      payload: { body: "AI 主张：提问新颖度可由信息增益近似" },
    });
    expect(res.status).toBe(201);
    const body = await jsonOf(res);
    expect(body.degraded).toBe(true);
    expect(body.effectiveAction).toBe("dock_proposal");
    expect(body.event.action).toBe("night_digest");
    expect(body.proposalHash).toBeTruthy();
  });

  it("lets the agent submit a real claim after a master grants station_write", async () => {
    const grant = await post("/api/islands/machine-curiosity/events", {
      actor: MASTER,
      action: "grant_capability",
      payload: { agent: AGENT.id, capability: "station_write" },
    });
    expect(grant.status).toBe(201);

    const res = await post("/api/islands/machine-curiosity/events", {
      actor: AGENT,
      action: "submit_claim",
      payload: { body: "现在是被授权的正式主张" },
    });
    expect(res.status).toBe(201);
    const body = await jsonOf(res);
    expect(body.degraded).toBe(false);
    expect(body.effectiveAction).toBe("submit_claim");
  });

  it("denies a non-push capability to an unauthorized actor (403)", async () => {
    const res = await post("/api/islands/machine-curiosity/events", {
      actor: { id: "github:nobody", kind: "human" },
      action: "grant_capability",
      payload: { agent: "github:x", capability: "publish" },
    });
    expect(res.status).toBe(403);
  });
});

describe("morning report HITL", () => {
  it("lists dock drafts and adopts one with joint human+AI credit", async () => {
    const list = await jsonOf(await app.request("/api/islands/machine-curiosity/morning-report"));
    expect(list.drafts.length).toBe(3);
    const refHash: string = list.drafts[0].refHash;

    const res = await post(
      `/api/islands/machine-curiosity/morning-report/${encodeURIComponent(refHash)}`,
      { decision: "adopt", actor: MASTER },
    );
    expect(res.status).toBe(201);
    const body = await jsonOf(res);
    expect(body.event.action).toBe("adopt");
    expect(body.event.actor.kind).toBe("pair");
    expect(body.event.credit).toContain("curation");
    expect(body.event.credit.some((c: string) => c.startsWith("credit:ai/"))).toBe(true);

    const after = await jsonOf(await app.request("/api/islands/machine-curiosity/morning-report"));
    expect(after.drafts.length).toBe(2);
  });

  it("returns a draft to driftwood", async () => {
    const list = await jsonOf(await app.request("/api/islands/machine-curiosity/morning-report"));
    const refHash: string = list.drafts[0].refHash;
    const res = await post(
      `/api/islands/machine-curiosity/morning-report/${encodeURIComponent(refHash)}`,
      { decision: "return", actor: MASTER },
    );
    const body = await jsonOf(res);
    expect(body.event.action).toBe("return_to_driftwood");
  });
});

describe("export", () => {
  it("problem.md round-trips through opp", async () => {
    const md = await (await app.request("/api/islands/machine-curiosity/problem.md")).text();
    const parsed = parseProblemObject(md);
    expect(parsed.object.id).toBe("op://frontier-isles/prob/machine-curiosity");
    expect(parsed.object.title).toBe("机器的好奇心");
  });
});

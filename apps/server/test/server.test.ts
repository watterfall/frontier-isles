import { describe, it, expect, beforeEach } from "vitest";
import { parseProblemObject, verifyChain, type LedgerEvent } from "@frontier-isles/opp";
import { hasClaimEvidence } from "@frontier-isles/core";
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
  it("seeds the chart islands", async () => {
    const res = await app.request("/api/islands");
    const { islands } = await jsonOf(res);
    expect(islands).toHaveLength(79);
    const sample = islands.find((i: any) => i.slug === "machine-curiosity");
    expect(sample.name).toBe("AI 之问");
    expect(sample.members).toBe(9);
    expect(sample.growth.stage).toBe("academy");
  });

  it("serves a flagship island's rich interior via meta.atlas.interior", async () => {
    const detail = await jsonOf(await app.request("/api/islands/formal-math"));
    const interior = detail.atlas?.interior;
    expect(interior, "formal-math interior present").toBeTruthy();
    expect(interior.questions.length).toBeGreaterThanOrEqual(5);
    expect(interior.digests.length).toBeGreaterThanOrEqual(3);
    expect(interior.residents.length).toBeGreaterThanOrEqual(3);
    // Bilingual, and a real citation is carried through so provenance stays visible.
    expect(interior.questions[0].text.zh && interior.questions[0].text.en).toBeTruthy();
    expect(interior.digests.some((d: any) => d.cite?.title && d.cite?.year)).toBe(true);
    // A flagship reads as an academy/school, never empty.
    expect(["academy", "school"]).toContain(detail.growth.stage);
  });

  it("a non-flagship island has no interior (only the curated subset carries one)", async () => {
    const detail = await jsonOf(await app.request("/api/islands/dark-matter-paleo"));
    expect(detail.atlas?.interior).toBeUndefined();
  });
});

describe("GET /api/currents — the sea plane over the real seeded ledger", () => {
  it("emerges non-empty with real cross-island currents & whirlpools", async () => {
    const res = await app.request("/api/currents");
    const sea = await jsonOf(res);
    // FIRST-DATA HONESTY: the base seed has no cross-island refs, so this is only
    // non-empty because seedCrossIslandRelations wired real relations in.
    expect(sea.currents.length).toBeGreaterThan(0);
    expect(sea.whirlpools.length).toBeGreaterThan(0);
    expect(sea.islands.length).toBe(79);
  });

  it("every current & whirlpool is genuinely BETWEEN two distinct islands", async () => {
    const sea = await jsonOf(await app.request("/api/currents"));
    for (const c of sea.currents) expect(c.from).not.toBe(c.to);
    for (const w of sea.whirlpools) expect(w.between[0]).not.toBe(w.between[1]);
  });

  it("preserves the epistemic sign and bridge maturity end-to-end (invariant 8)", async () => {
    const sea = await jsonOf(await app.request("/api/currents"));
    const signs = new Set(sea.currents.map((c: any) => c.sign));
    expect(signs.has("affirm")).toBe(true);
    expect(signs.has("contest")).toBe(true);
    const bridges = sea.currents.filter((c: any) => c.kind === "bridge");
    expect(bridges.some((b: any) => b.maturity === "ratified")).toBe(true);
    expect(bridges.some((b: any) => b.maturity === "proposed")).toBe(true);
  });

  it("islands carry a manifold vec and a null-safe substrate (place plane)", async () => {
    const sea = await jsonOf(await app.request("/api/currents"));
    for (const i of sea.islands) {
      expect(i.vec).toHaveLength(2);
      expect(i.substrate === null || (typeof i.substrate === "number" && i.substrate >= 0)).toBe(true);
    }
    // the sample island has no atlas score → no sea depth (honest absence)
    const sample = sea.islands.find((i: any) => i.op.endsWith("/machine-curiosity"));
    expect(sample.substrate).toBeNull();
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

describe("claims & evidence enforcement (§4, Phase B.4)", () => {
  const HASH = `sha256:${"cd".repeat(32)}`;
  const EVIDENCE = { ro_crate: "https://zenodo.org/record/9/ro-crate", role: "replication", hash: HASH };

  it("rejects an evidence-less validate with 422 evidence_required (not silent degradation)", async () => {
    const before = store.getEvents("op://frontier-isles/prob/machine-curiosity").length;
    const res = await post("/api/islands/machine-curiosity/events", {
      actor: MASTER,
      action: "validate",
      payload: { ref: "sha256:claim1", body: "我复现了,信我" },
    });
    expect(res.status).toBe(422);
    const body = await jsonOf(res);
    expect(body.code).toBe("evidence_required");
    // Nothing was written — the ledger is exactly as long as before.
    expect(store.getEvents("op://frontier-isles/prob/machine-curiosity")).toHaveLength(before);
  });

  it("rejects an evidence-less refute even from an agent that WOULD degrade to a dock proposal", async () => {
    // Record honesty precedes the capability gateway: an ungranted agent's
    // evidence-less refute is a hard 422, never parked at the dock.
    const res = await post("/api/islands/machine-curiosity/events", {
      actor: { id: "github:test-agent", kind: "agent" },
      action: "refute",
      payload: { ref: "sha256:claim1", body: "无证据的反驳" },
    });
    expect(res.status).toBe(422);
    expect((await jsonOf(res)).code).toBe("evidence_required");
  });

  it("accepts a validate whose payload embeds an evidence-role data ref (claim-response shape)", async () => {
    const res = await post("/api/islands/machine-curiosity/events", {
      actor: MASTER,
      action: "validate",
      payload: { ref: "sha256:claim1", body: "独立复现成功", evidence: EVIDENCE },
    });
    expect(res.status).toBe(201);
    const body = await jsonOf(res);
    expect(body.degraded).toBe(false);
    expect(body.effectiveAction).toBe("validate");
    // The event's ref resolves to content carrying the evidence (§4).
    const ref = store.getRef(body.event.ref)!;
    expect((ref.content as { evidence?: unknown }).evidence).toEqual(EVIDENCE);
  });

  it("accepts a refute whose payload IS a direct evidence-role data ref", async () => {
    const res = await post("/api/islands/machine-curiosity/events", {
      actor: MASTER,
      action: "refute",
      payload: { ro_crate: "https://osf.io/c/ro-crate", role: "evidence", hash: HASH },
    });
    expect(res.status).toBe(201);
    expect((await jsonOf(res)).effectiveAction).toBe("refute");
  });

  it("seeded refute/validate events all reference evidence-compliant content (compliant demo ledger)", async () => {
    const islands = await jsonOf(await app.request("/api/islands"));
    let checked = 0;
    for (const island of islands.islands) {
      for (const e of store.getEvents(island.opId) as LedgerEvent[]) {
        if (e.action !== "refute" && e.action !== "validate") continue;
        expect(e.ref).toBeTruthy();
        const resolved = store.getRef(e.ref!);
        expect(resolved).toBeTruthy();
        expect(hasClaimEvidence(resolved!.content)).toBe(true);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(0); // the sea's refute/validate currents exist
  });
});

describe("ref resolution", () => {
  it("resolves a ledger event's ref to its stored kind+content (read-only leavability path)", async () => {
    const list = await jsonOf(await app.request("/api/islands/machine-curiosity/morning-report"));
    const refHash: string = list.drafts[0].refHash;
    const res = await app.request(`/api/refs/${encodeURIComponent(refHash)}`);
    expect(res.status).toBe(200);
    const body = await jsonOf(res);
    expect(body.kind).toBe("morning_report");
    expect(body.content.title).toBeTruthy();
  });

  it("404s on an unknown hash", async () => {
    const res = await app.request("/api/refs/sha256:0000000000000000000000000000000000000000000000000000000000000000");
    expect(res.status).toBe(404);
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

  it("drafts are drawn from the real ledger (core's projectMorningReport), not seed constants — each carries its own title/dest/actor/credit", async () => {
    const list = await jsonOf(await app.request("/api/islands/machine-curiosity/morning-report"));
    expect(list.drafts).toHaveLength(3);
    for (const d of list.drafts) {
      expect(typeof d.refHash).toBe("string");
      expect(typeof d.title).toBe("string");
      expect(d.title.length).toBeGreaterThan(0);
      expect(typeof d.dest).toBe("string");
      expect(d.actorKind).toBe("agent"); // seed's 3 morning-report drafts are all agent-authored
      expect(Array.isArray(d.credit)).toBe(true);
    }
    // Distinct agents (curiosity-scout / synthesizer / devils-advocate) — not one flat static array.
    const actors = new Set(list.drafts.map((d: { actorId: string }) => d.actorId));
    expect(actors.size).toBe(3);
  });

  it("an adopted draft is gone from the inbox even after re-fetching (status resolved from the ledger, not local UI state)", async () => {
    const before = await jsonOf(await app.request("/api/islands/machine-curiosity/morning-report"));
    const refHash: string = before.drafts[0].refHash;
    await post(`/api/islands/machine-curiosity/morning-report/${encodeURIComponent(refHash)}`, {
      decision: "adopt",
      actor: MASTER,
    });
    const after = await jsonOf(await app.request("/api/islands/machine-curiosity/morning-report"));
    expect(after.drafts.some((d: { refHash: string }) => d.refHash === refHash)).toBe(false);
  });
});

describe("transplant-through-dock (Phase B.3)", () => {
  const OP = "op://frontier-isles/prob/machine-curiosity";
  const APPRENTICE = { id: "github:a-ruo", kind: "human" as const }; // seeded apprentice — no station_write

  const firstDriftwood = async (): Promise<{ refHash: string; atom: string; text: string }> => {
    const list = await jsonOf(await app.request("/api/islands/machine-curiosity/driftwood"));
    return list.atoms[0];
  };

  it("lists real driftwood atoms available to transplant (not the returned-to-driftwood ghosts)", async () => {
    const list = await jsonOf(await app.request("/api/islands/machine-curiosity/driftwood"));
    expect(list.atoms.length).toBe(4); // seed drops 4 driftwood atoms; the 3 ghosts are excluded
    for (const a of list.atoms) {
      expect(typeof a.refHash).toBe("string");
      expect(typeof a.text).toBe("string");
      expect(a.text.length).toBeGreaterThan(0);
    }
  });

  it("a researcher-or-above human transplants a driftwood atom → one transplant event whose ref is a bridge artifact carrying the persistent once-driftwood mark", async () => {
    const drift = await firstDriftwood();
    const res = await post("/api/islands/machine-curiosity/transplant", {
      actor: MASTER,
      driftwoodRef: drift.refHash,
      type: "concept-prototype",
      dest: "workshop",
      body: "陶土原型机 · 曾为散木",
      flow: "hypothesis-output",
    });
    expect(res.status).toBe(201);
    const body = await jsonOf(res);
    expect(body.degraded).toBe(false);
    expect(body.event.action).toBe("transplant");
    expect(body.event.phase).toBe("B");
    expect(body.event.flow).toBe("hypothesis-output");

    // The event carries only a ref — the bridge artifact content lives in the ref store.
    const artifact = await jsonOf(await app.request(`/api/refs/${encodeURIComponent(body.refHash)}`));
    expect(artifact.kind).toBe("bridge_artifact");
    expect(artifact.content.type).toBe("concept-prototype");
    expect(artifact.content.dest).toBe("workshop");
    // "once driftwood" mark persists inside the artifact, pointing back at the source.
    expect(artifact.content.onceDriftwood).toBe(drift.refHash);

    // Place plane: passed through the dock AND landed at the target station.
    expect(store.getPlacements(OP, "dock").some((p) => p.refHash === body.refHash)).toBe(true);
    expect(store.getPlacements(OP, "workshop").some((p) => p.refHash === body.refHash)).toBe(true);

    // Exactly one transplant event, chain intact.
    const events = store.getEvents(OP).filter((e) => e.action === "transplant");
    expect(events.length).toBe(1);
    expect(store.verify(OP).ok).toBe(true);
  });

  it("404s on a driftwood ref that does not exist", async () => {
    const res = await post("/api/islands/machine-curiosity/transplant", {
      actor: MASTER,
      driftwoodRef: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      type: "concept-prototype",
      dest: "workshop",
    });
    expect(res.status).toBe(404);
  });

  it("denies an apprentice with no station_write (403) — the only path into a formal station is a privileged human", async () => {
    const drift = await firstDriftwood();
    const res = await post("/api/islands/machine-curiosity/transplant", {
      actor: APPRENTICE,
      driftwoodRef: drift.refHash,
      type: "analogy-mapping",
      dest: "library",
    });
    expect(res.status).toBe(403);
  });

  it("400s on an invalid bridge artifact type", async () => {
    const drift = await firstDriftwood();
    const res = await post("/api/islands/machine-curiosity/transplant", {
      actor: MASTER,
      driftwoodRef: drift.refHash,
      type: "not-a-bridge",
      dest: "workshop",
    });
    expect(res.status).toBe(400);
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

describe("auth", () => {
  it("oauth routes 501 when unconfigured", async () => {
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
    expect((await app.request("/api/auth/github")).status).toBe(501);
    expect((await app.request("/api/auth/github/callback?code=x&state=y")).status).toBe(501);
  });

  it("oauth redirect carries a state nonce bound to a cookie", async () => {
    process.env.GITHUB_CLIENT_ID = "test-client";
    const res = await app.request("/api/auth/github");
    expect(res.status).toBe(302);
    const loc = res.headers.get("location") ?? "";
    const state = /[?&]state=([0-9a-f]+)/.exec(loc)?.[1];
    expect(state).toBeTruthy();
    expect(res.headers.get("set-cookie")).toContain(`fi_oauth_state=${state}`);
    delete process.env.GITHUB_CLIENT_ID;
  });

  it("callback rejects a state mismatch", async () => {
    process.env.GITHUB_CLIENT_ID = "test-client";
    process.env.GITHUB_CLIENT_SECRET = "test-secret";
    const res = await app.request("/api/auth/github/callback?code=abc&state=forged", {
      headers: { cookie: "fi_oauth_state=legit" },
    });
    expect(res.status).toBe(400);
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
  });

  it("logout clears the session", async () => {
    const login = await post("/api/auth/dev-login", { handle: "logout-case" });
    const cookie = (login.headers.get("set-cookie") ?? "").split(";")[0] ?? "";
    const me1 = await jsonOf(await app.request("/api/me", { headers: { cookie } }));
    expect(me1.actor.id).toBe("github:logout-case");
    await app.request("/api/auth/logout", { method: "POST", headers: { cookie } });
    const me2 = await jsonOf(await app.request("/api/me", { headers: { cookie } }));
    expect(me2.actor).toBeNull();
  });
});

describe("my harbor (depth-plan-v1 §3(d))", () => {
  it("is null when logged out — the atlas opens world-wide", async () => {
    const { harbor } = await jsonOf(await app.request("/api/harbor"));
    expect(harbor).toBeNull();
  });

  it("returns the session actor's membership footprint as slugs", async () => {
    const login = await post("/api/auth/dev-login", { handle: "shen-kuo" });
    const cookie = (login.headers.get("set-cookie") ?? "").split(";")[0] ?? "";
    const { harbor } = await jsonOf(await app.request("/api/harbor", { headers: { cookie } }));
    expect(harbor.actorId).toBe("github:shen-kuo");
    expect(harbor.islandSlugs).toContain("machine-curiosity");
  });

  it("a brand-new actor has an empty harbor (honest absence, no fake anchor)", async () => {
    const login = await post("/api/auth/dev-login", { handle: "first-visit" });
    const cookie = (login.headers.get("set-cookie") ?? "").split(";")[0] ?? "";
    const { harbor } = await jsonOf(await app.request("/api/harbor", { headers: { cookie } }));
    expect(harbor.islandSlugs).toEqual([]);
  });

  it("a capability grant places the island in the agent's footprint", () => {
    const row = store.getProblemRow("machine-curiosity")!;
    store.addGrant(row.opId, "github:scout", "propose_subquestion", "github:shen-kuo", "h0");
    expect(store.actorFootprint("github:scout")).toContain("machine-curiosity");
  });
});

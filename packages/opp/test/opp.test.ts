import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";
import {
  parseProblemObject,
  serializeProblemObject,
  ProblemObjectSchema,
  LedgerEventSchema,
  hashEvent,
  appendEvent,
  verifyChain,
  reduceNightScience,
  type LedgerEvent,
  type UnchainedEvent,
} from "../src/index";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(here, "fixtures", "machine-curiosity.md"), "utf8");

describe("P0 acceptance — machine-curiosity.md", () => {
  const parsed = parseProblemObject(fixture);

  it("validates and parses into all typed references", () => {
    const { object, body } = parsed;
    expect(object.schema).toBe("opp/0.2");
    expect(object.id).toBe("op://frontier-isles/prob/machine-curiosity");
    expect(object.title).toBe("机器的好奇心");
    expect(object.status).toBe("active");
    expect(object.qfocus.trim()).toBe("AI 能否提出一个人类没想到的好问题？");

    // one hardware ref
    expect(object.hardware).toHaveLength(1);
    expect(object.hardware[0]?.role).toBe("instrument");
    expect(object.hardware[0]?.hash).toMatch(/^sha256:[0-9a-f]{64}$/);

    // two data refs: evidence + replication
    expect(object.data.map((d) => d.role)).toEqual(["evidence", "replication"]);

    // one agent with propose + driftwood_write
    expect(object.agents).toHaveLength(1);
    expect(object.agents[0]?.id).toBe("github:curiosity-scout");
    expect(object.agents[0]?.capabilities).toEqual(["propose", "driftwood_write"]);

    // ledger derived / present, license present
    expect(object.ledger).toBe("events://op://frontier-isles/prob/machine-curiosity");
    expect(object.license).toBe("CC-BY-4.0");

    // zh body sections mapped to canonical keys
    expect(body.night).toContain("漂流木");
    expect(body.bridge).toContain("analogy-mapping");
    expect(body.dayClaims).toContain("展厅");
    expect(body.openSubQuestions).toContain("新颖度");
    expect(body.raw).toContain("## 夜");
  });

  it("round-trips serialize -> parse losslessly for front-matter", () => {
    const md = serializeProblemObject(parsed.object, parsed.body);
    const reparsed = parseProblemObject(md);
    expect(reparsed.object).toEqual(parsed.object);
  });

  it("derives ledger for a minimal hand-written file", () => {
    const minimal = ProblemObjectSchema.parse({
      schema: "opp/0.2",
      id: "op://demo/prob/tiny",
      title: "Tiny",
      status: "open",
      qfocus: "Is less more?",
    });
    expect(minimal.ledger).toBe("events://op://demo/prob/tiny");
    expect(minimal.license).toBe("CC-BY-4.0");
    expect(minimal.lineage.children).toEqual([]);
    expect(minimal.night_science).toEqual({ A: 0, B: 0, D: 0 });
  });
});

describe("front-matter rejects invalid input", () => {
  const base = {
    schema: "opp/0.2" as const,
    id: "op://demo/prob/x",
    title: "X",
    status: "open" as const,
    qfocus: "q?",
  };

  it("rejects an invalid status", () => {
    expect(() => ProblemObjectSchema.parse({ ...base, status: "closed" })).toThrow();
  });

  it("rejects a malformed op id", () => {
    expect(() => ProblemObjectSchema.parse({ ...base, id: "op://demo/machine" })).toThrow();
  });

  it("rejects an invalid data role", () => {
    expect(() =>
      ProblemObjectSchema.parse({
        ...base,
        data: [{ ro_crate: "https://x", role: "citation", hash: "sha256:" + "a".repeat(64) }],
      }),
    ).toThrow();
  });

  it("rejects a non-prefixed agent id", () => {
    expect(() =>
      ProblemObjectSchema.parse({ ...base, agents: [{ id: "curiosity-scout", capabilities: [] }] }),
    ).toThrow();
  });

  it("rejects a bad hardware hash", () => {
    expect(() =>
      ProblemObjectSchema.parse({
        ...base,
        hardware: [{ manifest: "https://x", role: "instrument", hash: "md5:abc" }],
      }),
    ).toThrow();
  });
});

describe("ledger hash chain", () => {
  const op = "op://frontier-isles/prob/machine-curiosity";
  const human = { id: "github:alice", kind: "human" as const };
  const agent = { id: "github:curiosity-scout", kind: "agent" as const };

  const mk = (over: Partial<UnchainedEvent>): UnchainedEvent => ({
    ts: "2026-07-07T00:00:00.000Z",
    op,
    actor: human,
    credit: ["conceptualization"],
    phase: "A",
    action: "found_island",
    ...over,
  });

  function buildChain(): LedgerEvent[] {
    let chain: LedgerEvent[] = [];
    chain = appendEvent(chain, mk({ action: "found_island", phase: "A" }));
    chain = appendEvent(
      chain,
      mk({ actor: agent, action: "propose_subquestion", phase: "A", credit: ["credit:ai/ideation"] }),
    );
    chain = appendEvent(chain, mk({ action: "submit_claim", phase: "D", credit: ["validation"] }));
    chain = appendEvent(chain, mk({ action: "refute", phase: "D" }));
    return chain;
  }

  it("appends with prev links and verifies clean", () => {
    const chain = buildChain();
    expect(chain[0]?.prev).toBeUndefined();
    expect(chain[1]?.prev).toBe(hashEvent(chain[0]!));
    expect(verifyChain(chain)).toEqual({ ok: true });
  });

  it("detects a tampered middle event", () => {
    const chain = buildChain();
    const tampered = chain.map((e, i) =>
      i === 1 ? ({ ...e, credit: ["conceptualization", "forged"] } as LedgerEvent) : e,
    );
    const result = verifyChain(tampered);
    expect(result.ok).toBe(false);
    expect(result.brokenAt).toBe(2);
  });

  it("detects reordering", () => {
    const chain = buildChain();
    const swapped = [chain[0]!, chain[2]!, chain[1]!, chain[3]!];
    expect(verifyChain(swapped).ok).toBe(false);
  });

  it("hash is stable regardless of key order and ignores sig", () => {
    const a = LedgerEventSchema.parse(mk({ action: "publish", phase: "B" }));
    const b = LedgerEventSchema.parse({ ...mk({ action: "publish", phase: "B" }), sig: "ed25519:zzz" });
    expect(hashEvent(a)).toBe(hashEvent(b));
    expect(hashEvent(a)).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("reduceNightScience counts phases", () => {
    const chain = buildChain();
    expect(reduceNightScience(chain)).toEqual({ A: 2, B: 0, D: 2 });
  });
});

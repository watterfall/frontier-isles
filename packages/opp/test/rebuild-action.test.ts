import { describe, it, expect } from "vitest";
import { LedgerEventSchema, appendEvent, verifyChain } from "../src/ledger";

describe("rebuild action (执行纲要 §九 — the edge of the structure⇄island graph)", () => {
  const base = {
    ts: "2026-07-12T00:00:00Z",
    op: "op://frontier-isles/prob/firefly-sync",
    actor: { id: "github:shen-kuo", kind: "human" as const },
    phase: "B" as const,
    action: "rebuild" as const,
    ref: "sha256:" + "a".repeat(64),
    credit: [],
  };

  it("accepts a rebuild event", () => {
    expect(() => LedgerEventSchema.parse(base)).not.toThrow();
  });

  it("chains + verifies alongside legacy actions (0.2 ledgers stay compatible)", () => {
    let chain = appendEvent([], base);
    chain = appendEvent(chain, { ...base, action: "validate" });
    chain = appendEvent(chain, { ...base, action: "fork" });
    expect(verifyChain(chain).ok).toBe(true);
    expect(chain[0].action).toBe("rebuild");
  });
});

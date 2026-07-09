import { describe, it, expect } from "vitest";
import type { ActionType, LedgerEvent } from "@frontier-isles/opp";
import { projectClaimState, CONSENSUS_MIN } from "../src/index";

let clock = 0;
/** Minimal ledger event with a strictly increasing timestamp. */
const ev = (op: string, action: ActionType, ref?: string): LedgerEvent => ({
  ts: `2026-01-01T00:00:${String(++clock).padStart(2, "0")}.000Z`,
  op,
  actor: { id: "github:tester", kind: "human" },
  credit: [],
  phase: "A",
  action,
  ref,
});

const R = "sha256:claim1";

describe("projectClaimState — a building is a claim reduced from the ledger", () => {
  it("submit_claim lays a foundation with no floors, no roof, no ghost", () => {
    const [c] = projectClaimState([ev("op://a", "submit_claim", R)]);
    expect(c).toMatchObject({ ref: R, island: "op://a", foundation: true, floors: 0, roof: false });
    expect(c!.ghost).toBeUndefined();
  });

  it("counts one floor per DISTINCT other island that validates (independent reproduction)", () => {
    const c = projectClaimState([
      ev("op://a", "submit_claim", R),
      ev("op://b", "validate", R),
      ev("op://c", "validate", R),
      ev("op://c", "validate", R), // same island twice → still one reproduction
    ])[0]!;
    expect(c.floors).toBe(2);
  });

  it("a self-validate by the anchor island is not an independent reproduction", () => {
    const c = projectClaimState([
      ev("op://a", "submit_claim", R),
      ev("op://a", "validate", R), // anchor validating its own claim
      ev("op://b", "validate", R),
    ])[0]!;
    expect(c.floors).toBe(1);
  });

  it(`roofs at ${CONSENSUS_MIN} independent reproductions, not before`, () => {
    const validators = (n: number): LedgerEvent[] =>
      Array.from({ length: n }, (_, i) => ev(`op://v${i}`, "validate", R));
    const four = projectClaimState([ev("op://a", "submit_claim", R), ...validators(4)])[0]!;
    const five = projectClaimState([ev("op://a", "submit_claim", R), ...validators(5)])[0]!;
    expect(four).toMatchObject({ floors: 4, roof: false });
    expect(five).toMatchObject({ floors: 5, roof: true });
  });

  it("a refute turns the claim into a refuted night ghost", () => {
    const c = projectClaimState([ev("op://a", "submit_claim", R), ev("op://b", "refute", R)])[0]!;
    expect(c.ghost).toBe("refuted");
  });

  it("a return_to_driftwood shelves it as a returned ghost; refute wins if both", () => {
    const returned = projectClaimState([ev("op://a", "submit_claim", R), ev("op://a", "return_to_driftwood", R)])[0]!;
    expect(returned.ghost).toBe("returned");
    const both = projectClaimState([
      ev("op://a", "submit_claim", R),
      ev("op://a", "return_to_driftwood", R),
      ev("op://b", "refute", R),
    ])[0]!;
    expect(both.ghost).toBe("refuted");
  });

  it("a publish is a foundation and carries a DOI", () => {
    const c = projectClaimState([ev("op://a", "publish", R)])[0]!;
    expect(c).toMatchObject({ foundation: true, hasDoi: true });
  });

  it("a ref with no claim/publication is NOT a building", () => {
    // a bare bridge_artifact ref never becomes a growing building
    expect(projectClaimState([ev("op://a", "bridge_artifact", R)])).toHaveLength(0);
  });

  it("activity counts every event over the claim", () => {
    const c = projectClaimState([
      ev("op://a", "submit_claim", R),
      ev("op://b", "validate", R),
      ev("op://c", "refute", R),
    ])[0]!;
    expect(c.activity).toBe(3);
  });

  it("is deterministic, stably ordered by ref, and never mutates its input", () => {
    const events = [
      ev("op://a", "submit_claim", "sha256:z"),
      ev("op://a", "submit_claim", "sha256:a"),
      ev("op://b", "validate", "sha256:a"),
    ];
    const copy = [...events];
    const first = projectClaimState(events);
    expect(projectClaimState(events)).toEqual(first);
    expect(first.map((c) => c.ref)).toEqual(["sha256:a", "sha256:z"]);
    expect(events).toEqual(copy);
  });
});

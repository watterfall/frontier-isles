import { describe, it, expect } from "vitest";
import type { ActionType, LedgerEvent } from "@frontier-isles/opp";
import { projectClaimState, CONSENSUS_MIN, extractEvidence, hasClaimEvidence } from "../src/index";

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

  it("counts a validate as ONE reproduction per distinct other island — §4 'a replication ref is one countable reproduction' (B.4 lock)", () => {
    // Three validates from the same reproducing island collapse to one floor;
    // a second island's validate adds exactly one more. The floor count is the
    // number of countable reproductions, never the number of validate events.
    const c = projectClaimState([
      ev("op://a", "submit_claim", R),
      ev("op://b", "validate", R),
      ev("op://b", "validate", R),
      ev("op://b", "validate", R),
      ev("op://c", "validate", R),
    ])[0]!;
    expect(c.floors).toBe(2);
    expect(c.activity).toBe(5); // every event still counts as activity
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

// ---------------------------------------------------------------------------
// Claims & evidence compliance (Phase B.4, architecture §4): the pure judgment
// the server gateway applies to NEW refute/validate writes. Write-side strict,
// read-side tolerant — projectClaimState above never consults these.
// ---------------------------------------------------------------------------

const HASH = `sha256:${"ab".repeat(32)}`;

describe("extractEvidence / hasClaimEvidence — §4 evidence-role data refs", () => {
  it("accepts a direct data ref with role=evidence (attach_data payload shape)", () => {
    const content = { ro_crate: "https://zenodo.org/record/1/ro-crate", role: "evidence", hash: HASH };
    expect(extractEvidence(content)).toEqual(content);
    expect(hasClaimEvidence(content)).toBe(true);
  });

  it("accepts a direct data ref with role=replication (one countable reproduction)", () => {
    const content = { ro_crate: "https://lab.example/replication.zip", role: "replication", hash: HASH };
    expect(extractEvidence(content)?.role).toBe("replication");
  });

  it("accepts a claim-response content that EMBEDS evidence (MCP refute payload shape)", () => {
    const content = {
      ref: "sha256:claim1",
      body: "反例:样本外测试不通过",
      evidence: { ro_crate: "https://osf.io/x/ro-crate", role: "evidence", hash: HASH },
    };
    expect(extractEvidence(content)).toEqual(content.evidence);
  });

  it("rejects data refs whose role is input/output — evidence roles only", () => {
    expect(hasClaimEvidence({ ro_crate: "https://x", role: "input", hash: HASH })).toBe(false);
    expect(hasClaimEvidence({ evidence: { ro_crate: "https://x", role: "output", hash: HASH } })).toBe(false);
  });

  it("rejects malformed hashes, missing ro_crate, and bare prose", () => {
    expect(hasClaimEvidence({ ro_crate: "https://x", role: "evidence", hash: "sha256:short" })).toBe(false);
    expect(hasClaimEvidence({ ro_crate: "https://x", role: "evidence", hash: "md5:abc" })).toBe(false);
    expect(hasClaimEvidence({ role: "evidence", hash: HASH })).toBe(false);
    expect(hasClaimEvidence({ ro_crate: "", role: "evidence", hash: HASH })).toBe(false);
    expect(hasClaimEvidence({ body: "我不同意这个结论" })).toBe(false);
    expect(hasClaimEvidence("一段散文")).toBe(false);
    expect(hasClaimEvidence(null)).toBe(false);
    expect(hasClaimEvidence(undefined)).toBe(false);
  });

  it("is pure: never mutates the content it judges", () => {
    const content = { evidence: { ro_crate: "https://x/crate", role: "evidence", hash: HASH } };
    const copy = structuredClone(content);
    extractEvidence(content);
    expect(content).toEqual(copy);
  });
});

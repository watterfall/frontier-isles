import { describe, it, expect } from "vitest";
import type { LedgerEvent } from "@frontier-isles/opp";
import {
  projectCurrents,
  projectClaimState,
  projectWhirlpools,
  type Current,
  type CurrentKind,
  type CurrentSign,
} from "../src/index";
import {
  SEA_EVENTS,
  SEA_REFS,
  RIEMANN,
  FOLDING,
  COHERENCE,
  ENTROPY,
  CATALYSIS,
  EMERGENCE,
} from "./fixtures/sea-fixture";

const find = (cs: Current[], from: string, to: string, kind: CurrentKind, sign: CurrentSign) =>
  cs.find((c) => c.from === from && c.to === to && c.kind === kind && c.sign === sign);

const without = (pred: (e: LedgerEvent) => boolean): LedgerEvent[] => SEA_EVENTS.filter((e) => !pred(e));

describe("projectCurrents — signed edges (invariant 8: dissent ≠ assent)", () => {
  const currents = projectCurrents(SEA_EVENTS);

  it("keeps affirm and contest between the SAME pair as two distinct currents", () => {
    // folding validates R1 (affirm) AND refutes R7 (contest) — both RIEMANN↔FOLDING
    const affirm = find(currents, RIEMANN, FOLDING, "evidence", "affirm");
    const contest = find(currents, RIEMANN, FOLDING, "evidence", "contest");
    expect(affirm).toMatchObject({ weight: 1, directed: true });
    expect(contest).toMatchObject({ weight: 1, directed: true });
    expect(affirm).not.toBe(contest); // never merged into one "evidence" edge
  });

  it("a refutation is a contest current, never an affirm", () => {
    expect(find(currents, RIEMANN, COHERENCE, "evidence", "contest")).toBeDefined();
    expect(find(currents, RIEMANN, COHERENCE, "evidence", "affirm")).toBeUndefined();
    expect(find(currents, CATALYSIS, EMERGENCE, "evidence", "contest")).toBeDefined();
  });

  it("validations are affirm currents and accumulate weight", () => {
    expect(find(currents, ENTROPY, CATALYSIS, "evidence", "affirm")).toMatchObject({ weight: 2 });
    expect(find(currents, ENTROPY, EMERGENCE, "evidence", "affirm")).toMatchObject({ weight: 1 });
  });

  it("lineage and bridge are neutral; maturity is bridge-only", () => {
    const lineage = find(currents, RIEMANN, ENTROPY, "lineage", "neutral");
    expect(lineage).toMatchObject({ weight: 2, directed: true });
    expect(lineage!.maturity).toBeUndefined(); // dropped the meaningless ratified

    expect(find(currents, COHERENCE, CATALYSIS, "bridge", "neutral")).toMatchObject({
      maturity: "ratified",
      directed: false,
    });
    expect(find(currents, FOLDING, EMERGENCE, "bridge", "neutral")).toMatchObject({ maturity: "proposed" });
  });

  it("is stable and never mutates its input", () => {
    const copy = [...SEA_EVENTS];
    expect(projectCurrents(SEA_EVENTS)).toEqual(projectCurrents(SEA_EVENTS));
    expect(SEA_EVENTS).toEqual(copy);
  });

  it("joins a response artifact back to its target without losing either ref or its argument", () => {
    const targetRef = `sha256:${"d".repeat(64)}`;
    const responseRef = `sha256:${"a".repeat(64)}`;
    const evidenceHash = `sha256:${"b".repeat(64)}`;
    const events: LedgerEvent[] = [
      { ...SEA_EVENTS[0]!, op: RIEMANN, action: "submit_claim", ref: targetRef },
      {
        ...SEA_EVENTS[1]!,
        op: FOLDING,
        action: "validate",
        ref: responseRef,
        actor: { id: "github:folding-researcher", kind: "human" },
      },
    ];
    const refs = new Map<string, { kind: string; content: unknown }>([
      [
        targetRef,
        {
          kind: "claim",
          content: {
            text: "Critical spacing transfers as an energy-landscape constraint.",
            evidence: { ro_crate: "https://example.test/target", role: "evidence", hash: `sha256:${"e".repeat(64)}` },
          },
        },
      ],
      [
        responseRef,
        {
          kind: "note",
          content: {
            targetRef,
            body: "The folding landscape preserves the same spacing restriction.",
            test: "Perturb the landscape and compare the spacing distribution.",
            evidence: { ro_crate: "https://example.test/response", role: "replication", hash: evidenceHash },
          },
        },
      ],
    ]);

    const currents = projectCurrents(events, (ref) => refs.get(ref));
    const current = find(currents, RIEMANN, FOLDING, "evidence", "affirm");
    expect(current).toMatchObject({ weight: 1 });
    expect(current?.records).toEqual([
      expect.objectContaining({
        targetRef,
        targetKind: "claim",
        targetSummary: "Critical spacing transfers as an energy-landscape constraint.",
        responseRef,
        responseKind: "note",
        responseBody: "The folding landscape preserves the same spacing restriction.",
        responseTest: "Perturb the landscape and compare the spacing distribution.",
        responseEvidence: { ro_crate: "https://example.test/response", role: "replication", hash: evidenceHash },
        actor: "github:folding-researcher",
        historical: false,
      }),
    ]);

    expect(projectClaimState(events, (ref) => refs.get(ref))).toEqual([
      expect.objectContaining({ ref: targetRef, island: RIEMANN, floors: 1, ghost: undefined }),
    ]);
  });

  it("keeps legacy direct-target reactions visible as explicit historical gaps", () => {
    const current = find(projectCurrents(SEA_EVENTS), RIEMANN, FOLDING, "evidence", "affirm");
    expect(current?.records).toEqual([
      expect.objectContaining({ targetRef: SEA_REFS.R1, historical: true }),
    ]);
    expect(current?.records[0]).not.toHaveProperty("responseRef");
  });
});

describe("traceability (invariant 15) — the sign survives deletion", () => {
  it("removing the refute deletes the CONTEST current but keeps the affirm", () => {
    const gone = projectCurrents(without((e) => e.action === "refute" && e.ref === SEA_REFS.R7));
    expect(find(gone, RIEMANN, FOLDING, "evidence", "contest")).toBeUndefined();
    expect(find(gone, RIEMANN, FOLDING, "evidence", "affirm")).toBeDefined();
  });

  it("removing the bridge_accept downgrades a ratified bridge to proposed", () => {
    const events = without((e) => e.action === "bridge_accept");
    expect(find(projectCurrents(events), COHERENCE, CATALYSIS, "bridge", "neutral")).toMatchObject({
      maturity: "proposed",
    });
  });
});

describe("projectWhirlpools — a dispute storms between two islands (invariant 8)", () => {
  const w = projectWhirlpools(SEA_EVENTS);
  const between = (a: string, b: string) => w.find((x) => x.between[0] === a && x.between[1] === b);

  it("a validated-AND-refuted claim is a DISPUTE placed between the two islands", () => {
    // R1: validated by folding, refuted by coherence → dispute RIEMANN↔COHERENCE
    const dispute = between(RIEMANN, COHERENCE);
    expect(dispute).toMatchObject({ weight: 1 });
    expect(dispute!.refs).toEqual([SEA_REFS.R1]);
  });

  it("a one-sided refute still storms", () => {
    expect(between(CATALYSIS, EMERGENCE)).toMatchObject({ weight: 1 }); // R5, never validated
    expect(between(RIEMANN, FOLDING)).toMatchObject({ weight: 1 }); // R7
  });

  it("a validate on a third island does NOT calm the dispute", () => {
    // claim on A, refute on B, validate on a third island C — still a whirlpool A↔B
    const A = RIEMANN, B = COHERENCE, C = ENTROPY;
    const events: LedgerEvent[] = [
      { ...SEA_EVENTS[0]!, op: A, action: "submit_claim", ref: SEA_REFS.R3 },
      { ...SEA_EVENTS[0]!, op: B, action: "refute", ref: SEA_REFS.R3 },
      { ...SEA_EVENTS[0]!, op: C, action: "validate", ref: SEA_REFS.R3 },
    ];
    const only = projectWhirlpools(events);
    expect(only).toHaveLength(1);
    expect(only[0]).toMatchObject({ between: [A, B], weight: 1 });
  });

  it("removing the refute stills the water", () => {
    const calmed = projectWhirlpools(without((e) => e.action === "refute" && e.ref === SEA_REFS.R5));
    expect(calmed.find((x) => x.between[0] === CATALYSIS && x.between[1] === EMERGENCE)).toBeUndefined();
  });

  it("the fixture yields exactly three disputes, stably ordered", () => {
    expect(w).toHaveLength(3);
    expect(w.map((x) => x.between)).toEqual([
      [CATALYSIS, EMERGENCE],
      [RIEMANN, COHERENCE],
      [RIEMANN, FOLDING],
    ]);
  });

  it("a same-island refute is internal weather, not a sea whirlpool", () => {
    // an island refuting its OWN claim (anchor === refuter) must not storm the sea
    const selfRefute: LedgerEvent[] = [
      { ...SEA_EVENTS[0]!, op: RIEMANN, action: "submit_claim", ref: SEA_REFS.R2 },
      { ...SEA_EVENTS[0]!, op: RIEMANN, action: "refute", ref: SEA_REFS.R2 },
    ];
    expect(projectWhirlpools(selfRefute)).toHaveLength(0);
  });

  it("sites a response-artifact refute at the target claim and exposes the target ref", () => {
    const targetRef = `sha256:${"f".repeat(64)}`;
    const responseRef = `sha256:${"c".repeat(64)}`;
    const events: LedgerEvent[] = [
      { ...SEA_EVENTS[0]!, op: CATALYSIS, action: "submit_claim", ref: targetRef },
      { ...SEA_EVENTS[1]!, op: EMERGENCE, action: "refute", ref: responseRef },
    ];
    const resolve = (ref: string) =>
      ref === responseRef
        ? { kind: "note", content: { targetRef, body: "The turnover relation breaks in the sparse regime." } }
        : { kind: "claim", content: { text: "Turnover remains scale invariant." } };

    expect(projectWhirlpools(events, resolve)).toEqual([
      { between: [CATALYSIS, EMERGENCE], refs: [targetRef], weight: 1 },
    ]);
  });
});

describe("bridge-challenge v1 — a semantic response to a bridge artifact", () => {
  const BRIDGE = `sha256:${"e".repeat(64)}`;
  const RESP = `sha256:${"f".repeat(64)}`;
  const mk = (ts: string, op: string, action: LedgerEvent["action"], ref: string): LedgerEvent => ({
    ts,
    op,
    actor: { id: "github:x", kind: "human" },
    credit: [],
    phase: "B",
    action,
    ref,
  });
  const events: LedgerEvent[] = [
    mk("2026-01-01T00:00:00Z", "op://a", "bridge_artifact", BRIDGE),
    mk("2026-01-02T00:00:00Z", "op://b", "bridge_propose", BRIDGE),
    mk("2026-01-03T00:00:00Z", "op://c", "refute", RESP),
  ];
  const resolver = (ref: string) =>
    ref === RESP ? { kind: "note", content: { targetRef: BRIDGE, body: "对应在此断裂", test: "时变扰动" } } : null;

  it("projects a signed contest current about the bridge, keeping the bridge ref in the record", () => {
    const currents = projectCurrents(events, resolver);
    const contest = find(currents, "op://a", "op://c", "evidence", "contest");
    expect(contest).toBeTruthy();
    expect(contest!.records[0]).toMatchObject({ targetRef: BRIDGE, responseRef: RESP, responseBody: "对应在此断裂" });
  });

  it("leaves the bridge current itself neutral and unpolluted (maturity semantics intact)", () => {
    const currents = projectCurrents(events, resolver);
    const bridge = find(currents, "op://a", "op://b", "bridge", "neutral");
    expect(bridge).toBeTruthy();
    expect(bridge!.maturity).toBe("proposed");
    expect(bridge!.records.some((r) => r.responseRef === RESP)).toBe(false);
  });
});

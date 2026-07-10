import { describe, it, expect } from "vitest";
import {
  projectHarbor,
  fogLevel,
  archipelagoIndex,
  type HarborFootprintLike,
  type Harbor,
} from "../src/index";
import type { Current } from "../src/index";
import type { Archipelago } from "../src/index";

const ALICE = "github:alice";
const BOB = "github:bob";

describe("projectHarbor — footprint → harbor set", () => {
  it("collects every island where the actor appears, from LedgerEvent-shaped rows", () => {
    const events: HarborFootprintLike[] = [
      { op: "op://a", actor: { id: ALICE } },
      { op: "op://b", actor: { id: ALICE } },
      { op: "op://c", actor: { id: BOB } },
    ];
    const harbor = projectHarbor(events, ALICE);
    expect(harbor.islandSlugs).toEqual(["op://a", "op://b"]);
  });

  it("also accepts simpler membership-row shapes ({ op, actorId })", () => {
    const memberships: HarborFootprintLike[] = [
      { op: "op://a", actorId: ALICE },
      { op: "op://b", actorId: BOB },
    ];
    const harbor = projectHarbor(memberships, ALICE);
    expect(harbor.islandSlugs).toEqual(["op://a"]);
  });

  it("dedupes repeated events on the same island", () => {
    const events: HarborFootprintLike[] = [
      { op: "op://a", actor: { id: ALICE } },
      { op: "op://a", actor: { id: ALICE } },
      { op: "op://a", actor: { id: ALICE } },
    ];
    expect(projectHarbor(events, ALICE).islandSlugs).toEqual(["op://a"]);
  });

  it("a brand-new actor with no footprint gets an empty harbor and a null anchor", () => {
    const harbor = projectHarbor([{ op: "op://a", actorId: BOB }], ALICE);
    expect(harbor.islandSlugs).toEqual([]);
    expect(harbor.anchor).toBeNull();
  });

  it("anchor is the centroid of the harbor islands' chart positions", () => {
    const events: HarborFootprintLike[] = [
      { op: "island-1", actor: { id: ALICE } },
      { op: "island-2", actor: { id: ALICE } },
    ];
    const harbor = projectHarbor(events, ALICE, {
      islands: [
        { slug: "island-1", x: 0, y: 0 },
        { slug: "island-2", x: 100, y: 200 },
      ],
    });
    expect(harbor.anchor).toEqual({ x: 50, y: 100 });
  });

  it("without a positions table, anchor stays null rather than a fake guess", () => {
    const events: HarborFootprintLike[] = [{ op: "island-1", actor: { id: ALICE } }];
    expect(projectHarbor(events, ALICE).anchor).toBeNull();
  });

  it("is deterministic: same footprint ⇒ same harbor, regardless of row order", () => {
    const events: HarborFootprintLike[] = [
      { op: "op://c", actor: { id: ALICE } },
      { op: "op://a", actor: { id: ALICE } },
      { op: "op://b", actor: { id: ALICE } },
    ];
    const a = projectHarbor(events, ALICE).islandSlugs;
    const b = projectHarbor([...events].reverse(), ALICE).islandSlugs;
    expect(a).toEqual(b);
  });
});

describe("fogLevel — monotonic focus, never a wall", () => {
  const harbor: Harbor = { actorId: ALICE, islandSlugs: ["home-1", "home-2"], anchor: { x: 0, y: 0 } };

  it("is 0 for islands already in the harbor", () => {
    expect(fogLevel("home-1", harbor)).toBe(0);
  });

  it("is 1 (max) for a brand-new actor with an empty harbor — still not a special/negative value", () => {
    const empty: Harbor = { actorId: ALICE, islandSlugs: [], anchor: null };
    expect(fogLevel("anywhere", empty)).toBe(1);
  });

  it("is 1 (max) for an island with no relation to the harbor at all", () => {
    expect(fogLevel("far-unrelated", harbor)).toBe(1);
  });

  it("co-archipelago islands fog less than fully unrelated ones", () => {
    const archipelagos: Archipelago[] = [
      {
        id: "arch-1",
        name: { zh: "测试群岛", en: "Test Archipelago" },
        islandSlugs: ["home-1", "neighbor"],
        center: { x: 0, y: 0 },
        radius: 10,
        domainMix: { 数理: 1, 物质: 0, 生命: 0, 交叉: 0 },
      },
    ];
    const archipelagoOf = archipelagoIndex(archipelagos);
    const fogNeighbor = fogLevel("neighbor", harbor, { archipelagoOf });
    const fogUnrelated = fogLevel("far-unrelated", harbor, { archipelagoOf });
    expect(fogNeighbor).toBeGreaterThan(0);
    expect(fogNeighbor).toBeLessThan(fogUnrelated);
    expect(fogUnrelated).toBe(1);
  });

  it("fog rises monotonically with bridge-hop distance", () => {
    // home-1 -[bridge]- hop1 -[bridge]- hop2 -[bridge]- hop3
    const currents: Pick<Current, "from" | "to" | "kind">[] = [
      { from: "home-1", to: "hop1", kind: "bridge" },
      { from: "hop1", to: "hop2", kind: "bridge" },
      { from: "hop2", to: "hop3", kind: "bridge" },
    ];
    const fog1 = fogLevel("hop1", harbor, { currents });
    const fog2 = fogLevel("hop2", harbor, { currents });
    const fog3 = fogLevel("hop3", harbor, { currents });
    const fogUnrelated = fogLevel("nowhere", harbor, { currents });

    expect(fog1).toBeLessThan(fog2);
    expect(fog2).toBeLessThan(fog3);
    expect(fog3).toBeLessThan(fogUnrelated);
    expect(fogUnrelated).toBe(1);
  });

  it("only `bridge`-kind currents count toward hop distance (evidence/lineage don't imply reachability)", () => {
    const currents: Pick<Current, "from" | "to" | "kind">[] = [
      { from: "home-1", to: "cited-only", kind: "evidence" },
    ];
    expect(fogLevel("cited-only", harbor, { currents })).toBe(1);
  });

  it("the closer signal wins when both co-archipelago and bridge-hop apply", () => {
    const archipelagos: Archipelago[] = [
      {
        id: "arch-1",
        name: { zh: "测试群岛", en: "Test Archipelago" },
        islandSlugs: ["home-1", "both-close"],
        center: { x: 0, y: 0 },
        radius: 10,
        domainMix: { 数理: 1, 物质: 0, 生命: 0, 交叉: 0 },
      },
    ];
    const archipelagoOf = archipelagoIndex(archipelagos);
    const currents: Pick<Current, "from" | "to" | "kind">[] = [
      { from: "home-1", to: "far-a", kind: "bridge" },
      { from: "far-a", to: "far-b", kind: "bridge" },
      { from: "far-b", to: "both-close", kind: "bridge" }, // 3 hops away by bridge
    ];
    const fogCoArchipelagoOnly = fogLevel("both-close", harbor, { archipelagoOf });
    const fogWithBoth = fogLevel("both-close", harbor, { archipelagoOf, currents });
    // co-archipelago (tier 1) is closer than a 3-hop bridge path (tier 4); the
    // combined signal must not be fogged WORSE than the closer of the two.
    expect(fogWithBoth).toBe(fogCoArchipelagoOnly);
  });

  it("is deterministic across repeated calls", () => {
    const currents: Pick<Current, "from" | "to" | "kind">[] = [{ from: "home-1", to: "x", kind: "bridge" }];
    const a = fogLevel("x", harbor, { currents });
    const b = fogLevel("x", harbor, { currents });
    expect(a).toBe(b);
  });
});

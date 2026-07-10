import { describe, it, expect } from "vitest";
import {
  projectClimate,
  projectContinentCurrents,
  makeScaleCorpus,
  type ClimateIslandLike,
  type CurrentKind,
} from "../src/index";

/** The four domains, laid out in four separated quadrants so each has a clear
 *  continental home (mirrors the scale-corpus REGIONS split by domain). */
const DOMAINS = ["数理", "物质", "生命", "交叉"] as const;
const QUADRANT: Record<(typeof DOMAINS)[number], { x: number; y: number }> = {
  数理: { x: 200, y: 200 },
  物质: { x: 1200, y: 200 },
  生命: { x: 200, y: 700 },
  交叉: { x: 1200, y: 700 },
};

function quadrantIslands(perDomain: number): ClimateIslandLike[] {
  const out: ClimateIslandLike[] = [];
  for (const d of DOMAINS) {
    const base = QUADRANT[d];
    for (let i = 0; i < perDomain; i++) {
      out.push({
        slug: `${d}-${i}`,
        domain: d,
        x: base.x + (i % 5) * 30,
        y: base.y + Math.floor(i / 5) * 30,
        eventCount: 10 + i,
        dormant: i % 7 === 0,
      });
    }
  }
  return out;
}

describe("projectClimate — four named territories", () => {
  it("produces one territory per populated domain, named in authored zh + en", () => {
    const field = projectClimate(quadrantIslands(12));
    expect(field.territories).toHaveLength(4);
    const domains = field.territories.map((t) => t.domain);
    expect(domains).toEqual(["数理", "物质", "生命", "交叉"]); // fixed manifold order

    const math = field.territories.find((t) => t.domain === "数理")!;
    expect(math.name.zh).toBe("数理·形式科学");
    expect(math.name.en).toBe("Formal Sciences");
    expect(math.manifold).toEqual([0, 0]); // formal↙ corner
    // Centroid sits inside the 数理 quadrant, not the world centre.
    expect(math.center.x).toBeLessThan(600);
    expect(math.center.y).toBeLessThan(500);
    expect(math.islandCount).toBe(12);
    expect(math.activity).toBeGreaterThan(0);
    expect(math.radius).toBeGreaterThan(0);
  });

  it("the four corners map to the manifold unit square (x=formal→empirical, y=physical→living)", () => {
    const field = projectClimate(quadrantIslands(6));
    const corner = (d: string) => field.territories.find((t) => t.domain === d)!.manifold;
    expect(corner("数理")).toEqual([0, 0]);
    expect(corner("物质")).toEqual([1, 0]);
    expect(corner("生命")).toEqual([0, 1]);
    expect(corner("交叉")).toEqual([1, 1]);
  });

  it("skips a domain with no islands (a territory needs data — invariant 14/16)", () => {
    const only = quadrantIslands(4).filter((i) => i.domain === "数理" || i.domain === "生命");
    const field = projectClimate(only);
    expect(field.territories.map((t) => t.domain)).toEqual(["数理", "生命"]);
  });

  it("aggregates the world readout (前沿天气): totals + live count", () => {
    const islands = quadrantIslands(10);
    const field = projectClimate(islands);
    expect(field.totalIslands).toBe(40);
    expect(field.liveIslands).toBe(islands.filter((i) => !i.dormant).length);
    expect(field.totalActivity).toBe(islands.reduce((s, i) => s + (i.eventCount ?? 0), 0));
  });

  it("is deterministic + order-independent (invariant 13)", () => {
    const islands = quadrantIslands(9);
    const a = projectClimate(islands);
    const b = projectClimate([...islands].reverse());
    expect(JSON.stringify(a.territories)).toBe(JSON.stringify(b.territories));
    expect(JSON.stringify(a.fog)).toBe(JSON.stringify(b.fog));
  });

  it("returns an empty field for no islands", () => {
    const field = projectClimate([]);
    expect(field.territories).toEqual([]);
    expect(field.fog).toEqual([]);
    expect(field.totalIslands).toBe(0);
  });
});

describe("fog — focus aid on the unexplored edges", () => {
  it("clear on content, hazy on the empty margin, all within [0,1]", () => {
    const field = projectClimate(quadrantIslands(8));
    let sawClear = false;
    let sawHaze = false;
    for (const cell of field.fog) {
      expect(cell.fog).toBeGreaterThanOrEqual(0);
      expect(cell.fog).toBeLessThanOrEqual(1);
      if (cell.fog < 0.05) sawClear = true;
      if (cell.fog > 0.9) sawHaze = true;
    }
    expect(sawClear).toBe(true); // cells sitting on islands read clear
    expect(sawHaze).toBe(true); // the outer frontier hazes over
  });

  it("a cell centred on an island reads clearer than a far-margin cell", () => {
    const field = projectClimate(quadrantIslands(8), { fogCell: 120 });
    // The single densest content region vs the outer-most corner cell.
    const clearest = field.fog.reduce((m, c) => (c.fog < m.fog ? c : m));
    const haziest = field.fog.reduce((m, c) => (c.fog > m.fog ? c : m));
    expect(clearest.fog).toBeLessThan(haziest.fog);
  });
});

describe("projectClimate — realistic scale corpus", () => {
  it("reads N=700 believable islands as four legible continents", () => {
    const corpus = makeScaleCorpus(700);
    const field = projectClimate(
      corpus.map((c) => ({ slug: c.slug, domain: c.domain, x: c.x, y: c.y, eventCount: c.eventCount, dormant: c.dormant })),
    );
    expect(field.territories).toHaveLength(4);
    // Each continent carries roughly a quarter of the 700 islands.
    for (const t of field.territories) {
      expect(t.islandCount).toBeGreaterThan(150);
      expect(t.radius).toBeGreaterThan(0);
    }
    expect(field.totalIslands).toBe(700);
  });
});

describe("projectContinentCurrents — cross-domain relations between territories", () => {
  const currents: { from: string; to: string; kind: CurrentKind; weight: number }[] = [
    { from: "op://a", to: "op://b", kind: "bridge", weight: 2 }, // 数理→物质
    { from: "op://c", to: "op://d", kind: "bridge", weight: 1 }, // 数理→物质 (same pair+kind → merges)
    { from: "op://e", to: "op://f", kind: "evidence", weight: 3 }, // 生命→交叉
    { from: "op://g", to: "op://h", kind: "lineage", weight: 5 }, // 数理→数理 (intra — dropped)
  ];
  const domainOf = (op: string): string | undefined =>
    ({
      "op://a": "数理", "op://b": "物质",
      "op://c": "数理", "op://d": "物质",
      "op://e": "生命", "op://f": "交叉",
      "op://g": "数理", "op://h": "数理",
    })[op];

  it("aggregates cross-domain currents by (domain-pair × kind), drops intra-domain", () => {
    const flows = projectContinentCurrents(currents, domainOf);
    expect(flows).toHaveLength(2); // the two bridges merge; evidence stands; intra dropped
    const bridge = flows.find((f) => f.kind === "bridge")!;
    expect(bridge.from).toBe("数理");
    expect(bridge.to).toBe("物质");
    expect(bridge.weight).toBe(3); // 2 + 1 merged
    const evidence = flows.find((f) => f.kind === "evidence")!;
    expect([evidence.from, evidence.to]).toEqual(["生命", "交叉"]);
  });

  it("is deterministic regardless of input order", () => {
    const a = projectContinentCurrents(currents, domainOf);
    const b = projectContinentCurrents([...currents].reverse(), domainOf);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("skips endpoints with no known domain (invariant 14 — both territories must exist)", () => {
    const flows = projectContinentCurrents(
      [{ from: "op://x", to: "op://b", kind: "bridge", weight: 9 }],
      domainOf,
    );
    expect(flows).toEqual([]);
  });
});

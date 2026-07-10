import { describe, it, expect } from "vitest";
import { FRONTIERS } from "@frontier-isles/data";
import { makeScaleCorpus, SCALE_WORLD, type ScaleCorpusIsland } from "../src/scaleCorpus";

const DOMAINS = ["数理", "物质", "生命", "交叉"] as const;
const BANNED = ["fake", "lorem", "test", "占位", "placeholder"];
const CJK = /[一-鿿]/;

describe("makeScaleCorpus — determinism (invariant 13)", () => {
  it("same (n, seed) yields a byte-identical array", () => {
    const a = makeScaleCorpus(200, 7);
    const b = makeScaleCorpus(200, 7);
    expect(a).toEqual(b);
  });

  it("defaults seed to a fixed value (two no-seed calls also match)", () => {
    expect(makeScaleCorpus(50)).toEqual(makeScaleCorpus(50));
  });

  it("a different seed changes at least some content (not seed-blind)", () => {
    const a = makeScaleCorpus(100, 1);
    const b = makeScaleCorpus(100, 2);
    const differing = a.filter((isle, i) => isle.name !== b[i]!.name || isle.x !== b[i]!.x).length;
    expect(differing).toBeGreaterThan(0);
  });

  it("produces exactly n islands, for both n=200 and n=700", () => {
    expect(makeScaleCorpus(200)).toHaveLength(200);
    expect(makeScaleCorpus(700)).toHaveLength(700);
  });

  it("n<=0 yields an empty array", () => {
    expect(makeScaleCorpus(0)).toEqual([]);
    expect(makeScaleCorpus(-5)).toEqual([]);
  });
});

describe("makeScaleCorpus — domain balance", () => {
  it("spreads roughly evenly across all four domains at n=700", () => {
    const isles = makeScaleCorpus(700, 3);
    const counts: Record<string, number> = { 数理: 0, 物质: 0, 生命: 0, 交叉: 0 };
    for (const isle of isles) counts[isle.domain]!++;
    const values = Object.values(counts);
    expect(values.every((v) => v > 0)).toBe(true);
    // Cyclic round-robin assignment: every domain's count is within 1 of n/4.
    const max = Math.max(...values);
    const min = Math.min(...values);
    expect(max - min).toBeLessThanOrEqual(1);
    expect(max).toBeCloseTo(700 / 4, 0);
  });

  it("stays balanced at odd n too (n=201)", () => {
    const isles = makeScaleCorpus(201, 1);
    const counts: Record<string, number> = { 数理: 0, 物质: 0, 生命: 0, 交叉: 0 };
    for (const isle of isles) counts[isle.domain]!++;
    const values = Object.values(counts);
    expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(1);
  });
});

describe("makeScaleCorpus — believability grammar", () => {
  const isles700 = makeScaleCorpus(700, 42);

  it("every title is distinct at n=700", () => {
    const names = new Set(isles700.map((isle) => isle.name));
    expect(names.size).toBe(700);
  });

  it("every title is CJK (contains at least one Han character)", () => {
    for (const isle of isles700) expect(isle.name).toMatch(CJK);
  });

  it("no title contains a banned lorem/placeholder substring (case-insensitive)", () => {
    for (const isle of isles700) {
      const lower = isle.name.toLowerCase();
      for (const bad of BANNED) expect(lower.includes(bad)).toBe(false);
      expect(isle.name).not.toMatch(/problem\s*\d/i);
      expect(isle.name).not.toMatch(/岛屿\d/); // the OTHER (fake-*) generator's naming pattern
    }
  });

  it("titles vary in length and are not a single repeated template", () => {
    const lengths = new Set(isles700.map((isle) => isle.name.length));
    expect(lengths.size).toBeGreaterThan(3);
  });

  it("every domain draws from that domain's own subfield vocabulary (subdomain is non-empty CJK)", () => {
    for (const isle of isles700) {
      expect(isle.subdomain.length).toBeGreaterThan(0);
      expect(isle.subdomain).toMatch(CJK);
    }
  });

  it("cluster tags follow the curated 'zh·zh' register and use the synthetic S-code namespace", () => {
    for (const isle of isles700) {
      expect(isle.cluster.code).toMatch(/^S[MPLX]\d\d$/);
      expect(isle.cluster.zh.length).toBeGreaterThan(0);
    }
  });

  it("no synthetic cluster name collides with a real curated FRONTIERS cluster name", () => {
    const realClusterNames = new Set(FRONTIERS.map((f) => f.cluster.zh));
    const synClusterNames = new Set(isles700.map((isle) => isle.cluster.zh));
    for (const name of synClusterNames) expect(realClusterNames.has(name)).toBe(false);
  });
});

describe("makeScaleCorpus — honesty: synthetic is distinct from curated", () => {
  it("every island is slugged syn-* and flagged synthetic:true", () => {
    const isles = makeScaleCorpus(300, 5);
    for (const isle of isles) {
      expect(isle.slug.startsWith("syn-")).toBe(true);
      expect(isle.synthetic).toBe(true);
    }
  });

  it("no synthetic slug collides with a curated FRONTIERS slug", () => {
    const realSlugs = new Set(FRONTIERS.map((f) => f.slug));
    const synSlugs = new Set(makeScaleCorpus(300, 5).map((isle) => isle.slug));
    for (const slug of synSlugs) expect(realSlugs.has(slug)).toBe(false);
  });

  it("no synthetic title collides with a curated FRONTIERS title", () => {
    const realTitles = new Set(FRONTIERS.map((f) => f.title.zh));
    const synTitles = new Set(makeScaleCorpus(300, 5).map((isle) => isle.name));
    for (const title of synTitles) expect(realTitles.has(title)).toBe(false);
  });
});

describe("makeScaleCorpus — chart placement (1440×900 space)", () => {
  it("all coordinates fall inside the declared SCALE_WORLD bounds", () => {
    const isles = makeScaleCorpus(700, 9);
    for (const isle of isles) {
      expect(isle.x).toBeGreaterThanOrEqual(0);
      expect(isle.x).toBeLessThanOrEqual(SCALE_WORLD.w);
      expect(isle.y).toBeGreaterThanOrEqual(0);
      expect(isle.y).toBeLessThanOrEqual(SCALE_WORLD.h);
    }
  });

  it("chart coords spread out (not all clumped at one point)", () => {
    const isles = makeScaleCorpus(700, 9);
    const xs = isles.map((isle) => isle.x);
    const ys = isles.map((isle) => isle.y);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(SCALE_WORLD.w * 0.5);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(SCALE_WORLD.h * 0.5);
  });
});

describe("makeScaleCorpus — AtlasIslandInput-shaped fields", () => {
  it("every island carries all fields AtlasIslandInput needs, with matching types", () => {
    const isles: ScaleCorpusIsland[] = makeScaleCorpus(50, 1);
    for (const isle of isles) {
      expect(typeof isle.slug).toBe("string");
      expect(typeof isle.name).toBe("string");
      expect(DOMAINS).toContain(isle.domain);
      expect(typeof isle.stage).toBe("number");
      expect(isle.stage).toBeGreaterThanOrEqual(0);
      expect(isle.stage).toBeLessThanOrEqual(3);
      expect(typeof isle.status).toBe("string");
      expect(typeof isle.dormant).toBe("boolean");
      expect(typeof isle.outlier).toBe("boolean");
      expect(typeof isle.eventCount).toBe("number");
      expect(typeof isle.x).toBe("number");
      expect(typeof isle.y).toBe("number");
      expect(typeof isle.members).toBe("number");
      expect(isle.members).toBeGreaterThan(0);
    }
  });

  it("includes some dormant, some outlier, and some resolved islands at n=700", () => {
    const isles = makeScaleCorpus(700, 11);
    expect(isles.some((isle) => isle.dormant)).toBe(true);
    expect(isles.some((isle) => isle.outlier)).toBe(true);
    expect(isles.some((isle) => isle.resolved)).toBe(true);
    expect(isles.some((isle) => isle.status === "active")).toBe(true);
  });
});

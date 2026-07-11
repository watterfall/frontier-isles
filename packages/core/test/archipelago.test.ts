import { describe, it, expect } from "vitest";
import { FRONTIERS } from "@frontier-isles/data";
import {
  projectArchipelagos,
  type ArchipelagoIslandLike,
  type Archipelago,
} from "../src/index";
import type { Current } from "../src/index";

/** Deterministic 32-bit hash (same family as the module's own fnv1a — independent
 *  reimplementation here so the test doesn't reach into archipelago.ts internals). */
function hashSeed(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — small deterministic PRNG seeded from the hash above. Never
 *  `Math.random()`: every synthetic island's position/domain traces back to a
 *  hash of its own slug, so the whole 700-island fixture is reproducible. */
function mulberry32(seed: number) {
  let a = seed;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DOMAINS = ["数理", "物质", "生命", "交叉"] as const;

function syntheticIslands(count: number): ArchipelagoIslandLike[] {
  const out: ArchipelagoIslandLike[] = [];
  for (let i = 0; i < count; i++) {
    const slug = `synthetic-${i}`;
    const rnd = mulberry32(hashSeed(slug));
    const domain = DOMAINS[Math.floor(rnd() * DOMAINS.length)]!;
    out.push({
      slug,
      domain,
      x: rnd() * 1440,
      y: rnd() * 900,
    });
  }
  return out;
}

function realIslands(): ArchipelagoIslandLike[] {
  return FRONTIERS.map((f) => ({
    slug: f.slug,
    domain: f.domain,
    x: f.chart.x,
    y: f.chart.y,
    outlier: f.outlier,
    cluster: f.cluster,
  }));
}

function everyMemberOnce(projection: { archipelagos: Archipelago[]; outliers: string[] }, all: string[]) {
  const seen = new Map<string, number>();
  for (const a of projection.archipelagos) for (const s of a.islandSlugs) seen.set(s, (seen.get(s) ?? 0) + 1);
  for (const s of projection.outliers) seen.set(s, (seen.get(s) ?? 0) + 1);
  for (const slug of all) expect(seen.get(slug)).toBe(1);
  expect(seen.size).toBe(all.length);
}

describe("projectArchipelagos — determinism", () => {
  it("same input (even reordered) yields the same clustering", () => {
    const islands = syntheticIslands(40);
    const a = projectArchipelagos(islands, []);
    const shuffled = [...islands].reverse();
    const b = projectArchipelagos(shuffled, []);

    const normalize = (p: typeof a) =>
      p.archipelagos
        .map((arch) => ({ id: arch.id, members: arch.islandSlugs.slice().sort(), name: arch.name }))
        .sort((x, y) => x.id.localeCompare(y.id));

    expect(normalize(a)).toEqual(normalize(b));
    expect([...a.outliers].sort()).toEqual([...b.outliers].sort());
  });

  it("is stable across repeated calls", () => {
    const islands = syntheticIslands(120);
    const currents: Current[] = [];
    const runs = [0, 1, 2].map(() => projectArchipelagos(islands, currents));
    const ids = runs.map((r) => r.archipelagos.map((a) => a.id).sort());
    expect(ids[0]).toEqual(ids[1]);
    expect(ids[1]).toEqual(ids[2]);
  });
});

describe("projectArchipelagos — boundedness", () => {
  it("bounds cluster count with maxClusters regardless of scale", () => {
    const islands = syntheticIslands(200);
    const projection = projectArchipelagos(islands, [], { maxClusters: 10 });
    expect(projection.archipelagos.length).toBeLessThanOrEqual(10);
  });

  it("never produces more archipelagos than clusterable islands", () => {
    const islands = syntheticIslands(5);
    const projection = projectArchipelagos(islands, []);
    const clusterableCount = islands.length - projection.outliers.length;
    expect(projection.archipelagos.length).toBeLessThanOrEqual(Math.max(1, clusterableCount));
  });

  it("every island is accounted for exactly once (archipelago XOR outlier)", () => {
    const islands = syntheticIslands(60);
    const projection = projectArchipelagos(islands, []);
    everyMemberOnce(projection, islands.map((i) => i.slug));
  });
});

describe("projectArchipelagos — outliers never cluster", () => {
  it("an explicit outlier: true island never appears inside any archipelago", () => {
    const islands = syntheticIslands(30);
    islands[0]!.outlier = true;
    const projection = projectArchipelagos(islands, []);
    expect(projection.outliers).toContain(islands[0]!.slug);
    for (const a of projection.archipelagos) expect(a.islandSlugs).not.toContain(islands[0]!.slug);
  });

  it("a statistically isolated island (far from everyone, alone in its domain) surfaces as an outlier", () => {
    const cluster = Array.from({ length: 10 }, (_, i) => ({
      slug: `clustered-${i}`,
      domain: "数理" as const,
      x: 100 + i * 5,
      y: 100 + i * 5,
    }));
    const farAway: ArchipelagoIslandLike = { slug: "loner", domain: "交叉", x: 1400, y: 890 };
    const projection = projectArchipelagos([...cluster, farAway], []);
    expect(projection.outliers).toContain("loner");
  });
});

describe("projectArchipelagos — naming", () => {
  it("names are bilingual and deterministic, derived from domain + cluster", () => {
    const islands = realIslands();
    const a = projectArchipelagos(islands, []);
    const b = projectArchipelagos(islands, []);
    expect(a.archipelagos.map((x) => x.name)).toEqual(b.archipelagos.map((x) => x.name));
    for (const arch of a.archipelagos) {
      expect(arch.name.zh.length).toBeGreaterThan(0);
      expect(arch.name.en.length).toBeGreaterThan(0);
      expect(arch.name.zh).toMatch(/群岛/);
      expect(arch.name.en).toMatch(/Archipelago/);
    }
  });

  it("domainMix is a composition (sums to 1), not a ranking", () => {
    const islands = realIslands();
    const { archipelagos } = projectArchipelagos(islands, []);
    for (const arch of archipelagos) {
      const total = Object.values(arch.domainMix).reduce((s, v) => s + v, 0);
      expect(total).toBeCloseTo(1, 6);
    }
  });

  it("falls back to a plain domain name (no descriptor) when islands carry no cluster field", () => {
    const islands = syntheticIslands(10); // no `cluster` field at all
    const { archipelagos } = projectArchipelagos(islands, []);
    for (const arch of archipelagos) {
      expect(arch.name.zh.endsWith("群岛") || /群岛 [IVX]+$/.test(arch.name.zh)).toBe(true);
    }
  });
});

describe("projectArchipelagos — curated overlay is a PURE re-label (hybrid honesty, inv 14/15)", () => {
  // A tiny place-plane overlay keyed by real curated cluster codes (frontiers.ts).
  const CURATED = {
    C01: { zh: "工程生命", en: "Engineered Life", caption: { zh: "可编程的生命", en: "programmable life" } },
    C34: { zh: "无知测绘", en: "Mapping Ignorance" },
  } as const;

  it("does NOT change membership, ids, centers, radii or outliers — names/captions only", () => {
    const islands = realIslands();
    const plain = projectArchipelagos(islands, []);
    const curated = projectArchipelagos(islands, [], { curatedNames: CURATED });

    // Regions are computed BEFORE naming: the two runs must agree on everything
    // structural. Compare by id (content-addressed over sorted member slugs).
    const structural = (p: typeof plain) =>
      p.archipelagos
        .map((a) => ({ id: a.id, members: a.islandSlugs, center: a.center, radius: a.radius }))
        .sort((x, y) => x.id.localeCompare(y.id));
    expect(structural(curated)).toEqual(structural(plain));
    expect([...curated.outliers].sort()).toEqual([...plain.outliers].sort());
  });

  it("re-labels at least the region a curated code dominates, and only the name/caption move", () => {
    const islands = realIslands();
    const plain = projectArchipelagos(islands, []);
    const curated = projectArchipelagos(islands, [], { curatedNames: CURATED });
    const plainById = new Map(plain.archipelagos.map((a) => [a.id, a] as const));

    let renamed = 0;
    for (const a of curated.archipelagos) {
      const p = plainById.get(a.id)!;
      expect(a.islandSlugs).toEqual(p.islandSlugs); // membership frozen
      if (a.name.zh !== p.name.zh) renamed++;
    }
    // The curated set covers C01 (合成生物·工程生命) which dominates a real region.
    expect(renamed).toBeGreaterThanOrEqual(1);
    // A curated caption surfaces on the matched region (and never on an unmatched one).
    expect(curated.archipelagos.some((a) => a.caption?.zh === "可编程的生命")).toBe(true);
  });

  it("region 体温 (heat) is the mean member activity mapped to [0,1], not a size rank", () => {
    // Two same-size regions, one all-hot one all-cold → heat orders by activity,
    // never by member count (which is equal here).
    const hot = Array.from({ length: 6 }, (_, i) => ({
      slug: `hot-${i}`, domain: "生命" as const, x: 100 + i, y: 100 + i, activity: 90,
    }));
    const cold = Array.from({ length: 6 }, (_, i) => ({
      slug: `cold-${i}`, domain: "数理" as const, x: 1300 + i, y: 800 + i, activity: 5,
    }));
    const { archipelagos } = projectArchipelagos([...hot, ...cold], [], { maxClusters: 2 });
    for (const a of archipelagos) {
      expect(a.heat).toBeGreaterThanOrEqual(0);
      expect(a.heat).toBeLessThanOrEqual(1);
    }
    const heats = archipelagos.map((a) => a.heat).sort((x, y) => x - y);
    expect(heats[heats.length - 1]!).toBeGreaterThan(heats[0]!); // hot region warmer than cold
  });
});

describe("projectArchipelagos — 78-island real dataset (packages/data)", () => {
  const islands = realIslands();
  const { archipelagos, outliers } = projectArchipelagos(islands, []);

  it("clusters the 78 real islands into 8–18 named archipelagos", () => {
    expect(archipelagos.length).toBeGreaterThanOrEqual(8);
    expect(archipelagos.length).toBeLessThanOrEqual(18);
  });

  it("the editorially-flagged outlier (dark-instrumentation) never joins a cluster", () => {
    expect(outliers).toContain("dark-instrumentation");
  });

  it("every real island is accounted for exactly once", () => {
    everyMemberOnce({ archipelagos, outliers }, islands.map((i) => i.slug));
  });

  it("full roster snapshot (archipelago name → member slugs)", () => {
    const roster = archipelagos
      .map((a) => ({ name: a.name.zh, members: a.islandSlugs }))
      .sort((x, y) => x.name.localeCompare(y.name));
    expect(roster).toMatchSnapshot();
  });
});

describe("projectArchipelagos — 700 synthetic islands (scale, count-legibility + perf)", () => {
  it("reads as ~30–50 NAMED regions (a real middle tier), not a ceiling of 20 blobs", () => {
    // docs/atlas-world-plan.md §0 pt 3 "中层太薄" / §2 T1 / §5 acceptance: 700
    // islands must resolve into a middle tier that reads as named regions — the
    // xfrontier bar is ~53 for 1481. Density scaling (round(1.4·√n)) puts 700 at
    // ~36, comfortably inside the legible band and well under the raised ceiling.
    const islands = syntheticIslands(700);
    const start = performance.now();
    const { archipelagos } = projectArchipelagos(islands, []);
    const elapsedMs = performance.now() - start;
    // eslint-disable-next-line no-console
    console.log(`[archipelago perf] 700 islands → ${archipelagos.length} archipelagos in ${elapsedMs.toFixed(1)}ms`);
    expect(archipelagos.length).toBeGreaterThanOrEqual(30);
    expect(archipelagos.length).toBeLessThanOrEqual(50);
    expect(elapsedMs).toBeLessThan(2000); // generous ceiling; expected magnitude is <100ms
  });

  it("an explicit maxClusters still bounds the count hard, at any scale", () => {
    const islands = syntheticIslands(700);
    const { archipelagos } = projectArchipelagos(islands, [], { maxClusters: 12 });
    expect(archipelagos.length).toBeLessThanOrEqual(12);
  });
});

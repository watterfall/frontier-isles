import { describe, expect, it } from "vitest";
import { BRIDGES } from "../src/bridges";
import { FRONTIERS } from "../src/frontiers";

const WAVE2_FIRST_ID = 141;
const WAVE2_LAST_ID = 176;

const legacyPairKeys = new Set([
  "bio-compute-thermo::tabletop-quantum-gravity",
  "bio-compute-thermo::dark-matter-paleo",
  "active-inference::ai-theory-discovery",
]);

const pairKey = (from: string, to: string): string =>
  [from, to].sort().join("::");

const frontiersBySlug = new Map(
  FRONTIERS.map((frontier) => [frontier.slug, frontier]),
);

const expansionBridges = BRIDGES.filter(
  (bridge) => !legacyPairKeys.has(pairKey(bridge.from, bridge.to)),
);

describe("wave 2 collision-bridge expansion", () => {
  it("keeps every directed endpoint attached to its exact frontier chart position", () => {
    for (const bridge of BRIDGES) {
      const from = frontiersBySlug.get(bridge.from);
      const to = frontiersBySlug.get(bridge.to);

      expect(from, `${bridge.from} must exist`).toBeDefined();
      expect(to, `${bridge.to} must exist`).toBeDefined();
      expect(bridge.fromPos, `${bridge.from} fromPos`).toEqual({
        x: from!.chart.x,
        y: from!.chart.y,
      });
      expect(bridge.toPos, `${bridge.to} toPos`).toEqual({
        x: to!.chart.x,
        y: to!.chart.y,
      });
    }
  });

  it("keeps undirected island pairs unique", () => {
    const pairKeys = BRIDGES.map((bridge) => pairKey(bridge.from, bridge.to));

    expect(new Set(pairKeys).size).toBe(BRIDGES.length);
    expect(BRIDGES.every((bridge) => bridge.from !== bridge.to)).toBe(true);
  });

  it("adds six explicitly labelled bridges anchored in the wave 2 frontier range", () => {
    expect(BRIDGES).toHaveLength(9);
    expect(expansionBridges).toHaveLength(6);

    for (const bridge of expansionBridges) {
      const endpointIds = [
        frontiersBySlug.get(bridge.from)!.id,
        frontiersBySlug.get(bridge.to)!.id,
      ];
      expect(
        endpointIds.some(
          (id) => id >= WAVE2_FIRST_ID && id <= WAVE2_LAST_ID,
        ),
        `${bridge.from} ↔ ${bridge.to} needs a wave 2 endpoint`,
      ).toBe(true);
      expect(bridge.skeleton.zh).toMatch(/^ISO-\d{2} · /);
      expect(bridge.skeleton.en).toMatch(/^ISO-\d{2} · /);
    }
  });

  it("makes at least four new bridges cross a top-level domain boundary", () => {
    const crossDomain = expansionBridges.filter((bridge) => {
      const from = frontiersBySlug.get(bridge.from)!;
      const to = frontiersBySlug.get(bridge.to)!;
      return from.domain !== to.domain;
    });

    expect(crossDomain.length).toBeGreaterThanOrEqual(4);
  });
});

import { describe, expect, it } from "vitest";
import { FRONTIERS } from "../src/frontiers";

const EXPANSION: ReadonlyMap<string, number> = new Map([
  ["dark-fiber-ecological-sensing", 533],
  ["biotremology-vibrational-communication", 545],
  ["aerial-electroecology", 534],
  ["cable-bacteria-biogeophysical-signals", 538],
  ["thermodynamic-computing-hardware", 541],
  ["p-bit-probabilistic-computing", 546],
  ["aqueous-iontronic-memristors", 532],
  ["mechanical-metamaterial-computing", 535],
  ["counterfactual-history-causal-cliometrics", 537],
  ["evolutionary-dynamics-norms-trust", 553],
  ["social-physics-predictability-boundary", 552],
  ["collective-reasoning-group-epistemology", 550],
]);

describe("2026-07 direction expansion", () => {
  const frontiers = FRONTIERS.filter((frontier) => EXPANSION.has(frontier.slug));

  it("keeps the 12 xfrontier provenance handles stable and unique", () => {
    expect(frontiers).toHaveLength(EXPANSION.size);
    expect(new Set(frontiers.map((frontier) => frontier.id)).size).toBe(EXPANSION.size);
    for (const frontier of frontiers) {
      expect(frontier.atlasN, frontier.slug).toBe(EXPANSION.get(frontier.slug));
    }
  });

  it("adds four map domains across seven topical clusters", () => {
    expect(new Set(frontiers.map((frontier) => frontier.domain))).toEqual(
      new Set(["数理", "物质", "生命", "交叉"]),
    );
    expect(new Set(frontiers.map((frontier) => frontier.cluster.code)).size).toBe(7);
  });

  it("ships bilingual depth and checkable literature without repeating the headline citation", () => {
    for (const frontier of frontiers) {
      expect(frontier.depth?.overview.zh, `${frontier.slug} overview.zh`).toBeTruthy();
      expect(frontier.depth?.overview.en, `${frontier.slug} overview.en`).toBeTruthy();
      expect(frontier.depth?.approaches).toHaveLength(3);
      expect(frontier.depth?.subQuestions).toHaveLength(3);
      expect(frontier.citation.url).toMatch(/^https:\/\//);
      for (const reference of frontier.literature ?? []) {
        expect(reference.url).toMatch(/^https:\/\//);
        expect(reference.url).not.toBe(frontier.citation.url);
        expect(reference.title).not.toBe(frontier.citation.title);
      }
    }
  });
});

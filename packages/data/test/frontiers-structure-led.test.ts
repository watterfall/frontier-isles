import { describe, expect, it } from 'vitest';
import { FRONTIERS } from '../src/frontiers';
import { STRUCTURE_LED_EXPANSION } from '../src/frontiers-expansion-structure-led';

const complete = (value: { zh: string; en: string } | undefined): boolean =>
  !!value && value.zh.trim().length > 0 && value.en.trim().length > 0;

const others = FRONTIERS.filter(
  (island) => !STRUCTURE_LED_EXPANSION.some((added) => added.slug === island.slug),
);

/** `depth` is optional on the type; on these twelve it is not, and that is a
 *  property worth asserting rather than asserting away with a `!`. */
const depthOf = (island: (typeof STRUCTURE_LED_EXPANSION)[number]) => {
  const depth = island.depth;
  if (!depth) throw new Error(`${island.slug} must carry depth content`);
  return depth;
};

describe('structure-led islands', () => {
  it('adds twelve, and all of them reach FRONTIERS', () => {
    expect(STRUCTURE_LED_EXPANSION).toHaveLength(12);
    expect(FRONTIERS).toHaveLength(188);
    const slugs = new Set(FRONTIERS.map((island) => island.slug));
    for (const island of STRUCTURE_LED_EXPANSION) expect(slugs.has(island.slug), island.slug).toBe(true);
  });

  it('keeps id, slug and atlasN unique across the whole atlas', () => {
    const ids = FRONTIERS.map((island) => island.id);
    const slugs = FRONTIERS.map((island) => island.slug);
    const ns = FRONTIERS.map((island) => island.atlasN);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(ns).size).toBe(ns.length);
  });

  it('states both languages everywhere a reader sees text', () => {
    for (const island of STRUCTURE_LED_EXPANSION) {
      expect(complete(island.title), island.slug).toBe(true);
      expect(complete(island.qfocus), island.slug).toBe(true);
      expect(complete(island.brief), island.slug).toBe(true);
      const depth = depthOf(island);
      expect(complete(depth.overview), island.slug).toBe(true);
      expect(complete(depth.whyMatters), island.slug).toBe(true);
      expect(complete(depth.ifAnswered), island.slug).toBe(true);
      expect(complete(depth.barrier), island.slug).toBe(true);
      for (const approach of depth.approaches) expect(complete(approach), island.slug).toBe(true);
      for (const question of depth.subQuestions) expect(complete(question), island.slug).toBe(true);
    }
  });

  it('carries a real citation with an https url', () => {
    for (const island of STRUCTURE_LED_EXPANSION) {
      expect(island.citation.url.startsWith('https://'), island.slug).toBe(true);
      expect(island.citation.title.length, island.slug).toBeGreaterThan(10);
      expect(island.citation.year, island.slug).toBeGreaterThanOrEqual(2019);
    }
  });

  it('carries nine scores in range, taken from the source record', () => {
    for (const island of STRUCTURE_LED_EXPANSION) {
      expect(island.scores, island.slug).toHaveLength(9);
      for (const score of island.scores) {
        expect(Number.isInteger(score) && score >= 1 && score <= 5, `${island.slug} ${score}`).toBe(true);
      }
    }
  });

  it('honours the placement rule it states — 34px clear of every other island', () => {
    // The header claims positions were computed rather than eyeballed, against
    // a median nearest-neighbour distance of 44.8px. This is that claim.
    for (const island of STRUCTURE_LED_EXPANSION) {
      for (const other of others) {
        const distance = Math.hypot(island.chart.x - other.chart.x, island.chart.y - other.chart.y);
        expect(distance, `${island.slug} sits ${distance.toFixed(1)}px from ${other.slug}`).toBeGreaterThanOrEqual(34);
      }
    }
  });

  it('stays inside the canvas the existing atlas uses', () => {
    for (const island of STRUCTURE_LED_EXPANSION) {
      expect(island.chart.x, island.slug).toBeGreaterThanOrEqual(125);
      expect(island.chart.x, island.slug).toBeLessThanOrEqual(1298);
      expect(island.chart.y, island.slug).toBeGreaterThanOrEqual(105);
      expect(island.chart.y, island.slug).toBeLessThanOrEqual(755);
    }
  });

  it('takes the domain its own cluster already carries, rather than a fresh opinion', () => {
    // The other rule the header states. Two clusters straddle domains, so this
    // asserts the majority was followed, not that the cluster is unanimous.
    for (const island of STRUCTURE_LED_EXPANSION) {
      const peers = others.filter((other) => other.cluster.code === island.cluster.code);
      expect(peers.length, `${island.slug} has no cluster peers`).toBeGreaterThan(0);
      const tally = new Map<string, number>();
      for (const peer of peers) tally.set(peer.domain, (tally.get(peer.domain) ?? 0) + 1);
      const top = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]![0];
      expect(island.domain, `${island.slug} in ${island.cluster.code}`).toBe(top);
    }
  });

  it('writes its own sub-questions instead of reusing another island\'s', () => {
    // 123 of the existing 564 sub-questions are verbatim cluster-pool entries,
    // and among the islands whose questions read least like their own subject
    // 77% came from that pool. New content should not inherit that.
    const existing = new Set(others.flatMap((island) => (island.depth?.subQuestions ?? []).map((q) => q.zh.trim())));
    for (const island of STRUCTURE_LED_EXPANSION) {
      for (const question of depthOf(island).subQuestions) {
        expect(existing.has(question.zh.trim()), `${island.slug} reuses a question`).toBe(false);
      }
    }
  });

  it('shares vocabulary with its own subject, unlike a borrowed question', () => {
    const bigrams = (text: string): Set<string> => {
      const out = new Set<string>();
      for (const run of text.replace(/[^一-鿿]+/g, ' ').split(/\s+/)) {
        for (let i = 0; i + 1 < run.length; i++) out.add(run.slice(i, i + 2));
      }
      return out;
    };
    for (const island of STRUCTURE_LED_EXPANSION) {
      const self = bigrams([island.title.zh, island.qfocus.zh, island.brief.zh, depthOf(island).barrier.zh].join(' '));
      const asked = bigrams(depthOf(island).subQuestions.map((q) => q.zh).join(' '));
      let shared = 0;
      for (const gram of asked) if (self.has(gram)) shared += 1;
      const overlap = shared / Math.max(1, Math.min(asked.size, self.size));
      // The 176 existing islands sit at a median of 0.184; the 29 that read as
      // non-sequiturs fall below 40% of that. Staying above the floor is the bar.
      expect(overlap, `${island.slug} overlap ${overlap.toFixed(3)}`).toBeGreaterThan(0.074);
    }
  });
});

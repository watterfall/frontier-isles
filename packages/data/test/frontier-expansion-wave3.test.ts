import { describe, expect, it } from 'vitest';
import { FRONTIERS, type Bilingual, type Domain } from '../src/frontiers';

/**
 * Wave 3 doubles the atlas: 176 → 371 islands by levelling every one of the 53
 * clusters to seven. These gates encode the selection contract so a later edit
 * cannot quietly weaken it.
 *
 * The selection gate is deliberately STRICTER than wave 2's. Wave 2 asked only
 * for `max(paradigm, convergence, undervalued) >= 4`. Wave 3 adds the two the
 * scoring rubric itself insists on:
 *
 *   - substrate reality s[6] >= 3 — the rubric warns that "undervalued" must be
 *     read conditional on substrate: cold + substrate = a real lowland,
 *     cold + no substrate = a trap. Selecting on coldness alone buys traps.
 *   - reachable compressible core s[7] >= 2 — a multiplicative brake; below 2
 *     the direction is likely irreducibly context-dependent, with no fixed
 *     point any amount of work converges to.
 */
const WAVE_3_FIRST = 177;
const WAVE_3_LAST = 371;
const WAVE_3 = FRONTIERS.filter((f) => f.id >= WAVE_3_FIRST && f.id <= WAVE_3_LAST);
const DOMAINS: Domain[] = ['数理', '物质', '生命', '交叉'];
const ISLANDS_PER_CLUSTER = 7;

/** The flat SVG readable twin is a fixed viewBox; the Pixi atlas derives its own
 *  bounds. Anything outside this box is simply clipped on the no-GPU path. */
const SVG_VIEWBOX = { w: 1440, h: 900 };

const hasCjk = (s: string) => /[一-鿿]/.test(s);
const bilingualOk = (b: Bilingual | undefined, label: string) => {
  expect(b?.zh, `${label}.zh`).toBeTruthy();
  expect(b?.en, `${label}.en`).toBeTruthy();
  expect(hasCjk(b!.zh), `${label}.zh must be Chinese`).toBe(true);
  expect(hasCjk(b!.en), `${label}.en must not contain CJK`).toBe(false);
  expect(b!.zh.trim(), `${label} zh and en must not be the same string`).not.toBe(b!.en.trim());
};

describe('frontier expansion wave 3 — the 2× atlas', () => {
  it('adds 195 continuous, provenance-distinct directions', () => {
    expect(WAVE_3).toHaveLength(195);
    // ids are allocated by cluster but the modules are split by domain, so the
    // wave occupies 177..371 as a SET; array order follows the module order.
    expect([...WAVE_3.map((f) => f.id)].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 195 }, (_, i) => WAVE_3_FIRST + i),
    );
    expect(FRONTIERS).toHaveLength(371);

    // uniqueness holds across the WHOLE atlas, not just this wave
    expect(new Set(FRONTIERS.map((f) => f.slug)).size).toBe(FRONTIERS.length);
    expect(new Set(FRONTIERS.map((f) => f.atlasN)).size).toBe(FRONTIERS.length);
    expect(new Set(FRONTIERS.map((f) => f.id)).size).toBe(FRONTIERS.length);
  });

  it('levels every one of the 53 clusters to seven islands', () => {
    const byCluster = new Map<string, number>();
    for (const f of FRONTIERS) byCluster.set(f.cluster.code, (byCluster.get(f.cluster.code) ?? 0) + 1);
    expect(byCluster.size, 'all 53 clusters represented').toBe(53);
    for (let i = 1; i <= 53; i++) {
      const code = `C${String(i).padStart(2, '0')}`;
      expect(byCluster.get(code), `${code} island count`).toBe(ISLANDS_PER_CLUSTER);
    }
  });

  it('passes a selection gate stricter than wave 2 — substrate and reachability, not coldness alone', () => {
    for (const f of WAVE_3) {
      const s = f.scores;
      expect(s, `${f.slug} scores`).toHaveLength(9);
      expect(s.every((v) => v >= 1 && v <= 5), `${f.slug} scores in range`).toBe(true);
      expect(
        Math.max(s[0]!, s[1]!, s[2]!, s[8]!),
        `${f.slug} must be paradigm-shifting, cross-disciplinary, tool-creating, or undervalued`,
      ).toBeGreaterThanOrEqual(4);
      expect(s[6]!, `${f.slug} substrate reality — cold with no substrate is a trap`).toBeGreaterThanOrEqual(3);
      expect(s[7]!, `${f.slug} reachable compressible core`).toBeGreaterThanOrEqual(2);
    }
  });

  it('ships complete bilingual depth for every direction', () => {
    for (const f of WAVE_3) {
      bilingualOk(f.title, `${f.slug} title`);
      bilingualOk(f.qfocus, `${f.slug} qfocus`);
      bilingualOk(f.brief, `${f.slug} brief`);

      const d = f.depth;
      expect(d, `${f.slug} depth`).toBeDefined();
      bilingualOk(d!.overview, `${f.slug} overview`);
      bilingualOk(d!.whyMatters, `${f.slug} whyMatters`);
      bilingualOk(d!.ifAnswered, `${f.slug} ifAnswered`);
      bilingualOk(d!.barrier, `${f.slug} barrier`);
      expect(d!.approaches, `${f.slug} approaches`).toHaveLength(3);
      d!.approaches.forEach((a, i) => bilingualOk(a, `${f.slug} approaches[${i}]`));
      expect(d!.subQuestions.length, `${f.slug} subQuestions`).toBeGreaterThanOrEqual(3);
      d!.subQuestions.forEach((q, i) => bilingualOk(q, `${f.slug} subQuestions[${i}]`));
      expect(f.interior, `${f.slug} should use depth, not a synthetic interior`).toBeUndefined();
    }
  });

  it('grounds every direction in real, non-duplicated evidence', () => {
    const doiOf = (url: string) =>
      (url.match(/10\.\d{4,9}\/[^\s"'<>?#]+/i)?.[0] ?? '').toLowerCase().replace(/[.,;)]+$/, '');
    for (const f of WAVE_3) {
      expect(f.citation.url, `${f.slug} headline evidence`).toMatch(/^https?:\/\//);
      expect(f.citation.title, `${f.slug} citation title`).toBeTruthy();
      expect(f.citation.venue, `${f.slug} citation venue`).toBeTruthy();
      expect(f.citation.year, `${f.slug} citation year`).toBeGreaterThanOrEqual(1900);

      for (const s of f.literature ?? []) {
        expect(s.url, `${f.slug} literature url`).toMatch(/^https?:\/\//);
        expect(s.title, `${f.slug} literature title`).toBeTruthy();
        expect(s.venue, `${f.slug} literature venue`).toBeTruthy();
        expect(s.year, `${f.slug} literature year`).toBeGreaterThanOrEqual(1900);
        // The shelf must not repeat the headline. URL equality is not enough —
        // the same DOI appears under both doi.org and the publisher's host.
        expect(s.title.toLowerCase(), `${f.slug} literature repeats headline title`)
          .not.toBe(f.citation.title.toLowerCase());
        const a = doiOf(s.url), b = doiOf(f.citation.url);
        if (a && b) expect(a, `${f.slug} literature repeats headline DOI`).not.toBe(b);
      }
    }
  });

  it('keeps every island inside the SVG readable twin, and clickably apart', () => {
    for (const f of FRONTIERS) {
      expect(f.chart.x, `${f.slug} x inside viewBox`).toBeGreaterThanOrEqual(0);
      expect(f.chart.x, `${f.slug} x inside viewBox`).toBeLessThanOrEqual(SVG_VIEWBOX.w);
      expect(f.chart.y, `${f.slug} y inside viewBox`).toBeGreaterThanOrEqual(0);
      expect(f.chart.y, `${f.slug} y inside viewBox`).toBeLessThanOrEqual(SVG_VIEWBOX.h);
      expect(f.chart.scale, `${f.slug} scale`).toBeGreaterThan(0.5);
      expect(f.chart.scale, `${f.slug} scale`).toBeLessThanOrEqual(1.2);
    }

    // No two islands may share a centre, and the tightest pair must stay above
    // the floor the pre-wave-3 atlas achieved (7.07px) by a wide margin — the
    // relaxation pass exists precisely to buy this back while doubling N.
    let min = Infinity;
    let pair: [string, string] = ['', ''];
    for (let i = 0; i < FRONTIERS.length; i++) {
      for (let j = i + 1; j < FRONTIERS.length; j++) {
        const a = FRONTIERS[i]!, b = FRONTIERS[j]!;
        const d = Math.hypot(a.chart.x - b.chart.x, a.chart.y - b.chart.y);
        if (d < min) { min = d; pair = [a.slug, b.slug]; }
      }
    }
    expect(min, `tightest pair ${pair[0]} ↔ ${pair[1]}`).toBeGreaterThan(24);
  });

  it('spreads the new islands across all four domains', () => {
    for (const domain of DOMAINS) {
      expect(
        WAVE_3.filter((f) => f.domain === domain).length,
        `${domain} wave-3 additions`,
      ).toBeGreaterThan(0);
    }
    // Domain is an editorial cluster→domain map, and 交叉 owns 20 of the 53
    // clusters, so levelling clusters necessarily leaves it the largest band.
    // Assert it stays a plurality, not a majority.
    const crossing = FRONTIERS.filter((f) => f.domain === '交叉').length;
    expect(crossing / FRONTIERS.length, '交叉 share').toBeLessThan(0.5);
  });
});

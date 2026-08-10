import { describe, expect, it } from 'vitest';
import { DATA, SAMPLE_SLUG, type IslandDatum } from '../api/fallback';
import { clusterSiblingsOf, islandSlugOf, stepIsland } from '../models/islandStepping';
import { zh } from '../i18n/zh';
import { en } from '../i18n/en';

function datum(id: number, slug?: string, cluster?: string): IslandDatum {
  return {
    id,
    n: { zh: `岛${id}`, en: `Isle ${id}` },
    q: { zh: '问', en: 'q' },
    d: '交叉',
    x: 0, y: 0, s: 1, st: 1, m: 1, a: 1,
    ...(slug ? { slug } : {}),
    ...(cluster ? { cluster: { code: cluster, zh: cluster, en: cluster } } : {}),
  } as IslandDatum;
}

const ROSTER = [datum(1, 'alpha'), datum(2, 'beta'), datum(3, 'gamma')];

describe('stepIsland', () => {
  it('steps in roster order and wraps at both ends', () => {
    expect(stepIsland(ROSTER, 'beta', 1)?.slug).toBe('gamma');
    expect(stepIsland(ROSTER, 'beta', -1)?.slug).toBe('alpha');
    expect(stepIsland(ROSTER, 'gamma', 1)?.slug).toBe('alpha');
    expect(stepIsland(ROSTER, 'alpha', -1)?.slug).toBe('gamma');
  });

  it('resolves the bespoke sample island through its slug fallback', () => {
    const sample = datum(1001);
    const withSample = [datum(1, 'alpha'), sample, datum(3, 'gamma')];
    expect(islandSlugOf(sample)).toBe('machine-curiosity');
    expect(stepIsland(withSample, 'machine-curiosity', 1)?.slug).toBe('gamma');
  });

  it('steps nowhere from an unknown slug or a roster of one', () => {
    expect(stepIsland(ROSTER, 'missing', 1)).toBeNull();
    expect(stepIsland([datum(1, 'alpha')], 'alpha', 1)).toBeNull();
  });
});

describe('clusterSiblingsOf', () => {
  it('lists the cluster without the island itself', () => {
    const roster = [
      datum(1, 'alpha', 'C07'), datum(2, 'beta', 'C07'),
      datum(3, 'gamma', 'C07'), datum(4, 'delta', 'C12'),
    ];
    const siblings = clusterSiblingsOf(roster, 'alpha');
    expect(siblings?.map((s) => s.slug)).toEqual(['beta', 'gamma']);
    expect(siblings?.every((s) => s.name.zh && s.name.en)).toBe(true);
  });

  it('gives the sample island no cluster rather than a fabricated one', () => {
    // The sample island is authored in this repo, not projected from the
    // corpus. Putting it in someone else's cluster would be inventing
    // provenance for the one island that has none.
    expect(clusterSiblingsOf(DATA, SAMPLE_SLUG)).toBeNull();
    expect(clusterSiblingsOf([datum(1, 'alpha')], 'alpha')).toBeNull();
    expect(clusterSiblingsOf(DATA, 'not-an-island')).toBeNull();
  });

  it('reaches every corpus island — the claim that motivates the affordance', () => {
    // The point of projecting the corpus filing is that it covers islands no
    // authored relational layer has reached yet. If that coverage were partial
    // the affordance would be one more layer with a backlog, so it is a gate.
    const corpusIslands = DATA.filter((d) => d.cluster?.code);
    const empty = corpusIslands.filter((d) => {
      const siblings = clusterSiblingsOf(DATA, islandSlugOf(d));
      return !siblings || siblings.length === 0;
    });
    expect(empty.map((d) => islandSlugOf(d)), 'islands whose cluster list is empty').toEqual([]);
    expect(corpusIslands.length).toBeGreaterThan(300);
    // Every cluster is levelled to seven islands, so a sibling list is six.
    expect(new Set(corpusIslands.map((d) => clusterSiblingsOf(DATA, islandSlugOf(d))!.length)))
      .toEqual(new Set([6]));
  });

  it('never calls same-cluster islands related, in either language', () => {
    // This atlas measured that inferring a structural correspondence from
    // shared cluster membership fails about nine times in ten. Copy that calls
    // these islands "related" would contradict our own recorded evidence, and
    // the wording is exactly the kind of thing a later edit softens by accident.
    const zhCluster = zh.island.cluster;
    const enCluster = en.island.cluster;
    const zhText = Object.values(zhCluster).join(' ');
    const enText = Object.values(enCluster).join(' ').toLowerCase();
    expect(zhText).not.toMatch(/相关|关联的|类似问题/);
    expect(enText).not.toMatch(/\brelated\b|\bsimilar\b|\blinked\b/);
    // …and it must still say what the grouping IS, not just what it is not.
    expect(zhCluster.note).toMatch(/归类/);
    expect(enCluster.note).toMatch(/files them together/);
  });
});

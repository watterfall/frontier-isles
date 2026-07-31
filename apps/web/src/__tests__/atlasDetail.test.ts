import { describe, expect, it } from 'vitest';
import { atlasDetailOf, briefOf, citationOf, loadAtlasDetail } from '../api/atlasDetail';
import { DATA, type IslandDatum } from '../api/fallback';

const island = (over: Partial<IslandDatum> = {}): IslandDatum => ({
  id: 1,
  n: { zh: '岛', en: 'Isle' },
  q: { zh: '问', en: 'Q' },
  d: '数理',
  x: 0,
  y: 0,
  s: 1,
  st: 0,
  m: 1,
  a: 1,
  slug: 'compositional-modeling',
  ...over,
});

describe('deferred atlas detail', () => {
  it('reads nothing before the deferred chunk has loaded', () => {
    // Cache-miss path: a card renders correct-but-shorter rather than crashing.
    expect(atlasDetailOf('no-such-island')).toBeUndefined();
    expect(briefOf(island({ slug: 'no-such-island' }))).toBeUndefined();
    expect(citationOf(island({ slug: 'no-such-island' }))).toBeUndefined();
  });

  it('serves prose and citations once loaded', async () => {
    await loadAtlasDetail();
    expect(briefOf(island())).toBeDefined();
    expect(briefOf(island())?.zh).toBeTruthy();
    expect(citationOf(island())?.url).toMatch(/^https?:\/\//);
  });

  it('never overwrites prose an island already carries', async () => {
    await loadAtlasDetail();
    const bespoke = island({ brief: { zh: '手写', en: 'hand-written' } });
    expect(briefOf(bespoke)).toEqual({ zh: '手写', en: 'hand-written' });
  });

  it('keeps the eager atlas free of the deferred fields, so the split stays real', () => {
    // A regression here means brief/citation crept back into the entry payload.
    const frontiers = DATA.filter((d) => !d.sample && d.id < 1000);
    expect(frontiers.length).toBeGreaterThan(0);
    expect(frontiers.every((d) => d.brief === undefined)).toBe(true);
    expect(frontiers.every((d) => d.citation === undefined)).toBe(true);
    // …while the field the L0 map groups by must still ship eagerly.
    expect(frontiers.some((d) => d.cluster?.code)).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { applyAtlasDetail, type AtlasDetailMap } from '../api/atlasDetail';
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
  slug: 'a',
  ...over,
});

const CITATION = { url: 'https://doi.org/x', title: 'T', venue: 'V', year: 2026 };

describe('applyAtlasDetail', () => {
  it('folds deferred brief and citation onto the matching island', () => {
    const detail: AtlasDetailMap = { a: { brief: { zh: '简', en: 'Brief' }, citation: CITATION } };
    const [merged] = applyAtlasDetail([island()], detail);
    expect(merged?.brief).toEqual({ zh: '简', en: 'Brief' });
    expect(merged?.citation).toEqual(CITATION);
  });

  it('leaves an island the detail map has nothing for untouched, by reference', () => {
    const untouched = island({ slug: 'missing' });
    const out = applyAtlasDetail([untouched], { a: { brief: { zh: '简', en: 'B' } } });
    expect(out[0]).toBe(untouched);
  });

  // The islands array feeds a stage-boot effect: a gratuitously fresh array
  // tears down the Pixi atlas mid-session. An empty or failed detail load must
  // therefore be a true no-op, not a same-content copy.
  it('returns the very same array when the detail map contributes nothing', () => {
    const islands = [island(), island({ id: 2, slug: 'b' })];
    expect(applyAtlasDetail(islands, {})).toBe(islands);
    expect(applyAtlasDetail(islands, { zzz: { brief: { zh: '无', en: 'none' } } })).toBe(islands);
  });

  it('never overwrites prose an island already carries', () => {
    const bespoke = island({ brief: { zh: '手写', en: 'hand-written' } });
    const out = applyAtlasDetail([bespoke], { a: { brief: { zh: '生成', en: 'generated' } } });
    expect(out[0]?.brief).toEqual({ zh: '手写', en: 'hand-written' });
    expect(out[0]).toBe(bespoke);
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

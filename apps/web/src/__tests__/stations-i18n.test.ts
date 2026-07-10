import { describe, it, expect } from 'vitest';
import { STATION_KINDS, STATION_META } from '@frontier-isles/core';
import { localizeStation, localizeStationZh, stationKindByZh } from '../i18n/stations';

/**
 * Station placards (architecture.md §9: load-bearing glossary terms — NOT the
 * "editorial content" that stays untranslated, e.g. island names/questions/
 * resident names/in-SVG captions) must follow the UI language everywhere a
 * label layer reads them, including the Pixi L1 screen-space label layer
 * (scene/PixiScene.tsx `lang` prop, P1 名牌 i18n).
 */
describe('station i18n', () => {
  it('localizeStation returns the zh/en pair from STATION_META for every kind', () => {
    for (const kind of STATION_KINDS) {
      expect(localizeStation(kind, 'zh')).toBe(STATION_META[kind].zh);
      expect(localizeStation(kind, 'en')).toBe(STATION_META[kind].en);
    }
  });

  it('every station has a non-empty en name distinct from its zh name', () => {
    for (const kind of STATION_KINDS) {
      expect(STATION_META[kind].en.length).toBeGreaterThan(0);
      expect(STATION_META[kind].en).not.toBe(STATION_META[kind].zh);
    }
  });

  it('stationKindByZh + localizeStationZh round-trip every authored zh name', () => {
    for (const kind of STATION_KINDS) {
      const zh = STATION_META[kind].zh;
      expect(stationKindByZh(zh)).toBe(kind);
      expect(localizeStationZh(zh, 'en')).toBe(STATION_META[kind].en);
      expect(localizeStationZh(zh, 'zh')).toBe(zh);
    }
  });

  it('an unrecognized zh string passes through unchanged (fallback data safety)', () => {
    expect(localizeStationZh('不存在的站', 'en')).toBe('不存在的站');
  });
});

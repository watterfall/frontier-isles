/**
 * Station-name localization. Load-bearing station terms (glossary §9) are
 * owned by @frontier-isles/core's STATION_META (zh + en both authored there),
 * so the web app localizes them from that single source rather than
 * duplicating the strings.
 */
import { STATION_KINDS, STATION_META, type StationKind } from '@frontier-isles/core';

export type Lang = 'zh' | 'en';

export function localizeStation(kind: StationKind, lang: Lang): string {
  return lang === 'en' ? STATION_META[kind].en : STATION_META[kind].zh;
}

const ZH_TO_KIND: Record<string, StationKind> = Object.fromEntries(
  STATION_KINDS.map((k) => [STATION_META[k].zh, k]),
) as Record<string, StationKind>;

/** Map an authored zh station name (as used in fallback data) to its kind. */
export function stationKindByZh(zhName: string): StationKind | undefined {
  return ZH_TO_KIND[zhName];
}

/** Localize a station name given as an authored zh string. */
export function localizeStationZh(zhName: string, lang: Lang): string {
  const k = ZH_TO_KIND[zhName];
  return k ? localizeStation(k, lang) : zhName;
}

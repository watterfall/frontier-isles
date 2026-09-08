import { useTranslation } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import type { IslandCharacter } from './islandCharacter';
import { STATION_PLACES } from './stationSpatial';
import { StationPortrait } from './StationArchitecture';

/** Preview never changes the camera or records a visit. */
export function StationPreview({ station, character, lang }: {
  station?: StationKind | null; character?: IslandCharacter; lang: 'zh' | 'en';
}) {
  const { t } = useTranslation();
  const place = station ? STATION_PLACES[station] : null;
  return <div className="fi-station-preview" data-preview-station={station ?? undefined} aria-hidden="true">
    {place && station ? <>
      <StationPortrait station={station} character={character}/>
      <div><strong>{place.title[lang]}</strong><p>{place.purpose[lang]}</p><small>{t('islandNavigation.previewAction', { lng: lang })}</small></div>
    </> : <p><span className="fi-map-pointer-hint">{t('islandNavigation.mapHint', { lng: lang })}</span><span className="fi-map-touch-hint">{t('islandNavigation.touchHint', { lng: lang })}</span></p>}
  </div>;
}

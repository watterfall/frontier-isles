import type { IslandCharacter } from '../../scene/islandCharacter';
import type { StationKind } from '@frontier-isles/core';
import type { BuildingFloorPlan } from './islandDepth';
import { buildingExcerpt } from './islandDepth';
import { STATION_PLACES } from '../../scene/stationSpatial';
import { StationPortrait } from '../../scene/StationArchitecture';
import { BuildingPlan } from './BuildingPlan';
import { BUILDING_EXPLORATION } from './buildingExploration';

export function StationArrival({ station, plan, lang, onEnter, onOverview, character, onRoom, visited=[], lastRoom }: {
  character?:IslandCharacter; station: StationKind; plan:BuildingFloorPlan|undefined; lang:'zh'|'en'; onEnter:()=>void; onOverview:()=>void;
  onRoom?:(id:string)=>void;visited?:readonly string[];lastRoom?:string;
}) {
  const place=STATION_PLACES[station];
  return <section className="fi-station-arrival" aria-labelledby="fi-station-arrival-title">
    <div className="fi-station-arrival-head"><StationPortrait station={station} character={character}/><div><h2 id="fi-station-arrival-title">{place.title[lang]}</h2><p>{place.purpose[lang]}</p></div></div>
    <p className="fi-arrival-invitation">{BUILDING_EXPLORATION[station].invitation[lang]}</p>
    {plan&&onRoom?<BuildingPlan plan={plan} lang={lang} selected={lastRoom} visited={visited} onRoom={onRoom}/>:<blockquote>{buildingExcerpt(plan,lang)}</blockquote>}
    <div className="fi-station-arrival-actions"><button type="button" data-station-enter={station} onClick={onEnter}>{lastRoom?(lang==='zh'?'接着上次阅读':'Resume reading'):(lang==='zh'?`进入${place.title.zh}`:`Enter ${place.title.en}`)}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5"/></svg></button><button type="button" onClick={onOverview}>{lang==='zh'?'看全岛':'See the island'}</button></div>
  </section>;
}

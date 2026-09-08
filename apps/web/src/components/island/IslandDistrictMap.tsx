import type { IslandCharacter } from '../../scene/islandCharacter';
import { buildingExcerpt } from './islandDepth';
import { useEffect, useMemo, useState } from 'react';
import type { StationKind } from '@frontier-isles/core';
import type { ApiStructure } from '../../api/client';
import type { IslandDistrictId } from '../../state/explorationSession';
import type { BuildingFloorPlan, IslandDistrict, IslandDistrictProjection } from './islandDepth';
import { STATION_PLACES } from '../../scene/stationSpatial';
import { StationPortrait } from '../../scene/StationArchitecture';
import { IslandWayfinder } from './IslandWayfinder';
import type { LayoutInput } from '../../scene/layout';
import { useTranslation } from 'react-i18next';

export interface IslandDistrictMapProps {
  input?:LayoutInput;
  onOverview?:()=>void;
  character?:IslandCharacter;
  projection: IslandDistrictProjection;
  plans: readonly BuildingFloorPlan[];
  visitedFloors: Record<string, readonly string[]>;
  activeStructure?: ApiStructure | null;
  selectedStation?: StationKind | null;
  previewStation?: StationKind | null;
  onPreview?: (station: StationKind | null) => void;
  lang: 'zh' | 'en';
  onSurvey: (districtId: IslandDistrictId) => void;
  onStation: (station: StationKind) => void;
  onActiveDistrict?: (district: IslandDistrict) => void;
}
const LENSES: Record<IslandDistrictId, {zh:string;en:string}> = {
  inquiry:{zh:'追问与分歧',en:'Questions'}, archive:{zh:'论据与测量',en:'Evidence'},
  works:{zh:'方法与尝试',en:'Methods'}, observatory:{zh:'结果与影响',en:'Results'}, harbor:{zh:'交流与远行',en:'Connections'},
};
const ORDER: IslandDistrictId[] = ['inquiry','archive','works','observatory','harbor'];

/** Wayfinding points at the visible buildings. All material is freely reachable;
 * a visit is a private breadcrumb, never a prerequisite or research result. */
export function IslandDistrictMap({ input, onOverview, character, projection, plans, selectedStation, previewStation, visitedFloors, onPreview, lang, onSurvey, onStation, onActiveDistrict }: IslandDistrictMapProps) {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<IslandDistrictId>('inquiry');
  const [open, setOpen] = useState(true);
  const selected = projection.districts.find(d=>d.id===selectedId) ?? projection.districts[0]!;
  const planByStation = useMemo(()=>new Map(plans.map(p=>[p.station,p])),[plans]);
  useEffect(()=>{
    if (selectedStation) setSelectedId(STATION_PLACES[selectedStation].district);
  },[selectedStation]);
  useEffect(()=>{ onActiveDistrict?.(selected); },[onActiveDistrict,selected.id,selected.name.zh,selected.name.en]);
  return <aside className="fi-island-guide" data-testid="island-district-map">
    {input&&<IslandWayfinder input={input} stations={plans.map(p=>p.station)} selected={selectedStation} preview={previewStation} visited={visitedFloors} onPreview={onPreview} lang={lang} onStation={onStation} onOverview={onOverview??(()=>{})}/>}
    <button type="button" className="fi-island-guide-toggle" onClick={()=>setOpen(!open)} aria-expanded={open}>
      <span>{lang==='zh'?'岛上去处':'Places on this island'}</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d={open?'m5 12 5-5 5 5':'m5 8 5 5 5-5'}/></svg>
    </button>
    {open && <div className="fi-island-guide-body">
      <div className="fi-island-lenses" aria-label={lang==='zh'?'按研究用途寻找建筑':'Find a place by purpose'}>
        {ORDER.map(id=>{
          const district=projection.districts.find(d=>d.id===id)!;
          return <button key={id} type="button" aria-pressed={selectedId===id} onClick={()=>{setSelectedId(id);if(district.state!=='sealed')onSurvey(id);}}>{LENSES[id][lang]}</button>;
        })}
      </div>
      <p className="fi-island-guide-intent">{selected.description[lang]}</p>
      <div className="fi-island-places" aria-label={lang==='zh'?'此处的建筑':'Buildings here'}>
        {selected.stations.length===0 ? <p className="fi-island-place-empty">{lang==='zh'?'本岛还没有这类研究空间。可以从问题墙开始，或看看已有来源。':'No space of this kind exists here yet. Try the question wall or available sources.'}</p> : selected.stations.map(station=>{
          const place=STATION_PLACES[station],plan=planByStation.get(station);
          return <button type="button" key={station} data-station-row={station} aria-pressed={selectedStation===station} data-preview={previewStation===station} onMouseEnter={()=>onPreview?.(station)} onMouseLeave={()=>onPreview?.(null)} onFocus={()=>onPreview?.(station)} onBlur={()=>onPreview?.(null)} onClick={()=>onStation(station)} disabled={!plan}>
            <StationPortrait station={station} character={character}/>
            <span><strong>{place.title[lang]}</strong><small>{place.purpose[lang]}</small><span className="fi-place-material">{buildingExcerpt(plan,lang)}</span>{!!visitedFloors[station]?.length&&<small className="fi-place-visited">{t('islandNavigation.visited',{lng:lang})}</small>}</span>
            <svg className="fi-place-arrow" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5"/></svg>
          </button>;
        })}
      </div>
      <p className="fi-island-guide-foot">{lang==='zh'?'先在地图上定位建筑，再选择你想进入的研究空间。':'Locate a building, then choose a research space inside.'}</p>
    </div>}
  </aside>;
}

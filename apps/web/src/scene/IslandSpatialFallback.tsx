import { useMemo } from 'react';
import type { ClaimState, StationKind } from '@frontier-isles/core';
import { chaikinClosed, terrainBoundaryLoops, worldToScreen, worldToScreenElevated, ELEV_STEP } from '@frontier-isles/renderer';
import { buildSceneGraph, type LayoutInput } from './layout';
import { StationArchitecture, ARCHITECTURE_TOP } from './StationArchitecture';
import { STATION_PLACES, STATION_WALK, islandOverview } from './stationSpatial';
import { StationPreview } from './StationPreview';

/** The same terrain and station addresses as Pixi, with semantic SVG controls. */
export function IslandSpatialFallback({ input, claims, night, selectedStation, previewStation, onPreview, onStation, onOverview, lang, onClaim }: {
  input: LayoutInput; claims: ClaimState[]; night: boolean; selectedStation: StationKind | null;
  onStation: (station: StationKind) => void; onOverview: () => void; lang: 'zh' | 'en'; onClaim: (claim: ClaimState) => void;
  previewStation?: StationKind | null; onPreview?: (station: StationKind | null) => void;
}) {
  const graph = useMemo(() => buildSceneGraph(input, night ? 1 : 0, claims), [input, night, claims]);
  const terrain = graph.objects.filter(object => object.layer === 'terrain');
  const stations = graph.objects.filter(object => object.id.startsWith('station:'));
  const position = (object: typeof stations[number]) => worldToScreenElevated(object.gx + .5, object.gy + .5, object.elevation);
  const selected = stations.find(object => object.id === `station:${selectedStation}`);
  const overview = islandOverview(graph);
  const center = selected ? position(selected) : overview;
  const width = selected ? 620 : overview.width, height = selected ? 470 : overview.height;
  const route = (input.character?.walk ?? STATION_WALK).flatMap(kind => { const object = stations.find(item => item.id === `station:${kind}`); return object ? [position(object)] : []; });
  return <div className="fi-island-landscape fi-island-svg-fallback">
    <svg viewBox={`${center.x-width/2} ${center.y-height/2-(selected?40:0)} ${width} ${height}`} role="group" aria-label={lang === 'zh' ? '岛屿地图，使用建筑按钮探索' : 'Island map: explore with the building buttons'}>
      {[0,1,2].flatMap(level => terrainBoundaryLoops(new Set(terrain.filter(object => object.elevation >= level).map(object => `${object.gx},${object.gy}`))).map((loop, index) => {
        const points = chaikinClosed(loop.map(([x,y]) => worldToScreen(x,y)), 3).map(point => `${point.x},${point.y-level*ELEV_STEP}`).join(' ');
        return <polygon key={`${level}:${index}`} points={points} fill={night ? ['#566b65','#677b6a','#7a866c'][level] : ['#c6c4a0','#d2cda9','#dfd4ac'][level]} stroke={level === 0 ? '#acb5a0' : '#aea381'} strokeWidth={level === 0 ? 8 : 1.5}/>;
      }))}
      <polyline points={route.map(point => `${point.x},${point.y}`).join(' ')} fill="none" stroke="#b99e71" strokeWidth="11" strokeLinejoin="round" opacity=".55"/>
      {stations.sort((a,b) => a.depthKey-b.depthKey).map(object => {
        const kind = object.id.slice(8) as StationKind, point = position(object), active = kind === selectedStation;
        return <g key={object.id} transform={`translate(${point.x} ${point.y})`} role="button" tabIndex={0} aria-label={STATION_PLACES[kind].title[lang]} aria-pressed={active} data-preview={previewStation===kind} onMouseEnter={()=>onPreview?.(kind)} onMouseLeave={()=>onPreview?.(null)} onFocus={()=>onPreview?.(kind)} onBlur={()=>onPreview?.(null)} onClick={() => onStation(kind)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onStation(kind); } }} style={{cursor:'pointer'}}>
          <ellipse className="fi-fallback-hover" rx="75" ry="35"/>
          {active && <ellipse rx="67" ry="30" fill="none" stroke="#315d70" strokeWidth="3"/>}
          <g transform="scale(.682)"><StationArchitecture station={kind} selected={active} character={input.character}/></g>
          <text y={-ARCHITECTURE_TOP[kind]*.682-10} textAnchor="middle" fill={night ? '#f5eedc' : '#293d38'} fontSize="18" fontWeight="600">{STATION_PLACES[kind].title[lang]}</text>
        </g>;
      })}
    </svg>
    <StationPreview station={previewStation} character={input.character} lang={lang}/>
    <div className="fi-island-camera"><button type="button" onClick={onOverview}>{lang === 'zh' ? '看全岛' : 'Overview'}</button></div>
    {claims.length > 0 && <div className="fi-island-claim-list">{claims.map((claim,index) => <button key={index} type="button" onClick={() => onClaim(claim)}>{lang === 'zh' ? '查看论断' : 'Read claim'} {index+1}</button>)}</div>}
  </div>;
}

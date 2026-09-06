import { useMemo, useState } from 'react';
import type { StationKind } from '@frontier-isles/core';
import { terrainBoundaryLoops, chaikinClosed } from '@frontier-isles/renderer';
import { buildSceneGraph, type LayoutInput } from '../../scene/layout';
import { STATION_PLACES } from '../../scene/stationSpatial';
import { EXPLORATION_ROUTES } from './buildingExploration';

export function IslandWayfinder({input,stations,selected,lang,onStation,onOverview}: {
  input:LayoutInput;stations:readonly StationKind[];selected?:StationKind|null;lang:'zh'|'en';onStation:(station:StationKind)=>void;onOverview:()=>void;
}) {
  const [guided,setGuided]=useState(false);
  const graph=useMemo(()=>buildSceneGraph(input,0,[]),[input]);
  const xy=(gx:number,gy:number)=>({x:160+(gx-gy)*10,y:14+(gx+gy)*5.6});
  const land=useMemo(()=>terrainBoundaryLoops(new Set(graph.objects.filter(o=>o.layer==='terrain').map(o=>`${o.gx},${o.gy}`))),[graph]);
  const positions=new Map(graph.objects.filter(o=>o.id.startsWith('station:')).map(o=>[o.id.slice(8) as StationKind,xy(o.gx+.5,o.gy+.5)]));
  const outline=land.flatMap(loop=>loop.map(([x,y])=>xy(x,y)));
  const left=Math.min(...outline.map(p=>p.x))-22, top=Math.min(...outline.map(p=>p.y))-28;
  const width=Math.max(...outline.map(p=>p.x))-left+22, height=Math.max(...outline.map(p=>p.y))-top+28;
  const route=EXPLORATION_ROUTES[input.character?.program??'unknowns'];
  const stops=route.stops.filter(s=>stations.includes(s));
  return <section className="fi-wayfinder" aria-label={lang==='zh'?'岛内方位与探索线索':'Island orientation and exploration trail'}>
    <div className="fi-wayfinder-location"><button type="button" onClick={onOverview} aria-current={!selected?'location':undefined}>{lang==='zh'?'全岛':'Island'}</button><span aria-hidden="true">/</span><strong>{selected?STATION_PLACES[selected].title[lang]:(lang==='zh'?'自由探索':'Free exploration')}</strong></div>
    <svg viewBox={`${left} ${top} ${width} ${height}`} role="group" aria-label={lang==='zh'?'建筑方位小图':'Building location map'}>
      {land.map((loop,index)=><polygon className="fi-wayfinder-land" key={index} points={chaikinClosed(loop.map(([x,y])=>xy(x,y)),2).map(p=>`${p.x},${p.y}`).join(' ')}/>)}
      {guided&&<polyline className="fi-wayfinder-route" points={stops.flatMap(s=>{const p=positions.get(s);return p?[`${p.x},${p.y}`]:[];}).join(' ')}/>}
      {stations.map(station=>{const p=positions.get(station);if(!p)return null;return <g key={station} role="button" tabIndex={0} aria-label={`${lang==='zh'?'定位':'Locate'}${STATION_PLACES[station].title[lang]}`} aria-pressed={selected===station}
        transform={`translate(${p.x} ${p.y})`} data-map-station={station} onClick={()=>onStation(station)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onStation(station);}}}>
        <circle className="fi-wayfinder-target" r="23"/><circle className="fi-wayfinder-dot" r={selected===station?8:5} data-route={guided&&stops.includes(station)}/>
        <text y={station==='dock'?20:-14} textAnchor="middle">{lang==='zh'?STATION_PLACES[station].title.zh:STATION_PLACES[station].title.en}</text>
      </g>;})}
    </svg>
    <button type="button" className="fi-wayfinder-trail-toggle" aria-expanded={guided} onClick={()=>setGuided(!guided)}><span>{route.title[lang]}</span><span>{guided?(lang==='zh'?'收起线索':'Hide trail'):(lang==='zh'?'展开线索':'Show trail')}</span></button>
    {guided&&<div className="fi-wayfinder-trail"><ol>{stops.map(station=><li key={station}><button type="button" aria-current={selected===station?'location':undefined} onClick={()=>onStation(station)}><strong>{STATION_PLACES[station].title[lang]}</strong><span>{STATION_PLACES[station].purpose[lang]}</span></button></li>)}</ol><p>{lang==='zh'?'随时可以离开这条阅读线索。虚线是导览顺序，不代表研究关系。':'Leave this reading trail at any time. The dashed line suggests an order, not a research relationship.'}</p></div>}
  </section>;
}

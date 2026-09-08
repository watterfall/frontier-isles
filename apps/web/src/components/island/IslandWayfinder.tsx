import { useMemo, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import { terrainBoundaryLoops, chaikinClosed } from '@frontier-isles/renderer';
import { buildSceneGraph, type LayoutInput } from '../../scene/layout';
import { STATION_PLACES } from '../../scene/stationSpatial';
import { StationArchitecture } from '../../scene/StationArchitecture';
import { EXPLORATION_ROUTES } from './buildingExploration';

export function IslandWayfinder({ input, stations, selected, preview, visited = {}, lang, onStation, onOverview, onPreview }: {
  input: LayoutInput; stations: readonly StationKind[]; selected?: StationKind | null;
  preview?: StationKind | null; visited?: Record<string, readonly string[]>;
  lang: 'zh' | 'en'; onStation: (station: StationKind) => void; onOverview: () => void;
  onPreview?: (station: StationKind | null) => void;
}) {
  const { t } = useTranslation();
  const [guided, setGuided] = useState(false);
  const graph = useMemo(() => buildSceneGraph(input, 0, []), [input]);
  const xy = (gx: number, gy: number) => ({ x: 160 + (gx - gy) * 10, y: 14 + (gx + gy) * 5.6 });
  const land = useMemo(() => terrainBoundaryLoops(new Set(graph.objects.filter(o => o.layer === 'terrain').map(o => `${o.gx},${o.gy}`))), [graph]);
  const positions = new Map(graph.objects.filter(o => o.id.startsWith('station:')).map(o => [o.id.slice(8) as StationKind, xy(o.gx + .5, o.gy + .5)]));
  const outline = land.flatMap(loop => loop.map(([x, y]) => xy(x, y)));
  const left = Math.min(...outline.map(p => p.x)) - 22, top = Math.min(...outline.map(p => p.y)) - 28;
  const width = Math.max(...outline.map(p => p.x)) - left + 22, height = Math.max(...outline.map(p => p.y)) - top + 28;
  const route = EXPLORATION_ROUTES[input.character?.program ?? 'unknowns'];
  const stops = route.stops.filter(s => stations.includes(s));
  const currentIndex = selected ? stops.indexOf(selected) : -1;
  const nextStop = stops[currentIndex + 1];
  const indicated = preview ?? selected;
  const indicatedPoint = indicated ? positions.get(indicated) : undefined;
  const readBefore = (station: StationKind) => !!visited[station]?.length;
  const focusNeighbor = (event: KeyboardEvent<SVGGElement>, station: StationKind) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); onStation(station); return;
    }
    const point = positions.get(station)!;
    const directions: Record<string, readonly number[]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const direction = directions[event.key];
    let next: StationKind | undefined;
    if (direction) {
      event.preventDefault();
      next = stations.filter(s => s !== station && positions.has(s)).map(s => {
        const p = positions.get(s)!, dx = p.x - point.x, dy = p.y - point.y;
        return { station: s, forward: dx * direction[0]! + dy * direction[1]!, distance: Math.hypot(dx, dy) + Math.abs(dx * direction[1]! - dy * direction[0]!) };
      }).filter(p => p.forward > 0).sort((a, b) => a.distance - b.distance)[0]?.station;
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); next = event.key === 'Home' ? stations[0] : stations[stations.length - 1];
    }
    if (next) event.currentTarget.ownerSVGElement?.querySelector<SVGGElement>(`[data-map-station="${next}"]`)?.focus();
  };
  return <section className="fi-wayfinder" aria-label={lang === 'zh' ? '岛内方位与探索线索' : 'Island orientation and exploration trail'}>
    <div className="fi-wayfinder-location"><button type="button" onClick={onOverview} aria-current={!selected ? 'location' : undefined}>{lang === 'zh' ? '全岛' : 'Island'}</button><span aria-hidden="true">/</span><strong>{selected ? STATION_PLACES[selected].title[lang] : (lang === 'zh' ? '自由探索' : 'Free exploration')}</strong></div>
    <svg viewBox={`${left} ${top} ${width} ${height}`} role="group" aria-label={lang === 'zh' ? '建筑方位小图' : 'Building location map'}>
      {land.map((loop, index) => <polygon className="fi-wayfinder-land" key={index} points={chaikinClosed(loop.map(([x, y]) => xy(x, y)), 2).map(p => `${p.x},${p.y}`).join(' ')}/>)}
      {guided && <polyline className="fi-wayfinder-route" points={stops.flatMap(s => { const p = positions.get(s); return p ? [`${p.x},${p.y}`] : []; }).join(' ')}/>}
      {stations.map(station => {
        const p = positions.get(station); if (!p) return null;
        return <g key={station} role="button" tabIndex={0} aria-label={`${lang === 'zh' ? '定位' : 'Locate '}${STATION_PLACES[station].title[lang]}`} aria-pressed={selected === station}
          transform={`translate(${p.x} ${p.y})`} data-map-station={station} data-preview={preview === station} data-visited={readBefore(station)}
          onClick={() => onStation(station)} onKeyDown={event => focusNeighbor(event, station)} onMouseEnter={() => onPreview?.(station)} onMouseLeave={() => onPreview?.(null)} onFocus={() => onPreview?.(station)} onBlur={() => onPreview?.(null)}>
          <title>{STATION_PLACES[station].purpose[lang]}{readBefore(station) ? ` · ${t('islandNavigation.visited', { lng: lang })}` : ''}</title>
          <circle className="fi-wayfinder-target" r="23"/>
          <ellipse className="fi-wayfinder-footprint" rx="15" ry="8"/>
          <g className="fi-wayfinder-building" transform="translate(0 3) scale(.15)" aria-hidden="true"><StationArchitecture station={station} character={input.character}/></g>
          {readBefore(station) && <path className="fi-wayfinder-read-mark" d="M-7 13H7"/>}
        </g>;
      })}
      {indicated && indicatedPoint && <text className="fi-wayfinder-place-label" x={Math.max(left+70,Math.min(left+width-70,indicatedPoint.x))} y={indicatedPoint.y - 31} textAnchor="middle" aria-hidden="true">{STATION_PLACES[indicated].title[lang]}</text>}
    </svg>
    <p className="fi-wayfinder-caption" aria-live="polite">{indicated ? <><strong>{STATION_PLACES[indicated].title[lang]}</strong><span>{STATION_PLACES[indicated].purpose[lang]}</span></> : t('islandNavigation.mapCaption', { lng: lang })}</p>
    {stations.some(readBefore) && <p className="fi-wayfinder-legend"><i aria-hidden="true"/>{t('islandNavigation.visitedLegend', { lng: lang })}</p>}
    <button type="button" className="fi-wayfinder-trail-toggle" aria-expanded={guided} onClick={() => setGuided(!guided)}><span>{route.title[lang]}</span><span>{guided ? (lang === 'zh' ? '收起线索' : 'Hide trail') : (lang === 'zh' ? '展开线索' : 'Show trail')}</span></button>
    {guided && <div className="fi-wayfinder-trail">
      <ol>{stops.map(station => <li key={station} data-visited={readBefore(station)}><button type="button" aria-current={selected === station ? 'location' : undefined} onClick={() => onStation(station)}><strong>{STATION_PLACES[station].title[lang]}</strong><span>{STATION_PLACES[station].purpose[lang]}</span>{readBefore(station) && <small>{t('islandNavigation.visited', { lng: lang })}</small>}</button></li>)}</ol>
      {nextStop ? <button className="fi-wayfinder-next" type="button" onClick={() => onStation(nextStop)}>{t('islandNavigation.nextStop', { lng: lang, place: STATION_PLACES[nextStop].title[lang] })}<span aria-hidden="true">→</span></button> : <p>{t('islandNavigation.trailEnd', { lng: lang })}</p>}
      <p>{lang === 'zh' ? '随时可以离开这条阅读线索。虚线是导览顺序，不代表研究关系。' : 'Leave this reading trail at any time. The dashed line suggests an order, not a research relationship.'}</p>
    </div>}
  </section>;
}

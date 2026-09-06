import { worldToScreenElevated, type SceneGraph } from '@frontier-isles/renderer';
import type { StationKind } from '@frontier-isles/core';
import type { IslandDistrictId } from '../state/explorationSession';

export type IslandLayout = 'organic' | 'courtyard';
export interface StationPlace {
  district: IslandDistrictId;
  title: { zh: string; en: string };
  purpose: { zh: string; en: string };
  organic: { gx: number; gy: number };
  courtyard: { gx: number; gy: number };
}

/** One address per research place, shared by terrain, wayfinding and camera.
 * Districts are reading lenses, never unlock stages or claims of causality. */
export const STATION_PLACES: Record<StationKind, StationPlace> = {
  dock: { district:'harbor', title:{zh:'渡口',en:'Harbor'}, purpose:{zh:'从这里回看问题之间的联系',en:'Find where this problem leads'}, organic:{gx:8,gy:15},courtyard:{gx:8,gy:15} },
  questions: { district:'inquiry', title:{zh:'问题墙',en:'Question wall'}, purpose:{zh:'把主问题拆开，找到你的追问',en:'Find the question within the question'}, organic:{gx:8,gy:4},courtyard:{gx:11,gy:5} },
  canvas: { district:'inquiry', title:{zh:'白板厅',en:'Debate hall'}, purpose:{zh:'对照解释，看清分歧在哪里',en:'Compare explanations and their differences'}, organic:{gx:8,gy:12},courtyard:{gx:6,gy:8} },
  library: { district:'archive', title:{zh:'文献阁',en:'Library'}, purpose:{zh:'沿着论据回到可核对的出处',en:'Follow the argument back to its sources'}, organic:{gx:12,gy:9},courtyard:{gx:7,gy:3} },
  data: { district:'archive', title:{zh:'数据台',en:'Measurement terrace'}, purpose:{zh:'辨认测到了什么、记录了什么',en:'Separate measured data from recorded activity'}, organic:{gx:11,gy:12},courtyard:{gx:11,gy:10} },
  workshop: { district:'works', title:{zh:'实验坊',en:'Workshop'}, purpose:{zh:'看看方法如何工作、可以怎样检验',en:'Explore methods and possible tests'}, organic:{gx:11,gy:6},courtyard:{gx:4,gy:6} },
  driftwood: { district:'works', title:{zh:'散木园',en:'Unfinished garden'}, purpose:{zh:'从未完成与失败的线索继续想',en:'Think with unfinished and failed attempts'}, organic:{gx:5,gy:6},courtyard:{gx:8,gy:13} },
  gallery: { district:'observatory', title:{zh:'展厅',en:'Exhibition hall'}, purpose:{zh:'区分已有结果与仍待实现的影响',en:'Distinguish results from hoped-for impact'}, organic:{gx:5,gy:12},courtyard:{gx:4,gy:11} },
  tearoom: { district:'harbor', title:{zh:'讨论亭',en:'Discussion pavilion'}, purpose:{zh:'听见不同视角，留下还没成形的想法',en:'Encounter perspectives and unfinished thoughts'}, organic:{gx:4,gy:9},courtyard:{gx:10,gy:12} },
};
export const stationPosition = (station: StationKind, layout: IslandLayout = 'organic') => STATION_PLACES[station][layout];
export const STATION_WALK: readonly StationKind[] = ['dock','gallery','canvas','data','library','workshop','questions','driftwood','tearoom','dock'];

/** Fit the actual coastline, rather than assuming all island grammars are round. */
export function islandOverview(graph: SceneGraph) {
  const points = graph.objects.filter(object => object.layer === 'terrain').flatMap(object =>
    [[0,0],[1,0],[1,1],[0,1]].map(([x,y]) => worldToScreenElevated(object.gx+x!,object.gy+y!,object.elevation)));
  if (!points.length) return {x:0,y:480,width:1600,height:820};
  const left=Math.min(...points.map(point=>point.x))-70, right=Math.max(...points.map(point=>point.x))+70;
  const top=Math.min(...points.map(point=>point.y))-110, bottom=Math.max(...points.map(point=>point.y))+60;
  return {x:(left+right)/2,y:(top+bottom)/2,width:right-left,height:bottom-top};
}

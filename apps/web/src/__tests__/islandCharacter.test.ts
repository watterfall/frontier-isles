import { worldToScreenElevated } from '@frontier-isles/renderer';
import { describe,it,expect } from 'vitest';
import { islandCharacter } from '../scene/islandCharacter';
import { buildSceneGraph, researchObjectAt, type LayoutInput } from '../scene/layout';
import { frontierProgramOf } from '../components/island/islandDepth';
import { FRONTIERS } from '@frontier-isles/data/frontiers';
const base:LayoutInput={slug:'test',domain:'生命',stage:0,members:0,dormant:false,status:'open',outlier:false};
describe('island-specific settlements',()=>{
  it('keeps all research places on distinct land tiles for every curated island',()=>{
    const arrangements=new Set<string>();
    for(const island of FRONTIERS){
      const character=islandCharacter(frontierProgramOf(island.cluster,island.domain,island.title),island.slug);
      const stations=Object.keys(character.positions) as Array<keyof typeof character.positions>;
      const graph=buildSceneGraph({...base,slug:island.slug,domain:island.domain,character,layoutVariant:character.layout,materialStations:stations},0,[]);
      const places=graph.objects.filter(o=>o.id.startsWith('station:'));
      expect(places).toHaveLength(9);
      expect(new Set(places.map(o=>`${o.gx},${o.gy}`)).size).toBe(9);
      for(const place of places)expect(graph.objects.some(o=>o.layer==='terrain'&&o.gx===place.gx&&o.gy===place.gy)).toBe(true);
      expect(new Set(character.walk).size).toBe(9);
      expect(character).toEqual(islandCharacter(character.program,island.slug));
      arrangements.add(JSON.stringify(character.positions));
    }
    expect(arrangements.size).toBeGreaterThan(10);
  });
  it('exposes an existing library at stage zero without fabricating ledger growth',()=>{
    const graph=buildSceneGraph({...base,materialStations:['library']},0,[]);
    expect(graph.objects.filter(o=>o.kind.startsWith('station:')).map(o=>o.kind).sort()).toEqual(['station:dock','station:library','station:questions']);
    expect(graph.objects.filter(o=>o.kind==='claim')).toHaveLength(0);
  });
});

it('uses a specific island topic before a broad cluster label',()=>{
  expect(frontierProgramOf({zh:'AI数学·形式科学',en:'formal science'},'数理',{zh:'组合式科学建模',en:'Compositional Scientific Modeling'})).toBe('transfer');
  expect(frontierProgramOf({zh:'物理学',en:'physics'},'数理',{zh:'暗物质古探测',en:'dark matter paleo'})).toBe('unknowns');
});
it('picks a visible building by its displayed position and rejects open water',()=>{
  const graph=buildSceneGraph({...base,stage:2},0,[]);
  const wall=graph.objects.find(o=>o.id==='station:questions')!;
  const point=worldToScreenElevated(wall.gx+.5,wall.gy+.5,wall.elevation);
  expect(researchObjectAt(graph,point.x,point.y-35)).toBe('station:questions');
  expect(researchObjectAt(graph,-10000,-10000)).toBeNull();
});

it('does not pick an invisible night-only object during the day',()=>{
  const graph=buildSceneGraph({...base,stage:0},0,[]);
  const wall=graph.objects.find(o=>o.id==='station:questions')!;
  wall.kind='claim';wall.id='claim:0';wall.dayVisibility=0;wall.nightVisibility=1;
  const point=worldToScreenElevated(wall.gx+.5,wall.gy+.5,wall.elevation);
  expect(researchObjectAt(graph,point.x,point.y-10)).toBeNull();
  expect(researchObjectAt({...graph,t:1},point.x,point.y-10)).toBe('claim:0');
});

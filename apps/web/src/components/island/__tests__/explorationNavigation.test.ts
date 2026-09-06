import { describe,it,expect } from 'vitest';
import { emptyNavigation,navigationReducer } from '../explorationNavigation';
import { appendResearchNote,comparisonRecords } from '../buildingExploration';
import { buildingRooms, projectBuildingFloors } from '../islandDepth';
import { INTERIORS } from '@frontier-isles/data/interiors';

describe('reversible exploration addresses',()=>{
  it('approaches without opening or counting a read, then restores a previous room',()=>{
    let state=navigationReducer(emptyNavigation(),{type:'approach',station:'library'});
    expect(state.reading).toBeNull();expect(state.history).toEqual([]);
    state=navigationReducer(state,{type:'read',address:{station:'library',room:'library:source'}});
    state=navigationReducer(state,{type:'read',address:{station:'canvas',room:'canvas:debate'}});
    state=navigationReducer(state,{type:'outside'});
    expect(state.selected).toBe('canvas');expect(state.reading).toBeNull();
    state=navigationReducer(state,{type:'back'});
    expect(state.reading).toEqual({station:'library',room:'library:source'});
    expect(state.selected).toBe('library');
  });
  it('branches from the returned address, avoids duplicate visits, and clears on island change',()=>{
    let state=emptyNavigation();
    for(const station of ['questions','library','workshop'] as const)state=navigationReducer(state,{type:'read',address:{station}});
    state=navigationReducer(state,{type:'back'});
    state=navigationReducer(state,{type:'read',address:{station:'data'}});
    state=navigationReducer(state,{type:'read',address:{station:'data'}});
    expect(state.history.map(a=>a.station)).toEqual(['questions','library','data']);
    expect(navigationReducer(state,{type:'reset'})).toEqual(emptyNavigation());
  });
  it('keeps history bounded without losing the current address',()=>{
    let state=emptyNavigation();
    for(let i=0;i<40;i++)state=navigationReducer(state,{type:'read',address:{station:'library',room:String(i)}});
    expect(state.history).toHaveLength(30);expect(state.cursor).toBe(29);expect(state.reading?.room).toBe('39');
  });
});
describe('research material and private thought boundaries',()=>{
  it('keeps uncited summaries distinct and deduplicates the same cited record',()=>{
    const citation={title:'Recorded paper',venue:'Journal',year:2025,url:'https://example.org/paper'};
    const plan=projectBuildingFloors({station:'library',qfocus:{zh:'问题',en:'Question'},literature:[citation,citation]});
    expect(comparisonRecords(plan,'en')).toEqual([{id:'library:source:0:0',title:'Recorded paper',source:'Journal · 2025',url: citation.url,text:undefined}]);
  });
  it('preserves the actual edited digest and its source',()=>{
    const interior=INTERIORS['formal-math']!;
    const plan=projectBuildingFloors({station:'library',qfocus:{zh:'问题',en:'Question'},interior});
    const record=comparisonRecords(plan,'en')[0]!;
    expect(record.text).toBe(interior.digests[0]!.gist.en);
    expect(record.url).toBe(interior.digests[0]!.cite?.url);
    expect(buildingRooms(plan).flatMap(room=>room.items)).toHaveLength(plan.floors.flatMap(floor=>floor.items).length);
  });
  it('never truncates or replaces existing notes and prevents duplicate insertion',()=>{
    expect(appendResearchNote('Earlier thought','New test')).toEqual({text:'Earlier thought\n\nNew test',status:'added'});
    expect(appendResearchNote('Earlier thought\n\nNew test','New test').status).toBe('duplicate');
    const note='x'.repeat(1198);expect(appendResearchNote(note,'new')).toEqual({text:note,status:'full'});
  });
});

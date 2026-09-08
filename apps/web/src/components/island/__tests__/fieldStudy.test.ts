import { describe, expect, it } from 'vitest';
import { FIELD_STUDIES, fieldStudyFor } from '../field-study/studies';
import { benchmarkOverlap, candidateCount, composeReservoirs, defaultStudyState, divider, observeStudy, pattern, restoreStudyState, theoryValue, torusDistance, windowCounts } from '../field-study/models';
import { buildingRooms, projectBuildingFloors } from '../islandDepth';

describe('field-study mechanisms and evidence boundaries',()=>{
  it('preserves conservation through a unit adapter and exposes a mismatched interface',()=>{
    for(const q of [1,4,10]){
      expect(composeReservoirs(q,0).a+composeReservoirs(q,0).b).toBe(200);
      expect(composeReservoirs(q,2)).toEqual(composeReservoirs(q,0));
      expect(composeReservoirs(q,1).imbalance).toBe(59*q);
    }
  });
  it('distinguishes equilibration from parameter updates without overshooting the target',()=>{
    expect(divider(24,false).output).toBe(.5);
    const trained=divider(24,true);
    expect(trained.output).toBeGreaterThan(divider(8,true).output);
    expect(trained.output).toBeLessThan(.75);
    expect(trained.history.every((value,i,array)=>i===0||value>=array[i-1]!)).toBe(true);
  });
  it('demonstrates loss of extrapolation accuracy away from the observation range',()=>{
    const error=(x:number)=>Math.abs(theoryValue(x,true)-Math.sin(x));
    expect(error(.4)).toBeLessThan(.001);
    expect(error(3)).toBeGreaterThan(1);
  });
  it('matches parity enumeration for unknown flips and known erasures',()=>{
    for(const k of [1,2,3]){
      const words=Array.from({length:256},(_,n)=>n.toString(2).padStart(8,'0'));
      const received=(k%2?'1':'0')+'0'.repeat(7);
      const candidates=words.filter(word=>[...word].filter(bit=>bit==='1').length%2===0&&[...word].filter((bit,i)=>bit!==received[i]).length===k);
      expect(candidateCount(k,false)).toBeCloseTo(candidates.length);
      expect(candidateCount(k,true)).toBe(words.filter(word=>word.startsWith('0'.repeat(8-k))&&[...word].filter(bit=>bit==='1').length%2===0).length);
    }
  });
  it('counts periodic windows without a boundary discontinuity',()=>{
    expect(torusDistance({x:99,y:50},{x:1,y:50})).toBe(2);
    expect(pattern(true)).toHaveLength(196);
    expect(pattern(false)).toEqual(pattern(false));
    for(const jittered of [false,true]){
      const small=windowCounts(pattern(jittered),5),large=windowCounts(pattern(jittered),30);
      expect(small.counts).toHaveLength(100);
      expect(large.mean).toBeGreaterThan(small.mean);
      expect(large.counts.every((n,i)=>n>=small.counts[i]!)).toBe(true);
      expect(small.variance).toBeGreaterThanOrEqual(0);
    }
  });
  it('holds out the named scientific unit, not merely a cell identifier',()=>{
    const cells=benchmarkOverlap(0,0),perturbations=benchmarkOverlap(1,0),contexts=benchmarkOverlap(2,0);
    expect([cells.pairSeen,cells.perturbationSeen,cells.contextSeen]).toEqual([true,true,true]);
    expect([perturbations.pairSeen,perturbations.perturbationSeen,perturbations.contextSeen]).toEqual([false,false,true]);
    expect([contexts.pairSeen,contexts.perturbationSeen,contexts.contextSeen]).toEqual([false,true,false]);
    for(const split of [cells,perturbations,contexts])expect(split.train.some(a=>split.test.some(b=>a.id===b.id))).toBe(false);
  });
  it('validates persisted controls and bounds untrusted drafts',()=>{
    const study=fieldStudyFor('formal-math')!;
    expect(restoreStudyState(study,{choice:999,value:NaN,thought:'x'.repeat(900)})).toEqual({...defaultStudyState(study),thought:'x'.repeat(500)});
    expect(restoreStudyState(study,{choice:1,value:-40}).value).toBe(0);
    expect(restoreStudyState(study,null)).toEqual(defaultStudyState(study));
  });
  it('keeps authored studies addressable without removing any existing rooms',()=>{
    const original=projectBuildingFloors({station:'workshop',qfocus:{zh:'问题',en:'Question'}});
    const study=FIELD_STUDIES[0]!;
    const extended=projectBuildingFloors({station:'workshop',qfocus:study.question,fieldStudy:study});
    expect(extended.floors.slice(0,original.floors.length).map(f=>f.id)).toEqual(original.floors.map(f=>f.id));
    expect(buildingRooms(extended).at(-1)?.id).toBe('workshop:field-study');
    const library=projectBuildingFloors({station:'library',qfocus:study.question,fieldStudy:study});
    expect(buildingRooms(library).at(-1)?.id).toBe('library:field-study');
  });
  it('has ten distinct apparatuses, sources and resolvable onward destinations',()=>{
    expect(new Set(FIELD_STUDIES.map(s=>s.kind)).size).toBe(10);
    for(const study of FIELD_STUDIES){
      expect(fieldStudyFor(study.onward.slug)).toBeDefined();
      expect(study.sources.every(s=>/^https:\/\//.test(s.url)&&s.finding.zh&&s.finding.en&&s.boundary.zh&&s.boundary.en)).toBe(true);
      expect(observeStudy(study.kind,defaultStudyState(study)).metric.zh).not.toContain('NaN');
    }
  });
});

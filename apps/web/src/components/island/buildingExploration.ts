import type { StationKind } from '@frontier-isles/core';
import { buildingRooms, type BuildingFloorItem, type BuildingFloorPlan, type FrontierProgram } from './islandDepth';

type Bi={zh:string;en:string};
const bi=(zh:string,en:string):Bi=>({zh,en});
export const BUILDING_EXPLORATION: Record<StationKind,{form:string; invitation:Bi; action:Bi}>={
  questions:{form:'court',invitation:bi('从一张问题笺，走向更具体的不确定性。','Follow one question toward a more precise uncertainty.'),action:bi('挑选与改写问题','Choose and reframe a question')},
  library:{form:'stacks',invitation:bi('在书架间往返，比较论据的来源与适用范围。','Move between sources and compare the scope of their arguments.'),action:bi('并置两份材料','Read two records side by side')},
  canvas:{form:'forum',invitation:bi('把不同解释放到同一张桌上，找出可以区分它们的观察。','Put explanations on the same table and ask which observation could distinguish them.'),action:bi('写下区分解释的观察','Propose a distinguishing observation')},
  workshop:{form:'bench',invitation:bi('从方法进入条件与边界，再设计一个尽可能小的检验。','Move from a method to its conditions, then design the smallest useful test.'),action:bi('设计一次最小检验','Design a minimal test')},
  data:{form:'stacks',invitation:bi('先辨认记录的性质，再追问测量的条件。','Identify the kind of record before asking how it was measured.'),action:bi('核对测量条件','Examine measurement conditions')},
  driftwood:{form:'court',invitation:bi('保留障碍，看看哪一个假设值得重新打开。','Stay with the obstacle and consider which assumption to reopen.'),action:bi('重新打开一个假设','Reopen an assumption')},
  gallery:{form:'stacks',invitation:bi('已有结果和期待中的影响，分开阅读。','Read recorded results separately from their hoped-for impact.'),action:bi('辨认结论的边界','Examine the boundary of a conclusion')},
  tearoom:{form:'forum',invitation:bi('换一个视角，听见自己还没有提出的问题。','Try another perspective and find a question you have not yet asked.'),action:bi('换一个观察角度','Try another perspective')},
  dock:{form:'bench',invitation:bi('带着尚未解决的问题，回到海图选择另一处。','Carry an unresolved question back to the atlas.'),action:bi('带着问题远行','Carry the question onward')},
};
export function roomExcerpt(items:readonly BuildingFloorItem[],lang:'zh'|'en'):string {
  const item=items[0]; if(!item)return '';
  switch(item.kind){
    case 'brief':return item.text[lang];case 'question':return item.question.text[lang];
    case 'reference':return item.citation.title;case 'digest':return item.digest.title[lang];
    case 'debate':return item.debate.topic[lang];case 'datum':return `${item.datum.label[lang]} · ${item.datum.value[lang]}`;
    case 'scrap':return item.scrap.text[lang];case 'gallery':return item.gallery.title[lang];
    case 'resident':return item.resident.caption[lang];case 'structure':return item.structure.statement[lang];
  }
}
export interface ComparisonRecord {id:string;title:string;text?:string;url?:string;source:string}
export function comparisonRecords(plan:BuildingFloorPlan,lang:'zh'|'en'):ComparisonRecord[] {
  const seen=new Set<string>();
  return buildingRooms(plan).flatMap(room=>room.items.flatMap((item,index):ComparisonRecord[]=>{
    if(item.kind!=='digest'&&item.kind!=='reference')return [];
    const cite=item.kind==='reference'?item.citation:item.digest.cite;
    const title=item.kind==='reference'?item.citation.title:item.digest.title[lang];
    const key=cite?.url??title;if(seen.has(key))return [];seen.add(key);
    return [{id:`${room.id}:${index}`,title,text:item.kind==='digest'?item.digest.gist[lang]:undefined,url:cite?.url,
      source:cite?`${cite.venue} · ${cite.year}`:(lang==='zh'?'本岛编辑材料':'Edited island material')}];
  }));
}
export const EXPLORATION_ROUTES: Record<FrontierProgram,{title:Bi;stops:StationKind[]}>={
  unknowns:{title:bi('沿异常追问','Follow an anomaly'),stops:['questions','driftwood','library','workshop']},
  sensing:{title:bi('回到观测条件','Trace an observation'),stops:['data','library','canvas','workshop']},
  commons:{title:bi('在论证之间往返','Move between arguments'),stops:['library','tearoom','canvas','questions']},
  transfer:{title:bi('追问方法如何迁移','Explore method transfer'),stops:['questions','canvas','workshop','driftwood']},
  simulation:{title:bi('从规则走到检验','From rules to tests'),stops:['workshop','data','library','questions']},
  living:{title:bi('沿可行性的边界走','Explore the limits of feasibility'),stops:['questions','workshop','driftwood','data']},
};
export function appendResearchNote(note:string,addition:string):{text:string;status:'added'|'duplicate'|'full'} {
  if(note.includes(addition))return {text:note,status:'duplicate'};
  const text=[note.trim(),addition.trim()].filter(Boolean).join('\n\n');
  return text.length>1200?{text:note,status:'full'}:{text,status:'added'};
}

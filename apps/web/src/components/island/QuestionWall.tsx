import { useState } from 'react';
import type { StationKind } from '@frontier-isles/core';
import type { BuildingFloorPlan, BuildingFloorItem } from './islandDepth';

type Sheet = { id:string; text:string; label:string; author?:string; previous?:string; source:string };
export function questionSheets(plan:BuildingFloorPlan, lang:'zh'|'en'): Sheet[] {
  const seen = new Set<string>();
  return plan.floors.flatMap(floor => floor.items.flatMap((item:BuildingFloorItem,index):Sheet[] => {
    if(item.kind!=='brief'&&item.kind!=='question')return [];
    const text = item.kind==='question'?item.question.text[lang]:item.text[lang];
    if(seen.has(text))return []; seen.add(text);
    const question=item.kind==='question'?item.question:undefined;
    return [{id:`${floor.id}:${index}`,text,
      label:floor.id.endsWith(':ground')?(lang==='zh'?'本岛主问题':'Island question'):question?(question.open?(lang==='zh'?'开放追问':'Open question'):(lang==='zh'?'已暂结的问题':'Provisionally closed question')):(lang==='zh'?'相关开放问题':'Related open question'),
      author:question?.author[lang],previous:question?.rewrittenFrom?.[lang],
      source:floor.source==='interior'?(lang==='zh'?'来自本岛编辑材料':'From the edited island material'):(lang==='zh'?'来自本岛问题档案':'From the island question archive')}];
  }));
}
export function QuestionWall({plan,lang,personalNote,onPersonalNote,onStation,availableStations,activeSheet,onActiveSheet}: {
  plan:BuildingFloorPlan;lang:'zh'|'en';personalNote:string;onPersonalNote?: (text:string)=>void;
  onStation?: (station:StationKind, question?:string)=>void;availableStations:readonly StationKind[];
  activeSheet?:string|null;onActiveSheet?:(id:string|null)=>void;
}) {
  const sheets=questionSheets(plan,lang), zh=lang==='zh';
  const [localActive,setLocalActive]=useState<string|null>(null);
  const active=activeSheet===undefined?localActive:activeSheet;
  const setActive=(id:string|null)=>{setLocalActive(id);onActiveSheet?.(id);};
  const [notice,setNotice]=useState('');
  const take=(sheet:Sheet)=>{
    if(personalNote.includes(sheet.text)){setNotice(zh?'这条问题已在你的札记中。':'This question is already in your notebook.');return;}
    const next=[personalNote.trim(),sheet.text].filter(Boolean).join('\n\n');
    if(next.length>1200){setNotice(zh?'札记空间不足，请先整理已有想法；原内容已保留。':'There is not enough room. Edit your note first; existing thoughts are preserved.');return;}
    onPersonalNote?.(next);setNotice(zh?'已带入本岛札记，可以接着改写你的追问。':'Added to this island’s notebook. You can now reshape the question.');
  };
  return <div className="fi-question-wall" data-testid="question-wall">
    <p className="fi-question-wall-invitation">{zh?'展开一张问题笺，从你最在意的不确定处开始。':'Unfold a question and begin with the uncertainty that matters to you.'}</p>
    <div className="fi-question-sheets">
      {sheets.map((sheet,index)=>{
        const expanded=active===sheet.id;
        return <article key={sheet.id} className="fi-question-sheet" data-main={index===0} data-expanded={expanded}>
          <button type="button" className="fi-question-sheet-open" aria-expanded={expanded} aria-controls={`question-sheet-${index}`} onClick={event=>{const article=event.currentTarget.closest('article');setActive(expanded?null:sheet.id);setNotice('');if(!expanded)requestAnimationFrame(()=>article?.scrollIntoView({block:'start',behavior:'instant'}));}}>
            <span className="fi-question-sheet-text">{sheet.text}</span>
            <span className="fi-question-sheet-meta">{sheet.label}<svg viewBox="0 0 20 20" aria-hidden="true"><path d={expanded?'M4 10h12':'M4 10h12M10 4v12'}/></svg></span>
          </button>
          {expanded&&<div className="fi-question-sheet-detail" id={`question-sheet-${index}`}>
            {sheet.previous&&<p className="fi-question-previous">{zh?'改写之前：':'Before the rewrite: '}<del>{sheet.previous}</del></p>}
            <p>{sheet.source}{sheet.author?` · ${sheet.author}`:''}</p>
            {index>0&&<p>{zh?'这条问题与主问题并列阅读；是否存在共同机制，需要继续核对。':'Read this alongside the main question; a shared mechanism still needs to be checked.'}</p>}
            <div className="fi-question-sheet-actions">
              {onPersonalNote&&<button type="button" onClick={()=>take(sheet)}>{personalNote.includes(sheet.text)?(zh?'已在札记中':'In your notebook'):(zh?'带入我的札记':'Take into my notebook')}</button>}
              {onStation&&availableStations.includes('library')&&<button type="button" onClick={()=>onStation('library',sheet.text)}>{zh?'带着此问查看本岛文献':'Explore island references with this question'}<span aria-hidden="true"> →</span></button>}
            </div>
          </div>}
        </article>;
      })}
    </div>
    <p role="status" className="fi-question-wall-status">{notice}</p>
    {sheets.length===1&&<p className="fi-question-wall-invitation">{zh?'本岛目前只收录了主问题。你可以在札记里提出自己的改写。':'Only the main question is recorded here so far. Try your own reframing in the notebook.'}</p>}
  </div>;
}

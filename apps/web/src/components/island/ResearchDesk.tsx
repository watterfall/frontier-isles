import { useState } from 'react';
import type { BuildingFloorPlan } from './islandDepth';
import { appendResearchNote, BUILDING_EXPLORATION, comparisonRecords } from './buildingExploration';

export interface ResearchDeskDraft { open:boolean; picks:string[]; prediction:string; challenge:string; test:string }
export const emptyDeskDraft=():ResearchDeskDraft=>({open:false,picks:[],prediction:'',challenge:'',test:''});

/** A private thinking tool alongside source material. Nothing here creates a
 * research claim, runs a model, or pretends to have read an external paper. */
export function ResearchDesk({plan,lang,question,note,onNote,draft,onDraft}: {
  plan:BuildingFloorPlan;lang:'zh'|'en';question?:string;note:string;onNote:(text:string)=>void;
  draft:ResearchDeskDraft;onDraft:(draft:ResearchDeskDraft)=>void;
}) {
  const [notice,setNotice]=useState('');
  const zh=lang==='zh', station=plan.station;
  if(!['library','canvas','workshop','driftwood'].includes(station))return null;
  const records=comparisonRecords(plan,lang);
  const picked=records.filter(record=>draft.picks.includes(record.id));
  const field=(key:'prediction'|'challenge'|'test',label:string,placeholder:string)=><label className="fi-desk-field"><span>{label}</span><textarea rows={2} maxLength={500} value={draft[key]} placeholder={placeholder} onChange={e=>{onDraft({...draft,[key]:e.target.value});setNotice('');}}/></label>;
  const save=()=>{
    const lines=station==='library'
      ? [zh?'文献对照札记':'Source comparison note',...picked.map(r=>`${r.title}${r.url?`\n${r.url}`:''}`),draft.prediction]
      : [BUILDING_EXPLORATION[station].action[lang],question??'',`${zh?'我的判断':'My expectation'}：${draft.prediction}`,`${zh?'会改变判断的观察':'An observation that would change my mind'}：${draft.challenge}`,`${zh?'下一次检验':'Next test'}：${draft.test}`];
    const result=appendResearchNote(note,lines.filter(Boolean).join('\n'));
    if(result.status==='added')onNote(result.text);
    setNotice(result.status==='full'?(zh?'札记空间不足，草稿和原札记都已保留。请先整理札记。':'The notebook is full. Your draft and existing note are preserved. Edit the note first.'):result.status==='duplicate'?(zh?'这份思考已经在札记中。':'This reflection is already in the notebook.'):(zh?'已追加到本岛札记。可以带着它继续核对。':'Appended to this island’s notebook. Carry it into your next check.'));
  };
  return <details className="fi-research-desk" data-desk={station} open={draft.open} onToggle={event=>{if(event.currentTarget.open!==draft.open)onDraft({...draft,open:event.currentTarget.open});}}>
    <summary>{BUILDING_EXPLORATION[station].action[lang]}</summary>
    {station==='library'?<>
      <p>{zh?'选两份本岛材料，比较它们能支持什么。未收录摘要的来源，需要打开原文核对。':'Choose two island records and compare what they support. Open the original when no digest is recorded.'}</p>
      {records.length<2?<p>{zh?'目前不足两份可对照材料，仍可查阅已有来源。':'Fewer than two records are available. You can still read the existing source.'}</p>:<>
        <div className="fi-source-picks" role="group" aria-label={zh?'选择两份对照材料':'Select two records'}>{records.map(record=><button type="button" key={record.id} aria-pressed={draft.picks.includes(record.id)} disabled={draft.picks.length===2&&!draft.picks.includes(record.id)} onClick={()=>onDraft({...draft,picks:draft.picks.includes(record.id)?draft.picks.filter(id=>id!==record.id):[...draft.picks,record.id]})}><span>{record.title}</span><small>{record.source}</small></button>)}</div>
        <div className="fi-source-comparison" aria-live="polite">{picked.map(record=><article key={record.id}><h4>{record.title}</h4><p>{record.text??(zh?'本岛仅收录文献信息，未收录摘要。':'Only reference metadata is recorded; no digest is available.')}</p><small>{record.source}</small>{record.url&&<a href={record.url} target="_blank" rel="noopener noreferrer">{zh?'打开原文核对':'Check the original'}</a>}</article>)}</div>
        {field('prediction',zh?'两份材料之间，我看到了什么？':'What do I see between these records?',zh?'它们支持的对象、条件或结论有何不同？':'How do their objects, conditions or conclusions differ?')}
      </>}
    </>:<>
      <p>{station==='workshop'?(zh?'先写下预期与推翻条件，再决定要做的最小检验。这里保存的是你的检验草稿。':'Write an expectation and a condition that would overturn it, then choose a minimal test. This is your test draft.'):station==='canvas'?(zh?'从上面的不同解释出发，写出能区分它们的一次观察。':'Use the explanations above to propose an observation that could distinguish them.'):(zh?'保留原来的障碍，改变一个假设，写下重新尝试的条件。':'Keep the original obstacle, change one assumption, and describe when to try again.')}</p>
      {field('prediction',zh?'我目前预期什么？':'What do I currently expect?',zh?'写一个可以被观察推翻的具体判断。':'Write a specific expectation that observation could overturn.')}
      {field('challenge',zh?'什么结果会让我改变判断？':'What would change my mind?',zh?'也可能出现哪种解释不同的结果？':'What alternative result would point to another explanation?')}
      {field('test',zh?'下一次最小检验是什么？':'What is the smallest next test?',zh?'改变什么，观察什么，在哪里查证？':'What will change, what will you observe, and where will you check?')}
    </>}
    <div className="fi-desk-save"><button type="button" onClick={save} disabled={station==='library'?picked.length!==2||!draft.prediction.trim():![draft.prediction,draft.challenge,draft.test].every(text=>text.trim())}>{zh?'把这份思考带入札记':'Take this reflection into my notebook'}</button><small>{zh?'草稿在当前岛屿内暂存；带入札记后保存在浏览器，不会发布为研究结论。':'Drafts stay while you are on this island. Taking one into the notebook saves it in this browser, without publishing a finding.'}</small></div>
    <p role="status">{notice}</p>
  </details>;
}

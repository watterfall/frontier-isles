import { useEffect, useState } from 'react';
import { appendResearchNote } from '../buildingExploration';
import { FIELD_STUDIES, type FieldStudy as Study } from './studies';
import { defaultStudyState, observeStudy, restoreStudyState, type StudyState } from './models';
import { FieldStudyFigure } from './FieldStudyFigure';
import './field-study.css';

export function FieldStudy({study,lang,note,onNote,onSources,onVoyage}:{study:Study;lang:'zh'|'en';note:string;onNote?:(text:string)=>void;onSources:(question:string)=>void;onVoyage?:(slug:string)=>void}) {
  const zh=lang==='zh',key=`frontier-isles:study:v1:${study.slug}`;
  const [state,setState]=useState<StudyState>(()=>{try{return restoreStudyState(study,JSON.parse(localStorage.getItem(key)??'null'));}catch{return defaultStudyState(study);}});
  const [storageFailed,setStorageFailed]=useState(false),[notice,setNotice]=useState('');
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(state));setStorageFailed(false);}catch{setStorageFailed(true);}},[key,state]);
  const observation=observeStudy(study.kind,state),onward=FIELD_STUDIES.find(item=>item.slug===study.onward.slug);
  const currentSetting=`${study.choiceLabel[lang]}: ${study.choices[state.choice]![lang]} · ${study.valueLabel[lang]}: ${study.valueOptions?.[state.value]?.[lang]??Number(state.value.toFixed(2))}`;
  const question=state.thought.trim()||study.nextQuestion[lang];
  const update=(next:Partial<StudyState>)=>{setState(previous=>({...previous,...next}));setNotice('');};
  const save=()=>{
    const text=[study.title[lang],zh?'本地教学考察；不是研究结论。':'Local teaching study; not a research finding.',currentSetting,observation.metric[lang],question,...study.sources.map(source=>source.url)].join('\n');
    const result=appendResearchNote(note,text);
    if(result.status==='added')onNote?.(result.text);
    setNotice(result.status==='full'?(zh?'札记已满，原文和这份草稿都已保留。请先整理本岛札记。':'Notebook full. Your existing note and this draft remain intact. Edit the island note first.'):result.status==='duplicate'?(zh?'这份考察已在札记中。':'This study is already in your notebook.'):(zh?'已把条件、观察、追问和来源加入本岛札记。':'Added settings, observation, question and sources to this island’s notebook.'));
  };
  return <article className="fi-field-study" data-study={study.kind}>
    <header className="fi-study-heading"><h3>{study.title[lang]}</h3><p>{study.question[lang]}</p></header>
    <figure className="fi-study-apparatus" tabIndex={0} aria-label={zh?"考察图示，可用方向键横向查看":"Study diagram; use arrow keys to scroll horizontally"}>
      <FieldStudyFigure kind={study.kind} state={state} lang={lang}/>
      <figcaption>{study.kind==='calls'?(zh?'符号化研究条件 · 行为层来自文献定性观察':'Symbolic research conditions · behavior layer from qualitative source observations'):(zh?'可操作的教学算例 · 图中数值由当前规则计算':'Interactive teaching example · values calculated from the stated rule')}<span className="fi-study-pan-hint">{zh?"图面可横向查看":"Scroll the diagram horizontally"}</span></figcaption>
    </figure>
    <div className="fi-study-controls">
      <fieldset><legend>{study.choiceLabel[lang]}</legend><div className="fi-study-choices">{study.choices.map((choice,i)=><button type="button" key={i} aria-pressed={state.choice===i} onClick={()=>update({choice:i})}>{choice[lang]}</button>)}</div></fieldset>
      {study.valueOptions?<fieldset><legend>{study.valueLabel[lang]}</legend><div className="fi-study-choices">{study.valueOptions.map((option,i)=><button type="button" key={i} aria-pressed={state.value===i} onClick={()=>update({value:i})}>{option[lang]}</button>)}</div></fieldset>:<label className="fi-study-range"><span>{study.valueLabel[lang]}<output>{Number(state.value.toFixed(2))}</output></span><input type="range" min={study.min} max={study.max} step={study.step} value={state.value} onChange={event=>update({value:Number(event.target.value)})}/><small><span>{study.min}</span><span>{study.max}</span></small></label>}
    </div>
    <section className="fi-study-observation" aria-live="polite" aria-atomic="true">
      <h4>{observation.title[lang]}</h4><p className="fi-study-reading">{observation.metric[lang]}</p><p>{observation.detail[lang]}</p>
    </section>
    <details className="fi-study-rule"><summary>{zh?'这个图怎样得到？':'How is this diagram produced?'}</summary><p>{study.rule[lang]}</p></details>
    <p className="fi-study-boundary">{study.boundary[lang]}</p>
    <section className="fi-study-sources"><h4>{zh?'与前沿研究接上':'Connect this to frontier research'}</h4>{study.sources.map(source=><article key={source.url}>
      <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<span> · {source.year} ↗</span></a>
      <p>{source.finding[lang]}</p><p className="fi-study-source-boundary">{source.boundary[lang]}</p>
    </article>)}<button type="button" onClick={()=>onSources(`${study.title[lang]}\n${currentSetting}\n${question}`)}>{zh?'带着这次观察进入文献阁':'Take this observation to the library'}</button></section>
    <section className="fi-study-question"><h4>{zh?'这里还没有答案':'What remains open'}</h4><p>{study.nextQuestion[lang]}</p>
      <label><span>{zh?'我想继续追问':'My next question'}</span><textarea rows={3} maxLength={500} value={state.thought} onChange={event=>update({thought:event.target.value})} placeholder={zh?'哪个假设值得再改一次？什么观察会改变你的判断？':'Which assumption would you change next? What observation would change your mind?'}/></label>
      {onNote&&<button type="button" onClick={save}>{zh?'把这次考察加入札记':'Add this study to my notebook'}</button>}
      <p role="status">{notice}</p><small role={storageFailed?'status':undefined}>{storageFailed?(zh?'浏览器存储不可用，操作与草稿仅在当前考察中保留。':'Browser storage is unavailable. Settings and draft remain only in this open study.'):(zh?'操作与草稿保存在此浏览器。加入札记后可在考察舟回看与导出。':'Settings and draft stay in this browser. Notebook entries can be revisited and exported from the exploration boat.')}</small>
    </section>
    {onVoyage&&onward&&<footer className="fi-study-onward"><h4>{zh?'换一座岛，继续这个疑问':'Carry the question to another island'}</h4><p>{study.onward.reason[lang]}</p><button type="button" onClick={()=>onVoyage(onward.slug)}>{onward.island[lang]}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h14m-5-5 5 5-5 5"/></svg></button><small>{zh?'编辑探索线索：':'Editorial exploration cue: '}{study.onward.boundary[lang]}</small></footer>}
  </article>;
}

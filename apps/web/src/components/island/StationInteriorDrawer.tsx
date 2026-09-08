import { lazy, Suspense } from 'react';
import type { FieldStudy as Study } from './field-study/studies';
const FieldStudy = lazy(()=>import('./field-study/FieldStudy').then(module=>({default:module.FieldStudy})));
import { QuestionWall } from './QuestionWall';
import type { IslandCharacter } from '../../scene/islandCharacter';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import { buildingRooms, type BuildingFloor, type BuildingFloorItem, type BuildingFloorPlan } from './islandDepth';
import { useDialogChrome } from '../panelChrome';
import { STATION_PLACES } from '../../scene/stationSpatial';
import { StationPortrait } from '../../scene/StationArchitecture';
import { ResearchDesk, emptyDeskDraft, type ResearchDeskDraft } from './ResearchDesk';
import type { ResearchAddress } from './explorationNavigation';
import { BuildingPlan } from './BuildingPlan';

export interface StationInteriorDrawerProps {
  character?:IslandCharacter;
  fieldStudy?:Study;
  onStudySources?:(question:string)=>void;
  onVoyageToIsland?:(slug:string)=>void;
  station: StationKind | null;
  plan: BuildingFloorPlan | undefined;
  lang: 'zh' | 'en';
  islandTitle?: string;
  question?: string;
  followingQuestion?: boolean;
  personalNote?: string;
  onPersonalNote?: (text:string) => void;
  availableStations?: readonly StationKind[];
  onStation?: (station:StationKind, question?:string) => void;
  onOpenModel?: () => void;
  onBackToAtlas?: () => void;
  visitedFloorIds?: readonly string[];
  initialFloorId?: string;
  onSelectRoom?: (room:string)=>void;
  onBackReading?:()=>void;
  previousAddress?:ResearchAddress;
  readingPositions?:Map<string,number>;
  onVisitFloor?: (floorId: string) => void;
  onActiveFloor?: (floor: BuildingFloor | null) => void;
  onClose: () => void;
}
const CONTINUE: Record<StationKind, StationKind[]> = {
  questions:['canvas','library'], library:['data','canvas'], canvas:['library','workshop'],
  data:['library','workshop'], workshop:['data','driftwood'], driftwood:['questions','workshop'],
  gallery:['questions','dock'], tearoom:['canvas','questions'], dock:['questions','library'],
};

export function StationInteriorDrawer({ fieldStudy, onStudySources, onVoyageToIsland, character, station, plan, lang, islandTitle, question, followingQuestion=false, personalNote='', onPersonalNote,
  availableStations=[], onStation, onOpenModel, onBackToAtlas, initialFloorId, onVisitFloor, onActiveFloor, onClose,
  onSelectRoom,onBackReading,previousAddress,readingPositions,
}: StationInteriorDrawerProps) {
  const open=!!station && !!plan;
  const { dialogRef,closeRef,onDialogKey }=useDialogChrome<HTMLDivElement>(onClose,open);
  const rooms=useMemo(()=>buildingRooms(plan),[plan]);
  const [noteOpen,setNoteOpen]=useState(false);
  const [roomId,setRoomId]=useState<string|null>(null);
  const [drafts,setDrafts]=useState<Partial<Record<StationKind,ResearchDeskDraft>>>({});
  const [activeSheet,setActiveSheet]=useState<string|null>(null);
  const [compact,setCompact]=useState(false);
  useEffect(()=>{
    if(typeof window.matchMedia!=='function')return;
    const query=window.matchMedia('(max-width:760px)');
    const update=()=>setCompact(query.matches);update();
    query.addEventListener('change',update);return ()=>query.removeEventListener('change',update);
  },[]);
  const readingRef=useRef<HTMLElement|null>(null);
  const roomRefs=useRef<Array<HTMLButtonElement|null>>([]);
  const preferred=rooms.find(room=>room.floorIds.includes(initialFloorId??''))??rooms[0]??null;
  const selected=onSelectRoom?preferred:rooms.find(room=>room.id===roomId)??preferred;
  useEffect(()=>{
    if(!open||!preferred)return;
    setRoomId(preferred.id);onVisitFloor?.(preferred.id);
  },[open,plan?.station,initialFloorId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{onActiveFloor?.(open?selected:null);},[onActiveFloor,open,selected?.id,selected?.title.zh,selected?.title.en]);
  useEffect(()=>{if(readingRef.current)readingRef.current.scrollTop=readingPositions?.get(selected?.id??'')??0;},[selected?.id,open,readingPositions]);
  const choose=(index:number)=>{const room=rooms[index];if(room){if(onSelectRoom)onSelectRoom(room.id);else setRoomId(room.id);onVisitFloor?.(room.id);}};
  const onRoomKey=(event:ReactKeyboardEvent<HTMLButtonElement>,index:number)=>{
    const next=event.key==='ArrowDown'||event.key==='ArrowRight'?Math.min(rooms.length-1,index+1):event.key==='ArrowUp'||event.key==='ArrowLeft'?Math.max(0,index-1):event.key==='Home'?0:event.key==='End'?rooms.length-1:null;
    if(next===null)return;event.preventDefault();choose(next);roomRefs.current[next]?.focus();
  };
  if(!open||!station)return null;
  const place=STATION_PLACES[station], zh=lang==='zh';
  const isFieldStudy=selected?.id==='workshop:field-study'&&fieldStudy&&onStudySources;
  const nextPlaces=CONTINUE[station].filter(kind=>availableStations.includes(kind));
  return <>
    <button type="button" className="fi-interior-scrim" data-open="true" aria-label={zh?'回到岛屿':'Back to the island'} tabIndex={-1} onClick={onClose}/>
    <div ref={dialogRef} className="fi-interior-tower fi-building-interior" data-open="true" data-screen-label="L2 站点内景抽屉" data-station={station} data-field-study={!!isFieldStudy}
      role="dialog" aria-modal="true" aria-labelledby="fi-interior-title" onKeyDown={onDialogKey}>
      <header className="fi-building-header">
        <button ref={closeRef} type="button" onClick={onClose} className="fi-building-back"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 10H4m5-5-5 5 5 5"/></svg>{zh?'回到岛上':'Back to the island'}</button>
        {onBackReading&&previousAddress?<button type="button" className="fi-reading-previous" onClick={()=>{onBackReading();requestAnimationFrame(()=>dialogRef.current?.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')?.focus({preventScroll:true}));}}>{zh?'返回上一处':'Previous place'}<span>{STATION_PLACES[previousAddress.station].title[lang]}</span></button>:<span>{islandTitle}</span>}
      </header>
      <div className="fi-building-identity"><StationPortrait station={station} character={character}/><div><h2 id="fi-interior-title">{place.title[lang]}</h2><p>{place.purpose[lang]}</p></div></div>
      <div className="fi-reading-location" aria-label={zh?'当前阅读位置':'Current reading location'}><span>{islandTitle}</span><span aria-hidden="true">/</span><span>{place.title[lang]}</span><span aria-hidden="true">/</span><strong>{selected?.title[lang]}</strong></div>
      {question && station!=='questions' && !isFieldStudy && <details className="fi-building-question" open={followingQuestion&&!compact}><summary>{followingQuestion?(zh?'带来的具体追问':'The question I am following'):(zh?'我从这个问题而来':'The question I came with')}{followingQuestion&&compact&&<span className="fi-carried-preview">{question}</span>}</summary><p>{question}</p>{followingQuestion&&station==='library'&&<small className="fi-question-source-scope">{selected?.id==='library:field-study'?(zh?'这里是这次考察直接引用的来源。教学算例的结果与文献证据仍需分别判断。':'These sources are cited directly by this study. Teaching results and research evidence still need separate interpretation.'):(zh?'这里展示本岛收录的文献，尚未逐条建立与这条追问的对应。':'These are island-level references; a specific link to this question has not been established.')}</small>}</details>}
      <div className="fi-building-layout">
        <nav className="fi-building-rooms" role="tablist" aria-label={zh?'选择研究内容':'Choose material'} >
          {rooms.map((room,index)=><button key={room.id} ref={el=>{roomRefs.current[index]=el;}} type="button" role="tab"
            id={`room-tab-${index}`} aria-controls={`room-panel-${index}`} aria-selected={selected?.id===room.id} tabIndex={selected?.id===room.id?0:-1}
            onClick={()=>choose(index)} onKeyDown={event=>onRoomKey(event,index)}><span>{room.title[lang]}</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 5 5 5-5 5"/></svg></button>)}
        </nav>
        <section ref={readingRef} className="fi-building-reading" onScroll={e=>{if(selected)readingPositions?.set(selected.id,e.currentTarget.scrollTop);}} role={selected ? "tabpanel" : undefined} id={selected ? `room-panel-${rooms.indexOf(selected)}` : undefined} aria-labelledby={selected ? `room-tab-${rooms.indexOf(selected)}` : undefined} tabIndex={0}>
          {selected ? <>
            {plan&&!isFieldStudy&&<details className="fi-reader-plan"><summary>{zh?'展开建筑研究结构':'Explore this building’s research spaces'}</summary><BuildingPlan plan={plan} lang={lang} selected={selected.id} onRoom={id=>choose(rooms.findIndex(room=>room.id===id))}/></details>}
            {isFieldStudy ? <Suspense fallback={<p role="status">{zh?'正在展开考察图……':'Opening the study…'}</p>}><FieldStudy key={fieldStudy.slug} study={fieldStudy} lang={lang} note={personalNote} onNote={onPersonalNote} onSources={onStudySources} onVoyage={onVoyageToIsland}/></Suspense> : <>
            <header><h3>{selected.title[lang]}</h3><p>{selected.source==='interior'?(zh?'岛屿的编辑材料；其中的角色与讨论不代表此刻在线活动。':'Edited island material; named roles and discussions do not imply live activity.'):selected.source==='structure'?(zh?'已记录的结构说明；迁移到本问题仍需核对边界。':'A recorded structure; transfer to this problem still needs checking.'):(zh?'本岛收录的背景与来源。记录的存在不等于结论已被验证。':'Background and sources recorded for this island. A record is not a validated conclusion.')}</p></header>
            <div className="fi-floor-items">{station==='questions'&&selected.id.endsWith(':ground')&&plan?<QuestionWall key={islandTitle} plan={plan} lang={lang} personalNote={personalNote} onPersonalNote={onPersonalNote?text=>{onPersonalNote(text);setNoteOpen(true);}:undefined} onStation={onStation} availableStations={availableStations} activeSheet={activeSheet} onActiveSheet={setActiveSheet}/>:selected.items.map((item,index)=><FloorItem key={`${selected.id}:${index}`} item={item} lang={lang}/>)}</div>
            {plan&&onPersonalNote&&<ResearchDesk key={station} plan={plan} lang={lang} question={question} note={personalNote} onNote={text=>{onPersonalNote(text);setNoteOpen(true);}} draft={drafts[station]??emptyDeskDraft()} onDraft={draft=>setDrafts(previous=>({...previous,[station]:draft}))}/ >}
            {station==='workshop'&&onOpenModel&&<div className="fi-building-model"><h4>{zh?'让一个简化规则运行起来':'Run a simplified rule'}</h4><p>{zh?'可操作同步或扩散模型，观察参数怎样改变行为。模型本身不能验证这个岛屿的研究结论。':'Try synchronization or diffusion and observe the effect of parameters. The model does not validate this island’s research claims.'}</p><button type="button" data-model-launch="island-workshop" onClick={onOpenModel}>{zh?'打开模型工作台':'Open the model workbench'}</button></div>}
            </>}
            {onPersonalNote&&<details className="fi-building-note" open={noteOpen} onToggle={event=>setNoteOpen(event.currentTarget.open)}><summary>{personalNote?(zh?'回看我的追问':'My question'):(zh?'有什么值得带走的追问？':'What question will you take with you?')}</summary><label><span>{zh?'我的想法':'My thoughts'}</span><textarea value={personalNote} maxLength={1200} rows={4} onChange={e=>onPersonalNote(e.target.value)} placeholder={zh?'一个疑问、一处矛盾，或下次想核对的东西……':'A question, a contradiction, or something to check next…'}/></label><small>{zh?'保存在当前浏览器的岛屿札记，可在考察舟中回看与导出。':'Saved in this browser’s island notebook; revisit and export it from the exploration boat.'}</small></details>}
            {!isFieldStudy&&(nextPlaces.length>0||station==='dock')&&<footer className="fi-building-onward"><h4>{zh?'带着这个问题继续':'Continue with this question'}</h4>{onStation&&nextPlaces.map(kind=><button key={kind} type="button" onClick={()=>onStation(kind)}><strong>{STATION_PLACES[kind].title[lang]}</strong><span>{STATION_PLACES[kind].purpose[lang]}</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5"/></svg></button>)}{station==='dock'&&onBackToAtlas&&<button type="button" onClick={onBackToAtlas}><strong>{zh?'回到大地图':'Return to the atlas'}</strong><span>{zh?'保留这次思考，选择另一处去向':'Keep this thought and choose another destination'}</span></button>}</footer>}
          </>:<p>{zh?'这里还没有收录材料。':'No material is recorded here yet.'}</p>}
        </section>
      </div>
    </div>
  </>;
}

function Citation({ cite }: { cite: { title: string; venue: string; year: number; url?: string } }) {
  const text = `${cite.title} · ${cite.venue} ${cite.year}`;
  return cite.url ? <a href={cite.url} target="_blank" rel="noopener noreferrer">{text} ↗</a> : <span>{text}</span>;
}

function FloorItem({ item, lang }: { item: BuildingFloorItem; lang: 'zh' | 'en' }) {
  const { t } = useTranslation();
  switch (item.kind) {
    case 'reference':
      return <article className="fi-floor-card fi-source-record"><span>{lang==='zh'?'原始来源':'Original source'}</span><h4>{item.citation.title}</h4><p>{item.citation.venue} · {item.citation.year}</p>{item.citation.url && <a href={item.citation.url} target="_blank" rel="noopener noreferrer">{lang==='zh'?'查阅来源':'Read source'} ↗</a>}</article>;
    case 'brief':
      return <article className="fi-floor-card fi-floor-brief"><small>{item.label[lang]}</small><p>{item.text[lang]}</p></article>;
    case 'question': {
      const question = item.question;
      return (
        <article className="fi-floor-card fi-floor-question">
          {question.rewrittenFrom && <del>{question.rewrittenFrom[lang]}</del>}
          <p>{question.text[lang]}</p>
          <footer><span>{question.author[lang]}</span><b data-open={question.open || undefined}>{question.open ? t('island.interior.questions.open') : t('island.interior.questions.closed')}</b></footer>
        </article>
      );
    }
    case 'digest':
      return <article className="fi-floor-card"><h4>{item.digest.title[lang]}</h4><p>{item.digest.gist[lang]}</p>{item.digest.cite && <small><Citation cite={item.digest.cite} /></small>}</article>;
    case 'debate':
      return <article className="fi-floor-card"><h4>{item.debate.topic[lang]}</h4><ol className="fi-floor-positions">{item.debate.positions.map((position, index) => <li key={index}><b>{String.fromCharCode(65 + index)}</b>{position[lang]}</li>)}</ol></article>;
    case 'datum':
      return <article className="fi-floor-card fi-floor-datum"><div><h4>{item.datum.label[lang]}</h4>{item.datum.note && <p>{item.datum.note[lang]}</p>}</div><strong>{item.datum.value[lang]}</strong></article>;
    case 'scrap':
      return <article className="fi-floor-card fi-floor-scrap"><p>{item.scrap.text[lang]}</p><small>— {item.scrap.author[lang]}</small></article>;
    case 'gallery':
      return <article className="fi-floor-card"><h4>{item.gallery.title[lang]}</h4><p>{item.gallery.gist[lang]}</p>{item.gallery.cite && <small><Citation cite={item.gallery.cite} /></small>}</article>;
    case 'resident':
      return <article className="fi-floor-card fi-floor-resident"><span data-kind={item.resident.kind}>{item.resident.kind === 'ai' ? 'AI' : '人'}</span><div><h4>{item.resident.name}</h4><p>{item.resident.caption[lang]}</p></div></article>;
    case 'structure': {
      const structure = item.structure;
      return (
        <article className="fi-floor-card fi-floor-structure">
          <small>{structure.theme ? t(`chart.structures.theme.${structure.theme}`) : t('chart.structures.legend')}</small>
          <h4>{structure.title[lang]}</h4>
          <p>{structure.statement[lang]}</p>
          {structure.provenance && <a href={structure.provenance.url} target="_blank" rel="noopener noreferrer">{structure.provenance.source}{structure.provenance.recordIds.length ? ` · #${structure.provenance.recordIds.join(' · #')}` : ''} · {structure.provenance.reviewedAt} ↗</a>}
          <em>{t('island.interior.structureBoundary')}</em>
        </article>
      );
    }
  }
}

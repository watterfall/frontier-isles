import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { frontierAtlasBySlug } from '@frontier-isles/data/atlas';
import { BRIDGES } from '@frontier-isles/data/bridges';
import { collisionKey, validateExplorationCatalog, type QuestionCollision } from '@frontier-isles/data/xfrontier-exploration';
import { parseExplorationProposal, type ExplorationMove, type ExplorationReply } from '@frontier-isles/data/exploration-assistant';
import snapshot from '../../data/exploration-catalog.json';
import { COLLISION_THEMES, collisionTension, questionLabel, thematicCollisions } from '../../data/collisionThemes';
import { readExplorationCatalog, readQuestionSource, type QuestionSource } from '../../api/exploration';
import { askResearchAssistant, readAssistantCapability, type AssistantCapability } from '../../api/researchAssistant';
import { beginExpedition, emptyExpeditions, expeditionMarkdown, EXPEDITION_STORAGE, parseExpeditionNotebook, type CollisionExpedition, type ExpeditionNotebook, type ExplorationNote } from '../../state/collisionExpedition';
import type { ModelFamilyId, ModelRunReceipt } from '../../models/types';
import { PanelCloseButton, useDialogChrome } from '../panelChrome';
import { CollisionVoyageMap } from './CollisionVoyageMap';
import { collisionCopy } from '../../i18n/collision';
import './collision.css';

const ModelWorkbench = lazy(() => import('../model/ModelWorkbench').then((m) => ({ default: m.ModelWorkbench })));
export interface CollisionOverlayProps {
  onCollide?: (bridge: { formula: string; skeleton: { zh: string; en: string }; from: string; to: string }) => Promise<boolean> | void;
  onClose: () => void;
  onVisitIsland?: (slug: string) => void;
}
function download(text: string, name: string, type = 'text/markdown') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function QuestionSources({ ids, version, lang }: { ids: string[]; version: string; lang: 'zh' | 'en' }) {
  const [sources, setSources] = useState<QuestionSource[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const key = ids.join('|');
  useEffect(() => {
    const abort = new AbortController(); setSources(null); setFailed(false);
    void Promise.all(key.split('|').map((id) => readQuestionSource(id, version, abort.signal))).then((value) => { if (!abort.signal.aborted) setSources(value); }).catch(() => { if (!abort.signal.aborted) setFailed(true); });
    return () => abort.abort();
  }, [key, version, retry]);
  return <div className="fi-collision-question-sources">
    <p>{lang === 'zh' ? '出处说明问题正在被讨论，不为任何答案背书。' : 'Sources establish that the questions are being asked, not that an answer is true.'}</p>
    {sources ? sources.map((s) => <a key={s.id} href={s.url} target="_blank" rel="noreferrer">{s.title}{s.year ? ` (${s.year})` : ''}</a>) : <p role="status">{failed ? (lang === 'zh' ? '暂时无法核对这一版本的出处。' : 'Sources for this edition are unavailable.') : (lang === 'zh' ? '正在读取出处…' : 'Reading sources…')}</p>}
    {failed && <button type="button" className="fi-collision-text-button" onClick={() => setRetry((n) => n + 1)}>{lang === 'zh' ? '重试核对出处' : 'Retry sources'}</button>}
  </div>;
}

/** Curiosity owns the sequence. The cartographic sheet shows real question
 * relations, the desk supports optional AI moves and actual toy-model runs.
 * No stage completion, stamps, ranks or forced prediction before exploration. */
export function CollisionOverlay({ onCollide, onClose, onVisitIsland }: CollisionOverlayProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';
  const zh = lang === 'zh', li = zh ? 0 : 1, c = collisionCopy[lang];
  const { dialogRef, closeRef, onDialogKey } = useDialogChrome<HTMLDivElement>(() => { if (lab) setLab(null); else onClose(); });
  const [catalog, setCatalog] = useState(() => validateExplorationCatalog(snapshot));
  const [connection, setConnection] = useState<'checking' | 'live' | 'offline' | 'stale'>('checking');
  const [retry, setRetry] = useState(0);
  const [themeId, setThemeId] = useState<string>('emergence');
  const theme = COLLISION_THEMES.find((item) => item.id === themeId)!;
  const [tab, setTab] = useState<'map' | 'notebook' | 'bridges'>('map');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(() => collisionKey(thematicCollisions(validateExplorationCatalog(snapshot), COLLISION_THEMES[0].ids)[0]!));
  const [initial] = useState(() => {
    try { const raw = localStorage.getItem(EXPEDITION_STORAGE); return { notebook: raw ? parseExpeditionNotebook(raw) : emptyExpeditions(), damaged: false }; }
    catch { return { notebook: emptyExpeditions(), damaged: true }; }
  });
  const [notebook, setNotebook] = useState<ExpeditionNotebook>(initial.notebook);
  const notebookRef = useRef(notebook); notebookRef.current = notebook;
  const [saveState, setSaveState] = useState<'saved' | 'error' | 'damaged'>(initial.damaged ? 'damaged' : 'saved');
  const [activeId, setActiveId] = useState<string | null>(initial.notebook.selectedId);
  const [mobileDesk, setMobileDesk] = useState(!!initial.notebook.selectedId);
  const [bridgeIndex, setBridgeIndex] = useState(0);
  const [foundState, setFoundState] = useState<'idle' | 'busy' | 'error'>('idle');
  const [showSources, setShowSources] = useState(false);
  const [capability, setCapability] = useState<AssistantCapability>('checking');
  const [assistant, setAssistant] = useState<{ entryId: string; reply: ExplorationReply } | null>(null);
  const [thinking, setThinking] = useState(false);
  const [aiError, setAiError] = useState('');
  const requestRef = useRef<AbortController | null>(null);
  const [lab, setLab] = useState<ModelFamilyId | null>(null);
  const closeLab = useCallback(() => setLab(null), []);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const deskRef = useRef<HTMLElement>(null);
  const mapOriginRef = useRef<{ question?: string; route?: string }>({});
  const active = notebook.entries.find((e) => e.id === activeId);
  const collision = active?.collision ?? catalog.collisions.find((pair) => collisionKey(pair) === selected) ?? catalog.collisions[0]!;
  const source = active?.source ?? catalog;
  const questionA = source.questions.find((q) => q.id === collision.a)!;
  const questionB = source.questions.find((q) => q.id === collision.b)!;
  const tension = collisionTension(collision);
  const restoredReply = useMemo(() => {
    const saved = [...(active?.notes ?? [])].reverse().find((n) => n.kind === 'ai' && n.attachment);
    if (!saved?.attachment) return null;
    try {
      const value = JSON.parse(saved.attachment) as ExplorationReply;
      parseExplorationProposal(value, catalog.questions.map((q) => q.id));
      return value.datasetVersion === active?.source.datasetVersion && typeof value.model === 'string' && Array.isArray(value.sources) && value.sources.every((s) => s && typeof s.id === 'string' && typeof s.title === 'string' && typeof s.url === 'string' && /^https?:\/\//.test(s.url)) ? value : null;
    } catch { return null; }
  }, [active, catalog]);
  const currentReply = assistant?.entryId === activeId ? assistant.reply : restoredReply;
  const qText = (q: typeof questionA) => zh ? q.q : q.q_en;
  const matching = useMemo(() => {
    const candidates = query.trim() ? catalog.collisions : thematicCollisions(catalog, theme.ids);
    return candidates.filter((pair) => {
      const qs = catalog.questions.filter((q) => q.id === pair.a || q.id === pair.b);
      return [pair.shared, pair.shared_en, pair.synthesis, pair.synthesis_en, ...qs.flatMap((q) => [q.q, q.q_en])].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
    });
  }, [catalog, query, theme]);
  const mapIds = useMemo(() => {
    const ids = query.trim() ? matching.flatMap((p) => [p.a, p.b]) : [...theme.ids];
    const extra = currentReply?.moves.flatMap((move) => move.questionIds) ?? [];
    const required = [...new Set([collision.a, collision.b, ...extra])];
    const base = ids.filter((id) => !required.includes(id)).slice(0, Math.max(0, 10 - required.length));
    // Keep theme positions stable when merely selecting an island; append any
    // genuinely new question brought into view by a search or AI proposal.
    return [...new Set([...ids.filter((id) => required.includes(id) || base.includes(id)), ...required])].slice(0, 10);
  }, [theme, collision, matching, query, currentReply]);
  const branches = catalog.collisions.filter((pair) => collisionKey(pair) !== collisionKey(collision) && [pair.a, pair.b].some((id) => id === collision.a || id === collision.b)).slice(0, 5);

  useEffect(() => {
    const abort = new AbortController(); setConnection('checking'); setCapability('checking');
    void readExplorationCatalog(abort.signal).then((result) => { if (!abort.signal.aborted) { setCatalog(result.catalog); setConnection(result.source); } }).catch(() => { if (!abort.signal.aborted) setConnection('offline'); });
    void readAssistantCapability(abort.signal).then((state) => { if (!abort.signal.aborted) setCapability(state); }).catch(() => { if (!abort.signal.aborted) setCapability('offline'); });
    return () => abort.abort();
  }, [retry]);
  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => { requestRef.current?.abort(); setThinking(false); setAiError(''); setLab(null); deskRef.current?.scrollTo({ top: 0 }); }, [activeId, selected]);
  useEffect(() => {
    if (!mobileDesk) return;
    const frame = requestAnimationFrame(() => {
      const heading = deskRef.current?.querySelector('h2');
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    });
    return () => cancelAnimationFrame(frame);
  }, [mobileDesk, activeId, selected]);

  function persist(next: ExpeditionNotebook) {
    notebookRef.current = next; setNotebook(next);
    if (initial.damaged) { setSaveState('damaged'); return; }
    try { localStorage.setItem(EXPEDITION_STORAGE, JSON.stringify(next)); setSaveState('saved'); }
    catch { setSaveState('error'); }
  }
  function changeEntry(id: string, transform: (entry: CollisionExpedition) => CollisionExpedition) {
    const current = notebookRef.current;
    persist({ ...current, entries: current.entries.map((entry) => entry.id === id ? { ...transform(entry), updatedAt: new Date().toISOString() } : entry) });
  }
  function start(pair = collision, parentId?: string) {
    const candidate = beginExpedition(catalog, pair);
    const existing = notebookRef.current.entries.find((e) => e.id === candidate.id);
    const next = existing ?? { ...candidate, parentId, fields: { ...candidate.fields, question: zh ? pair.synthesis : pair.synthesis_en } };
    persist({ version: 1, selectedId: next.id, entries: existing ? notebookRef.current.entries : [...notebookRef.current.entries, next] });
    setActiveId(next.id); setMobileDesk(true); setTab('map');
  }
  function selectPair(pair: QuestionCollision) {
    setSelected(collisionKey(pair)); setActiveId(null); setMobileDesk(true);
    persist({ ...notebookRef.current, selectedId: null });
  }
  function backToMap() {
    setMobileDesk(false);
    requestAnimationFrame(() => {
      const origin = mapOriginRef.current;
      const selector = origin.question ? `[data-question-id="${CSS.escape(origin.question)}"]` : origin.route ? `[data-route-key="${CSS.escape(origin.route)}"]` : '.fi-voyage-island[data-selected="true"]';
      const control = dialogRef.current?.querySelector<HTMLElement>(selector) ?? dialogRef.current?.querySelector<HTMLElement>('.fi-collision-themes button[aria-pressed="true"]');
      control?.focus();
    });
  }
  function appendNote(id: string, kind: ExplorationNote['kind'], text: string, attribution?: string, attachment?: string) {
    const note: ExplorationNote = { id: crypto.randomUUID(), kind, text: text.slice(0, 12000), attribution, attachment, createdAt: new Date().toISOString() };
    changeEntry(id, (entry) => ({ ...entry, notes: [...(entry.notes ?? []), note].slice(-500) }));
  }
  function recordThought() {
    if (!active?.fields.interpretation.trim()) return;
    appendNote(active.id, 'thought', active.fields.interpretation);
    changeEntry(active.id, (entry) => ({ ...entry, fields: { ...entry.fields, interpretation: '' } }));
    noteRef.current?.focus();
  }
  async function askAI(intent?: string) {
    if (!active || capability !== 'ready' || thinking) return;
    const entryId = active.id;
    const message = [intent, active.fields.interpretation.trim() || active.fields.question].filter(Boolean).join('\n');
    const abort = new AbortController(); requestRef.current?.abort(); requestRef.current = abort;
    setThinking(true); setAiError('');
    try {
      const reply = await askResearchAssistant({ datasetVersion: active.source.datasetVersion, questionIds: [active.collision.a, active.collision.b], message: message.slice(0, 3000), notes: [active.fields.question, ...(active.notes ?? []).slice(-8).map((n) => `${n.kind}: ${n.text}`)].join('\n').slice(-6000), lang }, catalog.questions.map((q) => q.id), abort.signal);
      if (abort.signal.aborted) return;
      appendNote(entryId, 'question', message);
      appendNote(entryId, 'ai', reply.reply, `${reply.model} · ${reply.datasetVersion} · ${zh ? 'AI 提案，尚未验证' : 'AI proposal, untested'}`, JSON.stringify(reply));
      setAssistant({ entryId, reply });
    } catch (error) { if (!abort.signal.aborted) setAiError(error instanceof Error && error.message === 'source_changed' ? (zh ? '来源版本已变化。这份记录仍保留原版；从当前目录另开探索后再请 AI 推演。' : 'The source edition changed. Keep this record and start from the current catalog to use AI.') : (zh ? 'AI 暂时没有返回可用结果。思考已保留，可以重试或自行继续。' : 'AI did not return a usable result. Your notes remain; retry or continue on your own.')); }
    finally { if (requestRef.current === abort) { setThinking(false); requestRef.current = null; } }
  }
  function adopt(move: ExplorationMove) {
    if (!active || !currentReply) return;
    appendNote(active.id, 'question', `${move.question}\n\n${move.reason}\n\n${move.boundary}`, `${currentReply.model} · ${currentReply.datasetVersion} · ${zh ? '从 AI 提案继续追问，未验证' : 'Following an untested AI proposal'}`);
    changeEntry(active.id, (entry) => ({ ...entry, fields: { ...entry.fields, question: move.question, interpretation: '' } }));
    noteRef.current?.focus();
  }
  function saveRun(receipt: ModelRunReceipt) {
    if (!active) return;
    appendNote(active.id, 'model', `${receipt.substrateId}: ${receipt.observation.metric} ${receipt.observation.initial.toFixed(4)} → ${receipt.observation.final.toFixed(4)}\n${receipt.boundary}`, zh ? '本机实际运行的简化模型；不验证现实领域的迁移。' : 'Executed local toy model; does not validate real-world transfer.', JSON.stringify(receipt));
  }
  const bridge = BRIDGES[bridgeIndex]!;
  const content = <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="fi-collision-title" onKeyDown={(event) => { if (!lab) onDialogKey(event); }} className="fi-collision-overlay" data-desk={mobileDesk}>
    <div className="fi-collision-shell">
      <header className="fi-collision-header">
        <div><h1 id="fi-collision-title">{c.title}</h1><p>{zh ? '跟随好奇，让问题带你越过学科。' : 'Follow your curiosity across disciplines.'}</p></div>
        <nav aria-label={zh ? '探索视图' : 'Exploration views'} className="fi-collision-tabs">
          <button type="button" aria-pressed={tab === 'map'} onClick={() => { setTab('map'); setMobileDesk(false); }}>{zh ? '问题群岛' : 'Question islands'}</button>
          <button type="button" aria-pressed={tab === 'notebook'} onClick={() => { setTab('notebook'); setMobileDesk(false); }}>{zh ? '我的航迹' : 'My trails'}</button>
          <button type="button" aria-pressed={tab === 'bridges'} onClick={() => { setTab('bridges'); setMobileDesk(false); }}>{c.bridges}</button>
        </nav>
        <PanelCloseButton ref={closeRef} onClose={onClose} label={t('panel.close')} />
      </header>
      {tab === 'bridges' ? <div className="fi-collision-bridge-layout"><aside>{BRIDGES.map((b, index) => <button type="button" className="fi-collision-route" aria-pressed={bridgeIndex === index} key={`${b.from}:${b.to}`} onClick={() => { setBridgeIndex(index); setFoundState('idle'); }}><strong className="fi-collision-formula">{b.formula}</strong><span>{b.skeleton[lang]}</span></button>)}</aside><section className="fi-collision-bridge-detail"><h2>{bridge.skeleton[lang]}</h2><div className="fi-collision-equation">{bridge.formula}</div><p>{frontierAtlasBySlug(bridge.from)?.title[lang]} ↔ {frontierAtlasBySlug(bridge.to)?.title[lang]}</p><p>{c.bridgeNote}</p><div className="fi-collision-actions">{onVisitIsland && <><button type="button" onClick={() => onVisitIsland(bridge.from)}>{zh ? '前往起点岛' : 'Visit origin'}</button><button type="button" onClick={() => onVisitIsland(bridge.to)}>{zh ? '前往另一座岛' : 'Visit destination'}</button></>}{onCollide ? <button type="button" className="fi-collision-primary" disabled={foundState === 'busy'} onClick={async () => { setFoundState('busy'); try { const ok = await onCollide(bridge); setFoundState(ok === false ? 'error' : 'idle'); } catch { setFoundState('error'); } }}>{foundState === 'busy' ? c.founding : c.found}</button> : <p>{c.phoneBridge}</p>}</div>{foundState === 'error' && <p role="alert">{c.foundError}</p>}</section></div> :
      <div className="fi-collision-layout">
        <section className="fi-collision-cartography" aria-label={zh ? '跨领域主题与航线' : 'Themes and routes'}>
          {tab === 'notebook' ? <div className="fi-collision-notebook"><h2>{zh ? '那些让你改变方向的问题' : 'Questions that changed your direction'}</h2><p>{zh ? '航迹保留你的追问、岔路与观察。随时回到一处，接着想。' : 'Your questions, forks and observations. Return anywhere and keep thinking.'}</p>{!notebook.entries.length && <p>{c.noNotes}</p>}<ol className="fi-collision-trail">{notebook.entries.map((entry) => <li key={entry.id} data-branch={!!entry.parentId}><button type="button" onClick={() => { setActiveId(entry.id); setTab('map'); setMobileDesk(true); persist({ ...notebookRef.current, selectedId: entry.id }); }}><strong>{entry.fields.question || (zh ? entry.collision.synthesis : entry.collision.synthesis_en)}</strong><span>{(entry.notes ?? []).at(-1)?.text.slice(0, 100) || (zh ? '一处还没展开的好奇。' : 'A curiosity to return to.')}</span><small>{entry.parentId ? (zh ? '从另一条追问分叉 · ' : 'Branched from another question · ') : ''}{new Date(entry.updatedAt).toLocaleDateString(lang)}</small></button></li>)}</ol>{notebook.entries.length > 0 && <button className="fi-collision-text-button" type="button" onClick={() => download(JSON.stringify(notebook, null, 2), 'frontier-expeditions.json', 'application/json')}>{c.exportAll}</button>}</div> : <>
            <nav className="fi-collision-themes" aria-label={zh ? '跨领域主题' : 'Interdisciplinary themes'}>{COLLISION_THEMES.map((item) => <button key={item.id} type="button" aria-pressed={themeId === item.id} onClick={() => { setThemeId(item.id); setQuery(''); setActiveId(null); setSelected(collisionKey(thematicCollisions(catalog, item.ids)[0] ?? catalog.collisions[0]!)); setMobileDesk(false); }}>{item.title[li]}</button>)}</nav>
            <div className="fi-collision-map-heading"><div><h2>{theme.title[li]}</h2><p>{theme.invitation[li]}</p></div><span>{theme.domains[li]}</span></div>
            <label className="fi-collision-search"><span className="sr-only">{c.search}</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.search} type="search" /></label>
            {query.trim() && !matching.length ? <p className="fi-collision-empty">{c.empty}</p> : <CollisionVoyageMap catalog={catalog} ids={mapIds} selected={collision} travelled={notebook.entries.filter((e) => (e.notes?.length ?? 0) > 0 || Object.entries(e.fields).some(([key, value]) => key !== 'question' && value.trim())).map((e) => collisionKey(e.collision))} lang={lang} proposals={currentReply?.moves ?? []} onProposal={adopt} onSelect={(pair) => { mapOriginRef.current = { route: collisionKey(pair) }; selectPair(pair); }} onQuestion={(id) => { mapOriginRef.current = { question: id }; const pair = [...matching, ...catalog.collisions].find((p) => p.a === id || p.b === id); if (pair) selectPair(pair); }} />}
            <details className="fi-collision-route-twin" open={!!query.trim()}><summary>{zh ? '用列表阅读这些航线' : 'Read these routes as a list'}</summary><div>{matching.map((pair) => <button type="button" key={collisionKey(pair)} onClick={() => selectPair(pair)} aria-pressed={collisionKey(collision) === collisionKey(pair)}>{questionLabel(catalog, pair.a, lang)}<span aria-hidden="true"> ↔ </span>{questionLabel(catalog, pair.b, lang)}</button>)}</div></details>
          </>}
          <footer className="fi-collision-source"><span data-state={connection}>{connection === 'checking' ? c.loading : connection === 'live' ? c.live : connection === 'stale' ? c.stale : c.offline}</span><small>{catalog.datasetVersion}</small><button type="button" className="fi-collision-text-button" onClick={() => setRetry((n) => n + 1)}>{c.retry}</button></footer>
        </section>
        <aside className="fi-collision-desk" ref={deskRef} aria-label={zh ? '当前探索' : 'Current exploration'}>
          <button type="button" className="fi-collision-mobile-back fi-collision-text-button" onClick={backToMap}>{zh ? '回到问题群岛' : 'Back to question islands'}</button>
          {active ? <>
            <h2 className="fi-collision-current-question">{active.fields.question || (zh ? collision.synthesis : collision.synthesis_en)}</h2>
            <details className="fi-collision-context"><summary>{zh ? '回看这次相遇' : 'Revisit this encounter'}</summary><p>{qText(questionA)}</p><p>{qText(questionB)}</p><p>{zh ? collision.shared : collision.shared_en}</p></details>
            <label className="fi-collision-composer"><strong>{zh ? '此刻，你想追问什么？' : 'What are you wondering now?'}</strong><textarea ref={noteRef} rows={4} maxLength={3000} value={active.fields.interpretation} placeholder={zh ? '一个直觉、一个反例，或刚刚看见的变化……' : 'An intuition, a counterexample, or something you just noticed…'} onChange={(e) => changeEntry(active.id, (entry) => ({ ...entry, fields: { ...entry.fields, interpretation: e.target.value } }))} /></label>
            <div className="fi-collision-actions"><button type="button" className="fi-collision-primary" onClick={recordThought} disabled={!active.fields.interpretation.trim()}>{zh ? '留下思考' : 'Keep this thought'}</button>{capability === 'ready' && <button type="button" onClick={() => void askAI()} disabled={thinking}>{zh ? '请 AI 一起推演' : 'Think with AI'}</button>}</div>
            <section className="fi-collision-ai" aria-label={zh ? 'AI 探索伙伴' : 'AI exploration partner'}>
              <h3>{zh ? '换个角度，继续探索' : 'Another angle to explore'}</h3>
              {capability === 'ready' ? <><p>{zh ? 'AI 会读取当前问题、你的笔记和来源，提出可选择的追问。' : 'AI reads the questions, your notes and sources, then proposes optional next moves.'}</p><div className="fi-collision-ai-intents">{(zh ? ['去更远的领域找联系', '找一个能反驳它的解释', '设计一个区分解释的小试验'] : ['Look for a distant connection', 'Find a competing explanation', 'Design a discriminating probe']).map((intent) => <button type="button" key={intent} disabled={thinking} onClick={() => void askAI(intent)}>{intent}</button>)}</div><small>{zh ? '点击后将当前问题与最近笔记发给已配置的模型。提案由你决定是否继续。' : 'Sends these questions and recent notes to the configured model. You choose what to follow.'}</small></> : <p className="fi-collision-capability" role="status">{capability === 'checking' ? (zh ? '正在检查 AI 连接…' : 'Checking AI connection…') : capability === 'sign_in' ? (zh ? '登录后可以请 AI 一起推演。也可以先沿资料线索探索。' : 'Sign in to think with AI, or follow the source routes yourself.') : (zh ? 'AI 尚未连接。以下是资料中的探索线索；你仍可以自由记录、分叉和运行模型。' : 'AI is not connected. These are source-based routes; you can still write, branch and run models.')}</p>}
              {thinking && <div className="fi-collision-thinking" role="status"><span>{zh ? '正在核对问题、寻找不同解释…' : 'Checking questions and looking for alternatives…'}</span><button type="button" onClick={() => { requestRef.current?.abort(); setThinking(false); }}>{zh ? '停止' : 'Stop'}</button></div>}
              {aiError && <p role="alert">{aiError}</p>}
              {currentReply && <div className="fi-collision-ai-reply"><p>{currentReply.reply}</p>{currentReply.moves.map((move, i) => <article key={i}><h4>{move.title}</h4><p>{move.question}</p><details><summary>{zh ? '为何值得试 · 哪里可能不成立' : 'Why try this · Where it may fail'}</summary><p>{move.reason}</p><p>{move.boundary}</p></details><button type="button" className="fi-collision-text-button" onClick={() => adopt(move)}>{zh ? '沿这句追问继续' : 'Follow this question'}</button></article>)}<small>{currentReply.model} · {zh ? 'AI 提案，尚未验证' : 'AI proposals, untested'}</small><details><summary>{zh ? 'AI 实际读取的问题出处' : 'Question sources read by AI'}</summary>{currentReply.sources.map((s) => <a key={s.id} href={s.url} target="_blank" rel="noreferrer">{s.title}</a>)}</details></div>}
            </section>
            <details className="fi-collision-lab-launch"><summary>{zh ? '在一个可运行的模型里试一试' : 'Try something in a runnable model'}</summary><p>{zh ? '比较同一规则在不同情境中的行为。模型观察会回到这条航迹，适用边界由你判断。' : 'Compare one rule across contexts. Observations return to this trail; you judge the transfer limits.'}</p><div className="fi-collision-actions"><button type="button" onClick={() => setLab('synchronization')}>{zh ? '同步：萤火虫、心肌与电网' : 'Synchronization: fireflies, hearts, grids'}</button><button type="button" onClick={() => setLab('shared-field')}>{zh ? '共享场：热、扩散与流动' : 'Shared fields: heat, diffusion, flow'}</button></div></details>
            {(active.notes?.length ?? 0) > 0 && <section className="fi-collision-observations"><h3>{zh ? '思考留下的变化' : 'The course of your thinking'}</h3>{[...(active.notes ?? [])].reverse().map((note) => <article key={note.id} data-kind={note.kind}><span>{note.kind === 'model' ? (zh ? '模型观察' : 'Model observation') : note.kind === 'ai' ? (zh ? 'AI 提案' : 'AI proposal') : note.kind === 'question' ? (zh ? '新的追问' : 'A new question') : (zh ? '我的思考' : 'My thought')}</span><p>{note.text}</p>{note.attribution && <small>{note.attribution}</small>}{note.attachment && <details><summary>{zh ? '原始记录' : 'Original record'}</summary><pre>{note.attachment}</pre></details>}</article>)}</section>}
            {Object.entries(active.fields).some(([key, value]) => !['question', 'interpretation'].includes(key) && value.trim()) && <details className="fi-collision-legacy"><summary>{zh ? '之前保存的研究笔记' : 'Previously saved research notes'}</summary>{Object.entries(active.fields).filter(([key, value]) => !['question', 'interpretation'].includes(key) && value.trim()).map(([key, value]) => <p key={key}><strong>{c.labels[key as keyof typeof c.labels]}</strong><br />{value}</p>)}</details>}
            <div className="fi-collision-save"><button type="button" className="fi-collision-text-button" onClick={() => download(expeditionMarkdown(active, lang), 'frontier-expedition.md')}>{c.export}</button><p role={saveState === 'saved' ? 'status' : 'alert'}>{saveState === 'saved' ? c.saved : saveState === 'damaged' ? c.damaged : c.saveError}</p></div>
          </> : <>
            <div className="fi-collision-question-pair"><h2>{qText(questionA)}</h2><svg viewBox="0 0 60 24" aria-hidden="true"><path d="M2 6C22 6 38 18 58 18M2 18C22 18 38 6 58 6" /><circle cx="30" cy="12" r="4" /></svg><h2>{qText(questionB)}</h2></div>
            <button type="button" className="fi-collision-primary" onClick={() => start()}>{zh ? '带着这个问题出发' : 'Follow this question'}<span aria-hidden="true"> →</span></button>
            <section className="fi-collision-shared"><h3>{c.shared}</h3><p>{zh ? collision.shared : collision.shared_en}</p></section>
            <section className="fi-collision-synthesis"><h3>{zh ? '一个值得追下去的问题' : 'A question worth following'}</h3><p>{zh ? collision.synthesis : collision.synthesis_en}</p></section>
            <section className="fi-collision-tension"><h3>{zh ? '先看哪里不同' : 'Where the analogy could break'}</h3><p>{tension?.distinction[li] ?? (zh ? '把两边的对象、作用过程与可观察量分别说清。哪个对应一旦失败，这条联系就不能继续？' : 'Identify each side’s objects, processes and observables. Which failed correspondence would break the connection?')}</p>{tension && <details><summary>{zh ? '什么观察值得先做' : 'An observation to consider'}</summary><p>{tension.observation[li]}</p></details>}<small>{zh ? '本站的辨别提示 · 未验证的研究方向' : 'Local reading prompt · untested research direction'}</small></section>
            <p className="fi-collision-boundary">{zh ? '这是编辑提出的类比。相似的词，未必是相同的机制。' : 'An editorial analogy. Similar words may refer to different mechanisms.'}</p>

          </>}
          {branches.length > 0 && <section className="fi-collision-branches"><h3>{zh ? '从这里，还能去哪里' : 'Where this could lead'}</h3>{branches.map((pair) => {
            const otherId = [pair.a, pair.b].find((id) => id !== collision.a && id !== collision.b)!;
            return <button type="button" key={collisionKey(pair)} onClick={() => active ? start(pair, active.id) : selectPair(pair)}><strong>{questionLabel(catalog, otherId, lang)}</strong><span>{zh ? pair.shared : pair.shared_en}</span></button>;
          })}</section>}
          <details className="fi-collision-provenance" onToggle={(e) => setShowSources(e.currentTarget.open)}><summary>{c.showDetails}</summary><p>{c.sourceNote}</p><p>{source.datasetVersion} · {source.retrievedAt}</p>{showSources && <QuestionSources ids={[collision.a, collision.b]} version={source.datasetVersion} lang={lang} />}{active && source.datasetVersion !== catalog.datasetVersion && <p>{c.different}</p>}</details>
          {initial.damaged && <><p role="alert">{c.damaged}</p><button type="button" className="fi-collision-text-button" onClick={() => { try { download(localStorage.getItem(EXPEDITION_STORAGE) ?? '', 'frontier-expeditions-recovery.json', 'application/json'); } catch { setSaveState('error'); } }}>{c.backup}</button></>}
        </aside>
      </div>}
      {lab && <div className="fi-collision-lab"><Suspense fallback={<p role="status">{zh ? '正在准备模型…' : 'Preparing model…'}</p>}><ModelWorkbench lang={lang} launch={{ familyId: lab }} onSave={saveRun} onClose={closeLab} embedded /></Suspense></div>}
    </div>
  </div>;
  return typeof document === 'undefined' ? content : createPortal(content, document.body);
}

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import { Boat } from '@frontier-isles/assets';
import { ChartScreen } from './components/chart/ChartScreen';
import { IslandScreen } from './components/island/IslandScreen';
import { GeneratedIslandScreen } from './components/island/GeneratedIslandScreen';
import { CeremonyOverlay } from './components/ceremony/CeremonyOverlay';
import { CollisionOverlay } from './components/ceremony/CollisionOverlay';
import { ScrollWipe } from './components/shell/ScrollWipe';
import { Toast } from './components/shell/Toast';
import { LangToggle } from './components/shell/LangToggle';
import { SessionBadge } from './components/shell/SessionBadge';
import { MobileShell } from './components/mobile/MobileShell';
import { useAppData } from './api/useAppData';
import { api } from './api/client';
import { usePresence } from './presence/usePresence';
import { DATA, QUESTIONS, SAMPLE_SLUG, STN, type IslandDatum, type QuestionDatum } from './api/fallback';
import { localizeStationZh } from './i18n/stations';
import { wipeReducer, initialWipe, MID_MS, END_MS, type WipeView } from './state/wipeMachine';
import {
  ceremonyReducer,
  initialCeremony,
  ritFocusText,
} from './state/ceremonyReducer';
import type { BriefState } from './components/island/MorningReport';
import { useIsMobile, useStageScale } from './useIsMobile';

export default function App() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'zh';
  const isMobile = useIsMobile();
  const scale = useStageScale();
  const { islands, actor } = useAppData();

  // ── screen / transition ──────────────────────────────────────────────
  const [wipe, dispatchWipe] = useReducer(wipeReducer, initialWipe('chart'));
  const wipeTimers = useRef<number[]>([]);

  const startWipe = useCallback(
    (view: WipeView) => {
      dispatchWipe({ type: 'begin', view });
      requestAnimationFrame(() => requestAnimationFrame(() => dispatchWipe({ type: 'raf' })));
      wipeTimers.current.push(window.setTimeout(() => dispatchWipe({ type: 'mid' }), MID_MS));
      wipeTimers.current.push(window.setTimeout(() => dispatchWipe({ type: 'end' }), END_MS));
    },
    [],
  );
  useEffect(() => () => wipeTimers.current.forEach(clearTimeout), []);

  // ── L0 chart ─────────────────────────────────────────────────────────
  const [hover, setHover] = useState<number | null>(null);
  const [filter, setFilter] = useState('全部');

  // ── founded island (from a completed ceremony) ───────────────────────
  const [founded, setFounded] = useState<{ name: string; q: string; slug: string } | null>(null);
  const chartIslands: IslandDatum[] = founded
    ? [...islands, { id: 21, n: { zh: founded.name, en: founded.name }, q: { zh: founded.q, en: founded.q }, d: '交叉', x: 1108, y: 742, s: 0.8, st: 0, m: 1, a: 5, born: true, slug: founded.slug }]
    : islands;

  // ── L1 island ────────────────────────────────────────────────────────
  const [night, setNight] = useState(false);
  const [tval, setTval] = useState(86);
  const [sel, setSel] = useState<StationKind | null>(null);
  const [selSlug, setSelSlug] = useState<string | null>(null);
  const [panel, setPanel] = useState(false);
  // ── D2 sail: a ferry boat animates across the chart before the wipe ──────
  const [sailing, setSailing] = useState<{ fromX: number; fromY: number; toX: number; toY: number; cx: number; cy: number; slug: string; t: number } | null>(null);
  const [sailingPos, setSailingPos] = useState<{ x: number; y: number } | null>(null);
  const lastIslandPos = useRef<{ x: number; y: number }>({ x: 760, y: 470 });
  const [stFilter, setStFilter] = useState('全部');
  const [driftOn, setDriftOn] = useState(false);
  const [driftDest, setDriftDest] = useState<string | null>(null);
  const [transTo, setTransTo] = useState<string | null>(null);
  const [briefSt, setBriefSt] = useState<Record<number, BriefState>>({ 0: 'pending', 1: 'pending', 2: 'pending' });
  const [advOn, setAdvOn] = useState(true);
  // ── collision founding (Track B) ─────────────────────────────────────
  const [collideOn, setCollideOn] = useState(false);

  // Question-Wall QFT state (mutable copy of the fallback questions).
  const [qs, setQs] = useState<QuestionDatum[]>(() => QUESTIONS.map((q) => ({ ...q })));
  const [voted, setVoted] = useState<Record<number, boolean>>({});
  const [focusIdx, setFocusIdx] = useState<number | null>(null);

  const peers = usePresence(`island:${selSlug ?? SAMPLE_SLUG}`, wipe.view === 'island' && (selSlug === SAMPLE_SLUG || !selSlug));

  // ── toast ────────────────────────────────────────────────────────────
  const [toast, setToast] = useState('');
  const [toastOn, setToastOn] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);
  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    setToastOn(true);
    toastTimer.current = window.setTimeout(() => setToastOn(false), 2600);
  }, []);

  // ── ceremony ─────────────────────────────────────────────────────────
  const [ceremony, dispatchCeremony] = useReducer(ceremonyReducer, undefined, initialCeremony);

  // chapter-2 countdown
  useEffect(() => {
    if (ceremony.rit !== 1) return;
    const id = window.setInterval(() => dispatchCeremony({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, [ceremony.rit]);

  // finish → island rises, then land on chart with a toast
  const finishTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!ceremony.riseUp) return;
    const name = ceremony.ritName ?? t('ceremony.unnamed');
    const q = ritFocusText(ceremony, lang);
    const n = ceremony.ritLog.length;
    const slug = `isle-${Date.now()}`;
    // best-effort POST /api/islands (founding). The slug is locally generated;
    // the server uses the same slug (foundIsland → opIdFor(input.slug)), so we
    // can setFounded immediately without awaiting the response.
    void api.found({
      slug,
      title: name,
      name,
      qfocus: q,
      domain: '交叉',
      questions: ceremony.ritAdded.map((qi) => ({ text: q, open: ceremony.ritMeta[qi]?.open !== false })),
      votes: Object.fromEntries(Object.entries(ceremony.ritVotes).map(([k, v]) => [k, v])),
      ceremonyLog: ceremony.ritLog.map((e) => e.k),
      actor,
    });
    finishTimer.current = window.setTimeout(() => {
      setFounded({ name, q, slug });
      dispatchCeremony({ type: 'abort' }); // closes overlay (rit → null)
      showToast(t('toast.ritDone', { name, n }));
    }, 2600);
    return () => clearTimeout(finishTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ceremony.riseUp]);

  const abortCeremony = useCallback(() => {
    showToast(t('toast.ritAbort', { n: ceremony.ritLog.length }));
    dispatchCeremony({ type: 'abort' });
  }, [ceremony.ritLog.length, showToast, t]);

  // ── handlers ─────────────────────────────────────────────────────────
  const onIsland = useCallback(
    (d: IslandDatum) => {
      if (sailing || wipe.phase !== 'idle') return;
      const from = lastIslandPos.current;
      lastIslandPos.current = { x: d.x, y: d.y };
      const mx = (from.x + d.x) / 2;
      const my = (from.y + d.y) / 2;
      setSailing({ fromX: from.x, fromY: from.y, toX: d.x, toY: d.y, cx: mx, cy: my - 30, slug: d.slug ?? SAMPLE_SLUG, t: Date.now() });
    },
    [sailing, wipe.phase],
  );

  // Clicking a bridge sails along its arc to the far island (§4 ferryman route).
  const onBridge = useCallback(
    (b: { fromPos: { x: number; y: number }; toPos: { x: number; y: number }; arc: { cx: number; cy: number }; toSlug: string; toX: number; toY: number }) => {
      if (sailing || wipe.phase !== 'idle') return;
      lastIslandPos.current = { x: b.toX, y: b.toY };
      setSailing({ fromX: b.fromPos.x, fromY: b.fromPos.y, toX: b.toPos.x, toY: b.toPos.y, cx: b.arc.cx, cy: b.arc.cy, slug: b.toSlug, t: Date.now() });
    },
    [sailing, wipe.phase],
  );

  // Collision founding: found a new island on a real isomorphism bridge.
  const onCollide = useCallback(
    (bridge: { formula: string; skeleton: { zh: string; en: string }; from: string; to: string }) => {
      const slug = `collide-${Date.now()}`;
      const name = `${bridge.formula} 之岛`;
      const qfocus = `${bridge.formula} · ${bridge.skeleton[lang]} · ${bridge.from} ↔ ${bridge.to}`;
      void api.found({
        slug,
        title: name,
        name,
        qfocus,
        domain: '交叉',
        questions: [{ text: qfocus, open: true }],
        votes: { 0: 1 },
        ceremonyLog: ['collision'],
        actor,
      });
      setFounded({ name, q: qfocus, slug });
      setCollideOn(false);
      showToast(t('collision.founded', { name }));
    },
    [actor, showToast, t],
  );

  // Sail along a quadratic Bezier arc, then trigger the wipe.
  useEffect(() => {
    if (!sailing) return;
    let raf = 0;
    const start = performance.now();
    const dur = 950;
    const { fromX, fromY, toX, toY, cx, cy, slug } = sailing;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const mt = 1 - t;
      setSailingPos({ x: mt * mt * fromX + 2 * mt * t * cx + t * t * toX, y: mt * mt * fromY + 2 * mt * t * cy + t * t * toY });
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setSelSlug(slug);
        startWipe('island');
        setSailing(null);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sailing, startWipe]);

  const goChart = useCallback(() => {
    setPanel(false);
    setSelSlug(null);
    startWipe('chart');
  }, [startWipe]);

  const onStation = useCallback(
    (key: StationKind) => {
      if (key === 'questions') {
        setSel('questions');
        setPanel(true);
      } else if (key === 'driftwood') {
        setSel('driftwood');
        setDriftOn(true);
      } else {
        setSel(key);
        showToast(t('toast.stationSoon', { name: localizeStationZh(STN.find((s) => s.k === key)?.name ?? '', lang) }));
      }
    },
    [showToast, t, lang],
  );

  // keyboard: 1–8 direct-select the stations on L1
  useEffect(() => {
    if (wipe.view !== 'island' || ceremony.rit !== null) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= 8) {
        const row = STN[n - 1];
        if (row) onStation(row.k);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [wipe.view, ceremony.rit, onStation]);

  const onVoteQ = useCallback(
    (idx: number) => {
      if (voted[idx]) return;
      setQs((prev) => prev.map((q, j) => (j === idx ? { ...q, votes: q.votes + 1 } : q)));
      setVoted((prev) => ({ ...prev, [idx]: true }));
      void api.postEvent(SAMPLE_SLUG, { actor, credit: ['validation'], phase: 'A', action: 'validate', payload: { question: idx } });
    },
    [voted, actor],
  );

  const onFocus = useCallback(() => {
    const top = qs.reduce((b, q, j) => (q.votes > (qs[b]?.votes ?? -1) ? j : b), 0);
    setFocusIdx(top);
    void api.postEvent(SAMPLE_SLUG, { actor, credit: ['conceptualization'], phase: 'A', action: 'propose_subquestion', payload: { focus: top } });
  }, [qs, actor]);

  const onToggleQ = useCallback((idx: number) => {
    setQs((prev) => prev.map((q, j) => (j === idx ? { ...q, open: !q.open } : q)));
  }, []);

  const onAdopt = useCallback(
    (i: number) => {
      setBriefSt((prev) => ({ ...prev, [i]: 'ok' }));
      void api.decideBrief(SAMPLE_SLUG, i, 'adopt', actor);
    },
    [actor],
  );
  const onReturn = useCallback(
    (i: number) => {
      setBriefSt((prev) => ({ ...prev, [i]: 'back' }));
      void api.decideBrief(SAMPLE_SLUG, i, 'return', actor);
    },
    [actor],
  );

  const transplant = useCallback(
    (dest: '实验坊' | '白板厅') => {
      setTransTo(dest);
      setDriftDest(null);
      setDriftOn(false);
      showToast(t('toast.transplant', { dest: localizeStationZh(dest, lang) }));
      const flow = dest === '实验坊' ? 'hypothesis-output' : 'metaphor-bridge';
      void api.postEvent(SAMPLE_SLUG, { actor, credit: ['conceptualization', 'credit:ai/literature_synthesis'], phase: 'B', action: 'transplant', flow, payload: { item: 0, dest } });
    },
    [showToast, t, lang, actor],
  );

  // ── mobile (read-only) ───────────────────────────────────────────────
  if (isMobile) return <MobileShell />;

  // ── desktop shell (1440×900, scaled to viewport) ─────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#E4DAC2', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
      <div style={{ position: 'fixed', top: 16, right: 20, zIndex: 200, display: 'flex', gap: 10, alignItems: 'center' }}>
        <SessionBadge />
        <LangToggle />
      </div>

      <div className="fi-stage" style={{ width: 1440, height: 900, border: '1.5px solid #3A342B', padding: 5, background: '#F2EAD8', boxShadow: '0 18px 50px rgba(58,48,36,.18)', transform: `scale(${scale})`, transformOrigin: 'top center' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', border: '0.75px solid rgba(58,52,43,.5)', overflow: 'hidden', background: '#F2EAD8' }}>
          {wipe.view === 'island' && selSlug && selSlug !== SAMPLE_SLUG && (
            <GeneratedIslandScreen
              slug={selSlug}
              night={night}
              onToggleNight={() => setNight((v) => !v)}
              onBack={goChart}
              onStation={onStation}
            />
          )}
          {wipe.view === 'island' && (selSlug === SAMPLE_SLUG || !selSlug) && (
            <IslandScreen
              night={night}
              onToggleNight={() => setNight((v) => !v)}
              t={tval}
              onT={setTval}
              sel={sel}
              panel={panel}
              onStation={onStation}
              onClosePanel={() => setPanel(false)}
              onBack={goChart}
              stFilter={stFilter}
              onStFilter={setStFilter}
              driftOn={driftOn}
              driftDest={driftDest}
              transTo={transTo}
              onCloseDrift={() => {
                setDriftOn(false);
                setDriftDest(null);
              }}
              onMove={() => setDriftDest('choosing')}
              onToWorkshop={() => transplant('实验坊')}
              onToCanvas={() => transplant('白板厅')}
              briefSt={briefSt}
              onAdopt={onAdopt}
              onReturn={onReturn}
              qs={qs}
              voted={voted}
              focusIdx={focusIdx}
              advOn={advOn}
              onCloseAdv={() => setAdvOn(false)}
              onToggleQ={onToggleQ}
              onVoteQ={onVoteQ}
              onFocus={onFocus}
              peers={peers}
            />
          )}

          {wipe.view === 'chart' && (
            <ChartScreen
              islands={chartIslands}
              filter={filter}
              onFilter={setFilter}
              hover={hover}
              onHover={setHover}
              onIsland={onIsland}
              onBuild={() => dispatchCeremony({ type: 'start' })}
              onCollide={() => setCollideOn(true)}
              onBridge={onBridge}
            />
          )}

          {/* D2 渡船 — a ferry sails across the chart before the wipe to L1 */}
          {sailing && sailingPos && (
            <svg viewBox="0 0 1440 900" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }}>
              <g style={{ transform: `translate(${sailingPos.x}px, ${sailingPos.y}px)` }}>
                <path d="M -40 8 Q -20 4 0 8 Q 20 12 40 8" stroke="#BFCEDB" strokeWidth="1.5" fill="none" opacity="0.6" strokeDasharray="3 4" />
                <Boat x={0} y={0} variant="sail" bobSeconds={1.2} />
              </g>
            </svg>
          )}

          {ceremony.rit !== null && (
            <CeremonyOverlay state={ceremony} dispatch={dispatchCeremony} onAbort={abortCeremony} onFinish={() => dispatchCeremony({ type: 'finish' })} />
          )}

          {collideOn && (
            <CollisionOverlay onCollide={onCollide} onClose={() => setCollideOn(false)} />
          )}

          {wipe.wipeOn && <ScrollWipe wipeTf={wipe.wipeTf} wipeTrans={wipe.wipeTrans} />}

          <Toast text={toast} on={toastOn} />
        </div>
      </div>

      <div style={{ marginTop: 10, fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 11, color: '#8C8270' }}>
        {t('island.devFooter', { n: DATA.length, slug: SAMPLE_SLUG })}
      </div>
    </div>
  );
}

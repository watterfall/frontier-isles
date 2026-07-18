import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MODEL_FAMILIES, modelFamily, normalizeModelLaunch } from '../../models/catalog';
import {
  advanceOscillators,
  createOscillatorState,
  oscillatorOrder,
  type OscillatorState,
} from '../../models/oscillators';
import {
  advanceScalarField,
  createScalarField,
  scalarFieldStats,
  type FieldSubstrateId,
  type ScalarFieldState,
} from '../../models/scalarField';
import type {
  ModelFamilyId,
  ModelLanguage,
  ModelLaunchContext,
  ModelPrediction,
  ModelRunObservation,
  ModelRunReceipt,
  ModelSubstrateId,
} from '../../models/types';
import { OscillatorVisual, ScalarFieldVisual } from './ModelVisuals';

interface ModelWorkbenchProps {
  lang: ModelLanguage;
  launch?: ModelLaunchContext | null;
  previousRuns?: readonly ModelRunReceipt[];
  onSave: (receipt: ModelRunReceipt) => void;
  onClose?: () => void;
  embedded?: boolean;
}

type Runtime =
  | { kind: 'synchronization'; state: OscillatorState; initial: number; steps: number }
  | { kind: 'shared-field'; state: ScalarFieldState; initial: number; steps: number };

const COPY = {
  zh: {
    kicker: '不是看答案', title: '亲手搭一个会跑的模型',
    intro: '先决定模型里有什么、它们怎样互相影响，再预测并运行。数学和代码藏在下面，需要时再看。',
    close: '回到地图', fromResearch: '从已有研究对照进入', savedRuns: '次已保存运行',
    chooseFamily: '选择一条可以反复使用的规律', sameRule: '同一条规则，换一个具体世界',
    putIn: '放进模型', canSee: '每个对象能看到', changes: '每一步怎样改变', watch: '我观察',
    parameters: '只改最关键的量', count: '个体数量', spread: '个体本来的节奏差异', coupling: '彼此影响强度', rate: '一次向邻居靠近多少',
    weak: '弱', strong: '强', narrow: '相近', wide: '差异大', slow: '小步', fast: '大步', newStart: '换一组起点',
    math: '看看 AI 代劳的数学', mathIntro: '页面上的对象和滑杆怎样进入方程',
    prediction: '运行前，先选你的预测', predictionHint: '没有预测就不能运行。重点不是猜对，而是看自己的模型是否支持这次判断。',
    syncPredictions: { increase: '会越来越整齐', stay: '不会明显改变', decrease: '会更分散' },
    fieldSpreadPredictions: { increase: '浓度极差会变小', stay: '浓度极差不会明显改变', decrease: '浓度极差会变大' },
    fieldResidualPredictions: { increase: '相邻位置的局部不平衡会变小', stay: '局部不平衡不会明显改变', decrease: '局部不平衡会变大' },
    run: '运行', pause: '暂停', continue: '继续', step: '单步看一次更新', reset: '重新开始', running: '模型正在更新', ready: '先做预测，然后运行', complete: '这次运行结束了',
    progress: '运行进度', result: '你实际看见了什么', matched: '结果与预测方向一致。', unmatched: '结果没有按预测方向变化；这正是要继续追问的地方。',
    coherence: '整体同步程度 R', spreadMetric: '浓度极差', residual: '邻域不平衡（方程残差）', from: '从', to: '变为',
    transfer: '不要重搭：把同一规则换到另一个领域', transferHint: '参数保留，解释和适用边界会改变。你需要重新预测。', tryNext: '用相同参数换成',
    boundary: '哪里不能照搬', boundaryHint: '用自己的话写下这个简化模型漏掉了什么。可以参考下面的科学边界，但不要只说“它们不一样”。', boundaryPlaceholder: '例如：这个模型只保留了相位，没有表示……', sourceBoundary: '这项现象的已知边界',
    save: '把这次运行放进考察札记', saved: '已保存到当前浏览器的考察札记', saveHint: '完成运行、做出预测，并写下至少 8 个字的适用边界后才能保存。',
    localOnly: '这是个人模型运行，不会自动成为研究证据或关系图连线。', sources: '核对模型来源与科学边界',
    listTwin: '图的文字读数',
  },
  en: {
    kicker: 'Do not just read an answer', title: 'Build a model you can run yourself',
    intro: 'Decide what exists and how it interacts, then predict and run. The mathematics and code stay below until you need them.',
    close: 'Back to the map', fromResearch: 'Opened from a recorded research comparison', savedRuns: 'saved runs',
    chooseFamily: 'Choose one rule you can reuse', sameRule: 'Keep one rule; change the concrete world',
    putIn: 'Put into the model', canSee: 'Each object can see', changes: 'How each step changes', watch: 'I observe',
    parameters: 'Change only the load-bearing quantities', count: 'Number of individuals', spread: 'Difference in their own rhythms', coupling: 'Strength of mutual influence', rate: 'How far one update moves toward neighbours',
    weak: 'weak', strong: 'strong', narrow: 'similar', wide: 'very different', slow: 'small step', fast: 'large step', newStart: 'Use a new starting state',
    math: 'See the mathematics AI handled', mathIntro: 'How the objects and controls on this page enter the equation',
    prediction: 'Before running, choose your prediction', predictionHint: 'The model cannot run without one. Being right is not the point; seeing whether your model supports the judgment is.',
    syncPredictions: { increase: 'They will become more coherent', stay: 'Little will change', decrease: 'They will spread apart' },
    fieldSpreadPredictions: { increase: 'The concentration range will shrink', stay: 'The concentration range will barely change', decrease: 'The concentration range will grow' },
    fieldResidualPredictions: { increase: 'Local neighbour imbalance will shrink', stay: 'Local imbalance will barely change', decrease: 'Local imbalance will grow' },
    run: 'Run', pause: 'Pause', continue: 'Continue', step: 'Watch one update', reset: 'Start again', running: 'The model is updating', ready: 'Make a prediction, then run', complete: 'This run is complete',
    progress: 'Run progress', result: 'What you actually observed', matched: 'The result moved in the predicted direction.', unmatched: 'The result did not move in the predicted direction; that is the next thing to investigate.',
    coherence: 'Group coherence R', spreadMetric: 'Concentration range', residual: 'Neighbour imbalance (equation residual)', from: 'from', to: 'to',
    transfer: 'Do not rebuild it: move the same rule into another field', transferHint: 'Parameters stay; interpretation and scientific limits change. Make a new prediction.', tryNext: 'Keep the parameters and try',
    boundary: 'What cannot be copied', boundaryHint: 'State in your own words what this simplified model leaves out. Use the scientific boundary below, but do more than say “they are different.”', boundaryPlaceholder: 'For example: this model keeps only phase and does not represent…', sourceBoundary: 'Known boundary for this phenomenon',
    save: 'Put this run in the field notebook', saved: 'Saved in this browser’s field notebook', saveHint: 'Complete a run, make a prediction, and write at least 8 characters about the limit before saving.',
    localOnly: 'This is a personal model run. It does not automatically become research evidence or a graph connection.', sources: 'Check the model sources and scientific limits',
    listTwin: 'Text reading of the visual',
  },
} as const;

const TARGET_STEPS: Record<ModelFamilyId, number> = { synchronization: 360, 'shared-field': 90 };

function createRuntime(familyId: ModelFamilyId, substrateId: ModelSubstrateId, count: number, spread: number, seed: number): Runtime {
  if (familyId === 'synchronization') {
    const state = createOscillatorState(count, spread, seed);
    return { kind: familyId, state, initial: oscillatorOrder(state.phases), steps: 0 };
  }
  const state = createScalarField(substrateId as FieldSubstrateId);
  const stats = scalarFieldStats(state);
  const initial = substrateId === 'diffusion' ? stats.spread : stats.residual;
  return { kind: familyId, state, initial, steps: 0 };
}

function advanceRuntime(runtime: Runtime, coupling: number, rate: number, steps: number): Runtime {
  if (runtime.kind === 'synchronization') {
    return {
      ...runtime,
      state: advanceOscillators(runtime.state, coupling, steps),
      steps: runtime.steps + steps,
    };
  }
  const state = advanceScalarField(runtime.state, rate, steps);
  return { ...runtime, state, steps: runtime.steps + steps };
}

function metricOf(runtime: Runtime, substrateId: ModelSubstrateId): number {
  if (runtime.kind === 'synchronization') return oscillatorOrder(runtime.state.phases);
  const stats = scalarFieldStats(runtime.state);
  return substrateId === 'diffusion' ? stats.spread : stats.residual;
}

function observationOf(runtime: Runtime, substrateId: ModelSubstrateId): ModelRunObservation {
  return {
    metric: runtime.kind === 'synchronization' ? 'coherence' : substrateId === 'diffusion' ? 'spread' : 'residual',
    initial: runtime.initial,
    final: metricOf(runtime, substrateId),
    steps: runtime.steps,
  };
}

function predictionMatches(familyId: ModelFamilyId, prediction: ModelPrediction, initial: number, final: number): boolean {
  const delta = final - initial;
  const threshold = familyId === 'synchronization' ? 0.08 : Math.max(0.005, Math.abs(initial) * 0.08);
  if (prediction === 'stay') return Math.abs(delta) <= threshold;
  if (familyId === 'shared-field') return prediction === 'increase' ? delta < -threshold : delta > threshold;
  return prediction === 'increase' ? delta > threshold : delta < -threshold;
}

function receiptId(): string {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `model-run-${Date.now()}`;
  } catch {
    return `model-run-${Date.now()}`;
  }
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

export function ModelWorkbench({ lang, launch, previousRuns = [], onSave, onClose, embedded = false }: ModelWorkbenchProps) {
  const copy = COPY[lang];
  const normalizedLaunch = useMemo(() => normalizeModelLaunch(launch), [launch]);
  const launchFamily = modelFamily(normalizedLaunch.familyId);
  const [familyId, setFamilyId] = useState<ModelFamilyId>(launchFamily.id);
  const [substrateId, setSubstrateId] = useState<ModelSubstrateId>(launchFamily.substrates[0]!.id);
  const [count, setCount] = useState(40);
  const [spread, setSpread] = useState(0.32);
  const [coupling, setCoupling] = useState(1.6);
  const [rate, setRate] = useState(0.7);
  const [seed, setSeed] = useState(17);
  const [runtime, setRuntime] = useState<Runtime>(() => createRuntime(launchFamily.id, launchFamily.substrates[0]!.id, 40, 0.32, 17));
  const [prediction, setPrediction] = useState<ModelPrediction | null>(null);
  const [boundary, setBoundary] = useState('');
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'complete'>('idle');
  const [saved, setSaved] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  const family = modelFamily(familyId);
  const substrate = family.substrates.find((item) => item.id === substrateId) ?? family.substrates[0]!;
  const targetSteps = TARGET_STEPS[familyId];
  const currentMetric = metricOf(runtime, substrate.id);
  const completed = status === 'complete' || runtime.steps >= targetSteps;
  const canSave = completed && prediction !== null && boundary.trim().length >= 8 && !saved;
  const predictionLabels = familyId === 'synchronization'
    ? copy.syncPredictions
    : substrate.id === 'diffusion'
      ? copy.fieldSpreadPredictions
      : copy.fieldResidualPredictions;
  const nextSubstrate = family.substrates[(family.substrates.findIndex((item) => item.id === substrate.id) + 1) % family.substrates.length]!;

  const resetReflection = () => {
    setPrediction(null);
    setBoundary('');
    setStatus('idle');
    setSaved(false);
  };

  const replaceRuntime = (nextFamily: ModelFamilyId, nextSubstrate: ModelSubstrateId, nextCount = count, nextSpread = spread, nextSeed = seed) => {
    setRuntime(createRuntime(nextFamily, nextSubstrate, nextCount, nextSpread, nextSeed));
    resetReflection();
  };

  const chooseFamily = (nextFamilyId: ModelFamilyId) => {
    const nextFamily = modelFamily(nextFamilyId);
    const nextSubstrate = nextFamily.substrates[0]!.id;
    setFamilyId(nextFamilyId);
    setSubstrateId(nextSubstrate);
    replaceRuntime(nextFamilyId, nextSubstrate);
  };

  const chooseSubstrate = (nextSubstrateId: ModelSubstrateId) => {
    setSubstrateId(nextSubstrateId);
    replaceRuntime(familyId, nextSubstrateId);
  };

  useEffect(() => {
    if (status !== 'running') return;
    const chunk = familyId === 'synchronization' ? 6 : 2;
    const timer = window.setInterval(() => {
      setRuntime((current) => {
        const remaining = Math.max(0, targetSteps - current.steps);
        return remaining ? advanceRuntime(current, coupling, rate, Math.min(chunk, remaining)) : current;
      });
    }, 45);
    return () => window.clearInterval(timer);
  }, [coupling, familyId, rate, status, targetSteps]);

  useEffect(() => {
    if (status === 'running' && runtime.steps >= targetSteps) setStatus('complete');
  }, [runtime.steps, status, targetSteps]);

  useEffect(() => {
    if (!onClose || !rootRef.current) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = rootRef.current;
    const focusable = () => [...root.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), summary, a[href]')]
      .filter((item) => (
        item.getClientRects().length > 0
        && item.getAttribute('aria-hidden') !== 'true'
        && (!item.closest('details:not([open])') || item.tagName === 'SUMMARY')
      ));
    window.setTimeout(() => focusable()[0]?.focus(), 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [onClose]);

  const run = () => {
    if (!prediction || completed) return;
    if (reducedMotion) {
      setRuntime((current) => advanceRuntime(current, coupling, rate, Math.max(0, targetSteps - current.steps)));
      setStatus('complete');
      return;
    }
    setStatus('running');
  };

  const step = () => {
    if (!prediction || completed) return;
    const chunk = familyId === 'synchronization' ? 6 : 1;
    setRuntime((current) => advanceRuntime(current, coupling, rate, Math.min(chunk, targetSteps - current.steps)));
    setStatus(runtime.steps + chunk >= targetSteps ? 'complete' : 'paused');
  };

  const reset = () => replaceRuntime(familyId, substrate.id);

  const save = () => {
    if (!canSave || !prediction) return;
    const observation = observationOf(runtime, substrate.id);
    onSave({
      id: receiptId(),
      familyId,
      substrateId: substrate.id,
      seed,
      parameters: familyId === 'synchronization'
        ? { count, spread, coupling, dt: 0.04 }
        : { width: runtime.kind === 'shared-field' ? runtime.state.width : 12, height: runtime.kind === 'shared-field' ? runtime.state.height : 12, rate },
      prediction,
      observation,
      boundary: boundary.trim().slice(0, 1200),
      language: lang,
      ...(normalizedLaunch.sourceStructureId ? { sourceStructureId: normalizedLaunch.sourceStructureId } : {}),
      ...(normalizedLaunch.sourceProblemSlugs?.length ? { sourceProblemSlugs: normalizedLaunch.sourceProblemSlugs.slice(0, 24) } : {}),
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
  };

  const observation = observationOf(runtime, substrate.id);
  const metricLabel = observation.metric === 'coherence' ? copy.coherence : observation.metric === 'spread' ? copy.spreadMetric : copy.residual;
  const matches = prediction ? predictionMatches(familyId, prediction, observation.initial, observation.final) : false;

  const workbench = (
    <section
      ref={rootRef}
      className="fi-model-workbench"
      data-embedded={embedded || undefined}
      role={onClose ? 'dialog' : 'region'}
      aria-modal={onClose ? true : undefined}
      aria-labelledby="fi-model-title"
      aria-describedby="fi-model-intro"
    >
      <header className="fi-model-head">
        <div>
          <small>{copy.kicker}</small>
          <h1 id="fi-model-title">{copy.title}</h1>
          <p id="fi-model-intro">{copy.intro}</p>
        </div>
        <aside>
          {normalizedLaunch.sourceStructureId && <span>{copy.fromResearch}</span>}
          <strong>{previousRuns.length} {copy.savedRuns}</strong>
          {onClose && <button type="button" onClick={onClose}>← {copy.close}</button>}
        </aside>
      </header>

      <nav className="fi-model-family-nav" aria-label={copy.chooseFamily}>
        <span>{copy.chooseFamily}</span>
        {MODEL_FAMILIES.map((item, index) => (
          <button type="button" key={item.id} aria-pressed={familyId === item.id} onClick={() => chooseFamily(item.id)}>
            <b>{String(index + 1).padStart(2, '0')}</b><span><strong>{item.shortTitle[lang]}</strong><small>{item.title[lang]}</small></span>
          </button>
        ))}
      </nav>

      <section className="fi-model-substrate-strip" aria-labelledby="fi-model-substrate-title">
        <header><small id="fi-model-substrate-title">{copy.sameRule}</small><strong>{family.sharedRule[lang]}</strong></header>
        <div>
          {family.substrates.map((item) => (
            <button type="button" key={item.id} aria-pressed={substrate.id === item.id} onClick={() => chooseSubstrate(item.id)}>
              <strong>{item.title[lang]}</strong><small>{item.question[lang]}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="fi-model-bench">
        <aside className="fi-model-build-sheet">
          <p>{family.invitation[lang]}</p>
          <ol className="fi-model-recipe">
            <li><b>1</b><span><small>{copy.putIn}</small><strong>{substrate.entity[lang]}</strong></span></li>
            <li><b>2</b><span><small>{copy.canSee}</small><strong>{family.perception[lang]}</strong></span></li>
            <li><b>3</b><span><small>{copy.changes}</small><strong>{substrate.interaction[lang]}</strong></span></li>
            <li><b>4</b><span><small>{copy.watch}</small><strong>{substrate.observable[lang]}</strong></span></li>
          </ol>

          <fieldset className="fi-model-parameters">
            <legend>{copy.parameters}</legend>
            {familyId === 'synchronization' ? (
              <>
                <label><span>{copy.count}<b>{count}</b></span><input type="range" min="16" max="64" step="4" value={count} onChange={(event) => { const value = Number(event.target.value); setCount(value); replaceRuntime(familyId, substrate.id, value, spread, seed); }} /></label>
                <label><span>{copy.spread}<b>{spread.toFixed(2)}</b></span><input type="range" min="0" max="0.8" step="0.04" value={spread} onChange={(event) => { const value = Number(event.target.value); setSpread(value); replaceRuntime(familyId, substrate.id, count, value, seed); }} /><small>{copy.narrow}<i />{copy.wide}</small></label>
                <label><span>{copy.coupling}<b>{coupling.toFixed(1)}</b></span><input type="range" min="0" max="4" step="0.1" value={coupling} onChange={(event) => { setCoupling(Number(event.target.value)); replaceRuntime(familyId, substrate.id); }} /><small>{copy.weak}<i />{copy.strong}</small></label>
              </>
            ) : (
              <label><span>{copy.rate}<b>{rate.toFixed(2)}</b></span><input type="range" min="0.1" max="0.95" step="0.05" value={rate} onChange={(event) => { setRate(Number(event.target.value)); replaceRuntime(familyId, substrate.id); }} /><small>{copy.slow}<i />{copy.fast}</small></label>
            )}
            <button type="button" onClick={() => { const next = seed + 101; setSeed(next); replaceRuntime(familyId, substrate.id, count, spread, next); }}>{copy.newStart} ↻</button>
          </fieldset>

          <details className="fi-model-equation">
            <summary>{copy.math}</summary>
            <small>{copy.mathIntro}</small>
            <code>{family.equation}</code>
            <p>{family.equationKey[lang]}</p>
          </details>
        </aside>

        <main className="fi-model-running-sheet">
          <header>
            <div><small>{family.shortTitle[lang]}</small><h2>{substrate.title[lang]}</h2></div>
            <span>{metricLabel}<strong>{currentMetric.toFixed(3)}</strong></span>
          </header>
          {runtime.kind === 'synchronization'
            ? <OscillatorVisual state={runtime.state} substrateId={substrate.id} lang={lang} />
            : <ScalarFieldVisual state={runtime.state} lang={lang} />}
          <div className="fi-model-run-controls">
            <progress max={targetSteps} value={Math.min(targetSteps, runtime.steps)} aria-label={copy.progress} />
            <div>
              <button type="button" className="is-primary" disabled={!prediction || completed} onClick={status === 'running' ? () => setStatus('paused') : run}>{status === 'running' ? copy.pause : status === 'paused' ? copy.continue : copy.run}</button>
              <button type="button" disabled={!prediction || completed || status === 'running'} onClick={step}>{copy.step}</button>
              <button type="button" onClick={reset}>{copy.reset}</button>
            </div>
            <p aria-live="polite">{status === 'running' ? copy.running : completed ? copy.complete : prediction ? copy.ready : copy.predictionHint}</p>
          </div>
        </main>

        <aside className="fi-model-reflection-sheet">
          <section className="fi-model-prediction">
            <small>01</small><h2>{copy.prediction}</h2><p>{copy.predictionHint}</p>
            <div>
              {(Object.keys(predictionLabels) as ModelPrediction[]).map((item) => (
                <button type="button" key={item} aria-pressed={prediction === item} disabled={runtime.steps > 0} onClick={() => { setPrediction(item); setSaved(false); }}>{predictionLabels[item]}</button>
              ))}
            </div>
          </section>

          <section className="fi-model-result" data-ready={completed || undefined}>
            <small>02</small><h2>{copy.result}</h2>
            {completed ? (
              <>
                <p><strong>{metricLabel}</strong> {copy.from} <b>{observation.initial.toFixed(3)}</b> {copy.to} <b>{observation.final.toFixed(3)}</b>。</p>
                <em data-matched={matches || undefined}>{matches ? copy.matched : copy.unmatched}</em>
                <div className="fi-model-transfer">
                  <strong>{copy.transfer}</strong><p>{copy.transferHint}</p>
                  <button type="button" onClick={() => chooseSubstrate(nextSubstrate.id)}>{copy.tryNext}「{nextSubstrate.title[lang]}」→</button>
                </div>
              </>
            ) : <p>{lang === 'zh' ? '运行结束后，这里会把初始读数和最终读数放在一起。' : 'After the run, the initial and final readings will appear here together.'}</p>}
          </section>

          <section className="fi-model-boundary-note">
            <small>03</small><h2>{copy.boundary}</h2><p>{copy.boundaryHint}</p>
            <label><span className="sr-only">{copy.boundary}</span><textarea rows={5} maxLength={1200} value={boundary} onChange={(event) => { setBoundary(event.target.value); setSaved(false); }} placeholder={copy.boundaryPlaceholder} /></label>
            <details><summary>{copy.sourceBoundary}</summary><p>{substrate.boundary[lang]}</p><a href={substrate.source.url} target="_blank" rel="noopener noreferrer">{substrate.source.title} ↗</a></details>
          </section>

          <section className="fi-model-save">
            <button type="button" disabled={!canSave} onClick={save}>{saved ? copy.saved : copy.save}</button>
            <p>{saved ? copy.saved : copy.saveHint}</p>
            <small>{copy.localOnly}</small>
          </section>
        </aside>
      </div>

      <details className="fi-model-sources">
        <summary>{copy.sources}</summary>
        <ul>{family.sources.map((item) => <li key={item.url}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title} ↗</a></li>)}</ul>
      </details>
    </section>
  );

  if (embedded || typeof document === 'undefined') return workbench;
  return createPortal(<div className="fi-model-overlay">{workbench}</div>, document.body);
}

export default ModelWorkbench;

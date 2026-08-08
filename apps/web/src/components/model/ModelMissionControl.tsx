import { useState } from 'react';
import type { AgentRunBundle, MissionRunEvent } from '@frontier-isles/core/mission-runner';
import type {
  ModelLabMissionReceiptV1,
  ModelLabTrialV1,
  SynchronizationModelLabObjectiveV1,
} from '../../models/modelMission';
import type { ModelFamilyId, ModelLanguage, ModelSubstrateId } from '../../models/types';
import { toMissionEvidence, type ModelLabMissionEvidenceV1 } from '../../state/missionEvidence';

interface ModelMissionControlProps {
  lang: ModelLanguage;
  familyId: ModelFamilyId;
  substrateId: ModelSubstrateId;
  substrateTitle: string;
  seed: number;
  count: number;
  spread: number;
  onChooseSynchronization: () => void;
  /** Completed investigations already in the field notebook, oldest first. */
  savedMissions?: readonly ModelLabMissionEvidenceV1[];
  /** Absent when the workbench is mounted without a notebook to write into. */
  onSaveMission?: (evidence: ModelLabMissionEvidenceV1) => void;
}
type MissionState =
  | { phase: 'idle' }
  | { phase: 'running' }
  | {
      phase: 'complete';
      receipt: ModelLabMissionReceiptV1;
      replayOk: boolean;
      events: readonly MissionRunEvent[];
    }
  | { phase: 'error'; message: string };

const COPY = {
  zh: {
    summaryKicker: 'AI-NATIVE · A2 受限调查',
    summary: '让调查者自己试、判断、修订',
    summaryHint: '本地确定性运行 · 展开后才加载',
    title: '同步阈值调查',
    intro: '调查者会按声明的耦合序列运行同一个模型。一次预测失败后，它可以修订下一步，但不能联网、写入账本或扩大权限。',
    autonomy: '自主级别', effect: '最高效果', modelRuns: '模型运行', wall: '最长时间',
    a2: 'A2 · 计划—运行—判断—修订', e1: 'E1 · 本地可逆计算', runLimit: '最多 4 次', wallLimit: '30 秒',
    objective: '当前任务', target: '寻找第一个让同步程度达到 0.82 的耦合强度',
    sequence: '声明序列 K = 0 → 0.2 → 2.8 → 4',
    run: '授权并运行这次受限调查', running: '正在加载本地执行器并逐次检验耦合强度…',
    unavailable: '这条 A2 调查目前只验证了同步模型。共享场仍可手动运行，但不会被包装成已经具备的自治能力。',
    chooseSync: '切换到同步规律，准备调查',
    done: '调查结束', failed: '调查未完成', clear: '清除本次轨迹', retry: '重新运行这次调查',
    stoppedBy: '停止原因', goalReached: '达到目标', plateau: '序列用尽', budgetExhausted: '预算耗尽', otherStop: '任务停止',
    failedPredictions: '失败预测', revisions: '计划修订', usedRuns: '实际运行', replay: '确定性复演', replayPassed: '全部一致', replayFailed: '存在差异',
    trials: '模型试验', trial: '试验', coupling: '耦合 K', reading: '同步程度', reached: '达到 0.82', notReached: '尚未达到',
    trace: '查看决策轨迹与事件序号', started: '接受受限任务', revised: '根据失败结果修订计划', stepStarted: '开始一次本地模型运行', stepSucceeded: '记录模型观察', stopped: '按声明条件停止',
    boundary: '这份轨迹只说明指定模型在指定参数下发生了什么。它保留为 model_observation，不会自动写入研究账本、生成关系连线或成为科学证据。',
    network: '0 次网络请求', writes: '0 次共享写入', grants: '0 项能力授予', local: '存入本浏览器的考察札记',
    error: '本地调查没有完成。请保留当前参数后重试。',
    saved: '已存入札记', history: '此前保存的调查', historyHint: '这些记录留在本浏览器的考察札记里，可随札记一起导出为 Markdown。重新打开页面后它们仍在，但依然只是模型观察。',
    historyRuns: '次运行', historyRevisions: '次修订',
  },
  en: {
    summaryKicker: 'AI-NATIVE · BOUNDED A2',
    summary: 'Let the investigator test, judge, and revise',
    summaryHint: 'Deterministic and local · loads only when opened',
    title: 'Synchronization threshold inquiry',
    intro: 'The investigator runs one model across a declared coupling sequence. It may revise after a failed prediction, but it cannot use the network, write to the ledger, or expand its authority.',
    autonomy: 'Autonomy', effect: 'Maximum effect', modelRuns: 'Model runs', wall: 'Time ceiling',
    a2: 'A2 · plan—run—judge—revise', e1: 'E1 · local reversible compute', runLimit: 'up to 4', wallLimit: '30 seconds',
    objective: 'Current mission', target: 'Find the first coupling strength that reaches coherence 0.82',
    sequence: 'Declared sequence K = 0 → 0.2 → 2.8 → 4',
    run: 'Authorize and run this bounded inquiry', running: 'Loading the local runner and testing each coupling strength…',
    unavailable: 'This A2 inquiry is verified only for synchronization models. Shared fields remain manually runnable and are not presented as an autonomous capability.',
    chooseSync: 'Switch to synchronization and prepare the inquiry',
    done: 'Inquiry complete', failed: 'Inquiry incomplete', clear: 'Clear this trace', retry: 'Run this inquiry again',
    stoppedBy: 'Stop reason', goalReached: 'Goal reached', plateau: 'Sequence exhausted', budgetExhausted: 'Budget exhausted', otherStop: 'Mission stopped',
    failedPredictions: 'Failed predictions', revisions: 'Plan revisions', usedRuns: 'Runs used', replay: 'Deterministic replay', replayPassed: 'all matched', replayFailed: 'difference found',
    trials: 'Model trials', trial: 'Trial', coupling: 'Coupling K', reading: 'Coherence', reached: 'Reached 0.82', notReached: 'Not reached',
    trace: 'Inspect the decision trace and event sequence', started: 'Accepted the bounded mission', revised: 'Revised the plan from a failed result', stepStarted: 'Started one local model run', stepSucceeded: 'Recorded a model observation', stopped: 'Stopped at a declared condition',
    boundary: 'This trace only reports what the specified model did under the specified parameters. It remains a model_observation and does not become ledger evidence, a graph connection, or a scientific claim.',
    network: '0 network requests', writes: '0 shared writes', grants: '0 capability grants', local: 'Saved to this browser’s field notebook',
    error: 'The local inquiry did not finish. Keep the current parameters and try again.',
    saved: 'Saved to the notebook', history: 'Earlier saved inquiries', historyHint: 'These records stay in this browser’s field notebook and export with it as Markdown. They survive a reload, and they remain model observations.',
    historyRuns: 'runs', historyRevisions: 'revisions',
  },
} as const;

function objectiveFor(
  substrateId: ModelSubstrateId,
  seed: number,
  count: number,
  spread: number,
): SynchronizationModelLabObjectiveV1 {
  return {
    version: 1,
    id: `visible-sync-${substrateId}-${seed}-${count}-${Math.round(spread * 1_000)}`,
    substrateId: substrateId as SynchronizationModelLabObjectiveV1['substrateId'],
    seed,
    count,
    spread,
    dt: 0.04,
    steps: 700,
    prediction: 'increase',
    targetFinal: 0.82,
    couplingCandidates: [0, 0.2, 2.8, 4],
  };
}

function stopLabel(reason: ModelLabMissionReceiptV1['stopReason'], lang: ModelLanguage): string {
  const copy = COPY[lang];
  if (reason === 'goal_reached') return copy.goalReached;
  if (reason === 'plateau') return copy.plateau;
  if (reason === 'budget_exhausted') return copy.budgetExhausted;
  return copy.otherStop;
}

function eventLabel(event: MissionRunEvent, lang: ModelLanguage): string {
  const copy = COPY[lang];
  if (event.type === 'mission_started' || event.type === 'mission_resumed') return copy.started;
  if (event.type === 'plan_revised') return copy.revised;
  if (event.type === 'step_started') return copy.stepStarted;
  if (event.type === 'step_succeeded' || event.type === 'step_reused') return copy.stepSucceeded;
  return copy.stopped;
}

function eventDetail(event: MissionRunEvent): string {
  if (event.type === 'plan_revised') return event.detail.reason;
  if ('stepId' in event.detail) return event.detail.stepId;
  if (event.type === 'mission_stopped') return event.detail.reason;
  return event.type;
}

function missionTrace(events: readonly MissionRunEvent[]): readonly MissionRunEvent[] {
  return events.filter((event) => (
    event.type === 'mission_started'
    || event.type === 'mission_resumed'
    || event.type === 'plan_revised'
    || event.type === 'step_started'
    || event.type === 'step_succeeded'
    || event.type === 'step_reused'
    || event.type === 'mission_stopped'
  ));
}

export function ModelMissionControl({
  lang,
  familyId,
  substrateId,
  substrateTitle,
  seed,
  count,
  spread,
  onChooseSynchronization,
  savedMissions = [],
  onSaveMission,
}: ModelMissionControlProps) {
  const copy = COPY[lang];
  const [state, setState] = useState<MissionState>({ phase: 'idle' });
  const supported = familyId === 'synchronization';

  const run = async () => {
    if (!supported || state.phase === 'running') return;
    setState({ phase: 'running' });
    try {
      const mission = await import('../../models/modelMission');
      const objective = objectiveFor(substrateId, seed, count, spread);
      const bundle: AgentRunBundle<ModelLabTrialV1> = await mission.runModelLabMission(objective);
      const receipt = mission.createModelLabReceipt(objective, bundle);
      const replay = mission.replayModelLabBundle(bundle);
      setState({ phase: 'complete', receipt, replayOk: replay.ok, events: missionTrace(bundle.events) });
      // The notebook stores evidence, not resume authority: the projection drops
      // the contract, events, and step inputs the runner would need to continue.
      onSaveMission?.(toMissionEvidence(receipt, replay.ok));
    } catch (error) {
      setState({ phase: 'error', message: error instanceof Error ? error.message : copy.error });
    }
  };

  const statusText = state.phase === 'running'
    ? copy.running
    : state.phase === 'complete'
      ? copy.done
      : state.phase === 'error'
        ? copy.failed
        : copy.summaryHint;

  return (
    <details className="fi-model-mission" data-phase={state.phase}>
      <summary>
        <span><small>{copy.summaryKicker}</small><strong>{copy.summary}</strong></span>
        <em>{statusText}</em>
      </summary>
      <div className="fi-model-mission-body">
        <header>
          <small>A2 / E1 · {substrateTitle}</small>
          <h2>{copy.title}</h2>
          <p>{copy.intro}</p>
          <dl className="fi-model-mission-limits">
            <div><dt>{copy.autonomy}</dt><dd>{copy.a2}</dd></div>
            <div><dt>{copy.effect}</dt><dd>{copy.e1}</dd></div>
            <div><dt>{copy.modelRuns}</dt><dd>{copy.runLimit}</dd></div>
            <div><dt>{copy.wall}</dt><dd>{copy.wallLimit}</dd></div>
          </dl>
          <p className="fi-model-mission-scope"><span>{copy.network}</span><span>{copy.writes}</span><span>{copy.grants}</span></p>
        </header>

        <section className="fi-model-mission-run" aria-live="polite" aria-busy={state.phase === 'running'}>
          {!supported ? (
            <>
              <p>{copy.unavailable}</p>
              <button type="button" onClick={onChooseSynchronization}>{copy.chooseSync}</button>
            </>
          ) : state.phase === 'idle' ? (
            <>
              <small>{copy.objective}</small>
              <h3>{copy.target}</h3>
              <p>{copy.sequence}</p>
              <button type="button" className="is-primary" onClick={run}>{copy.run}</button>
            </>
          ) : state.phase === 'running' ? (
            <p className="fi-model-mission-running">{copy.running}</p>
          ) : state.phase === 'error' ? (
            <>
              <strong>{copy.failed}</strong>
              <p>{copy.error}</p>
              <code>{state.message}</code>
              <button type="button" onClick={run}>{copy.retry}</button>
            </>
          ) : (
            <>
              <div className="fi-model-mission-result">
                <span><small>{copy.stoppedBy}</small><strong>{stopLabel(state.receipt.stopReason, lang)}</strong></span>
                <span><small>{copy.failedPredictions}</small><strong>{state.receipt.failedPredictions}</strong></span>
                <span><small>{copy.revisions}</small><strong>{state.receipt.revisions}</strong></span>
                <span><small>{copy.usedRuns}</small><strong>{state.receipt.usage.modelRuns}/4</strong></span>
                <span><small>{copy.replay}</small><strong>{state.replayOk ? copy.replayPassed : copy.replayFailed}</strong></span>
              </div>

              <section className="fi-model-mission-trials" aria-labelledby="fi-model-mission-trials-title">
                <h3 id="fi-model-mission-trials-title">{copy.trials}</h3>
                <ol>
                  {state.receipt.trials.map((trial) => (
                    <li key={trial.spec.id}>
                      <b>{String(trial.trial).padStart(2, '0')}</b>
                      <span><small>{copy.coupling}</small><strong>{trial.spec.parameters.coupling.toFixed(1)}</strong></span>
                      <span><small>{copy.reading}</small><strong>{trial.observation.initial.toFixed(3)} → {trial.observation.final.toFixed(3)}</strong></span>
                      <em data-reached={trial.targetReached || undefined}>{trial.targetReached ? copy.reached : copy.notReached}</em>
                    </li>
                  ))}
                </ol>
              </section>

              <details className="fi-model-mission-trace">
                <summary>{copy.trace}</summary>
                <ol>
                  {state.events.map((event) => (
                    <li key={event.sequence}>
                      <b>{String(event.sequence).padStart(2, '0')}</b>
                      <span><strong>{eventLabel(event, lang)}</strong><small>{eventDetail(event)}</small></span>
                    </li>
                  ))}
                </ol>
              </details>

              <button type="button" onClick={() => setState({ phase: 'idle' })}>{copy.clear}</button>
            </>
          )}
          <footer><strong>{copy.local}</strong><span>{copy.boundary}</span></footer>
        </section>

        {savedMissions.length > 0 ? (
          <section className="fi-model-mission-history" aria-labelledby="fi-model-mission-history-title">
            <h3 id="fi-model-mission-history-title">{copy.history}</h3>
            <p>{copy.historyHint}</p>
            <ol>
              {[...savedMissions].reverse().map((mission) => (
                <li key={mission.missionId}>
                  <span>
                    <strong>{stopLabel(mission.stopReason, lang)}</strong>
                    <small>{mission.objectiveId}</small>
                  </span>
                  <em>
                    {mission.modelRuns} {copy.historyRuns} · {mission.revisions} {copy.historyRevisions} ·{' '}
                    {mission.replayOk ? copy.replayPassed : copy.replayFailed}
                  </em>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
    </details>
  );
}

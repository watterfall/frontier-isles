import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ModelMissionControl } from '../ModelMissionControl';
import type { ModelLabMissionEvidenceV1 } from '../../../state/missionEvidence';

const savedMission: ModelLabMissionEvidenceV1 = {
  version: 1,
  kind: 'model-lab-mission',
  missionId: 'mission://model-lab/saved-1',
  objectiveId: 'visible-sync-fireflies-17-40-320',
  status: 'completed',
  stopReason: 'goal_reached',
  startedAt: '2026-08-08T00:00:00.000Z',
  endedAt: '2026-08-08T00:00:02.400Z',
  revisions: 2,
  failedPredictions: 1,
  modelRuns: 3,
  wallMs: 2400,
  replayOk: true,
  trials: [],
  epistemicStatus: 'model_observation',
  ledgerEffect: 'none',
};

describe('ModelMissionControl', () => {
  it('declares bounded local authority before a synchronization mission can run', () => {
    const markup = renderToStaticMarkup(
      <ModelMissionControl
        lang="zh"
        familyId="synchronization"
        substrateId="fireflies"
        substrateTitle="萤火虫闪光"
        seed={17}
        count={40}
        spread={0.32}
        onChooseSynchronization={() => {}}
      />,
    );

    expect(markup).toContain('A2 受限调查');
    expect(markup).toContain('E1 · 本地可逆计算');
    expect(markup).toContain('0 次网络请求');
    expect(markup).toContain('0 次共享写入');
    expect(markup).toContain('授权并运行这次受限调查');
    expect(markup).toContain('不会自动写入研究账本');
    expect(markup).not.toContain('无人监管');
  });

  it('does not present shared-field models as an already verified autonomous capability', () => {
    const markup = renderToStaticMarkup(
      <ModelMissionControl
        lang="en"
        familyId="shared-field"
        substrateId="heat"
        substrateTitle="Heat conduction"
        seed={17}
        count={40}
        spread={0.32}
        onChooseSynchronization={() => {}}
      />,
    );

    expect(markup).toContain('verified only for synchronization models');
    expect(markup).toContain('Switch to synchronization and prepare the inquiry');
    expect(markup).not.toContain('Authorize and run this bounded inquiry');
  });

  it('shows inquiries already in the notebook without claiming they are session-only', () => {
    const markup = renderToStaticMarkup(
      <ModelMissionControl
        lang="zh"
        familyId="synchronization"
        substrateId="fireflies"
        substrateTitle="萤火虫闪光"
        seed={17}
        count={40}
        spread={0.32}
        onChooseSynchronization={() => {}}
        savedMissions={[savedMission]}
        onSaveMission={() => {}}
      />,
    );

    expect(markup).toContain('此前保存的调查');
    expect(markup).toContain('visible-sync-fireflies-17-40-320');
    expect(markup).toContain('3 次运行');
    expect(markup).toContain('2 次修订');
    expect(markup).toContain('存入本浏览器的考察札记');
    // The persisted state must not still be described as page-local.
    expect(markup).not.toContain('仅当前页面会话');
    // Persisting evidence must not upgrade its epistemic status.
    expect(markup).toContain('不会自动写入研究账本');
  });

  it('omits the saved-inquiry section when the notebook holds none', () => {
    const markup = renderToStaticMarkup(
      <ModelMissionControl
        lang="zh"
        familyId="synchronization"
        substrateId="fireflies"
        substrateTitle="萤火虫闪光"
        seed={17}
        count={40}
        spread={0.32}
        onChooseSynchronization={() => {}}
      />,
    );

    expect(markup).not.toContain('此前保存的调查');
    expect(markup).not.toContain('fi-model-mission-history');
  });
});

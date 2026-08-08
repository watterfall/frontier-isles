import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ModelMissionControl } from '../ModelMissionControl';

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
});

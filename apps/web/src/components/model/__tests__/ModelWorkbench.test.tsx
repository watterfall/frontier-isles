import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ModelWorkbench } from '../ModelWorkbench';

describe('ModelWorkbench', () => {
  it('starts from learner decisions rather than an answer or graph vocabulary', () => {
    const markup = renderToStaticMarkup(
      <ModelWorkbench lang="zh" embedded onSave={() => {}} previousRuns={[]} />,
    );
    expect(markup).toContain('亲手搭一个会跑的模型');
    expect(markup).toContain('放进模型');
    expect(markup).toContain('每个对象能看到');
    expect(markup).toContain('每一步怎样改变');
    expect(markup).toContain('我观察');
    expect(markup).toContain('运行前，先选你的预测');
    expect(markup).toContain('哪里不能照搬');
    expect(markup).not.toContain('连接场');
    expect(markup).not.toContain('共同核心');
  });

  it('puts four substrates on one synchronization rule and keeps the equation secondary', () => {
    const markup = renderToStaticMarkup(
      <ModelWorkbench lang="zh" embedded onSave={() => {}} launch={{ familyId: 'synchronization' }} />,
    );
    expect(markup).toContain('萤火虫闪光');
    expect(markup).toContain('心脏起搏细胞');
    expect(markup).toContain('观众鼓掌');
    expect(markup).toContain('交流电网锁频');
    expect(markup).toContain('<details class="fi-model-equation"');
    expect(markup).toContain('dθᵢ/dt');
    expect(markup).toContain('disabled=""');
  });

  it('keeps a text reading twin and local-not-evidence boundary', () => {
    const markup = renderToStaticMarkup(
      <ModelWorkbench lang="en" embedded onSave={() => {}} launch={{ familyId: 'shared-field' }} />,
    );
    expect(markup).toContain('Heat conduction');
    expect(markup).toContain('Material diffusion');
    expect(markup).toContain('Electrostatic potential');
    expect(markup).toContain('Ideal steady flow');
    expect(markup).toContain('Read this view as numbers');
    expect(markup).toContain('does not automatically become research evidence or a graph connection');
    expect(markup).toContain('Local neighbour imbalance will shrink');
    expect(markup).not.toContain('Spatial differences will shrink');
  });
});

import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { PassageWorkbench } from '../PassageWorkbench';
import { StructureLensPanel } from '../../chart/StructureLensPanel';
import { DATA, type IslandDatum } from '../../../api/fallback';
import { fallbackStructures } from '../../../api/structureFallback';
import { zh } from '../../../i18n/zh';
import { en } from '../../../i18n/en';

void i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh }, en: { translation: en } },
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
  returnNull: false,
});

const source = DATA.find((item) => item.slug === 'self-learning-matter')!;
const target = DATA.find((item) => item.slug === 'machine-curiosity')!;
const third: IslandDatum = DATA.find((item) => item.slug && item.slug !== source.slug && item.slug !== target.slug)!;
const intent = {
  structureId: 'struct://xfrontier/synchronization',
  islandSlug: source.slug!,
  islandOp: `op://frontier-isles/prob/${source.slug}`,
  targetIslandSlug: target.slug!,
  targetIslandOp: `op://frontier-isles/prob/${target.slug}`,
  passageKind: 'frontier' as const,
};

describe('connection validation workbench red-lines', () => {
  it('compares two concrete questions while keeping target fields blank and submit disabled', () => {
    const markup = renderToStaticMarkup(
      <PassageWorkbench
        intent={intent}
        source={source}
        target={target}
        actor="github:shen-kuo"
        lang="zh"
        onCancel={() => {}}
        onComplete={() => {}}
        onToast={() => {}}
      />,
    );
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain(`${source.n.zh} 与 ${target.n.zh}`);
    expect(markup).toContain(zh.island.passage.kind.frontier);
    expect(markup).toContain(source.q.zh);
    expect(markup).toContain(target.q.zh);
    expect(markup).toContain(zh.island.passage.sharedCore);
    expect(markup).toContain('系统不会替你判断');
    expect(markup).not.toContain('fi-passage-workbench-steps');
    expect(markup).not.toContain('fi-ferryman-boundary');
    expect(markup).toMatch(/type="submit"[^>]*disabled/);
    expect(markup).not.toContain('自调电阻网络中相邻节点');
  });

  it('gates every destination action on an explicit rebuilt departure', () => {
    const structures = fallbackStructures();
    const active = structures.find((item) => item.id === intent.structureId)!;
    const rows = [
      { d: source, islandOp: intent.islandOp, weight: 1, actors: ['github:shen-kuo'] },
      { d: target, islandOp: intent.targetIslandOp, weight: 1, actors: ['github:other'] },
    ];
    const gap = [{ d: third, islandOp: `op://frontier-isles/prob/${third.slug}` }];
    const withoutDeparture = renderToStaticMarkup(
      <StructureLensPanel
        structures={[active]}
        selected={active.id}
        onSelect={() => {}}
        rebuilt={rows}
        nearGaps={gap}
        farGaps={[]}
        departure={null}
        intent={null}
        onDeparture={() => {}}
        onPassage={() => {}}
        onEnter={() => {}}
      />,
    );
    expect(withoutDeparture).toMatch(/data-kind="frontier"[^>]*disabled/);

    const withDeparture = renderToStaticMarkup(
      <StructureLensPanel
        structures={[active]}
        selected={active.id}
        onSelect={() => {}}
        rebuilt={rows}
        nearGaps={gap}
        farGaps={[]}
        departure={{ structureId: active.id, islandSlug: source.slug!, islandOp: intent.islandOp }}
        intent={null}
        onDeparture={() => {}}
        onPassage={() => {}}
        onEnter={() => {}}
      />,
    );
    expect(withDeparture).toContain(zh.chart.structures.rewalkCharted);
    expect(withDeparture).toContain(zh.chart.structures.openFrontier);
    expect(withDeparture).not.toMatch(/data-kind="frontier"[^>]*disabled/);
  });

  it('organizes structures into verified theme routes and exposes active provenance without inventing edges', () => {
    const structures = fallbackStructures();
    const active = structures.find((item) => item.id === 'struct://xfrontier/synchronization')!;
    const markup = renderToStaticMarkup(
      <StructureLensPanel
        structures={structures}
        selected={active.id}
        onSelect={() => {}}
        rebuilt={[]}
        nearGaps={[]}
        farGaps={[]}
        departure={null}
        intent={null}
        onDeparture={() => {}}
        onPassage={() => {}}
        onEnter={() => {}}
      />,
    );
    for (const theme of Object.values(zh.chart.structures.theme)) expect(markup).toContain(theme);
    expect(markup).toContain('xfrontier.science');
    expect(markup).toContain('ISO-10');
    expect(markup).toContain('#231 · #1491');
    expect(markup).toContain(zh.chart.structures.pureFrontier);
    expect(markup).not.toContain('fi-structure-node');
  });
});

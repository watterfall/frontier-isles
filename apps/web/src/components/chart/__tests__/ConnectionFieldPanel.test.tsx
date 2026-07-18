import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DATA } from '../../../api/fallback';
import { fixtureSeaData } from '../../../api/seaFallback';
import { fallbackStructureGraph, fallbackStructures } from '../../../api/structureFallback';
import { buildConnectionField, type ConnectionField } from '../../../chart/connectionField';
import { ConnectionFieldPanel, type ConnectionFieldPanelProps } from '../ConnectionFieldPanel';

const base = buildConnectionField(fallbackStructures(), fallbackStructureGraph(), fixtureSeaData(), DATA);
const original = base.paths.find((path) => path.kind === 'evidence')!;
const targetRef = original.records[0]!.targetRef;
const responseRef = `sha256:${'c'.repeat(64)}`;
const evidence = {
  ro_crate: 'https://example.test/connection-evidence',
  role: 'replication' as const,
  hash: `sha256:${'d'.repeat(64)}`,
};

const field: ConnectionField = {
  ...base,
  paths: base.paths.map((path) => path.id === original.id ? {
    ...path,
    records: [{
      ...path.records[0]!,
      targetSummary: '活体导线的传输约束可以用耗散边界检验。',
      targetEvidence: { ...evidence, role: 'evidence' },
      responseRef,
      responseKind: 'note',
      responseBody: '热力学计算只在稳态近似下支持这次对应。',
      responseTest: '改变供能通量，比较导线传输和熵产生率是否同时越过临界点。',
      responseEvidence: evidence,
      actor: 'github:field-researcher',
      historical: false,
    }],
  } : path),
};

const props: ConnectionFieldPanelProps = {
  field,
  lang: 'zh',
  channel: 'evidence',
  focus: { type: 'path', id: original.id },
  visible: true,
  departure: null,
  intent: null,
  actor: 'github:shen-kuo',
  onChannel: () => {},
  onFocus: () => {},
  onVisible: () => {},
  onDeparture: () => {},
  onPassage: () => {},
  onEnter: () => {},
  onResponseRecorded: () => {},
};

describe('ConnectionFieldPanel — source-preserving dossier', () => {
  it('renders the claim, response, evidence, provenance, and discriminating test as separate steps', () => {
    const markup = renderToStaticMarkup(<ConnectionFieldPanel {...props} />);
    expect(markup).toContain('这条判断依据什么');
    expect(markup).toContain('活体导线的传输约束可以用耗散边界检验。');
    expect(markup).toContain('热力学计算只在稳态近似下支持这次对应。');
    expect(markup).toContain('改变供能通量，比较导线传输和熵产生率是否同时越过临界点。');
    expect(markup).toContain('@field-researcher');
    expect(markup).toContain(responseRef);
    expect(markup).toContain(evidence.hash);
  });

  it('keeps the write contract explicit instead of exposing a generic comment box', () => {
    const markup = renderToStaticMarkup(<ConnectionFieldPanel {...props} />);
    expect(markup).toContain('补充支持或反对的理由');
    expect(markup).toContain('你的判断');
    expect(markup).toContain('具体哪里支持或反对');
    expect(markup).toContain('什么结果会让你改变判断');
    expect(markup).toContain('证据来源（RO-Crate）');
    expect(markup).toContain('pattern="sha256:[0-9a-f]{64}"');
  });

  it('leads the global view with real studies and judgments instead of graph vocabulary', () => {
    const markup = renderToStaticMarkup(<ConnectionFieldPanel {...props} focus={null} channel="all" />);
    expect(markup).toContain('从别的研究里找办法');
    expect(markup).toContain('同一种办法，用在不同问题上');
    expect(markup).toContain('两项研究之间的具体判断');
    expect(markup).toContain('局部相互作用在网络上累积');
    expect(markup).toContain('活体导线 与 组合式科学建模');
    expect(markup).toContain('两项研究的材料得出不同判断');
    expect(markup).toContain('class="fi-connection-filters"');
    expect(markup).not.toContain('这些问题正在共享什么');
    expect(markup).not.toContain('地图线型');
    expect(markup).not.toContain('多问题汇聚');
    expect(markup).not.toContain('直接关系');
    expect(markup).not.toMatch(/\bw\d+\b/);
  });
});

describe('ConnectionFieldPanel — bridge-challenge v1 (correspondence responses)', () => {
  const bridgePath = base.paths.find((path) => path.kind === 'bridge')!;

  it('the fixture sea carries a real bridge path to exercise', () => {
    expect(bridgePath).toBeTruthy();
    expect(bridgePath.records.length).toBeGreaterThan(0);
  });

  it('opens the response form on a bridge path with concrete correspondence stances', () => {
    const markup = renderToStaticMarkup(
      <ConnectionFieldPanel {...props} channel="all" focus={{ type: 'path', id: bridgePath.id }} />,
    );
    expect(markup).toContain('补充支持或反对的理由');
    expect(markup).toContain('这次对应经得起检验');
    expect(markup).toContain('这次对应在此断裂');
  });

  it('mathematical and lineage paths stay read-only (their contracts are pending)', () => {
    const lineage = base.paths.find((path) => path.kind === 'lineage');
    if (!lineage) return; // fixture may not carry one; server tests still pin the API side
    const markup = renderToStaticMarkup(
      <ConnectionFieldPanel {...props} channel="all" focus={{ type: 'path', id: lineage.id }} />,
    );
    expect(markup).not.toContain('补充支持或反对的理由');
  });

  it('surfaces sibling signed responses about the bridge target with a focus jump', () => {
    const bridgeTarget = bridgePath.records[0]!.targetRef;
    const withResponse: ConnectionField = {
      ...base,
      paths: base.paths.map((path) =>
        path.kind === 'evidence'
          ? { ...path, records: [{ ...path.records[0]!, targetRef: bridgeTarget }] }
          : path,
      ),
    };
    const markup = renderToStaticMarkup(
      <ConnectionFieldPanel {...props} field={withResponse} channel="all" focus={{ type: 'path', id: bridgePath.id }} />,
    );
    expect(markup).toContain('关于这次对应的跨岛回应');
    expect(markup).toContain('查看这条回应');
  });
});

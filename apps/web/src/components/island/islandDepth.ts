import type { StationKind } from '@frontier-isles/core';
import type {
  Bilingual,
  DepthContent,
  IslandInterior,
  InteriorDebate,
  InteriorDigest,
  InteriorGalleryItem,
  InteriorQuestion,
  InteriorResident,
  InteriorScrap,
} from '@frontier-isles/data/frontiers';
import type { ApiStructure } from '../../api/client';
import type { IslandDistrictId } from '../../state/explorationSession';

export type FrontierProgram = 'unknowns' | 'sensing' | 'commons' | 'transfer' | 'simulation' | 'living';
export type DistrictSurveyState = 'surveyed' | 'available' | 'sealed';

export interface IslandDistrict {
  id: IslandDistrictId;
  name: Bilingual;
  functionName: Bilingual;
  description: Bilingual;
  stations: StationKind[];
  state: DistrictSurveyState;
  reason: Bilingual;
  structureCrossing: boolean;
}

export interface IslandDistrictProjection {
  program: FrontierProgram;
  programName: Bilingual;
  districts: IslandDistrict[];
}

export interface DistrictProjectionInput {
  slug: string;
  domain: '数理' | '物质' | '生命' | '交叉';
  cluster?: Bilingual;
  stage: number;
  status: string;
  stations: readonly StationKind[];
  ledgerActions: readonly string[];
  literatureCount: number;
  hasInterior: boolean;
  openQuestionCount: number;
  surveyed: readonly IslandDistrictId[];
  activeStructure?: ApiStructure | null;
  completedPassageCount?: number;
}

const PROGRAM_NAMES: Record<FrontierProgram, Bilingual> = {
  unknowns: { zh: '未知与异常', en: 'Unknowns & anomalies' },
  sensing: { zh: '观测与感知', en: 'Observation & sensing' },
  commons: { zh: '知识公地', en: 'Knowledge commons' },
  transfer: { zh: '跨域方法', en: 'Cross-domain methods' },
  simulation: { zh: '模型与反事实', en: 'Models & counterfactuals' },
  living: { zh: '活体与基底', en: 'Living substrates' },
};

const PROGRAM_PATTERNS: Array<[FrontierProgram, RegExp]> = [
  ['unknowns', /无知|盲区|未知|异常|缺席|负空间|暗物质|好奇|ignorance|unknown|anomal|absence|negative.space|curiosity/i],
  ['sensing', /传感|感知|环境组学|地球|海洋|深时|空间科学|biosens|sensing|planetary|earth|ocean|deep.time/i],
  ['commons', /开放科学|去中心科学|知识基础|形式科学|元科学|集体智能|open science|decentral|knowledge infrastructure|formal science|metascience|collective intelligence/i],
  ['transfer', /跨域|方法移植|复杂系统|组合|可编程物质|cross.domain|transplant|complex systems|compositional|programmable matter/i],
  ['simulation', /数字孪生|因果科学|自主科学|自驱实验|AI4S|digital twin|causal science|autonomous discovery|self.driving lab|AI for science/i],
  ['living', /合成生物|生物计算|活体|生物电|微生物|类器官|synthetic bio|biocomput|living material|bioelect|microbiome|organoid/i],
];

const DOMAIN_PROGRAM: Record<DistrictProjectionInput['domain'], FrontierProgram> = {
  数理: 'commons',
  物质: 'transfer',
  生命: 'living',
  交叉: 'simulation',
};

export function frontierProgramOf(cluster: Bilingual | undefined, domain: DistrictProjectionInput['domain']): FrontierProgram {
  const text = `${cluster?.zh ?? ''} ${cluster?.en ?? ''}`;
  return PROGRAM_PATTERNS.find(([, pattern]) => pattern.test(text))?.[0] ?? DOMAIN_PROGRAM[domain];
}

const DISTRICT_STATIONS: Record<IslandDistrictId, StationKind[]> = {
  harbor: ['dock', 'tearoom'],
  inquiry: ['questions', 'canvas'],
  archive: ['library', 'data'],
  works: ['workshop', 'driftwood'],
  observatory: ['gallery'],
};

const DISTRICT_FUNCTIONS: Record<IslandDistrictId, Bilingual> = {
  harbor: { zh: '问题定位与连接', en: 'Problem orientation & connections' },
  inquiry: { zh: '问题与差异', en: 'Problems & differences' },
  archive: { zh: '证据与测量', en: 'Evidence & measures' },
  works: { zh: '方法与试验', en: 'Methods & trials' },
  observatory: { zh: '结果与下一步', en: 'Results & next steps' },
};

const DISTRICT_NAMES: Record<FrontierProgram, Record<IslandDistrictId, Bilingual>> = {
  unknowns: {
    harbor: { zh: '问题入口', en: 'Problem entry' }, inquiry: { zh: '异常对照区', en: 'Anomaly comparison' },
    archive: { zh: '缺口证据区', en: 'Gap evidence' }, works: { zh: '观测试验区', en: 'Observation trials' }, observatory: { zh: '下一问', en: 'Next question' },
  },
  sensing: {
    harbor: { zh: '观测入口', en: 'Observation entry' }, inquiry: { zh: '校准对照区', en: 'Calibration comparison' },
    archive: { zh: '观测证据区', en: 'Observation evidence' }, works: { zh: '仪器试验区', en: 'Instrument trials' }, observatory: { zh: '结果检验区', en: 'Result checks' },
  },
  commons: {
    harbor: { zh: '议题入口', en: 'Issue entry' }, inquiry: { zh: '分歧对照区', en: 'Disagreement comparison' },
    archive: { zh: '来源与协议', en: 'Sources & protocols' }, works: { zh: '协作试验区', en: 'Collaboration trials' }, observatory: { zh: '共同验证区', en: 'Shared verification' },
  },
  transfer: {
    harbor: { zh: '连接入口', en: 'Connection entry' }, inquiry: { zh: '问题对照区', en: 'Problem comparison' },
    archive: { zh: '机制与证据', en: 'Mechanisms & evidence' }, works: { zh: '方法试验区', en: 'Method trials' }, observatory: { zh: '交叉检验区', en: 'Cross-checks' },
  },
  simulation: {
    harbor: { zh: '模型入口', en: 'Model entry' }, inquiry: { zh: '假设对照区', en: 'Hypothesis comparison' },
    archive: { zh: '模型与数据', en: 'Models & data' }, works: { zh: '反事实试验区', en: 'Counterfactual trials' }, observatory: { zh: '结果检验区', en: 'Result checks' },
  },
  living: {
    harbor: { zh: '问题入口', en: 'Problem entry' }, inquiry: { zh: '生长对照区', en: 'Growth comparison' },
    archive: { zh: '生命证据区', en: 'Living evidence' }, works: { zh: '活体试验区', en: 'Living trials' }, observatory: { zh: '基底检验区', en: 'Substrate checks' },
  },
};

const DISTRICT_DESCRIPTIONS: Record<IslandDistrictId, Bilingual> = {
  harbor: { zh: '先看清本岛的具体问题，以及它与其他问题已有的连接。', en: 'Start with this island’s concrete problem and its recorded connections to other problems.' },
  inquiry: { zh: '把主问题拆开，辨认争论、改写与仍未说清的边界。', en: 'Open the main question into disagreements, rewrites, and unresolved boundaries.' },
  archive: { zh: '检查文献、证据、数据与测量条件，不把热度当结论。', en: 'Inspect literature, evidence, data, and measurement conditions without treating attention as a verdict.' },
  works: { zh: '让方法、原型、失败物与跨域对应在这里接受动手检验。', en: 'Test methods, prototypes, failed pieces, and cross-domain correspondences by doing.' },
  observatory: { zh: '汇总已经得到的结果，明确下一处可证伪的问题。', en: 'Gather the results and name the next falsifiable question.' },
};

const REASONS = {
  surveyed: { zh: '已收入本地考察札记', en: 'Recorded in the local field notebook' },
  harbor: { zh: '先完成本岛问题定位', en: 'Orient to the island’s problem first' },
  inquiry: { zh: '先对照问题与关键差异', en: 'Compare the problem and its key differences first' },
  evidence: { zh: '岛上尚无可核验的文献、数据或账本证据', en: 'No verifiable literature, data, or ledger evidence is present yet' },
  making: { zh: '岛上尚无原型、工件或可检验的方法', en: 'No prototype, workpiece, or testable method is present yet' },
  deeper: { zh: '先检查证据并完成一次方法试验', en: 'Inspect the evidence and complete a method trial first' },
  horizon: { zh: '尚未形成明确的开放问题、连接或下一步', en: 'No clear open question, connection, or next step is present yet' },
  available: { zh: '材料与前置路径已具备，可勘察', en: 'Materials and prior path are present; ready to survey' },
} satisfies Record<string, Bilingual>;

export function projectIslandDistricts(input: DistrictProjectionInput): IslandDistrictProjection {
  const program = frontierProgramOf(input.cluster, input.domain);
  const surveyed = new Set(input.surveyed);
  const actions = new Set(input.ledgerActions);
  const evidence = input.hasInterior || input.literatureCount > 0 || [...actions].some((action) =>
    ['validate', 'refute', 'publish', 'rebuild', 'bridge_accept', 'attach_data'].includes(action),
  );
  const making = input.hasInterior || input.stage >= 1 || [...actions].some((action) =>
    ['propose_subquestion', 'submit_claim', 'transplant', 'return_to_driftwood', 'adopt', 'rebuild', 'create_driftwood'].includes(action),
  );
  const horizon = input.openQuestionCount > 0 || ['active', 'resolved'].includes(input.status)
    || !!input.activeStructure || (input.completedPassageCount ?? 0) > 0;
  const visible = new Set(input.stations);

  const stateOf = (id: IslandDistrictId): { state: DistrictSurveyState; reason: Bilingual } => {
    if (surveyed.has(id)) return { state: 'surveyed', reason: REASONS.surveyed };
    if (id === 'harbor') return { state: 'available', reason: REASONS.available };
    if (!surveyed.has('harbor')) return { state: 'sealed', reason: REASONS.harbor };
    if (id === 'inquiry') return { state: 'available', reason: REASONS.available };
    if (!surveyed.has('inquiry')) return { state: 'sealed', reason: REASONS.inquiry };
    if (id === 'archive') return evidence
      ? { state: 'available', reason: REASONS.available }
      : { state: 'sealed', reason: REASONS.evidence };
    if (id === 'works') return making
      ? { state: 'available', reason: REASONS.available }
      : { state: 'sealed', reason: REASONS.making };
    if (!surveyed.has('archive') || !surveyed.has('works')) return { state: 'sealed', reason: REASONS.deeper };
    return horizon ? { state: 'available', reason: REASONS.available } : { state: 'sealed', reason: REASONS.horizon };
  };

  const ids: IslandDistrictId[] = ['harbor', 'inquiry', 'archive', 'works', 'observatory'];
  return {
    program,
    programName: PROGRAM_NAMES[program],
    districts: ids.map((id) => ({
      id,
      name: DISTRICT_NAMES[program][id],
      functionName: DISTRICT_FUNCTIONS[id],
      description: DISTRICT_DESCRIPTIONS[id],
      stations: DISTRICT_STATIONS[id].filter((station) => visible.has(station)),
      ...stateOf(id),
      structureCrossing: !!input.activeStructure && ['harbor', 'works', 'observatory'].includes(id),
    })),
  };
}

export type BuildingFloorItem =
  | { kind: 'brief'; label: Bilingual; text: Bilingual }
  | { kind: 'question'; question: InteriorQuestion }
  | { kind: 'digest'; digest: InteriorDigest }
  | { kind: 'debate'; debate: InteriorDebate }
  | { kind: 'datum'; datum: { label: Bilingual; value: Bilingual; note?: Bilingual } }
  | { kind: 'scrap'; scrap: InteriorScrap }
  | { kind: 'gallery'; gallery: InteriorGalleryItem }
  | { kind: 'resident'; resident: InteriorResident }
  | { kind: 'structure'; structure: ApiStructure };

export interface BuildingFloor {
  id: string;
  level: number;
  title: Bilingual;
  subtitle: Bilingual;
  items: BuildingFloorItem[];
  source: 'island' | 'interior' | 'structure';
}

export interface BuildingFloorPlan {
  station: StationKind;
  floors: BuildingFloor[];
}

export interface BuildingFloorInput {
  station: StationKind;
  qfocus: Bilingual;
  brief?: Bilingual;
  depth?: DepthContent;
  citation?: { title: string; venue: string; year: number; url?: string };
  literature?: Array<{ title: string; venue: string; year: number; url: string }>;
  interior?: IslandInterior;
  activeStructure?: ApiStructure | null;
  ledgerStats?: { events: number; validates: number; refutes: number; rebuilds: number };
}

const STATION_PURPOSE: Record<StationKind, Bilingual> = {
  questions: { zh: '主问题与仍未关闭的边界', en: 'The central question and boundaries still open' },
  library: { zh: '可追溯文献与论证谱系', en: 'Traceable literature and argument lineages' },
  canvas: { zh: '冲突假设、硬张力与可组合路径', en: 'Competing hypotheses, hard tensions, and composable paths' },
  data: { zh: '可核验测量与账本读数', en: 'Verifiable measures and ledger readouts' },
  workshop: { zh: '正在尝试的方法与原型', en: 'Methods and prototypes being tried' },
  gallery: { zh: '已展出的结果与下一处远景', en: 'Exhibited results and the next horizon' },
  tearoom: { zh: '未定型想法、异议与跨域讨论', en: 'Unformed ideas, objections, and cross-domain discussion' },
  driftwood: { zh: '失败物、退回物与仍有价值的碎片', en: 'Failures, returned work, and fragments still worth keeping' },
  dock: { zh: '参与者、已记录连接与待检验对应', en: 'Participants, recorded connections, and correspondences to test' },
};

const FLOOR_TITLES: Record<StationKind, Bilingual> = {
  questions: { zh: '问题基底层', en: 'Question ground' }, library: { zh: '引文门厅', en: 'Citation hall' },
  canvas: { zh: '张力基底层', en: 'Tension ground' }, data: { zh: '测量基底层', en: 'Measure ground' },
  workshop: { zh: '试作基底层', en: 'Prototype ground' }, gallery: { zh: '展望基底层', en: 'Horizon ground' },
  tearoom: { zh: '讨论入口层', en: 'Discussion entry' }, driftwood: { zh: '散木基底层', en: 'Driftwood ground' },
  dock: { zh: '连接记录层', en: 'Connection records' },
};

const roman = (index: number): string => ['一', '二', '三', '四', '五', '六', '七', '八'][index] ?? String(index + 1);
const bi = (zh: string, en: string): Bilingual => ({ zh, en });

function chunks<T>(items: readonly T[], size = 2): Array<{ start: number; items: T[] }> {
  const result: Array<{ start: number; items: T[] }> = [];
  for (let start = 0; start < items.length; start += size) result.push({ start, items: items.slice(start, start + size) });
  return result;
}

function baseline(input: BuildingFloorInput): BuildingFloorItem[] {
  const { station, qfocus, brief, depth, ledgerStats } = input;
  if (station === 'questions') return [{ kind: 'brief', label: bi('QFocus', 'QFocus'), text: qfocus }];
  if (station === 'library') return [{ kind: 'brief', label: bi('论证入口', 'Argument entry'), text: depth?.overview ?? brief ?? qfocus }];
  if (station === 'canvas') return [{ kind: 'brief', label: bi('最硬张力', 'Hardest tension'), text: depth?.barrier ?? qfocus }];
  if (station === 'data') {
    const stats = ledgerStats ?? { events: 0, validates: 0, refutes: 0, rebuilds: 0 };
    return [{
      kind: 'datum',
      datum: {
        label: bi('当前账本投影', 'Current ledger projection'),
        value: bi(`${stats.events} 事件`, `${stats.events} events`),
        note: bi(`${stats.validates} 验证 · ${stats.refutes} 反证 · ${stats.rebuilds} 结构重建`, `${stats.validates} validates · ${stats.refutes} refutes · ${stats.rebuilds} structure rebuilds`),
      },
    }];
  }
  if (station === 'workshop') return [{ kind: 'brief', label: bi('当前进路', 'Current approach'), text: depth?.approaches[0] ?? brief ?? qfocus }];
  if (station === 'gallery') return [{ kind: 'brief', label: bi('若被回答', 'If answered'), text: depth?.ifAnswered ?? brief ?? qfocus }];
  if (station === 'driftwood') return [{ kind: 'brief', label: bi('保留的硬骨头', 'Kept hard problem'), text: depth?.barrier ?? brief ?? qfocus }];
  if (station === 'tearoom') return [{ kind: 'brief', label: bi('岛上近况', 'Island context'), text: brief ?? qfocus }];
  return [{ kind: 'brief', label: bi('本岛问题', 'Island problem'), text: qfocus }];
}

function pushFloor(
  floors: BuildingFloor[], id: string, title: Bilingual, subtitle: Bilingual,
  items: BuildingFloorItem[], source: BuildingFloor['source'],
): void {
  if (items.length === 0 || floors.some((floor) => floor.id === id)) return;
  floors.push({ id, level: floors.length + 1, title, subtitle, items, source });
}

export function projectBuildingFloors(input: BuildingFloorInput): BuildingFloorPlan {
  const floors: BuildingFloor[] = [];
  const { station, interior, depth } = input;
  pushFloor(floors, `${station}:ground`, FLOOR_TITLES[station], STATION_PURPOSE[station], baseline(input), 'island');

  if (station === 'questions') {
    const rich = interior?.questions ?? [];
    const groups: Array<[string, Bilingual, InteriorQuestion[]]> = [
      ['open', bi('开放问层', 'Open questions'), rich.filter((q) => q.open && !q.rewrittenFrom)],
      ['rewrite', bi('改写层', 'Reframed questions'), rich.filter((q) => !!q.rewrittenFrom)],
      ['closed', bi('暂结层', 'Provisionally closed'), rich.filter((q) => !q.open && !q.rewrittenFrom)],
    ];
    for (const [group, title, questions] of groups) chunks(questions).forEach(({ start, items }, index) =>
      pushFloor(floors, `${station}:${group}:${start}`, { zh: `${title.zh}${questions.length > 2 ? roman(index) : ''}`, en: `${title.en}${questions.length > 2 ? ` ${index + 1}` : ''}` }, STATION_PURPOSE[station], items.map((question) => ({ kind: 'question', question })), 'interior'));
    if (rich.length === 0) chunks(depth?.subQuestions ?? []).forEach(({ start, items }, index) =>
      pushFloor(floors, `${station}:subquestion:${start}`, bi(`子问层${roman(index)}`, `Subquestions ${index + 1}`), STATION_PURPOSE[station], items.map((text) => ({ kind: 'brief', label: bi('开放子问', 'Open subquestion'), text })), 'island'));
  }

  if (station === 'library') {
    chunks(interior?.digests ?? []).forEach(({ start, items }, index) =>
      pushFloor(floors, `${station}:digest:${start}`, bi(`论证书架${roman(index)}`, `Argument stacks ${index + 1}`), STATION_PURPOSE[station], items.map((digest) => ({ kind: 'digest', digest })), 'interior'));
    if (!interior?.digests.length) {
      const sources: InteriorDigest[] = [
        ...(input.citation ? [{ title: bi(input.citation.title, input.citation.title), gist: input.brief ?? input.qfocus, cite: input.citation }] : []),
        ...(input.literature ?? []).map((cite) => ({ title: bi(cite.title, cite.title), gist: input.depth?.overview ?? input.qfocus, cite })),
      ];
      chunks(sources).forEach(({ start, items }, index) =>
        pushFloor(floors, `${station}:source:${start}`, bi(`来源书架${roman(index)}`, `Source stacks ${index + 1}`), STATION_PURPOSE[station], items.map((digest) => ({ kind: 'digest', digest })), 'island'));
    }
  }

  if (station === 'canvas') {
    (interior?.debates ?? []).forEach((debate, index) =>
      pushFloor(floors, `${station}:debate:${index}`, bi(`议场${roman(index)}`, `Debate floor ${index + 1}`), STATION_PURPOSE[station], [{ kind: 'debate', debate }], 'interior'));
    if (!interior?.debates.length && depth?.approaches.length) chunks(depth.approaches).forEach(({ start, items }, index) =>
      pushFloor(floors, `${station}:approach:${start}`, bi(`路径议场${roman(index)}`, `Approach floor ${index + 1}`), STATION_PURPOSE[station], items.map((text) => ({ kind: 'brief', label: bi('候选进路', 'Candidate approach'), text })), 'island'));
  }

  if (station === 'data') chunks(interior?.data ?? []).forEach(({ start, items }, index) =>
    pushFloor(floors, `${station}:measure:${start}`, bi(`测站${roman(index)}`, `Measure floor ${index + 1}`), STATION_PURPOSE[station], items.map((datum) => ({ kind: 'datum', datum })), 'interior'));

  const scraps: Partial<Record<StationKind, readonly InteriorScrap[]>> = {
    workshop: interior?.workshop, driftwood: interior?.driftwood, tearoom: interior?.tearoom,
  };
  if (station === 'workshop' || station === 'driftwood' || station === 'tearoom') {
    chunks(scraps[station] ?? []).forEach(({ start, items }, index) =>
      pushFloor(floors, `${station}:work:${start}`, bi(`在场层${roman(index)}`, `Working floor ${index + 1}`), STATION_PURPOSE[station], items.map((scrap) => ({ kind: 'scrap', scrap })), 'interior'));
    if (station === 'workshop' && !interior?.workshop.length && (depth?.approaches.length ?? 0) > 1) {
      chunks(depth!.approaches.slice(1)).forEach(({ start, items }, index) =>
        pushFloor(floors, `${station}:method:${start}`, bi(`方法层${roman(index)}`, `Method floor ${index + 1}`), STATION_PURPOSE[station], items.map((text) => ({ kind: 'brief', label: bi('试作路径', 'Prototype route'), text })), 'island'));
    }
  }

  if (station === 'gallery') chunks(interior?.gallery ?? []).forEach(({ start, items }, index) =>
    pushFloor(floors, `${station}:exhibit:${start}`, bi(`展层${roman(index)}`, `Exhibit floor ${index + 1}`), STATION_PURPOSE[station], items.map((gallery) => ({ kind: 'gallery', gallery })), 'interior'));

  if (station === 'dock' && interior) {
    const residentGroups: Array<[string, Bilingual, InteriorResident[]]> = [
      ['human', bi('人类值守层', 'Human keepers'), interior.residents.filter((resident) => resident.kind === 'human')],
      ['ai', bi('治理 AI 值守层', 'Governed AI keepers'), interior.residents.filter((resident) => resident.kind === 'ai')],
    ];
    residentGroups.forEach(([group, title, residents]) =>
      pushFloor(floors, `${station}:residents:${group}`, title, STATION_PURPOSE[station], residents.map((resident) => ({ kind: 'resident', resident })), 'interior'));
  }

  if (input.activeStructure && (station === 'dock' || station === 'workshop')) {
    pushFloor(
      floors,
      `${station}:structure:${input.activeStructure.id.split('/').at(-1) ?? 'active'}`,
      bi('跨问题连接层', 'Cross-problem connection'),
      bi('这里仅展示已记录的共同机制；新的图边仍须由人写下对应、差异与检验。', 'Only recorded shared mechanisms appear here; a new graph edge still requires a human-authored correspondence, difference, and test.'),
      [{ kind: 'structure', structure: input.activeStructure }],
      'structure',
    );
  }

  return { station, floors: floors.slice(0, 8).map((floor, index) => ({ ...floor, level: index + 1 })) };
}

import { BRIDGES } from '@frontier-isles/data/bridges';
import type {
  ApiCurrent,
  ApiCurrentRecord,
  ApiSeaData,
  ApiStructure,
  ApiStructureGraph,
  ApiStructureMapping,
} from '../api/client';
import type { Bilingual, IslandDatum } from '../api/fallback';
import { slugOfOp } from '../api/structureFallback';

/** The semantic channels a reader can ask the field to reveal. */
export type ConnectionChannel = 'all' | 'mechanism' | 'form' | 'evidence' | 'lineage';
export type ConnectionPathKind = 'mathematical' | 'bridge' | 'evidence' | 'contradiction' | 'lineage';

export interface ConnectionProblem {
  slug: string;
  title: Bilingual;
  question: Bilingual;
  brief?: Bilingual;
  domain: IslandDatum['d'];
  citation?: IslandDatum['citation'];
  datum: IslandDatum;
}

export interface ConnectionManifestation {
  problem: ConnectionProblem;
  /** Best current explanation for the list twin: prefer a bounded refinement,
   * then the most recent record. All records remain available as provenance. */
  mapping: ApiStructureMapping;
  records: ApiStructureMapping[];
}

export interface ConnectionConvergence {
  id: string;
  kind: 'mechanism';
  structureId: string;
  title: Bilingual;
  sharedCore: Bilingual;
  status: ApiStructure['status'];
  isomorphism?: string;
  provenance?: ApiStructure['provenance'];
  members: ConnectionManifestation[];
  /** Number of real rebuild records backing the convergence. */
  weight: number;
}

export interface ConnectionPath {
  id: string;
  kind: ConnectionPathKind;
  from: ConnectionProblem;
  to: ConnectionProblem;
  label: Bilingual;
  detail?: Bilingual;
  weight: number;
  directed: boolean;
  sign: ApiCurrent['sign'];
  maturity?: ApiCurrent['maturity'];
  source: 'curated-math' | 'ledger';
  /** Source-preserving ledger records; curated mathematical paths have none. */
  records: ApiCurrentRecord[];
}

export interface ConnectionField {
  problems: Map<string, ConnectionProblem>;
  convergences: ConnectionConvergence[];
  paths: ConnectionPath[];
}

export type ConnectionFocus =
  | { type: 'convergence'; id: string }
  | { type: 'path'; id: string }
  | { type: 'problem'; slug: string }
  | null;

export interface ConnectionMapView {
  mode: 'global' | 'focus';
  memberSlugs: string[];
  convergences: Array<{ id: string; memberSlugs: string[]; weight: number }>;
  paths: Array<{
    id: string;
    fromSlug: string;
    toSlug: string;
    kind: ConnectionPathKind;
    weight: number;
    directed: boolean;
    sign: ApiCurrent['sign'];
    maturity?: ApiCurrent['maturity'];
  }>;
}

const text = (zh: string, en: string): Bilingual => ({ zh, en });

function currentKind(current: ApiCurrent): ConnectionPathKind {
  if (current.kind === 'lineage') return 'lineage';
  if (current.kind === 'bridge') return 'bridge';
  return current.sign === 'contest' ? 'contradiction' : 'evidence';
}

function currentLabel(current: ApiCurrent): Bilingual {
  if (current.kind === 'lineage') return text(
    '一个领域的方法在另一个领域被继续使用',
    'A method from one field is being used in the other',
  );
  if (current.kind === 'bridge') {
    return current.maturity === 'ratified'
      ? text('已有记录确认两项研究可以互相借用', 'Recorded work confirms the two studies can inform each other')
      : text('有人提出两项研究可以互相借用', 'Someone proposes that the two studies can inform each other');
  }
  return current.sign === 'contest'
    ? text('两项研究的材料得出不同判断', 'The two studies point to different conclusions')
    : text('另一项研究提供了支持材料', 'One study provides material that supports the other');
}

function bestMapping(records: ApiStructureMapping[]): ApiStructureMapping {
  return [...records].sort((a, b) => {
    const bounded = Number(!!b.boundary) - Number(!!a.boundary);
    if (bounded !== 0) return bounded;
    const recent = b.ts.localeCompare(a.ts);
    return recent !== 0 ? recent : b.refHash.localeCompare(a.refHash);
  })[0]!;
}

/** Fuse the three existing relation sources into one browser-safe read field.
 * No theme/domain/cluster/proximity edge is ever introduced here. */
export function buildConnectionField(
  structures: readonly ApiStructure[],
  graph: ApiStructureGraph,
  sea: ApiSeaData,
  islands: readonly IslandDatum[],
): ConnectionField {
  const problems = new Map<string, ConnectionProblem>();
  for (const datum of islands) {
    const slug = datum.slug ?? `id-${datum.id}`;
    problems.set(slug, {
      slug,
      title: datum.n,
      question: datum.q,
      brief: datum.brief,
      domain: datum.d,
      citation: datum.citation,
      datum,
    });
  }

  const recordsByStructure = new Map<string, ApiStructureMapping[]>();
  for (const mapping of graph.mappings ?? []) {
    const records = recordsByStructure.get(mapping.structureId) ?? [];
    records.push(mapping);
    recordsByStructure.set(mapping.structureId, records);
  }

  const convergences: ConnectionConvergence[] = [];
  for (const structure of structures) {
    const records = recordsByStructure.get(structure.id) ?? [];
    const byIsland = new Map<string, ApiStructureMapping[]>();
    for (const record of records) {
      const slug = slugOfOp(record.islandOp);
      if (!problems.has(slug)) continue;
      const islandRecords = byIsland.get(slug) ?? [];
      islandRecords.push(record);
      byIsland.set(slug, islandRecords);
    }
    // One mapped problem is useful local context, but not a cross-domain
    // convergence. It remains reachable through the legacy graph/write path.
    if (byIsland.size < 2) continue;
    const members = [...byIsland.entries()].map(([slug, islandRecords]) => ({
      problem: problems.get(slug)!,
      mapping: bestMapping(islandRecords),
      records: [...islandRecords].sort((a, b) => a.ts.localeCompare(b.ts) || a.refHash.localeCompare(b.refHash)),
    })).sort((a, b) => a.problem.title.zh.localeCompare(b.problem.title.zh, 'zh-CN'));
    convergences.push({
      id: structure.id,
      kind: 'mechanism',
      structureId: structure.id,
      title: structure.title,
      sharedCore: structure.statement,
      status: structure.status,
      isomorphism: structure.isomorphism,
      provenance: structure.provenance,
      members,
      weight: records.length,
    });
  }

  const paths: ConnectionPath[] = [];
  for (const bridge of BRIDGES) {
    const from = problems.get(bridge.from);
    const to = problems.get(bridge.to);
    if (!from || !to) continue;
    paths.push({
      id: `math:${bridge.from}:${bridge.to}:${bridge.formula}`,
      kind: 'mathematical',
      from,
      to,
      label: bridge.skeleton,
      detail: text(bridge.formula, bridge.formula),
      weight: 1,
      directed: false,
      sign: 'neutral',
      maturity: 'ratified',
      source: 'curated-math',
      records: [],
    });
  }
  for (const current of sea.currents) {
    const from = problems.get(slugOfOp(current.from));
    const to = problems.get(slugOfOp(current.to));
    if (!from || !to || from.slug === to.slug) continue;
    const kind = currentKind(current);
    paths.push({
      id: `ledger:${kind}:${from.slug}:${to.slug}:${current.sign}`,
      kind,
      from,
      to,
      label: currentLabel(current),
      weight: current.weight,
      directed: current.directed,
      sign: current.sign,
      maturity: current.maturity,
      source: 'ledger',
      records: current.records ?? [],
    });
  }

  convergences.sort((a, b) => b.members.length - a.members.length || a.title.zh.localeCompare(b.title.zh, 'zh-CN'));
  paths.sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id));
  return { problems, convergences, paths };
}

export const pathInChannel = (path: ConnectionPath, channel: ConnectionChannel): boolean =>
  channel === 'all'
  || (channel === 'form' && (path.kind === 'mathematical' || path.kind === 'bridge'))
  || (channel === 'evidence' && (path.kind === 'evidence' || path.kind === 'contradiction'))
  || (channel === 'lineage' && path.kind === 'lineage');

/** Adapt a semantic field/focus into stage instructions while preserving the
 * convergence-vs-direct-path distinction. */
export function projectConnectionMap(
  field: ConnectionField,
  channel: ConnectionChannel = 'all',
  focus: ConnectionFocus = null,
): ConnectionMapView {
  let convergences = channel === 'all' || channel === 'mechanism' ? field.convergences : [];
  let paths = field.paths.filter((path) => pathInChannel(path, channel));

  if (focus?.type === 'convergence') {
    convergences = field.convergences.filter((group) => group.id === focus.id);
    const members = new Set(convergences.flatMap((group) => group.members.map((member) => member.problem.slug)));
    // Preserve cross-collision information only when both endpoints genuinely
    // participate in the focused convergence.
    paths = field.paths.filter((path) => members.has(path.from.slug) && members.has(path.to.slug));
  } else if (focus?.type === 'path') {
    convergences = [];
    paths = field.paths.filter((path) => path.id === focus.id);
  } else if (focus?.type === 'problem') {
    convergences = field.convergences.filter((group) => group.members.some((member) => member.problem.slug === focus.slug));
    paths = field.paths.filter((path) => path.from.slug === focus.slug || path.to.slug === focus.slug);
  }

  const memberSlugs = new Set<string>();
  const convergenceRows = convergences.map((group) => {
    const slugs = group.members.map((member) => member.problem.slug);
    slugs.forEach((slug) => memberSlugs.add(slug));
    return { id: group.id, memberSlugs: slugs, weight: group.weight };
  });
  const pathRows = paths.map((path) => {
    memberSlugs.add(path.from.slug);
    memberSlugs.add(path.to.slug);
    return {
      id: path.id,
      fromSlug: path.from.slug,
      toSlug: path.to.slug,
      kind: path.kind,
      weight: path.weight,
      directed: path.directed,
      sign: path.sign,
      ...(path.maturity ? { maturity: path.maturity } : {}),
    };
  });
  return {
    mode: focus ? 'focus' : 'global',
    memberSlugs: [...memberSlugs].sort(),
    convergences: convergenceRows,
    paths: pathRows,
  };
}

export function searchConnectionProblems(field: ConnectionField, query: string, lang: 'zh' | 'en'): ConnectionProblem[] {
  const needle = query.trim().toLocaleLowerCase(lang === 'zh' ? 'zh-CN' : 'en');
  if (!needle) return [];
  return [...field.problems.values()].filter((problem) => [
    problem.title[lang],
    problem.question[lang],
    problem.brief?.[lang] ?? '',
  ].some((value) => value.toLocaleLowerCase(lang === 'zh' ? 'zh-CN' : 'en').includes(needle)))
    .slice(0, 12);
}

import type { IslandDatum } from '../api/fallback';
import {
  initialExplorationSession,
  type IslandDistrictId,
  type CompletedPassage,
  type ExplorationSession,
  type PassageIntent,
  type SampledCurrentRecord,
  type StructureDeparture,
  type WorldExplorerPose,
} from './explorationSession';

export const EXPLORATION_NOTEBOOK_STORAGE_KEY = 'frontier-isles:field-notebook:v1';
const NOTEBOOK_VERSION = 3;
const MAX_RECORDS = 1000;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface StoredExplorationNotebook {
  version: 1 | 2 | typeof NOTEBOOK_VERSION;
  savedAt: string;
  worldPose: WorldExplorerPose | null;
  courseIslandSlug: string | null;
  courseHistorySlugs: string[];
  visitedIslandSlugs: string[];
  sampledCurrents: SampledCurrentRecord[];
  notes: Record<string, string>;
  structureLensId?: string | null;
  structureDeparture?: StructureDeparture | null;
  passageIntent?: PassageIntent | null;
  completedPassages?: CompletedPassage[];
  surveyedDistricts?: Record<string, IslandDistrictId[]>;
  visitedBuildingFloors?: Record<string, string[]>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0))]
    .slice(0, MAX_RECORDS);
}

const DISTRICT_IDS = new Set<IslandDistrictId>(['harbor', 'inquiry', 'archive', 'works', 'observatory']);

function districtsOf(value: unknown): Record<string, IslandDistrictId[]> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).slice(0, MAX_RECORDS).flatMap(([slug, raw]) => {
      if (!slug || !Array.isArray(raw)) return [];
      const ids = [...new Set(raw.filter((item): item is IslandDistrictId =>
        typeof item === 'string' && DISTRICT_IDS.has(item as IslandDistrictId),
      ))].slice(0, 5);
      return ids.length ? [[slug, ids] as const] : [];
    }),
  );
}

function floorVisitsOf(value: unknown): Record<string, string[]> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).slice(0, MAX_RECORDS).flatMap(([key, raw]) => {
      if (!key || !key.includes(':')) return [];
      const ids = uniqueStrings(raw).map((id) => id.slice(0, 160)).filter(Boolean).slice(0, 64);
      return ids.length ? [[key.slice(0, 320), ids] as const] : [];
    }),
  );
}

function poseOf(value: unknown): WorldExplorerPose | null {
  if (!isRecord(value) || !finite(value.x) || !finite(value.y)) return null;
  if (!['north', 'east', 'south', 'west'].includes(String(value.facing))) return null;
  const pose: WorldExplorerPose = {
    x: value.x,
    y: value.y,
    facing: value.facing as WorldExplorerPose['facing'],
    speed: 0,
    bank: 0,
    verticalSpeed: 0,
  };
  if (finite(value.heading)) pose.heading = value.heading;
  if (finite(value.altitudeZ)) pose.altitudeZ = Math.max(0, Math.min(1, value.altitudeZ));
  return pose;
}

function currentOf(value: unknown): SampledCurrentRecord | null {
  if (!isRecord(value)) return null;
  if (![value.id, value.fromSlug, value.toSlug].every((item) => typeof item === 'string' && item.length > 0)) return null;
  if (!['evidence', 'bridge', 'lineage'].includes(String(value.kind))) return null;
  if (!['affirm', 'contest', 'neutral'].includes(String(value.sign))) return null;
  if (typeof value.directed !== 'boolean' || !finite(value.weight)) return null;
  const current: SampledCurrentRecord = {
    id: value.id as string,
    fromSlug: value.fromSlug as string,
    toSlug: value.toSlug as string,
    kind: value.kind as SampledCurrentRecord['kind'],
    sign: value.sign as SampledCurrentRecord['sign'],
    directed: value.directed,
    weight: value.weight,
  };
  if (value.maturity === 'proposed' || value.maturity === 'ratified') current.maturity = value.maturity;
  return current;
}

function structureIdOf(value: unknown): string | null {
  return typeof value === 'string' && /^struct:\/\//.test(value) ? value : null;
}

function islandOpOf(value: unknown): string | null {
  return typeof value === 'string' && /^op:\/\//.test(value) ? value : null;
}

function departureOf(value: unknown): StructureDeparture | null {
  if (!isRecord(value)) return null;
  const structureId = structureIdOf(value.structureId);
  const islandOp = islandOpOf(value.islandOp);
  if (!structureId || !islandOp || typeof value.islandSlug !== 'string' || !value.islandSlug) return null;
  return { structureId, islandSlug: value.islandSlug, islandOp };
}

function intentOf(value: unknown): PassageIntent | null {
  const departure = departureOf(value);
  if (!departure || !isRecord(value)) return null;
  const targetIslandOp = islandOpOf(value.targetIslandOp);
  if (!targetIslandOp || typeof value.targetIslandSlug !== 'string' || !value.targetIslandSlug) return null;
  if (value.targetIslandSlug === departure.islandSlug) return null;
  if (value.passageKind !== 'charted' && value.passageKind !== 'frontier') return null;
  return {
    ...departure,
    targetIslandSlug: value.targetIslandSlug,
    targetIslandOp,
    passageKind: value.passageKind,
  };
}

function receiptOf(value: unknown): CompletedPassage | null {
  const intent = intentOf(value);
  if (!intent || !isRecord(value)) return null;
  if (typeof value.refHash !== 'string' || !/^sha256:/.test(value.refHash)) return null;
  if (typeof value.structureTitle !== 'string' || !value.structureTitle.trim()) return null;
  if (typeof value.prediction !== 'string' || !value.prediction.trim()) return null;
  if (typeof value.completedAt !== 'string' || !value.completedAt) return null;
  if (!Array.isArray(value.correspondences)) return null;
  const correspondences = value.correspondences.flatMap((item) => {
    if (!isRecord(item) || typeof item.quantity !== 'string' || typeof item.inThisSubstrate !== 'string') return [];
    const quantity = item.quantity.trim();
    const inThisSubstrate = item.inThisSubstrate.trim();
    return quantity && inThisSubstrate ? [{ quantity, inThisSubstrate }] : [];
  });
  if (correspondences.length === 0) return null;
  const evidenceRefs = Array.isArray(value.evidenceRefs)
    ? [...new Set(value.evidenceRefs
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean))].slice(0, 24)
    : [];
  const boundary = typeof value.boundary === 'string' ? value.boundary.trim().slice(0, 1600) : '';
  return {
    ...intent,
    refHash: value.refHash,
    structureTitle: value.structureTitle.trim().slice(0, 240),
    correspondences: correspondences.slice(0, 24),
    ...(boundary ? { boundary } : {}),
    prediction: value.prediction.trim().slice(0, 2400),
    ...(evidenceRefs.length ? { evidenceRefs } : {}),
    completedAt: value.completedAt,
  };
}

function notesOf(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([slug, note]) => slug.length > 0 && typeof note === 'string' && note.trim().length > 0)
      .slice(0, MAX_RECORDS)
      .map(([slug, note]) => [slug, (note as string).slice(0, 1200)]),
  );
}

function browserStorage(): StorageLike | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** Restore durable notebook fields only. Navigation always boots safely at L0. */
export function loadExplorationNotebook(storage: StorageLike | null = browserStorage()): ExplorationSession {
  const initial = initialExplorationSession();
  if (!storage) return initial;
  try {
    const raw = storage.getItem(EXPLORATION_NOTEBOOK_STORAGE_KEY);
    if (!raw) return initial;
    const value = JSON.parse(raw) as unknown;
    if (!isRecord(value) || ![1, 2, NOTEBOOK_VERSION].includes(Number(value.version))) return initial;
    const currents = Array.isArray(value.sampledCurrents)
      ? value.sampledCurrents.map(currentOf).filter((item): item is SampledCurrentRecord => !!item)
      : [];
    const sampledCurrents = [...new Map(currents.map((current) => [current.id, current])).values()].slice(0, MAX_RECORDS);
    const receipts = Array.isArray(value.completedPassages)
      ? value.completedPassages.map(receiptOf).filter((item): item is CompletedPassage => !!item)
      : [];
    const completedPassages = [...new Map(receipts.map((receipt) => [receipt.refHash, receipt])).values()].slice(-200);
    const structureLensId = structureIdOf(value.structureLensId);
    const structureDeparture = departureOf(value.structureDeparture);
    const passageIntent = intentOf(value.passageIntent);
    return {
      ...initial,
      worldPose: poseOf(value.worldPose),
      courseIslandSlug: typeof value.courseIslandSlug === 'string' ? value.courseIslandSlug : null,
      courseHistorySlugs: uniqueStrings(value.courseHistorySlugs),
      visitedIslandSlugs: uniqueStrings(value.visitedIslandSlugs),
      sampledCurrents,
      notes: notesOf(value.notes),
      structureLensId,
      structureDeparture: structureDeparture?.structureId === structureLensId ? structureDeparture : null,
      passageIntent: passageIntent?.structureId === structureLensId ? passageIntent : null,
      completedPassages,
      surveyedDistricts: districtsOf(value.surveyedDistricts),
      visitedBuildingFloors: floorVisitsOf(value.visitedBuildingFloors),
    };
  } catch {
    return initial;
  }
}

/** Best-effort browser persistence; quota/privacy failures never break exploration. */
export function saveExplorationNotebook(
  session: ExplorationSession,
  storage: StorageLike | null = browserStorage(),
  savedAt = new Date().toISOString(),
): boolean {
  if (!storage) return false;
  const durable: StoredExplorationNotebook = {
    version: NOTEBOOK_VERSION,
    savedAt,
    worldPose: session.worldPose,
    courseIslandSlug: session.courseIslandSlug,
    courseHistorySlugs: session.courseHistorySlugs,
    visitedIslandSlugs: session.visitedIslandSlugs,
    sampledCurrents: session.sampledCurrents,
    notes: session.notes,
    structureLensId: session.structureLensId,
    structureDeparture: session.structureDeparture,
    passageIntent: session.passageIntent,
    completedPassages: session.completedPassages,
    surveyedDistricts: session.surveyedDistricts,
    visitedBuildingFloors: session.visitedBuildingFloors,
  };
  try {
    storage.setItem(EXPLORATION_NOTEBOOK_STORAGE_KEY, JSON.stringify(durable));
    return true;
  } catch {
    return false;
  }
}

const labels = {
  zh: {
    title: '问题群岛 · 考察札记', local: '本札记保存在当前浏览器，并可作为 Markdown 带离。它尚未同步到账户或岛屿账本。',
    exported: '导出时间', position: '考察舟泊位', bearing: '当前航向', courses: '问题航向记录', surveyed: '已考察岛屿', currents: '航流样本',
    none: '暂无', domain: '领域', question: '问题', note: '个人观察', source: '来源', relation: '关系', weight: '账本事件',
    districts: '岛内勘察图', floors: '建筑楼层札记', building: '建筑',
    passages: '连接记录', route: '比较对象', kind: '性质', charted: '复核已有连接', frontier: '建立新连接', mapping: '变量对应', boundary: '重要差异 / 类比边界', prediction: '可证伪预测', evidence: '证据或记录', ledgerRef: '账本映射', completed: '完成时间',
  },
  en: {
    title: 'Frontier Isles · Field Notebook', local: 'This notebook is stored in this browser and can leave as Markdown. It is not yet synced to an account or island ledger.',
    exported: 'Exported', position: 'Survey-craft berth', bearing: 'Current bearing', courses: 'Question bearings', surveyed: 'Surveyed isles', currents: 'Current samples',
    none: 'None yet', domain: 'Domain', question: 'Question', note: 'Personal observation', source: 'Source', relation: 'Relation', weight: 'ledger events',
    districts: 'Island district surveys', floors: 'Building floor notes', building: 'Building',
    passages: 'Connection records', route: 'Compared problems', kind: 'Kind', charted: 'reviewed connection', frontier: 'new connection', mapping: 'Variable correspondence', boundary: 'Important difference / analogy boundary', prediction: 'Falsifiable prediction', evidence: 'Evidence or record', ledgerRef: 'Ledger mapping', completed: 'Completed',
  },
} as const;

const districtNames: Record<'zh' | 'en', Record<IslandDistrictId, string>> = {
  zh: { harbor: '问题定位', inquiry: '问题与差异', archive: '证据与测量', works: '方法与试验', observatory: '结果与下一步' },
  en: { harbor: 'Problem orientation', inquiry: 'Problems & differences', archive: 'Evidence & measures', works: 'Methods & trials', observatory: 'Results & next steps' },
};

const stationNames: Record<'zh' | 'en', Record<string, string>> = {
  zh: { questions: '问题墙', library: '文献阁', canvas: '白板厅', data: '数据台', workshop: '实验坊', gallery: '展厅', tearoom: '开放讨论', driftwood: '散木园', dock: '连接工作台' },
  en: { questions: 'Question Wall', library: 'Library', canvas: 'Whiteboard Hall', data: 'Data Desk', workshop: 'Workshop', gallery: 'Gallery', tearoom: 'Open Discussion', driftwood: 'Driftwood Garden', dock: 'Connection Workbench' },
};

/** Portable Markdown view of the same durable notebook state used by the UI. */
export function explorationNotebookMarkdown(
  session: ExplorationSession,
  islands: readonly IslandDatum[],
  lang: 'zh' | 'en',
  exportedAt = new Date().toISOString(),
): string {
  const l = labels[lang];
  const bySlug = new Map(islands.map((island) => [island.slug ?? `id-${island.id}`, island]));
  const nameOf = (slug: string): string => bySlug.get(slug)?.n[lang] ?? slug;
  const questionOf = (slug: string): string => bySlug.get(slug)?.q[lang] ?? '';
  const lines = [`# ${l.title}`, '', `> ${l.local}`, '', `- ${l.exported}: ${exportedAt}`];
  if (session.worldPose) {
    lines.push(`- ${l.position}: x ${session.worldPose.x.toFixed(1)} · y ${session.worldPose.y.toFixed(1)} · z ${(session.worldPose.altitudeZ ?? 0.5).toFixed(2)}`);
  }
  lines.push(`- ${l.bearing}: ${session.courseIslandSlug ? nameOf(session.courseIslandSlug) : l.none}`, '', `## ${l.courses}`);
  lines.push(...(session.courseHistorySlugs.length > 0
    ? session.courseHistorySlugs.map((slug, index) => `${index + 1}. ${nameOf(slug)} — ${questionOf(slug)}`)
    : [l.none]));
  lines.push('', `## ${l.surveyed}`);
  if (session.visitedIslandSlugs.length === 0) lines.push(l.none);
  for (const [index, slug] of session.visitedIslandSlugs.entries()) {
    const island = bySlug.get(slug);
    lines.push('', `### ${String(index + 1).padStart(2, '0')} · ${nameOf(slug)}`);
    if (island) lines.push(`- ${l.domain}: ${island.d}`, `- ${l.question}: ${island.q[lang]}`);
    const note = session.notes[slug]?.trim();
    if (note) lines.push(`- ${l.note}: ${note.replace(/\n/g, '\n  ')}`);
    if (island?.citation) lines.push(`- ${l.source}: [${island.citation.venue} · ${island.citation.year}](${island.citation.url})`);
  }
  lines.push('', `## ${l.districts}`);
  const districtRows = Object.entries(session.surveyedDistricts);
  if (districtRows.length === 0) lines.push(l.none);
  for (const [slug, ids] of districtRows) {
    lines.push(`- ${nameOf(slug)}: ${ids.map((id) => districtNames[lang][id]).join(' → ')}`);
  }
  lines.push('', `## ${l.floors}`);
  const floorRows = Object.entries(session.visitedBuildingFloors);
  if (floorRows.length === 0) lines.push(l.none);
  for (const [key, ids] of floorRows) {
    const splitAt = key.lastIndexOf(':');
    const slug = splitAt > 0 ? key.slice(0, splitAt) : key;
    const station = splitAt > 0 ? key.slice(splitAt + 1) : '';
    lines.push(`- ${nameOf(slug)} · ${l.building}: ${stationNames[lang][station] ?? station} — ${ids.join(', ')}`);
  }
  lines.push('', `## ${l.currents}`);
  if (session.sampledCurrents.length === 0) lines.push(l.none);
  for (const current of session.sampledCurrents) {
    const arrow = current.directed ? '→' : '↔';
    lines.push(`- ${nameOf(current.fromSlug)} ${arrow} ${nameOf(current.toSlug)} · ${l.relation}: ${current.kind}/${current.sign}${current.maturity ? `/${current.maturity}` : ''} · ${current.weight} ${l.weight}`);
  }
  lines.push('', `## ${l.passages}`);
  if (session.completedPassages.length === 0) lines.push(l.none);
  for (const [index, passage] of session.completedPassages.entries()) {
    lines.push(
      '',
      `### ${String(index + 1).padStart(2, '0')} · ${passage.structureTitle}`,
      `- ${l.route}: ${nameOf(passage.islandSlug)} → ${nameOf(passage.targetIslandSlug)}`,
      `- ${l.kind}: ${l[passage.passageKind]}`,
      `- ${l.mapping}:`,
      ...passage.correspondences.map((item) => `  - ${item.quantity} ↦ ${item.inThisSubstrate}`),
      ...(passage.boundary ? [`- ${l.boundary}: ${passage.boundary.replace(/\n/g, '\n  ')}`] : []),
      `- ${l.prediction}: ${passage.prediction.replace(/\n/g, '\n  ')}`,
      ...(passage.evidenceRefs?.length ? [`- ${l.evidence}: ${passage.evidenceRefs.join(', ')}`] : []),
      `- ${l.ledgerRef}: \`${passage.refHash}\``,
      `- ${l.completed}: ${passage.completedAt}`,
    );
  }
  return `${lines.join('\n')}\n`;
}

export function downloadExplorationNotebook(markdown: string, date = new Date()): void {
  const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `frontier-isles-field-notebook-${date.toISOString().slice(0, 10)}.md`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

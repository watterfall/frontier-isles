import type { IslandDatum } from '../api/fallback';
import {
  initialExplorationSession,
  type ExplorationSession,
  type SampledCurrentRecord,
  type WorldExplorerPose,
} from './explorationSession';

export const EXPLORATION_NOTEBOOK_STORAGE_KEY = 'frontier-isles:field-notebook:v1';
const NOTEBOOK_VERSION = 1;
const MAX_RECORDS = 1000;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface StoredExplorationNotebook {
  version: typeof NOTEBOOK_VERSION;
  savedAt: string;
  worldPose: WorldExplorerPose | null;
  courseIslandSlug: string | null;
  courseHistorySlugs: string[];
  visitedIslandSlugs: string[];
  sampledCurrents: SampledCurrentRecord[];
  notes: Record<string, string>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0))]
    .slice(0, MAX_RECORDS);
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
    if (!isRecord(value) || value.version !== NOTEBOOK_VERSION) return initial;
    const currents = Array.isArray(value.sampledCurrents)
      ? value.sampledCurrents.map(currentOf).filter((item): item is SampledCurrentRecord => !!item)
      : [];
    const sampledCurrents = [...new Map(currents.map((current) => [current.id, current])).values()].slice(0, MAX_RECORDS);
    return {
      ...initial,
      worldPose: poseOf(value.worldPose),
      courseIslandSlug: typeof value.courseIslandSlug === 'string' ? value.courseIslandSlug : null,
      courseHistorySlugs: uniqueStrings(value.courseHistorySlugs),
      visitedIslandSlugs: uniqueStrings(value.visitedIslandSlugs),
      sampledCurrents,
      notes: notesOf(value.notes),
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
  },
  en: {
    title: 'Frontier Isles · Field Notebook', local: 'This notebook is stored in this browser and can leave as Markdown. It is not yet synced to an account or island ledger.',
    exported: 'Exported', position: 'Survey-craft berth', bearing: 'Current bearing', courses: 'Question bearings', surveyed: 'Surveyed isles', currents: 'Current samples',
    none: 'None yet', domain: 'Domain', question: 'Question', note: 'Personal observation', source: 'Source', relation: 'Relation', weight: 'ledger events',
  },
} as const;

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
  lines.push('', `## ${l.currents}`);
  if (session.sampledCurrents.length === 0) lines.push(l.none);
  for (const current of session.sampledCurrents) {
    const arrow = current.directed ? '→' : '↔';
    lines.push(`- ${nameOf(current.fromSlug)} ${arrow} ${nameOf(current.toSlug)} · ${l.relation}: ${current.kind}/${current.sign}${current.maturity ? `/${current.maturity}` : ''} · ${current.weight} ${l.weight}`);
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

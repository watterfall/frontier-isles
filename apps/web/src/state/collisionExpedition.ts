import { collisionKey, validateExplorationCatalog, type ExplorationCatalog, type QuestionCollision } from '@frontier-isles/data/xfrontier-exploration';

export const EXPEDITION_STORAGE = 'fi-collision-expeditions-v1';
export const FIELD_NAMES = ['question', 'mapping', 'boundary', 'hypothesis', 'alternative', 'probe', 'failure', 'evidence', 'interpretation'] as const;
export type ExpeditionField = typeof FIELD_NAMES[number];
export type ExpeditionOutcome = 'unrun' | 'supports' | 'challenges' | 'unclear';
export interface CollisionExpedition {
  id: string;
  source: ExplorationCatalog;
  collision: QuestionCollision;
  fields: Record<ExpeditionField, string>;
  outcome: ExpeditionOutcome;
  evidenceKind: 'literature' | 'simulation' | 'experiment';
  updatedAt: string;
  /** Additive v1 extension: free-form observations and accepted proposals.
   * Older nine-field notebooks remain readable and are never discarded. */
  notes?: ExplorationNote[];
  parentId?: string;
}
export interface ExplorationNote {
  id: string;
  kind: 'thought' | 'question' | 'ai' | 'model';
  text: string;
  createdAt: string;
  attribution?: string;
  attachment?: string;
}
export interface ExpeditionNotebook { version: 1; selectedId: string | null; entries: CollisionExpedition[] }
export const emptyExpeditions = (): ExpeditionNotebook => ({ version: 1, selectedId: null, entries: [] });

export function beginExpedition(catalog: ExplorationCatalog, collision: QuestionCollision): CollisionExpedition {
  return {
    id: `${catalog.datasetVersion}:${collisionKey(collision)}`,
    // Pin exactly the source used. A live refresh never rewrites a notebook.
    source: { ...catalog, questions: catalog.questions.filter((q) => q.id === collision.a || q.id === collision.b), collisions: [collision] },
    collision,
    fields: Object.fromEntries(FIELD_NAMES.map((f) => [f, ''])) as Record<ExpeditionField, string>,
    outcome: 'unrun', evidenceKind: 'literature', updatedAt: new Date().toISOString(),
  };
}

export function parseExpeditionNotebook(raw: string): ExpeditionNotebook {
  const input = JSON.parse(raw) as ExpeditionNotebook;
  if (input.version !== 1 || !Array.isArray(input.entries) || input.entries.length > 1000) throw new Error('Invalid notebook');
  const entries = input.entries.map((entry) => {
    const source = validateExplorationCatalog(entry.source);
    const collision = source.collisions[0]!;
    if (source.collisions.length !== 1 || source.questions.length !== 2 || entry.id !== `${source.datasetVersion}:${collisionKey(collision)}`) throw new Error('Invalid expedition source');
    if (!FIELD_NAMES.every((key) => typeof entry.fields?.[key] === 'string' && entry.fields[key].length <= 8000)) throw new Error('Invalid fields');
    if (!['unrun', 'supports', 'challenges', 'unclear'].includes(entry.outcome) || !['literature', 'simulation', 'experiment'].includes(entry.evidenceKind)) throw new Error('Invalid outcome');
    if (!Number.isFinite(Date.parse(entry.updatedAt))) throw new Error('Invalid date');
    if (entry.notes !== undefined && (!Array.isArray(entry.notes) || entry.notes.length > 500 || entry.notes.some((note) => !note || typeof note.id !== 'string' || !['thought', 'question', 'ai', 'model'].includes(note.kind) || typeof note.text !== 'string' || note.text.length > 12000 || !Number.isFinite(Date.parse(note.createdAt)) || (note.attribution !== undefined && (typeof note.attribution !== 'string' || note.attribution.length > 1000)) || (note.attachment !== undefined && (typeof note.attachment !== 'string' || note.attachment.length > 32000))))) throw new Error('Invalid exploration notes');
    if (entry.parentId !== undefined && (typeof entry.parentId !== 'string' || entry.parentId.length > 400)) throw new Error('Invalid parent');
    return { ...entry, source, collision };
  });
  if (new Set(entries.map((e) => e.id)).size !== entries.length) throw new Error('Duplicate entries');
  return { version: 1, entries, selectedId: entries.some((e) => e.id === input.selectedId) ? input.selectedId : null };
}

export function expeditionMarkdown(entry: CollisionExpedition, lang: 'zh' | 'en'): string {
  const labels = lang === 'zh'
    ? ['研究问题', '迁移的机制', '迁移边界', '假设', '竞争解释', '最小验证', '失败条件', '证据与出处', '结果解释']
    : ['Research question', 'Transferred mechanism', 'Transfer boundary', 'Hypothesis', 'Alternative', 'Minimal probe', 'Failure condition', 'Evidence and source', 'Interpretation'];
  return [
    `# ${lang === 'zh' ? '碰撞探索记录' : 'Collision expedition'}`,
    lang === 'zh' ? '个人探索记录；想法与模型观察不等于科学验证。来源问题不构成答案的证据。' : 'Personal research notes; ideas and model observations are not scientific validation. Source questions are not evidence for an answer.',
    `Source: https://xfrontier.science/mcp\nDataset: ${entry.source.datasetVersion}\nRetrieved: ${entry.source.retrievedAt}\nUpdated: ${entry.updatedAt}`,
    ...entry.source.questions.map((q) => `- ${q.id}: ${lang === 'zh' ? q.q : q.q_en}`),
    `## ${lang === 'zh' ? '上游碰撞提问（未证实）' : 'Upstream collision question (unproven)'}\n${lang === 'zh' ? entry.collision.synthesis : entry.collision.synthesis_en}`,
    ...FIELD_NAMES.flatMap((key, i) => entry.fields[key].trim() ? [`## ${labels[i]}\n${entry.fields[key]}`] : []),
    ...(entry.fields.evidence.trim() || entry.outcome !== 'unrun' ? [`Evidence kind: ${entry.evidenceKind}\nOutcome (self-reported): ${entry.outcome}`] : []),
    ...(entry.notes ?? []).map((note) => `## ${note.kind} · ${note.createdAt}\n${note.text}${note.attribution ? `\n\n${note.attribution}` : ''}${note.attachment ? `\n\n\`\`\`json\n${note.attachment}\n\`\`\`` : ''}`),
  ].join('\n\n') + '\n';
}

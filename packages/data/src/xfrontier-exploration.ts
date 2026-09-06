/** A deliberately small read projection. Question relations never imply record
 * mappings, scientific equivalence, or evidence for an answer. */
export interface ExplorationQuestion {
  id: string;
  q: string;
  q_en: string;
  clusters: string[];
}
export interface QuestionCollision {
  a: string;
  b: string;
  shared: string;
  shared_en: string;
  synthesis: string;
  synthesis_en: string;
}
export interface ExplorationCatalog {
  datasetVersion: string;
  serverVersion: string;
  retrievedAt: string;
  questions: ExplorationQuestion[];
  collisions: QuestionCollision[];
}
export const collisionKey = (c: Pick<QuestionCollision, 'a' | 'b'>): string => [c.a, c.b].sort().join('::');

export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object');
  return value as Record<string, unknown>;
}
function string(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.length > 12_000) throw new Error('Expected bounded non-empty text');
  return value;
}

export function validateExplorationCatalog(value: unknown): ExplorationCatalog {
  const d = object(value);
  const datasetVersion = string(d.datasetVersion);
  if (!/^xf-[a-zA-Z0-9._-]+$/.test(datasetVersion)) throw new Error('Invalid dataset version');
  const retrievedAt = string(d.retrievedAt);
  if (!Number.isFinite(Date.parse(retrievedAt))) throw new Error('Invalid retrieval date');
  if (!Array.isArray(d.questions) || !d.questions.length || d.questions.length > 200) throw new Error('Invalid question list');
  const questions = d.questions.map((value) => {
    const q = object(value);
    const id = string(q.id);
    if (!id.startsWith('GQ-') || !Array.isArray(q.clusters) || !q.clusters.every((c) => typeof c === 'string' && /^C\d{2}$/.test(c))) throw new Error('Invalid question identity');
    return { id, q: string(q.q), q_en: string(q.q_en), clusters: q.clusters as string[] };
  });
  const ids = new Set(questions.map((q) => q.id));
  if (ids.size !== questions.length) throw new Error('Duplicate question');
  if (!Array.isArray(d.collisions) || !d.collisions.length || d.collisions.length > 1000) throw new Error('Invalid collisions');
  const collisions = d.collisions.map((value) => {
    const c = object(value);
    const a = string(c.a), b = string(c.b);
    if (a === b || !ids.has(a) || !ids.has(b)) throw new Error('Unresolved collision endpoint');
    return { a, b, shared: string(c.shared), shared_en: string(c.shared_en), synthesis: string(c.synthesis), synthesis_en: string(c.synthesis_en) };
  });
  if (new Set(collisions.map(collisionKey)).size !== collisions.length) throw new Error('Duplicate collision');
  return { datasetVersion, serverVersion: string(d.serverVersion), retrievedAt, questions, collisions };
}

export function projectExplorationCatalog(structure: unknown, search: unknown, serverVersion: string, retrievedAt: string): ExplorationCatalog {
  const s = object(structure), q = object(search);
  if (s.dataset_version !== q.dataset_version) throw new Error('Dataset changed during retrieval');
  if (!Array.isArray(q.items) || q.total !== q.items.length || q.offset !== 0 || q.nextCursor != null) throw new Error('Incomplete question page');
  for (const value of q.items) {
    const item = object(value), wall = object(item.epistemicBoundary);
    if (item.set !== 'great' || wall.answerAsserted !== false || wall.sourceSupportsQuestionExistenceOnly !== true || wall.claimTone !== 'open-question') throw new Error('Question type wall violated');
  }
  return validateExplorationCatalog({ datasetVersion: s.dataset_version, serverVersion, retrievedAt, questions: q.items, collisions: object(s.collisions).items });
}

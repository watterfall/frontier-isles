import { validateExplorationCatalog, type ExplorationCatalog } from '@frontier-isles/data/xfrontier-exploration';

export async function readExplorationCatalog(signal: AbortSignal): Promise<{ source: 'live' | 'stale'; catalog: ExplorationCatalog }> {
  const response = await fetch('/api/xfrontier/catalog', { signal: AbortSignal.any([signal, AbortSignal.timeout(35_000)]) });
  if (!response.ok) throw new Error('xFrontier unavailable');
  const body = await response.json();
  if (body.source !== 'live' && body.source !== 'stale') throw new Error('Invalid source status');
  return { source: body.source, catalog: validateExplorationCatalog(body.catalog) };
}

export interface QuestionSource { id: string; datasetVersion: string; title: string; url: string; year: number | null }
export async function readQuestionSource(id: string, version: string, signal: AbortSignal): Promise<QuestionSource> {
  const response = await fetch(`/api/xfrontier/question/${encodeURIComponent(id)}`, { signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]) });
  if (!response.ok) throw new Error('Source unavailable');
  const data = await response.json();
  if (data.id !== id || data.datasetVersion !== version || typeof data.title !== 'string' || typeof data.url !== 'string' || !/^https?:\/\//.test(data.url)) throw new Error('Source edition differs');
  return data;
}

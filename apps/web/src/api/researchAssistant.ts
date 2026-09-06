import { parseExplorationProposal, type ExplorationReply } from '@frontier-isles/data/exploration-assistant';
import { object } from '@frontier-isles/data/xfrontier-exploration';

export type AssistantCapability = 'checking' | 'ready' | 'unconfigured' | 'sign_in' | 'offline';
export async function readAssistantCapability(signal: AbortSignal): Promise<AssistantCapability> {
  const response = await fetch('/api/research-assistant/capability', { signal: AbortSignal.any([signal, AbortSignal.timeout(6000)]) });
  if (!response.ok) return 'offline';
  const body = object(await response.json());
  return ['ready', 'unconfigured', 'sign_in'].includes(String(body.state)) ? body.state as AssistantCapability : 'offline';
}
export async function askResearchAssistant(input: { datasetVersion: string; questionIds: string[]; message: string; notes: string; lang: 'zh' | 'en' }, knownIds: string[], signal: AbortSignal): Promise<ExplorationReply> {
  const response = await fetch('/api/research-assistant/explore', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal: AbortSignal.any([signal, AbortSignal.timeout(60_000)]) });
  const body = object(await response.json());
  if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'exploration_failed');
  const proposal = parseExplorationProposal(body, knownIds);
  if (body.datasetVersion !== input.datasetVersion || typeof body.model !== 'string' || typeof body.createdAt !== 'string' || !Array.isArray(body.sources)) throw new Error('invalid_reply');
  const sources = body.sources.map((value) => {
    const s = object(value);
    if (typeof s.id !== 'string' || !knownIds.includes(s.id) || typeof s.title !== 'string' || typeof s.url !== 'string' || !/^https?:\/\//.test(s.url)) throw new Error('invalid_source');
    return { id: s.id, title: s.title, url: s.url };
  });
  return { ...proposal, datasetVersion: body.datasetVersion, model: body.model, createdAt: body.createdAt, sources };
}

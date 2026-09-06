import { describe, expect, it, vi } from 'vitest';
import { explorationAssistantRoutes, runExplorationAssistant } from '../src/exploration-assistant';
import type { createExplorationReader } from '../src/xfrontier-exploration';
const catalog = { datasetVersion: 'xf-test', serverVersion: '0.9.0', retrievedAt: '2026-09-06T00:00:00Z', questions: ['a', 'b', 'c'].map((id) => ({ id: `GQ-${id}`, q: id, q_en: id, clusters: [] })), collisions: [{ a: 'GQ-a', b: 'GQ-b', shared: 'maybe', shared_en: 'maybe', synthesis: 'why?', synthesis_en: 'why?' }] };
const reader = () => Object.assign(vi.fn(async () => ({ source: 'live' as const, catalog })), { question: vi.fn(async (id: string) => ({ id, title: id, url: 'https://example.org/question', year: 2020, source: 'live' as const, datasetVersion: 'xf-test' })) }) as unknown as ReturnType<typeof createExplorationReader>;
const input = { datasetVersion: 'xf-test', questionIds: ['GQ-a', 'GQ-b'], message: 'find a different mechanism', notes: '', lang: 'en' as const };
const provider = { apiKey: 'test-key', model: 'test-model', baseUrl: 'https://provider.example/v1' };
const proposal = (ids = ['GQ-a', 'GQ-b']) => ({ reply: 'Compare the competing predictions.', moves: [{ kind: 'challenge', title: 'A rival mechanism', question: 'Does the effect survive?', reason: 'The rival predicts invariance.', boundary: 'The scale differs.', questionIds: ids }] });
const answer = (value: unknown) => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(value) }] }] });
describe('AI exploration collaborator', () => {
  it('executes a bounded read-only lookup and grounds third-domain suggestions in inspected questions', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ status: 'completed', output: [{ type: 'function_call', name: 'lookup_question', call_id: 'one', arguments: '{"id":"GQ-c"}' }] })).mockResolvedValueOnce(answer(proposal(['GQ-a', 'GQ-c'])));
    const read = reader();
    const result = await runExplorationAssistant(input, provider, read, fetcher);
    expect(result.sources.map((s) => s.id)).toEqual(['GQ-a', 'GQ-b', 'GQ-c']);
    expect(read.question).toHaveBeenCalledWith('GQ-c');
    const sent = JSON.parse(fetcher.mock.calls[1]![1].body);
    expect(sent.store).toBe(false); expect(sent.input.at(-1).type).toBe('function_call_output');
    expect(sent.instructions).toContain('not established answers');
    expect(JSON.stringify(sent)).not.toContain('test-key');
  });
  it('rejects uninspected IDs, missing boundaries and invented tools', async () => {
    await expect(runExplorationAssistant(input, provider, reader(), vi.fn(async () => answer(proposal(['GQ-c']))))).rejects.toThrow('Unknown question');
    const missing = proposal(); missing.moves[0]!.boundary = '';
    await expect(runExplorationAssistant(input, provider, reader(), vi.fn(async () => answer(missing)))).rejects.toThrow('proposal text');
    await expect(runExplorationAssistant(input, provider, reader(), vi.fn(async () => Response.json({ status: 'completed', output: [{ type: 'function_call', name: 'execute_code', call_id: 'one', arguments: '{}' }] })))).rejects.toThrow('invalid_tool');
  });
  it('does not call a provider against a changed source edition', async () => {
    const fetcher = vi.fn();
    await expect(runExplorationAssistant({ ...input, datasetVersion: 'old' }, provider, reader(), fetcher)).rejects.toThrow('source_changed');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('requires a configured service and authenticated actor; no fake AI fallback', async () => {
    const disabled = explorationAssistantRoutes({ provider: null, actor: () => undefined });
    expect(await (await disabled.request('/capability')).json()).toEqual({ state: 'unconfigured', model: null });
    expect((await disabled.request('/explore', { method: 'POST' })).status).toBe(503);
    const signedOut = explorationAssistantRoutes({ provider, actor: () => undefined });
    expect((await signedOut.request('/explore', { method: 'POST' })).status).toBe(401);
  });
  it('rejects cross-origin and oversized work; bounds billable calls per actor', async () => {
    const fetcher = vi.fn(async () => answer(proposal()));
    const app = explorationAssistantRoutes({ provider, read: reader(), fetcher, actor: () => 'test-person' });
    const request = (origin?: string, body = input) => app.request('/explore', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) }, body: JSON.stringify(body) });
    expect((await request('https://untrusted.example')).status).toBe(403);
    expect((await request(undefined, { ...input, message: 'x'.repeat(4000) })).status).toBe(400);
    for (let i = 0; i < 5; i++) expect((await request()).status).toBe(200);
    expect((await request()).status).toBe(429); expect(fetcher).toHaveBeenCalledTimes(5);
  });
});

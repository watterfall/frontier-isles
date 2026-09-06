import { describe, expect, it, vi } from 'vitest';
import { createExplorationReader, explorationRoutes } from '../src/xfrontier-exploration';
function setup() {
  let time = Date.parse('2026-09-06T00:00:00Z');
  let fail = false;
  const fetcher = vi.fn(async (_url: unknown, options: RequestInit | undefined) => {
    if (fail) throw new Error('offline');
    const body = JSON.parse(String(options?.body));
    const results: Record<string, unknown> = {
      initialize: { serverInfo: { name: 'xfrontier', version: '0.9.0', dataset_version: 'xf-test' } },
      'tools/list': { tools: [{ name: 'search_questions', annotations: { readOnlyHint: true } }] },
      'resources/read': { contents: [{ uri: 'xf://questions/structure', text: JSON.stringify({ dataset_version: 'xf-test', collisions: { items: [{ a: 'GQ-a', b: 'GQ-b', shared: 'shared', shared_en: 'shared', synthesis: 'why?', synthesis_en: 'why?' }] } }) }] },
      'tools/call': { structuredContent: { dataset_version: 'xf-test', total: 2, offset: 0, nextCursor: null, items: ['GQ-a', 'GQ-b'].map((id) => ({ id, q: id, q_en: id, set: 'great', clusters: [], epistemicBoundary: { claimTone: 'open-question', answerAsserted: false, sourceSupportsQuestionExistenceOnly: true } })) } },
    };
    return Response.json({ jsonrpc: '2.0', id: body.id, result: results[body.method] });
  });
  return { fetcher, read: createExplorationReader(fetcher as typeof fetch, () => time), fail: () => { fail = true; }, advance: (ms: number) => { time += ms; } };
}
describe('read-only public xFrontier integration', () => {
  it('shares one handshake and snapshot across concurrent visitors and cached reads', async () => {
    const s = setup();
    const [a, b] = await Promise.all([s.read(), s.read()]);
    expect(a).toEqual(b); expect(a.source).toBe('live');
    await s.read(); expect(s.fetcher).toHaveBeenCalledTimes(4);
    for (const [url, init] of s.fetcher.mock.calls) {
      expect(url).toBe('https://xfrontier.science/mcp');
      const request = JSON.parse(String(init?.body));
      if (request.method === 'tools/call') expect(request.params.name).toBe('search_questions');
    }
  });
  it('labels expired data stale during outages, and throttles retries', async () => {
    const s = setup(); const first = await s.read(); s.advance(300_001); s.fail();
    const stale = await s.read(); expect(stale.source).toBe('stale'); expect(stale.catalog).toEqual(first.catalog);
    const count = s.fetcher.mock.calls.length; await s.read(); expect(s.fetcher).toHaveBeenCalledTimes(count);
  });
  it('returns 503 without fabricated data when the first connection fails', async () => {
    const s = setup(); s.fail(); const app = explorationRoutes(s.read);
    const response = await app.request('/catalog'); expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'xfrontier_unavailable' });
    expect((await app.request('/arbitrary-tool')).status).toBe(404);
  });
  it('rejects RPC identity mismatches', async () => {
    const read = createExplorationReader(vi.fn(async () => Response.json({ id: -1, result: {} })) as typeof fetch);
    await expect(read()).rejects.toThrow('MCP request failed');
  });
});

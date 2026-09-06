import { Hono } from 'hono';
import { object, projectExplorationCatalog, type ExplorationCatalog } from '@frontier-isles/data/xfrontier-exploration';

const ENDPOINT = 'https://xfrontier.science/mcp';
const TTL = 5 * 60_000;

/** Fixed read-only methods and endpoint; never forwards caller-supplied tools
 * or URLs. One refresh is shared by concurrent visitors, with bounded reads. */
export function createExplorationReader(fetcher: typeof fetch = fetch, now = () => Date.now()) {
  let cached: ExplorationCatalog | undefined;
  let pending: Promise<ExplorationCatalog> | undefined;
  let nextRetry = 0;
  let id = 0;
  const anchors = new Map<string, { datasetVersion: string; id: string; title: string; url: string; year: number | null }>();
  async function rpc(method: string, params: Record<string, unknown>) {
    const requestId = ++id;
    const response = await fetcher(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'MCP-Protocol-Version': '2025-06-18' },
      body: JSON.stringify({ jsonrpc: '2.0', id: requestId, method, params }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error('xFrontier unavailable');
    // The public MCP uses single-POST JSON, confirmed during initialization.
    const body = object(await response.json());
    if (body.error || body.id !== requestId) throw new Error('MCP request failed');
    return object(body.result);
  }
  function structured(result: Record<string, unknown>) {
    if (result.isError === true) throw new Error('MCP tool failed');
    if (result.structuredContent) return object(result.structuredContent);
    if (!Array.isArray(result.content)) throw new Error('Missing MCP result');
    const text = result.content.map(object).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
    return object(JSON.parse(text));
  }
  async function refresh() {
    const init = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'frontier-isles-exploration', version: '1.0.0' } });
    const server = object(init.serverInfo);
    if (server.name !== 'xfrontier' || typeof server.version !== 'string') throw new Error('Unexpected MCP server');
    const tools = await rpc('tools/list', {});
    if (!Array.isArray(tools.tools) || !tools.tools.some((t) => {
      const tool = object(t);
      return tool.name === 'search_questions' && object(tool.annotations).readOnlyHint === true;
    })) throw new Error('Required read capability missing');
    const [resource, search] = await Promise.all([
      rpc('resources/read', { uri: 'xf://questions/structure' }),
      rpc('tools/call', { name: 'search_questions', arguments: { set: 'great', limit: 200 } }),
    ]);
    if (!Array.isArray(resource.contents)) throw new Error('Missing structure resource');
    const content = resource.contents.map(object).find((r) => r.uri === 'xf://questions/structure');
    if (typeof content?.text !== 'string') throw new Error('Invalid structure resource');
    const catalog = projectExplorationCatalog(JSON.parse(content.text), structured(search), server.version, new Date(now()).toISOString());
    if (catalog.datasetVersion !== server.dataset_version) throw new Error('Dataset changed after handshake');
    cached = catalog;
    return catalog;
  }
  const read = async () => {
    if (cached && now() - Date.parse(cached.retrievedAt) < TTL) return { source: 'live' as const, catalog: cached };
    if (now() < nextRetry) {
      if (cached) return { source: 'stale' as const, catalog: cached };
      throw new Error('Retry after cooldown');
    }
    pending ??= refresh().finally(() => { pending = undefined; });
    try { return { source: 'live' as const, catalog: await pending }; }
    catch (error) {
      nextRetry = now() + 30_000;
      if (cached) return { source: 'stale' as const, catalog: cached };
      throw error;
    }
  };
  const question = async (questionId: string) => {
    const { catalog, source } = await read();
    if (!catalog.questions.some((q) => q.id === questionId)) throw new Error('Unknown question');
    const key = `${catalog.datasetVersion}:${questionId}`;
    if (anchors.has(key)) return { ...anchors.get(key)!, source };
    const result = structured(await rpc('tools/call', { name: 'get_question', arguments: { id: questionId } }));
    const q = object(result.question), wall = object(q.epistemicBoundary), anchor = object(q.sourceAnchor);
    if (result.dataset_version !== catalog.datasetVersion || q.id !== questionId || wall.answerAsserted !== false || wall.sourceSupportsQuestionExistenceOnly !== true) throw new Error('Question source changed');
    if (typeof anchor.title !== 'string' || typeof anchor.url !== 'string' || !/^https?:\/\//.test(anchor.url)) throw new Error('No safe source anchor');
    const value = { datasetVersion: catalog.datasetVersion, id: questionId, title: anchor.title, url: anchor.url, year: typeof anchor.year === 'number' ? anchor.year : null };
    if (anchors.size >= 200) anchors.clear();
    anchors.set(key, value);
    return { ...value, source };
  };
  return Object.assign(read, { question });
}

export function explorationRoutes(read = createExplorationReader()) {
  const app = new Hono();
  app.get('/catalog', async (c) => {
    c.header('Cache-Control', 'no-store');
    try { return c.json(await read()); }
    catch { return c.json({ error: 'xfrontier_unavailable' }, 503); }
  });
  app.get('/question/:id', async (c) => {
    const id = c.req.param('id');
    if (!/^GQ-[a-z0-9-]{1,116}$/.test(id)) return c.json({ error: 'invalid_question_id' }, 400);
    c.header('Cache-Control', 'no-store');
    try { return c.json(await read.question(id)); }
    catch { return c.json({ error: 'question_source_unavailable' }, 503); }
  });
  return app;
}

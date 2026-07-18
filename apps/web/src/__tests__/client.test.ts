import { describe, it, expect, vi, afterEach } from 'vitest';
import { api } from '../api/client';

/**
 * api.ledger parses the island's ledger.jsonl (text/plain, one LedgerEvent per
 * line) into the events that drive the L1 Pixi claim buildings (M4「接线上」).
 * It must be robust: skip a malformed line rather than drop the whole ledger, and
 * degrade to null (→ caller synths from eventCount) on any transport failure.
 */
const evLine = (action: string): string =>
  JSON.stringify({ ts: '2026-01-01T00:00:00.000Z', op: 'op://x', actor: { id: 'u', kind: 'human' }, credit: [], phase: 'A', action, ref: 'sha256:' + action });

afterEach(() => vi.unstubAllGlobals());

describe('api.ledger', () => {
  it('parses JSONL into LedgerEvent[], ignoring blank lines', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response([evLine('submit_claim'), '', evLine('validate')].join('\n') + '\n', { status: 200 })));
    const ev = await api.ledger('slug');
    expect(ev).toHaveLength(2);
    expect(ev?.[0]?.action).toBe('submit_claim');
    expect(ev?.[1]?.action).toBe('validate');
  });

  it('skips a malformed line rather than dropping the whole ledger', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(['{ not json', evLine('validate')].join('\n'), { status: 200 })));
    const ev = await api.ledger('slug');
    expect(ev).toHaveLength(1);
    expect(ev?.[0]?.action).toBe('validate');
  });

  it('returns null on a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })));
    expect(await api.ledger('slug')).toBeNull();
  });

  it('returns null when fetch throws (server absent — caller falls back)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('offline');
    }));
    expect(await api.ledger('slug')).toBeNull();
  });
});

/**
 * api.decideBrief posts by the draft's own content-addressed refHash — never
 * by array position — so MorningReport never has to re-fetch the list to
 * resolve "index i" into a ref, and can't mis-resolve a shifted index after
 * another draft has already been decided.
 */
describe('api.decideBrief', () => {
  it('posts to the ref-addressed endpoint, url-encoding the ref and wrapping the actor', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    await api.decideBrief('machine-curiosity', 'sha256:abc/def', 'adopt', 'github:shen-kuo');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/islands/machine-curiosity/morning-report/sha256%3Aabc%2Fdef');
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({ decision: 'adopt', actor: { id: 'github:shen-kuo', kind: 'human' } });
  });

  it('resolves to null (never throws) when the write fails — caller rolls back optimistically', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 403 })));
    expect(await api.decideBrief('machine-curiosity', 'sha256:x', 'return', 'github:nobody')).toBeNull();
  });
});

describe('api.morningReport', () => {
  it('parses the {drafts: [...]} wrapper', async () => {
    const drafts = [{ refHash: 'r1', title: 'A', dest: 'library', actorId: 'github:scout', actorKind: 'agent', credit: [], ts: '2026-07-10T00:00:00.000Z' }];
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ drafts }), { status: 200 })));
    const res = await api.morningReport('machine-curiosity');
    expect(res?.drafts).toEqual(drafts);
  });

  it('returns null on failure (caller falls back to the static BRIEF seed)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })));
    expect(await api.morningReport('machine-curiosity')).toBeNull();
  });
});

describe('api.rebuildPassage', () => {
  it('sends only the language the human authored and never submits a passage classification', async () => {
    const response = {
      event: { ts: '2026-07-18T00:00:00.000Z', op: 'op://frontier-isles/prob/target', actor: { id: 'github:shen-kuo', kind: 'human' }, credit: [], phase: 'B', action: 'rebuild' },
      degraded: false,
      effectiveAction: 'rebuild',
      refHash: `sha256:${'c'.repeat(64)}`,
      passageKind: 'frontier',
      structureId: 'struct://xfrontier/synchronization',
      sourceIslandOp: 'op://frontier-isles/prob/source',
      targetIslandOp: 'op://frontier-isles/prob/target',
    };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(response), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await api.rebuildPassage('target', {
      structureId: response.structureId,
      sourceIslandOp: response.sourceIslandOp,
      targetIslandOp: response.targetIslandOp,
      correspondences: [{ quantity: '耦合强度', inThisSubstrate: '视觉强度' }],
      boundary: '视觉耦合不是电导更新。',
      prediction: '若成立，应出现临界转变。',
      evidenceRefs: ['https://example.com/evidence'],
      language: 'zh',
      actor: 'github:shen-kuo',
    });

    expect(result?.passageKind).toBe('frontier');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/islands/target/rebuild');
    const body = JSON.parse(init.body as string);
    expect(body.actor).toEqual({ id: 'github:shen-kuo', kind: 'human' });
    expect(body.mapping.correspondences[0]).toEqual({
      quantity: { zh: '耦合强度', en: '' },
      inThisSubstrate: { zh: '视觉强度', en: '' },
    });
    expect(body.mapping.prediction).toEqual({ zh: '若成立，应出现临界转变。', en: '' });
    expect(body.mapping.boundary).toEqual({ zh: '视觉耦合不是电导更新。', en: '' });
    expect(body.mapping).toMatchObject({ authoredLanguage: 'zh', translationStatus: 'source_only' });
    expect(body.mapping).not.toHaveProperty('passageKind');
  });
});

describe('api.respondToConnection', () => {
  const draft = {
    targetRef: `sha256:${'a'.repeat(64)}`,
    action: 'refute' as const,
    body: 'The mechanism breaks outside steady state.',
    test: 'Change the energy flux and measure both transitions.',
    evidence: {
      ro_crate: 'https://example.test/response',
      role: 'replication' as const,
      hash: `sha256:${'b'.repeat(64)}`,
    },
    language: 'en' as const,
    actor: 'github:shen-kuo',
  };

  it('sends the target, argument, test, evidence, language, and attributed actor', async () => {
    const response = { responseRef: `sha256:${'c'.repeat(64)}` };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(response), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    const outcome = await api.respondToConnection('bio-compute-thermo', draft);
    expect(outcome).toEqual({ ok: true, value: response });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/islands/bio-compute-thermo/connection-response');
    expect(JSON.parse(init.body as string)).toEqual({
      targetRef: draft.targetRef,
      action: 'refute',
      body: draft.body,
      test: draft.test,
      evidence: draft.evidence,
      language: 'en',
      actor: { id: 'github:shen-kuo', kind: 'human' },
    });
  });

  it('preserves a semantic server error instead of collapsing it to null', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      JSON.stringify({ error: 'capability denied', code: 'denied' }),
      { status: 403 },
    )));
    expect(await api.respondToConnection('bio-compute-thermo', draft)).toEqual({
      ok: false,
      status: 403,
      code: 'denied',
      error: 'capability denied',
    });
  });
});

/**
 * api.relationRefResolver: gateway validates/refutes ref their RESPONSE
 * artifact; the resolver prefetches those contents so projectClaimState can
 * follow content.targetRef back to the stele's claim (ROADMAP §3.5 caveat).
 */
describe('api.ref + api.relationRefResolver (stele floors, §3.5)', () => {
  const CLAIM = `sha256:${'a'.repeat(64)}`;
  const RESP = `sha256:${'b'.repeat(64)}`;
  const mkEvent = (action: string, ref: string) =>
    ({ ts: '2026-01-01T00:00:01.000Z', op: 'op://x', actor: { id: 'u', kind: 'human' }, credit: [], phase: 'A', action, ref }) as never;

  it('api.ref resolves a stored ref to {kind, content}; null on 404', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) =>
      url.includes(encodeURIComponent(RESP))
        ? new Response(JSON.stringify({ kind: 'connection_response', content: { targetRef: CLAIM } }), { status: 200 })
        : new Response(JSON.stringify({ error: 'not found' }), { status: 404 })));
    expect(await api.ref(RESP)).toEqual({ kind: 'connection_response', content: { targetRef: CLAIM } });
    expect(await api.ref('sha256:missing')).toBeNull();
  });

  it('prefetches ONLY validate/refute refs (deduped) and returns a sync resolver', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ kind: 'connection_response', content: { targetRef: CLAIM } }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const resolver = await api.relationRefResolver([
      mkEvent('submit_claim', CLAIM), // anchor — must NOT be fetched
      mkEvent('validate', RESP),
      mkEvent('validate', RESP), // duplicate — still one fetch
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(resolver(RESP)).toEqual({ kind: 'connection_response', content: { targetRef: CLAIM } });
    expect(resolver(CLAIM)).toBeNull();
  });

  it('a failed ref fetch degrades to null — projection keeps its no-resolver tolerance', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })));
    const resolver = await api.relationRefResolver([mkEvent('refute', RESP)]);
    expect(resolver(RESP)).toBeNull();
  });
});

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

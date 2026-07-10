/**
 * The ONE place every network call lives (per the build spec). Integration
 * reconciles only this module if the server's final shapes differ; all shape
 * assumptions are captured here. Every call is best-effort: on any failure it
 * resolves to a null-ish value and the caller falls back to static data, so
 * the UI is identical online or offline.
 */
import type { LedgerEvent } from '@frontier-isles/opp';

// ── Server payload shapes (from the API table) ────────────────────────────
export interface ApiIsland {
  opId: string;
  slug: string;
  title: string;
  qfocus: string;
  domain: string;
  growth: { stage: number | string; dormant: boolean; ending?: string };
  tide: { A: number; B: number; D: number; N: number };
  members: number;
  activity: number;
  lineage: unknown;
  status: string;
}

export interface ApiMe {
  handle: string;
  kind: 'human' | 'agent' | 'pair';
}

/** Sea-plane payload (GET /api/currents) — a projection over the whole ledger. */
export interface ApiCurrent {
  from: string;
  to: string;
  kind: 'evidence' | 'bridge' | 'lineage';
  sign: 'affirm' | 'contest' | 'neutral';
  weight: number;
  directed: boolean;
  maturity?: 'proposed' | 'ratified';
}
export interface ApiWhirlpool {
  between: [string, string];
  refs: string[];
  weight: number;
}
export interface ApiSeaIsland {
  op: string;
  name: string;
  domain: string;
  vec: [number, number];
  substrate: number | null;
  chart: { x: number; y: number };
}
export interface ApiSeaData {
  currents: ApiCurrent[];
  whirlpools: ApiWhirlpool[];
  islands: ApiSeaIsland[];
}

/** Server-side actor shape (§5 ledger event actor). */
export interface ApiActor {
  id: string;
  kind: 'human' | 'agent' | 'pair';
}

/**
 * A pending morning-report draft (GET `/api/islands/:slug/morning-report`) —
 * reduced server-side from the ledger via `projectMorningReport`, keyed by
 * its own content-addressed `refHash` (never an array index).
 */
export interface MorningReportDraft {
  refHash: string;
  title: string;
  dest?: string;
  actorId: string;
  actorKind: 'human' | 'agent' | 'pair';
  credit: string[];
  ts: string;
}

/** The web app passes actor ids around as strings; the wire wants an Actor. */
const toActor = (id: string): ApiActor => ({ id, kind: 'human' });

export interface FoundingPayload {
  slug: string;
  title: string;
  name: string;
  qfocus: string;
  domain: string;
  questions: Array<{ text: string; open: boolean; rewrittenFrom?: string }>;
  votes: Record<string, number>;
  ceremonyLog: string[];
  actor: string;
}

export interface LedgerEventInput {
  actor: string;
  credit: string[];
  phase: 'A' | 'B' | 'D';
  action: string;
  flow?: string;
  payload?: unknown;
}

const TIMEOUT_MS = 4000;

async function req<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(path, {
      ...init,
      signal: ctrl.signal,
      headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const api = {
  /** Boot probe + L0 island list. Server wraps as `{islands: [...]}`. */
  listIslands: async (): Promise<ApiIsland[] | null> => {
    const res = await req<{ islands: ApiIsland[] }>('/api/islands');
    return res?.islands ?? null;
  },

  /** Sea plane: currents + whirlpools + island coordinates. Best-effort. */
  currents: () => req<ApiSeaData>('/api/currents'),

  /** Server shape: `{actor: {id, kind} | null}`; expose the app's handle view. */
  me: async (): Promise<ApiMe | null> => {
    const res = await req<{ actor: ApiActor | null }>('/api/me');
    return res?.actor ? { handle: res.actor.id, kind: res.actor.kind } : null;
  },

  devLogin: async (handle: string): Promise<ApiMe | null> => {
    const res = await req<{ actor: ApiActor }>('/api/auth/dev-login', {
      method: 'POST',
      body: JSON.stringify({ handle }),
    });
    return res?.actor ? { handle: res.actor.id, kind: res.actor.kind } : null;
  },

  logout: () => req<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),

  island: (slug: string) => req<unknown>(`/api/islands/${slug}`),

  /**
   * The island's append-only ledger as JSONL (one {@link LedgerEvent} per line).
   * Feeds `projectClaimState` so the L1 Pixi scene's claim buildings grow from the
   * real ledger (M4 「接线上」). Best-effort: null on any failure → caller synths
   * from eventCount so the scene still renders. The endpoint returns text/plain,
   * not JSON, so it bypasses `req` (which parses JSON) and parses line-by-line.
   */
  ledger: async (slug: string): Promise<LedgerEvent[] | null> => {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      const res = await fetch(`/api/islands/${slug}/ledger.jsonl`, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      const text = await res.text();
      const events: LedgerEvent[] = [];
      for (const line of text.split('\n')) {
        const s = line.trim();
        if (!s) continue;
        try {
          events.push(JSON.parse(s) as LedgerEvent);
        } catch {
          /* skip a malformed line rather than drop the whole ledger */
        }
      }
      return events;
    } catch {
      return null;
    }
  },

  /**
   * Last night's AI-authored dock drafts, reduced from the real ledger
   * (`@frontier-isles/core`'s `projectMorningReport`, server-side) — not the
   * static `BRIEF` seed. Only unresolved (`pending`) drafts are on the wire;
   * once adopted/returned a draft leaves the inbox for good (the decision
   * itself lives on in the ledger).
   */
  morningReport: (slug: string) =>
    req<{ drafts: MorningReportDraft[] }>(`/api/islands/${slug}/morning-report`),

  /**
   * Adopt or return a morning-report draft by its own content-addressed ref
   * (from `api.morningReport`) — never by array position, so a stale index
   * can never resolve the wrong draft after the list has changed shape.
   */
  decideBrief: (slug: string, refHash: string, decision: 'adopt' | 'return', actor: string) =>
    req<unknown>(`/api/islands/${slug}/morning-report/${encodeURIComponent(refHash)}`, {
      method: 'POST',
      body: JSON.stringify({ decision, actor: toActor(actor) }),
    }),

  /** Append a ledger event (vote, transplant, focus, …). */
  postEvent: (slug: string, event: LedgerEventInput) =>
    req<unknown>(`/api/islands/${slug}/events`, {
      method: 'POST',
      body: JSON.stringify({ ...event, actor: toActor(event.actor) }),
    }),

  /** Founding ceremony → creates a new island. Server wraps as `{island}`. */
  found: async (payload: FoundingPayload): Promise<unknown | null> => {
    const res = await req<{ island: unknown }>('/api/islands', {
      method: 'POST',
      body: JSON.stringify({ ...payload, actor: toActor(payload.actor) }),
    });
    return res?.island ?? null;
  },

  // Leavability links (rendered in the footer, never fetched here).
  problemMdUrl: (slug: string) => `/api/islands/${slug}/problem.md`,
  ledgerJsonlUrl: (slug: string) => `/api/islands/${slug}/ledger.jsonl`,
};

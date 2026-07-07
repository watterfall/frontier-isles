/**
 * The ONE place every network call lives (per the build spec). Integration
 * reconciles only this module if the server's final shapes differ; all shape
 * assumptions are captured here. Every call is best-effort: on any failure it
 * resolves to a null-ish value and the caller falls back to static data, so
 * the UI is identical online or offline.
 */

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

/** Server-side actor shape (§5 ledger event actor). */
export interface ApiActor {
  id: string;
  kind: 'human' | 'agent' | 'pair';
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

  morningReport: (slug: string) =>
    req<{ drafts: Array<{ refHash: string; kind: string; content: unknown }> }>(
      `/api/islands/${slug}/morning-report`,
    ),

  /**
   * Adopt or return a morning-report brief by its position in the report.
   * The wire wants the draft's content-address; the drafts are fetched to
   * resolve index → refHash, so the HITL chain lands on the real ledger.
   */
  decideBrief: async (slug: string, briefIndex: number, decision: 'adopt' | 'return', actor: string) => {
    const report = await api.morningReport(slug);
    const refHash = report?.drafts?.[briefIndex]?.refHash;
    if (!refHash) return null;
    return req<unknown>(`/api/islands/${slug}/morning-report/${refHash}`, {
      method: 'POST',
      body: JSON.stringify({ decision, actor: toActor(actor) }),
    });
  },

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

/**
 * The ONE place every network call lives (per the build spec). Integration
 * reconciles only this module if the server's final shapes differ; all shape
 * assumptions are captured here. Every call is best-effort: on any failure it
 * resolves to a null-ish value and the caller falls back to static data, so
 * the UI is identical online or offline.
 */
import type { LedgerEvent } from '@frontier-isles/opp';
import type { BridgeArtifactType, EvidenceRef } from '@frontier-isles/core';

/** A transplantable driftwood atom (GET `/api/islands/:slug/driftwood`). */
export interface DriftwoodAtom {
  refHash: string;
  atom: string;
  text: string;
  actorId: string;
}

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

/** My Harbor (GET /api/harbor, depth-plan-v1 §3(d)) — the session actor's
 * cross-island place-plane footprint (memberships + capability grants). */
export interface ApiHarbor {
  actorId: string;
  islandSlugs: string[];
}

/** A structure (GET /api/structures) — a cross-substrate regularity (§九). */
export interface ApiStructure {
  schema: string;
  id: string;
  title: { zh: string; en: string };
  statement: { zh: string; en: string };
  status: 'proposed' | 'active' | 'retired';
  theme?:
    | 'collective-dynamics'
    | 'causal-inference'
    | 'unknown-mapping'
    | 'knowledge-commons'
    | 'living-computation'
    | 'simulation-twins';
  isomorphism?: string;
  provenance?: {
    source: string;
    url: string;
    recordIds: number[];
    reviewedAt: string;
  };
  license: string;
}

/** One structure⇄island edge (a reduce over rebuild events). */
export interface ApiStructureEdge {
  structureId: string;
  islandOp: string;
  weight: number;
  actors: string[];
}

/** Per-structure frontier: rebuilt islands + the near gaps (the visible frontier). */
export interface ApiStructureFrontier {
  structureId: string;
  rebuilt: string[];
  gaps: string[];
}

/** One resolved human-authored explanation behind a compressed structure edge. */
export interface ApiStructureMapping {
  refHash: string;
  actor: string;
  ts: string;
  structureId: string;
  sourceIslandOp?: string;
  islandOp: string;
  correspondences: Array<{
    quantity: { zh: string; en: string };
    inThisSubstrate: { zh: string; en: string };
  }>;
  prediction?: { zh: string; en: string };
  boundary?: { zh: string; en: string };
  evidenceRefs?: string[];
  authoredLanguage?: 'zh' | 'en';
  translationStatus?: 'source_only' | 'human' | 'assisted';
}

/** GET /api/structures/graph payload. */
export interface ApiStructureGraph {
  edges: ApiStructureEdge[];
  frontier: ApiStructureFrontier[];
  mappings: ApiStructureMapping[];
}

export interface RebuildPassageDraft {
  structureId: string;
  sourceIslandOp: string;
  targetIslandOp: string;
  correspondences: Array<{ quantity: string; inThisSubstrate: string }>;
  prediction: string;
  boundary: string;
  language: 'zh' | 'en';
  actor: string;
  evidenceRefs?: string[];
}

export interface ApiRebuildPassageResult {
  event: LedgerEvent;
  degraded: false;
  effectiveAction: 'rebuild';
  refHash: string;
  passageKind: 'charted' | 'frontier';
  structureId: string;
  sourceIslandOp: string;
  targetIslandOp: string;
}

/** Sea-plane payload (GET /api/currents) — a projection over the whole ledger. */
export interface ApiCurrentRecord {
  targetRef: string;
  targetKind?: string;
  targetSummary?: string;
  targetEvidence?: EvidenceRef;
  responseRef?: string;
  responseKind?: string;
  responseBody?: string;
  responseTest?: string;
  responseEvidence?: EvidenceRef;
  action: LedgerEvent['action'];
  actor: string;
  actorKind: LedgerEvent['actor']['kind'];
  ts: string;
  historical: boolean;
}

export interface ApiCurrent {
  from: string;
  to: string;
  kind: 'evidence' | 'bridge' | 'lineage';
  sign: 'affirm' | 'contest' | 'neutral';
  weight: number;
  directed: boolean;
  maturity?: 'proposed' | 'ratified';
  records: ApiCurrentRecord[];
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

export interface ConnectionResponseDraft {
  targetRef: string;
  action: 'validate' | 'refute';
  body: string;
  test: string;
  evidence: EvidenceRef;
  language: 'zh' | 'en';
  actor: string;
}

export interface ApiConnectionResponseResult {
  event: LedgerEvent;
  degraded: boolean;
  effectiveAction: string;
  refHash: string;
  targetRef: string;
  responseRef: string;
  sourceIslandOp: string;
  respondingIslandOp: string;
}

export type ApiWriteOutcome<T> =
  | { ok: true; value: T }
  | { ok: false; status: number; code?: string; error: string };

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

/** A write variant that preserves server validation/capability errors for the UI. */
async function reqOutcome<T>(path: string, init?: RequestInit): Promise<ApiWriteOutcome<T>> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(path, {
      ...init,
      signal: ctrl.signal,
      headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    });
    const payload = await res.json().catch(() => null) as { error?: unknown; code?: unknown } | null;
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        ...(typeof payload?.code === 'string' ? { code: payload.code } : {}),
        error: typeof payload?.error === 'string' ? payload.error : `request failed (${res.status})`,
      };
    }
    return { ok: true, value: payload as T };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error && error.name === 'AbortError' ? 'request timed out' : 'network unavailable',
    };
  } finally {
    clearTimeout(timer);
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

  /** Structures (执行纲要 §九) — the portable 结构 half of the bipartite graph. */
  structures: () => req<{ structures: ApiStructure[] }>('/api/structures'),

  /** The structure ⇄ 现象 graph: edges + per-structure frontier, reduced over
   *  the whole ledger server-side. Best-effort (falls back to a static graph). */
  structureGraph: () => req<ApiStructureGraph>('/api/structures/graph'),

  /** Complete one human-authored Ferry Dock passage. Text is sent only in the
   * language actually authored; translation is a later ferryman aid, never a
   * prerequisite for the conceptual mapping. */
  rebuildPassage: (targetSlug: string, input: RebuildPassageDraft) => {
    const sourceOnly = (text: string) => input.language === 'zh'
      ? { zh: text.trim(), en: '' }
      : { zh: '', en: text.trim() };
    return req<ApiRebuildPassageResult>(`/api/islands/${targetSlug}/rebuild`, {
      method: 'POST',
      body: JSON.stringify({
        actor: toActor(input.actor),
        mapping: {
          structureId: input.structureId,
          sourceIslandOp: input.sourceIslandOp,
          islandOp: input.targetIslandOp,
          correspondences: input.correspondences.map((item) => ({
            quantity: sourceOnly(item.quantity),
            inThisSubstrate: sourceOnly(item.inThisSubstrate),
          })),
          prediction: sourceOnly(input.prediction),
          boundary: sourceOnly(input.boundary),
          ...(input.evidenceRefs?.length ? { evidenceRefs: input.evidenceRefs } : {}),
          authoredLanguage: input.language,
          translationStatus: 'source_only',
        },
      }),
    });
  },

  /** Record a real support/refutation artifact against one focused connection. */
  respondToConnection: (respondingSlug: string, input: ConnectionResponseDraft) =>
    reqOutcome<ApiConnectionResponseResult>(`/api/islands/${respondingSlug}/connection-response`, {
      method: 'POST',
      body: JSON.stringify({
        targetRef: input.targetRef,
        action: input.action,
        body: input.body.trim(),
        test: input.test.trim(),
        evidence: input.evidence,
        language: input.language,
        actor: toActor(input.actor),
      }),
    }),

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

  /** My Harbor (depth-plan-v1 §3(d)): the session actor's footprint. `null`
   * when logged out or the server is absent — the atlas then opens
   * world-wide, exactly as without a harbor (removal test §3(d)④). */
  harbor: async (): Promise<ApiHarbor | null> => {
    const res = await req<{ harbor: ApiHarbor | null }>('/api/harbor');
    return res?.harbor ?? null;
  },

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

  /**
   * The Driftwood Garden's transplantable atoms, resolved server-side
   * (GET `/api/islands/:slug/driftwood`). Best-effort → null on failure.
   */
  driftwood: (slug: string) =>
    req<{ atoms: DriftwoodAtom[] }>(`/api/islands/${slug}/driftwood`),

  /**
   * Human transplant-through-dock (Phase B.3): forms one of the four bridge
   * artifacts at the dock and lands it at `dest`. Writes exactly one
   * `transplant` event (which the ritual layer then animates on next poll).
   * Best-effort like every call here; returns null on any failure.
   */
  transplant: (
    slug: string,
    input: { driftwoodRef: string; type: BridgeArtifactType; dest: string; body?: string; flow?: string; actor: string },
  ) =>
    req<unknown>(`/api/islands/${slug}/transplant`, {
      method: 'POST',
      body: JSON.stringify({
        driftwoodRef: input.driftwoodRef,
        type: input.type,
        dest: input.dest,
        body: input.body,
        flow: input.flow,
        actor: toActor(input.actor),
      }),
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

import { useEffect, useState } from 'react';
import { api, type ApiHarbor, type ApiIsland } from './client';
import { DATA, type IslandDatum } from './fallback';
import { applyAtlasDetail, loadAtlasDetail, type AtlasDetailMap } from './atlasDetail';

export type DataSource = 'loading' | 'api' | 'fallback';

export interface AppData {
  /** L0 chart islands — always positioned from the prototype layout; server
   *  values (members/activity/stage/status) and the deferred atlas detail
   *  (brief/citation) overlay when they arrive. */
  islands: readonly IslandDatum[];
  source: DataSource;
  /** Ledger actor id for POSTed events (dev fallback when no auth). */
  actor: string;
  /** My Harbor (depth-plan-v1 §3(d)) — the session actor's footprint, or
   *  `null` (logged out / offline): the atlas then opens world-wide. */
  harbor: ApiHarbor | null;
}

/** Server growth stages are names (core GrowthStage); the chart layout indexes them. */
const STAGE_INDEX: Record<string, number> = { empty: 0, hut: 1, academy: 2, school: 3 };

/** Merge a server island list onto the positioned prototype layout by title.
 * Identity-preserving: when the server holds nothing new, the returned array
 * (and each unchanged island) keeps its old reference — a gratuitously fresh
 * islands array re-keys the stage-boot effect downstream and tears down the
 * whole Pixi atlas (visibly resetting an in-flight explore session). */
function reconcile(list: ApiIsland[], detail: AtlasDetailMap): readonly IslandDatum[] {
  const byTitle = new Map(list.map((i) => [i.title, i]));
  // The deferred card prose/citations fold in HERE rather than in a second
  // setState: the islands array may only churn once at boot, and it already
  // churns for the server overlay.
  const base = applyAtlasDetail(DATA, detail);
  let changed = false;
  const next = base.map((d) => {
    const s = byTitle.get(d.n.zh);
    if (!s) return d;
    const stage = typeof s.growth?.stage === 'string' ? STAGE_INDEX[s.growth.stage] : s.growth?.stage;
    const merged = {
      ...d,
      m: s.members ?? d.m,
      a: s.activity ?? d.a,
      st: stage ?? d.st,
      dor: s.growth?.dormant ?? d.dor,
      slug: s.slug ?? d.slug,
    };
    if (merged.m === d.m && merged.a === d.a && merged.st === d.st && merged.dor === d.dor && merged.slug === d.slug) {
      return d;
    }
    changed = true;
    return merged;
  });
  return changed ? next : base;
}

/**
 * Tries the API exactly once at boot. On any failure the app runs fully on
 * the static fallback and the UI is identical (build-spec resilience rule).
 */
export function useAppData(): AppData {
  const [state, setState] = useState<AppData>({ islands: DATA, source: 'loading', actor: 'github:demo', harbor: null });

  useEffect(() => {
    let alive = true;
    void (async () => {
      // The detail chunk rides alongside the API calls instead of after them:
      // it is same-origin, immutable-cached static content, so it costs no extra
      // wall-clock, and folding it into the same setState keeps the islands
      // array to a single churn at boot.
      const [list, me, detail] = await Promise.all([
        api.listIslands(),
        api.me(),
        loadAtlasDetail(),
      ]);
      if (!alive) return;
      // Dev bypass (DECISIONS §6): no session → log in as the seeded sample-island
      // master so ledger writes pass the capability gateway. Real auth replaces this.
      const session = me ?? (list ? await api.devLogin('shen-kuo') : null);
      if (!alive) return;
      const actor = session?.handle ?? 'github:demo';
      // My Harbor needs the session cookie the lines above just established.
      const harbor = session ? await api.harbor() : null;
      if (!alive) return;
      if (list && list.length > 0) {
        setState({ islands: reconcile(list, detail), source: 'api', actor, harbor });
      } else {
        setState({ islands: applyAtlasDetail(DATA, detail), source: 'fallback', actor, harbor });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

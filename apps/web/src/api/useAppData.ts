import { useEffect, useState } from 'react';
import { api, type ApiHarbor, type ApiIsland } from './client';
import { DATA, type IslandDatum } from './fallback';
import { loadAtlasDetail } from './atlasDetail';

export type DataSource = 'loading' | 'api' | 'fallback';

export interface AppData {
  /** L0 chart islands — always positioned from the prototype layout; server
   *  values (members/activity/stage/status) overlay when the API responds. */
  islands: readonly IslandDatum[];
  source: DataSource;
  /** Ledger actor id for POSTed events (dev fallback when no auth). */
  actor: string;
  /** My Harbor (depth-plan-v1 §3(d)) — the session actor's footprint, or
   *  `null` (logged out / offline): the atlas then opens world-wide. */
  harbor: ApiHarbor | null;
  /** Flips once the deferred atlas detail is in the cache, purely so views
   *  that read it through `atlasDetailOf` re-render. Deliberately a scalar and
   *  NOT a merge into `islands`: see the note on `reconcile`. */
  detailReady: boolean;
}

/** Server growth stages are names (core GrowthStage); the chart layout indexes them. */
const STAGE_INDEX: Record<string, number> = { empty: 0, hut: 1, academy: 2, school: 3 };

/** Merge a server island list onto the positioned prototype layout by title.
 * Identity-preserving: when the server holds nothing new, the returned array
 * (and each unchanged island) keeps its old reference — a gratuitously fresh
 * islands array re-keys the stage-boot effect downstream and tears down the
 * whole Pixi atlas (visibly resetting an in-flight explore session).
 *
 * This is why the deferred atlas detail is NOT merged in here. Doing so cost a
 * CI run: folding it in meant the boot state had to wait for that chunk, the
 * resulting array landed late — after exploration had begun — and the atlas was
 * rebuilt underneath an in-flight session, so docking never reached L1. Detail
 * is read where it is displayed, through `atlasDetailOf`, and never enters this
 * array. */
function reconcile(list: ApiIsland[]): readonly IslandDatum[] {
  const byTitle = new Map(list.map((i) => [i.title, i]));
  let changed = false;
  const next = DATA.map((d) => {
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
  return changed ? next : DATA;
}

/**
 * Tries the API exactly once at boot. On any failure the app runs fully on
 * the static fallback and the UI is identical (build-spec resilience rule).
 */
export function useAppData(): AppData {
  const [state, setState] = useState<AppData>({
    islands: DATA,
    source: 'loading',
    actor: 'github:demo',
    harbor: null,
    detailReady: false,
  });

  // Deferred atlas detail, on its own timeline. Nothing waits for it and it
  // never touches `islands` — it fills a cache and flips a scalar, so late
  // arrival can only add prose to cards, never rebuild the atlas.
  useEffect(() => {
    let alive = true;
    void loadAtlasDetail().then(() => {
      if (alive) setState((s) => (s.detailReady ? s : { ...s, detailReady: true }));
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [list, me] = await Promise.all([api.listIslands(), api.me()]);
      if (!alive) return;
      // Dev bypass (DECISIONS §6): no session → log in as the seeded sample-island
      // master so ledger writes pass the capability gateway. Real auth replaces this.
      const session = me ?? (list ? await api.devLogin('shen-kuo') : null);
      if (!alive) return;
      const actor = session?.handle ?? 'github:demo';
      // My Harbor needs the session cookie the lines above just established.
      const harbor = session ? await api.harbor() : null;
      if (!alive) return;
      setState((s) =>
        list && list.length > 0
          ? { ...s, islands: reconcile(list), source: 'api', actor, harbor }
          : { ...s, islands: DATA, source: 'fallback', actor, harbor },
      );
    })();
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

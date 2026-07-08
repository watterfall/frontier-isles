/**
 * useSeaData — the sea plane, best-effort like every call. Starts from the
 * fixture-derived static set (so the SeaLayer renders identically with the server
 * absent), then overlays the live projection from GET /api/currents when it
 * returns a non-empty sea. `source` tells the UI which it is (for a small badge).
 */
import { useEffect, useState } from 'react';
import { api, type ApiSeaData } from './client';
import { fixtureSeaData } from './seaFallback';

export interface SeaData extends ApiSeaData {
  source: 'server' | 'fallback';
}

export function useSeaData(): SeaData {
  const [data, setData] = useState<SeaData>(() => ({ ...fixtureSeaData(), source: 'fallback' }));

  useEffect(() => {
    let alive = true;
    void api.currents().then((res) => {
      // Only replace the static sea when the server actually has relations —
      // an empty live sea should not blank out the offline-identical fallback.
      if (alive && res && res.currents.length > 0) setData({ ...res, source: 'server' });
    });
    return () => {
      alive = false;
    };
  }, []);

  return data;
}

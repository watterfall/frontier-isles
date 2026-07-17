/**
 * Fixture-derived sea data — the offline twin of GET /api/currents. It synthesizes
 * the SAME cross-island relations the server seeds (@frontier-isles/data
 * SEA_SEED_RELATIONS) as ledger events and runs the SAME projection, so the sea is
 * identical online and offline (UI-identical rule). Every current here references a
 * REAL chart slug, so the SeaLayer lays it out over the actual island positions.
 */
import type { ActionType, LedgerEvent } from '@frontier-isles/opp';
import { projectCurrents, projectWhirlpools } from '@frontier-isles/core';
import { FRONTIER_ATLAS } from '@frontier-isles/data/atlas';
import { SEA_SEED_RELATIONS, domainToVec, type SeaVerb } from '@frontier-isles/data/sea';
import type { ApiSeaData, ApiSeaIsland } from './client';

const OP = (slug: string) => `op://frontier-isles/prob/${slug}`;

const PHASE: Record<SeaVerb | 'submit_claim' | 'publish', 'A' | 'B' | 'D'> = {
  validate: 'D',
  refute: 'D',
  fork: 'A',
  merge_back: 'D',
  bridge_propose: 'B',
  bridge_accept: 'B',
  submit_claim: 'D',
  publish: 'B',
};

/** Deterministic sha256-shaped ref from a key (projection groups by string equality). */
function refOf(key: string): string {
  let hex = '';
  for (const ch of key) hex += ch.charCodeAt(0).toString(16).padStart(2, '0');
  return `sha256:${(hex + '0'.repeat(64)).slice(0, 64)}`;
}

let clock = 0;
function ev(op: string, action: ActionType, phase: 'A' | 'B' | 'D', ref: string): LedgerEvent {
  clock += 1;
  return {
    ts: new Date(Date.UTC(2026, 3, 1, 0, clock)).toISOString(),
    op,
    actor: { id: 'github:seed', kind: 'human' },
    credit: [],
    phase,
    action,
    ref,
  };
}

/** The sample island (not in FRONTIER_ATLAS) — matches the server seed's chart meta. */
const SAMPLE: ApiSeaIsland = {
  op: OP('machine-curiosity'),
  name: 'AI 之问',
  domain: '交叉',
  vec: domainToVec('交叉'),
  substrate: null, // no atlas score → no sea depth (honest absence)
  chart: { x: 802, y: 522 },
};

export function fixtureSeaData(): ApiSeaData {
  clock = 0;
  const events: LedgerEvent[] = [];
  const anchorRef = new Map<string, string>();
  const ensureAnchor = (slug: string, artifact: 'claim' | 'publish'): string => {
    const key = `${slug}:${artifact}`;
    let ref = anchorRef.get(key);
    if (!ref) {
      ref = refOf(key);
      anchorRef.set(key, ref);
      const action: ActionType = artifact === 'claim' ? 'submit_claim' : 'publish';
      events.push(ev(OP(slug), action, PHASE[action], ref));
    }
    return ref;
  };

  for (const rel of SEA_SEED_RELATIONS) {
    const ref = ensureAnchor(rel.anchor, rel.artifact);
    events.push(ev(OP(rel.reactor), rel.verb as ActionType, PHASE[rel.verb], ref));
  }

  const islands: ApiSeaIsland[] = [
    ...FRONTIER_ATLAS.map((f) => {
      const s = f.scores?.[6];
      return {
        op: OP(f.slug),
        name: f.title.zh,
        domain: f.domain,
        vec: domainToVec(f.domain),
        substrate: typeof s === 'number' ? s / 5 : null,
        chart: { x: f.chart.x, y: f.chart.y },
      };
    }),
    SAMPLE,
  ];

  return { currents: projectCurrents(events), whirlpools: projectWhirlpools(events), islands };
}

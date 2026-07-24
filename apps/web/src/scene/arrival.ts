import type { Bilingual } from '@frontier-isles/data/frontiers';
import type { DistrictSurveyState } from '../components/island/islandDepth';
import type { IslandDistrictId } from '../state/explorationSession';

/**
 * Arrival choreography — the staged materialisation of a generated island.
 *
 * Every beat is bound to something real: districts materialise in their
 * evidence-unlock order and a `sealed` district never gets a beat (it stays
 * foundation-only, exactly as gated); the stele beat exists only when the
 * ledger projected claims; the lamp beat only when stations are actually
 * active. The sequence narrates the island's recorded state — it never
 * invents progress.
 */
export type ArrivalStage =
  | { kind: 'terrain' }
  | { kind: 'district'; districtId: IslandDistrictId; name: Bilingual }
  | { kind: 'claims' }
  | { kind: 'lamps' };

export interface ArrivalInput {
  districts: readonly { id: IslandDistrictId; name: Bilingual; state: DistrictSurveyState }[];
  claimCount: number;
  activeStationCount: number;
}

export function buildArrivalStages(input: ArrivalInput): ArrivalStage[] {
  const stages: ArrivalStage[] = [{ kind: 'terrain' }];
  for (const district of input.districts) {
    if (district.state === 'sealed') continue;
    stages.push({ kind: 'district', districtId: district.id, name: district.name });
  }
  if (input.claimCount > 0) stages.push({ kind: 'claims' });
  if (input.activeStationCount > 0) stages.push({ kind: 'lamps' });
  return stages;
}

/** A stage's content shows once its beat has passed (or the stage doesn't
 * exist — absent content needs no gate). */
export function stageVisible(
  stages: readonly ArrivalStage[],
  kind: ArrivalStage['kind'],
  phase: number,
  done: boolean,
): boolean {
  if (done) return true;
  const index = stages.findIndex((stage) => stage.kind === kind);
  return index === -1 || phase > index;
}

import { describe, expect, it } from 'vitest';
import { buildArrivalStages, stageVisible } from '../scene/arrival';
import type { IslandDistrictId } from '../state/explorationSession';

const bi = (zh: string) => ({ zh, en: zh });
const district = (id: string, state: 'surveyed' | 'available' | 'sealed') => ({
  id: id as IslandDistrictId,
  name: bi(id),
  state,
});

describe('buildArrivalStages', () => {
  it('gives beats only to unsealed districts, in projection order', () => {
    const stages = buildArrivalStages({
      districts: [district('harbor', 'surveyed'), district('inquiry', 'available'), district('observatory', 'sealed')],
      claimCount: 0,
      activeStationCount: 0,
    });
    expect(stages.map((s) => (s.kind === 'district' ? s.districtId : s.kind))).toEqual([
      'terrain', 'harbor', 'inquiry',
    ]);
  });

  it('adds stele and lamp beats only when the ledger actually has them', () => {
    const none = buildArrivalStages({ districts: [], claimCount: 0, activeStationCount: 0 });
    expect(none.map((s) => s.kind)).toEqual(['terrain']);
    const both = buildArrivalStages({ districts: [], claimCount: 2, activeStationCount: 1 });
    expect(both.map((s) => s.kind)).toEqual(['terrain', 'claims', 'lamps']);
  });
});

describe('stageVisible', () => {
  const stages = buildArrivalStages({
    districts: [district('harbor', 'available')],
    claimCount: 1,
    activeStationCount: 1,
  }); // terrain(0) harbor(1) claims(2) lamps(3)

  it('reveals a stage only after its beat has passed', () => {
    expect(stageVisible(stages, 'claims', 2, false)).toBe(false);
    expect(stageVisible(stages, 'claims', 3, false)).toBe(true);
    expect(stageVisible(stages, 'lamps', 3, false)).toBe(false);
    expect(stageVisible(stages, 'lamps', 4, false)).toBe(true);
  });

  it('treats done (and absent stages) as fully visible', () => {
    expect(stageVisible(stages, 'lamps', 0, true)).toBe(true);
    const bare = buildArrivalStages({ districts: [], claimCount: 0, activeStationCount: 0 });
    expect(stageVisible(bare, 'claims', 0, false)).toBe(true);
  });
});

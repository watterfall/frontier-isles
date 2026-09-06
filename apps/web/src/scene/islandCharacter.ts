import type { StationKind } from '@frontier-isles/core';
import type { FrontierProgram } from '../components/island/islandDepth';
import { STATION_PLACES, type IslandLayout } from './stationSpatial';

type Bi = { zh: string; en: string };
export interface IslandCharacter {
  program: FrontierProgram;
  name: Bi;
  description: Bi;
  accent: string;
  layout: IslandLayout;
  positions: Record<StationKind, { gx: number; gy: number }>;
  walk: StationKind[];
}
const CHARACTERS: Record<FrontierProgram, { name: Bi; description: Bi; accent: string; layout: IslandLayout; order: StationKind[] }> = {
  unknowns: { name:{zh:'留白庭',en:'Court of open questions'}, description:{zh:'问题墙与散木园相邻，沿着异常和未完成的线索走。',en:'The question wall meets the unfinished garden: follow anomalies and loose ends.'}, accent:'#725575', layout:'organic', order:['questions','driftwood','workshop','data','library','canvas','gallery','tearoom'] },
  sensing: { name:{zh:'观测台地',en:'Observation terraces'}, description:{zh:'数据台与文献阁相邻，从观测走回测量的条件。',en:'The measurement terrace sits beside the library: trace observations to their conditions.'}, accent:'#386d81', layout:'organic', order:['data','library','questions','canvas','workshop','driftwood','gallery','tearoom'] },
  commons: { name:{zh:'共研书院',en:'Commons court'}, description:{zh:'文献阁与讨论亭相邻，在不同论证之间往返。',en:'The library meets the discussion pavilion: move between arguments.'}, accent:'#826342', layout:'courtyard', order:['library','tearoom','questions','canvas','workshop','data','gallery','driftwood'] },
  transfer: { name:{zh:'接榫工坊',en:'Joining grounds'}, description:{zh:'白板厅与实验坊相邻，把方法的对应与差异放在一起看。',en:'The debate hall meets the workshop: examine where methods correspond and diverge.'}, accent:'#9b5839', layout:'organic', order:['canvas','workshop','data','library','questions','driftwood','gallery','tearoom'] },
  simulation: { name:{zh:'模型回廊',en:'Model cloister'}, description:{zh:'实验坊与数据台相邻，往返于模型规则与可观测结果。',en:'The workshop meets the measurement terrace: move between rules and observable outcomes.'}, accent:'#4b6485', layout:'courtyard', order:['workshop','data','library','canvas','questions','driftwood','gallery','tearoom'] },
  living: { name:{zh:'生长庭院',en:'Living garden'}, description:{zh:'实验坊与散木园相邻，从活体的边界追问可行的方法。',en:'The workshop meets the unfinished garden: explore methods through the limits of living systems.'}, accent:'#426f55', layout:'organic', order:['workshop','driftwood','data','library','questions','canvas','gallery','tearoom'] },
};
// Slots follow the perimeter in spatial order. The identity changes the entrance
// orientation, never the semantic neighbors. No strength or maturity is encoded.
const RING: StationKind[] = ['questions','workshop','library','data','canvas','gallery','tearoom','driftwood'];
export function islandCharacter(program: FrontierProgram, slug: string): IslandCharacter {
  const family = CHARACTERS[program];
  let seed = 5381;
  for (const char of slug) seed = (Math.imul(seed,33) ^ char.charCodeAt(0)) >>> 0;
  const offset = (seed % 4) * 2;
  // Use the well-spaced perimeter in both terrain grammars. This preserves
  // readable silhouettes and leaves the center free for the domain landmark.
  const positions = { dock: STATION_PLACES.dock.organic } as IslandCharacter['positions'];
  family.order.forEach((station,index) => { positions[station] = STATION_PLACES[RING[(index+offset)%8]!]!.organic; });
  const bySlot = RING.map(slot => family.order[(RING.indexOf(slot)-offset+8)%8]!);
  return { ...family, program, positions, walk:['dock',...bySlot.slice(4),...bySlot.slice(0,4),'dock'] };
}

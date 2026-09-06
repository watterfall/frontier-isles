import type { BuildingFloorPlan } from './islandDepth';
import { buildingRooms } from './islandDepth';
import { BUILDING_EXPLORATION, roomExcerpt } from './buildingExploration';

/** A content topology, not an invented physical floor count. Every room resolves
 * to retained material addresses used by the reader and its return history. */
export function BuildingPlan({plan,lang,selected,visited=[],onRoom}: {
  plan:BuildingFloorPlan;lang:'zh'|'en';selected?:string;visited?:readonly string[];onRoom:(id:string)=>void;
}) {
  const rooms=buildingRooms(plan), program=BUILDING_EXPLORATION[plan.station];
  return <nav className="fi-building-plan" data-form={program.form} aria-label={lang==='zh'?'建筑研究结构':'Research spaces in this building'}>
    <div className="fi-building-plan-rooms">{rooms.map((room,index)=><button type="button" key={room.id} data-room-enter={room.id}
      aria-current={selected===room.id?'location':undefined} onClick={()=>onRoom(room.id)}>
      <span className="fi-room-door" aria-hidden="true"/>
      <strong>{room.title[lang]}</strong>
      <span className="fi-room-preview">{roomExcerpt(room.items,lang)}</span>
      <small>{visited.some(id=>room.floorIds.includes(id)||id===room.id)?(lang==='zh'?'曾在此阅读':'Previously read'):(index===0?(lang==='zh'?'入口':'Entry'):(lang==='zh'?'可直接进入':'Open to explore'))}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5"/></svg></small>
    </button>)}</div>
    <p>{lang==='zh'?'研究内容结构示意，可从任一房间进入。':'A map of the material. Enter any room.'}</p>
  </nav>;
}

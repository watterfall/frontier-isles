import { useEffect, useReducer } from 'react';
import type { StationKind } from '@frontier-isles/core';

export interface ResearchAddress { station: StationKind; room?: string }
export interface ExplorationNavigation {
  selected: StationKind | null;
  reading: ResearchAddress | null;
  history: ResearchAddress[];
  cursor: number;
}
export type NavigationAction =
  | { type: 'approach'; station: StationKind }
  | { type: 'read'; address: ResearchAddress }
  | { type: 'back' | 'outside' | 'overview' | 'reset' };
export const emptyNavigation = (): ExplorationNavigation => ({ selected:null, reading:null, history:[], cursor:-1 });
const sameAddress = (a:ResearchAddress|undefined, b:ResearchAddress) => a?.station===b.station && a.room===b.room;

/** UI history is a reversible reading trail, never ledger activity or progress. */
export function navigationReducer(state:ExplorationNavigation, action:NavigationAction):ExplorationNavigation {
  switch(action.type) {
    case 'reset': return emptyNavigation();
    case 'overview': return {...state,selected:null,reading:null};
    case 'outside': return {...state,reading:null};
    case 'approach': return {...state,selected:action.station,reading:null};
    case 'back': {
      if(state.cursor<=0)return {...state,reading:null};
      const cursor=state.cursor-1, reading=state.history[cursor]!;
      return {...state,cursor,reading,selected:reading.station};
    }
    case 'read': {
      const address=action.address;
      if(sameAddress(state.history[state.cursor],address))return {...state,selected:address.station,reading:address};
      const history=[...state.history.slice(0,state.cursor+1),address].slice(-30);
      return {...state,selected:address.station,reading:address,history,cursor:history.length-1};
    }
  }
}
export function useExplorationNavigation(slug:string) {
  const [state,dispatch]=useReducer(navigationReducer,undefined,emptyNavigation);
  useEffect(()=>dispatch({type:'reset'}),[slug]);
  return {state,dispatch};
}

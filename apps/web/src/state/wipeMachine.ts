/**
 * The L0 ↔ L1 view holder. Both directions travel via App's shared-axis View
 * Transition; `switch` commits a destination that transition already covers.
 * (The legacy begin/raf/mid/end tidal-sweep choreography was retired with the
 * ScrollWipe overlay once View Transitions took over both directions.)
 */

export type WipeView = 'chart' | 'island';

export interface WipeState {
  /** The currently displayed screen. */
  view: WipeView;
}

/** Commit a view already covered by another spatial transition. */
export type WipeAction = { type: 'switch'; view: WipeView };

export function initialWipe(view: WipeView = 'chart'): WipeState {
  return { view };
}

export function wipeReducer(state: WipeState, action: WipeAction): WipeState {
  switch (action.type) {
    case 'switch':
      return state.view === action.view ? state : { view: action.view };
    default:
      return state;
  }
}

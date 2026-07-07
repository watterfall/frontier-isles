/**
 * The 卷轴 (scroll-wipe) transition as a pure state machine, extracted from
 * the prototype's `wipeTo(view)` (design/handoff/问题群岛-原型 v3.dc.html
 * lines ~1111-1121). The timers live in the component; this reducer owns the
 * phase/transform sequencing so it can be tested deterministically.
 *
 * Sequence for a wipe:
 *   begin  → phase 'covering', rod starts off-screen left (-112%)
 *   raf    → rod slides in to 0% (transition .48s)      [the "in" half]
 *   mid    → target view is swapped in, rod slides out to 112% (.55s)
 *   end    → phase 'idle'
 */

export type WipeView = 'chart' | 'island';
export type WipePhase = 'idle' | 'covering' | 'revealing';

export interface WipeState {
  phase: WipePhase;
  /** The currently displayed screen. */
  view: WipeView;
  /** The screen we are wiping toward (null when idle). */
  pending: WipeView | null;
  wipeTf: string;
  wipeTrans: string;
  wipeOn: boolean;
}

export type WipeAction =
  | { type: 'begin'; view: WipeView }
  | { type: 'raf' }
  | { type: 'mid' }
  | { type: 'end' };

export const IN_MS = 480;
export const OUT_MS = 550;
/** Prototype: view swaps at 500ms, wipe cleared at 1200ms. */
export const MID_MS = 500;
export const END_MS = 1200;

export function initialWipe(view: WipeView = 'chart'): WipeState {
  return { phase: 'idle', view, pending: null, wipeTf: '-112%', wipeTrans: 'none', wipeOn: false };
}

export function wipeReducer(state: WipeState, action: WipeAction): WipeState {
  switch (action.type) {
    case 'begin':
      // A wipe already running swallows further begins (prototype guard).
      if (state.phase !== 'idle') return state;
      return {
        ...state,
        phase: 'covering',
        pending: action.view,
        wipeOn: true,
        wipeTf: '-112%',
        wipeTrans: 'none',
      };
    case 'raf':
      if (state.phase !== 'covering') return state;
      return { ...state, wipeTf: '0%', wipeTrans: `transform ${IN_MS}ms cubic-bezier(0.4,0,0.2,1)` };
    case 'mid':
      if (state.phase !== 'covering') return state;
      return {
        ...state,
        phase: 'revealing',
        view: state.pending ?? state.view,
        wipeTf: '112%',
        wipeTrans: `transform ${OUT_MS}ms cubic-bezier(0.4,0,0.6,1) .05s`,
      };
    case 'end':
      return { ...state, phase: 'idle', pending: null, wipeOn: false };
    default:
      return state;
  }
}

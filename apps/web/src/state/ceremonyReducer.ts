/**
 * The founding-ceremony (建岛仪式) state machine as a pure reducer, extracted
 * from the prototype's ritual state + ritGo/ritFinish handlers
 * (design/handoff/问题群岛-原型 v3.dc.html lines ~1106, 1135-1142, 1384-1404).
 *
 * Five chapters 素/发/记/聚/立 (rit 0..4). Log entries are structured so the
 * reducer stays pure and testable; `formatLog` resolves them via i18next.
 */

import { RITQ, RIT_RW, type Bilingual } from '../api/fallback';

export interface QMeta {
  open?: boolean;
  rw?: boolean;
}

/** A structured genesis-scroll entry (rendered via formatLog). */
export interface CeremonyLog {
  /** i18n suffix under `ceremony.log.*`. */
  k: string;
  /** Interpolated count, where the message needs one. */
  n?: number;
  /** Appended verbatim question text (bilingual user content), for the "add" entry. */
  q?: Bilingual;
}

export interface CeremonyState {
  /** null = ceremony closed; 0..4 = chapter index. */
  rit: number | null;
  /** Divergence timer, seconds (starts at 480 = 8:00). */
  ritSec: number;
  /** Candidate indices (into RITQ) dropped, in order. */
  ritAdded: number[];
  /** Per-candidate open/rewrite marks. */
  ritMeta: Record<number, QMeta>;
  /** Per-candidate focus votes. */
  ritVotes: Record<number, number>;
  ritFocus: number | null;
  ritName: string | null;
  ritLog: CeremonyLog[];
  /** true once the island is rising from the sea (chapter 5 finish). */
  riseUp: boolean;
}

export type CeremonyAction =
  | { type: 'start' }
  | { type: 'tick' }
  | { type: 'ignite' }
  | { type: 'add'; i: number }
  | { type: 'close' }
  | { type: 'toggleOpen'; qi: number }
  | { type: 'rewrite'; qi: number }
  | { type: 'shaped' }
  | { type: 'vote'; qi: number }
  | { type: 'focus' }
  | { type: 'pickName'; name: string }
  | { type: 'finish' }
  | { type: 'abort' };

export function initialCeremony(): CeremonyState {
  return {
    rit: null,
    ritSec: 480,
    ritAdded: [],
    ritMeta: {},
    ritVotes: {},
    ritFocus: null,
    ritName: null,
    ritLog: [],
    riseUp: false,
  };
}

/** Display text of a candidate: rewritten → RIT_RW, else its RITQ text. */
export function rtext(state: CeremonyState, i: number, lang: 'zh' | 'en'): string {
  return state.ritMeta[i]?.rw ? RIT_RW[lang] : (RITQ[i]?.[lang] ?? '');
}

/** The current top-voted candidate index (prototype `ritTop`). */
export function ritTop(state: CeremonyState): number {
  if (state.ritAdded.length === 0) return 0;
  return state.ritAdded.reduce(
    (b, qi) => ((state.ritVotes[qi] ?? 0) > (state.ritVotes[b] ?? 0) ? qi : b),
    state.ritAdded[0]!,
  );
}

/** The focused QFocus text (prototype `ritFocusText`). */
export function ritFocusText(state: CeremonyState, lang: 'zh' | 'en'): string {
  return rtext(state, state.ritFocus !== null ? state.ritFocus : ritTop(state), lang);
}

export function ceremonyReducer(state: CeremonyState, action: CeremonyAction): CeremonyState {
  switch (action.type) {
    case 'start':
      return { ...initialCeremony(), rit: 0, ritLog: [{ k: 'unroll' }] };

    case 'tick':
      // Only chapter 2 (发) counts down, and never past zero.
      if (state.rit === 1 && state.ritSec > 0) return { ...state, ritSec: state.ritSec - 1 };
      return state;

    case 'ignite':
      return { ...state, rit: 1, ritLog: [...state.ritLog, { k: 'ignite' }] };

    case 'add':
      if (state.ritAdded.includes(action.i)) return state;
      return {
        ...state,
        ritAdded: [...state.ritAdded, action.i],
        ritLog: [...state.ritLog, { k: 'add', q: RITQ[action.i] }],
      };

    case 'close':
      // Gate: at least three questions before the scroll may close.
      if (state.ritAdded.length < 3) return state;
      return { ...state, rit: 2, ritLog: [...state.ritLog, { k: 'close', n: state.ritAdded.length }] };

    case 'toggleOpen': {
      const m = state.ritMeta[action.qi] ?? {};
      const open = m.open !== false; // default open
      return {
        ...state,
        ritMeta: { ...state.ritMeta, [action.qi]: { ...m, open: !open } },
        ritLog: [...state.ritLog, { k: open ? 'markClosed' : 'markOpen' }],
      };
    }

    case 'rewrite': {
      const m = state.ritMeta[action.qi] ?? {};
      return {
        ...state,
        ritMeta: { ...state.ritMeta, [action.qi]: { ...m, rw: true } },
        ritLog: [...state.ritLog, { k: 'rewrite' }],
      };
    }

    case 'shaped':
      return { ...state, rit: 3, ritLog: [...state.ritLog, { k: 'shaped' }] };

    case 'vote':
      return {
        ...state,
        ritVotes: { ...state.ritVotes, [action.qi]: (state.ritVotes[action.qi] ?? 0) + 1 },
        ritLog: [...state.ritLog, { k: 'vote' }],
      };

    case 'focus':
      return {
        ...state,
        rit: 4,
        ritFocus: ritTop(state),
        ritLog: [...state.ritLog, { k: 'focus' }],
      };

    case 'pickName':
      return { ...state, ritName: action.name };

    case 'finish':
      if (state.riseUp) return state;
      return { ...state, riseUp: true, ritLog: [...state.ritLog, { k: 'wall' }] };

    case 'abort':
      // Closing the ceremony; the log is preserved for the caller's toast.
      return { ...state, rit: null };

    default:
      return state;
  }
}

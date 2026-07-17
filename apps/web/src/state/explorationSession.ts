export type ExplorationPhase = 'atlas' | 'explore' | 'island';
export type ExplorerFacing = 'north' | 'east' | 'south' | 'west';

/** Position in the atlas' projected world coordinate system. */
export interface WorldExplorerPose {
  x: number;
  y: number;
  facing: ExplorerFacing;
  heading?: number;
  speed?: number;
  bank?: number;
  /** 0..1 position across the cartographic low / middle / high air strata. */
  altitudeZ?: number;
  /** Normalized stratum change per second; persisted for a seamless return. */
  verticalSpeed?: number;
}

/** The immutable ledger semantics retained after a route sample. */
export interface SampledCurrentRecord {
  id: string;
  fromSlug: string;
  toSlug: string;
  kind: 'evidence' | 'bridge' | 'lineage';
  sign: 'affirm' | 'contest' | 'neutral';
  directed: boolean;
  maturity?: 'proposed' | 'ratified';
  weight: number;
}

export interface ExplorationSession {
  phase: ExplorationPhase;
  islandSlug: string | null;
  /** Where the current island visit returns: the atlas desk or the flying field. */
  returnTo: 'atlas' | 'explore';
  worldPose: WorldExplorerPose | null;
  nearbyIslandSlug: string | null;
  /** Research question intentionally chosen in the field compass. */
  courseIslandSlug: string | null;
  /** Ordered bearings chosen during this notebook, retained after docking. */
  courseHistorySlugs: string[];
  /** A field notebook, deliberately not a score or completion percentage. */
  visitedIslandSlugs: string[];
  /** Real ledger currents sampled in the field; records survive island visits. */
  sampledCurrents: SampledCurrentRecord[];
  /** Human-authored observations keyed by island slug. Local until exported. */
  notes: Record<string, string>;
}

export type ExplorationAction =
  | { type: 'enter-world'; pose?: WorldExplorerPose }
  | { type: 'approach'; slug: string | null }
  | { type: 'set-course'; slug: string | null }
  | { type: 'remember-world-pose'; pose: WorldExplorerPose }
  | { type: 'inspect-island'; slug: string }
  | { type: 'sample-current'; current: SampledCurrentRecord }
  | { type: 'write-note'; slug: string; text: string }
  | { type: 'dock'; slug: string; source: 'atlas' | 'explore'; pose?: WorldExplorerPose }
  | { type: 'return-world' }
  | { type: 'return-atlas' };

export function initialExplorationSession(): ExplorationSession {
  return {
    phase: 'atlas',
    islandSlug: null,
    returnTo: 'atlas',
    worldPose: null,
    nearbyIslandSlug: null,
    courseIslandSlug: null,
    courseHistorySlugs: [],
    visitedIslandSlugs: [],
    sampledCurrents: [],
    notes: {},
  };
}

function logIsland(state: ExplorationSession, slug: string): string[] {
  return state.visitedIslandSlugs.includes(slug)
    ? state.visitedIslandSlugs
    : [...state.visitedIslandSlugs, slug];
}

export function explorationReducer(state: ExplorationSession, action: ExplorationAction): ExplorationSession {
  switch (action.type) {
    case 'enter-world':
      return {
        ...state,
        phase: 'explore',
        islandSlug: null,
        returnTo: 'explore',
        nearbyIslandSlug: null,
        worldPose: action.pose ?? state.worldPose,
      };
    case 'approach':
      return state.nearbyIslandSlug === action.slug ? state : { ...state, nearbyIslandSlug: action.slug };
    case 'set-course':
      if (state.courseIslandSlug === action.slug) return state;
      return {
        ...state,
        courseIslandSlug: action.slug,
        courseHistorySlugs: action.slug && !state.courseHistorySlugs.includes(action.slug)
          ? [...state.courseHistorySlugs, action.slug]
          : state.courseHistorySlugs,
      };
    case 'remember-world-pose':
      return { ...state, worldPose: action.pose };
    case 'inspect-island':
      return { ...state, visitedIslandSlugs: logIsland(state, action.slug) };
    case 'sample-current':
      return state.sampledCurrents.some((current) => current.id === action.current.id)
        ? state
        : { ...state, sampledCurrents: [...state.sampledCurrents, action.current] };
    case 'write-note': {
      const text = action.text.slice(0, 1200);
      if ((state.notes[action.slug] ?? '') === text) return state;
      const notes = { ...state.notes };
      if (text.trim()) notes[action.slug] = text;
      else delete notes[action.slug];
      return { ...state, notes, visitedIslandSlugs: logIsland(state, action.slug) };
    }
    case 'dock':
      return {
        ...state,
        phase: 'island',
        islandSlug: action.slug,
        returnTo: action.source,
        nearbyIslandSlug: null,
        courseIslandSlug: null,
        worldPose: action.pose ?? state.worldPose,
        visitedIslandSlugs: action.source === 'explore' ? logIsland(state, action.slug) : state.visitedIslandSlugs,
      };
    case 'return-world':
      return { ...state, phase: 'explore', islandSlug: null, returnTo: 'explore', nearbyIslandSlug: null };
    case 'return-atlas':
      return { ...state, phase: 'atlas', islandSlug: null, returnTo: 'atlas', nearbyIslandSlug: null, courseIslandSlug: null };
    default:
      return state;
  }
}

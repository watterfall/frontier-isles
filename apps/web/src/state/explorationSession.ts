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

export type PassageKind = 'charted' | 'frontier';
export type IslandDistrictId = 'harbor' | 'inquiry' | 'archive' | 'works' | 'observatory';

/** Stable notebook key for one station building on one island. */
export const buildingVisitKey = (slug: string, station: string): string => `${slug}:${station}`;

export interface StructureDeparture {
  structureId: string;
  islandSlug: string;
  islandOp: string;
}

export interface PassageIntent extends StructureDeparture {
  targetIslandSlug: string;
  targetIslandOp: string;
  /** A preview from the current graph. The server derives and returns the
   * canonical kind again at write time; clients never submit this value. */
  passageKind: PassageKind;
}

export interface PassageCorrespondenceRecord {
  quantity: string;
  inThisSubstrate: string;
}

export interface CompletedPassage extends PassageIntent {
  refHash: string;
  structureTitle: string;
  correspondences: PassageCorrespondenceRecord[];
  /** Important substrate-specific difference. Optional only for notebook
   * compatibility with receipts created before the connection-field reset. */
  boundary?: string;
  prediction: string;
  evidenceRefs?: string[];
  completedAt: string;
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
  /** Controlled cross-island structure lens, retained across L0→L1→L0. */
  structureLensId: string | null;
  /** A real rebuilt island explicitly chosen as the passage departure. */
  structureDeparture: StructureDeparture | null;
  /** The target selected from the lens; opens the shared L1 dock workbench. */
  passageIntent: PassageIntent | null;
  /** Portable local receipts. Canonical truth remains the ref + ledger event. */
  completedPassages: CompletedPassage[];
  /** Local cartographic discovery only — never interpreted as research progress. */
  surveyedDistricts: Record<string, IslandDistrictId[]>;
  /** Floor ids visited in each `island:station` building, local to the notebook. */
  visitedBuildingFloors: Record<string, string[]>;
}

export type ExplorationAction =
  | { type: 'enter-world'; pose?: WorldExplorerPose }
  | { type: 'approach'; slug: string | null }
  | { type: 'set-course'; slug: string | null }
  | { type: 'remember-world-pose'; pose: WorldExplorerPose }
  | { type: 'inspect-island'; slug: string }
  | { type: 'sample-current'; current: SampledCurrentRecord }
  | { type: 'write-note'; slug: string; text: string }
  | { type: 'select-structure'; structureId: string | null }
  | { type: 'select-passage-departure'; departure: StructureDeparture }
  | { type: 'begin-passage'; intent: PassageIntent }
  | { type: 'cancel-passage' }
  | { type: 'complete-passage'; receipt: CompletedPassage }
  | { type: 'survey-district'; slug: string; districtId: IslandDistrictId }
  | { type: 'visit-building-floor'; slug: string; station: string; floorId: string }
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
    structureLensId: null,
    structureDeparture: null,
    passageIntent: null,
    completedPassages: [],
    surveyedDistricts: {},
    visitedBuildingFloors: {},
  };
}

function logIsland(state: ExplorationSession, slug: string): string[] {
  return state.visitedIslandSlugs.includes(slug)
    ? state.visitedIslandSlugs
    : [...state.visitedIslandSlugs, slug];
}

function logNested<T extends string>(record: Record<string, T[]>, key: string, value: T, max = 64): Record<string, T[]> {
  const current = record[key] ?? [];
  if (current.includes(value)) return record;
  return { ...record, [key]: [...current, value].slice(-max) };
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
    case 'select-structure': {
      if (state.structureLensId === action.structureId) return state;
      const keepDeparture = action.structureId !== null && state.structureDeparture?.structureId === action.structureId;
      const keepIntent = action.structureId !== null && state.passageIntent?.structureId === action.structureId;
      return {
        ...state,
        structureLensId: action.structureId,
        structureDeparture: keepDeparture ? state.structureDeparture : null,
        passageIntent: keepIntent ? state.passageIntent : null,
      };
    }
    case 'select-passage-departure':
      return {
        ...state,
        structureLensId: action.departure.structureId,
        structureDeparture: action.departure,
        passageIntent: null,
      };
    case 'begin-passage':
      return {
        ...state,
        structureLensId: action.intent.structureId,
        structureDeparture: {
          structureId: action.intent.structureId,
          islandSlug: action.intent.islandSlug,
          islandOp: action.intent.islandOp,
        },
        passageIntent: action.intent,
      };
    case 'cancel-passage':
      return state.passageIntent ? { ...state, passageIntent: null } : state;
    case 'complete-passage': {
      const prior = state.completedPassages.filter((receipt) => receipt.refHash !== action.receipt.refHash);
      return {
        ...state,
        structureLensId: action.receipt.structureId,
        structureDeparture: {
          structureId: action.receipt.structureId,
          islandSlug: action.receipt.islandSlug,
          islandOp: action.receipt.islandOp,
        },
        passageIntent: null,
        completedPassages: [...prior, action.receipt].slice(-200),
        visitedIslandSlugs: logIsland(state, action.receipt.targetIslandSlug),
      };
    }
    case 'survey-district':
      return {
        ...state,
        surveyedDistricts: logNested(state.surveyedDistricts, action.slug, action.districtId),
        visitedIslandSlugs: logIsland(state, action.slug),
      };
    case 'visit-building-floor': {
      const floorId = action.floorId.trim().slice(0, 160);
      if (!floorId) return state;
      return {
        ...state,
        visitedBuildingFloors: logNested(
          state.visitedBuildingFloors,
          buildingVisitKey(action.slug, action.station),
          floorId,
        ),
        visitedIslandSlugs: logIsland(state, action.slug),
      };
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
        surveyedDistricts: logNested(state.surveyedDistricts, action.slug, 'harbor'),
      };
    case 'return-world':
      return { ...state, phase: 'explore', islandSlug: null, returnTo: 'explore', nearbyIslandSlug: null };
    case 'return-atlas':
      return { ...state, phase: 'atlas', islandSlug: null, returnTo: 'atlas', nearbyIslandSlug: null, courseIslandSlug: null };
    default:
      return state;
  }
}

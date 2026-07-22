import type { StationKind } from '@frontier-isles/core';
import type { ExplorationPhase, IslandDistrictId, PassageIntent } from './explorationSession';
import type { ModelFamilyId } from '../models/types';

export interface WorldTrailIsland {
  slug: string;
  title: string;
  question?: string;
}

export interface WorldTrailDistrict {
  slug: string;
  id: IslandDistrictId;
  label: string;
}

export interface WorldTrailFloor {
  slug: string;
  station: StationKind;
  floorId: string;
  label: string;
}

export type WorldWorkspace =
  | { kind: 'model'; title: string; familyId?: ModelFamilyId; sourceStructureId?: string }
  | { kind: 'passage'; title: string; structureId: string }
  | { kind: 'comparisons'; title: string };

export type WorldLocation =
  | { kind: 'atlas' }
  | { kind: 'travel'; courseSlug: string | null }
  | { kind: 'island'; slug: string }
  | { kind: 'floor'; slug: string; station: StationKind; floorId: string }
  | { kind: 'workspace'; workspace: WorldWorkspace['kind'] };

export type WorldPlaceSegment =
  | { kind: 'atlas' }
  | { kind: 'travel'; label?: string }
  | { kind: 'island'; slug: string; label: string }
  | { kind: 'district'; id: IslandDistrictId; label: string }
  | { kind: 'station'; station: StationKind }
  | { kind: 'floor'; floorId: string; label: string }
  | { kind: 'workspace'; workspace: WorldWorkspace['kind']; label: string };

export type WorldResearchContext =
  | { kind: 'comparison'; label: string; truth: 'research' }
  | { kind: 'course'; label: string; truth: 'personal' }
  | { kind: 'structure'; structureId: string; label: string; truth: 'research' }
  | { kind: 'passage'; structureId: string; label: string; truth: 'research' }
  | { kind: 'model'; familyId?: ModelFamilyId; label: string; truth: 'personal' };

export interface WorldTrailProjection {
  location: WorldLocation;
  placeTrail: WorldPlaceSegment[];
  activeResearchContext: WorldResearchContext[];
  fellBackToAtlas: boolean;
}

export interface SelectWorldTrailInput {
  view: 'chart' | 'island';
  phase: ExplorationPhase;
  islandSlug: string | null;
  courseIslandSlug?: string | null;
  islands: readonly WorldTrailIsland[];
  district?: WorldTrailDistrict | null;
  floor?: WorldTrailFloor | null;
  workspace?: WorldWorkspace | null;
  structureLensId?: string | null;
  passageIntent?: Pick<PassageIntent, 'structureId' | 'islandSlug' | 'targetIslandSlug'> | null;
  comparisonLabel?: string | null;
}

const tail = (id: string): string => id.split('/').at(-1) ?? id;

/**
 * Pure display projection over existing navigation and receipt owners. It never
 * restores navigation, persists UI state, or creates a second write protocol.
 *
 * Precedence is workspace > floor > island > travel > atlas. A stale island
 * target deliberately collapses to L0 instead of fabricating a deeper place.
 */
export function selectWorldTrail(input: SelectWorldTrailInput): WorldTrailProjection {
  const atlas: WorldPlaceSegment = { kind: 'atlas' };
  const placeTrail: WorldPlaceSegment[] = [atlas];
  let location: WorldLocation = { kind: 'atlas' };
  let fellBackToAtlas = false;
  let activeIsland: WorldTrailIsland | null = null;

  if (input.view === 'island') {
    activeIsland = input.islands.find((island) => island.slug === input.islandSlug) ?? null;
    if (!activeIsland) {
      fellBackToAtlas = true;
    } else {
      placeTrail.push({ kind: 'island', slug: activeIsland.slug, label: activeIsland.title });
      location = { kind: 'island', slug: activeIsland.slug };

      if (input.district?.slug === activeIsland.slug) {
        placeTrail.push({ kind: 'district', id: input.district.id, label: input.district.label });
      }

      if (input.floor?.slug === activeIsland.slug) {
        placeTrail.push({ kind: 'station', station: input.floor.station });
        placeTrail.push({ kind: 'floor', floorId: input.floor.floorId, label: input.floor.label });
        location = {
          kind: 'floor',
          slug: activeIsland.slug,
          station: input.floor.station,
          floorId: input.floor.floorId,
        };
      }
    }
  } else if (input.phase === 'explore') {
    const course = input.islands.find((island) => island.slug === input.courseIslandSlug) ?? null;
    placeTrail.push({ kind: 'travel', ...(course ? { label: course.title } : {}) });
    location = { kind: 'travel', courseSlug: course?.slug ?? null };
  }

  // Workspaces may sit above a valid chart, journey, island, or floor. When an
  // island target is stale, do not let a workspace disguise the safe L0 fallback.
  if (input.workspace && !fellBackToAtlas) {
    placeTrail.push({ kind: 'workspace', workspace: input.workspace.kind, label: input.workspace.title });
    location = { kind: 'workspace', workspace: input.workspace.kind };
  }

  const activeResearchContext: WorldResearchContext[] = [];
  if (input.comparisonLabel) {
    activeResearchContext.push({ kind: 'comparison', label: input.comparisonLabel, truth: 'research' });
  }

  const course = input.islands.find((island) => island.slug === input.courseIslandSlug) ?? null;
  if (input.phase === 'explore' && course) {
    activeResearchContext.push({ kind: 'course', label: course.question || course.title, truth: 'personal' });
  }

  if (input.structureLensId) {
    activeResearchContext.push({
      kind: 'structure',
      structureId: input.structureLensId,
      label: tail(input.structureLensId),
      truth: 'research',
    });
  }

  if (input.passageIntent) {
    const source = input.islands.find((island) => island.slug === input.passageIntent?.islandSlug);
    const target = input.islands.find((island) => island.slug === input.passageIntent?.targetIslandSlug);
    activeResearchContext.push({
      kind: 'passage',
      structureId: input.passageIntent.structureId,
      label: source && target ? `${source.title} ↔ ${target.title}` : tail(input.passageIntent.structureId),
      truth: 'research',
    });
  }

  if (input.workspace?.kind === 'model') {
    activeResearchContext.push({
      kind: 'model',
      familyId: input.workspace.familyId,
      label: input.workspace.title,
      truth: 'personal',
    });
  }

  return { location, placeTrail, activeResearchContext, fellBackToAtlas };
}

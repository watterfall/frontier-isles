import {
  ATLAS_EXPLORER_APPROACH_DISTANCE,
  ATLAS_EXPLORER_CURRENT_SAMPLE_DISTANCE,
  ATLAS_EXPLORER_CURRENT_SIGNAL_DISTANCE,
  ATLAS_EXPLORER_MAX_SPEED,
  ATLAS_EXPLORER_SAFETY_RADIUS,
  ATLAS_EXPLORER_SIGNAL_DISTANCE,
  atlasCruiseScale,
  facingToHeading,
  headingToFacing,
  vectorToFacing,
  type AtlasExplorerBounds,
  type AtlasExplorerCurrent,
  type AtlasExplorerIsland,
  type AtlasExplorerPose,
} from '@frontier-isles/renderer/pixi';

export interface WorldMoveInput { x: number; y: number; z?: number }

export interface WorldFocusTarget {
  x: number;
  y: number;
  distance: number;
  horizontalDistance?: number;
  altitudeDelta?: number;
  signalDistance?: number;
  approachDistance?: number;
}

export interface WorldCameraPose {
  centerX: number;
  centerY: number;
  scale: number;
  anchorX: number;
  anchorY: number;
}

export interface WorldMotionState {
  pose: AtlasExplorerPose;
  velocityX: number;
  velocityY: number;
  verticalVelocity: number;
  heading: number;
  bank: number;
  camera: WorldCameraPose;
}

export type ResearchTransectStage = 'bearing' | 'field' | 'survey' | 'surveyed';
export type ResearchFieldRelation = 'same-cluster' | 'same-domain' | 'cross-domain';

export interface ResearchFieldIdentity {
  domain: string;
  clusterCode?: string | null;
}

// The speed/scale/range contract is single-sourced in the renderer (the stage
// keeps its own defaults from the same constants); WORLD_* names are kept as
// this module's public vocabulary.
const MAX_SPEED = ATLAS_EXPLORER_MAX_SPEED;
const MAX_VERTICAL_SPEED = 0.46;
export const WORLD_SIGNAL_DISTANCE = ATLAS_EXPLORER_SIGNAL_DISTANCE;
export const WORLD_APPROACH_DISTANCE = ATLAS_EXPLORER_APPROACH_DISTANCE;
export const WORLD_COURSE_DISTANCE = 1200;
export const WORLD_ALTITUDE_ALIGNMENT = 0.16;
/** Calm collision boundary used when an altitude-aligned craft reaches an isle. */
export const WORLD_SAFETY_RADIUS = ATLAS_EXPLORER_SAFETY_RADIUS;
export const WORLD_CURRENT_SIGNAL_DISTANCE = ATLAS_EXPLORER_CURRENT_SIGNAL_DISTANCE;
export const WORLD_CURRENT_SAMPLE_DISTANCE = ATLAS_EXPLORER_CURRENT_SAMPLE_DISTANCE;
export const WORLD_CURRENT_ALTITUDE_ALIGNMENT = 0.14;

/** Course-extended signal envelope: a plotted course stays hearable well past
 * the normal signal ring. The shown/locked encounter (reportPosition) and the
 * steering-assist focus (tickWorld) must share this exact extension. */
export const worldCourseSignalDistance = (encounterDistance: number): number =>
  Math.max(WORLD_COURSE_DISTANCE, encounterDistance + 260);

export type WorldAltitudeBand = 'low' | 'middle' | 'high';
export type WorldAltitudeInstruction = 'climb' | 'aligned' | 'descend';

export function worldAltitudeBand(altitudeZ: number): WorldAltitudeBand {
  const z = Math.max(0, Math.min(1, altitudeZ));
  return z < 1 / 3 ? 'low' : z < 2 / 3 ? 'middle' : 'high';
}

/** Signed target delta: positive means the target sits above the craft. */
export function worldAltitudeInstruction(delta: number): WorldAltitudeInstruction {
  if (delta > WORLD_ALTITUDE_ALIGNMENT) return 'climb';
  if (delta < -WORLD_ALTITUDE_ALIGNMENT) return 'descend';
  return 'aligned';
}

export function worldCanSurvey(target: Pick<AtlasExplorerIsland, 'horizontalDistance' | 'altitudeDelta'>): boolean {
  return target.horizontalDistance <= WORLD_APPROACH_DISTANCE
    && Math.abs(target.altitudeDelta) <= WORLD_ALTITUDE_ALIGNMENT;
}

export function worldCanSampleCurrent(target: Pick<AtlasExplorerCurrent, 'horizontalDistance' | 'altitudeDelta'>): boolean {
  return target.horizontalDistance <= WORLD_CURRENT_SAMPLE_DISTANCE
    && Math.abs(target.altitudeDelta) <= WORLD_CURRENT_ALTITUDE_ALIGNMENT;
}

/** A course starts revealing its regional context before the island becomes a signal. */
export const WORLD_FIELD_DISTANCE = WORLD_SIGNAL_DISTANCE;

export function researchTransectStage(distance: number, surveyed = false): ResearchTransectStage {
  if (surveyed) return 'surveyed';
  if (distance <= WORLD_APPROACH_DISTANCE) return 'survey';
  if (distance <= WORLD_FIELD_DISTANCE) return 'field';
  return 'bearing';
}

export function researchTransectProgress(distance: number): number {
  const span = WORLD_COURSE_DISTANCE - WORLD_APPROACH_DISTANCE;
  return Math.max(0, Math.min(1, (WORLD_COURSE_DISTANCE - distance) / span));
}

/** Topology only: never claims a scientific relation that is absent from the atlas data. */
export function researchFieldRelation(
  source: ResearchFieldIdentity,
  target: ResearchFieldIdentity,
): ResearchFieldRelation {
  if (source.clusterCode && source.clusterCode === target.clusterCode) return 'same-cluster';
  if (source.domain === target.domain) return 'same-domain';
  return 'cross-domain';
}

const headingForFacing = facingToHeading;

const wrapAngle = (angle: number): number => Math.atan2(Math.sin(angle), Math.cos(angle));

const smooth01 = (value: number): number => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

/** Continuous encounter strength: 0 at first signal, 1 at survey range. */
export function worldEncounterStrength(target: WorldFocusTarget | null | undefined): number {
  if (!target) return 0;
  const signal = target.signalDistance ?? WORLD_SIGNAL_DISTANCE;
  const approach = target.approachDistance ?? WORLD_APPROACH_DISTANCE;
  if (signal <= approach) return target.distance <= approach ? 1 : 0;
  return smooth01((signal - target.distance) / (signal - approach));
}

/** Dense-field hysteresis: keep the acquired island until its signal is lost. */
export function selectWorldEncounter(
  sortedField: readonly AtlasExplorerIsland[],
  lockedSlug: string | null,
  signalDistance = WORLD_SIGNAL_DISTANCE,
  releasePadding = 52,
  preferredSlug: string | null = null,
): AtlasExplorerIsland | null {
  const preferred = preferredSlug ? sortedField.find((candidate) => candidate.slug === preferredSlug) ?? null : null;
  // An explicit research course outranks incidental proximity. It may be far
  // away: the bearing is precisely what turns free movement into inquiry.
  if (preferred) return preferred;
  const locked = lockedSlug ? sortedField.find((candidate) => candidate.slug === lockedSlug) ?? null : null;
  if (locked && locked.distance <= signalDistance + releasePadding) return locked;
  const closest = sortedField[0];
  return closest && closest.distance <= signalDistance ? closest : null;
}

/**
 * Recover the encounter that owned a durable settled pose. Dense atlas fields
 * can contain a closer neighbour, but a pose written after physics settles is
 * geometrically distinctive: it lies on the 104-unit safety boundary of the
 * island it approached. Re-locking that owner before the first restored tick
 * prevents a reload from projecting the craft around a different neighbour.
 */
export function restoredWorldEncounter(
  field: readonly AtlasExplorerIsland[],
  tolerance = 1,
): AtlasExplorerIsland | null {
  const ranked = field
    .filter((candidate) => Math.abs(candidate.altitudeDelta) <= WORLD_ALTITUDE_ALIGNMENT)
    .map((candidate) => ({ candidate, error: Math.abs(candidate.horizontalDistance - WORLD_SAFETY_RADIUS) }))
    .sort((a, b) => a.error - b.error);
  return ranked[0] && ranked[0].error <= tolerance ? ranked[0].candidate : null;
}

/** Route-crossing hysteresis: a current stays acquired until the craft clears it. */
export function selectWorldCurrentEncounter(
  sortedField: readonly AtlasExplorerCurrent[],
  lockedId: string | null,
  signalDistance = WORLD_CURRENT_SIGNAL_DISTANCE,
  releasePadding = 28,
): AtlasExplorerCurrent | null {
  const locked = lockedId ? sortedField.find((candidate) => candidate.id === lockedId) ?? null : null;
  if (locked && locked.distance <= signalDistance + releasePadding) return locked;
  const closest = sortedField[0];
  return closest && closest.distance <= signalDistance ? closest : null;
}

const facingForHeading = headingToFacing;

export function createWorldMotion(pose: AtlasExplorerPose): WorldMotionState {
  const heading = pose.heading ?? headingForFacing(pose.facing);
  const altitudeZ = Math.max(0, Math.min(1, pose.altitudeZ ?? 0.5));
  return {
    pose: { ...pose, heading, speed: pose.speed ?? 0, bank: pose.bank ?? 0, altitudeZ, verticalSpeed: pose.verticalSpeed ?? 0 },
    velocityX: 0,
    velocityY: 0,
    verticalVelocity: pose.verticalSpeed ?? 0,
    heading,
    bank: pose.bank ?? 0,
    camera: {
      centerX: pose.x,
      centerY: pose.y - altitudeZ * 18,
      scale: atlasCruiseScale(0, altitudeZ),
      anchorX: 0.47,
      anchorY: 0.61,
    },
  };
}

/**
 * Deterministic low-altitude motion. Input expresses intent; velocity, heading,
 * banking and the look-ahead camera settle over time instead of teleporting one
 * key-step at a time. This is the single owner of continuous movement.
 */
export function stepWorldMotion(
  state: WorldMotionState,
  input: WorldMoveInput,
  dt: number,
  bounds: AtlasExplorerBounds,
  focus?: WorldFocusTarget | null,
): WorldMotionState {
  const frameDt = Math.min(0.05, Math.max(0, dt));
  if (frameDt === 0) return state;

  const magnitude = Math.hypot(input.x, input.y);
  const intentX = magnitude > 0 ? input.x / magnitude : 0;
  const intentY = magnitude > 0 ? input.y / magnitude : 0;
  const response = 1 - Math.exp(-(magnitude > 0 ? 5.8 : 2.9) * frameDt);
  let velocityX = state.velocityX + (intentX * MAX_SPEED - state.velocityX) * response;
  let velocityY = state.velocityY + (intentY * MAX_SPEED - state.velocityY) * response;
  if (magnitude === 0 && Math.hypot(velocityX, velocityY) < 0.35) {
    velocityX = 0;
    velocityY = 0;
  }

  let x = state.pose.x + velocityX * frameDt;
  let y = state.pose.y + velocityY * frameDt;
  if (x <= bounds.minX || x >= bounds.maxX) velocityX = 0;
  if (y <= bounds.minY || y >= bounds.maxY) velocityY = 0;
  x = Math.max(bounds.minX, Math.min(bounds.maxX, x));
  y = Math.max(bounds.minY, Math.min(bounds.maxY, y));

  const altitudeIntent = Math.max(-1, Math.min(1, input.z ?? 0));
  const verticalResponse = 1 - Math.exp(-(altitudeIntent === 0 ? 4.2 : 6.8) * frameDt);
  let verticalVelocity = state.verticalVelocity
    + (altitudeIntent * MAX_VERTICAL_SPEED - state.verticalVelocity) * verticalResponse;
  let altitudeZ = Math.max(0, Math.min(1, (state.pose.altitudeZ ?? 0.5) + verticalVelocity * frameDt));
  if (altitudeZ <= 0 || altitudeZ >= 1) verticalVelocity = 0;
  if (altitudeIntent === 0 && Math.abs(verticalVelocity) < 0.001) verticalVelocity = 0;

  // An isle is physical space in the field, not a marker the craft can cross.
  // At a different stratum the craft may pass above/below; once aligned, the
  // berth radius becomes a calm collision boundary that hands off to survey.
  if (focus && Math.abs(focus.altitudeDelta ?? 0) <= WORLD_ALTITUDE_ALIGNMENT) {
    const fromIslandX = x - focus.x;
    const fromIslandY = y - focus.y;
    const planarDistance = Math.hypot(fromIslandX, fromIslandY);
    const safetyRadius = WORLD_SAFETY_RADIUS;
    if (planarDistance < safetyRadius) {
      const fallbackAngle = state.heading + Math.PI;
      const nx = planarDistance > 0.001 ? fromIslandX / planarDistance : Math.cos(fallbackAngle);
      const ny = planarDistance > 0.001 ? fromIslandY / planarDistance : Math.sin(fallbackAngle);
      x = focus.x + nx * safetyRadius;
      y = focus.y + ny * safetyRadius;
      velocityX = 0;
      velocityY = 0;
    }
  }

  const speed = Math.hypot(velocityX, velocityY);
  const desiredHeading = speed > 2 ? Math.atan2(velocityY, velocityX) : state.heading;
  const headingDelta = wrapAngle(desiredHeading - state.heading);
  const heading = wrapAngle(state.heading + headingDelta * (1 - Math.exp(-8.2 * frameDt)));
  const desiredBank = Math.max(-0.34, Math.min(0.34, headingDelta * 0.72));
  const bank = state.bank + (desiredBank - state.bank) * (1 - Math.exp(-7.5 * frameDt));

  const lookAhead = Math.min(116, speed * 0.43);
  const cruiseCameraX = x + Math.cos(heading) * lookAhead;
  const cruiseCameraY = y + Math.sin(heading) * lookAhead * 0.72 - altitudeZ * 18;
  const encounter = worldEncounterStrength(focus);
  // At approach, frame the relationship rather than centring either object:
  // the craft holds the lower-left field while the island gains the upper-right.
  const encounterX = focus ? x * 0.56 + focus.x * 0.44 : cruiseCameraX;
  const encounterY = focus ? y * 0.58 + focus.y * 0.42 : cruiseCameraY;
  const targetCameraX = cruiseCameraX + (encounterX - cruiseCameraX) * encounter;
  const targetCameraY = cruiseCameraY + (encounterY - cruiseCameraY) * encounter;
  const cruiseScale = atlasCruiseScale(speed, altitudeZ);
  const targetScale = cruiseScale + encounter * 0.2;
  const cameraResponse = 1 - Math.exp(-3.5 * frameDt);
  const camera = {
    centerX: state.camera.centerX + (targetCameraX - state.camera.centerX) * cameraResponse,
    centerY: state.camera.centerY + (targetCameraY - state.camera.centerY) * cameraResponse,
    scale: state.camera.scale + (targetScale - state.camera.scale) * cameraResponse,
    anchorX: 0.47 + encounter * 0.03,
    anchorY: 0.61 - encounter * 0.05,
  };

  return {
    pose: { x, y, facing: facingForHeading(heading), heading, speed, bank, altitudeZ, verticalSpeed: verticalVelocity },
    velocityX,
    velocityY,
    verticalVelocity,
    heading,
    bank,
    camera,
  };
}

export function worldMotionIsIdle(state: WorldMotionState): boolean {
  return Math.hypot(state.velocityX, state.velocityY) < 0.35 && Math.abs(state.verticalVelocity) < 0.001;
}

/** Camera settling keeps the on-demand loop alive after a signal is acquired. */
export function worldCameraIsSettled(state: WorldMotionState, focus?: WorldFocusTarget | null): boolean {
  const encounter = worldEncounterStrength(focus);
  const speed = Math.hypot(state.velocityX, state.velocityY);
  const lookAhead = Math.min(116, speed * 0.43);
  const cruiseX = state.pose.x + Math.cos(state.heading) * lookAhead;
  const altitudeZ = state.pose.altitudeZ ?? 0.5;
  const cruiseY = state.pose.y + Math.sin(state.heading) * lookAhead * 0.72 - altitudeZ * 18;
  const encounterX = focus ? state.pose.x * 0.56 + focus.x * 0.44 : cruiseX;
  const encounterY = focus ? state.pose.y * 0.58 + focus.y * 0.42 : cruiseY;
  const targetX = cruiseX + (encounterX - cruiseX) * encounter;
  const targetY = cruiseY + (encounterY - cruiseY) * encounter;
  const cruiseScale = atlasCruiseScale(speed, altitudeZ);
  const targetScale = cruiseScale + encounter * 0.2;
  return Math.hypot(state.camera.centerX - targetX, state.camera.centerY - targetY) < 0.4
    && Math.abs(state.camera.scale - targetScale) < 0.002;
}

export function moveWorldExplorer(
  pose: AtlasExplorerPose,
  input: WorldMoveInput,
  distance: number,
  bounds: AtlasExplorerBounds,
): AtlasExplorerPose {
  const magnitude = Math.hypot(input.x, input.y);
  if (magnitude === 0 || distance <= 0) return pose;
  const dx = input.x / magnitude;
  const dy = input.y / magnitude;
  const facing = vectorToFacing(dx, dy);
  return {
    ...pose,
    x: Math.max(bounds.minX, Math.min(bounds.maxX, pose.x + dx * distance)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, pose.y + dy * distance)),
    facing,
  };
}

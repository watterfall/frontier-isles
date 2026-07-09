/**
 * @frontier-isles/core — domain types, capability tables, and projections.
 *
 * Builds on @frontier-isles/opp: the protocol owns the schemas; core owns the
 * platform's reading of them (stations, roles, permissions, and the pure
 * projections that turn a ledger into growth, day/night, tide, and insight).
 */

// Stations
export { STATION_KINDS, STATION_META, STATION_SEALS } from "./stations";
export type { StationKind, StationMeta } from "./stations";

// Atoms & bridge artifacts
export {
  ATOM_TYPES,
  ATOM_LABELS,
  BRIDGE_ARTIFACT_TYPES,
  BRIDGE_ARTIFACT_LABELS,
} from "./atoms";
export type { AtomType, BridgeArtifactType, Label } from "./atoms";

// Roles & AI residents
export {
  ROLE_LADDER,
  ROLE_META,
  ACTOR_KINDS,
  AI_RESIDENT_KINDS,
  AI_RESIDENT_TEMPLATES,
} from "./roles";
export type { Role, ActorKind, AiResidentKind, AiResidentTemplate } from "./roles";

// Capabilities
export {
  ROLE_CAPABILITIES,
  DEFAULT_AGENT_CAPABILITIES,
  ACTION_CAPABILITY,
  effectiveCapabilities,
  can,
  degradeAction,
} from "./capabilities";
export type {
  Capability,
  CapabilityActor,
  GatewayAction,
  McpWriteAction,
  EffectiveAction,
} from "./capabilities";

// Projections
export {
  projectGrowth,
  projectDayView,
  projectNightReplay,
  computeTide,
  projectContributions,
  transplantInsight,
  A_PHASE_WEIGHT,
} from "./projections";
export type {
  GrowthStage,
  Ending,
  GrowthState,
  GrowthOptions,
  CuratedArtifact,
  GhostReason,
  Ghost,
  ReplaySlice,
  Tide,
  Contribution,
  Insight,
} from "./projections";

// Sea-plane projections (depth-plan-v2 §3 — currents & whirlpools)
export { projectCurrents, projectWhirlpools } from "./currents";
export type { Current, CurrentKind, CurrentSign, CurrentMaturity, Whirlpool } from "./currents";

// Per-claim building state (scene-upgrade M4.3 — foundation/floors/roof/ghost)
export { projectClaimState, CONSENSUS_MIN } from "./claims";
export type { ClaimState } from "./claims";

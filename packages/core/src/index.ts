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
  projectActiveStations,
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
  ActiveStationsOptions,
} from "./projections";

// Sea-plane projections (depth-plan-v2 §3 — currents & whirlpools)
export { projectCurrents, projectWhirlpools } from "./currents";
export type { Current, CurrentKind, CurrentSign, CurrentMaturity, Whirlpool } from "./currents";

// Archipelago clustering (depth-plan-v2 §4 / INFO-HIERARCHY C3 — Phase C3 data layer)
export { projectArchipelagos } from "./archipelago";
export type {
  DomainKey,
  ArchipelagoIslandLike,
  ArchipelagoOpts,
  Archipelago,
  ArchipelagoProjection,
} from "./archipelago";

// My Harbor + fog (depth-plan-v1 §3(d) — Phase C3 data layer)
export { projectHarbor, fogLevel, archipelagoIndex } from "./harbor";
export type { HarborFootprintLike, HarborIslandPosition, Harbor, FogContext } from "./harbor";

// Per-claim building state (scene-upgrade M4.3 — foundation/floors/roof/ghost)
// + claims-&-evidence compliance (Phase B.4, architecture §4)
export { projectClaimState, CONSENSUS_MIN, extractEvidence, hasClaimEvidence } from "./claims";
export type { ClaimState, EvidenceRef, EvidenceRole } from "./claims";

// Morning report (Phase B.1 — the AI night shift's dock drafts, HITL-resolved)
export { projectMorningReport } from "./morning-report";
export type {
  MorningReportEntry,
  MorningReportOptions,
  MorningReportStatus,
  ResolvedRef,
} from "./morning-report";

// Night timeline (Phase B.2 — the replay scrubber's ledger-derived model)
export { projectNightTimeline, TIMELINE_MARKER_ACTIONS } from "./night-timeline";
export type { NightTimelineMarker, NightTimelineModel } from "./night-timeline";

// Transplant-through-dock (Phase B.3 — driftwood → dock → station; pure data shape)
export { buildTransplant, TRANSPLANT_TARGETS } from "./transplant";
export type { TransplantInput, TransplantBuild, BridgeArtifactContent } from "./transplant";

// Synthetic scale corpus (atlas-world-plan.md §4 lane W4 — believable N=200/700
// frontier data for stress-testing the world-map tiers; honestly flagged
// `synthetic`/`syn-*`, never mixed into the curated fallback DATA)
export { makeScaleCorpus, SCALE_WORLD } from "./scaleCorpus";
export type { ScaleCorpusIsland } from "./scaleCorpus";

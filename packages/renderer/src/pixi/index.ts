/**
 * `@frontier-isles/renderer/pixi` — the WebGL engine entry point.
 *
 * Kept separate from the package root so that importing the root never loads
 * PixiJS. Import from here only where a GPU context is intended (apps/web L1).
 */

export { IsoStage, type IsoStageOptions } from './stage';
export { SceneStage, type SceneStageOptions, type TextureResolver, type ResolvedTexture, type SeaColors } from './scene-stage';
export { createSeaMesh, type SeaMesh, type SeaMeshOptions } from './sea-mesh';
export { RitualLayer, type RitualPoint, type RitualFireOptions } from './rituals';
export { AtlasStage, type AtlasStageOptions, type AtlasMetrics, type AtlasStructureLensInput } from './atlas-stage';
export {
  zoomTier,
  tierBlend,
  deconflictLabels,
  islandPriority,
  placeholderClusters,
  makeFakeIslands,
  atlasCoastline,
  atlasHash,
  atlasRng,
  assignAtlasAltitudes,
  assignAtlasHierarchy,
  atlasIslandLift,
  projectAtlasIslandY,
  satelliteReveal,
  satelliteViewFactor,
  satelliteDisclosure,
  ATLAS_DOMAINS,
  ATLAS_ALTITUDE_BANDS,
  ATLAS_Y_TILT,
  ATLAS_BAND_LIFT,
  SATELLITE_REVEAL_START,
  SATELLITE_REVEAL_END,
  SATELLITE_DEEP_START,
  SATELLITE_DEEP_END,
  ATLAS_DOMAIN_FILL,
  ATLAS_DOMAIN_INK,
  ATLAS_STAGE_RADIUS,
  TIER_FAR_MAX,
  TIER_MID_MAX,
  TIER_BAND,
  FAKE_WORLD,
  type AtlasDomain,
  type AtlasAltitudeBand,
  type AtlasIslandRole,
  type AtlasTier,
  type AtlasIslandInput,
  type AtlasCluster,
  type AtlasContinent,
  type AtlasFogCell,
  type AtlasFlow,
  type AtlasCurrent,
  type LabelBox,
  type LabelVerdict,
} from './atlas-lod';

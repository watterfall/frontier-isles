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
export { AtlasStage, type AtlasStageOptions, type AtlasMetrics } from './atlas-stage';
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
  ATLAS_DOMAINS,
  ATLAS_DOMAIN_FILL,
  ATLAS_DOMAIN_INK,
  ATLAS_STAGE_RADIUS,
  TIER_FAR_MAX,
  TIER_MID_MAX,
  TIER_BAND,
  FAKE_WORLD,
  type AtlasDomain,
  type AtlasTier,
  type AtlasIslandInput,
  type AtlasCluster,
  type AtlasContinent,
  type AtlasFogCell,
  type AtlasFlow,
  type LabelBox,
  type LabelVerdict,
} from './atlas-lod';

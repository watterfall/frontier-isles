/**
 * `@frontier-isles/renderer/pixi` — the WebGL engine entry point.
 *
 * Kept separate from the package root so that importing the root never loads
 * PixiJS. Import from here only where a GPU context is intended (apps/web L1).
 */

export { IsoStage, type IsoStageOptions } from './stage';
export { SceneStage, type SceneStageOptions, type TextureResolver, type SeaColors } from './scene-stage';
export { createSeaMesh, type SeaMesh, type SeaMeshOptions } from './sea-mesh';

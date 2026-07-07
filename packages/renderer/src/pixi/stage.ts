/**
 * PixiJS 8 isometric engine — the scale half of the SVG-now/Pixi-at-scale split
 * (DECISIONS item 3). Isolated behind `@frontier-isles/renderer/pixi`: this is
 * the only module in the package that imports `pixi.js` and touches WebGL.
 *
 * It honours the same contract (§2) as the headless core by delegating every
 * layout/depth decision to iso.ts and every culling decision to chunks.ts — the
 * engine only owns the GPU: a world `Container` with `sortableChildren`, sprite
 * placement, camera pan/zoom, viewport-driven chunk culling, and L0 thumbnail
 * prerender.
 */

import { Application, Container, Graphics, Sprite, Texture, isWebGLSupported } from 'pixi.js';
import { diamondPoints, worldToScreen } from '../iso';
import { anchorDepth, type IslandScene, type Placed } from '../scene';
import { ChunkIndex, cull, type Viewport } from '../chunks';

/** Options for {@link IsoStage.init}. */
export interface IsoStageOptions {
  width?: number;
  height?: number;
  /** Background colour (0xRRGGBB or CSS string). Default: transparent. */
  background?: number | string;
  backgroundAlpha?: number;
  antialias?: boolean;
  resolution?: number;
  /** Renderer preference; defaults to WebGL to keep behaviour predictable. */
  preference?: 'webgl' | 'webgpu';
}

function assertWebGL(): void {
  if (!isWebGLSupported()) {
    throw new Error(
      '[renderer/pixi] WebGL is unavailable in this environment. The Pixi engine ' +
        'requires a GPU context; use the headless core (iso/scene/chunks) or the SVG ' +
        'renderer instead.',
    );
  }
}

/**
 * Drives one island's WebGL view. Construct, `await init(...)`, then `add` items;
 * pan/zoom and call `cullToViewport()` (or let `panTo`/`zoomTo` do it) to keep
 * only on-screen chunks live.
 */
export class IsoStage {
  /** The Pixi application. Undefined until {@link init} resolves. */
  app?: Application;
  /** The camera-transformed world layer; children z-sort by iso depth. */
  readonly world: Container;

  private readonly sprites = new Map<string, Sprite>();
  private readonly index = new ChunkIndex<Placed>();
  private readonly chunk: number;

  constructor(chunk = 8) {
    this.chunk = chunk;
    this.world = new Container();
    this.world.sortableChildren = true;
    this.world.label = 'iso-world';
  }

  /**
   * Boot the renderer with the Pixi v8 async API. Pass an existing `<canvas>` to
   * render into it, or any container element to have the created canvas appended.
   * Throws a clear error if WebGL is unavailable.
   */
  async init(target: HTMLCanvasElement | HTMLElement, opts: IsoStageOptions = {}): Promise<void> {
    assertWebGL();
    const app = new Application();
    const isCanvas = typeof HTMLCanvasElement !== 'undefined' && target instanceof HTMLCanvasElement;
    await app.init({
      canvas: isCanvas ? (target as HTMLCanvasElement) : undefined,
      width: opts.width ?? 1280,
      height: opts.height ?? 720,
      background: opts.background ?? 0x000000,
      backgroundAlpha: opts.backgroundAlpha ?? (opts.background === undefined ? 0 : 1),
      antialias: opts.antialias ?? true,
      resolution: opts.resolution ?? 1,
      preference: opts.preference ?? 'webgl',
      autoDensity: true,
    });
    if (!isCanvas) target.appendChild(app.canvas);
    app.stage.addChild(this.world);
    this.app = app;
  }

  /**
   * Place a textured item. Position comes from {@link worldToScreen} and paint
   * order from {@link anchorDepth} (far-corner `gx+gy`), so the sprite sorts
   * against everything else under the contract. The item is also indexed for
   * viewport culling. Returns the created sprite.
   */
  add(placed: Placed, texture: Texture): Sprite {
    const sprite = new Sprite(texture);
    const p = worldToScreen(placed.gx, placed.gy);
    sprite.x = p.x;
    sprite.y = p.y;
    sprite.zIndex = anchorDepth(placed);
    sprite.label = placed.id;
    this.world.addChild(sprite);
    this.sprites.set(placed.id, sprite);
    this.index.add(placed);
    return sprite;
  }

  /** Remove a previously added item. */
  remove(id: string): void {
    const sprite = this.sprites.get(id);
    if (sprite) {
      this.world.removeChild(sprite);
      sprite.destroy();
      this.sprites.delete(id);
    }
    this.index.remove(id);
  }

  /** Centre the camera on a screen-space point (world coordinates × zoom). */
  panTo(sx: number, sy: number): void {
    if (!this.app) return;
    const scale = this.world.scale.x;
    this.world.x = this.app.screen.width / 2 - sx * scale;
    this.world.y = this.app.screen.height / 2 - sy * scale;
    this.cullToViewport();
  }

  /** Set uniform zoom, keeping the current screen centre fixed. */
  zoomTo(scale: number): void {
    if (!this.app) return;
    const cx = this.app.screen.width / 2;
    const cy = this.app.screen.height / 2;
    // World point currently under screen centre.
    const wx = (cx - this.world.x) / this.world.scale.x;
    const wy = (cy - this.world.y) / this.world.scale.y;
    this.world.scale.set(scale);
    this.world.x = cx - wx * scale;
    this.world.y = cy - wy * scale;
    this.cullToViewport();
  }

  /** The current camera window expressed in world (pre-transform) screen space. */
  viewport(): Viewport {
    if (!this.app) return { x: 0, y: 0, w: 0, h: 0 };
    const scale = this.world.scale.x || 1;
    return {
      x: -this.world.x / scale,
      y: -this.world.y / scale,
      w: this.app.screen.width / scale,
      h: this.app.screen.height / scale,
    };
  }

  /**
   * Viewport-driven chunk culling, hooking {@link cull} from chunks.ts. Toggles
   * `sprite.visible` so off-screen chunks cost nothing to draw — the mechanism
   * that lets the P3 atlas hold 700+ islands.
   */
  cullToViewport(): void {
    const visible = new Set(cull(this.index, this.viewport(), this.chunk).map((p) => p.id));
    for (const [id, sprite] of this.sprites) sprite.visible = visible.has(id);
  }

  /**
   * Render a scene to a PNG data URL — the contract's "L0 thumbnails
   * prerendered". Draws each ground tile and placement as a flat iso diamond
   * (no textures needed), extracts it off-screen, and cleans up. Throws if WebGL
   * is unavailable.
   */
  async renderThumbnail(scene: IslandScene, opts: { tileColor?: number; stationColor?: number; artifactColor?: number } = {}): Promise<string> {
    assertWebGL();
    if (!this.app) throw new Error('[renderer/pixi] init() must resolve before renderThumbnail().');

    const layer = new Container();
    layer.sortableChildren = true;
    const tileColor = opts.tileColor ?? 0x6b8f6b;
    const stationColor = opts.stationColor ?? 0xb0a080;

    const diamond = (gx: number, gy: number, color: number, depth: number): void => {
      const pts = diamondPoints(gx, gy);
      const flat: number[] = [];
      for (const pt of pts) flat.push(pt.x, pt.y);
      const g = new Graphics().poly(flat).fill({ color });
      g.zIndex = depth;
      layer.addChild(g);
    };

    if (scene.tiles) {
      for (let gy = 0; gy < scene.tiles.length; gy++) {
        const row = scene.tiles[gy]!;
        for (let gx = 0; gx < row.length; gx++) {
          if (row[gx]) diamond(gx, gy, tileColor, gx + gy);
        }
      }
    }
    for (const s of scene.stations) diamond(s.gx, s.gy, stationColor, anchorDepth(s) + 0.5);
    for (const a of scene.placements) diamond(a.gx, a.gy, opts.artifactColor ?? 0xe8c37a, anchorDepth(a) + 0.5);

    try {
      return await this.app.renderer.extract.base64({ target: layer });
    } finally {
      layer.destroy({ children: true });
    }
  }

  /** Tear down the renderer and free GPU resources. */
  destroy(): void {
    this.sprites.clear();
    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = undefined;
    }
  }
}

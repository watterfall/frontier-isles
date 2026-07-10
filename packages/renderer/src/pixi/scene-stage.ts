/**
 * PixiJS 8 layered isometric stage — M1 layer-order architecture (M1-DESIGN §1).
 *
 * Five stacked containers, only ONE of which depth-sorts. The stage consumes a
 * headless {@link SceneGraph} (P2: it computes nothing — depth key, alpha, layer
 * and elevation are all resolved by the layout layer) and dispatches each object
 * to its layer, setting `zIndex = depthKey` and `alpha = visibilityAt(o, t)`.
 *
 * Sibling to {@link IsoStage} (which stays as the L0-thumbnail engine): both
 * import only iso/scene/chunks for math, so this file is the sole WebGL surface.
 * Camera pan/zoom, viewport culling and the async v8 boot mirror IsoStage.
 */

import {
  Application,
  Container,
  Graphics,
  Matrix,
  RenderTexture,
  Sprite,
  Texture,
  isWebGLSupported,
  type Shader,
  type Ticker,
} from 'pixi.js';
import { ELEV_STEP, diamondPoints, worldToScreenElevated } from '../iso';
import { visibilityAt, type SceneGraph, type SceneLayer, type SceneObject } from '../scene';
import { ChunkIndex, cull, type Viewport } from '../chunks';
import { createSeaMesh, type Rect } from './sea-mesh';

/** Water colours (0..1 rgb) for {@link SceneStage.buildSea}. */
export interface SeaColors {
  seaColor: [number, number, number];
  deepColor: [number, number, number];
  foamColor: [number, number, number];
}

/** Options for {@link SceneStage.init}; mirrors {@link IsoStage}. */
export interface SceneStageOptions {
  width?: number;
  height?: number;
  background?: number | string;
  backgroundAlpha?: number;
  antialias?: boolean;
  resolution?: number;
  preference?: 'webgl' | 'webgpu';
  /** Auto-size the canvas to this element (or window) and follow its resizes. */
  resizeTo?: HTMLElement | Window;
}

/**
 * A resolved sprite: the baked texture plus how it registers to its tile.
 * `anchor` is the fraction of the texture that sits on the tile ground-point
 * (the art's shadow centre), `scale` maps baked pixels → scene units.
 */
export interface ResolvedTexture {
  texture: Texture;
  anchor?: { x: number; y: number };
  scale?: number;
}

/** Resolves a scene object to a texture; return null to fall back to a flat diamond. */
export type TextureResolver = (o: SceneObject) => Texture | ResolvedTexture | null | undefined;

/** zIndex floor for the static terrain bed so it always draws under dynamic objects. */
const TERRAIN_Z = -1e9;

function assertWebGL(): void {
  if (!isWebGLSupported()) {
    throw new Error(
      '[renderer/pixi] WebGL is unavailable. SceneStage needs a GPU context; use ' +
        'the headless core or the SVG renderer instead.',
    );
  }
}

/**
 * The five-layer stage. Construct → `await init(target)` → `render(graph)`; pan/
 * zoom and it re-culls. Layer tree (M1-DESIGN §1):
 *
 * ```
 * app.stage
 * ├─ skyBackdrop   (screen-space backdrop)
 * ├─ sceneContent  (wraps the world-space camera)
 * │   └─ cameraRoot (pan/zoom transform)
 * │       ├─ gradedContent  (seaLayer + worldLayer[terrainRoot] + fogLayer)
 * │       ├─ toneOverlay    (world-space day↔night veil; M3)
 * │       └─ lightsLayer    (emissive window-lights above the veil; M3, M8)
 * └─ uiLayer       (screen-space)
 * ```
 */
export class SceneStage {
  app?: Application;

  /** Screen-space sky backdrop. */
  readonly skyBackdrop = new Container();
  /** Wraps the world-space camera. */
  readonly sceneContent = new Container();
  /** Camera-transformed root; holds every world-space layer. */
  readonly cameraRoot = new Container();
  /** World-space sea (full-screen Mesh in M2). Never sorts. */
  readonly seaLayer = new Container();
  /** The ONLY depth-sorted layer; children z-sort by iso depth key. */
  readonly worldLayer = new Container();
  /** Static terrain bed, cached as one texture. Lives at the bottom of worldLayer. */
  readonly terrainRoot = new Container();
  /** World-space Trust Fog (M6). Never sorts. */
  readonly fogLayer = new Container();
  /** Scene content (sea+world+fog) the day/night tone overlay darkens from above. */
  readonly gradedContent = new Container();
  /** World-space day↔night tone overlay (M3): a deep-blue veil whose alpha ← t. */
  readonly toneOverlay = new Graphics();
  /** Camera-synced emissive layer ABOVE the tone overlay: night window-lights (M3), lanterns/fireflies (M8). */
  readonly lightsLayer = new Container();
  /** Screen-space labels / highlights / panel anchors. Never sorts. */
  readonly uiLayer = new Container();

  private readonly nodes = new Map<string, Container>();
  private readonly objects = new Map<string, SceneObject>();
  private readonly index = new ChunkIndex<SceneObject>();
  private readonly chunk: number;
  private terrainCached = false;
  /** Milliseconds the last on-demand frame took to render — the §7 baseline metric. */
  lastRenderMs = 0;
  private seaShader?: Shader;
  private seaMask?: RenderTexture;
  private seaAnimating = false;

  constructor(chunk = 8) {
    this.chunk = chunk;

    this.skyBackdrop.label = 'sky';
    this.sceneContent.label = 'scene-content';
    this.cameraRoot.label = 'camera-root';
    this.seaLayer.label = 'sea';
    this.worldLayer.label = 'world';
    this.terrainRoot.label = 'terrain';
    this.fogLayer.label = 'fog';
    this.gradedContent.label = 'graded';
    this.toneOverlay.label = 'tone';
    this.lightsLayer.label = 'lights';
    this.uiLayer.label = 'ui';

    // worldLayer is the sole sorting layer; sea/fog/sky/ui explicitly never sort
    // (M1 acceptance: no cross-layer sorting). RenderLayer is the M4 upgrade for
    // terrain↔object interleaving at cliffs; a sortable Container suffices here.
    this.worldLayer.sortableChildren = true;

    // Static terrain bed pinned to the bottom of the sorted world. Its own tiles
    // depth-sort by zIndex so elevation cliffs occlude back-to-front (M4.1).
    this.terrainRoot.zIndex = TERRAIN_Z;
    this.terrainRoot.sortableChildren = true;
    this.worldLayer.addChild(this.terrainRoot);

    // Camera-space stack, bottom→top: scene content (sea/world/fog), then the tone
    // overlay that darkens it toward night, then the emissive lights above the
    // overlay so night windows stay lit over the darkened silhouettes. A world-space
    // overlay instead of a filter — a Pixi v8 filter over the custom sea Mesh crashes
    // the batcher; the overlay is robust and keeps terrain caching (M3 two-path design).
    this.gradedContent.addChild(this.seaLayer, this.worldLayer, this.fogLayer);
    this.toneOverlay.alpha = 0; // day: no veil
    this.lightsLayer.alpha = 0; // day: no window lights
    this.cameraRoot.addChild(this.gradedContent, this.toneOverlay, this.lightsLayer);
    this.sceneContent.addChild(this.cameraRoot);
  }

  /** Boot the Pixi v8 renderer (async API), then wire the top-level layer order. */
  async init(target: HTMLCanvasElement | HTMLElement, opts: SceneStageOptions = {}): Promise<void> {
    assertWebGL();
    const app = new Application();
    const isCanvas = typeof HTMLCanvasElement !== 'undefined' && target instanceof HTMLCanvasElement;
    await app.init({
      canvas: isCanvas ? (target as HTMLCanvasElement) : undefined,
      resizeTo: opts.resizeTo,
      width: opts.width ?? 1280,
      height: opts.height ?? 720,
      background: opts.background ?? 0x000000,
      backgroundAlpha: opts.backgroundAlpha ?? (opts.background === undefined ? 0 : 1),
      antialias: opts.antialias ?? true,
      resolution: opts.resolution ?? 1,
      preference: opts.preference ?? 'webgl',
      autoDensity: true,
      // M1 scene is static except on interaction → render on demand, no perpetual
      // rAF loop (cheaper, and cooperative with automated/headless tooling). The
      // ticker returns in M5 for micro-dynamics.
      autoStart: false,
    });
    if (!isCanvas) {
      app.canvas.style.display = 'block';
      app.canvas.style.width = '100%';
      app.canvas.style.height = '100%';
      target.appendChild(app.canvas);
    }
    // Paint order: sky (back) → scene content (sea/world/fog) → ui (front).
    app.stage.addChild(this.skyBackdrop, this.sceneContent, this.uiLayer);
    this.app = app;
  }

  /** Render one frame on demand and record its cost (§7 baseline). */
  private redraw(): void {
    if (!this.app) return;
    const t0 = performance.now();
    this.app.render();
    this.lastRenderMs = performance.now() - t0;
  }

  private layerFor(layer: SceneLayer): Container {
    switch (layer) {
      case 'sea':
        return this.seaLayer;
      case 'terrain':
        return this.terrainRoot;
      case 'fog':
        return this.fogLayer;
      case 'ui':
        return this.uiLayer;
      case 'world':
      default:
        return this.worldLayer;
    }
  }

  /**
   * Build a display node for an object: a textured Sprite, or a placeholder —
   * a flat iso diamond (terrain/sea) or an extruded iso box whose height the
   * layout layer bound to data (claim floors, station kind). The box is M1
   * scaffolding; the 36-primitive kit replaces it in M4.
   */
  private makeNode(o: SceneObject, resolve?: TextureResolver): Container {
    const r = resolve?.(o);
    if (r) {
      const tex = r instanceof Texture ? r : r.texture;
      const anchor = (r instanceof Texture ? undefined : r.anchor) ?? { x: 0.5, y: 0.85 };
      const scl = (r instanceof Texture ? undefined : r.scale) ?? 1;
      const p = worldToScreenElevated(o.gx, o.gy, o.elevation);
      const c = new Container();
      const spr = new Sprite(tex);
      spr.anchor.set(anchor.x, anchor.y);
      spr.scale.set(scl);
      // The station art bakes in its own `--shadow` contact ellipse, so we do NOT
      // add a second one here: a mismatched ground point would make the extra
      // shadow detach from the building and float on the terrain.
      c.addChild(spr);
      c.x = p.x;
      c.y = p.y;
      c.label = o.id;
      return c;
    }
    if (o.kind === 'claim') return this.makeClaimMark(o);
    // diamondPoints is elevation-0 screen space; the elevation lift is applied
    // per case below (terrain columns vs objects standing on their tile).
    const pts = diamondPoints(o.gx, o.gy);
    const color = placeholderColor(o);
    const g = new Graphics();
    const flatAt = (lift: number): number[] => {
      const out: number[] = [];
      for (const pt of pts) out.push(pt.x, pt.y - lift);
      return out;
    };
    if (o.layer === 'terrain') {
      // A terrain tile is a column from the sea baseline up to its elevation, so
      // its front skirts read as cliffs (M4.1). Elevation 0 → a flat beach diamond.
      const colH = o.elevation * ELEV_STEP;
      if (colH > 0) drawIsoBox(g, pts, 0, colH, color);
      else g.poly(flatAt(0)).fill({ color });
    } else {
      // An object stands on terrain of height o.elevation; its box extrudes above.
      const lift = o.elevation * ELEV_STEP;
      const h = o.height ?? 0;
      if (h > 0) drawIsoBox(g, pts, lift, h, color);
      else g.poly(flatAt(lift)).fill({ color });
    }
    g.label = o.id;
    return g;
  }

  /**
   * A claim as a small illustrated BUILDING — INTERIM (option C stopgap): claims
   * have no design-system mockup of their own yet, so they borrow the station
   * grammar (cream wall + domain roof + ink outline + contact shadow) until the
   * design loop delivers a claim-specific form. Height binds to independent
   * reproductions (floors ← ledger); a consensus roof gets a ridge + flag; a
   * refuted claim reads as a pale night ghost. Every dimension binds to data (P1).
   */
  private makeClaimMark(o: SceneObject): Container {
    const pts = diamondPoints(o.gx, o.gy);
    const cx = (pts[0]!.x + pts[2]!.x) / 2;
    const cy = (pts[0]!.y + pts[2]!.y) / 2;
    const lift = o.elevation * ELEV_STEP;
    const floors = Math.max(0, o.growth?.floors ?? 0);
    const roof = o.growth?.roof ?? false;
    const ghost = o.dayVisibility === 0;
    // A claim hut is smaller than a civic station: shrink the tile diamond.
    const sp = pts.map((p) => ({ x: cx + (p.x - cx) * 0.6, y: cy + (p.y - cy) * 0.6 }));
    const height = 13 + floors * 11; // base + one storey per reproduction (P1)
    const wall = ghost ? 0x37436a : 0xf3ead2; // --wall cream (night → deep)
    const roofCol = ghost ? 0x3a4468 : claimRoof(o.biome); // domain roof
    const ink = ghost ? 0x8e99be : 0x3a342b;
    const c = new Container();
    const shW = Math.max(8, (sp[1]!.x - sp[3]!.x) * 0.5);
    c.addChild(new Graphics().ellipse(cx, cy - lift, shW, shW * 0.42).fill({ color: 0x241c10, alpha: ghost ? 0.1 : 0.2 }));
    const g = new Graphics();
    drawIsoBuilding(g, sp, lift, height, wall, roofCol, ink, roof && !ghost);
    c.addChild(g);
    c.label = o.id;
    return c;
  }

  /**
   * Render a full scene graph. Clears the previous frame, dispatches every object
   * to its layer with `zIndex = depthKey` and `alpha = visibilityAt(o, t)`, caches
   * the static terrain bed, then culls to the viewport. The renderer computes no
   * layout — it consumes the graph verbatim (P2).
   */
  render(graph: SceneGraph, resolve?: TextureResolver): void {
    this.clearNodes();
    for (const o of graph.objects) {
      const node = this.makeNode(o, resolve);
      node.zIndex = o.depthKey;
      node.alpha = visibilityAt(o, graph.t);
      this.layerFor(o.layer).addChild(node);
      this.nodes.set(o.id, node);
      this.objects.set(o.id, o);
      this.index.add(o);
    }
    this.buildLights(graph);
    this.buildToneOverlay();
    this.applyToneAndLights(graph.t);
    this.recacheTerrain();
    this.cullToViewport();
  }

  /** Draw the world-space tone veil covering the island + open sea (alpha ← t). */
  private buildToneOverlay(): void {
    const b = this.terrainRoot.getLocalBounds();
    this.toneOverlay.clear();
    if (b.width <= 0) return;
    const margin = 2200;
    this.toneOverlay
      .rect(b.x - margin, b.y - margin, b.width + 2 * margin, b.height + 2 * margin)
      .fill({ color: 0x0a1428 });
  }

  /**
   * Warm window-light per building (M3 "silhouette + lit windows"). Emissive dots
   * in the unfiltered {@link lightsLayer}, placed at each building's box top, that
   * the tone filter can't darken. Faded in/out as a group by {@link applyToneAndLights}.
   */
  private buildLights(graph: SceneGraph): void {
    this.lightsLayer.removeChildren().forEach((c) => c.destroy());
    for (const o of graph.objects) {
      const h = o.height ?? 0;
      if (o.layer !== 'world' || h <= 8) continue;
      if (o.kind.startsWith('ghost:') || o.kind.startsWith('scenery:')) continue;
      const c = worldToScreenElevated(o.gx + 0.5, o.gy + 0.5, o.elevation);
      const g = new Graphics().circle(c.x, c.y - h * 0.55, Math.max(5, h * 0.32)).fill({ color: 0xffe6b0 });
      this.lightsLayer.addChild(g);
    }
  }

  /** How lit the night windows are at slider `t` — off in daylight, on past dusk. */
  private nightLights(t: number): number {
    return Math.max(0, Math.min(1, (t - 0.35) / 0.6));
  }

  /** Apply the two non-alpha day/night paths: global tone veil + window lights. */
  private applyToneAndLights(t: number): void {
    this.toneOverlay.alpha = t * 0.66;
    this.lightsLayer.alpha = this.nightLights(t);
  }

  /**
   * Update only the day↔night mix without rebuilding the scene — the per-object
   * visibility path (P4). Alpha interpolates `dayVisibility → nightVisibility`.
   */
  setDayNight(t: number): void {
    for (const [id, node] of this.nodes) {
      const o = this.objects.get(id);
      if (o) node.alpha = visibilityAt(o, t);
    }
    this.applyToneAndLights(t);
    this.redraw();
  }

  /**
   * Build the animated water plane (M2) in the sea layer. Renders the static
   * terrain silhouette to a coastline mask (land = alpha 1) so the shader can
   * paint a shore-foam band, then starts a ticker that advances the wave time —
   * the only animated content, so the rest of the static scene rides along cheaply.
   * Call after {@link render} (needs the terrain in place).
   */
  buildSea(colors: SeaColors, opts: { margin?: number } = {}): void {
    if (!this.app) return;
    const b = this.terrainRoot.getLocalBounds();
    if (b.width <= 0 || b.height <= 0) return; // no terrain yet
    const maskRect: [number, number, number, number] = [b.x, b.y, b.width, b.height];

    // Coastline mask: rasterise the terrain footprint into a texture whose alpha
    // is land coverage. A matrix maps the world-screen bounds into the texture.
    const maskW = 256;
    const maskH = Math.max(1, Math.round((256 * b.height) / b.width));
    const mask = RenderTexture.create({ width: maskW, height: maskH, antialias: false });
    const m = new Matrix().translate(-b.x, -b.y).scale(maskW / b.width, maskH / b.height);
    this.app.renderer.render({ target: mask, container: this.terrainRoot, transform: m, clear: true });

    const margin = opts.margin ?? 800;
    const rect: Rect = { x: b.x - margin, y: b.y - margin, w: b.width + 2 * margin, h: b.height + 2 * margin };
    const { mesh, shader } = createSeaMesh({ rect, maskRect, mask, ...colors });

    this.seaMask?.destroy(true);
    this.seaLayer.removeChildren().forEach((c) => c.destroy());
    this.seaLayer.addChild(mesh);
    this.seaShader = shader;
    this.seaMask = mask;

    if (!this.seaAnimating) {
      this.app.ticker.add(this.tickSea);
      this.app.start(); // resume the render loop (init used autoStart:false)
      this.seaAnimating = true;
    }
  }

  /** Toggle the disputed-sea undertow (M2 acceptance: switchable). */
  setUndertow(on: boolean): void {
    const u = this.seaShader?.resources.waveUniforms?.uniforms as { uUndertow: number } | undefined;
    if (u) u.uUndertow = on ? 1 : 0;
  }

  /** Advance the wave clock each frame; app.start() auto-renders after. */
  private tickSea = (ticker: Ticker): void => {
    const u = this.seaShader?.resources.waveUniforms?.uniforms as { uTime: number } | undefined;
    if (u) u.uTime += ticker.deltaTime * 0.02;
  };

  /** Rasterise the static terrain bed to a single texture (fewest draw calls). */
  private recacheTerrain(): void {
    if (this.terrainCached) {
      this.terrainRoot.cacheAsTexture(false);
      this.terrainCached = false;
    }
    if (this.terrainRoot.children.length > 0) {
      this.terrainRoot.cacheAsTexture({ antialias: true });
      this.terrainCached = true;
    }
  }

  /** Remove and destroy every rendered node, resetting the spatial index. */
  private clearNodes(): void {
    if (this.terrainCached) {
      this.terrainRoot.cacheAsTexture(false);
      this.terrainCached = false;
    }
    for (const [id, node] of this.nodes) {
      node.parent?.removeChild(node);
      node.destroy({ children: true });
      this.index.remove(id);
    }
    this.lightsLayer.removeChildren().forEach((c) => c.destroy());
    this.nodes.clear();
    this.objects.clear();
  }

  // ─── Camera (mirrors IsoStage, applied to cameraRoot) ──────────────────────

  /** Centre the camera on a world-space (pre-transform) screen point. */
  panTo(sx: number, sy: number): void {
    if (!this.app) return;
    const scale = this.cameraRoot.scale.x;
    this.cameraRoot.x = this.app.screen.width / 2 - sx * scale;
    this.cameraRoot.y = this.app.screen.height / 2 - sy * scale;
    this.cullToViewport();
  }

  /** Set uniform zoom, keeping the current screen centre fixed. */
  zoomTo(scale: number): void {
    if (!this.app) return;
    const cx = this.app.screen.width / 2;
    const cy = this.app.screen.height / 2;
    const wx = (cx - this.cameraRoot.x) / this.cameraRoot.scale.x;
    const wy = (cy - this.cameraRoot.y) / this.cameraRoot.scale.y;
    this.cameraRoot.scale.set(scale);
    this.cameraRoot.x = cx - wx * scale;
    this.cameraRoot.y = cy - wy * scale;
    this.cullToViewport();
  }

  /** Current camera window in world (pre-transform) screen space. */
  viewport(): Viewport {
    if (!this.app) return { x: 0, y: 0, w: 0, h: 0 };
    const scale = this.cameraRoot.scale.x || 1;
    return {
      x: -this.cameraRoot.x / scale,
      y: -this.cameraRoot.y / scale,
      w: this.app.screen.width / scale,
      h: this.app.screen.height / scale,
    };
  }

  /**
   * Toggle each dynamic node's visibility by viewport culling (chunks.ts). The
   * cached terrain bed is one draw call and is left visible. This is the same
   * mechanism that lets Z1 hold 50 islands (M7).
   */
  cullToViewport(): void {
    const visible = new Set(cull(this.index, this.viewport(), this.chunk).map((p) => p.id));
    for (const [id, node] of this.nodes) node.visible = visible.has(id);
    this.redraw();
  }

  /** Number of dynamic (non-terrain) nodes that sort each frame — the §7 metric. */
  sortedNodeCount(): number {
    let n = 0;
    for (const o of this.objects.values()) if (o.layer === 'world') n++;
    return n;
  }

  /** Tear down the renderer and free GPU resources. */
  destroy(): void {
    if (this.app && this.seaAnimating) this.app.ticker.remove(this.tickSea);
    this.seaAnimating = false;
    this.clearNodes();
    this.seaMask?.destroy(true);
    this.seaMask = undefined;
    this.seaShader = undefined;
    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = undefined;
    }
  }
}

/** Shift a hex colour lighter (`f > 0`) or darker (`f < 0`) by fraction `f`. */
function shade(color: number, f: number): number {
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  const m = (c: number): number =>
    Math.max(0, Math.min(255, Math.round(f >= 0 ? c + (255 - c) * f : c * (1 + f))));
  return (m(r) << 16) | (m(g) << 8) | m(b);
}

/**
 * Draw an isometric cube on `g` from a tile's ground diamond `pts`
 * (`[top, right, bottom, left]`), lifted by `lift` and extruded up by `height`.
 * Only the two front faces + top are visible; the top is lightened and the sides
 * shaded so structure reads without textures (M1 placeholder).
 */
function drawIsoBox(
  g: Graphics,
  pts: readonly { x: number; y: number }[],
  lift: number,
  height: number,
  color: number,
): void {
  const [T, R, B, L] = pts as [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }];
  const gy = (p: { y: number }): number => p.y - lift; // ground edge
  const ty = (p: { y: number }): number => p.y - lift - height; // extruded top
  // left front face
  g.poly([L.x, gy(L), B.x, gy(B), B.x, ty(B), L.x, ty(L)]).fill({ color: shade(color, -0.3) });
  // right front face
  g.poly([B.x, gy(B), R.x, gy(R), R.x, ty(R), B.x, ty(B)]).fill({ color: shade(color, -0.15) });
  // top face
  g.poly([T.x, ty(T), R.x, ty(R), B.x, ty(B), L.x, ty(L)]).fill({ color: shade(color, 0.12) });
}

/**
 * A small illustrated building: cream walls (two shaded front faces) + a domain
 * roof (top face) + ink outline. `crown` adds a consensus ridge + flag. The
 * interim claim vocabulary (option C) reusing the station look until a claim
 * design lands in the design system.
 */
function drawIsoBuilding(
  g: Graphics,
  pts: readonly { x: number; y: number }[],
  lift: number,
  height: number,
  wall: number,
  roof: number,
  ink: number,
  crown: boolean,
): void {
  const [T, R, B, L] = pts as [
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
  ];
  const gy = (p: { y: number }): number => p.y - lift;
  const ty = (p: { y: number }): number => p.y - lift - height;
  g.poly([L.x, gy(L), B.x, gy(B), B.x, ty(B), L.x, ty(L)]).fill({ color: shade(wall, -0.16) }).stroke({ color: ink, width: 1, alpha: 0.85 });
  g.poly([B.x, gy(B), R.x, gy(R), R.x, ty(R), B.x, ty(B)]).fill({ color: shade(wall, -0.05) }).stroke({ color: ink, width: 1, alpha: 0.85 });
  g.poly([T.x, ty(T), R.x, ty(R), B.x, ty(B), L.x, ty(L)]).fill({ color: roof }).stroke({ color: ink, width: 1, alpha: 0.85 });
  if (crown) {
    // Consensus: a lit roof ridge + a small flag at the back peak.
    g.moveTo(T.x, ty(T)).lineTo(B.x, ty(B)).stroke({ color: shade(roof, 0.45), width: 1.5 });
    g.moveTo(T.x, ty(T)).lineTo(T.x, ty(T) - 15).stroke({ color: ink, width: 1.2 });
    g.poly([T.x, ty(T) - 15, T.x + 11, ty(T) - 12, T.x, ty(T) - 9]).fill({ color: 0xe0a93a });
  }
}

/** Domain roof colour for the interim claim building (DOMAIN_COLORS ink values). */
function claimRoof(biome: string): number {
  switch (biome) {
    case '数理':
      return 0x2e5e8c;
    case '物质':
      return 0xb5673a;
    case '生命':
      return 0x2b7a5f;
    case '交叉':
      return 0xa08428;
    default:
      return 0x8a7a4a;
  }
}

/**
 * Un-textured station tint — warm cream wall tones (design-system palette:
 * `--wall #F8F1DE`; day is warm parchment, NOT the earlier cool/bronze). A
 * subtle per-domain warmth; the domain really reads via the (textured) roof.
 */
function biomeTint(biome: string): number {
  switch (biome) {
    case '数理':
      return 0xe6e0cf;
    case '物质':
      return 0xece0c2;
    case '生命':
      return 0xe2e6cc;
    case '交叉':
      return 0xe8e0c8;
    default:
      return 0xece2c8;
  }
}

/**
 * Ground tint per biome — VERBATIM the design-system `--ground` day values
 * (DOMAIN_SCENE_VARS in packages/assets): warm parchment, not gray-green.
 * Elevation lightens subtly so cliff tops read.
 */
function groundTint(biome: string, elevation: number): number {
  const base =
    biome === '数理' ? 0xe0dbc8 : biome === '物质' ? 0xe8d6a8 : biome === '生命' ? 0xd2e0b8 : 0xddd0ac;
  return elevation >= 1 ? shade(base, 0.06 * elevation) : base;
}

/** A fallback colour for untextured objects, tinted by kind + biome. */
function placeholderColor(o: SceneObject): number {
  if (o.layer === 'terrain') return groundTint(o.biome, o.elevation);
  if (o.layer === 'sea') return 0xbccedc; // pale domain water (--water 数理), not deep teal
  if (o.kind.startsWith('ghost:')) return 0x8a86b8;
  if (o.kind.startsWith('scenery:')) return shade(groundTint(o.biome, 0), 0.15);
  if (o.kind === 'claim') return 0xd8c98a;
  if (o.kind.startsWith('station:')) return biomeTint(o.biome);
  return 0xb0a080;
}

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
  Particle,
  ParticleContainer,
  RenderTexture,
  Rectangle,
  Sprite,
  Text,
  TextStyle,
  Texture,
  isWebGLSupported,
  type Shader,
  type Ticker,
} from 'pixi.js';
import { ELEV_STEP, diamondPoints, worldToScreen, worldToScreenElevated, type ScreenPoint } from '../iso';
import { DOI_SEAL_INK } from './palette';
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
  /**
   * Called with a picked object's id when the user taps an interactive world node
   * (station / claim). The React host maps the id back to a domain action
   * (e.g. `station:workshop` → open that station). Set before/after render; the
   * handler is read live, so late assignment still works.
   */
  onPick?: (id: string) => void;
  private seaShader?: Shader;
  private seaMask?: RenderTexture;
  private seaAnimating = false;
  /** prefers-reduced-motion for the WebGL surface (R7 ride-along C). Gates the
   *  continuous sea + micro-dynamics tickers; the host sets it via setReducedMotion. */
  private reducedMotion = false;
  /** Current agitation magnitude (R7 Dim 2). Persisted so a sea REBUILD (boot,
   *  replay) restores it — buildSea seeds uAgitation from here, not a hardcoded 0. */
  private agitation = 0;

  // ── M5 micro-dynamics: one ticker drives every subtle motion. Each binds to
  //    data (P1): ghost bob ← refuted/returned, halo breathe ← consensus, window
  //    twinkle ← per-building phase (ambiance, on the M5 whitelist). ──────────
  private dynAnimating = false;
  private elapsed = 0; // frames accumulated (ticker.deltaTime units)
  private curT = 0; // the day↔night value actually applied this frame
  private targetT = 0; // where tweenDayNight is easing curT toward
  private tweeningT = false;
  private ghostNodes: Array<{ node: Container; baseY: number; phase: number }> = [];
  private haloNodes: Container[] = [];

  // ── M8 micro-dynamics (second batch): chimney smoke / flag wave. Both are
  //    gated on SceneObject.active — set only by core.projectActiveStations
  //    (recent ledger activity touching that station), never a decorative
  //    always-on loop (scene-upgrade OUTSTANDING.md P1). Ride the SAME
  //    dynamics ticker as M5; no second loop. ─────────────────────────────
  private smokePuffs: Array<{ node: Graphics; baseX: number; baseY: number; phase: number }> = [];
  private flagPennants: Array<{ node: Container; phase: number }> = [];

  // ── M8 micro-dynamics (second batch): night fireflies. A ParticleContainer of
  //    a few motes hovering over each ACTIVE station (core.projectActiveStations
  //    → SceneObject.active) — the data reading is "someone is at work here."
  //    Lives in lightsLayer, so it inherits the night gate (alpha ← nightLights,
  //    invisible by day, same day0/night1 door as the ghosts). Rebuilt each render
  //    (after buildLights clears lightsLayer); driven by the shared dynamics ticker.
  private fireflyContainer?: ParticleContainer;
  private fireflyTexture?: Texture;
  private fireflyParticles: Array<{ p: Particle; cx: number; cy: number; ampX: number; ampY: number; phase: number }> = [];

  // ── Screen-space station labels (crisp, LOD-tiered). Billboarded above each
  //    station at a CONSTANT screen size so they read at ANY zoom; the baked
  //    raster namecards went soft/illegible when scaled. LOD: far zoom → the
  //    single-glyph seal, near zoom → the full name. ─────────────────────────
  readonly labelLayer = new Container();
  private labelSpecs: Array<{
    id: string;
    gx: number; gy: number; elevation: number; height: number;
    short: string; full: string; group: Container; text: Text; bg: Graphics; showing: string;
  }> = [];

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

    // Station labels live in the screen-space uiLayer (never camera-transformed,
    // so text stays a constant, crisp size). `passive` keeps the layer itself
    // transparent to hits while allowing each semantic label group to be tapped.
    this.labelLayer.label = 'labels';
    this.labelLayer.eventMode = 'passive';
    this.uiLayer.addChild(this.labelLayer);
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
    // Enable the pointer event system so interactive world nodes (stations/claims)
    // can be tapped (see render()). Events are DOM-driven, so this works even with
    // autoStart:false / on-demand render — no ticker required for picking.
    app.stage.eventMode = 'static';
    this.app = app;
  }

  /** Render one frame on demand and record its cost (§7 baseline). */
  private redraw(): void {
    if (!this.app) return;
    const t0 = performance.now();
    this.app.render();
    this.lastRenderMs = performance.now() - t0;
  }

  /** Controlled host resize. Kept outside Pixi's ResizePlugin so unmounting a
   * desktop scene while crossing the mobile breakpoint cannot leave a queued
   * resize callback touching an already-destroyed renderer. */
  resize(width: number, height: number): void {
    if (!this.app || width < 1 || height < 1) return;
    this.app.renderer.resize(width, height);
    this.layoutLabels();
    this.cullToViewport();
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
    if (o.kind.startsWith('landmark:')) return this.makeLandmark(o);
    if (o.kind.startsWith('resident:')) return this.makeResident(o);
    if (o.kind.startsWith('scenery:')) return this.makeScenery(o);
    if (o.kind.startsWith('ghost:')) return this.makeGhostArtifact(o);
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

  /** Human and AI inhabitants are small life traces, not anonymous boxes. */
  private makeResident(o: SceneObject): Container {
    const p = worldToScreenElevated(o.gx + 0.5, o.gy + 0.5, o.elevation);
    const ai = o.kind === 'resident:ai';
    const g = new Graphics();
    g.ellipse(p.x, p.y + 2, 7, 3).fill({ color: 0x3a3024, alpha: 0.16 });
    g.circle(p.x, p.y - 13, ai ? 3.5 : 3).fill({ color: ai ? 0xe3a93c : 0x3a342b, alpha: ai ? 0.9 : 1 });
    g.moveTo(p.x, p.y - 9).lineTo(p.x, p.y - 1).stroke({ color: ai ? 0x2e5e8c : 0x3a342b, width: 2, alpha: 0.92 });
    g.moveTo(p.x, p.y - 6).lineTo(p.x - 4, p.y - 3).moveTo(p.x, p.y - 6).lineTo(p.x + 4, p.y - 4)
      .stroke({ color: ai ? 0x2e5e8c : 0x3a342b, width: 1.4, alpha: 0.9 });
    if (ai) {
      g.circle(p.x, p.y - 13, 6.5).stroke({ color: 0x2e5e8c, width: 1, alpha: 0.58 });
      g.moveTo(p.x - 7, p.y - 13).lineTo(p.x - 10, p.y - 13).moveTo(p.x + 7, p.y - 13).lineTo(p.x + 10, p.y - 13)
        .stroke({ color: 0x2e5e8c, width: 1, alpha: 0.48 });
    }
    const c = new Container();
    c.addChild(g);
    c.label = o.id;
    return c;
  }

  /** Domain scenery keeps its own silhouette so the biome is readable at a glance. */
  private makeScenery(o: SceneObject): Container {
    const p = worldToScreenElevated(o.gx + 0.5, o.gy + 0.5, o.elevation);
    const kind = o.kind.slice('scenery:'.length);
    const g = new Graphics();
    if (kind === 'tree' || kind === 'bamboo') {
      const bamboo = kind === 'bamboo';
      const trunks = bamboo ? [-5, 0, 5] : [0];
      for (const dx of trunks) {
        g.moveTo(p.x + dx, p.y).lineTo(p.x + dx, p.y - (bamboo ? 28 : 22)).stroke({ color: 0x6d5136, width: bamboo ? 1.5 : 2 });
        if (bamboo) for (let y = 8; y < 26; y += 8) g.moveTo(p.x + dx - 2, p.y - y).lineTo(p.x + dx + 2, p.y - y).stroke({ color: 0x4e7d62, width: 1 });
      }
      if (!bamboo) {
        g.circle(p.x, p.y - 28, 10).fill({ color: 0x4e7d62, alpha: 0.9 });
        g.circle(p.x - 8, p.y - 23, 7).fill({ color: 0x6f946d, alpha: 0.82 });
        g.circle(p.x + 7, p.y - 22, 6).fill({ color: 0x3e8067, alpha: 0.82 });
        g.circle(p.x - 13, p.y - 3, 4).fill({ color: 0x6f946d, alpha: 0.64 });
        g.circle(p.x + 11, p.y - 2, 3).fill({ color: 0x4e7d62, alpha: 0.58 });
      } else {
        g.ellipse(p.x - 8, p.y - 20, 7, 2.5).fill({ color: 0x4e7d62, alpha: 0.88 });
        g.ellipse(p.x + 8, p.y - 15, 7, 2.5).fill({ color: 0x4e7d62, alpha: 0.78 });
      }
    } else if (kind === 'lotus') {
      g.ellipse(p.x, p.y, 20, 8).fill({ color: 0x85a8b8, alpha: 0.58 }).stroke({ color: 0x2e5e8c, width: 1, alpha: 0.5 });
      g.ellipse(p.x - 7, p.y - 1, 6, 2.5).fill({ color: 0x4e7d62, alpha: 0.85 });
      g.circle(p.x + 5, p.y - 4, 2.5).fill({ color: 0xd8898f });
    } else if (kind === 'reef' || kind === 'creationStone') {
      g.poly([p.x - 11, p.y, p.x - 6, p.y - 15, p.x, p.y - 8, p.x + 5, p.y - 19, p.x + 12, p.y])
        .fill({ color: kind === 'creationStone' ? 0x99a9b3 : 0xb5aa92 }).stroke({ color: 0x4a4238, width: 1 });
      if (kind === 'reef') {
        g.poly([p.x + 10, p.y + 2, p.x + 15, p.y - 7, p.x + 20, p.y + 2]).fill({ color: 0x9f9684, alpha: 0.82 }).stroke({ color: 0x4a4238, width: 0.7 });
        g.moveTo(p.x - 18, p.y + 5).quadraticCurveTo(p.x, p.y + 9, p.x + 24, p.y + 4).stroke({ color: 0x85a8b8, width: 1, alpha: 0.52 });
      }
    } else if (kind === 'stoneLantern') {
      g.rect(p.x - 3, p.y - 16, 6, 16).fill({ color: 0xc8bea8 }).stroke({ color: 0x4a4238, width: 1 });
      g.poly([p.x - 9, p.y - 16, p.x, p.y - 22, p.x + 9, p.y - 16]).fill({ color: 0x66756f }).stroke({ color: 0x4a4238, width: 1 });
      g.circle(p.x, p.y - 15, 2).fill({ color: 0xe3a93c });
    } else {
      // stepping stones / desire-path marks: low, quiet navigation texture.
      for (let i = 0; i < 3; i++) g.ellipse(p.x - 8 + i * 8, p.y - i * 3, 5, 2.5).fill({ color: 0xb7a98e, alpha: 0.72 });
    }
    const c = new Container();
    c.addChild(g);
    c.label = o.id;
    return c;
  }

  /** Night history survives as a translucent artifact, never a dark solid box. */
  private makeGhostArtifact(o: SceneObject): Container {
    const p = worldToScreenElevated(o.gx + 0.5, o.gy + 0.5, o.elevation);
    const kind = o.kind.slice('ghost:'.length);
    const g = new Graphics();
    g.ellipse(p.x, p.y + 2, 16, 6).fill({ color: 0x151d3b, alpha: 0.2 });
    if (kind === 'card') {
      g.poly([p.x - 13, p.y - 3, p.x - 9, p.y - 22, p.x + 13, p.y - 18, p.x + 10, p.y])
        .fill({ color: 0xc9d7f2, alpha: 0.18 }).stroke({ color: 0xc9d7f2, width: 1.2, alpha: 0.78 });
      g.moveTo(p.x - 6, p.y - 15).lineTo(p.x + 7, p.y - 13).moveTo(p.x - 7, p.y - 10).lineTo(p.x + 3, p.y - 8)
        .stroke({ color: 0xc9d7f2, width: 1, alpha: 0.5 });
    } else {
      g.rect(p.x - 12, p.y - 21, 24, 20).fill({ color: 0xc9d7f2, alpha: 0.1 }).stroke({ color: 0xc9d7f2, width: 1.2, alpha: 0.72 });
      g.moveTo(p.x - 12, p.y - 21).lineTo(p.x + 12, p.y - 1).moveTo(p.x + 12, p.y - 21).lineTo(p.x - 12, p.y - 1)
        .stroke({ color: 0xc9d7f2, width: 0.8, alpha: 0.42 });
    }
    g.circle(p.x + 11, p.y - 23, 2.2).fill({ color: 0xe3a93c, alpha: 0.65 });
    const c = new Container();
    c.addChild(g);
    c.label = o.id;
    return c;
  }

  /** Desire paths connect the actual visible civic stations. They are cached
   * with terrain and therefore add no per-frame burden. */
  private buildDesirePaths(graph: SceneGraph): void {
    const byKind = new Map(graph.objects.filter((o) => o.kind.startsWith('station:')).map((o) => [o.kind.slice('station:'.length), o] as const));
    const circuit = ['dock', 'gallery', 'canvas', 'data', 'library', 'workshop', 'questions', 'driftwood', 'tearoom', 'dock'];
    const g = new Graphics();
    for (let i = 0; i < circuit.length - 1; i++) {
      const a = byKind.get(circuit[i]!);
      const b = byKind.get(circuit[i + 1]!);
      if (!a || !b) continue;
      const pa = worldToScreenElevated(a.gx + 0.5, a.gy + 0.5, a.elevation);
      const pb = worldToScreenElevated(b.gx + 0.5, b.gy + 0.5, b.elevation);
      const mx = (pa.x + pb.x) / 2 + (pb.y - pa.y) * 0.08;
      const my = (pa.y + pb.y) / 2 - (pb.x - pa.x) * 0.035;
      g.moveTo(pa.x, pa.y).quadraticCurveTo(mx, my, pb.x, pb.y).stroke({ color: 0xe2c98f, width: 10, alpha: 0.38, cap: 'round' });
      g.moveTo(pa.x, pa.y).quadraticCurveTo(mx, my, pb.x, pb.y).stroke({ color: 0x8f7c5b, width: 1.2, alpha: 0.42, cap: 'round' });
    }
    g.label = 'desire-paths';
    this.terrainRoot.addChild(g);
  }

  /**
   * Claim-as-building court before Gallery. Foundation = public claim; each
   * countable reproduction adds one thin storey; consensus adds the domain
   * canopy and halo; refuted/returned claims survive as night scaffolds. The
   * footprint stays smaller than every civic station, so claim and station
   * remain visually distinct while the old prototype's growth metaphor returns.
   */
  private makeClaimMark(o: SceneObject): Container {
    const pts = diamondPoints(o.gx, o.gy);
    const cx = (pts[0]!.x + pts[2]!.x) / 2;
    const groundY = (pts[0]!.y + pts[2]!.y) / 2 - o.elevation * ELEV_STEP;
    const floors = Math.max(0, o.growth?.floors ?? 0);
    const roof = o.growth?.roof ?? false;
    const spectral = o.dayVisibility === 0;
    const dom = claimDomain(o.biome);
    const a = 14; // thin research tower, clearly subordinate to civic stations
    const gy = groundY + a / 2;
    const wall = spectral ? 0xc9d7f2 : 0xf8f1de;
    const sh = spectral ? 0xc9d7f2 : 0xe7dabe;
    const top = spectral ? 0xc9d7f2 : 0xfbf6e9;
    const ink = spectral ? 0xc9d7f2 : 0x3a342b;
    const fa = spectral ? 0.2 : 1;
    const sw = spectral ? 1.3 : 1.5;
    const g = new Graphics();
    if (!spectral) g.ellipse(cx, gy + a / 2 + 2, a * 1.4, a * 0.6).fill({ color: 0x3a3024, alpha: 0.16 });

    // Public existence is a masonry foundation. Each independent reproduction
    // earns one narrow storey; a new claim remains a visible paper scaffold.
    const baseH = 7;
    drawStory(g, cx, gy, a + 2, baseH, wall, sh, top, ink, sw, fa);
    let yTop = gy - baseH;
    const visibleStoreys = Math.max(1, floors);
    for (let k = 0; k < visibleStoreys; k++) {
      const storyH = floors === 0 ? 11 : 10;
      drawStory(g, cx, yTop, a - k * 0.45, storyH, wall, sh, top, ink, sw, floors === 0 ? 0.38 : fa);
      // window / inscription: one luminous opening per countable reproduction.
      if (floors > 0 && !spectral) {
        g.rect(cx - 3.2, yTop - storyH + 3, 4.8, 3.6).fill({ color: k === floors - 1 ? 0xe3a93c : 0x85a8b8, alpha: 0.82 });
      }
      yTop -= storyH;
    }
    // In-progress / refuted forms expose a light scaffold: research still under
    // construction or remembered, never silently deleted.
    if (floors === 0 || spectral) {
      g.moveTo(cx - a, gy).lineTo(cx - a, yTop - 10).lineTo(cx + a, yTop - 4).lineTo(cx + a, gy)
        .stroke({ color: ink, width: 1, alpha: spectral ? 0.52 : 0.42 });
      g.moveTo(cx - a, yTop - 4).lineTo(cx + a, yTop - 10).moveTo(cx - a, yTop - 10).lineTo(cx + a, yTop - 4)
        .stroke({ color: ink, width: 0.8, alpha: spectral ? 0.42 : 0.3 });
    }

    let halo: Graphics | null = null;
    if (roof) {
      drawCap(g, cx, yTop, a, dom, spectral);
      if (!spectral) {
        const cA = a * 2.15;
        halo = makeHalo(cA);
        halo.label = 'halo';
        halo.x = cx;
        halo.y = yTop - cA * 0.42 - 30;
      }
    } else if (!spectral) {
      g.poly([cx - a, yTop + 1, cx, yTop - 6, cx + a, yTop + 1])
        .fill({ color: dom.fill })
        .stroke({ color: ink, width: 1.5 });
    } else {
      g.poly([cx - a, yTop + 1, cx, yTop - 6, cx + a, yTop + 1])
        .stroke({ color: ink, width: 1.3, alpha: 0.8 });
    }
    const hasDoi = o.growth?.hasDoi === true;
    if (!spectral) drawSeal(g, cx - a * 0.92, gy - baseH - 2, hasDoi);
    // Published-then-refuted ghost: keep a spectral DOI seal so the faded tower
    // still matches the panel's DOI status (R7 ride-along D). A never-published
    // ghost draws no seal — nothing to transcribe.
    else if (hasDoi) drawSeal(g, cx - a * 0.92, gy - baseH - 2, true, true);
    const c = new Container();
    c.addChild(g);
    if (halo) c.addChild(halo);
    c.label = o.id;
    return c;
  }

  /**
   * The island's single biome Landmark (M4.4, M4-DESIGN §3e) — a 2–3× body
   * visual anchor, one per island, its FORM chosen purely by `o.biome` via the
   * `landmark:<code>` kind the layout layer assigns (layout.ts LANDMARK_CODE):
   * 数理 → crystal cluster, 物质 → furnace obelisk, 生命 → world-tree glasshouse,
   * 交叉 → converging bridge arches. Every dimension is fixed geometry (no per-
   * claim data to bind — the Landmark's existence/shape is itself the datum:
   * this island's domain), matching the other placeholder draws' contact-shadow
   * + ink-stroke vocabulary so it reads as part of the same island, just bigger.
   */
  private makeLandmark(o: SceneObject): Container {
    const pts = diamondPoints(o.gx, o.gy);
    const cx = (pts[0]!.x + pts[2]!.x) / 2;
    const gy = (pts[0]!.y + pts[2]!.y) / 2 - o.elevation * ELEV_STEP + 8; // front-bottom vertex
    const code = o.kind.slice('landmark:'.length);
    const g = new Graphics();
    g.ellipse(cx, gy + 4, 48, 20).fill({ color: 0x3a3024, alpha: 0.2 }); // biggest shadow on the island
    switch (code) {
      case 'foundry':
        drawFoundryLandmark(g, cx, gy);
        break;
      case 'worldtree':
        drawWorldTreeLandmark(g, cx, gy);
        break;
      case 'archhub':
        drawArchHubLandmark(g, cx, gy);
        break;
      case 'crystal':
      default:
        drawCrystalLandmark(g, cx, gy);
        break;
    }
    const c = new Container();
    c.addChild(g);
    c.label = o.id;
    return c;
  }

  /**
   * Local offset of Workshop's chimney mouth, in the SAME world/screen units
   * as the station's baked-texture ground offset (apps/web's
   * `stationAnchors.ts`: `STATION_GROUND_OFFSET.workshop = {dx:0, dy:56}`,
   * `STATION_TEX_SCALE = 150/(220*3)`). Read off `StationWorkshop`'s own SVG
   * (`packages/assets/src/stations/StationWorkshop.tsx`): the chimney+smoke
   * group sits at local `(-44,-22)` with the smoke wisp starting `~20` above
   * that, i.e. local `(-44,-42)`; `((-44,-42) − (0,56)) × STATION_TEX_SCALE`.
   * The station's baked texture is drawn WITHOUT its own static smoke wisp
   * (`showSmoke={false}` in `PixiScene`'s `STATION_ELS`) so this animated one
   * is the only smoke — never doubled, never on for a dormant station.
   */
  private static readonly SMOKE_OFFSET = { x: -10, y: -22.3 };
  /** How far (world units) a puff drifts up before looping. */
  private static readonly SMOKE_RISE = 13;

  /**
   * M8 micro-dynamics: three small rising, fading puffs above Workshop's
   * chimney — attached ONLY when {@link SceneObject.active} is true (the
   * caller already gated on `o.kind === 'station:workshop' && o.active`).
   * Desynced via phase so they don't all pulse in lockstep (M5's `variant`
   * seed precedent). Position/alpha-only per frame (no per-frame redraw),
   * matching the ghost-bob technique.
   */
  private attachSmoke(container: Container, seed: number): void {
    const { x: bx, y: by } = SceneStage.SMOKE_OFFSET;
    for (let i = 0; i < 3; i++) {
      const puff = new Graphics().circle(0, 0, 2.4).fill({ color: 0x6b6154, alpha: 0.5 });
      puff.label = 'smoke';
      puff.x = bx;
      puff.y = by;
      container.addChild(puff);
      this.smokePuffs.push({ node: puff, baseX: bx, baseY: by, phase: i / 3 + seed });
    }
  }

  /**
   * Local offset of Data Bench's flag pole top / pennant, same unit system as
   * {@link SMOKE_OFFSET}. Read off `StationDataBench`'s own SVG: the flag
   * group sits at local `(56,40)` with the pole rising to local `(56,8)` and
   * the pennant tip at `(70,13)`; offsets are relative to Data Bench's own
   * ground marker `(38,63)` (`STATION_GROUND_OFFSET.data`, `stationAnchors.ts`
   * — it has no `--shadow` ellipse, so that table uses its wall/platform
   * front vertex instead). The station's baked texture always keeps its own
   * static pole (`<line>`) but is baked with `showFlag={false}` when the
   * station is active, so only ONE pennant is ever visible: the static one
   * (dormant station) or this animated one (active) — never both.
   */
  private static readonly FLAG_POLE_TOP = { x: 4.1, y: -12.5 };
  private static readonly FLAG_PENNANT_TIP = { x: 3.2, y: 1.1 }; // relative to the pole top

  /**
   * M8 micro-dynamics: the Data Bench pennant leans on a gentle sine — wind,
   * not decoration, because it only exists while the station is
   * {@link SceneObject.active}. A separate sub-container pinned at the pole
   * top so `skew.x` shears only the fabric, never the rigid pole.
   *
   * Honest caveat (see `core.projectActiveStations`'s own doc): the protocol
   * has no dedicated ledger verb yet for adding a dataset ref, so `data`
   * never actually appears in `activeStations` from a real island today —
   * this is correctly wired, forward-compatible, and NOT decorative; it
   * simply won't be observed animating until that verb exists.
   */
  private attachFlag(container: Container, seed: number): void {
    const pole = SceneStage.FLAG_POLE_TOP;
    const tip = SceneStage.FLAG_PENNANT_TIP;
    const pennant = new Container();
    pennant.label = 'flag';
    pennant.x = pole.x;
    pennant.y = pole.y;
    const g = new Graphics()
      .poly([0, 0, tip.x, tip.y * 0.5, 0, tip.y])
      .fill({ color: 0xe3a93c, alpha: 0.9 })
      .stroke({ color: 0x3a342b, width: 0.5 });
    pennant.addChild(g);
    container.addChild(pennant);
    this.flagPennants.push({ node: pennant, phase: seed * 6.283 });
  }

  /**
   * Build the island's ground as ONE continuous organic surface (generator-quality
   * P1 — docs/scene-upgrade/GENERATOR-QUALITY.md). Replaces the per-tile iso-diamond
   * bed, which read as a stepped voxel plateau with a ragged diamond coastline. The
   * tile DATA is unchanged (hit-test/height semantics stay in the layout layer);
   * only the RENDER changes:
   *
   *  - Coastline: the outer boundary of the tile union is traced ({@link
   *    terrainBoundaryLoops}) then Chaikin-smoothed ({@link chaikinClosed}) into a
   *    soft closed curve — a hand-drawn mound edge, not a sawtooth of tile corners.
   *  - Elevation: each raised level (≥1, ≥2) is its OWN smoothed plateau lifted by
   *    ELEV_STEP, with a soft shaded skirt + a thin contour line, so height reads as
   *    rolling terraces / topographic contours, never a hard per-tile cliff step.
   *  - Shore + fingerprint: a warm sand band strokes the coast; the per-tile
   *    lightness jitter (`o.tint`, invariant 13) survives as a seam-free interior
   *    mottle so the bed still "breathes" like hand-drawn paper.
   *
   * Baked to one texture by {@link recacheTerrain}, so the extra sub-shapes cost
   * nothing per frame.
   */
  private buildGround(graph: SceneGraph): void {
    const terrain = graph.objects.filter((o) => o.layer === 'terrain');
    if (terrain.length === 0) return;

    // Occupancy + per-tile lookup; the island's biome = its commonest terrain biome.
    const occ = new Set<string>();
    const cell = new Map<string, SceneObject>();
    const biomeCount = new Map<string, number>();
    let maxElev = 0;
    for (const o of terrain) {
      const k = `${o.gx},${o.gy}`;
      occ.add(k);
      cell.set(k, o);
      biomeCount.set(o.biome, (biomeCount.get(o.biome) ?? 0) + 1);
      if (o.elevation > maxElev) maxElev = o.elevation;
    }
    let biome = terrain[0]!.biome;
    let best = -1;
    for (const [b, n] of biomeCount) if (n > best) { best = n; biome = b; }

    const g = new Graphics();
    const ink = 0x9a8c6a;

    // ── level 0: the whole island. Smooth coast, mound skirt, sand shore band. ──
    const baseColor = groundTint(biome, 0);
    for (const loop of terrainBoundaryLoops(occ)) {
      const scr = chaikinClosed(loop.map(([x, y]) => worldToScreen(x, y)), 3);
      const flat = flattenLoop(scr, 0);
      // Mound thickness: a short skirt below the coast so the island reads as a
      // raised landmass over the sea (matching the L0 chart mounds).
      g.poly(skirtBand(scr, 0, 7)).fill({ color: shade(baseColor, -0.22) });
      g.poly(flat).fill({ color: baseColor });
      // Warm sand shore band + a faint foam/ink coast line for a defined edge.
      g.poly(flat).stroke({ color: SHORE_SAND, width: 13, alpha: 0.5 });
      g.poly(flat).stroke({ color: ink, width: 1.4, alpha: 0.5 });
    }

    // ── raised levels: smoothed plateaus, soft skirt + contour (no hard steps). ──
    for (let L = 1; L <= maxElev; L++) {
      const sub = new Set<string>();
      for (const k of occ) if ((cell.get(k)!.elevation ?? 0) >= L) sub.add(k);
      if (sub.size === 0) continue;
      const lift = L * ELEV_STEP;
      const top = groundTint(biome, L);
      for (const loop of terrainBoundaryLoops(sub)) {
        const scr = chaikinClosed(loop.map(([x, y]) => worldToScreen(x, y)), 3);
        // Skirt from this level down to the one below — ONE smooth band per level,
        // following the organic outline, not a per-tile zigzag of cliff faces.
        g.poly(skirtBand(scr, lift, ELEV_STEP)).fill({ color: shade(top, -0.16) });
        g.poly(flattenLoop(scr, lift)).fill({ color: top });
        g.poly(flattenLoop(scr, lift)).stroke({ color: ink, width: 1, alpha: 0.35 });
      }
    }

    // ── fingerprint: seam-free paper mottle on INTERIOR tiles only (all four grid
    //    neighbours present → safely inside the smoothed coast, so no spill). ──
    const has = (x: number, y: number): boolean => occ.has(`${x},${y}`);
    for (const o of terrain) {
      if (!o.tint) continue;
      if (!(has(o.gx - 1, o.gy) && has(o.gx + 1, o.gy) && has(o.gx, o.gy - 1) && has(o.gx, o.gy + 1))) continue;
      const lift = o.elevation * ELEV_STEP;
      const poly: number[] = [];
      for (const p of diamondPoints(o.gx, o.gy)) poly.push(p.x, p.y - lift);
      g.poly(poly).fill({ color: shade(groundTint(biome, o.elevation), o.tint), alpha: 0.3 });
    }

    g.label = 'ground';
    this.terrainRoot.addChild(g);
  }

  /**
   * Render a full scene graph. Clears the previous frame, dispatches every object
   * to its layer with `zIndex = depthKey` and `alpha = visibilityAt(o, t)`, caches
   * the static terrain bed, then culls to the viewport. The renderer computes no
   * layout — it consumes the graph verbatim (P2).
   */
  render(graph: SceneGraph, resolve?: TextureResolver): void {
    this.clearNodes();
    this.buildGround(graph); // unified organic terrain (replaces per-tile diamonds)
    this.buildDesirePaths(graph); // terrain-cached civic circulation / exploration clues
    for (const o of graph.objects) {
      // Terrain is rendered as ONE continuous surface by buildGround, not per tile.
      if (o.layer === 'terrain') continue;
      const node = this.makeNode(o, resolve);
      node.zIndex = o.depthKey;
      node.alpha = visibilityAt(o, graph.t);
      // Interactive world nodes (stations + claims) are tappable → onPick(id).
      // Bounding-box hit is fine here; Pixi resolves overlaps by paint order (the
      // frontmost, i.e. higher depthKey, wins). Terrain/scenery/ghosts stay inert.
      if (o.layer === 'world' && (o.kind.startsWith('station:') || o.kind === 'claim')) {
        node.eventMode = 'static';
        node.cursor = 'pointer';
        // Baked textures include transparent margins. A building-sized hit area
        // keeps neighbouring stations from stealing one another's taps.
        node.hitArea = o.kind.startsWith('station:')
          ? new Rectangle(-54, -92, 108, 108)
          : new Rectangle(-25, -(o.height ?? 30) - 16, 50, (o.height ?? 30) + 28);
        node
          .on('pointerover', () => { node.scale.set(1.035); this.redraw(); })
          .on('pointerout', () => { node.scale.set(1); this.redraw(); })
          .on('pointerdown', () => { node.scale.set(0.985); this.redraw(); })
          .on('pointerup', () => { node.scale.set(1.035); this.redraw(); })
          // pointertap (not pointerup): requires press+release on the same target,
          // so releasing a camera-pan over a building doesn't open its drawer.
          .on('pointertap', () => this.onPick?.(o.id))
          .on('pointerupoutside', () => { node.scale.set(1); this.redraw(); });
      }
      // Register M5 animatable nodes (data-bound): refuted/returned ghosts bob,
      // consensus halos breathe. Registries are rebuilt each render (clearNodes resets).
      const isGhost = (o.kind === 'claim' && o.dayVisibility === 0) || o.kind.startsWith('ghost:');
      if (isGhost) this.ghostNodes.push({ node, baseY: node.y, phase: (o.variant ?? 0) * 6.283 });
      if (o.kind === 'claim') {
        const halo = node.getChildByLabel('halo');
        if (halo) this.haloNodes.push(halo);
      }
      // M8 micro-dynamics second batch: chimney smoke / flag wave, gated on
      // SceneObject.active (core.projectActiveStations) — never for a dormant
      // station, never a decorative always-on loop.
      if (o.kind === 'station:workshop' && o.active) this.attachSmoke(node, o.variant ?? 0);
      if (o.kind === 'station:data' && o.active) this.attachFlag(node, o.variant ?? 0);
      this.layerFor(o.layer).addChild(node);
      this.nodes.set(o.id, node);
      this.objects.set(o.id, o);
      this.index.add(o);
    }
    this.buildLights(graph);
    this.buildFireflies(graph); // after buildLights (which clears lightsLayer)
    this.buildToneOverlay();
    this.applyToneAndLights(graph.t);
    this.curT = graph.t;
    this.ensureDynamicsTicker(); // M5: micro-dynamics ride the render loop
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

  /**
   * M8 micro-dynamics (second batch): a few fireflies hovering over each ACTIVE
   * station (SceneObject.active ← core.projectActiveStations). Data-bound — motes
   * appear only where recent ledger activity says "someone is at work," never a
   * decorative default. They live in {@link lightsLayer} so they inherit the night
   * gate (the layer's alpha is `nightLights(t)`), and ride the shared dynamics
   * ticker (no second loop). Count 3–6 per station, deterministic from the object's
   * `variant` seed. Rebuilt every render because buildLights clears lightsLayer.
   */
  private buildFireflies(graph: SceneGraph): void {
    this.fireflyParticles = [];
    this.fireflyContainer = undefined;
    if (!this.app) return;
    const actives = graph.objects.filter((o) => o.kind.startsWith('station:') && o.active);
    if (actives.length === 0) return;

    // One tiny warm glow texture, generated once and reused for every particle.
    if (!this.fireflyTexture) {
      const dot = new Graphics().circle(0, 0, 3).fill({ color: 0xffe6b0 });
      this.fireflyTexture = this.app.renderer.generateTexture(dot);
      dot.destroy();
    }
    const container = new ParticleContainer({ dynamicProperties: { position: true, alpha: true } });
    container.label = 'fireflies';

    for (const o of actives) {
      const p = worldToScreenElevated(o.gx + 0.5, o.gy + 0.5, o.elevation);
      const h = o.height ?? 30;
      const seed = o.variant ?? 0;
      const n = 3 + Math.floor(seed * 4); // 3..6, deterministic per station
      for (let i = 0; i < n; i++) {
        const a = (seed + i / n) * 6.283;
        const r = 10 + ((seed * 97 + i * 31) % 10); // 10..20px cluster radius
        const cx = p.x + Math.cos(a) * r;
        const cy = p.y - h * 0.5 - Math.abs(Math.sin(a)) * 10; // hover around mid-height
        const part = new Particle({ texture: this.fireflyTexture, x: cx, y: cy, anchorX: 0.5, anchorY: 0.5, tint: 0xffe6b0, alpha: 0 });
        container.addParticle(part);
        this.fireflyParticles.push({ p: part, cx, cy, ampX: 4 + (i % 3), ampY: 3 + (i % 2), phase: a });
      }
    }
    this.lightsLayer.addChild(container);
    this.fireflyContainer = container;
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

  /** Apply the day↔night mix (per-object alpha + tone + lights) WITHOUT a redraw. */
  private applyDayNight(t: number): void {
    this.curT = t;
    for (const [id, node] of this.nodes) {
      const o = this.objects.get(id);
      if (o) node.alpha = visibilityAt(o, t);
    }
    this.applyToneAndLights(t);
  }

  /**
   * Update only the day↔night mix without rebuilding the scene — the per-object
   * visibility path (P4). Alpha interpolates `dayVisibility → nightVisibility`.
   * Instant (no tween); {@link tweenDayNight} is the animated lever path (M5).
   */
  setDayNight(t: number): void {
    this.tweeningT = false; // an explicit set cancels any in-flight tween
    this.applyDayNight(t);
    this.redraw();
  }

  /**
   * Ease the day↔night value toward `target` over ~0.7s instead of snapping (M5).
   * The lever becomes a smooth dawn/dusk sweep — the tone veil, window lights and
   * ghost fade all cross-fade together. Rides the dynamics ticker; falls back to an
   * instant set if the app (hence ticker) isn't up yet.
   */
  tweenDayNight(target: number): void {
    this.targetT = Math.max(0, Math.min(1, target));
    if (!this.app) {
      this.applyDayNight(this.targetT);
      return;
    }
    // Reduced-motion gates only CONTINUOUS animation; a DISCRETE lever change must
    // still apply. The dynamics ticker that eases the tween is disabled here, so
    // curT would never advance and the day↔night flip would silently no-op (BUG A).
    // Snap to the target and paint one frame.
    if (this.reducedMotion) {
      this.applyDayNight(this.targetT);
      this.app.render();
      return;
    }
    this.tweeningT = true;
    this.ensureDynamicsTicker();
  }

  /**
   * Set the crisp, LOD-tiered station labels. Each spec is a station's tile +
   * height + two text tiers (`short` = single-glyph seal, `full` = name). Labels
   * billboard in screen space at a CONSTANT size, so they read at any zoom —
   * unlike the baked raster namecards, which the layout layer now suppresses.
   * Call after {@link render}. Content (P2) is passed in; the stage only lays out.
   */
  setStationLabels(specs: Array<{ id: string; gx: number; gy: number; elevation: number; height: number; short: string; full: string }>): void {
    this.labelLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
    this.labelSpecs = specs.map((s) => {
      const group = new Container();
      group.eventMode = 'static';
      group.cursor = 'pointer';
      const bg = new Graphics();
      const text = new Text({
        text: s.full,
        style: new TextStyle({ fontFamily: "'Noto Serif SC', 'PingFang SC', serif", fontSize: 13, fontWeight: '600', fill: 0x2b2620, align: 'center' }),
        resolution: 2,
      });
      text.anchor.set(0.5, 0.5);
      group.addChild(bg, text);
      group
        .on('pointerover', () => { group.scale.set(1.045); this.redraw(); })
        .on('pointerout', () => { group.scale.set(1); this.redraw(); })
        // pointertap, same rationale as the building nodes above.
        .on('pointertap', () => this.onPick?.(s.id));
      this.labelLayer.addChild(group);
      return { ...s, group, text, bg, showing: '' };
    });
    this.layoutLabels();
  }

  /** Reposition + LOD-swap station labels for the current camera (screen-space billboards). */
  private layoutLabels(): void {
    if (!this.app || this.labelSpecs.length === 0) return;
    const scale = this.cameraRoot.scale.x || 1;
    const full = scale >= 0.5; // LOD: far zoom → seal glyph, near → full name
    const view = this.app.screen;
    for (const L of this.labelSpecs) {
      const want = full ? L.full : L.short;
      if (want !== L.showing) {
        L.text.text = want;
        L.showing = want;
        const halfW = L.text.width / 2 + 7;
        const halfH = L.text.height / 2 + 3;
        L.bg.clear();
        L.bg.roundRect(-halfW, -halfH, halfW * 2, halfH * 2, 5).fill({ color: 0xfaf5e8, alpha: 0.92 }).stroke({ color: 0x3a342b, width: 1 });
        // Labels billboard on the topmost uiLayer, so an oversized hit box steals
        // taps meant for buildings beneath at far zoom. Keep a touch-friendly
        // minimum but hug the rendered card instead of a fixed 44px band.
        L.group.hitArea = new Rectangle(-Math.max(22, halfW), -Math.max(14, halfH), Math.max(44, halfW * 2), Math.max(28, halfH * 2));
      }
      const w = worldToScreenElevated(L.gx + 0.5, L.gy + 0.5, L.elevation);
      const sx = w.x * scale + this.cameraRoot.x;
      const sy = (w.y - (L.height + 46)) * scale + this.cameraRoot.y;
      L.group.x = Math.round(sx);
      L.group.y = Math.round(sy);
      L.group.visible = sx > -100 && sx < view.width + 100 && sy > -50 && sy < view.height + 50;
    }
  }

  /**
   * Build the animated water plane (M2) in the sea layer. Renders the static
   * terrain silhouette to a coastline mask (land = alpha 1) so the shader can
   * paint a shore-foam band, then starts a ticker that advances the wave time —
   * the only animated content, so the rest of the static scene rides along cheaply.
   * Call after {@link render} (needs the terrain in place).
   */
  buildSea(colors: SeaColors, opts: { margin?: number; depthAlpha?: number; tide?: number } = {}): void {
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
    const { mesh, shader } = createSeaMesh({ rect, maskRect, mask, ...colors, depthAlpha: opts.depthAlpha, tide: opts.tide });

    this.seaMask?.destroy(true);
    this.seaLayer.removeChildren().forEach((c) => c.destroy());
    this.seaLayer.addChild(mesh);
    this.seaShader = shader;
    this.seaMask = mask;
    // Persist agitation across sea rebuilds (boot/replay): the fresh shader inits
    // uAgitation to 0, so re-seed it from the stored magnitude — otherwise a
    // preloaded disputed island renders calm while the panel reports N refuted (BUG).
    const au = shader.resources.waveUniforms?.uniforms as { uAgitation: number } | undefined;
    if (au) au.uAgitation = this.agitation;

    if (this.reducedMotion) {
      // a11y (R7 ride-along C): no continuous wave ticker — paint ONE static frame
      // so the sea (and a static, still-readable agitation at uTime 0) shows without
      // animating. prefers-reduced-motion must reach the canvas, not just CSS.
      this.app.render();
    } else if (!this.seaAnimating) {
      this.app.ticker.add(this.tickSea);
      this.app.start(); // resume the render loop (init used autoStart:false)
      this.seaAnimating = true;
    }
  }

  /**
   * prefers-reduced-motion for the WebGL surface (R7 ride-along C). CSS's
   * reduced-motion kill switch never reaches the Pixi ticker, so the host wires
   * this. ON drops the continuous sea/dynamics tickers and paints one static,
   * still-readable frame; OFF re-arms the sea wave. Idempotent.
   */
  setReducedMotion(on: boolean): void {
    if (this.reducedMotion === on) return;
    this.reducedMotion = on;
    if (!this.app) return;
    if (on) {
      if (this.seaAnimating) {
        this.app.ticker.remove(this.tickSea);
        this.seaAnimating = false;
      }
      if (this.dynAnimating) {
        this.app.ticker.remove(this.tickDynamics);
        this.dynAnimating = false;
      }
      this.app.render(); // one static frame in the frozen state
    } else {
      // Thaw SYMMETRICALLY: re-arm BOTH the sea wave and the micro-dynamics ticker.
      // Freezing removed both; restoring only the sea left dynamics dead until the
      // next rebuild. ensureDynamicsTicker re-adds tickDynamics (reducedMotion is
      // now false) and resumes the loop.
      if (this.seaShader && !this.seaAnimating) {
        this.app.ticker.add(this.tickSea);
        this.seaAnimating = true;
      }
      this.ensureDynamicsTicker();
      this.app.start();
    }
  }

  /**
   * Set the disputed-sea agitation (R7 Dim 2). Accepts a boolean (dev toggle) OR a
   * 0..1 contention magnitude (海即数据: this island's ever-refuted intensity — a
   * refute is one-way, no resolution verb exists yet, see R7). The DATA is still
   * "contention"; `agitation` is its surface-chop VISUAL. The value is stored so a
   * later sea rebuild (buildSea) restores it.
   */
  setAgitation(on: boolean | number): void {
    this.agitation = typeof on === 'number' ? Math.max(0, Math.min(1, on)) : on ? 1 : 0;
    const u = this.seaShader?.resources.waveUniforms?.uniforms as { uAgitation: number } | undefined;
    if (u) u.uAgitation = this.agitation;
    // Discrete state change under reduced-motion: no continuous ticker is running,
    // so paint one frame or the disputed sea would never update (BUG B).
    if (this.reducedMotion) this.app?.render();
  }

  /** Advance the wave clock each frame; app.start() auto-renders after. */
  private tickSea = (ticker: Ticker): void => {
    const u = this.seaShader?.resources.waveUniforms?.uniforms as { uTime: number } | undefined;
    if (u) u.uTime += ticker.deltaTime * 0.02;
  };

  /** Register the M5 micro-dynamics ticker once (and resume the render loop). */
  private ensureDynamicsTicker(): void {
    if (this.dynAnimating || !this.app) return;
    // a11y (R7 ride-along C): under prefers-reduced-motion the micro-dynamics stay
    // frozen at their rest frame (already painted by the scene render) — never add
    // the per-frame ticker.
    if (this.reducedMotion) return;
    this.app.ticker.add(this.tickDynamics);
    this.app.start(); // init used autoStart:false; the ticker drives frames now
    this.dynAnimating = true;
  }

  /**
   * M5 micro-dynamics — one per-frame pass over the registered animatable nodes.
   * Everything here is subtle and, where it isn't pure ambiance, data-bound (P1):
   *  - day↔night tween: ease curT → targetT so the lever sweeps (not snaps).
   *  - window twinkle: each night light breathes its own alpha within the group
   *    (organic desync via index phase); only when the group is lit (perf gate).
   *  - ghost bob: refuted/returned claims drift vertically — bound to their state.
   *  - halo breathe: the gamboge consensus ring pulses — bound to consensus (only
   *    a roofed claim has one).
   */
  private tickDynamics = (ticker: Ticker): void => {
    this.elapsed += ticker.deltaTime;
    const e = this.elapsed;

    if (this.tweeningT) {
      const d = this.targetT - this.curT;
      if (Math.abs(d) < 0.004) {
        this.applyDayNight(this.targetT);
        this.tweeningT = false;
      } else {
        this.applyDayNight(this.curT + d * Math.min(1, ticker.deltaTime * 0.12));
      }
    }

    if (this.lightsLayer.alpha > 0.01) {
      const kids = this.lightsLayer.children;
      for (let i = 0; i < kids.length; i++) {
        // The firefly ParticleContainer manages its own per-particle alpha (below);
        // leave its group alpha at 1 so the window-light twinkle doesn't fight it.
        if (kids[i] === this.fireflyContainer) continue;
        kids[i]!.alpha = 0.72 + 0.28 * Math.sin(e * 0.05 + i * 1.7);
      }
    }

    for (const gh of this.ghostNodes) {
      gh.node.y = gh.baseY + Math.sin(e * 0.035 + gh.phase) * 3;
    }

    for (const h of this.haloNodes) {
      const s = 1 + 0.08 * Math.sin(e * 0.04);
      h.scale.set(s);
      h.alpha = 0.72 + 0.28 * (0.5 + 0.5 * Math.sin(e * 0.04));
    }

    // M8: chimney smoke — a puff rises and fades in a loop, then resets to the
    // chimney mouth (position/alpha only, no per-frame redraw, per M5 precedent).
    for (const p of this.smokePuffs) {
      const cycle = (((e * 0.006 + p.phase) % 1) + 1) % 1;
      p.node.y = p.baseY - cycle * SceneStage.SMOKE_RISE;
      p.node.x = p.baseX + Math.sin(cycle * Math.PI * 2) * 1.4;
      p.node.alpha = 0.5 * (1 - cycle);
    }

    // M8: flag pennant leans on a gentle sine — the fabric only, since the
    // sub-container is pinned at the pole top (skew.x shears in place).
    for (const f of this.flagPennants) {
      f.node.skew.x = Math.sin(e * 0.045 + f.phase) * 0.3;
    }

    // M8: night fireflies drift on a slow lissajous and breathe their alpha —
    // only while the night lights are up (same perf gate as the twinkle above),
    // so they cost nothing by day.
    if (this.fireflyParticles.length > 0 && this.lightsLayer.alpha > 0.01) {
      for (const f of this.fireflyParticles) {
        f.p.x = f.cx + Math.sin(e * 0.03 + f.phase) * f.ampX;
        f.p.y = f.cy + Math.cos(e * 0.041 + f.phase * 1.3) * f.ampY;
        f.p.alpha = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(e * 0.06 + f.phase * 2.0));
      }
    }
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
    // The unified ground (buildGround) is a terrainRoot child, not a this.nodes
    // entry, so it must be freed here explicitly before the next frame rebuilds it.
    this.terrainRoot.removeChildren().forEach((c) => c.destroy({ children: true }));
    for (const [id, node] of this.nodes) {
      node.parent?.removeChild(node);
      node.destroy({ children: true });
      this.index.remove(id);
    }
    this.lightsLayer.removeChildren().forEach((c) => c.destroy());
    this.nodes.clear();
    this.objects.clear();
    this.ghostNodes = []; // M5/M8 registries point at nodes we just destroyed
    this.haloNodes = [];
    this.smokePuffs = [];
    this.flagPennants = [];
    this.fireflyParticles = []; // container is a lightsLayer child (buildLights destroys it)
    this.fireflyContainer = undefined;
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
    this.layoutLabels(); // labels are screen-space → follow the camera + re-LOD on zoom
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
    this.fireflyTexture?.destroy(true);
    this.fireflyTexture = undefined;
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
 * Trace the boundary loop(s) of a set of occupied unit tiles, in grid space. An
 * edge belongs to the boundary iff the tile across it is empty; edges are emitted
 * with a consistent winding (interior on one side) so shared edges of two occupied
 * tiles cancel and the remaining boundary edges chain end-to-start into closed
 * loops. Diagonal-only pinch points (rare for island blobs) are approximated.
 */
function terrainBoundaryLoops(tiles: Set<string>): Array<Array<[number, number]>> {
  const has = (x: number, y: number): boolean => tiles.has(`${x},${y}`);
  const next = new Map<string, [number, number]>();
  for (const key of tiles) {
    const [x, y] = key.split(',').map(Number) as [number, number];
    if (!has(x, y - 1)) next.set(`${x},${y}`, [x + 1, y]); // top edge
    if (!has(x + 1, y)) next.set(`${x + 1},${y}`, [x + 1, y + 1]); // right edge
    if (!has(x, y + 1)) next.set(`${x + 1},${y + 1}`, [x, y + 1]); // bottom edge
    if (!has(x - 1, y)) next.set(`${x},${y + 1}`, [x, y]); // left edge
  }
  const loops: Array<Array<[number, number]>> = [];
  const used = new Set<string>();
  for (const start of next.keys()) {
    if (used.has(start)) continue;
    const loop: Array<[number, number]> = [];
    let cur = start;
    while (next.has(cur) && !used.has(cur)) {
      used.add(cur);
      const [cx, cy] = cur.split(',').map(Number) as [number, number];
      loop.push([cx, cy]);
      const [ex, ey] = next.get(cur)!;
      cur = `${ex},${ey}`;
    }
    if (loop.length >= 3) loops.push(loop);
  }
  return loops;
}

/**
 * Closed-loop Chaikin corner-cutting, `iters` passes — rounds a jagged tile
 * silhouette into a smooth organic coast/plateau outline.
 */
function chaikinClosed(pts: ScreenPoint[], iters: number): ScreenPoint[] {
  let p = pts;
  for (let k = 0; k < iters && p.length >= 3; k++) {
    const q: ScreenPoint[] = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i]!;
      const b = p[(i + 1) % p.length]!;
      q.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
      q.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
    }
    p = q;
  }
  return p;
}

/** Flatten a screen-space loop to a Pixi poly array, lifted up the screen by `lift`. */
function flattenLoop(pts: ScreenPoint[], lift: number): number[] {
  const out: number[] = [];
  for (const p of pts) out.push(p.x, p.y - lift);
  return out;
}

/** A vertical skirt band under a loop: the outline at `lift`, dropped by `drop` px. */
function skirtBand(pts: ScreenPoint[], lift: number, drop: number): number[] {
  const out: number[] = [];
  for (const p of pts) out.push(p.x, p.y - lift);
  for (let i = pts.length - 1; i >= 0; i--) out.push(pts[i]!.x, pts[i]!.y - lift + drop);
  return out;
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
 * One iso prism storey of a claim tower (variant A). `(cx, gy)` is the front-bottom
 * vertex; `a` = footprint half-width, `H` = wall height. Left/right/top faces, ink
 * outline. Ported verbatim from the Claude Design handoff's `story()`.
 */
function drawStory(
  g: Graphics,
  cx: number,
  gy: number,
  a: number,
  H: number,
  wall: number,
  sh: number,
  top: number,
  ink: number,
  sw: number,
  alpha: number,
): void {
  const hh = a / 2;
  g.poly([cx - a, gy - hh - H, cx, gy - H, cx, gy, cx - a, gy - hh]).fill({ color: wall, alpha }).stroke({ color: ink, width: sw, alpha: 0.9 });
  g.poly([cx + a, gy - hh - H, cx, gy - H, cx, gy, cx + a, gy - hh]).fill({ color: sh, alpha }).stroke({ color: ink, width: sw, alpha: 0.9 });
  g.poly([cx, gy - a - H, cx + a, gy - hh - H, cx, gy - H, cx - a, gy - hh - H]).fill({ color: top, alpha }).stroke({ color: ink, width: sw, alpha: 0.9 });
}

/** Domain fill + ink for a claim tower — verbatim DOMAIN_COLORS (no new hues). */
function claimDomain(biome: string): { fill: number; ink: number } {
  switch (biome) {
    case '数理':
      return { fill: 0xc9d8e6, ink: 0x2e5e8c };
    case '物质':
      return { fill: 0xe8cfae, ink: 0xb5673a };
    case '生命':
      return { fill: 0xc6decc, ink: 0x2b7a5f };
    case '交叉':
      return { fill: 0xecdfb4, ink: 0xa08428 };
    default:
      return { fill: 0xc9d8e6, ink: 0x2e5e8c };
  }
}

/**
 * Consensus cap (floors≥5): a broad domain canopy with a double eave, a domain-ink
 * crest, and a radiant gamboge halo that reads at distance. Ported from the design's
 * `cap()`. Spectral variant is a translucent dashed-feel canopy (ghost consensus).
 */
function drawCap(g: Graphics, cx: number, cyTop: number, a: number, dom: { fill: number; ink: number }, spectral: boolean): void {
  const cA = a * 2.15;
  const cH = cA * 0.42;
  const st = spectral ? 0xc9d7f2 : 0x3a342b;
  // under-eave shade band
  g.poly([cx - cA, cyTop, cx, cyTop + cH * 0.55, cx + cA, cyTop, cx, cyTop + cH * 0.55 + 7]).fill({ color: 0x3a3024, alpha: 0.18 });
  if (spectral) {
    g.poly([cx, cyTop - cH - 6, cx + cA, cyTop, cx, cyTop + cH * 0.55, cx - cA, cyTop]).fill({ color: 0xc9d7f2, alpha: 0.16 }).stroke({ color: st, width: 1.4 });
    return;
  }
  // main canopy
  g.poly([cx, cyTop - cH - 6, cx + cA, cyTop, cx, cyTop + cH * 0.55, cx - cA, cyTop]).fill({ color: dom.fill }).stroke({ color: st, width: 2.4 });
  // ridge + domain-ink crest
  g.moveTo(cx - cA, cyTop).lineTo(cx + cA, cyTop).stroke({ color: st, width: 1, alpha: 0.5 });
  g.poly([cx, cyTop - cH - 6, cx + cA * 0.5, cyTop - cH * 0.5 - 3, cx, cyTop - cH * 0.5, cx - cA * 0.5, cyTop - cH * 0.5 - 3]).fill({ color: dom.ink }).stroke({ color: 0x3a342b, width: 1.4 });
  // The radiant consensus halo is a SEPARATE node (see makeClaimMark) so M5 can
  // breathe it; drawCap no longer paints it into the shared claim Graphics.
}

/** The gamboge consensus halo (领域共识 beacon), centred at local origin so it can be scaled to breathe (M5). */
function makeHalo(cA: number): Graphics {
  const g = new Graphics();
  g.circle(0, 0, cA * 0.62).stroke({ color: 0xe3a93c, width: 2.2, alpha: 0.7 });
  g.circle(0, 0, 4.5).fill({ color: 0xe3a93c }).stroke({ color: 0x3a342b, width: 1 });
  return g;
}

/**
 * DOI seal (published) vs preprint open-mark. Ported from the design's `seal()`.
 * `spectral` renders the ghost-tower variant (R7 ride-along D): a published-then-
 * refuted claim keeps a faded, stroke-only seal so the mark still agrees with the
 * detail panel's DOI status (seal↔panel parity) instead of silently dropping it.
 */
function drawSeal(g: Graphics, x: number, y: number, doi: boolean, spectral = false): void {
  if (spectral) {
    // Ghost aesthetic: no solid fill, spectral-blue strokes at low alpha. A DOI
    // ghost gets the double ring (published), a preprint ghost a single ring.
    g.circle(x, y, 8.5).stroke({ color: 0xc9d7f2, width: 1.2, alpha: doi ? 0.6 : 0.45 });
    if (doi) g.circle(x, y, 5).stroke({ color: 0xc9d7f2, width: 1, alpha: 0.42 });
    return;
  }
  if (doi) {
    g.circle(x, y, 8.5).fill({ color: DOI_SEAL_INK }).stroke({ color: 0x3a342b, width: 1 });
    g.circle(x, y, 5).stroke({ color: 0xfbf6e9, width: 1, alpha: 0.7 });
  } else {
    g.circle(x, y, 8.5).stroke({ color: 0x6b6154, width: 1.3, alpha: 0.8 });
  }
}

// ─── M4.4 Landmark draw functions — one 2–3× body per biome ─────────────────
// Every shape is anchored at (cx, gy) = the tile's front-bottom vertex (same
// convention as makeClaimMark/drawIsoBox), so it plants correctly on elevated
// terrain. No claim/ledger data to bind here (§3e): the Landmark's shape IS the
// datum (this island's domain), so geometry is fixed, not parameterised by growth.

/** Sample a semicircular arch/dome as a poly path — avoids Graphics.arcTo's
 * rounded-corner semantics, which don't guarantee a clean dome through 3 points. */
function archPoints(cx: number, gy: number, w: number, h: number, steps = 12): number[] {
  const pts: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = Math.PI * (i / steps);
    pts.push(cx - w * Math.cos(a), gy - h * Math.sin(a));
  }
  return pts;
}

/** 数理 Landmark — 巨型几何晶体 (a faceted crystal spike cluster), pale blue-white. */
function drawCrystalLandmark(g: Graphics, cx: number, gy: number): void {
  const ink = 0x2e5e8c;
  const spikes: Array<[number, number, number]> = [
    [-30, 40, 11],
    [-10, 72, 14],
    [10, 90, 16], // the tallest, central spike — the island's tallest point
    [28, 54, 12],
    [42, 32, 9],
  ];
  for (const [dx, h, w] of spikes) {
    const bx = cx + dx;
    const lit = dx >= 10; // the central/right facets read brighter (facing the viewer)
    g.poly([bx - w, gy, bx, gy - h, bx + w, gy])
      .fill({ color: lit ? 0xe4edf5 : 0xaecbdd })
      .stroke({ color: ink, width: 1.6 });
    g.poly([bx, gy - h, bx + w * 0.55, gy - h * 0.5, bx, gy]).fill({ color: lit ? 0xc9d8e6 : 0x8fb0c8, alpha: 0.85 });
  }
}

/** 物质 Landmark — 不熄熔炉尖塔 (an ever-lit furnace obelisk), dark stone + ember mouth. */
function drawFoundryLandmark(g: Graphics, cx: number, gy: number): void {
  const ink = 0x3a2418;
  const H = 92;
  const wB = 22;
  const wT = 9;
  g.poly([cx - wB, gy, cx - wT, gy - H, cx + wT, gy - H, cx + wB, gy]).fill({ color: 0x6b4a34 }).stroke({ color: ink, width: 2 });
  g.poly([cx - wB, gy, cx - wT, gy - H, cx, gy - H * 0.98, cx, gy]).fill({ color: 0x54382a, alpha: 0.45 }); // shade the left face
  // ever-burning furnace mouth (a fixed emissive mark — night-window logic in
  // buildLights already lights this building's top separately; this is the day mark).
  g.ellipse(cx, gy - H * 0.24, 8, 11).fill({ color: 0xe3672a });
  g.ellipse(cx, gy - H * 0.24, 4.5, 6).fill({ color: 0xffcf7a });
  g.rect(cx - wT * 0.8, gy - H - 1, wT * 1.6, 8).fill({ color: 0x3a2418 }); // crown
}

/** 生命 Landmark — 世界树温室 (a canopy tree inside a glasshouse dome), verdant. */
function drawWorldTreeLandmark(g: Graphics, cx: number, gy: number): void {
  const ink = 0x2b7a5f;
  // glasshouse dome — translucent, drawn first so the trunk/canopy read through it.
  g.poly(archPoints(cx, gy - 6, 42, 46)).stroke({ color: ink, width: 1.4, alpha: 0.55 });
  g.ellipse(cx, gy - 6, 42, 15).fill({ color: 0xdcefe0, alpha: 0.22 }).stroke({ color: ink, width: 1.2, alpha: 0.4 });
  // trunk
  g.poly([cx - 6, gy, cx - 3, gy - 46, cx + 3, gy - 46, cx + 6, gy]).fill({ color: 0x6b4a2e }).stroke({ color: 0x3a2418, width: 1.4 });
  // canopy — three overlapping lobes for a full silhouette
  g.circle(cx - 16, gy - 58, 20).fill({ color: 0x3e9b7e });
  g.circle(cx + 16, gy - 60, 22).fill({ color: 0x2f8468 });
  g.circle(cx, gy - 76, 24).fill({ color: 0x4bb08c }).stroke({ color: ink, width: 1.6 });
}

/** 交叉 Landmark — 桥拱枢纽 (several bridge arches converging on a hub deck). */
function drawArchHubLandmark(g: Graphics, cx: number, gy: number): void {
  const ink = 0xa08428;
  const stone = 0xecdfb4;
  const arches: Array<[number, number]> = [
    [-46, 0.9],
    [0, 1],
    [42, 0.85],
  ];
  for (const [dx, s] of arches) {
    const bx = cx + dx * 0.55;
    const w = 40 * s;
    const h = 56 * s;
    g.poly(archPoints(bx, gy, w, h)).stroke({ color: stone, width: 9, alpha: 0.95 });
    g.poly(archPoints(bx, gy, w, h)).stroke({ color: ink, width: 1.6 });
  }
  // hub deck at the convergence point
  g.poly([cx - 20, gy - 30, cx + 20, gy - 30, cx + 14, gy - 42, cx - 14, gy - 42]).fill({ color: 0xd8c98a }).stroke({ color: ink, width: 1.6 });
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

/** Linear blend between two hex colours (`t` 0 → a, 1 → b). */
function mixColor(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

/** Warm sand/shallows tone for the coastal transition band (depth-plan-v1 §5). */
const SHORE_SAND = 0xe7d8b0;

/**
 * Terrain fill for one ground tile — the design-system biome ground, then the
 * fingerprint layer (depth-plan-v1 §5): a shore tile blends toward warm sand, and
 * every tile takes its per-tile lightness jitter (`o.tint`, layout-seeded) so the
 * bed breathes like hand-drawn paper. Both are pure reads of layout-set fields.
 */
function terrainColor(o: SceneObject): number {
  let c = groundTint(o.biome, o.elevation);
  if (o.shore) c = mixColor(c, SHORE_SAND, 0.5);
  if (o.tint) c = shade(c, o.tint);
  return c;
}

/** A fallback colour for untextured objects, tinted by kind + biome. */
function placeholderColor(o: SceneObject): number {
  if (o.layer === 'terrain') return terrainColor(o);
  if (o.layer === 'sea') return 0xbccedc; // pale domain water (--water 数理), not deep teal
  if (o.kind.startsWith('ghost:')) return 0x8a86b8;
  if (o.kind.startsWith('scenery:')) return shade(groundTint(o.biome, 0), 0.15);
  if (o.kind === 'claim') return 0xd8c98a;
  if (o.kind.startsWith('station:')) return biomeTint(o.biome);
  return 0xb0a080;
}

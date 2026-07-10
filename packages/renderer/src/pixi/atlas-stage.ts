/**
 * AtlasStage — the L0 图集 Pixi camera + semantic-LOD engine (Phase C1+C2,
 * docs/scene-upgrade/INFO-HIERARCHY.md §2/§5/§6).
 *
 * Sibling to {@link ./scene-stage!SceneStage} (the L1 island engine): same
 * lifecycle discipline (construct → `await init` → `setIslands` → interact →
 * `destroy`), same on-demand render + `lastRenderMs` §7 metric, same screen-
 * space billboard-label technique (constant font, re-laid-out on camera move).
 * It does NOT reuse the iso projection — L0 is a top-down sea chart, so the
 * camera works directly in chart (1440×900-family) coordinates.
 *
 * Three cartographic tiers by camera scale (INFO-HIERARCHY §2 row 1), the
 * decision made by the pure {@link ./atlas-lod!zoomTier}; cross-faded by
 * {@link ./atlas-lod!tierBlend} so layers never hard-cut:
 *   far  — archipelago blobs + names, outlier islands glow-float (NOT the bulk).
 *   mid  — one coastline per island + domain colour + de-collided billboard name.
 *   near — one island's full readout (name / domain / tide N / growth silhouette).
 *
 * The archipelago layer consumes {@link ./atlas-lod!AtlasCluster}; today the
 * host feeds {@link ./atlas-lod!placeholderClusters} (group-by-domain), and the
 * Phase C3 lane will swap in a real clustering projection behind the SAME
 * interface — this stage does not compute the clusters, it only draws them.
 */

import { Application, Container, Graphics, Sprite, Text, TextStyle, Texture, isWebGLSupported } from 'pixi.js';
import {
  ATLAS_DOMAIN_FILL,
  ATLAS_DOMAIN_INK,
  ATLAS_STAGE_RADIUS,
  atlasCoastline,
  deconflictLabels,
  islandPriority,
  tierBlend,
  zoomTier,
  type AtlasCluster,
  type AtlasIslandInput,
  type AtlasTier,
  type LabelBox,
} from './atlas-lod';

const STAGE_LABELS = ['空岛', '草棚', '书院', '学派'] as const;

/**
 * Trace `atlasCoastline`'s flat point list as a SMOOTH closed curve (Catmull-
 * Rom converted to cubic Beziers) instead of a straight-edged polygon —
 * mirrors `assets/islandSilhouette.moundPath`'s technique exactly (same
 * tension divisor) so the atlas' island shape reads as the SAME soft-mound
 * family the SVG L0 draws, never the angular/faceted "domain grammar" that
 * was tried once and rolled back (see `atlas-lod.ts`'s coastline doc comment
 * / `islandSilhouette.ts`'s rollback note) — Pixi has no SVG path string, so
 * this draws directly with `Graphics.bezierCurveTo`.
 */
function traceSmoothClosed(gfx: Graphics, pts: number[]): void {
  const n = pts.length / 2;
  if (n < 3) return;
  const at = (i: number): [number, number] => {
    const k = ((i % n) + n) % n;
    return [pts[k * 2]!, pts[k * 2 + 1]!];
  };
  const [x0, y0] = at(0);
  gfx.moveTo(x0, y0);
  for (let i = 0; i < n; i++) {
    const [px0, py0] = at(i - 1);
    const [px1, py1] = at(i);
    const [px2, py2] = at(i + 1);
    const [px3, py3] = at(i + 2);
    const c1x = px1 + (px2 - px0) / 6;
    const c1y = py1 + (py2 - py0) / 6;
    const c2x = px2 - (px3 - px1) / 6;
    const c2y = py2 - (py3 - py1) / 6;
    gfx.bezierCurveTo(c1x, c1y, c2x, c2y, px2, py2);
  }
  gfx.closePath();
}

/** Options for {@link AtlasStage.init}; mirrors {@link SceneStageOptions}. */
export interface AtlasStageOptions {
  width?: number;
  height?: number;
  background?: number | string;
  antialias?: boolean;
  resolution?: number;
  resizeTo?: HTMLElement | Window;
}

/** Live camera / render telemetry pushed to the demo HUD. */
export interface AtlasMetrics {
  renderMs: number;
  scale: number;
  tier: AtlasTier;
  islands: number;
  /** Islands whose coastline is currently on-screen and in a visible tier. */
  visible: number;
  /** Labels currently shown as text (the rest demoted to dots at this camera). */
  labels: number;
}

/** Camera zoom clamp — three tiers must all be reachable within this range. */
const MIN_SCALE = 0.18;
const MAX_SCALE = 4.5;

interface IslandNode {
  o: AtlasIslandInput;
  sprite: Sprite;
  glow?: Graphics;
  labelGroup: Container;
  labelText: Text;
  labelSub: Text;
  labelBg: Graphics;
  dot: Graphics;
  /** cached half-extents of the label box in screen px (recomputed on content change). */
  halfW: number;
  halfH: number;
  showingTier: AtlasTier | '';
}

export class AtlasStage {
  app?: Application;

  /** Camera-transformed world root (chart space). */
  readonly worldRoot = new Container();
  /** Far-tier archipelago blobs (world space). */
  readonly clusterLayer = new Container();
  /** Outlier variance-select glow (world space, all tiers). */
  readonly glowLayer = new Container();
  /** Island coastlines (world space, mid/near). */
  readonly islandLayer = new Container();
  /** Screen-space labels (never camera-transformed → constant crisp size). */
  readonly uiLayer = new Container();
  /** Far-tier archipelago name billboards (screen space). */
  readonly clusterLabelLayer = new Container();
  /** Mid/near island name billboards + demoted dots (screen space). */
  readonly labelLayer = new Container();

  lastRenderMs = 0;
  onMetrics?: (m: AtlasMetrics) => void;
  onPick?: (slug: string) => void;
  /** Pointer entered/left an island sprite (`null` on leave). Mirrors the SVG
   * L0's mouseenter/mouseleave — the host uses this to show the same hover
   * island-card the flat chart shows, positioned from `scale`/`worldRoot`
   * (both public) at call time so it always reflects the CURRENT camera. */
  onHover?: (slug: string | null) => void;

  private islands: IslandNode[] = [];
  private clusters: AtlasCluster[] = [];
  private clusterLabels: Array<{ c: AtlasCluster; group: Container; halfW: number; halfH: number }> = [];
  private lastLabelCount = 0;
  private settleTimer: ReturnType<typeof setTimeout> | null = null;

  // pointer / drag state
  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private camStartX = 0;
  private camStartY = 0;
  private moved = false;
  private canvasEl?: HTMLCanvasElement;
  private readonly boundWheel = (e: WheelEvent): void => this.onWheel(e);
  private readonly boundDown = (e: PointerEvent): void => this.onPointerDown(e);
  private readonly boundMove = (e: PointerEvent): void => this.onPointerMove(e);
  private readonly boundUp = (e: PointerEvent): void => this.onPointerUp(e);

  constructor() {
    this.worldRoot.label = 'atlas-camera';
    this.clusterLayer.label = 'clusters';
    this.glowLayer.label = 'glow';
    this.islandLayer.label = 'islands';
    this.uiLayer.label = 'atlas-ui';
    this.clusterLabelLayer.label = 'cluster-labels';
    this.labelLayer.label = 'island-labels';
    this.uiLayer.eventMode = 'none';
    // paint order within world: blobs (back) → glow → islands (front).
    this.worldRoot.addChild(this.clusterLayer, this.glowLayer, this.islandLayer);
  }

  async init(target: HTMLCanvasElement | HTMLElement, opts: AtlasStageOptions = {}): Promise<void> {
    if (!isWebGLSupported()) {
      throw new Error('[renderer/pixi] WebGL unavailable — AtlasStage needs a GPU context.');
    }
    const app = new Application();
    const isCanvas = typeof HTMLCanvasElement !== 'undefined' && target instanceof HTMLCanvasElement;
    await app.init({
      canvas: isCanvas ? (target as HTMLCanvasElement) : undefined,
      resizeTo: opts.resizeTo,
      width: opts.width ?? 1280,
      height: opts.height ?? 720,
      background: opts.background ?? 0xf2ead8,
      antialias: opts.antialias ?? true,
      resolution: opts.resolution ?? 1,
      autoDensity: true,
      autoStart: false, // static except on interaction → on-demand render (§7)
    });
    if (!isCanvas) {
      app.canvas.style.display = 'block';
      app.canvas.style.width = '100%';
      app.canvas.style.height = '100%';
      target.appendChild(app.canvas);
    }
    app.stage.addChild(this.worldRoot, this.uiLayer);
    this.uiLayer.addChild(this.clusterLabelLayer, this.labelLayer);
    this.app = app;
    this.canvasEl = app.canvas;
    // Camera input is handled on the DOM canvas (no ticker → on-demand frames).
    this.canvasEl.addEventListener('wheel', this.boundWheel, { passive: false });
    this.canvasEl.addEventListener('pointerdown', this.boundDown);
    window.addEventListener('pointermove', this.boundMove);
    window.addEventListener('pointerup', this.boundUp);
  }

  /** Ingest the atlas data and (re)build every node. Bakes one coastline texture
   * per island (a ONE-TIME setup cost; per-frame the camera only transforms the
   * sprites, so pan/zoom stays cheap at 700). Clusters come pre-computed from the
   * host (placeholder today, real projection at C3). */
  setIslands(islands: AtlasIslandInput[], clusters: AtlasCluster[]): void {
    if (!this.app) return;
    this.disposeNodes();
    this.clusters = clusters;
    this.buildClusters();
    for (const o of islands) this.islands.push(this.buildIsland(o));
    this.fitToContent(islands);
    this.applyTier();
  }

  private buildIsland(o: AtlasIslandInput): IslandNode {
    const app = this.app!;
    // Bake the coastline to a texture once; the Sprite is what draws every frame.
    const gfx = new Graphics();
    const pts = atlasCoastline(o.slug, o.domain, o.stage, 0, 0);
    const fill = o.dormant ? 0xd8d3c2 : ATLAS_DOMAIN_FILL[o.domain];
    traceSmoothClosed(gfx, pts);
    gfx.fill({ color: fill }).stroke({ color: ATLAS_DOMAIN_INK[o.domain], width: 2, alpha: 0.85 });
    // small contact shadow so the isle reads as floating (matches SVG L0)
    const r = ATLAS_STAGE_RADIUS[Math.max(0, Math.min(3, o.stage)) as 0 | 1 | 2 | 3];
    const shadow = new Graphics().ellipse(0, r * 0.5, r * 0.8, r * 0.28).fill({ color: 0x3a3024, alpha: 0.12 });
    const bake = new Container();
    bake.addChild(shadow, gfx);
    const texture = app.renderer.generateTexture({ target: bake, resolution: 2 });
    bake.destroy({ children: true });
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 0.5);
    sprite.x = o.x;
    sprite.y = o.y;
    sprite.eventMode = 'static';
    sprite.cursor = 'pointer';
    sprite.on('pointertap', () => { if (!this.moved) this.onPick?.(o.slug); });
    sprite.on('pointerover', () => this.onHover?.(o.slug));
    sprite.on('pointerout', () => this.onHover?.(null));
    this.islandLayer.addChild(sprite);

    let glow: Graphics | undefined;
    if (o.outlier) {
      // variance-select outlier: a soft double-ring glow that floats it above the
      // bulk at EVERY tier (INFO-HIERARCHY §2 — outliers never fold into a cluster).
      glow = new Graphics()
        .circle(o.x, o.y, r + 22).fill({ color: 0xe3a93c, alpha: 0.1 })
        .circle(o.x, o.y, r + 10).fill({ color: 0xe3a93c, alpha: 0.14 });
      this.glowLayer.addChild(glow);
    }

    // Billboard label group (screen space): name + subline; a dot for demotion.
    const group = new Container();
    group.eventMode = 'none';
    const labelBg = new Graphics();
    const labelText = new Text({
      text: o.name,
      style: new TextStyle({ fontFamily: "'Noto Serif SC','PingFang SC',serif", fontSize: 13, fontWeight: '600', fill: 0x2b2620, align: 'center' }),
      resolution: 2,
    });
    labelText.anchor.set(0.5, 0.5);
    const labelSub = new Text({
      text: '',
      style: new TextStyle({ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, fill: 0x6b6154, align: 'center' }),
      resolution: 2,
    });
    labelSub.anchor.set(0.5, 0.5);
    group.addChild(labelBg, labelText, labelSub);
    this.labelLayer.addChild(group);

    const dot = new Graphics().circle(0, 0, 3).fill({ color: ATLAS_DOMAIN_INK[o.domain], alpha: 0.9 });
    dot.eventMode = 'none';
    this.labelLayer.addChild(dot);

    return { o, sprite, glow, labelGroup: group, labelText, labelSub, labelBg, dot, halfW: 0, halfH: 0, showingTier: '' };
  }

  private buildClusters(): void {
    for (const c of this.clusters) {
      // Soft WATERCOLOUR WASH, never a polygon/border (design authority: region
      // blobs are washes). A stack of concentric fills — faint & wide at the rim,
      // denser toward the centre — approximates a radial gradient with no hard
      // edge. 体温 (c.heat) modulates the peak opacity: a live region glows a
      // touch warmer, a dormant one barely tints the water (data transcription,
      // not a size rank — see Archipelago.heat).
      const heat = Math.max(0, Math.min(1, c.heat ?? 0));
      const peak = 0.14 + heat * 0.16; // dormant ≈0.14 → live ≈0.30
      const blob = new Graphics();
      const RINGS = 5;
      for (let k = RINGS; k >= 1; k--) {
        const t = k / RINGS; // 1 (rim) → 1/RINGS (core)
        const rr = c.radius * (0.4 + 0.6 * t);
        // rim faint, core densest — additive alpha builds the soft mound.
        const alpha = peak * (1 - t) * 0.5 + peak * (t <= 1 / RINGS ? 1 : 0.18);
        blob.circle(c.center.x, c.center.y, rr).fill({ color: c.tint, alpha });
      }
      this.clusterLayer.addChild(blob);

      // Region name billboard (screen space, constant size) + optional caption.
      const group = new Container();
      group.eventMode = 'none';
      const bg = new Graphics();
      const text = new Text({
        text: `${c.name} · ${c.islandSlugs.length}`,
        style: new TextStyle({ fontFamily: "'Noto Serif SC','PingFang SC',serif", fontSize: 18, fontWeight: '700', fill: 0x3a342b, align: 'center' }),
        resolution: 2,
      });
      text.anchor.set(0.5, 0.5);
      let captionText: Text | undefined;
      if (c.caption) {
        captionText = new Text({
          text: c.caption,
          style: new TextStyle({ fontFamily: "'Noto Serif SC','PingFang SC',serif", fontStyle: 'italic', fontSize: 11, fill: 0x6b6154, align: 'center' }),
          resolution: 2,
        });
        captionText.anchor.set(0.5, 0.5);
      }
      const contentW = Math.max(text.width, captionText?.width ?? 0);
      const contentH = text.height + (captionText ? captionText.height + 3 : 0);
      const halfW = contentW / 2 + 12;
      const halfH = contentH / 2 + 6;
      // Chip stays a soft rounded wash (subtle tint edge, not a hard region border).
      bg.roundRect(-halfW, -halfH, halfW * 2, halfH * 2, 9).fill({ color: 0xfaf5e8, alpha: 0.82 }).stroke({ color: c.tint, width: 1, alpha: 0.55 });
      if (captionText) {
        text.y = -captionText.height / 2 - 1;
        captionText.y = text.height / 2 + 1;
      }
      group.addChild(bg, text);
      if (captionText) group.addChild(captionText);
      this.clusterLabelLayer.addChild(group);
      this.clusterLabels.push({ c, group, halfW, halfH });
    }
  }

  // ─── Camera ────────────────────────────────────────────────────────────────

  private redraw(): void {
    if (!this.app) return;
    const t0 = performance.now();
    this.app.render();
    this.lastRenderMs = performance.now() - t0;
  }

  get scale(): number {
    return this.worldRoot.scale.x || 1;
  }

  /** Frame the whole atlas so every island is visible on first paint. */
  fitToContent(islands: AtlasIslandInput[]): void {
    if (!this.app || islands.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const o of islands) {
      minX = Math.min(minX, o.x); maxX = Math.max(maxX, o.x);
      minY = Math.min(minY, o.y); maxY = Math.max(maxY, o.y);
    }
    const pad = 120;
    const w = maxX - minX + pad * 2;
    const h = maxY - minY + pad * 2;
    const s = Math.min(this.app.screen.width / w, this.app.screen.height / h, MAX_SCALE);
    const scale = Math.max(MIN_SCALE, s);
    this.worldRoot.scale.set(scale);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    this.worldRoot.x = this.app.screen.width / 2 - cx * scale;
    this.worldRoot.y = this.app.screen.height / 2 - cy * scale;
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    const rect = this.canvasEl!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    this.zoomAt(px, py, factor);
  }

  /** Zoom by `factor` keeping the world point under `(px,py)` screen-fixed. */
  zoomAt(px: number, py: number, factor: number): void {
    const old = this.scale;
    const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, old * factor));
    if (next === old) return;
    const wx = (px - this.worldRoot.x) / old;
    const wy = (py - this.worldRoot.y) / old;
    this.worldRoot.scale.set(next);
    this.worldRoot.x = px - wx * next;
    this.worldRoot.y = py - wy * next;
    this.onCameraChange();
  }

  private onPointerDown(e: PointerEvent): void {
    this.dragging = true;
    this.moved = false;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.camStartX = this.worldRoot.x;
    this.camStartY = this.worldRoot.y;
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.dragging) return;
    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;
    if (Math.abs(dx) + Math.abs(dy) > 3) this.moved = true;
    this.worldRoot.x = this.camStartX + dx;
    this.worldRoot.y = this.camStartY + dy;
    this.onCameraChange();
  }

  private onPointerUp(_e: PointerEvent): void {
    this.dragging = false;
  }

  /** Camera moved: re-blend tiers + reposition labels now; re-deconflict on settle. */
  private onCameraChange(): void {
    this.applyTier();
    this.scheduleSettle();
  }

  private scheduleSettle(): void {
    if (this.settleTimer) clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => {
      this.settleTimer = null;
      this.applyTier(true); // full re-layout incl. label de-collision
    }, 110);
  }

  // ─── Semantic LOD ────────────────────────────────────────────────────────────

  /**
   * Blend the three tiers for the current camera, position every screen-space
   * label, and (on `reflow`) re-run billboard de-collision. Cheap path (reflow
   * =false) runs on every camera delta: it only sets layer alphas, culls off-
   * screen sprites and translates labels — no re-tessellation, no allocation.
   */
  applyTier(reflow = false): void {
    if (!this.app) return;
    const scale = this.scale;
    const blend = tierBlend(scale);
    const tier = zoomTier(scale);
    const view = this.app.screen;

    // Layer opacities from the cross-fade (never a hard cut).
    this.clusterLayer.alpha = blend.far;
    this.clusterLabelLayer.alpha = blend.far;
    this.islandLayer.alpha = Math.max(blend.mid, blend.near);
    // outlier glow floats at every tier, but strongest at far (it IS the overview signal).
    this.glowLayer.alpha = Math.max(0.55, blend.far);

    // Region name billboards (screen space, constant size). Position always;
    // de-collide so a crowd of ~30–50 regions never overlaps into mush — an
    // overlapping label is simply HIDDEN (the soft wash already marks the region),
    // a discrete label/no-label outcome, not a "bigger = better" rank. Priority is
    // member count purely as display disambiguation (which name survives a crowd),
    // the same discipline as island billboards (see deconflictLabels).
    const farVisible = blend.far > 0.02;
    const clusterBoxes: LabelBox[] = [];
    for (const { c, group, halfW, halfH } of this.clusterLabels) {
      const sx = c.center.x * scale + this.worldRoot.x;
      const sy = c.center.y * scale + this.worldRoot.y;
      group.x = Math.round(sx);
      group.y = Math.round(sy);
      const onscreen = sx > -200 && sx < view.width + 200 && sy > -100 && sy < view.height + 100;
      if (farVisible && onscreen) {
        clusterBoxes.push({ id: c.id, priority: c.islandSlugs.length, sx, sy, halfW, halfH });
      } else {
        group.visible = false;
      }
    }
    if (clusterBoxes.length > 0) {
      const verdict = deconflictLabels(clusterBoxes);
      for (const { c, group } of this.clusterLabels) {
        group.visible = verdict.get(c.id) === 'label';
      }
    }

    const labelsVisible = blend.mid + blend.near > 0.02;
    let onScreen = 0;
    const boxes: LabelBox[] = [];
    for (const nd of this.islands) {
      const o = nd.o;
      const sx = o.x * scale + this.worldRoot.x;
      const r = ATLAS_STAGE_RADIUS[Math.max(0, Math.min(3, o.stage)) as 0 | 1 | 2 | 3];
      const sy = o.y * scale + this.worldRoot.y;
      const vis = sx > -80 && sx < view.width + 80 && sy > -80 && sy < view.height + 80;
      // Sprite culling: hide when off-screen or when the island layer is invisible (far tier).
      nd.sprite.visible = vis && this.islandLayer.alpha > 0.02;
      if (nd.glow) nd.glow.visible = vis; // glow rides glowLayer alpha
      if (vis && this.islandLayer.alpha > 0.02) onScreen++;

      // Refresh label content when the tier changes (mid = name only, near = name+subline).
      if (labelsVisible && nd.showingTier !== tier) this.setLabelContent(nd, tier);
      // Position the label above the isle (screen space, constant offset).
      const ly = sy - (r * scale + 16);
      nd.labelGroup.x = Math.round(sx);
      nd.labelGroup.y = Math.round(ly);
      nd.dot.x = Math.round(sx);
      nd.dot.y = Math.round(ly);
      if (labelsVisible && vis) boxes.push({ id: o.slug, priority: islandPriority(o), sx, sy: ly, halfW: nd.halfW, halfH: nd.halfH });
      else { nd.labelGroup.visible = false; nd.dot.visible = false; }
    }

    // De-collision only on settle (reflow) — the expensive-ish pass. Between
    // settles labels keep their last verdict, just translated (no flicker).
    if (labelsVisible && (reflow || this.lastLabelCount === 0)) {
      const verdict = deconflictLabels(boxes);
      let shown = 0;
      for (const nd of this.islands) {
        const v = verdict.get(nd.o.slug);
        const onscreen = v !== undefined;
        const asLabel = v === 'label';
        nd.labelGroup.visible = onscreen && asLabel;
        nd.dot.visible = onscreen && !asLabel;
        nd.labelGroup.alpha = Math.max(blend.mid, blend.near);
        nd.dot.alpha = Math.max(blend.mid, blend.near);
        if (asLabel) shown++;
      }
      this.lastLabelCount = shown;
    } else if (labelsVisible) {
      // cheap path: keep prior verdicts, just re-apply tier alpha
      for (const nd of this.islands) {
        nd.labelGroup.alpha = Math.max(blend.mid, blend.near);
        nd.dot.alpha = Math.max(blend.mid, blend.near);
      }
    } else {
      this.lastLabelCount = 0;
    }

    this.redraw();
    this.onMetrics?.({ renderMs: this.lastRenderMs, scale, tier, islands: this.islands.length, visible: onScreen, labels: this.lastLabelCount });
  }

  /** Swap a label's text for the tier: mid = name only, near = name + 域·态·N subline. */
  private setLabelContent(nd: IslandNode, tier: AtlasTier): void {
    nd.showingTier = tier;
    nd.labelText.text = nd.o.name;
    if (tier === 'near') {
      const st = STAGE_LABELS[Math.max(0, Math.min(3, nd.o.stage))];
      nd.labelSub.text = `${nd.o.domain} · ${st} · N${nd.o.eventCount}`;
      nd.labelSub.visible = true;
      nd.labelText.y = -8;
      nd.labelSub.y = 9;
    } else {
      nd.labelSub.visible = false;
      nd.labelText.y = 0;
    }
    // Recompute background box to fit the widest line at this tier.
    const w = Math.max(nd.labelText.width, nd.labelSub.visible ? nd.labelSub.width : 0);
    const h = nd.labelText.height + (nd.labelSub.visible ? nd.labelSub.height + 4 : 0);
    const halfW = w / 2 + 7;
    const halfH = h / 2 + 3;
    nd.labelBg.clear();
    nd.labelBg.roundRect(-halfW, -halfH, halfW * 2, halfH * 2, 5).fill({ color: 0xfaf5e8, alpha: 0.92 }).stroke({ color: 0x3a342b, width: 1 });
    nd.halfW = halfW;
    nd.halfH = halfH;
  }

  // ─── Teardown ────────────────────────────────────────────────────────────────

  private disposeNodes(): void {
    for (const nd of this.islands) {
      nd.sprite.texture.destroy(true);
      nd.sprite.destroy();
      nd.glow?.destroy();
      nd.labelGroup.destroy({ children: true });
      nd.dot.destroy();
    }
    this.islands = [];
    this.clusterLayer.removeChildren().forEach((c) => c.destroy());
    this.clusterLabelLayer.removeChildren().forEach((c) => c.destroy());
    this.clusters = [];
    this.clusterLabels = [];
    this.lastLabelCount = 0;
  }

  destroy(): void {
    if (this.settleTimer) clearTimeout(this.settleTimer);
    this.settleTimer = null;
    if (this.canvasEl) {
      this.canvasEl.removeEventListener('wheel', this.boundWheel);
      this.canvasEl.removeEventListener('pointerdown', this.boundDown);
    }
    window.removeEventListener('pointermove', this.boundMove);
    window.removeEventListener('pointerup', this.boundUp);
    this.disposeNodes();
    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = undefined;
    }
  }
}

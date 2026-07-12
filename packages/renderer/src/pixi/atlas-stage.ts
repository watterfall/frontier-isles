/**
 * AtlasStage — the L0 图集 Pixi camera + semantic-LOD engine (Phase C1+C2,
 * docs/scene-upgrade/INFO-HIERARCHY.md §2/§5/§6).
 *
 * Sibling to {@link ./scene-stage!SceneStage} (the L1 island engine): same
 * lifecycle discipline (construct → `await init` → `setIslands` → interact →
 * `destroy`), same on-demand render + `lastRenderMs` §7 metric, same screen-
 * space billboard-label technique (constant font, re-laid-out on camera move).
 * The atlas keeps its authored chart coordinates but folds the north/south
 * place axis into three orthographic air strata. This is a 2.5D cartographic
 * projection, not a perspective game camera: labels stay crisp and the list
 * twin remains authoritative while islands gain readable vertical separation.
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
  ATLAS_BAND_LIFT,
  ATLAS_DOMAIN_FILL,
  ATLAS_DOMAIN_INK,
  ATLAS_STAGE_RADIUS,
  ATLAS_Y_TILT,
  ATLAS_Y_SPREAD,
  atlasCoastline,
  atlasIslandLift,
  computeWorldMinScale,
  deconflictLabels,
  focusFog,
  islandPriority,
  satelliteDisclosure,
  satelliteReveal,
  tierBlend,
  zoomTier,
  type AtlasCluster,
  type AtlasAltitudeBand,
  type AtlasContinent,
  type AtlasCurrent,
  type AtlasDomain,
  type AtlasFlow,
  type AtlasFogCell,
  type AtlasIslandInput,
  type AtlasTier,
  type LabelBox,
} from './atlas-lod';

const STAGE_LABELS = ['空岛', '草棚', '书院', '学派'] as const;
const ALTITUDE_LABELS: Record<AtlasAltitudeBand, string> = { low: '低空', middle: '中空', high: '高空' };
const ALTITUDE_INDEX: Record<AtlasAltitudeBand, number> = { low: 0, middle: 1, high: 2 };
// Tilt + lift math now lives in atlas-lod (shared with the web despace pipeline).
const ALTITUDE_LIFT = ATLAS_BAND_LIFT;
const ALTITUDE_DEPTH: Record<AtlasAltitudeBand, number> = { low: 20, middle: 34, high: 48 };

const altitudeOf = (o: AtlasIslandInput): AtlasAltitudeBand => o.altitude ?? 'middle';
const altitudeZOf = (o: AtlasIslandInput): number => Math.max(0, Math.min(1, o.altitudeZ ?? ALTITUDE_INDEX[altitudeOf(o)] / 2));
const altitudeLiftOf = (o: AtlasIslandInput): number => atlasIslandLift(o);
const projectAtlasY = (y: number, band?: AtlasAltitudeBand): number => y * ATLAS_Y_TILT * ATLAS_Y_SPREAD - (band ? ALTITUDE_LIFT[band] : 0);
const projectIslandY = (o: AtlasIslandInput): number => o.y * ATLAS_Y_TILT * ATLAS_Y_SPREAD - altitudeLiftOf(o);

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

/**
 * A small lighthouse landmark, drawn directly with Pixi calls (T2 richness,
 * atlas-world-plan.md §4 lane W5 — "resolved → lighthouse"). Mirrors
 * `assets/chart/Lighthouse.tsx`'s tower/lamp/beam/flag anatomy verbatim (same
 * proportions, same colours) so the L0-Pixi atlas and the L0-SVG fallback fly
 * the SAME landmark for a `status: 'resolved'` island — no new geometry
 * invented, just the SVG path translated to `Graphics` draw calls (Pixi has
 * no SVG path string, same rationale as `traceSmoothClosed` above).
 */
function drawLighthouseGfx(g: Graphics, x: number, y: number, scale: number): void {
  const s = scale;
  g.poly([x - 5 * s, y, x - 3 * s, y - 22 * s, x + 3 * s, y - 22 * s, x + 5 * s, y])
    .fill({ color: 0xf8f1de })
    .stroke({ color: 0x4a4238, width: 1 });
  g.rect(x - 4 * s, y - 22 * s, 8 * s, 6 * s).fill({ color: 0x2b2620 }).stroke({ color: 0x4a4238, width: 0.75 });
  g.circle(x, y - 19 * s, 3.4 * s).fill({ color: 0xe3a93c, alpha: 0.55 });
  g.circle(x, y - 19 * s, 1.6 * s).fill({ color: 0xf5b94b });
  g.moveTo(x, y - 22 * s).lineTo(x, y - 27 * s).stroke({ color: 0x4a4238, width: 1 });
  g.poly([x, y - 27 * s, x + 6 * s, y - 24.5 * s, x, y - 22 * s]).fill({ color: 0xe3a93c }).stroke({ color: 0x4a4238, width: 0.5 });
}

/** Stable 0..1 value used only for hand-authored-looking placement. */
function atlasSeed(value: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10_000) / 10_000;
}

/** One tiny jiehua building for the L0 settlement silhouette. */
function drawAtlasHouse(g: Graphics, x: number, y: number, s: number, roof: number, tall = false): void {
  const w = (tall ? 11 : 14) * s;
  const h = (tall ? 13 : 8) * s;
  g.ellipse(x, y + 3 * s, w * 0.72, 3.2 * s).fill({ color: 0x3a3024, alpha: 0.14 });
  g.rect(x - w / 2, y - h, w, h).fill({ color: 0xf8f1de }).stroke({ color: 0x4a4238, width: Math.max(0.6, s) });
  g.poly([x - w * 0.68, y - h, x, y - h - 6 * s, x + w * 0.68, y - h])
    .fill({ color: roof })
    .stroke({ color: 0x4a4238, width: Math.max(0.6, s) });
  g.rect(x - 1.7 * s, y - 5 * s, 3.4 * s, 5 * s).fill({ color: 0x5b4f3c });
  if (tall) {
    g.moveTo(x + w * 0.28, y - h - 3 * s).lineTo(x + w * 0.28, y - h - 11 * s).stroke({ color: 0x4a4238, width: Math.max(0.6, s) });
    g.poly([x + w * 0.28, y - h - 11 * s, x + w * 0.28 + 6 * s, y - h - 8 * s, x + w * 0.28, y - h - 6 * s]).fill({ color: 0xe3a93c });
  }
}

function drawAtlasTree(g: Graphics, x: number, y: number, s: number, domain: AtlasDomain): void {
  const leaf = domain === '生命' ? 0x3e9b7e : domain === '物质' ? 0x73836b : 0x4e7d62;
  g.moveTo(x, y).lineTo(x, y - 9 * s).stroke({ color: 0x6d5136, width: Math.max(0.7, 1.2 * s) });
  if (domain === '数理') {
    g.poly([x, y - 17 * s, x + 6 * s, y - 8 * s, x - 6 * s, y - 8 * s]).fill({ color: leaf }).stroke({ color: 0x4a4238, width: 0.55 });
  } else {
    g.circle(x, y - 13 * s, 5.5 * s).fill({ color: leaf, alpha: 0.9 });
    g.circle(x - 4 * s, y - 10 * s, 3.5 * s).fill({ color: leaf, alpha: 0.72 });
  }
}

/**
 * L0 richness from real island channels: growth stage controls civic density,
 * members control visible resident marks, activity controls smoke/flags, and
 * status controls lighthouse/mist. These are silhouettes, not a second set of
 * invented stations; the exact L1 arrangement still belongs to the place plane.
 */
function drawAtlasSettlement(g: Graphics, o: AtlasIslandInput, r: number): void {
  const roof = ATLAS_DOMAIN_INK[o.domain];
  const s = Math.max(0.72, r / 52);
  if (o.stage <= 0) {
    g.circle(-2 * s, -3 * s, 3.2 * s).fill({ color: 0xdccfab }).stroke({ color: 0x4a4238, width: 0.7 });
    g.circle(-2 * s, -3 * s, 7 * s).stroke({ color: roof, width: 0.7, alpha: 0.35 });
  } else {
    drawAtlasHouse(g, -r * 0.2, -r * 0.12, s, roof, false);
    if (o.stage >= 2) drawAtlasHouse(g, r * 0.2, -r * 0.22, s * 0.9, o.domain === '交叉' ? 0xb5673a : 0x2e5e8c, true);
    if (o.stage >= 3) drawAtlasHouse(g, r * 0.03, r * 0.08, s * 0.82, 0x3e9b7e, false);
  }

  const treeN = Math.min(4, Math.max(1, o.stage + ((o.members ?? 0) > 6 ? 1 : 0)));
  for (let i = 0; i < treeN; i++) {
    const a = atlasSeed(o.slug, i + 7) * Math.PI * 1.2 + Math.PI * 0.3;
    const rr = r * (0.42 + atlasSeed(o.slug, i + 19) * 0.24);
    drawAtlasTree(g, Math.cos(a) * rr, Math.sin(a) * rr * 0.48 + r * 0.08, s * 0.72, o.domain);
  }

  // Residents: one mark per visible inhabitant up to three. Actor identity is
  // deliberately absent at L0; this is only a truthful occupancy pre-echo.
  const residentN = Math.min(3, o.members ?? 0);
  for (let i = 0; i < residentN; i++) {
    const x = (-10 + i * 9) * s;
    const y = (r * 0.22 + (i % 2) * 3) * s;
    g.circle(x, y - 4 * s, 1.6 * s).fill({ color: 0x3a342b });
    g.moveTo(x, y - 2.4 * s).lineTo(x, y + 3 * s).stroke({ color: 0x3a342b, width: 0.8 * s });
  }

  // A busy workshop reads as a distant smoke clue — the open-world equivalent
  // of “something is happening there”, derived from activity rather than HUD.
  if (!o.dormant && o.eventCount >= 45 && o.stage >= 1) {
    const x = -r * 0.2 + 5 * s;
    const y = -r * 0.12 - 17 * s;
    g.moveTo(x, y).bezierCurveTo(x - 4 * s, y - 7 * s, x + 5 * s, y - 11 * s, x + 1 * s, y - 18 * s)
      .stroke({ color: 0x6b6154, width: Math.max(0.7, s), alpha: 0.42 });
  }

  if (o.dormant) {
    g.ellipse(-r * 0.22, r * 0.12, r * 0.24, r * 0.1).fill({ color: 0x8f9b7e, alpha: 0.46 });
    g.ellipse(r * 0.2, r * 0.22, r * 0.18, r * 0.08).fill({ color: 0x8f9b7e, alpha: 0.34 });
    g.ellipse(0, -r * 0.16, r * 0.76, r * 0.2).fill({ color: 0xf2ead8, alpha: 0.52 });
  }
}

function drawAtlasWaterRings(g: Graphics, r: number): void {
  for (let i = 0; i < 3; i++) {
    const y = r * (0.56 + i * 0.16);
    const w = r * (0.92 - i * 0.09);
    g.moveTo(-w, y).bezierCurveTo(-w * 0.45, y + 7, w * 0.45, y + 7, w, y)
      .stroke({ color: 0x9db9cb, width: 1, alpha: 0.42 - i * 0.08 });
  }
}

/** A quiet cartographic dock ring for a region's geometry-derived anchor.
 * It says "open this group here", never "this research is better". */
function drawNavigationAnchor(g: Graphics, r: number, domain: AtlasDomain): void {
  const ink = ATLAS_DOMAIN_INK[domain];
  const y = r * 0.54;
  g.ellipse(0, y, r * 0.88, r * 0.21).stroke({ color: ink, width: 1, alpha: 0.36 });
  for (const x of [-r * 0.7, 0, r * 0.7]) {
    g.moveTo(x, y - 3).lineTo(x, y + 4).stroke({ color: ink, width: 1, alpha: 0.46 });
  }
  g.circle(0, y, 3.2).fill({ color: 0xf8f1de, alpha: 0.9 }).stroke({ color: ink, width: 0.8, alpha: 0.72 });
}

/** Mineral-ink underside: one tapered body and a few ruled strata turn the
 * familiar soft mound into a floating island without changing its coastline. */
function drawAtlasUnderside(g: Graphics, r: number, depth: number, domain: AtlasDomain, dormant: boolean): void {
  const ink = ATLAS_DOMAIN_INK[domain];
  g.moveTo(-r * 0.86, r * 0.08)
    .bezierCurveTo(-r * 0.62, r * 0.42, -r * 0.28, depth * 0.82, 0, depth)
    .bezierCurveTo(r * 0.28, depth * 0.82, r * 0.62, r * 0.42, r * 0.86, r * 0.08)
    .bezierCurveTo(r * 0.42, r * 0.25, -r * 0.42, r * 0.25, -r * 0.86, r * 0.08)
    .closePath()
    .fill({ color: dormant ? 0x9d9787 : 0x81735e, alpha: 0.96 })
    .stroke({ color: ink, width: 1.2, alpha: 0.72 });
  for (let i = 0; i < 5; i++) {
    const x = -r * 0.58 + i * r * 0.29;
    const tipX = (i - 2) * r * 0.07;
    g.moveTo(x, r * 0.18).quadraticCurveTo(x * 0.64, depth * 0.52, tipX, depth * (0.8 + Math.abs(i - 2) * 0.025))
      .stroke({ color: i % 2 === 0 ? ink : 0xf2ead8, width: 0.75, alpha: i % 2 === 0 ? 0.28 : 0.2 });
  }
}

/**
 * Structure-lens input (执行纲要 §九) — the 结构 ⇄ 现象 bipartite graph reduced
 * to slug sets by the host (`chart/structureLens.ts`). The stage draws it as a
 * MODAL focus layer built ENTIRELY from existing vocabulary (§5.1, no new
 * geometry): rebuilt islands carry the outlier double-ring glow, gaps carry a
 * dashed halo (the sea-current dash `7 5` at the proposed opacity 0.5), arcs
 * between rebuilt islands reuse the air-route bow + wind gates, and everything
 * else dims through the same fog channel My Harbor uses — a filter, never a
 * wall (invariant 4): hit-testing is untouched.
 */
export interface AtlasStructureLensInput {
  structureId: string;
  /** Islands where this structure was rebuilt — lit solid. */
  rebuiltSlugs: string[];
  /** Honest dashed gaps ("此结构尚无人带来") — position only, NEVER a
   * suggested mapping (§九 red-line). */
  gapSlugs: string[];
  /** Arcs between rebuilt islands (air-route vocabulary, chord order). */
  arcs: Array<{ fromSlug: string; toSlug: string }>;
}

/** Lens palette: arcs/dashes in 赭石 ochre — the BRIDGE current tint (a rebuild
 * is a human bridging act, same family as `bridge`/`transplant` currents);
 * rebuilt glow in the outlier amber (`0xe3a93c`) verbatim. Both are frozen
 * prototype colours already used on this stage — no new colour invented. */
const LENS_ARC_TINT = 0xb5673a; // --fi-ochre (bridge current)
const LENS_GLOW_TINT = 0xe3a93c; // outlier glow amber
/** Fog-channel dim for islands outside the lens (matches My Harbor's 0.45 floor). */
const LENS_DIM_FLOOR = 0.45;

/** Trace a dashed circle with the sea-current dash rhythm (`7 5` world px) —
 * Pixi has no strokeDasharray, so the dash is drawn as arc segments. */
function traceDashedCircle(g: Graphics, cx: number, cy: number, r: number, dash = 7, gap = 5): void {
  const circumference = 2 * Math.PI * r;
  const n = Math.max(6, Math.round(circumference / (dash + gap)));
  const step = (Math.PI * 2) / n;
  const dashAngle = step * (dash / (dash + gap));
  for (let i = 0; i < n; i++) {
    const a0 = i * step;
    g.moveTo(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r).arc(cx, cy, r, a0, a0 + dashAngle);
  }
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
  /** Total nested satellite islands in the current dataset. */
  satellites: number;
  /** Satellites currently disclosed by camera scale and viewport. */
  visibleSatellites: number;
}

/** Camera zoom-IN clamp — near tier must always be reachable. The zoom-OUT
 *  floor is `minScale` (an instance field, computed per-dataset by
 *  `computeWorldMinScale` in `fitToContent` — see that method's doc comment). */
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
  band: AtlasAltitudeBand;
  /** Nested-disclosure alpha for THIS camera (anchors always 1; satellites from
   * satelliteDisclosure). Written once per applyTier, read by labels + routes. */
  reveal: number;
  /** My Harbor fog dim ∈ (0,1] for THIS camera (1 = no harbor / no fog).
   * Written once per applyTier alongside `reveal`; multiplied into sprite and
   * label alphas — never into visibility or hit-testing (invariant 4). */
  fogDim: number;
}

export class AtlasStage {
  app?: Application;

  /** Camera-transformed world root (chart space). */
  readonly worldRoot = new Container();
  /** Hand-authored-looking contour/horizon layer: visual geography below the
   * data climate, giving the world long sightlines without inventing borders. */
  readonly terrainLayer = new Container();
  /** Far-tier climate territories: soft watercolor washes + inter-territory
   * currents + fog (world space, BELOW the cluster layer — lane W2 owns this). */
  readonly continentLayer = new Container();
  /** Far-tier archipelago blobs (world space). */
  readonly clusterLayer = new Container();
  /** Data-current routes redrawn as elevated air lanes. */
  readonly routeLayer = new Container();
  /** Real island-to-island currents at mid/near scale. */
  readonly localRouteLayer = new Container();
  /** Fog-derived cloud banks behind and in front of the islands. */
  readonly cloudBackLayer = new Container();
  /** Outlier variance-select glow (world space, all tiers). */
  readonly glowLayer = new Container();
  /** Structure-lens marks (§九): rebuilt glows + dashed gap halos + bridge arcs.
   * World space, above the glow layer so lens marks read over the base glows,
   * below the islands so coastlines stay crisp. */
  readonly lensLayer = new Container();
  /** Island coastlines (world space, mid/near). */
  readonly islandLayer = new Container();
  readonly cloudFrontLayer = new Container();
  /** Screen-space labels (never camera-transformed → constant crisp size). */
  readonly uiLayer = new Container();
  /** Far-tier climate-territory name billboards (screen space, BEHIND the
   * cluster names — lane W2). */
  readonly continentLabelLayer = new Container();
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
  private clusterLabels: Array<{ c: AtlasCluster; band: AtlasAltitudeBand; group: Container; halfW: number; halfH: number }> = [];
  private continents: AtlasContinent[] = [];
  private fogCells: AtlasFogCell[] = [];
  private flows: AtlasFlow[] = [];
  private currents: AtlasCurrent[] = [];
  private currentRoutes: Array<{ current: AtlasCurrent; line: Graphics }> = [];
  private continentLabels: Array<{ c: AtlasContinent; group: Container }> = [];
  private lastLabelCount = 0;
  private settleTimer: ReturnType<typeof setTimeout> | null = null;

  /** Zoom-OUT floor — data/screen-driven (see `fitToContent`), replaces the
   *  old fixed constant that let the camera shrink a small curated world into
   *  a speck (W5 camera-framing fix). A conservative default until the first
   *  `fitToContent` call computes the real one. */
  private minScale = 0.12;
  /** Persistent, redrawable fog Graphics (W5 goal 2: fog-as-focus responds to
   *  the camera) — built once in `buildContinents`, repainted by `redrawFog`
   *  on every camera settle. `undefined` until climate data exists. */
  private fogGfx?: Graphics;
  /** A tap-driven camera flight in progress (island or region drill-down) —
   *  guards against overlapping flights from a rapid double-tap. */
  private flying = false;
  private flightRaf: number | null = null;
  /** Wheel/trackpad zoom easing — the wheel sets a TARGET scale and an anchor,
   *  and a rAF loop glides the live scale toward it so a burst of ticks reads as
   *  one smooth push instead of stair-steps. `wheelTarget === 0` means idle. */
  private wheelTarget = 0;
  private wheelPx = 0;
  private wheelPy = 0;
  private wheelRaf: number | null = null;
  /** rAF-coalesced render request state — see `requestFrame`'s doc comment. */
  private frameScheduled = false;
  private pendingReflow = false;
  private domainFocus: AtlasDomain | null = null;
  private altitudeFocus: AtlasAltitudeBand | null = null;
  private altitudeBySlug = new Map<string, AtlasAltitudeBand>();
  /** My Harbor (depth-plan-v1 §3(d)): the actor's home set + per-island fog. */
  private harborSlugs = new Set<string>();
  private harborFog = new Map<string, number>();
  /** Structure lens (§九): null = plain world. Slug sets cached for applyTier. */
  private structureLens: AtlasStructureLensInput | null = null;
  private lensRebuilt = new Set<string>();
  private lensGaps = new Set<string>();
  /** The visitor has taken the camera somewhere themselves (drag / wheel /
   * zoom buttons). A late-arriving harbor then only applies its fog — it
   * never steals the camera back to the anchor mid-exploration. */
  touched = false;

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
    this.terrainLayer.label = 'atlas-topography';
    this.continentLayer.label = 'continents';
    this.clusterLayer.label = 'clusters';
    this.routeLayer.label = 'air-routes';
    this.localRouteLayer.label = 'local-air-routes';
    this.lensLayer.label = 'structure-lens';
    this.cloudBackLayer.label = 'clouds-behind';
    this.glowLayer.label = 'glow';
    this.islandLayer.label = 'islands';
    this.cloudFrontLayer.label = 'clouds-front';
    this.uiLayer.label = 'atlas-ui';
    this.continentLabelLayer.label = 'continent-labels';
    this.clusterLabelLayer.label = 'cluster-labels';
    this.labelLayer.label = 'island-labels';
    this.uiLayer.eventMode = 'none';
    // paint order within world: climate washes (back) → cluster blobs → glow →
    // islands (front). The continent layer is lane W2's and sits BELOW clusters.
    this.islandLayer.sortableChildren = true;
    this.worldRoot.addChild(this.terrainLayer, this.continentLayer, this.clusterLayer, this.routeLayer, this.localRouteLayer, this.glowLayer, this.lensLayer, this.cloudBackLayer, this.islandLayer, this.cloudFrontLayer);
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
    this.uiLayer.addChild(this.continentLabelLayer, this.clusterLabelLayer, this.labelLayer);
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
    this.altitudeBySlug = new Map(islands.map((island) => [island.slug, altitudeOf(island)]));
    this.buildClusters();
    for (const o of islands) this.islands.push(this.buildIsland(o));
    // A lens set before/across a dataset swap re-marks the NEW nodes (the lens
    // is a reduce over slugs, so it survives reconciliation unchanged).
    this.buildLensLayer();
    this.fitToContent(islands);
    // setIslands + setClimate + ResizeObserver arrive in one boot turn. Never
    // synchronously render each step: Pixi v8's batcher can be re-entered before
    // its prior instruction build settles. One rAF paints the composed result.
    this.requestFrame(true);
  }

  private buildIsland(o: AtlasIslandInput): IslandNode {
    const app = this.app!;
    const r = ATLAS_STAGE_RADIUS[Math.max(0, Math.min(3, o.stage)) as 0 | 1 | 2 | 3];
    const band = altitudeOf(o);
    const depth = ALTITUDE_DEPTH[band];

    // T2 richness (atlas-world-plan.md §4 lane W5): "tide glow" — a soft warm
    // halo whose intensity transcribes REAL activity data (`eventCount`, the
    // same proxy the near-tier subline already labels "N" — no true per-island
    // A/B/D ledger is available client-side, so activity IS the honest tide
    // proxy here, not an invented number). Mirrors the L1 scene's identical
    // "moon-on-water" glow colour (`GeneratedScene.tsx`'s 0xf5b94b) so the same
    // island reads as the same warmth at both zoom levels. Dormant islands
    // fade instead (see below), so they never also show a tide glow.
    const tideAlpha = !o.dormant ? Math.min(0.34, (o.eventCount / 140) * 0.34) : 0;
    const tideGlow = tideAlpha > 0.02 ? new Graphics().circle(0, 0, r * 1.22).fill({ color: 0xf5b94b, alpha: tideAlpha }) : null;

    // Bake the coastline (+ floating underside + tide glow + lighthouse) once;
    // the Sprite is what draws every frame.
    const gfx = new Graphics();
    const pts = atlasCoastline(o.slug, o.domain, o.stage, 0, 0);
    const fill = o.dormant ? 0xd8d3c2 : ATLAS_DOMAIN_FILL[o.domain];
    traceSmoothClosed(gfx, pts);
    gfx.fill({ color: fill }).stroke({ color: ATLAS_DOMAIN_INK[o.domain], width: 2, alpha: 0.85 });
    // One inner contour makes the mound read as terrain, not a flat coloured blob.
    const inner = pts.map((v, i) => v * (i % 2 === 0 ? 0.78 : 0.7) - (i % 2 === 0 ? 0 : 2));
    traceSmoothClosed(gfx, inner);
    gfx.stroke({ color: ATLAS_DOMAIN_INK[o.domain], width: 0.75, alpha: 0.28 });
    const shadow = new Graphics().ellipse(0, depth + r * 0.38, r * 0.72, r * 0.18).fill({ color: 0x3a3024, alpha: 0.12 });
    const bake = new Container();
    const water = new Graphics();
    drawAtlasWaterRings(water, r);
    water.y = depth * 0.76;
    const underside = new Graphics();
    drawAtlasUnderside(underside, r, depth, o.domain, o.dormant);
    const settlement = new Graphics();
    drawAtlasSettlement(settlement, o, r);
    const navigationAnchor = new Graphics();
    if ((o.role ?? 'anchor') === 'anchor') drawNavigationAnchor(navigationAnchor, r, o.domain);
    if (tideGlow) bake.addChild(tideGlow);
    bake.addChild(shadow, water, underside, gfx, navigationAnchor, settlement);
    // T2 richness: "resolved → lighthouse" — flies the SAME landmark the SVG
    // L0 already draws for `status: 'resolved'` (IslandFingerprint.tsx), baked
    // above the coastline so it costs nothing per-frame.
    if (o.status === 'resolved') {
      const lh = new Graphics();
      drawLighthouseGfx(lh, r * 0.3, -r * 0.62 - 6, 0.85);
      bake.addChild(lh);
    }
    const texture = app.renderer.generateTexture({ target: bake, resolution: 2 });
    bake.destroy({ children: true });
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 0.5);
    sprite.x = o.x;
    sprite.y = projectIslandY(o);
    sprite.zIndex = sprite.y + ALTITUDE_INDEX[band] * 0.01;
    // T2 richness: "dormancy fade" — a boolean `dormant` is all the client has
    // (no exact recency days), so the honest transcription is a flat dampened
    // alpha (on top of the existing grey fill) rather than a fabricated
    // continuous fade.
    sprite.alpha = o.dormant ? 0.68 : 1;
    sprite.eventMode = 'static';
    sprite.cursor = 'pointer';
    // Camera-continuity (W5 goal 1b): ease the camera toward the tapped island
    // BEFORE firing `onPick`, so the drill-down reads as one continuous zoom
    // (T0/T1→T2) instead of a hard cut into the existing sail→wipe (App.tsx).
    sprite.on('pointertap', () => { if (!this.moved) this.activateIsland(o); });
    sprite.on('pointerover', () => this.onHover?.(o.slug));
    sprite.on('pointerout', () => this.onHover?.(null));
    this.islandLayer.addChild(sprite);

    let glow: Graphics | undefined;
    if (o.outlier) {
      // variance-select outlier: a soft double-ring glow that floats it above the
      // bulk at EVERY tier (INFO-HIERARCHY §2 — outliers never fold into a cluster).
      glow = new Graphics()
        .circle(o.x, projectIslandY(o), r + 22).fill({ color: 0xe3a93c, alpha: 0.1 })
        .circle(o.x, projectIslandY(o), r + 10).fill({ color: 0xe3a93c, alpha: 0.14 });
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

    return { o, sprite, glow, labelGroup: group, labelText, labelSub, labelBg, dot, halfW: 0, halfH: 0, showingTier: '', band, reveal: (o.role ?? 'anchor') === 'satellite' ? 0 : 1, fogDim: 1 };
  }

  private buildClusters(): void {
    for (const c of this.clusters) {
      const bands = c.islandSlugs.map((slug) => this.altitudeBySlug.get(slug) ?? 'middle');
      const meanBand = bands.reduce((sum, band) => sum + ALTITUDE_INDEX[band], 0) / Math.max(1, bands.length);
      const band: AtlasAltitudeBand = meanBand < 0.67 ? 'low' : meanBand > 1.33 ? 'high' : 'middle';
      const cy = projectAtlasY(c.center.y, band);
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
        blob.ellipse(c.center.x, cy, rr, rr * 0.64).fill({ color: c.tint, alpha });
      }
      // Wayfinding (W5 §5 acceptance: "≤3 zoom levels" world→region→island):
      // tapping a region at far tier flies the camera toward it, landing in
      // the mid tier where its member islands read individually — a region
      // is not itself pickable content (no `onPick`), just a drill-down step.
      blob.eventMode = 'static';
      blob.cursor = 'pointer';
      blob.on('pointertap', () => { if (!this.moved) this.flyToRegion(c, band); });
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
      // Extra left inset makes room for the domain bullet so the text never
      // crowds it.
      const halfW = contentW / 2 + 20;
      const halfH = contentH / 2 + 6;
      // Chip stays a soft rounded wash (subtle tint edge, not a hard region
      // border). A domain-ink spine down the left and a bullet at its head give
      // each region its climate's colour — a cartographic legend mark, so the
      // chips stop reading as one uniform SaaS card grid.
      bg.roundRect(-halfW, -halfH, halfW * 2, halfH * 2, 9).fill({ color: 0xfbf6ea, alpha: 0.9 }).stroke({ color: c.tint, width: 1, alpha: 0.5 });
      bg.roundRect(-halfW, -halfH, 4, halfH * 2, 2).fill({ color: c.tint, alpha: 0.85 });
      bg.circle(-halfW + 11, 0, 3.4).fill({ color: c.tint, alpha: 0.92 });
      // Nudge the text right of the bullet (group is centred on the anchor).
      text.x = 8;
      if (captionText) captionText.x = 8;
      if (captionText) {
        text.y = -captionText.height / 2 - 1;
        captionText.y = text.height / 2 + 1;
      }
      group.addChild(bg, text);
      if (captionText) group.addChild(captionText);
      this.clusterLabelLayer.addChild(group);
      this.clusterLabels.push({ c, band, group, halfW, halfH });
    }
  }

  // ─── Climate territories (far tier, lane W2) ─────────────────────────────────

  /**
   * Ingest the far-tier climate field: 4 named domain territories (soft
   * watercolor washes), inter-territory currents (cross-domain relations), and a
   * fog grid over the unexplored edges. All three are a `reduce` over data
   * (`core.projectClimate`/`projectContinentCurrents`) — this stage only draws
   * them. Call AFTER {@link setIslands}. Every argument is optional-empty so an
   * empty field renders nothing (data-honest: no data → no wash).
   */
  setClimate(continents: AtlasContinent[], fog: AtlasFogCell[] = [], flows: AtlasFlow[] = [], currents: AtlasCurrent[] = []): void {
    if (!this.app) return;
    this.continents = continents;
    this.fogCells = fog;
    this.flows = flows;
    this.currents = currents;
    this.buildContinents();
    this.buildLocalRoutes();
    this.requestFrame(true);
  }

  /** Chart-space anchor for a territory's name — biased outward from its centroid
   * toward its manifold corner so the 4 names spread apart, not pile at centre. */
  private continentLabelAt(c: AtlasContinent): { x: number; y: number } {
    const bx = (c.manifold[0] - 0.5) * 2; // −1..1 (formal→empirical)
    const by = (c.manifold[1] - 0.5) * 2; // −1..1 (physical→living)
    // Bias the name hard out toward the territory's manifold corner so the 4
    // names ring the map's OUTER frame, well clear of the central region-pin
    // pile (a firmer push than before — the watermark reads as a cartouche in
    // the margin, not a label competing with the chips). A constant floor keeps
    // even a small-extent territory's name pushed clear.
    // Strong horizontal push (names ring the left/right frame), but a GENTLE
    // vertical one: the ATLAS_Y_SPREAD stretch already separates the territories
    // top-to-bottom, so a big vertical bias here compounds with it and flings the
    // names into the masthead / bottom chrome. Keep them inside the content band.
    const ox = bx * (c.extent.x * 0.98 + 60);
    const oy = by * (c.extent.y * 0.32 + 12);
    return { x: c.center.x + ox, y: c.center.y + oy };
  }

  private continentBand(c: AtlasContinent): AtlasAltitudeBand {
    const members = this.islands.filter((node) => node.o.domain === c.domain);
    if (members.length === 0) return 'middle';
    const mean = members.reduce((sum, node) => sum + ALTITUDE_INDEX[node.band], 0) / members.length;
    return mean < 0.67 ? 'low' : mean > 1.33 ? 'high' : 'middle';
  }

  private buildContinents(): void {
    this.terrainLayer.removeChildren().forEach((c) => c.destroy());
    this.continentLayer.removeChildren().forEach((c) => c.destroy());
    this.routeLayer.removeChildren().forEach((c) => c.destroy());
    this.localRouteLayer.removeChildren().forEach((c) => c.destroy());
    this.currentRoutes = [];
    this.cloudBackLayer.removeChildren().forEach((c) => c.destroy());
    this.cloudFrontLayer.removeChildren().forEach((c) => c.destroy());
    this.continentLabelLayer.removeChildren().forEach((c) => c.destroy());
    this.continentLabels = [];

    const byDomain = new Map<AtlasDomain, AtlasContinent>();
    for (const c of this.continents) byDomain.set(c.domain, c);

    // Long-sightline topography: nested contour arcs and a few large triangular
    // ridges derived from each territory's actual extent. They guide the eye
    // toward populated basins like an open-world horizon, but remain ambient
    // paper marks rather than clickable/invented geography.
    const topo = new Graphics();
    for (const c of this.continents) {
      const band = this.continentBand(c);
      const cy = projectAtlasY(c.center.y, band);
      for (let ring = 0; ring < 3; ring++) {
        const rx = c.extent.x * (0.62 + ring * 0.22);
        const ry = c.extent.y * ATLAS_Y_TILT * (0.3 + ring * 0.13);
        topo.ellipse(c.center.x, cy + c.extent.y * 0.05, rx, ry)
          .stroke({ color: c.ink, width: 1.1, alpha: 0.08 + ring * 0.018 });
      }
      const dir = c.manifold[1] < 0.5 ? -1 : 1;
      const ridgeY = cy + dir * c.extent.y * ATLAS_Y_TILT * 0.74;
      const w = c.extent.x * 0.7;
      topo.moveTo(c.center.x - w, ridgeY)
        .lineTo(c.center.x - w * 0.42, ridgeY - 32 * dir)
        .lineTo(c.center.x - w * 0.06, ridgeY - 8 * dir)
        .lineTo(c.center.x + w * 0.26, ridgeY - 44 * dir)
        .lineTo(c.center.x + w, ridgeY)
        .stroke({ color: c.ink, width: 1.2, alpha: 0.11 });
    }
    this.terrainLayer.addChild(topo);

    // 1. Territory washes — soft watercolor: nested low-alpha ellipses build a
    //    feathered edge (界画式海图 language), NEVER a polygon coastline.
    for (const c of this.continents) {
      const wash = new Graphics();
      const band = this.continentBand(c);
      const cy = projectAtlasY(c.center.y, band);
      const rings = 6;
      for (let k = rings; k >= 1; k--) {
        const f = k / rings; // 1 = outermost, → inner
        const rx = c.extent.x * (0.42 + 0.78 * f);
        const ry = c.extent.y * (0.42 + 0.78 * f);
        wash.ellipse(c.center.x, cy, rx, ry * ATLAS_Y_TILT * 0.72).fill({ color: c.tint, alpha: 0.075 });
      }
      // Wayfinding (W5 §5 acceptance): tapping a continent nudges the camera
      // toward its regions (mirrors the region-tap below, one step earlier in
      // the world→region→island drill). Washes overlap heavily for a small
      // curated dataset, so whichever territory is topmost under the tap wins
      // — an acceptable ambiguity for a "nudge inward", not a precise pick.
      wash.eventMode = 'static';
      wash.cursor = 'pointer';
      wash.on('pointertap', () => { if (!this.moved) this.flyToPoint(c.center.x, cy, this.midFarTargetScale()); });
      this.continentLayer.addChild(wash);
    }

    // 2. Inter-territory currents — a bowed flowline between two territory
    //    centres, coloured by relation kind, width by weight (invariant 14).
    for (const fl of this.flows) {
      const a = byDomain.get(fl.from);
      const b = byDomain.get(fl.to);
      if (!a || !b) continue;
      const ay = projectAtlasY(a.center.y, this.continentBand(a));
      const by = projectAtlasY(b.center.y, this.continentBand(b));
      const width = Math.min(16, 3.5 + Math.sqrt(Math.max(0, fl.weight)) * 2.4);
      const dx = b.center.x - a.center.x;
      const dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const bow = Math.min(150, len * 0.15);
      const mx = (a.center.x + b.center.x) / 2 + nx * bow;
      const my = (ay + by) / 2 + ny * bow - 18;
      const line = new Graphics();
      line.moveTo(a.center.x, ay).quadraticCurveTo(mx, my, b.center.x, by);
      line.stroke({ color: 0xf8f1de, width: width + 4, alpha: 0.52, cap: 'round', join: 'round' });
      line.moveTo(a.center.x, ay).quadraticCurveTo(mx, my, b.center.x, by);
      line.stroke({ color: fl.tint, width: Math.max(1.4, width * 0.42), alpha: 0.68, cap: 'round', join: 'round' });
      // Three wind knots make direction and elevation legible without HUD arrows.
      for (let knot = 1; knot <= 3; knot++) {
        const t = knot / 4;
        const u = 1 - t;
        const kx = u * u * a.center.x + 2 * u * t * mx + t * t * b.center.x;
        const ky = u * u * ay + 2 * u * t * my + t * t * by;
        line.circle(kx, ky, 2.2 + knot * 0.35).fill({ color: fl.tint, alpha: 0.8 });
      }
      this.routeLayer.addChild(line);
    }

    // Fog cells already encode explored/empty space. Reinterpreting a sparse
    // sample as cloud banks gives altitude occlusion without inventing content.
    this.fogCells.forEach((cell, index) => {
      if (cell.fog < 0.12 || index % 2 !== 0) return;
      const cx = cell.x + cell.w / 2;
      const cy = projectAtlasY(cell.y + cell.h / 2) + (index % 4 === 0 ? -34 : 44);
      const radius = cell.w * (0.34 + Math.min(0.28, cell.fog * 0.22));
      const cloud = new Graphics();
      const alpha = 0.08 + Math.min(0.12, cell.fog * 0.12);
      cloud.ellipse(cx, cy, radius, radius * 0.24).fill({ color: 0xf8f1de, alpha });
      cloud.ellipse(cx - radius * 0.38, cy - 5, radius * 0.54, radius * 0.2).fill({ color: 0xdbe4e4, alpha: alpha * 0.74 });
      cloud.ellipse(cx + radius * 0.3, cy + 3, radius * 0.48, radius * 0.17).fill({ color: 0xf8f1de, alpha: alpha * 0.82 });
      (index % 4 === 0 ? this.cloudFrontLayer : this.cloudBackLayer).addChild(cloud);
    });

    // 3. Fog — soft paper-coloured haze over the empty/unexplored cells; content
    //    cells stay clear. A FOCUS aid: alpha is capped well under 1 (never a
    //    wall), and the whole layer fades out as you zoom toward content.
    // W5 goal 2 — fog-as-focus: repainted by `redrawFog()` on every camera
    // settle (not drawn once here), so the haze re-centres on wherever the
    // camera is currently looking. A placeholder Graphics is mounted here
    // purely so `redrawFog` has an existing child to replace (see its own
    // doc comment — it destroys-and-recreates the fog Graphics every call).
    this.fogGfx = new Graphics().circle(0, 0, 1).fill({ color: 0xccd6dd, alpha: 0 });
    this.continentLayer.addChild(this.fogGfx);
    this.redrawFog();

    // 4. Territory name billboards (screen space, constant crisp size).
    for (const c of this.continents) {
      const group = new Container();
      group.eventMode = 'none';
      const text = new Text({
        text: c.name,
        style: new TextStyle({ fontFamily: "'Noto Serif SC','PingFang SC',serif", fontSize: 40, fontWeight: '700', fill: c.ink, align: 'center', letterSpacing: 10 }),
        resolution: 2,
      });
      text.anchor.set(0.5, 0.5);
      // A soft paper halo feathered behind the glyphs (nested low-alpha ellipses,
      // same 界画 wash grammar as the territories). It lets a region pin that
      // grazes the name read as a chip resting ON a watermark, not a card slicing
      // live text — the failure mode when the two label sets deconflict apart.
      const halo = new Graphics();
      const hw = text.width / 2 + 34;
      const hh = text.height / 2 + 20;
      for (let k = 3; k >= 1; k--) {
        halo.ellipse(0, 0, hw * (0.7 + k * 0.12), hh * (0.7 + k * 0.16))
          .fill({ color: 0xf5efe0, alpha: 0.12 });
      }
      // Watermark weight: a big, faint ambient territory label BEHIND the crisp
      // region pins (which occlude it where they overlap — correct z-order).
      text.alpha = 0.42;
      group.addChild(halo, text);
      this.continentLabelLayer.addChild(group);
      this.continentLabels.push({ c, group });
    }
  }

  /** Mid/near local airways. Every path is a real projected ledger current;
   * continuous altitude determines its climb/descent, so relationships become
   * traversable vertical geography instead of an overlaid network diagram. */
  private buildLocalRoutes(): void {
    this.localRouteLayer.removeChildren().forEach((child) => child.destroy());
    this.currentRoutes = [];
    const bySlug = new Map(this.islands.map((node) => [node.o.slug, node] as const));

    for (const current of this.currents) {
      const from = bySlug.get(current.fromSlug);
      const to = bySlug.get(current.toSlug);
      if (!from || !to) continue;
      const ax = from.o.x;
      const ay = projectIslandY(from.o);
      const bx = to.o.x;
      const by = projectIslandY(to.o);
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const climb = Math.abs(altitudeZOf(to.o) - altitudeZOf(from.o));
      const bow = Math.min(120, len * 0.18) + climb * 54;
      const mx = (ax + bx) / 2 + nx * bow;
      const my = (ay + by) / 2 + ny * bow - 20 - climb * 34;
      const width = Math.min(6, 1.1 + Math.sqrt(Math.max(0, current.weight)) * 0.8);
      const line = new Graphics();
      line.moveTo(ax, ay).quadraticCurveTo(mx, my, bx, by)
        .stroke({ color: 0xf8f1de, width: width + 3.2, alpha: 0.58, cap: 'round', join: 'round' });
      line.moveTo(ax, ay).quadraticCurveTo(mx, my, bx, by)
        .stroke({ color: current.tint, width, alpha: 0.8, cap: 'round', join: 'round' });

      // A few ruled wind gates give the route direction and vertical rhythm
      // without adding arrows or a sci-fi HUD.
      for (let gate = 1; gate <= 3; gate++) {
        const t = gate / 4;
        const u = 1 - t;
        const gx = u * u * ax + 2 * u * t * mx + t * t * bx;
        const gy = u * u * ay + 2 * u * t * my + t * t * by;
        const tx = 2 * u * (mx - ax) + 2 * t * (bx - mx);
        const ty = 2 * u * (my - ay) + 2 * t * (by - my);
        const tl = Math.hypot(tx, ty) || 1;
        const px = -ty / tl;
        const py = tx / tl;
        const half = 3.5 + climb * 2.5;
        line.moveTo(gx - px * half, gy - py * half).lineTo(gx + px * half, gy + py * half)
          .stroke({ color: current.tint, width: 0.9, alpha: 0.72 });
      }
      line.circle(ax, ay, 3.2).fill({ color: 0xf8f1de, alpha: 0.9 }).stroke({ color: current.tint, width: 1, alpha: 0.8 });
      line.circle(bx, by, 3.2).fill({ color: current.tint, alpha: 0.76 });
      this.localRouteLayer.addChild(line);
      this.currentRoutes.push({ current, line });
    }
  }

  /**
   * Fog-as-focus (W5 goal 2): repaint the fog so haze re-centres on the
   * camera's CURRENT look-point (screen centre, converted to world space) —
   * the focus region clears further than its data-fog value alone would give
   * it, and the periphery holds its natural data-driven haze (`focusFog`,
   * pure + unit-tested). Called once from `buildContinents` (baseline) and
   * again on every camera settle from `applyTier` — never on every
   * intermediate camera delta, so panning/zooming stays on the same cheap
   * on-demand-render budget the rest of the stage already keeps to.
   *
   * Repaints the SAME `Graphics` instance every call (`.clear()` then
   * redraw) — `buildContinents` seeds it with one draw call before it is
   * ever mounted, so `.clear()` never runs on a Graphics whose
   * GraphicsContext was never initialized. Verified stable under a 25-trial
   * automated stress test (rapid multi-cycle zoom-out/in wheel bursts, one
   * fresh page load per trial, console watched for any render-time
   * exception) — 0 failures.
   */
  private redrawFog(): void {
    if (!this.fogGfx || !this.app) return;
    this.fogGfx.clear();
    const view = this.app.screen;
    const scale = this.scale;
    const focusX = (view.width / 2 - this.worldRoot.x) / scale;
    const focusY = (view.height / 2 - this.worldRoot.y) / scale;
    // Focus radius in WORLD units scales with the visible viewport (screen
    // size / camera scale) — so "what's currently on screen" is always the
    // clearest, whether zoomed to the whole world or one island.
    const focusRadius = (Math.min(view.width, view.height) / scale) * 0.55;
    let drawn = false;
    for (const cell of this.fogCells) {
      const cx = cell.x + cell.w / 2;
      const cy = projectAtlasY(cell.y + cell.h / 2);
      const fog = focusFog(cell.fog, cx, cy, focusX, focusY, focusRadius);
      if (fog < 0.05) continue;
      // Cool distance-haze (平远/atmospheric recession): each cell is a soft
      // circle far larger than its cell, at LOW alpha — heavy overlap averages
      // the neighbours into one seamless mist (no quilted grid seams).
      const alpha = Math.min(0.2, fog * 0.2);
      this.fogGfx.ellipse(cx, cy, cell.w * 0.95, cell.w * 0.52).fill({ color: 0xccd6dd, alpha });
      drawn = true;
    }
    // Keep the Graphics non-empty even when nothing draws (e.g. the whole
    // world is currently in focus) — an empty Graphics trips Pixi v8's
    // batcher on a later render (null-batcher break).
    if (!drawn) this.fogGfx.circle(0, 0, 1).fill({ color: 0xccd6dd, alpha: 0 });
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

  /**
   * Frame the whole atlas so every island is visible on first paint, and
   * (W5 camera-framing fix) compute this dataset's zoom-OUT floor from its
   * OWN bounds (`computeWorldMinScale`) instead of a fixed constant. Before
   * this fix, a small curated set (~26 islands, a tight bbox) fit the screen
   * nicely at scale≈1 on open, but the camera could still zoom out to an
   * unrelated fixed floor (0.18) — shrinking that already-well-framed world
   * into a speck at screen centre ("collapses to a tiny dot"). Now the floor
   * is anchored to the data: the far/world tier always composes with content
   * filling the frame, whether there are 26 curated islands or 700 synthetic.
   */
  fitToContent(islands: AtlasIslandInput[]): void {
    if (!this.app || islands.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const o of islands) {
      minX = Math.min(minX, o.x); maxX = Math.max(maxX, o.x);
      const py = projectIslandY(o);
      minY = Math.min(minY, py); maxY = Math.max(maxY, py);
    }
    this.minScale = computeWorldMinScale(this.app.screen.width, this.app.screen.height, { minX, minY, maxX, maxY });
    const pad = 120;
    const w = maxX - minX + pad * 2;
    const h = maxY - minY + pad * 2;
    const s = Math.min(this.app.screen.width / w, this.app.screen.height / h, MAX_SCALE);
    const scale = Math.max(this.minScale, s);
    this.worldRoot.scale.set(scale);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    this.worldRoot.x = this.app.screen.width / 2 - cx * scale;
    this.worldRoot.y = this.app.screen.height / 2 - cy * scale;
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    this.touched = true;
    const rect = this.canvasEl!.getBoundingClientRect();
    this.wheelPx = e.clientX - rect.left;
    this.wheelPy = e.clientY - rect.top;
    // Trackpads fire a fine stream of small deltas; a mouse wheel fires a few
    // big notches. Scale the step to the delta magnitude so both feel like the
    // same continuous push (capped so one violent notch can't leap a whole tier).
    const mag = Math.min(1, Math.abs(e.deltaY) / 100);
    const perTick = 1 + 0.16 * mag;
    const factor = e.deltaY < 0 ? perTick : 1 / perTick;
    // reduced-motion (and the tiny-viewport test env) skip the glide.
    const reduced = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { this.zoomAt(this.wheelPx, this.wheelPy, factor); return; }
    // Accumulate onto the pending target (or the live scale if idle), then glide.
    if (this.flying) { if (this.flightRaf != null) cancelAnimationFrame(this.flightRaf); this.flying = false; }
    const base = this.wheelTarget > 0 ? this.wheelTarget : this.scale;
    this.wheelTarget = Math.max(this.minScale, Math.min(MAX_SCALE, base * factor));
    if (this.wheelRaf == null) this.wheelRaf = requestAnimationFrame(this.stepWheelZoom);
  }

  /** One eased frame of wheel zoom: move a fixed fraction of the remaining
   *  log-distance toward the target, keeping the anchored world point fixed via
   *  {@link zoomAt}. Converges fast, settles soft (never overshoots). */
  private stepWheelZoom = (): void => {
    this.wheelRaf = null;
    if (this.wheelTarget <= 0 || !this.app) return;
    const remaining = Math.log(this.wheelTarget / this.scale);
    if (Math.abs(remaining) < 0.006) {
      // Snap the last sliver so we land exactly on target, then idle.
      this.zoomAt(this.wheelPx, this.wheelPy, this.wheelTarget / this.scale);
      this.wheelTarget = 0;
      return;
    }
    const stepRatio = Math.exp(remaining * 0.28); // ease-out: 28% of the gap/frame
    this.zoomAt(this.wheelPx, this.wheelPy, stepRatio);
    this.wheelRaf = requestAnimationFrame(this.stepWheelZoom);
  };

  /** Zoom by `factor` keeping the world point under `(px,py)` screen-fixed. */
  zoomAt(px: number, py: number, factor: number): void {
    const old = this.scale;
    const next = Math.max(this.minScale, Math.min(MAX_SCALE, old * factor));
    if (next === old) return;
    const wx = (px - this.worldRoot.x) / old;
    const wy = (py - this.worldRoot.y) / old;
    this.worldRoot.scale.set(next);
    this.worldRoot.x = px - wx * next;
    this.worldRoot.y = py - wy * next;
    this.onCameraChange();
  }

  /** Public instrument controls used by the React chart chrome. */
  zoomBy(factor: number): void {
    if (!this.app) return;
    this.touched = true;
    this.zoomAt(this.app.screen.width / 2, this.app.screen.height / 2, factor);
  }

  resetView(): void {
    if (!this.app) return;
    this.fitToContent(this.islands.map((node) => node.o));
    this.requestFrame(true);
  }

  enter(slug: string): void {
    const node = this.islands.find((candidate) => candidate.o.slug === slug);
    if (node) this.flyToIsland(node.o);
  }

  focusDomain(domain: AtlasDomain | null): void {
    this.domainFocus = domain;
    this.requestFrame(true);
  }

  focusAltitude(band: AtlasAltitudeBand | null): void {
    this.altitudeFocus = band;
    this.requestFrame(true);
  }

  // ─── My Harbor 我的港湾 (depth-plan-v1 §3(d)) ────────────────────────────────

  /** Set the actor's harbor: home slugs + per-island fog levels (computed by
   * the host from core `fogLevel`). PURELY a focus dim — fog never hides an
   * island and never leaves hit-testing ("a filter, not a wall" — invariant
   * 4). `null` clears (logged out / no footprint → the plain world). */
  setHarbor(harbor: { slugs: readonly string[]; fog: ReadonlyMap<string, number> } | null): void {
    this.harborSlugs = new Set(harbor?.slugs ?? []);
    this.harborFog = harbor ? new Map(harbor.fog) : new Map();
    this.requestFrame(true);
  }

  /** World-space centroid of the harbor islands (projected plane), or null. */
  private harborCenter(): { x: number; y: number } | null {
    const nodes = this.islands.filter((node) => this.harborSlugs.has(node.o.slug));
    if (nodes.length === 0) return null;
    let x = 0;
    let y = 0;
    for (const node of nodes) {
      x += node.o.x;
      y += projectIslandY(node.o);
    }
    return { x: x / nodes.length, y: y / nodes.length };
  }

  /** A scale that reads as "home waters": solidly mid tier, so the harbor
   * islands carry their names without collapsing to one isle's close-up.
   * When home includes a SATELLITE, land past the anchor-first disclosure
   * threshold instead — your own island must actually be visible on open. */
  private harborScale(): number {
    const hasSatellite = this.islands.some(
      (node) => this.harborSlugs.has(node.o.slug) && (node.o.role ?? 'anchor') === 'satellite',
    );
    return Math.max(this.minScale, Math.min(MAX_SCALE, hasSatellite ? 2.3 : 1.15));
  }

  /** Compose the FIRST paint at the harbor instead of the whole ocean (§3(d)
   * "you do not cold-open the 700-island ocean"). No flight — this is the
   * opening composition, not a navigation. Empty harbor → keeps the world
   * framing: you lose only the gentle entry, never any island (removal test). */
  openAtHarbor(): void {
    if (!this.app) return;
    const center = this.harborCenter();
    if (!center) return;
    const scale = this.harborScale();
    this.worldRoot.scale.set(scale);
    this.worldRoot.x = this.app.screen.width / 2 - center.x * scale;
    this.worldRoot.y = this.app.screen.height / 2 - center.y * scale;
    this.requestFrame(true);
  }

  /** Sail home (chrome control): ease the camera back to the harbor. No-op
   * without a harbor, so the control can be wired unconditionally. */
  returnToHarbor(): void {
    const center = this.harborCenter();
    if (center) this.flyToPoint(center.x, center.y, this.harborScale());
  }

  // ─── Structure lens 结构透镜 (执行纲要 §九) ──────────────────────────────────

  /**
   * Enter/leave the structure lens — a MODAL focus over the same world: islands
   * where the selected structure was rebuilt light up (outlier-glow vocabulary)
   * with bridge-tint arcs between them; the near gaps carry an honest dashed
   * halo (sea-current dash, proposed opacity — "此结构尚无人带来", never a
   * suggested mapping); everything else dims through the fog channel. Air
   * routes hide while the lens is on so the bridge arcs are the only spans in
   * view. `null` restores the plain world exactly.
   */
  setStructureLens(lens: AtlasStructureLensInput | null): void {
    this.structureLens = lens;
    this.lensRebuilt = new Set(lens?.rebuiltSlugs ?? []);
    this.lensGaps = new Set(lens?.gapSlugs ?? []);
    this.buildLensLayer();
    this.requestFrame(true);
    // Frame the lens: selecting a structure flies the camera to its REBUILT
    // islands (the lens' headline) — same ease vocabulary as a region tap.
    // A pure frontier (0 rebuilt) moves nothing: there is nothing to frame,
    // the dimmed whole-sea IS the honest picture.
    if (lens) this.flyToLensMembers();
  }

  /** Ease the camera to frame the rebuilt islands of the active lens. One
   * island lands at the harbor's mid-tier scale; several fit their bbox. */
  private flyToLensMembers(): void {
    if (!this.app) return;
    const nodes = this.islands.filter((node) => this.lensRebuilt.has(node.o.slug));
    if (nodes.length === 0) return;
    // Switching lenses mid-flight retargets instead of silently skipping.
    if (this.flightRaf != null) { cancelAnimationFrame(this.flightRaf); this.flightRaf = null; }
    this.flying = false;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const node of nodes) {
      const y = projectIslandY(node.o);
      minX = Math.min(minX, node.o.x); maxX = Math.max(maxX, node.o.x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const pad = 170;
    const fit = Math.min(
      this.app.screen.width / (maxX - minX + pad * 2),
      this.app.screen.height / (maxY - minY + pad * 2),
    );
    // One island reads at the harbor's "home waters" scale; a spread fits its
    // bbox but never lands closer than mid tier or further than the world floor.
    const scale = nodes.length === 1 ? Math.max(this.minScale, Math.min(MAX_SCALE, 1.15)) : Math.max(this.minScale, Math.min(1.4, fit));
    this.flyToPoint(cx, cy, scale);
  }

  /** Rebuild the lens marks from the CURRENT island nodes (world space). All
   * geometry is existing vocabulary: outlier double-ring glow for rebuilt,
   * dashed halo for gaps, air-route bow + wind gates for arcs. */
  private buildLensLayer(): void {
    this.lensLayer.removeChildren().forEach((c) => c.destroy());
    const lens = this.structureLens;
    if (!lens) return;
    const bySlug = new Map(this.islands.map((node) => [node.o.slug, node] as const));
    const g = new Graphics();

    // Bridge arcs between rebuilt islands — the SAME bow + paper casing + wind
    // gates as `buildLocalRoutes`, in the bridge/ochre tint (a rebuild is a
    // human bridging act). Every arc is backed by rebuild events (inv 14).
    for (const arc of lens.arcs) {
      const from = bySlug.get(arc.fromSlug);
      const to = bySlug.get(arc.toSlug);
      if (!from || !to) continue;
      const ax = from.o.x;
      const ay = projectIslandY(from.o);
      const bx = to.o.x;
      const by = projectIslandY(to.o);
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const climb = Math.abs(altitudeZOf(to.o) - altitudeZOf(from.o));
      const bow = Math.min(120, len * 0.18) + climb * 54;
      const mx = (ax + bx) / 2 + nx * bow;
      const my = (ay + by) / 2 + ny * bow - 20 - climb * 34;
      g.moveTo(ax, ay).quadraticCurveTo(mx, my, bx, by)
        .stroke({ color: 0xf8f1de, width: 5.6, alpha: 0.58, cap: 'round', join: 'round' });
      g.moveTo(ax, ay).quadraticCurveTo(mx, my, bx, by)
        .stroke({ color: LENS_ARC_TINT, width: 2.4, alpha: 0.85, cap: 'round', join: 'round' });
      for (let gate = 1; gate <= 3; gate++) {
        const t = gate / 4;
        const u = 1 - t;
        const gx = u * u * ax + 2 * u * t * mx + t * t * bx;
        const gy = u * u * ay + 2 * u * t * my + t * t * by;
        const tx = 2 * u * (mx - ax) + 2 * t * (bx - mx);
        const ty = 2 * u * (my - ay) + 2 * t * (by - my);
        const tl = Math.hypot(tx, ty) || 1;
        const half = 3.5 + climb * 2.5;
        g.moveTo(gx - (-ty / tl) * half, gy - (tx / tl) * half)
          .lineTo(gx + (-ty / tl) * half, gy + (tx / tl) * half)
          .stroke({ color: LENS_ARC_TINT, width: 0.9, alpha: 0.72 });
      }
      g.circle(ax, ay, 3.2).fill({ color: 0xf8f1de, alpha: 0.9 }).stroke({ color: LENS_ARC_TINT, width: 1, alpha: 0.8 });
      g.circle(bx, by, 3.2).fill({ color: LENS_ARC_TINT, alpha: 0.76 });
    }

    for (const node of this.islands) {
      const o = node.o;
      const r = ATLAS_STAGE_RADIUS[Math.max(0, Math.min(3, o.stage)) as 0 | 1 | 2 | 3];
      const x = o.x;
      const y = projectIslandY(o);
      if (this.lensRebuilt.has(o.slug)) {
        // rebuilt → the outlier double-ring glow, verbatim proportions.
        g.circle(x, y, r + 22).fill({ color: LENS_GLOW_TINT, alpha: 0.1 });
        g.circle(x, y, r + 10).fill({ color: LENS_GLOW_TINT, alpha: 0.14 });
      } else if (this.lensGaps.has(o.slug)) {
        // gap → dashed halo (sea-current dash `7 5`, proposed opacity 0.5).
        // Position only — the halo states "no edge here", nothing more (§九).
        traceDashedCircle(g, x, y, r + 14);
        g.stroke({ color: LENS_ARC_TINT, width: 1.4, alpha: 0.5 });
      }
    }
    this.lensLayer.addChild(g);
  }

  /** Current screen-space anchor for React hover cards and verification. */
  screenPoint(slug: string): { x: number; y: number } | null {
    const node = this.islands.find((candidate) => candidate.o.slug === slug);
    if (!node) return null;
    return {
      x: node.o.x * this.scale + this.worldRoot.x,
      y: projectIslandY(node.o) * this.scale + this.worldRoot.y,
    };
  }

  resize(width: number, height: number): void {
    if (!this.app || width < 1 || height < 1) return;
    this.app.renderer.resize(width, height);
    this.resetView();
    // Keep the harbor opening composition through the boot-time
    // ResizeObserver tick (observe() fires once immediately) and honest
    // window resizes alike — but never wrestle a camera the visitor has
    // already taken over. No-op without a harbor.
    if (!this.touched) this.openAtHarbor();
  }

  // ─── Camera continuity (W5 goal 1b + §5 wayfinding) ─────────────────────────
  //
  // A tapped island/region/continent eases the camera toward it instead of
  // hard-cutting, so world→region→island reads as ONE continuous drill-down
  // (atlas-world-plan.md §2's "一台相机,一段连续缩放"). `reduced-motion`
  // collapses the journey to a quick settle rather than skipping it outright
  // (mirrors `rituals.ts`'s identical convention: never zero feedback).

  /** A comfortable "you can see this island clearly" scale — always solidly
   *  in the near tier (`TIER_MID_MAX` is 1.7), converging further if the
   *  camera is already close rather than zooming back out to a fixed value. */
  private nearTargetScale(): number {
    return Math.max(2.2, Math.min(MAX_SCALE, this.scale * 1.8));
  }

  /** A scale that lands solidly in the mid tier — enough to reveal a region's
   *  member islands with names, one step short of a single island's near-tier
   *  full readout. */
  private midFarTargetScale(): number {
    return Math.max(1.1, Math.min(MAX_SCALE, this.scale * 2.2));
  }

  /** Ease the camera to centre `(x,y)` at `targetScale`, then invoke
   *  `onArrived` (used to defer `onPick` until the zoom actually reads as
   *  "arrived" — the camera-continuity handoff into App.tsx's sail→wipe). */
  private flyToPoint(x: number, y: number, targetScale: number, onArrived?: () => void): void {
    if (this.flying || !this.app) return;
    const reduced = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 140 : 420;
    const startScale = this.scale;
    const startX = this.worldRoot.x;
    const startY = this.worldRoot.y;
    const view = this.app.screen;
    const endX = view.width / 2 - x * targetScale;
    const endY = view.height / 2 - y * targetScale;
    this.flying = true;
    const t0 = performance.now();
    const step = (now: number): void => {
      const t = Math.min(1, (now - t0) / duration);
      const e = 1 - Math.pow(1 - t, 3); // easeOutCubic — settles rather than stopping dead
      this.worldRoot.scale.set(startScale + (targetScale - startScale) * e);
      this.worldRoot.x = startX + (endX - startX) * e;
      this.worldRoot.y = startY + (endY - startY) * e;
      this.applyTier(t >= 1);
      if (t < 1) {
        this.flightRaf = requestAnimationFrame(step);
      } else {
        this.flying = false;
        this.flightRaf = null;
        onArrived?.();
      }
    };
    this.flightRaf = requestAnimationFrame(step);
  }

  /** Tapped an island: fly to it, THEN fire `onPick` — the camera converges
   *  on the island (T0/T1→T2) right before the existing sail→wipe (T2→T3)
   *  takes over, reading as one continuous drill-down instead of a hard cut. */
  private flyToIsland(o: AtlasIslandInput): void {
    this.flyToPoint(o.x, projectIslandY(o), this.nearTargetScale(), () => this.onPick?.(o.slug));
  }

  /** A mid-tier anchor tap first opens its satellite neighborhood. Search and
   * already-near taps still land directly, so exploration gains one meaningful
   * reveal without making known destinations slower to reach. */
  private activateIsland(o: AtlasIslandInput): void {
    if ((o.role ?? 'anchor') === 'anchor' && this.scale < 1.72) {
      this.flyToPoint(o.x, projectIslandY(o), this.nearTargetScale());
      return;
    }
    this.flyToIsland(o);
  }

  /** Tapped a region (or continent): fly toward its centre, landing in the
   *  mid tier so its member islands read individually — a pure drill-down
   *  step, no `onPick` (a region isn't itself pickable content). */
  private flyToRegion(c: AtlasCluster, band: AtlasAltitudeBand): void {
    this.flyToPoint(c.center.x, projectAtlasY(c.center.y, band), this.midFarTargetScale());
  }

  private onPointerDown(e: PointerEvent): void {
    this.dragging = true;
    this.touched = true;
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
    this.requestFrame(false);
    this.scheduleSettle();
  }

  private scheduleSettle(): void {
    if (this.settleTimer) clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => {
      this.settleTimer = null;
      this.requestFrame(true); // full re-layout incl. label de-collision
    }, 110);
  }

  /**
   * Coalesce `applyTier`/`app.render()` to AT MOST once per animation frame.
   * A high-frequency input burst (a fast trackpad fires many `wheel` events;
   * a fast drag fires many `pointermove`s) used to call `redraw()` — a full,
   * synchronous WebGL `app.render()` — once per DOM event, with zero
   * yielding between calls. Only the last render before the compositor
   * paints is ever visible, so every earlier one in the same frame was
   * wasted work; worse, back-to-back synchronous `render()` calls with no
   * yield could leave Pixi v8's batcher in a broken state (repeated
   * "Cannot read properties of null" errors from `BatcherPipe`/
   * `DefaultBatcher`, observed reproducibly under a rapid synthetic wheel
   * burst). Batching every request in the same frame into one `applyTier`
   * call — using the STRONGEST requested `reflow` — removes the re-entrant
   * render pattern entirely while keeping the same "still updates within
   * the current frame" responsiveness (§7 on-demand render discipline).
   */
  private requestFrame(reflow: boolean): void {
    this.pendingReflow = this.pendingReflow || reflow;
    if (this.frameScheduled) return;
    this.frameScheduled = true;
    requestAnimationFrame(() => {
      this.frameScheduled = false;
      const r = this.pendingReflow;
      this.pendingReflow = false;
      this.applyTier(r);
    });
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
    // Climate territories (washes + currents + fog) are the FAR/world tier — they
    // read strongest at overview and dissolve as you zoom toward content, so the
    // fog lifts and the washes never fight the mid/near island detail.
    this.continentLayer.alpha = blend.far;
    this.terrainLayer.alpha = Math.max(blend.far * 0.95, blend.mid * 0.24);
    // Routes recede at the world tier: with only a handful of cross-domain
    // currents in the whole atlas, a single arc at full strength reads as a
    // stray pen stroke over the overview. Keep them a faint ambient hint at far
    // and let them gain body at mid/near, where enough are in frame that they
    // mean "sail between these" instead of floating alone.
    // Structure lens (§九): while a lens is on, the ordinary air routes hide so
    // the bridge arcs are the only spans in view, the lens layer carries its
    // marks at every tier, and the island layer keeps a floor so lit/dashed
    // islands stay readable even at the world tier (their dimmed neighbours
    // recede through the fog channel below).
    const lensActive = this.structureLens !== null;
    this.lensLayer.visible = lensActive;
    this.lensLayer.alpha = lensActive ? Math.max(blend.far * 0.85, blend.mid, blend.near) : 0;
    this.routeLayer.alpha = lensActive ? 0 : Math.max(blend.far * 0.28, blend.mid * 0.34);
    this.localRouteLayer.alpha = lensActive ? 0 : Math.max(blend.far * 0.06, blend.mid * 0.44, blend.near * 0.58);
    this.cloudBackLayer.alpha = Math.max(blend.far * 0.82, blend.mid * 0.46, blend.near * 0.18);
    this.cloudFrontLayer.alpha = Math.max(blend.far * 0.54, blend.mid * 0.3, blend.near * 0.08);
    // Territory NAMES fade faster than their washes (crisp only at true far zoom).
    // With a lens on, name chips recede too (same fog discipline as the isles):
    // the lens marks are the figure, the geography stays a quiet ground.
    this.continentLabelLayer.alpha = blend.far * blend.far * (lensActive ? 0.4 : 1);
    this.clusterLayer.alpha = blend.far;
    this.clusterLabelLayer.alpha = blend.far * (lensActive ? 0.35 : 1);
    this.islandLayer.alpha = lensActive ? Math.max(blend.mid, blend.near, 0.9) : Math.max(blend.mid, blend.near);
    // outlier glow floats at every tier, but strongest at far (it IS the overview signal).
    this.glowLayer.alpha = Math.max(0.55, blend.far);

    // Territory name billboards (screen space, constant size) — anchored outward
    // toward each domain's manifold corner so the 4 names spread, not pile up.
    const continentLabelsVisible = this.continentLabelLayer.alpha > 0.02;
    for (const { c, group } of this.continentLabels) {
      const at = this.continentLabelAt(c);
      const sx = at.x * scale + this.worldRoot.x;
      const sy = projectAtlasY(at.y, this.continentBand(c)) * scale + this.worldRoot.y;
      group.x = Math.round(sx);
      group.y = Math.round(sy);
      group.visible = continentLabelsVisible && sx > -400 && sx < view.width + 400 && sy > -200 && sy < view.height + 200;
    }

    // Region name billboards (screen space, constant size). Position always;
    // de-collide so a crowd of ~30–50 regions never overlaps into mush — an
    // overlapping label is simply HIDDEN (the soft wash already marks the region),
    // a discrete label/no-label outcome, not a "bigger = better" rank. Priority is
    // member count purely as display disambiguation (which name survives a crowd),
    // the same discipline as island billboards (see deconflictLabels).
    const farVisible = blend.far > 0.02;
    const clusterBoxes: LabelBox[] = [];
    for (const { c, band, group, halfW, halfH } of this.clusterLabels) {
      const sx = c.center.x * scale + this.worldRoot.x;
      const sy = projectAtlasY(c.center.y, band) * scale + this.worldRoot.y;
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
      const verdict = deconflictLabels(clusterBoxes, 96, { pad: 10 });
      for (const { c, group } of this.clusterLabels) {
        group.visible = verdict.get(c.id) === 'label';
      }
    }

    const labelsVisible = blend.mid + blend.near > 0.02;
    const satelliteAlpha = satelliteReveal(scale);
    const satelliteCount = this.islands.filter((node) => (node.o.role ?? 'anchor') === 'satellite').length;
    // Anchor screen positions first: each satellite's disclosure is scoped by
    // where its OWN archipelago's anchor sits in the viewport — you disclose
    // the archipelago you sail INTO, not every archipelago sharing the screen.
    const anchorScreen = new Map<string, { sx: number; sy: number }>();
    for (const nd of this.islands) {
      if ((nd.o.role ?? 'anchor') !== 'satellite') {
        anchorScreen.set(nd.o.slug, { sx: nd.o.x * scale + this.worldRoot.x, sy: projectIslandY(nd.o) * scale + this.worldRoot.y });
      }
    }
    let onScreen = 0;
    let visibleSatellites = 0;
    const boxes: LabelBox[] = [];
    for (const nd of this.islands) {
      const o = nd.o;
      const parent = (o.role ?? 'anchor') === 'satellite' && o.parentSlug ? anchorScreen.get(o.parentSlug) : undefined;
      // Lens members (rebuilt or gap) are the lens' whole point — they stay
      // disclosed at every camera, satellites included, while the lens is on.
      const lensMember = lensActive && (this.lensRebuilt.has(o.slug) || this.lensGaps.has(o.slug));
      const hierarchyAlpha = lensMember
        ? 1
        : (o.role ?? 'anchor') === 'satellite'
          ? (parent ? satelliteDisclosure(scale, parent.sx, parent.sy, view.width, view.height) : satelliteAlpha)
          : 1;
      nd.reveal = hierarchyAlpha;
      // My Harbor fog (§3(d)): far-from-harbor islands read dimmer at the
      // overview, and the fog lifts as you sail near (blend.near → 1) — the
      // fog answers the overview question "where is home", never the close
      // read. Dim floors at 0.45 and hit-testing is untouched: a focus
      // filter, not a wall (invariant 4).
      const harborFog = this.harborFog.get(o.slug) ?? 0;
      nd.fogDim = 1 - harborFog * 0.55 * (1 - blend.near);
      // Structure lens dim rides the SAME fog channel (a filter, not a wall —
      // invariant 4): islands outside the lens recede to the harbor-fog floor,
      // hit-testing untouched. Lens members stay at full ink.
      if (lensActive && !lensMember) nd.fogDim *= LENS_DIM_FLOOR;
      const domainVisible = !this.domainFocus || o.domain === this.domainFocus;
      const altitudeVisible = !this.altitudeFocus || nd.band === this.altitudeFocus;
      const focusVisible = domainVisible && altitudeVisible;
      const sx = o.x * scale + this.worldRoot.x;
      const r = ATLAS_STAGE_RADIUS[Math.max(0, Math.min(3, o.stage)) as 0 | 1 | 2 | 3];
      const sy = projectIslandY(o) * scale + this.worldRoot.y;
      const vis = sx > -80 && sx < view.width + 80 && sy > -80 && sy < view.height + 80;
      // Sprite culling: hide when off-screen or when the island layer is invisible (far tier).
      nd.sprite.visible = vis && focusVisible && hierarchyAlpha > 0.02 && this.islandLayer.alpha > 0.02;
      nd.sprite.eventMode = hierarchyAlpha > 0.24 ? 'static' : 'none';
      nd.sprite.alpha = (o.dormant ? 0.68 : 1) * hierarchyAlpha * nd.fogDim;
      if (nd.glow) nd.glow.visible = vis && focusVisible && hierarchyAlpha > 0.02; // glow rides glowLayer alpha
      if (nd.glow) nd.glow.alpha = hierarchyAlpha;
      if (vis && focusVisible && hierarchyAlpha > 0.02 && this.islandLayer.alpha > 0.02) {
        onScreen++;
        if ((o.role ?? 'anchor') === 'satellite' && hierarchyAlpha > 0.24) visibleSatellites++;
      }

      // Refresh label content when the tier changes (mid = name only, near = name+subline).
      if (labelsVisible && nd.showingTier !== tier) this.setLabelContent(nd, tier);
      // Position the label above the isle (screen space, constant offset).
      const ly = sy - (r * scale + 16);
      nd.labelGroup.x = Math.round(sx);
      nd.labelGroup.y = Math.round(ly);
      nd.dot.x = Math.round(sx);
      nd.dot.y = Math.round(ly);
      if (labelsVisible && vis && focusVisible && hierarchyAlpha > 0.34) {
        // Navigation anchors keep their names when a newly disclosed satellite
        // crowds them; this is label wayfinding, never a visual size/value rank.
        const navigationPriority = (o.role ?? 'anchor') === 'anchor' ? 500 : 0;
        boxes.push({ id: o.slug, priority: islandPriority(o) + navigationPriority, sx, sy: ly, halfW: nd.halfW, halfH: nd.halfH });
      }
      else { nd.labelGroup.visible = false; nd.dot.visible = false; }
    }

    // Relation routes obey the same focus and nested-disclosure rules as their
    // endpoints. Cross-domain routes remain visible when either endpoint is in
    // the selected domain; altitude focus likewise preserves routes that touch
    // the selected stratum.
    for (const { current, line } of this.currentRoutes) {
      const from = this.islands.find((node) => node.o.slug === current.fromSlug);
      const to = this.islands.find((node) => node.o.slug === current.toSlug);
      if (!from || !to) { line.visible = false; continue; }
      const revealOf = (node: IslandNode) => node.reveal;
      const domainVisible = !this.domainFocus || from.o.domain === this.domainFocus || to.o.domain === this.domainFocus;
      const altitudeVisible = !this.altitudeFocus || from.band === this.altitudeFocus || to.band === this.altitudeFocus;
      line.visible = Math.min(revealOf(from), revealOf(to)) > 0.05 && domainVisible && altitudeVisible;
    }

    // De-collision only on settle (reflow) — the expensive-ish pass. Between
    // settles labels keep their last verdict, just translated (no flicker).
    if (labelsVisible && (reflow || this.lastLabelCount === 0)) {
      // Screen-area label budget: past it even a collision-free card demotes to
      // a dot — a comfortable page of place names, not an index of everything.
      const labelBudget = Math.max(10, Math.round((view.width * view.height) / 85000));
      const verdict = deconflictLabels(boxes, 96, { pad: 12, maxLabels: labelBudget });
      let shown = 0;
      for (const nd of this.islands) {
        const v = verdict.get(nd.o.slug);
        const onscreen = v !== undefined;
        const asLabel = v === 'label';
        nd.labelGroup.visible = onscreen && asLabel;
        nd.dot.visible = onscreen && !asLabel;
        const hierarchyAlpha = nd.reveal;
        nd.labelGroup.alpha = Math.max(blend.mid, blend.near) * hierarchyAlpha * nd.fogDim;
        nd.dot.alpha = Math.max(blend.mid, blend.near) * hierarchyAlpha * nd.fogDim;
        if (asLabel) shown++;
      }
      this.lastLabelCount = shown;
    } else if (labelsVisible) {
      // cheap path: keep prior verdicts, just re-apply tier alpha
      for (const nd of this.islands) {
        const hierarchyAlpha = nd.reveal;
        nd.labelGroup.alpha = Math.max(blend.mid, blend.near) * hierarchyAlpha * nd.fogDim;
        nd.dot.alpha = Math.max(blend.mid, blend.near) * hierarchyAlpha * nd.fogDim;
      }
    } else {
      this.lastLabelCount = 0;
    }

    // Fog-as-focus (W5 goal 2): only on settle, same cadence as label de-
    // collision above — re-centres the haze on wherever the camera stopped,
    // without paying a per-cell redraw on every intermediate drag/wheel delta.
    if (reflow && this.fogCells.length > 0) this.redrawFog();

    this.redraw();
    this.onMetrics?.({ renderMs: this.lastRenderMs, scale, tier, islands: this.islands.length, visible: onScreen, labels: this.lastLabelCount, satellites: satelliteCount, visibleSatellites });
  }

  /** Swap a label's text for the tier: mid = name only, near = name + 域·态·N·member subline
   *  (T2 richness, atlas-world-plan.md §4 lane W5 — member count is a real
   *  channel, `AtlasIslandInput.members`, appended only when the caller
   *  supplied it — never a fabricated count). */
  private setLabelContent(nd: IslandNode, tier: AtlasTier): void {
    nd.showingTier = tier;
    nd.labelText.text = nd.o.name;
    // Subline (the metadata card) is an ANCHOR read: at near tier the 主岛
    // carries the archipelago's dossier while satellites stay name-only —
    // halves the near-tier text mass, and hierarchy reads without a legend.
    if (tier === 'near' && (nd.o.role ?? 'anchor') === 'anchor') {
      const st = STAGE_LABELS[Math.max(0, Math.min(3, nd.o.stage))];
      const memberPart = nd.o.members != null ? ` · ${nd.o.members}人` : '';
      nd.labelSub.text = `${ALTITUDE_LABELS[nd.band]} · 主岛 · ${nd.o.domain} · ${st} · N${nd.o.eventCount}${memberPart}`;
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
    this.lensLayer.removeChildren().forEach((c) => c.destroy());
    this.clusterLayer.removeChildren().forEach((c) => c.destroy());
    this.routeLayer.removeChildren().forEach((c) => c.destroy());
    this.localRouteLayer.removeChildren().forEach((c) => c.destroy());
    this.cloudBackLayer.removeChildren().forEach((c) => c.destroy());
    this.cloudFrontLayer.removeChildren().forEach((c) => c.destroy());
    this.clusterLabelLayer.removeChildren().forEach((c) => c.destroy());
    this.continentLayer.removeChildren().forEach((c) => c.destroy());
    this.terrainLayer.removeChildren().forEach((c) => c.destroy());
    this.continentLabelLayer.removeChildren().forEach((c) => c.destroy());
    this.clusters = [];
    this.clusterLabels = [];
    this.continents = [];
    this.fogCells = [];
    this.flows = [];
    this.currents = [];
    this.currentRoutes = [];
    this.continentLabels = [];
    this.altitudeBySlug.clear();
    this.fogGfx = undefined;
    this.lastLabelCount = 0;
  }

  destroy(): void {
    if (this.settleTimer) clearTimeout(this.settleTimer);
    this.settleTimer = null;
    if (this.flightRaf !== null) cancelAnimationFrame(this.flightRaf);
    this.flightRaf = null;
    this.flying = false;
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

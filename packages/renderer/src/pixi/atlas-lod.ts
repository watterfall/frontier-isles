/**
 * Atlas semantic-LOD — the PURE, WebGL-free half of the L0 Pixi atlas (Phase
 * C1+C2, docs/scene-upgrade/INFO-HIERARCHY.md).
 *
 * Everything a test can pin without a GPU lives here: the zoom→semantic-tier
 * mapping, the billboard label de-collision, the deterministic fake-island
 * generator (demo scale test) and the PLACEHOLDER archipelago clustering. The
 * companion {@link ./atlas-stage!AtlasStage} owns only the Pixi draw calls and
 * imports these functions.
 *
 * Invariant 14 (architecture §7): every visual transcribes data. LOD is the
 * SAME islands at three resolutions, never decoration; label priority is
 * *display disambiguation* (which name survives a crowd), a DISCRETE label/dot
 * outcome — never a continuous "bigger = better" rank (no leaderboard, §7).
 *
 * NB: this module imports NOTHING from pixi.js, so `pnpm --filter renderer
 * test` runs it headless. It is under `pixi/` only for cohesion with the stage.
 */

/** The four knowledge domains (mirrors assets' `Domain`; renderer must not
 * depend on the assets package, so the union is restated locally). */
export type AtlasDomain = '数理' | '物质' | '生命' | '交叉';

export const ATLAS_DOMAINS: readonly AtlasDomain[] = ['数理', '物质', '生命', '交叉'];

/** Domain → base fill (Pixi hex ints, matching assets DOMAIN_COLORS verbatim). */
export const ATLAS_DOMAIN_FILL: Record<AtlasDomain, number> = {
  数理: 0xc9d8e6,
  物质: 0xe8cfae,
  生命: 0xc6decc,
  交叉: 0xecdfb4,
};

/** Domain → ink/accent (Pixi hex ints, matching assets DOMAIN_COLORS verbatim). */
export const ATLAS_DOMAIN_INK: Record<AtlasDomain, number> = {
  数理: 0x2e5e8c,
  物质: 0xb5673a,
  生命: 0x2b7a5f,
  交叉: 0xa08428,
};

/**
 * One island as the atlas consumes it — the `IslandDatum` fields carried over
 * verbatim (fallback.ts), renamed to full words. `x`/`y` are chart coordinates
 * in the same 1440×900 space the SVG L0 uses (the atlas camera works directly
 * in this space; no iso projection at L0 — it is a top-down sea chart).
 */
export interface AtlasIslandInput {
  slug: string;
  name: string;
  domain: AtlasDomain;
  /** Growth stage 0..3 — drives footprint size (discrete tier, never a rank). */
  stage: number;
  status: string;
  dormant: boolean;
  /** variance-select outlier — always drawn solo (glow), never folded into a cluster. */
  outlier: boolean;
  eventCount: number;
  x: number;
  y: number;
}

/**
 * A rendered archipelago region — the C3 slot. Phase C3 (a PARALLEL lane) will
 * produce these from a real clustering projection over the domain manifold /
 * ledger currents; until then {@link placeholderClusters} fills them by the
 * trivial "group by domain" rule. This interface is the contract between the
 * two lanes — do not change its shape without syncing C3.
 *
 * `tint` is a Pixi hex int (0xRRGGBB) for the soft region blob.
 */
export interface AtlasCluster {
  id: string;
  name: string;
  islandSlugs: string[];
  center: { x: number; y: number };
  radius: number;
  tint: number;
}

// ─── Zoom → semantic tier ────────────────────────────────────────────────────
//
// Three DISCRETE cartographic scales (INFO-HIERARCHY §2 row 1): far = atlas
// overview (clusters + outlier glow), mid = region (single coastlines + de-
// collided names), near = detail (one island's full readout). Thresholds are
// named constants so the demo HUD and tests share one source of truth.

/** Below this camera scale → the FAR (overview) tier is dominant. */
export const TIER_FAR_MAX = 0.72;
/** At/above FAR_MAX and below this → MID (region); at/above → NEAR (detail). */
export const TIER_MID_MAX = 1.7;
/** Cross-fade half-width (scale units) each side of a threshold — layers blend,
 * never hard-cut (INFO-HIERARCHY §2: "层间用透明度/缩放过渡,不硬切"). */
export const TIER_BAND = 0.22;

export type AtlasTier = 'far' | 'mid' | 'near';

/** The discrete semantic tier for a camera scale (the load-bearing decision;
 * the blend below is cosmetic transition only). */
export function zoomTier(scale: number): AtlasTier {
  if (scale < TIER_FAR_MAX) return 'far';
  if (scale < TIER_MID_MAX) return 'mid';
  return 'near';
}

/** Per-tier opacity for a smooth cross-fade around the two thresholds. Returns
 * three 0..1 alphas that always include the discrete {@link zoomTier} at ≥0.5.
 * This is a rendering transition, NOT a continuous rank (the semantic decision
 * stays the discrete tier). */
export function tierBlend(scale: number): { far: number; mid: number; near: number } {
  const ramp = (edge: number, s: number): number => {
    // 0 below (edge-band), 1 above (edge+band), linear across the band.
    const lo = edge - TIER_BAND;
    const hi = edge + TIER_BAND;
    if (s <= lo) return 0;
    if (s >= hi) return 1;
    return (s - lo) / (hi - lo);
  };
  const toMid = ramp(TIER_FAR_MAX, scale); // 0 = far, 1 = mid+
  const toNear = ramp(TIER_MID_MAX, scale); // 0 = mid-, 1 = near
  return {
    far: 1 - toMid,
    mid: toMid * (1 - toNear),
    near: toNear,
  };
}

// ─── Deterministic hashing (self-contained; renderer must not import assets) ──
//
// Follows the exact FNV-1a + mulberry32 recipe of assets/islandSilhouette so an
// island's fake-generated identity and coastline stay stable per slug forever
// (invariant 13). Restated here only because of the package boundary.

/** FNV-1a 32-bit hash — same string in ⇒ same number out, forever. */
export function atlasHash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 PRNG — deterministic stream from a seed (no Math.random). */
export function atlasRng(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Discrete footprint radius per growth stage (0 empty .. 3 school) — a small
 * fixed table (transcription of stage, never a formula over a continuous
 * score), mirroring assets STAGE_RADIUS. */
export const ATLAS_STAGE_RADIUS: readonly [number, number, number, number] = [30, 40, 52, 64];

/** One shared vertex count + jitter magnitude for EVERY domain — matches
 * `assets/islandSilhouette`'s `VERTEX_COUNT`/`JITTER` (the one soft-mound
 * family the prototype draws). See the ROLLBACK NOTE at the top of that file:
 * a per-domain "coastline grammar" (数理 angular / 物质 faceted / 生命 organic
 * / 交叉 hybrid) was tried once already for the SVG L0 and reverted after
 * user testing called it an invented visual language, never authorized by
 * `design/handoff/问题群岛-原型 v3.dc.html`. `atlasCoastline` must not
 * reintroduce that pattern — domain stays a FILL/INK input only
 * (`ATLAS_DOMAIN_FILL`/`ATLAS_DOMAIN_INK` in `atlas-stage.ts`), never a shape
 * input. */
const COASTLINE_VERTEX_COUNT = 9;
const COASTLINE_JITTER = 0.22;

/**
 * A deterministic closed coastline as a flat `[x,y,x,y,…]` point list around
 * `(cx,cy)`, seeded by `slug` — the SAME soft-mound family at every zoom, only
 * perturbed by seed (never by domain, see the rollback note above). Emits
 * POINTS (consumed by `atlas-stage.ts` as a smooth closed Catmull-Rom curve,
 * mirroring `islandSilhouette.moundPath`'s technique) instead of an SVG path,
 * and lives here to keep the renderer package free of an assets dependency.
 * `domain` is accepted (kept for call-site stability / possible future
 * non-geometric use) but intentionally UNUSED for the point layout.
 */
export function atlasCoastline(slug: string, _domain: AtlasDomain, stage: number, cx: number, cy: number): number[] {
  const rng = atlasRng(atlasHash(slug));
  const r = ATLAS_STAGE_RADIUS[Math.max(0, Math.min(3, stage)) as 0 | 1 | 2 | 3];
  const n = COASTLINE_VERTEX_COUNT;
  const pts: number[] = [];
  for (let i = 0; i < n; i++) {
    const theta = (i / n) * Math.PI * 2 - Math.PI / 2;
    const j = 1 - COASTLINE_JITTER / 2 + rng() * COASTLINE_JITTER;
    pts.push(cx + Math.cos(theta) * r * j, cy + Math.sin(theta) * r * 0.62 * j);
  }
  return pts;
}

// ─── Fake-island generator (demo scale test only) ────────────────────────────

/** Bounds the deterministic scatter of generated islands (a wide sea so 700
 * spread out rather than pile up). */
export const FAKE_WORLD: { w: number; h: number } = { w: 5200, h: 3400 };

/**
 * Deterministically synthesise `n` fake islands for the `?n=` scale test. Each
 * field is derived from `hash(slug)` so the same `n` always yields the same
 * atlas (invariant 13) — DEMO ONLY, clearly slugged `fake-*`, never real data.
 * Scatter is a low-discrepancy hash grid (not RNG clumps) so density is even
 * enough to exercise de-collision without a real layout pass.
 */
export function makeFakeIslands(n: number): AtlasIslandInput[] {
  const out: AtlasIslandInput[] = [];
  const cols = Math.max(1, Math.ceil(Math.sqrt(n * (FAKE_WORLD.w / FAKE_WORLD.h))));
  const rows = Math.max(1, Math.ceil(n / cols));
  const cellW = FAKE_WORLD.w / cols;
  const cellH = FAKE_WORLD.h / rows;
  for (let i = 0; i < n; i++) {
    const slug = `fake-${i}`;
    const h = atlasHash(slug);
    const rng = atlasRng(h);
    const domain = ATLAS_DOMAINS[h % 4]!;
    const stage = (h >> 3) % 4;
    // Even-ish scatter: jittered grid so labels genuinely crowd at mid zoom.
    const gx = i % cols;
    const gy = Math.floor(i / cols);
    const x = (gx + 0.15 + rng() * 0.7) * cellW;
    const y = (gy + 0.15 + rng() * 0.7) * cellH;
    const eventCount = (h >> 6) % 120;
    const outlier = (h >> 11) % 23 === 0; // ~4% variance-select outliers
    const dormant = (h >> 9) % 7 === 0;
    out.push({
      slug,
      name: `岛屿${i}`,
      domain,
      stage,
      status: outlier ? 'outlier' : 'active',
      dormant,
      outlier,
      eventCount,
      x,
      y,
    });
  }
  return out;
}

// ─── Label priority + billboard de-collision ─────────────────────────────────

/**
 * Display priority for a label when the screen crowds — HIGHER wins the slot,
 * the loser demotes to a dot. This is disambiguation, not a score shown to the
 * user: outliers (variance-select) always float above the bulk, then activity
 * (eventCount) breaks the rest. The outcome is a DISCRETE label|dot, never a
 * continuous size ramp (invariant: no leaderboard rendered as "bigger=better").
 */
export function islandPriority(o: AtlasIslandInput): number {
  return (o.outlier ? 1e6 : 0) + o.eventCount;
}

/** A label's screen-space placement request. */
export interface LabelBox {
  id: string;
  priority: number;
  /** Screen-space centre. */
  sx: number;
  sy: number;
  halfW: number;
  halfH: number;
}

export type LabelVerdict = 'label' | 'dot';

/**
 * Resolve which labels render as text and which demote to a point marker, by
 * screen-space AABB collision in priority order (high → low). Higher priority
 * claims its box first; any later box that overlaps an accepted one demotes to
 * 'dot'. A uniform spatial-hash grid keeps this ~O(n) instead of O(n²) at 700
 * labels (only accepted boxes populate the grid). Runs once per camera settle
 * (zoom/pan end), not per frame — cost is paid on interaction, not on idle.
 *
 * Returns a Map id→verdict (every input id present). Deterministic: ties in
 * priority break by id so the same crowd resolves identically each settle.
 */
export function deconflictLabels(boxes: readonly LabelBox[], cell = 96): Map<string, LabelVerdict> {
  const order = [...boxes].sort((a, b) => (b.priority - a.priority) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const verdict = new Map<string, LabelVerdict>();
  // Spatial hash of accepted boxes: bucket key → accepted box list.
  const grid = new Map<string, LabelBox[]>();
  const cellsFor = (b: LabelBox): string[] => {
    const keys: string[] = [];
    const x0 = Math.floor((b.sx - b.halfW) / cell);
    const x1 = Math.floor((b.sx + b.halfW) / cell);
    const y0 = Math.floor((b.sy - b.halfH) / cell);
    const y1 = Math.floor((b.sy + b.halfH) / cell);
    for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) keys.push(`${cx}:${cy}`);
    return keys;
  };
  const hit = (a: LabelBox, b: LabelBox): boolean =>
    Math.abs(a.sx - b.sx) < a.halfW + b.halfW && Math.abs(a.sy - b.sy) < a.halfH + b.halfH;

  for (const b of order) {
    const keys = cellsFor(b);
    let collide = false;
    for (const k of keys) {
      const bucket = grid.get(k);
      if (!bucket) continue;
      for (const acc of bucket) {
        if (hit(b, acc)) { collide = true; break; }
      }
      if (collide) break;
    }
    if (collide) {
      verdict.set(b.id, 'dot');
    } else {
      verdict.set(b.id, 'label');
      for (const k of keys) {
        const bucket = grid.get(k);
        if (bucket) bucket.push(b);
        else grid.set(k, [b]);
      }
    }
  }
  return verdict;
}

// ─── Placeholder archipelago clustering (C3 will replace) ────────────────────

/**
 * PLACEHOLDER clustering — groups islands by `domain` into (up to) four named
 * archipelagos, excluding variance-select outliers (they float solo). This is a
 * stand-in for the Phase C3 lane's real projection over the domain manifold /
 * ledger currents; it satisfies the {@link AtlasCluster} contract so the far-
 * tier renderer can be built and tested now. **Replace the body, keep the
 * signature**, when C3 lands.
 */
export function placeholderClusters(islands: readonly AtlasIslandInput[]): AtlasCluster[] {
  const byDomain = new Map<AtlasDomain, AtlasIslandInput[]>();
  for (const o of islands) {
    if (o.outlier) continue; // outliers never fold into a cluster
    const list = byDomain.get(o.domain);
    if (list) list.push(o);
    else byDomain.set(o.domain, [o]);
  }
  const clusters: AtlasCluster[] = [];
  for (const domain of ATLAS_DOMAINS) {
    const members = byDomain.get(domain);
    if (!members || members.length === 0) continue;
    let sx = 0;
    let sy = 0;
    for (const m of members) { sx += m.x; sy += m.y; }
    const cx = sx / members.length;
    const cy = sy / members.length;
    let maxR = 0;
    for (const m of members) maxR = Math.max(maxR, Math.hypot(m.x - cx, m.y - cy));
    clusters.push({
      id: `domain:${domain}`,
      name: `${domain}群岛`,
      islandSlugs: members.map((m) => m.slug),
      center: { x: cx, y: cy },
      radius: Math.max(120, maxR + 90),
      tint: ATLAS_DOMAIN_FILL[domain],
    });
  }
  return clusters;
}

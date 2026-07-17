/**
 * Atlas semantic-LOD pure-logic tests (Phase C1+C2). Everything the atlas
 * decides without a GPU is pinned here: zoom→tier mapping, cross-fade blend,
 * billboard label de-collision (priority + demotion), deterministic fake-island
 * generation, and the placeholder archipelago clustering.
 *
 * These guard the §6 acceptance claims that are provable in pure logic:
 * "700 islands read as ≤N named archipelagos", "any island reachable in ≤3
 * zoom levels" (the discrete tier ladder), "labels never overlap illegibly"
 * (de-collision demotes losers to dots), and invariant 14 (LOD is data, not
 * decoration — priority is a discrete label|dot outcome, never a rank).
 */
import { describe, expect, it } from 'vitest';
import {
  atlasHash,
  atlasCoastline,
  atlasCurrentGeometry,
  atlasCurrentId,
  assignAtlasAltitudes,
  assignAtlasHierarchy,
  computeWorldMinScale,
  deconflictLabels,
  focusFog,
  islandPriority,
  makeFakeIslands,
  nearestAtlasCurrentPoint,
  placeholderClusters,
  satelliteDisclosure,
  satelliteReveal,
  satelliteViewFactor,
  tierBlend,
  zoomTier,
  ATLAS_ABS_MIN_SCALE,
  SATELLITE_DEEP_END,
  SATELLITE_REVEAL_END,
  SATELLITE_REVEAL_START,
  TIER_FAR_MAX,
  TIER_MID_MAX,
  type AtlasIslandInput,
  type LabelBox,
} from '../src/pixi/atlas-lod';

const isle = (over: Partial<AtlasIslandInput> = {}): AtlasIslandInput => ({
  slug: 's',
  name: 'n',
  domain: '数理',
  stage: 1,
  status: 'active',
  dormant: false,
  outlier: false,
  eventCount: 10,
  x: 0,
  y: 0,
  ...over,
});

describe('atlas currents — one geometry for drawing and field sampling', () => {
  it('builds a stable notebook id from the ledger endpoints, kind, and sign', () => {
    expect(atlasCurrentId({ fromSlug: 'a', toSlug: 'b', kind: 'evidence', sign: 'affirm' })).toBe('a::b::evidence::affirm');
    // Invariant 8: an affirm and a contest on the same ordered pair are two currents.
    expect(atlasCurrentId({ fromSlug: 'a', toSlug: 'b', kind: 'evidence', sign: 'contest' }))
      .not.toBe(atlasCurrentId({ fromSlug: 'a', toSlug: 'b', kind: 'evidence', sign: 'affirm' }));
  });

  it('finds the rendered curve rather than the straight endpoint chord', () => {
    const from = isle({ slug: 'a', x: 100, y: 100, altitude: 'middle', altitudeZ: 0.5 });
    const to = isle({ slug: 'b', x: 500, y: 100, altitude: 'middle', altitudeZ: 0.5 });
    const geometry = atlasCurrentGeometry(from, to);
    const curveMid = {
      x: geometry.ax * 0.25 + geometry.mx * 0.5 + geometry.bx * 0.25,
      y: geometry.ay * 0.25 + geometry.my * 0.5 + geometry.by * 0.25,
    };
    const point = nearestAtlasCurrentPoint(geometry, { ...curveMid, altitudeZ: 0.5 });
    expect(point.progress).toBeCloseTo(0.5, 1);
    expect(point.horizontalDistance).toBeLessThan(8);
  });

  it('requires the craft to match a climbing current in three dimensions', () => {
    const from = isle({ slug: 'low', x: 100, y: 180, altitude: 'low', altitudeZ: 0.1 });
    const to = isle({ slug: 'high', x: 500, y: 180, altitude: 'high', altitudeZ: 0.9 });
    const geometry = atlasCurrentGeometry(from, to);
    const aligned = nearestAtlasCurrentPoint(geometry, { x: geometry.mx, y: geometry.my, altitudeZ: 0.5 });
    const below = nearestAtlasCurrentPoint(geometry, { x: geometry.mx, y: geometry.my, altitudeZ: 0.05 });
    expect(aligned.distance).toBeLessThan(below.distance);
    expect(Math.abs(aligned.altitudeDelta)).toBeLessThan(0.08);
  });
});

describe('assignAtlasAltitudes — place-plane strata, never progress', () => {
  it('folds existing y-order into balanced high, middle, and low air bands', () => {
    const source = Array.from({ length: 9 }, (_, index) => isle({ slug: `isle-${index}`, y: index * 10 }));
    const assigned = assignAtlasAltitudes(source);
    expect(assigned.slice(0, 3).every((item) => item.altitude === 'high')).toBe(true);
    expect(assigned.slice(3, 6).every((item) => item.altitude === 'middle')).toBe(true);
    expect(assigned.slice(6).every((item) => item.altitude === 'low')).toBe(true);
    expect(assigned.map((item) => item.altitudeZ)).toEqual([...assigned.map((item) => item.altitudeZ)].sort((a, b) => (b ?? 0) - (a ?? 0)));
  });

  it('is deterministic and does not mutate the input', () => {
    const source = [isle({ slug: 'b', y: 2 }), isle({ slug: 'a', y: 2 }), isle({ slug: 'c', y: 8 })];
    expect(assignAtlasAltitudes(source)).toEqual(assignAtlasAltitudes(source));
    expect(source.every((item) => item.altitude == null)).toBe(true);
  });
});

describe('assignAtlasHierarchy — nested navigation, never research rank', () => {
  it('chooses the spatial medoid as anchor and assigns the rest as satellites', () => {
    const islands = [isle({ slug: 'west', x: 0 }), isle({ slug: 'center', x: 48 }), isle({ slug: 'east', x: 100 })];
    const assigned = assignAtlasHierarchy(islands, [{ id: 'r', name: '区域', islandSlugs: ['west', 'center', 'east'], center: { x: 50, y: 0 }, radius: 80, tint: 0 }]);
    expect(assigned.find((item) => item.slug === 'center')).toMatchObject({ role: 'anchor', clusterId: 'r' });
    expect(assigned.find((item) => item.slug === 'west')).toMatchObject({ role: 'satellite', parentSlug: 'center', clusterId: 'r' });
    expect(assigned.find((item) => item.slug === 'east')).toMatchObject({ role: 'satellite', parentSlug: 'center', clusterId: 'r' });
  });

  it('keeps an unclustered outlier as its own anchor', () => {
    expect(assignAtlasHierarchy([isle({ slug: 'solo', outlier: true })], [])[0]).toMatchObject({ role: 'anchor' });
  });
});

describe('satelliteReveal — progressive mid→near disclosure', () => {
  it('is hidden through the whole mid tier, transitional at the boundary, full when truly near', () => {
    expect(satelliteReveal(0.5)).toBe(0);
    expect(satelliteReveal(1.3)).toBe(0); // mid tier stays anchors-only
    expect(satelliteReveal(TIER_MID_MAX)).toBeGreaterThan(0);
    expect(satelliteReveal(TIER_MID_MAX)).toBeLessThan(1);
    expect(satelliteReveal(SATELLITE_REVEAL_END + 0.01)).toBe(1);
  });

  it('the window straddles the mid→near threshold (opens before, completes after)', () => {
    expect(SATELLITE_REVEAL_START).toBeLessThan(TIER_MID_MAX);
    expect(SATELLITE_REVEAL_END).toBeGreaterThan(TIER_MID_MAX);
  });
});

describe('satelliteViewFactor + satelliteDisclosure — sail-INTO scoping', () => {
  const W = 1440;
  const H = 900;

  it('an anchor at the viewport centre discloses fully; past the corners it folds', () => {
    expect(satelliteViewFactor(W / 2, H / 2, W, H)).toBe(1);
    expect(satelliteViewFactor(-200, -200, W, H)).toBe(0);
  });

  it('falls monotonically as the anchor moves from centre to edge', () => {
    let prev = Infinity;
    for (const fx of [0.5, 0.65, 0.8, 0.95, 1.1]) {
      const f = satelliteViewFactor(W * fx, H / 2, W, H);
      expect(f).toBeLessThanOrEqual(prev);
      prev = f;
    }
  });

  it('below the reveal window nothing discloses, even dead-centre', () => {
    expect(satelliteDisclosure(1.0, W / 2, H / 2, W, H)).toBe(0);
  });

  it('in the window, a centred archipelago opens while an off-screen one stays folded', () => {
    const s = SATELLITE_REVEAL_END;
    expect(satelliteDisclosure(s, W / 2, H / 2, W, H)).toBe(1);
    expect(satelliteDisclosure(s, -300, -300, W, H)).toBe(0);
  });

  it('deep zoom releases the spatial scoping (anchor may be off-screen)', () => {
    expect(satelliteDisclosure(SATELLITE_DEEP_END, -300, -300, W, H)).toBe(1);
  });
});

describe('zoomTier — discrete cartographic scales (§6: ≤3 zoom levels)', () => {
  it('maps camera scale to exactly three discrete tiers, in order', () => {
    expect(zoomTier(0.1)).toBe('far');
    expect(zoomTier(TIER_FAR_MAX - 0.01)).toBe('far');
    expect(zoomTier(TIER_FAR_MAX)).toBe('mid');
    expect(zoomTier(TIER_MID_MAX - 0.01)).toBe('mid');
    expect(zoomTier(TIER_MID_MAX)).toBe('near');
    expect(zoomTier(10)).toBe('near');
  });

  it('is monotonic across the range (never skips a tier going in)', () => {
    const order = { far: 0, mid: 1, near: 2 };
    let prev = -1;
    for (let s = 0.1; s <= 5; s += 0.05) {
      const cur = order[zoomTier(s)];
      expect(cur).toBeGreaterThanOrEqual(prev);
      prev = cur;
    }
  });
});

describe('tierBlend — smooth cross-fade, still resolving to the discrete tier', () => {
  it('is a partition of unity (alphas sum to 1) at every scale', () => {
    for (let s = 0.1; s <= 5; s += 0.1) {
      const b = tierBlend(s);
      expect(b.far + b.mid + b.near).toBeCloseTo(1, 5);
      for (const v of [b.far, b.mid, b.near]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });

  it('the dominant blend agrees with the discrete zoomTier', () => {
    for (const s of [0.2, 0.5, 1.0, 1.3, 2.5, 4.0]) {
      const b = tierBlend(s);
      const dominant = (['far', 'mid', 'near'] as const).reduce((a, k) => (b[k] > b[a] ? k : a), 'far' as 'far' | 'mid' | 'near');
      // dominant blend must be adjacent-or-equal to the discrete tier (band overlap allowed)
      const idx = { far: 0, mid: 1, near: 2 };
      expect(Math.abs(idx[dominant] - idx[zoomTier(s)])).toBeLessThanOrEqual(1);
    }
  });

  it('far tier is fully opaque at min zoom, near fully opaque at max zoom', () => {
    expect(tierBlend(0.1).far).toBeCloseTo(1, 5);
    expect(tierBlend(5).near).toBeCloseTo(1, 5);
  });
});

describe('islandPriority — outliers float, activity breaks ties (no leaderboard)', () => {
  it('an outlier always outranks any non-outlier regardless of activity', () => {
    expect(islandPriority(isle({ outlier: true, eventCount: 0 }))).toBeGreaterThan(
      islandPriority(isle({ outlier: false, eventCount: 119 })),
    );
  });
  it('among non-outliers, higher activity wins', () => {
    expect(islandPriority(isle({ eventCount: 50 }))).toBeGreaterThan(islandPriority(isle({ eventCount: 10 })));
  });
});

describe('deconflictLabels — billboard de-collision (§6: no illegible overlap)', () => {
  const box = (id: string, priority: number, sx: number, sy: number): LabelBox => ({ id, priority, sx, sy, halfW: 20, halfH: 8 });

  it('non-overlapping labels all render as text', () => {
    const v = deconflictLabels([box('a', 1, 0, 0), box('b', 1, 200, 0), box('c', 1, 0, 200)]);
    expect([...v.values()].every((x) => x === 'label')).toBe(true);
  });

  it('overlapping labels: the higher priority survives, the loser demotes to a dot', () => {
    const v = deconflictLabels([box('low', 1, 0, 0), box('high', 99, 10, 0)]);
    expect(v.get('high')).toBe('label');
    expect(v.get('low')).toBe('dot');
  });

  it('every input id gets a verdict', () => {
    const boxes = [box('a', 1, 0, 0), box('b', 2, 5, 0), box('c', 3, 10, 0)];
    const v = deconflictLabels(boxes);
    expect(v.size).toBe(3);
    for (const b of boxes) expect(v.has(b.id)).toBe(true);
  });

  it('is deterministic: equal priorities resolve by id, stably', () => {
    const boxes = [box('b', 5, 0, 0), box('a', 5, 8, 0)];
    const v1 = deconflictLabels(boxes);
    const v2 = deconflictLabels([...boxes].reverse());
    expect(v1.get('a')).toBe(v2.get('a'));
    expect(v1.get('b')).toBe(v2.get('b'));
    // 'a' < 'b' → 'a' wins the tie
    expect(v1.get('a')).toBe('label');
    expect(v1.get('b')).toBe('dot');
  });

  it('pad demotes labels that merely sit flush (no wall-of-cards)', () => {
    // 41px apart: clear of each other bare (2·halfW = 40) but inside pad 12.
    const bare = deconflictLabels([box('a', 2, 0, 0), box('b', 1, 41, 0)]);
    expect(bare.get('b')).toBe('label');
    const padded = deconflictLabels([box('a', 2, 0, 0), box('b', 1, 41, 0)], 96, { pad: 12 });
    expect(padded.get('a')).toBe('label');
    expect(padded.get('b')).toBe('dot');
  });

  it('maxLabels is a hard budget: overflow demotes to dots by priority', () => {
    const boxes = [box('a', 3, 0, 0), box('b', 2, 200, 0), box('c', 1, 400, 0)];
    const v = deconflictLabels(boxes, 96, { maxLabels: 2 });
    expect(v.get('a')).toBe('label');
    expect(v.get('b')).toBe('label');
    expect(v.get('c')).toBe('dot');
    expect(v.size).toBe(3);
  });

  it('a dense cluster keeps at least the top-priority label (never all-dots)', () => {
    const boxes: LabelBox[] = [];
    for (let i = 0; i < 50; i++) boxes.push(box(`i${i}`, i, i, 0)); // all overlap on a line
    const v = deconflictLabels(boxes);
    const shown = [...v.values()].filter((x) => x === 'label').length;
    expect(shown).toBeGreaterThanOrEqual(1);
    expect(v.get('i49')).toBe('label'); // highest priority survives
  });

  it('spatial-hash result equals a brute-force O(n²) reference', () => {
    // random-ish deterministic scatter
    const boxes: LabelBox[] = [];
    for (let i = 0; i < 120; i++) {
      const h = atlasHash(`box-${i}`);
      boxes.push({ id: `b${i}`, priority: h % 100, sx: (h % 800), sy: ((h >> 8) % 600), halfW: 24, halfH: 9 });
    }
    const fast = deconflictLabels(boxes);
    // brute force
    const order = [...boxes].sort((a, b) => (b.priority - a.priority) || (a.id < b.id ? -1 : 1));
    const accepted: LabelBox[] = [];
    const brute = new Map<string, 'label' | 'dot'>();
    for (const b of order) {
      const clash = accepted.some((a) => Math.abs(a.sx - b.sx) < a.halfW + b.halfW && Math.abs(a.sy - b.sy) < a.halfH + b.halfH);
      if (clash) brute.set(b.id, 'dot');
      else { brute.set(b.id, 'label'); accepted.push(b); }
    }
    for (const b of boxes) expect(fast.get(b.id)).toBe(brute.get(b.id));
  });
});

describe('makeFakeIslands — deterministic scale-test generator (invariant 13)', () => {
  it('same n yields byte-identical islands', () => {
    expect(makeFakeIslands(300)).toEqual(makeFakeIslands(300));
  });
  it('produces exactly n, all slugged fake-*', () => {
    const isles = makeFakeIslands(700);
    expect(isles).toHaveLength(700);
    expect(isles.every((o) => o.slug.startsWith('fake-'))).toBe(true);
  });
  it('a prefix of a larger run is stable per-island (slug-seeded, not index-seeded)', () => {
    const small = makeFakeIslands(50);
    const big = makeFakeIslands(700);
    for (let i = 0; i < 50; i++) {
      expect(big[i]!.domain).toBe(small[i]!.domain);
      expect(big[i]!.stage).toBe(small[i]!.stage);
      expect(big[i]!.outlier).toBe(small[i]!.outlier);
    }
  });
  it('spreads across all four domains and includes some outliers', () => {
    const isles = makeFakeIslands(400);
    const domains = new Set(isles.map((o) => o.domain));
    expect(domains.size).toBe(4);
    expect(isles.some((o) => o.outlier)).toBe(true);
  });
});

describe('placeholderClusters — §6: ~700 read as ≤N named archipelagos', () => {
  it('groups into at most 4 domain archipelagos and names them', () => {
    const clusters = placeholderClusters(makeFakeIslands(700));
    expect(clusters.length).toBeLessThanOrEqual(4);
    expect(clusters.length).toBeGreaterThan(0);
    for (const c of clusters) {
      expect(c.name).toMatch(/群岛$/);
      expect(c.islandSlugs.length).toBeGreaterThan(0);
      expect(c.radius).toBeGreaterThan(0);
    }
  });

  it('excludes variance-select outliers from every cluster', () => {
    const isles = makeFakeIslands(400);
    const outlierSlugs = new Set(isles.filter((o) => o.outlier).map((o) => o.slug));
    const clustered = new Set(placeholderClusters(isles).flatMap((c) => c.islandSlugs));
    for (const s of outlierSlugs) expect(clustered.has(s)).toBe(false);
  });

  it('cluster center is the centroid of its members', () => {
    const isles: AtlasIslandInput[] = [
      isle({ slug: 'a', domain: '生命', x: 0, y: 0 }),
      isle({ slug: 'b', domain: '生命', x: 100, y: 200 }),
    ];
    const c = placeholderClusters(isles).find((k) => k.id === 'domain:生命')!;
    expect(c.center.x).toBeCloseTo(50, 5);
    expect(c.center.y).toBeCloseTo(100, 5);
  });
});

describe('computeWorldMinScale — camera zoom-out floor (W5: no collapse-to-a-dot)', () => {
  it('a small tightly-packed bbox floors ABOVE the naive fixed 0.18 constant (the old bug)', () => {
    // Real curated-data shape: ~1120×415 chart-px bbox on a ~1400×900 screen.
    const bounds = { minX: 170, minY: 245, maxX: 1290, maxY: 660 };
    const floor = computeWorldMinScale(1400, 900, bounds);
    expect(floor).toBeGreaterThan(0.18);
  });

  it('never goes below the absolute safety floor for a degenerate (single-point) bbox', () => {
    const floor = computeWorldMinScale(1400, 900, { minX: 500, minY: 500, maxX: 500, maxY: 500 });
    expect(floor).toBeGreaterThanOrEqual(ATLAS_ABS_MIN_SCALE);
  });

  it('the discrete far tier stays REACHABLE for the real curated bbox (world state must not vanish)', () => {
    // Real curated-data shape (see fallback.ts / packages/data/frontiers.ts).
    // A margin tight enough to only fill the frame but never cross TIER_FAR_MAX
    // would strand the camera in mid tier forever — the four-tier model would
    // lose its "world" state for this exact dataset. Pin the floor below the
    // threshold so continents-only far tier is always a real, reachable state.
    const bounds = { minX: 170, minY: 245, maxX: 1290, maxY: 660 };
    const floor = computeWorldMinScale(1400, 900, bounds);
    expect(floor).toBeLessThan(TIER_FAR_MAX);
  });

  it('a much larger world (N=700 scale-test spread) floors at a smaller scale than a small one', () => {
    const small = computeWorldMinScale(1400, 900, { minX: 0, minY: 0, maxX: 1000, maxY: 700 });
    const big = computeWorldMinScale(1400, 900, { minX: 0, minY: 0, maxX: 5200, maxY: 3400 });
    expect(big).toBeLessThan(small);
  });

  it('is monotonic in screen size (a bigger viewport floors at a bigger scale for the same world)', () => {
    const bounds = { minX: 0, minY: 0, maxX: 1200, maxY: 800 };
    const small = computeWorldMinScale(800, 600, bounds);
    const big = computeWorldMinScale(1600, 1200, bounds);
    expect(big).toBeGreaterThan(small);
  });
});

describe('focusFog — camera-responsive focus (W5 goal 2: focus clears, periphery hazes)', () => {
  it('a cell exactly at the focus point is fully cleared regardless of its data fog', () => {
    expect(focusFog(1, 0, 0, 0, 0, 500)).toBe(0);
  });

  it('a cell far outside the focus radius keeps its full data value (never hazier than the data)', () => {
    expect(focusFog(0.6, 2000, 0, 0, 0, 500)).toBeCloseTo(0.6, 5);
  });

  it('is monotonically increasing in distance from the focus point (smooth falloff, no hard edge)', () => {
    const near = focusFog(1, 100, 0, 0, 0, 1000);
    const mid = focusFog(1, 500, 0, 0, 0, 1000);
    const far = focusFog(1, 900, 0, 0, 0, 1000);
    expect(near).toBeLessThan(mid);
    expect(mid).toBeLessThan(far);
  });

  it('an already-clear cell (fog=0) stays clear no matter where the camera looks', () => {
    expect(focusFog(0, 5000, 5000, 0, 0, 500)).toBe(0);
  });

  it('never raises a cell above its own data value (focus only ever reduces)', () => {
    for (let d = 0; d <= 2000; d += 100) {
      expect(focusFog(0.5, d, 0, 0, 0, 500)).toBeLessThanOrEqual(0.5);
    }
  });

  it('focusRadius<=0 is a no-op passthrough', () => {
    expect(focusFog(0.42, 999, 999, 0, 0, 0)).toBe(0.42);
    expect(focusFog(0.42, 999, 999, 0, 0, -5)).toBe(0.42);
  });
});

describe('atlasCoastline — deterministic per-slug silhouette', () => {
  it('same slug ⇒ identical point list', () => {
    expect(atlasCoastline('x', '数理', 2, 0, 0)).toEqual(atlasCoastline('x', '数理', 2, 0, 0));
  });
  it('vertex count is the SAME one soft-mound family for every domain (no per-domain shape grammar)', () => {
    // A per-domain "coastline grammar" (数理 angular / 物质 faceted / 生命
    // organic / 交叉 hybrid) was tried once for the SVG L0 and rolled back
    // after user testing (islandSilhouette.ts's ROLLBACK NOTE) — domain
    // legibility lives in fill/ink colour only, never in vertex count/jitter.
    // This guards against reintroducing that pattern in the atlas engine.
    const n = atlasCoastline('x', '数理', 2, 0, 0).length;
    for (const d of ['物质', '生命', '交叉'] as const) {
      expect(atlasCoastline('x', d, 2, 0, 0)).toHaveLength(n);
    }
  });
  it('higher stage ⇒ larger footprint (extent grows with stage)', () => {
    const extent = (pts: number[]): number => {
      let max = 0;
      for (let i = 0; i < pts.length; i += 2) max = Math.max(max, Math.hypot(pts[i]!, pts[i + 1]!));
      return max;
    };
    expect(extent(atlasCoastline('x', '数理', 3, 0, 0))).toBeGreaterThan(extent(atlasCoastline('x', '数理', 0, 0, 0)));
  });
});

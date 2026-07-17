/**
 * Layout v0 pipeline tests (M1-DESIGN §6). Proves the headless
 * `descriptor → SceneGraph` step: deterministic, correctly layered, depth keys
 * ordered, and the day/night visibility path wired for ghosts.
 */
import { describe, expect, it } from 'vitest';
import { buildSceneGraph, claimIndexFromId, type LayoutInput } from '../scene/layout';

const base: LayoutInput = {
  slug: 'machine-curiosity',
  domain: '数理',
  stage: 2,
  members: 3,
  dormant: false,
  status: 'active',
  outlier: false,
  eventCount: 24,
};

describe('buildSceneGraph', () => {
  it('is deterministic for the same input', () => {
    const a = buildSceneGraph(base);
    const b = buildSceneGraph(base);
    expect(a).toEqual(b);
  });

  it('emits a ground bed on the terrain layer with a 3-level height field', () => {
    const g = buildSceneGraph(base);
    const terrain = g.objects.filter((o) => o.layer === 'terrain');
    expect(terrain.length).toBeGreaterThan(60); // a filled island, not a handful
    expect(terrain.every((o) => o.kind === 'ground')).toBe(true);
    expect(terrain.every((o) => o.elevation === 0 || o.elevation === 1 || o.elevation === 2)).toBe(true);
    expect(terrain.some((o) => o.elevation > 0)).toBe(true); // M4.1: real elevation
  });

  it('places only the stage-visible stations', () => {
    const g = buildSceneGraph(base);
    const stations = g.objects.filter((o) => o.kind.startsWith('station:'));
    // stage 2 → all 9 stations visible
    expect(stations).toHaveLength(9);
    const empty = buildSceneGraph({ ...base, stage: 0 });
    const emptyStations = empty.objects.filter((o) => o.kind.startsWith('station:'));
    expect(emptyStations.map((o) => o.kind).sort()).toEqual(['station:dock', 'station:questions']);
  });

  it('offers a stable courtyard grammar for a minority of flagship islands', () => {
    const organic = buildSceneGraph(base);
    const courtyard = buildSceneGraph({ ...base, layoutVariant: 'courtyard' });
    const stationSignature = (graph: typeof organic) => graph.objects
      .filter((object) => object.kind.startsWith('station:'))
      .map((object) => `${object.id}@${object.gx},${object.gy}`);
    expect(stationSignature(courtyard)).not.toEqual(stationSignature(organic));

    const courtGround = courtyard.objects.filter((object) => object.layer === 'terrain');
    expect(courtGround.some((object) => object.gx === 8 && object.gy === 8 && object.elevation === 2)).toBe(true);
    expect(courtGround.filter((object) => object.elevation === 2).length).toBeGreaterThan(8);
  });

  it('binds claim count to eventCount (reproductions → floors)', () => {
    const few = buildSceneGraph({ ...base, eventCount: 0 }).objects.filter((o) => o.kind === 'claim');
    const many = buildSceneGraph({ ...base, eventCount: 24 }).objects.filter((o) => o.kind === 'claim');
    expect(few).toHaveLength(0);
    expect(many.length).toBeGreaterThan(0);
    expect(many.every((o) => o.growth && o.growth.foundation)).toBe(true);
  });

  it('makes ghosts night-only (the day/night visibility path, P4)', () => {
    const g = buildSceneGraph({ ...base, eventCount: 40 });
    const ghosts = g.objects.filter((o) => o.kind.startsWith('ghost:'));
    expect(ghosts.length).toBeGreaterThan(0);
    expect(ghosts.every((o) => o.dayVisibility === 0 && o.nightVisibility === 1)).toBe(true);
    // Non-ghosts are day-visible.
    const stations = g.objects.filter((o) => o.kind.startsWith('station:'));
    expect(stations.every((o) => o.dayVisibility === 1)).toBe(true);
  });

  it('orders depth keys so a nearer tile draws later (higher zIndex)', () => {
    const g = buildSceneGraph(base);
    const back = g.objects.find((o) => o.id === 'station:questions')!; // gy=4 (back)
    const front = g.objects.find((o) => o.id === 'station:dock')!; // gy=15 (front)
    expect(front.depthKey).toBeGreaterThan(back.depthKey);
  });

  it('drives claim buildings from projectClaimState when claims are given (M4.3)', () => {
    const claims = [
      { ref: 'sha256:a', island: 'op://x', foundation: true, floors: 5, roof: true, hasDoi: false, activity: 6 },
      { ref: 'sha256:b', island: 'op://x', foundation: true, floors: 1, roof: false, hasDoi: false, activity: 2 },
      { ref: 'sha256:c', island: 'op://x', foundation: true, floors: 0, roof: false, ghost: 'refuted' as const, hasDoi: false, activity: 2 },
    ];
    const g = buildSceneGraph(base, 0, claims);
    const cs = g.objects.filter((o) => o.kind === 'claim');
    expect(cs).toHaveLength(3);
    // Height binds to floors: the 5-floor claim is taller than the 1-floor one.
    const byId = (i: number) => cs.find((o) => o.id === `claim:${i}`)!;
    expect(byId(0).height!).toBeGreaterThan(byId(1).height!);
    expect(byId(0).growth).toMatchObject({ floors: 5, roof: true });
    // The refuted claim is a night-only ghost (day 0 / night 1).
    expect(byId(2)).toMatchObject({ dayVisibility: 0, nightVisibility: 1 });
  });

  it('transcribes published DOI state end-to-end: growth.hasDoi mirrors ClaimState.hasDoi (R6 Lever 1)', () => {
    const claims = [
      { ref: 'sha256:pub', island: 'op://x', foundation: true, floors: 3, roof: false, hasDoi: true, activity: 4 },
      { ref: 'sha256:pre', island: 'op://x', foundation: true, floors: 2, roof: false, hasDoi: false, activity: 3 },
    ];
    const g = buildSceneGraph(base, 0, claims);
    const byId = (i: number) => g.objects.find((o) => o.id === `claim:${i}`)!;
    // Published claim (ledger `publish`) → the seal must read as a real DOI stamp.
    expect(byId(0).growth?.hasDoi).toBe(true);
    // Preprint-only claim → honest preprint open-mark, never a fabricated DOI.
    expect(byId(1).growth?.hasDoi).toBe(false);
  });

  it('defaults synthesised claims (no ledger) to hasDoi:false — no DOI is invented (R6 Lever 1)', () => {
    const g = buildSceneGraph(base); // no claims arg → deterministic synth path
    const cs = g.objects.filter((o) => o.kind === 'claim');
    expect(cs.length).toBeGreaterThan(0);
    expect(cs.every((o) => o.growth?.hasDoi === false)).toBe(true);
  });

  it('carries the day↔night slider t through unchanged', () => {
    expect(buildSceneGraph(base, 0).t).toBe(0);
    expect(buildSceneGraph(base, 0.5).t).toBe(0.5);
    expect(buildSceneGraph(base, 1).t).toBe(1);
  });

  it('tags every object with the island biome', () => {
    const g = buildSceneGraph({ ...base, domain: '生命' });
    expect(g.objects.every((o) => o.biome === '生命')).toBe(true);
  });

  it('projects generated residents into the Pixi scene without turning them into a score', () => {
    const g = buildSceneGraph({ ...base, members: 4, hasAi: true });
    const residents = g.objects.filter((o) => o.kind.startsWith('resident:'));
    expect(residents.filter((o) => o.kind === 'resident:human')).toHaveLength(4);
    expect(residents.filter((o) => o.kind === 'resident:ai')).toHaveLength(1);
    expect(residents.every((o) => o.layer === 'world')).toBe(true);
  });

  it('marks a station active only when core.projectActiveStations says so (M8 micro-dynamics)', () => {
    const active = new Set<'workshop' | 'data'>(['workshop']);
    const g = buildSceneGraph(base, 0, undefined, active);
    const workshop = g.objects.find((o) => o.id === 'station:workshop')!;
    const gallery = g.objects.find((o) => o.id === 'station:gallery')!;
    expect(workshop.active).toBe(true);
    expect(gallery.active).toBe(false);
    // Omitted activeStations → every station defaults to inactive, never undefined
    // ambiguity (the renderer treats `active` as a strict boolean gate).
    const noActivity = buildSceneGraph(base);
    expect(noActivity.objects.filter((o) => o.kind.startsWith('station:')).every((o) => o.active === false)).toBe(true);
  });

  it('places exactly one biome Landmark, 2–3× a station body (M4.4)', () => {
    const g = buildSceneGraph(base);
    const landmarks = g.objects.filter((o) => o.kind.startsWith('landmark:'));
    expect(landmarks).toHaveLength(1);
    const lm = landmarks[0]!;
    expect(lm.height).toBeGreaterThanOrEqual(60); // ≥2× the 30px station body
    expect(lm.height!).toBeLessThanOrEqual(90); // ≤3×
    expect(lm.layer).toBe('world');
  });

  it('picks a distinct Landmark form per domain (M4.4 — two↔two 一眼可辨)', () => {
    const kindFor = (domain: LayoutInput['domain']) =>
      buildSceneGraph({ ...base, domain }).objects.find((o) => o.kind.startsWith('landmark:'))!.kind;
    const forms = (['数理', '物质', '生命', '交叉'] as const).map(kindFor);
    expect(new Set(forms).size).toBe(4); // all four biomes render a different shape
  });

  it('density-gradient scatter is core-sparse, mid-densest, shore-sparser (M4.5)', () => {
    const g = buildSceneGraph({ ...base, domain: '生命' }); // 生命 → richest scenery pool
    const scatter = g.objects.filter((o) => o.kind.startsWith('scenery:'));
    expect(scatter.length).toBeGreaterThan(0);
    const CENTER = 8;
    const ISLAND_R = 7;
    const ringOf = (o: (typeof scatter)[number]) => {
      const d = Math.hypot(o.gx + 0.5 - CENTER, o.gy + 0.5 - CENTER) / ISLAND_R;
      return d < 0.35 ? 'core' : d < 0.7 ? 'mid' : 'shore';
    };
    const counts = { core: 0, mid: 0, shore: 0 };
    for (const o of scatter) counts[ringOf(o)]++;
    // mid is the densest ring by construction (scatterProb mid > shore > core).
    expect(counts.mid).toBeGreaterThan(counts.core);
    expect(counts.mid).toBeGreaterThanOrEqual(counts.shore);
  });

  it('never places a scatter object on a station/claim/Landmark tile', () => {
    const g = buildSceneGraph(base);
    const occupied = new Set(
      g.objects.filter((o) => o.kind.startsWith('station:') || o.kind === 'claim' || o.kind.startsWith('landmark:')).map((o) => `${o.gx},${o.gy}`),
    );
    const scatter = g.objects.filter((o) => o.kind.startsWith('scenery:'));
    expect(scatter.some((o) => occupied.has(`${o.gx},${o.gy}`))).toBe(false);
  });

  it('gives every ground tile a small terrain-fingerprint tint (depth-plan-v1 §5)', () => {
    const g = buildSceneGraph(base);
    const terrain = g.objects.filter((o) => o.layer === 'terrain');
    // Every tile carries a signed lightness jitter, and it stays a QUIET ±≈4.5%
    // (a paper breathing, not a colourful patchwork).
    expect(terrain.every((o) => typeof o.tint === 'number')).toBe(true);
    expect(terrain.every((o) => Math.abs(o.tint!) <= 0.05)).toBe(true);
    // Non-terrain objects never carry a terrain tint/shore.
    const nonTerrain = g.objects.filter((o) => o.layer !== 'terrain');
    expect(nonTerrain.every((o) => o.tint === undefined && o.shore === undefined)).toBe(true);
  });

  it('marks a coastal transition band — some elevation-0 tiles border sea (shore)', () => {
    const g = buildSceneGraph(base);
    const terrain = g.objects.filter((o) => o.layer === 'terrain');
    const shore = terrain.filter((o) => o.shore === true);
    expect(shore.length).toBeGreaterThan(0);
    // A shore tile is always elevation 0 (a beach, never a highland cliff top).
    expect(shore.every((o) => o.elevation === 0)).toBe(true);
  });

  it('two islands render different terrain fingerprints (seeded by slug)', () => {
    const a = buildSceneGraph({ ...base, slug: 'alpha-isle' }).objects.filter((o) => o.layer === 'terrain');
    const b = buildSceneGraph({ ...base, slug: 'beta-isle' }).objects.filter((o) => o.layer === 'terrain');
    const tintAt = (list: typeof a, id: string) => list.find((o) => o.id === id)?.tint;
    // At least one shared ground tile carries a different jitter between islands.
    const shared = a.filter((o) => b.some((x) => x.id === o.id));
    expect(shared.some((o) => tintAt(a, o.id) !== tintAt(b, o.id))).toBe(true);
  });

  it('scatter density transcribes liveliness — busier islands are at least as dense', () => {
    // members-only variation holds the forced tiles / land / seeded rolls fixed,
    // so a livelier island's scatter is a strict superset of a quieter one's.
    const quiet = buildSceneGraph({ ...base, members: 0, eventCount: 0, stage: 0 }).objects.filter((o) => o.kind.startsWith('scenery:'));
    const busy = buildSceneGraph({ ...base, members: 6, eventCount: 40, stage: 3 }).objects.filter((o) => o.kind.startsWith('scenery:'));
    expect(busy.length).toBeGreaterThanOrEqual(quiet.length);
    // And the effect is real, not a no-op: the busy island actually fills more.
    expect(busy.length).toBeGreaterThan(quiet.length);
  });
});

describe('claimIndexFromId', () => {
  it('parses a claim scene-object id back to its index into `claims`', () => {
    expect(claimIndexFromId('claim:0')).toBe(0);
    expect(claimIndexFromId('claim:3')).toBe(3);
  });

  it('round-trips every claim tower id built by buildSceneGraph', () => {
    const claims = [
      { ref: 'sha256:a', island: 'op://x', foundation: true, floors: 5, roof: true, hasDoi: false, activity: 6 },
      { ref: 'sha256:b', island: 'op://x', foundation: true, floors: 1, roof: false, hasDoi: false, activity: 2 },
    ];
    const g = buildSceneGraph(base, 0, claims);
    const towers = g.objects.filter((o) => o.kind === 'claim');
    for (const o of towers) {
      const i = claimIndexFromId(o.id);
      expect(i).not.toBeNull();
      expect(claims[i!]).toBeDefined();
    }
  });

  it('returns null for non-claim ids (stations, ghosts, ground, malformed)', () => {
    expect(claimIndexFromId('station:workshop')).toBeNull();
    expect(claimIndexFromId('ghost:0:refuted')).toBeNull();
    expect(claimIndexFromId('ground:3,4')).toBeNull();
    expect(claimIndexFromId('claim:abc')).toBeNull();
    expect(claimIndexFromId('claim:-1')).toBeNull();
  });
});

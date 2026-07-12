/**
 * Claim-seal goldens.
 *
 * R6 Lever 1: the seal transcribes the ledger's published state, not a hardcoded
 * default — `growth.hasDoi === true` ⇒ a solid DOI stamp; false ⇒ no such fill.
 * R7 ride-along A: the DOI stamp uses the dedicated DOI_SEAL_INK token, distinct
 * from the 物质 domain ink it used to collide with.
 * R7 ride-along D: a published-then-refuted GHOST tower still draws a (spectral)
 * seal, so the faded mark keeps agreeing with the detail panel's DOI status.
 * R7 ride-along C: prefers-reduced-motion reaches the stage.
 */
import { describe, expect, it } from 'vitest';
import { Container, Graphics } from 'pixi.js';
import { SceneStage } from '../src/pixi/scene-stage';
import { DOI_SEAL_INK } from '../src/pixi/palette';
import type { SceneObject } from '../src/scene';

type Instruction = { action: string; data: { style?: { color?: number } } };

/**
 * A claim object. biome '数理' has palette { fill: 0xc9d8e6, ink: 0x2e5e8c } —
 * neither is DOI_SEAL_INK, and makeClaimMark never uses dom.ink as a fill, so a
 * DOI_SEAL_INK *fill* can only come from drawSeal's published stamp. dayVisibility
 * 1 ⇒ not spectral; 0 ⇒ spectral (night-only ghost tower).
 */
const claim = (hasDoi: boolean, spectral = false): SceneObject => ({
  id: 'claim:0',
  kind: 'claim',
  gx: 4,
  gy: 4,
  layer: 'world',
  elevation: 0,
  depthKey: 0,
  dayVisibility: spectral ? 0 : 1,
  nightVisibility: 1,
  lodLevel: 'Z2',
  biome: '数理',
  variant: 0,
  height: 40,
  growth: { foundation: true, floors: 2, roof: false, hasDoi },
});

const instructions = (mark: Container): Instruction[] => {
  const out: Instruction[] = [];
  for (const child of mark.children) {
    if (!(child instanceof Graphics)) continue;
    const ctx = (child as unknown as { context: { instructions: Instruction[] } }).context;
    out.push(...ctx.instructions);
  }
  return out;
};

/** Count solid fills of the DOI seal colour across the mark's Graphics children. */
const doiFillCount = (mark: Container): number =>
  instructions(mark).filter((ins) => ins.action === 'fill' && ins.data.style?.color === DOI_SEAL_INK).length;

const makeMark = (o: SceneObject): Container =>
  (new SceneStage() as unknown as { makeClaimMark(x: SceneObject): Container }).makeClaimMark(o);

describe('makeClaimMark DOI seal (R6 Lever 1 + R7 ride-along A)', () => {
  it('stamps a solid DOI fill in the dedicated DOI_SEAL_INK when growth.hasDoi is true', () => {
    expect(doiFillCount(makeMark(claim(true)))).toBeGreaterThanOrEqual(1);
  });

  it('draws no DOI fill when growth.hasDoi is false (honest preprint open-mark)', () => {
    expect(doiFillCount(makeMark(claim(false)))).toBe(0);
  });

  it('DOI_SEAL_INK is euclidean-distant (>40) from EVERY domain ink, not just != (collision killed)', () => {
    const rgb = (h: number) => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
    const dist = (a: number, b: number) => Math.hypot(...rgb(a).map((v, i) => v - rgb(b)[i]!));
    // math / matter / life / cross domain inks (scene-stage claimDomain). >40 closes
    // the "a distance-1 regression still passes `!== 0xb5673a`" hole.
    for (const ink of [0x2e5e8c, 0xb5673a, 0x2b7a5f, 0xa08428]) {
      expect(dist(DOI_SEAL_INK, ink)).toBeGreaterThan(40);
    }
  });
});

describe('makeClaimMark spectral seal (R7 ride-along D — seal↔panel parity for ghosts)', () => {
  it('a published-then-refuted ghost still draws a seal (more geometry than a preprint ghost)', () => {
    const publishedGhost = instructions(makeMark(claim(true, true))).length;
    const preprintGhost = instructions(makeMark(claim(false, true))).length;
    // The ONLY hasDoi-dependent geometry in a spectral tower is the seal, so the
    // published ghost carries the extra spectral seal strokes the preprint lacks.
    expect(publishedGhost).toBeGreaterThan(preprintGhost);
  });

  it('the spectral seal is stroke-only — never the solid DOI fill (stays translucent)', () => {
    expect(doiFillCount(makeMark(claim(true, true)))).toBe(0);
  });
});

describe('SceneStage reduced-motion plumbing (R7 ride-along C)', () => {
  it('accepts and stores prefers-reduced-motion (the a11y pipe reaches the stage)', () => {
    const s = new SceneStage();
    const read = () => (s as unknown as { reducedMotion: boolean }).reducedMotion;
    expect(read()).toBe(false);
    s.setReducedMotion(true);
    expect(read()).toBe(true);
    s.setReducedMotion(false);
    expect(read()).toBe(false);
  });
});

describe('SceneStage agitation channel rename (R7 Dim 2)', () => {
  it('exposes setAgitation and no longer setUndertow', () => {
    const s = new SceneStage() as unknown as Record<string, unknown>;
    expect(typeof s.setAgitation).toBe('function');
    expect(s.setUndertow).toBeUndefined();
  });

  it('setAgitation is a safe no-op before the sea shader exists (headless)', () => {
    const s = new SceneStage();
    expect(() => s.setAgitation(0.6)).not.toThrow();
    expect(() => s.setAgitation(true)).not.toThrow();
  });

  it('persists agitation before the sea shader exists so boot/rebuild restores it (R7 Dim 2 BUG)', () => {
    const s = new SceneStage() as unknown as {
      agitation: number;
      setAgitation(v: number): void;
      seaShader?: { resources: { waveUniforms: { uniforms: { uAgitation: number } } } };
    };
    expect(s.agitation).toBe(0);
    s.setAgitation(0.6); // boot order: set BEFORE buildSea — must NOT be dropped
    expect(s.agitation).toBe(0.6);
    // buildSea seeds a FRESH uniform (starts at 0) from this field; prove the seed.
    const uniforms = { uAgitation: 0 };
    s.seaShader = { resources: { waveUniforms: { uniforms } } };
    s.setAgitation(s.agitation);
    expect(uniforms.uAgitation).toBe(0.6);
  });

  it('reduced-motion: a discrete setAgitation / day↔night change paints one frame (BUG A/B)', () => {
    const s = new SceneStage() as unknown as {
      app: unknown;
      seaShader: unknown;
      reducedMotion: boolean;
      applyToneAndLights(t: number): void;
      setAgitation(v: number): void;
      tweenDayNight(t: number): void;
    };
    let renders = 0;
    s.app = { render: () => { renders++; }, ticker: { add() {}, remove() {} }, start() {} };
    s.seaShader = { resources: { waveUniforms: { uniforms: { uAgitation: 0, uTime: 0 } } } };
    s.applyToneAndLights = () => {}; // isolate from tone/lights internals
    s.reducedMotion = true;
    s.setAgitation(0.6);
    expect(renders).toBe(1); // BUG B: the disputed sea would otherwise never update
    s.tweenDayNight(1);
    expect(renders).toBe(2); // BUG A: the day↔night lever would otherwise silently no-op
  });
});

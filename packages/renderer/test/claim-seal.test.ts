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

  it('uses an ink distinct from the 物质 domain ink 0xb5673a (collision killed)', () => {
    expect(DOI_SEAL_INK).not.toBe(0xb5673a);
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
});

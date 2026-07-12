/**
 * R6 Lever 1 golden — the claim seal must transcribe the ledger's published
 * state, not a hardcoded default. Before the fix `makeClaimMark` always fed
 * `drawSeal(…, false)`, so every claim rendered a preprint open-mark even when
 * `ClaimState.hasDoi` was true (the detail panel showed the real DOI → the seal
 * contradicted it). This pins the wire: `growth.hasDoi === true` ⇒ a solid DOI
 * stamp (fill 0xb5673a); false ⇒ no such fill.
 */
import { describe, expect, it } from 'vitest';
import { Container, Graphics } from 'pixi.js';
import { SceneStage } from '../src/pixi/scene-stage';
import type { SceneObject } from '../src/scene';

/** The published DOI seal's solid fill (drawSeal). */
const DOI_FILL = 0xb5673a;

/**
 * A minimal non-spectral claim object. biome '数理' has palette
 * { fill: 0xc9d8e6, ink: 0x2e5e8c } — neither is DOI_FILL, and makeClaimMark
 * never uses dom.ink as a fill, so a DOI_FILL *fill* can only originate from
 * drawSeal's published stamp. dayVisibility 1 ⇒ not spectral ⇒ the seal draws.
 */
const claim = (hasDoi: boolean): SceneObject => ({
  id: 'claim:0',
  kind: 'claim',
  gx: 4,
  gy: 4,
  layer: 'world',
  elevation: 0,
  depthKey: 0,
  dayVisibility: 1,
  nightVisibility: 1,
  lodLevel: 'Z2',
  biome: '数理',
  variant: 0,
  height: 40,
  growth: { foundation: true, floors: 2, roof: false, hasDoi },
});

/** Count solid fills of the DOI seal colour across the mark's Graphics children. */
function doiFillCount(mark: Container): number {
  let n = 0;
  for (const child of mark.children) {
    if (!(child instanceof Graphics)) continue;
    const ctx = (child as unknown as {
      context: { instructions: Array<{ action: string; data: { style?: { color?: number } } }> };
    }).context;
    for (const ins of ctx.instructions) {
      if (ins.action === 'fill' && ins.data.style?.color === DOI_FILL) n++;
    }
  }
  return n;
}

const makeMark = (o: SceneObject): Container =>
  (new SceneStage() as unknown as { makeClaimMark(x: SceneObject): Container }).makeClaimMark(o);

describe('makeClaimMark DOI seal (R6 Lever 1 golden)', () => {
  it('stamps a solid DOI fill (0xb5673a) when growth.hasDoi is true', () => {
    expect(doiFillCount(makeMark(claim(true)))).toBeGreaterThanOrEqual(1);
  });

  it('draws no DOI fill when growth.hasDoi is false (honest preprint open-mark)', () => {
    expect(doiFillCount(makeMark(claim(false)))).toBe(0);
  });
});

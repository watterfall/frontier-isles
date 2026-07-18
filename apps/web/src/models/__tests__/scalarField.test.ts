import { describe, expect, it } from 'vitest';
import {
  advanceScalarField,
  createScalarField,
  scalarFieldStats,
  stepScalarField,
} from '../scalarField';

describe('shared scalar-field kernel', () => {
  it('conserves total material for diffusion with reflecting boundaries', () => {
    const initial = createScalarField('diffusion');
    const final = advanceScalarField(initial, 0.72, 120);
    expect(scalarFieldStats(final).total).toBeCloseTo(scalarFieldStats(initial).total, 8);
    expect(scalarFieldStats(final).spread).toBeLessThan(scalarFieldStats(initial).spread);
  });

  it('keeps authored boundary values fixed while reducing steady residual', () => {
    const initial = createScalarField('electrostatic');
    const final = advanceScalarField(initial, 0.8, 180);
    expect(scalarFieldStats(final).residual).toBeLessThan(scalarFieldStats(initial).residual);
    initial.fixed.forEach((fixed, index) => {
      if (fixed) expect(final.values[index]).toBe(initial.values[index]);
    });
  });

  it('uses the same pure local step for every interpretation', () => {
    for (const substrate of ['heat', 'diffusion', 'electrostatic', 'steady-flow'] as const) {
      const initial = createScalarField(substrate, 10, 8);
      const next = stepScalarField(initial, 0.5);
      expect(next.steps).toBe(1);
      expect(next.values).toHaveLength(80);
      expect(initial.steps).toBe(0);
    }
  });
});

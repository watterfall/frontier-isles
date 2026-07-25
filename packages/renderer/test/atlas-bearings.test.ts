/**
 * Off-sheet bearing marks — the pure half of the near-tier open-water fix.
 *
 * Past `TIER_MID_MAX` the camera can sit between islands with the climate
 * washes already faded to zero, leaving blank paper and no way to tell which
 * way land is. These ticks answer that from real island positions only, so the
 * tests pin the properties that keep them honest: they describe what is
 * genuinely off screen, the nearest thing in a direction wins, a crowded
 * direction collapses to one mark rather than a pile, and nothing is invented
 * when there is nothing beyond the edge.
 */
import { describe, expect, it } from 'vitest';
import {
  GRATICULE_MIN_PX,
  bearingCompass,
  graticuleStep,
  offscreenBearings,
  type AtlasDomain,
} from '../src/pixi/atlas-lod';

const VIEW = { width: 1000, height: 600 };
const island = (slug: string, sx: number, sy: number, domain: AtlasDomain = '数理') =>
  ({ slug, name: `岛-${slug}`, domain, sx, sy });

describe('offscreenBearings', () => {
  it('ignores islands that are still on screen — a visible island needs no tick', () => {
    const marks = offscreenBearings([island('a', 500, 300), island('b', 0, 0), island('c', 1000, 600)], VIEW);
    expect(marks).toEqual([]);
  });

  it('marks an island past the edge and points at it', () => {
    const marks = offscreenBearings([island('east', 1800, 300)], VIEW);
    expect(marks).toHaveLength(1);
    expect(marks[0]!.slug).toBe('east');
    // Due right of centre: angle 0, tick clamped onto the right inset edge.
    expect(marks[0]!.angle).toBeCloseTo(0, 5);
    expect(marks[0]!.x).toBeCloseTo(VIEW.width - 34, 5);
    expect(marks[0]!.y).toBeCloseTo(VIEW.height / 2, 5);
    expect(marks[0]!.distance).toBeCloseTo(1300, 5);
  });

  it('keeps every tick inside the inset rectangle, whatever the direction', () => {
    const far = [
      island('n', 500, -4000), island('s', 500, 5000),
      island('w', -3000, 300), island('e', 6000, 300),
      island('ne', 4000, -4000), island('sw', -2000, 3000),
    ];
    const inset = 34;
    for (const m of offscreenBearings(far, VIEW, { max: 12 })) {
      expect(m.x).toBeGreaterThanOrEqual(inset - 1e-6);
      expect(m.x).toBeLessThanOrEqual(VIEW.width - inset + 1e-6);
      expect(m.y).toBeGreaterThanOrEqual(inset - 1e-6);
      expect(m.y).toBeLessThanOrEqual(VIEW.height - inset + 1e-6);
    }
  });

  it('collapses a crowded direction to its nearest island instead of stacking marks', () => {
    // Three islands due east at increasing distance — one sector, one tick.
    const marks = offscreenBearings(
      [island('far', 4000, 300), island('near', 1200, 300), island('mid', 2200, 300)],
      VIEW,
    );
    expect(marks).toHaveLength(1);
    expect(marks[0]!.slug).toBe('near');
  });

  it('honours the max count, nearest first', () => {
    const ring = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const r = 900 + i * 40; // strictly increasing distance around the ring
      return island(`i${i}`, 500 + Math.cos(a) * r, 300 + Math.sin(a) * r);
    });
    const marks = offscreenBearings(ring, VIEW, { max: 4 });
    expect(marks).toHaveLength(4);
    const distances = marks.map((m) => m.distance);
    expect([...distances].sort((a, b) => a - b)).toEqual(distances);
  });

  it('is deterministic when two islands tie on distance', () => {
    const a = offscreenBearings([island('b', 1800, 300), island('a', 1800, 300)], VIEW, { sectors: 1 });
    const b = offscreenBearings([island('a', 1800, 300), island('b', 1800, 300)], VIEW, { sectors: 1 });
    expect(a.map((m) => m.slug)).toEqual(b.map((m) => m.slug));
    expect(a[0]!.slug).toBe('a');
  });

  it('draws nothing when the viewport is smaller than its own inset', () => {
    expect(offscreenBearings([island('e', 900, 20)], { width: 40, height: 40 })).toEqual([]);
  });

  it('honours an asymmetric safe area so a tick never lands under a panel', () => {
    // Mirrors the real HUD: two control bands on top, a research panel right.
    const hud = { top: 140, right: 470, bottom: 60, left: 20 };
    const marks = offscreenBearings(
      [island('east', 9000, 300), island('north', 500, -9000)],
      VIEW,
      { inset: hud, max: 8 },
    );
    const east = marks.find((m) => m.slug === 'east')!;
    const north = marks.find((m) => m.slug === 'north')!;
    expect(east.x).toBeCloseTo(VIEW.width - hud.right, 5);
    expect(north.y).toBeCloseTo(hud.top, 5);
    for (const m of marks) {
      expect(m.x).toBeGreaterThanOrEqual(hud.left - 1e-6);
      expect(m.x).toBeLessThanOrEqual(VIEW.width - hud.right + 1e-6);
      expect(m.y).toBeGreaterThanOrEqual(hud.top - 1e-6);
      expect(m.y).toBeLessThanOrEqual(VIEW.height - hud.bottom + 1e-6);
    }
  });

  it('draws nothing when the HUD has eaten the whole frame', () => {
    const marks = offscreenBearings([island('e', 9000, 300)], VIEW, {
      inset: { top: 400, right: 600, bottom: 400, left: 600 },
    });
    expect(marks).toEqual([]);
  });

  it('carries the island domain through so a tick can be inked like its water', () => {
    const marks = offscreenBearings([island('x', 1800, 300, '生命')], VIEW);
    expect(marks[0]!.domain).toBe('生命');
  });
});

describe('bearingCompass', () => {
  it('names screen directions with north as -y', () => {
    expect(bearingCompass(0)).toBe('东');
    expect(bearingCompass(Math.PI / 2)).toBe('南');
    expect(bearingCompass(Math.PI)).toBe('西');
    expect(bearingCompass(-Math.PI / 2)).toBe('北');
    expect(bearingCompass(-Math.PI / 4)).toBe('东北');
  });

  it('wraps rather than falling off the ends', () => {
    expect(bearingCompass(Math.PI * 2)).toBe('东');
    expect(bearingCompass(-Math.PI * 2)).toBe('东');
    expect(bearingCompass(Math.PI * 4 + Math.PI / 2)).toBe('南');
  });
});

describe('graticuleStep', () => {
  it('never lets the open-water grid collapse below its legible spacing', () => {
    for (const scale of [0.4, 0.9, 1.7, 2.3, 4, 7.5, 13, 40, 260]) {
      const onScreen = graticuleStep(scale) * scale;
      expect(onScreen).toBeGreaterThanOrEqual(GRATICULE_MIN_PX);
    }
  });

  it('stays coarse enough that a viewport never holds a thicket of lines', () => {
    // The coarsest step below the next ladder rung is 2.5× the minimum, so a
    // 4000px-wide viewport still sees well under a hundred lines.
    for (const scale of [0.4, 1, 2.3, 4, 13, 260]) {
      const onScreen = graticuleStep(scale) * scale;
      expect(onScreen).toBeLessThan(GRATICULE_MIN_PX * 2.5);
      expect(4000 / onScreen).toBeLessThanOrEqual(50);
    }
  });

  it('walks the 1-2-5 decade ladder rather than arbitrary spacings', () => {
    for (const scale of [0.3, 0.75, 1.1, 3.2, 9, 55]) {
      const step = graticuleStep(scale);
      const mantissa = step / Math.pow(10, Math.floor(Math.log10(step)));
      expect([1, 2, 5]).toContain(Math.round(mantissa));
    }
  });

  it('coarsens as you zoom out and refines as you zoom in — never the reverse', () => {
    const scales = [0.25, 0.5, 1, 2, 4, 8, 16, 32];
    const steps = scales.map(graticuleStep);
    for (let i = 1; i < steps.length; i++) expect(steps[i]!).toBeLessThanOrEqual(steps[i - 1]!);
  });

  it('returns a usable step for a degenerate scale instead of dividing by zero', () => {
    for (const bad of [0, -3, Number.NaN, Number.POSITIVE_INFINITY]) {
      const step = graticuleStep(bad);
      expect(Number.isFinite(step)).toBe(true);
      expect(step).toBeGreaterThan(0);
    }
  });
});

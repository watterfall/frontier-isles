/**
 * Unified label placement (ROADMAP §3.11's remaining "cluster/region labels
 * still outside the unified label-deconfliction pass").
 *
 * `deconflictLabels` only ever compared labels to labels, so island coastlines
 * were invisible to it and a region name — anchored at its cluster's spatial
 * medoid — practically always landed on top of one. These tests pin the
 * behaviour that fixes it without turning the label layer into a rank: a name
 * moves off an obstacle, an accepted name blocks later ones, the outcome stays
 * a discrete label|dot, and the result is deterministic.
 */
import { describe, expect, it } from 'vitest';
import { placeLabels, type LabelBox, type LabelObstacle } from '../src/pixi/atlas-lod';

const box = (id: string, sx: number, sy: number, priority = 1, halfW = 40, halfH = 12): LabelBox =>
  ({ id, priority, sx, sy, halfW, halfH });
const obstacle = (sx: number, sy: number, halfW = 30, halfH = 30): LabelObstacle => ({ sx, sy, halfW, halfH });

const overlaps = (a: { sx: number; sy: number; halfW: number; halfH: number }, b: LabelObstacle, pad = 0) =>
  Math.abs(a.sx - b.sx) < a.halfW + b.halfW + pad && Math.abs(a.sy - b.sy) < a.halfH + b.halfH + pad;

describe('placeLabels', () => {
  it('leaves a label alone when its anchor is already clear', () => {
    const out = placeLabels([box('a', 500, 300)], [obstacle(900, 900)]);
    expect(out.get('a')).toEqual({ verdict: 'label', sx: 500, sy: 300 });
  });

  it('moves a label off an island glyph instead of deleting it', () => {
    const glyph = obstacle(500, 300, 60, 40);
    const out = placeLabels([box('region', 500, 300)], [glyph]);
    const placed = out.get('region')!;
    expect(placed.verdict).toBe('label');
    expect(overlaps({ ...placed, halfW: 40, halfH: 12 }, glyph)).toBe(false);
  });

  it('prefers a vertical nudge — a name above its region still reads as its name', () => {
    const out = placeLabels([box('r', 500, 300)], [obstacle(500, 300, 60, 40)]);
    const placed = out.get('r')!;
    expect(placed.sx).toBe(500);
    expect(placed.sy).not.toBe(300);
  });

  it('treats an accepted label as an obstacle, so one pass resolves everything', () => {
    // Both anchored at the same point; the loser must move, not overlap.
    const out = placeLabels([box('hi', 400, 200, 9), box('lo', 400, 200, 1)], []);
    const hi = out.get('hi')!;
    const lo = out.get('lo')!;
    expect(hi).toEqual({ verdict: 'label', sx: 400, sy: 200 });
    expect(lo.verdict).toBe('label');
    expect(overlaps({ ...lo, halfW: 40, halfH: 12 }, { ...hi, halfW: 40, halfH: 12 })).toBe(false);
  });

  it('honours pad so surviving labels keep a breath apart', () => {
    const pad = 14;
    const out = placeLabels([box('a', 400, 200, 9), box('b', 400, 200, 1)], [], { pad });
    const a = out.get('a')!;
    const b = out.get('b')!;
    expect(overlaps({ ...b, halfW: 40, halfH: 12 }, { ...a, halfW: 40, halfH: 12 }, pad)).toBe(false);
  });

  it('demotes to a dot at its anchor when the neighbourhood is genuinely full', () => {
    // A dense wall of obstacles across every candidate ring.
    const wall: LabelObstacle[] = [];
    for (let x = -600; x <= 600; x += 40) for (let y = -600; y <= 600; y += 40) wall.push(obstacle(500 + x, 300 + y, 30, 30));
    const out = placeLabels([box('r', 500, 300)], wall, { rings: 3 });
    expect(out.get('r')).toEqual({ verdict: 'dot', sx: 500, sy: 300 });
  });

  it('keeps the discrete label|dot outcome — never a size or rank ramp', () => {
    const out = placeLabels([box('a', 100, 100, 5), box('b', 100, 100, 3)], [obstacle(100, 100)]);
    for (const p of out.values()) expect(['label', 'dot']).toContain(p.verdict);
  });

  it('respects the label budget regardless of free space', () => {
    const boxes = Array.from({ length: 6 }, (_, i) => box(`b${i}`, 200 + i * 300, 200, 6 - i));
    const out = placeLabels(boxes, [], { maxLabels: 2 });
    const labelled = [...out.values()].filter((p) => p.verdict === 'label');
    expect(labelled).toHaveLength(2);
    // The budget goes to the highest priorities, not to whoever came first.
    expect(out.get('b0')!.verdict).toBe('label');
    expect(out.get('b1')!.verdict).toBe('label');
  });

  it('is deterministic for equal priorities, whatever the input order', () => {
    const run = (ids: string[]) => {
      const out = placeLabels(ids.map((id) => box(id, 300, 300)), []);
      return ids.slice().sort().map((id) => `${id}:${out.get(id)!.sx},${out.get(id)!.sy}`);
    };
    expect(run(['a', 'b', 'c'])).toEqual(run(['c', 'a', 'b']));
  });

  it('returns a placement for every input id', () => {
    const boxes = Array.from({ length: 20 }, (_, i) => box(`b${i}`, (i % 5) * 120, Math.floor(i / 5) * 60));
    const out = placeLabels(boxes, [obstacle(240, 60)]);
    expect(out.size).toBe(20);
    for (const b of boxes) expect(out.has(b.id)).toBe(true);
  });

  it('never places a label on an obstacle it was given', () => {
    const glyphs = Array.from({ length: 24 }, (_, i) => obstacle(120 + (i % 6) * 190, 120 + Math.floor(i / 6) * 170, 46, 34));
    const boxes = Array.from({ length: 8 }, (_, i) => box(`r${i}`, 120 + (i % 4) * 190, 120 + Math.floor(i / 4) * 170, 8 - i, 52, 13));
    const out = placeLabels(boxes, glyphs, { pad: 8 });
    for (const b of boxes) {
      const p = out.get(b.id)!;
      if (p.verdict !== 'label') continue;
      for (const g of glyphs) {
        expect(overlaps({ sx: p.sx, sy: p.sy, halfW: b.halfW, halfH: b.halfH }, g, 8)).toBe(false);
      }
    }
  });

  it('never nudges a label off the sheet — clipped reads worse than overlapped', () => {
    const bounds = { minX: 0, minY: 0, maxX: 1000, maxY: 600 };
    // Anchored hard against the top-left corner and sitting on a glyph, so the
    // only escapes are outward. It must stay inside or demote, never clip.
    const out = placeLabels([box('corner', 60, 30)], [obstacle(60, 30, 60, 40)], { bounds });
    const p = out.get('corner')!;
    if (p.verdict === 'label' && (p.sx !== 60 || p.sy !== 30)) {
      expect(p.sx - 40).toBeGreaterThanOrEqual(bounds.minX);
      expect(p.sy - 12).toBeGreaterThanOrEqual(bounds.minY);
      expect(p.sx + 40).toBeLessThanOrEqual(bounds.maxX);
      expect(p.sy + 12).toBeLessThanOrEqual(bounds.maxY);
    }
  });

  it('lets a partly-scrolled-off label keep its true anchor rather than sliding back in', () => {
    // Nothing collides, so the label never moves — bounds constrain nudges, not
    // honest positions. A name that slid inward would point at the wrong water.
    const out = placeLabels([box('edge', -20, 300)], [], { bounds: { minX: 0, minY: 0, maxX: 1000, maxY: 600 } });
    expect(out.get('edge')).toEqual({ verdict: 'label', sx: -20, sy: 300 });
  });

  it('demotes rather than clipping when every in-bounds candidate is taken', () => {
    const bounds = { minX: 0, minY: 0, maxX: 200, maxY: 120 };
    const wall = [obstacle(100, 60, 100, 60)];
    const out = placeLabels([box('r', 100, 60)], wall, { bounds });
    expect(out.get('r')).toEqual({ verdict: 'dot', sx: 100, sy: 60 });
  });

  it('handles an empty input without inventing anything', () => {
    expect(placeLabels([], [obstacle(10, 10)]).size).toBe(0);
    expect(placeLabels([box('a', 5, 5)]).get('a')).toEqual({ verdict: 'label', sx: 5, sy: 5 });
  });
});

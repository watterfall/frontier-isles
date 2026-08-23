import { describe, expect, it } from 'vitest';
import { DATA } from '../../api/fallback';
import { buildAtlasScene } from '../atlasData';

/**
 * Clickability is a property of the plane the atlas RENDERS, not of the
 * authored `chart.x/y` literals.
 *
 * This gate exists because a change can pass every authored-coordinate check
 * and still ship a stacked map. When the atlas went 176 → 371 islands, the
 * authored plane measured a healthy 25.5px closest pair — the wave-3 suite and
 * `audit:atlas` both said so — while the rendered plane had collapsed to 3.2px
 * with 142 pairs under 40px. The authored positions all live inside the flat
 * twin's fixed 1440×900 viewBox, so doubling the corpus doubled the density the
 * atlas solver had to absorb without giving it any more world to work with.
 *
 * So: measure after `buildAtlasScene`, which is what the visitor actually sees.
 */
describe('atlas rendered-plane separation', () => {
  const scene = buildAtlasScene(DATA);

  const nearestNeighbours = () => {
    const p = scene.islands;
    const out: Array<{ d: number; a: string; b: string }> = [];
    for (let i = 0; i < p.length; i++) {
      let best = Infinity;
      let mate = '';
      for (let j = 0; j < p.length; j++) {
        if (i === j) continue;
        const d = Math.hypot(p[i]!.x - p[j]!.x, p[i]!.y - p[j]!.y);
        if (d < best) { best = d; mate = p[j]!.slug; }
      }
      out.push({ d: best, a: p[i]!.slug, b: mate });
    }
    return out.sort((x, y) => x.d - y.d);
  };

  it('projects every island, losing none', () => {
    expect(scene.islands).toHaveLength(DATA.length);
    expect(new Set(scene.islands.map((i) => i.slug)).size).toBe(DATA.length);
  });

  it('keeps the closest rendered pair clickable', () => {
    const nn = nearestNeighbours();
    const tightest = nn[0]!;
    // A mound's hit area is tens of px across; below ~28px centre-to-centre the
    // smaller of the two cannot be reliably hovered or tapped.
    expect(tightest.d, `tightest rendered pair: ${tightest.a} ↔ ${tightest.b}`).toBeGreaterThan(28);
  });

  it('does not let a dense tail form behind a healthy median', () => {
    const nn = nearestNeighbours();
    const p10 = nn[Math.floor(nn.length * 0.1)]!.d;
    // The median can look fine while the tightest decile is unusable — that is
    // precisely how the 176 → 371 regression hid. Gate the tail, not the middle.
    expect(p10, 'p10 of rendered nearest-neighbour distance').toBeGreaterThan(45);
  });

  it('grows the world with the corpus instead of packing it tighter', () => {
    const xs = scene.islands.map((i) => i.x);
    const ys = scene.islands.map((i) => i.y);
    const area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
    const perIsland = area / scene.islands.length;
    // Hexagonal room for the solver's own 140px target is ~17,000px² per island.
    // If a future wave adds islands without the world growing, this fails before
    // the map does.
    expect(perIsland, 'rendered world area per island').toBeGreaterThan(14000);
  });
});

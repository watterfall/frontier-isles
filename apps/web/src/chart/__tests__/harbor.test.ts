import { describe, expect, it } from 'vitest';
import { DATA, SAMPLE_SLUG } from '../../api/fallback';
import { buildAtlasScene } from '../atlasData';
import { buildHarborView } from '../harbor';

// One scene for the suite — buildAtlasScene is deterministic (invariant 13).
const scene = buildAtlasScene(DATA);

describe('buildHarborView — My Harbor fog over the rendered scene (§3(d))', () => {
  it('harbor islands carry zero fog; unrelated islands reach the ceiling of 1', () => {
    const view = buildHarborView(scene, 'github:shen-kuo', [SAMPLE_SLUG])!;
    expect(view.slugs).toEqual([SAMPLE_SLUG]);
    expect(view.fog.get(SAMPLE_SLUG)).toBe(0);
    const levels = [...view.fog.values()];
    expect(Math.max(...levels)).toBe(1);
  });

  it('fog is graded, not binary: co-archipelago neighbours sit strictly between home and open ocean', () => {
    const view = buildHarborView(scene, 'github:shen-kuo', [SAMPLE_SLUG])!;
    expect([...view.fog.values()].some((level) => level > 0 && level < 1)).toBe(true);
  });

  it('fog is a filter, not a wall: EVERY scene island gets a finite level (invariant 4)', () => {
    const view = buildHarborView(scene, 'github:shen-kuo', [SAMPLE_SLUG])!;
    expect(view.fog.size).toBe(scene.islands.length);
    for (const level of view.fog.values()) {
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(1);
    }
  });

  it('empty or scene-unknown footprint yields null — the removal test §3(d)④', () => {
    expect(buildHarborView(scene, 'github:new', [])).toBeNull();
    expect(buildHarborView(scene, 'github:new', ['no-such-isle'])).toBeNull();
  });
});

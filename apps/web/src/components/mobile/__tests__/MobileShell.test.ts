import { describe, expect, it } from 'vitest';
import { DATA } from '../../../api/fallback';
import { buildMobileHierarchy } from '../MobileShell';

describe('buildMobileHierarchy — compact nested atlas projection', () => {
  it('reduces the 129-island phone overview to eight geometry anchors', () => {
    const hierarchy = buildMobileHierarchy(DATA);
    expect([...hierarchy.values()].filter((item) => item.role === 'anchor')).toHaveLength(8);
    // 129 islands (128 curated + sample) = 8 anchors + 121 satellites. The anchor
    // cap is fixed at 8 regardless of N (CLAUDE.md: ≤8 anchors on the phone).
    expect([...hierarchy.values()].filter((item) => item.role === 'satellite')).toHaveLength(121);
  });

  it('gives every satellite a real anchor parent', () => {
    const hierarchy = buildMobileHierarchy(DATA);
    const anchors = new Set([...hierarchy.values()].filter((item) => item.role === 'anchor').map((item) => item.slug));
    for (const item of hierarchy.values()) {
      if (item.role === 'satellite') expect(anchors.has(item.parentSlug ?? '')).toBe(true);
    }
  });

  it('navigation roles do not change when activity changes', () => {
    const original = buildMobileHierarchy(DATA);
    const changed = buildMobileHierarchy(DATA.map((island, index) => ({ ...island, a: index % 2 ? 0 : 100 })));
    expect([...changed].map(([id, item]) => [id, item.role, item.parentSlug])).toEqual([...original].map(([id, item]) => [id, item.role, item.parentSlug]));
  });
});

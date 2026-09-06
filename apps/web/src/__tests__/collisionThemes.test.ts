import { describe, expect, it } from 'vitest';
import { validateExplorationCatalog } from '@frontier-isles/data/xfrontier-exploration';
import snapshot from '../data/exploration-catalog.json';
import { COLLISION_THEMES, COLLISION_TENSIONS, thematicCollisions } from '../data/collisionThemes';
const catalog = validateExplorationCatalog(snapshot);
describe('editorial cross-domain lenses', () => {
  it('only names existing MCP questions and has actual source routes in every lens', () => {
    for (const theme of COLLISION_THEMES) {
      for (const id of theme.ids) expect(catalog.questions.some((q) => q.id === id), id).toBe(true);
      expect(thematicCollisions(catalog, theme.ids).length, theme.id).toBeGreaterThan(0);
    }
  });
  it('ties each specific transfer critique to an existing pair rather than inventing a source edge', () => {
    for (const item of COLLISION_TENSIONS) expect(catalog.collisions.some((pair) => item.ids.includes(pair.a as never) && item.ids.includes(pair.b as never))).toBe(true);
  });
});

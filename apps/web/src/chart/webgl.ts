/**
 * hasWebGL — a cheap SYNCHRONOUS WebGL probe with no `pixi.js` import, so
 * checking never pulls the engine into the main bundle (atlas-world-plan.md
 * W1: PixiJS must stay lazy/dynamic-import-only). Used by `AtlasChartScreen`
 * to decide, before even requesting the atlas chunk, whether to render it or
 * go straight to the SVG `ChartScreen` fallback (CLAUDE.md: the app must
 * render with no GPU present).
 *
 * Node/SSR-safe: no `document` global (the web package's vitest `environment:
 * 'node'`) → treated as unsupported → the SVG fallback, which is exactly the
 * behaviour under test (no jsdom canvas/WebGL to fake either way).
 */
export function hasWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { AtlasChartScreen } from '../AtlasChartScreen';
import { ChartScreen, type ChartScreenProps } from '../ChartScreen';
import { DATA } from '../../../api/fallback';
import { zh } from '../../../i18n/zh';
import { en } from '../../../i18n/en';

// Both screens call `useTranslation()`; no other test in this suite renders an
// i18n-consuming tree, so bootstrap a real (not app-singleton-dependent)
// i18next instance here, self-contained — same resources as `src/i18n/index.ts`
// minus its localStorage/document side effects (irrelevant under vitest node env).
void i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh }, en: { translation: en } },
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
  returnNull: false,
});

/**
 * This suite runs under vitest's `environment: 'node'` (no jsdom/canvas), so
 * `hasWebGL()` is unconditionally `false` here (see `chart/webgl.ts` — no
 * `document` global ⇒ unsupported). That means `AtlasChartScreen` takes its
 * SVG-fallback branch for every render below, which is exactly the invariant
 * this suite pins: "SVG fallback preserved" (atlas-world-plan.md §5 / CLAUDE.md
 * — the app must render with no GPU present). It also means these tests never
 * touch the lazy `AtlasChartHost`/pixi.js import path at all — that path is
 * only exercised by the browser (the screenshot proof), not vitest.
 */
const baseProps: ChartScreenProps = {
  islands: DATA,
  hover: null,
  onHover: () => {},
  onIsland: () => {},
  onBuild: () => {},
  onCollide: () => {},
};

describe('AtlasChartScreen — SVG fallback preserved (no WebGL in this test env)', () => {
  it('renders BYTE-IDENTICAL markup to the plain ChartScreen when WebGL is unavailable', () => {
    const atlas = renderToStaticMarkup(<AtlasChartScreen {...baseProps} />);
    const svg = renderToStaticMarkup(<ChartScreen {...baseProps} />);
    expect(atlas).toBe(svg);
  });

  it('still shows the hover island card content via the shared ChartScreen path', () => {
    const withHover: ChartScreenProps = { ...baseProps, hover: DATA[0]!.id };
    const atlas = renderToStaticMarkup(<AtlasChartScreen {...withHover} />);
    expect(atlas).toContain(DATA[0]!.q.zh);
  });

  it('never crashes for an empty island list (server-absent-safe boundary)', () => {
    expect(() => renderToStaticMarkup(<AtlasChartScreen {...baseProps} islands={[]} />)).not.toThrow();
  });
});

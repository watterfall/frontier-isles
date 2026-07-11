import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import { INTERIORS } from '@frontier-isles/data';
import { StationInteriorDrawer } from '../StationInteriorDrawer';
import { zh } from '../../../i18n/zh';
import { en } from '../../../i18n/en';

// Self-contained i18n instance (same pattern as AtlasChartScreen.test.tsx) —
// the drawer calls useTranslation() for every station title and section label.
void i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh }, en: { translation: en } },
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
  returnNull: false,
});

const ALL_STATIONS: StationKind[] = [
  'library', 'canvas', 'questions', 'data', 'workshop', 'gallery', 'tearoom', 'driftwood', 'dock',
];

describe('StationInteriorDrawer', () => {
  const interior = INTERIORS['formal-math']!;

  it('renders every station kind without throwing (mapping is exhaustive)', () => {
    for (const station of ALL_STATIONS) {
      const html = renderToStaticMarkup(
        <StationInteriorDrawer station={station} interior={interior} lang="zh" onClose={() => {}} />,
      );
      expect(html, `station ${station} renders`).toBeTruthy();
      expect(html).toContain('L2 站点内景抽屉');
      expect(html).toContain(`data-station="${station}"`);
    }
  });

  it('the Question Wall station shows the real first question text', () => {
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station="questions" interior={interior} lang="zh" onClose={() => {}} />,
    );
    expect(html).toContain(interior.questions[0]!.text.zh);
    // the author badge is rendered too
    expect(html).toContain(interior.questions[0]!.author.zh);
  });

  it('the Workshop station renders a real prototype scrap', () => {
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station="workshop" interior={interior} lang="zh" onClose={() => {}} />,
    );
    expect(html).toContain(interior.workshop[0]!.text.zh);
    expect(html).toContain(interior.workshop[0]!.author.zh);
  });

  it('the Gallery station renders an exhibited result with its citation', () => {
    const cited = interior.gallery.find((g) => g.cite)!;
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station="gallery" interior={interior} lang="en" onClose={() => {}} />,
    );
    expect(html).toContain(cited.cite!.title);
    expect(html).toContain(String(cited.cite!.year));
  });

  it('the Tearoom station renders an informal musing', () => {
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station="tearoom" interior={interior} lang="zh" onClose={() => {}} />,
    );
    expect(html).toContain(interior.tearoom[0]!.text.zh);
  });

  it('the Library station renders a real citation title and venue', () => {
    const cited = interior.digests.find((d) => d.cite)!;
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station="library" interior={interior} lang="en" onClose={() => {}} />,
    );
    expect(html).toContain(cited.cite!.title);
    expect(html).toContain(String(cited.cite!.year));
  });

  it('respects lang: en renders the English parallels', () => {
    // Pick a question whose en text has no straight quotes (renderToStaticMarkup
    // HTML-escapes " → &quot;, which would break a naive substring match).
    const plain = interior.questions.find((q) => !q.text.en.includes('"'))!;
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station="questions" interior={interior} lang="en" onClose={() => {}} />,
    );
    expect(html).toContain(plain.text.en);
  });

  it('is closed (translated off-canvas) when station is null', () => {
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station={null} interior={interior} lang="zh" onClose={() => {}} />,
    );
    expect(html).toContain('translateX(108%)');
  });

  it('shows the empty-state note when the island has no interior', () => {
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station="questions" interior={undefined} lang="zh" onClose={() => {}} />,
    );
    expect(html).toContain(zh.island.interior.empty);
  });
});

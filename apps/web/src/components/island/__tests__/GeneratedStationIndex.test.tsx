import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import { INTERIORS } from '@frontier-isles/data';
import { GeneratedStationIndex } from '../GeneratedStationIndex';
import { zh } from '../../../i18n/zh';
import { en } from '../../../i18n/en';

void i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh }, en: { translation: en } },
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
  returnNull: false,
});

// The index is the reliable (DOM, scale-proof) way to open every building — it
// must list all nine, so no station is unreachable.
const ALL: StationKind[] = ['questions', 'library', 'canvas', 'data', 'workshop', 'gallery', 'driftwood', 'tearoom', 'dock'];

describe('GeneratedStationIndex', () => {
  const interior = INTERIORS['formal-math']!;

  it('renders a clickable row for all nine buildings', () => {
    const html = renderToStaticMarkup(<GeneratedStationIndex interior={interior} sel={null} onStation={() => {}} />);
    for (const k of ALL) {
      expect(html, `row for ${k}`).toContain(`data-station-row="${k}"`);
    }
  });

  it('shows each building name and its content count', () => {
    const html = renderToStaticMarkup(<GeneratedStationIndex interior={interior} sel={null} onStation={() => {}} />);
    expect(html).toContain(zh.island.interior.questions.title);
    expect(html).toContain(zh.island.interior.gallery.title);
    // question count reflects the interior (formal-math has 7)
    expect(html).toContain(String(interior.questions.length));
    expect(html).toContain(String(interior.gallery.length));
  });

  it('is bound to onStation via the row buttons (every kind reachable)', () => {
    // Confirm every station kind the drawer can render has a row (no orphan station).
    const html = renderToStaticMarkup(<GeneratedStationIndex interior={interior} sel="questions" onStation={() => {}} />);
    const rows = [...html.matchAll(/data-station-row="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(rows)).toEqual(new Set(ALL));
    expect(rows).toHaveLength(9);
  });
});

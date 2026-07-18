import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import { Scene } from '../scene/Scene';
import { zh } from '../i18n/zh';
import { en } from '../i18n/en';

// Self-contained i18n instance (same pattern as StationInteriorDrawer.test.tsx).
void i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh }, en: { translation: en } },
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
  returnNull: false,
});

const markup = (activeStations?: ReadonlySet<StationKind>) => renderToStaticMarkup(
  <Scene
    night={true}
    nightT={86}
    selKey={null}
    transTo={null}
    onStation={() => {}}
    activeStations={activeStations}
  />,
);

describe('hero per-station night lamps (B.1 caveat — event-driven, like the Pixi islands)', () => {
  it('lights a lamp only on stations active in the ledger slice', () => {
    const html = markup(new Set<StationKind>(['workshop', 'gallery']));
    expect(html).toContain('data-lamp="workshop"');
    expect(html).toContain('data-lamp="gallery"');
    expect(html).not.toContain('data-lamp="questions"');
  });

  it('draws no lamps at all without a ledger (offline look unchanged)', () => {
    expect(markup(undefined)).not.toContain('data-lamp');
  });
});

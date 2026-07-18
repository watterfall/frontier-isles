import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { BRIDGES } from '@frontier-isles/data/bridges';
import { CollisionOverlay } from '../CollisionOverlay';
import { zh } from '../../../i18n/zh';
import { en } from '../../../i18n/en';

// Self-contained i18n instance (same pattern as StationInteriorDrawer.test.tsx).
void i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh }, en: { translation: en } },
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
  returnNull: false,
});

const markup = () => renderToStaticMarkup(<CollisionOverlay onCollide={() => {}} onClose={() => {}} />);

describe('CollisionOverlay — a11y pass (ROADMAP §3.13/§3.15)', () => {
  it('is a labelled modal dialog', () => {
    const html = markup();
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="fi-collision-title"');
    expect(html).toContain('id="fi-collision-title"');
  });

  it('close and every bridge card are real buttons', () => {
    const html = markup();
    expect(html).toContain('fi-panel-close');
    expect(html).toContain(`aria-label="${zh.panel.close}"`);
    // close + one card per bridge
    expect((html.match(/<button /g) ?? []).length).toBe(1 + BRIDGES.length);
  });

  it('footnote ink meets AA on the night wash (#5E574A gone)', () => {
    expect(markup()).not.toContain('#5E574A');
  });
});

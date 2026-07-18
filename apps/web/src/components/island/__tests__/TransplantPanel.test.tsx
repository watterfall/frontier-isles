import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { TransplantPanel } from '../TransplantPanel';
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

// SSR: effects never run, so the driftwood fetch stays pending and the panel
// renders its loading body — chrome assertions are exactly what we need here.
const markup = () => renderToStaticMarkup(
  <TransplantPanel slug="machine-curiosity" actor="github:tester" lang="zh" onClose={() => {}} onToast={() => {}} />,
);

describe('TransplantPanel — a11y pass (ROADMAP §3.13/§3.15)', () => {
  it('is a labelled modal dialog', () => {
    const html = markup();
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="fi-transplant-title"');
    expect(html).toContain('id="fi-transplant-title"');
  });

  it('scrim and close are real labelled buttons', () => {
    const html = markup();
    expect(html).toContain('fi-panel-scrim');
    expect(html).toContain('fi-panel-close');
    expect(html).toContain(`aria-label="${zh.panel.close}"`);
    expect((html.match(/<button /g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it('AA footer ink (no #A89C88 pale text remains)', () => {
    expect(markup()).not.toContain('#A89C88');
  });
});

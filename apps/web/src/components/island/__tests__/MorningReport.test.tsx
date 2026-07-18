import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { MorningReport } from '../MorningReport';
import { zh } from '../../../i18n/zh';
import { en } from '../../../i18n/en';

// Self-contained i18n instance (same pattern as ClaimDetailPanel.test.tsx).
void i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh }, en: { translation: en } },
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
  returnNull: false,
});

// renderToStaticMarkup does not run useEffect, so the panel paints its static
// BRIEF fallback seed (source === 'loading') — every draft shows the pending
// adopt/return controls, which is exactly what this a11y pass touches.
describe('MorningReport — a11y pass (ROADMAP §3.13/§3.15)', () => {
  it('renders adopt/return as real buttons carrying a 44px hit target', () => {
    const html = renderToStaticMarkup(<MorningReport actor="test-actor" />);
    expect(html).toContain('<button');
    expect(html).toContain(zh.island.morning.adopt);
    expect(html).toContain(zh.island.morning.return);
    expect(html).toContain('class="fi-hit"');
  });

  it('marks the decorative seal glyph aria-hidden', () => {
    const html = renderToStaticMarkup(<MorningReport actor="test-actor" />);
    expect(html).toContain('aria-hidden="true"');
  });

  it('stays an in-flow panel — no dialog semantics added', () => {
    const html = renderToStaticMarkup(<MorningReport actor="test-actor" />);
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('aria-modal');
  });
});

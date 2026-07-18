import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { RitualEvent } from '../../../scene/rituals';
import { RitualEventPanel } from '../RitualEventPanel';
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

const EVENT: RitualEvent = {
  id: '2026-07-18T00:00:00Z:publish:sha256:abcdef0123456789',
  kind: 'lantern',
  ts: '2026-07-18T00:00:00Z',
  op: 'publish',
  ref: 'sha256:abcdef0123456789',
  actorId: 'scout-01',
};

describe('RitualEventPanel — a11y pass (ROADMAP §3.13/§3.15)', () => {
  it('renders nothing when closed', () => {
    expect(renderToStaticMarkup(<RitualEventPanel event={null} onClose={() => {}} />)).toBe('');
  });

  it('is a labelled modal dialog', () => {
    const html = renderToStaticMarkup(<RitualEventPanel event={EVENT} onClose={() => {}} />);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="fi-ritual-title"');
    expect(html).toContain('id="fi-ritual-title"');
  });

  it('scrim and close are real labelled buttons, not clickable divs', () => {
    const html = renderToStaticMarkup(<RitualEventPanel event={EVENT} onClose={() => {}} />);
    expect(html).toContain('fi-panel-scrim');
    expect(html).toContain('fi-panel-close');
    const buttons = html.match(/<button /g) ?? [];
    expect(buttons.length).toBe(2);
    expect(html).toContain(`aria-label="${zh.panel.close}"`);
  });
});

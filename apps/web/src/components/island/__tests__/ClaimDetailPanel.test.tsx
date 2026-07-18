import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { ClaimState } from '@frontier-isles/core';
import { ClaimDetailPanel } from '../ClaimDetailPanel';
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

const CLAIM: ClaimState = {
  ref: 'sha256:abcdef0123456789',
  island: 'machine-curiosity',
  foundation: true,
  floors: 2,
  roof: false,
  hasDoi: false,
  activity: 5,
};

describe('ClaimDetailPanel — a11y pass (ROADMAP §3.13/§3.15)', () => {
  it('renders nothing when closed', () => {
    expect(renderToStaticMarkup(<ClaimDetailPanel claim={null} onClose={() => {}} />)).toBe('');
  });

  it('is a labelled modal dialog', () => {
    const html = renderToStaticMarkup(<ClaimDetailPanel claim={CLAIM} onClose={() => {}} />);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="fi-claim-title"');
    expect(html).toContain('id="fi-claim-title"');
  });

  it('scrim and close are real labelled buttons, not clickable divs', () => {
    const html = renderToStaticMarkup(<ClaimDetailPanel claim={CLAIM} onClose={() => {}} />);
    expect(html).toContain('fi-panel-scrim');
    expect(html).toContain('fi-panel-close');
    const buttons = html.match(/<button /g) ?? [];
    expect(buttons.length).toBe(2);
    expect(html).toContain(`aria-label="${zh.panel.close}"`);
  });
});

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ListTwin } from '../ListTwin';
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

const props = { sel: null, stFilter: '全部', onStFilter: () => {}, onStation: () => {} } as const;

describe('ListTwin — a11y pass (ROADMAP §3.13/§3.15)', () => {
  it('renders filter chips as real toggle buttons with a 44px hit target', () => {
    const html = renderToStaticMarkup(<ListTwin {...props} />);
    expect(html).toContain('aria-pressed="true"'); // the active 全部 chip
    expect(html).toContain('class="fi-hit"');
    expect(html).toContain(zh.island.twin.chips['全部']);
  });

  it('marks each station glyph seal aria-hidden (decorative)', () => {
    const html = renderToStaticMarkup(<ListTwin {...props} />);
    expect(html).toContain('aria-hidden="true"');
  });

  it('renders every station row as a real button (chips + one per station)', () => {
    const html = renderToStaticMarkup(<ListTwin {...props} />);
    const buttons = html.match(/<button/g) ?? [];
    expect(buttons.length).toBeGreaterThan(3);
  });
});

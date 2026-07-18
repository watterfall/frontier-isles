import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DriftwoodModal } from '../DriftwoodModal';
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

const noop = () => {};
const baseProps = {
  onClose: noop,
  driftDest: null as string | null,
  transTo: null as string | null,
  onMove: noop,
  onToWorkshop: noop,
  onToCanvas: noop,
};

describe('DriftwoodModal — a11y pass (ROADMAP §3.13/§3.15)', () => {
  it('is a labelled modal dialog', () => {
    const html = renderToStaticMarkup(<DriftwoodModal {...baseProps} />);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="fi-drift-title"');
    expect(html).toContain('id="fi-drift-title"');
  });

  it('scrim, close and the Move action are real buttons, not clickable divs', () => {
    const html = renderToStaticMarkup(<DriftwoodModal {...baseProps} />);
    expect(html).toContain('fi-panel-scrim');
    expect(html).toContain('fi-panel-close');
    // Idle state (driftDest null, no transplant): scrim + close + the Move pill.
    const buttons = html.match(/<button /g) ?? [];
    expect(buttons.length).toBe(3);
    expect(html).toContain(`aria-label="${zh.panel.close}"`);
  });

  it('transplant picker renders its 实验坊/白板厅 options as buttons', () => {
    const html = renderToStaticMarkup(<DriftwoodModal {...baseProps} driftDest="choosing" />);
    // Choosing state: scrim + close + workshop + canvas options.
    const buttons = html.match(/<button /g) ?? [];
    expect(buttons.length).toBe(4);
  });
});

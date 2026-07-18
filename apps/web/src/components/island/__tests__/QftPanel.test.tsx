import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { QuestionDatum } from '../../../api/fallback';
import { QftPanel } from '../QftPanel';
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

const QS: QuestionDatum[] = [
  { i: 1, text: { zh: '问题一', en: 'Question one' }, open: true, votes: 3 },
  { i: 2, text: { zh: '问题二', en: 'Question two' }, open: false, votes: 0, rw: true, orig: { zh: '原问', en: 'Original' } },
];

const markup = (open: boolean) => renderToStaticMarkup(
  <QftPanel
    open={open}
    onClose={() => {}}
    qs={QS}
    voted={{ 0: true }}
    focusIdx={null}
    advOn={true}
    onCloseAdv={() => {}}
    onToggle={() => {}}
    onVote={() => {}}
    onFocus={() => {}}
  />,
);

describe('QftPanel — a11y pass (ROADMAP §3.13/§3.15)', () => {
  it('is a labelled modal dialog that tracks open state via aria-hidden', () => {
    expect(markup(true)).toContain('aria-hidden="false"');
    expect(markup(false)).toContain('aria-hidden="true"');
    const html = markup(true);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="fi-qft-title"');
    expect(html).toContain('id="fi-qft-title"');
  });

  it('closed panel leaves the tab order (hidden visibility + scrim tabindex -1)', () => {
    const html = markup(false);
    expect(html).toContain('visibility:hidden');
    expect(html).toContain('tabindex="-1"');
  });

  it('toggle / vote / focus / advanced-close are real buttons with state semantics', () => {
    const html = markup(true);
    // per question: toggle (aria-pressed=open) + vote (aria-pressed=didVote); plus scrim, close, adv close, doFocus
    expect((html.match(/<button /g) ?? []).length).toBeGreaterThanOrEqual(2 * QS.length + 4);
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain(`aria-label="${zh.panel.close}"`);
  });

  it('AA pale-ink fixes hold (no #A89C88 text color remains — dashes/borders may keep it)', () => {
    const html = markup(true);
    expect(html).not.toContain('color:#A89C88');
  });
});

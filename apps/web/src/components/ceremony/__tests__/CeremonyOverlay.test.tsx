import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { CeremonyOverlay } from '../CeremonyOverlay';
import { initialCeremony, type CeremonyState } from '../../../state/ceremonyReducer';
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

const at = (rit: number, extra: Partial<CeremonyState> = {}): CeremonyState => ({
  ...initialCeremony(),
  rit,
  ...extra,
});

const markup = (state: CeremonyState) => renderToStaticMarkup(
  <CeremonyOverlay state={state} dispatch={() => {}} onAbort={() => {}} onFinish={() => {}} />,
);

describe('CeremonyOverlay — a11y pass (ROADMAP §3.13/§3.15)', () => {
  it('is a labelled modal dialog with the abort as a real button', () => {
    const html = markup(at(0));
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="fi-ceremony-title"');
    expect(html).toContain('id="fi-ceremony-title"');
    expect(html).toContain(zh.ceremony.abort);
  });

  it('chapter primaries and chips are real buttons (ch0 ignite, ch1 candidates, ch2 toggles)', () => {
    expect(markup(at(0))).toMatch(/<button[^>]*>[^<]*<\/button>|<button/);
    const ch1 = markup(at(1));
    expect((ch1.match(/<button /g) ?? []).length).toBeGreaterThanOrEqual(3);
    const ch2 = markup(at(2, { ritAdded: [0, 1] }));
    expect(ch2).toContain('aria-expanded');
  });

  it('ch3 vote and ch4 name pick carry aria-pressed', () => {
    const ch3 = markup(at(3, { ritAdded: [0, 1] }));
    expect(ch3).toContain('aria-pressed');
    const ch4 = markup(at(4, { ritAdded: [0], ritFocus: 0 }));
    expect(ch4).toContain('aria-pressed');
  });

  /**
   * Interactive elements that are not `<button>` or `<a>`.
   *
   * This case used to assert `not.toContain('#5F6C8E')` — the colour that
   * commit e5070ec removed from source when it converted these divs to
   * buttons. Verified by injection, that tracked the hex and not the property:
   * a `<span role="button" tabIndex={0} onClick>` styled any other colour left
   * the suite green, while the same span styled `#5F6C8E` turned it red. The
   * assertion was as strong as a guess about how the regression would look,
   * and the case's own name promised something broader.
   */
  const scanTags = (html: string) =>
    [...html.matchAll(/<([a-z]+)\b([^>]*)>/g)].map((m) => ({ tag: m[1] ?? '', attrs: m[2] ?? '' }));

  const isClickable = ({ tag, attrs }: { tag: string; attrs: string }) =>
    tag !== 'button' && tag !== 'a'
    && (/\brole="button"/.test(attrs) || /\btabindex=/i.test(attrs));

  it('no clickable div/span remains (every handler sits on a button)', () => {
    for (const state of [at(0), at(1), at(2, { ritAdded: [0] }), at(3, { ritAdded: [0] }), at(4, { ritAdded: [0], ritFocus: 0 })]) {
      const html = markup(state);
      const tags = scanTags(html);
      // Pin the SCANNER, not just the markup. An empty offender list is also
      // what a scan that matched nothing produces — and the `?? ''` defaults
      // above would turn a broken match into a silently well-formed empty
      // entry. Counting the buttons the scan itself found closes both.
      expect(tags.filter((t) => t.tag === 'button').length, 'buttons seen by the scan')
        .toBeGreaterThan(0);
      expect(tags.filter(isClickable).map(({ tag, attrs }) => `<${tag}${attrs}>`),
        'interactive elements that are not button/a').toEqual([]);
      // Kept as a named regression guard for the specific styling that was
      // removed — narrow on purpose, and no longer the only thing checked.
      expect(html).not.toContain('#5F6C8E');
    }
  });
});

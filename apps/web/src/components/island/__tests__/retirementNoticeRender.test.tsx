// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { zh } from '../../../i18n/zh';
import { en } from '../../../i18n/en';

/**
 * Why this file exists, and why it is the only jsdom test in the suite.
 *
 * `retirementNotice.test.ts` covers the DATA behind this notice — that `atlasN`
 * survives the fallback projection, that exactly one island's record is
 * retired, that the wording never reads as "answered". A mutation run showed
 * what it does not cover: forcing the notice's JSX off in
 * `GeneratedIslandScreen` turned ZERO tests red, in the file named after it.
 * A test that cannot fail when its subject is deleted is not coverage, and
 * unlike an UNTESTED marker it does not admit that.
 *
 * The rest of this suite renders with `renderToStaticMarkup`, which never runs
 * effects — and this screen returns a loading placeholder until three pieces of
 * effect-filled state arrive, so SSR cannot reach the notice at all. Written
 * that way first, the two "notice is absent" cases passed against a placeholder
 * containing no markup whatsoever: green, and measuring nothing. Hence a real
 * client render, confined to this file by the docblock above so the other 64
 * files keep their node environment.
 *
 * Every assertion here was checked by mutation: with `{retirement && (` forced
 * false in the screen, the first test fails.
 */

const DETAIL = {
  object: { title: 'Perennial grain crops', qfocus: 'Can perennial grains reach annual parity?', status: 'open' as const },
  domain: '生命',
  chart: { x: 0.5, y: 0.5, scale: 1, activity: 3, members: 2 },
  growth: { stage: 'hut' as const },
  tide: { A: 1, B: 1, D: 1, N: 3 },
  eventCount: 4,
  memberships: [{ actorId: 'github:someone', actorKind: 'human', role: null, aiKind: null }],
  atlas: {
    scores: [3, 3, 3, 3, 3, 3, 3, 3, 3],
    cluster: { code: 'C31', zh: '农业与食物系统', en: 'Agriculture and food systems' },
    citation: { url: 'https://example.org/kernza', title: 'Perennial grain agronomy', venue: 'Field Crops Research', year: 2024 },
    brief: { zh: '多年生谷物能否达到一年生小麦的产量水平。', en: 'Whether perennial grains can reach annual-wheat yields.' },
  },
};

vi.mock('../../../api/client', () => ({
  api: {
    island: vi.fn(async () => DETAIL),
    // Null ledger on purpose: it is the offline shape, and it keeps the screen
    // off `relationRefResolver` and the ritual path, so this file measures the
    // notice rather than the whole L1 pipeline.
    ledger: vi.fn(async () => null),
    structures: vi.fn(async () => null),
    relationRefResolver: vi.fn(async () => undefined),
    problemMdUrl: (slug: string) => `/problems/${slug}.md`,
    ledgerJsonlUrl: (slug: string) => `/ledger/${slug}.jsonl`,
  },
}));

beforeAll(() => {
  void i18n.use(initReactI18next).init({
    resources: { zh: { translation: zh }, en: { translation: en } },
    lng: 'zh',
    fallbackLng: 'zh',
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

const baseProps = {
  night: false,
  onToggleNight: () => {},
  onBack: () => {},
  onStation: () => {},
  actor: 'github:test',
  onToast: () => {},
};

/** Mount the real screen and let its effects settle, then read the DOM. */
async function renderScreen(props: Record<string, unknown>): Promise<string> {
  const { GeneratedIslandScreen } = await import('../GeneratedIslandScreen');
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(<GeneratedIslandScreen {...baseProps} {...props} slug="perennial-grain-crops" />);
  });
  // The screen's load effect awaits a real dynamic import, so a single
  // microtask flush is not enough and a fixed count would be a race. Poll for
  // the placeholder to clear, and on timeout return whatever is there — the
  // guard test then fails on the placeholder, loudly, instead of this helper
  // deciding quietly that the screen was ready.
  // A fixed iteration count was still a race — 60 × 5ms gave the screen's
  // dynamic import 300ms, which a shared CI runner overran, so the guard test
  // failed against the placeholder on every push after 2026-08-23. Wait on a
  // deadline instead, generous where the clock is slow, and still return
  // whatever is there when it passes so the guard fails loudly.
  const deadline = Date.now() + (process.env.CI ? 20_000 : 4_000);
  while (Date.now() < deadline && host.innerHTML.includes('fi-island-state')) {
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
  }
  const html = host.innerHTML;
  await act(async () => { root.unmount(); });
  host.remove();
  return html;
}

describe('retired-source notice — rendered, not merely computable', () => {
  it('reaches the screen body at all (guards every assertion below)', async () => {
    // Without this the two absence cases below would pass against a loading
    // placeholder — which is exactly how the first draft of this file was green
    // while testing nothing.
    const html = await renderScreen({ atlasN: 1449 });
    expect(html).not.toContain('fi-island-state');
    expect(html).toContain('fi-science-passage');
  });

  it('appears on the island whose cited record was retired upstream', async () => {
    const html = await renderScreen({ atlasN: 1449 });
    expect(html).toContain('fi-island-retired');
    // The reason code, verbatim from the frozen ledger — not a paraphrase.
    expect(html).toContain('too_mature_or_applied');
    // The scope sentence is the load-bearing half: without it the notice reads
    // as "this question was answered", which this island's own text contradicts.
    expect(html).toContain(zh.island.retired.scope);
  });

  it('stays absent when the cited record is live', async () => {
    const html = await renderScreen({ atlasN: 1 });
    expect(html).toContain('fi-science-passage');
    expect(html).not.toContain('fi-island-retired');
  });

  it('stays absent when the screen is given no record at all', async () => {
    // The sample island carries no `atlasN`. A notice firing here would assert
    // a retirement for a record the screen was never told about.
    const html = await renderScreen({});
    expect(html).toContain('fi-science-passage');
    expect(html).not.toContain('fi-island-retired');
  });
});

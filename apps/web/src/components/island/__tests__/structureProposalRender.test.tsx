// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { FRONTIERS } from '@frontier-isles/data/frontiers';
import { STRUCTURE_PROPOSALS } from '@frontier-isles/data/structure-proposals';
import { zh } from '../../../i18n/zh';
import { en } from '../../../i18n/en';

/**
 * The proposal queue has to be visible on the screen a reader actually opens.
 *
 * A proposal layer that exists only in `packages/data` and in the audit's
 * output is the failure this work was scoped against from the start: the
 * capability lands in a side artefact and the island page is unchanged. The
 * data package's own tests prove the pointers resolve; only a render proves a
 * human is ever shown the result.
 *
 * Renders under jsdom for the same reason `retirementNoticeRender.test.tsx`
 * does: the rest of the suite uses `renderToStaticMarkup`, which never runs
 * effects, and this screen shows a loading placeholder until effect-filled
 * state arrives — so an SSR test would assert against markup that contains
 * nothing and pass.
 */

const SUBJECT = STRUCTURE_PROPOSALS[0]!;
const ISLAND = FRONTIERS.find((f) => f.slug === SUBJECT.slug)!;

const DETAIL = {
  object: { title: 'Proximal causal identification', qfocus: ISLAND.qfocus?.zh ?? '', status: 'open' as const },
  domain: '交叉',
  chart: { x: 0.5, y: 0.5, scale: 1, activity: 2, members: 1 },
  growth: { stage: 'hut' as const },
  tide: { A: 1, B: 1, D: 1, N: 3 },
  eventCount: 2,
  memberships: [{ actorId: 'github:someone', actorKind: 'human', role: null, aiKind: null }],
  atlas: {
    scores: [3, 3, 3, 3, 3, 3, 3, 3, 3],
    cluster: { code: 'C07', zh: '因果推断', en: 'Causal inference' },
    citation: { url: 'https://example.org/proximal', title: 'Proximal causal learning', venue: 'Biometrika', year: 2024 },
    brief: { zh: '近端因果学习。', en: 'Proximal causal learning.' },
    // The island's REAL authored depth. The proposal points into it by index,
    // so a fabricated fixture would resolve to fabricated evidence and the
    // assertions below would be checking this file against itself.
    depth: ISLAND.depth,
  },
};

vi.mock('../../../api/client', () => ({
  api: {
    island: vi.fn(async () => DETAIL),
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

async function renderScreen(slug: string): Promise<string> {
  const { GeneratedIslandScreen } = await import('../GeneratedIslandScreen');
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(
      <GeneratedIslandScreen
        slug={slug}
        night={false}
        onToggleNight={() => {}}
        onBack={() => {}}
        onStation={() => {}}
        actor="github:test"
        onToast={() => {}}
      />,
    );
  });
  for (let i = 0; i < 60 && host.innerHTML.includes('fi-island-state'); i++) {
    await act(async () => { await new Promise((r) => setTimeout(r, 5)); });
  }
  const html = host.innerHTML;
  await act(async () => { root.unmount(); });
  host.remove();
  return html;
}

describe('structure proposal — shown on the island, marked unratified', () => {
  it('renders the screen body at all (guards every assertion below)', async () => {
    const html = await renderScreen(SUBJECT.slug);
    expect(html).not.toContain('fi-island-state');
    expect(html).toContain('fi-science-passage');
  });

  it('shows the proposal with the quantity and the island\'s own evidence', async () => {
    const html = await renderScreen(SUBJECT.slug);
    expect(html).toContain('fi-island-proposal');
    expect(html).toContain('structure-proposal');
    // The check sentence is the only authored prose, and the part that tells a
    // reviewer what to do. An edit that shortens it away should fail here.
    expect(html).toContain(SUBJECT.check.zh);
  });

  it('never lets the proposal read as an established relation', async () => {
    // The wording is the whole safeguard: this is a queue item awaiting a human,
    // and a page that presents it as a relation has silently turned a proposal
    // into coverage.
    const html = await renderScreen(SUBJECT.slug);
    expect(html).toContain(zh.island.proposal.unratified);
    expect(zh.island.proposal.title).toMatch(/待人工批准/);
    expect(zh.island.proposal.note).toMatch(/不计入/);
    expect(en.island.proposal.title.toLowerCase()).toContain('awaiting human ratification');
    expect(en.island.proposal.note.toLowerCase()).toContain('counts toward no relational layer');
  });

  it('stays absent on an island with no proposal', async () => {
    const other = FRONTIERS.find((f) => !STRUCTURE_PROPOSALS.some((p) => p.slug === f.slug))!;
    const html = await renderScreen(other.slug);
    // Positive counterpart first — otherwise this passes against a screen that
    // rendered nothing, which is how the sibling render test was green while
    // measuring nothing on its first draft.
    expect(html).toContain('fi-science-passage');
    expect(html).not.toContain('fi-island-proposal');
  });
});

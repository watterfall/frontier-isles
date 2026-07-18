import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import { INTERIORS } from '@frontier-isles/data/interiors';
import { StationInteriorDrawer } from '../StationInteriorDrawer';
import { projectBuildingFloors } from '../islandDepth';
import { zh } from '../../../i18n/zh';
import { en } from '../../../i18n/en';

// Self-contained i18n instance (same pattern as AtlasChartScreen.test.tsx) —
// the drawer calls useTranslation() for every station title and section label.
void i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh }, en: { translation: en } },
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
  returnNull: false,
});

const ALL_STATIONS: StationKind[] = [
  'library', 'canvas', 'questions', 'data', 'workshop', 'gallery', 'tearoom', 'driftwood', 'dock',
];

const depth = {
  overview: { zh: '形式化知识概览', en: 'Formal knowledge overview' },
  whyMatters: { zh: '重要', en: 'Important' },
  ifAnswered: { zh: '若回答', en: 'If answered' },
  approaches: [{ zh: '路径一', en: 'Route one' }, { zh: '路径二', en: 'Route two' }],
  barrier: { zh: '硬骨头', en: 'Hard problem' },
  subQuestions: [{ zh: '子问', en: 'Subquestion' }],
};

describe('StationInteriorDrawer', () => {
  const interior = INTERIORS['formal-math']!;
  const planOf = (station: StationKind) => projectBuildingFloors({
    station,
    qfocus: { zh: '机器能否理解并创造数学？', en: 'Can machines understand and create mathematics?' },
    depth,
    interior,
  });
  const floorWith = (
    station: StationKind,
    predicate: (item: ReturnType<typeof planOf>['floors'][number]['items'][number]) => boolean,
  ) => {
    const plan = planOf(station);
    const floor = plan.floors.find((candidate) => candidate.items.some(predicate));
    expect(floor, `station ${station} has the requested projected floor`).toBeDefined();
    return { plan, floorId: floor!.id };
  };

  it('renders every station kind without throwing (mapping is exhaustive)', () => {
    for (const station of ALL_STATIONS) {
      const html = renderToStaticMarkup(
        <StationInteriorDrawer station={station} plan={planOf(station)} lang="zh" onClose={() => {}} />,
      );
      expect(html, `station ${station} renders`).toBeTruthy();
      expect(html).toContain('L2 站点内景抽屉');
      expect(html).toContain(`data-station="${station}"`);
    }
  });

  it('the Question Wall station shows the real first question text', () => {
    const { plan, floorId } = floorWith('questions', (item) => item.kind === 'question' && item.question === interior.questions[0]);
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station="questions" plan={plan} initialFloorId={floorId} lang="zh" onClose={() => {}} />,
    );
    expect(html).toContain(interior.questions[0]!.text.zh);
    // the author badge is rendered too
    expect(html).toContain(interior.questions[0]!.author.zh);
  });

  it('the Workshop station renders a real prototype scrap', () => {
    const { plan, floorId } = floorWith('workshop', (item) => item.kind === 'scrap' && item.scrap === interior.workshop[0]);
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station="workshop" plan={plan} initialFloorId={floorId} lang="zh" onClose={() => {}} />,
    );
    expect(html).toContain(interior.workshop[0]!.text.zh);
    expect(html).toContain(interior.workshop[0]!.author.zh);
  });

  it('the Gallery station renders an exhibited result with its citation', () => {
    const cited = interior.gallery.find((g) => g.cite)!;
    const { plan, floorId } = floorWith('gallery', (item) => item.kind === 'gallery' && item.gallery === cited);
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station="gallery" plan={plan} initialFloorId={floorId} lang="en" onClose={() => {}} />,
    );
    expect(html).toContain(cited.cite!.title);
    expect(html).toContain(String(cited.cite!.year));
  });

  it('the Tearoom station renders an informal musing', () => {
    const { plan, floorId } = floorWith('tearoom', (item) => item.kind === 'scrap' && item.scrap === interior.tearoom[0]);
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station="tearoom" plan={plan} initialFloorId={floorId} lang="zh" onClose={() => {}} />,
    );
    expect(html).toContain(interior.tearoom[0]!.text.zh);
  });

  it('the Library station renders a real citation title and venue', () => {
    const cited = interior.digests.find((d) => d.cite)!;
    const { plan, floorId } = floorWith('library', (item) => item.kind === 'digest' && item.digest === cited);
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station="library" plan={plan} initialFloorId={floorId} lang="en" onClose={() => {}} />,
    );
    expect(html).toContain(cited.cite!.title);
    expect(html).toContain(String(cited.cite!.year));
  });

  it('respects lang: en renders the English parallels', () => {
    // Pick a question whose en text has no straight quotes (renderToStaticMarkup
    // HTML-escapes " → &quot;, which would break a naive substring match).
    const plain = interior.questions.find((q) => !q.text.en.includes('"'))!;
    const { plan, floorId } = floorWith('questions', (item) => item.kind === 'question' && item.question === plain);
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station="questions" plan={plan} initialFloorId={floorId} lang="en" onClose={() => {}} />,
    );
    expect(html).toContain(plain.text.en);
  });

  it('is closed and hidden from assistive technology when station is null', () => {
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station={null} plan={undefined} lang="zh" onClose={() => {}} />,
    );
    expect(html).toContain('aria-hidden="true"');
  });

  it('shows the empty-state note when a building plan has no floors', () => {
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station="questions" plan={{ station: 'questions', floors: [] }} lang="zh" onClose={() => {}} />,
    );
    expect(html).toContain(zh.island.interior.empty);
  });

  it('renders a semantic dialog, real close button, and multi-floor cutaway', () => {
    const plan = planOf('questions');
    const html = renderToStaticMarkup(
      <StationInteriorDrawer station="questions" plan={plan} lang="zh" onClose={() => {}} />,
    );
    expect(html).toContain('role="dialog"');
    expect(html).toContain('fi-interior-close');
    expect(html.match(/role="tab"/g)?.length).toBe(plan.floors.length);
  });
});

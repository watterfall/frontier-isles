import { describe, expect, it } from 'vitest';
import { INTERIORS } from '@frontier-isles/data/interiors';
import { frontierProgramOf, projectBuildingFloors, projectIslandDistricts } from '../islandDepth';
import { fallbackStructures } from '../../../api/structureFallback';

const stations = ['dock', 'tearoom', 'questions', 'canvas', 'library', 'data', 'workshop', 'driftwood', 'gallery'] as const;

describe('island district projection', () => {
  it('compresses live xfrontier cluster language into a spatial programme', () => {
    expect(frontierProgramOf({ zh: '无知测绘·盲区科学', en: 'Mapping Ignorance & Scientific Blind Spots' }, '交叉')).toBe('unknowns');
    expect(frontierProgramOf({ zh: '数字孪生·虚拟科学', en: 'Digital twins · virtual science' }, '生命')).toBe('simulation');
    expect(frontierProgramOf(undefined, '生命')).toBe('living');
  });

  it('opens a truthful Harbor → Inquiry → Archive/Works → Observatory survey route', () => {
    const base = {
      slug: 'formal-math', domain: '数理' as const,
      cluster: { zh: 'AI数学·形式科学', en: 'AI mathematics · formal science' },
      stage: 2, status: 'active', stations,
      ledgerActions: ['propose_subquestion', 'validate', 'publish'],
      literatureCount: 4, hasInterior: true, openQuestionCount: 3,
    };
    let map = projectIslandDistricts({ ...base, surveyed: [] });
    expect(map.districts.map((district) => [district.id, district.state])).toEqual([
      ['harbor', 'available'], ['inquiry', 'sealed'], ['archive', 'sealed'], ['works', 'sealed'], ['observatory', 'sealed'],
    ]);
    map = projectIslandDistricts({ ...base, surveyed: ['harbor'] });
    expect(map.districts.find((district) => district.id === 'inquiry')?.state).toBe('available');
    map = projectIslandDistricts({ ...base, surveyed: ['harbor', 'inquiry'] });
    expect(map.districts.find((district) => district.id === 'archive')?.state).toBe('available');
    expect(map.districts.find((district) => district.id === 'works')?.state).toBe('available');
    map = projectIslandDistricts({ ...base, surveyed: ['harbor', 'inquiry', 'archive', 'works'] });
    expect(map.districts.find((district) => district.id === 'observatory')?.state).toBe('available');
  });

  it('keeps evidence-less districts sealed and marks only a selected structure crossing', () => {
    const structure = fallbackStructures()[0]!;
    const map = projectIslandDistricts({
      slug: 'empty', domain: '物质', stage: 0, status: 'open', stations,
      ledgerActions: [], literatureCount: 0, hasInterior: false, openQuestionCount: 1,
      surveyed: ['harbor', 'inquiry'], activeStructure: structure,
    });
    expect(map.districts.find((district) => district.id === 'archive')?.state).toBe('sealed');
    expect(map.districts.filter((district) => district.structureCrossing).map((district) => district.id)).toEqual(['harbor', 'works', 'observatory']);
  });
});

describe('building floor projection', () => {
  const depth = {
    overview: { zh: '概览', en: 'Overview' }, whyMatters: { zh: '重要', en: 'Important' },
    ifAnswered: { zh: '若回答', en: 'If answered' },
    approaches: [{ zh: '路径一', en: 'Route one' }, { zh: '路径二', en: 'Route two' }, { zh: '路径三', en: 'Route three' }],
    barrier: { zh: '硬骨头', en: 'Hard problem' },
    subQuestions: [{ zh: '子问一', en: 'Subquestion one' }, { zh: '子问二', en: 'Subquestion two' }, { zh: '子问三', en: 'Subquestion three' }],
  };

  it('turns a rich Question Wall into distinct non-overlapping floors', () => {
    const interior = INTERIORS['formal-math']!;
    const plan = projectBuildingFloors({ station: 'questions', qfocus: { zh: '主问', en: 'Main question' }, depth, interior });
    expect(plan.floors.length).toBeGreaterThanOrEqual(3);
    expect(new Set(plan.floors.map((floor) => floor.id)).size).toBe(plan.floors.length);
    const renderedQuestions = plan.floors.flatMap((floor) => floor.items.filter((item) => item.kind === 'question').map((item) => item.question.text.zh));
    expect(new Set(renderedQuestions).size).toBe(renderedQuestions.length);
    expect(renderedQuestions.length).toBe(interior.questions.length);
  });

  it('gives a non-flagship island real baseline and depth floors', () => {
    const plan = projectBuildingFloors({ station: 'questions', qfocus: { zh: '主问', en: 'Main question' }, depth });
    expect(plan.floors[0]?.id).toBe('questions:ground');
    expect(plan.floors.length).toBe(3);
    expect(plan.floors.flatMap((floor) => floor.items).some((item) => item.kind === 'brief' && item.text.zh === '子问三')).toBe(true);
  });

  it('adds a sourced structure crossing floor only to Dock/Workshop plans', () => {
    const structure = fallbackStructures().find((item) => item.id.endsWith('intervention-identifiability'))!;
    const dock = projectBuildingFloors({ station: 'dock', qfocus: { zh: '主问', en: 'Main question' }, depth, activeStructure: structure });
    const library = projectBuildingFloors({ station: 'library', qfocus: { zh: '主问', en: 'Main question' }, depth, activeStructure: structure });
    expect(dock.floors.at(-1)?.items[0]).toMatchObject({ kind: 'structure', structure: { id: structure.id } });
    expect(library.floors.some((floor) => floor.source === 'structure')).toBe(false);
  });
});

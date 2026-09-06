import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { fallbackStructures } from '../../../api/structureFallback';
import { en } from '../../../i18n/en';
import { zh } from '../../../i18n/zh';
import { IslandDistrictMap } from '../IslandDistrictMap';
import { projectBuildingFloors, projectIslandDistricts } from '../islandDepth';

void i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh }, en: { translation: en } },
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
  returnNull: false,
});

const stations = ['dock', 'tearoom', 'questions', 'canvas', 'library', 'data', 'workshop', 'driftwood', 'gallery'] as const;

describe('IslandDistrictMap', () => {
  it('offers purpose-based wayfinding and directly reachable building destinations', () => {
    const activeStructure = fallbackStructures()[0]!;
    const projection = projectIslandDistricts({
      slug: 'formal-math',
      domain: '数理',
      cluster: { zh: 'AI数学·形式科学', en: 'AI mathematics · formal science' },
      stage: 2,
      status: 'active',
      stations,
      ledgerActions: ['propose_subquestion', 'validate', 'publish'],
      literatureCount: 4,
      hasInterior: true,
      openQuestionCount: 3,
      surveyed: ['harbor'],
      activeStructure,
    });
    const dockPlan = projectBuildingFloors({
      station: 'dock',
      qfocus: { zh: '机器能否理解并创造数学？', en: 'Can machines understand and create mathematics?' },
      activeStructure,
    });
    const markup = renderToStaticMarkup(
      <IslandDistrictMap
        projection={projection}
        plans={stations.map(station => projectBuildingFloors({ station, qfocus:{zh:'问题',en:'Question'} }))}
        visitedFloors={{ dock: ['dock:ground'] }}
        activeStructure={activeStructure}
        lang="zh"
        onSurvey={() => {}}
        onStation={() => {}}
      />,
    );

    expect(markup).toContain('data-testid="island-district-map"');
    expect(markup).toContain('按研究用途寻找建筑');
    expect(markup).toContain('data-station-row="questions"');
    expect(markup).toContain('data-station-row="canvas"');
    expect(markup).not.toContain('disabled');
    expect(markup).not.toContain('已访问');
  });
});

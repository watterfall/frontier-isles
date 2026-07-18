import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import type { ApiStructure } from '../../api/client';
import type { IslandDistrictId } from '../../state/explorationSession';
import type { BuildingFloorPlan, IslandDistrictProjection } from './islandDepth';

export interface IslandDistrictMapProps {
  projection: IslandDistrictProjection;
  plans: readonly BuildingFloorPlan[];
  visitedFloors: Record<string, readonly string[]>;
  activeStructure?: ApiStructure | null;
  lang: 'zh' | 'en';
  onSurvey: (districtId: IslandDistrictId) => void;
  onStation: (station: StationKind) => void;
}

const STATION_NAMES: Record<StationKind, { zh: string; en: string; glyph: string }> = {
  dock: { zh: '连接工作台', en: 'Connection Workbench', glyph: '联' },
  questions: { zh: '问题墙', en: 'Question Wall', glyph: '问' },
  library: { zh: '文献阁', en: 'Library', glyph: '文' },
  canvas: { zh: '白板厅', en: 'Whiteboard Hall', glyph: '板' },
  data: { zh: '数据台', en: 'Data Desk', glyph: '数' },
  workshop: { zh: '实验坊', en: 'Workshop', glyph: '坊' },
  gallery: { zh: '展厅', en: 'Gallery', glyph: '展' },
  tearoom: { zh: '开放讨论', en: 'Open Discussion', glyph: '议' },
  driftwood: { zh: '散木园', en: 'Driftwood Garden', glyph: '木' },
};

const DISTRICT_ART: Array<{ id: IslandDistrictId; path: string; x: number; y: number }> = [
  { id: 'harbor', path: 'M20 110 Q38 82 76 90 Q90 116 69 142 Q36 148 20 110Z', x: 53, y: 116 },
  { id: 'inquiry', path: 'M54 51 Q82 24 120 42 Q130 73 104 99 Q69 100 54 51Z', x: 92, y: 65 },
  { id: 'archive', path: 'M122 24 Q164 7 190 39 Q190 75 153 84 Q119 67 122 24Z', x: 155, y: 46 },
  { id: 'works', path: 'M111 89 Q147 68 183 91 Q192 127 159 148 Q121 141 111 89Z', x: 151, y: 112 },
  { id: 'observatory', path: 'M190 48 Q226 24 264 48 Q272 91 238 113 Q199 103 190 48Z', x: 231, y: 70 },
];

export function IslandDistrictMap({
  projection,
  plans,
  visitedFloors,
  activeStructure,
  lang,
  onSurvey,
  onStation,
}: IslandDistrictMapProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const defaultDistrict = projection.districts.find((district) => district.state === 'surveyed')?.id ?? 'harbor';
  const [selectedId, setSelectedId] = useState<IslandDistrictId>(defaultDistrict);
  const selected = projection.districts.find((district) => district.id === selectedId) ?? projection.districts[0]!;
  const planByStation = useMemo(() => new Map(plans.map((plan) => [plan.station, plan])), [plans]);

  const selectDistrict = (id: IslandDistrictId): void => {
    const district = projection.districts.find((candidate) => candidate.id === id);
    if (!district || district.state === 'sealed') return;
    setSelectedId(id);
    if (district.state === 'available') onSurvey(id);
  };

  return (
    <aside className="fi-district-map" data-open={open || undefined} data-program={projection.program} data-testid="island-district-map">
      <button type="button" className="fi-district-map-toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span aria-hidden="true">域</span>
        <span><strong>{t('island.district.title')}</strong><small>{projection.programName[lang]}</small></span>
        <b aria-hidden="true">{open ? t('island.district.fold') : t('island.district.unfold')}</b>
      </button>

      {open && (
        <div className="fi-district-map-sheet">
          <header>
            <span>L1.5 · ISLAND DISTRICTS</span>
            <p>{t('island.district.localOnly')}</p>
          </header>

          <div className="fi-district-cartography" aria-hidden="true">
            <svg viewBox="0 0 286 160">
              <path className="fi-district-shore" d="M9 112 Q22 52 83 25 Q154 -4 235 30 Q283 52 274 102 Q258 151 177 154 Q91 166 31 143Z" />
              <path className="fi-district-route" d="M53 116 Q72 84 92 65 Q122 47 155 46 Q187 43 231 70 M92 65 Q118 94 151 112 Q191 106 231 70" />
              {activeStructure && <path className="fi-district-structure-route" d="M53 116 Q113 145 151 112 Q193 104 231 70" />}
              {DISTRICT_ART.map((art) => {
                const district = projection.districts.find((item) => item.id === art.id)!;
                return (
                  <g key={art.id} data-state={district.state} data-selected={selected.id === art.id || undefined} data-crossing={district.structureCrossing || undefined}>
                    <path className="fi-district-wash" d={art.path} />
                    <circle cx={art.x} cy={art.y} r="9" />
                    <text x={art.x} y={art.y + 3}>{district.name[lang].slice(0, 1)}</text>
                  </g>
                );
              })}
            </svg>
            {activeStructure && (
              <span className="fi-district-structure-seal">{t('island.district.structureRoute')} · {activeStructure.title[lang]}</span>
            )}
          </div>

          <ol className="fi-district-list" aria-label={t('island.district.listLabel')}>
            {projection.districts.map((district, index) => (
              <li key={district.id} data-state={district.state} data-selected={selected.id === district.id || undefined}>
                <button
                  type="button"
                  disabled={district.state === 'sealed'}
                  aria-current={selected.id === district.id ? 'true' : undefined}
                  onClick={() => selectDistrict(district.id)}
                >
                  <b>{String(index + 1).padStart(2, '0')}</b>
                  <span><strong>{district.name[lang]}</strong><small>{district.functionName[lang]}</small></span>
                  <em>{t(`island.district.state.${district.state}`)}</em>
                </button>
                {district.state === 'sealed' && <p>{district.reason[lang]}</p>}
              </li>
            ))}
          </ol>

          <section className="fi-district-detail" aria-live="polite">
            <div>
              <small>{selected.functionName[lang]}</small>
              <h3>{selected.name[lang]}</h3>
              <p>{selected.description[lang]}</p>
            </div>
            {selected.state === 'surveyed' ? (
              <div className="fi-district-buildings" aria-label={t('island.district.buildings')}>
                {selected.stations.length === 0 && <p>{t('island.district.noBuildings')}</p>}
                {selected.stations.map((station) => {
                  const plan = planByStation.get(station);
                  const visited = visitedFloors[station]?.length ?? 0;
                  return (
                    <button type="button" key={station} onClick={() => onStation(station)}>
                      <span aria-hidden="true">{STATION_NAMES[station].glyph}</span>
                      <span><strong>{STATION_NAMES[station][lang]}</strong><small>{t('island.district.floorCount', { count: plan?.floors.length ?? 1 })}{visited > 0 ? ` · ${t('island.district.visitedFloors', { count: visited })}` : ''}</small></span>
                      <b aria-hidden="true">→</b>
                    </button>
                  );
                })}
              </div>
            ) : selected.state === 'available' ? (
              <button type="button" className="fi-district-survey" onClick={() => selectDistrict(selected.id)}>
                <span aria-hidden="true">⌁</span>{t('island.district.survey')}
              </button>
            ) : (
              <p className="fi-district-sealed-note">{selected.reason[lang]}</p>
            )}
          </section>
        </div>
      )}
    </aside>
  );
}

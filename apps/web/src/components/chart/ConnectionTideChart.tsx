import { useId, useMemo, useState } from 'react';
import type { DomainKey } from '../../api/fallback';
import {
  buildConnectionTideSummary,
  type ConnectionField,
  type ConnectionFocus,
  type ConnectionPath,
} from '../../chart/connectionField';

const DOMAIN_LABELS: Record<DomainKey, { zh: string; en: string }> = {
  数理: { zh: '数理', en: 'Math' },
  物质: { zh: '物质', en: 'Matter' },
  生命: { zh: '生命', en: 'Life' },
  交叉: { zh: '交叉', en: 'Cross' },
};

const DOMAIN_POINTS: Record<DomainKey, { x: number; y: number }> = {
  数理: { x: 42, y: 30 },
  物质: { x: 278, y: 28 },
  生命: { x: 278, y: 112 },
  交叉: { x: 42, y: 110 },
};

const COPY = {
  zh: {
    kicker: '跨域实况',
    title: '碰撞潮汐',
    intro: '只画已有结构、桥梁与证据航线；领域相邻不会自动成为连接。',
    topicMeter: '主题水位',
    crossing: '已跨域',
    single: '单点',
    gap: '待映射',
    mapLabel: '四个领域之间已有直接研究关系的潮汐图',
    mapCaption: '线宽表示已有航线数量；整组仅含待核提议时使用虚线。',
    lanes: '选择一股潮汐',
    laneCount: (paths: number, problems: number) => `${paths} 条航线 · ${problems} 座岛`,
    ratified: '已有确认',
    proposed: '等待复核',
    recorded: '已有记录',
    more: (count: number) => `展开其余 ${count} 条航线`,
    empty: '目前还没有跨越顶层领域的直接关系。',
    kinds: {
      mathematical: '共用数学骨架',
      bridge: '可借用的桥',
      evidence: '支持材料',
      contradiction: '相反判断',
      lineage: '方法沿用',
    },
  },
  en: {
    kicker: 'Cross-field readings',
    title: 'Collision tides',
    intro: 'Only recorded structures, bridges, and evidence routes are drawn; proximity never becomes a connection.',
    topicMeter: 'Theme waterline',
    crossing: 'Cross-field',
    single: 'Single landing',
    gap: 'Unmapped',
    mapLabel: 'Tide chart of recorded direct research relations between four domains',
    mapCaption: 'Line width follows the number of recorded routes; a lane is dashed only when every route remains proposed.',
    lanes: 'Choose a tide',
    laneCount: (paths: number, problems: number) => `${paths} routes · ${problems} islands`,
    ratified: 'Confirmed',
    proposed: 'Awaiting review',
    recorded: 'On record',
    more: (count: number) => `Open ${count} more routes`,
    empty: 'No direct relation currently crosses the top-level domains.',
    kinds: {
      mathematical: 'Shared mathematical skeleton',
      bridge: 'Transferable bridge',
      evidence: 'Supporting material',
      contradiction: 'Contrasting judgment',
      lineage: 'Method lineage',
    },
  },
} as const;

function localized(value: { zh: string; en: string }, lang: 'zh' | 'en'): string {
  return value[lang] || value[lang === 'zh' ? 'en' : 'zh'];
}

function pathPair(path: ConnectionPath, lang: 'zh' | 'en'): string {
  return `${localized(path.from.title, lang)} ${lang === 'zh' ? '与' : 'and'} ${localized(path.to.title, lang)}`;
}

function pathStatement(path: ConnectionPath, lang: 'zh' | 'en'): string {
  if (path.kind === 'mathematical') {
    return lang === 'zh'
      ? `两边都用到：${localized(path.label, lang)}`
      : `Both use: ${localized(path.label, lang)}`;
  }
  return localized(path.label, lang);
}

function laneCurve(from: DomainKey, to: DomainKey, index: number): string {
  const a = DOMAIN_POINTS[from];
  const b = DOMAIN_POINTS[to];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const horizontal = Math.abs(dx) > Math.abs(dy) * 1.4;
  const bend = horizontal
    ? ((a.y + b.y) / 2 < 70 ? -22 : 22)
    : (index % 2 === 0 ? 17 : -17);
  const controlX = (a.x + b.x) / 2 + (-dy / length) * bend;
  const controlY = (a.y + b.y) / 2 + (dx / length) * bend;
  return `M ${a.x} ${a.y} Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${b.x} ${b.y}`;
}

export interface ConnectionTideChartProps {
  field: ConnectionField;
  lang: 'zh' | 'en';
  onFocus: (focus: ConnectionFocus) => void;
  variant?: 'panel' | 'mobile';
}

export function ConnectionTideChart({
  field,
  lang,
  onFocus,
  variant = 'panel',
}: ConnectionTideChartProps) {
  const copy = COPY[lang];
  const titleId = useId();
  const summary = useMemo(() => buildConnectionTideSummary(field), [field]);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const selectedLane = summary.lanes.find((lane) => lane.id === selectedLaneId) ?? summary.lanes[0] ?? null;
  const topicTotal = summary.topics.crossing + summary.topics.single + summary.topics.gap;
  const topicLabel = `${copy.topicMeter}: ${copy.crossing} ${summary.topics.crossing}, ${copy.single} ${summary.topics.single}, ${copy.gap} ${summary.topics.gap}`;

  const renderPath = (path: ConnectionPath) => (
    <button type="button" key={path.id} data-kind={path.kind} onClick={() => onFocus({ type: 'path', id: path.id })}>
      <i aria-hidden="true"><span /></i>
      <span>
        <small>
          {copy.kinds[path.kind]} · {path.maturity === 'ratified' ? copy.ratified : path.maturity === 'proposed' ? copy.proposed : copy.recorded}
        </small>
        <strong>{pathPair(path, lang)}</strong>
        <em>{pathStatement(path, lang)}</em>
      </span>
      <b aria-hidden="true">↗</b>
    </button>
  );

  return (
    <section className="fi-connection-tide" data-variant={variant} aria-labelledby={titleId}>
      <header>
        <span><small>{copy.kicker}</small><h2 id={titleId}>{copy.title}</h2></span>
        <p>{copy.intro}</p>
      </header>

      <div className="fi-connection-tide-meter" role="img" aria-label={topicLabel}>
        <span data-state="crossing" style={{ flexGrow: summary.topics.crossing || 0.25 }} />
        <span data-state="single" style={{ flexGrow: summary.topics.single || 0.25 }} />
        <span data-state="gap" style={{ flexGrow: summary.topics.gap || 0.25 }} />
      </div>
      <div className="fi-connection-tide-meter-labels" aria-hidden="true">
        <span>{copy.crossing} <b>{summary.topics.crossing}</b></span>
        <span>{copy.single} <b>{summary.topics.single}</b></span>
        <span>{copy.gap} <b>{summary.topics.gap}</b></span>
        <small>{topicTotal}</small>
      </div>

      {summary.lanes.length > 0 ? (
        <>
          <figure>
            <svg viewBox="0 0 320 140" role="img" aria-label={copy.mapLabel}>
              <path className="fi-connection-tide-contour" d="M8 73 Q72 48 137 69 T312 62" />
              <path className="fi-connection-tide-contour" d="M10 89 Q84 65 153 89 T310 82" />
              {summary.lanes.map((lane, index) => {
                const selected = lane.id === selectedLane?.id;
                const proposedOnly = lane.proposedCount === lane.paths.length;
                return (
                  <path
                    key={lane.id}
                    className="fi-connection-tide-lane"
                    data-selected={selected || undefined}
                    data-proposed={proposedOnly || undefined}
                    d={laneCurve(lane.domains[0], lane.domains[1], index)}
                    strokeWidth={1.1 + Math.min(4.2, Math.sqrt(lane.paths.length) * 1.25)}
                  />
                );
              })}
              {summary.domains.map(({ domain, problemCount, connectedProblemCount }) => {
                const point = DOMAIN_POINTS[domain];
                return (
                  <g key={domain} className="fi-connection-tide-domain" data-domain={domain} transform={`translate(${point.x} ${point.y})`}>
                    <circle r="15" />
                    <text textAnchor="middle" y="3">{DOMAIN_LABELS[domain][lang]}</text>
                    <text className="fi-connection-tide-domain-count" textAnchor="middle" y="26">{connectedProblemCount}/{problemCount}</text>
                  </g>
                );
              })}
            </svg>
            <figcaption>{copy.mapCaption}</figcaption>
          </figure>

          <nav className="fi-connection-tide-lanes" aria-label={copy.lanes}>
            {summary.lanes.map((lane) => (
              <button
                type="button"
                key={lane.id}
                aria-pressed={lane.id === selectedLane?.id}
                onClick={() => setSelectedLaneId(lane.id)}
              >
                <span>
                  <i data-domain={lane.domains[0]}>{DOMAIN_LABELS[lane.domains[0]][lang]}</i>
                  <b aria-hidden="true">↔</b>
                  <i data-domain={lane.domains[1]}>{DOMAIN_LABELS[lane.domains[1]][lang]}</i>
                </span>
                <small>{copy.laneCount(lane.paths.length, lane.problemCount)}</small>
              </button>
            ))}
          </nav>

          {selectedLane && (
            <div className="fi-connection-tide-routes" aria-live="polite">
              {selectedLane.paths.slice(0, 3).map(renderPath)}
              {selectedLane.paths.length > 3 && (
                <details>
                  <summary>{copy.more(selectedLane.paths.length - 3)}</summary>
                  {selectedLane.paths.slice(3).map(renderPath)}
                </details>
              )}
            </div>
          )}
        </>
      ) : <p className="fi-connection-tide-empty">{copy.empty}</p>}
    </section>
  );
}

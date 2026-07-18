import { oscillatorOrder, type OscillatorState } from '../../models/oscillators';
import { scalarFieldStats, type ScalarFieldState } from '../../models/scalarField';
import type { ModelLanguage, ModelSubstrateId } from '../../models/types';

const phaseDegrees = (phase: number): number => Math.round((phase / (Math.PI * 2)) * 360) % 360;

export function OscillatorVisual({ state, substrateId, lang }: {
  state: OscillatorState;
  substrateId: ModelSubstrateId;
  lang: ModelLanguage;
}) {
  const order = oscillatorOrder(state.phases);
  const label = lang === 'zh' ? '个体相位与整体同步程度' : 'Individual phases and group coherence';
  const positions = state.phases.map((phase, index) => {
    const column = index % 8;
    const row = Math.floor(index / 8);
    return {
      phase,
      x: 54 + column * 55 + (row % 2) * 13,
      y: 62 + row * 66,
      pulse: (Math.sin(phase) + 1) / 2,
    };
  });
  return (
    <div className="fi-model-visual fi-model-oscillator-visual">
      <svg viewBox="0 0 600 390" role="img" aria-label={label}>
        <g className="fi-model-oscillator-field" data-substrate={substrateId}>
          {positions.map((point, index) => {
            const next = positions[index + 1];
            return next && index % 8 !== 7
              ? <line key={`line-${index}`} x1={point.x} y1={point.y} x2={next.x} y2={next.y} />
              : null;
          })}
          {positions.map((point, index) => {
            const hand = 12;
            return (
              <g key={index} transform={`translate(${point.x} ${point.y})`}>
                <circle className="fi-model-unit-halo" r={10 + point.pulse * 8} opacity={0.08 + point.pulse * 0.26} />
                <circle className="fi-model-unit" r={substrateId === 'fireflies' ? 4 + point.pulse * 3 : 7} />
                <line className="fi-model-unit-hand" x1="0" y1="0" x2={Math.cos(point.phase) * hand} y2={Math.sin(point.phase) * hand} />
                <text y="24">{String(index + 1).padStart(2, '0')}</text>
              </g>
            );
          })}
        </g>
        <g className="fi-model-order-gauge" transform="translate(525 194)">
          <circle className="fi-model-order-track" r="48" />
          <circle className="fi-model-order-value" r="48" pathLength="100" strokeDasharray={`${order * 100} 100`} />
          <text className="fi-model-order-symbol" y="-4">R</text>
          <text className="fi-model-order-number" y="22">{order.toFixed(2)}</text>
          <text className="fi-model-order-caption" y="73">{lang === 'zh' ? '0 杂乱 · 1 同步' : '0 scattered · 1 synchronized'}</text>
        </g>
      </svg>
      <details className="fi-model-list-twin">
        <summary>{lang === 'zh' ? '用数字读取这幅图' : 'Read this view as numbers'}</summary>
        <p>{lang === 'zh' ? `当前整体同步程度 R = ${order.toFixed(3)}；模型时间 ${state.time.toFixed(1)}。` : `Current group coherence R = ${order.toFixed(3)}; model time ${state.time.toFixed(1)}.`}</p>
        <ol>
          {state.phases.slice(0, 12).map((phase, index) => (
            <li key={index}><span>#{String(index + 1).padStart(2, '0')}</span><strong>{phaseDegrees(phase)}°</strong></li>
          ))}
        </ol>
      </details>
    </div>
  );
}

function fieldColor(value: number, substrateId: ModelSubstrateId): string {
  const normalized = substrateId === 'electrostatic'
    ? Math.max(0, Math.min(1, (value + 1) / 2))
    : Math.max(0, Math.min(1, value));
  if (substrateId === 'electrostatic') {
    const hue = normalized < 0.5 ? 238 : 37;
    const strength = Math.abs(normalized - 0.5) * 2;
    return `oklch(${88 - strength * 36}% ${0.035 + strength * 0.12} ${hue})`;
  }
  const hue = substrateId === 'heat' ? 40 : substrateId === 'steady-flow' ? 211 : 151;
  return `oklch(${91 - normalized * 42}% ${0.025 + normalized * 0.13} ${hue})`;
}

export function ScalarFieldVisual({ state, lang }: { state: ScalarFieldState; lang: ModelLanguage }) {
  const stats = scalarFieldStats(state);
  const cell = Math.min(28, 330 / Math.max(state.width, state.height));
  const gridWidth = state.width * cell;
  const gridHeight = state.height * cell;
  const x0 = 44;
  const y0 = 26;
  const metric = state.substrateId === 'diffusion' ? stats.spread : stats.residual;
  const metricLabel = state.substrateId === 'diffusion'
    ? (lang === 'zh' ? '浓度极差' : 'concentration range')
    : (lang === 'zh' ? '局部残差' : 'local residual');
  return (
    <div className="fi-model-visual fi-model-field-visual">
      <svg viewBox="0 0 600 390" role="img" aria-label={lang === 'zh' ? '空间网格和整体读数' : 'Spatial grid and overall reading'}>
        <g transform={`translate(${x0} ${y0})`}>
          {state.values.map((value, index) => {
            const x = index % state.width;
            const y = Math.floor(index / state.width);
            return (
              <rect
                key={index}
                x={x * cell}
                y={y * cell}
                width={cell}
                height={cell}
                fill={fieldColor(value, state.substrateId)}
                data-fixed={state.fixed[index] || undefined}
              >
                <title>{`(${x}, ${y}) = ${value.toFixed(3)}${state.fixed[index] ? (lang === 'zh' ? '，固定边界' : ', fixed boundary') : ''}`}</title>
              </rect>
            );
          })}
          <path d={`M 0 ${gridHeight + 10} H ${gridWidth}`} />
          <text x="0" y={gridHeight + 29}>{lang === 'zh' ? '描边格 = 固定边界或源' : 'outlined cells = fixed boundary or source'}</text>
        </g>
        <g className="fi-model-field-gauge" transform="translate(490 90)">
          <text className="fi-model-field-metric-label">{metricLabel}</text>
          <text className="fi-model-field-metric-value" y="34">{metric.toFixed(3)}</text>
          <line y1="49" x2="75" y2="49" />
          <text y="72">min {stats.min.toFixed(2)}</text>
          <text y="91">max {stats.max.toFixed(2)}</text>
          <text y="110">mean {stats.mean.toFixed(2)}</text>
          <text y="129">step {state.steps}</text>
        </g>
      </svg>
      <details className="fi-model-list-twin">
        <summary>{lang === 'zh' ? '用数字读取这幅图' : 'Read this view as numbers'}</summary>
        <p>{lang === 'zh'
          ? `最小值 ${stats.min.toFixed(3)}，最大值 ${stats.max.toFixed(3)}，平均值 ${stats.mean.toFixed(3)}，局部残差 ${stats.residual.toFixed(4)}。`
          : `Minimum ${stats.min.toFixed(3)}, maximum ${stats.max.toFixed(3)}, mean ${stats.mean.toFixed(3)}, local residual ${stats.residual.toFixed(4)}.`}</p>
      </details>
    </div>
  );
}

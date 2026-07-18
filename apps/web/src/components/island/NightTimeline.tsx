import { useTranslation } from 'react-i18next';
import type { NightTimelineModel } from '@frontier-isles/core';

export interface NightTimelineProps {
  /** The ledger-driven timeline (ROADMAP B.2): nights + event markers. */
  model: NightTimelineModel;
  /** Current scrub night, 1..model.nights. */
  t: number;
  onT: (v: number) => void;
}

/** Golden by default; a few marker actions get their own hue. */
const MARKER_COLORS: Record<string, string> = {
  found_island: '#F5B94B', // gold — genesis
  publish: '#6FC3A0', // green — an artifact shipped
  adopt: '#6FC3A0',
  refute: '#E0765B', // ember — a claim fell
  transplant: '#7FA8E0', // current-blue — carried to another isle
  return_to_driftwood: '#B8A98E', // driftwood bone — shelved, not fallen
};

/**
 * The night-replay scrubber, now a pure view over a {@link NightTimelineModel}
 * (ROADMAP B.2: "timeline = event index", not the old seed 1..86/13/47/73%
 * constants). Dragging emits a night; the caller slices the ledger to that
 * night and re-projects (see nightReplay.ts). The caption tracks the latest
 * marker at or before the scrub night, translated per action.
 */
export function NightTimeline({ model, t: tv, onT }: NightTimelineProps) {
  const { t } = useTranslation();
  const nights = Math.max(1, model.nights);

  // "该夜或之前最近一个 marker" — latest marker whose night <= scrub night.
  const active = model.markers
    .filter((m) => m.night <= tv)
    .reduce<NightTimelineModel['markers'][number] | undefined>(
      (best, m) => (best === undefined || m.night >= best.night ? m : best),
      undefined,
    );
  const caption = active ? t(`island.night.marker.${active.action}`) : t('island.night.marker.silent');

  return (
    <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', width: 640, background: 'rgba(33,44,78,0.92)', border: '1px solid rgba(170,185,225,0.3)', borderRadius: 10, padding: '12px 18px', backdropFilter: 'blur(8px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, color: '#C9D0E4', fontFamily: "'Noto Serif SC',serif", fontWeight: 600 }}>
          {t('island.night.replay', { t: tv })} <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: '#8B94B2' }}>{t('island.night.of', { nights })}</span>
        </span>
        <span style={{ fontSize: 11.5, color: '#F5B94B' }}>{caption}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 10.5, color: '#8B94B2', whiteSpace: 'nowrap' }}>{t('island.night.genesis')}</span>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input type="range" min={1} max={nights} value={Math.min(nights, Math.max(1, tv))} onChange={(e) => onT(Number(e.target.value))} style={{ width: '100%', height: 20, cursor: 'pointer', accentColor: '#E3A93C' }} />
          {model.markers.map((m, i) => (
            <span
              key={`${m.index}-${i}`}
              title={t(`island.night.marker.${m.action}`)}
              style={{ position: 'absolute', left: `${m.pct}%`, top: -3, width: 5, height: 5, borderRadius: '50%', background: MARKER_COLORS[m.action] ?? '#F5B94B', pointerEvents: 'none' }}
            />
          ))}
        </div>
        <span style={{ fontSize: 10.5, color: '#8B94B2', whiteSpace: 'nowrap' }}>{t('island.night.tonight')}</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 10, color: '#8B94B2', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{t('island.night.footer')}</div>
    </div>
  );
}

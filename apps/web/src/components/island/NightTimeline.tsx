import { useTranslation } from 'react-i18next';

export interface NightTimelineProps {
  t: number;
  onT: (v: number) => void;
}

/** The night-replay scrubber (1..86) with event markers at 13/47/73%. */
export function NightTimeline({ t: tv, onT }: NightTimelineProps) {
  const { t } = useTranslation();
  const eventCaption = tv >= 63 ? t('island.night.events.n63') : tv >= 41 ? t('island.night.events.n41') : tv >= 12 ? t('island.night.events.n12') : t('island.night.events.genesis');

  return (
    <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', width: 640, background: 'rgba(33,44,78,0.92)', border: '1px solid rgba(170,185,225,0.3)', borderRadius: 10, padding: '12px 18px', backdropFilter: 'blur(8px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, color: '#C9D0E4', fontFamily: "'Noto Serif SC',serif", fontWeight: 600 }}>
          {t('island.night.replay', { t: tv })} <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: '#8B94B2' }}>{t('island.night.of')}</span>
        </span>
        <span style={{ fontSize: 11.5, color: '#F5B94B' }}>{eventCaption}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 10.5, color: '#8B94B2', whiteSpace: 'nowrap' }}>{t('island.night.genesis')}</span>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input type="range" min={1} max={86} value={tv} onChange={(e) => onT(Number(e.target.value))} style={{ width: '100%', height: 20, cursor: 'pointer', accentColor: '#E3A93C' }} />
          {[13, 47, 73].map((p) => (
            <span key={p} style={{ position: 'absolute', left: `${p}%`, top: -3, width: 5, height: 5, borderRadius: '50%', background: '#F5B94B', pointerEvents: 'none' }} />
          ))}
        </div>
        <span style={{ fontSize: 10.5, color: '#8B94B2', whiteSpace: 'nowrap' }}>{t('island.night.tonight')}</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 10, color: '#8B94B2', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{t('island.night.footer')}</div>
    </div>
  );
}

import { useTranslation } from 'react-i18next';

/** The signature day/night pill: sun / moon-lantern SVGs, knob sliding
 *  4px↔68px, background swap, 700ms — extracted verbatim from the prototype
 *  (lines ~385-390). */
export function DayNightLever({ night, onToggle }: { night: boolean; onToggle: () => void }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      <div
        onClick={onToggle}
        title={t('island.leverTitle')}
        style={{ pointerEvents: 'auto', cursor: 'pointer', width: 104, height: 40, borderRadius: 999, border: '1.5px solid var(--ink,#3A342B)', background: night ? '#212C4E' : '#F2EAD8', position: 'relative', transition: 'background .7s ease', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.12)' }}
      >
        <svg viewBox="0 0 24 24" style={{ position: 'absolute', left: 11, top: 9, width: 22, height: 22, opacity: night ? 0.35 : 1, transition: 'opacity .5s' }}>
          <circle cx="12" cy="12" r="5.5" fill="#E3A93C" stroke="#8A6A1E" strokeWidth="1" />
          <g stroke="#B5673A" strokeWidth="1.6" strokeLinecap="round">
            <line x1="12" y1="1.5" x2="12" y2="4.5" />
            <line x1="12" y1="19.5" x2="12" y2="22.5" />
            <line x1="1.5" y1="12" x2="4.5" y2="12" />
            <line x1="19.5" y1="12" x2="22.5" y2="12" />
            <line x1="4.6" y1="4.6" x2="6.7" y2="6.7" />
            <line x1="17.3" y1="17.3" x2="19.4" y2="19.4" />
            <line x1="4.6" y1="19.4" x2="6.7" y2="17.3" />
            <line x1="17.3" y1="6.7" x2="19.4" y2="4.6" />
          </g>
        </svg>
        <svg viewBox="0 0 24 24" style={{ position: 'absolute', right: 11, top: 9, width: 22, height: 22, opacity: night ? 1 : 0.35, transition: 'opacity .5s' }}>
          <line x1="12" y1="1" x2="12" y2="4" stroke="#8E99BE" strokeWidth="1.4" />
          <ellipse cx="12" cy="12" rx="7" ry="8.5" fill="#F5B94B" stroke="#B5673A" strokeWidth="1.2" />
          <path d="M 8.5 5 v 14 M 15.5 5 v 14" stroke="#B5673A" strokeWidth="0.8" fill="none" />
          <line x1="12" y1="20.5" x2="12" y2="23" stroke="#B5673A" strokeWidth="1.4" />
        </svg>
        <div style={{ position: 'absolute', top: 3.5, left: night ? 68 : 4, width: 31, height: 31, borderRadius: '50%', background: 'var(--card,#FBF6E9)', border: '1.5px solid var(--ink,#3A342B)', transition: 'left .45s cubic-bezier(0.22,1,0.36,1),background .7s' }} />
      </div>
      <div style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 11, color: 'var(--ink2,#6B6154)', background: 'var(--card,rgba(250,245,232,0.8))', borderRadius: 4, padding: '3px 8px', transition: 'color .7s' }}>
        {night ? t('island.modeNight') : t('island.modeDay')}
      </div>
    </div>
  );
}

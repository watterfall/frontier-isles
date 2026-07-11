import { useTranslation } from 'react-i18next';

/** The signature Day/Night interaction: one semantic, keyboard-operable lever. */
export function DayNightLever({ night, onToggle }: { night: boolean; onToggle: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="fi-day-night-wrap">
      <button type="button" className="fi-day-night-lever" data-night={night} onClick={onToggle} aria-pressed={night} aria-label={t('island.leverTitle')} title={t('island.leverTitle')}>
        <svg viewBox="0 0 24 24" className="fi-lever-sun" aria-hidden="true">
          <circle cx="12" cy="12" r="5.5" fill="#E3A93C" stroke="#8A6A1E" strokeWidth="1" />
          <g stroke="#B5673A" strokeWidth="1.6" strokeLinecap="round"><line x1="12" y1="1.5" x2="12" y2="4.5" /><line x1="12" y1="19.5" x2="12" y2="22.5" /><line x1="1.5" y1="12" x2="4.5" y2="12" /><line x1="19.5" y1="12" x2="22.5" y2="12" /><line x1="4.6" y1="4.6" x2="6.7" y2="6.7" /><line x1="17.3" y1="17.3" x2="19.4" y2="19.4" /><line x1="4.6" y1="19.4" x2="6.7" y2="17.3" /><line x1="17.3" y1="6.7" x2="19.4" y2="4.6" /></g>
        </svg>
        <svg viewBox="0 0 24 24" className="fi-lever-moon" aria-hidden="true">
          <line x1="12" y1="1" x2="12" y2="4" stroke="#8E99BE" strokeWidth="1.4" /><ellipse cx="12" cy="12" rx="7" ry="8.5" fill="#F5B94B" stroke="#B5673A" strokeWidth="1.2" /><path d="M 8.5 5 v 14 M 15.5 5 v 14" stroke="#B5673A" strokeWidth="0.8" fill="none" /><line x1="12" y1="20.5" x2="12" y2="23" stroke="#B5673A" strokeWidth="1.4" />
        </svg>
        <span className="fi-lever-knob" aria-hidden="true" />
      </button>
      <div className="fi-day-night-label"><span>{night ? '夜' : '昼'}</span><div><strong>{night ? t('island.modeNight') : t('island.modeDay')}</strong><small>{t('island.leverTitle')}</small></div></div>
    </div>
  );
}

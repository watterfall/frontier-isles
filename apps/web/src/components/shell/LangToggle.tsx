import { useTranslation } from 'react-i18next';
import { setLang } from '../../i18n';

/** The 中 / EN pill in the shell chrome (top-right, outside the 1440×900
 *  canvas art per the build spec). */
export function LangToggle() {
  const { i18n } = useTranslation();
  const cur = i18n.language === 'en' ? 'en' : 'zh';
  const next = cur === 'zh' ? 'en' : 'zh';
  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label="toggle language"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(250,245,232,0.95)',
        border: '1.5px solid #3A342B',
        borderRadius: 999,
        padding: '6px 14px',
        fontSize: 12.5,
        color: '#2B2620',
        cursor: 'pointer',
        fontFamily: "'PingFang SC',sans-serif",
        boxShadow: '2px 2px 0 rgba(58,48,36,0.12)',
      }}
    >
      <span style={{ fontWeight: cur === 'zh' ? 700 : 400, color: cur === 'zh' ? '#B5673A' : '#A89C88' }}>中</span>
      <span style={{ color: '#A89C88' }}>/</span>
      <span style={{ fontWeight: cur === 'en' ? 700 : 400, color: cur === 'en' ? '#B5673A' : '#A89C88', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>EN</span>
    </button>
  );
}

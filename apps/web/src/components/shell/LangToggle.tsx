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
      className="fi-shell-pill fi-lang-toggle"
      onClick={() => setLang(next)}
      aria-label={cur === 'zh' ? '切换至 English' : 'Switch to 中文'}
    >
      <span className="fi-lang-option" data-active={cur === 'zh'}>中</span>
      <span className="fi-lang-divider" aria-hidden="true">/</span>
      <span className="fi-lang-option fi-lang-option-en" data-active={cur === 'en'}>EN</span>
    </button>
  );
}

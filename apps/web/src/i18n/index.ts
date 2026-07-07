import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { zh } from './zh';
import { en } from './en';

const STORAGE_KEY = 'fi-lang';

export function initialLang(): 'zh' | 'en' {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch {
    /* SSR / no storage */
  }
  return 'zh';
}

void i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: initialLang(),
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function setLang(lng: 'zh' | 'en') {
  void i18n.changeLanguage(lng);
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = lng === 'zh' ? 'zh-CN' : 'en';
}

export { zh, en };
export default i18n;

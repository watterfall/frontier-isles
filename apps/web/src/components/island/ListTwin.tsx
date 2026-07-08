import { useTranslation } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import { STN } from '../../api/fallback';
import { localizeStationZh, type Lang } from '../../i18n/stations';

export interface ListTwinProps {
  sel: StationKind | null;
  stFilter: string;
  onStFilter: (f: string) => void;
  onStation: (key: StationKind) => void;
}

const TWIN_CHIPS = ['全部', '有 AI', '仅人类'] as const;

/** Does an authorship string match the current filter? (prototype `fmatch`) */
function matches(auth: { zh: string; en: string }, f: string, lang: 'zh' | 'en'): boolean {
  if (f === '全部') return true;
  const hasAI = auth[lang].indexOf('AI') >= 0;
  return f === '有 AI' ? hasAI : !hasAI;
}

/** The list twin (invariant 5: every spatial object has a list twin). */
export function ListTwin({ sel, stFilter, onStFilter, onStation }: ListTwinProps) {
  const { t, i18n } = useTranslation();
  const lang: Lang = i18n.language === 'en' ? 'en' : 'zh';

  return (
    <div style={{ position: 'absolute', left: 20, top: 122, width: 212, background: 'var(--card,rgba(250,245,232,0.92))', border: '1.5px solid var(--ink,#3A342B)', borderRadius: 8, backdropFilter: 'blur(8px)', overflow: 'hidden', transition: 'background .7s' }}>
      <div style={{ padding: '10px 14px 8px', borderBottom: '0.75px solid var(--ink2,#6B6154)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 13, color: 'var(--inkT,#2B2620)' }}>{t('island.twin.title')}</span>
        <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 9.5, color: 'var(--ink2,#6B6154)' }}>{t('island.twin.motto')}</span>
      </div>
      <div style={{ display: 'flex', gap: 5, padding: '7px 12px', borderBottom: '0.75px solid rgba(107,97,84,0.4)' }}>
        {TWIN_CHIPS.map((f) => {
          const on = stFilter === f;
          return (
            <span key={f} onClick={() => onStFilter(f)} style={{ cursor: 'pointer', fontSize: 10, padding: '2px 9px', borderRadius: 999, border: `1px solid ${on ? 'var(--inkT,#2B2620)' : 'rgba(139,148,178,0.6)'}`, background: on ? 'var(--inkT,#2B2620)' : 'transparent', color: on ? 'var(--pp,#F2EAD8)' : 'var(--ink2,#6B6154)', userSelect: 'none' }}>
              {t(`island.twin.chips.${f}`)}
            </span>
          );
        })}
        <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--ink2,#6B6154)', alignSelf: 'center' }}>{t('island.twin.authorLabel')}</span>
      </div>
      {STN.map((s) => (
        <div
          key={s.k}
          onClick={() => onStation(s.k)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7.5px 14px', cursor: 'pointer', background: sel === s.k ? 'rgba(227,169,60,0.18)' : 'transparent', opacity: matches(s.auth, stFilter, lang) ? 1 : 0.3, transition: 'background .3s,opacity .3s' }}
        >
          <span style={{ width: 20, height: 20, borderRadius: 3, background: s.sealBg, color: '#F6F2E6', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Serif SC',serif" }}>{s.glyph}</span>
          <span style={{ flex: 1, fontSize: 13, color: 'var(--inkT,#2B2620)' }}>{localizeStationZh(s.name, lang)}</span>
          <span style={{ fontSize: 8.5, padding: '1px 6px', borderRadius: 999, border: '1px solid rgba(139,148,178,0.55)', color: 'var(--ink2,#6B6154)', whiteSpace: 'nowrap' }}>{s.auth[lang]}</span>
          <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10.5, color: 'var(--ink2,#6B6154)' }}>{s.count[lang]}</span>
        </div>
      ))}
      <div style={{ padding: '8px 14px', borderTop: '0.75px solid var(--ink2,#6B6154)', fontSize: 10, color: 'var(--ink2,#6B6154)', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{t('island.twin.footer')}</div>
    </div>
  );
}

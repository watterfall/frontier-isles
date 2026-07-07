import { useTranslation } from 'react-i18next';
import { BRIEF } from '../../api/fallback';
import { localizeStationZh, type Lang } from '../../i18n/stations';

export type BriefState = 'pending' | 'ok' | 'back';

export interface MorningReportProps {
  briefSt: Record<number, BriefState>;
  onAdopt: (i: number) => void;
  onReturn: (i: number) => void;
}

/** 晨报 · morning report — the dawn HITL adopt/return chain (day only). */
export function MorningReport({ briefSt, onAdopt, onReturn }: MorningReportProps) {
  const { t, i18n } = useTranslation();
  const lang: Lang = i18n.language === 'en' ? 'en' : 'zh';

  return (
    <div style={{ position: 'absolute', right: 20, top: 140, width: 278, background: 'var(--card,rgba(250,245,232,0.94))', border: '1.5px solid var(--ink,#3A342B)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px 8px', borderBottom: '0.75px solid var(--ink2,#6B6154)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 22, height: 22, borderRadius: 3, background: '#2E5E8C', color: '#F6F2E6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Serif SC',serif", fontSize: 12 }}>{t('island.morning.seal')}</span>
        <span style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 13, color: 'var(--inkT,#2B2620)' }}>{t('island.morning.title')}</span>
        <span style={{ marginLeft: 'auto', fontSize: 9, padding: '1.5px 7px', borderRadius: 999, border: '1px solid rgba(90,108,158,0.6)', color: '#5A6C9E' }}>{t('island.morning.badge')}</span>
      </div>
      {BRIEF.map((b, i) => {
        const st = briefSt[i] ?? 'pending';
        return (
          <div key={i} style={{ padding: '9px 14px', borderBottom: '0.75px solid rgba(107,97,84,0.25)' }}>
            <div style={{ fontSize: 12, color: 'var(--inkT,#2B2620)', lineHeight: 1.5 }}>{b.t}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 9.5, color: 'var(--ink2,#6B6154)' }}>{t('island.morning.dest', { dest: localizeStationZh(b.d, lang) })}</span>
              <span style={{ flex: 1 }} />
              {st === 'pending' && (
                <>
                  <span onClick={() => onAdopt(i)} style={{ cursor: 'pointer', fontSize: 10.5, padding: '2.5px 10px', borderRadius: 5, background: '#3E9B7E', color: '#F6F2E6', userSelect: 'none' }}>{t('island.morning.adopt')}</span>
                  <span onClick={() => onReturn(i)} style={{ cursor: 'pointer', fontSize: 10.5, padding: '2.5px 10px', borderRadius: 5, border: '1px solid var(--ink2,#6B6154)', color: 'var(--ink2,#6B6154)', userSelect: 'none' }}>{t('island.morning.return')}</span>
                </>
              )}
              {st === 'ok' && <span style={{ fontSize: 10.5, color: '#2B7A5F' }}>{t('island.morning.adopted')}</span>}
              {st === 'back' && <span style={{ fontSize: 10.5, color: '#8C8270' }}>{t('island.morning.returned')}</span>}
            </div>
          </div>
        );
      })}
      <div style={{ padding: '7px 14px', fontSize: 9.5, color: 'var(--ink2,#6B6154)', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{t('island.morning.footer')}</div>
    </div>
  );
}

import { useTranslation } from 'react-i18next';

/** The 卷轴 scroll-wipe overlay (gradient + two rods + 卷 seal). Its transform
 *  and transition are driven by the wipe state machine in the App. */
export function ScrollWipe({ wipeTf, wipeTrans }: { wipeTf: string; wipeTrans: string }) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        position: 'absolute',
        inset: -2,
        zIndex: 60,
        transform: `translateX(${wipeTf})`,
        transition: wipeTrans,
        willChange: 'transform',
        background: 'linear-gradient(90deg,#E2D6BA 0%,#F6EFDD 10%,#F2EAD8 50%,#F6EFDD 90%,#E2D6BA 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ position: 'absolute', left: 10, top: 8, bottom: 8, width: 26, background: 'linear-gradient(90deg,#3E2F20,#5B4632,#3E2F20)', borderRadius: 13, boxShadow: '2px 0 8px rgba(0,0,0,0.3)' }} />
      <div style={{ position: 'absolute', right: 10, top: 8, bottom: 8, width: 26, background: 'linear-gradient(90deg,#3E2F20,#5B4632,#3E2F20)', borderRadius: 13, boxShadow: '-2px 0 8px rgba(0,0,0,0.3)' }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 54, height: 54, margin: '0 auto 10px', background: '#B5673A', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F6F2E6', fontFamily: "'Noto Serif SC',serif", fontWeight: 900, fontSize: 26 }}>
          {t('wipe.seal')}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 11, letterSpacing: '0.3em', color: '#6B6154' }}>{t('wipe.label')}</div>
      </div>
    </div>
  );
}

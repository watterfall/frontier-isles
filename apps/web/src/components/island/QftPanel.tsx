import { useTranslation } from 'react-i18next';
import { AUTHQ, type QuestionDatum } from '../../api/fallback';

export interface QftPanelProps {
  open: boolean;
  onClose: () => void;
  qs: QuestionDatum[];
  voted: Record<number, boolean>;
  focusIdx: number | null;
  advOn: boolean;
  onCloseAdv: () => void;
  onToggle: (idx: number) => void;
  onVote: (idx: number) => void;
  onFocus: () => void;
}

function ScrollRod() {
  return (
    <div style={{ position: 'relative', height: 20, background: 'linear-gradient(180deg,#5B4632,#3E2F20)', borderRadius: 10, border: '1px solid #2B2015', margin: '0 6px' }}>
      <span style={{ position: 'absolute', left: -9, top: 1, width: 16, height: 16, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%,#7A5B3E,#3E2F20)', border: '1px solid #2B2015' }} />
      <span style={{ position: 'absolute', right: -9, top: 1, width: 16, height: 16, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%,#7A5B3E,#3E2F20)', border: '1px solid #2B2015' }} />
    </div>
  );
}

export function QftPanel({ open, onClose, qs, voted, focusIdx, advOn, onCloseAdv, onToggle, onVote, onFocus }: QftPanelProps) {
  const { t } = useTranslation();
  const focusedOn = focusIdx !== null;
  const focusText = focusIdx !== null ? qs[focusIdx]?.text ?? '' : '';

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(24,20,14,0.32)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .5s' }}
      />
      <div
        data-screen-label="L2 问题墙 QFT 面板"
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 560, transform: `translateX(${open ? '0%' : '108%'})`, transition: 'transform .55s cubic-bezier(0.22,1,0.36,1)', display: 'flex', flexDirection: 'column', filter: 'drop-shadow(-14px 0 30px rgba(24,20,14,0.3))' }}
      >
        <ScrollRod />
        <div style={{ position: 'relative', flex: 1, background: '#FAF5E8', backgroundImage: 'repeating-linear-gradient(0deg,rgba(43,38,32,0.016) 0 1px,transparent 1px 3px)', borderLeft: '1.5px solid #3A342B', borderRight: '1.5px solid #3A342B', overflowY: 'auto', padding: '22px 26px' }}>
          <div style={{ position: 'absolute', right: 2, top: 56, fontFamily: "'Noto Serif SC',serif", fontSize: 150, fontWeight: 900, color: 'rgba(181,103,58,0.05)', pointerEvents: 'none', lineHeight: 1 }}>問</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10.5, letterSpacing: '0.15em', color: '#B5673A' }}>{t('panel.kicker')}</div>
              <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 900, fontSize: 22, color: '#2B2620', marginTop: 3 }}>{t('panel.title')}</div>
            </div>
            <div onClick={onClose} style={{ cursor: 'pointer', width: 30, height: 30, border: '1.5px solid #3A342B', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2B2620', fontSize: 14, background: '#F2EAD8' }}>✕</div>
          </div>

          {/* 印记进度 发/改/聚 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '16px 0' }}>
            <span style={sealDark}>{t('panel.stampDiverge')}</span>
            <span style={{ fontSize: 11.5, color: '#6B6154', whiteSpace: 'nowrap' }}>{t('panel.stampDivergeLabel')}</span>
            <span style={{ flex: 1, borderTop: '1px dashed #A89C88' }} />
            <span style={sealDark}>{t('panel.stampRewrite')}</span>
            <span style={{ fontSize: 11.5, color: '#6B6154', whiteSpace: 'nowrap' }}>{t('panel.stampRewriteLabel')}</span>
            <span style={{ flex: 1, borderTop: '1px dashed #A89C88' }} />
            <span style={{ ...sealBase, background: focusedOn ? '#B5673A' : 'transparent', color: focusedOn ? '#F6F2E6' : '#B5673A', border: '1.5px solid #B5673A' }}>{t('panel.stampFocus')}</span>
            <span style={{ fontSize: 11.5, color: '#B5673A', whiteSpace: 'nowrap' }}>{focusedOn ? t('panel.focused') : t('panel.focusVoting')}</span>
          </div>

          {/* QFocus 钉 */}
          <div style={{ border: '1.5px solid #E3A93C', background: 'rgba(227,169,60,0.1)', borderRadius: 6, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ ...sealBase, background: '#B5673A', color: '#F6F2E6' }}>{t('panel.pinSeal')}</span>
            <div>
              <div style={{ fontSize: 10.5, color: '#8A6A1E', fontFamily: "'JetBrains Mono',ui-monospace,monospace", letterSpacing: '0.1em' }}>{t('panel.pinKicker')}</div>
              <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 16, color: '#2B2620', marginTop: 2 }}>AI 能否提出一个人类没想到的好问题？</div>
            </div>
          </div>

          <div style={{ margin: '14px 0 10px', fontSize: 12, color: '#6B6154' }}>
            {t('panel.material')}
            <span style={{ color: '#2E5E8C', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>{t('panel.materialLink')}</span>
            {t('panel.materialTail')}
          </div>

          {advOn && (
            <div style={{ position: 'relative', border: '1.2px dashed #5A6C9E', background: 'rgba(90,108,158,0.07)', borderRadius: 6, padding: '10px 40px 10px 46px', marginBottom: 12 }}>
              <span style={{ position: 'absolute', left: 12, top: 12, width: 24, height: 24, borderRadius: 3, background: '#5A6C9E', color: '#F6F2E6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Serif SC',serif", fontSize: 12 }}>{t('panel.advSeal')}</span>
              <div style={{ fontSize: 10, color: '#5A6C9E', fontFamily: "'JetBrains Mono',ui-monospace,monospace", letterSpacing: '0.1em' }}>{t('panel.advKicker')}</div>
              <div style={{ fontSize: 12.5, color: '#3E4A6B', lineHeight: 1.6, marginTop: 2 }}>{t('panel.advBody')}</div>
              <span onClick={onCloseAdv} style={{ position: 'absolute', right: 8, top: 8, cursor: 'pointer', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, color: '#5A6C9E', fontSize: 11 }}>✕</span>
            </div>
          )}

          {focusedOn && (
            <div style={{ border: '1.5px solid #3E9B7E', background: 'rgba(62,155,126,0.1)', borderRadius: 6, padding: '10px 14px', marginBottom: 12, fontSize: 12.5, color: '#2B5C49' }}>
              {t('panel.focusBanner')}<b>{focusText}</b>{t('panel.focusBannerTail')}
            </div>
          )}

          {/* 7 问题卡 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {qs.map((q, idx) => {
              const focused = focusIdx === idx;
              const didVote = !!voted[idx];
              return (
                <div key={q.i} style={{ border: `1.5px solid ${focused ? '#E3A93C' : 'rgba(58,52,43,0.35)'}`, background: focused ? 'rgba(227,169,60,0.1)' : '#FDFAF1', borderRadius: 6, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', border: '1.2px solid #6B6154', color: '#6B6154', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{q.i}</span>
                    <div style={{ flex: 1 }}>
                      {q.rw && (
                        <div style={{ fontSize: 12, color: '#A89C88', textDecoration: 'line-through', marginBottom: 2 }}>
                          {q.orig} <span style={{ textDecoration: 'none', color: '#8A6A1E' }}>{t('panel.rewriteTag')}</span>
                        </div>
                      )}
                      <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 600, fontSize: 14.5, color: '#2B2620', lineHeight: 1.5 }}>{q.text}</div>
                      {focused && <div style={{ marginTop: 4, fontSize: 11, color: '#8A6A1E' }}>{t('panel.focusCandidate')}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 9, paddingLeft: 32 }}>
                    <span style={{ fontSize: 9.5, padding: '2px 7px', borderRadius: 999, border: '1px solid rgba(139,148,178,0.55)', color: '#6B7594', whiteSpace: 'nowrap' }}>{AUTHQ[idx]}</span>
                    <span onClick={() => onToggle(idx)} style={{ cursor: 'pointer', fontSize: 11, padding: '2.5px 10px', borderRadius: 999, border: `1.2px solid ${q.open ? '#3E9B7E' : '#B5673A'}`, background: q.open ? 'rgba(62,155,126,0.1)' : '#B5673A', color: q.open ? '#2B7A5F' : '#F6F2E6', userSelect: 'none' }}>{q.open ? t('panel.open') : t('panel.closed')}</span>
                    {q.rw && <span style={{ fontSize: 11, padding: '2.5px 10px', borderRadius: 999, background: 'rgba(227,169,60,0.18)', color: '#8A6A1E', border: '1.2px solid #E3A93C' }}>{t('panel.rewritten')}</span>}
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 9, letterSpacing: 2, color: '#2E5E8C', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 110 }}>{'●'.repeat(Math.min(q.votes, 12))}</span>
                    <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 12, color: '#2E5E8C', minWidth: 16, textAlign: 'right' }}>{q.votes}</span>
                    <span onClick={() => onVote(idx)} style={{ cursor: 'pointer', fontSize: 11.5, padding: '3.5px 12px', borderRadius: 5, border: `1.2px solid ${didVote ? '#A89C88' : '#2E5E8C'}`, color: didVote ? '#A89C88' : '#2E5E8C', background: didVote ? 'transparent' : 'rgba(46,94,140,0.08)', userSelect: 'none' }}>{didVote ? t('panel.voted') : t('panel.vote')}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div onClick={onFocus} style={{ marginTop: 16, cursor: 'pointer', background: '#E3A93C', border: '1.5px solid #8A6A1E', borderRadius: 6, padding: 12, textAlign: 'center', fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 15, color: '#3A2E14', userSelect: 'none' }}>{t('panel.doFocus')}</div>
          <div style={{ marginTop: 12, fontSize: 10.5, color: '#A89C88', fontFamily: "'JetBrains Mono',ui-monospace,monospace", textAlign: 'center' }}>{t('panel.footer')}</div>
        </div>
        <ScrollRod />
      </div>
    </>
  );
}

const sealBase = { width: 26, height: 26, borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Serif SC',serif", fontSize: 13, flex: 'none' } as const;
const sealDark = { ...sealBase, background: '#2B2620', color: '#F2EAD8' } as const;

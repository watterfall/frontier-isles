import type { Dispatch } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { RITQ, RIT_NAMES } from '../../api/fallback';
import {
  type CeremonyState,
  type CeremonyAction,
  type CeremonyLog,
  rtext,
  ritTop,
  ritFocusText,
} from '../../state/ceremonyReducer';

/** Resolve a structured genesis-scroll entry to display text. */
export function formatLog(entry: CeremonyLog, t: TFunction): string {
  if (entry.k === 'add') return t('ceremony.log.addPrefix') + (entry.q ?? '');
  if (entry.k === 'close') return t('ceremony.log.close', { n: entry.n ?? 0 });
  return t(`ceremony.log.${entry.k}`);
}

const STEP_DEFS: Array<[string, string]> = [
  ['素', '素材'],
  ['发', '发问'],
  ['记', '记形'],
  ['聚', '聚焦'],
  ['立', '上墙'],
];

const goldBtn = { cursor: 'pointer', background: '#F5B94B', borderRadius: 6, padding: 12, textAlign: 'center' as const, fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 15, color: '#3A2E14', userSelect: 'none' as const };
const chKicker = { fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10.5, letterSpacing: '0.2em', color: '#F5B94B' } as const;
const chTitle = { fontFamily: "'Noto Serif SC',serif", fontWeight: 900, fontSize: 24, color: '#E8E4D4', marginTop: 6 } as const;

export interface CeremonyOverlayProps {
  state: CeremonyState;
  dispatch: Dispatch<CeremonyAction>;
  onAbort: () => void;
  onFinish: () => void;
}

export function CeremonyOverlay({ state, dispatch, onAbort, onFinish }: CeremonyOverlayProps) {
  const { t } = useTranslation();
  const rit = state.rit;
  const riseY = state.riseUp ? '0px' : '210px';
  const timer = `${Math.floor(state.ritSec / 60)}:${String(state.ritSec % 60).padStart(2, '0')}`;
  const nextOp = state.ritAdded.length >= 3 ? 1 : 0.35;
  const cand = RITQ.map((text, i) => ({ text, i })).filter((c) => !state.ritAdded.includes(c.i));
  const nameShow = state.ritName ?? t('ceremony.unnamed');

  return (
    <div data-screen-label="建岛仪式" style={{ position: 'absolute', inset: 0, zIndex: 40, background: '#161F36', overflow: 'hidden' }}>
      <svg viewBox="0 0 1440 900" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="lgradRit">
            <stop offset="0%" stopColor="#F5B94B" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F5B94B" stopOpacity="0" />
          </radialGradient>
          <clipPath id="seaClip"><rect x="0" y="626" width="1440" height="274" /></clipPath>
        </defs>
        <path d="M 1310 110 a 30 30 0 1 0 6 42 a 24 24 0 0 1 -6 -42 Z" fill="#E8D9A8" opacity="0.85" />
        <circle cx="200" cy="120" r="1.6" fill="#E8D9A8" style={{ animation: 'twinkle 4s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }} />
        <circle cx="420" cy="80" r="1.2" fill="#E8D9A8" />
        <circle cx="640" cy="140" r="1.4" fill="#E8D9A8" style={{ animation: 'twinkle 5s ease-in-out infinite 1s', animationPlayState: 'var(--play,running)' as never }} />
        <circle cx="900" cy="90" r="1.2" fill="#E8D9A8" />
        <circle cx="1080" cy="170" r="1.4" fill="#E8D9A8" style={{ animation: 'twinkle 4.4s ease-in-out infinite 2s', animationPlayState: 'var(--play,running)' as never }} />
        <g clipPath="url(#seaClip)">
          <g style={{ transform: `translateY(${riseY})`, transition: 'transform 2.2s cubic-bezier(0.22,1,0.36,1)' }}>
            <g transform="translate(1064,690) scale(1.5)">
              <path d="M -58 10 C -50 -8 -26 -20 2 -21 C 30 -20 50 -9 58 8 C 46 16 30 20 0 20 C -30 20 -48 16 -58 10 Z" fill="#26374A" stroke="#8E99BE" strokeWidth="1.2" />
              <g transform="translate(2,-20)">
                <line x1="0" y1="0" x2="0" y2="-16" stroke="#8E99BE" strokeWidth="1.2" />
                <path d="M 0 -16 L 12 -12 L 0 -8 Z" fill="#F5B94B" stroke="#8E99BE" strokeWidth="0.6" />
              </g>
            </g>
          </g>
        </g>
        <rect x="0" y="626" width="1440" height="274" fill="#1B2748" opacity="0.55" />
        <g stroke="#39508A" strokeWidth="1.1" fill="none" opacity="0.8">
          <path d="M 80 690 q 12 -7 24 0 q 12 7 24 0" style={{ animation: 'waveDrift 6s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }} />
          <path d="M 420 740 q 12 -7 24 0 q 12 7 24 0" style={{ animation: 'waveDrift 7s ease-in-out infinite 1s', animationPlayState: 'var(--play,running)' as never }} />
          <path d="M 760 700 q 12 -7 24 0 q 12 7 24 0" />
          <path d="M 1040 760 q 12 -7 24 0 q 12 7 24 0" style={{ animation: 'waveDrift 6.4s ease-in-out infinite .5s', animationPlayState: 'var(--play,running)' as never }} />
          <path d="M 1240 690 q 12 -7 24 0 q 12 7 24 0" />
          <path d="M 980 668 q 14 -8 28 0 q 14 8 28 0" stroke="#4B639F" />
          <path d="M 1100 664 q 14 -8 28 0" stroke="#4B639F" />
        </g>
        {state.riseUp && <circle cx="1064" cy="640" r="90" fill="url(#lgradRit)" opacity="0.6" />}
      </svg>

      {state.riseUp && (
        <div style={{ position: 'absolute', right: 150, top: 390, width: 320, textAlign: 'center' }}>
          <div style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, letterSpacing: '0.2em', color: '#F5B94B' }}>{t('ceremony.rise.kicker')}</div>
          <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 17, color: '#E8E4D4', lineHeight: 1.6, marginTop: 6 }}>{ritFocusText(state)}</div>
          <div style={{ fontSize: 11, color: '#8B94B2', marginTop: 8 }}>{t('ceremony.rise.from', { name: nameShow })}</div>
        </div>
      )}

      <div onClick={onAbort} style={{ position: 'absolute', left: 24, top: 20, cursor: 'pointer', fontSize: 12, color: '#8B94B2', border: '1px solid rgba(139,148,178,0.5)', borderRadius: 6, padding: '7px 14px', userSelect: 'none' }}>{t('ceremony.abort')}</div>

      {/* 章节步进 */}
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10 }}>
        {STEP_DEFS.map(([glyph, nameKey], i) => {
          const active = rit === i;
          const past = (rit ?? -1) > i;
          return (
            <div key={glyph} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 34, height: 34, borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Serif SC',serif", fontSize: 16, background: active ? '#F5B94B' : past ? 'rgba(245,185,75,0.2)' : 'transparent', color: active ? '#3A2E14' : past ? '#F5B94B' : '#8B94B2', border: `1.5px solid ${(rit ?? -1) >= i ? '#F5B94B' : 'rgba(139,148,178,0.5)'}`, transition: 'all .4s' }}>{glyph}</span>
                <span style={{ fontSize: 10, color: active ? '#F5B94B' : '#8B94B2' }}>{t(`ceremony.steps.${nameKey}`)}</span>
              </div>
              {i < 4 && <span style={{ width: 26, borderTop: '1px dashed rgba(139,148,178,0.5)', marginBottom: 14 }} />}
            </div>
          );
        })}
      </div>

      {/* 章节面板 */}
      <div style={{ position: 'absolute', left: 110, top: 120, width: 600, maxHeight: 640, overflowY: 'auto', background: 'rgba(33,44,78,0.55)', border: '1px solid rgba(139,148,178,0.35)', borderRadius: 10, backdropFilter: 'blur(6px)', padding: '26px 30px' }}>
        {rit === 0 && (
          <div>
            <div style={chKicker}>{t('ceremony.ch0.kicker')}</div>
            <div style={chTitle}>{t('ceremony.ch0.title')}</div>
            <div style={{ marginTop: 16, border: '1.5px solid rgba(245,185,75,0.6)', background: 'rgba(245,185,75,0.08)', borderRadius: 6, padding: '14px 16px' }}>
              <div style={{ fontSize: 10.5, color: '#F5B94B', fontFamily: "'JetBrains Mono',ui-monospace,monospace", letterSpacing: '0.1em' }}>{t('ceremony.ch0.materialKicker')}</div>
              <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 17, color: '#E8E4D4', marginTop: 4 }}>{t('ceremony.ch0.materialName')}</div>
              <div style={{ fontSize: 12.5, color: '#AEB6CE', lineHeight: 1.7, marginTop: 6 }}>{t('ceremony.ch0.materialBody')}</div>
            </div>
            <div style={{ marginTop: 14, fontSize: 12.5, color: '#AEB6CE', lineHeight: 2 }}>
              <b style={{ color: '#C9D0E4' }}>{t('ceremony.ch0.covenantTitle')}</b>{t('ceremony.ch0.covenantIntro')}<br />
              {t('ceremony.ch0.c1')}<br />{t('ceremony.ch0.c2')}<br />{t('ceremony.ch0.c3')}<br />{t('ceremony.ch0.c4')}
            </div>
            <div onClick={() => dispatch({ type: 'ignite' })} style={{ ...goldBtn, marginTop: 18 }}>{t('ceremony.ch0.ignite')}</div>
          </div>
        )}

        {rit === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={chKicker}>{t('ceremony.ch1.kicker')}</div>
                <div style={chTitle}>{t('ceremony.ch1.title')}</div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 32, color: '#F5B94B' }}>{timer}</div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#8B94B2' }}>{t('ceremony.ch1.note')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {state.ritAdded.map((qi, n) => (
                <div key={qi} style={{ border: '1px solid rgba(139,148,178,0.4)', background: 'rgba(22,31,54,0.6)', borderRadius: 6, padding: '10px 14px', fontSize: 13.5, color: '#E8E4D4', fontFamily: "'Noto Serif SC',serif" }}>{n + 1} · {rtext(state, qi)}</div>
              ))}
            </div>
            <div style={{ marginTop: 14, fontSize: 11, color: '#8B94B2' }}>{t('ceremony.ch1.candLabel')}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {cand.map((c) => (
                <span key={c.i} onClick={() => dispatch({ type: 'add', i: c.i })} style={{ cursor: 'pointer', fontSize: 12, padding: '6px 12px', borderRadius: 999, border: '1px dashed rgba(245,185,75,0.55)', color: '#E3C98F', userSelect: 'none' }}>＋ {c.text}</span>
              ))}
            </div>
            <div onClick={() => dispatch({ type: 'close' })} style={{ ...goldBtn, marginTop: 18, opacity: nextOp, transition: 'opacity .3s' }}>{t('ceremony.ch1.close')}</div>
          </div>
        )}

        {rit === 2 && (
          <div>
            <div style={chKicker}>{t('ceremony.ch2.kicker')}</div>
            <div style={chTitle}>{t('ceremony.ch2.title')}</div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#8B94B2' }}>{t('ceremony.ch2.note')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {state.ritAdded.map((qi) => {
                const m = state.ritMeta[qi] ?? {};
                const open = m.open !== false;
                const rw = !!m.rw;
                const canRw = qi === 1 && !rw;
                return (
                  <div key={qi} style={{ border: '1px solid rgba(139,148,178,0.4)', background: 'rgba(22,31,54,0.6)', borderRadius: 6, padding: '10px 14px' }}>
                    {rw && <div style={{ fontSize: 11.5, color: '#5F6C8E', textDecoration: 'line-through' }}>{RITQ[qi]}</div>}
                    <div style={{ fontSize: 13.5, color: '#E8E4D4', fontFamily: "'Noto Serif SC',serif" }}>{rtext(state, qi)}</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center' }}>
                      <span onClick={() => dispatch({ type: 'toggleOpen', qi })} style={{ cursor: 'pointer', fontSize: 11, padding: '2px 10px', borderRadius: 999, border: `1px solid ${open ? '#3E9B7E' : '#C08054'}`, color: open ? '#7FC4AC' : '#E3A98A', userSelect: 'none' }}>{open ? t('panel.open') : t('panel.closed')}</span>
                      {canRw && <span onClick={() => dispatch({ type: 'rewrite', qi })} style={{ cursor: 'pointer', fontSize: 11, color: '#F5B94B', textDecoration: 'underline', textUnderlineOffset: 3, userSelect: 'none' }}>{t('ceremony.ch2.rewrite')}</span>}
                      {rw && <span style={{ fontSize: 11, color: '#F5B94B' }}>{t('ceremony.ch2.rewritten')}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div onClick={() => dispatch({ type: 'shaped' })} style={{ ...goldBtn, marginTop: 18 }}>{t('ceremony.ch2.done')}</div>
          </div>
        )}

        {rit === 3 && (
          <div>
            <div style={chKicker}>{t('ceremony.ch3.kicker')}</div>
            <div style={chTitle}>{t('ceremony.ch3.title')}</div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#8B94B2' }}>{t('ceremony.ch3.note')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {state.ritAdded.map((qi) => {
                const votes = state.ritVotes[qi] ?? 0;
                return (
                  <div key={qi} style={{ border: '1px solid rgba(139,148,178,0.4)', background: 'rgba(22,31,54,0.6)', borderRadius: 6, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ flex: 1, fontSize: 13.5, color: '#E8E4D4', fontFamily: "'Noto Serif SC',serif" }}>{rtext(state, qi)}</span>
                    <span style={{ fontSize: 9, letterSpacing: 2, color: '#F5B94B' }}>{'●'.repeat(Math.min(votes, 10))}</span>
                    <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 12, color: '#F5B94B', minWidth: 14, textAlign: 'right' }}>{votes}</span>
                    <span onClick={() => dispatch({ type: 'vote', qi })} style={{ cursor: 'pointer', fontSize: 11, padding: '3px 12px', borderRadius: 5, border: '1px solid #F5B94B', color: '#F5B94B', userSelect: 'none' }}>{t('ceremony.ch3.vote')}</span>
                  </div>
                );
              })}
            </div>
            <div onClick={() => dispatch({ type: 'focus' })} style={{ ...goldBtn, marginTop: 18 }}>{t('ceremony.ch3.done')}</div>
          </div>
        )}

        {rit === 4 && (
          <div>
            <div style={chKicker}>{t('ceremony.ch4.kicker')}</div>
            <div style={chTitle}>{t('ceremony.ch4.title')}</div>
            <div style={{ marginTop: 14, border: '1.5px solid #F5B94B', background: 'rgba(245,185,75,0.1)', borderRadius: 6, padding: '14px 16px' }}>
              <div style={{ fontSize: 10.5, color: '#F5B94B', fontFamily: "'JetBrains Mono',ui-monospace,monospace", letterSpacing: '0.1em' }}>{t('ceremony.ch4.pinKicker')}</div>
              <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 17, color: '#E8E4D4', marginTop: 4 }}>{ritFocusText(state)}</div>
            </div>
            <div style={{ marginTop: 14, fontSize: 12, color: '#8B94B2' }}>{t('ceremony.ch4.nameLabel')}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {RIT_NAMES.map((nm) => {
                const on = state.ritName === nm;
                return (
                  <span key={nm} onClick={() => dispatch({ type: 'pickName', name: nm })} style={{ cursor: 'pointer', fontSize: 12.5, padding: '6px 14px', borderRadius: 999, border: '1px solid #F5B94B', background: on ? '#F5B94B' : 'transparent', color: on ? '#3A2E14' : '#C9D0E4', userSelect: 'none', transition: 'all .25s' }}>{nm}</span>
                );
              })}
            </div>
            <div onClick={onFinish} style={{ ...goldBtn, marginTop: 18 }}>{t('ceremony.ch4.finish', { name: nameShow })}</div>
            <div style={{ marginTop: 10, fontSize: 10.5, color: '#8B94B2', fontFamily: "'JetBrains Mono',ui-monospace,monospace", textAlign: 'center' }}>{t('ceremony.ch4.note')}</div>
          </div>
        )}
      </div>

      {/* 创世卷轴事件条 */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'rgba(20,27,48,0.92)', borderTop: '1px solid rgba(245,185,75,0.35)', padding: '10px 26px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F5B94B', flex: 'none', animation: 'pulseGlow 2.4s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }} />
        <span style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 600, fontSize: 12.5, color: '#F5B94B', whiteSpace: 'nowrap' }}>{t('ceremony.ticker', { n: state.ritLog.length })}</span>
        <span style={{ flex: 1, fontSize: 11.5, color: '#8B94B2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{state.ritLog.length ? formatLog(state.ritLog[state.ritLog.length - 1]!, t) : ''}</span>
        <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: '#8B94B2', whiteSpace: 'nowrap' }}>{t('ceremony.tickerTail')}</span>
      </div>
    </div>
  );
}

// keep the top-voted selector reachable for tests / callers
export { ritTop };

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LangToggle } from '../shell/LangToggle';

/** Read-only mobile L0 (artboard 3b): status bar, 問 header + 只读 pill,
 *  segmented control, mini sea-chart SVG, 3 island cards, footer tabs.
 *  Rendered when viewport width < 640 (architecture §2: mobile is read-only). */
export function MobileShell() {
  const { t } = useTranslation();
  const [seg, setSeg] = useState<'chart' | 'list'>('chart');

  return (
    <div style={{ minHeight: '100vh', background: '#E4DAC2', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 12px 0' }}>
        <LangToggle />
      </div>
      <div style={{ position: 'relative', flex: 1, background: '#F2EAD8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px 6px', fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 12, color: '#2B2620' }}>
          <span>9:41</span>
          <span style={{ letterSpacing: 2 }}>▮▮▮ ᯤ</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 18px 10px' }}>
          <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
            <div style={{ width: 30, height: 30, background: '#B5673A', borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F6F2E6', fontFamily: "'Noto Serif SC',serif", fontWeight: 900, fontSize: 15 }}>問</div>
            <span style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 900, fontSize: 18, color: '#2B2620' }}>问题群岛</span>
          </div>
          <span style={{ fontSize: 10.5, padding: '3px 10px', borderRadius: 999, border: '1.2px solid #B5673A', color: '#B5673A' }}>{t('mobile.readonly')}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, margin: '0 18px 10px', background: 'rgba(43,38,32,0.07)', borderRadius: 999, padding: 3 }}>
          <span onClick={() => setSeg('chart')} style={{ flex: 1, textAlign: 'center', fontSize: 12.5, padding: '6px 0', borderRadius: 999, background: seg === 'chart' ? '#2B2620' : 'transparent', color: seg === 'chart' ? '#F2EAD8' : '#6B6154', cursor: 'pointer' }}>{t('mobile.segChart')}</span>
          <span onClick={() => setSeg('list')} style={{ flex: 1, textAlign: 'center', fontSize: 12.5, padding: '6px 0', borderRadius: 999, background: seg === 'list' ? '#2B2620' : 'transparent', color: seg === 'list' ? '#F2EAD8' : '#6B6154', cursor: 'pointer' }}>{t('mobile.segList')}</span>
        </div>

        {seg === 'chart' && (
          <div style={{ margin: '0 18px', border: '1.2px solid #3A342B', borderRadius: 8, overflow: 'hidden', background: '#EFE8D4', position: 'relative' }}>
            <svg viewBox="0 0 354 258" style={{ display: 'block', width: '100%' }}>
              <rect x="0" y="0" width="354" height="258" fill="#F0E9D6" />
              <path d="M 0 40 Q 60 18 120 36 Q 200 56 280 30 Q 320 20 354 32" fill="none" stroke="#B9AE92" strokeWidth="1" opacity="0.6" />
              <text x="116" y="200" fontSize="30" letterSpacing="4" fill="rgba(74,66,56,0.07)" style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 900 }}>交叉之湾</text>
              <path d="M 250 118 Q 200 96 156 120" stroke="#B5673A" strokeWidth="1.6" fill="none" />
              <g transform="translate(66,92)"><path d="M -26 8 C -22 -5 -10 -11 2 -11 C 14 -11 22 -5 26 7 C 16 11 -16 11 -26 8 Z" fill="#C9D8E6" stroke="#4A4238" strokeWidth="1.2" /><text x="0" y="24" textAnchor="middle" fontSize="8.5" fill="#5B5344">随机性度量</text></g>
              <g transform="translate(156,124)"><path d="M -30 9 C -25 -6 -11 -13 2 -13 C 16 -13 25 -6 30 8 C 18 13 -18 13 -30 9 Z" fill="#ECDFB4" stroke="#4A4238" strokeWidth="1.2" /><g transform="translate(-8,-16)"><rect x="-7" y="-6" width="14" height="6" fill="#F8F1DE" stroke="#4A4238" strokeWidth="0.75" /><path d="M -9.5 -6 L -5 -11 L 5 -11 L 9.5 -6 Z" fill="#2E5E8C" /></g><text x="0" y="26" textAnchor="middle" fontSize="8.5" fill="#5B5344">AI 之问 ★</text></g>
              <g transform="translate(250,112)"><path d="M -26 8 C -22 -5 -10 -11 2 -11 C 14 -11 22 -5 26 7 C 16 11 -16 11 -26 8 Z" fill="#C6DECC" stroke="#4A4238" strokeWidth="1.2" /><text x="0" y="24" textAnchor="middle" fontSize="8.5" fill="#5B5344">记忆的载体</text></g>
              <g transform="translate(300,196)"><circle cx="0" cy="-2" r="26" fill="#E3A93C" opacity="0.25" /><path d="M -22 7 C -18 -4 -8 -9 1 -9 C 11 -9 18 -4 22 6 C 13 10 -13 10 -22 7 Z" fill="#DFD3E6" stroke="#4A4238" strokeWidth="1.2" /><text x="0" y="22" textAnchor="middle" fontSize="8.5" fill="#8A6A1E">梦的回收 ✦</text></g>
              <g transform="translate(84,190)"><path d="M -24 7 C -20 -5 -9 -10 1 -10 C 12 -10 19 -5 24 7 C 14 10 -14 10 -24 7 Z" fill="#E8CFAE" stroke="#4A4238" strokeWidth="1.2" /><text x="0" y="23" textAnchor="middle" fontSize="8.5" fill="#5B5344">驯服湍流</text></g>
              <g transform="translate(50,232)"><path d="M -10 0 Q 0 5 10 0 L 8 -2 L -8 -2 Z" fill="#5B4F3C" stroke="#3A342B" strokeWidth="0.8" /><line x1="0" y1="-2" x2="0" y2="-11" stroke="#3A342B" strokeWidth="1" /><path d="M 0 -11 L 7 -4 L 0 -4 Z" fill="#F8F1DE" stroke="#3A342B" strokeWidth="0.6" /></g>
              <path d="M 20 224 q 10 -6 20 0 q 10 6 20 0 M 260 60 q 10 -6 20 0" stroke="#BFCEDB" strokeWidth="1" fill="none" />
            </svg>
            <span style={{ position: 'absolute', right: 8, bottom: 6, fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 9, color: '#8C8270' }}>{t('mobile.chartHint')}</span>
          </div>
        )}

        <div style={{ flex: 1, overflow: 'auto', margin: '12px 18px 0', display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div style={{ border: '1.2px solid #E3A93C', background: '#FBF6E9', borderRadius: 8, padding: '11px 13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: "'JetBrains Mono',ui-monospace,monospace", color: '#A08428' }}><span>交叉 · 书院 · 样板岛</span><span>#18</span></div>
            <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 14, color: '#2B2620', margin: '4px 0 7px' }}>AI 能否提出一个人类没想到的好问题？</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#6B6154' }}><span>居民 9</span><span style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(43,38,32,0.1)', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: '76%', background: '#A08428' }} /></span><span>76</span><span style={{ color: '#A89C88' }}>{t('mobile.browseOnly')}</span></div>
          </div>
          <div style={{ border: '1.2px solid #3A342B', background: '#FBF6E9', borderRadius: 8, padding: '11px 13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: "'JetBrains Mono',ui-monospace,monospace", color: '#B5673A' }}><span>物质 · 学派</span><span>#06</span></div>
            <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 14, color: '#2B2620', margin: '4px 0 7px' }}>室温超导的机制边界究竟在哪里？</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#6B6154' }}><span>居民 14</span><span style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(43,38,32,0.1)', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: '88%', background: '#B5673A' }} /></span><span>88</span><span>{t('mobile.forkTwice')}</span></div>
          </div>
          <div style={{ border: '1.2px solid #3A342B', background: '#FBF6E9', borderRadius: 8, padding: '11px 13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: "'JetBrains Mono',ui-monospace,monospace", color: '#8A6A1E' }}><span>交叉 · 离群 ✦</span><span>#20</span></div>
            <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 14, color: '#2B2620', margin: '4px 0 7px' }}>做梦是大脑的垃圾回收进程吗？</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#6B6154' }}><span>居民 3</span><span style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(43,38,32,0.1)', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: '57%', background: '#8A6A1E' }} /></span><span>57</span><span style={{ color: '#8A6A1E' }}>{t('mobile.highVar')}</span></div>
          </div>
          <div style={{ fontSize: 10.5, color: '#A89C88', textAlign: 'center' }}>{t('mobile.note')}</div>
        </div>

        <div style={{ display: 'flex', borderTop: '1px solid rgba(43,38,32,0.15)', background: 'rgba(250,245,232,0.95)', padding: '10px 0 22px' }}>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 11.5, color: '#2B2620', fontWeight: 600 }}>{t('mobile.tabs.chart')}</span>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 11.5, color: '#A89C88' }}>{t('mobile.tabs.bridge')}</span>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 11.5, color: '#A89C88' }}>{t('mobile.tabs.notif')}</span>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 11.5, color: '#A89C88' }}>{t('mobile.tabs.mine')}</span>
        </div>
      </div>
    </div>
  );
}

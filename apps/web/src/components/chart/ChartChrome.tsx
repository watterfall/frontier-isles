import { useTranslation } from 'react-i18next';

export interface ChartChromeProps {
  onBuild: () => void;
  onCollide: () => void;
}

/**
 * ChartChrome — the L0's top overlay (title stack, search field, build/
 * collision buttons, legend). Extracted verbatim from `ChartScreen` (byte-
 * identical markup) so the atlas-world-plan.md W1 default (`AtlasChartScreen`)
 * shows the SAME chrome over the Pixi atlas that the flat SVG chart always
 * had — one definition, no drift. (The domain-filter chip row stays hidden
 * here exactly as it already was in `ChartScreen` — see that file's header
 * comment; `filter`/`onFilter` remain props-only for API compatibility.)
 */
export function ChartChrome({ onBuild, onCollide }: ChartChromeProps) {
  const { t } = useTranslation();
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 26px', pointerEvents: 'none' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ background: 'rgba(250,245,232,0.95)', border: '1.5px solid #3A342B', borderRadius: 4, padding: '12px 9px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, boxShadow: '3px 3px 0 rgba(58,48,36,0.12)' }}>
          {/* Stacked per-glyph — identical to writing-mode:vertical-rl here, but
              robust on systems whose CJK fonts lack vertical metrics. */}
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Noto Serif SC',serif", fontWeight: 900, fontSize: 21, color: '#2B2620', lineHeight: 1.16 }}>
            {['问', '题', '群', '岛'].map((ch) => (
              <span key={ch}>{ch}</span>
            ))}
          </span>
        </div>
        <div style={{ paddingTop: 4 }}>
          <div style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10.5, color: '#6B6154', letterSpacing: '0.22em' }}>{t('chart.latin')}</div>
          <div style={{ fontSize: 11.5, color: '#6B6154', marginTop: 8, maxWidth: 200, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: t('chart.tagline') }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, pointerEvents: 'auto' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(250,245,232,0.95)', border: '1.5px solid #3A342B', borderRadius: 999, padding: '7px 16px', fontSize: 12.5, color: '#A89C88', whiteSpace: 'nowrap' }}>
            {t('chart.searchPlaceholder')}
            <span style={{ marginLeft: 14, fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, border: '1px solid #A89C88', borderRadius: 3, padding: '0 5px' }}>/</span>
          </div>
          <div onClick={onBuild} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: '#2B2620', borderRadius: 999, padding: '5px 14px 5px 6px', userSelect: 'none', border: '1.5px solid #2B2620' }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#E3A93C', color: '#3A2E14', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Serif SC',serif", fontSize: 13 }}>{t('chart.buildSeal')}</span>
            <span style={{ fontSize: 12.5, color: '#F2EAD8' }}>{t('chart.build')}</span>
            <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 9.5, color: 'rgba(242,234,216,0.65)' }}>{t('chart.buildHint')}</span>
          </div>
          <div onClick={onCollide} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(250,245,232,0.95)', borderRadius: 999, padding: '5px 13px 5px 10px', userSelect: 'none', border: '1.5px solid #5B45C9', color: '#5B45C9' }}>
            <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 13 }}>↯</span>
            <span style={{ fontSize: 12.5 }}>{t('collision.button')}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 11, color: '#6B6154', background: 'rgba(250,245,232,0.85)', borderRadius: 6, padding: '5px 12px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="#E3A93C" opacity="0.4" /><circle cx="7" cy="7" r="2.5" fill="#E3A93C" /></svg>
            {t('chart.legendOutlier')}
          </span>
        </div>
      </div>
    </div>
  );
}

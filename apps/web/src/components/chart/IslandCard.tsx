import { useTranslation } from 'react-i18next';
import type { ChartCardContent } from './cardContent';

export interface IslandCardProps {
  content: ChartCardContent;
  left: number;
  top: number;
}

/**
 * IslandCard — the L0 hover/tap island readout. Extracted verbatim from
 * `ChartScreen` (byte-identical markup) so the atlas-world-plan.md W1 default
 * (`AtlasChartScreen`) shows the SAME card the flat SVG chart always has —
 * only `left`/`top` differ per caller (despaced SVG coords vs. the atlas
 * camera's live screen position via `cardBoxPos`).
 */
export function IslandCard({ content: card, left, top }: IslandCardProps) {
  const { t } = useTranslation();
  return (
    <div style={{ position: 'absolute', left, top, width: 264, background: '#FBF6E9', border: '1.5px solid #3A342B', borderRadius: 6, boxShadow: '5px 5px 0 rgba(58,48,36,0.15)', padding: '14px 16px', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 3, border: '0.75px solid rgba(58,52,43,0.35)', borderRadius: 4, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10.5, letterSpacing: '0.12em', fontFamily: "'JetBrains Mono',ui-monospace,monospace", color: card.domCol }}>
          {card.stage}
          {card.cluster && <span style={{ marginLeft: 6, opacity: 0.7 }}>{card.cluster}</span>}
        </span>
        <span style={{ fontSize: 10, color: '#A89C88', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>#{card.id}</span>
      </div>
      <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 15.5, color: '#2B2620', lineHeight: 1.5, margin: '6px 0 8px' }}>{card.q}</div>
      {card.brief && <div style={{ fontSize: 11, color: '#6B6154', lineHeight: 1.6, marginBottom: 8, opacity: 0.85 }}>{card.brief}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#6B6154' }}>
        <span style={{ whiteSpace: 'nowrap' }}>{t('chart.card.activity')}</span>
        <span style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(43,38,32,0.1)', overflow: 'hidden', display: 'block' }}>
          <span style={{ display: 'block', height: '100%', width: `${card.act}%`, background: card.domCol, borderRadius: 3 }} />
        </span>
        <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{card.act}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 11.5, color: '#6B6154', alignItems: 'center' }}>
        <span>{t('chart.card.members', { n: card.m })}</span>
        <span style={{ color: card.hintCol }}>{card.hint}</span>
      </div>
      {card.citation && (
        <div style={{ marginTop: 8, paddingTop: 7, borderTop: '0.75px solid rgba(58,52,43,0.2)' }}>
          <span style={{ fontSize: 9.5, color: '#A89C88', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{t('chart.card.source')} </span>
          <span style={{ fontSize: 10, color: '#8A6A1E' }}>{card.citation.venue} ({card.citation.year})</span>
        </div>
      )}
    </div>
  );
}

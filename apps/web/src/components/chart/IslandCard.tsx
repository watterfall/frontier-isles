import { useTranslation } from 'react-i18next';
import type { ChartCardContent } from './cardContent';

export interface IslandCardProps {
  content: ChartCardContent;
  left: number;
  top: number;
}

/** A cartographic field note, not a floating SaaS card. */
export function IslandCard({ content: card, left, top }: IslandCardProps) {
  const { t } = useTranslation();
  return (
    <aside className="fi-island-card" style={{ left, top, '--fi-card-domain': card.domCol } as React.CSSProperties} aria-live="polite">
      <span className="fi-card-pin" aria-hidden="true" />
      <div className="fi-card-meta">
        <span>{card.stage}{card.cluster && <em>{card.cluster}</em>}</span>
        <span>#{card.id}</span>
      </div>
      <h2>{card.q}</h2>
      {card.brief && <p className="fi-card-brief">{card.brief}</p>}
      <div className="fi-card-activity">
        <span>{t('chart.card.activity')}</span>
        <i><b style={{ width: `${card.act}%` }} /></i>
        <strong>{card.act}</strong>
      </div>
      <div className="fi-card-residents"><span>{t('chart.card.members', { n: card.m })}</span><span style={{ color: card.hintCol }}>{card.hint}</span></div>
      {card.citation && (
        <div className="fi-card-source"><span>{t('chart.card.source')}</span>{card.citation.venue} ({card.citation.year})</div>
      )}
      <div className="fi-card-enter"><span>{t('chart.card.hintEnter')}</span><i aria-hidden="true">↗</i></div>
    </aside>
  );
}

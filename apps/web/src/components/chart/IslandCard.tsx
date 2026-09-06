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
      {card.citation && (
        <div className="fi-card-source"><span>{t('chart.card.source')}</span>{card.citation.venue} ({card.citation.year})</div>
      )}
      {card.lensNote && (
        <div className="fi-card-lens" data-kind={card.lensNote.kind}><i aria-hidden="true" />{card.lensNote.text}</div>
      )}
      <div className="fi-card-enter"><span>{t('chart.card.hintEnter')}</span><i aria-hidden="true">↗</i></div>
    </aside>
  );
}

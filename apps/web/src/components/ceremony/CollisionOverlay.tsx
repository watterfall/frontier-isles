import { useTranslation } from 'react-i18next';
import { BRIDGES, frontierBySlug } from '@frontier-isles/data';

export interface CollisionOverlayProps {
  onCollide: (bridge: { formula: string; skeleton: { zh: string; en: string }; from: string; to: string }) => void;
  onClose: () => void;
}

/**
 * Collision-based founding (Track B): the atlas' isomorphism bridges ARE the
 * collision opportunities. Each card shows a real shared mathematical skeleton
 * between two curated islands; clicking founds a new island "on that bridge"
 * — the formula becomes the new island's founding glyph (§4: bridges are
 * proposed by members or the ferryman). Where two islands share no isomorphism,
 * no card appears — preserving the type wall (a question is never a claim).
 */
export function CollisionOverlay({ onCollide, onClose }: CollisionOverlayProps) {
  const { t } = useTranslation();

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(22,31,54,0.88)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, zIndex: 100, backdropFilter: 'blur(4px)' }}>
      <div style={{ position: 'absolute', top: 24, right: 32, cursor: 'pointer', color: '#C9D0E4', fontSize: 22, fontFamily: "'JetBrains Mono',monospace" }} onClick={onClose}>✕</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 900, fontSize: 28, color: '#F5B94B' }}>{t('collision.title')}</div>
        <div style={{ fontSize: 12, color: '#8E99BE', marginTop: 8, maxWidth: 480, lineHeight: 1.6 }}>{t('collision.hint')}</div>
      </div>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900 }}>
        {BRIDGES.map((b, i) => {
          const fromName = frontierBySlug(b.from)?.title.zh ?? b.from;
          const toName = frontierBySlug(b.to)?.title.zh ?? b.to;
          return (
            <div
              key={i}
              onClick={() => onCollide({ formula: b.formula, skeleton: b.skeleton, from: b.from, to: b.to })}
              style={{ cursor: 'pointer', width: 260, background: 'rgba(33,44,78,0.6)', border: '1.5px solid rgba(245,185,75,0.4)', borderRadius: 8, padding: '18px 20px', transition: 'border-color .3s, background .3s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#F5B94B'; e.currentTarget.style.background = 'rgba(33,44,78,0.85)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(245,185,75,0.4)'; e.currentTarget.style.background = 'rgba(33,44,78,0.6)'; }}
            >
              <div style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 18, color: '#F5B94B', textAlign: 'center', marginBottom: 10, letterSpacing: '0.03em' }}>
                {b.formula}
              </div>
              <div style={{ fontSize: 12, color: '#C9D0E4', textAlign: 'center', marginBottom: 8 }}>{b.skeleton.zh}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 11, color: '#8B94B2' }}>
                <span>{fromName}</span>
                <span style={{ color: '#F5B94B' }}>↔</span>
                <span>{toName}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 10, color: '#5E574A', marginTop: 4, fontFamily: "'JetBrains Mono',monospace" }}>{t('collision.footnote')}</div>
    </div>
  );
}

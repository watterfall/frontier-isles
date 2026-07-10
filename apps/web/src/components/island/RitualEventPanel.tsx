import { useTranslation } from 'react-i18next';
import type { RitualEvent } from '../../scene/rituals';

export interface RitualEventPanelProps {
  /** The tapped ritual node's underlying ledger event, or null when closed. */
  event: RitualEvent | null;
  onClose: () => void;
}

/**
 * Ritual-node tap → the underlying ledger event (depth-plan-v1 §6③: "click the
 * lantern/mote → the underlying event and artifact"). Styled identically to
 * {@link ClaimDetailPanel} (same overlay + centred-card convention, so a tap
 * on a lantern or a carrier opens something visually consistent with every
 * other detail panel in the app). Every row is a straight read of the
 * {@link RitualEvent} — itself a plain projection of one `publish`/`transplant`
 * ledger event (`scene/rituals.ts`'s `extractRitualEvents`) — so this panel
 * invents no new data (invariant 3: reference + hash + preview only).
 */
export function RitualEventPanel({ event, onClose }: RitualEventPanelProps) {
  const { t } = useTranslation();
  if (!event) return null;

  const refBody = event.ref?.startsWith('sha256:') ? event.ref.slice('sha256:'.length) : event.ref;
  const refShort = refBody ? refBody.slice(0, 16) : '—';
  const isLantern = event.kind === 'lantern';

  return (
    <div>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(24,20,14,0.35)' }} />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          width: 400,
          background: '#FAF5E8',
          border: '1.5px solid #3A342B',
          borderRadius: 8,
          boxShadow: '0 24px 60px rgba(24,20,14,0.4)',
          padding: '20px 22px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10.5, letterSpacing: '0.15em', color: '#6B6154' }}>
              {t('island.ritual.kicker')}
            </div>
            <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 900, fontSize: 18, color: '#2B2620', marginTop: 3 }}>
              {isLantern ? `🏮 ${t('island.ritual.lanternTitle')}` : `⛵ ${t('island.ritual.transplantTitle')}`}
            </div>
          </div>
          <div
            onClick={onClose}
            style={{ cursor: 'pointer', width: 28, height: 28, border: '1.5px solid #3A342B', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2B2620', fontSize: 13, background: '#F2EAD8' }}
          >
            ✕
          </div>
        </div>

        <div style={{ fontSize: 12, color: '#2B2620', marginTop: 10, lineHeight: 1.6 }}>
          {isLantern ? t('island.ritual.lanternBody') : t('island.ritual.transplantBody')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          <Row label={t('island.ritual.opLabel')} value={event.op} />
          <Row label={t('island.ritual.tsLabel')} value={event.ts} />
          <Row label={t('island.ritual.refLabel')} value={refShort} />
          {event.actorId && <Row label={t('island.ritual.actorLabel')} value={event.actorId} />}
        </div>

        <div style={{ marginTop: 12, fontSize: 10, color: '#A89C88', fontFamily: "'JetBrains Mono',ui-monospace,monospace", textAlign: 'center' }}>
          {t('island.ritual.footer')}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, color: '#2B2620', borderBottom: '1px solid rgba(58,52,43,0.15)', paddingBottom: 6 }}>
      <span style={{ color: '#6B6154' }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", wordBreak: 'break-all', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import { CONSENSUS_MIN, type ClaimState } from '@frontier-isles/core';

export interface ClaimDetailPanelProps {
  /** The tapped claim tower's ledger-projected state, or null when closed. */
  claim: ClaimState | null;
  onClose: () => void;
}

/**
 * Claim-tower tap → detail panel (scene-upgrade OUTSTANDING P1 "claim 点击接面板").
 * Styled like {@link DriftwoodModal} (same overlay + centred card convention) so
 * the claim tap opens something visually consistent with the rest of the app,
 * not a bespoke one-off. Every row is a straight read of {@link ClaimState} — the
 * output of `projectClaimState` (M4.3) — so no new data is invented here, only
 * decoded into text (list-twin discipline, architecture §7).
 */
export function ClaimDetailPanel({ claim, onClose }: ClaimDetailPanelProps) {
  const { t } = useTranslation();
  if (!claim) return null;

  const refBody = claim.ref.startsWith('sha256:') ? claim.ref.slice('sha256:'.length) : claim.ref;
  const refShort = refBody.slice(0, 10);

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
              {t('island.claim.kicker')} · {refShort}
            </div>
            <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 900, fontSize: 18, color: '#2B2620', marginTop: 3 }}>
              {claim.roof ? t('island.claim.titleRoofed') : t('island.claim.titlePlain')}
            </div>
          </div>
          <div
            onClick={onClose}
            style={{ cursor: 'pointer', width: 28, height: 28, border: '1.5px solid #3A342B', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2B2620', fontSize: 13, background: '#F2EAD8' }}
          >
            ✕
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          <Row label={t('island.claim.foundationLabel')} value={claim.foundation ? t('island.claim.foundationYes') : '—'} />
          <Row label={t('island.claim.floorsLabel')} value={t('island.claim.floorsValue', { n: claim.floors })} />
          <Row
            label={t('island.claim.consensusLabel')}
            value={claim.roof ? t('island.claim.consensusYes', { min: CONSENSUS_MIN }) : t('island.claim.consensusNo', { n: claim.floors, min: CONSENSUS_MIN })}
          />
          {claim.ghost && (
            <Row label={t('island.claim.ghostLabel')} value={claim.ghost === 'refuted' ? t('island.claim.ghostRefuted') : t('island.claim.ghostReturned')} />
          )}
          <Row label={t('island.claim.doiLabel')} value={claim.hasDoi ? t('island.claim.doiYes') : t('island.claim.doiNo')} />
          <Row label={t('island.claim.activityLabel')} value={t('island.claim.activityValue', { n: claim.activity })} />
        </div>

        <div style={{ marginTop: 12, fontSize: 10, color: '#A89C88', fontFamily: "'JetBrains Mono',ui-monospace,monospace", textAlign: 'center' }}>
          {t('island.claim.footer')}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, color: '#2B2620', borderBottom: '1px solid rgba(58,52,43,0.15)', paddingBottom: 6 }}>
      <span style={{ color: '#6B6154' }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{value}</span>
    </div>
  );
}

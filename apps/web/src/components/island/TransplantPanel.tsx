import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ATOM_LABELS,
  BRIDGE_ARTIFACT_TYPES,
  BRIDGE_ARTIFACT_LABELS,
  STATION_META,
  TRANSPLANT_TARGETS,
  type AtomType,
  type BridgeArtifactType,
  type StationKind,
} from '@frontier-isles/core';
import { api, type DriftwoodAtom } from '../../api/client';

export interface TransplantPanelProps {
  slug: string;
  /** Current user's ledger actor id (§5 capability gateway; researcher+ only). */
  actor: string;
  lang: 'zh' | 'en';
  onClose: () => void;
  onToast: (msg: string) => void;
}

/**
 * Human transplant-through-dock UI (Phase B.3). Pick a real driftwood atom from
 * the Garden, choose one of the four bridge artifacts + a target formal station,
 * and POST it — the server forms the bridge artifact at the dock (with the
 * persistent "once driftwood" mark) and lands it at the station, writing exactly
 * one `transplant` event. The ritual layer animates the 移栽之路 walk on the next
 * poll. Same overlay/card convention as {@link ClaimDetailPanel}; every network
 * call is best-effort (fallback.ts discipline — a failed POST just toasts and
 * leaves the panel open).
 */
export function TransplantPanel({ slug, actor, lang, onClose, onToast }: TransplantPanelProps) {
  const { t } = useTranslation();
  const [atoms, setAtoms] = useState<DriftwoodAtom[] | null>(null);
  const [pickRef, setPickRef] = useState<string | null>(null);
  const [type, setType] = useState<BridgeArtifactType>(BRIDGE_ARTIFACT_TYPES[0]);
  const [dest, setDest] = useState<StationKind>('workshop');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.driftwood(slug).then((res) => {
      if (cancelled) return;
      setAtoms(res?.atoms ?? []);
      if (res?.atoms?.[0]) setPickRef(res.atoms[0].refHash);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const stationName = (k: StationKind): string => (lang === 'en' ? STATION_META[k].en : STATION_META[k].zh);
  const atomName = (a: string): string => (ATOM_LABELS[a as AtomType]?.[lang] ?? a);
  const typeName = (bt: BridgeArtifactType): string => BRIDGE_ARTIFACT_LABELS[bt][lang];

  const submit = async (): Promise<void> => {
    if (!pickRef || busy) return;
    setBusy(true);
    const res = await api.transplant(slug, { driftwoodRef: pickRef, type, dest, actor });
    setBusy(false);
    if (res) {
      const atom = atoms?.find((a) => a.refHash === pickRef);
      onToast(t('island.transplant.success', { atom: atomName(atom?.atom ?? 'thought'), dest: stationName(dest) }));
      onClose();
    } else {
      onToast(t('island.transplant.failed'));
    }
  };

  return (
    <div>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(24,20,14,0.35)' }} />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          width: 440,
          maxHeight: '82%',
          overflowY: 'auto',
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
              {t('island.transplant.kicker')}
            </div>
            <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 900, fontSize: 18, color: '#2B2620', marginTop: 3 }}>
              {t('island.transplant.title')}
            </div>
          </div>
          <div
            onClick={onClose}
            style={{ cursor: 'pointer', width: 28, height: 28, border: '1.5px solid #3A342B', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2B2620', fontSize: 13, background: '#F2EAD8' }}
          >
            ✕
          </div>
        </div>

        {atoms == null ? (
          <div style={{ marginTop: 16, fontSize: 12, color: '#6B6154' }}>{t('island.loading')}</div>
        ) : atoms.length === 0 ? (
          <div style={{ marginTop: 16, fontSize: 12, color: '#6B6154' }}>{t('island.transplant.empty')}</div>
        ) : (
          <>
            {/* 1 · pick a driftwood atom */}
            <div style={{ marginTop: 14, fontSize: 11, color: '#6B6154', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{t('island.transplant.selectAtom')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {atoms.map((a) => {
                const on = a.refHash === pickRef;
                return (
                  <div
                    key={a.refHash}
                    onClick={() => setPickRef(a.refHash)}
                    style={{ cursor: 'pointer', border: `1.5px solid ${on ? '#8A6A1E' : 'rgba(58,52,43,0.25)'}`, background: on ? '#F2E6C8' : '#F2EAD8', borderRadius: 6, padding: '8px 10px' }}
                  >
                    <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 9.5, color: '#8A6A1E', marginRight: 8 }}>{atomName(a.atom)}</span>
                    <span style={{ fontSize: 12, color: '#2B2620' }}>{a.text}</span>
                  </div>
                );
              })}
            </div>

            {/* 2 · one of the four bridge artifacts */}
            <div style={{ marginTop: 14, fontSize: 11, color: '#6B6154', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{t('island.transplant.selectType')}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {BRIDGE_ARTIFACT_TYPES.map((bt) => {
                const on = bt === type;
                return (
                  <div
                    key={bt}
                    onClick={() => setType(bt)}
                    style={{ cursor: 'pointer', border: `1.5px solid ${on ? '#8A6A1E' : 'rgba(58,52,43,0.25)'}`, background: on ? '#F2E6C8' : '#F2EAD8', borderRadius: 6, padding: '5px 10px', fontSize: 11.5, color: '#2B2620' }}
                  >
                    {typeName(bt)}
                  </div>
                );
              })}
            </div>

            {/* 3 · target formal station */}
            <div style={{ marginTop: 14, fontSize: 11, color: '#6B6154', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{t('island.transplant.selectDest')}</div>
            <select
              value={dest}
              onChange={(e) => setDest(e.target.value as StationKind)}
              style={{ marginTop: 8, width: '100%', padding: '7px 9px', fontSize: 12, color: '#2B2620', background: '#F2EAD8', border: '1.5px solid rgba(58,52,43,0.35)', borderRadius: 6 }}
            >
              {TRANSPLANT_TARGETS.map((k) => (
                <option key={k} value={k}>
                  {stationName(k)}
                </option>
              ))}
            </select>

            <button
              onClick={submit}
              disabled={!pickRef || busy}
              style={{ marginTop: 16, width: '100%', cursor: pickRef && !busy ? 'pointer' : 'default', background: '#2B2620', color: '#F2EAD8', border: 'none', borderRadius: 6, padding: '9px 0', fontSize: 13, opacity: pickRef && !busy ? 1 : 0.5 }}
            >
              {t('island.transplant.submit')}
            </button>
          </>
        )}

        <div style={{ marginTop: 12, fontSize: 10, color: '#A89C88', fontFamily: "'JetBrains Mono',ui-monospace,monospace", textAlign: 'center', lineHeight: 1.6 }}>
          {t('island.transplant.footer')}
        </div>
      </div>
    </div>
  );
}

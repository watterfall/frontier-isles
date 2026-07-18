import { useTranslation } from 'react-i18next';
import { DRIFT } from '../../api/fallback';
import { localizeStationZh, type Lang } from '../../i18n/stations';
import { PanelCloseButton, PanelScrim, useDialogChrome } from '../panelChrome';

export interface DriftwoodModalProps {
  onClose: () => void;
  /** 'choosing' when item 0's transplant target picker is open. */
  driftDest: string | null;
  /** The station a driftwood item has been transplanted to, if any. */
  transTo: string | null;
  onMove: () => void;
  onToWorkshop: () => void;
  onToCanvas: () => void;
}

/** 散木园 modal — driftwood items with author-composition badges and the
 *  item-0 transplant 移栽 flow (choose 实验坊 / 白板厅). Only mounted while open
 *  ({@link IslandScreen} guards on `driftOn`), so the {@link useDialogChrome}
 *  focus grab fires on open — no inner-card split needed (unlike
 *  {@link RitualEventPanel}, which is always mounted and guards on a null prop). */
export function DriftwoodModal({ onClose, driftDest, transTo, onMove, onToWorkshop, onToCanvas }: DriftwoodModalProps) {
  const { t, i18n } = useTranslation();
  const lang: Lang = i18n.language === 'en' ? 'en' : 'zh';
  const { dialogRef, closeRef, onDialogKey } = useDialogChrome<HTMLDivElement>(onClose);

  return (
    <div onKeyDown={onDialogKey}>
      <PanelScrim onClose={onClose} label={t('panel.close')} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fi-drift-title"
        className="fi-panel-card"
        style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 460, background: '#FAF5E8', border: '1.5px solid #3A342B', borderRadius: 8, boxShadow: '0 24px 60px rgba(24,20,14,0.4)', padding: '20px 22px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10.5, letterSpacing: '0.15em', color: '#6B6154' }}>{t('island.drift.kicker')}</div>
            <div id="fi-drift-title" style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 900, fontSize: 20, color: '#2B2620', marginTop: 3 }}>{t('island.drift.title')}</div>
          </div>
          <PanelCloseButton
            ref={closeRef}
            onClose={onClose}
            label={t('panel.close')}
            boxStyle={{ width: 28, height: 28, border: '1.5px solid #3A342B', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2B2620', fontSize: 13, background: '#F2EAD8' }}
          />
        </div>
        <div style={{ margin: '10px 0 12px', fontSize: 12, color: '#6B6154' }}>{t('island.drift.body')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DRIFT.map((it, i) => {
            const idle = i === 0 && driftDest !== 'choosing' && !transTo;
            const choosing = i === 0 && driftDest === 'choosing' && !transTo;
            const moved = i === 0 && !!transTo;
            return (
              <div key={i} style={{ border: '1px solid rgba(58,52,43,0.35)', background: '#FDFAF1', borderRadius: 6, padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ flex: 1, fontSize: 13, color: '#2B2620', fontFamily: "'Noto Serif SC',serif", fontWeight: 600 }}>{it.t[lang]}</span>
                  <span style={{ fontSize: 9.5, padding: '1.5px 7px', borderRadius: 999, border: '1px solid rgba(139,148,178,0.55)', color: '#697392' }}>{it.a[lang]}</span>
                </div>
                {idle && (
                  <div style={{ marginTop: 8 }}>
                    <button type="button" className="fi-btn-reset fi-hit" onClick={onMove} style={{ fontSize: 11, padding: '3px 12px', borderRadius: 5, background: '#E3A93C', color: '#3A2E14', border: '1px solid #8A6A1E', userSelect: 'none' }}>{t('island.drift.move')}</button>
                  </div>
                )}
                {choosing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 11, color: '#6B6154' }}>
                    {t('island.drift.towards')}
                    <button type="button" className="fi-btn-reset fi-hit" onClick={onToWorkshop} style={{ padding: '3px 12px', borderRadius: 5, border: '1.2px solid #B5673A', color: '#9C5932', userSelect: 'none' }}>{t('island.drift.workshop')}</button>
                    <button type="button" className="fi-btn-reset fi-hit" onClick={onToCanvas} style={{ padding: '3px 12px', borderRadius: 5, border: '1.2px solid #3E9B7E', color: '#2B7A5F', userSelect: 'none' }}>{t('island.drift.canvas')}</button>
                  </div>
                )}
                {moved && <div style={{ marginTop: 8, fontSize: 11, color: '#8A6A1E' }}>{t('island.drift.moved', { dest: localizeStationZh(transTo ?? '', lang) })}</div>}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, fontSize: 10, color: '#776F61', fontFamily: "'JetBrains Mono',ui-monospace,monospace", textAlign: 'center' }}>{t('island.drift.footer')}</div>
      </div>
    </div>
  );
}

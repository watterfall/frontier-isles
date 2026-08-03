import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AUTHQ, SAMPLE_QFOCUS, type QuestionDatum } from '../../api/fallback';
import { PanelCloseButton, PanelScrim, useDialogChrome } from '../panelChrome';

export interface QftPanelProps {
  open: boolean;
  onClose: () => void;
  qs: QuestionDatum[];
  voted: Record<number, boolean>;
  focusIdx: number | null;
  advOn: boolean;
  onCloseAdv: () => void;
  onToggle: (idx: number) => void;
  onVote: (idx: number) => void;
  onRewrite: (idx: number, text: string) => void;
  onFocus: () => void;
  syncState?: QftSyncState;
  localChangeCount?: number;
  onRetry: () => void;
}

export type QftLedgerOperation = 'vote' | 'focus';
export type QftSyncState =
  | { status: 'idle' }
  | {
      status: 'saving' | 'saved' | 'failed';
      operation: QftLedgerOperation;
      questionIdx: number;
      /** Server-supplied rejection text (`failed` only) — shown verbatim so a
       *  permanent refusal reads as a reason, not as an unexplained failure. */
      reason?: string;
      /** `false` when the gateway refused the write for good (4xx): the retry
       *  control is withheld instead of offering a button that cannot succeed. */
      retryable?: boolean;
    };

function ScrollRod() {
  return (
    <div className="fi-qft-rod" aria-hidden="true">
      <span />
      <span />
    </div>
  );
}

/**
 * Stays mounted so the scroll can slide in/out; {@link useDialogChrome} therefore
 * tracks the `open` flag (not mount), and the closed panel leaves the tab order
 * via `visibility: hidden` (delayed until the slide-out ends) + a -1 scrim
 * tabIndex — otherwise its ~20 buttons would remain keyboard-reachable offscreen.
 */
export function QftPanel({ open, onClose, qs, voted, focusIdx, advOn, onCloseAdv, onToggle, onVote, onRewrite, onFocus, syncState = { status: 'idle' }, localChangeCount = 0, onRetry }: QftPanelProps) {
  const { t, i18n } = useTranslation();
  const { dialogRef, closeRef, onDialogKey } = useDialogChrome<HTMLDivElement>(onClose, open);
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';
  const focusedOn = focusIdx !== null;
  const focusText = focusIdx !== null ? qs[focusIdx]?.text[lang] ?? '' : '';
  const [rewriteIdx, setRewriteIdx] = useState<number | null>(null);
  const [rewriteText, setRewriteText] = useState('');
  const [rewriteError, setRewriteError] = useState('');
  const focusActionRef = useRef<HTMLButtonElement>(null);
  const rewriteCount = qs.filter((question) => question.rw).length;
  const openQuestions = qs.map((question, idx) => ({ question, idx })).filter(({ question }) => question.open);
  const focusCandidate = openQuestions.length > 0
    ? openQuestions.reduce((best, item) => (item.question.votes > best.question.votes ? item : best)).idx
    : null;
  const focusIsCurrent = focusCandidate !== null && focusIdx === focusCandidate;
  // The recorded focus survives a local 开/闭 toggle (the toggle is a page note,
  // the focus is a ledger event). Say so rather than letting the banner and the
  // question's own 封闭 tag silently contradict each other.
  const focusedQuestionClosed = focusIdx !== null && qs[focusIdx]?.open === false;

  // Saving or cancelling unmounts the form together with whichever control has
  // focus, leaving `document.activeElement` on <body> — outside the dialog, so
  // the Tab wrap in useDialogChrome never runs and the next Tab walks into the
  // page behind the modal. Hand focus back to the control that opened the form.
  const rewriteTriggers = useRef(new Map<number, HTMLButtonElement | null>());
  const beginRewrite = (idx: number) => {
    setRewriteIdx(idx);
    setRewriteText(qs[idx]?.text[lang] ?? '');
    setRewriteError('');
  };
  const endRewrite = (idx: number) => {
    setRewriteIdx(null);
    setRewriteError('');
    window.requestAnimationFrame(() => rewriteTriggers.current.get(idx)?.focus());
  };
  const isSaving = syncState.status === 'saving';
  const recordMessage = syncState.status === 'idle'
    ? t('panel.record.idle')
    : t(`panel.record.${syncState.status}.${syncState.operation}`);

  return (
    <div className="fi-qft-root" data-open={open || undefined} onKeyDown={onDialogKey}>
      <PanelScrim
        onClose={onClose}
        label={t('panel.close')}
        tabIndex={open ? 0 : -1}
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
      />
      <div
        ref={dialogRef}
        className="fi-qft-panel"
        data-open={open || undefined}
        data-screen-label="L2 问题墙 QFT 面板"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-labelledby="fi-qft-title"
        style={{ transform: `translateX(${open ? '0%' : '108%'})`, visibility: open ? 'visible' : 'hidden', transition: `transform .55s cubic-bezier(0.22,1,0.36,1), visibility 0s ${open ? '0s' : '.55s'}` }}
      >
        <ScrollRod />
        <article className="fi-qft-scroll">
          <div className="fi-qft-watermark" aria-hidden="true">问</div>

          <header className="fi-qft-head">
            <div>
              <span className="fi-qft-kicker">{t('panel.kicker')}</span>
              <h2 id="fi-qft-title">{t('panel.title')}</h2>
              <p>{t('panel.subtitle')}</p>
            </div>
            <PanelCloseButton
              ref={closeRef}
              onClose={onClose}
              label={t('panel.close')}
              boxStyle={{ width: 32, height: 32, border: '1.5px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
            />
          </header>

          <ol className="fi-qft-process" aria-label={t('panel.processLabel')}>
            <li data-state="complete"><b>{t('panel.stampDiverge')}</b><span><strong>{t('panel.stampDivergeLabel')}</strong><small>{t('panel.divergeNote')}</small></span></li>
            <li data-state="complete"><b>{t('panel.stampRewrite')}</b><span><strong>{t('panel.stampRewriteLabel', { count: rewriteCount })}</strong><small>{t('panel.rewriteNote')}</small></span></li>
            <li data-state={focusedOn ? 'complete' : 'current'}><b>{t('panel.stampFocus')}</b><span><strong>{focusedOn ? t('panel.focused') : t('panel.focusVoting')}</strong><small>{t('panel.focusNote')}</small></span></li>
          </ol>

          <section className="fi-qft-pin">
            <span className="fi-qft-seal">{t('panel.pinSeal')}</span>
            <div>
              <small>{t('panel.pinKicker')}</small>
              <strong>{SAMPLE_QFOCUS[lang]}</strong>
            </div>
          </section>

          <p className="fi-qft-material">
            {t('panel.material')}
            <span>{t('panel.materialLink')}</span>
            {t('panel.materialTail')}
          </p>

          {advOn && (
            <aside className="fi-qft-advocate">
              <span>{t('panel.advSeal')}</span>
              <div><small>{t('panel.advKicker')}</small><p>{t('panel.advBody')}</p></div>
              <button type="button" className="fi-btn-reset fi-hit fi-qft-inline-close" aria-label={t('panel.close')} onClick={onCloseAdv}>✕</button>
            </aside>
          )}

          {focusedOn && (
            <p className="fi-qft-focus-banner" role="status">
              {t('panel.focusBanner')}<b>{focusText}</b>{t('panel.focusBannerTail')}
              {focusedQuestionClosed && <small className="fi-qft-focus-divergence">{t('panel.focusClosedNote')}</small>}
            </p>
          )}

          <button
            type="button"
            className="fi-btn-reset fi-hit fi-qft-toggle"
            aria-controls="fi-qft-focus-action"
            onClick={() => focusActionRef.current?.scrollIntoView({ block: 'center' })}
            style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, textAlign: 'left' }}
          >
            <span>{t('panel.scrollCue', { count: qs.length })}</span><strong aria-hidden="true">↓ {t('panel.stampFocus')}</strong>
          </button>

          <ol className="fi-qft-questions" aria-label={t('panel.questionsLabel')}>
            {qs.map((q, idx) => {
              const focused = focusIdx === idx;
              const didVote = !!voted[idx];
              return (
                <li key={q.i} data-focused={focused || undefined} data-rewritten={q.rw || undefined}>
                  <div className="fi-qft-question-main">
                    <span className="fi-qft-question-number">{String(q.i).padStart(2, '0')}</span>
                    <div>
                      {q.rw && (
                        <p className="fi-qft-original">{q.orig?.[lang]} <span>{t('panel.rewriteTag')}</span></p>
                      )}
                      <p className="fi-qft-question-text">{q.text[lang]}</p>
                      {focused && <small className="fi-qft-candidate">{t('panel.focusCandidate')}</small>}
                    </div>
                  </div>
                  <div className="fi-qft-question-actions">
                    <span className="fi-qft-question-kind">{AUTHQ[idx]?.[lang]}</span>
                    <button type="button" className="fi-btn-reset fi-hit fi-qft-toggle" data-open={q.open || undefined} aria-pressed={q.open} onClick={() => onToggle(idx)}>{q.open ? t('panel.open') : t('panel.closed')}</button>
                    <button ref={(node) => { rewriteTriggers.current.set(idx, node); }} type="button" className="fi-btn-reset fi-hit fi-qft-toggle" aria-expanded={rewriteIdx === idx} onClick={() => beginRewrite(idx)}>{t('panel.rewrite')}</button>
                    {q.rw && <span className="fi-qft-rewritten">{t('panel.rewritten')}</span>}
                    <span className="fi-qft-vote-count"><b>{q.votes}</b><small>{t('panel.votes')}</small></span>
                    <button type="button" className="fi-btn-reset fi-hit fi-qft-vote" data-voted={didVote || undefined} aria-pressed={didVote} disabled={didVote || !q.open || isSaving} onClick={() => onVote(idx)}>{didVote ? t('panel.voted') : t('panel.vote')}</button>
                  </div>
                  {rewriteIdx === idx && (
                    <form className="fi-qft-question-actions" aria-label={t('panel.rewritePrompt')} onSubmit={(event) => {
                      event.preventDefault();
                      const next = rewriteText.trim();
                      if (!next) {
                        setRewriteError(t('panel.rewriteRequired'));
                        return;
                      }
                      onRewrite(idx, next);
                      endRewrite(idx);
                    }}>
                      <textarea autoFocus value={rewriteText} maxLength={240} onChange={(event) => { setRewriteText(event.target.value); if (event.target.value.trim()) setRewriteError(''); }} aria-label={t('panel.rewritePrompt')} aria-invalid={!!rewriteError} aria-describedby={rewriteError ? `fi-qft-rewrite-error-${idx}` : undefined} style={{ flex: '1 1 100%', minHeight: 72, padding: '8px 10px', border: '1px solid var(--fi-ochre)', background: 'var(--card, var(--fi-paper-raised))', color: 'inherit', font: 'inherit', lineHeight: 1.5, resize: 'vertical' }} />
                      {rewriteError && <p id={`fi-qft-rewrite-error-${idx}`} className="fi-qft-footer" role="alert" style={{ flex: '1 1 100%', margin: 0, textAlign: 'left' }}>{rewriteError}</p>}
                      <button type="submit" className="fi-btn-reset fi-hit fi-qft-toggle">{t('panel.saveRewrite')}</button>
                      <button type="button" className="fi-btn-reset fi-hit fi-qft-vote" onClick={() => endRewrite(idx)}>{t('panel.cancelRewrite')}</button>
                    </form>
                  )}
                </li>
              );
            })}
          </ol>

          <button ref={focusActionRef} id="fi-qft-focus-action" type="button" className="fi-btn-reset fi-qft-focus-action" disabled={focusCandidate === null || focusIsCurrent || isSaving} onClick={() => onFocus()}><span>{t('panel.stampFocus')}</span><strong>{focusIsCurrent ? t('panel.focused') : t('panel.doFocus')}</strong><i aria-hidden="true">→</i></button>
          <p className="fi-qft-footer" role="status" data-state={syncState.status}>
            {recordMessage}
            {syncState.status === 'failed' && syncState.reason && <> · <span className="fi-qft-record-reason">{syncState.reason}</span></>}
            {syncState.status === 'failed' && (syncState.retryable === false
              ? <> · {t('panel.record.rejected')}</>
              : <> · <button type="button" className="fi-btn-reset fi-hit fi-qft-toggle" onClick={onRetry}>{t('panel.record.retry')}</button></>)}
          </p>
          {localChangeCount > 0 && <p className="fi-qft-footer">{t('panel.record.localChanges', { count: localChangeCount })}</p>}
          <footer className="fi-qft-footer">{t('panel.footer')}</footer>
        </article>
        <ScrollRod />
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { api, type ApiStructure, type ApiStructureMapping } from '../../api/client';
import type { IslandDatum } from '../../api/fallback';
import { fallbackStructures } from '../../api/structureFallback';
import type { CompletedPassage, PassageIntent } from '../../state/explorationSession';

interface CorrespondenceDraft {
  id: number;
  quantity: string;
  inThisSubstrate: string;
}

export interface PassageWorkbenchProps {
  intent: PassageIntent;
  source: IslandDatum | null;
  target: IslandDatum | null;
  actor: string;
  lang: 'zh' | 'en';
  onCancel: () => void;
  onComplete: (receipt: CompletedPassage) => void;
  onToast: (message: string) => void;
}

/**
 * Human-authored connection validation. The workbench places both concrete
 * problems, the shared mechanism, and the source problem's existing record in
 * one view. The target correspondence, boundary, and test always start blank.
 */
export function PassageWorkbench({
  intent,
  source,
  target,
  actor,
  lang,
  onCancel,
  onComplete,
  onToast,
}: PassageWorkbenchProps) {
  const { t } = useTranslation();
  const fallback = useMemo(
    () => fallbackStructures().find((item) => item.id === intent.structureId) ?? null,
    [intent.structureId],
  );
  const [structure, setStructure] = useState<ApiStructure | null>(fallback);
  const [sourceMapping, setSourceMapping] = useState<ApiStructureMapping | null>(null);
  const [rows, setRows] = useState<CorrespondenceDraft[]>([
    { id: 1, quantity: '', inThisSubstrate: '' },
  ]);
  const [boundary, setBoundary] = useState('');
  const [prediction, setPrediction] = useState('');
  const [evidenceRef, setEvidenceRef] = useState('');
  const [busy, setBusy] = useState(false);
  const nextId = useRef(2);
  const firstInput = useRef<HTMLInputElement | null>(null);
  const workbench = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([api.structures(), api.structureGraph()]).then(([result, graph]) => {
      if (!alive) return;
      const found = result?.structures.find((item) => item.id === intent.structureId);
      if (found) setStructure(found);
      const candidates = (graph?.mappings ?? []).filter((mapping) =>
        mapping.structureId === intent.structureId && mapping.islandOp === intent.islandOp,
      );
      const best = [...candidates].sort((a, b) => {
        const bounded = Number(!!b.boundary) - Number(!!a.boundary);
        return bounded || b.ts.localeCompare(a.ts) || b.refHash.localeCompare(a.refHash);
      })[0] ?? null;
      setSourceMapping(best);
    });
    return () => { alive = false; };
  }, [intent.islandOp, intent.structureId]);

  useEffect(() => {
    firstInput.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...(workbench.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ) ?? [])].filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onCancel]);

  const structureTitle = structure?.title[lang] ?? intent.structureId.split('/').at(-1) ?? intent.structureId;
  const structureStatement = structure?.statement[lang] ?? '';
  const sourceName = source?.n[lang] ?? intent.islandSlug;
  const targetName = target?.n[lang] ?? intent.targetIslandSlug;
  const sourceQuestion = source?.q[lang] ?? '';
  const targetQuestion = target?.q[lang] ?? '';
  const validRows = rows
    .map((row) => ({ quantity: row.quantity.trim(), inThisSubstrate: row.inThisSubstrate.trim() }))
    .filter((row) => row.quantity && row.inThisSubstrate);
  const canSubmit = !busy
    && validRows.length === rows.length
    && rows.length > 0
    && boundary.trim().length > 0
    && prediction.trim().length > 0;

  const updateRow = (id: number, field: 'quantity' | 'inThisSubstrate', value: string) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, [field]: value.slice(0, 600) } : row));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    const result = await api.rebuildPassage(intent.targetIslandSlug, {
      structureId: intent.structureId,
      sourceIslandOp: intent.islandOp,
      targetIslandOp: intent.targetIslandOp,
      correspondences: validRows,
      boundary: boundary.trim(),
      prediction: prediction.trim(),
      language: lang,
      actor,
      ...(evidenceRef.trim() ? { evidenceRefs: [evidenceRef.trim()] } : {}),
    });
    setBusy(false);
    if (!result) {
      onToast(t('island.passage.failed'));
      return;
    }
    const receipt: CompletedPassage = {
      ...intent,
      passageKind: result.passageKind,
      refHash: result.refHash,
      structureTitle,
      correspondences: validRows,
      boundary: boundary.trim(),
      prediction: prediction.trim(),
      ...(evidenceRef.trim() ? { evidenceRefs: [evidenceRef.trim()] } : {}),
      completedAt: result.event.ts,
    };
    onToast(t(`island.passage.success.${result.passageKind}`, { target: targetName }));
    onComplete(receipt);
  };

  return (
    <div className="fi-passage-overlay">
      <div className="fi-passage-scrim" aria-hidden="true" />
      <form ref={workbench} className="fi-passage-workbench" role="dialog" aria-modal="true" aria-labelledby="fi-passage-title" onSubmit={submit}>
        <header className="fi-passage-header">
          <div>
            <small>{t('island.passage.kicker')}</small>
            <h2 id="fi-passage-title">{t('island.passage.title', { source: sourceName, target: targetName })}</h2>
          </div>
          <span className="fi-passage-kind" data-kind={intent.passageKind}>
            {t(`island.passage.kind.${intent.passageKind}`)}
          </span>
          <button type="button" className="fi-passage-close" onClick={onCancel} disabled={busy} aria-label={t('island.passage.cancel')}>×</button>
        </header>

        <div className="fi-passage-route" aria-label={t('island.passage.route')}>
          <span>
            <small>{t('island.passage.departure')}</small>
            <strong>{sourceName}</strong>
            {sourceQuestion && <p>{sourceQuestion}</p>}
          </span>
          <i aria-hidden="true">⇄</i>
          <span>
            <small>{t('island.passage.destination')}</small>
            <strong>{targetName}</strong>
            {targetQuestion && <p>{targetQuestion}</p>}
          </span>
        </div>

        {structureStatement && (
          <section className="fi-passage-statement">
            <strong>{t('island.passage.sharedCore')}</strong>
            <p>{structureStatement}</p>
          </section>
        )}

        {sourceMapping && (
          <section className="fi-passage-source-record" aria-label={t('island.passage.sourceRecord')}>
            <header>
              <strong>{t('island.passage.sourceRecord')}</strong>
              <small>{sourceName} · {t('island.passage.recorded')}</small>
            </header>
            <dl>
              {sourceMapping.correspondences.map((correspondence, index) => (
                <div key={`${sourceMapping.refHash}:${index}`}>
                  <dt>{correspondence.quantity[lang]}</dt>
                  <dd>{correspondence.inThisSubstrate[lang]}</dd>
                </div>
              ))}
            </dl>
            {sourceMapping.boundary?.[lang] && (
              <p><b>{t('island.passage.sourceBoundary')}</b>{sourceMapping.boundary[lang]}</p>
            )}
            {sourceMapping.prediction?.[lang] && (
              <p><b>{t('island.passage.sourcePrediction')}</b>{sourceMapping.prediction[lang]}</p>
            )}
          </section>
        )}

        <fieldset className="fi-passage-mappings">
          <legend>{t('island.passage.mappingLegend')}</legend>
          <p>{t('island.passage.mappingHint')}</p>
          {rows.map((row, index) => (
            <div className="fi-passage-mapping-row" key={row.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <label>
                {t('island.passage.quantity')}
                <input
                  ref={index === 0 ? firstInput : undefined}
                  value={row.quantity}
                  onChange={(event) => updateRow(row.id, 'quantity', event.target.value)}
                  maxLength={600}
                  required
                />
              </label>
              <i aria-hidden="true">↦</i>
              <label>
                {t('island.passage.substrate')}
                <input
                  value={row.inThisSubstrate}
                  onChange={(event) => updateRow(row.id, 'inThisSubstrate', event.target.value)}
                  maxLength={600}
                  required
                />
              </label>
              {rows.length > 1 && (
                <button type="button" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))} aria-label={t('island.passage.removeMapping')}>−</button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="fi-passage-add-mapping"
            onClick={() => setRows((current) => current.length >= 8 ? current : [...current, { id: nextId.current++, quantity: '', inThisSubstrate: '' }])}
            disabled={rows.length >= 8}
          >
            {t('island.passage.addMapping')}
          </button>
        </fieldset>

        <label className="fi-passage-prediction fi-passage-boundary">
          <span>{t('island.passage.boundary')}</span>
          <small>{t('island.passage.boundaryHint')}</small>
          <textarea value={boundary} onChange={(event) => setBoundary(event.target.value.slice(0, 1600))} maxLength={1600} required />
        </label>

        <label className="fi-passage-prediction">
          <span>{t('island.passage.prediction')}</span>
          <small>{t('island.passage.predictionHint')}</small>
          <textarea value={prediction} onChange={(event) => setPrediction(event.target.value.slice(0, 2400))} maxLength={2400} required />
        </label>

        <label className="fi-passage-evidence">
          <span>{t('island.passage.evidence')}</span>
          <input value={evidenceRef} onChange={(event) => setEvidenceRef(event.target.value.slice(0, 800))} maxLength={800} placeholder={t('island.passage.evidencePlaceholder')} />
        </label>

        <p className="fi-passage-language-note">{t('island.passage.languageNote')}</p>

        <footer className="fi-passage-actions">
          <button type="button" onClick={onCancel} disabled={busy}>{t('island.passage.cancel')}</button>
          <button type="submit" disabled={!canSubmit}>
            {busy ? t('island.passage.submitting') : t('island.passage.submit')}
          </button>
        </footer>
      </form>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import type { BuildingFloor, BuildingFloorItem, BuildingFloorPlan } from './islandDepth';

export interface StationInteriorDrawerProps {
  station: StationKind | null;
  plan: BuildingFloorPlan | undefined;
  lang: 'zh' | 'en';
  visitedFloorIds?: readonly string[];
  initialFloorId?: string;
  onVisitFloor?: (floorId: string) => void;
  onClose: () => void;
}

const STATION_META: Record<StationKind, { titleKey: string; seal: string; ink: string }> = {
  questions: { titleKey: 'island.interior.questions.title', seal: '问', ink: '#B5673A' },
  library: { titleKey: 'island.interior.library.title', seal: '文', ink: '#2E5E8C' },
  canvas: { titleKey: 'island.interior.whiteboard.title', seal: '板', ink: '#3E9B7E' },
  data: { titleKey: 'island.interior.data.title', seal: '数', ink: '#2E5E8C' },
  driftwood: { titleKey: 'island.interior.driftwood.title', seal: '木', ink: '#6B6154' },
  workshop: { titleKey: 'island.interior.workshop.title', seal: '坊', ink: '#B5673A' },
  gallery: { titleKey: 'island.interior.gallery.title', seal: '展', ink: '#4A4238' },
  tearoom: { titleKey: 'island.interior.tearoom.title', seal: '议', ink: '#3E9B7E' },
  dock: { titleKey: 'island.interior.dock.title', seal: '联', ink: '#4A4238' },
};

export function StationInteriorDrawer({
  station,
  plan,
  lang,
  visitedFloorIds = [],
  initialFloorId,
  onVisitFloor,
  onClose,
}: StationInteriorDrawerProps) {
  const { t } = useTranslation();
  const open = station !== null && !!plan;
  const floors = plan?.floors ?? [];
  const [floorId, setFloorId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const priorFocus = useRef<HTMLElement | null>(null);
  const floorRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const meta = station ? STATION_META[station] : STATION_META.dock;
  const preferredFloor = floors.find((floor) => floor.id === initialFloorId) ?? floors[0] ?? null;

  useEffect(() => {
    if (!open || !preferredFloor) return;
    priorFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setFloorId(preferredFloor.id);
    onVisitFloor?.(preferredFloor.id);
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      priorFocus.current?.focus();
    };
  }, [open, plan?.station]); // eslint-disable-line react-hooks/exhaustive-deps

  const selected = useMemo(
    () => floors.find((floor) => floor.id === floorId) ?? preferredFloor,
    [floorId, floors, preferredFloor],
  );

  const chooseFloor = (floor: BuildingFloor): void => {
    setFloorId(floor.id);
    onVisitFloor?.(floor.id);
  };

  const onDialogKey = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
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

  const onFloorKey = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number): void => {
    let next = index;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = Math.max(0, index - 1);
    else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = Math.min(floors.length - 1, index + 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = floors.length - 1;
    else return;
    event.preventDefault();
    const floor = floors[next];
    if (floor) chooseFloor(floor);
    floorRefs.current[next]?.focus();
  };

  return (
    <>
      <button
        type="button"
        className="fi-interior-scrim"
        data-open={open || undefined}
        aria-label={t('island.interior.close')}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="fi-interior-tower"
        data-open={open || undefined}
        data-screen-label="L2 站点内景抽屉"
        data-station={station ?? undefined}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-labelledby="fi-interior-title"
        onKeyDown={onDialogKey}
      >
        <div className="fi-interior-scroll-rod" aria-hidden="true" />
        <div className="fi-interior-paper">
          <header className="fi-interior-header">
            <div>
              <small>{t('island.interior.kicker')} · {t('island.interior.floorKicker')}</small>
              <h2 id="fi-interior-title"><span style={{ background: meta.ink }}>{meta.seal}</span>{t(meta.titleKey)}</h2>
              <p>{t('island.interior.floorIntro', { count: floors.length })}</p>
            </div>
            <button ref={closeRef} type="button" className="fi-interior-close" onClick={onClose} aria-label={t('island.interior.close')}>×</button>
          </header>

          {floors.length > 0 ? (
            <div className="fi-interior-layout">
              <nav className="fi-floor-cutaway" aria-label={t('island.interior.floorNav')}>
                <div className="fi-floor-roof" aria-hidden="true" />
                {[...floors].reverse().map((floor, reverseIndex) => {
                  const index = floors.length - reverseIndex - 1;
                  return (
                    <button
                      key={floor.id}
                      ref={(element) => { floorRefs.current[index] = element; }}
                      type="button"
                      role="tab"
                      aria-selected={selected?.id === floor.id}
                      data-active={selected?.id === floor.id || undefined}
                      data-visited={visitedFloorIds.includes(floor.id) || undefined}
                      data-source={floor.source}
                      onClick={() => chooseFloor(floor)}
                      onKeyDown={(event) => onFloorKey(event, index)}
                    >
                      <b>{floor.level === floors.length ? 'R' : `F${floor.level}`}</b>
                      <span>{floor.title[lang]}</span>
                      <i aria-hidden="true" />
                    </button>
                  );
                })}
                <div className="fi-floor-foundation" aria-hidden="true">{t('island.interior.foundation')}</div>
              </nav>

              <section className="fi-floor-room" role="tabpanel" aria-live="polite">
                {selected && (
                  <>
                    <header>
                      <span>{selected.level === floors.length ? 'ROOF' : `FLOOR ${String(selected.level).padStart(2, '0')}`}</span>
                      <h3>{selected.title[lang]}</h3>
                      <p>{selected.subtitle[lang]}</p>
                    </header>
                    <div className="fi-floor-items">
                      {selected.items.map((item, index) => <FloorItem key={`${selected.id}:${index}`} item={item} lang={lang} />)}
                    </div>
                  </>
                )}
              </section>
            </div>
          ) : (
            <div className="fi-interior-empty">{t('island.interior.empty')}</div>
          )}

          <footer>{t('island.interior.floorFooter')}</footer>
        </div>
        <div className="fi-interior-scroll-rod" aria-hidden="true" />
      </div>
    </>
  );
}

function Citation({ cite }: { cite: { title: string; venue: string; year: number; url?: string } }) {
  const text = `${cite.title} · ${cite.venue} ${cite.year}`;
  return cite.url ? <a href={cite.url} target="_blank" rel="noopener noreferrer">{text} ↗</a> : <span>{text}</span>;
}

function FloorItem({ item, lang }: { item: BuildingFloorItem; lang: 'zh' | 'en' }) {
  const { t } = useTranslation();
  switch (item.kind) {
    case 'brief':
      return <article className="fi-floor-card fi-floor-brief"><small>{item.label[lang]}</small><p>{item.text[lang]}</p></article>;
    case 'question': {
      const question = item.question;
      return (
        <article className="fi-floor-card fi-floor-question">
          {question.rewrittenFrom && <del>{question.rewrittenFrom[lang]}</del>}
          <p>{question.text[lang]}</p>
          <footer><span>{question.author[lang]}</span><b data-open={question.open || undefined}>{question.open ? t('island.interior.questions.open') : t('island.interior.questions.closed')}</b><em>{question.votes}</em></footer>
        </article>
      );
    }
    case 'digest':
      return <article className="fi-floor-card"><h4>{item.digest.title[lang]}</h4><p>{item.digest.gist[lang]}</p>{item.digest.cite && <small><Citation cite={item.digest.cite} /></small>}</article>;
    case 'debate':
      return <article className="fi-floor-card"><h4>{item.debate.topic[lang]}</h4><ol className="fi-floor-positions">{item.debate.positions.map((position, index) => <li key={index}><b>{String.fromCharCode(65 + index)}</b>{position[lang]}</li>)}</ol></article>;
    case 'datum':
      return <article className="fi-floor-card fi-floor-datum"><div><h4>{item.datum.label[lang]}</h4>{item.datum.note && <p>{item.datum.note[lang]}</p>}</div><strong>{item.datum.value[lang]}</strong></article>;
    case 'scrap':
      return <article className="fi-floor-card fi-floor-scrap"><p>{item.scrap.text[lang]}</p><small>— {item.scrap.author[lang]}</small></article>;
    case 'gallery':
      return <article className="fi-floor-card"><h4>{item.gallery.title[lang]}</h4><p>{item.gallery.gist[lang]}</p>{item.gallery.cite && <small><Citation cite={item.gallery.cite} /></small>}</article>;
    case 'resident':
      return <article className="fi-floor-card fi-floor-resident"><span data-kind={item.resident.kind}>{item.resident.kind === 'ai' ? 'AI' : '人'}</span><div><h4>{item.resident.name}</h4><p>{item.resident.caption[lang]}</p></div></article>;
    case 'structure': {
      const structure = item.structure;
      return (
        <article className="fi-floor-card fi-floor-structure">
          <small>{structure.theme ? t(`chart.structures.theme.${structure.theme}`) : t('chart.structures.legend')}</small>
          <h4>{structure.title[lang]}</h4>
          <p>{structure.statement[lang]}</p>
          {structure.provenance && <a href={structure.provenance.url} target="_blank" rel="noopener noreferrer">{structure.provenance.source}{structure.provenance.recordIds.length ? ` · #${structure.provenance.recordIds.join(' · #')}` : ''} · {structure.provenance.reviewedAt} ↗</a>}
          <em>{t('island.interior.structureBoundary')}</em>
        </article>
      );
    }
  }
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import type { IslandInterior } from '@frontier-isles/data/frontiers';

/**
 * DOM station index (list twin) for a curated island's L1 — invariant 5: every
 * spatial object has a list twin. The isometric buildings are the spatial view;
 * this is the list view, and — critically — it is the RELIABLE way to open a
 * station: it is plain DOM, so a click always lands regardless of the WebGL
 * canvas's CSS-scale hit-test quirks. Every one of the nine buildings appears
 * here with its own content count and opens the same {@link StationInteriorDrawer}
 * the building itself does. Mirrors the sample island's {@link ListTwin}.
 */
export interface GeneratedStationIndexProps {
  interior: IslandInterior;
  sel: StationKind | null;
  onStation: (key: StationKind) => void;
  /** Test/embedded surfaces may opt into the expanded list. L1 starts folded so
   * the spatial buildings remain the primary, efficient navigation. */
  defaultOpen?: boolean;
}

interface Row {
  kind: StationKind;
  glyph: string;
  bg: string;
  titleKey: string;
  count: number;
}

export function GeneratedStationIndex({ interior, sel, onStation, defaultOpen = false }: GeneratedStationIndexProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);

  // Nine buildings, in the island's walking order; count is drawn from the
  // station's own interior section so each row advertises how much is inside.
  const rows: Row[] = [
    { kind: 'questions', glyph: '问', bg: '#B5673A', titleKey: 'island.interior.questions.title', count: interior.questions.length },
    { kind: 'library', glyph: '文', bg: '#2E5E8C', titleKey: 'island.interior.library.title', count: interior.digests.length },
    { kind: 'canvas', glyph: '板', bg: '#3E9B7E', titleKey: 'island.interior.whiteboard.title', count: interior.debates.length },
    { kind: 'data', glyph: '数', bg: '#2E5E8C', titleKey: 'island.interior.data.title', count: interior.data.length },
    { kind: 'workshop', glyph: '坊', bg: '#B5673A', titleKey: 'island.interior.workshop.title', count: interior.workshop.length },
    { kind: 'gallery', glyph: '展', bg: '#4A4238', titleKey: 'island.interior.gallery.title', count: interior.gallery.length },
    { kind: 'driftwood', glyph: '木', bg: '#6B6154', titleKey: 'island.interior.driftwood.title', count: interior.driftwood.length },
    { kind: 'tearoom', glyph: '茶', bg: '#3E9B7E', titleKey: 'island.interior.tearoom.title', count: interior.tearoom.length },
    { kind: 'dock', glyph: '渡', bg: '#4A4238', titleKey: 'island.interior.dock.title', count: interior.residents.length },
  ];

  return (
    <div className="fi-generated-station-index" data-testid="generated-station-index" data-open={open || undefined}>
      <button
        type="button"
        className="fi-generated-station-index-toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">筑</span>
        <span><strong>{t('island.interior.index.title')}</strong><small>{t('island.interior.index.motto')}</small></span>
        <b aria-hidden="true">{open ? '收' : '展'}</b>
      </button>
      {open && (
        <div className="fi-generated-station-index-sheet">
          {rows.map((r) => (
            <button
              type="button"
              key={r.kind}
              data-station-row={r.kind}
              data-selected={sel === r.kind || undefined}
              onClick={() => { onStation(r.kind); setOpen(false); }}
            >
              <span style={{ background: r.bg }}>{r.glyph}</span>
              <span>{t(r.titleKey)}</span>
              <small>{r.count}</small>
            </button>
          ))}
          <div>{t('island.interior.index.hint')}</div>
        </div>
      )}
    </div>
  );
}

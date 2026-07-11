import { useTranslation } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import type { IslandInterior } from '@frontier-isles/data';

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
}

interface Row {
  kind: StationKind;
  glyph: string;
  bg: string;
  titleKey: string;
  count: number;
}

export function GeneratedStationIndex({ interior, sel, onStation }: GeneratedStationIndexProps) {
  const { t } = useTranslation();

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
    <div
      data-testid="generated-station-index"
      style={{ position: 'absolute', left: 20, top: 232, zIndex: 6, width: 216, background: 'var(--card,rgba(250,245,232,0.94))', border: '1.5px solid var(--ink,#3A342B)', borderRadius: 8, backdropFilter: 'blur(8px)', overflow: 'hidden', transition: 'background .7s', boxShadow: '0 8px 24px rgba(24,20,14,0.14)' }}
    >
      <div style={{ padding: '10px 14px 8px', borderBottom: '0.75px solid var(--ink2,#6B6154)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 13, color: 'var(--inkT,#2B2620)' }}>{t('island.interior.index.title')}</span>
        <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 9.5, color: 'var(--ink2,#6B6154)' }}>{t('island.interior.index.motto')}</span>
      </div>
      {rows.map((r) => (
        <button
          type="button"
          key={r.kind}
          data-station-row={r.kind}
          onClick={() => onStation(r.kind)}
          style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, padding: '7.5px 14px', border: 0, cursor: 'pointer', background: sel === r.kind ? 'rgba(227,169,60,0.18)' : 'transparent', textAlign: 'left', transition: 'background .3s' }}
        >
          <span style={{ width: 20, height: 20, borderRadius: 3, background: r.bg, color: '#F6F2E6', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Serif SC',serif", flex: 'none' }}>{r.glyph}</span>
          <span style={{ flex: 1, fontSize: 13, color: 'var(--inkT,#2B2620)' }}>{t(r.titleKey)}</span>
          <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10.5, color: 'var(--ink2,#6B6154)' }}>{r.count}</span>
        </button>
      ))}
      <div style={{ padding: '8px 14px', borderTop: '0.75px solid var(--ink2,#6B6154)', fontSize: 10, color: 'var(--ink2,#6B6154)', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{t('island.interior.index.hint')}</div>
    </div>
  );
}

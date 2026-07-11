import { useTranslation } from 'react-i18next';
import type { StationKind } from '@frontier-isles/core';
import type { IslandInterior } from '@frontier-isles/data';

/**
 * L2 station-interior drawer for curated/generated islands. When a visitor taps
 * a station on a generated island's L1 scene, this slides in a right-side scroll
 * panel showing that station's real content — the Question Wall, the library's
 * clustered digests, whiteboard debates, the data desk, the driftwood garden, or
 * the resident roster — sourced from the island's {@link IslandInterior}
 * (meta.atlas.interior on the server; the offline fallback carries the same
 * block). This is the generated-island analogue of the sample island's bespoke
 * QftPanel / MorningReport / DriftwoodModal, and it is READ-ONLY: it renders the
 * archive, it never posts events (AI-never-pushes discipline, and the visitor
 * writes through the existing transplant/ceremony flows, not here).
 *
 * Visual language mirrors QftPanel (aged-paper scroll, seal chips, mono kickers)
 * so an interior reads as the same world whether the island is the sample or a
 * curated frontier. Bilingual via the caller's `lang`; editorial content stays
 * in its authored form (invariant 9).
 */
export interface StationInteriorDrawerProps {
  /** Which station was tapped; null closes the drawer. */
  station: StationKind | null;
  interior: IslandInterior | undefined;
  lang: 'zh' | 'en';
  onClose: () => void;
}

/** Station kind → which interior section it opens. Stations without a dedicated
 *  archive section (workshop/gallery/tearoom/dock — the "life" of the island)
 *  open the resident roster. */
type Section = 'questions' | 'library' | 'whiteboard' | 'data' | 'driftwood' | 'residents';
const SECTION_OF: Record<StationKind, Section> = {
  questions: 'questions',
  library: 'library',
  canvas: 'whiteboard',
  data: 'data',
  driftwood: 'driftwood',
  workshop: 'residents',
  gallery: 'residents',
  tearoom: 'residents',
  dock: 'residents',
};

function ScrollRod() {
  return (
    <div style={{ position: 'relative', height: 20, background: 'linear-gradient(180deg,#5B4632,#3E2F20)', borderRadius: 10, border: '1px solid #2B2015', margin: '0 6px' }}>
      <span style={{ position: 'absolute', left: -9, top: 1, width: 16, height: 16, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%,#7A5B3E,#3E2F20)', border: '1px solid #2B2015' }} />
      <span style={{ position: 'absolute', right: -9, top: 1, width: 16, height: 16, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%,#7A5B3E,#3E2F20)', border: '1px solid #2B2015' }} />
    </div>
  );
}

const sealBase = { width: 26, height: 26, borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Serif SC',serif", fontSize: 13, flex: 'none' } as const;
const cardStyle = { border: '1.5px solid rgba(58,52,43,0.35)', background: '#FDFAF1', borderRadius: 6, padding: '12px 14px' } as const;

export function StationInteriorDrawer({ station, interior, lang, onClose }: StationInteriorDrawerProps) {
  const { t } = useTranslation();
  const open = station !== null;
  const section = station ? SECTION_OF[station] : 'residents';

  const sealText: Record<Section, string> = {
    questions: t('island.interior.questions.seal'),
    library: t('island.interior.library.seal'),
    whiteboard: t('island.interior.whiteboard.seal'),
    data: t('island.interior.data.seal'),
    driftwood: t('island.interior.driftwood.seal'),
    residents: t('island.interior.residents.seal'),
  };
  const sealBg: Record<Section, string> = {
    questions: '#B5673A',
    library: '#2E5E8C',
    whiteboard: '#3E9B7E',
    data: '#2E5E8C',
    driftwood: '#6B6154',
    residents: '#4A4238',
  };
  const titleText: Record<Section, string> = {
    questions: t('island.interior.questions.title'),
    library: t('island.interior.library.title'),
    whiteboard: t('island.interior.whiteboard.title'),
    data: t('island.interior.data.title'),
    driftwood: t('island.interior.driftwood.title'),
    residents: t('island.interior.residents.title'),
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(24,20,14,0.32)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .5s' }}
      />
      <div
        data-screen-label="L2 站点内景抽屉"
        data-station={station ?? undefined}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 560, transform: `translateX(${open ? '0%' : '108%'})`, transition: 'transform .55s cubic-bezier(0.22,1,0.36,1)', display: 'flex', flexDirection: 'column', filter: 'drop-shadow(-14px 0 30px rgba(24,20,14,0.3))' }}
      >
        <ScrollRod />
        <div style={{ position: 'relative', flex: 1, background: '#FAF5E8', backgroundImage: 'repeating-linear-gradient(0deg,rgba(43,38,32,0.016) 0 1px,transparent 1px 3px)', borderLeft: '1.5px solid #3A342B', borderRight: '1.5px solid #3A342B', overflowY: 'auto', padding: '22px 26px' }}>
          <span style={{ position: 'absolute', right: 2, top: 56, fontFamily: "'Noto Serif SC',serif", fontSize: 150, fontWeight: 900, color: 'rgba(181,103,58,0.05)', pointerEvents: 'none', lineHeight: 1 }} aria-hidden="true">{sealText[section]}</span>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10.5, letterSpacing: '0.15em', color: '#B5673A' }}>{t('island.interior.kicker')}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ ...sealBase, background: sealBg[section], color: '#F6F2E6' }}>{sealText[section]}</span>
                <span style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 900, fontSize: 22, color: '#2B2620' }}>{titleText[section]}</span>
              </div>
            </div>
            <div onClick={onClose} title={t('island.interior.close')} style={{ cursor: 'pointer', width: 30, height: 30, border: '1.5px solid #3A342B', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2B2620', fontSize: 14, background: '#F2EAD8' }}>✕</div>
          </div>

          <div style={{ marginTop: 16 }}>
            {!interior ? (
              <div style={{ ...cardStyle, color: '#6B6154', fontSize: 12.5 }}>{t('island.interior.empty')}</div>
            ) : (
              <SectionBody section={section} interior={interior} lang={lang} t={t} />
            )}
          </div>

          <div style={{ marginTop: 16, fontSize: 10.5, color: '#A89C88', fontFamily: "'JetBrains Mono',ui-monospace,monospace", textAlign: 'center' }}>{t('island.interior.footer')}</div>
        </div>
        <ScrollRod />
      </div>
    </>
  );
}

function SectionBody({ section, interior, lang, t }: { section: Section; interior: IslandInterior; lang: 'zh' | 'en'; t: (k: string) => string }) {
  switch (section) {
    case 'questions':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {interior.questions.map((q, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', border: '1.2px solid #6B6154', color: '#6B6154', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  {q.rewrittenFrom && (
                    <div style={{ fontSize: 12, color: '#A89C88', textDecoration: 'line-through', marginBottom: 2 }}>
                      {q.rewrittenFrom[lang]} <span style={{ textDecoration: 'none', color: '#8A6A1E' }}>{t('island.interior.questions.rewriteTag')}</span>
                    </div>
                  )}
                  <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 600, fontSize: 14.5, color: '#2B2620', lineHeight: 1.5 }}>{q.text[lang]}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 9, paddingLeft: 32 }}>
                <span style={{ fontSize: 9.5, padding: '2px 7px', borderRadius: 999, border: '1px solid rgba(139,148,178,0.55)', color: '#6B7594', whiteSpace: 'nowrap' }}>{q.author[lang]}</span>
                <span style={{ fontSize: 11, padding: '2.5px 10px', borderRadius: 999, border: `1.2px solid ${q.open ? '#3E9B7E' : '#B5673A'}`, background: q.open ? 'rgba(62,155,126,0.1)' : '#B5673A', color: q.open ? '#2B7A5F' : '#F6F2E6' }}>{q.open ? t('island.interior.questions.open') : t('island.interior.questions.closed')}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 9, letterSpacing: 2, color: '#2E5E8C', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 110 }} title={t('island.interior.questions.voteHint')}>{'●'.repeat(Math.min(q.votes, 12))}</span>
                <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 12, color: '#2E5E8C', minWidth: 16, textAlign: 'right' }}>{q.votes}</span>
              </div>
            </div>
          ))}
        </div>
      );
    case 'library':
      return (
        <>
          <div style={{ margin: '0 0 10px', fontSize: 11.5, color: '#6B6154' }}>{t('island.interior.library.sub')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {interior.digests.map((d, i) => (
              <div key={i} style={cardStyle}>
                <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 14, color: '#2B2620', lineHeight: 1.45 }}>{d.title[lang]}</div>
                <div style={{ marginTop: 5, fontSize: 12.5, color: '#4A4238', lineHeight: 1.55 }}>{d.gist[lang]}</div>
                {d.cite && (
                  <div style={{ marginTop: 7, fontSize: 10.5, color: '#6B6154', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>
                    {t('island.interior.library.cite')} · {d.cite.url ? (
                      <a href={d.cite.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2E5E8C' }}>{d.cite.title} · {d.cite.venue} {d.cite.year} ↗</a>
                    ) : (
                      <span>{d.cite.title} · {d.cite.venue} {d.cite.year}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      );
    case 'whiteboard':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {interior.debates.map((db, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 14.5, color: '#2B2620', lineHeight: 1.5 }}>{db.topic[lang]}</div>
              <div style={{ margin: '6px 0 4px', fontSize: 10, color: '#3E9B7E', fontFamily: "'JetBrains Mono',ui-monospace,monospace", letterSpacing: '0.1em' }}>{t('island.interior.whiteboard.positions')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {db.positions.map((p, j) => (
                  <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: '#3E4A48', lineHeight: 1.5 }}>
                    <span style={{ color: '#3E9B7E', flex: 'none', fontFamily: "'JetBrains Mono',ui-monospace,monospace" }}>{String.fromCharCode(65 + j)}</span>
                    <span>{p[lang]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    case 'data':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {interior.data.map((d, i) => (
            <div key={i} style={{ ...cardStyle, display: 'flex', gap: 12, alignItems: 'baseline' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, color: '#2B2620', fontFamily: "'Noto Serif SC',serif", fontWeight: 600 }}>{d.label[lang]}</div>
                {d.note && <div style={{ marginTop: 3, fontSize: 10.5, color: '#8C8270', lineHeight: 1.45 }}>{d.note[lang]}</div>}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 14, color: '#2E5E8C', textAlign: 'right', flex: 'none', maxWidth: 200 }}>{d.value[lang]}</div>
            </div>
          ))}
        </div>
      );
    case 'driftwood':
      return (
        <>
          <div style={{ margin: '0 0 10px', fontSize: 11.5, color: '#6B6154' }}>{t('island.interior.driftwood.sub')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {interior.driftwood.map((it, i) => (
              <div key={i} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1, fontSize: 13, color: '#2B2620', fontFamily: "'Noto Serif SC',serif", fontWeight: 600, lineHeight: 1.45 }}>{it.text[lang]}</span>
                <span style={{ fontSize: 9.5, padding: '1.5px 7px', borderRadius: 999, border: '1px solid rgba(139,148,178,0.55)', color: '#6B7594', whiteSpace: 'nowrap', flex: 'none' }}>{it.author[lang]}</span>
              </div>
            ))}
          </div>
        </>
      );
    case 'residents':
      return (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {interior.residents.map((r, i) => (
              <div key={i} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 26, height: 26, borderRadius: r.kind === 'ai' ? 4 : '50%', background: r.kind === 'ai' ? '#5A6C9E' : '#2E5E8C', color: '#F6F2E6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Serif SC',serif", fontSize: 12, flex: 'none' }}>{r.kind === 'ai' ? t('island.interior.residents.ai') : t('island.interior.residents.human')}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 700, fontSize: 14, color: '#2B2620' }}>{r.name}</div>
                  <div style={{ fontSize: 11.5, color: '#6B6154', marginTop: 1 }}>{r.caption[lang]}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 10.5, color: '#A89C88', textAlign: 'center' }}>{t('island.interior.residents.note')}</div>
        </>
      );
  }
}

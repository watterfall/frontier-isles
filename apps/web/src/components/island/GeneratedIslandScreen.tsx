import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { projectClaimState, type ClaimState, type StationKind } from '@frontier-isles/core';
import { NIGHT_SCENE_VARS, DOMAIN_SCENE_VARS, sceneVarsToStyle } from '@frontier-isles/assets';
import { DayNightLever } from './DayNightLever';
import { api } from '../../api/client';
import { generate, type GeneratedScene } from '../../scene/generator';
import { GeneratedSceneView } from '../../scene/GeneratedScene';
import PixiScene from '../../scene/PixiScene';
import type { LayoutInput } from '../../scene/layout';

/** Shape of the server's GET /api/islands/:slug detail (only the fields we use). */
interface IslandDetail {
  object: { title: string; qfocus: string; status: 'open' | 'active' | 'dissolved' | 'resolved'; frontier?: { heat?: number; substrate?: number } };
  domain: string;
  chart: { x: number; y: number; scale: number; activity: number; members?: number };
  growth: { stage: 'empty' | 'hut' | 'academy' | 'school' };
  tide: { A: number; B: number; D: number; N: number };
  eventCount: number;
  memberships: Array<{ actorId: string; actorKind: string; role: string | null; aiKind: string | null }>;
  atlas?: {
    scores: number[];
    cluster: { code: string; zh: string; en: string };
    citation: { url: string; title: string; venue: string; year: number };
    brief: { zh: string; en: string };
    outlier?: boolean;
  };
}

const STAGE_INDEX: Record<string, number> = { empty: 0, hut: 1, academy: 2, school: 3 };

export interface GeneratedIslandScreenProps {
  slug: string;
  night: boolean;
  onToggleNight: () => void;
  onBack: () => void;
  onStation: (key: StationKind) => void;
}

/**
 * The L1 screen for curated/founded (non-sample) islands. Fetches the island
 * detail, generates a scene from place-plane + growth + domain + atlas scores,
 * and renders it with the island's real title/qfocus/brief/citation. The
 * sample island keeps its bespoke {@link Scene}; this is the data-driven path.
 */
export function GeneratedIslandScreen({ slug, night, onToggleNight, onBack, onStation }: GeneratedIslandScreenProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';
  const [detail, setDetail] = useState<IslandDetail | null>(null);
  const [scene, setScene] = useState<GeneratedScene | null>(null);
  const [input, setInput] = useState<LayoutInput | null>(null);
  const [claims, setClaims] = useState<ClaimState[] | undefined>(undefined);
  // 海即数据 (depth-plan-v2): substrate → sea darkness, refuted claims → undertow
  // contention, relation counts → the text decoder (invariant 6: honest encoding).
  const [seaStats, setSeaStats] = useState<{ substrate?: number; validates: number; refutes: number; bridges: number; contention: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const [noGpu, setNoGpu] = useState(false); // WebGL absent → fall back to the SVG scene

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setNoGpu(false);
    // Fetch the island detail + its real ledger in parallel: the ledger drives the
    // Pixi claim buildings (M4「接线上」); the detail drives everything else. Either
    // is best-effort — a null ledger just means buildSceneGraph synths from eventCount.
    Promise.all([api.island(slug), api.ledger(slug)]).then(([d, ledger]) => {
      if (cancelled) return;
      if (!d) {
        setFailed(true);
        return;
      }
      const det = d as IslandDetail;
      setDetail(det);
      const stage = STAGE_INDEX[det.growth.stage] ?? 1;
      const hasAi = det.memberships.some((m) => m.actorKind === 'agent');
      const layoutInput: LayoutInput = {
        slug,
        domain: det.domain as '数理' | '物质' | '生命' | '交叉',
        stage,
        members: det.chart.members ?? det.memberships.length,
        dormant: det.growth.stage === 'empty' && det.eventCount === 0,
        status: det.object.status,
        outlier: det.atlas?.outlier ?? false,
        tide: det.tide.N,
        hasAi,
        eventCount: det.eventCount,
      };
      const projected = ledger ? projectClaimState(ledger) : undefined;
      setInput(layoutInput);
      setClaims(projected);
      setScene(generate(layoutInput)); // still needed for the SVG (no-GPU) fallback
      // 海即数据 readouts: contention = unresolved-refute magnitude (→ undertow);
      // relation counts decode the sea for the reader (list-twin, not a painted key).
      const events = ledger ?? [];
      const refuted = projected?.filter((c) => c.ghost === 'refuted').length ?? 0;
      setSeaStats({
        substrate: det.object.frontier?.substrate,
        validates: events.filter((e) => e.action === 'validate').length,
        refutes: events.filter((e) => e.action === 'refute').length,
        bridges: events.filter((e) => e.action.startsWith('bridge')).length,
        contention: Math.min(1, refuted * 0.5),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (failed) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: '#F2EAD8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: '#6B6154' }}>
        <span style={{ fontFamily: "'Noto Serif SC',serif", fontSize: 16 }}>{t('island.notReachable')}</span>
        <button onClick={onBack} style={{ cursor: 'pointer', background: '#2B2620', color: '#F2EAD8', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13 }}>{t('island.back')}</button>
      </div>
    );
  }

  if (!detail || !scene || !input) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: '#F2EAD8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6154' }}>
        <span style={{ fontFamily: "'Noto Serif SC',serif", fontSize: 16 }}>{t('island.loading')}</span>
      </div>
    );
  }

  const title = detail.object.title;
  const qfocus = detail.object.qfocus;
  const brief = detail.atlas?.brief[lang] ?? '';
  const citation = detail.atlas?.citation;
  const cluster = detail.atlas?.cluster[lang];
  const domain = detail.domain as '数理' | '物质' | '生命' | '交叉';
  // 海即数据 decoder (invariant 6): abstractness tier for the sea-depth readout +
  // the relation counts that make the current/undertow legible as text (list-twin).
  const abstractKey = (s: number): string => (s >= 0.66 ? 'island.seaData.abstract.hi' : s >= 0.33 ? 'island.seaData.abstract.mid' : 'island.seaData.abstract.lo');
  const relParts: string[] = [];
  if (seaStats) {
    if (seaStats.validates) relParts.push(`${seaStats.validates} ${t('island.seaData.validate')}`);
    if (seaStats.refutes) relParts.push(`${seaStats.refutes} ${t('island.seaData.refute')}`);
    if (seaStats.bridges) relParts.push(`${seaStats.bridges} ${t('island.seaData.bridge')}`);
  }
  // Cascade: day defaults ← domain tint ← night override (§1: palette only, never shape).
  const sceneVars = { ...DOMAIN_SCENE_VARS[domain], ...(night ? NIGHT_SCENE_VARS : {}) };

  return (
    <div
      data-screen-label="L1 生成岛"
      style={{ position: 'absolute', inset: 0, background: 'var(--pp,#F2EAD8)', transition: 'background .8s ease', ...sceneVarsToStyle(sceneVars) }}
    >
      {/* L1 scene: the Pixi isometric renderer (M4「接线上」), fed the island's real
          ledger-driven claims + App day/night. SVG scene is the no-GPU fallback
          (CLAUDE.md: the app must render without the GPU). */}
      {noGpu ? (
        <GeneratedSceneView scene={scene} night={night} nightT={50} onStation={onStation} />
      ) : (
        <PixiScene
          input={input}
          claims={claims}
          t={night ? 1 : 0}
          substrate={seaStats?.substrate}
          undertow={seaStats?.contention ?? 0}
          onStation={onStation}
          onWebglError={() => setNoGpu(true)}
        />
      )}

      {/* L1 顶部信息 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '18px 24px', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div onClick={onBack} style={{ pointerEvents: 'auto', cursor: 'pointer', background: 'var(--card,rgba(250,245,232,0.92))', border: '1.5px solid var(--ink,#3A342B)', borderRadius: 6, padding: '9px 14px', fontSize: 13, color: 'var(--inkT,#2B2620)', display: 'flex', alignItems: 'center', gap: 8, transition: 'background .7s,color .7s' }}>
            ◀ {t('island.back')}
          </div>
          <div style={{ background: 'var(--card,rgba(250,245,232,0.92))', border: '1.5px solid var(--ink,#3A342B)', borderRadius: 6, padding: '10px 18px', maxWidth: 520, transition: 'background .7s' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 900, fontSize: 20, color: 'var(--inkT,#2B2620)', transition: 'color .7s' }}>{title}</span>
              {cluster && <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 9.5, color: 'var(--ink2,#6B6154)', border: '1px solid var(--ink2,#6B6154)', borderRadius: 4, padding: '1px 6px' }}>{cluster}</span>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink2,#6B6154)', marginTop: 4, lineHeight: 1.5 }}>
              {t('island.qfocusPrefix')}{qfocus}
            </div>
            {brief && <div style={{ fontSize: 11, color: 'var(--ink2,#6B6154)', marginTop: 6, lineHeight: 1.6, opacity: 0.85 }}>{brief}</div>}
            {citation && (
              <a href={citation.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 7, fontSize: 10, color: 'var(--gold2,#8A6A1E)', fontFamily: "'JetBrains Mono',ui-monospace,monospace", textDecoration: 'none', border: '1px solid var(--gold,#B98A2E)', borderRadius: 3, padding: '2px 7px' }}>
                {citation.venue} ({citation.year})
              </a>
            )}
            {/* 海即数据 decoder: sea darkness = abstractness, undertow = contention;
                stated as text so the sea's data channels are always decodable. */}
            {seaStats && (seaStats.substrate != null || relParts.length > 0) && (
              <div style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: 'var(--ink2,#6B6154)', marginTop: 7, display: 'flex', gap: 12, flexWrap: 'wrap', opacity: 0.9 }}>
                {seaStats.substrate != null && (
                  <span>🌊 {t('island.seaData.depth')} {seaStats.substrate.toFixed(2)} · {t(abstractKey(seaStats.substrate))}</span>
                )}
                {relParts.length > 0 && <span>⇄ {relParts.join(' · ')}</span>}
              </div>
            )}
          </div>
        </div>
        <div style={{ pointerEvents: 'auto' }}>
          <DayNightLever night={night} onToggle={onToggleNight} />
        </div>
      </div>

      {/* Leave links */}
      <div style={{ position: 'absolute', left: 22, bottom: 14, fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10.5, color: 'var(--ink2,#6B6154)' }}>
        <span>{t('island.leaveLinks.label')}</span>
        <a href={api.problemMdUrl(slug)} style={{ color: 'var(--gold2,#8A6A1E)' }}> {t('island.leaveLinks.problem')}</a>
        {' · '}
        <a href={api.ledgerJsonlUrl(slug)} style={{ color: 'var(--gold2,#8A6A1E)' }}>{t('island.leaveLinks.ledger')}</a>
      </div>
    </div>
  );
}

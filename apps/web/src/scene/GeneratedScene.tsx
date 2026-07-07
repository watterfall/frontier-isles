import type { JSX } from 'react';
import {
  SceneDefs,
  GrainOverlay,
  NightSky,
  DaySky,
  Reef,
  LotusPond,
  StoneLantern,
  SteppingStones,
  DesirePath,
  IsoTree,
  Bamboo,
  CreationStone,
  Fireflies,
  HangingLantern,
  GhostArtifact,
  ResidentFigure,
  IslandMound,
  StationLibrary,
  StationWhiteboardHall,
  StationQuestionWall,
  StationDataBench,
  StationWorkshop,
  StationGallery,
  StationTearoom,
  DriftwoodGarden,
  FerryDock,
} from '@frontier-isles/assets';
import type { StationKind } from '@frontier-isles/core';
import type { GeneratedScene, GenScenery } from './generator';

const DOMAIN_FILL: Record<string, string> = {
  数理: '#C9D8E6',
  物质: '#E8CFAE',
  生命: '#C6DECC',
  交叉: '#ECDFB4',
};

const STATION_COMPONENTS: Record<StationKind, (p: { x?: number; y?: number; onClick: () => void; selected: boolean }) => JSX.Element> = {
  library: (p) => <StationLibrary {...p} />,
  canvas: (p) => <StationWhiteboardHall {...p} />,
  questions: (p) => <StationQuestionWall {...p} />,
  data: (p) => <StationDataBench {...p} />,
  workshop: (p) => <StationWorkshop {...p} />,
  gallery: (p) => <StationGallery {...p} />,
  tearoom: (p) => <StationTearoom {...p} />,
  driftwood: (p) => <DriftwoodGarden {...p} />,
  dock: (p) => <FerryDock {...p} />,
};

function renderScenery(p: GenScenery, i: number): JSX.Element {
  switch (p.kind) {
    case 'reef':
      return <Reef key={i} variant={p.variant ?? 0} />;
    case 'lotus':
      return <LotusPond key={i} />;
    case 'stoneLantern':
      return <StoneLantern key={i} />;
    case 'steppingStones':
      return <SteppingStones key={i} />;
    case 'desirePath':
      return <DesirePath key={i} />;
    case 'tree':
      return <IsoTree key={i} x={p.x} y={p.y} scale={p.scale} />;
    case 'bamboo':
      return <Bamboo key={i} />;
    case 'creationStone':
      return <CreationStone key={i} />;
    default:
      return <g key={i} />;
  }
}

export interface GeneratedSceneProps {
  scene: GeneratedScene;
  night: boolean;
  /** Night timeline position 1..86 (gates ghosts). */
  t: number;
  onStation: (key: StationKind) => void;
}

/**
 * Renders a generated island scene from a {@link GeneratedScene}. Day/night is
 * palette-only (caller applies NIGHT_SCENE_VARS on the wrapping div). The
 * island base, stations, scenery, residents, and night layer are all data-
 * driven — no hardcoded layout (architecture §1).
 */
export function GeneratedSceneView({ scene, night, t, onStation }: GeneratedSceneProps) {
  const { stations, scenery, residents, ghosts, domain, dormant, status, outlier, tide } = scene;
  const moundFill = dormant || status === 'dissolved' ? '#D8D3C2' : DOMAIN_FILL[domain] ?? '#ECDFB4';
  // Tide N = A − D. Moon-on-water intensity: more night-science activity (|N|)
  // = brighter reflection. Subtle, no dashboards (§4). Positive N (divergence
  // dominates) lifts the streak; negative sinks it.
  const tideOpacity = Math.min(Math.abs(tide) / 8, 0.45);
  const tideY = 510 - Math.max(-30, Math.min(30, tide * 4));

  return (
    <svg viewBox="0 0 1440 900" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <SceneDefs />
      {night ? <NightSky /> : <DaySky />}

      {/* 环岛水纹 · 沙洲 */}
      <polygon points="760,176 1348,470 760,772 172,470" fill="none" stroke="var(--water,#C8D8E4)" strokeWidth="0.9" opacity="0.5" />
      <polygon points="760,196 1302,474 760,754 218,474" fill="var(--sand,#E7DBBB)" stroke="var(--ink,#3A342B)" strokeWidth="0.75" opacity="0.9" />
      <Reef variant={0} />
      <Reef variant={1} />

      {/* 地面 · isogrid */}
      <polygon points="760,210 1288,474 760,738 232,474" fill="var(--ground,#EBDFC4)" stroke="var(--ink,#3A342B)" strokeWidth="1.5" />
      <rect x="232" y="210" width="1056" height="528" fill="url(#isogrid)" clipPath="url(#groundClip)" />

      {/* 域植被 */}
      {scenery.map((p, i) => renderScenery(p, i))}

      {/* 岛基 */}
      <IslandMound variant={0} fill={moundFill} />

      {/* 创世石 */}
      <CreationStone />

      {/* 离群辉光 — high-variance islands carry a subtle pulsing aura (§4 outlier). */}
      {outlier && (
        <circle cx="760" cy="474" r="200" fill="url(#outGlow)" style={{ animation: 'pulseGlow 3.2s ease-in-out infinite' }} opacity={0.5} />
      )}

      {/* 站（按 stage 可见性门控） */}
      {stations.filter((s) => s.visible).map((s) => {
        const Comp = STATION_COMPONENTS[s.kind];
        return <Comp key={s.kind} x={s.x} y={s.y} onClick={() => onStation(s.kind)} selected={false} />;
      })}

      {/* 终局叠加 */}
      {status === 'dissolved' && (
        <g opacity={0.7}>
          <ellipse cx="760" cy="474" rx="320" ry="160" fill="#EDE8DA" opacity="0.6" />
          <ellipse cx="760" cy="474" rx="240" ry="120" fill="#EDE8DA" opacity="0.5" />
        </g>
      )}
      {status === 'resolved' && (
        <g transform="translate(760,680)">
          <line x1="0" y1="0" x2="0" y2="-60" stroke="#4A4238" strokeWidth="2" />
          <path d="M 0 -60 L 16 -50 L 0 -40 Z" fill="#E3A93C" stroke="#4A4238" strokeWidth="0.75" />
          <circle cx="0" cy="-55" r="8" fill="#E3A93C" opacity="0.4" style={{ animation: 'pulseGlow 3s ease-in-out infinite' }} />
        </g>
      )}
      {dormant && status !== 'dissolved' && (
        <g opacity={0.5}>
          <ellipse cx="700" cy="500" rx="60" ry="20" fill="#8F9B7E" opacity="0.6" />
          <ellipse cx="820" cy="540" rx="50" ry="16" fill="#8F9B7E" opacity="0.5" />
        </g>
      )}

      {/* 居民 */}
      {!night && residents.map((r, i) => (
        <ResidentFigure key={i} x={r.x} y={r.y} kind={r.kind} aiRole={r.aiRole} caption={r.caption} />
      ))}

      {/* 夜晚层 */}
      {night && (
        <g>
          <HangingLantern x={1032} y={342} size="large" swaySeconds={3.4} />
          <HangingLantern x={616} y={318} size="large" swaySeconds={4.1} />
          <HangingLantern x={846} y={556} size="small" swaySeconds={3.8} />
          <Fireflies />
          {/* 潮汐月影 — moon-on-water streak, intensity/position from N=A−D (§4).
              More night-science activity = brighter reflection; divergence (N>0)
              lifts the streak toward the shore. Subtle, no dashboards. */}
          {tideOpacity > 0.05 && (
            <ellipse cx="760" cy={tideY} rx="180" ry="14" fill="#F5B94B" opacity={tideOpacity * 0.6} style={{ filter: 'blur(6px)' }} />
          )}
          {/* AI 值夜窗光（文献阁，若可见） */}
          {stations.find((s) => s.kind === 'library' && s.visible) && (
            <g transform="translate(760,296)">
              <g transform="skewY(26.565)">
                <rect x="-84" y="-22" width="14" height="13" fill="#F5B94B" opacity="0.85" />
                <rect x="-62" y="-22" width="14" height="13" fill="#F5B94B" opacity="0.55" />
              </g>
              <circle cx="-58" cy="6" r="28" fill="url(#lgrad)" />
            </g>
          )}
          {/* 魂影，按时间轴阈值渐显（账本驱动） */}
          {ghosts.map((g) => (
            <GhostArtifact key={g.type} type={g.type} opacity={t >= g.threshold ? 0.85 : 0} />
          ))}
        </g>
      )}

      {/* 四角云雾 · 纸纹 */}
      <ellipse cx="120" cy="180" rx="240" ry="70" fill="var(--pp,#F2EAD8)" opacity="0.8" />
      <ellipse cx="1360" cy="800" rx="260" ry="80" fill="var(--pp,#F2EAD8)" opacity="0.8" />
      <GrainOverlay />
    </svg>
  );
}

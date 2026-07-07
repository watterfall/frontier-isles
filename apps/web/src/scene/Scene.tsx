import type { JSX } from 'react';
import type { StationKind } from '@frontier-isles/core';
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
import { STN } from '../api/fallback';
import {
  SCENERY,
  STATION_ORDER,
  DAY_RESIDENTS,
  CONSTANT_RESIDENTS,
  NIGHT_RESIDENT,
  GHOSTS,
  HANGING_LANTERNS,
  TRANS_TAG_POS,
  type ResidentPlacement,
} from './sampleIsland';

export interface SceneProps {
  night: boolean;
  /** Night timeline position 1..86 (gates the ghost artifacts). */
  t: number;
  selKey: StationKind | null;
  transTo: string | null;
  onStation: (key: StationKind) => void;
}

const STATION_COMPONENTS: Record<
  StationKind,
  (p: { onClick: () => void; selected: boolean }) => JSX.Element
> = {
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

function renderScenery(p: (typeof SCENERY)[number], i: number): JSX.Element {
  switch (p.kind) {
    case 'reef':
      return <Reef key={i} variant={p.variant ?? 0} />;
    case 'lotus':
      return <LotusPond key={i} />;
    case 'stoneLantern':
      return <StoneLantern key={i} />; // lit handled separately at night
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

function Resident({ r, i }: { r: ResidentPlacement; i: number }): JSX.Element {
  return (
    <ResidentFigure
      key={i}
      x={r.x}
      y={r.y}
      kind={r.kind}
      aiRole={r.aiRole}
      flip={r.flip}
      caption={r.caption}
      carryingCanvas={r.carryingCanvas}
      nightWatch={r.nightWatch}
    />
  );
}

/**
 * The L1 sample-island scene, rendered as data-driven React SVG. Day/night
 * is palette-only: the caller applies NIGHT_SCENE_VARS on the wrapping div,
 * so every `var(--x,…)` shape repaints without changing shape.
 */
export function Scene({ night, t, selKey, transTo, onStation }: SceneProps) {
  const sel = selKey ? STN.find((s) => s.k === selKey) : undefined;
  const transPos = transTo ? TRANS_TAG_POS[transTo] : undefined;

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

      <LotusPond />
      <StoneLantern lit={night} />
      <SteppingStones />
      <DesirePath />
      {SCENERY.filter((p) => p.kind === 'tree').map((p, i) => renderScenery(p, i))}
      <Bamboo />

      {/* 选中站高亮（绝对坐标，见 STN 表） */}
      {sel && <ellipse cx={sel.x} cy={sel.y} rx="102" ry="50" fill="none" stroke="var(--gold,#E3A93C)" strokeWidth="2" strokeDasharray="6 6" opacity="0.9" />}

      {/* 创世石 */}
      <CreationStone />

      {/* 九站 */}
      {STATION_ORDER.map((k) => {
        const Comp = STATION_COMPONENTS[k];
        return <Comp key={k} onClick={() => onStation(k)} selected={false} />;
      })}

      {/* 移栽标签 */}
      {transPos && (
        <g transform={`translate(${transPos.x},${transPos.y})`}>
          <rect x="-56" y="-10" width="112" height="19" rx="3" fill="var(--card,rgba(250,245,232,0.92))" stroke="var(--gold,#E3A93C)" strokeWidth="1" />
          <text x="0" y="4" textAnchor="middle" fontSize="9.5" fill="var(--gold2,#8A6A1E)" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
            陶土原型机 · 曾为散木
          </text>
        </g>
      )}

      {/* 居民 */}
      {!night && DAY_RESIDENTS.map((r, i) => <Resident key={`d${i}`} r={r} i={i} />)}
      {!night && (
        <g transform="translate(956,600)" style={{ animation: 'breathe 4s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }}>
          <rect x="-48" y="-11" width="96" height="21" rx="10" fill="var(--card,rgba(250,245,232,0.94))" stroke="var(--gold,#E3A93C)" strokeWidth="1" />
          <text x="0" y="4" textAnchor="middle" fontSize="9.5" fill="var(--gold2,#8A6A1E)" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
            偶遇 · 顾拾 × 苏樱
          </text>
        </g>
      )}
      {night && <Resident r={NIGHT_RESIDENT} i={99} />}
      {CONSTANT_RESIDENTS.map((r, i) => <Resident key={`c${i}`} r={r} i={i} />)}

      {/* 夜晚层：灯笼 / 值夜光 / 争论标签 / 萤火虫 / 魂影 */}
      {night && (
        <g>
          {HANGING_LANTERNS.map((l, i) => (
            <HangingLantern key={i} x={l.x} y={l.y} size={l.size} swaySeconds={l.sway} />
          ))}
          <Fireflies />
          <g transform="translate(980,332)">
            <rect x="-58" y="-10" width="116" height="18" rx="9" fill="rgba(33,44,78,0.9)" stroke="rgba(245,185,75,0.5)" strokeWidth="0.75" />
            <text x="0" y="3" textAnchor="middle" fontSize="10" fill="#F5B94B" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
              一场未决的争论 · 12 条
            </text>
          </g>
          {/* AI 值夜窗光（文献阁） */}
          <g transform="translate(760,296)">
            <g transform="skewY(26.565)">
              <rect x="-84" y="-22" width="14" height="13" fill="#F5B94B" opacity="0.85" />
              <rect x="-62" y="-22" width="14" height="13" fill="#F5B94B" opacity="0.55" />
            </g>
            <circle cx="-58" cy="6" r="28" fill="url(#lgrad)" />
          </g>
          <g transform="translate(760,178)">
            <rect x="-84" y="-11" width="168" height="21" rx="10" fill="rgba(33,44,78,0.92)" stroke="rgba(245,185,75,0.5)" strokeWidth="0.75" />
            <circle cx="-70" cy="-0.5" r="3" fill="#F5B94B" style={{ animation: 'pulseGlow 2.6s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }} />
            <text x="6" y="3.5" textAnchor="middle" fontSize="10" fill="#F5B94B" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
              AI 值夜 · 文献斥候整理 12 篇新文
            </text>
          </g>
          <g transform="translate(560,268)">
            <rect x="-74" y="-11" width="148" height="21" rx="10" fill="rgba(33,44,78,0.92)" stroke="rgba(245,185,75,0.5)" strokeWidth="0.75" />
            <circle cx="-60" cy="-0.5" r="3" fill="#F5B94B" style={{ animation: 'pulseGlow 3.2s ease-in-out infinite .8s', animationPlayState: 'var(--play,running)' as never }} />
            <text x="6" y="3.5" textAnchor="middle" fontSize="10" fill="#F5B94B" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
              综合者缀写 · 白板厅草案
            </text>
          </g>
          {/* 魂影三件，按时间轴阈值渐显 */}
          {GHOSTS.map((g) => (
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

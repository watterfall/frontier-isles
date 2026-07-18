import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
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
  HANGING_LANTERNS,
  TRANS_TAG_POS,
  type ResidentPlacement,
} from './sampleIsland';
import { DEFAULT_GHOST_REVEALS, DEFAULT_NIGHT_SIGNS, type GhostReveal, type NightSign, type NightSignType } from './nightReveal';

export interface SceneProps {
  night: boolean;
  /** Night timeline position 1..86 (gates the ghost artifacts). */
  nightT: number;
  selKey: StationKind | null;
  transTo: string | null;
  onStation: (key: StationKind) => void;
  /**
   * Ghost-reveal thresholds (Phase B.2, `scene/nightReveal.ts`) — driven by
   * the real machine-curiosity ledger when the caller has one, otherwise
   * `DEFAULT_GHOST_REVEALS` (the seed constants, identical to pre-B.2
   * rendering). Optional so Scene stays usable standalone (tests, Storybook).
   */
  ghostReveals?: GhostReveal[];
  /**
   * Night sign-tag thresholds (§3.3, `scene/nightReveal.ts`) — the argument /
   * AI-night-watch / synthesizer-draft tags appear only from the night their
   * real trigger event happened; `absent` signs never render. Optional for
   * the same standalone reasons as `ghostReveals`.
   */
  nightSigns?: NightSign[];
  /**
   * Stations with recent ledger activity as of the scrub night (B.1 caveat:
   * the generated islands' Pixi lamps were event-driven, the hero SVG had
   * none). Each active station hangs a small night lamp at its anchor.
   * Omitted (offline / no ledger) → no lamps, identical to the old look.
   */
  activeStations?: ReadonlySet<StationKind>;
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

function Resident({ r, i, lang }: { r: ResidentPlacement; i: number; lang: 'zh' | 'en' }): JSX.Element {
  return (
    <ResidentFigure
      key={i}
      x={r.x}
      y={r.y}
      kind={r.kind}
      aiRole={r.aiRole}
      flip={r.flip}
      caption={r.caption?.[lang]}
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
export function Scene({ night, nightT, selKey, transTo, onStation, ghostReveals, nightSigns, activeStations }: SceneProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';
  const sel = selKey ? STN.find((s) => s.k === selKey) : undefined;
  const transPos = transTo ? TRANS_TAG_POS[transTo] : undefined;
  const ghosts = ghostReveals ?? DEFAULT_GHOST_REVEALS;
  const signs = nightSigns ?? DEFAULT_NIGHT_SIGNS;
  const signOn = (type: NightSignType): boolean =>
    signs.some((s) => s.type === type && nightT >= s.threshold);

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
            {t('scene.transplantTag')}
          </text>
        </g>
      )}

      {/* 居民 */}
      {!night && DAY_RESIDENTS.map((r, i) => <Resident key={`d${i}`} r={r} i={i} lang={lang} />)}
      {!night && (
        <g transform="translate(956,600)" style={{ animation: 'breathe 4s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }}>
          <rect x="-48" y="-11" width="96" height="21" rx="10" fill="var(--card,rgba(250,245,232,0.94))" stroke="var(--gold,#E3A93C)" strokeWidth="1" />
          <text x="0" y="4" textAnchor="middle" fontSize="9.5" fill="var(--gold2,#8A6A1E)" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
            {t('scene.encounter')}
          </text>
        </g>
      )}
      {night && <Resident r={NIGHT_RESIDENT} i={99} lang={lang} />}
      {CONSTANT_RESIDENTS.map((r, i) => <Resident key={`c${i}`} r={r} i={i} lang={lang} />)}

      {/* 夜晚层：灯笼 / 值夜光 / 争论标签 / 萤火虫 / 魂影 */}
      {night && (
        <g>
          {HANGING_LANTERNS.map((l, i) => (
            <HangingLantern key={i} x={l.x} y={l.y} size={l.size} swaySeconds={l.sway} />
          ))}
          <Fireflies />
          {/* 各站夜哨灯 — 该站在此夜（截至 scrub 夜）有真实账本活动才点亮
              （B.1：生成岛 Pixi 灯早已事件驱动，英雄岛此前缺位）。 */}
          {activeStations && STN.filter((s) => activeStations.has(s.k)).map((s) => (
            <g key={`lamp-${s.k}`} data-lamp={s.k} transform={`translate(${s.x},${s.y - 26})`}>
              <circle r="16" fill="url(#lgrad)" />
              <circle r="2.4" fill="#F5B94B" style={{ animation: 'pulseGlow 3s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }} />
            </g>
          ))}
          {signOn('argument') && (
            <g transform="translate(980,332)">
              <rect x="-58" y="-10" width="116" height="18" rx="9" fill="rgba(33,44,78,0.9)" stroke="rgba(245,185,75,0.5)" strokeWidth="0.75" />
              <text x="0" y="3" textAnchor="middle" fontSize="10" fill="#F5B94B" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
                {t('scene.nightArgument')}
              </text>
            </g>
          )}
          {/* AI 值夜窗光（文献阁）— 与值夜标签同一触发事件，一起点亮 */}
          {signOn('aiNightWatch') && (
            <g transform="translate(760,296)">
              <g transform="skewY(26.565)">
                <rect x="-84" y="-22" width="14" height="13" fill="#F5B94B" opacity="0.85" />
                <rect x="-62" y="-22" width="14" height="13" fill="#F5B94B" opacity="0.55" />
              </g>
              <circle cx="-58" cy="6" r="28" fill="url(#lgrad)" />
            </g>
          )}
          {signOn('aiNightWatch') && (
            <g transform="translate(760,178)">
              <rect x="-84" y="-11" width="168" height="21" rx="10" fill="rgba(33,44,78,0.92)" stroke="rgba(245,185,75,0.5)" strokeWidth="0.75" />
              <circle cx="-70" cy="-0.5" r="3" fill="#F5B94B" style={{ animation: 'pulseGlow 2.6s ease-in-out infinite', animationPlayState: 'var(--play,running)' as never }} />
              <text x="6" y="3.5" textAnchor="middle" fontSize="10" fill="#F5B94B" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
                {t('scene.aiNightWatch')}
              </text>
            </g>
          )}
          {signOn('synthesizerDraft') && (
            <g transform="translate(560,268)">
              <rect x="-74" y="-11" width="148" height="21" rx="10" fill="rgba(33,44,78,0.92)" stroke="rgba(245,185,75,0.5)" strokeWidth="0.75" />
              <circle cx="-60" cy="-0.5" r="3" fill="#F5B94B" style={{ animation: 'pulseGlow 3.2s ease-in-out infinite .8s', animationPlayState: 'var(--play,running)' as never }} />
              <text x="6" y="3.5" textAnchor="middle" fontSize="10" fill="#F5B94B" style={{ fontFamily: "'PingFang SC',sans-serif" }}>
                {t('scene.synthesizerDraft')}
              </text>
            </g>
          )}
          {/* 魂影三件，按时间轴阈值渐显 — 阈值来自真账本（见 scene/nightReveal.ts），
              离线/无数据时回落到 seed 常量（GHOSTS，与旧行为一致）。 */}
          {ghosts.map((g) => (
            <GhostArtifact key={g.type} type={g.type} opacity={nightT >= g.threshold ? 0.85 : 0} />
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

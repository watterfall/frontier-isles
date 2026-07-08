/**
 * SeaLayer — the v2 sea plane wired into the L0 chart (depth-plan-v2 §3/§4),
 * drawn BENEATH the island layer over the REAL projected ledger. Composes
 * ClimateField (domain hue) ∘ SeaDepth (abstractness, null-safe) ∘ the signed
 * currents (layoutCurrents → <Current>) ∘ whirlpool vortices ∘ FlowLegend.
 *
 * Focus is SALIENCE, not PRESENCE: nothing is ever removed. A focus dims
 * non-touching currents to a floor (never 0) and lifts touching ones; a dispute
 * (contest current / whirlpool) keeps a HIGHER floor than an affirm so its sign
 * head (tee / ⊗) stays resolvable even when dimmed. Day/night is palette-only via
 * NIGHT_SCENE_VARS on the layer root — geometry is identical.
 */
import {
  ClimateField,
  SeaDepth,
  Current,
  CurrentDefs,
  FlowLegend,
  NIGHT_SCENE_VARS,
  sceneVarsToStyle,
  type CurrentKindName,
  type CurrentSignName,
} from '@frontier-isles/assets';
import { layoutCurrents, seaDepthAt, type Vec2 } from '@frontier-isles/renderer';
import type { ApiCurrent, ApiWhirlpool, ApiSeaIsland } from '../../api/client';

/**
 * Salience treatment (design-system/22 · "floor + desaturate context"). Floors are
 * HARD minimums — a dispute (contest current / whirlpool) gets TWO escapes from the
 * recede: a much higher opacity floor AND retained saturation, so it can never fade
 * to unreadable. Support = affirm/bridge/lineage; dispute = contest / whirlpool.
 */
export const SALIENCE = {
  focused: 1.0,
  focusedWhirlpool: 1.0,
  restSupport: 0.85, // no focus active
  restContest: 0.9,
  restWhirlpool: 0.9,
  // dimmed floors — the real Claude Design product converged here (focusDim ~0.14,
  // contestFloor ~0.55–0.58). Named + overridable via props, never magic in JSX.
  floorSupport: 0.14, // focus active, not touched (== the product's focusDim)
  floorContest: 0.58, // ~4× the support floor — a dispute stays readable
  floorWhirlpool: 0.62, // above the contest floor
} as const;

/** Dimmed-floor overrides (the product's LIVE-tweakable params). */
export interface SalienceFloors {
  support: number;
  contest: number;
  whirlpool: number;
}
export const DEFAULT_FLOORS: SalienceFloors = {
  support: SALIENCE.floorSupport,
  contest: SALIENCE.floorContest,
  whirlpool: SALIENCE.floorWhirlpool,
};

const isSupport = (sign: string) => sign !== 'contest';

/** Salience opacity for a current given the focused island (null = no focus). */
export function currentSalience(
  c: Pick<ApiCurrent, 'from' | 'to' | 'sign'>,
  focus: string | null,
  floors: SalienceFloors = DEFAULT_FLOORS,
): number {
  if (!focus) return isSupport(c.sign) ? SALIENCE.restSupport : SALIENCE.restContest;
  if (c.from === focus || c.to === focus) return SALIENCE.focused;
  return isSupport(c.sign) ? floors.support : floors.contest;
}

/** Salience opacity for a whirlpool given the focused island. */
export function whirlpoolSalience(
  w: Pick<ApiWhirlpool, 'between'>,
  focus: string | null,
  floors: SalienceFloors = DEFAULT_FLOORS,
): number {
  if (!focus) return SALIENCE.restWhirlpool;
  if (w.between[0] === focus || w.between[1] === focus) return SALIENCE.focusedWhirlpool;
  return floors.whirlpool;
}

/**
 * Own-kind hue for a current's focus glow (no new token). Each carries a hex
 * FALLBACK — a bare `var(--x)` can fail to resolve through a `<use>`/attribute
 * boundary in some engines (the black-render gotcha the design product hit).
 */
const KIND_HUE: Record<string, string> = {
  evidence: 'var(--fi-azurite, #2E5E8C)',
  bridge: 'var(--fi-ochre, #B5673A)',
  lineage: 'var(--fi-malachite, #3E9B7E)',
};

/**
 * CSS filter for a current: focused → own-hue drop-shadow glow; a dimmed SUPPORT
 * current → desaturate (variant B) so disputes retain colour while context recedes;
 * contest/whirlpool are NEVER desaturated. On engines without CSS drop-shadow, a
 * duplicated blurred underlay stroke would substitute (SVG-in-browser has it).
 */
export function currentFilter(c: Pick<ApiCurrent, 'sign' | 'kind'>, focused: boolean, dimmed: boolean): string | undefined {
  if (focused) {
    const hue = KIND_HUE[c.kind] ?? KIND_HUE.evidence;
    return `drop-shadow(0 0 2px ${hue}) drop-shadow(0 0 4.5px ${hue})`;
  }
  if (dimmed && isSupport(c.sign)) return 'saturate(.15)';
  return undefined;
}

export interface SeaLayerProps {
  currents: ApiCurrent[];
  whirlpools: ApiWhirlpool[];
  islands: ApiSeaIsland[];
  focusedIslandId: string | null;
  night?: boolean;
  width?: number;
  height?: number;
  // ── LIVE-tweakable params (mirrors the Claude Design product's exposed knobs) ──
  /** Dimmed floor for a non-focused CONTEST current (dispute readability). */
  contestFloor?: number;
  /** Dimmed floor for a non-focused SUPPORT current (== the product's focusDim). */
  focusDim?: number;
  /** Drift the currents (T2). Default static (T1). */
  animateCurrents?: boolean;
  /** Show the sea-depth (abstractness) layer. */
  showDepth?: boolean;
}

export function SeaLayer({
  currents,
  whirlpools,
  islands,
  focusedIslandId,
  night = false,
  width = 1440,
  height = 900,
  contestFloor = SALIENCE.floorContest,
  focusDim = SALIENCE.floorSupport,
  animateCurrents = false,
  showDepth = true,
}: SeaLayerProps) {
  const floors: SalienceFloors = { support: focusDim, contest: contestFloor, whirlpool: SALIENCE.floorWhirlpool };
  const positions = new Map<string, Vec2>(islands.map((i) => [i.op, [i.chart.x, i.chart.y]]));
  const paths = layoutCurrents(currents, positions);

  return (
    <g data-fi="sea-layer" style={night ? sceneVarsToStyle(NIGHT_SCENE_VARS) : undefined}>
      <CurrentDefs />

      {/* domain hue field — a gentle tint over the chart paper (not opaque) */}
      <g opacity={0.5}>
        <ClimateField width={width} height={height} id="chart-climate" />
      </g>

      {/* abstractness depth — only islands with a substrate score darken (toggleable) */}
      {showDepth && (
        <SeaDepth
          width={width}
          height={height}
          wells={islands.flatMap((i) => {
            const { overlayAlpha } = seaDepthAt(i.substrate);
            return overlayAlpha > 0 ? [{ cx: i.chart.x, cy: i.chart.y + 8, r: 54, value: overlayAlpha }] : [];
          })}
        />
      )}

      {/* currents — salience opacity + glow/desaturate per current; nothing removed (parity) */}
      {paths.map((p, idx) => {
        const c = p.current as unknown as ApiCurrent;
        const focused = focusedIslandId != null && (c.from === focusedIslandId || c.to === focusedIslandId);
        const dimmed = focusedIslandId != null && !focused;
        return (
          <g
            key={`c${idx}`}
            style={{ opacity: currentSalience(c, focusedIslandId, floors), filter: currentFilter(c, focused, dimmed), transition: 'opacity .35s ease, filter .35s ease' }}
          >
            <Current
              d={p.d}
              kind={c.kind as CurrentKindName}
              sign={c.sign as CurrentSignName}
              weight={c.weight}
              directed={c.directed}
              maturity={c.maturity}
              animated={animateCurrents}
            />
          </g>
        );
      })}

      {/* whirlpool vortices — sited between the two disputing islands */}
      {whirlpools.map((w, idx) => {
        const a = positions.get(w.between[0]);
        const b = positions.get(w.between[1]);
        if (!a || !b) return null;
        const cx = (a[0] + b[0]) / 2;
        const cy = (a[1] + b[1]) / 2;
        return (
          <g key={`w${idx}`} data-fi="whirlpool" style={{ opacity: whirlpoolSalience(w, focusedIslandId, floors), transition: 'opacity .35s ease' }} fill="none" stroke="var(--fi-gamboge, #E3A93C)">
            <circle cx={cx} cy={cy} r={18} strokeWidth={1.6} strokeDasharray="3 4" />
            <circle cx={cx} cy={cy} r={10} strokeWidth={1.2} strokeDasharray="2 4" />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="13" fill="var(--fi-gamboge, #E3A93C)" stroke="none">⊗</text>
          </g>
        );
      })}

      <FlowLegend x={width - 214} y={height - 150} />
    </g>
  );
}

/**
 * 洋流 Current (flowline) — one relation as a stream (depth-plan-v2 §3).
 *
 * Three orthogonal, deuteranope-safe channels, none of them colour-only:
 *   · KIND     → colour + DASH (evidence dotted · bridge solid · lineage dashed).
 *                Dash encodes kind ONLY — maturity is off the dash axis now.
 *   · SIGN     → HEAD SHAPE (affirm = arrowhead "→" supports · contest = an
 *                inhibition tee "⊣" disputes, the biology activation/inhibition
 *                convention). affirm and contest are the SAME azurite hue but
 *                opposite shapes, so "supports" vs "disputes" reads without colour.
 *   · MATURITY → OPACITY (proposed bridge = faint strait · ratified = solid).
 *                No longer overloads dash, so it can't collide with the kind dash.
 * Motion (T2) reuses the existing `waveDrift` keyframe + `--play` toggle and the
 * global `prefers-reduced-motion` kill switch; T1 ships static (animated=false).
 */

export type CurrentKindName = 'evidence' | 'bridge' | 'lineage';
export type CurrentSignName = 'affirm' | 'contest' | 'neutral';

/**
 * Per-kind visual language, shared with <FlowLegend>. `dash` is the deuteranope
 * KIND channel (kind only — never touched by maturity or sign).
 */
export const CURRENT_STYLE: Record<
  CurrentKindName,
  { token: string; fallback: string; dash: string; label: string }
> = {
  evidence: { token: '--fi-azurite', fallback: '#2E5E8C', dash: '1 5', label: '证据 · evidence' },
  bridge: { token: '--fi-ochre', fallback: '#B5673A', dash: '', label: '桥 · bridge' },
  lineage: { token: '--fi-malachite', fallback: '#3E9B7E', dash: '7 5', label: '世系 · lineage' },
};

/** Stroke width from relation weight (clamped so a heavy trunk stays legible). */
export function currentWidth(weight: number): number {
  return Math.min(7, 1.4 + weight * 0.9);
}

/**
 * The end-marker for a current = its SIGN's head shape (not its colour):
 *   affirm  → filled arrowhead  (supports / points into the claim)
 *   contest → inhibition tee    (disputes / a bar across the flow)
 *   neutral → the kind's plain head (open chevron for lineage; none for bridge).
 * Undirected currents (bridges) carry no head.
 */
export function currentMarker(kind: CurrentKindName, sign: CurrentSignName, directed: boolean): string | null {
  if (!directed) return null;
  if (sign === 'affirm') return 'fi-arrow-affirm';
  if (sign === 'contest') return 'fi-tee-contest';
  return kind === 'lineage' ? 'fi-arrow-open' : null;
}

/**
 * Current markers, mounted once per <svg> (like SceneDefs). `context-stroke` makes
 * every head inherit its flowline's colour, so one marker set serves every hue.
 */
export function CurrentDefs() {
  return (
    <defs>
      {/* affirm — filled arrowhead ("supports") */}
      <marker id="fi-arrow-affirm" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
        <path d="M0 0 L6 3 L0 6 Z" fill="context-stroke" />
      </marker>
      {/* contest — inhibition tee ("disputes"): a bar across the flow, no arrow */}
      <marker id="fi-tee-contest" markerWidth="7" markerHeight="8" refX="5.5" refY="4" orient="auto">
        <path d="M5 0 L5 8" fill="none" stroke="context-stroke" strokeWidth="1.6" />
      </marker>
      {/* lineage — open chevron */}
      <marker id="fi-arrow-open" markerWidth="8" markerHeight="8" refX="6" refY="3.2" orient="auto">
        <path d="M0.6 0.6 L6.4 3.2 L0.6 5.8" fill="none" stroke="context-stroke" strokeWidth="1.2" />
      </marker>
    </defs>
  );
}

export interface CurrentProps {
  /** Flowline path from renderer `layoutCurrents`, e.g. `"M 150 150 Q … 420 130"`. */
  d: string;
  kind: CurrentKindName;
  /** Epistemic sign — chooses the head shape (invariant 8). */
  sign?: CurrentSignName;
  weight: number;
  directed?: boolean;
  /** Bridge-only strait/isthmus split; renders as opacity, never dash. */
  maturity?: 'proposed' | 'ratified';
  /** T2 drift; default static per T1 acceptance. */
  animated?: boolean;
}

export function Current({ d, kind, sign = 'neutral', weight, directed = false, maturity, animated = false }: CurrentProps) {
  const style = CURRENT_STYLE[kind];
  const proposed = maturity === 'proposed';
  const stroke = `var(${style.token}, ${style.fallback})`;
  const marker = currentMarker(kind, sign, directed);

  // dash encodes KIND only; maturity lives on the opacity axis (no collision).
  const dash = style.dash;
  const width = proposed
    ? currentWidth(weight) * 0.7
    : kind === 'bridge'
      ? Math.max(2.5, currentWidth(weight))
      : currentWidth(weight);

  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dash || undefined}
      opacity={proposed ? 0.5 : 0.85}
      markerEnd={marker ? `url(#${marker})` : undefined}
      style={
        animated
          ? { animation: 'waveDrift 6s ease-in-out infinite', animationPlayState: 'var(--play, running)' as never }
          : undefined
      }
    />
  );
}

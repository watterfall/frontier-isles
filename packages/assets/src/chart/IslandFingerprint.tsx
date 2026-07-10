import type { Domain } from '../palettes';
import { islandSilhouettePath, STAGE_RADIUS } from './islandSilhouette';
import { Lighthouse } from './Lighthouse';

export interface IslandFingerprintProps {
  domain: Domain;
  /** Growth stage 0..3 — drives footprint size and building/vegetation
   * density upstream (ChartScreen's `Buildings`); here it also grows a
   * second terrace on top of the mound at stage 3 (school). */
  stage: 0 | 1 | 2 | 3;
  /** Stable per-island seed — pass `hashSeed(slug ?? String(id))` so the
   * same island always renders the same coastline (invariant 13). */
  seed: number;
  fill: string;
  /** `status === 'resolved'` — flies a small lighthouse (depth-plan-v1 §5). */
  lighthouse?: boolean;
}

/**
 * The L0 "terrain fingerprint" body: a domain-grammar, stage-sized coastline
 * (`islandSilhouettePath`) plus the two data-bound embellishments the spec
 * calls out — a second terrace for school-stage islands, and a lighthouse
 * for resolved ones. Composes into `ChartScreen`'s existing water-ring /
 * shadow / hover-lift wrapper; this component owns only the landmass +
 * lighthouse geometry so no SVG path literals live in ChartScreen itself.
 */
export function IslandFingerprint({ domain, stage, seed, fill, lighthouse = false }: IslandFingerprintProps) {
  const basePath = islandSilhouettePath({ domain, stage, seed });
  const hasCap = stage === 3;
  const capPath = hasCap ? islandSilhouettePath({ domain, stage, seed, tier: 'cap' }) : null;
  const capOffsetY = -STAGE_RADIUS[3] * 0.5;
  const topY = hasCap
    ? capOffsetY - STAGE_RADIUS[1] * 0.36 * 0.6 - 6
    : -STAGE_RADIUS[stage] * 0.36 - 6;

  return (
    <g>
      <path d={basePath} fill={fill} stroke="#4A4238" strokeWidth="1.5" />
      {capPath && (
        <g transform={`translate(0,${capOffsetY}) scale(0.6)`}>
          <path d={capPath} fill={fill} stroke="#4A4238" strokeWidth="1.3" opacity={0.96} />
        </g>
      )}
      {lighthouse && <Lighthouse x={STAGE_RADIUS[stage] * 0.3} y={topY} scale={0.85} />}
    </g>
  );
}

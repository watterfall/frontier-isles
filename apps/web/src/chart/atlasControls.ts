import type { AtlasMetrics } from '@frontier-isles/renderer/pixi';

export type AtlasDomainFilter = '数理' | '物质' | '生命' | '交叉' | null;
export type AtlasAltitudeFilter = 'low' | 'middle' | 'high' | null;

export interface AtlasControls {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  enter: (slug: string) => void;
  focusDomain: (domain: AtlasDomainFilter) => void;
  focusAltitude: (band: AtlasAltitudeFilter) => void;
  /** Sail back to My Harbor (depth-plan-v1 §3(d)). Safe no-op without a
   * harbor; the chrome shows its button only when one exists. Optional so
   * older control providers (the `?atlas=pixi` demo host) stay valid. */
  home?: () => void;
}

export type { AtlasMetrics };

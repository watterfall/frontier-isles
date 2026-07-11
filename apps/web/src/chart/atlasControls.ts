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
}

export type { AtlasMetrics };

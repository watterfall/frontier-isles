/**
 * AtlasChartScreen — the DEFAULT L0 (atlas-world-plan.md §4 lane W1). Promotes
 * the semantic-zoom Pixi atlas (`AtlasStage`, previously only reachable behind
 * `?atlas=pixi`) to the path every visitor hits with NO query flag: a
 * continuous world→region→isle camera instead of the flat ~30-island SVG
 * scatter. Drop-in for `ChartScreen` — same `ChartScreenProps`, same chrome
 * (`ChartChrome`/`IslandCard`, both extracted so neither screen can drift from
 * the other), same `onIsland`/`onBuild`/`onCollide` wiring into `App.tsx`'s
 * existing sail→wipe→L1 flow.
 *
 * Fallback discipline (CLAUDE.md + architecture §7): the app must render with
 * no GPU present. `hasWebGL()` is a synchronous, pixi-import-free precheck —
 * when it fails (or the lazy Pixi engine throws after all), this renders the
 * ORIGINAL `ChartScreen` (SVG) untouched, byte-for-byte. PixiJS itself is
 * loaded only via `React.lazy(() => import('../../chart/AtlasChartHost'))`,
 * mirroring the L1 GeneratedIslandScreen → PixiScene lazy-load discipline
 * (commit "perf(web): lazy-load PixiScene") — the main bundle never regains it.
 *
 * TODO(W5 — wayfinding/continuity, atlas-world-plan.md §4): a tap here calls
 * the SAME `onIsland` the flat SVG chart used, so it flows into App.tsx's
 * existing ferry-sail → ScrollWipe → L1 transition unchanged — continuous in
 * the sense that the same animation plays, but the atlas camera itself does
 * NOT yet hand off into that sail (no shared camera state / cross-fade from
 * the Pixi zoom into the sail's start position). Full camera-continuity
 * (T0→T2 atlas zoom bleeding into the T2→T3 sail) is W5's scope, not W1's.
 */
import { lazy, Suspense, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChartScreen, type ChartScreenProps } from './ChartScreen';
import { ChartChrome } from './ChartChrome';
import { IslandCard } from './IslandCard';
import { computeCardContent, cardBoxPos } from './cardContent';
import { hasWebGL } from '../../chart/webgl';
import type { IslandDatum } from '../../api/fallback';

const AtlasChartHost = lazy(() => import('../../chart/AtlasChartHost'));

export function AtlasChartScreen(props: ChartScreenProps) {
  const { islands, hover, onHover, onIsland, onBuild, onCollide } = props;
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'zh';

  // Sync WebGL precheck — no pixi import, so an unsupported browser never even
  // requests the atlas chunk. `onWebglError` (below) covers the rarer case
  // where WebGL reports present but Pixi still fails to boot.
  const [noGpu, setNoGpu] = useState<boolean>(() => !hasWebGL());
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const handleHoverIsland = useCallback(
    (d: IslandDatum | null, pos: { x: number; y: number } | null) => {
      onHover(d ? d.id : null);
      setHoverPos(pos);
    },
    [onHover],
  );

  const handleWebglError = useCallback(() => setNoGpu(true), []);

  if (noGpu) return <ChartScreen {...props} />;

  const hd = hover != null ? islands.find((d) => d.id === hover) ?? null : null;
  const card = hd && hoverPos ? { content: computeCardContent(hd, lang, t), ...cardBoxPos(hoverPos.x, hoverPos.y) } : null;

  return (
    <div data-screen-label="L0 图集海图" style={{ position: 'absolute', inset: 0, background: '#F2EAD8' }}>
      {/* Suspense fallback={null} (not <ChartScreen/>) — same convention as
          GeneratedIslandScreen's PixiScene: a brief blank paper background
          while the small atlas chunk loads, never a double chrome. */}
      <Suspense fallback={null}>
        <AtlasChartHost islands={islands} onPick={onIsland} onHoverIsland={handleHoverIsland} onWebglError={handleWebglError} />
      </Suspense>

      <ChartChrome onBuild={onBuild} onCollide={onCollide} />

      {card && <IslandCard content={card.content} left={card.left} top={card.top} />}
    </div>
  );
}

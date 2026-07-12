import { useEffect, useState } from 'react';

/** Compact breakpoint (DECISIONS.md #10): viewport width < 900 renders the
 *  read-only mobile shell (artboard 3b). Below 900 the fixed 1440×900 desktop
 *  stage would scale under ~60% and stop being legible, so the shell only
 *  appears where it can actually carry the atlas; everything narrower gets
 *  the browse companion instead. */
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(() => (typeof window === 'undefined' ? false : window.innerWidth < 900));
  useEffect(() => {
    const on = () => setMobile(window.innerWidth < 900);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return mobile;
}

/** Uniform scale that fits the fixed 1440×900 stage into the viewport.
 *
 * The old shell reserved 110 vertical pixels for chrome that now lives over
 * the atlas. On a laptop that shrank the actual world to barely half of the
 * screen. Keep a quiet 16px paper margin instead: the atlas is the product,
 * not a preview floating inside the product. */
export function useStageScale(): number {
  const compute = () =>
    typeof window === 'undefined' ? 1 : Math.min(1, (window.innerWidth - 24) / 1440, (window.innerHeight - 24) / 900);
  const [scale, setScale] = useState(compute);
  useEffect(() => {
    const on = () => setScale(compute());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return scale;
}

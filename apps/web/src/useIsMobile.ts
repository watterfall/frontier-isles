import { useEffect, useState } from 'react';

/** Compact breakpoint (DECISIONS.md #10): viewport width < 900 renders the
 *  read-only mobile shell (artboard 3b). Below 900 the desktop instrument
 *  rail and research panel cannot both sit beside a legible map, so the
 *  shell only appears where it can actually carry the atlas; everything
 *  narrower gets the browse companion instead. */
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(() => (typeof window === 'undefined' ? false : window.innerWidth < 900));
  useEffect(() => {
    const on = () => setMobile(window.innerWidth < 900);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return mobile;
}

/* The desktop stage used to be a fixed 1440×900 artboard scaled by
 * `min(1, (vw-24)/1440, (vh-24)/900)`. Two things were wrong with that:
 *
 * 1. The scale was capped at 1, so above 1440×924 the artboard stopped
 *    growing and simply floated in dead paper — a measured 240px left/right
 *    and 90px top/bottom at 1920×1080, i.e. the world owned 62.5% of the
 *    screen before the research panel took its share.
 * 2. It put the chart chrome in *artboard* coordinates while the newer
 *    research panel, world trail and model card are `position: fixed` in
 *    *viewport* coordinates. Two coordinate systems drifting apart with
 *    viewport size is why the instruments collided by a different amount at
 *    every width and no amount of pixel tuning ever settled it.
 *
 * The stage is now fluid (see `.fi-stage` in global.css) and everything
 * shares one coordinate system, so the HUD layout contract there can hold. */

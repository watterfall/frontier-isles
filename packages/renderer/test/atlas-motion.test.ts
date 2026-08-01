import { gsap } from 'gsap';
import { afterEach, describe, expect, it } from 'vitest';

// Importing the module is the point: it configures the ticker for the whole
// atlas. Nothing here inspects the director's own API.
import '../src/pixi/atlas-motion';

/**
 * An authored duration is a wall-clock promise. GSAP's default lag smoothing
 * clamps any frame slower than 500ms to a 33ms advance, which turns a duration
 * into a frame count: the 0.83s dock timeline needed 26 frames, so at CI's
 * software-GL frame rate it ran for 27.5s and the island screen never arrived
 * inside the reader's (or the e2e's) patience. `atlas-motion` disables lag
 * smoothing; this pins that, because the setting is global, invisible, and
 * exactly the kind of line a later refactor drops without noticing.
 */
describe('atlas motion timing', () => {
  afterEach(() => {
    gsap.ticker.fps(60);
  });

  it('finishes an authored timeline in its authored time, not in 26 slow frames', async () => {
    // One frame per second reproduces the starved renderer: every delta lands
    // far past GSAP's 500ms lag threshold.
    gsap.ticker.fps(1);
    const target = { x: 0 };
    const started = Date.now();
    await new Promise<void>((resolve) => {
      gsap.timeline({ onComplete: () => resolve() }).to(target, { duration: 0.83, x: 100 }, 0);
    });
    const elapsed = Date.now() - started;

    expect(target.x).toBe(100);
    // Lag-smoothed, this same timeline costs 26 frames — 26s at this frame
    // rate. Advancing by real time, one or two frames carry it.
    expect(elapsed).toBeLessThan(4_000);
  });
});

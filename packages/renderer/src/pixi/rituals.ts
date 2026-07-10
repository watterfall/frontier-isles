/**
 * Ritual moments — Batch 1 (depth-plan-v1 §6/§9): 河灯 River lantern on
 * `publish`, 移栽之路 Transplant walk (~8s) on `transplant`. Pure PixiJS, no
 * React and no ledger knowledge: the host (`apps/web/src/scene/PixiScene.tsx`)
 * decides WHICH ledger events are due (see `apps/web/src/scene/rituals.ts`'s
 * `dueRituals` + a localStorage watermark) and where the island's shore/dock
 * sits; this module only knows how to animate ONE already-decided ritual.
 *
 * Invariant 17 discipline: every `fire*()` call is one ledger event → one
 * transient node that removes itself when its animation ends. Nothing here
 * accumulates a counter, streak, or persistent decoration — a ritual that
 * finishes leaves the scene exactly as it was before it fired. Day/night
 * stays palette-only (architecture §1): the lantern's glow warms at night,
 * its shape never changes.
 *
 * No changes to `scene-stage.ts` were needed: {@link SceneStage.cameraRoot}
 * and `.app` are already public, so the host mounts a `RitualLayer` as a
 * sibling on top of the existing camera-space stack (above the tone overlay,
 * unlike `lightsLayer` which collapses to alpha 0 in daylight — a
 * daytime `publish` must still show its lantern).
 */
import { Container, Graphics, type Application, type Ticker } from 'pixi.js';

/** A world/camera-space point (same coordinate space as {@link SceneStage.cameraRoot}). */
export interface RitualPoint {
  x: number;
  y: number;
}

export interface RitualFireOptions {
  /** The underlying ledger event's id — carried only for caller-side logging;
   * this layer does no dedupe itself (the host's `firedRitualIdsRef` already
   * guarantees once-per-event before `fire*` is ever called). */
  id: string;
  /** Where the ritual departs from — the island's dock/shore, in camera-space. */
  at: RitualPoint;
  /** Unit vector pointing OUT to open sea (away from the island centre). */
  direction: RitualPoint;
  /** `prefers-reduced-motion`: degrade travel to a quiet in-place fade —
   * still visible, still tappable, just never animates a multi-second
   * journey (spec §6③: "reduced-motion collapses ritual to a quiet state
   * change" — never zero feedback). */
  reducedMotion?: boolean;
  /** Tapping the node while it's alive → open the underlying ledger event
   * (spec §6③: "click the lantern/mote → the underlying event and artifact"). */
  onTap?: () => void;
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
/** easeOutCubic — motion settles rather than stopping dead (hand-drawn feel,
 * matches the halo-breathe / ghost-bob easing already used in scene-stage.ts). */
const easeOut = (v: number): number => 1 - Math.pow(1 - v, 3);

// ── Palette: reused verbatim from scene-stage.ts's existing hues (claim-tower
// halo 0xe3a93c, night window-lights 0xffe6b0, ink 0x3a342b, wall 0xf8f1de,
// gold 0xb98a2e) — no new colours invented, per the hand-drawn-atlas
// convention the rest of the Pixi scene already establishes. ──────────────
const LANTERN_BODY = 0xf6c66b;
const LANTERN_GLOW = 0xffe6b0;
const LANTERN_INK = 0x8a5a1e;
const CARRIER_HULL = 0xf8f1de; // verbatim --wall
const CARRIER_SAIL = 0xb98a2e; // verbatim --gold
const INK = 0x3a342b; // verbatim --ink

/** A small paper river-lantern: warm body + soft halo + a taut hanging string. */
function drawLantern(g: Graphics, night: boolean): void {
  const glowAlpha = night ? 0.55 : 0.3; // palette-only night brightening (§1)
  g.circle(0, 0, 15).fill({ color: LANTERN_GLOW, alpha: glowAlpha });
  g.roundRect(-6, -8, 12, 14, 4).fill({ color: LANTERN_BODY }).stroke({ color: LANTERN_INK, width: 1.2 });
  g.moveTo(-6, -3).lineTo(6, -3).stroke({ color: LANTERN_INK, width: 0.8, alpha: 0.6 });
  g.moveTo(-6, 2).lineTo(6, 2).stroke({ color: LANTERN_INK, width: 0.8, alpha: 0.6 });
  g.moveTo(0, -8).lineTo(0, -13).stroke({ color: LANTERN_INK, width: 1 });
}

/** A small hand-drawn hull carrying the transplanted idea across the bridge
 * (spec allows "小人/小船/光点均可" — a boat reads clearly at L1 scale and
 * matches the nautical-chart vocabulary already used for the ferry dock). */
function drawCarrier(g: Graphics): void {
  g.poly([-9, 3, 9, 3, 6, 8, -6, 8]).fill({ color: CARRIER_HULL }).stroke({ color: INK, width: 1.3 });
  g.moveTo(0, 3).lineTo(0, -10).stroke({ color: INK, width: 1 });
  g.poly([0, -10, 8, -1, 0, -1]).fill({ color: CARRIER_SAIL, alpha: 0.92 }).stroke({ color: INK, width: 1 });
}

interface ActiveRitual {
  node: Container;
  elapsedMs: number;
  durationMs: number;
  step: (elapsedMs: number) => void;
  onDone: () => void;
}

/** Per-ritual motion shape: how far it travels, how long it lasts, how it bobs. */
interface RitualMotion {
  durationMs: number;
  travel: number;
  bobAmp: number;
  bobFreq: number;
}

/**
 * A thin, self-ticking container for in-flight ritual animations. One per
 * mounted {@link SceneStage} (created/destroyed alongside it by the host).
 */
export class RitualLayer {
  readonly container = new Container();
  private readonly app: Application;
  private active: ActiveRitual[] = [];
  private ticking = false;

  constructor(app: Application, parent: Container) {
    this.app = app;
    this.container.label = 'rituals';
    parent.addChild(this.container);
  }

  /** 河灯 — floats out from the shore, bobbing on the swell, then dissolves. */
  fireLantern(opts: RitualFireOptions, night = false): void {
    const g = new Graphics();
    drawLantern(g, night);
    this.spawn(g, opts, opts.reducedMotion
      ? { durationMs: 3200, travel: 0, bobAmp: 2, bobFreq: 2 }
      : { durationMs: 4600, travel: 130, bobAmp: 5, bobFreq: 3.2 });
  }

  /** 移栽之路 — a carrier sails the ~8s crossing out through the dock. */
  fireTransplant(opts: RitualFireOptions): void {
    const g = new Graphics();
    drawCarrier(g);
    this.spawn(g, opts, opts.reducedMotion
      ? { durationMs: 3200, travel: 0, bobAmp: 1.5, bobFreq: 2 }
      : { durationMs: 8000, travel: 260, bobAmp: 3, bobFreq: 6 });
  }

  private spawn(art: Graphics, opts: RitualFireOptions, motion: RitualMotion): void {
    const node = new Container();
    node.addChild(art);
    node.x = opts.at.x;
    node.y = opts.at.y;
    node.alpha = 0;
    if (opts.onTap) {
      node.eventMode = 'static';
      node.cursor = 'pointer';
      node.on('pointertap', opts.onTap);
    }
    this.container.addChild(node);

    // Perpendicular to travel, for the hand-drawn side-to-side sway/bob.
    const perp = { x: -opts.direction.y, y: opts.direction.x };
    const fadeInMs = Math.min(400, motion.durationMs * 0.15);
    const fadeOutMs = Math.min(500, motion.durationMs * 0.2);

    const step = (elapsedMs: number): void => {
      const progress = clamp01(elapsedMs / motion.durationMs);
      const dist = motion.travel * easeOut(progress);
      const sway = Math.sin(elapsedMs * 0.001 * motion.bobFreq) * motion.bobAmp;
      node.x = opts.at.x + opts.direction.x * dist + perp.x * sway;
      node.y = opts.at.y + opts.direction.y * dist + perp.y * sway;
      let alpha = elapsedMs < fadeInMs ? elapsedMs / fadeInMs : 1;
      const remaining = motion.durationMs - elapsedMs;
      if (remaining < fadeOutMs) alpha = Math.min(alpha, clamp01(remaining / fadeOutMs));
      node.alpha = clamp01(alpha);
    };

    this.active.push({
      node,
      elapsedMs: 0,
      durationMs: motion.durationMs,
      step,
      onDone: () => {
        node.parent?.removeChild(node);
        node.destroy({ children: true });
      },
    });
    this.ensureTicker();
  }

  private ensureTicker(): void {
    if (this.ticking) return;
    this.app.ticker.add(this.tick);
    // init() uses autoStart:false; resume the render loop, same pattern as
    // scene-stage.ts's tickSea/tickDynamics. Idempotent if the sea/M5 tickers
    // already started it — this layer never depends on that ordering.
    this.app.start();
    this.ticking = true;
  }

  private tick = (ticker: Ticker): void => {
    if (this.active.length === 0) {
      this.app.ticker.remove(this.tick);
      this.ticking = false;
      return;
    }
    const dtMs = ticker.deltaMS;
    const next: ActiveRitual[] = [];
    for (const r of this.active) {
      r.elapsedMs += dtMs;
      if (r.elapsedMs >= r.durationMs) {
        r.onDone();
      } else {
        r.step(r.elapsedMs);
        next.push(r);
      }
    }
    this.active = next;
  };

  /** Tear down every in-flight ritual node and stop the ticker. */
  destroy(): void {
    if (this.ticking) {
      this.app.ticker.remove(this.tick);
      this.ticking = false;
    }
    for (const r of this.active) r.onDone();
    this.active = [];
    this.container.parent?.removeChild(this.container);
    this.container.destroy({ children: true });
  }
}

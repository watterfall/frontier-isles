import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import type { Container } from 'pixi.js';

// PixiPlugin is deliberately confined to finite, named transitions. Continuous
// steering remains owned by the world runtime, so two animation clocks never
// fight over the vessel or camera transforms.
gsap.registerPlugin(PixiPlugin);

/** Register only constructors already imported by the stage's Pixi chunk. */
export function registerAtlasMotionPixi(pixi: Parameters<typeof PixiPlugin.registerPIXI>[0]): void {
  PixiPlugin.registerPIXI(pixi);
}

export interface AtlasMotionCameraTarget {
  x: number;
  y: number;
  scale: number;
}

export interface AtlasDockTarget extends AtlasMotionCameraTarget {
  vesselX: number;
  vesselY: number;
  vesselRotation: number;
}

interface TransitionOptions {
  world: Container;
  vessel: Container;
  camera: AtlasMotionCameraTarget;
  reducedMotion: boolean;
}

interface DockOptions extends TransitionOptions {
  dock: AtlasDockTarget;
}

interface SurveyOptions {
  marker: Container;
  signal?: Container;
  reducedMotion: boolean;
}

/**
 * One interruptible timeline authority for the atlas. It choreographs the few
 * moments that need authored time (depart, return, dock); ordinary movement is
 * intentionally absent from this class.
 */
export class AtlasMotionDirector {
  private timeline: gsap.core.Timeline | null = null;

  constructor(private readonly onFrame: (reflow: boolean) => void) {}

  get active(): boolean {
    return this.timeline?.isActive() ?? false;
  }

  cancel(): void {
    this.timeline?.kill();
    this.timeline = null;
  }

  enter({ world, vessel, camera, reducedMotion }: TransitionOptions): Promise<void> {
    this.cancel();
    if (reducedMotion) {
      world.x = camera.x;
      world.y = camera.y;
      world.scale.set(camera.scale);
      vessel.alpha = 1;
      vessel.scale.set(1);
      this.onFrame(true);
      return Promise.resolve();
    }

    vessel.alpha = 0;
    vessel.scale.set(0.82);
    return new Promise((resolve) => {
      // kill() fires onInterrupt, never onComplete — without both, cancel()
      // strands the awaited promise forever (same contract as survey below).
      let finished = false;
      const complete = () => {
        if (finished) return;
        finished = true;
        this.timeline = null;
        this.onFrame(true);
        resolve();
      };
      this.timeline = gsap.timeline({
        defaults: { overwrite: 'auto' },
        onUpdate: () => this.onFrame(false),
        onComplete: complete,
        onInterrupt: complete,
      });
      this.timeline
        .to(world, { duration: 0.78, pixi: camera, ease: 'expo.out' }, 0)
        .to(vessel, { duration: 0.46, pixi: { alpha: 1, scale: 1 }, ease: 'quart.out' }, 0.14);
    });
  }

  leave({ world, vessel, camera, reducedMotion }: TransitionOptions): Promise<void> {
    this.cancel();
    if (reducedMotion) {
      world.x = camera.x;
      world.y = camera.y;
      world.scale.set(camera.scale);
      vessel.alpha = 0;
      this.onFrame(true);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let finished = false;
      const complete = () => {
        if (finished) return;
        finished = true;
        this.timeline = null;
        this.onFrame(true);
        resolve();
      };
      this.timeline = gsap.timeline({
        defaults: { overwrite: 'auto' },
        onUpdate: () => this.onFrame(false),
        onComplete: complete,
        onInterrupt: complete,
      });
      this.timeline
        .to(vessel, { duration: 0.22, pixi: { alpha: 0, scale: 0.88 }, ease: 'power2.in' }, 0)
        .to(world, { duration: 0.72, pixi: camera, ease: 'expo.out' }, 0.06);
    });
  }

  dock({ world, vessel, dock, reducedMotion }: DockOptions): Promise<void> {
    this.cancel();
    if (reducedMotion) {
      vessel.x = dock.vesselX;
      vessel.y = dock.vesselY;
      vessel.rotation = dock.vesselRotation;
      world.x = dock.x;
      world.y = dock.y;
      world.scale.set(dock.scale);
      this.onFrame(true);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const startX = vessel.x;
      const startY = vessel.y;
      const dx = dock.vesselX - startX;
      const dy = dock.vesselY - startY;
      const length = Math.max(1, Math.hypot(dx, dy));
      // A shallow berth arc keeps the final approach spatially legible. It is
      // derived only from the real start/end geometry, so the animation adds no
      // fictional route and still lands on the exact shared optical axis.
      const arc = Math.min(42, length * 0.16);
      const midX = startX + dx * 0.58 - (dy / length) * arc;
      const midY = startY + dy * 0.58 + (dx / length) * arc * 0.62;
      let finished = false;
      const complete = () => {
        if (finished) return;
        finished = true;
        this.timeline = null;
        this.onFrame(true);
        resolve();
      };
      this.timeline = gsap.timeline({
        defaults: { overwrite: 'auto' },
        onUpdate: () => this.onFrame(false),
        onComplete: complete,
        onInterrupt: complete,
      });
      this.timeline
        .to(vessel, {
          duration: 0.42,
          pixi: { x: midX, y: midY, rotation: dock.vesselRotation - 0.08 },
          ease: 'power2.inOut',
        }, 0)
        .to(vessel, {
          duration: 0.38,
          pixi: { x: dock.vesselX, y: dock.vesselY, rotation: dock.vesselRotation },
          ease: 'power3.out',
        }, 0.38)
        .to(world, { duration: 0.82, pixi: { x: dock.x, y: dock.y, scale: dock.scale }, ease: 'power3.inOut' }, 0)
        .to(vessel, { duration: 0.18, pixi: { scale: 0.92 }, ease: 'power2.out' }, 0.65);
    });
  }

  /** A finite field-reading beat: the target mark resolves, then becomes still. */
  survey({ marker, signal, reducedMotion }: SurveyOptions): Promise<void> {
    this.cancel();
    if (reducedMotion) {
      marker.alpha = 1;
      marker.scale.set(1);
      if (signal) signal.alpha = 1;
      this.onFrame(true);
      return Promise.resolve();
    }

    marker.alpha = Math.max(0.48, marker.alpha);
    marker.scale.set(0.86);
    return new Promise((resolve) => {
      let finished = false;
      const complete = () => {
        if (finished) return;
        finished = true;
        this.timeline = null;
        this.onFrame(true);
        resolve();
      };
      this.timeline = gsap.timeline({
        defaults: { overwrite: 'auto' },
        onUpdate: () => this.onFrame(false),
        onComplete: complete,
        onInterrupt: complete,
      });
      this.timeline
        .to(marker, { duration: 0.34, pixi: { alpha: 1, scale: 1.08 }, ease: 'expo.out' }, 0)
        .to(marker, { duration: 0.2, pixi: { scale: 1 }, ease: 'power2.out' }, 0.34);
      if (signal) {
        this.timeline
          .to(signal, { duration: 0.2, pixi: { alpha: 1, rotation: signal.rotation + 0.16 }, ease: 'power2.out' }, 0.04)
          .to(signal, { duration: 0.24, pixi: { rotation: signal.rotation }, ease: 'power2.inOut' }, 0.24);
      }
    });
  }
}

/**
 * SVG → Pixi texture baker — the load-bearing step of the "texture-lift"
 * strategy (advisory memo): the hand-drawn `@frontier-isles/assets` SVG
 * components are pure flat-fill + ink-stroke (0 gradients, 0 filters), so they
 * rasterise losslessly into textures the {@link SceneStage} can wear via its
 * `TextureResolver` — reproducing the illustrated look inside Pixi instead of
 * rebuilding it as programmer-art primitives.
 *
 * Baked at `scale`× for crispness above 1:1; the sprite scales back down in the
 * scene. Pure browser DOM (Blob + Image + canvas) — no GPU work here.
 */
import { Texture } from 'pixi.js';

export interface BakeOpts {
  /** SVG user-unit width (must match the wrapper <svg width/viewBox>). */
  width: number;
  /** SVG user-unit height. */
  height: number;
  /** Supersample factor for crisp edges (default 3×). */
  scale?: number;
}

/** Rasterise a standalone SVG string into a Pixi {@link Texture}. */
export function bakeSvg(svg: string, opts: BakeOpts): Promise<Texture> {
  const scale = opts.scale ?? 3;
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(opts.width * scale));
        canvas.height = Math.max(1, Math.round(opts.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('2d context unavailable');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(Texture.from(canvas));
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG rasterise failed'));
    };
    img.src = url;
  });
}

/**
 * @frontier-isles/renderer — package root.
 *
 * Re-exports ONLY the headless halves (iso math, scene model, chunking/picking).
 * Importing this entry never touches WebGL, so the React SVG scene, the server,
 * and tests can depend on it freely (DECISIONS item 3: SVG now, Pixi at scale).
 *
 * The PixiJS 8 engine lives behind a separate entry point — import it from
 * `@frontier-isles/renderer/pixi` only where a GPU context is actually wanted.
 */

export * from './iso';
export * from './scene';
export * from './chunks';

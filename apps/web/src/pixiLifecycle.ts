/**
 * Pixi 8's canvas-text textures share a process-global pool. React StrictMode
 * can overlap two asynchronous Application.init() calls; destroying the stale
 * application then clears that pool underneath the live one. Keep WebGL app
 * lifetimes exclusive so an old renderer is fully released before its
 * replacement starts allocating shared text resources.
 */
let lifecycleTail: Promise<void> = Promise.resolve();

export async function acquirePixiLifecycle(): Promise<() => void> {
  const previous = lifecycleTail.catch(() => {});
  let finish!: () => void;
  const current = new Promise<void>((resolve) => { finish = resolve; });
  lifecycleTail = previous.then(() => current);
  await previous;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    finish();
  };
}

/**
 * The one teardown ordering for a Pixi stage: destroy first, release the
 * lifecycle slot ALWAYS (even when destroy throws) — otherwise the next
 * acquirePixiLifecycle() waits forever. Returns null so call sites can clear
 * their `releasePixi` local in the same expression:
 * `releasePixi = disposePixiStage(stage, releasePixi);`
 * Pass a null stage to release the slot without destroying anything.
 */
export function disposePixiStage(
  stage: { destroy: () => void } | null | undefined,
  release: (() => void) | null,
): null {
  try {
    stage?.destroy();
  } finally {
    release?.();
  }
  return null;
}

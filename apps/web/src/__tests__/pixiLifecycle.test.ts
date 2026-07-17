import { describe, expect, it } from 'vitest';
import { acquirePixiLifecycle } from '../pixiLifecycle';

describe('Pixi lifecycle lease', () => {
  it('does not let a replacement initialize before the active app releases', async () => {
    const releaseFirst = await acquirePixiLifecycle();
    let secondAcquired = false;
    const second = acquirePixiLifecycle().then((release) => {
      secondAcquired = true;
      return release;
    });

    await Promise.resolve();
    expect(secondAcquired).toBe(false);

    releaseFirst();
    releaseFirst();
    const releaseSecond = await second;
    expect(secondAcquired).toBe(true);
    releaseSecond();
  });
});

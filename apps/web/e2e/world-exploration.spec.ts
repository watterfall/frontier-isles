import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

type ExplorerPose = {
  x: number;
  y: number;
  altitudeZ: number;
};

type ExplorerTarget = ExplorerPose & {
  slug: string;
  horizontalDistance: number;
  altitudeDelta: number;
};

type AtlasDebugStage = {
  explorerPose: ExplorerPose | null;
  nearbyExplorerIslands: (pose: ExplorerPose, limit: number) => ExplorerTarget[];
  dockExplorer: (slug: string, pose: ExplorerPose, reducedMotion?: boolean) => Promise<ExplorerPose>;
};

type AtlasDebugWindow = typeof window & {
  __atlas?: AtlasDebugStage;
  __lastDockPose?: ExplorerPose;
};

async function explorerReading(page: Page, targetSlug?: string): Promise<{ pose: ExplorerPose; target: ExplorerTarget }> {
  return page.evaluate((slug) => {
    const stage = (window as AtlasDebugWindow).__atlas;
    const pose = stage?.explorerPose;
    const field = stage && pose ? stage.nearbyExplorerIslands(pose, 256) : [];
    const target = slug ? field.find((candidate) => candidate.slug === slug) : field[0];
    if (!pose || !target) throw new Error('Atlas exploration debug state is not ready');
    return { pose, target };
  }, targetSlug);
}

async function flyIntoSurveyRange(page: Page): Promise<{ pose: ExplorerPose; target: ExplorerTarget }> {
  await expect.poll(async () => {
    try {
      return (await explorerReading(page)).target.slug;
    } catch {
      return null;
    }
  }).not.toBeNull();

  const initial = await explorerReading(page);
  const targetSlug = initial.target.slug;

  // Deadline-based rather than a fixed step count: slow CI runners render few
  // frames per wall-clock second, and the world tick clamps dt at 50ms/frame,
  // so simulated time runs slower than the clock there. A fixed 36×240ms
  // budget converges locally but starves the (0.46/s max) altitude channel on
  // CI — size each hold to the remaining error instead.
  const deadline = Date.now() + 75_000;
  while (Date.now() < deadline) {
    const reading = await explorerReading(page, targetSlug);
    if (reading.target.horizontalDistance <= 150 && Math.abs(reading.target.altitudeDelta) <= 0.12) return reading;

    const dx = reading.target.x - reading.pose.x;
    const dy = reading.target.y - reading.pose.y;
    const keys: string[] = [];
    if (Math.abs(dx) > 12) keys.push(dx > 0 ? 'KeyD' : 'KeyA');
    if (Math.abs(dy) > 12) keys.push(dy > 0 ? 'KeyS' : 'KeyW');
    const altitudeKey = Math.abs(reading.target.altitudeDelta) > 0.06;
    if (altitudeKey) keys.push(reading.target.altitudeDelta > 0 ? 'KeyR' : 'KeyF');

    const horizontalHold = reading.target.horizontalDistance > 260 ? 520 : 240;
    const altitudeHold = Math.min(1400, Math.round(Math.abs(reading.target.altitudeDelta) * 2600) + 200);
    const hold = Math.max(horizontalHold, altitudeKey ? altitudeHold : 0);

    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(hold);
    for (const key of keys.reverse()) await page.keyboard.up(key);
    await page.waitForTimeout(100);
  }

  const final = await explorerReading(page, targetSlug);
  throw new Error(
    `Could not reach ${targetSlug}: horizontal=${final.target.horizontalDistance.toFixed(1)}, altitude=${final.target.altitudeDelta.toFixed(3)}`,
  );
}

test('continuous world exploration survives an island round trip', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await page.goto('/');
  await expect(page.locator('[data-screen-label="L0 图集海图"]')).toBeVisible();
  await page.getByRole('button', { name: /探索世界/ }).click();
  await expect(page.locator('[data-screen-label="L0.5 全局低空考察"]')).toBeVisible();

  await page.getByRole('button', { name: /问题罗盘/ }).click();
  const firstQuestion = page.locator('.fi-world-explore-journal-entry').first();
  await expect(firstQuestion).toBeVisible();
  await firstQuestion.click();
  await expect(page.getByRole('button', { name: '取消当前航向' })).toBeVisible();
  await page.getByRole('button', { name: '取消当前航向' }).click();

  const inRange = await flyIntoSurveyRange(page);
  await expect(page.getByRole('button', { name: /调查/ })).toBeVisible();
  await page.getByRole('button', { name: /调查/ }).click();
  await expect(page.locator('.fi-world-explore-note')).toBeVisible();
  await expect(page.getByRole('button', { name: '靠岸进入此岛' })).toBeVisible();
  const personalObservation = '继续追踪这个问题与邻岛之间尚未解释的边界。';
  await page.getByRole('textbox', { name: '个人观察' }).fill(personalObservation);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('frontier-isles:field-notebook:v1'))).toContain(personalObservation);

  await page.getByRole('button', { name: /问题罗盘/ }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /导出考察札记/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^frontier-isles-field-notebook-\d{4}-\d{2}-\d{2}\.md$/);
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  expect(await readFile(downloadPath!, 'utf8')).toContain(personalObservation);
  await page.getByRole('button', { name: /问题罗盘/ }).click();

  const beforeDock = await explorerReading(page, inRange.target.slug);
  expect(beforeDock.target.horizontalDistance).toBeLessThanOrEqual(168);
  expect(Math.abs(beforeDock.target.altitudeDelta)).toBeLessThanOrEqual(0.16);
  await page.evaluate(() => {
    const debugWindow = window as AtlasDebugWindow;
    const stage = debugWindow.__atlas;
    if (!stage) throw new Error('Atlas exploration debug state is not ready');
    const dockExplorer = stage.dockExplorer.bind(stage);
    stage.dockExplorer = async (...args) => {
      const pose = await dockExplorer(...args);
      debugWindow.__lastDockPose = pose;
      return pose;
    };
  });
  await page.getByRole('button', { name: '靠岸进入此岛' }).click();
  await expect(page.locator('[data-screen-label^="L1"]')).toBeVisible();
  await page.getByRole('button', { name: /返回考察舟/ }).click();
  await expect(page.locator('[data-screen-label="L0.5 全局低空考察"]')).toBeVisible();

  await expect.poll(async () => {
    try {
      return !!(await explorerReading(page, inRange.target.slug)).pose;
    } catch {
      return false;
    }
  }).toBe(true);

  const poseAfterReturn = (await explorerReading(page, inRange.target.slug)).pose;
  const dockPose = await page.evaluate(() => (window as AtlasDebugWindow).__lastDockPose ?? null);
  expect(dockPose).not.toBeNull();
  // The world resumes at the berth, then its first physics tick may project
  // the craft to the island's 104-unit safety radius before this read lands.
  expect(Math.hypot(poseAfterReturn.x - dockPose!.x, poseAfterReturn.y - dockPose!.y)).toBeLessThan(36);
  expect(poseAfterReturn.altitudeZ).toBeCloseTo(dockPose!.altitudeZ, 2);

  // The first field tick may move the craft from the animated berth to the
  // island's physical safety radius. Reload must restore the durable, settled
  // position that was actually written, rather than the pre-settle dock pose.
  await expect.poll(async () => {
    const live = (await explorerReading(page, inRange.target.slug)).pose;
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('frontier-isles:field-notebook:v1');
      if (!raw) return null;
      return (JSON.parse(raw) as { worldPose?: { x: number; y: number } }).worldPose ?? null;
    });
    return stored ? Math.hypot(live.x - stored.x, live.y - stored.y) : Number.POSITIVE_INFINITY;
  }).toBeLessThan(0.5);
  const persistedPose = await page.evaluate(() => {
    const raw = localStorage.getItem('frontier-isles:field-notebook:v1');
    if (!raw) return null;
    return (JSON.parse(raw) as { worldPose?: ExplorerPose }).worldPose ?? null;
  });
  expect(persistedPose).not.toBeNull();

  await page.reload();
  await expect(page.locator('[data-screen-label="L0 图集海图"]')).toBeVisible();
  await page.getByRole('button', { name: /探索世界/ }).click();
  await expect(page.locator('[data-screen-label="L0.5 全局低空考察"]')).toBeVisible();
  await expect.poll(async () => {
    try {
      return (await explorerReading(page, inRange.target.slug)).pose.x;
    } catch {
      return null;
    }
  }).toBeCloseTo(persistedPose!.x, 0);
  const restoredPose = (await explorerReading(page, inRange.target.slug)).pose;
  expect(restoredPose.y).toBeCloseTo(persistedPose!.y, 0);
  expect(restoredPose.altitudeZ).toBeCloseTo(persistedPose!.altitudeZ, 2);
  await page.getByRole('button', { name: /问题罗盘/ }).click();
  await expect(page.getByText(/1 岛 · 0 流 · 1 航向/)).toBeVisible();
  await page.locator('.fi-world-explore-visited-log .fi-world-explore-journal-entry').first().click();
  await expect(page.getByRole('textbox', { name: '个人观察' })).toHaveValue(personalObservation);
  expect(browserErrors).toEqual([]);
});

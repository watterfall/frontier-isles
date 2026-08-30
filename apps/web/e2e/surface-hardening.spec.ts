import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

// Reduced motion is opted into per test, never suite-wide. `page.emulateMedia`
// genuinely takes effect (the project-level `use.reducedMotion` did not), so a
// blanket beforeEach silently switches off every animated branch this app
// ships — View Transitions, the 420ms camera flight, the `transition` overrides
// — leaving the default experience with no browser coverage at all.
async function useReducedMotion(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

async function openAtlas(page: Page) {
  await page.goto('/');
  await expect(page.locator('[data-screen-label="L0 图集海图"]')).toBeVisible();
}

async function expectNoHorizontalOverflow(page: Page) {
  const report = await page.evaluate(() => ({
    delta: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    offenders: [...document.querySelectorAll<HTMLElement>('body *')].flatMap((element) => {
      const box = element.getBoundingClientRect();
      return box.right > innerWidth + 1 || box.left < -1 || element.scrollWidth > element.clientWidth + 1
        ? [{ tag: element.tagName.toLowerCase(), className: element.className || '', left: Math.round(box.left), right: Math.round(box.right), width: Math.round(box.width), clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }]
        : [];
    }).slice(0, 8),
  }));
  expect(report.delta, JSON.stringify(report.offenders, null, 2)).toBeLessThanOrEqual(1);
}

async function expectVisibleTargetsAtLeast(locator: Locator, minimum: number) {
  const result = await locator.evaluateAll((elements, min) => {
    const visible = elements.filter((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && box.width > 0 && box.height > 0;
    });
    const undersized = visible.flatMap((element) => {
      const box = element.getBoundingClientRect();
      if (box.width >= min && box.height >= min) return [];
      return [{
        tag: element.tagName.toLowerCase(),
        className: element.getAttribute('class') ?? '',
        text: (element.getAttribute('aria-label') ?? element.textContent ?? '').trim().slice(0, 60),
        width: Number(box.width.toFixed(1)),
        height: Number(box.height.toFixed(1)),
      }];
    });
    return { count: visible.length, undersized };
  }, minimum);

  expect(result.count, 'expected at least one visible interactive target').toBeGreaterThan(0);
  expect(result.undersized, `targets below ${minimum}×${minimum}px`).toEqual([]);
}

async function expectWcagAA(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
}

interface BrowserExperienceMetric {
  name: 'l0-atlas-ready' | 'l1-island-ready';
  durationMs: number;
  budgetMs: number;
  withinBudget: boolean;
  context: Record<string, string>;
}

/** Readiness of the real Pixi atlas: slow locally, far slower on a shared
 *  CI runner under software rendering. */
const atlasReadyTimeout = process.env.CI ? 60_000 : 20_000;

async function experienceMetrics(page: Page): Promise<BrowserExperienceMetric[]> {
  return page.evaluate(() => [...(window.__FI_EXPERIENCE_METRICS__ ?? [])]) as Promise<BrowserExperienceMetric[]>;
}

test.describe('desktop atlas surface', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('has no horizontal overflow, exposes focus, and passes axe AA', async ({ page }) => {
    await openAtlas(page);
    await expectNoHorizontalOverflow(page);

    const focusTarget = page.locator('.fi-atlas-edge-tools button').first();
    await focusTarget.focus();
    const focusStyle = await focusTarget.evaluate((element) => {
      const style = getComputedStyle(element);
      return { width: Number.parseFloat(style.outlineWidth), style: style.outlineStyle };
    });
    expect(focusStyle.style).not.toBe('none');
    expect(focusStyle.width).toBeGreaterThanOrEqual(2);

    await expectWcagAA(page);
  });
});

test.describe('desktop L0 → L1 experience', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('publishes bounded readiness metrics and carries shared chrome into night mode', async ({ page }) => {
    await useReducedMotion(page);
    await page.route('**/api/islands/compositional-modeling', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 180));
      await route.continue();
    });
    await page.goto('/#island=compositional-modeling');
    expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
    await expect(page.locator('[data-screen-label="L1 生成岛"]')).toBeVisible({ timeout: 15_000 });

    // A cold shared link renders the island directly and never mounts the atlas
    // renderer, so only the L1 interval may be published here. Asserting an
    // `l0-atlas-ready` on this route would certify a renderer that never existed.
    await expect.poll(
      async () => (await experienceMetrics(page)).map((metric) => metric.name),
      { timeout: 15_000 },
    ).toEqual(['l1-island-ready']);
    const metrics = await experienceMetrics(page);
    for (const metric of metrics) {
      expect(metric.durationMs, `${metric.name} duration`).toBeGreaterThan(0);
      expect(metric.durationMs, `${metric.name} budget`).toBeLessThanOrEqual(metric.budgetMs);
      expect(metric.withinBudget).toBe(true);
    }
    expect(metrics[0]?.context).toMatchObject({ slug: 'compositional-modeling' });

    const dayChrome = await page.locator('.fi-lang-toggle').evaluate((element) => {
      const style = getComputedStyle(element);
      return { background: style.backgroundColor, color: style.color };
    });
    await page.locator('.fi-day-night-lever').click();
    await expect(page.locator('.fi-app-shell')).toHaveAttribute('data-theme', 'night');
    const nightChrome = await page.locator('.fi-lang-toggle').evaluate((element) => {
      const style = getComputedStyle(element);
      return { background: style.backgroundColor, color: style.color };
    });
    expect(nightChrome.background).not.toBe(dayChrome.background);
    expect(nightChrome.color).not.toBe(dayChrome.color);
    await expectNoHorizontalOverflow(page);

    // Every shell pill is one control row: same height, whatever it contains.
    // The session badge nests a button inside a pill, and a nested 44px hit
    // target grows the flex line unless its overhang is derived from the pill's
    // own border + padding — which is easy to get 2px wrong by eye and has no
    // other guard. SessionBadge defers its /api/me probe, so wait for the pill.
    const sessionPill = page.locator('.fi-session-badge, .fi-session-login').first();
    await expect(sessionPill).toBeVisible({ timeout: 20_000 });
    const pillBoxes = await page.evaluate(() => {
      const height = (selector: string) => {
        const element = document.querySelector(selector);
        return element ? Math.round(element.getBoundingClientRect().height * 10) / 10 : null;
      };
      const logout = document.querySelector('.fi-session-logout')?.getBoundingClientRect();
      return {
        lang: height('.fi-lang-toggle'),
        session: height('.fi-session-badge') ?? height('.fi-session-login'),
        logout: logout ? { w: Math.round(logout.width), h: Math.round(logout.height) } : null,
      };
    });
    expect(pillBoxes.session, JSON.stringify(pillBoxes)).toBe(pillBoxes.lang);
    if (pillBoxes.logout) {
      expect(pillBoxes.logout.h, 'logout hit height').toBeGreaterThanOrEqual(44);
      expect(pillBoxes.logout.w, 'logout hit width').toBeGreaterThanOrEqual(44);
    }

    const chromeAudit = await new AxeBuilder({ page })
      .include('.fi-global-controls')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(chromeAudit.violations, JSON.stringify(chromeAudit.violations, null, 2)).toEqual([]);
  });

  test('runs a bounded A2 model inquiry and exposes its non-ledger trace', async ({ page }) => {
    await useReducedMotion(page);
    await openAtlas(page);

    const launch = page.locator('[data-model-launch="global"]');
    await expect(launch).toBeVisible({ timeout: 15_000 });
    await launch.click();

    const workbench = page.locator('.fi-model-workbench');
    await expect(workbench).toBeVisible({ timeout: 15_000 });
    await page.locator('.fi-app-shell').evaluate((element) => element.setAttribute('data-theme', 'night'));
    await expect(page.locator('.fi-app-shell')).toHaveAttribute('data-theme', 'night');
    const mission = workbench.locator('.fi-model-mission');
    await mission.locator(':scope > summary').click();
    await expect(mission).toHaveAttribute('open', '');
    await expect(mission).toContainText('A2 · 计划—运行—判断—修订');
    await expect(mission).toContainText('0 次网络请求');
    await expect(mission).toContainText('0 次共享写入');

    await mission.getByRole('button', { name: '授权并运行这次受限调查' }).click();
    await expect(mission).toHaveAttribute('data-phase', 'complete', { timeout: 15_000 });
    await expect(mission.locator('.fi-model-mission-trials > ol > li')).toHaveCount(3);
    await expect(mission.locator('.fi-model-mission-trials em[data-reached="true"]')).toHaveCount(1);
    await expect(mission.locator('.fi-model-mission-result')).toContainText('计划修订');
    await expect(mission.locator('.fi-model-mission-result')).toContainText('全部一致');
    await expect(mission).toContainText('不会自动写入研究账本');

    await mission.locator('.fi-model-mission-trace > summary').click();
    expect(await mission.locator('.fi-model-mission-trace li').count()).toBeGreaterThanOrEqual(9);
    await expectNoHorizontalOverflow(page);
    const audit = await new AxeBuilder({ page })
      .include('.fi-model-mission')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(audit.violations, JSON.stringify(audit.violations, null, 2)).toEqual([]);

    await mission.getByRole('button', { name: '清除本次轨迹' }).click();
    await expect(mission).toHaveAttribute('data-phase', 'idle');
    await expect(mission.locator('.fi-model-mission-trials')).toHaveCount(0);

    // Clearing the live trace discards the in-page run, not the notebook record.
    const history = mission.locator('.fi-model-mission-history');
    await expect(history).toBeVisible();
    await expect(history.locator('ol > li')).toHaveCount(1);
    await expect(history).toContainText('达到目标');

    // The record is evidence only after it survives a real reload.
    await page.reload();
    await openAtlas(page);
    const relaunch = page.locator('[data-model-launch="global"]');
    await expect(relaunch).toBeVisible({ timeout: 15_000 });
    await relaunch.click();
    const reopened = page.locator('.fi-model-workbench .fi-model-mission');
    await expect(reopened).toBeVisible({ timeout: 15_000 });
    await reopened.locator(':scope > summary').click();
    await expect(reopened).toHaveAttribute('data-phase', 'idle');
    await expect(reopened.locator('.fi-model-mission-history ol > li')).toHaveCount(1);
    await expect(reopened).toContainText('存入本浏览器的考察札记');
    // Surviving a reload must not promote it past a local model observation.
    await expect(reopened).toContainText('不会自动写入研究账本');
    await expectNoHorizontalOverflow(page);
  });

  // Runs at DEFAULT motion on purpose: this is the only browser coverage of the
  // animated voyage — `runVoyageTransition`'s startViewTransition branch, its
  // 700ms readiness race, the ownership-guarded cleanup of `data-fi-voyage`,
  // and the 420ms camera flight that ends in `onArrived`.
  test('completes an animated atlas → island voyage and cleans up its transition', async ({ page }) => {
    await openAtlas(page);
    expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(false);

    // Drive the atlas only once its renderer is ready. During boot the live
    // roster reconciles and rebuilds AtlasStage, which cancels an in-flight
    // camera motion — a search entered in that window can lose its `onArrived`
    // and never dock. `l0-atlas-ready` publishes exactly when the renderer is
    // up, so it is the correct gate to wait on rather than a fixed sleep.
    //
    // The wait scales with CI. This is the one route that mounts the real Pixi
    // atlas under software rendering (ROADMAP §6 Slice 24 records that it
    // legitimately overruns the 12s L0 budget there), and an explicit per-call
    // timeout overrides playwright.config.ts's CI expect budget — so a bare
    // 20_000 silently gave the slowest assertion in the suite LESS than the
    // 30_000 the config intends for CI. It passed until runners got slower,
    // then failed three attempts on a commit whose re-run went green.
    await expect
      .poll(async () => (await experienceMetrics(page)).map((metric) => metric.name), { timeout: atlasReadyTimeout })
      .toContain('l0-atlas-ready');

    const search = page.locator('.fi-chart-search input[role="combobox"]');
    await search.fill('组合');
    const firstResult = page.locator('#atlas-search-results button[role="option"]').first();
    await expect(firstResult).toBeVisible({ timeout: 15_000 });
    await firstResult.click();

    await expect(page.locator('[data-screen-label^="L1"]')).toBeVisible({ timeout: 15_000 });
    // The transition owns this flag for its lifetime and must hand it back.
    await expect
      .poll(async () => page.evaluate(() => document.documentElement.dataset.fiVoyage ?? null), { timeout: 15_000 })
      .toBeNull();
    // Names and ordering only — deliberately NOT `withinBudget`. This route
    // mounts the real Pixi atlas, which on CI runs under software rendering
    // (swiftshader) and legitimately exceeds the 12s L0 budget; that is a
    // property of the runner, not a regression. Budget enforcement belongs to
    // the reduced-motion metrics test above, whose intervals are deterministic.
    // (The previous suite appeared to assert the L0 budget and pass, but it was
    // timing a measure the cold deep link completed without mounting an atlas.)
    await expect
      .poll(async () => (await experienceMetrics(page)).map((metric) => metric.name), { timeout: 15_000 })
      .toEqual(['l0-atlas-ready', 'l1-island-ready']);
    await expectNoHorizontalOverflow(page);
  });

  test('carries one scientific narrative from atlas hierarchy into island survey and QFT focus', async ({ page }) => {
    await useReducedMotion(page);
    await openAtlas(page);
    const crossFieldDesk = page.locator('.fi-connection-expand');
    await expect(crossFieldDesk).toHaveAttribute('aria-expanded', 'false', { timeout: 15_000 });
    await expect(page.locator('.fi-connection-body')).toHaveCount(0);

    await page.goto('/#island=in-tissue-spatial-functional-genomics');
    await expect(page.locator('[data-screen-label="L1 生成岛"]')).toBeVisible({ timeout: 15_000 });
    const passage = page.locator('.fi-science-passage');
    await expect(passage).toHaveAttribute('aria-label', '科学航线：从研究信号到下一落点');
    await expect(passage.locator(':scope > section')).toHaveCount(4);
    await expect(passage.locator('[data-beat="signal"]')).toContainText('Perturb-FISH');
    await expect(passage.locator('[data-beat="question"]')).toContainText('能否在原位读出');
    await expect(passage.locator('[data-beat="evidence"]')).toContainText('Cell');
    const survey = passage.locator('[data-beat="next"] button');
    await expect(survey).toContainText('沿此线勘察');
    await survey.click();
    await expect(page.getByRole('button', { name: /02 生长对照区.*已勘察/ })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    let failFirstVote = true;
    await page.route('**/api/islands/machine-curiosity/events', async (route) => {
      const body = route.request().postDataJSON() as { payload?: { signal?: string } } | null;
      if (failFirstVote && body?.payload?.signal === 'vote') {
        failFirstVote = false;
        await route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"temporary"}' });
        return;
      }
      await route.continue();
    });
    await page.goto('/#island=machine-curiosity');
    await expect(page.locator('[data-screen-label="L1 样板岛"]')).toBeVisible({ timeout: 15_000 });
    const qftTrigger = page.locator('.fi-science-passage [data-beat="next"] button');
    await qftTrigger.click();
    const qft = page.locator('.fi-qft-panel');
    await expect(qft).toHaveAttribute('data-open', 'true');
    await expect(qft.locator('.fi-qft-process > li')).toHaveCount(3);
    await expect(qft.locator('.fi-qft-questions > li')).toHaveCount(7);
    await expect(page.locator('.fi-global-controls')).toBeHidden();
    await expect(page.locator('.fi-world-trail')).toBeHidden();
    await expectNoHorizontalOverflow(page);

    await expect(qft).toHaveCSS('transition-duration', '0s');
    const focusAction = qft.locator('.fi-qft-focus-action');
    await qft.getByRole('button', { name: /下方共 7 个候选问题/ }).click();
    await expect(focusAction).toBeInViewport();
    const rewrittenQuestion = '怎样用未见分布检验 AI 是否主动发现值得追问的意外？';
    const secondQuestion = qft.locator('.fi-qft-questions > li').nth(1);
    await secondQuestion.getByRole('button', { name: '改写此问' }).click();
    const rewriteBox = secondQuestion.getByRole('textbox', { name: '重写问题，使它更具体、可检验' });
    await rewriteBox.fill(' ');
    await secondQuestion.getByRole('button', { name: '保存为本页改写' }).click();
    await expect(secondQuestion.getByRole('alert')).toContainText('请先写下一个具体、可检验的问题');
    await expect(rewriteBox).toHaveAttribute('aria-invalid', 'true');
    await rewriteBox.fill(rewrittenQuestion);
    await secondQuestion.getByRole('button', { name: '保存为本页改写' }).click();
    await expect(secondQuestion).toContainText(rewrittenQuestion);
    // Saving unmounts the form together with the focused submit button; focus
    // must return to the control that opened it, or it drops to <body> and the
    // next Tab walks straight out of the modal.
    await expect(secondQuestion.getByRole('button', { name: '改写此问' })).toBeFocused();
    const recordStatus = qft.locator('.fi-qft-footer[role="status"]');
    await expect(qft.locator('.fi-qft-footer').filter({ hasText: '1 条本页工作笔记未写入账本' })).toBeVisible();

    await expect(qft.locator('.fi-qft-questions > li').nth(3).getByRole('button', { name: '投一票' })).toBeDisabled();
    const originalVotes = await secondQuestion.locator('.fi-qft-vote-count b').textContent();
    await secondQuestion.getByRole('button', { name: '投一票' }).click();
    await expect(recordStatus).toContainText('投票写入失败，票数已撤回');
    await expect(secondQuestion.locator('.fi-qft-vote-count b')).toHaveText(originalVotes ?? '');
    await expect(secondQuestion.getByRole('button', { name: '投一票' })).toBeEnabled();
    await recordStatus.getByRole('button', { name: '重试本次写入' }).click();
    await expect(recordStatus).toContainText('这次投票已写入 append-only 岛屿账本');
    await focusAction.click();
    await expect(qft.locator('.fi-qft-focus-banner')).toContainText(rewrittenQuestion);
    await expect(recordStatus).toContainText('这次聚焦已写入 append-only 岛屿账本');
    await expect(focusAction).toBeDisabled();

    const qftAudit = await new AxeBuilder({ page })
      .include('.fi-qft-panel')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(qftAudit.violations, JSON.stringify(qftAudit.violations, null, 2)).toEqual([]);

    // Escape belongs to the TOP dialog only. Station shortcut 8 opens the
    // driftwood modal over the still-open QFT scroll; one Escape may close the
    // modal and must leave the scroll open (a per-panel document listener used
    // to close every mounted panel at once).
    await page.keyboard.press('8');
    const driftwood = page.locator('#fi-drift-title');
    await expect(driftwood).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(driftwood).toHaveCount(0);
    await expect(qft).toHaveAttribute('data-open', 'true');

    await page.keyboard.press('Escape');
    await expect(qft).not.toHaveAttribute('data-open', 'true');
    await expect(qftTrigger).toBeFocused();
  });
});

test.describe('touch tablet atlas surface', () => {
  test.use({ viewport: { width: 1024, height: 768 }, hasTouch: true });

  test('keeps the full atlas without overflow and promotes critical controls to 44px', async ({ page }) => {
    await openAtlas(page);
    await expect(page.locator('.fi-atlas-edge-tools')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectVisibleTargetsAtLeast(
      page.locator('.fi-atlas-edge-tools button, .fi-atlas-edge-tools summary, .fi-connection-head button'),
      44,
    );
  });
});

test.describe('mobile companion surface', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('stays within the viewport with 44px controls and passes axe AA', async ({ page }) => {
    await page.goto('/#island=in-tissue-spatial-functional-genomics');
    await expect(page.locator('.fi-mobile-shell')).toBeVisible();
    await expect(page.locator('.fi-mobile-segments button').nth(2)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.fi-mobile-island-note h2')).toHaveText('原位空间功能基因组学：在完整组织里做 CRISPR 扰动＋空间读出');
    await expect(page).toHaveURL(/#island=in-tissue-spatial-functional-genomics$/);
    await expectNoHorizontalOverflow(page);
    const mobileControls = page.locator('.fi-mobile-shell button, .fi-mobile-shell summary, .fi-mobile-shell input, .fi-mobile-shell select, .fi-mobile-shell textarea');
    await expectVisibleTargetsAtLeast(mobileControls, 44);

    const mobilePassage = page.locator('.fi-mobile-island-note .fi-science-passage');
    await expect(mobilePassage.locator(':scope > section')).toHaveCount(4);
    // The mobile note is projected from atlas data with no ledger in scope, so
    // it points at the ledger instead of asserting an adjudication state.
    await expect(mobilePassage.locator('[data-beat="evidence"]')).toContainText('裁定状态以桌面端账本为准');
    await expect.poll(async () => Number.parseFloat(await mobilePassage.locator('[data-beat="signal"] p').evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(13);
    await mobilePassage.locator('[data-beat="next"] button').click();
    await expect(page.locator('.fi-mobile-segments button').first()).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.fi-mobile-connection-search input')).not.toHaveValue('');
    await expect(page.locator('.fi-mobile-connection-results button').first()).toBeVisible();

    await page.locator('.fi-mobile-segments button').nth(2).click();
    const search = page.locator('.fi-mobile-search input');
    await expect(search).toBeVisible();
    await search.fill('边界');
    await expect(page.locator('.fi-mobile-search button')).toBeVisible();
    await expectVisibleTargetsAtLeast(mobileControls, 44);

    await page.getByRole('button', { name: '模型', exact: true }).click();
    const mission = page.locator('.fi-model-workbench[data-embedded="true"] .fi-model-mission');
    await expect(mission).toBeVisible();
    await mission.locator(':scope > summary').click();
    await expect(mission).toHaveAttribute('open', '');
    await expect(mission).toContainText('A2 · 计划—运行—判断—修订');
    await expectNoHorizontalOverflow(page);
    await expectVisibleTargetsAtLeast(mission.locator('summary, button'), 44);

    // The compact surface writes to the same notebook, so the saved-inquiry
    // list has to fit the 390px shell rather than only the desktop sheet.
    await mission.getByRole('button', { name: '授权并运行这次受限调查' }).click();
    await expect(mission).toHaveAttribute('data-phase', 'complete', { timeout: 20_000 });
    await expect(mission.locator('.fi-model-mission-history ol > li')).toHaveCount(1);
    await expect(mission).toContainText('存入本浏览器的考察札记');
    await expect(mission).toContainText('不会自动写入研究账本');
    await expectNoHorizontalOverflow(page);
    await expectVisibleTargetsAtLeast(mission.locator('summary, button'), 44);

    await expectWcagAA(page);
  });
});

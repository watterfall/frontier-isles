import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

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
    await page.route('**/api/islands/compositional-modeling', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 180));
      await route.continue();
    });
    await page.goto('/#island=compositional-modeling');
    await expect(page.locator('[data-screen-label="L1 生成岛"]')).toBeVisible({ timeout: 15_000 });

    await expect.poll(
      async () => (await experienceMetrics(page)).map((metric) => metric.name),
      { timeout: 15_000 },
    ).toEqual(['l0-atlas-ready', 'l1-island-ready']);
    const metrics = await experienceMetrics(page);
    for (const metric of metrics) {
      expect(metric.durationMs, `${metric.name} duration`).toBeGreaterThan(0);
      expect(metric.durationMs, `${metric.name} budget`).toBeLessThanOrEqual(metric.budgetMs);
      expect(metric.withinBudget).toBe(true);
    }
    expect(metrics[1]?.context).toMatchObject({ slug: 'compositional-modeling' });

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

    const chromeAudit = await new AxeBuilder({ page })
      .include('.fi-global-controls')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(chromeAudit.violations, JSON.stringify(chromeAudit.violations, null, 2)).toEqual([]);
  });

  test('carries one scientific narrative from atlas hierarchy into island survey and QFT focus', async ({ page }) => {
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
    await page.emulateMedia({ reducedMotion: 'reduce' });
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
    await expect(mobilePassage.locator('[data-beat="evidence"]')).toContainText('尚未裁定支持或反驳');
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

    await expectWcagAA(page);
  });
});

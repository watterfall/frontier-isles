import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('preserves the atlas observation point and carries a private question between research rooms', async ({ page }) => {
  await page.emulateMedia({ reducedMotion:'reduce' });
  await page.goto('/');
  // Read readiness, restore and capture in one browser task: initial catalog
  // reconciliation can replace the renderer between separate evaluate calls.
  const before = await (await page.waitForFunction(() => {
    const atlas = (window as any).__atlas;
    if (!atlas?.cameraPose()) return null;
    atlas.restoreCamera({centerX:450,centerY:330,scale:.65});
    return atlas.cameraPose();
  })).jsonValue();
  await page.getByRole('combobox').fill('组合式科学建模');
  await page.locator('#atlas-search-results button').first().click();
  await expect(page.locator('.fi-island-screen[data-spatial]')).toBeVisible({timeout:30000});
  await page.getByRole('button',{name:'论据与测量',exact:true}).click();
  await page.locator('[data-station-row="library"]').click();
  await page.locator('[data-station-enter="library"]').click();
  const dialog=page.getByRole('dialog');
  await dialog.getByRole('tab').nth(1).click();
  await expect(dialog.getByRole('link').first()).toHaveAttribute('href', /^https?:/);
  await dialog.locator('.fi-building-note > summary').click();
  await dialog.getByRole('textbox',{name:'我的想法'}).fill('共享边界在另一领域对应什么？');
  await dialog.locator('.fi-building-onward button').filter({hasText:'白板厅'}).click();
  await expect(dialog).toHaveAttribute('data-station','canvas');
  if (!await dialog.locator('.fi-building-note').evaluate(element=>(element as HTMLDetailsElement).open)) await dialog.locator('.fi-building-note > summary').click();
  await expect(dialog.getByRole('textbox',{name:'我的想法'})).toHaveValue('共享边界在另一领域对应什么？');
  const axe=await new AxeBuilder({page}).include('.fi-building-interior').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(axe.violations).toEqual([]);
  await dialog.getByRole('button',{name:'回到岛上',exact:true}).click();
  await expect(page.locator('[data-station-enter="canvas"]')).toBeFocused();
  const map=page.locator('.fi-island-canvas');
  const box=(await map.boundingBox())!;
  await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  await expect(page.locator('.fi-station-arrival')).toContainText('白板厅');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  // A drag that starts on the same building must never open it.
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await page.mouse.down();await page.mouse.move(box.x+box.width/2+70,box.y+box.height/2+20,{steps:8});await page.mouse.up();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.locator('.fi-island-back').click();
  await expect(page.locator('[data-screen-label="L0 图集海图"]')).toBeVisible({timeout:30000});
  await expect.poll(async()=>page.evaluate(()=>(window as any).__atlas?.cameraPose()?.scale)).toBeCloseTo(before.scale,3);
  const after=await page.evaluate(()=>(window as any).__atlas.cameraPose());
  expect(after.centerX).toBeCloseTo(before.centerX,2); expect(after.centerY).toBeCloseTo(before.centerY,2);
});

test('lets a phone reader enter the same island and read accessible content rooms', async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.locator('.fi-mobile-nav button').nth(2).click();
  await page.locator('.fi-mobile-search input').fill('组合式科学建模');
  await page.locator('.fi-mobile-list > button').first().click();
  await expect(page.locator('.fi-island-screen')).toBeVisible({timeout:30000});
  await page.getByRole('button',{name:'论据与测量',exact:true}).click();
  await page.locator('[data-station-row="library"]').click();
  await page.locator('[data-station-enter="library"]').click();
  await page.getByRole('tab').nth(1).click();
  await expect(page.getByRole('tabpanel')).toContainText('Structured Cospans');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
  const axe=await new AxeBuilder({page}).include('.fi-building-interior').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(axe.violations).toEqual([]);
  await page.getByRole('button',{name:'回到岛上',exact:true}).click();
  await page.locator('.fi-island-back').click();
  await expect(page.locator('.fi-mobile-search input')).toHaveValue('组合式科学建模');
});

test('keeps nine navigable architectural addresses without WebGL', async ({page})=>{
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind:string,...args:any[]){if(/webgl/.test(kind))return null;return (original as any).call(this,kind,...args);} as any;});
  await page.goto('/#island=compositional-modeling');
  const map=page.locator('.fi-island-svg-fallback');
  await expect(map.locator('[role="button"]')).toHaveCount(9,{timeout:30000});
  const library=map.getByRole('button',{name:'文献阁',exact:true});
  await library.focus(); await page.keyboard.press('Enter');
  await expect(library).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.fi-station-arrival')).toContainText('文献阁');
  await page.locator('[data-station-enter="library"]').click();
  await expect(page.getByRole('dialog')).toContainText('文献阁');
});

test('unfolds a question, preserves existing thoughts, and carries it to its sources', async ({page})=>{
  await page.goto('/#island=compositional-modeling');
  await page.locator('[data-station-row="questions"]').click();
  await page.locator('[data-station-enter="questions"]').click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toHaveAttribute('data-station','questions');
  await expect(dialog.locator('.fi-question-sheet')).toHaveCount(8);
  await dialog.locator('.fi-building-note > summary').click();
  await dialog.getByRole('textbox',{name:'我的想法'}).fill('我想比较两种模型的边界。');
  const sheet=dialog.locator('.fi-question-sheet').nth(1);
  const question=await sheet.locator('.fi-question-sheet-text').innerText();
  await sheet.getByRole('button').first().click();
  await expect(sheet.getByRole('button').first()).toHaveAttribute('aria-expanded','true');
  await sheet.getByRole('button',{name:'带入我的札记',exact:true}).click();
  await expect(dialog.getByRole('textbox',{name:'我的想法'})).toHaveValue(`我想比较两种模型的边界。\n\n${question}`);
  await sheet.getByRole('button',{name:'已在札记中',exact:true}).click();
  await expect(dialog.getByRole('textbox',{name:'我的想法'})).toHaveValue(`我想比较两种模型的边界。\n\n${question}`);
  await sheet.getByRole('button',{name:/带着此问查看本岛文献/}).click();
  await expect(dialog).toHaveAttribute('data-station','library');
  await expect(dialog.locator('.fi-building-question')).toContainText(question);
  await expect(dialog.locator('.fi-question-source-scope')).toContainText('尚未逐条建立');
  await expect(dialog.getByRole('textbox',{name:'我的想法'})).toHaveValue(`我想比较两种模型的边界。\n\n${question}`);
  await page.getByRole('button',{name:/返回上一处/}).click();
  await expect(dialog).toHaveAttribute('data-station','questions');
  await expect(dialog.locator('.fi-question-sheet').nth(1).getByRole('button').first()).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('Escape');
  await page.locator('.fi-island-back').click();
  await expect(page.locator('[data-screen-label="L0 图集海图"]')).toBeVisible({timeout:30000});
  await page.goto('/?island-check=living#island=engineered-living-materials-elms');
  await expect(page.locator('.fi-island-screen')).toHaveAttribute('data-character','living',{timeout:30000});
  await page.getByRole('button',{name:'论据与测量',exact:true}).click();
  await page.locator('[data-station-row="library"]').click();
  await page.locator('[data-station-enter="library"]').click();
  await expect(page.getByRole('dialog')).toHaveAttribute('data-station','library');
});

test('lets a reader choose rooms from the building plan and return to the same reading position',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#island=compositional-modeling');
  await page.locator('[data-map-station="library"]').click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.fi-station-arrival [data-form="stacks"]')).toBeVisible();
  await page.locator('.fi-station-arrival [data-room-enter]').nth(1).click();
  const reading=page.getByRole('tabpanel');
  await expect(reading).toContainText('Structured Cospans');
  await reading.evaluate(element=>element.scrollTop=220);
  const saved=await reading.evaluate(element=>element.scrollTop);
  await page.locator('.fi-building-onward button').filter({hasText:'白板厅'}).click();
  await expect(page.getByRole('dialog')).toHaveAttribute('data-station','canvas');
  await page.getByRole('button',{name:/返回上一处/}).click();
  await expect(page.getByRole('dialog')).toHaveAttribute('data-station','library');
  await expect(reading).toContainText('Structured Cospans');
  // The click on the onward link scrolls it into view before leaving. Return
  // must restore that final position, not erase it on a room remount.
  expect(await reading.evaluate(element=>element.scrollTop)).toBeGreaterThanOrEqual(saved);
  await page.getByRole('button',{name:'回到岛上',exact:true}).click();
  await expect(page.locator('[data-station-enter="library"]')).toHaveText(/接着上次阅读/);
  await page.locator('[data-station-enter="library"]').click();
  await expect(reading).toContainText('Structured Cospans');
});

test('compares recorded sources and preserves a minimal test across research rooms',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#island=compositional-modeling');
  await page.locator('[data-map-station="library"]').click();
  await page.locator('[data-station-enter="library"]').click();
  await page.locator('.fi-research-desk > summary').click();
  await page.locator('.fi-source-picks button').nth(0).click();
  await page.locator('.fi-source-picks button').nth(1).click();
  await expect(page.locator('.fi-source-comparison article')).toHaveCount(2);
  await expect(page.locator('.fi-source-comparison a').first()).toHaveAttribute('href',/^https?:/);
  await page.getByLabel('两份材料之间，我看到了什么？').fill('我想核对共享接口的组合条件。');
  await page.getByRole('button',{name:'把这份思考带入札记',exact:true}).click();
  await expect(page.getByLabel('我的想法')).toHaveValue(/文献对照札记[\s\S]*共享接口的组合条件/);
  await page.getByRole('button',{name:'回到岛上',exact:true}).click();
  await page.locator('[data-map-station="workshop"]').click();
  await page.locator('[data-station-enter="workshop"]').click();
  await page.locator('.fi-research-desk > summary').click();
  await page.getByLabel('我目前预期什么？').fill('模型组合后仍满足边界约束。');
  await page.getByLabel('什么结果会让我改变判断？').fill('局部有效而整体约束失效。');
  await page.getByLabel('下一次最小检验是什么？').fill('先检查最小的双模块组合。');
  await page.getByRole('button',{name:'把这份思考带入札记',exact:true}).click();
  await expect(page.getByLabel('我的想法')).toHaveValue(/文献对照札记[\s\S]*双模块组合/);
  await page.getByRole('button',{name:'回到岛上',exact:true}).click();
  await page.locator('[data-station-enter="workshop"]').click();
  await expect(page.locator('.fi-research-desk')).toHaveAttribute('open','');
  await expect(page.getByLabel('下一次最小检验是什么？')).toHaveValue('先检查最小的双模块组合。');
});

test('previews buildings without visiting, navigates the map by keyboard, and retains reading marks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#island=compositional-modeling');
  const library = page.locator('[data-map-station="library"]');
  await library.focus();
  await expect(page.locator('.fi-wayfinder-caption')).toContainText('沿着论据回到可核对的出处');
  await expect(page.locator('.fi-station-preview')).toHaveAttribute('data-preview-station', 'library');
  await expect(page.locator('.fi-station-arrival')).toHaveCount(0);
  await expect(library).toHaveAttribute('data-visited', 'false');
  await page.keyboard.press('ArrowDown');
  await expect(library).not.toBeFocused();
  await expect(page.locator('.fi-wayfinder [data-map-station]:focus')).toHaveCount(1);
  await expect(page.locator('.fi-station-arrival')).toHaveCount(0);
  await library.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-station-enter="library"]')).toBeFocused();
  await expect(library).toHaveAttribute('data-visited', 'false');
  // Camera picking must also preview the selected building at its actual address.
  const canvas = page.locator('.fi-island-canvas');
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator('.fi-station-preview')).toHaveAttribute('data-preview-station', 'library');
  await page.mouse.move(box.x + 5, box.y + 5);
  await expect(page.locator('.fi-station-preview')).not.toHaveAttribute('data-preview-station');
  await page.locator('[data-station-enter="library"]').click();
  await expect(page.getByRole('dialog')).toHaveAttribute('data-station', 'library');
  await page.getByRole('button', { name: '回到岛上', exact: true }).click();
  await expect(library).toHaveAttribute('data-visited', 'true');
  await expect(page.locator('.fi-wayfinder-legend')).toContainText('曾读过的空间');
  await page.keyboard.press('Escape');
  await expect(page.locator('.fi-station-arrival')).toHaveCount(0);
  await expect(page.locator('.fi-wayfinder-location button')).toBeFocused();
  await page.locator('.fi-wayfinder-trail-toggle').click();
  const next = page.locator('.fi-wayfinder-next');
  await expect(next).toContainText('下一处');
  await next.click();
  await expect(page.locator('.fi-station-arrival')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const axe = await new AxeBuilder({ page }).include('.fi-wayfinder').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(axe.violations).toEqual([]);
});

test('returns a phone reader from the entrance to the visible island map', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.fi-mobile-nav button').nth(2).click();
  await page.locator('.fi-mobile-search input').fill('组合式科学建模');
  await page.locator('.fi-mobile-list > button').first().click();
  await page.locator('[data-map-station="library"]').click();
  await expect(page.locator('.fi-station-arrival')).toBeInViewport();
  await page.locator('.fi-station-arrival').getByRole('button', { name: '看全岛', exact: true }).click();
  await expect(page.locator('.fi-station-arrival')).toHaveCount(0);
  await expect(page.locator('.fi-island-landscape')).toBeInViewport({ ratio: .8 });
  await expect(page.locator('.fi-wayfinder-location button')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

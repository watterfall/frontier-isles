import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const studies=[
  ['formal-math','proof'],['causal-rep-learning','causal'],['compositional-modeling','compose'],['ai-theory-discovery','theory'],['self-learning-matter','matter'],['minimal-genome','cell'],['animal-ai-decode','calls'],['erasure-conversion-qubits-turning-loss','erasure'],['hyperuniformity-hidden-order-disorder','order'],['adversarial-falsification-benchmark-science','benchmark'],
];

test('all ten islands expose a working, topic-specific apparatus and original evidence',async({page})=>{
  test.setTimeout(180000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [slug,kind] of studies){
    await page.goto(`/#island=${slug}`);
    await page.locator(`[data-study-launch="${kind}"]`).click();
    const study=page.locator(`[data-study="${kind}"]`);
    await expect(study).toBeVisible();
    const before=await study.locator('.fi-study-observation').innerText();
    await study.locator('.fi-study-controls fieldset').first().getByRole('button').nth(1).click();
    await expect(study.locator('.fi-study-observation')).not.toHaveText(before);
    await expect(study.locator('.fi-study-sources a').first()).toHaveAttribute('href',/^https:\/\//);
    await expect(study.locator('.fi-study-boundary')).not.toBeEmpty();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(1440);
  }
});

test('keeps experiment settings and a private question across source reading and revisiting',async({page})=>{
  await page.goto('/#island=compositional-modeling');
  await page.locator('[data-study-launch]').click();
  const study=page.locator('.fi-field-study');
  await study.getByRole('button',{name:'误读为 L / min',exact:true}).click();
  await expect(study.locator('.fi-study-reading')).toContainText('偏差 236 L');
  await study.getByRole('button',{name:'加入单位转换',exact:true}).click();
  await expect(study.locator('.fi-study-reading')).toContainText('偏差 0 L');
  await study.getByRole('textbox',{name:'我想继续追问',exact:true}).fill('单位通过以后，状态定义怎样核对？');
  await study.getByRole('button',{name:'把这次考察加入札记',exact:true}).click();
  await expect(study.locator('p[role="status"]')).toContainText('已把条件、观察、追问和来源');
  await study.getByRole('button',{name:'带着这次观察进入文献阁',exact:true}).click();
  await expect(page.getByRole('tab',{name:'考察的来源与边界',exact:true})).toHaveAttribute('aria-selected','true');
  await expect(page.locator('.fi-building-question')).toContainText('单位通过以后，状态定义怎样核对？');
  await expect(page.locator('.fi-question-source-scope')).toContainText('直接引用');
  await page.getByRole('button',{name:/返回上一处/}).click();
  await expect(study.getByRole('button',{name:'加入单位转换',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(study.getByRole('textbox')).toHaveValue('单位通过以后，状态定义怎样核对？');
  await page.reload();
  await page.locator('[data-study-launch]').click();
  await expect(study.getByRole('button',{name:'加入单位转换',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(study.getByRole('textbox')).toHaveValue('单位通过以后，状态定义怎样核对？');
  const axe=await new AxeBuilder({page}).include('.fi-field-study').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(axe.violations).toEqual([]);
});

test('supports phone and English controls without widening the page, including a new island voyage',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>localStorage.setItem('fi-lang','en'));
  await page.goto('/#island=causal-rep-learning');
  // Mobile deep links select an atlas record; enter its actual generated island.
  if(!await page.locator('[data-study-launch]').count()){
    await page.locator('.fi-mobile-nav button').nth(2).click();
    await page.locator('.fi-mobile-search input').fill('Causal');
    await page.locator('.fi-mobile-list > button').filter({hasText:'Identifiable'}).first().click();
  }
  await expect(page.locator('.fi-study-index nav button')).toHaveCount(10);
  await page.locator('[data-study-launch="causal"]').click();
  const study=page.locator('.fi-field-study');
  await study.getByRole('button',{name:'Intervene on X',exact:true}).click();
  await expect(study.locator('.fi-study-reading')).toContainText('B: E[Y] = 5');
  await study.getByRole('slider').focus();
  await page.keyboard.press('ArrowRight');
  await expect(study.getByRole('slider')).toHaveValue('8');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
  const figure=study.locator('figure');
  await figure.focus(); await page.keyboard.press('ArrowRight');
  await expect.poll(()=>figure.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
  const axe=await new AxeBuilder({page}).include('.fi-field-study').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(axe.violations).toEqual([]);
  await study.locator('.fi-study-onward button').click();
  await expect(page.locator('[data-study-launch="calls"]')).toBeVisible({timeout:30000});
});

test('preserves an overflowing notebook and keeps a study operable with storage unavailable',async({page})=>{
  await page.goto('/#island=formal-math');
  await page.locator('[data-study-launch]').click();
  await page.locator('.fi-building-note > summary').click();
  await page.getByRole('textbox',{name:'我的想法',exact:true}).fill('原'.repeat(1190));
  await page.locator('.fi-field-study').getByRole('button',{name:'把这次考察加入札记',exact:true}).click();
  await expect(page.locator('.fi-field-study [role="status"]')).toContainText('札记已满');
  await expect(page.getByRole('textbox',{name:'我的想法',exact:true})).toHaveValue('原'.repeat(1190));
  await page.addInitScript(()=>{Storage.prototype.setItem=function(){throw new Error('storage unavailable');};});
  await page.reload();
  await page.locator('[data-study-launch]').click();
  const study=page.locator('.fi-field-study');
  await study.getByRole('button',{name:'存在 n',exact:true}).click();
  await expect(study).toContainText('原问题却被削弱');
  await expect(study).toContainText('浏览器存储不可用');
});

test('enters a study through its architectural room without WebGL',async({page})=>{
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind:string,...args:any[]){if(/webgl/.test(kind))return null;return (original as any).call(this,kind,...args);} as any;});
  await page.goto('/#island=causal-rep-learning');
  await page.locator('.fi-island-svg-fallback').getByRole('button',{name:'实验坊',exact:true}).focus();
  await page.keyboard.press('Enter');
  await page.locator('.fi-station-arrival [data-room-enter="workshop:field-study"]').click();
  await expect(page.locator('[data-study="causal"]')).toBeVisible();
  await page.getByRole('button',{name:'主动设定 X',exact:true}).click();
  await expect(page.locator('.fi-study-reading')).toContainText('B: E[Y] = 5');
});

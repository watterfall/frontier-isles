# Hex 分诊报告 · packages/assets · 2026-07-08

`pull` 轮的 system→design 发现:naive divergence 0.50 提示"177 个独立 hex 脱离 token"。逐一分诊后结论:**绝大多数是合理的,不是 drift**。

## 分诊结果

| 类别 | 数量(约) | 处置 | 理由 |
|---|---|---|---|
| **真·可 token 化**(组件 JSX 的 CSS 属性位,值 == token) | **19** | ✅ **已改** → `var(--token, #hex)` | fallback 保留 → SSR 输出不变、`toContain('#hex')` 测试仍过;19/19 test 绿 |
| 测试夹具(`__tests__/`) | ~10 | 保留 | 刻意用字面量断言透传(如 `sealColor:'#123456'`、`.toBe('#C9D8E6')`)——改了就坏测试 |
| JS 数据映射(`palettes.ts`) | ~55 | 保留 | `NIGHT_SCENE_VARS`/`DOMAIN_COLORS`/`DOMAIN_SCENE_VARS` 是 scene-var 的**真相源数据**,不是 CSS 上下文;域色本就数据驱动 |
| `AI_INK = '#5A6C9E'` | 1(用 6 处) | 保留 | 刻意的组件级常量,升 token = breaking change(`.claude/context/interface.md` 明确) |
| 界画场景墨(`#3a342b`/`#4a4238`/`#605034`/`#9fb2d8`…) | ~63 | 保留 | 场景细节勾线/水色,非 canonical 调色板;强行 token 化会稀释界画笔触辨识度 |

## 已 token 化的 19 处(语义纠正)

`#F5B94B→--fi-lantern` · `#E3A93C→--fi-gamboge` · `#2B2620→--fi-ink` · `#6B6154→--fi-ink-2` · `#F2EAD8→--fi-paper` · `#8B94B2→--fi-night-ink-2` · **`#B5673A→--fi-ochre`**(注:`#B5673A` 同时是 `--fi-ochre` 与 `--fi-domain-matter-ink`,罗盘针/灯笼框语义取 `--fi-ochre`,非 domain 色)。

涉及文件:SceneDefs · Compass · LineageLine · ResidentFigure · DaySky · Fireflies · GhostArtifact · HangingLantern · StationGallery。

## Divergence 轨迹(全可复现)

| 口径 | offToken | divergence |
|---|---|---|
| naive(所有 hex) | 0.622 | 0.496 |
| fallback-aware(扣 var fallback) | 0.441 | 0.369 |
| + 排除 tests + palettes 数据 | 0.272 | 0.250 |
| **+ 19 处 token 化后** | **0.209** | **0.206** |

## 结论

- **token 层无缺、无需新增 token**;这轮是 representation 富化 + 19 处真实 tokenization,**tokens.css 未动**。
- 剩余 63 个独立 hex 是**刻意的界画场景墨 + 组件常量**,非 drift —— divergence ≈ 0.21 已是本项目的**结构性地板**,不必再降(强行降 = 破坏界画笔触)。
- **度量教训**:divergence 公式须(1) fallback-aware,(2) 排除 test 夹具 + 数据常量模块——否则系统性高估。已回灌 skill 的 coevolution.md。

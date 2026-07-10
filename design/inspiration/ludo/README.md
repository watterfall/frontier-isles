# Ludo.ai 概念图 — 丰富度 campaign 泳道 D

_2026-07-10 经 Ludo.ai Image Generator(Scene Art 模式)生成,8 张 / 4 主题 × 2 变体,共消耗 4 credits。用途:`docs/depth-plan-v1.md`(重建版)与后续仪式时刻实现的视觉参照——是氛围与构图基准(mood/composition reference),不是可直接入库的资产;正式资产仍走 `packages/assets` 手绘 SVG / 设计系统 token。_

| 文件 | 主题 | 对应设计元素 | 数据源(它转写什么) |
|---|---|---|---|
| `01/02-my-harbor` | 雾中港湾:近处清晰的私人港湾,远处群岛没入海雾 | My Harbor 我的港湾 + 雾化(depth-plan-v1 §3) | 成员事件(你登过的岛清晰,未知海域雾化) |
| `03/04-dispute-storm` | 局部风暴:一朵乌云只罩一座岛,四周晴海 | 仪式时刻·风暴(Reversal 型) | `refute` 事件(争议度) |
| `05/06-vertical-cutaway` | 垂直剖面:风筝天空 / 码头水线 / 海底发光地层与遗迹 | 垂直世界 sky/sea/seabed 认识论分层 | 愿景(开放问题)/ 进行中 / 已沉淀证据 |
| `07/08-river-lantern` | 河灯夜:纸灯从岛边漂向暗海,涟漪倒影 | 仪式时刻·河灯(Resonance/Reward 型) | `publish` 事件 |

## 复现 prompt(Scene Art,均以 "no text" 结尾)

1. **river-lantern**: Hand-drawn nautical chart meets soft watercolor: a small isometric island at night, warm lantern-lit huts, one glowing paper river lantern drifting from the island shore out onto the dark sea, gentle ripples and reflections, starry sky, quiet ceremonial mood, storybook game art
2. **vertical-cutaway**: Vertical cross-section cutaway illustration, hand-drawn watercolor game art: one island shown in three stacked vertical zones — bright sky with drifting clouds and paper kites above, sea surface with small wooden buildings and boats at the waterline, deep underwater strata below with glowing sediment layers and sunken relics, cohesive storybook style
3. **dispute-storm**: Hand-drawn nautical watercolor game art: a small isometric island beneath one tiny localized storm — a single dark swirling cloud with rain and a lightning bolt hovering only above that island, while the surrounding sea stays calm and sunny, dramatic weather contrast, storybook style
4. **my-harbor**: Hand-drawn nautical chart in soft watercolor: a cozy small harbor cove in the foreground rendered in crisp warm detail — wooden docks, one moored sailboat, glowing harbor lights — while distant archipelago islands dissolve into thick sea fog toward the horizon, mysterious unexplored mood, storybook game art

## 备注:API 路径当前不可用

会话中给到的 key(UUID 形态)走 REST(`Authorization: ApiKey <key>`)返回 `Unauthorized`,MCP 端点(`https://mcp.ludo.ai/mcp`,`Authentication: ApiKey <key>` 头)可握手但工具调用同样 403;Ludo 规范里 key 应为 `xxx.yyy.zzz` 三段式,且 API 功能限特定订阅档。修复:登录 ludo.ai → Settings 重新生成 API key。本批图走的是浏览器内已登录的 Web UI。

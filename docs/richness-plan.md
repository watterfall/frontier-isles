# 丰富度 Campaign 计划 —「像玩游戏一样探索科研问题」

_2026-07-10。ROADMAP §3.12 的执行计划:丰富度跟了 v2(横向海即数据)、跳过了 v1(垂直世界 + 仪式时刻)。本文回答"从第一性原理看怎么设计更丰富多层次的展示、交互与功能如何平衡、如何吸引参与",并拆成可并行的泳道。不改 Phase A–D 大顺序,只在 L1 收口与 Phase C 之间插入本 campaign。_

## 0. 触发事实

- `depth-plan-v1.md` 被 ROADMAP §3.12/§4、`depth-plan-v2.md` 头部、`INFO-HIERARCHY.md` 共 6 处引用,**但文件不存在**——垂直世界(sky/sea/seabed)、terrain fingerprint、landing ceremony、仪式时刻、漂流瓶/居民之树/候鸟/我的港湾的设计只活在引用里。第一任务是把它重建为正式设计文档(泳道 A)。
- `docs/scene-upgrade/OUTSTANDING.md` 已列好 P1 实现清单——直接派发(泳道 B/C)。

## 1. 第一性原理(四条,判每个新增)

1. **丰富度 = 数据的转写,不是装饰**(不变量 14 的推广)。每个新视觉元素必须答得出"它转写哪个事件/投影?"——河灯 ← `publish`,风暴 ← `refute`,彩虹 ← 争议解决,候鸟 ← 引用/桥接关系,居民之树 ← 成员事件,夜班灯 ← AI 夜班账本。答不出 → 拒绝。这保证"展示"永远是未来"功能"的可视层,功能接入时零重构。
2. **好奇缺口驱动探索,不是分数驱动**。探索动机来自"看得见但未知":雾化的远方群岛、variance-select 浮出的灯塔离群岛、漂来的漂流瓶。绝不给探究核心计分——no-XP 不变量与游戏化研究结论一致(过度辩护效应:对内在动机活动施加外在奖励会系统性削弱它;学习成果 d≈0.2–0.4,游戏化只解"愿不愿意来",不解"钻得深不深")。**移除测试**:拿掉任何游戏层元素,探索科研问题本身必须仍然成立。
3. **因果可见 = 魔法时刻,替代计分作为反馈**。你的动作立刻在世界可见(publish → 河灯从你的岛漂出),别人/AI 的动作也可见(夜班灯、晨报)。仪式时刻按五型设计(Recognition/Revelation/Reversal/Resonance/Reward),整个世界 ≥3 型;宁要 1 个被记住的时刻,不要 5 个平均的动效。
4. **层次 = 语义 LOD,不是堆料**。远/中/近各回答不同问题(哪里热闹 → 这座岛在做什么 → 这个 claim 长什么样);关系层等重信息走 **on-demand lens**,不 always-on(§3.10 的教训已付过学费)。垂直方向同理:天空(愿景/问题)—海面(进行中)—海底(已沉淀的证据) = 认识论的分层,不是三张贴图。

## 2. 交互展示 vs 功能的平衡判据

- **展示先行是允许的,但必须绑真数据管道**:视觉元素直接消费投影(`projections.ts`/`currents.ts`),功能(交互动作)后补时不需要改数据层。
- **每个 campaign 至少闭合 1 个功能环**:本次 = claim 塔点击 → detail 面板(看见 → 点开 → 读到证据链,探索环闭合);其余(landmark、微动态、仪式)是展示层。
- **参与感的顺序**:先让"看的人"被吸引(世界感、好奇缺口),再让"动的人"被看见(魔法时刻),最后才是"多人氛围"(presence/夜班)。不倒序建设。

## 3. 泳道拆分(并行执行)

| 泳道 | 模型 | 交付物 | 依赖 |
|---|---|---|---|
| **A · 设计** | opus | 重建 `docs/depth-plan-v1.md`:垂直世界 / terrain fingerprint / landing ceremony / 仪式时刻五型 / 漂流瓶·居民之树·候鸟·我的港湾——每个元素带:数据源(事件/投影)、LOD 尺度、交互、移除测试;§3 编号须与 INFO-HIERARCHY 的既有引用(My Harbor/雾化/制图泛化在 §3)兼容 | 无 |
| **B · 实现** | sonnet | OUTSTANDING P1:M4.4 Landmark×4 + M4.5 密度梯度环带 + claim 点击接 detail 面板 | 无(worktree 隔离) |
| **C · 实现** | sonnet | OUTSTANDING P1:M8 微动态第二批(炊烟/旗帜/萤火,量力) + 名牌 i18n + per-station 垂直配准 | 无(worktree 隔离) |
| **D · 素材** | inline | Ludo.ai 概念图(河灯夜/垂直剖面/风暴/港湾) → `design/inspiration/ludo/`,喂给 A 与后续仪式时刻实现 | 无 |
| **E · 后续批** | — | 仪式时刻第一批(河灯 on publish + ~8s transplant walk):事件驱动动画,严格按 A 的设计 | A |

## 4. 不变的中期顺序

Phase B(第一个真 AI 居民/CrossRef → 夜班 → 晨报闭环)仍是产品证明,Phase C(L0 语义 LOD + 关系 lens rework)仍排在 L1 收口后。本 campaign 只是把 §3.12 的"丰富度欠账"在两者之间显式还掉——因为"吸引人参与"是 Phase B 闭环有观众的前提。

## 5. 验收(可证伪)

- [x] `docs/depth-plan-v1.md` 存在,6 处悬空引用全部落地;每个丰富度元素有数据源与移除测试。(`317f8ab`)
- [x] 进入任一生成岛:能看到 ≥1 个 biome landmark、岛心→岸线密度梯度;点击 claim 塔弹出 detail 面板。(`0523912`)
- [x] 微动态第二批至少 2 种上线且全部数据绑定:炊烟(活跃站)+ 旗帜(active gate);萤火/夜市灯显式记回 OUTSTANDING。(`eb35b19`)
- [x] `pnpm -r test && pnpm -r typecheck` 全绿(242 测试);名牌随语言切换(architecture §9 核对:站名属 glossary 可译层)。
- [x] 概念图落 `design/inspiration/ludo/`(8 张,`5019708`);depth-plan-v1 重建时 ludo 目录尚不存在,引用留待泳道 E 河灯实现时补——**未弃用**。

_泳道 E(河灯 + 移栽之路,按 depth-plan-v1 §6/§9 Batch 1)为下一批。额外收获:泳道 C 顺手修了渡口码头因绝对坐标锚点在 live L1 完全不渲染的真 bug;Data Bench 旗帜机制正确但协议缺 dataset 动词,真岛暂不可达(诚实记录于 OUTSTANDING)。_

## 6. 第二批(2026-07-10,同日实测截图驱动)

实测 live L1(Miyake)+ L0 后的诊断:海面死平、地形单绿、真岛散布稀疏、夜=滤镜、L0 岛形雷同无从辨认。据此并行三泳道:

| 泳道 | 模型 | 交付物 | 数据绑定 |
|---|---|---|---|
| **E · 仪式** | sonnet | 河灯 on `publish` + ~8s 移栽之路 on `transplant`(depth-plan-v1 §6/§9 Batch 1);渲染进新模块 `renderer/pixi/rituals.ts` | 恰好一动词一仪式,once-per-event(不变量 17) |
| **F · L1 氛围** | opus | 海深渐变 + 岸线潮圈;per-tile 地形指纹微变(Batch-3 切片**拉前**,因直接命中"层次感"诉求);夜萤火(OUTSTANDING M8 第二批);诊断修复真岛 scatter 稀疏 | 水深 meta(=抽象度,inv 16)/ tide N / hash(slug) 种子(inv 13)/ projectActiveStations |
| **G · L0 指纹** | sonnet | 岛形 pre-echo:footprint 绑 stage、海岸线语法分 4 域、resolved → 灯塔、密度档位(§5 L0 剪影即指纹) | stage/status/domain/eventCount + hash(slug),档位离散不排名 |

**红线**:G 不得 remount SeaLayer/画关系线——ChartScreen 头注已明确 sea-plane 故意不挂载,等 §3.10 关系表示重做,本批不重开该决定。

- [x] E:发表触发河灯离**本岛**;移栽 ~8s 走桥;点击追溯到事件;reduced-motion 优雅降级(`004b5c3`,demo 页实拍河灯离岸)
- [x] F:水深/潮圈/指纹/萤火全部可答"转写什么数据";scatter 稀疏根因写明并修复——M4.5 密度原是常量,与活跃度无关;现乘 stage+eventCount+members 有界因子,空岛 20 vs 活跃岛 47(`aa60f62`)
- [x] G:同岛永远同形(确定性测试);4 域轮廓一眼可辨(数理 angular/物质 faceted/生命 organic/交叉 hybrid);school 岛远看更大更密 + 双台地(`4d914ce`)。**诚实修正** `d325782`:摘掉手工标在活体导线上的 `resolved: true`——没有一个前沿真被解决,第一座灯塔必须由真实 resolution 赢得,机制保留
- [x] 门禁:285 测试全绿 + typecheck 干净(242+13+4+26),三条泳道均独立复验;L0/L1 昼夜/仪式截图对比留档(scratchpad);demo HUD renderMs 0.3ms 无回退

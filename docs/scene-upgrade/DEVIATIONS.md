# 等距场景升级计划 — 偏差意见（M0 前置评审）

> 依据执行要求 §9.1：先通读代码库、逐条输出偏差意见、等确认后动手。
> 证据均带 `file:line`。结论分级：**⛔ 阻断/需拍板** · **♻️ 需重解释** · **➕ 增量可做** · **✅ 与现状一致**。

---

## 0. TL;DR（先看这三句）

1. **头号偏差 ⛔**：整份计划（§3 五层、GLSL 水面/雾、Filter、RenderGroup、ParticleContainer、zIndex、§7 帧率/draw-call 预算）是**为 PixiJS 写的**。但线上 L1 场景**100% 是手写 React SVG**（固定 `1440×900` viewBox、硬编码像素多边形）。仓库里**有**一套完整的 Pixi 引擎（`IsoStage`），但**从未挂载**，是"生产形态的死代码"。而且 `docs/DECISIONS.md` 明确记过"L1 用 SVG 不用 Pixi"是 slice-1 的**刻意决定**，Pixi 留给 P3 atlas。→ **是否把 L1 迁到 Pixi，是决定整个计划形态的总开关，必须你拍板。**
2. **三个点名雷区**：`dayVisibility` → schema 需加字段但**增量可做**（要和已存在的 `nightT` 时间线语义对齐）；账本废弃事件 → **好消息,数据层支持,无需新 verb**（`refute` + `return_to_driftwood` 已被投影成夜景鬼影）；K 值×高差 → **现状零高差**,`worldToScreen` 连 z 轴都没有,K 设计不难但是**净新增**,还牵连屏幕 Y 偏移。
3. **语义地基偏差 ⛔**：计划核心是"每栋建筑=一条 claim,地基→楼层→屋顶 绑复现状态"。但现状**建筑=岛的 6 个固定 station**,生长是**岛级**（empty/hut/academy/school）,**根本没有 per-claim 实体/验证态/复现计数/共识概念**。"建筑到底绑 claim 还是 station",也要你拍板。

---

## 1. 头号偏差 ⛔ — 渲染平台：SVG 现状 vs 计划假定的 Pixi

**证据**
- 线上 L1 = 单个 `<svg viewBox="0 0 1440 900">`,岛基是硬编码像素多边形 `points="760,176 1348,470 …"`（`apps/web/src/scene/Scene.tsx:125`、`GeneratedScene.tsx:97`）。全 `apps/web` 无 `<canvas>` / `Application` / WebGL。
- Pixi 引擎已建但从不挂载：`packages/renderer/src/pixi/stage.ts:46` `IsoStage`（真 WebGL Application、sprite/Graphics、chunk cull、`anchorDepth` zIndex）。`apps/web` 里唯一的 `@frontier-isles/renderer` import 是 `SeaLayer.tsx:24` 拿 `sea.ts` 的纯数学。`grep IsoStage|worldToScreen|sortByDepth` in `apps/web/src` → **0 命中**。
- 深度**现状靠 JSX 源码顺序**手排,不是计算出来的;`depthOf(gx,gy)=gx+gy`（`iso.ts:71`）、`anchorDepth`、`sortByDepth` 都写好且有测试,但 web 层没用。

**影响**：计划里这些能力在 SVG 下**不存在**或需完全不同实现——
- M2 波光/浪花 GLSL fragment、M6 Trust Fog 噪声 shader → SVG 只能用 `<filter>`/CSS/局部 canvas,性能与质感两条路。
- M3 全屏色调 Filter → SVG 无 Filter 管线,只能 CSS `filter`/feColorMatrix。
- M8 萤火 ParticleContainer、§7 draw-call/RenderGroup 合批、60fps 满编制 → 都是 WebGL 概念,SVG 瓶颈是 DOM 节点数,无批处理。

**建议**：这是**总开关**,给三个选项（见文末问题 Q1）。我的推荐是 **C 混合**：sky/sea/fog/微动态/粒子层用一层 **Pixi/WebGL canvas 铺底**（正好对上你的五层里 ①②④和 M5/M8）,worldLayer 世界对象**暂留 SVG 但引入计算式深度**（把已有 `sortByDepth`/`anchorDepth` 接进渲染路径）。这样既拿到 shader/粒子,又不推翻"L1 crisp SVG"的既定决定,迁移面最小。纯 A（全迁 Pixi）最贴计划但推翻 slice-1 决定、重写全部 SVG 资产为纹理;纯 B（死守 SVG）则 M2/M6/M8 大幅降级。

---

## 2. 三个点名雷区

### 2a. `dayVisibility` 对 SceneGraph schema 的影响 — ➕ 增量可做,但要对齐 `nightT`
- **现状**：昼夜是 (1) 纯色板 CSS 变量 `NIGHT_SCENE_VARS`（`packages/assets/src/palettes.ts:24`）+ (2) **命令式条件 JSX**（`{night ? <NightSky/> : <DaySky/>}`,`Scene.tsx:122`）。**两套 scene model（`IslandScene.Placed` / `GenStation` 等）都没有可见度字段**。
- **关键坑**：夜景鬼影**已经**由一条 `nightT`（1..86 时间线阈值 `nightT>=g.threshold`,`Scene.tsx:214`）驱动,不是简单 day/night 布尔。计划的连续滑杆 `t∈[0,1]`（P4）是**新语义轴**,必须和现有 `night:boolean + nightT:number` 时间线对齐,别各搞一套。
- **建议**：在统一后的 scene object 上加 `dayVisibility/nightVisibility∈[0,1]`（layout 层输出,渲染层按 t 插值 alpha）。schema 变更是**加字段**,低风险;真正的活是把现有命令式条件迁成数据驱动可见度,并把 `nightT` 时间线折进 `t`。

### 2b. 账本是否保留废弃/驳回事件 — ✅ 支持,P5 的兜底条件不触发,无需新 verb
- **账本 append-only、hash-chained、永不 GC**：唯一写路径 `store.ts:341 appendRaw → INSERT`,`prev` 不匹配抛 `ChainError(409)`;全仓 `grep 'UPDATE ledger|DELETE FROM ledger|VACUUM|prune|gc'` → **无**。唯一的 UPDATE/DELETE 是 `store.ts:779 UPDATE placements`（可再生的 place plane,非账本）。
- **废弃/驳回的可持久原语已存在**：`refute`（驳回）、`return_to_driftwood`（返回浮木/搁置）——**且已被投影成夜景鬼影**：`projections.ts:174` `return_to_driftwood→{reason:"returned"}`、`:177` `refute→{reason:"refuted",atom:"contradiction"}`。
- **注意**：协议**没有**独立的 `abandon/deprecate/retract/withdraw` verb（全量 16 个 verb 见 `packages/opp/src/ledger.ts:20`）。→ M8 鬼影建筑直接复用 `refute`+`return_to_driftwood` 即可,**不需要加 verb**（加 verb 属 §7 协议变更,能不加就不加）。P5 说"若数据层不支持则作为 M8 前置依赖"——**数据层支持,该前置依赖不成立**。

### 2c. K 值与高差兼容性 — ♻️ 净新增,不难但要连屏幕 Y 偏移一起设计
- **现状零高差**：iso 数学是纯 2:1 `worldToScreen(gx,gy)={x:(gx-gy)*64, y:(gx+gy)*32}`（`iso.ts:44`）,`WorldPoint/TileCoord` **只有 2D,无 z**;`tiles?:number[][]` 是地形**种类**图（0=海）不是高程图（`scene.ts:42`）。`depthOf` 目前也**无 K、无 elevation**。
- **K 设计**：`isoDepth=(x+y)*K+elevation`,要 elevation 只做**同行内 tie-break、绝不越行**,故 `K > max_elevation`。高差 {0,1,2} → 整数 `K≥3` 即可（或用大 K=1000、elevation 作亚单位,给附件/多层留位）。多格建筑按最靠前格锚点取值——已有 `anchorDepth`（`scene.ts:66`）可直接复用。
- **易漏点**：高差不仅改排序,还要改**屏幕位置**——`worldToScreen` 需加 `screenY -= elevation*STEP` 抬升,否则台地/高地视觉贴地。这条 M1 技术设计里要一起验证。
- **结论**：非阻断,但"验证 K 不串扰"在 M1 里是**真设计任务**,因为高差从零起。

---

## 3. 语义地基偏差 ⛔ — "建筑 = claim" 在现状里没有可绑实体

- **现状建筑=岛的 station**：一个"claim"= 一条 `submit_claim` 事件 + 内容寻址 `ref`,落在 `workshop` station（`projections.ts:38`）。生长是**岛级**唯一轴 `GrowthStage=empty|hut|academy|school`（`projections.ts:58`）。**无 per-claim 实体、无验证态、无复现计数、无共识概念**（全仓无 `EpistemicState/ClaimState/verified`）。
- **计划 §5 要求**：每栋建筑=一条 claim,地基=preprint/开放、+1 楼层/每次独立复现、屋顶=领域共识。→ **完全没有可绑的东西**。
- **数据其实够,但缺投影**：`submit_claim/publish` 是起点、`validate` 是复现信号（`currents.ts` 已按 ref 计数,但按跨岛边聚合,不是 per-claim 楼层数）、`refute` 是争议。缺一个 **新 reducer `projectClaimState(events)`**（按 `ref` 分组:distinct 验证岛数→楼层,refute→鬼影,共识阈值→屋顶）。这是**增量、无需新 verb、符合"reduce over ledger"不变式**,但是**一大块新投影**,且要重新定义"建筑"到底是 claim 级还是 station 级。→ 见问题 Q2。

---

## 4. "Pixi 只消费现有 SceneGraph"（P2）不成立 — 有两套且都不通

- 存在可序列化模型 `IslandScene{tiles,stations,placements,scenery}` over `Placed{id,kind,gx,gy,footprint}`（`renderer/src/scene.ts:24`）——**网格式、有测试、但没人从岛数据生成它,web 也不用**。
- web 实际渲染的是 `GeneratedScene`（`scene/generator.ts:75`）——**像素式 prop 袋**,`GenStation{kind,visible}` 连坐标都没有(位置烘在资产组件里),`GenScenery/Resident` 带屏幕像素 `x,y`。
- → M1 "迁移现有对象"实为**从近乎零搭 layout 层 + 生成器 → SceneGraph 管线**,再决定统一到哪套模型。规模比"迁移"大得多,M1 技术设计要正视。

## 5. biome 命名/集合偏差 + 已部分实现 — ♻️
- 计划写 4 biome = 数学/**AI**/生物/物理。**仓库实际 domain = 数理/物质/生命/交叉**（`packages/data/src/frontiers.ts`）——"AI" 是 cluster 标签不是 domain。→ 用仓库的 4 个 domain,别引入 AI 作 biome。
- **好消息**：domain **已驱动 3 通道**:色板 `DOMAIN_SCENE_VARS`（`palettes.ts:75`）、植被 mix `sceneryForDomain`（`generator.ts:129`）、海洋 climate `domainToVec`（`data/src/sea.ts:60`）。→ M4.6 biome 参数包**已有半成品**,补建筑材质 + 雾色 + Landmark 形态即可。

## 6. 富集度硬指标 vs 现状 gap（§4）
| 指标 | 目标 | 现状 | gap |
|---|---|---|---|
| 建筑原语 | ≥36 组合件 | **9 个整体 station,0 个组合件**（`StationLibrary.tsx` 等,墙/窗/顶全烘死） | 整套 base/floor/roof/attachment 字典 + 组合器净新增 |
| scatter | ≥20 种 | 11 组件 / 8 种接线,仅位置+缩放抖动,**无色相抖动、无镜像** | 补 ~9–12 种 + 变异维度 |
| Landmark | 每岛 1 | **无** | 净新增（每 domain 1 形态） |
| biome | 4,两两可辨 | 4 domain 已驱动色板+植被+海洋 | 补材质+雾+Landmark |
| 高差 | 3 级+悬崖/坡道/河流 | **零高差** | 净新增(见 2c) |

## 7. 性能与回归框架依赖平台（§7）— ♻️
60fps/draw-call/ParticleContainer/RenderGroup 全是 WebGL 概念。若 C/ A 走 Pixi 铺底,这套适用于 canvas 层;worldLayer 若留 SVG,其"性能预算"要换成 **DOM 节点数**口径。§7 需按 Q1 结果重写。

---

## 8. 建议的修订执行序列（待 Q1/Q2 确认后定稿）
1. **M0（本轮）**：偏差评审 + 平台/语义拍板（本文件 + 文末 3 问）。
2. 据 Q1/Q2 **修订计划**:统一 scene model、定义 `dayVisibility`+`projectClaimState` 对 schema 的增量、biome 用仓库 4 domain、§7 按平台重写。
3. **M1 技术设计**（首份交付,执行要求 §9.2）：五层容器结构、`isoDepth`(含 K×高差×屏幕 Y 偏移)、chunk 缓存 + 帧率基线。
4. **M4 动工前**:高差+密度环带算法 + 36+ 原语参数化清单,批准后批量产。
5. 逐里程碑交付,不跳步。

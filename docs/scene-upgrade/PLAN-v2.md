# 等距场景升级 — 修订版计划 v2（与现状对齐后）

> 基线：`docs/scene-upgrade/DEVIATIONS.md`（M0 偏差评审）。
> M0 拍板：**D1 全迁 Pixi** · **D2 分层建筑(station civic + claim 生长体)** · **D3 先修订计划再交 M1**。
> 本文件只改"与现状不符/新增"之处；原计划未列出的条目默认沿用。

---

## 0. 三条拍板决定的后果（必须先接受）

| 决定 | 直接后果 | 动作 |
|---|---|---|
| **D1 全迁 Pixi** | L1 场景从 React SVG → WebGL(Pixi v8,已是 `packages/renderer` 依赖)。挂载/演进现有 `IsoStage`(`renderer/src/pixi/stage.ts:46`)。**反转 `DECISIONS.md` 记录的"L1=SVG"slice-1 决定**。**现有 9 个 station + 11 个 scenery React-SVG 资产全部重制为 Pixi**（见 §5 资产策略）。**App 需新增相机/pan-zoom 状态**（今天不存在）。 | 补一条 `DECISIONS.md` 条目（见 §7 动作项） |
| **D2 分层建筑** | 6 个 station = 岛的固定 civic 建筑（其一可升为 Landmark）。claim = 由**新 reducer `projectClaimState`** 驱动的生长结构。需在 core 新增该投影（reduce over ledger，无新 verb，符合 §7 不变式）。 | M4 前交付 `projectClaimState` 设计 + claim 建筑生长状态机 |
| **D3 先修订计划** | 本文件即修订计划；确认后再交 M1 技术设计。 | 你 review 本文件 → 我交 M1 |

> **不变式合规自检**（architecture §7 + depth-plan-v2 §14–16）：新增全是**投影/渲染**层，`projectClaimState` 是对账本的 reduce、**不加 verb、不加"画连线"工具**、账本仍永不 GC、无 XP/排行榜、list twins 不动、AI 不 push。海洋层 shader 仍是对账本的 reduce（current=事件流），零新增动词。✅

---

## 1. 目标数据管线（对齐后的唯一权威）

```
fold(ledger events)
  ├─ islandProjection      现有：GrowthStage / tide / dormancy / currents（projections.ts, currents.ts）
  └─ claimStates ★新        projectClaimState(events)：按 ref 分组 → 每条 claim 的 foundation/floors/roof/ghost/activity
        │
        ▼
  layout 层 ★新（引擎无关，P2）
    输入 = islandProjection + claimStates + biome 参数包 + 昼夜 t + LOD 级别
    输出 = SceneGraph：给每个对象算 gx/gy/elevation、depthKey(isoDepth)、
           dayVisibility/nightVisibility、lodLevel、biome、variant、growth
        │
        ▼
  SceneGraph（统一序列化模型，见 §3）
        │
        ▼
  Pixi 渲染器  render(sceneGraph, viewport)   ← 只消费,不计算(P2)
    五层容器：sky / sea / world(唯一排序) / fog / ui
```

**关键纪律**：坐标、深度键、图层归属、LOD、昼夜可见度**全在 layout 层算完**；Pixi 侧只 `zIndex = depthKey` + 按 t 插 alpha + 跑 shader。

---

## 2. Scene model 统一（解决 DEVIATIONS §4：两套模型不通）

- **渲染契约收敛到网格式** `IslandScene`（`renderer/src/scene.ts:45`，已有测试），扩展为 SceneGraph（§3）。
- **像素式 `GeneratedScene`（generator.ts）不再作渲染契约,但其逻辑保留**：`sceneryForDomain`(植被 mix)、dormancy/status/tide/domain 计算 → **喂给 layout 层**,由 layout 把"该岛有哪些 scatter/station/claim"翻译成带 gx/gy 的 SceneGraph 对象。即 generator 降级为"岛内容清单生成器",不再直接吐屏幕坐标。
- 好处：`sortByDepth`/`anchorDepth`/`sliceFootprint`/`ChunkIndex`(renderer 里已写好且测试过)第一次真正接进渲染路径。

---

## 3. SceneGraph schema 增量（解决点名雷区 2a dayVisibility）

在 `Placed{id,kind,gx,gy,footprint}` 基础上,SceneObject 增加：

| 字段 | 类型 | 语义 | 来源 |
|---|---|---|---|
| `elevation` | `0\|1\|2` | 海滩/台地/高地（P6） | layout 地形生成 |
| `depthKey` | `number` | `(gx+gy)*K + elevation`,多格取最靠前锚点 | layout（M1 定 K） |
| `dayVisibility` | `[0,1]` | t=0 发表态时的 alpha | layout |
| `nightVisibility` | `[0,1]` | t=1 过程态/夜景时的 alpha | layout |
| `lodLevel` | `'Z0'\|'Z1'\|'Z2'` | 语义 LOD | layout（M7） |
| `biome` | domain 枚举 | 数理/物质/生命/交叉 | islandProjection |
| `variant` | `number` | P7 程序化变异种子 | layout（rng by id） |
| `growth?` | `{foundation,floors,roof}` | 仅 claim 建筑 | claimStates |

**昼夜双通路**（P3/P4）：
- 通路 A = skyLayer 全屏色调 Filter,uniform = t（连续）。
- 通路 B = 每对象 `alpha = lerp(dayVisibility, nightVisibility, t)`。
- 二者独立组合。**现有命令式 `{night ? …}` JSX + 双份 sky 资产 M3 全部下线**,`nightT`(1..86 时间线)折进 t（M3 定：t 直接映射,或保留 nightT 作"夜景回放 scrub"子轴——M3 决策）。

---

## 4. 里程碑对齐（只列相对原计划的改动）

- **M1 层序架构**：现状无 Pixi 挂载、无相机、深度靠 JSX 顺序 → M1 实为**从零搭**：挂载 Pixi Application + 五层容器 + React 相机/pan-zoom 状态 + layout 层 isoDepth（含 §2c 的 **K×高差×屏幕 Y 偏移**一起验证）+ 把当前场景内容迁进 Pixi（首轮可"SVG 光栅化成纹理"保连续,再逐件替换）+ 地形 chunk/RenderGroup 缓存 + 帧率基线。**scene model 统一(§2)在 M1 落地。**
- **M2 水面 shader**：真 GLSL（WebGL 具备）。研究 `arafays/messenger-copy` 逻辑,重写不抄资产。
- **M3 昼夜语义视图**：§3 双通路;`nightT→t` 收敛;下线双份 sky + 命令式条件。
- **M4 核心丰富度**：① 高差从零建;② **36+ 原语用 Pixi Graphics 参数化件**（非 SVG,见 §5）+ 邻接白名单在 layout 拒绝非法组合;③ claim 建筑生长绑 `projectClaimState`(D2),楼层升起动画;④ 每 biome 1 Landmark;⑤ 密度环带(岛心→中环→岸线);⑥ **biome=仓库 4 domain(数理/物质/生命/交叉,非"AI")**,扩现有 `DOMAIN_SCENE_VARS`→Pixi tint/uniform + 补建筑材质/雾色/Landmark 形态（色板+植被+海洋 climate **已有半成品**）。
- **M5 微动态**：Pixi 粒子/顶点。与 M4 可并行(依赖 M1)。
- **M6 Trust Fog**：`projectClaimState` 提供 per-claim 争议度(refute 计数)→雾浓度;复现通过→雾消退。
- **M7 LOD Z1/Z2**：Z0 只留接口(岛级聚合 mock,不渲染)。
- **M8 夜景资产**：鬼影建筑数据源 = `refute`+`return_to_driftwood`（**已确认账本支持,无需新 verb**,DEVIATIONS §2b）;萤火 ParticleContainer;夜市灯光。依赖 M3。

**§7 性能**：现改为真 WebGL 口径,原计划的 60fps/draw-call/ParticleContainer/RenderGroup 预算**按原文适用**;基准设备待 M1 记录。

---

## 5. 资产迁移策略（D1 的最大成本 — M4 前定稿的子决策）

现有资产是 React SVG 组件(位置/形状烘死,仅色板走 CSS 变量)。全迁 Pixi 有两条路,**推荐 B**：

| 方案 | 做法 | 取舍 |
|---|---|---|
| A 光栅化 | 运行时把 SVG 组件渲成纹理喂 Pixi sprite | 快、保原型观感;但**无法参数化组合**,与 36+ 积木件(6×8×8×14)目标冲突,色板/昼夜 tint 要改 uniform |
| **B 参数化 Graphics（推荐）** | 用 Pixi `Graphics().poly().fill()` 按参数画 base/floor/roof/attachment,颜色走 tint uniform | 天然支持积木组合+程序化变异(P7)+昼夜 tint;工作量大但正对 M4 目标;原型观感需逐件校准 |
| C 混合 | 岸线固定件(码头/灯塔)光栅化,建筑/scatter 走 Graphics | 折中 |

**M1 首轮**用 A 保连续(先把画面搬上 Pixi 不崩),**M4 切 B** 做真积木。此子决策 M4 动工前正式定稿。

---

## 6. 各里程碑内部待定子决策（不阻断当前,到点再定）
- 相机/pan-zoom 交互模型（M1）
- `nightT` 时间线 vs `t` 滑杆的收敛方式（M3）
- claim 楼层/共识(roof)阈值公式（M4/M6）
- 资产 A→B 切换的逐件校准清单（M4）
- LOD Z1 的 EpistemicState 预折叠粒度（M7）

---

## 7. 动作项 / 修订执行序列
1. **[本轮] 补 `DECISIONS.md` 条目**：记录"L1 从 SVG 迁 Pixi,反转 slice-1 D-xxx；理由=场景升级需 shader/粒子/深度排序;SVG 资产分阶段重制"。（待你确认本文件后我写入 source-of-truth）
2. **[本轮交付后] M1 技术设计**（执行要求 §9.2 首份交付）：五层容器代码结构、`isoDepth` 实现(K×高差×屏幕 Y 偏移验证)、chunk 缓存策略、相机状态、scene model 统一落点、帧率基线方案。
3. **M4 动工前**：高差+密度环带算法设计 + 36+ 原语参数化清单（名称/语义/所属 biome/变异维度）+ `projectClaimState` 设计 + 资产 A→B 定稿。批准后批量产。
4. 逐里程碑交付,不跳步(§9.4)。

---

## 8. 需要你确认的两点（很小,确认后即进 M1）
- **(a)** 我现在把动作项 1 的 `DECISIONS.md` 条目写进 source-of-truth,可否？
- **(b)** 本修订计划整体 OK 否？OK 我就开 M1 技术设计。

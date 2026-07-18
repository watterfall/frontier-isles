# 岛内分区 × 建筑楼层 × 结构穿越：纵深世界合同

_2026-07-18 · implementation authority for the current vertical slice_

## 1. 这次新增的不是第五级世界地图

现有世界已经有一套明确的制图层级：大陆 → 命名区域 → 岛 → 站点。这里新增的“区域”只存在于单座岛的 L1 内部，因此代码与数据统一称为 `district`（岛内分区），不复用 world `region`。

这次纵深由三条互相咬合的路径构成：

1. **岛内横向深度**：渡口、问域、档案域、作业域、瞭望域组成一张可勘察的岛内图。
2. **建筑纵向深度**：站点内部按真实内容拆成非重叠楼层；楼层是空间化索引，不是重复分页。
3. **结构斜向穿越**：活跃结构在分区和楼层间画出一条跨学科穿越线；只有 `rebuild` 映射才能成为结构⇄岛的图边。

## 2. 岛内分区模型

固定功能骨架只有五类，名称与空间气质随 xfrontier 主题族变化：

| District id | 不变的研究功能 | 典型站点 | 可能的地方名 |
|---|---|---|---|
| `harbor` | 到达、人员、渡航 | dock, tearoom | 潮汐渡口 / 共证埠 |
| `inquiry` | 问题、分歧、改写 | questions, canvas | 雾问坡 / 假设场 |
| `archive` | 文献、证据、测量 | library, data | 空白档案馆 / 观测仓 |
| `works` | 原型、失败、移植 | workshop, driftwood | 移植工场 / 异常哨站 |
| `observatory` | 结果、远景、结构缺口 | gallery | 未知瞭望台 / 孪生塔 |

### 2.1 xfrontier 主题族

当前线上 `xfrontier.science`（build `2b8c551da5b6`）包含 1,477 条记录、53 个双语簇、9 个维度、13 个排名视角。产品不把 53 个簇直接搬进一个筛选器，而把它们压缩为六个空间程序：

- `unknowns`：无知测绘、异常驱动、缺席/负空间、开放探索；
- `sensing`：分布式传感、环境组学、行星/深时观测；
- `commons`：机器可读科学、形式科学、开放/去中心科学、知识基础设施；
- `transfer`：跨域方法移植、复杂系统、组合式建模；
- `simulation`：数字孪生、因果世界模型、自驱实验；
- `living`：活体/物理计算、生物电、合成生命与材料。

岛的现有 `atlas.cluster` 文本决定首选主题；无匹配时按 domain + 稳定 slug hash 选择，不写回数据、不宣称新的学术分类。

### 2.2 “解锁”到底表示什么

解锁只表示访问者在自己的 field notebook 中**勘察并揭开一块既有地方**，不表示研究取得进展，不写 OPP ledger，不产生 XP。

每个分区投影为三态：

- `surveyed`：已由当前 notebook 勘察；
- `available`：真实材料与前置路径已满足，可以勘察；
- `sealed`：仍缺前置勘察或岛上还没有对应材料，并明确显示原因。

可用性信号只来自：QFocus/depth、真实 ledger action、citation/literature、rich interior、岛的 growth/status、已完成 passage、当前活跃 structure。默认路径为：到达 Harbor → 可勘察 Inquiry → Evidence/Work signals 分别开启 Archive/Works → 已形成足够路径后开启 Observatory。

## 3. 建筑楼层模型

所有生成岛都应至少能打开一个真实的建筑基底层。12 个 rich-interior 岛在此基础上继续展开多层。

楼层内容来源优先级：

1. 当前岛的 typed `IslandInterior`；
2. `depth`、QFocus、brief、citation/literature；
3. 真实 ledger 聚合读数；
4. 当前结构对象与本地 passage receipt。

不同站点的分层语义：

- 问题墙：主问题 → 开放问题 → 改写/分歧 → 暂结问题；
- 文献阁：引文门厅 → 每 2 条 digest 一层论证书架；
- 白板厅：核心张力 → 每个 debate 一层议场；
- 数据台：ledger/score 测站 → 每 2 条数据一层；
- 实验坊/散木园/茶寮/展厅：基底说明 → 每 2 个真实工件/交流/展项一层；
- 渡口：到达层 → 人类/治理 AI 值守层 → 活跃结构的“穿越层”。

楼层 id 必须由 station + source indexes 稳定生成；访问记录写入 notebook，但不会转成 ledger progress。一个楼层的内容不得在同一建筑的另一层重复。

## 4. 结构主题与来源

`StructureObject` 新增可选字段，保持旧 Markdown 可读：

- `theme`: 六个结构主题之一；
- `provenance`: source URL、xfrontier record ids、reviewed date；
- `isomorphism`: 旧 seed 的 ISO handle（可选）。

首轮目录从 3 个扩为 8 个：

- collective dynamics：同步、网络级联、标度（标度继续保持无映射纯前沿）；
- causal inference：干预可识别性；
- unknown mapping：异常即信号；
- knowledge commons：可执行知识公地；
- living computation：基底局部学习；
- simulation twins：模型—现实闭环。

新增 seed mapping 只落在已核对过的当前岛：`causal-rep-learning`、`anomaly-as-signal-cross-domain`、`collider-anomaly-detection-transplanted-to`、`formal-math`、`compositional-modeling`、`self-learning-matter`、`cell-digital-twins-virtual-cells`、`differentiable-manufacturing-simulation-gradient-based`。每条都必须包含 quantity correspondence 与 falsifiable prediction。

## 5. 持久化与迁移

field notebook 从 v2 升为 v3，新增：

- `surveyedDistricts: Record<islandSlug, DistrictId[]>`；
- `visitedBuildingFloors: Record<islandSlug:station, floorId[]>`。

v1/v2 安全迁移为空记录；导航仍从 L0 安全启动。进入生成岛时自动登记 `harbor` 已到达，其他分区只能通过显式勘察动作登记。

现有数据库启动时需要幂等 reconciliation：更新已知 seed structure 的目录元数据；只在缺少相同 structure/island edge 时补 seed mapping，绝不重复 `rebuild`。

## 6. 交互与可访问性

- 岛内图使用柔和水墨分区和路径，不画硬多边形疆界；同时提供完整列表 twin。
- `available` 分区是原生 button；`sealed` 明示原因；键盘与触摸都能勘察并进入建筑。
- 楼层抽屉使用 `role=dialog`、真实关闭 button、Escape、初始/返回焦点、方向键/Home/End 切层。
- Floor cutaway 是垂直建筑剖面，当前层有清楚的墨线与印章，不使用 RPG 等级、徽章或百分比完成度。
- reduced motion 取消抽屉/雾层位移，只保留即时状态变化。
- 桌面提供完整探索；现有 mobile shell 继续明确为只读浏览，不暗示移动端写入。

## 7. 验收门槛

1. 在任一生成岛可看见岛内图；完成至少一条 Harbor → Inquiry → deeper district 勘察路径，刷新后仍保留。
2. 在 rich-interior 岛打开至少三层建筑，每层内容不同；在无 rich interior 岛也能打开基底/证据楼层。
3. 选择结构后，岛内图和至少一个建筑显示结构穿越语境；取消结构后消失。
4. Structure Lens 能按主题理解 8 个结构，并显示 xfrontier 来源；图边仍与真实 rebuild 完全一致。
5. v1/v2 notebook 均可迁移；坏数据被裁剪，不破坏启动。
6. focused tests、全量 tests、逐包 typecheck、production build、数据边界检查、桌面/390px live browser、keyboard/night/reduced-motion/console/overflow 全部给出精确结果。

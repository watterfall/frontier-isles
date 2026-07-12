# 学科打通(执行纲要 §九)— 执行设计 Spec

日期:2026-07-12 · 状态:已与发起人对齐,待实现
上游:`~/Downloads/Frontier-Isles_结构层_执行纲要.md` §九 · `~/Downloads/问题群岛_结构内核_项目需求定位说明_v1.md`

---

## 0. 一句话

先把材料扩充到能撑起体系(53 聚类全覆盖 + 文献层),再让「结构 ⇄ 现象二部图」长在账本上:结构成为知识平面一等对象,`rebuild` 事件铺边,atlas 结构透镜点亮已重建的岛、以虚线诚实标出缺口——**图的缺口 = 前沿,学习与研究的分界第一次可见**。

## 1. 已拍板的决策(发起人确认,2026-07-12)

| 决策点 | 结论 |
|---|---|
| 顺序 | **材料先行**:「只有这些材料更充足的时候才能构建起来体系」 |
| 材料形态 | **全聚类覆盖 + 文献层**(78→约 155 岛,每岛完整 evidence 文献,问题墙 3-5 问,聚类大问题上海域) |
| 结构的身份 | **知识平面新对象**(自有 id,`.md` 可往返,portable) |
| 边的承载 | **opp 新增 `rebuild` 动词**(协议 0.2→0.3,解析器向后兼容) |
| 缺口呈现 | **点名缺口岛,虚线诚实**(只标「没有边」的事实,映射一个字不给) |
| 两点强调 | ① 领域方向的选择要**比较性策展**,不是机械过滤(→ §3.1);② 可视化/形象化与现有体系的**融合要深入设计**(→ §5) |

## 2. 目标与红线(溯源)

- **目标**:兑现纲要 §九 的三个判断——学科距离由迁移测出(非分类)、图缺口=前沿可见、打通是走出来的路。
- **红线 1(§六.1)**:映射只能人做。协议与网关层面锁死,不靠自觉:agent 发起的 `rebuild` 一律降级为 dock 提案。
- **红线 2(§五警告)**:结构不是学科之上的分类标签。数据模型里 structure 与 domain 互不隶属,结构只作为横切透镜存在。
- **红线 3(inv 14/15 同构)**:no edge without event——透镜是账本的 reduce,不存在「画一条线」的工具。
- **红线 4(inv 7)**:透镜呈现「存在」,永不呈现排名。
- **硬约束(§八)**:沿用本体一切(两平面/账本/网关/投影/atlas),不另起炉灶。

## 3. Phase 1 — 材料扩充(branch `feat/atlas-full-clusters`)

源料:`/Users/jili/AIAI/frontier/audit/`(repo `watterfall/frontier-atlas`)——`atlas_data.json`(1481 记录 × 9 维分)、`cards/*.json`(双语深评)、`evidence.json`(真实引用)、`cluster_questions.json`(聚类大问题)。**一切有据,零编造。**

### 3.1 领域方向的比较性策展(发起人强调点 ①)

不是「跑一遍过滤器」,是一次可审计的策展:

1. **补缺优先**:现 34/53 聚类有代表,先补齐缺席的 19 个聚类;每聚类 ≥2 座,目标总量 ~155(Pixi atlas 已在 N=200 档验证)。
2. **聚类内比较**:候选按 9 维分向量比较,优先 范式(s₀)∧ 交叉(s₁)∧ 洼地(s₈)高者;硬条件 has-card ∧ has-evidence。
3. **域间均衡**:沿用编辑性 cluster→domain 映射,四域 ±10%。
4. **结构预埋(轻权重)**:同步/标度/网络级联的经典基质(电网、心律、城市标度、幂律、级联失效)在候选**同分时**优先——只做平票裁决,不为结构硬造选择。
5. **候选清单先落盘**:选择结果输出为对照表(聚类 × 入选记录 × 9 维分 × 落选原因示例)供发起人抽查,**通过后**才跑成文子代理。

### 3.2 数据模型扩展(`packages/data`)

- `FrontierEntry.literature: {title; venue; year; url}[]` — 来自 evidence.json 全量源(缺 venue 以 URL host 兜底)。灌入岛内文献阁 + `problem.md` 参考文献节(§6 leavability:文献随 `.md` 可带走)。
- `FrontierEntry.depth.subQuestions` 扩到每岛 3-5 问 — 从 cluster_questions + cards 深评 grounded 提炼。
- 聚类大问题 `{q, whyMatters, ifAnswered}`(双语)挂到命名海域(regions)的 detail 面板 — 「岛屿方向里面的问题」在 T1 可见。

### 3.3 管线纪律

沿用已验证管线:筛选 → grounded packets → Sonnet 子代理成文(**只成文,不发明**)→ merge 脚本。merge 非幂等:重跑前 `git checkout HEAD -- frontiers.ts`。

### 3.4 测试影响(计数敏感,逐一更新)

`fallback.test`、`server.test`(岛计数 ×2)、`MobileShell.test`(≤8 anchors + satellites)、`archipelago.test`(band + roster 快照 `-u`)、`despace.test`(N 变更后的 SVG fallback 判定)。CJK 快照走 Bash 门禁(zh_CN full-ICU),不在 ctx 沙箱跑。

**验收**:53 聚类全部点亮;任抽一岛,文献阁有 ≥1 条真引用、问题墙 ≥3 问;`pnpm -r test && pnpm -r typecheck` 绿;`problem.md`/`ledger.jsonl` 往返测试绿。

## 4. Phase 2 — 结构体系(branch `feat/structure-rebuild`)

### 4.1 opp 0.2 → 0.3(`packages/opp`)

- **StructureObject**:`struct://<org>/<slug>`;字段 `schema:"opp/0.3"` / `id` / `title`(编辑态 zh + en gloss,invariant 9)/ `statement`(规律一句话)/ `status` / `license`。`.md` 序列化 + parser 往返测试。
- **`rebuild` 动词**:`ActionType` 增 `"rebuild"`。事件长在**岛的账本**上(`op` = 岛 id),`ref` 指向内容寻址的**映射 artifact**(JSON:结构 id + 人写的量对应表 + 检验记录引用,存 `refs` 表,事件永不内联内容)。
- **兼容**:0.3 解析器接受 0.2 旧账本;发出一律 0.3。往返/verifier 测试随动。

### 4.2 Server(`apps/server`)

- `structure_objects` 表(知识平面,与 place plane 严格分流)。
- `GET /api/structures`、`GET /api/structures/:slug(.md)`、`POST /api/islands/:slug/rebuild`。
- **网关红线**:`rebuild` 走 `core.can()` + `degradeAction()`;actor.kind=agent → 降级 dock 提案(night_digest + dock placement)。MCP 工具同步实施(mcp.ts 直连 store,不走 HTTP)。
- **种子**:3 个正交结构字母——**同步(Kuramoto)、标度、网络级联**(定位说明 §10 指定同步为第一颗)——每个配 2-4 条有真实文献背书的映射,以 `rebuild` 种子事件挂到 Phase 1 扩充后的对应岛(电网/心律/城市/级联类)。种子事件 actor 为策展身份(shen-kuo),出处可见。

### 4.3 Core 投影(`packages/core`,纯函数 + 测试)

- `reduceStructureGraph(events, resolveRef)` → 二部图边集 `{structureId, islandOp, weight, actors}`——确定性、序无关(inv 13)。
- `structureFrontier(graph, islands)` → 每结构:已重建岛 + 缺口岛。地图上的缺口收敛呈现:与已重建岛**同聚类或同域**的未重建岛(避免全图虚线噪音);完整缺口集(其余所有岛)在列表孪生里可展开。
- `disciplineDistance(graph, islands)` → 域×域结构重叠密度矩阵。**本期只产出、不驱动布局**——为 invariant 16 的 domain 连续坐标重构留接口(见 memory `domain-partition-rework`),不在本期改气候几何。

### 4.4 Web / Atlas 结构透镜(`apps/web` + `packages/renderer`)

- 图例区结构选择器(复用 FlowLegend 组件模式);选中进入透镜态:
  - 已重建岛:实线点亮(复用 outlier/anchor 高亮态)+ 结构⇄岛弧;
  - 缺口岛:**虚线微光 halo**——只标「此结构尚无人带来」的事实;
  - 其余:压暗(复用 fog/dim 通道);air routes 在透镜态隐藏(被结构弧替换,同为账本事件所生,inv 14 不破)。
- **列表孪生**(invariant 3):结构列表视图,每结构下「已重建 / 缺口」两栏;移动端只读走列表孪生。
- i18n key-parity(UI 串走 `t()`;结构名是编辑内容不翻);离线 fallback 静态结构图(`seaFallback` 同模式)。

**验收**:选「同步」透镜→看见点亮的岛、弧、诚实的虚线缺口;dev-auth 人类账号可发一次 rebuild(带映射)→ 透镜即时多一条边;agent 发 rebuild → 只出现 dock 提案;`pnpm -r test && typecheck` 绿;往返测试绿。

## 5. 可视化与现有体系的融合(发起人强调点 ②,深入设计)

**第零原则:原型 = 唯一视觉权威,禁发明新几何语言。** 透镜的一切视觉都是现有词汇的重组;任何超出重组的新视觉(如结构图腾)必须走 `.design-eng-loop` 回合对照原型,不在本期擅自发明。

### 5.1 视觉词汇映射表(全部复用)

| 透镜元素 | 复用的现有词汇 | 出处 |
|---|---|---|
| 结构⇄岛 弧 | air-route 抬升弧(Pixi mid/near)/ ChartBridge 双描边弧 + label pill(SVG) | `atlas-stage` / `ChartBridge.tsx` |
| 弧的色与线型 | token 色族,不加新 hue(currents 语法:kind→色+dash) | `Current.tsx` `CURRENT_STYLE` |
| 已重建岛 | outlier glow / anchor 高亮态 | `atlas-lod` |
| 缺口岛 | 虚线 halo:dash 词汇(lineage `7 5`)× 「未成」透明度通道(proposed 0.5) | `Current.tsx` 成熟度语法 |
| 压暗 | 气候 fog / dim 通道 | `climate.ts` fog |
| 选择器 | FlowLegend 图例模式 | `sea/FlowLegend.tsx` |

### 5.2 分层与语义规则

- 透镜是**模态图层**:激活时 air routes 隐藏、气候 wash 降饱和、命名海域标签保留(wayfinding 不丢);退出即还原。结构弧与 bridge 洋流因此不会同屏混淆。
- 日夜切换:palette-only(`NIGHT_SCENE_VARS`),透镜元素无形状差异。
- 尺寸/亮度只编码「存在与事件通量」,不编码优劣(inv 7);缺口岛之间无排序。
- 语义自检:虚线 = 「尚无人走过」,永远不能读成「推荐你去」——不加箭头、不加分数、不预填映射。

### 5.3 形象化方向(记录,留给 design-eng-loop 探索,不在本期实现)

- 「同一具骨架」的意象候选:**岩脉**(结构 = 岛群共享的深层矿脉,透镜 = 透视海床)vs **星座**(结构 = 群岛上空的星图,契合「知识平面在天上」的两平面隐喻,与 depth-plan-v1 垂直世界呼应)。
- 二者都超出现有几何词汇 → 各作为一张 design-eng-loop 卡片进入下一轮共进化,由原型侧裁决;本期透镜以 §5.1 重组词汇交付,不阻塞。

## 6. 不做(Non-goals,本期)

- 不改 domain 几何/气候大陆布局(invariant 16 重构留接口、不动手)。
- 不做迁移挑战交互闭环(缺口岛可见但不可一键发起迁移;写作/编辑器不进本期)。
- 不做结构目录管理 UI(铸造新结构 = B4 动作,门槛设计另议)。
- 不冲 400+ 岛规模。

## 7. 风险与对策

| 风险 | 对策 |
|---|---|
| 内容管线幻觉/编造 | 只允许 grounded packets 成文;evidence 缺字段兜底不造;抽查验收 |
| merge 非幂等弄脏 frontiers.ts | 重跑前 `git checkout HEAD --`;策展清单与成文分两步走 |
| 协议 bump 破坏旧账本 | 0.3 解析器兼容 0.2;往返/verifier 测试先行(TDD) |
| 透镜与既有图层视觉打架 | §5.2 模态规则;新视觉一律过 design-eng-loop |
| 结构退化成分类标签 | 数据模型 structure⊥domain;code review 检查项;§五警告写进 PR 描述 |

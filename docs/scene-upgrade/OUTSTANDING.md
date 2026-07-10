# 未收尾清单 — 场景升级 campaign（2026-07-10 收尾快照,含当轮 P1 三项收尾）

> 本次会话收尾时的统一「未收尾」清单,聚合各 Iter 的 Deferred。已上线部分见 `LOOP.md`
> Iter 14–17(接线上 / M5 微动态 / 海即数据 / 名牌 LOD + 信息层级规划),均已合并 main。
> 优先级:**P0 = 应尽快(含本次引入的回归)· P1 = 计划内下一批 · P2 = 更远**。

## 已上线（main @ `9fceb0b`）
- ✅ **接线上**:Pixi 成为生成岛 L1 真渲染器(真账本 → `projectClaimState`);SVG 降为 no-GPU 兜底;站点命中测试。
- ✅ **M5 微动态**:灯窗 twinkle / 魂影 bob / 共识光环 breathe / 昼夜平滑 crossfade(一个 ticker,全数据绑定)。
- ✅ **海即数据 L1**:海深=抽象度(substrate)· undertow=争议度(refuted)· 面板文字解码器。
- ✅ **名牌 LOD**:栅格烘入 → 屏幕空间 billboard Text 层,任意缩放清晰,远印章单字/近全名。
- ✅ **信息层级规划**:`INFO-HIERARCHY.md`(众岛语义 LOD)+ ROADMAP §3.11 指针。
- ✅ **Bundle 代码分割**:live L1 用 `React.lazy` 懒加载 `PixiScene` + `<Suspense>` → 主包 **339→182KB gzip(−46%)**,Pixi(156KB)独立 chunk,进岛才载;L0 海图不再付 Pixi 代价。真岛 e2e 验证无损。

## 已上线（本轮,worktree `agent-a5f90f16a5da12ee9`）
- ✅ **名牌 i18n**:`PixiScene` 新增 `lang` prop,标签全名走 `localizeStation(kind, lang)`(印章保持语言中立)。核对 architecture.md §9 后确认站名是 glossary 词条(load-bearing translation term),不是 CLAUDE.md 排除的编辑内容 —— 做的是完整 zh/en 翻译,不是仅辅助文案。语言切换会重启一次 Pixi scene(同岛切换代价)。`apps/web/src/__tests__/stations-i18n.test.ts`。
- ✅ **per-station 垂直配准**:新建 `apps/web/src/scene/stationAnchors.ts`(纯函数,已单测),每站的贴图锚点从各自 SVG 的 `--shadow` 椭圆(或等价标记)推导,不再共用 Workshop 的锚点。**顺带发现并修复一个更严重的同源 bug**:渡口(Ferry Dock)的桩桥/小船用的是绝对设计画布坐标(非各站通用的局部偏移),共享锚点导致它烘焙进纹理时整个落在 320×320 画布外——真实 L1 里渡口站是完全不可见的。用 `?scene=pixi` + 全局 Playwright 截图(见 LEARNINGS.md 方法)在改前改后各截了图核实,不是凭空猜的数值。副作用修复:问题墙修正后屋顶更贴地,原先按统一 `height:30` 摆放的名牌会压住屋顶尖,已改用每站自己 `<NameCard>` 的 `y`(艺术家已经解好的"名牌离屋顶多高")算出per-station clearance。`apps/web/src/__tests__/stationAnchors.test.ts`。
- ✅ **M8 微动态第二批(部分)**:炊烟 + 旗帜摆动。新增 `core.projectActiveStations`(复用 `projectGrowth` 的 `ACTION_STATION` 表,§4/§3 一致)判定"哪些站点账本近期有活动"。`SceneStage` 在同一个 M5 ticker 里加两个数据绑定动效:①实验坊仅当 `active` 时冒 3 个上升渐隐的烟团(位置取自 `StationWorkshop` 自己 SVG 的烟囱坐标);②数据台仅当 `active` 时旗面 `skew.x` 轻摆(位置取自其 SVG 自己的旗杆坐标)。两站的静态资产各加一个开关(`showSmoke`/`showFlag`),active 时烘焙**不带**静态那份,保证任意时刻只有一份旗/烟可见。用 `page.evaluate` 直接读 Pixi 场景图核实了烟团位置/透明度衰减与旗面 `skew.x` 非零(比截图更可靠)。**诚实缺口**:`data`(数据台)在协议里没有专属账本动作(`ACTION_STATION` 无 `data` 映射),所以旗子摆动机制是对的、已单测,但**真实账本目前永远触发不了它**——`projectActiveStations` 的文档和 `packages/core/test/active-stations.test.ts` 都显式记了这点,不是隐藏的坏味道。`packages/core/test/active-stations.test.ts` + `apps/web/src/__tests__/layout.test.ts`。
- ✅ **M8 微动态第二批 · 萤火**(worktree `agent-aeb6fe26510b0689f`):每个 `active` 站点(`SceneObject.active` ← `core.projectActiveStations`)上空 3–6 只萤火,`ParticleContainer` 生成、复用一张微光纹理。放进 `lightsLayer`(继承夜间门:该层 alpha = `nightLights(t)`,与鬼影同一 day0/night1 门),骑现有 M5/M8 动态 ticker,夜间才动的性能门。数据读法=「这里近期有人在干活」。数量/位置由站点 `variant` 种子确定。`apps/web/src/__tests__/layout.test.ts`(active 门控)。
- ✅ **海:水深渐变 + 潮圈**(同上 worktree):`sea-mesh.ts` 加离岸径向渐变(reach 绑 `uDepth`=水深/抽象度,不变量 16)+ 贴岸波纹带(振幅/密度绑 tide N=A−D,新 `uTide` uniform,在 `PixiScene` 归一化)。逐像素 O(1),无新增 mask 采样。
- ✅ **地形指纹**(同上):`layout.ts` 每 ground tile 加 `hash(op-id)` 种子的 ±≈4.5% 明度微变(不变量 13 确定性)+ elevation-0 邻海 tile 的 `shore` 沙滩过渡色(`scene-stage.terrainColor`)。build 时算、烘进缓存地形纹理,逐帧零开销。
- ✅ **scatter 稀疏根因修**(同上):M4.5 散布密度原是「只绑环带几何+种子」的常量,与活跃度无关(空岛≈满员学院都约 30 件)。改为 `scatterProb × liveliness`,liveliness 由 stage+eventCount+members 有界合成 → 密度转写活跃度,逐 tile 掷点仍种子确定(更密=严格超集)。

---

## P1 · 计划内下一批（L1 丰富度 + 交互补全）
- **样板英雄岛未接 Pixi**:`machine-curiosity` 仍走 bespoke SVG `Scene`(默认入口就是它)。要么接 Pixi 统一,要么明确它是 SVG 手绘 hero 的定位。
- **claim 点击接面板**:现仅站点 `station:*` → `onStation`;claim 塔点击未接 detail 面板。
- **夜市灯**:萤火已上线(见上);夜市摊灯(集群夜间灯串)仍未做,需一套摊位附件原语。
- **名牌近景第三层**:near-zoom 加站点状态 / 工件数(现两层:印章↔全名)。
- **数据台(Data Bench)缺专属账本动作**:`core.ACTION_STATION` 没有映射到 `data` 的 verb,导致「数据引用」这个站永远不会被 `projectActiveStations`/学院阶段判定为「触碰过」。补一个 dataset 相关的 action(或明确复用 `submit_claim` 的 ref role)才能让数据台的旗帜摆动 / 未来任何 `data` 数据绑定动效真正在真实账本上触发。
- **hasDoi 未穿到 SceneObject**:claim 印章现全「预印开口」,DOI 灯牌态缺数据源穿透。

## P1 · 数据 / 内容
- **seed 账本 claim/validate 极稀疏**:全岛最多 1 submit+1 validate → 真岛几乎无高塔/共识屋顶,claim 生长满量程只在 demo 手造账本可见。需 seed 更多跨岛 validate,或等真实使用。

## P2 · 众岛 L0（Phase C,见 `INFO-HIERARCHY.md`,当前 L1 升级收口后排期）
- **C1 相机地基**:L0 换 PixiJS 引擎 + zoom/pan 相机 + de-overlap 布局。
- **C2 语义 LOD**:3 层制图泛化 + variance-select 剔除 + **billboard 去碰撞名牌**(扩本次 L1 label 层,加冲突检测+优先级降级)。
- **C3 聚合聚焦**:archipelago 群岛聚类渲染 + My Harbor 我的港湾入口 + 雾化。
- **关系层 rework(§3.10)**:被隐藏的洋流/漩涡/海峡按 **on-demand lens**(非 always-on)复活,与 LOD 同源,并入 C2 之后。

## P2 · 海即数据深化
- **L1 洋流(flowline)**:**需先走 design-eng-loop 设计回合**(Fable 明确:单岛 iso 海上画洋流无源会退化成边缘符号)。归 Phase C 关系 rework。
- **climate hue 流形插值**:现单域平铺,未做域向量连续插值。
- **archipelago / confluence / strait / trade-wind**:L0 spec + sea-math 已建,未渲染。

## 已知诚实缺口（非 bug,记录即可）
- substrate 缺失的岛 → 无海深(`seaDepthAt(null)` 返回 0,不假造)。
- undertow 争议度视觉幅度真岛偏淡(通常单 refute)。
- headless 浏览器验收走全局 playwright(`~/.npm-global`)自截,MCP 后端会在 WebGL 页 wedge(见 `LEARNINGS.md`)。

# LOOP — 等距场景升级 campaign (M1–M8)

Goal:       系统化落地等距场景升级 M1–M8，让每一维视觉变化绑定一维账本数据（视觉即信息）
Decisions:  [M0 已拍板] D1 全迁 Pixi（L1 上 WebGL，反转 DECISIONS「L1=SVG」，需补 DECISIONS 条目 + SVG 资产全部重制）· D2 分层建筑（station=civic 固定 6 栋 + claim 走新 projectClaimState 投影生长）· D3 先修订计划再交 M1
Done-when:  每个里程碑各自的验收基准通过 + loop-engineering §2b 质量门（证据/测试/真跑/无回归/文档同步）
Boundaries: 不违反 architecture §7 不变式（无 XP/排行榜、账本永不 GC、AI 从不 push、list twins）；每次 run 只推进一个里程碑；平台切换 / SceneGraph schema 变更 / 新增账本 verb / 触碰 §7 → 一律 escalate 先拍板；只研究参考项目逻辑不复制资产；不 port 原型内部实现只对齐渲染输出
Budget:     M0 前置评审 ≤ 本轮；每里程碑预算于该 run 开头钉定
Deferred:   —
Learnings:  见 LEARNINGS.md。本轮承载原则：现状 L1 是 SVG 非 Pixi（Pixi 引擎已建未挂载）；账本 append-only 且已有 refute+return_to_driftwood 可作鬼影数据源；建筑现为岛级 station 非 per-claim

## Iter 0 — 2026-07-09（M0 前置评审）
Orient:   3 个并行 mapping agent 摸清渲染/账本/资产三面。头号发现：线上 L1=纯 React SVG（Scene.tsx:125 硬编码多边形），计划全为 Pixi 而写；Pixi 引擎 IsoStage 已建从未挂载。账本确认 append-only 永不 GC，refute+return_to_driftwood 已投影为夜景鬼影（projections.ts:174-177），无 abandon verb 但无需新增。iso 数学零高差（iso.ts:44 无 z），K×高差为净新增。建筑=岛级 station，无 per-claim 验证态。
Move:     产出 DEVIATIONS.md（8 条偏差，含 3 点名雷区逐条）+ 向用户 escalate 2 个总开关（渲染平台 / 建筑实体语义）+ 1 个下一步问题 — 假设：平台与语义是决定整份计划形态的前置,不拍板就动手会返工。
Verify:   DEVIATIONS.md 写入 docs/scene-upgrade/；三雷区均有 file:line 证据支撑；AskUserQuestion 抛出 Q1/Q2/Q3。
Decision: escalate（§4 escalation 是一等成功）— 等用户确认平台/语义后再定稿修订计划并交付 M1 技术设计。

## Iter 1 — 2026-07-09（M0 修订计划）
Orient:   用户拍板 D1 全迁 Pixi / D2 分层建筑 / D3 先修订计划。已钉入 LOOP header。全迁 Pixi 反转 DECISIONS「L1=SVG」且需重制全部 SVG 资产——最大成本,已在修订计划点名。
Move:     产出 PLAN-v2.md（对齐后唯一权威）：目标数据管线、scene model 统一(IslandScene 收敛)、SceneGraph schema 增量(dayVisibility 等)、M1–M8 逐条对齐、资产 A→B 迁移策略、§7 转真 WebGL 口径、动作项。假设：修订计划是 M1 设计的前置,先对齐再动 M1 免返工(D3)。
Verify:   PLAN-v2.md 写入 docs/scene-upgrade/；不变式合规自检通过(纯投影/渲染层,无新 verb,账本不动)；向用户抛 2 个小确认(写 DECISIONS 条目 / 计划整体 OK)。
Decision: escalate（2 个小确认）→ 确认后：写 DECISIONS 条目 + 开 M1 技术设计。

## Iter 2 — 2026-07-09（M1 技术设计交付）
Orient:   用户确认全迁 Pixi + 要求用官方文档强化 + Pixi 呈现等距。拉了 Pixi v8 权威文档(Context7 /pixijs/pixijs)：RenderLayer 解耦渲染顺序、isRenderGroup vs cacheAsTexture、Filter.from 自定义片元、Mesh+Shader.from、ParticleContainer。读了现有 IsoStage(stage.ts)——单 world 容器，已具相机/剔除/worldToScreen/sortableChildren，演进不重写。
Move:     (1) DECISIONS.md 补第 9 条 + 标注第 3 条被 supersede(§2b docs-in-sync)。(2) 交付 M1-DESIGN.md：五层容器树(sky/scene(cameraRoot:sea/world/fog)/ui + toneFilter)、render(sceneGraph,viewport) 契约、isoDepth 公式 depthKey=rowSum*1000+elev*8+bias+gx*0.01 含「不跨行」证明(48× 裕度)+屏幕 Y 抬升、cacheAsTexture 地形缓存、PixiSceneHost 相机/React 集成、SVG→纹理迁移连续性、帧率基线。假设：M1 只做层序+深度+缓存+相机+基线，高差几何/shader/昼夜/积木留 M2–M4 接口。
Verify:   M1-DESIGN.md + DECISIONS 第9条写入。K 值不跨行证明用算术闭区间自证([R*1000,R*1000+21) vs (R+1)*1000)。验收对照表逐项落点。待用户 review M1 设计后进 M1 实现。
Decision: escalate（§9.4 逐里程碑交付，M1 设计需 review）→ 用户批准后按 §9 交付物清单实现 M1。
Deferred: layout v0 的 station→gx/gy 映射细节；ELEV_STEP/TIE 终值；toneFilter 实现方式(M3)。

## Iter 3 — 2026-07-09（M1 实现）
Orient:   用户「没问题」批准 M1 + 要求发挥 Pixi 优势、官方 skills、Pixi 呈现等距。按 §9 交付物清单 TDD 实现。
Move:     实现全部 5 项交付物 — (1) iso.ts: ELEV_STEP + worldToScreenElevated；scene.ts: isoDepthKey(K_ROW/K_ELEV/bias/TIE)+SceneGraph/SceneObject 类型+visibilityAt+height。(2) pixi/scene-stage.ts: SceneStage 五层(sky/sceneContent→cameraRoot[sea/world/fog]/ui)+render(graph)+setDayNight+相机+cull+等距立方块 drawIsoBox+biome 着色；改按需渲染(autoStart:false + redraw)。(3) web/scene/layout.ts: buildSceneGraph 纯函数(地形disc+station环+claim生长+scenery+夜鬼影)。(4) web/scene/PixiSceneHost.tsx: 挂 canvas+相机滚轮/拖拽+昼夜滑杆+HUD+WebGL 兜底。(5) main.tsx: ?scene=pixi 动态 import 隔离挂载。DECISIONS 第9条。PERF-BASELINE。
Verify:   ✅ renderer 54 测(含 depth 10:K 值 50×50 属性证明)+ web 50 测(含 layout 8)全绿；两包 typecheck 干净；无回归。✅ 页面加载零 console 报错。✅ 场景构成纯函数核实:182 objects(terrain 156→1 cache draw call / world 26 逐帧排序)，depthKey 6000→26004(26 行×1000 分带零重叠)。⚠️ 真机 WebGL 帧截图未取得:两套浏览器后端(playwright-mcp/claude-in-chrome)在 live 页面/扩展权限弹窗下 wedge——环境限制非代码故障;dev server 健康(:5173 HMR 中,页面活在用户 Chrome)。
Decision: escalate（§2b「observed working」的视觉那一格被环境挡住）→ 交给用户浏览器自看 http://localhost:5173/?scene=pixi ;若批准扩展权限弹窗我可补截图。M1 功能+纯逻辑达 §2a/大部 §2b;待用户目视确认 + renderMs 记入 PERF-BASELINE 后 M1 收口，再进 M2。
Deferred(M1→后续): 相机边界 clamp/窗口 resize 处理；SVG→纹理桥(M1 用 placeholder 立方块替代,视觉连续性留 M4 真素材);ELEV_STEP/TIE 终值(M4);toneFilter(M3)。

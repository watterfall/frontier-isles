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

## Iter 4 — 2026-07-09（M1 黑屏诊断 + 目视验收收口）
Orient:   用户报「显示不出来」黑屏。systematic-debugging:先拿证据不瞎补。发现真 bug — React StrictMode 双挂载 + 共享 `<canvas ref>`,两个 Pixi App init 同一元素、第一个 destroy(removeView) 摘掉画布 → 幸存者渲染进已摘除 canvas。
Move:     修复:PixiSceneHost 改用容器 div(Pixi 自建 canvas,每 app 一张)+ SceneStage 加 resizeTo 填满。用户仍报黑屏 → 用户要求「直接验证」。装隔离 Playwright(~/.npm-global 全局包 + 缓存 chromium)自跑,绕开 wedge 的 MCP。
Verify:   ✅ **目视实测通过**:canvas 1280×800,HUD objects 182/sorted 26/render 0.1-0.2ms,等距岛+深度遮挡+biome 蓝+claim 高度全对;昼夜路径确认(t=0 无鬼影→t=1 三紫鬼影淡入);零报错。→ 用户黑屏 = 陈旧/卡死标签页(claude-in-chrome 之前 wedge 的那个),非代码。存 day/night 基线截图 + PERF-BASELINE 真实数字。
Decision: **M1 收口 ✅**(§2a 功能 + §2b 质量门含目视全过)。StrictMode/resizeTo 修复 + 基线 + doc 更新提交。→ 待用户开新标签页确认后进 M2 水面 shader。
Learnings: (1) React+Pixi+StrictMode 必须让 Pixi 自建 canvas,禁止共享 ref canvas + destroy(removeView)。(2) MCP 浏览器后端会在 WebGL 页面 wedge → 用 ~/.npm-global 全局 playwright + 缓存 chromium 自跑截图,可靠。已并入 LEARNINGS。

## Iter 5 — 2026-07-09（M2 水面 shader）
Orient:   M1 收口,进 M2。seaLayer 之前是空 Container(占位)。计划验收:动态波光+岸线浪花带+争议暗涌可开关。
Move:     (1) sea-mesh.ts: 世界空间 quad Mesh + GLSL(标准 v8 mesh 顶点 mvp + 自定义 fragment:fbm 波光/glint、岸线 mask 环形采样浪花、undertow 涡流)。(2) SceneStage.buildSea: 地形轮廓渲进 RenderTexture 当岸线 mask(Matrix 映射 world rect→texture)+ 挂 mesh + ticker 动画(app.start())+ setUndertow。destroy 清 ticker/mask。(3) PixiSceneHost: biome 海色 + buildSea 调用 + undertow 切换按钮。类型:Mesh<_,Shader> 泛型(自定义 shader 无 texture)。
Verify:   ✅ **目视实测**(Playwright+chromium 3 帧+点按钮):波光斜向粼光帧间移动、白浪花带贴合不规则海岸、undertow ON 现深色涡流暗斑;零 shader 编译错误。✅ 全量 150 测绿(renderer 54/core 27/web 50/server 19)无回归;两包 typecheck 干净。存 sea/undertow 基线。
Decision: **M2 收口 ✅**(§2a+§2b 含目视全过)。提交。→ 进 M3 昼夜语义视图(全屏色调 Filter + nightT→t 收敛 + 下线命令式条件/双份 sky)。
Deferred(M2→后续): undertow 绑真实 whirlpool/refute 数据(M6);海洋 climate manifold 域色渐变(depth-plan-v2,可 M2.x/M4);水面反射建筑倒影(可选)。

## Iter 6 — 2026-07-09（M3 昼夜语义视图）
Orient:   M2 收口,进 M3。M1 昼夜滑杆只调 alpha。计划:全局色调 Filter + 对象显隐双通路 + 剪影灯窗 + 下线双份素材。
Move:     重构层级:cameraRoot 内 gradedContent(sea/world/fog) + toneOverlay + lightsLayer。先做 tone-filter(GLSL desat/cool grade)罩 gradedContent —— **崩了**(见 Verify)。改用世界空间色调遮罩(深蓝 veil alpha=t·0.66)+ 建筑暖灯窗层(遮罩之上)。tone-filter.ts 删除。
Verify:   🐞 **系统调试**:filter 罩含自定义 Mesh(海面)的容器 → Pixi v8 batcher 崩(`DefaultBatcher.break: reading 'clear' of null`)。二分:移 blendMode(仍崩)→移 cache(仍崩)→移 filter(不崩)→确认 filter 是因。pivot 到遮罩层。✅ 目视实测(day/dusk/night 三帧):t 0→1 平滑压暗冷蓝、剪影+暖灯窗、鬼影淡入、t=0 等于 M2 明亮;零报错。✅ 150 测绿无回归 + typecheck。存 day/night 基线。
Decision: **M3 收口 ✅**(§2a+§2b 含目视;色调用遮罩非 filter,偏离已记 PERF-BASELINE)。提交。→ 进 M4 地形高差+建筑积木化+biome(核心丰富度,最大一块;动工前需交高差/密度环带算法 + 36+ 原语清单 + projectClaimState 设计,§9.3)。
Deferred(M3→后续): 真 color-grade filter(desat/高光保留,待 Pixi 修或换结构);下线 SVG 双份素材(随 Pixi 取代线上 L1,M4);灯光 additive glow(blendMode add 触 batcher 坑,暂用实心暖点)。

## Iter 7 — 2026-07-09（M4 前置设计,§9.3 动工前交付）
Orient:   M3 收口,进 M4(最大一块)。§9.3 明确:M4 动工前交设计,批准后批量生产。不跳步冲代码。
Move:     产出 M4-DESIGN.md:6 子步(M4.1 地形高差/M4.2 建筑积木 36+件/M4.3 projectClaimState/M4.4 Landmark×4/M4.5 密度环带/M4.6 biome 参数包)。含:高度场+海岸噪声+悬崖/河流算法、密度环带、36 原语清单(基座6×楼层8×屋顶8×附件14 + Landmark4,带语义/biome/变异/邻接白名单)、projectClaimState reducer 设计(按 ref 分组→地基/楼层/屋顶/鬼影,绑 validate/refute,无新 verb)、资产 A→B(Pixi Graphics 参数化件)、SceneObject schema 增量。
Verify:   设计文档写入;5 个决策点(子步序/共识阈值3/原语清单/Landmark形态/资产策略)向用户 escalate 批准。
Decision: escalate(§9.3 批准 gate)→ 用户批准/改后进 M4.1。

## Iter 8 — 2026-07-09（M4.1 地形高差）
Orient:   用户批准:按推荐序开工 M4.1,共识阈值=5。M4-DESIGN §4/§7 已改 CONSENSUS_MIN=5。
Move:     layout.ts:加确定性 value-noise fbm(TS)、海岸线噪声(isLand)、高度场 elevationAt→0/1/2、seed 自 slug、建筑 tile 强制为 land(不浮海)、各物件 elevation=场值。scene-stage makeNode:地形=从海平面起的高程柱(drawIsoBox lift0 height=elev*STEP,前裙=悬崖),建筑=台地上盒子(lift=elev*STEP);terrainRoot.sortableChildren=true(悬崖 back→front 遮挡)。
Verify:   ✅ 目视(Playwright):3 级梯台+悬崖面清晰、海岸不规则、建筑坐台地、遮挡正确、零错误、render 0.1ms、objects 176。✅ 150 测绿(更新 layout 测试:地形不再全 elev0,改验有高差);typecheck 干净。存 m4_1-baseline-terrain.png。
Decision: **M4.1 收口 ✅**。提交。→ 进 M4.3 projectClaimState(core 新 reducer,claim 建筑数据源;先有数据再做 M4.2 积木)。
Deferred(M4.1→后续): 坡道 ramp tile(先只做悬崖);河流/瀑布几何(M4.1 未做,可 M4.x/M5);building 崖边微调。

## Iter 9 — 2026-07-09（M4.3 projectClaimState）
Orient:   M4.1 收口。按序进 M4.3(先有数据源再做 M4.2 积木)。共识阈值=5。
Move:     core 新 `claims.ts`:`projectClaimState(events)` 按 ref 分组→foundation(submit/publish)/floors(distinct 他岛 validate,自证不算)/roof(≥5)/ghost(refute→refuted,return_to_driftwood→returned)/hasDoi/activity。无新 verb,合 §7+depth-plan §14。导出 core。layout 接受可选 claims 参数,claim 建筑从 ClaimState 出(楼层→高度,ghost→夜间only),否则 synth 兜底。PixiSceneHost demo 喂 mock 账本(1 共识/1 部分/1 refuted/1 preprint)过 projectClaimState。
Verify:   ✅ core claims 10 测(去重/自证不算/≥5 封顶/鬼影/publish/非claim排除/确定性)。✅ web layout +1 测(claims 驱动高度+ghost)。全量:core 37/web 51/server 19/renderer 54 全绿;typecheck 干净。✅ 目视:c1(5复现)最高塔、c2(2)中、c4(0)矮、c3(refute)白天隐藏——楼高=复现数,看图读状态成立。存 m4_3-baseline-claims.png。
Decision: **M4.3 收口 ✅**。提交。→ 进 M4.2 建筑积木化(36+ Pixi Graphics 参数化件 + 组合器 + 邻接白名单,最大子步)。
Deferred(M4.3→后续): openReview 徽记无对应 verb(暂缺);真实 web 账本接入(demo 用 mock,线上接 ledger 时替换);activity→萤火密度(M8)。

## Iter 10 — 2026-07-09（M4.2 前:战略再评估 + 纹理探针）
Orient:   用户质疑"Pixi 迁移能否复刻并超越原 SVG 效果",拉 Fable 5(model:fable)当 advisor。核心发现:当前世界对象是占位方块,因 scene-stage.ts:52 `TextureResolver` 钩子从没喂过纹理;9 station+11 scenery 资产=0 渐变 0 滤镜,可无损光栅化。
Move:     Fable 5 决策备忘:留 Pixi-core 但**翻掉 PLAN §5**——固定 station/scenery 走纹理精灵,只有 claim(绑数据)做参数化 Graphics。追加 10 条建议(海面 off-thesis 应重定向暖纸数据场 / 拆 M4 让 claim 回报先出 / #3 地形 z-pin 挡不住悬崖 / #5 鬼影被夜幕压暗 / #4 dormancy+boldness 白捡绑定 / 接触阴影+相机缓动快赢 / 金图测试)。用户选"先烘一件验证"。探针:renderer TextureResolver 支持 anchor/scale + 接触阴影;新 bakeTexture.ts(SVG string→canvas→Texture);PixiSceneHost 用 renderToStaticMarkup 烘真 StationWorkshop→喂 resolver。
Verify:   ✅ 目视(Playwright headless): 手绘实验坊(棕顶/米墙/墨线/名牌)替掉蓝方块,站在方块堆中 before/after 一目了然;零 pageerror;render 0.1ms。✅ renderer+web typecheck 干净。存 probe-workshop-day.png。核实 Fable 断言:#5 鬼影压暗=真;#3 地形遮挡=真(代码已标 M4 待办);#6 滑杆重烘=虚惊(setDayNight 走 redraw 非 render);#8 灯错位=真前瞻。
Decision: **纹理探针成立 ✅**——texture-lift 复刻手绘可行。等用户定"这个方案"范围(融合:Pixi-core+纹理 station+claim 收成数据标记 G)后继续。未提交(探针 demo 层,PixiSceneHost/scene-stage/bakeTexture 改动待纳入 M4.2)。
Deferred(Iter10→M4.2): 尺寸+0.15;名牌移 UI 层(现烘进纹理);夜版纹理(NIGHT_SCENE_VARS)+昼夜交叉淡入;批量烘全部 station/scenery;claim→G 极简数据标记试验;金图测试落地;#5 鬼影上发光层;#3 悬崖遮挡 M4 处理。

## Iter 11 — 2026-07-09（照 design-system 纠偏 + claim A+C）
Orient:   G 金板被用户否("肯定不大行,按 Claude Design 设计图来")。**根因:我一直无视 design-system/*.html(22 张设计图=契约)自己即兴**——深青海+灰绿地+金板全是系统里不存在的外来审美。截图看真设计:`21-composed-plate`(暖宣纸+俯视+岛作丘+洋流=有符号关系流+气候色场)、`14-stations`(米墙+彩顶+墨线+软影 iso 建筑)、`18-texture`(#fi-grain 暖纸颗粒)。palettes.ts 实锤:日间 --ground=#E0DBC8 暖奶油、--water=#BCCEDC 淡域水,**非**深青。
Move:     (1) 环境重皮:scene-stage groundTint/biomeTint/placeholderColor + PixiSceneHost SEA_COLORS/background 全按真 token 转暖宣纸。(2) claim 无设计源——用户选 A+C:C 停机版=makeClaimMark 从金板改成 station 建筑语汇(drawIsoBuilding:米墙+claimRoof 域色顶+墨线+接触阴影,楼高←floors,共识加旗),A=写 `.design-eng-loop/claim-brief.md` 推 Claude Design 出真设计。
Verify:   ✅ 目视: 暖宣纸环境一眼是 design-system 语言(probe-parchment-day.png);claim 变小建筑、高楼+旗=共识、与 Workshop 同语言(probe-claimC-day.png)。renderer+web typecheck 干净,render 0.2ms。
Decision: **环境纠偏 ✅ + claim C 桥 ✅ + A brief 交付**。未提交(探针层)。→ 等 A 设计图回流替换 makeClaimMark;继续:海压波光+接洋流/气候(Fable #1)、批量烘 station 纹理、名牌上 UI 层。
Deferred(Iter11→后续): claim vs station 视觉混淆(A 设计解决);海还太"水"(压 shimmer+数据场);8 座 station 未烘纹理;夜版;claim-brief 走 design-eng-loop evolve 回流。

# LEARNINGS — 等距场景升级 campaign

跨 run 累积的、下一轮 Orient 必读的原则。每轮 done 时从该 run 的 LOOP footer 提炼进来。

## 地基事实（已核实）
- **L1 渲染是 SVG,不是 Pixi**。`apps/web` 全程 React SVG（固定 1440×900 viewBox，岛基硬编码像素多边形）。`packages/renderer/src/pixi/IsoStage` 是完整但**从未挂载**的 WebGL 引擎；web 只用了 `sea.ts` 的纯数学。任何"shader/Filter/ParticleContainer/RenderGroup/zIndex"计划元素在现状均不存在。
- **账本 append-only、hash-chained、永不 GC**（唯一写路径 store.ts:341；prev 不匹配→409）。废弃/驳回的可持久原语 = `refute` + `return_to_driftwood`，**已被 projections.ts:174-177 投影为夜景鬼影**。协议共 16 个 verb（opp/src/ledger.ts:20），**无** abandon/deprecate/retract/withdraw，且**无需新增**。
- **iso 数学零高差**（iso.ts:44，WorldPoint 只有 gx,gy）。高差=净新增，需同时改深度键（K>max_elevation）与屏幕 Y 偏移。多格建筑用现成 `anchorDepth`。
- **建筑=岛级**（GrowthStage empty/hut/academy/school，projections.ts:58），**无 per-claim 实体/验证态/复现计数/共识**。计划的"建筑=claim 生长"需新 reducer `projectClaimState`（按 ref 分组），增量、无需新 verb。
- **两套 scene model 不通**：`IslandScene`(网格,renderer,有测试,没人生成/使用) vs `GeneratedScene`(像素 prop 袋,web 在用,无坐标)。P2"Pixi 消费现有 SceneGraph"不成立。
- **domain=数理/物质/生命/交叉**（非计划写的"AI"）。domain 已驱动色板/植被/海洋 climate（DOMAIN_SCENE_VARS / sceneryForDomain / domainToVec）——biome 参数包有半成品。

## M0 拍板决定（已确认，全 campaign 承载）
- **D1 全迁 Pixi**：L1 从 React SVG → WebGL(Pixi v8,挂载 IsoStage)。**反转 DECISIONS「L1=SVG」**（需补 DECISIONS 条目）。**全部 SVG 资产重制为 Pixi**——M1 用光栅化保连续,M4 切 Pixi Graphics 参数化件。App 需新增相机/pan-zoom 状态。
- **D2 分层建筑**：station=6 固定 civic（其一可升 Landmark）+ claim=新 reducer `projectClaimState`(按 ref 分组:distinct 验证岛→楼层,refute→鬼影,共识阈值→屋顶) 驱动生长。增量、无新 verb。
- **D3**：先修订计划(PLAN-v2.md)再交 M1。
- **scene model 收敛到 IslandScene(网格)**；GeneratedScene 逻辑保留但降级为"岛内容清单生成器"喂 layout,不再直接吐屏幕坐标。
- **biome 用仓库 4 domain**（数理/物质/生命/交叉,非计划写的"AI"）。

## Pixi v8 关键 API（M1 设计已核实，Context7 /pixijs/pixijs）
- **RenderLayer**：解耦渲染顺序与场景图父子。对象保留逻辑父级 transform，但按 `layer.attach(obj)` 的层渲染。可 `new RenderLayer({sortableChildren, sortFunction})`。→ worldLayer 唯一排序层的正解。
- **isRenderGroup:true**（`new Container({isRenderGroup:true})`）：transform 上 GPU，适合稳定结构含动画子。**cacheAsTexture(opts)**：静态子树光栅化成 1 纹理，改子后 `updateCacheTexture()`，销毁前先 `cacheAsTexture(false)`。→ 地形床用 cacheAsTexture。
- **Filter.from({gl:{fragment[,vertex]}, resources:{uniforms}})** 自定义片元；**ColorMatrixFilter**。容器 `.filters=[...]` + `.filterArea`。→ 全屏色调(uniform uT=t)。
- **Mesh** = `new Mesh({geometry:MeshGeometry, shader:Shader.from({gl:{vertex,fragment}})})`。→ seaLayer 水面(M2)。
- **ParticleContainer({dynamicProperties:{position,rotation,color,...}})**。→ M5/M8 粒子。
- 现有 `IsoStage`(renderer/src/pixi/stage.ts)：Application v8 async init、单 world 容器 sortableChildren、worldToScreen 放置、anchorDepth zIndex、panTo/zoomTo(含缩放锚点)、ChunkIndex+cull 剔除、renderThumbnail(extract.base64,L0 用)、assertWebGL 兜底。**演进成 SceneStage 五层，不重写。**

## M1 设计已定（M1-DESIGN.md）
- 五层容器：skyBackdrop(屏幕空间) / sceneContent(挂 toneFilter) → cameraRoot(相机变换)[seaLayer Mesh / worldLayer RenderLayer 唯一排序 / fogLayer] / uiLayer(屏幕空间)。sky/ui 不随相机，sea/world/fog 在 cameraRoot 内。
- **depthKey=rowSum*1000 + elevation*8 + layerBias(床0/对象4) + gx*0.01**；rowSum 多格用 anchorDepth。屏幕 y 抬升 `y-=elevation*ELEV_STEP(24)`，与深度键独立。不跨行证明：带宽 <21 << 行距 1000，48× 裕度。**楼层增长不吃深度预算(只改视觉高度不改基座锚点)。**
- M1 边界：实现+单测公式，但渲染 elevation 恒 0；真高差几何在 M4。
- 渲染契约 `render(sceneGraph, viewport)`，SceneObject 带 layer/depthKey/day-nightVisibility/lodLevel/biome/variant/growth；是 IslandScene 超集(旧测试保绿)。
- 迁移连续性：M1 先 SVG→纹理桥(renderToStaticMarkup→data URI→Texture)，M4 换 Pixi Graphics 参数化件。

## M1 已实现（Iter 3，绿灯待目视确认）
- 交付：`iso.ts`(ELEV_STEP+worldToScreenElevated)、`scene.ts`(isoDepthKey+SceneGraph/SceneObject+visibilityAt+height)、`pixi/scene-stage.ts`(SceneStage 五层+drawIsoBox+biome 着色+**按需渲染 autoStart:false**)、`web/scene/layout.ts`(buildSceneGraph 纯函数)、`web/scene/PixiSceneHost.tsx`、`main.tsx`(?scene=pixi 动态 import)。
- **SceneStage 与 IsoStage 并存**：新类不动 IsoStage(L0 缩略图仍用它)，零回归。
- **按需渲染**：M1 场景静态,`autoStart:false`+手动 `redraw()`(render/setDayNight/cull 末尾),省 GPU 且工具友好。ticker 到 M5 微动态再开。renderMs 代替 FPS 作基线。
- 场景构成(纯函数核实)：DEMO 岛 182 objects(terrain 156→1 cache draw call / world 26 逐帧排序)，depthKey 6000→26004 = 26 iso 行 × K_ROW，**分带零重叠实证**。

## ⚠️ 环境限制：headless 浏览器验证会 wedge
- 本机(mac)**没有** node 版 playwright(/opt/pw-browsers 那条 note 是别的环境);只有 homebrew python playwright。
- **playwright-mcp 与 claude-in-chrome 都会在"持续 rAF ticker + WebGL"页面上 wedge**(等稳定态/权限弹窗永不返回);claude-in-chrome 常卡在扩展侧栏权限弹窗(需用户批准)。→ WebGL 视觉验收改为:(a) 纯逻辑单测 + 无回归 + 零 console 报错 + 纯函数核实构成;(b) 交用户浏览器自看 `http://localhost:5173/?scene=pixi`。改按需渲染(静态页)后工具*可能*不再卡,但本会话未再验证。
- 教训：Pixi/WebGL 前端的"observed working",优先做成**可 node 单测的纯逻辑**(depth/layout 都做到了);GPU 帧留人工或真机确认,别在 headless 后端上 tunnel。
- **✅ 可靠的自助 WebGL 截图路径(已验证)**：MCP 浏览器后端(playwright-mcp/claude-in-chrome)会 wedge,但系统里有**全局 playwright** `/Users/jili/.npm-global/lib/node_modules/playwright` + 缓存 chromium `~/Library/Caches/ms-playwright/chromium-1228`。写 `.cjs` `require('/Users/jili/.npm-global/lib/node_modules/playwright')`,`chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']})`,goto+waitForTimeout+screenshot+抓 console/pageerror。**M1 就是这样目视验收的**,可靠、不 wedge。以后 Pixi 前端验收都走这条。

## 🐞 已修 bug：React + Pixi + StrictMode 共享 canvas → 黑屏
- 症状：`?scene=pixi` 全黑,但 HUD/canvas/render 都在、零报错。
- 根因：`<canvas ref>` 是同一 DOM,StrictMode 双挂载让两个 Pixi App init 到同一 canvas,第一个 `app.destroy(true=removeView)` 把 canvas 从 DOM 摘除 → 幸存 App 渲染进已摘除画布。
- 修复：**让 Pixi 自建 canvas**——传容器 `<div ref>` 给 `init`(`if(!isCanvas) target.appendChild(app.canvas)`),每个 App 一张自己的 canvas,`destroy` 只摘自己那张;`resizeTo:div` 填满+跟随。**Pixi+React 一律禁止共享 ref canvas。**
- 注意：用户浏览器黑屏还常是**陈旧/卡死标签页**(尤其被扩展控制过、wedge 过的那个)——先让用户开新标签页硬刷新,再怀疑代码。

## M2 水面 shader 复用要点(给 M6 雾 shader / 后续 shader)
- **v8 Mesh + 自定义 Shader.from** 可用标准 mesh 顶点(`gl_Position = (uProjectionMatrix*uWorldTransformMatrix*uTransformMatrix)*vec3(aPosition,1)`)——这三个 mat3 Pixi 会自动喂给 Mesh 的 shader,**实测生效**(Context7 那个 `aPosition/100-1` 示例是简化,别学)。把 `aPosition`(=世界屏幕坐标,因 mesh 在 cameraRoot 里)传 varying 给 fragment 做世界稳定采样。
- **类型坑**:`Mesh` 默认泛型是 `TextureShader`(要 `texture` 属性),自定义 shader 用 `Mesh<MeshGeometry, Shader>`。
- **uniform 组**:`Shader.from({gl:{vertex,fragment}, resources:{ grp:{ uX:{value,type:'f32'|'vec4<f32>'} }, uSampler: tex.source }})`;运行时改 `shader.resources.grp.uniforms.uX`。
- **地形轮廓当 mask**:`RenderTexture.create` + `renderer.render({target, container: terrainRoot, transform: Matrix(world rect→texture), clear:true})`,fragment 采样 alpha=land。**M6 Trust Fog 同法**(按 claim 争议区域生成 mask)。
- **动画**:init 用 `autoStart:false`(静态省电),需要动画时 `app.ticker.add(cb)+app.start()`;cb 里改 uniform,Pixi 自动重渲。destroy 记得 `ticker.remove`。

## 🐞 Pixi v8 坑：Filter 罩含自定义 Mesh 的容器 → batcher 崩
- 症状:`[pageerror] Cannot read properties of null (reading 'clear')  at DefaultBatcher.break → BatcherPipe.buildEnd → Application.render`,canvas 全黑(DOM overlay 仍在)。
- 触发:`container.filters=[filter]`,而 container 子树里有**自定义 Shader 的 Mesh**(M2 海面)。二分确认:blendMode/cache 都不是因,移除 filter 即好。构造期还是 init 期应用都崩。
- 规避(M3 用):**别用 filter 做全局色调**;改**世界空间遮罩层**(cameraRoot 内一个 Graphics 矩形,深蓝,alpha←t)压暗;灯光/发光层放遮罩之上保持亮。同样实现连续昼夜渐变,且保留地形 cacheAsTexture。M6 Trust Fog 若也要 filter,注意此坑(fog 可同样用遮罩/局部 mesh 而非 filter)。
- 附带坑:`Graphics.blendMode='add'` 在 v8 也易触 batcher break;发光暂用实心暖色点,真 additive glow 待查(可能需 `import 'pixi.js/advanced-blend-modes'` 或独立 RenderTexture 合成)。

## M3 昼夜:两通路 + 灯窗(已实现)
- 通路①=世界空间色调遮罩(gradedContent 之上),通路②=对象 alpha(visibilityAt,鬼影淡入)。灯窗=独立 lightsLayer(遮罩之上,不被压暗),alpha=smoothstep(t-0.35)。
- 层级:cameraRoot → [gradedContent(sea/world/fog), toneOverlay, lightsLayer]。tone-filter.ts 已删。
- 下线 SVG `{night?…}` 双份素材 = 随 Pixi 取代线上 L1(M4),现下线破坏线上。

## 方法原则
- 计划为 Pixi 而写、现状为 SVG —— **平台是决定一切的总开关**，先拍板再动，别在错误平台上做 M1 设计。
- 只研究参考项目（arafays/messenger-copy、hexianWeb/CubeCity）逻辑，不复制资产。

## ⚠️ 最大教训：design-system 是视觉契约，禁止即兴（2026-07-09 血泪）
- **症状**：连续三版视觉被否——深青海 GLSL、G 金板数据标记、金塔。用户一句"按 Claude Design 设计图来"点破：我一直**没看 `design-system/*.html`(22 张)就自己发挥**，做出了系统里根本不存在的外来审美。
- **真相**：真设计语言 = **暖宣纸底(#fi-grain)+ 墨线(--ink #3A342B)+ 米墙(--wall #F8F1DE)+ 彩色屋顶 + 软影 iso 建筑 + 海即数据(暖纸+洋流/气候/水深,非写实水)**。日间 --ground=#E0DBC8、--water=#BCCEDC(淡域水),`palettes.ts`/DOMAIN_SCENE_VARS 是真相。
- **规避**：任何场景视觉动手前，**先截图 design-system 相关卡 + 查 palettes.ts/tokens.css 真 token**，逐字用，别调色。Fable #1"海面 off-thesis"正是此坑的独立印证。
- **无设计源的东西不许即兴**：claim="会长楼层的建筑"是升级计划发明,design-system 无此图 → 走 design-eng-loop 补设计(`.design-eng-loop/claim-brief.md`),代码侧只做标注为 interim 的停机版(借 station 建筑语汇)。invariant 6/14：无源即砍。
- **texture-lift 已验证可行**：真 SVG 组件 renderToStaticMarkup → canvas → Pixi Texture 喂 TextureResolver,零报错、0.1ms、手绘质感完整(probe-workshop-day.png)。固定 station/scenery 走此路,别重画成图元。

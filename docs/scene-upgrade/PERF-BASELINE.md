# PERF-BASELINE — 场景升级帧率/渲染基线（§7）

每里程碑追加一行；后续 PR 视觉+性能回归比对。

## 基准设备
- 记录时填：型号 / CPU / GPU / OS / 浏览器版本。（M1 记录环境：macOS Darwin 25.5.0，浏览器待用户侧记录。）

## 指标定义
- **objects**：SceneGraph 对象总数（HUD 显示）。
- **sorted**：每帧参与深度排序的动态对象数 = `world` 层对象（`SceneStage.sortedNodeCount()`，HUD 显示）。地形是 1 个 `cacheAsTexture` 块，不进逐帧排序（§4）。
- **renderMs**：单次按需渲染 `app.render()` 的耗时（`SceneStage.lastRenderMs`，HUD 显示）。M1 场景静态、按需渲染（`autoStart:false`），故用每帧渲染耗时代替 FPS；`renderMs < 16.7` 即等效 ≥60fps 的动画能力。M5 微动态重启 ticker 后改记连续 FPS。

## M1 — 单岛 demo（`?scene=pixi`，DEMO 岛：数理 / stage 2 / eventCount 40）
场景构成（纯函数计算，已核实，非估计）：

| 量 | 值 |
|---|---|
| objects 总数 | **182** |
| terrain（1 个 cacheAsTexture 块） | 156 |
| world（逐帧可排序） | **26**（station 9 + claim 6 + scenery 8 + ghost 3） |
| depthKey 范围 | 6000.01 → 26004.13（26 个 iso 行 × K_ROW=1000，层内小数偏移，**分带零重叠**验证公式） |

- **renderMs**：**0.1–0.2ms**（隔离 Playwright + chromium SwiftShader 软渲染实测；真机 GPU 只会更快，远低于 16.7ms/60fps 门槛）。
- **单岛元素数 ≥ 80**：182 ✓（M1 为 placeholder 立方块，真素材 M4）。
- **视觉基线**：`m1-baseline-day.png`（t=0）/ `m1-baseline-night.png`（t=1，3 个鬼影淡入）——后续 PR 视觉回归比对基准。

## M2 — 水面 shader（同 DEMO 岛）
- seaLayer = 世界空间全屏 Mesh + GLSL（放 cameraRoot，随相机 pan/zoom）；ticker 重启（`autoStart:false` → `buildSea` 里 `app.start()`），仅水面每帧动，地形缓存/对象静态。
- 岸线 mask：地形轮廓渲进 RenderTexture(256×N，alpha=land)，fragment 环形采样(16px×8)判"近岸"→浪花带；坐标全在世界系,mesh 与 mask 用同一 world rect 对齐。
- **验收 ✅（隔离 Playwright + chromium 实测）**：动态波光（斜向粼光 + fbm 噪声，帧间移动确认）；岸线白浪花带精准贴合不规则海岸；**undertow 开关**切换深色涡流暗涌（争议海域，M6/whirlpool 数据后接）。**零 shader 编译错误**。
- 视觉基线：`m2-baseline-sea.png`（暗涌 off）/ `m2-baseline-undertow.png`（on）。
- 帧率：ticker 连续渲染；SwiftShader 软渲染下未记 FPS（真机 GPU：1 水面 mesh + 1 缓存地形 draw call + 26 对象，远够 60fps）。真机 FPS 待用户记录。

## M3 — 昼夜语义视图（同 DEMO 岛）
- **两通路组合**（P3/P4）：① 全局色调 = 世界空间遮罩层（cameraRoot 内、gradedContent 之上、lightsLayer 之下），深蓝 veil `alpha = t·0.66`；② 对象级 `dayVisibility/nightVisibility` alpha 插值（M1 已有，鬼影 t=0→1 淡入）。
- **剪影灯窗态**：`lightsLayer`（遮罩之上、不被压暗）每栋建筑一颗暖光窗，`alpha = smoothstep(t-0.35)` 过 dusk 后点亮。
- **⚠️ 偏离计划的实现**：计划写"全局色调 **Filter**",但 **Pixi v8 的 Filter 罩住含自定义 Mesh(M2 海面)的容器会崩 batcher**（`DefaultBatcher.break: reading 'clear' of null`）。改用**世界空间色调遮罩层**（darken+cool toward deep blue），达成同样的连续昼夜渐变且保留地形 cacheAsTexture。真正的 color-grade filter(desat/高光保留)待 Pixi 修复或换 seaLayer 不入 filter 的结构。
- **验收 ✅（隔离 Playwright + chromium 实测）**：t 0→1 平滑压暗冷蓝、建筑降为剪影 + 暖灯窗、鬼影淡入；t=0 完全等于 M2 明亮全彩(遮罩/灯全隐)；全程无素材替换；零报错。
- 视觉基线：`m3-baseline-day.png`（t=0）/ `m3-baseline-night.png`（t=1）。
- 现存 SVG 双份素材(Scene.tsx `{night?…}`)**未下线**：SVG 场景仍是线上 L1，Pixi 取代它时(M4 完成)一并下线,现下线会破坏线上。

## 验证状态说明（M1）— ✅ 全部通过（含目视）
- ✅ 纯逻辑：depth K 值 50×50 网格属性测试 + worked cases（`renderer/test/depth.test.ts`，10 测）；layout 管线（`web/src/__tests__/layout.test.ts`，8 测）。全绿。
- ✅ 无回归：renderer 54 测 + web 50 测（+ core/server）全绿；两包 typecheck 干净。
- ✅ **目视运行（隔离 Playwright + 真 chromium 实测）**：canvas 1280×800、182 对象、深度遮挡正确、biome 冷蓝色板、claim 楼层→高度、海岸线不规则；**昼夜可见度路径确认**（t=0 无鬼影 → t=1 三个紫色鬼影淡入）；零 console 报错（仅一条无害 WebGL 性能 warning）。
- **复现命令**：dev server `http://localhost:5173/?scene=pixi`（拖拽=平移、滚轮=缩放、滑杆=昼↔夜）。**注意**：若浏览器黑屏，多为陈旧/卡死标签页——开新标签页硬刷新。

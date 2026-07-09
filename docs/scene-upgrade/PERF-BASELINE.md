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

- **renderMs**：_待真机 GPU 渲染记录_（HUD 实时显示；本环境 headless 后端在 live 页面上 wedge，见下）。预期：182 对象 / 26 逐帧排序 / 1 地形 draw call，真机远低于 16.7ms。
- **单岛元素数 ≥ 80**：182 ✓（M1 为 placeholder 立方块，真素材 M4）。

## 验证状态说明（M1）
- ✅ 纯逻辑：depth K 值 50×50 网格属性测试 + worked cases（`renderer/test/depth.test.ts`，10 测）；layout 管线（`web/src/__tests__/layout.test.ts`，8 测）。全绿。
- ✅ 无回归：renderer 54 测 + web 50 测全绿；两包 typecheck 干净。
- ✅ 页面加载零 console 报错（React 挂载 + pixi.js 动态 import 成功）。
- ⚠️ **真浏览器 WebGL 帧截图未自动取得**：本会话两套 headless/扩展后端（playwright-mcp、claude-in-chrome）在持续 rAF/权限弹窗下 wedge——环境限制，非代码故障。改按需渲染后页面已静态、协作。
- **人工验证一行命令**：dev server 已在 `http://localhost:5173/?scene=pixi` 运行 —— 浏览器打开，拖拽=平移、滚轮=缩放、底部滑杆=昼↔夜（拉向 night 时鬼影淡入）。左上 HUD 读 renderMs/sorted/objects 记入本表。

# M1 技术设计 — 层序架构重构（首份交付，执行要求 §9.2）

> 依据：`PLAN-v2.md`（对齐后权威）+ Pixi v8 官方文档（Context7 `/pixijs/pixijs`）+ 现有 `packages/renderer/src/pixi/stage.ts`（演进不重写）。
> 范围：**只做 M1 = 层序 + isoDepth + chunk 缓存 + 相机 + 帧率基线**。高差地形几何、水面 shader、昼夜、积木件在 M2–M4，M1 只为它们**预留正确的架构接口**。

---

## 1. 五层容器结构（P2 引擎无关：坐标/深度/图层/LOD 全在 layout 算完，Pixi 只消费）

Pixi v8 用 `RenderLayer` 把"渲染顺序"与"场景图父子关系"解耦——正对五层。容器树：

```
app.stage
├─ skyBackdrop      Container (screen-space)      —— 全屏天空底 + 色调 Filter 宿主。不排序
├─ sceneContent     Container  ← toneFilter 挂这层(uniform uT=昼夜t)，覆盖 sea+world+fog
│   └─ cameraRoot   Container  ← 相机 pan/zoom transform 只作用这层
│       ├─ seaLayer   Mesh (world-space)          —— 全屏水面 Mesh+GLSL(M2)。不排序，永远最底
│       ├─ worldLayer RenderLayer  ★唯一排序层
│       │    sortableChildren=true
│       │    sortFunction=(a,b)=>a.zIndex-b.zIndex   // zIndex=depthKey(§3)
│       │    ├─ terrainRoot Container(cacheAsTexture)  静态地形床，低 depthKey 带，构建时排一次
│       │    └─ 动态对象     Sprite/Container         建筑/植被/(预留)化身，zIndex=depthKey
│       └─ fogLayer   Container/Mesh (world-space)  —— Trust Fog(M6)。不排序
└─ uiLayer          Container (screen-space)        —— 标签/高亮/面板锚点。不排序，不受 toneFilter
```

**为什么这样分**
- `sky/ui` 是**屏幕空间**（不随相机 pan/zoom）；`sea/world/fog` 在 **cameraRoot 内**（随相机变换）。现有 `IsoStage` 的 `panTo/zoomTo/viewport/cullToViewport` 逻辑（`stage.ts:119-161`）直接搬到 `cameraRoot`，一行不改。
- `toneFilter` 挂 `sceneContent`（不含 ui）→ 昼夜色调只染场景不染 UI（P3 通路 A）。
- **worldLayer 是唯一排序层**（P2/§3）。用 `RenderLayer` 而非普通 sortable Container 的理由：地形块逻辑上归 `terrainRoot`（可被 `cacheAsTexture` 整块缓存），但渲染顺序仍能和动态对象在**同一排序空间**里按 depthKey 交错——这是高差期（M4）悬崖遮挡对象的关键;M1 先只用它排"地形床(低带) < 动态对象"。
- `seaLayer/fogLayer` 显式**不设** `sortableChildren`——杜绝"跨层排序"（M1 验收要求：删除所有跨层排序代码）。

**演进策略**：现有 `IsoStage` 的单 `world` 容器 → 重构为 `SceneStage`，`world` 变成 `worldLayer`，新增另外四层 + `toneFilter` 宿主；复用其 Application async init（`stage.ts:68`）、相机、`ChunkIndex` 剔除、`renderThumbnail`（L0 缩略图，M7/Z0 复用）。**不新建引擎、不丢已测能力。**

---

## 2. 渲染契约 `render(sceneGraph, viewport)`（P2 接口）

layout 层产出 `SceneGraph`，渲染器只消费：

```ts
interface SceneObject {
  id: string;
  layer: 'sea' | 'terrain' | 'world' | 'fog' | 'ui';  // 图层归属，layout 决定
  kind: string;                       // 资产种类键（station/claim/tree/…）
  gx: number; gy: number;             // 瓦片坐标
  elevation: 0 | 1 | 2;               // 海滩/台地/高地（M1 恒为 0，M4 起真高差）
  footprint?: { w: number; h: number };
  depthKey: number;                   // ★ layout 算好的 isoDepth（§3），Pixi 只 zIndex=depthKey
  dayVisibility: number;              // [0,1]
  nightVisibility: number;            // [0,1]
  lodLevel: 'Z0' | 'Z1' | 'Z2';       // M7；M1 恒为 Z2
  biome: Domain;                      // 数理/物质/生命/交叉
  variant: number;                    // P7 变异种子（由 id 派生的确定性 rng）
  growth?: { foundation: boolean; floors: number; roof: boolean };  // 仅 claim 建筑（D2/M4）
}
interface SceneGraph { size:{w:number;h:number}; objects: SceneObject[]; t: number; }
```

- **renderer 侧零计算**：`stage.render(sceneGraph, viewport)` → 按 `layer` 分流到五个容器，`sprite.zIndex = obj.depthKey`，`sprite.alpha = lerp(dayVisibility, nightVisibility, t)`，位置 = `worldToScreenElevated(gx,gy,elevation)`（§3）。
- `SceneGraph` 是 `renderer/src/scene.ts` 现有 `IslandScene` 的**超集**（收敛点，PLAN-v2 §2）。`dayVisibility/lodLevel/biome/…` 是**加字段**，旧字段不动 → `IslandScene` 的现有测试保持绿。

---

## 3. isoDepth 与 K 值（点名雷区 2c — 含证明）

### 3a. 现状与常量
现有：`worldToScreen(gx,gy)={x:(gx-gy)*64, y:(gx+gy)*32}`（`iso.ts:44`，无 z）；`anchorDepth(placed)`=多格建筑取最靠前格 `(gx+w-1)+(gy+h-1)`（`scene.ts:66`）；`compareDepth` 以 gx tie-break（`iso.ts:80`）。常量 `TILE_W=128,TILE_H=64,HALF_W=64,HALF_H=32`。

### 3b. 高差改两处：屏幕位置 + 深度键（互相独立，正是正确性关键）
```ts
const ELEV_STEP = 24;               // 每级高差的像素抬升（设计可调，< 瓦片高 64，保剪影不断）
function worldToScreenElevated(gx, gy, elevation) {
  const p = worldToScreen(gx, gy);
  return { x: p.x, y: p.y - elevation * ELEV_STEP };   // 抬升只改屏幕 y，不改行
}
```

### 3c. depthKey 公式（在 layout 层算，Pixi 只 zIndex）
```
rowSum   = 多格 ? anchorDepth(placed) : (gx + gy)        // 复用现成锚点
depthKey = rowSum * K_ROW
         + elevation * K_ELEV
         + layerBias                                     // 地形床=0，动态对象=OBJECT_BIAS
         + gx * TIE                                       // 同行同高的稳定 tie-break
其中 K_ROW=1000, K_ELEV=8, OBJECT_BIAS=4, TIE=0.01
```

### 3d. 「不跨行串扰」证明（M1 验收硬指标）
> 命题：无论高差/图层偏置/tie-break 取何值，都不会把对象挪进相邻 `rowSum` 的深度带。

固定 `rowSum=R` 时，非行项之和的范围：
- `elevation*8` ∈ {0,8,16}（elevation 0..2）
- `layerBias` ∈ {0,4}
- `gx*0.01`：岛宽上限约 100 格 → ∈ [0, 1.0)

故 `depthKey ∈ [R*1000, R*1000 + 16+4+1.0) = [R*1000, R*1000+21)`。
下一行起点 `(R+1)*1000 = R*1000+1000 > R*1000+21`。
**两行深度带 [R*1000, R*1000+21) 与 [R*1000+1000, …) 永不重叠 ⇒ 高差/偏置/tie-break 绝不越行。∎**
安全裕度 ≈ 1000/21 ≈ **48×**，为 claim 楼层增长（楼层只改视觉高度与屏幕 y，**不改基座锚点 rowSum**，故不吃深度预算）与更多附件层留足空间。

### 3e. 层内正确性（同 rowSum 内）
带内排序 = `elevation*8`（主）> `layerBias`（次）> `gx*0.01`（末）。即：高台地物 > 低地物；同高时动态对象 > 地形床；再同则按 gx。`TIE` 的方向对齐现有 `compareDepth`（impl 时以其为准，避免与已测行为相悖）。

### 3f. M1 交付边界
M1 **实现并单测** `worldToScreenElevated` + `depthKey`（3c/3d 的 case 表进 vitest：跨行、同行不同高、多格锚点、tie-break），但**渲染的地形 elevation 恒为 0**（真高差几何在 M4）。即 M1 证明公式正确、M4 才喂真高差——干净分层，不跳步。

---

## 4. 地形 chunk 缓存策略（§3 "地形静态，RenderGroup 缓存，不进逐帧排序"）

| 选择 | 用法 | 结论 |
|---|---|---|
| `terrainRoot.cacheAsTexture({antialias:true})` | 把整块地形床光栅化成 1 张纹理 → 1 draw call | **选它**：地形是"可再生 place-plane"，仅结构性事件变，几乎恒静。`updateCacheTexture()` 只在岛地形数据变时调 |
| `Container({isRenderGroup:true})` | transform 上 GPU，适合"稳定结构+动画子" | 备选：若地形内含微动态（M5 河流 UV 滚动）则地形床拆两半——静态部分 cacheAsTexture、动态河流单独 RenderGroup |
| 逐瓦片 Sprite 不缓存 | — | 禁止：一岛 ~400 格 diamond = 400 draw call，M1 就爆预算 |

- **chunk 划分**复用现有 `ChunkIndex`（`chunks.ts`，`chunk=8` 格/块）+ `cull(viewport)`（`stage.ts:158`）：视口外 chunk `visible=false`，零绘制——这是 M7/Z1 撑 50 岛的同一机制。
- 地形床构建时**排一次序**（chunk 内 diamond 按 rowSum 预排），运行时整块当纹理，**不进逐帧 sort** ⇒ 逐帧排序对象数 = 动态对象数（建筑/植被），不含地形。§7 "每帧排序对象数上限监控"就监控这个数。

---

## 5. 相机 / React 集成（现状不存在，M1 新增）

- `<PixiSceneHost sceneGraph camera onCameraChange>`：`useRef<canvas>` + `useEffect` 里 `await stage.init(canvasEl)`（复用 `stage.ts:68` 的 v8 async init），`ResizeObserver` 驱动 `app.renderer.resize`，卸载 `stage.destroy()`（`stage.ts:206`）。**严格遵守 App.tsx"所有网络在 client.ts、best-effort、server 缺席也能渲染"**：sceneGraph 由 layout 层从 fallback/seed 数据也能产出。
- 相机状态：`{cx,cy,zoom}` 放 React（受控），映射到 `stage.panTo/zoomTo`（`stage.ts:119/128` 已实现，含缩放锚点保持）。滚轮缩放 + 拖拽平移 + 边界 clamp。
- WebGL 不可用兜底：`isWebGLSupported()`（`stage.ts:31` 已有 `assertWebGL`）为假 → 回退到现有 SVG 场景（迁移期两条路并存，M4 完成后 SVG 场景退役）。

---

## 6. 迁移连续性（避免迁移期白屏）

M1 首轮**不重制资产**（那是 M4）。用 **SVG→纹理桥**保画面连续：现有 React-SVG station/scenery 组件 `renderToStaticMarkup` → `data:image/svg+xml` → `Assets.load`/`Texture.from` → 现有 `stage.add(placed, texture)`（`stage.ts:94`）。得到与今天像素级一致的画面，只是搬上了 Pixi 五层 + 计算式深度。M4 起逐件替换为 Pixi Graphics 参数化件（PLAN-v2 §5 方案 B）。
- 需要一份 **layout v0**：把 6 个 station 从"资产内嵌像素位置"翻成确定性 `gx/gy`（用原型相对位置映射到瓦片环）。够渲染即可；M4 做真密度环带。

---

## 7. 帧率基线（§7 贯穿全程，M1 立基线）
- 基准设备：本机（Darwin/macOS，型号运行时记入 `docs/scene-upgrade/PERF-BASELINE.md`）。
- 指标：`app.ticker` FPS（静止 / pan / zoom 三态）、draw call 数（Pixi renderer 统计 / Spector.js）、每帧排序对象数（§4 的动态对象计数）。
- 对照：迁移前 SVG 场景（DOM 节点数 + 交互帧率）作为 before；M1 Pixi 五层 + SVG→纹理作为 after。后续每里程碑追加一行，PR 视觉回归比对。
- M1 预算目标：单岛静止 60fps（本机）；数据入 PERF-BASELINE.md。

---

## 8. 验收对照（M1 原文验收 → 本设计落点）
| M1 验收项 | 落点 |
|---|---|
| 拆分五层容器，迁移现有对象 | §1 容器树 + §6 SVG→纹理迁移 |
| 删除所有跨层排序代码 | §1：仅 worldLayer 排序，其余显式不排 |
| layout 实现 isoDepth，SceneGraph 携带 depthKey | §2 契约 + §3 公式（layout 算，Pixi 只 zIndex） |
| 验证 K 值 3 级高差不串扰 | §3d 证明 + §3f 单测 case 表 |
| 地形 chunk 化 + RenderGroup 静态缓存 | §4（cacheAsTexture + ChunkIndex 剔除） |
| 记录帧率基线 | §7 + PERF-BASELINE.md |
| 高建筑遮挡后方低建筑 / 动态穿行遮挡 / 多格无抖动 | §3 depthKey（anchorDepth 多格 + 带内正确性） |

## 9. M1 交付物清单（批准后按此实现）
1. `packages/renderer/src/pixi/` 新增 `SceneStage`（五层，演进 IsoStage）+ `worldToScreenElevated` + `depthKey`（进 `iso.ts`/`scene.ts`）。
2. `SceneGraph` 类型（`scene.ts` 扩展）+ layout v0（`apps/web/src/scene/layout.ts`，从 generator 内容清单产 SceneGraph）。
3. `apps/web` `<PixiSceneHost>` + 相机状态 + SVG→纹理桥 + WebGL 兜底。
4. vitest：depthKey/elevation case 表（§3f）；`IslandScene` 既有测试保持绿。
5. `PERF-BASELINE.md`（§7）。

## 10. 未决子决策（不阻断 M1，到点再定）
- `ELEV_STEP` 最终像素值（M4 随高差视觉定稿）· `TIE` 方向与 compareDepth 对齐（impl 时定）· toneFilter 用 ColorMatrixFilter 还是自定义片元（M3 定，M1 只留宿主层）· 相机缩放级别与 LOD 切换阈值（M7）。

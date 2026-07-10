# M4 技术设计 — 地形高差 + 建筑积木化 + biome（核心丰富度，§9.3 动工前交付）

> 依据 `PLAN-v2.md` + `M1-DESIGN.md`（depthKey 已含 elevation，`worldToScreenElevated` 已备）。
> M4 是最大一块,拆 6 个可独立验收的子步(M4.1–M4.6),逐步截图。批准后按 §3 清单批量生产。

---

## 0. 子里程碑 & 验收
| 子步 | 内容 | 验收(目视+数据) |
|---|---|---|
| M4.1 | 地形高差:3 级高程 + 海岸线噪声 + 悬崖/坡道 + 河流/瀑布 tile | 台地/高地正确抬升、悬崖面朝前、深度遮挡不乱(复用 depthKey);海岸不规则非矩形 |
| M4.2 | 建筑积木化:36+ Pixi Graphics 参数化件 + 组合器 + 邻接白名单 | 任意合法组合渲染正确 isoDepth;非法组合 layout 拒绝 |
| M4.3 | `projectClaimState`(core 新 reducer)+ 建筑生长绑账本 | "看图读 claim 状态"准确率(地基/楼层数/屋顶 反推 preprint/复现次数/共识) |
| M4.4 | 每 biome 1 Landmark(2–3× 体量) | 4 个 Landmark 两两一眼可辨,岛级视觉锚点 |
| M4.5 | 密度梯度环带(岛心→中环→岸线) | 岛心高密+Landmark、中环植被混、岸线稀疏+码头/灯塔 |
| M4.6 | biome 参数包 schema + 4 biome(色板/材质/植被/雾色/Landmark) | 4 biome 两两一眼可辨;§4 全部硬指标(≥36 建筑原语/≥20 scatter/单岛≥80 元素) |

---

## 1. 地形高差算法（M4.1）

### 1a. 高度场(决定每 tile 的 elevation ∈ {0,1,2})
layout 层为每个 land tile 算 `elevation = quantize(radial + noise)`：
```
d      = dist(tile, center) / ISLAND_R          // 0(心)…1(缘)
radial = 1 - d                                   // 心高缘低
h      = radial*0.7 + fbm(tile*0.15)*0.5         // 噪声打破同心圆
elevation = h > 0.62 ? 2 : h > 0.34 ? 1 : 0      // 高地/台地/海滩
```
- fbm 用与 sea 相同的 value-noise(已在 sea-mesh),搬进 layout 的纯 TS 版本(确定性,slug 种子)。
- 保证心区偏 2、岸边偏 0,但噪声让边界有机。

### 1b. 海岸线噪声(land 判定不规则化)
`inIsland` 从"圆"改"噪声半径":`land = d*ISLAND_R < ISLAND_R + noise(angle,pos)*3`。禁止规则矩形/纯圆(计划硬指标)。

### 1c. 悬崖 / 坡道(过渡 tile,P6)
- **悬崖**:相邻 tile 高差 ≥1 时,高 tile 朝前(SW/SE)的暴露面画竖直崖面(从本 tile 顶边落到低邻居顶高)。→ layout 给 terrain SceneObject 加 `cliff?: {sw:number, se:number}`(该向要落的高度,px),renderer 画崖面四边形。
- **坡道**:指定过渡 tile(kind `ramp`)渲成斜面,连通两高差层(视觉可走)。M4.1 先做悬崖,坡道随后。

### 1d. 河流 / 瀑布
- 河流 = 从高向低的一串 `river` water tile(顺高度场下坡路径,A* 或贪心下坡)。
- 瀑布 = 河流经过高差跌落处的 tile(kind `waterfall`)。
- M4.1 只放置几何 + 静态水色;UV 滚动动效在 M5。

### 1e. 地形渲染(替换 M1 平菱形)
每 land tile → "地形块":顶菱形抬到 `y - elevation*ELEV_STEP` + 朝前两边的崖面(按 1c)。深度键复用 `isoDepthKey(tile, elevation, 'ground')`(已证不跨行)。

---

## 2. 密度梯度环带算法（M4.5）
按 tile 到岛心距离 `d∈[0,1]` 分 3 环,layout 控 scatter 密度 + 内容：
| 环 | d | 内容 |
|---|---|---|
| 岛心 core | <0.35 | Landmark(心最高 tile)+ 高建筑密度 + 极少植被 |
| 中环 mid | 0.35–0.7 | 中建筑密度 + 植被混合(按 biome `sceneryForDomain`) |
| 岸线 shore | 0.7–1.0 | 稀疏 + 码头/灯塔/礁石/浮木,建筑极少 |
- scatter 放置:每 tile 按环带 `scatterProb(ring, biome)` 抽样(确定性 rng),密度随环递变。
- Landmark 固定岛心最高 tile;灯塔固定岸线 dock 附近。

---

## 3. 36+ 原语参数化清单（M4.2）— 批准后批量生产

**形态**:非 SVG 文件,是 **Pixi Graphics 参数化 draw 函数**(PLAN-v2 §5 方案 B)。建筑 = `base + floors[] + roof + attachments[]` 组合,颜色走 biome tint,变异走 variant 种子。P7 变异维度(每件适用)：**色相抖动 ±5% · 水平镜像 · 缩放 0.85–1.15**。

### 3a. 基座 × 6（地基 = preprint/数据开放）
| # | 名称 | 语义/biome 倾向 |
|---|---|---|
| B1 | plinth-stone 石台基 | 数理 |
| B2 | deck-timber 木platform | 生命 |
| B3 | podium-brick 砖基座 | 物质 |
| B4 | terrace-stepped 梯台 | 通用 |
| B5 | pillars-raised 架空柱基 | 交叉/临水 |
| B6 | earth-raw 夯土台 | 通用/早期 |

### 3b. 楼层 × 8（每次独立复现 +1 层）
F1 wall-stone 石墙 · F2 frame-timber 木构架 · F3 curtain-glass 玻璃幕墙 · F4 brick-course 砖层 · F5 lattice-open 格栅 · F6 colonnade 列柱 · F7 arch-vault 拱券 · F8 cantilever 悬挑

### 3c. 屋顶 × 8（领域共识 → 加屋顶）
R1 flat-terrace 平顶露台 · R2 gable 双坡 · R3 hip 四坡庑殿 · R4 dome 穹顶 · R5 spire 尖塔 · R6 sawtooth 锯齿天窗 · R7 garden-roof 屋顶花园 · R8 observatory 观测台

### 3d. 附件 × 14（评审/DOI/实验室 等，绑账本状态）
A1 seal-review 评审徽记←开放评审 · A2 lamp-doi DOI 灯牌←持久标识 · A3 chimney 烟囱←claim 活跃(M5 炊烟) · A4 banner-flag 旗帜←fork 谱系(M5 摆动) · A5 antenna 信号天线←publish · A6 dish-data 数据碟←开放数据节点 · A7 balcony 阳台 · A8 awning 遮篷 · A9 clock 钟 · A10 weathervane 风向标(M5) · A11 lantern-post 灯柱←夜灯(M3/M8) · A12 bridge-connector 连桥←bridge/transplant 关系 · A13 scaffold 脚手架←进行中(preprint 未复现) · A14 lab-vent 实验室通风←AI agent/workflow 运行(§5 自主实验室,夜不熄)

### 3e. Landmark × 4（每 biome 1，2–3× 普通体量，P8）
| biome | Landmark | 形态 |
|---|---|---|
| 数理 | 巨型几何晶体 | 多面棱晶簇 |
| 物质 | 不熄熔炉尖塔 | 发光炉口方尖碑(对标计划"不眠数据方尖碑") |
| 生命 | 世界树温室 | 巨树 + 玻璃穹 |
| 交叉 | 桥拱枢纽 | 多向连桥拱 |

### 3f. 邻接白名单(layout 拒非法组合,示例)
- curtain-glass(F3) 需 podium-brick/plinth-stone/pillars 基座,不可 earth-raw
- dome(R4)/observatory(R8) 需顶层为 colonnade/arch/curtain
- cantilever(F1 位)不可作地面首层(需下有层)
- spire(R5) 仅 ≥3 层高建筑
→ 组合数 6×8×8×(附件子集) ≫ 36,合法子集 layout 校验,非法直接拒。

---

## 4. `projectClaimState` reducer（M4.3）— core 新投影

**位置**:`packages/core/src/claims.ts`(新),`export function projectClaimState(events): ClaimState[]`。纯 reduce over ledger,**无新 verb**,合 §7 + depth-plan §14 不变式。

**算法**:按 claim `ref`(sha256)分组,每 ref 输出：
```ts
interface ClaimState {
  ref: string;
  island: string;
  foundation: boolean;   // 有 submit_claim(claim 立桩) → 地基;publish 存在 = 开放数据加成
  floors: number;        // distinct 岛数(有 validate 覆盖此 ref)= 独立复现次数
  roof: boolean;         // 共识:floors ≥ CONSENSUS_MIN(= 5，已定)
  ghost?: 'refuted' | 'returned';  // 有 refute → refuted;return_to_driftwood → returned
  openReview: boolean;   // 有 open-review 事件 → A1 徽记
  hasDoi: boolean;       // publish 带持久标识 → A2 灯牌
  activity: number;      // 近期事件数 → 萤火/实验室灯密度(M8)
}
```
- `validate` 计数按**不同岛**去重(独立复现,非同岛刷)。
- 现有 `currents.ts` 已按 ref 计 validate/refute,可复用聚合骨架。
- **建筑生长映射**(layout 消费):base 恒有 · floors 段数 = `floors` · roof = `roof` · attachments 由 openReview/hasDoi/ghost/activity 决定 · ghost → 夜景鬼影(nightVisibility)。
- **测试**:`packages/core/test/claims.test.ts` —— submit→地基、N 个不同岛 validate→N 层、同岛重复 validate 不加层、refute→ghost、≥3→roof。

---

## 5. 资产 A→B 定稿（M4.2 一并）
- **BuildingComposer**(`packages/assets` 或 `renderer/pixi`):`(spec:{base,floors[],roof,attachments[],biome,variant}) → Container` of Graphics parts,每 part 一个 draw 函数(参数:尺寸/biome tint/variant)。
- **renderer makeNode 分派**:kind `claim:*`/`station:*` → BuildingComposer(读 SceneObject.building 规格);kind `ground` → 地形块(§1e);kind `scenery:*` → scatter draw(§5b);kind `landmark:*` → Landmark draw。
- **scatter ≥20 + P7 变异**(M4 补齐):现 11 → 加 ~10(蕨/灌木/岩组/芦苇/蘑菇/藤/花丛/枯木/沙丘草/贝壳堆…),每种 draw 支持 hue±5%/mirror/scale。
- M1 placeholder 立方块**逐 kind 替换**为上述;替换期 fallback 仍是立方块(不崩)。

## 6. SceneObject schema 增量（M4）
- terrain tile:加 `cliff?: {sw:number; se:number}`(崖面落高)。
- building object:加 `building?: { base:string; floors:string[]; roof:string|null; attachments:string[] }`(layout 从 ClaimState 生成,renderer 组合器消费)。
- 均为**加字段**,旧 M1–M3 路径不变(placeholder fallback 仍工作)。

## 7. 决策记录（M4 动工前，已批准）
1. ✅ **子步顺序**:M4.1 地形 → M4.3 projectClaimState → M4.2 建筑积木 → M4.4 Landmark → M4.5 环带 → M4.6 biome 收口。
2. ✅ **共识阈值** `CONSENSUS_MIN = 5`(5 个独立岛复现 → 屋顶)。
3. **36 原语命名/语义** (§3):批准清单后我批量产 draw 函数;有想改的名称/形态现在提。
4. **Landmark 4 形态** (§3e):认可否?
5. **资产策略**:确认 Pixi Graphics 参数化件(方案 B),不走 SVG 光栅化。

批准(或改)后进 M4.1。

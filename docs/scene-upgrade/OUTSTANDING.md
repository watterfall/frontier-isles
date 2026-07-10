# 未收尾清单 — 场景升级 campaign（2026-07-10 收尾快照）

> 本次会话收尾时的统一「未收尾」清单,聚合各 Iter 的 Deferred。已上线部分见 `LOOP.md`
> Iter 14–17(接线上 / M5 微动态 / 海即数据 / 名牌 LOD + 信息层级规划),均已合并 main。
> 优先级:**P0 = 应尽快(含本次引入的回归)· P1 = 计划内下一批 · P2 = 更远**。

## 已上线（本会话,main @ `9fceb0b`）
- ✅ **接线上**:Pixi 成为生成岛 L1 真渲染器(真账本 → `projectClaimState`);SVG 降为 no-GPU 兜底;站点命中测试。
- ✅ **M5 微动态**:灯窗 twinkle / 魂影 bob / 共识光环 breathe / 昼夜平滑 crossfade(一个 ticker,全数据绑定)。
- ✅ **海即数据 L1**:海深=抽象度(substrate)· undertow=争议度(refuted)· 面板文字解码器。
- ✅ **名牌 LOD**:栅格烘入 → 屏幕空间 billboard Text 层,任意缩放清晰,远印章单字/近全名。
- ✅ **信息层级规划**:`INFO-HIERARCHY.md`(众岛语义 LOD)+ ROADMAP §3.11 指针。
- ✅ **Bundle 代码分割**:live L1 用 `React.lazy` 懒加载 `PixiScene` + `<Suspense>` → 主包 **339→182KB gzip(−46%)**,Pixi(156KB)独立 chunk,进岛才载;L0 海图不再付 Pixi 代价。真岛 e2e 验证无损。

---

## P1 · 计划内下一批（L1 丰富度 + 交互补全）
- **样板英雄岛未接 Pixi**:`machine-curiosity` 仍走 bespoke SVG `Scene`(默认入口就是它)。要么接 Pixi 统一,要么明确它是 SVG 手绘 hero 的定位。
- **claim 点击接面板**:现仅站点 `station:*` → `onStation`;claim 塔点击未接 detail 面板。
- **M4.4 Landmark×4**(每 biome 一个 2–3× 体量地标)· **M4.5 密度梯度环带**(岛心高密→岸线稀疏)—— 单岛丰富度,scene-upgrade 原计划 deferred。
- **M8 微动态第二批**:炊烟(A3)/ 旗帜摆动(A4)/ 萤火 / 夜市灯 —— 需 `ParticleContainer` + 未建的 A3/A4 附件原语。
- **名牌近景第三层**:near-zoom 加站点状态 / 工件数(现两层:印章↔全名)。
- **名牌 i18n**:现 zh;`STATION_META` 有 `en`,加 `lang` prop 即可让名牌随语言(注意 architecture i18n 规则「in-SVG captions 编辑内容不译」的边界)。
- **per-station 垂直配准**:统一 anchor 使几座略高,需逐站微调。
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

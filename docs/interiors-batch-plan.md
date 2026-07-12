# 岛屿内景批量扩充 · 执行纲要（batch-2）

目标：把富内容 L2 站点内景（`IslandInterior`）从现有 12 座旗舰岛扩到 **~36 座**，
每座个性化、贴合主题、真实文献 grounded、双语，走已有管线
（`interiors.ts` → `meta.atlas.interior` → `StationInteriorDrawer`）。不改架构。

## 质量红线（不可协商）
- **禁造引用**：`digests`/`gallery` 的 `cite` 必须是真实论文（走 alphaXiv / Exa / Consensus / PubMed 实检）；查不到就省略 `cite`，不编 DOI。
- **过图灵测试**：每座的居民/辩论/数据都要具体贴该前沿，不能是通用填充。
- **不变量**：`votes` 不是排名（inv.7）；居民名是编辑性专名不翻译（inv.9）；抽屉只读，不写事件。
- **密度对齐范本 formal-math**：~7 问题 / 5 文献 / 3 辩论 / 5 数据 / 4 散木 / 4 实验 / 3 展厅 / 4 茶寮 / 5 居民。

## 推荐选岛（四宏域各 9 = 36，优先 stage≥2 + 高活跃）
数理 9 · 物质 9 · 生命 9 · 交叉 9（完整 id 清单见 scratchpad/select 输出；含截图岛 #72）。

## 流水线（Workflow，worker 走 opus/sonnet）
- **Phase 1 · 设计（opus）**：每岛出一份「个性化简报」——独特切入角、5 位具名居民 persona、
  招牌辩论、标志性数据点、该岛的诚实张力。研究打底。→ 落 `scratchpad/briefs/*.json`
- **checkpoint**：用户审简报（可选，见问题 2）
- **Phase 2 · 扩写（sonnet）**：按简报把九节展开成完整双语 `IslandInterior` JSON，
  引用走实检真论文。→ 落 `scratchpad/interiors/*.json`
- **Phase 3 · 对抗验证（opus）**：groundedness（引用是否真）+ schema 合法 + 双语齐平 + 反通用。
  不过关的打回 Phase 2 重写。
- **Phase 4 · 组装（me）**：写入 `packages/data/src/interiors-2.ts`，`index.ts` 合并；
  `pnpm -r test && typecheck` 转绿；抽样 Playwright 点建筑验证抽屉真的开。

## 落盘策略
新建 `interiors-2.ts`（不动 357KB 的 `interiors.ts`），`index.ts` 里 `{...INTERIORS, ...INTERIORS_2}` 合并。

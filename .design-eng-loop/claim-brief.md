# 画布 Brief · frontier-isles · claim-as-building（补缺失设计源）

> 把整个文件粘进 Claude Design 对话框，直接开始出变体。**靶心**：为"claim（科学主张）作为一栋会成长的建筑"设计一套视觉语言 —— 这是升级计划的核心比喻，但 design-system 22 张卡里**至今没有它的设计源**（invariant 6/14：无源即砍，所以工程侧目前只有停机版）。数据模型见 `packages/core/src/claims.ts`，停机版现状见 `docs/scene-upgrade/probe-claimC-day.png`。

## 本轮目标（唯一靶心）
把"**一条 claim = 岛上一栋建筑，其形态由账本验证态驱动**"从概念做成**可落地、与 9 座 civic station 不打架**的视觉语言。产出 **2–3 个整合变体**。

## 数据绑定（每一维视觉必须绑其中一维，invariant 14；无源即砍 invariant 6）
`projectClaimState(ledger)` 按内容寻址 ref 分组，每条 claim 已投影出这些**真实**维度：
- **foundation** — `submit_claim`（预印/开放）或 `publish`（已发表，带 DOI）。claim 存在的最低态。
- **floors** — **不同其他岛**独立 `validate` 的数量（自证不算）= 独立复现数。0…N。
- **roof** — floors ≥ **5**（CONSENSUS_MIN）= 领域共识封顶。
- **ghost** — `refute`（被驳）或 `return_to_driftwood`（搁置）→ 夜间鬼影，**永不删除**（不变量）。
- **hasDoi** — 是否已正式发表。
- **activity** — 该 claim 上的事件总数（可选绑：热度/微动态密度）。

## 具体设计任务（要解的就是这些，不是泛泛"更好看"）
1. **成长语法**：floors=0（裸预印本）→ floors=2 → floors=5+共识，**同一栋建筑如何逐级长起来**？每次独立复现 +1 的视觉增量是什么（加层？加翼？加窗？），要能在等距视角下一眼读出"这栋被复现了几次"。
2. **与 station 绝不混淆**（最难、务必出）：station 是米墙+彩色屋顶的 civic 建筑；claim 也是建筑。同屏出现时，**读者如何一眼分清"这是职能设施 vs 这是一条主张"**？（材质？体量？基座？聚落关系——claim 环绕 station？）停机版让二者都成了米墙小楼、会混，这是要解的核心。
3. **共识封顶 roof**：floors≥5 的"屋顶/领域共识"形态。停机版只加了一面小旗，太弱。要一个有分量、可远读的封顶符号。
4. **被驳鬼影**：refuted/returned 的 claim 在夜里的形态（invariant：不删除、夜间可见）。与 depth-plan-v2 的漩涡（争议起浪）如何呼应。
5. **DOI / 发表态**：hasDoi 的 claim（已发表）与仅预印的 claim 的区分标记。

## 约束（设计系统是契约，不是建议）
- **只用现有 `--fi-*` token**：米墙 `--wall #F8F1DE`、墨线 `--ink #3A342B`、领域色 `--fi-domain-*` / DOMAIN_COLORS（数理蓝 #2E5E8C / 物质赭 #B5673A / 生命绿 #2B7A5F / 交叉金 #A08428）。**新增任何色相 = breaking-change note**。
- **Day/Night 只换调色板，绝不换形状**（night 只对 scene root 施 `NIGHT_SCENE_VARS`）。
- **等距 2:1**，与 `14-components-stations` 的建筑同一投影、同一墨线笔触（复用其视觉语汇，别另立一套画风）。
- **禁止**：XP/楼层≠积分排行（invariant 1，楼层必须是复现数不是分数）· 算法信息流（invariant 4）· 无数据源的装饰花纹（invariant 6/14）· 金色宝藏堆（工程侧已验证跑偏，别回去）。
- 岛/地基复用真实 `IslandMound` 的 `MOUND_PATHS`，别另画。

## 要什么
针对上述出 **2–3 个变体**，每个一句话说明它对靶心（尤其任务 2 的"claim vs station 不混淆"）的策略差异，例如：
- 变体 A「体量对比」：claim 比 station 小一号、更密、环绕 station 成聚落，靠尺度+聚集分层；
- 变体 B「材质对比」：station 实心木石、claim 半透/纸构/脚手架感（"在建的主张"），靠材质分层；
- 变体 C「基座语言」：claim 立在可辨的地基台上（foundation=台、floors=柱/层、roof=顶盖），把"地基→楼层→屋顶"做成一套结构符号。

## 完成后
选定 / 精修 → handoff「Send to Claude Code」→ 回终端跑 `/design-eng-loop evolve`：回流的真实组件过 Tier 0 闸门（typecheck+test+invariant 14 可追溯 + leavability round-trip）+ 两轴评分。画布说"达标"不算，代码侧测了才算。届时替换 `scene-stage.ts` 的 `makeClaimMark` 停机版。

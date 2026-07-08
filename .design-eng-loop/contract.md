# Design Loop 契约 · frontier-isles

> 双层契约：本文件是**人读层**（叙述、rubric、进化规则）；`contract.json` 是**机器层**（exporter / evolve 消费）。值只在 json 出现一次，本文不重抄。

## 真相源（Single Source of Truth）
- canonical token 块：`packages/assets/src/tokens.css` 的 `:root`（主块，行 13–69）
- token 数量：≈36（色/字/间距/圆角/墨线/动效）+ 第二 `:root` 块的 8 个 `--fi-domain-*` 领域色
- 值 VERBATIM 抽自 `design/handoff/问题群岛-原型 v3.dc.html`（sole visual authority）。**token 改动需 breaking-change note**；`#5A6C9E`（AI ink）是刻意的组件级常量，不是 token。
- foundations 生成自 token：✅（禁止手抄值）

## Exporter（两级保真阶梯）
- 命令：见 `contract.json.exporterCmd`（通用引擎 `ds-export-generic.mjs`）
- 输出：`design-system/*.html`（带 `@dsCard` 标记）
- **本项目特殊性**：组件是 `packages/assets` 的 React/SVG（非 HTML markup），通用引擎的 class/tag 抽取不适用 → `cards:[]`。分工：
  - **Foundations**（通用引擎从 `tokens.css` 生）：color / type / scale / motion
  - **Components 现状卡**（SSR 渲染真实组件 → 最高保真，不重画）：`05-components-current-language.html`
  - **NEW 维度卡**（v2「海即数据」，手绘 SVG 但**只用真实 `--fi-*` token**，标注 `NEW — 需回流后进 design-system`）：洋流 / 漩涡 / 海峡·地峡 / 气候带 / 河口+流例
- **毕业条件**：v2 证明长寿命×品味关键后，照 `~/AIAI/ainative/scripts/ds-export.mjs` 写 bespoke SSR exporter（把 SSR 现状卡固化进管道）。换级只改 `contract.json.exporterCmd`。

## DesignSync 目标
- projectId：见 `contract.json`（首次 `create_project` 后回填；type 必须 = `PROJECT_TYPE_DESIGN_SYSTEM`）
- localDir：repo 根 · writes glob：`design-system/**/*.html`
- 推送顺序（严守，绝不整体替换）：`list_projects/get_project → list_files → finalize_plan → write_files(localPath) → report_validate`

## Rubric（两层 —— 详见 skill 的 references/scorecard.md）

### Tier 0 · 闸门（二值，任一红阻断评分）
- 构建 / 存活 / 行为：`contract.json.gateCmd`（`pnpm -r typecheck && pnpm -r test`）
- CJK：en 视图 0 泄漏；i18n key-parity 测试绿
- 项目专属闸：**invariant 14** —— 每个新视觉可追溯到 ledger 事件或领域向量（无源即砍）；**leavability** round-trip 测试绿（`problem.md`/`ledger.jsonl` 过 opp parser）
- DesignSync：render-check `bad=0`

### Tier 1 · 评分（两条对等轴）
- 轴 A 工程（/audit，各维 0-4）：见 `contract.json.axisA`
- 轴 B 品味（persona，各维 0-5）：见 `contract.json.axisB` / `personaRoles`

## 平衡阈值（值见 `contract.json`）
`tEng` / `tTaste` / `epsilon` / `K` / `per_round_cap` / `round_max`。

## 进化规则（平衡，详见 scorecard.md）
- ② maximin：下轮靶心 = 当前**最低分维度**（抬地板，非拉均值）
- ③ 两轴对等：`min(轴A)≥tEng ∧ min(轴B)≥tTaste` 同时成立才算完成
- ④ 全维无回归：任一维 delta < 0 → 回滚该改动
- ⑤ 收敛即停：连续 K 轮无维度提升 > ε → 停、报告、交人
- scores 历史：`.design-eng-loop/scores.jsonl`（每轮 append）；coevo：`.design-eng-loop/coevo.jsonl`

## 已知边界
- 画布生成 / handoff = 人工（Claude Design web/desktop only）；本 loop 自动化到画布交接止
- 部署 / push 不可逆步骤 → 停下给精确命令交用户
- 首次 DesignSync 调用可能要 claude.ai 登录加 design-system 授权（OAuth，用户动作）

# 证伪回流 v1：被反驳的材料重新入园，而不是消失

日期：2026-07-19
状态：实现契约（Phase C 8 / §3.10 "route failed tests back into the working space"）

## 1. 这一轮解决什么

反驳落账之后，被证伪的主张/对应只会变成夜之魅影——材料本身退出了所有工作面。本轮补上回收环：锚定岛的人可以把**有反驳在案**的工件退回散木园，材料化作「矛盾」原子重新参与散木→渡口→正式站的循环。

同时修复一处既有断链：晨报"退回"的落位用的是 morning_report kind 的原 ref，而散木园与移栽都只认 driftwood kind——**退回的材料从未真正回到园中**。

## 2. 语义与唯一事实来源

- 账本事件仍是既有的 `return_to_driftwood`，`ref` 指向**原工件**——ghost 层级（refute 优先）、时间线标记（Slice 19）与场景魂影语义全部不变。
- 地方平面收到一枚**新的 driftwood ref**：`{ atom: "contradiction", text: <原工件正文>, returnedFrom: <原 ref> }`——与移栽的 `onceDriftwood` 印记镜像对称，溯源完整。两平面各记各的真相。
- 前置校验（专用路由 `POST /api/islands/:slug/return-falsified`）：
  1. 目标 ref 锚定在**本岛**（claim / publish / bridge_artifact / transplant）；
  2. 群岛内存在针对该 ref 的语义 `refute`（含响应式反驳）——否则 `not_falsified`；
  3. 未曾退回过——否则 `already_returned`；
  4. **人类专属**终局（AI 提议、从不回收正式材料）+ 角色阶梯 `driftwood_write`。
- 事务性：原子 ref、事件、落位一并写入或一并不写。
- 晨报退回路径同步修复：落位改为真 driftwood 原子（atom `thought`，text 取草稿标题，`returnedFrom` 溯源）。

## 3. 界面

- 连接档案中，凡 `refute` 记录之下出现「将被证伪的材料退回散木园」控件，注明"锚定岛的人工决定 · 材料化作「矛盾」原子重新入园，可再移栽"。
- 成功后按档案 v1 规则刷新连接场；`not_falsified` / `already_returned` / 权限不足均为可见错误。
- 复用既有 compact 规则：窄视口继续只读。

## 4. 非目标

- 不自动退回任何东西——反驳存在只解锁人类决定，不代替它。
- 不删除或篡改原工件；ghost 与档案记录永远保留完整历史。
- 不把"退回"表述为"撤稿"或"承认错误"——它只是材料回到夜的一侧继续演化。

## 5. 验收

- 服务端：退回成功且园中出现可移栽的矛盾原子（含 returnedFrom）；未证伪 422；agent 403；重复退回 422；退回的原子可完成一次真实移栽（循环闭合）。
- 桌面端：反驳记录下出现控件，支持记录上没有。
- 全量测试、类型检查、构建与 e2e 通过。

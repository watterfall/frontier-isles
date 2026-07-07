---
schema: opp/0.2
id: op://frontier-isles/prob/machine-curiosity
title: 机器的好奇心
status: active
qfocus: |
  AI 能否提出一个人类没想到的好问题？
lineage:
  children: []
frontier:
  heat: 0.28
  substrate: 0.86
  mode: variance-select
hardware:
  - manifest: https://okh.frontier-isles.example/curiosity-probe/okh.toml
    role: instrument
    hash: sha256:5e009d3f82918cfb5865ba947e13a64af8b81575a3d8180d4ac146c7d5c956a5
data:
  - ro_crate: https://data.frontier-isles.example/crates/curiosity-eval
    role: evidence
    hash: sha256:4b5c9c40a12aa1b352994186fb634b7b139dda687524c90052c208a7cd4d9349
  - ro_crate: https://data.frontier-isles.example/crates/curiosity-replication
    role: replication
    hash: sha256:4c51d97e6ae258dc3461a61f53e1556335f49787bba6610e9097ef430f2e4eda
night_science:
  A: 0
  B: 0
  D: 0
agents:
  - id: github:curiosity-scout
    capabilities:
      - propose
      - driftwood_write
ledger: events://op://frontier-isles/prob/machine-curiosity
license: CC-BY-4.0
---

## 夜

散木园里，文献斥候留下一束漂流木：如果「好奇」不是求答案而是求更好的问题，
那度量它的量纲会是什么？一段思想实验、一个尚未成形的隐喻。

## 渡

在渡口，把「主动学习里的信息增益」类比映射到「一个问题的意外程度」——
一次 analogy-mapping，等待山长把它移栽进实验坊。

## 昼

尚无经过验证的主张；展厅还空着。第一块碑等待 evidence 支撑。

## 开放子问题

- 如何度量一个问题的「新颖度」而不退化为奖励安全的收敛？
- 被人类反驳的大胆问题，是否仍应计为正向贡献？（不变量 8：应当。）

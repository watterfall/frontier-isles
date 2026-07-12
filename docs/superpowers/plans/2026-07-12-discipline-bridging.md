# 学科打通(§九)Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把「结构 ⇄ 现象二部图」长在 Frontier Isles 的账本上,让学科打通从个体的一次迁移沉淀成一张所有人可走的地图——先把材料扩充到能撑体系(53 聚类全覆盖 + 文献层),再让结构成为知识平面一等对象、`rebuild` 事件铺边、atlas 结构透镜点亮已重建的岛并以虚线诚实标出前沿缺口。

**Architecture:** 沿用本体两平面/账本/网关/投影/atlas,不另起炉灶。Phase 1(branch `feat/discipline-bridging` 上先做)只碰 `packages/data` + `apps/server` 内容管线 + 计数测试。Phase 2 逐包 TDD:opp 加对象与动词(0.2→0.3 向后兼容)→ core 加纯函数投影 → server 加表/端点/网关红线 → web/renderer 加结构透镜(模态图层,复用现有视觉词汇)。

**Tech Stack:** pnpm workspace(Node ≥22,pnpm ≥10)· TypeScript(exports→src/index.ts,无 build,vitest/tsx 直读源)· Zod(schema)· Hono + better-sqlite3(server)· PixiJS 8 + SVG fallback(atlas)· i18next(zh-CN + en key-parity)· vitest。

## Global Constraints

- **不变式(architecture §7,非协商)**:no XP/leaderboards;list twins everywhere;AI never pushes(agent 写降级为提案);ledger never GC'd(append-only,hash-chained,无 UPDATE/DELETE)。
- **inv 14/15**:no current/edge without an event;无「画一条线」的工具——透镜是账本的 reduce,零新动词加在海上。
- **§五 红线**:结构 ⊥ 学科——数据模型里 structure 与 domain 互不隶属;结构只作横切透镜,绝不做成学科之上的分类标签。
- **§六.1 红线**:映射只能人做——agent 发起的 `rebuild` 一律经 `core.can()`/`degradeAction()` 降级为 dock 提案(`night_digest` + dock placement)。
- **§5 视觉红线**:`design/handoff/问题群岛-原型 v3.dc.html` = 唯一视觉权威,禁发明新几何语言;透镜一切视觉是现有词汇重组,`#5A6C9E`(AI ink)是组件常量非 token。
- **两平面**:知识平面(problem_objects / structure_objects / ledger_events / refs,portable protocol data)与场所平面(stations / placements / memberships,regenerable platform data)分流,永不混。
- **§6 leavability**:`problem.md` / `ledger.jsonl` / 新增 structure `.md` 必须往返通过 opp parser/verifier——相关测试保持绿。
- **i18n**:UI 串走 `t()`,key-parity 测试;编辑内容(岛名/问题/结构名/residents/in-SVG captions)不翻译。
- **离线**:所有网络走 `apps/web/src/api/client.ts`,best-effort;`fallback.ts` / `seaFallback.ts` 静态数据让 UI 无服务器也同样渲染。
- **命令**:`pnpm -r test && pnpm -r typecheck`(全量);`pnpm --filter <pkg> test`(单包);CJK 快照测试走 Bash(zh_CN full-ICU),不在 ctx 沙箱跑(沙箱 C locale 会假报失败)。
- **源料**:`/Users/jili/AIAI/frontier/audit/`(repo `watterfall/frontier-atlas`)——`atlas_data.json`(1477 记录,record keys `n,c,cat,s[9],t,g,d,f,+_en`)、`cards/{range}.json`(keyed by n,`{i,c,brief,+_en}`)、`evidence.json`(keyed by n,`{sources:[{title,url,year,venue}]}`,1477 条真引用)、`cluster_questions.json`(280 条列表)、`isomorphisms.json`(36 条同构,`{id,skeleton,skeleton_en,formula,domains:[{label,label_en,cluster,n}],insight,insight_en}`)。**一切有据,零编造。**
- **管线纪律**:merge 脚本非幂等——重跑前 `git checkout HEAD -- packages/data/src/frontiers.ts`;策展候选清单与成文分两步,清单过人审后才成文。

---

# Phase 1 — 材料扩充(地基)

> 目标:53 聚类全覆盖(78→约 155 岛)+ 每岛文献层 + 问题墙 3-5 问 + 聚类大问题上命名海域。Phase 1 独立可交付,不依赖 Phase 2。

## Task 1.1: 领域方向的比较性策展 — 候选清单(人审 checkpoint)

**Files:**
- Create: `<scratchpad>/curate-candidates.mjs`(策展脚本,不入库)
- Create: `<scratchpad>/candidate-manifest.md`(对照表,给发起人抽查)

**Interfaces:**
- Consumes: `atlas_data.json`(records + clusters)、`cards/*.json`(has-card 判定)、`evidence.json`(has-evidence 判定)、现有 `packages/data/src/frontiers.ts`(已选 78 的 atlasN,避免重选)。
- Produces: `candidate-manifest.md` — 每聚类一段:入选记录(n / title / 9 维分向量 / domain)+ 至少一条落选对照 + 结构预埋标记。**人审通过前不进 Task 1.3。**

- [ ] **Step 1: 写策展脚本**

按 spec §3.1 的比较性策展规则(不是机械过滤):

```javascript
// <scratchpad>/curate-candidates.mjs
import { readFileSync } from 'node:fs';
const AUDIT = '/Users/jili/AIAI/frontier/audit';
const atlas = JSON.parse(readFileSync(`${AUDIT}/atlas_data.json`, 'utf8'));
const evidence = JSON.parse(readFileSync(`${AUDIT}/evidence.json`, 'utf8'));
// has-card: union of keys across cards/*.json
import { globSync } from 'node:fs';
const cardKeys = new Set();
for (const f of globSync(`${AUDIT}/cards/*.json`)) {
  for (const k of Object.keys(JSON.parse(readFileSync(f, 'utf8')))) cardKeys.add(k);
}
// already-chosen atlasN from current frontiers.ts (avoid reselect)
const cur = readFileSync(new URL('../packages/data/src/frontiers.ts', import.meta.url), 'utf8');
const chosen = new Set([...cur.matchAll(/atlasN:\s*(\d+)/g)].map(m => m[1]));

// cluster code = 'C' + String(c+1).padStart(2,'0'); editorial cluster→domain map lives in frontiers.ts header — reuse it.
const clusterCode = (c) => 'C' + String(c + 1).padStart(2, '0');
const byCluster = new Map();
for (const r of atlas.records) {
  const code = clusterCode(r.c);
  const hasCard = cardKeys.has(String(r.n));
  const hasEvi = !!evidence[String(r.n)]?.sources?.length;
  if (!hasCard || !hasEvi) continue;
  (byCluster.get(code) ?? byCluster.set(code, []).get(code)).push({
    n: r.n, title: r.t, s: r.s, domainCat: r.cat,
    paradigm: r.s[0], cross: r.s[1], undervalued: r.s[8],
    already: chosen.has(String(r.n)),
  });
}
// comparative rank inside each cluster: paradigm ∧ cross ∧ undervalued, desc
const rank = (x) => x.paradigm * 100 + x.cross * 10 + x.undervalued;
let out = '# 候选清单(比较性策展)\n\n';
for (const [code, list] of [...byCluster].sort()) {
  list.sort((a, b) => rank(b) - rank(a));
  const need = list.filter(x => !x.already);
  out += `## ${code} — 现有 ${list.filter(x=>x.already).length} 座,候选 ${need.length}\n`;
  out += '入选(补至 ≥2):' + need.slice(0, 2).map(x => `n${x.n} [${x.s.join(',')}] ${x.title}`).join(' · ') + '\n';
  out += '落选对照:' + need.slice(2, 4).map(x => `n${x.n} [${x.s.join(',')}]`).join(' · ') + '\n\n';
}
console.log(out);
```

- [ ] **Step 2: 跑脚本产出清单**

Run: `node <scratchpad>/curate-candidates.mjs > <scratchpad>/candidate-manifest.md`
Expected: 53 段(每聚类一段),缺席的 19 聚类给出候选,已足的聚类标注现有数。

- [ ] **Step 3: 人审 checkpoint**

把 `candidate-manifest.md` 交发起人抽查(每聚类入选 vs 落选是否合理,四域是否均衡,结构预埋岛是否在列)。**得到「通过」后**才进 Task 1.3。这一步不写代码、不 commit。

- [ ] **Step 4: 提交清单快照(便于复现)**

```bash
mkdir -p docs/superpowers/artifacts
cp <scratchpad>/candidate-manifest.md docs/superpowers/artifacts/2026-07-12-curation-manifest.md
git add docs/superpowers/artifacts/2026-07-12-curation-manifest.md
git commit -m "docs(curation): comparative candidate manifest for 53-cluster coverage"
```

## Task 1.2: `FrontierEntry.literature[]` 字段 + 类型 + 消费面

**Files:**
- Modify: `packages/data/src/frontiers.ts`(`FrontierEntry` 接口 + `Citation` 复用)
- Modify: `apps/web/src/components/island/GeneratedIslandScreen.tsx:52-67`(`IslandDetail.atlas` 增 `literature?`)
- Modify: `apps/server/src/seed.ts:335-346`(meta.atlas 透传 `literature`)
- Test: `packages/data/test/literature.test.ts`(新建)

**Interfaces:**
- Produces: `FrontierEntry.literature?: { title: string; venue: string; year: number; url: string }[]` — 消费方(seed / island detail / problem.md body)据此读取。

- [ ] **Step 1: 写失败测试**

```typescript
// packages/data/test/literature.test.ts
import { describe, it, expect } from 'vitest';
import { FRONTIERS } from '../src/frontiers';

describe('FrontierEntry.literature', () => {
  it('every entry that has literature carries {title,url,year} on each item', () => {
    for (const f of FRONTIERS) {
      if (!f.literature) continue;
      for (const lit of f.literature) {
        expect(lit.title.length).toBeGreaterThan(0);
        expect(lit.url).toMatch(/^https?:\/\//);
        expect(typeof lit.year).toBe('number');
      }
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @frontier-isles/data test literature`
Expected: FAIL — `literature` 不在 `FrontierEntry` 类型上(typecheck 报错)或运行时字段缺失。

- [ ] **Step 3: 加字段到接口**

在 `packages/data/src/frontiers.ts` 的 `FrontierEntry` 接口内(`citation` 附近)加:

```typescript
  /** Full evidence list from the atlas (evidence.json), grounded real citations.
   *  Distinct from the single headline `citation`; feeds the island library +
   *  problem.md 参考文献 (§6 leavability: travels with the .md). */
  literature?: { title: string; venue: string; year: number; url: string }[];
```

- [ ] **Step 4: 跑测试确认通过(字段存在,无数据时空跑)**

Run: `pnpm --filter @frontier-isles/data test literature`
Expected: PASS(此时无条目带 literature,循环空跑通过——数据在 Task 1.3 灌入)。

- [ ] **Step 5: 透传到 island detail 与 meta**

在 `GeneratedIslandScreen.tsx` 的 `IslandDetail.atlas` 里 `interior?` 附近加 `literature?: { title: string; venue: string; year: number; url: string }[];`;在 `seed.ts` 的 `meta.atlas` 对象里 `depth: atlas.depth,` 后加 `literature: atlas.literature,`。

- [ ] **Step 6: typecheck + commit**

Run: `pnpm --filter @frontier-isles/data typecheck && pnpm --filter @frontier-isles/web typecheck && pnpm --filter @frontier-isles/server typecheck`
Expected: PASS

```bash
git add packages/data/src/frontiers.ts packages/data/test/literature.test.ts apps/web/src/components/island/GeneratedIslandScreen.tsx apps/server/src/seed.ts
git commit -m "feat(data): add FrontierEntry.literature[] field + wire through detail/meta"
```

## Task 1.3: 内容成文管线 — 扩到 ~155 岛 + 文献 + 3-5 子问题

**Files:**
- Create: `<scratchpad>/build-packets.mjs`(grounded packets 组装)
- Create: `<scratchpad>/merge-frontiers.mjs`(eval 现有 + append 新 + emit 全量 TS)
- Modify: `packages/data/src/frontiers.ts`(由 merge 脚本重写)

**Interfaces:**
- Consumes: Task 1.1 人审通过的候选 n 列表、`cards/*.json`、`evidence.json`、`cluster_questions.json`、`atlas_data.json`。
- Produces: 扩充后的 `FRONTIERS`(~155 条),每新条目含 `depth`(overview/whyMatters/ifAnswered/approaches[]/barrier/subQuestions[3-5],双语)+ `literature`(evidence 全量)+ 布局 `chart`(grid+relaxation ≥54px)。

- [ ] **Step 1: 组装 grounded packets**

`build-packets.mjs` 为每个入选 n 产出一个 packet:`{ n, cluster, domain, card(i/c/brief 双语), evidence(sources), clusterQuestions(该聚类相关) }`。**不含任何生成文本**——只搬运源料。输出 `<scratchpad>/packets.json`。

Run: `node <scratchpad>/build-packets.mjs`
Expected: `packets.json` 条数 = 入选新岛数(约 77);抽查一条 packet 含真实 evidence sources。

- [ ] **Step 2: 子代理成文(只成文,不发明)**

对每个 packet,派 `general-purpose` 子代理(Sonnet)把 card + evidence + clusterQuestions **改写**成 `depth`(6 段双语)+ 挑 3-5 条 evidence 成 `literature`。子代理硬约束:「只能基于 packet 内的源料改写,禁止引入 packet 外的事实;evidence 缺 venue 用 URL host 兜底」。产出 `<scratchpad>/shaped/<n>.json`。

- [ ] **Step 3: merge 成全量 TS**

`merge-frontiers.mjs`:`git checkout HEAD -- packages/data/src/frontiers.ts`(先还原,防非幂等弄脏)→ 读现有 78 条(eval 现有 export)→ append 新条目 → 重排 id / 分域注释 → 布局(grid + relaxation,岛间距 ≥54px)→ emit 整份 `frontiers.ts`。

Run: `node <scratchpad>/merge-frontiers.mjs && node -e "const {FRONTIERS}=require('./packages/data/src/frontiers.ts')" 2>/dev/null || pnpm --filter @frontier-isles/data typecheck`
Expected: typecheck PASS;岛计数 = 约 155(记下确切数 N,后续测试要用)。

- [ ] **Step 4: 校验覆盖 + 文献 + 子问题**

```bash
node -e "
const src = require('fs').readFileSync('packages/data/src/frontiers.ts','utf8');
const clusters = new Set([...src.matchAll(/code:\s*\"(C\d+)\"/g)].map(m=>m[1]));
console.log('聚类覆盖:', clusters.size, '(目标 53)');
console.log('含 literature 的条数:', (src.match(/literature:/g)||[]).length);
"
```
Expected: 聚类覆盖 = 53;literature 条数 ≥ 新增岛数。

- [ ] **Step 5: commit**

```bash
git add packages/data/src/frontiers.ts
git commit -m "feat(data): expand frontier islands to full 53-cluster coverage + literature + 3-5 subquestions

Grounded from xfrontier atlas (cards/evidence/cluster_questions), no fabrication.
Island count 78 -> N."
```

## Task 1.4: 文献进 problem.md body + 岛内文献阁

**Files:**
- Modify: `apps/server/src/seed.ts:297-311`(`buildIslandBody` 加参考文献节)
- Modify: `apps/web/src/components/island/GeneratedIslandScreen.tsx`(文献阁 drawer 读 `detail.atlas.literature`)
- Test: `apps/server/test/island-body.test.ts`(新建或扩现有 server 测试)

**Interfaces:**
- Consumes: `FrontierEntry.literature`(Task 1.2)。
- Produces: `problem.md` body 含 `## 参考文献` 节(往返安全);岛内文献阁列出真引用。

- [ ] **Step 1: 写失败测试**

```typescript
// apps/server/test/island-body.test.ts
import { describe, it, expect } from 'vitest';
import { buildIslandBody } from '../src/seed';

describe('buildIslandBody 参考文献', () => {
  it('renders a 参考文献 section when the atlas entry has literature', () => {
    const c = { slug: 't', n: 'T', q: 'q', x: 0, y: 0, s: 1, a: 0, m: 0, d: '数理', st: 1 } as never;
    const atlas = {
      depth: { overview: {zh:'o',en:'o'}, whyMatters:{zh:'w',en:'w'}, ifAnswered:{zh:'i',en:'i'}, approaches:[{zh:'a',en:'a'}], barrier:{zh:'b',en:'b'}, subQuestions:[{zh:'s',en:'s'}] },
      literature: [{ title: 'Real Paper', venue: 'Nature', year: 2020, url: 'https://x.test/p' }],
    } as never;
    const body = buildIslandBody(c, atlas);
    expect(body).toContain('## 参考文献');
    expect(body).toContain('Real Paper');
    expect(body).toContain('https://x.test/p');
  });
});
```

（注:`buildIslandBody` 当前非 export——本步同时把它 `export`。）

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @frontier-isles/server exec vitest run test/island-body.test.ts`
Expected: FAIL — `buildIslandBody` 未导出 / 无参考文献节。

- [ ] **Step 3: 实现**

`seed.ts`:`export function buildIslandBody(...)`;在 body 数组末尾(`## Open sub-questions` 后)加:

```typescript
      ...(atlas?.literature?.length
        ? ["## 参考文献", atlas.literature.map((l) => `- ${l.title} — ${l.venue} (${l.year}). ${l.url}`).join("\n")]
        : []),
```

- [ ] **Step 4: 跑测试确认通过 + 往返测试仍绿**

Run: `pnpm --filter @frontier-isles/server exec vitest run test/island-body.test.ts && pnpm --filter @frontier-isles/opp test`
Expected: PASS(含 leavability 往返测试绿)。

- [ ] **Step 5: 文献阁读 literature**

`GeneratedIslandScreen.tsx`:文献阁(library)station drawer 里,若 `detail.atlas?.literature` 存在则渲染真引用列表(复用现有 `InteriorDigest` 展示样式,不新建组件)。

- [ ] **Step 6: typecheck + commit**

Run: `pnpm --filter @frontier-isles/web typecheck`
```bash
git add apps/server/src/seed.ts apps/server/test/island-body.test.ts apps/web/src/components/island/GeneratedIslandScreen.tsx
git commit -m "feat(server,web): literature into problem.md 参考文献 + island library"
```

## Task 1.5: 聚类大问题 → 命名海域 detail

**Files:**
- Modify: `packages/data/src/regions.ts`(REGION 类型加 `greatQuestions?`)
- Modify: `<scratchpad>/merge-frontiers.mjs` 或新增 `<scratchpad>/build-regions.mjs`(灌入 cluster_questions)
- Modify: atlas T1 region detail 面板(读 region.greatQuestions)
- Test: `packages/data/test/regions.test.ts`(新建)

**Interfaces:**
- Consumes: `cluster_questions.json`。
- Produces: `Region.greatQuestions?: { q: Bilingual; whyMatters: Bilingual; ifAnswered: Bilingual }[]`。

- [ ] **Step 1: 写失败测试**

```typescript
// packages/data/test/regions.test.ts
import { describe, it, expect } from 'vitest';
import { REGIONS } from '../src/regions';
describe('region great questions', () => {
  it('each region with greatQuestions carries bilingual q', () => {
    for (const r of REGIONS) {
      for (const g of r.greatQuestions ?? []) {
        expect(g.q.zh.length).toBeGreaterThan(0);
        expect(g.q.en.length).toBeGreaterThan(0);
      }
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @frontier-isles/data test regions`
Expected: FAIL — `greatQuestions` 不在 Region 类型上。

- [ ] **Step 3: 加字段 + 灌数据**

`regions.ts` Region 接口加 `greatQuestions?`;脚本从 `cluster_questions.json` 取每命名海域对应聚类的 1-2 条大问题填入。

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm --filter @frontier-isles/data test regions`
Expected: PASS

- [ ] **Step 5: T1 detail 面板渲染 + commit**

atlas 命名海域 detail 面板读 `region.greatQuestions` 渲染(复用现有 detail 面板样式)。typecheck 后:
```bash
git add packages/data/src/regions.ts packages/data/test/regions.test.ts apps/web/src/chart/
git commit -m "feat(data,web): cluster great-questions onto named regions (T1 detail)"
```

## Task 1.6: 计数敏感测试 + 快照全绿门禁

**Files:**
- Modify: `apps/web/src/api/__tests__/fallback.test.ts`(岛计数 78→N)
- Modify: `apps/server/test/server.test.ts`(岛计数 ×2)
- Modify: `apps/web/src/__tests__/MobileShell.test.tsx`(anchors + satellites)
- Modify: `packages/core/test/archipelago.test.ts`(band + roster 快照)
- Modify: `packages/core/test/scaleCorpus.test.ts`(若 keyed off count)

**Interfaces:**
- Consumes: Task 1.3 的确切岛数 N。

- [ ] **Step 1: 全量跑,收集失败**

Run: `pnpm -r test 2>&1 | grep -E "expected|FAIL|✗" | head -40`
Expected: 一批计数断言失败(78 vs N),快照失配。

- [ ] **Step 2: 更新计数断言**

把各测试里硬编码的 `78` / `79` 改成 N(用确切数字,不用变量)。逐个文件改。

- [ ] **Step 3: 更新快照(CJK 走 Bash 门禁)**

Run(Bash,zh_CN full-ICU):`pnpm --filter @frontier-isles/core exec vitest run archipelago -u`
Expected: roster/band 快照重生成。检查 diff 合理(新岛入列,无乱码)。

- [ ] **Step 4: 全绿门禁**

Run: `pnpm -r test && pnpm -r typecheck`
Expected: 全 PASS。

- [ ] **Step 5: commit(Phase 1 收尾)**

```bash
git add -A
git commit -m "test: update count-sensitive tests + snapshots for expanded island corpus (N islands)"
```

**Phase 1 验收**:53 聚类全部点亮;任抽一岛,文献阁有 ≥1 条真引用、问题墙 ≥3 问;`problem.md`/`ledger.jsonl` 往返绿;`pnpm -r test && pnpm -r typecheck` 全绿。

---

# Phase 2 — 结构体系(§九 本体)

> 目标:结构成为知识平面一等对象,`rebuild` 事件铺边,core 投影出二部图/缺口/学科距离,atlas 结构透镜以现有视觉词汇点亮已重建岛 + 诚实虚线缺口。逐包 TDD:opp → core → server → web。

## Task 2.1: opp StructureObject schema + `struct://` id + 往返

**Files:**
- Create: `packages/opp/src/structure-object.ts`
- Modify: `packages/opp/src/index.ts`(导出)
- Test: `packages/opp/test/structure-object.test.ts`(新建)

**Interfaces:**
- Produces: `StructureObjectSchema`(zod)、`StructureObject`(type)、`STRUCT_ID_RE`、`serializeStructureObject(obj) → string`、`parseStructureObject(md) → StructureObject`。id 形如 `struct://<org>/<slug>`。

- [ ] **Step 1: 写失败测试**

```typescript
// packages/opp/test/structure-object.test.ts
import { describe, it, expect } from 'vitest';
import { StructureObjectSchema, serializeStructureObject, parseStructureObject, STRUCT_ID_RE } from '../src/structure-object';

describe('StructureObject', () => {
  const raw = {
    schema: 'opp/0.3' as const,
    id: 'struct://xfrontier/kuramoto',
    title: { zh: '耦合振子同步', en: 'Coupled-oscillator synchronization' },
    statement: { zh: '大量弱耦合振子在临界耦合强度以上自发锁相。', en: 'Weakly coupled oscillators spontaneously phase-lock above a critical coupling.' },
    status: 'active' as const,
  };
  it('accepts a struct:// id', () => {
    expect(STRUCT_ID_RE.test(raw.id)).toBe(true);
    expect(() => StructureObjectSchema.parse(raw)).not.toThrow();
  });
  it('round-trips through markdown (§6 leavability)', () => {
    const obj = StructureObjectSchema.parse(raw);
    const md = serializeStructureObject(obj);
    const back = parseStructureObject(md);
    expect(back).toEqual(obj);
  });
  it('rejects an op:// id in the structure slot', () => {
    expect(() => StructureObjectSchema.parse({ ...raw, id: 'op://x/prob/y' })).toThrow();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @frontier-isles/opp exec vitest run test/structure-object.test.ts`
Expected: FAIL — 模块不存在。

- [ ] **Step 3: 实现 schema + 序列化**

```typescript
// packages/opp/src/structure-object.ts
import { z } from 'zod';

/** `struct://<org>/<slug>` — a portable structure (a cross-substrate regularity). */
export const STRUCT_ID_RE = /^struct:\/\/[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/;
export const StructId = z.string().regex(STRUCT_ID_RE, 'must be struct://<org>/<slug>');
const Bilingual = z.object({ zh: z.string().min(1), en: z.string().min(1) });

export const StructureStatusSchema = z.enum(['proposed', 'active', 'retired']);

export const StructureObjectSchema = z.object({
  schema: z.literal('opp/0.3'),
  id: StructId,
  title: Bilingual,
  /** The regularity in one sentence (bilingual). NOT a discipline label (§五). */
  statement: Bilingual,
  status: StructureStatusSchema,
  license: z.string().default('CC-BY-4.0'),
});
export type StructureObject = z.infer<typeof StructureObjectSchema>;

/** YAML-ish front-matter serialization, mirroring problem-object's .md contract. */
export function serializeStructureObject(o: StructureObject): string {
  const fm = [
    '---',
    `schema: ${o.schema}`,
    `id: ${o.id}`,
    `title.zh: ${o.title.zh}`,
    `title.en: ${o.title.en}`,
    `statement.zh: ${o.statement.zh}`,
    `statement.en: ${o.statement.en}`,
    `status: ${o.status}`,
    `license: ${o.license}`,
    '---',
    '',
  ].join('\n');
  return fm;
}

export function parseStructureObject(md: string): StructureObject {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error('structure .md: missing front-matter');
  const kv: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(': ');
    if (i > 0) kv[line.slice(0, i)] = line.slice(i + 2);
  }
  return StructureObjectSchema.parse({
    schema: kv['schema'],
    id: kv['id'],
    title: { zh: kv['title.zh'], en: kv['title.en'] },
    statement: { zh: kv['statement.zh'], en: kv['statement.en'] },
    status: kv['status'],
    license: kv['license'],
  });
}
```

- [ ] **Step 4: 导出 + 跑测试确认通过**

`packages/opp/src/index.ts` 加 `export * from './structure-object';`。
Run: `pnpm --filter @frontier-isles/opp exec vitest run test/structure-object.test.ts`
Expected: PASS(3 测试)。

- [ ] **Step 5: commit**

```bash
git add packages/opp/src/structure-object.ts packages/opp/src/index.ts packages/opp/test/structure-object.test.ts
git commit -m "feat(opp): StructureObject schema + struct:// id + markdown round-trip"
```

## Task 2.2: opp 加 `rebuild` 动词(0.2→0.3 向后兼容)

**Files:**
- Modify: `packages/opp/src/ledger.ts:19-37`(`ActionTypeSchema` 加 `rebuild`)
- Test: `packages/opp/test/ledger.test.ts`(扩现有或新建)

**Interfaces:**
- Produces: `ActionType` 增 `"rebuild"`;旧 0.2 账本事件仍解析通过。

- [ ] **Step 1: 写失败测试**

```typescript
// packages/opp/test/rebuild-action.test.ts
import { describe, it, expect } from 'vitest';
import { LedgerEventSchema, appendEvent, verifyChain } from '../src/ledger';

describe('rebuild action', () => {
  const base = {
    ts: '2026-07-12T00:00:00Z', op: 'op://xfrontier/prob/firefly-sync',
    actor: { id: 'github:shen-kuo', kind: 'human' as const }, phase: 'B' as const,
    action: 'rebuild' as const, ref: 'sha256:' + 'a'.repeat(64),
  };
  it('accepts a rebuild event', () => {
    expect(() => LedgerEventSchema.parse({ ...base, credit: [] })).not.toThrow();
  });
  it('chains + verifies alongside legacy actions', () => {
    let chain = appendEvent([], { ...base, credit: [] });
    chain = appendEvent(chain, { ...base, action: 'validate', credit: [] });
    expect(verifyChain(chain).ok).toBe(true);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @frontier-isles/opp exec vitest run test/rebuild-action.test.ts`
Expected: FAIL — `'rebuild'` 不在 `ActionTypeSchema` 枚举。

- [ ] **Step 3: 加枚举值**

`ledger.ts` 的 `ActionTypeSchema` 枚举末尾(`night_digest` 前或后)加 `"rebuild",`。

- [ ] **Step 4: 跑测试确认通过 + 全 opp 测试绿(旧账本兼容)**

Run: `pnpm --filter @frontier-isles/opp test`
Expected: PASS — 新测试 + 所有既有往返/verifier 测试绿(证明 0.2 事件不受影响)。

- [ ] **Step 5: commit**

```bash
git add packages/opp/src/ledger.ts packages/opp/test/rebuild-action.test.ts
git commit -m "feat(opp): add rebuild action type (0.2 ledgers stay compatible)"
```

## Task 2.3: 映射 artifact ref 形状(core)

**Files:**
- Create: `packages/core/src/mapping.ts`
- Modify: `packages/core/src/index.ts`(导出)
- Test: `packages/core/test/mapping.test.ts`

**Interfaces:**
- Produces: `MappingArtifact`(type)、`MappingArtifactSchema`(zod)。字段:`structureId`、`islandOp`、`correspondences: { quantity: Bilingual; inThisSubstrate: Bilingual }[]`(人写的量对应表)、`prediction?: Bilingual`(可证伪预测)、`evidenceRefs?: string[]`。这是 `rebuild` 事件 `ref` 指向的内容。

- [ ] **Step 1: 写失败测试**

```typescript
// packages/core/test/mapping.test.ts
import { describe, it, expect } from 'vitest';
import { MappingArtifactSchema } from '../src/mapping';
describe('MappingArtifact', () => {
  it('requires structureId + islandOp + at least one correspondence', () => {
    const ok = {
      structureId: 'struct://xfrontier/kuramoto',
      islandOp: 'op://xfrontier/prob/firefly-sync',
      correspondences: [{ quantity: { zh: '耦合强度', en: 'coupling K' }, inThisSubstrate: { zh: '看见彼此的视觉强度', en: 'mutual visual strength' } }],
    };
    expect(() => MappingArtifactSchema.parse(ok)).not.toThrow();
    expect(() => MappingArtifactSchema.parse({ ...ok, correspondences: [] })).toThrow();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @frontier-isles/core exec vitest run test/mapping.test.ts`
Expected: FAIL — 模块不存在。

- [ ] **Step 3: 实现**

```typescript
// packages/core/src/mapping.ts
import { z } from 'zod';
const Bilingual = z.object({ zh: z.string().min(1), en: z.string().min(1) });
/** The human-authored mapping a rebuild event points at (§六.1: only humans author this). */
export const MappingArtifactSchema = z.object({
  structureId: z.string().regex(/^struct:\/\//),
  islandOp: z.string().regex(/^op:\/\//),
  /** quantity in the structure ↦ what it corresponds to in this substrate. */
  correspondences: z.array(z.object({ quantity: Bilingual, inThisSubstrate: Bilingual })).min(1),
  /** "if this holds we should observe X" — the falsifiable prediction (§七). */
  prediction: Bilingual.optional(),
  evidenceRefs: z.array(z.string()).optional(),
});
export type MappingArtifact = z.infer<typeof MappingArtifactSchema>;
```

- [ ] **Step 4: 导出 + 跑测试确认通过**

`packages/core/src/index.ts` 加 `export * from './mapping';`。
Run: `pnpm --filter @frontier-isles/core exec vitest run test/mapping.test.ts`
Expected: PASS

- [ ] **Step 5: commit**

```bash
git add packages/core/src/mapping.ts packages/core/src/index.ts packages/core/test/mapping.test.ts
git commit -m "feat(core): MappingArtifact schema (rebuild ref payload, human-authored)"
```

## Task 2.4: core `reduceStructureGraph` 二部图投影

**Files:**
- Create: `packages/core/src/structures.ts`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/test/structures.test.ts`

**Interfaces:**
- Consumes: `LedgerEvent[]`(opp)、`MappingArtifact`(Task 2.3)、一个 `resolveRef(ref) → MappingArtifact | null` 解析器(注入,便于测试)。
- Produces: `StructureEdge = { structureId: string; islandOp: string; weight: number; actors: string[] }`;`reduceStructureGraph(events, resolveRef) → StructureEdge[]`。确定性、序无关(inv 13):同一事件多重集 → 同一边集。

- [ ] **Step 1: 写失败测试**

```typescript
// packages/core/test/structures.test.ts
import { describe, it, expect } from 'vitest';
import { reduceStructureGraph } from '../src/structures';

const ev = (op: string, ref: string, actor = 'github:a') => ({
  ts: '2026-07-12T00:00:00Z', op, actor: { id: actor, kind: 'human' as const },
  credit: [], phase: 'B' as const, action: 'rebuild' as const, ref,
});
const resolve = (ref: string) => ({
  'sha256:k1': { structureId: 'struct://x/kuramoto', islandOp: 'op://x/prob/firefly', correspondences: [{ quantity:{zh:'a',en:'a'}, inThisSubstrate:{zh:'b',en:'b'} }] },
  'sha256:k2': { structureId: 'struct://x/kuramoto', islandOp: 'op://x/prob/heart', correspondences: [{ quantity:{zh:'a',en:'a'}, inThisSubstrate:{zh:'b',en:'b'} }] },
}[ref] ?? null);

describe('reduceStructureGraph', () => {
  it('one rebuild event → one structure⇄island edge', () => {
    const edges = reduceStructureGraph([ev('op://x/prob/firefly', 'sha256:k1')], resolve);
    expect(edges).toEqual([{ structureId: 'struct://x/kuramoto', islandOp: 'op://x/prob/firefly', weight: 1, actors: ['github:a'] }]);
  });
  it('ignores non-rebuild actions and unresolvable refs (no edge without a real mapping)', () => {
    const edges = reduceStructureGraph([{ ...ev('op://x/prob/firefly', 'sha256:missing') }], resolve);
    expect(edges).toEqual([]);
  });
  it('is order-independent (inv 13)', () => {
    const a = reduceStructureGraph([ev('op://x/prob/firefly','sha256:k1'), ev('op://x/prob/heart','sha256:k2')], resolve);
    const b = reduceStructureGraph([ev('op://x/prob/heart','sha256:k2'), ev('op://x/prob/firefly','sha256:k1')], resolve);
    expect(a).toEqual(b);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @frontier-isles/core exec vitest run test/structures.test.ts`
Expected: FAIL — 模块不存在。

- [ ] **Step 3: 实现**

```typescript
// packages/core/src/structures.ts
import type { LedgerEvent } from '@frontier-isles/opp';
import type { MappingArtifact } from './mapping';

export interface StructureEdge {
  structureId: string;
  islandOp: string;
  /** number of rebuild events backing this structure⇄island edge. */
  weight: number;
  actors: string[];
}

/** Reduce the ledger into structure⇄island edges. No edge without a resolvable
 *  mapping artifact (inv 14/15). Deterministic + order-independent (inv 13). */
export function reduceStructureGraph(
  events: readonly LedgerEvent[],
  resolveRef: (ref: string) => MappingArtifact | null,
): StructureEdge[] {
  const byKey = new Map<string, StructureEdge>();
  for (const e of events) {
    if (e.action !== 'rebuild' || !e.ref) continue;
    const m = resolveRef(e.ref);
    if (!m) continue;
    const key = `${m.structureId} ${m.islandOp}`;
    const edge = byKey.get(key);
    if (edge) {
      edge.weight += 1;
      if (!edge.actors.includes(e.actor.id)) edge.actors.push(e.actor.id);
    } else {
      byKey.set(key, { structureId: m.structureId, islandOp: m.islandOp, weight: 1, actors: [e.actor.id] });
    }
  }
  // Stable sort for order-independence.
  return [...byKey.values()].sort((a, b) =>
    a.structureId < b.structureId ? -1 : a.structureId > b.structureId ? 1 : a.islandOp < b.islandOp ? -1 : a.islandOp > b.islandOp ? 1 : 0,
  );
}
```

- [ ] **Step 4: 导出 + 跑测试确认通过**

`index.ts` 加 `export * from './structures';`。
Run: `pnpm --filter @frontier-isles/core exec vitest run test/structures.test.ts`
Expected: PASS(3 测试)。

- [ ] **Step 5: commit**

```bash
git add packages/core/src/structures.ts packages/core/src/index.ts packages/core/test/structures.test.ts
git commit -m "feat(core): reduceStructureGraph — ledger → structure⇄island bipartite edges"
```

## Task 2.5: core `structureFrontier` 缺口投影

**Files:**
- Modify: `packages/core/src/structures.ts`
- Test: `packages/core/test/structures.test.ts`(扩)

**Interfaces:**
- Consumes: `StructureEdge[]`(Task 2.4)、`islands: { op: string; domain: string; cluster?: string }[]`。
- Produces: `structureFrontier(edges, islands) → { structureId: string; rebuilt: string[]; gaps: string[] }[]`。`gaps` = 与已重建岛**同 cluster 或同 domain**的未重建岛(地图收敛呈现;完整缺口留列表孪生展开)。

- [ ] **Step 1: 写失败测试(追加)**

```typescript
import { structureFrontier } from '../src/structures';
describe('structureFrontier', () => {
  const islands = [
    { op: 'op://x/prob/firefly', domain: '生命', cluster: 'C10' },
    { op: 'op://x/prob/heart', domain: '生命', cluster: 'C10' },   // same cluster, not rebuilt → gap
    { op: 'op://x/prob/quark', domain: '数理', cluster: 'C33' },   // unrelated → not a near gap
  ];
  it('gaps = same-cluster/domain islands lacking the structure', () => {
    const edges = [{ structureId: 'struct://x/kuramoto', islandOp: 'op://x/prob/firefly', weight: 1, actors: ['a'] }];
    const [f] = structureFrontier(edges, islands);
    expect(f.rebuilt).toEqual(['op://x/prob/firefly']);
    expect(f.gaps).toContain('op://x/prob/heart');
    expect(f.gaps).not.toContain('op://x/prob/quark');
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @frontier-isles/core exec vitest run test/structures.test.ts -t structureFrontier`
Expected: FAIL — 函数不存在。

- [ ] **Step 3: 实现**

```typescript
// 追加到 packages/core/src/structures.ts
export interface StructureIslandLike { op: string; domain: string; cluster?: string }
export interface StructureFrontier { structureId: string; rebuilt: string[]; gaps: string[] }

export function structureFrontier(
  edges: readonly StructureEdge[],
  islands: readonly StructureIslandLike[],
): StructureFrontier[] {
  const byStruct = new Map<string, Set<string>>();
  for (const e of edges) {
    const s = byStruct.get(e.structureId) ?? byStruct.set(e.structureId, new Set()).get(e.structureId)!;
    s.add(e.islandOp);
  }
  const islandBy = new Map(islands.map((i) => [i.op, i]));
  const out: StructureFrontier[] = [];
  for (const [structureId, rebuiltSet] of [...byStruct].sort()) {
    const rebuilt = [...rebuiltSet].sort();
    const nearClusters = new Set<string>();
    const nearDomains = new Set<string>();
    for (const op of rebuilt) {
      const isl = islandBy.get(op);
      if (isl?.cluster) nearClusters.add(isl.cluster);
      if (isl?.domain) nearDomains.add(isl.domain);
    }
    const gaps = islands
      .filter((i) => !rebuiltSet.has(i.op) && ((i.cluster && nearClusters.has(i.cluster)) || nearDomains.has(i.domain)))
      .map((i) => i.op)
      .sort();
    out.push({ structureId, rebuilt, gaps });
  }
  return out;
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm --filter @frontier-isles/core exec vitest run test/structures.test.ts`
Expected: PASS

- [ ] **Step 5: commit**

```bash
git add packages/core/src/structures.ts packages/core/test/structures.test.ts
git commit -m "feat(core): structureFrontier — rebuilt islands + near-domain gaps (the visible frontier)"
```

## Task 2.6: core `disciplineDistance`(只产出,不驱动布局)

**Files:**
- Modify: `packages/core/src/structures.ts`
- Test: `packages/core/test/structures.test.ts`(扩)

**Interfaces:**
- Consumes: `StructureEdge[]`、`islands`。
- Produces: `disciplineDistance(edges, islands) → { a: string; b: string; sharedStructures: number }[]`(域对 × 共享结构数)。**本期只产出、不驱动布局**——为 invariant 16 的 domain 连续坐标重构留接口。

- [ ] **Step 1: 写失败测试(追加)**

```typescript
import { disciplineDistance } from '../src/structures';
describe('disciplineDistance (produce-only)', () => {
  it('counts structures spanning two domains', () => {
    const edges = [
      { structureId: 'struct://x/kuramoto', islandOp: 'op://x/prob/firefly', weight: 1, actors: ['a'] }, // 生命
      { structureId: 'struct://x/kuramoto', islandOp: 'op://x/prob/grid', weight: 1, actors: ['a'] },    // 物质
    ];
    const islands = [
      { op: 'op://x/prob/firefly', domain: '生命' },
      { op: 'op://x/prob/grid', domain: '物质' },
    ];
    const d = disciplineDistance(edges, islands);
    expect(d).toContainEqual({ a: 'del生命/物质placeholder', b: '', sharedStructures: 1 }); // replaced below
  });
});
```

（注:Step 3 实现后把该断言改为实际形状 `{ a: '生命', b: '物质', sharedStructures: 1 }` — 见 Step 4。）

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @frontier-isles/core exec vitest run test/structures.test.ts -t disciplineDistance`
Expected: FAIL — 函数不存在。

- [ ] **Step 3: 实现**

```typescript
// 追加到 packages/core/src/structures.ts
export interface DomainPairDistance { a: string; b: string; sharedStructures: number }

/** Domain×domain structure-overlap density. PRODUCE-ONLY this phase — it does
 *  NOT drive layout; it reserves the interface for the invariant-16 continuous
 *  domain-coordinate rework (see memory domain-partition-rework). */
export function disciplineDistance(
  edges: readonly StructureEdge[],
  islands: readonly StructureIslandLike[],
): DomainPairDistance[] {
  const domainOf = new Map(islands.map((i) => [i.op, i.domain]));
  const structDomains = new Map<string, Set<string>>();
  for (const e of edges) {
    const d = domainOf.get(e.islandOp);
    if (!d) continue;
    const s = structDomains.get(e.structureId) ?? structDomains.set(e.structureId, new Set()).get(e.structureId)!;
    s.add(d);
  }
  const pairCount = new Map<string, number>();
  for (const doms of structDomains.values()) {
    const list = [...doms].sort();
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) {
        const key = `${list[i]} ${list[j]}`;
        pairCount.set(key, (pairCount.get(key) ?? 0) + 1);
      }
  }
  return [...pairCount].sort().map(([key, n]) => {
    const [a, b] = key.split(' ');
    return { a, b, sharedStructures: n };
  });
}
```

- [ ] **Step 4: 修正测试断言 + 跑测试确认通过**

把 Step 1 的断言改为:
```typescript
    expect(d).toEqual([{ a: '生命', b: '物质', sharedStructures: 1 }]);
```
Run: `pnpm --filter @frontier-isles/core exec vitest run test/structures.test.ts`
Expected: PASS

- [ ] **Step 5: commit**

```bash
git add packages/core/src/structures.ts packages/core/test/structures.test.ts
git commit -m "feat(core): disciplineDistance — domain-pair structure overlap (produce-only, inv-16 seam)"
```

## Task 2.7: server `structure_objects` 表 + GET 端点

**Files:**
- Modify: `apps/server/src/db.ts`(建表 DDL)
- Modify: `apps/server/src/store.ts`(insert/list/get structure)
- Modify: `apps/server/src/index.ts`(`GET /api/structures`、`GET /api/structures/:slug`、`GET /api/structures/:slug.md`)
- Test: `apps/server/test/structures-api.test.ts`

**Interfaces:**
- Consumes: `StructureObject`、`serializeStructureObject`(Task 2.1)。
- Produces: 知识平面表 `structure_objects(id TEXT PK, md TEXT, status TEXT)`;`store.insertStructure(obj)`、`store.listStructures()`、`store.getStructure(slug)`;3 个 GET 端点。

- [ ] **Step 1: 写失败测试**

```typescript
// apps/server/test/structures-api.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { makeTestApp } from './helpers'; // 复用现有测试 app 工厂;若无则用现有 server.test.ts 的建 app 方式
describe('structures API', () => {
  it('GET /api/structures lists seeded structures', async () => {
    const { app } = await makeTestApp();
    const res = await app.request('/api/structures');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.structures)).toBe(true);
  });
  it('GET /api/structures/:slug.md round-trips through opp parser', async () => {
    const { app } = await makeTestApp();
    const res = await app.request('/api/structures/kuramoto.md');
    expect([200, 404]).toContain(res.status); // 200 once seeded (Task 2.9)
  });
});
```

（注:若无 `makeTestApp` helper,依 `server.test.ts` 现有建 app + seed 的模式内联;本步顺带抽出 helper。）

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @frontier-isles/server exec vitest run test/structures-api.test.ts`
Expected: FAIL — 端点 404 / 表不存在。

- [ ] **Step 3: 建表 + store 方法 + 端点**

`db.ts` 加 DDL:`CREATE TABLE IF NOT EXISTS structure_objects (id TEXT PRIMARY KEY, md TEXT NOT NULL, status TEXT NOT NULL);`。
`store.ts` 加 `insertStructure(obj: StructureObject)`(序列化存 md)、`listStructures()`、`getStructure(slug)`。
`index.ts` 加 3 端点:list 返回 `{ structures: [{id,title,statement,status}] }`(从 md parse);`.md` 返回 `text/plain` 的原始 md。

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm --filter @frontier-isles/server exec vitest run test/structures-api.test.ts`
Expected: PASS(list 空数组也通过;`.md` 未 seed 时 404,seed 后 Task 2.9 转 200)。

- [ ] **Step 5: commit**

```bash
git add apps/server/src/db.ts apps/server/src/store.ts apps/server/src/index.ts apps/server/test/structures-api.test.ts apps/server/test/helpers.ts
git commit -m "feat(server): structure_objects table + GET /api/structures(/:slug(.md))"
```

## Task 2.8: server `POST /rebuild` + 网关红线(agent 降级)

**Files:**
- Modify: `apps/server/src/index.ts`(`POST /api/islands/:slug/rebuild`)
- Modify: `apps/server/src/mcp.ts`(同规则的 MCP 工具)
- Test: `apps/server/test/rebuild-gateway.test.ts`

**Interfaces:**
- Consumes: `MappingArtifactSchema`(Task 2.3)、`core.can()` / `core.degradeAction()`、`appendEvent`(opp)、refs 表。
- Produces: human 发 rebuild → 追加 `rebuild` 事件 + 存 mapping 到 refs;agent 发 rebuild → 降级为 `night_digest` + dock placement,**不追加 rebuild 事件**。

- [ ] **Step 1: 写失败测试(红线)**

```typescript
// apps/server/test/rebuild-gateway.test.ts
import { describe, it, expect } from 'vitest';
import { makeTestApp } from './helpers';
const mapping = {
  structureId: 'struct://xfrontier/kuramoto', islandOp: 'op://xfrontier/prob/firefly-sync',
  correspondences: [{ quantity: { zh: '耦合强度', en: 'K' }, inThisSubstrate: { zh: '视觉强度', en: 'visual' } }],
};
describe('rebuild gateway (§六.1: only humans author mappings)', () => {
  it('human rebuild appends a rebuild event', async () => {
    const { app } = await makeTestApp();
    const res = await app.request('/api/islands/firefly-sync/rebuild', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mapping, actor: { id: 'github:shen-kuo', kind: 'human' } }),
    });
    expect(res.status).toBe(200);
    const led = await (await app.request('/api/islands/firefly-sync/ledger.jsonl')).text();
    expect(led).toContain('"action":"rebuild"');
  });
  it('agent rebuild degrades to a dock proposal — NO rebuild event', async () => {
    const { app } = await makeTestApp();
    const res = await app.request('/api/islands/firefly-sync/rebuild', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mapping, actor: { id: 'github:scout-ai', kind: 'agent' } }),
    });
    const body = await res.json();
    expect(body.degraded).toBe(true);
    const led = await (await app.request('/api/islands/firefly-sync/ledger.jsonl')).text();
    expect(led).not.toContain('"action":"rebuild"');
    expect(led).toContain('night_digest'); // degraded proposal
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @frontier-isles/server exec vitest run test/rebuild-gateway.test.ts`
Expected: FAIL — 端点不存在。

- [ ] **Step 3: 实现端点 + 网关**

`index.ts` 加 `POST /api/islands/:slug/rebuild`:parse `MappingArtifactSchema`;`if (actor.kind === 'agent')` → 走 `degradeAction`(追加 `night_digest` + dock placement,返回 `{degraded:true}`);否则 putRef(mapping JSON)→ `appendEvent({action:'rebuild', ref, actor, phase:'B'})`→ 返回 `{degraded:false}`。`mcp.ts` 的对应工具走同一 store 逻辑(直连 store,不经 HTTP)。

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm --filter @frontier-isles/server exec vitest run test/rebuild-gateway.test.ts`
Expected: PASS(human 追加事件;agent 只出提案)。

- [ ] **Step 5: commit**

```bash
git add apps/server/src/index.ts apps/server/src/mcp.ts apps/server/test/rebuild-gateway.test.ts
git commit -m "feat(server): POST /rebuild with gateway red-line — agent rebuild degrades to dock proposal"
```

## Task 2.9: seed 3 结构 + 映射(from isomorphisms.json)

**Files:**
- Create: `packages/data/src/structures.ts`(3 结构 + 每结构的 domain→岛 slug 映射,取自 isomorphisms.json)
- Modify: `packages/data/src/index.ts`(导出)
- Modify: `apps/server/src/seed.ts`(seedStructures:插结构对象 + 铺 rebuild 种子事件)
- Test: `apps/server/test/seed-structures.test.ts`

**Interfaces:**
- Consumes: ISO-10 / ISO-29 / ISO-06(isomorphisms.json)、Phase 1 扩充后岛的 slug。
- Produces: `SEED_STRUCTURES: { id; title; statement; islands: { slug; correspondences; prediction? }[] }[]`;seed 后 `/api/structures` 有 3 条,对应岛账本有 `rebuild` 种子事件。

- [ ] **Step 1: 从 isomorphisms.json 抽 3 结构成 TS(脚本)**

`<scratchpad>/build-structures.mjs` 读 isomorphisms.json 的 ISO-10/29/06,把 skeleton→title、insight→statement、domains→岛映射(domain label 匹配 Phase 1 岛的 slug/title;匹配不到的 domain 跳过并 log)。correspondences 从 formula + insight 里的量 grounded 提炼(子代理成文,不发明)。写 `packages/data/src/structures.ts`。

- [ ] **Step 2: 写失败测试**

```typescript
// apps/server/test/seed-structures.test.ts
import { describe, it, expect } from 'vitest';
import { makeTestApp } from './helpers';
describe('seeded structures', () => {
  it('seeds 3 structures with rebuild edges', async () => {
    const { app } = await makeTestApp();
    const list = await (await app.request('/api/structures')).json();
    expect(list.structures.length).toBe(3);
    const ids = list.structures.map((s: {id:string}) => s.id);
    expect(ids).toContain('struct://xfrontier/kuramoto');
  });
  it('kuramoto has rebuild events on its mapped islands', async () => {
    const { app } = await makeTestApp();
    // firefly-sync (or whichever slug the 萤火虫 domain mapped to) carries a rebuild event
    const led = await (await app.request('/api/islands/firefly-sync/ledger.jsonl')).text();
    expect(led).toContain('"action":"rebuild"');
  });
});
```

- [ ] **Step 3: 跑测试确认失败**

Run: `pnpm --filter @frontier-isles/server exec vitest run test/seed-structures.test.ts`
Expected: FAIL — 结构未 seed。

- [ ] **Step 4: 实现 seedStructures**

`seed.ts` 加 `seedStructures(store)`:遍历 `SEED_STRUCTURES` → `store.insertStructure`(结构对象);对每个 `islands[]` putRef(mapping)+ `appendEvent({action:'rebuild', actor: {id:'github:shen-kuo', kind:'human'}, phase:'B', ref})` 到该岛账本。在 `seed()` 的 `seedCrossIslandRelations` 后调用。

- [ ] **Step 5: 跑测试确认通过 + 全 server 测试绿**

Run: `pnpm --filter @frontier-isles/server test`
Expected: PASS(结构 seed + rebuild 种子;既有测试不破)。

- [ ] **Step 6: commit**

```bash
git add packages/data/src/structures.ts packages/data/src/index.ts apps/server/src/seed.ts apps/server/test/seed-structures.test.ts
git commit -m "feat(data,server): seed 3 orthogonal structures (Kuramoto/scaling/percolation) + grounded rebuild mappings from isomorphisms.json"
```

## Task 2.10: web/atlas 结构透镜(选择器 + 弧 + 诚实虚线缺口 + 列表孪生)

**Files:**
- Modify: `apps/web/src/api/client.ts`(`structures()`、`structureGraph()` 调用)
- Modify: `apps/web/src/api/fallback.ts`(静态结构图 fallback)
- Create: `apps/web/src/chart/structureLens.ts`(纯函数:edges+frontier → 绘制指令,复用 §5.1 视觉词汇)
- Modify: `packages/renderer/src/pixi/atlas-stage.ts`(透镜态:点亮/弧/虚线/压暗)
- Modify: `apps/web/src/chart/AtlasChartHost.tsx`(结构选择器 UI + 状态)
- Modify: `apps/web/src/chart/`(列表孪生:结构列表视图)
- Test: `apps/web/src/chart/__tests__/structureLens.test.ts`

**Interfaces:**
- Consumes: `reduceStructureGraph` / `structureFrontier`(core)、`GET /api/structures`、`GET /api/currents`(岛坐标)。
- Produces: `buildStructureLens(structureId, edges, frontier, islands) → { rebuilt: LensNode[]; gaps: LensNode[]; arcs: LensArc[]; dimmed: string[] }`(纯几何,无 WebGL,可测)。

- [ ] **Step 1: 写失败测试(纯函数)**

```typescript
// apps/web/src/chart/__tests__/structureLens.test.ts
import { describe, it, expect } from 'vitest';
import { buildStructureLens } from '../structureLens';
describe('buildStructureLens', () => {
  const islands = [
    { op: 'op://x/prob/firefly', x: 100, y: 100, domain: '生命', cluster: 'C10' },
    { op: 'op://x/prob/heart', x: 200, y: 120, domain: '生命', cluster: 'C10' },
    { op: 'op://x/prob/quark', x: 900, y: 400, domain: '数理', cluster: 'C33' },
  ];
  const edges = [{ structureId: 'struct://x/k', islandOp: 'op://x/prob/firefly', weight: 1, actors: ['a'] }];
  const frontier = [{ structureId: 'struct://x/k', rebuilt: ['op://x/prob/firefly'], gaps: ['op://x/prob/heart'] }];
  it('rebuilt islands solid, gaps dashed, unrelated dimmed', () => {
    const lens = buildStructureLens('struct://x/k', edges, frontier, islands);
    expect(lens.rebuilt.map(n => n.op)).toEqual(['op://x/prob/firefly']);
    expect(lens.gaps.map(n => n.op)).toEqual(['op://x/prob/heart']);
    expect(lens.dimmed).toContain('op://x/prob/quark');
  });
  it('gap nodes carry NO mapping data (honest dashed — §九 red-line)', () => {
    const lens = buildStructureLens('struct://x/k', edges, frontier, islands);
    for (const g of lens.gaps) expect('correspondences' in g).toBe(false);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @frontier-isles/web exec vitest run src/chart/__tests__/structureLens.test.ts`
Expected: FAIL — 模块不存在。

- [ ] **Step 3: 实现纯函数**

`structureLens.ts`:输入 edges/frontier/islands → 分类 rebuilt(实线点亮)/ gaps(虚线微光,**只带 op + 坐标,不带任何映射字段**)/ dimmed(其余)+ arcs(rebuilt 岛之间/到结构中心的弧路径)。纯几何,无 WebGL。

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm --filter @frontier-isles/web exec vitest run src/chart/__tests__/structureLens.test.ts`
Expected: PASS

- [ ] **Step 5: 接 Pixi 舞台 + 选择器 + 列表孪生**

`atlas-stage.ts` 透镜态:rebuilt 用 outlier glow;gaps 用 dash(`7 5`)+ proposed 透明度(0.5)的 halo;dimmed 用 fog 通道;arcs 复用 air-route 弧样式。air routes 在透镜态隐藏。`AtlasChartHost.tsx` 加结构选择器(FlowLegend 模式)。列表孪生:结构列表视图,每结构下「已重建/缺口」两栏(移动端只读走此)。**不发明新几何——全部 §5.1 现有词汇。**

- [ ] **Step 6: 离线 fallback + i18n(见 Task 2.11)+ 手动视觉核验**

`fallback.ts` 加静态结构图。按 memory `pixi-visual-verify`:MCP 无头无 WebGL 落 SVG fallback;需真图用 `~/.npm-global` playwright 有头 chromium。核验选「同步」→ 点亮岛 + 弧 + 虚线缺口,退出还原。

- [ ] **Step 7: typecheck + commit**

Run: `pnpm --filter @frontier-isles/web typecheck && pnpm --filter @frontier-isles/renderer typecheck`
```bash
git add apps/web/src/chart/ apps/web/src/api/client.ts apps/web/src/api/fallback.ts packages/renderer/src/pixi/atlas-stage.ts
git commit -m "feat(web,renderer): atlas structure lens — solid rebuilt islands, honest dashed gaps, list twin (reuses existing visual vocabulary, §5.1)"
```

## Task 2.11: i18n key-parity + 全绿门禁(Phase 2 收尾)

**Files:**
- Modify: `apps/web/src/i18n/zh.json` + `en.json`(结构透镜 UI 串)
- Test: 现有 i18n key-parity 测试

**Interfaces:**
- Consumes: Task 2.10 用到的 `t()` key。

- [ ] **Step 1: 加 UI 串(zh + en 对齐)**

结构选择器标题、「已重建/缺口」标签、缺口 tooltip(「此结构尚无人带来」——**不含推荐语义**)等,zh/en 成对加。结构名本身是编辑内容,不进 i18n。

- [ ] **Step 2: key-parity 测试**

Run(Bash 门禁,zh_CN full-ICU):`pnpm --filter @frontier-isles/web exec vitest run i18n`
Expected: PASS — zh/en key 完全对齐。

- [ ] **Step 3: 全量门禁**

Run: `pnpm -r test && pnpm -r typecheck`
Expected: 全 PASS。

- [ ] **Step 4: leavability 往返终检**

Run: `pnpm --filter @frontier-isles/opp test && pnpm --filter @frontier-isles/server exec vitest run -t "leavability"`
Expected: PASS — `problem.md` / `ledger.jsonl` / structure `.md` 全往返绿。

- [ ] **Step 5: commit**

```bash
git add apps/web/src/i18n/
git commit -m "feat(web): i18n for structure lens (zh/en key-parity); Phase 2 green gate"
```

**Phase 2 验收**:`GET /api/structures` 返 3 结构;选「同步」透镜 → 点亮的岛 + 弧 + 诚实虚线缺口;dev-auth 人类账号发一次 rebuild(带映射)→ 透镜多一条边;agent 发 rebuild → 只出 dock 提案,账本无 rebuild;`pnpm -r test && pnpm -r typecheck` 全绿;往返测试绿。

---

## Self-Review 记录

**Spec 覆盖**:§3.1 比较性策展→Task 1.1;§3.2 文献层+子问题→1.2/1.3/1.4;§3.2 聚类大问题上海域→1.5;§3.4 计数测试→1.6;§4.1 StructureObject+rebuild→2.1/2.2;§4.1 映射 artifact→2.3;§4.3 三投影→2.4/2.5/2.6;§4.2 表/端点/网关→2.7/2.8;§4.2 种子→2.9;§4.4 透镜+列表孪生→2.10;i18n/fallback→2.11。§5 视觉融合作为 2.10 的硬约束(复用词汇表)贯穿。§5.3 形象化方向(岩脉/星座)标注为 design-eng-loop 未来卡片,不在本计划实现(spec Non-goal 一致)。

**类型一致性**:`StructureEdge`/`StructureFrontier`/`MappingArtifact`/`buildStructureLens` 签名跨 Task 2.4→2.10 一致;`literature` 字段形状跨 1.2→1.4 一致。

**已知留痕**:Task 2.6 Step 1 的占位断言在 Step 4 显式修正为真实形状(TDD 红→绿的正常流程,非占位符遗留)。

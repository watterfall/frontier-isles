# Connection Field v1 — 从关系目录到跨域连接场

**Status:** implemented and verified in the current working tree
**Date:** 2026-07-18
**Scope:** L0 atlas connection projection, explanation panel, and the existing human validation journey

## 1. Product outcome

The atlas must answer a question before asking the visitor to learn a taxonomy:

> 哪些看似无关的问题，正在共享同一种机制、数学形式、证据冲突或方法迁移？

The primary journey is therefore:

1. see several real convergences and direct relations together on the atlas;
2. focus one convergence and read the shared core, each problem's manifestation, and the analogy boundary;
3. optionally start from one concrete problem and reveal every recorded relation touching it;
4. narrow to two problems only when the visitor wants to compare, challenge, or author a testable mapping.

The existing problem-first passage remains useful, but it is the validation layer of the field rather than the product's first ontology.

## 2. One projection, three existing truths

`ConnectionField` is a browser-side, pure read projection. It does not create a new relation store.

| Channel | Existing source of truth | What may be asserted |
| --- | --- | --- |
| Shared mechanism | human-authored `rebuild` events and their resolved `mapping` refs | a structure has been explicitly rebuilt in each participating problem |
| Mathematical form | curated `BRIDGES` entries | the two problems share the named equation/skeleton |
| Evidence / contradiction | ledger-derived `Current` records | one island's recorded artifact was affirmed or contested by another |
| Method lineage | ledger-derived lineage currents | a fork/merge or transplant lineage exists between the two islands |

Theme, cluster, domain, chart distance, or xfrontier provenance may orient the reader but may never become a connection edge.

## 3. Read contract

`GET /api/structures/graph` keeps its existing `edges` and `frontier`, and adds resolved mapping records:

```ts
interface StructureMappingRecord extends MappingArtifact {
  refHash: string;
  actor: string;
  ts: string;
}
```

The added record preserves the explanatory content currently discarded by the graph reduce:

- structure quantity;
- manifestation in this problem;
- falsifiable prediction;
- optional evidence refs;
- optional analogy boundary / important difference;
- authorship and translation state.

Existing mappings remain valid. New interactive mappings must include a concise boundary so a useful analogy cannot silently become an identity claim.

## 4. Visual grammar

The atlas is not a force-directed graph. Problems remain islands in the authored world.

- A **mechanism convergence** is a small mineral-ink seam at the centroid of all participating islands, with branches to each member. It is not drawn as invented pairwise edges.
- A **mathematical form** is a direct ochre span between the two recorded endpoints.
- **Supporting evidence** is an azurite directed path with an arrowhead.
- **Contradiction** uses the same evidence path but ends in an inhibition tee.
- **Lineage / method transfer** is a malachite directed path.
- Weight changes stroke width; proposed/ratified state changes opacity; relation kind changes material/dash. No new status hue is introduced.
- Global mode keeps the whole world readable and dims unrelated islands only slightly. Focus mode frames the selected convergence/path and lets unrelated islands recede.

Every canvas mark has a DOM/list twin containing endpoint names, relation kind, status, and the source-backed explanation available at that layer.

## 5. Explanation contract

A focused mechanism convergence must show, in plain language:

1. **共同核心** — the structure statement;
2. **在每个问题里如何出现** — mapping correspondences beside the problem's title and research question;
3. **哪里不同 / 不能类推** — the authored boundary, or the explicit state “边界尚未记录” for legacy material;
4. **如何检验** — the mapping prediction and evidence refs;
5. **谁建立了对应** — mapping actor and ref provenance.

A focused direct path must show its formula or ledger relation type and both endpoint questions. If the underlying projection does not expose an argument summary, the UI says so and links the reader to the island evidence; it does not synthesize a reason.

## 6. Interaction states

- **Global:** all recorded convergence groups and direct paths; channel filters change both map and list.
- **Focused convergence/path:** only that relation remains salient; Escape or “返回全局” restores the field.
- **Problem entry:** search/select one problem; all recorded relations touching it rise together, without inventing nearest neighbours.
- **Pair validation:** within a mechanism convergence, choose a departure and another problem; the existing workbench opens with the shared core already fixed, while the human authors the new manifestation, boundary, and prediction.
- **Completion:** the atlas refetches the graph so the new mapping immediately becomes a visible branch and explanation record.

## 7. Language boundary

Primary labels use “内在联系 / 共同核心 / 证据支持 / 证据冲突 / 方法迁移 / 比较并检验”. “结构透镜、渡口、开航、星座、摆渡人” may remain in world lore or provenance notes, but not as prerequisites for understanding or operating the primary connection experience.

## 8. Non-goals and honest limits

- No automatic semantic-similarity edges.
- No claim that identical equations imply identical causal mechanisms.
- No AI-authored human mapping.
- No replacement of the append-only ledger, mapping refs, or curated bridge source.
- Current ledger paths expose relation type, sign, maturity, weight, and endpoints; full argument summaries remain a follow-up until evidence artifacts are projected with their contents.

## 9. Acceptance

- Opening the atlas reveals the connection field without selecting a source problem or structure name first.
- At least four multi-problem mechanism convergences, the curated mathematical spans, and live/fallback ledger currents are fused in one visual/readable field.
- A focused convergence answers shared core, per-problem manifestation, difference/boundary, and test using source-backed content.
- Relation channels are visually and textually distinguishable without color alone.
- Search is problem-first and returns only recorded relations.
- The existing comparison/authoring journey remains reachable as the focused validation step.
- Desktop and compact viewports have readable DOM twins; reduced motion removes draw-on/camera theatrics without hiding information.

## 10. Verification record

- The live graph currently resolves to 4 multi-problem mechanism convergences and 10 direct relations. The API reports 12 compressed structure edges, 24 full mapping records, and 7 explicit frontier candidates.
- The same read projection was checked at 1440×1000, 1024×900, and 390×844. All three open on the global field, preserve a complete DOM twin, and have no horizontal overflow or page errors in fresh browser sessions.
- Focus checks cover a three-problem convergence, a mathematical-form path, concrete-problem search, and the two-question validation workbench. The workbench keeps the target correspondence, boundary, and test human-authored and blank by default.
- Repository gates pass: 681/681 package tests, all workspace typechecks and atlas/data-import drift checks, the production build, `git diff --check`, and the full-stack Playwright world round trip.
- The production build still warns about two pre-existing large application chunks (`interior-bundle` 1,210.00 kB / 482.99 kB gzip and main 1,272.66 kB / 416.30 kB gzip). This is recorded performance debt, not a connection-field correctness failure.
- Remaining scientific depth is explicit: ledger-current argument bodies are not yet projected, authored relation channels need stronger provenance, and challenge/refutation plus falsification-to-workspace handling remain follow-up work. Mobile remains intentionally read-only.

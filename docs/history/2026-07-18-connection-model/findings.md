# Findings & Decisions

> Historical evidence from the 2026-07-18 implementation cycle. Read only when tracing a prior decision or verification claim.

## 2026-07-18 — Connection argument and challenge continuation

- The first Connection Field solved discovery and comparison, but a direct ledger path still exposes only relation type, sign, maturity, weight, and endpoints. A person cannot yet inspect the underlying claim/evidence body from the field or record a structured challenge there.
- The next product unit is therefore not another relation visualization. It is a source-preserving **connection dossier**: what is asserted, which artifact supports or contests it, who recorded it, what remains missing, and what concrete challenge would change the shared record.
- Any challenge must reuse an existing ledger capability and produce a canonical artifact/event or working-state consequence. A local toggle, generic comment box, or AI-written objection would repeat the formal-completion failure the user rejected.
- Compact viewports should receive the same dossier read truth, while the existing decision to keep ledger writes on desktop remains intact.
- Design remains a living jiehua research atlas: the dossier should read as an unfolded annotated evidence sheet connected to the selected map path, not as a SaaS detail card or a separate dashboard.
- CodeGraph confirms the loss point: `projectCurrents` groups ledger events by shared content ref, derives endpoint/kind/sign/weight, and then discards the shared ref and all member events. `ConnectionPath` therefore can only manufacture the honest placeholder “argument body not yet exposed”.
- The ref store already retains `{ kind, content }`, and claim evidence parsing already accepts either a direct evidence-role data ref or an embedded `evidence` object. The missing work is a resolved read projection, not a new evidence database.
- A current can aggregate multiple refs/events between the same endpoint, kind, and sign. The dossier contract must preserve a list of backing ref groups rather than pretend one arbitrary ref explains the whole edge.
- The current seed web is intentionally sparse and canonical: two evidence supports, two refutations, one lineage pair, and two bridges. This makes it suitable for exact dossier/transaction tests without semantic-similarity fabrication.
- Existing write behavior reveals the deeper bug and the compatible fix. `gateway(refute|validate)` stores the response payload as its own content-addressed ref, while the payload shape may embed the challenged claim under `ref`. The ledger event therefore points at the response artifact, not directly at the original claim, but `projectCurrents` currently groups only by the event ref. Real interactive responses can be written yet fail to join the cross-island current.
- Do not overwrite that response ref with the claim ref: doing so would throw away the response body/evidence provenance. Instead, the resolved relation projection should treat an embedded `ref`/`targetRef` as the semantic target while retaining both `targetRef` and `responseRef` in the dossier. Legacy seed events that point directly at the target continue to work unchanged.
- The existing public ref route already provides leavability, and `/api/currents` is the correct fused read seam. The server can resolve refs in one pass and return bounded backing groups, avoiding N browser ref fetches and keeping fallback behavior deterministic.
- New `refute` and `validate` writes are already evidence-gated before capability degradation and land in the Workshop. That is the truthful “failed test returns to working space” seam; the UI should expose it as `方法与试验`, not add a second failure inbox.
- Historical seed relations deliberately point their event ref straight at the anchor claim/publish artifact and carry no response body or evidence artifact. The read projection must label those records as historical relation-only evidence rather than inventing an explanation. New interactive responses can and should expose body, evidence, actor, time, target ref, and response ref.
- A challenge from the global field still needs an explicit responding problem/island because capability is evaluated on the ledger that receives the event. The user must choose which endpoint is speaking; the system must not silently assign a voice or actor to an island.
- Live API proof confirms the server has seven ledger currents: two support, two contest, one two-event lineage path, and two bridges. The two contest whirlpools already preserve their target claim refs even though `Current` does not.
- The live `living-wires` target claim resolves to kind `claim`, text `活体导线 · 首个可检验论断`, and a real evidence descriptor with RO-Crate URI, role, and SHA-256 hash. Its support and contest events both point to that same target ref but contain no historical response body. The dossier can therefore show the actual assertion/evidence now and honestly label the old reactions as “response text not recorded”.
- Publish refs resolve similarly with a title plus replication-role evidence. The extractor should use a small explicit content vocabulary (`text`, `title`, `body`) and display unknown JSON only through the public ref link, never stringify arbitrary payloads into pseudo-explanations.
- Offline sea fallback already synthesizes the same seven relation events from `SEA_SEED_RELATIONS`. Extending the core projection with record metadata will keep fallback topology/provenance aligned; only resolved content/evidence should degrade to an explicit unavailable state when no ref resolver exists.
- `ConnectionFieldPanel.PathDetail` is the exact UI loss point: it currently renders the two problem briefs followed by a generic ledger-boundary paragraph. Replace that paragraph for ledger paths with one unfolded dossier section; mathematical paths retain their formula-boundary contract.
- The panel already lives in a lazy chunk and has a focused-path state. The challenge form can remain progressively disclosed inside that focus rather than introduce a new route/modal. It needs `actor`, a refresh callback, and a desktop-write capability from the chart host.
- `AtlasChartScreen` already refetches structures, graph, and sea whenever the root `connectionRevision` changes. The same revision used after a mapping write can refresh a response write without a cache layer; focused path state can remain stable when the new response strengthens the same endpoint/sign row.
- App already owns both the authenticated/dev actor and `connectionRevision`. Extend the existing connection/structure action bundle with actor plus `onConnectionWrite`, rather than create another global store.
- A fully authored response should keep the target claim ref and the response artifact ref separate, require a concrete body, a proposed discriminating test, and an evidence/replication RO-Crate descriptor, then land via the existing Workshop gateway path. Only evidence/contradiction paths expose this form in v1; mathematical, mechanism, bridge, and lineage records remain inspectable but use their own future challenge contracts.
- Governance stays intact: `refute` requires `station_write`, `validate` requires `validate`, both begin at researcher, and unauthorized lone agents degrade to proposals rather than silently pushing. The dossier UI must surface permission failures instead of weakening that ladder.
- Mobile has a dedicated focused-path renderer and already fetches the same live sea payload. Add the same target assertion, evidence descriptor, response provenance/body/test, and legacy missing-body state there; omit the authoring form and retain the explicit desktop-write note.

## 2026-07-18 — Connection experience reset

### User correction

- The current Ferry Dock, Tearoom, ferryman, constellation, structure-theme, and passage vocabulary has become an abstraction layer the user must decode before seeing an actual relationship.
- Formal completion of a `rebuild` transaction is not the product outcome. The real outcome is a defensible connection between two problems that reveals a shared mechanism, an important difference, and a next observation or experiment.
- This requires a product/data/UI reset, not a copy polish or a prettier Dock building.
- The problem-first two-island journey is only one entry point. The more important entry is a global visual/fused view that reveals internal relationships across many fields and problems before the user chooses a path.

### Live baseline evidence

- The default atlas hides the connection tool behind a collapsed “结构透镜”. Opening it first presents six theme names and eight abstract structure names before any source problem is selected.
- Selecting “耦合振子同步” shows one rebuilt island and 22 gaps. Most of the visible area is a long target list with disabled “开航” actions; it does not explain why any listed target is a plausible connection.
- The selected structure supplies a general statement, `ISO-10`, xfrontier record ids, and a three-step ritual. It does not put source observations, target observations, a shared mechanism, or analogy limits next to each other.
- The map responds correctly and the graph is provenance-safe, but the user sees a taxonomy and a workflow rather than a discovery. This confirms the failure is the interaction unit, not rendering quality.
- Baseline screenshots: `tmp/verification/reframe-baseline-atlas.png` and `tmp/verification/reframe-baseline-structure.png`.

### Stronger product thesis

- Primary object: a **typed connection field** in which several concrete problems can converge through a shared mechanism, method, constraint, evidence pattern, or contradiction.
- Supporting object: a reusable mechanism/structure, visible as the explanatory core of a convergence—not as a taxonomy or the first choice the user must understand.
- Primary action: inspect the global field → focus a meaningful convergence → understand how it manifests differently across problems → choose one path to compare, challenge, and test.
- Secondary action: start from one concrete problem → reveal its position and strongest paths inside the same field.
- World metaphors remain visual atmosphere and optional secondary labels. The primary controls should use verbs such as “找连接”, “比较”, “建立对应”, “检验”, and “继续研究”.
- Learning and research remain one action, but the UI need not explain this with “charted/frontier passage” terminology. It can say “已有验证” and “尚待验证”.

### Visualization thesis

- Do not replace the current sidebar with a force-directed hairball. The fused view needs a restrained semantic grammar: problems remain spatial islands; shared cores appear as convergence seams/fields; relation channels have distinct stroke/material treatments; evidence state changes solidity and annotation.
- The field should support three scales: global convergence landscape, focused multi-problem explanation, and two-problem validation workbench.
- A convergence may include more than two problems. Pairwise comparison is a downstream validation tool, not the ontology of the global view.
- Topic similarity alone is insufficient. A visible path requires an explicit typed reason and traceable evidence; speculative candidates must be visually and verbally separated from ratified relations.

### Data audit for a real connection field

- The browser-safe L0 projection already carries enough problem context for meaningful labels: bilingual title and QFocus, one-line brief, domain, xfrontier cluster provenance, nine editorial scores, and a real headline citation. Deep essays/interiors remain correctly outside L0.
- Seed and user mapping artifacts contain the actual explanatory material the current UI hides: structure quantity → substrate manifestation correspondences, a falsifiable prediction, optional evidence refs, authored language, and translation status.
- The current graph reduce intentionally collapses each real mapping to `structureId + islandOp + weight + actors`. This is sufficient for provenance-safe geometry but insufficient for explaining why problems connect.
- Current “gap” candidates are generated from shared cluster or domain. That is an honest absence around a structure, but it is not evidence that a particular target belongs in a connection field. The 22-item sync list demonstrates the distinction.
- A new read projection must resolve mapping refs and expose connection content without weakening write invariants. The primary field should be built from ratified mappings; speculative paths need a separate, explicitly non-edge evidence model.
- The present mapping schema lacks two fields the fused explanation needs: relation channel (`mechanism`, `method`, `constraint`, `evidence`, `contradiction`) and a concise boundary/important-difference statement. Backward-compatible derivation/fallback is required for existing refs.

### Existing relation systems that must be fused

- The repo already contains three independent truthful relation systems:
  1. human `rebuild` mappings: reusable mechanism ↔ problem manifestations, with correspondences and predictions;
  2. three curated `BRIDGES`: explicit cross-domain mathematical skeletons with formulas and named endpoints;
  3. ledger currents: evidence, bridge, and lineage relations with sign, direction, maturity, and weight.
- These systems are currently fragmented. `BRIDGES` are consumed only by the dark Collision founding overlay; structure mappings are flattened in the Structure Lens; ledger currents have a mature accessible visual grammar but are not the default global connection experience.
- This fragmentation is the actual “not connected” failure: the product has multiple relation truths but no unified read model, no shared visual grammar, and no one place where a user can move from global convergence to evidence to action.
- The redesign should not create a fourth relation store. It needs a pure `ConnectionField` projection that preserves each source's semantics and exposes them together:
  - `mechanism` from ratified rebuild mappings;
  - `mathematical` from curated bridge skeletons;
  - `evidence` and `contradiction` from signed ledger currents;
  - `lineage` and `method transfer` from ledger lineage/transplant actions.
- Visual fusion can reuse the existing deuteranope-safe relation encodings: solid/dashed/dotted material, arrow versus inhibition head, maturity opacity, and evidence weight. The missing layer is semantic grouping and explanation, not a new color palette.

### Skill influence

- `frontend-design` makes the reset problem-first, asymmetrical, editorial, and evidence-led rather than another card taxonomy; it also preserves the jiehua atlas instead of flattening the product into a generic research dashboard.
- `agent-browser` exposed the real baseline failure from the accessibility tree and screenshot: a theme/structure directory plus an unexplained 22-item gap list.
- `planning-with-files` fixes the new outcome and gates before code changes so formal transaction completion cannot substitute for actual connection quality again.

### Connection-field contract and first data gate

- `docs/connection-field-v1-2026-07-18.md` now freezes the three-scale interaction: global fused field → focused multi-problem explanation → optional two-problem validation.
- Mechanism relations remain structurally bipartite. The map will draw a convergence seam/hub with branches to participating problems, not a chain of invented island-to-island edges.
- The structure graph read API now preserves resolved mapping records alongside compressed edges. Repeated mappings remain visible as refinements rather than being collapsed out of the explanation layer.
- A mapping can now carry an explicit `boundary`: the most important substrate difference or condition where the analogy stops. Legacy refs remain valid; new interactive passages require a boundary at the server semantic gate.
- All 12 curated seed mappings now include bilingual boundaries grounded in the mapping's existing mechanism and prediction. Existing databases will receive an idempotent content-addressed refinement event when the canonical mapping content changes; the compressed edge count remains stable.
- Focused proof after this data change: core 167/167 and server 75/75 pass, including resolved mapping records, boundary compatibility, passage rejection without a boundary, and seed idempotence.

### Integrated field, plain-language island layer, and responsive proof

- The shipped read model now fuses three existing truths instead of inventing a fourth graph: human mechanism mappings form multi-problem convergence hubs; curated formulas form mathematical paths; signed ledger currents form bridge, evidence, contradiction, and lineage paths.
- Current live data projects to four multi-problem convergences and ten direct paths. Network cascade is the first three-problem hub; its renderer branches all three islands into one seam rather than fabricating three pairwise mechanism edges.
- The global field is now open by default and frames all recorded participants. A focused convergence shows the shared core, each concrete QFocus, quantity correspondence, analogy boundary, prediction, provenance, and refinement count before a pairwise action appears.
- Problem-first search is a secondary entry into the same projection. Browser proof with “机器人” returned real QFocus matches; selecting “主动推断工程化” reduced the view to its one recorded mathematical relation rather than suggesting theme/proximity neighbors.
- The validation workbench now places problem A, problem B, the shared core, and problem A's best bounded ledger mapping on one sheet. Problem B's correspondence, important difference, and failure condition remain blank and human-owned.
- Primary island vocabulary is functional: `连接工作台`, `开放讨论`, `问题对照区`, `机制与证据`, `方法试验区`, and `交叉检验区`. Stable internal ids and two legacy Chinese aliases keep old notebooks/data readable.
- A 390 px audit found that the old MobileShell hid the entire new thesis. Mobile now opens on a read-only Connection tab backed by the same API/fallback projection, with global convergence/path lists, hub glyphs, focused boundaries, direct-relation detail, and concrete-problem search. Writing remains explicitly desktop-only.
- Fresh desktop and mobile browser sessions have empty page-error lists, only Vite/React development console messages, zero horizontal overflow at 1440 and 390 px, and reduced-motion media active. The mobile default exposes 4 convergences + 10 direct paths rather than a disabled “bridge” tab.
- Screenshot evidence: `tmp/verification/connection-field-global-framed.png`, `connection-field-convergence.png`, `connection-field-direct-path.png`, `connection-field-problem-focus.png`, `connection-workbench-plain.png`, `connection-field-mobile-global.png`, and `connection-field-mobile-focus.png`.

## 2026-07-18 — Island districts, building floors, and structure crossings

### Request and framing

- This iteration adds two foundational spatial dimensions: an island-local district map that progressively opens, and multi-floor building interiors with distinct explorable spaces.
- The Structure Lens must expand in theme/content using the current `xfrontier.science` project as a primary reference, then participate in district/building diversity and interdisciplinary collision.
- The existing atlas already has a world-level region tier. To keep the hierarchy truthful, implementation contracts will call the new island-local units `districts` even when Chinese product copy uses “区域 / 岛内分区”.
- This is authorized as implementation work, not a planning-only exercise. The final bar includes underlying logic, display/interaction, tests, build, and live browser evidence.

### Initial CodeGraph findings

- `ExplorationSession` persists world pose, course history, visits, sampled real currents, notes, selected structures, and completed passages. It has no island-district or building-floor navigation state yet.
- L1 generation currently produces stations, scenery, residents, ghosts, lanterns, domain/status/tide data. It has no semantic district model.
- `packages/renderer/src/scene.ts` already has `Growth.floors`, derived from independent reproduction count, but that value is render growth—not a navigable floor identity/content contract.
- `StationInteriorDrawer` and the lazy `INTERIORS` corpus are the likely L2 seam; the district/floor implementation must preserve the existing L0/L1 bundle split.
- Broad CodeGraph exploration was too large for one capture. Continue with narrow symbol/file nodes before direct code reads.

### Design authority and live external reference

- `.impeccable.md` confirms the audience and delivery contract: open-science researchers and interdisciplinary communities need calm orientation, progressive depth, evidence provenance, and a keyboard/list twin for every spatial action.
- The required visual direction is warm paper, mineral ink, ruled jiehua architecture, tidal/cartographic marks, and data-grounded signs of habitation. Explicitly avoid XP, badges, generic SaaS cards, glassmorphism, and sci-fi AI glow.
- The live `https://xfrontier.science/` endpoint responds as the Chinese SPA “颠覆性交叉学科前沿地图”, build id `2b8c551da5b6`, currently loading `/assets/index-CkifJaIX.js` and `/assets/data-core-D2RlEUvs.js`.
- Because the HTML is only an app shell, theme verification must inspect the currently shipped first-party bundle rather than infer from old memory or page markup.
- Direct import of the current first-party bundle confirms live counts: `1,477` records, `53` Chinese/English clusters, `9` dimensions, and `13` ranking profiles.
- The nine current editorial dimensions are: paradigm/unknown, interdisciplinarity, new tools/methods, crowd/open participation, human-resistant-to-batch-AI, low-capital access, substrate reality, reachable/compressible core, and non-overheated “lowland”. These are useful theme/floor design axes, but they are editorial metadata—not structure-graph edges.
- The live bundle still contains concrete handles such as virtual cells, machine-readable science, ignorance maps, formal mathematics, citizen participation, and substrate-first directions. The next pass must map these into a compact spatial vocabulary rather than importing 1,477 records into L1.

### Narrow model findings

- `GeneratedIslandScreen` loads island detail and ledger together, derives claim growth, active stations, tides, rituals, and a lazy/offline interior fallback. This is the correct integration surface for district projection because it already owns the real island evidence inputs.
- Current L2 navigation is a single `StationInteriorDrawer`: one selected station maps directly to one content section. It has no selected floor, floor list, cross-building route, or semantic cutaway.
- The existing structure schema intentionally stores only bilingual title, one-sentence regularity, lifecycle status, and license. Structure graph edges are rebuilt from ledger mapping artifacts, so editorial theme expansion must not alter or pre-author graph edges.
- Seed structures already cite xfrontier isomorphism provenance. Expansion can add authoritative structure objects/mappings only where justified, while a separate theme vocabulary may organize discovery without claiming an edge.
- The browser-safe atlas item already carries xfrontier cluster provenance (`code`, zh, en). District/floor projection can therefore inherit a real external theme without importing the heavy interior or the full 1,477-record corpus into L0.
- The flagship interior schema provides typed questions, digests, debates, data rows, scraps, gallery items, tea exchanges, and residents. This supports semantic floor grouping without inventing generic filler content.
- Notebook persistence is currently version 2 and explicitly hydrates durable fields. Adding district/floor visits requires a versioned backward-compatible migration rather than a second ad-hoc localStorage key.
- Existing world session state resets navigation safely at L0 while retaining field material. New local-depth state should follow the same contract: retain surveyed districts/floors, but reset active room selection on boot/navigation.
- `App.tsx` currently passes only scene/night/station/actor callbacks into `GeneratedIslandScreen`; the durable exploration session remains in the app root. District/floor survey actions therefore need an explicit prop bridge rather than a new hidden store.
- Mobile exits to `MobileShell` before the desktop stage. The new desktop authoring/survey interactions will not accidentally imply mobile writes, but the read-only mobile island summary should still expose that districts/floors exist.
- The generated L1 currently overlays the Ferry workbench at app level. New island depth UI must coexist with that modal and close/freeze appropriately rather than compete for focus.
- `StationInteriorDrawer` is currently an absolute 560px scroll and uses a non-button close `<div>`. The floor upgrade is also an opportunity to add dialog semantics, actual buttons, Escape/focus return, responsive width, and floor keyboard navigation.

### Candidate interaction contract

- Use five island-local programs instead of arbitrary terrain slices: Harbor, Inquiry, Archive, Works, and Observatory. Each maps to real station kinds and carries xfrontier-informed naming/description variants.
- “Opening” means a visitor has surveyed/revealed an existing area in their local field notebook; it does **not** claim that the island's research progressed. Evidence and available content determine whether a district can be surveyed.
- Persist `surveyedDistricts` and `visitedBuildingFloors` in the existing notebook with a version migration. Keep current district/floor selection transient.
- Floors partition real station content into distinct, non-overlapping groups. Questions may split by open/rewritten/closed state; other stations paginate real items into archival/working levels; residents split human and governed-AI presence.
- An active structure may add a visible crossing route and a dedicated structure lookout/transfer floor, but it cannot create an island-to-structure graph edge unless a real mapping/rebuild receipt exists.

### UI integration findings

- `GeneratedIslandScreen` already has three overlays (claim detail, ritual detail, station interior), a DOM station index, night timeline, dossier HUD, transplant trigger, and leave links. The district map should replace/organize part of the station-index journey rather than simply add another unrelated floating control.
- The district UI can own building entry: a surveyed district reveals its assigned station buttons and still delegates to `handleStation`, preserving both Pixi taps and the accessible DOM path.
- The current drawer renders every item in one long list. Refactoring `SectionBody` to accept a floor's item indexes will create genuinely non-overlapping floor content and lower information overload.
- The drawer is implemented almost entirely with inline style, while the rest of the flagship shell has a tokenized CSS system and explicit focus styles. The upgrade should move the new cutaway/floor chrome into reusable CSS classes rather than compound the inline-style debt.
- `StructureLensPanel` currently presents a flat list of three structures. Theme chips/groups and per-structure xfrontier provenance can expand content orientation while retaining the rebuilt/gap list twin below.
- Current seed structure metadata includes only an `isomorphism` string outside the authoritative `StructureObject` schema; the API does not expose that provenance or a theme. Schema/server/client projection must be extended if these are to be trustworthy visible product content.
- `FRONTIERS` contains 128 browser-safe/deep editorial entries but deliberately embeds zero interiors; rich interiors live in the separate lazy `INTERIORS` bundle. District projection may use atlas cluster/depth at L1, while floor content must continue to load through `interiorBySlug`.
- Current corpus slugs provide several high-confidence structure anchors: `formal-math`, `causal-rep-learning`, `self-learning-matter`, `cell-digital-twins-virtual-cells`, `anomaly-as-signal-cross-domain`, `collider-anomaly-detection-transplanted-to`, and `functorial-cross-domain-structure-transport`.
- The local workspace already has `tsx`, so data contracts and curated mappings can be audited programmatically without adding a dependency.
- The heavy interior bundle currently covers 12 flagship islands. A general floor plan must therefore derive a truthful baseline from every island's QFocus/depth/literature/ledger, then enrich those 12 with their typed interior archives.
- `seed()` currently returns immediately when any island exists. Without an idempotent catalog backfill, an existing local database would never receive new structures/themes even though a fresh in-memory test passes.
- Offline fallback derives structures and edges from the same `SEED_STRUCTURES`, which is a strong seam: extending that catalog once can keep API-absent and fresh-server behavior aligned.
- High-confidence mapping candidates were audited against the current curated island briefs/methods/barriers and citations. The clearest new regularities are intervention-based identifiability, anomaly-as-signal, executable knowledge commons, substrate-local learning, and model↔reality feedback loops.

### Structure catalog migration rule

- Extend `StructureObject` with optional theme/provenance fields so old Markdown remains readable.
- Make seeded structure-object insertion update only known seed IDs, and add missing seed mapping edges only when the graph does not already contain the same structure/island pair.
- Run this catalog reconciliation when the DB already has islands. This updates product metadata and missing canonical seeds without duplicating rebuild events or touching user-created structure IDs.
- Keep `scaling` as the intentional unmapped pure frontier; additional mappings are only added where the current island brief supplies a defensible quantity correspondence and falsifiable prediction.

### Implemented structure catalog

- `StructureObject` now accepts optional `theme`, `isomorphism`, and first-party provenance (`source`, URL, record ids, review date) while remaining backward-compatible with old Markdown.
- The catalog now contains 8 structures and 12 seeded structure/island edges in total. New themes cover causal inference, unknown mapping, executable knowledge, living computation, and simulation twins alongside collective dynamics.
- Existing databases reconcile catalog objects and missing seed edge pairs idempotently. Focused server coverage proves a second seed pass leaves the graph byte-for-byte unchanged.
- Focused gates after this layer: OPP `6/6`, server structures `15/15`, web structure lens `10/10`, data typecheck + atlas drift check pass.

### Implemented notebook depth state

- `ExplorationSession` now records local district surveys and per-building floor visits. Docking records only the Harbor arrival; deeper districts require explicit actions.
- Notebook persistence is v3, accepts v1/v2/v3, sanitizes district/floor records, and retains the existing safe L0 boot behavior.
- Markdown export now includes an island-district route and building-floor ledger separate from real currents/passages, keeping local cartographic discovery semantically distinct from OPP progress.
- Focused web proof: session + notebook `15/15`; web typecheck and the L0/L1 data-import boundary pass.

### Implemented pure spatial projections

- `frontierProgramOf` compresses current bilingual cluster language into six stable spatial programmes while leaving the atlas cluster itself untouched.
- `projectIslandDistricts` computes five district states from survey history plus evidence/making/horizon signals. It exposes explicit sealed reasons and marks only Harbor/Works/Observatory as a selected-structure crossing.
- `projectBuildingFloors` normalizes real QFocus/depth/literature/ledger/interior/structure material into stable, unique floor ids. Rich Question Wall content is partitioned without repeats; non-interior islands still receive truthful baseline/depth floors.
- Structure crossing floors appear only in Dock/Workshop plans and state plainly that real graph edges still require human rebuild mappings.
- Focused projection proof: `6/6`; web typecheck and data-import boundary pass.

### Live xfrontier theme families relevant to spatial depth

- The 53 live clusters include several useful spatial-program families: ignorance mapping, anomaly-driven discovery, cross-domain method transplant, machine-readable/open science infrastructure, distributed sensing, digital twins, formal science, complex systems, causal science, and living/physical computation.
- These support a compact district vocabulary: **Question/Fog**, **Observatory/Sensing**, **Archive/Commons**, **Workshop/Transplant**, and **Simulation/Counterfactual**. A structure crossing can then make one of these programs salient without claiming all islands share a graph edge.
- Concrete current xfrontier handles verified in the live bundle include `无知地图：科学盲区的量化制图`, `机器可读的科学发现（ORKG 与纳米发表）`, `公民异常哨兵`, `跨域方法移植`, `虚拟细胞的因果基础模型`, `形式化数学与证明库`, and `会自学习的物理网络`.

### Guardrails carried forward

- Spatial richness must remain ledger/data-grounded and must not become XP/leaderboard gamification.
- New visual exploration requires a keyboard/list twin, truthful mobile behavior, day/night support, reduced motion, and realistic-density checks.
- All pre-existing Ferry Dock / Constellation Passage worktree changes are user-owned and remain in scope; no reset or cleanup may discard them.

## Requirements

- Build on the current project rather than introducing Graphify or another knowledge-graph system.
- Align the iteration with the project's long-term goal and deliver a large, coherent improvement.
- Use `/Users/jili/Downloads/Frontier-Isles_渡口补完_执行纲要.md` to complete and strengthen the earlier dock/ferry requirement.
- Preserve evidence truth, continuous-world exploration, accessibility, responsive behavior, and the scholarly atlas character.
- Implement and verify the upgrade; do not stop at a speculative plan or visual mock-up.

## Research Findings

- The repository is clean on `main` and matches `origin/main` at the start of this iteration.
- `.impeccable.md` defines the audience as open-science researchers, interdisciplinary communities, governed AI residents, and visitors who must be able to orient before progressively revealing depth.
- The required aesthetic is a lived-in hand-drawn research atlas in the Chinese jiehua lineage, not a dashboard, card grid, or gamified world.
- All prominent spatial state must remain traceable to real problem-object or ledger data; every spatial interaction needs a readable and keyboard-accessible list twin.
- The delivery bar includes desktop/tablet/mobile, day/night, keyboard/touch, reduced motion, realistic density, and loading/empty/error states.
- The July 13 continuity work deliberately introduced persistent world state (`nearbyIslandSlug`, `courseIslandSlug`, `courseHistorySlugs`, `visitedIslandSlugs`, remembered pose), but prior live audits still judged the L1 exploration perspective as thin and the overall experience as partially disconnected.
- The July 16 L0/L1 bundle split is a verified success and is a hard constraint: the atlas must continue importing browser-safe summaries while heavy interior content remains lazy and behind direct subpaths.
- The current `ExplorationSession` already holds richer, truthful field material than simple visit progress: ordered course history, sampled real ledger currents, and per-island human notes. These primitives are candidates for a stronger cross-world journey rather than another isolated feature page.
- `explorationReducer` preserves pose and notebook material across docking/return, but clears the active course on dock. The journey therefore retains history but loses the visible intent at the moment the user reaches the target unless another surface interprets the history.
- CodeGraph reported no covering tests for the central `ExplorationSession`/`ExplorationAction` symbols; this needs direct verification before using the state as a larger product backbone.
- The API already exposes evidence-grounded actions: ledger retrieval, morning-report decisions, driftwood retrieval/transplant, event posting, harbor state, and structure graph data. A flagship iteration can connect exploration to real action without inventing a parallel backend model.
- `docs/ROADMAP.md` confirms the L0.5 field layer and local-first notebook are already shipped: continuous flight, question-led course, altitude alignment, current sampling, survey notes, docking/return, reload-safe persistence, visible log, and Markdown export. Rebuilding those features would be duplication.
- P3 is assessed at roughly 78%. Its remaining product-level gaps include account sync (blocked on a truthful protocol action), the relations lens, ferryman economy, and interop; the relations representation was intentionally hidden because its always-on form occluded the chart.
- The roadmap's explicit near-term sequence is: L2 accessibility/semantic controls, then a structured field board (route observations, question clusters, evidence cards, island/current links), then an on-demand relations lens built from the existing LOD-gated air-route form.
- The atlas-world authority says the world map is already a four-tier, continuous semantic-zoom product. The next major leap should therefore deepen what a route means and what users can carry across it, not redraw the world map again.
- A high-leverage opportunity is emerging at the intersection of three already-shipped truths: the field notebook records course/current/note traces, the relation projection exists but lacks a legible interaction model, and the structured field board is the desired future form of the deferred whiteboard.
- The roadmap order is explicit: the next mandatory foundation is an L2 accessibility/semantic-control pass; the structured field board remains deferred with the whiteboard positioning decision; the relations lens is the next world-level product feature after that foundation.
- A major iteration must not silently resume the blank whiteboard. The legitimate large scope is either (a) accessibility across the deep journey plus one newly legible world relation experience, or (b) a focused field-board prototype that does not claim collaborative/ledger semantics. Live inspection will determine which has the stronger default-path impact.
- The supported local truth surface is `pnpm dev`, which starts the server and Vite web app together. Repository-wide gates are `pnpm test`, `pnpm typecheck`, `pnpm build`, and `pnpm test:e2e`; the web typecheck also enforces the L0/L1 data-import boundary.
- The web stack already includes React 19, Pixi 8, i18next, Yjs, and native CSS tooling. No new UI or motion dependency is necessary for this iteration.
- Initial live probe: `http://localhost:5173` responds `200`, but `localhost:8787/api/islands` has no listener. Browser findings must therefore label API-backed state as degraded/fallback until the server process is confirmed.
- The root dev command revealed the API/server child failed with exit 137, while an existing Vite process already owned 5173. The current browser surface is not yet valid full-stack evidence.
- The supplied outline reframes the whole iteration: this is not another atlas/L1 layer. The missing object is a cross-island pattern hub (a “constellation”) that gives many existing analogy-mapping bridges a shared home and makes transfer the unit that people operate.
- Only the pattern hub is genuinely new. Dock passage, the proposal-only ferryman, driftwood for valuable failures, the ledger, role progression, and the two-plane architecture must be reused rather than rebuilt.
- The irreducible human act is mapping each variable/relationship from a known manifestation into the unfamiliar destination and stating a falsifiable prediction. AI can suggest, challenge, translate, code, simulate, and visualize, but cannot ratify that mapping.
- Learning and research must remain one path: transferring a pattern to a previously verified island is learning; transferring it to an unverified island is research. Destination evidence state, not a mode switch or separate data model, supplies the distinction.
- The most dangerous implementation failure is to render patterns as parent categories above islands—or, equivalently in this product, to make “constellations” another altitude tier. That produces a tidy directory tree and discards the cross-cutting passage mechanism.
- A second high-risk failure is a visually impressive constellation museum where AI has already mapped everything and people only browse simulations. The primary product metric must remain hands-on reconstructions versus passive consumption.
- The current roadmap's on-demand relations lens can become the presentation mechanism for pattern hubs, but the dock must remain the action surface. This also resolves the atlas altitude conflict: constellations are a cross-cutting relationship projection/lens, not the meaning of `altitudeZ`.
- The required acceptance evidence is behavioral: a person unfamiliar with a pattern independently transfers it to a new island, supplies the mapping, and predicts an observable result; the strongest evidence is a practice passage unexpectedly opening a genuinely unexplored island.
- Current code already contains more of the dock-completion mechanism than the roadmap summary exposed: the OPP ledger has a native `rebuild` action described as a human rebuilding a cross-substrate structure on an island, and the web API already exposes `/api/structures` plus `/api/structures/graph` for the structure ⇄ phenomenon bipartite graph.
- The existing transplant path already enforces the key human-action guard: `Store.transplant` derives a human membership role, requires the `transplant` capability, and explicitly denies agents. It builds one `bridge_artifact`, writes one `transplant` ledger event, and places the artifact first at `dock` and then at the target station.
- Existing transplant input is driftwood-centered (`driftwoodRef`, one of four bridge artifact types, destination station, optional body/flow). It does not by itself express a many-island pattern hub, human variable mapping, destination evidence state, or falsifiable prediction.
- The pattern hub may already correspond to the codebase's `structure` object rather than requiring a second “constellation” domain type. This must be verified before adding schema: the correct implementation may be to surface and complete the existing structure/rebuild model through the dock.
- CodeGraph found focused core tests for `buildTransplant`, but did not identify direct coverage for the server transplant method, web API transplant call, or central role type. The new vertical slice needs explicit tests at those seams.
- The `structure` model is confirmed to be the intended constellation hub. Structures are authoritative Markdown-backed knowledge-plane objects; `rebuild` events reference human-authored `mapping` artifacts, and the global structure ⇄ phenomenon graph is derived from all ledgers rather than stored as a separate relation table.
- Seed data already demonstrates the desired artifact shape: `MappingArtifact` carries `structureId`, destination `islandOp`, `correspondences`, and an optional falsifiable `prediction`; seeded mappings are attributed to a human master with `credit:human/conceptualization` and placed at the dock.
- An on-demand `StructureLens` and accessible `StructureLensPanel` already exist on the Pixi atlas path. They illuminate rebuilt islands, connect them with existing air-route geometry, expose near/far gaps, and intentionally carry no suggested mapping data for gaps. This is already the correct constellation-lens red line.
- The visible structure panel is currently observational/navigation-oriented: users can select a structure and sail to rebuilt or gap islands, but the traced UI exposes no dock form that lets a person author correspondences and a prediction. The likely missing final block is the human `rebuild` write path at L1 dock plus return continuity into the lens/notebook.
- The implementation should rename or frame “structure” as 星座/深层规律 in user-facing copy where appropriate, but it should not duplicate the domain type. Internally, `StructureObject` remains the portable pattern hub.
- Correction after direct inspection of `apps/server/src/app.ts`: runtime `POST /api/islands/:slug/rebuild` already exists. It parses `MappingArtifactSchema` and forwards the write through the generic gateway, but it does not verify a source island/structure edge, require a falsifiable prediction, enforce a human author, or return a dedicated passage receipt. The upgrade should harden this existing seam rather than introduce a parallel API.
- The exact existing handler accepts `body.actor ?? session actor`, verifies only that `mapping.islandOp` matches the route island, and returns the raw generic gateway result. Replace only its Store call: keep its URL and schema/error conventions, but return a typed passage result from the dedicated transaction and prefer the authenticated/session actor boundary already used elsewhere.
- Seeded rebuilds already use the intended provenance discipline: one mapping ref, one `rebuild` event, human conceptualization credit, and one dock placement. The runtime implementation should reproduce this shape through a validated Store method and HTTP route rather than posting an arbitrary generic event from the client.
- The current structure lens deliberately navigates gaps without pre-populating correspondences. A selected gap can therefore carry only `structureId + destination island` into L1; all mapping content must begin blank or from the human's own prior work.
- `MappingArtifactSchema` already enforces at least one bilingual quantity→substrate correspondence and supports an optional bilingual prediction plus evidence refs. For the interactive dock path, the prediction should be required at the request/form level while remaining optional in the shared schema for legacy seed compatibility.
- The atlas keeps `lensId` as local `AtlasChartScreen` state and explicitly clears it when field exploration activates. Sailing into L1 unmounts that state, so a chosen pattern currently cannot survive the voyage or reopen on return. Passage intent must be lifted into durable exploration/app state.
- The current mapping artifact records the structure and destination island but not the source manifestation from which the person is transferring. Completing “过一次渡口” needs a source rebuilt island in the runtime passage intent and provenance. This can be added compatibly as an optional artifact field while required for new interactive submissions.
- The strongest default journey is now clear: choose a rebuilt source or gap under a selected constellation → sail to the destination with intent preserved → dock opens a blank human mapping workbench → submit correspondences + falsifiable prediction → return to the same lens with the new edge illuminated.
- `App.beginVoyage` is the central L0/L0.5→L1 handoff and already dispatches the exploration `dock` action. The smallest coherent change is to let `AtlasChartScreen` report a passage intent before invoking the existing voyage, store that intent in `ExplorationSession`, and pass it into both sample/generated island paths.
- Returning to the atlas already reuses the exploration reducer and a destination-ready view transition. Keeping the passage in session allows the lens to reopen and refresh after a successful rebuild without inventing a new router or screen hierarchy.
- The current structure lens state is not owned by `App`; therefore merely adding a dock form would still strand the user after return. State lifting/persistence is part of the feature, not optional polish.
- The project already has an unrelated collision-founding bridge flow. Constellation Passage must not reuse that action: it rebuilds an existing structure on an existing island and writes `rebuild`, not `found_island`.
- Existing capability rules classify `rebuild` as `station_write`, limiting it to researcher+. That conflicts with the supplied goal that a learner should be able to perform a genuine passage before becoming a researcher; the role ladder should change distance/risk, not switch to a different object or action.
- A safe compatibility path is a dedicated `rebuild` capability granted to apprentices and above, absent from default agent capabilities, and treated as a degradable push for agents. The runtime Store method must still reject lone agents, preserving “ferryman proposes, human maps.” Visitors remain read-only; apprentices can complete verified practice passages; deeper frontier choice remains a product/evidence distinction.
- The existing generic gateway writes payload refs before capability denial/degradation. A dedicated `Store.rebuildPassage` transaction is therefore the correct invariant boundary for interactive crossings: validate human/capability/source/prediction first, then write exactly one mapping ref, one rebuild ledger event, and one dock placement.
- The existing structure lens already provides the accessible list twin and truthful rebuilt/gap distinction. Its upgrade should add explicit departure selection and only enable “渡向此岛” after a real rebuilt source is chosen; no gap row should contain an AI-suggested correspondence.
- The ferryman template already has only `propose`, `driftwood_write`, and `bridge_propose` despite being the sole cross-island agent. No new agent privilege is needed.
- The field notebook is a strict version-1 record. Adding passage continuity requires a version-2 migration that accepts and upgrades v1 records rather than invalidating them. Navigation should still boot at L0; only selected lens, active passage intent, and completed local passage receipts need durability.
- Proposed session contract: `structureLensId`, `passageIntent {structureId, sourceIslandSlug, targetIslandSlug}`, and bounded `completedPassages` receipts. The canonical mapping remains in the server ref/ledger; the notebook receipt exists for portable personal continuity and Markdown export.
- Source choice must be explicit in the structure lens. A rebuilt island becomes the human-selected departure; only then do gap rows become “渡向此岛.” This prevents the system from silently choosing the analogy source while keeping gaps free of suggested correspondences.
- The runtime Store method should verify that the chosen source already has a real rebuild edge for the same structure, that source and target differ, that the actor is human with rebuild capability, and that the submission contains at least one correspondence plus a non-empty prediction.
- `MappingArtifactSchema` already requires one or more bilingual correspondences and supports prediction/evidence refs, but prediction is optional and source provenance is absent. Add optional `sourceIslandOp` for backwards compatibility with seeded artifacts; the interactive passage transaction will require both `sourceIslandOp` and prediction at its stricter boundary.
- Capability truth is centralized in `ROLE_CAPABILITIES` and `ACTION_CAPABILITY`. Add a first-class `rebuild` capability to apprentice+ and to the set of degradable push capabilities, while leaving all default/ferryman agent templates unchanged. A lone agent may propose through the generic gateway but can never complete the dedicated passage transaction.
- Passage continuity fits the existing reducer without a new router: add lens selection, passage start/cancel/complete actions to `ExplorationSession`; `dock` continues to carry the target into L1, and `return-atlas` keeps the lens/receipt fields while clearing only navigation state.
- The notebook currently has a strict v1 payload under a v1 storage key and rejects any other version. Preserve the key, write version 2, and accept both versions during load so existing pose, routes, currents, and notes survive; new durable fields are selected structure, optional passage intent, and bounded completed-passage receipts.
- Passage receipts in local storage are continuity/export aids, not a second source of truth. The canonical mapping remains the content-addressed server ref plus rebuild ledger event; each receipt should store only identifiers, human text needed for export, timestamp, and the returned ref hash.
- Client continuity needs three distinct states, not one overloaded flag: selected structure lens, selected verified departure, and an optional departure→target passage intent. Completion clears only the intent, keeps the lens/departure for the return view, and appends a bounded receipt keyed by canonical ref hash.
- The portable notebook export currently contains routes, surveyed islands, sources, and currents. Add a dedicated passage log containing structure, source→target, derived kind, the human correspondences, falsifiable prediction, timestamp, and canonical mapping ref; explicitly retain the note that local storage is not the ledger.
- A person should not be forced to translate their mapping before understanding counts. Relax bilingual mapping values to require at least one authored language (not both), record `authoredLanguage` plus `translationStatus: source_only`, and let the ferryman translate later without changing the human-authored correspondence. Seeded fully bilingual mappings remain valid.
- `AtlasChartScreen` can remain the sole graph/data owner while becoming controlled by `ExplorationSession`: accept selected lens/departure/intent callbacks, derive rebuilt and gap rows with their canonical op ids, and keep a pending-passage ref so Pixi can center the target before invoking the passage voyage callback.
- The shared workbench can mount once in `App` above either L1 implementation. It receives the persisted intent plus source/target display data, writes through the typed API, dispatches the canonical receipt, then calls the existing `goChart` transition so the refetched graph and controlled lens reopen together.
- Existing structure-lens copy has only observational terms. Extend the same namespace with a compact three-step passage vocabulary (choose departure, rewalk charted route/open frontier route, author mapping/prediction) and keep the existing “honest gap/no suggested mapping” language intact.
- `global.css` is not indexed by CodeGraph; direct CSS inspection is permitted after the required CodeGraph attempt. Reuse the existing paper/ink/mineral tokens and structure-panel selectors, then add a distinct dock-workbench family rather than inline styles.
- Existing `AtlasControls.enter(slug)` has no completion callback in its public contract. Passage navigation must therefore integrate at the existing `onPick` boundary (where normal entry already hands control to `App`) or use a guarded fallback; it must not assume `enter()` itself returns a promise.
- Renderer truth confirms `enter(slug)` flies to the island and then invokes `onPick`; a pending intent ref at `AtlasChartScreen.onPick` preserves the normal destination-centered transition without timers or duplicate geometry.
- Place the new workbench copy beside the existing `island.transplant` dock vocabulary, but keep the actions distinct: transplant moves driftwood into a station; passage rebuilds a shared structure across substrates.
- Web tests run in Node without jsdom/WebGL, but this still supports meaningful boundary proof: typed client request-body tests plus server-rendered workbench/lens markup can verify source-only language provenance, blank/disabled authoring state, explicit human boundary copy, and departure-gated passage actions. Browser verification remains required for Pixi camera and live submission.
- Source-map attribution for the 1.24 MB main chunk is dominated by existing React DOM, Yjs, the 226 kB atlas corpus, GSAP, renderer atlas-stage, Zod, i18next, and Pixi modules. The new workbench is not a plausible 400 kB source delta; still lazy-load it because it is only needed after a deliberate passage and remeasure before deciding whether the older 812 kB note is comparable to current HEAD.
- `docs/ROADMAP.md` confirms 811.84 kB / 263.87 kB gzip is the intended current boundary, not a stale incomparable number. After lazy-loading the workbench, main is still 1,235.35 kB / 401.43 kB gzip and the workbench is a separate 5.56 kB / 1.87 kB chunk. Compare a detached current-HEAD build with shared installed dependencies to isolate whether the regression predates this diff or is caused by one changed import.
- Detached `HEAD` built with the same installed Vite/dependency environment at 1,223.02 kB / 397.42 kB gzip (CSS 76.34/13.15). Current after workbench splitting is 1,235.35/401.43 (CSS 87.15/14.90), so the attributable main-JS delta is 12.33 kB raw / 4.01 kB gzip (~1%), not ~400 kB. The roadmap's 811.84 figure is not reproducible from current HEAD/tooling. Lazy-load the expanded structure panel too, then use the detached comparison—not the stale absolute—as the regression gate.
- Practice/research remains derived rather than submitted: the destination's existing evidence/status can label the passage as charted practice or frontier research, but both write the same mapping artifact and `rebuild` event.
- The strongest concrete expression of that rule is graph-derived: after choosing a real rebuilt departure, another rebuilt island is a charted/practice destination (a new event increases edge weight), while a gap is a frontier/research destination (the event creates the first edge). The same endpoint and form handle both; the server derives `passageKind` from the pre-write graph and the client cannot submit it.
- Existing rebuild route tests encode the weaker behavior (researcher+ via `station_write`, no prediction/source, and agent degradation). They must be rewritten around the new passage invariant while keeping graph reduction, malformed-artifact, and route-island spoofing coverage.
- `Store.transplant` provides the implementation template: validate domain source and capability before mutation, write one content-addressed artifact and one ledger event, then place it at the dock. The passage method should additionally wrap these writes in a DB transaction and return the derived kind plus ref hash.
- Live demo authorization would otherwise be broken: the web dev session logs in as `github:shen-kuo`, and seed rebuild events are authored by that curator, but mapped-island memberships are not established in `seedStructures`. Record the curator as a master member on each seeded mapped island; that makes existing authorship and harbor footprint consistent and gives the default actor a truthful departure credential.
- Passage capability should be evaluated at the departure island, not the destination: the person carries a structure from a community where they have learned it into a new substrate. This permits a real cross-island contribution without inventing destination membership, while the target ledger still records the external human actor.
- For provenance safety, the route should prefer an authenticated session actor over an actor supplied in the JSON body, retaining the body fallback only for current tests/dev compatibility.
- Existing API errors distinguish capability denial (403), chain conflict (409), missing objects (404), and schema validation (400). Add a dedicated passage-invariant error mapped to 422 so “source is not a real edge”, “source equals target”, and “prediction required” are visible semantic failures rather than generic 500s.
- `pnpm --filter @frontier-isles/core test -- ...` does not narrow Vitest in this package; it ran all core tests. The new mapping/capability tests passed, while an unrelated existing archipelago roster snapshot differs only in one curated region name (`基础物理·南部群岛` vs `基础物理·因果科学群岛`). Use `pnpm --filter @frontier-isles/core exec vitest run <paths>` for focused verification and keep the unrelated snapshot visible for closeout.
- Exact implementation seams are now located: structure read routes are grouped at `apps/server/src/app.ts:175`; transplant write validation begins at line 253; the L1 render split between `GeneratedIslandScreen` and the bespoke sample `IslandScreen` begins around `App.tsx:432`; atlas rendering begins around line 488. A root-level dock workbench can cover both island implementations without duplicating forms.
- `App.tsx` is the clean shared seam for the passage workbench: it owns `beginVoyage`, the selected L1 island, and `goChart`, while both generated and sample islands render beneath it. A root-level dock overlay can therefore support both implementations and reopen the controlled structure lens on return.
- The mobile shell is intentionally read-only. This upgrade should preserve that honesty: the full authored passage belongs to desktop, while mobile may expose a truthful read-only constellation/passage summary rather than a partial write flow.
- `AtlasChartScreen` currently owns `lensId` locally and explicitly clears it when free-flight exploration starts. A passage therefore cannot survive L0→L1 navigation today. The selected structure and departure/target intent must be host-controlled session state; ordinary free-flight can still mute the lens without destroying the passage.
- The structure graph fetch is mount-scoped and already falls back atomically when either object or graph data is missing. Returning from L1 remounts/refetches it, so a successful canonical rebuild can appear without adding a client cache layer; the controlled lens id is what must reopen the same view.

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Use existing React/Pixi/data primitives before adding dependencies | The project already has spatial rendering and evidence/state models; the upgrade should deepen the product rather than widen the stack. |
| Delay the exact feature thesis until roadmap, CodeGraph, and live-state discovery agree | A visually ambitious implementation is only valuable if it closes the real long-term product gap. |
| Preserve the L0/L1 import boundary | The initial bundle reduction is a verified product gain; new world-level UI must consume atlas summaries and session/API projections, not eagerly import interiors. |
| Do not rebuild the four-tier atlas or basic L0.5 traversal | Both are already shipped and verified; this iteration must add meaning and continuity across those layers. |
| Keep the collaborative whiteboard deferred | The roadmap records an intentional product-positioning hold; this iteration cannot invent that missing decision. |
| Confirmed thesis: “Constellation Passage” anchored at the dock | The user confirmed the conceptual restatement. The slice completes the existing analogy bridge by giving recurring patterns a cross-island hub, while reusing the field notebook and on-demand relations-lens direction. |
| Reuse `StructureObject` as the constellation domain object | Code confirms this object and its bipartite projection already encode the cross-cutting hub correctly; adding `Constellation` would create two names for one invariant. |

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| CodeGraph does not index the Markdown roadmap/design-authority files | Attempted CodeGraph first, then route known documentation paths through direct reads while continuing to use CodeGraph for source symbols. |
| Web is available but the expected API port was initially absent | Inspect process/session state and start the server separately if the root parallel command did not keep both services alive. |

## Resources

- `.impeccable.md`
- `docs/ROADMAP.md`
- `docs/architecture.md`
- `docs/atlas-world-plan.md`
- `docs/ROADMAP.md`
- `design/handoff/问题群岛-原型 v3.dc.html`
- `apps/web/src/state/explorationSession.ts`
- `apps/web/src/api/client.ts`
- `/Users/jili/Downloads/Frontier-Isles_渡口补完_执行纲要.md`

## Visual/Browser Findings

- Live product inspection completed against dedicated local Vite previews in isolated named browser sessions; both sessions and preview processes were explicitly closed.
- The API half could not stay resident under host memory pressure. Browser proof therefore intercepts only the rebuild POST and is UI/request-shape evidence, not evidence of real persistence or authorization.
- Server-side passage truth is independently covered by 14 real Hono/SQLite integration tests, including atomic frontier/charted writes, human/auth precedence, capabilities, source verification, malformed input, and prediction requirements.
- The system Chrome launcher exits before `DevToolsActivePort`; the installed Playwright headless Chromium works when selected explicitly in a fresh namespace.
- Desktop 1440×1000 proves the full interaction: select structure → destination actions disabled → select a real rebuilt departure → open frontier → blank L1 workbench → authored mapping/prediction/evidence → POST 200 → same lens/departure return + canonical local receipt.
- The captured POST contains the source/target op ids, one Chinese-authored correspondence, prediction, evidence, `authoredLanguage: zh`, and `translationStatus: source_only`; it does not contain `passageKind`.
- Horizontal overflow is exactly 0 at 1440×1000, 1024×768, and 390×844. Desktop/tablet panels use bounded internal vertical scroll instead of page clipping.
- Day and night L1 both render coherently. The passage focuses its first input, has a visible 2px focus outline, traps forward/reverse Tab within the modal, closes on Escape, and reduces its animations to 0.01 ms with zero-duration transitions under reduced-motion.
- The 390×844 mobile shell explicitly says read-only and renders neither `.fi-structure-key` nor `.fi-passage-workbench`.
- Browser runtime error collection is empty. The only failed network entries are expected Vite-proxy GET 500s while port 8787 is absent; fallback data kept the atlas truthful enough for UI verification, but those responses cannot support a full-stack claim.
- Screenshot evidence is stored under `tmp/verification/`: initial atlas, structure drawer, blank/filled workbench, return lens, L1 day/night, mobile read-only, tablet lens, and tablet workbench.

## Island-depth closeout findings

- The strongest hierarchy is now world region → generated island → island-local district → building → semantic floor. Keeping `district` distinct from the existing world `region` prevents the new game-map layer from corrupting atlas semantics.
- Progressive opening works best as local cartographic discovery derived from evidence availability and explicit survey actions. It should remain separate from scientific completion, XP, currency, and canonical ledger progress.
- A building's semantic floor plan and renderer `Growth.floors` measure different things: the former organizes real content for navigation; the latter visualizes reproduction-driven growth. They should not be silently forced into one count until a product rule reconciles them.
- xfrontier themes are valuable as spatial/editorial routes, but source-record provenance alone is never a structure edge. Only a human-authored `rebuild` mapping may alter the structure graph.
- Dense island fields require two poses at docking: a visually pleasing berth and a durable pose on the owner's safety boundary. Persisting the visual berth lets a closer neighbor steal the restored encounter; persisting the safety pose keeps the continuous-world owner stable.
- Final scope remains deliberate: all 128 generated islands gain the new district/floor projections; the bespoke `machine-curiosity` island retains its custom authored screen; mobile remains read-only; older deep panels still need the new modal/control standard.

## Connection dossier and challenge-layer findings (2026-07-18)

- The old projection collapsed two different identities into one `event.ref`: the claim/material being judged and the response artifact that contains the actual argument. A defensible dossier must preserve both. `semanticRefEvent` now resolves response content only when an explicit `targetRef` (or legacy `ref`) is present; it never infers a target from island proximity or text similarity.
- The resolver belongs at the projection boundary. `Store.seaData()` can resolve content-addressed refs from SQLite, so currents, claim state, and whirlpools share one semantic target. Core callers without a resolver retain a conservative record with unavailable body/evidence instead of fabricated copy.
- A support/challenge is not a generic comment. The minimum useful response artifact is target ref + action + concrete body + discriminating test + evidence descriptor + attributable actor/time. The dedicated route reuses the gateway's evidence and capability rules, but wraps artifact, event, and Workshop placement in a transaction so denial cannot leak an orphan ref.
- Successful responses change the canonical signed current and immediately reproject into the same focused path. They do not mutate the structure/mapping graph; human `rebuild` remains the only way to author that graph. Keeping these two actions separate prevents “I contest this evidence” from silently deleting a cross-domain mechanism mapping.
- Historical seed events honestly lack response bodies and tests because those fields were never stored. The UI can still show the target ref/summary/evidence and action provenance, but must label the missing response/test rather than backfill an explanation.
- Desktop authoring currently responds from `path.to`; the server contract accepts any explicit responding-island route that satisfies cross-island anchoring and capability checks. A third-island response needs a future navigation/selection design rather than an inferred default.
- RO-Crate evidence is descriptor-level in v1: roles and sha256 shape are enforced, but the server does not fetch the URL or recompute the remote content hash. Verified evidence ingestion remains a distinct follow-up.
- Compact viewports keep exact dossier read parity and source-language authored bodies; they neither add a write form nor invent a translation. The 390×844 proof measured document/body width at exactly 390 px, two dossier records, no ref overflow, and zero write forms.
- Real browser keyboard proof exposed a global exploration-handler collision with native `<summary>`. Exempting the summary from map Enter handling restored native expansion; Escape inside textareas leaves the dossier intact, while Escape from the summary returns to the global field.

## Plain-language connection reset findings (2026-07-18)

- The 1440×1000 first read asks the visitor to decode at least seven system concepts before reaching a concrete comparison: “连接场”, “共享”, “汇聚”, four channel classes, “地图线型”, “直接关系”, and `w1`. The interface is internally consistent but still describes its ontology rather than helping someone use another study.
- The visual hierarchy compounds the copy problem. Global cards lead with canonical structure names or generic relation labels (`网络渗流与级联`, `已确认的跨域桥接`, `证据冲突 / 反证`); the actual problems, concrete statement, limits, and test are subordinate. A researcher must translate the platform's classification before understanding the claim.
- The one primary job is simpler: **pick a real problem or an existing comparison, then see what can be borrowed, what cannot be copied, and what result would change the judgment.** The world-level fused map remains valuable, but its controls do not need to expose the graph's internal taxonomy.
- Preserve as scientific truth: endpoint questions, human-authored shared statement/correspondence, explicit difference, prediction/test, evidence, provenance, action, and missing historical material. Preserve relation kinds in data, rendering grammar, ARIA, and optional filtering because they still determine lines and evidence semantics.
- Remove from the primary read: visible “Connection Field” branding, “multi-problem convergence”, “direct relation”, “map grammar”, raw `wN`, raw source ids, and generic path labels that merely repeat the relation type. Demote the five filters behind one native disclosure labelled with the current plain-language choice.
- Global multi-problem rows should lead with the recorded shared statement and name the participating studies. Two-problem rows should lead with the two study names and one ordinary-language sentence such as “两项研究的材料得出不同判断” or “两边都用到拉普拉斯方程”. Canonical structure titles remain available only as secondary provenance/context.
- Focused views should use a stable three-question vocabulary across desktop and mobile: `能借用什么`, `哪里不能照搬`, `怎么验证`. The dossier should answer `原材料说了什么`, `支持或反对的理由`, and `什么结果会让这条判断站不住`.
- `.impeccable.md` confirms the audience includes visitors as well as interdisciplinary researchers. In this context the visitor is curious but un-oriented; the tone must be scholarly and calm, and the interface should disclose depth after a concrete problem—not test whether the visitor knows platform terminology.
- The implemented reset changes the subject of the interface rather than merely renaming it. The default view now leads with the recorded shared statement or the actual study pair; canonical structure titles, relation kinds, source classes, and weights are secondary data or remain internal.
- The five relation classes remain available through one closed-by-default native `<details>` control. Keyboard Enter opened all five choices in the live browser, and selecting “支持或反对的材料” reduced the direct list from 10 to 4 without changing the projection.
- Problem-first and world-first entries now converge on the same concrete read. Searching “虚拟细胞” exposed one real study and its recorded model–reality-loop comparison; opening a global group exposed `在这项研究里具体是什么 / 哪里不能照搬 / 怎么验证` for each member.
- The island authoring workbench was part of the same conceptual reset. Its live title is the two actual study names; the redundant three-step strip and ferryman boundary card are gone; the blank human-owned fields ask for the two objects/quantities, the non-transferable difference, and a test.
- Desktop 1440×1000 and mobile 390×844 live checks found none of the removed Chinese/English platform terms or raw `wN` weights. Mobile document/body width was exactly 390 px, English singular counts render `1 record`, reduced-motion media matched, and the page-error list was empty.
- Final gate: **698/698 tests** (OPP 21, assets 53, renderer 114, scout 19, core 170, Web 238, server 83); all eight recursive typechecks; production build; Chromium world round trip **1/1**; and `git diff --check`.
- The scientific boundary remains explicit: relation kinds, stable ids, renderer grammar, ledger provenance, evidence packages, and human write permissions are unchanged. This is a comprehension-layer reset, not a new graph or an inferred-analogy engine.
## 2026-07-18 Executable Cross-Domain Learning Reset

### Why the current connection work still misses the learning goal

- The current `ConnectionField` is an evidence projection: it can show a shared statement, domain-specific correspondences, boundaries, provenance, support, and challenge. That is necessary scholarly infrastructure, but the learner still mainly reads someone else's judgment.
- `PassageWorkbench` lets a person author a correspondence and a falsifiable test, but it does not execute the mapped rule. Completing it proves that a record was written, not that the learner constructed and observed a model.
- The atlas, island districts, and building floors add spatial depth, but no current world layer owns simulation state, parameters, predictions, time-series output, or a durable model-run receipt.
- Therefore adding more relation types or more explanatory copy would deepen the graph while leaving the central pedagogical failure unchanged: the software, not the learner, performs the understanding.

### Product boundary decision

- Do **not** create a separate product. The atlas supplies real questions and domain context; the connection projection supplies evidence-backed candidates for transfer; a model workspace can turn those candidates into learner action. Splitting the product would sever precisely this question -> connection -> construction -> return loop.
- Do create an independently bounded model subsystem: pure deterministic kernels, a typed model/content catalog, a local learner session, and notebook receipts must not depend on Pixi, the ledger, or island rendering. This keeps the runtime testable and reusable while the product remains integrated.
- The model workspace must be a first-class screen/layer, not another nested detail inside `ConnectionFieldPanel`. The relationship panel answers “why might these be connected?”; the workspace answers “can I make the shared rule run, and where does it fail?”

### First vertical slice

- **Synchronization:** one coupled-oscillator rule reused across fireflies, cardiac pacemaker cells, coordinated applause, and grid frequency. Learner-controlled diversity and coupling should visibly change the order parameter over time.
- **Shared fields and flow:** one grid/Laplacian-style update reused across heat, diffusion, electrostatic potential, and steady flow. Boundary conditions and interpretation change while the spatial update stencil remains visible.
- Every run must retain four learner-owned facts: prediction before running, chosen parameters, observed result, and a domain-specific limitation. A run without these is a demo, not a learning artifact.

### Source check and scientific red lines

- Feynman Lectures Vol. II, Ch. 12 (`https://www.feynmanlectures.caltech.edu/II_12.html`) is the direct authority for the electrostatic analogy. It states the steady heat-flow/electrostatic correspondence through the same divergence/gradient form. The workspace must not falsely say that every listed phenomenon has identical causal physics or identical boundary conditions.
- Feynman Lectures Vol. II, Ch. 3 (`https://www.feynmanlectures.caltech.edu/II_03.html`) gives the time-dependent heat/diffusion equation. The field runtime may reuse a discrete Laplacian stencil, but its UI must distinguish time evolution from a steady Laplace/Poisson boundary-value problem.
- The synchronization runtime uses the finite Kuramoto form and its order parameter only as a deliberately reduced model. APS sources confirm the relevance of coupled-oscillator synchronization to rhythmic applause and power-grid phase locking, while the model's limitations differ by substrate.
- Fireflies are not “proved to be Kuramoto oscillators”; empirical synchronous flashing and mathematical oscillator models are separate claims. The UI must label the simplified model and show the domain-specific boundary before a run is saved.

### Executable-model verification findings

- The strongest integration is one product with four distinct truths: islands hold real questions; research comparisons hold evidence-backed candidate relations; the model layer holds learner-controlled execution; the notebook holds personal predictions, measurements, and limits. A model run never promotes itself into the relation graph.
- Browser proof exposed a metric-language mismatch that unit tests did not: fixed-boundary heat reached a lower local equation residual while its global range remained fixed. The shipped copy now predicts and reports neighbour imbalance for heat/electrostatic/steady flow, and concentration range only for diffusion.
- The field family's common object is a discrete four-neighbour update, not a common cause. Heat and diffusion use it as time evolution; electrostatic potential and ideal steady flow use iteration as numerical relaxation toward a boundary-value solution. The substrate boundary text states this before saving.
- The saved synchronization proof moves order parameter `R` from `0.106` to `0.998` in 360 deterministic steps. The saved heat proof moves neighbour residual from `0.025` to `0.001` in 90 steps. These establish runtime behavior, not empirical fit to fireflies or materials.
- Transfer works by retaining load-bearing parameters while resetting prediction, run state, boundary note, and saved state. This makes “same rule, changed world” an experiment instead of a carousel of examples.
- Keyboard browser testing found two issues invisible to server markup: links inside collapsed `<details>` polluted the focus-trap endpoints, and the model opener is unmounted while the modal is active. Filtering hidden-detail descendants plus restoring focus to a remounted, tagged opener closes both loops.
- Reduced-motion is behavioral, not only visual: one Run action advances immediately to the deterministic final state, while manual single-step remains available. Computed model animation/transition duration is `0s` under the media preference.
- Mobile is now deliberately asymmetric rather than globally read-only: atlas/L1/research-ledger writes remain unavailable, but the same embedded workbench can save a personal local model receipt. At 390×844, document and body widths are exactly 390 px and atlas-only filters are absent from the model tab.
- Notebook v4 reload proof retained the research launch context and model run. A second mobile save increased the same local notebook from one to two receipts; it did not create a graph mapping, evidence response, or server write.

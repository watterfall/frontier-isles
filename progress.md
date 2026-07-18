# Progress Log

## 2026-07-18 — Connection argument and challenge continuation

- **Status:** Phase 5 implementation in progress.
- User asked to continue after the global Connection Field closeout. Selected the highest-value remaining product gap: expose the argument/evidence body behind a visible relation and let a person record a real challenge that changes shared state.
- Re-loaded `planning-with-files`, `frontend-design`, and `agent-browser`; recovered the current session, re-read the project design authority and all planning files, and preserved the existing dirty working tree.
- Updated `task_plan.md` with the argument/challenge slice and recorded the prior `boundary_required` type-contract error/resolution.
- Design boundary: the focused relation should unfold as one annotated evidence dossier attached to the map path, not another dashboard/card layer. Compact viewports keep the same read truth but no writes.
- Next: use CodeGraph to trace ref contents, current projection, claim/evidence reducers, and the existing validate/refute/driftwood transaction seams before freezing the implementation contract.
- CodeGraph located the argument-body loss point: `projectCurrents` reduces shared-ref event groups into endpoint/kind/sign/weight rows and omits the shared refs/events, while the server ref store and core evidence parser retain the underlying content.
- Decision checkpoint: extend the existing current read path with resolved backing groups; do not add a relation store or infer prose. Each aggregated edge must keep every backing ref group visible.
- Found the write/read mismatch: interactive `validate`/`refute` events reference a response artifact whose content embeds the target claim ref, while the current reducer joins only on the response ref. The fix will preserve both refs and resolve the embedded semantic target rather than weakening provenance.
- Existing `/api/refs/:hash`, generic gateway evidence enforcement, and `/api/currents` supply the needed seams; no new evidence database or ledger verb is warranted.
- Confirmed existing failure handling: evidence-gated `refute`/`validate` writes land in the Workshop, while historical seed reactions have only the target ref. The dossier will distinguish legacy relation-only records from new fully explained responses.
- Live database audit: 7 current rows and 2 whirlpools match the seed truth. The `living-wires` claim ref resolves to a concrete assertion plus RO-Crate evidence; support/contest events share that target ref but have no response body, establishing the exact legacy empty state.
- Located the UI seam: focused `PathDetail` currently substitutes one generic boundary paragraph for the missing ledger body. The next implementation will unfold resolved records there and place the write form behind explicit progressive disclosure.
- Located the state seam: App already owns the actor and revision counter; Atlas refetches the entire fused read model on that revision. Response writes can therefore refresh the same focused path without a new cache or route hierarchy.
- Confirmed governance and mobile boundaries: responses remain researcher+ capability-gated; mobile will render the same dossier records but no write form.
- Froze the implementation contract in `docs/connection-dossier-v1-2026-07-18.md`: one source-preserving record array per aggregated current, legacy direct-ref compatibility, separate target/response refs, transactional evidence-gated writes, desktop authoring, and mobile read parity.
- Added the semantic-ref join in core. New response artifacts can embed a target ref and now rejoin the original anchor while preserving their own ref; currents expose resolved record arrays, whirlpools keep the target claim ref, and claim state can use the same resolver. Legacy direct-target events remain compatible and are marked as historical gaps.
- Core baseline remained green after the projection change: 167/167 tests plus package typecheck. Focused new compatibility/provenance tests are being added next, before the write API or interface changes.
- Test error recorded: the synthetic sea fixture uses readable `sha256:claim-…` labels that are not protocol-valid hexadecimal hashes, so they cannot serve as embedded response targets under the strict new-ref path. The focused response-artifact tests now use valid hexadecimal refs, while legacy fixture behavior remains explicitly covered without weakening production ref validation.
- Added `respondToConnection` and `POST /api/islands/:slug/connection-response`. The transaction validates a real cross-island anchor, concrete argument, discriminating test, evidence descriptor, identity/capability, and Workshop placement; denial rolls the response ref back rather than leaving an orphan.
- Server behavior tests pass 83/83, including live current/whirlpool reprojection, persisted response content, evidence rejection, permission rollback, invalid targets, missing fields, and same-island rejection.
- Typecheck error recorded: the parameterized invalid-input test repeated `body` and `test` before a known override, triggering TS2783. Built a named valid payload and spread the override once; product code was unaffected.
- Added the browser contract for resolved current records and an error-preserving `respondToConnection` client. Ledger paths now carry their real backing records into the connection field; curated equations deliberately carry an empty record list.
- Added client/projection tests for request provenance, visible server errors, target-ref preservation, and the honest offline historical gap.
- Replaced the focused ledger-path placeholder with an annotated connection dossier: original assertion, target evidence, response body, response evidence, actor/time, source refs, discriminating test, and explicit historical gaps are now separate readable steps.
- Added a progressively disclosed desktop response form with explicit target, responding island, support/refute stance, argument, test, RO-Crate address, evidence hash, and role. Semantic API errors remain in context; successful writes reuse the existing atlas revision refetch and focus the resulting path. Viewports at 900px and below keep the full dossier but hide the write form.
- Mobile path detail now renders the same resolved target, response, evidence, provenance, test, and historical-gap truth, while retaining its existing read-only boundary. Added a focused static-render test proving the desktop dossier and structured write contract appear as distinct semantic steps.
- Live API smoke check after hot reload: health 200; 7 currents now expose 8 backing records, all 8 resolve target summaries, and the four legacy validate/refute records are explicitly marked historical. The sample living-wires claim exposes its assertion and evidence RO-Crate through the public projection.

## 2026-07-18 — Real connection redesign

- **Status:** Phase 1 in progress.
- Accepted the user's frame reset: stop polishing Ferry/Tearoom metaphors and replace the taxonomy-first path with an evidence-first connection journey.
- Read the current design context and activated `frontend-design`, `agent-browser`, and `planning-with-files` for product/UI execution, live proof, and persistent scope control.
- Inspected the running project at `http://localhost:5173` with the real API at `8787`.
- Captured the current atlas and selected-structure baseline. The current flow leads with six themes, eight structure names, one rebuilt source, and 22 unexplained gaps.
- Used CodeGraph to trace `StructureLensPanel`, the pure graph lens, exploration persistence, `PassageWorkbench`, `App` voyage/return continuity, and the strict `rebuildPassage` transaction.
- Next: audit the usable evidence in mappings/island summaries, define a source-first connection projection, then replace the primary interaction.
- User correction incorporated: the source-first two-problem path is secondary. The main redesign is now a global multi-problem connection field with fused visualization, then focused explanation and pairwise validation.
- Data audit checkpoint: L0 already has problem/QFocus/brief/citation context, while the structure graph API discards mapping correspondences and predictions. The redesign therefore requires a resolved connection projection before the UI can truthfully explain relationships.
- Relation-system checkpoint: identified three disconnected real sources—rebuild mappings, curated mathematical bridges, and ledger evidence/bridge/lineage currents. The redesign will fuse these through one read projection and visual language rather than add another graph.
- Error recorded: `agent-browser` was not on `PATH`; switched once to the skill-supported `npx agent-browser` invocation with the installed Playwright headless Chromium.
- Phase 1 closed with `docs/connection-field-v1-2026-07-18.md`: the primary object is now a multi-problem convergence field, mechanism groups retain their bipartite hub shape, direct mathematical/evidence/lineage paths keep their own semantics, and problem-first comparison is explicitly the downstream validation layer.
- Phase 2 started: expose resolved mapping refs, including analogy boundaries, then fuse them with curated mathematical bridges and ledger currents through one pure browser projection.
- Phase 2 checkpoint A: `/api/structures/graph` now exposes the explanatory mapping records behind its 12 compressed edges. Added optional schema support plus 12 bilingual seed boundaries; interactive writes now require the boundary. Core 167/167 and server 75/75 pass.

## 2026-07-18 — Island districts / building floors iteration

### Phase 1 started

- Recovered the completed Ferry Dock iteration and confirmed its dirty worktree must be preserved.
- Confirmed `.codegraph/` exists and used CodeGraph before code discovery.
- Selected and read the `planning-with-files`, `frontend-design`, and `agent-browser` skills for execution, design authority, and live verification.
- Established the terminology boundary: world-level `region` remains unchanged; the new island-local layer is `district` in contracts and “岛内分区” in product language.
- Initial architecture evidence: no district state exists; building `Growth.floors` exists but is not navigable; `StationInteriorDrawer` plus lazy `INTERIORS` is the floor-integration seam.
- Next: narrow CodeGraph mapping, live `xfrontier.science` inspection, and an explicit data/interaction contract before edits.

### Phase 1 checkpoint A

- Read the current design authority after CodeGraph confirmed it is not indexed.
- Verified the live xfrontier SPA title, build id, and current first-party asset paths; page HTML contains no usable corpus, so bundle inspection is required.
- Narrow CodeGraph tracing confirmed `GeneratedIslandScreen` is the evidence-bearing L1 owner and `StationInteriorDrawer` is the current one-station/one-section L2 limitation.
- Confirmed structure edges remain ledger-derived; planned theme expansion cannot silently create graph truth.

### Phase 1 checkpoint B

- Imported the current xfrontier first-party ESM bundle in-memory without adding repository artifacts.
- Verified the live corpus shape: 1,477 records / 53 clusters / 9 dimensions / 13 ranking profiles.
- Separated two candidate uses: clusters/dimensions can diversify district and floor roles; only explicit human mapping artifacts may produce structure crossings.

### Phase 1 checkpoint C

- Enumerated all 53 live xfrontier clusters and representative current records.
- Identified a five-program spatial vocabulary that can cover the requested diversity without importing 53 UI categories.
- Traced the existing atlas cluster provenance, interior content schema, and notebook v2 hydration seam needed for a backward-compatible state upgrade.

### Phase 1 checkpoint D

- Traced App → generated island ownership and confirmed the durable depth state must flow from the root reducer.
- Inspected the current L2 drawer in full enough to define floor partitioning and accessibility repair seams.
- Drafted the evidence-versus-local-survey distinction that keeps “unlocking” game-like without falsifying research progress.

### Phase 1 checkpoint E

- Located the exact GeneratedIslandScreen overlay/HUD seams and decided the district map will organize building access instead of duplicating the station index.
- Inspected the flat structure selector and seed metadata gap; visible theme/provenance requires an end-to-end schema/API/client change.
- Confirmed floor navigation can partition existing typed content without schema churn in the heavy interior corpus.

### Phase 1 checkpoint F

- Verified the 128-entry atlas projection and lazy-interior separation programmatically.
- Identified concrete current island slugs suitable for evidence-backed new structure seeds.
- Confirmed the theme/provenance expansion must pass through OPP schema → server seed/store → API client → lens UI.

### Phase 1 checkpoint G

- Counted 12 rich-interior islands and defined a baseline-floor fallback for the other generated islands.
- Audited candidate structure mappings against current island briefs, methods, barriers, and citations.
- Found and designed around the existing-database seed short-circuit so the upgrade will be visible on the current local DB, not only a clean test DB.

### Phase 1 complete / Phase 2 complete

- Reconciled the new local district layer with the existing world-region and L0→L1 hierarchy authorities.
- Wrote `docs/island-depth-plan-2026-07-18.md` as the implementation contract for district state, floor content, xfrontier themes, structure provenance, notebook v3, accessibility, migration, and acceptance.
- Phase 3 starts with pure projection/state/schema tests before UI integration.

### Phase 3 checkpoint A — structure catalog

- Extended OPP structure Markdown with optional theme/provenance while keeping legacy input valid.
- Expanded `SEED_STRUCTURES` 3→8 and canonical mapping edges 4→12 with bilingual correspondences/predictions.
- Added existing-DB idempotent catalog reconciliation and mirrored all metadata through the offline fallback/API type.
- Focused proof: OPP 6/6, server 15/15, web structure lens 10/10, data typecheck and atlas drift check all pass.

### Phase 3 checkpoint B — notebook v3

- Added durable district/floor exploration actions and automatic Harbor arrival on dock.
- Migrated field notebook v2→v3 while preserving v1/v2 reads and portable Markdown.
- Focused proof: exploration session/notebook 15/15; web typecheck and `check:data-imports` pass.

### Phase 3 checkpoint C — district/floor projections

- Added pure xfrontier programme, district unlock, and multi-floor content projections.
- Covered the full generated-island fallback: rich interiors deepen to many floors; non-rich islands retain real baseline/depth/literature floors.
- Focused proof: island-depth projections 6/6; web typecheck and boundary check pass.

## Session: 2026-07-18

### Phase 1: Source-of-truth discovery

- **Status:** completed
- **Started:** 2026-07-18
- Actions taken:
  - Confirmed the repository begins clean on `main` with no uncommitted changes.
  - Confirmed the existing CodeGraph is current and remains the only code-graph layer.
  - Loaded the project design context and established the product/a11y delivery bar.
  - Created persistent planning, findings, and progress files for the upgrade.
  - Reconciled recent continuity work: persistent exploration state is present, while the live journey was previously still judged thin and partially disconnected.
  - Traced the current exploration session and evidence/action API through CodeGraph; identified course history, sampled currents, notes, and preserved world pose as underused product primitives.
  - Read the current roadmap and atlas-world authority. Confirmed that four-tier semantic zoom, L0.5 traversal, local notebook persistence/export, and the L0/L1 bundle boundary are already delivered.
  - Narrowed the likely flagship seam to the under-connected field notebook, structured field board, and on-demand relations-lens direction.
  - Re-read the plan before narrowing scope and extracted the roadmap's exact Phase C order: deep accessibility first, structured field board deferred, then the relations lens.
  - Loaded the browser-verification workflow needed to inspect Pixi/canvas surfaces and semantic controls on the real default path.
  - Confirmed the supported full-stack dev command and the repository's existing test/typecheck/build/E2E gates.
  - Received the user's dock-completion execution outline and promoted it into the current discovery requirements.
  - Read the 108-line outline completely and extracted its non-negotiables: pattern hubs are cross-cutting passage objects; humans ratify mappings; learning/research share one action; failed but generative mappings persist; passive simulation consumption is a failure state.
  - Identified a likely compatibility resolution with the current atlas: present constellations through an on-demand relation projection while keeping cartographic altitude unchanged and the dock as the action surface.
  - Received user confirmation of the conceptual checkpoint; implementation is now authorized to proceed along the Constellation Passage thesis.
  - Recovered the file-based plan after the alignment turn; the worktree contains only the three planning files before product-code changes begin.
  - Traced the transplant path and discovered a potentially decisive existing primitive: native `rebuild` ledger events and a structure ⇄ phenomenon graph already exist. The next step is to determine whether “structure” is the intended constellation hub and complete it rather than introducing a duplicate model.
  - Confirmed `StructureObject` is the constellation hub and that the atlas already has a truthful, on-demand structure lens. Scope is now sharper: complete the human-authored rebuild passage at the dock and carry its result back into the existing graph/notebook.
  - Corrected an earlier CodeGraph-only conclusion after direct route inspection: runtime `POST /api/islands/:slug/rebuild` exists, but currently uses the generic gateway and lacks the source/human/prediction invariants required by the execution brief. The missing vertical slice remains: preserve the selected structure and departure, author/validate at the dock, append the canonical rebuild event, then refresh the lens/notebook.
  - Inspected the mapping schema and atlas state ownership. Confirmed the schema already matches the core human task, while selected lens state currently dies at navigation and interactive mappings lack source-island provenance.
  - Traced `App.beginVoyage`/`goChart` and identified the exact continuity seam: passage intent belongs in `ExplorationSession`, while the atlas lens should be controlled from that state and refreshed after the dock write.
  - Audited the role/capability model. Identified the one intentional policy adjustment needed for the learning→research continuum: a human-only rebuild capability beginning at apprentice, rather than reusing researcher-level station write.
  - Read the full exploration session/notebook implementations and drafted the compatible v2 continuity contract: controlled lens/source/target intent plus bounded completed-passage receipts, with the server ledger remaining canonical.
  - Located exact server route and root render insertion points for the rebuild endpoint and a shared L1 dock workbench.
  - Confirmed `App.tsx` as the shared L1 integration seam across generated and sample islands; mobile remains intentionally read-only.
- Files created/modified:
  - `task_plan.md` (created)
  - `findings.md` (created)
  - `progress.md` (created)

### Phase 2: Upgrade thesis and interaction contract

- **Status:** completed
- Actions taken:
  - Chose the existing `StructureObject + rebuild` graph as the only constellation model; no duplicate taxonomy or hierarchy will be added.
  - Chose a dedicated validated passage transaction around the existing rebuild route, because the generic gateway cannot enforce source-edge provenance before writing refs.
  - Chose explicit human departure selection in the existing accessible structure lens, followed by a shared L1 dock workbench and a return receipt in the field notebook.
  - Confirmed the exact continuity break: `AtlasChartScreen` owns and clears the structure lens locally. The passage intent must move into the persisted exploration session while graph data remains mount-refetched.
  - Froze compatibility rules: `sourceIslandOp` is optional in the shared mapping schema for legacy seeds but mandatory in the interactive transaction; prediction is likewise enforced at the passage boundary.
  - Froze governance rules: a dedicated `rebuild` capability begins at apprentice, agents retain their current proposal-only templates, and only a human can finalize a passage.
  - Defined a compatible notebook v2 migration that reads existing v1 data and persists the controlled lens, in-flight passage intent, and bounded completion receipts without turning local storage into canonical provenance.
  - Read the exact existing rebuild handler: the public route and basic Zod validation can remain stable; only its weak generic-gateway transaction and response contract need strengthening.
  - Strengthened the learning/research contract: rebuilt destinations are charted practice, graph gaps are frontier research, and both use the same form/event; classification is derived server-side before the write.
  - Located the focused server tests that will be upgraded from generic-gateway behavior to full source/prediction/human/atomic-passage behavior.
  - Traced the default actor and seed authorship. Added a required seed consistency fix to the contract: `github:shen-kuo` must be a member of seeded source islands she already authored, and passage permission is checked at departure.
- Files created/modified:
  - `task_plan.md`
  - `findings.md`
  - `progress.md`

### Phase 3: Implementation

- **Status:** completed
- Actions taken:
  - Began with the core mapping and governance primitives so the UI can only be built on tested product truth.
  - Added optional source-island provenance to mapping artifacts without invalidating legacy seeds.
  - Added a dedicated human-only rebuild capability for apprentice+, including an unconditional agent red-line and proposal degradation.
  - Made seeded curator authorship/place-plane membership consistent on mapped islands.
  - New mapping and capability tests pass; the broader core run found one unrelated pre-existing atlas name snapshot mismatch.
  - Chose a typed 422 passage-invariant error for semantic crossing failures, preserving existing 400/403/404/409 API conventions.
  - Implemented the atomic server passage transaction and upgraded the existing route: verified departure, human-only finalization, departure capability, required prediction, derived charted/frontier kind, one mapping ref/event/dock placement, authenticated actor precedence.
  - Added focused server coverage for apprentice passage, visitor/agent denial, graph-weight practice, frontier creation, spoofing, malformed mappings, missing provenance/prediction, and unverified sources.
  - Defined the exact client reducer/notebook additions and v1→v2 migration tests before editing: lens, departure, intent, and canonical-ref receipts remain separate.
  - Implemented controlled lens/departure/intent state, bounded passage receipts, backward-compatible notebook v2 loading, and portable passage Markdown export.
  - Reducer continuity, v1 migration, corrupt/future fallback, and Markdown passage coverage pass; one round-trip assertion was corrected to include the newly completed destination in surveyed islands.
  - Chose an honest single-language authoring wire format: the mapping records its authored language and source-only translation status instead of silently duplicating text into a false translation.
  - Located the exact controlled-prop, camera-entry, voyage, L1 overlay, and return-transition seams for the atlas-to-dock journey.
  - Located bilingual structure-lens resources and confirmed CSS requires the documented direct-read fallback because CodeGraph does not index it.
  - Inspected the existing structure-panel CSS vocabulary and confirmed target-centering must be coordinated through `onPick`, because atlas controls expose no completion callback.
  - Upgraded the structure lens into a controlled three-step route selector and retained Pixi's real center-then-pick transition using a pending passage ref.
  - Added the panel's bilingual vocabulary and token-based CSS for explicit departures, charted rewalks, frontier routes, focus states, and coarse-pointer target sizes.
  - Implemented the shared L1 passage workbench: blank human-authored correspondences, required falsifiable prediction, optional evidence ref, explicit ferryman boundary, single-language provenance, canonical receipt, and return transition.
  - Wired the persisted passage journey through `App` across both generated and sample island screens.
  - Web typecheck now passes after updating two stale gap-row slug accesses.
  - Selected focused UI proof that matches the repository's Node test environment: request-wire assertions and static semantic markup, followed later by live browser interaction.
  - Added client-wire and server-rendered UI red-line tests. Focused results now pass: web 24/24, core 10/10, server 14/14.
  - Generated a source-map build to investigate the bundle warning. The main chunk is dominated by large existing dependencies/corpus; the passage workbench will be moved behind a lazy boundary and the current HEAD baseline will be compared before accepting or rejecting the budget.
  - Lazy-loaded the passage workbench into a separate 5.56 kB / 1.87 kB-gzip chunk; main improved slightly to 1,235.35 kB / 401.43 kB but remains far above the roadmap boundary, so a detached-HEAD comparison is next.
  - Built detached `HEAD` with the same local toolchain: 1,223.02 kB / 397.42 kB gzip. The actual iteration delta is 12.33 kB / 4.01 kB gzip; the large absolute drift predates this diff. A second lazy boundary for the expanded structure panel will reduce that attributable delta.
  - Lazy-loaded the expanded structure panel as well. Final current main is 1,231.21 kB / 400.44 kB gzip versus detached `HEAD` 1,223.02 kB / 397.42 kB gzip: +8.19 kB raw / +3.02 kB gzip attributable to this iteration.
- Files created/modified:
  - `packages/core/src/mapping.ts`
  - `packages/core/src/capabilities.ts`
  - `packages/core/test/mapping.test.ts`
  - `packages/core/test/rebuild-capability.test.ts`
  - `apps/server/src/seed.ts`
  - `apps/web/src/state/explorationSession.ts`
  - `apps/web/src/state/explorationNotebook.ts`
  - `apps/web/src/__tests__/explorationSession.test.ts`
  - `apps/web/src/__tests__/explorationNotebook.test.ts`
  - `apps/web/src/api/client.ts`
  - `apps/web/src/components/chart/AtlasChartScreen.tsx`
  - `apps/web/src/components/chart/StructureLensPanel.tsx`
  - `apps/web/src/components/island/PassageWorkbench.tsx`
  - `apps/web/src/i18n/zh.ts`
  - `apps/web/src/i18n/en.ts`
  - `apps/web/src/global.css`
  - `apps/web/src/App.tsx`

### Phase 4: Verification and refinement

- **Status:** in_progress
- Actions taken:
  - Focused passage suites pass: web 24/24, core 10/10, server 14/14.
  - Corrected one stale name-only core snapshot to the current roadmap/data truth and reran the entire workspace: 658/658 tests pass.
  - Verified every package typecheck in isolation/sequential order. The root recursive wrapper still terminates the OPP child under concurrent host pressure without a TypeScript diagnostic; isolated OPP exits 0.
  - Production build passes with separate lazy chunks for `StructureLensPanel` (4.39 kB / 1.44 kB gzip) and the final `PassageWorkbench` (6.08 kB / 2.07 kB gzip).
  - Standalone server launches are currently killed by host memory pressure. Live UI proof will intercept only the rebuild POST; canonical write/auth/transaction behavior remains covered by real in-process SQLite integration tests.
  - `agent-browser` could not launch the system Chrome, but a fresh isolated namespace successfully starts the installed Playwright headless Chromium. A dedicated local Vite preview is listening on 127.0.0.1:5173 for visual verification.
  - Verified the complete desktop passage at 1440×1000: destination actions are disabled before an explicit rebuilt departure; the L1 form begins blank; submit sends one source-language mapping and no client passage classification; the mocked write returns 200; the same lens/departure reopen and a canonical local receipt is persisted.
  - Raw request proof shows `authoredLanguage: zh`, `translationStatus: source_only`, source/target op ids, correspondence, prediction, and evidence; `passageKind` is absent from the POST body.
  - Raw layout proof: horizontal overflow is 0 at 1440×1000, 1024×768, and 390×844. The desktop/tablet workbench uses bounded internal vertical scroll; the structure twin fits its viewport.
  - Verified day and night L1 screenshots, first-input autofocus, visible 2px focus outline, Escape cancellation, forward and reverse Tab trapping, and reduced-motion animation duration of 0.01 ms with transitions at 0 s.
  - Verified the 390×844 mobile shell remains explicitly read-only and contains neither the structure lens nor passage authoring form.
  - Browser console contains no page/runtime errors. Expected Vite proxy 500s remain for GET fallbacks because the API process was intentionally absent; these are not counted as full-stack evidence.
  - Diff review added two final hardening changes: true modal focus containment and evidence refs in notebook receipts/Markdown. Focused web 24/24, full workspace 658/658, Web typecheck, and production build all pass again afterward.
  - Updated `docs/ROADMAP.md` with Slice 10, P3 ~82%, verified boundaries, the same-dependency bundle comparison, and the prioritized post-passage work.

### Phase 5: Closeout

- **Status:** completed
- Actions taken:
  - Reviewed the core/server/client/state/UI/test diff and the two new source files through current CodeGraph output; corrected modal focus semantics and portable evidence continuity during that review.
  - `git diff --check` is clean. The branch remains `main...origin/main`; all listed modifications belong to this requested iteration plus the explicitly documented stale snapshot correction.
  - Browser sessions, network interception, detached comparison worktree, and local Vite verification processes were cleaned up. The screenshot evidence pack remains under `tmp/verification/`.
  - Final remaining limitations: no live port-8787 browser persistence proof under current host memory pressure; root recursive typecheck wrapper remains resource-sensitive although every package passes; the older absolute bundle baseline is not reproducible; mobile authoring remains intentionally out of scope; ferryman translation/challenge and falsification→Driftwood are the next product slice.

## Test Results

| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
| Initial worktree state | `git status --short --branch` | Clean `main` aligned with `origin/main` | `## main...origin/main` | Pass |
| Focused core passage tests | `vitest` mapping + rebuild capability | New schema/governance behavior passes | 10/10 | Pass |
| Focused server passage tests | `vitest test/structures.test.ts` | Transaction, auth, graph, error semantics pass | 14/14 | Pass |
| Focused web passage tests | client + reducer + notebook + static UI | Wire/state/markup red-lines pass | 24/24 | Pass |
| Web typecheck | `pnpm --filter @frontier-isles/web typecheck` | Data boundary + TS pass | Exit 0 | Pass |
| Production build | `pnpm --filter @frontier-isles/web build` | Build succeeds; inspect bundle budget | Exit 0; main 1,231.55 kB / 400.56 gzip after final hardening | Pass with baseline caveat |
| OPP typecheck retry | `pnpm --filter @frontier-isles/opp typecheck` | Isolate root parallel failure | Exit 0 | Pass |
| Detached HEAD bundle comparison | same Vite/deps, detached `c319b00` | Attribute only this diff | HEAD 1,223.02/397.42; final current 1,231.55/400.56 | Pass with +8.53/+3.14 kB main delta |
| Workspace typechecks | isolated OPP + web + sequential renderer/core/server + data/assets recursive segment | All package checks pass without recursive concurrency kill | All exit 0 | Pass |
| Full workspace tests | `pnpm test` | All current suites pass | 658/658 after correcting one stale name-only snapshot | Pass |
| Desktop passage browser | 1440×1000 named session | Blank human form → POST → same-lens return + receipt | POST 200; exact source-only body; receipt persisted | Pass; POST mocked |
| Responsive browser | 1024×768 and 390×844 | No horizontal overflow; mobile remains read-only | 0 px overflow; no mobile lens/form | Pass |
| Accessibility browser | Tab / Shift+Tab / Escape / reduced motion | Visible focus, modal containment, cancellation, no motion dependence | Both focus loops stay in dialog; Escape closes; 0.01 ms animations | Pass |

## Error Log

| Timestamp | Error | Attempt | Resolution |
|-----------|-------|---------|------------|
| 2026-07-18 | `codegraph node` found no indexed match for two Markdown authority files | 1 | Use direct reads for docs; reserve CodeGraph for indexed source. |
| 2026-07-18 | `codegraph node` found no indexed match for package configs | 1 | Read known `package.json` files directly; no broad search needed. |
| 2026-07-18 | `pnpm dev` exited 1 with no PTY output | 1 | Retry non-PTY to obtain diagnostic output; do not repeat the identical launch. |
| 2026-07-18 | Web probe returned 200 while API probe could not connect to 8787 | 1 | Inspect listeners and dev-session output; do not treat fallback UI as full-stack truth. |
| 2026-07-18 | Server child failed with exit 137; pre-existing Vite process owns 5173 | 2 | Read the target execution outline first, then restart only the missing server path and re-probe. |
| 2026-07-18 | Planning-file correction patch missed the exact earlier wording | 1 | Located the actual lines with `rg`, applied a narrower correction, and left product code untouched. |
| 2026-07-18 | Core package test command ignored the intended file filter and ran the full suite; one unrelated archipelago name snapshot mismatched | 1 | Confirmed both newly changed test files passed; use `pnpm --filter @frontier-isles/core exec vitest run <paths>` for focused runs and retain the unrelated failure for final gate reporting. |
| 2026-07-18 | New unverified-source server test used a nonexistent island slug and received the correct 404 instead of the intended 422 | 1 | Replaced it with a real seeded island where the same actor is a member but the selected structure edge is absent. |
| 2026-07-18 | Notebook round-trip test still expected only the departure in surveyed islands after completing a passage | 1 | Updated the expectation to include the destination, matching the intentional reducer behavior. |
| 2026-07-18 | First web typecheck found two stale flat `slug` accesses after gap rows gained canonical op ids | 1 | Changed both checks to `row.d.slug`; the data-import boundary had already passed. |
| 2026-07-18 | Root typecheck reported only `packages/opp typecheck: Failed` both with and without a concurrent build | 2 | Isolated OPP and sequential package typechecks all pass; retain the root recursive-concurrency failure as an environment/resource limitation. |
| 2026-07-18 | Production main bundle is 1,240.56 kB / 403.06 kB gzip, above the previously recorded ~812 kB baseline | 1 | Generate a source-map attribution build and determine whether this iteration introduced the delta before accepting the performance gate. |
| 2026-07-18 | Detached worktree `pnpm`/Corepack shim could not resolve its package-manager signature and silent shim calls produced no build | 1 | Used the already installed Vite executable and read-only local dependency links; after copying workspace package symlink directories, the detached HEAD build completed. |
| 2026-07-18 | First detached Vite call could not resolve `@frontier-isles/opp` from baseline core | 1 | Added the missing package-local dependency link directories in the temporary worktree and reran successfully. |
| 2026-07-18 | Full suite found snapshot still expected `基础物理·南部群岛` while current data and roadmap use `基础物理·因果科学群岛` | 1 | Updated only the stale snapshot name; no algorithm or corpus data changed. |
| 2026-07-18 | Separate server starts (`tsx` watch, non-watch, direct Node loader) ended in `SIGKILL` or `esbuild service stopped` | 4 | Host is under severe memory pressure. Preserve user processes/database; rely on 14 real Hono/SQLite integration tests and mock only the browser write request. |
| 2026-07-18 | `agent-browser` system Chrome exited before creating `DevToolsActivePort`, including explicit sandbox flags | 3 | Point a fresh namespace at the installed Playwright headless shell; browser startup succeeds and only the absent preview initially caused `ERR_CONNECTION_REFUSED`. |
| 2026-07-18 | The previous Vite listener on 5173 disappeared before browser verification | 1 | Started a dedicated project Vite preview on 127.0.0.1:5173 and retained its session for the verification pass. |
| 2026-07-18 | A guessed `wait --text` probe timed out although the workbench was already present | 1 | Refresh the DOM snapshot and assert `.fi-passage-workbench` plus semantic controls directly. |
| 2026-07-18 | Concurrent fills raced inside one browser session and concatenated values into the substrate input | 1 | Refill every controlled field sequentially with stable CSS selectors; the exact request body then matched the intended mapping. |
| 2026-07-18 | First submit attempt through a changing snapshot ref produced no captured request | 1 | Use the stable submit CSS locator; captured POST 200, return state, and receipt. This was a harness-ref issue, not reproduced as a product failure. |

## 5-Question Reboot Check

| Question | Answer |
|----------|--------|
| Where am I? | Complete; ready for user handoff |
| Where am I going? | No required work remains in this iteration |
| What's the goal? | Deliver one coherent flagship upgrade toward a continuous, evidence-grounded research world |
| What have I learned? | See `findings.md` |
| What have I done? | See Phase 1 above |

## 2026-07-18 Island Depth Upgrade — UI Checkpoint

- **Status:** completed; superseded by the final closeout below.
- Added the island-local district map and accessible list twin to the generated-island L1 scene: Harbor, Inquiry, Archive, Works, and Observatory now open from real notebook/evidence signals rather than XP.
- Replaced the single-room station drawer with a semantic multi-floor building cutaway. Floors are projected from distinct QFocus, depth, literature, evidence, artifact, resident, and active-structure content.
- Added keyboard floor navigation, modal focus containment, Escape/close behavior, visited-floor marks, and reopen-to-last-visited-floor persistence.
- Kept rewritten closed questions on exactly one semantic floor instead of duplicating them across “reframed” and “provisionally closed”.
- Focused gate after integration: Web typecheck/data-import boundary exit 0; 5 Vitest files, 41/41 tests pass.
- Next checkpoint: make the expanded xfrontier-derived theme families visible and filterable in Structure Lens, then run repository-wide and live-browser verification.

### Structure-theme UI checkpoint

- The Structure Lens now exposes six xfrontier-derived theme routes, counts and a theme filter across eight structures.
- The selected structure reveals its theme, isomorphism cue, first-party source record IDs, and review date. This editorial provenance remains separate from the structure⇄island graph; no source record creates an edge.
- Added a static map/list-twin contract test and a Structure Lens provenance/red-line test.
- Current focused gate: Web typecheck/data-import boundary exit 0; 7 Vitest files, 45/45 tests pass.

### Full-stack browser checkpoint

- Verified the actual project stack at Web `5174` + API `8787`; port `5173` belongs to `/Users/jili/AIAI/open-science/apps/desktop` and was excluded from all Frontier Isles evidence.
- Live API returns 8 structures across 6 themes; browser requests to structures, graph, islands, identity, harbor, island records, and ledgers all returned 200 through the Vite proxy.
- At 1440×1000, progressed `formal-math` from Harbor/Inquiry into all 5 surveyed districts, opened a 5-floor Question Wall, visited distinct content floors, reloaded, and recovered notebook v3 district/floor state.
- Verified an active `异常即信号` crossing on the island map and a sourced Dock roof floor with xfrontier records `#629/#716` plus the explicit no-human-mapping/no-edge boundary.
- Verified Arrow navigation, Escape focus return, forward/reverse modal focus containment, and a keyboard-visible 3px floor outline. Reduced-motion computes district animation and drawer transitions to `0s`.
- Horizontal overflow is 0 at 1440×1000, 1024×768, and 390×844. Mobile stays explicitly read-only and does not expose the desktop district/floor/structure surfaces.
- Day, night, floor, structure-lens, and mobile screenshots are under `tmp/verification/`; page errors are empty and the console contains only Vite/React development messages.
- Full repository gates before browser pass: 672/672 tests, all 8 package typechecks sequentially, production build exit 0, and `git diff --check` clean.
- Follow-up ledger audit: CodeGraph found one initial read plus the existing 20 s ritual poll. After clearing resource timings in a fresh isolated L1 session, a 25 s observation recorded exactly one `ledger.jsonl` request (4 ms), so the long-session list was cumulative evidence rather than a render/request loop.

## 2026-07-18 Island Depth Upgrade — Final Closeout

- **Status:** completed.
- Full workspace test gate: **673/673** passing (`opp` 21, `assets` 53, `renderer` 114, `core` 164, `scout` 19, `web` 227, `server` 75).
- Sequential workspace typecheck: all eight participating packages exit 0, including atlas-data drift and web import-boundary checks.
- Production build exits 0. Main: **1,248.20 kB / 407.46 kB gzip**; `StructureLensPanel`: **6.40 / 1.98**; `GeneratedIslandScreen`: **52.56 / 18.39**; lazy interior fallback: **1,210.00 / 482.99**. Against the same-dependency passage baseline, the attributable main delta is **+16.65 / +6.90 kB**.
- Full-stack Playwright world round trip passes **1/1** after separating the visible docking berth from the durable safety-radius re-entry pose. This removes dense-island owner drift after reload without changing the visible docking animation.
- Real browser/API proof used Frontier Web `5174` and API `8787`; the unrelated process on `5173` was not counted. All temporary listeners and the temporary Playwright config were removed afterward.
- `git diff --check` passes. Existing Ferry Dock / Constellation Passage work remains preserved in the same dirty working tree; no commit or destructive cleanup was performed.
- Honest scope boundaries: the district/floor system is integrated into the 128 generated-island path, while the bespoke `machine-curiosity` screen still uses its authored scene; mobile remains an explicit read-only companion; semantic navigation floors and reproduction-driven `Growth.floors` remain separate truths; main and lazy fallback chunks still exceed Vite's warning threshold.

## 2026-07-18 Cross-Domain Connection Field — Verification Checkpoint

- **Status:** implementation and verification complete in the current working tree.
- Added the pure `ConnectionField` projection and focused tests. It preserves mechanism convergence, mathematical form, bridge, evidence, contradiction, and lineage as distinct channels and never promotes cluster/domain/proximity into an edge.
- Extended resolved mapping reads with full correspondences, prediction, evidence, authored-language provenance, and an explicit analogy boundary. New writes require a boundary; legacy refs remain valid; seed refinement stays idempotent.
- Replaced the collapsed taxonomy-first Structure Lens with the default global connection field and a renderer grammar for convergence hubs versus typed direct paths.
- Added global → multi-problem focus → pair validation, plus problem-first search into the same field. Completed writes increment the graph revision so a new branch appears on return.
- Rebuilt the pair workbench around two concrete QFocus questions, the shared core, problem A's existing mapping, a blank problem B correspondence, an explicit difference, and a falsifiable test.
- Replaced primary Ferry/Tearoom/transplant copy with functional research language while preserving stable internal ids and old notebook aliases.
- Upgraded 390 px MobileShell from a disabled Bridge tab to the default read-only Connection field: 4 multi-problem hubs, 10 direct relations, focused boundaries, typed path detail, and problem search. Desktop authoring remains intentionally absent.
- Repository gates pass: 681/681 tests (OPP 21, assets 53, renderer 114, scout 19, core 167, Web 232, server 75); all eight workspace typechecks; atlas drift and Web data-import boundary checks; production build; and `git diff --check`.
- The full-stack Playwright world round trip passes in Chromium (1/1): atlas exploration → survey/dock → island → return with restored field position.
- Fresh browser proof: desktop 1440×1000, tablet 1024×900, and mobile 390×844 all have zero horizontal overflow and empty page-error lists. Desktop/mobile current-session consoles are clean; reduced-motion is active and the desktop connection panel computes 0 s animation.
- Live stack is healthy on Web `5173` and API `8787`; `/api/structures/graph` reports 12 compressed edges and 24 resolved mapping records after one idempotent boundary refinement.
- Production build output is valid. Vite still reports two large existing chunks: `interior-bundle` 1,210.00 kB / 482.99 kB gzip and main 1,272.66 kB / 416.30 kB gzip; code splitting remains a recorded performance follow-up.
- Honest remaining boundary: current ledger paths do not yet expose full argument bodies; stronger authored channel provenance, challenge/refutation, and falsification-to-workspace handling remain open. Compact viewports deliberately do not write mappings.

## 2026-07-18 Connection Dossier + Human Challenge — Final Closeout

- **Status:** completed in the current working tree. The prior “argument bodies/challenge path” boundary is closed for signed evidence and contradiction paths; broader mechanism/bridge/lineage authoring remains deliberately open.
- Added resolver-aware semantic ref projection. Currents now retain one stable record per action with separate target and response refs, summaries/bodies, target/response evidence, test, actor/time/action, and a historical-gap flag. Claim state and whirlpools use the same semantic target.
- Added `POST /api/islands/:slug/connection-response`. It validates a real cross-island claim/publish anchor, body, discriminating test, language, evidence, identity, and capability before atomically writing the response ref, phase-D validate/refute event, and Workshop placement. Denial leaves no orphan ref.
- Added a desktop connection dossier and progressively disclosed support/challenge form. Successful writes refetch and retain focus on the resulting evidence/contradiction path. Mobile shows the same target/response/evidence/provenance/test records but no write controls.
- Focused server verification covers the Workshop placement metadata as well as response reprojection; server suite remains **83/83**.
- Isolated production-stack proof used `http://localhost:8790` and `/tmp/frontier-isles-connection-proof-1433.db`, never the persistent development database. A real authenticated refute changed the selected Living Wires ↔ Compositional Scientific Modeling path from `w1` to `w2`; the new dossier record retained response ref `sha256:ef9b3f417a2cae29dc3de58471a202da4d62d530e9b83b9637108e15ee94e8fb`, body, test, evidence, actor, event action, and Workshop attribution after refetch.
- Desktop 1440×1000 proof: native Summary Enter expands the form; Escape in a textarea leaves the focused dossier open; Escape from the summary returns to the global field. A discovered map-keyboard collision was fixed in `AtlasChartHost`. Document width is exactly 1440 px, panel client/scroll width is 452/452 px, console output is empty, and reduced-motion computes 0 s transition/animation.
- Mobile 390×844 proof: document/body width is exactly 390 px, both historical and newly written records remain readable, long refs do not overflow, and the write-form count is zero. Authored Chinese remains source-language content under English UI rather than receiving an invented translation.
- Final repository gate: **697/697 tests** (OPP 21, assets 53, renderer 114, scout 19, core 170, Web 237, server 83); all eight recursive typechecks including atlas drift and Web import-boundary checks; production build; `git diff --check`; and real full-stack Playwright world round trip **1/1** in Chromium.
- Production output: CSS **147.03 / 23.26 kB gzip**, lazy `ConnectionFieldPanel` **25.68 / 8.61**, main **1,277.68 / 417.82**, lazy interior fallback **1,210.00 / 482.99**. Vite's existing >500 kB warnings remain an explicit performance follow-up.
- The isolated browser namespace and port `8790` proof server were closed after evidence capture. The requested development stack remains healthy on Web `5173` and API `8787` (both HTTP 200); no write was made to its persistent database.
- Remaining boundaries: old responses cannot recover never-stored bodies/tests; mechanism/bridge/lineage contracts remain read-only; the client currently authors from the path's response endpoint; RO-Crate descriptors are not fetched/content-verified; mobile authoring remains intentionally absent; falsification→working-space routing is not yet implemented.

## 2026-07-18 Plain-Language Research Comparison Reset — Final Closeout

- **Status:** completed and verified in the current working tree. The primary relation experience no longer asks visitors to learn a “Connection Field” ontology before seeing a real study and a real judgment.
- Reframed the global entry as `从别的研究里找办法`. Multi-study rows lead with the actual shared statement and participating studies; pair rows lead with the actual study names and an ordinary-language judgment. Raw `wN`, source-class names, “map grammar”, “convergence”, and generic bridge/lineage labels are absent from the primary read.
- Moved the five graph classes behind one native, closed-by-default filter disclosure. The types still control the visual/data projection, but they no longer occupy the first comprehension layer.
- Standardized desktop/mobile detail language around `能借用什么 / 在这项研究里具体是什么 / 哪里不能照搬 / 怎么验证`; standardized the dossier around source material, reason for support/challenge, and a result that would overturn the judgment.
- Simplified the island workbench in the same pass: the two real studies are the title, the old three-step ritual and ferryman boundary card are removed, and the person directly writes object correspondences, the non-transferable difference, and the observable test.
- Browser evidence: desktop 1440×1000 global, group, pair dossier, problem search, filter, and island-workbench paths; Chinese/English parity; mobile 390×844 read parity with zero horizontal overflow; native Summary keyboard expansion; reduced-motion active; empty page-error list. Screenshots: `tmp/connection-language-after-1.png`, `tmp/connection-language-group.png`, `tmp/connection-language-path-final.png`, `tmp/connection-language-mobile-zh.png`, `tmp/connection-language-mobile-en.png`, and `tmp/passage-workbench-plain-language.png`.
- Final repository gate: **698/698 tests** (OPP 21, assets 53, renderer 114, scout 19, core 170, Web 238, server 83); all eight recursive typechecks including atlas drift and Web import-boundary checks; production build; `git diff --check`; and real Chromium world round trip **1/1**.
- Production output: CSS **145.97 / 23.15 kB gzip**, lazy `ConnectionFieldPanel` **26.39 / 8.67**, lazy `PassageWorkbench` **7.11 / 2.33**, main **1,278.60 / 418.10**, lazy interior fallback **1,210.00 / 482.99**. Vite's existing >500 kB warnings remain a performance follow-up.
- The development stack remains the live truth surface on Web `5173` and API `8787`. No additional graph system, schema, relation edge, ledger action, or persistent-data write was introduced by this language reset.

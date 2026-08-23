# Progress Log: Frontier Isles 2026-08 System Plan

## Session: 2026-08-08

### Phase 1: Recover Current Truth
- **Status:** complete
- Actions taken:
  - Recovered the relevant frontier-isles history and evidence-boundary rules.
  - Used CodeGraph to trace the current App, atlas, voyage, island, and lazy-interior paths.
  - Verified git state, current commits, release manifest, GitHub Actions, and live health.
  - Ran unit/integration tests, typecheck, production build, and browser diagnostics.
- Files created/modified:
  - `task_plan.md` (created for the new planning cycle)
  - `findings.md` (created for evidence and decisions)
  - `progress.md` (created for continuation state)

### Phase 2: System Synthesis
- **Status:** complete
- Actions taken:
  - Established the current product loop and initial bottleneck set.
  - Began separating product, platform, and release work.
  - Traced the model workflow from catalog and deterministic runtime through ModelWorkbench save receipts.
  - Rechecked architecture v3 and the executable-model v1 contract for extension boundaries.
  - Calibrated entry/CSS headroom against the executable Vite budgets and reviewed the CI gate order.
- Files created/modified:
  - `task_plan.md`
  - `findings.md`
  - `progress.md`

### Phase 3: Portfolio and Sequencing
- **Status:** complete
- Actions taken:
  - Selected a bounded declarative `ModelSpec` path as the recommended next product slice.
  - Began defining enabling reliability work, staged authoring/AI work, and explicit deferrals.
- Files created/modified:
  - `task_plan.md`
  - `findings.md`
  - `progress.md`

### Phase 4: Verification Architecture
- **Status:** complete
- Actions taken:
  - Defined source, workspace, browser, CI, deployment, and human-validation proof surfaces.
  - Added model-specific determinism, migration, non-ledger, responsive, AI-failure, and bundle-isolation gates.
- Files created/modified:
  - `docs/system-plan-2026-08.md`
  - `task_plan.md`
  - `findings.md`
  - `progress.md`

### Phase 5: Delivery
- **Status:** complete
- Actions taken:
  - Produced the system diagnosis, target architecture, W0-W4 portfolio, 30/60/90-day sequence, deferrals, and stopping conditions.
  - Rechecked the plan against PROJECT-CORE, architecture v3, the executable-model v1 contract, ROADMAP priorities, Vite budgets, and CI gates.
  - Ran `git diff --check`; no whitespace errors were found.
- Files created/modified:
  - `docs/system-plan-2026-08.md`
  - `task_plan.md`
  - `findings.md`
  - `progress.md`

### Phase 6: AI-Native Boundary Re-arbitration
- **Status:** complete
- Actions taken:
  - Reopened the suggestion-only boundary after the user challenged whether AI should be prohibited from running autonomously.
  - Traced the current autonomous scout/night-shift path and capability gateway with CodeGraph.
  - Confirmed that the repository already permits autonomous read/search/rank/driftwood/digest work and separates it from human promotion.
  - Arbitrated three autonomy models and selected bounded autonomous investigation.
  - Replaced the suggestion-first system plan with mission, execution, trace, and epistemic control layers.
  - Added autonomy levels A0-A4, effects E0-E4, scoped grants, Model Lab A2 proof, Mission Control, 30/60/90 sequencing, and verification invariants.
- Files created/modified:
  - `docs/system-plan-2026-08.md`
  - `task_plan.md`
  - `findings.md`
  - `progress.md`

### Phase 7: Mission Contract and Policy Core
- **Status:** complete
- Actions taken:
  - Recovered the completed AI-native plan after the user authorized continuation.
  - Bounded implementation to contracts, deterministic runner, and scout compatibility; UI, live providers, generated-code sandbox, commit, push, and deploy remain outside this slice.
  - Used CodeGraph to confirm the current scout call path, writer boundary, and blast radius.
  - Selected explicit `@frontier-isles/core/mission*` subpath exports so the web root barrel and eager bundle remain untouched.
  - Implemented and tested versioned contracts, resource-scoped E0-E4 policy, hard E4/governance denials, budgets, expiry, and grant exhaustion.
- Files created/modified:
  - `packages/core/src/mission.ts`
  - `packages/core/src/mission-runner.ts`
  - `packages/core/test/mission.test.ts`
  - `packages/core/test/mission-runner.test.ts`
  - `packages/core/package.json`
  - `task_plan.md`
  - `progress.md`

### Phase 8: Deterministic Mission Runner and Scout Compatibility
- **Status:** complete
- Actions taken:
  - Implemented deterministic plan/execute/revise/stop turns, append-only trace events, pre-effect metering, retry limits, idempotent reuse, pause/revoke polling, and immutable planner snapshots.
  - Added resume from paused bundles while preserving trace sequence, usage, completed outputs, failures, and grant-use counts.
  - Wrapped `runNightShift` without modifying its existing pipeline behavior.
  - Routed the real night CLI through `runNightShiftMission` and added a structural regression test for that production boundary.
  - Classified dry runs as E1 and live driftwood/digest work as mission-granted E2 proposals; retained the MCP gateway as the final capability boundary.
  - Proved live success, dry-run, missing grant, insufficient budget, retry, idempotency, and pause paths with focused tests.
- Files created/modified:
  - `apps/scout/src/mission.ts`
  - `apps/scout/src/index.ts`
  - `apps/scout/test/mission.test.ts`
  - `apps/scout/package.json`
  - `pnpm-lock.yaml`

### Phase 9: Verification and Handoff
- **Status:** complete
- Actions taken:
  - Passed 14 mission-core tests and core typecheck.
  - Passed 9 scout mission/legacy-night tests and scout typecheck after refreshing workspace links.
  - Re-ran the final repository gates after adding resume, A0/A4 enforcement, resource-required scope checks, immutable JSON trace snapshots, and the real CLI mission boundary: 926 tests passed, recursive typecheck passed, and production build passed.
  - Confirmed bundle isolation: entry 878.02 kB raw / 302.74 kB gzip, CSS 225.62 kB, lazy interior 1,210.00 kB—unchanged from baseline.
  - Ran `git diff --check`; no whitespace errors were found.
  - Recorded exact implemented and deferred boundaries in `docs/system-plan-2026-08.md` section 14.

### Phase 10: Post-commit Review and Authorization Hardening
- **Status:** complete
- Actions taken:
  - Verified that the automated review used an identical merge base and therefore examined an empty diff.
  - Rebased the review on `4c18865..c62564c` and reconstructed the mission/policy/scout execution paths with CodeGraph.
  - Identified resource-prefix leakage, stale pause/revoke polling after asynchronous planning, and an uncaught malformed-estimate path as pre-persistence hardening work.
  - Fixed those three paths and passed 196 core tests, core typecheck, and diff hygiene.
  - Located the existing canonical JSON implementation and selected a pure core parser plus Scout-owned Node IO/store boundary for the next phase.
  - Added runtime parsing/invariant checks for persisted bundles and rejected `undefined` outputs that cannot survive JSON storage.
  - Added a content-addressed, atomic `running`/`settled` Scout record with exclusive lock, optional CLI state-file routing, paused-run resume, terminal reuse, and safe refusal of ambiguous running records.
  - Passed 200 core tests, 32 Scout tests, both package typechecks, and diff hygiene before the next safety refinement.
  - Restricted automatic retry to E0/E1, corrected Scout's minimum network preflight to three calls, and froze persisted scientific time to the contract creation timestamp.
  - Final Phase 11 repository gates passed: 940 tests, recursive typecheck/release/atlas/import checks, production build, and diff hygiene.
  - Production bundle boundaries remained unchanged: entry 878.02 kB raw / 302.74 kB gzip, CSS 225.62 kB / 34.95 kB gzip, lazy interior 1,210.00 kB / 482.99 kB gzip.

### Phase 12: A2 Autonomous Model Lab Proof
- **Status:** complete
- Actions taken:
  - Traced the deterministic model kernels, React workbench orchestration, local receipt types, notebook version, and lazy component boundary.
  - Extracted runtime creation/advancement/observation/prediction logic into a pure module reused by the existing manual workbench.
  - Added bounded `ModelSpecV1` parsing/compilation for both synchronization and shared-field kernels.
  - Added an A2 synchronization investigation that runs a declared coupling sweep, records a failed prediction, revises twice, reaches the declared target on the third run, and stops with `goal_reached`.
  - Added structural bundle round-trip, deterministic replay, non-ledger receipt, budget exhaustion, 12-run/30-second ceiling, and malformed-object tests.
  - Passed final repository gates: 948 tests, recursive typecheck/release/atlas/import checks, production build, and diff hygiene.
  - Confirmed eager boundaries remain unchanged. The lazy ModelWorkbench chunk changed only from 25.10 kB to 25.16 kB raw while remaining 9.51 kB gzip; the provider-free mission module is not reachable from the current UI bundle.
- Files created/modified:
  - `apps/web/src/models/runtime.ts`
  - `apps/web/src/models/modelSpec.ts`
  - `apps/web/src/models/modelMission.ts`
  - `apps/web/src/models/__tests__/modelSpec.test.ts`
  - `apps/web/src/models/__tests__/modelMission.test.ts`
  - `apps/web/src/components/model/ModelWorkbench.tsx`
- Files created/modified:
  - `task_plan.md`
  - `findings.md`
  - `progress.md`

### Phase 13: Playwright Service Lifecycle Stabilization
- **Status:** complete
- Actions taken:
  - Recovered the current planning state and confirmed the next reversible phase is browser-harness stabilization.
  - Preserved the existing uncommitted Phase 10-12 product/runtime changes; commit, push, deployment, and new visible product work remain outside this phase.
  - Confirmed ports 5173 and 8787 were unowned/unreachable before the reproduction, eliminating stale-service reuse for this baseline.
  - Reproduced the sandbox boundary with `DEBUG=pw:webserver`: both services became ready, then all seven scenarios failed at Chromium Mach-port registration before page creation; Playwright cleanly terminated both services afterward.
  - Ran the identical suite outside the sandbox from clean ports with two workers: all 7 scenarios passed in 45.8 seconds.
  - Verified Playwright reclaimed both services after success: no listeners remained on 5173/8787 and both post-run probes were refused.
  - Updated `apps/web/playwright.config.ts` to use the API's non-watch `start` path, own fresh services by default, allow reuse only through `PLAYWRIGHT_REUSE_EXISTING_SERVERS=1`, and pipe both service logs.
  - Passed web typecheck/data-import checks, Playwright config discovery (7 tests / 2 files), and diff hygiene after the harness edit.
  - Passed the complete post-fix single-worker browser suite: 7/7 in 53.9 seconds, followed by successful teardown of both listeners.
  - Passed the first post-fix two-worker browser suite: 7/7 in 46.4 seconds, followed by successful teardown of both listeners.
  - Passed the second post-fix two-worker browser suite: 7/7 in 40.6 seconds, followed by successful teardown of both listeners.
  - Passed final repository gates after the harness change: 948 tests, recursive typecheck/release/atlas/import checks, production build, and unchanged bundle boundaries.

### Phase 14: Visible A2 Model Mission Control
- **Status:** complete
- Actions taken:
  - Confirmed the project design context and selected a restrained field-instrument treatment rather than a generic AI dashboard.
  - Bounded the slice to the existing provider-free deterministic A2 mission inside the already-lazy ModelWorkbench; notebook-v5 persistence, live providers, promotion, commit, push, and deploy remain outside this phase.
  - Added a progressively disclosed Mission Control that declares its A2/E1 authority and budgets before an explicit run, dynamically imports the mission runner, and exposes real trials, revisions, replay, stop reason, and event sequence afterward.
  - Added honest unsupported-state guidance for shared-field models instead of implying autonomous coverage that does not exist.
  - Passed 10 focused component/mission tests, web typecheck/data-import checks, and diff hygiene.
  - The first real browser scenario failed before mission completion because Vite discovered `zod` from the dynamic mission graph, optimized it, and reloaded the page; recorded as an import-boundary defect rather than masking it with a longer timeout.
  - A first `optimizeDeps.include` attempt made the scenario pass but emitted an unresolved-dependency warning under pnpm's strict workspace layout; rejected that approach instead of adding a redundant direct web dependency.
  - Switched to `optimizeDeps.exclude: ['zod']`; a config-fresh rerun passed the real Mission Control scenario in 8.2 seconds with no reload or dependency-resolution warning.
  - Visually inspected collapsed, authorization, and completed Mission Control states on desktop plus the mobile model tab at 390×844.
  - Confirmed the mobile authorization and completed states have no document overflow (`390px` viewport and scroll width) and retain the same non-ledger/authority hierarchy.
  - The first complete 8-scenario run finished 6/8: no service loss, but the new A2 night setup targeted an absent L0 control and the broader mobile axe audit exposed existing/new accent-text contrast failures.
  - Replaced Model Lab accent text with the existing AA-safe semantic text tokens and added a portal-compatible night palette selected through the app shell state.
  - Corrected the night style test without pretending an L1-only lever exists on L0; the two previously failing A2/mobile scenarios then passed 2/2 in 15.5 seconds.
  - Passed the final complete two-worker browser suite: 8/8 in 48.3 seconds, with both 5173 and 8787 reclaimed and diff hygiene clean afterward.
  - Passed final repository gates: 950 tests, recursive typecheck/release/atlas/import checks, production build, and diff hygiene.
  - Confirmed the eager entry remains effectively flat at 878.05 kB raw / 302.75 kB gzip; Mission Control stays in the 35.60 kB / 13.01 kB gzip lazy workbench and its runtime is a nested 72.66 kB / 18.22 kB gzip chunk.

### Phase 15: Notebook-v5 Mission Evidence Persistence
- **Status:** complete
- Actions taken:
  - Re-measured the inherited baseline before changing anything: 950 tests, recursive typecheck, production build, and `git diff --check` all passed on `badd1db`, with entry 878.05 kB raw / 302.75 kB gzip.
  - Traced the eager/lazy boundary and found the binding constraint: `explorationNotebook` loads at boot, while `guardEntryChunk` in `apps/web/vite.config.ts` denylists `zod` in the entry chunk and caps it at 900 KiB. The mission receipt reaches `zod` through the core contracts, so the notebook may borrow its types but never its values.
  - Added `apps/web/src/state/missionEvidence.ts`: a bounded, hand-parsed `ModelLabMissionEvidenceV1` projection with no runtime edge to the mission chunk, capped at 12 trials (mirroring `MODEL_LAB_MAX_RUNS`) and 50 retained missions.
  - Made non-promotion enforceable at the parse boundary: a stored record whose `epistemicStatus` is not `model_observation`, whose `ledgerEffect` is not `none`, or whose summary counts exceed its surviving trials is discarded rather than trusted.
  - Kept resume authority out of storage: the projection drops the contract, event log, and per-step inputs a runner would need to continue a mission.
  - Raised the notebook to v5 with additive migration; v1–v4 payloads still load and simply carry no missions.
  - Wired `missionRuns` through the session reducer, the eager save/load path, desktop `App`, and the compact `MobileShell`, and added a saved-inquiry list to Mission Control on both surfaces.
  - Rewrote the "current page session only" / "Current page session only" line, which persistence had made false, and added a test asserting the stale wording cannot return.
  - Extended the portable Markdown export with a bounded-inquiry section that carries `model_observation` and `ledger_effect=none` with each record.
  - Added a constant-agreement test so the copied trial ceiling cannot silently drift from the runtime ceiling it mirrors.
- Files created/modified:
  - `apps/web/src/state/missionEvidence.ts`, `apps/web/src/state/explorationSession.ts`, `apps/web/src/state/explorationNotebook.ts`
  - `apps/web/src/components/model/ModelMissionControl.tsx`, `apps/web/src/components/model/ModelWorkbench.tsx`
  - `apps/web/src/App.tsx`, `apps/web/src/components/mobile/MobileShell.tsx`, `apps/web/src/global.css`
  - `apps/web/src/__tests__/missionEvidence.test.ts`, `apps/web/src/__tests__/explorationNotebook.test.ts`, `apps/web/src/components/model/__tests__/ModelMissionControl.test.tsx`, `apps/web/e2e/surface-hardening.spec.ts`

### Phase 16: xFrontier Provenance Lifecycle Audit
- **Status:** complete
- Actions taken:
  - Connected to the local xfrontier MCP and pinned the reviewed corpus to `xf-6eb361265784`: 1,848 active records, 53 clusters, 100% card coverage, and 0/136 authored structure-to-record domain links.
  - Loaded every repository-owned xfrontier id from the composed `FRONTIERS` and `SEED_STRUCTURES` modules before calling `resolve_ids`; the 177 unique references resolved to 176 active, one withdrawn, and zero unknown.
  - Stored the active records' content hashes and the withdrawn record's reason in `packages/data/xfrontier-reference-snapshot.json`; a new test fails if the module reference set and snapshot diverge.
  - Kept `perennial-grain-crops` as a Frontier Isles problem but added a versioned `atlasWithdrawal` for `XF-001449`, whose MCP retirement reason is `too_mature_or_applied` rather than correction or disappearance.
  - Propagated the lifecycle through generated L0 data and server metadata, with an L0 fallback so an older seeded database cannot hide the update.
  - Added a compact bilingual L1 provenance marker; the full MCP-derived reason and dataset version remain in its title text.
  - Used agent-browser against an isolated production build on port 8790. The marker rendered at 1280×633 and 1024×768 with no horizontal overflow or console errors; at 390px the pre-existing read-only mobile shell owns the route and does not render L1.
- Files created/modified:
  - `packages/data/xfrontier-reference-snapshot.json`, `packages/data/test/xfrontier-provenance.test.ts`
  - `packages/data/src/frontiers.ts`, `packages/data/scripts/generate-atlas.mjs`, generated `packages/data/src/atlas.ts`
  - `apps/server/src/store.ts`, `apps/server/src/seed.ts`
  - `apps/web/src/components/island/GeneratedIslandScreen.tsx`, `apps/web/src/i18n/zh.ts`, `apps/web/src/i18n/en.ts`, `apps/web/src/__tests__/fallback.test.ts`

### Phase 17: xFrontier Downstream Sync Foundation
- **Status:** complete
- Recovered the current dirty worktree and existing Phase 16 provenance changes without overwriting them.
- Re-read the local xFrontier MCP surface live: downstream reads have dataset versions and content hashes, while proposal/finding writes remain outside this phase.
- Confirmed the first implementation boundary: explicit pull/diff plus review output, followed by an allowlisted runtime catalog `ProblemMeta.atlas` reconciliation; no upstream writes, commit, push, or deployment.
- Reconfirmed the live baseline before implementation: MCP server `0.5.0`, dataset `xf-6eb361265784`, 1,848 active records, 18 retired ids, 10 findings, and zero proposals.
- Added `xfrontier:sync`: default and `--check` are read-only; `--json` exposes the full diff; `--write-snapshot` is explicit and guarded by server identity, request timeouts, dataset/unknown checks, a writer lock, baseline CAS, atomic rename, and directory fsync.
- Migrated the provenance snapshot without changing its dataset or record data. It now records schema `xfrontier-reference-snapshot/v1`, MCP server `0.5.0`, and review date `2026-08-13`.
- Re-ran the real local stdio service after migration: both the default pull and `--check` resolved 177 references as 176 active / one withdrawn / zero unknown, reported no drift, changed no files, and exited 0.
- Added catalog atlas reconciliation for existing database rows with observable materialized/reconciled counts, mandatory matching `atlasN` identity, transaction rollback, and preservation of authored problem/ledger/place state. Missing identity is ambiguous and cannot be claimed from slug alone.
- Passed 19 focused sync/provenance/reconciliation tests and the full 987-test repository suite.
- Passed release-doc, atlas-generation, web import-boundary, and all workspace TypeScript checks; production build passed with entry 885.22 kB raw / 305.27 kB gzip, below the 900 KiB gate.
- Passed final diff hygiene. Phase 17 has no new visible UI surface, so the Phase 16 browser proof was not repeated.
- Files added/modified for Phase 17:
  - `packages/data/scripts/sync-xfrontier.mjs`, `packages/data/scripts/xfrontier-sync-lib.mjs`
  - `packages/data/test/xfrontier-sync.test.ts`, `packages/data/test/xfrontier-provenance.test.ts`, `packages/data/xfrontier-reference-snapshot.json`
  - `apps/server/src/index.ts`, `apps/server/src/seed.ts`, `apps/server/src/store.ts`, `apps/server/test/catalog-atlas-reconciliation.test.ts`
  - root/data package scripts and the pnpm lockfile

### Phase 18: xFrontier Bidirectional Feedback Foundation
- **Status:** complete locally
- Recovered the completed Phase 17 worktree and planning state without discarding its uncommitted changes.
- Selected the next reversible boundary: a local durable outbox/receipt and read-only decision inbox. Default inspection, tests, build, and boot must make zero xFrontier writes.
- Reconfirmed that the existing night-digest webhook is best-effort rather than durable and that the Scout's MCP client is a useful transport pattern, not a shared feedback store.
- Called the live local MCP read tools `stats`, `list_findings(include_stale=true)`, and `list_proposals(limit=100)`: dataset `xf-6eb361265784`, 10 findings, zero proposals, and no xFrontier write.
- Captured exact feedback tool schemas. The upstream tools provide no caller idempotency key; proposal decisions are human-only and list-paged, while findings expose stable ids and staleness but no cursor.
- Read the current upstream proposal implementation: random remote ids, append-only decision records, latest-decision status, reversible human review, and no automatic `audit/` application.
- Read the current SQLite boot migration boundary and confirmed feedback tables can be added idempotently to existing WAL databases without rewriting the knowledge or place planes.
- Confirmed `apps/server` already depends on the MCP SDK and SQLite, while `packages/data` supports explicit subpath exports; no new runtime dependency is required for the feedback bridge.
- Verified live tool annotations: every xFrontier feedback writer is explicitly non-idempotent. Proposal cursors are filter/dataset-bound but not ledger-snapshot cursors, so decision ingestion must deduplicate by remote ids.
- Added the pure `@frontier-isles/data/xfrontier-feedback` contract: strict evidence-anchored envelopes, inert tool intents, exact remote normalizers, complete-page validation, and state diffs. No Node or MCP runtime enters the data package.
- Added durable SQLite exchange storage: idempotent outbox enqueue, source-hash authority checks, append-only attempts/receipts/decisions, proposal/finding inboxes, single-owner remote receipts, and explicit local application/release state.
- Added the fail-closed stdio client and bridge. Reads require reviewed `0.5.0` safety annotations and two equal complete sweeps; writes require one authorized tool and validate every echoed ACK field against the intent.
- Added pull-time proposal rebinding to the immutable envelope and exactly one namespaced success receipt before importing any decision. The whole finding/decision ingestion is one local transaction.
- Added crash-safe operational semantics: begun-call failures become `uncertain`, no automatic retry/cancel exists, local-only `recover-expired` appends lease-expiry receipts, and `inspect` exposes lease/last-receipt detail.
- Kept remote `accepted` distinct from local `acknowledged/applied/released`; a later remote reversal preserves local history and exposes `needsReconciliation` instead of silently rolling state back.
- Added `pnpm xfrontier:feedback` commands and `docs/xfrontier-feedback.md`. In the Phase 18 0.5 protocol, only explicitly confirmed `deliver` could authorize a writer; Phase 19 later replaced that flag with `--confirm-upstream-write` and added the separately confirmed, reconciliation-gated `retry`. Inspect/enqueue/recovery remain local-only and pull/reconcile are read-only.
- Closed all independent-review P1 findings. Final review reported no remaining P0/P1; the only retained boundary is xFrontier `0.5.0` lacking caller idempotency and atomic expected-version preconditions.
- Final live stdio pull into a disposable database observed `xf-6eb361265784`, 10 findings / 0 stale, zero proposals/conflicts/decisions, and no automatic application. The disposable DB was removed, `data/isles.db` was untouched, and `/Users/jili/AIAI/frontier` remained clean on `main...origin/main`.
- No xFrontier write tool was called. No commit, push, CI run, deployment, or browser change was authorized or claimed.

### Phase 19: xFrontier Conditional Feedback Protocol

- Final state-machine tightening complete: each read-only receipt reconciliation now records the exact completed `basisAttemptId` it observed. Retry leasing requires that basis to equal the current last attempt, so `not_found` is consumed by one retry and a later uncertain attempt requires a fresh lookup. The focused store suite passes 15/15 and server TypeScript passes.
- Began the final real-transport proof against a fresh disposable ledger/SQLite pair at `/tmp/xf-phase19-e2e-final.0Oq0Us`; the fixture is a v2 annotation proposal pinned to the live dataset and record content hash, with an independently stored local ref as its evidence anchor.
- Enqueued the isolated fixture through the shipped CLI with zero MCP calls. Durable outbox id: `sha256:2c299c6a96b47144023823c0f03c4e8e1203759ccb978e11685ff5403a7aa8c7`; initial state is `pending` and the envelope hash is `sha256:f4d58bed544b2df2b03ff89b72b11462e897d78cc3b447ed084458076c8e9af0`.
- Created one explicit isolated `uncertain` attempt (`feedback-attempt:e2927dece541190fcd90c096091d1678`) without touching MCP, then ran the real xFrontier 0.6 `get_feedback_receipt` path against the disposable empty ledger. It returned exact `not_found`; the CLI durably recorded the attempt-bound reconciliation and made one explicit retry eligible, with zero upstream writer calls so far.
- Ran the separately confirmed retry through real xFrontier 0.6 stdio. It created exactly one disposable ledger JSON and transitioned the local item to `delivered`: remote proposal `3f2e78b0`, request hash `sha256:cf511486d1a7ebb60638d611c9837cd71e8caebb2fcf9512c26c8698e32f7dab`, attempt 2 success. Local inspection made zero MCP calls and showed the original `not_found` bound to attempt 1 plus the success receipt bound to attempt 2.
- Replayed the identical strong MCP writer request directly. xFrontier returned `idempotent_replay=true`, the same proposal id `3f2e78b0`, and the same request hash; exact receipt lookup returned that same immutable record. The disposable ledger still contains exactly one 578-byte JSON (`sha256:306cf7a5921ce51128e935fde371fe0a7d5c7e8d937c395896359e9cbfd2b8e2`). `git status -- 'ledger/*.json'` in the real xFrontier checkout remained empty.
- Ran the real 0.6 read/pull path twice against the disposable ledger. Both sweeps observed one proposal, matched it to exactly one local outbox via `client_event_id` plus request hash/receipt binding, imported zero decisions, reported zero conflicts/unmatched items, and kept `appliedAutomatically=false`; the repeat created no duplicate state.
- First root `pnpm -r test` gate did not reach the test runner: the Corepack/pnpm shim attempted `GET https://registry.npmjs.org/pnpm` and the sandboxed network fetch failed. This is an environment/bootstrap failure, not a test failure; package-local binaries remain available, so verification continues without installing or changing dependencies.
- Diagnosed the bootstrap boundary: the project pins `pnpm@10.33.0`, while the global shim tries to fetch it; root and package-local `vitest`, `tsc`, `tsx`, and `vite` binaries are already present. No dependency install is needed or authorized for this closeout.
- Bypassed only the unavailable package-manager bootstrap and ran every workspace package's checked-in Vitest binary directly: 126 files / 1,038 tests passed (core 201, renderer 160, data 58, assets 56, opp 21, scout 33, server 140, web 369).
- Independent upstream P0/P1 review found none. It rechecked replay-before-precondition ordering, canonical JSON rejection rules, deterministic no-replace publication/fsync, structured MCP errors, tool annotations, built 0.6.0/19-tool surface, and byte-identical real ledger JSON. Its own Vitest rerun was sandbox-blocked only by Vite's cache write outside this workspace; the upstream implementation agent's earlier full 1,001+59 test gates remain the executable upstream proof.
- All eight workspace TypeScript checks passed using their local binaries. The additional atlas generation check, web data-import boundary check, and release-doc verifier also passed; the latter confirms the pre-existing release metadata remains `2026-08-04 · main 39a2d2d8 · production 39a2d2d8` and is not being reinterpreted as a Phase 19 release.
- Production web build passed: Vite transformed 1,004 modules and emitted the existing large-chunk warnings only; precompression then produced 26 Brotli files, 3,729 KB -> 1,035 KB (-72.3%). This is a local build proof, not a deployment.
- Closed the downstream review's remote-receipt uniqueness P1: normal success now checks both success receipts and prior found reconciliations under the same `IMMEDIATE` transaction. The new cross-connection reverse-order regression passes; focused store 16/16, server TypeScript, and repository diff check are green.
- Re-ran the complete server suite after that fix: 11 files / 141 tests passed. A final real-ledger **read-only** pull through xFrontier 0.6 stored 10/10 findings, all fresh, observed zero proposals/conflicts/decisions, and retained `appliedAutomatically=false`; no writer tool was called.
- Closed the final cross-repo fail-closed mismatches: structure-link IDs now share xFrontier's trim+uppercase hashing rule, and receipt lookup enforces exact positive/negative response shapes with null negative payloads. Focused data 13/13, client+bridge 22/22, and both data/server TypeScript checks pass. Phase 19 remains in progress only for the post-fix full gate and final re-review.
- Post-fix full workspace test gate passed via local package binaries: 126 files / 1,040 tests (core 201, renderer 160, data 59, assets 56, opp 21, scout 33, server 141, web 369).
- Post-fix type/contract gate passed again: all eight workspace TypeScript checks plus release-doc, atlas, and web import-boundary checks. Vite production build also passed with 1,004 modules and only the pre-existing >500 kB chunk warnings.
- Post-fix artifact hygiene is green: Brotli precompression remains 26 files / 3,729 KB -> 1,035 KB (-72.3%), both repositories pass `git diff --check`, and the real xFrontier `ledger/*.json` status remains empty.
- Re-ran the hardened exact lookup parser over the real 0.6 stdio transport against the disposable ledger: the known event resolved `found:true` to proposal `3f2e78b0`, while a new event returned the exact accepted `found:false` shape. No writer was called.
- Final independent downstream review reports no remaining P0/P1 after rechecking bidirectional receipt uniqueness, contradictory negative lookup rejection, single-use attempt-bound retry proof, structure-id/hash alignment, version gates, pull binding, and CLI authority. One P2 remains: human-readable `inspect` could make retry eligibility more prominent; the Store gate itself is enforced and machine-readable JSON already exposes reconciliation detail.
- Final independent cross-repository review also reports no remaining P0/P1. It verified all three intent/precondition/ACK/list shapes, exact positive and negative receipt lookup, the structure-link normalization fixture, 0.5 read/0.6 write gates, CLI/docs writer boundaries, and `accepted != applied` semantics. Real xFrontier ledger JSON remains unchanged.
- Removed all four Phase 19 disposable SQLite/ledger paths after recording hashes and receipts. A final check found none remaining; both repositories still pass `git diff --check`, the real xFrontier `ledger/*.json` status is empty, and no command targeted Frontier Isles' default database.
- The locally rebuilt, gitignored xFrontier MCP bundle is `dist-mcp/server.mjs` with SHA-256 `116885d917ad31ff31f45c3586023263989d5b6311ef96811c09ad9d46799839`; all integration results refer to that 0.6.0 artifact, not a committed release.
- **Status:** complete

### Phase 20: Commit Readiness and MCP Consumer Onboarding

- Recovered the planning catchup after the user's `继续`. It confirms the local xFrontier stdio server is registered at user scope and healthy; this Codex session exposes all 19 native tools, while an already-running consumer may still need reconnection after a future bundle refresh. No repository MCP config is missing.
- Began a two-repository ownership audit before staging. Local commits are the furthest implied action in this phase; push, CI, deployment, real ledger submission, and human proposal decisions remain separate and unauthorized.
- The user's bounded continuation now covers reversible local gates and commits. Push, CI trigger, production deployment/cache purge, real ledger delivery, human decision, and user-scope MCP configuration remain unauthorized.
- Corrected the xFrontier public inventory to 13 core read tools, six resources, and six ledger/review tools; updated the protocol plan to a durable commit-ready status. Upstream full gates passed: 1,001 Vitest + 59 Node tests, 0 Svelte/TypeScript diagnostics, transport/acceptance 0.6.0 with 19 tools, and append-only ledger validation.
- Created local upstream commit `e9a9ceb` (`feat(mcp): make feedback writes durable and retry-safe`). Rebuilt from that commit; bundle SHA-256 remains `116885d917ad31ff31f45c3586023263989d5b6311ef96811c09ad9d46799839`, probe is healthy, and real ledger JSON remains clean.
- Refreshed the downstream reference snapshot metadata from server 0.5.0 to 0.6.0 with no dataset/reference change, then proved zero drift. Full downstream gates passed: 126 files / 1,040 tests, 8/8 TypeScript workspaces, release/atlas/import checks, production build/precompression, and 8/8 Playwright on isolated 5174/8788 services with an in-memory DB.
- Created local downstream code commit `93771f7` (`feat: connect Frontier Isles to xFrontier lifecycle and feedback`). The only remaining worktree changes are this planning checkpoint.
- **Status:** complete locally; push, remote CI, deployment/cache purge, real feedback delivery, human decisions, and MCP registration changes remain gated
- Recovered Phase 18 as complete and independently reviewed; preserved the entire dirty Frontier Isles worktree rather than restarting or collapsing it into the clean xFrontier checkout.
- Interpreted the user's `继续` as authorization for the documented reversible local protocol and commit slice. Real finding/proposal submission, push, CI trigger, deployment/cache purge, human decisions, and user-scope configuration remain outside this authorization.
- Selected the minimum target: caller-provided idempotency, dataset/record-hash preconditions checked with the append, durable receipt lookup, legacy-call compatibility, and a fail-closed Frontier Isles upgrade path.

## Test Results
| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
| Repository tests | `pnpm test` | All workspaces pass | 907 tests passed | pass |
| Type and contract gates | `pnpm typecheck` | Release docs, atlas/import checks, TypeScript pass | Passed | pass |
| Production build | `pnpm build` | Build within enforced budgets | Passed; entry 878.02 kB raw | pass |
| Browser suite in sandbox | `pnpm test:e2e` | Launch Chromium | macOS Mach-port permission denied before assertions | environment failure |
| Browser suite, two workers | `pnpm test:e2e` outside sandbox | 7 scenarios pass | Service disappeared mid-run; one pass, five connection refusals, one dock timeout | unresolved |
| Browser diagnostic, one worker | Playwright `--workers=1` | Separate product behavior from parallel harness | No failure artifacts remained, but final summary output was not captured | provisional only |
| Production health | root HEAD + `/api/health` | Reachable and healthy | HTTP 200; `{ "ok": true }` | pass |
| Mission core | 2 focused test files + core typecheck | Contracts, policy, runner, resume, and types pass | 14 tests passed; typecheck passed | pass |
| Scout mission compatibility | mission + CLI-boundary + legacy night tests + scout typecheck | Real entry uses the wrapper, preserves behavior, and enforces bounds | 10 tests passed; typecheck passed | pass |
| Final repository tests | `pnpm test` | All workspaces pass after mission runtime changes | 926 tests passed | pass |
| Final repository typecheck | `pnpm typecheck` | Release, atlas/import, and TypeScript gates pass | Passed | pass |
| Final production build | `pnpm build` | Build passes without eager-boundary regression | Passed; entry/CSS/interior sizes unchanged | pass |
| Final diff hygiene | `git diff --check` | No whitespace errors | Passed | pass |
| Durable mission repository tests | `pnpm test` | Parser, policy hardening, atomic store, recovery, and all prior workspaces pass | 940 tests passed | pass |
| Durable mission typecheck | `pnpm typecheck` | Release docs, atlas/import boundaries, and all TypeScript pass | Passed | pass |
| Durable mission build | `pnpm build` | No eager web bundle regression | Passed; entry/CSS/interior sizes unchanged | pass |
| A2 Model Lab repository tests | `pnpm test` | Runtime extraction, ModelSpec, autonomous mission, and all prior workspaces pass | 948 tests passed | pass |
| A2 Model Lab typecheck | `pnpm typecheck` | Release docs, atlas/import boundaries, and all TypeScript pass | Passed | pass |
| A2 Model Lab build | `pnpm build` | Eager bundle unchanged; model workbench remains lazy | Passed; entry 878.02 kB, ModelWorkbench 25.16 kB raw / 9.51 kB gzip | pass |
| Phase 13 Playwright config | web typecheck + `playwright test --list` | Config compiles and all browser scenarios remain discoverable | Passed; 7 tests in 2 files | pass |
| Phase 13 browser single worker | Playwright outside sandbox, fresh owned services | Full suite passes and ports are reclaimed | 7/7 in 53.9s; 5173/8787 reclaimed | pass |
| Phase 13 browser parallel run 1 | Playwright outside sandbox, 2 workers, fresh owned services | Full suite passes and ports are reclaimed | 7/7 in 46.4s; 5173/8787 reclaimed | pass |
| Phase 13 browser parallel run 2 | Playwright outside sandbox, 2 workers, fresh owned services | Repeated full pass without service loss | 7/7 in 40.6s; 5173/8787 reclaimed | pass |
| Phase 13 final repository tests | `pnpm test` | All workspaces pass | 948 tests passed | pass |
| Phase 13 final typecheck | `pnpm typecheck` | Release docs, atlas/import, and TypeScript pass | Passed | pass |
| Phase 13 final build | `pnpm build` | Existing bundle budgets remain intact | Passed; entry 878.02 kB raw / 302.74 kB gzip | pass |
| Phase 14 focused component/mission tests | 3 focused Vitest files | Control boundaries, workbench composition, and A2 runtime pass | 10 tests passed | pass |
| Phase 14 A2 browser path | focused Playwright after optimizer fix | Real launch/run/replay/trace/axe completes without first-click reload | 1/1 in 8.2s | pass |
| Phase 14 night + mobile repair | 2 focused Playwright scenarios | Night A2 and full mobile Model Lab axe/44px/overflow pass | 2/2 in 15.5s | pass |
| Phase 14 complete browser suite | Playwright outside sandbox, 2 workers | New A2 scenario plus all prior browser behavior passes | 8/8 in 48.3s; 5173/8787 reclaimed | pass |
| Phase 14 final repository tests | `pnpm test` | All workspaces pass after the visible mission integration | 950 tests passed | pass |
| Phase 14 final typecheck | `pnpm typecheck` | Release docs, atlas/import, and TypeScript pass | Passed | pass |
| Phase 14 final build | `pnpm build` | Mission runtime remains lazy and enforced budgets pass | Passed; entry 878.05 kB, ModelWorkbench 35.60 kB, modelMission 72.66 kB raw | pass |
| Phase 14 final diff hygiene | `git diff --check` | No whitespace errors | Passed | pass |
| Phase 15 inherited baseline | `pnpm test` / `typecheck` / `build` / `git diff --check` on `badd1db` | Re-measure before changing anything rather than trusting recorded counts | 950 tests, 117 files; typecheck, build (entry 878.05 kB), and diff hygiene passed | pass |
| Phase 15 evidence parser | `vitest run src/__tests__/missionEvidence.test.ts` | Real-run projection, storage round trip, tampering and inconsistency refusal, retention bounds | 9 tests passed | pass |
| Phase 15 notebook migration | `vitest run src/__tests__/explorationNotebook.test.ts` | v1–v4 payloads still load; v5 round-trips missions; a tampered record drops alone | 12 tests passed | pass |
| Phase 15 mission control surface | `vitest run .../ModelMissionControl.test.tsx` | Saved inquiries render and the stale "session only" claim cannot return | 4 tests passed | pass |
| Phase 15 final repository tests | `pnpm test` | All workspaces pass after notebook-v5 | 967 tests, 118 files passed | pass |
| Phase 15 final typecheck | `pnpm typecheck` | Release docs, atlas/import boundaries, and TypeScript pass | Passed | pass |
| Phase 15 final build | `pnpm build` | `zod` stays out of the entry chunk and budgets hold | Passed; entry 884.52 kB (budget 921.6 kB), CSS 234.58 kB, ModelWorkbench 36.91 kB, modelMission unchanged at 72.66 kB | pass |
| Phase 15 browser suite | `pnpm test:e2e`, 2 workers, owned services | Desktop inquiry survives a full reload; compact surface saves without overflow; axe AA holds | 8/8 in 59.6s; 5173/8787 reclaimed | pass |
| Phase 15 final diff hygiene | `git diff --check` | No whitespace errors | Passed | pass |
| Phase 16 xfrontier live resolve | local MCP `stats` + module-loaded `resolve_ids(177 ids)` | Versioned coverage with no unknown ids | `xf-6eb361265784`; 176 active / 1 withdrawn / 0 unknown | pass |
| Phase 16 repository tests | `pnpm test` | Provenance contract and all prior workspaces pass | 971 tests, 119 files passed | pass |
| Phase 16 final typecheck | `pnpm typecheck` | Release docs, atlas/import boundaries, and TypeScript pass | Passed | pass |
| Phase 16 production build | `pnpm build` | Generated data is current and bundle budgets hold | Passed; entry 885.22 kB raw / 305.27 kB gzip | pass |
| Phase 17 live snapshot migration | local MCP `--write-snapshot` | Metadata-only migration on the pinned dataset; no upstream write | schema/server metadata added; dataset and all 177 record states/hashes unchanged | pass |
| Phase 17 live read/check | default pull + `--check` | Calls only downstream MCP reads and reports a current snapshot | 176 active / 1 withdrawn / 0 unknown; zero drift; both exit 0 | pass |
| Phase 17 focused contracts | sync + provenance + existing-DB reconciliation Vitest files | Pull safety, diff states, snapshot contract, preservation and rollback pass | 19/19 tests passed | pass |
| Phase 17 repository tests | pinned pnpm 10.33.0 recursive test | All workspaces pass | 987 tests passed | pass |
| Phase 17 type/contract gates | release docs + atlas check + web import check + all workspace `tsc --noEmit` | Every underlying `pnpm typecheck` gate passes | Passed | pass |
| Phase 17 production build | pinned pnpm 10.33.0 recursive build | Build and entry budget pass | Passed; entry 885.22 kB raw / 305.27 kB gzip | pass |
| Phase 17 diff hygiene | `git diff --check` plus new-file trailing-whitespace scan | No whitespace errors | Passed | pass |
| Phase 18 focused feedback contracts | data contract + store + client + bridge + CLI Vitest files | Envelope, authority, ACK binding, crash recovery, decision reversal, and zero-write defaults pass | 39/39 tests passed | pass |
| Phase 18 live read-only feedback pull | local xFrontier stdio MCP + disposable SQLite DB | Fail-closed read protocol; no writer; no automatic application | `xf-6eb361265784`; 10 findings / 0 stale; 0 proposals/conflicts/decisions; `appliedAutomatically=false` | pass |
| Phase 18 repository tests | pinned pnpm 10.33.0 recursive test | All workspaces pass | 1,026 tests in 126 files passed | pass |
| Phase 18 type/contract gates | release docs + atlas check + web import check + all workspace TypeScript | Every recursive typecheck gate passes | Passed | pass |
| Phase 18 production build | pinned pnpm 10.33.0 recursive build | Build and existing eager/lazy budgets pass | Passed; entry 885.22 kB / 305.27 kB gzip; ModelWorkbench 36.91 / 13.40; interior 1,210.00 / 482.99 | pass |
| Phase 18 final review/diff hygiene | independent P0/P1 review + `git diff --check` | No blocking safety/correctness findings or whitespace errors | No remaining P0/P1; diff check passed | pass |
| Phase 19 upstream protocol gates | xFrontier `npm run check`, `npm test`, `npm run test:mcp`, ledger validator | Types, 0.6 transport, legacy compatibility, atomic/idempotent store, real ledger integrity | 1,001 Vitest + 59 Node tests; MCP 19 tools; ledger validation passed | pass |
| Phase 19 isolated real-transport proof | disposable SQLite + `XF_LEDGER_DIR`, reconcile/retry/replay/pull | Exact absence proof authorizes one retry; identical replay returns one immutable record | proposal `3f2e78b0`; request `sha256:cf5114…`; one 578-byte JSON; repeated pull matched 1/1 | pass |
| Phase 19 real-ledger read-only proof | xFrontier 0.6 stdio pull into disposable DB | Current findings import; no writer or automatic application | 10 findings / 0 stale; 0 proposals; `appliedAutomatically=false`; real ledger unchanged | pass |
| Phase 19 downstream repository tests | all package-local Vitest binaries | All workspaces pass after final P1 fixes | 1,040 tests in 126 files passed | pass |
| Phase 19 type/build/diff gates | release/atlas/import checks, eight TypeScript checks, Vite build/precompress, both diff checks | Contracts and artifacts pass without release claims | all passed; 1,004 modules; 26 Brotli files; both diff checks clean | pass |
| Phase 19 final reviews | independent upstream/downstream/cross-repo P0/P1 reviews | No blocking protocol or state-machine issue remains | no remaining P0/P1; one inspect-prominence P2 retained | pass |
| Phase 20 pre-stage diff hygiene | `git diff --check` in both repositories | No whitespace errors before any staging | Both passed after the xFrontier README inventory correction | pass |
| Phase 20 snapshot metadata refresh | explicit guarded write, then read-only `--check` against local xFrontier 0.6.0 | Update only reviewed server provenance; retain dataset/reference truth | 177 references unchanged; `serverVersion` 0.5.0→0.6.0; follow-up check exit 0 with zero drift | pass |
| Phase 20 downstream unit/type/build/browser gates | package-local full Vitest/TypeScript, release/atlas/import checks, Vite/precompress, isolated-port Playwright | Verify the exact downstream code candidate without borrowing another worktree's services | 126 files / 1,040 tests; 8/8 TypeScript; 1,004-module build; 26 Brotli files; Playwright 8/8 on 5174/8788 | pass |
| Phase 16 browser proof | agent-browser on isolated `:8790` production stack | Marker, reason/version, bilingual copy, no overflow/errors | Passed at 1280×633 and 1024×768; L1 is not the 390px mobile surface | pass |

## Error Log
| Timestamp | Error | Attempt | Resolution |
|-----------|-------|---------|------------|
| 2026-08-08 | Chromium Mach-port permission denied | 1 | Re-ran outside the sandbox |
| 2026-08-08 | Local Vite service exited during two-worker Playwright run | 2 | Isolated with a single-worker diagnostic; keep open until fully captured |
| 2026-08-08 | Initial mission-core typecheck rejected one generic event cast and an unreachable typed E4 comparison | 1 | Narrowed the runtime validation cast and simplified event insertion while retaining discriminated public event types |
| 2026-08-08 | Scout tests could not resolve the newly declared `@frontier-isles/core/mission` workspace subpath | 1 | Package manifest was updated but the workspace symlink/lock state had not yet been refreshed; run an offline workspace install before retrying |
| 2026-08-08 | Offline workspace install lacked cached pnpm metadata; sandboxed normal install could not update the user-level pnpm project link | 2 | Re-ran `pnpm install` with scoped approval; it reused all 292 packages, downloaded none, and refreshed workspace state |
| 2026-08-08 | A2 model mission used `Array.findLast`, unavailable under the repository ES2022 lib | 1 | Replace with an ES2022-compatible reverse event scan |
| 2026-08-08 | The first candidate sweep reached target after two runs, so the proof had only three meaningful steps | 1 | Inspect deterministic outcomes and choose an objective whose first two candidates miss before the third reaches target |
| 2026-08-08 | Ad-hoc `vite-node` probe was unavailable | 1 | Use the existing Vitest fixture for deterministic calibration instead of changing dependencies |
| 2026-08-08 | Hardened objective parser failed typecheck on unknown numeric fields/callback narrowing | 1 | Add reusable type guards and a locally bound candidate array; runtime tests themselves already passed |
| 2026-08-08 | Fresh Phase 13 sandbox Chromium launches failed at `bootstrap_check_in ... MachPortRendezvousServer: Permission denied (1100)` | 1 | Services were healthy and owned; rerun outside sandbox to test the harness rather than the browser sandbox boundary |
| 2026-08-08 | First Mission Control click caused Vite to optimize newly discovered `zod` and reload the page | 1 | Exclude the ESM dependency from dev optimization; the config-fresh browser rerun no longer reloaded |
| 2026-08-08 | Vite could not resolve `zod` from web-level `optimizeDeps.include` | 2 | Replaced include with exclude; zod stays owned by core and the clean browser rerun passed |
| 2026-08-08 | Visual-inspection browser could not open 127.0.0.1:5173 while `pnpm dev` advertised localhost only | 1 | Keep the owned dev session and retry its advertised localhost origin rather than restarting or killing services |
| 2026-08-08 | One planning-file patch had a malformed multi-file hunk separator | 1 | Reissued the same bounded update with valid patch context; no product file was affected |
| 2026-08-08 | Full browser suite A2 scenario waited 60s for `.fi-day-night-lever` on L0 | 1 | Corrected the L0 style harness; the focused night A2 rerun passed without a timeout change |
| 2026-08-08 | Mobile Model Lab axe reported 2.83–3.53:1 accent text contrast | 1 | Applied semantic AA text tokens across the workbench; the full mobile axe rerun passed |
| 2026-08-13 | A broad Phase 16–19 CodeGraph exploration exceeded the useful output window and was truncated | 1 | Split the ownership audit into narrow module/symbol queries before reading individual diffs |
| 2026-08-13 | Initial Phase 20 findings patch used the wrong Markdown heading depth/text and did not apply | 1 | Located the exact heading and reissued a bounded patch; no product file was affected |
| 2026-08-13 | One compact two-repository Git inspection used shell separators despite the workspace preference for separate commands | 1 | The read-only result was valid; use parallel independent command calls for the remaining audit and staging checks |
| 2026-08-13 | Sandboxed xFrontier `npm run check` could not create Vite's config temp module under the adjacent repository and produced 50 derivative Svelte preprocessing errors | 1 | Ledger validation still passed; rerun the same check with scoped filesystem approval instead of treating sandbox EPERM as a product failure |
| 2026-08-13 | The first exact xFrontier staged diff check exposed two Markdown hard-break spaces in the new protocol plan | 1 | Removed the trailing spaces, re-stage only that reviewed plan, and repeat the cached diff check before committing |
| 2026-08-13 | The user-level `pnpm --version` shim again hung while trying to resolve the pinned package manager | 1 | Terminated the no-output process and use the already-cached exact pnpm executable or package-local gates; do not install dependencies |
| 2026-08-13 | Plain Playwright could not own ports 5173/8787 because a separate Claude worktree has healthy listeners there | 1 | Preserve those unrelated processes; run the same suite with temporary untracked configs on 5174/8788 and an in-memory database, then delete only the temporary configs |
| 2026-08-13 | A shell glob in a read-only Vite-proxy search had no root-level match under zsh `nomatch` | 1 | Re-ran the search against the exact `apps/web/vite.config.ts` path; no file or process was changed |

## 5-Question Reboot Check
| Question | Answer |
|----------|--------|
| Where am I? | Phase 20 complete locally; xFrontier `e9a9ceb` and Frontier Isles `93771f7` contain the reviewed protocol/integration code, with this planning checkpoint pending its own local commit |
| Where am I going? | Stop at the local publication boundary until push/CI/deployment or real feedback submission receives explicit authorization |
| What's the goal? | Keep both projects connected through versioned evidence, receipts, and review while preserving their independent truth and application authorities |
| What have I learned? | See `findings.md` |
| What have I done? | Committed the upstream durable 0.6 feedback protocol and downstream provenance/sync/outbox bridge locally, preserving real ledgers/default DB and independently gating browser/build/type/test surfaces |

---
*Update after each completed planning phase or new error.*

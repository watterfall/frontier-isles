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

## 5-Question Reboot Check
| Question | Answer |
|----------|--------|
| Where am I? | Phase 15 complete locally; notebook-v5 persists completed A2 investigations as evidence on both desktop and compact surfaces |
| Where am I going? | Next: architectural/comprehension review, then live providers |
| What's the goal? | Build a bounded AI-native execution path without collapsing autonomous model work into research truth |
| What have I learned? | See `findings.md` |
| What have I done? | Implemented and verified mission policy/runtime, durable Scout records, shared ModelSpec/runtime, a visible replayable provider-free A2 investigation, and durable non-promoting mission evidence |

---
*Update after each completed planning phase or new error.*

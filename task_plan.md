# Task Plan: Frontier Isles 2026-08 System Plan

## Goal
Implement and expose the first reversible AI-native proof slice: versioned mission/policy/trace contracts, a deterministic bounded mission runner, durable Scout recovery, and a visible provider-free A2 Model Lab mission, without changing research-promotion or deployment behavior.

## Current Phase
Phase 14 complete locally — next reversible slice is notebook-v5 mission evidence persistence

## Phases

### Phase 1: Recover Current Truth
- [x] Recover relevant project history without treating it as current proof
- [x] Recheck worktree, local gates, GitHub CI, release manifest, and live health
- [x] Record evidence boundaries and unresolved E2E behavior
- **Status:** complete

### Phase 2: System Synthesis
- [x] Map the current product loop and technical layers
- [x] Identify the smallest set of systemic bottlenecks
- [x] Separate product debt, platform debt, and release debt
- **Status:** complete

### Phase 3: Portfolio and Sequencing
- [x] Define the recommended next product vertical slice
- [x] Define enabling technical work and work that should be deferred
- [x] Specify phase-level entry, exit, and stopping conditions
- **Status:** complete

### Phase 4: Verification Architecture
- [x] Define local, browser, CI, deployment, and human-validation gates
- [x] Define measurable performance and accessibility budgets
- [x] Define release evidence updates required after code changes
- **Status:** complete

### Phase 5: Delivery
- [x] Review plan against PROJECT-CORE and current ROADMAP
- [x] Deliver a concise system summary and actionable 30/60/90-day roadmap
- [x] Leave the planning files ready for implementation continuation
- **Status:** complete

### Phase 6: AI-Native Boundary Re-arbitration
- [x] Compare suggestion-only, bounded-autonomy, and unrestricted-autonomy designs
- [x] Verify the decision against current agent capabilities and night-shift execution paths
- [x] Replace the assistant-first plan with an AI-native mission/execution architecture
- [x] Preserve a separate epistemic-promotion boundary and verification gates
- **Status:** complete

### Phase 7: Mission Contract and Policy Core
- [x] Locate the narrowest package boundary and existing export/test conventions
- [x] Implement `MissionContractV1`, effects, scoped capabilities, budgets, stop reasons, and `AgentRunBundle`
- [x] Implement validation/normalization and non-escalation rules
- [x] Add contract and policy tests
- **Status:** complete

### Phase 8: Deterministic Mission Runner and Scout Compatibility
- [x] Implement an append-only in-memory runner with budget, stop, retry/idempotency, and trace events
- [x] Resume paused bundles without resetting trace, usage, completed work, or grant counts
- [x] Add a scout mission adapter without changing `runNightShift` behavior
- [x] Prove success, dry-run, budget exhaustion, and policy denial paths
- **Status:** complete

### Phase 9: Verification and Handoff
- [x] Run targeted tests, recursive tests/typecheck/build, and diff checks
- [x] Re-measure bundle boundaries if web entry code changes
- [x] Update planning/evidence files with exact outcomes and remaining A2/UI boundaries
- **Status:** complete

### Phase 10: Post-commit Review and Authorization Hardening
- [x] Correct the empty-review baseline from `HEAD..HEAD` to `4c18865..c62564c`
- [x] Reconstruct the mission runner, policy, scout adapter, and CLI call paths with CodeGraph
- [x] Fix resource-prefix boundary leakage and re-poll pause/revoke immediately before effects
- [x] Convert malformed planner usage estimates into a failed trace instead of an uncaught runner rejection
- [x] Add focused regression tests and rerun proportional core gates
- **Status:** complete

### Phase 11: Durable Run Persistence Foundation
- [x] Define a versioned `running` / `settled` envelope, canonical digest, and runtime parser for `AgentRunBundle`
- [x] Add atomic filesystem checkpoint/load behavior without placing Node IO in the browser-safe core package
- [x] Prove tamper detection, orphan-temp tolerance, exclusive locking, paused-run recovery, and terminal reuse
- [x] Wire persistence into the explicit opt-in Scout CLI state-file path after focused storage tests pass
- [x] Run final recursive tests/typecheck/build and record exact bundle/test evidence
- **Status:** complete

### Phase 12: A2 Autonomous Model Lab Proof
- [x] Trace the current deterministic model kernels, workbench state, receipt, and lazy-loading boundaries
- [x] Define the smallest typed experiment objective and deterministic plan/evaluate/revise policy
- [x] Implement at least five meaningful autonomous steps under 12 model runs / 30 seconds
- [x] Record failed prediction, revision, replayable bundle, and explicit non-ledger result
- [x] Verify focused tests, full gates, and unchanged eager bundle boundaries
- **Status:** complete

### Phase 13: Playwright Service Lifecycle Stabilization
- [x] Trace Playwright, Vite, API, CI, and port-ownership paths before changing the harness
- [x] Reproduce and classify sandbox launch failure separately from local service loss
- [x] Make test-service ownership, readiness, logging, and teardown deterministic
- [x] Capture complete single-worker and parallel browser results without connection-refusal ambiguity
- [x] Run proportional non-browser gates and record remaining environment or product boundaries
- **Status:** complete

### Phase 14: Visible A2 Model Mission Control
- [x] Trace the lazy ModelWorkbench, A2 mission API, receipt, translations, and CSS/test boundaries
- [x] Define a compact run/inspect/reset interaction that keeps the mission explicitly local and non-ledger
- [x] Implement the mission launch and trace summary without adding provider or eager-bundle dependencies
- [x] Verify keyboard, responsive, day/night, reduced-motion, unit, and browser behavior
- [x] Re-run repository gates and record bundle deltas and remaining notebook-v5/provider boundaries
- **Status:** complete

### Phase 15: Notebook-v5 Mission Evidence Persistence
- [ ] Reconcile the current exploration notebook schema with the A2 receipt and replay bundle without weakening legacy reads
- [ ] Define versioned migration, size, provenance, and invalid-record behavior before storage writes
- [ ] Persist and reload a completed local mission as evidence, never as promoted ledger truth
- [ ] Add export/import and corruption-recovery coverage across desktop and mobile surfaces
- [ ] Re-run repository, browser, and bundle gates before considering provider-backed planning
- **Status:** pending

## Key Questions
1. What is the next vertical slice that most directly strengthens the promise that a learner can inspect, test, and explain a connection or model?
2. Which current reliability and bundle constraints must be addressed before expanding the product surface?
3. Which roadmap items deepen the core loop, and which would add another metaphor without improving research truth?
4. What evidence is required before local work, CI, and production can each be called complete?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Treat current code, tests, CI, and production as separate proof surfaces | The release manifest and prior incidents show that collapsing them produces false completion claims |
| Stabilize the browser gate before broad feature work | The current two-worker E2E run can lose the local web service, making future regressions hard to classify |
| Prefer a learner-authored model vertical slice over a new world metaphor | It directly deepens the product thesis already stated in PROJECT-CORE |
| Preserve L0/L1 lazy-data boundaries | The entry bundle is close to its hard budget and the interior archive is intentionally off the critical path |
| Reopen the prior "AI cannot run" boundary | Current code already supports autonomous night-shift execution; the old wording confuses execution authority with epistemic authority |
| Adopt bounded autonomous investigation | It allows real multi-step AI work while missions, budgets, effects, traces, and truth promotion stay system-governed |
| Keep E4 governance human/pair-only | A mission may execute and make granted shared writes, but cannot grant itself authority or ratify its own research relationships |
| Treat `4c18865..c62564c` as the real review range | Comparing the merge base to the identical `HEAD` produced an empty diff and did not review the new runtime |
| Harden authorization before persistence | Persisting a runtime would amplify scope or revocation mistakes across process restarts |
| Make Playwright own fresh non-watch services by default | Borrowed listeners and watch supervisors obscure which process failed; explicit opt-in reuse preserves interactive diagnostics without weakening the normal gate |
| Keep Mission Control inside the lazy ModelWorkbench and dynamically import the A2 runner | The control becomes visible without pulling mission validation or `zod` into the eager application entry |
| Present Mission Control as a progressively disclosed field instrument | Authority, budgets, and non-ledger status remain legible without turning the research atlas into a generic AI dashboard |
| Persist deterministic mission evidence before adding live providers | Notebook-v5 creates a reviewable provenance boundary before planner variability or external credentials enter the product |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| Sandbox blocked Chromium Mach-port registration before tests launched | 1 | Re-ran the browser suite outside the sandbox |
| Two-worker local E2E lost the Vite service and produced connection refusals | 2 | Replaced watch/implicit-reuse service ownership, piped logs, then captured three consecutive 7/7 runs including two two-worker runs with clean teardown |
| First A2 mission check used ES2023 `findLast` under an ES2022 target | 1 | Replace it with an explicit reverse scan before rerunning typecheck |
| Initial coupling candidates reached the 0.82 target on trial 2, below the required five-step proof | 1 | Measure the deterministic candidate outcomes and lower the intermediate candidate so two revisions are guaranteed by the declared objective |
| `vite-node` was not installed for an ad-hoc candidate probe | 1 | Avoid adding a dependency; calibrate through the existing Vitest mission fixture with a clearly subcritical intermediate coupling |
| Runtime-object hardening lost TypeScript narrowing for unknown integer fields and a callback-captured array | 1 | Add an explicit safe-integer guard and bind the candidate array before validation |
| First real Mission Control browser run stayed `running` because Vite discovered `zod`, re-optimized dependencies, and reloaded the page | 1 | Traced the late dependency through core mission validation and explicitly excluded the ESM leaf from dev optimization |
| `optimizeDeps.include: ['zod']` made the scenario pass from cache but Vite could not resolve zod from the strict web workspace | 2 | Rejected the duplicate-dependency path; `optimizeDeps.exclude` removed both the first-click reload and the resolution warning |
| First full 8-scenario run waited for a day/night lever that is absent on the L0 atlas route | 1 | Corrected the style harness to set the L0 shell theme after the model opens, without pretending the L1 lever exists on L0 |
| Mobile Model Lab axe expansion exposed existing 2.83–3.53:1 semantic accent text | 1 | Replaced decorative mineral colors with existing AA text tokens across the whole workbench and retained the broader axe scope |

## Notes
- This is the active August 2026 planning set. Historical planning files remain under `docs/history/` and are evidence, not current state.
- The user authorized continuation into the first proof slice. Commit, push, and deployment remain unauthorized.
- Re-read this plan before selecting the implementation slice.
- Keep mission runtime exports on explicit `@frontier-isles/core/mission*` subpaths; do not add them to the eager root barrel used by the web app.
- The runtime, durable opt-in Scout recovery, provider-free A2 Model Lab proof, and its visible Mission Control are complete locally.
- The local Playwright lifecycle gate is complete; exact-SHA CI awaits an authorized commit/push cycle.
- Next reversible order: notebook-v5 mission evidence persistence, then an architectural/comprehension review. Provider-backed planning remains after those deterministic surfaces.

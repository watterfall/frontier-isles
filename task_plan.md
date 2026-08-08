# Task Plan: Frontier Isles 2026-08 System Plan

## Goal
Implement the first reversible AI-native proof slice: versioned mission/policy/trace contracts, a deterministic bounded mission runner, and compatibility wiring for the existing night scout, without changing research-promotion or deployment behavior.

## Current Phase
Complete — first AI-native runtime proof slice

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

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| Sandbox blocked Chromium Mach-port registration before tests launched | 1 | Re-ran the browser suite outside the sandbox |
| Two-worker local E2E lost the Vite service and produced connection refusals | 2 | Ran a single-worker diagnostic; retain as an open harness-stability issue until a complete captured rerun is recorded |

## Notes
- This is the active August 2026 planning set. Historical planning files remain under `docs/history/` and are evidence, not current state.
- The user authorized continuation into the first proof slice. Commit, push, and deployment remain unauthorized.
- Re-read this plan before selecting the implementation slice.
- Keep mission runtime exports on explicit `@frontier-isles/core/mission*` subpaths; do not add them to the eager root barrel used by the web app.
- The first runtime proof slice is complete locally. The next product slice is the A2 Model Lab mission; durable persistence and Mission Control remain prerequisites for background production autonomy.

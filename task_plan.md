# Task Plan: Frontier Isles 2026-08 System Plan

## Goal
Share xFrontier provenance and feedback without creating two competing truth stores: keep downstream catalog projections versioned and reviewable, and make upstream feedback evidence-anchored, durable, explicitly delivered, and independently reviewed/applied.

## Current Phase
Phase 20 complete locally — upstream protocol and downstream integration are committed; push/CI/deployment/real feedback remain explicitly gated

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
- [x] Reconcile the current exploration notebook schema with the A2 receipt and replay bundle without weakening legacy reads
- [x] Define versioned migration, size, provenance, and invalid-record behavior before storage writes
- [x] Persist and reload a completed local mission as evidence, never as promoted ledger truth
- [x] Add export/import and corruption-recovery coverage across desktop and mobile surfaces
- [x] Re-run repository, browser, and bundle gates before considering provider-backed planning
- **Status:** complete

### Phase 16: xFrontier Provenance Lifecycle Audit
- [x] Load the repository-owned xfrontier identifiers from `FRONTIERS` and `SEED_STRUCTURES`, then resolve them through the local MCP
- [x] Snapshot dataset version, active content hashes, withdrawals, and unknown-id count without treating cluster-derived structures as record-level links
- [x] Preserve island #60 as an independent problem while making withdrawn source `XF-001449` visible in the data contract, server projection, and L1 evidence surface
- [x] Add module-completeness and withdrawal regression tests, regenerate L0 data, and verify repository/browser/bundle gates
- **Status:** complete

### Phase 17: xFrontier Downstream Sync Foundation
- [x] Define a deterministic pull/diff contract over the live MCP dataset version, module-loaded reference set, and stored content hashes
- [x] Materialize a reviewable change report without calling xFrontier write tools or mutating authored catalog data during checks
- [x] Reconcile only the catalog-owned `ProblemMeta.atlas` projection into existing runtime rows while preserving `problem.md`, ledger events, and local place metadata
- [x] Prove no-change, changed-hash, withdrawal, unknown-id, and existing-database reconciliation paths with focused tests and repository gates
- **Status:** complete

### Phase 18: xFrontier Bidirectional Feedback Foundation
- [x] Define a versioned, idempotent feedback envelope that maps Frontier Isles evidence to xFrontier finding/annotation/structure-link intents without granting automatic delivery
- [x] Persist a transactional outbox and append-only delivery attempts/receipts in the Frontier Isles database
- [x] Add an explicit bridge command whose default is inspect/dry-run and whose delivery mode requires a separate flag
- [x] Pull xFrontier proposal/finding decisions into a local review inbox without treating accepted as applied or released
- [x] Prove crash/retry/idempotency, malformed/unknown decisions, authority preservation, and zero-upstream-write defaults with focused and repository gates
- **Status:** complete

### Phase 19: xFrontier Conditional Feedback Protocol
- [x] Recover the clean xFrontier checkout, repository instructions, write/ledger call paths, and compatibility gates without mutating either real ledger
- [x] Define a backwards-compatible protocol upgrade for caller event ids, expected dataset/record hash conditions, durable idempotent receipts, and exact receipt lookup
- [x] Implement and test the upstream MCP/ledger changes, then update Frontier Isles to negotiate and consume the stronger contract without weakening its fail-closed boundary
- [x] Prove idempotent replay, precondition refusal, crash-safe persistence, legacy-call behavior, and zero-write default/read paths in both repositories
- [x] Rebuild the local MCP bundle, run isolated cross-repository write/replay plus real-ledger read-only integration, independent P0/P1 review, and record separate worktree/commit/deploy boundaries
- **Status:** complete

### Phase 20: Commit Readiness and MCP Consumer Onboarding
- [x] Recover the Phase 19 handoff, both dirty worktrees, and the user-scope xFrontier MCP registration without treating session-visible tools as repository proof
- [x] Partition both repository diffs into Phase 16–19 owned changes, generated/ignored artifacts, and any unrelated or ambiguous user changes
- [x] Verify exact local commit candidates with CodeGraph, staged-diff hygiene, repository gates, and real-ledger/default-database preservation
- [x] Create local commits only for unambiguous reviewed scopes; do not infer push, CI, deployment, or real feedback-submission authorization
- [x] Record resulting commit SHAs or blockers and leave the next external action explicitly gated
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
| Treat `4c18865..c62564c` as the real review range | Comparing the merge base to the identical `HEAD` produced an empty diff and did not review the new runtime |
| Harden authorization before persistence | Persisting a runtime would amplify scope or revocation mistakes across process restarts |
| Make Playwright own fresh non-watch services by default | Borrowed listeners and watch supervisors obscure which process failed; explicit opt-in reuse preserves interactive diagnostics without weakening the normal gate |
| Keep Mission Control inside the lazy ModelWorkbench and dynamically import the A2 runner | The control becomes visible without pulling mission validation or `zod` into the eager application entry |
| Present Mission Control as a progressively disclosed field instrument | Authority, budgets, and non-ledger status remain legible without turning the research atlas into a generic AI dashboard |
| Persist deterministic mission evidence before adding live providers | Notebook-v5 creates a reviewable provenance boundary before planner variability or external credentials enter the product |
| Store a hand-parsed notebook projection instead of the runtime receipt | The notebook loads eagerly and the entry chunk denylists `zod`; borrowing only the receipt's types keeps the build guard satisfied by construction |
| Re-assert `model_observation` / `ledger_effect=none` on every read | Storage is the one place a record could acquire authority it was never granted, so the parser refuses the record rather than trusting the stored claim |
| Persist evidence, never resume authority | The projection deliberately drops the contract, event log, and step inputs a runner would need to continue, so a stored record cannot restart a mission |
| Reject an inconsistent record instead of repairing it | A partially readable trial list would understate what the investigator did, which is worse than showing nothing |
| Rewrite the "current page session only" copy in the same change | Persisting the record makes the previous claim false, and a stale reassurance is a correctness bug, not a wording preference |
| Preserve a local problem when its source graduates, but expose the source lifecycle | xfrontier retired XF-001449 because the programme became applied; silently deleting the island or replacing its id would erase provenance rather than correct it |
| Make downstream sync an explicit reviewable command, never a build or boot dependency | MCP availability must not make builds nondeterministic, and upstream semantic changes must not silently rewrite authored local data |
| Reconcile only the catalog-owned atlas projection in existing runtime rows | `meta.atlas` combines upstream provenance with local catalog depth/literature/interior; replacing that one projection fixes stale persistent data without rewriting problem objects, other place metadata, or ledger truth |
| Coordinate explicit snapshot writers with a lock, baseline CAS, atomic rename, and directory fsync | A reviewed pull must not overwrite a snapshot changed by another process or report durability before the rename is persisted |
| Require a matching stored `atlasN` before reconciling an existing slug | A slug alone is not catalog ownership; missing identity is ambiguous and must not let catalog provenance attach to a user-authored island |
| Keep upstream feedback outside Phase 17 | xFrontier findings/proposals are durable external writes; a real two-way loop still needs an outbox, idempotency key, receipt, and applied/released decision lifecycle before it can be automated |
| Share a protocol, not a database | xFrontier remains authoritative for its corpus/review ledger and Frontier Isles for local research/place state; dataset cursors, evidence hashes, envelopes, receipts, and decisions form the common lower layer |
| Fail closed on the reviewed xFrontier `0.5.0` feedback protocol | Read tools must explicitly be read-only, non-destructive, and idempotent; write acknowledgements must echo the exact submitted intent before a remote id is trusted |
| Treat every begun non-idempotent call without a durable success receipt as uncertain | xFrontier has no caller idempotency key or atomic expected-version precondition, so timeout, crash, malformed ACK, or local receipt failure can never authorize an automatic retry |
| Preserve application as local history and surface decision reversal as reconciliation drift | Remote `accepted` is reversible and never means applied; if rejection arrives after local application/release, `needsReconciliation` becomes visible without rewriting history |

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
| First Phase 17 planning-file patch used an overly broad multi-file context | 1 | Re-read the exact section boundaries and reapplied smaller targeted hunks; no product file was affected |
| Phase 19 independent review found one-way remote receipt uniqueness, permissive negative receipt parsing, and structure-id normalization drift | 1 | Closed each P1 with symmetric two-table ownership checks, exact lookup union parsing, attempt-bound retry proof, and a frozen trim+uppercase cross-repo hash fixture; final re-review found no downstream P0/P1 |
| The globally installed pnpm wrapper tried to fetch the pinned `pnpm@10.33.0` in the network-restricted sandbox | 1 | Used the already-cached exact 10.33.0 executable for recursive tests/build and ran the release, atlas, import, and TypeScript type gates directly; no dependency or environment mutation was needed |
| Direct TypeScript CLI probes hit Node strip-only syntax and the `tsx` binary's sandbox IPC pipe | 2 | Used the package's `node --import tsx` entry, which needs no daemon/IPC and became the checked-in feedback script |
| Independent Phase 18 review found weak ACK binding, permissive read annotations, unreachable lease recovery, and hidden uncertainty/reversal states | 1 | Closed every P1 with fail-closed protocol guards, envelope/receipt rebinding, explicit `recover-expired`, pending-only cancel, operational inspection, and `needsReconciliation`; final re-review found no P0/P1 |

## Notes
- This is the active August 2026 planning set. Historical planning files remain under `docs/history/` and are evidence, not current state.
- The user authorized continuation into the first proof slice. Commit, push, and deployment remain unauthorized.
- Re-read this plan before selecting the implementation slice.
- Keep mission runtime exports on explicit `@frontier-isles/core/mission*` subpaths; do not add them to the eager root barrel used by the web app.
- The runtime, durable opt-in Scout recovery, provider-free A2 Model Lab proof, and its visible Mission Control are complete locally.
- The local Playwright lifecycle gate is complete; exact-SHA CI awaits an authorized commit/push cycle.
- Next reversible order: architectural/comprehension review, then provider-backed planning. The xfrontier provenance audit is complete and does not authorize ledger proposals, push, or deployment.
- Phase 17's downstream-only boundary was superseded by the user's later Phase 19/20 continuation, which authorizes bounded local changes, gates, and local commits in both repositories. Push, CI trigger, production deployment/cache purge, real-ledger submissions, human decisions, and user-scope MCP configuration remain unauthorized.
- Phase 18 is complete locally: the shared protocol, durable outbox/receipts, read-only pull, review inboxes, crash recovery, and local application lifecycle are implemented and independently reviewed.
- Phase 18 itself invoked no writer. Phase 19 invoked the real 0.6 stdio writer only against an explicit disposable `XF_LEDGER_DIR`, proving replay leaves one record; the committed real ledger remained byte-identical. A real delivery requires an exact outbox id plus `--confirm-upstream-write`.
- Phase 19 code is now captured by local xFrontier commit `e9a9ceb` and Frontier Isles commit `93771f7`. No real feedback submission, human decision, push, remote CI run, deployment, cache purge, or production change has been performed or claimed.

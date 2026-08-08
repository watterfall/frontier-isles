# Findings & Decisions: Frontier Isles 2026-08 System Plan

## Requirements
- Continue the current project assessment with a deeper system-level summary.
- Produce a prioritized plan rather than an unranked feature list.
- Keep code, local verification, CI, deployment, and human/product validation distinct.
- Preserve the project's research-truth and mobile/read-only boundaries.
- Reframe the next system as genuinely AI Native and reassess whether AI should be allowed to run work autonomously.

## Research Findings
- Phase 14 design context is explicit in `.impeccable.md`: the target is open-science researchers and governed AI residents; the visual language is a scholarly, warm, hand-drawn research atlas; AI must remain visible but restrained and traceable rather than becoming a dominant dashboard persona.
- The frontend-design constraints for this slice are progressive disclosure, specific action copy, full keyboard/focus states, 44px touch targets, responsive adaptation, no nested generic card grid, and no neon/glass AI styling. The React implementation should run mission work directly from the user event, derive summaries during render, and preserve the existing lazy ModelWorkbench boundary.
- CodeGraph confirms `ModelWorkbench` already owns the manual model lifecycle, focus trap, receipt boundary, and local-only language. The A2 receipt separately exposes mission status, stop reason, trials, revision count, failed predictions, usage, `epistemicStatus: model_observation`, and `ledgerEffect: none`, which is enough for a compact inspectable control surface without inventing new authority.
- The integration can stay inside the existing ModelWorkbench lazy chunk: import the mission runner directly there, launch it only from an explicit user event, keep the returned bundle/receipt in component state, and derive its display rows during render. No eager root export, provider call, or ledger write is needed.
- Both desktop and mobile already lazy-import `ModelWorkbench`, and the current component has one shared CSS system with embedded mobile adaptations, focus-visible rules, and reduced-motion overrides. The mission UI should extend these selectors rather than introduce a second layout or visual vocabulary.
- The best bundle boundary is a nested dynamic import from the mission button: opening ModelWorkbench still loads only the manual instrument; `modelMission` plus the generic runner load only when the learner authorizes the A2 sweep.
- The desktop App already mounts ModelWorkbench through React `lazy()` only while `modelLaunch` is active, and the atlas exposes a stable `.fi-model-launch[data-model-launch="global"]` button. A browser proof can therefore exercise the real route rather than a test-only page.
- The first visible Mission Control implementation is deliberately narrower than the eventual background controller: it supports explicit run, inspect, retry, and clear for the deterministic synchronization sweep. Shared-field autonomy, live pause/revoke, persistence, providers, and promotion remain visibly unavailable rather than simulated.
- The control declares A2/E1, four model runs, 30 seconds, zero network/writes/grants before authorization; after execution it projects the actual receipt, trial observations, plan-revision count, deterministic replay result, stop reason, and selected event sequence.
- Focused Mission Control/Workbench/mission tests pass (10/10), web typecheck and data-import boundaries pass, and diff hygiene remains clean after the first implementation.
- The first real browser launch exposed a dev-runtime boundary that SSR/unit tests cannot see: the on-demand mission import caused Vite to discover and optimize `zod`, reload the entire page, and erase the component while its state still read `running`. The mission itself did not report a computation or policy failure.
- The clean fix is `optimizeDeps.exclude: ['zod']`: zod remains owned by core and production-lazy, while Vite serves its ESM path on demand without a discovery reload. A fresh config-triggered optimizer run then passed the real Mission Control scenario in 8.2 seconds with no dependency warning.
- The first full 8-scenario run passed six scenarios but classified two new checks correctly: the A2 test waited on an L1-only day/night lever while still on L0, and the expanded mobile axe scope exposed pre-existing plus new small accent text at only 2.83–3.53:1 contrast. Neither is a mission-runtime failure or service loss.
- The Model Lab already had AA-safe semantic `--fi-ochre-text` and `--fi-malachite-text` tokens but its older component CSS used decorative mineral colors for small text. Applying the semantic tokens across both manual and mission selectors fixes the broader surface rather than exempting the new panel.
- The repaired night-style A2 scenario and full mobile Model Lab audit now both pass (2/2): real mission execution/replay/trace plus night axe on desktop, and 390px overflow/44px controls/full-page axe on mobile.
- The final complete browser suite now has 8 scenarios and passes 8/8 with two workers in 48.3 seconds. It includes the new real A2 mission path, night-theme mission axe, mobile embedded Mission Control, 44px targets, full mobile axe, and all seven previous world/responsive scenarios; both service ports were reclaimed afterward.
- Final Phase 14 repository gates pass: 950 tests, recursive typecheck plus release/atlas/import checks, production build, and diff hygiene.
- The production split preserves the eager boundary: entry 878.05 kB raw / 302.75 kB gzip, CSS 233.23 kB / 35.99 kB gzip, lazy ModelWorkbench 35.60 kB / 13.01 kB gzip, nested modelMission 72.66 kB / 18.22 kB gzip, and unchanged lazy interior 1,210.00 kB / 482.99 kB gzip.
- The visible result remains session-local and explicitly non-ledger. Notebook-v5 persistence/export/import, long-running pause/revoke, live providers, promotion, exact-SHA CI, push, and deployment are still open boundaries.
- Phase 13 CodeGraph trace confirms the API process owns port 8787 and handles `SIGINT`/`SIGTERM`, while development web delivery is intentionally a separate Vite process on 5173; Playwright therefore has two independently failing service boundaries to classify.
- CodeGraph does not index the declarative Playwright/package/workflow files as useful symbols, so their exact configuration must be inspected directly after this required graph-first pass.
- The current Playwright config launches two `pnpm --filter ...` wrapper commands as independent `webServer` entries and reuses any existing listener outside CI. It has no explicit worker count or service-exit diagnostics, so a borrowed port, wrapper death, and product failure are currently collapsed into similar connection symptoms.
- CI runs the full four-gate sequence and then plain `pnpm test:e2e` on Node 22/Linux. Vite pins 5173 and proxies `/api`/`/yjs` to IPv4 8787, but Playwright readiness only proves that each URL answered once before tests begin; it does not record which process owns either port or why a service later exits.
- The API `dev` script uses `tsx watch`, even though an E2E run does not need source watching. That introduces an extra supervisor/restart layer into Playwright process ownership; the non-watch `start` script is a narrower lifecycle primitive for the harness.
- The seven browser scenarios are split across two spec files. With no explicit `workers`, Playwright may run those files concurrently even though `fullyParallel` is false; the shared web/API services are expected to survive concurrent pages, while the long world-exploration scenario can consume most of the suite timeout independently.
- Fresh Phase 13 port checks found no listener on either 127.0.0.1:5173 or :8787, and both HTTP probes failed immediately. The next reproduction can therefore attribute both listeners to the Playwright run rather than to a reused developer process.
- The fresh sandbox reproduction started both owned services successfully, received HTTP 200 readiness on 8787 and 5173, and Playwright then terminated them only after every Chromium launch failed at macOS Mach-port registration. This is a sandbox/browser-launch failure, not a service-disappearance reproduction.
- Because `apps/web/dist` exists, the API process also reports that it can serve the built SPA on 8787; the E2E base URL still targets Vite on 5173, so the duplicate web-serving capability is incidental rather than the tested surface.
- The first clean-port, sandbox-exempt two-worker reproduction passed all 7 scenarios in 45.8 seconds. After Playwright exited, neither 5173 nor 8787 had a listener and both HTTP probes were refused, proving successful owned teardown in this run.
- The earlier connection-refusal run is therefore not currently reproducible as a product failure. The evidence still supports two low-risk harness corrections: use the API's non-watch `start` command and make reuse of pre-existing services an explicit opt-in so future failures have unambiguous ownership.
- The minimal harness patch typechecks and Playwright still discovers exactly 7 Chromium scenarios in 2 files. Both web servers now pipe stdout/stderr, so a future premature exit retains service-side evidence in the test log instead of only surfacing through page navigation failures.
- The first post-fix single-worker run passed 7/7 in 53.9 seconds. Its log proves the API used `tsx src/index.ts` rather than the watcher and that Vite started on the owned IPv4 address; both listeners were gone after exit.
- The first post-fix two-worker run passed 7/7 in 46.4 seconds and again reclaimed both ports. This covers the exact concurrency mode implicated by the earlier transient connection refusals.
- The second post-fix two-worker run also passed 7/7, in 40.6 seconds, and reclaimed both ports. Together with the single-worker run, the changed harness now has three consecutive complete local passes and two consecutive passes in the previously problematic concurrency mode.
- Final non-browser gates after the Phase 13 change pass: 948 repository tests, recursive typecheck plus release/atlas/import boundaries, production build, and diff hygiene. Bundle measurements remain entry 878.02 kB raw / 302.74 kB gzip, CSS 225.62 / 34.95, ModelWorkbench 25.16 / 9.51, and lazy interior 1,210.00 / 482.99.
- The prior reviewer compared the supplied merge-base commit to the identical current `HEAD`; the meaningful review range is `4c18865..c62564c` (16 files, 2143 insertions, 3 deletions).
- Review finding: resource authorization currently uses a raw string `startsWith`, so a scope such as `island:test` also matches the sibling-like identifier `island:test-evil`; hierarchical resource boundaries need exact-or-child matching.
- Review finding: mission control is polled before the planner but not again after an asynchronous planner returns; a revoke or pause issued during planning can therefore fail to stop the next external effect from starting.
- Review finding: malformed negative or non-finite `estimatedUsage` from a planner can throw out of `authorizeMissionEffect` and reject `runMission` without a terminal trace bundle; planner-controlled request validation must fail closed into the trace.
- The repository already exposes browser-safe `canonicalStringify` from `@frontier-isles/opp`; Scout can combine it with Node `createHash("sha256")` without adding hashing logic to the eager web path.
- No reusable atomic JSON checkpoint/store exists in the current tree. The persistence boundary should therefore be a new explicit Scout/Node module, while structural `AgentRunBundle` parsing remains a pure explicit core subpath.
- Safe restart needs a durable `running` marker before execution. If a process dies after an effect but before a success event is committed, the next process must refuse automatic replay and surface reconciliation instead of reusing the last paused bundle.
- Review finding: the generic runner currently retries an ordinary E2/E3 executor failure even though the shared write may have completed before the error surfaced. An idempotency key in the trace is not proof that the external destination enforced it; automatic retries must remain limited to replay-safe E0/E1 effects.
- Review finding: the Scout request preflight says two network calls, but every run performs at least problem read + ledger read + CrossRef search (three), before any prior-ref resolution calls.
- Persisted Scout recovery must freeze the scientific time input. The wrapper can reuse the persisted contract `createdAt` as `NightDeps.now`, so a resumed last-year search does not silently shift its date window after restart.
- The existing model kernels were deterministic and pure, but runtime creation, advancement, observation, and prediction evaluation were embedded in `ModelWorkbench.tsx`; extracting them creates one executable truth for manual and autonomous runs.
- `ModelSpecV1` can cover both current kernel families without generated code: bounded synchronization parameters (count/spread/coupling/dt) and bounded shared-field parameters (width/height/rate), each capped at 5,000 kernel steps.
- The A2 proof uses a declared synchronization sweep `[0, 0.2, 2.8, 4]`: the first prediction fails, the controller records two plan revisions, and the third run reaches the 0.82 coherence target. This gives at least five meaningful run/revise steps without human clicks.
- The A2 contract clamps all overrides to 12 model runs and 30 seconds, permits only scoped E1 `model.run`, records zero writes/grants, round-trips through the persisted-bundle parser, and deterministically replays every recorded spec.
- At the Phase 12 checkpoint this remained an infrastructure/product-logic proof. Phase 14 now adds the visible local Mission Control; provider reasoning, notebook-v5 migration, and ledger promotion are still not connected.
- At the initial assessment baseline the worktree was clean; after the local `c62564c` commit, the current continuation intentionally has uncommitted Phase 10-12 changes and `main` remains ahead of `origin/main`.
- The latest product code matches the deployed source commit; later changes are release documentation only.
- The current local baseline passes 907 unit/integration tests, recursive typecheck, data-import/atlas drift gates, and production build.
- The production build entry is 878.02 kB raw / 302.74 kB gzip against a 900 KiB (921.6 kB decimal) raw budget, leaving about 43.6 kB decimal / 42.6 KiB headroom; the 1,210 kB interior archive remains lazy.
- The latest GitHub Actions run on `main` is successful, and the production root/API health probes return HTTP 200 / `{ "ok": true }`.
- The two-worker local browser suite is not deterministic in the current environment: one surface test passed before the local Vite service disappeared; subsequent failures were dominated by `ERR_CONNECTION_REFUSED`.
- PROJECT-CORE says the intended loop is atlas discovery -> travel -> island evidence -> research comparison -> deterministic model -> portable notebook.
- The stated next direction is learner-authored model work, older deep-panel accessibility, and stronger authorable relationship boundaries, without adding another metaphor layer.
- The current model workbench already enforces most of the v1 learning contract: choose a family/substrate, edit load-bearing parameters, predict before running, observe a deterministic metric, transfer the same rule, author a boundary, and save a local receipt.
- The present model runtime is still a closed catalog: `Runtime` is a two-variant union and `createRuntime`/`advanceRuntime` branch on `synchronization` versus `shared-field`; there is no learner-authored object/rule schema or compiler yet.
- The model UI calls the mathematics "AI-handled", but the current source contains no AI scaffolding path; this is authored explanatory copy over deterministic local kernels, not a generative workflow.
- Architecture v3 preserves four non-negotiable separations for the next slice: knowledge vs place plane, model receipt vs ledger evidence, human ratification vs AI proposal, and spatial view vs readable list twin.
- The executable-model v1 contract provides a clean extension rule: a family should enter the product only with a runnable deterministic kernel, sources, transfer boundaries, and a learning task.
- The build gate explicitly denies Pixi, GSAP, Yjs, y-websocket, YAML, and Zod from the eager entry; learner-authoring validation must therefore stay in the existing lazy model chunk or use a small custom validator.
- The enforced CSS budget is 244 KiB; the current 225.62 kB decimal asset leaves about 23.7 KiB of headroom. The authoring UI should reuse existing tokens/layout primitives rather than add a second visual system.
- CI intentionally runs test -> typecheck -> build -> full Playwright. The local two-worker service loss is not evidence of current CI failure, but it makes local preflight classification unreliable and should be stabilized before the next large slice.
- The current scout already runs an autonomous night loop: read problem/ledger, query CrossRef, rank/deduplicate candidates, create driftwood, and write a night digest through MCP without a human click inside the loop.
- Default agents currently have `propose` and `driftwood_write`; granted agents may receive additional capabilities. Unauthorized formal-station pushes degrade to dock proposals, while `rebuild` is hard-denied to lone agents even if capabilities are granted.
- The existing product therefore already distinguishes execution from promotion: an agent can execute research-support work and persist traceable candidates, while human adoption/transplant or a public grant controls formal-state effects.
- `@frontier-isles/core` is imported through its root barrel on the eager web path, so mission values must use explicit package subpaths instead of being re-exported from `src/index.ts`; this preserves the current entry-bundle boundary by construction.
- `runNightShift` already injects every effectful collaborator (`fetchText`, `fetchWorks`, and `makeWriter`), which permits a compatibility adapter to meter actual network requests and shared writes without altering the existing scout algorithm.
- The scout can depend on `@frontier-isles/core` without a dependency cycle: core contains policy/runtime contracts and does not import scout. The adapter should import only `@frontier-isles/core/mission` and `/mission-runner`.
- The implemented runner meters external effects before the executor performs them, keeps event sequence append-only, polls pause/revoke between turns, reuses successful idempotency keys without consuming a second grant, and rechecks expiry/wall budget after planning before execution.
- A paused `AgentRunBundle` can be resumed only under the identical contract; its event sequence, usage, failures, completed outputs, and consumed grant counts carry forward instead of resetting.
- The final repository gate passes 926 tests, recursive typecheck, release/atlas/import checks, and production build. The eager entry (878.02 kB), CSS (225.62 kB), and lazy interior (1,210.00 kB) are unchanged from baseline.
- Effect requests must now name a resource whenever the mission has resource prefixes; planner-owned inputs and executor-owned outputs are detached into immutable JSON trace snapshots, and an untraceable completed output stops without retrying the possibly completed effect.
- This slice proves deterministic in-process autonomy and supplied-bundle resume, not durable crash recovery, provider isolation, generated-code sandboxing, or an A2 product loop.
- The actual `pnpm --filter @frontier-isles/scout night` CLI now invokes `runNightShiftMission`; a structural boundary test prevents the scheduled entry from silently reverting to direct `runNightShift` execution.
- The compatibility adapter classifies scout dry-run as E1 and live driftwood/digest creation as mission-granted E2 proposals, matching the system plan's promotion semantics. Its mission grant never expands the MCP actor's gateway capabilities; the existing gateway remains the final write/degradation check.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Use one coherent product loop as the planning unit | It prevents the atlas, island, comparison, model, and notebook from becoming disconnected feature panels |
| Put E2E harness stabilization and entry-bundle headroom in the enabling tranche | Both affect the safety of every later visible change |
| Make learner-authored models the recommended product tranche | It converts the existing two-family demonstrator into a learner-owned scientific workflow |
| Keep AI outputs inspectable and non-authoritative | This preserves the append-only-ledger and human-ratification invariants |
| Extend the model subsystem through a versioned declarative spec before adding new kernels | The current two hard-coded runtime branches cannot safely support learner authorship or inspectable AI scaffolding at scale |
| Keep generated model specs local until an explicit human publish/review contract exists | A learner model receipt is personal exploration material and cannot silently become a ledger claim or graph edge |
| Start with a bounded declarative rule vocabulary, not arbitrary JavaScript or formula evaluation | It can express the two existing families while remaining deterministic, browser-safe, testable, and accessible |
| Add authoring code only behind the existing lazy model boundary | The eager-entry denylist and remaining bundle headroom make a new boot-path runtime unacceptable |
| Replace suggestion-only AI with bounded autonomous investigation | It matches the current night-shift architecture and makes AI a worker in the scientific loop rather than a text-completion feature |
| Separate execution authority from epistemic authority | AI may plan, run, iterate, and record; promotion into shared claims, mappings, publication, or governance follows explicit capabilities and review |
| Select bounded autonomy over suggestion-only or unrestricted sovereignty | It is the only option that is both genuinely AI Native and compatible with the current ledger/capability architecture |
| Make `MissionContractV1` the unit of authorization | One scoped authorization can cover many reversible steps while budgets, stop conditions, resources, and effects remain enforceable |
| Target A2 investigation before multi-agent execution | The current scout proves narrow resident autonomy; the next unknown is plan/run/evaluate/revise behavior within one inspectable mission |
| Keep mission contracts and runner on explicit core subpaths | This creates one shared policy layer without pulling new runtime values into the eager web barrel |
| Adapt rather than rewrite `runNightShift` | Its injected IO boundary already supports metering and preserves established behavior and tests |
| Meter before each network/write call | A depleted budget prevents the next effect instead of merely recording an overrun afterward |
| Keep the MCP capability gateway authoritative beneath mission policy | Mission authorization and existing actor capability checks are additive safety layers, not substitutes |
| Stop after the runtime/scout proof before adding UI or providers | The next unknown should be A2 scientific behavior; provider and interface complexity would obscure whether the mission semantics themselves work |
| Repair scope matching and pre-effect control polling before adding persistence | These are authorization invariants, and durable recovery must not preserve or replay a decision made under a leaked scope or stale control state |
| Persist a two-state `running` / `settled` envelope atomically | A surviving `running` marker turns an ambiguous crash into a safe stop; a settled paused bundle may be resumed, while terminal bundles are reused without repeating effects |
| Treat the checkpoint digest as content addressing, not authentication | SHA-256 detects accidental or untracked mutation relative to the record, but it does not replace signatures or filesystem permissions against an adversary who can rewrite both payload and digest |
| Retry E0/E1 automatically, but stop on uncertain E2/E3 failures | Reversible reads/computation may repeat; a shared or production write cannot be replayed safely unless its destination independently proves idempotency |
| Share one pure model runtime between manual and autonomous paths | A separate agent-only simulator would let the UI and mission produce divergent observations from nominally identical parameters |
| Keep the first A2 investigator deterministic and provider-free | It proves authorization, plan/evaluate/revise semantics, budgets, failed predictions, and replay before provider variability or UI complexity is introduced |
| Give the notebook its own hand-parsed mission projection | `explorationNotebook` loads eagerly and `guardEntryChunk` denylists `zod`, so borrowing only the receipt's types makes the boundary a build error rather than a review convention |
| Re-assert epistemic status at the storage parse boundary | Persisted JSON is the one surface where a record could gain authority nobody granted it; a stored `ledgerEffect` other than `none` is refused instead of trusted |
| Persist evidence, never resume authority | Dropping the contract, event log, and step inputs means a notebook record can be read and re-checked but cannot restart or extend a mission |
| Discard an internally inconsistent record rather than repairing it | A summary that claims more failures or runs than its surviving trials can show would misreport the investigation; showing nothing is the honest failure mode |
| Treat the "current page session only" line as code, not copy | Persisting the record made that reassurance false, so it had to change in the same commit that made it false |

## Plan Arbitration

| Candidate | Result | Reason |
|-----------|--------|--------|
| Suggestion-only copilot | rejected | Too weak, approval-heavy, and inconsistent with the existing autonomous night shift |
| Bounded autonomous investigator | adopted | AI can execute real multi-step work while the system controls scope, effects, budget, provenance, and promotion |
| Unrestricted autonomous researcher | rejected | Self-escalation and self-ratification would collapse capability governance and research truth |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Historical roadmap prose contains dated "current working tree" claims | Use the 2026-08 release checkpoint and fresh commands as current truth; treat older sections as context only |
| Browser-suite output was partially truncated by the execution harness | Do not report an uncaptured single-worker run as definitive 7/7 proof |
| Phase 13 sandbox reproduction failed all seven scenarios before assertions with Chromium Mach-port permission denial | Treat as environment failure; rerun the identical two-worker browser gate outside the sandbox with owned ports and captured logs |
| First visible A2 browser run triggered Vite dependency optimization for `zod` and reloaded the page | Treat as a dynamic dependency-discovery bug; fix the dev import/prebundle boundary, then rerun the same scenario rather than increasing its timeout |
| Full-suite A2 test waited for an L1-only theme lever from the L0 route | Correct the route/theme setup; a timeout increase would hide a selector contract error |
| Mobile axe found Model Lab accent text below 4.5:1 | Treat as real accessibility debt across the whole workbench; do not scope axe down to only the new control |

## Resources
- `docs/PROJECT-CORE.md`
- `docs/ROADMAP.md`
- `docs/architecture.md`
- `docs/DECISIONS.md`
- `docs/executable-model-layer-v1-2026-07-18.md`
- `docs/release-manifest.json`
- `apps/web/playwright.config.ts`
- `apps/web/vite.config.ts`

## Visual/Browser Findings
- Phase 14 desktop screenshots at 1280×720 show the Mission Control reading as a ruled field instrument between substrate choice and the manual bench: the collapsed state preserves the page rhythm, while the expanded state makes authority/budgets primary and the run action secondary to the declared objective.
- The completed desktop state shows goal, failed prediction, two revisions, 3/4 model runs, replay agreement, and trial rows without changing the underlying paper/ink vocabulary. It is information-dense but not a separate dashboard or nested-card stack.
- At 390×844 the mobile shell presents the same Mission Control in the model tab, with a 64px summary target, one-column authority/run sections, two-column bounded result cells, and no document overflow (`scrollWidth === innerWidth === 390`) in both authorization and completed states.
- Agent-browser initially failed on 127.0.0.1 because the manual `pnpm dev` Vite process advertised localhost only; reusing the same owned services at the advertised localhost origin succeeded. This routing detail is separate from the Playwright gate, which explicitly binds IPv4 127.0.0.1.
- The earlier desktop atlas diagnostic reached rendered UI and passed horizontal-overflow, focus, and axe AA assertions before a transient two-worker service failure.
- The repaired owned-service harness subsequently passed three complete 7/7 runs, and the Phase 14 expansion passed 8/8 in 48.3 seconds with both service ports reclaimed.

---
*Update after each new architecture or browser finding.*

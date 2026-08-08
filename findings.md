# Findings & Decisions: Frontier Isles 2026-08 System Plan

## Requirements
- Continue the current project assessment with a deeper system-level summary.
- Produce a prioritized plan rather than an unranked feature list.
- Keep code, local verification, CI, deployment, and human/product validation distinct.
- Preserve the project's research-truth and mobile/read-only boundaries.
- Reframe the next system as genuinely AI Native and reassess whether AI should be allowed to run work autonomously.

## Research Findings
- The working tree is clean and `main` matches `origin/main`.
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
- The desktop atlas surface test reached rendered UI and passed horizontal-overflow, focus, and axe AA assertions before the two-worker service failure.
- Current browser evidence is sufficient to identify a test-harness reliability problem, but not sufficient to claim a fresh complete local 7/7 browser gate.

---
*Update after each new architecture or browser finding.*

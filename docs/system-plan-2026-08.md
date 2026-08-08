# Frontier Isles · AI-Native System Plan 2026-08

_Revision 2 · 2026-08-08 · supersedes the suggestion-first boundary in revision 1_

## 1. Decision memo

### Decision

Adopt **bounded autonomous investigation**.

AI is allowed to plan, execute, iterate, branch, evaluate, stop, and persist a complete run trace without a human click before every step. The boundary is not "AI cannot run". The boundary is:

> AI may exercise execution authority inside an explicit mission envelope; it may not silently convert its own outputs into higher epistemic status, expand its own permissions, or conceal how a conclusion was produced.

### Alternatives considered

| Plan | Strength | Failure | Decision |
|---|---|---|---|
| A · Suggestion-only copilot | Simple and conservative | AI remains a text feature; contradicts the existing autonomous night shift and is not AI Native | Reject |
| B · Bounded autonomous investigator | AI can do real multi-step work while permissions, cost, provenance, and truth transitions stay explicit | Requires a mission runtime, policy engine, durable traces, and stronger failure recovery | Adopt |
| C · Unrestricted sovereign researcher | Maximum autonomy | Can self-escalate, overrun budgets, publish weak claims, or collapse execution into truth | Reject |

Useful parts retained from revision 1:

- versioned `ModelSpec` and deterministic/sandboxed execution;
- model receipts and notebook portability;
- no automatic model-to-relationship inference;
- explicit bundle, browser, CI, deployment, and human-validation gates.

What changes:

- manual authoring is no longer a prerequisite before AI may run;
- AI is not limited to proposing one static spec;
- the primary product unit becomes a mission with an autonomous execution loop;
- human review moves to permission escalation and epistemic promotion, not every reversible computation.

## 2. AI-Native product thesis

Frontier Isles should not be "a map plus an AI button". AI is a resident investigator embedded in the same world, protocol, permissions, and evidence boundaries as humans.

The north-star experience is:

> A person selects a frontier question and authorizes a bounded mission. An AI resident inspects the island and related records, forms a plan, builds or edits models, runs experiments, compares outcomes, revises its hypotheses, records failures, and stops when a declared condition is met. The person can intervene at any time and later decide what, if anything, should be promoted into shared research state.

The resulting loop is:

```text
question / island / comparison
            |
            v
      MissionContractV1
 objective · scope · capabilities · budget · stop conditions
            |
            v
      autonomous investigation loop
 observe -> plan -> execute -> evaluate -> revise/branch -> continue/stop
            |
            v
       AgentRunBundle
 plans · tool calls · model specs · seeds · outputs · failures · costs
            |
            v
     candidate outputs / promotion queue
            |
     human or policy-governed promotion
            v
 driftwood · dock proposal · formal station · ratified research state
```

## 3. Grounding in the current system

This direction extends working behavior rather than inventing autonomy from scratch.

The current literature scout already performs a narrow autonomous mission:

1. reads the problem object and ledger;
2. enriches the query with atlas context;
3. searches CrossRef;
4. ranks and deduplicates candidates;
5. writes driftwood through MCP;
6. records a `night_digest` morning-report draft;
7. closes its writer in a deterministic completion path.

The capability gateway already provides part of the control model:

- default agents receive `propose` and `driftwood_write`;
- unauthorized pushes into formal stations degrade to dock proposals;
- public grants can add scoped capabilities conceptually, although current grants are not yet time/budget/resource scoped;
- lone agents are hard-denied from `rebuild` because finalizing cross-domain correspondence is reserved for a human act;
- agent-authored events retain actor identity and AI credit roles in the ledger.

The AI-native redesign generalizes this pattern from one scheduled scout into a reusable mission runtime.

## 4. Four control layers

These are control layers over the existing knowledge/place planes, not new truth databases.

### 4.1 Mission layer

`MissionContractV1` is the authority for one autonomous run:

```text
identity
  missionId, agentId, owner, createdAt, expiresAt

objective
  question, success criteria, required outputs

scope
  islands, structures, datasets, model families, allowed domains

capabilities
  tools/actions the agent may use and effects it may produce

budgets
  wall time, steps, model runs, tokens/cost, network requests,
  concurrency, storage, state size

stopping conditions
  goal reached, contradiction found, no improvement, uncertainty too high,
  budget exhausted, repeated failure, permission required

promotion policy
  which outputs remain private traces, become driftwood automatically,
  enter a dock review queue, or require a human decision
```

The mission is authorized once. Individual reversible steps inside the envelope do not require repeated approval.

### 4.2 Execution layer

The agent can autonomously:

- read problem objects, ledgers, references, atlas projections, and prior run bundles;
- draft and modify `ModelSpec` instances;
- execute deterministic models and bounded parameter sweeps;
- generate code and run it only inside an isolated execution sandbox;
- compare runs, detect contradictions, falsify a candidate, and revise the plan;
- search/fetch from allowlisted sources when the mission grants network access;
- spawn bounded sub-runs or specialist agents when the mission grants concurrency;
- pause, resume, checkpoint, or stop itself according to the contract;
- write trace artifacts, driftwood, digests, and dock proposals within capability.

Generated code execution requires:

- no host filesystem or secret access by default;
- no network by default;
- explicit CPU, memory, wall-time, output-size, and process limits;
- input datasets mounted read-only;
- captured environment/version metadata;
- deterministic seed where the computation permits it;
- termination that cannot block the mission controller.

### 4.3 Trace layer

Every mission produces an append-only `AgentRunBundle` containing:

- mission contract and policy version;
- plan revisions and the reason for each revision;
- tool calls, inputs, outputs, timings, and effect classification;
- `ModelSpec` snapshots, seeds, parameters, code hashes, and runtime versions;
- observations and comparisons separated from interpretations;
- failed attempts, recovered errors, and discarded branches;
- resource consumption and remaining budget;
- permission requests, grants, revocations, and policy denials;
- final stop reason and unresolved questions;
- content-addressed artifacts needed to replay or inspect the result.

The trace is not a polished narrative. It is the inspectable substrate from which summaries and candidate claims are derived.

### 4.4 Epistemic layer

Execution success and research truth are separate state transitions.

| Status | Meaning | AI authority |
|---|---|---|
| `generated` | A model, plan, code artifact, or hypothesis exists | May create autonomously |
| `model_observation` | A result was observed in a recorded model run | May record autonomously |
| `source_observation` | A source or dataset reports something | May extract with provenance; not yet verified evidence |
| `evidence_candidate` | Artifact passes structural checks and is proposed as support/challenge | May propose or submit under a scoped grant |
| `human_reviewed` | A person has inspected the candidate and its trace | Requires a human action |
| `ratified` | The shared research relation/claim receives the protocol-defined acceptance | Requires the relevant human/pair/governance contract |

AI can move quickly through generation and execution. It cannot relabel its own run as externally validated or ratified.

## 5. Autonomy levels

Autonomy is selected per mission, not as one global product toggle.

| Level | Behavior | Typical use |
|---|---|---|
| A0 · Suggest | Produces a plan/spec but runs no tools | Sensitive review or teaching mode |
| A1 · Execute | Runs one bounded approved plan and returns | Reproduce one model or check |
| A2 · Investigate | Plans, executes, evaluates, revises, and branches until a stop condition | Default AI-native model/research mission |
| A3 · Resident | Runs scheduled or event-triggered missions over time | Literature scout, nightly monitoring, anomaly watch |
| A4 · Govern | Grants permissions or ratifies shared truth | Not available to a lone AI |

The current scout is a narrow A3 resident. The next product slice should prove A2 investigation.

## 6. Effect and permission model

Permissions must be effect-scoped, resource-scoped, and expiring.

| Effect | Examples | Default policy |
|---|---|---|
| E0 · Observe | Read ledger/source/atlas, inspect prior runs | Autonomous |
| E1 · Compute | Run model, execute sandbox, compare results, checkpoint trace | Autonomous within budget |
| E2 · Propose | Create driftwood, digest, hypothesis, dock proposal | Autonomous when mission grants the existing capability |
| E3 · Shared write | Attach data, submit a claim, validate/refute, publish an agent artifact | Requires an explicit scoped grant; no per-step click if the grant permits the class |
| E4 · Govern/ratify | Grant capabilities, accept bridge, finalize rebuild/mapping, change policy | Human or human-agent pair only |

An E3 grant should contain:

- permitted actions and target islands/stations;
- evidence requirements;
- maximum write count;
- expiry and revocation;
- whether delegation is forbidden (default: forbidden);
- whether each write enters a review queue or is recorded immediately with agent attribution.

This improves the current string-based grant model, which can express a capability but not its scope, budget, duration, or delegation rules.

## 7. Model Lab as the first A2 mission

The existing two deterministic model families are the safest place to prove autonomous investigation.

### 7.1 Shared ModelSpec

Human and AI use the same versioned `ModelSpecV1`:

- entity layout and state;
- perception/neighbourhood;
- update rule;
- parameters and safe ranges;
- initialization/seed;
- observable and comparison rule;
- interpretation, sources, and known boundary;
- provenance and stable spec hash.

The first vocabulary must reproduce the current synchronization and shared-field kernels. It may be authored manually, generated by AI, or jointly revised. The compiler and validator do not care who authored it.

### 7.2 Autonomous investigation loop

Within a mission, the agent may:

1. inspect the selected research comparison;
2. create one or more ModelSpecs;
3. state a prediction and falsification condition;
4. run a bounded sweep or adaptive experiment;
5. compare observations with the prediction;
6. revise parameters, initial conditions, or the spec;
7. branch competing models;
8. stop on contradiction, convergence, plateau, or budget;
9. save all branches and failures in the run bundle;
10. propose a follow-up question, driftwood item, or evidence candidate.

The agent is not required to stop after one run and wait for a person. That would be tool automation, not autonomous investigation.

### 7.3 Generated code

A bounded declarative vocabulary remains the default because it is easy to inspect and replay. Generated code is a second execution path, not permanently forbidden:

- it runs only in the sandbox;
- the bundle stores source, dependency lock, inputs, environment, outputs, and hashes;
- a code result starts as `model_observation`;
- promotion depends on evidence and review, not on whether the code exited successfully.

## 8. AI-native interface

The main interface is a **Mission Control**, not a chat sidebar.

### Before running

- mission objective and selected world/research context;
- autonomy level;
- capabilities and effect preview;
- compute/network/cost/time budgets;
- stopping conditions;
- outputs expected and promotion policy.

### While running

- current plan and why it changed;
- active/queued/finished branches;
- live budget and effect counters;
- tool/model/sandbox events as a navigable trace;
- hypotheses, contradictions, and uncertainty;
- pause, stop, revoke, or narrow-scope controls;
- explicit permission requests when the next action exceeds the envelope.

### After running

- result summary linked back to exact trace events;
- successful and failed branches side by side;
- model/source/code provenance;
- replay/export controls;
- promotion queue with `keep private`, `driftwood`, `dock proposal`, and permitted formal actions;
- unanswered questions and suggested next mission.

Mobile remains a read companion for shared research state, but it may monitor, pause, stop, and review a mission because those are operational controls, not research-ledger writes.

## 9. Work portfolio

### W0 · Deterministic delivery foundation

- stabilize the local Playwright service lifecycle and capture server logs;
- preserve entry/CSS/lazy boundaries;
- define mission-run test fixtures that do not depend on a live model provider;
- prove clean shutdown and recovery before autonomous background work is introduced.

**Exit:** three consecutive local 7/7 browser runs, exact-SHA CI green, no orphaned services, failures include controller/server traces.

### W1 · Mission and policy contracts

- add `MissionContractV1`, `AutonomyPolicy`, scoped grants, effect classes, budgets, and stop reasons;
- make grants non-delegable by default and E4 human/pair-only;
- define `AgentRunBundle` and content-addressed artifact references;
- adapt the current scout to run through the contract without changing its observable output.

**Exit:** the existing night shift is reproducible as an A3 mission; budget exhaustion, revocation, denial, retry, and resume are deterministic tests.

### W2 · A2 autonomous Model Lab

- add shared `ModelSpecV1`, validator, compiler, and safe limits;
- extract current model runtime logic from the React component;
- implement the multi-run plan/execute/evaluate/revise loop;
- allow bounded parameter sweeps and competing branches;
- record a replayable run bundle and v5 notebook receipt.

**Exit:** one mission completes at least five meaningful steps without human clicks, revises after a failed prediction, stops at a declared condition, and replays from the recorded bundle.

### W3 · Mission Control

- create the mission authoring, live trace, budget, branch, intervention, and promotion views;
- keep manual ModelSpec editing as a peer path, not the primary prerequisite;
- preserve keyboard, reduced-motion, list twin, mobile monitor, and failure recovery;
- distinguish plan text from executed trace and observed output visually and semantically.

**Exit:** desktop/tablet/mobile browser proof covers authorize -> autonomous loop -> pause/resume -> stop -> inspect -> export, with zero hidden writes or horizontal overflow.

### W4 · Shared-state promotion

- route agent candidates through driftwood/dock/formal-write policies;
- add evidence checks and agent attribution to E3 actions;
- require human/pair contracts for E4 transitions;
- reconnect mission outcomes to the island, comparison view, and morning report;
- preserve failures and rejected candidates rather than deleting them.

**Exit:** an AI mission can produce and persist a candidate autonomously; its promotion path is explicit, revocable, attributable, and cannot bypass the gateway.

### W5 · Multi-agent missions, later

- planner/executor/critic roles under one parent mission budget;
- branch-level capability tokens rather than unrestricted inherited authority;
- shared artifact/trace contracts and deterministic merge rules;
- no expansion until one-agent A2 missions are reliable and comprehensible.

## 10. 30 / 60 / 90-day sequence

### Days 0–30 · Autonomy contract and compatibility

- close W0;
- implement W1 contracts and policy simulation;
- route the current night scout through the mission runner;
- freeze non-escalation, budget, stop, resume, and trace fixtures.

**Milestone:** existing autonomous night work runs under a visible, replayable mission contract with no regression.

### Days 31–60 · Self-running Model Lab

- implement W2 with the existing two model families;
- run adaptive multi-step experiments and competing branches;
- add notebook v5/run bundle export;
- prove sandbox limits before allowing generated code.

**Milestone:** an AI investigator can autonomously falsify or refine a model candidate and explain its trace.

### Days 61–90 · Mission Control and promotion

- implement W3 and the E2 portion of W4;
- connect one comparison -> mission -> model experiments -> candidate -> morning-report/dock review route;
- conduct a human comprehension review of permissions, trace, and truth labels;
- refresh release evidence and deploy only after explicit authorization.

**Milestone:** Frontier Isles demonstrates one complete AI-native scientific loop without collapsing autonomous execution into autonomous truth.

## 11. Verification architecture

### Autonomy invariants

- the agent can continue through reversible steps without repeated approval;
- no action outside the mission scope executes;
- budgets are enforced independently of the model's own reasoning;
- a mission cannot grant itself capabilities or extend its expiry;
- child runs cannot inherit broader authority than the parent;
- pause/revoke/stop takes effect within a bounded time;
- crash/restart resumes from the last committed trace event or stops safely;
- retries are idempotent and counted against budget;
- hidden retries, discarded failures, and unrecorded branches are forbidden.

### Scientific invariants

- generated output, model observation, evidence candidate, and ratified claim are visibly distinct;
- same ModelSpec + seed + runtime version reproduces the recorded result;
- an exit code or metric improvement does not equal external validation;
- AI attribution, sources, code, inputs, and environment remain inspectable;
- failed predictions remain in the bundle and can produce follow-up questions;
- no theme, proximity, or model similarity automatically creates a research edge.

### Product and release gates

- unit/contract tests for policy, budgets, state machine, traces, specs, sandbox limits, notebook migration, and projections;
- `pnpm test`, `pnpm typecheck`, `pnpm build`, and `git diff --check`;
- Playwright desktop/tablet/mobile, keyboard/focus, reduced motion, overflow, axe, persistence, restart, pause/revoke, provider/sandbox failure, and console checks;
- exact-SHA CI with retained controller/server/browser artifacts;
- separately authorized deployment, source-SHA and asset identity, health/API, rendered-DOM, and agent-write boundary probes;
- human review that participants can tell what the AI planned, what actually ran, what was observed, what remains uncertain, and which action would promote it.

## 12. Rejected designs and explicit deferrals

Rejected:

- suggestion-only copilot as the primary interaction;
- approval before every model/tool step;
- a chat transcript as the execution trace;
- unrestricted self-escalation or self-ratification;
- treating generated code success as scientific evidence;
- retries until a desired conclusion appears;
- silent omission of failed branches.

Deferred:

- W5 multi-agent orchestration until one-agent A2 is proven;
- general-purpose arbitrary code execution before sandbox limits and replay bundles pass;
- automatic E3 grants based on model confidence;
- P4 federation and inter-island autonomous delegation;
- new visual metaphors unrelated to mission state or epistemic status;
- ORCID/DOI/Merkle/account sync until mission and trace contracts settle;
- production research-write enablement without a separate authorization and credential plan.

## 13. Recommended immediate proof slice

Start with a narrow AI-native slice, not a manual editor:

1. define `MissionContractV1`, `AutonomyPolicy`, effect classes, and `AgentRunBundle`;
2. wrap the existing night scout in the mission runner without changing its research behavior;
3. add one A2 Model Lab mission that may perform up to 12 runs or 30 seconds, revise its plan, and stop on contradiction/plateau/budget;
4. persist every plan revision, run, observation, failure, and stop reason;
5. permit automatic E0/E1 and mission-granted E2 effects; keep E3 behind scoped grants and E4 human/pair-only;
6. expose pause, stop, revoke, trace, and promotion queue in a minimal Mission Control;
7. stop for architectural and comprehension review before adding live model providers or multi-agent execution.

This slice proves the defining claim: the AI actually works autonomously, while the system—not the AI's confidence—controls effects, resources, provenance, and truth transitions.

## 14. Implementation checkpoint · 2026-08-08

The first reversible runtime slice is now implemented locally:

- `MissionContractV1` defines A0-A4 autonomy, E0-E4 effects, resource scope, expiring non-delegable grants, budgets, stop reasons, and hard denials for E4/governance actions;
- the deterministic runner records ordered plan/step/policy/stop events, meters effects before IO, enforces expiry and budgets, counts attempts, supports retry and idempotent reuse, polls pause/revoke between turns, and resumes a paused bundle without resetting its prior trace or authority use;
- the existing night scout runs unchanged inside an A3 compatibility mission: the real night CLI routes through it, dry-run is E1, live driftwood/digest creation is mission-granted E2, and the MCP capability gateway remains the final write/degradation boundary;
- mission modules are exported only through explicit `@frontier-isles/core/mission*` subpaths, not the eager core barrel.
- persisted bundles are structurally parsed before becoming resume authority, and the Scout can optionally save a canonical SHA-256 `running`/`settled` record through atomic replacement plus an exclusive lock;
- a settled paused Scout run resumes under the identical contract, terminal results are reused without repeated IO, and a surviving `running` record safely refuses automatic replay because an in-flight E2 write may have completed;
- resource scopes use exact-or-delimited-child matching, pause/revoke is re-polled after asynchronous planning, and uncertain E2/E3 failures are never retried automatically.
- the manual workbench now shares one extracted deterministic runtime with a bounded `ModelSpecV1` compiler, and a provider-free A2 proof performs plan/run/evaluate/revise across at least five steps under hard 12-run/30-second ceilings;
- the A2 proof retains a failed prediction, two revisions, replayable model observations, and a receipt explicitly marked `ledgerEffect: none`;
- the lazy Model Lab now exposes that real A2 loop through a progressively disclosed Mission Control that declares A2/E1 authority, four-run/30-second UI budgets, zero network/write/grant authority, trace/replay evidence, and the non-ledger boundary before and after execution;
- shared-field experiments remain a manual peer path: the UI does not imply autonomous support where only the synchronization mission exists.

Fresh local proof for this checkpoint:

- `pnpm test`: 950 tests passed across all eight tested workspaces;
- `pnpm typecheck`: release-document, atlas-generation, data-import, and TypeScript gates passed;
- `pnpm build`: passed; eager entry remains effectively flat at 878.05 kB raw / 302.75 kB gzip, CSS is 233.23 kB / 35.99 kB gzip, and the 1,210.00 kB / 482.99 kB gzip interior bundle remains lazy;
- the visible Mission Control grows the lazy `ModelWorkbench` chunk to 35.60 kB raw / 13.01 kB gzip, while the nested `modelMission` runtime remains a separate 72.66 kB / 18.22 kB gzip chunk and does not enter the eager application entry;
- Playwright now owns fresh services by default, starts the API without a watch supervisor, and pipes service logs; reuse requires the explicit `PLAYWRIGHT_REUSE_EXISTING_SERVERS=1` diagnostic opt-in;
- the changed harness passed three consecutive complete local browser runs: 7/7 with one worker in 53.9s, then 7/7 with two workers in 46.4s and 40.6s; ports 5173 and 8787 were reclaimed after every run;
- the expanded browser suite passed 8/8 with two workers in 48.3s, including the real A2 run/trace/replay path and mobile 44px/overflow/axe checks; ports 5173 and 8787 were reclaimed;
- desktop and 390x844 mobile visual checks covered collapsed, authorization, and completed states; the mobile document stayed at 390px scroll width, with no horizontal overflow;
- `git diff --check`: passed.

The runtime and durable Scout foundation are complete locally, but the broader AI-native product proof remains open:

- automated reconciliation of an ambiguous `running` record remains intentionally absent; the safe behavior is stop-and-inspect, not blind replay;
- notebook-v5 storage/export/import for the completed receipt and replay bundle; the current visible result is session-local and disappears on reset/reload;
- long-running Mission Control behavior for live pause/stop/revoke and promotion routing; the current deterministic UI mission finishes synchronously and performs no ledger write;
- live model providers, generated-code sandboxing, multi-agent delegation, E3 production research writes, commit/push, and deployment;
- exact-SHA CI proof for the uncommitted harness change; the local W0 browser/service gate is now green, while sandboxed Chromium remains unable to launch on this macOS host because Mach-port registration is denied.

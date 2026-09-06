# Frontier Isles upgrade · 2026-09-06

> Historical first-iteration record. The user's subsequent correction supersedes the staged worksheet and practice rewards described below. Current implementation and verification: [second-iteration report](upgrade-v2-2026-09-06.md).

User scope: evaluate and implement an upgrade to xFrontier MCP alignment, domain collision, scientific exploration, gamification, and interaction.

## Findings
- Clean initial worktree. CodeGraph queried before source discovery.
- Existing mineral-paper atlas, deep model labs, authored structure mapping and local notebook provide a coherent foundation.
- Collision overlay immediately founds islands from formula cards; its API failure is ignored. Mobile lacks this flow.
- Live public MCP handshake: xfrontier 0.9.0, dataset xf-e3e450f3fa16; 1,950 records, 55 great questions, 42 authored question collisions. HTTP is read-only. Question collisions are not record mappings or proven mechanisms.

## Implementation direction
Extend the existing collision surface and chart entry, preserving the world. Add a read-only, version-consistent MCP projection with a clearly dated offline snapshot. Turn collision into a local expedition: compare questions, specify hypothesis and alternative, define probe and failure, record evidence and interpretation. Reward completed research practices, never claim scientific validity from form completion.

## Verification / environment
- Existing unrelated ::1:5173 service preserved. Own server runs on 8788 with in-memory DB; web will use 5174 and FI_API_TARGET.
- Global corepack pnpm is broken (cache permission/key mismatch). Cached pnpm 9.12.2 is available; prefer direct workspace binaries for checks.
- No upstream writes, publication or deployment performed.

## Implemented
- Read-only public MCP catalog/source routes with version/type-wall checks, cache/cooldown, and explicit live/stale/offline states.
- Shared, validated projection: 55 great questions and 42 authored collisions; reproducible snapshot check/refresh script.
- Local version-pinned expedition notebook: mechanism/boundary, hypothesis/alternative, probe/failure, evidence/interpretation, equivalent progress for refutation, Markdown export and JSON backup.
- Responsive collision surface, mobile entry, focused mobile writing mode, desktop emphasis, keyboard/select accessibility, successful-acknowledgement-only founding.
- Assessment: `docs/upgrade-assessment-2026-09-06.md`.

## Verification
- All eight workspace test suites have passed: opp 21, assets 56, renderer 160, data 187, core 201, scout 33, web 410, server 145. Scripts: 22. Total: 1,235 tests.
- Initial unrestricted parallel runs hit existing 5-second render-test and worker-RPC timeouts. Web and server passed when rerun with `vitest run --maxWorkers=2`; these are not assertion fixes or raised test thresholds.
- Workspace typecheck, generated atlas/import checks, release-doc checks and observation-ledger checks passed.
- Production build and precompression passed; collision JS/data and CSS are lazy chunks, no added runtime dependencies.
- Live catalog route returned xf-e3e450f3fa16; live question source route returned the DOI anchor for GQ-life-origin; public snapshot `--check` reports unchanged.
- New collision E2E: 3/3 passed (offline full expedition, persistence/export/reopen, mobile first-field visibility, failed founding).
- Scoped axe: zero violations on desktop and mobile after duplicate landmarks were corrected. Viewed five final screenshots under `.impeccable/review/`.
- Independent Impeccable review: two material findings resolved (mobile writing density and misleading mobile read-only wording); verdict ship at that fix-list scope. Design documentation follows final implementation.
- Full browser regression: 11/11 passed in 3.9 minutes, single worker. Includes offline collision completion/recovery/export, mobile writing, failed founding, desktop axe, night/readiness, A2 model inquiry, animated voyage, scientific narrative/QFT, tablet targets, mobile axe and world exploration roundtrip.
- Design system recorded in `apps/web/DESIGN.md` and `apps/web/.impeccable/design.json`; final `git diff --check` passed.

## Environment / reproducibility
Vite in this sandbox did not invalidate its transformed-module cache after file changes; restarting the owned 5174 process ensured screenshots and tests used current source. The isolated API at 8788 uses an in-memory database; browser tests use isolated profiles. User data and the preexisting 5173 process were not modified. The original root `progress.md` is preserved.

## Publication boundary
Local working-tree changes only. No commit, push, deployment, upstream write, or scientific validation is claimed.

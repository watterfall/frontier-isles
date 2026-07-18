# CLAUDE.md

Minimal startup guidance for AI coding agents. This file is a router, not a repository handbook: do not preload every linked document.

## Startup

1. Read `docs/PROJECT-CORE.md` for product intent and stable boundaries.
2. Inspect `git status` and preserve unrelated or user-owned changes.
3. When `.codegraph/` exists and the task requires locating code, use `codegraph explore` or `codegraph node` before text search. Read docs and config files directly when the index does not cover them.
4. Open only the task-matching context below. Plain paths are intentional; there are no eager file-import directives.

## Task routing

| Task | Read next |
|---|---|
| Run, build, test, or debug | `.claude/context/operations.md` |
| Protocol, server, data flow, ledger, permissions | `docs/architecture.md` + `.claude/context/repository.md` |
| Web, atlas, island, building, accessibility, visual behavior | `.claude/context/interface.md` + `.impeccable.md` |
| Product status, planning, or prioritization | Inspect `docs/ROADMAP.md` headings, then read only the relevant section |
| Reopen a settled decision | `docs/DECISIONS.md` |
| Specialized world, comparison, or model work | Only the matching dated contract under `docs/` |
| Verify an old implementation claim | `docs/history/2026-07-18-connection-model/` only when needed |

## Stable repository constraints

- `docs/architecture.md` is the protocol and invariant source of truth.
- Knowledge-plane ledger data and place-plane world data remain separate; visible research state is projected from recorded events.
- AI may scaffold or propose, but it does not finalize a human mapping or silently create a research edge.
- The app must remain usable when the server or GPU path is unavailable; every spatial or animated state needs a readable twin.
- Network access stays in `apps/web/src/api/client.ts`; scene assets belong in `packages/assets`, not inline component SVG.
- Altitude is cartographic position, never rank. Compact navigation exposes at most eight anchors before disclosure while the list twin retains every island.
- Mobile research-ledger writes remain restricted; personal notebook and model receipts stay local and do not alter graph truth.

## Context discipline

- Root and `.claude/context/` files contain no fixed test totals, island totals, or milestone percentages; obtain current evidence from the repository and report the exact gates run.
- Historical plans and logs are evidence, not current instructions. Do not continue their “next step” language without checking current code and `docs/ROADMAP.md`.
- For visible interface changes, the rendered prototype remains the visual authority; `.impeccable.md` defines audience, tone, and design constraints.

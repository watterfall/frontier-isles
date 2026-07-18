# Frontier Isles · Project Core

This is the compact default context for agents and contributors. It states the product thesis, system boundaries, and current direction without expanding every specialist example. Load the linked contracts only when a task needs them.

## Product thesis

Frontier Isles is a world-shaped open-research and learning environment:

- the atlas lets people discover real open questions and move between regions;
- each island is a durable research place grounded in one question;
- districts and building floors reveal increasing detail from real records;
- the comparison view helps people inspect reusable relationships, important differences, and possible tests;
- the model workspace lets a learner define, predict, run, transfer, and limit a small deterministic model;
- the notebook keeps the learner's own route, observations, model runs, and stated limits portable.

The core promise is not an answer feed. A person should leave with a connection or model they inspected, tested, and can explain.

## System shape

| Layer | Responsibility | Source of truth |
|---|---|---|
| L0 atlas | Continuous semantic-zoom map, search, routes, and regional orientation | Atlas projection + place data |
| L0.5 travel | Course, movement, survey, docking, and pose-preserving return | Local exploration notebook |
| L1 island | Evidence-gated districts and spatial access to an island's work | Problem object + ledger projections |
| L2 building | Stable floors for questions, sources, artifacts, residents, and active work | Projected station content |
| Comparison | Source-preserving relationships, differences, tests, and human challenge | Curated mappings + signed ledger currents |
| Model workspace | Initial deterministic rule families reused across multiple interpretations | Local runtime + notebook receipts |

The knowledge plane is portable protocol data. The place plane is regenerable world data. A simulation receipt, visual proximity, or shared theme never creates a research edge by itself.

## Non-negotiable boundaries

- The append-only ledger is the source of research history; projections are derived views.
- AI may scaffold and propose, but it does not finalize a human mapping or silently write a conclusion.
- Every spatial or animated state needs an equivalent readable interface.
- Altitude is cartographic position, never rank; anchors are navigation entries, never value judgments.
- Progress is expressed through visible research state, not points, levels, streaks, or leaderboards.
- Mobile preserves full reading truth. Personal local notes and model receipts are separate from research-ledger writes.
- Missing evidence and historical gaps stay visible; the interface does not fill them with invented certainty.

## Current direction

The world map, continuous travel, island districts, navigable building floors, plain-language research comparison, source dossier, and first executable-model loop are present. The next work should deepen the learner-authored model loop, improve older deep-panel accessibility, and strengthen authorable relationship boundaries without adding another metaphor layer.

## Load context progressively

1. Start here for product intent and scope.
2. Read `architecture.md` when changing protocol, data flow, permissions, projections, or invariants.
3. When planning or checking debt, inspect `ROADMAP.md` headings first and read only the relevant section.
4. Read the matching world, island-depth, comparison, or executable-model contract only when the task touches that surface.
5. Use `docs/history/2026-07-18-connection-model/` as historical execution evidence, not startup context.
6. Read `.impeccable.md` and the visual prototype when changing visible interface behavior.

## Verification baseline

Use the narrowest relevant package checks while iterating, then run the repository gates required by the touched surface. For a full product slice, the baseline is:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e
git diff --check
```

Browser proof should cover the actual desktop and compact routes, keyboard and focus behavior, reduced motion, overflow, persistence, and console errors when those surfaces change.

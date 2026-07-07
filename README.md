# Frontier Isles 问题群岛

An isometric, AI-native open-science collaboration platform. Anyone can **found an island** — a virtual lab anchored on one frontier challenge question. Research output grows as visible architecture; the whole process is open by default.

- **Architecture (source of truth):** [`docs/architecture.md`](docs/architecture.md) (v3.0)
- **Visual authority:** [`design/handoff/`](design/handoff/) — Claude Design prototypes (`问题群岛-原型 v3.dc.html` is the latest). Day/night swaps palette only, never shape.
- **Session decisions:** [`docs/DECISIONS.md`](docs/DECISIONS.md)

## Workspace

```
apps/web           Vite + React (+ PixiJS 8)    L0 sea chart / L1 island / L2 panels
apps/server        Hono + y-websocket + SQLite + MCP server
packages/opp       OPP protocol: problem-object & ledger schemas (zod) + validators
packages/core      domain types · capability tables · projections
packages/renderer  isometric engine (2:1, 128×64 tiles)
packages/assets    parameterized SVG components + design tokens extracted from the prototype
```

## Quickstart

```bash
pnpm install
pnpm dev          # server on :8787, web on :5173
pnpm test         # all workspace tests
pnpm typecheck
```

Node ≥ 22, pnpm ≥ 10.

## Three theses

1. **Research state is architecture** — buildings grow only from real ledger events.
2. **Day / Ferry / Night is knowledge production** — the day/night toggle is the signature interaction.
3. **The archipelago is the atlas** — an island is the spatial rendering of an `op://` problem object.

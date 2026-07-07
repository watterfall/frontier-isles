# Frontier Isles 问题群岛

An isometric, AI-native open-science collaboration platform. Anyone can **found an island** — a virtual lab anchored on one frontier challenge question (its QFocus). Research output grows as visible architecture on the island; humans and AI residents cohabit it; the whole process is open by default and speaks **OPP (Open Problem Protocol)**: one problem-object `.md`, one append-only event ledger, one MCP surface.

**Three theses** (the judge of every decision):

1. **Research state is architecture** — buildings grow only from real ledger events (hut → academy → school; dormant islands grow moss and mist).
2. **Day / Ferry / Night is knowledge production** — 白天 is the curated record D(t), 夜晚 is the full exploration layer A(t) with ghosts and a replay timeline; the day/night lever is the signature interaction.
3. **The archipelago is the atlas** — the sea chart is a navigable map of open problems; an island is the spatial rendering of an `op://` problem object.

## Status

First vertical slice is built and end-to-end verified (111 unit tests + a 12-step browser drive: found an island in the five-chapter QFT ceremony → it rises from the sea and persists → vote/adopt/transplant all land as hash-chained ledger events → the exported `ledger.jsonl` verifies independently).

| Milestone (architecture §8) | Status |
|---|---|
| P0 Protocol (`packages/opp`) | ✅ done — hand-written `.md` validates into typed refs; tamper-evident chain |
| P1 Skeleton (renderer · ceremony · OAuth · presence · Question Wall · list twin) | ◐ ~85% — whiteboard canvas UI remains |
| P2 Residents (night shift · morning report · driftwood/transplant · MCP gateway) | ◐ ~45% — surfaces live, loops not yet closed |
| P3 Atlas · P4 Federation | not started |

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the honest gap list and the prioritized plan.

## Quickstart

```bash
pnpm install        # Node ≥ 22, pnpm ≥ 10
pnpm dev            # API+WS on :8787 (auto-seeds 20 islands), web on :5173
pnpm -r test        # all workspace tests
```

Open http://localhost:5173 — the sea chart (L0). Click 「AI 之问」 to enter the sample island (L1), flip the day/night lever, open the Question Wall (L2), or press 建·建一座新岛 to run the founding ceremony. UI ships in zh-CN and en (toggle top-right).

- **GitHub OAuth**: copy `.env.example`, register an OAuth app, set `GITHUB_CLIENT_ID/SECRET`. Without them a dev bypass signs you in as the seeded island master.
- **AI residents via MCP**: `pnpm --filter @frontier-isles/server mcp -- --island machine-curiosity --agent github:my-scout` exposes 11 tools (`propose_subquestion`, `create_driftwood`, `submit_claim`, …). Every call auto-writes a ledger event with `credit:ai/*`; an ungranted agent's claim degrades to a dock proposal — AI never pushes.
- **Leavability**: `GET /api/islands/:slug/problem.md` and `…/ledger.jsonl` export the island's knowledge plane verbatim. An open platform must be leavable.

## Workspace

```
apps/web           Vite + React — L0 sea chart / L1 isometric island / L2 panels / founding ceremony
apps/server        Hono + better-sqlite3 — append-only ledger, capability gateway, y-websocket, MCP server
packages/opp       Open Problem Protocol: problem-object .md + ledger schemas (zod), hash chain
packages/core      domain: 9 stations · 6 driftwood atoms · 4 bridge artifacts · roles · projections
packages/renderer  isometric engine (2:1, 128×64; PixiJS 8 behind ./pixi for atlas scale)
packages/assets    the prototype's hand-drawn SVG as parameterized components + design tokens
```

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — architecture v3.0, the source of truth
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — build-slice decisions and their reasoning
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — status, debt, and the path to P2/P3
- [`design/handoff/`](design/handoff/) — Claude Design prototypes (v3 is the visual authority) and the design-session transcripts
- [`CLAUDE.md`](CLAUDE.md) — orientation for AI coding agents working in this repo

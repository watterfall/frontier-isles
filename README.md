# Frontier Isles 问题群岛

An isometric, AI-native open-science collaboration platform. Anyone can **found an island** — a virtual lab anchored on one frontier challenge question (its QFocus). Research output grows as visible architecture on the island; humans and AI residents cohabit it; the whole process is open by default and speaks **OPP (Open Problem Protocol)**: one problem-object `.md`, one append-only event ledger, one MCP surface.

**Three theses** (the judge of every decision):

1. **Research state is architecture** — buildings grow only from real ledger events (hut → academy → school; dormant islands grow moss and mist).
2. **Day / Ferry / Night is knowledge production** — 白天 is the curated record D(t), 夜晚 is the full exploration layer A(t) with ghosts and a replay timeline; the day/night lever is the signature interaction.
3. **The archipelago is the atlas** — the sea chart is a navigable map of open problems; an island is the spatial rendering of an `op://` problem object, and (v2 「海即数据」) the **water between islands is itself data**: currents are relations projected from the ledger, climate is the domain manifold.

## Status

Built and end-to-end verified — **178 unit tests** (across 6 packages/apps) plus a browser drive: found an island in the five-chapter QFT ceremony → it rises from the sea and persists → vote/adopt/transplant all land as hash-chained ledger events → the exported `ledger.jsonl` verifies independently. Every island is now enterable (scene generator), and the sea chart carries a live **data-driven sea-plane** (v2 「海即数据」).

| Milestone (architecture §8) | Status |
|---|---|
| P0 Protocol (`packages/opp`) | ✅ done — hand-written `.md` validates into typed refs; tamper-evident chain |
| P1 Skeleton (renderer · ceremony · OAuth · presence · Question Wall · list twin · **scene generator**) | ◐ ~90% — whiteboard canvas UI remains |
| P2 Residents (night shift · morning report · driftwood/transplant · MCP gateway · **sea-plane currents**) | ◐ ~55% — L1 scene closed, AI-resident loop not yet |
| P3 Atlas (`packages/data` curated atlas · v2 sea-plane climate/relations) | ◐ ~20% — foundations laid |
| P4 Federation | not started |

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the honest gap list and the prioritized plan.

## Quickstart

```bash
pnpm install        # Node ≥ 22, pnpm ≥ 10
pnpm dev            # API+WS on :8787 (auto-seeds the curated atlas, 27 islands), web on :5173
pnpm -r test        # all workspace tests
```

Open http://localhost:5173 — the sea chart (L0), where currents/climate render the relation + domain field. Click any island to enter it (L1), flip the day/night lever, open the Question Wall (L2), or press 建·建一座新岛 to run the founding ceremony — founded islands are enterable too. UI ships in zh-CN and en (toggle top-right).

- **GitHub OAuth**: copy `.env.example`, register an OAuth app, set `GITHUB_CLIENT_ID/SECRET`. Without them a dev bypass signs you in as the seeded island master.
- **AI residents via MCP**: `pnpm --filter @frontier-isles/server mcp -- --island machine-curiosity --agent github:my-scout` exposes 11 tools (`propose_subquestion`, `create_driftwood`, `submit_claim`, …). Every call auto-writes a ledger event with `credit:ai/*`; an ungranted agent's claim degrades to a dock proposal — AI never pushes.
- **Leavability**: `GET /api/islands/:slug/problem.md` and `…/ledger.jsonl` export the island's knowledge plane verbatim. An open platform must be leavable.

## Workspace

```
apps/web           Vite + React — L0 sea chart + sea-plane / L1 isometric island (sample + generated) / L2 panels / ceremony
apps/server        Hono + better-sqlite3 — append-only ledger, capability gateway, y-websocket, MCP server
packages/opp       Open Problem Protocol: problem-object .md + ledger schemas (zod), hash chain
packages/core      domain: 9 stations · 6 driftwood atoms · 4 bridge artifacts · roles · projections · sea currents
packages/renderer  isometric engine (2:1, 128×64) + sea-plane math; PixiJS 8 behind ./pixi for atlas scale
packages/assets    the prototype's hand-drawn SVG as parameterized components (island + sea) + design tokens
packages/data      curated xfrontier atlas — 26 real frontier islands, bridges, and sea-field data
```

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — architecture v3.0, the source of truth
- [`docs/depth-plan-v2.md`](docs/depth-plan-v2.md) — v2 「海即数据」 sea-plane: the sea as a data field (invariants 14–16)
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — build-slice decisions and their reasoning
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — status, debt, and the path to P2/P3
- [`design/handoff/`](design/handoff/) — Claude Design prototypes (v3 is the visual authority) and design-session transcripts
- [`design-system/`](design-system/) — exported foundation + v2 dimension cards; [`.design-eng-loop/`](.design-eng-loop/) — the design↔code co-evolution contract
- [`CLAUDE.md`](CLAUDE.md) — orientation for AI coding agents working in this repo

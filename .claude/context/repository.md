# Repository and data contracts

Load this file for protocol, server, storage, projection, or cross-package work. `docs/architecture.md` remains authoritative when this summary and the contract diverge.

## Workspace map

```text
packages/opp ← packages/core ← apps/server
    ↑              ↑          ← apps/web → packages/{assets, renderer, data}
```

- `packages/opp`: portable problem-object and ledger protocol.
- `packages/core`: domain rules, projections, and currents.
- `apps/server`: database, HTTP, WebSocket, capability gateway, and MCP surface.
- `apps/web`: application state, atlas, island scenes, panels, and local notebooks.
- `packages/renderer`: WebGL-free geometry at the root export; Pixi implementation behind `./pixi`.
- `packages/assets`: parameterized visual assets and canonical tokens.
- `packages/data`: generated atlas projection plus on-demand interior material.

## Load-bearing contracts

The knowledge plane is portable protocol data. The place plane is regenerable platform data. They use separate storage and event streams.

- Problem-object Markdown is parsed on demand through `packages/opp`.
- Ledger events are append-only and hash-chained per island. Do not add update or delete paths to the chain.
- Event content uses content-addressed refs; do not inline ref bodies into ledger events.
- Growth, currents, and other visible research state are projections. Change the recorded event or source data, not the derived view.
- A sea current requires a recorded relation; there is no independent “draw a link” write.

The capability gateway is enforced in both HTTP and MCP paths. An ungranted agent write degrades to a dock proposal; human-only research actions retain their role checks. Development login and production OAuth share the same downstream authorization path.

Yjs is limited to collaboration inside an artifact. Spatial operations remain server-ordered events; do not merge the two ordering models.

## Portability

`GET /api/islands/:slug/problem.md` and `/ledger.jsonl` must continue to round-trip through the protocol parser and ledger verifier. Keep those checks green whenever serialization, storage, or projection logic changes.

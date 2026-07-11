# CLAUDE.md

Guidance for AI coding agents in this repo. Read the source-of-truth docs before non-trivial work.

## Read first

- `docs/architecture.md` — **source of truth** (v3.0). Three theses judge every decision; §7 invariants are non-negotiable (no XP/leaderboards, list twins everywhere, AI never pushes, ledger never GC'd).
- `docs/depth-plan-v2.md` — the v2 「海即数据」 sea-plane: the horizontal sea is a data field (currents = relations, climate = domain manifold). Adds invariants 14–16, additive to architecture, awaiting ratification.
- `docs/depth-plan-v1.md` — the reconstructed v1 vertical world (sky/sea/seabed, ferryman, My Harbor, drift bottle, rituals; invariants 10–13 + 17), awaiting ratification like v2. Note the open tension with the atlas's cartographic altitude (ROADMAP §5).
- `docs/atlas-world-plan.md` — the world-map campaign (landed 2026-07-11): the **default L0** is a 4-layer semantic-zoom world (continents → named regions → islands → stations), one continuous camera, scale-tested at N=700.
- `docs/nested-vertical-world-v1-2026-07-11.md` (+ `vertical-archipelago-design-pass-2026-07-11.md`) — **current atlas contract**: vertical archipelago + nested exploration (anchor 主岛 / satellite 伴岛 progressive disclosure). Altitude is place-plane cartographic position, **never** ranking; anchors are navigation entries, not value.
- `docs/ROADMAP.md` — actual status vs P0–P4 and the prioritized next phases.
- `docs/DECISIONS.md` — slice-1 interpretations (dev-auth bypass…; its "L1 is SVG not Pixi" is historical — L0/L1 have since moved to Pixi with SVG fallback).
- `design/handoff/问题群岛-原型 v3.dc.html` — **sole visual authority**. Match its rendered output; don't port its internals. The trailing `<script>` is the interaction spec. Token changes need a breaking-change note; `#5A6C9E` (AI ink) is a deliberate component-level constant, not a token.

## Commands

```bash
pnpm install                                   # Node ≥22, pnpm ≥10
pnpm dev                                       # server :8787 + web :5173 (Vite proxies /api, /yjs)
pnpm -r test && pnpm -r typecheck              # all packages (518 tests; run per-package during dev)
pnpm --filter @frontier-isles/core test        # one package
pnpm --filter @frontier-isles/server exec vitest run test/server.test.ts -t "gateway"  # one test
pnpm --filter @frontier-isles/server seed      # idempotent; server auto-seeds an empty DB
pnpm --filter @frontier-isles/server mcp -- --island machine-curiosity --agent github:scout  # MCP stdio
```

- Reset data: `rm apps/server/data/isles.db*` (gitignored), then restart.
- Kill a stray dev server without self-matching the shell: `pkill -f 'src/index[.]ts'`.
- pnpm 10 blocks postinstall; native builds are allowlisted in root `pnpm.onlyBuiltDependencies`.
- E2E (optional): Playwright is preinstalled globally (`/opt/node22/lib/node_modules/playwright`, chromium at `/opt/pw-browsers/chromium`); assert against ledger `eventCount` via the API, use `force: true` for animated SVG.

## Architecture

**Workspace** — packages are just-in-time (`exports` → `src/index.ts`, no build step; Vite/tsx/vitest read TS source directly; typecheck per package):

```
packages/opp ← packages/core ← apps/server
    ↑              ↑          ← apps/web → packages/{assets, renderer, data}
```

opp = protocol · core = domain + projections + currents · renderer = iso + sea math · assets = SVG components + tokens · data = curated xfrontier atlas.

**Two-plane principle** (load-bearing): the knowledge plane is portable protocol data; the place plane is regenerable platform data. Separate streams, never mixed.

- Knowledge plane (`server/src/db.ts`): `problem_objects` (the `.md` is authoritative, parsed on demand via opp), `ledger_events` (append-only, hash-chained per island — **no UPDATE/DELETE paths**; a broken `prev` is a 409), `refs` (content-addressed; events carry `ref: sha256:…`, never inline content).
- Place plane: `stations`, `placements`, `memberships`, `capability_grants`. Chart coords + `domain` live in problem-object meta JSON, not in the OPP schema.
- **Everything the UI shows is a projection over events** (`core/src/projections.ts`, `core/src/currents.ts`): growth stages are earned (hut = first artifact, academy = ≥3 stations, school = publish/fork), dormancy from recency, tide N = A − D, **sea currents/whirlpools reduced from `bridge`/`fork`/`refute`/`validate`/`transplant`**. Never set these directly — change the events (`seed.ts`, anchored "night 86 = today").

**Sea plane** (v2, `depth-plan-v2.md`): the horizontal sea transcribes data — currents = typed/weighted/directional relation flows, climate = a continuous domain manifold (the 4 domains are named regions), sea depth = abstractness. Invariants 14–15: **no current without an event, and no "draw a link" tool** — the sea is a `reduce` over the ledger and adds zero new verbs. `web/SeaLayer.tsx` is hidden on the homepage pending the relations-lens rework (code + tests retained — ROADMAP §3.10); the relation channels users actually see today live in the default Pixi atlas: climate continents, named regions, and **air routes** (real ledger currents lifted into elevated arcs at mid/near zoom).

**Capability gateway**: `core.can()` + `core.degradeAction()` — an ungranted agent's station write degrades to a dock proposal (`night_digest` event + dock placement) instead of failing; humans get role-ladder checks. Enforced in `POST /events` **and** every MCP tool (`server/src/mcp.ts` imports the store directly, not HTTP). The dev-auth bypass logs the web client in as master `shen-kuo`; GitHub OAuth takes over when `GITHUB_CLIENT_ID/SECRET` are set (dev-login off only in `NODE_ENV=production`).

**Yjs**: the y-websocket wire protocol is hand-rolled in `server/src/yjs.ts` (lib0 not resolvable), wire-compatible with the standard client. Rooms: `island:<slug>` (presence), `island:<slug>:canvas` (whiteboard doc, folded into one ledger event when the room empties). §5 rule: CRDT only *inside* an artifact; spatial ops are server-ordered events — never mix the two.

**Web app** (`apps/web`): one state machine in `App.tsx` mirroring the prototype (`wipeMachine`/`ceremonyReducer` are pure + tested). Hard rules:

- **All network lives in `src/api/client.ts`**; `src/api/fallback.ts` + `seaFallback.ts` hold static data — the UI must render identically with the server absent (every call is best-effort).
- The L1 scene is **data-driven**: `scene/sampleIsland.ts` (bespoke) + `scene/generator.ts` (founded/curated islands) → `Scene.tsx` / `GeneratedScene.tsx` map kinds to `@frontier-isles/assets`. Don't draw scene SVG inline; extend `packages/assets`.
- Day/night swaps **palette only, never shape**: components paint `var(--x, dayFallback)`; night applies `NIGHT_SCENE_VARS` to the scene root.
- i18n: zh-CN + en with a **key-parity test**; UI strings via `t()`, editorial content (island names, questions, resident names, in-SVG captions) stays untranslated. Glossary = architecture §9.
- **L0 is the Pixi semantic-zoom atlas by default** (`chart/AtlasChartHost.tsx` → `renderer/pixi/atlas-stage.ts` + `atlas-lod.ts`; lazy-loaded, WebGL-detect, SVG `ChartScreen` fallback): one continuous camera T0 continents → T1 named regions → T2 islands → sail into L1. Vertical-archipelago rules: `altitudeZ` folds from place-plane N–S — **cartographic position, never ranking**; `assignAtlasHierarchy` picks each cluster's spatial-medoid **anchor** (navigation entry only), satellites disclose via `satelliteReveal` LOD and stay out of hit-testing until visible; air routes come only from real ledger currents (invariant 14). Scale tests: `?atlas=pixi&n=200|700` (honestly-labelled `syn-` corpus). Mobile is read-only: `buildMobileHierarchy` reduces the islands to ≤8 anchors, tap to disclose satellites; the list twin always shows every island.
- `packages/renderer` "." export is WebGL-free math (usable in tests/SSR); PixiJS lives behind `./pixi` and now powers both the default L0 atlas (`atlas-stage.ts`) and generated L1 scenes (`scene-stage.ts`).

**Design ↔ code loop**: `.design-eng-loop/` is the co-evolution contract (dual-axis engineering + taste rubric; `contract.md`/`contract.json`, rounds in `coevo.jsonl`); `design-system/*.html` are exported foundation + v2 cards. Canonical tokens live in `packages/assets/src/tokens.css`.

**Leavability** (§6): `GET /api/islands/:slug/problem.md` and `/ledger.jsonl` must always round-trip through opp's parser/verifier — keep those tests green when touching serialization.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read first

- `docs/architecture.md` — **source of truth** (v3.0). Three theses judge every decision; §7 invariants are non-negotiable (no XP/leaderboards, list twins everywhere, AI never pushes, ledger never GC'd…).
- `docs/DECISIONS.md` — interpretations made while building slice 1 (why L1 is SVG not Pixi, ferry-dock stub, dev-auth bypass…).
- `docs/ROADMAP.md` — actual status vs P0–P4 milestones and the prioritized next phases.
- `design/handoff/问题群岛-原型 v3.dc.html` — **sole visual authority**. Match its rendered output; do not port its internals. The `<script>` block at the end is the interaction spec (state shape, timings, ceremony flow). Token changes require a breaking-change note; `#5A6C9E` (AI ink) is deliberately a component-level constant, not a token.

## Commands

```bash
pnpm install                                   # Node ≥22, pnpm ≥10
pnpm dev                                       # server :8787 + web :5173 (Vite proxies /api and /yjs)
pnpm -r test && pnpm -r typecheck              # all packages (run per-package during dev)
pnpm --filter @frontier-isles/opp test         # one package
pnpm --filter @frontier-isles/server exec vitest run test/server.test.ts -t "gateway"  # one test
pnpm --filter @frontier-isles/server seed      # idempotent; server also auto-seeds an empty DB
pnpm --filter @frontier-isles/server mcp -- --island machine-curiosity --agent github:scout  # MCP stdio
pnpm --filter @frontier-isles/web build
```

- Reset data: `rm apps/server/data/isles.db*` (gitignored) and restart the server.
- Kill a stray dev server without self-matching the shell: `pkill -f 'src/index[.]ts'`.
- E2E (optional): Playwright is preinstalled globally — import from `/opt/node22/lib/node_modules/playwright/index.mjs`, launch with `executablePath: '/opt/pw-browsers/chromium'`. A reference drive script pattern lives in the session history; assert against ledger `eventCount` via the API, and use `force: true` when clicking SVG elements that carry CSS animations (Playwright never sees them "stable").
- pnpm 10 blocks postinstall scripts; native builds are allowlisted in root `package.json` `pnpm.onlyBuiltDependencies`.

## Architecture

**Workspace dependency flow** (packages are "just-in-time": `exports` point at `src/index.ts`, no build step — Vite/tsx/vitest consume TS source directly, so there is no build orchestration; typecheck per package):

```
packages/opp  ←  packages/core  ←  apps/server
     ↑                ↑          ←  apps/web  →  packages/assets, packages/renderer
```

**Two-plane principle** (the load-bearing idea): the knowledge plane is portable protocol data; the place plane is regenerable platform data. They live in separate streams and must never mix.

- Knowledge plane (`apps/server/src/db.ts`): `problem_objects` (the `.md` source is authoritative; parsed on demand via opp), `ledger_events` (append-only, hash-chained per island — there are deliberately **no UPDATE/DELETE code paths**; a broken `prev` is a 409), `refs` (content-addressed payloads — §5 ledger events carry only `ref: sha256:…`, never inline content).
- Place plane: `stations`, `placements`, `memberships`, `capability_grants`. Chart coordinates and `domain` live in problem-object meta JSON, not in the OPP schema (domain is not a protocol field).
- Everything the UI shows is a **projection** over events (`packages/core/src/projections.ts`): growth stages are *earned* by real events (hut = first artifact, academy = ≥3 distinct stations, school = publish/fork), dormancy from event recency, tide N = A − D. Never set these directly — to change what the chart shows, change the events (see `seed.ts`, whose story is anchored "night 86 = today" with relative timestamps).

**Capability gateway**: `core.can()` + `core.degradeAction()` — an ungranted agent's station write degrades to a dock proposal (`night_digest` event + dock placement) instead of failing; humans get role-ladder checks. Enforced in two places: `POST /events` and every MCP tool (`apps/server/src/mcp.ts`, which imports the store directly, not HTTP). The dev-auth bypass logs the web client in as seeded master `shen-kuo` so gateway-checked writes succeed; GitHub OAuth takes over when `GITHUB_CLIENT_ID/SECRET` are set (dev-login disabled only in `NODE_ENV=production`).

**Yjs**: the y-websocket wire protocol is hand-rolled in `apps/server/src/yjs.ts` (lib0 not directly resolvable) — wire-compatible with the standard client. Rooms: `island:<slug>` (awareness/presence), `island:<slug>:canvas` (whiteboard doc, folded into one ledger event when the room empties). Sync rule from §5: CRDT only *inside* an artifact; spatial ops are server-ordered events. Never mix the mechanisms.

**Web app** (`apps/web`): a single state machine in `App.tsx` mirroring the prototype (`wipeMachine`/`ceremonyReducer` are pure and tested). Hard rules:
- **All network lives in `src/api/client.ts`**; `src/api/fallback.ts` holds the prototype's static data. The UI must render identically with the server absent — every call is best-effort.
- The L1 scene is **data-driven**: `src/scene/sampleIsland.ts` (positions) → `Scene.tsx` (maps kinds to `@frontier-isles/assets` components). Don't draw scene SVG inline in the app; extend `packages/assets`.
- Day/night swaps **palette only, never shape**: components paint with `var(--x, dayFallback)`; night applies `NIGHT_SCENE_VARS` to the scene root. Keep this pattern for any new scene art.
- i18n: zh-CN + en with a **key-parity test**; UI strings via `t()`, user/editorial content (island names, questions, resident names, in-SVG captions) stays untranslated. Glossary in architecture.md §9 is the translation table.
- `packages/renderer` "." export is WebGL-free math (usable in tests/SSR); PixiJS lives behind `./pixi` and is not used by the app yet (DECISIONS item 3 — it's for the P3 700+-island atlas).

**Leavability** (§6): `GET /api/islands/:slug/problem.md` and `/ledger.jsonl` must always round-trip through opp's parser/verifier — there are tests for this; keep them passing when touching serialization.

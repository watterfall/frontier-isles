# Frontier Isles · Roadmap Assessment

_As of 2026-07-07, after build slice 1 (commits `6915d23…431601c`). Companion to `architecture.md` v3.0 §8; this file records **actual** status and the prioritized path forward. Verified by 111 unit tests + a 12-step Playwright end-to-end drive._

## 1 · Status vs milestones

| Milestone | Status | Evidence / gap |
|---|---|---|
| **P0 Protocol** | ✅ **Done** | `packages/opp`: hand-written `.md` validates and parses into all typed references (the literal acceptance test passes). Hash-chained ledger with tamper/reorder detection; `night_science` aggregates only from events. |
| **P1 Skeleton** | ◐ **~85%** | Renderer (full §2 contract + PixiJS 8 engine) ✅ · asset extraction ✅ · founding ceremony writes object + genesis events, island rises and persists ✅ · GitHub OAuth (state-bound, logout, session UI) ✅ pending real creds · Question Wall L2 ✅ · list twin ✅ · Yjs presence ✅. **Gap:** whiteboard co-editing has server rooms + ledger fold but **no canvas UI**; acceptance ("two people co-edit") not yet demonstrable. |
| **P2 Residents** | ◐ **~45%** (surfaces built, loops not closed) | Day/night replay timeline ✅ (ghost gating still scene-constant, not fully ledger-driven) · driftwood 6 atoms + dock 4 artifact types in core ✅ · transplant UI → real `transplant` event with `flow` ✅ (simplified: single event, not yet forced through a dock bridge-artifact) · MCP server 11 tools, auto-ledgered, driftwood-rights gateway **verified live** ✅ · morning-report HITL → real `adopt`(pair)/`return` events ✅. **Gaps:** literature scout not connected to CrossRef; claims/evidence rule (`refute/validate` must cite an evidence-role data ref) not enforced; night-digest webhook absent; tide computed but not visualized (awaiting design per §1). |
| **P3 Atlas** | ✗ Not started | Except: `.md` + `ledger.jsonl` export (leavability) already live. |
| **P4 Federation** | ✗ Not started | — |

**Cross-cutting invariants held:** no XP/leaderboards; list twin everywhere; AI never pushes (gateway degrades to dock proposal — e2e-verified); place events in a separate stream; dissolved-never-deleted encoded; bilingual UI from day one.

## 2 · Known debt (honest list)

1. **Only the sample island has an L1 scene.** Founded/seeded islands are chart-only. The scene is data-shaped (`scene/sampleIsland.ts`) but there is no generator from the place plane yet. This is the single highest-leverage gap: fixing it makes every island a *place*.
2. Whiteboard canvas UI missing (server side done).
3. Night replay ghosts/thresholds partly hardcoded to the seeded story; should render purely from `GET /events?upTo`.
4. L1 buildings don't yet reflect growth stage/level (chart does).
5. Claims/evidence linkage unenforced; `attach_data`/`attach_hardware`/`create_driftwood` map onto `night_digest` (no native ActionType — consider `opp/0.3` additions, which **is** a breaking protocol change and needs a change note).
6. Production hardening: session expiry/cleanup, rate limits, `secure` cookies behind TLS, single-process static serving of the built web app.
7. 555 kB single JS chunk (no code-splitting); in-SVG captions remain zh in EN mode (deliberate, documented).
8. Drizzle deferred (plain SQL); revisit when schema churn starts.

## 3 · Prioritized plan

### Phase A — close P1 (small; days)
- Whiteboard canvas UI (Yjs shared strokes on the existing `island:<slug>:canvas` room + fold-on-empty already server-side) → **P1 acceptance demo: two browsers, see each other, co-edit, replay ledger**.
- Presence names/positions in awareness (not just count).
- Deploy single process (Fly.io per §6.1): serve built web from the server, register the GitHub OAuth app, real creds, `NODE_ENV=production` (disables dev bypass), CI (GitHub Actions: `pnpm -r test && typecheck && build`).

### Phase B — close the P2 loop (the product's proof; weeks)
1. **L1 scene generator** from place-plane stations + growth projection (template layouts per stage; sample island keeps its bespoke scene). Founded islands become visitable; growth becomes visible (thesis 1).
2. **First real AI resident**: literature scout via CrossRef polling → `create_driftwood` through the MCP gateway → night-shift lamps from real events → morning report drafts generated from last night's ledger (not seeds).
3. Ledger-driven night replay end-to-end (ghosts typed from events; timeline = event index).
4. Transplant-through-dock: transplant produces one of the four bridge artifacts at the dock, then places at the target station ("all transplants pass through the dock").
5. Claims/evidence enforcement + steles before the Gallery.
6. Night-digest webhook (Slack/Matrix/Feishu).
7. **Acceptance (per §8):** one island runs AI night shift → morning report → bridge → transplant → claim → publication, every step ledger-traceable.

### Phase C — P3 atlas (scale + interop)
- xfrontier seeding + nine-dimension score → island form params; outlier glow from real variance.
- Bridges + ferryman routing economy (biddable open problems over MCP).
- Swap L0/L1 rendering to the PixiJS engine at >100 islands (contract + thumbnails already built); chart layout = hybrid cluster algorithm (§8 open decision 5).
- ORCID, Typst/PDF + Zenodo DOI export, OKH/RO-Crate bidirectional search, Merkle anchoring (OpenTimestamps).

### Phase D — P4 federation
- ActivityPub follow, Open Night 开放之夜 + badge, multi-agent division of labor, optional on-chain notarization.

## 4 · Open decisions (need a human call; none block Phase A)
1. Final name (问题群岛 / 格致群岛 / …) — affects domain, OAuth app, repo name.
2. Night-layer default visibility norm (island-members vs public).
3. Default licenses (suggest CC-BY-4.0 + MIT, per spec).
4. How founded islands get L1 scenes: fixed template vs procedural from station layout (Phase B item 1 prototype will inform this).
5. `opp/0.3`: native actions for `attach_data/attach_hardware/create_driftwood`? (breaking; needs change note per design-authority rule).
6. Agent identity registry: keep `github:` prefixes vs `did:` for AI residents.

## 5 · Session log
- Slice 1 (this repo's first 5 commits): monorepo, protocol, domain, renderer, assets, server, web, OAuth; all milestones' evidence above.

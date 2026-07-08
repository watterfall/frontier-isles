# Frontier Isles · Roadmap Assessment

_As of 2026-07-09, after the v2 「海即数据」 sea-plane and the scene generator landed (main @ `8de5306`). Companion to `architecture.md` v3.0 §8 and `depth-plan-v2.md`; this file records **actual** status and the prioritized path forward. Verified by **178 unit tests** across 6 packages/apps (`pnpm -r test`, all green)._

## 1 · Status vs milestones

| Milestone | Status | Evidence / gap |
|---|---|---|
| **P0 Protocol** | ✅ **Done** | `packages/opp`: hand-written `.md` validates and parses into all typed references; hash-chained ledger with tamper/reorder detection; projections aggregate only from events. |
| **P1 Skeleton** | ◐ **~90%** | Renderer + PixiJS engine ✅ · asset extraction ✅ · founding ceremony writes object + genesis events, island rises and persists ✅ · GitHub OAuth (state-bound, logout, session UI) ✅ pending real creds · Question Wall L2 ✅ · list twin ✅ · Yjs presence ✅ · **scene generator → founded/curated islands are enterable** ✅ (Track B self-build). **Single remaining gap:** whiteboard co-editing has server rooms + ledger fold but **no canvas UI** — the "two people co-edit" acceptance isn't demonstrable yet. |
| **P2 Residents** | ◐ **~55%** (loops opening, not all closed) | The old #1 debt — no L1 scene for founded islands — is **closed**: `scene/generator.ts` builds a scene from the place plane + growth projection, so every island is now a *place* (thesis 1 made visible). Relations are visible too: the **sea-plane currents** project `bridge/fork/merge_back/refute/validate/transplant` into flowlines with a flow legend + focus salience, live from the real ledger in ChartScreen (**now hidden on the homepage** pending a relations-representation rework — code + tests retained, not rolled back; §3.10). Also: driftwood 6 atoms + dock 4 artifacts ✅ · transplant → real event ✅ · MCP 11 tools, gateway verified live ✅ · morning-report HITL → real `adopt`/`return` events ✅ · D2 navigation + D3 endings ✅. **Gaps:** literature scout not wired to CrossRef; claims/evidence rule unenforced; night-digest webhook absent; transplant still a single event (not forced through a dock bridge-artifact); whirlpool is projected in core + API-served but not yet rendered. |
| **P3 Atlas** | ◐ **~20%** (foundations laid via v2) | `packages/data` = curated xfrontier atlas (26 real frontier islands + bridges + sea data); 27 unlocked on the chart (26 + the sample island). The v2 sea-plane **is** the atlas legibility layer: climate = a continuous domain manifold (the 4 domains become named regions), with archipelago clustering / confluence / straits specified in `depth-plan-v2.md` and renderer sea-math (`renderer/sea.ts`) built. **Gaps:** PixiJS swap at >100 islands not wired; ferryman routing economy; ORCID / DOI export / Merkle anchoring. Leavability (`.md` + `ledger.jsonl` export) already live. |
| **P4 Federation** | ✗ Not started | — |

**Cross-cutting invariants held:** no XP/leaderboards; list twin everywhere; AI never pushes (gateway degrades to dock proposal — e2e-verified); place events in a separate stream; dissolved-never-deleted; bilingual UI (key-parity test); **the sea is data too** (invariant 14 — every current/climate band transcribes a ledger relation or domain vector; there is no "draw a link" tool).

## 2 · What shipped since the 2026-07-07 assessment

1. **Scene generator** (`scene/generator.ts` + `GeneratedScene.tsx`, 6 tests) — founded and curated islands now render a full L1 scene from the place plane + growth stage. This closes the single highest-leverage gap; Track B ("self-build" founded islands) is enterable.
2. **`packages/data`** — a curated xfrontier atlas of 26 real frontier islands (`frontiers.ts`) plus `bridges.ts` and `sea.ts`; 27 unlocked on the chart, i.e. 26 + the sample (was: sample only).
3. **v2 「海即数据」 sea-plane** — the horizontal sea becomes a live data field, not backdrop. `core/currents.ts` (`projectCurrents` / `projectWhirlpools`), `renderer/sea.ts`, `assets/sea/*` (Current, ClimateField, SeaDepth, FlowLegend, RelationsList) and `web/SeaLayer.tsx` render currents + climate depth + flow legend + focus salience live from the ledger. Adds invariants 14–16 (`depth-plan-v2.md`). **Update:** these sea-plane visuals are now hidden on the homepage pending a relations-representation rework — code + tests retained, not rolled back (§3.10).
4. **`.design-eng-loop/`** — an adversarial multi-round design↔code co-evolution contract (dual-axis engineering + taste rubric, maximin floor-raising, 5 rounds logged in `coevo.jsonl`); `design-system/` holds 22 foundation + v2 dimension cards.
5. Bilingual sample-island editorial content, richer hover cards, de-abstracted UI.

## 3 · Known debt (honest list)

1. **Whiteboard canvas UI missing** — server rooms + fold-on-empty done; no drawing surface. Now the single P1 blocker.
2. **Sea-plane only partly rendered** — currents / climate / depth / legend / focus are live; whirlpool is projected + API-served but not drawn; strait/isthmus, confluence/estuary, trade wind, and archipelago clustering are specified in `depth-plan-v2.md` + design-system cards but not yet built as components.
3. Night replay ghosts/thresholds partly hardcoded to the seeded story; should render purely from `GET /events?upTo`.
4. L1 buildings don't yet reflect growth stage/level (the chart does).
5. Claims/evidence linkage unenforced; `attach_data`/`attach_hardware`/`create_driftwood` map onto `night_digest` (no native ActionType — an `opp/0.3` addition would be a breaking protocol change needing a change note).
6. Literature scout not connected to CrossRef (no real AI resident feeding the night shift yet).
7. Production hardening: deploy (single process), session expiry/cleanup, rate limits, `secure` cookies behind TLS.
8. Single JS chunk (no code-splitting); in-SVG captions remain zh in EN mode (deliberate, documented).
9. Drizzle deferred (plain SQL); revisit when schema churn starts.
10. **Relations rework — deferred, not dropped.** The sea-plane relation visuals (currents / whirlpools / straits / isthmus / hardcoded bridges / lineage line / flow legend / the 关系海 RelationsList sidebar), plus the domain-category UI and several numeric readouts, are now **hidden on the homepage**. The code (`apps/web/src/components/chart/SeaLayer.tsx`, `packages/core/src/currents.ts`, `packages/renderer/src/sea.ts`, `packages/assets/src/sea/*`) and its tests are **retained** — a rework-later decision, not a rollback. Reason: always-on, the relation layer read as cluttered/occluding on the chart, and the relation model itself lacks a good representation + interaction plan. Rework must find a better form — candidates: an on-demand **relations lens** (a toggle, not always-on), LOD-gated currents, focus-only reveal, or the `depth-plan-v2.md` taxonomy rendered more legibly. Tracked as a P2/P3 item (Phase C).
11. **Canvas scaling** — the chart is a single fixed SVG (1440×900) with hand-placed coordinates, no zoom/pan, no LOD/culling; islands already overlap at 27 and the practical ceiling is ~mid-30s. The scaling plan (deterministic de-overlap → zoom/pan → LOD + variance-select culling → My Harbor + 雾化 fog → PixiJS beyond ~100 islands) is the P3 atlas track — see Phase C.
12. **Richness followed v2, skipped v1.** The build shipped v2 (horizontal sea-as-data) but never v1's vertical world (sky / sea / seabed = epistemic groundedness), terrain-fingerprint procgen, ritual moments (river lantern 河灯 on publish / storm on dispute / rainbow on resolution / ~8s transplant walk), drift bottle 漂流瓶, resident tree 居民之树, citation birds 候鸟, or My Harbor 我的港湾. Future "more fun / more inviting" richness should re-anchor on `depth-plan-v1.md` — homepage decluttering alone cannot supply it. Like v2, v1 folds into `architecture.md` on ratification (§5.6).

## 4 · Prioritized plan

### Phase A — close P1 (small; days)
- **Whiteboard canvas UI** on the existing `island:<slug>:canvas` room (fold-on-empty already server-side) → P1 acceptance: two browsers, see each other, co-edit, replay from the ledger.
- Presence names/positions in awareness (not just a count).
- **Deploy** single process (Fly.io per §6.1): serve the built web from the server, register the GitHub OAuth app + real creds, `NODE_ENV=production` (disables dev bypass), CI (`pnpm -r test && typecheck && build`).

### Phase B — close the P2 loop (the product's proof; weeks)
1. **First real AI resident**: literature scout via CrossRef → `create_driftwood` through the MCP gateway → night-shift lamps from real events → morning report drafted from last night's ledger (not seeds).
2. Ledger-driven night replay end-to-end (ghosts typed from events; timeline = event index).
3. Transplant-through-dock: transplant produces one of the four bridge artifacts at the dock, then places it at the target station.
4. Claims/evidence enforcement + steles before the Gallery.
5. Night-digest webhook (Slack / Matrix / Feishu).
6. **Acceptance (§8):** one island runs AI night shift → morning report → bridge → transplant → claim → publication, every step ledger-traceable.

### Phase C — P3 atlas (relations rework + canvas scaling + interop)
- **Relations rework — a better form, not "render more sea-plane"** (§3.10): the always-on sea-plane relations are now hidden, so the goal is no longer to add more always-on flow visuals but to re-form the relation layer as an **on-demand relations lens** (toggle / focus-only / LOD-gated). Only then decide which of whirlpool (data already projected), strait/isthmus (relation maturity), confluence/estuary (cross-domain synthesis), trade wind, and archipelago auto-clustering earn a place — graduating survivors from design-system cards to live components via the design-eng-loop.
- **Canvas scaling** — answers "one canvas can't hold many islands" (§3.11). Per `depth-plan-v1.md` §3: (a) deterministic layout / de-overlap pass (started in this change); (b) zoom + pan camera; (c) LOD cartographic generalization with variance-select culling (far = coastline + lighthouses + outlier glow; mid = named clusters; near = full islands); (d) My Harbor 我的港湾 default entry + 雾化 fog filter; (e) swap L0 to the PixiJS engine (already built behind `packages/renderer/./pixi`, contract + thumbnails done) beyond ~100 islands; hybrid cluster layout (§8 open decision 5).
- xfrontier nine-dimension score → island form params; outlier glow from real variance.
- Bridges + ferryman routing economy (biddable open problems over MCP).
- ORCID, Typst/PDF + Zenodo DOI export, OKH/RO-Crate search, Merkle anchoring (OpenTimestamps).

### Phase D — P4 federation
- ActivityPub follow, Open Night 开放之夜 + badge, multi-agent division of labor, optional on-chain notarization.

## 5 · Open decisions (need a human call; none block Phase A)
1. Final name (问题群岛 / 格致群岛 / …) — affects domain, OAuth app, repo name.
2. Night-layer default visibility norm (island-members vs public).
3. Default licenses (suggest CC-BY-4.0 + MIT).
4. `opp/0.3`: native actions for `attach_data`/`attach_hardware`/`create_driftwood`? (Breaking; needs a change note.)
5. Agent identity registry: keep `github:` prefixes vs `did:` for AI residents.
6. Ratify `depth-plan-v2.md` invariants 14–16 into `architecture.md` once the sea-plane proves out (in its reworked on-demand form, §3.10) — and, once adopted, fold `depth-plan-v1.md`'s vertical world in the same way (§3.12).

## 6 · Session log
- **Slice 1** — monorepo, protocol, domain, renderer, assets, server, web, OAuth (`6915d23…431601c`).
- **Slice 2** — curated xfrontier atlas + scene generator + Track B founding (`0e7c052…aebf3c6`).
- **Slice 3** — v2 「海即数据」 sea-plane + `.design-eng-loop` co-evolution (`7c97979…8de5306`).

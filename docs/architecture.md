# Frontier Isles 问题群岛 · Architecture v3.0

An isometric open-science collaboration platform. Anyone can **found an island** — a virtual lab anchored on one frontier challenge question. Research output grows as visible architecture; the whole process is open by default.

**Position**: a standalone platform speaking **OPP (Open Problem Protocol)**. Ecosystem peers (personal workbenches, doc systems, the xfrontier atlas, any AI agent) connect via three protocol surfaces only — problem-object `.md` files, the ledger format, and MCP. Never via shared code.

**Three theses** (the judge of every decision):
1. **Research state is architecture** — progress is visible as space; buildings grow only from real ledger events.
2. **Day / Ferry / Night is knowledge production** — Night 夜 = divergence, Bridge 渡 = translation, Day 昼 = validation; the day/night toggle is the signature interaction.
3. **The archipelago is the atlas** — the macro view is a navigable sea chart of problems; an island is the spatial rendering of an `op://` problem object.

**Two-plane principle**: the knowledge plane (problem object + ledger + references) belongs to the protocol — portable, exportable. The place plane (layout, footprints, presence) belongs to the platform — regenerable. Lose the platform, lose nothing that matters.

**Bilingual product**: UI ships in zh-CN and en as equals. User content is never auto-translated.

---

## 1 · Design authority

- `design/handoff/问题群岛-原型 v2.dc.html` is the **sole authority** for visuals and motion. It contains the full token sheet (`--fi-*` dual day/night palette), typography, and motion specs — extract verbatim into `tokens.css`. Day/night swaps palette only, never shape.
- The prototype is a design-tool artifact: match its rendered output and behavior; do not port its internals.
- Island scenes must be **data-driven**: tiles, stations, artifacts are data consumed by the renderer. Extract the prototype's hand-drawn SVG into parameterized components (`packages/assets`). No hardcoded scenes.
- Awaiting design v3 (do not invent visuals for these; stub minimally): ferry dock station, lighthouse/mist-island states, tide (N(t)), typed ghost atoms, multi-presence & AI-resident identity.

## 2 · Stack (decided)

pnpm monorepo · Node 22 LTS · TypeScript strict.

```
apps/web        Vite + React + PixiJS 8   (L0 chart / L1 island / L2 panels)
apps/server     Hono + y-websocket + SQLite (drizzle) + MCP server
packages/opp    protocol: problem-object & ledger schemas (zod) + validators
packages/core   domain types · capability tables · projections
packages/renderer  isometric engine
packages/assets    parameterized SVGs from the prototype
```

L2 documents: BlockNote + Yjs (Claim/Evidence as custom blocks). Auth: GitHub OAuth now, ORCID at P3. Deploy as a single process; island = natural shard.

Renderer contract: 2:1 tiles 128×64 · `sx=(gx−gy)·64, sy=(gx+gy)·32` · picking by inverse matrix + pixel mask · depth by `(gx+gy)` anchor, multi-tile buildings sliced · chunked with viewport culling · L0 thumbnails prerendered.

## 3 · Domain

**Nine stations**: Question Wall 问题墙 (QFT; the island's genesis) · Data Bench 数据台 (dataset refs: input/output/evidence/replication) · Whiteboard Hall 白板厅 · Library 文献阁 · Workshop 实验坊 (runnable artifacts + hardware refs: instrument/fabrication/sensor) · Gallery 展厅 (Day curation; sole source of the daytime view and publication) · Tearoom 茶寮 (never metricized) · Driftwood Garden 散木园 (Night wilds: six atom types — thought/question/metaphor/sketch/contradiction/thought-experiment; AI's default landing; private by default) · **Ferry Dock 渡口** (Bridge layer: four artifact types — analogy-mapping/hypothesis-formalization/concept-prototype/design-fiction; all transplants pass through; morning reports issue here; the ferryman berths here).

**Roles**: visitor → apprentice → researcher → resident → master 山长; promotion is peer-confirmed, never automatic. **AI residents**: literature scout · devil's advocate · synthesizer · ferryman 摆渡人 (the only cross-island agent; bridge-proposal rights only). Humans and agents share one permission model, distinguished by actor kind.

## 4 · Mechanics

- **Founding ceremony**: creating a lab is one QFT round → QFocus; writes the problem object + genesis event; the island rises from the sea. The ceremony itself lives forever in the night layer.
- **Growth & endings**: empty isle → hut → academy → school, driven only by ledger events. Dormant islands grow moss and mist. `dissolved` → mist island (never deleted; the ledger is never GC'd). `resolved` → lighthouse.
- **Day / Ferry / Night**: day = curated projection; night = full ledger replay on a draggable timeline, ghosts typed by atom; the dock persists through both. Tide/moon subtly reflects N(t) = A − D — no dashboards. Night layer is member-visible by default; a master may declare an Open Night 开放之夜.
- **Driftwood → Dock → Station**: transplant 移栽 always passes the dock, forming one of the four bridge artifacts; "once driftwood" marks persist. Track transplant rate and the six cross-layer flows (hypothesis-output / anomaly-input / constraint-transfer / metaphor-bridge / question-return / method-transfer) as insight, never as leaderboard.
- **Claims & evidence**: claims are first-class artifacts (steles before the Gallery); `refute/validate` events must reference an evidence-role data ref; a replication ref is one countable reproduction.
- **Fork / merge / bridges**: fork = derive a child problem object (lineage drawn on the chart); merge-back gifts artifacts to the parent; bridges are proposed by members or the ferryman, ratified by both masters.
- **Night shift & morning report**: humans work the day, AI works the night. Each dawn the dock issues a morning report — proposals for adopt/modify/return, full HITL chain into the ledger.
- **AI governance**: default agent capabilities = propose + driftwood-write only; the only path into formal stations is human transplant. Station-write may be granted by a master via public event. Agents never push — they leave things at stations. Every agent tool call auto-writes a ledger event with agent identity and `credit:ai/*` roles.
- **Routing economy**: open problems are a biddable task source over MCP; recommended utility favors low-heat, high-substrate, uneven profiles. The ferryman's route follows it.

## 5 · Protocol (contracts)

**Problem object** — one `.md`; front-matter is the machine contract, body is free prose (`## Night` / `## Bridge` / `## Day claims` / `## Open sub-questions`):

```yaml
schema: opp/0.2
id: op://<org>/prob/<slug>
title: …
status: open | active | dissolved | resolved
qfocus: |
  …                              # the question, never the answer
lineage: { parent: op://…, children: [] }
frontier: { heat: 0.32, substrate: 0.81, mode: variance-select, score_ref: … }
hardware: [{ manifest: <OKH url>, role: instrument|fabrication|sensor, hash: sha256:… }]
data:     [{ ro_crate: <url>, role: input|output|evidence|replication, hash: sha256:… }]
night_science: { A: 0, B: 0, D: 0 }   # aggregated from ledger; never hand-edited
agents:   [{ id: did:…|orcid:…, capabilities: [propose, driftwood_write] }]
ledger: events://<op-id>
license: CC-BY-4.0
```

**Ledger event** — append-only; the sole source of attribution truth:

```json
{ "ts": "…", "op": "op://…",
  "actor": { "id": "orcid:…|did:…|github:…", "kind": "human|agent|pair" },
  "credit": ["conceptualization", "credit:ai/literature_synthesis"],
  "phase": "A|B|D",
  "action": "found_island|propose_subquestion|bridge_artifact|submit_claim|refute|validate|transplant|return_to_driftwood|publish|adopt|fork|merge_back|bridge_propose|bridge_accept|grant_capability|night_digest",
  "flow": "metaphor-bridge|…",
  "ref": "sha256:…", "prev": "sha256:…", "sig": "ed25519:… (optional)" }
```

`prev` hash-chains events; periodic Merkle-root anchoring (OpenTimestamps) gives tamper evidence without a chain; on-chain notarization is optional headwear, never foundation. Contribution profiles are a `reduce` over the ledger.

**Place plane** (platform DB, separate stream — footprints never pollute the ledger): `Station(kind incl. dock, pos, level)` · `Placement` · `Footprint` (sampled → path heatmap) · `GrowthState` (projected) · `Membership`.

**Sync rule**: spatial ops are server-ordered events (no merge problem); only intra-artifact editing uses CRDT (one Yjs doc per artifact, folded into ledger events at semantic boundaries: save/transplant/publish). Awareness is ephemeral. Never mix the two mechanisms.

## 6 · Interop (all via `.md` / ledger / MCP)

GitHub OAuth → ORCID (identity) · OKH/LOSH manifests (hardware; search indexes problems **and** hardware bidirectionally) · RO-Crate (data roles; evidence backs claims) · GitHub artifact cards · Typst/PDF export + Zenodo DOI (publication) · CrossRef + W3C Web Annotation (literature) · Slack/Matrix/Feishu webhooks (night digest; the platform is not an IM) · outbound MCP (personal workbenches mount "my archipelago"; ledger is `events.jsonl`-isomorphic) · ActivityPub (P4, exploratory) · full export = the `.md` itself + RO-Crate (**an open platform must be leavable**).

**MCP tools** (platform + island scope; every call auto-ledgered): `list_open_problems · read_problem · read_station · read_qfocus · propose_subquestion · bridge_artifact · attach_data · attach_hardware · submit_claim · refute · create_driftwood`. Gateway enforces driftwood rights: an unauthorized agent's `submit_claim` degrades to a dock proposal.

## 7 · Invariants

1. No XP, points, badge stores, or leaderboards.
2. Async is the default; realtime is an encounter, never a requirement.
3. Reference + hash + preview only; artifacts live in their native homes.
4. No algorithmic feeds — discovery is the chart, bridges, the ferryman, and search.
5. Every spatial object has a list twin; space is never the only path.
6. AI never pushes; agent station-write requires a public grant event.
7. All knowledge writes are ledger events; all reads are projections; place events stay in their own stream.
8. Dissolved is never deleted; the ledger is never GC'd; **a bold question later refuted counts as positive contribution** (A-phase weighted) — otherwise the system decays into rewarding safe convergence.
9. Bilingual UI (zh-CN / en) from day one: all strings externalized; load-bearing terms follow the glossary (§9); user content untranslated.

## 8 · Milestones

| Phase | Scope | Acceptance |
|---|---|---|
| **P0 Protocol** | `packages/opp`: schemas + validators | A hand-written `.md` validates and parses into all typed references |
| **P1 Skeleton** | renderer + asset extraction · founding ceremony (object + genesis event) · GitHub login · Yjs presence + whiteboard co-editing · Question Wall L2 · list twin | Two people on one island from different machines: see each other, co-edit, replay the full ledger |
| **P2 Residents** | ledger-driven day/night replay + tide · driftwood (6 atoms) + dock (4 artifacts) + transplant · MCP server · first AI resident (literature scout, CrossRef) · morning report HITL · claims/evidence · night-digest webhook | One island runs the full chain: AI night shift → morning report → bridge → transplant → claim → publication, every step ledger-traceable |
| **P3 Atlas** | xfrontier seeding + score backfill · OKH/RO-Crate + bidirectional search · bridges + ferryman · ORCID · Zenodo DOI · Merkle anchoring · full export | 700+ islands render smoothly; one search returns problems and hardware; the ferryman lands its first bridge |
| **P4 Federation** | ActivityPub · Open Night · multi-agent division of labor · optional on-chain notarization | An island can be followed from an external platform |

## 9 · Glossary (load-bearing terms; the sole source for translations)

散木 driftwood · 散木园 Driftwood Garden · 移栽 transplant · 渡口 Ferry Dock · 摆渡人 ferryman · 山长 master · 昼/夜 Day/Night · 渡 Bridge/Ferry layer · 魂影 ghost · 晨报 morning report · 夜报 night digest · 开放之夜 Open Night · 问题墙 Question Wall · 展厅 Gallery · 茶寮 Tearoom · 建岛仪式 founding ceremony · 灯塔 lighthouse · 雾岛 mist island · 潮汐 tide · 小径 desire path · 界画 jiehua (ruled-line painting; the visual lineage) · QFocus (from QFT, Question Formulation Technique).

---

*v3.0 supersedes all prior versions. Anything unspecified: infer from the three theses and the invariants; product-level decisions (defaults, visibility, naming) — stop and ask. Store as `docs/architecture.md`; visual authority at `design/handoff/`.*

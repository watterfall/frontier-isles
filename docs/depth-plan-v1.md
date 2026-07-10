# Frontier Isles · Depth & Richness Plan v1 — 垂直世界 The World Has Depth

> **Status (reconstructed 2026-07-10).** This document was cited in six places — `ROADMAP.md` §3.12 / §4 / §3.11, `depth-plan-v2.md`'s header and §3, `INFO-HIERARCHY.md` — but had **never been written to disk**; the vertical world, terrain fingerprint, landing ceremony, ritual moments, and the living inhabitants lived only inside those references. This reconstruction makes them canonical without changing anything the references already committed to. **Additive only.** Companion to `architecture.md` (v3.0) and the horizontal sister plan `depth-plan-v2.md`. Everything already frozen — the prototype composition, `--fi-*` tokens, architecture invariants 1–9, and v2's entire horizontal world (currents / climate / archipelago) — stays frozen. This plan folds into `architecture.md` §5.6-style on ratification, exactly as v2 will.
>
> Section numbers are load-bearing: §2 = the ferryman, §3 = My Harbor & cartographic generalization, §4 = the drift bottle — because existing docs already point at those numbers. Invariants **10–13** (v1's original frozen four, referenced since v2) are stated in **§8**; this reconstruction newly articulates invariant **17** (14–16 belong to v2).

## 0 · Trigger & the one-sentence thesis

v2 made the **horizontal** sea first-class: the water *between* islands became a relational-domain field. This plan is its mirror and its elder: v1 makes the **vertical** axis first-class — **altitude = epistemic groundedness**. An island is not a flat sprite on blue; it is a column of knowledge state, from the open questions floating in its sky down to the settled evidence in its seabed. Same discipline both directions (invariant 10): *every visual is a data transcription*, now applied to the axis that answers "how sure are we?" rather than "how is this connected?"

The failure this guards against is decoration. "Make it prettier / more inviting" (ROADMAP §3.12) cannot be answered by homepage decluttering — it is answered by giving the third dimension a *meaning* so that looking longer teaches you more, and by a handful of **ritual moments** that make cause visible in place of a score.

## 1 · The vertical world 垂直世界 — sky / sea / seabed

One island, three epistemic strata. This is the headline; everything else in the plan hangs off it.

**天空 Sky — vision & open questions.** What the island *aspires to and does not yet know*. The higher and lighter, the more unresolved.
- ① **Data source** — `qfocus` (the frontier question itself), `propose_subquestion` events (open sub-questions), open `refute` with no matching `validate`, `status: open`.
- ② **LOD** — L0: an island that is mostly sky reads as *tall / floating high* in silhouette. L1: sub-questions drift as motes above the roofline. L2: n/a.
- ③ **Interaction** — click a drifting question → its Question-Wall card (list twin). On-demand; the sky is ambient until asked.
- ④ **Removal test** — remove the sky stratum and the island's open questions are still on the Question Wall and in `GET …/problem.md`. The stratum is a *reading of altitude*, not the record.

**海面 Sea surface — work in progress.** The waterline is *now*: what is actively being worked.
- ① **Data source** — recent ledger activity (day events within the recency window used for dormancy), claims not yet validated, driftwood in flight, member presence (place plane).
- ② **LOD** — L0: surface bustle reads as an island's liveliness vs. moss/mist dormancy (already projected). L1: the active stations, docked driftwood, in-progress claims. L2: the station interior.
- ③ **Interaction** — the day/night toggle (thesis 2) scrubs the surface through the ledger timeline; the waterline is where that scrub lands.
- ④ **Removal test** — remove the surface treatment and activity is still legible from the ledger replay and the station list. It is the felt "present tense," not new data.

**海底 Seabed — settled evidence.** Below the water: what has been *validated and will not move*. The deeper the sediment, the more grounded the island.
- ① **Data source** — `validate` events carrying an evidence-role data ref, `publish` events, replication refs (a countable reproduction, architecture §4), `status: resolved`.
- ② **LOD** — L0: a deep, dark seabed reads as a *low, solid, grounded* island (and a resolved one flies a lighthouse). L1: sediment strata / steles below the Gallery. L2: the evidence ref on a claim.
- ③ **Interaction** — click a sediment layer → the stele / evidence ref (reference + hash + preview only, invariant 3).
- ④ **Removal test** — remove the seabed and the validated claims are still steles and still in the ledger. Depth is a *reading of groundedness*, never the store of it.

**影锚 Shadow anchor.** A floating island is ambiguous — is it high, or is the camera low? The shadow cast onto the water plane, and the taut tether between hull and shadow, make altitude *readable*: a well-grounded island sits almost on its shadow; a speculative, sky-heavy one floats high with a long tether. ① Projection: groundedness ratio = settled evidence vs. open questions (reduce over the events above), of a piece with night-science `D` (deduction/validation) against `A` (abduction). ② L0–L1 (the anchor scales with the island). ③ Non-interactive; a pure depth cue. ④ Remove it and altitude still exists but reads worse — the anchor is legibility, not content.

**登临 Landing ceremony.** The drill-down from L0 atlas to L1 island is not a hard cut but an *arrival* — the existing sail-in animation (`atlas→island`), the island rising into full detail, its live day/night and tide state resolving as you approach. ① It transcribes the view transition plus the island's current projection — **no new event, no new data** (this is why it is honest). ② It *is* the L0→L1 seam; it is the vertical counterpart to INFO-HIERARCHY's "连续制图下钻." ③ Triggered by navigation; skippable (respects reduced-motion). ④ Remove it and a hard cut still lands you at L1 — you lose felt continuity, nothing else.

**Why not fewer strata.** Two would collapse either "aspiration vs. now" or "now vs. proven" — and those are exactly the two distinctions a researcher reads an island *for*. Three strata map one-to-one onto the three phases the whole platform already runs on (Night divergence / Day validation, with the surface as the live present). Fewer loses a phase; more invents distinctions the ledger cannot back.

## 2 · The ferryman & the currents 摆渡人与洋流

The **structural, cold** serendipity channel — deterministic, not random (contrast §4). The ferryman 摆渡人 is the only cross-island agent (architecture §3), with bridge-proposal rights only; the currents are the routes between islands he rides.
- ① **Data source** — `bridge_propose` / `bridge_accept`, `transplant`, `fork` / `merge_back`, and the routing-economy utility (low-heat × high-substrate × uneven profile, architecture §4). No new verb. *(v2 elevated these same currents into the whole horizontal sea-as-data field; v1's scope is the ferryman riding them, per `depth-plan-v2.md` §3.)*
- ② **LOD** — L0: the ferryman's wake between islands, trunk routes only at far zoom. L1: the dock 渡口 where he berths and issues morning reports.
- ③ **Interaction** — click a route → the bridge artifact or proposal it carries; the ferryman's next hop is his routing utility, inspectable, never a black-box feed (invariant 4).
- ④ **Removal test** — remove the visual and bridges/transplants are still ledger events with list twins. The ferryman *dramatizes* routing; he does not gate it.

## 3 · My Harbor 我的港湾 & cartographic generalization

The horizontal-scaling origin these numbers are cited for (ROADMAP §3.11 / Phase C(b–e); INFO-HIERARCHY §69 pins this as §3). **This section is now the design source; the executable staging and acceptance live in `INFO-HIERARCHY.md` (C1–C3) — that document is authoritative for how, this one for why.** Do not duplicate it; the pointers below keep them in sync.

The chart is one fixed 1440×900 SVG with hand-placed coordinates — 27 islands already overlap, the ceiling is the mid-30s (ROADMAP §3.11). The cure is not "draw more" but "layer by scale": **information shown = f(zoom, local density, variance-select priority)** — semantic LOD, the same principle the shipped L1 name-plate LOD already proves.

- **(a) Deterministic de-overlap layout** — a stable, replayable spreading pass (started in the declutter commit). Same inputs → same layout (invariant 13).
- **(b) Zoom / pan camera** — prerequisite; the fixed SVG has no camera. Met by swapping L0 to the PixiJS engine (built, thumbnails passing) beyond ~100 islands.
- **(c) LOD cartographic generalization** — far = coastline + lighthouses + outlier glow; mid = named clusters (archipelagos, v2 §4); near = full islands. Culling is **variance-select**, so outliers always float above the bulk (reusing the sea-math ranking).
- **(d) My Harbor 我的港湾 default entry + 雾化 fog** — you do not cold-open the whole 700-island ocean. You open *at your harbor* — your islands, memberships, drift-bottle shore — and the far ocean is fogged, lifting as you sail out. The fog is a focus filter, not a wall (everything stays reachable — invariant 4).
- ① **Data source** — My Harbor = your memberships + founded/forked islands + capability grants (place plane). Fog = camera distance × your engagement, a pure view function. Generalization tiers = variance-select over frontier score / activity (knowledge plane). ② L0 end-to-end. ③ Sail out to lift fog; ≤3 zoom levels from atlas to any island (INFO-HIERARCHY §6 acceptance). ④ Remove My Harbor/fog and the full chart still works — you lose the *gentle entry*, not any island; the list twin (invariant 5) is always the flat fallback.

## 4 · The drift bottle 漂流瓶

The **warm, random** serendipity channel — the deliberate counterweight to §2's cold structure (this is the split `depth-plan-v2.md` §3 names: "the drift bottle (v1 §4) remains the warm/random channel"). A bottle washes onto your shore carrying *someone else's* driftwood atom or open question from an unrelated island.
- ① **Data source** — a uniformly-**random** (seeded, replayable) sample of `create_driftwood` atoms or `qfocus` from islands you have no path to. Reference + hash + preview only (invariant 3); the bottle links, it never copies content.
- ② **LOD** — L1: bottles beach on your island's shore. L0: bottles bob on the open sea near My Harbor.
- ③ **Interaction** — click to open the source atom / island; opt-in, transient — you are never fed a queue.
- ④ **Removal test** — remove it and discovery still runs on the chart, bridges, the ferryman, and search (invariant 4's four channels). You lose serendipity, not reach. Note: **random ≠ recommender** — there is no ranking model, so invariant 4 holds.

**Why the two serendipity channels, not one.** Cold (§2, structural: the ferryman follows real relations) answers "what connects to my work?"; warm (§4, random: the bottle) answers "what might I never have thought to look for?" Collapse them and you either lose surprise or smuggle in an algorithmic feed. Keeping them separate is what lets the platform have serendipity *and* keep invariant 4.

## 5 · Terrain fingerprint 地形指纹 — deterministic procgen

Every island's *form* is a pure function of its problem object — so an island is recognizable at a glance, and the same object renders identically on every client forever (invariant 13). Never hand-drawn, never un-seeded.

| Object attribute (source) | → Terrain parameter |
|---|---|
| `frontier.substrate` (0–1) | landmass size / built-up footprint — more foundation, more land |
| `frontier.heat` (0–1) | shoreline traffic / ambient bustle — hot frontiers are crowded coasts |
| night-science `A` vs `D` | vertical profile — high `A` → tall sky (§1); high `D` → deep seabed |
| domain vector (meta) | coastline character — the silhouette grammar of its region (angular near 数理, organic near 生命) |
| growth stage (projected) | building density & height — hut → academy → school (already partly driven) |
| `lineage` (fork depth) | a channel/isthmus toward the parent island |
| `hash(op-id)` | the seed for *non-semantic* coastline noise — stable jitter, not arbitrary |

- ① **Data source** — problem-object meta + growth projection, above. Every knob traces to an attribute or a `reduce` (invariant 10). ② **LOD** — L0: silhouette (size, coastline, altitude, lighthouse-if-resolved) is the whole fingerprint at range. L1: full terrain + buildings. ③ **Interaction** — none directly; the fingerprint *is* wayfinding — you learn to know an island by its shape (the L0 form should pre-echo its L1 richness: a school reads denser/taller than an empty isle). ④ **Removal test** — remove the fingerprint and islands become identical blobs; you can still enter, read, and work every one. Form is recognizability, never a gate or a score.

**Why deterministic, not decorative-random.** If shape were arbitrary, it would be noise you must ignore. Bound to attributes, shape becomes a *free extra readout* of the same data — and replayable, so the ledger's "the record round-trips" guarantee (leavability, architecture §6) extends to the visuals.

## 6 · Ritual moments 仪式时刻 — cause made visible, in place of a score

The platform has no XP and no leaderboard (invariant 1). Its feedback is **causal visibility**: your act instantly changes the world, and so does everyone else's (richness-plan §1.3). Rituals are that feedback. Discipline first — **better one remembered moment than five average ones** — so the emphasized set is small, each bound to a distinct ledger verb and a distinct **Magic-Moment type** (Recognition / Revelation / Reversal / Resonance / Reward). The doc spans ≥3 types; the four below cover four, and Reward is *deliberately* left to the already-canonical `resolved` → lighthouse rather than inventing a fifth ritual to complete a set.

| Ritual | Fires on (data source) | Magic-Moment type | What you feel |
|---|---|---|---|
| **河灯 River lantern** | `publish` | **Recognition** | your finished work floats out as a light the whole sea can see — you recognize your own contribution *in the world*, not on a scoreboard |
| **风暴 Storm** | `refute` (open dispute) | **Reversal** | the calm is overturned; a bold challenge lands — and a refuted-but-bold question counts as positive contribution (invariant 8), so the storm is honored, not punished |
| **彩虹 Rainbow** | dispute resolved (a `refute` answered by `validate`) | **Resonance** | the storm breaks into harmony; the payoff of reaching consensus |
| **移栽之路 Transplant walk (~8s)** | `transplant` (through the dock) | **Revelation** | you watch an idea physically carried across the bridge into another island — a hidden cross-pollination made real and legible |

- ① **Data source** — each ritual = exactly one ledger verb, above. No verb, no ritual (invariant 17). ② **LOD** — fired at L1 (on the island); at L0 a publish shows as a brief glint, a transplant walk as a mote travelling a current. Transient by nature — they fire *once per event*, never persist as always-on clutter (contrast the §3.10 lesson). ③ **Interaction** — click the lantern/bird/mote → the underlying event and artifact; reduced-motion collapses ritual to a quiet state change. ④ **Removal test** — remove every ritual and the events still happen, still hash-chain into the ledger, still show on the list twin. Rituals are the *felt* layer of feedback; the research — asking, refuting, validating, publishing — stands completely without them.

**Why these, and why not fewer.** Each ritual is the visible half of a verb the platform already treats as pivotal; drop one and that verb loses its feedback and quietly feels un-consequential. But note the restraint: contentment (`validate` with no dispute), adoption (`adopt`), and forking do **not** each get a ceremony — they are ambient state changes. Ceremony is reserved for the four moments a researcher would actually tell someone about.

## 7 · Resident tree & citation birds 居民之树 · 候鸟 — the living island

Two ambient inhabitants that make an island feel *peopled and referenced*, both strictly descriptive (never ranked).

**居民之树 Resident tree.** A tree in the island's commons whose branches are its members and whose rings read tenure and activity — a census made visible. ① **Data source** — `membership` events + contribution profile (reduce over the ledger). ② **LOD** — L1 (grows in the commons); a fuller canopy reads at L0 as a more-peopled island. ③ **Interaction** — click a branch → that resident's contributions (list twin). ④ **Removal test** — remove the tree and the membership list still shows who is here (invariant 5); the tree is its spatial twin. **Anti-pattern guard:** branches are **never sorted or sized by rank** — that would be a leaderboard (invariant 1). Rings describe tenure/activity; they do not compete.

**候鸟 Citation birds 候鸟.** Migratory birds that follow the citation/bridge graph between islands — a bird *arriving* is an incoming reference to your island, one *departing* is your island citing another. ① **Data source** — `bridge_accept`, `submit_claim` / `validate` carrying a cross-island reference. (At field scale these are v2's currents; at island scale they are your arrivals and departures.) ② **LOD** — L0: flocks migrate along the current trunks. L1: individual birds land at your island. ③ **Interaction** — click a bird → the citing/cited artifact (reference + hash). ④ **Removal test** — remove the birds and citations still live in the ledger and the relations list; the birds are the ambient cue that *your work is being used*.

**Why two inhabitants, not a menagerie.** People (tree) and references (birds) are the two things that make an island feel alive without inventing data — one reads memberships, one reads relations, and the platform already produces both. A third ambient creature would either duplicate one of these or need a data source the ledger does not have — at which point, cut it (invariant 6/14).

## 8 · Invariants (10–13 canonical · 17 additive)

Stated here as their canonical home; 10–13 have been referenced as v1's frozen four since v2, 14–16 are v2's, and 17 is newly articulated by this reconstruction (additive, awaiting ratification into `architecture.md`).

10. **Every visual is a data transcription.** No stratum, altitude, terrain feature, ritual, or inhabitant exists without a ledger event or a problem-object attribute behind it. (v2's invariant 14 extends this from the island to the horizontal sea.)
11. **One ledger, many projections.** The vertical strata, altitude, shadow anchor, and every terrain knob are `reduce`s over the same event log — there is **no separate "depth" store** and no "sculpt terrain" tool. (Mirrors architecture §7-7.)
12. **Two orthogonal axes.** *Altitude* = epistemic groundedness (above/below the waterline); *Day/Night* = record-vs-actual time-lens (palette + timeline). They never share a screen direction or channel — and v2's currents (motion) and climate (hue) must not conflate with either (v2 §6).
13. **Terrain is deterministic.** An island's form is a pure function of its problem-object attributes + ledger, seeded by `hash(op-id)`; the same object renders the same island on any client, any time. No hand-placed shapes, no un-derived randomness.
17. **Ritual moments are event-triggered, never scored.** Every ceremony/animation transcribes exactly one ledger event and fires once per event; none keeps a counter, tally, streak, or reward currency. (Extends invariant 1 — no XP — and invariant 10 to the time-based layer.)

## 9 · Priority, acceptance & phasing

Aligned with `richness-plan.md` swimlane E. **The exploration core is never scored** — every batch must pass the removal test (take the element away; exploring the research question itself must still stand).

- **Batch 1 (swimlane E — do first): 河灯 on `publish` + ~8s transplant walk on `transplant`.** Both are pure event→animation over verbs that already emit events, need no new infrastructure, and carry the highest felt payoff per unit work (Recognition + Revelation). *Acceptance:* publishing an island renders a lantern that leaves *that* island; a transplant renders an ~8s walk across the bridge; both trace to the exact ledger event; reduced-motion degrades cleanly.
- **Batch 2: storm on `refute` + rainbow on resolution + shadow anchor + landing-ceremony continuity.** Completes the ritual set (Reversal + Resonance) and makes altitude readable. *Acceptance:* one dispute renders a storm that breaks into a rainbow when a `validate` answers it; a sky-heavy vs. grounded island are told apart by shadow tether alone.
- **Batch 3: terrain fingerprint + drift bottle + resident tree + citation birds.** These need procgen and cross-island sampling. *Acceptance:* two islands with different objects render visibly different, deterministically (same object → same shape twice); a bottle opens a real unrelated atom; the tree click-throughs to a member, a bird to a citation — none of them sortable by rank.
- **Scaling (§3) is already staged** as Phase C / INFO-HIERARCHY C1–C3 — camera + de-overlap → semantic LOD + variance-select → archipelago + My Harbor + fog. Do not re-plan it here; that document is authoritative for execution.

*Handoff. Everything unspecified: infer from the three theses and invariants 1–17; when a visual has no ledger event or problem-object attribute behind it, cut it. v1 elevates the vertical axis; like v2 it invents **no new ledger verb and no new store** — the depth is pure projection.*

**Glossary additions (architecture §9):** 天空 sky · 海面 sea surface · 海底 seabed · 影锚 shadow anchor · 登临 landing ceremony · 地形指纹 terrain fingerprint · 河灯 river lantern · 风暴 storm · 彩虹 rainbow · 移栽之路 transplant walk · 漂流瓶 drift bottle · 居民之树 resident tree · 候鸟 citation bird · 我的港湾 My Harbor · 雾化 fog.

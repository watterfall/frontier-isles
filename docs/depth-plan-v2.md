# Frontier Isles · Depth & Richness Plan v2 — 海即数据 The Sea Is Data

Companion to `architecture.md` (v3.0) **and** `depth-plan-v1.md`. **Additive only.** Everything already frozen — the v2 prototype composition, `--fi-*` tokens, all invariants 1–13, and v1's entire **vertical** world (sky/sea/seabed, shadow anchor, landing ceremony, terrain fingerprint) — stays frozen. Merge into `architecture.md` after ratification.

**The one-sentence thesis.** v1 made the **vertical** axis first-class: altitude = epistemic groundedness. v2 makes the **horizontal sea itself** first-class: the water between islands stops being empty backdrop and becomes a living **relational-domain field**. v1 was a leap up; v2 is the mirror leap outward. Same discipline both times — *every visual is a data transcription* (invariant 10) — now applied to the plane v1 left blank.

---

## 0 · Deep problems this plan solves (the horizontal gaps v1 left)

| # | Problem v1 left open | v2 answer |
|---|---|---|
| 1 | **Relation poverty** — bridges/cables/lineage are a few ad-hoc lines; the sea between islands carries no information | **Currents 洋流** — the water is the relation medium: typed, directional, weighted flows projected from ledger events |
| 2 | **Domain bucketing** — only 4 fixed domains (math/matter/life/cross); real research spans hundreds of fields with no home | **Climate 气候** — domains become a continuous 2D manifold; any discipline gets a coordinate, the 4 domains are named *regions*, not buckets |
| 3 | **Cross-domain is a fifth bucket** — "交叉" is drawn as its own category, hiding *where* synthesis happens | **Confluence 河口** — cross-domain synthesis is an emergent *event* where currents of different type meet, not a static label |
| 4 | **Scale illegibility** — 700 islands on blank water read as 700 loose dots even with LOD | **Archipelagos 群岛** — dense current-clusters auto-form named regions; the eye reads ~20 archipelagos, not 700 dots |
| 5 | **Dispute is per-island** — v1's weather-lens storm sits on one island, but disputes are *between* islands | **Whirlpool 漩涡** — contested clusters render as a vortex over the contended region, sized by unresolved contention |
| 6 | **Relation maturity is invisible** — a floated proposal and a ratified bridge look alike | **Strait 海峡 vs Isthmus 地峡** — fluid contested link vs solid ratified land-bridge; the water/land distinction encodes maturity |
| 7 | **Channel ceiling** — v1's honest channels (altitude, day/night, terrain) all live *on* islands; the sea adds none | **~7 new sea-borne channels** (current type/width/direction, climate hue, sea depth, archipelago membership, confluence) — richness on the previously-empty plane |

## 1 · New invariants (14–16, additive to v1's 10–13)

14. **The sea is data too.** Every current, whirlpool, strait, isthmus, climate band, and confluence transcribes ledger relations or a domain coordinate. No current without an event; no climate without a domain vector. (Extends invariant 10 from the island to the whole horizontal plane.)
15. **Relations are projected, never authored.** Currents/straits/whirlpools/confluences are a `reduce` over the ledger (bridge_propose/accept, fork, merge_back, refute, validate, transplant). There is **no "draw a link" tool** and no relation store — mirrors §7-7 (writes are events, reads are projections) and invariant 11 (one ledger, many projections). *The horizontal field introduces zero new verbs.*
16. **Domain is a coordinate, not a label.** An island's field position is a continuous vector held in problem-object meta (like chart coordinates — §two-plane: `domain` is platform data, not an OPP protocol field). The 4 domains are named *regions* of one manifold; cross-domain is confluence, never a fifth bucket.

## 2 · The horizontal world 海即数据 — two coupled fields

The sea plane carries two orthogonal, simultaneously-legible sub-fields. Neither is a lens you toggle to — like altitude, they are always-on structure. (Lenses from v1 §3 still *emphasize* one; default shows both, quietly.)

| Sub-field | Encodes | Source (projection over…) | Primary channel |
|---|---|---|---|
| **洋流 Currents** | relations between islands — direction, type, weight | `bridge_*`, `fork`, `merge_back`, `refute`, `validate`, `transplant` events | flowlines + vortices + straits |
| **气候 Climate** | the domain manifold — where a field sits, how "deep" (abstract) it is | domain vector in problem-object meta + `substrate` frontier score | sea hue (position) + sea darkness (depth) |

**Legibility kit for the sea plane** — mirroring v1's sky kit (all first-class, none optional):

1. **流例 Flow legend** — a persistent corner key: current *color* = relation type, *width* = weight, *arrowhead* = direction. Honest encoding is not optional; the reader can always decode a current. (Answers the risk that a moving sea becomes decorative — invariant 6/14.)
2. **水深 Depth shading** — sea darkness = domain abstractness (formal/theoretical deep, applied/empirical shallow). A second climate channel that never steals from altitude (altitude is *above* the water; depth is *below* it — the two never share a screen direction, cf. v1 problem 3).
3. **洋流聚焦 Current focus** — hover an island → its incoming/outgoing currents brighten, all other currents recede to 40% (mirrors v1's altitude layer-focus). Prevents the "everything connected to everything" hairball.
4. **河口 Estuary confluence** — where currents of *different type* meet, a delta glyph marks a cross-domain synthesis site. Confluence is drawn only where the data shows convergent flow — it is discovered, not decorated.

## 3 · Currents 洋流 — relations as the medium

The relation graph, currently invisible, becomes the sea's motion. Four current forms, each a distinct data transcription:

- **洋流 Current (flowline)** — a directional stream A→B. **Width** = relation weight (citation count / transplant flux / evidence-backed validations). **Color-by-type** (reusing the token palette, never a new hue):
  - 石青 azurite `--fi-azurite` = evidential / citation / validate
  - 赭石 ochre `--fi-ochre` = bridge / analogy-mapping (the ferryman's flows)
  - 石绿 malachite `--fi-malachite` = generative / fork-lineage / merge_back
  - Drift animation reuses `@keyframes waveDrift`; `--play:paused` freezes it (existing motion toggle).
- **漩涡 Whirlpool** — a rotating vortex over a cluster where neighboring islands hold *unresolved* contention (open `refute` without matching `validate`). Intensity = contention magnitude; it calms to still water when disputes resolve (rain→rainbow, cf. v1 ritual moments). This is v1's per-island storm elevated to the *relational* scale it belongs at.
- **海峡 Strait / 地峡 Isthmus** — a link between two very-connected islands. **Strait** = a narrow *water* channel, faintly dashed = a *proposed / contested* bridge (`bridge_propose`, not yet accepted). **Isthmus** = a solid *land* bridge, heavy stroke (`--fi-stroke-heavy`) = a *ratified* bridge (`bridge_accept` by both masters). Water vs land = relation maturity, read at a glance.
- **信风 Trade wind** — a broad, steady directional band = sustained collaboration flux between two *regions* (aggregate co-membership / shared-presence flow, from the place plane). v1's shipping lens, elevated from per-island boats to a field-scale wind. (T3.)

Serendipity note: currents are **structural** (cold) — the ferryman still rides them (v1 §2). The drift bottle (v1 §4) remains the **warm/random** channel. v2 adds no algorithmic feed — invariant 4 holds; currents are a deterministic `reduce`, not a recommender.

## 4 · Climate 气候 — the domain manifold

Domains stop being 4 buckets and become one continuous field, so *any* discipline has a place and adjacency *means* disciplinary proximity.

- **气候带 Climate band** — sea hue is a continuous gradient over the domain manifold. The four existing domain fills anchor named regions (using the frozen `--fi-domain-*` tokens): cold formal water near 数理 (`--fi-domain-math-fill`), temperate near 物质 (`--fi-domain-matter-fill`), warm near 生命 (`--fi-domain-life-fill`), estuarine near 交叉 (`--fi-domain-cross-fill`). An island's *ambient water hue* = its manifold position, interpolated — **not** a bucket label. This is how 700+ islands across arbitrary fields all get a coherent home.
- **水深 Sea depth** (see legibility kit) — darkness = abstractness. A theoretical-CS island floats over deep water; an applied-materials island over a shallow shelf.
- **群岛 Archipelago** — a projection over the currents field: regions where many islands share strong currents auto-group into a named archipelago (named by shared subdomain, à la v1's mid-LOD clusters). At far zoom the reader sees ~20 archipelagos, not 700 dots — this is the density answer, and it *reuses v1's variance-select* ranking so outlier islands still surface above bulk.
- **洄游 Migration** — as a subfield heats up over time, its climate band can drift; the day/night timeline (v1) can scrub this. (T3, exploratory.)

## 5 · Richness — new display channels & canvas expansion

**New honest channels v2 adds** (all data transcriptions, all on the previously-blank sea):

| Channel | Visual | Data source | Answers |
|---|---|---|---|
| relation **type** | current color (azurite/ochre/malachite) | event `action`/`flow` | "更复杂的关系" |
| relation **weight** | current width | event count / flux | " |
| relation **direction** | flow + arrowheads | event actor→target | " |
| relation **maturity** | strait (water) vs isthmus (land) | propose vs accept | " |
| **contention** | whirlpool intensity | unresolved refutes | " |
| domain **position** | ambient sea hue | domain vector | "更多领域" |
| domain **abstractness** | sea depth/darkness | substrate score | " |
| **cluster** | archipelago grouping | current density | scale legibility |
| cross-domain **synthesis** | confluence glyph | multi-type flow meet | de-bucket 交叉 |

**Canvas expansion.** The canvas is no longer "islands on blank water"; it is "islands **in** a living relational-domain field." More *domains* fit because they gain continuous coordinates and cluster into archipelagos (LOD-friendly, reuses v1's variance-select). More *complex relations* fit because the sea *is* the relation medium — typed/directional/weighted currents + straits + whirlpools + confluences — instead of a handful of overlaid lines that hairball past ~30 nodes.

## 6 · Interaction with v1 — three axes must never conflate

v1 established two orthogonal axes (invariant 12). v2 adds the horizontal field. The rule: **no two of these share a screen direction or a channel.**

| Axis | Screen encoding | Meaning | Never confused with |
|---|---|---|---|
| **Altitude** (v1) | vertical offset *above* water + shadow anchor | epistemic groundedness | sea depth (which is *below* water) |
| **Day/Night** (v1) | palette swap, timeline scrub | record vs. actual, time-lens | — |
| **Currents** (v2) | in-plane flowlines, color=type | relations | climate hue (hue=domain, motion=relation) |
| **Climate** (v2) | ambient sea hue + darkness | domain position + abstractness | current color (static hue vs moving flow) |

**Disambiguation guarantees:** *motion* always = relation (currents move; climate is still). *Hue of the water body* always = domain; *hue of a flowline* always = relation type — and the flow legend (§2) makes the distinction explicit. *Above the waterline* = groundedness; *below* = abstractness.

**Rendering** (extends v1 §2 layer containers): the sea plane is its own PixiJS container beneath the island containers — currents draw as animated splines, climate as a shader/gradient fill, archipelago hulls as low-alpha regions. Own sort, no cross-layer interleave. Currents cull with the same viewport/LOD thresholds as islands (far zoom = only trunk currents between archipelagos survive; near = full per-island flows). The math is WebGL-free-testable in `packages/renderer` "." export.

## 7 · Priority & acceptance

| Tier | Items | Acceptance |
|---|---|---|
| **T1** | Climate band (continuous domain hue) · sea depth shading · flow legend · **static** currents (flowline + color-by-type + width, no animation) | A naive user reads sea hue as "field" and flowline as "relation" unprompted; any two islands' relation is stated correctly from the current alone; 700 isles still legible with climate on |
| **T2** | Current animation + current-focus · whirlpool (contention) · strait vs isthmus (maturity) · archipelago auto-grouping | One dispute renders a whirlpool that calms on resolution; a proposed vs ratified bridge are told apart at a glance; far zoom shows ≤~25 named archipelagos, not 700 dots |
| **T3** | Confluence glyph · trade winds · migration (climate drift over the timeline) · transit-map projection of the currents field | Each ships independently; each passes an invariant-14 review (every element traced to an event or domain vector) |

Every current, band, and glyph must round-trip: given the ledger + domain vectors, the field is fully regenerable (invariant 15). If a proposed visual has no event or domain source, **cut it** (invariant 6/14).

## 8 · Handoff

- **Design v5 brief scope** (canvas round): climate band gradient (4 domain-region anchors → continuous) · sea depth shading · flow legend · current flowline (3 type-colors, width variants, arrowheads) · whirlpool · strait vs isthmus · confluence glyph · archipelago hull. **Lock everything already frozen** (all v1 + v2-prototype tokens/composition). New forms use *only* existing `--fi-*` tokens — no new hue without a breaking-change note.
- **Code impact**: sea-plane PixiJS container (currents spline + climate shader + archipelago hulls); a **currents projection** in `packages/core` (`reduce` over ledger → typed/weighted/directional edges — *no new verbs, no new store*); a **domain-vector** field in problem-object meta (place plane, like chart coords); archipelago = current-density clustering reusing variance-select; LOD/culling thresholds shared with islands. Climate hue interpolates the frozen `--fi-domain-*` tokens.
- **Glossary additions (§9)**: 洋流 current · 漩涡 whirlpool · 海峡 strait · 地峡 isthmus · 信风 trade wind · 气候带 climate band · 水深 sea depth · 群岛 archipelago · 河口 confluence/estuary · 流例 flow legend · 洄游 migration.

---

*Everything unspecified: infer from the three theses and invariants 1–16; when a visual has no ledger event or domain vector behind it, cut it. v2 elevates the horizontal sea; it invents no new ledger verb and no new store — the field is pure projection.*

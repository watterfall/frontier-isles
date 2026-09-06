---
name: Frontier Isles
description: Mineral-paper atlas and readable research workspaces
colors:
  paper: "#F2EAD8"
  paper-raised: "#FAF5E8"
  ink: "#2B2620"
  ink-2: "#685F52"
  azurite: "#2E5E8C"
  azurite-deep: "#1E4266"
  ochre: "#B5673A"
  ochre-text: "#8F4A2B"
  malachite: "#3E9B7E"
  malachite-text: "#246B55"
  gamboge: "#E3A93C"
  water: "#C8D8E4"
  stone: "#DCCFAB"
  night-paper: "#161F36"
  night-raised: "#212C4E"
  night-ink: "#C9D0E4"
  night-ink-2: "#8B94B2"
  field-paper: "#fffdf7"
  collision-water: "#e0e9e5"
  collision-blue: "#244f70"
  collision-blue-hover: "#193e5c"
  collision-muted: "#655e50"
  collision-rule: "#c6c2af"
  collision-focus: "#9b6227"
  collision-land: "#c6d2b7"
  collision-contour: "#667957"
  collision-land-a: "#a9c6cc"
  collision-contour-a: "#375e75"
  collision-land-b: "#d5bf95"
  collision-contour-b: "#89613c"
  collision-ochre-text: "#7d482b"
  collision-route: "#738c80"
  collision-trail: "#315b4a"
  collision-selected-route: "#92512f"
  collision-proposal: "#79596d"
  collision-prompt: "#e8ecdf"
  island-night-accent: "#a9d4f3"
  island-night-accent-hover: "#d0e7f7"
  island-night-on-accent: "#182538"
  architecture-ink: "#433f35"
  architecture-paper: "#f6efd9"
  architecture-shade: "#ddd1b2"
  architecture-blue: "#37627b"
  architecture-green: "#426c5c"
  architecture-ochre: "#a96337"
  family-unknowns: "#725575"
  family-sensing: "#386d81"
  family-commons: "#826342"
  family-transfer: "#9b5839"
  family-simulation: "#4b6485"
  family-living: "#426f55"
typography:
  display:
    fontFamily: "'Noto Serif SC', 'Songti SC', serif"
    fontSize: "clamp(25px, 2.4vw, 37px)"
    fontWeight: 600
    lineHeight: 1.5
  title:
    fontFamily: "'Noto Serif SC', 'Songti SC', serif"
    fontSize: "25px"
    fontWeight: 600
    lineHeight: 1.4
  desk-title:
    fontFamily: "'Noto Serif SC', 'Songti SC', serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.65
  exploration-body:
    fontFamily: "'PingFang SC', system-ui, sans-serif"
    fontSize: "13px"
    lineHeight: 1.9
  composer:
    fontFamily: "'PingFang SC', system-ui, sans-serif"
    fontSize: "14px"
    lineHeight: 1.8
  body:
    fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif"
    fontSize: "0.875rem"
  reading:
    fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif"
    fontSize: "1rem"
  label:
    fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif"
    fontSize: "0.75rem"
  caption:
    fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif"
    fontSize: "0.6875rem"
  micro:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "0.625rem"
  island-title:
    fontFamily: "'Noto Serif SC', 'Songti SC', serif"
    fontSize: "27px"
    lineHeight: 1.35
    letterSpacing: "-0.02em"
  island-question:
    fontFamily: "'Noto Serif SC', 'Songti SC', serif"
    fontSize: "17px"
    lineHeight: 1.65
  building-title:
    fontFamily: "'Noto Serif SC', 'Songti SC', serif"
    fontSize: "32px"
    fontWeight: 600
  room-title:
    fontFamily: "'Noto Serif SC', 'Songti SC', serif"
    fontSize: "23px"
    fontWeight: 600
    lineHeight: 1.45
  material-title:
    fontFamily: "'Noto Serif SC', 'Songti SC', serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.65
  material-body:
    fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.85
  island-note:
    fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif"
    fontSize: "15px"
    lineHeight: 1.7
  question-sheet:
    fontFamily: "'Noto Serif SC', 'Songti SC', serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.8
  question-sheet-main:
    fontFamily: "'Noto Serif SC', 'Songti SC', serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.8
rounded:
  seal: "2px"
  field: "4px"
  card: "6px"
  panel: "10px"
  pill: "999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "24px"
  space-6: "32px"
  space-7: "48px"
components:
  collision-primary:
    backgroundColor: "{colors.collision-blue}"
    textColor: "{colors.paper-raised}"
    rounded: "{rounded.field}"
    padding: "12px 18px"
  collision-primary-hover:
    backgroundColor: "{colors.collision-blue-hover}"
  collision-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "9px 12px"
  collision-text-action:
    backgroundColor: "transparent"
    textColor: "{colors.collision-blue}"
    padding: "8px 0"
  collision-field:
    backgroundColor: "{colors.field-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px"
    typography: "{typography.composer}"
  island-entry:
    backgroundColor: "{colors.azurite}"
    textColor: "{colors.paper-raised}"
    padding: "10px 14px"
  island-entry-night:
    backgroundColor: "{colors.island-night-accent}"
    textColor: "{colors.island-night-on-accent}"
    padding: "10px 14px"
  island-entry-night-hover:
    backgroundColor: "{colors.island-night-accent-hover}"
---

# Design System: Frontier Isles

## Overview

**Creative North Star: "Mineral-paper atlas"**

Warm paper, mineral pigments, fine ink lines and serif question headings carry the existing atlas identity into readable research workspaces. The wider atlas keeps its illustrated world and shared shell. The collision surface pairs green water and recognizable question islands with a quiet paper desk for following a thought.

This scoped refresh records the implemented September 6 exploration redesign. The user authorized free inquiry, richer cross-domain encounters and motivation through curiosity, choice and observable changes in thinking. These choices replace the collision worksheet; they do not replace the wider atlas identity or establish a new global brand. Shared visual authority remains `../../packages/assets/src/tokens.css` and `src/global.css`; the scoped surface is defined by `CollisionOverlay.tsx`, `CollisionVoyageMap.tsx`, `collision.css` and `src/data/collisionThemes.ts`.

The generated-island extension carries a chosen question through a landscape, an identifiable research building and a readable source. Purpose-led wayfinding, an entrance with a semantic room diagram, explicit room entry and unfoldable paper questions extend the incumbent world. Six research families add instruments, pigments, stable settlement arrangements and optional reading itineraries while retaining each station's recognizable function. Its visual authority is `src/components/island/island-exploration.css`, `src/components/island/island-navigation.css`, `StationArchitecture.tsx`, `islandCharacter.ts` and `stationSpatial.ts`, alongside the shared tokens. This scope covers general generated-island L1 and station-reading L2; the legacy `machine-curiosity` sample retains its bespoke QFT flow and interiors.

**Key Characteristics:**
- Warm paper and mineral accents, with green water distinguishing the exploration map from the writing desk.
- Serif questions, sans-serif controls and notes, monospaced identifiers and raw records.
- Recognizable islands and meaningful route states, with an equivalent route list.
- Optional next moves and revisitable thoughts, without worksheet completion or external rewards.
- Stable architectural identities and family details connect landscape, wayfinding, arrival and reading; source material remains distinct from editorial and personal interpretation.

## Colors

### Primary

Shared azurite remains the atlas action pigment. Scoped collision blue identifies primary actions, active top navigation and the first selected question; its hover shade darkens. The first selected island has its own blue land and contour pair.

### Secondary

Shared ochre remains part of the atlas palette. In the collision surface, ochre land, contours and question text distinguish the second selected question. The currently selected route uses a deeper ochre stroke and a small bearing circle. Neither side implies priority or correctness.

### Tertiary

Green land and contour tones identify unselected question islands. Deep green identifies a personal route with recorded content. Muted plum dots identify an unverified AI bridge proposal. The pale green prompt surface separates a local analogy critique from the source description. Shared malachite and gamboge retain their existing atlas roles.

### Neutral

Paper, raised paper, ink, secondary ink and stone remain the shared reading hierarchy. Collision green water, muted text and fine rules are scoped additions. The desk stays on raised paper; the composer uses warm near-white field paper. Wider-atlas domain fills and water families remain in the asset token source.

**The Scoped Palette Rule.** Shared chrome uses semantic surface/text aliases for day/night changes. The collision surface uses its own day-paper and green-water colors; do not assume that the atlas night theme recolors it. Keep the collision additions scoped.

**The Route Meaning Rule.** Dashed routes are editorial catalog connections. Solid routes indicate recorded personal content, including a saved thought or retained legacy field; they do not mean a claim is established. Dotted plum routes are unverified AI proposals. Color reinforces these line styles rather than replacing them.

**The Island Accent Rule.** Generated-island controls separate text emphasis, filled-action background and foreground roles. Day uses shared azurite and raised paper; night uses the scoped light-blue accent with a dark foreground. Links and active room labels use the text role, while entry actions, selected purpose lenses and model launchers use the fill/foreground pair. Do not reuse a night link color as both a button fill and its text.

The six architectural pigments belong to the shared building drawings: warm masonry and shaded faces, fine ink, blue roofs and instruments, green open pavilions, and ochre workshop roofs and question-wall details. Their fixed colors describe the building art; the Pixi scene applies its existing night treatment separately. The SVG fallback uses a quiet water surface and simplified terrain fills from its own source; it preserves spatial identity without claiming pixel parity with Pixi.

**The Family Pigment Rule.** The six `family-*` accents extend building art within generated islands: muted plum for open questions, mineral teal for observation, umber for knowledge commons, fired clay for method transfer, slate blue for models, and leaf green for living substrates. The accent repeats across roofs, question-wall trim and family instruments; it does not replace the accessible day/night action roles. Family character is also expressed through instrument silhouettes and semantic neighbors, never through color alone. These are research-family identities, not measurements or maturity scales.

## Typography

Use the display serif for themes and questions, the body stack for controls and explanations, and the mono stack for identifiers and raw records. The shared body stack retains its Chinese fallbacks; the collision surface currently uses the narrower PingFang/system sans stack recorded in its scoped roles.

The map heading uses the responsive display role. The header uses the title role; the desk uses its smaller serif title role. Supporting synthesis is serif (17px, weight 500, line-height 1.85); desk prose is sans-serif (13px, line-height 1.9). Island names are serif (15px desktop, 13px mobile), with a water-colored stroke to keep labels readable over paths. Identifiers and compact attribution use mono or small sans-serif text (10–11px).

**The Writing Size Rule.** The free-thought composer uses 14px text with line-height 1.8 on desktop and 16px on mobile. Its minimum height is 120px and it resizes vertically. Mobile search remains 13px in the current source; do not describe every mobile field as 16px.

Generated islands use a compact serif island title, a serif main question and a larger building title when reading. Room titles step down to material titles; sustained material prose uses the material-body role. At 760px and below, the island heading becomes 29px, the building title becomes 27px, and the note field becomes 16px. Arrival headings reuse the 25px title size; arrival excerpts use serif 15px/1.75. Room explanations and source attribution remain supporting 12px text. Data values retain a local 20px emphasis; this is not a new global display scale.

Question sheets use the scoped question-sheet role, with the main sheet using question-sheet-main (20px on mobile). This serif reading hierarchy carries the question itself. Existing source and author context is supporting sans-serif text (13px/1.8); guide material previews are serif (13px/1.65) and stop at two lines. The family's name uses a small serif title (16px, weight 600), not a second display heading.

**The Reading Hierarchy Rule.** Lead L1 with the question's title and question, then disclose background, domain, stage, cluster and provenance. In L2, show building identity, room purpose, material heading, readable body and source link in that order. Keep metadata subordinate to the question and source attribution attached to the material it supports.

## Layout

The wider desktop atlas fills its viewport inside a quiet paper margin (12px). Its HUD geometry, scene hierarchy and available map rectangle remain authoritative for that surface.

The collision dialog fills the viewport at every size. A non-shrinking header sits above a flexible grid: the map takes the remaining width beside a 380px desk. At 1500px and wider the desk becomes 440px; from 801px through 1080px it is 340px. Cartography and desk scroll independently. Desk padding is 26px horizontally by default and 36px on wide screens. The map heading and search share a 32px reading edge at normal desktop widths.

Six editorial theme lenses organize the map: order; minds, memory and experience; information and matter; prediction; cooperation and collapse; origins and possible worlds. They are choices of viewpoint, not stages. The desktop SVG uses a 920×475 coordinate space and displays at most ten question islands. Search can bring another catalog question into view. Keep theme positions stable while opening and recording a thought.

**The Mobile Work Rule.** At 800px and below, show either the full-height map or the desk beneath the shared header. The map uses two columns of islands and natural vertical scrolling. Its single-row theme navigation scrolls horizontally; the strip and its buttons must not shrink, and every theme button keeps a 44px minimum height. Selecting an island or route opens the desk; returning restores focus to the originating map control, with a selected-theme fallback.

Mobile header navigation wraps onto its own row. Desk padding becomes 22px horizontally; the question heading receives focus when the desk opens. The mathematical-bridge browser retains a separate 300px list on desktop and horizontally scrolling 220px items on mobile. These values belong to their respective surfaces, not to a universal sidebar pattern.

The generated-island desktop keeps a 266px left reading/wayfinding rail, with the landscape inset 320px from the left and 104px from the top. Approaching a building opens a lower-right entrance of `min(430px, 34vw)`, with a maximum height of `calc(100% - 190px)`, internal vertical scrolling and sticky entrance actions. The landscape reserves `min(480px, 36vw)` on the right while this entrance is visible. Explicit room entry hides the rail and opens a right-hand reading panel of `min(780px, 58vw)`, leaving the selected building visible. Its room navigation is 162px wide; reading content scrolls independently. At 761–1080px the rail becomes 230px, the entrance keeps `min(430px, 34vw)`, the panel takes 64vw and room navigation becomes 136px. The shared world trail and global controls are hidden during reading.

**The Island Mobile Rule.** At 760px and below, L1 is a naturally scrolling sequence: question, 360px landscape, entrance when selected, then wayfinding, the purpose guide and onward controls. The entrance uses automatic width and natural page height with non-sticky actions. L2 occupies the full safe-area-aware viewport, hides the landscape and turns room navigation into a non-shrinking horizontal strip above independently scrolling material. A carried question starts collapsed with a one-line preview; source comparisons stack vertically and draft fields use 16px text. Purpose lenses and room tabs have a minimum 44px height. The mobile atlas provides an actual “登岛探索” entry into the generated screen, with browser-local notes and the optional model workbench; it is not just a question-card preview.

**The Spatial Address Rule.** Terrain placement, purpose guide, selected building, walking path and camera share station identity. `stationSpatial.ts` supplies the station vocabulary and perimeter slots; `islandCharacter.ts` arranges them from research family and stable island identity. A specific topic takes precedence over its broad cluster, with a domain fallback. Both organic and courtyard terrain grammars use the well-spaced perimeter; family neighbors remain consistent as the entrance orientation varies. Scene roads, focus routes and the SVG fallback share the resulting order. Overview fitting uses the actual elevated terrain bounds. A selected station frames its actual elevated center; returning to overview refits the coastline. The SVG fallback uses the same graph and addresses, with its own viewBox fitting rather than a second island layout.

The wayfinder derives its station positions and coastline from the shared scene graph. Its optional itinerary follows the island's research family: follow an anomaly, trace an observation, move between arguments, explore method transfer, move from rules to tests, or explore feasibility limits. Each uses available station addresses and can be left at any time. The dashed line and corresponding text list show a suggested reading order; they do not encode a scientific edge or required sequence.

Question sheets form two columns with an 18px gap. The main question and the expanded sheet span the available reading width; only one sheet is expanded at a time. At 760px and below they form one column with a 14px gap, and sheet padding changes from 22px to 18px. Opening a sheet brings its start into view inside the reading area. Detailed context belongs inside the sheet, while the purpose guide previews actual material.

The normal atlas keeps its pre-departure camera in memory and restores it when returning or rebuilding its stage. Resize preserves a touched/restored observation pose; untouched initial views retain their normal fitting behavior. Search entry queued during a roster rebuild enters once the stage is ready. The exploration boat retains its separate pose, and the atlas bookmark is discarded on reload.

## Elevation & Depth

The wider atlas retains its ink frame, inset line, ambient stage shadow and offset control shadows. The collision dialog is a flat, opaque, full-viewport surface: green map water beside warm paper, divided by thin rules. It has no bounded-sheet shadow or translucent scrim. Questions, notes and critique prompts use tonal separation rather than stacked card elevation.

**The Surface Rule.** Preserve existing scene depth in the atlas. Within the collision map and desk, use paper tone, fine rules and cartographic contours to establish hierarchy.

Route hover or focus thickens the line; island hover or focus strengthens the shore. Hovering or focusing an island dims unrelated routes. Current routes have a brief arrival animation (600ms); unrelated-route opacity changes over 200ms. Reduced motion disables collision animation, transitions and smooth scrolling. The wider atlas bakes its added land contours into the existing island textures; the contours do not require a new per-frame drawing layer.

The island guide is transparent against its paper background. Arrival and reading use opaque paper, fine separators and diffuse ambient shadows; they do not borrow the collision desk's full-viewport flatness or add a new global card stack. The reading scrim is transparent, keeping the selected building visible on desktop. Walking lines sit below buildings, and a ground ring plus label identifies selection.

The Pixi approach eases position and zoom for 560ms using `1 - 2 ** (-8 * progress)`, reaching the target exactly at completion. Reduced motion makes the camera immediate and removes the landscape resize transition (normally 360ms). A resize refits the current station or actual coastline without animation. This is a camera approach, not a simulated person walking along the route.

Question sheets add a light ambient paper shadow (`0 4px 15px #302f2914`). Their details unfold with a clipped reveal and opacity change over 260ms using `cubic-bezier(.16,1,.3,1)`; reduced motion disables the reveal. The building entrance unfolds with a 280ms clipped reveal using the same easing, only when reduced motion is not requested. This scoped paper depth supports disclosure rather than a new global card system. Night lighting preserves readable architectural silhouettes, and the replay control is hidden while a building is selected, both at its entrance and during reading.

## Shapes

Shared seals, cards, panels and pill controls keep their existing radius scale. The collision shell and map/desk division have square edges; actions, the composer and critique prompts use a small field radius. An island's stable coast is derived from its question identifier. Three nested contours and an outer shore provide a recognizable silhouette. These contours and atlas altitude are cartographic cues, not scientific quality or progress scores. Map distance does not encode similarity.

**The Architectural Identity Rule.** Nine purpose-specific base SVG geometries are reused in the landscape, guide portraits, arrival note and reading header: the open question wall, shelved library, opposing-board debate hall, instrument terrace, sawtooth workshop, unfinished garden, exhibition hall, open discussion pavilion and harbor. Family instruments and pigments vary the base drawings while preserving station footprints and recognizable purpose. Geometry belongs to station kind and research family, not votes, visits or invented maturity. Pixi bakes these same SVG drawings into runtime textures; the no-GPU view renders the SVG directly. No new shipping raster assets were added for v3 or v4.

Family instruments are architectural exhibits: a greenhouse for living substrates, a dish for sensing, an open shelf for commons, joined blocks for transfer, paired pendulums for simulation and separated shards for unknowns. They repeat at the question wall, library, data terrace and workshop. Their silhouettes do not depict live measurements. The living family's question paper has gently rounded upper corners (14px 14px 3px 3px); transfer paper bends one upper corner (0 12px 0 0). Keep these forms scoped to their family sheets rather than adding them to the global radius scale.

Building research diagrams reuse four content forms: `court` for questions and unfinished ideas, `stacks` for sources, data and results, `forum` for explanations and discussion, and `bench` for methods and departure. These describe how to enter existing material, not physical floor counts. Their shared grid has two columns with the first room spanning both; stacks use a single column with side openings, courts widen the space between rooms, forums curve the first room's lower edge, and benches also span the last room. The doorway's single curved corner (20px), court's upper corners (24px 24px 0 0) and forum's lower corners (0 0 22px 22px) are intentional conventions of this repeated diagram component. Keep them scoped to that geometry; they are neither global radius tokens nor detector ignores.

## Components

- **Shared shell controls:** raised-paper pills, ink outline, compact text and a minimum 44px height. Preserve the shared gamboge focus ring and semantic day/night colors.
- **Collision actions:** blue primary buttons, outlined secondary actions and underlined text actions; all inherit a minimum 44px height. Primary hover darkens. Disabled actions reduce opacity to 0.5; the empty composer disables only its save-thought action. Collision focus uses an ochre outline (3px, offset 4px).
- **View and theme navigation:** top views use a blue underline and weight; themes use a green underline and weight. Desktop theme buttons have a 36px minimum height, increased to 44px on mobile. Selected states remain identifiable without color alone.
- **Question islands and routes:** full question names are available as accessible labels and SVG titles. Islands, editorial routes and AI proposal routes support Enter and Space. A 20-unit transparent path widens route hit areas. An expandable route list offers the same catalog comparisons in text. An island opens a connected pair rather than asserting that every theme member shares a mechanism.
- **Question encounter:** vertically stacked blue and ochre questions, a small crossing-line drawing, one start action, the catalog explanation and a serif follow-up question. The green critique prompt asks where the analogy breaks. Its label explicitly identifies it as a local, untested reading prompt, separate from MCP material.
- **Thought desk:** one free composer asks what the visitor wants to pursue now. The original pair is recoverable in a disclosure. Saved thoughts, new questions, model observations and AI proposals appear as attributed records. Branch suggestions and the personal trail provide return paths. Existing worksheet notes remain in a collapsed legacy disclosure; there are no required research stages, stamps, points, rankings or completion counts in this surface.
- **AI partner:** available actions propose a distant connection, a competing explanation or a discriminating probe. The visitor chooses what to follow and can stop a pending request. Before a request, copy explains that the current question and recent notes go to the configured model. Replies and dotted map links retain the unverified label, model attribution and actual question-source disclosure. The reviewed preview shows “AI 尚未连接”; read-only source routes, local notes, branches and runnable models remain available. The optional Responses tool loop is implemented, but live model quality is not established by this review.
- **Runnable models:** synchronization and shared-field models can start before a prediction. Prediction and boundary notes are optional; after running starts, a prior prediction cannot be added. A completed run can save its actual observation to the current trail. This is a local simplified-model record, not evidence of transfer to a real domain.
- **Sources and persistence:** dataset version and connection state stay in the map footer; question sources expand on demand. Local-save feedback and export sit beside the record. Keep connection status, source provenance, local critique, personal interpretation and AI proposal attribution distinct.

**The Inquiry Rule.** In the collision workspace, progress is a change in the visitor's question, interpretation or observation. Preserve free entry, optional tools, branching and return; do not turn the theme map or thought desk into a mandatory sequence or a reward ledger.

Dialogs keep visible enabled controls in the Tab loop, including disclosure summaries and visible SVG controls. Closed disclosure contents and hidden mobile surfaces stay outside that loop. Escape belongs to the innermost open dialog, so closing the model returns to exploration; closing exploration restores its opener. Saving a thought returns focus to its composer.

Review evidence: `../../.impeccable/review/v2-desktop-map.png` and `v2-desktop-work.png` (1440×1000), plus `v2-mobile-map.png` and `v2-mobile-work.png` (390×844), all in that folder. These are QA captures, not product assets. They show the final map/desk compositions, solid recorded route, non-shrinking mobile themes and unconfigured AI state. The handoff reports six exploration E2Es passing, including mobile theme/focus and disclosure keyboard containment. This documentation pass inspected the four captures and source; it does not independently establish live AI effectiveness, real scientific outcomes or production deployment. The broader implementation and validation report is `../../docs/upgrade-v2-2026-09-06.md`.

### Generated-island places and reading

- **Purpose guide:** five choices group questions, evidence, methods, results and connections. Each building row repeats its architectural portrait, name, purpose and a preview of actual material, separated by a fine rule. Choosing a guide row, wayfinder location or scene building approaches its real address and opens the entrance. Available material can expose a station independently of ledger growth; a missing space explains the gap. A visit is a private breadcrumb and does not unlock another space.
- **Building entrance and return:** a canvas press and release on the same frontmost research object selects its entrance when accumulated pointer travel stays within 6px; drag and cancel do not activate it. Picking uses the drawn scene graph and camera transform. The entrance repeats the building portrait and purpose, offers a semantic room diagram with actual material previews, and lets the reader explicitly choose any room or resume reading. Closing reading preserves the selected building and restores entrance-action focus; “See the island” returns to overview. Onward reading actions may go directly to an available room, including carrying a question to the library; the harbor offers the atlas return.
- **Semantic rooms:** tabs group retained floor addresses by content kind, such as open questions, arguments, original sources and competing explanations. They preserve all original items and old floor lookup rather than exposing two-item pagination as depth. Arrow keys and Home/End select rooms. The entrance and the reader's expandable research diagram address the same rooms. The drawer uses the shared dialog focus/Escape behavior and restores each room's saved reading position, starting at the top only when no position exists.
- **Reading continuity:** entrance previews do not create reading history. Explicit room reads record up to 30 UI addresses; returning and choosing a new room branches from the returned address. During the same island visit, closing and revisiting retain the selected station, room, scroll, expanded question sheet, source selections, open research desk and its input drafts. Switching islands resets transient navigation and drafts. These records support return, without creating ledger activity or a completion score.
- **Source reading:** original references show title, venue, year and a direct link when available. Editorial digests retain their summary and attached citation. A missing digest stays a reference; the question introduction does not become a paper abstract. Room copy distinguishes edited material, recorded structures and island background. Names and conversations in edited content do not imply live presence, and recorded structures still require transfer checks.
- **Personal question and model:** a disclosure offers a 1200-character browser-local island note and identifies its existing revisit/export path. The workshop can open a runnable simplified model with an explicit boundary against treating that run as validation of the island's research.
- **Question wall:** deduplicated sheets distinguish the main question, related questions and recorded open or provisionally closed questions. Each is a disclosure button with an explicit expanded state and reveals existing rewrite, author and editorial/archive context. The note action appends the selected question without replacing existing thoughts, avoids duplicate insertion and rejects overflow beyond 1200 characters with a status message. It never silently truncates a note.
- **Question into reading:** “带着此问查看本岛文献” carries the selected sheet text into the library's “带来的具体追问” section, open on desktop and initially collapsed with a one-line preview on mobile. Its scope note explicitly says the references belong to the island and have not been individually linked to that question. Returning preserves the question sheet's expansion; the carried question resets when the island changes.
- **Research desk:** the library compares two deduplicated references or editorial digests already present in its rooms, with recorded attribution and original links. A missing digest is stated explicitly; original paper text is not synthesized. Fewer than two records leaves existing sources readable without inventing a comparison. The whiteboard, workshop and unfinished garden offer private drafts for an expectation, an observation that could overturn it and a next test. These tools neither execute AI nor run an experiment. The separate simplified-model launcher retains its own boundary.
- **Draft into notebook:** the research desk keeps its open state, picks and fields during the current island visit. Only an explicit append transfers its text into the existing persistent, exportable browser-local island note. Append preserves existing text, avoids duplicate insertion and rejects overflow beyond 1200 characters while retaining both the original note and draft. It does not publish a finding.
- **Existing research material:** workshop boundary rooms, gallery stakes and unfinished-garden context reuse existing island depth. They do not turn a room label or architectural instrument into a new claim, measurement or source summary.
- **No-GPU map:** semantic SVG station buttons support Enter and Space and approach the same building entrance, followed by explicit room entry. Overview and separate claim buttons remain available. Its coastline and walking path derive from the shared scene graph and family order; visual effects and terrain styling are a reduced rendering of that scene.

**The Building Entry Rule.** Canvas, guide, wayfinder and fallback selection approach a real building and expose its semantic room diagram. Keep room reading explicit, allow any available room, and retain the building identity and return path throughout reading.

**The Reading Return Rule.** Preserve room addresses and recoverable reading context during the current island visit. Keep the bounded UI history and temporary research drafts distinct from an explicit append to the persistent private notebook. A return path, visited-room label or reading itinerary is navigation, never a scientific result.

**The Material Boundary Rule.** Keep original citations, editorial explanation, recorded structure, model observation and private question visibly distinguishable. Spatial proximity, walking paths, building size and visits organize access; none is a scientific relation or a measure of research validity.

V3 evidence: the documenter inspected `../../.impeccable/review/v3-{atlas,island,approach,interior,night,night-interior,mobile-island,mobile-interior,fallback}.png` and the current sources. Captures are QA evidence, not shipping assets. `../../docs/island-experience-v3-review.md` records `disposition: ship` for the three original findings only: night contrast, metadata placement and PRODUCT.md persistence are resolved. It is not a new whole-surface approval. The implementation handoff reports the earlier 415 web and 160 renderer tests passing, followed by 44 affected tests and both typechecks/builds after visual correction. After the later return-camera fix, the handoff reports both typechecks and build passing again and all four targeted E2E cases passing: camera/private note, phone, no-GPU and world round-trip. The earlier full 17-case run passed 16 and failed the camera case; the targeted rerun resolves that failure. No clean rerun of the entire 17-case suite is claimed. No tests or detector were rerun by the documenter. The one detector run reported 21 advisory color/type findings; repeated architectural pigments, the corrected night-action roles and reading roles are documented here, while local fallback colors, one-off effects and inherited special-purpose values are not promoted into global tokens. The implementation report is `../../docs/island-experience-v3-2026-09-06.md`; these local artifacts establish no commit, push, deployment, live AI quality or scientific validation.

V4 evidence: the source and final handoff are recorded in `../../docs/island-experience-v4-2026-09-06.md`, with the bounded independent verdict in `../../docs/island-experience-v4-review.md`. The reviewer first requested one fix: retain the selected question on the library jump and state the island-level source boundary. The same reviewer subsequently returned **ship**, that issue resolved and remaining clear; all ten recaptures were valid with no visible regression from the fix. This resolves the reported finding, not a fresh full-product review. Final QA captures are `../../.impeccable/review/v4-{transfer,question,library,night,living,living-question,unknowns,mobile-island,mobile-question,fallback}.png`; they are not shipping assets. The documenter checked source, log evidence and capture file dimensions, without rerunning the detector, tests or browser.

After the review fix, web typecheck/build passed and `/tmp/frontier-upgrade/v4-review-e2e.log` records 4/4 island E2Es passing; `/tmp/frontier-upgrade/v4-review-capture.log` records actual canvas entry, SVG keyboard entry and empty scoped question/night/mobile Axe results. The implementation handoff separately reports renderer 160/160, affected tests 54/54, follow-up picking tests 31/31 and an initial full web run of 415 passed with two timeouts, followed by 10/10 in the affected-file retry. No clean rerun of that whole web suite is claimed. The one v4 detector run (`/tmp/frontier-upgrade/v4-detector.json`) returned 19 palette/type advisories and no non-advisory findings. Repeated family pigments and question-reading roles are intentional scoped extensions; incidental older colors and one-off effects are not new system tokens or detector ignores. Local checks establish no commit, push, deployment, live AI quality or scientific validation.

V5 evidence: `../../docs/island-experience-v5-2026-09-06.md` records the implementation and `../../docs/island-experience-v5-review.md` records the bounded finish review. The reviewer opened all 11 captures and found no material visual or interaction defect; the sole finding was stale documentation. This pass corrects those rules. The final documentation review result is recorded in `../../docs/island-experience-v5-review.md`.

Final QA captures are `../../.impeccable/review/v5-{overview,question-entrance,library-entrance,library-compare,night-entrance,living-workshop,workshop-probe,mobile-entrance,mobile-question,mobile-compare,fallback}.png`. They are local QA evidence, not shipping assets. `/tmp/frontier-upgrade/v5-unit-final.log` records 29/29 related tests and `v5-e2e-final.log` records 6/6 targeted browser flows. The handoff records web typecheck, data-import checks and production build exit 0 in `v5-type-final.log` and `v5-build-final.log`; the existing large-chunk warning remains. `v5-capture-final.log` records five empty scoped Axe checks and viewport-width matches. The one `v5-detector.json` run has three advisory diagram radii and no non-advisory findings. The scoped geometry above is documented without detector ignores. This documenter checked source, logs and capture dimensions and ran only documentation integrity checks, without reopening the browser or rerunning tests or detector. The handoff preview was PID 25095 on port 5174, using the existing port 8788 local API with memory storage. These results establish no commit, push, deployment, live AI quality or scientific validation.

## Do's and Don'ts

### Do:
- Do preserve the wider atlas identity, shared font stacks and existing shell authority.
- Do keep the collision green-water map and paper desk as scoped surface decisions.
- Do preserve stable island shapes, route line-style meanings and an accessible text route list.
- Do keep free writing, optional model prediction, branching and revisiting available without completion gates.
- Do preserve readable notes, visible focus and non-shrinking mobile theme controls.
- Do distinguish catalog sources, local reading prompts, personal records and unverified AI proposals.

- Do preserve one station identity across map, guide, arrival, reading and fallback.
- Do keep purpose choices freely available, reading text legible in both themes, and source links attached to their material.
- Do preserve a family's instrument identity and stable station arrangement across landscape, portraits and fallback.
- Do carry the selected question into source reading, label island-level references accurately, and append private notes without overwriting them.

### Don't:
- Don't turn the collision workspace back into a required worksheet, stamp collection or completion counter.
- Don't use island distance, elevation or a solid personal route as scientific validation.
- Don't present an unconfigured AI partner, a local prompt or a simplified-model observation as a verified research result.
- Don't apply the collision layout or palette to the wider atlas by assumption.
- Don't treat architectural size, paths or visits as scientific evidence or a knowledge-unlock system.
- Don't claim the generated-island extension replaces the bespoke machine-curiosity QFT flow.
- Don't use family pigments, instruments, station availability or settlement proximity as a research measurement or maturity claim.

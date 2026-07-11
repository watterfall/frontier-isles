# UI / Interaction flagship pass · 2026-07-11

## Why this pass

The world-map campaign was already structurally strong on `main`: the Pixi atlas is the default L0, semantic zoom moves from climate → region → island, camera flight hands off to the ferry transition, and generated L1 islands are ledger-driven. The remaining problem was presentation and access rather than missing world logic.

Browser baseline at 1280px showed the fixed 1440×900 stage rendered at roughly 800×500 because the shell reserved obsolete external chrome. The atlas had large dead margins, account/language controls floated outside its hierarchy, the visible search field was not an input, the map gave almost no interaction guidance, mobile showed a hard-coded read-only mock instead of current island data, and the signature Day/Night lever was an unlabelled clickable `div`.

## What changed

### L0 atlas

- The fixed artboard now uses the available viewport with a quiet paper margin; at the same browser size the visible world grows to roughly 970×600 while preserving the 1440×900 coordinate contract.
- Added a persistent Impeccable design context in `.impeccable.md`: scholarly, exploratory, humane; jiehua cartography; data-grounded detail; no generic SaaS/gamification language.
- Rebuilt atlas chrome as an instrument layer rather than scattered pills: vertical seal, live-projection marker, real search, primary founding action, secondary collision action, island count, domain climate key, gesture guidance, and anomaly key.
- Search now matches bilingual names, questions, and domains; `/` focuses it, `Escape` clears it, results are keyboard-reachable, and selecting a result uses the existing camera-flight → ferry → L1 transition.
- Hover information is now a cartographic field note with a domain thread, research question hierarchy, provenance, activity, residents, and a clear landing cue.

### L1 island

- Unified generated and sample-island headers into one dossier hierarchy: level, domain, growth stage, cluster, title, QFocus, short brief, citation, sea-depth decoding, and relation summary.
- Replaced the back surface and transplant trigger with semantic buttons and complete hover/focus/active feedback.
- Rebuilt Day/Night as a labelled `button[aria-pressed]`; its knob now moves with `transform`, not a layout-property animation. Day and Night retain identical geometry and palette-only scene switching.
- Moved account/language controls clear of the transplant action on L1.

### Mobile

- Preserved the read-only architecture boundary while replacing the static mock with the real reconciled island list.
- Added bilingual search, actual chart/list-twin tabs, selectable atlas points, a focused island note, and a scrollable 27-island list.
- Added 44px-or-larger core touch targets, visible selection/focus, safe-area navigation, no horizontal overflow at 390px, and translated domain labels.

### Motion and accessibility

- One restrained entrance choreography, purposeful search/card transitions, state feedback for actions, and no bounce/elastic easing.
- The existing global `prefers-reduced-motion` kill switch covers every new animation and transition.
- Primary navigation, search, result selection, Day/Night, mobile tabs, and mobile island browsing are semantic controls with accessible names and visible focus.

## Verification evidence

- `@frontier-isles/web`: **134/134 tests pass**; TypeScript passes.
- All workspace TypeScript packages pass `pnpm -r typecheck`.
- Production build passes. The existing output still warns about one 621 kB minified chunk; Pixi scene and atlas hosts remain dynamically split.
- Browser-driven checks:
  - 1280px L0 composition and real search-result overlay.
  - Search result → camera/ferry → generated L1.
  - Generated L1 Day and Night states, including night timeline.
  - 390×844 zh-CN chart and list twin.
  - 390×844 English list with long-title wrapping.
  - Mobile body width equals viewport width; zero horizontal overflow; zero unlabeled buttons in the rendered mobile state.
- Full workspace tests execute **507 tests: 506 pass, 1 fails**. The remaining failure is an existing `packages/core/test/archipelago.test.ts` roster snapshot mismatch (current clustering output versus its checked-in snapshot); this pass does not touch core clustering or atlas data, so the snapshot was not rewritten as part of a UI change.

## Honest remaining design debt

1. Several deep L2 panels still use inline styles and clickable `div`/`span` surfaces. They need the same semantic-control and focus-state treatment as L0/L1.
2. The mobile product is intentionally read-only. A future product decision is required before founding, station work, or ledger writes can move to mobile.
3. The production build's 621 kB chunk warning needs a bundle-level investigation, separate from visual polish.
4. The core archipelago roster snapshot must be resolved against intended current data/algorithm output before the repository-wide test gate is fully green.

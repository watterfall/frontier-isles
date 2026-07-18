# Interface and world rules

Load this file for web, atlas, island, building, accessibility, or visual work. Also read `.impeccable.md`; inspect the rendered v3 prototype when changing visible behavior.

## Application boundaries

- All web network access belongs in `apps/web/src/api/client.ts`. Static fallback data stays in the dedicated fallback modules.
- The interface must preserve an equivalent route when the server or WebGL path is unavailable.
- Generated L1 scenes are data-driven. Extend `packages/assets` for new scene forms instead of drawing one-off SVG inside components.
- Day and night change palette, not geometry.
- UI strings use the translation function and must retain zh-CN/en key parity. Editorial names and in-scene captions follow their authored content contract.
- Every spatial, animated, or canvas state needs a readable DOM/list twin.

## Atlas and nested world

The default L0 is the lazy Pixi semantic-zoom atlas with an SVG fallback. It uses one continuous camera across regional and island tiers.

- `altitudeZ` is folded cartographic position, never an importance score.
- Cluster anchors are navigation entries, not value judgments.
- Satellites enter disclosure and hit-testing only at the matching zoom tier.
- Routes come from recorded ledger currents.
- Compact navigation reduces the first view to at most eight anchors, then discloses satellites; the list twin still contains every island.

Generated islands use the same layered Pixi renderer with a no-GPU scene fallback. Mobile keeps complete research reading truth; its personal notebook and model receipts remain local, while research-ledger authoring stays restricted.

## Design authority

- `.impeccable.md` defines audience, tone, aesthetics, and responsive expectations.
- `design/handoff/问题群岛-原型 v3.dc.html` is the visual authority; match its rendered result, not its implementation.
- Canonical tokens live in `packages/assets/src/tokens.css`.
- `#5A6C9E` is a deliberate component-level AI-ink constant, not a theme token.
- `.design-eng-loop/` records the engineering/taste contract and prior review rounds; load it only for work using that process.

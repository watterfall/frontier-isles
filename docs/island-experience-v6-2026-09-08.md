# Island experience v6 — architectural detail and wayfinding

This is a local refinement of generated island L1 and its existing L2 reading loop. It preserves the mineral-paper atlas, authored research material, shared spatial addresses and the separate research ledger. The bespoke machine-curiosity sample remains outside this slice.

## Direction and behavior

The island remains the largest surface. Building silhouettes now repeat in the location map, while hover or keyboard focus reveals a building name and purpose in a quiet paper label. Selection still approaches a building; entering a room is explicit.

- `StationDetails` in the shared assets package adds fixed use-related details to all nine station kinds: reading tables and books, entrance steps, roof seams, workshop tools, measurement ticks, exhibition signs, tea cups, garden labels and harbor ropes. The same asset is drawn in Pixi textures, portraits and the SVG fallback. These are architecture, not claims of occupancy or recent activity.
- The small map uses building silhouettes instead of crowded permanent labels. A selected or previewed name is disclosed with the full purpose in the caption. Direction keys move focus toward another spatial address; Home/End and Enter/Space remain available. The complete purpose-based building list is retained.
- Canvas hover, the map and the building list share one preview state. Preview changes neither the camera nor reading history. Canvas dragging clears the preview, and only primary-button clicks activate a building.
- Previously read buildings receive a short map underline and a readable label, projected from the existing local visited-floor records. Merely approaching a building does not mark it read. The optional itinerary offers the next place without opening its material or imposing an unlock condition.
- Returning to the whole island restores focus to its overview control. On a phone it also brings the landscape back into the viewport. The existing close-reader behavior preserves entrance focus and reading context.
- The preview is separately composited above WebGL. Entrance sizing includes padding in its height budget. Phone hints describe touch; reduced-motion and no-GPU routes remain available.

## Local validation

- `pnpm verify`: exit 0; 1,240 workspace tests plus 22 root script tests, recursive typecheck, projection/import checks and production build passed.
- `PLAYWRIGHT_REUSE_EXISTING_SERVERS=1 pnpm --filter @frontier-isles/web exec playwright test island-experience.spec.ts --workers=1`: 8/8 passed. Includes existing atlas return, private note, room continuity, source comparison and no-GPU paths; adds keyboard/preview/visited-state and phone-overview assertions.
- One detector pass: three advisory findings for existing room-diagram radii (20/22/24px); no non-advisory findings. No detector ignores were added.
- Final capture pass: exit 0, three empty scoped Axe checks (wayfinder, night entrance, phone reader), no page errors, and no horizontal overflow at the three tested widths. See the review record. Desktop 1440px, tablet 1024px, phone 390px, night, English UI and SVG fallback are represented. These are bounded local checks, not a full-product accessibility certification.
- After the final CSS correction, the production build and both new interaction tests passed again (2/2).
- Build retains the existing large-chunk warning and passes the enforced entry/CSS budgets. No new dependency was added.

## Runtime and evidence boundaries

The old local database refused to reconcile one catalog identity (`universal-ml-interatomic-potentials`, stored XF-1422 versus catalog XF-1389). Its data was preserved. The reviewed API used `DB_FILE=:memory:` on port 8787; Vite served this checkout on port 5173.

The development server initially returned stale transformed modules after file edits. It was restarted and the served module was checked for the new silhouette markup before the passing browser run. An incorrectly forwarded test command initially started the broader suite in parallel; it was interrupted. That run is not a passing full-suite claim.

The final screenshots live under `.impeccable/review/v6-*.png`; the capture procedure is `.verify/island-v6.mjs` (local QA, ignored by Git). Logs for this session are `/tmp/frontier-v6-{verify,e2e-final,capture-final,build-final}.log` and `/tmp/frontier-v6-detector.json`. These results establish no commit, push, deployment, live service behavior or scientific validation.

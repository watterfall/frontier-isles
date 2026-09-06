# Island experience v4 · 2026-09-06

Request: another implemented iteration with differentiated islands and direct interaction with question walls and other buildings.

## Direction contract
THESIS: A building is a direct entrance to the island's actual material; choosing a question changes what the reader carries forward.
OWN-WORLD: Preserve mineral paper, azurite ink, isometric terrain and architectural navigation. Six research families inform settlements and architectural details; stable island identity fixes their arrangement.
STORY: Enter an island, recognize its research character, open a building with one action, unfold a question, carry it into a private note and follow its sources.
FIRST VIEWPORT: Keep the large landscape with the question and compact purpose guide on the left. Rich previews belong to the guide, detailed material to the reading panel. Mobile keeps the same content and direct actions.
FORM: Extend the established surface; code-led, no replacement identity or comp tournament. Camera easing and paper disclosure are the motion grammar; reduced-motion remains supported.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Implemented
- Building/guide clicks open the reading panel directly. Returning preserves the selected place and focuses its re-entry control.
- Native pointer gestures use the same scene graph and camera transform as drawing. A matching press/release with no more than 6 px of travel opens the frontmost research object; drag/cancel does not.
- Six research families provide architectural instruments and pigments, semantic neighbors and stable per-island arrangements. Specific island topic takes precedence over a broad cluster. Coastlines retain their seeded individual form. This is a differentiated generative system, not 176 individually authored scenes.
- Renderer roads, focus routes, SVG fallback and architecture portraits share the same island character. Night lights no longer obscure the architecture; reading hides the replay control.
- Real material can expose research stations independently of ledger growth. Available sources are no longer hidden solely because an island has an early growth stage.
- The question wall contains deduplicated question sheets, their existing rewrite/author/source context, expandable details, private-note append and onward source reading. Appending preserves existing notes and rejects overflow rather than truncating it.
- Guide previews use actual island content. Workshop boundaries, gallery stakes and unfinished-garden context now surface existing depth material at the relevant place. No new research claims, measurements or source summaries were generated.

## Verification
- Web initial full suite: 415 passed, 2 unrelated atlas tests timed out under concurrent build load; both affected files reran successfully (10/10).
- Affected suite: 54/54 in six files, including all curated island settlement invariants, topic classification, material-based visibility and geometric picking.
- Follow-up picking checks: 31/31, including invisible night-only objects excluded from daytime hit testing.
- Renderer: 160/160. Web/renderer typechecks and production build passed; existing large-chunk advisory remains.
- Browser initial regression: 10/11; the new cross-island test raced the back-to-atlas transition. It now waits for the atlas and uses a fresh deep-link navigation.
- Final island browser suite: 4/4. Covers actual canvas click, drag without opening, camera restoration, question append without duplicate/overwrite, source traversal, phone reading and no-GPU keyboard entry.
- Final batch screenshots: `.impeccable/review/v4-{transfer,question,library,night,living,living-question,unknowns,mobile-island,mobile-question,fallback}.png`.
- Scoped question/night/mobile reading Axe AA: no violations. Detector run once: 19 palette/type advisories, no non-advisory findings.
- Logs: `/tmp/frontier-upgrade/v4-capture-final.log`, `v4-e2e-final.log`, `v4-affected-final.log`, `v4-renderer-tests.log`, `v4-build-final.log`, `v4-detector.json`.

## Delivery boundary
Local preview: http://127.0.0.1:5174/ . API on 8788 is the existing local memory service. No commit, push or deployment. The bespoke machine-curiosity island is outside this generated-island extension. Human evaluation of the scientific exploration experience remains separate from code and browser validation.

## Independent review correction
The fresh reviewer requested one material fix: retain the selected question when moving from a sheet to the library, and avoid implying a specific source correspondence where none is recorded. The source action now reads “带着此问查看本岛文献”; the library displays the selected question and identifies its references as island-level material. The question resets on island changes.

After this correction: web typecheck and build passed, all four island E2E tests passed again (`v4-review-e2e.log`), including the non-main question continuity assertion. The same ten screenshot states were recaptured (`v4-review-capture.log`); scoped Axe checks remained clear. The same reviewer returned **ship**, prior issue resolved and remaining clear; see `island-experience-v4-review.md`. Scoped design documentation is complete in `apps/web/DESIGN.md`, `apps/web/.impeccable/design.json` and the generated-island surface brief. The documenter preserved existing tokens and components, verified document integrity and recorded the local validation boundaries.

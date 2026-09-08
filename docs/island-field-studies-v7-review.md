disposition: ship

Final verdict pass, 2026-09-08: this disposition covers the single scored material fix below. It is not a new whole-surface review or a production-release approval. The initial review is preserved afterward as historical context.

## verdict

1. **Material fix 1 — resolved.** The recaptured `v7-index.png`, `v7-erasure.png`, and `v7-night.png` now consistently identify a comparison between unknown-location flips and known-location erasures. The added `v7-erasure-flips.png` and `v7-erasure-erasures.png` show k=3 in the two explicitly named channels, with the received-word / `C(8,k)` diagram and the known-gap / `2^(k−1)` diagram respectively. `v7-erasure-flips-en.png` shows the same distinction in the English title, question, error-channel controls, affected-bit label, and observation heading at 1024px. Current `studies.ts:107–113` and `models.ts:65` align the invitation, condition labels, observation explanation, and boundary with these channels; the boundary explicitly explains that fully located binary flips can be reversed directly. The classical-versus-quantum limitation remains. The supplied `/tmp/frontier-v7-erasure-review.log` confirms the below-fold k=3 outputs of 56 flip candidates and 4 erasure fillings in both languages, plus the boundary assertions.

All original 20 recaptures and the 3 additional erasure captures were opened individually and are valid. The correction preserves the existing diagram/control hierarchy and does not introduce a visible material regression in the supplied desktop, night, mobile, or English tablet captures. Provided model-test and build logs report 9/9 tests and one successful rebuild; the capture log records matching document widths, empty scoped Axe results, and no page errors. No browser, tests, detector, or new defect hunt ran in this pass.

## remaining

Clear for material fix 1. No partial or unresolved item remains on this scored fix list. The 19px documentation advisory is accurately recorded as the study h4 role and creates no additional fix.

disposition: ship

---

Initial review below, retained unchanged. Its `fix` disposition and contradicted row record the pre-correction state; the verdict above supersedes that single finding.

disposition: fix

Scope: independent review of the v7 ten-island extension only, 2026-09-08. No approved comp, decision comp, or QUALITY BAR card was supplied; this is an established-world local extension, so the existing `apps/web/DESIGN.md`, product truth, and supplied direction govern. All 20 required captures were opened individually. Review used supplied files and evidence; no browser, detector, or tests were rerun. Published sources were not independently re-audited in this pass. Prior dirty v6 implementation was not changed or re-certified.

## persistence

Pass. `apps/web/PRODUCT.md` exists and describes curiosity-led island/building/room exploration, private local notes, and the separation of teaching models from research evidence. `apps/web/DESIGN.md` supplies the inherited mineral-paper palette, serif display typography, architecture, room navigation, and night treatment. `docs/island-field-studies-v7-2026-09-08.md` records selection, sources, limitations, and local verification layers. A seed key or approved-comp record is not owed for this explicitly scoped local extension.

Capture evidence is valid: `v7-overview`, `v7-index`, `v7-proof`, `v7-causal`, `v7-compose`, `v7-theory`, `v7-matter`, `v7-cell`, `v7-calls`, `v7-erasure`, `v7-order`, `v7-benchmark`, `v7-evidence`, `v7-question`, `v7-sources`, `v7-night`, `v7-mobile-island`, `v7-mobile-study`, `v7-mobile-controls`, and `v7-tablet-en`, all under `.impeccable/review/` as PNG files. Each depicts its named state without blank or unsettled regions. The mobile island full-page capture starts at the document top. Desktop 1440px, tablet 1024px, and mobile 390px are represented.

Provided logs support local verification at their stated scope: workspace verification, 435 final web tests, 12 browser flows, and scoped night/mobile/English Axe checks with no recorded page errors or document-width overflow. The separately reported no-WebGL test is 1/1, not part of a single 13-test run. These are not deployment, human usability, whole-product accessibility, or scientific-result evidence.

## fidelity

| Element or promise | Judgment | Evidence |
| --- | --- | --- |
| TYPE | match | Serif questions and room headings remain the display voice; controls and technical readings use the existing body family. Chinese desktop/mobile and English tablet preserve hierarchy. |
| MATERIAL | match | Teaching geometry is crisp SVG with visible rules and computed values. The architectural environment remains the inherited context; no fabricated physical texture or new illustration style is introduced by v7. |
| GROUND | match | Paper, mineral blue, ochre, and the documented night palette remain continuous across the island invitation and interior study. |
| Island → building → room topology | match | The overview invitation, actual workshop room, source room, and return affordance share the existing navigation. `islandDepth.ts` appends addressable study/source rooms; `StationInteriorDrawer.tsx` mounts the study in the selected workshop room. |
| First viewport and signature interaction | match | All ten desktop studies foreground a specific question, subject-dependent diagram, controls, and the beginning of computed observation. They cover quantifiers, intervention, units, extrapolation, feedback, dependencies, playback evidence, coding, window counts, and dataset splits. |
| Mobile composition | adaptation | The direction explicitly permits a focusable horizontally panning figure. Mobile captures confine the clipped wide diagram to that figure, show a pan instruction, and keep controls and prose within the page. The supplied keyboard flow checks figure scrolling. |
| Scientific condition semantics | contradicted | The erasure study says only error-location information changes, while its rule and formulas change the channel from exact binary flips to erased values. See material fix 1. |
| Evidence, boundaries, and exploratory continuation | match | Sources have separate findings and limitations; teaching values are identified; bird-call behavior is qualitative rather than an invented probability; benchmark membership is not presented as model performance; onward connections carry explicit editorial/analogy boundaries. |
| Draft and note continuity | match | Per-island study state is validated on restore, mounted with the island key, and stored locally. Explicit note addition preserves prior text and handles full/duplicate entries. Supplied browser flows cover source-return continuity, reload, note capacity, and unavailable storage. |
| Motion and craft floor | match | v7 uses direct computed changes rather than decorative loops. Native controls, pressed states, 44px targets, rule disclosures, and visible reading hierarchy support the inherited world. No new kicker, metric-card scaffold, fake material, or decorative illustration was found in the extension. |

The detector's 19px finding is advisory: it applies to `.fi-field-study h4`, not the invitation title, which is 15px. It is a legible local observation/section-heading role between the 16px body and 27px study title. The two `#8A6A1E` findings are inherited outside the new study surface; neither warrants changing this extension. The documentation should name the 19px role accurately when recording the result; no ignore is needed.

## ceiling

Reached for the supplied local-extension contract: the apparatus differs with the scientific question, computation changes what the reader sees, and source reading remains spatially connected to the island. No separate QUALITY BAR card was supplied, so no claim is made against an external visual ceiling. Mobile observation appears after the controls in the vertical reading flow; the graphic changes immediately within the permitted panning surface.

## material_fixes

1. **Truth / condition semantics:** In `field-study/studies.ts:107–112`, `models.ts:44,65`, and the erasure controls/figure, stop describing the two modes as the same binary flips with only their locations revealed. For exactly k binary flips, accurate locations allow a unique inverse for every k; `2^(k−1)` instead counts fillings of k erased values under one parity constraint. Prefer retaining the valid two-channel teaching example and formulas, while explicitly naming the controls **“未知位置的翻转 / 已知位置的擦除”** and the question **“相同受影响位数下，两种错误通道留下的信息有何不同？”**, with equivalent English. State that erasure conversion changes the error representation and that the received/erased words shown are illustrative conditions, not the same observation with a location overlay. Preserve the classical-versus-quantum boundary. Evidence: `v7-erasure.png`, `v7-night.png`, and `FieldStudyFigure.tsx:89–93`; the issue also exists at k=2/3 although the provided erasure capture is k=1. Verify both channel conditions and recapture the required set for the verdict pass.

## keep

Keep the ten distinct computed apparatuses, compact architectural identity, explicit evidence boundaries, optional source/next-island paths, private-note continuity, and contained mobile diagram panning.

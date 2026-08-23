/**
 * Frozen snapshot of the upstream xfrontier corpus's RETIREMENT LEDGER.
 *
 * Why a copy lives here at all: every island pins a corpus record by `atlasN`,
 * and the corpus retires records. Until now the audit could only detect that by
 * reading a full corpus checkout at a personal path — so on any other machine,
 * and in CI, the check degraded to "not run". A retirement that only one laptop
 * can notice is not a gate, it is a memory.
 *
 * ALL 18 retirements are frozen here, not just the one this atlas currently
 * cites. Freezing the intersection would let a NEW island added tomorrow cite an
 * already-retired record and pass silently: the check has to know the whole
 * ledger to look forward, not only to explain today's one hit.
 *
 * This snapshot WILL go stale. It is treated the way the upstream session
 * treats a version-mismatched finding — shown, not trusted, not hidden: when a
 * live corpus is present the audit cross-checks both directions and reports the
 * drift rather than preferring either side silently.
 *
 * Provenance of the version string: `atlas_data.json` carries no version field.
 * `xf-6eb361265784` is the `dataset_version` the upstream session reported when it
 * resolved this repo's cited ids on 2026-08-08; the ledger file itself carries
 * its own independent `version: 3`. Two different numbers — kept separate
 * on purpose, because collapsing them would invent a correspondence.
 *
 * The notes are the upstream's OWN WORDS, quoted verbatim. They are the reason
 * a retirement can be acted on at all: "retired" alone cannot tell you whether
 * a question was answered, dissolved, or simply stopped being a frontier — and
 * those call for different things on a map of frontiers.
 *
 * Reason vocabulary in this snapshot: too_broad_generic ×5, too_mature_or_applied ×4, thin_or_misaligned_evidence ×2, narrow_single_discipline ×7.
 * What they mean upstream (their inclusion criteria, not a disposition for this
 * atlas — that call is editorial and belongs to a human):
 *   too_mature_or_applied        the work moved from research into deployment.
 *                                NOT "the question was answered" — an island
 *                                marked `resolved` on this basis would report
 *                                something the upstream ledger does not say.
 *   too_broad_generic            an umbrella field, not a single direction.
 *   narrow_single_discipline     real, but too specialised to sit as a frontier.
 *   thin_or_misaligned_evidence  the cited evidence did not support the framing.
 *
 * Where to resnap from, and where the other half of the argument lives. This
 * file's source stays `audit/retired-domain-directions.json` in the upstream
 * checkout — the retirement ledger proper. As of 2026-08-09 that repo also
 * publishes a separate, committed FINDINGS ledger at `frontier/ledger`, which is
 * where "someone is still citing this retired record" is recorded from both
 * sides at once: an entry from here saying #60 still points at XF-001449, and an
 * entry from there saying why 1449 was retired. Two views of one identifier,
 * neither overwriting the other. If you are the person deciding what happens to
 * #60, that is the other half of the file you are reading.
 */
export interface CorpusRetirement {
  /** Corpus record number — the same integer an island stores as `atlasN`. */
  n: number;
  /** Upstream retirement reason. Their vocabulary, not this repo's. */
  reason: "narrow_single_discipline"
    | "thin_or_misaligned_evidence"
    | "too_broad_generic"
    | "too_mature_or_applied";
  /** The upstream's own sentence, quoted. Never paraphrased here. */
  note: string;
}

/** `version` field of the upstream ledger file this snapshot was taken from. */
export const CORPUS_RETIREMENT_LEDGER_VERSION = 3;

/** Corpus build the cited-id resolution was last verified against (see above). */
export const CORPUS_RETIREMENTS_VERIFIED_AGAINST = "xf-6eb361265784";

/** Date this snapshot was taken, ISO. Bump with the snapshot, not with edits. */
export const CORPUS_RETIREMENTS_SNAPSHOT_DATE = "2026-08-09";

export const CORPUS_RETIREMENTS: CorpusRetirement[] = [
  { n: 292, reason: "too_broad_generic", note: "exoplanet and habitable-zone search is a large, well-established astronomy field, too broad/generic as a single frontier direction" },
  { n: 305, reason: "too_mature_or_applied", note: "amateur rocketry/STEM education rather than a frontier research route" },
  { n: 307, reason: "too_broad_generic", note: "computational social science is an umbrella discipline; more specific frontier methods remain" },
  { n: 308, reason: "too_broad_generic", note: "digital humanities/text mining is a broad mature method family; specific AI humanities routes remain" },
  { n: 322, reason: "too_mature_or_applied", note: "digital ethnography is an established qualitative method class, not a frontier domain direction" },
  { n: 328, reason: "thin_or_misaligned_evidence", note: "quadratic funding evidence is public-goods finance/Gitcoin oriented, not science-specific enough" },
  { n: 342, reason: "too_broad_generic", note: "cognitive enhancement/thinking tools is an umbrella product-method space" },
  { n: 346, reason: "too_mature_or_applied", note: "augmented analytics and decision support is an applied management/tooling category" },
  { n: 351, reason: "too_broad_generic", note: "external-brain/knowledge-management science is mostly generic tool practice" },
  { n: 507, reason: "narrow_single_discipline", note: "depth-camera sleep monitoring is a narrow healthcare application" },
  { n: 909, reason: "narrow_single_discipline", note: "thorium-229 nuclear clock is a narrow precision-metrology physics direction" },
  { n: 1080, reason: "narrow_single_discipline", note: "sodium solid-state battery interfaces are too single-discipline" },
  { n: 1082, reason: "narrow_single_discipline", note: "perovskite tandem stability is too materials-specific" },
  { n: 1084, reason: "narrow_single_discipline", note: "vitrimer thermoset design is a narrow polymer-materials direction" },
  { n: 1088, reason: "narrow_single_discipline", note: "neutral-atom error-corrected modules are too narrow quantum engineering" },
  { n: 1142, reason: "thin_or_misaligned_evidence", note: "synthetic-data governance source is narrow and malformed in metadata" },
  { n: 1168, reason: "narrow_single_discipline", note: "science bug-bounty/error-market mechanism is a narrow institutional-design proposal, not a broad research frontier" },
  { n: 1449, reason: "too_mature_or_applied", note: "perennial grain breeding (e.g. Kernza, PR23 rice) is already a deployed agroecology program, not a frontier direction" },
];

/** Lookup by record number — the shape every caller actually wants. */
export const retirementFor = (n: number): CorpusRetirement | undefined =>
  CORPUS_RETIREMENTS.find((entry) => entry.n === n);

import { describe, expect, it } from 'vitest';
import { FRONTIERS } from '../src/frontiers';
import { SEED_STRUCTURES } from '../src/structures';
import {
  CORPUS_RETIREMENTS,
  CORPUS_RETIREMENT_LEDGER_VERSION,
  retirementFor,
} from '../src/corpus-retirements';

/**
 * The upstream corpus retires records. Every island pins one by `atlasN`, and
 * several structures pin ids that are not islands at all — so a retirement can
 * strand this atlas in two different planes.
 *
 * Until the ledger was frozen into the repo, that could only be noticed on the
 * one machine holding a full corpus checkout; everywhere else the audit printed
 * "SKIPPED". These gates are the reason the whole ledger was frozen rather than
 * just the single entry this atlas currently trips: without them, the claim
 * "freezing all 18 makes the check forward-looking" is a comment, not a gate.
 */

/**
 * The ONE cited-and-retired record, as of the snapshot.
 *
 * #60 perennial-grain-crops cites XF-001449, retired `too_mature_or_applied`:
 * the work moved into deployment, which is not the same as the question being
 * answered. Which way that island goes — retired, kept with the reason shown,
 * or flagged resolved — is an editorial call that has not been made, so this
 * gate holds the line at "exactly this one, and no new ones".
 *
 * When that call IS made, edit this set. A shrinking set is progress; a growing
 * one means a new island was authored on a record the corpus had already
 * dropped, which is the failure this file exists to catch.
 */
const KNOWN_RETIRED_CITATIONS = new Set([1449]);

/**
 * Corpus record ids pinned by the structure plane. Only the STRUCTURE carries
 * `provenance.recordIds` — mappings have no provenance field at all, and ground
 * themselves through `evidenceRefs` (URLs) instead. Reaching for
 * `mapping.provenance` here silently contributes nothing.
 */
const structureCitedIds = new Set<number>();
for (const structure of SEED_STRUCTURES) {
  for (const n of structure.provenance?.recordIds ?? []) structureCitedIds.add(n);
}

describe('frozen corpus retirement ledger', () => {
  it('is a faithful, well-formed snapshot rather than a hand-typed paraphrase', () => {
    expect(CORPUS_RETIREMENT_LEDGER_VERSION).toBeGreaterThan(0);
    expect(CORPUS_RETIREMENTS.length).toBe(18);
    expect(new Set(CORPUS_RETIREMENTS.map((e) => e.n)).size).toBe(CORPUS_RETIREMENTS.length);
    for (const entry of CORPUS_RETIREMENTS) {
      expect(Number.isInteger(entry.n) && entry.n > 0, `bad record number ${entry.n}`).toBe(true);
      // The note is the only thing that makes a retirement actionable — "retired"
      // alone cannot distinguish answered from dissolved from no-longer-frontier.
      expect(entry.note.trim().length, `XF-${entry.n} note`).toBeGreaterThan(20);
    }
    expect(retirementFor(1449)?.reason).toBe('too_mature_or_applied');
    expect(retirementFor(1)).toBeUndefined();
  });

  it('lets no island cite a record the corpus has already retired', () => {
    const offenders = FRONTIERS
      .filter((f) => retirementFor(f.atlasN))
      .filter((f) => !KNOWN_RETIRED_CITATIONS.has(f.atlasN))
      .map((f) => `#${f.id} ${f.slug} → XF-${String(f.atlasN).padStart(6, '0')} (${retirementFor(f.atlasN)!.reason})`);
    expect(offenders, 'islands citing a retired record').toEqual([]);
  });

  it('lets no structure or mapping cite a retired record either', () => {
    // Read off the MODULE. `SEED_STRUCTURES` composes two expansion files in
    // through `#` subpath imports, so a file-scoped read of structures.ts cannot
    // see 21 of these ids at all — source-level extraction is closed to module
    // composition, not merely fragile against it.
    const offenders = [...structureCitedIds]
      .filter((n) => retirementFor(n))
      .filter((n) => !KNOWN_RETIRED_CITATIONS.has(n))
      .map((n) => `XF-${String(n).padStart(6, '0')} (${retirementFor(n)!.reason})`);
    expect(offenders, 'structure provenance citing a retired record').toEqual([]);
    expect(structureCitedIds.size, 'structure-cited ids seen (module-loaded, not file-scoped)')
      .toBeGreaterThan(40);
  });

  it('keeps the known exception honest — one island, named, not a blanket waiver', () => {
    // A waiver that outlives its subject is how a gate rots. If #60 is retired
    // or re-pointed, this fails and the waiver has to be deleted with it.
    for (const n of KNOWN_RETIRED_CITATIONS) {
      const citing = FRONTIERS.filter((f) => f.atlasN === n);
      expect(citing.length, `XF-${n} is waived but no island cites it — delete the waiver`).toBe(1);
      expect(retirementFor(n), `XF-${n} is waived but is not retired upstream`).toBeDefined();
    }
  });
});

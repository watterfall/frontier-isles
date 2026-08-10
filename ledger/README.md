# Observation ledger

What this project noticed about data — its own, and other projects' — recorded as annotations on identifiers rather than as messages to whoever publishes them.

Contract: `docs/observation-ledger-v1-2026-08-09.md`. Gate: `node scripts/validate-observations.mjs`, which runs inside `pnpm typecheck`.

This is **stage 1** of that contract: the file exists, the field rules are enforced, nothing is exposed to peers yet. MCP tools, an HTTP feed by subject, and signatures are stages 2–4.

## How to read it

- **An entry is true only for the version in `asserted`.** When the subject moves, the entry is *stale* — shown, not trusted, not hidden. Deleting it destroys the record that someone once saw this; trusting it silently propagates a claim about data that no longer exists.
- **`by_type` is the only field that says whether a person was involved.** Never infer it from a timestamp. "Last touched" is not "reviewed by" — that inference mislabelled 1504 records in the upstream corpus, which is why the rule is written down rather than remembered.
- **`by` is who made the observation; `filed_by` is who wrote the entry.** They differ whenever something is relayed, which is the permanent state for any provider this project will never mount — the same findings previously reached their subject by hand and landed in another project's ledger attributed to `frontier-isles` without `frontier-isles` having written a single one. A provenance field with no write path behind it silently lies.
- **The summary counts; it does not assert.** It reports `self` / `relayed` / `unrecorded` from what each entry records. The earlier version printed a ratio "written by the actor named in `by`" that was computed by matching one hardcoded actor string, stating something no field in the file could carry. When a derived statistic and its label disagree, the label is the part that gets believed.
- **`signature: null` means unsigned and says so.** A missing `signature` key is a contract violation, not a shorthand. Until stage 4 every entry is unsigned, so `by` is a claim, not proof.
- **Disagreement is preserved, not merged.** A superseded observation is corrected by appending a new entry on the same `about`; the old line is never edited.

  What the gate actually establishes, in two halves, because the first half alone reads stronger than it is:

  - **Holds.** No commit in this file's history rewrote or removed an entry a previous commit contained — the gate walks every committed version and requires each to be a line-wise prefix extension of the one before. It also catches an edit still sitting in the working tree, which fails earlier and reads better.
  - **Does not hold.** A rewritten history defeats it. The gate reads the history it is given, so a rebase or force-push that drops a record before the gate runs leaves nothing to find. Append-only here defends against ordinary mistakes and against a later version of whoever maintains it — not against someone rewriting the past. That needs signatures (stage 4) or an externally anchored log, and this is neither.

  The working-tree comparison used to be the whole check, and it was weaker than this bullet claimed: commit the edit and `HEAD` moves with it, so the same comparison reports clean. Verified, not assumed — a rewritten entry, committed, passed with `append-only: ok` and exit 0.

  **What it enforces with and what it explains with are different quantities.** Enforcement is positional, because only a positional comparison sees an entry inserted mid-file or the lines reordered — cases where the id set is untouched. Reporting is re-derived from the id set, because positional drift describes one deletion as a run of rewrites: remove entry 5 and 6, 7, 8 shift up, so the accurate positional message reads like four tamperings. You get `entry \`obs-…\` was REMOVED` instead. Where the two disagree — positional failure, no id-level difference — the message says so: an insertion names the entry, a pure permutation says the entries were reordered. If a line will not parse or its id is missing or duplicated, the id view is impossible and the report falls back to line positions and announces that it did.
- **A `population` stores a recomputable selector**, never a frozen id list. A frozen list keeps asserting itself after the population has moved.

## What does not go in here

The exclusions are load-bearing. Without them this becomes a log that contains everything and is therefore read by no one.

- **Methodology.** "I should have module-loaded instead of grepping" is about an operation, not about data.
- **Proposed data.** "This record should link to that structure" is a proposal and takes the proposal path, where it has to pass stated criteria first. Note the asymmetry that makes the two genuinely different: *proposing data requires the record to exist; observing an identifier does not* — observations about withdrawn or never-issued ids are among the most useful entries here.
- **Facts about someone else's data.** The subject decides the home. An observation about the xfrontier corpus belongs in this file only while this project is the one that made it; an observation about *this* project's data belongs here no matter who noticed it.
- **Code review findings.** "This script reads a field that is undefined at runtime" is about code and has its own home.

## Fields

```
id           stable, unique
about        { id, scale }            scale = record | field | population
                                      population also carries { predicate, n }
kind         free-form; the vocabulary grows from use rather than being predefined
asserted     at least one of dataset_version | content_hash | repo_commit
statement    one sentence, readable by someone who was not there
evidence     resolvable references (paths, ids, or a command that reproduces it)
by           normalized actor id (did: | orcid: | github:) — who MADE the observation
filed_by     who WROTE the entry; null when that is `by`. Required on entries
             appended after 2026-08-10; earlier ones predate the field and are
             counted `unrecorded`, never folded into either side
by_type      human | model | derived
signature    null until stage 4 — the key is required even when the value is not
observed_at  ISO date
```

## Appending

Append one JSON object per line, then run the gate. It checks the field contract, uniqueness, and that nothing already committed changed.

# Observation ledger

What this project noticed about data — its own, and other projects' — recorded as annotations on identifiers rather than as messages to whoever publishes them.

Contract: `docs/observation-ledger-v1-2026-08-09.md`. Gate: `node scripts/validate-observations.mjs`, which runs inside `pnpm typecheck`.

This is **stage 1** of that contract: the file exists, the field rules are enforced, nothing is exposed to peers yet. MCP tools, an HTTP feed by subject, and signatures are stages 2–4.

## How to read it

- **An entry is true only for the version in `asserted`.** When the subject moves, the entry is *stale* — shown, not trusted, not hidden. Deleting it destroys the record that someone once saw this; trusting it silently propagates a claim about data that no longer exists.
- **`by_type` is the only field that says whether a person was involved.** Never infer it from a timestamp. "Last touched" is not "reviewed by" — that inference mislabelled 1504 records in the upstream corpus, which is why the rule is written down rather than remembered.
- **`by` is who made the observation.** In this ledger it is also who wrote it, and the gate reports that ratio on every run. That is not a courtesy: the same findings previously reached their subject by hand, and ended up in another project's ledger attributed to `frontier-isles` without `frontier-isles` having written a single one. A provenance field with no write path behind it silently lies.
- **`signature: null` means unsigned and says so.** A missing `signature` key is a contract violation, not a shorthand. Until stage 4 every entry is unsigned, so `by` is a claim, not proof.
- **Disagreement is preserved, not merged.** A superseded observation is corrected by appending a new entry on the same `about`; the old line is never edited. The gate enforces this against `HEAD` — every committed line must still be present, byte-identical, in order.
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
by           normalized actor id (did: | orcid: | github:)
by_type      human | model | derived
signature    null until stage 4 — the key is required even when the value is not
observed_at  ISO date
```

## Appending

Append one JSON object per line, then run the gate. It checks the field contract, uniqueness, and that nothing already committed changed.

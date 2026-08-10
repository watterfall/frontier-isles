# Observation Ledger v1 — 反馈即标注，不是消息

**Status:** proposal for stages 2–4; **stage 1 implemented** (`ledger/observations.jsonl`, gated by `scripts/validate-observations.mjs` inside `pnpm typecheck`). The criteria below were fixed *before* that implementation, on purpose — see "Why criteria first".

**Scope:** how this platform shares findings *about data* with other projects, at a scale where neither side is a special case. Not about sharing the data itself; that already works.

---

## 1 · The case that produced this

On 2026-08-08/09 this repo consumed the xfrontier corpus over MCP to take the atlas from 176 to 371 islands. Using the data produced findings *about* the data that its publisher could not have derived alone:

- one cited record was retired upstream, and this repo was still pointing at it;
- the `structures` field is cluster-derived, so it cannot answer "which record instantiates this skeleton" — measured at 378 rejections in 419 candidates;
- the retirement ledger is a clean partition of the issued id space (1848 live + 18 retired = max id 1866, no holes, no overlap), which is a completeness property the publisher's own bookkeeping cannot produce, because bookkeeping knows what it wrote, not what it missed.

All of it reached the publisher **by hand**, relayed between two agent sessions. The publisher's ledger now carries entries attributed to `frontier-isles`, and **not one of them was written by frontier-isles** — this project has no write path, so a second party typed them in. Their README had to add a paragraph stating that `by` means who made the observation, not who typed it, and that `by: frontier-isles` is therefore *not* evidence that a second party holds a tool connection.

That paragraph is the whole problem in one sentence: **without a write path, the provenance field silently lies, and the correction has to be prose.**

The obvious fix — "every provider adds a `report_finding` tool" — is O(N²). N consumers × M providers means mounting M servers, learning M vocabularies, and re-encountering M copies of the same design mistakes (the upstream reused its *proposal* guard for observations and its ledger rejected the very entries it was built for). Worse, it has a precondition that fails constantly: **the provider must implement a write interface before you can say anything.** Unmaintained sources, non-MCP sources, and sources that simply decline are all unreachable.

## 2 · The flip

> **A finding is not a message to a provider. It is an annotation on a shared identifier.**

The subject is a globally resolvable id — `XF-001449`, `doi:10.1126/…`, `opp:machine-curiosity`. Once the subject is stable, the annotation does not need to know who is listening.

| | Message model | Annotation model |
|---|---|---|
| Written to | the other party's store | **your own ledger** |
| Requires of the other party | a write interface, credentials | **nothing** |
| If they disappear | the finding goes with them | annotation and subject both survive |
| N participants | O(N²) channels | O(N) ledgers + subscription |
| Disagreement | needs deliberate design to preserve | **coexists by construction** |
| Attribution | asserted by whoever types it in | equals the writer, by construction |

The decisive property is row 2. The annotation model works against a provider that implements nothing, which is why it scales and `report_finding` does not.

This is not a new protocol surface. `architecture.md` §6 already commits to **W3C Web Annotation** as an interop surface (currently a note on the literature station, `packages/core/src/stations.ts`), and §5 fixes the boundary: peers connect through problem-object `.md`, the ledger format, and MCP — never shared code. An observation rides the ledger. MCP and HTTP are transports for it, not homes for it.

## 3 · Why criteria first

The upstream session's rule, adopted here: **criteria are fixed before the run, because the same question produced three mutually incomparable numbers in the era before pre-registration.** A shared-feedback substrate is exactly the kind of thing that acquires its semantics by accident once data is flowing. So the three criteria below, and the exclusions in §5, are normative now and changing them is a `DECISIONS.md` entry, not an implementation detail.

### C1 · Leavable

> **Test:** does a participant that stops running every MCP client still hold everything it contributed and everything it read?

The platform already holds this invariant ("an open platform must be leavable", §6). The sharing layer must not weaken it.

**Failure sample:** observations are readable only through MCP tool calls. The data is then locked inside the transport, and the ecosystem is rented rather than shared.

### C2 · No center

Aggregation happens at the reader, like a feed reader — never in a shared store that all projects write into.

**Failure sample:** a central "shared findings platform" appears. Within a year it is a trust bottleneck, a single point of failure, and — without §5's exclusions — a log that contains everything and is therefore read by no one.

### C3 · Attribution is verifiable, not declarable

At two-party scale a README paragraph can correct a lying `by` field. At N-party scale it cannot.

The fix is **not** a `filed_by` field. As the upstream put it when declining to add one: that gives the workaround a comfortable notation instead of removing the reason for the workaround. The fix is a signature from the identity that made the observation — this platform already has the identity chain (GitHub OAuth → ORCID, and `did:mcp:` / `github:` / `orcid:` normalization in `apps/server/src/mcp.ts`).

**Failure sample:** `by` is settable by the writer, unsigned observations are indistinguishable from signed ones, and the caveat lives in prose that no machine reads.

## 4 · The event

An `observation` is a ledger event. No new store.

```
observation
  id          stable, unique
  about       { id, scale }          scale = record | field | population
                                     population stores a RECOMPUTABLE selector
                                     ({predicate, n}), never a frozen id list
  kind        free-form; the vocabulary grows from use, it is not predefined
  asserted    at least one of { dataset_version | content_hash | repo_commit }
  statement   one sentence, readable by someone who was not there
  evidence    resolvable references
  by          actor id (did: | orcid: | github:) — who MADE the observation
  filed_by    actor id, or null when the filer is `by` — who WROTE the entry
  by_type     human | model | derived      ← the ONLY signal that a person was involved
  signature   present, or explicitly null — a missing key is a violation
  observed_at ISO date
```

`kind` is deliberately open. A predefined taxonomy would be a guess about what
future consumers notice; letting the vocabulary grow and reporting its
distribution is what the upstream corpus does, and it costs nothing to reverse.

`filed_by` was added on 2026-08-10, after §3's argument against it turned out to
rest on a false premise. The argument was that a field naming the filer gives
the workaround a comfortable notation instead of removing the reason for it —
true while proxy-filing is a transitional state, false once a provider is one
this project will never mount. For those, relaying is the permanent state, and a
ledger that cannot say so has to assert something instead.

**Derived statistics must count from what is recorded, never assert.** The gate
previously printed "N/N written by the actor named in `by`", where N counted
entries whose `by` matched one hardcoded string — a sentence stating a fact the
file could not carry, which any second author would have quietly falsified. It
now reports three buckets (`self` / `relayed` / `unrecorded`) so the entries that
predate the field are claimed for neither side. This is the same "a missing key
is not null" discipline as `signature`, reappearing one layer up in the summary,
which is where it is easiest to miss: the entry-level rule was already right and
the statistic over those entries was still wrong.

Fields added after entries exist cannot be required of those entries — the file
is append-only, so they cannot be edited to carry them. The gate enforces a new
required field only from the committed prefix onward, which grandfathers exactly
the entries that predate it and needs no version stamp to stay in sync.

Three field rules, each earned:

1. **`by_type` is never inferred from a timestamp.** The upstream's API layer mislabelled 1504 records that way. "Last touched" is not "reviewed by".
2. **An observation is true only for the `asserted` version.** When the subject moves, it is marked `stale` — **shown, not trusted, not hidden.** Deleting it destroys the record that someone once saw this; trusting it silently propagates a claim about data that no longer exists.
3. **Version binding must be two-way.** Binding to a `dataset_version` alone depends on the publisher honestly reporting it. Storing the subject's `content_hash` as well makes staleness computable by *either* side independently. Publishers should emit content hashes; consumers should store them. This makes revision detection work *from now on* rather than fabricating a history nobody kept.

## 5 · What the ledger refuses

Exclusions are load-bearing, not fastidiousness. A shared ledger without them becomes the junk drawer of C2's failure sample.

- **Methodology observations.** "I should have module-loaded instead of grepping" is about an operation, not about data. A year of those is an undifferentiated log.
- **Proposed data.** "This record should link to that structure" is a proposal and takes the proposal path, where it must pass pre-registered criteria. Observations and proposals look alike and behave differently: *proposing data requires the record to exist; observing an identifier does not.* Reusing a proposal's guard for observations is a real bug — it rejects observations about withdrawn and never-issued ids, which are precisely the ones worth recording.
- **Facts about someone else's data.** The subject decides the home. "This repo's structure mappings ground through `evidenceRefs`, not record ids" is a fact about *this* repo and belongs in *this* ledger, whoever noticed it.
- **Findings about code.** Neither ledger can hold "this audit read a field that is undefined at runtime for all 135 mappings". That is a code review finding and has its own home.
- **Unversioned assertions.** No `asserted` field, no entry.

## 6 · Boundary with §4 (AI never pushes)

An observation is an annotation, not a station push, so recording one does not cross the governance line — it creates no research edge and finalizes no human mapping.

The capability gateway still applies, in the platform's existing shape: **degradation, not rejection.** An ungranted actor's station push already degrades to a dock proposal rather than being refused. An ungranted actor's observation degrades to **uncredited**: recorded, readable, queryable, and excluded from every projection and count.

Refusing the write would be the wrong default here for a specific reason: **the value of a finding is often highest when it comes from someone without permission** — an outside consumer is exactly who notices that a field is a weak proxy. Rejection loses that; uncredited keeps it without letting it move any number.

## 7 · Exposure

One source of truth, three ways out — mirroring what the platform already does for the ledger:

1. **Ledger event** — the truth. `events.jsonl`-isomorphic, append-only.
2. **MCP tools** — `report_observation`, `read_observations(about)`. Agent path. Adding these amends the tool list in `architecture.md` §6 and needs a `DECISIONS.md` entry.
3. **HTTP feed, queryable by `about`** — for participants with no MCP client at all. This is what makes C2 possible: subscribe and merge by subject, no center.
4. **Export as `.jsonl`** — C1. Also fixes the quieter problem that without bulk export, "the analysis lives in a notebook" means "the analysis lives in a local checkout", which excludes everyone without one.

Bulk reads must be **bounded**. Unbounded pairwise export upstream returned 759 KB in one call (~190k tokens); no export at all excludes people without a checkout. Both failures are real; the answer is a documented cap with an explicit error, not silence in either direction.

## 8 · Stages

**Stage 1 — validation, no protocol change. DONE (2026-08-09).**
`ledger/observations.jsonl` holds the findings this repo has already produced — 4 about the xfrontier corpus, 3 about this repo's own data — in the `events.jsonl`-isomorphic shape §4 specifies. `scripts/validate-observations.mjs` enforces the field contract, uniqueness, and append-only, and runs inside `pnpm typecheck`. Nothing is exposed to peers yet, and the server's gateway is untouched.

Append-only is checked in two places for one reason: the first version compared the working tree against `HEAD`, which only ever catches an *uncommitted* edit — commit it and `HEAD` moves with it, so the same comparison reports clean. A rewritten entry, committed, passed that gate with `append-only: ok` and exit 0. The property now lives in a walk over the file's own commit history, requiring each version to be a line-wise prefix extension of its predecessor; the working-tree comparison stays because it fails earlier and reads better. The residual limit is stated in `ledger/README.md` rather than left implied: this reads the history it is given, so a rewritten history defeats it, which is a job for signatures (stage 4) or an external anchor.

A `--diff-filter=MDR` history check does not transfer here, though it is the natural fix for a ledger that stores one file per record: with a single append-only JSONL a legal append is also a modification, so that rule would reject every append. The storage shape decides the check.

*Acceptance — partly met, and the shortfall is recorded rather than reworded.*
This paragraph originally cited the gate line `7/7 written by the actor named in
by` as proof that proxy-filing does not happen under the annotation model. That
line was withdrawn on 2026-08-10: it counted entries matching one hardcoded
actor string and asserted a fact the file recorded nowhere (see `filed_by`
above). Citing it here while debunking it two sections up is the same defect
twice — a claim in prose with no check behind it.

What holds without it: the entries exist, they are plain JSONL a human opens,
and each names the actor who made the observation. What does *not* hold yet is
the measurement — the eight entries predating `filed_by` are counted
`unrecorded`, so the ledger cannot presently show that its writer and its `by`
coincide. The claim becomes measurable from the first entry carrying the field,
and until several do, "proxy-filing does not happen here" is an argument, which
is exactly the status this stage was meant to change.

*Not decided by this stage:* the repo-level placement is the only option that avoids touching the gateway, not an answer to §10's island-ledger question. Stage 2 has to answer it.

**Stage 2 —** MCP `report_observation` / `read_observations`, gateway-degraded per §6. Amends §6 tool list.

**Stage 3 —** HTTP feed by `about` + a subscriber that merges an external feed. This is the stage where O(N) becomes real; before it, this is a private ledger.

**Stage 4 —** signatures (C3). Until then every entry is explicitly `signature: absent`, machine-readable, never prose.

## 9 · How to tell this failed

Checked against these, not against "does it run":

1. **The document shipped and nothing user-visible changed.** Stage 1 must produce a file a human opens.
2. **The capability landed in a test or a demo** rather than in the ledger a reader actually reads.
3. **A central store appeared** — including the soft version, where one project's feed becomes the de-facto place everyone writes to.
4. **`by` is writer-settable with no machine-readable marker** for unsigned entries.
5. **The exclusions eroded.** The first "let's just log this too" that does not fit §5 is the beginning of the junk drawer, and it will be argued for on convenience.

## 10 · Open, and for a human

- **Ledger placement.** Does an observation about an island's own data belong in that island's ledger (where the island's readers see it) or in a repo-level ledger (where cross-island patterns are visible)? Both have a real reader; picking silently would be picking for someone.
- **Publicness.** A public feed means "who found what wrong with my data, and when" is public. The upstream chose public deliberately, reasoning that a corpus which already publishes its own gaps — expectation vs current value side by side, retirements kept with reasons rather than deleted — has already accepted that shape. Whether this platform accepts it is not a technical question.
- **Retention.** Append-only forever, or a retraction event? The platform already has the answer for focus records (item 12 in `DECISIONS.md`: a real retraction needs its own compensating event, never a silent re-render). The same rule probably applies, but "probably" is not a decision.

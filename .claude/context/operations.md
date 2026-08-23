# Operations and verification

Load this file only for local runtime, build, test, or debugging work.

## Common commands

```bash
pnpm install
pnpm dev
pnpm verify        # test + typecheck + build — run this before reporting done
pnpm test          # every workspace package, then pnpm test:scripts
pnpm test:scripts  # node:test over scripts/*.test.mjs (root scripts are not a package)
pnpm typecheck
pnpm build
pnpm test:e2e
```

**Root `scripts/` is not a workspace package,** so `pnpm -r test` never reached
it. The ledger gate's git-failure branches lived there with no suite at all: a
mutation run could not even report them uncovered, only "unreadable", because
there was nothing to be red. `pnpm test` now chains `test:scripts` so they are
covered by the same command everything else is.

**`pnpm test` and `pnpm typecheck` do not build.** `pnpm typecheck` runs the
release-doc and observation-ledger checks plus `tsc --noEmit`; neither it nor
the test run invokes Vite, so the bundle guards in `apps/web/vite.config.ts`
(entry-chunk budget, forbidden eager modules, CSS budget) are not exercised.
That gap is not hypothetical: the wave-3 structure mappings pushed the entry
chunk 85 KiB past its budget and two consecutive rounds reported everything
green while `pnpm build` failed. `pnpm verify` is the whole gate; use it before
saying work is done. CI (`.github/workflows/ci.yml`) runs the build too, but
only on pushes that trigger it — a worktree branch gets no such signal.

**Conclude from the exit code, never from a filtered view of the output.**
`pnpm verify > log 2>&1; echo $?` is the report; `| grep … | tail -n` is for
reading detail afterwards. A one-ended truncation hides exactly the thing being
looked for: `tail -n` drops the earliest failures, `head -n` never reaches a
verdict printed at the end, and a pipeline's `$?` is the last stage's, so a
failing command upstream of a successful `grep` exits 0. This is not
hypothetical either — an adjacent project reported a full green run read out of
a `head -30` view whose report had 34 passing lines before the first warning.

**A green suite is not evidence that a property is covered.** The only check
that separates "tested" from "test-shaped" is to break the property and see the
suite go red. Done here on 2026-08-10 across nine mutations, it found a test
file named for the retired-source notice whose three assertions all passed with
the notice deleted from the screen — it covered the data feeding the notice, not
the notice. Two rules that came out of that run: measure red **relative to an
unmutated baseline**, since a suite already failing for an unrelated reason
reports every mutation as caught; and assert on the violation's own text rather
than a keyword, since a gate's explanatory output mentions the same field names
its violations do.

**Negative assertions fail in two directions, and both are quiet.** "X is
absent" is also true when *nothing at all* was produced — the first draft of the
render test above passed its two absence cases against a loading placeholder
containing no markup. Pair every absence assertion with a positive one proving
the subject rendered. The other direction: an absence assertion is only as
strong as the guess about how a defect will be worded.
`doesNotMatch(/not a git repository/i)` was unfalsifiable here — the gate had
never printed those words, they lived only in a comment — and a regression
naming the cause as "not a git checkout" passed it untouched, verified by
running both mutations together for 0 red. Where the wording *is* the contract,
pin the whole sentence: every rewording turns it red, including the ones a
forbidden-phrase list would never have anticipated. Population scans have the
same shape — "no offenders" is also what "no records scanned" produces, so
assert the population size beside the result.

**Deciding whether an absence assertion is falsifiable means asking whether the
code under test can produce that string — which is not the same as whether the
string appears in its file.** At least six routes produce one: a source literal;
something the source calls (i18n tables, constant maps); echoed test input (a
secret fed in specifically so the assertion can prove it does not leak — its
absence from source is the point); a data file outside `src/`; string
interpolation (`data-lamp={kind}` produces `data-lamp="questions"`); and
source-to-output transformation (JSX `className` renders as `class=`, a style
object renders as `color:#A89C88`, `markerEnd` renders as `marker-end`). A
screen that knows only the first route flags precisely the healthiest
assertions. The 2026-08-10 sweep of this repo produced 13 literals with no
apparent producing path; hand-checking found the last two routes accounted for
most of them, one legitimate don't-reintroduce guard for a string git history
shows was removed, and two forbidding markup that never existed.

**A sweep must report its own coverage, or a silent truncation reads as a clean
result.** The first version of that sweep used `return` where it meant
`continue` inside the directory walk, which exited the walk for the entire
directory — remaining files and every subdirectory below it went unscanned. It
printed findings but no file count, so nothing looked wrong, and "3 unexplained"
was reported over a fraction of the tree. Printing `scanned: N test files` and
checking N against an independent count (`find`, or the runners' own totals)
made it visible immediately: 124, matching.

**A mutation says something only about assertions that actually ran.** An
earlier assertion throwing, a skipped case, or a timeout all make "the later
assertion did not error" look like "the later assertion passed" — the same
non-result-read-as-result, hiding inside one test's assertion order. Across the
suite the equivalent is `.only`: one committed marker shrinks the run to a
single case and still reports green, which would quietly invalidate every
"nothing turned red, so this is uncovered" conclusion. `pnpm test:scripts` gates
that (`scripts/suite-integrity.test.mjs`), reports skipped/pending counts
without gating them, and asserts its own file-count so a truncated walk cannot
report a clean tree. Read a NOT CAUGHT only after checking the harness's scope:
two mutations against that gate reported NOT CAUGHT because the harness was
still pinned to one file in `scripts/`, which reads exactly like a broken gate.

**Matcher behaviour on a missing subject is runner-specific and must be run, not
assumed.** `expect(undefined).not.toHaveProperty('x')` is a known hazard in some
runners — it passes, so indexing into an empty array reads as "the field is
correctly absent". Under this repo's vitest it does the opposite and throws
`TypeError: Cannot convert undefined or null to object`, so the shape is safe
here. `toMatchObject` and `toEqual` also throw on `undefined`, which is what
makes them usable as the guard above such an assertion. Verified with a
throwaway probe rather than carried over from another project.

`pnpm dev` starts the API and WebSocket server on `:8787` and the Vite web app on `:5173`. Before describing live application state, confirm which process owns each port; a response from one listener does not prove the other is running.

## Narrow iteration

```bash
pnpm --filter @frontier-isles/core test
pnpm --filter @frontier-isles/server exec vitest run test/server.test.ts -t "gateway"
pnpm --filter @frontier-isles/server seed
pnpm --filter @frontier-isles/server mcp -- --island machine-curiosity --agent github:scout
```

- Packages are just-in-time TypeScript sources; Vite, tsx, and Vitest read them directly.
- pnpm blocks unapproved postinstall scripts; native builds are allowlisted through `pnpm.onlyBuiltDependencies` in the root package file.
- To recreate local data, stop the server, remove `apps/server/data/isles.db*`, and restart. These database files are ignored by Git.
- When an animated SVG blocks an end-to-end click, assert the ledger result through the API and use forced interaction only when the animation is the confirmed cause.

## Verification contract

Use the narrowest relevant check while iterating. A complete product slice normally requires tests, recursive typechecking, production build, the relevant browser round trip, and `git diff --check`.

For visible changes, verify the actual desktop and compact routes, keyboard and focus behavior, reduced motion, horizontal overflow, persistence, and browser console errors. Report observed totals and routes rather than copying historical counts from documentation.

# Operations and verification

Load this file only for local runtime, build, test, or debugging work.

## Common commands

```bash
pnpm install
pnpm dev
pnpm verify        # test + typecheck + build — run this before reporting done
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e
```

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

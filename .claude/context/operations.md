# Operations and verification

Load this file only for local runtime, build, test, or debugging work.

## Common commands

```bash
pnpm install
pnpm dev
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e
```

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

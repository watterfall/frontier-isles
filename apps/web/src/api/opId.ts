/**
 * Op-id string helpers, kept in a module of their own so that importing them
 * cannot drag anything heavy along.
 *
 * They used to live in `structureFallback.ts`, which also pulls in
 * `SEED_STRUCTURES` — 261KiB of structure and mapping data across three source
 * modules. `chart/connectionField.ts` imported `slugOfOp` from there and is
 * itself on the eager path, so one two-line helper was enough to anchor the
 * whole seed catalogue in the entry chunk.
 *
 * Mirrors the server's `opIdFor` in `apps/server/src/store.ts`.
 */

/** `op://frontier-isles/prob/<slug>` — the server's canonical island op id. */
export const opIdFor = (slug: string): string => `op://frontier-isles/prob/${slug}`;

/** The trailing slug of an op id; returns the input when it has no path. */
export const slugOfOp = (op: string): string => op.split('/').at(-1) ?? op;

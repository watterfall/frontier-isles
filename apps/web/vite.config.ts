/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Runtimes that must never land in the eager entry chunk. Each is used only
 * behind a route, a gate, or a dynamic import, and each is large enough that
 * leaking one materially slows the first paint for every visitor — worst where
 * bandwidth is worst, since there is no Fly region in mainland China.
 *
 * This is enforced rather than documented because the pixi rule WAS documented
 * — main.tsx says both hosts "dynamic-import so pixi.js stays out of the default
 * bundle" — and broke silently anyway: one value import of pure explorer math
 * from the `@frontier-isles/renderer/pixi` barrel (rather than its headless
 * `atlas-lod` entry) pulled 786KB of pixi.js and 245KB of gsap into the entry.
 * Nothing failed; the bundle just quietly grew. A type-only import is fine —
 * it is erased before this check ever sees a module.
 */
const ENTRY_DENYLIST = ['pixi.js', 'gsap', 'yjs', 'y-websocket', 'yaml', 'zod'];
/**
 * Hard build budgets, in KiB. These must equal `bundleBaseline.*.rawBudgetKib`
 * in docs/release-manifest.json — `scripts/verify-release-docs.mjs` asserts the
 * two agree, so a budget raised here without a re-measured baseline there fails
 * the gate instead of quietly passing against a stale number.
 *
 * Keep real headroom above the recorded measurement. A budget sitting ~100
 * bytes over the current build is not a budget: the next single rule fails
 * `pnpm build` for whoever happens to write it, with no signal that anything
 * regressed.
 */
const ENTRY_JS_MAX_BYTES = 1024 * 1024;
const CSS_MAX_BYTES = 244 * 1024;

/**
 * Workspace modules that must stay alone in a chunk of their own, reachable
 * only through `import()`. `atlas-detail` is the deferred half of the L0 atlas
 * (card prose + citations, ~127KB): the generator splits it out precisely so it
 * blocks nothing, and any static import silently undoes that by folding it into
 * whatever chunk did the importing. That is not hypothetical — a static import
 * from the lazily-mounted island screen put it in the chain a visitor waits on
 * when opening an island, and on CI that pushed the L1 mount past its budget.
 * Checking every chunk, not just the entry, is what catches that second case.
 */
const ISOLATED_MODULES = [/\/packages\/data\/src\/atlas-detail\.ts$/];

/**
 * Workspace modules that may live in any chunk EXCEPT the eager entry.
 *
 * The seed structure catalogue is ~261KiB across three source modules and is
 * needed only once a reader opens the structure lens. It reached the entry
 * anyway, twice over: two eager screens imported `api/structureFallback` for
 * its fallback data, and `chart/connectionField.ts` imported a two-line
 * `slugOfOp` helper that used to live in the same module.
 *
 * The size check alone did not catch it in time — the wave-3 mappings pushed
 * the entry 85KiB past budget and both `pnpm -r test` and `pnpm typecheck`
 * stayed green, because neither runs a build. This names the module so the
 * failure says WHAT leaked rather than only that the total grew.
 */
const ENTRY_FORBIDDEN_MODULES = [/\/packages\/data\/src\/structures(-expansion-wave\d+)?\.ts$/];

/** Fails the build on a denylisted package in the entry chunk, on an isolated
 *  module folded into somebody else's chunk, or when the measured entry/CSS
 *  budgets regress beyond the dated baseline in docs/release-manifest.json. */
function guardEntryChunk(): Plugin {
  return {
    name: 'guard-entry-chunk',
    generateBundle(_options, bundle) {
      for (const [file, out] of Object.entries(bundle)) {
        if (out.type === 'asset') {
          if (file.endsWith('.css')) {
            const bytes = typeof out.source === 'string' ? Buffer.byteLength(out.source) : out.source.byteLength;
            if (bytes > CSS_MAX_BYTES) {
              this.error(
                `CSS asset ${file} is ${(bytes / 1024).toFixed(1)}KiB; the release budget is ` +
                  `${CSS_MAX_BYTES / 1024}KiB. Consolidate selectors/tokens or update the budget ` +
                  `with measured evidence in docs/release-manifest.json.`,
              );
            }
          }
          continue;
        }
        const ids = Object.keys(out.modules);

        // An isolated module may share its chunk with nothing else.
        const isolated = ids.filter((id) => ISOLATED_MODULES.some((re) => re.test(id)));
        if (isolated.length > 0 && ids.length > 1) {
          const name = isolated[0]?.split('/').pop() ?? 'module';
          this.error(
            `${name} is bundled into chunk ${file} alongside ${ids.length - 1} other ` +
              `module(s). It must stay in a chunk of its own, reached only through a ` +
              `dynamic import() — a static import folds it into the importer's chunk and ` +
              `makes every visitor of that chunk wait for it. Read it through a cache the ` +
              `boot path already fills (see apps/web/src/api/atlasDetail.ts).`,
          );
        }

        if (!out.isEntry) continue;

        const forbidden = Object.entries(out.modules)
          .filter(([id]) => ENTRY_FORBIDDEN_MODULES.some((re) => re.test(id)))
          .map(([id, mod]) => `${id.split('/').pop()} (~${(mod.renderedLength / 1024).toFixed(0)}KiB)`);
        if (forbidden.length > 0) {
          this.error(
            `entry chunk ${file} eagerly includes ${forbidden.join(', ')}. These must be reached ` +
              `through a dynamic import() — most often the cause is a static import of ` +
              `'api/structureFallback' from a screen on the eager path, or a small helper imported ` +
              `from a module that also pulls the seed catalogue (see api/opId.ts).`,
          );
        }

        const entryBytes = Buffer.byteLength(out.code);
        if (entryBytes > ENTRY_JS_MAX_BYTES) {
          this.error(
            `entry chunk ${file} is ${(entryBytes / 1024).toFixed(1)}KiB; the release budget is ` +
              `${ENTRY_JS_MAX_BYTES / 1024}KiB. Keep new runtimes behind import() or update the ` +
              `budget with measured evidence in docs/release-manifest.json.`,
          );
        }
        const leaked = new Map<string, number>();
        for (const [id, mod] of Object.entries(out.modules)) {
          const pkg = id.match(/node_modules\/(?:\.pnpm\/)?((?:@[^/]+\/)?[^/@]+)/)?.[1];
          if (pkg && ENTRY_DENYLIST.includes(pkg)) {
            leaked.set(pkg, (leaked.get(pkg) ?? 0) + mod.renderedLength);
          }
        }
        if (leaked.size > 0) {
          const detail = [...leaked]
            .map(([pkg, bytes]) => `${pkg} (~${(bytes / 1024).toFixed(0)}KB)`)
            .join(', ');
          this.error(
            `entry chunk ${file} eagerly includes ${detail}. These must stay behind a ` +
              `dynamic import. Most often the cause is a VALUE import from a barrel that ` +
              `re-exports them — import the headless entry instead (e.g. ` +
              `'@frontier-isles/renderer/atlas-lod', '@frontier-isles/opp/ledger'), or make ` +
              `the import type-only if you only need types.`,
          );
        }
      }
    },
  };
}

// Dev proxy targets the Hono/y-websocket server (apps/server) on 8787.
// The web app runs fully on static fallback data if that server is absent,
// so these are best-effort routes (see src/api/client.ts).
export default defineConfig({
  plugins: [react(), guardEntryChunk()],
  // The A2 runner remains behind a nested import(), but its contract validator
  // eventually reaches zod. Keep that ESM leaf out of dev pre-bundling so its
  // first on-demand load cannot trigger dependency discovery and a full-page
  // reload. This does not move zod into the production entry; guardEntryChunk
  // still enforces that boundary below.
  optimizeDeps: { exclude: ['zod'] },
  server: {
    port: 5173,
    proxy: {
      // Pin IPv4: on developer machines another app may own ::1:8787 while
      // Frontier Isles correctly listens on 0.0.0.0:8787. `localhost` would
      // then proxy to the unrelated IPv6 service and make every landing 404.
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
      '/yjs': { target: 'ws://127.0.0.1:8787', ws: true },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

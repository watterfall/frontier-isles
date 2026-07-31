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

/** Fails the build on a denylisted package in the entry chunk, or on an
 *  isolated module that has been folded into somebody else's chunk. */
function guardEntryChunk(): Plugin {
  return {
    name: 'guard-entry-chunk',
    generateBundle(_options, bundle) {
      for (const [file, out] of Object.entries(bundle)) {
        if (out.type !== 'chunk') continue;
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

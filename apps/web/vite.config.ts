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
 * Workspace modules under the same rule. `atlas-detail` is the deferred half of
 * the L0 atlas (card prose + citations, ~127KB): the generator splits it out
 * precisely so it does not block first paint, and a single eager import would
 * silently undo that.
 */
const ENTRY_DENIED_MODULES = [/\/packages\/data\/src\/atlas-detail\.ts$/];

/** Fails the build when a denylisted package or module reaches the entry chunk. */
function guardEntryChunk(): Plugin {
  return {
    name: 'guard-entry-chunk',
    generateBundle(_options, bundle) {
      for (const [file, out] of Object.entries(bundle)) {
        if (out.type !== 'chunk' || !out.isEntry) continue;
        const leaked = new Map<string, number>();
        for (const [id, mod] of Object.entries(out.modules)) {
          const pkg = id.match(/node_modules\/(?:\.pnpm\/)?((?:@[^/]+\/)?[^/@]+)/)?.[1];
          if (pkg && ENTRY_DENYLIST.includes(pkg)) {
            leaked.set(pkg, (leaked.get(pkg) ?? 0) + mod.renderedLength);
          } else if (ENTRY_DENIED_MODULES.some((re) => re.test(id))) {
            const name = id.split('/').pop() ?? id;
            leaked.set(name, (leaked.get(name) ?? 0) + mod.renderedLength);
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

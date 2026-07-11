/**
 * `apps/server` entry point.
 *
 * Env config:
 * - `PORT` (default 8787), `DB_FILE` (default `data/isles.db`), `WEB_ORIGIN`
 *   (CORS + OAuth redirect base, default `http://localhost:5173`).
 * - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — enables GitHub OAuth login;
 *   without them the dev-auth bypass (`POST /api/auth/dev-login`) is used,
 *   which is itself disabled when `NODE_ENV=production`.
 * - `WEB_DIST` — path to the built web (`apps/web/dist`), relative to the server's
 *   cwd (default `../web/dist`). When it exists, this process ALSO serves the SPA
 *   + assets, so a single-process deploy (Fly.io per ROADMAP §6.1) needs no
 *   second web server. Absent (dev) → Vite serves the web on :5173, untouched.
 * - `NIGHT_DIGEST_WEBHOOKS` — comma-separated webhook URLs. Every ledger event
 *   with `action: "night_digest"` (the AI night shift's digests, driftwood,
 *   dock proposals, …) is pushed to each, fire-and-forget, never blocking or
 *   failing the write. Provider is auto-detected from the URL: `hooks.slack.com`
 *   → Slack, `open.feishu.cn/open-apis/bot` → Feishu (飞书), anything else →
 *   generic JSON (also what Matrix's hookshot bridge expects). Unset/empty →
 *   fully disabled, zero network calls (see `src/webhook.ts`).
 */
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import type { Server } from "node:http";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { openDb } from "./db.js";
import { Store } from "./store.js";
import { createApp } from "./app.js";
import { createYjsHandler } from "./yjs.js";
import { seed } from "./seed.js";

const PORT = Number(process.env.PORT ?? 8787);
const DB_FILE = process.env.DB_FILE ?? "data/isles.db";
const WEB_DIST = process.env.WEB_DIST ?? "../web/dist";

const db = openDb(DB_FILE);
const store = new Store(db);

// Auto-seed on boot if the DB is empty.
const seeded = seed(store);
if (seeded > 0) console.log(`[seed] seeded ${seeded} islands`);

const app = createApp(store);

// Single-process web serving (production / preview). Registered AFTER the API
// routes in createApp so `/api/*` and `/yjs` always win; the SPA fallback serves
// index.html for client-router paths. Skipped entirely when the build is absent
// (dev), where Vite owns the web on :5173.
if (existsSync(resolve(WEB_DIST))) {
  app.use("/*", serveStatic({ root: WEB_DIST }));
  app.get("/*", serveStatic({ path: "index.html", root: WEB_DIST }));
  console.log(`[server] serving web from ${resolve(WEB_DIST)}`);
}

const yjs = createYjsHandler(store);

const server = serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`[server] http://localhost:${info.port}`);
  console.log(`[server] yjs ws  ws://localhost:${info.port}/yjs/<room>`);
});

// Attach the Yjs WebSocket upgrade handler to the same HTTP server.
(server as Server).on("upgrade", (req, socket, head) => {
  if (!yjs.handleUpgrade(req, socket, head)) socket.destroy();
});

const shutdown = () => {
  yjs.closeAll();
  (server as Server).close();
  db.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

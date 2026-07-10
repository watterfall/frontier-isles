/**
 * `apps/server` entry point.
 *
 * Env config:
 * - `PORT` (default 8787), `DB_FILE` (default `data/isles.db`), `WEB_ORIGIN`
 *   (CORS + OAuth redirect base, default `http://localhost:5173`).
 * - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — enables GitHub OAuth login;
 *   without them the dev-auth bypass (`POST /api/auth/dev-login`) is used,
 *   which is itself disabled when `NODE_ENV=production`.
 * - `NIGHT_DIGEST_WEBHOOKS` — comma-separated webhook URLs. Every ledger event
 *   with `action: "night_digest"` (the AI night shift's digests, driftwood,
 *   dock proposals, …) is pushed to each, fire-and-forget, never blocking or
 *   failing the write. Provider is auto-detected from the URL: `hooks.slack.com`
 *   → Slack, `open.feishu.cn/open-apis/bot` → Feishu (飞书), anything else →
 *   generic JSON (also what Matrix's hookshot bridge expects). Unset/empty →
 *   fully disabled, zero network calls (see `src/webhook.ts`).
 */
import { serve } from "@hono/node-server";
import type { Server } from "node:http";
import { openDb } from "./db.js";
import { Store } from "./store.js";
import { createApp } from "./app.js";
import { createYjsHandler } from "./yjs.js";
import { seed } from "./seed.js";

const PORT = Number(process.env.PORT ?? 8787);
const DB_FILE = process.env.DB_FILE ?? "data/isles.db";

const db = openDb(DB_FILE);
const store = new Store(db);

// Auto-seed on boot if the DB is empty.
const seeded = seed(store);
if (seeded > 0) console.log(`[seed] seeded ${seeded} islands`);

const app = createApp(store);
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

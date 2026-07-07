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

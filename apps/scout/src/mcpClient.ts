/**
 * The gateway channel. The scout NEVER touches the DB or the HTTP `POST /events`
 * path directly — it spawns the server's MCP stdio server as a child process and
 * talks to it as a normal MCP client. Every write therefore passes through the
 * capability gateway (`core.can` + `degradeAction`): an ungranted station push
 * would degrade to a dock proposal, "AI never pushes" enforced by construction.
 *
 * The scout's identity is `github:curiosity-scout` (seeded, aiKind
 * `literature-scout`, granted `driftwood_write`), so `create_driftwood` and
 * `night_digest` land as authorized night-wilds writes — private by default,
 * never a formal-station publication.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Atom } from "./pipeline.js";

/** The subset of MCP tool calls the scout needs. Injectable so night.ts can be
 * driven by a fake writer in tests (no child process, no stdio). */
export interface ScoutWriter {
  readQfocus(): Promise<string>;
  createDriftwood(atom: Atom, text: string, credit: string[]): Promise<string>;
  /** Night-shift collect step. Returns "" if the tool is unavailable. */
  nightDigest(text: string, credit: string[]): Promise<string>;
  close(): Promise<void>;
}

export interface McpWriterOptions {
  island: string;
  /** Agent identity — the seeded literature scout. */
  agent?: string;
  /** Path to the server's mcp.ts entry (defaults to the workspace server). */
  serverEntry?: string;
  /** Command to run the entry (defaults to `pnpm --filter …server exec tsx`). */
  dbFile?: string;
}

const toText = (r: unknown): string => {
  const content = (r as { content?: Array<{ type: string; text?: string }> }).content ?? [];
  return content.map((c) => c.text ?? "").join("\n");
};

/**
 * Spawn `apps/server` MCP over stdio and return a ScoutWriter bound to it.
 * Uses `pnpm --filter @frontier-isles/server exec tsx src/mcp.ts` so the child
 * resolves the same workspace deps and DB the server uses.
 */
export async function createMcpWriter(opts: McpWriterOptions): Promise<ScoutWriter> {
  const agent = opts.agent ?? "github:curiosity-scout";
  const args = [
    "--filter",
    "@frontier-isles/server",
    "exec",
    "tsx",
    "src/mcp.ts",
    "--island",
    opts.island,
    "--agent",
    agent,
  ];
  const transport = new StdioClientTransport({
    command: "pnpm",
    args,
    env: {
      ...(process.env as Record<string, string>),
      ...(opts.dbFile ? { DB_FILE: opts.dbFile } : {}),
    },
  });
  const client = new Client({ name: "frontier-isles-scout", version: "0.1.0" });
  await client.connect(transport);

  const listed = await client.listTools();
  const hasNightDigest = listed.tools.some((t) => t.name === "night_digest");

  return {
    async readQfocus() {
      return toText(await client.callTool({ name: "read_qfocus", arguments: { slug: opts.island } }));
    },
    async createDriftwood(atom, text, credit) {
      return toText(
        await client.callTool({ name: "create_driftwood", arguments: { atom, text, credit } }),
      );
    },
    async nightDigest(text, credit) {
      if (!hasNightDigest) return "";
      return toText(await client.callTool({ name: "night_digest", arguments: { text, credit } }));
    },
    async close() {
      await client.close();
    },
  };
}

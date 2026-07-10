import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import type { Actor } from "@frontier-isles/opp";
import type { GatewayAction, StationKind } from "@frontier-isles/core";
import { openDb } from "./db.js";
import { Store, type GatewayInput } from "./store.js";
import { seed } from "./seed.js";
import type { RefKind } from "./refs.js";

/**
 * MCP server (§6). stdio entry:
 *   tsx src/mcp.ts --island <slug> --agent <id>
 * (or env ISLAND / AGENT). Every tool call auto-writes a ledger event with the
 * agent identity and `credit:ai/*` roles (§4 AI governance). The capability
 * gateway enforces driftwood rights: an unauthorized agent's submit_claim (and
 * other station pushes) degrade to a dock proposal, and the tool result says so.
 */

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function normalizeAgent(id: string): string {
  return /^(did:|orcid:|github:)/.test(id) ? id : `did:mcp:${id}`;
}

export function createMcpServer(store: Store, islandSlug: string, agentId: string): McpServer {
  const agent: Actor = { id: normalizeAgent(agentId), kind: "agent" };
  const server = new McpServer({ name: "frontier-isles", version: "0.1.0" });

  const opId = () => {
    const row = store.getProblemRow(islandSlug);
    if (!row) throw new Error(`island not found: ${islandSlug}`);
    return row.opId;
  };
  const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });

  function write(gatewayAction: GatewayAction, extra: Partial<GatewayInput>): string {
    const r = store.gateway(opId(), { actor: agent, gatewayAction, ...extra });
    if (r.degraded) {
      return `⚓ Unauthorized station push — degraded to a DOCK PROPOSAL (HITL pending). proposal=${r.proposalHash} event=${r.event.action}`;
    }
    return `✓ ${r.effectiveAction} written to ledger. ref=${r.refHash ?? "-"} phase=${r.event.phase}`;
  }

  // --- read tools -----------------------------------------------------------

  server.tool("list_open_problems", "List open/active problems on the platform.", {}, async () => {
    const list = store
      .listIslands()
      .filter((i) => i.status === "open" || i.status === "active")
      .map((i) => `${i.slug} · ${i.title} · ${i.domain} · ${i.status} · ${i.qfocus}`);
    return text(list.join("\n"));
  });

  server.tool("read_problem", "Read a problem object (.md source).", { slug: z.string().optional() }, async ({ slug }) => {
    const row = store.getProblemRow(slug ?? islandSlug);
    return text(row ? row.md : `not found: ${slug ?? islandSlug}`);
  });

  server.tool("read_qfocus", "Read the island's QFocus.", { slug: z.string().optional() }, async ({ slug }) => {
    const row = store.getProblemRow(slug ?? islandSlug);
    return text(row ? row.object.qfocus : "not found");
  });

  server.tool("read_station", "Read placements at a station.", { station: z.string() }, async ({ station }) => {
    const placements = store.getPlacements(opId(), station as StationKind);
    return text(JSON.stringify(placements, null, 2));
  });

  // --- write tools (auto-ledgered; gateway enforced) ------------------------

  server.tool(
    "propose_subquestion",
    "Propose a sub-question on the Question Wall.",
    { text: z.string(), open: z.boolean().optional() },
    async ({ text: qt, open }) =>
      text(write("propose_subquestion", {
        payload: { text: qt, open: open ?? true },
        refKind: "question",
        credit: ["credit:ai/questioning"],
      })),
  );

  server.tool(
    "create_driftwood",
    "Leave a driftwood atom in the Garden (six types).",
    {
      atom: z.enum(["thought", "question", "metaphor", "sketch", "contradiction", "thought-experiment"]),
      text: z.string(),
      // Optional AI-credit role(s) so specialized residents (e.g. the literature
      // scout → credit:ai/literature) attribute correctly; defaults to ideation.
      credit: z.array(z.string()).optional(),
    },
    async ({ atom, text: t, credit }) =>
      text(write("create_driftwood", { payload: { atom, text: t }, refKind: "driftwood", credit: credit ?? ["credit:ai/ideation"] })),
  );

  server.tool(
    "night_digest",
    "Record a night-shift digest. Plain digests stay in the night wilds (private note); pass `dest` to file it as a morning-report draft for the dawn adopt/return chain instead.",
    { text: z.string(), credit: z.array(z.string()).optional(), dest: z.string().optional() },
    async ({ text: t, credit, dest }) =>
      text(write("night_digest", dest
        ? { payload: { title: t, dest }, refKind: "morning_report", credit: credit ?? ["credit:ai/ideation"] }
        : { payload: { note: t }, refKind: "note", credit: credit ?? ["credit:ai/ideation"] })),
  );

  server.tool(
    "bridge_artifact",
    "Place a bridge artifact at the Ferry Dock (four types).",
    { type: z.enum(["analogy-mapping", "hypothesis-formalization", "concept-prototype", "design-fiction"]), body: z.string() },
    async ({ type, body }) =>
      text(write("bridge_artifact", { payload: { type, body }, refKind: "bridge_artifact", credit: ["credit:ai/synthesis"] })),
  );

  server.tool(
    "attach_data",
    "Attach a data reference (RO-Crate) to the Data Bench.",
    { ro_crate: z.string(), role: z.enum(["input", "output", "evidence", "replication"]), hash: z.string() },
    async ({ ro_crate, role, hash }) =>
      text(write("attach_data", { payload: { ro_crate, role, hash }, refKind: "data_ref", credit: ["credit:ai/data"] })),
  );

  server.tool(
    "attach_hardware",
    "Attach a hardware reference (OKH manifest) to the Workshop.",
    { manifest: z.string(), role: z.enum(["instrument", "fabrication", "sensor"]), hash: z.string() },
    async ({ manifest, role, hash }) =>
      text(write("attach_hardware", { payload: { manifest, role, hash }, refKind: "hardware_ref", credit: ["credit:ai/hardware"] })),
  );

  server.tool(
    "submit_claim",
    "Submit a claim (stele). Ungranted agents → dock proposal.",
    { body: z.string() },
    async ({ body }) =>
      text(write("submit_claim", { payload: { body }, refKind: "claim", credit: ["credit:ai/analysis"] })),
  );

  server.tool(
    "refute",
    "Refute a claim; must reference evidence.",
    { ref: z.string(), body: z.string() },
    async ({ ref, body }) =>
      text(write("refute", { payload: { ref, body }, refKind: "claim", credit: ["credit:ai/critique"] })),
  );

  return server;
}

async function main() {
  const dbFile = process.env.DB_FILE ?? "data/isles.db";
  const islandSlug = arg("island") ?? process.env.ISLAND ?? "machine-curiosity";
  const agentId = arg("agent") ?? process.env.AGENT ?? "mcp-agent";
  const store = new Store(openDb(dbFile));
  seed(store);
  const server = createMcpServer(store, islandSlug, agentId);
  await server.connect(new StdioServerTransport());
}

// Run only when invoked directly (not when imported by tests).
const invokedDirectly = process.argv[1]?.endsWith("mcp.ts") || process.argv[1]?.endsWith("mcp.js");
if (invokedDirectly) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

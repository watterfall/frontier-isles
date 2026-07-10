/**
 * @frontier-isles/scout — the literature-scout AI resident (Phase B.1).
 *
 * A CrossRef literature scout that runs a nightly shift: reads an island's
 * QFocus, searches recent literature, ranks + dedups against the ledger, and
 * proposes the strongest finds as driftwood atoms — every write routed through
 * the MCP capability gateway as `github:curiosity-scout`. It only ever proposes
 * (night wilds / dock); it never publishes or validates.
 *
 * The pure pipeline is the public surface; the IO shell (crossref/mcpClient/cli)
 * is imported directly by the CLI.
 */

export * from "./pipeline.js";
export { runNightShift, CREDIT } from "./night.js";
export type { NightOptions, NightDeps, NightResult } from "./night.js";
export { fetchWorks, userAgent, PKG, VERSION } from "./crossref.js";
export { createMcpWriter } from "./mcpClient.js";
export type { ScoutWriter, McpWriterOptions } from "./mcpClient.js";

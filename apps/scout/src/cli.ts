/**
 * CLI entry — one night shift.
 *
 *   pnpm --filter @frontier-isles/scout night -- --island machine-curiosity [--rows 8] [--top 3] [--dry-run]
 *
 * Env: CROSSREF_MAILTO (polite pool), SCOUT_SERVER (default http://localhost:8787),
 *      SCOUT_DB_FILE (passed to the spawned MCP child).
 */

import { fetchWorks } from "./crossref.js";
import { createMcpWriter } from "./mcpClient.js";
import { runNightShift, type NightDeps, type NightOptions } from "./night.js";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const flag = (name: string): boolean => process.argv.includes(`--${name}`);

async function main(): Promise<void> {
  const mailto = process.env.CROSSREF_MAILTO;
  if (!mailto) {
    console.warn(
      "⚠ CROSSREF_MAILTO 未设置 — 不进入 CrossRef 礼貌池。设置后请求会更稳定：export CROSSREF_MAILTO=you@example.com",
    );
  }

  const opts: NightOptions = {
    island: arg("island") ?? "machine-curiosity",
    serverBase: arg("server") ?? process.env.SCOUT_SERVER ?? "http://localhost:8787",
    rows: Number(arg("rows") ?? 8),
    topK: Number(arg("top") ?? 3),
    mailto,
    dryRun: flag("dry-run"),
  };

  const deps: NightDeps = {
    fetchText: async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GET ${url} → HTTP ${res.status}`);
      return res.text();
    },
    fetchWorks: (keywords, rows, fromPubDate, mt) =>
      fetchWorks({ keywords, rows, fromPubDate, mailto: mt }),
    makeWriter: () =>
      createMcpWriter({ island: opts.island, dbFile: process.env.SCOUT_DB_FILE }),
    now: new Date(),
    log: (m) => console.log(m),
  };

  console.log(`🔭 文献侦察夜班 · ${opts.island}${opts.dryRun ? " (dry-run)" : ""}`);
  const result = await runNightShift(opts, deps);
  console.log(
    `完成：拾得 ${result.proposals.length}/${result.fetched} 条候选，${
      opts.dryRun ? "未写入 (dry-run)" : `已提案 ${result.written.length} 条`
    }。`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

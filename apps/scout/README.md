# @frontier-isles/scout — 文献侦察员 (literature scout)

The first real AI resident (ROADMAP Phase B.1). `github:curiosity-scout` (aiKind
`literature-scout`) runs a nightly shift: it reads an island's **QFocus**, searches
recent literature on **CrossRef**, ranks and de-duplicates the finds against the
island's ledger, and leaves the strongest ones as **driftwood atoms** in the
Driftwood Garden — the AI's night-wilds landing, private by default.

## Invariants (架构 §7 / §4)

- **The scout only *proposes*.** Every write goes through the MCP capability
  gateway as `github:curiosity-scout`. It has `driftwood_write`, so `create_driftwood`
  and `night_digest` land as authorized *night-wilds* writes; it has **no**
  `station_write`, so it can never publish or validate — a station push would
  degrade to a **dock proposal** (that degradation is expected behavior, not an error).
- **AI never pushes.** The scout never touches the DB or `POST /events`; it spawns
  the server's MCP stdio server and talks to it as a client.
- **No new verbs.** It uses existing OPP/gateway actions only (`create_driftwood`,
  `night_digest`). Findings are `thought` atoms; credit is `credit:ai/literature`.
- Summaries are **template-generated, never an LLM call**.

## Usage

```bash
# one night shift (requires a running server on :8787)
pnpm --filter @frontier-isles/scout night -- --island machine-curiosity

# preview only — print what would be proposed, write nothing
pnpm --filter @frontier-isles/scout night -- --island machine-curiosity --dry-run

# more CrossRef rows / different top-K
pnpm --filter @frontier-isles/scout night -- --island machine-curiosity --rows 12 --top 5
```

Flags: `--island <slug>` (default `machine-curiosity`), `--rows <N>` (CrossRef
rows, default 8), `--top <K>` (proposals, default 3), `--dry-run`,
`--server <url>` (default `http://localhost:8787`).

## Night pipeline (data sources)

1. **Read** — `GET /api/islands/:slug/problem.md` → `opp.parseProblemObject` → QFocus/title/keywords.
2. **Search** — CrossRef `/works?query.bibliographic=…&filter=from-pub-date:<last year>&rows=N&select=…` (polite pool).
3. **Rank + dedup** — CrossRef relevance score + keyword overlap; DOIs already in
   `GET /api/islands/:slug/ledger.jsonl` are skipped (text match, no new storage).
4. **Propose** — top-K → MCP `create_driftwood` (`thought` atom, `credit:ai/literature`).
5. **Collect** — one MCP `night_digest` summarizing the shift.

## Environment variables

| Var | Purpose |
|-----|---------|
| `CROSSREF_MAILTO` | Contact for the CrossRef **polite pool**. Unset → request omits it and a warning is printed. |
| `SCOUT_SERVER` | Server base URL (overridden by `--server`; default `http://localhost:8787`). |
| `SCOUT_DB_FILE` | `DB_FILE` handed to the spawned MCP child (share the server's DB). |

## Tests

`pnpm --filter @frontier-isles/scout test` — the ranking, dedup, keyword extraction,
summary templates and the whole `runNightShift` flow are pure/injectable and run with
zero real network (CrossRef mocked from a fixture; the gateway writer faked).

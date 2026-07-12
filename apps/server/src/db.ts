import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Storage: better-sqlite3, plain SQL migrations at boot (DECISIONS item 4).
 *
 * Two-plane principle (§0/§5/§7 invariant 7): the knowledge plane and the place
 * plane are SEPARATE streams.
 *   knowledge — problem_objects, ledger_events (append-only, hash-chained), refs
 *   place     — stations, placements, memberships, capability_grants
 * plus a sessions table for auth.
 *
 * The `problem_objects.md_source` column is the authoritative knowledge-plane
 * artifact (parsed on demand via opp). The `json` column holds only place-plane
 * metadata that OPP does not model — the platform's `domain` tag and the L0
 * chart coordinates — documented here as the single deviation from the schema.
 */

export type DB = Database.Database;

const MIGRATION = `
CREATE TABLE IF NOT EXISTS problem_objects (
  op_id      TEXT PRIMARY KEY,
  slug       TEXT UNIQUE NOT NULL,
  md_source  TEXT NOT NULL,
  title      TEXT NOT NULL,
  status     TEXT NOT NULL,
  qfocus     TEXT NOT NULL,
  json       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ledger_events (
  seq   INTEGER PRIMARY KEY AUTOINCREMENT,
  op_id TEXT NOT NULL,
  hash  TEXT UNIQUE NOT NULL,
  prev  TEXT,
  json  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ledger_op ON ledger_events(op_id, seq);

CREATE TABLE IF NOT EXISTS refs (
  hash TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  json TEXT NOT NULL
);

-- Structures (执行纲要 §九): the portable "结构" half of the 结构 ⇄ 现象 bipartite
-- graph. Knowledge plane, like problem_objects: md_source is authoritative and
-- round-trips through opp's parser (§6 leavability). Edges are NOT stored here —
-- they are a reduce over rebuild ledger events (inv 14/15).
CREATE TABLE IF NOT EXISTS structure_objects (
  id         TEXT PRIMARY KEY,
  slug       TEXT UNIQUE NOT NULL,
  md_source  TEXT NOT NULL,
  status     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stations (
  op_id TEXT NOT NULL,
  kind  TEXT NOT NULL,
  gx    INTEGER NOT NULL,
  gy    INTEGER NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (op_id, kind)
);

CREATE TABLE IF NOT EXISTS placements (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  op_id     TEXT NOT NULL,
  station   TEXT NOT NULL,
  ref_hash  TEXT,
  meta_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_placement_op ON placements(op_id, station);

CREATE TABLE IF NOT EXISTS memberships (
  op_id      TEXT NOT NULL,
  actor_id   TEXT NOT NULL,
  actor_kind TEXT NOT NULL,
  role       TEXT,
  ai_kind    TEXT,
  PRIMARY KEY (op_id, actor_id)
);

CREATE TABLE IF NOT EXISTS capability_grants (
  op_id      TEXT NOT NULL,
  agent_id   TEXT NOT NULL,
  capability TEXT NOT NULL,
  granted_by TEXT,
  event_hash TEXT,
  PRIMARY KEY (op_id, agent_id, capability)
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  actor_id   TEXT NOT NULL,
  actor_kind TEXT NOT NULL,
  handle     TEXT,
  created_at TEXT
);
`;

/** Open (creating parent dirs) and migrate a database. `:memory:` for tests. */
export function openDb(file: string): DB {
  if (file !== ":memory:") mkdirSync(dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(MIGRATION);
  return db;
}

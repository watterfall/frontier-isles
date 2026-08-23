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
 *   exchange  — durable feedback outbox, delivery receipts, review/finding inbox
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

-- Durable xFrontier feedback exchange. The outbox is local operational state,
-- never a second research ledger: when an envelope cites a local ledger event
-- or ref, the foreign keys below bind it to evidence already present here.
CREATE TABLE IF NOT EXISTS feedback_outbox (
  id                       TEXT PRIMARY KEY,
  idempotency_key          TEXT UNIQUE NOT NULL,
  envelope_hash            TEXT NOT NULL,
  envelope_json            TEXT NOT NULL,
  source_ledger_event_hash TEXT,
  source_ref_hash          TEXT,
  state                    TEXT NOT NULL CHECK (state IN ('pending', 'in_flight', 'delivered', 'uncertain', 'cancelled')),
  created_at               TEXT NOT NULL,
  updated_at               TEXT NOT NULL,
  lease_owner              TEXT,
  lease_token              TEXT UNIQUE,
  lease_expires_at         TEXT,
  current_attempt_id       TEXT,
  cancelled_reason         TEXT,
  CHECK (source_ledger_event_hash IS NOT NULL OR source_ref_hash IS NOT NULL),
  CHECK (
    (state = 'in_flight' AND lease_owner IS NOT NULL AND lease_token IS NOT NULL
      AND lease_expires_at IS NOT NULL AND current_attempt_id IS NOT NULL)
    OR
    (state <> 'in_flight' AND lease_owner IS NULL AND lease_token IS NULL
      AND lease_expires_at IS NULL AND current_attempt_id IS NULL)
  ),
  FOREIGN KEY (source_ledger_event_hash) REFERENCES ledger_events(hash),
  FOREIGN KEY (source_ref_hash) REFERENCES refs(hash)
);
CREATE INDEX IF NOT EXISTS idx_feedback_outbox_ready
  ON feedback_outbox(state, created_at, id);

-- One immutable row per begun delivery call. Completion is a separate receipt,
-- so a crash can never rewrite away the fact that a remote side effect may have
-- happened.
CREATE TABLE IF NOT EXISTS feedback_delivery_attempts (
  attempt_id       TEXT PRIMARY KEY,
  outbox_id        TEXT NOT NULL,
  attempt_no       INTEGER NOT NULL CHECK (attempt_no > 0),
  worker_id        TEXT NOT NULL,
  lease_token      TEXT UNIQUE NOT NULL,
  started_at       TEXT NOT NULL,
  lease_expires_at TEXT NOT NULL,
  UNIQUE (outbox_id, attempt_no),
  FOREIGN KEY (outbox_id) REFERENCES feedback_outbox(id)
);
CREATE INDEX IF NOT EXISTS idx_feedback_attempts_outbox
  ON feedback_delivery_attempts(outbox_id, attempt_no);

-- Append-only terminal observations for attempts. A failure or expired lease is
-- epistemically uncertain (the remote call may have landed), never auto-retry.
CREATE TABLE IF NOT EXISTS feedback_delivery_receipts (
  receipt_id        TEXT PRIMARY KEY,
  receipt_hash      TEXT NOT NULL,
  attempt_id        TEXT UNIQUE NOT NULL,
  outbox_id         TEXT NOT NULL,
  outcome           TEXT NOT NULL CHECK (outcome IN ('success', 'failure', 'lease_expired')),
  remote_receipt_id TEXT,
  detail_json       TEXT,
  error             TEXT,
  recorded_at       TEXT NOT NULL,
  CHECK (
    (outcome = 'success' AND remote_receipt_id IS NOT NULL)
    OR (outcome <> 'success' AND remote_receipt_id IS NULL)
  ),
  FOREIGN KEY (attempt_id) REFERENCES feedback_delivery_attempts(attempt_id),
  FOREIGN KEY (outbox_id) REFERENCES feedback_outbox(id)
);
CREATE INDEX IF NOT EXISTS idx_feedback_receipts_outbox
  ON feedback_delivery_receipts(outbox_id, recorded_at, receipt_id);
-- Lookup support for the transaction-level uniqueness guard. This deliberately
-- remains migration-safe if an older DB already contains duplicate legacy rows;
-- new successful writes are serialized and reject any existing owner in Store.
CREATE INDEX IF NOT EXISTS idx_feedback_receipts_remote_success
  ON feedback_delivery_receipts(remote_receipt_id)
  WHERE outcome = 'success' AND remote_receipt_id IS NOT NULL;

-- Read-only upstream receipt lookups are not delivery attempts. Keep each
-- reconciliation observation append-only and separate so an uncertain attempt
-- can be closed (found), or explicitly proven absent before an authorized
-- retry, without rewriting its original terminal receipt.
CREATE TABLE IF NOT EXISTS feedback_delivery_reconciliations (
  seq                INTEGER PRIMARY KEY AUTOINCREMENT,
  reconciliation_id TEXT UNIQUE NOT NULL,
  reconciliation_hash TEXT NOT NULL,
  outbox_id          TEXT NOT NULL,
  basis_attempt_id   TEXT NOT NULL,
  client_event_id    TEXT NOT NULL,
  request_hash       TEXT NOT NULL,
  outcome            TEXT NOT NULL CHECK (outcome IN ('found', 'not_found', 'refused', 'conflict')),
  remote_receipt_id  TEXT,
  detail_json        TEXT NOT NULL,
  recorded_at        TEXT NOT NULL,
  CHECK (
    (outcome = 'found' AND remote_receipt_id IS NOT NULL)
    OR (outcome <> 'found' AND remote_receipt_id IS NULL)
  ),
  FOREIGN KEY (outbox_id) REFERENCES feedback_outbox(id),
  FOREIGN KEY (basis_attempt_id) REFERENCES feedback_delivery_attempts(attempt_id)
);
CREATE INDEX IF NOT EXISTS idx_feedback_reconciliations_outbox
  ON feedback_delivery_reconciliations(outbox_id, recorded_at, reconciliation_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reconciliations_remote
  ON feedback_delivery_reconciliations(remote_receipt_id)
  WHERE outcome = 'found' AND remote_receipt_id IS NOT NULL;

-- Remote decisions are an append-only history. The inbox is only the latest
-- projection plus an independent local acknowledgement/application/release
-- state: remote "accepted" never implies locally applied or released.
CREATE TABLE IF NOT EXISTS feedback_review_decisions (
  seq            INTEGER PRIMARY KEY AUTOINCREMENT,
  decision_id    TEXT UNIQUE NOT NULL,
  decision_hash  TEXT NOT NULL,
  outbox_id      TEXT NOT NULL,
  remote_status  TEXT NOT NULL CHECK (remote_status IN ('pending', 'accepted', 'rejected', 'resolved', 'wontfix', 'superseded')),
  decision_json  TEXT NOT NULL,
  decided_at     TEXT NOT NULL,
  received_at    TEXT NOT NULL,
  FOREIGN KEY (outbox_id) REFERENCES feedback_outbox(id)
);
CREATE INDEX IF NOT EXISTS idx_feedback_decisions_outbox
  ON feedback_review_decisions(outbox_id, decided_at, seq);

CREATE TABLE IF NOT EXISTS feedback_review_inbox (
  outbox_id          TEXT PRIMARY KEY,
  latest_decision_id TEXT NOT NULL,
  remote_status      TEXT NOT NULL CHECK (remote_status IN ('pending', 'accepted', 'rejected', 'resolved', 'wontfix', 'superseded')),
  remote_decided_at  TEXT NOT NULL,
  local_disposition  TEXT NOT NULL DEFAULT 'unreviewed'
    CHECK (local_disposition IN ('unreviewed', 'acknowledged', 'applied', 'released')),
  local_updated_at   TEXT,
  FOREIGN KEY (outbox_id) REFERENCES feedback_outbox(id),
  FOREIGN KEY (latest_decision_id) REFERENCES feedback_review_decisions(decision_id)
);

-- Latest observed remote findings for local review. upstream_stale = 1 is an
-- explicit xFrontier signal that the finding's observed dataset differs from
-- current; absence from a pull proves nothing and never changes stored rows.
CREATE TABLE IF NOT EXISTS feedback_finding_inbox (
  remote_finding_id TEXT PRIMARY KEY,
  dataset_version   TEXT NOT NULL,
  finding_hash      TEXT NOT NULL,
  finding_json      TEXT NOT NULL,
  upstream_stale    INTEGER NOT NULL DEFAULT 0 CHECK (upstream_stale IN (0, 1)),
  observed_at       TEXT NOT NULL,
  local_disposition TEXT NOT NULL DEFAULT 'unreviewed'
    CHECK (local_disposition IN ('unreviewed', 'acknowledged', 'addressed', 'dismissed')),
  local_updated_at  TEXT
);
CREATE INDEX IF NOT EXISTS idx_feedback_finding_review
  ON feedback_finding_inbox(upstream_stale, local_disposition, remote_finding_id);
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

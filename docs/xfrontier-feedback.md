# xFrontier data and feedback bridge

Frontier Isles and xFrontier share a protocol, not a database. Each project
keeps authority over its own research state while exchanging versioned,
content-addressed observations through the local xFrontier MCP.

## Authority and flow

| Direction | Source of truth | Local projection | Mutation rule |
|---|---|---|---|
| xFrontier → catalog | xFrontier dataset version and record content hashes | checked-in reference snapshot and catalog-owned `meta.atlas` | explicit snapshot refresh; authored island fields and ledgers are untouched |
| Frontier Isles → xFrontier | Frontier Isles ledger event/ref plus a versioned feedback envelope | durable SQLite outbox, attempts, receipts, and reconciliation observations | enqueue is local; one exact item can be delivered only with explicit upstream-write confirmation |
| xFrontier → review | xFrontier findings and proposal decision history | local finding/proposal review inboxes | read-only pull; missing findings are retained and `accepted` never means locally applied |

```text
Frontier Isles ledger/ref
        │ validate + content-hash anchor
        ▼
durable outbox ── explicit deliver ──► xFrontier finding/proposal ledger
        ▲             │ lost ack                │ exact receipt by client event id
        └── retry ◄── not_found ◄── reconcile ──┘
        ▲                                      │ human review outside MCP
        │                                      ▼
local review inbox ◄── read-only double pull ─ decisions/findings
        │
        └── explicit acknowledged → applied → released disposition
```

This separation avoids two incompatible systems without giving either project
permission to rewrite the other project's primary data. The shared lower layer
is the envelope, dataset cursor, evidence hashes, remote receipt ID, and review
state machine.

## Commands

All commands use `data/isles.db` unless `DB_FILE` or `--db` is supplied.

```bash
# Local only: zero MCP calls.
pnpm xfrontier:feedback inspect

# Local only: validate the envelope and bind it to an existing ledger/ref hash.
pnpm xfrontier:feedback enqueue --file feedback.json

# Local only: turn a crashed/expired in-flight lease into an explicit uncertain
# receipt. This never requeues or contacts xFrontier.
pnpm xfrontier:feedback recover-expired

# Read only: pull all findings and two identical complete proposal sweeps.
pnpm xfrontier:feedback pull

# One of two upstream write paths. It submits one exact pending item.
# The other is the separately confirmed retry below.
pnpm xfrontier:feedback deliver \
  --id '<outbox-id>' \
  --confirm-upstream-write

# Read only: reconcile one uncertain item by its exact client event id.
pnpm xfrontier:feedback reconcile --id '<outbox-id>'

# A separate authorized write, allowed only after reconcile recorded not_found.
# It reuses the identical v2 envelope, event id, request hash, and preconditions.
pnpm xfrontier:feedback retry \
  --id '<outbox-id>' \
  --confirm-upstream-write

# Remote acceptance remains unreviewed locally until these explicit steps.
pnpm xfrontier:feedback disposition --id '<outbox-id>' --to acknowledged
pnpm xfrontier:feedback disposition --id '<outbox-id>' --to applied
pnpm xfrontier:feedback disposition --id '<outbox-id>' --to released
```

The local MCP entry defaults to
`~/AIAI/frontier/dist-mcp/server.mjs`. Override it with
`XFRONTIER_MCP_SERVER` or `--server-entry`; build xFrontier's MCP bundle in its
own repository before using a changed upstream implementation.
For isolated protocol verification, pass `--ledger-dir <temporary-directory>`
or `XF_LEDGER_DIR`; the client explicitly forwards that override because the
MCP SDK intentionally inherits only a narrow environment allowlist. Never aim
that option at the committed real ledger during tests.

## Feedback envelope

The pure contract is exported from
`@frontier-isles/data/xfrontier-feedback`. An envelope must cite at least one
existing Frontier Isles `ledgerEventHash` or `refHash`; a human-readable
`ledgerRef` alone is not a machine-verifiable source.

```json
{
  "schemaVersion": "xfrontier-feedback-envelope/v2",
  "idempotencyKey": "frontier-isles:example:annotation-001",
  "source": {
    "system": "frontier-isles",
    "ledgerRef": "ref://sha256:...",
    "refHash": "sha256:<64 lowercase hex>",
    "evidence": "What was reproduced and where it can be checked."
  },
  "target": {
    "datasetVersion": "xf-6eb361265784",
    "expectedContentHash": "<8 lowercase hex>"
  },
  "payload": {
    "kind": "annotation",
    "recordId": 40,
    "field": "mech",
    "value": "Proposed field value",
    "rationale": "Why the evidence supports this value.",
    "confidence": 0.8,
    "by": "frontier-isles"
  }
}
```

The other payload kinds are `finding` and `structure_link`. Record proposals
require `expectedContentHash`; an active record finding may carry it, while
field/population findings cannot. Validation maps
them to inert `report_finding`, `propose_annotation`, or
`propose_structure_link` intents; mapping does not execute a tool.

## Failure and review semantics

xFrontier 0.5.0 remains supported for read-only pulls. Delivery requires the
reviewed 0.6.0 strong-write surface. The three writers retain the honest global
`idempotentHint: false` annotation because legacy calls omit the optional event
ID; Frontier Isles always supplies the v2 event ID and conditional fields.
Therefore:

- dataset drift is rejected before a write attempt begins;
- the client accepts reviewed `0.5.0`/`0.6.0` reads, but refuses a 0.5 delivery
  before leasing; it requires explicit
  read-only/idempotent/non-destructive annotations on both pull tools, and
  verifies every acknowledgement field against the submitted intent;
- once the MCP call begins, any timeout, disconnect, tool error, or malformed
  acknowledgement moves the item to `uncertain`;
- a crashed process can leave an `in_flight` lease. `inspect` exposes its expiry
  and last attempt/receipt; `recover-expired` appends a `lease_expired` receipt
  and changes it to `uncertain` without contacting the MCP;
- an `uncertain` item cannot be cancelled or leased normally. `reconcile` calls
  only `get_feedback_receipt`: `found` closes it without another write;
  `not_found` appends durable evidence but leaves uncertainty visible. Only a
  separate confirmed `retry` may then lease the identical immutable request;
- successful receipts store a namespaced remote ID such as
  `xfrontier:proposal:<id>` because upstream IDs are short and not globally
  scoped;
- proposal decisions are append-only and reversible; the latest decision is
  the remote status, while full history is retained;
- if xFrontier reverses an acceptance after Frontier Isles already applied or
  released it, the local historical disposition is preserved and
  `needsReconciliation` becomes true until the upstream decision is accepted
  again or a future explicit reconciliation action is recorded;
- a pulled proposal must match both the immutable local envelope and its
  success receipt before any remote decision can enter the local inbox;
- `accepted` changes only the remote review projection. Frontier Isles requires
  separate `acknowledged`, `applied`, and `released` transitions;
- a finding has no upstream resolved lifecycle. Its `upstreamStale` flag means
  only that xFrontier observed it against an older dataset; absence from a pull
  is never interpreted as deletion or resolution.

The bridge also rejects a pull when xFrontier reports corrupt proposal ledger
files or when two complete proposal sweeps differ. These checks improve the
observation boundary; they do not turn the upstream cursor into a transactional
snapshot.

## Remaining xFrontier MCP evolution

Phase 19 implements caller event IDs, conditional writes, exact receipt lookup,
and crash-durable no-replace ledger publication. Remaining improvements are:

1. a ledger revision or immutable snapshot cursor for `list_proposals`;
2. globally collision-resistant, kind-prefixed finding/proposal/decision IDs
   for legacy/non-event records;
3. explicit consumer acknowledgements (`applied`, `released`) that remain
   separate from xFrontier's human `accepted` decision;
4. a finding disposition lifecycle distinct from dataset staleness.

This is effectively-once for a valid v2 client event under the local filesystem
claim, not a universal exactly-once promise: caller identity is self-reported,
human acceptance remains separate, and `uncertain` is preserved until an exact
receipt observation resolves it.

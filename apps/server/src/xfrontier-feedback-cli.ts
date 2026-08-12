#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  toXFrontierFeedbackStrongToolIntent,
  validateXFrontierFeedbackEnvelope,
  type XFrontierFeedbackToolName,
} from "@frontier-isles/data/xfrontier-feedback";
import { openDb } from "./db.js";
import { Store, type FeedbackFindingLocalDisposition, type FeedbackLocalDisposition } from "./store.js";
import {
  deliverXFrontierFeedback,
  enqueueXFrontierFeedback,
  inspectXFrontierFeedback,
  pullXFrontierFeedback,
  reconcileXFrontierFeedback,
  retryXFrontierFeedback,
  setXFrontierFindingDisposition,
  setXFrontierProposalDisposition,
  XFrontierDeliveryRefused,
  XFrontierDeliveryUncertain,
} from "./xfrontier-feedback-bridge.js";
import {
  connectXFrontierFeedbackRemote,
  DEFAULT_XFRONTIER_MCP_ENTRY,
} from "./xfrontier-feedback-client.js";

type Command =
  | "inspect"
  | "recover-expired"
  | "enqueue"
  | "pull"
  | "deliver"
  | "reconcile"
  | "retry"
  | "disposition"
  | "finding-disposition"
  | "cancel";

export interface XFrontierFeedbackCliOptions {
  command: Command;
  dbFile: string;
  json: boolean;
  file?: string;
  id?: string;
  to?: string;
  reason?: string;
  serverEntry: string;
  mcpCommand: string;
  ledgerDir?: string;
  confirmUpstreamWrite: boolean;
  help: boolean;
}

export const XFRONTIER_FEEDBACK_USAGE = `Usage: pnpm xfrontier:feedback [command] [options]

Commands:
  inspect                         Local-only outbox/inbox status (default).
  recover-expired                 Local-only: mark expired in-flight calls
                                  uncertain and append lease-expired receipts.
  enqueue --file <envelope.json>  Validate and durably enqueue; no MCP call.
  pull                            Read findings/decisions into local inboxes.
  deliver --id <outbox-id> --confirm-upstream-write
                                  Submit exactly one pending item upstream.
  reconcile --id <outbox-id>      Read-only exact receipt lookup for one
                                  uncertain item; never invokes a writer.
  retry --id <outbox-id> --confirm-upstream-write
                                  Reuse the same immutable request only after
                                  reconcile recorded an exact not_found proof.
  disposition --id <outbox-id> --to <acknowledged|applied|released>
                                  Advance a proposal's local disposition.
  finding-disposition --id <remote-id> --to <acknowledged|addressed|dismissed>
                                  Record a local finding review outcome.
  cancel --id <outbox-id> --reason <text>
                                  Cancel a pending local item. Uncertain calls
                                  must remain visible until reconciled.

Options:
  --db <path>            SQLite DB (or DB_FILE; default data/isles.db).
  --server-entry <path>  xFrontier stdio entry (or XFRONTIER_MCP_SERVER;
                         default ${DEFAULT_XFRONTIER_MCP_ENTRY}).
  --mcp-command <path>   Runtime command (or XFRONTIER_MCP_COMMAND).
  --ledger-dir <path>    Explicit xFrontier ledger override (or XF_LEDGER_DIR),
                         intended for isolated verification.
  --json                 Machine-readable output.
  --help                 Show this help.

Safety:
  inspect, recover-expired, and enqueue never connect to MCP. pull and reconcile call read-only
  tools. deliver and retry are the only MCP write paths; both require an exact outbox id and the
  long confirmation flag. retry additionally requires a fresh exact not_found proof and reuses
  the same upstream-enforced client event id. A timeout after either write begins becomes uncertain.`;

const COMMANDS = new Set<Command>([
  "inspect",
  "recover-expired",
  "enqueue",
  "pull",
  "deliver",
  "reconcile",
  "retry",
  "disposition",
  "finding-disposition",
  "cancel",
]);

export function parseXFrontierFeedbackCliArgs(argv: string[]): XFrontierFeedbackCliOptions {
  const options: XFrontierFeedbackCliOptions = {
    command: "inspect",
    dbFile: process.env.DB_FILE ?? "data/isles.db",
    json: false,
    serverEntry: process.env.XFRONTIER_MCP_SERVER ?? DEFAULT_XFRONTIER_MCP_ENTRY,
    mcpCommand: process.env.XFRONTIER_MCP_COMMAND ?? process.execPath,
    ...(process.env.XF_LEDGER_DIR ? { ledgerDir: process.env.XF_LEDGER_DIR } : {}),
    confirmUpstreamWrite: false,
    help: false,
  };
  let commandSeen = false;
  const valueFor = (arg: string, index: number): string => {
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${arg} requires a value`);
    return value;
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]!;
    if (arg === "-h") {
      options.help = true;
      continue;
    }
    if (!arg.startsWith("--")) {
      if (commandSeen || !COMMANDS.has(arg as Command)) throw new Error(`unknown command: ${arg}`);
      options.command = arg as Command;
      commandSeen = true;
      continue;
    }
    if (arg === "--json") options.json = true;
    else if (arg === "--help") options.help = true;
    else if (arg === "--confirm-upstream-write") options.confirmUpstreamWrite = true;
    else if (["--db", "--file", "--id", "--to", "--reason", "--server-entry", "--mcp-command", "--ledger-dir"].includes(arg)) {
      const value = valueFor(arg, index);
      if (arg === "--db") options.dbFile = value;
      else if (arg === "--file") options.file = value;
      else if (arg === "--id") options.id = value;
      else if (arg === "--to") options.to = value;
      else if (arg === "--reason") options.reason = value;
      else if (arg === "--server-entry") options.serverEntry = value;
      else if (arg === "--mcp-command") options.mcpCommand = value;
      else options.ledgerDir = value;
      index += 1;
    } else throw new Error(`unknown option: ${arg}`);
  }

  if (options.help) return options;
  if (options.command === "enqueue" && !options.file) throw new Error("enqueue requires --file");
  if (["deliver", "reconcile", "retry", "disposition", "finding-disposition", "cancel"].includes(options.command) && !options.id) {
    throw new Error(`${options.command} requires --id`);
  }
  if (["disposition", "finding-disposition"].includes(options.command) && !options.to) {
    throw new Error(`${options.command} requires --to`);
  }
  if (options.command === "cancel" && !options.reason) throw new Error("cancel requires --reason");
  if (["deliver", "retry"].includes(options.command) && !options.confirmUpstreamWrite) {
    throw new Error(`${options.command} requires --confirm-upstream-write`);
  }
  if (!["deliver", "retry"].includes(options.command) && options.confirmUpstreamWrite) {
    throw new Error("--confirm-upstream-write is valid only with deliver or retry");
  }
  return options;
}

const toolNameForStoredEnvelope = (envelope: unknown): XFrontierFeedbackToolName => {
  const validated = validateXFrontierFeedbackEnvelope(envelope);
  // Mapping against the envelope's own base version is inert and used only to
  // choose which exact writer the MCP session may expose. Live drift is checked
  // again in deliverXFrontierFeedback before the attempt lease.
  return toXFrontierFeedbackStrongToolIntent(validated, validated.target.datasetVersion).toolName;
};

const formatHuman = (command: Command, value: unknown): string => {
  const result = value as Record<string, any>;
  if (command === "inspect") {
    const states = result.outbox.byState as Record<string, number>;
    const lines = [
      `xFrontier feedback (local only; MCP calls: 0)`,
      `outbox ${result.outbox.total}: pending ${states.pending}, in-flight ${states.in_flight}, delivered ${states.delivered}, uncertain ${states.uncertain}, cancelled ${states.cancelled}`,
      `proposal review inbox: ${result.reviewInbox.length} (${result.reviewInbox.filter((item: { needsReconciliation: boolean }) => item.needsReconciliation).length} need reconciliation); finding inbox: ${result.findingInbox.length}`,
    ];
    for (const item of result.outbox.items as Array<{ id: string; idempotencyKey: string; state: string }>) {
      const delivery = (result.outbox.deliveries as Array<{
        item: { id: string };
        activeLease?: { leaseExpiresAt: string };
        lastReceipt?: { outcome: string; error?: string };
      }>).find((candidate) => candidate.item.id === item.id);
      const operational = delivery?.activeLease
        ? `  lease-expires ${delivery.activeLease.leaseExpiresAt}`
        : delivery?.lastReceipt
          ? `  last-receipt ${delivery.lastReceipt.outcome}${delivery.lastReceipt.error ? `: ${delivery.lastReceipt.error}` : ""}`
          : "";
      lines.push(`- ${item.id}  ${item.state}  ${item.idempotencyKey}${operational}`);
    }
    return lines.join("\n");
  }
  if (command === "recover-expired") {
    return `recovered ${result.recovered} expired in-flight feedback call(s) as uncertain`;
  }
  if (command === "enqueue") {
    return `${result.created ? "enqueued" : "already enqueued"}: ${result.item.id} (${result.item.state})`;
  }
  if (command === "pull") {
    return [
      `xFrontier read-only pull ${result.datasetVersion}`,
      `findings: ${result.findings.observed} observed, ${result.findings.upstreamStale} upstream-stale`,
      `proposals: ${result.proposals.observed} observed, ${result.proposals.matched} matched, ${result.proposals.unmatched} unmatched`,
      `decisions: ${result.decisions.created} new, ${result.decisions.replayed} replayed`,
      `automatic local application: no`,
    ].join("\n");
  }
  if (command === "deliver") {
    return [
      `delivered ${result.item.id} via ${result.intent.toolName}`,
      `remote ${result.acknowledgement.remoteKind}: ${result.acknowledgement.remoteId}`,
      `ack dataset: ${result.acknowledgement.datasetVersion}`,
      result.datasetChangedDuringCall
        ? "warning: current dataset moved after the immutable request target; receipt retained for review"
        : "dataset remained stable across the acknowledged call",
    ].join("\n");
  }
  if (command === "reconcile") {
    return result.found
      ? `reconciled ${result.item.id}: upstream receipt found, local delivery closed`
      : `reconciled ${result.item.id}: no upstream receipt found; explicit retry is now eligible`;
  }
  if (command === "retry") {
    return `retried ${result.item.id} with the same client event id; state ${result.item.state}`;
  }
  if (command === "cancel") return `cancelled ${result.id}: ${result.cancelledReason}`;
  return `updated ${result.outboxId ?? result.remoteFindingId}: ${result.localDisposition}`;
};

export async function runXFrontierFeedbackCli(
  argv: string[],
  io: { out: (message: string) => void; error: (message: string) => void } = {
    out: console.log,
    error: console.error,
  },
): Promise<number> {
  let options: XFrontierFeedbackCliOptions;
  try {
    options = parseXFrontierFeedbackCliArgs(argv);
  } catch (error) {
    io.error(`xfrontier:feedback: ${error instanceof Error ? error.message : String(error)}`);
    return 2;
  }
  if (options.help) {
    io.out(XFRONTIER_FEEDBACK_USAGE);
    return 0;
  }

  const db = openDb(options.dbFile);
  const store = new Store(db);
  try {
    let result: unknown;
    if (options.command === "inspect") {
      result = inspectXFrontierFeedback(store);
    } else if (options.command === "recover-expired") {
      result = { recovered: store.recoverExpiredFeedbackDeliveries() };
    } else if (options.command === "enqueue") {
      const contents = await readFile(resolve(options.file!), "utf8");
      result = enqueueXFrontierFeedback(store, JSON.parse(contents) as unknown);
    } else if (options.command === "cancel") {
      result = store.cancelFeedback(options.id!, options.reason!);
    } else if (options.command === "disposition") {
      const allowed: FeedbackLocalDisposition[] = ["acknowledged", "applied", "released"];
      if (!allowed.includes(options.to as FeedbackLocalDisposition)) {
        throw new Error(`proposal disposition must be one of ${allowed.join(", ")}`);
      }
      result = setXFrontierProposalDisposition(store, options.id!, options.to as FeedbackLocalDisposition);
    } else if (options.command === "finding-disposition") {
      const allowed: FeedbackFindingLocalDisposition[] = ["acknowledged", "addressed", "dismissed"];
      if (!allowed.includes(options.to as FeedbackFindingLocalDisposition)) {
        throw new Error(`finding disposition must be one of ${allowed.join(", ")}`);
      }
      result = setXFrontierFindingDisposition(store, options.id!, options.to as FeedbackFindingLocalDisposition);
    } else if (options.command === "pull") {
      const remote = await connectXFrontierFeedbackRemote({
        serverEntry: options.serverEntry,
        command: options.mcpCommand,
        ...(options.ledgerDir ? { ledgerDir: options.ledgerDir } : {}),
      });
      try {
        result = await pullXFrontierFeedback({ store, remote });
      } finally {
        await remote.close();
      }
    } else if (options.command === "deliver" || options.command === "retry") {
      const item = store.getFeedbackOutbox(options.id!);
      if (!item) throw new Error(`unknown feedback outbox item: ${options.id}`);
      const writeTool = toolNameForStoredEnvelope(item.envelope);
      const remote = await connectXFrontierFeedbackRemote({
        serverEntry: options.serverEntry,
        command: options.mcpCommand,
        ...(options.ledgerDir ? { ledgerDir: options.ledgerDir } : {}),
        writeTool,
      });
      try {
        result = options.command === "retry"
          ? await retryXFrontierFeedback({ store, remote, outboxId: options.id! })
          : await deliverXFrontierFeedback({ store, remote, outboxId: options.id! });
      } finally {
        await remote.close();
      }
    } else {
      const remote = await connectXFrontierFeedbackRemote({
        serverEntry: options.serverEntry,
        command: options.mcpCommand,
        ...(options.ledgerDir ? { ledgerDir: options.ledgerDir } : {}),
      });
      try {
        result = await reconcileXFrontierFeedback({ store, remote, outboxId: options.id! });
      } finally {
        await remote.close();
      }
    }
    io.out(options.json ? JSON.stringify(result, null, 2) : formatHuman(options.command, result));
    return 0;
  } catch (error) {
    if (error instanceof XFrontierDeliveryUncertain) {
      io.error(`${error.message}${error.receipt ? `; receipt ${error.receipt.receiptId}` : ""}`);
      return 3;
    }
    if (error instanceof XFrontierDeliveryRefused) {
      io.error(`${error.message}; reconciliation ${error.reconciliation.reconciliationId}`);
      return 4;
    }
    io.error(`xfrontier:feedback failed: ${error instanceof Error ? error.message : String(error)}`);
    return 2;
  } finally {
    db.close();
  }
}

const invokedDirectly = process.argv[1]?.endsWith("xfrontier-feedback-cli.ts")
  || process.argv[1]?.endsWith("xfrontier-feedback-cli.js");
if (invokedDirectly) {
  process.exitCode = await runXFrontierFeedbackCli(process.argv.slice(2));
}

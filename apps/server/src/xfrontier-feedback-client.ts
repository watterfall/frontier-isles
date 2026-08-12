import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  normalizeXFrontierFeedbackReadState,
  type XFrontierFeedbackReadState,
  type XFrontierFeedbackStrongToolIntent,
  type XFrontierFeedbackToolIntent,
  type XFrontierFeedbackToolName,
} from "@frontier-isles/data/xfrontier-feedback";

export const XFRONTIER_FEEDBACK_READ_PROTOCOL_VERSIONS = ["0.5.0", "0.6.0"] as const;
export const XFRONTIER_FEEDBACK_STRONG_WRITE_PROTOCOL_VERSION = "0.6.0";
/** @deprecated This used to name the sole reviewed version. It now names the
 * strong-write protocol; use the explicit read/write constants above. */
export const XFRONTIER_FEEDBACK_PROTOCOL_VERSION = XFRONTIER_FEEDBACK_STRONG_WRITE_PROTOCOL_VERSION;
export const DEFAULT_XFRONTIER_MCP_ENTRY = join(
  homedir(),
  "AIAI",
  "frontier",
  "dist-mcp",
  "server.mjs",
);

const REQUEST_TIMEOUT_MS = 15_000;
const PROPOSAL_PAGE_LIMIT = 500;
const MAX_PROPOSAL_PAGES = 1_000;

type UnknownRecord = Record<string, unknown>;

export interface XFrontierFeedbackRemoteInfo {
  name: "xfrontier";
  version: string;
  datasetVersion: string;
  serverEntry: string;
}

export interface XFrontierFeedbackDeliveryAck {
  /** Dataset version stamped on the immutable stored record. */
  datasetVersion: string;
  /** Corpus served by the process that returned/recovered this receipt. */
  currentDatasetVersion: string;
  remoteId: string;
  remoteKind: "finding" | "proposal";
  timestamp: string;
  clientEventId?: string;
  requestHash?: string;
  idempotentReplay: boolean;
  corpusChanged: false;
  raw: unknown;
}

export type XFrontierFeedbackReceiptLookup =
  | {
      found: false;
      currentDatasetVersion: string;
      clientEventId: string;
      raw: unknown;
    }
  | {
      found: true;
      currentDatasetVersion: string;
      clientEventId: string;
      requestHash: string;
      acknowledgement: XFrontierFeedbackDeliveryAck;
      raw: unknown;
    };

/** The bridge depends on this small port so its safety transitions are testable
 * without ever spawning the real upstream process. */
export interface XFrontierFeedbackRemote {
  readonly info: XFrontierFeedbackRemoteInfo;
  readFeedbackState(): Promise<XFrontierFeedbackReadState>;
  submit(intent: XFrontierFeedbackToolIntent): Promise<XFrontierFeedbackDeliveryAck>;
  lookupReceipt(intent: XFrontierFeedbackStrongToolIntent): Promise<XFrontierFeedbackReceiptLookup>;
  close(): Promise<void>;
}

export interface ConnectXFrontierFeedbackOptions {
  serverEntry?: string;
  command?: string;
  /** Explicit upstream ledger override, primarily for isolated verification.
   * The MCP SDK intentionally inherits only a small safe env allowlist. */
  ledgerDir?: string;
  /** Only explicit delivery mode asks the client to authorize one writer. */
  writeTool?: XFrontierFeedbackToolName;
  timeoutMs?: number;
}

const objectAt = (value: unknown, label: string): UnknownRecord => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as UnknownRecord;
};

const requireExactKeys = (value: UnknownRecord, expected: readonly string[], label: string): void => {
  const allowed = new Set(expected);
  for (const key of expected) {
    if (!(key in value)) throw new Error(`${label}.${key} is required`);
  }
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new Error(`${label}.${key} is not allowed`);
  }
};

const nonEmptyString = (value: unknown, label: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-blank string`);
  }
  return value;
};

const datasetVersionOf = (value: unknown, label: string): string => {
  const version = nonEmptyString(value, label);
  if (!/^xf-[A-Za-z0-9][A-Za-z0-9._-]*$/.test(version)) {
    throw new Error(`${label} is not an xFrontier dataset version`);
  }
  return version;
};

const numberOf = (value: unknown, label: string): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
  return value;
};

const nullableStringOf = (value: unknown, label: string): string | null => {
  if (value === null) return null;
  return nonEmptyString(value, label);
};

const affirmEqual = (actual: unknown, expected: string | number | null, label: string): void => {
  if (actual !== expected) {
    throw new Error(`${label} does not match submitted intent`);
  }
};

export class XFrontierFeedbackToolError extends Error {
  readonly errorKind?: string;

  constructor(public readonly toolName: string, public readonly payload: UnknownRecord) {
    super(
      `${toolName} returned an MCP tool error${
        typeof payload.error === "string" ? `: ${payload.error}` : ""
      }`,
    );
    this.name = "XFrontierFeedbackToolError";
    this.errorKind = typeof payload.error_kind === "string" ? payload.error_kind : undefined;
  }
}

const intentString = (intent: XFrontierFeedbackToolIntent, name: string): string =>
  nonEmptyString(intent.arguments[name], `${intent.toolName} intent ${name}`);

const intentNumber = (intent: XFrontierFeedbackToolIntent, name: string): number =>
  numberOf(intent.arguments[name], `${intent.toolName} intent ${name}`);

const intentNullableString = (intent: XFrontierFeedbackToolIntent, name: string): string | null =>
  nullableStringOf(intent.arguments[name], `${intent.toolName} intent ${name}`);

/** Accept SDK structuredContent, retaining the JSON text block as a compatibility
 * path. Tool-level errors never count as an acknowledgement. */
export function readXFrontierStructuredResult(result: unknown, label: string): UnknownRecord {
  const root = objectAt(result, `${label} result`);
  if (typeof root.structuredContent === "object" && root.structuredContent !== null) {
    const structured = objectAt(root.structuredContent, `${label} structuredContent`);
    if (root.isError === true) throw new XFrontierFeedbackToolError(label, structured);
    return structured;
  }
  const content = Array.isArray(root.content) ? root.content : [];
  const text = content
    .filter((item): item is { type: "text"; text: string } => {
      if (typeof item !== "object" || item === null) return false;
      const block = item as UnknownRecord;
      return block.type === "text" && typeof block.text === "string";
    })
    .map((item) => item.text)
    .join("\n");
  if (!text) {
    if (root.isError === true) throw new XFrontierFeedbackToolError(label, {});
    throw new Error(`${label} returned no structured or JSON text content`);
  }
  try {
    const parsed = objectAt(JSON.parse(text) as unknown, `${label} JSON text`);
    if (root.isError === true) throw new XFrontierFeedbackToolError(label, parsed);
    return parsed;
  } catch (error) {
    if (error instanceof XFrontierFeedbackToolError) throw error;
    throw new Error(`${label} returned invalid JSON text`, { cause: error });
  }
}

export function parseXFrontierDeliveryAck(
  intent: XFrontierFeedbackToolIntent,
  payload: unknown,
): XFrontierFeedbackDeliveryAck {
  const root = objectAt(payload, `${intent.toolName} payload`);
  if (root.corpus_changed !== false) {
    throw new Error(`${intent.toolName} did not affirm corpus_changed=false`);
  }
  const currentDatasetVersion = datasetVersionOf(
    root.dataset_version,
    `${intent.toolName}.dataset_version`,
  );
  const strong = intent.remoteIdempotency === "client-event-id";
  const idempotentReplay = root.idempotent_replay === true;
  if (strong && root.idempotent_replay !== true && root.idempotent_replay !== false) {
    throw new Error(`${intent.toolName} acknowledgement idempotent_replay must be boolean`);
  }
  if (idempotentReplay && !strong) {
    throw new Error(`${intent.toolName} legacy acknowledgement cannot claim an idempotent replay`);
  }
  if (!idempotentReplay && currentDatasetVersion !== intent.targetDatasetVersion) {
    throw new Error(
      `${intent.toolName} acknowledgement dataset ${currentDatasetVersion} does not match submitted intent ${intent.targetDatasetVersion}`,
    );
  }
  if (strong) {
    affirmEqual(root.client_event_id, intent.clientEventId, `${intent.toolName} client_event_id`);
    affirmEqual(root.request_hash, intent.requestHash, `${intent.toolName} request_hash`);
  }
  const remoteKind = intent.toolName === "report_finding" ? "finding" : "proposal";
  const record = objectAt(
    remoteKind === "finding" ? root.filed : root.queued,
    `${intent.toolName}.${remoteKind === "finding" ? "filed" : "queued"}`,
  );
  if (record.kind !== remoteKind) {
    throw new Error(`${intent.toolName} acknowledgement kind must be ${remoteKind}`);
  }
  if (record.by_type !== "model") {
    throw new Error(`${intent.toolName} acknowledgement by_type must be model`);
  }
  if (remoteKind === "finding") {
    const nestedDataset = datasetVersionOf(
      record.observed_at_dataset_version,
      `${intent.toolName}.filed.observed_at_dataset_version`,
    );
    if (nestedDataset !== intent.targetDatasetVersion) {
      throw new Error(`${intent.toolName} stored dataset_version does not match submitted intent`);
    }
    affirmEqual(record.finding_kind, intentString(intent, "kind"), `${intent.toolName} filed finding_kind`);
    affirmEqual(record.statement, intentString(intent, "statement"), `${intent.toolName} filed statement`);
    affirmEqual(record.evidence, intentString(intent, "evidence"), `${intent.toolName} filed evidence`);
    affirmEqual(record.by, intentString(intent, "by"), `${intent.toolName} filed by`);
    affirmEqual(
      record.filed_by,
      intentNullableString(intent, "filed_by"),
      `${intent.toolName} filed filed_by`,
    );
    const scope = objectAt(record.scope, `${intent.toolName}.filed.scope`);
    const scale = intentString(intent, "scale");
    affirmEqual(scope.scale, scale, `${intent.toolName} filed scope.scale`);
    if (scale === "record") {
      affirmEqual(scope.record_id, intentNumber(intent, "record_id"), `${intent.toolName} filed scope.record_id`);
    } else if (scale === "field") {
      affirmEqual(scope.field, intentString(intent, "field"), `${intent.toolName} filed scope.field`);
    } else if (scale === "population") {
      affirmEqual(scope.predicate, intentString(intent, "predicate"), `${intent.toolName} filed scope.predicate`);
      affirmEqual(scope.n, intentNumber(intent, "n"), `${intent.toolName} filed scope.n`);
    } else {
      throw new Error(`${intent.toolName} intent scale is unsupported`);
    }
  } else {
    const nestedDataset = datasetVersionOf(
      record.dataset_version,
      `${intent.toolName}.queued.dataset_version`,
    );
    if (nestedDataset !== intent.targetDatasetVersion) {
      throw new Error(`${intent.toolName} stored dataset_version does not match submitted intent`);
    }
    const proposalKind = intent.toolName === "propose_annotation" ? "annotation" : "structure-link";
    affirmEqual(record.proposal_kind, proposalKind, `${intent.toolName} queued proposal_kind`);
    affirmEqual(record.record_id, intentNumber(intent, "record_id"), `${intent.toolName} queued record_id`);
    affirmEqual(record.rationale, intentString(intent, "rationale"), `${intent.toolName} queued rationale`);
    affirmEqual(record.confidence, intentNumber(intent, "confidence"), `${intent.toolName} queued confidence`);
    affirmEqual(record.by, intentString(intent, "by"), `${intent.toolName} queued by`);
    if (proposalKind === "annotation") {
      affirmEqual(record.field, intentString(intent, "field"), `${intent.toolName} queued field`);
      affirmEqual(record.value, intentString(intent, "value"), `${intent.toolName} queued value`);
    } else {
      affirmEqual(
        record.structure_id,
        intentString(intent, "structure_id"),
        `${intent.toolName} queued structure_id`,
      );
      affirmEqual(record.evidence, intentString(intent, "evidence"), `${intent.toolName} queued evidence`);
    }
  }
  const timestamp = nonEmptyString(record.timestamp, `${intent.toolName} acknowledgement timestamp`);
  if (!Number.isFinite(Date.parse(timestamp))) {
    throw new Error(`${intent.toolName} acknowledgement timestamp is invalid`);
  }
  if (strong) {
    affirmEqual(record.client_event_id, intent.clientEventId, `${intent.toolName} stored client_event_id`);
    affirmEqual(record.request_hash, intent.requestHash, `${intent.toolName} stored request_hash`);
    const receipt = objectAt(root.receipt, `${intent.toolName}.receipt`);
    affirmEqual(receipt.client_event_id, intent.clientEventId, `${intent.toolName} receipt client_event_id`);
    affirmEqual(receipt.request_hash, intent.requestHash, `${intent.toolName} receipt request_hash`);
    affirmEqual(receipt.record_id, record.id as string, `${intent.toolName} receipt record_id`);
    affirmEqual(
      receipt.dataset_version,
      intent.targetDatasetVersion,
      `${intent.toolName} receipt dataset_version`,
    );
  }
  return {
    datasetVersion: intent.targetDatasetVersion,
    currentDatasetVersion,
    remoteId: nonEmptyString(record.id, `${intent.toolName} acknowledgement id`),
    remoteKind,
    timestamp,
    ...(strong
      ? { clientEventId: intent.clientEventId, requestHash: intent.requestHash }
      : {}),
    idempotentReplay,
    corpusChanged: false,
    raw: root,
  };
}

/** Parse the exact read-only recovery surface and re-run the same full content
 * binding as a writer acknowledgement when a committed record is found. */
export function parseXFrontierReceiptLookup(
  intent: XFrontierFeedbackStrongToolIntent,
  payload: unknown,
): XFrontierFeedbackReceiptLookup {
  const root = objectAt(payload, "get_feedback_receipt payload");
  const currentDatasetVersion = datasetVersionOf(
    root.dataset_version,
    "get_feedback_receipt.dataset_version",
  );
  affirmEqual(root.client_event_id, intent.clientEventId, "get_feedback_receipt client_event_id");
  if (root.found === false) {
    requireExactKeys(
      root,
      ["dataset_version", "found", "client_event_id", "receipt", "record", "note"],
      "get_feedback_receipt",
    );
    if (root.receipt !== null || root.record !== null) {
      throw new Error("get_feedback_receipt found=false requires null receipt and record");
    }
    nonEmptyString(root.note, "get_feedback_receipt.note");
    return {
      found: false,
      currentDatasetVersion,
      clientEventId: intent.clientEventId,
      raw: root,
    };
  }
  if (root.found !== true) throw new Error("get_feedback_receipt found must be boolean");
  requireExactKeys(
    root,
    ["dataset_version", "found", "client_event_id", "request_hash", "receipt", "record", "note"],
    "get_feedback_receipt",
  );
  nonEmptyString(root.note, "get_feedback_receipt.note");
  affirmEqual(root.request_hash, intent.requestHash, "get_feedback_receipt request_hash");
  const record = objectAt(root.record, "get_feedback_receipt.record");
  const receipt = objectAt(root.receipt, "get_feedback_receipt.receipt");
  const acknowledgement = parseXFrontierDeliveryAck(intent, {
    dataset_version: currentDatasetVersion,
    ...(intent.toolName === "report_finding" ? { filed: record } : { queued: record }),
    client_event_id: intent.clientEventId,
    request_hash: intent.requestHash,
    receipt,
    idempotent_replay: true,
    corpus_changed: false,
  });
  return {
    found: true,
    currentDatasetVersion,
    clientEventId: intent.clientEventId,
    requestHash: intent.requestHash,
    acknowledgement,
    raw: root,
  };
}

export const assertXFrontierReadTool = (tools: UnknownRecord[], name: string): void => {
  const tool = tools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`xFrontier MCP does not expose required read tool ${name}`);
  const annotations = objectAt(tool.annotations, `${name} annotations`);
  if (
    annotations.readOnlyHint !== true
    || annotations.destructiveHint !== false
    || annotations.idempotentHint !== true
  ) {
    throw new Error(
      `${name} safety annotations changed; expected readOnlyHint=true, destructiveHint=false, and idempotentHint=true`,
    );
  }
};

export const assertXFrontierFeedbackProtocolVersion = (
  version: unknown,
  mode: "read" | "strong-write" = "read",
): string => {
  const actual = nonEmptyString(version, "xFrontier MCP server version");
  const supported = mode === "strong-write"
    ? [XFRONTIER_FEEDBACK_STRONG_WRITE_PROTOCOL_VERSION]
    : [...XFRONTIER_FEEDBACK_READ_PROTOCOL_VERSIONS];
  if (!supported.includes(actual)) {
    throw new Error(
      `refusing unreviewed xFrontier feedback protocol ${actual} for ${mode}; expected ${supported.join(" or ")}`,
    );
  }
  return actual;
};

export const assertXFrontierStrongWriteTool = (
  tools: UnknownRecord[],
  name: XFrontierFeedbackToolName,
): void => {
  const tool = tools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`xFrontier MCP does not expose requested write tool ${name}`);
  const annotations = objectAt(tool.annotations, `${name} annotations`);
  if (
    annotations.readOnlyHint !== false
    || annotations.destructiveHint !== false
    || annotations.idempotentHint !== false
  ) {
    throw new Error(
      `${name} safety annotations changed; expected readOnlyHint=false, destructiveHint=false, and idempotentHint=false`,
    );
  }
  const schema = objectAt(tool.inputSchema, `${name} inputSchema`);
  const properties = objectAt(schema.properties, `${name} inputSchema.properties`);
  for (const field of ["client_event_id", "expected_dataset_version", "expected_content_hash"]) {
    if (!(field in properties)) {
      throw new Error(`${name} does not expose required xFrontier 0.6 field ${field}`);
    }
  }
};

class McpXFrontierFeedbackRemote implements XFrontierFeedbackRemote {
  constructor(
    private readonly client: Client,
    readonly info: XFrontierFeedbackRemoteInfo,
    private readonly timeoutMs: number,
    private readonly authorizedWriteTool?: XFrontierFeedbackToolName,
  ) {}

  private async structured(name: string, args: UnknownRecord): Promise<UnknownRecord> {
    const result = await this.client.callTool(
      { name, arguments: args },
      undefined,
      { timeout: this.timeoutMs },
    );
    return readXFrontierStructuredResult(result, name);
  }

  private async readOneSweep(): Promise<XFrontierFeedbackReadState> {
    const findingsResponse = await this.structured("list_findings", { include_stale: true });
    const proposalResponses: UnknownRecord[] = [];
    const seenCursors = new Set<string>();
    let cursor: string | undefined;
    for (let page = 0; page < MAX_PROPOSAL_PAGES; page += 1) {
      const response = await this.structured("list_proposals", {
        limit: PROPOSAL_PAGE_LIMIT,
        ...(cursor ? { cursor } : {}),
      });
      proposalResponses.push(response);
      const next = response.nextCursor;
      if (next === null) break;
      if (typeof next !== "string" || next.length === 0) {
        throw new Error("list_proposals returned an invalid nextCursor");
      }
      if (seenCursors.has(next)) throw new Error("list_proposals cursor cycle detected");
      seenCursors.add(next);
      cursor = next;
      if (page === MAX_PROPOSAL_PAGES - 1) {
        throw new Error(`list_proposals exceeded ${MAX_PROPOSAL_PAGES} pages`);
      }
    }
    return normalizeXFrontierFeedbackReadState({ findingsResponse, proposalResponses });
  }

  async readFeedbackState(): Promise<XFrontierFeedbackReadState> {
    // Cursor offsets are not tied to a ledger revision. Two identical complete
    // sweeps establish a quiet-window observation without pretending the
    // upstream cursor itself is snapshot-consistent.
    const first = await this.readOneSweep();
    const second = await this.readOneSweep();
    if (JSON.stringify(first) !== JSON.stringify(second)) {
      throw new Error("xFrontier feedback ledger changed between complete read sweeps; retry later");
    }
    if (first.datasetVersion !== this.info.datasetVersion) {
      throw new Error(
        `xFrontier dataset changed after preflight: ${this.info.datasetVersion} -> ${first.datasetVersion}`,
      );
    }
    return first;
  }

  async submit(intent: XFrontierFeedbackToolIntent): Promise<XFrontierFeedbackDeliveryAck> {
    if (intent.remoteIdempotency !== "client-event-id") {
      throw new Error("xFrontier delivery requires the v2 client-event-id intent");
    }
    if (this.authorizedWriteTool !== intent.toolName) {
      throw new Error(`this MCP session is not authorized to call ${intent.toolName}`);
    }
    if (intent.targetDatasetVersion !== this.info.datasetVersion) {
      throw new Error(
        `feedback intent targets ${intent.targetDatasetVersion}, preflight observed ${this.info.datasetVersion}`,
      );
    }
    const payload = await this.structured(intent.toolName, intent.arguments);
    return parseXFrontierDeliveryAck(intent, payload);
  }

  async lookupReceipt(
    intent: XFrontierFeedbackStrongToolIntent,
  ): Promise<XFrontierFeedbackReceiptLookup> {
    if (this.info.version !== XFRONTIER_FEEDBACK_STRONG_WRITE_PROTOCOL_VERSION) {
      throw new Error(`xFrontier ${this.info.version} has no reviewed exact receipt lookup`);
    }
    const payload = await this.structured("get_feedback_receipt", {
      client_event_id: intent.clientEventId,
    });
    return parseXFrontierReceiptLookup(intent, payload);
  }

  async close(): Promise<void> {
    await this.client.close().catch(() => {});
  }
}

/** Spawn and verify the local xFrontier stdio MCP. Merely constructing or
 * importing this module never starts a process. */
export async function connectXFrontierFeedbackRemote(
  options: ConnectXFrontierFeedbackOptions = {},
): Promise<XFrontierFeedbackRemote> {
  const serverEntry = options.serverEntry ?? process.env.XFRONTIER_MCP_SERVER ?? DEFAULT_XFRONTIER_MCP_ENTRY;
  const command = options.command ?? process.env.XFRONTIER_MCP_COMMAND ?? process.execPath;
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  await access(serverEntry, constants.R_OK).catch((error) => {
    throw new Error(`xFrontier MCP server entry is not readable: ${serverEntry}`, { cause: error });
  });

  const ledgerDir = options.ledgerDir ?? process.env.XF_LEDGER_DIR;
  const transport = new StdioClientTransport({
    command,
    args: [serverEntry],
    ...(ledgerDir ? { env: { XF_LEDGER_DIR: ledgerDir } } : {}),
    stderr: "inherit",
  });
  const client = new Client({ name: "frontier-isles-xfrontier-feedback", version: "0.1.0" });
  try {
    await client.connect(transport, { timeout: timeoutMs });
    const server = client.getServerVersion();
    if (!server || server.name !== "xfrontier" || typeof server.version !== "string") {
      throw new Error(`unexpected MCP server identity ${JSON.stringify(server)}`);
    }
    assertXFrontierFeedbackProtocolVersion(
      server.version,
      options.writeTool ? "strong-write" : "read",
    );
    const listed = await client.listTools({}, { timeout: timeoutMs });
    const tools = listed.tools.map((tool) => tool as unknown as UnknownRecord);
    for (const name of ["stats", "list_findings", "list_proposals"]) assertXFrontierReadTool(tools, name);
    if (server.version === XFRONTIER_FEEDBACK_STRONG_WRITE_PROTOCOL_VERSION) {
      assertXFrontierReadTool(tools, "get_feedback_receipt");
    }
    if (options.writeTool) assertXFrontierStrongWriteTool(tools, options.writeTool);

    const stats = readXFrontierStructuredResult(
      await client.callTool({ name: "stats", arguments: {} }, undefined, { timeout: timeoutMs }),
      "stats",
    );
    const datasetVersion = datasetVersionOf(stats.dataset_version, "stats.dataset_version");
    const proposalStats = objectAt(stats.proposals, "stats.proposals");
    if (!Array.isArray(proposalStats.corrupt_files)) {
      throw new Error("stats.proposals.corrupt_files must be an array");
    }
    if (proposalStats.corrupt_files.length > 0) {
      throw new Error(
        `xFrontier proposal ledger reports ${proposalStats.corrupt_files.length} corrupt file(s)`,
      );
    }
    return new McpXFrontierFeedbackRemote(
      client,
      { name: "xfrontier", version: server.version, datasetVersion, serverEntry },
      timeoutMs,
      options.writeTool,
    );
  } catch (error) {
    await client.close().catch(() => {});
    throw error;
  }
}

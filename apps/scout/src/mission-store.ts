/** Durable, content-addressed AgentRunBundle storage for the Node scout. */

import { createHash, randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { canonicalStringify } from "@frontier-isles/opp";
import { normalizeMissionContract, type MissionContractV1 } from "@frontier-isles/core/mission";
import { parseAgentRunBundle } from "@frontier-isles/core/mission-bundle";
import type { AgentRunBundle } from "@frontier-isles/core/mission-runner";

export const MISSION_RUN_RECORD_FORMAT = "frontier-isles/agent-run" as const;
export const MISSION_RUN_RECORD_VERSION = 1 as const;

export type MissionRunRecordState = "running" | "settled";

export interface MissionRunRecord<TOutput = unknown> {
  readonly format: typeof MISSION_RUN_RECORD_FORMAT;
  readonly version: typeof MISSION_RUN_RECORD_VERSION;
  readonly state: MissionRunRecordState;
  readonly requestHash: string;
  readonly attemptId: string;
  readonly updatedAt: string;
  readonly contract: MissionContractV1;
  /** A running record may retain the last settled paused bundle for inspection. */
  readonly bundle?: AgentRunBundle<TOutput>;
  readonly digest: string;
}

export class MissionRunRecordError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid mission run record: ${issues.join("; ")}`);
    this.name = "MissionRunRecordError";
    this.issues = issues;
  }
}

export class MissionRecoveryRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissionRecoveryRequiredError";
  }
}

type MissionRunRecordPayload<TOutput> = Omit<MissionRunRecord<TOutput>, "digest">;

const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const isIsoTimestamp = (value: unknown): value is string =>
  typeof value === "string" && Number.isFinite(Date.parse(value));

const sha256 = (value: unknown): string => {
  let canonical: string;
  try {
    canonical = canonicalStringify(value);
  } catch (error) {
    throw new MissionRunRecordError([
      `record values must be canonical JSON: ${error instanceof Error ? error.message : String(error)}`,
    ]);
  }
  return `sha256:${createHash("sha256").update(canonical, "utf8").digest("hex")}`;
};

const jsonClone = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

export const hashMissionRequest = (value: unknown): string => sha256({
  format: "frontier-isles/mission-request",
  version: 1,
  value,
});

export function createMissionRunRecord<TOutput>(input: {
  state: MissionRunRecordState;
  requestHash: string;
  attemptId: string;
  updatedAt: string;
  contract: MissionContractV1;
  bundle?: AgentRunBundle<TOutput>;
}): MissionRunRecord<TOutput> {
  const issues: string[] = [];
  if (!SHA256_PATTERN.test(input.requestHash)) issues.push("requestHash must be sha256:<64 hex>");
  if (!input.attemptId.trim()) issues.push("attemptId is required");
  if (!isIsoTimestamp(input.updatedAt)) issues.push("updatedAt must be an ISO-compatible timestamp");

  const contract = normalizeMissionContract(input.contract);
  let bundle: AgentRunBundle<TOutput> | undefined;
  if (input.bundle) {
    bundle = parseAgentRunBundle<TOutput>(jsonClone(input.bundle));
    if (canonicalStringify(bundle.contract) !== canonicalStringify(contract)) {
      issues.push("bundle contract must match the record contract");
    }
  }
  if (input.state === "running" && bundle && bundle.status !== "paused") {
    issues.push("a running record may retain only a paused base bundle");
  }
  if (input.state === "settled" && !bundle) issues.push("a settled record requires a bundle");
  if (issues.length > 0) throw new MissionRunRecordError(issues);

  const payload: MissionRunRecordPayload<TOutput> = {
    format: MISSION_RUN_RECORD_FORMAT,
    version: MISSION_RUN_RECORD_VERSION,
    state: input.state,
    requestHash: input.requestHash,
    attemptId: input.attemptId,
    updatedAt: input.updatedAt,
    contract,
    bundle,
  };
  return Object.freeze({ ...payload, digest: sha256(payload) });
}

export function parseMissionRunRecord<TOutput = unknown>(text: string): MissionRunRecord<TOutput> {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    throw new MissionRunRecordError([
      `record must be valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    ]);
  }
  if (!isRecord(raw)) throw new MissionRunRecordError(["record must be an object"]);

  const allowedKeys = new Set([
    "format",
    "version",
    "state",
    "requestHash",
    "attemptId",
    "updatedAt",
    "contract",
    "bundle",
    "digest",
  ]);
  const issues = Object.keys(raw)
    .filter((key) => !allowedKeys.has(key))
    .map((key) => `unexpected field ${key}`);
  if (raw.format !== MISSION_RUN_RECORD_FORMAT) issues.push(`format must be ${MISSION_RUN_RECORD_FORMAT}`);
  if (raw.version !== MISSION_RUN_RECORD_VERSION) issues.push("version must be 1");
  if (raw.state !== "running" && raw.state !== "settled") issues.push("state must be running or settled");
  if (typeof raw.requestHash !== "string" || !SHA256_PATTERN.test(raw.requestHash)) {
    issues.push("requestHash must be sha256:<64 hex>");
  }
  if (typeof raw.attemptId !== "string" || !raw.attemptId.trim()) issues.push("attemptId is required");
  if (!isIsoTimestamp(raw.updatedAt)) issues.push("updatedAt must be an ISO-compatible timestamp");
  if (typeof raw.digest !== "string" || !SHA256_PATTERN.test(raw.digest)) issues.push("digest must be sha256:<64 hex>");
  if (issues.length > 0) throw new MissionRunRecordError(issues);

  const { digest, ...payload } = raw;
  if (sha256(payload) !== digest) throw new MissionRunRecordError(["digest does not match the record payload"]);

  return createMissionRunRecord<TOutput>({
    state: raw.state as MissionRunRecordState,
    requestHash: raw.requestHash as string,
    attemptId: raw.attemptId as string,
    updatedAt: raw.updatedAt as string,
    contract: normalizeMissionContract(raw.contract),
    bundle: raw.bundle === undefined
      ? undefined
      : parseAgentRunBundle<TOutput>(raw.bundle),
  });
}

export const serializeMissionRunRecord = (record: MissionRunRecord): string =>
  `${JSON.stringify(record, null, 2)}\n`;

export async function loadMissionRunRecord<TOutput = unknown>(filePath: string): Promise<MissionRunRecord<TOutput> | undefined> {
  try {
    return parseMissionRunRecord<TOutput>(await readFile(resolve(filePath), "utf8"));
  } catch (error) {
    if (isRecord(error) && error.code === "ENOENT") return undefined;
    throw error;
  }
}

export async function saveMissionRunRecord(filePath: string, record: MissionRunRecord): Promise<void> {
  const serialized = serializeMissionRunRecord(record);
  // Validate caller-built values before touching the existing atomic target.
  parseMissionRunRecord(serialized);
  const target = resolve(filePath);
  const directory = dirname(target);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const temporary = `${target}.${process.pid}.${randomUUID()}.tmp`;
  let handle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    handle = await open(temporary, "wx", 0o600);
    await handle.writeFile(serialized, "utf8");
    await handle.sync();
    await handle.close();
    handle = undefined;
    await rename(temporary, target);
    let directoryHandle: Awaited<ReturnType<typeof open>> | undefined;
    try {
      directoryHandle = await open(directory, "r");
      await directoryHandle.sync();
    } catch {
      // Some filesystems do not permit directory fsync; the file rename remains atomic.
    } finally {
      await directoryHandle?.close().catch(() => {});
    }
  } catch (error) {
    if (handle) await handle.close().catch(() => {});
    await unlink(temporary).catch(() => {});
    throw error;
  }
}

export async function withMissionRunLock<T>(
  filePath: string,
  operation: (attemptId: string) => Promise<T>,
): Promise<T> {
  const target = resolve(filePath);
  const lockPath = `${target}.lock`;
  const attemptId = randomUUID();
  await mkdir(dirname(target), { recursive: true, mode: 0o700 });
  let lock: Awaited<ReturnType<typeof open>> | undefined;
  let created = false;
  try {
    lock = await open(lockPath, "wx", 0o600);
    created = true;
    await lock.writeFile(JSON.stringify({ attemptId, pid: process.pid, acquiredAt: new Date().toISOString() }), "utf8");
    await lock.sync();
    await lock.close();
    lock = undefined;
  } catch (error) {
    if (lock) await lock.close().catch(() => {});
    if (created) await unlink(lockPath).catch(() => {});
    if (isRecord(error) && error.code === "EEXIST") {
      throw new MissionRecoveryRequiredError(`Mission state is locked: ${lockPath}`);
    }
    throw error;
  }

  try {
    return await operation(attemptId);
  } finally {
    await unlink(lockPath).catch((error: unknown) => {
      if (!isRecord(error) || error.code !== "ENOENT") throw error;
    });
  }
}

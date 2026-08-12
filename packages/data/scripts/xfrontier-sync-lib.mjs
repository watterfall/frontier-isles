import { randomUUID } from 'node:crypto';
import { open, readFile, rename, unlink } from 'node:fs/promises';
import { dirname } from 'node:path';

export const SNAPSHOT_SCHEMA_VERSION = 'xfrontier-reference-snapshot/v1';
export const DIFF_SCHEMA_VERSION = 'xfrontier-reference-diff/v1';

const STATUS_ORDER = ['active', 'withdrawn', 'unknown'];
const CONTENT_HASH_PATTERN = /^[0-9a-f]{8}$/;

const asNonEmptyString = (value, label) => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
};

const asIsoDate = (value, label) => {
  const date = asNonEmptyString(value, label);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`${label} must be an ISO calendar date (YYYY-MM-DD)`);
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`${label} must be a valid ISO calendar date`);
  }
  return date;
};

const asRecordId = (value, label = 'record id') => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
  return value;
};

/**
 * Gather xFrontier references from the evaluated data modules. Keeping this as
 * a function makes the completeness boundary explicit and independently
 * testable: source-text extraction would miss composed module exports.
 */
export function collectReferencedIds(frontiers, structures) {
  const ids = new Set();
  for (const frontier of frontiers) ids.add(asRecordId(frontier.atlasN, 'frontier.atlasN'));
  for (const structure of structures) {
    for (const id of structure.provenance?.recordIds ?? []) {
      ids.add(asRecordId(id, 'structure.provenance.recordIds[]'));
    }
  }
  return [...ids].sort((a, b) => a - b);
}

/** Accept SDK structuredContent, with the text block as a compatibility path. */
export function readStructuredResult(result, label) {
  if (result?.isError) throw new Error(`${label} returned an MCP tool error`);
  if (result?.structuredContent && typeof result.structuredContent === 'object') {
    return result.structuredContent;
  }
  const text = result?.content
    ?.filter((item) => item?.type === 'text' && typeof item.text === 'string')
    .map((item) => item.text)
    .join('\n');
  if (!text) throw new Error(`${label} returned no structured or JSON text content`);
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} returned invalid JSON text`, { cause: error });
  }
}

const normalizeReference = (item) => {
  const id = asRecordId(item?.id);
  if (item?.status === 'active') {
    const contentHash = asNonEmptyString(item.content_hash, `active record ${id} content_hash`);
    if (!CONTENT_HASH_PATTERN.test(contentHash)) {
      throw new Error(`active record ${id} content_hash must be 8 lowercase hexadecimal characters`);
    }
    return {
      id,
      status: 'active',
      contentHash,
    };
  }
  if (item?.status === 'withdrawn') {
    return {
      id,
      status: 'withdrawn',
      reason: asNonEmptyString(item.reason, `withdrawn record ${id} reason`),
      note: asNonEmptyString(item.note, `withdrawn record ${id} note`),
    };
  }
  if (item?.status === 'unknown') return { id, status: 'unknown' };
  throw new Error(`record ${id} has unsupported status ${JSON.stringify(item?.status)}`);
};

const tallyReferences = (references) => Object.fromEntries(
  STATUS_ORDER.map((status) => [status, references.filter((item) => item.status === status).length]),
);

const sameTally = (left, right) => STATUS_ORDER.every((status) => left?.[status] === right?.[status]);

const normalizeStoredReference = (item) => normalizeReference(
  item?.status === 'active' ? { ...item, content_hash: item.contentHash } : item,
);

/** Validate a stored baseline before trusting it as the left side of a diff. */
export function validateReferenceSnapshot(snapshot, { allowLegacyMetadata = false } = {}) {
  if (!snapshot || typeof snapshot !== 'object') throw new Error('snapshot must be an object');
  if (snapshot.schemaVersion === undefined && !allowLegacyMetadata) {
    throw new Error('snapshot schemaVersion is required');
  }
  if (snapshot.schemaVersion !== undefined && snapshot.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    throw new Error(`unsupported snapshot schemaVersion ${JSON.stringify(snapshot.schemaVersion)}`);
  }
  asNonEmptyString(snapshot.datasetVersion, 'snapshot datasetVersion');
  if (snapshot.serverVersion === undefined && !allowLegacyMetadata) {
    throw new Error('snapshot serverVersion is required');
  }
  if (snapshot.serverVersion !== undefined) asNonEmptyString(snapshot.serverVersion, 'snapshot serverVersion');
  asIsoDate(snapshot.reviewedAt, 'snapshot reviewedAt');
  if (!Array.isArray(snapshot.references)) throw new Error('snapshot references must be an array');

  const references = snapshot.references.map(normalizeStoredReference);
  for (let index = 1; index < references.length; index += 1) {
    if (references[index - 1].id === references[index].id) {
      throw new Error(`snapshot contains duplicate record ${references[index].id}`);
    }
    if (references[index - 1].id > references[index].id) {
      throw new Error('snapshot references must be sorted by ascending id');
    }
  }
  const tally = tallyReferences(references);
  if (!sameTally(tally, snapshot.tally)) {
    throw new Error(`snapshot tally does not match its references: ${JSON.stringify(snapshot.tally)} vs ${JSON.stringify(tally)}`);
  }
  return snapshot;
}

/** Write-mode guard: observing upstream drift must never silently bless it. */
export function assertSnapshotWriteSafe(snapshot, expectedDatasetVersion) {
  validateReferenceSnapshot(snapshot);
  if (snapshot.datasetVersion !== expectedDatasetVersion) {
    throw new Error(
      `refusing snapshot write: MCP dataset ${snapshot.datasetVersion} differs from code dataset ${expectedDatasetVersion}`,
    );
  }
  if (snapshot.tally.unknown !== 0) {
    throw new Error(`refusing snapshot write: ${snapshot.tally.unknown} referenced ids are unknown`);
  }
}

/** Required tools may omit annotations, but an explicit writable claim is fatal. */
export function assertRequiredReadTools(tools, requiredNames = ['stats', 'resolve_ids']) {
  for (const name of requiredNames) {
    const tool = tools.find((item) => item.name === name);
    if (!tool) throw new Error(`xFrontier MCP does not expose required read tool ${name}`);
    if (tool.annotations?.readOnlyHint === false) {
      throw new Error(`xFrontier MCP marks required tool ${name} as writable; refusing to call it`);
    }
  }
}

/** Refuse an unrelated stdio server even if it happens to expose lookalike tools. */
export function assertExpectedServer(server, expectedName = 'xfrontier') {
  if (!server || server.name !== expectedName) {
    throw new Error(
      `unexpected MCP server identity: expected ${expectedName}, received ${JSON.stringify(server?.name)}`,
    );
  }
  asNonEmptyString(server.version, 'xFrontier MCP server version');
}

/**
 * Convert resolve_ids into the checked-in snapshot contract. This rejects
 * partial, duplicate, and unexpected responses before anything can be written.
 */
export function createReferenceSnapshot({
  requestedIds,
  datasetVersion,
  serverVersion,
  resolved,
  reviewedAt,
}) {
  const ids = [...new Set(requestedIds.map((id) => asRecordId(id)))].sort((a, b) => a - b);
  if (ids.length !== requestedIds.length) throw new Error('requestedIds must already be unique');

  const resolvedDataset = asNonEmptyString(resolved?.dataset_version, 'resolve_ids dataset_version');
  if (resolvedDataset !== datasetVersion) {
    throw new Error(`dataset version changed during pull: stats=${datasetVersion}, resolve_ids=${resolvedDataset}`);
  }

  const byId = new Map();
  for (const raw of resolved?.items ?? []) {
    const reference = normalizeReference(raw);
    if (byId.has(reference.id)) throw new Error(`resolve_ids returned duplicate record ${reference.id}`);
    byId.set(reference.id, reference);
  }

  const unexpected = [...byId.keys()].filter((id) => !ids.includes(id));
  if (unexpected.length > 0) throw new Error(`resolve_ids returned unexpected ids: ${unexpected.join(', ')}`);
  const missing = ids.filter((id) => !byId.has(id));
  if (missing.length > 0) throw new Error(`resolve_ids omitted requested ids: ${missing.join(', ')}`);

  const references = ids.map((id) => byId.get(id));
  const tally = tallyReferences(references);
  if (!sameTally(tally, resolved.tally)) {
    throw new Error(`resolve_ids tally does not match its items: ${JSON.stringify(resolved.tally)} vs ${JSON.stringify(tally)}`);
  }

  const snapshot = {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    datasetVersion: asNonEmptyString(datasetVersion, 'datasetVersion'),
    serverVersion: asNonEmptyString(serverVersion, 'serverVersion'),
    reviewedAt: asIsoDate(reviewedAt, 'reviewedAt'),
    source: 'local xfrontier MCP resolve_ids over module-loaded FRONTIERS and SEED_STRUCTURES references',
    tally,
    references,
  };
  validateReferenceSnapshot(snapshot);
  return snapshot;
}

/**
 * Atomically replace a snapshot while coordinating this CLI's writers and
 * checking that the baseline observed before the MCP pull is still current.
 * The parent directory fsync makes the rename durable across a power loss.
 */
export async function atomicWriteJsonIfUnchanged(path, value, expectedContents) {
  if (typeof expectedContents !== 'string') throw new Error('expected snapshot contents must be a string');
  const lockPath = `${path}.lock`;
  const temporaryPath = `${path}.${process.pid}.${randomUUID()}.tmp`;
  let lockHandle;
  let temporaryHandle;
  let directoryHandle;
  let ownsLock = false;

  try {
    try {
      lockHandle = await open(lockPath, 'wx');
      ownsLock = true;
    } catch (error) {
      if (error?.code === 'EEXIST') {
        throw new Error(`refusing snapshot write: another writer holds ${lockPath}`, { cause: error });
      }
      throw error;
    }
    await lockHandle.writeFile(`${JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() })}\n`, 'utf8');
    await lockHandle.sync();

    const currentContents = await readFile(path, 'utf8');
    if (currentContents !== expectedContents) {
      throw new Error('refusing snapshot write: baseline changed while the MCP pull was running');
    }

    temporaryHandle = await open(temporaryPath, 'wx');
    await temporaryHandle.writeFile(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
    await temporaryHandle.sync();
    await temporaryHandle.close();
    temporaryHandle = undefined;
    await rename(temporaryPath, path);

    directoryHandle = await open(dirname(path), 'r');
    await directoryHandle.sync();
    await directoryHandle.close();
    directoryHandle = undefined;
  } finally {
    await temporaryHandle?.close().catch(() => {});
    await directoryHandle?.close().catch(() => {});
    await unlink(temporaryPath).catch(() => {});
    await lockHandle?.close().catch(() => {});
    if (ownsLock) await unlink(lockPath).catch(() => {});
  }
}

const comparableReference = (reference) => {
  if (reference.status === 'active') {
    return { id: reference.id, status: reference.status, contentHash: reference.contentHash };
  }
  if (reference.status === 'withdrawn') {
    return {
      id: reference.id,
      status: reference.status,
      reason: reference.reason,
      note: reference.note,
    };
  }
  return { id: reference.id, status: reference.status };
};

const changedFields = (before, after) => {
  const fields = new Set([...Object.keys(before), ...Object.keys(after)]);
  fields.delete('id');
  return [...fields].filter((field) => before[field] !== after[field]).sort();
};

/** Diff only durable provenance fields; reviewedAt never creates drift by itself. */
export function diffReferenceSnapshots(baseline, candidate) {
  const beforeById = new Map((baseline.references ?? []).map((item) => [item.id, comparableReference(item)]));
  const afterById = new Map((candidate.references ?? []).map((item) => [item.id, comparableReference(item)]));
  const added = [...afterById.keys()].filter((id) => !beforeById.has(id)).sort((a, b) => a - b);
  const removed = [...beforeById.keys()].filter((id) => !afterById.has(id)).sort((a, b) => a - b);
  const changed = [...afterById.keys()]
    .filter((id) => beforeById.has(id))
    .map((id) => {
      const before = beforeById.get(id);
      const after = afterById.get(id);
      return { id, fields: changedFields(before, after), before, after };
    })
    .filter((item) => item.fields.length > 0)
    .sort((a, b) => a.id - b.id);

  const versions = {
    schema: {
      before: baseline.schemaVersion ?? null,
      after: candidate.schemaVersion,
      changed: baseline.schemaVersion !== candidate.schemaVersion,
    },
    dataset: {
      before: baseline.datasetVersion ?? null,
      after: candidate.datasetVersion,
      changed: baseline.datasetVersion !== candidate.datasetVersion,
    },
    server: {
      before: baseline.serverVersion ?? null,
      after: candidate.serverVersion,
      changed: baseline.serverVersion !== candidate.serverVersion,
    },
  };
  const tallyChanged = !sameTally(baseline.tally, candidate.tally);
  const dataChanged = versions.dataset.changed || added.length > 0 || removed.length > 0 || changed.length > 0 || tallyChanged;
  const metadataChanged = versions.schema.changed || versions.server.changed;

  return {
    schemaVersion: DIFF_SCHEMA_VERSION,
    changed: dataChanged || metadataChanged,
    dataChanged,
    metadataChanged,
    versions,
    referenceSet: { added, removed },
    records: { changed },
    tally: {
      before: baseline.tally ?? null,
      after: candidate.tally,
      changed: tallyChanged,
    },
  };
}

const versionLine = (label, version) => {
  const before = version.before ?? 'not recorded';
  const marker = version.changed ? 'changed' : 'unchanged';
  return `${label}: ${before} -> ${version.after} (${marker})`;
};

const formatIds = (ids) => ids.length === 0 ? 'none' : ids.map((id) => `XF-${String(id).padStart(6, '0')}`).join(', ');

const describeReference = (reference) => {
  if (reference.status === 'active') return `active hash=${reference.contentHash}`;
  if (reference.status === 'withdrawn') {
    return `withdrawn reason=${reference.reason} note=${JSON.stringify(reference.note)}`;
  }
  return 'unknown';
};

export function formatHumanReport({ mode, server, snapshotPath, candidate, diff, wroteSnapshot }) {
  const lines = [
    `xFrontier reference pull (${mode})`,
    `server: ${server.name} ${server.version} via ${server.entry}`,
    versionLine('schema', diff.versions.schema),
    versionLine('dataset', diff.versions.dataset),
    versionLine('server', diff.versions.server),
    `references: ${candidate.references.length} (${candidate.tally.active} active, ${candidate.tally.withdrawn} withdrawn, ${candidate.tally.unknown} unknown)`,
    'scope: Frontier Isles referenced ids only; unrelated corpus changes are detectable by dataset version but not locatable here',
    `added: ${formatIds(diff.referenceSet.added)}`,
    `removed: ${formatIds(diff.referenceSet.removed)}`,
    `changed records: ${formatIds(diff.records.changed.map((item) => item.id))}`,
    `snapshot before write: ${diff.changed ? 'drift detected' : 'current'}`,
  ];
  for (const change of diff.records.changed) {
    lines.push(
      `  XF-${String(change.id).padStart(6, '0')}: ${describeReference(change.before)} -> ${describeReference(change.after)} [${change.fields.join(', ')}]`,
    );
  }
  if (wroteSnapshot) lines.push(`wrote atomically: ${snapshotPath}`);
  else lines.push(`no files changed: ${snapshotPath}`);
  return lines.join('\n');
}

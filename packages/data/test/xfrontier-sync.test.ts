import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  assertExpectedServer,
  assertRequiredReadTools,
  assertSnapshotWriteSafe,
  atomicWriteJsonIfUnchanged,
  collectReferencedIds,
  createReferenceSnapshot,
  diffReferenceSnapshots,
  readStructuredResult,
  validateReferenceSnapshot,
} from '../scripts/xfrontier-sync-lib.mjs';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  for (const directory of temporaryDirectories.splice(0)) {
    await rm(directory, { recursive: true, force: true });
  }
});

const resolved = (items: Array<Record<string, unknown>>, dataset = 'xf-next') => ({
  dataset_version: dataset,
  tally: {
    active: items.filter((item) => item.status === 'active').length,
    withdrawn: items.filter((item) => item.status === 'withdrawn').length,
    unknown: items.filter((item) => item.status === 'unknown').length,
  },
  items,
});

describe('xFrontier downstream pull logic', () => {
  it('collects the evaluated frontier and structure references once, in stable order', () => {
    expect(collectReferencedIds(
      [{ atlasN: 9 }, { atlasN: 2 }],
      [
        { provenance: { recordIds: [4, 9] } },
        { provenance: { recordIds: [1, 4] } },
      ],
    )).toEqual([1, 2, 4, 9]);
  });

  it('normalizes a complete resolve_ids response into the snapshot contract', () => {
    const snapshot = createReferenceSnapshot({
      requestedIds: [1, 2, 3],
      datasetVersion: 'xf-next',
      serverVersion: '0.5.0',
      reviewedAt: '2026-08-12',
      resolved: resolved([
        { id: 1, status: 'active', content_hash: 'abc12345' },
        { id: 2, status: 'withdrawn', reason: 'duplicate', note: 'superseded' },
        { id: 3, status: 'unknown' },
      ]),
    });

    expect(snapshot).toMatchObject({
      schemaVersion: 'xfrontier-reference-snapshot/v1',
      datasetVersion: 'xf-next',
      serverVersion: '0.5.0',
      tally: { active: 1, withdrawn: 1, unknown: 1 },
    });
    expect(snapshot.references).toEqual([
      { id: 1, status: 'active', contentHash: 'abc12345' },
      { id: 2, status: 'withdrawn', reason: 'duplicate', note: 'superseded' },
      { id: 3, status: 'unknown' },
    ]);
  });

  it('rejects a partial response rather than presenting it as a clean pull', () => {
    expect(() => createReferenceSnapshot({
      requestedIds: [1, 2],
      datasetVersion: 'xf-next',
      serverVersion: '0.5.0',
      reviewedAt: '2026-08-12',
      resolved: resolved([{ id: 1, status: 'active', content_hash: 'abc12345' }]),
    })).toThrow('resolve_ids omitted requested ids: 2');
  });

  it('strictly validates the stored baseline, including duplicate ids, status data, and tally', () => {
    const baseline = {
      schemaVersion: 'xfrontier-reference-snapshot/v1',
      datasetVersion: 'xf-old',
      reviewedAt: '2026-08-11',
      tally: { active: 2, withdrawn: 0, unknown: 0 },
      references: [
        { id: 1, status: 'active', contentHash: 'aaaaaaaa' },
        { id: 1, status: 'active', contentHash: 'bbbbbbbb' },
      ],
    };
    expect(() => validateReferenceSnapshot(baseline, { allowLegacyMetadata: true }))
      .toThrow('snapshot contains duplicate record 1');
    expect(() => validateReferenceSnapshot({
      ...baseline,
      tally: { active: 1, withdrawn: 0, unknown: 0 },
      references: [{ id: 1, status: 'active', contentHash: 'not-a-hash' }],
    }, { allowLegacyMetadata: true })).toThrow('content_hash must be 8 lowercase hexadecimal characters');
    expect(() => validateReferenceSnapshot({
      ...baseline,
      references: [{ id: 1, status: 'active', contentHash: 'aaaaaaaa' }],
    }, { allowLegacyMetadata: true })).toThrow('snapshot tally does not match its references');
  });

  it('guards write mode against unknown references, unapplied dataset versions, and writable tools', () => {
    const candidate = createReferenceSnapshot({
      requestedIds: [1],
      datasetVersion: 'xf-next',
      serverVersion: '0.5.0',
      reviewedAt: '2026-08-12',
      resolved: resolved([{ id: 1, status: 'unknown' }]),
    });
    expect(() => assertSnapshotWriteSafe(candidate, 'xf-next'))
      .toThrow('refusing snapshot write: 1 referenced ids are unknown');
    expect(() => assertSnapshotWriteSafe({
      ...candidate,
      tally: { active: 1, withdrawn: 0, unknown: 0 },
      references: [{ id: 1, status: 'active', contentHash: 'aaaaaaaa' }],
    }, 'xf-current')).toThrow('MCP dataset xf-next differs from code dataset xf-current');
    expect(() => assertRequiredReadTools([
      { name: 'stats', annotations: { readOnlyHint: false } },
      { name: 'resolve_ids' },
    ])).toThrow('marks required tool stats as writable');
    expect(() => assertExpectedServer({ name: 'lookalike', version: '0.5.0' }))
      .toThrow('unexpected MCP server identity');
  });

  it('requires a real ISO review date', () => {
    expect(() => createReferenceSnapshot({
      requestedIds: [1],
      datasetVersion: 'xf-next',
      serverVersion: '0.5.0',
      reviewedAt: '2026-02-30',
      resolved: resolved([{ id: 1, status: 'active', content_hash: 'abc12345' }]),
    })).toThrow('reviewedAt must be a valid ISO calendar date');
  });

  it('atomically writes only when the baseline is unchanged and cleans sidecars on refusal', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'frontier-isles-xfrontier-sync-'));
    temporaryDirectories.push(directory);
    const path = join(directory, 'snapshot.json');
    const baseline = '{"version":"old"}\n';
    await writeFile(path, baseline, 'utf8');

    await atomicWriteJsonIfUnchanged(path, { version: 'new' }, baseline);
    expect(await readFile(path, 'utf8')).toBe('{\n  "version": "new"\n}\n');

    const observed = await readFile(path, 'utf8');
    await writeFile(path, '{"version":"concurrent"}\n', 'utf8');
    await expect(atomicWriteJsonIfUnchanged(path, { version: 'stale-writer' }, observed))
      .rejects.toThrow('baseline changed while the MCP pull was running');
    expect(await readFile(path, 'utf8')).toBe('{"version":"concurrent"}\n');
    expect((await readdir(directory)).sort()).toEqual(['snapshot.json']);
  });

  it('separates corpus drift from MCP server metadata drift', () => {
    const baseline = {
      schemaVersion: 'xfrontier-reference-snapshot/v1',
      datasetVersion: 'xf-old',
      serverVersion: '0.4.0',
      tally: { active: 2, withdrawn: 1, unknown: 0 },
      references: [
        { id: 1, status: 'active', contentHash: 'aaaaaaaa' },
        { id: 2, status: 'active', contentHash: 'bbbbbbbb' },
        { id: 4, status: 'withdrawn', reason: 'duplicate', note: 'old note' },
      ],
    };
    const candidate = {
      schemaVersion: 'xfrontier-reference-snapshot/v1',
      datasetVersion: 'xf-new',
      serverVersion: '0.5.0',
      tally: { active: 1, withdrawn: 2, unknown: 0 },
      references: [
        { id: 1, status: 'active', contentHash: 'cccccccc' },
        { id: 2, status: 'withdrawn', reason: 'applied', note: 'deployed' },
        { id: 3, status: 'active', contentHash: 'dddddddd' },
      ],
    };

    const diff = diffReferenceSnapshots(baseline, candidate);
    expect(diff).toMatchObject({
      changed: true,
      dataChanged: true,
      metadataChanged: true,
      versions: {
        schema: {
          before: 'xfrontier-reference-snapshot/v1',
          after: 'xfrontier-reference-snapshot/v1',
          changed: false,
        },
        dataset: { before: 'xf-old', after: 'xf-new', changed: true },
        server: { before: '0.4.0', after: '0.5.0', changed: true },
      },
      referenceSet: { added: [3], removed: [4] },
      tally: { changed: true },
    });
    expect(diff.records.changed).toEqual([
      expect.objectContaining({ id: 1, fields: ['contentHash'] }),
      expect.objectContaining({ id: 2, fields: ['contentHash', 'note', 'reason', 'status'] }),
    ]);
  });

  it('ignores review timestamps and accepts JSON text when structuredContent is absent', () => {
    const reference = {
      schemaVersion: 'xfrontier-reference-snapshot/v1',
      datasetVersion: 'xf-same',
      serverVersion: '0.5.0',
      tally: { active: 1, withdrawn: 0, unknown: 0 },
      references: [{ id: 1, status: 'active', contentHash: 'abc12345' }],
    };
    expect(diffReferenceSnapshots(
      { ...reference, reviewedAt: '2026-08-11' },
      { ...reference, reviewedAt: '2026-08-12' },
    )).toMatchObject({ changed: false, dataChanged: false, metadataChanged: false });
    expect(readStructuredResult({ content: [{ type: 'text', text: '{"dataset_version":"xf-same"}' }] }, 'stats'))
      .toEqual({ dataset_version: 'xf-same' });
  });
});

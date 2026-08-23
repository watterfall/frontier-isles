import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FRONTIERS, XFRONTIER_DATASET_VERSION } from '../src/frontiers';
import { SEED_STRUCTURES } from '../src/structures';

interface ReferenceSnapshot {
  schemaVersion: string;
  datasetVersion: string;
  serverVersion: string;
  reviewedAt: string;
  source: string;
  tally: { active: number; withdrawn: number; unknown: number };
  references: Array<
    | { id: number; status: 'active'; contentHash: string }
    | { id: number; status: 'withdrawn'; reason: string; note: string }
  >;
}

const SNAPSHOT = JSON.parse(
  readFileSync(new URL('../xfrontier-reference-snapshot.json', import.meta.url), 'utf8'),
) as ReferenceSnapshot;

const referencedIds = (): number[] => {
  const ids = new Set(FRONTIERS.map((frontier) => frontier.atlasN));
  for (const structure of SEED_STRUCTURES) {
    for (const id of structure.provenance.recordIds) ids.add(id);
  }
  return [...ids].sort((a, b) => a - b);
};

describe('xfrontier provenance snapshot', () => {
  it('covers the complete module-loaded reference set from the reviewed dataset', () => {
    expect(SNAPSHOT.schemaVersion).toBe('xfrontier-reference-snapshot/v1');
    expect(SNAPSHOT.datasetVersion).toBe(XFRONTIER_DATASET_VERSION);
    expect(SNAPSHOT.serverVersion).toMatch(/^\d+\.\d+\.\d+(?:[-+].+)?$/);
    expect(SNAPSHOT.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(SNAPSHOT.source).toBe(
      'local xfrontier MCP resolve_ids over module-loaded FRONTIERS and SEED_STRUCTURES references',
    );
    expect(SNAPSHOT.references.map((reference) => reference.id)).toEqual(referencedIds());
    expect(new Set(SNAPSHOT.references.map((reference) => reference.id)).size).toBe(SNAPSHOT.references.length);
    expect(SNAPSHOT.tally).toEqual({ active: 682, withdrawn: 1, unknown: 0 });
  });

  it('stores hashes for active records and explicit retirement data for withdrawals', () => {
    const active = SNAPSHOT.references.filter((reference) => reference.status === 'active');
    const withdrawn = SNAPSHOT.references.filter((reference) => reference.status === 'withdrawn');
    expect(active).toHaveLength(SNAPSHOT.tally.active);
    expect(withdrawn).toHaveLength(SNAPSHOT.tally.withdrawn);
    expect(active.every((reference) => /^[0-9a-f]{8}$/.test(reference.contentHash))).toBe(true);
    expect(withdrawn).toEqual([{
      id: 1449,
      status: 'withdrawn',
      reason: 'too_mature_or_applied',
      note: 'perennial grain breeding (e.g. Kernza, PR23 rice) is already a deployed agroecology program, not a frontier direction',
    }]);
  });

  it('marks every local frontier that still cites a withdrawn record', () => {
    const withdrawn = new Map(
      SNAPSHOT.references
        .filter((reference) => reference.status === 'withdrawn')
        .map((reference) => [reference.id, reference]),
    );

    for (const frontier of FRONTIERS) {
      const retirement = withdrawn.get(frontier.atlasN);
      if (!retirement) {
        expect(frontier.atlasWithdrawal, frontier.slug).toBeUndefined();
        continue;
      }
      expect(frontier.atlasWithdrawal, frontier.slug).toMatchObject({
        status: 'withdrawn',
        datasetVersion: SNAPSHOT.datasetVersion,
        reason: retirement.reason,
      });
    }
  });
});

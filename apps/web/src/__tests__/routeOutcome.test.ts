import { describe, expect, it } from 'vitest';
import type { ModelRunReceipt } from '../models/types';
import type { CompletedPassage } from '../state/explorationSession';
import {
  projectConnectionResponseReceipt,
  projectReturnedMaterialReceipt,
  selectRouteOutcome,
  worldTrailFeatureEnabled,
} from '../state/routeOutcome';

const islands = [
  { slug: 'source', title: '源岛' },
  { slug: 'target', title: '目标岛' },
];

const passage: CompletedPassage = {
  structureId: 'struct://test/bridge',
  islandSlug: 'source',
  islandOp: 'op://source',
  targetIslandSlug: 'target',
  targetIslandOp: 'op://target',
  passageKind: 'charted',
  refHash: 'sha256:passage',
  structureTitle: '共享结构',
  correspondences: [{ quantity: '流量', inThisSubstrate: '营养流' }],
  prediction: '会出现稳定交换',
  completedAt: '2026-07-22T10:00:00.000Z',
};

const modelRun: ModelRunReceipt = {
  id: 'model-run-1',
  familyId: 'synchronization',
  substrateId: 'fireflies',
  seed: 17,
  parameters: { coupling: 1.6 },
  prediction: 'increase',
  observation: { metric: 'coherence', initial: 0.1, final: 0.7, steps: 360 },
  boundary: '只保留了相位耦合，没有表示环境变化。',
  language: 'zh',
  createdAt: '2026-07-22T10:02:00.000Z',
};

describe('selectRouteOutcome', () => {
  it('keeps a passage receipt as recorded research truth', () => {
    expect(selectRouteOutcome({ islands, completedPassages: [passage] })).toMatchObject({
      kind: 'passage', truth: 'research', status: 'recorded', sourceLabel: '源岛', targetLabel: '目标岛',
    });
  });

  it('keeps a model run personal and selects the newest receipt', () => {
    expect(selectRouteOutcome({ islands, completedPassages: [passage], modelRuns: [modelRun] })).toMatchObject({
      kind: 'model-run', truth: 'personal', id: 'model-run-1',
    });
  });

  it('does not promote a degraded response proposal to research truth', () => {
    expect(selectRouteOutcome({
      islands,
      modelRuns: [modelRun],
      recentResearchAction: {
        kind: 'connection-response', id: 'proposal-1', focusPathId: 'path-1', action: 'support', status: 'proposed',
        sourceLabel: '源岛', targetLabel: '目标岛', occurredAt: '2026-07-22T10:03:00.000Z',
      },
    })).toMatchObject({ kind: 'connection-response', truth: 'proposal', status: 'proposed' });
  });

  it('defaults the reversible feature flag on and accepts explicit off values', () => {
    expect(worldTrailFeatureEnabled(undefined)).toBe(true);
    expect(worldTrailFeatureEnabled('1')).toBe(true);
    expect(worldTrailFeatureEnabled('0')).toBe(false);
    expect(worldTrailFeatureEnabled('false')).toBe(false);
  });

  it('projects support, challenge, proposal, and return contracts without changing their truth', () => {
    const base = {
      id: 'sha256:response', focusPathId: 'path-1', sourceLabel: '源岛', targetLabel: '目标岛',
      occurredAt: '2026-07-22T10:04:00.000Z',
    };
    expect(projectConnectionResponseReceipt({ ...base, action: 'validate', degraded: false })).toMatchObject({ action: 'support', status: 'recorded' });
    expect(projectConnectionResponseReceipt({ ...base, action: 'refute', degraded: false })).toMatchObject({ action: 'challenge', status: 'recorded' });
    expect(projectConnectionResponseReceipt({ ...base, action: 'validate', degraded: true })).toMatchObject({ action: 'support', status: 'proposed' });
    expect(projectReturnedMaterialReceipt({ ...base, driftwoodRef: 'sha256:driftwood' })).toMatchObject({ kind: 'return-falsified', action: 'return', status: 'recorded' });
  });
});

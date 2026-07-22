import type { ModelRunReceipt } from '../models/types';
import type { CompletedPassage } from './explorationSession';
import type { WorldTrailIsland } from './worldTrail';

export type ResearchActionReceipt = {
  kind: 'connection-response' | 'return-falsified';
  id: string;
  focusPathId: string;
  action: 'support' | 'challenge' | 'return';
  status: 'recorded' | 'proposed';
  sourceLabel: string;
  targetLabel: string;
  occurredAt: string;
};

export type RouteOutcomeViewModel =
  | {
      kind: 'model-run';
      truth: 'personal';
      status: 'saved';
      id: string;
      occurredAt: string;
      receipt: ModelRunReceipt;
    }
  | {
      kind: 'passage';
      truth: 'research';
      status: 'recorded';
      id: string;
      occurredAt: string;
      sourceLabel: string;
      targetLabel: string;
      receipt: CompletedPassage;
    }
  | {
      kind: 'connection-response' | 'return-falsified';
      truth: 'research' | 'proposal';
      status: 'recorded' | 'proposed';
      id: string;
      occurredAt: string;
      action: ResearchActionReceipt['action'];
      sourceLabel: string;
      targetLabel: string;
    };

export interface SelectRouteOutcomeInput {
  islands: readonly WorldTrailIsland[];
  completedPassages?: readonly CompletedPassage[];
  modelRuns?: readonly ModelRunReceipt[];
  recentResearchAction?: ResearchActionReceipt | null;
}

export function projectConnectionResponseReceipt(input: {
  id: string;
  focusPathId: string;
  action: 'validate' | 'refute';
  degraded: boolean;
  sourceLabel: string;
  targetLabel: string;
  occurredAt: string;
}): ResearchActionReceipt {
  return {
    kind: 'connection-response',
    id: input.id,
    focusPathId: input.focusPathId,
    action: input.action === 'refute' ? 'challenge' : 'support',
    status: input.degraded ? 'proposed' : 'recorded',
    sourceLabel: input.sourceLabel,
    targetLabel: input.targetLabel,
    occurredAt: input.occurredAt,
  };
}

export function projectReturnedMaterialReceipt(input: {
  driftwoodRef: string;
  focusPathId: string;
  sourceLabel: string;
  targetLabel: string;
  occurredAt: string;
}): ResearchActionReceipt {
  return {
    kind: 'return-falsified',
    id: input.driftwoodRef,
    focusPathId: input.focusPathId,
    action: 'return',
    status: 'recorded',
    sourceLabel: input.sourceLabel,
    targetLabel: input.targetLabel,
    occurredAt: input.occurredAt,
  };
}

const timestamp = (value: string): number => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
};

const islandLabel = (islands: readonly WorldTrailIsland[], slug: string): string =>
  islands.find((island) => island.slug === slug)?.title ?? slug;

/**
 * Read-only adapter over the existing notebook and ledger write owners. The
 * newest successful outcome wins; no navigation or persistence is created.
 */
export function selectRouteOutcome(input: SelectRouteOutcomeInput): RouteOutcomeViewModel | null {
  const candidates: RouteOutcomeViewModel[] = [];

  for (const receipt of input.completedPassages ?? []) {
    candidates.push({
      kind: 'passage',
      truth: 'research',
      status: 'recorded',
      id: receipt.refHash,
      occurredAt: receipt.completedAt,
      sourceLabel: islandLabel(input.islands, receipt.islandSlug),
      targetLabel: islandLabel(input.islands, receipt.targetIslandSlug),
      receipt,
    });
  }

  for (const receipt of input.modelRuns ?? []) {
    candidates.push({
      kind: 'model-run',
      truth: 'personal',
      status: 'saved',
      id: receipt.id,
      occurredAt: receipt.createdAt,
      receipt,
    });
  }

  if (input.recentResearchAction) {
    const receipt = input.recentResearchAction;
    candidates.push({
      kind: receipt.kind,
      truth: receipt.status === 'proposed' ? 'proposal' : 'research',
      status: receipt.status,
      id: receipt.id,
      occurredAt: receipt.occurredAt,
      action: receipt.action,
      sourceLabel: receipt.sourceLabel,
      targetLabel: receipt.targetLabel,
    });
  }

  return candidates.reduce<RouteOutcomeViewModel | null>((latest, candidate) => (
    !latest || timestamp(candidate.occurredAt) >= timestamp(latest.occurredAt) ? candidate : latest
  ), null);
}

export function worldTrailFeatureEnabled(value: string | undefined): boolean {
  return value !== '0' && value !== 'false';
}

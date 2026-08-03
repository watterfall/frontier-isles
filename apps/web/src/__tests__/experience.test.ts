import { afterEach, describe, expect, it } from 'vitest';
import {
  EXPERIENCE_BUDGET_MS,
  beginExperience,
  completeExperience,
  readExperienceMetrics,
  resetExperienceMetricsForTests,
} from '../performance/experience';

afterEach(() => resetExperienceMetricsForTests());

describe('user-visible experience metrics', () => {
  it('publishes an L1 readiness measure with its executable budget and context', () => {
    beginExperience('l1-island-ready', { slug: 'compositional-modeling', source: 'atlas' });
    const metric = completeExperience('l1-island-ready');

    expect(metric).toMatchObject({
      name: 'l1-island-ready',
      measure: 'fi:l1-island-ready',
      budgetMs: EXPERIENCE_BUDGET_MS['l1-island-ready'],
      context: { slug: 'compositional-modeling', source: 'atlas' },
    });
    expect(metric?.durationMs).toBeGreaterThanOrEqual(0);
    expect(readExperienceMetrics()).toHaveLength(1);
  });

  it('finishes each start once and replaces an abandoned attempt', () => {
    beginExperience('l0-atlas-ready', { cause: 'initial' });
    beginExperience('l0-atlas-ready', { cause: 'return' });

    expect(completeExperience('l0-atlas-ready')?.context).toEqual({ cause: 'return' });
    expect(completeExperience('l0-atlas-ready')).toBeNull();
    expect(readExperienceMetrics()).toHaveLength(1);
  });
});

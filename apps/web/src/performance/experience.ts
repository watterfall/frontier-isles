export const EXPERIENCE_BUDGET_MS = {
  'l0-atlas-ready': 12_000,
  'l1-island-ready': 15_000,
} as const;

export type ExperienceName = keyof typeof EXPERIENCE_BUDGET_MS;

export interface ExperienceMetric {
  name: ExperienceName;
  measure: `fi:${ExperienceName}`;
  durationMs: number;
  budgetMs: number;
  withinBudget: boolean;
  startedAt: number;
  finishedAt: number;
  context: Readonly<Record<string, string>>;
}

interface PendingExperience {
  startMark: string;
  startedAt: number;
  context: Readonly<Record<string, string>>;
}

declare global {
  interface Window {
    /** Bounded local diagnostics for browser tests and field debugging. */
    __FI_EXPERIENCE_METRICS__?: readonly ExperienceMetric[];
  }
}

const pending = new Map<ExperienceName, PendingExperience>();
const recent: ExperienceMetric[] = [];
let sequence = 0;

function clock(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function clearPending(name: ExperienceName): void {
  const current = pending.get(name);
  if (!current) return;
  if (typeof performance !== 'undefined') performance.clearMarks(current.startMark);
  pending.delete(name);
}

/**
 * Starts one user-visible navigation interval. Re-starting the same interval
 * replaces a stale attempt, so aborted voyages cannot poison later readings.
 * `startTime` lets initial L0 include navigation/module startup (normally 0).
 */
export function beginExperience(
  name: ExperienceName,
  context: Readonly<Record<string, string>> = {},
  startTime?: number,
): void {
  clearPending(name);
  const startMark = `fi:${name}:start:${++sequence}`;
  const startedAt = startTime ?? clock();
  if (typeof performance !== 'undefined') {
    try {
      performance.mark(startMark, startTime == null ? undefined : { startTime });
    } catch {
      // Older engines may not support PerformanceMarkOptions. Their reading is
      // still useful from this point forward and never blocks navigation.
      performance.mark(startMark);
    }
  }
  pending.set(name, { startMark, startedAt, context: { ...context } });
}

/** Finishes a readiness gate and publishes the same measure to DevTools, a
 * bounded window registry, and a CustomEvent. No network telemetry is sent. */
export function completeExperience(name: ExperienceName): ExperienceMetric | null {
  const current = pending.get(name);
  if (!current) return null;

  const finishedAt = clock();
  const endMark = `fi:${name}:end:${sequence}`;
  const measure = `fi:${name}` as const;
  let durationMs = Math.max(0, finishedAt - current.startedAt);

  if (typeof performance !== 'undefined') {
    try {
      performance.mark(endMark);
      performance.measure(measure, current.startMark, endMark);
      const entries = performance.getEntriesByName(measure, 'measure');
      durationMs = entries.at(-1)?.duration ?? durationMs;
    } finally {
      performance.clearMarks(current.startMark);
      performance.clearMarks(endMark);
    }
  }

  pending.delete(name);
  const budgetMs = EXPERIENCE_BUDGET_MS[name];
  const metric: ExperienceMetric = {
    name,
    measure,
    durationMs,
    budgetMs,
    withinBudget: durationMs <= budgetMs,
    startedAt: current.startedAt,
    finishedAt,
    context: current.context,
  };
  recent.push(metric);
  if (recent.length > 50) recent.splice(0, recent.length - 50);

  if (typeof window !== 'undefined') {
    window.__FI_EXPERIENCE_METRICS__ = recent.map((entry) => ({ ...entry }));
    if (typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent<ExperienceMetric>('fi:experience', { detail: metric }));
    }
  }
  return metric;
}

export function readExperienceMetrics(): readonly ExperienceMetric[] {
  return recent.map((entry) => ({ ...entry }));
}

/** Test-only reset; production code never needs to erase diagnostic history. */
export function resetExperienceMetricsForTests(): void {
  for (const name of pending.keys()) clearPending(name);
  recent.length = 0;
  if (typeof performance !== 'undefined') {
    for (const name of Object.keys(EXPERIENCE_BUDGET_MS) as ExperienceName[]) {
      performance.clearMeasures(`fi:${name}`);
    }
  }
  if (typeof window !== 'undefined') delete window.__FI_EXPERIENCE_METRICS__;
}

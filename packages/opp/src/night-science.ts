/**
 * Night-science phase counts.
 *
 * Split out of `ledger.ts` so consumers that only need the reducer are not
 * forced to load that module's zod schemas. The reducer is pure arithmetic over
 * already-validated events — it never validates anything itself — so it has no
 * runtime dependency on zod, but living beside `LedgerEventSchema` gave it one
 * transitively. `apps/web` reaches this through `@frontier-isles/core`'s
 * projections and was paying ~130KB of schema builder for a three-key counter.
 *
 * `import type` below is erased at compile time, so this module has no runtime
 * imports at all. `ledger.ts` re-exports both symbols, so the protocol barrel's
 * public surface is unchanged.
 */
import type { LedgerEvent } from "./ledger";

export interface NightScienceCounts {
  A: number;
  B: number;
  D: number;
}

/**
 * Aggregate night-science phase counts from the ledger. This is the only
 * sanctioned way to produce the `.md` `night_science` block.
 */
export function reduceNightScience(events: readonly LedgerEvent[]): NightScienceCounts {
  const counts: NightScienceCounts = { A: 0, B: 0, D: 0 };
  for (const event of events) counts[event.phase] += 1;
  return counts;
}

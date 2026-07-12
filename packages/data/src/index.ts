import { FRONTIERS } from './frontiers';
import { INTERIORS } from './interiors';
import { INTERIORS_2 } from './interiors-2';

// Merge flagship interiors onto their frontier entries once, at module load, so
// every consumer of FRONTIERS (server seed, web fallback) sees `f.interior`
// without threading the slug→interior map through each call site. Keeping the
// bulky interior content in its own module keeps frontiers.ts lean.
// INTERIORS = the 12 original flagships; INTERIORS_2 = the batch-2 expansion
// (36 more, 9 per domain). Disjoint slug sets; INTERIORS_2 wins on any overlap.
const ALL_INTERIORS = { ...INTERIORS, ...INTERIORS_2 };
for (const f of FRONTIERS) {
  const interior = ALL_INTERIORS[f.slug];
  if (interior) f.interior = interior;
}

export * from './frontiers';
export * from './bridges';
export * from './sea';
export * from './regions';
export * from './structures';
export * from './interiors';
export * from './interiors-2';

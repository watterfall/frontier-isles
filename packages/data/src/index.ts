import { FRONTIERS } from './frontiers';
import { INTERIORS } from './interiors';

// Merge flagship interiors onto their frontier entries once, at module load, so
// every consumer of FRONTIERS (server seed, web fallback) sees `f.interior`
// without threading the slug→interior map through each call site. Keeping the
// bulky interior content in its own module keeps frontiers.ts lean.
for (const f of FRONTIERS) {
  const interior = INTERIORS[f.slug];
  if (interior) f.interior = interior;
}

export * from './frontiers';
export * from './bridges';
export * from './sea';
export * from './regions';
export * from './structures';
export * from './interiors';

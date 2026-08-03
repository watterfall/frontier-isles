import { readFile } from 'node:fs/promises';

const manifestUrl = new URL('../docs/release-manifest.json', import.meta.url);
const roadmapUrl = new URL('../docs/ROADMAP.md', import.meta.url);
const experienceUrl = new URL('../apps/web/src/performance/experience.ts', import.meta.url);
const shaPattern = /^[0-9a-f]{40}$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function assert(condition, message) {
  if (!condition) throw new Error(`release docs: ${message}`);
}

const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
const roadmap = await readFile(roadmapUrl, 'utf8');
const experienceSource = await readFile(experienceUrl, 'utf8');

assert(manifest.schemaVersion === 1, 'schemaVersion must be 1');
assert(isoDatePattern.test(manifest.statusAsOf), 'statusAsOf must be YYYY-MM-DD');
assert(shaPattern.test(manifest.main?.commit), 'main.commit must be a full Git SHA');
assert(shaPattern.test(manifest.production?.sourceCommit), 'production.sourceCommit must be a full Git SHA');
assert(typeof manifest.deploymentBoundary?.mainCommitIsDeployed === 'boolean', 'mainCommitIsDeployed must be boolean');
if (manifest.deploymentBoundary.mainCommitIsDeployed) {
  assert(manifest.main.commit === manifest.production.sourceCommit, 'deployed main and production source commits must match');
} else {
  assert(manifest.main.commit !== manifest.production.sourceCommit, 'undeployed main and production source commits must remain distinct');
}
assert(manifest.main?.ci?.conclusion === 'success', 'recorded main CI must be successful');
assert(
  ['test', 'typecheck', 'build', 'e2e'].every((gate) => manifest.main.ci.gates.includes(gate)),
  'CI gates must include test, typecheck, build, and e2e',
);
assert(new URL(manifest.main.ci.url).hostname === 'github.com', 'CI URL must point to GitHub');
assert(new URL(manifest.production.url).protocol === 'https:', 'production URL must use HTTPS');
assert(manifest.production.health === 'passing', 'recorded production health must be passing');
assert(manifest.production.counts.islands > 0, 'production island count must be positive');
assert(manifest.production.counts.mappings > 0, 'production mapping count must be positive');
assert(manifest.production.counts.frontierProjections > 0, 'frontier projection count must be positive');
assert(manifest.bundleBaseline.entryJs.rawKb <= manifest.bundleBaseline.entryJs.rawBudgetKib * 1.024, 'entry baseline exceeds its KiB budget');
assert(manifest.bundleBaseline.css.rawKb <= manifest.bundleBaseline.css.rawBudgetKib * 1.024, 'CSS baseline exceeds its KiB budget');

const runtimeTargets = [
  ['l0-atlas-ready', manifest.runtimeBudgetTargets?.l0AtlasReady],
  ['l1-island-ready', manifest.runtimeBudgetTargets?.l1IslandReady],
];
for (const [name, target] of runtimeTargets) {
  assert(target?.measure === `fi:${name}`, `${name} measure must match the browser Performance measure`);
  assert(Number.isFinite(target?.budgetMs) && target.budgetMs > 0, `${name} budget must be a positive number`);
  const escaped = name.replaceAll('-', '\\-');
  const sourceBudget = experienceSource.match(new RegExp(`'${escaped}':\\s*([\\d_]+)`))?.[1];
  assert(sourceBudget, `${name} must exist in experience.ts`);
  assert(Number(sourceBudget.replaceAll('_', '')) === target.budgetMs, `${name} manifest and executable budgets must match`);
}

const ageDays = (Date.now() - Date.parse(`${manifest.statusAsOf}T00:00:00Z`)) / 86_400_000;
assert(ageDays >= -1 && ageDays <= 45, 'status snapshot is stale; refresh release evidence before merging');
assert(roadmap.includes('docs/release-manifest.json'), 'ROADMAP must link the machine-readable manifest');
assert(roadmap.includes(manifest.main.commit), 'ROADMAP must name the verified main commit');
assert(roadmap.includes(manifest.production.sourceCommit), 'ROADMAP must name the deployed source commit');
const deploymentPhrase = manifest.deploymentBoundary.mainCommitIsDeployed ? '当前 main 已部署' : 'main 尚未部署';
assert(roadmap.includes(deploymentPhrase), `ROADMAP must state the current deployment boundary: ${deploymentPhrase}`);

console.log(`release docs verified: ${manifest.statusAsOf} · main ${manifest.main.commit.slice(0, 8)} · production ${manifest.production.sourceCommit.slice(0, 8)}`);

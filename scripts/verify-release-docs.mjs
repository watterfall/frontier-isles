import { readFile } from 'node:fs/promises';

const manifestUrl = new URL('../docs/release-manifest.json', import.meta.url);
const roadmapUrl = new URL('../docs/ROADMAP.md', import.meta.url);
const experienceUrl = new URL('../apps/web/src/performance/experience.ts', import.meta.url);
const viteConfigUrl = new URL('../apps/web/vite.config.ts', import.meta.url);
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

// The assertions above compare the manifest against itself, which passes just
// as happily when the recorded measurement is months out of date and the real
// build gate has since moved. Tie both numbers to the constants the build
// actually enforces, the same way the runtime budgets below are tied to
// experience.ts — a budget raised in one place must be re-measured in the other.
const viteConfig = await readFile(viteConfigUrl, 'utf8');
const enforcedBudgets = [
  ['entryJs', 'ENTRY_JS_MAX_BYTES'],
  ['css', 'CSS_MAX_BYTES'],
];
for (const [key, constant] of enforcedBudgets) {
  const kib = viteConfig.match(new RegExp(`${constant}\\s*=\\s*([\\d_]+)\\s*\\*\\s*1024`))?.[1];
  assert(kib, `${constant} must exist in apps/web/vite.config.ts as "<KiB> * 1024"`);
  assert(
    Number(kib.replaceAll('_', '')) === manifest.bundleBaseline[key].rawBudgetKib,
    `${key} budget disagrees: vite.config.ts enforces ${kib}KiB, manifest records ${manifest.bundleBaseline[key].rawBudgetKib}KiB`,
  );
}

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

// Snapshot freshness is a RELEASE question, not a type question. This script
// runs inside `pnpm typecheck` (and therefore inside CI on every branch), so a
// wall-clock assert here would fail every unrelated PR — and every `git bisect`
// checkout of an older commit — the day the window elapsed. Structural checks
// above are deterministic and stay unconditional; the age window is opt-in and
// belongs to whoever is actually cutting a release.
const FRESHNESS_MAX_DAYS = 45;
const ageDays = (Date.now() - Date.parse(`${manifest.statusAsOf}T00:00:00Z`)) / 86_400_000;
if (process.env.FI_RELEASE_FRESHNESS === '1') {
  assert(
    ageDays >= -1 && ageDays <= FRESHNESS_MAX_DAYS,
    `status snapshot is ${ageDays.toFixed(0)} days old (limit ${FRESHNESS_MAX_DAYS}); refresh release evidence before shipping`,
  );
} else if (ageDays > FRESHNESS_MAX_DAYS) {
  console.warn(
    `release docs: status snapshot is ${ageDays.toFixed(0)} days old (limit ${FRESHNESS_MAX_DAYS}). ` +
      'Refresh docs/release-manifest.json before the next deploy; run with FI_RELEASE_FRESHNESS=1 to make this fatal.',
  );
}
assert(roadmap.includes('docs/release-manifest.json'), 'ROADMAP must link the machine-readable manifest');
assert(roadmap.includes(manifest.main.commit), 'ROADMAP must name the verified main commit');
assert(roadmap.includes(manifest.production.sourceCommit), 'ROADMAP must name the deployed source commit');
const deploymentPhrase = manifest.deploymentBoundary.mainCommitIsDeployed ? '当前 main 已部署' : 'main 尚未部署';
assert(roadmap.includes(deploymentPhrase), `ROADMAP must state the current deployment boundary: ${deploymentPhrase}`);

// ── ROADMAP internal consistency ────────────────────────────────────────────
// The four assertions above are `roadmap.includes(...)`. They prove the right
// string appears SOMEWHERE in the document, which is a presence test and cannot
// see a contradiction elsewhere in the same file. On 2026-08-31 that gap ran
// live: the checkpoint table was correct and this gate was green while three
// other passages still said production was behind — §3 debt item 7 named Fly
// release v2, and the Slice 26 and Slice 27 log entries both ended "production
// still serves the 2026-08-04 release". Presence is not consistency.
//
// What follows are absence assertions, which validate-observations.test.mjs
// argues at length are usually weak: an absence assertion is only as good as
// the guess about how the defect will be phrased. These are not guesses. The
// deployment boundary has exactly two possible phrasings and this script
// constructs both; release numbers come from the manifest and every stated
// occurrence is checked rather than one hoped-for wording. The check fails on
// wordings nobody anticipated, which is the property the forbidden-phrase style
// lacks.
//
// The document is split at the session log because §6 is a LOG. Its entries
// were true when written and have to stay readable as evidence, so a claim
// there that time has overtaken is marked superseded rather than rewritten —
// a session log that edits itself stops being evidence. Above that line the
// document speaks in the present, and the present has to agree with itself.
const LOG_HEADING = '## 6 · Session log';
const logStart = roadmap.indexOf(LOG_HEADING);
assert(logStart !== -1, `ROADMAP must contain "${LOG_HEADING}"; the live/historical split depends on that heading`);
const liveRegion = roadmap.slice(0, logStart);
const logRegion = roadmap.slice(logStart);

// A mention that is deliberately historical says so on its own line. Keeping the
// marker list here, rather than exempting specific line numbers, means a future
// correction row passes for the reason it is correct instead of by position.
const CORRECTION_MARKER = /corrects|superseded|previous checkpoint|no longer|used to|had (?:since )?been/i;

const staleDeploymentPhrase = manifest.deploymentBoundary.mainCommitIsDeployed ? 'main 尚未部署' : '当前 main 已部署';
for (const [i, line] of liveRegion.split('\n').entries()) {
  if (!line.includes(staleDeploymentPhrase) || CORRECTION_MARKER.test(line)) continue;
  assert(
    false,
    `ROADMAP line ${i + 1} states "${staleDeploymentPhrase}" while the manifest says "${deploymentPhrase}". ` +
      'If the mention is deliberately historical, say so on the same line (e.g. "the previous checkpoint", "superseded").',
  );
}

const releaseVersion = manifest.production?.releaseVersion;
assert(Number.isInteger(releaseVersion) && releaseVersion > 0, 'production.releaseVersion must be a positive integer');
assert(
  new RegExp(`release\\s+\\*{0,2}v${releaseVersion}\\b`, 'i').test(liveRegion),
  `ROADMAP must name the deployed release (v${releaseVersion}) above the session log`,
);
for (const [i, line] of liveRegion.split('\n').entries()) {
  for (const match of line.matchAll(/release\s+\*{0,2}v(\d+)/gi)) {
    const stated = Number(match[1]);
    assert(
      stated === releaseVersion || CORRECTION_MARKER.test(line),
      `ROADMAP line ${i + 1} names release v${stated} above the session log while production is on v${releaseVersion}. ` +
        'If the mention is deliberately historical, say so on the same line (e.g. "corrects", "previous checkpoint").',
    );
  }
}

// A log entry may record what production served at the time it was written.
// What it may not do is leave that in the present tense once it is false: the
// Slice 26 and 27 entries read "production still serves …" for a month after
// the deploy that ended it.
//
// Known limitation, left deliberately: this matches a QUOTED claim as readily
// as an asserted one, and it caught the Slice 29 entry that was describing the
// fix. Widening the match to exempt quotations would let a real stale claim
// through by wrapping it in quotes, and tuning the marker list until the
// author's own prose passes is how a gate stops meaning anything. The remedy
// is the one a good entry wants anyway: name the supersession.
for (const [i, line] of logRegion.split('\n').entries()) {
  if (!/still serve[sd]/i.test(line) || /superseded/i.test(line)) continue;
  assert(
    false,
    `ROADMAP session-log line ${i + 1} (of §6) says what production "still serves". ` +
      'A log entry keeps its original claim, but must mark it — e.g. "superseded by Slice N (deployed YYYY-MM-DD)".',
  );
}

console.log(`release docs verified: ${manifest.statusAsOf} · main ${manifest.main.commit.slice(0, 8)} · production ${manifest.production.sourceCommit.slice(0, 8)}`);

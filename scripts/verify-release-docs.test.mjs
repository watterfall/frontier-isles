import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Coverage for the release-docs gate's ROADMAP-consistency branches.
 *
 * These exist because the gate was green through the exact failure it is
 * supposed to prevent. On 2026-08-31 `f685647` deployed main and corrected the
 * checkpoint table, and this script passed — while three other passages in the
 * same file still said production was behind: §3 debt item 7 named Fly release
 * v2, and the Slice 26 and Slice 27 log entries both ended "production still
 * serves the 2026-08-04 release". The gate could not see any of them, because
 * its ROADMAP assertions are `roadmap.includes(...)`: presence tests that ask
 * whether the right string appears somewhere and say nothing about contrary
 * strings elsewhere.
 *
 * So the cases below are written the way that failure actually looked. Each
 * mutation leaves the ORIGINAL four assertions satisfiable — the correct commit
 * SHA and the correct boundary phrase are still in the document — and asserts
 * the gate fails anyway. That is the whole point: a test that merely broke the
 * document would go red under the old gate too, and would prove nothing about
 * the new checks. `oldGateStillSatisfied` below pins that property explicitly
 * rather than trusting the mutation to be subtle.
 *
 * Each case was checked by mutation in the other direction as well: commenting
 * out the branch it covers turns it red.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
/**
 * Read from the manifest rather than written down here. An earlier draft pinned
 * "v6" into three assertions and went red the moment the next deploy landed —
 * a test that has to be edited on every release is a test that will be edited
 * carelessly, and this suite exists precisely because a hand-maintained release
 * number rots.
 */
const RELEASE = JSON.parse(readFileSync(join(ROOT, 'docs/release-manifest.json'), 'utf8')).production.releaseVersion;
/** Any release the manifest is not on, phrased as an older one. */
const STALE_RELEASE = RELEASE > 1 ? 1 : 2;
const COPIES = [
  'scripts/verify-release-docs.mjs',
  'docs/release-manifest.json',
  'docs/ROADMAP.md',
  'apps/web/src/performance/experience.ts',
  'apps/web/vite.config.ts',
];

/**
 * Build a throwaway checkout holding only what the gate reads, apply `edit` to
 * the ROADMAP and/or manifest, and run the gate against it.
 *
 * The gate resolves its inputs from `import.meta.url`, not from cwd, so the
 * copy has to preserve the directory shape rather than just the files.
 */
function runWith({ roadmap = (s) => s, manifest = (s) => s } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'fi-release-docs-'));
  try {
    for (const rel of COPIES) {
      mkdirSync(join(dir, dirname(rel)), { recursive: true });
      copyFileSync(join(ROOT, rel), join(dir, rel));
    }
    const roadmapPath = join(dir, 'docs/ROADMAP.md');
    const manifestPath = join(dir, 'docs/release-manifest.json');
    const nextRoadmap = roadmap(readFileSync(roadmapPath, 'utf8'));
    writeFileSync(roadmapPath, nextRoadmap);
    writeFileSync(manifestPath, manifest(readFileSync(manifestPath, 'utf8')));

    const r = spawnSync(process.execPath, [join(dir, 'scripts/verify-release-docs.mjs')], { encoding: 'utf8' });
    const parsed = JSON.parse(readFileSync(manifestPath, 'utf8'));
    return {
      code: r.status,
      out: (r.stdout ?? '') + (r.stderr ?? ''),
      // Would the pre-2026-08-31 gate have been happy with this document? If
      // yes, only the new assertions can be what failed.
      oldGateStillSatisfied:
        nextRoadmap.includes('docs/release-manifest.json') &&
        nextRoadmap.includes(parsed.main.commit) &&
        nextRoadmap.includes(parsed.production.sourceCommit) &&
        nextRoadmap.includes(parsed.deploymentBoundary.mainCommitIsDeployed ? '当前 main 已部署' : 'main 尚未部署'),
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const LOG_HEADING = '## 6 · Session log';
/** Insert `text` as its own line just above the session log, i.e. in the live region. */
const intoLiveRegion = (text) => (s) => s.replace(LOG_HEADING, `${text}\n\n${LOG_HEADING}`);
/** Append `text` as a session-log entry. */
const intoSessionLog = (text) => (s) => `${s}\n${text}\n`;

describe('release docs gate — normal run', () => {
  test('passes on this checkout', () => {
    const { code, out } = runWith();
    assert.equal(code, 0, out);
    assert.match(out, /release docs verified: \d{4}-\d{2}-\d{2} · main [0-9a-f]{8} · production [0-9a-f]{8}/);
  });
});

describe('release docs gate — a stale release number in the live region', () => {
  // The §3 debt-item-7 defect, verbatim in shape: production was on v6 and the
  // document went on naming v2 in the present tense.
  test('fails when a live passage names a release the manifest has moved past', () => {
    const { code, out, oldGateStillSatisfied } = runWith({
      roadmap: intoLiveRegion(`7. **Production is live but release parity is open:** Fly release v${STALE_RELEASE} is healthy.`),
    });
    assert.ok(oldGateStillSatisfied, 'mutation must leave the original includes() assertions satisfied');
    assert.equal(code, 1, out);
    assert.match(out, new RegExp(`names release v${STALE_RELEASE} above the session log while production is on v${RELEASE}`));
  });

  test('allows the same number when the line marks itself historical', () => {
    // The checkpoint's own "What this checkpoint corrects" row names v4 and v5
    // on purpose. Losing that would make the gate punish the honesty that
    // f685647 added.
    const { code, out } = runWith({
      roadmap: intoLiveRegion('| **Corrects** | The previous checkpoint named Fly release v4 while it was false. |'),
    });
    assert.equal(code, 0, out);
  });

  test('fails when the deployed release is never named at all', () => {
    const { code, out } = runWith({
      roadmap: (s) => s.replaceAll(new RegExp(`release\\s+\\*{0,2}v${RELEASE}\\b`, 'gi'), 'the current release'),
    });
    assert.equal(code, 1, out);
    assert.match(out, new RegExp(`must name the deployed release \\(v${RELEASE}\\)`));
  });
});

describe('release docs gate — a contradicted deployment boundary', () => {
  test('fails when a live passage states the opposite boundary', () => {
    const { code, out, oldGateStillSatisfied } = runWith({
      roadmap: intoLiveRegion('Deployment boundary: main 尚未部署。'),
    });
    assert.ok(oldGateStillSatisfied, 'the correct phrase is still present, so only the new check can fail');
    assert.equal(code, 1, out);
    assert.match(out, /states "main 尚未部署" while the manifest says "当前 main 已部署"/);
  });

  test('allows the opposite phrase when the line marks itself historical', () => {
    const { code, out } = runWith({
      roadmap: intoLiveRegion('The previous checkpoint said main 尚未部署, which is no longer the case.'),
    });
    assert.equal(code, 0, out);
  });
});

describe('release docs gate — an unmarked past claim in the session log', () => {
  // The Slice 26/27 defect: a log entry left "production still serves …" in the
  // present tense after the deploy that ended it.
  test('fails on an unmarked "still serves" claim', () => {
    const { code, out, oldGateStillSatisfied } = runWith({
      roadmap: intoSessionLog('- **Slice 99** — Not deployed: production still serves the 2026-08-04 release.'),
    });
    assert.ok(oldGateStillSatisfied, 'the mutation only adds a log line; the old assertions are untouched');
    assert.equal(code, 1, out);
    assert.match(out, /says what production "still serves"/);
  });

  test('passes once the entry marks itself superseded', () => {
    const { code, out } = runWith({
      roadmap: intoSessionLog(
        '- **Slice 99** — production still served the 2026-08-04 release — **superseded by Slice 100**.',
      ),
    });
    assert.equal(code, 0, out);
  });

  test('does not fire on a log entry that only reports its own slice as undeployed', () => {
    // Slice 24 legitimately ends "Not CI-verified and not deployed." A claim
    // bounded to the slice writing it stays true forever; only a claim about
    // what production currently serves goes stale.
    const { code, out } = runWith({
      roadmap: intoSessionLog('- **Slice 99** — gates run locally. Not CI-verified and not deployed.'),
    });
    assert.equal(code, 0, out);
  });
});

describe('release docs gate — the split itself', () => {
  test('fails when the session-log heading it splits on is missing', () => {
    // Without the heading every log entry would be read as a live claim, so the
    // gate must refuse rather than silently treat the whole file as historical.
    const { code, out } = runWith({ roadmap: (s) => s.replace(LOG_HEADING, '## 6 · History') });
    assert.equal(code, 1, out);
    assert.match(out, /must contain "## 6 · Session log"/);
  });

  test('fails when releaseVersion is missing from the manifest', () => {
    const { code, out } = runWith({
      manifest: (s) => {
        const m = JSON.parse(s);
        delete m.production.releaseVersion;
        return JSON.stringify(m, null, 2);
      },
    });
    assert.equal(code, 1, out);
    assert.match(out, /releaseVersion must be a positive integer/);
  });
});

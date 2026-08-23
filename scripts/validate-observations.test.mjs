import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Coverage for the ledger gate's failure branches.
 *
 * These branches were fixed once already, verified by running them by hand and
 * reading exit codes off a terminal — which protects nothing. A mutation run
 * made that concrete: with no suite here, breaking any of the four fixes turned
 * zero tests red, and the harness could not even report "not caught", only
 * "unreadable". A fix whose only evidence is a transcript is a fix that the
 * next edit silently removes.
 *
 * Each case below was checked by mutation: reverting the fix it covers turns it
 * red. Assertions match the VIOLATION text rather than a loose keyword, because
 * this script's own explanatory output mentions the same field names, and a
 * pattern that matches the explanation would report a passing run as a failing
 * one — and, worse, would keep matching if the real violation were reworded.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = join(ROOT, 'scripts/validate-observations.mjs');
const STUB = join(ROOT, 'scripts/__fixtures__/failing-git.mjs');
const REAL_GIT = execFileSync('sh', ['-c', 'command -v git'], { encoding: 'utf8' }).trim();

/** Run the gate and return everything a caller could branch on. */
function run({ cwd = ROOT, fail = null } = {}) {
  const env = { ...process.env, FI_REAL_GIT: REAL_GIT };
  if (fail) {
    env.FI_GIT_BIN = STUB;
    env.FI_STUB_FAIL = fail;
  }
  const r = spawnSync(process.execPath, [SCRIPT], { cwd, env, encoding: 'utf8' });
  return { code: r.status, out: (r.stdout ?? '') + (r.stderr ?? '') };
}

/** The violation the gate prints for a missing `filed_by`, verbatim. */
const FILED_BY_VIOLATION = 'missing `filed_by`';

/**
 * The verdict for a failing `git log`, pinned verbatim — deliberately a POSITIVE
 * assertion about wording.
 *
 * The obvious way to check "it must not name a cause" is to forbid the phrase:
 * `doesNotMatch(/not a git repository/i)`. That is unfalsifiable here. The gate
 * has never printed those words — they appear only in a source comment and in
 * the assertion itself — so the check cannot fail, and a regression that names a
 * cause in any OTHER words ("git is not available here") passes it untouched.
 * An absence assertion is only as good as the guess about how the defect will
 * be phrased, and a defect does not have to cooperate.
 *
 * Pinning the whole sentence inverts that: every rewording turns this red,
 * including the ones a forbidden-phrase list would never have anticipated. The
 * cost is that an intentional improvement to the wording also turns it red —
 * correct, because the wording IS the contract in this branch.
 */
const LOG_FAILED_VERDICT = 'NOT CHECKED — `git log` failed here, cause unknown';

describe('ledger gate — normal run', () => {
  test('passes in this checkout, with real git', () => {
    const { code, out } = run();
    assert.equal(code, 0, out);
    assert.match(out, /✓ every entry satisfies/);
    // The history walk must report a real comparison count, not merely "ok".
    assert.match(out, /history ok \(\d+ commit\(s\) touched it, [1-9]\d* version pair\(s\) compared/);
  });
});

describe('ledger gate — git fails', () => {
  test('a failing `git log` fails the gate instead of quietly skipping it', () => {
    // The defect this covers: the whole history walk was skipped and the gate
    // exited 0. The strongest half of the check was optional and said nothing.
    const { code, out } = run({ fail: 'log' });
    assert.equal(code, 1, out);
    // Pinned rather than forbidden — see LOG_FAILED_VERDICT for why a
    // `doesNotMatch` on the cause-naming phrase cannot fail here.
    assert.ok(out.includes(LOG_FAILED_VERDICT),
      `the verdict must stay exactly "${LOG_FAILED_VERDICT}" — naming a cause asserts a reading this branch has not established:\n${out}`);
  });

  test('a failing `git show` does not get reported as "no committed version yet"', () => {
    // That sentence asserts the one benign reading — the file genuinely absent
    // from HEAD — while an unreadable baseline is equally consistent with what
    // was observed.
    const { code, out } = run({ fail: 'show' });
    assert.equal(code, 1, out);
    assert.doesNotMatch(out, /no committed version yet/);
    assert.match(out, /SKIPPED/);
  });

  test('a walk that compares nothing is NOT ESTABLISHED, not ok', () => {
    // With every `show` failing, `log` still lists the commits, so the walk
    // runs and skips every version. Reporting that as ok is the exact
    // substitution this check exists to prevent: "not compared" read as
    // "unchanged".
    const { out } = run({ fail: 'show' });
    assert.match(out, /NOT ESTABLISHED/);
    assert.doesNotMatch(out, /history ok/);
  });

  test('an unusable git is not reported as broken ledger data', () => {
    // The cascade: an unreadable baseline makes every entry look newer than the
    // committed prefix, so a broken tool surfaced as eight `filed_by` contract
    // violations. The gate must still fail — but for the tool, not the data.
    const { code, out } = run({ fail: 'all' });
    assert.equal(code, 1, out);
    assert.ok(!out.includes(FILED_BY_VIOLATION),
      `an unusable git must not be reported as a ledger violation:\n${out}`);
  });
});

describe('ledger gate — outside a checkout', () => {
  test('passes, because there is no history to read rather than an unread one', () => {
    // A release tarball or vendored copy has no `.git` and never had history.
    // Failing there would report a missing feature as a contract violation;
    // the same skip inside a checkout is an error (covered above). Real git is
    // used here on purpose — outside a repository it fails on its own, so this
    // case rests on the actual environment rather than on a stub reproducing it.
    const dir = mkdtempSync(join(tmpdir(), 'fi-ledger-'));
    try {
      mkdirSync(join(dir, 'scripts'));
      mkdirSync(join(dir, 'ledger'));
      copyFileSync(SCRIPT, join(dir, 'scripts/validate-observations.mjs'));
      copyFileSync(join(ROOT, 'ledger/observations.jsonl'), join(dir, 'ledger/observations.jsonl'));
      const r = spawnSync(process.execPath, ['scripts/validate-observations.mjs'],
        { cwd: dir, env: process.env, encoding: 'utf8' });
      const out = (r.stdout ?? '') + (r.stderr ?? '');
      assert.equal(r.status, 0, out);
      assert.match(out, /DOES NOT APPLY/);
      // Passing is only honest while the skip is legible. A silent pass here
      // would be indistinguishable from a history walk that actually ran.
      assert.doesNotMatch(out, /history ok/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

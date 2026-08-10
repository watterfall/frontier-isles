import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Guards the property every other conclusion in this repository rests on:
 * a green suite means every assertion ran.
 *
 * That is currently true and is not enforced by anything. One committed
 * `it.only` silently reduces the run to a single case and still reports green,
 * and every mutation result read as "nothing turned red, so this property is
 * uncovered" would then be measuring a suite that barely ran. The corpus
 * session reached a wrong conclusion from the same family of mistake at a
 * smaller scale — a guard assertion threw, the assertions after it never
 * executed, and "did not error" was read as "passed". Inside one test that is
 * assertion order; across the suite it is `.only`.
 *
 * `.only` is gated because it is always accidental — nobody means to ship it.
 * `.skip` and `.todo` are reported, not gated: a deliberately pending test is
 * legitimate, and the failure mode there is invisibility, which a printed count
 * fixes. Silence about them would be the same substitution this file exists to
 * prevent.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.claude', 'coverage', 'build']);
const TEST_FILE = /\.test\.(ts|tsx|mjs|js)$/;

/** Deliberately `continue`, never `return` — a `return` here exits the walk for
 *  the whole directory, and a sweep that quietly covers part of the tree while
 *  reporting a clean result is the exact defect this file guards against. */
function collect(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { collect(p, out); continue; }
    if (TEST_FILE.test(name)) out.push(p);
  }
  return out;
}

const files = collect(ROOT);
const read = files.map((f) => ({ path: relative(ROOT, f), text: readFileSync(f, 'utf8') }));

const hits = (re) => read
  .flatMap(({ path, text }) => [...text.matchAll(re)]
    .map((m) => `${path}:${text.slice(0, m.index).split('\n').length}  ${m[0]}`));

/**
 * Matches a `.only` that is CALLED, not one that is mentioned.
 *
 * The first version matched the bare word and immediately flagged this file's
 * own prose — the sentence above explaining the hazard. Rewording the comment
 * would have hidden that rather than fixed it: the pattern would still flag the
 * next person who writes the word, and the pressure would be to loosen the
 * check. Requiring the call form is the real discriminator, because `.only`
 * does nothing until it is invoked.
 */
const ONLY_CALL = /\b(?:it|test|describe|suite)\.only\s*\(/g;

// Built by concatenation so this fixture is not itself a hit — the same reason
// the pattern above exists. A literal here would make the file flag itself and
// the check would have to exempt its own path, which is how a gate rots.
const POSITIVE_CONTROL = `${'it'}.only('a real one', () => {})`;
const NEGATIVE_CONTROL = 'a committed `it.only` marker, mentioned in prose';

describe('test-suite integrity', () => {
  test('the scan reaches the whole tree', () => {
    // The coverage count IS the check. Without it a truncated walk reports
    // "no `.only` found" over a fraction of the repository, which reads
    // identically to a clean result.
    assert.ok(files.length >= 100,
      `only ${files.length} test file(s) found — the walk is truncated, so every result below is over a fraction of the tree`);
  });

  test('the `.only` matcher still recognises one, and still ignores a mention', () => {
    // A known-positive control for the instrument itself. Loosen or tighten the
    // pattern and this fails before the scan below can report a clean tree for
    // the wrong reason — a matcher that finds nothing looks exactly like a repo
    // that contains nothing.
    assert.equal([...POSITIVE_CONTROL.matchAll(ONLY_CALL)].length, 1, 'must catch a real `.only` call');
    assert.equal([...NEGATIVE_CONTROL.matchAll(ONLY_CALL)].length, 0, 'must not catch a prose mention');
  });

  test('no committed `.only` — it would shrink the run and still report green', () => {
    const only = hits(ONLY_CALL);
    assert.deepEqual(only, [],
      `\`.only\` reduces the suite to these and passes:\n${only.join('\n')}`);
  });

  test('skipped and pending cases are counted out loud, not gated', () => {
    const skipped = hits(/\b(it|test|describe)\.(skip|todo)\b|\bxit\(|\bxdescribe\(/g);
    // Printed for a reader; deliberately not an assertion on the count, which
    // would turn a legitimate pending test into a broken build.
    console.log(`    ${skipped.length} skipped/pending case(s) across ${files.length} test file(s)` +
      (skipped.length ? `:\n      ${skipped.join('\n      ')}` : ''));
    assert.ok(Array.isArray(skipped));
  });
});

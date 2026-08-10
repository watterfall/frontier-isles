#!/usr/bin/env node
/**
 * A git that fails one chosen subcommand and forwards the rest to the real one.
 *
 * Point `FI_GIT_BIN` at this to RUN the validator's git-failure branches
 * instead of asserting them. Those branches are reachable no other way: this
 * file's history contains no commit that fails to produce a blob, so the code
 * that handles one could only ever be read, and reading it missed four defects
 * that running it found in a single pass.
 *
 * What it establishes and what it does not: it shows how the validator reacts
 * to a failing git, NOT that git fails these ways. A branch whose correctness
 * depends on git's actual output — a rename reported as `R100 old new`, say —
 * still has to be checked against real git, where a stub would only re-assert
 * the format the code already assumes.
 *
 *   FI_STUB_FAIL = show | log | ls-tree | all
 */
import { execFileSync } from 'node:child_process';

const fail = process.env.FI_STUB_FAIL ?? '';
const args = process.argv.slice(2);
const sub = args[0];

if (fail === 'all' || sub === fail) {
  process.stderr.write(`stub: refusing '${sub}'\n`);
  process.exit(128);
}
try {
  process.stdout.write(execFileSync(process.env.FI_REAL_GIT ?? 'git', args, { encoding: 'utf8' }));
} catch (e) {
  process.exit(e.status ?? 1);
}

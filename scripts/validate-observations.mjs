/**
 * Contract gate for `ledger/observations.jsonl`.
 *
 * The contract is `docs/observation-ledger-v1-2026-08-09.md`. This script is the
 * machine-readable half of it: a field rule that only lives in prose is a rule
 * that erodes the first time someone is in a hurry.
 *
 * Run:  node scripts/validate-observations.mjs
 * Exits non-zero on any contract violation. Runs inside `pnpm typecheck`.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const FILE = 'ledger/observations.jsonl';
const SCALES = new Set(['record', 'field', 'population']);
const BY_TYPES = new Set(['human', 'model', 'derived']);
/** At least one must be present. All three are independently checkable by a
 *  reader — which is the point: staleness must not depend on either side
 *  honestly reporting a version number. */
const ASSERTED_KEYS = ['dataset_version', 'content_hash', 'repo_commit'];

const fail = [];
const bad = (line, msg) => fail.push(`${FILE}:${line} — ${msg}`);

if (!existsSync(FILE)) {
  console.error(`${FILE} does not exist`);
  process.exit(1);
}
const raw = readFileSync(FILE, 'utf8');
const lines = raw.split('\n');
if (raw.length && !raw.endsWith('\n')) fail.push(`${FILE} — must end with a newline (append-only files are appended to)`);

/**
 * Lines already committed. Read up front because two rules need it: the
 * append-only check below, and grandfathering — a field added to the contract
 * after an entry was written cannot be required of that entry, since the file
 * is append-only and the entry may not be edited to add it. Enforcing the rule
 * from the committed prefix onward grandfathers exactly the entries that
 * predate it and no others, with no version stamp to keep in sync.
 */
/**
 * Overridable so the failure branches below can be RUN rather than asserted.
 * Point it at a stub that fails a chosen subcommand; see the note on the
 * history walk for what that does and does not establish.
 */
const GIT = process.env.FI_GIT_BIN ?? 'git';
const git = (args) => execFileSync(GIT, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

/**
 * Whether git itself is usable here. Needed to keep two different situations
 * apart that a bare `catch` collapses: a file genuinely absent from HEAD (the
 * first commit — nothing to grandfather, nothing wrong) and git being
 * unavailable (the check did not run at all). Collapsing them means printing
 * "no committed version yet", which asserts the first while the second is
 * equally consistent with what was observed.
 *
 * `rev-parse` is not enough on its own: it answers "is there a repository",
 * while the question here is "does HEAD contain this path". `ls-tree` answers
 * exactly that — empty output means genuinely absent, a failure means git could
 * not tell us, and those must not print the same sentence.
 */
let pathInHead = null; // true | false | null when git could not say
try {
  pathInHead = git(['ls-tree', '--name-only', 'HEAD', '--', FILE]).trim().length > 0;
} catch {
  pathInHead = null;
}

let committedLines = [];
/** Set when the comparison could not be made, as opposed to finding nothing. */
let baselineSkipped = null;
try {
  committedLines = git(['show', `HEAD:${FILE}`]).split('\n').filter((l) => l.trim());
} catch {
  // `show` failed. Only one reading of that is benign — the path really is not
  // in HEAD yet. Anything else means the baseline could not be read, and saying
  // "no committed version yet" would assert the benign one on no evidence.
  if (pathInHead !== false) {
    baselineSkipped = pathInHead === null
      ? 'git could not report whether HEAD contains this file'
      : 'HEAD contains this file but its contents could not be read';
  }
}

const entries = [];
lines.forEach((text, i) => {
  const n = i + 1;
  if (!text.trim()) {
    if (i !== lines.length - 1) bad(n, 'blank line — one entry per line, no separators');
    return;
  }
  let e;
  try {
    e = JSON.parse(text);
  } catch (err) {
    bad(n, `not valid JSON (${err.message})`);
    return;
  }
  entries.push({ n, e });

  // ── required shape ────────────────────────────────────────────────────────
  for (const key of ['id', 'about', 'kind', 'asserted', 'statement', 'evidence', 'by', 'by_type']) {
    if (e[key] === undefined) bad(n, `missing \`${key}\``);
  }
  // `signature` is checked for KEY PRESENCE, not truthiness. A missing key is a
  // contract violation; an explicit null means "unsigned, and we said so" —
  // that distinction is the whole of criterion C3 until signing exists.
  if (!Object.hasOwn(e, 'signature')) {
    bad(n, 'missing `signature` — an unsigned entry must say so explicitly (`"signature": null`), never by omission');
  }
  if (!Object.hasOwn(e, 'observed_at')) bad(n, 'missing `observed_at`');

  // `filed_by` — who WROTE the entry, when that is not the actor in `by`.
  // Required (null allowed) on every entry appended after the field existed;
  // the entries that predate it are grandfathered and counted as `unrecorded`
  // in the summary below rather than silently folded into either bucket.
  // Only when the baseline is trustworthy. Without it every entry looks new,
  // and a failed git call would surface as a pile of contract violations
  // instead of "this check could not run" — a broken tool reported as broken
  // data.
  if (!baselineSkipped && i >= committedLines.length && !Object.hasOwn(e, 'filed_by')) {
    bad(n, 'missing `filed_by` — say who wrote this entry, or `null` when that is the actor in `by`. ' +
      'Absent, the summary cannot distinguish a relayed entry from a self-written one and would have to assert it.');
  }

  // ── subject ───────────────────────────────────────────────────────────────
  const about = e.about ?? {};
  if (!about.id || typeof about.id !== 'string') bad(n, '`about.id` must be a resolvable identifier string');
  if (!SCALES.has(about.scale)) bad(n, `\`about.scale\` must be one of ${[...SCALES].join('|')}, got ${JSON.stringify(about.scale)}`);
  if (about.scale === 'population') {
    // A population is stored as a RECOMPUTABLE selector, never a frozen id list:
    // a frozen list is a claim about a moment that silently keeps asserting
    // itself after the population has moved.
    if (!about.predicate || typeof about.predicate !== 'string') bad(n, 'population scale requires a `predicate` string (a selector, not an id list)');
    if (typeof about.n !== 'number') bad(n, 'population scale requires a numeric `n`');
    if (Array.isArray(about.ids)) bad(n, 'population scale must not freeze an `ids` list — store the selector');
  }

  // ── version binding ───────────────────────────────────────────────────────
  const asserted = e.asserted ?? {};
  if (!ASSERTED_KEYS.some((k) => asserted[k])) {
    bad(n, `\`asserted\` needs at least one of ${ASSERTED_KEYS.join(', ')} — an observation is true only for a stated version`);
  }

  // ── attribution ───────────────────────────────────────────────────────────
  if (!BY_TYPES.has(e.by_type)) bad(n, `\`by_type\` must be one of ${[...BY_TYPES].join('|')}, got ${JSON.stringify(e.by_type)}`);
  if (typeof e.by !== 'string' || !/^(did:|orcid:|github:)/.test(e.by)) {
    bad(n, '`by` must be a normalized actor id (did:, orcid: or github: prefix)');
  }

  // ── substance ─────────────────────────────────────────────────────────────
  if (typeof e.statement !== 'string' || e.statement.trim().length < 60) {
    bad(n, '`statement` is too short to be read cold — say what was observed and why it matters');
  }
  if (!Array.isArray(e.evidence) || e.evidence.length === 0) {
    bad(n, '`evidence` must list at least one resolvable reference; an unevidenced observation is an opinion');
  }
});

// ── uniqueness ──────────────────────────────────────────────────────────────
const seen = new Map();
for (const { n, e } of entries) {
  if (e.id === undefined) continue;
  if (seen.has(e.id)) bad(n, `duplicate id \`${e.id}\` (first seen on line ${seen.get(e.id)})`);
  else seen.set(e.id, n);
}

/**
 * Enforcement. Positional on purpose: only a positional comparison catches an
 * entry inserted in the middle or the file reordered, cases where the set of
 * ids is unchanged and any id-keyed comparison reports clean.
 */
const isPrefixExtension = (prev, cur) => prev.every((line, i) => cur[i] === line);

/**
 * Explanation — a DIFFERENT quantity from the one enforcement uses.
 *
 * Positional drift describes a deletion as a run of rewrites: removing entry 5
 * shifts 6, 7, 8 up, so the honest positional report reads "5, 6, 7 rewritten,
 * 8 removed" for what a reader thinks of as one deletion. The description is
 * accurate and still misleads, because the reader's mental model is keyed on
 * records and the checker's is keyed on line positions.
 *
 * So enforcement stays positional and reporting re-derives from the id set:
 * present-then-absent is a removal, present-in-both-but-changed is a rewrite,
 * absent-then-present is an append and is legal. Line position becomes an
 * implementation detail nobody has to hold in their head.
 *
 * Where the two disagree, that disagreement is itself the finding: a positional
 * failure with no id-level difference means the ORDER changed, which the id view
 * cannot see and must not silently swallow. And the id view needs ids to exist
 * and be unique, so a line that will not parse drops the whole explanation back
 * to positional — announced, never quietly.
 */
function explainDrift(prev, cur) {
  const index = (rows) => {
    const map = new Map();
    for (const row of rows) {
      let id;
      try {
        id = JSON.parse(row).id;
      } catch {
        return null; // unparseable line — no id view is possible
      }
      if (id === undefined || map.has(id)) return null; // missing or duplicate id
      map.set(id, row);
    }
    return map;
  };
  const before = index(prev);
  const after = index(cur);
  if (!before || !after) {
    const positional = [];
    prev.forEach((line, i) => {
      if (cur[i] === undefined) positional.push(`line ${i + 1} removed`);
      else if (cur[i] !== line) positional.push(`line ${i + 1} modified`);
    });
    return { notes: positional, fellBack: true };
  }
  const notes = [];
  for (const [id, row] of before) {
    if (!after.has(id)) notes.push(`entry \`${id}\` was REMOVED`);
    else if (after.get(id) !== row) notes.push(`entry \`${id}\` was REWRITTEN`);
  }
  // Appended ids are legal on their own and are not reported as drift — but
  // WHERE they landed is not, so they are what distinguishes the two ways a
  // positional check can fail with no entry removed or rewritten. Saying "the
  // entry set is unchanged" for an insertion would be a small false statement
  // of exactly the kind this whole check exists to stop.
  if (notes.length === 0) {
    const inserted = [...after.keys()].filter((id) => !before.has(id));
    // Say only what this branch establishes. All it knows is: nothing removed,
    // nothing rewritten, and the file is no longer an extension of the previous
    // version. With an added id that is an insertion somewhere other than the
    // end — possibly alongside a reordering, which this view cannot separate.
    // Claiming plain "inserted mid-file" would assert the part it cannot see.
    notes.push(inserted.length > 0
      ? `entry ${inserted.map((id) => `\`${id}\``).join(', ')} was ADDED somewhere other than the end, ` +
        'or existing entries were reordered around it — either way the file is no longer an extension ' +
        'of its previous version, which appending at the end would have kept'
      : 'no entry was removed, rewritten or added, so existing entries were REORDERED');
  }
  return { notes, fellBack: false };
}

// ── append-only, part 1: the working tree against HEAD ──────────────────────
// Catches the mistake BEFORE it is committed, which is the common case and the
// one where a precise message helps most.
//
// On its own this is WEAKER than the property it appears to check: commit the
// edit and HEAD moves with it, so the same comparison reports clean. That was
// not hypothetical here — a rewritten entry, committed, passed this gate with
// `append-only: ok` and exit 0. Part 2 below is what actually checks the
// property; this part stays because it fails earlier and reads better.
let appendOnly = baselineSkipped ? `SKIPPED — ${baselineSkipped}` : 'not checked (no committed version yet)';
if (committedLines.length) {
  const now = lines.filter((l) => l.trim());
  if (!isPrefixExtension(committedLines, now)) {
    const { notes, fellBack } = explainDrift(committedLines, now);
    fail.push(`${FILE} — append-only violated in the working tree: ${notes.slice(0, 5).join('; ')}` +
      `${fellBack ? ' (reported by line position: an entry would not parse, or its id is missing or duplicated)' : ''}. ` +
      `A superseded observation is corrected by APPENDING a new entry on the same \`about\`, never by editing the old one.`);
    appendOnly = 'VIOLATED';
  } else {
    appendOnly = `ok (${committedLines.length} committed, ${now.length - committedLines.length} appended)`;
  }
}

// ── append-only, part 2: every committed version, against the one before it ──
//
// Walks the file's own commit history and requires each version to be a
// line-wise PREFIX EXTENSION of its predecessor. Appending passes; editing or
// deleting a line that a previous commit contained does not.
//
// A `git log --diff-filter=MDR` check — the natural fix when a ledger stores
// one file per record, where appends are Additions and edits are Modifications
// — cannot be used here: this ledger is a single append-only JSONL, so a
// perfectly legal append is also an `M`. The storage shape decides the check;
// copying the other shape's rule would reject every append.
//
// Residual limit, stated rather than papered over: this reads the history it is
// given. A rebase or force-push that removes a record before the gate runs
// leaves nothing to find. Append-only here defends against ordinary mistakes
// and against a later version of myself — not against someone rewriting the
// past. That would need signatures (stage 4) or an externally anchored log.
let history = 'not checked (no commits touch this file yet)';
try {
  const shas = git(['log', '--format=%H', '--', FILE])
    .split('\n').filter(Boolean).reverse(); // oldest first
  const drift = [];
  let prev = null;
  let prevSha = null;
  let compared = 0;
  let unreadable = 0;
  for (const sha of shas) {
    let text;
    try {
      text = git(['show', `${sha}:${FILE}`]);
    } catch {
      // Path absent at this commit (e.g. before a rename). Counted, because a
      // silently skipped version turns "N commits checked" into a number that
      // does not say how many were actually compared.
      //
      // Exercised by pointing `FI_GIT_BIN` at a stub that fails `show` while
      // `log` still succeeds. What that establishes is how THIS code reacts to
      // a failing `show` — not that git ever fails that way, which no stub can
      // show. The distinction matters: a branch whose correctness depends on
      // git's actual output (a rename reported as `R100 old new`, say) has to
      // be checked against real git, and a stub would only be re-asserting the
      // format this code already assumes.
      unreadable++;
      continue;
    }
    const cur = text.split('\n').filter((l) => l.trim());
    if (prev) {
      compared++;
      if (!isPrefixExtension(prev, cur)) {
        const { notes, fellBack } = explainDrift(prev, cur);
        for (const note of notes) {
          drift.push(`in ${sha.slice(0, 8)} (since ${prevSha.slice(0, 8)}) ${note}` +
            `${fellBack ? ' [by line position — an entry would not parse or its id is missing/duplicated]' : ''}`);
        }
      }
    }
    prev = cur;
    prevSha = sha;
  }
  if (drift.length) {
    fail.push(`${FILE} — append-only violated IN HISTORY: ${drift.slice(0, 5).join('; ')}. ` +
      `A committed rewrite is still a rewrite; correct a superseded observation by appending on the same \`about\`.`);
    history = 'VIOLATED';
  } else {
    // "ok" only when something was actually compared. A walk that skipped every
    // version has established nothing, and printing ok there is the exact
    // substitution this check exists to prevent: "not compared" read as
    // "unchanged".
    const detail = `${shas.length} commit(s) touched it, ${compared} version pair(s) compared` +
      `${unreadable ? `, ${unreadable} version(s) unreadable at this path and SKIPPED` : ''}`;
    if (compared === 0 && shas.length > 1) {
      history = `NOT ESTABLISHED — nothing could be compared (${detail})`;
      fail.push(`${FILE} — the append-only history check compared nothing (${detail}). ` +
        `That is not a pass; it means the history could not be read.`);
    } else {
      history = `ok (${detail})`;
    }
  }
} catch {
  // `git log` failed. Do NOT name a cause — "not a git repository" is one
  // reading and this has established none of them, which is the same
  // collapse-then-assert the entry-level rules forbid. And it must not exit 0:
  // a history check that never ran is not a history check that passed.
  history = 'NOT CHECKED — `git log` failed here, cause unknown';
  fail.push(`${FILE} — the append-only history check could not run (\`git log\` failed). ` +
    `Treating that as a pass would make the strongest half of this gate optional.`);
}

// ── report ──────────────────────────────────────────────────────────────────
const bySubject = new Map();
for (const { e } of entries) {
  const owner = String(e.about?.id ?? '').startsWith('opp:frontier-isles') ? 'this repo' : 'external';
  bySubject.set(owner, (bySubject.get(owner) ?? 0) + 1);
}
const unsigned = entries.filter(({ e }) => e.signature === null).length;

// Who wrote each entry, counted from what is recorded — never asserted.
//
// This line used to read "N/N written by the actor named in `by`", where N was
// entries whose `by` equalled one hardcoded actor string. That is not a
// measurement: nothing in the file recorded who wrote an entry, so the label
// stated a fact the data could not carry, and any legitimate second author
// would have silently pushed the ratio down while the sentence stayed put.
//
// Three buckets, because two would force the grandfathered entries into one
// side or the other: `self` recorded `filed_by: null`, `relayed` recorded a
// different filer, `unrecorded` predates the field and is claimed for neither.
const filer = { self: 0, relayed: 0, unrecorded: 0 };
for (const { e } of entries) {
  if (!Object.hasOwn(e, 'filed_by')) filer.unrecorded++;
  else if (e.filed_by === null) filer.self++;
  else filer.relayed++;
}

console.log(`observations: ${entries.length} · subjects: ${[...bySubject].map(([k, v]) => `${k} ${v}`).join(', ')}`);
console.log(`append-only: working tree ${appendOnly} · history ${history}`);
console.log(`filed by: ${filer.self} self · ${filer.relayed} relayed · ${filer.unrecorded} unrecorded ` +
  `(entries predating the field — append-only, so they cannot be backfilled; the gate requires it on anything appended since)`);
console.log(`signatures: ${unsigned}/${entries.length} explicitly unsigned (signing is stage 4)`);

if (fail.length) {
  console.error(`\n✗ ${fail.length} contract violation(s):`);
  fail.slice(0, 20).forEach((f) => console.error('  ✗ ' + f));
  process.exit(1);
}
console.log('✓ every entry satisfies docs/observation-ledger-v1-2026-08-09.md');

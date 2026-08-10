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
let committedLines = [];
try {
  committedLines = execFileSync('git', ['show', `HEAD:${FILE}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    .split('\n').filter((l) => l.trim());
} catch { /* not in HEAD yet — first commit, nothing is grandfathered */ }

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
  if (i >= committedLines.length && !Object.hasOwn(e, 'filed_by')) {
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

// ── append-only ─────────────────────────────────────────────────────────────
// The ledger's core property, enforced rather than trusted. Every previously
// committed line must still be present, byte-identical, in the same order.
// Editing a past entry is how a record of "what someone once saw" quietly turns
// into a record of "what we currently believe".
let appendOnly = 'not checked (no committed version yet)';
if (committedLines.length) {
  const now = lines.filter((l) => l.trim());
  const drift = [];
  committedLines.forEach((line, i) => {
    if (now[i] === undefined) drift.push(`line ${i + 1} was removed`);
    else if (now[i] !== line) drift.push(`line ${i + 1} was modified`);
  });
  if (drift.length) {
    fail.push(`${FILE} — append-only violated: ${drift.slice(0, 5).join('; ')}. ` +
      `A superseded observation is corrected by APPENDING a new entry on the same \`about\`, never by editing the old one.`);
    appendOnly = 'VIOLATED';
  } else {
    appendOnly = `ok (${committedLines.length} committed, ${now.length - committedLines.length} appended)`;
  }
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
console.log(`append-only: ${appendOnly}`);
console.log(`filed by: ${filer.self} self · ${filer.relayed} relayed · ${filer.unrecorded} unrecorded ` +
  `(entries predating the field — append-only, so they cannot be backfilled; the gate requires it on anything appended since)`);
console.log(`signatures: ${unsigned}/${entries.length} explicitly unsigned (signing is stage 4)`);

if (fail.length) {
  console.error(`\n✗ ${fail.length} contract violation(s):`);
  fail.slice(0, 20).forEach((f) => console.error('  ✗ ' + f));
  process.exit(1);
}
console.log('✓ every entry satisfies docs/observation-ledger-v1-2026-08-09.md');

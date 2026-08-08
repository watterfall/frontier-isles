/**
 * Atlas completeness audit — "is anything missing, and is every island
 * reachable on the map with its information intact?"
 *
 * The vitest suites gate structure per wave; this gates the atlas AS A WHOLE
 * and prints a readable report, including the two things a unit test cannot:
 * how the numbers moved, and which findings are pre-existing rather than
 * introduced by the change under review. That split matters — reporting a
 * pre-existing defect as a regression is as wrong as hiding it.
 *
 * Run:  node --experimental-strip-types scripts/audit-atlas.mjs [evidence-dir]
 * Exits non-zero if any island is ungrounded, incomplete, or unreachable.
 * The corpus directory is only needed for the provenance and evidence checks;
 * without it those are skipped and the rest still runs.
 */
import { readFile } from 'node:fs/promises';
import { FRONTIERS } from '../src/frontiers.ts';
import { FRONTIER_ATLAS } from '../src/atlas.ts';
import { FRONTIER_ATLAS_DETAIL } from '../src/atlas-detail.ts';

/** ids at or above this belong to wave 3; below is the pre-wave-3 atlas. */
const WAVE_3_FIRST = 177;
/** The flat SVG readable twin's viewBox. The Pixi atlas derives its own bounds,
 *  but the SVG twin does not — anything outside is clipped on the no-GPU path. */
const SVG_VIEWBOX = { w: 1440, h: 900 };
/** Centre-to-centre floor below which two mounds are not separately clickable.
 *  Must match `frontier-expansion-wave3.test.ts` — two gates on one invariant
 *  with two thresholds means an edit can pass one and fail the other. */
const CLICK_FLOOR_PX = 24;

const corpusDir = process.argv[2] ?? process.env.XFRONTIER_AUDIT_DIR ?? '/Users/jili/AIAI/frontier/audit';

/**
 * Read a corpus file. A MISSING file is a legitimate "not on this machine" —
 * the corpus is a separate checkout and CI does not have it. A file that exists
 * but does not parse is a broken corpus, and must NOT be laundered into the
 * same "skipped" state: that would let a truncated atlas_data.json read as a
 * clean pass. So only ENOENT degrades; anything else throws.
 */
const readJson = async (p) => {
  let raw;
  try {
    raw = await readFile(p, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw new Error(`cannot read ${p}: ${err.message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`${p} exists but is not valid JSON (${err.message}). A corrupt corpus must fail, not skip.`);
  }
};
const corpus = await readJson(`${corpusDir}/atlas_data.json`);
const evidence = await readJson(`${corpusDir}/evidence.json`);
/** Checks that could not run. The verdict must never claim a property it skipped. */
const skipped = [];

const fail = [];
const warn = [];
const ok = (cond, msg) => { if (!cond) fail.push(msg); };
const isWave3 = (f) => f.id >= WAVE_3_FIRST;

console.log('═══ ATLAS COMPLETENESS AUDIT ═══\n');
console.log(`islands: ${FRONTIERS.length}`);

// ── identity ────────────────────────────────────────────────────────────────
const idSet = new Set(FRONTIERS.map((f) => f.id));
const missingIds = [];
for (let i = 1; i <= FRONTIERS.length; i++) if (!idSet.has(i)) missingIds.push(i);
ok(idSet.size === FRONTIERS.length, 'duplicate island id');
ok(missingIds.length === 0, `island ids missing: ${missingIds.slice(0, 10).join(',')}`);
ok(new Set(FRONTIERS.map((f) => f.slug)).size === FRONTIERS.length, 'duplicate slug');
ok(new Set(FRONTIERS.map((f) => f.atlasN)).size === FRONTIERS.length, 'duplicate atlasN');

// ── provenance ──────────────────────────────────────────────────────────────
if (corpus) {
  const live = new Set(corpus.records.map((r) => r.n));
  const orphans = FRONTIERS.filter((f) => !live.has(f.atlasN));
  const orphansW3 = orphans.filter(isWave3);
  ok(orphansW3.length === 0,
    `${orphansW3.length} wave-3 islands cite an atlasN absent from the corpus: ${orphansW3.map((f) => f.atlasN).join(',')}`);
  for (const f of orphans.filter((f) => !isWave3(f))) {
    warn.push(`PRE-EXISTING · #${f.id} ${f.slug} cites XF-${String(f.atlasN).padStart(6, '0')}, which the atlas has ` +
      `withdrawn. Editorial call: flag \`resolved: true\` (the settled-question lighthouse) or retire the island.`);
  }
  console.log(`provenance: ${FRONTIERS.length - orphans.length}/${FRONTIERS.length} trace to a live xfrontier record ` +
    `(wave-3 orphans ${orphansW3.length}, pre-existing ${orphans.length - orphansW3.length})`);
} else {
  skipped.push(`provenance (no corpus at ${corpusDir} — pass XFRONTIER_AUDIT_DIR or an argv path)`);
  console.log('provenance: SKIPPED (no corpus at ' + corpusDir + ')');
}

// ── cluster + domain shape ──────────────────────────────────────────────────
const byCluster = new Map();
for (const f of FRONTIERS) byCluster.set(f.cluster.code, (byCluster.get(f.cluster.code) ?? 0) + 1);
ok(byCluster.size === 53, `expected 53 clusters, got ${byCluster.size}`);
const counts = [...byCluster.values()];
console.log(`clusters: ${byCluster.size}/53 covered, ${Math.min(...counts)}–${Math.max(...counts)} islands each`);
const dom = {};
for (const f of FRONTIERS) dom[f.domain] = (dom[f.domain] ?? 0) + 1;
console.log('domains: ' + Object.entries(dom)
  .map(([d, n]) => `${d}=${n}(${(n / FRONTIERS.length * 100).toFixed(1)}%)`).join('  '));

// ── content completeness ────────────────────────────────────────────────────
const hasCjk = (s) => /[一-鿿]/.test(s);
let incomplete = 0;
for (const f of FRONTIERS) {
  const errs = [];
  const bi = (v, label) => {
    if (!v?.zh?.trim() || !v?.en?.trim()) return errs.push(`${label} incomplete`);
    if (!hasCjk(v.zh)) errs.push(`${label}.zh not Chinese`);
    if (hasCjk(v.en)) errs.push(`${label}.en contains CJK`);
    if (v.zh.trim() === v.en.trim()) errs.push(`${label} zh===en`);
  };
  bi(f.title, 'title'); bi(f.qfocus, 'qfocus'); bi(f.brief, 'brief');
  const d = f.depth;
  if (!d) errs.push('no depth');
  else {
    bi(d.overview, 'overview'); bi(d.whyMatters, 'whyMatters');
    bi(d.ifAnswered, 'ifAnswered'); bi(d.barrier, 'barrier');
    if (!(d.approaches?.length >= 2)) errs.push(`approaches=${d.approaches?.length}`);
    else d.approaches.forEach((a, i) => bi(a, `approaches[${i}]`));
    if (!(d.subQuestions?.length >= 2)) errs.push(`subQuestions=${d.subQuestions?.length}`);
    else d.subQuestions.forEach((q, i) => bi(q, `subQuestions[${i}]`));
  }
  if (!f.citation?.url?.startsWith('http')) errs.push('citation url');
  if (f.scores?.length !== 9) errs.push('scores');
  if (errs.length) { incomplete++; if (incomplete <= 6) fail.push(`#${f.id} ${f.slug}: ${errs.join(', ')}`); }
}
ok(incomplete === 0, `${incomplete} islands have incomplete content`);
console.log(`content: ${FRONTIERS.length - incomplete}/${FRONTIERS.length} complete and bilingual across every depth section`);

// ── evidence ────────────────────────────────────────────────────────────────
const doiOf = (u) => (String(u ?? '').match(/10\.\d{4,9}\/[^\s"'<>?#]+/i) ?? [''])[0].toLowerCase().replace(/[.,;)]+$/, '');
const titleKey = (t) => String(t ?? '').toLowerCase().replace(/[^a-z0-9一-鿿]/g, '');
/** Same paper? DOI first (doi.org and the publisher host give the same DOI),
 *  then normalised title (a PMC mirror carries neither the same URL nor DOI). */
const samePaper = (a, b) => {
  const da = doiOf(a.url), db = doiOf(b.url);
  if (da && db) return da === db;
  return !!titleKey(a.title) && titleKey(a.title) === titleKey(b.title);
};

let shelves = 0, refs = 0, dupes = 0;
for (const f of FRONTIERS) {
  const lit = f.literature ?? [];
  if (lit.length) { shelves++; refs += lit.length; }
  for (let i = 0; i < lit.length; i++) {
    // A shelf that repeats the headline shows the visitor the same paper twice…
    if (samePaper(lit[i], f.citation)) {
      dupes++; fail.push(`#${f.id} ${f.slug}: literature repeats the headline citation`);
    }
    // …and so does a shelf that repeats ITSELF. The original dedup pass only
    // compared each entry to the headline, which let #118 carry one PNAS paper
    // twice — once at the publisher, once at its PMC mirror (different URL,
    // different DOI-less link, identical title).
    for (let j = i + 1; j < lit.length; j++) {
      if (samePaper(lit[i], lit[j])) {
        dupes++; fail.push(`#${f.id} ${f.slug}: shelf lists the same paper twice ("${lit[i].title.slice(0, 50)}…")`);
      }
    }
  }
}
console.log(`evidence: ${shelves}/${FRONTIERS.length} islands carry a literature shelf (${refs} refs), ${dupes} duplicated`);

// Two islands whose DEFINING paper is the same one. Not a failure: which paper
// defines a frontier is an editorial call, and 11 of these predate wave 3. But
// it is worth surfacing — a visitor meeting both islands meets one paper twice.
const headline = new Map();
for (const f of FRONTIERS) {
  const key = doiOf(f.citation.url) || titleKey(f.citation.title);
  if (!key) continue;
  if (!headline.has(key)) headline.set(key, []);
  headline.get(key).push(f);
}
const groups = [...headline.values()].filter((g) => g.length > 1);
if (groups.length) {
  const sameCluster = groups.filter((g) => new Set(g.map((f) => f.cluster.code)).size === 1);
  warn.push(`${groups.length} group(s) of islands share a headline citation ` +
    `(${sameCluster.length} of them inside one cluster, i.e. closest to true duplicates): ` +
    sameCluster.slice(0, 4).map((g) => g.map((f) => `#${f.id}`).join('≡')).join(', ') +
    ` — editorial call: re-point one headline, merge, or accept them as distinct framings.`);
}
if (evidence) {
  const notInCorpus = FRONTIERS.filter((f) => {
    const src = evidence[f.atlasN]?.sources ?? [];
    return src.length > 0 && !src.some((s) => s.url === f.citation.url);
  }).length;
  if (notInCorpus) warn.push(`${notInCorpus} headline citations are not verbatim in evidence.json (earlier waves predate it)`);
}

// ── map reachability ────────────────────────────────────────────────────────
ok(FRONTIER_ATLAS.length === FRONTIERS.length, `L0 atlas has ${FRONTIER_ATLAS.length}, FRONTIERS has ${FRONTIERS.length}`);
const atlasSlugs = new Set(FRONTIER_ATLAS.map((a) => a.slug));
const unreachable = FRONTIERS.filter((f) => !atlasSlugs.has(f.slug));
ok(unreachable.length === 0, `${unreachable.length} islands are missing from the L0 atlas: ${unreachable.slice(0, 5).map((f) => f.slug).join(',')}`);
const noDetail = FRONTIERS.filter((f) => !FRONTIER_ATLAS_DETAIL[f.slug]);
ok(noDetail.length === 0, `${noDetail.length} islands have no card prose / reference shelf`);
const leaks = FRONTIER_ATLAS.filter((a) => 'depth' in a || 'literature' in a || 'interior' in a);
ok(leaks.length === 0, `${leaks.length} atlas entries leaked an L1 payload into L0`);
console.log(`map: ${FRONTIER_ATLAS.length}/${FRONTIERS.length} in the L0 atlas, ${FRONTIERS.length - noDetail.length}/${FRONTIERS.length} with card prose + reference shelf`);

// ── geometry ────────────────────────────────────────────────────────────────
const outside = FRONTIERS.filter((f) =>
  f.chart.x < 0 || f.chart.x > SVG_VIEWBOX.w || f.chart.y < 0 || f.chart.y > SVG_VIEWBOX.h);
ok(outside.length === 0, `${outside.length} islands fall outside the SVG readable twin's ${SVG_VIEWBOX.w}×${SVG_VIEWBOX.h} viewBox`);
let min = Infinity, pair = ['', ''];
const nn = [];
for (let i = 0; i < FRONTIERS.length; i++) {
  let best = Infinity;
  for (let j = 0; j < FRONTIERS.length; j++) {
    if (i === j) continue;
    const d = Math.hypot(FRONTIERS[i].chart.x - FRONTIERS[j].chart.x, FRONTIERS[i].chart.y - FRONTIERS[j].chart.y);
    if (d < best) best = d;
    if (d < min) { min = d; pair = [FRONTIERS[i].slug, FRONTIERS[j].slug]; }
  }
  nn.push(best);
}
nn.sort((a, b) => a - b);
ok(min > CLICK_FLOOR_PX, `tightest pair ${min.toFixed(1)}px (${pair.join(' ↔ ')}) is under the ${CLICK_FLOOR_PX}px clickability floor`);
console.log(`geometry: all inside ${SVG_VIEWBOX.w}×${SVG_VIEWBOX.h} · tightest pair ${min.toFixed(1)}px · ` +
  `p10 ${nn[Math.floor(nn.length * 0.1)].toFixed(1)}px · median ${nn[Math.floor(nn.length / 2)].toFixed(1)}px`);

// ── relational layers ───────────────────────────────────────────────────────
// An island with depth but no ferry route, no current and no structure mapping
// is readable but inert: nothing connects it to the rest of the atlas. Coverage
// here is not a pass/fail — the relational layers are hand-authored and always
// lag a content wave — but it must be VISIBLE, because "371 islands" and
// "371 connected islands" are very different claims and only one of them is
// true right now.
const { SEED_STRUCTURES } = await import('../src/structures.ts');
const { BRIDGES } = await import('../src/bridges.ts');
const { SEA_SEED_RELATIONS } = await import('../src/sea.ts');
const { INTERIORS } = await import('../src/interiors.ts');
const { INTERIORS_2 } = await import('../src/interiors-2.ts');

const layers = [
  ['ferry routes (bridges)', new Set(BRIDGES.flatMap((b) => [b.from, b.to]))],
  ['structure mappings', new Set(SEED_STRUCTURES.flatMap((s) => s.mappings.map((m) => m.slug)))],
  // SeaSeedRelation carries anchor/reactor, NOT from/to.
  ['ledger currents (sea)', new Set(SEA_SEED_RELATIONS.flatMap((r) => [r.anchor, r.reactor]))],
  ['rich interiors', new Set([...Object.keys(INTERIORS), ...Object.keys(INTERIORS_2)])],
];
console.log('\nrelational coverage — an island in none of these is readable but inert:');
let inertEverywhere = 0;
for (const f of FRONTIERS) if (!layers.some(([, s]) => s.has(f.slug))) inertEverywhere++;
for (const [name, set] of layers) {
  const hit = FRONTIERS.filter((f) => set.has(f.slug)).length;
  const w3 = FRONTIERS.filter((f) => isWave3(f) && set.has(f.slug)).length;
  console.log(`  ${name.padEnd(26)} ${String(hit).padStart(3)}/${FRONTIERS.length}` +
    `  (wave 3: ${w3}/${FRONTIERS.filter(isWave3).length})`);
}
const inertPct = (inertEverywhere / FRONTIERS.length * 100).toFixed(0);
console.log(`  islands in NO relational layer: ${inertEverywhere}/${FRONTIERS.length} (${inertPct}%)`);
if (inertEverywhere / FRONTIERS.length > 0.4) {
  warn.push(`${inertEverywhere} islands (${inertPct}%) appear in no ferry route, structure mapping, ` +
    `current or interior — they open to a real briefing but connect to nothing. The relational layers ` +
    `are hand-authored and lag content waves; this is the backlog, not a data error.`);
}

// ── verdict ─────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(64));
if (warn.length) { console.log('FINDINGS (not introduced by the current change):'); warn.forEach((w) => console.log('  ⚠ ' + w)); }
if (skipped.length) { console.log('NOT CHECKED:'); skipped.forEach((s) => console.log('  ∅ ' + s)); }
if (fail.length) {
  console.log(`\n✗ FAILED — ${fail.length} problem(s):`);
  fail.slice(0, 20).forEach((f) => console.log('  ✗ ' + f));
  process.exit(1);
}

// The verdict must not assert a property that a warning contradicts or that was
// never checked. A reader who sees only the last line (a CI log tail, a doc's
// gate table, a future agent) has to be able to trust it literally — printing
// "every island is grounded" four lines under "#60 cites a withdrawn record"
// is how an invariant quietly stops meaning anything.
const claims = ['complete', 'bilingual', 'reachable on the map'];
if (!warn.some((w) => /withdrawn|absent from the corpus/.test(w)) && corpus) claims.unshift('grounded');
const verdict = `✓ PASS — every island is ${claims.join(', ')}.`;
console.log(verdict);
if (warn.length || skipped.length) {
  console.log(`  (${warn.length} open finding(s), ${skipped.length} check(s) not run — see above. ` +
    `"PASS" covers only the properties named on the line above.)`);
}

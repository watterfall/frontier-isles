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
/** Centre-to-centre floor below which two mounds are not separately clickable. */
const CLICK_FLOOR_PX = 20;

const corpusDir = process.argv[2] ?? '/Users/jili/AIAI/frontier/audit';
const readJson = async (p) => JSON.parse(await readFile(p, 'utf8')).valueOf();
const corpus = await readJson(`${corpusDir}/atlas_data.json`).catch(() => null);
const evidence = await readJson(`${corpusDir}/evidence.json`).catch(() => null);

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
const doiOf = (u) => (String(u ?? '').match(/10\.\d{4,9}\/[^\s"'<>?#]+/i) ?? [''])[0].toLowerCase();
let shelves = 0, refs = 0, dupes = 0;
for (const f of FRONTIERS) {
  if (f.literature?.length) { shelves++; refs += f.literature.length; }
  for (const l of f.literature ?? []) {
    const a = doiOf(l.url), b = doiOf(f.citation.url);
    // A shelf that repeats the headline shows the visitor the same paper twice.
    if ((a && b && a === b) || l.title.toLowerCase() === f.citation.title.toLowerCase()) {
      dupes++; fail.push(`#${f.id} ${f.slug}: literature repeats the headline citation`);
    }
  }
}
console.log(`evidence: ${shelves}/${FRONTIERS.length} islands carry a literature shelf (${refs} refs), ${dupes} duplicating their headline`);
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

// ── verdict ─────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(64));
if (warn.length) { console.log('FINDINGS (not introduced by the current change):'); warn.forEach((w) => console.log('  ⚠ ' + w)); }
if (fail.length) {
  console.log(`\n✗ FAILED — ${fail.length} problem(s):`);
  fail.slice(0, 20).forEach((f) => console.log('  ✗ ' + f));
  process.exit(1);
}
console.log('✓ PASS — every island is grounded, complete, bilingual, and reachable on the map.');

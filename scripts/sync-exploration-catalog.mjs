#!/usr/bin/env node
/** Refresh only the public question projection; never alters atlas records,
 * authored mappings or the upstream ledger. */
import { readFile, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createExplorationReader } from '../apps/server/src/xfrontier-exploration.ts';
const args = process.argv.slice(2);
if (args.some((arg) => !['--write', '--check'].includes(arg)) || (args.includes('--write') && args.includes('--check'))) {
  throw new Error('Usage: node --experimental-strip-types scripts/sync-exploration-catalog.mjs [--check | --write]');
}
const path = fileURLToPath(new URL('../apps/web/src/data/exploration-catalog.json', import.meta.url));
const beforeText = await readFile(path, 'utf8');
const before = JSON.parse(beforeText);
const { source, catalog } = await createExplorationReader()();
if (source !== 'live') throw new Error('Refusing to write a stale response');
const content = ({ retrievedAt, ...value }) => value;
const changed = JSON.stringify(content(before)) !== JSON.stringify(content(catalog));
console.log(JSON.stringify({ source, before: before.datasetVersion, after: catalog.datasetVersion, questions: catalog.questions.length, collisions: catalog.collisions.length, changed, write: args.includes('--write') }, null, 2));
if (args.includes('--check') && changed) process.exitCode = 1;
if (args.includes('--write')) {
  if (await readFile(path, 'utf8') !== beforeText) throw new Error('Snapshot changed during retrieval');
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(catalog, null, 2) + '\n');
  await rename(temporary, path);
}

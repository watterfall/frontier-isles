import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = fileURLToPath(new URL('../src/', import.meta.url));
const repoFile = (path) => relative(fileURLToPath(new URL('..', import.meta.url)), path);

/** Full data barrel — pulls the L1 editorial payloads into whatever imports it. */
const rootImport = /(?:from\s*|import\s*\()(['"])@frontier-isles\/data\1/g;

/**
 * A STATIC import of the deferred atlas detail (`from '…/atlas-detail'`, as
 * opposed to `import('…/atlas-detail')`).
 *
 * The module is the deferred half of the L0 atlas — ~141KB of card prose and
 * citations that the generator splits out so nothing blocks on it. A static
 * import puts it back in the importer's blocking chain, and under the dev
 * server its transform lands there too. That is not theoretical: importing it
 * from the lazily-mounted island screen put a 141KB transform inside the wait a
 * visitor sees when opening an island, and on CI that pushed the L1 mount past
 * its 30s budget while the production bundle looked perfectly fine — so bundle
 * analysis alone cannot catch this. Read it through `api/atlasDetail.ts`, which
 * the atlas boot has already filled.
 */
const staticDetailImport = /from\s*(['"])@frontier-isles\/data\/atlas-detail\1/g;
/** The single module allowed to load it, via `import()`. */
const DETAIL_LOADER = 'src/api/atlasDetail.ts';

const barrelViolations = [];
const detailViolations = [];

async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await scan(path);
      continue;
    }
    if (!['.ts', '.tsx'].includes(extname(entry.name))) continue;
    const text = await readFile(path, 'utf8');
    const file = repoFile(path);

    rootImport.lastIndex = 0;
    if (rootImport.test(text)) barrelViolations.push(file);

    staticDetailImport.lastIndex = 0;
    if (staticDetailImport.test(text) && file !== DETAIL_LOADER) detailViolations.push(file);
  }
}

await scan(src);

if (barrelViolations.length > 0) {
  console.error('Use a browser-safe @frontier-isles/data/* subpath instead of the full data barrel:');
  for (const file of barrelViolations) console.error(`- ${file}`);
  process.exitCode = 1;
}

if (detailViolations.length > 0) {
  console.error(
    `@frontier-isles/data/atlas-detail is deferred: only ${DETAIL_LOADER} may load it, and only ` +
      'through import(). Read it elsewhere via atlasDetailOf() so it never joins a blocking chain:',
  );
  for (const file of detailViolations) console.error(`- ${file}`);
  process.exitCode = 1;
}

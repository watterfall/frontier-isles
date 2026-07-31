import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = fileURLToPath(new URL('../src/', import.meta.url));
const rootImport = /(?:from\s*|import\s*\()(['"])@frontier-isles\/data\1/g;
const violations = [];

async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await scan(path);
      continue;
    }
    if (!['.ts', '.tsx'].includes(extname(entry.name))) continue;
    if (rootImport.test(await readFile(path, 'utf8'))) {
      violations.push(relative(fileURLToPath(new URL('..', import.meta.url)), path));
    }
    rootImport.lastIndex = 0;
  }
}

await scan(src);

if (violations.length > 0) {
  console.error('Use a browser-safe @frontier-isles/data/* subpath instead of the full data barrel:');
  for (const file of violations) console.error(`- ${file}`);
  process.exitCode = 1;
}

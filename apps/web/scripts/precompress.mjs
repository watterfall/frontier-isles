/**
 * Build-time precompression for `dist/`.
 *
 * Fly's edge compresses on the fly at a low quality setting: the deployed
 * 1.58MB entry chunk arrived as 645KB of brotli, WORSE than the 534KB gzip the
 * Vite build reports. Compressing once at build time (brotli quality 11) buys
 * a materially smaller wire payload for every visitor, and costs the server
 * nothing at request time — `@hono/node-server`'s `serveStatic({ precompressed:
 * true })` picks the `.br`/`.gz` sibling up automatically when the client's
 * accept-encoding allows it.
 *
 * This matters most where bandwidth is worst: there is no Fly region in
 * mainland China, so those bytes cross a throttled border.
 */
import { brotliCompress, gzip, constants } from 'node:zlib';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const br = promisify(brotliCompress);
const gz = promisify(gzip);

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
/** Text formats only — images/fonts are already compressed. */
const COMPRESSIBLE = new Set(['.js', '.css', '.html', '.json', '.svg', '.map', '.txt']);
/** Below this, the header overhead and the extra file are not worth it. */
const MIN_BYTES = 1024;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

let files = 0;
let raw = 0;
let brotli = 0;

for await (const path of walk(DIST)) {
  if (path.endsWith('.br') || path.endsWith('.gz')) continue;
  if (!COMPRESSIBLE.has(extname(path))) continue;
  const { size } = await stat(path);
  if (size < MIN_BYTES) continue;

  const buf = await readFile(path);
  const [brBuf, gzBuf] = await Promise.all([
    br(buf, {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: 11,
        [constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
      },
    }),
    gz(buf, { level: 9 }),
  ]);

  // Only keep a variant that actually wins; a larger sibling would make
  // `precompressed` serve MORE bytes than the plain file.
  if (brBuf.length < buf.length) await writeFile(`${path}.br`, brBuf);
  if (gzBuf.length < buf.length) await writeFile(`${path}.gz`, gzBuf);

  files += 1;
  raw += buf.length;
  brotli += Math.min(brBuf.length, buf.length);
}

const pct = raw > 0 ? ((1 - brotli / raw) * 100).toFixed(1) : '0.0';
console.log(
  `[precompress] ${files} files · ${(raw / 1024).toFixed(0)}KB → ${(brotli / 1024).toFixed(0)}KB brotli (-${pct}%)`,
);

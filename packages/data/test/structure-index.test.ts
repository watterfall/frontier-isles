import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SEED_STRUCTURES } from '../src/structures';
import { STRUCTURE_READING_INDEX, structureReadingIndex } from '../src/structure-index';

/**
 * The index is a generated summary of content that lives 600KiB away behind a
 * dynamic import, and the whole reason it exists is that the reader is shown
 * its numbers before that import happens. A stale index therefore does not
 * degrade — it lies to the reader about what opening a topic will give them.
 * `pnpm check:structure-index` catches a stale FILE; this catches stale
 * NUMBERS, and it runs in `pnpm test`, before typecheck.
 */
describe('structure reading index', () => {
  const withDepth = SEED_STRUCTURES.filter((structure) => structure.depth);

  it('covers exactly the structures that have a written body', () => {
    expect(Object.keys(STRUCTURE_READING_INDEX).sort()).toEqual(withDepth.map((s) => s.id).sort());
    for (const structure of SEED_STRUCTURES) {
      if (!structure.depth) expect(structureReadingIndex(structure.id), structure.id).toBeUndefined();
    }
  });

  it('reports the substrate, discipline and relation counts the reader will actually find', () => {
    const inbound = new Map<string, number>();
    for (const structure of SEED_STRUCTURES) {
      for (const relation of structure.depth?.relations ?? []) {
        inbound.set(relation.to, (inbound.get(relation.to) ?? 0) + 1);
      }
    }
    for (const structure of withDepth) {
      const entry = structureReadingIndex(structure.id)!;
      const substrates = structure.depth!.canonicalSubstrates;
      expect(entry.substrates, structure.id).toBe(substrates.length);
      expect(entry.fields, structure.id).toBe(new Set(substrates.map((s) => s.field.zh)).size);
      // Degree, not out-degree: the reading surfaces both directions, so the
      // number in the list has to be the number of links on the page.
      expect(entry.relations, structure.id).toBe(
        structure.depth!.relations.length + (inbound.get(structure.id) ?? 0),
      );
    }
  });

  it('does not import the catalogue it summarises', () => {
    // The index exists so the topic list can be marked before the 600KiB
    // catalogue loads. If it ever imports that catalogue the marking still
    // works and every other test here still passes — while every reader pays
    // for the prose at first paint. Comments are stripped first: the header
    // legitimately talks about `import()`.
    const source = readFileSync(new URL('../src/structure-index.ts', import.meta.url), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    expect(source).not.toMatch(/\bimport\b/);
  });

  it('stays small enough to ship in the entry chunk', () => {
    // It is eager precisely because it is three integers per structure. If it
    // ever grows prose, it belongs behind the same import() as the prose.
    expect(JSON.stringify(STRUCTURE_READING_INDEX).length).toBeLessThan(20_000);
    for (const entry of Object.values(STRUCTURE_READING_INDEX)) {
      expect(Object.keys(entry).sort()).toEqual(['fields', 'relations', 'substrates']);
    }
  });
});

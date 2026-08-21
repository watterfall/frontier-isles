import { describe, expect, it } from 'vitest';
import { SEED_STRUCTURES } from '../src/structures';
import type { SeedStructure } from '../src/structures';
import { WAVE_4_STRUCTURES } from '../src/structures-expansion-wave4';
import { WAVE_5_STRUCTURES } from '../src/structures-expansion-wave5';
import { WAVE_6_STRUCTURES } from '../src/structures-expansion-wave6';
import { WAVE_7_STRUCTURES } from '../src/structures-expansion-wave7';
import { WAVE_8_STRUCTURES } from '../src/structures-expansion-wave8';

const TOPIC_WAVES: Array<[string, SeedStructure[], number]> = [
  ['wave 4', WAVE_4_STRUCTURES, 17],
  ['wave 5', WAVE_5_STRUCTURES, 20],
  ['wave 6 · 界限', WAVE_6_STRUCTURES, 12],
  ['wave 7 · 涌现', WAVE_7_STRUCTURES, 25],
  ['wave 8 · 方法', WAVE_8_STRUCTURES, 9],
];

const authored = TOPIC_WAVES.flatMap(([, list]) => list);
const byId = new Map(SEED_STRUCTURES.map((structure) => [structure.id, structure]));
const complete = (value: { zh: string; en: string } | undefined): boolean =>
  !!value && value.zh.trim().length > 0 && value.en.trim().length > 0;

describe('the topic set, worked through', () => {
  it('lands 83 structures across five waves, at the sizes each wave claims', () => {
    for (const [name, list, size] of TOPIC_WAVES) expect(list, name).toHaveLength(size);
    // 100 topics minus the 17 that duplicated a structure already here.
    expect(authored).toHaveLength(83);
  });

  it('reaches every one of them through SEED_STRUCTURES, with no id collisions', () => {
    for (const structure of authored) expect(byId.get(structure.id), structure.id).toBe(structure);
    const ids = SEED_STRUCTURES.map((structure) => structure.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('holds the line every wave promised: no mappings, still proposed', () => {
    for (const structure of authored) {
      expect(structure.mappings, structure.id).toEqual([]);
      expect(structure.status, structure.id).toBe('proposed');
    }
  });

  it('gives each a kind, at least two quantities, and a failsWhen — in both languages', () => {
    for (const structure of authored) {
      expect(structure.kind, structure.id).toMatch(/^(regularity|method)$/);
      expect(structure.quantities?.length ?? 0, structure.id).toBeGreaterThanOrEqual(2);
      expect(complete(structure.failsWhen), structure.id).toBe(true);
      expect(complete(structure.title), structure.id).toBe(true);
      expect(complete(structure.statement), structure.id).toBe(true);
      for (const quantity of structure.quantities ?? []) {
        expect(complete(quantity.name), `${structure.id} quantity name`).toBe(true);
        expect(complete(quantity.role), `${structure.id} quantity role`).toBe(true);
      }
    }
  });

  it('never lets a statement collapse into a discipline label', () => {
    // §五: the statement is the regularity in a sentence, not the name of a
    // field. A statement shorter than its own title has stopped being one.
    for (const structure of authored) {
      expect(structure.statement.zh.length, structure.id).toBeGreaterThan(structure.title.zh.length);
      expect(structure.statement.zh.length, structure.id).toBeGreaterThanOrEqual(30);
      expect(structure.statement.en.length, structure.id).toBeGreaterThanOrEqual(60);
    }
  });

  it('keeps failsWhen distinct from statement, and out of every mapping boundary', () => {
    const fails = new Set<string>();
    for (const structure of authored) {
      expect(structure.failsWhen!.zh).not.toBe(structure.statement.zh);
      fails.add(structure.failsWhen!.zh);
    }
    // A failsWhen belongs to the structure; a boundary belongs to one substrate.
    for (const structure of SEED_STRUCTURES) {
      for (const mapping of structure.mappings) {
        expect(fails.has(mapping.boundary?.zh ?? '')).toBe(false);
      }
    }
  });

  it('cites at least three in-range corpus records for each', () => {
    // Ids run 1..1866 with 18 gaps (the retirements); 1848 is the count of
    // active records, not the ceiling. Liveness itself cannot be checked here
    // because the corpus is not vendored — verified out of band 2026-08-22.
    for (const structure of authored) {
      expect(structure.provenance.recordIds.length, structure.id).toBeGreaterThanOrEqual(3);
      for (const id of structure.provenance.recordIds) {
        expect(Number.isInteger(id) && id > 0 && id <= 1866, `${structure.id} cites XF-${id}`).toBe(true);
      }
    }
  });

  it('never cites the same record twice inside one structure', () => {
    for (const structure of authored) {
      const ids = structure.provenance.recordIds;
      expect(new Set(ids).size, structure.id).toBe(ids.length);
    }
  });

  it('splits into regularities and methods, with both well represented', () => {
    const regularity = authored.filter((structure) => structure.kind === 'regularity').length;
    const method = authored.filter((structure) => structure.kind === 'method').length;
    expect(regularity + method).toBe(authored.length);
    expect(method).toBeGreaterThanOrEqual(20);
    expect(regularity).toBeGreaterThanOrEqual(50);
  });
});

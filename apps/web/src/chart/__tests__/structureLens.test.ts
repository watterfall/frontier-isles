import { describe, it, expect } from 'vitest';
import { buildStructureLens, toAtlasLens } from '../structureLens';
import { fallbackStructures, fallbackStructureGraph } from '../../api/structureFallback';
import { SEED_STRUCTURES } from '@frontier-isles/data';

describe('buildStructureLens', () => {
  const islands = [
    { op: 'op://x/prob/firefly', x: 100, y: 100, domain: '生命', cluster: 'C10' },
    { op: 'op://x/prob/heart', x: 200, y: 120, domain: '生命', cluster: 'C10' },
    { op: 'op://x/prob/quark', x: 900, y: 400, domain: '数理', cluster: 'C33' },
  ];
  const edges = [{ structureId: 'struct://x/k', islandOp: 'op://x/prob/firefly' }];
  const frontier = [{ structureId: 'struct://x/k', rebuilt: ['op://x/prob/firefly'], gaps: ['op://x/prob/heart'] }];

  it('rebuilt islands solid, gaps dashed, unrelated dimmed', () => {
    const lens = buildStructureLens('struct://x/k', edges, frontier, islands);
    expect(lens.rebuilt.map((n) => n.op)).toEqual(['op://x/prob/firefly']);
    expect(lens.gaps.map((n) => n.op)).toEqual(['op://x/prob/heart']);
    expect(lens.dimmed).toContain('op://x/prob/quark');
  });

  it('gap nodes carry NO mapping data (honest dashed — §九 red-line)', () => {
    const lens = buildStructureLens('struct://x/k', edges, frontier, islands);
    for (const g of lens.gaps) {
      expect(Object.keys(g).sort()).toEqual(['op', 'x', 'y']);
    }
  });

  it('a 0-edge structure (标度 — pure frontier) lights nothing and dims all', () => {
    const lens = buildStructureLens('struct://x/scaling', edges, frontier, islands);
    expect(lens.rebuilt).toHaveLength(0);
    expect(lens.gaps).toHaveLength(0);
    expect(lens.dimmed).toHaveLength(islands.length);
  });

  it('arcs connect rebuilt islands only', () => {
    const twoRebuilt = [
      { structureId: 'struct://x/k', rebuilt: ['op://x/prob/firefly', 'op://x/prob/heart'], gaps: [] },
    ];
    const lens = buildStructureLens('struct://x/k', edges, twoRebuilt, islands);
    expect(lens.arcs).toHaveLength(1);
    expect(lens.arcs[0]!.fromOp).toBe('op://x/prob/firefly');
    expect(lens.arcs[0]!.toOp).toBe('op://x/prob/heart');
  });
});

describe('toAtlasLens (op graph → slug-keyed stage input)', () => {
  const stageIslands = [
    { slug: 'firefly', x: 100, y: 100, domain: '生命' },
    { slug: 'heart', x: 200, y: 120, domain: '生命' },
    { slug: 'quark', x: 900, y: 400, domain: '数理' },
  ];
  const frontier = [
    {
      structureId: 'struct://x/k',
      rebuilt: ['op://frontier-isles/prob/firefly', 'op://frontier-isles/prob/heart'],
      gaps: ['op://frontier-isles/prob/quark'],
    },
  ];

  it('maps rebuilt/gaps/arcs to bare slugs the stage can look up', () => {
    const lens = toAtlasLens('struct://x/k', [], frontier, stageIslands);
    expect(lens.rebuiltSlugs).toEqual(['firefly', 'heart']);
    expect(lens.gapSlugs).toEqual(['quark']);
    expect(lens.arcs).toEqual([{ fromSlug: 'firefly', toSlug: 'heart' }]);
  });
});

describe('structureFallback (offline twin of /api/structures*)', () => {
  it('serves the 3 seed structures in the API object shape', () => {
    const s = fallbackStructures();
    expect(s.map((x) => x.id)).toEqual(SEED_STRUCTURES.map((x) => x.id));
    expect(s.every((x) => x.schema === 'opp/0.3' && x.title.zh && x.statement.en)).toBe(true);
  });

  it('graph edges mirror the seed mappings 1:1 (no edge without an event — inv 14)', () => {
    const g = fallbackStructureGraph();
    const mappingCount = SEED_STRUCTURES.reduce((n, s) => n + s.mappings.length, 0);
    expect(g.edges).toHaveLength(mappingCount);
    expect(g.edges.every((e) => e.weight === 1 && e.actors.includes('github:shen-kuo'))).toBe(true);
  });

  it('synchronization lights self-learning-matter and exposes honest near gaps', () => {
    const g = fallbackStructureGraph();
    const f = g.frontier.find((x) => x.structureId === 'struct://xfrontier/synchronization');
    expect(f?.rebuilt).toContain('op://frontier-isles/prob/self-learning-matter');
    expect(f && f.gaps.length).toBeGreaterThan(0);
  });

  it('标度 (0 mappings) has NO frontier entry — a pure frontier, nothing invented', () => {
    const g = fallbackStructureGraph();
    expect(g.frontier.find((x) => x.structureId === 'struct://xfrontier/scaling')).toBeUndefined();
    expect(g.edges.some((e) => e.structureId === 'struct://xfrontier/scaling')).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import { buildStructureLens } from '../structureLens';

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

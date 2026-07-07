import { describe, it, expect } from 'vitest';
import { generate } from '../scene/generator';

describe('scene generator', () => {
  it('is deterministic — same slug yields the same scene', () => {
    const a = generate({ slug: 'living-wires', domain: '物质', stage: 3, members: 14, dormant: false, status: 'active', outlier: false, tide: 2, hasAi: true, eventCount: 10 });
    const b = generate({ slug: 'living-wires', domain: '物质', stage: 3, members: 14, dormant: false, status: 'active', outlier: false, tide: 2, hasAi: true, eventCount: 10 });
    expect(a).toEqual(b);
  });

  it('different slugs yield different scenery/residents', () => {
    const a = generate({ slug: 'living-wires', domain: '物质', stage: 3, members: 14, dormant: false, status: 'active', outlier: false });
    const b = generate({ slug: 'minimal-genome', domain: '生命', stage: 2, members: 8, dormant: false, status: 'active', outlier: false });
    expect(a.scenery).not.toEqual(b.scenery);
    expect(a.domain).not.toBe(b.domain);
  });

  it('stage 0 shows only questions + dock; academy shows all 9', () => {
    const empty = generate({ slug: 'x', domain: '数理', stage: 0, members: 0, dormant: true, status: 'open', outlier: false });
    const visible0 = empty.stations.filter((s) => s.visible).map((s) => s.kind);
    expect(visible0).toEqual(expect.arrayContaining(['questions', 'dock']));
    expect(visible0).toHaveLength(2);

    const academy = generate({ slug: 'x', domain: '数理', stage: 2, members: 5, dormant: false, status: 'active', outlier: false });
    const visible2 = academy.stations.filter((s) => s.visible);
    expect(visible2).toHaveLength(9);
  });

  it('dissolved islands have no residents; active islands synthesize from members', () => {
    const dissolved = generate({ slug: 'x', domain: '生命', stage: 1, members: 5, dormant: false, status: 'dissolved', outlier: false });
    expect(dissolved.residents).toEqual([]);

    const active = generate({ slug: 'x', domain: '生命', stage: 2, members: 4, dormant: false, status: 'active', outlier: false, hasAi: true });
    expect(active.residents.length).toBeGreaterThanOrEqual(4); // 4 humans + 1 AI
    expect(active.residents.some((r) => r.kind === 'ai')).toBe(true);
  });

  it('ghosts are ledger-driven (no events → no ghosts; more events → more ghosts)', () => {
    const none = generate({ slug: 'x', domain: '交叉', stage: 1, members: 2, dormant: false, status: 'active', outlier: false, eventCount: 0 });
    expect(none.ghosts).toEqual([]);

    const few = generate({ slug: 'x', domain: '交叉', stage: 2, members: 5, dormant: false, status: 'active', outlier: false, eventCount: 10 });
    expect(few.ghosts.length).toBeGreaterThanOrEqual(1);
    expect(few.ghosts.length).toBeLessThanOrEqual(2);

    const many = generate({ slug: 'x', domain: '交叉', stage: 3, members: 9, dormant: false, status: 'active', outlier: false, eventCount: 20 });
    expect(many.ghosts).toHaveLength(3);
    // thresholds are ordered
    expect(many.ghosts[0]!.threshold).toBeLessThanOrEqual(many.ghosts[1]!.threshold);
  });

  it('domain biomes differ — 生命 is verdant (lotus + 8 trees), 数理 is sparse', () => {
    const life = generate({ slug: 'x', domain: '生命', stage: 2, members: 5, dormant: false, status: 'active', outlier: false });
    const math = generate({ slug: 'x', domain: '数理', stage: 2, members: 5, dormant: false, status: 'active', outlier: false });
    const lifeTrees = life.scenery.filter((s) => s.kind === 'tree').length;
    const mathTrees = math.scenery.filter((s) => s.kind === 'tree').length;
    expect(lifeTrees).toBeGreaterThan(mathTrees);
    expect(life.scenery.some((s) => s.kind === 'lotus')).toBe(true);
  });
});

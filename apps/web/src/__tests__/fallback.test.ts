import { describe, it, expect } from 'vitest';
import { DATA, QUESTIONS, STN, RITQ, DRIFT, BRIEF, AUTHQ } from '../api/fallback';

describe('fallback data matches the curated atlas', () => {
  it('has 27 chart islands (26 curated frontiers + 1 bespoke sample)', () => {
    expect(DATA).toHaveLength(27);
  });

  it('has 7 Question-Wall questions', () => {
    expect(QUESTIONS).toHaveLength(7);
  });

  it('marks exactly one sample island (「AI 之问」, slug machine-curiosity)', () => {
    const sample = DATA.filter((d) => d.sample);
    expect(sample).toHaveLength(1);
    expect(sample[0]!.n).toBe('AI 之问');
    expect(sample[0]!.slug).toBe('machine-curiosity');
    expect(sample[0]!.q).toBe('AI 能否提出一个人类没想到的好问题？');
  });

  it('marks two dormant and one outlier island', () => {
    expect(DATA.filter((d) => d.dor)).toHaveLength(2);
    expect(DATA.filter((d) => d.out)).toHaveLength(1);
    expect(DATA.find((d) => d.out)!.n).toBe('暗仪器化');
  });

  it('spot-checks a curated frontier (living wires #7, highest activity)', () => {
    const hi = DATA.find((d) => d.id === 7)!;
    expect(hi.n).toBe('活体导线');
    expect(hi.st).toBe(3);
    expect(hi.m).toBe(14);
    expect(hi.a).toBe(88);
    expect(hi.slug).toBe('living-wires');
    expect(hi.d).toBe('物质');
  });

  it('every curated frontier carries a slug (enterable)', () => {
    for (const d of DATA) {
      expect(d.slug, `island #${d.id} (${d.n}) missing slug`).toBeTruthy();
    }
  });

  it('question 2 is a rewrite with the prototype vote count', () => {
    const q2 = QUESTIONS[1]!;
    expect(q2.rw).toBe(true);
    expect(q2.orig).toBe('现有基准能测出提问能力吗？');
    expect(q2.votes).toBe(8);
  });

  it('carries the 8 list-twin stations, 5 ritual candidates, 4 driftwood, 3 briefs, 7 authors', () => {
    expect(STN).toHaveLength(8);
    expect(RITQ).toHaveLength(5);
    expect(DRIFT).toHaveLength(4);
    expect(BRIEF).toHaveLength(3);
    expect(AUTHQ).toHaveLength(7);
  });
});

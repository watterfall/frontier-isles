import { describe, it, expect } from 'vitest';
import { DATA, QUESTIONS, STN, RITQ, DRIFT, BRIEF, AUTHQ } from '../api/fallback';

describe('fallback data matches the curated atlas', () => {
  it('has 79 chart islands (78 curated frontiers + 1 bespoke sample)', () => {
    expect(DATA).toHaveLength(79);
  });

  it('has 7 Question-Wall questions', () => {
    expect(QUESTIONS).toHaveLength(7);
  });

  it('marks exactly one sample island (「AI 之问」, slug machine-curiosity)', () => {
    const sample = DATA.filter((d) => d.sample);
    expect(sample).toHaveLength(1);
    expect(sample[0]!.n.zh).toBe('AI 之问');
    expect(sample[0]!.slug).toBe('machine-curiosity');
    expect(sample[0]!.q.zh).toBe('AI 能否提出一个人类没想到的好问题？');
  });

  it('marks two dormant and one outlier island', () => {
    expect(DATA.filter((d) => d.dor)).toHaveLength(2);
    expect(DATA.filter((d) => d.out)).toHaveLength(1);
    expect(DATA.find((d) => d.out)!.n.zh).toBe('暗仪器化');
  });

  it('spot-checks a curated frontier (living wires #7, highest activity)', () => {
    const hi = DATA.find((d) => d.id === 7)!;
    expect(hi.n.zh).toBe('活体导线');
    expect(hi.st).toBe(3);
    expect(hi.m).toBe(14);
    expect(hi.a).toBe(88);
    expect(hi.slug).toBe('living-wires');
    expect(hi.d).toBe('物质');
  });

  it('marks no curated island resolved — every atlas frontier is genuinely open', () => {
    // The lighthouse-if-resolved mechanism (L0 fingerprint) is wired and
    // rendered from `res`, but none of the curated frontiers has actually been
    // resolved, so hand-authoring the flag would be editorial fabrication.
    // The first lighthouse must be earned by a real resolution.
    expect(DATA.every((d) => !d.res)).toBe(true);
  });

  it('every curated frontier carries a slug (enterable)', () => {
    for (const d of DATA) {
      expect(d.slug, `island #${d.id} (${d.n.zh}) missing slug`).toBeTruthy();
    }
  });

  it('every curated frontier carries grounded depth (opening an island is never empty)', () => {
    for (const d of DATA) {
      if (d.sample) continue; // the bespoke sample carries a full L1 scene instead
      const dp = d.depth;
      expect(dp, `island #${d.id} (${d.n.zh}) missing depth`).toBeTruthy();
      expect(dp!.overview.zh && dp!.overview.en, `#${d.id} overview`).toBeTruthy();
      expect(dp!.whyMatters.zh && dp!.ifAnswered.zh && dp!.barrier.zh, `#${d.id} depth text`).toBeTruthy();
      expect(dp!.approaches.length, `#${d.id} approaches`).toBeGreaterThanOrEqual(2);
      expect(dp!.subQuestions.length, `#${d.id} subQuestions`).toBeGreaterThanOrEqual(2);
    }
  });

  it('question 2 is a rewrite with the prototype vote count', () => {
    const q2 = QUESTIONS[1]!;
    expect(q2.rw).toBe(true);
    expect(q2.orig?.zh).toBe('现有基准能测出提问能力吗？');
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

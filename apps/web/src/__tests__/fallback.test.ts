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

describe('flagship island interiors (rich station content)', () => {
  const FLAGSHIPS = [
    // 数理
    'formal-math', 'causal-rep-learning', 'tabletop-quantum-gravity',
    // 物质
    'artificial-photosynthesis', 'living-wires', 'self-learning-matter',
    // 生命
    'minimal-genome', 'active-inference', 'genome-writing',
    // 交叉
    'animal-ai-decode', 'verified-pqc', 'ai-theory-discovery',
  ];
  const bilingual = (o: unknown): boolean =>
    !!o && typeof (o as { zh?: unknown }).zh === 'string' && typeof (o as { en?: unknown }).en === 'string'
    && !!(o as { zh: string }).zh && !!(o as { en: string }).en;

  it('exactly the 12 curated flagships carry an interior', () => {
    const withInterior = DATA.filter((d) => d.interior).map((d) => d.slug).sort();
    expect(withInterior).toEqual([...FLAGSHIPS].sort());
  });

  it('every flagship interior is well-formed and bilingual, with real citations', () => {
    for (const slug of FLAGSHIPS) {
      const d = DATA.find((x) => x.slug === slug)!;
      expect(d, `${slug} present`).toBeTruthy();
      // A rich island reads as an academy/school — never empty/hut.
      expect(d.st, `${slug} stage ≥ 2`).toBeGreaterThanOrEqual(2);
      const it = d.interior!;
      expect(it.questions.length, `${slug} questions`).toBeGreaterThanOrEqual(5);
      expect(it.digests.length, `${slug} digests`).toBeGreaterThanOrEqual(3);
      expect(it.debates.length, `${slug} debates`).toBeGreaterThanOrEqual(2);
      expect(it.data.length, `${slug} data`).toBeGreaterThanOrEqual(3);
      expect(it.driftwood.length, `${slug} driftwood`).toBeGreaterThanOrEqual(3);
      expect(it.residents.length, `${slug} residents`).toBeGreaterThanOrEqual(3);
      for (const q of it.questions) {
        expect(bilingual(q.text) && bilingual(q.author), `${slug} question bilingual`).toBe(true);
        expect(typeof q.open === 'boolean' && typeof q.votes === 'number', `${slug} question fields`).toBe(true);
      }
      for (const dg of it.digests) {
        expect(bilingual(dg.title) && bilingual(dg.gist), `${slug} digest bilingual`).toBe(true);
        if (dg.cite) {
          expect(dg.cite.title && dg.cite.venue && typeof dg.cite.year === 'number', `${slug} cite`).toBeTruthy();
        }
      }
      for (const db of it.debates) {
        expect(bilingual(db.topic) && db.positions.every(bilingual), `${slug} debate`).toBe(true);
        expect(db.positions.length, `${slug} debate positions`).toBeGreaterThanOrEqual(2);
      }
      for (const r of it.residents) {
        expect(typeof r.name === 'string' && !!r.name, `${slug} resident name`).toBe(true);
        expect(r.kind === 'human' || r.kind === 'ai', `${slug} resident kind`).toBe(true);
        expect(bilingual(r.caption), `${slug} resident caption`).toBe(true);
      }
    }
  });

  it('at least one flagship per domain (数理/物质/生命/交叉)', () => {
    const domains = new Set(DATA.filter((d) => d.interior).map((d) => d.d));
    expect(domains).toEqual(new Set(['数理', '物质', '生命', '交叉']));
  });
});

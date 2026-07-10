import { describe, it, expect } from 'vitest';
import { computeCardContent, cardBoxPos } from '../cardContent';
import { DATA } from '../../../api/fallback';

const t = (key: string, opts?: Record<string, unknown>) => (opts ? `${key}(${JSON.stringify(opts)})` : key);

describe('computeCardContent — extracted from ChartScreen (no behavior change)', () => {
  it('reads the requested language and zero-pads the id', () => {
    const d = DATA[0]!;
    const c = computeCardContent(d, 'zh', t);
    expect(c.id).toBe(String(d.id).padStart(2, '0'));
    expect(c.q).toBe(d.q.zh);
    expect(c.act).toBe(d.a);
    expect(c.m).toBe(d.m);
  });

  it('an outlier gets the outlier domain colour and outlier hint', () => {
    const d = { ...DATA[0]!, out: true };
    const c = computeCardContent(d, 'zh', t);
    expect(c.domCol).toBe('#8A6A1E');
    expect(c.hint).toContain('hintOutlier');
  });

  it('a non-outlier gets the enter hint', () => {
    const d = { ...DATA[0]!, out: false };
    const c = computeCardContent(d, 'zh', t);
    expect(c.hint).toContain('hintEnter');
  });
});

describe('cardBoxPos — the card clamp/flip, shared by SVG chart and atlas', () => {
  it('clamps left within [16, 1160]', () => {
    expect(cardBoxPos(0, 100).left).toBe(16);
    expect(cardBoxPos(2000, 100).left).toBe(1160);
  });

  it('flips the card above the anchor when it would run off the bottom', () => {
    expect(cardBoxPos(500, 700).top).toBe(700 - 260);
    expect(cardBoxPos(500, 100).top).toBe(100 + 62);
  });
});

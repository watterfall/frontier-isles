import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SeaLayer, currentSalience, whirlpoolSalience, currentFilter, SALIENCE } from '../components/chart/SeaLayer';
import { fixtureSeaData } from '../api/seaFallback';
import type { ApiCurrent } from '../api/client';

const OP = (slug: string) => `op://frontier-isles/prob/${slug}`;
const svg = (node: React.ReactNode) => renderToStaticMarkup(<svg viewBox="0 0 1440 900">{node}</svg>);

const sea = fixtureSeaData();
const layer = (focus: string | null, night = false) =>
  svg(<SeaLayer currents={sea.currents} whirlpools={sea.whirlpools} islands={sea.islands} focusedIslandId={focus} night={night} />);

describe('fixtureSeaData — the server-absent sea is real, not empty (E5)', () => {
  it('synthesizes real cross-island relations over actual chart slugs', () => {
    expect(sea.currents.length).toBeGreaterThan(0);
    expect(sea.whirlpools.length).toBeGreaterThan(0);
    for (const c of sea.currents) expect(c.from).not.toBe(c.to);
    // both epistemic signs survive the fallback projection
    const signs = new Set(sea.currents.map((c) => c.sign));
    expect(signs.has('affirm') && signs.has('contest')).toBe(true);
    // every current references a placed island (so the SeaLayer can lay it out)
    const ops = new Set(sea.islands.map((i) => i.op));
    for (const c of sea.currents) expect(ops.has(c.from) && ops.has(c.to)).toBe(true);
  });
});

describe('salience floors — SALIENCE not PRESENCE (E2)', () => {
  const contest: Pick<ApiCurrent, 'from' | 'to' | 'sign'> = { from: OP('a'), to: OP('b'), sign: 'contest' };
  const affirm: Pick<ApiCurrent, 'from' | 'to' | 'sign'> = { from: OP('a'), to: OP('b'), sign: 'affirm' };
  const other = OP('zzz');

  it('a dispute keeps a HIGHER floor than support, and nothing hits zero', () => {
    expect(currentSalience(contest, other)).toBe(SALIENCE.floorContest);
    expect(currentSalience(affirm, other)).toBe(SALIENCE.floorSupport);
    expect(SALIENCE.floorContest).toBeGreaterThan(SALIENCE.floorSupport);
    // the exact ship values (design-system/22): dispute floor ≥ 0.58, support 0.20
    expect(SALIENCE.floorContest).toBeGreaterThanOrEqual(0.58);
    expect(whirlpoolSalience({ between: [OP('a'), OP('b')] }, other)).toBe(SALIENCE.floorWhirlpool);
    expect(SALIENCE.floorWhirlpool).toBeGreaterThanOrEqual(0.58);
    expect(SALIENCE.floorSupport).toBeGreaterThan(0); // never removed
  });

  it('a focused island lifts its touching relations to full', () => {
    expect(currentSalience(contest, OP('a'))).toBe(SALIENCE.focused);
    expect(SALIENCE.focused).toBe(1);
  });

  it('floors are LIVE-tweakable params (currentSalience honors overrides)', () => {
    const floors = { support: 0.5, contest: 0.91, whirlpool: 0.99 };
    expect(currentSalience(affirm, other, floors)).toBe(0.5);
    expect(currentSalience(contest, other, floors)).toBe(0.91);
    // the shipped default aligns with the product (focusDim ~0.14, contest ~0.55–0.58)
    expect(SALIENCE.floorSupport).toBeCloseTo(0.14);
    expect(SALIENCE.floorContest).toBeGreaterThanOrEqual(0.55);
  });

  it('dimmed ≠ absent: an unfocused contest still renders its tee head and ⊗ is present', () => {
    // focus an island unrelated to any contest current
    const markup = layer(OP('formal-math'));
    expect(markup).toContain('url(#fi-tee-contest)'); // contest head still drawn
    expect(markup).toContain('⊗'); // whirlpool glyph still drawn
  });

  it('desaturate is variant B: dims SUPPORT only, never a contest; focus glows own hue', () => {
    expect(currentFilter({ sign: 'affirm', kind: 'evidence' }, false, true)).toBe('saturate(.15)');
    expect(currentFilter({ sign: 'contest', kind: 'evidence' }, false, true)).toBeUndefined(); // dispute keeps colour
    const glow = currentFilter({ sign: 'affirm', kind: 'lineage' }, true, false);
    expect(glow).toContain('drop-shadow');
    expect(glow).toContain('--fi-malachite'); // own-kind hue
  });
});

describe('parity — {SeaLayer} ∪ {RelationsList} == full set for any focus (E3)', () => {
  it('no current or whirlpool is ever removed by focus (salience > 0 always)', () => {
    const foci = [null, ...sea.islands.map((i) => i.op)];
    for (const f of foci) {
      for (const c of sea.currents) expect(currentSalience(c, f)).toBeGreaterThan(0);
      for (const w of sea.whirlpools) expect(whirlpoolSalience(w, f)).toBeGreaterThan(0);
    }
  });

  it('focus never REMOVES a current path (the unique geometry set is unchanged)', () => {
    // focus may ADD a luminous halo (same d), but must never drop a flowline.
    const dSet = (m: string) => new Set(m.match(/ d="M[^"]*"/g) ?? []);
    const unfocused = dSet(layer(null));
    const focused = dSet(layer(OP('living-wires')));
    for (const d of unfocused) expect(focused.has(d)).toBe(true);
    expect(focused.size).toBe(unfocused.size);
  });
});

describe('bidirectional focus — chart click and list click set the same id (E4)', () => {
  it('opOf(slug) equals the island op the RelationsList emits, so both paths agree', () => {
    for (const i of sea.islands) {
      const slug = i.op.split('/').pop()!;
      expect(OP(slug)).toBe(i.op); // the join key is identical on both sides
    }
  });
});

describe('rendering gotcha defense — every token ref carries a hex fallback', () => {
  it('no bare var(--fi-*) can black-render through a <use>/attribute boundary', () => {
    // the design product hit solid-black islands from `fill="var(--x)"` (no fallback)
    // not resolving through <use>. Our sea layer only ever uses var(--x, #hex).
    const markup = layer(OP('living-wires')); // focus on → exercises the glow filter too
    const bare = markup.match(/var\(--[a-z0-9-]+\)/gi); // var(--x) with NO fallback
    expect(bare).toBeNull();
  });
});

describe('day/night is palette-only on the wired SeaLayer (E6)', () => {
  it('geometry is byte-identical; night only swaps the water via NIGHT_SCENE_VARS', () => {
    const dayGeom = (layer(null, false).match(/ d="[^"]*"/g) ?? []).join('|');
    const nightGeom = (layer(null, true).match(/ d="[^"]*"/g) ?? []).join('|');
    expect(dayGeom).toBe(nightGeom); // shapes identical
    expect(layer(null, true)).toContain('#26375C'); // night water override applied on the root
    expect(layer(null, false)).not.toContain('#26375C'); // day has no override
  });
});

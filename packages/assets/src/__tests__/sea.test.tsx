import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { ClimateField, CLIMATE_ANCHOR_TOKENS } from '../sea/ClimateField';
import { SeaDepth } from '../sea/SeaDepth';
import { Current, CurrentDefs, CURRENT_STYLE, currentWidth } from '../sea/Current';
import { FlowLegend } from '../sea/FlowLegend';
import {
  RelationsList,
  filterRelations,
  islandLabel,
  relationPhrase,
  type RelationCurrent,
  type RelationWhirlpool,
} from '../sea/RelationsList';
import { NIGHT_SCENE_VARS } from '../palettes';

function svg(children: React.ReactNode) {
  return renderToStaticMarkup(<svg viewBox="0 0 1440 900">{children}</svg>);
}

describe('ClimateField (气候带 — hue only)', () => {
  it('paints the four --fi-domain-* anchors and a token water base — no literal hue', () => {
    const markup = svg(<ClimateField />);
    for (const a of CLIMATE_ANCHOR_TOKENS) expect(markup).toContain(`var(${a.token},`);
    // base water reads --water first so NIGHT_SCENE_VARS repaints it
    expect(markup).toContain('var(--water, var(--fi-water, #C8D8E4))');
  });

  it('carries only hue — no ink/value channel bleeds into the climate band', () => {
    const markup = svg(<ClimateField />);
    // depth (value) lives in <SeaDepth>, never here
    expect(markup).not.toContain('--fi-ink');
  });

  it('is palette-only for day/night: geometry is invariant, only --water flips', () => {
    // The component has no night branch — its markup is identical regardless of the
    // scene-root vars, so night is purely a CSS custom-property swap.
    const a = svg(<ClimateField />);
    const b = svg(<ClimateField />);
    expect(a).toBe(b);
    // and NIGHT_SCENE_VARS changes the *value* of the water token, not the shape
    expect(NIGHT_SCENE_VARS['--water']).toBeDefined();
    expect(NIGHT_SCENE_VARS['--water']).not.toBe('#C8D8E4');
    // no baked-in night colour leaked into the geometry
    expect(a).not.toContain('#26375C');
  });
});

describe('SeaDepth (水深 — value channel, hue-less by construction)', () => {
  const wells = [{ cx: 100, cy: 100, r: 60, value: 0.4 }];

  it('paints darkness on --fi-ink and isobaths on --fi-ink-2 — never a hue token', () => {
    const markup = svg(<SeaDepth wells={wells} isobaths />);
    expect(markup).toContain('var(--fi-ink, #2B2620)'); // value/darkness
    expect(markup).toContain('var(--fi-ink-2, #6B6154)'); // isobath contours
    // orthogonality: no domain/current hue ever appears in the depth layer
    expect(markup).not.toContain('--fi-domain');
    expect(markup).not.toContain('--fi-azurite');
    expect(markup).not.toContain('--fi-ochre');
  });

  it('refuses a hue prop at the type boundary (compile-time orthogonality guard)', () => {
    // If SeaDepth ever grows a colour/hue prop, this @ts-expect-error goes unused
    // and the typecheck gate fails — the invariant is enforced in code, not prose.
    // @ts-expect-error — depth is value-only; a hue prop must not be assignable.
    const bad = <SeaDepth wells={wells} color="#B5673A" />;
    expect(bad).toBeTruthy();
  });
});

describe('Current (洋流 flowline)', () => {
  it('colours by relation type from the token palette', () => {
    expect(svg(<Current d="M0 0 L10 0" kind="evidence" weight={2} />)).toContain('var(--fi-azurite, #2E5E8C)');
    expect(svg(<Current d="M0 0 L10 0" kind="bridge" weight={2} />)).toContain('var(--fi-ochre, #B5673A)');
    expect(svg(<Current d="M0 0 L10 0" kind="lineage" weight={2} />)).toContain('var(--fi-malachite, #3E9B7E)');
  });

  it('dash encodes KIND only — maturity never touches the dash axis', () => {
    const dashes = (['evidence', 'bridge', 'lineage'] as const).map((k) => CURRENT_STYLE[k].dash);
    expect(new Set(dashes).size).toBe(3);
    expect(svg(<Current d="M0 0 L10 0" kind="evidence" weight={2} />)).toContain('stroke-dasharray="1 5"');
    expect(svg(<Current d="M0 0 L10 0" kind="lineage" weight={2} />)).toContain('stroke-dasharray="7 5"');
    // a proposed bridge keeps the bridge (solid) dash — no "4 4" collision anymore
    const proposed = svg(<Current d="M0 0 L10 0" kind="bridge" weight={4} maturity="proposed" />);
    expect(proposed).not.toContain('stroke-dasharray');
  });

  it('distinguishes affirm vs contest by HEAD SHAPE, not colour (deuteranope-safe)', () => {
    // both are azurite evidence; only the head differs — arrow vs inhibition tee
    const affirm = svg(<Current d="M0 0 L10 0" kind="evidence" sign="affirm" weight={2} directed />);
    const contest = svg(<Current d="M0 0 L10 0" kind="evidence" sign="contest" weight={2} directed />);
    expect(affirm).toContain('url(#fi-arrow-affirm)');
    expect(contest).toContain('url(#fi-tee-contest)');
    expect(affirm).toContain('var(--fi-azurite, #2E5E8C)');
    expect(contest).toContain('var(--fi-azurite, #2E5E8C)'); // same hue
    expect(affirm).not.toContain('fi-tee-contest'); // the head is the only difference
  });

  it('an undirected (bridge) current carries no head', () => {
    expect(svg(<Current d="M0 0 L10 0" kind="bridge" sign="neutral" weight={2} directed={false} />)).not.toContain('marker-end');
  });

  it('maturity rides the OPACITY axis: proposed faint, ratified solid', () => {
    const proposed = svg(<Current d="M0 0 L10 0" kind="bridge" weight={4} maturity="proposed" />);
    const ratified = svg(<Current d="M0 0 L10 0" kind="bridge" weight={4} maturity="ratified" />);
    expect(proposed).toContain('opacity="0.5"');
    expect(ratified).toContain('opacity="0.85"');
    expect(currentWidth(1)).toBeLessThan(currentWidth(5));
  });

  it('is static by default (T1) and drifts only when animated', () => {
    expect(svg(<Current d="M0 0 L10 0" kind="lineage" weight={2} />)).not.toContain('waveDrift');
    expect(svg(<Current d="M0 0 L10 0" kind="lineage" weight={2} animated />)).toContain('waveDrift');
  });
});

describe('FlowLegend (流例)', () => {
  const markup = svg(<FlowLegend x={10} y={10} />);

  it('states the honest encoding key and every relation type', () => {
    expect(markup).toContain('类型');
    expect(markup).toContain('立场'); // the sign channel is spelled out
    expect(markup).toContain(CURRENT_STYLE.evidence.label);
    expect(markup).toContain(CURRENT_STYLE.bridge.label);
    expect(markup).toContain(CURRENT_STYLE.lineage.label);
  });

  it('shows both non-colour channels — dash for kind, head for sign', () => {
    expect(markup).toContain('stroke-dasharray="1 5"'); // evidence dotted (kind)
    expect(markup).toContain('stroke-dasharray="7 5"'); // lineage dashed (kind)
    expect(markup).toContain('url(#fi-arrow-affirm)'); // supports
    expect(markup).toContain('url(#fi-tee-contest)'); // disputes
    expect(markup).toContain('proposed'); // opacity-based maturity note
  });
});

describe('CurrentDefs', () => {
  it('defines context-stroke sign markers so one set serves every hue', () => {
    const markup = svg(<CurrentDefs />);
    expect(markup).toContain('id="fi-arrow-affirm"');
    expect(markup).toContain('id="fi-tee-contest"');
    expect(markup).toContain('id="fi-arrow-open"');
    expect(markup).toContain('context-stroke');
  });
});

describe('RelationsList (关系列表 — invariant-5 list twin + focus reading)', () => {
  const R = 'op://x/prob/riemann';
  const F = 'op://x/prob/folding';
  const C = 'op://x/prob/coherence';
  const ISLANDS = [
    { op: R, name: 'riemann' },
    { op: F, name: 'folding' },
    { op: C, name: 'coherence' },
  ];
  const CURRENTS: RelationCurrent[] = [
    { from: R, to: F, kind: 'evidence', sign: 'affirm', weight: 1, directed: true },
    { from: R, to: F, kind: 'evidence', sign: 'contest', weight: 1, directed: true },
    { from: R, to: C, kind: 'evidence', sign: 'contest', weight: 1, directed: true },
    { from: C, to: F, kind: 'bridge', sign: 'neutral', weight: 1, directed: false, maturity: 'proposed' },
  ];
  const WHIRLPOOLS: RelationWhirlpool[] = [{ between: [R, C], weight: 1 }];
  const rowCount = (markup: string) => (markup.match(/data-relrow=/g) ?? []).length;

  it('gives every current AND whirlpool its own row (spatial ↔ list parity)', () => {
    const markup = renderToStaticMarkup(
      <RelationsList currents={CURRENTS} whirlpools={WHIRLPOOLS} islands={ISLANDS} />,
    );
    expect(rowCount(markup)).toBe(CURRENTS.length + WHIRLPOOLS.length);
  });

  it('conveys support vs dispute in WORDS, so the text twin cannot lie', () => {
    const markup = renderToStaticMarkup(
      <RelationsList currents={CURRENTS} whirlpools={WHIRLPOOLS} islands={ISLANDS} />,
    );
    expect(markup).toContain('affirms');
    expect(markup).toContain('contests');
    expect(markup).toContain('disputed'); // whirlpool row
    expect(markup).toContain('invariant 5');
  });

  it('focus filter returns exactly the relations touching that op (pure)', () => {
    const onFolding = filterRelations(CURRENTS, WHIRLPOOLS, F);
    expect(onFolding.currents).toHaveLength(3); // affirm R→F, contest R→F, bridge C→F
    expect(onFolding.currents.every((c) => c.from === F || c.to === F)).toBe(true);
    expect(onFolding.whirlpools).toHaveLength(0); // the R↔C dispute doesn't touch folding

    const onRiemann = filterRelations(CURRENTS, WHIRLPOOLS, R);
    expect(onRiemann.currents).toHaveLength(3);
    expect(onRiemann.whirlpools).toHaveLength(1); // R↔C dispute
  });

  it('a focused list renders only the focused rows', () => {
    const markup = renderToStaticMarkup(
      <RelationsList currents={CURRENTS} whirlpools={WHIRLPOOLS} islands={ISLANDS} focusedIslandId={F} />,
    );
    expect(rowCount(markup)).toBe(3);
    expect(markup).toContain('聚焦');
  });

  it('helpers: islandLabel strips to the slug; relationPhrase carries the sign', () => {
    expect(islandLabel(R)).toBe('riemann');
    expect(relationPhrase('evidence', 'affirm').verb).toBe('affirms');
    expect(relationPhrase('evidence', 'contest').verb).toBe('contests');
    expect(relationPhrase('lineage', 'neutral').verb).toBe('forks');
    expect(relationPhrase('bridge', 'neutral').verb).toBe('bridges');
  });
});

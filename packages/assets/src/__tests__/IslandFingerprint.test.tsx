import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { IslandFingerprint } from '../chart/IslandFingerprint';
import { hashSeed } from '../chart/islandSilhouette';

// IslandFingerprint needs no `url(#...)` refs from <SceneDefs>, and SceneDefs
// itself carries a `<path>` (isogrid) and the same #E3A93C gamboge fallback
// used by <Lighthouse> — including it here would contaminate the assertions
// below, so this suite renders the component bare.
function svg(children: React.ReactNode) {
  return renderToStaticMarkup(<svg viewBox="0 0 1440 900">{children}</svg>);
}

describe('IslandFingerprint', () => {
  const seed = hashSeed('living-wires');

  it('renders the data-driven fill on the base landmass path', () => {
    const markup = svg(<IslandFingerprint domain="物质" stage={2} seed={seed} fill="#E8CFAE" />);
    expect(markup).toContain('#E8CFAE');
  });

  it('grows a second terrace only at stage 3 (school), not below', () => {
    const hut = svg(<IslandFingerprint domain="生命" stage={1} seed={seed} fill="#C6DECC" />);
    const school = svg(<IslandFingerprint domain="生命" stage={3} seed={seed} fill="#C6DECC" />);
    expect((hut.match(/<path/g) ?? []).length).toBe(1);
    expect((school.match(/<path/g) ?? []).length).toBe(2);
  });

  it('flies a lighthouse only when explicitly resolved', () => {
    const unresolved = svg(<IslandFingerprint domain="数理" stage={2} seed={seed} fill="#C9D8E6" />);
    const resolved = svg(<IslandFingerprint domain="数理" stage={2} seed={seed} fill="#C9D8E6" lighthouse />);
    expect(unresolved).not.toContain('#E3A93C');
    expect(resolved).toContain('#E3A93C');
  });

  it('is deterministic — identical props render identical markup', () => {
    const a = svg(<IslandFingerprint domain="交叉" stage={3} seed={seed} fill="#ECDFB4" lighthouse />);
    const b = svg(<IslandFingerprint domain="交叉" stage={3} seed={seed} fill="#ECDFB4" lighthouse />);
    expect(a).toBe(b);
  });
});

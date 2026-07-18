import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DOMAIN_COLORS } from '../palettes';

/**
 * WCAG AA contrast gate (ROADMAP §3.15 "small atlas/lens labels … below AA").
 * Domain inks label islands/regions over the paper family; the secondary ink
 * annotates over paper AND the darker body wash. If a palette tweak drops a
 * text-bearing ink under 4.5:1 on its lightest-to-darkest label surfaces,
 * this fails before any eyeball does.
 */

const tokensCss = readFileSync(fileURLToPath(new URL('../tokens.css', import.meta.url)), 'utf8');

function luminance(hex: string): number {
  const channel = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channel[0]! + 0.7152 * channel[1]! + 0.0722 * channel[2]!;
}

function contrast(fg: string, bg: string): number {
  const [a, b] = [luminance(fg), luminance(bg)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const PAPER = '#F2EAD8';
const PAPER_RAISED = '#FAF5E8';
const BODY = '#E4DAC2';

describe('contrast gate — WCAG AA', () => {
  it('every domain ink reads at AA (≥4.5) on the paper label surface', () => {
    for (const [domain, { ink }] of Object.entries(DOMAIN_COLORS)) {
      const ratio = contrast(ink, PAPER);
      expect(ratio, `${domain} ink ${ink} on ${PAPER} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('tokens.css domain inks mirror DOMAIN_COLORS (no drift between css and ts)', () => {
    expect(tokensCss).toContain(`--fi-domain-math-ink: ${DOMAIN_COLORS.数理.ink}`);
    expect(tokensCss).toContain(`--fi-domain-matter-ink: ${DOMAIN_COLORS.物质.ink}`);
    expect(tokensCss).toContain(`--fi-domain-life-ink: ${DOMAIN_COLORS.生命.ink}`);
    expect(tokensCss).toContain(`--fi-domain-cross-ink: ${DOMAIN_COLORS.交叉.ink}`);
  });

  it('secondary ink --fi-ink-2 reads at AA on paper, raised paper, and body wash', () => {
    const ink2 = tokensCss.match(/--fi-ink-2:\s*(#[0-9A-Fa-f]{6})/)?.[1];
    expect(ink2).toBeTruthy();
    for (const bg of [PAPER, PAPER_RAISED, BODY]) {
      const ratio = contrast(ink2!, bg);
      expect(ratio, `--fi-ink-2 ${ink2} on ${bg} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

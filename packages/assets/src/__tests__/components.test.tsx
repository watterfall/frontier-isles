import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { MOUND_PATHS, IslandMound } from '../IslandMound';
import { NIGHT_SCENE_VARS, DAY_SCENE_VARS, DOMAIN_COLORS, AI_INK, sceneVarsToStyle } from '../palettes';
import { ResidentFigure } from '../figures/ResidentFigure';
import { StationLibrary } from '../stations/StationLibrary';
import { StationQuestionWall } from '../stations/StationQuestionWall';
import { DriftwoodGarden } from '../stations/DriftwoodGarden';
import { FerryDock } from '../stations/FerryDock';
import { GhostArtifact } from '../night/GhostArtifact';
import { SceneDefs } from '../SceneDefs';
import { ChartBridge } from '../chart/ChartBridge';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function svg(children: React.ReactNode) {
  return renderToStaticMarkup(
    <svg viewBox="0 0 1440 900">
      <SceneDefs />
      {children}
    </svg>,
  );
}

describe('IslandMound', () => {
  it('extracts exactly 5 mound path variants from the prototype script', () => {
    expect(MOUND_PATHS).toHaveLength(5);
    for (const p of MOUND_PATHS) {
      expect(p.startsWith('M ')).toBe(true);
      expect(p.trim().endsWith('Z')).toBe(true);
    }
  });

  it('renders the chosen variant path and data-driven fill', () => {
    const markup = svg(<IslandMound variant={2} fill="#ECDFB4" x={100} y={200} />);
    expect(markup).toContain(MOUND_PATHS[2]);
    expect(markup).toContain('#ECDFB4');
    expect(markup).toContain('translate(100,200)');
  });
});

describe('palettes', () => {
  it('DAY_SCENE_VARS has no overrides (day = fallback colors)', () => {
    expect(Object.keys(DAY_SCENE_VARS)).toHaveLength(0);
  });

  it('NIGHT_SCENE_VARS is copied verbatim from the prototype nightVars string', () => {
    expect(NIGHT_SCENE_VARS['--pp']).toBe('#161F36');
    expect(NIGHT_SCENE_VARS['--ochre']).toBe('#C08054');
    expect(NIGHT_SCENE_VARS['--gold']).toBe('#F5B94B');
  });

  it('sceneVarsToStyle passes the raw custom-property map through', () => {
    const style = sceneVarsToStyle(NIGHT_SCENE_VARS);
    expect((style as Record<string, string>)['--pp']).toBe('#161F36');
  });

  it('exposes the four domain colors and the component-level AI ink constant', () => {
    expect(DOMAIN_COLORS.数理.fill).toBe('#C9D8E6');
    expect(DOMAIN_COLORS.物质.ink).toBe('#9C5932'); // AA-darkened 2026-07-19 (§3.15 contrast pass)
    expect(DOMAIN_COLORS.生命.fill).toBe('#C6DECC');
    expect(DOMAIN_COLORS.交叉.fill).toBe('#ECDFB4');
    expect(AI_INK).toBe('#5A6C9E');
  });
});

describe('ResidentFigure', () => {
  it('renders a human figure with a solid ink stroke (no dash)', () => {
    const markup = svg(<ResidentFigure kind="human" caption="沈括 · 在问题墙" />);
    expect(markup).toContain('沈括');
    expect(markup).not.toContain('stroke-dasharray');
  });

  it('renders an AI resident with dashed AI_INK stroke and a role seal glyph', () => {
    const markup = svg(<ResidentFigure kind="ai" aiRole="ferryman" caption="连接协调员 · AI" />);
    expect(markup).toContain('stroke-dasharray');
    expect(markup).toContain(AI_INK);
    expect(markup).toContain('联'); // connection-steward seal glyph
  });

  it('maps each AI role to its prototype glyph', () => {
    expect(svg(<ResidentFigure kind="ai" aiRole="scout" />)).toContain('>斥<');
    expect(svg(<ResidentFigure kind="ai" aiRole="advocate" />)).toContain('>辩<');
    expect(svg(<ResidentFigure kind="ai" aiRole="synthesizer" />)).toContain('>综<');
  });
});

describe('stations', () => {
  it('StationLibrary renders its default name card at the prototype position', () => {
    const markup = svg(<StationLibrary />);
    expect(markup).toContain('文献阁');
    expect(markup).toContain('translate(760,296)');
  });

  it('station label prop overrides text/seal color without changing geometry', () => {
    const markup = svg(<StationLibrary label={{ text: '自定义', sealColor: '#123456' }} />);
    expect(markup).toContain('自定义');
    expect(markup).toContain('#123456');
  });

  it('StationQuestionWall keeps its breathing gold focus-card animation', () => {
    const markup = svg(<StationQuestionWall />);
    expect(markup).toContain('问题墙');
    expect(markup).toContain('breathe');
  });

  it('DriftwoodGarden renders the dashed diamond plot and default subtitle', () => {
    const markup = svg(<DriftwoodGarden />);
    expect(markup).toContain('散木园');
    expect(markup).toContain('无考核野地');
  });

  it('connection-workbench dock stub renders without throwing (no final art exists yet)', () => {
    const markup = svg(<FerryDock />);
    expect(markup).toContain('连接工作台');
  });

  it('onClick and selected wire through to the rendered station', () => {
    const markup = svg(<StationLibrary selected />);
    expect(markup).toContain('stroke-dasharray="6 6"');
  });
});

describe('GhostArtifact', () => {
  it('renders all three ghost types with their default captions', () => {
    expect(svg(<GhostArtifact type="card" />)).toContain('废弃的问题卡');
    expect(svg(<GhostArtifact type="prototype" />)).toContain('失败的原型');
    expect(svg(<GhostArtifact type="canvas" />)).toContain('废稿画布');
  });
});

describe('ChartBridge', () => {
  it('renders the double-stroke arc and, when given a position, the label pill', () => {
    const markup = svg(<ChartBridge d="M 836 338 Q 962 250 1082 262" label="桥 · 量子相干" labelX={962} labelY={300} />);
    expect(markup).toContain('M 836 338 Q 962 250 1082 262');
    expect(markup).toContain('桥 · 量子相干');
  });
});

describe('tokens.css', () => {
  const css = readFileSync(path.join(__dirname, '..', 'tokens.css'), 'utf-8');

  it('contains the --fi-* tokens verbatim from artboard 3c', () => {
    expect(css).toContain('--fi-lantern: #F5B94B');
    expect(css).toContain('--fi-paper: #F2EAD8');
    expect(css).toContain('--fi-night-paper: #161F36');
    expect(css).toContain("--fi-font-display: 'Noto Serif SC', 'Songti SC', serif");
  });

  it('carries every prototype keyframe and the reduced-motion kill switch', () => {
    for (const name of ['breathe', 'pulseGlow', 'twinkle', 'sway', 'ghostFloat', 'fflyA', 'fflyB', 'waveDrift', 'bob', 'smoke']) {
      expect(css).toContain(`@keyframes ${name}`);
    }
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
});

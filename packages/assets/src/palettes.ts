import type { CSSProperties } from 'react';

/**
 * Scene-palette mechanism, copied from the prototype's own approach:
 * every hand-drawn shape paints with `var(--wall,#F8F1DE)`-style
 * fallbacks, and "night mode" is nothing more than applying a block of
 * CSS custom-property overrides on the scene root (the `l1vars` binding
 * in design/handoff/问题群岛-原型 v3.dc.html, fed by `night ? nightVars : ''`).
 *
 * Day/night swaps palette only, never shape (docs/architecture.md §1).
 */

/** Day mode uses no overrides — every shape falls back to its own
 * `var(--x, <day-color>)` default, exactly as the prototype leaves
 * `l1vars` empty for day. */
export const DAY_SCENE_VARS: Record<string, string> = {};

/**
 * Night overrides, copied CHARACTER-FOR-CHARACTER from the prototype's
 * `const nightVars = '...'` (search near line 1220 of the v3 handoff).
 * Applying these on the scene root repaints every station/scenery piece
 * that reads `var(--pp,...)`, `var(--wall,...)`, etc.
 */
export const NIGHT_SCENE_VARS: Record<string, string> = {
  '--pp': '#161F36',
  '--pp2': '#212C4E',
  '--ground': '#212C4E',
  '--garden': '#26374A',
  '--sand': '#2A3550',
  '--stone': '#26314E',
  '--lotus': '#2E4A44',
  '--gline': 'rgba(170,185,225,0.08)',
  '--ink': '#8E99BE',
  '--inkT': '#C9D0E4',
  '--ink2': '#8B94B2',
  '--wall': '#2B3658',
  '--wallSh': '#232E4E',
  '--capB': '#2A3E68',
  '--capD': '#1C2440',
  '--capG': '#2C4657',
  '--capO': '#54413C',
  '--water': '#26375C',
  '--path': 'rgba(245,185,75,0.30)',
  '--treeG': '#2F4A50',
  '--trunk': '#3A4258',
  '--card': 'rgba(33,44,78,0.92)',
  '--shadow': 'rgba(0,0,0,0.4)',
  '--doorW': '#141B30',
  '--gold': '#F5B94B',
  '--gold2': '#F5B94B',
  '--ochre': '#C08054',
};

/** 领域映射 · domain colors — island base fill, day/night same shape. */
export type Domain = '数理' | '物质' | '生命' | '交叉';

export const DOMAIN_COLORS: Record<Domain, { fill: string; ink: string }> = {
  数理: { fill: '#C9D8E6', ink: '#2E5E8C' },
  物质: { fill: '#E8CFAE', ink: '#B5673A' },
  生命: { fill: '#C6DECC', ink: '#2B7A5F' },
  交叉: { fill: '#ECDFB4', ink: '#A08428' },
};

/**
 * AI resident ink — a deliberate component-level constant, NOT a --fi-*
 * token (see 3c footnote: "AI 居民笔触为虚线 + 淡靛墨 #5A6C9E（组件层常量，未入 token）").
 * If this is ever promoted to --fi-ai-ink, that is a breaking change.
 */
export const AI_INK = '#5A6C9E';

/**
 * Turns a scene-vars record (DAY_SCENE_VARS / NIGHT_SCENE_VARS, or any
 * custom override map) into a React inline-style object suitable for
 * spreading onto the `<svg>` or wrapping `<div>` that roots a scene —
 * mirrors the prototype's `style="...{{ l1vars }}"` string interpolation.
 */
export function sceneVarsToStyle(vars: Record<string, string>): CSSProperties {
  return vars as CSSProperties;
}

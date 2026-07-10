import { describe, it, expect, afterEach } from 'vitest';
import { hasWebGL } from '../webgl';

describe('hasWebGL — sync, pixi-import-free precheck (atlas-world-plan.md W1)', () => {
  const original = (globalThis as { document?: unknown }).document;

  afterEach(() => {
    if (original === undefined) delete (globalThis as { document?: unknown }).document;
    else (globalThis as { document?: unknown }).document = original;
  });

  it('is false in this vitest environment (no DOM) — the SVG fallback path this suite exercises', () => {
    expect(typeof document).toBe('undefined');
    expect(hasWebGL()).toBe(false);
  });

  it('returns true when a canvas context is obtainable', () => {
    (globalThis as { document?: unknown }).document = {
      createElement: () => ({ getContext: () => ({}) }),
    };
    expect(hasWebGL()).toBe(true);
  });

  it('returns false when no canvas context is obtainable', () => {
    (globalThis as { document?: unknown }).document = {
      createElement: () => ({ getContext: () => null }),
    };
    expect(hasWebGL()).toBe(false);
  });

  it('never throws — a document that errors on createElement still resolves to false', () => {
    (globalThis as { document?: unknown }).document = {
      createElement: () => {
        throw new Error('boom');
      },
    };
    expect(() => hasWebGL()).not.toThrow();
    expect(hasWebGL()).toBe(false);
  });
});

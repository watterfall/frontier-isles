import { describe, it, expect } from 'vitest';
import { zh } from '../i18n/zh';
import { en } from '../i18n/en';

/** Recursively collect the dotted key paths of a nested resource object. */
function keyPaths(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    keyPaths(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe('i18n resources', () => {
  it('zh and en have identical key sets', () => {
    const zhKeys = new Set(keyPaths(zh));
    const enKeys = new Set(keyPaths(en));
    const missingInEn = [...zhKeys].filter((k) => !enKeys.has(k));
    const extraInEn = [...enKeys].filter((k) => !zhKeys.has(k));
    expect(missingInEn).toEqual([]);
    expect(extraInEn).toEqual([]);
  });

  it('every en value is a non-empty string', () => {
    for (const path of keyPaths(en)) {
      const value = path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], en);
      expect(typeof value, path).toBe('string');
      expect((value as string).length, path).toBeGreaterThan(0);
    }
  });
});

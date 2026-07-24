import { describe, expect, it } from 'vitest';
import { formatWorldLink, parseWorldLink } from '../state/worldLink';

describe('worldLink', () => {
  it('parses an island hash with and without the leading #', () => {
    expect(parseWorldLink('#island=machine-curiosity')).toEqual({ island: 'machine-curiosity' });
    expect(parseWorldLink('island=machine-curiosity')).toEqual({ island: 'machine-curiosity' });
  });

  it('treats an empty or foreign hash as the atlas', () => {
    expect(parseWorldLink('')).toEqual({ island: null });
    expect(parseWorldLink('#')).toEqual({ island: null });
    expect(parseWorldLink('#section-anchor')).toEqual({ island: null });
    expect(parseWorldLink('#island=')).toEqual({ island: null });
  });

  it('rejects absurdly long slugs instead of carrying noise into state', () => {
    expect(parseWorldLink(`#island=${'a'.repeat(200)}`)).toEqual({ island: null });
  });

  it('round-trips slugs through format → parse, including encoded characters', () => {
    for (const slug of ['machine-curiosity', 'isle-1721623456789', '问题之岛', 'a b&c']) {
      expect(parseWorldLink(formatWorldLink({ island: slug }))).toEqual({ island: slug });
    }
  });

  it('formats the atlas as an empty hash', () => {
    expect(formatWorldLink({ island: null })).toBe('');
  });
});

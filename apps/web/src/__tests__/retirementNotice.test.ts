import { describe, expect, it } from 'vitest';
import { retirementFor } from '@frontier-isles/data/corpus-retirements';
import { DATA } from '../api/fallback';
import { zh } from '../i18n/zh';
import { en } from '../i18n/en';

/**
 * The L1 screen tells a reader when the record an island cites has been retired
 * upstream. Before this existed the repository held that fact in the audit
 * script and a data test and showed it to nobody who opens the island — silent
 * retention, wearing the appearance of a decision.
 *
 * These gates cover the two ways the notice can go wrong: reaching the wrong
 * islands, and saying more than the retirement supports.
 */
describe('retired-source notice', () => {
  it('carries atlasN through to the screen, or the notice can never fire', () => {
    // The notice keys on `IslandDatum.atlasN`. If the fallback projection stops
    // carrying it the component silently renders nothing, and no other test
    // notices — the screen would just be quiet again.
    const withProvenance = DATA.filter((d) => typeof d.atlasN === 'number');
    expect(withProvenance.length).toBeGreaterThan(300);
    expect(withProvenance.find((d) => d.slug === 'perennial-grain-crops')?.atlasN).toBe(1449);
  });

  it('fires on exactly the islands whose cited record is retired', () => {
    const flagged = DATA.filter((d) => d.atlasN != null && retirementFor(d.atlasN));
    expect(flagged.map((d) => d.slug)).toEqual(['perennial-grain-crops']);
    const entry = retirementFor(1449)!;
    expect(entry.reason).toBe('too_mature_or_applied');
    expect(entry.note).toMatch(/deployed agroecology program/);
  });

  it('never lets the notice read as "the question was answered"', () => {
    // `too_mature_or_applied` is the upstream atlas declining to collect
    // deployed programmes. Reading it as answered would contradict this
    // island's own text, which records that perennial-grain yields commonly
    // fall by year three. The scope sentence exists to block that reading, and
    // it is exactly the kind of sentence a later edit shortens away.
    expect(zh.island.retired.scope).toMatch(/收录范围/);
    expect(zh.island.retired.scope).toMatch(/不等于问题已被回答/);
    expect(zh.island.retired.scope).toMatch(/状态未改/);
    expect(en.island.retired.scope.toLowerCase()).toContain('inclusion scope');
    expect(en.island.retired.scope.toLowerCase()).toContain('not a finding that the question has been answered');
    expect(en.island.retired.scope.toLowerCase()).toContain('status is unchanged');
    // And the label states who retired what — not that the island is retired.
    expect(zh.island.retired.label).toMatch(/来源记录/);
    expect(en.island.retired.label.toLowerCase()).toContain('source record');
  });
});

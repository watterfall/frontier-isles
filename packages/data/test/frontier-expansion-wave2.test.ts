import { describe, expect, it } from 'vitest';
import { FRONTIERS, type Domain } from '../src/frontiers';

const WAVE_2 = FRONTIERS.filter((frontier) => frontier.id >= 141 && frontier.id <= 176);
const DOMAINS: Domain[] = ['数理', '物质', '生命', '交叉'];

describe('frontier expansion wave 2', () => {
  it('adds 36 continuous, provenance-distinct directions', () => {
    expect(WAVE_2).toHaveLength(36);
    expect(WAVE_2.map((frontier) => frontier.id)).toEqual(
      Array.from({ length: 36 }, (_, index) => 141 + index),
    );
    expect(new Set(WAVE_2.map((frontier) => frontier.slug)).size).toBe(36);
    expect(new Set(WAVE_2.map((frontier) => frontier.atlasN)).size).toBe(36);

    const allAtlasIds = FRONTIERS.map((frontier) => frontier.atlasN);
    const allSlugs = FRONTIERS.map((frontier) => frontier.slug);
    expect(new Set(allAtlasIds).size).toBe(allAtlasIds.length);
    expect(new Set(allSlugs).size).toBe(allSlugs.length);
  });

  it('adds exactly nine directions in each top-level domain', () => {
    for (const domain of DOMAINS) {
      expect(
        WAVE_2.filter((frontier) => frontier.domain === domain),
        `${domain} wave-2 quota`,
      ).toHaveLength(9);
    }
  });

  it('ships bilingual depth, falsifiable questions, and direct evidence for every direction', () => {
    for (const frontier of WAVE_2) {
      expect(frontier.title.zh, `${frontier.slug} title.zh`).toBeTruthy();
      expect(frontier.title.en, `${frontier.slug} title.en`).toBeTruthy();
      expect(frontier.qfocus.zh, `${frontier.slug} qfocus.zh`).toBeTruthy();
      expect(frontier.qfocus.en, `${frontier.slug} qfocus.en`).toBeTruthy();
      expect(frontier.brief.zh, `${frontier.slug} brief.zh`).toBeTruthy();
      expect(frontier.brief.en, `${frontier.slug} brief.en`).toBeTruthy();
      expect(frontier.scores, `${frontier.slug} scores`).toHaveLength(9);
      expect(frontier.scores.every((score) => score >= 1 && score <= 5)).toBe(true);
      expect(
        Math.max(frontier.scores[0]!, frontier.scores[1]!, frontier.scores[8]!),
        `${frontier.slug} must be paradigm-shifting, cross-disciplinary, or undervalued`,
      ).toBeGreaterThanOrEqual(4);
      expect(frontier.citation.url, `${frontier.slug} headline evidence`).toMatch(/^https:\/\//);
      expect(frontier.citation.title, `${frontier.slug} citation title`).toBeTruthy();
      expect(frontier.citation.venue, `${frontier.slug} citation venue`).toBeTruthy();
      expect(frontier.citation.year, `${frontier.slug} citation year`).toBeGreaterThanOrEqual(1900);
      for (const source of frontier.literature ?? []) {
        expect(source.url, `${frontier.slug} literature evidence`).toMatch(/^https:\/\//);
        expect(source.title, `${frontier.slug} literature title`).toBeTruthy();
        expect(source.venue, `${frontier.slug} literature venue`).toBeTruthy();
        expect(source.year, `${frontier.slug} literature year`).toBeGreaterThanOrEqual(1900);
        expect(source.title.toLowerCase()).not.toBe(frontier.citation.title.toLowerCase());
        expect(source.url.replace(/\/+$/, '').toLowerCase()).not.toBe(
          frontier.citation.url.replace(/\/+$/, '').toLowerCase(),
        );
      }

      const depth = frontier.depth;
      expect(depth, `${frontier.slug} depth`).toBeDefined();
      expect(depth?.overview.zh, `${frontier.slug} overview.zh`).toBeTruthy();
      expect(depth?.overview.en, `${frontier.slug} overview.en`).toBeTruthy();
      expect(depth?.whyMatters.zh, `${frontier.slug} whyMatters.zh`).toBeTruthy();
      expect(depth?.whyMatters.en, `${frontier.slug} whyMatters.en`).toBeTruthy();
      expect(depth?.ifAnswered.zh, `${frontier.slug} ifAnswered.zh`).toBeTruthy();
      expect(depth?.ifAnswered.en, `${frontier.slug} ifAnswered.en`).toBeTruthy();
      expect(depth?.approaches, `${frontier.slug} approaches`).toHaveLength(3);
      expect(depth?.barrier.zh, `${frontier.slug} barrier.zh`).toBeTruthy();
      expect(depth?.barrier.en, `${frontier.slug} barrier.en`).toBeTruthy();
      expect(depth?.subQuestions, `${frontier.slug} falsifiable subquestions`).toHaveLength(3);
      expect(frontier.interior, `${frontier.slug} should use depth, not synthetic interior`).toBeUndefined();
    }
  });
});

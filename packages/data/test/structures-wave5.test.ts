import { describe, expect, it } from 'vitest';
import { SEED_STRUCTURES } from '../src/structures';
import { WAVE_4_STRUCTURES } from '../src/structures-expansion-wave4';
import { AGENT_BASED_CANDIDATES, WAVE_5_STRUCTURES } from '../src/structures-expansion-wave5';

const byId = new Map(SEED_STRUCTURES.map((structure) => [structure.id, structure]));
const complete = (value: { zh: string; en: string } | undefined): boolean =>
  !!value && value.zh.trim().length > 0 && value.en.trim().length > 0;

describe('wave-5 structures', () => {
  it('adds 20 structures, all reachable through SEED_STRUCTURES', () => {
    expect(WAVE_5_STRUCTURES).toHaveLength(20);
    for (const structure of WAVE_5_STRUCTURES) expect(byId.get(structure.id)).toBe(structure);
  });

  it('grows the catalogue without touching the mapping total', () => {
    // 43 pre-existing + 83 from the topic set across waves 4-8.
    expect(SEED_STRUCTURES).toHaveLength(126);
    const mappings = SEED_STRUCTURES.reduce((total, s) => total + s.mappings.length, 0);
    // Every wave adds structures, never edges. If this number moves, a wave
    // file has started claiming coverage it did not earn.
    expect(mappings).toBe(101);
  });

  it('carries no mappings and stays proposed', () => {
    for (const structure of WAVE_5_STRUCTURES) {
      expect(structure.mappings, structure.id).toEqual([]);
      expect(structure.status, structure.id).toBe('proposed');
    }
  });

  it('gives every structure a kind, quantities and a failsWhen, in both languages', () => {
    for (const structure of WAVE_5_STRUCTURES) {
      expect(structure.kind, structure.id).toMatch(/^(regularity|method)$/);
      expect(structure.quantities?.length ?? 0, structure.id).toBeGreaterThanOrEqual(2);
      expect(complete(structure.failsWhen), structure.id).toBe(true);
      expect(complete(structure.title), structure.id).toBe(true);
      expect(complete(structure.statement), structure.id).toBe(true);
      for (const quantity of structure.quantities ?? []) {
        expect(complete(quantity.name), structure.id).toBe(true);
        expect(complete(quantity.role), structure.id).toBe(true);
      }
    }
  });

  it('keeps ids unique across the whole catalogue', () => {
    const ids = SEED_STRUCTURES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('does not reuse a wave-4 id', () => {
    const four = new Set(WAVE_4_STRUCTURES.map((s) => s.id));
    for (const structure of WAVE_5_STRUCTURES) expect(four.has(structure.id), structure.id).toBe(false);
  });

  it('cites at least three in-range corpus records per structure', () => {
    // 1,848 is the count of ACTIVE records in xf-6eb361265784, not the highest
    // id: ids run 1..1866 with exactly 18 gaps, which are the 18 retirements.
    // An earlier version of this test used 1848 as the ceiling and failed on a
    // legitimately cited XF-001857 — the bound below is the corrected one.
    //
    // What this cannot check is liveness, because the corpus is not vendored
    // here. That was verified out of band on 2026-08-22: all 175 distinct ids
    // cited across waves 4 and 5 resolve to active records, none to a
    // retirement. Re-run that check when the dataset version moves.
    for (const structure of WAVE_5_STRUCTURES) {
      expect(structure.provenance.recordIds.length, structure.id).toBeGreaterThanOrEqual(3);
      for (const id of structure.provenance.recordIds) {
        expect(Number.isInteger(id) && id > 0 && id <= 1866, `${structure.id} cites XF-${id}`).toBe(true);
      }
    }
  });

  it('never reuses a failsWhen as a mapping boundary', () => {
    const fails = new Set(WAVE_5_STRUCTURES.map((s) => s.failsWhen?.zh).filter(Boolean));
    for (const structure of SEED_STRUCTURES) {
      for (const mapping of structure.mappings) {
        expect(fails.has(mapping.boundary?.zh ?? '')).toBe(false);
      }
    }
  });
});

describe('agent-based candidates', () => {
  it('names only structures that exist — a planning list may not cite a dangling id', () => {
    for (const candidate of AGENT_BASED_CANDIDATES) {
      expect(byId.has(candidate.structureId), candidate.structureId).toBe(true);
    }
  });

  it('states a reason in both languages for every entry', () => {
    for (const candidate of AGENT_BASED_CANDIDATES) {
      expect(complete(candidate.why), candidate.structureId).toBe(true);
    }
  });

  it('covers more structures than the two shipped model families do', () => {
    // The whole argument for an agent kernel is reach. The current families are
    // bound to exactly one structure; if this list ever shrinks below a handful
    // the argument has evaporated and the plan should be re-read, not kept.
    expect(AGENT_BASED_CANDIDATES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(AGENT_BASED_CANDIDATES.map((c) => c.structureId)).size).toBe(AGENT_BASED_CANDIDATES.length);
  });

  it('does not list critical-slowing-down, which needs a readout rather than a kernel', () => {
    // It is what the others do near their transition. Listing it here would
    // hide the cheapest result in the plan behind the most expensive one.
    const ids = AGENT_BASED_CANDIDATES.map((c) => c.structureId);
    expect(ids).not.toContain('struct://xfrontier/critical-slowing-down');
  });
});

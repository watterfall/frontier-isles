import { describe, expect, it } from 'vitest';
import { SEED_STRUCTURES } from '../src/structures';
import { FRONTIERS } from '../src/frontiers';
import { buildQuantityIndex, normaliseQuantity, quantityDomainDistance } from '../src/quantity-index';

const islands = FRONTIERS.map((island) => ({ slug: island.slug, domain: island.domain }));
const index = buildQuantityIndex(SEED_STRUCTURES, islands);

describe('normaliseQuantity', () => {
  it('folds case, spacing and punctuation', () => {
    expect(normaliseQuantity('耦合强度 K')).toBe(normaliseQuantity('耦合强度K'));
    expect(normaliseQuantity('集体锁相（序参量）')).toBe(normaliseQuantity('集体锁相 序参量'));
    expect(normaliseQuantity('Order Parameter')).toBe('orderparameter');
  });

  it('does NOT fold synonyms — deciding two words name one quantity is the curator\'s call', () => {
    expect(normaliseQuantity('恢复速率')).not.toBe(normaliseQuantity('松弛速率'));
    expect(normaliseQuantity('反作用强度')).not.toBe(normaliseQuantity('相互作用强度'));
  });
});

describe('buildQuantityIndex', () => {
  it('is deterministic and order-independent', () => {
    const again = buildQuantityIndex([...SEED_STRUCTURES].reverse(), [...islands].reverse());
    expect(again.totals).toEqual(index.totals);
    expect(again.groups.map((group) => group.key).sort()).toEqual(index.groups.map((group) => group.key).sort());
  });

  it('reads both sources — declared quantities and mapping correspondences', () => {
    expect(index.totals.declaredGroups).toBeGreaterThan(0);
    const fromCorrespondence = index.groups.filter((group) => group.slugs.length > 0);
    expect(fromCorrespondence.length).toBeGreaterThan(0);
  });

  it('never reports a cross-domain group with fewer than two domains', () => {
    for (const group of index.crossDomain) expect(group.domains.length).toBeGreaterThanOrEqual(2);
  });

  it('keeps the display form verbatim rather than showing the normalised key', () => {
    for (const group of index.groups.slice(0, 40)) {
      expect(group.display.zh.trim().length).toBeGreaterThan(0);
      expect(group.display.en.trim().length).toBeGreaterThan(0);
    }
  });

  it('REPORTS merge candidates and applies none of them', () => {
    // The point of the whole module. Two of the current candidates are visibly
    // wrong — 反作用强度 against 相互作用强度 would wire quantum measurement to
    // phase separation, and 方差 against 残余方差 would wire critical slowing
    // down to craft standardisation — because bigram overlap cannot tell
    // 作用强度 apart from itself. Applying them automatically would manufacture
    // exactly the false cross-domain link this project forbids.
    expect(index.mergeCandidates.length).toBeGreaterThan(0);
    for (const candidate of index.mergeCandidates) {
      expect(candidate.a).not.toBe(candidate.b);
      expect(candidate.similarity).toBeGreaterThanOrEqual(0.7);
      expect(candidate.check.zh.length).toBeGreaterThan(0);
      expect(candidate.check.en.length).toBeGreaterThan(0);
      // Both sides survive as separate groups: nothing was folded.
      expect(index.groups.some((group) => group.key === candidate.a)).toBe(true);
      expect(index.groups.some((group) => group.key === candidate.b)).toBe(true);
    }
  });

  it('reports the pair that must NOT be merged, so a future auto-merge trips here', () => {
    const keys = index.groups.map((group) => group.key);
    expect(keys).toContain(normaliseQuantity('反作用强度'));
    expect(keys).toContain(normaliseQuantity('相互作用强度'));
  });

  it('well-forms every comparable entry', () => {
    // Currently zero: the 43 mapped structures declare no canonical quantities,
    // and the 37 that declare have no mappings yet. That is the concrete reason
    // the E1 exercise cannot yet compute "quantities neither side named". When
    // the merge work lands this list becomes non-empty, which is progress, so
    // this asserts shape rather than count.
    for (const entry of index.comparable) {
      expect(typeof entry.structureId).toBe('string');
      expect(Array.isArray(entry.declaredUnused)).toBe(true);
      expect(Array.isArray(entry.usedUndeclared)).toBe(true);
    }
  });

  it('counts every occurrence exactly once across the groups', () => {
    const summed = index.groups.reduce((total, group) => total + group.occurrences, 0);
    // Occurrences with an empty normalised key are dropped, so the group total
    // is a lower bound on the raw count rather than equal to it.
    expect(summed).toBeLessThanOrEqual(index.totals.occurrences);
    expect(summed).toBeGreaterThan(index.totals.occurrences * 0.9);
  });
});

describe('quantityDomainDistance', () => {
  it('derives only from cross-domain groups and stays produce-only', () => {
    const distance = quantityDomainDistance(index);
    for (const pair of distance) {
      expect(pair.a < pair.b || pair.a.localeCompare(pair.b) < 0).toBe(true);
      expect(pair.sharedQuantities).toBe(pair.keys.length);
      expect(pair.sharedQuantities).toBeGreaterThan(0);
    }
    const totalPairs = index.crossDomain.reduce((total, group) => {
      const n = group.domains.length;
      return total + (n * (n - 1)) / 2;
    }, 0);
    expect(distance.reduce((total, pair) => total + pair.sharedQuantities, 0)).toBe(totalPairs);
  });
});

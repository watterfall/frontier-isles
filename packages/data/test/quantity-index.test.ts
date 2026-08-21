import { describe, expect, it } from 'vitest';
import { SEED_STRUCTURES } from '../src/structures';
import { FRONTIERS } from '../src/frontiers';
import {
  buildQuantityIndex,
  normaliseQuantity,
  projectQuantityRoles,
  quantityDomainDistance,
  symbolsIn,
} from '../src/quantity-index';

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

  it('flags candidates whose only overlap is a generic head noun', () => {
    // Measured on the 126-structure catalogue: closing all candidates
    // transitively collapses nine unrelated structures into one group, because
    // 修复速率, 沉积速率, 驱动速率 and 对手改进速率 chain through the head 速率. The
    // flag is what stops a reviewer reading that chain as a finding.
    const flagged = index.mergeCandidates.filter((candidate) => candidate.sharedHeadOnly);
    expect(flagged.length).toBeGreaterThan(0);
    for (const candidate of flagged) {
      expect(candidate.a).not.toBe(candidate.b);
      // The check text names the offending head, so the reason travels with it.
      expect(candidate.check.zh).toContain(candidate.sharedFragment);
      expect(candidate.check.en).toContain(candidate.sharedFragment);
    }
  });

  it('reports a shared fragment that really is common to both keys', () => {
    for (const candidate of index.mergeCandidates) {
      expect(candidate.sharedFragment.length).toBeGreaterThan(0);
      expect(candidate.a).toContain(candidate.sharedFragment);
      expect(candidate.b).toContain(candidate.sharedFragment);
    }
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

describe('symbolsIn', () => {
  it('reads a bracketed symbol, a subscripted letter, and a bare one', () => {
    expect(symbolsIn('约束 ⟨f_k⟩')).toEqual(['f_k']);
    expect(symbolsIn('类型频率 x_i')).toEqual(['x_i']);
    expect(symbolsIn('尾指数 α')).toEqual(['α']);
  });

  it('drops parenthesised asides so an argument list is not read as symbols', () => {
    // (r,t) would otherwise contribute r and t as if they were quantities.
    expect(symbolsIn('浓度场 c(r,t)')).toEqual(['c']);
    expect(symbolsIn('变分自由能 F（一个上界）')).toEqual(['F']);
  });

  it('finds nothing in a name that carries no symbol at all', () => {
    expect(symbolsIn('恢复速率')).toEqual([]);
    expect(symbolsIn('未选路径的结论分布')).toEqual([]);
  });

  it('does not mistake a letter inside a word for a symbol', () => {
    expect(symbolsIn('RNA 降解速率')).not.toContain('R');
    expect(symbolsIn('ONNX 算子覆盖')).toEqual([]);
  });
});

describe('within-structure variant groups', () => {
  const variants = index.withinStructureVariants;

  it('groups only renderings that really share the stated symbol', () => {
    expect(variants.length).toBeGreaterThan(0);
    for (const group of variants) {
      for (const rendering of group.renderings) {
        expect(symbolsIn(rendering.text.zh).join('+'), rendering.text.zh).toBe(group.symbol);
      }
    }
  });

  it('never reports a group with fewer than two distinct renderings', () => {
    for (const group of variants) {
      const distinct = new Set(group.renderings.map((rendering) => normaliseQuantity(rendering.text.zh)));
      expect(distinct.size, `${group.structureId} ${group.symbol}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('cites renderings that come from that structure\'s own mappings', () => {
    for (const group of variants) {
      const structure = SEED_STRUCTURES.find((candidate) => candidate.id === group.structureId)!;
      const slugs = new Set(structure.mappings.map((mapping) => mapping.slug));
      for (const rendering of group.renderings) expect(slugs.has(rendering.slug), rendering.slug).toBe(true);
    }
  });

  it('applies nothing — every rendering survives as its own group', () => {
    const keys = new Set(index.groups.map((group) => group.key));
    for (const group of variants) {
      for (const rendering of group.renderings) {
        expect(keys.has(normaliseQuantity(rendering.text.zh)), rendering.text.zh).toBe(true);
      }
    }
  });

  it('catches what surface similarity misses, which is the reason it exists', () => {
    // Maximum entropy writes its distribution p five ways across five
    // substrates and no two of them are close enough for bigram overlap to
    // pair, so the merge-candidate list contains none of them. The symbol does.
    const maxent = variants.filter((group) => group.structureId.endsWith('/maximum-entropy-inference'));
    const p = maxent.find((group) => group.symbol === 'p');
    expect(p, 'maximum entropy p must be grouped').toBeDefined();
    expect(new Set(p!.renderings.map((r) => r.text.zh)).size).toBeGreaterThanOrEqual(4);
    const pairedByOverlap = index.mergeCandidates.some(
      (candidate) => candidate.a.includes('分布p') && candidate.b.includes('分布p'),
    );
    expect(pairedByOverlap).toBe(false);
  });

  it('reports how many quantities the symbol rule cannot see', () => {
    // 119 of 193 at the time of writing. A reader must not take the variant
    // groups as a complete account of how much the catalogue repeats itself.
    expect(index.symbollessQuantities).toBeGreaterThan(0);
    const carried = index.withinStructureVariants.reduce((total, group) => total + group.renderings.length, 0);
    expect(index.symbollessQuantities).toBeGreaterThan(carried);
  });
});

describe('projectQuantityRoles', () => {
  const roles = projectQuantityRoles(SEED_STRUCTURES);
  const byId = new Map(SEED_STRUCTURES.map((structure) => [structure.id, structure]));

  it('covers exactly the structures carrying two or more mappings', () => {
    const eligible = SEED_STRUCTURES.filter((structure) => structure.mappings.length >= 2);
    expect(roles).toHaveLength(eligible.length);
    expect(new Set(roles.map((entry) => entry.structureId)).size).toBe(roles.length);
  });

  it('resolves every rendering pointer to a real correspondence', () => {
    for (const entry of roles) {
      const structure = byId.get(entry.structureId)!;
      for (const role of entry.roles) {
        for (const [mappingIndex, correspondenceIndex] of role.renderings) {
          const mapping = structure.mappings[mappingIndex];
          expect(mapping, `${entry.structureId} mapping ${mappingIndex}`).toBeDefined();
          const correspondence = (mapping!.correspondences ?? [])[correspondenceIndex];
          expect(correspondence, `${entry.structureId} [${mappingIndex},${correspondenceIndex}]`).toBeDefined();
          expect(correspondence!.quantity.zh.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('files a ragged structure with no roles at all, rather than guessing', () => {
    // Mappings that disagree on how many quantities exist give position no
    // meaning; inventing roles anyway is how a derived view starts lying.
    for (const entry of roles.filter((candidate) => candidate.basis === 'ragged')) {
      expect(entry.roles, entry.structureId).toEqual([]);
      const structure = byId.get(entry.structureId)!;
      const widths = new Set(structure.mappings.map((mapping) => (mapping.correspondences ?? []).length));
      expect(widths.size, entry.structureId).toBeGreaterThan(1);
    }
  });

  it('names the conflicting slots when, and only when, the basis is conflict', () => {
    for (const entry of roles) {
      if (entry.basis === 'conflict') expect(entry.conflictingSlots.length, entry.structureId).toBeGreaterThan(0);
      else expect(entry.conflictingSlots, entry.structureId).toEqual([]);
    }
  });

  it('claims index+symbol only where a slot really carries two comparable symbols', () => {
    for (const entry of roles.filter((candidate) => candidate.basis === 'index+symbol')) {
      const structure = byId.get(entry.structureId)!;
      const slotHasTwoSymbols = entry.roles.some((role) => {
        const carrying = role.renderings.filter(([mappingIndex, correspondenceIndex]) =>
          symbolsIn(structure.mappings[mappingIndex]!.correspondences![correspondenceIndex]!.quantity.zh).length > 0,
        );
        return carrying.length >= 2;
      });
      expect(slotHasTwoSymbols, entry.structureId).toBe(true);
    }
  });

  it('reaches renderings that carry no symbol, which is why position is used', () => {
    // distributed-field-observability writes its hidden field as 源事件与传播场,
    // 编码源波形 and 场源与外场 before ever writing x(r,t). No symbol rule can
    // group those; the slot does.
    const entry = roles.find((candidate) => candidate.structureId.endsWith('/distributed-field-observability'));
    expect(entry, 'distributed-field-observability must be projected').toBeDefined();
    const structure = byId.get(entry!.structureId)!;
    const slotZero = entry!.roles.find((role) => role.slot === 0)!;
    const symbolless = slotZero.renderings.filter(([mappingIndex, correspondenceIndex]) =>
      symbolsIn(structure.mappings[mappingIndex]!.correspondences![correspondenceIndex]!.quantity.zh).length === 0,
    );
    expect(symbolless.length).toBeGreaterThanOrEqual(2);
    expect(slotZero.renderings.length).toBeGreaterThan(symbolless.length);
  });

  it('states in its own check that position and symbol are not independent', () => {
    const corroborated = roles.filter((entry) => entry.basis === 'index+symbol');
    expect(corroborated.length).toBeGreaterThan(0);
    for (const entry of corroborated) {
      expect(entry.check.zh).toContain('不是两个独立证据');
      expect(entry.check.en).toContain('not two independent witnesses');
    }
  });

  it('applies nothing — the catalogue mappings are untouched', () => {
    const total = SEED_STRUCTURES.reduce((sum, structure) => sum + structure.mappings.length, 0);
    expect(total).toBe(101);
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

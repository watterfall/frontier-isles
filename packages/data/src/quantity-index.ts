import type { SeedStructure } from './structures';

/**
 * The quantity index — a derived view over the structure catalogue at the grain
 * of the QUANTITY rather than the structure.
 *
 * Why this exists. A structure spanning four domains is usually read as the
 * catalogue's cross-disciplinary unit, but that is one level too coarse. What
 * actually connects two fields is a quantity doing the same work in both, and
 * that is also the thing whose absence has been the modal reason a candidate
 * mapping gets rejected. Measured on the 43 mapped structures before wave 4:
 * 193 authored correspondences resolve to 177 distinct quantity strings, and
 * only 11 of those (6.2%) appear in more than one domain. At the structure
 * level 23 of 43 span two or more domains; at the quantity level almost
 * nothing does. The gap between those two numbers is not science, it is
 * wording — every mapping names its own quantity in its own words, so
 * "耦合强度 K" and "耦合强度" are two entries.
 *
 * This module DERIVES; it does not rewrite. The correspondence text is the
 * curator's insight and is left exactly as authored. Near-identical quantities
 * are reported as merge candidates for a person to accept or reject, on the
 * same terms as a structure proposal: the machine may point, the human
 * ratifies.
 *
 * Every function here is pure and takes the catalogue as an argument. Nothing
 * imports `SEED_STRUCTURES` at module level, so importing this file can never
 * pull the catalogue into a bundle that had not already paid for it.
 */

export interface Bilingual {
  zh: string;
  en: string;
}

/** Where a quantity was found. */
export type QuantitySource =
  /** Declared on the structure itself (`SeedStructure.quantities`, wave 4 on). */
  | 'canonical'
  /** Named inside one mapping's correspondence (the only place before wave 4). */
  | 'correspondence';

export interface QuantityOccurrence {
  key: string;
  display: Bilingual;
  source: QuantitySource;
  structureId: string;
  /** Present only for `correspondence` occurrences. */
  slug?: string;
  domain?: string;
}

export interface QuantityGroup {
  /** Normalised key the occurrences share. */
  key: string;
  /** The first surface form seen, kept verbatim rather than synthesised. */
  display: Bilingual;
  structureIds: string[];
  slugs: string[];
  domains: string[];
  /** True when at least one structure declares this as one of its own quantities. */
  declared: boolean;
  occurrences: number;
}

export interface QuantityMergeCandidate {
  a: string;
  b: string;
  /** Character-bigram overlap of the two keys, 0..1. */
  similarity: number;
  /** What a reviewer must decide. Never asserts the two are the same. */
  check: Bilingual;
}

export interface QuantityIndex {
  groups: QuantityGroup[];
  /** Groups touching two or more domains — the catalogue's actual bridges. */
  crossDomain: QuantityGroup[];
  /** Reported, never applied. */
  mergeCandidates: QuantityMergeCandidate[];
  /**
   * Structures that declare canonical quantities AND carry mappings, so the two
   * halves can be compared at all. Empty is the expected answer today and is
   * itself the finding: the 43 mapped structures declare nothing, and the
   * wave-4/5 structures that declare have no mappings yet.
   */
  comparable: Array<{
    structureId: string;
    /** Declared on the structure but never used by any of its mappings. */
    declaredUnused: string[];
    /** Named by a mapping but absent from the structure's declared list. */
    usedUndeclared: string[];
  }>;
  totals: {
    structures: number;
    occurrences: number;
    groups: number;
    crossDomainGroups: number;
    declaredGroups: number;
  };
}

/**
 * Light normalisation only. Case, whitespace and punctuation are noise; a
 * trailing symbol is not — "耦合强度 K" and "耦合强度" fold together because the
 * symbol is an annotation on the same quantity, but no attempt is made to fold
 * synonyms, because deciding that two different words mean one quantity is the
 * curator's call and not a string operation.
 */
export function normaliseQuantity(text: string): string {
  return text
    .toLowerCase()
    .replace(/[（）()［］\[\]{}【】]/g, ' ')
    .replace(/[，,。.、;；:：/｜|—–\-_"'“”‘’]/g, ' ')
    .replace(/\s+/g, '')
    .trim();
}

const bigrams = (s: string): Set<string> => {
  const out = new Set<string>();
  for (let i = 0; i + 1 < s.length; i++) out.add(s.slice(i, i + 2));
  return out;
};

const overlap = (a: string, b: string): number => {
  const x = bigrams(a);
  const y = bigrams(b);
  if (x.size === 0 || y.size === 0) return 0;
  let hit = 0;
  for (const g of x) if (y.has(g)) hit++;
  return hit / Math.min(x.size, y.size);
};

export interface QuantityIslandLike {
  slug: string;
  domain: string;
}

/**
 * Build the index. `islands` supplies the domain each mapping's island sits in;
 * a mapping whose island is unknown contributes its quantity without a domain
 * rather than being dropped, so a missing island cannot silently shrink the
 * cross-domain count.
 */
export function buildQuantityIndex(
  structures: readonly SeedStructure[],
  islands: readonly QuantityIslandLike[],
  options: { mergeThreshold?: number } = {},
): QuantityIndex {
  const threshold = options.mergeThreshold ?? 0.7;
  const domainOf = new Map(islands.map((island) => [island.slug, island.domain]));

  const occurrences: QuantityOccurrence[] = [];
  for (const structure of structures) {
    for (const quantity of structure.quantities ?? []) {
      occurrences.push({
        key: normaliseQuantity(quantity.name.zh),
        display: quantity.name,
        source: 'canonical',
        structureId: structure.id,
      });
    }
    for (const mapping of structure.mappings) {
      for (const correspondence of mapping.correspondences ?? []) {
        occurrences.push({
          key: normaliseQuantity(correspondence.quantity.zh),
          display: correspondence.quantity,
          source: 'correspondence',
          structureId: structure.id,
          slug: mapping.slug,
          domain: domainOf.get(mapping.slug),
        });
      }
    }
  }

  const grouped = new Map<string, QuantityGroup>();
  for (const occurrence of occurrences) {
    if (!occurrence.key) continue;
    let group = grouped.get(occurrence.key);
    if (!group) {
      group = {
        key: occurrence.key,
        display: occurrence.display,
        structureIds: [],
        slugs: [],
        domains: [],
        declared: false,
        occurrences: 0,
      };
      grouped.set(occurrence.key, group);
    }
    group.occurrences += 1;
    if (occurrence.source === 'canonical') group.declared = true;
    if (!group.structureIds.includes(occurrence.structureId)) group.structureIds.push(occurrence.structureId);
    if (occurrence.slug && !group.slugs.includes(occurrence.slug)) group.slugs.push(occurrence.slug);
    if (occurrence.domain && !group.domains.includes(occurrence.domain)) group.domains.push(occurrence.domain);
  }

  const groups = [...grouped.values()].sort(
    (a, b) => b.domains.length - a.domains.length || b.occurrences - a.occurrences || (a.key < b.key ? -1 : 1),
  );
  for (const group of groups) {
    group.structureIds.sort();
    group.slugs.sort();
    group.domains.sort();
  }

  const crossDomain = groups.filter((group) => group.domains.length >= 2);

  const keys = groups.map((group) => group.key);
  const mergeCandidates: QuantityMergeCandidate[] = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const similarity = overlap(keys[i]!, keys[j]!);
      if (similarity < threshold) continue;
      mergeCandidates.push({
        a: keys[i]!,
        b: keys[j]!,
        similarity: Math.round(similarity * 1000) / 1000,
        check: {
          zh: '复核者要判断这两个写法指的是不是同一个量。字面接近不构成同一——不同基底里同名的量常常各做各的事，合并会把一条本不存在的跨域连接凭空造出来。',
          en: 'A reviewer must decide whether these two wordings name one quantity. Surface similarity is not identity — same-named quantities in different substrates often do different work, and merging would manufacture a cross-domain link that was never there.',
        },
      });
    }
  }
  mergeCandidates.sort((a, b) => b.similarity - a.similarity || (a.a < b.a ? -1 : 1));

  const comparable: QuantityIndex['comparable'] = [];
  for (const structure of structures) {
    const declared = (structure.quantities ?? []).map((quantity) => normaliseQuantity(quantity.name.zh));
    if (declared.length === 0 || structure.mappings.length === 0) continue;
    const used = new Set<string>();
    for (const mapping of structure.mappings) {
      for (const correspondence of mapping.correspondences ?? []) used.add(normaliseQuantity(correspondence.quantity.zh));
    }
    comparable.push({
      structureId: structure.id,
      declaredUnused: declared.filter((key) => !used.has(key)).sort(),
      usedUndeclared: [...used].filter((key) => !declared.includes(key)).sort(),
    });
  }

  return {
    groups,
    crossDomain,
    mergeCandidates,
    comparable,
    totals: {
      structures: structures.length,
      occurrences: occurrences.length,
      groups: groups.length,
      crossDomainGroups: crossDomain.length,
      declaredGroups: groups.filter((group) => group.declared).length,
    },
  };
}

/**
 * Domain-to-domain distance measured at the quantity grain: how many distinct
 * quantities do the same work in both domains.
 *
 * `packages/core`'s `disciplineDistance` counts shared STRUCTURES and is marked
 * produce-only, reserved for the invariant-16 continuous-domain rework. This is
 * the finer reading of the same idea and is likewise produce-only: it drives no
 * layout. It exists so that "these two fields are close" can eventually be
 * backed by a count of shared quantities rather than by a taxonomy label.
 */
export function quantityDomainDistance(
  index: QuantityIndex,
): Array<{ a: string; b: string; sharedQuantities: number; keys: string[] }> {
  const pairs = new Map<string, string[]>();
  for (const group of index.crossDomain) {
    const domains = [...group.domains].sort();
    for (let i = 0; i < domains.length; i++) {
      for (let j = i + 1; j < domains.length; j++) {
        const key = `${domains[i]} ${domains[j]}`;
        const list = pairs.get(key) ?? [];
        list.push(group.key);
        pairs.set(key, list);
      }
    }
  }
  return [...pairs.entries()]
    .map(([key, keys]) => {
      const [a, b] = key.split(' ') as [string, string];
      return { a, b, sharedQuantities: keys.length, keys: keys.sort() };
    })
    .sort((x, y) => y.sharedQuantities - x.sharedQuantities || (x.a < y.a ? -1 : 1));
}

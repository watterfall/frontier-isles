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

/**
 * A candidate is PAIRWISE and must never be closed transitively.
 *
 * Measured on the 126-structure catalogue: taking all 34 candidates and
 * union-finding them collapses nine unrelated structures into one group,
 * because 修复速率, 沉积速率, 驱动速率 and 对手改进速率 all share the head 速率 and
 * chain through it. That would wire stratigraphic deposition to a Red Queen
 * arms race. The same happens to 不可逆度 against 逻辑不可逆度, which would put
 * strategic irreversibility and thermodynamic irreversibility in one bucket.
 *
 * `sharedFragment` is what makes this visible without reading both sides: when
 * the longest common run between two keys is nothing but a generic head noun,
 * the pair is almost certainly not one quantity.
 */
export interface QuantityMergeCandidate {
  a: string;
  b: string;
  /** Character-bigram overlap of the two keys, 0..1. */
  similarity: number;
  /** Longest common run of characters. A generic head here is a red flag. */
  sharedFragment: string;
  /** True when the shared run is only a common head noun such as 速率 or 强度. */
  sharedHeadOnly: boolean;
  /** What a reviewer must decide. Never asserts the two are the same. */
  check: Bilingual;
}

/**
 * Head nouns that carry no identity on their own. Two quantities sharing only
 * one of these share a category, not a quantity.
 */
const GENERIC_HEADS = [
  '速率', '强度', '成本', '代价', '容量', '密度', '规模', '数量', '比例', '概率',
  '时长', '时间', '距离', '分布', '可见性', '复杂度', '不可逆度', '频率', '尺度', '阈值',
];

/**
 * Several renderings of ONE quantity inside a single structure, grouped by the
 * mathematical symbol they share.
 *
 * The symbol is the author's own statement of identity, and it is far stronger
 * evidence than surface similarity. Maximum-entropy inference writes its
 * constraint five ways across five substrates — 约束 ⟨f_k⟩, 约束/能量项 f_k,
 * 生态约束 ⟨f_k⟩, 神经约束 ⟨f_k⟩, 能量/约束项 f_k — and bigram overlap catches
 * three of them; the symbol catches all five. Its distribution p is written
 * five ways too, and bigram overlap catches none of those.
 *
 * The flavouring is not sloppiness: 生态约束 and 神经约束 are the correct
 * substrate-specific renderings, and rewriting them to one phrase would delete
 * the very thing a mapping exists to record. What is missing is only the
 * statement that they render one abstract quantity, and that is what this
 * reports — as a candidate, for a person, never applied.
 */
export interface QuantityVariantGroup {
  structureId: string;
  /** The shared symbol. This is the evidence, and it is what makes the group. */
  symbol: string;
  /** Distinct renderings, verbatim, each with the mapping it came from. */
  renderings: Array<{ slug: string; text: Bilingual }>;
  check: Bilingual;
}

export interface QuantityIndex {
  groups: QuantityGroup[];
  /** Symbol-backed candidate groupings, within one structure. Never applied. */
  withinStructureVariants: QuantityVariantGroup[];
  /**
   * Correspondence quantities carrying no symbol at all. The symbol rule cannot
   * see these, and saying so is the point: 119 of 193 at the time of writing,
   * so a reader must not take the variant groups as a complete account of how
   * much the catalogue repeats itself.
   */
  symbollessQuantities: number;
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

/**
 * The mathematical symbols a quantity name carries: a bracketed ⟨f_k⟩, or a
 * lone Latin/Greek letter with an optional subscript, standing clear of any
 * surrounding word. Parenthesised asides are dropped first so that an argument
 * list like (r,t) does not read as three separate symbols.
 *
 * Returns them sorted, so the joined key is stable regardless of writing order.
 */
export function symbolsIn(text: string): string[] {
  const stripped = text.replace(/[（(].*?[）)]/g, ' ');
  const found = new Set<string>();
  for (const match of stripped.matchAll(/⟨\s*([A-Za-zα-ωΑ-Ω][A-Za-z0-9_^]*)\s*⟩/g)) {
    found.add(match[1]!.replace(/\s/g, ''));
  }
  for (const match of stripped.matchAll(/(?<![A-Za-z])([A-Za-zα-ωΑ-Ω])(?:[_^]\{?([A-Za-z0-9]+)\}?)?(?![A-Za-z])/g)) {
    found.add(match[2] ? `${match[1]}_${match[2]}` : match[1]!);
  }
  return [...found].sort();
}

/** Longest run of characters the two keys share, by simple DP. */
function longestCommonRun(a: string, b: string): string {
  let best = '';
  const row = new Array<number>(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    let prevDiagonal = 0;
    for (let j = 1; j <= b.length; j++) {
      const carried = row[j]!;
      if (a[i - 1] === b[j - 1]) {
        row[j] = prevDiagonal + 1;
        if (row[j]! > best.length) best = a.slice(i - row[j]!, i);
      } else {
        row[j] = 0;
      }
      prevDiagonal = carried;
    }
  }
  return best;
}

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
      const fragment = longestCommonRun(keys[i]!, keys[j]!);
      const headOnly = GENERIC_HEADS.includes(fragment);
      mergeCandidates.push({
        a: keys[i]!,
        b: keys[j]!,
        similarity: Math.round(similarity * 1000) / 1000,
        sharedFragment: fragment,
        sharedHeadOnly: headOnly,
        check: headOnly
          ? {
            zh: `这两个写法的全部重合只是一个通用中心词「${fragment}」。共享中心词说明它们属于同一类量，不说明它们是同一个量——默认应当否掉，除非复核者能说出它们在各自结构里做的是同一件事。`,
            en: `Everything these two share is the generic head 「${fragment}」. A shared head puts them in one category, not in one quantity — the default is to reject unless a reviewer can say they do the same work inside their respective structures.`,
          }
          : {
            zh: '复核者要判断这两个写法指的是不是同一个量。字面接近不构成同一——不同基底里同名的量常常各做各的事，合并会把一条本不存在的跨域连接凭空造出来。',
            en: 'A reviewer must decide whether these two wordings name one quantity. Surface similarity is not identity — same-named quantities in different substrates often do different work, and merging would manufacture a cross-domain link that was never there.',
          },
      });
    }
  }
  mergeCandidates.sort((a, b) => b.similarity - a.similarity || (a.a < b.a ? -1 : 1));

  // ── symbol-backed variant groups, within one structure ────────────────────
  const withinStructureVariants: QuantityVariantGroup[] = [];
  let symbollessQuantities = 0;
  for (const structure of structures) {
    if (structure.mappings.length === 0) continue;
    const bySymbol = new Map<string, Array<{ slug: string; text: Bilingual }>>();
    for (const mapping of structure.mappings) {
      for (const correspondence of mapping.correspondences ?? []) {
        const symbols = symbolsIn(correspondence.quantity.zh);
        if (symbols.length === 0) { symbollessQuantities += 1; continue; }
        const key = symbols.join('+');
        const list = bySymbol.get(key) ?? [];
        list.push({ slug: mapping.slug, text: correspondence.quantity });
        bySymbol.set(key, list);
      }
    }
    for (const [symbol, renderings] of [...bySymbol].sort()) {
      const distinct = new Set(renderings.map((rendering) => normaliseQuantity(rendering.text.zh)));
      // One rendering, or the same rendering repeated, is not a variant group.
      if (renderings.length < 2 || distinct.size < 2) continue;
      withinStructureVariants.push({
        structureId: structure.id,
        symbol,
        renderings,
        check: {
          zh: `这些说法在本结构内共用符号 ${symbol}，很可能是同一个抽象量的不同基底措辞。复核者要确认的是符号确实指同一个量——同一个字母被用来表示两件事是常见的，例如自由能 F 与自由能差 ΔF 就不是一个量。措辞本身不要改写：基底特有的说法正是映射存在的理由。`,
          en: `These renderings share the symbol ${symbol} inside this structure and are probably one abstract quantity written for different substrates. What a reviewer must confirm is that the symbol really denotes one quantity — the same letter standing for two things is common, free energy F against a free-energy difference ΔF being one case. The wordings themselves should not be rewritten: substrate-specific phrasing is why the mapping exists.`,
        },
      });
    }
  }

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
    withinStructureVariants,
    symbollessQuantities,
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
 * What licenses treating several renderings as one abstract quantity.
 *
 * `index+symbol` — the renderings sit at the same position in every mapping's
 *   correspondence list AND carry compatible symbols. Strongest available.
 * `index`        — same position, and no symbols anywhere to cross-check.
 * `conflict`     — same position, incompatible symbols. A person must look.
 * `ragged`       — the mappings do not even agree on how many quantities the
 *   structure has, so position carries no information here.
 *
 * A caution that travels with the first of these: position and symbol are NOT
 * independent evidence. Both are produced by the same curator in the same act,
 * and an author who lists roles in a consistent order is the same author who
 * uses symbols consistently. Their agreement raises confidence in a reading of
 * the text; it does not corroborate the reading from a second source.
 */
export type QuantityRoleBasis = 'index+symbol' | 'index' | 'conflict' | 'ragged';

export interface QuantityRole {
  /** Position within each mapping's correspondence list. */
  slot: number;
  /** Pointers into the structure's own mappings: [mapping, correspondence]. */
  renderings: Array<readonly [number, number]>;
  /** Symbols seen at this slot, when any. */
  symbols: string[];
}

export interface StructureQuantityRoles {
  structureId: string;
  basis: QuantityRoleBasis;
  roles: QuantityRole[];
  /** Present for `conflict`: the slots whose symbols disagree. */
  conflictingSlots: number[];
  check: Bilingual;
}

/** Symbol sets agree when, for every pair, one contains the other. */
function symbolSetsCompatible(sets: string[][]): boolean {
  for (let i = 0; i < sets.length; i++) {
    for (let j = i + 1; j < sets.length; j++) {
      const a = sets[i]!;
      const b = sets[j]!;
      if (!a.every((t) => b.includes(t)) && !b.every((t) => a.includes(t))) return false;
    }
  }
  return true;
}

/**
 * Group each structure's correspondence quantities into candidate roles by the
 * position they occupy in every mapping.
 *
 * This is the signal the symbol rule could not reach. 119 of 193 correspondence
 * quantities carry no symbol at all — `distributed-field-observability` writes
 * its hidden field as 源事件与传播场, 编码源波形, 场源与外场 and 隐状态场 x(r,t)
 * across five substrates, and only the last two carry one — but all five sit at
 * position 0, and all five observation operators sit at position 1. Position is
 * what the author used to say these are the same role.
 *
 * Measured over the 31 structures carrying two or more mappings: 9 have
 * position and symbol corroborating each other, 13 offer position alone with no
 * symbol to check it against, 3 conflict, and 6 have mappings that disagree on
 * how many quantities there are at all. Nothing here is applied.
 */
export function projectQuantityRoles(structures: readonly SeedStructure[]): StructureQuantityRoles[] {
  const out: StructureQuantityRoles[] = [];
  for (const structure of structures) {
    if (structure.mappings.length < 2) continue;
    const widths = new Set(structure.mappings.map((mapping) => (mapping.correspondences ?? []).length));
    if (widths.size !== 1) {
      out.push({
        structureId: structure.id,
        basis: 'ragged',
        roles: [],
        conflictingSlots: [],
        check: {
          zh: '这个结构的各条映射连「有几个量」都不一致，所以位置不携带信息。要给它一份抽象量表，只能有人把这几条映射并排读一遍——这正是最需要人、也最不可推导的一类。',
          en: 'This structure\'s mappings do not even agree on how many quantities it has, so position carries no information. Giving it an abstract quantity list takes a person reading the mappings side by side — the case that most needs one and can least be derived.',
        },
      });
      continue;
    }
    const width = [...widths][0]!;
    const roles: QuantityRole[] = [];
    const conflictingSlots: number[] = [];
    let checkable = 0;
    for (let slot = 0; slot < width; slot++) {
      const renderings: Array<readonly [number, number]> = [];
      const symbolSets: string[][] = [];
      structure.mappings.forEach((mapping, mi) => {
        const correspondence = (mapping.correspondences ?? [])[slot];
        if (!correspondence) return;
        renderings.push([mi, slot] as const);
        const symbols = symbolsIn(correspondence.quantity.zh);
        if (symbols.length > 0) symbolSets.push(symbols);
      });
      if (symbolSets.length >= 2) {
        checkable += 1;
        if (!symbolSetsCompatible(symbolSets)) conflictingSlots.push(slot);
      }
      roles.push({ slot, renderings, symbols: [...new Set(symbolSets.flat())].sort() });
    }
    const basis: QuantityRoleBasis =
      conflictingSlots.length > 0 ? 'conflict' : checkable > 0 ? 'index+symbol' : 'index';
    out.push({
      structureId: structure.id,
      basis,
      roles,
      conflictingSlots,
      check: basis === 'conflict'
        ? {
          zh: `位置 ${conflictingSlots.join('、')} 上，各映射写的符号互不相容，说明它们并不在填同一个角色。复核者要判断的是：作者是把顺序写乱了，还是这个结构本来就没有一组固定角色。`,
          en: `At slot ${conflictingSlots.join(', ')} the mappings carry incompatible symbols, so they are not filling one role. A reviewer must decide whether the order simply slipped, or whether this structure has no fixed set of roles to begin with.`,
        }
        : basis === 'index+symbol'
          ? {
            zh: '同位置的说法带着相容的符号，很可能是同一个抽象量的不同基底措辞。注意位置与符号不是两个独立证据——它们出自同一位作者的同一次撰写，一致只说明这次撰写是自洽的。',
            en: 'Renderings at one slot carry compatible symbols and are probably one abstract quantity written for different substrates. Note that position and symbol are not two independent witnesses — both come from one curator in one act, and their agreement shows only that the act was self-consistent.',
          }
          : {
            zh: '同位置的说法没有任何符号可以互校，位置是唯一的依据。它在多数结构上看起来是对的，但一次顺序写乱就足以让整组失效，所以这一类比带符号的那一类更需要人读一眼。',
            en: 'There is no symbol at these slots to cross-check, so position is the only basis. It reads correctly in most structures, but one slipped ordering is enough to invalidate a whole group, which makes this class more in need of a reading than the symbol-backed one.',
          },
    });
  }
  return out;
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

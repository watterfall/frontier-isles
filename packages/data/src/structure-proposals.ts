import type { SeedStructure } from './structures';
import type { Bilingual } from './frontiers';

/**
 * Structure proposals — candidate 结构⇄岛 mappings that a human has NOT ratified.
 *
 * Why this file exists, and why it is not `structures.ts`.
 *
 * 222 of 371 islands appear in no ferry route, structure mapping, current or
 * interior: they open to a real briefing and connect to nothing. The obvious fix
 * is barred, and correctly. `structures.ts` states that its mappings are the
 * human-authored 映射 a curator rebuilt onto specific islands, "attached ONLY
 * where an island genuinely embodies the structure (no forced fit; that would be
 * the exact fabrication the project forbids)", and `architecture.md` gives the
 * ferryman "bridge-proposal rights only", with bridges "ratified by both
 * masters". An AI that writes 222 mappings is not doing the work; it is
 * counterfeiting it.
 *
 * What the architecture DOES sanction is a proposal. So this file holds
 * proposals, and three properties keep them from drifting into claims:
 *
 * 1. **A proposal is a pair of POINTERS, not a pair of strings.** The quantity
 *    is `{mapping, correspondence}` into the structure's own authored
 *    correspondences; the evidence is `{field, index}` into the island's own
 *    authored depth. Both are resolved at read time. Nothing here can be
 *    non-verbatim, because nothing here is a copy — the one authored field is
 *    `check`, and a `check` states what a reviewer must confirm rather than
 *    asserting that it holds.
 *
 * 2. **They are counted separately and never as coverage.** `audit-atlas.mjs`
 *    excludes them from all four relational layers. An island with a proposal
 *    and nothing else is still inert, and still in the 222.
 *
 * 3. **Ratifying one does not mean moving it here.** A ratified proposal is
 *    DELETED from this file and written by hand into `structures.ts` with the
 *    correspondences, prediction and boundary a mapping requires — fields no
 *    pointer can supply, because they are the curator's insight. This file
 *    shrinking is the sign of progress; this file growing is only the sign of a
 *    longer queue.
 *
 * How these were selected, and what that is worth. Two mechanical matchers were
 * built and measured first: CJK bigrams reached 222/222 islands with 4393
 * candidates — a matcher that reaches everything discriminates nothing — and
 * rare-English-term overlap still surfaced pairings joined by `already` and
 * `rather`. Both were thrown away. The recall set was then read by hand, which
 * is the only step that was ever going to work: the previous pass generated
 * candidates from shared cluster membership and a human reader rejected 378 of
 * 419, "the typical rejection [being] not a weak relationship but an ABSENT
 * QUANTITY" (`ledger/observations.jsonl`, obs-2026-08-09-003).
 *
 * That failure mode is the selection rule here, applied in both directions: a
 * pairing is proposed when the island's own text supplies the quantity, and
 * dropped when the island's own text says the quantity is missing — including
 * when it says so as an open question. `chemical-vision` was dropped against
 * `stateful-in-materia-computation` for exactly that: the structure needs an
 * internal state that persists, and the island's own sub-question asks whether
 * its chemistry does anything beyond "a fixed one-shot response". Spending a
 * reviewer on a pairing the island already doubts is how a queue becomes noise.
 */

export type DepthField = 'overview' | 'whyMatters' | 'ifAnswered' | 'approaches' | 'barrier' | 'subQuestions';

export interface StructureProposal {
  /** Island slug. Must be in FRONTIERS and must not already sit in an authored layer. */
  slug: string;
  /** `struct://...` id of an existing structure. */
  structureId: string;
  /**
   * Which authored quantity this island is proposed to supply — an INDEX PAIR
   * into `structure.mappings[m].correspondences[c].quantity`, never a copy of
   * the text. A typed-out string can drift from its source silently; an index
   * either resolves or throws.
   */
  quantity: { mapping: number; correspondence: number };
  /**
   * Where the island's own authored text supplies it. `index` addresses one
   * entry of an array-valued depth field and is omitted for the scalar ones.
   */
  evidence: { field: DepthField; index?: number };
  /**
   * The one authored field, and deliberately the weakest kind of claim: what a
   * reviewer has to confirm before this could become a mapping. Never an
   * argument that the mapping holds.
   */
  check: Bilingual;
  proposedBy: string;
  proposedAt: string;
}

/**
 * Each entry was selected by reading the island's full depth text against the
 * structure's authored quantities. The comment above each names the reading.
 */
export const STRUCTURE_PROPOSALS: StructureProposal[] = [
  {
    // The island's approach IS an identification strategy: negative-control
    // proxies + a confounding bridge function recover the effect without the
    // unfalsifiable "we measured every confounder" commitment. The structure's
    // 识别集 is what that procedure returns.
    slug: 'proximal-causal-identification-negative',
    structureId: 'struct://xfrontier/intervention-identifiability',
    quantity: { mapping: 4, correspondence: 1 },
    evidence: { field: 'approaches', index: 0 },
    check: {
      zh: '复核这一条要判断的是：近端识别返回的「识别集」与本结构说的是否同一个量，还是只是共用了「识别」二字。岛自身的障碍已给出判据——一旦代理被处理影响，识别会悄悄失效，而这一步难以从数据端证伪。',
      en: 'What a reviewer must settle: whether the identified set proximal learning returns is the same quantity this structure names, or merely shares the word "identification". The island states the test itself — if a proxy is touched by the treatment, identification fails silently, and that step is hard to falsify from the data side.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-10',
  },
  {
    // The strongest of the set: the structure's authored quantity is "a
    // closed-set classifier cramming the unknown into its nearest known label",
    // and the island's own barrier describes precisely that happening — a model
    // emitting plausible-looking annotations for genes with no ground truth,
    // faster than wet-lab work can check them.
    slug: 'metagenomic-foundation-models-reading-function',
    structureId: 'struct://xfrontier/open-set-recognition',
    quantity: { mapping: 4, correspondence: 0 },
    evidence: { field: 'barrier' },
    check: {
      zh: '复核要点：模型给暗物质基因的标注，是否真的等价于「把未知强行塞进最近的已知标签」——还是它已经有某种显式的「拒识」输出。若无拒识出口，本结构的开放空间风险就是这个岛缺失真值问题的正式写法；若有，则该结构的适用点在别处。',
      en: 'What a reviewer must settle: whether the model labelling dark-matter genes really is the closed-set failure — cramming an unknown into its nearest known label — or whether it already has an explicit reject option. Without one, this structure\'s open-space risk is the formal statement of the island\'s missing-ground-truth problem; with one, the structure attaches somewhere else.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-10',
  },
  {
    // "Detected" vs "present" is the selection equation stated in ecological
    // terms: what enters the sample is not random, and the island's first
    // approach is explicitly to build the transfer model between detection and
    // true density rather than stopping at presence/absence.
    slug: 'airborne-edna-biodiversity-surveys',
    structureId: 'struct://xfrontier/selection-bias-absence',
    quantity: { mapping: 1, correspondence: 0 },
    evidence: { field: 'approaches', index: 0 },
    check: {
      zh: '复核要点：空中 eDNA 的「测到 vs 在场」是否真的是一个选择方程问题（谁有机会进入样本），还是主要是灵敏度/检出限问题。二者的区别在于：前者需要对缺席显式建模，后者只需标定仪器。',
      en: 'What a reviewer must settle: whether airborne eDNA\'s "detected vs present" gap really is a selection equation — who gets a chance to enter the sample — or primarily a sensitivity and detection-limit problem. The difference matters: the first requires modelling absence explicitly, the second only requires calibrating the instrument.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-10',
  },
  {
    // The device is proposed as an entropy source and a deterministic logic
    // element from the same physics. Entropy here is not a metaphor: the
    // island's own approach reports passing NIST-800, which is a measurement of
    // exactly this quantity.
    slug: 'stochastic-memristors-turning-device',
    structureId: 'struct://xfrontier/shannon-entropy',
    quantity: { mapping: 0, correspondence: 0 },
    evidence: { field: 'approaches', index: 1 },
    check: {
      zh: '复核要点：器件涨落的熵是否可作为一个稳定的信源熵来处理——岛自身的障碍指出涨落随温度与循环老化漂移，也就是这个量并非平稳。一个漂移的熵率是否还落在本结构的适用范围内，是这条提议的成败处。',
      en: 'What a reviewer must settle: whether the device\'s fluctuation entropy can be treated as a stationary source entropy at all. The island\'s own barrier says the fluctuations drift with temperature and cycling — that is, the quantity is not stationary. Whether a drifting entropy rate still falls inside this structure is where this proposal stands or falls.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-10',
  },
  {
    // Cultivation buys fidelity by discarding failed attempts — the island
    // reports keeping about 8%. That is a rate: reliability bought with
    // overhead, which is the structure's k/n.
    slug: 'magic-state-cultivation-cheap',
    structureId: 'struct://xfrontier/error-correcting-redundancy',
    quantity: { mapping: 3, correspondence: 1 },
    evidence: { field: 'barrier' },
    check: {
      zh: '复核要点：后选择丢弃率（保留约 8%）是否与码率 k/n 是同一种「为可靠性付出的开销」，还是两种不同的开销——前者丢的是尝试，后者花的是空间。若不是同一个量，这条应改挂在别处或退回。',
      en: 'What a reviewer must settle: whether a post-selection discard rate (about 8% kept) is the same "overhead paid for reliability" as a code rate k/n, or a different one — the first discards attempts, the second spends space. If they are not the same quantity, this belongs elsewhere or nowhere.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-10',
  },
  {
    // zkML turns "this computation ran as claimed" into a cryptographic object.
    // That is the structure's verification-and-provenance interface, made
    // machine-checkable rather than social.
    slug: 'zero-knowledge-verifiable-scientific-computation',
    structureId: 'struct://xfrontier/executable-knowledge',
    quantity: { mapping: 2, correspondence: 1 },
    evidence: { field: 'approaches', index: 0 },
    check: {
      zh: '复核要点：零知识证明给出的是「计算按声称方式执行」的出处保证，而本结构的验证接口要求的是主张可被组合与复核。二者是同一个接口，还是证明只覆盖了执行、没有覆盖组合？岛自身障碍（电路只支持约 50/120+ 算子）正好是这个界限的量化。',
      en: 'What a reviewer must settle: a zero-knowledge proof certifies that a computation ran as claimed, while this structure\'s interface asks for claims that compose and can be re-checked. Same interface, or does the proof cover execution but not composition? The island\'s own barrier — circuits supporting roughly 50 of 120+ operators — quantifies exactly that limit.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-10',
  },
  {
    // A Research monad forcing an error budget update before a test, with the
    // FDR theorem proved in Lean4, is a validator in the structure's sense: the
    // claim cannot be made without passing through it.
    slug: 'structural-enforcement-statistical-rigor',
    structureId: 'struct://xfrontier/executable-knowledge',
    quantity: { mapping: 3, correspondence: 1 },
    evidence: { field: 'approaches', index: 0 },
    check: {
      zh: '复核要点：类型系统强制的误差预算是否构成本结构意义上的「验证器」——即接口不兼容时会失败，而不只是提醒。岛自身的障碍指出统计护栏可能连真发现一并筛掉，这正是验证器过严时的代价，应一并判断。',
      en: 'What a reviewer must settle: whether a type-enforced error budget is a validator in this structure\'s sense — one that FAILS on an incompatible interface rather than merely warning. The island\'s own barrier notes the guardrails may filter out counter-intuitive true findings, which is the cost of a validator set too tight, and belongs in the same judgement.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-10',
  },
  {
    // Iterative refinement lifting a 3-bit analog array to 24-bit equivalent is
    // reliability bought from unreliable parts, which is this structure's
    // sentence almost verbatim. Note which structure this is NOT: the island
    // says "precision ceiling", which reads like a Cramér-Rao bound — but a
    // Fisher bound cannot be broken by iterating, and this one is. Picking
    // fisher-precision-limit on the word "precision" would have been the forced
    // fit the repo forbids.
    slug: 'analog-solver',
    structureId: 'struct://xfrontier/error-correcting-redundancy',
    quantity: { mapping: 1, correspondence: 1 },
    evidence: { field: 'approaches', index: 1 },
    check: {
      zh: '复核要点：迭代细化的「高精度乘加去修低精度求逆」是否构成本结构意义上的校验与重写——即存在一个可界定的「错了多少还能救回来」的余量，还是只是数值迭代、没有码距那样的判据。岛自身障碍（器件漂移随矩阵变大）正是这个余量会不会被吃掉的地方。',
      en: 'What a reviewer must settle: whether iterative refinement — high-precision multiply-accumulate correcting a low-precision inverse — is check-and-rewrite in this structure\'s sense, meaning there is a bounded "how much error is still recoverable", or whether it is numerical iteration with no distance-like criterion. The island\'s own barrier, device drift growing with matrix size, is exactly where that margin would be eaten.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-10',
  },
  {
    // A within-family design is an identification strategy: it names the
    // assumptions under which a genetic effect is separated from shared
    // environment. The island's barrier states the residual — gene-environment
    // correlation that the design does not remove — which is the assumption set
    // this structure asks to be written down.
    slug: 'sociogenomics',
    structureId: 'struct://xfrontier/intervention-identifiability',
    quantity: { mapping: 4, correspondence: 0 },
    evidence: { field: 'approaches', index: 0 },
    check: {
      zh: '复核要点：同胞内设计给出的是一个「识别所需假设集」，还是只是一个偏差更小的估计？二者的区别是能否写下「在什么条件下这个效应被识别」。岛自身障碍说家庭内 PGI 预测力明显缩水且基因—环境相关剥不干净，正是这个假设集是否成立的判据。',
      en: 'What a reviewer must settle: whether a within-family design yields an assumption set under which the effect is identified, or merely a less biased estimate. The difference is whether one can write down the conditions for identification at all. The island\'s barrier — predictive power shrinking within families, gene-environment correlation not cleanly separable — is the test of whether that set holds.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-10',
  },
  {
    // The island is about deliberately firing a self-reinforcing cascade across
    // coupled socio-technical systems, and names mutual-ignition mechanisms
    // between S-curves. That is the structure's critical point, read forwards
    // instead of as a hazard.
    slug: 'positive-tipping-cascades-engineering-self',
    structureId: 'struct://xfrontier/network-cascade',
    quantity: { mapping: 2, correspondence: 0 },
    evidence: { field: 'approaches', index: 0 },
    check: {
      zh: '复核要点：社会临界阈值是否与渗流意义上的临界点是同一个量（存在可定位的控制参数与序参量），还是一个借用的说法。岛自身障碍给出了最强的反对理由——社会阈值极难事前定位、事后易被叙事收编；若无法事前定位，这个「临界点」就不是本结构的那个量。',
      en: 'What a reviewer must settle: whether a social tipping threshold is the same quantity as a percolation critical point — a locatable control parameter with an order parameter — or a borrowed phrase. The island\'s own barrier is the strongest objection on record: social thresholds are very hard to locate in advance and easily absorbed afterwards into "we knew all along". A threshold that cannot be located in advance is not this structure\'s quantity.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-10',
  },
];

/** A proposal with its pointers resolved against the human-authored sources. */
export interface ResolvedProposal {
  slug: string;
  structureId: string;
  structureTitle: Bilingual;
  structureStatement: Bilingual;
  /** Verbatim from the structure's own authored correspondence. */
  quantity: Bilingual;
  /** Verbatim from the island's own authored depth. */
  evidence: { field: DepthField; text: Bilingual };
  check: Bilingual;
  proposedBy: string;
  proposedAt: string;
}

/**
 * What `resolveProposal` needs, supplied by the caller.
 *
 * This module deliberately VALUE-IMPORTS NOTHING. Reaching for `SEED_STRUCTURES`
 * and `FRONTIERS` here would be the natural way to write it and would drag
 * ~1MB of seed data behind a two-field lookup — the same shape as the failure
 * that put the web entry chunk 85 KiB over budget, where a two-line helper
 * anchored 261 KiB of catalogue. Every caller already holds these: the L1 screen
 * has the island's depth from its detail payload and loads structures lazily for
 * the structure lens, and the audit has both modules open.
 */
export interface ProposalSources {
  structure: Pick<SeedStructure, 'id' | 'title' | 'statement' | 'mappings'>;
  /** The island's own `depth`, as authored. */
  depth: Record<string, Bilingual | Bilingual[] | undefined>;
}

/**
 * Resolves one proposal, or throws.
 *
 * Throwing is the point. A pointer into data that has since moved must not
 * quietly resolve to a neighbouring quantity or to nothing — a proposal that
 * silently changes what it claims is worse than one that fails loudly, and both
 * the data tests and the atlas audit turn every throw into a visible failure.
 */
export function resolveProposal(p: StructureProposal, sources: ProposalSources): ResolvedProposal {
  const s = sources.structure;
  if (s.id !== p.structureId) throw new Error(`proposal ${p.slug}: given structure ${s.id}, expected ${p.structureId}`);
  const m = s.mappings[p.quantity.mapping];
  if (!m) throw new Error(`proposal ${p.slug}: ${p.structureId} has no mapping ${p.quantity.mapping}`);
  const c = m.correspondences[p.quantity.correspondence];
  if (!c) throw new Error(`proposal ${p.slug}: mapping ${p.quantity.mapping} has no correspondence ${p.quantity.correspondence}`);

  const field = sources.depth[p.evidence.field];
  const text = Array.isArray(field) ? field[p.evidence.index ?? 0] : field;
  if (!text || typeof text.zh !== 'string' || typeof text.en !== 'string') {
    throw new Error(`proposal ${p.slug}: depth.${p.evidence.field}[${p.evidence.index ?? '-'}] is not bilingual text`);
  }

  return {
    slug: p.slug,
    structureId: p.structureId,
    structureTitle: s.title,
    structureStatement: s.statement,
    quantity: c.quantity,
    evidence: { field: p.evidence.field, text },
    check: p.check,
    proposedBy: p.proposedBy,
    proposedAt: p.proposedAt,
  };
}

/**
 * The unresolved proposals for one island — empty for most, by design.
 * Callers resolve each with the structure they already hold.
 */
export function proposalsFor(slug: string): StructureProposal[] {
  return STRUCTURE_PROPOSALS.filter((p) => p.slug === slug);
}

/** Structure ids a caller must load to resolve this island's proposals. */
export function structureIdsFor(slug: string): string[] {
  return [...new Set(proposalsFor(slug).map((p) => p.structureId))];
}

/** Every island this file proposes something for. Never a coverage number. */
export const PROPOSED_SLUGS: ReadonlySet<string> = new Set(STRUCTURE_PROPOSALS.map((p) => p.slug));

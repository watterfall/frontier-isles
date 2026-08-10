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

/**
 * What the proposal claims about the pair.
 *
 * `embodies` — the island supplies the quantity; this is a candidate mapping.
 *
 * `breaks` — the island is where this structure FAILS, and its own text says
 * why. Added after reading all 222 inert islands, because several of the most
 * informative pairings are negative: rate-induced tipping collapses without
 * crossing a threshold at all, so a critical point is the wrong quantity for
 * it; a gene drive has no correction step because evolution has no undo, so a
 * model-intervention-correction loop cannot close; active matter has no
 * equilibrium free energy, which is the quantity that structure is built on.
 *
 * These are worth recording rather than discarding. This repository already
 * treats a structure with no rebuilt islands as "a pure frontier, the map's
 * honest dashed field" — a named place where a standard toolkit provably does
 * not reach is the same kind of fact, and it is the more useful one for a
 * reader about to reach for that toolkit. It is also the safer thing for a
 * model to propose: asserting that something does NOT apply, with the island's
 * own sentence as the evidence, claims less than asserting that it does.
 */
export type ProposalRelation = 'embodies' | 'breaks';

export interface StructureProposal {
  /** Island slug. Must be in FRONTIERS and must not already sit in an authored layer. */
  slug: string;
  /** `struct://...` id of an existing structure. */
  structureId: string;
  relation: ProposalRelation;
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
    relation: 'embodies',
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
    relation: 'embodies',
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
    relation: 'embodies',
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
    relation: 'embodies',
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
    relation: 'embodies',
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
    relation: 'embodies',
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
    relation: 'embodies',
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
    relation: 'embodies',
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
    relation: 'embodies',
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
    relation: 'embodies',
    quantity: { mapping: 2, correspondence: 0 },
    evidence: { field: 'approaches', index: 0 },
    check: {
      zh: '复核要点：社会临界阈值是否与渗流意义上的临界点是同一个量（存在可定位的控制参数与序参量），还是一个借用的说法。岛自身障碍给出了最强的反对理由——社会阈值极难事前定位、事后易被叙事收编；若无法事前定位，这个「临界点」就不是本结构的那个量。',
      en: 'What a reviewer must settle: whether a social tipping threshold is the same quantity as a percolation critical point — a locatable control parameter with an order parameter — or a borrowed phrase. The island\'s own barrier is the strongest objection on record: social thresholds are very hard to locate in advance and easily absorbed afterwards into "we knew all along". A threshold that cannot be located in advance is not this structure\'s quantity.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-10',
  },

  // ── 2026-08-11, after reading the barrier of every one of the 222 ──────────
  //
  // Reading them all at once showed something one-at-a-time selection hides:
  // the islands arrive in FAMILIES. Four separate astrobiology islands are each
  // building the distribution a NON-living process can produce, because without
  // it no measurement is a biosignature — that is one structure with four
  // islands waiting, not four unrelated pairings. The same held for modelling
  // absence, for domain transfer, and for field inversion. Grouping the
  // proposals by structure is therefore not presentation: it is what the corpus
  // turned out to look like once read.

  // ── anomaly-as-signal · the background model comes before the residual ────
  {
    // The island's third approach is literally building the natural end-member
    // model against which a methane signal would have to stand out.
    slug: 'abiotic-null-models-isotopic-fractionation',
    structureId: 'struct://xfrontier/anomaly-as-signal',
    relation: 'embodies',
    quantity: { mapping: 1, correspondence: 0 },
    evidence: { field: 'approaches', index: 2 },
    check: {
      zh: '复核要点：非生物端空模型是否构成本结构说的「平滑背景模型」——即一个可外推、能给出残差的模型，还是只是一组散点标定。岛自身障碍说生物与非生物同位素分布本就重叠，那正是背景模型必须窄到什么程度才有用的判据。',
      en: 'What a reviewer must settle: whether an abiotic end-member model is a background model in this structure\'s sense — one that extrapolates and yields a residual — or merely a set of calibration points. The island\'s barrier notes that biotic and abiotic isotope distributions already overlap, which is precisely the test of how tight the background has to be before a residual means anything.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },
  {
    // "Output the population distribution of biomorph shapes, not a single
    // representative image" is the known-behaviour manifold, stated as method.
    slug: 'abiotic-null-library-mineral-biomorphs',
    structureId: 'struct://xfrontier/anomaly-as-signal',
    relation: 'embodies',
    quantity: { mapping: 0, correspondence: 0 },
    evidence: { field: 'approaches', index: 0 },
    check: {
      zh: '复核要点：矿物自组织的形态分布能否当作「已知行为流形」——即一个可判定「落在里面/落在外面」的集合。岛自身障碍给了最强的限制：形态相似只证明生物不是唯一成因，不能证明某块样本一定非生物，所以这个流形只能用于排除，不能用于确认。',
      en: 'What a reviewer must settle: whether the population of mineral self-organised shapes can serve as a known-behaviour manifold — a set against which "inside or outside" is decidable. The island states the sharpest limit itself: morphological similarity shows only that biology is not the sole cause, never that a given sample is abiotic, so this manifold can exclude but cannot confirm.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },
  {
    slug: 'molecular-chirality-homochirality-life-signatures',
    structureId: 'struct://xfrontier/anomaly-as-signal',
    relation: 'embodies',
    quantity: { mapping: 1, correspondence: 0 },
    evidence: { field: 'approaches', index: 1 },
    check: {
      zh: '复核要点：「可达的非生物对映体过量上限」是否是一个真正的背景模型（有确定的上界），还是一条会随母体过程知识更新而移动的软线。岛自身障碍指出陨石母体过程本身就能造出对映体过量——若上界不封闭，残差就无法定义。',
      en: 'What a reviewer must settle: whether "the reachable abiotic enantiomeric excess ceiling" is a genuine background model with a fixed upper bound, or a soft line that moves as knowledge of meteoritic parent-body chemistry changes. The island notes those processes alone can produce enantiomeric excess — if the bound is not closed, no residual can be defined.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },
  {
    slug: 'molecular-diversity-biosignature-ecodiversity-metrics',
    structureId: 'struct://xfrontier/anomaly-as-signal',
    relation: 'embodies',
    quantity: { mapping: 0, correspondence: 0 },
    evidence: { field: 'approaches', index: 0 },
    check: {
      zh: '复核要点：生物/非生物对照分布是否足以把「均匀度」变成一个可判定的残差。岛自身障碍说得很清楚——均匀度是统计判据而非机制判据，地质浓缩与选择性降解都能伪造它；若对照基线没做全，这条不成立。',
      en: 'What a reviewer must settle: whether a biotic/abiotic control distribution is enough to turn evenness into a decidable residual. The island is explicit: evenness is a statistical criterion, not a mechanistic one, and geological concentration or selective degradation can forge it. If the control baselines are incomplete, this does not hold.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },
  {
    // A 1% discrepancy that is either an unmodelled systematic or a new decay
    // channel is the structure's sentence with the field names changed.
    slug: 'beam-bottle-discrepancy-free-neutron-lifetime',
    structureId: 'struct://xfrontier/anomaly-as-signal',
    relation: 'embodies',
    quantity: { mapping: 0, correspondence: 1 },
    evidence: { field: 'approaches', index: 0 },
    check: {
      zh: '复核要点：束流法与储存法之差要成为「受控残差」，前提是背景（通量监视、计数效率、壁损失）已被控制到 1% 以下。岛自身障碍指出两法测的根本不是同一个可观测量——若如此，这个差就不是同一个量的残差，本结构不适用。',
      en: 'What a reviewer must settle: for the beam-versus-bottle gap to be a controlled residual, the background — flux monitoring, counting efficiency, wall losses — must already be controlled below 1%. The island states that the two methods do not measure the same observable at all; if so, the gap is not a residual of one quantity and this structure does not apply.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },

  // ── selection-bias-absence · what was not seen has to be modelled ─────────
  {
    // Writing method-dependent detection probability into the likelihood is the
    // selection equation, built rather than assumed away.
    slug: 'occupancy-models-transplanted-pathogen-surveillance',
    structureId: 'struct://xfrontier/selection-bias-absence',
    relation: 'embodies',
    quantity: { mapping: 1, correspondence: 1 },
    evidence: { field: 'approaches', index: 1 },
    check: {
      zh: '复核要点：把各方法的检出概率写进似然，是否等于本结构说的「对缺席建模」。岛自身障碍给出了失效条件——检出概率与真实患病率在数据里高度耦合，闭合假设一破裂，两者会同时偏移；那正是这个模型能不能撑到「宣布消除」的地方。',
      en: 'What a reviewer must settle: whether writing each method\'s detection probability into the likelihood is what this structure means by modelling the absent. The island names the failure condition: detection probability and true prevalence are strongly coupled in the data, and once the closure assumption breaks both shift together — which is exactly where this model does or does not stretch to declaring elimination.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },
  {
    // "The species that should be here and are not" is the absent, made into a
    // quantity — and the island's barrier is the circularity that threatens it.
    slug: 'dark-diversity-ecology',
    structureId: 'struct://xfrontier/selection-bias-absence',
    relation: 'embodies',
    quantity: { mapping: 1, correspondence: 1 },
    evidence: { field: 'approaches', index: 0 },
    check: {
      zh: '复核要点：从共现关系反推「适宜物种池」，是对缺席建模，还是循环论证？岛自身把这个判据写出来了——观测本身早已被人类影响塑形，用被改造过的数据定义「本该出现」，极易循环。判定标准应是：这个池能否被独立于共现数据的证据证伪。',
      en: 'What a reviewer must settle: whether inferring a suitable species pool from co-occurrence is modelling the absent or arguing in a circle. The island supplies the test: the observations have already been reshaped by human impact, so defining "should have been here" from reshaped data risks circularity. The criterion is whether that pool can be falsified by evidence independent of the co-occurrence data.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },

  // ── covariate-shift-transfer · what changed and what stayed ───────────────
  {
    slug: 'calibrated-uncertainty-help-seeking-robot-policies',
    structureId: 'struct://xfrontier/covariate-shift-transfer',
    relation: 'embodies',
    quantity: { mapping: 1, correspondence: 1 },
    evidence: { field: 'approaches', index: 0 },
    check: {
      zh: '复核要点：conformal 要求的「可交换性」与本结构说的「可迁移性判定条件」是不是同一个东西。岛自身障碍说部署分布几乎必然漂移——若漂移的是输入分布，重加权还有救；若漂移的是条件关系本身，搬运就失效。这两种情况必须先分开。',
      en: 'What a reviewer must settle: whether conformal prediction\'s exchangeability requirement is the same thing this structure calls a transferability condition. The island says deployment distributions drift almost by necessity — if what drifts is the input distribution, reweighting can still repair it; if the conditional relation itself drifts, transfer fails. Those two cases have to be separated first.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },
  {
    slug: 'animal-free-drug-safety-science',
    structureId: 'struct://xfrontier/covariate-shift-transfer',
    relation: 'embodies',
    quantity: { mapping: 1, correspondence: 0 },
    evidence: { field: 'approaches', index: 1 },
    check: {
      zh: '复核要点：从器官芯片/类器官搬到人体，「什么在搬运中保持不变」能不能被写下来。岛自身障碍指出最硬的地方在验证——缺乏跨实验室可复现的金标准基准。若这个不变量写不出来，这条评估链就只是换了一个未经验证的代理，而不是一次可判定的迁移。',
      en: 'What a reviewer must settle: whether "what stays invariant under the move" from organ-chips and organoids to humans can actually be written down. The island names validation as the hardest point — there is no cross-lab reproducible gold-standard benchmark. If that invariant cannot be stated, the chain is simply a different unvalidated proxy rather than a transfer whose validity is decidable.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },

  // ── open-set-recognition · the cost of having no "I don't know" ───────────
  {
    // The structure's authored quantity is "the term no empirical risk can
    // estimate". The island's barrier: a true unknown unknown cannot, by
    // definition, be predicted from the system's own history. Same sentence.
    slug: 'an-early-warning-science-for',
    structureId: 'struct://xfrontier/open-set-recognition',
    relation: 'embodies',
    quantity: { mapping: 5, correspondence: 1 },
    evidence: { field: 'barrier' },
    check: {
      zh: '复核要点：通用前兆（临界慢化、方差上升）是否真的覆盖了「经验风险估不出的那一项」，还是只覆盖了已知类型冲击的前兆。岛自身障碍把界限说死了——真正的未知未知按定义不可由系统自身历史预测；若通用信号只在已见过的相变上成立，这条就退化成封闭集问题。',
      en: 'What a reviewer must settle: whether generic precursors — critical slowing down, rising variance — actually cover the term no empirical risk can estimate, or only the precursors of shocks whose type is already known. The island states the boundary flatly: a genuine unknown unknown cannot by definition be predicted from the system\'s own history. If the generic signal holds only for transitions already seen, this collapses back into a closed-set problem.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },

  // ── distributed-field-observability · source versus medium ────────────────
  {
    // The structure names 场源与外场 — telling the source apart from the field
    // it travels through. The island's barrier is that exact confusion: a
    // change in the noise source is read as a change in the medium.
    slug: 'ambient-seismic-interferometry-transplanted-subglacial',
    structureId: 'struct://xfrontier/distributed-field-observability',
    relation: 'embodies',
    quantity: { mapping: 2, correspondence: 0 },
    evidence: { field: 'barrier' },
    check: {
      zh: '复核要点：本结构要求传递函数、传感孔径与背景噪声先被标定，才能反演事件。这个岛的问题恰恰是噪声源本身不稳定——源变被读成介质变。判定的是：在没有独立真值（冰下无法核对）的条件下，源与介质能否分开，还是这条反演原理上就不唯一。',
      en: 'What a reviewer must settle: this structure requires the transfer function, sensing aperture and background noise to be calibrated before an event can be inverted. Here the noise source itself is unstable, so a change in the source reads as a change in the medium. The question is whether source and medium can be separated with no independent ground truth available beneath the ice, or whether the inversion is non-unique in principle.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },
  {
    slug: 'cable-bacteria-biogeophysical-signals',
    structureId: 'struct://xfrontier/distributed-field-observability',
    relation: 'embodies',
    quantity: { mapping: 1, correspondence: 1 },
    evidence: { field: 'barrier' },
    check: {
      zh: '复核要点：沉积物的电位场要成为可反演的观测量，需要一个确定的基底传递函数。岛自身障碍说相似的电位与 pH 梯度可由扩散、矿物反应或其他电活性微生物产生，反演并不唯一——那么这个传递函数是可标定的，还是根本不存在唯一解？',
      en: 'What a reviewer must settle: for a sediment potential field to be an invertible observable it needs a determinate substrate transfer function. The island says similar potential and pH gradients can arise from diffusion, mineral reactions or other electroactive microbes, so the inversion is not unique — is that transfer function calibratable, or is there simply no unique solution?',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },

  // ── stateful-in-materia-computation ───────────────────────────────────────
  {
    // The structure's own statement supplies the test: hysteresis is
    // computation only when state update, operator and readout are all
    // reproducible. The island's barrier is that they are not, yet.
    slug: 'fungal-mycelial-physical-reservoir-computing',
    structureId: 'struct://xfrontier/stateful-in-materia-computation',
    relation: 'embodies',
    quantity: { mapping: 0, correspondence: 0 },
    evidence: { field: 'barrier' },
    check: {
      zh: '复核要点：本结构明说——只有状态更新、算子与读出都可复现，迟滞才构成计算而不只是漂移。这个岛自己写着活体基底逐日漂移、同一块菌丝不同批次给出不同状态空间。所以要判的是：这是「尚未标定」，还是「原理上不可复现」；前者是映射，后者不是。',
      en: 'What a reviewer must settle: this structure says outright that hysteresis is computation only when state update, operator and readout are each reproducible. The island records that the living substrate drifts daily and that the same mycelium yields a different state space between batches. So the judgement is whether that is "not yet calibrated" or "not reproducible in principle" — the first is a mapping, the second is not.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },

  // ── variational-free-energy ───────────────────────────────────────────────
  {
    slug: 'generative-emulation-protein-equilibrium-ensembles',
    structureId: 'struct://xfrontier/variational-free-energy',
    relation: 'embodies',
    quantity: { mapping: 3, correspondence: 0 },
    evidence: { field: 'barrier' },
    check: {
      zh: '复核要点：生成模型采出的构象分布，是不是本结构说的候选分布 q(x)——即一个其与真实分布之差被显式优化的对象。岛自身障碍写得很准：系综「看起来对」不等于概率权重对。判据应是相对自由能与实验或长时程模拟的定量吻合，而不是构象是否合理。',
      en: 'What a reviewer must settle: whether the conformational distribution a generative model samples is the candidate distribution q(x) this structure names — an object whose divergence from the true distribution is explicitly optimised. The island puts it precisely: an ensemble looking right is not the same as its probability weights being right. The criterion is quantitative agreement of relative free energies with experiment or long simulation, not whether the conformations look plausible.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },

  // ── synchronization ───────────────────────────────────────────────────────
  {
    slug: 'bio-inspired-swarm-robotics',
    structureId: 'struct://xfrontier/synchronization',
    relation: 'embodies',
    quantity: { mapping: 0, correspondence: 1 },
    evidence: { field: 'barrier' },
    check: {
      zh: '复核要点：群体机器人的「全局任务达成」是否可以写成一个序参量——一个随耦合强度变化、能标出临界的标量。岛自身障碍指出局部规则正确并不蕴含全局达成；若找不到这样的序参量，本结构提供的就只是类比，不是可用的工具。',
      en: 'What a reviewer must settle: whether a swarm\'s "global task achieved" can be written as an order parameter — a scalar that varies with coupling strength and marks a threshold. The island notes that locally correct rules do not entail global achievement; without such an order parameter this structure offers an analogy rather than a usable tool.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },

  // ── breaks · where the structure provably does not reach ──────────────────
  {
    // The island's whole point is collapse WITHOUT crossing a threshold: the
    // rate of forcing is the mechanism. A critical point is then the wrong
    // quantity, and saying so is more useful than a weak positive.
    slug: 'computable-criteria-for-rate-induced',
    structureId: 'struct://xfrontier/network-cascade',
    relation: 'breaks',
    quantity: { mapping: 2, correspondence: 0 },
    evidence: { field: 'barrier' },
    check: {
      zh: '复核要点：这条记录的是本结构在此失效。R-tipping 的崩溃不需要跨过任何阈值，速率本身就是机制，因此「临界点」不是这个岛的量。要判的是这个否定是否成立——是否存在一种表述，使速率诱导仍能被写成某个控制参数上的临界点；若存在，这条应改为正向映射。',
      en: 'What a reviewer must settle: this records the structure FAILING here. Rate-induced tipping collapses without crossing any threshold — the rate of forcing is itself the mechanism — so a critical point is not this island\'s quantity. The judgement is whether that negative holds, or whether some formulation still writes rate-induced tipping as a critical point in a control parameter; if one does, this should become a positive mapping instead.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },
  {
    // The loop this structure is built on needs a correction step. Evolution
    // has no undo, so the loop cannot close — the island says so itself.
    slug: 'gene-drive-modeling-ethics',
    structureId: 'struct://xfrontier/model-reality-loop',
    relation: 'breaks',
    quantity: { mapping: 2, correspondence: 1 },
    evidence: { field: 'barrier' },
    check: {
      zh: '复核要点：本结构的价值在闭环内可检验地改进——干预、观测结果、再校正模型。基因驱动的干预不可撤回，校正那一步在原理上不存在。要判的是：模型能否在释放前通过其他方式闭环（围栏试验、可逆驱动设计），若能，这条否定就不成立。',
      en: 'What a reviewer must settle: this structure earns its value inside a closed loop — intervene, observe, correct the model. A gene drive\'s intervention cannot be withdrawn, so the correction step does not exist in principle. The judgement is whether the loop can be closed some other way before release — contained field trials, reversible drive designs — in which case this negative does not hold.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },
  {
    // The structure rests on a bound that active matter, being driven and
    // dissipative, has no equilibrium analogue of. The island states the
    // absence as its central difficulty rather than as a detail.
    slug: 'active-matter-self-propelled-particles',
    structureId: 'struct://xfrontier/variational-free-energy',
    relation: 'breaks',
    quantity: { mapping: 0, correspondence: 0 },
    evidence: { field: 'barrier' },
    check: {
      zh: '复核要点：本结构建立在一个可被持续压低的上界之上。主动物质持续耗能、远离平衡，岛自身说没有平衡态自由能那样的统一判据——所以这个上界不存在。要判的是：非平衡下是否已有等价的变分量（如熵产率上界）可以替代它；若有，这条应从否定改为正向映射。',
      en: 'What a reviewer must settle: this structure rests on a bound that a system continuously drives downward. Active matter is driven and far from equilibrium, and the island states that no unifying criterion equivalent to an equilibrium free energy exists — so the bound is absent. The judgement is whether a non-equilibrium variational quantity, an entropy-production bound for instance, already substitutes for it; if one does, this should turn from a negative into a positive mapping.',
    },
    proposedBy: 'did:mcp:atlas-audit',
    proposedAt: '2026-08-11',
  },
];

/** A proposal with its pointers resolved against the human-authored sources. */
export interface ResolvedProposal {
  slug: string;
  structureId: string;
  relation: ProposalRelation;
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
    relation: p.relation,
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

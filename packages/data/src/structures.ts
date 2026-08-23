/**
 * Seed structures for the 结构 ⇄ 现象 bipartite graph (执行纲要 §九). Each is one
 * cross-substrate regularity ("字母表" of 定位说明 §4.3), drawn from the xfrontier
 * atlas `isomorphisms.json` (ISO-xx provenance below). The `mappings` are the
 * human-authored 映射 (§六.1) a curator (shen-kuo) rebuilt onto specific frontier
 * islands — attached ONLY where an island genuinely embodies the structure (no
 * forced fit; that would be the exact fabrication the project forbids).
 *
 * 标度 (scaling) intentionally carries ZERO mappings: no island in the current
 * corpus genuinely embodies allometric scaling, so every island is a GAP. That is
 * not a hole to paper over — it is the point (执行纲要 §九): a structure with no
 * rebuilt islands is a pure frontier, the map's honest dashed field.
 */

import {
  WAVE_2_STRUCTURES,
  WAVE_2_STRUCTURE_PATCHES,
} from '#structures-expansion-wave2';
import { WAVE_3_STRUCTURE_PATCHES } from '#structures-expansion-wave3';
import { WAVE_4_STRUCTURES } from '#structures-expansion-wave4';
import { WAVE_5_STRUCTURES } from '#structures-expansion-wave5';
import { WAVE_6_STRUCTURES } from '#structures-expansion-wave6';
import { WAVE_7_STRUCTURES } from '#structures-expansion-wave7';
import { WAVE_8_STRUCTURES } from '#structures-expansion-wave8';
import { CRITICAL_FAMILY_DEPTH } from '#structures-depth-critical';
import { INFERENCE_FAMILY_DEPTH } from '#structures-depth-inference';
import { COLLECTIVE_FAMILY_DEPTH } from '#structures-depth-collective';
import { LOCKIN_FAMILY_DEPTH } from '#structures-depth-lockin';
import { METHOD_FAMILY_DEPTH } from '#structures-depth-method';
import { INFORMATION_FAMILY_DEPTH } from '#structures-depth-information';
import { LIMITS_FAMILY_DEPTH } from '#structures-depth-limits';

export interface StructureCorrespondence {
  /** A quantity in the abstract structure. */
  quantity: { zh: string; en: string };
  /** What it corresponds to in this island's substrate (the human's insight). */
  inThisSubstrate: { zh: string; en: string };
}

export interface StructureMapping {
  /** Island slug this structure was rebuilt onto (must exist in FRONTIERS). */
  slug: string;
  correspondences: StructureCorrespondence[];
  /** "若这成立,我们就应观察到 X" — the falsifiable prediction (§七). */
  prediction?: { zh: string; en: string };
  /** The most important substrate-specific difference: where the analogy must
   * stop instead of quietly becoming an identity claim. */
  boundary?: { zh: string; en: string };
  /** Direct evidence used to check this particular substrate mapping. */
  evidenceRefs?: string[];
}

export type StructureTheme =
  | 'collective-dynamics'
  | 'causal-inference'
  | 'unknown-mapping'
  | 'knowledge-commons'
  | 'living-computation'
  | 'simulation-twins';

export interface StructureProvenance {
  source: string;
  url: string;
  recordIds: number[];
  reviewedAt: string;
}

/**
 * What kind of thing the structure is, and therefore what an edge to it can
 * mean. A `regularity` is something the world does; an island `embodies` it or
 * `breaks` it. A `method` is something researchers do; an island `practices`
 * it. Keeping them apart matters because one `embodies` edge that silently
 * means "this study used that technique" makes the lens and the comparison
 * view assert something they cannot support.
 *
 * DELIBERATELY OPTIONAL, and deliberately absent on the 43 pre-wave-4
 * structures. Several of those (可执行知识公地, 模型—现实闭环, 异常即信号) sit on
 * the line, and bulk-labelling them from here would be a guess wearing a
 * field name. They stay unclassified until a curator reads them.
 */
export type StructureKind = 'regularity' | 'method';

/**
 * One variable the STRUCTURE itself owns, before any substrate is chosen.
 *
 * Until wave 4 an abstract quantity existed only inside a mapping's
 * `correspondences[].quantity`, so a structure with no mappings had no
 * inspectable content at all, and nothing could point at "the quantity" of a
 * structure that had not yet landed anywhere. Making it first-class is what
 * lets a zero-mapping structure still be read, and lets a proposal cite a
 * quantity by pointer instead of by copy.
 */
export interface StructureQuantity {
  name: { zh: string; en: string };
  /** What the quantity does in the structure — not what it is in any substrate. */
  role: { zh: string; en: string };
}

/**
 * A textbook instance of the structure. NOT an island, and deliberately not one.
 *
 * A `StructureMapping` asserts that a specific frontier island embodies this
 * structure — a claim about somebody's live research, which is why it needs a
 * curator and a falsifiable prediction. A canonical substrate asserts nothing
 * of the kind: fireflies flashing in unison is shared knowledge, and saying so
 * commits no one. Keeping them in separate fields keeps that difference legible
 * instead of letting a teaching example accumulate the authority of a research
 * edge.
 *
 * This is also what lets a structure be deep without any island at all. Ninety
 * of the catalogue's structures have no mapping and, before this field, no
 * content beyond one sentence, a few quantities and a failure condition.
 */
export interface CanonicalSubstrate {
  name: { zh: string; en: string };
  /** The discipline it belongs to. What makes a structure's span visible
   *  without going through domains, islands or the atlas at all. */
  field: { zh: string; en: string };
  /** Index into this structure's own `quantities`. */
  quantity: number;
  /** What that quantity is, here. */
  inThisSubstrate: { zh: string; en: string };
  /** Where this substrate departs from the shared skeleton. */
  boundary: { zh: string; en: string };
}

/**
 * How one structure stands to another.
 *
 * `emerges-from`   — A is what B does under some condition (critical slowing
 *                    down is what any of these do near their transition).
 * `generates`      — A is a mechanism that produces B.
 * `special-case-of`— A is B with something fixed.
 * `explains`       — A accounts for why B holds at all.
 * `competes-with`  — A and B are rival explanations of the same observation,
 *                    and telling them apart is itself the open problem.
 */
export type StructureRelationKind =
  | 'emerges-from'
  | 'generates'
  | 'special-case-of'
  | 'explains'
  | 'competes-with';

export interface StructureRelation {
  /** `struct://…` id of the other structure. */
  to: string;
  kind: StructureRelationKind;
  /** One sentence carrying the load. Not a restatement of the kind. */
  why: { zh: string; en: string };
}

/**
 * The structure's own depth, parallel to an island's `DepthContent` and
 * independent of the atlas.
 *
 * Everything here can be authored without a single frontier island, and that
 * is the point: a structure that no island happens to embody is still a thing
 * worth reading, and its relations to other structures are the connective
 * tissue the mapping layer has never supplied — 0 of 126 structures carried any
 * relation to another before this field existed.
 */
export interface StructureDepth {
  /** Which field first stated it, and roughly when. */
  origin: { zh: string; en: string };
  /** The tightest formal statement, where one exists. */
  minimalForm?: string;
  canonicalSubstrates: CanonicalSubstrate[];
  relations: StructureRelation[];
  /** What it is routinely mistaken for — the discrimination material. */
  mistakenFor: { zh: string; en: string };
}

export interface SeedStructure {
  /** `struct://<org>/<slug>`. */
  id: string;
  title: { zh: string; en: string };
  /** The regularity in one sentence (NOT a discipline label — §五). */
  statement: { zh: string; en: string };
  status: 'proposed' | 'active';
  /** Editorial programme for orientation, never a structure⇄island edge. */
  theme: StructureTheme;
  /** See `StructureKind`. Absent means unclassified, never "assume regularity". */
  kind?: StructureKind;
  /** The structure's own variables. Present from wave 4 on. */
  quantities?: StructureQuantity[];
  /**
   * The condition under which the STRUCTURE itself stops holding — a property
   * of the structure, not of any one substrate.
   *
   * This is NOT a `StructureMapping.boundary`. A boundary says where THIS
   * substrate departs from the shared skeleton and must be authored per island;
   * `failsWhen` says when the skeleton has no purchase at all. Copying one into
   * the other would produce the interchangeable, substrate-free boundary text
   * the existing 101 mappings deliberately avoid.
   */
  failsWhen?: { zh: string; en: string };
  /** The structure's own content, authored without reference to any island. */
  depth?: StructureDepth;
  /** xfrontier isomorphisms.json provenance (trust is visible, §6). */
  isomorphism?: string;
  /** Current deployed xfrontier corpus handles, reviewed against the live bundle. */
  provenance: StructureProvenance;
  mappings: StructureMapping[];
}

const XFRONTIER = (recordIds: number[]): StructureProvenance => ({
  source: 'xfrontier.science',
  url: 'https://xfrontier.science/',
  recordIds,
  reviewedAt: '2026-07-18',
});

/** Records re-checked for the 2026-07 direction-expansion pass. */
const XFRONTIER_EXPANSION = (recordIds: number[]): StructureProvenance => ({
  ...XFRONTIER(recordIds),
  reviewedAt: '2026-07-26',
});

export const SEED_STRUCTURES: SeedStructure[] = [
  {
    id: 'struct://xfrontier/synchronization',
    title: { zh: '耦合振子同步', en: 'Coupled-oscillator synchronization' },
    statement: {
      zh: '大量弱耦合的单元遵循局部规则,在耦合强度越过临界值后自发协同到一个集体状态。',
      en: 'Many weakly coupled units following local rules spontaneously lock into a collective state once coupling exceeds a critical strength.',
    },
    status: 'active',
    theme: 'collective-dynamics',
    isomorphism: 'ISO-10',
    provenance: XFRONTIER([231, 1491]),
    mappings: [
      {
        slug: 'self-learning-matter',
        correspondences: [
          {
            quantity: { zh: '耦合强度 K', en: 'coupling strength K' },
            inThisSubstrate: {
              zh: '自调电阻网络中相邻节点通过局部学习规则相互调参的强度',
              en: 'the strength with which adjacent nodes in the self-adjusting resistor network retune one another via local learning rules',
            },
          },
          {
            quantity: { zh: '集体锁相(序参量)', en: 'collective phase-lock (order parameter)' },
            inThisSubstrate: {
              zh: '整个物理网络协同收敛到目标函数——训练从算法搬进物质本身',
              en: 'the whole physical network converging in concert onto the target function — training moved from algorithm into matter itself',
            },
          },
        ],
        prediction: {
          zh: '若这成立,耦合学习网络应在耦合强度越过某临界值时,从"各节点各自为战"突变为"全局协同收敛"。',
          en: 'If it holds, a coupled-learning network should switch abruptly from node-wise disorder to global coordinated convergence as coupling crosses a critical value.',
        },
        boundary: {
          zh: '振子相位是周期状态变量；电阻网络学习改变的是电导并优化任务目标。共享临界协同，不等于两者具有同一动力学。',
          en: 'Oscillator phase is a periodic state variable; the resistor network learns by changing conductance toward a task objective. A shared coordination threshold does not make the dynamics identical.',
        },
      },
    ],
  },
  {
    id: 'struct://xfrontier/network-cascade',
    title: { zh: '网络渗流与级联', en: 'Network percolation & cascade' },
    statement: {
      zh: '局部相互作用在网络上累积,在临界点突然贯通全局——巨连通分量、级联翻转、临界质量。',
      en: 'Local interactions accumulate on a network and suddenly span it at a critical point — a giant component, a cascade, a tipping mass.',
    },
    status: 'active',
    theme: 'collective-dynamics',
    isomorphism: 'ISO-06',
    provenance: XFRONTIER([231, 904]),
    mappings: [
      {
        slug: 'triadic-percolation-connectivity-dynamical',
        correspondences: [
          {
            quantity: { zh: '渗流序参量(巨连通分量)', en: 'percolation order parameter (giant component)' },
            inThisSubstrate: {
              zh: '三元调控下网络的瞬时连通性',
              en: 'the instantaneous connectivity of the network under triadic regulation',
            },
          },
          {
            quantity: { zh: '控制参数(占据概率)', en: 'control parameter (occupation probability)' },
            inThisSubstrate: {
              zh: '三元交互强度——推动序参量周期倍增、通往混沌的旋钮',
              en: 'the triadic-interaction strength — the knob that period-doubles the order parameter toward chaos',
            },
          },
        ],
        prediction: {
          zh: '若这成立,扫描三元调控强度应看到连通性序参量的周期倍增级联,并出现 Neimark–Sacker 分岔通往混沌。',
          en: 'If it holds, sweeping the triadic-regulation strength should reveal a period-doubling cascade in the connectivity order parameter, with a Neimark–Sacker route to chaos.',
        },
        boundary: {
          zh: '这里的网络连边本身会被三元关系动态调控，不是经典渗流中静态图上的独立占据；临界行为必须在这个额外反馈下重新检验。',
          en: 'Here network edges are dynamically regulated by triadic relations, unlike independent occupation on a static graph in classical percolation; critical behaviour must be re-tested under that feedback.',
        },
      },
      {
        slug: 'emergent-conventions-collective-bias-tipping',
        correspondences: [
          {
            quantity: { zh: '临界质量(渗流阈值)', en: 'critical mass (percolation threshold)' },
            inThisSubstrate: {
              zh: '触发全群规约翻转所需的少数坚定智能体比例',
              en: 'the fraction of committed minority agents needed to flip the whole population’s convention',
            },
          },
          {
            quantity: { zh: '巨连通分量的涌现', en: 'emergence of the giant component' },
            inThisSubstrate: {
              zh: '共享规约在去中心 LLM 群体中的全局收敛',
              en: 'a shared convention converging globally across the decentralized LLM population',
            },
          },
        ],
        prediction: {
          zh: '若这成立,坚定少数的比例越过阈值时,群体规约应发生临界质量式的突然翻转,而非线性漂移。',
          en: 'If it holds, the population convention should flip abruptly at a critical-mass threshold in the committed-minority fraction, not drift linearly.',
        },
        boundary: {
          zh: '智能体会更新信念并作策略回应，网络占据单元不会；临界质量的相似性不能替代对微观更新规则的说明。',
          en: 'Agents update beliefs and respond strategically whereas occupied network sites do not; a similar critical mass cannot substitute for the microscopic update rule.',
        },
      },
      {
        slug: 'developmental-interpretability-singular-learning',
        correspondences: [
          {
            quantity: { zh: '临界点(相变)', en: 'critical point (phase transition)' },
            inThisSubstrate: {
              zh: '训练过程中损失景观的发展阶段跃迁',
              en: 'a developmental stage transition in the loss landscape during training',
            },
          },
          {
            quantity: { zh: '序参量', en: 'order parameter' },
            inThisSubstrate: {
              zh: '奇异学习理论刻画的模型内部结构(相)的突现',
              en: 'the abrupt emergence of internal model structure (a "phase") characterized by singular learning theory',
            },
          },
        ],
        prediction: {
          zh: '若这成立,训练曲线应在离散的发展阶段之间显示相变式的突变,而非平滑单调下降。',
          en: 'If it holds, the training curve should show phase-transition-like jumps between discrete developmental stages rather than smooth monotone descent.',
        },
        boundary: {
          zh: '训练跃迁发生在参数与损失景观中，不是字面上的网络贯通；观察到突变并不能单独证明它属于渗流普适类。',
          en: 'The transition occurs in parameter and loss landscapes, not literal network connectivity; observing a jump alone does not establish a percolation universality class.',
        },
      },
    ],
  },
  {
    id: 'struct://xfrontier/scaling',
    title: { zh: '异速生长标度律', en: 'Allometric scaling laws' },
    statement: {
      zh: '系统的性质随规模以幂律缩放,微观细节无关——共享同一组标度指数(普适类)。',
      en: 'A system’s properties scale as power laws with size, independent of microscopic detail — sharing one set of scaling exponents (a universality class).',
    },
    // proposed, and deliberately UNMAPPED: no island in the current corpus
    // genuinely embodies allometric scaling. Every island is therefore a gap —
    // this structure is a pure frontier (执行纲要 §九: 图的缺口 = 前沿).
    status: 'proposed',
    theme: 'collective-dynamics',
    isomorphism: 'ISO-29',
    provenance: XFRONTIER([]),
    mappings: [],
  },
  {
    id: 'struct://xfrontier/intervention-identifiability',
    title: { zh: '干预可识别性', en: 'Interventional identifiability' },
    statement: {
      zh: '跨多个环境施加的干预改变观测分布；若覆盖与变化条件足够，稳定的分布差异可反推出潜在因果变量及其结构。',
      en: 'Interventions across environments shift observed distributions; with sufficient coverage and variation, stable distributional changes can identify latent causal variables and their structure.',
    },
    status: 'active',
    theme: 'causal-inference',
    provenance: XFRONTIER_EXPANSION([851, 537]),
    mappings: [
      {
        slug: 'causal-rep-learning',
        correspondences: [
          {
            quantity: { zh: '干预环境 e', en: 'interventional environment e' },
            inThisSubstrate: {
              zh: '高维观测在未知干预目标下形成的多组分布环境',
              en: 'the multiple high-dimensional data environments produced by interventions whose targets may be unknown',
            },
          },
          {
            quantity: { zh: '可识别潜变量 zᵢ', en: 'identifiable latent variable zᵢ' },
            inThisSubstrate: {
              zh: '由干预前后 score function 的稳定差异恢复出的潜在因果变量',
              en: 'a latent causal variable recovered from stable before/after shifts in the score function',
            },
          },
        ],
        prediction: {
          zh: '若映射成立，在满足干预覆盖的留出环境里，恢复出的变量应跨环境对齐同一因果因素，并比纯相关表征更准确预测未见干预。',
          en: 'If the mapping holds, under intervention coverage the recovered variables should align the same causal factors across held-out environments and predict unseen interventions better than correlation-only representations.',
        },
        boundary: {
          zh: '分布发生变化并不自动带来因果语义；只有在干预覆盖、独立性与模型条件成立时，潜变量才可能被识别。',
          en: 'A distribution shift does not automatically confer causal meaning; latent variables become identifiable only under intervention coverage, independence, and model assumptions.',
        },
      },
      {
        slug: 'counterfactual-history-causal-cliometrics',
        correspondences: [
          {
            quantity: { zh: '干预环境 e', en: 'interventional environment e' },
            inThisSubstrate: {
              zh: '在某个明确时间接受战争、制度变迁或政策冲击的历史对象',
              en: 'a historical unit exposed at a stated time to war, institutional change, or a policy shock',
            },
          },
          {
            quantity: { zh: '未受干预的潜在结果', en: 'untreated potential outcome' },
            inThisSubstrate: {
              zh: '由干预前轨迹相似的对照对象加权合成、用于估计“若事件未发生会怎样”的反事实轨迹',
              en: 'the counterfactual trajectory synthesized from weighted comparison units with matching pre-intervention histories',
            },
          },
        ],
        prediction: {
          zh: '若反事实可识别，合成对照应在干预前复现处理对象的留出轨迹，并只在干预后持续分叉；把处理日期做安慰剂平移或逐一移除关键供体时，效应不应任意改变符号。',
          en: 'If the counterfactual is identifiable, the synthetic control should reproduce held-out pre-treatment trajectories and diverge persistently only after treatment; placebo shifts of the treatment date and leave-one-donor-out tests should not arbitrarily reverse the effect.',
        },
        boundary: {
          zh: '合成控制不是时间机器：它依赖供体支持、干预前拟合、无溢出和没有同步未观测冲击。即使效应可估，也不能仅凭一条差值识别完整历史机制。',
          en: 'Synthetic control is not a time machine: it depends on donor support, pre-treatment fit, no spillovers, and no coincident unobserved shocks. Even an estimable effect does not identify the full historical mechanism from one gap.',
        },
        evidenceRefs: [
          'https://doi.org/10.1198/jasa.2009.ap08746',
          'https://inferenceproject.yale.edu/sites/default/files/jel.20191450.pdf',
        ],
      },
    ],
  },
  {
    id: 'struct://xfrontier/anomaly-as-signal',
    title: { zh: '异常即信号', en: 'Anomaly as signal' },
    statement: {
      zh: '离群点不是自动丢弃的噪声，而是“现有规则还不完整”的可检验残差；关键是先控制背景、采样与仪器伪差。',
      en: 'An outlier is not noise to discard automatically but a testable residual saying the current rule is incomplete—after background, sampling, and instrument artifacts are controlled.',
    },
    status: 'active',
    theme: 'unknown-mapping',
    provenance: XFRONTIER([629, 716]),
    mappings: [
      {
        slug: 'anomaly-as-signal-cross-domain',
        correspondences: [
          {
            quantity: { zh: '已知行为流形', en: 'known-behaviour manifold' },
            inThisSubstrate: {
              zh: '天文、基因组与极地数据中由现有模型解释的正常区域',
              en: 'the region of astronomical, genomic, and polar data explained by current models',
            },
          },
          {
            quantity: { zh: '受控残差 / 惊奇度', en: 'controlled residual / surprise' },
            inThisSubstrate: {
              zh: '校正采样和仪器伪差后仍偏离所有已知模型的候选',
              en: 'a candidate that still departs from every known model after sampling and instrument artifacts are corrected',
            },
          },
        ],
        prediction: {
          zh: '若映射成立，统一基准中高惊奇度候选在跨域复核后仍应显著富集真实稀有现象，而不是只富集仪器或采样伪差。',
          en: 'If the mapping holds, high-surprise candidates in a shared benchmark should remain enriched for genuine rare phenomena after cross-domain follow-up, not merely for instrument or sampling artifacts.',
        },
        boundary: {
          zh: '不同领域的惊奇度不能直接互换：仪器噪声、选择效应与复核成本各不相同，统一的只能是控制残差的原则。',
          en: 'Surprise scores are not directly interchangeable across fields: instrument noise, selection effects, and follow-up costs differ; only the principle of controlling residuals is shared.',
        },
      },
      {
        slug: 'collider-anomaly-detection-transplanted-to',
        correspondences: [
          {
            quantity: { zh: '平滑背景模型', en: 'smooth background model' },
            inThisSubstrate: {
              zh: '生态告警或巡天流中常见类别、季节性与仪器漂移组成的背景',
              en: 'the background of common classes, seasonality, and instrument drift in ecological alerts or sky-survey streams',
            },
          },
          {
            quantity: { zh: '去相关异常分数', en: 'decorrelated anomaly score' },
            inThisSubstrate: {
              zh: '从对撞机方法移植而来、在背景条件变化时仍可比较的偏离量',
              en: 'a collider-derived deviation measure that stays comparable as background conditions change',
            },
          },
        ],
        prediction: {
          zh: '若移植保真，检测器应在季节与仪器变化下维持预设虚警率，同时比领域基线召回更多已知稀有事件。',
          en: 'If the transplant preserves the structure, the detector should hold its target false-alert rate across seasonal and instrument shifts while recalling more known rare events than domain baselines.',
        },
        boundary: {
          zh: '对撞机背景通常更受控且高通量；生态或巡天流包含非平稳季节与选择效应，因此虚警率必须重新校准，不能原样搬运。',
          en: 'Collider backgrounds are usually more controlled and high-throughput; ecological or survey streams contain non-stationary seasons and selection effects, so false-alert rates must be recalibrated rather than copied.',
        },
      },
    ],
  },
  {
    id: 'struct://xfrontier/executable-knowledge',
    title: { zh: '可执行知识公地', en: 'Executable knowledge commons' },
    statement: {
      zh: '把主张拆成带类型、依赖与验证器的可组合对象，使知识不仅可读，还能被机器复核、重用并在接口不兼容时失败。',
      en: 'Claims become typed, dependency-aware, composable objects with validators, so knowledge is not only readable but machine-checkable, reusable, and able to fail at incompatible interfaces.',
    },
    status: 'active',
    theme: 'knowledge-commons',
    provenance: XFRONTIER([374, 1453]),
    mappings: [
      {
        slug: 'formal-math',
        correspondences: [
          {
            quantity: { zh: '可组合主张单元', en: 'composable claim unit' },
            inThisSubstrate: {
              zh: 'Lean 中带完整依赖的定理陈述与证明项',
              en: 'a Lean theorem statement and proof term with explicit dependencies',
            },
          },
          {
            quantity: { zh: '验证窄腰', en: 'validation narrow waist' },
            inThisSubstrate: {
              zh: '所有贡献最终必须通过的小型可信内核类型检查',
              en: 'the small trusted-kernel type check every contribution must pass',
            },
          },
        ],
        prediction: {
          zh: '若知识公地真正可执行，外部导入定理在补齐依赖后应由同一内核重检通过，而偷换命题或不兼容引理会在组合处明确失败。',
          en: 'If the commons is genuinely executable, an imported theorem should re-check under the same kernel once dependencies are supplied, while semantic substitution or incompatible lemmas fail explicitly at composition.',
        },
        boundary: {
          zh: '形式证明验证的是相对于公理的逻辑有效性，不验证经验模型是否贴近现实，也不验证测量质量。',
          en: 'Formal proof checks logical validity relative to axioms; it does not establish empirical adequacy or measurement quality.',
        },
      },
      {
        slug: 'compositional-modeling',
        correspondences: [
          {
            quantity: { zh: '带类型模型组件', en: 'typed model component' },
            inThisSubstrate: {
              zh: 'StockFlow、Decapodes 等图式中的可复用科学模型片段',
              en: 'a reusable scientific-model fragment in diagrammatic systems such as StockFlow or Decapodes',
            },
          },
          {
            quantity: { zh: '组合接口', en: 'composition interface' },
            inThisSubstrate: {
              zh: '余跨、边界对象与端口类型规定的可拼接边界',
              en: 'the composable boundary specified by cospans, boundary objects, and port types',
            },
          },
        ],
        prediction: {
          zh: '若映射成立，同一张结构图应能编译为至少两种数学语义，而边界不兼容的组件会在运行仿真前被类型或组合检查拒绝。',
          en: 'If the mapping holds, one structural diagram should compile into at least two mathematical semantics, while components with incompatible boundaries are rejected before simulation runs.',
        },
        boundary: {
          zh: '接口可组合只说明形状与依赖兼容，不说明组件假设正确，也不保证组合后的科学解释有效。',
          en: 'Composable interfaces establish shape and dependency compatibility, not the truth of component assumptions or the scientific validity of the assembled explanation.',
        },
      },
    ],
  },
  {
    id: 'struct://xfrontier/substrate-local-learning',
    title: { zh: '基底局部学习', en: 'Substrate-local learning' },
    statement: {
      zh: '全局任务被编码为自由态与受约束态的物理差异，每条局部连接只读身边信号就能更新，让训练发生在材料本身。',
      en: 'A global task is encoded as the physical difference between free and constrained states; each local connection updates from nearby signals so learning occurs in the material itself.',
    },
    status: 'active',
    theme: 'living-computation',
    provenance: XFRONTIER([1491]),
    mappings: [
      {
        slug: 'self-learning-matter',
        correspondences: [
          {
            quantity: { zh: '自由态—受约束态差', en: 'free–clamped state contrast' },
            inThisSubstrate: {
              zh: '自调电阻网络在无目标与施加目标输出时的局部电压响应差',
              en: 'the difference in local voltage response between unconstrained and target-clamped states of the adaptive resistor network',
            },
          },
          {
            quantity: { zh: '局部权重更新', en: 'local weight update' },
            inThisSubstrate: {
              zh: '每个晶体管仅根据自身端点电压改变导电参数',
              en: 'each transistor changing its conductance from voltages available at its own endpoints',
            },
          },
        ],
        prediction: {
          zh: '若映射成立，网络应在没有中央梯度的情况下通过反复物理弛豫学会任务，并在局部器件损伤后以同一局部规则重新收敛。',
          en: 'If the mapping holds, repeated physical relaxation should train the network without a central gradient, and the same local rule should let it reconverge after localized device damage.',
        },
        boundary: {
          zh: '物理松弛与算法优化都可使用局部规则，但器件噪声、耗散与材料限制会改变收敛条件，不能假定它们优化同一目标。',
          en: 'Physical relaxation and algorithmic optimization can both use local rules, but device noise, dissipation, and material limits change convergence conditions; they need not optimize the same objective.',
        },
      },
    ],
  },
  {
    id: 'struct://xfrontier/model-reality-loop',
    title: { zh: '模型—现实闭环', en: 'Model–reality loop' },
    statement: {
      zh: '可运行模型吸收现实观测、提出干预，再用干预结果校正自身；价值不在“像”，而在闭环内可检验地改进预测与行动。',
      en: 'An executable model assimilates observations, proposes interventions, and is corrected by their outcomes; its value lies not in resemblance but in testably improving prediction and action inside the loop.',
    },
    status: 'active',
    theme: 'simulation-twins',
    provenance: XFRONTIER([137, 964]),
    mappings: [
      {
        slug: 'cell-digital-twins-virtual-cells',
        correspondences: [
          {
            quantity: { zh: '现实观测流', en: 'real observation stream' },
            inThisSubstrate: {
              zh: '多组学、空间组学与扰动实验产生的细胞状态数据',
              en: 'cell-state data from multi-omics, spatial omics, and perturbation experiments',
            },
          },
          {
            quantity: { zh: '可运行孪生状态', en: 'executable twin state' },
            inThisSubstrate: {
              zh: '统一代谢、表达与信号过程、可被扰动的虚拟细胞状态',
              en: 'a perturbable virtual-cell state unifying metabolism, expression, and signalling processes',
            },
          },
        ],
        prediction: {
          zh: '若闭环成立，虚拟细胞在已声明可信域内应对留出扰动给出校准预测；离开该模块或时间尺度时，误差与不确定性必须同步上升而非继续自信。',
          en: 'If the loop holds, the virtual cell should give calibrated forecasts for held-out perturbations inside its declared validity domain, while error and uncertainty rise together outside that module or time scale.',
        },
        boundary: {
          zh: '模拟与观测相符仍可能来自不可识别的多套机制；闭环只有在湿实验扰动和独立测量锚定后才构成真实校正。',
          en: 'Simulation–observation agreement may still arise from non-identifiable mechanisms; the loop becomes a real correction only when anchored by wet-lab perturbations and independent measurements.',
        },
      },
      {
        slug: 'differentiable-manufacturing-simulation-gradient-based',
        correspondences: [
          {
            quantity: { zh: '目标现实轨迹', en: 'target real trajectory' },
            inThisSubstrate: {
              zh: '制造过程希望达到的温度场与熔池边界时间序列',
              en: 'the desired time series of temperature fields and melt-pool boundaries in manufacturing',
            },
          },
          {
            quantity: { zh: '可微干预控制', en: 'differentiable intervention control' },
            inThisSubstrate: {
              zh: '通过可微有限元孪生反演得到的逐时刻激光功率曲线',
              en: 'the time-resolved laser-power curve inferred through the differentiable finite-element twin',
            },
          },
        ],
        prediction: {
          zh: '若闭环成立，在已验证的平滑工况内，梯度反演曲线应比无梯度基线更接近目标热历史；接触或相变导致非光滑时优势应可测地衰减。',
          en: 'If the loop holds, within validated smooth regimes the gradient-inverted control should match the target thermal history better than gradient-free baselines, with a measurable loss of advantage at nonsmooth contact or phase transitions.',
        },
        boundary: {
          zh: '可微梯度只对模拟器内部目标可靠；若模型失真，优化会利用模拟漏洞，所得工艺未必能迁移到真实产线。',
          en: 'Differentiable gradients are reliable only for the simulator’s internal objective; with model error, optimization can exploit simulation loopholes and fail to transfer to the factory.',
        },
      },
    ],
  },

  // ── ISO 对齐第二批 ──────────────────────────────────────────────────────
  // 每条的 slug 都先过了一遍语义核对：结构的骨架必须在该岛的基底里真的有对应
  // 物，而不是「同属一个簇」。对不上的同构照 标度 的先例保留为零映射的纯前沿。

  {
    id: 'struct://xfrontier/variational-free-energy',
    title: { zh: '变分自由能最小化', en: 'Variational free-energy minimisation' },
    statement: {
      zh: '一个系统持续压低「预测与观测之差」的同一个上界——它既可以改内部模型，也可以改自身行动，于是推断与行动成为同一次最小化。',
      en: 'A system continually lowers one and the same upper bound on the mismatch between its predictions and its observations — by changing its internal model or by changing its own actions — so inference and action become a single minimisation.',
    },
    status: 'active',
    theme: 'living-computation',
    isomorphism: 'ISO-03',
    provenance: XFRONTIER_EXPANSION([1376, 574, 541]),
    mappings: [
      {
        slug: 'active-inference',
        correspondences: [
          {
            quantity: { zh: '变分自由能 F（一个上界）', en: 'variational free energy F (a bound)' },
            inThisSubstrate: {
              zh: '工程化主动推断里被显式写出、优化器能直接读数的那个目标泛函',
              en: 'the objective functional an engineered active-inference agent actually writes down and an optimizer can read off directly',
            },
          },
          {
            quantity: { zh: '行动作为推断的一个分支', en: 'action as one branch of inference' },
            inThisSubstrate: {
              zh: '智能体不是先感知再决策，而是用改变世界来降低同一个 F——采样动作与更新信念共用一个目标',
              en: 'the agent does not perceive then decide; it changes the world to lower the same F, so acting and updating beliefs share one objective',
            },
          },
        ],
        prediction: {
          zh: '若这成立，在同一任务上人为切断「用行动降 F」这条通路（只许更新信念），稳态误差应系统性抬高，而不只是收敛变慢。',
          en: 'If it holds, severing the act-to-lower-F pathway on a fixed task (belief updates only) should raise steady-state error systematically, not merely slow convergence.',
        },
        boundary: {
          zh: '自由能原理本身在「够不够可证伪」上仍有争议；工程实现里的 F 是一个被选定的具体泛函，不等于该原理宣称的那个普遍量。',
          en: 'The free-energy principle’s own falsifiability remains contested; the F in an engineered implementation is one chosen functional, not the universal quantity the principle claims.',
        },
      },
      {
        slug: 'fundamental-limits-information-thermodynamics',
        correspondences: [
          {
            quantity: { zh: '自由能差 ΔF 作为可提取功的上界', en: 'the free-energy difference ΔF as a bound on extractable work' },
            inThisSubstrate: {
              zh: '新麦克斯韦妖实验里，测量、反馈、擦除三步各自记在明处的能量账',
              en: 'the energy ledger charged separately to measurement, feedback and erasure in a modern Maxwell-demon experiment',
            },
          },
          {
            quantity: { zh: '信息作为可兑换的资源', en: 'information as a convertible resource' },
            inThisSubstrate: {
              zh: '妖获得的每一比特都有明码标价，整个系统合起来仍不越过第二定律',
              en: 'every bit the demon acquires carries an explicit price, so the closed system still never beats the second law',
            },
          },
        ],
        prediction: {
          zh: '若两者共享同一形式，在同一装置上把测量精度当作唯一自变量扫描时，可提取功的上界应随互信息单调移动，而不随装置的实现细节任意变化。',
          en: 'If the shared form holds, sweeping measurement precision as the only free variable on one apparatus should move the extractable-work bound monotonically with mutual information, not with implementation detail.',
        },
        boundary: {
          zh: '这是本条最重要的边界：变分自由能是推断的目标泛函，热力学自由能是物理态函数。同名、同式，却不是同一个量——把 F 的下降直接读成放热，是这个类比最常见的误用。',
          en: 'The boundary that matters most here: variational free energy is an inference objective, thermodynamic free energy is a physical state function. Same name, same form, different quantity — reading a drop in F as heat released is this analogy’s commonest misuse.',
        },
      },
      {
        slug: 'bio-compute-thermo',
        correspondences: [
          {
            quantity: { zh: '推断的代价有物理下限', en: 'inference has a physical price floor' },
            inThisSubstrate: {
              zh: '用随机热力学的熵产界，量出细胞做一次感知、纠错或决策至少要烧掉多少自由能——「想」这件事被标了价',
              en: 'stochastic-thermodynamic entropy-production bounds put a number on the free energy a cell must burn to sense, proofread or decide — thinking gets a price tag',
            },
          },
          {
            quantity: { zh: '接近界 = 这个量真的在被优化', en: 'sitting near the bound means the quantity really is being optimised' },
            inThisSubstrate: {
              zh: '真实生化网络逼近理论最优,这是「细胞在最小化某个自由能」这一说法目前最硬的经验支撑——不是隐喻,是测出来的',
              en: 'real biochemical networks approach the theoretical optimum, which is the hardest empirical support the claim that cells minimise a free energy currently has — measured, not metaphorical',
            },
          },
        ],
        prediction: {
          zh: '若这成立，人为提高环境不确定性(增大待推断变量的先验熵)，细胞感知回路的最低能耗应按界给出的斜率上升；若能耗不动，说明该回路并非在这个界附近工作。',
          en: 'If it holds, raising environmental uncertainty (widening the prior entropy of what must be inferred) should raise a sensing circuit’s minimum energy cost along the slope the bound predicts — and flat energy use would show the circuit is not operating near that bound.',
        },
        boundary: {
          zh: '这里的自由能是真的热力学自由能,单位是焦耳,可以用量热计测;主动推断里的 F 是一个信息论泛函,没有单位。这条映射之所以值得建,恰恰因为它是同一族结构里唯一能被物理测量的那一支——但也正因如此,它的结论不能反向搬回给认知模型。',
          en: 'The free energy here is genuine thermodynamic free energy, measured in joules with a calorimeter; the F of active inference is an information-theoretic functional with no units. This mapping earns its place precisely because it is the one branch of the family that physics can measure — and for the same reason its results cannot be carried back to the cognitive models.',
        },
      },
      {
        slug: 'thermodynamic-computing-hardware',
        correspondences: [
          {
            quantity: { zh: '候选分布 q(x)', en: 'candidate distribution q(x)' },
            inThisSubstrate: {
              zh: '由热噪声驱动、可从模拟电压与电流轨迹直接采样的硬件状态分布',
              en: 'the hardware-state distribution sampled directly from thermally driven analogue voltage and current trajectories',
            },
          },
          {
            quantity: { zh: '能量—熵权衡', en: 'energy–entropy trade-off' },
            inThisSubstrate: {
              zh: '可编程能量景观与有效温度共同决定稳态概率质量落在哪里',
              en: 'the programmable energy landscape and effective temperature jointly determining where stationary probability mass settles',
            },
          },
        ],
        prediction: {
          zh: '若该硬件确实实现这一最小化，扫描耦合与有效温度时，实测稳态分布应沿校准后的自由能模型移动；冻结噪声或把系统推到模型未覆盖的强非平衡区后，采样质量优势应按预测消失。',
          en: 'If the hardware implements this minimisation, sweeping coupling and effective temperature should move its measured stationary distribution along the calibrated free-energy model; freezing the noise or driving it far outside the modelled nonequilibrium regime should remove the sampling advantage as predicted.',
        },
        boundary: {
          zh: '器件利用的是物理热涨落与能量景观；它不会因此证明认知系统在最小化变分自由能。强非平衡装置甚至可能没有单一平衡自由能势，必须逐台校准。',
          en: 'The device exploits physical thermal fluctuations and an energy landscape; this does not establish that cognitive systems minimise variational free energy. A strongly nonequilibrium device may not even possess one equilibrium free-energy potential and must be calibrated device by device.',
        },
        evidenceRefs: [
          'https://www.nature.com/articles/s41467-025-59011-x',
          'https://www.nature.com/articles/s41467-025-67958-0',
        ],
      },
    ],
  },

  {
    id: 'struct://xfrontier/adjoint-functors',
    title: { zh: '范畴论与伴随函子', en: 'Category theory & adjoint functors' },
    statement: {
      zh: '两个方向相反的翻译若构成伴随，「翻过去再翻回来」会留下一个可计算的最优近似——一个结构由它的翻译保持什么、丢掉什么来定义。',
      en: 'When two opposite translations form an adjunction, going across and back leaves a computable best approximation — a structure is defined by what its translations preserve and what they discard.',
    },
    status: 'active',
    theme: 'knowledge-commons',
    isomorphism: 'ISO-12',
    provenance: XFRONTIER([1486, 1490]),
    mappings: [
      {
        slug: 'category-theory-algebraic-theory',
        correspondences: [
          {
            quantity: { zh: '函子（保结构的翻译）', en: 'functor (a structure-preserving translation)' },
            inThisSubstrate: {
              zh: '把一族神经网络架构翻译成同一个代数对象，卷积、注意力、消息传递不再是并列的发明而是同一构造的取值',
              en: 'the translation carrying a family of network architectures into one algebraic object, so convolution, attention and message passing stop being parallel inventions and become values of one construction',
            },
          },
          {
            quantity: { zh: '伴随所刻画的「最省力的还原」', en: 'the cheapest faithful reconstruction an adjunction picks out' },
            inThisSubstrate: {
              zh: '给定对称性要求，架构不是被设计出来的而是被逼出来的——等变性一旦写死，可行架构族随之收敛',
              en: 'given a symmetry requirement the architecture is forced rather than designed — once equivariance is fixed, the admissible family collapses',
            },
          },
        ],
        prediction: {
          zh: '若这成立，两个由同一伴随导出的架构，在同一数据上的可达误差下界应一致；差异只应出现在优化难度，而不应出现在表达能力。',
          en: 'If it holds, two architectures derived from the same adjunction should share an attainable error floor on identical data; any gap should show up in optimization difficulty, not in expressive power.',
        },
        boundary: {
          zh: '范畴论刻画的是「什么被保持」，不预测「什么好训练」。伴随存在不保证梯度可用，更不保证在有限样本下学得到。',
          en: 'Category theory characterises what is preserved, not what trains well. An adjunction’s existence guarantees neither usable gradients nor finite-sample learnability.',
        },
      },
      {
        slug: 'category-theoretic-compositional-scientific-modeling',
        correspondences: [
          {
            quantity: { zh: '语法与语义的分离', en: 'the split between syntax and semantics' },
            inThisSubstrate: {
              zh: '「怎么拼」写在示意图里，「拼出什么数学对象」由函子语义决定，同一张图可编译成 Petri 网或 ODE',
              en: 'how to compose lives in the diagram, what mathematics results is decided by functorial semantics, and one diagram compiles into a Petri net or an ODE system',
            },
          },
          {
            quantity: { zh: '沿共享边界的合成', en: 'composition along a shared boundary' },
            inThisSubstrate: {
              zh: '结构余跨让子模型像积木一样沿接口拼接，而接口本身是数学对象、不是约定',
              en: 'structured cospans let submodels snap together along interfaces that are themselves mathematical objects rather than conventions',
            },
          },
        ],
        prediction: {
          zh: '若这成立，把一个已验证的组合模型换掉其中一个部件、其余不动，重新验证的代价应只与该部件相关，而不随整体规模增长。',
          en: 'If it holds, swapping one component of a validated compositional model while leaving the rest fixed should cost re-validation proportional to that component alone, not to overall model size.',
        },
        boundary: {
          zh: '组合性保证的是可拼接，不是可解释，也不是数值稳定。拼出来的系统仍可能整体病态，而每个部件各自都健康。',
          en: 'Compositionality buys assemblability, not interpretability and not numerical stability. A composed system can be ill-conditioned as a whole while every part is individually sound.',
        },
      },
    ],
  },

  {
    id: 'struct://xfrontier/open-set-recognition',
    title: { zh: '开放集识别（拒识未知）', en: 'Open-set recognition (rejecting the unknown)' },
    statement: {
      zh: '当真实世界会送来训练集里根本不存在的类别，最优策略不是硬分到最近的已知类，而是给「不认识」留一个显式出口，并为这个出口的宽度付代价。',
      en: 'When the world supplies categories absent from training, the right policy is not to force each one into the nearest known class but to keep an explicit exit for "unrecognised" — and to pay for how wide that exit is.',
    },
    status: 'active',
    theme: 'unknown-mapping',
    isomorphism: 'ISO-35',
    provenance: XFRONTIER([1349, 1488, 659]),
    mappings: [
      {
        slug: 'code-dark-matter',
        correspondences: [
          {
            quantity: { zh: '开放空间风险（把未知误判为已知的代价）', en: 'open-space risk — the cost of calling an unknown a known' },
            inThisSubstrate: {
              zh: '把一段无同源、无注释的序列强行归到最近的已知家族，从而让它在所有下游统计里永久消失',
              en: 'forcing a sequence with no homolog and no annotation into its nearest known family, which erases it from every downstream statistic thereafter',
            },
          },
          {
            quantity: { zh: '显式的「拒识」输出', en: 'an explicit reject option' },
            inThisSubstrate: {
              zh: '把「暗物质」当成一个可被计数、可被追踪的正式类别，而不是流水线里的残渣',
              en: 'treating "dark matter" as a countable, trackable category of its own rather than as pipeline residue',
            },
          },
        ],
        prediction: {
          zh: '若这成立，在注释流水线里加入一个校准过的拒识阈值后，被拒识那部分序列在后续实验验证中的新颖性命中率，应显著高于被强行归类的那部分。',
          en: 'If it holds, adding a calibrated reject threshold to the annotation pipeline should make the rejected fraction show a markedly higher novelty hit-rate under later experimental validation than the force-classified fraction.',
        },
        boundary: {
          zh: '开放集识别假设「未知」在特征空间里落在已知类边界之外。若某个真正的新家族恰好与已知家族在所用表征下重合，拒识机制对它完全无效——它不是万能的未知探测器。',
          en: 'Open-set recognition assumes the unknown falls outside known-class boundaries in the chosen representation. A genuinely new family that happens to coincide with a known one under that representation is invisible to the reject rule — it is not a universal unknown-detector.',
        },
      },
      {
        slug: 'unknomics-systematically-studying-least-known',
        correspondences: [
          {
            quantity: { zh: '开放空间的体积', en: 'the volume of open space' },
            inThisSubstrate: {
              zh: '「最不为人知基因」这一集合的大小本身成为被测量的对象，而不是研究结束后剩下的余数',
              en: 'the size of the least-known-gene set becomes a measured object in its own right rather than the remainder left after research stops',
            },
          },
        ],
        prediction: {
          zh: '若这成立，按拒识置信度排序选题，应比按引用热度排序更快地压缩未知集合的体积。',
          en: 'If it holds, choosing targets by reject-confidence should shrink the unknown set’s volume faster than choosing them by citation heat.',
        },
        boundary: {
          zh: '「最不为人知」是文献计量意义上的未知，不等于生物学意义上的未知：一个基因可能因为难做而非因为不重要才无人研究。',
          en: 'Least-known is a bibliometric notion of unknown, not a biological one: a gene may be unstudied because it is hard to assay, not because it is unimportant.',
        },
      },
      {
        slug: 'energy-limit-ecology-deep-subsurface-dark',
        correspondences: [
          {
            quantity: { zh: '训练分布之外的样本', en: 'samples outside the training distribution' },
            inThisSubstrate: {
              zh: '深地微生物的能量代谢速率低到落在所有实验室培养基准之外，因而在标准方法下既测不到也证伪不了',
              en: 'deep-subsurface metabolic rates fall so far below every laboratory culture baseline that standard methods can neither detect nor refute them',
            },
          },
        ],
        prediction: {
          zh: '若这成立，把检测下限而非平均值作为报告量，深地样本中「无法归类」的比例应随下限下降而系统上升，而不是趋于稳定。',
          en: 'If it holds, reporting detection floors rather than means should make the unclassifiable fraction of deep-subsurface samples rise systematically as the floor drops, rather than plateau.',
        },
        boundary: {
          zh: '这里的「未知」大部分来自测量灵敏度，不是来自分类器边界。把仪器极限当成本体论上的开放集，会把技术债误读成新生物学。',
          en: 'Most of the unknown here comes from measurement sensitivity, not from a classifier boundary. Reading an instrument limit as an ontological open set mistakes technical debt for new biology.',
        },
      },
    ],
  },

  {
    id: 'struct://xfrontier/error-correcting-redundancy',
    title: { zh: '纠错码与冗余编码', en: 'Error-correcting codes & redundancy' },
    statement: {
      zh: '把信息摊到冗余的位置上，只要码字之间的最小距离足够，就能在噪声吃掉一部分之后仍然唯一地还原原文——可靠性可以从不可靠的部件里买来。',
      en: 'Spread information across redundant positions and, provided the minimum distance between codewords is large enough, the original is uniquely recoverable after noise eats part of it — reliability can be bought out of unreliable parts.',
    },
    status: 'active',
    theme: 'living-computation',
    isomorphism: 'ISO-15',
    provenance: XFRONTIER_EXPANSION([910, 7, 550]),
    mappings: [
      {
        slug: 'erasure-conversion-qubits-turning-loss',
        correspondences: [
          {
            quantity: { zh: '已知位置的擦除 vs 未知位置的翻转', en: 'an erasure at a known position vs a flip at an unknown one' },
            inThisSubstrate: {
              zh: '把量子比特的损耗改造成「知道哪一位坏了」的擦除事件——同样的码率下可纠正的错误数直接翻倍',
              en: 'converting qubit loss into an erasure whose location is known — at the same code rate this doubles the number of correctable errors',
            },
          },
          {
            quantity: { zh: '最小距离 d ≥ 2t+1', en: 'minimum distance d ≥ 2t+1' },
            inThisSubstrate: {
              zh: '阈值定理里那个被反复推高的容错门槛，本质上是同一个不等式在物理噪声模型下的取值',
              en: 'the fault-tolerance threshold engineers keep pushing up is that same inequality evaluated under a physical noise model',
            },
          },
        ],
        prediction: {
          zh: '若这成立，在同一硬件上把一部分翻转错误转化为擦除，逻辑错误率的下降幅度应与「擦除比例」对应的距离增益一致，而不取决于具体码族。',
          en: 'If it holds, converting a fraction of flips into erasures on fixed hardware should drop the logical error rate by exactly the distance gain that fraction implies, independent of the code family used.',
        },
        boundary: {
          zh: '经典纠错假设错误是独立同分布的；量子系统里相关噪声与串扰会同时打坏多个物理比特，此时距离给出的保证不再成立。',
          en: 'Classical coding assumes i.i.d. errors; correlated noise and crosstalk in a quantum device corrupt several physical qubits at once, and the distance guarantee no longer applies.',
        },
      },
      {
        slug: 'genome-writing',
        correspondences: [
          {
            quantity: { zh: '编码冗余', en: 'coding redundancy' },
            inThisSubstrate: {
              zh: '密码子简并、重复元件与多拷贝设计，让合成基因组在写入误差下仍能表达出目标功能',
              en: 'codon degeneracy, repeated elements and multi-copy design let a synthetic genome still express its target function under write errors',
            },
          },
          {
            quantity: { zh: '校验与重写', en: 'checking and rewriting' },
            inThisSubstrate: {
              zh: '合成—测序—纠错的闭环，把「一次写对」换成「允许写错但可检出可重写」',
              en: 'the synthesise–sequence–correct loop trades write-it-right-first-time for write-it-wrong-but-detect-and-rewrite',
            },
          },
        ],
        prediction: {
          zh: '若这成立，在写入错误率固定时，按最小距离设计的冗余布局应比等量的随机冗余得到更低的功能失败率。',
          en: 'If it holds, at a fixed write-error rate a redundancy layout designed for minimum distance should yield a lower functional-failure rate than the same amount of redundancy placed at random.',
        },
        boundary: {
          zh: '生物「码字」的代价不是均匀的：冗余会带来代谢负担与重组不稳定，所以最优冗余量由细胞适应度而非码论决定。',
          en: 'Biological codewords are not uniformly priced: redundancy carries metabolic burden and recombination instability, so the optimum is set by cellular fitness rather than by coding theory.',
        },
      },
      {
        slug: 'collective-reasoning-group-epistemology',
        correspondences: [
          {
            quantity: { zh: '带独立噪声的冗余副本', en: 'redundant copies with independent noise' },
            inThisSubstrate: {
              zh: '多名成员对同一问题各自形成、误差不完全相关的初始判断',
              en: 'group members’ initial judgements of the same question whose errors are not perfectly correlated',
            },
          },
          {
            quantity: { zh: '有效码距', en: 'effective code distance' },
            inThisSubstrate: {
              zh: '少数错误意见不改变集体答案的容错余量；集中式社会影响会让错误相关，从而缩小这段余量',
              en: 'the tolerance margin within which a minority of wrong judgements cannot flip the collective answer; centralised social influence correlates errors and shrinks that margin',
            },
          },
        ],
        prediction: {
          zh: '若集体推理真的利用了纠错式冗余，在个体准确率相同的条件下，保留独立判断的去中心网络应比中心化网络产生更低的群体误差；随着意见相关性上升，这个增益应按有效独立样本数下降。',
          en: 'If collective reasoning exploits error-correcting redundancy, decentralised networks that preserve independent judgements should achieve lower group error than centralised networks at the same individual accuracy; the gain should fall with opinion correlation according to effective independent sample size.',
        },
        boundary: {
          zh: '人类判断不是预先设计的码字，真值也常常未知；成员会学习、说服和改变问题表述，因此这里只有“独立冗余可纠错”的骨架，没有码论式的最坏情况保证。',
          en: 'Human judgements are not designed codewords and ground truth is often unknown. Members learn, persuade, and reframe the problem, so only the skeleton of correction by independent redundancy transfers—not coding-theoretic worst-case guarantees.',
        },
        evidenceRefs: [
          'https://www.pnas.org/doi/10.1073/pnas.1615978114',
          'https://ndg.asc.upenn.edu/wp-content/uploads/2022/10/Centola_2022_TICS_Network_Science_of_Collective_Intelligence.pdf',
        ],
      },
    ],
  },

  {
    id: 'struct://xfrontier/selection-bias-absence',
    title: { zh: '样本选择偏差与缺席推断', en: 'Selection bias & inference from absence' },
    statement: {
      zh: '当「被观测到」本身不是随机的，观测到的分布就系统性地偏离真实分布——要得到无偏结论，必须为「什么没被看见」显式建模。',
      en: 'When being observed is itself non-random, the observed distribution departs systematically from the real one — an unbiased conclusion requires modelling what went unseen.',
    },
    status: 'active',
    theme: 'unknown-mapping',
    isomorphism: 'ISO-36',
    provenance: XFRONTIER([680]),
    mappings: [
      {
        slug: 'dark-instrumentation',
        correspondences: [
          {
            quantity: { zh: '选择方程（谁进入样本）', en: 'the selection equation — who enters the sample' },
            inThisSubstrate: {
              zh: '一个现象有没有被仪器化，决定了它有没有机会进入任何一份数据集；未被仪器化者不是数据里的零，而是数据外的空白',
              en: 'whether a phenomenon has been instrumented decides whether it can enter any dataset at all; the un-instrumented is not a zero in the data but a blank outside it',
            },
          },
          {
            quantity: { zh: '逆米尔斯比（对缺席的修正项）', en: 'the inverse Mills ratio — the correction term for absence' },
            inThisSubstrate: {
              zh: '把「仪器覆盖率」当成一个可估计的变量写进结论，而不是默认它等于一',
              en: 'writing instrument coverage into the conclusion as an estimable variable instead of silently assuming it equals one',
            },
          },
        ],
        prediction: {
          zh: '若这成立，同一研究领域内，结论的稳健性应与仪器覆盖率相关：覆盖率低的子领域，其重复实验失败率应系统性偏高。',
          en: 'If it holds, robustness within a field should track instrument coverage: subfields with low coverage should show a systematically higher replication-failure rate.',
        },
        boundary: {
          zh: 'Heckman 型修正依赖一个可信的排除性约束——存在某个只影响「是否被观测」而不影响结果本身的变量。科学仪器化史里这样的变量很难找到，因此这里的修正多半只能给出方向而非数值。',
          en: 'Heckman-style correction needs a credible exclusion restriction — a variable affecting whether something is observed but not the outcome itself. Such variables are hard to find in the history of scientific instrumentation, so the correction here usually gives a direction rather than a number.',
        },
      },
      {
        slug: 'a-quantitative-science-of-serendipity',
        correspondences: [
          {
            quantity: { zh: '「被观测」这件事本身不随机', en: 'being observed is itself non-random' },
            inThisSubstrate: {
              zh: '一次意外之所以被记录为「意外发现」，前提是它被注意到、被追下去、并且最终发表了——三道筛子都在结果上选择',
              en: 'an accident is recorded as a serendipitous discovery only if it was noticed, pursued, and eventually published — three sieves, all selecting on the outcome',
            },
          },
          {
            quantity: { zh: '对缺席建模', en: 'modelling the absent' },
            inThisSubstrate: {
              zh: '把「有准备的心智」拆成可测量的条件，等于显式估计那道筛子——不再把幸存者当作全体',
              en: 'decomposing the prepared mind into measurable conditions is estimating that sieve explicitly, instead of mistaking the survivors for the population',
            },
          },
        ],
        prediction: {
          zh: '若这成立，不同科研体制下报告的意外发现率之差，应主要由「注意到并追下去」的制度条件解释，而不是由机遇本身的频率解释；两个机遇频率相近但记录制度不同的体制，报告率应显著不同。',
          en: 'If it holds, differences in reported serendipity rates across research regimes should be explained mainly by the institutional conditions for noticing and pursuing, not by the frequency of chance itself — two regimes with similar chance but different recording practices should report markedly different rates.',
        },
        boundary: {
          zh: '「33%–50% 的发现属于意外」这个数字本身就取自已发表文献，因此它是被同一道筛子选出来的——用它来度量筛子，等于拿尺子量自己。要打破循环，需要一个记录了未被追下去的意外的独立数据源，而这样的记录几乎不存在。',
          en: 'The very figure that a third to a half of discoveries are accidental comes from the published record, so it is itself a product of the sieve it is used to measure — a ruler measuring itself. Breaking the circle needs an independent record of accidents that were never pursued, and such records barely exist.',
        },
      },
    ],
  },

  {
    id: 'struct://xfrontier/covariate-shift-transfer',
    title: { zh: '迁移学习与协变量漂移', en: 'Transfer learning & covariate shift' },
    statement: {
      zh: '把一个域上学到的东西搬到另一个域，只有在「什么变了、什么没变」被写清楚时才可靠：条件关系不变而输入分布变，可重加权补偿；条件关系也变，则搬运本身失效。',
      en: 'Carrying what was learned on one domain over to another is reliable only once what changed and what did not is written down: if the conditional stays fixed while the input distribution moves, reweighting compensates; if the conditional moves too, the transfer itself is void.',
    },
    status: 'active',
    theme: 'causal-inference',
    isomorphism: 'ISO-34',
    provenance: XFRONTIER([1246, 1193]),
    mappings: [
      {
        slug: 'out-of-variable-generalization-partial-transportability',
        correspondences: [
          {
            quantity: { zh: '源域与目标域的分布差', en: 'the gap between source and target distributions' },
            inThisSubstrate: {
              zh: '目标环境里出现了源环境根本没测过的变量——不是同一分布的移动，而是变量集合本身变了',
              en: 'the target environment contains variables the source never measured — not a shift within one distribution but a change in the variable set itself',
            },
          },
          {
            quantity: { zh: '可迁移性的判定条件', en: 'the transportability criterion' },
            inThisSubstrate: {
              zh: '部分可迁移性给出的是「在未见变量上，风险的最坏情况上界」，而不是一个点估计',
              en: 'partial transportability yields a worst-case bound on risk under unseen variables rather than a point estimate',
            },
          },
        ],
        prediction: {
          zh: '若这成立，在目标域引入一个源域从未观测的变量后，模型的实际风险应落在部分可迁移性给出的上界之内；越界即说明不变性假设被违反，而不是模型欠拟合。',
          en: 'If it holds, introducing a variable never observed in the source should leave actual target risk inside the partial-transportability bound; a breach indicts the invariance assumption rather than model underfitting.',
        },
        boundary: {
          zh: '这条结构本身也是本项目的方法论：它说明「跨域搬运」永远要附带边界声明。而它的上界只有在因果图被正确指定时才成立——图错了，界也错，且不会报警。',
          en: 'This structure is also the project’s own methodology: cross-domain carrying always ships with a boundary statement. But the bound holds only if the causal graph is correctly specified — a wrong graph gives a wrong bound, silently.',
        },
      },
      {
        slug: 'functorial-cross-domain-structure-transport',
        correspondences: [
          {
            quantity: { zh: '「什么在搬运中保持不变」', en: 'what stays invariant under the carry' },
            inThisSubstrate: {
              zh: '函子所保持的运算结构——迁移学习问的是哪个条件分布不变，范畴论问的是哪些等式在映射后仍成立，两者问的是同一件事的两种形式化',
              en: 'the operational structure a functor preserves — transfer learning asks which conditional stays fixed, category theory asks which equations survive the mapping; two formalisms of one question',
            },
          },
          {
            quantity: { zh: '可迁移性的判定条件', en: 'the criterion that licenses the transfer' },
            inThisSubstrate: {
              zh: '把「两个领域讲的是同一个故事」从修辞变成可检验命题——保真性像类型检查一样可以被自动验证，而不是靠读者觉得像',
              en: 'turning "these two fields are telling the same story" from rhetoric into a checkable proposition — fidelity verified like a type-check rather than felt by the reader',
            },
          },
        ],
        prediction: {
          zh: '若这成立，一个通过函子检查的移植，其在目标域的失效应集中在函子未覆盖的运算上；而检查失败的移植应在任意运算上都可能失效。失效位置的分布因此可以反过来验证函子刻画对不对。',
          en: 'If it holds, a transport that passes the functorial check should fail in the target only on operations the functor does not cover, while one that fails the check should be able to fail anywhere — so the distribution of failures tests the functorial description itself.',
        },
        boundary: {
          zh: '函子保证的是结构被保持，不是经验为真：可以存在一个完美的保结构映射，而两个领域的实际机制毫无关系。类型检查通过不等于程序做对了事。',
          en: 'A functor guarantees structure is preserved, not that the claim is empirically true: a perfect structure-preserving map can exist between fields whose actual mechanisms are unrelated. Passing the type-check is not doing the right thing.',
        },
      },
    ],
  },

  {
    id: 'struct://xfrontier/fisher-precision-limit',
    title: { zh: '费雪信息与精度极限', en: 'Fisher information & the precision limit' },
    statement: {
      zh: '任何无偏估计的方差都不可能低于费雪信息的倒数——「还能测多准」不是工程问题，而是被数据生成过程本身封顶的量。',
      en: 'No unbiased estimator can have variance below the inverse of the Fisher information — how well something can be measured is capped by the data-generating process itself, not by engineering effort.',
    },
    status: 'active',
    theme: 'unknown-mapping',
    isomorphism: 'ISO-28',
    provenance: XFRONTIER([574, 910]),
    mappings: [
      {
        slug: 'fundamental-limits-information-thermodynamics',
        correspondences: [
          {
            quantity: { zh: '费雪信息 I(θ)', en: 'Fisher information I(θ)' },
            inThisSubstrate: {
              zh: '一次测量能从涨落中提取的信息量，直接决定了妖能兑换出多少功',
              en: 'how much information one measurement can extract from fluctuations, which directly sets how much work the demon can convert',
            },
          },
          {
            quantity: { zh: '克拉默-拉奥下界', en: 'the Cramér–Rao bound' },
            inThisSubstrate: {
              zh: '把「测不准」与「做不到功」写成同一个不等式的两端',
              en: 'writing cannot-measure-better and cannot-extract-more as two sides of one inequality',
            },
          },
        ],
        prediction: {
          zh: '若这成立，在同一装置上提高测量精度所能换来的额外功，应在费雪信息饱和处停止增长，而不是随投入线性上升。',
          en: 'If it holds, the extra work bought by improving measurement precision on one apparatus should stop growing where Fisher information saturates, rather than rising linearly with effort.',
        },
        boundary: {
          zh: '克拉默-拉奥界只约束无偏估计。允许有偏时方差可以更低，而实际热力学装置里的估计几乎总是有偏的。',
          en: 'The Cramér–Rao bound constrains unbiased estimators only. Biased estimators can go lower, and estimators in real thermodynamic apparatus are almost always biased.',
        },
      },
      {
        slug: 'erasure-conversion-qubits-turning-loss',
        correspondences: [
          {
            quantity: { zh: '量子费雪信息与海森堡极限', en: 'quantum Fisher information and the Heisenberg limit' },
            inThisSubstrate: {
              zh: '知道错误发生在哪一位，等价于把该位的费雪信息从零抬到有限值——精度的提升来自「知道自己不知道什么」',
              en: 'knowing which position failed lifts that position’s Fisher information from zero to finite — the precision gain comes from knowing what one does not know',
            },
          },
        ],
        prediction: {
          zh: '若这成立，擦除转换带来的精度增益应随「位置已知」的比例定量变化，而与该比例是如何获得的无关。',
          en: 'If it holds, the precision gain from erasure conversion should scale quantitatively with the fraction of located errors, independent of how that localisation was achieved.',
        },
        boundary: {
          zh: '量子费雪信息依赖于所选测量基；换一组测量，同一个态的可达精度会变。这里的「极限」是相对某个测量方案而言的。',
          en: 'Quantum Fisher information depends on the chosen measurement basis; the attainable precision for one state changes with the measurement. The limit here is relative to a measurement scheme.',
        },
      },
    ],
  },

  {
    id: 'struct://xfrontier/transitive-link-prediction',
    title: { zh: '传递性链接预测（Swanson ABC）', en: 'Transitive link prediction (Swanson ABC)' },
    statement: {
      zh: '若 A→B 与 B→C 都已被记录、而 A→C 从未被任何人写下，这条缺失的边本身就是一个可检验的假说——发现可以从已有记录的结构里被推出来。',
      en: 'If A→B and B→C are both on record while A→C has never been written down by anyone, that missing edge is itself a testable hypothesis — discovery can be derived from the structure of what is already recorded.',
    },
    status: 'active',
    theme: 'knowledge-commons',
    isomorphism: 'ISO-32',
    provenance: XFRONTIER([662]),
    mappings: [
      {
        slug: 'formal-unknown',
        correspondences: [
          {
            quantity: { zh: '未被写下的传递闭包', en: 'the un-written part of the transitive closure' },
            inThisSubstrate: {
              zh: '把「没人说过」形式化成图上的一个可枚举对象，而不是一种感觉',
              en: 'formalising nobody-has-said-this as an enumerable object on a graph rather than as an intuition',
            },
          },
          {
            quantity: { zh: '缺边的可检验性', en: 'the testability of a missing edge' },
            inThisSubstrate: {
              zh: '未知论要求「未知」必须带着自己的检验方式出现，否则它只是修辞',
              en: 'a formal account of the unknown requires each unknown to arrive with its own test, or it is only rhetoric',
            },
          },
        ],
        prediction: {
          zh: '若这成立，按传递闭包缺口排序产生的候选假说，其后续被独立证实的比例应显著高于随机配对产生的候选。',
          en: 'If it holds, hypotheses ranked by gaps in the transitive closure should be independently confirmed at a markedly higher rate than randomly paired candidates.',
        },
        boundary: {
          zh: '传递性在因果上并不普遍成立：A→B、B→C 可以同时为真而 A→C 为假（中介被抑制、剂量不匹配、语境相关）。这里预测的是「值得查」，不是「成立」。这也正是本项目坚持人来定稿、AI 只做脚手架的原因。',
          en: 'Transitivity does not hold causally in general: A→B and B→C can both be true while A→C is false (suppressed mediators, mismatched doses, context dependence). What is predicted is worth-checking, not true — which is exactly why this project has humans finalise and AI only scaffold.',
        },
      },
      {
        slug: 'mining-disciplinary-fissures-atlas-of',
        correspondences: [
          {
            quantity: { zh: '结构洞（本该相连而未连之处）', en: 'the structural hole — where a link should be and is not' },
            inThisSubstrate: {
              zh: '引文与共词网络里学科之间几乎无连接的那些裂缝，被当作可勘探的地形而不是噪声',
              en: 'the near-unconnected fissures between disciplines in citation and co-word networks, treated as prospectable terrain rather than as noise',
            },
          },
          {
            quantity: { zh: '缺边是可枚举的', en: 'missing edges are enumerable' },
            inThisSubstrate: {
              zh: '把「没人做过的跨界」画成一张图,于是机会不再靠偶遇——这正是本项目的地图想做而尚未做到的事',
              en: 'drawing the never-crossed crossings as a map, so opportunity stops depending on chance encounter — precisely what this project’s own atlas aspires to and does not yet do',
            },
          },
        ],
        prediction: {
          zh: '若这成立，被图谱标为结构洞的学科对，其后续实际产生的跨界合作率应显著高于随机学科对；若两者无差别，说明洞的存在只反映了不可通约，而非机会。',
          en: 'If it holds, discipline pairs flagged as structural holes should later show a markedly higher rate of real cross-field collaboration than random pairs; no difference would mean the holes record incommensurability rather than opportunity.',
        },
        boundary: {
          zh: '一个洞可能因为不该被填才空着：两个领域之间没有连接，有时是因为它们真的无关，而引文网络分不出「无人尝试」与「尝试过且失败」。图谱能指出空白，不能判断空白值不值得。',
          en: 'A hole may be empty because it should be: sometimes two fields are unconnected because they are genuinely unrelated, and a citation network cannot separate never-attempted from attempted-and-failed. The atlas can point at a blank; it cannot say the blank is worth filling.',
        },
      },
    ],
  },

  {
    id: 'struct://xfrontier/recursive-bayesian-filter',
    title: { zh: '递归贝叶斯滤波', en: 'Recursive Bayesian filtering' },
    statement: {
      zh: '把「预测下一步」与「用新观测修正」写成一个循环，系统就能在噪声里维持一份始终最新的状态估计——记忆不必保留全部历史，只需保留足够的充分统计量。',
      en: 'Fold predict-the-next-step and correct-with-the-new-observation into one loop and a system can hold a continuously current state estimate under noise — memory need not keep all history, only a sufficient statistic.',
    },
    status: 'active',
    theme: 'simulation-twins',
    isomorphism: 'ISO-13',
    provenance: XFRONTIER([1376, 814]),
    mappings: [
      {
        slug: 'self-supervised-latent-world-models',
        correspondences: [
          {
            quantity: { zh: '状态的充分统计量', en: 'the sufficient statistic of the state' },
            inThisSubstrate: {
              zh: '自监督学出来的潜空间——它被要求「足够预测未来」，而不是「足够重建像素」',
              en: 'the self-supervised latent space, required to be sufficient for predicting the future rather than for reconstructing pixels',
            },
          },
          {
            quantity: { zh: '卡尔曼增益（相信模型还是相信观测）', en: 'the Kalman gain — trust the model or trust the observation' },
            inThisSubstrate: {
              zh: '零样本规划时对模型 rollout 与实时感知之间的权重分配，决定了机器人在新环境里敢走多远',
              en: 'how zero-shot planning weights model rollouts against live perception, which sets how far a robot dares to act in a new environment',
            },
          },
        ],
        prediction: {
          zh: '若这成立，人为提高观测噪声时，规划性能的下降曲线应与增益的理论移动一致；若下降得更快，说明潜空间并非充分统计量。',
          en: 'If it holds, raising observation noise should degrade planning along the curve the gain shift predicts; a steeper fall indicts the latent space as not sufficient.',
        },
        boundary: {
          zh: '卡尔曼的最优性只在线性高斯下成立。学出来的潜动力学既非线性也非高斯，因此这里借的是循环结构，不是最优性保证。',
          en: 'Kalman optimality holds only in the linear-Gaussian case. Learned latent dynamics are neither, so what is borrowed here is the loop structure, not the optimality guarantee.',
        },
      },
      {
        slug: 'active-inference',
        correspondences: [
          {
            quantity: { zh: '预测—修正循环', en: 'the predict–correct loop' },
            inThisSubstrate: {
              zh: '感知被实现为对预测误差的连续下压，而不是对输入的一次性识别',
              en: 'perception implemented as continuous suppression of prediction error rather than one-shot recognition of an input',
            },
          },
        ],
        prediction: {
          zh: '若这成立，在观测被短暂遮断的窗口内，主动推断智能体的状态估计漂移速率应由过程噪声单独决定，与遮断前的观测质量无关。',
          en: 'If it holds, during a brief observation blackout the agent’s estimate should drift at a rate set by process noise alone, independent of the observation quality before the blackout.',
        },
        boundary: {
          zh: '主动推断允许智能体去改变被观测量本身，这一步超出了标准滤波的设定——滤波器只观测，不干预。',
          en: 'Active inference lets the agent change what is observed, a move outside the standard filtering setting — a filter observes and never intervenes.',
        },
      },
    ],
  },

  {
    id: 'struct://xfrontier/shannon-entropy',
    title: { zh: '香农熵与信道容量', en: 'Shannon entropy & channel capacity' },
    statement: {
      zh: '一个来源能被压缩到多短、一条通道能可靠传多快，都由同一个量封顶——不确定性是可度量、可交易的物理量而不是修辞。',
      en: 'How far a source can be compressed and how fast a channel can carry it reliably are capped by one and the same quantity — uncertainty is a measurable, tradable physical quantity rather than a figure of speech.',
    },
    status: 'active',
    theme: 'living-computation',
    isomorphism: 'ISO-08',
    provenance: XFRONTIER_EXPANSION([574, 123, 552]),
    mappings: [
      {
        slug: 'fundamental-limits-information-thermodynamics',
        correspondences: [
          {
            quantity: { zh: '熵 H = −Σ p·log p', en: 'entropy H = −Σ p·log p' },
            inThisSubstrate: {
              zh: '与热力学熵共用同一个表达式，兰道尔擦除代价把这一形式上的重合变成了可测的能量',
              en: 'sharing its expression with thermodynamic entropy, with Landauer’s erasure cost turning that formal coincidence into measurable energy',
            },
          },
        ],
        prediction: {
          zh: '若这成立，擦除一比特的最小耗散应在不同物理实现（电子、光学、胶体）上收敛到同一个 kT ln2，而与实现细节无关。',
          en: 'If it holds, the minimum dissipation for erasing one bit should converge to the same kT ln2 across electronic, optical and colloidal realisations, independent of implementation.',
        },
        boundary: {
          zh: '形式相同不等于本体相同：香农熵是对一个概率分布的度量，热力学熵是对一个物理系综的度量。兰道尔界把它们接上，靠的是一个具体的物理协议，而不是恒等式。',
          en: 'Same form is not same thing: Shannon entropy measures a probability distribution, thermodynamic entropy a physical ensemble. Landauer’s bound joins them through a specific physical protocol, not an identity.',
        },
      },
      {
        slug: 'info-chemistry',
        correspondences: [
          {
            quantity: { zh: '信道容量', en: 'channel capacity' },
            inThisSubstrate: {
              zh: '一个分子体系每次反应事件能可靠承载的比特数，决定了化学能不能被当作计算介质',
              en: 'how many bits one reaction event can reliably carry, which decides whether chemistry can serve as a computing medium',
            },
          },
        ],
        prediction: {
          zh: '若这成立，分子编码方案的可靠读出率应随其码字熵接近容量而饱和，且饱和点不依赖具体化学体系。',
          en: 'If it holds, reliable read-out of a molecular encoding should saturate as codeword entropy approaches capacity, at a point independent of the particular chemistry.',
        },
        boundary: {
          zh: '香农容量假设信道统计已知且平稳。分子体系里噪声随浓度、温度、副反应漂移，容量本身是个移动目标。',
          en: 'Shannon capacity assumes known, stationary channel statistics. In molecular systems noise drifts with concentration, temperature and side reactions, so capacity itself is a moving target.',
        },
      },
      {
        slug: 'social-physics-predictability-boundary',
        correspondences: [
          {
            quantity: { zh: '序列熵率', en: 'sequence entropy rate' },
            inThisSubstrate: {
              zh: '个体位置轨迹在保留访问顺序后仍剩余的不可预测信息量',
              en: 'the irreducible uncertainty remaining in an individual mobility trace after visit order is retained',
            },
          },
          {
            quantity: { zh: '由 Fano 不等式给出的可预测率上界', en: 'predictability ceiling from Fano’s inequality' },
            inThisSubstrate: {
              zh: '任何算法在相同空间离散与观测历史下能正确猜中下一个位置的理论最高比例',
              en: 'the theoretical maximum fraction of next locations any algorithm can guess correctly under the same spatial discretisation and observed history',
            },
          },
        ],
        prediction: {
          zh: '若这个边界有效，在相同轨迹表示上训练的模型，其留出下一位置准确率不应稳定超过由熵率推得的上界；改变空间粒度后，熵率与上界应一起按可复算方向移动。',
          en: 'If the bound is valid, models trained on the same trajectory representation should not stably exceed the entropy-derived ceiling on held-out next-location accuracy; changing spatial granularity should move both entropy rate and the ceiling in a reproducible direction.',
        },
        boundary: {
          zh: '上界依赖轨迹离散、有限样本与平稳性假设，只约束“按该表示预测位置”，不说明人的行为由简单规律决定，更不能从可预测性直接推出因果可控性。',
          en: 'The ceiling depends on trajectory discretisation, finite samples, and stationarity. It constrains location prediction under that representation; it neither makes human behaviour simple nor turns predictability into causal controllability.',
        },
        evidenceRefs: [
          'https://www.science.org/doi/10.1126/science.1177170',
          'https://www.nature.com/articles/s41467-022-29592-y',
        ],
      },
    ],
  },

  {
    id: 'struct://xfrontier/assembly-description-length',
    title: { zh: '装配指数与最小描述长度', en: 'Assembly index & minimum description length' },
    statement: {
      zh: '一个物体「有多难被偶然造出来」可以用造出它的最短路径长度来量——复杂性因此从直觉变成了一个可数、可比较、可被证伪的量。',
      en: 'How hard an object is to make by accident can be measured by the length of the shortest path that builds it — complexity thereby turns from intuition into a countable, comparable, falsifiable quantity.',
    },
    status: 'active',
    theme: 'unknown-mapping',
    isomorphism: 'ISO-30',
    provenance: XFRONTIER([123]),
    mappings: [
      {
        slug: 'info-chemistry',
        correspondences: [
          {
            quantity: { zh: '最短装配路径的步数', en: 'the step count of the shortest assembly path' },
            inThisSubstrate: {
              zh: '一个分子从可得砌块出发所需的最少复用步骤，可以直接用串联质谱去数',
              en: 'the fewest reuse-permitting steps a molecule needs from available building blocks — countable directly by tandem mass spectrometry',
            },
          },
          {
            quantity: { zh: '「高复杂度 + 高丰度」的联合判据', en: 'the joint high-complexity-and-high-abundance criterion' },
            inThisSubstrate: {
              zh: '只有同时满足两者，才排除偶然生成——这正是把不可知生命探测从哲学变成实验的那一步',
              en: 'only both together rule out accidental formation — the step that turns agnostic life detection from philosophy into an experiment',
            },
          },
        ],
        prediction: {
          zh: '若这成立，在任意化学体系里，装配指数超过阈值且丰度显著的分子，都应能追溯到某种选择性过程，而非纯随机化学。',
          en: 'If it holds, in any chemistry a molecule both above the assembly-index threshold and significantly abundant should be traceable to some selective process rather than to random chemistry alone.',
        },
        boundary: {
          zh: '装配理论与算法复杂度的等价性目前仍有争议：柯氏复杂度不可计算，而装配指数是可测的近似，两者之间的落差还没有被完整刻画。阈值本身也依赖于「可得砌块」如何定义。',
          en: 'The claimed equivalence with algorithmic complexity remains contested: Kolmogorov complexity is uncomputable while the assembly index is a measurable proxy, and the gap between them is not fully characterised. The threshold also depends on how available building blocks are defined.',
        },
      },
      {
        slug: 'the-detection-science-of-the',
        correspondences: [
          {
            quantity: { zh: '不预设生化的复杂度判据', en: 'a complexity criterion that presupposes no biochemistry' },
            inThisSubstrate: {
              zh: '影子生物圈最硬的张力是检测的循环依赖——仪器按已知生命标定，对真正异源的生命可能毫无响应；装配指数是目前唯一一条不靠「像不像已知生命」来判定的出路',
              en: 'the shadow biosphere’s hardest tension is detection circularity — instruments calibrated on known life may not respond to genuinely other life; the assembly index is the one criterion on offer that does not decide by resemblance to what is already known',
            },
          },
          {
            quantity: { zh: '高复杂度 + 高丰度的联合判据', en: 'the joint high-complexity-and-high-abundance criterion' },
            inThisSubstrate: {
              zh: '在阿塔卡马深部这类隔离环境里，一个既难被偶然造出、又反复出现的分子，无论它用什么生化，都在指向某个选择过程',
              en: 'in an isolated setting like the deep Atacama, a molecule both hard to make by accident and repeatedly present points at some selective process whatever biochemistry it runs on',
            },
          },
        ],
        prediction: {
          zh: '若这成立，对隔离环境样本按装配指数而非按已知生物标志物筛选，应在同等测量预算下发现更高比例的无法归入已知谱系的分子；若两种筛法命中同一批分子，说明装配判据并没有逃出已知生化的圈。',
          en: 'If it holds, screening isolated-environment samples by assembly index rather than by known biomarkers should surface a higher share of molecules that fit no known lineage at equal measurement budget — and if both screens return the same molecules, the assembly criterion has not escaped known biochemistry after all.',
        },
        boundary: {
          zh: '装配指数只是把循环推后了一步，没有取消它：「可得砌块」这个集合仍要由人指定，而人只会用自己知道的化学去指定它。一个用完全陌生砌块的体系，其装配路径长度可能被系统性高估或低估，而我们没有办法从外部知道是哪一种。',
          en: 'The assembly index defers the circularity rather than dissolving it: the set of available building blocks is still specified by people, using the chemistry they already know. A system built from wholly unfamiliar blocks could have its path length systematically over- or under-counted, with no external way to tell which.',
        },
      },
    ],
  },

  // ── 2026-07 方向扩展：两条缺失但可落地的机制骨架 ───────────────────────
  // 这些不是把新岛按主题打包。每条边都要求同一组可测变量、一个会失败的
  // 预测，以及明确不能搬运的边界；没有这三样就宁可保持为地图缺口。

  {
    id: 'struct://xfrontier/distributed-field-observability',
    title: { zh: '分布式物理场的可观测性', en: 'Observability through distributed physical fields' },
    statement: {
      zh: '局部事件在空间中激发一个可传播的物理场；只有传递函数、传感孔径与背景噪声被校准后，沿场分布的观测才足以反演事件的时间、位置或类别。',
      en: 'A local event excites a physical field that propagates through space; only after the transfer function, sensing aperture, and background noise are calibrated can distributed observations recover the event’s time, location, or class.',
    },
    status: 'active',
    theme: 'unknown-mapping',
    provenance: XFRONTIER_EXPANSION([533, 545, 534]),
    mappings: [
      {
        slug: 'dark-fiber-ecological-sensing',
        correspondences: [
          {
            quantity: { zh: '源事件与传播场', en: 'source event and propagating field' },
            inThisSubstrate: {
              zh: '鲸歌、船舶、风暴或地震在海底激发并传播的弹性波场',
              en: 'the elastic wavefield launched through the seafloor by whale calls, vessels, storms, or earthquakes',
            },
          },
          {
            quantity: { zh: '分布式传感孔径', en: 'distributed sensing aperture' },
            inThisSubstrate: {
              zh: '既有海底通信光纤上数千个连续应变采样通道',
              en: 'thousands of contiguous strain-sampling channels along an existing subsea telecommunications fibre',
            },
          },
        ],
        prediction: {
          zh: '若反演骨架成立，同一事件应在相邻光纤通道上形成与传播速度和几何一致的到时斜率，鲸、船与地震的独立标注应在留出区段上仍可定位；光纤与波前接近正交或海床耦合变差时，灵敏度应按模型下降。',
          en: 'If the inversion skeleton holds, one event should produce arrival-time slopes across adjacent fibre channels consistent with propagation speed and geometry, and independently labelled whales, vessels, and earthquakes should remain localisable on held-out cable sections; sensitivity should fall as modelled when the fibre is poorly coupled to the seabed or nearly orthogonal to the wavefront.',
        },
        boundary: {
          zh: '光纤测到的是沿线应变，不是鲸或地震本身。海床耦合、缆线方向、空间混叠和船噪都会改变可见性；分类器命中并不能替代源—场—传感器的校准。',
          en: 'The fibre measures axial strain, not a whale or earthquake directly. Seabed coupling, cable orientation, spatial aliasing, and vessel noise all alter visibility; a classifier hit cannot replace calibration of source, field, and sensor.',
        },
        evidenceRefs: [
          'https://www.nature.com/articles/s41598-022-23606-x',
          'https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2022.901348/full',
        ],
      },
      {
        slug: 'biotremology-vibrational-communication',
        correspondences: [
          {
            quantity: { zh: '编码源波形', en: 'encoded source waveform' },
            inThisSubstrate: {
              zh: '昆虫敲击、摩擦或振动身体后注入植物、土壤或巢体的时频模式',
              en: 'the time–frequency pattern an insect injects into a plant, soil, or nest by tapping, stridulating, or vibrating its body',
            },
          },
          {
            quantity: { zh: '基底传递函数', en: 'substrate transfer function' },
            inThisSubstrate: {
              zh: '植物茎叶或其他承载介质对不同频率、距离和耦合位置的衰减与失真',
              en: 'the attenuation and distortion imposed by a plant stem, leaf, or other carrier across frequency, distance, and coupling position',
            },
          },
        ],
        prediction: {
          zh: '若振动是可观测的信息通道，在同一基底上回放保留原始时频结构的信号应诱发接收者的定向、求偶或避害反应，而等能量但打乱相位或频谱的对照不应；响应距离应随实测传递函数衰减。',
          en: 'If vibration is an observable information channel, playback preserving the original time–frequency structure through the same substrate should elicit orientation, mating, or avoidance while equal-energy phase- or spectrum-scrambled controls should not; response range should decay with the measured transfer function.',
        },
        boundary: {
          zh: '动物会主动选择基底、调节发声并结合化学与视觉语境，它们不是被动传感器阵列。这里只共享“源—场—接收器”的可观测性条件，不共享 DAS 的线性反演算法。',
          en: 'Animals actively choose substrates, adjust signalling, and combine chemical and visual context; they are not passive sensor arrays. What transfers is the source–field–receiver observability condition, not DAS’s linear inversion machinery.',
        },
        evidenceRefs: ['https://pmc.ncbi.nlm.nih.gov/articles/PMC3310055/'],
      },
      {
        slug: 'aerial-electroecology',
        correspondences: [
          {
            quantity: { zh: '场源与外场', en: 'field source and ambient field' },
            inThisSubstrate: {
              zh: '带电生物、花朵与大气电势梯度在空气中形成的低频电场',
              en: 'the low-frequency electric field formed in air by charged organisms, flowers, and the atmospheric potential gradient',
            },
          },
          {
            quantity: { zh: '场—受体转换', en: 'field-to-receptor transduction' },
            inThisSubstrate: {
              zh: '感受毛或其他机械受体把电场力转成可被神经系统读取的偏转',
              en: 'sensory hairs or other mechanoreceptors converting electric force into deflection readable by the nervous system',
            },
          },
        ],
        prediction: {
          zh: '若动物确实通过该场获得信息，在控制气流、光照与湿度后，单独改变电场强度或极性应可逆地改变感受毛偏转和行为；接地或静电屏蔽应消除效应。',
          en: 'If animals obtain information through this field, changing field strength or polarity alone while controlling airflow, light, and humidity should reversibly alter sensory-hair deflection and behaviour; grounding or electrostatic shielding should abolish the effect.',
        },
        boundary: {
          zh: '电场不是声波，空气中的电静力转换也不是海底应变传播；这条连接只保留“空间场经已知传递函数变得可观测”，不能搬运声学频谱或波速结论。',
          en: 'An electric field is not an acoustic wave, and electrostatic transduction in air is not seafloor strain propagation. The link preserves only observability through a calibrated spatial field, not acoustic spectra or wave-speed conclusions.',
        },
        evidenceRefs: ['https://www.sciencedirect.com/science/article/pii/S0960982218306936'],
      },
    ],
  },

  {
    id: 'struct://xfrontier/stateful-in-materia-computation',
    title: { zh: '材料内的有状态计算', en: 'Stateful in-materia computation' },
    statement: {
      zh: '材料的内部物理状态同时保存输入历史并改变后续输入的变换；只有当状态更新、算子与读出都可复现、可重编程并通过留出任务检验时，迟滞才构成计算而不只是漂移。',
      en: 'A material’s internal physical state both stores input history and changes the transformation applied to later inputs; hysteresis becomes computation rather than drift only when state updates, operators, and readouts are reproducible, reprogrammable, and validated on held-out tasks.',
    },
    status: 'active',
    theme: 'living-computation',
    provenance: XFRONTIER_EXPANSION([532, 535]),
    mappings: [
      {
        slug: 'aqueous-iontronic-memristors',
        correspondences: [
          {
            quantity: { zh: '内部记忆状态 x', en: 'internal memory state x' },
            inThisSubstrate: {
              zh: '纳流道中的离子分布、表面电荷与润湿构型，它们在输入撤去后仍保留一段时间',
              en: 'ion distributions, surface charge, and wetting configurations in a nanofluidic channel that persist after the input is removed',
            },
          },
          {
            quantity: { zh: '状态依赖算子 y = f(u, x)', en: 'state-dependent operator y = f(u, x)' },
            inThisSubstrate: {
              zh: '同一电压或压力探针因历史状态不同而产生不同电流，把时间序列积分与非线性变换放进流体器件',
              en: 'the same voltage or pressure probe producing a different current after different histories, placing temporal integration and nonlinear transformation inside the fluidic device',
            },
          },
        ],
        prediction: {
          zh: '若内部状态承担计算，用两组可区分的脉冲历史写入后施加同一盲测探针，输出应稳定区分历史并预测序列任务标签；执行物理复位后差异应消失，再写入应恢复，而非随器件老化单调漂移。',
          en: 'If internal state performs the computation, two distinguishable pulse histories followed by the same blind probe should yield stable outputs that predict sequence labels; a physical reset should erase the difference and rewriting should restore it, rather than the signal drifting monotonically with device ageing.',
        },
        boundary: {
          zh: '迟滞、极化与慢漂移本身不等于记忆计算。必须证明状态可寻址、可复位、跨器件可复现，并在未见输入上优于无状态基线。',
          en: 'Hysteresis, polarisation, and slow drift are not memory computation by themselves. The state must be addressable, resettable, reproducible across devices, and outperform a stateless baseline on unseen inputs.',
        },
        evidenceRefs: [
          'https://pmc.ncbi.nlm.nih.gov/articles/PMC11067030/',
          'https://www.nature.com/articles/s41928-024-01137-9',
        ],
      },
      {
        slug: 'mechanical-metamaterial-computing',
        correspondences: [
          {
            quantity: { zh: '可编程内部状态 x', en: 'programmable internal state x' },
            inThisSubstrate: {
              zh: '屈曲单元、软模或可重构连接的稳定构型，它把所选逻辑或线性算子保存在几何中',
              en: 'a stable configuration of buckled units, floppy modes, or reconfigurable links that stores a selected logic or linear operator in geometry',
            },
          },
          {
            quantity: { zh: '材料算子 f', en: 'material operator f' },
            inThisSubstrate: {
              zh: '输入力和位移经过弹性耦合后，在一次物理响应中变成逻辑输出或矩阵—向量乘积',
              en: 'elastic coupling transforming input forces and displacements into a logic output or matrix–vector product in one physical response',
            },
          },
        ],
        prediction: {
          zh: '若几何状态就是程序，只改变可重构单元而不增加电子控制器，应可切换真值表或矩阵算子，并在留出载荷上达到设计误差；复位到原构型后原算子应恢复。',
          en: 'If geometry is the program, changing only reconfigurable units with no added electronic controller should switch the truth table or matrix operator and meet its design error on held-out loads; resetting the original configuration should restore the original operator.',
        },
        boundary: {
          zh: '任何弹性体都会做固定的力—位移变换，但这不等于通用计算。摩擦、疲劳和制造偏差也会制造“记忆”；只有可重编程、可复位并在任务上读出的部分属于这条结构。',
          en: 'Every elastic body performs a fixed force–displacement transform, but that is not general computation. Friction, fatigue, and fabrication error can also mimic memory; only the reprogrammable, resettable, task-readable part belongs to this structure.',
        },
        evidenceRefs: [
          'https://www.nature.com/articles/s41467-023-40989-1',
          'https://www.nature.com/articles/s41467-021-27608-7',
        ],
      },
    ],
  },

  // ── ISO 对齐第三批 ──────────────────────────────────────────────────────
  // 判定规则（写在这里以便复核）：只有当某座岛的基底里确实存在结构骨架的对应物
  // 时才建映射；仅仅「同属一个簇」或「读起来相关」一律不建。落不下去的同构保留为
  // 零映射的纯前沿——注意判据是「没有一座岛以这个结构为对象」，不是「所在的簇是
  // 空的」：FRONTIERS 覆盖全部 53 个簇，没有空簇，所以簇级的存在性说明不了任何事。

  {
    id: 'struct://xfrontier/nash-equilibrium',
    title: { zh: '纳什均衡', en: 'Nash equilibrium' },
    statement: {
      zh: '一群各自逐利的参与者会停在一个没有人能单方面改善的组合上——秩序不必来自中央指令，也可以是相互最优的副产品。',
      en: 'A set of self-interested players comes to rest where no one can improve by moving alone — order need not come from a central instruction; it can be a by-product of mutual best response.',
    },
    status: 'active',
    theme: 'collective-dynamics',
    isomorphism: 'ISO-16',
    provenance: XFRONTIER([900]),
    mappings: [
      {
        slug: 'emergent-conventions-collective-bias-tipping',
        correspondences: [
          {
            quantity: { zh: '无人可单方面改善的不动点', en: 'the fixed point no one can unilaterally improve on' },
            inThisSubstrate: {
              zh: '命名博弈里成千 LLM 智能体两两交互后自发收敛到的那个共享规约——没有中央指令，也没有一个智能体能靠改口获益',
              en: 'the shared convention thousands of pairwise-interacting LLM agents settle into in a naming game — no central instruction, and no single agent gains by defecting from it',
            },
          },
          {
            quantity: { zh: '均衡选择（多个均衡里落到哪一个）', en: 'equilibrium selection — which of several equilibria is reached' },
            inThisSubstrate: {
              zh: '涌现出来的集体偏见：收敛点不是中立的，而是被交互历史挑出来的那一个',
              en: 'the collective bias that emerges: the convergence point is not neutral but the one interaction history singled out',
            },
          },
        ],
        prediction: {
          zh: '若这成立，在收敛后注入一小撮坚持异议的智能体，群体只有在其比例越过临界质量时才会整体翻转；低于该比例应回弹到原规约，而不是渐变。',
          en: 'If it holds, injecting a small committed-minority after convergence should flip the population only once its share crosses a critical mass; below it the group should snap back rather than drift.',
        },
        boundary: {
          zh: 'LLM 智能体不是效用最大化者——它们没有显式收益函数，「均衡」是行为上的稳定而非博弈论意义上的最优。用纳什均衡描述它，借的是不动点结构，不是理性假设。',
          en: 'LLM agents are not utility maximisers — they carry no explicit payoff function, so the equilibrium here is behavioural stability rather than game-theoretic optimality. What is borrowed is the fixed-point structure, not the rationality assumption.',
        },
      },
      {
        slug: 'autonomous-ai-scientist-ai-reviewer',
        correspondences: [
          {
            quantity: { zh: '机制设计（谁的收益决定谁的行为）', en: 'mechanism design — whose payoff drives whose behaviour' },
            inThisSubstrate: {
              zh: '当写论文的和评审论文的都是模型，评分规则就不再是一把中立的尺，而是参与者共同优化的目标函数',
              en: 'when both author and reviewer are models, the scoring rule stops being a neutral ruler and becomes the objective every participant optimises against',
            },
          },
          {
            quantity: { zh: '没有人能单方面改善的不动点', en: 'the fixed point no one improves on alone' },
            inThisSubstrate: {
              zh: '最危险的失败不是评分错，而是收敛到一个「AI 写、AI 评、双方都得高分」的自洽均衡——任何单方退出都吃亏，于是没人退出',
              en: 'the dangerous failure is not a wrong score but convergence on a self-consistent equilibrium where AI writes, AI reviews and both score well — any unilateral exit is costly, so nobody exits',
            },
          },
        ],
        prediction: {
          zh: '若这成立，纯 AI 评审通道的分数分布应随时间向上漂移并方差收窄，而同批稿件在人类复核下的分数不同步移动；两条曲线的分叉速度可以直接度量该均衡的强度。',
          en: 'If it holds, scores in an all-AI review channel should drift upward and narrow over time while human re-review of the same submissions does not move in step — and the rate at which the two curves diverge measures how strong that equilibrium has grown.',
        },
        boundary: {
          zh: '纳什均衡假设参与者的收益函数是固定的。这里的模型会被重新训练、评审提示会被改写，收益函数本身在动——所以这是一个移动靶上的不动点，稳定性只在一次训练周期内成立。这也正是为什么本项目把顶部成果交人类复核写死在流程里，而不是当作可选项。',
          en: 'Nash equilibrium assumes fixed payoff functions. Here the models get retrained and the review prompts rewritten, so the payoffs themselves move — a fixed point on a moving target, stable only within one training cycle. It is also why routing top results to human re-review is written into the process rather than offered as an option.',
        },
      },
    ],
  },

  {
    id: 'struct://xfrontier/ising-mean-field',
    title: { zh: '伊辛模型与平均场共识', en: 'The Ising model & mean-field consensus' },
    statement: {
      zh: '「局部对齐 + 一个外场」这个最小模型，就足以让一个系统在参数缓慢变化时突然整体翻转——共识不是渐变出来的，是越过临界点掉进去的。',
      en: 'Local alignment plus one external field is minimal enough to make a whole system flip abruptly as a parameter drifts — consensus is not reached gradually, it is fallen into across a critical point.',
    },
    status: 'active',
    theme: 'collective-dynamics',
    isomorphism: 'ISO-19',
    provenance: XFRONTIER_EXPANSION([1438, 900, 546]),
    mappings: [
      {
        slug: 'idiographic-dynamic-network-psychology',
        correspondences: [
          {
            quantity: { zh: '耦合强度 J（邻居间的相互对齐）', en: 'coupling J — mutual alignment between neighbours' },
            inThisSubstrate: {
              zh: '单人症状网络里症状之间的相互激发强度，由密集经验取样直接估计出来，而不是从群体平均推回去',
              en: 'the mutual-excitation strength between symptoms in one person’s network, estimated directly from dense sampling rather than inferred back from a group mean',
            },
          },
          {
            quantity: { zh: '临界点与滞后', en: 'the critical point and hysteresis' },
            inThisSubstrate: {
              zh: '把「发病」看成症状系统整体翻转，而非某个隐藏病灶被触发——因此复原路径不必与发病路径对称',
              en: 'onset read as the whole symptom system flipping rather than a hidden lesion firing — so the path out need not mirror the path in',
            },
          },
        ],
        prediction: {
          zh: '若这成立，在个体接近翻转时，症状序列应出现临界慢化的可测特征（自相关与方差同步上升），而这一信号在群体平均数据里会被抹平。',
          en: 'If it holds, an individual approaching a flip should show measurable critical slowing down (autocorrelation and variance rising together) — a signal that group-averaged data washes out.',
        },
        boundary: {
          zh: '伊辛自旋只有两个取值且耦合对称；症状是连续的、耦合有方向（A 激发 B 不等于 B 激发 A）。共享临界结构，不等于可以套用平衡态统计力学的全部结论。',
          en: 'Ising spins are binary with symmetric coupling; symptoms are continuous and their coupling is directed (A exciting B is not B exciting A). A shared critical structure does not license importing all of equilibrium statistical mechanics.',
        },
      },
      {
        slug: 'emergent-conventions-collective-bias-tipping',
        correspondences: [
          {
            quantity: { zh: '外场 h（一个偏置方向）', en: 'the external field h — one biasing direction' },
            inThisSubstrate: {
              zh: '少数坚定智能体施加的持续偏压，它不改变交互规则，只改变翻转所需的临界质量',
              en: 'the steady bias a committed minority applies — it does not change the interaction rule, only the critical mass a flip requires',
            },
          },
        ],
        prediction: {
          zh: '若这成立，临界质量应随外场强度（坚定智能体的固执程度）单调下降，且在不同模型家族上给出同一条标度曲线。',
          en: 'If it holds, critical mass should fall monotonically with field strength (how stubborn the committed agents are), tracing one scaling curve across different model families.',
        },
        boundary: {
          zh: '平均场近似假设每个单元感受到的是全局平均；LLM 群体的交互拓扑是两两配对且有记忆，因此临界指数不必与平均场值一致。',
          en: 'Mean field assumes each unit feels a global average; the LLM population interacts pairwise and with memory, so its critical exponents need not match mean-field values.',
        },
      },
      {
        slug: 'p-bit-probabilistic-computing',
        correspondences: [
          {
            quantity: { zh: '自旋 sᵢ ∈ {−1,+1}', en: 'spin sᵢ ∈ {−1,+1}' },
            inThisSubstrate: {
              zh: '随机磁隧道结在两个可读磁化状态间持续翻转的概率比特',
              en: 'a probabilistic bit formed by a stochastic magnetic tunnel junction continually switching between two readable magnetisation states',
            },
          },
          {
            quantity: { zh: '耦合 Jᵢⱼ 与外场 hᵢ', en: 'coupling Jᵢⱼ and field hᵢ' },
            inThisSubstrate: {
              zh: '可编程互连与偏置电压，它们把目标概率模型写进 p-bit 网络的条件翻转率',
              en: 'programmable interconnects and bias voltages that encode the target probabilistic model in the p-bit network’s conditional switching rates',
            },
          },
        ],
        prediction: {
          zh: '若伊辛映射成立，在校准温度、耦合和偏置的工作区内，硬件测得的边缘概率与成对相关应随 J、h 按目标玻尔兹曼分布移动；关闭耦合后相关应退回器件独立噪声基线。',
          en: 'If the Ising mapping holds, within the calibrated temperature, coupling, and bias regime, measured marginals and pair correlations should move with J and h according to the target Boltzmann distribution; disabling coupling should return correlations to the independent-device noise floor.',
        },
        boundary: {
          zh: '真实 p-bit 异步、非平衡且存在器件差异；它可以近似采样一个伊辛分布，却不自动共享平衡态极限下的临界指数或遍历性保证。',
          en: 'Real p-bits are asynchronous, nonequilibrium, and device-variable. They may approximate samples from an Ising distribution without inheriting equilibrium critical exponents or guarantees of ergodicity.',
        },
        evidenceRefs: ['https://www.nature.com/articles/s41467-024-48152-0'],
      },
    ],
  },

  {
    id: 'struct://xfrontier/branching-criticality',
    title: { zh: '分支过程与临界性', en: 'Branching processes & criticality' },
    statement: {
      zh: '一个数就决定命运：每一代的平均后代数小于一必然消亡，大于一可能爆发，恰好等于一时涌现出幂律雪崩。',
      en: 'One number decides the fate: mean offspring per generation below one means certain extinction, above one allows explosion, and exactly one is where power-law avalanches appear.',
    },
    status: 'active',
    theme: 'collective-dynamics',
    isomorphism: 'ISO-20',
    provenance: XFRONTIER([904]),
    mappings: [
      {
        slug: 'triadic-percolation-connectivity-dynamical',
        correspondences: [
          {
            quantity: { zh: '临界参数 R₀ = 1', en: 'the critical parameter R₀ = 1' },
            inThisSubstrate: {
              zh: '三元调控渗流里那个决定序参量存亡的阈值——渗流问「网络够不够连通」，分支问「每一代是否在倍增」，是同一个临界点的两副面孔',
              en: 'the threshold deciding whether the order parameter survives in triadic percolation — percolation asks whether the network is connected enough, branching asks whether each generation multiplies; two faces of one critical point',
            },
          },
        ],
        prediction: {
          zh: '若这成立，在三元渗流进入周期倍增之前的参数区间内，其雪崩规模分布应与临界分支过程给出的同一指数一致。',
          en: 'If it holds, in the parameter range before triadic percolation enters period doubling, its avalanche-size distribution should carry the exponent a critical branching process predicts.',
        },
        boundary: {
          zh: '这正是本条最有意思的地方：标准分支过程是单向的时间面，没有反馈；三元调控让边随节点状态改变，从而多出一条反馈回路——这条回路正是周期倍增与混沌的来源，而分支过程里根本没有它。',
          en: 'This is where the mapping earns its keep: a standard branching process is a one-way time slice with no feedback, whereas triadic regulation lets edges change with node state, adding the very feedback loop that produces period doubling and chaos — something branching processes simply do not contain.',
        },
      },
    ],
  },

  {
    id: 'struct://xfrontier/graph-laplacian-spectrum',
    title: { zh: '图拉普拉斯与代数连通度', en: 'The graph Laplacian & algebraic connectivity' },
    statement: {
      zh: '一张图的宏观性质几乎全部编码在 L = D − A 的特征谱里：第二小特征值同时度量它能否被切开、能否同步、以及最脆弱的那条切割线在哪。',
      en: 'Almost every macroscopic property of a graph is encoded in the spectrum of L = D − A: the second-smallest eigenvalue measures at once whether it can be cut, whether it can synchronise, and where its weakest cut lies.',
    },
    status: 'active',
    theme: 'collective-dynamics',
    isomorphism: 'ISO-22',
    provenance: XFRONTIER([904]),
    mappings: [
      {
        slug: 'triadic-percolation-connectivity-dynamical',
        correspondences: [
          {
            quantity: { zh: 'Fiedler 值 λ₂（代数连通度）', en: 'the Fiedler value λ₂ — algebraic connectivity' },
            inThisSubstrate: {
              zh: '这座岛研究的正是「从连通性到动力系统」这一步，而 λ₂ 就是被推上舞台、随时间演化的那个连通性标量',
              en: 'this island’s subject is exactly the step from connectivity to dynamics, and λ₂ is the connectivity scalar being pushed onstage and made to evolve in time',
            },
          },
        ],
        prediction: {
          zh: '若这成立，序参量的周期倍增应在 λ₂ 的时间序列上同步出现；即分岔可以只用谱量观测，而不必先重建整个巨连通分量。',
          en: 'If it holds, period doubling of the order parameter should appear synchronously in the λ₂ time series — the bifurcation observable from the spectrum alone, without reconstructing the giant component first.',
        },
        boundary: {
          zh: 'λ₂ 是静态图上的谱量。三元渗流里图本身每一步都在变，谱必须逐步重算；把 λ₂ 当成一个守恒的网络属性会直接读错分岔点。',
          en: 'λ₂ is a spectral quantity of a static graph. In triadic percolation the graph itself changes every step and the spectrum must be recomputed; treating λ₂ as a conserved network property misreads the bifurcation point outright.',
        },
      },
      {
        slug: 'coarse-graining-free-causal-emergence-dynamical',
        correspondences: [
          {
            quantity: { zh: '宏观性质从谱里读出来，而不是靠人挑一个划分', en: 'a macroscopic property read off a spectrum instead of a hand-picked partition' },
            inThisSubstrate: {
              zh: '对马尔可夫转移矩阵做奇异值分解，用奇异谱的集中度定义近似动力学可逆性——涌现的强弱从「选哪个粗粒化方案」变成「读这条谱」',
              en: 'singular-value decomposition of the Markov transition matrix, with spectral concentration defining approximate dynamical reversibility — emergence stops depending on which coarse-graining you pick and becomes something you read',
            },
          },
          {
            quantity: { zh: '一个特征值承载整体结论', en: 'one eigenvalue carrying a whole-system verdict' },
            inThisSubstrate: {
              zh: '正如 λ₂ 一个数就回答了「这张图能不能被切开、能不能同步」，谱集中度一个数就回答了「这个系统有没有涌现」',
              en: 'just as λ₂ alone answers whether a graph can be cut or can synchronise, spectral concentration alone answers whether a system exhibits emergence',
            },
          },
        ],
        prediction: {
          zh: '若这成立，对同一个系统人为更换粗粒化方案，奇异谱集中度应保持不变，而基于选定方案的涌现度量会随之漂移；两者若同步漂移，说明这条谱量并没有摆脱方案依赖。',
          en: 'If it holds, swapping coarse-graining schemes on one system should leave spectral concentration unchanged while scheme-dependent emergence measures drift — and if both drift together, the spectral quantity never escaped scheme dependence.',
        },
        boundary: {
          zh: '图拉普拉斯的谱描述的是一张固定图上的连通结构，转移矩阵的奇异谱描述的是一个动力系统的可逆性。两者共享「把整体性质压进谱」这一手法，但被压进去的不是同一个东西——把 λ₂ 的直觉(切割线在哪)搬到可逆性上会得到一个没有对应物的问题。',
          en: 'The graph Laplacian’s spectrum describes connectivity on a fixed graph; the transition matrix’s singular spectrum describes a dynamical system’s reversibility. They share the move of compressing a global property into a spectrum, but not what gets compressed — carrying λ₂’s intuition (where does it cut) over to reversibility produces a question with no counterpart.',
        },
      },
    ],
  },

  {
    id: 'struct://xfrontier/gauge-equivariance',
    title: { zh: '局域不变性与等变性', en: 'Local invariance & equivariance' },
    statement: {
      zh: '要求一条规律在每一点独立变换下仍成立，就会逼出一个新的场——不变性不是对已有理论的检验，而是生成理论的引擎。',
      en: 'Demanding that a law survive an independent transformation at every point forces a new field into existence — invariance is not a test applied to a theory but the engine that generates one.',
    },
    status: 'active',
    theme: 'knowledge-commons',
    isomorphism: 'ISO-23',
    provenance: XFRONTIER([1486]),
    mappings: [
      {
        slug: 'category-theory-algebraic-theory',
        correspondences: [
          {
            quantity: { zh: '局域对称要求 ⇒ 规范场被逼出来', en: 'a local symmetry requirement ⇒ a gauge field is forced' },
            inThisSubstrate: {
              zh: '在 2-范畴的单子上写死约束（等变性、组合律），架构就不是被设计出来的而是被推导出来的——RNN 等被重新导出，而非重新发明',
              en: 'fixing the constraints (equivariance, composition laws) on a 2-categorical monad makes the architecture derived rather than designed — RNNs come back out as theorems, not inventions',
            },
          },
          {
            quantity: { zh: '协变导数（把约束吸收进运算本身）', en: 'the covariant derivative — absorbing the constraint into the operation itself' },
            inThisSubstrate: {
              zh: '几何深度学习里的等变卷积：不是先算再投影回不变子空间，而是让运算本身自带对称性',
              en: 'the equivariant convolution of geometric deep learning: not compute-then-project back onto an invariant subspace, but an operation that carries the symmetry within it',
            },
          },
        ],
        prediction: {
          zh: '若这成立，两个由同一组对称约束导出的架构，其样本复杂度应属于同一量级；架构间的差距应主要来自实现，而不来自归纳偏置。',
          en: 'If it holds, two architectures derived from the same symmetry constraints should sit in one sample-complexity class, with remaining gaps coming from implementation rather than inductive bias.',
        },
        boundary: {
          zh: '物理里的规范对称是被实验反复验证的自然事实；深度学习里的等变性是人为施加的设计选择。同一台「不变性引擎」，一边是发现，一边是规定——把后者的成功当作前者的证据是错的。',
          en: 'Gauge symmetry in physics is a repeatedly confirmed fact about nature; equivariance in deep learning is an imposed design choice. Same invariance engine, but one side discovers and the other stipulates — reading the latter’s success as evidence for the former is a category error.',
        },
      },
    ],
  },

  {
    id: 'struct://xfrontier/information-geometry',
    title: { zh: '信息几何与「软方向」', en: 'Information geometry & sloppy directions' },
    statement: {
      zh: '把所有候选模型铺成一个流形，费雪信息就是它上面唯一的不变度规——度规大的方向是已被数据钉死的已知，度规几乎为零的方向就是无知本身所在。',
      en: 'Lay every candidate model out as a manifold and Fisher information is its only invariant metric — directions where the metric is large are pinned down by data, and directions where it nearly vanishes are where ignorance itself lives.',
    },
    status: 'active',
    theme: 'unknown-mapping',
    isomorphism: 'ISO-31',
    provenance: XFRONTIER([662]),
    mappings: [
      {
        slug: 'formal-unknown',
        correspondences: [
          {
            quantity: { zh: '软方向（参数大幅变动而预测几乎不变）', en: 'sloppy directions — parameters move far while predictions barely change' },
            inThisSubstrate: {
              zh: '文献里的结构空洞与蕴含缺口：可以被明确写下、被检索、被计数的「已知的未知」',
              en: 'the structural holes and entailment gaps in the literature — known unknowns that can be written down, retrieved and counted',
            },
          },
          {
            quantity: { zh: '不变度规（Čencov：这是唯一的一个）', en: 'the invariant metric — Čencov’s theorem says there is only one' },
            inThisSubstrate: {
              zh: '未知论要求「未知」的刻画不能依赖于表述方式，否则换一套措辞就能变出新的无知',
              en: 'a formal account of the unknown must not depend on how things are phrased, or a change of wording would manufacture new ignorance',
            },
          },
        ],
        prediction: {
          zh: '若这成立，按「软方向」排序挑选的实验，应比按显著性排序的实验更快压缩模型流形的体积，而不只是提高已知参数的精度。',
          en: 'If it holds, experiments chosen along sloppy directions should shrink the model manifold’s volume faster than significance-ranked experiments, rather than merely sharpening already-pinned parameters.',
        },
        boundary: {
          zh: '费雪几何的软方向是参数空间里的无知，文献结构空洞是命题空间里的无知。两者都可枚举、都可排序，但不是同一个空间——把「参数不敏感」直接读成「科学上不重要」会漏掉全部尚未被参数化的问题。',
          en: 'Fisher-geometric sloppiness is ignorance in parameter space; a structural hole is ignorance in proposition space. Both are enumerable and rankable but they are not the same space — reading parameter-insensitivity as scientific unimportance drops every question not yet parameterised at all.',
        },
      },
      {
        slug: 'physics-constrained-scientific-foundation-models',
        correspondences: [
          {
            quantity: { zh: '模型流形的维度', en: 'the dimension of the model manifold' },
            inThisSubstrate: {
              zh: '把守恒律、边界条件与量纲关系嵌进模型，等于直接切掉流形上一整族方向——不是靠数据把它们钉死，而是宣布它们不存在',
              en: 'embedding conservation laws, boundary conditions and dimensional relations excises whole families of directions from the manifold outright — not pinning them down with data but declaring they do not exist',
            },
          },
          {
            quantity: { zh: '软方向上的自由 = 幻觉的空间', en: 'freedom along sloppy directions is the room hallucination lives in' },
            inThisSubstrate: {
              zh: '纯数据外推之所以能编，正因为在预测几乎不变的方向上参数可以乱走；物理约束把这块空间收紧',
              en: 'pure-data extrapolation can fabricate precisely because parameters may wander where predictions barely change; the physical constraints shrink that room',
            },
          },
        ],
        prediction: {
          zh: '若这成立，加入一条真实守恒律带来的幻觉下降幅度，应与它消去的软方向数量相关，而与该约束在训练损失里的权重无关；一条不消去任何软方向的「约束」应几乎不改善外推。',
          en: 'If it holds, the drop in hallucination from adding a genuine conservation law should track how many sloppy directions it removes rather than its weight in the training loss — and a constraint that removes none should barely improve extrapolation.',
        },
        boundary: {
          zh: '切掉方向和钉死方向不是一回事：物理约束若下错了（用在它不成立的工况上），模型会在一个自信而错误的低维流形上外推，而信息几何看不出这一点——度规只报告敏感度，不报告约束本身对不对。',
          en: 'Excising a direction is not the same as pinning it down: a physical constraint applied outside its regime leaves the model extrapolating confidently on a wrong low-dimensional manifold, and information geometry cannot see this — the metric reports sensitivity, never whether the constraint itself is right.',
        },
      },
    ],
  },

  {
    id: 'struct://xfrontier/optimal-transport',
    title: { zh: '最优传输', en: 'Optimal transport' },
    statement: {
      zh: '把一堆质量以最小总代价搬成另一堆——这个问题既定义了两个分布之间的距离，也定义了从一个变成另一个的那条路径。',
      en: 'Move one pile of mass into another at least total cost — the problem defines both a distance between two distributions and the path that turns one into the other.',
    },
    status: 'active',
    theme: 'living-computation',
    isomorphism: 'ISO-17',
    provenance: XFRONTIER([755]),
    mappings: [
      {
        slug: '3d-synthesizable-co-generation-joint',
        correspondences: [
          {
            quantity: { zh: '把噪声分布搬到数据分布的那条最省路径', en: 'the least-cost path carrying a noise distribution onto a data distribution' },
            inThisSubstrate: {
              zh: '流匹配所学的那个速度场——SynCoGen 用它把三维原子坐标从噪声推到可合成分子的分布上',
              en: 'the velocity field flow matching learns — SynCoGen uses it to push 3D atomic coordinates from noise onto the distribution of synthesisable molecules',
            },
          },
          {
            quantity: { zh: '联合分布的耦合（而非两个边缘各自搬）', en: 'a coupling of the joint distribution rather than two marginals moved separately' },
            inThisSubstrate: {
              zh: '反应图与三维坐标被联合采样，而不是先生成结构再事后过滤合成可行性',
              en: 'the reaction graph and the 3D coordinates are sampled jointly, instead of generating structure first and filtering for synthesisability afterwards',
            },
          },
        ],
        prediction: {
          zh: '若这成立，联合采样相对「先生成后过滤」的优势，应随两个边缘之间的相关性上升而扩大；在二者近乎独立的分子族上，优势应消失。',
          en: 'If it holds, the advantage of joint sampling over generate-then-filter should widen as the two marginals become more correlated, and vanish on molecular families where they are nearly independent.',
        },
        boundary: {
          zh: '流匹配用的是条件最优传输路径，不是真正的全局最优传输解——训练目标是可处理的近似。此外分子的「代价」由化学可行性定义，不是欧氏距离，因此 Wasserstein 的几何直觉在这里只能当向导，不能当保证。',
          en: 'Flow matching uses conditional optimal-transport paths, not a true global OT solution — the objective is a tractable surrogate. And the cost between molecules is defined by chemical feasibility, not Euclidean distance, so Wasserstein geometry serves as a guide here rather than a guarantee.',
        },
      },
      {
        slug: 'retrosynthesis-in-the-loop-direct-optimization-synthesizability',
        correspondences: [
          {
            quantity: { zh: '搬运的代价函数', en: 'the cost function the transport pays' },
            inThisSubstrate: {
              zh: 'Saturn 把逆合成模型当活 oracle 接进回路,于是「代价」不再是隐空间距离,而是一条真实合成路线存不存在',
              en: 'Saturn wires a retrosynthesis model in as a live oracle, so cost stops being latent-space distance and becomes whether a real synthetic route exists',
            },
          },
          {
            quantity: { zh: '把约束写进路径，而不是事后筛', en: 'putting the constraint into the path rather than filtering afterwards' },
            inThisSubstrate: {
              zh: '合成可行性变成生成的直接优化目标——分布被搬到「可合成」那一侧,而不是先搬完再丢掉不合格的',
              en: 'synthesisability becomes a direct optimisation target, so the distribution is transported onto the synthesisable side instead of being transported first and pruned after',
            },
          },
        ],
        prediction: {
          zh: '若这成立，在严苛算力预算下,回路内优化相对「先生成后过滤」的优势应随过滤淘汰率上升而扩大;若淘汰率很低,两者应趋于无差别。',
          en: 'If it holds, under a tight compute budget the advantage of in-loop optimisation over generate-then-filter should widen as the filter’s rejection rate rises, and the two should converge where rejection is rare.',
        },
        boundary: {
          zh: '最优传输要求代价函数是一个度量;「有没有合成路线」是 oracle 给的二值判断,既不对称也不满足三角不等式。这里借的是「把约束写进搬运路径」这个想法,不是 Wasserstein 的任何定理——而且 oracle 本身会错,优化会去利用它的错。',
          en: 'Optimal transport wants a metric cost; whether a synthetic route exists is a binary oracle verdict, neither symmetric nor obeying the triangle inequality. What is borrowed is the idea of writing the constraint into the transport path, not any Wasserstein theorem — and the oracle itself errs, which the optimiser will exploit.',
        },
      },
    ],
  },

  // ── 纯前沿：结构成立，但当前语料里没有任何一座岛真的体现它 ────────────────
  // 照 标度 的先例保留为零映射。虚线场本身就是内容：这四条恰好都住在工程控制、
  // 应用扩散与序贯决策一带，也正是当前 78 岛系统性缺席的方向。

  {
    id: 'struct://xfrontier/laplace-equation',
    title: { zh: '拉普拉斯方程', en: 'Laplace’s equation' },
    statement: {
      zh: '静电场、稳态热流、无旋流动、稳态扩散服从同一个 ∇²φ = 0——解决其中一个，就等于解决了全部。',
      en: 'Electrostatics, steady heat flow, irrotational flow and steady-state diffusion all obey one ∇²φ = 0 — solve one and you have solved them all.',
    },
    status: 'proposed',
    theme: 'simulation-twins',
    isomorphism: 'ISO-01',
    provenance: XFRONTIER([]),
    mappings: [],
  },

  {
    id: 'struct://xfrontier/diffusion-equation',
    title: { zh: '扩散与热方程', en: 'The diffusion / heat equation' },
    statement: {
      zh: '大量独立的随机步累积起来，宏观上表现为同一条 ∂u/∂t = D∇²u——热传导、布朗运动、期权定价与神经电缆共用一个方程。',
      en: 'Many independent random steps accumulate into one macroscopic ∂u/∂t = D∇²u — heat conduction, Brownian motion, option pricing and the neural cable share a single equation.',
    },
    status: 'proposed',
    theme: 'simulation-twins',
    isomorphism: 'ISO-02',
    provenance: XFRONTIER([]),
    mappings: [],
  },

  {
    id: 'struct://xfrontier/negative-feedback-control',
    title: { zh: '负反馈控制', en: 'Negative-feedback control' },
    statement: {
      zh: '把输出与目标之差反向送回输入，系统就能在扰动下守住设定点——生理稳态、气候反馈、自驱实验室闭环与电网调频共用同一个回路。',
      en: 'Feed the output-minus-target difference back with reversed sign and a system holds its setpoint under disturbance — physiological homeostasis, climate feedback, the self-driving-lab loop and grid frequency control share one circuit.',
    },
    status: 'active',
    theme: 'simulation-twins',
    isomorphism: 'ISO-14',
    provenance: XFRONTIER([213]),
    mappings: [
      {
        slug: 'solar-radiation-management-modeling-governance',
        correspondences: [
          {
            quantity: { zh: '设定点与被压制的误差', en: 'the setpoint and the error being suppressed' },
            inThisSubstrate: {
              zh: '平流层气溶胶把全球温度按住在一个目标值上，而驱动升温的温室气体浓度并没有被处理——误差被压制，不是被消除',
              en: 'stratospheric aerosol holds global temperature at a target while the greenhouse forcing driving it is untouched — the error is suppressed, not removed',
            },
          },
          {
            quantity: { zh: '断开回路会发生什么', en: 'what happens when the loop is opened' },
            inThisSubstrate: {
              zh: '终止冲击：一旦停止注入，被压抑的升温会以远快于自然速率的方式反弹——这正是一个长期压制大误差的负反馈回路被切断时的标准行为',
              en: 'termination shock: stop injecting and the suppressed warming rebounds far faster than the natural rate — textbook behaviour for cutting a negative-feedback loop that has long been masking a large error',
            },
          },
        ],
        prediction: {
          zh: '若这成立，终止冲击的反弹速率应主要由「累积被压制的误差」决定，而与部署时长本身无关；两次等长但基线不同的部署，其反弹速率应显著不同。',
          en: 'If it holds, the rebound rate after termination should be set mainly by accumulated suppressed forcing rather than by deployment duration itself — two equally long deployments on different baselines should rebound at markedly different rates.',
        },
        boundary: {
          zh: '控制论的保证建立在「可以对被控对象做阶跃响应实验」之上。地球系统只有一个、不能做对照实验，模型本身就是被质疑的对象——所以这里最大的风险是治理而非技术：借来的是回路结构，借不来的是可辨识性。',
          en: 'Control-theoretic guarantees rest on being able to run step-response tests on the plant. There is one Earth, no control run, and the model is itself what is in dispute — which is why the dominant risk here is governance rather than technology. The loop structure transfers; identifiability does not.',
        },
      },
    ],
  },

  {
    id: 'struct://xfrontier/renormalization-group',
    title: { zh: '重整化群与普适类', en: 'The renormalization group & universality' },
    statement: {
      zh: '在临界点附近，微观细节被逐级粗粒化冲掉，只剩下少数几个指数——不同的系统因此落进同一个普适类，可以互相替对方作预报。',
      en: 'Near a critical point, successive coarse-graining washes out microscopic detail and only a handful of exponents survive — so unlike systems fall into one universality class and can forecast for one another.',
    },
    status: 'active',
    theme: 'simulation-twins',
    isomorphism: 'ISO-04',
    provenance: XFRONTIER([1185]),
    mappings: [
      {
        slug: 'generic-early-warning-signals-for',
        correspondences: [
          {
            quantity: { zh: '普适性（微观细节不重要）', en: 'universality — microscopic detail does not matter' },
            inThisSubstrate: {
              zh: '临界慢化这一前兆横跨气候、生态与人类系统都成立，正因为临近分岔时只剩正规形起作用',
              en: 'critical slowing down holds across climate, ecology and human systems precisely because only the normal form survives close to a bifurcation',
            },
          },
          {
            quantity: { zh: '标度指数（普适类的指纹）', en: 'scaling exponents — a universality class’s fingerprint' },
            inThisSubstrate: {
              zh: '在正规形标度律上训练的探测器能对从未见过的系统给出预警——普适类在这里不是解释，而是被直接当作可迁移的工程资产',
              en: 'detectors trained on normal-form scaling laws warn about systems they have never seen — the universality class is used not as an explanation but as a directly transferable engineering asset',
            },
          },
        ],
        prediction: {
          zh: '若这成立，探测器在新系统上的表现应由该系统的分岔类型决定，而非由它的学科归属决定：同属折叠分岔的气候与生态系统，误报率应比同属气候但分岔类型不同的两个系统更接近。',
          en: 'If it holds, detector performance on a new system should be set by its bifurcation type rather than its discipline: a climate and an ecological system sharing a fold bifurcation should have closer false-alarm rates than two climate systems with different bifurcation types.',
        },
        boundary: {
          zh: '普适性只在临界点的邻域内成立，而邻域有多大本身不由理论给出。更要紧的是：这套前兆对「缓慢逼近的分岔」有效，对速率诱导临界与外部冲击型突变无效——把普适预警当成通用崩溃探测器，恰恰会在最需要它的那类事件上失灵。',
          en: 'Universality holds only in a neighbourhood of the critical point, and how wide that neighbourhood is is not something the theory supplies. More sharply: these precursors work for slowly approached bifurcations and fail for rate-induced tipping and shock-driven transitions — treating them as a general collapse detector fails exactly on the events that matter most.',
        },
      },
    ],
  },

  {
    id: 'struct://xfrontier/optimal-stopping',
    title: { zh: '最优停止', en: 'Optimal stopping' },
    statement: {
      zh: '在只能前进不能回头的序列里，先观察并放弃前 n/e 个、再选第一个超过历史最优者——「什么时候停」有一个与领域无关的答案。',
      en: 'In a sequence you can only move forward through, observe and reject the first n/e, then take the first that beats every one seen — when to stop has a domain-independent answer.',
    },
    status: 'proposed',
    theme: 'unknown-mapping',
    isomorphism: 'ISO-21',
    provenance: XFRONTIER([]),
    mappings: [],
  },

  {
    id: 'struct://xfrontier/reaction-diffusion',
    title: { zh: '反应扩散与图灵斑图', en: 'Reaction–diffusion & Turing patterns' },
    statement: {
      zh: '一个会自我增强的反应加上一个扩散更快的抑制者，就足以让均匀状态自发失稳成条纹与斑点——「形态」也许不需要蓝图，只需要正确的不稳定性。',
      en: 'A self-reinforcing reaction plus a faster-diffusing inhibitor is enough to destabilise uniformity into stripes and spots — form may need no blueprint, only the right instability.',
    },
    status: 'proposed',
    theme: 'collective-dynamics',
    isomorphism: 'ISO-11',
    provenance: XFRONTIER([]),
    mappings: [],
  },

  {
    id: 'struct://xfrontier/extreme-value-theory',
    title: { zh: '极值理论', en: 'Extreme value theory' },
    statement: {
      zh: '中心极限定理管平均值，极值定理管最大值：无论原始分布如何，一大批独立样本的极大值归一化后只能落进三种分布之一——「最坏情况」有普适的数学结构。',
      en: 'The central limit theorem governs averages; the extreme-value theorem governs maxima — whatever the underlying distribution, normalised maxima of many independent samples can only land in one of three families. The worst case has universal mathematical structure.',
    },
    status: 'proposed',
    theme: 'unknown-mapping',
    isomorphism: 'ISO-26',
    provenance: XFRONTIER([]),
    mappings: [],
  },

  {
    id: 'struct://xfrontier/anomalous-diffusion',
    title: { zh: '反常扩散与莱维飞行', en: 'Anomalous diffusion & Lévy flights' },
    statement: {
      zh: '普通扩散只是特例：当步长或等待时间是重尾的，位移的增长就偏离线性，需要分数阶微积分来描述——「随机游走」远不止一种。',
      en: 'Ordinary diffusion is only a special case: with heavy-tailed step lengths or waiting times, displacement stops growing linearly and needs fractional calculus to describe — there is far more than one kind of random walk.',
    },
    status: 'proposed',
    theme: 'collective-dynamics',
    isomorphism: 'ISO-27',
    provenance: XFRONTIER([]),
    mappings: [],
  },

  {
    id: 'struct://xfrontier/bayesian-surprise',
    title: { zh: '好奇心作为信息增益', en: 'Curiosity as information gain' },
    statement: {
      zh: '「什么值得探索」可以被写成一个量：后验与先验之间的 KL 散度。同一个 D_KL 既是人类注意力最强的吸引子，也可以直接当作「下一个实验做什么」的判据。',
      en: 'What is worth exploring can be written as one quantity — the KL divergence between posterior and prior. The same D_KL is both the strongest attractor of human attention and a usable criterion for which experiment to run next.',
    },
    status: 'proposed',
    theme: 'unknown-mapping',
    isomorphism: 'ISO-33',
    provenance: XFRONTIER([]),
    mappings: [],
  },
];

for (const patch of WAVE_2_STRUCTURE_PATCHES) {
  const structure = SEED_STRUCTURES.find((candidate) => candidate.id === patch.structureId);
  if (!structure) {
    throw new Error(`Wave 2 structure patch target does not exist: ${patch.structureId}`);
  }
  structure.mappings.push(...patch.mappings);
  if (patch.mappings.length > 0) {
    structure.status = 'active';
  }
}

SEED_STRUCTURES.push(...WAVE_2_STRUCTURES);

/**
 * Wave 4 carries no patches: every structure it adds arrives with zero mappings
 * and stays `proposed`. Its candidate edges live in `STRUCTURE_PROPOSALS`, which
 * nothing in this module reads — a proposal is not an edge, and must not become
 * one by being imported next to the mappings.
 */
SEED_STRUCTURES.push(...WAVE_4_STRUCTURES);

/**
 * Waves 5 through 8 on the same terms as wave 4: zero mappings, `proposed`, no
 * edge. Together with wave 4 they work the 100-topic set through to the end —
 * 17 of the 100 duplicated a structure already here and were dropped, and the
 * remaining 83 are these five waves.
 *
 * The catalogue grows; coverage does not. Every structure below is a pure
 * frontier until a curator authors a mapping onto it, and the wave-5 test
 * asserts the mapping total directly so that cannot drift unnoticed.
 */
SEED_STRUCTURES.push(...WAVE_5_STRUCTURES);
SEED_STRUCTURES.push(...WAVE_6_STRUCTURES);
SEED_STRUCTURES.push(...WAVE_7_STRUCTURES);
SEED_STRUCTURES.push(...WAVE_8_STRUCTURES);

/**
 * Wave 3 adds substrate to skeletons that already exist — all 36 corpus
 * isomorphisms were claimed before it, so it patches rather than names. Applied
 * after the wave-2 push so a patch may target a wave-2 structure too, and
 * before the depth loop because a mapping is graph truth while depth is not:
 * if the two ever disagreed about a structure, the mapping is the one a curator
 * authored.
 */
for (const patch of WAVE_3_STRUCTURE_PATCHES) {
  const structure = SEED_STRUCTURES.find((candidate) => candidate.id === patch.structureId);
  if (!structure) {
    throw new Error(`Wave 3 structure patch target does not exist: ${patch.structureId}`);
  }
  structure.mappings.push(...patch.mappings);
  if (patch.mappings.length > 0) {
    structure.status = 'active';
  }
}

/**
 * Depth patches: content a structure owns without any island.
 *
 * These run last so they can reach a structure from any wave. A patch may add
 * `quantities` only where the structure had none — declaring a structure's own
 * abstract variables is textbook authoring, whereas overwriting a list it
 * already carries would silently rewrite what a curator wrote, so that throws.
 */
for (const patch of [...CRITICAL_FAMILY_DEPTH, ...INFERENCE_FAMILY_DEPTH, ...COLLECTIVE_FAMILY_DEPTH, ...LOCKIN_FAMILY_DEPTH, ...METHOD_FAMILY_DEPTH, ...INFORMATION_FAMILY_DEPTH, ...LIMITS_FAMILY_DEPTH]) {
  const structure = SEED_STRUCTURES.find((candidate) => candidate.id === patch.structureId);
  if (!structure) {
    throw new Error(`Depth patch target does not exist: ${patch.structureId}`);
  }
  if (patch.quantities) {
    if (structure.quantities && structure.quantities.length > 0) {
      throw new Error(`Depth patch would overwrite authored quantities on ${patch.structureId}`);
    }
    structure.quantities = patch.quantities;
  }
  if (structure.depth) {
    throw new Error(`Depth already set on ${patch.structureId}`);
  }
  structure.depth = patch.depth;
}

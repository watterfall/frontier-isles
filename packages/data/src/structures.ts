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
}

export interface SeedStructure {
  /** `struct://<org>/<slug>`. */
  id: string;
  title: { zh: string; en: string };
  /** The regularity in one sentence (NOT a discipline label — §五). */
  statement: { zh: string; en: string };
  status: 'proposed' | 'active';
  /** xfrontier isomorphisms.json provenance (trust is visible, §6). */
  isomorphism: string;
  mappings: StructureMapping[];
}

export const SEED_STRUCTURES: SeedStructure[] = [
  {
    id: 'struct://xfrontier/synchronization',
    title: { zh: '耦合振子同步', en: 'Coupled-oscillator synchronization' },
    statement: {
      zh: '大量弱耦合的单元遵循局部规则,在耦合强度越过临界值后自发协同到一个集体状态。',
      en: 'Many weakly coupled units following local rules spontaneously lock into a collective state once coupling exceeds a critical strength.',
    },
    status: 'active',
    isomorphism: 'ISO-10',
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
    isomorphism: 'ISO-06',
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
    isomorphism: 'ISO-29',
    mappings: [],
  },
];
